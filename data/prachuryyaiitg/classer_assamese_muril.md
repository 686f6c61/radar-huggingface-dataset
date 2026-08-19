# prachuryyaIITG/CLASSER_Assamese_MuRIL

## Resumen

El modelo `prachuryyaIITG/CLASSER_Assamese_MuRIL` es un ajuste fino (fine-tuning) de `google/muril-large-cased` sobre el dataset CLASSER, específicamente para la tarea de reconocimiento de entidades nombradas de grano fino (fine-grained NER) en asamés (código `as`). Fue desarrollado por Prachuryya Kaushik y el profesor Ashish Anand en el marco del ecosistema AWED-PIPER, que busca cubrir lenguas de bajos recursos del subcontinente indio.

El modelo hereda la arquitectura Transformer encoder de MuRIL, un modelo multilingüe preentrenado para lenguas indias, y se especializa en etiquetar entidades de tipo persona, organización, lugar, producto, obra creativa y entidades médicas, entre otras, siguiendo el tagset de MultiCoNER2. Con 504,9 millones de parámetros, es un modelo de tamaño grande que ofrece un rendimiento competitivo en asamés, una lengua con escasos recursos digitales.

Su relevancia actual radica en que proporciona una herramienta de NER de grano fino para una lengua poco representada, integrable en pipelines de procesamiento de lenguaje natural, agentes y aplicaciones web dentro del ecosistema AWED-PIPER. La licencia MIT permite su uso comercial sin restricciones, lo que facilita su adopción en entornos productivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basada en BERT, modelo `google/muril-large-cased`) |
| Parametros totales | 504.926.275 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (típicamente 512 tokens en arquitectura BERT, no especificado) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Asamés (`as`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/muril-large-cased`, un Transformer encoder preentrenado con técnicas de enmascaramiento y traducción para lenguas indias. Sobre esta base se realiza un ajuste fino supervisado con el dataset CLASSER, que contiene anotaciones de entidades de grano fino en asamés. El etiquetado sigue el esquema de MultiCoNER2, que define 30 tipos de entidades agrupadas en seis categorías gruesas: localización, obra creativa, grupo, persona, producto y médico.

El entrenamiento se llevó a cabo durante 6 épocas con el optimizador AdamW, una tasa de aprendizaje de 5e-5, un weight decay de 0.01 y un tamaño de lote de 64. No se mencionan técnicas adicionales como aumentación de datos o entrenamiento adversarial. La arquitectura es la estándar de BERT large, con 24 capas, 1024 dimensiones ocultas y 16 cabezas de atención, aunque estos detalles no se repiten en la documentación del modelo.

## Capacidades

- Reconocimiento de entidades nombradas de grano fino en asamés, incluyendo tipos como personas (científicos, artistas, políticos, atletas), organizaciones (corporaciones públicas y privadas, grupos deportivos), lugares (instalaciones, asentamientos humanos, estaciones), productos (ropa, vehículos, alimentos, bebidas), obras creativas (visuales, musicales, escritas, software) y entidades médicas (medicamentos, procedimientos, estructuras anatómicas, síntomas, enfermedades).
- Etiquetado de secuencias a nivel de token, adecuado para tareas de extracción de información y enriquecimiento de texto.
- Compatible con la librería `transformers` de HuggingFace, lo que permite su integración en pipelines de token-classification y en herramientas como `pipeline("token-classification")`.
- Integración con el ecosistema AWED-PIPER, que ofrece agentes y aplicaciones web para NER y protección de datos personales, aunque esta capacidad es externa al modelo en sí.

## Casos de uso

- Extracción de entidades en noticias asamés: el modelo puede identificar personas, lugares y organizaciones en artículos periodísticos, facilitando la construcción de bases de datos de conocimiento y sistemas de recomendación de contenido.
- Procesamiento de documentos gubernamentales: en asamés, el modelo puede extraer nombres de instituciones, cargos y ubicaciones de documentos administrativos, ayudando a la digitalización y búsqueda de información pública.
- Análisis de redes sociales: al detectar menciones de productos, marcas y personas en publicaciones de plataformas sociales en asamés, permite monitorizar la opinión pública o detectar tendencias.
- Asistencia en investigación biomédica: el modelo reconoce entidades médicas (enfermedades, medicamentos, síntomas) en textos clínicos o científicos en asamés, lo que puede apoyar la creación de registros médicos estructurados.
- Archivado de patrimonio cultural: para digitalizar manuscritos o transcripciones en asamés, el modelo puede etiquetar nombres de lugares históricos, personajes y obras, facilitando la catalogación.
- Construcción de chatbots o asistentes virtuales en asamés: al extraer entidades de las consultas de los usuarios, el modelo permite enrutar peticiones a los departamentos adecuados (por ejemplo, detectar un producto mencionado) en servicios de atención al cliente.

## Benchmarks y rendimiento

El modelo reporta las siguientes métricas sobre el conjunto de evaluación de CLASSER (no se especifica el tamaño del conjunto):

| Metrica | Valor |
|---|---|
| Precision | 74.88 |
| Recall | 75.62 |
| F1 | 75.25 |

No se han publicado comparaciones con otros modelos en la información disponible, por lo que no es posible situar estos resultados frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión fp32: aproximadamente 2 GB (504.926.275 parámetros × 4 bytes). Con cuantización a int8, podría reducirse a ~1 GB.
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores). En CPU, la inferencia es posible pero más lenta.
- El modelo cabe en GPUs de consumo, como la serie RTX 30/40, y también en entornos de CPU con suficiente RAM.
- Opciones de despliegue: al ser un modelo de la librería `transformers`, puede servirse con HuggingFace Inference Endpoints, vLLM (aunque es un encoder, vLLM soporta principalmente decoders, por lo que se recomienda usar `transformers` o TGI), o mediante `pipeline` de HuggingFace. También es posible exportarlo a ONNX para optimización.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna (por ejemplo, RTX 3090), se espera una latencia de decenas de milisegundos por frase corta, pero estos valores dependen del hardware y la longitud del texto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que es un ajuste fino de MuRIL para asamés, podría compararse con otros modelos NER multilingües como XLM-R o IndicBERT, pero no se han encontrado datos de rendimiento de estos en asamés dentro de la información disponible. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en asamés, por lo que no es adecuado para otros idiomas sin un ajuste adicional.
- Al ser un modelo basado en BERT, su longitud de contexto está limitada (típicamente 512 tokens), lo que puede ser insuficiente para documentos largos sin estrategias de truncamiento o particionado.
- Las métricas reportadas (F1 de 75.25) indican un margen de error considerable; en entornos de producción crítica, se recomienda validar los resultados con supervisión humana.
- No se documentan sesgos específicos, pero como cualquier modelo entrenado con datos textuales, puede reflejar sesgos presentes en el corpus de entrenamiento, especialmente en nombres de personas o lugares poco representados.
- Riesgo de alucinación: aunque es un modelo de etiquetado (no generativo), puede asignar etiquetas incorrectas a tokens ambiguos o fuera del dominio.
- La licencia MIT permite uso comercial, pero el modelo se distribuye tal cual, sin garantías de precisión o idoneidad para un propósito particular.

## Enlaces

- [HuggingFace - prachuryyaIITG/CLASSER_Assamese_MuRIL](https://huggingface.co/prachuryyaIITG/CLASSER_Assamese_MuRIL)
- [Dataset CLASSER](https://huggingface.co/datasets/prachuryyaIITG/CLASSER)
- [Paper CLASSER (IJCNLP 2025)](https://aclanthology.org/2025.ijcnlp-long.94/)
- [Paper AWED-PIPER (arXiv 2601.10161)](https://arxiv.org/abs/2601.10161)
- [Repositorio GitHub CLASSER](https://github.com/PrachuryyaKaushik/CLASSER)
- [Repositorio GitHub AWED-PIPER](https://github.com/PrachuryyaKaushik/AWED-PIPER)
- [Agente AWED-FiNER](https://github.com/PrachuryyaKaushik/AWED-FiNER)
- [Aplicación web AWED-FiNER](https://huggingface.co/spaces/prachuryyaIITG/AWED-FiNER)
- [Aplicación web AWED-PII Protector](https://huggingface.co/spaces/prachuryyaIITG/AWED_PII_Protector)
