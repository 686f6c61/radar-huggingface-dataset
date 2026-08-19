# AlinaGonch/granite41-8b-squad-ratio-0.10-seed-43

## Resumen

El modelo `AlinaGonch/granite41-8b-squad-ratio-0.10-seed-43` es un ajuste fino (fine-tuning) del modelo base Granite 4.1 de IBM, en su variante de 8 mil millones de parámetros, realizado sobre el dataset SQuAD 2.0. El autor, Alina Hancharova, lo ha publicado como parte de un experimento para determinar la proporción óptima de muestras sin respuesta (unanswerable) en el conjunto de entrenamiento, fijando en este caso un ratio de 0.10 y una semilla de 43. Se trata de un modelo de investigación, sin una model card detallada, orientado a tareas de respuesta a preguntas extractivas y detección de preguntas imposibles.

La relevancia de este modelo radica en que explora un aspecto metodológico del entrenamiento de modelos de lenguaje: cómo afecta la proporción de ejemplos negativos (preguntas sin respuesta) al rendimiento final en tareas de QA. Aunque no se proporcionan métricas, el experimento puede aportar información útil para quienes trabajan en sistemas de pregunta-respuesta y en la calibración de datasets de entrenamiento. El modelo está disponible en formato safetensors y es compatible con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Granite 4.1 8B) |
| Parametros totales | 8.000 millones (aprox., segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 128k, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Granite 4.1 soporta multiples idiomas, pero no se especifica para este ajuste) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura densa de la familia Granite 4.1 de IBM, que emplea un transformer estándar con atención de múltiples cabezas y capas de normalización. No se dispone de detalles sobre el número de capas, dimensiones ocultas o mecanismos de atención específicos de esta variante, aunque el modelo base Granite 4.1 8B es conocido por su soporte de tool calling y razonamiento mejorado.

El entrenamiento consiste en un ajuste fino supervisado sobre el dataset SQuAD 2.0, que incluye preguntas con respuesta y preguntas sin respuesta (imposibles). El parámetro `ratio-0.10` indica que el 10% de las muestras de entrenamiento eran preguntas sin respuesta, y la semilla 43 fija la aleatoriedad del proceso. No se han publicado hiperparámetros de entrenamiento, régimen de precisión ni duración del proceso. Tampoco se menciona el uso de RLHF o DPO.

## Capacidades

- Respuesta a preguntas extractivas: el modelo puede identificar el fragmento de texto relevante dentro de un contexto dado para responder una pregunta.
- Detección de preguntas sin respuesta: al entrenarse con SQuAD 2.0, el modelo debería ser capaz de reconocer cuando una pregunta no tiene respuesta en el contexto proporcionado.
- Comprensión lectora: capacidad de procesar un pasaje de texto y extraer información concreta.
- No se han documentado capacidades adicionales como generación de código, tool calling o razonamiento multi-paso, aunque al derivar de Granite 4.1 podría heredar algunas, pero no está confirmado para este ajuste.

## Casos de uso

- Sistemas de búsqueda de información en documentos: el modelo puede utilizarse para extraer respuestas concretas de manuales técnicos, artículos o bases de conocimiento, indicando cuando no hay información suficiente.
- Asistentes de atención al cliente: integrado en un pipeline de QA, puede responder preguntas frecuentes basadas en una base de conocimiento y señalar consultas que no pueden resolverse con los datos disponibles.
- Evaluación de datasets de QA: sirve como herramienta de investigación para medir el impacto de la proporción de preguntas sin respuesta en el rendimiento de modelos de lenguaje.
- Análisis de contratos o documentos legales: permite localizar cláusulas específicas o identificar la ausencia de información relevante en un texto.
- Herramientas educativas: puede generar preguntas y respuestas a partir de material de estudio, ayudando a los estudiantes a verificar su comprensión.
- Prototipos de motores de búsqueda semántica: combinado con un indexador, el modelo puede responder consultas directas sobre fragmentos de texto y descartar aquellas sin respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o SQuAD F1/EM para este modelo concreto. Al ser un experimento metodológico, el autor no ha compartido evaluaciones comparativas.

## Requisitos de hardware

- VRAM estimada: para un modelo de 8B parámetros en precisión fp16 se necesitan aproximadamente 16 GB de VRAM. Con cuantización de 4 bits, podría reducirse a unos 6-8 GB, pero no se han publicado cuantizaciones oficiales.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 o H100. En consumer, una RTX 4080 o 4090 sería suficiente con cuantización.
- Despliegue: al ser un modelo de transformers, puede ejecutarse con librerías como vLLM, TGI o llama.cpp si se convierte a GGUF. No hay integraciones específicas documentadas.
- Latencia y throughput: no disponible. Dependerá del hardware y de la optimización elegida.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables en el mismo experimento (el autor ha publicado varias variantes con diferentes ratios, como `ratio-0.30`). El modelo base Granite 4.1 8B de IBM es la referencia natural, pero no se han publicado comparativas directas. Otras alternativas para QA extractivo podrían ser modelos como BERT-large o RoBERTa-large ajustados en SQuAD, pero no se dispone de datos para una comparación rigurosa.

## Limitaciones y advertencias

- Modelo experimental sin documentación completa: la model card es genérica y no detalla el proceso de entrenamiento, datos exactos ni métricas.
- Posibles sesgos heredados del dataset SQuAD 2.0, que proviene de artículos de Wikipedia y puede reflejar sesgos de contenido y estilo.
- Riesgo de alucinación: aunque el modelo está entrenado para detectar preguntas sin respuesta, puede generar respuestas incorrectas si no se usa adecuadamente el contexto.
- Licencia no especificada: no se puede garantizar el uso comercial sin consultar al autor.
- Limitaciones de idioma: no se indica qué idiomas soporta; probablemente el entrenamiento se realizó en inglés (SQuAD es inglés), por lo que su rendimiento en otros idiomas es incierto.
- Sin garantías de producción: al ser un experimento de investigación, no se recomienda su uso en entornos críticos sin una validación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlinaGonch/granite41-8b-squad-ratio-0.10-seed-43
- Repositorio de IBM Granite 4.0/4.1: https://github.com/ibm-granite/granite-4.0-language-models
- Documentación oficial de Granite 4.1: https://www.ibm.com/granite/docs/models/granite4-1
