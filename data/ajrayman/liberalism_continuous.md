# ajrayman/Liberalism_continuous

## Resumen

Liberalism_continuous es un modelo de clasificación de texto desarrollado por ajrayman (Adam), obtenido mediante fine-tuning de roberta-base sobre un conjunto de datos no especificado. Está diseñado para predecir una puntuación continua relacionada con el liberalismo, probablemente como parte de una serie de modelos orientados al análisis de rasgos psicológicos o ideológicos (el autor también publica modelos como machiavellianism_continuous o Cooperation_binary).

El modelo emplea la arquitectura RoBERTa base, con 124,6 millones de parámetros, y produce una salida numérica continua (regresión) en lugar de una clasificación binaria. Su relevancia radica en su especialización en medir una dimensión ideológica concreta, lo que lo hace útil para investigación en ciencias sociales, análisis de contenido político y estudios de sesgo en IA. Sin embargo, la documentación disponible es muy limitada: no se especifica el dataset de entrenamiento, los idiomas soportados ni los casos de uso previstos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa base (Transformer encoder) |
| Parametros totales | 124.646.401 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredada de roberta-base) |
| Tipos de cuantizacion | no disponible (formato safetensors en fp32) |
| Idiomas soportados | no disponible (probablemente ingles, por el modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder con atención bidireccional, 12 capas, 12 cabezas de atención y una dimensión oculta de 768. La cabeza de clasificación original de roberta-base se sustituye por una capa de regresión que produce una salida continua. El fine-tuning se realizó con el Trainer de Hugging Face durante 8 épocas, con un learning rate de 2e-05, batch size de 32, scheduler lineal con warmup del 6% y optimizador Adam. La pérdida de entrenamiento final fue de 0,0724, con un RMSE de validación de 0,2414 y una correlación de 0,3094.

No se ha publicado información sobre el dataset de entrenamiento, su composición, el número de ejemplos ni el proceso de anotación. Tampoco se detalla si se aplicaron técnicas de regularización adicionales o aumentación de datos. El modelo se generó automáticamente con el Trainer, lo que sugiere un proceso de fine-tuning estándar sin innovaciones arquitectónicas destacables.

## Capacidades

- Regresión de una puntuación continua de liberalismo a partir de texto.
- Clasificación de texto basada en el modelo base RoBERTa, que captura representaciones contextuales profundas.
- Salida numérica interpretable como un grado o intensidad, no como una etiqueta binaria.
- Compatible con el ecosistema transformers de Hugging Face para inferencia y fine-tuning adicional.
- No se han documentado capacidades de generación de texto, tool calling, agentes ni multimodales.

## Casos de uso

- Investigación en ciencias políticas: el modelo puede puntuar automáticamente textos (discursos, programas electorales, publicaciones en redes sociales) en una escala continua de liberalismo, facilitando estudios cuantitativos sobre ideología política.
- Análisis de sesgo en medios: permite medir el sesgo ideológico de artículos periodísticos o columnas de opinión, asignando una puntuación que puede correlacionarse con la línea editorial de cada medio.
- Estudios de opinión pública: aplicable a encuestas abiertas o comentarios de usuarios para estimar la distribución ideológica de una muestra poblacional.
- Filtrado de contenido político: en plataformas de recomendación, puede utilizarse para clasificar contenido según su orientación ideológica y personalizar feeds.
- Análisis de redes sociales: permite monitorizar la evolución del discurso político en Twitter o foros, detectando cambios en la polarización o en la retórica liberal.
- Evaluación de sesgo en LLMs: puede emplearse como herramienta para medir el sesgo ideológico de las respuestas generadas por otros modelos de lenguaje, comparando la puntuación de liberalismo de sus salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card solo incluye métricas de validación declaradas por el autor:

| Metrica | Valor |
|---|---|
| Validation Loss | 0,0583 |
| RMSE | 0,2414 |
| MAE | 0,1923 |
| Correlacion | 0,3094 |

Estas métricas corresponden al conjunto de evaluación utilizado durante el entrenamiento, pero no se especifica su tamaño ni composición. No hay comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en fp32 (el modelo tiene 124M parámetros, unos 500 MB en fp32).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo GPUs de consumo como GTX 1060, RTX 2060 o superiores.
- Cabe en GPUs de consumo: sí, con margen amplio.
- Opciones de despliegue: transformers (Python), ONNX Runtime, TensorRT, o servidores de inferencia como Hugging Face Inference Endpoints.
- Latencia estimada: en CPU moderna, inferencia en menos de 100 ms por secuencia corta; en GPU, del orden de 10-20 ms.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un fine-tuning especializado de roberta-base, por lo que su rendimiento en la tarea de regresión de liberalismo solo podría compararse con otros modelos fine-tuned sobre el mismo dataset, que no se ha hecho público. Alternativas genéricas de clasificación de texto como distilbert-base-uncased o bert-base-uncased podrían adaptarse a la misma tarea, pero no existen datos de rendimiento comparables.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos de roberta-base y del dataset de entrenamiento no publicado, que podría estar sesgado hacia ciertos registros lingüísticos o ideologías.
- Riesgo de alucinación: al ser un modelo de regresión, no genera texto, por lo que el riesgo de alucinación es bajo; el riesgo principal es la predicción de puntuaciones incorrectas en textos fuera del dominio de entrenamiento.
- Limitaciones de contexto: ventana de 512 tokens, inadecuada para documentos largos sin truncamiento.
- Limitaciones de idioma: no se especifican idiomas soportados; probablemente solo inglés, dado el modelo base.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones, pero el dataset de entrenamiento no se ha publicado, lo que limita la reproducibilidad.
- Caveat para producción: la correlación de 0,3094 es baja, lo que sugiere una capacidad predictiva limitada; no recomendado para aplicaciones críticas sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajrayman/Liberalism_continuous
- Perfil del autor: https://huggingface.co/ajrayman
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
