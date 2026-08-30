# ajrayman/Artistic_Interests_continuous

## Resumen

El modelo `ajrayman/Artistic_Interests_continuous` es un fine-tuning de `roberta-base` (FacebookAI) orientado a tareas de regresión sobre texto, concretamente para predecir una puntuación continua relacionada con intereses artísticos. Fue desarrollado por el usuario de Hugging Face `ajrayman` (Adam) y publicado en agosto de 2024. Aunque el pipeline declarado es `text-classification`, las métricas de evaluación (RMSE, MAE, correlación) indican que se trata de un modelo de regresión que asigna una puntuación numérica a cada texto de entrada.

El modelo se basa en la arquitectura transformer encoder de RoBERTa, con aproximadamente 124,6 millones de parámetros, y se distribuye bajo licencia MIT. Su relevancia actual es limitada: se trata de un experimento de fine-tuning sin documentación detallada ni benchmarks públicos, pero puede servir como punto de partida para tareas de análisis de afinidad o puntuación de contenido en el ámbito artístico. No se dispone de información sobre el dataset de entrenamiento ni sobre la longitud de contexto soportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) |
| Parametros totales | 124.646.401 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa-base soporta 512 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | no disponible (RoBERTa-base está entrenado en inglés, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `roberta-base`, un transformer encoder con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. La capa de salida se ha sustituido por una cabeza de regresión que produce un valor continuo. El entrenamiento se realizó con los siguientes hiperparámetros: learning rate 2e-05, batch size 32, optimizador Adam (betas 0.9/0.999, epsilon 1e-08), scheduler lineal con warmup ratio 0.06 y 8 épocas. El dataset de entrenamiento no está especificado (aparece como "None" en la model card). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La innovación técnica es nula: se trata de un fine-tuning estándar con la librería Transformers.

## Capacidades

- Regresión de texto: asigna una puntuación continua a un texto de entrada, presumiblemente relacionada con el grado de interés artístico.
- Clasificación binaria o multiclase: aunque el pipeline es text-classification, las métricas de evaluación (RMSE, MAE, correlación) sugieren que la salida es un valor numérico, no una etiqueta discreta.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: no disponibles; RoBERTa-base está entrenado principalmente en inglés, pero no se confirma para este modelo.

## Casos de uso

- Análisis de afinidad en encuestas de opinión: el modelo puede puntuar respuestas abiertas sobre preferencias artísticas, permitiendo cuantificar el grado de interés de los encuestados.
- Moderación de contenido creativo: asignar una puntuación de "interés artístico" a descripciones de obras o propuestas, útil para plataformas de crowdsourcing o concursos.
- Filtrado de recomendaciones: integrar el modelo en un sistema de recomendación para ordenar ítems (libros, películas, música) según la afinidad estimada del usuario a partir de reseñas textuales.
- Evaluación de textos generados: puntuar la "artisticidad" de textos producidos por otros modelos generativos, como métrica auxiliar en pipelines de control de calidad.
- Investigación en psicometría: usar el modelo como herramienta de medición de intereses artísticos en estudios de comportamiento, aunque con cautela por su baja correlación.
- Prototipado rápido: dado su pequeño tamaño y licencia MIT, sirve como base para experimentos de fine-tuning adicionales en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index de Hugging Face está vacío. Sin embargo, la model card reporta las siguientes métricas de evaluación sobre el conjunto de validación (declaradas por el autor):

| Metrica | Valor |
|---|---|
| Loss | 0.0617 |
| RMSE | 0.2485 |
| MAE | 0.1958 |
| Correlacion (Corr) | 0.2751 |

Estos valores indican un error moderado y una correlación baja (0.27), lo que sugiere una capacidad predictiva limitada. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 125M parámetros, en fp32 ocupa aproximadamente 500 MB; en fp16 se reduce a ~250 MB. Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia. Para entrenamiento, una GPU con 8 GB (p. ej., RTX 3070) es adecuada.
- Opciones de despliegue: compatible con la librería Transformers de Hugging Face, por lo que puede servirse con vLLM, TGI o directamente con pipelines de Transformers. También es posible exportarlo a ONNX o TensorRT.
- Latencia y throughput: no se dispone de datos medidos, pero al ser un modelo pequeño, la inferencia es rápida (del orden de milisegundos por muestra en GPU).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Como referencia genérica, otros fine-tunes de `roberta-base` para regresión de texto (p. ej., modelos de análisis de sentimiento con puntuación continua) tendrían características similares en cuanto a tamaño y arquitectura, pero no se pueden citar datos concretos sin fuentes. La comparativa queda pendiente de documentación adicional.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no especifica el dataset de entrenamiento, el dominio de aplicación ni los límites de uso. Esto dificulta evaluar su fiabilidad en producción.
- Baja correlación predictiva: la correlación de 0.27 en validación indica que el modelo explica solo una pequeña parte de la varianza, por lo que sus predicciones deben interpretarse con cautela.
- Sesgos potenciales: al estar basado en RoBERTa, puede heredar sesgos de género, raza o cultura presentes en los datos de preentrenamiento. El fine-tuning adicional podría amplificarlos.
- Riesgo de alucinación: al ser un modelo de regresión, no genera texto, por lo que el riesgo de alucinación es nulo en ese sentido. Sin embargo, las puntuaciones pueden ser inconsistentes para entradas fuera del dominio de entrenamiento.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero al no conocerse el dataset de entrenamiento, podrían existir problemas de propiedad intelectual si los datos provienen de fuentes con derechos.
- Limitaciones de contexto: RoBERTa-base tiene una ventana de 512 tokens; entradas más largas se truncarán, lo que puede degradar la precisión en textos extensos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ajrayman/Artistic_Interests_continuous)
- [Perfil del autor en Hugging Face](https://huggingface.co/ajrayman)
- [Modelo base roberta-base](https://huggingface.co/FacebookAI/roberta-base)
