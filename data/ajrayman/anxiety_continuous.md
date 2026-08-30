# ajrayman/Anxiety_continuous

## Resumen

Anxiety_continuous es un modelo de clasificación de texto fine-tuneado a partir de [roberta-base](https://huggingface.co/FacebookAI/roberta-base), desarrollado por el usuario ajrayman (Adam) y publicado en Hugging Face en agosto de 2024. El modelo está diseñado para predecir un valor continuo de ansiedad a partir de texto, probablemente como parte de una serie de modelos de rasgos psicológicos (el mismo autor publica otros como machiavellianism_continuous o Cooperation_binary). Se trata de una tarea de regresión sobre texto, no de clasificación binaria, lo que lo diferencia de los clasificadores de emociones habituales.

Con 124,6 millones de parámetros, hereda la arquitectura transformer encoder de RoBERTa, con una ventana de contexto de 512 tokens. Su relevancia radica en la creciente demanda de herramientas de análisis de salud mental y bienestar basadas en lenguaje natural, aunque la documentación pública es muy escasa: la model card está generada automáticamente y no se especifica el dataset de entrenamiento ni los casos de uso previstos. El modelo se distribuye con licencia MIT, lo que permite uso comercial sin restricciones, y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) |
| Parametros totales | 124.646.401 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (heredado de roberta-base) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32/fp16) |
| Idiomas soportados | no disponible (roberta-base esta entrenado principalmente en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de roberta-base, un transformer encoder de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención. La capa de salida se ha sustituido por una cabeza de regresión lineal que produce un valor escalar continuo, en lugar de una distribución de clases. El entrenamiento se realizó con el Trainer de Hugging Face, usando los siguientes hiperparámetros: learning rate 2e-5, batch size 32, 8 épocas, scheduler lineal con warmup del 6% y optimizador Adam. No se especifica el dataset (aparece como "None" en la model card), ni se menciona ningún proceso de RLHF o DPO. La función de pérdida es probablemente MSE (dado que se reportan RMSE y MAE), y la correlación de Pearson (Corr) se usa como métrica adicional.

No hay información sobre innovaciones técnicas más allá del fine-tune estándar. El modelo no incorpora decodificación especulativa, atención lineal ni ningún mecanismo especial.

## Capacidades

- Regresión de texto: predice un valor continuo (presumiblemente un nivel de ansiedad) a partir de un texto de entrada.
- Clasificación de texto: aunque la salida es continua, puede usarse con un umbral para clasificación binaria o multicategoría.
- Análisis de sentimiento y emociones: al estar fine-tuneado sobre un rasgo psicológico, puede capturar matices emocionales en el lenguaje.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Multilingüe: no confirmado; roberta-base es principalmente inglés, por lo que se espera que el modelo funcione mejor en inglés.
- Sin capacidades de visión ni audio.

## Casos de uso

- Detección temprana de ansiedad en redes sociales: el modelo puede analizar publicaciones o comentarios para estimar un nivel de ansiedad, útil para estudios de salud pública o plataformas de apoyo.
- Investigación psicológica: permite cuantificar la ansiedad expresada en diarios personales, entrevistas o respuestas abiertas de cuestionarios, facilitando análisis correlacionales.
- Soporte a profesionales de salud mental: como herramienta de triaje en chats o formularios, priorizando casos con puntuaciones altas de ansiedad.
- Monitorización de bienestar en entornos laborales: análisis de encuestas de clima laboral o comunicaciones internas para detectar patrones de estrés.
- Análisis de contenido en medios: evaluar el nivel de ansiedad en artículos, guiones o discursos, útil para estudios de comunicación.
- Desarrollo de chatbots empáticos: integrar el modelo como módulo de detección de estado emocional para adaptar respuestas en asistentes conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye solo métricas de evaluación del propio autor sobre un conjunto de validación no especificado:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0.0606 |
| RMSE | 0.2462 |
| MAE | 0.1958 |
| Correlacion de Pearson | 0.4078 |

Estos valores indican un error absoluto medio de aproximadamente 0.2 sobre una escala no conocida, y una correlación moderada (0.41) entre predicciones y valores reales. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 125M parámetros, la inferencia en fp32 requiere aproximadamente 500 MB de VRAM; en fp16, unos 250 MB. La carga del modelo completo con overhead puede necesitar entre 1 y 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, incluyendo GTX 1650, RTX 3050, RTX 4090, A100, etc. También puede ejecutarse en CPU con razonable velocidad.
- Compatibilidad con GPUs de consumo: sí, cabe en cualquier GPU consumer moderna.
- Opciones de despliegue: transformers (Python), ONNX Runtime, TensorRT, o servidores de inferencia como Hugging Face Inference Endpoints, vLLM (aunque no está optimizado para modelos encoder), o llama.cpp (con conversión a GGUF, aunque no es el formato nativo).
- Latencia y throughput: no disponible, pero para un modelo de este tamaño, en una GPU moderna se esperan latencias de milisegundos por lote pequeño (por ejemplo, <10 ms en RTX 3090).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para regresión de ansiedad. Como referencia, se puede comparar con el modelo base roberta-base y con otros fine-tunes de clasificación de emociones:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Anxiety_continuous | 124.6M | 512 | Regresion de ansiedad | MIT |
| roberta-base | 124.6M | 512 | Modelo base (masked LM) | MIT |
| cardiffnlp/twitter-roberta-base-sentiment | 124.6M | 512 | Clasificacion de sentimiento (3 clases) | MIT |

La comparativa es limitada porque no hay modelos públicos equivalentes para regresión de ansiedad. El modelo se distingue por su salida continua, mientras que la mayoría de modelos de emociones usan clasificación discreta.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de roberta-base, hereda los sesgos de género, raza y cultura presentes en sus datos de entrenamiento (principalmente texto en inglés de Common Crawl y similares).
- Riesgo de alucinación: al ser un modelo de regresión, no genera texto, pero puede producir puntuaciones poco fiables en dominios fuera de su distribución de entrenamiento.
- Limitaciones de contexto: ventana de 512 tokens, insuficiente para documentos largos sin truncamiento.
- Limitaciones de idioma: no se ha verificado su rendimiento en español u otros idiomas; probablemente degrade significativamente fuera del inglés.
- Datos de entrenamiento desconocidos: la model card no especifica el dataset, lo que impide evaluar su generalización y posibles sesgos específicos.
- Sobreajuste: el entrenamiento con 8 épocas y un dataset no documentado puede provocar sobreajuste a los datos de validación, como sugiere la caída de correlación en la última época (0.4078 vs 0.4463 en la época 4).
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre la precisión clínica del modelo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ajrayman/Anxiety_continuous)
- [Perfil del autor en Hugging Face](https://huggingface.co/ajrayman)
- [Modelo base roberta-base](https://huggingface.co/FacebookAI/roberta-base)
