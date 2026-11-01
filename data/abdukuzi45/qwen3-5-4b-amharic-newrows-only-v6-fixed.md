# abdukuzi45/qwen3.5-4b-amharic-newrows-only-v6-fixed

## Resumen

Qwen3.5-4B Amharic Adaptation es un ajuste por preentrenamiento continuo (continual pre-training) del modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario independiente abdukuzi45. El objetivo es mejorar la comprension del amharico, una lengua de bajos recursos, mediante la expansion del tokenizador con 80.000 nuevos tokens y el entrenamiento exclusivo de las capas de embedding (`embed_tokens` y `lm_head`), manteniendo congelado el resto de la red. El modelo conserva la licencia Apache 2.0 del original.

La innovacion principal es el enfoque de "Embedding-Only CPT": al congelar atencion, MLP y el codificador de vision, se evita el olvido catastrofico del ingles y de las capacidades multimodales. Segun la model card, el BPC en amharico baja de 2,6045 a 1,7394 y la precision en Belebele-Amharico sube del 50,8 % al 63,0 %, mientras que el BPC en ingles mejora ligeramente de 0,7920 a 0,7777 y los pesos del codificador visual permanecen identicos byte a byte.

El modelo tiene 5.704.181.248 parametros totales (dato de safetensors) y un tamano de repositorio de 11,4 GB. Es relevante para la comunidad de PLN africano porque demuestra que es posible adaptar un modelo denso de ~4B a un idioma de bajos recursos sin degradar el rendimiento en ingles ni la vision, con un coste de entrenamiento reducido al limitarse a las capas de embedding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), con torre de vision |
| Parametros totales | 5.704.181.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | am (amharico), en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer denso con torre de vision. El tokenizador original de 248.077 tokens se amplia a 328.077 tokens con 80.000 nuevos tokens de amharico. Durante el preentrenamiento continuo solo se entrenan `embed_tokens` y `lm_head`, aproximadamente 1.670 millones de parametros, mientras que todas las capas de atencion, MLP y el codificador de vision permanecen congeladas. En la fusion de pesos se fija `tie_word_embeddings = False` para preservar el `lm_head` entrenado de forma independiente y garantizar la generacion correcta de los nuevos tokens de amharico sin perder los pesos originales en ingles.

El dataset utilizado es `abdukuzi45/amharic-cpt-with-english-replay-v1`, un corpus de amharico con repeticion (replay) de datos en ingles para mitigar el olvido catastrofico. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO. La innovacion tecnica destacable es el congelamiento selectivo de capas, que permite adaptar el modelo a un nuevo idioma con un coste computacional muy inferior al de un ajuste completo y preserva intactas las capacidades multimodales.

## Capacidades

- Generacion de texto en amharico e ingles.
- Comprension lectora en amharico, evaluada con Belebele-Amharico (63,0 % de precision).
- Modelado de lenguaje en amharico, con BPC de 1,7394.
- Mantenimiento de las capacidades en ingles del modelo base, con BPC de 0,7777.
- Capacidades de vision preservadas: los 297 pesos del codificador visual son identicos byte a byte al modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a amharico e ingles.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en amharico: el modelo puede gestionar conversaciones multi-turno en amharico gracias a la ampliacion del tokenizador y a la mejora del BPC, adecuado para empresas que atienden a usuarios etiopes.
- Traduccion amharico-ingles: al conservar las capacidades en ingles y mejorar la comprension del amharico, puede emplearse en pipelines de traduccion automatica bidireccional.
- Analisis de documentos en amharico: la mejora en comprension lectora (Belebele-Amharico del 63,0 %) lo hace util para extraccion de informacion y resumen de textos en amharico.
- Procesamiento de texto con imagenes: al preservar la torre de vision, puede utilizarse en tareas de OCR o descripcion de imagenes con instrucciones en amharico o ingles.
- Investigacion en PLN africano: sirve como punto de partida para experimentos de adaptacion de bajo coste a otros idiomas de bajos recursos, dado que solo se entrenan las capas de embedding.
- Generacion de contenido en amharico: redaccion de textos, resumenes y respuestas en amharico para medios digitales o administraciones publicas.
- Fine-tuning posterior: al mantener intactas las capas de atencion y MLP, es una base adecuada para ajustes supervisados especificos de tarea en amharico sin partir de cero.

## Benchmarks y rendimiento

| Modelo | BPC Amharico (↓) | BPC Ingles (↓) | Belebele-Amharico (↑) |
|---|---|---|---|
| Base (Qwen3.5-4B-Base) | 2,6045 | 0,7920 | 50,8 % |
| Init (expandido, sin entrenar) | 4,2843 | 0,9476 | 22,6 % |
| Fixed (checkpoint-33500) | 1,7394 | 0,7777 | 63,0 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 11,4 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 16 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 6 GB; en 4 bits, alrededor de 3-4 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para produccion; RTX 4090 (24 GB) para inferencia en FP16 sin problema.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y, con cuantizacion, en GPUs de 8-12 GB como RTX 4070 o RTX 3060.
- Opciones de despliegue: transformers (segun el ejemplo de la model card), vLLM, TGI, llama.cpp y Ollama (estas ultimas requieren conversion a GGUF, no confirmada por el autor).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-4B Amharic Adaptation | 5,70B | no disponible | am, en | apache-2.0 | CPT solo de embeddings |
| Qwen3.5-4B-Base | ~4B (nominal) | no disponible | multilingue | apache-2.0 | Modelo base original |
| Otros modelos de adaptacion al amharico | no disponible | no disponible | am | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables especificos de adaptacion al amharico en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo ha sido entrenado en las capas de embedding; las capas de atencion y MLP no se han adaptado al amharico, lo que puede limitar la calidad en tareas que requieran razonamiento profundo en ese idioma.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de factualidad.
- La longitud de contexto no esta documentada; se desconoce si se mantiene la del modelo base.
- El soporte linguistico se limita a amharico e ingles; no se ha evaluado su rendimiento en otras lenguas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye "tal cual".
- El modelo tiene 99 descargas y 0 likes en el momento de la ficha, lo que indica una validacion comunitaria muy limitada.
- No se han publicado datos sobre sesgos, robustez ni comportamiento en produccion.
- El proceso de fusion con `tie_word_embeddings = False` es especifico de este checkpoint; replicar el entrenamiento requiere cuidado para no romper la generacion de los nuevos tokens.

## Enlaces

- HuggingFace: https://huggingface.co/abdukuzi45/qwen3.5-4b-amharic-newrows-only-v6-fixed
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset: https://huggingface.co/datasets/abdukuzi45/amharic-cpt-with-english-replay-v1
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
