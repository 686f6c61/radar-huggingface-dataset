# Mihai-LeanZero/Qwen3.8-Flash-Next-oQ4e-DWQ-LeanZero

## Resumen

Qwen3.8-Flash-Next-oQ4e-DWQ-LeanZero es una compilacion cuantizada a 4 bits en formato MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario Mihai-LeanZero (LeanZero) para su ejecucion en Macs con Apple Silicon. El modelo base es un transformer multimodal de tipo image-text-to-text con 179.999.981.459 parametros totales, que incluye un encoder de vision, un cabezal de prediccion multi-token (MTP) y una tabla de embeddings n-gram de 51B parametros.

La particularidad de esta version frente a la compilacion previa del mismo autor (oQ4e) es la aplicacion de destilacion de pesos cuantizados (DWQ, distilled weight quantization): se reentrenaron las escalas y sesgos de los expertos enrutados en 35 de las 48 capas del decodificador, usando los pesos BF16 originales de Qwen como profesor. El resto de tensores (codigos de 4 bits, atencion, expertos compartidos, router, tabla n-gram, cabezal MTP y encoder de vision) se mantiene identico byte a byte a la compilacion oQ4e.

El resultado es un artefacto de 100,275 GiB (107,67 GB) en disco que cabe en un unico Mac de 128 GB. Su relevancia radica en que demuestra que es posible reducir la divergencia KL respecto al modelo BF16 original sin cambiar el layout de cuantizacion, lo que abarata el despliegue de un modelo de gran tamano en hardware de consumo de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con decodificador de 48 capas, expertos enrutados y compartidos, mezcladores de hiper-conexion, encoder de vision, cabezal MTP y tabla de embeddings n-gram |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible (el modelo base incluye expertos enrutados, pero no se especifica el numero de parametros activos) |
| Longitud de contexto | 524.288 tokens en la configuracion de prueba (factor YaRN 4); no se especifica el contexto nativo sin YaRN |
| Tipos de cuantizacion | 4 bits (receta oQ4e de oMLX), con escalas y sesgos de expertos enrutados reentrenados por DWQ |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (21 shards), libreria MLX |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer multimodal con decodificador de 48 capas que combina expertos enrutados y compartidos, mezcladores de hiper-conexion (hyper-connection mixers), un encoder de vision, un cabezal de prediccion multi-token (MTP) y una tabla de embeddings n-gram de 51B parametros. La compilacion aqui descrita conserva todos esos componentes; la cuantizacion a 4 bits sigue la receta oQ4e de oMLX y se aplico originalmente sobre los pesos BF16 oficiales de Qwen en la revision `de4b8e4d43b917e7706784d8bb445c9af86a3540`.

El proceso DWQ consistio en reentrenar unicamente las escalas y sesgos de los expertos enrutados (proyecciones gate, up y down de 4 bits) en 35 de las 48 capas del decodificador. En las 13 capas restantes (31, 32, 33, 36, 37 y 39 a 46) el entrenamiento no supero al redondeo original en datos de validacion, por lo que se conservaron los tensores oQ4e sin cambios. Cada capa se entreno contra la salida de la misma capa en BF16, sobre las cuatro corrientes de hiper-conexion y con todo lo anterior a los expertos congelado. Los ajustes fueron: optimizador Adam, tasa de aprendizaje 1e-5, 3 epocas, copias maestras en fp32 y 384 secuencias de calibracion de 1.024 tokens. Las capas 0 a 17 tomaron su entrada del modelo cuantizado y las capas 18 a 47 del profesor BF16.

Los datos de calibracion son todos publicos: transcripciones de codificacion agentica con llamadas a herramientas (nebius/SWE-agent-trajectories, CC-BY-4.0), uso de herramientas (glaiveai/glaive-function-calling-v2, Apache-2.0), el conjunto de calibracion de codigo y multilingue de oMLX (Apache-2.0) y texto general (HuggingFaceFW/fineweb-edu, ODC-By), renderizados con la plantilla de chat del propio modelo. No se realizo fine-tuning sobre salidas, ni merging, ni se incorporo ningun otro modelo. La comparacion byte a byte de los 21 shards confirmo cabeceras identicas, 208 tensores de escala y sesgo modificados y ninguna otra diferencia.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-Flash-Next.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con encoder de vision integrado y preprocesadores de imagen y video incluidos.
- Prediccion multi-token (MTP) con 2 tokens de borrador en la configuracion probada, orientada a decodificacion especulativa.
- Uso de tabla de embeddings n-gram de 51B parametros, con opcion de mantenerse en disco durante la inferencia.
- Soporte de llamadas a herramientas y texto de tipo tool-call: parte del entrenamiento DWQ se calibro especificamente con transcripciones agenticas y de function calling.
- Contexto largo de hasta 524.288 tokens con factor YaRN 4 en la configuracion de prueba.
- Capacidades multilingues: no disponibles como dato explicito, aunque el conjunto de calibracion de oMLX incluye material multilingue.
- Modo de pensamiento (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de escritorio con llamadas a herramientas: el modelo se probo con el motor MLX de Elzi, la aplicacion de agente de escritorio de LeanZero, lo que lo hace adecuado para flujos agenticos locales en Mac con soporte de tool calling calibrado especificamente.
- Asistencia de codificacion agentica: las transcripciones de SWE-agent usadas en la calibracion acercan el comportamiento del modelo a trayectorias de resolucion de incidencias con herramientas, util para entornos de desarrollo integrados que ejecutan comandos y editan ficheros.
- Procesamiento de documentos con imagen y texto: al conservar el encoder de vision y los preprocesadores de imagen y video, puede emplearse para extraer informacion de capturas, diagramas o documentos escaneados en un flujo multimodal local.
- Analisis de repositorios y contexto largo: con 524.288 tokens de contexto (YaRN 4), permite cargar grandes volumenes de codigo o documentacion en una sola ventana para tareas de revision o resumen.
- Despliegue local en estaciones de trabajo Apple: al ocupar 100,275 GiB y caber en un Mac de 128 GB, sirve para prototipado y uso personal sin depender de servicios en la nube.
- Evaluacion de tecnicas de cuantizacion: el manifest `own_convert_manifest.json` incluye ajustes de entrenamiento, sha256 de los datos de calibracion y resultados de validacion, lo que lo convierte en un artefacto util para reproducir y auditar experimentos de DWQ.
- Sustitucion de la compilacion oQ4e en pipelines existentes: al compartir layout de 4 bits y codigos identicos, puede intercambiarse por la version anterior sin cambios en el codigo de carga, obteniendo menor divergencia KL en texto de tool-call.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad respecto al modelo BF16 original, medidas sobre 64 secuencias de 1.024 tokens (65.472 tokens puntuados), con la mitad de texto de llamadas a herramientas y la mitad de texto plano:

| Filas de prueba | KL, compilacion oQ4e | KL, esta compilacion | Cambio (intervalo 95%) | Concordancia top-1, oQ4e -> esta compilacion |
|---|---|---|---|---|
| Texto de tool-call (32) | 0,1122 | 0,0963 | -14,1% (-21,5% a -6,0%) | 92,87% -> 93,40% |
| Texto plano (32) | 0,0380 | 0,0380 | -0,1% (-2,8% a +2,4%) | 92,20% -> 92,38% |
| Total (64) | 0,0751 | 0,0671 | -10,6% (-17,0% a -4,1%) | 92,53% -> 92,89% |

Perplejidad en las mismas filas: en texto de tool-call, 3,796 para esta compilacion frente a 3,706 para oQ4e y 3,692 para BF16; en texto plano, 7,305, 7,302 y 7,304 respectivamente. El autor senala que la perplejidad en tool-call se aleja ligeramente del BF16 aunque la divergencia KL mejore, y que no dispone de explicacion para ello. Los intervalos se obtuvieron remuestreando las filas 1.000 veces.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio en disco: 100,275 GiB (107,67 GB) para los pesos en 4 bits; el repo completo ocupa 107,7 GB.
- Memoria del sistema: probado en un Mac Studio con M5 Max y 128 GB de memoria unificada, con el limite de GPU de macOS elevado a 120.832 MB.
- GPU recomendadas: Apple Silicon de gama alta con 128 GB de memoria unificada (M5 Max en la prueba del autor). No se documenta soporte para GPU NVIDIA ni AMD, dado que la libreria es MLX.
- Cabe en GPU de consumo: si, en Macs con 128 GB de memoria unificada; no cabe en GPUs de consumo convencionales de 24 GB o menos.
- Opciones de despliegue: motor MLX de LeanZero (`v0.14.3-lz.27`) con tabla n-gram en disco y MTP con 2 tokens de borrador. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ4e-DWQ-LeanZero (este) | 179.999.981.459 | 524.288 con YaRN 4 (config. probada) | 4 bits MLX con DWQ en 35 capas | qwen-community-1.0 | Hugging Face, MLX, Apple Silicon |
| Mihai-LeanZero/Qwen3.8-Flash-Next-oQ4e-LeanZero | 179.999.981.459 | no disponible | 4 bits MLX (receta oQ4e) | qwen-community-1.0 | Hugging Face, MLX, Apple Silicon |
| Qwen/Qwen3.8-Flash-Next (BF16) | 179.999.981.459 | no disponible | BF16 | qwen-community-1.0 | Hugging Face, pesos oficiales |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La mejora de DWQ solo es medible en texto de tipo tool-call; en texto plano la diferencia es estadisticamente indistinguible (-0,1%, intervalo de -2,8% a +2,4%).
- La perplejidad en texto de tool-call se aleja del modelo BF16 (3,796 frente a 3,692), un efecto que el autor no explica y que conviene vigilar en produccion.
- Solo se reentrenaron 35 de las 48 capas; las 13 restantes conservan el redondeo original, lo que limita la mejora global.
- El modelo esta empaquetado exclusivamente para MLX y Apple Silicon; no hay pesos GGUF ni soporte documentado para otras plataformas.
- Requiere 128 GB de memoria unificada, lo que excluye la mayoria de equipos de consumo.
- La licencia qwen-community-1.0 puede imponer restricciones al uso comercial; debe revisarse el fichero LICENSE antes de desplegar en produccion.
- No se han publicado evaluaciones de sesgo, alucinacion ni seguridad en la informacion disponible.
- Los idiomas soportados no estan documentados explicitamente.
- El modelo se distribuye "tal cual" y sin garantia, segun indica el autor.
- La calibracion DWQ uso datos publicos de terceros con licencias CC-BY-4.0, Apache-2.0 y ODC-By; conviene verificar el cumplimiento de atribucion si se redistribuye.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mihai-LeanZero/Qwen3.8-Flash-Next-oQ4e-DWQ-LeanZero
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Compilacion previa oQ4e: https://huggingface.co/Mihai-LeanZero/Qwen3.8-Flash-Next-oQ4e-LeanZero
- LeanZero: https://leanzero.net
- Revision del modelo base citada: `de4b8e4d43b917e7706784d8bb445c9af86a3540`
- Dataset de calibracion (codificacion agentica): nebius/SWE-agent-trajectories (CC-BY-4.0)
- Dataset de calibracion (function calling): glaiveai/glaive-function-calling-v2 (Apache-2.0)
- Dataset de calibracion (texto general): HuggingFaceFW/fineweb-edu (ODC-By)
- Conjunto de calibracion de codigo y multilingue de oMLX (Apache-2.0): no disponible como enlace directo en la informacion proporcionada
- Paper o blog tecnico sobre DWQ: no disponible en la informacion proporcionada
