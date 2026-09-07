# OneScience-Group/Saluki

## Resumen

Saluki es un modelo de aprendizaje profundo desarrollado por OneScience-Group para predecir la vida media de mRNA en mamíferos. A partir de la secuencia completa de mRNA, el modelo codifica conjuntamente el primer marco de codones y la información de sitios de empalme, y utiliza redes neuronales convolucionales (CNN) seguidas de unidades recurrentes cerradas (GRU) para aprender características de secuencia asociadas a la estabilidad del transcrito. Este modelo está diseñado para el ámbito de la biología computacional y la investigación en AI4S, y su implementación está validada en el entorno de hardware DCU con el toolkit DTK de OneScience.

La arquitectura combina capas de convolución 1D y max-pooling para extraer características locales, una GRU para agregar contexto de largo alcance y una capa totalmente conectada que produce una puntuación de vida media relativa. La entrada tiene una longitud fija de 12,288 posiciones con 6 canales (secuencia de nucleótidos, marco de lectura y sitios de empalme), y el modelo admite dos cabezas de salida independientes (data0/model0 y data1/model1) para distintas definiciones de vida media. El repositorio en Hugging Face no incluye información sobre el número total de parámetros ni sobre benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (convoluciones 1D + max-pooling) + GRU + capa totalmente conectada |
| Parametros totales | no disponible |
| Longitud de contexto | 12,288 nucleótidos (longitud de secuencia fija) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (etiqueta del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | HDF5 (.h5) |

## Arquitectura y entrenamiento

La arquitectura de Saluki procesa secuencias de mRNA de longitud completa. La entrada es un tensor de forma (batch, 12288, 6): los primeros 4 canales representan la secuencia de nucleótidos de RNA, el quinto canal marca el primer marco de lectura de codones dentro de la región codificante y el sexto canal identifica los sitios de empalme. El modelo aplica múltiples capas de convolución 1D seguidas de max-pooling para extraer características locales de la secuencia, y una GRU agrega información contextual de largo alcance. Finalmente, una capa totalmente conectada proyecta las características a una única puntuación de predicción de vida media.

El modelo define dos variantes (data0/model0 y data1/model1) que comparten la arquitectura pero tienen cabezas de salida independientes. El entrenamiento utiliza pérdida de error cuadrático medio (MSE), regularización L2 y el optimizador Adam. Los datos de entrenamiento y los pesos preentrenados provienen del conjunto de datos oficial de Zenodo (registro 6326409), aunque no se especifica el número de muestras ni la composición exacta del dataset en la información disponible.

## Capacidades

- Predicción de la vida media relativa de mRNA en mamíferos a partir de la secuencia completa del transcrito.
- Codificación conjunta del primer marco de codones y de los sitios de empalme como canales adicionales de entrada.
- Doble tarea de regresión mediante dos cabezas de salida independientes (data0 y data1), lo que permite entrenar y evaluar con diferentes definiciones de vida media.
- Evaluación con métricas de regresión como MSE, coeficiente de correlación de Pearson y R² sobre el conjunto de test oficial.
- Análisis de características de secuencia: el modelo puede servir como base para análisis de gradientes, mutagénesis in silico y análisis de motivos relacionados con la estabilidad del mRNA.
- Validación de compatibilidad: el modelo está adaptado para ejecutarse en el entorno DCU con el toolkit DTK de OneScience, incluyendo inferencia y entrenamiento en un solo dispositivo.
- Generación de puntuaciones de estabilidad que se correlacionan con la vida media, aunque el valor de salida es una puntuación relativa y no debe interpretarse directamente como horas.

## Casos de uso

- Diseño de vacunas de ARN mensajero: el modelo puede predecir la estabilidad de secuencias candidatas de mRNA antes de su síntesis, permitiendo seleccionar variantes con mayor vida media para mejorar la expresión de antígenos. Su capacidad para codificar el marco de codones y los sitios de empalme resulta útil en el diseño de secuencias optimizadas.
- Optimización de expresión de proteínas en biotecnología: en la producción de proteínas recombinantes, se puede utilizar Saluki para evaluar la estabilidad de diferentes constructos de mRNA y elegir aquellos que probablemente se degraden más lentamente, aumentando el rendimiento de la expresión.
- Análisis de mutaciones en regiones codificantes: al predecir el efecto de mutaciones puntuales sobre la vida media del mRNA, el modelo permite estudiar cómo variantes genéticas pueden alterar la estabilidad del transcrito, lo que es relevante en enfermedades genéticas y farmacogenómica.
- Investigación de regulación post-transcripcional: Saluki puede emplearse para identificar secuencias o motivos que influyen en la degradación del mRNA, combinando el análisis de gradientes o mutagénesis in silico para generar hipótesis sobre mecanismos de regulación.
- Validación de modelos en entornos DCU: dada su adaptación al hardware DCU con DTK, el modelo sirve como caso de uso para verificar que TensorFlow puede construir y ejecutar modelos de biosciences en ese entorno, facilitando el despliegue en infraestructuras de supercomputación chinas.
- Evaluación de transcritos en estudios de expresión génica: en experimentos de RNA-seq, Saluki puede asignar puntuaciones de estabilidad a transcritos de interés, ayudando a interpretar diferencias en los niveles de expresión que no se explican únicamente por la transcripción.
- Entrenamiento de doble tarea con diferentes definiciones de vida media: gracias a sus dos cabezas de salida, el modelo permite entrenar conjuntamente sobre dos conjuntos de datos (data0 y data1) con objetivos ligeramente distintos, lo que puede mejorar la generalización cuando se dispone de múltiples etiquetas de estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: se recomienda al menos 8 GB de memoria de dispositivo para inferencia y entrenamiento.
- GPU recomendadas: el modelo está validado en DCU (unidad de procesamiento dedicada) con el entorno DTK 26.04 de OneScience. No se proporcionan recomendaciones para GPUs NVIDIA.
- Compatibilidad con GPU de consumo: no disponible; la adaptación oficial se ha probado en BW DCU.
- Opciones de despliegue: OneCode (entorno online de OneScience), instalación manual con TensorFlow 2.18.0 y DTK 26.04, ejecución mediante scripts de predicción (scripts/predict.py).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica, ya que Saluki es un modelo de regresión y no genera texto.
- Limitaciones de contexto: la entrada tiene una longitud fija de 12,288 posiciones, por lo que secuencias de mRNA más largas deberán truncarse o adaptarse.
- Interpretación de la salida: la puntuación predicha es un valor relativo de estabilidad aprendido según el preprocesamiento del conjunto de datos oficial, y no debe interpretarse directamente como una vida media en horas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la licencia en las redistribuciones.
- Dependencias de hardware: la adaptación oficial está validada en el entorno DCU/DTK, por lo que el funcionamiento en otros entornos (por ejemplo, GPUs NVIDIA con TensorFlow estándar) no está garantizado ni documentado.
- Estado del repositorio: el modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que es una publicación reciente o con poca adopción.

## Enlaces

- Hugging Face: https://huggingface.co/OneScience-Group/Saluki
- Artículo original: https://genomebiology.biomedcentral.com/articles/10.1186/s13059-022-02811-x
- Dataset en Zenodo: https://zenodo.org/records/6326409
- Organización OneScience en Hugging Face: https://huggingface.co/OneScience-Group/models
- Entorno OneCode: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
