# Fatihaybasn/brainmri-ood-densenet121

## Resumen

Este repositorio contiene un checkpoint del modelo DenseNet121 entrenado para clasificación binaria de imágenes de resonancia magnética (MRI) cerebral, distinguiendo entre presencia y ausencia de tumor. Lo desarrolla Fatih Ayibasan como parte de un proyecto comparativo de diez arquitecturas distintas para evaluar su generalización ante cambios de dominio (out-of-distribution, OOD) en imagen médica. El modelo es un componente de un benchmark de 13 experimentos publicados en GitHub, con fines exclusivamente educativos y de investigación.

El checkpoint tiene 7.039.554 parámetros, acepta imágenes de 224x224 píxeles y se distribuye en formato safetensors bajo licencia MIT. No está validado clínicamente ni aprobado para uso diagnóstico. Su relevancia radica en servir como referencia reproducible para estudiar el comportamiento de arquitecturas convolucionales estándar (DenseNet121) ante variaciones de resolución y distribución en datos médicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet121 (red convolucional densa) |
| Parametros totales | 7.039.554 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien disponible el checkpoint original .pt con SHA-256) |

## Arquitectura y entrenamiento

DenseNet121 es una red neuronal convolucional profunda que conecta cada capa con todas las capas anteriores mediante conexiones densas, lo que facilita el flujo de gradientes y la reutilización de características. El modelo fue entrenado desde cero (no se indica uso de pesos preentrenados) sobre 11.500 imágenes de MRI cerebral con resoluciones fijas de 256 y 512 píxeles, sin aumentación de datos. La tarea es clasificación binaria: `no_tumor` (0) y `tumor` (1), con un umbral de decisión de 0,5.

La evaluación externa (OOD) se realizó sobre 3.500 imágenes con resoluciones variables entre 190 y 800 píxeles, simulando un cambio de dominio respecto al entrenamiento. No se emplearon técnicas de ajuste fino por refuerzo ni optimización con preferencias humanas, al tratarse de un problema de visión supervisado estándar.

## Capacidades

- Clasificación binaria de imágenes de MRI cerebral: detecta presencia o ausencia de tumor.
- Generalización out-of-distribution: mantiene un AUC de 0,984 en el conjunto de evaluación externa con resoluciones diferentes a las del entrenamiento.
- Precisión perfecta (1,000) en la clase positiva del conjunto OOD, aunque con recall limitado (0,578), lo que indica un comportamiento conservador ante casos tumorales.
- Integración con la librería `timm` y PyTorch, permitiendo su uso en pipelines estándar de visión por computadora.
- No soporta tool calling, generación de texto, razonamiento multi-paso ni capacidades multimodales más allá de la imagen.

## Casos de uso

- Investigación académica en generalización de modelos de imagen médica: permite reproducir y comparar el comportamiento de DenseNet121 frente a otras arquitecturas bajo el mismo protocolo OOD.
- Benchmarking de arquitecturas: el checkpoint forma parte de un conjunto de 13 experimentos que comparan redes como ResNet, EfficientNet, Swin Transformer y arquitecturas híbridas, útil para estudios metodológicos.
- Desarrollo de sistemas de apoyo al diagnóstico (no clínico): puede servir como base para experimentar con técnicas de calibración, umbrales adaptativos o ensembles, siempre bajo supervisión experta.
- Educación en deep learning aplicado a salud: el repositorio incluye notebooks ejecutados, métricas por modelo y gráficas, facilitando su uso en cursos o talleres.
- Evaluación de robustez ante cambios de resolución: dado que el conjunto OOD varía entre 190 y 800 píxeles, es adecuado para estudiar el impacto del preprocesado y la resolución en la precisión.
- Auditoría de sesgos y artefactos en imágenes médicas: la documentación del proyecto advierte sobre riesgos de sesgo de fuente y fuga de sujetos, lo que permite analizar estos fenómenos en un entorno controlado.

## Benchmarks y rendimiento

Los resultados corresponden a la evaluación externa (OOD) del proyecto, con 3.500 imágenes. Se presentan las métricas de este checkpoint y las del resto de experimentos del benchmark para contexto.

| Experimento | Accuracy | AUC | F1 | Recall | Precision | Kappa |
|---|---:|---:|---:|---:|---:|---:|
| custom_msaf_effb0_My_model_0.3_augmentation | 0,908 | 0,988 | 0,901 | 0,822 | 0,998 | 0,817 |
| hybrid_dn121_effb0_0.3_augmentation | 0,861 | 0,967 | 0,841 | 0,726 | 1,000 | 0,723 |
| hybrid_dn121_effb0_not_augmentation | 0,839 | 0,939 | 0,812 | 0,684 | 1,000 | 0,680 |
| custom_msaf_effb0_My_model_not_augmentation | 0,805 | 0,936 | 0,764 | 0,618 | 0,999 | 0,613 |
| hybrid_swinT_effb0_0.3_augmentation | 0,795 | 0,975 | 0,748 | 0,599 | 0,997 | 0,593 |
| resnet34_not_augmentatiton | 0,794 | 0,954 | 0,747 | 0,596 | 0,999 | 0,591 |
| **densenet121 (este checkpoint)** | **0,785** | **0,984** | **0,732** | **0,578** | **1,000** | **0,573** |
| convnext_tiny | 0,775 | 0,960 | 0,716 | 0,557 | 1,000 | 0,553 |
| hybrid_swinT_effb0_not_augmentation | 0,745 | 0,956 | 0,665 | 0,498 | 1,000 | 0,494 |
| resnet50_not_augmentatiton | 0,719 | 0,962 | 0,619 | 0,448 | 1,000 | 0,444 |
| inception_v3_not_augmentation | 0,710 | 0,901 | 0,602 | 0,430 | 1,000 | 0,426 |
| efficientnet_b0 | 0,693 | 0,903 | 0,568 | 0,397 | 0,997 | 0,392 |
| mobilenetv2_100_not_augmentation | 0,639 | 0,889 | 0,450 | 0,290 | 1,000 | 0,286 |

DenseNet121 ocupa la séptima posición en accuracy y F1 dentro del benchmark, aunque destaca por un AUC alto (0,984) y precisión perfecta en la clase positiva.

## Requisitos de hardware

- Inferencia en CPU: viable gracias a los 7 millones de parámetros; una imagen de 224x224 se procesa en decenas de milisegundos en un procesador moderno.
- Inferencia en GPU: cabe en cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, Jetson Nano, o integradas). El checkpoint en safetensors ocupa aproximadamente 28 MB.
- Entrenamiento: el proyecto original utilizó un conjunto de 11.500 imágenes; con una GPU de 8 GB (p. ej., RTX 2070) es factible reentrenar desde cero en horas, aunque no se especifican los recursos exactos usados.
- Opciones de despliegue: PyTorch con `timm`, Hugging Face Inference Endpoints, o exportación a ONNX para servidores de inferencia. No se proporcionan archivos GGUF ni compatibilidad con llama.cpp.
- Latencia estimada: para un lote de 1 imagen en GPU (RTX 3090), alrededor de 5-10 ms; en CPU (i7-11700), 50-100 ms. Valores orientativos basados en el tamaño del modelo.

## Comparativa con modelos similares

El benchmark del proyecto incluye varios modelos de tamaño y propósito comparable, todos entrenados y evaluados bajo el mismo protocolo OOD. La comparación se centra en las métricas de la tabla anterior.

| Modelo | Parametros (aprox.) | Accuracy OOD | AUC OOD | Licencia |
|---|---|---|---|---|
| DenseNet121 (este checkpoint) | 7,0 M | 0,785 | 0,984 | MIT |
| ResNet34 | 21,3 M | 0,794 | 0,954 | MIT |
| ConvNeXt-Tiny | 28,6 M | 0,775 | 0,960 | MIT |
| EfficientNet-B0 | 5,3 M | 0,693 | 0,903 | MIT |

DenseNet121 ofrece un equilibrio competitivo entre tamaño reducido y AUC alto, aunque su recall es bajo en comparación con ResNet34. Para aplicaciones donde la sensibilidad es crítica, los modelos híbridos del proyecto (por ejemplo, `hybrid_dn121_effb0`) superan claramente a este checkpoint.

## Limitaciones y advertencias

- Uso exclusivamente educativo y de investigación: el autor declara explícitamente que no es apto para diagnóstico clínico ni toma de decisiones médicas.
- Clasificación binaria limitada: solo distingue entre tumor y no tumor; no identifica tipo, localización, grado ni pronóstico.
- Recall bajo (0,578) en el conjunto OOD: el modelo tiende a clasificar correctamente los casos negativos (precisión 1,000) pero falla en una proporción significativa de tumores, lo que podría ser peligroso en un contexto real.
- Sesgo potencial: la documentación advierte sobre sesgo de fuente, artefactos de imagen y riesgo de fuga de sujetos entre particiones.
- Sin validación clínica ni revisión regulatoria: no ha pasado por ensayos clínicos ni aprobación de agencias sanitarias.
- Rendimiento dependiente de la resolución: aunque el AUC es alto, la variación de resolución en el conjunto OOD (190-800 px) afecta a la precisión, y el modelo no fue entrenado con aumentación para mitigarlo.
- Repositorio con cero descargas y un solo like: se trata de un proyecto académico reciente, con escasa adopción y sin mantenimiento activo conocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fatihaybasn/brainmri-ood-densenet121
- Repositorio GitHub del proyecto: https://github.com/fatihaybsn/BrainMRI-OOD-10Models
- Revisión del código fuente (commit): https://github.com/fatihaybsn/BrainMRI-OOD-10Models/commit/a9920408189230b886773a64d113eb35bcba1971
- Archivo de citación (CITATION.cff): https://github.com/fatihaybsn/BrainMRI-OOD-10Models/blob/main/CITATION.cff
