# baa-ai/Gemma-4-26B-A4B-it-RAM-13GB-MLX

## Resumen

Gemma-4-26B-A4B-it-RAM-13GB-MLX es una cuantizacion de precision mixta del modelo google/gemma-4-26B-A4B-it, publicada por baa-ai (Black Sheep AI) y empaquetada en formato MLX para su ejecucion en hardware Apple Silicon. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 25.233.053.440 parametros totales segun los safetensors del repositorio, y esta disenado para generacion de texto conversacional con capacidad de razonamiento extendido (thinking mode).

La aportacion de esta version concreta es la compresion: reduce un modelo BF16 de 51,6 GB a un repositorio de 12,9 GB (3,46 bits por peso de media) mediante un metodo propietario denominado Black Sheep AI, manteniendo, segun el autor, el 98,2% de la precision de la variante de 14 GB con vision en un conjunto de 400 preguntas de MMLU. Es la variante "knee" de la familia RAM: el presupuesto de memoria mas bajo antes de que la calidad se degrade de forma acusada.

Es relevante ahora porque permite ejecutar un modelo de clase 26B con capacidades de razonamiento en equipos con memoria unificada de 13-16 GB, un umbral que hasta hace poco solo cubrian modelos mucho mas pequenos. La contrapartida es que esta build es exclusivamente de texto: la torre de vision no esta incluida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), base google/gemma-4-26B-A4B-it |
| Parametros totales | 25.233.053.440 (25,23B) |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4B activos, no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta, 4-bit, media de 3,46 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Gemma (terminos de licencia de Google) |
| Formato de pesos | safetensors (MLX), repositorio de 12,9 GB |
| Libreria de inferencia | mlx (mlx_lm) |
| Modalidad | Solo texto (vision no incluida) |
| Tamano del repositorio | 12,9 GB |

## Arquitectura y entrenamiento

El modelo subyacente es google/gemma-4-26B-A4B-it, un transformer con arquitectura de mezcla de expertos (MoE). La nomenclatura "A4B" indica que, aunque el modelo contiene 25,23B parametros totales, solo un subconjunto reducido (presumiblemente ~4B) se activa por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

La innovacion tecnica de esta build es el proceso de cuantizacion de precision mixta desarrollado por baa-ai, que asigna distintos niveles de bits a distintas capas o tensores en lugar de aplicar una cuantizacion uniforme de 4 bits. El resultado son 3,46 bits por peso de media, lo que permite comprimir el modelo a 12,9 GB manteniendo, segun el autor, una precision superior a la cuantizacion uniforme de 4 bits (~14 GB, 77,88% en MMLU) en su propio arnes de evaluacion. El modelo conserva el modo de razonamiento (thinking on) del original, con hasta 2048 tokens de razonamiento antes de forzar una respuesta.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento extendido mediante modo thinking, con hasta 2048 tokens de cadena de razonamiento.
- Respuesta a preguntas de conocimiento general (MMLU).
- Lectura comprensiva y question answering sobre documentos en un pipeline de retrieval-augmented generation (RAG), segun la evaluacion del autor sobre manuales del Boeing 787.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Vision: no incluida en esta build (la torre de vision se omite; para entrada de imagen hay que usar la variante de 14 GB o superiores).

## Casos de uso

- Asistente conversacional local en Mac: el modelo se ejecuta via mlx_lm en equipos Apple Silicon con 13-16 GB de memoria unificada, lo que permite desplegar un asistente privado sin conexion a servicios en la nube.
- Lectura de documentacion tecnica con RAG: el autor lo evalua como lector de un consola de retrieval-augmented sobre manuales del Boeing 787, con un 60% de respuestas que contienen el valor esperado; es adecuado para consulta de manuales, normativas o documentacion interna donde la respuesta debe extraerse de un corpus controlado.
- Razonamiento asistido en entornos con recursos limitados: gracias al modo thinking de hasta 2048 tokens, puede abordar problemas de logica, matematicas o analisis que requieran cadena de razonamiento, en hardware de consumo.
- Procesamiento por lotes de texto en local: al caber en 13 GB, permite ejecutar tareas de clasificacion, resumen o extraccion sobre grandes volumenes de texto en un Mac Studio o MacBook Pro de gama alta, sin coste por token.
- Prototipado de aplicaciones de IA privadas: util para desarrolladores que necesitan validar un pipeline con un modelo de clase 26B antes de escalar a infraestructura mayor, manteniendo los datos dentro del equipo.
- Despliegue en entornos con requisitos de confidencialidad: al ser una build local y solo texto, encaja en escenarios donde el contenido no puede salir del dispositivo (documentacion legal, medica o financiera), aunque la licencia Gemma impone sus propias condiciones.
- Educacion e investigacion: permite a investigadores experimentar con un MoE de 25B cuantizado en un portatil, sin acceso a GPUs de datacenter.

## Benchmarks y rendimiento

| Benchmark | RAM 13GB (esta build) | RAM 14GB | BF16 | Uniform 4-bit |
|---|---|---|---|---|
| MMLU (400 preguntas, thinking on) | 83,75% (335/400) | 85,25% (341/400) | 80,80% | 77,88% |
| MMLU como % de BF16 | no directamente comparable | 96,9% | 100% | 96,4% |
| Document Q&A, manuales Boeing 787 (150 preguntas) | 60,0% | no disponible | no disponible | no disponible |

Nota del autor: la cifra de MMLU de la build de 13 GB se midio en un arnes propio de 400 preguntas con thinking on y forzado de respuesta tras 2048 tokens (80 de 400 preguntas requirieron ese empujon), por lo que no es directamente comparable con las filas de BF16 y cuantizacion uniforme, que provienen de la evaluacion original. En el mismo arnes, la build de 14 GB obtiene 85,25%, de modo que la de 13 GB conserva el 98,2% de esa precision. El autor afirma que fue el lector mas preciso por debajo de 13 GB en el conjunto de 787 entre seis lectores evaluados de hasta 90 GB.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~13 GB para los pesos, mas overhead de contexto y KV cache; en la practica se recomienda disponer de 16 GB o mas de memoria unificada.
- Hardware objetivo: Apple Silicon (M-series) con MLX; el formato safetensors MLX no es directamente compatible con CUDA sin conversion.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada de 16 GB o superior (MacBook Pro M-series, Mac Studio). En GPUs NVIDIA de consumo (RTX 4090, 24 GB) requeriria conversion del formato MLX a otro runtime.
- Despliegue: mlx_lm (libreria oficial de MLX); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-it-RAM-13GB-MLX (esta build) | 25,23B totales (MoE) | no disponible | 83,75% (arnes propio) | Gemma | safetensors MLX |
| Gemma-4-26B-A4B-it-RAM-14GB-MLX | 25,23B totales (MoE) | no disponible | 85,25% (mismo arnes) | Gemma | safetensors MLX |
| google/gemma-4-26B-A4B-it (BF16) | 25,23B totales (MoE) | no disponible | 80,80% | Gemma | safetensors |
| Cuantizacion uniforme 4-bit del mismo base | 25,23B totales (MoE) | no disponible | 77,88% | Gemma | no disponible |

No se dispone de datos sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Build solo texto: no incluye la torre de vision, por lo que no acepta imagenes. Para entrada multimodal hay que usar la variante de 14 GB o superior.
- Precision degradada respecto a BF16: segun el propio autor, la build de 13 GB conserva el 98,2% de la precision de la de 14 GB en su arnes, pero la comparacion con BF16 no es directa; en tareas sensibles a la precision conviene validar con datos propios.
- Riesgo de alucinacion: inherente a los modelos generativos; el 60% de acierto en el test de document Q&A sobre el 787 implica que un 40% de respuestas no contenia el valor esperado, lo que exige verificacion en produccion.
- Contexto maximo no documentado: no se especifica la longitud de contexto soportada, lo que limita la planificacion de cargas con documentos largos.
- Idiomas no documentados: no se indica que idiomas soporta ni su calidad por idioma.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma de Google, que impone restricciones y obligaciones de atribucion; revisar antes de desplegar en produccion.
- Dependencia de MLX: el formato esta atado al ecosistema Apple Silicon; migrar a CUDA o a otros runtimes requiere conversion y validacion adicional.
- Metodo de cuantizacion propietario: el proceso Black Sheep AI no es publico, lo que dificulta auditar la distribucion de bits por capa o reproducir la evaluacion de forma independiente.
- Evaluacion limitada: el autor solo publica MMLU (400 preguntas) y un test de document Q&A; no hay datos de HumanEval, GSM8K ni otros benchmarks estandar, lo que impide comparar con el ecosistema general.

## Enlaces

- Hugging Face: https://huggingface.co/baa-ai/Gemma-4-26B-A4B-it-RAM-13GB-MLX
- Variante de 14 GB: https://huggingface.co/baa-ai/Gemma-4-26B-A4B-it-RAM-14GB-MLX
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Sitio del autor: https://baa.ai
- Documentacion del metodo de compresion: https://baa.ai/compression.html
- Producto Paddock: https://baa.ai/paddock.html
- Producto Watchman: https://baa.ai/watchman.html
- Producto Shepherd: https://baa.ai/shepherd.html
