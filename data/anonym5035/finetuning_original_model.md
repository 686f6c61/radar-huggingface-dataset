# anonym5035/finetuning_original_model

## Resumen

Este repositorio no contiene un modelo de lenguaje en sí, sino el **pipeline de fine-tuning** y los resultados de evaluación del modelo causal **XpertGPT** (`anonym5035/swi_glu_sw_64_16_8_4_xpert_gpt`), desarrollado para la competición **BabyLM 2026** en la pista **Strict-Small**. El autor, `anonym5035`, ha compartido el script `finetune_eval.py` que permite adaptar el modelo preentrenado a nueve tareas de clasificación y opción múltiple, evitando la generación autoregresiva y utilizando cabezas de clasificación específicas.

El objetivo principal es demostrar un proceso de fine-tuning robusto y reproducible en un entorno con recursos limitados (2 GPU T4), con hiperparámetros adaptados al tamaño de cada dataset para prevenir el sobreajuste. La relevancia actual reside en que ofrece un ejemplo práctico de cómo evaluar y adaptar modelos causales pequeños a tareas de comprensión del lenguaje (GLUE, SWAG, etc.) sin necesidad de infraestructura de gran escala. Los resultados de validación muestran un rendimiento competitivo en varias de estas tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (detalles del modelo base no disponibles) |
| Parametros totales | no disponible (modelo base no especificado) |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens (truncado a 128 para fine-tuning) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (se asume ingles, por las tareas) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene script y resultados, no pesos) |

## Arquitectura y entrenamiento

El repositorio documenta el **fine-tuning** de un modelo causal preentrenado llamado `XpertGPT`, pero no proporciona detalles sobre su arquitectura interna. El proceso se centra en la adaptación a tareas de clasificación y opción múltiple mediante cabezas de clasificación, descartando la generación autoregressiva. El entrenamiento utiliza el optimizador `AdamW` con un ratio de warmup del 6% y una programación de tasa de aprendizaje con decaimiento lineal. El pooling se realiza tomando exactamente el último token de la secuencia, una técnica robusta para extraer la representación final.

Los hiperparámetros se agrupan según el tamaño del dataset para evitar sobreajuste: las tareas grandes (~105K a ~33K ejemplos) usan 3 épocas, las medianas (~8.5K a ~5K) usan 5 épocas, y las pequeñas (~400 a ~250) usan 5 épocas con una tasa de aprendizaje mayor. El entrenamiento se ejecuta en 2 GPU T4 con `nn.DataParallel` para escalar el tamaño de lote automáticamente. El script sube automáticamente los resultados (`results/finetune_results.json`) y el historial de entrenamiento (`results/training_history.json`) al repositorio de HuggingFace.

## Capacidades

- **Clasificación de texto binaria**: tareas como QNLI (implicación textual), SST-2 (análisis de sentimiento) y CoLA (aceptabilidad gramatical).
- **Razonamiento de sentido común**: tareas como SWAG, Social IQa y WinoGrande, que requieren elegir la continuación o respuesta más plausible.
- **Comprensión lectora y razonamiento**: OpenBookQA y COPA, que requieren inferencia causal y conocimiento del mundo.
- **Clasificación de compromiso**: CommitmentBank, que evalúa el grado de compromiso del hablante con una premisa.
- **No incluye generación de texto**: el pipeline evita la generación autoregressiva, por lo que no es adecuado para tareas de texto libre.
- **No soporta tool calling ni agentes**: no se mencionan capacidades de invocación de herramientas.

## Casos de uso

- **Evaluación de modelos de lenguaje pequeños**: el pipeline es ideal para investigadores que necesitan comparar modelos compactos en un conjunto de tareas de comprensión estándar (GLUE, SWAG, etc.).
- **Análisis de sentimiento**: la tarea SST-2 permite adaptar el modelo para clasificar opiniones en textos, útil en sistemas de monitorización de redes sociales o reseñas.
- **Comprobación gramatical**: la tarea CoLA puede usarse para detectar errores de aceptabilidad gramatical en textos, útil en correctores automáticos.
- **Razonamiento de sentido común**: las tareas SWAG, Social IQa y WinoGrande son útiles para desarrollar sistemas de preguntas y respuestas que requieren inferencias de sentido común.
- **Clasificación de implicación textual**: QNLI permite construir sistemas de respuesta a preguntas que verifican si una hipótesis está implicada por una premisa.
- **Investigación en eficiencia de entrenamiento**: el diseño del pipeline, con hiperparámetros adaptados al tamaño del dataset, es un ejemplo de buenas prácticas para ajustar modelos en entornos con recursos limitados (2x T4).

## Benchmarks y rendimiento

El repositorio incluye resultados de validación de accuracy para cada tarea. No se han publicado comparaciones con otros modelos en la información proporcionada.

| Tarea | Accuracy (validación) |
|---|---|
| QNLI | 78.4 |
| SWAG | 76.7 |
| Social IQa | 74.3 |
| WinoGrande | 75.2 |
| SST-2 | 91.5 |
| CoLA | 64.2 |
| OpenBookQA | 68.0 |
| COPA | 72.5 |
| CommitmentBank | 65.3 |

## Requisitos de hardware

- **GPU**: El pipeline se ejecutó en 2 GPU T4 (16GB cada una) con `DataParallel`.
- **VRAM**: Dado el tamaño del modelo (no especificado) y el uso de secuencias de 128 tokens, la VRAM estimada para fine-tuning en T4 es suficiente (16 GB).
- **Inferencia**: no se especifican requisitos de inferencia, pero un modelo pequeño con arquitectura similar a XpertGPT puede caber en GPU de consumo como una RTX 3060 o RTX 4060 con cuantización.
- **Opciones de despliegue**: no se mencionan herramientas específicas como vLLM u Ollama; el script usa `transformers` y `datasets` de HuggingFace.

## Comparativa con modelos similares

No se han proporcionado datos de comparación con otros modelos. Sin embargo, dado que se trata de un modelo para la competición BabyLM 2026 (pista Strict-Small), es probable que compita con modelos de tamaño similar (menos de 50 millones de parámetros) como los presentados en ediciones anteriores de BabyLM (por ejemplo, modelos basados en arquitecturas como RoBERTa-base o GPT-2 pequeño). No se dispone de información suficiente para una comparativa cuantitativa.

## Limitaciones y advertencias

- **No es un modelo de generación**: el pipeline está diseñado exclusivamente para tareas de clasificación y opción múltiple; no es adecuado para generar texto libre.
- **Sesgos y alucinación**: no se han evaluado sesgos ni riesgos de alucinación en el modelo base.
- **Idioma**: no se especifica el idioma de entrenamiento, pero las tareas son en inglés; el modelo puede no funcionar bien en otros idiomas.
- **Licencia**: la licencia no está especificada, por lo que se desconoce si es apto para uso comercial.
- **Tamaño de contexto**: el contexto de 1024 tokens (truncado a 128 para fine-tuning) es limitado para tareas que requieren contextos largos.
- **Dependencia de recursos**: el fine-tuning requiere de un script externo (`finetune_eval.py`) que no está documentado más allá de lo mostrado; la reproducibilidad puede verse afectada por la versión de las bibliotecas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/anonym5035/finetuning_original_model
- Modelo base (referencia): `anonym5035/swi_glu_sw_64_16_8_4_xpert_gpt`
- Script de fine-tuning: https://huggingface.co/anonym5035/finetuning_original_model/raw/main/finetune_eval.py

No se han encontrado papers o blogs adicionales asociados a este repositorio.
