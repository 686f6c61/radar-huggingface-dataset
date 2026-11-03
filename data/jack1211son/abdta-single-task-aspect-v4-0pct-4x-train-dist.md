# jack1211son/abdta-single-task-aspect-v4-0pct-4x-train-dist

## Resumen

El modelo `abdta-single-task-aspect-v4-0pct-4x-train-dist` es un clasificador de texto basado en `microsoft/deberta-v3-large` (435 millones de parámetros) afinado por el usuario jack1211son para el análisis de tono en divulgaciones de riesgo (ABDTA, *aspect-based risk-disclosure tone analysis*) de memorias anuales de empresas cotizadas en Indonesia. Forma parte de una colección de checkpoints que exploran distintas variantes de aumento de datos (dropout de palabras clave de aspecto al 0 % o 25 %, y aumentación con pseudo-etiquetas 2x o 4x, balanceada o siguiendo la distribución de entrenamiento).

El modelo resuelve una tarea de clasificación multietiqueta: dado un fragmento de texto con palabras clave de riesgo y de aspecto inyectadas en el prompt, predice el tono (Positive, Negative, Neutral) y uno de los 14 aspectos financieros predefinidos (Economics, Profit|Loss, Dividend, Financing, Brand, Technology, Investment, Governance, Product|Service, M&A, Legal, Environment, Social&People, Political). Es relevante para quienes trabajan en análisis financiero automatizado sobre documentos regulatorios en inglés, aunque su ámbito declarado son las memorias anuales de empresas indonesias.

Se trata de un checkpoint final de la colección, pensado para reentrenamiento sobre datos de entrenamiento más validación. La entrada está limitada a 256 tokens y el modelo no predice precios de acciones ni rendimientos de inversión, solo clasifica el lenguaje de la divulgación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-large (transformer encoder con atención desacoplada y embedding de posición relativa) |
| Parametros totales | 435.076.110 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (límite de entrada declarado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `microsoft/deberta-v3-large`, un transformer encoder de 24 capas y 435 millones de parámetros que introduce atención desacoplada (contenido y posición calculados por separado) y embeddings de posición relativa. La tarea de cabecera es clasificación de secuencias (`AutoModelForSequenceClassification`), con dos salidas superpuestas: etiquetas de tono y etiquetas de aspecto.

El entrenamiento parte de un corpus de narrativas de memorias anuales de empresas cotizadas en Indonesia, con etiquetas de tono y aspecto. La variante `0pct` indica que no se aplicó dropout de palabras clave de aspecto durante el entrenamiento; `4x` indica aumentación con pseudo-etiquetas a 4x; `train-dist` indica que la distribución de aspectos sigue la del conjunto de entrenamiento en lugar de estar balanceada. El checkpoint está pensado para reentrenamiento final sobre entrenamiento más validación. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO (no aplicable en un encoder de clasificación).

## Capacidades

- Clasificación de tono en tres clases: Positive, Negative, Neutral.
- Clasificación de aspecto en 14 categorías financieras: Economics, Profit|Loss, Dividend, Financing, Brand, Technology, Investment, Governance, Product|Service, M&A, Legal, Environment, Social&People, Political.
- Procesamiento de entradas con formato específico que inyecta palabras clave de riesgo y de aspecto: `[Risk Keywords: <risk words> Aspect Keywords: <aspect words>] <sentence>`.
- Análisis de lenguaje de divulgación de riesgo en memorias anuales.
- No soporta tool calling ni function calling (es un encoder de clasificación, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis de sentimiento en memorias anuales: el modelo clasifica el tono de fragmentos de divulgación de riesgo de empresas indonesias, permitiendo agregar métricas de tono por aspecto (por ejemplo, tono negativo en Legal frente a positivo en Dividend) para comparar compañías.
- Monitorización regulatoria automatizada: integrado en un pipeline que procese memorias anuales en PDF, extraiga fragmentos y los clasifique por aspecto y tono, facilitando la revisión de divulgaciones de riesgo por parte de equipos de compliance.
- Investigación académica en finanzas: permite construir series de tono por aspecto a lo largo del tiempo para estudiar la relación entre lenguaje de divulgación y variables financieras, sin predecir precios directamente.
- Enriquecimiento de bases de datos financieras: clasificación por lotes de fragmentos de informes para etiquetar aspectos y tono, alimentando índices de sentimiento sectorial.
- Detección de cambios de tono en informes sucesivos: comparando clasificaciones año a año sobre los mismos aspectos (Governance, M&A, Environment) para identificar giros en la narrativa corporativa.
- Filtrado y priorización de documentos: en un corpus grande de memorias, clasificar primero por aspecto y tono para que analistas humanos revisen solo los fragmentos con tono negativo en aspectos críticos (Legal, Governance, Financing).
- Prototipado de sistemas de alerta temprana: usar las clasificaciones de tono negativo en aspectos de riesgo como señal para revisión manual, con la advertencia de que el modelo no predice rendimientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,7 GB solo para pesos (435 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, entre 2 y 3 GB.
- En FP16/BF16: alrededor de 0,9 GB de pesos, con un total estimado de 1,5 a 2 GB de VRAM.
- Cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB); también en GPUs de 4-8 GB con margen.
- GPU recomendadas para producción: T4, L4, A10G, A100 para lotes grandes; cualquier GPU con al menos 4 GB es suficiente para inferencia individual.
- Opciones de despliegue: `transformers` con PyTorch, Text Embeddings Inference (TEI) según los tags del repositorio, y endpoints compatibles. No se documenta soporte GGUF ni llama.cpp (es un encoder, no un modelo generativo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abdta-single-task-aspect-v4-0pct-4x-train-dist | 435 M | 256 tokens | Clasificación tono/aspecto financiero | no disponible | HuggingFace |
| microsoft/deberta-v3-large | 435 M | 512 tokens | Modelo base (encoder) | MIT | HuggingFace |
| FinBERT (ProsusAI/finbert) | ~110 M | 512 tokens | Sentimiento financiero (3 clases) | no disponible | HuggingFace |
| RoBERTa-base financiero (varias variantes) | ~125 M | 512 tokens | Sentimiento financiero | varía | HuggingFace |

La comparación directa con alternativas es limitada porque este modelo aborda una tarea muy específica (aspecto y tono sobre memorias anuales indonesias) y no publica benchmarks. FinBERT y variantes de RoBERTa financiero son alternativas más ligeras para sentimiento general, pero no cubren la clasificación por 14 aspectos ni el formato de inyección de palabras clave.

## Limitaciones y advertencias

- El modelo clasifica lenguaje de divulgación; no predice precios de acciones ni rendimientos de inversión, y no debe usarse como señal de trading directa.
- Entrada limitada a 256 tokens: fragmentos más largos deben truncarse o dividirse, lo que puede perder contexto.
- Solo soporta inglés, aunque el dominio declarado son memorias anuales de empresas indonesias; el rendimiento en otros idiomas o dominios no está documentado.
- Requiere el mismo formato de extracción de palabras clave de riesgo y aspecto que los notebooks del proyecto; un formato distinto puede degradar el rendimiento.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en fragmentos ambiguos o fuera de distribución.
- No se publican CSVs de evaluación a nivel de frase como activos del modelo, lo que dificulta la reproducibilidad de las métricas.
- El checkpoint está pensado para reentrenamiento final sobre entrenamiento más validación; su uso directo en producción sin validación adicional conlleva riesgo.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/jack1211son/abdta-single-task-aspect-v4-0pct-4x-train-dist
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
