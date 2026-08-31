# leminhhung0101/LeafModel

## Resumen

LeafModel es un pipeline de investigación para clasificación multiclase de enfermedades de plantas sobre el dataset PlantVillage, desarrollado por Lê Minh Hùng (usuario de Hugging Face `leminhhung0101`). El proyecto está diseñado como un estudio comparativo y de ablación que evalúa dos backbones convolucionales complementarios —ConvNeXt-Tiny y EfficientNet-B0— bajo dos representaciones de entrada distintas: imágenes en color y versiones segmentadas con fondo eliminado. El sistema final combina los mejores modelos de cada backbone mediante un ensemble ponderado por probabilidades, optimizado sobre el conjunto de validación.

La relevancia del modelo radica en su enfoque metódico para responder preguntas de investigación concretas: si la diversidad de backbones y de representaciones de entrada mejora la precisión más allá de un único CNN, si la atención ligera y el pooling adaptativo ayudan a extraer características de enfermedad, y si la fusión de modelos proporciona una ganancia consistente sobre el clasificador individual más fuerte. El pipeline está pensado para ejecutarse en Kaggle con datos en formato `.npy` (arrays NumPy `uint8` de forma `(N, 224, 224, 3)`) y utiliza dos GPUs NVIDIA T4. El repositorio tiene un tamaño de 0.5 GB y fue creado en agosto de 2026, sin descargas ni likes registrados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de ConvNeXt-Tiny y EfficientNet-B0 (CNN) con cabezas de clasificación personalizadas (atención ligera y pooling generalizado aprendible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (los datos de entrada son `.npy`, los checkpoints no se especifican) |

## Arquitectura y entrenamiento

El pipeline entrena cuatro experimentos principales: (E1) ConvNeXt-Tiny con color, (E2) ConvNeXt-Tiny con segmentado, (E3) EfficientNet-B0 con color y (E4) EfficientNet-B0 con segmentado. Cada backbone utiliza una cabeza de clasificación modificada con atención ligera y pooling generalizado aprendible (learnable generalized mean pooling) en lugar de la cabeza por defecto. El entrenamiento se realiza con una función de pérdida focal balanceada por clases para abordar el desequilibrio entre clases de enfermedades minoritarias. Los datos se dividen estratificadamente por clase en 80% entrenamiento, 10% validación y 10% test con semilla 42, manteniendo la correspondencia entre representaciones de color y segmentadas mediante índices emparejados.

El conjunto de datos actual contiene 38 clases de enfermedades y hojas sanas, con 43,429 muestras de entrenamiento, 5,417 de validación y 5,459 de test. El emparejamiento entre archivos `.npy` de color y segmentados se realiza por nombre de archivo y se trunca al mínimo de muestras si hay discrepancias. No se especifica el número total de épocas, el optimizador, la tasa de aprendizaje ni el número de tokens de entrenamiento, ya que la model card se centra en el diseño experimental y no en los hiperparámetros concretos. Tampoco se detalla si se aplicó algún tipo de aumento de datos o regularización adicional.

## Capacidades

- Clasificación de enfermedades de plantas en 38 clases del dataset PlantVillage (manzana, tomate, patata, uva, etc.) a partir de imágenes de hojas.
- Procesamiento de dos representaciones de entrada: imagen en color original e imagen segmentada (fondo eliminado).
- Ensemble ponderado por validación que combina las predicciones probabilísticas de los dos backbones para mejorar la robustez.
- Extracción de características con atención ligera y pooling generalizado aprendible, que permite adaptar la agregación espacial a las particularidades de cada clase.
- Manejo de desequilibrio de clases mediante pérdida focal balanceada, lo que mejora el rendimiento en clases minoritarias.
- Pipeline reproducible con división estratificada fija, manifiestos de splits y registro de archivos no emparejados.

## Casos de uso

- Investigación académica en fitopatología: el modelo permite comparar sistemáticamente si la información de color o la segmentación de fondo es más discriminativa para distintas enfermedades, lo que orienta futuros estudios sobre qué preprocesado conviene aplicar en cada cultivo.
- Detección temprana de enfermedades en agricultura de precisión: integrado en un sistema de captura de imágenes de campo, el ensemble puede clasificar hojas enfermas con alta precisión, ayudando a los agricultores a aplicar tratamientos localizados antes de que la enfermedad se propague.
- Benchmarking de backbones CNN para visión agrícola: el diseño de ablación con ConvNeXt-Tiny y EfficientNet-B0 sirve como referencia para evaluar qué arquitectura moderna se adapta mejor a dominios específicos como el diagnóstico vegetal.
- Generación de conjuntos de datos etiquetados: el pipeline puede utilizarse para etiquetar automáticamente grandes volúmenes de imágenes de hojas, reduciendo el esfuerzo manual en la creación de datasets de entrenamiento para otros modelos.
- Educación y formación en deep learning aplicado: al estar estructurado como un estudio con preguntas de investigación explícitas (RQ1-RQ6), es un recurso didáctico para enseñar diseño experimental, manejo de datos desequilibrados y ensamblado de modelos en problemas de visión por computador.
- Desarrollo de sistemas de soporte a la decisión en agronomía: combinado con una interfaz de usuario, el modelo puede proporcionar diagnósticos de enfermedades en tiempo real a técnicos agrícolas, con explicaciones basadas en la contribución de cada backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el diseño experimental y las preguntas de investigación, pero no incluye métricas de precisión, recall, F1 ni comparaciones con otros modelos. No se puede confirmar el rendimiento real del ensemble ni de los backbones individuales.

## Requisitos de hardware

- El pipeline está diseñado para ejecutarse en dos GPUs NVIDIA T4 (16 GB cada una en Kaggle), según se indica en el título del repositorio.
- El tamaño del repositorio es de 0.5 GB, lo que sugiere que los pesos de los modelos y los datos procesados no ocupan un espacio excesivo.
- No se especifica la VRAM mínima para inferencia, pero al tratarse de ConvNeXt-Tiny y EfficientNet-B0, ambos modelos ligeros (~28M y ~5.3M parámetros respectivamente en sus versiones base), es probable que quepan en GPUs de consumo como una RTX 3060 o superior.
- No se detallan opciones de despliegue (vLLM, llama.cpp, etc.), ya que es un modelo de visión, no un LLM. La inferencia podría realizarse con PyTorch estándar o con frameworks de optimización como ONNX Runtime.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de clasificación de enfermedades de plantas, como los basados en ResNet, VGG o DenseNet entrenados sobre PlantVillage. La model card no incluye resultados de validación ni test, por lo que no es posible comparar el rendimiento real de LeafModel con alternativas. Se puede señalar que, a diferencia de clasificadores únicos, LeafModel introduce un ensemble de dos backbones con representaciones de entrada distintas, lo que constituye una diferencia metodológica relevante.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede garantizar su uso comercial ni la redistribución de los pesos sin permiso explícito del autor.
- No se han publicado métricas de rendimiento, por lo que se desconoce la precisión real del modelo y su comportamiento en clases minoritarias.
- El modelo está entrenado exclusivamente sobre el dataset PlantVillage, que contiene imágenes capturadas en condiciones controladas de laboratorio; su rendimiento en imágenes de campo real con fondos variables, iluminación cambiante o múltiples hojas podría degradarse significativamente.
- La model card asume que las imágenes de color y segmentadas están perfectamente emparejadas por índice; si esta correspondencia no se cumple, el entrenamiento podría verse afectado.
- No se indican medidas de mitigación de sesgos, por lo que el modelo podría tener un rendimiento desigual entre especies o variedades de plantas según la distribución de clases del dataset.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que el modelo no ha sido validado por la comunidad y podría contener errores no detectados.

## Enlaces

- Hugging Face: https://huggingface.co/leminhhung0101/LeafModel
- Perfil del autor en Hugging Face: https://huggingface.co/leminhhung0101/models
- Repositorio relacionado (knee-model): https://huggingface.co/leminhhung0101/knee-model
- GitHub con nombre similar (no confirmado como el mismo autor): https://github.com/MHogan17/LeafModel
