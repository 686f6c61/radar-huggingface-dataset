# Ank0805/waste-pothole-manhole-detection

## Resumen

Este repositorio aloja un modelo de detección de objetos basado en la arquitectura YOLO11n (nano) de Ultralytics, entrenado por el usuario Ank0805 para identificar tres riesgos concretos de infraestructura municipal: acumulaciones de residuos sólidos (`waste_pile`), baches en la calzada (`pothole`) y alcantarillas abiertas o sin tapa (`open_manhole`). El problema que resuelve es la inspección automatizada de infraestructura urbana, una tarea que tradicionalmente requiere cuadrillas de inspección manual y que este modelo permite realizar a partir de imágenes o vídeo, incluso desde dispositivos edge.

El modelo es relevante porque aborda un nicho aplicado (smart cities y gestión de residuos) con una arquitectura muy ligera: 2.59 millones de parámetros y 6.5 GFLOPs a una resolución base de 640x640, lo que lo hace viable tanto en servidores con alto throughput como en plataformas embebidas ARM. El autor ha realizado un trabajo de ingeniería de dataset destacable, con filtrado de artefactos de vehículo y discriminación entre grietas superficiales y cavidades estructurales reales para reducir falsos positivos. Se distribuye bajo licencia MIT, lo que permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11n (anchor-free, decoupled head, C3k2, SPPF, C2PSA) |
| Parametros totales | 2.590.425 (~2,59 M) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no aplicable (modelo de visión, entrada 640x640x3 RGB) |
| Tipos de cuantizacion | no disponible (exportable a FP16 vía TensorRT/OpenVINO; no se especifican cuantizaciones INT8) |
| Idiomas soportados | no aplicable (modelo de visión; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt); exportable a ONNX, TensorRT engine, OpenVINO y NCNN |

## Arquitectura y entrenamiento

El modelo emplea YOLO11n, la variante nano de la familia YOLO11 de Ultralytics. Entre sus componentes destacan el head decoupled anchor-free (cabezas separadas para clasificación y regresión de caja), los bloques C3k2 (bottlenecks con kernel parcial), el módulo SPPF (spatial pyramid pooling fast) y C2PSA (attention espacial parcial). Esta combinación permite un equilibrio entre latencia baja y precisión razonable en detección 2D de cajas delimitadoras, con solo 6,5 GFLOPs por inferencia a 640x640.

El entrenamiento se realizó sobre un corpus multi-fuente consolidado durante 100 épocas con optimizador AdamW (β1=0,937, β2=0,999, weight decay 0,0005), learning rate inicial de 1e-3 con decaimiento coseno hasta 1e-5 y 5 épocas de warmup. Las augmentaciones incluyeron Mosaic (desactivado en las últimas 15 épocas), Mixup 0,15, Copy-Paste 0,15, rotación de 180 grados, invariancia de escala 0,6 y random erasing 0,3. En la ingeniería de datos destacan tres decisiones: la agregación espacial de anotaciones individuales de basura en macro-cajas `waste_pile` (umbral L2 de centroides ≤ 0,18 en espacio normalizado), la eliminación de intrusiones de capó y salpicadero de vehículos en los frames (fuente habitual de falsos positivos en baches), y el filtrado explícito de grietas lineales superficiales para que las clases 1 y 2 representen solo daños estructurales reales. No se menciona el número total de imágenes ni de tokens/anotaciones del dataset.

## Capacidades

- Detección 2D de objetos (bounding boxes) en imágenes RGB de 640x640 en tres clases: `waste_pile`, `pothole` y `open_manhole`.
- Inferencia sobre imágenes individuales, directorios, ficheros de vídeo y streams en directo (RTSP, webcam) mediante el API de Ultralytics.
- Filtrado por clase con umbrales de confianza configurables (recomendaciones específicas por clase: 0,25 para `waste_pile`, 0,35 para `pothole`, 0,40 para `open_manhole`).
- Post-procesado con NMS configurable (IoU 0,45 por defecto).
- Exportación a múltiples runtimes optimizados: ONNX Runtime, TensorRT (FP16), OpenVINO (FP16) y NCNN para ARM.
- No aplica: generación de texto, razonamiento, código, matemáticas, tool calling, agentes, capacidades multilingües de texto, ni modalidades de audio. Es un modelo exclusivamente de visión por computador.

## Casos de uso

- Inspección automatizada de carreteras: montaje del modelo en vehículos municipales con cámara dashcam para registrar baches y alcantarillas abiertas durante rutas habituales, georreferenciando cada detección para generar mapas de deterioro viario.
- Gestión de residuos urbanos: análisis de imágenes capturadas por cámaras de vigilancia o drones para detectar acumulaciones de basura en calles y priorizar rutas de recogida, gracias a la agregación de residuos dispersos en una única caja `waste_pile` que evita detecciones fragmentadas.
- Seguridad ciudadana: alertas en tiempo real sobre alcantarillas abiertas o sin tapa procesando streams RTSP de cámaras urbanas, con umbral de confianza elevado (0,40) para minimizar falsas alarmas en un contexto crítico.
- Despliegue en edge embebido: gracias a los 2,59 M de parámetros y la exportación a NCNN, el modelo puede ejecutarse en placas ARM (Raspberry Pi, Jetson) para inspección autónoma en robots de inspección o cámaras inteligentes sin conexión a servidor.
- Auditorías de infraestructura a escala: procesamiento por lotes de archivos de vídeo históricos con `stream=True` para construir inventarios de daños viarios y justificar presupuestos de reparación.
- Integración en sistemas smart city: exportación a TensorRT u OpenVINO para integrar el detector en pipelines de vídeo analítico existentes sobre GPUs NVIDIA o CPUs Intel, respectivamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de mAP, precisión ni recall sobre ningún conjunto de evaluación estándar ni personalizado.

## Requisitos de hardware

- VRAM estimada para inferencia: con solo 2,59 M de parámetros y 6,5 GFLOPs, el modelo cabe con holgura en GPUs de 4 GB; en CPU la inferencia también es viable a resoluciones moderadas. No se publican cifras exactas de VRAM.
- GPUs recomendadas: cualquier GPU moderna es suficiente; para alto throughput en vídeo, TensorRT sobre GPUs NVIDIA (por ejemplo RTX 3060/4090 o superiores) es la vía indicada. No se requieren A100 ni H100.
- Consumer GPUs: sí, cabe sin problemas en prácticamente cualquier GPU de consumo con 4 GB de VRAM o más.
- CPU y edge: exportable a OpenVINO para CPUs/iGPUs Intel y a NCNN para plataformas ARM Cortex (Raspberry Pi, Jetson, móviles).
- Despliegue: el runtime natural es la librería Ultralytics (`pip install ultralytics`), con exportación a ONNX Runtime, TensorRT, OpenVINO y NCNN. No se menciona compatibilidad directa con vLLM, TGI u Ollama (orientados a LLM, no aplicables aquí).
- Latencia y throughput: no disponibles; dada la clase de modelo (YOLO nano, 6,5 GFLOPs), se espera latencia de milisegundos por frame en GPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ank0805/waste-pothole-manhole-detection (YOLO11n) | 2,59 M | Detección (residuos, baches, alcantarillas) | 3 | MIT | Hugging Face, pesos .pt |
| Ultralytics YOLO11n (base COCO) | 2,59 M | Detección genérica | 80 (COCO) | AGPL-3.0 (pesos base) | Hugging Face, GitHub |
| Ultralytics YOLOv8n (base COCO) | ~3,2 M | Detección genérica | 80 (COCO) | AGPL-3.0 (pesos base) | Hugging Face, GitHub |

Nota: la variante nano de YOLO11 es la misma arquitectura base; la diferencia de este repositorio es el fine-tuning específico en tres clases de infraestructura municipal y la licencia MIT del modelo resultante, más permisiva que la AGPL-3.0 de los pesos base de Ultralytics. No hay alternativas fine-tuned directamente comparables con métricas publicadas en la informacion disponible.

## Limitaciones y advertencias

- No se publican métricas de evaluación (mAP, precisión, recall), por lo que el rendimiento real debe validarse sobre datos propios antes de cualquier despliegue en producción.
- Riesgo de falsos positivos y falsos negativos: aunque el autor filtró grietas superficiales y artefactos de vehículo durante el entrenamiento, no hay garantías cuantificadas; en escenarios de seguridad (alcantarillas abiertas) se recomienda el modo de alta precisión con umbrales por clase y supervisión humana.
- El modelo solo detecta tres clases muy concretas; no generaliza a otros tipos de daño viario (grietas, hundimientos, señalización dañada) ni a otros tipos de residuos con taxonomía fina.
- La resolución de entrada fija de 640x640 puede limitar la detección de objetos pequeños en imágenes de alta resolución o tomadas a distancia.
- Sesgos del dataset: al tratarse de un corpus multi-fuente no documentado en detalle, el rendimiento puede degradarse en geografías, condiciones de iluminación o estaciones del año no representadas.
- Licencia MIT: sin restricciones para uso comercial, pero el modelo se ofrece tal cual, sin garantías; para aplicaciones de seguridad vial conviene una validación rigurosa y posible certificación.
- Repositorio de bajo uso (53 descargas, 1 like) y sin model card con evaluación: madurez y mantenimiento no garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ank0805/waste-pothole-manhole-detection
- Framework Ultralytics: https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics (inferencia y export): https://docs.ultralytics.com/

No se han encontrado enlaces adicionales (papers, blogs o demos) en la informacion disponible.
