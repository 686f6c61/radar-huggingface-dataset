# patronus-studio/tiger-guard-content-moderation

## Resumen

Tiger Guard es un clasificador binario de moderación de contenido desarrollado por Patronus Studio, diseñado para etiquetar texto como `SAFE` o `UNSAFE` tanto en entradas de usuario (prompts) como en salidas de modelos de lenguaje. Se construye mediante fine-tuning del modelo base jhu-clsp/mmBERT-base, un encoder multilingüe de la familia ModernBERT, y está orientado a servir como capa de guardrails en aplicaciones LLM y en plataformas con contenido generado por usuarios. Su relevancia radica en que ofrece una alternativa ligera y desplegable en local (con variantes ONNX cuantizadas int8 e int4) frente a soluciones de moderación basadas en APIs propietarias, manteniendo la inferencia en hardware propio.

El modelo cubre dos grandes categorías de contenido inseguro: lenguaje abusivo (toxicidad, odio contra grupos protegidos, insultos, blasfemias, amenazas, sexismo, acoso sexual y texto sexualmente explícito) y peticiones o respuestas peligrosas en conversaciones con LLM (ayuda para delitos, armas, autolesiones o datos privados de terceros). Está entrenado explícitamente para mantener como `SAFE` la contraargumentación, la cita de abuso con fines de denuncia y las menciones neutras a colectivos.

Con 307.531.778 parámetros totales y un repositorio de 4,4 GB, Tiger Guard se posiciona como un clasificador de tamaño medio, más pesado que los modelos de moderación basados en BERT-base o DeBERTa-v3-base, pero con soporte nativo de inglés y alemán y formatos optimizados para CPU y despliegue on-device.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-base) para clasificación de secuencias binaria |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX int8 e int4 (además de safetensors en precisión completa) |
| Idiomas soportados | Inglés (en) y alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (con variantes cuantizadas int8 e int4) |

## Arquitectura y entrenamiento

Tiger Guard es un modelo de clasificación de secuencias (`sequence-classification`) construido sobre jhu-clsp/mmBERT-base, un encoder de la familia ModernBERT adaptado al multilingüismo. La tarea es una clasificación binaria (`binary-classification`) que devuelve `SAFE` o `UNSAFE`. El modelo se distribuye tanto en safetensors para uso con Transformers como en formato ONNX con cuantizaciones int8 e int4, lo que permite inferencia en CPU y en dispositivos sin GPU. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; únicamente se indica que el entrenamiento parte del modelo base mmBERT y que se evalúa sobre conjuntos como HateCheck, Intuit toxicity/profanity, Aegis AI Content Safety 1.0 y PolyGuardPrompts.

La innovación principal no reside en la arquitectura, sino en el enfoque de producto: un único clasificador que cubre simultáneamente moderación de lenguaje abusivo y seguridad de prompts/respuestas en aplicaciones LLM, con énfasis explícito en reducir falsos positivos sobre contraargumentación y citas de abuso. El soporte de cuantización int8 e int4 en ONNX está orientado a despliegues de baja latencia en CPU y entornos on-device.

## Capacidades

- Clasificación binaria de contenido: etiqueta texto como `SAFE` o `UNSAFE`.
- Detección de lenguaje abusivo: toxicidad, odio contra grupos protegidos, insultos, blasfemias, amenazas, sexismo, acoso sexual y contenido sexualmente explícito.
- Moderación de prompts y respuestas en aplicaciones LLM: peticiones de ayuda para delitos, armas, autolesiones o datos privados de terceros.
- Moderación de texto generado por usuarios (comentarios, mensajes, publicaciones).
- Soporte multilingüe limitado a inglés y alemán.
- Manejo correcto de contraargumentación, citas de abuso con fines de denuncia y menciones neutras a colectivos (deben permanecer `SAFE`).
- Inferencia local en CPU y on-device gracias a las variantes ONNX int8 e int4.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido; es un clasificador, no un modelo generativo.

## Casos de uso

- Moderación de prompts en aplicaciones LLM: colocar Tiger Guard como filtro de entrada antes de enviar la petición al modelo generativo, bloqueando solicitudes de ayuda para delitos, armas o autolesiones. Su precisión del 93,18% y su tasa de falsos positivos del 6,13% en el benchmark de contenido lo hacen adecuado para esta capa.
- Moderación de respuestas de LLM: ejecutar el clasificador sobre la salida del modelo antes de mostrarla al usuario, como guardrail de respuesta en producción. La etiqueta `UNSAFE` permite bloquear, reescribir o derivar a revisión humana.
- Moderación de comentarios en plataformas UGC: clasificar comentarios de usuarios en foros, redes o secciones de noticias, detectando insultos, amenazas y acoso en inglés y alemán con una sola pasada de inferencia.
- Filtrado previo en pipelines de anotación humana: usar el clasificador para preetiquetar grandes volúmenes de texto y priorizar la revisión manual de los casos `UNSAFE`, reduciendo el coste de moderación.
- Despliegue on-device o en CPU: gracias a las variantes ONNX int8 e int4, puede integrarse en aplicaciones de escritorio, móviles o entornos sin GPU para moderación en tiempo real sin enviar datos a servicios externos.
- Cumplimiento y trust & safety: servir como componente auditable en flujos de cumplimiento normativo, ya que la inferencia es local y la licencia Apache 2.0 permite inspección y adaptación del modelo.
- Protección de menores en comunidades online: detectar contenido sexualmente explícito y acoso en entornos moderados en inglés y alemán, con la ventaja de que la contraargumentación y las citas de denuncia no se marcan como inseguras.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Conjunto de evaluación | Métrica | Valor |
|---|---|---|
| Content-safety benchmark, 1.500 prompts (HateCheck, Intuit toxicity/profanity, Aegis 1.0) | Accuracy | 0,888 |
| Content-safety benchmark, 1.500 prompts | Recall (unsafe prompts caught) | 0,8373 |
| Content-safety benchmark, 1.500 prompts | Precision | 0,9318 |
| Content-safety benchmark, 1.500 prompts | F1 | 0,882 |
| Content-safety benchmark, 1.500 prompts | False positive rate (harmless prompts flagged) | 0,0613 |
| Content-safety benchmark, 1.500 prompts | AUROC | 0,957 |
| HateCheck (500 test cases, balanced) | Accuracy | 0,922 |
| HateCheck (500 test cases, balanced) | AUROC | 0,972 |
| Intuit combined toxicity and profanity (500 validation, balanced) | Accuracy | 0,908 |
| Intuit combined toxicity and profanity (500 validation, balanced) | AUROC | 0,99 |
| Aegis AI Content Safety 1.0 (500 test, balanced) | Accuracy | 0,834 |
| Aegis AI Content Safety 1.0 (500 test, balanced) | AUROC | 0,925 |
| PolyGuardPrompts, inglés (held-out test, 3.123 prompts) | Recall (harmful prompts caught) | 0,8328 |
| PolyGuardPrompts, inglés | False positive rate | 0,0381 |
| PolyGuardPrompts, alemán | Recall (harmful prompts caught) | 0,7529 |
| PolyGuardPrompts, alemán | False positive rate | 0,055 |
| Held-out validation set, inglés (28.996 textos) | Recall (unsafe texts caught) | 0,8034 |
| Held-out validation set, inglés | False positive rate | 0,0379 |
| Held-out validation set, alemán | Recall (unsafe texts caught) | 0,6422 |
| Held-out validation set, alemán | False positive rate | 0,0436 |

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (safetensors, ~307 M parámetros), aproximadamente 1,2-1,5 GB en fp32 y ~0,6-0,8 GB en fp16. Las variantes ONNX int8 e int4 reducen el peso a rangos del orden de cientos de MB o menos, aunque el autor no publica cifras exactas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp16; una RTX 4090, A100 o H100 ofrece throughput muy alto pero está sobredimensionada para un encoder de 307 M. Para producción en GPU, una T4 o L4 es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en iGPU y CPU gracias a las variantes ONNX cuantizadas.
- Opciones de despliegue: Transformers (safetensors), ONNX Runtime (int8/int4), y compatibilidad con Text Embeddings Inference y endpoints según los tags del repositorio. No se documenta soporte explícito de vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Tiger Guard (patronus-studio) | 307,5 M | no disponible | en, de | Apache 2.0 | safetensors, ONNX int8/int4 | Clasificador binario SAFE/UNSAFE para prompts, respuestas y UGC |
| Llama Guard (Meta) | no disponible en la información | no disponible | multilingüe | Llama license | safetensors | Guardrail generativo basado en LLM; más pesado y con licencia restrictiva |
| ShieldGemma (Google) | no disponible en la información | no disponible | inglés principalmente | Gemma license | safetensors | Guardrail generativo; requiere GPU y licencia con restricciones |
| Modelos de toxicidad basados en BERT-base/DeBERTa | ~110-180 M | 512 tokens típicamente | inglés | variable | safetensors, ONNX | Más ligeros, pero generalmente monolingües y centrados solo en toxicidad |

La comparativa con Llama Guard y ShieldGemma se ofrece como referencia cualitativa de categoría; los datos concretos de parámetros y contexto de esos modelos no están disponibles en la información proporcionada y no se afirman aquí.

## Limitaciones y advertencias

- Solo soporta inglés y alemán; el rendimiento en otros idiomas no está garantizado y no se ha evaluado.
- El recall en alemán es notablemente inferior al inglés: 0,6422 en el conjunto de validación held-out y 0,7529 en PolyGuardPrompts, frente a 0,8034 y 0,8328 en inglés. En producción en alemán se espera una tasa de detección menor.
- Tasa de falsos positivos no despreciable: 6,13% en el benchmark agregado de contenido y hasta 5,5% en alemán en PolyGuardPrompts. Puede bloquear contenido legítimo, especialmente en dominios con lenguaje coloquial o citas.
- Es un clasificador binario: no distingue categorías de daño ni proporciona explicaciones; la etiqueta `UNSAFE` no indica el motivo.
- Riesgo de alucinación no aplicable en sentido generativo (no genera texto), pero sí existe riesgo de clasificaciones erróneas en casos límite, sarcasmo, ironía o contextos culturales.
- Sesgos conocidos: no documentados explícitamente por el autor; al entrenarse sobre datasets como HateCheck, Intuit y Aegis, puede heredar sesgos de anotación de esas fuentes.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, pero el autor no ofrece garantías ni asume responsabilidad por fallos de moderación.
- No se documenta la longitud máxima de contexto; para textos largos puede ser necesario truncar o dividir en fragmentos.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en la model-index).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica adopción aún muy limitada y ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/patronus-studio/tiger-guard-content-moderation
- Página de producto de Patronus Studio: https://patronus.studio/product/ai-models
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
- HateCheck: https://huggingface.co/datasets/Paul/hatecheck
- Intuit combined toxicity and profanity: https://huggingface.co/datasets/Intuit-GenSRF/combined_toxicity_profanity_v2_train_eval
- Aegis AI Content Safety 1.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-1.0
- PolyGuardPrompts: https://huggingface.co/datasets/ToxicityPrompts/PolyGuardPrompts
