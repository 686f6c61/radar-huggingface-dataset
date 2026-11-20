# InterpreticAI/Qwen3.8-27B-Uncensored-v3-MLX-4bit

## Resumen

Qwen3.8-27B-Uncensored-v3-MLX-4bit es una cuantizacion en 4 bits para Apple Silicon (formato MLX) del modelo Qwen3.8-27B-Uncensored-v3, publicado por InterpreticAI. Se trata de un ajuste fino de NousResearch/Arete-27B, que a su vez es una version post-entrenada de Qwen/Qwen3.8-27B. El objetivo declarado del autor es eliminar la censura politica residual que persiste en Arete-27B, especialmente en preguntas politicas formuladas en chino, donde el modelo base todavia censura aproximadamente la mitad de sus respuestas.

El modelo conserva la arquitectura y el diseno de pesos de Arete-27B (sin capa de prediccion multi-token, MTP) y anade capacidad de entrada de imagen, por lo que se distribuye con pipeline image-text-to-text. Los pesos del modelo de lenguaje estan cuantizados a 4 bits con tamano de grupo 64, mientras que el codificador visual se mantiene en BF16. El repositorio ocupa 16,1 GB, lo que permite ejecutarlo en un Mac con 32 GB o mas de memoria unificada.

La relevancia de esta ficha es doble: por un lado, documenta una variante de despliegue local para hardware Apple; por otro, ilustra un caso de ajuste orientado a reducir sesgos de censura estatal, con una evaluacion cuantitativa publicada por el autor sobre un banco de 115 preguntas politicas sensibles en chino y sobre el conjunto Propaganda_Eval de Nous Research.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (hereda la de Qwen3.8-27B / Arete-27B); sin capa MTP |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (group size 64) para el modelo de lenguaje; codificador visual en BF16 |
| Idiomas soportados | no disponible (la evaluacion cubre ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards: model-00001-of-00003 a model-00003-of-00003), libreria MLX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen3.8-27B, un transformer decoder-only de 27,36 mil millones de parametros, y hereda el post-entrenamiento de NousResearch/Arete-27B. Arete-27B ya reduce de forma drastica la propaganda en indicaciones en ingles, pero mantiene censura en aproximadamente la mitad de las respuestas a preguntas politicas en chino. Uncensored-v3 se presenta como un checkpoint completo en BF16 con la misma arquitectura y disposicion de ficheros que Arete-27B, entrenado para eliminar casi toda esa censura residual.

La version MLX-4bit se obtiene cuantizando el checkpoint BF16 de Uncensored-v3; la evaluacion publicada por el autor se ejecuto sobre la release BF16, no sobre esta cuantizacion. El modelo no incluye capa de prediccion multi-token (MTP), a diferencia de la variante Uncensored-v2, por lo que debe servirse con decodificacion estandar. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO en esta iteracion.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Entrada de imagen (pipeline image-text-to-text), con codificador visual en BF16.
- Razonamiento en modo thinking y modo non-thinking, con parametros de muestreo recomendados distintos para cada uno.
- Respuestas a preguntas politicas sin censura estatal en chino e ingles, segun la evaluacion del autor.
- Capacidad multilingue: la evaluacion cubre ingles y chino; el resto de idiomas no esta documentado.
- No se documenta soporte explicito de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Sin decodificacion especulativa MTP.

## Casos de uso

- Analisis de discurso politico en chino: el modelo responde abiertamente a preguntas sobre politicas del PCC, lo que permite usarlo como herramienta de investigacion para estudiar narrativas y comparar marcos oficiales frente a alternativas.
- Investigacion sobre censura y alineamiento: util para reproducir experimentos tipo Pan y Xu (2026) y medir el efecto de tecnicas de des-censura sobre un modelo base conocido.
- Despliegue local en Mac para prototipado: con 16,1 GB de pesos en 4 bits y MLX, se puede ejecutar en un Mac con 32 GB de memoria unificada mediante mlx-vlm, oMLX o LM Studio, sin GPU dedicada.
- Servidor compatible con OpenAI en estacion de trabajo Apple: cargando el repositorio en oMLX o LM Studio se expone una API local para integrar el modelo en aplicaciones internas.
- Descripcion y analisis de imagenes: la entrada multimodal permite tareas de captioning o extraccion de informacion de documentos escaneados, aunque sin benchmarks publicados de calidad visual.
- Generacion de contenido editorial sin filtros de sesgo estatal: redaccion de articulos o informes donde el modelo base censuraria ciertos temas, con revision humana posterior.
- Evaluacion comparativa de sesgos: usar las mismas 115 preguntas politicas del autor para contrastar el comportamiento de otros modelos.

## Benchmarks y rendimiento

Evaluacion de censura politica en chino (Pan y Xu, 2026; 115 preguntas sensibles, limite de 4096 tokens de salida, modo non-thinking, decodificacion greedy). Los resultados corresponden al checkpoint BF16 de Uncensored-v3, no a esta cuantizacion MLX:

| Metrica | Qwen3.8-27B | Arete-27B | Uncensored-v3 |
|---|---|---|---|
| Respuestas censuradas (menor es mejor) | 83,5% | 50,4% | 2,6% |
| Rechaza o evade (menor es mejor) | 49,6% | 22,6% | 0,9% |
| Reescribe con talking points del PCC (menor es mejor) | 32,2% | 27,8% | 1,7% |
| Se alinea con valores del PCC (menor es mejor) | 100% | 30% | 20% |
| Tema correcto y respuesta abierta (mayor es mejor) | 12,2% | 38,3% | 80,9% |

Evaluacion de propaganda en ingles (NousResearch/Propaganda_Eval, 803 indicaciones, scripts de grading originales):

| Modelo | Respuestas con propaganda (menor es mejor) |
|---|---|
| Qwen3.8-27B | 24,5% |
| Arete-27B | 1,0% |
| Qwen3.8-27B-Uncensored-v3 | 0,5% |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 15-16 GB para los pesos en 4 bits; se recomienda un Mac con 32 GB de memoria unificada o mas.
- GPU compatibles: exclusivamente Apple Silicon (MLX). No es un formato para CUDA.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente; no esta pensado para RTX 4090, A100 ni H100 en este formato.
- Opciones de despliegue: mlx-vlm (CLI y libreria), oMLX (servidor compatible con OpenAI), LM Studio.
- Latencia y throughput: no disponibles. El modelo no incluye MTP, por lo que no admite decodificacion especulativa y debe servirse con decodificacion estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Censura politica en chino | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v3-MLX-4bit | 27,36 B | no disponible | 2,6% (medido en BF16) | Apache 2.0 | MLX 4-bit safetensors |
| Qwen3.8-27B-Uncensored-v3 (BF16) | 27,36 B | no disponible | 2,6% | Apache 2.0 | safetensors BF16 |
| Qwen3.8-27B-Uncensored-v2 | no disponible | no disponible | 3,5% | Apache 2.0 | BF16, FP8, GGUF |
| NousResearch/Arete-27B | 27 B (heredado) | no disponible | 50,4% | Apache 2.0 | safetensors |
| Qwen/Qwen3.8-27B | 27,36 B | no disponible | 83,5% | Apache 2.0 | safetensors |

La variante v2 incorpora MTP y FP8, lo que la hace preferible si se necesita decodificacion especulativa o despliegue en CUDA; la v3 prioriza la menor tasa de censura. Frente a Arete-27B y Qwen3.8-27B, la diferencia principal es la tasa de respuestas censuradas, no el rendimiento general, que no se ha publicado.

## Limitaciones y advertencias

- Cada modelo se genero una sola vez por benchmark; no hay intervalos de confianza ni repeticiones.
- Una respuesta sustantiva no implica que sea correcta: el autor recomienda verificar las afirmaciones factuales de forma independiente.
- Riesgo de alucinacion no cuantificado; no hay benchmarks de factualidad publicados.
- La evaluacion se hizo sobre el checkpoint BF16, no sobre esta cuantizacion 4-bit, por lo que puede haber degradacion no medida.
- El sesgo se ha medido solo en dos ejes (censura politica en chino y propaganda en ingles); no hay datos sobre otros sesgos (genero, raza, religion) ni sobre idiomas distintos del ingles y el chino.
- Longitud de contexto no documentada; no se debe asumir una ventana concreta sin consultar config.json.
- Sin MTP: no admite decodificacion especulativa, lo que limita el throughput en comparacion con v2.
- Licencia Apache 2.0 permite uso comercial, pero se deben conservar la atribucion de Nous Research y del equipo Qwen segun el fichero LICENSE.
- El proposito declarado es eliminar filtros de censura estatal; su uso en produccion debe considerar requisitos regulatorios y de politica de contenido aplicables.
- Formato exclusivo para Apple Silicon: no desplegable en CUDA sin reconvertir pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-MLX-4bit
- Checkpoint BF16 de referencia: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Variante v2: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-Uncensored-v2 (referenciada como InterpreticAI/Qwen3.8-27B-Uncensored-v2)
- GGUF Q4_K_M de v3: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-GGUF
- GGUF IQ3_XXS de v3: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-IQ3_XXS-GGUF
- Modelo base Arete: https://huggingface.co/NousResearch/Arete-27B
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de evaluacion: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- oMLX: https://github.com/jundot/omlx
- mlx-vlm: no disponible como enlace directo en la informacion proporcionada
- Paper de referencia: Pan, J., & Xu, X. (2026). Political censorship in large language models originating from China. PNAS Nexus, 5(2), pgag013. https://doi.org/10.1093/pnasnexus/pgag013
- Blog de Nous Research sobre Arete: https://nousresearch.com/arete
- DOI del modelo: https://doi.org/10.57967/hf/11540
