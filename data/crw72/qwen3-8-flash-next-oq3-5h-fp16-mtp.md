# crw72/Qwen3.8-Flash-Next-oQ3.5h-fp16-mtp

## Resumen

Qwen3.8-Flash-Next-oQ3.5h-fp16-mtp es una cuantizacion mixta del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario crw72 en Hugging Face. El artefacto se ha generado con la herramienta oQ (oMLX v0.8.0) y esta empaquetado en formato MLX, lo que lo orienta a inferencia sobre hardware Apple Silicon. El checkpoint completo ocupa 98,2 GB en disco y contiene 73.716.594.579 parametros logicos, aunque la mayor parte de esa cifra corresponde a una tabla de embeddings N-gram cuantizada de forma agresiva.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de cuantizacion mixta por capas con precision efectiva declarada de 23,527 bits/peso excluyendo el embedding N-gram, o 10,659 bits/peso para el checkpoint completo. Por otro, ilustra una estrategia poco habitual: mantener en alta precision (U32, FP32, FP16) los tensores criticos y comprimir a 4-5 bits la tabla N-gram, que concentra el 69,456 % de los pesos logicos pero solo el 29,802 GiB de almacenamiento.

No se dispone de informacion sobre el modelo base mas alla de su identificador y su licencia Apache 2.0. La model card del autor no incluye detalles sobre arquitectura interna, datos de entrenamiento ni resultados de evaluacion, por lo que esta ficha se limita a lo verificable en los metadatos y en la tabla de cuantizacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda del modelo base Qwen/Qwen3.8-Flash-Next; el checkpoint incluye componentes de lenguaje, vision, cabecera MTP y embedding N-gram) |
| Parametros totales | 73.716.594.579 (73,717B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64, affine 6-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, FP16, FP32, U32, I64 y N-gram affine 4-bit grupo 32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria mlx) |
| Precision efectiva media | 23,527 bits/peso excluyendo N-gram; 10,659 bits/peso en el checkpoint completo |
| Tamano del repositorio | 98,2 GB (91,472 GiB) |
| Componentes | Lenguaje 19,460B; N-gram embedding 51,200B; vision 0,449B; cabecera MTP 2,607B |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura del modelo base Qwen/Qwen3.8-Flash-Next en la documentacion proporcionada. El checkpoint cuantizado revela, sin embargo, cuatro componentes diferenciados: un modulo de lenguaje de 19,460B de pesos logicos, una tabla de embedding N-gram de 51,200B, un modulo de vision de 0,449B en FP32 y una cabecera MTP (multi-token prediction) de 2,607B. La presencia de vision y de MTP sugiere un modelo multimodal con decodificacion especulativa o prediccion multi-token, pero no hay confirmacion oficial en la informacion disponible.

El proceso de cuantizacion es el elemento mejor documentado. oQ (oMLX v0.8.0) aplica precision mixta por tensor: los pesos mas sensibles se mantienen en FP16, FP32 o incluso U32 (14,418B en este ultimo formato), mientras que los tensores de menor impacto se comprimen a affine 4-bit o 6-bit con grupos de 64, y los de 8-bit con grupos de 64 o 128. La tabla N-gram se cuantiza a 4-bit con grupo 32, lo que explica su ratio de compresion. No se documentan datos de entrenamiento, numero de tokens, composicion del corpus ni tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto y modelado de lenguaje: el modulo de lenguaje conserva 19,460B de pesos logicos, con partes en 4, 6 y 8 bits y tensores criticos en FP16/FP32/U32.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0,449B de pesos en FP32, lo que indica capacidades multimodales imagen-texto, aunque no se detalla su alcance.
- Prediccion multi-token (MTP): la cabecera MTP de 2,607B esta pensada para decodificacion especulativa o generacion de varios tokens por paso, lo que puede reducir la latencia en inferencia autorregresiva.
- Recuperacion mediante embeddings N-gram: la tabla N-gram de 51,200B, cuantizada a 4-bit, sugiere un mecanismo de memoria o recuperacion basada en n-gramas para contexto extendido.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: al estar empaquetado en formato MLX, el checkpoint esta pensado para ejecutarse con la libreria MLX de Apple en equipos con memoria unificada. Un Mac Studio con 128 GB o superior podria cargar los 91,472 GiB de pesos, aunque el margen es ajustado.
- Investigacion sobre cuantizacion mixta: la tabla de distribucion de bits permite estudiar el impacto de asignar 4, 6 u 8 bits a distintos tensores, y comparar la precision efectiva (23,527 bits/peso sin N-gram) con variantes uniformes.
- Evaluacion de decodificacion especulativa: la cabecera MTP incluida en FP16 permite probar tecnicas de prediccion multi-token sobre el modelo base y medir su efecto en throughput.
- Prototipado multimodal en local: el modulo de vision en FP32 posibilita experimentar con tareas imagen-texto sin depender de APIs externas, siempre que el hardware lo permita.
- Benchmarking de recuperacion N-gram: la tabla N-gram cuantizada a 4-bit con grupo 32 es un objeto de estudio para medir la degradacion de calidad en mecanismos de memoria basados en n-gramas.
- Despliegue en pipelines de investigacion con MLX: integracion en scripts de evaluacion o generacion por lotes usando la libreria mlx, aprovechando el formato safetensors nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el checkpoint completo ocupa 91,472 GiB (98,2 GB) en disco. En memoria unificada de Apple Silicon se necesita al menos esa cantidad mas overhead de activaciones y cache KV, por lo que un equipo con 128 GB es el minimo practico.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No se documenta soporte para CUDA.
- GPU de consumo: no cabe en tarjetas consumer convencionales de 24 GB (RTX 4090) ni de 48 GB (RTX 6000 Ada) por el tamano del checkpoint. Requiere memoria unificada de Apple o GPUs de datacenter con 80 GB o mas, y aun asi el checkpoint completo no entra en una sola A100/H100 de 80 GB.
- Opciones de despliegue: libreria MLX (mlx, mlx-lm). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| crw72/Qwen3.8-Flash-Next-oQ3.5h-fp16-mtp | 73,717B | no disponible | MLX safetensors | Apache 2.0 | Cuantizacion mixta 4-8 bits + N-gram 4-bit; 98,2 GB |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible | Apache 2.0 | Modelo original sin cuantizar; referencia para comparar degradacion |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | Apache 2.0 | No se han identificado en la informacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni datos de calidad, ni comparacion con el modelo base sin cuantizar. La precision efectiva de 10,659 bits/peso en el checkpoint completo es muy baja y la degradacion es desconocida.
- Cuantizacion agresiva en N-gram: la tabla N-gram concentra el 69,456 % de los pesos logicos a 4-bit con grupo 32; cualquier perdida de calidad en recuperacion o memoria afecta a la mayor parte del modelo.
- Formato exclusivo MLX: no es portable a CUDA, ROCm ni CPU convencional sin conversion, lo que limita su uso a ecosistema Apple.
- Requisitos de memoria elevados: 91,472 GiB de pesos hacen inviable su ejecucion en la mayoria de estaciones de trabajo.
- Modelo base sin documentar: se desconoce la longitud de contexto, los idiomas soportados, el regimen de entrenamiento y las capacidades reales de tool calling o agentes.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Sesgos: no documentados.
- Licencia Apache 2.0: permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre el comportamiento del artefacto.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-19): el timestamp del repositorio es posterior a la fecha habitual de consulta, lo que conviene verificar antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/crw72/Qwen3.8-Flash-Next-oQ3.5h-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
