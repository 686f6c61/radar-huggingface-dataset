# Saraiv4/classificador-atendimento

## Resumen

`Saraiv4/classificador-atendimento` es un modelo de clasificación de texto publicado en Hugging Face por el usuario Saraiv4. Por su nombre y su pipeline (`text-classification`), está orientado a la clasificación de mensajes o interacciones de atención al cliente, presumiblemente en portugués dado el término "atendimento". El repositorio tiene un tamaño de 0,4 GB y contiene pesos en formato safetensors con 108.926.212 parámetros totales, lo que sitúa al modelo en la franja de los ~110 millones de parámetros, compatible con arquitecturas tipo BERT-base o similares.

La relevancia de este modelo es limitada en el momento de redactar esta ficha: cuenta con 0 descargas y 0 likes, la model card es la plantilla autogenerada por Hugging Face sin ningún dato rellenado, y no se especifican licencia, idiomas, datos de entrenamiento ni resultados de evaluación. Se trata, por tanto, de un artefacto sin documentación técnica asociada, lo que impide validar su calidad o su idoneidad para producción.

A pesar de la falta de información, la ficha se completa a continuación con los datos objetivos disponibles (arquitectura inferida por los tags, número de parámetros real, formato de pesos) y se marcan explícitamente como "no disponible" todos aquellos campos que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (inferida del tag `bert`; la model card no la documenta) |
| Parametros totales | 108.926.212 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base suele soportar 512 tokens, pero no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32 o fp16) |
| Idiomas soportados | no disponible (el nombre sugiere portugués, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `bert` en el repositorio indica que el modelo se basa en la familia BERT (encoder transformer bidireccional). Con 108.926.212 parámetros, el tamaño es consistente con un BERT-base ligeramente ampliado (el BERT-base estándar tiene ~110 M de parámetros), por lo que probablemente se trate de un fine-tuning de un checkpoint BERT preentrenado. El tag `arxiv:1910.09700` corresponde al paper del calculador de impacto medioambiental de Lacoste et al., que aparece en la plantilla por defecto de la model card y no aporta información sobre el entrenamiento real.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, si hubo ajuste fino supervisado, RLHF o DPO, ni sobre hiperparámetros de entrenamiento. La model card no documenta ninguna innovación técnica (atención lineal, decodificación especulativa, etc.). Toda la sección de entrenamiento del README original está marcada como "[More Information Needed]".

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo emite etiquetas (probablemente categorías de atención al cliente) para un texto de entrada.
- Generación de texto: no soportada (es un encoder, no un modelo causal).
- Razonamiento multi-paso y agentes: no soportado.
- Tool calling / function calling: no soportado.
- Capacidades multilingües: no documentadas; el nombre sugiere portugués, pero no está confirmado.
- Visión, audio, thinking mode: no soportado.
- Embeddings de texto: el tag `text-embeddings-inference` sugiere que puede usarse para inferencia de embeddings, aunque el pipeline principal es clasificación.

## Casos de uso

- Clasificación de tickets de soporte: si el modelo fue ajustado con categorías de atención al cliente, podría etiquetar automáticamente consultas entrantes (reclamaciones, dudas, incidencias) para enrutarlas al equipo adecuado. La idoneidad depende de la calidad del fine-tuning, no documentada.
- Triaje de correos o mensajes de contacto: uso como primer filtro para separar consultas comerciales de incidencias técnicas, siempre que se valide previamente con datos propios.
- Análisis de sentimiento en interacciones de soporte: si las etiquetas del fine-tuning incluyen polaridad, podría emplearse para monitorizar la satisfacción del cliente.
- Enrutamiento en chatbots de atención: integrado como clasificador previo a un LLM generativo, para decidir qué flujo de conversación activar.
- Etiquetado de grandes volúmenes de conversaciones históricas: al ser un modelo de ~110 M de parámetros, es barato de ejecutar en CPU y apto para procesar lotes masivos offline.
- Extracción de motivos de contacto: clasificación de motivo (facturación, entrega, producto defectuoso, etc.) para alimentar dashboards de analítica de soporte.
- Prototipado rápido: al ser un BERT pequeño, se puede desplegar en entornos con pocos recursos para experimentar con pipelines de clasificación antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,4 GB en fp32 (108,9 M de parámetros × 4 bytes ≈ 436 MB); ~0,22 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona sobradamente en T4, L4, RTX 3060, RTX 4090, A100 o H100. Para clasificación de texto, la GPU no es imprescindible.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- CPU: viable para inferencia en producción a baja/media escala, dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Text Embeddings Inference (tag `text-embeddings-inference`), y potencialmente ONNX Runtime si se exporta. No se ha confirmado compatibilidad con vLLM, llama.cpp u Ollama (no aplicables a un encoder de clasificación).
- Latencia y throughput: no disponibles; para un BERT-base en GPU moderna se espera un throughput de miles de peticiones por segundo en batching, pero no hay medición publicada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| Saraiv4/classificador-atendimento | 108,9 M | no disponible | no disponible | inexistente (plantilla vacía) | 0 descargas |
| BERT-base multilingüe (google-bert/bert-base-multilingual-cased) | 178 M | 512 tokens | Apache 2.0 | completa | ampliamente usado |
| DistilBERT multilingüe (distilbert-base-multilingual-cased) | 135 M | 512 tokens | Apache 2.0 | completa | ampliamente usado |
| RoBERTa-base (roberta-base) | 125 M | 512 tokens | MIT | completa | ampliamente usado |

La comparativa se limita a modelos de la misma familia (encoders BERT-like de ~100-180 M de parámetros). Frente a ellos, este checkpoint carece de documentación, licencia declarada y evaluación pública, por lo que su adopción en producción exigiría una validación empírica propia.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, etiquetas, métricas ni procedencia del checkpoint base, lo que impide auditar sesgos o calidad.
- Licencia no declarada: sin licencia explícita, el uso comercial es jurídicamente incierto; conviene contactar con el autor antes de integrarlo en producción.
- Idiomas no confirmados: el nombre sugiere portugués, pero no se especifica; no debe asumirse soporte de castellano sin validación.
- Riesgo de alucinación: no aplica en sentido generativo (es un clasificador), pero sí hay riesgo de clasificaciones erróneas o sobreconfiadas si el fine-tuning fue deficiente.
- Sesgos: desconocidos, al no documentarse el dataset de entrenamiento; podría reflejar sesgos presentes en los datos de atención al cliente usados.
- Contexto máximo no documentado: si se hereda de BERT-base, sería de 512 tokens, insuficiente para conversaciones largas.
- Sin benchmarks ni validación externa: no hay evidencia pública de rendimiento; cualquier uso requiere evaluación con un conjunto de test propio.
- Riesgo de abandono: 0 descargas y 0 likes sugieren un repositorio sin mantenimiento ni comunidad; no hay garantía de soporte.

## Enlaces

- Hugging Face: https://huggingface.co/Saraiv4/classificador-atendimento
- Paper del calculador de impacto (referenciado en la plantilla, no específico del modelo): https://arxiv.org/abs/1910.09700
- Calculador de impacto ML: https://mlco2.github.io/impact#compute
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
