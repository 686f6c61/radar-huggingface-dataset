# billytesterman/secjev-encoder

## Resumen

secjev-encoder es un encoder de clasificación de código especializado en detección de vulnerabilidades. Se trata de un ajuste fino del modelo LiquidAI/LFM2.5-Encoder-350M publicado por el usuario billytesterman, que responde de forma simultánea a las 25 preguntas del CWE Top 25 sobre una ventana de hasta 240 líneas de código fuente. En una sola pasada forward, el modelo devuelve P(yes) para cada una de las 25 preguntas; por ejemplo, "Is a SQL query built here by concatenating or interpolating data, rather than by binding parameters?" (cwe_89). Cubre 28 lenguajes de programación, desde C y Go hasta PHP y Solidity.

La arquitectura combina el encoder bidireccional LFM2.5 con un mecanismo de attention pooling, uno por pregunta, seguido de una cabeza lineal y una sigmoide calibrada por temperatura (T = 1.6356). El repositorio incluye pesos en safetensors (PyTorch) y grafos ONNX en fp32 e int8, lo que permite ejecución en CPU, CUDA y navegador mediante WebGPU o WebAssembly.

Su relevancia radica en que no es un generador de texto, sino una herramienta de triaje de bajo coste: un modelo de ~350 M de parámetros que cabe en cualquier GPU de consumo e incluso en CPU, y que ordena dónde mirar primero dentro de un fichero. El autor lo describe explícitamente como una ayuda al triaje que no demuestra que exista un fallo. El repositorio es muy reciente (creado y actualizado el 2026-10-07) y acumula 0 descargas y 0 likes, por lo que no cuenta con validación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional LFM2.5 (base: LiquidAI/LFM2.5-Encoder-350M) con attention pooling por pregunta y cabeza lineal de 25 salidas |
| Parametros totales | ~350 M en el encoder, segun el nombre del modelo base, mas la cabeza de clasificacion; cifra exacta no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens de entrada (input_ids int64, BOS primero, sin padding); ventana de hasta 240 lineas de codigo |
| Tipos de cuantizacion | fp32 (ONNX), int8 en bloques de 32 con matematicas fp32 (q8), bf16 (entrenamiento y pesos PyTorch) |
| Idiomas soportados | 28 lenguajes de programacion; idiomas naturales no disponibles (los 25 enunciados estan en ingles) |
| Licencia | lfm1.0 (LFM Open License v1.0, etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors (PyTorch), ONNX (fp32 e int8) |
| Tamano del repositorio | 3,4 GB |
| Pipeline | text-classification |
| Fecha de creacion | 2026-10-07 |

## Arquitectura y entrenamiento

El modelo parte de un encoder bidireccional de la familia LFM2.5 de Liquid AI. Sobre la representacion del encoder se anade un mecanismo de attention pooling en el que cada una de las 25 preguntas aprende su propia ponderacion de los tokens de la ventana; la salida de cada pool pasa por una capa lineal y una sigmoide con temperatura fija. El flujo descrito por el autor es: texto de la ventana → encoder bidireccional LFM2.5 → attention pooling (uno por pregunta) → lineal → sigmoid(logit / T). No se detalla en la informacion disponible si el encoder conserva el esquema hibrido (convoluciones y atencion) caracteristico de otros modelos LFM2. El modelo consume input_ids de forma [1, n] con n <= 8192, BOS primero y sin padding, y devuelve logits de forma [1, 25]; P(yes) se calcula como sigmoid(logit / temperatura) con T = 1.6356.

El entrenamiento usa exclusivamente etiquetas reales, sin anotaciones generadas por LLM. Los positivos son la ventana previa a un fix de CVE/GHSA, etiquetada segun las preguntas que nombra el aviso; el mismo punto despues del fix actua como negativo emparejado, y el resto de preguntas de las ventanas de fix se enmascaran. Las ventanas procedentes de un barrido de codigo abierto ordinario son negativas en todas las preguntas con peso 0,25. Se anade una pair loss: dentro de cada fix, la ventana anterior debe puntuar por encima de la posterior, mediante una perdida logistica sobre la diferencia, lo que segun el autor hizo que el modelo aprendiera el fallo en si en lugar de "codigo que suele recibir fixes". La cabeza se entrena con learning rate 5e-4 y el encoder con 3e-5, en bf16 y hasta 8192 tokens. El checkpoint se selecciono por AUROC sobre las ventanas de validacion de fixes. El dataset (la parte con licencia permisiva de secjev) contiene 52.673 ventanas de fix y 200.000 ventanas ordinarias, y cada ventana de fix se ve dos veces por epoca.

## Capacidades

- Clasificación multi-etiqueta de código: un único forward pass devuelve P(yes) para las 25 preguntas del CWE Top 25 sobre una ventana de hasta 240 líneas.
- Detección orientada a patrones concretos de CWE, incluyendo inyección SQL por concatenación o interpolación (cwe_89) y otras preguntas del listado Top 25.
- Cobertura de 28 lenguajes de programación, desde C y Go hasta PHP y Solidity.
- Filtrado por lenguaje: el fichero `bundle.json` incluye un mapa de límites que restringe ciertas preguntas; por ejemplo, las de memory safety solo se plantean a C y C++.
- Salida probabilística calibrada mediante temperatura (T = 1.6356), apta para priorizar por umbral.
- Ejecución en navegador: los grafos int8 funcionan con WebGPU a través de `onnxruntime-web/webgpu` (que ejecuta MatMulNBits de 8 bits) y con el grafo alternativo `model_q8_wasm.onnx` sobre WebAssembly cuando no hay WebGPU.
- No genera texto, no soporta tool calling ni function calling, y no implementa agentes ni razonamiento multi-paso. Es un clasificador de ventana única.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Triaje de revisiones de codigo en pull requests: el modelo puntua cada ventana de 240 lineas del diff y ordena por probabilidad, de modo que el revisor humano empieza por los fragmentos con mayor P(yes) en lugar de leer el fichero completo.
- Puerta de seguridad ligera en CI/CD: al ser un ONNX int8 de 593 MB que corre en CPU, puede integrarse como paso previo a un SAST completo, marcando ficheros sospechosos antes de lanzar analisis mas costosos.
- Priorizacion de alertas de un SAST existente: las ventanas ya señaladas por el escaner se reordenan segun la probabilidad del modelo, lo que ayuda a reducir el ruido de falsos positivos en colas de triaje grandes.
- Auditoria de dependencias de terceros: al cubrir C, C++, Go, PHP y Solidity entre otros, permite pasar el modelo sobre codigo vendorizado antes de aceptarlo en el repositorio.
- Analisis en el navegador con requisitos de privacidad: el grafo int8 para WebGPU/WASM permite puntuar codigo sin enviarlo a un servidor, util en entornos con restricciones de salida de datos.
- Revision de contratos inteligentes en Solidity: el modelo soporta ese lenguaje y puede señalarse como ventana previa a una auditoria manual o a una herramienta especifica de EVM.
- Analisis post-incidente: comparar la ventana antes y despues de un fix conocido, usando la pair loss como criterio cualitativo para localizar la zona que cambio el parche.
- Formacion de desarrolladores: las 25 preguntas del bundle actuan como checklist explicita de patrones CWE, aprovechable en talleres de codigo seguro o en revisiones guiadas.

## Benchmarks y rendimiento

Datos de validacion del propio repositorio (fichero `onnx/validate-validation.json`). El split de validacion consta de 3.060 ventanas de fix mas 10.000 ventanas ordinarias, con 209.900 puntuaciones (ventana, pregunta) en total.

| Metrica | PyTorch bf16 | model.onnx (fp32) | model_q8.onnx | model_q8_wasm.onnx |
|---|---|---|---|---|
| AUROC (before vs after fix) | 0.5830 | 0.5832 | 0.5830 | 0.5830 |
| pre_above_post | 0.6560 | 0.6680 | 0.6691 | 0.6674 |
| before fix vs ordinary | 0.9369 | 0.9368 | 0.9370 | 0.9370 |
| fixed vs ordinary | 0.8996 | 0.8994 | 0.8999 | 0.8999 |
| ordinary flagged (p >= 0.5) | 0,75 % | 0,75 % | 0,76 % | 0,76 % |

Interpretacion aportada por el autor: la columna "before fix vs ordinary" (en torno a 0,94) indica que el modelo separa bien codigo que despues necesito un fix de seguridad frente a codigo ordinario; las columnas "auroc" y "pre_above_post" muestran que la separacion entre la version vulnerable y su propia version corregida, a menudo con pocas lineas de diferencia, es modesta; y "fixed vs ordinary" (0,90) sugiere que buena parte de la señal es "este es el tipo de codigo (comentario truncado en la informacion disponible)". No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras suites estandar, que por otra parte no aplican a un clasificador de este tipo.

## Requisitos de hardware

- Pesos fp32 (ONNX o safetensors): 1,4 GB. Estimacion de VRAM/RAM en inferencia: en torno a 1,5-1,8 GB.
- Pesos int8 (q8): 593 MB, compartidos por `model_q8.onnx` y `model_q8_wasm.onnx` (hay que descargar `model_q8.weights` junto al grafo). Estimacion de VRAM/RAM: en torno a 0,7-1,0 GB.
- GPU recomendadas: no se indican modelos concretos en la informacion disponible. Por tamano, el modelo cabe en practicamente cualquier GPU de consumo (incluidas integradas), asi como en CPU.
- Cabe en GPU de consumo: si, en todas las gamas por el tamano indicado. Tambien funciona con CPUExecutionProvider de ONNX Runtime y en navegador con WebGPU o WebAssembly.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA), `onnxruntime-web/webgpu` para WebGPU y `onnxruntime-web` sobre WebAssembly (el modo multihilo de WASM requiere cabeceras COOP/COEP). vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo generativo.
- Restriccion de batching: los grafos usan MultiHeadAttention de ONNX Runtime sin mascara de padding, por lo que hay que puntuar las ventanas de una en una. El autor indica que procesar por lotes una ventana de 8192 tokens construiria una matriz de puntuaciones de 4,3 GB.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de modelos alternativos de deteccion de vulnerabilidades, por lo que la comparativa se limita al modelo base.

| Modelo | Parametros | Contexto | Tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| secjev-encoder | ~350 M (cifra exacta no disponible) | 8192 tokens de entrada / 240 lineas | Clasificacion de 25 preguntas CWE Top 25 | AUROC 0.937 before-fix vs ordinary; 0.583 before vs after fix | lfm1.0 | HuggingFace, safetensors y ONNX (fp32 e int8), WebGPU/WASM |
| LiquidAI/LFM2.5-Encoder-350M (modelo base) | 350 M | no disponible | Encoder bidireccional generico | no disponible | no disponible | HuggingFace |
| Alternativas de deteccion de vulnerabilidades basadas en LLM | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Herramienta de triaje, no de prueba: el propio autor indica que el modelo no demuestra que un fallo exista, solo ordena donde mirar primero.
- Separacion modesta entre version vulnerable y corregida: AUROC de 0,5830 y pre_above_post de 0,656 en el split de validacion, sobre cambios que a menudo son de pocas lineas.
- Sesgo hacia "codigo que suele recibir fixes": la columna fixed vs ordinary (0,90) apunta a que buena parte de la señal corresponde al tipo de codigo mas que al defecto concreto.
- Cobertura limitada a 25 preguntas fijas (CWE Top 25). Las vulnerabilidades fuera de esa lista no se detectan por definicion.
- Filtrado por lenguaje: las preguntas de memory safety solo se formulan a C y C++; aplicar el modelo a un lenguaje no previsto para una pregunta concreta no es valido.
- Ventana maxima de 240 lineas: no captura dependencias entre ficheros, flujos de datos entre modulos ni contexto de mas de una ventana salvo que se tengan manualmente.
- Formato de entrada obligatorio: cabecera con ruta y rango de lineas, numeracion, corte de lineas a 400 caracteres y tiles de 240 lineas (los tiles de mas de 33.084 caracteres se dividen por la mitad). Desviarse de este formato degrada el resultado.
- Sin mascara de padding: obliga a puntuar una ventana por forward pass y limita el throughput en produccion.
- Falsos positivos: un 0,75-0,76 % de las ventanas ordinarias se marca con p >= 0,5, segun la validacion del autor. Conviene fijar el umbral en funcion del coste de revision.
- Idiomas naturales: no disponibles. Los 25 enunciados y las etiquetas estan en ingles; el modelo no es multilingue en texto natural.
- Sin validacion independiente: el repositorio tiene 0 descargas y 0 likes, y no se han encontrado evaluaciones de terceros.
- Licencia lfm1.0 (LFM Open License v1.0): es una licencia propia de Liquid AI etiquetada como "other", no una licencia OSI. Hay que revisar el fichero LICENSE antes de cualquier uso comercial.
- Entrenado sobre la parte con licencia permisiva del dataset secjev; el rendimiento fuera de esa distribucion (lenguajes, estilos o dominios poco representados) no esta caracterizado.
- Riesgo de alucinacion en el sentido de falsos positivos plausibles: al devolver una probabilidad por pregunta sin justificacion textual, el revisor no recibe evidencia de por que se activo la etiqueta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/billytesterman/secjev-encoder
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M
- Licencia del modelo (fichero LICENSE del repositorio): https://huggingface.co/billytesterman/secjev-encoder/blob/main/LICENSE
- Listado CWE Top 25 (referencia de las 25 preguntas): https://cwe.mitre.org/top25/

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los resultados obtenidos corresponden a sitios no relacionados (comercio de calzado y una localidad francesa), por lo que no se incluyen. No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
