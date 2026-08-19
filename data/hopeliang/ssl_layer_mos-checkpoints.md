# HopeLiang/SSL_Layer_MOS-checkpoints

## Resumen

SSL_Layer_MOS es un modelo de predicción de la calidad de voz mediante la estimación de la puntuación media de opinión (MOS, por sus siglas en inglés). Desarrollado por HopeLiang, este repositorio contiene los checkpoints de las cabezas de proyección entrenadas para el trabajo *Selection of Layers from Self-supervised Learning Models for Predicting Mean-Opinion-Score of Speech*, presentado en IEEE ASRU 2025. El modelo resuelve el problema de evaluar automáticamente la calidad percibida del habla sin necesidad de escuchas humanas, seleccionando capas óptimas de modelos de aprendizaje autosupervisado (SSL) como wav2vec2, HuBERT u otros similares.

La arquitectura consiste en un modelo SSL preentrenado (cuyas capas se extraen) seguido de una cabeza de proyección entrenada para predecir el MOS. El repositorio organiza los checkpoints por dataset de evaluación (NISQA, Tencent y BVCC) y por combinación de modelo SSL, capa y ejecución. El tamaño total del repositorio es de 0,7 GB, aunque cada checkpoint individual es pequeño al tratarse solo de la cabeza de proyección. No se especifica el número de parámetros totales ni la longitud de contexto, ya que el modelo procesa audio y no texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo SSL (no especificado) + cabeza de proyección para regresión de MOS |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la calidad de voz es independiente del idioma, pero no se especifican) |
| Licencia | no disponible (se debe consultar a los autores; se deben respetar las licencias de los modelos SSL subyacentes) |
| Formato de pesos | PyTorch (`.pt`) y configuración Gin (`.gin`) |

## Arquitectura y entrenamiento

El modelo se basa en la extracción de representaciones de capas intermedias de modelos de aprendizaje autosupervisado (SSL) preentrenados para el habla. Para cada capa seleccionada, se entrena una cabeza de proyección (una red neuronal de regresión) que predice el MOS a partir de las características extraídas. El trabajo investiga qué capas de los modelos SSL son más adecuadas para la tarea de predicción de calidad, lo que permite optimizar el rendimiento sin necesidad de entrenar un modelo completo desde cero.

El entrenamiento se realiza de forma supervisada sobre conjuntos de datos etiquetados con MOS humanos, como NISQA, Tencent y BVCC. Cada ejecución incluye los checkpoints de la cabeza de proyección, la configuración Gin y los registros para reproducibilidad. No se proporcionan detalles sobre el número de tokens de entrenamiento, el tamaño del dataset ni si se emplearon técnicas como RLHF o DPO, ya que se trata de un modelo de regresión y no de generación.

## Capacidades

- Predicción de la puntuación media de opinión (MOS) para evaluar la calidad percibida del habla.
- Selección de capas óptimas de modelos SSL para la tarea de evaluación de calidad.
- Soporte para múltiples modelos SSL y capas, según la organización del repositorio.
- Evaluación objetiva de calidad de voz sin necesidad de escuchas humanas.
- Reproducibilidad mediante configuraciones Gin y registros de entrenamiento.
- Compatibilidad con el código de inferencia del repositorio asociado en GitHub.

## Casos de uso

- Evaluación de sistemas de síntesis de voz (TTS): el modelo puede puntuar automáticamente la calidad de audios generados por motores TTS, permitiendo comparar distintas arquitecturas o configuraciones sin recurrir a paneles de escucha.
- Control de calidad en códecs de audio: al predecir el MOS, se puede monitorizar la degradación introducida por códecs en tiempo real o en lotes, ayudando a seleccionar el códec más adecuado para una aplicación.
- Monitorización de servicios de telecomunicaciones: en sistemas VoIP o llamadas telefónicas, el modelo puede estimar la calidad percibida por el usuario a partir de muestras de audio, facilitando la detección de problemas de red.
- Investigación en procesamiento de voz: los investigadores pueden utilizar el modelo para evaluar rápidamente el impacto de algoritmos de mejora de voz, separación de fuentes o reducción de ruido sobre la calidad percibida.
- Desarrollo de sistemas de mejora de voz: durante el entrenamiento o ajuste de modelos de realce, el predictor de MOS puede servir como función de pérdida o métrica de validación.
- Benchmarking de modelos de habla: permite comparar la calidad de salida de distintos sistemas de generación o procesamiento de voz de manera objetiva y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los checkpoints están organizados por dataset de evaluación (NISQA, Tencent, BVCC), pero no se incluyen métricas comparativas en la model card. Se recomienda consultar el paper asociado en IEEE ASRU 2025 para conocer el rendimiento detallado.

## Requisitos de hardware

- Los checkpoints individuales son ligeros (solo la cabeza de proyección), pero la inferencia requiere cargar un modelo SSL base completo (por ejemplo, wav2vec2 o HuBERT), que suele tener entre 300 y 600 millones de parámetros.
- Para inferencia en GPU, se recomienda al menos 8 GB de VRAM para modelos SSL medianos (como wav2vec2-base) y 16 GB o más para modelos grandes (wav2vec2-large).
- Es posible ejecutar la inferencia en CPU para audios cortos, aunque la latencia será mayor.
- El despliegue se realiza mediante Python con PyTorch, utilizando el código del repositorio oficial (https://github.com/Hope-Liang/SSL_Layer_MOS).
- No se proporcionan datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros predictores de MOS como NISQA, MOSNet o DNSMOS. Los datos de rendimiento, arquitectura y licencia de estos modelos no se han contrastado con el presente modelo en la información proporcionada. Se recomienda consultar el paper para obtener una comparación formal.

## Limitaciones y advertencias

- La licencia de los checkpoints no está especificada; se debe contactar con los autores para conocer los términos de uso.
- El uso de los checkpoints implica cumplir con las licencias de los modelos SSL subyacentes (por ejemplo, wav2vec2, HuBERT), que pueden tener restricciones comerciales.
- Los checkpoints están entrenados para datasets específicos (NISQA, Tencent, BVCC); su generalización a otros dominios o condiciones de grabación puede ser limitada.
- La predicción de MOS es inherentemente subjetiva y el modelo puede presentar sesgos derivados de los datos de entrenamiento.
- No se proporcionan detalles sobre la robustez frente a ruido, variaciones de acento o tipos de degradación no vistos durante el entrenamiento.
- Para uso en producción, se recomienda validar el modelo en el dominio objetivo y considerar la posibilidad de ajuste fino con datos propios.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/HopeLiang/SSL_Layer_MOS-checkpoints
- Repositorio de código en GitHub: https://github.com/Hope-Liang/SSL_Layer_MOS
- Paper asociado: *Selection of Layers from Self-supervised Learning Models for Predicting Mean-Opinion-Score of Speech* (IEEE ASRU 2025) - no se proporciona enlace directo en la información disponible.
