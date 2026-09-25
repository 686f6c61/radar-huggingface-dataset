# nishparadox/gliner2.5-decide-onnx

## Resumen

GLiNER2.5-Decide (ONNX) es una exportación no oficial a formato ONNX de la ruta de clasificación del modelo fastino/GLiNER2.5-Decide, publicada por el usuario nishparadox. El modelo original lo desarrolla Fastino y es un encoder basado en DeBERTa-v3-large (aproximadamente 340 millones de parámetros) post-entrenado específicamente para toma de decisiones estructurada: evalúa preguntas tipadas definidas por el usuario y decodifica respuestas conjuntamente bajo restricciones explícitas, devolviendo decisiones estructuradas con probabilidades. Esta conversión permite inferencia sin PyTorch usando exclusivamente onnxruntime, tokenizers y numpy.

La relevancia de esta ficha concreta radica en que traslada el modelo a un runtime ONNX, lo que reduce la latencia en CPU y elimina la dependencia de la pila de PyTorch. La exportación cubre únicamente las tareas de clasificación (etiqueta única, multi-etiqueta y ordinal); la extracción de spans, relaciones y estructuras no está incluida. Se ofrece en tres precisiones: fp32 (exacta respecto a la versión torch), fp16 (orientada a GPU) e int8 dinámica (con pérdida de precisión pero aproximadamente el doble de rápida en CPU).

El modelo original fue publicado el 24 de septiembre de 2026 bajo licencia Apache 2.0 y está pensado para tareas de enrutamiento y guardrails en CPU, sin necesidad de GPU. Esta conversión hereda la licencia Apache 2.0 y admite únicamente inglés. El repositorio ocupa 3.3 GB en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (DeBERTa-v3-large) con cabeza de clasificación |
| Parametros totales | ~340 M (modelo base fastino/GLiNER2.5-Decide) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, int8 (cuantización dinámica, QInt8) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (model.onnx fp32, model_fp16.onnx, model_int8.onnx) |
| Tamano del repositorio | 3.3 GB |
| Libreria de inferencia | onnxruntime |
| Pipeline | text-classification |
| Modelo base | fastino/GLiNER2.5-Decide |
| Opset ONNX | 17 |
| Grafo | (input_ids int64 [B,S], attention_mask int64 [B,S], label_positions int64 [B,N]) -> logits float32 [B,N] |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder DeBERTa-v3-large con una cabeza de clasificación. El modelo original fue post-entrenado por Fastino para toma de decisiones estructurada bajo restricciones, devolviendo decisiones con probabilidades, puntuaciones de confianza y metadatos de viabilidad. Esta conversión ONNX se ha generado con `torch.onnx.export` (opset 17); la variante fp16 se obtuvo mediante `onnxruntime.transformers.float16` manteniendo entradas y salidas en fp32, y la variante int8 mediante `onnxruntime.quantization.quantize_dynamic` con pesos QInt8.

El grafo recibe `input_ids`, `attention_mask` y `label_positions`, y produce un logit por cada marcador de etiqueta `[L]`. Para tareas de etiqueta única u ordinal debe aplicarse softmax sobre las etiquetas de la tarea, y para multi-etiqueta una sigmoide. El tokenizador `tokenizer.json` es el de DeBERTa-v3 con los tokens marcadores propios de gliner2 (`[P]`, `[L]`, etc.). Los paréntesis `(` y `)` están reservados en nombres de tarea, etiquetas, descripciones e instrucciones. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Clasificación de texto en tres regímenes: etiqueta única, multi-etiqueta y ordinal.
- Evaluación de preguntas tipadas definidas por el usuario (esquemas de tareas con nombres, etiquetas y descripciones).
- Decodificación conjunta de respuestas bajo restricciones explícitas, devolviendo probabilidades por etiqueta.
- Soporte de esquemas multi-tarea en una sola pasada (el ejemplo del autor usa 7 tareas y 21 etiquetas simultáneamente).
- Construcción de prompts mediante tokens marcadores (`[P]`, `[L]`) gestionados por el tokenizador incluido.
- Inferencia sin PyTorch, únicamente con onnxruntime, tokenizers y numpy, en CPU o GPU.
- Aplicaciones de guardrails y enrutamiento de contenido (por ejemplo, detección de violencia o PII, clasificación de severidad).
- No soporta extracción de spans, relaciones ni estructuras (solo se exporta la ruta de clasificación).
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Guardrails de contenido en producción: el modelo puede clasificar entradas de usuario según esquemas de seguridad definidos (violencia, PII, etc.) con probabilidades por etiqueta, integrándose como filtro previo a un LLM generativo. El ejemplo del autor ilustra la detección conjunta de violencia y PII sobre una misma frase.
- Enrutamiento de consultas en atención al cliente: clasificar cada mensaje entrante en categorías mutuamente excluyentes (facturación, soporte técnico, cancelación) para dirigirlo al flujo o agente adecuado, con latencias de decenas de milisegundos en CPU.
- Clasificación de severidad de incidencias: usando la tarea ordinal del ejemplo (`none`, `minor`, `serious`, `severe`), el modelo ordena el contenido por gravedad, útil en sistemas de moderación o triaje de tickets.
- Moderación de contenido en plataformas: evaluar textos contra múltiples categorías de política (multi-etiqueta) en una sola pasada, sin depender de GPU.
- Anonimización y cumplimiento: detección de PII (correos, teléfonos) como paso previo a la redacción automática o al registro de conversaciones en sistemas con requisitos de privacidad.
- Triaje de documentación o correos: esquemas con varias tareas simultáneas (idioma, tema, urgencia) aplicados por lotes en servidores CPU de bajo coste, aprovechando el rendimiento de la variante int8.
- Servicios de clasificación de bajo coste en el borde (edge): al no requerir PyTorch ni GPU, el modelo puede empaquetarse en contenedores ligeros para despliegues en CPU con onnxruntime.

## Benchmarks y rendimiento

Resultados del modelo base fastino/GLiNER2.5-Decide reportados en la información disponible:

| Benchmark | Resultado | Comparativa |
|---|---|---|
| Fast Decisions suite (17 datasets, precisión media) | 60,1 % | JevK5: 57,5 % |
| Latencia (48 núcleos CPU, sin GPU) | 167 ms | no disponible |

Paridad y latencia de esta conversión ONNX, verificada frente a `gliner2==2.0.0` sobre 6 textos (incluyendo cadena vacía, URL y correo) con un esquema de 7 tareas:

| | 1 tarea multi-etiqueta (3 etiquetas) | 7 tareas (21 etiquetas) |
|---|---|---|
| gliner2 (torch) | 148 ms | 376 ms |
| fp32 | 88 ms | 357 ms |
| fp16 | 175 ms | 436 ms |
| int8 | 43 ms | 179 ms |

Diferencias máximas de probabilidad respecto a gliner2 (torch): fp32 `0.00000` (exacta), fp16 `≤ 0.001`, int8 `hasta 0.18`. Las latencias corresponden a CPU Apple Silicon, 8 hilos, mediana de 20 ejecuciones, incluyendo tokenización.

## Requisitos de hardware

- VRAM estimada para inferencia: fp32 ~1,75 GB de pesos; fp16 ~874 MB; int8 ~643 MB. Añadir memoria para activaciones y lote.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. La variante fp16 está pensada para GPU; en CPU resulta más lenta que fp32.
- Compatibilidad con GPU de consumo: el modelo (340 M de parámetros) cabe holgadamente en GPUs de consumo con fp16 o int8, aunque no se indican modelos concretos.
- Ejecución en CPU: viable sin GPU. Reportado a 167 ms en un procesador de 48 núcleos (modelo base) y 43–357 ms en Apple Silicon de 8 hilos según tarea y precisión.
- Opciones de despliegue: onnxruntime (CPU o GPU) con tokenizers y numpy; el repositorio incluye un runtime de referencia (`gliner_onnx.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de la sección anterior. La variante int8 es aproximadamente 2 veces más rápida en CPU que fp32, con pérdida de precisión de hasta 0,18 en probabilidades.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nishparadox/gliner2.5-decide-onnx (esta ficha) | ~340 M (base) | no disponible | Paridad exacta con gliner2 en fp32 | apache-2.0 | HuggingFace, ONNX |
| fastino/GLiNER2.5-Decide (base) | ~340 M | no disponible | 60,1 % en Fast Decisions suite | apache-2.0 | HuggingFace |
| JevK5 | no disponible | no disponible | 57,5 % en Fast Decisions suite | no disponible | no disponible |

No se dispone de información suficiente para comparar con otras alternativas de clasificación de la misma categoría (tamaño, contexto o licencia). Los datos de JevK5 provienen únicamente de la comparativa publicada por Fastino.

## Limitaciones y advertencias

- Es una conversión no oficial: todos los créditos del modelo corresponden a Fastino; se distribuye bajo la licencia Apache 2.0 original.
- Solo se exporta la ruta de clasificación (etiqueta única, multi-etiqueta y ordinal). La extracción de spans, relaciones y estructuras no está incluida.
- Soporte exclusivo de inglés (`en`). Sin capacidades multilingües documentadas.
- La cuantización int8 es con pérdida: las probabilidades pueden desviarse hasta 0,18 respecto a la versión torch, por lo que el autor recomienda volver a comprobar los umbrales de decisión antes de usarla en producción.
- En CPU, la variante fp16 es más lenta que fp32; conviene reservarla para GPU.
- No se han documentado sesgos específicos, riesgo de alucinación ni comportamiento fuera de distribución en la información disponible.
- No se ha publicado la longitud de contexto soportada, dato crítico para planificar el tamaño de las entradas en producción.
- Los paréntesis `(` y `)` están reservados en nombres de tarea, etiquetas, descripciones e instrucciones; su uso indebido puede romper la construcción del prompt.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de una conversión conviene conservar la atribución al modelo original.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/nishparadox/gliner2.5-decide-onnx
- Modelo base en HuggingFace: https://huggingface.co/fastino/GLiNER2.5-Decide
- Archivos del modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide/tree/main
- Blog de Fastino sobre GLiNER2.5-Decide: https://fastino.ai/blog/gliner-2-5-decide-open-weight-decision-model
- Página de modelo GLiNER2.5 en Fastino: https://fastino.ai/models/gliner2-5
- Cobertura en datanorth.ai: https://datanorth.ai/news/fastino-releases-gliner2-5-decide
- Cobertura en MarkTechPost: https://www.marktechpost.com/2026/09/24/fastino-releases-gliner2-5-decide-a-340m-open-weight-decision-model-that-runs-on-cpu/
