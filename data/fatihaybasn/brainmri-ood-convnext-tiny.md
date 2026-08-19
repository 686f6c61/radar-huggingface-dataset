# Fatihaybasn/brainmri-ood-convnext-tiny

## Resumen

El modelo `Fatihaybasn/brainmri-ood-convnext-tiny` es un clasificador de imágenes médicas basado en la arquitectura ConvNeXt-Tiny, desarrollado por Fatih Ayibasan como parte de un proyecto comparativo de generalización fuera de distribución (OOD) para detección de tumores cerebrales en resonancias magnéticas (MRI). El modelo realiza una clasificación binaria entre las clases `no_tumor` y `tumor`, y ha sido entrenado con 11.500 imágenes de resolución fija (256 px y 512 px), evaluándose posteriormente con 3.500 imágenes externas de resoluciones variables entre 190 px y 800 px.

Este checkpoint forma parte de un benchmark de 13 modelos que compara 10 arquitecturas distintas (resnets, densenets, efficientnets, hybridos y custom) bajo condiciones de cambio de fuente y resolución. El modelo ConvNeXt-Tiny ocupa la octava posición en precisión (0.7747) dentro de ese benchmark, aunque destaca por una precisión del 100% en la clase positiva (no hay falsos positivos) y un AUC de 0.9603, lo que indica una buena capacidad discriminativa global.

El modelo está pensado exclusivamente para investigación y educación, no para uso clínico. Se distribuye bajo licencia MIT, con pesos en formato safetensors y un total de 27.821.666 parámetros. Es relevante porque ofrece un punto de referencia reproducible para estudiar la generalización de arquitecturas modernas en dominios médicos con alta variabilidad de adquisición.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (convnext_tiny) |
| Parametros totales | 27.821.666 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada 224x224) |
| Tipos de cuantizacion | No disponible (solo pesos fp32 en safetensors) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | safetensors (tensor-only checkpoint) |

## Arquitectura y entrenamiento

ConvNeXt-Tiny es una arquitectura convolutional moderna derivada de las ideas de los transformers aplicadas a redes neuronales convolucionales. Fue propuesta por Liu et al. en 2022 y se caracteriza por usar kernels de 7x7 con depthwise convolutions, normalización por capas (LayerNorm), y una estructura de bloques similar a la de Swin Transformer pero sin mecanismos de atención. El modelo recibe imágenes de 224x224 píxeles y produce dos salidas (logits para `no_tumor` y `tumor`).

El entrenamiento se realizó sin aumento de datos (not augmentation), sobre un conjunto de 11.500 imágenes de resonancia magnética cerebral provenientes de dos pools de resolución fija (256 px y 512 px). El umbral de decisión se fijó en 0.5. No se especifica el número de épocas, el optimizador ni la función de pérdida en la información disponible. El proyecto completo, con notebooks de entrenamiento y métricas por modelo, está documentado en el repositorio GitHub asociado.

## Capacidades

- Clasificación binaria de imágenes de resonancia magnética cerebral: distingue entre presencia de tumor (`tumor`) y ausencia (`no_tumor`).
- Generalización fuera de distribución: el modelo fue evaluado con imágenes de resoluciones variables (190-800 px), lo que permite estudiar su robustez ante cambios de fuente y resolución.
- Precisión perfecta en la clase positiva: en la evaluación OOD, el modelo alcanzó una precisión de 1.0, es decir, todos los tumores detectados eran correctos, aunque con una sensibilidad limitada (recall de 0.5571).
- Reproducibilidad: incluye hashes SHA-256 del checkpoint original y del publicado, así como el código de construcción del modelo (`modeling.py`) y métricas detalladas en la carpeta `results/`.
- Integración con timm: el modelo se carga mediante la librería `timm` y sigue la convención de configuración estándar de esta biblioteca.

## Casos de uso

- Investigación en generalización de modelos médicos: el checkpoint sirve como referencia para comparar cómo las arquitecturas convolucionales modernas se comportan ante cambios de resolución y fuente en imágenes médicas, útil para estudios de robustez.
- Desarrollo de pipelines de clasificación de MRI en entornos académicos: puede integrarse en flujos de investigación donde se necesite un clasificador binario de tumores cerebrales con pesos ya entrenados y documentados.
- Benchmarking de arquitecturas: al ser parte de un benchmark de 10 arquitecturas, permite comparar directamente el rendimiento de ConvNeXt-Tiny frente a resnets, densenets, efficientnets y modelos híbridos bajo las mismas condiciones.
- Educación en visión por computador aplicada a medicina: el proyecto incluye notebooks y métricas, lo que lo hace adecuado para cursos que enseñen entrenamiento y evaluación de modelos médicos.
- Estudio de umbrales de decisión y métricas: al publicar curvas ROC, reportes y umbrales, puede usarse para experimentos de calibración y ajuste de sensibilidad/especificidad.
- Prueba de concepto para detección asistida por ordenador (CAD) en investigación: aunque no es apto para uso clínico, puede servir como punto de partida para prototipos de sistemas de apoyo al diagnóstico en entornos no regulados.

## Benchmarks y rendimiento

El modelo fue evaluado en el conjunto externo OOD del proyecto (3.500 imágenes). Sus métricas son:

| Accuracy | AUC | F1 | Recall / Sensibilidad | Precision | Cohen's Kappa |
|---:|---:|---:|---:|---:|---:|
| 0.7747 | 0.9603 | 0.7156 | 0.5571 | 1.0000 | 0.5527 |

A continuación se muestra la posición del modelo dentro del benchmark completo de 13 checkpoints (ordenados por precisión descendente):

| Experiment | Accuracy | AUC | F1 | Recall | Precision | Kappa |
|---|---:|---:|---:|---:|---:|---:|
| custom_msaf_effb0_My_model_0.3_augmentation | 0.908 | 0.988 | 0.901 | 0.822 | 0.998 | 0.817 |
| hybrid_dn121_effb0_0.3_augmentation | 0.861 | 0.967 | 0.841 | 0.726 | 1.000 | 0.723 |
| hybrid_dn121_effb0_not_augmentation | 0.839 | 0.939 | 0.812 | 0.684 | 1.000 | 0.680 |
| custom_msaf_effb0_My_model_not_augmentation | 0.805 | 0.936 | 0.764 | 0.618 | 0.999 | 0.613 |
| hybrid_swinT_effb0_0.3_augmentation | 0.795 | 0.975 | 0.748 | 0.599 | 0.997 | 0.593 |
| resnet34_not_augmentatiton | 0.794 | 0.954 | 0.747 | 0.596 | 0.999 | 0.591 |
| densenet121 | 0.785 | 0.984 | 0.732 | 0.578 | 1.000 | 0.573 |
| **convnext_tiny (este checkpoint)** | 0.775 | 0.960 | 0.716 | 0.557 | 1.000 | 0.553 |
| hybrid_swinT_effb0_not_augmentation | 0.745 | 0.956 | 0.665 | 0.498 | 1.000 | 0.494 |
| resnet50_not_augmentatiton | 0.719 | 0.962 | 0.619 | 0.448 | 1.000 | 0.444 |
| inception_v3_not_augmentation | 0.710 | 0.901 | 0.602 | 0.430 | 1.000 | 0.426 |
| efficientnet_b0 | 0.693 | 0.903 | 0.568 | 0.397 | 0.997 | 0.392 |
| mobilenetv2_100_not_augmentation | 0.639 | 0.889 | 0.450 | 0.290 | 1.000 | 0.286 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 111 MB en fp32 (27.8M parámetros x 4 bytes). Con batch de 1 y entrada 224x224, el consumo total de memoria no debería superar los 300 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores pueden ejecutar el modelo sin problemas. También es viable en CPU para inferencia de baja frecuencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna, incluidas las integradas de gama baja.
- Opciones de despliegue: al ser un modelo timm, puede servirse con TorchServe, ONNX Runtime (si se exporta), o directamente con PyTorch. No se han publicado configuraciones para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información publicada. En una GPU media (por ejemplo, RTX 3060), la inferencia de una imagen 224x224 debería completarse en menos de 10 ms, pero este dato no está confirmado por el autor.

## Comparativa con modelos similares

El proyecto incluye varios modelos comparables entrenados con el mismo conjunto de datos y evaluados bajo las mismas condiciones OOD. La siguiente tabla compara ConvNeXt-Tiny con tres alternativas representativas del benchmark:

| Modelo | Parámetros (aprox.) | Accuracy OOD | AUC | F1 | Licencia |
|---|---:|---:|---:|---:|---|
| ConvNeXt-Tiny (este) | 27.8M | 0.775 | 0.960 | 0.716 | MIT |
| ResNet34 | 21.3M | 0.794 | 0.954 | 0.747 | MIT |
| DenseNet121 | 7.0M | 0.785 | 0.984 | 0.732 | MIT |
| EfficientNet-B0 | 5.3M | 0.693 | 0.903 | 0.568 | MIT |

ConvNeXt-Tiny ofrece un AUC competitivo (0.960) y una precisión perfecta en la clase positiva, pero su recall es el más bajo entre los modelos comparados (0.557), lo que indica que tiende a ser conservador a la hora de marcar tumores. DenseNet121, con muchos menos parámetros, consigue mejor AUC y F1. Los modelos híbridos del benchmark (por ejemplo, hybrid_dn121_effb0) superan claramente a ConvNeXt-Tiny en precisión, lo que sugiere que la arquitectura pura no es la más adecuada para este dominio específico.

## Limitaciones y advertencias

- Uso exclusivo para investigación y educación: el autor declara explícitamente que el modelo no es apto para diagnóstico clínico ni para la toma de decisiones médicas.
- Clasificación binaria limitada: solo distingue entre tumor y no tumor; no identifica el tipo de tumor, su localización, grado ni pronóstico.
- Rendimiento OOD medido en un entorno específico: las métricas se obtuvieron con un conjunto de pruebas externo descrito en el proyecto y pueden no transferirse a poblaciones clínicas reales ni a otros protocolos de adquisición.
- Riesgo de sesgo de datos: el entrenamiento se realizó con un conjunto de imágenes que puede contener sesgos de fuente, artefactos de imagen o fugas de sujetos, lo que podría afectar a la generalización.
- Sensibilidad limitada: con un recall de 0.5571, el modelo no detecta aproximadamente el 44% de los tumores presentes en el conjunto OOD, lo que lo hace inadecuado para aplicaciones de cribado donde la sensibilidad es crítica.
- Sin validación clínica ni regulatoria: no ha pasado por revisión de organismos sanitarios ni ha sido validado en entornos clínicos.
- Sin cuantizaciones publicadas: no se ofrecen versiones cuantizadas (INT8, INT4) ni formatos optimizados para despliegue ligero.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Fatihaybasn/brainmri-ood-convnext-tiny
- Proyecto GitHub (notebooks, métricas, informes): https://github.com/fatihaybsn/BrainMRI-OOD-10Models
- Commit de referencia del proyecto: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/commit/a9920408189230b886773a64d113eb35bcba1971
- Archivo CITATION.cff: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/blob/main/CITATION.cff
