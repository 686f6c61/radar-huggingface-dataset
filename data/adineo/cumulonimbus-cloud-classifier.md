# adineo/cumulonimbus-cloud-classifier

## Resumen

El Cumulonimbus Cloud Classifier es un modelo de clasificación de imágenes binario desarrollado por el usuario adineo en el marco de un proyecto de fin de grado (B.Tech) de la University of Engineering & Management de Kolkata. Su tarea es distinguir entre nubes cumulonimbus y cualquier otro tipo de nube o cielo a partir de fotografías tomadas desde el suelo. El modelo se distribuye como un conjunto de pesos en formato nativo de Keras (`.keras`) e incluye varias arquitecturas convolucionales comparadas bajo una misma receta de entrenamiento, además de dos variantes híbridas y un mapa de calibración de Platt.

El repositorio no contiene un único modelo, sino un paquete de modelos: cinco arquitecturas individuales (MobileNetV2, EfficientNetV2-B0, DenseNet121, ResNet50 y ConvNeXtTiny), un ensemble por semillas de EfficientNetV2-B0, una fusión de dos backbones y un ensemble apilado de cuatro arquitecturas. La configuración con mejor rendimiento es el ensemble apilado, con un 95,31 % de accuracy y un 85,67 % de macro-F1 sobre el split de test reservado.

Es relevante para quienes trabajan en visión por computador aplicada a meteorología porque ofrece una comparativa reproducible de arquitecturas CNN bajo condiciones idénticas, incluye calibración de probabilidades y utiliza el Critical Success Index (CSI), la métrica estándar de verificación meteorológica, en lugar de limitarse a accuracy. El conjunto de datos empleado es el CCSN público (2.567 imágenes), lo que facilita la replicabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con transfer learning: MobileNetV2, EfficientNetV2-B0, DenseNet121, ResNet50, ConvNeXtTiny; más fusion dual y ensemble apilado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 256x256) |
| Tipos de cuantizacion | no disponible (pesos en formato Keras nativo) |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas en inglés) |
| Licencia | MIT |
| Formato de pesos | `.keras` (Keras nativo, TensorFlow/Keras) |

## Arquitectura y entrenamiento

El modelo es un clasificador de imágenes binario basado en redes convolucionales con transfer learning. Se entrenaron cinco arquitecturas bajo una receta idéntica: MobileNetV2, EfficientNetV2-B0, DenseNet121, ResNet50 y ConvNeXtTiny. Las imágenes se redimensionan a 256x256 píxeles y se procesan en RGB. Sobre esta base se construyen dos variantes híbridas: una fusión de dos backbones (EfficientNetV2-B0 + DenseNet121) y un ensemble apilado que combina EfficientNetV2-B0, DenseNet121, ResNet50 y ConvNeXtTiny. También se incluye un ensemble por semillas de EfficientNetV2-B0 con tres miembros (semillas 42, 1042 y 2042) y una ablación de MobileNetV2 con la receta original.

El entrenamiento utiliza el dataset CCSN (Zhang et al., 2018), compuesto por 2.567 imágenes de nubes tomadas desde el suelo, más 24 fotografías de campo adicionales. El split es estratificado 80/10/10 con semilla fija; el conjunto de test nunca se usa para entrenamiento, selección ni calibración. Las decisiones de clasificación se calibran mediante un mapa de Platt ajustado sobre validación (a = 1,013752, b = 2,071637), lo que permite obtener probabilidades calibradas en lugar de scores brutos. No se especifica en la información disponible el número de épocas, el optimizador, la función de pérdida ni si hubo aumento de datos más allá de la receta estándar de transfer learning.

## Capacidades

- Clasificación binaria de imágenes: distingue entre cumulonimbus y otras nubes o cielos.
- Entrada de imagen RGB redimensionada a 256x256 píxeles.
- Salida de probabilidad calibrada mediante mapa de Platt, con umbral de decisión en 0,5.
- Ensemble por semillas y ensemble apilado para mejorar la robustez de la predicción.
- Fusión de dos backbones (EfficientNetV2-B0 + DenseNet121) como alternativa a un único modelo.
- Incluye pipeline de Grad-CAM en el repositorio del proyecto para interpretabilidad visual.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un clasificador de imágenes puro.

## Casos de uso

- **Apoyo a la vigilancia meteorológica en estaciones con cámara**: el modelo puede procesar fotogramas periódicos de una cámara orientada al cielo y generar una alerta cuando la probabilidad calibrada de cumulonimbus supera el umbral, como señal complementaria a los avisos oficiales.
- **Filtrado previo en datasets de nubes**: dado que clasifica rápidamente imágenes de 256x256, puede usarse para etiquetar o priorizar grandes colecciones de fotografías de cielo antes de una revisión manual, reduciendo el coste de anotación.
- **Sistemas de alerta temprana de bajo coste**: al ser modelos ligeros (MobileNetV2 y EfficientNetV2-B0) y distribuirse en formato Keras, pueden desplegarse en dispositivos con GPU modesta o en el borde para monitorizar cumulonimbus en tiempo casi real.
- **Investigación en verificación meteorológica**: el repositorio incluye métricas CSI y mapas de calibración, lo que permite reutilizar la configuración como línea base reproducible para comparar nuevas arquitecturas en clasificación binaria de nubes.
- **Educación y proyectos académicos**: la comparativa de cinco arquitecturas bajo una misma receta y los scripts de entrenamiento, benchmarking y Grad-CAM sirven como material didáctico para cursos de visión por computador aplicada.
- **Integración en aplicaciones de observación ciudadana**: una app móvil o web podría enviar fotos del cielo y recibir una clasificación con probabilidad calibrada, usando el ensemble por semillas para mayor estabilidad.
- **Análisis de riesgo en seguros o agricultura**: la detección temprana de cumulonimbus en imágenes de cámaras locales puede alimentar sistemas de aviso de tormenta para explotaciones agrícolas o instalaciones expuestas.

## Benchmarks y rendimiento

Resultados sobre el split de test reservado (256 imágenes, decisiones calibradas), según la model card:

| Modelo | Accuracy | Macro-F1 | ROC-AUC | CSI-macro |
|---|---|---|---|---|
| MobileNetV2 | 92,58 % | 74,81 % | 0,925 | 0,644 |
| EfficientNetV2-B0 | 92,58 % | 74,81 % | 0,915 | 0,644 |
| DenseNet121 | 92,19 % | 71,57 % | 0,893 | 0,615 |
| ResNet50 | 92,97 % | 76,66 % | 0,957 | 0,663 |
| ConvNeXtTiny | 94,53 % | 84,48 % | 0,957 | 0,752 |
| Seed ensemble x3 (EffNetV2-B0) | 93,36 % | 77,46 % | 0,921 | 0,672 |
| Hybrid fusion (EffNetV2-B0 + DenseNet121) | 93,75 % | 79,25 % | 0,947 | 0,691 |
| Hybrid stacked ensemble (EffNetV2-B0 + DenseNet121 + ResNet50 + ConvNeXtTiny) | 95,31 % | 85,67 % | 0,969 | 0,768 |

El ensemble apilado supera a todas las arquitecturas individuales en todas las métricas. El CSI se define como TP/(TP+FP+FN), la métrica estándar de verificación meteorológica.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada. Al tratarse de CNNs de tamaño pequeño a medio con entrada de 256x256, el consumo es moderado, pero no se publican cifras.
- **GPU recomendadas**: no se especifican. Por el tamaño de los backbones (MobileNetV2, EfficientNetV2-B0, DenseNet121, ResNet50, ConvNeXtTiny), caben previsiblemente en GPUs de consumo, pero esto no está confirmado en la información disponible.
- **Cabe en GPU de consumo**: probablemente sí para los modelos individuales, pero no hay datos confirmados.
- **Opciones de despliegue**: TensorFlow/Keras (carga directa con `tensorflow.keras.models.load_model`). No se mencionan exportaciones a ONNX, TensorRT, TFLite ni otros runtimes.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de clasificación binaria de cumulonimbus en la información proporcionada. La propia model card advierte que la tarea binaria no es comparable con resultados de clasificación de 11 clases sin reentrenamiento. Como referencia interna, la comparativa entre las cinco arquitecturas del propio repositorio se recoge en la sección de benchmarks.

| Modelo | Parametros | Contexto/entrada | Accuracy (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cumulonimbus Cloud Classifier (stacked ensemble) | no disponible | imagen 256x256 | 95,31 % | MIT | Hugging Face |
| EfficientNetV2-B0 (individual) | no disponible | imagen 256x256 | 92,58 % | MIT | Hugging Face |
| ConvNeXtTiny (individual) | no disponible | imagen 256x256 | 94,53 % | MIT | Hugging Face |
| ResNet50 (individual) | no disponible | imagen 256x256 | 92,97 % | MIT | Hugging Face |

## Limitaciones y advertencias

- **Tarea binaria**: el modelo solo distingue cumulonimbus frente al resto; no es comparable con resultados de clasificación de 11 clases sin reentrenamiento.
- **Test pequeño**: el split de test contiene 256 imágenes y solo 25 de cumulonimbus, por lo que los intervalos de confianza por clase son amplios y las métricas pueden variar con nuevos datos.
- **Herramienta asistiva**: la model card indica explícitamente que no sustituye a los avisos meteorológicos oficiales.
- **Sesgos del dataset**: el CCSN está compuesto por fotografías tomadas desde el suelo en condiciones y localizaciones concretas; el rendimiento puede degradarse con cámaras, ángulos, iluminación o regiones geográficas distintas.
- **Riesgo de alucinación**: como todo clasificador, puede asignar alta probabilidad a la clase equivocada ante imágenes fuera de distribución (cielos nocturnos, nubes artificiales, imágenes no meteorológicas).
- **Calibración dependiente del contexto**: el mapa de Platt se ajustó sobre validación con este dataset; su validez fuera de esa distribución no está garantizada.
- **Licencia**: MIT, lo que permite uso comercial, pero se debe citar el dataset CCSN (Zhang et al., 2018) al reutilizarlo.
- **Formato**: los pesos están en `.keras` nativo; no se ofrecen exportaciones a GGUF, ONNX ni otros formatos, lo que limita el despliegue fuera del ecosistema TensorFlow/Keras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adineo/cumulonimbus-cloud-classifier
- Repositorio del proyecto (pipeline completo, entrenamiento, benchmarking, híbridos, calibración, Grad-CAM y UI web): https://github.com/adineo-cmd/cloud_predict
- Dataset CCSN (Zhang et al., 2018): https://doi.org/10.7910/DVN/CADDPD
