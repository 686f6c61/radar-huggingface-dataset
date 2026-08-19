# prachuryyaIITG/CLASSER_Bodo_MuRIL

## Resumen

CLASSER_Bodo_MuRIL es un modelo de reconocimiento de entidades nombradas (NER) de grano fino, desarrollado por Prachuryya Kaushik y el profesor Ashish Anand del IIT Guwahati. Se basa en el modelo multilingüe MuRIL (Multilingual Representations for Indian Languages) de Google, ajustado específicamente para la lengua bodo (código ISO `brx`), una lengua tibetano-birmana hablada por aproximadamente 1,4 millones de personas en el noreste de India, principalmente en el estado de Assam. El modelo forma parte del ecosistema AWED-PIPER, que incluye agentes y aplicaciones web para la protección de información personal identificable (PII) y NER de grano fino en 36 lenguas.

El modelo resuelve el problema de la escasez de recursos de procesamiento del lenguaje natural para lenguas de bajos recursos como el bodo. Utiliza el dataset CLASSER, creado mediante proyección de anotaciones cross-lingüísticas potenciada por similitud de escritura, y emplea el etiquetado fino de MultiCoNER2 con 21 etiquetas específicas (por ejemplo, Scientist, Politician, Disease, Vehicle, etc.) agrupadas en 6 categorías generales. Con 504,9 millones de parámetros y una ventana de contexto de 512 tokens, ofrece un rendimiento de F1 de 75,08 en la tarea de NER, siendo uno de los pocos modelos disponibles para esta lengua.

La relevancia actual radica en su contribución a la inclusión lingüística en IA, permitiendo aplicaciones de extracción de información, búsqueda semántica y protección de datos en una lengua minoritaria, y sirviendo como referencia para el desarrollo de modelos similares en otras lenguas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-like), basado en `google/muril-large-cased` |
| Parametros totales | 504.926.275 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (heredado de MuRIL-large) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | Bodo (`brx`) (el modelo base MuRIL soporta 16 lenguas indias, pero el ajuste es solo para bodo) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/muril-large-cased`, un transformer encoder de 24 capas con 1024 dimensiones ocultas y 16 cabezas de atención, entrenado originalmente en 17 lenguas indias (incluyendo bodo) con un vocabulario WordPiece de 128.000 tokens. Para esta tarea, se añade una capa de clasificación por token (token classification) sobre la representación contextual de cada token, con un espacio de etiquetas de 21 clases finas (más la etiqueta O para fuera de entidad).

El ajuste fino se realizó sobre el dataset CLASSER, que contiene anotaciones de NER de grano fino para bodo, obtenidas mediante proyección de anotaciones desde lenguas con más recursos (como el inglés o el hindi) y posterior refinamiento. Los hiperparámetros de entrenamiento son: 6 épocas, optimizador AdamW con tasa de aprendizaje de 5e-5, weight decay de 0,01 y tamaño de lote de 64. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es supervisado estándar con pérdida de entropía cruzada. La innovación principal no está en la arquitectura, sino en la metodología de creación de datos (CLASSER) y en la aplicación a una lengua extremadamente poco representada.

## Capacidades

- Reconocimiento de entidades nombradas de grano fino en bodo, con 21 etiquetas específicas (por ejemplo, Scientist, Politician, Disease, Vehicle, Medication, etc.) agrupadas en 6 categorías: Location, Creative Work, Group, Person, Product y Medical.
- Clasificación de tokens a nivel de palabra, capaz de identificar entidades en textos escritos en bodo (escritura devanagari).
- Integración con el ecosistema AWED-FiNER, que permite interactuar con el modelo mediante un agente (tool calling) o una aplicación web en Hugging Face Spaces.
- Al estar basado en MuRIL, hereda cierta capacidad de transferencia cross-lingüística, aunque el ajuste es específico para bodo.
- Soporta el pipeline de `token-classification` de la librería Transformers, lo que facilita su uso en proyectos existentes.

## Casos de uso

- Extracción de información en documentos administrativos en bodo: el modelo puede identificar nombres de personas, lugares, organizaciones y fechas en textos gubernamentales o legales, facilitando la digitalización y el análisis de documentos en esta lengua.
- Búsqueda semántica y recuperación de información: al etiquetar entidades en un corpus de noticias o artículos en bodo, se pueden construir índices por entidad para búsquedas más precisas, por ejemplo, filtrar noticias por nombre de político o ubicación.
- Análisis de redes sociales y opiniones: permite extraer menciones de productos, marcas o personas en publicaciones de redes sociales en bodo, útil para estudios de mercado o monitorización de reputación.
- Protección de datos personales (PII): el modelo puede usarse para detectar y anonimizar nombres, direcciones y otros datos personales en textos en bodo, como parte de pipelines de cumplimiento del RGPD o leyes locales de protección de datos.
- Creación de corpus anotados para otras tareas: las entidades extraídas pueden servir como base para entrenar sistemas de pregunta-respuesta, resumen o traducción en bodo.
- Investigación lingüística y desarrollo de recursos: el modelo ayuda a documentar y analizar la lengua bodo, contribuyendo a estudios sociolingüísticos o al desarrollo de herramientas educativas.

## Benchmarks y rendimiento

El modelo reporta las siguientes métricas en el conjunto de test del dataset CLASSER (no se especifica el tamaño ni la composición del conjunto):

| Metrica | Valor |
|---|---|
| Precision | 73,83 |
| Recall | 76,37 |
| F1 | 75,08 |

No se han publicado comparaciones con otros modelos en la información disponible. Dado que es el primer modelo de NER de grano fino para bodo, no hay referencias directas de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: con 504,9 millones de parámetros en fp32, el modelo ocupa aproximadamente 2 GB en memoria. En fp16 ocuparía ~1 GB. Para inferencia en lote pequeño, una GPU con 4 GB de VRAM sería suficiente; con cuantización a int8 (si se aplicara) podría caber en 2 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o superiores. En entornos cloud, una T4 o V100 es más que suficiente.
- En consumer GPU: sí, cabe en GPUs de gama media como la RTX 3060 (12 GB) o incluso en la RTX 3050 (8 GB) sin problemas.
- Opciones de despliegue: al ser un modelo de Transformers, puede ejecutarse con la librería `transformers` mediante `pipeline("token-classification")`. También es compatible con `vLLM` (aunque al ser encoder-only, su uso es menos habitual), `ONNX Runtime` para optimización, y puede servirse con `FastAPI` o `Triton Inference Server`.
- Latencia y throughput: no se dispone de datos medidos. En una GPU T4, la inferencia sobre un texto de 512 tokens tardaría del orden de 50-100 ms, permitiendo procesar decenas de peticiones por segundo.

## Comparativa con modelos similares

No se dispone de modelos comparables específicamente para NER de grano fino en bodo. El modelo más cercano es el propio `google/muril-large-cased` sin ajuste, que no realiza NER de forma directa. Otros modelos multilingües como `XLM-RoBERTa-large` o `mBERT` podrían ajustarse para bodo, pero no existen versiones publicadas con este propósito. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| CLASSER_Bodo_MuRIL (este) | 504,9 M | 512 | NER fino en bodo | MIT |
| google/muril-large-cased | 504,9 M | 512 | Multilingüe (16 lenguas indias), sin NER específico | Apache 2.0 |
| XLM-RoBERTa-large | 560 M | 512 | Multilingüe (100 lenguas), sin NER específico | MIT |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la lengua bodo; no debe usarse para otras lenguas, incluso si son indias, ya que su rendimiento fuera de bodo no está garantizado.
- La longitud máxima de contexto es de 512 tokens, lo que limita el procesamiento de documentos largos; para textos extensos se requiere segmentación previa.
- Las métricas reportadas (F1 75,08) son moderadas en comparación con modelos de NER para lenguas de altos recursos (que suelen superar 85-90), lo que indica margen de mejora y posibles errores en entidades poco frecuentes.
- El dataset CLASSER puede contener sesgos derivados de la proyección de anotaciones desde otras lenguas, lo que podría afectar a la precisión en ciertos tipos de entidades o variantes dialectales del bodo.
- No se ha evaluado explícitamente el riesgo de alucinación, pero al ser un modelo de clasificación de tokens, no genera texto libre; el riesgo se limita a errores de etiquetado.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda citar los trabajos originales (ver sección de enlaces) al utilizarlo en publicaciones o productos.
- El modelo no soporta entradas multimodales ni generación de texto; es exclusivamente un encoder para clasificación de tokens.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/prachuryyaIITG/CLASSER_Bodo_MuRIL)
- [Dataset CLASSER en Hugging Face](https://huggingface.co/datasets/prachuryyaIITG/CLASSER)
- [Colección CLASSER en Hugging Face](https://huggingface.co/collections/prachuryyaIITG/classer)
- [Paper CLASSER (IJCNLP 2025)](https://aclanthology.org/2025.ijcnlp-long.94/)
- [Paper AWED-PIPER (arXiv 2601.10161)](https://arxiv.org/abs/2601.10161)
- [Repositorio GitHub AWED-PIPER](https://github.com/PrachuryyaKaushik/AWED-PIPER)
- [Repositorio GitHub AWED-FiNER (agente para NER fino)](https://github.com/PrachuryyaKaushik/AWED-FiNER)
- [Web App AWED-FiNER en Hugging Face Spaces](https://huggingface.co/spaces/prachuryyaIITG/AWED-FiNER)
- [Web App AWED_PII_Protector en Hugging Face Spaces](https://huggingface.co/spaces/prachuryyaIITG/AWED_PII_Protector)
