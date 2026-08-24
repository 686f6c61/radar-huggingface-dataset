# JONNYVERSE/stockmarket-pattern-detection-yolov8-onnx

## Resumen

El modelo `JONNYVERSE/stockmarket-pattern-detection-yolov8-onnx` es una conversión a formato ONNX del detector de patrones de gráficos bursátiles basado en YOLOv8s, originalmente desarrollado por foduucom. Su propósito es identificar en tiempo real patrones de velas japonesas y formaciones técnicas (como doble techo, doble suelo o cabeza y hombros) a partir de capturas de pantalla de plataformas de trading. Al estar en ONNX, puede ejecutarse con ONNX Runtime en múltiples entornos sin depender del framework original de PyTorch.

La relevancia actual de este modelo radica en su potencial para integrarse en sistemas de análisis técnico automatizado, asistentes de trading o herramientas de backtesting. Su tamaño reducido (0,2 GB) y su arquitectura eficiente lo hacen adecuado para despliegues ligeros, incluso en entornos con recursos limitados. Sin embargo, la información pública sobre este repositorio es mínima: no se proporcionan detalles de entrenamiento, métricas ni documentación técnica más allá de la licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (red neuronal convolucional para deteccion de objetos) |
| Parametros totales | no disponible (estimacion tipica de YOLOv8s: ~11 M, no confirmada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLOv8s, una variante compacta de la familia YOLOv8 diseñada para deteccion de objetos en tiempo real. YOLOv8 emplea una red backbone CSPDarknet y una cabeza de deteccion con anclas libres, optimizada para equilibrar precision y velocidad. La version original de foduucom fue entrenada especificamente para reconocer seis patrones de graficos bursatiles a partir de capturas de pantalla de TradingView u otras plataformas.

No se dispone de informacion detallada sobre el proceso de entrenamiento de esta conversion ONNX: ni numero de epocas, ni tamano del dataset, ni tecnicas de aumento de datos. Tampoco se especifica si se aplicaron tecnicas de post-entrenamiento como cuantizacion o pruning. El repositorio actual solo contiene los pesos en formato ONNX y la licencia, sin documentacion adicional.

## Capacidades

- Deteccion de patrones de graficos de velas japonesas, incluyendo formaciones como doble techo, doble suelo, cabeza y hombros, triangulos, etc. (segun el modelo original de foduucom, que detecta seis patrones).
- Identificacion de las ultimas 8 velas de un grafico, sus colores (alcista/bajista) y sus precios aproximados, segun la demo publica del espacio asociado.
- Procesamiento de imagenes de capturas de pantalla de plataformas de trading, devolviendo cajas delimitadoras y etiquetas de clase.
- Inferencia en tiempo real gracias a la eficiencia de YOLOv8s y al formato ONNX, que permite ejecucion con aceleracion por hardware (GPU/CPU).
- No incluye capacidades de generacion de texto, razonamiento, tool calling ni procesamiento de lenguaje natural.

## Casos de uso

- Alertas automaticas de patrones: un sistema puede monitorizar capturas de pantalla de graficos y lanzar alertas cuando se detecta un patron relevante, ayudando a traders a no perder oportunidades.
- Integracion en plataformas de trading: el modelo puede conectarse a APIs de TradingView o MetaTrader para analizar graficos en tiempo real y sugerir posibles puntos de entrada o salida.
- Backtesting historico: se puede procesar un gran volumen de imagenes de graficos historicos para validar la frecuencia y rentabilidad de ciertos patrones.
- Asistentes de analisis tecnico: herramientas de escritorio o web que permiten al usuario subir una captura y recibir una anotacion visual de los patrones detectados.
- Educacion financiera: aplicaciones didacticas que muestran a estudiantes de trading ejemplos de patrones reconocidos automaticamente.
- Filtrado de senales en estrategias cuantitativas: el modelo actua como un filtro previo en pipelines de trading algoritmico, descartando graficos sin patrones relevantes antes de aplicar estrategias mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas oficiales de precision media (mAP), velocidad de inferencia ni comparativas con otros detectores en el repositorio de HuggingFace ni en la documentacion asociada. Se recomienda evaluar el modelo sobre un conjunto propio de capturas de graficos antes de usarlo en produccion.

## Requisitos de hardware

- Al ser un modelo YOLOv8s en ONNX, su inferencia es ligera. Con cuantizacion FP32, requiere aproximadamente 0,2 GB de memoria (tamano del archivo), por lo que puede ejecutarse en CPU sin problemas para uso puntual.
- Para procesamiento en tiempo real de multiples graficos simultaneos, se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior). Una RTX 3060 o superior ofreceria margen para lotes mayores.
- Es compatible con ONNX Runtime, que soporta aceleracion por CUDA, TensorRT y DirectML, asi como con OpenVINO para CPUs Intel.
- No se dispone de datos de latencia o throughput especificos. En una GPU moderna, YOLOv8s suele alcanzar decenas de FPS, pero no se ha medido para esta conversion concreta.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| JONNYVERSE/stockmarket-pattern-detection-yolov8-onnx | YOLOv8s | no disponible | ONNX | Apache-2.0 | Deteccion de patrones de velas |
| foduucom/stockmarket-pattern-detection-yolov8 | YOLOv8s | ~11 M (estimado) | PyTorch | Apache-2.0 | Deteccion de patrones de velas (original) |
| Modelos de deteccion de patrones basados en CNN clasicos (p.ej. Faster R-CNN) | Faster R-CNN | ~40 M | PyTorch | varios | Deteccion de objetos generica, no especializada |

La principal diferencia con el modelo original de foduucom es el formato de pesos (ONNX frente a PyTorch), que facilita el despliegue en entornos sin dependencias de Python. No se dispone de comparativas de rendimiento entre ambos. Otros modelos de deteccion generica (como Faster R-CNN) no estan especializados en patrones bursatiles y requeririan entrenamiento adicional.

## Limitaciones y advertencias

- La informacion publica es muy limitada: no hay documentacion sobre el proceso de entrenamiento, el dataset utilizado ni las metricas de calidad. Esto impide evaluar su fiabilidad de antemano.
- El modelo original de foduucom fue entrenado probablemente con capturas de TradingView; puede no generalizar bien a otras plataformas o estilos de grafico (colores, escalas, indicadores superpuestos).
- Riesgo de alucinacion en deteccion: puede producir falsos positivos, especialmente en graficos con ruido visual o multiples indicadores.
- No se especifican los seis patrones concretos que detecta; el usuario debe verificar experimentalmente cuales son y si se ajustan a su estrategia.
- Al ser una conversion ONNX, no se garantiza que conserve exactamente el mismo comportamiento que el modelo PyTorch original si hubo diferencias en la exportacion.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable de cumplir con las condiciones de uso de los datos de entrenamiento originales, que no se han divulgado.
- No hay soporte para otros idiomas ni capacidades de texto; es exclusivamente un modelo de vision.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/JONNYVERSE/stockmarket-pattern-detection-yolov8-onnx
- Modelo original de foduucom: https://huggingface.co/foduucom/stockmarket-pattern-detection-yolov8
- Repositorio GitHub del proyecto original: https://github.com/foduucom/Stockmarket-pattern-detection
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/doinglean/stockmarket-pattern-detection-yolov8
- Ficha del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/stockmarket-pattern-detection-yolov8-foduucom
