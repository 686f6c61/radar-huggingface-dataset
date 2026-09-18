# Accio-Lab/occamy-1.0-MLX-3bit

## Resumen

Occamy 1.0 MLX 3-bit es una version cuantizada del modelo base Accio-Lab/occamy-1.0, publicada por el propio laboratorio Accio-Lab. Se trata de una exportacion en formato MLX con cuantizacion afin nativa de 3 bits y group size 64, pensada para ejecucion local sobre Apple Silicon mediante la libreria mlx-lm. El tag de arquitectura `qwen3_5_moe` y la presencia de modulos de router y de puertas (gates) de expertos compartidos indican que el modelo base es un transformer con mezcla de expertos (MoE) de aproximadamente 34.660 millones de parametros totales.

El modelo resuelve el problema de desplegar un MoE de ~34,7 B en hardware de consumo: el repositorio ocupa 15,2 GB, frente a los aproximadamente 69,7 GB que requeriria el modelo en precision completa segun los datos publicados para occamy-1.0. Es, por tanto, una pieza orientada a inferencia local en Mac, no a servidores de alta densidad. El autor lo etiqueta explicitamente como "candidate release" con la aceptacion en Metal (macOS) pendiente, aunque la validacion nativa sobre Linux MLX si ha pasado.

La relevancia actual es doble: por un lado, permite evaluar un MoE de gran tamano en un portatil o Mac Studio sin GPU dedicada; por otro, es un ejemplo de cuantizacion nativa MLX aplicada a un modelo con expertos separados, incluyendo un adaptador sin perdida que apila los pesos de los expertos en orden numerico antes de invocar el saneador de Qwen3.5. La informacion publica es limitada: no hay licencia declarada, ni idiomas, ni longitud de contexto, ni benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); tag de arquitectura `qwen3_5_moe` |
| Parametros totales | 34.660.608.768 (~34,66 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits con group size 64 (cuantizacion afin nativa MLX); router y modulos de puerta de expertos compartidos en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos MLX), libreria `mlx` / `mlx-lm` |
| Version base | Accio-Lab/occamy-1.0, revision `8f8e0e58a3c9df042be1a3fa2c191fd8047acfb8` |
| Modalidad | solo texto (vision y MTP no incluidos en esta exportacion) |
| Tamano del repositorio | 15,2 GB |
| Herramientas de conversion | mlx 0.32.2 y mlx-lm 0.31.3 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), identificado por el tag `qwen3_5_moe` y por la presencia declarada de un router y de modulos de puerta (gate) de expertos compartidos. No se especifica el numero de expertos, la granularidad de activacion ni la longitud de contexto en la informacion disponible. El modelo base occamy-1.0 no aporta tampoco detalles publicos sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de la mezcla ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias; todo ello debe considerarse no disponible.

La innovacion tecnica documentada se limita al pipeline de cuantizacion. Segun la model card, la conversion emplea la cuantizacion afin nativa de MLX con 3 bits y group size 64, dejando el router y las puertas de expertos compartidos en 8 bits para preservar la precision del enrutado. Para manejar correctamente un MoE con pesos de expertos separados, se usa un adaptador sin perdida (lossless) que apila los pesos de cada experto en orden numerico antes de invocar el saneador (sanitizer) de Qwen3.5 una unica vez. La recarga posterior se hace con el cargador estandar de mlx-lm, sin adaptador. La validacion declarada incluye recarga estricta con el cargador de serie, comprobacion de todos los valores en coma flotante almacenados, desquantizacion nativa de cada fila cuantizada, comparacion de tokenizer y plantilla, y una generacion greedy con cache sobre CPU acotada y logits finitos. La prueba de humo con el prompt "Compute 2+2. Answer briefly." devolvio `4`; el propio autor advierte que no es un benchmark de calidad.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y matematicas basicas: la unica evidencia publicada es la prueba de humo aritmetica (`2+2 = 4`), sin datos de rendimiento en GSM8K, MATH o similares.
- Generacion de codigo: no hay evidencia publicada especifica para este modelo; al ser un modelo de texto de proposito general derivado de un MoE Qwen3.5, es esperable, pero no esta documentado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidades especiales: no incluye vision ni MTP (multi-token prediction) en esta exportacion; es un modelo exclusivamente de texto.
- Ejecucion local en Apple Silicon mediante mlx-lm, con pesos ya cuantizados que no requieren conversion adicional por parte del usuario.

## Casos de uso

- Inferencia local en Mac sin GPU dedicada: con 15,2 GB de pesos, el modelo puede cargarse en un Mac con memoria unificada suficiente y ejecutarse via `mlx_lm.load()`, sin necesidad de tarjetas graficas de datacenter ni de servicios en la nube.
- Prototipado de aplicaciones conversacionales en local: al ser un modelo conversacional cuantizado, sirve para iterar sobre prompts, plantillas de chat y logica de dialogo sin incurrir en costes de API y con los datos confinados en la maquina.
- Procesamiento de texto sensible a la privacidad: al ejecutarse enteramente en local, es adecuado para borradores legales, notas internas o documentacion confidencial que no deberia salir del equipo.
- Experimentacion con cuantizacion MoE: el repositorio documenta el proceso de apilado de expertos, el saneador de Qwen3.5 y la cuantizacion afin con group size 64, por lo que es un caso de estudio util para quien quiera reproducir el pipeline sobre otros MoE.
- Evaluacion comparativa de modelos base frente a sus versiones cuantizadas: permite medir la degradacion introducida por los 3 bits frente a occamy-1.0 en precision completa, siempre que se disponga de hardware para ambas variantes.
- Desarrollo de asistentes desatendidos en estaciones de trabajo Apple: encaja en flujos batch o daemon que aprovechan la GPU integrada de los chips de la serie M durante periodos de inactividad.
- Base para ajuste fino o destilado posterior: aunque no esta documentado, la estructura safetensors y el soporte de mlx-lm permiten plantear adaptaciones sobre la version cuantizada, teniendo en cuenta que la cuantizacion limita la calidad de cualquier ajuste adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica evidencia cuantitativa es la prueba de humo descrita en la model card: una generacion greedy con cache acotada sobre CPU que devolvio `4` ante el prompt "Compute 2+2. Answer briefly.". El propio autor la califica explicitamente como prueba de humo y no como benchmark de calidad. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: los pesos ocupan 15,2 GB en disco (3 bits, group size 64, con router y gates en 8 bits). Estimacion propia: hacen falta aproximadamente 16-20 GB de memoria unificada para pesos, activaciones y cache KV, aunque este ultimo dato no puede calcularse con precision porque se desconoce la longitud de contexto.
- Comparativa con el modelo base: para occamy-1.0 en precision completa se han publicado 69,7 GB de VRAM estimada (fuente: LLM Explorer), es decir, unas 4,5 veces mas que esta version cuantizada.
- GPU recomendadas: al ser un artefacto MLX, el objetivo principal es Apple Silicon (familias M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No se proporcionan recomendaciones para GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: disenado para memoria unificada de Apple Silicon; no se declara soporte para RTX 4090 ni similares en esta ficha.
- Opciones de despliegue: `mlx-lm` (carga estandar mediante `from mlx_lm import load, generate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones soportadas para este artefacto concreto.
- Estado de validacion: Linux nativo con MLX validado; la aceptacion en Metal para macOS esta pendiente segun el autor. La generacion de prueba se ejecuto sobre CPU.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de Occamy 1.0 son incompletos (sin contexto, sin parametros activos, sin licencia, sin benchmarks), por lo que la comparacion se limita a parametros, formato, licencia y disponibilidad. Los datos de los modelos de referencia provienen de sus fichas publicas.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| Occamy 1.0 MLX 3-bit | 34,66 B | no disponible | no disponible | no disponible | safetensors MLX (3 bits, group size 64) |
| Occamy 1.0 (base) | 34,66 B | no disponible | no disponible | no disponible | safetensors (precision completa, ~69,7 GB) |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 128 K | Apache 2.0 | safetensors, GGUF, MLX |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32 K | Apache 2.0 | safetensors, GGUF |

Nota: no se dispone de resultados de benchmarks de Occamy 1.0 que permitan comparar calidad frente a estas alternativas. La comparacion de Qwen3-30B-A3B se incluye por proximidad en tamano total y por compartir familia arquitectonica MoE con el tag `qwen3_5_moe`.

## Limitaciones y advertencias

- Estado de publicacion: el autor lo define como "candidate release" y afirma que la aceptacion en Metal para Mac esta pendiente; no hay validacion publicada de rendimiento ni de calidad en macOS.
- Ausencia de licencia: la licencia figura como no disponible tanto en la ficha de HuggingFace como en la model card, lo que impide determinar si el uso comercial esta permitido. No debe asumirse uso comercial libre.
- Idiomas no declarados: no se especifica que idiomas soporta el modelo ni su calidad relativa en cada uno.
- Contexto desconocido: se desconoce la longitud de contexto, lo que impide planificar aplicaciones con documentos largos o conversaciones extensas.
- Benchmarks inexistentes: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones humanas; la unica evidencia es una prueba aritmetica trivial.
- Riesgo de alucinacion: no evaluado. Como en cualquier modelo generativo de este tamano, existe riesgo de fabricacion de hechos, especialmente en dominios especializados. La cuantizacion de 3 bits puede incrementar la degradacion respecto al modelo base, aunque no hay mediciones publicadas.
- Cuantizacion agresiva: 3 bits con group size 64 es una compresion elevada; aunque el router y las puertas de expertos se mantienen en 8 bits, se espera cierta perdida de calidad frente a occamy-1.0. El autor no cuantifica esa perdida.
- Dependencia de hardware: artefacto especifico de MLX, orientado a Apple Silicon; no es directamente utilizable en el ecosistema CUDA sin reconvertir los pesos.
- Sin vision ni MTP: esta exportacion es solo texto, por lo que no puede emplearse en tareas multimodales ni aprovechar multi-token prediction.
- Trazabilidad: se declara la revision exacta del modelo base y la existencia de `SHA256SUMS` y `validation_summary.json`, pero no se documentan el dataset, el proceso de entrenamiento ni las etapas de alineacion.
- Adopcion muy baja: 95 descargas y 0 "likes" en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.

## Enlaces

- HuggingFace (modelo cuantizado): https://huggingface.co/Accio-Lab/occamy-1.0-MLX-3bit
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- LLM Explorer (Occamy 1.0, VRAM estimada): https://llm-explorer.com/model/Accio-Lab%2Foccamy-1.0,1zolJ2bV0oV3tkE83bEMbI
- Sitio del laboratorio (plataforma Accio Work): https://www.accio.com/
- Aplicacion de escritorio de Accio: https://www.accio.com/work/app
- Version en frances del sitio: https://fr.accio.com/
