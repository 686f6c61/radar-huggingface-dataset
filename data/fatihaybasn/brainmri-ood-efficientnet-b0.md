# Fatihaybasn/brainmri-ood-efficientnet-b0

## Resumen

Este repositorio contiene un checkpoint de EfficientNet-B0 entrenado para clasificación binaria de tumores cerebrales en imágenes de resonancia magnética (MRI), dentro del proyecto comparativo "Brain MRI Tumor vs No-Tumor - OOD Generalization (10 Models)" de Fatih AYIBASAN. El modelo distingue entre las clases `no_tumor` y `tumor` y está diseñado específicamente para evaluar la generalización fuera de distribución (out-of-distribution, OOD), es decir, su comportamiento ante cambios de resolución y de fuente de adquisición de las imágenes.

El checkpoint es uno de los 13 que componen el benchmark completo, que compara 10 arquitecturas diferentes (EfficientNet, ResNet, DenseNet, ConvNeXt, híbridos, etc.). Con 4,05 millones de parámetros y entrada de 224x224 píxeles, es un modelo ligero pensado para experimentación académica y educativa, no para uso clínico. Su relevancia radica en que documenta de forma transparente las métricas OOD de cada arquitectura, lo que permite estudiar cómo afecta el cambio de dominio a modelos de visión por computadora en el ámbito médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN convolucional) |
| Parametros totales | 4.052.126 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien disponible state dict PyTorch) |

## Arquitectura y entrenamiento

EfficientNet-B0 es una red neuronal convolucional basada en el escalado compuesto uniforme de profundidad, anchura y resolución. Utiliza bloques de convolución en profundidad separables (depthwise separable convolutions) y capas de squeeze-and-excitation, lo que la hace eficiente en coste computacional. En este proyecto se entrenó desde cero (no se menciona transfer learning) para clasificación binaria con dos salidas.

El entrenamiento utilizó 11.500 imágenes procedentes de pools de resolución fija de 256 px y 512 px, sin aumentación de datos. La evaluación externa/OOD se realizó sobre 3.500 imágenes con resoluciones variables entre 190 px y 800 px, simulando un cambio de dominio real. No se aplicaron técnicas de alineamiento de dominio ni regularización específica para OOD; el objetivo era medir la robustez intrínseca de cada arquitectura. El umbral de decisión se fijó en 0,5 sobre la probabilidad de la clase `tumor`.

## Capacidades

- Clasificación binaria de imágenes médicas: distingue entre MRI cerebral con tumor y sin tumor.
- Procesamiento de imágenes de resolución variable (entre 190 y 800 píxeles) gracias a la entrada redimensionada a 224x224.
- Generalización fuera de distribución limitada: alcanza un AUC de 0,903 en el conjunto OOD, lo que indica cierta capacidad de discriminación aunque con sensibilidad baja (recall 0,397).
- Inferencia eficiente: al ser un modelo pequeño (4M parámetros), puede ejecutarse en CPU o GPUs de baja gama.
- Integración con el ecosistema timm: compatible con la librería PyTorch Image Models para carga y fine-tuning.
- Reproducibilidad: incluye hashes SHA-256 de los artefactos y acceso al cuaderno de entrenamiento y al historial de Git.

## Casos de uso

- Investigación académica en generalización OOD: el modelo sirve como baseline para estudiar cómo se degrada el rendimiento de una CNN estándar cuando cambia la distribución de las imágenes (resolución, equipo de adquisición, protocolo). Puede compararse con los otros 12 checkpoints del benchmark.
- Educación en visión por computadora médica: permite a estudiantes y desarrolladores comprender el flujo completo de entrenamiento, evaluación y publicación de un modelo de clasificación de imágenes médicas, incluyendo la gestión de artefactos y métricas.
- Evaluación de pipelines de preprocesamiento: al ser sensible a cambios de resolución, puede utilizarse para probar estrategias de normalización de imágenes antes de alimentar modelos más complejos.
- Prototipado de sistemas de triaje: en entornos de investigación, el modelo podría integrarse en un prototipo que filtre imágenes MRI y derive los casos sospechosos a especialistas, aunque no debe usarse en producción clínica.
- Benchmarking de arquitecturas: junto con los otros checkpoints del proyecto, permite comparar el coste-beneficio de distintas arquitecturas (EfficientNet vs ResNet vs DenseNet) en términos de precisión y robustez OOD.
- Desarrollo de técnicas de aumentación y regularización: al estar disponible el checkpoint sin aumentación, sirve como control para experimentos que añadan aumentación de datos y midan su efecto en la generalización.

## Benchmarks y rendimiento

El modelo se evaluó en el conjunto externo OOD descrito en el proyecto. Los resultados de este checkpoint son:

| Metrica | Valor |
|---|---|
| Accuracy | 0,6926 |
| AUC | 0,9028 |
| F1 | 0,5678 |
| Recall (sensibilidad) | 0,3970 |
| Precision | 0,9970 |
| Cohen's Kappa | 0,3915 |

Comparación dentro del mismo benchmark (mismo conjunto OOD):

| Experiment | Accuracy | AUC | F1 | Recall | Precision | Kappa |
|---|---:|---:|---:|---:|---:|---:|
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
| inception_v3_not_augmentation | 0,710 | 0,901 | 0,602 | 0,430 | 1,000 | 0,426 |
| **efficientnet_b0 (este checkpoint)** | 0,693 | 0,903 | 0,568 | 0,397 | 0,997 | 0,392 |
| mobilenetv2_100_not_augmentation | 0,639 | 0,889 | 0,450 | 0,290 | 1,000 | 0,286 |

El modelo ocupa la penúltima posición en accuracy y F1, aunque su AUC es similar al de inception_v3. La alta precisión (0,997) indica que cuando predice tumor, casi siempre acierta, pero el bajo recall (0,397) significa que pierde muchos tumores reales.

## Requisitos de hardware

- VRAM estimada: el checkpoint en fp32 ocupa aproximadamente 16 MB (4.052.126 parámetros x 4 bytes). Con una cuantización a int8, el peso ocuparía unos 4 MB. Cabe en cualquier GPU, incluso integradas.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU (inferencia de una imagen en milisegundos). Para entrenamiento desde cero, una GPU con 4 GB de VRAM es suficiente.
- Compatibilidad con consumer GPU: sí, cualquier GPU NVIDIA con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.) puede manejar el modelo sin problemas.
- Opciones de despliegue: al ser un modelo timm, puede servirse con TorchServe, FastAPI, o exportarse a ONNX para runtime ligero. También es compatible con frameworks como Hugging Face Inference Endpoints.
- Latencia y throughput estimados: en una CPU moderna, la inferencia de una imagen tarda entre 5 y 20 ms. En GPU, menos de 1 ms por imagen. Throughput de cientos de imágenes por segundo en GPU.

## Comparativa con modelos similares

Dentro del mismo benchmark, los modelos más cercanos en tamaño y propósito son:

| Modelo | Parametros | Accuracy OOD | AUC OOD | F1 OOD | Licencia |
|---|---:|---:|---:|---:|---|
| efficientnet_b0 (este) | 4,05 M | 0,693 | 0,903 | 0,568 | MIT |
| mobilenetv2_100 | ~3,5 M | 0,639 | 0,889 | 0,450 | MIT |
| resnet34 | ~21 M | 0,794 | 0,954 | 0,747 | MIT |
| convnext_tiny | ~28 M | 0,775 | 0,960 | 0,716 | MIT |

EfficientNet-B0 tiene un rendimiento inferior a modelos de mayor capacidad como ResNet34 o ConvNeXt-Tiny, pero también es mucho más ligero. Frente a MobileNetV2, que es de tamaño similar, EfficientNet-B0 obtiene mejores resultados en todas las métricas. La comparación directa con otros EfficientNet-B0 de la literatura no está disponible en la información proporcionada, ya que este checkpoint se entrenó desde cero con un dataset específico.

## Limitaciones y advertencias

- Uso exclusivamente para investigación y educación: el propio autor declara que no está validado clínicamente ni aprobado por agencias reguladoras. No debe utilizarse para diagnóstico médico ni toma de decisiones clínicas.
- Clasificación binaria únicamente: no identifica el tipo de tumor, su localización, grado ni pronóstico.
- Rendimiento OOD limitado: la sensibilidad (recall) es baja (0,397), lo que implica que el modelo pasa por alto más del 60% de los tumores reales en el conjunto externo. Esto lo hace inadecuado para cualquier aplicación de cribado.
- Sesgo de datos: el entrenamiento se realizó con un conjunto de imágenes específico (11.500 imágenes de pools de resolución fija). La evaluación OOD mostró degradación, lo que sugiere sensibilidad a cambios de resolución y protocolo de adquisición.
- Riesgo de alucinación: aunque es un modelo discriminativo, puede producir falsos negativos (omitir tumores) y falsos positivos (marcar tejido sano como tumor). La alta precisión (0,997) reduce los falsos positivos, pero el bajo recall aumenta los falsos negativos.
- Sin aumentación de datos: el entrenamiento no utilizó aumentación, lo que probablemente contribuye a la baja generalización.
- Reproducibilidad: aunque se proporcionan hashes SHA-256 y el código fuente, no se incluye el dataset original, por lo que la reproducción exacta puede ser difícil.
- Idiomas: no aplica, pero la documentación está en inglés.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Fatihaybasn/brainmri-ood-efficientnet-b0
- Proyecto GitHub: https://github.com/fatihaybsn/BrainMRI-OOD-10Models
- Commit de referencia: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/commit/a9920408189230b886773a64d113eb35bcba1971
- Archivo CITATION.cff: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/blob/main/CITATION.cff
