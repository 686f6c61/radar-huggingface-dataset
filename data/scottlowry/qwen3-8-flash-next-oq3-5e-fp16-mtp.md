# scottlowry/Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp

## Resumen
Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp es una cuantizacion mixta del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario scottlowry en Hugging Face. El checkpoint original es un modelo de 180.000 millones de parametros (179.999.981.459 segun los tensores safetensors) con componentes de lenguaje, vision y una cabeza MTP (multi-token prediction), lo que lo situa en la categoria de modelos multimodales de gran escala. La cuantizacion se ha realizado con oQ (oMLX v0.7.4.dev1), una herramienta de cuantizacion de precision mixta orientada al ecosistema MLX de Apple.

El resultado es un checkpoint de 98,3 GB en formato MLX safetensors con un promedio efectivo de 4,114 bits por peso (excluyendo la tabla de embeddings N-gram) o 4,366 bits por peso para el checkpoint completo. La distribucion de bits es heterogenea: la mayor parte de los pesos del modelo de lenguaje se almacena en 3 y 4 bits afines con grupo 64, mientras que los embeddings N-gram usan 4 bits con grupo 32 y algunos tensores criticos se mantienen en 6, 8, 16 o 32 bits.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion mixta poco habitual (combinacion de 3, 4, 6 y 8 bits con grupos de 32, 64 y 128) y, por otro, advierte de que se trata de un artefacto derivado de un modelo base del que no se dispone de model card publica en la informacion proporcionada. El autor actualizo el checkpoint el 2026-11-11 con una recuantizacion, por lo que las copias anteriores deben descartarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; incluye modulo de lenguaje, modulo de vision y cabeza MTP) |
| Parametros totales | 179.999.981.459 (180.000B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta afín: 3 bits grupo 64, 4 bits grupo 64, 6 bits grupo 64, 8 bits grupo 128, 8 bits grupo 64, FP16, FP32; embeddings N-gram en 4 bits grupo 32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

Desglose de almacenamiento por componente (datos de la model card):

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 125,744B | 62,971 GB / 58,647 GiB |
| Embedding N-gram | 51,200B | 32,000 GB / 29,802 GiB |
| Vision | 0,449B | 1,796 GB / 1,672 GiB |
| Cabeza MTP | 2,607B | 1,471 GB / 1,370 GiB |
| Total | 180,000B | 98,238 GB / 91,491 GiB |

Distribucion de bits por peso logico:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits efectivos/peso |
|---|---|---|---|---|
| Afín 3 bits, grupo 64 | 80,531B | 44,739% | 32,812 GiB | 3,50 |
| Afín 4 bits, grupo 64 | 42,866B | 23,815% | 22,456 GiB | 4,50 |
| Afín 6 bits, grupo 64 | 0,883B | 0,491% | 0,668 GiB | 6,50 |
| Afín 8 bits, grupo 128 | 0,241B | 0,134% | 0,231 GiB | 8,25 |
| Afín 8 bits, grupo 64 | 3,763B | 2,090% | 3,723 GiB | 8,50 |
| FP16 | 0,067B | 0,037% | 0,124 GiB | 16,00 |
| FP32 | 0,449B | 0,249% | 1,672 GiB | 32,00 |
| N-gram afín 4 bits, grupo 32 | 51,200B | 28,445% | 29,802 GiB | 5,00 |
| Total | 180,000B | 100% | 91,491 GiB | 4,366 |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura interna del modelo base Qwen/Qwen3.8-Flash-Next en la documentacion proporcionada. Los metadatos del checkpoint permiten inferir que se trata de un modelo multimodal (incluye un modulo de vision de 0,449B de parametros logicos) y que incorpora una cabeza MTP (multi-token prediction) de 2,607B de parametros, tecnica habitualmente asociada a decodificacion especulativa o a entrenamiento con prediccion de multiples tokens por paso. Tambien incluye una tabla de embeddings N-gram de 51,200B de parametros logicos, un componente inusualmente grande que sugiere el uso de memoria asociativa o recuperacion basada en n-gramas.

El proceso de cuantizacion, realizado con oQ (oMLX v0.7.4.dev1), aplica precision mixta por tensor: los pesos se asignan a 3, 4, 6 u 8 bits segun su sensibilidad, manteniendo en FP16 y FP32 un pequeno porcentaje (0,286% combinado) de tensores presumiblemente criticos. No se especifican los datos de entrenamiento del modelo base, el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documenta el algoritmo exacto de asignacion de bits ni los criterios de seleccion de grupos.

## Capacidades
- Generacion de texto y razonamiento: el componente de lenguaje de 125,744B de parametros logicos sugiere capacidad para tareas generativas complejas, aunque no se documentan evaluaciones.
- Procesamiento de vision: el modulo de vision de 0,449B de parametros indica soporte de entrada multimodal de imagenes, sin que se detallen resoluciones ni tareas concretas.
- Prediccion multi-token (MTP): la cabeza dedicada de 2,607B de parametros apunta a decodificacion especulativa o generacion acelerada, aunque no se especifica su uso en inferencia.
- Recuperacion mediante embeddings N-gram: la tabla de 51,200B de parametros logicos sugiere algun mecanismo de memoria o lookup estadistico, no documentado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Inferencia local en hardware Apple Silicon: al estar en formato MLX, el checkpoint esta pensado para ejecutarse con el framework MLX de Apple; un equipo con memoria unificada de 128 GB o superior podria cargar los 91,491 GiB del checkpoint, aunque el rendimiento real no esta documentado.
- Investigacion sobre cuantizacion mixta: el checkpoint sirve como referencia para estudiar el impacto de distribuciones heterogeneas de bits (3/4/6/8) en modelos de 180B, comparando la calidad frente al modelo base sin cuantizar.
- Evaluacion de decodificacion especulativa con MTP: la presencia de una cabeza MTP permite experimentar con tecnicas de prediccion multi-token para reducir latencia, midiendo la tasa de aceptacion frente a la decodificacion autoregresiva clasica.
- Experimentacion con embeddings N-gram a gran escala: la tabla de 51,200B de parametros logicos en 4 bits permite investigar mecanismos de recuperacion estadistica o memoria asociativa en modelos grandes.
- Pruebas de pipelines multimodales en MLX: el modulo de vision integrado permite validar flujos de imagen y texto en el ecosistema MLX, aunque sin garantias de calidad documentadas.
- Reproduccion de cuantizaciones con oQ: el repositorio y la model card detallan la distribucion de bits, lo que facilita replicar el proceso con oMLX v0.7.4.dev1 y comparar configuraciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria unificada estimada: el checkpoint ocupa 91,491 GiB (98,238 GB) en disco; para inferencia se necesita al menos esa cantidad de memoria, mas overhead de activaciones y cache KV, por lo que en la practica se requiere un sistema con 128 GB o mas de memoria unificada o VRAM.
- GPU recomendadas: no disponible. El formato MLX esta orientado a Apple Silicon (series M1/M2/M3/M4 con memoria unificada); no se documenta soporte para GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: no cabe en ninguna GPU de consumo convencional (RTX 4090 con 24 GB, RTX 5090 con 32 GB) por el tamano del checkpoint. Requiere configuraciones de memoria unificada de gama alta en Apple Silicon o sistemas multi-GPU.
- Opciones de despliegue: MLX (libreria indicada en los metadatos). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp (este) | 180B | no disponible | MLX safetensors | no disponible | Hugging Face, 213 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | 180B | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de 180B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias
- Licencia no especificada: no se indica la licencia del checkpoint ni la del modelo base, por lo que el uso comercial queda sin garantias legales hasta confirmar los terminos en el repositorio original.
- Modelo derivado: se trata de una cuantizacion de Qwen/Qwen3.8-Flash-Next; cualquier limitacion del modelo base (sesgos, alucinaciones, idiomas) se hereda y puede amplificarse por la perdida de precision.
- Perdida de calidad por cuantizacion: el 44,739% de los pesos esta en 3 bits, lo que puede degradar tareas sensibles a precision numerica o razonamiento complejo; no se aportan evaluaciones comparativas frente al modelo sin cuantizar.
- Idiomas no documentados: se desconoce que idiomas soporta y con que calidad.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que impide planificar casos de uso con ventanas largas.
- Hardware limitado: el formato MLX restringe el despliegue a Apple Silicon; no hay soporte documentado para CUDA, ROCm o CPU generica.
- Recuantizacion reciente: la model card advierte de que el checkpoint se recuantizo el 2026-11-11; las copias anteriores pueden tener distribuciones de bits distintas y no son equivalentes.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que no es posible validar la calidad de forma objetiva.
- Riesgo de alucinacion: no cuantificado; como en cualquier modelo generativo, se recomienda verificacion humana en produccion.
- Repositorio de bajo uso: 213 descargas y 1 like en el momento de la consulta, lo que reduce la evidencia de validacion por parte de la comunidad.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
