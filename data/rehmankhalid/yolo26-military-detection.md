# RehmanKhalid/yolo26-military-detection

## Resumen

El modelo `RehmanKhalid/yolo26-military-detection` es un conjunto de tres checkpoints de detección de objetos basados en la arquitectura YOLO26n de Ultralytics, fine-tuneados para identificar vehículos militares y aeronaves en imágenes. El autor, RehmanKhalid, ha entrenado tres variantes especializadas: una para vehículos en teledetección (MVRSD, 5 clases), otra para vehículos terrestres (Vehicles8, 8 clases) y una tercera para aeronaves militares (74 clases). El objetivo principal es servir como punto de partida para investigación y demostraciones de adaptación de dominio en detección de objetos, no como sistema de producción para uso militar ofensivo.

El modelo parte de los pesos preentrenados en COCO de YOLO26n, la variante "nano" de la familia YOLO26, optimizada para velocidad y despliegue en hardware limitado. El entrenamiento se realizó con 100 épocas, tamaño de imagen 640 píxeles, batch de 16, y coseno de tasa de aprendizaje, utilizando una GPU NVIDIA RTX 3090. El repositorio incluye únicamente pesos, configuraciones, métricas y algunas imágenes de ejemplo; no se distribuyen los conjuntos de datos de entrenamiento, cuyas licencias pertenecen a sus autores originales.

La relevancia de este modelo radica en su especialización en un dominio concreto (detección de activos militares) con un coste computacional reducido gracias a la arquitectura nano, lo que permite su ejecución en dispositivos de gama media. Sin embargo, su licencia "other" y las limitaciones declaradas por el autor restringen su uso a fines académicos y de demostración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics) |
| Parametros totales | no disponible (variante nano de YOLO26) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en formato .pt, presumiblemente FP32/FP16) |
| Idiomas soportados | no aplica |
| Licencia | other (investigacion y educacion; no uso comercial sin permiso) |
| Formato de pesos | .pt (PyTorch / Ultralytics) |

## Arquitectura y entrenamiento

YOLO26n es la variante "nano" de la familia YOLO26, una red neuronal convolucional de detección de objetos en una sola pasada (single-stage). La arquitectura combina un backbone basado en CSPDarknet con una cabeza de detección anclada que produce bounding boxes y probabilidades de clase. La versión nano reduce el número de canales y capas respecto a las variantes más grandes, priorizando la velocidad de inferencia sobre la precisión máxima. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, parámetros exactos) en la información proporcionada.

El entrenamiento consistió en un fine-tuning sobre los pesos preentrenados en COCO de `yolo26n.pt`. Se utilizaron tres conjuntos de datos distintos: MVRSD (5 clases de vehículos en teledetección), Vehicles8 (8 clases de vehículos terrestres) y un conjunto de aeronaves militares con 74 clases. La receta de entrenamiento fue idéntica para los tres: 100 épocas, tamaño de imagen 640, batch de 16, coseno de tasa de aprendizaje y optimizador automático. La evaluación se realizó sobre los splits de validación de cada conjunto, comparando el rendimiento del modelo base COCO frente al fine-tuneado. No se menciona el uso de técnicas como RLHF o DPO, ya que no aplican a modelos de visión.

## Capacidades

- Detección de objetos con bounding boxes y etiqueta de clase en imágenes.
- Tres dominios especializados: vehículos en teledetección (5 clases), vehículos terrestres (8 clases) y aeronaves militares (74 clases).
- Inferencia en tiempo real gracias a la arquitectura nano, adecuada para aplicaciones con restricciones de latencia.
- Integración con el ecosistema Ultralytics (Python y CLI) para inferencia y fine-tuning adicional.
- Soporte para umbral de confianza configurable (parámetro `conf`).
- Capacidad de transferencia de aprendizaje: los pesos pueden servir como punto de partida para fine-tuning en otros dominios de detección de objetos.
- No incluye capacidades de segmentación, clasificación de imagen completa ni visión por computador más allá de la detección.

## Casos de uso

- Investigación académica en adaptación de dominio: el modelo demuestra cómo un detector preentrenado en COCO puede adaptarse a un dominio específico (militar) con un aumento significativo de mAP, sirviendo como caso de estudio para técnicas de fine-tuning.
- Demostraciones educativas de detección de objetos: permite mostrar el funcionamiento de YOLO26n en un dominio de nicho sin necesidad de entrenar desde cero, ideal para cursos de visión por computador.
- Prototipado rápido de sistemas de vigilancia no ofensiva: el checkpoint de teledetección (MVRSD) puede utilizarse para detectar vehículos en imágenes satelitales o aéreas en entornos controlados de investigación.
- Análisis de imágenes históricas o documentales: identificación de vehículos y aeronaves militares en fotos o vídeos de archivo para fines de documentación o museística.
- Evaluación comparativa de arquitecturas: al ser un modelo nano, permite medir el trade-off entre velocidad y precisión frente a variantes más grandes de YOLO26 o de otras familias.
- Base para fine-tuning en dominios relacionados: por ejemplo, detección de vehículos civiles en entornos urbanos o de aeronaves comerciales, partiendo de los pesos aquí publicados.

## Benchmarks y rendimiento

El autor proporciona métricas de validación para cada checkpoint, así como una comparación con el modelo base COCO sin fine-tuning. No se han encontrado resultados de benchmarks externos adicionales.

| Checkpoint | Dominio | Clases | mAP50 | mAP50-95 | Precision | Recall |
|---|---|---|---:|---:|---:|---:|
| `yolo26n_mvrsd_best.pt` | Remote-sensing vehicles (MVRSD) | 5 | 0.842 | 0.586 | 0.812 | 0.792 |
| `yolo26n_vehicles8_best.pt` | Ground vehicles | 8 | 0.644 | 0.419 | 0.751 | 0.553 |
| `yolo26n_aircraft_best.pt` | Military aircraft | 74 | 0.706 | 0.625 | 0.770 | 0.605 |

Comparación baseline vs fine-tune (mismo split de validación):

| Modelo | Baseline mAP50 (COCO YOLO26n) | Fine-tuned mAP50 | Ganancia |
|---|---:|---:|---:|
| MVRSD | 0.005 | 0.842 | +83.7 pp |
| Vehicles8 | 0.063 | 0.644 | +58.1 pp |
| Aircraft | 0.001 | 0.706 | +70.5 pp |

Los resultados muestran una mejora sustancial tras el fine-tuning, especialmente en el dominio de teledetección, donde el modelo base apenas detectaba objetos (mAP50 de 0.005). El checkpoint de aeronaves, con 74 clases, mantiene un mAP50-95 relativamente alto (0.625), lo que indica una buena localización y clasificación en un problema de gran número de categorías.

## Requisitos de hardware

- El modelo es la variante nano de YOLO26, por lo que es ligero en términos de parámetros (típicamente alrededor de 3-4 millones, aunque el valor exacto no se ha publicado).
- Inferencia en GPU: puede ejecutarse en GPUs de consumo como NVIDIA GTX 1060 (6 GB) o superiores, con un uso de VRAM estimado inferior a 1 GB para el modelo en FP32.
- Inferencia en CPU: viable para imágenes individuales o lotes pequeños, aunque con mayor latencia que en GPU.
- El autor utilizó una NVIDIA RTX 3090 (24 GB) para el entrenamiento, pero para inferencia no se requiere tanta capacidad.
- Despliegue compatible con el framework Ultralytics (Python y CLI), así como con herramientas de exportación a ONNX, TensorRT o CoreML para optimización en producción.
- No se han publicado datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos fine-tuneados para el mismo dominio. Como referencia, se puede comparar con la familia YOLO en su variante nano:

| Modelo | Parametros (aprox.) | mAP50 en COCO | Velocidad relativa | Licencia |
|---|---|---|---|---|
| YOLO26n (este repo, fine-tune) | no disponible | 0.842 (MVRSD) | Alta (nano) | other |
| YOLOv8n (preentrenado COCO) | 3.2 M | ~0.37 | Alta | AGPL-3.0 |
| YOLOv5n (preentrenado COCO) | 1.9 M | ~0.28 | Muy alta | AGPL-3.0 |

La comparativa es orientativa, ya que el modelo de este repo está fine-tuneado en un dominio específico y no es directamente comparable con los preentrenados en COCO. Para una comparación justa, habría que evaluar los modelos base en los mismos conjuntos de validación militares, algo que no se ha publicado.

## Limitaciones y advertencias

- Sesgo de dominio: el rendimiento puede degradarse significativamente en imágenes con sensores, altitudes o países no representados en los datos de entrenamiento.
- Dificultad con objetos pequeños, ocluidos o parcialmente visibles: es probable que se produzcan bounding boxes imprecisas o detecciones perdidas.
- La variante nano sacrifica precisión por velocidad; para aplicaciones que requieran máxima exactitud, se recomienda usar escalas mayores de YOLO26.
- Licencia "other": el autor indica que los pesos se proporcionan para investigación y educación, y que no están destinados a producción militar ofensiva, control de armas o vigilancia ilegal. El uso comercial requiere permiso explícito.
- Las licencias de los conjuntos de datos subyacentes (MVRSD, Vehicles8, Aircraft) pertenecen a sus autores originales; este repositorio solo redistribuye pesos, no datos.
- No se incluyen imágenes de entrenamiento en el repositorio, lo que limita la reproducibilidad completa del entrenamiento.
- No se han publicado detalles sobre el tamaño exacto del modelo, la composición de los datos de entrenamiento ni el número total de imágenes utilizadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RehmanKhalid/yolo26-military-detection
- Documentación de Ultralytics YOLO26: https://docs.ultralytics.com/models/yolo26
- Repositorio GitHub de YOLO26: https://github.com/ultralytics/yolo26
- Dataset Militaryv3iyolo26 (Rab Hell): https://platform.ultralytics.com/rab-hell/datasets/militaryv3iyolo26
- Dataset Militaryv3iyolo26 (Sunrise): https://platform.ultralytics.com/sunrise/datasets/militaryv3iyolo26
