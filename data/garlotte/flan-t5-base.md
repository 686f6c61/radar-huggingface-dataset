# Garlotte/flan-t5-base

## Resumen

FLAN-T5 base es un modelo de lenguaje encoder-decoder basado en la arquitectura T5, desarrollado originalmente por Google Research y publicado en el paper "Scaling Instruction-Finetuned Language Models" (Chung et al., 2022). Esta ficha concreta corresponde al repositorio `Garlotte/flan-t5-base`, un espejo del checkpoint oficial `google/flan-t5-base` con 247.577.856 parametros reales verificados en safetensors. El modelo resuelve tareas de generacion texto-a-texto mediante instrucciones en lenguaje natural, siguiendo el paradigma de instruction tuning que popularizo la familia FLAN.

La relevancia de FLAN-T5 base radica en que demuestra que el ajuste fino por instrucciones sobre un modelo preentrenado de tamano moderado (unos 250 millones de parametros) produce mejoras sustanciales en tareas de razonamiento zero-shot y few-shot frente al T5 base equivalente. Fue entrenado sobre mas de 1000 tareas adicionales que cubren multiples idiomas, lo que lo convierte en una referencia habitual para evaluar pipelines de instruction following en entornos con recursos limitados.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y esta disponible en formatos PyTorch, TensorFlow, JAX y safetensors. Su ventana de contexto es de 512 tokens, una limitacion importante para aplicaciones modernas de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | 247.577.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el modelo soporta carga en FP32, FP16 e INT8 via bitsandbytes segun los ejemplos de la model card) |
| Idiomas soportados | en, fr, ro, de, multilingual (la model card lista ademas es, ja, fa, hi, zh, bn, gu, te, it, ar, pl, ta, mr, ml, or, pa, pt, ur, gl, he, ko, ca, th, nl, id, vi, bg, fil, km, lo, tr, ru, hr, sv, yo, ku, my, ms, cs, fi, so, tl, sw, si, kn, za, ig, xh, ht, et, sk, lt, el, ne, as, no) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch (pytorch_model.bin), TensorFlow, JAX |

## Arquitectura y entrenamiento

FLAN-T5 base emplea la arquitectura T5 estandar: un transformer encoder-decoder con atencion multi-cabeza completa, normalizacion RMSNorm y embeddings relativos de posicion. El modelo base T5 fue preentrenado con un objetivo span corruption sobre el dataset C4. Posteriormente, el checkpoint FLAN-T5 se obtuvo mediante instruction fine-tuning sobre una mezcla de mas de 1000 tareas, incluyendo datasets como QReCC, Taskmaster2, WikiDialog, Code Contests, LAMBADA, GSM8K, AQuA-RAT, e-SNLI, QuASC y QED, segun los tags del repositorio.

El entrenamiento sigue el paradigma de instruction tuning descrito en el paper de 2022: se combinan tareas de razonamiento (chain-of-thought, respuesta directa), clasificacion, generacion y traduccion, con instrucciones en lenguaje natural. No se documenta en la informacion disponible el uso de RLHF o DPO. La innovacion principal del modelo es demostrar que el instruction tuning generaliza a tareas no vistas y mejora el rendimiento few-shot incluso en modelos de tamano moderado.

## Capacidades

- Generacion de texto texto-a-texto condicionada por instrucciones en lenguaje natural.
- Razonamiento logico y matematico basico (el widget de la model card incluye ejemplos de razonamiento booleano, aritmetica y preguntas cientificas).
- Traduccion automatica entre los idiomas listados (ejemplo oficial: "Translate to German: My name is Arthur").
- Respuesta a preguntas de conocimiento cientifico y factual.
- Tareas de inferencia de lenguaje natural (NLI) y entailment (ejemplo con premisa e hipotesis).
- Clasificacion yes/no con razonamiento paso a paso.
- Capacidades multilingues limitadas a los idiomas vistos durante el entrenamiento.
- No se documenta soporte explicito de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Traduccion automatica ligera en produccion: el modelo puede traducir entre los idiomas europeos listados (en, fr, de, ro y otros) con un consumo de recursos minimo, adecuado para pipelines de bajo coste o edge computing.
- Clasificacion de texto y analisis de sentimiento: al ser texto-a-texto, se puede formular como "Classify the sentiment of this review: ..." y obtener la etiqueta directamente, util para moderacion de contenido o triaje de tickets.
- Respuesta a preguntas sobre documentacion tecnica: con contexto de hasta 512 tokens, sirve para QA extractivo sobre fragmentos cortos de manuales, FAQ o articulos, integrado en un sistema RAG que trocee los documentos.
- Generacion de resumenes cortos: resumir parrafos o abstracts de papers dentro del limite de contexto, por ejemplo en un pipeline de curacion de noticias.
- Inferencia de lenguaje natural (NLI): detectar contradicciones o entailment entre premisa e hipotesis en sistemas de verificacion de hechos o control de calidad de traducciones.
- Razonamiento aritmetico basico en entornos educativos: resolver problemas de primaria o secundaria formulados como instrucciones, con la salvedad de que el modelo no es fiable en matematicas complejas.
- Prototipado rapido de tareas NLP: gracias a su tamano reducido y licencia Apache 2.0, es adecuado para validar ideas de instruction following antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este repositorio en la informacion disponible. El paper de referencia (arXiv:2210.11416) reporta resultados para la familia FLAN-T5 completa, pero no se incluyen cifras concretas para el checkpoint base en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP32 (247M parametros x 4 bytes), unos 500 MB en FP16 y alrededor de 250 MB en INT8.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe en GTX 1650, RTX 3060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos 8 anos.
- Opciones de despliegue: transformers (PyTorch, TensorFlow, JAX), vLLM, TGI, llama.cpp (via conversion a GGUF), Ollama (via importacion de GGUF), ONNX Runtime.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia de decenas de milisegundos por token en GPU consumer, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| FLAN-T5 base (este) | 247M | 512 | Apache 2.0 | Instruction tuned sobre +1000 tareas, multilingue |
| T5 base | 220M | 512 | Apache 2.0 | Preentrenado sin instruction tuning; peor rendimiento zero-shot |
| FLAN-T5 large | 780M | 512 | Apache 2.0 | Misma familia, mayor capacidad y coste |
| FLAN-T5 small | 77M | 512 | Apache 2.0 | Version reducida para entornos muy limitados |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para cuantificar las diferencias mas alla de la descripcion cualitativa del paper.

## Limitaciones y advertencias

- Ventana de contexto de solo 512 tokens: inadecuado para documentos largos o conversaciones multi-turno extensas sin troceado previo.
- Riesgo de alucinacion en preguntas factuales, especialmente fuera de los dominios cubiertos por el entrenamiento.
- Sesgos heredados de los datos de preentrenamiento (C4) y de las tareas de instruction tuning; no se documenta una evaluacion de sesgos especifica para este checkpoint.
- Capacidad matematica y de razonamiento limitada: los ejemplos de la model card son demostrativos, no garantizan precision en problemas complejos.
- Cobertura multilingue desigual: aunque lista decenas de idiomas, el rendimiento en idiomas de bajos recursos puede ser notablemente inferior.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de los datasets de entrenamiento originales.
- No soporta tool calling, agentes ni modos de razonamiento extendido, lo que limita su uso en arquitecturas agenticas modernas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un espejo no oficial; para produccion se recomienda usar el checkpoint oficial `google/flan-t5-base`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Garlotte/flan-t5-base
- Checkpoint oficial: https://huggingface.co/google/flan-t5-base
- Paper de referencia: https://arxiv.org/pdf/2210.11416.pdf
- Repositorio GitHub de T5X: https://github.com/google-research/t5x
- Documentacion de Transformers para T5: https://huggingface.co/docs/transformers/model_doc/t5
- Listado de checkpoints FLAN-T5: https://huggingface.co/models?search=flan-t5
- Checkpoints originales en T5X: https://github.com/google-research/t5x/blob/main/docs/models.md#flan-t5-checkpoints
