# Fatihaybasn/brainmri-ood-mobilenetv2-100

## Resumen

El modelo `Fatihaybasn/brainmri-ood-mobilenetv2-100` es un clasificador binario de imágenes de resonancia magnética (MRI) cerebral diseñado para distinguir entre presencia y ausencia de tumor. Lo desarrolla Fatih Ayıbasan como parte de un proyecto comparativo de diez arquitecturas, cuyo objetivo es estudiar la generalización fuera de distribución (OOD) en imágenes médicas ante cambios de fuente y resolución. El checkpoint concreto corresponde a una MobileNetV2 con factor de ancho 1.0 (`mobilenetv2_100`), con 2.260.546 parámetros y una entrada de 224x224 píxeles.

El modelo se publica con licencia MIT y está pensado exclusivamente para fines de investigación y educación, no para uso clínico. Su relevancia radica en que forma parte de un benchmark de 13 checkpoints que compara cómo distintas arquitecturas (convolucionales, híbridas y personalizadas) se comportan bajo desplazamiento de dominio, un problema crítico en el despliegue real de sistemas de diagnóstico asistido. Este checkpoint en particular ocupa la última posición del benchmark en términos de precisión OOD, lo que lo convierte en un caso de estudio útil para analizar las limitaciones de arquitecturas ligeras en dominios médicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 con factor de ancho 1.0 (`mobilenetv2_100`) |
| Parametros totales | 2.260.546 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada de 224x224 pixeles) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | safetensors (tensor-only) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura MobileNetV2 con un factor de ancho de 1.0, que emplea bloques residuales invertidos con convoluciones separables en profundidad. Es un modelo ligero diseñado originalmente para dispositivos móviles, con un coste computacional reducido. La cabeza de clasificación es una capa totalmente conectada con dos salidas (`no_tumor` y `tumor`), y el umbral de decisión se fija en 0.5.

Según la documentación del proyecto, el entrenamiento se realizó sobre 11.500 imágenes de MRI cerebral procedentes de pools de resolución fija de 256 y 512 píxeles. No se aplicó aumentación de datos en este experimento concreto (el nombre del checkpoint lo indica: `not_augmentation`). La evaluación fuera de distribución (OOD) se llevó a cabo sobre 3.500 imágenes con resoluciones variables entre 190 y 800 píxeles, lo que introduce un desplazamiento de resolución y de fuente respecto al entrenamiento. El proyecto incluye también versiones con aumentación para otras arquitecturas, pero este checkpoint no la utiliza.

## Capacidades

- Clasificacion binaria de imagenes de MRI cerebral: distingue entre presencia de tumor (clase `tumor`) y ausencia (clase `no_tumor`).
- Inferencia sobre imagenes de 224x224 pixeles en escala de grises (canal unico).
- Capacidad limitada de generalizacion fuera de distribucion: en el conjunto OOD del proyecto alcanza una exactitud de 0,639 y un AUC de 0,889, con una sensibilidad muy baja (0,290).
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural; es un modelo de vision puro.
- No ofrece capacidades multilingue ni multimodalidad mas alla de la entrada de imagen.

## Casos de uso

- Investigacion en generalizacion fuera de distribucion: el modelo sirve como referencia de linea base para estudiar como las arquitecturas ligeras degradan su rendimiento cuando cambia la resolucion o la fuente de las imagenes medicas, comparandolo con modelos mas grandes o con disenos hibridos.
- Benchmark de comparacion de arquitecturas: dentro del proyecto `BrainMRI-OOD-10Models`, este checkpoint permite evaluar el coste-beneficio de usar una MobileNetV2 frente a otras diez arquitecturas en un escenario OOD realista.
- Estudio de sesgos y limitaciones de modelos pequenos en medicina: su bajo recall (0,29) en el conjunto OOD lo convierte en un ejemplo didactico de los riesgos de desplegar modelos compactos sin validacion clinica.
- Reproducibilidad de experimentos: al publicarse junto con el codigo de entrenamiento, los notebooks y los informes de resultados, puede utilizarse para reproducir el experimento completo o para verificar la trazabilidad de los artefactos (hashes SHA-256 incluidos).
- Prueba de pipelines de conversion de pesos: el checkpoint se distribuye en formato safetensors, lo que permite practicar la conversion desde PyTorch state dict y la integracion en entornos de inferencia modernos.
- Educacion en vision por computador aplicada a salud: sirve como ejemplo de clasificacion binaria con una arquitectura clasica, mostrando el flujo completo desde el entrenamiento hasta la evaluacion OOD.

## Benchmarks y rendimiento

Los resultados del checkpoint en el conjunto de evaluacion OOD (3.500 imagenes con resoluciones variables) son los siguientes:

| Metrica | Valor |
|---|---|
| Accuracy | 0,638795 |
| AUC | 0,889407 |
| F1 | 0,449649 |
| Recall / Sensibilidad | 0,290030 |
| Precision | 1,000000 |
| Cohen's Kappa | 0,286404 |

En el contexto del benchmark completo de 13 experimentos, este checkpoint ocupa la ultima posicion en accuracy y AUC. La siguiente tabla muestra la comparativa con otros modelos del mismo proyecto, ordenados por accuracy descendente:

| Experimento | Accuracy | AUC | F1 | Recall | Precision | Kappa |
|---|---|---:|---:|---:|---:|---:|
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
| efficientnet_b0 | 0,693 | 0,903 | 0,568 | 0,397 | 0,997 | 0,392 |
| **mobilenetv2_100_not_augmentation (este checkpoint)** | 0,639 | 0,889 | 0,450 | 0,290 | 1,000 | 0,286 |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de clasificacion de imagenes, no de un modelo de lenguaje.

## Requisitos de hardware

- Inferencia en CPU: el modelo tiene solo 2,26 millones de parametros, por lo que puede ejecutarse en CPU sin problemas; una inferencia sobre una imagen de 224x224 tarda del orden de milisegundos en un procesador moderno.
- VRAM estimada: menos de 100 MB en FP32 (aproximadamente 9 MB para los pesos, mas overhead de activaciones); cabe en cualquier GPU, incluso integradas.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM, por ejemplo una NVIDIA GTX 1050 o superior; no requiere GPU de datacenter.
- Opciones de despliegue: puede servirse con PyTorch o timm, exportarse a ONNX para inferencia en CPU/GPU, o convertirse a TensorFlow Lite para entornos moviles. No hay soporte nativo documentado para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Throughput estimado: en una GPU moderna (p. ej., RTX 3090) se pueden procesar cientos de imagenes por segundo; en CPU, decenas por segundo.

## Comparativa con modelos similares

Dentro del mismo proyecto, los modelos comparables son otras arquitecturas de tamano similar entrenadas sin aumentacion, como `resnet34_not_augmentatiton`, `efficientnet_b0` y `inception_v3_not_augmentation`. La siguiente tabla resume sus diferencias:

| Modelo | Parametros (aprox.) | Accuracy OOD | AUC OOD | Licencia |
|---|---|---|---|---|
| mobilenetv2_100 (este) | 2,26 M | 0,639 | 0,889 | MIT |
| efficientnet_b0 | 5,3 M | 0,693 | 0,903 | MIT |
| inception_v3_not_augmentation | 23,8 M | 0,710 | 0,901 | MIT |
| resnet34_not_augmentatiton | 21,3 M | 0,794 | 0,954 | MIT |

El modelo es el mas ligero de la comparativa, pero tambien el que peor generaliza en el escenario OOD. Los modelos con mas parametros y arquitecturas mas profundas (ResNet34, InceptionV3) obtienen mejores resultados, aunque a costa de un mayor coste computacional. No se dispone de comparaciones con modelos externos al proyecto.

## Limitaciones y advertencias

- El modelo solo realiza clasificacion binaria (tumor/no tumor); no identifica el tipo de tumor, su localizacion, grado ni pronostico.
- El rendimiento OOD se midio en un conjunto de evaluacion especifico del proyecto (3.500 imagenes con resoluciones de 190 a 800 px) y puede no transferirse a poblaciones clinicas reales ni a otros protocolos de adquisicion.
- La sensibilidad es muy baja (0,29), lo que implica que el modelo pierde alrededor del 71% de los casos positivos de tumor en el conjunto OOD; esto lo hace inadecuado para cualquier uso de cribado o diagnostico.
- Existen riesgos de sesgo por la fuente de datos, artefactos de imagen, solapamiento de sujetos entre entrenamiento y evaluacion, y variaciones en la calidad de las resonancias.
- El modelo no ha pasado por validacion clinica ni revision regulatoria; su uso esta restringido a investigacion y educacion.
- No se proporcionan datos sobre el dataset de entrenamiento original (procedencia, licencia de las imagenes, poblacion), lo que limita la auditoria de sesgos.
- La precision es 1,0, pero este valor es enganoso porque se combina con un recall muy bajo; el modelo tiende a predecir casi siempre la clase mayoritaria (`no_tumor`), lo que infla la exactitud y la precision.

## Enlaces

- HuggingFace: https://huggingface.co/Fatihaybasn/brainmri-ood-mobilenetv2-100
- Repositorio del proyecto: https://github.com/fatihaybsn/BrainMRI-OOD-10Models
- Commit fuente: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/commit/a9920408189230b886773a64d113eb35bcba1971
- Archivo de citacion: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/blob/main/CITATION.cff
