# Fatihaybasn/brainmri-ood-hybrid-dn121-effb0-aug03

## Resumen

El modelo `brainmri-ood-hybrid-dn121-effb0-aug03` es un clasificador binario de imagenes de resonancia magnetica cerebral (MRI) que distingue entre presencia y ausencia de tumor. Fue desarrollado por Fatih AYIBASAN como parte de un proyecto comparativo de 10 arquitecturas para estudiar la generalizacion out-of-distribution (OOD) en imagen medica. Combina dos arquitecturas CNN clasicas, DenseNet121 y EfficientNet-B0, en un diseno hibrido que aprovecha las caracteristicas complementarias de ambas.

Con 11,7 millones de parametros y una entrada de 256x256 pixeles, el modelo es ligero y adecuado para entornos con recursos limitados. Su licencia MIT permite uso comercial y modificacion, aunque el autor restringe su uso a fines de investigacion y educacion, no para diagnostico clinico. La relevancia actual radica en su evaluacion OOD: se entreno con imagenes de resolucion fija (256 y 512 px) y se evaluo con 3.500 imagenes de resoluciones variables (190-800 px), demostrando como los modelos hibridos pueden mejorar la robustez frente a cambios de distribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrido DenseNet121 + EfficientNet-B0 (encoder dual) |
| Parametros totales | 11.677.662 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponibles (solo safetensors en FP32, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de vision, no textual) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint original en .pt) |

## Arquitectura y entrenamiento

El modelo combina dos redes neuronales convolucionales: DenseNet121 y EfficientNet-B0. El mecanismo exacto de fusion de caracteristicas (concatenacion, suma ponderada, etc.) no se especifica en la documentacion disponible, pero el nombre `hybrid_dn121_effb0` sugiere una combinacion de los mapas de caracteristicas de ambas ramas antes de la capa de clasificacion. La entrada es una imagen de 256x256 pixeles en escala de grises o RGB (no se indica el numero de canales).

El entrenamiento utilizo 11.500 imagenes procedentes de dos pools de resolucion fija (256 px y 512 px), con aumento de datos de intensidad 0.3 (no se detalla el tipo de aumento, probablemente rotaciones, desplazamientos o cambios de brillo). La evaluacion OOD externa se realizo con 3.500 imagenes de resoluciones variables entre 190 y 800 px. No se publican hiperparametros como numero de epocas, optimizador, funcion de perdida ni tasa de aprendizaje.

## Capacidades

- Clasificacion binaria de tumores cerebrales en MRI: distingue entre `no_tumor` (0) y `tumor` (1).
- Generalizacion out-of-distribution: demostrada frente a cambios de resolucion y fuente de adquisicion, con una AUC de 0,967 en el conjunto OOD.
- Alta precision (1,0 en el conjunto OOD), lo que indica ausencia de falsos positivos en esa evaluacion.
- Recall moderado (0,726), lo que implica que puede perder algunos tumores (falsos negativos).
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje.

## Casos de uso

- Investigacion academica en robustez de modelos de imagen medica: permite estudiar como los disenos hibridos mejoran la generalizacion ante cambios de resolucion y protocolos de adquisicion.
- Benchmark de arquitecturas para clasificacion de tumores: se puede comparar con los otros 12 checkpoints del proyecto para evaluar que arquitectura ofrece mejor equilibrio entre sensibilidad y especificidad.
- Prototipado de sistemas de apoyo al diagnostico: con supervision de un radiologo, puede servir como segunda opinion para detectar posibles tumores en MRI.
- Evaluacion de tecnicas de aumento de datos: la comparacion con la version sin aumento (`hybrid_dn121_effb0_not_augmentation`) muestra como el aumento de intensidad 0.3 mejora la accuracy en un 2,2 puntos porcentuales.
- Formacion de estudiantes en deep learning aplicado a medicina: su tamano reducido y licencia MIT lo hacen accesible para practicas docentes.
- Analisis de trade-offs precision-recall en deteccion de tumores: el umbral de decision 0,023 se puede ajustar para priorizar sensibilidad o especificidad segun el caso de uso.

## Benchmarks y rendimiento

Resultados del checkpoint en el conjunto OOD externo (3.500 imagenes, resoluciones 190-800 px):

| Metrica | Valor |
|---|---|
| Accuracy | 0,860744 |
| AUC | 0,966526 |
| F1 | 0,841442 |
| Recall (sensibilidad) | 0,726284 |
| Precision | 1,000000 |
| Cohen's Kappa | 0,722756 |

Comparativa con otros modelos del mismo benchmark (misma evaluacion OOD):

| Experimento | Accuracy | AUC | F1 | Recall | Precision | Kappa |
|---|---|---|---:|---:|---:|---:|---:|
| custom_msaf_effb0 (aug 0.3) | 0,908 | 0,988 | 0,901 | 0,822 | 0,998 | 0,817 |
| **hybrid_dn121_effb0 (aug 0.3, este modelo)** | **0,861** | **0,967** | **0,841** | **0,726** | **1,000** | **0,723** |
| hybrid_dn121_effb0 (sin aumento) | 0,839 | 0,939 | 0,812 | 0,684 | 1,000 | 0,680 |
| custom_msaf_effb0 (sin aumento) | 0,805 | 0,936 | 0,764 | 0,618 | 0,999 | 0,613 |
| hybrid_swinT_effb0 (aug 0.3) | 0,795 | 0,975 | 0,748 | 0,599 | 0,997 | 0,593 |
| resnet34 (sin aumento) | 0,794 | 0,954 | 0,747 | 0,596 | 0,999 | 0,591 |
| densenet121 | 0,785 | 0,984 | 0,732 | 0,578 | 1,000 | 0,573 |
| convnext_tiny | 0,775 | 0,960 | 0,716 | 0,557 | 1,000 | 0,553 |
| hybrid_swinT_effb0 (sin aumento) | 0,745 | 0,956 | 0,665 | 0,498 | 1,000 | 0,494 |
| resnet50 (sin aumento) | 0,719 | 0,962 | 0,619 | 0,448 | 1,000 | 0,444 |
| inception_v3 (sin aumento) | 0,710 | 0,901 | 0,602 | 0,430 | 1,000 | 0,426 |
| efficientnet_b0 | 0,693 | 0,903 | 0,568 | 0,397 | 0,997 | 0,392 |
| mobilenetv2_100 (sin aumento) | 0,639 | 0,889 | 0,450 | 0,290 | 1,000 | 0,286 |

El modelo ocupa la segunda posicion en accuracy y F1 dentro del benchmark, superado solo por el diseno `custom_msaf_effb0` con aumento. Su precision perfecta (1,0) indica que todos los positivos predichos son correctos, pero el recall de 0,726 significa que se pierde aproximadamente un 27% de los tumores reales.

## Requisitos de hardware

- VRAM estimada: ~47 MB para los pesos en FP32, mas el consumo de activaciones para imagenes 256x256, lo que totaliza menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050, RTX 2060, etc.). Tambien puede ejecutarse en CPU con tiempos de inferencia aceptables (del orden de decenas de milisegundos por imagen).
- Compatibilidad con hardware de bajo consumo: Raspberry Pi 4 o similar pueden ejecutar la inferencia, aunque con mayor latencia.
- Opciones de despliegue: PyTorch/timm para inferencia, exportacion a ONNX para optimizacion en CPU, o TensorRT para aceleracion en GPU.
- No se dispone de datos de latencia o throughput publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Accuracy OOD | AUC OOD | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hybrid_dn121_effb0 (este modelo) | 11,7 M | 0,861 | 0,967 | MIT | HuggingFace |
| hybrid_dn121_effb0 (sin aumento) | 11,7 M | 0,839 | 0,939 | MIT | HuggingFace |
| densenet121 (individual) | ~7 M | 0,785 | 0,984 | MIT | HuggingFace |
| efficientnet_b0 (individual) | ~5 M | 0,693 | 0,903 | MIT | HuggingFace |
| custom_msaf_effb0 (aug 0.3) | no disponible | 0,908 | 0,988 | MIT | HuggingFace |

La comparativa muestra que el hibrido supera a sus componentes individuales (densenet121 y efficientnet_b0) en accuracy y F1, aunque densenet121 tiene una AUC ligeramente superior (0,984 vs 0,967). El modelo `custom_msaf_effb0` con aumento es el mejor del benchmark, pero no se publican sus parametros totales. La version con aumento de este hibrido mejora claramente a la version sin aumento en todas las metricas.

## Limitaciones y advertencias

- Clasificacion binaria exclusivamente: no identifica el tipo de tumor, su ubicacion, grado ni pronostico.
- No ha pasado validacion clinica ni revision regulatoria; su uso esta restringido a investigacion y educacion.
- El rendimiento se midio en un conjunto OOD especifico (3.500 imagenes con resoluciones 190-800 px) y puede no transferirse a otras poblaciones, protocolos de adquisicion o equipos de resonancia.
- Riesgo de sesgo en el dataset: el autor menciona posibles sesgos de fuente, artefactos de imagen y fuga de sujetos.
- Recall moderado (0,726): existe un riesgo real de falsos negativos, lo que lo hace inadecuado para uso clinico sin supervision experta.
- No se proporcionan detalles sobre el metodo de fusion de las dos arquitecturas, lo que dificulta la reproducibilidad exacta del diseno.
- Solo trabaja con imagenes de resonancia magnetica; no es aplicable a otras modalidades (TC, PET, etc.).

## Enlaces

- HuggingFace: https://huggingface.co/Fatihaybasn/brainmri-ood-hybrid-dn121-effb0-aug03
- Repositorio GitHub del proyecto: https://github.com/fatihaybsn/BrainMRI-OOD-10Models
- Revision del codigo fuente: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/commit/a9920408189230b886773a64d113eb35bcba1971
- Archivo CITATION.cff: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/blob/main/CITATION.cff
