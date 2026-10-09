# junwzhang/DeepSeek-V4.1-Flash-LSQ3-G128-MLX

## Resumen

DeepSeek-V4.1-Flash-LSQ3-G128-MLX es una version cuantizada mediante MLX del modelo DeepSeek-V4.1-Flash, publicada por el usuario junwzhang. Se trata de un checkpoint mixto de cuantizacion LSQ (Learned Step Size Quantization) en 3 bits con tamano de grupo 128 aplicado a los expertos enrutados, mientras que las componentes nativas, de embedding y de cabeza se mantienen en 8 bits y el modulo Engram conserva su almacenamiento FP8 original. El resultado es un modelo de aproximadamente 65.760 millones de parametros totales que ocupa 451,5 GB en el repositorio (420,53 GiB de descarga), disenado especificamente para ejecutarse en Apple Silicon de gama alta.

El modelo resuelve el problema de desplegar un modelo de gran escala basado en mezcla de expertos (MoE) en hardware de consumo profesional con memoria unificada, mediante una cuantizacion agresiva de los expertos enrutados. Incluye ademas una capa de metadatos ("metadata overlay") que deduplica las palabras U32 de pares escala/sesgo en BF16 de 120 proyecciones de expertos, reduciendo el almacenamiento de metadatos en 7,9 GiB y el footprint de tensores residentes de 223,48 a 215,58 GiB, sin modificar los codigos enteros de peso.

Es relevante ahora porque demuestra un flujo de cuantizacion reproducible sobre un modelo frontier de DeepSeek optimizado para el stack MLX/oMLX de Apple, con kernel y motor parcheados especificamente. Toda la documentacion apunta a una revision fija y a un entorno de reproduccion cerrado, lo que lo convierte en un caso de estudio de cuantizacion LSQ aplicada a arquitecturas MoE con componentes multimodales (vision) y de prediccion multi-token (MTP/DSpark) preservados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos con expertos enrutados; componentes de vision y MTP/DSpark preservados); detalles completos no disponibles |
| Parametros totales | 65.763.551.954 (~65,76 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LSQ mixta: 3 bits con grupo de 128 en expertos enrutados; 8 bits en componentes nativas/embedding/cabeza; FP8 en Engram |
| Idiomas soportados | no disponible |
| Licencia | MIT (se preserva la licencia MIT de DeepSeek) |
| Formato de pesos | safetensors (formato MLX), mas ficheros Engram y sidecar de metadatos |

## Arquitectura y entrenamiento

El modelo base es deepseek-ai/DeepSeek-V4.1-Flash (revision 2cba9e42aa026125f3ed06c6d98c1db82f7ca027). La arquitectura es de mezcla de expertos (MoE) con expertos enrutados, y el checkpoint cuantizado conserva los componentes nativos MTP/DSpark y de vision del modelo original. Tambien conserva las tablas Engram, que en el perfil de ejecucion solo se descargan parcialmente a SSD (las tablas grandes), mientras que los expertos enrutados permanecen residentes en memoria. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

El proceso de cuantizacion se basa en el metodo/manantial tacos8me/m5-ultra (revision 4e4d5a81f8135249815a3f284c0ed5bbd1faee58) y aplica la politica mixta `q3g128-native8-embedhead8-engramfp8`: los expertos enrutados usan pesos de 3 bits con tamano de grupo 128, las componentes nativas, de embedding y de cabeza mantienen formatos de 8 bits, y Engram conserva el almacenamiento FP8 de origen. La conversion LSQ3 original es con perdida (lossy), mientras que la compresion adicional de diccionarios de metadatos es exacta respecto al checkpoint convertido: los codigos enteros de peso y los valores de metadatos en BF16 crudos permanecen inalterados. La innovacion tecnica destacable es esta capa de metadatos que deduplica pares escala/sesgo U32 en 120 proyecciones de expertos enrutados, con indices U16 que seleccionan cada par exacto y verificaciones de readback completas.

## Capacidades

- Generacion de texto y uso conversacional (pipeline text-generation, tag conversational).
- Razonamiento y generacion de codigo: los casos de prueba de rendimiento usan texto de codigo sintetico como uno de los escenarios.
- Planificacion de tareas: uno de los escenarios de prueba es un plan de video/uso de ordenador (sin ejecucion real de operaciones).
- Capacidades de vision: el checkpoint conserva los componentes de vision originales.
- Prediccion multi-token: se preservan los componentes nativos MTP/DSpark.
- Memoria Engram: se mantienen las tablas Engram del modelo original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; las pruebas de rendimiento no son una evaluacion completa de flujos de agente.
- Capacidades multilingues: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Ejecucion local en estaciones de trabajo Apple Silicon de gama alta: el modelo esta pensado para Macs con 256 GiB de memoria unificada, lo que permite desplegar un MoE de ~65,76 B parametros cuantizado en 3 bits sin GPU dedicada, aprovechando los expertos enrutados residentes y descargando solo las tablas Engram a SSD.
- Investigacion en cuantizacion LSQ: sirve como referencia reproducible para estudiar la aplicacion de LSQ de 3 bits con grupo 128 sobre arquitecturas MoE y el impacto de la deduplicacion de metadatos de escala/sesgo sobre el footprint de memoria (reduccion de 223,48 a 215,58 GiB residentes).
- Prototipado de generacion de codigo: con los escenarios de decodificacion a 8K de contexto sobre texto de codigo sintetico y ~76 tokens/s de velocidad, es adecuado para desarrollo iterativo local de asistencia a la programacion.
- Generacion de borradores de marketing y contenido: uno de los escenarios de prueba contempla borradores de marketing, lo que sugiere uso para redaccion asistida en local.
- Planificacion de tareas de video/uso de ordenador: el modelo conserva componentes de vision y se probo con un plan de video/computer-use (sin ejecucion), por lo que puede emplearse para generar planes estructurados a partir de entrada visual.
- Reproduccion de benchmarks de inferencia en MLX/oMLX: dado que requiere un kernel y motor parcheados concretos, es util para validar pipelines de cuantizacion y medir throughput de decodificacion y prefill en el stack de Apple.
- Evaluacion de preservacion de componentes multimodales y MTP tras cuantizacion: al retener vision, DSpark y Engram, permite estudiar como se comportan estos subsistemas cuando los expertos enrutados se cuantizan a 3 bits.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son de throughput de generacion, no de calidad del modelo:

| Metrica | Resultado |
|---|---|
| Decodificacion greedy (media geometrica, 8K/512, tres escenarios) | 76,07 tokens/s |
| Prefill denso vs directo (8K) | +4,21 % |
| Prefill denso vs directo (16K) | +3,79 % |
| Prefill denso vs directo (32K) | +3,75 % |
| Uplift de decodificacion en esa comparacion | sin uplift medido |

Estas mediciones son pruebas de throughput de generacion con verificacion completa de identidad de salida/contadores, no una evaluacion de calidad del modelo ni de flujos de agente. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Memoria unificada: 256 GiB en un Mac Apple Silicon.
- Capacidad de asignacion wired: 240 GiB (`sysctl iogpu.wired_limit_mb=245760`).
- Hardware de referencia de las mediciones: M5 Ultra con 30 nucleos de CPU y 64 nucleos de GPU, macOS 27.0.1.
- Descarga del paquete: 420,53 GiB (el repositorio ocupa 451,5 GB).
- Footprint de tensores residentes: 215,580619 GiB (excluyendo KV/cache/espacios de trabajo), tras la reduccion desde 223,481091 GiB.
- Offload a SSD: solo las tablas Engram grandes; los expertos enrutados permanecen residentes.
- Toolchain requerido: Xcode/SDK 27.2, Git, `uv`, `hf` CLI, Python 3.13.15 fijado.
- Runtime: kernel y motor parcheados de gnahz/omlx-flash-optimizations; un oMLX sin parchear no reproduce el perfil residente compacto.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable, el modelo esta empaquetado para MLX sobre Apple Silicon; no disponible para CUDA.
- Opciones de despliegue: oMLX parcheado (no vLLM, llama.cpp, Ollama ni TGI segun la informacion disponible).
- Latencia y throughput: ver tabla de benchmarks (76,07 tokens/s de decodificacion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-LSQ3-G128-MLX (este) | ~65,76 B totales | no disponible | LSQ 3-bit/G128 mixta (MLX) | MIT | HuggingFace, MLX/Apple Silicon |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | no disponible | no disponible | nativa (sin cuantizar por este autor) | MIT | HuggingFace |
| Otras cuantizaciones MLX de DeepSeek-V4.1-Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables alternativos en la informacion proporcionada. La comparativa mas directa es frente al checkpoint base deepseek-ai/DeepSeek-V4.1-Flash, del que este modelo deriva por cuantizacion.

## Limitaciones y advertencias

- La conversion LSQ3 original es con perdida; la exactitud demostrada por la prueba de metadatos se refiere unicamente a la representacion adicional, no a la ausencia de perdida del cuantizador LSQ original.
- Requiere un runtime parcheado especifico; un oMLX estandar no reproduce el perfil residente compacto, y el trabajo no soportado o de cola usa un fallback denso verificado.
- Requiere verificar todos los checksums (SHA256SUMS) y preservar la estructura de directorios antes de cargar; el hash del fichero de prueba portable difiere tras la sanitizacion de rutas.
- Las mediciones publicadas son de throughput de generacion, no de calidad del modelo ni de flujos de agente, por lo que no garantizan comportamiento en tareas reales.
- Los escenarios de prueba de 8K son sinteticos (codigo, marketing, plan de video/computer-use) y el de computer-use no ejecuta operaciones reales.
- Dependencia fuerte de hardware: 256 GiB de memoria unificada y 240 GiB de asignacion wired limitan su uso a configuraciones Apple Silicon de gama muy alta.
- Idiomas soportados: no disponible en la informacion proporcionada.
- Longitud de contexto: no disponible; no se debe asumir una ventana concreta.
- La licencia es MIT, lo que en principio permite uso comercial, pero hereda las condiciones del modelo base DeepSeek-V4.1-Flash (licencia MIT preservada); conviene revisar los terminos del modelo base.
- Riesgo de sesgos y alucinacion: no evaluado en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junwzhang/DeepSeek-V4.1-Flash-LSQ3-G128-MLX
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Repositorio de optimizaciones oMLX: https://github.com/gnahz/omlx-flash-optimizations
- Guia de reproduccion: https://github.com/gnahz/omlx-flash-optimizations/blob/main/docs/REPRODUCE.md
- Metodo/manantial de cuantizacion m5-ultra: https://github.com/tacos8me/m5-ultra/tree/4e4d5a81f8135249815a3f284c0ed5bbd1faee58
- Revision del modelo base: 2cba9e42aa026125f3ed06c6d98c1db82f7ca027
