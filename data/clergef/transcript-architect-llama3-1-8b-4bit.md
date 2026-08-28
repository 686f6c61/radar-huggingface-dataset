# ClergeF/transcript-architect-llama3.1-8b-4bit

## Resumen

Transcript Architect es un modelo de lenguaje fine-tuneado sobre **Llama 3.1 8B Instruct** de Meta, desarrollado por ClergeF, especializado en la segmentación de transcripciones de reuniones con marcas de tiempo en secciones narrativas coherentes. Su objetivo es identificar cambios reales de tema en una conversación y agrupar los turnos de habla en bloques con sentido, en lugar de dividir el texto en fragmentos de igual duración. El modelo genera un resumen global de la reunión y una lista de secciones con sus intervalos temporales, títulos y resúmenes parciales, todo en formato JSON estructurado.

Esta versión concreta es la cuantización **4-bit NF4** del modelo original de precisión completa, pensada para reducir el consumo de memoria y acelerar la inferencia en entornos con recursos limitados. El modelo base tiene 8.030 millones de parámetros y se distribuye en formato safetensors. Aunque está orientado a un caso de uso muy específico (inteligencia de reuniones), su arquitectura subyacente es la de un transformer decoder-only estándar, por lo que conserva las capacidades generales de generación de texto del modelo original, aunque su entrenamiento se ha centrado en la tarea de segmentación.

La relevancia actual de este modelo radica en la creciente demanda de herramientas de análisis automático de reuniones, especialmente en entornos empresariales donde se generan grandes volúmenes de transcripciones. Al estar cuantizado a 4 bits, puede ejecutarse en GPUs de consumo medio, lo que facilita su integración en flujos de trabajo locales o en servicios de bajo coste. No obstante, se trata de un modelo experimental con limitaciones conocidas documentadas por su autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit NF4 (bitsandbytes), double quantization habilitada |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura **Llama 3.1 8B Instruct**, un transformer decoder-only con atención causal y normalización RMSNorm, entrenado originalmente por Meta con 128.000 tokens de contexto (aunque este dato no se confirma en la ficha del fine-tune). Sobre esta base se aplicó un fine-tuning mediante **QLoRA** (Low-Rank Adaptation cuantizada), que permite ajustar el modelo con un consumo de memoria reducido. El adaptador LoRA resultante se fusionó posteriormente en los pesos del modelo base, dando lugar al modelo de precisión completa `ClergeF/transcript-architect-llama3.1-8b`.

El entrenamiento se realizó durante **3 épocas** con un conjunto de datos muy reducido: **180 ejemplos de entrenamiento** y **20 de validación**, con una longitud máxima de secuencia de **9.216 tokens**. No se especifica la composición exacta del dataset, pero por la naturaleza de la tarea se infiere que consiste en transcripciones de reuniones sintéticas o reales con sus correspondientes anotaciones de secciones narrativas. No se menciona el uso de RLHF ni DPO; el ajuste se limita a supervisión directa sobre la tarea de segmentación.

Posteriormente, el modelo fusionado se cuantizó a **4-bit NF4** con double quantization para reducir el tamaño del repositorio a 5,7 GB. Esta cuantización es puramente de inferencia: no se realizó ningún entrenamiento adicional durante el proceso, por lo que las capacidades del modelo son idénticas a las de la versión de precisión completa, salvo por la pérdida de precisión inherente a la cuantización.

## Capacidades

- **Segmentación de transcripciones con marcas de tiempo**: identifica cambios de tema en conversaciones y agrupa los turnos en secciones con intervalos temporales (start_time, end_time).
- **Generación de resúmenes**: produce un resumen global de la reunión (`meeting_summary`) y resúmenes parciales para cada sección detectada.
- **Salida estructurada en JSON**: devuelve un objeto JSON con el esquema `meeting_summary` y `story_sections[]`, cada sección con `start_time`, `end_time`, `section_title` y `summary`.
- **Comprensión de contexto conversacional**: al estar basado en Llama 3.1 8B, conserva capacidades generales de comprensión del lenguaje, aunque su especialización limita su uso fuera de la tarea de segmentación.
- **Soporte de chat**: al ser un modelo Instruct, puede utilizarse con plantillas de chat estándar (system, user, assistant) para guiar la generación.
- **Inferencia eficiente**: la cuantización 4-bit permite ejecutar el modelo en hardware con VRAM limitada, manteniendo una calidad aceptable para la tarea objetivo.

## Casos de uso

- **Análisis de reuniones empresariales**: dado un transcript con timestamps, el modelo genera automáticamente un índice de temas tratados, lo que facilita la revisión posterior y la búsqueda de decisiones concretas.
- **Generación de actas automáticas**: a partir de la salida JSON, se pueden construir actas estructuradas con resúmenes por bloque temático, ahorrando tiempo de redacción manual.
- **Indexación de contenido audiovisual**: transcripciones de podcasts, webinars o vídeos pueden segmentarse en capítulos temáticos para mejorar la navegación y la búsqueda dentro del contenido.
- **Integración en pipelines de productividad**: el modelo puede conectarse a herramientas de gestión de proyectos (Notion, Confluence) para extraer automáticamente los puntos de acción de una reunión.
- **Análisis de llamadas de soporte**: en centros de atención al cliente, permite clasificar las conversaciones por tema y detectar patrones de incidencias recurrentes.
- **Investigación cualitativa**: para investigadores que analizan entrevistas o grupos focales, la segmentación automática facilita la codificación y el análisis temático de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas cuantitativas (como exactitud en la detección de límites de sección, precisión de los resúmenes o comparación con otros modelos) en la model card ni en el repositorio. Por tanto, no es posible evaluar objetivamente el rendimiento del modelo frente a alternativas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de 8B parámetros cuantizado a 4-bit, el consumo de memoria aproximado es de **5-6 GB** para la carga del modelo en memoria, más overhead de activaciones y contexto. Esta cifra es una estimación orientativa basada en el tamaño del repositorio (5,7 GB) y no un dato oficial.
- **GPU recomendadas**: cualquier GPU NVIDIA con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070) puede ejecutar el modelo con comodidad. Para mayor velocidad, se recomiendan GPUs con soporte de bfloat16 y mayor ancho de banda, como RTX 4090 o A100.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo medio (8-12 GB) gracias a la cuantización 4-bit.
- **Opciones de despliegue**: el modelo se carga mediante la librería `transformers` con `device_map="auto"`, por lo que es compatible con `vLLM`, `TGI` (Text Generation Inference) y `llama.cpp` (si se convierte a GGUF). También puede usarse con `Ollama` si se exporta al formato adecuado.
- **Latencia y throughput**: no se proporcionan datos oficiales. En una GPU como RTX 4090, se espera una generación de aproximadamente 50-100 tokens por segundo para este tamaño de modelo, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de segmentación de transcripciones. El modelo se basa en Llama 3.1 8B Instruct, por lo que su comportamiento general es similar al de otros fine-tunes de la misma familia, pero no existen datos objetivos que permitan establecer una comparación cuantitativa. Como referencia, se puede mencionar que el modelo base Llama 3.1 8B tiene 128k de contexto y licencia de Meta (Llama 3.1 Community License), pero esta versión fine-tuneada no especifica su licencia ni confirma la longitud de contexto efectiva tras el ajuste.

## Limitaciones y advertencias

- **Sobresegmentación**: el modelo tiende a dividir conversaciones continuas en más secciones de las necesarias, lo que puede fragmentar el contenido de forma artificial.
- **Límites de tiempo poco realistas**: puede preferir límites de sección demasiado limpios (por ejemplo, redondear a minutos exactos) en lugar de ajustarse a los cambios reales de tema.
- **Influencia de patrones sintéticos**: al entrenarse con datos sintéticos, los títulos de las secciones pueden reflejar patrones artificiales que no se corresponden con el lenguaje natural de las reuniones reales.
- **JSON malformado**: en algunas ocasiones, el modelo puede generar JSON inválido o con campos incorrectos, lo que requiere validación y saneamiento posterior en producción.
- **Conjunto de datos reducido**: con solo 180 ejemplos de entrenamiento, la generalización a dominios o formatos de transcripción diferentes es limitada.
- **Licencia no especificada**: no se indica la licencia del modelo fine-tuneado, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en entornos productivos.
- **Modelo experimental**: el propio autor lo califica como experimental y reconoce que el juicio de límites de sección aún está en mejora.

## Enlaces

- [Modelo en Hugging Face (versión 4-bit)](https://huggingface.co/ClergeF/transcript-architect-llama3.1-8b-4bit)
- [Modelo base de precisión completa](https://huggingface.co/ClergeF/transcript-architect-llama3.1-8b)
- [Blog de Llama 3.1 de Meta](https://huggingface.co/blog/llama31)
- [Página oficial de Llama 3 de Meta](https://developer.meta.com/ai/models/llama-3/)
- [Repositorio de modelos Llama de Meta](https://github.com/meta-llama/llama-models)
