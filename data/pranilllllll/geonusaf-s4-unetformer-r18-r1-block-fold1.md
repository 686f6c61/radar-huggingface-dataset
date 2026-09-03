# Pranilllllll/geonusaf-s4-unetformer-r18-R1-block-fold1

## Resumen

El modelo `Pranilllllll/geonusaf-s4-unetformer-r18-R1-block-fold1` es un sistema de segmentación semántica para imágenes de teledetección, desarrollado por el usuario Pranilllllll dentro del proyecto GeoNUSAF. Está específicamente entrenado para clasificar el uso del suelo en el Valle de Katmandú (Nepal) en seis clases: residencial, carretera, río, bosque, suelo sin uso y agrícola. Utiliza una arquitectura UNetFormer con encoder ResNet-18 (timm) y un decoder de atención global-local, procesando imágenes de 512x512 píxeles con una resolución efectiva de 1.374 m/px.

El modelo se distingue por su entrenamiento mixto con datos reales y sintéticos: la etapa 4 (R1) combina 804 pares reales con 804 pares sintéticos generados en una etapa previa (stage 3), lo que busca mejorar la generalización en escenarios con escasez de datos etiquetados. El checkpoint `best.pt` contiene los pesos EMA y alcanza un mIoU de validación de 0.4897 sobre 136 teselas reales de validación (sin píxeles sintéticos). Es una implementación independiente de la arquitectura propuesta por Wang et al. (2022) en ISPRS Journal, y su relevancia radica en la validación de estrategias de aumento de datos sintéticos para segmentación remota.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNetFormer (encoder ResNet-18 de timm, decoder de atencion global-local) |
| Parametros totales | no disponible (estimable ~15-20 M para ResNet-18 + decoder) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision, entrada 512x512) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch, sin cuantizacion publicada) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (best.pt con model_state, cfg, metrics, arch_sig) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura UNetFormer de Wang et al. (2022), una red encoder-decoder para segmentación semántica que combina un encoder ResNet-18 preentrenado en ImageNet con un decoder que incorpora atención global-local. La versión implementada se identifica como `unetformer-r18-v2` (signature `29554ac657c8`) y es una implementación independiente del paper original, cuyo repositorio de referencia es GPL-3.0.

El entrenamiento se realizó con 1608 pares de imagen-máscara (804 reales + 804 sintéticos) en la etapa R1 del bloque fold 1. Los datos sintéticos provienen de `sugam24/geonusaf-stage3-fakepairs-block-fold1` (conjunto `fake_pairs_R1`). El optimizador es AdamW con learning rate de 0.0003 para el decoder y 3e-05 para el encoder, weight decay 0.01, y un scheduler cosine con 500 pasos de warmup y 6000 pasos totales. Se aplicaron regularizaciones: EMA (0.999), label smoothing (0.05), drop path (0.1) y dropout (0.1). El peso de la cabeza auxiliar es 0.4 y las clases se ponderaron según la distribución real. El mejor paso fue 5200 (seed 42) y se guardaron los pesos EMA.

## Capacidades

- Segmentación semántica de imágenes de teledetección con 6 clases de uso del suelo (residencial, carretera, río, bosque, suelo sin uso, agrícola).
- Clasificación píxel a píxel con soporte de `ignore_index=255` para regiones no etiquetadas.
- Procesamiento de imágenes de 512x512 píxeles, con normalización ImageNet y resolución efectiva de 1.374 m/px.
- Manejo de datos sintéticos y reales, demostrando robustez ante la mezcla de fuentes.
- Inferencia con pesos EMA (mejor generalización que pesos estándar).
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.

## Casos de uso

- Cartografía urbana: el modelo puede generar mapas de uso del suelo del Valle de Katmandú a partir de imágenes aéreas o satelitales, útil para planificación urbana y gestión de recursos.
- Monitorización de cambios de cobertura terrestre: al segmentar en clases como bosque, agrícola y residencial, permite detectar deforestación o expansión urbana en series temporales.
- Gestión de infraestructuras: la clase "carretera" (IoU 0.3357) puede alimentar sistemas de actualización de redes viales en zonas donde faltan datos GIS.
- Análisis de riesgos ambientales: la segmentación de ríos y suelo sin uso ayuda a identificar zonas vulnerables a inundaciones o erosión.
- Validación de datos sintéticos: el modelo sirve como referencia para evaluar si los pares sintéticos generados en etapas previas mejoran el rendimiento frente a entrenamiento solo con datos reales.
- Investigación en segmentación remota con datos limitados: su metodología de entrenamiento mixto (real + sintético) puede replicarse en otras regiones con escasez de anotaciones.

## Benchmarks y rendimiento

El modelo reporta métricas de validación sobre 136 teselas reales del fold 1 (sin píxeles sintéticos). Resultados por clase:

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0.8222 | 0.9024 |
| Road | 0.3357 | 0.5027 |
| River | 0.2281 | 0.3715 |
| Forest | 0.6946 | 0.8198 |
| UnusedLand | 0.3006 | 0.4623 |
| Agricultural | 0.5568 | 0.7153 |

Métricas globales:

| Metrica | Valor |
|---|---|
| mIoU | 0.4897 |
| mF1 | 0.6290 |
| OA (Overall Accuracy) | 0.7975 |
| Kappa | 0.6543 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El autor advierte que este run no es comparable con el fold-1 de la parte 1 del UNetFormer por diferencias en el protocolo de entrenamiento (epoch ceiling, early stopping, augmentación).

## Requisitos de hardware

- Inferencia en CPU: posible pero lenta para imágenes 512x512; se recomienda GPU para uso práctico.
- VRAM estimada: al ser un modelo ResNet-18 con decoder ligero, el checkpoint pesa 2.3 GB en disco. En FP32, los parámetros ocupan aproximadamente 100-200 MB, por lo que cabe en cualquier GPU con al menos 2 GB (ej. GTX 1050 Ti, Jetson).
- GPU recomendada: cualquier GPU moderna con 4 GB o más (RTX 3050, RTX 3060, A100 para entrenamiento). Para inferencia en lote, una RTX 3090 o A10 es suficiente.
- Despliegue: al ser un checkpoint PyTorch estándar, puede servirse con TorchServe, FastAPI + PyTorch, o exportarse a ONNX/TensorRT para producción.
- Latencia: en una GPU media (RTX 3060), la inferencia de una imagen 512x512 debería tomar <50 ms, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras arquitecturas (U-Net, DeepLabV3, etc.) en la informacion proporcionada. Existe una variante del mismo proyecto, `Pranilllllll/geonusaf-s4-unetformer-r18-R0-block-fold1`, que usa solo datos reales (R0) en lugar de la mezcla real+sintética (R1), pero no se han publicado métricas comparativas entre ambas en las fuentes consultadas. Tampoco hay comparación con el modelo `geonusaf-unetformer-r18-block-fold1` (parte 1) por diferencias metodológicas explícitas.

## Limitaciones y advertencias

- Rendimiento desigual por clase: la clase "River" tiene IoU bajo (0.2281) y "Road" también (0.3357), lo que limita su uso en aplicaciones que requieran precisión en estas categorías.
- El modelo está entrenado exclusivamente para el Valle de Katmandú; no se espera que generalice a otras regiones sin reentrenamiento.
- La validación se realizó solo sobre 136 teselas de un fold concreto; la varianza entre folds puede ser significativa.
- No hay información sobre licencia; el uso comercial podría estar restringido (la implementación de referencia es GPL-3.0, aunque esta implementación es independiente).
- No se han publicado análisis de sesgos o robustez ante condiciones atmosféricas, sombras o variaciones estacionales.
- El uso de datos sintéticos puede introducir artefactos que no se reflejan en las métricas de validación real.
- El checkpoint `best.pt` contiene pesos EMA, no los pesos originales; esto es una ventaja para generalización pero puede diferir de lo esperado en inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranilllllll/geonusaf-s4-unetformer-r18-R1-block-fold1
- Variante R0 (solo reales): https://huggingface.co/Pranilllllll/geonusaf-s4-unetformer-r18-R0-block-fold1
- Modelo base del proyecto (parte 1): https://huggingface.co/Pranilllllll/geonusaf-unetformer-r18-block-fold1
- Paper de referencia (Wang et al., 2022, ISPRS J. Photogramm. Remote Sens. 190:196-214): no disponible en la informacion proporcionada, pero citado en la model card.
