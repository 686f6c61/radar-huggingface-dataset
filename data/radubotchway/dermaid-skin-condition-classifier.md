# Radubotchway/dermaid-skin-condition-classifier

## Resumen

Dermaid es un clasificador de imágenes de afecciones cutáneas desarrollado por Radubotchway como proyecto de fin de grado en Ingeniería Informática en la KNUST (Ghana, 2024). El modelo clasifica fotografías de la piel en nueve categorías: cuatro tipos de infecciones bacterianas, fúngicas, parasitarias y virales, más una clase negativa de piel sana. Está construido sobre MobileNetV2 con transfer learning, con la base congelada y una cabeza de clasificación personalizada, y se distribuye bajo licencia MIT.

El modelo fue entrenado con un conjunto de datos público de Kaggle de 762 imágenes etiquetadas, aproximadamente 85 por clase, durante 20 épocas con un split 80/20. Alcanza una precisión de validación del 95,2 % en su mejor época, aunque el autor advierte explícitamente de que no es una herramienta de diagnóstico clínico y que el resultado debe interpretarse con cautela por el pequeño tamaño del dataset y el sobreajuste observado en entrenamiento.

La relevancia actual del modelo reside en su tamaño reducido y su facilidad de despliegue en hardware modesto, lo que lo convierte en un ejemplo práctico de clasificación médica con deep learning en entornos con recursos limitados. Sin embargo, su utilidad real en producción es muy limitada debido a las restricciones de clases, el sesgo hacia tonos de piel claros y la falta de validación clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (base congelada) + GlobalAveragePooling2D + Dense(128, ReLU) + Dense(9, softmax) |
| Parametros totales | no disponible (pesos no publicados en el repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos en formato .h5 de Keras) |
| Idiomas soportados | no disponible (modelo de imagen, sin texto) |
| Licencia | MIT |
| Formato de pesos | .h5 (weights-only, Keras/TensorFlow) |

## Arquitectura y entrenamiento

La arquitectura es un MobileNetV2 preentrenado en ImageNet, con todas sus capas congeladas, seguido de una cabeza de clasificación compuesta por una capa de pooling global, una capa densa de 128 unidades con activación ReLU y una capa final de 9 unidades con softmax. La entrada es una imagen RGB de 128x128 píxeles, reescalada al rango [0, 1] dividiendo entre 255. La pérdida utilizada es sparse categorical cross-entropy y el optimizador Adam.

El entrenamiento se realizó durante 20 épocas con un split de validación del 20 % sobre un total de 762 imágenes. No se aplicó data augmentation ni corrección de desequilibrio entre clases. La base de MobileNetV2 permaneció congelada, por lo que solo se entrenaron los pesos de la cabeza. El autor observa que la precisión de entrenamiento alcanza el 100 % desde la época 3, mientras que la pérdida de validación se estabiliza en torno a 0,19, lo que indica un claro sobreajuste al conjunto de entrenamiento.

## Capacidades

- Clasificación de imágenes de afecciones cutáneas en nueve clases: cellulitis, impétigo, piel sana, pie de atleta, hongo de uña, tiña, larva migrans cutánea, varicela y herpes zóster.
- Inferencia sobre imágenes de entrada de 128x128 píxeles en formato RGB.
- Salida de probabilidades softmax sobre las nueve clases, con el orden de índices definido en `class_names.txt`.
- Capacidad de ejecución en hardware modesto gracias al uso de MobileNetV2 como backbone ligero.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de texto o audio.

## Casos de uso

- Prototipo educativo de clasificación dermatológica: el modelo sirve como ejemplo didáctico de transfer learning aplicado a imágenes médicas, útil para estudiantes que quieran entender el flujo completo de entrenamiento y despliegue de un clasificador.
- Aplicación web de demostración: el autor lo integra en una aplicación Flask que permite subir una foto y obtener una predicción, demostrando cómo servir un modelo de Keras en un servidor ligero.
- Investigación sobre sesgo en datasets dermatológicos: el modelo se utiliza como base para el proyecto complementario GAN-FOR-SKIN-COLOUR, que busca corregir el sesgo hacia tonos de piel claros mediante aumento de datos con StarGAN.
- Evaluación de técnicas de regularización: al ser un modelo pequeño y con sobreajuste evidente, puede emplearse para probar métodos como data augmentation, dropout o fine-tuning de capas superiores.
- Comparación de backbones: al estar congelado MobileNetV2, se puede sustituir por otros backbones (ResNet, EfficientNet) para comparar rendimiento y tamaño en la misma tarea.
- Prueba de pipelines de despliegue: su formato de pesos y su reconstrucción manual permiten experimentar con TensorFlow Serving, TFLite o conversión a ONNX para entornos de producción.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados de validación, obtenidos sobre un split del 20 % de un dataset de 762 imágenes:

| Metrica | Valor |
|---|---|
| Mejor precision de validacion | 95,2 % (epoca 8) |
| Precision de validacion final | ~94,5 % |
| Perdida de validacion final | ~0,19 |
| Precision de entrenamiento | 100 % desde la epoca 3 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El propio autor advierte que la cifra del 95 % debe interpretarse como "razonable para este tamaño de dataset", no como una medida de rendimiento en condiciones reales.

## Requisitos de hardware

- Al ser MobileNetV2 con entrada de 128x128, el modelo es extremadamente ligero y puede ejecutarse en CPU sin GPU.
- La inferencia en CPU es prácticamente instantánea para una sola imagen; no se dispone de mediciones de latencia publicadas.
- No se requiere VRAM dedicada; el modelo cabe en cualquier hardware con más de 100 MB de RAM.
- Opciones de despliegue: TensorFlow/Keras nativo, TensorFlow Serving, Flask (como en el proyecto original), o conversión a TFLite para dispositivos móviles.
- No se han publicado requisitos específicos de GPU ni throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros clasificadores de afecciones cutáneas en la informacion proporcionada. Existen alternativas como DermAI (basado en ResNet-34, 21 clases) o el clasificador de Roopamalini, pero no se han encontrado especificaciones técnicas ni resultados de rendimiento de estos modelos en las fuentes consultadas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo no es una herramienta de diagnóstico clínico. No ha sido validado clínicamente ni revisado por dermatólogos, y no debe utilizarse para tomar decisiones médicas.
- Sesgo hacia tonos de piel claros: el dataset público de dermatología utilizado está fuertemente sesgado hacia pieles claras, por lo que el modelo tendrá un rendimiento inferior en pieles más oscuras, justo la población para la que fue concebido.
- Sobreajuste evidente: la precisión de entrenamiento alcanza el 100 % desde la época 3, mientras que la validación se estanca, lo que indica memorización del conjunto de entrenamiento.
- Sin data augmentation ni corrección de desequilibrio de clases, lo que limita la generalización.
- Solo nueve clases: cualquier afección fuera de ese conjunto será clasificada erróneamente dentro de una de las nueve, con alta confianza.
- Entrenado y validado con imágenes curadas del dataset, no con fotografías tomadas con teléfonos en condiciones de iluminación no controladas.
- El checkpoint es solo de pesos; es necesario reconstruir la arquitectura manualmente antes de cargar los pesos.
- El dataset de entrenamiento no se redistribuye; hay que descargarlo de Kaggle por separado.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/Radubotchway/dermaid-skin-condition-classifier
- Repositorio del proyecto completo (aplicación web y código de entrenamiento): https://github.com/radubotchway/Dermaid
- Repositorio de corrección de sesgo de tono de piel (GAN): https://github.com/radubotchway/GAN-FOR-SKIN-COLOUR
- Dataset original en Kaggle: https://www.kaggle.com/datasets (enlace genérico, no se especifica el identificador exacto)
