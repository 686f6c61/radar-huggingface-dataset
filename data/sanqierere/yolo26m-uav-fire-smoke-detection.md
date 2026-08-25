# sanqierere/yolo26m-UAV-fire-smoke-detection

## Resumen

El modelo `sanqierere/yolo26m-UAV-fire-smoke-detection` es un detector de objetos especializado en la identificación de fuego y humo en imágenes aéreas captadas por drones, pensado para escenarios de vigilancia forestal y patrullaje de zonas boscosas. Fue desarrollado por el usuario de Hugging Face `sanqierere` a partir de la arquitectura YOLOv26m de Ultralytics, preentrenada en COCO, y posteriormente afinada con el conjunto de datos FASDD (Forest Aerial Smoke/Fire Detection) y un dataset propio de incendios forestales con drones.

El modelo resuelve un problema crítico en la prevención de incendios: la detección temprana de focos de fuego y columnas de humo en imágenes de baja altitud, donde los métodos tradicionales de teledetección por satélite tienen limitaciones de resolución temporal y espacial. Con aproximadamente 40 millones de parámetros y una entrada de 640×640 píxeles, ofrece un equilibrio entre precisión y velocidad, lo que lo hace adecuado para su despliegue en sistemas embebidos y plataformas de borde como las de CamThink. Su relevancia actual reside en la creciente demanda de soluciones de monitorización autónoma de bosques y la necesidad de alertas tempranas en un contexto de aumento de incendios forestales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv26m (Ultralytics) |
| Parámetros totales | ~40 M |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión, no texto) |
| Tipos de cuantización | no disponible (solo se publica el peso completo en formato `.pt`) |
| Idiomas soportados | no aplica (modelo de visión); la documentación está en inglés y chino |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, 44 MB) |

## Arquitectura y entrenamiento

El modelo se basa en YOLOv26m, la versión media de la familia YOLOv26 de Ultralytics, una arquitectura de detección de objetos de una sola etapa (single-stage) que combina una red troncal (backbone) eficiente con cabezas de detección ancladas. Al ser un modelo denso (no Mixture of Experts), todos sus parámetros (~40 M) se activan en cada inferencia. La entrada está fijada a 640×640 píxeles, y el modelo distingue dos clases: `fire` (fuego) y `smoke` (humo).

El entrenamiento partió de pesos preentrenados en COCO y se afinó sobre el dataset FASSA (Forest Aerial Smoke/Fire Detection) junto con un dataset propio de incendios forestales captados con drones. Se usó el optimizador SGD con una tasa de aprendizaje inicial de 0.005 y un decaimiento final de 0.001 mediante una política de coseno. Se entrenaron 200 épocas con un tamaño de lote de 16, y se aplicaron técnicas de aumento de datos como rotaciones de hasta 30 grados, volteos verticales y horizontales, escalado, ajustes HSV, suavizado de etiquetas (label smoothing 0.1) y multi-escala (0.3). El mejor epoch, según los autores, fue el 156.

## Capacidades

- Detección de objetos en tiempo real: identifica y localiza fuego y humo en imágenes y vídeos aéreos con cajas delimitadoras.
- Entrada de 640×640 píxeles, optimizada para drones y cámaras de baja altitud.
- Inferencia en vídeo: puede procesar secuencias de vídeo de patrullaje de drones (archivos `.mp4`).
- Soporte para inferencia por línea de comandos mediante `ultralytics` (`yolo predict`).
- Integración con el ecosistema Ultralytics: carga fácil mediante `YOLO("best.pt")`, entrenamiento adicional, validación y exportación a otros formatos.
- Capacidades multilingües: no aplica al ser un modelo de visión, aunque la documentación está disponible en inglés y chino.
- No soporta tool calling, agentes ni razonamiento multimodal; es exclusivamente un detector de objetos.

## Casos de uso

- Vigilancia forestal con drones: patrullaje periódico de zonas boscosas para detectar focos de fuego o columnas de humo en fases iniciales, permitiendo una respuesta rápida de los equipos de extinción.
- Alerta temprana en infraestructuras críticas: monitorización de líneas eléctricas, gasoductos o vías de ferrocarril que atraviesan áreas forestales, donde un cortocircuito o un descarrilamiento puede provocar incendios.
- Evaluación de incendios activos: sobrevuelo de incendios en curso para cartografiar la extensión del fuego y la dispersión del humo, ayudando a coordinar los recursos de extinción.
- Control de quemas controladas: seguimiento de quemas agrícolas o forestales programadas para verificar que no se descontrolen y detectar posibles escapes.
- Vigilancia de zonas de riesgo tras una tormenta seca: detección de rayos que hayan podido provocar focos de ignición en áreas remotas.
- Sistemas de vigilancia fijos con cámaras de largo alcance: despliegue en torres de vigilancia forestal que capturan imágenes aéreas de baja altitud, complementando la cobertura por satélite.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor sobre el dataset FASSA son los siguientes:

| Métrica | Valor |
|---|---|
| mAP@0.5 | 0.843 |
| mAP@0.5:0.95 | 0.594 |
| Precisión | 0.808 |
| Recall | 0.821 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los datos provienen del mejor epoch de entrenamiento (epoch 156) según el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El peso es de 44 MB (`.pt`), por lo que en FP32 la inferencia requiere aproximadamente 1 GB de VRAM; en FP16 o INT8 se reduce a 0.5-1 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; se puede ejecutar en tarjetas de consumo como RTX 3060, RTX 4070 o superiores. Para despliegue en drones, se puede compilar a TensorRT o exportar a ONNX para ejecución en dispositivos embebidos (Jetson, etc.).
- Compatibilidad con hardware de borde: la plataforma CamThink lo ofrece para dispositivos edge AI, lo que indica que se puede desplegar en hardware de baja potencia.
- Opciones de despliegue: se puede servir con la librería Ultralytics (Python o CLI), exportar a ONNX, TensorRT, CoreML, TFLite o usar el runtime de CamThink. No es adecuado para vLLM (modelo de visión, no LLM).
- Latencia y throughput: no disponible en la documentación; en una GPU moderna (RTX 4090) se espera una inferencia en tiempo real (>30 FPS) para imágenes de 640×640.

## Comparativa con modelos similares

| Modelo | Arquitectura | Params | mAP@0.5 | mAP@0.5:0.95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `yolo26m-UAV-fire-smoke-detection` | YOLOv26m | ~40 M | 0.843 (FASSA) | 0.594 (FASSA) | AGPL-3.0 | Hugging Face |
| YOLOv8n (detección genérica) | YOLOv8n | ~3.2 M | no comparable (COCO) | no comparable | AGPL-3.0 | Ultralytics |
| YOLOv11n (detección genérica) | YOLOv11n | ~2.6 M | no comparable (COCO) | no comparable | AGPL-3.0 | Ultralytics |

No hay datos de modelos específicos de detección de fuego/humo en UAV con los que comparar directamente en la información proporcionada. La comparativa con YOLOv8n/YOLOv11n es genérica, ya que no se han evaluado sobre FASSA.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para dos clases (fuego y humo) en escenarios de vuelo aéreo de baja altitud; su rendimiento en otras perspectivas (imágenes de satélite, cámaras de vigilancia a nivel de calle) no está validado.
- La licencia AGPL-3.0 implica obligaciones de copyleft para uso comercial; si se integra en un producto cerrado, se debe evaluar la necesidad de una licencia comercial.
- Los pesos se publican en formato `.pt` de PyTorch; para otras plataformas es necesario exportar el modelo (ONNX, TensorRT, etc.), lo que puede requerir ajustes de precisión.
- La confianza recomendada es `conf=0.25`; en escenarios de alta densidad de humo o fuego, se puede ajustar entre 0.15 y 0.35 para equilibrar precisión y recall.
- No se han publicado análisis de sesgos ni robustez ante condiciones adversas (niebla, lluvia, iluminación variable), por lo que se recomienda validar en el entorno específico de despliegue.
- El repositorio en Hugging Face no contiene pesos adicionales ni documentación detallada del dataset propio; la reproducibilidad completa no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanqierere/yolo26m-UAV-fire-smoke-detection
- Copia espejo en Hugging Face: https://huggingface.co/xiazh0219/yolo26m-UAV-fire-smoke-detection
- Documentación de YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26
- Repositorio de Ultralytics en GitHub: https://github.com/ultralytics/ultralytics
- Ficha del modelo en CamThink: https://www.camthink.ai/developer-center/models/yolo26m-uav-fire-smoke-detection/
