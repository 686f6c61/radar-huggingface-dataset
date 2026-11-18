# alphaedge-ai/gemma-3-4b-it-mar-16384

## Resumen

gemma-3-4b-it-mar-16384 es una variante podada (trimmed) del modelo multimodal google/gemma-3-4b-it, publicada por alphaedge-ai. El objetivo de la poda es reducir el vocabulario del tokenizador de 262.144 a 16.384 tokens, conservando unicamente aquellos relevantes para el marati (mr), lo que rebaja el numero de parametros de 4.300.079.472 a 3.670.770.032 (un 14,63% menos) y reduce el espacio de embeddings y de la capa de salida. El modelo base es un transformer multimodal de la familia Gemma 3, disenado por Google para tareas de image-text-to-text y text-generation con contexto largo.

La relevancia de esta ficha radica en que muestra una tecnica de compresion de vocabulario aplicada a un modelo pequeno de 4B, util para despliegues en entornos con memoria limitada o para especializacion linguistica. No obstante, la model card advierte explicitamente que el rendimiento en otros idiomas puede degradarse, ya que los tokens no frecuentes en marati fueron eliminados del vocabulario. El modelo conserva la licencia Gemma y no esta afiliado ni respaldado por Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 3), derivado de google/gemma-3-4b-it |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, cuantizacion posible via transformers) |
| Idiomas soportados | marati (mr); otros idiomas pueden degradarse por la poda de vocabulario |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 7,3 GB |
| Vocabulario | 16.384 tokens (original: 262.144; reduccion del 93,75%) |
| Dataset de minado | lbourdois/fineweb-2-trimming (200.000 textos) |
| Libreria | transformers |
| Pipeline | text-generation / image-text-to-text |

## Arquitectura y entrenamiento

El modelo deriva de google/gemma-3-4b-it, un transformer multimodal de la familia Gemma 3 que procesa texto e imagenes (pipeline image-text-to-text). La intervencion de alphaedge-ai no consiste en un reentrenamiento, sino en una poda del vocabulario: se seleccionan 16.384 tokens representativos del marati a partir de 200.000 textos del dataset lbourdois/fineweb-2-trimming, y se eliminan los tokens no utilizados. Esto reduce el numero de parametros en las matrices de embeddings y en la capa de proyeccion de salida, dando como resultado un modelo un 14,63% mas pequeno (3.670.770.032 frente a 4.300.079.472 parametros).

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento original, la composicion del dataset de preentrenamiento de Gemma 3, ni sobre fases de RLHF/DPO. La model card unicamente documenta el proceso de minado y poda, no el entrenamiento del modelo base. La innovacion tecnica destacable es, por tanto, el metodo de trimming descrito en el blog de Hugging Face, que permite especializar un tokenizador multilingue a un idioma concreto con una perdida minima de rendimiento esperada en ese idioma.

## Capacidades

- Generacion de texto conversacional en marati, con plantilla de chat aplicable via apply_chat_template.
- Procesamiento multimodal image-text-to-text heredado del modelo base Gemma 3 (segun el pipeline declarado).
- Razonamiento y generacion de codigo y matematicas: capacidades heredadas del modelo base, aunque potencialmente degradadas fuera del marati por la poda del vocabulario.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues limitadas: el vocabulario podado esta optimizado para marati; otros idiomas pueden rendir peor.
- Capacidad especial de vision: si, por herencia del pipeline image-text-to-text del modelo base.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en marati: el modelo puede gestionar conversaciones multi-turno en marati con una huella de memoria menor que el modelo original, lo que abarata el despliegue en infraestructura limitada.
- Generacion de contenido editorial en marati: redaccion de articulos, resumenes y respuestas a partir de indicaciones en marati, aprovechando la plantilla de chat.
- Procesamiento de documentos con imagenes en marati: al heredar capacidades image-text-to-text, puede describir o extraer informacion de imagenes acompanadas de texto en marati.
- Despliegue en entornos con GPU de gama media: la reduccion del 14,63% de parametros y del 93,75% del vocabulario disminuye el uso de VRAM en embeddings y capa de salida, facilitando inferencia en GPUs consumer.
- Especializacion linguistica para investigacion: util como caso de estudio de la tecnica de trimming y para experimentar con modelos podados en marati.
- Prototipado rapido de asistentes conversacionales: integracion via transformers con device_map="auto" para pruebas de concepto en marati.
- Filtrado y clasificacion de texto en marati: uso del modelo para tareas de generacion condicionada y evaluacion de calidad linguistica en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones numericas con el modelo original; solo documenta las metricas de tamano y vocabulario (reduccion del 14,63% en parametros y del 93,75% en vocabulario).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 7,3 GB en safetensors, por lo que en precision bf16/fp16 se requiere aproximadamente el espacio de los pesos mas overhead de activaciones y KV cache.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano (3,67B parametros), es plausible su ejecucion en GPUs consumer, aunque no se confirma.
- Cabe en GPU consumer: probable por el tamano reducido, pero no confirmado en la informacion disponible.
- Opciones de despliegue: transformers (documentado en la model card); text-generation-inference aparece en los tags; vLLM, llama.cpp, Ollama y TGI no se confirman explicitamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-mar-16384 | 3.670.770.032 | no disponible | marati (mr) | gemma | Hugging Face (12 descargas) |
| google/gemma-3-4b-it | 4.300.079.472 | no disponible | multilingue | gemma | Hugging Face |
| Otros modelos podados de la familia Gemma 3 | no disponible | no disponible | segun idioma | gemma | Hugging Face |

La comparativa se limita al modelo base y a la variante podada; no se dispone de datos de rendimiento para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- Degradacion multilingue: la poda elimina tokens no frecuentes en marati, por lo que el rendimiento en otros idiomas puede ser inferior al del modelo original.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documenta mitigacion especifica en la model card.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base Gemma 3.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible.
- Restricciones de licencia: uso sujeto a los Gemma Terms of Use; el modelo no esta afiliado ni respaldado por Google.
- Caveat de produccion: el modelo tiene solo 12 descargas y 0 likes, lo que sugiere validacion comunitaria limitada; conviene evaluar su calidad en marati antes de desplegarlo.
- Formato: pesos en safetensors; no se documentan versiones GGUF u otras cuantizaciones preconvertidas.

## Enlaces

- Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-mar-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog de introduccion a trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso Gemma: https://ai.google.dev/gemma/terms
