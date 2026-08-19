# Fatihaybasn/brainmri-ood-inception-v3

## Resumen

El modelo `Fatihaybasn/brainmri-ood-inception-v3` es un clasificador de imágenes médicas basado en la arquitectura InceptionV3, desarrollado por Fatih AYIBASAN como parte de un proyecto comparativo de curso titulado "Brain MRI Tumor vs No-Tumor - OOD Generalization (10 Models)". El objetivo del proyecto es evaluar cómo distintas arquitecturas de redes neuronales convolucionales generalizan ante cambios de distribución (out-of-distribution, OOD) en imágenes de resonancia magnética cerebral, tanto por variación de fuente como de resolución. Este checkpoint concreto corresponde al experimento `inception_v3_not_augmentation`, es decir, entrenado sin aumentación de datos.

El modelo realiza clasificación binaria entre dos clases: `no_tumor` (0) y `tumor` (1), con un tamaño de entrada de 299×299 píxeles. Cuenta con 21.824.098 parámetros y se distribuye en formato safetensors bajo licencia MIT. Está pensado exclusivamente para fines de investigación y educación, no para uso clínico.

La relevancia de este modelo reside en que forma parte de un benchmark de 13 checkpoints que comparan 10 arquitecturas diferentes (ResNet, DenseNet, ConvNeXt, EfficientNet, MobileNet, híbridas y personalizadas) bajo las mismas condiciones de entrenamiento y evaluación OOD. Esto lo convierte en un recurso útil para estudiar la robustez de los modelos de visión por computadora en el dominio médico, un aspecto crítico para el despliegue real de sistemas de ayuda al diagnóstico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InceptionV3 |
| Parametros totales | 21.824.098 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 299×299) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

InceptionV3 es una arquitectura convolucional clásica introducida por Google en 2016, caracterizada por el uso de módulos Inception que combinan convoluciones de distintos tamaños de kernel en paralelo, junto con factorización de convoluciones y capas auxiliares de clasificación. En este proyecto, el modelo se entrena desde cero (no se menciona transfer learning) sobre un conjunto de 11.500 imágenes de resonancia magnética cerebral, con resoluciones fijas de 256 px y 512 px, y sin aumentación de datos (de ahí el sufijo `not_augmentation` en el nombre del experimento).

La evaluación out-of-distribution se realizó sobre 3.500 imágenes externas con resoluciones variables entre 190 px y 800 px, lo que introduce un cambio de distribución tanto en la fuente de datos como en la resolución. El proyecto incluye también experimentos con aumentación (0.3) y arquitecturas híbridas, pero este checkpoint concreto no la utiliza. No se menciona el uso de técnicas como RLHF o DPO, al tratarse de un modelo de visión supervisado de forma clásica con función de pérdida de entropía cruzada.

El repositorio publica, además del checkpoint, los notebooks de entrenamiento, métricas por modelo, gráficas de resultados y el informe del proyecto, junto con hashes SHA-256 para garantizar la trazabilidad de los artefactos.

## Capacidades

- Clasificación binaria de imágenes MRI cerebrales en dos categorías: tumor presente o ausente.
- Detección de out-of-distribution: el modelo fue evaluado específicamente con imágenes de resoluciones y fuentes distintas a las del entrenamiento, demostrando cierta capacidad de generalización (AUC de 0,90 en el conjunto OOD).
- Procesamiento de imágenes médicas en escala de grises con entrada de 299×299 píxeles.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual y discriminativo.

## Casos de uso

- Investigación académica en robustez OOD de modelos de visión médica: el checkpoint sirve como referencia para comparar cómo una arquitectura clásica como InceptionV3 se comporta frente a cambios de resolución y fuente en MRI cerebral.
- Benchmark de arquitecturas para detección de tumores: junto con los otros 12 checkpoints del proyecto, permite evaluar sistemáticamente qué arquitectura generaliza mejor en condiciones OOD, útil para seleccionar modelos base en investigación.
- Educación en deep learning aplicado a imagen médica: el código y los notebooks publicados en GitHub facilitan la reproducción de experimentos y el aprendizaje de técnicas de entrenamiento y evaluación de modelos de clasificación médica.
- Prototipado de sistemas de ayuda al diagnóstico (solo investigación): el modelo puede integrarse en pipelines de prueba para explorar la viabilidad de la detección automática de tumores, siempre que se respete la limitación de no uso clínico.
- Estudio del efecto de la aumentación de datos: al existir versiones con y sin aumentación para varias arquitecturas, este checkpoint permite aislar el impacto de esta técnica en la generalización OOD.
- Validación de estrategias de preprocesado: la variabilidad de resoluciones en el conjunto OOD (190–800 px) permite probar pipelines de redimensionado y normalización antes de la inferencia.

## Benchmarks y rendimiento

El modelo fue evaluado en el conjunto externo OOD de 3.500 imágenes. Los resultados de este checkpoint son los siguientes:

| Metrica | Valor |
|---|---|
| Accuracy | 0,710114 |
| AUC | 0,900568 |
| F1 | 0,601605 |
| Recall (sensibilidad) | 0,430211 |
| Precision | 1,000000 |
| Cohen's Kappa | 0,425884 |

La tabla completa del benchmark OOD del proyecto, que incluye los 13 experimentos, es la siguiente:

| Experiment | Accuracy | AUC | F1 | Recall | Precision | Kappa |
|---|---|---|---:|---:|---:|---:|---:|
| custom_msaf_effb0_My_model_0.3_augmentation | 0,908 | 0,988 | 0,901 | 0,822 | 0,998 | 0,817 |
| hybrid_dn121_effb0_0.3_augmentation | 0,861 | 0,967 | 0,841 | 0,726 | 1,000 | 0,723 |
| hybrid_dn121_effb0_not_augmentation | 0,839 | 0,939 | 0,812 | 0,684 | 1,000 | 0,680 |
| custom_msaf_effb0_My_model_not_augmentation | 0,805 | 0,936 | 0,764 | 0,618 | 0,999 | 0,613 |
| hybrid_swinT_effb0_0.3_augmentation | 0,795 | 0,975 | 0,748 | 0,599 | 0,997 | 0,593 |
| resnet34_not_augmentatiton | 0,794 | 0,954 | 0,747 | 0,596 | 0,999 | 0,591 |
| densenet121 | 0,785 | 0,984 | 0,732 | 0,578 | 1,000 | 0,573 |
| convnext_tiny | 0,775 | 0,960 | 0,716 | 0,557 | 1,000 | 0,553 |
| hybrid_swinT_effb0_not_augmentation | 0,745 | 0,956 | 0,665 | 0,498 | 1,000 | 0,494 |
| resnet50_not_augmentatiton | 0,719 | 0,962 | 0,619 | 0,448 | 1,000 | 0,444 |
| **inception_v3_not_augmentation (este checkpoint)** | **0,710** | **0,901** | **0,602** | **0,430** | **1,000** | **0,426** |
| efficientnet_b0 | 0,693 | 0,903 | 0,568 | 0,397 | 0,997 | 0,392 |
| mobilenetv2_100_not_augmentation | 0,639 | 0,889 | 0,450 | 0,290 | 1,000 | 0,286 |

El modelo ocupa la undécima posición en accuracy dentro del benchmark, con una precisión perfecta (1,0) pero una sensibilidad baja (0,43), lo que indica que tiende a predecir la clase negativa en la mayoría de los casos, priorizando evitar falsos positivos a costa de muchos falsos negativos.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para inferencia en precisión completa (FP32), dado que el modelo tiene solo 21,8 millones de parámetros.
- GPU recomendada: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer (GTX 1060, RTX 2060, etc.) e incluso en dispositivos con limitaciones de memoria.
- Opciones de despliegue: PyTorch con la librería timm, o exportación a ONNX para inferencia con TensorRT u otros runtimes. No se proporcionan archivos GGUF ni cuantizaciones específicas.
- Latencia y throughput: no se han publicado mediciones oficiales; en una GPU media (p. ej., RTX 3060), la inferencia de una imagen de 299×299 debería completarse en el orden de milisegundos, dado el tamaño reducido del modelo.

## Comparativa con modelos similares

Dentro del mismo benchmark OOD, se pueden comparar los resultados de este checkpoint con otros modelos de tamaño y propósito similares:

| Modelo | Parametros (aprox.) | Accuracy OOD | AUC OOD | Precision | Licencia |
|---|---|---|---|---|---|
| InceptionV3 (este checkpoint) | 21,8 M | 0,710 | 0,901 | 1,000 | MIT |
| ResNet34 | ~21,3 M | 0,794 | 0,954 | 0,999 | MIT |
| DenseNet121 | ~8 M | 0,785 | 0,984 | 1,000 | MIT |
| EfficientNet-B0 | ~5,3 M | 0,693 | 0,903 | 0,997 | MIT |
| MobileNetV2 | ~3,5 M | 0,639 | 0,889 | 1,000 | MIT |

Nota: los parámetros de los modelos comparados son valores típicos de las arquitecturas estándar, no se han verificado en el repositorio. La comparación se basa exclusivamente en los resultados OOD publicados en el benchmark del proyecto.

InceptionV3 queda por detrás de ResNet34 y DenseNet121 en accuracy y AUC, pero supera a EfficientNet-B0 y MobileNetV2. Su precisión perfecta indica que cuando predice tumor, acierta siempre, pero su baja sensibilidad limita su utilidad práctica en detección.

## Limitaciones y advertencias

- Clasificación binaria únicamente: no identifica el tipo de tumor, su localización, grado ni pronóstico.
- Sin validación clínica: el modelo no ha pasado revisión regulatoria ni ensayos clínicos; no debe usarse para diagnóstico o toma de decisiones médicas.
- Sesgos potenciales: el dataset de entrenamiento y evaluación puede contener sesgos de fuente, artefactos de imagen o fugas de sujetos que afecten al rendimiento en poblaciones reales.
- Rendimiento OOD limitado: la sensibilidad de 0,43 en el conjunto externo implica que más de la mitad de los casos con tumor no son detectados, lo que lo hace inadecuado para cribado sin supervisión.
- Sin aumentación de datos: este checkpoint concreto se entrenó sin aumentación, lo que puede explicar parte de su menor rendimiento frente a versiones con aumentación del mismo proyecto.
- Alcance educativo: el autor declara explícitamente que el uso es solo para investigación y educación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fatihaybasn/brainmri-ood-inception-v3
- Repositorio del proyecto en GitHub: https://github.com/fatihaybsn/BrainMRI-OOD-10Models
- Commit de referencia: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/commit/a9920408189230b886773a64d113eb35bcba1971
- Archivo CITATION.cff: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/blob/main/CITATION.cff
