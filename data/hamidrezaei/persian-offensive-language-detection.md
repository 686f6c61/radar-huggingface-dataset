# HamidRezaei/Persian-Offensive-Language-Detection

## Resumen

Persian-Offensive-Language-Detection es un modelo de clasificación de texto binaria desarrollado por Hamid Rezaei y publicado en Hugging Face. Su tarea es determinar si un texto en persa (farsi) contiene lenguaje ofensivo o no. Está construido sobre una arquitectura BERT (la model card menciona ParsBERT entre sus etiquetas, lo que sugiere un fine-tuning sobre ese checkpoint), con 162.842.113 parámetros totales en formato safetensors.

El modelo resuelve un problema concreto de moderación de contenido en un idioma con relativamente pocos recursos NLP en comparación con el inglés: la detección automática de toxicidad en persa. Devuelve una puntuación entre 0 y 1 mediante una sigmoide sobre el logit, con umbral de decisión en 0,5. La salida es un único valor escalar, lo que simplifica su integración en pipelines de filtrado en tiempo real.

Es relevante para equipos que operan plataformas con comunidad persa (redes sociales, foros, chats, comentarios) y necesitan un primer filtro automático de contenido. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y su tamaño moderado (162M de parámetros) lo hace desplegable en hardware modesto. El repositorio ocupa 2,0 GB, lo que incluye probablemente múltiples checkpoints o artefactos de entrenamiento además de los pesos principales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, probablemente ParsBERT como checkpoint base; no confirmado de forma explícita en la model card) |
| Parametros totales | 162.842.113 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; el ejemplo de la model card trunca a `max_length=92` |
| Tipos de cuantizacion | no disponible (formato safetensors; admite cuantización estándar de PyTorch/transformers, pero no se documenta) |
| Idiomas soportados | persa (farsi, `fa`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT con cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`). Con 162,8 millones de parámetros, el tamaño es coherente con un BERT-base o un ParsBERT-base (aproximadamente 110M en BERT-base estándar; el mayor recuento sugiere un vocabulario persa ampliado o variantes en la configuración). La salida es un único logit transformado con sigmoide, lo que corresponde a una clasificación binaria (ofensivo / no ofensivo) implementada como tarea de regresión logística de una sola dimensión.

No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de ajuste fino adicionales como DPO o RLHF. La model card no documenta hiperparámetros de entrenamiento, número de épocas, ni procedimiento de partición train/validation/test. El truncamiento a 92 tokens en el ejemplo de uso sugiere que el modelo fue entrenado o evaluado con secuencias cortas, típicas de comentarios y mensajes en redes sociales.

## Capacidades

- Clasificación binaria de texto persa en dos categorías: ofensivo y no ofensivo.
- Salida de una puntuación continua entre 0 y 1 mediante sigmoide, con umbral de decisión en 0,5.
- Procesamiento de texto corto a medio (el ejemplo de la model card trunca a 92 tokens).
- Integración nativa con la librería `transformers` mediante `AutoTokenizer` y `AutoModelForSequenceClassification`.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (tag `endpoints_compatible`).
- Especializado exclusivamente en persa; no soporta otros idiomas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Moderación de comentarios en plataformas persas: el modelo clasifica cada comentario con una puntuación de ofensividad y permite filtrar automáticamente los que superan el umbral de 0,5, reduciendo la carga de revisión manual en foros y secciones de comentarios.
- Filtrado previo en chats y mensajería: integrado como paso anterior a un moderador humano o a un sistema de sanciones, clasifica mensajes entrantes en tiempo real; su tamaño de 162M permite inferencia en CPU con latencia aceptable.
- Monitorización de redes sociales: análisis por lotes de publicaciones y respuestas para detectar toxicidad en cuentas o hilos concretos, generando métricas agregadas de ofensividad por comunidad o periodo.
- Enriquecimiento de datasets de NLP en persa: etiquetado automático de grandes volúmenes de texto para construir corpus de moderación o para preetiquetar datos que luego se revisan manualmente.
- Protección de comunidades de usuarios: filtrado de contenido ofensivo en plataformas de aprendizaje, comunidades de soporte o espacios infantiles donde se requiere un cribado automático previo a la publicación.
- Investigación en sociolingüística y toxicidad: análisis cuantitativo de la prevalencia de lenguaje ofensivo en corpus persas, con la puntuación continua como variable dependiente en estudios estadísticos.
- Prefiltrado en pipelines de anotación: descarte de textos claramente no ofensivos antes de pasarlos a anotadores humanos, reduciendo el coste de anotación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara las métricas `accuracy` y `f1` en los metadatos, pero no proporciona valores numéricos ni conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,65 GB solo para pesos (162,8M × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB.
- VRAM estimada en fp16: aproximadamente 0,33 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, GTX 1660, e incluso en CPU con throughput razonable para clasificación de textos cortos.
- GPU recomendadas para producción de alto throughput: A100, H100, L4 o T4; para volúmenes moderados, cualquier GPU consumer reciente es suficiente.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (tag oficial), Hugging Face Inference Endpoints (tag `endpoints_compatible`), y exportación a ONNX o cuantización dinámica para CPU.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU para lotes pequeños, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Tarea | Licencia |
|---|---|---|---|---|---|
| Persian-Offensive-Language-Detection | 162,8M | no disponible (ejemplo trunca a 92) | fa | Clasificación binaria de ofensividad | Apache 2.0 |
| ParsBERT | ~162M (BERT-base adaptado a persa) | 512 típico | fa | Modelo base / fine-tuning | Apache 2.0 (según checkpoint) |
| XLM-RoBERTa-base | ~278M | 512 | 100 idiomas (incluye fa) | Modelo base multilingüe | MIT |
| mBERT | ~178M | 512 | 104 idiomas (incluye fa) | Modelo base multilingüe | Apache 2.0 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, idioma y licencia.

## Limitaciones y advertencias

- El modelo solo cubre persa; no debe aplicarse a otros idiomas ni a texto mixto persa-inglés sin validación previa.
- Clasificación binaria con umbral fijo en 0,5: no se documenta calibración de probabilidades, por lo que la puntuación no debe interpretarse como probabilidad calibrada sin verificación empírica.
- Riesgo de falsos positivos y falsos negativos no cuantificado: no se publican métricas de precisión, recall ni F1 en la model card.
- Posible sesgo hacia el registro y dominio de los datos de entrenamiento (probablemente comentarios de redes sociales); el rendimiento puede degradarse en textos formales, literarios o técnicos.
- Longitud de contexto efectiva limitada en el ejemplo de uso (92 tokens); textos más largos se truncan y pueden perder la parte ofensiva si aparece al final.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en casos ambiguos (ironía, sarcasmo, lenguaje reclamado, citas de discurso ofensivo).
- No se documenta el corpus de entrenamiento ni su procedencia, lo que dificulta evaluar sesgos demográficos o culturales.
- El repositorio ocupa 2,0 GB, muy por encima de lo esperado para 162M de parámetros en safetensors (~0,65 GB); conviene revisar qué artefactos adicionales contiene antes de desplegarlo.
- Licencia Apache 2.0 permite uso comercial, pero el autor solicita citación en publicaciones y productos; la citación no es obligatoria legalmente bajo Apache 2.0, pero es una petición explícita.
- No apto como único mecanismo de moderación en producción: debe combinarse con revisión humana y otros filtros, dado que no se aportan métricas de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HamidRezaei/Persian-Offensive-Language-Detection
- ParsBERT (checkpoint base probable, no confirmado explícitamente): https://huggingface.co/HooshvareLab/bert-base-parsbert-uncased
- Documentación de `AutoModelForSequenceClassification`: https://huggingface.co/docs/transformers/model_doc/auto
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
