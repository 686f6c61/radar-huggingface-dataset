# Hailay/VEXMLM-Amharic-NER

## Resumen

VEXMLM-Amharic-NER es un modelo de clasificación de tokens (reconocimiento de entidades nombradas, NER) para amárico, desarrollado por Hailay Kidu Teklehaymanot y colaboradores. Se obtiene mediante fine-tuning de VEXMLM, una extensión de XLM-R con vocabulario ampliado con 30 000 tokens del alfabeto Ge'ez, sobre el corpus MasakhaNER en amárico. El modelo está pensado para entornos de bajos recursos lingüísticos, donde los modelos multilingües estándar suelen tener un rendimiento deficiente debido a la infrarrepresentación de estas lenguas en sus vocabularios.

La arquitectura es un transformer encoder del tipo XLM-R, con una cabeza de clasificación de tokens que produce etiquetas en formato BIO para cuatro tipos de entidad: persona (PER), organización (ORG), lugar (LOC) y fecha (DATE). Se publican cinco checkpoints independientes, uno por semilla (42 a 46), y el rendimiento reportado es la media y desviación estándar de las cinco ejecuciones sobre el split de test de MasakhaNER. El modelo alcanza una Entity-F1 de 63,47 ± 1,48, lo que representa una mejora sustancial frente a los baselines habituales en lenguas de escritura Ge'ez.

La relevancia de este trabajo radica en abordar el problema de la tokenización deficiente en lenguas etíopes, donde los modelos preentrenados multilingües como XLM-R no cubren adecuadamente los caracteres Ge'ez. Al extender el vocabulario y continuar el pretraining con MLM, se consigue un mejor rendimiento en tareas downstream como NER. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLMRobertaForTokenClassification (transformer encoder) |
| Parametros totales | No disponible (basado en XLM-R base con vocabulario extendido) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrenado con secuencias de 256 tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantizables con herramientas estandar) |
| Idiomas soportados | Amharic (am) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de VEXMLM, una variante de XLM-R base cuyo vocabulario SentencePiece se amplió de 250 000 a 280 002 subwords, incorporando 30 000 tokens específicos del alfabeto Ge'ez. Sobre esta base se realizó un pretraining continuado con enmascaramiento de lenguaje (MLM) antes del fine-tuning supervisado. El fine-tuning para NER se llevó a cabo sobre el corpus MasakhaNER en amárico, que proporciona anotaciones en formato BIO para PER, ORG, LOC y DATE (9 clases en total).

El entrenamiento se ejecutó en una GPU NVIDIA A100 de 40 GB, con una configuración fija: longitud máxima de secuencia de 256 tokens, tamaño de lote de 32, 4 épocas, tasa de aprendizaje de 2e-5 con decaimiento lineal y 10% de warmup, weight decay de 0,01, clipping de gradiente a 1,0 y optimizador AdamW. Se usó precisión bf16 y se entrenaron todos los parámetros. Cada una de las cinco semillas (42–46) se entrenó de forma independiente con la misma configuración, y se garantizó la reproducibilidad bit a bit mediante `enable_full_determinism` y variables de entorno específicas. Los resultados reportados son la media y desviación estándar de las cinco ejecuciones sobre el split de test.

## Capacidades

- Reconocimiento de entidades nombradas en amárico: identifica personas (PER), organizaciones (ORG), lugares (LOC) y fechas (DATE) en texto arbitrario.
- Clasificación de tokens con etiquetas BIO: cada token recibe una etiqueta de inicio (B-), continuación (I-) o fuera de entidad (O).
- Manejo de textos con caracteres Ge'ez gracias al vocabulario extendido, que mejora la tokenización frente a modelos multilingües estándar.
- Inferencia interactiva: permite introducir texto amárico y obtener los spans de entidades predichos, aunque las predicciones sobre entradas arbitrarias no reproducen necesariamente las métricas del benchmark.
- Reproducibilidad: se ofrecen cinco checkpoints (uno por semilla) para análisis de varianza y estudios de robustez.
- Integración con el ecosistema Hugging Face Transformers: carga sencilla mediante `AutoTokenizer` y `AutoModelForTokenClassification`.

No se incluyen capacidades de generación de texto, tool calling, agentes, visión ni audio, ya que se trata de un modelo exclusivamente discriminativo para clasificación de tokens.

## Casos de uso

- Extracción de entidades en noticias amáricas: permite identificar automáticamente personas, organizaciones, lugares y fechas en artículos periodísticos, facilitando la construcción de bases de datos de eventos y análisis de tendencias.
- Procesamiento de documentos históricos y religiosos: muchos corpus en amárico provienen de dominios religiosos y noticiosos; el modelo puede ayudar a digitalizar y estructurar información de manuscritos o archivos.
- Sistemas de búsqueda semántica: al extraer entidades, se pueden indexar documentos por personas, lugares u organizaciones, mejorando la recuperación de información en amárico.
- Asistencia a traductores y lingüistas: la identificación de entidades puede servir como paso previo en flujos de traducción automática o anotación manual, reduciendo el esfuerzo humano.
- Análisis de redes sociales y textos cortos: aunque el modelo se entrenó con secuencias de hasta 256 tokens, puede aplicarse a mensajes breves en amárico para detectar menciones a entidades.
- Evaluación comparativa de modelos para lenguas de bajos recursos: al ser un checkpoint público con cinco semillas, sirve como referencia para investigaciones sobre NER en lenguas etíopes y para validar nuevas técnicas de extensión de vocabulario.

## Benchmarks y rendimiento

El modelo reporta resultados sobre el split de test de MasakhaNER (amárico), obtenidos con cinco semillas independientes. La media y desviación estándar son las siguientes:

| Metrica | Valor |
|---|---|
| Entity-F1 | 63,47 ± 1,48 |
| Macro-F1 | 74,23 ± 1,22 |
| Accuracy | 94,13 ± 0,26 |

Estos resultados provienen de la evaluación de los cinco checkpoints publicados, no de inferencia interactiva. No se proporcionan comparaciones con otros modelos en la información disponible, aunque el trabajo asociado (paper aceptado en LM4UC @ IJCAI 2026) presenta comparativas con baselines de XLM-R sin extensión de vocabulario.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni GPU en la documentación del modelo.
- Dado que se basa en XLM-R base (aproximadamente 278 millones de parámetros), la inferencia en precisión fp32 requiere alrededor de 1,1 GB de VRAM solo para los pesos, por lo que es ejecutable en GPUs de consumo como NVIDIA GTX 1060 (6 GB), RTX 2060, RTX 3060, etc.
- Con cuantización (por ejemplo, int8 o int4), el consumo puede reducirse por debajo de 1 GB, permitiendo incluso ejecución en CPU con herramientas como llama.cpp u ONNX Runtime.
- Para fine-tuning adicional se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, A100, RTX 4090, V100) para manejar el lote de 32 con secuencias de 256 tokens.
- Opciones de despliegue: Hugging Face Transformers (Python), ONNX Runtime, TensorRT, y cualquier framework compatible con safetensors.
- La latencia de inferencia no está documentada, pero al tratarse de un modelo de tamaño medio, es del orden de decenas de milisegundos por secuencia en GPUs modernas.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos NER para amárico en la información proporcionada. El modelo se posiciona como una mejora sobre XLM-R base gracias a la extensión de vocabulario, pero no se publican números de XLM-R base sobre MasakhaNER en la model card. Alternativas genéricas como mBERT o AfriBERTa podrían usarse como referencia, pero no se reportan resultados en este repositorio. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está fine-tuneado exclusivamente para amárico; su rendimiento en otras lenguas Ge'ez (como tigriña) no está caracterizado, aunque la base VEXMLM las cubre parcialmente.
- Los corpus de entrenamiento provienen mayoritariamente de dominios religiosos y noticiosos, por lo que el modelo puede reflejar sesgos y distribuciones propias de esos ámbitos, y su comportamiento en otros dominios (por ejemplo, lenguaje coloquial o técnico) es desconocido.
- No se realizó búsqueda de hiperparámetros; la configuración es única y las comparaciones con baselines en el paper son de una sola semilla, lo que limita la generalización de las conclusiones.
- Las predicciones sobre texto arbitrario en la inferencia interactiva no reproducen necesariamente las métricas del benchmark, que se obtienen sobre el split de test de MasakhaNER.
- El tamaño del repositorio (6,0 GB) se debe a los cinco checkpoints; cada uno por separado ocupa aproximadamente 1,2 GB en fp32, lo que debe tenerse en cuenta para su descarga y almacenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia de los datos subyacentes (MasakhaNER) si se redistribuyen resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hailay/VEXMLM-Amharic-NER
- Modelo base VEXMLM: https://huggingface.co/Hailay/VEXMLM
- Repositorio oficial (código, lanzador de entrenamiento y evaluación): https://github.com/hailaykidu/VEXMLM
- Paper asociado (aceptado en LM4UC @ IJCAI 2026): "Expanding the Lexicon of Ge'ez Based African Languages: A Comparative Study of Amharic and Tigrinya" (Teklehaymanot, Yadeta, Nejdl)
