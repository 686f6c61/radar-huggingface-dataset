# Fatihaybasn/brainmri-ood-resnet34

## Resumen

`Fatihaybasn/brainmri-ood-resnet34` es un checkpoint de ResNet34 entrenado para clasificación binaria de tumores cerebrales en resonancias magnéticas (MRI), dentro de un proyecto comparativo de diez arquitecturas que evalúa su generalización ante cambios de distribución (out-of-distribution, OOD). Lo desarrolla Fatih Ayibasan como parte de un curso, y el repositorio incluye el código de entrenamiento, métricas y trazabilidad completa.

El modelo distingue entre dos clases (`no_tumor` y `tumor`) a partir de imágenes de 224×224 píxeles. Se entrenó con 11.500 imágenes de resoluciones fijas (256 y 512 px) y se evaluó con 3.500 imágenes de resoluciones variables (190–800 px), simulando un escenario de cambio de fuente y resolución. Con 21,3 millones de parámetros, es un modelo ligero y de baja latencia, adecuado para entornos con recursos limitados, aunque su rendimiento OOD (accuracy 0,794) es inferior al de arquitecturas híbridas del mismo proyecto.

La relevancia de este modelo radica en su papel como referencia dentro de un benchmark sistemático de generalización OOD en imagen médica. No está validado clínicamente y su uso se limita a investigación y educación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet34 (CNN residual) |
| Parametros totales | 21.302.722 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (procesamiento de imágenes) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ResNet34 es una red neuronal convolucional residual con 34 capas, publicada originalmente por He et al. en 2016. Su diseño con conexiones residuales permite entrenar redes profundas sin degradación del gradiente. En este proyecto se utilizó la implementación de `timm` (PyTorch Image Models) con dos clases de salida y una capa fully-connected adaptada.

El entrenamiento se realizó con 11.500 imágenes de resonancia magnética cerebral, sin aumentación de datos (según la model card, `Training augmentation: not used`). Las imágenes provienen de pools de resolución fija de 256 y 512 píxeles. No se especifica el número de épocas, el optimizador ni la función de pérdida en la información disponible. El umbral de decisión se fijó en 0,5.

La evaluación OOD se llevó a cabo con 3.500 imágenes de resoluciones variables (190–800 px), lo que introduce un cambio de distribución tanto en la fuente como en la resolución. Este diseño permite comparar la robustez de distintas arquitecturas ante condiciones no vistas durante el entrenamiento.

## Capacidades

- Clasificación binaria de tumores cerebrales en MRI: distingue entre `no_tumor` y `tumor`.
- Entrada de imágenes de 224×224 píxeles, en color o escala de grises (según preprocesado de `timm`).
- Inferencia de bajo coste computacional: 21,3 millones de parámetros, apto para CPU y GPU de gama baja.
- No soporta tool calling, agentes, generación de texto ni razonamiento multimodal.
- No tiene capacidades multilingües ni de procesamiento de lenguaje natural.
- No incluye modo de pensamiento ni generación de explicaciones.

## Casos de uso

- Investigación académica en generalización OOD: sirve como línea base para comparar la robustez de arquitecturas ante cambios de resolución y fuente en imagen médica. Se puede reproducir el benchmark completo con los notebooks del repositorio.
- Prototipado de sistemas de triaje en radiología: el modelo puede clasificar rápidamente si una resonancia presenta indicios de tumor, aunque su sensibilidad (0,596) limita su uso como filtro único; requiere validación adicional.
- Enseñanza de deep learning aplicado a medicina: al ser un checkpoint pequeño y con licencia MIT, es adecuado para prácticas de fine-tuning, transferencia de aprendizaje y análisis de métricas de clasificación.
- Evaluación de estrategias de aumentación de datos: el proyecto incluye variantes con y sin aumentación; este checkpoint (sin aumentación) permite estudiar el impacto de esta técnica en la generalización.
- Benchmarking de herramientas de conversión de pesos: el repositorio documenta la conversión de PyTorch a safetensors, útil para verificar pipelines de serialización.
- Comparación de arquitecturas en entornos con restricciones de hardware: su bajo número de parámetros lo hace candidato para despliegue en dispositivos con poca memoria, aunque con rendimiento inferior a modelos híbridos del mismo estudio.

## Benchmarks y rendimiento

Resultados del checkpoint en el conjunto de evaluación externa OOD (3.500 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy | 0,794344 |
| AUC | 0,953888 |
| F1 | 0,746879 |
| Recall / Sensibilidad | 0,596375 |
| Precision | 0,998988 |
| Cohen's Kappa | 0,591497 |

Rendimiento comparativo dentro del benchmark completo (13 checkpoints, 10 arquitecturas):

| Experimento | Accuracy | AUC | F1 | Recall | Precision | Kappa |
|---|---|---|---:|---:|---:|---:|---:|
| custom_msaf_effb0_0.3_augmentation | 0,908 | 0,988 | 0,901 | 0,822 | 0,998 | 0,817 |
| hybrid_dn121_effb0_0.3_augmentation | 0,861 | 0,967 | 0,841 | 0,726 | 1,000 | 0,723 |
| hybrid_dn121_effb0_not_augmentation | 0,839 | 0,939 | 0,812 | 0,684 | 1,000 | 0,680 |
| custom_msaf_effb0_not_augmentation | 0,805 | 0,936 | 0,764 | 0,618 | 0,999 | 0,613 |
| hybrid_swinT_effb0_0.3_augmentation | 0,795 | 0,975 | 0,748 | 0,599 | 0,997 | 0,593 |
| **resnet34_not_augmentation (este checkpoint)** | **0,794** | **0,954** | **0,747** | **0,596** | **0,999** | **0,591** |
| densenet121 | 0,785 | 0,984 | 0,732 | 0,578 | 1,000 | 0,573 |
| convnext_tiny | 0,775 | 0,960 | 0,716 | 0,557 | 1,000 | 0,553 |
| hybrid_swinT_effb0_not_augmentation | 0,745 | 0,956 | 0,665 | 0,498 | 1,000 | 0,494 |
| resnet50_not_augmentation | 0,719 | 0,962 | 0,619 | 0,448 | 1,000 | 0,444 |
| inception_v3_not_augmentation | 0,710 | 0,901 | 0,602 | 0,430 | 1,000 | 0,426 |
| efficientnet_b0 | 0,693 | 0,903 | 0,568 | 0,397 | 0,997 | 0,392 |
| mobilenetv2_100_not_augmentation | 0,639 | 0,889 | 0,450 | 0,290 | 1,000 | 0,286 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 85 MB en fp32 (21,3 M parámetros × 4 bytes). En fp16 se reduce a ~43 MB. No hay datos oficiales de cuantización.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también funciona en CPU (inferencia de pocos milisegundos por imagen).
- Cabe en GPUs de consumo como NVIDIA GTX 1050, RTX 2060, RTX 4090, así como en hardware embebido (Jetson Nano, Raspberry Pi con acelerador).
- Opciones de despliegue: al ser un modelo `timm` estándar, se puede servir con TorchServe, ONNX Runtime, o exportar a TensorRT. No hay soporte nativo para vLLM, llama.cpp u Ollama (no es un modelo de lenguaje).
- Latencia estimada: en una GPU moderna (RTX 3090), la inferencia de un lote de 1 imagen tarda <5 ms; en CPU (8 núcleos) ~50–100 ms. Estos valores son estimaciones razonables, no mediciones publicadas.

## Comparativa con modelos similares

Dentro del mismo benchmark, los modelos más comparables por tamaño y propósito son:

| Modelo | Parametros | Accuracy OOD | AUC OOD | Licencia |
|---|---|---|---|---|
| **resnet34 (este)** | 21,3 M | 0,794 | 0,954 | MIT |
| densenet121 | ~8 M | 0,785 | 0,984 | MIT |
| efficientnet_b0 | ~5,3 M | 0,693 | 0,903 | MIT |
| mobilenetv2_100 | ~3,5 M | 0,639 | 0,889 | MIT |
| convnext_tiny | ~28 M | 0,775 | 0,960 | MIT |

ResNet34 ofrece un equilibrio entre precisión y coste computacional, superando a modelos más ligeros (EfficientNet-B0, MobileNetV2) y quedando ligeramente por detrás de DenseNet121 en accuracy, aunque con mejor AUC que DenseNet121 (0,954 vs 0,984). Los modelos híbridos y custom del proyecto logran mejores resultados, pero con mayor complejidad.

No se dispone de comparativas con modelos externos al proyecto (p. ej., otros checkpoints de clasificación de tumores cerebrales en HuggingFace) en la información proporcionada.

## Limitaciones y advertencias

- Clasificación binaria únicamente: no identifica tipo de tumor, localización, grado ni pronóstico.
- Rendimiento OOD medido en un conjunto específico (3.500 imágenes, resoluciones 190–800 px); puede no transferirse a poblaciones clínicas reales ni a otros protocolos de adquisición.
- Sensibilidad baja (0,596): el modelo falla en detectar cerca del 40% de los tumores en el conjunto OOD, lo que lo hace inadecuado para uso diagnóstico sin supervisión.
- Sesgo de dataset, cambio de fuente, artefactos de imagen y riesgo de fuga de sujetos pueden afectar al rendimiento.
- No ha pasado validación clínica ni revisión regulatoria. Uso exclusivo para investigación y educación.
- No se especifican detalles de entrenamiento (épocas, optimizador, función de pérdida), lo que dificulta la reproducibilidad exacta.
- No hay información sobre cuantizaciones disponibles ni sobre compatibilidad con frameworks de inferencia optimizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fatihaybasn/brainmri-ood-resnet34
- Repositorio del proyecto: https://github.com/fatihaybsn/BrainMRI-OOD-10Models
- Commit de referencia: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/commit/a9920408189230b886773a64d113eb35bcba1971
- Archivo de citación: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/blob/main/CITATION.cff
