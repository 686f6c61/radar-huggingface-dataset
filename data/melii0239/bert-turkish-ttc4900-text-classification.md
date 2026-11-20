# melii0239/bert-turkish-ttc4900-text-classification

## Resumen

`bert-turkish-ttc4900-text-classification` es un modelo de clasificación de texto en turco obtenido mediante fine-tuning de BERTurk (`dbmdz/bert-base-turkish-uncased`) sobre el corpus periodístico TTC4900. Lo publica el usuario melii0239 en Hugging Face como resultado de un trabajo académico de ajuste fino, y resuelve una tarea concreta: asignar una noticia en turco a una de siete categorías (tecnología, economía, salud, política, cultura, deporte y mundo). Su relevancia es práctica: ofrece un clasificador ligero, con licencia MIT y métricas verificables (accuracy de 0,9369 sobre 681 ejemplos de test) que cualquier equipo puede desplegar sin coste de licencia ni infraestructura pesada.

Arquitectónicamente es un transformer encoder de tipo BERT en su variante *uncased* para turco, con 110.622.727 parámetros totales (unos 110,6 M) y un repositorio de 0,4 GB en safetensors. No es un modelo generativo ni conversacional: es una cabeza de clasificación con 7 etiquetas sobre la representación del token `[CLS]`. La longitud de entrada efectiva es de 256 tokens, fijada durante el entrenamiento.

El modelo es relevante ahora porque demuestra que un ajuste fino pequeño y barato (entrenado en GPU gratuita de Google Colab, 4 épocas, 796 pasos totales) sobre un encoder turco bien establecido basta para superar el 93 % de accuracy en clasificación de noticias, lo que lo convierte en una línea base sólida para tareas de enrutado, etiquetado y filtrado de contenido en turco dentro de pipelines de NLP.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTurk, variante *uncased*) con cabeza de clasificación de 7 clases |
| Parametros totales | 110.622.727 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima usada en entrenamiento; el backbone BERT admite hasta 512) |
| Tipos de cuantizacion | No disponible (el autor no publica variantes cuantizadas; al ser safetensors fp32/fp16 es convertible a INT8/INT4 con herramientas estándar) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de `dbmdz/bert-base-turkish-uncased` (BERTurk), un encoder BERT base adaptado al turco, y le añade una capa de clasificación lineal sobre la representación del token `[CLS]` para 7 etiquetas. El ajuste fino se realizó sobre el dataset `savasy/ttc4900` con partición estratificada 70/15/15 (semilla 42), preprocesamiento específico para turco (sustitución de `_` por espacio, minúsculas conforme a las reglas turcas con `I→ı` e `İ→i`, limpieza de espacios múltiples y eliminación de textos duplicados) y truncado a `max_length=256`.

Los hiperparámetros publicados son: 4 épocas, learning rate 2e-05, batch de entrenamiento 16 y de evaluación 32, weight decay 0,01, 79 pasos de warmup, 199 pasos por época y 796 pasos totales, entrenamiento en fp16 con AdamW y scheduler lineal por defecto del `Trainer` de Hugging Face. Se seleccionó el mejor checkpoint por F1 macro (`load_best_model_at_end=True`). No se documenta uso de RLHF, DPO ni destilación; es un ajuste fino supervisado convencional sobre un encoder preentrenado.

## Capacidades

- Clasificación de texto en turco en 7 categorías cerradas: `teknoloji`, `ekonomi`, `saglik`, `siyaset`, `kultur`, `spor`, `dunya`.
- Etiquetado de noticias y artículos periodísticos con una sola pasada de inferencia (encoder, sin generación).
- Manejo de entradas de hasta 256 tokens; el texto más largo se trunca y solo se clasifica el primer fragmento.
- Funciona mejor con texto en minúsculas conforme a las reglas turcas; el autor recomienda normalizar antes de predecir.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo *thinking*.
- No tiene capacidades multimodales (sin visión ni audio).
- Multilingüismo: únicamente turco; no se ha evaluado su comportamiento en otros idiomas.

## Casos de uso

- Enrutado automático de noticias en redacciones digitales: clasificar cada pieza entrante en una de las 7 secciones para asignarla al editor correspondiente, aprovechando la accuracy del 93,69 % y la velocidad de un encoder de 110 M de parámetros.
- Moderación y organización de agregadores de contenido turco: etiquetar flujos RSS o scrapers de medios para separar deporte, economía y política antes de indexar o mostrar.
- Filtrado temático en paneles de monitorización de medios: detectar menciones de temática sanitaria o económica en corpus de noticias y activar alertas por categoría.
- Etiquetado de datasets para proyectos de NLP en turco: usar el modelo como anotador automático de un corpus no etiquetado y revisar manualmente solo los casos de baja confianza.
- Clasificación de titulares y resúmenes en aplicaciones móviles de noticias: inferencia en CPU o GPU modesta para personalizar la sección de inicio del usuario.
- Línea base en investigación académica sobre clasificación de texto en turco: comparar nuevos modelos contra unas métricas publicadas y reproducibles (accuracy, precision, recall y F1 macro y weighted) sobre la partición de test de TTC4900.
- Prefiltrado en pipelines RAG o de búsqueda: asignar categoría a documentos turcos antes de la recuperación para restringir el espacio de búsqueda por sección.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test de TTC4900 (681 ejemplos):

| Metrica | Macro | Weighted |
|---|---|---|
| Accuracy | 0,9369 | 0,9369 |
| Precision | 0,9389 | 0,9379 |
| Recall | 0,9384 | 0,9369 |
| F1-Score | 0,9380 | 0,9367 |

Resultados por clase:

| Clase | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| teknoloji | 0,9271 | 0,9175 | 0,9223 | 97 |
| ekonomi | 0,8807 | 0,9231 | 0,9014 | 104 |
| saglik | 0,9684 | 0,9684 | 0,9684 | 95 |
| siyaset | 0,9074 | 0,9423 | 0,9245 | 104 |
| kultur | 0,9432 | 0,9765 | 0,9595 | 85 |
| spor | 0,9792 | 0,9895 | 0,9843 | 95 |
| dunya | 0,9663 | 0,8515 | 0,9053 | 101 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp16 para inferencia (modelo de 110,6 M de parámetros, ~0,22 GB en fp16 y ~0,44 GB en fp32), más el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problema en RTX 3060, RTX 4090, T4, A100 y H100. El propio autor lo entrenó en una GPU gratuita de Google Colab.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: `transformers` con `pipeline("text-classification")`, Hugging Face Text Embeddings Inference (el modelo está marcado como `text-embeddings-inference` y `endpoints_compatible`), ONNX Runtime, o exportación a GGUF para llama.cpp/Ollama si se convierte el encoder.
- Latencia y throughput: no publicados por el autor. Por el tamaño del modelo se espera inferencia en el orden de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `melii0239/bert-turkish-ttc4900-text-classification` | 110,6 M | 256 tokens | Clasificación de noticias turcas, 7 clases | MIT | Hugging Face |
| `dbmdz/bert-base-turkish-uncased` (BERTurk) | ~110 M | 512 tokens | Modelo base preentrenado en turco, sin cabeza de clasificación | MIT | Hugging Face |
| `dbmdz/bert-base-turkish-cased` (BERTurk) | ~110 M | 512 tokens | Modelo base preentrenado en turco, sin cabeza de clasificación | MIT | Hugging Face |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada; la comparación se limita a parámetros, contexto, tarea y licencia.

## Limitaciones y advertencias

- Solo reconoce 7 categorías cerradas de noticias; cualquier texto fuera de ese dominio (correo, contratos, redes sociales) puede recibir una etiqueta incorrecta con alta confianza.
- Entrenado con el lenguaje periodístico de TTC4900 (corpus de la década de 2010); el rendimiento puede degradarse en textos de otros dominios, registros o épocas.
- Solo se procesan los primeros 256 tokens: la información relevante al final de un artículo largo se descarta.
- Entrenado en minúsculas; sin normalización turca previa (`I→ı`, `İ→i`) la precisión puede caer.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y etiquetas erróneas en entradas ambiguas o fuera de distribución.
- No se documenta una evaluación de sesgos; al ser un clasificador temático, puede heredar sesgos de cobertura del corpus periodístico original.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones del dataset `savasy/ttc4900` y del modelo base BERTurk antes de un despliegue en producción.
- Modelo de autor individual con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni mantenimiento continuado.
- No hay cifras publicadas de latencia ni throughput; deben medirse en el entorno de despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/melii0239/bert-turkish-ttc4900-text-classification
- Modelo base BERTurk: https://huggingface.co/dbmdz/bert-base-turkish-uncased
- Dataset TTC4900: https://huggingface.co/datasets/savasy/ttc4900
- Documentación de `pipeline` de transformers: https://huggingface.co/docs/transformers/main_classes/pipelines
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
