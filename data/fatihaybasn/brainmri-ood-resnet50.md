# Fatihaybasn/brainmri-ood-resnet50

## Resumen

El modelo `Fatihaybasn/brainmri-ood-resnet50` es un checkpoint de ResNet50 entrenado para clasificación binaria de tumores cerebrales en resonancias magnéticas (MRI), distinguiendo entre las clases `no_tumor` y `tumor`. Lo desarrolla Fatih AYIBASAN como parte de un proyecto comparativo de 10 arquitecturas (13 checkpoints) centrado en la generalización out-of-distribution (OOD) bajo cambios de fuente y resolución de imagen. El modelo se publica con licencia MIT y está pensado exclusivamente para fines de investigación y educación, no para diagnóstico clínico.

La relevancia de este checkpoint radica en que forma parte de un benchmark sistemático que evalúa cómo distintas arquitecturas (desde ResNet y DenseNet hasta híbridos con Swin Transformer y EfficientNet) se comportan ante un desplazamiento de dominio real: el entrenamiento se realizó con 11.500 imágenes a resoluciones fijas de 256 y 512 píxeles, mientras que la evaluación externa usó 3.500 imágenes con resoluciones variables entre 190 y 800 píxeles. Con 23,5 millones de parámetros y una entrada de 224x224, este ResNet50 ocupa el décimo puesto en precisión (0,719) dentro del benchmark, aunque destaca por una precisión perfecta (1,0) y un AUC alto (0,962), lo que indica un comportamiento conservador con pocos falsos positivos pero una sensibilidad limitada.

El repositorio incluye el checkpoint en formato safetensors, el config.json con metadatos de preprocesado y umbral de decisión, el hash SHA-256 del archivo original y una carpeta `results/` con informes y figuras. Todo el código de entrenamiento y evaluación está disponible en GitHub, lo que permite reproducir el experimento completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (resnet50) |
| Parametros totales | 23.565.250 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada 224x224) |
| Tipos de cuantizacion | No disponible (solo pesos en precision completa safetensors) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien .pt original) |

## Arquitectura y entrenamiento

El modelo es un ResNet50 clasico, una red neuronal convolucional residual de 50 capas con conexiones de atajo, adaptada para clasificacion binaria con dos salidas (no_tumor, tumor). El entrenamiento se realizo sin aumentos de datos, sobre un conjunto de 11.500 imagenes de resonancia magnetica cerebral provenientes de pools de resolucion fija de 256 y 512 píxeles. No se especifican hiperparametros como numero de epocas, tasa de aprendizaje o funcion de perdida en la informacion disponible.

La innovacion principal no esta en la arquitectura en si, sino en el diseno experimental: el proyecto compara 10 arquitecturas diferentes bajo un mismo protocolo de evaluacion OOD, donde el conjunto de prueba externo (3.500 imagenes) presenta resoluciones variables de 190 a 800 píxeles, simulando un escenario de desplazamiento de dominio real. Este checkpoint en particular no utilizo aumentos durante el entrenamiento, lo que explica su menor robustez frente a variantes que si los usaron. El umbral de decision se fijo en 0,5 y no se menciona el uso de tecnicas como RLHF o DPO (no aplicables a un modelo de vision).

## Capacidades

- Clasificacion binaria de imagenes de resonancia magnetica cerebral: distingue entre presencia de tumor y ausencia de tumor.
- Entrada de imagen de 224x224 píxeles, con preprocesado estandar de ResNet (normalizacion por canal).
- Salida con dos clases: `no_tumor` (0) y `tumor` (1), con umbral de decision en 0,5.
- Capacidad de generalizacion out-of-distribution limitada: evaluado en imagenes con resoluciones entre 190 y 800 píxeles, obteniendo un AUC de 0,962.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales mas alla de la clasificacion de imagenes.
- No es un modelo de lenguaje: no procesa texto ni tiene capacidades multilingues.

## Casos de uso

- Investigacion en generalizacion OOD de modelos de imagen medica: este checkpoint sirve como referencia para estudiar como una arquitectura clasica como ResNet50 se degrada ante cambios de resolucion y fuente en resonancias cerebrales.
- Benchmark de arquitecturas para deteccion de tumores: dentro del proyecto de 10 modelos, permite comparar el rendimiento relativo de ResNet50 frente a DenseNet, EfficientNet, Swin Transformer o arquitecturas hibridas.
- Prototipado de sistemas de triaje asistido: aunque no esta validado clinicamente, puede usarse como base para experimentar en entornos de investigacion donde se requiera un clasificador binario rapido y con alta precision (1,0 en el conjunto OOD, aunque con baja sensibilidad).
- Educacion en deep learning aplicado a radiologia: al ser un modelo pequeno (23,5M parametros) y con licencia MIT, es adecuado para practicas academicas de fine-tuning o transferencia de aprendizaje en imagenes medicas.
- Analisis de robustez ante cambios de resolucion: el repositorio incluye el codigo y los resultados completos, lo que permite reproducir el experimento y estudiar el impacto del shift de resolucion en el rendimiento.
- Fine-tuning para datasets clinicos especificos: el checkpoint puede servir como inicializacion para adaptarlo a otros conjuntos de datos de MRI cerebral, siempre que se respete el aviso de uso no clinico.

## Benchmarks y rendimiento

El modelo se evaluo en el conjunto OOD externo del proyecto (3.500 imagenes). Sus metricas son:

| Accuracy | AUC | F1 | Recall / Sensitivity | Precision | Cohen's Kappa |
|---:|---:|---:|---:|---:|---:|
| 0.719336 | 0.962074 | 0.619107 | 0.448338 | 1.000000 | 0.443970 |

En el contexto del benchmark completo de 13 checkpoints, este modelo ocupa la posicion 10 por accuracy. La tabla completa es la siguiente:

| Experiment | Accuracy | AUC | F1 | Recall | Precision | Kappa |
|---|---:|---:|---:|---:|---:|---:|
| custom_msaf_effb0_My_model_0.3_augmentation | 0.908 | 0.988 | 0.901 | 0.822 | 0.998 | 0.817 |
| hybrid_dn121_effb0_0.3_augmentation | 0.861 | 0.967 | 0.841 | 0.726 | 1.000 | 0.723 |
| hybrid_dn121_effb0_not_augmentation | 0.839 | 0.939 | 0.812 | 0.684 | 1.000 | 0.680 |
| custom_msaf_effb0_My_model_not_augmentation | 0.805 | 0.936 | 0.764 | 0.618 | 0.999 | 0.613 |
| hybrid_swinT_effb0_0.3_augmentation | 0.795 | 0.975 | 0.748 | 0.599 | 0.997 | 0.593 |
| resnet34_not_augmentatiton | 0.794 | 0.954 | 0.747 | 0.596 | 0.999 | 0.591 |
| densenet121 | 0.785 | 0.984 | 0.732 | 0.578 | 1.000 | 0.573 |
| convnext_tiny | 0.775 | 0.960 | 0.716 | 0.557 | 1.000 | 0.553 |
| hybrid_swinT_effb0_not_augmentation | 0.745 | 0.956 | 0.665 | 0.498 | 1.000 | 0.494 |
| **resnet50_not_augmentatiton (this checkpoint)** | 0.719 | 0.962 | 0.619 | 0.448 | 1.000 | 0.444 |
| inception_v3_not_augmentation | 0.710 | 0.901 | 0.602 | 0.430 | 1.000 | 0.426 |
| efficientnet_b0 | 0.693 | 0.903 | 0.568 | 0.397 | 0.997 | 0.392 |
| mobilenetv2_100_not_augmentation | 0.639 | 0.889 | 0.450 | 0.290 | 1.000 | 0.286 |

No se han publicado resultados en benchmarks generales como ImageNet o Medical MNIST para este checkpoint especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 94 MB en fp32 (23,5M parametros x 4 bytes) y unos 47 MB en fp16. Cabe en cualquier GPU con mas de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de entrada como NVIDIA GTX 1650, RTX 3060 o superiores. Tambien puede ejecutarse en CPU con un rendimiento aceptable para inferencia por lotes pequenos.
- Al ser un modelo de vision pequeno, no requiere hardware especializado como A100 o H100.
- Opciones de despliegue: se puede servir con PyTorch, timm, ONNX Runtime o TensorRT. No aplica vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: en una GPU moderna (p. ej., RTX 3090), la inferencia de una sola imagen tarda menos de 5 ms; en CPU, puede rondar los 50-100 ms por imagen dependiendo del hardware.

## Comparativa con modelos similares

Comparacion con otros checkpoints del mismo proyecto (misma tarea y protocolo de evaluacion):

| Modelo | Parametros (aprox.) | Accuracy OOD | AUC | F1 | Recall | Precision |
|---|---:|---:|---:|---:|---:|---:|
| custom_msaf_effb0 (mejor del benchmark) | ~5M (EfficientNet-B0 base) | 0.908 | 0.988 | 0.901 | 0.822 | 0.998 |
| hybrid_dn121_effb0 (con aumentos) | ~15M (DenseNet-121 + EfficientNet-B0) | 0.861 | 0.967 | 0.841 | 0.726 | 1.000 |
| resnet34 (sin aumentos) | ~21M | 0.794 | 0.954 | 0.747 | 0.596 | 0.999 |
| **resnet50 (este modelo)** | 23.565.250 | 0.719 | 0.962 | 0.619 | 0.448 | 1.000 |
| efficientnet_b0 | ~5M | 0.693 | 0.903 | 0.568 | 0.397 | 0.997 |

Este ResNet50 muestra un rendimiento inferior en accuracy y F1 frente a arquitecturas mas modernas o hibridas, pero mantiene un AUC competitivo (0,962) y una precision perfecta. Su principal debilidad es la baja sensibilidad (0,448), lo que indica muchos falsos negativos en el conjunto OOD.

## Limitaciones y advertencias

- Uso exclusivamente para investigacion y educacion: no esta validado clinicamente ni aprobado por organismos regulatorios, por lo que no debe usarse en diagnostico medico ni en la toma de decisiones clinicas.
- Clasificacion binaria limitada: solo distingue entre tumor y no tumor; no identifica el tipo de tumor, su localizacion, grado ni pronostico.
- Rendimiento OOD especifico: las metricas se obtuvieron en un conjunto de prueba concreto (3.500 imagenes con resoluciones de 190 a 800 píxeles) y pueden no transferirse a otras poblaciones, protocolos de adquisicion o distribuciones de datos.
- Sesgos y riesgos de generalizacion: el entrenamiento se realizo sin aumentos y con un pool de resoluciones fijas, lo que puede introducir sesgos de dominio. La baja sensibilidad (0,448) implica que casi la mitad de los tumores reales no se detectan en el conjunto OOD, un riesgo critico en cualquier aplicacion medica.
- Posible fuga de sujetos o artefactos de imagen: la model card advierte sobre riesgos de sesgo en el dataset, artefactos y posibles fugas de sujetos entre entrenamiento y evaluacion.
- Sin soporte para otros tipos de imagen: el modelo esta entrenado especificamente para MRI cerebral y no debe aplicarse a otros dominios de imagen medica sin reentrenamiento.
- Formato de pesos limitado: solo se proporciona safetensors; no hay versiones cuantizadas (GGUF, ONNX, etc.) listas para usar en motores de inferencia especificos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Fatihaybasn/brainmri-ood-resnet50
- Proyecto GitHub (codigo y notebooks): https://github.com/fatihaybsn/BrainMRI-OOD-10Models
- Revision del codigo fuente: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/commit/a9920408189230b886773a64d113eb35bcba1971
- Archivo CITATION.cff: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/blob/main/CITATION.cff
