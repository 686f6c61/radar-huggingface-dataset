# calvadosdep/yolo26n-directional-signs

## Resumen

YOLO26n-directional-signs es un modelo de detección de objetos basado en la arquitectura YOLO26n de Ultralytics, fine-tuneado por el Departamento de Calvados (calvadosdep) para detectar señales de tráfico direccionales francesas en imágenes de nivel de calle. El modelo identifica tres clases: señales direccionales (directionnel), señales de rotonda (giratoire) y paneles de entrada a aglomeraciones (communes). Está diseñado para aplicaciones de inventario y mantenimiento de infraestructura vial, aprovechando imágenes de plataformas como Panoramax.

La versión actual (v3) incorpora un entrenamiento sobre datos revisados por humanos, incluyendo falsos positivos confirmados como hard negatives, lo que reduce significativamente las detecciones espurias respecto a versiones anteriores. Con una precisión del 95,6 % y un recall del 91,6 % en validación, el modelo elimina aproximadamente el 84 % de los falsos positivos confirmados, manteniendo un mAP50-95 de 0,829. Su tamaño reducido (variante nano) permite su despliegue en hardware de gama baja, incluso en CPU, sin sacrificar la robustez ante variaciones de escala gracias a un fuerte aumento de datos durante el entrenamiento.

La relevancia actual del modelo radica en su especialización para un dominio concreto (señalización francesa) y su enfoque en la reducción de falsos positivos, un problema crítico en sistemas de detección de objetos desplegados en entornos urbanos reales. Su licencia AGPL-3.0 condiciona su uso comercial, pero ofrece una base sólida para proyectos de código abierto y administraciones públicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (variante nano de YOLO26, sin NMS) |
| Parametros totales | no disponible (estimación ~4-5 M, no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (detección de objetos) |
| Tipos de cuantizacion | no disponible (formato PyTorch .pt, compatible con export a FP16/INT8) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (best.pt) |

## Arquitectura y entrenamiento

YOLO26 es la última familia de modelos de detección de objetos de Ultralytics, caracterizada por ser end-to-end y libre de NMS (Non-Maximum Suppression). La variante nano (n) es la más ligera, optimizada para inferencia en tiempo real en dispositivos con recursos limitados. El modelo base `yolo26n.pt` se fine-tuneó con imágenes de resolución 1024 píxeles y un factor de escala de 0,9, durante 200 épocas en una GPU A10G.

El conjunto de datos de entrenamiento, `calvadosdep/dir-signs-training`, combina 689 imágenes de entrenamiento y 79 de validación, procedentes de detecciones de Panoramax revisadas por humanos (cajas validadas con clases corregidas) y fusionadas con el dataset original de pierrelortie. Además, se incluyeron 236 imágenes de fondo con falsos positivos confirmados como hard negatives, lo que explica la notable reducción de detecciones espurias en la versión v3. Se aplicó un fuerte aumento de escala para garantizar robustez ante resoluciones de inferencia variables (640-1280 píxeles).

## Capacidades

- Detección de tres clases de señales de tráfico francesas: `directionnel` (señales direccionales), `giratoire` (señales de rotonda) y `communes` (paneles de entrada a aglomeración).
- Inferencia en imágenes de nivel de calle (street-level), con buen rendimiento en escenarios urbanos reales.
- Robusto a variaciones de escala gracias al aumento de datos durante el entrenamiento.
- Arquitectura sin NMS, lo que simplifica el pipeline de post-procesado; sin embargo, puede generar cajas duplicadas cercanas que requieren deduplicación por IoU.
- Compatible con el ecosistema Ultralytics (Python, CLI, export a ONNX, TensorRT, etc.).
- No soporta tool calling, agentes ni capacidades multimodales más allá de la detección visual.

## Casos de uso

- Inventario municipal de señalización: el modelo permite catalogar automáticamente las señales direccionales y de rotonda presentes en las calles de un municipio, facilitando la gestión de activos y la planificación de mantenimiento.
- Detección de señales dañadas u obstruidas: al integrarse en vehículos de inspección equipados con cámaras, el modelo identifica señales que requieren reparación o limpieza, reduciendo el trabajo manual de revisión.
- Actualización de bases de datos cartográficas: las detecciones pueden alimentar sistemas de información geográfica (GIS) para mantener al día los mapas de señalización vial, útil para navegadores y servicios de emergencia.
- Auditoría de cumplimiento normativo: permite verificar que las señales direccionales cumplen con la normativa francesa de señalización (presencia, ubicación y tipo), comparando las detecciones con los registros oficiales.
- Análisis de flujo de tráfico: al detectar señales de rotonda, el modelo puede contribuir a estudios de movilidad y seguridad vial, correlacionando la presencia de rotondas con patrones de accidentes.
- Integración en sistemas de mantenimiento predictivo: combinado con datos de imágenes periódicas, el modelo ayuda a predecir cuándo una señal puede degradarse, optimizando las rutas de inspección.

## Benchmarks y rendimiento

Los resultados de validación se obtuvieron sobre 79 imágenes reales con anotaciones humanas (81 cajas en total). La tabla siguiente resume las métricas por clase:

| Clase | Cajas | mAP50 | mAP50-95 |
|---|---|---|---|
| all | 81 | 0.969 | 0.829 |
| directionnel | 66 | 0.928 | 0.796 |
| communes | 12 | 0.984 | 0.796 |
| giratoire | 3 | 0.995 | 0.896 (no significativo) |

Además, se reportan precisión (P) de 0.956 y recall (R) de 0.916. En las 19 imágenes de fondo con falsos positivos confirmados de la versión v2, el modelo v3 solo detecta en 3 de ellas (frente a 21 cajas en v2), lo que supone una reducción de aproximadamente el 84 % de los falsos positivos. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser la variante nano de YOLO26, el modelo es ligero y puede ejecutarse en GPUs de consumo (p. ej., RTX 3060, RTX 4090) e incluso en CPU para inferencia a baja resolución.
- VRAM estimada: inferior a 1 GB en FP16 para imágenes de 640 píxeles; para 1024 píxeles podría necesitar alrededor de 2-3 GB, aunque no se especifica oficialmente.
- El entrenamiento se realizó en una GPU A10G (24 GB), pero la inferencia no requiere ese nivel de hardware.
- Opciones de despliegue: librería Ultralytics (Python), export a ONNX para TensorRT, o integración con servidores de inferencia como vLLM (aunque no es lo habitual para modelos de visión) o Triton.
- Latencia y throughput: no disponibles; se espera que sea muy rápida en GPU moderna (más de 100 FPS a 640 píxeles) y aceptable en CPU (varios FPS).

## Comparativa con modelos similares

No se dispone de benchmarks comparativos con otros modelos de detección de señales en la información proporcionada. Sin embargo, se puede contextualizar:

| Modelo | Arquitectura | Clases | mAP50-95 | Licencia |
|---|---|---|---|---|
| YOLO26n-directional-signs (v3) | YOLO26n | 3 (señales francesas) | 0.829 | AGPL-3.0 |
| YOLOv8n (genérico, fine-tuneado) | YOLOv8n | Variable | no disponible | AGPL-3.0 |
| YOLO11n (genérico, fine-tuneado) | YOLO11n | Variable | no disponible | AGPL-3.0 |

La principal ventaja de este modelo frente a un YOLO genérico es su especialización en señalización francesa y la incorporación de hard negatives, lo que reduce falsos positivos en entornos urbanos. No obstante, carece de la flexibilidad de un modelo multi-clase amplio.

## Limitaciones y advertencias

- Solo reconoce tres clases de señales; no cubre semáforos, señales de prohibición, límites de velocidad, etc.
- Entrenado exclusivamente con imágenes de Francia (Panoramax y dataset pierrelortie); puede no generalizar bien a señalización de otros países o estilos regionales.
- La clase `giratoire` tiene solo 3 cajas en validación, por lo que su métrica (mAP50-95 0.896) no es estadísticamente significativa.
- La arquitectura sin NMS puede producir cajas duplicadas; se recomienda aplicar deduplicación por IoU>0.7 y misma clase para obtener resultados limpios.
- Licencia AGPL-3.0: cualquier uso comercial o distribución del modelo o sus derivados debe cumplir con los términos copyleft de esta licencia, lo que puede ser restrictivo para empresas.
- No se documentan sesgos específicos, pero al ser un modelo de visión entrenado con datos geográficos limitados, puede presentar sesgos de contexto (p. ej., menor rendimiento en zonas rurales o con condiciones de iluminación extremas).
- El repositorio no incluye el dataset completo ni scripts de entrenamiento; solo el peso `best.pt`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/calvadosdep/yolo26n-directional-signs
- Dataset de entrenamiento: https://huggingface.co/datasets/calvadosdep/dir-signs-training
- Documentación de YOLO26 de Ultralytics: https://docs.ultralytics.com/models/yolo26
- Perfil de la organización calvadosdep: https://huggingface.co/calvadosdep
- Ejemplos de YOLO26n en la plataforma Ultralytics: https://platform.ultralytics.com/harsh/yolo26/yolo26n y https://platform.ultralytics.com/cardinal-buffalo/yolo26/yolo26n
