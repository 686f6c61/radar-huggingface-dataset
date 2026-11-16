# linhjr87/2D-to-3D-yolov11n-models

## Resumen

El repositorio `linhjr87/2D-to-3D-yolov11n-models` contiene los pesos entrenados del proyecto `fpyolo` (repositorio de código `linhjr87/2D-to-3D-yolov11n`, rama `main`), cuyo objetivo es la vectorización y reconstrucción de planos arquitectónicos en 2D hacia modelos 3D. No es un modelo de lenguaje: son dos redes convolucionales de la familia YOLO (Ultralytics) ajustadas sobre el conjunto de datos FloorPlanCAD para tareas de visión por computador sobre planos técnicos.

El entregable se compone de dos modelos complementarios. El primero es un detector YOLO11n (`runs/d11n_s1/best.pt`) que localiza 30 clases de objetos ("things"): puertas, ventanas, mobiliario, sanitarios, escaleras, entre otros. El segundo es un modelo de segmentación de instancias YOLO11n-seg (`runs/w11n_s1/best.pt`) que segmenta elementos estructurales (muro, muro cortina y barandilla). Ambos son modelos en miniatura (sufijo `n`), pensados para inferencia ligera y para encadenarse en un pipeline de reconstrucción 2D→3D.

La relevancia es acotada pero concreta: ofrece pesos reproducibles (semillas 0, 1 y 2, con métricas de test y comparación estadística publicadas) para una tarea de nicho —la interpretación automática de planos CAD— y establece un baseline cuantificado frente a YOLOv8n. El repositorio es de tipo privado según la model card y registra 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha habido validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (detección) y YOLO11n-seg (segmentación de instancias), Ultralytics |
| Parametros totales | no disponible (no se publica el recuento; la variante `n` de YOLO11 es la de menor escala de la familia) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); resolución de entrenamiento `imgsz` 1024 |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`; no se documentan exportaciones ONNX, TensorRT ni INT8) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 (además aplican los términos de uso de FloorPlanCAD) |
| Formato de pesos | `.pt` (checkpoint de PyTorch compatible con Ultralytics) |

## Arquitectura y entrenamiento

Ambos modelos son redes de detección/segmentación de la familia YOLO11 en su variante nano, implementadas sobre la librería Ultralytics. El detector resuelve una tarea de detección de objetos con 30 clases; el segmentador resuelve segmentación de instancias sobre tres clases estructurales (muro, muro cortina y barandilla). No hay innovaciones arquitectónicas propias: el valor del repositorio está en el ajuste fino y en la metodología de evaluación, no en el diseño de la red.

Los datos de entrenamiento provienen de FloorPlanCAD, un conjunto de planos arquitectónicos en formato CAD. La model card especifica la receta: `imgsz` 1024, optimizador SGD, `lr0` 0.01, batch 32, hasta 300 épocas con paciencia 50, y tres semillas por configuración (0, 1, 2). El detector se compara con un baseline YOLOv8n entrenado con la misma receta. La entrada debe ser una imagen de tinta normalizada: tres canales idénticos, fondo blanco y trazos negros, renderizada a aproximadamente 10 mm/px; para PNG RGBA crudos de FloorPlanCAD existe la opción `--from-floorplancad-png`. El umbral de confianza del segmentador de muros se fija en 0.25, elegido sobre el conjunto de validación. No se documenta uso de RLHF, DPO ni técnicas de alineación (no aplican a este tipo de modelo).

## Capacidades

- Detección de objetos en planos: 30 clases de elementos arquitectónicos (puertas, ventanas, mobiliario, sanitarios, escaleras, etc.).
- Segmentación de instancias de elementos estructurales: muro, muro cortina y barandilla.
- Procesamiento de imágenes de planos renderizadas en tinta (fondo blanco, trazos negros, ~10 mm/px).
- Importación directa de PNG RGBA de FloorPlanCAD mediante la opción `--from-floorplancad-png`.
- Encadenamiento detector + segmentador en un único pipeline de predicción (`fpyolo.predict`).
- Ejecución en CPU o GPU seleccionable (`--device`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No se documentan capacidades de visión general (VQA, OCR, captioning): el dominio está restringido a planos técnicos.

## Casos de uso

- Digitalización de planos en papel o PDF: renderizar el plano a tinta a ~10 mm/px y pasarlo por el detector para extraer las ubicaciones de puertas, ventanas y mobiliario, obteniendo una capa vectorial explotable en lugar de píxeles.
- Reconstrucción 2D→3D asistida: usar la segmentación de muros, muros cortina y barandillas como contorno estructural y extrusionar la geometría para generar un modelo 3D preliminar del inmueble.
- Inventario automatizado de estancias y elementos: contar puertas, ventanas y sanitarios por planta como paso previo a presupuestos, auditorías de accesibilidad o certificaciones.
- Control de calidad de documentación técnica: comparar la detección automática con el plano CAD de referencia para detectar elementos ausentes o mal etiquetados antes de publicar un proyecto.
- Automatización de flujos BIM: integrar las detecciones y máscaras como capas intermedias que alimenten herramientas de conversión a IFC o a formatos CAD vectoriales.
- Extracción de datos para entrenamiento: usar las predicciones sobre planos no anotados como preetiquetado débil para ampliar conjuntos de datos de planos con revisión humana posterior.
- Procesamiento por lotes en servidor modesto: al ser variantes nano, el pipeline puede ejecutarse sobre directorios completos de planos en CPU o en una GPU de consumo, lo que facilita su despliegue en entornos sin infraestructura dedicada.

## Benchmarks y rendimiento

| Modelo | Tarea | Metrica | Resultado |
|---|---|---|---|
| D YOLO11n (`d11n_s*`) | Detección, 30 clases | mAP50-95 (clases core), media de 3 semillas | 0.725 ± 0.003 |
| D YOLOv8n baseline (`d8n_s*`) | Detección, 30 clases | mAP50-95 (clases core), media de 3 semillas | 0.725 ± 0.003 |
| W YOLO11n-seg (`w11n_s*`) | Segmentación de muros | IoU de píxel de muro, semillas 0/1/2 | 0.703 / 0.701 / 0.691 |

La comparación entre YOLO11n y YOLOv8n arroja una diferencia de +0.0004 en mAP50-95, con intervalo de confianza bootstrap por clúster al 95% de [−0.0036, +0.0046]; el autor concluye explícitamente que no hay diferencia real entre ambas arquitecturas en esta tarea. No se publican resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark de lenguaje, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del repositorio (0.1 GB para 9 checkpoints) y la escala nano del modelo, la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el autor documenta ejecución mediante `--device <cpu|gpu index>`, sin especificar modelos concretos.
- GPU de consumo: sí, previsiblemente cualquier GPU consumer moderna; el cuello de botella real es la resolución de entrada (1024 px) y el tamaño del lote, no los parámetros del modelo.
- Despliegue: paquete Python `fpyolo` sobre Ultralytics; no se documentan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11n ajustado (este repo) | no disponible (escala nano) | imagen 1024 px | mAP50-95 0.725 (detección); IoU 0.703 (muros) | AGPL-3.0 + términos de FloorPlanCAD | Pesos `.pt` en HF, repo marcado como privado |
| YOLOv8n baseline (misma receta) | no disponible (escala nano) | imagen 1024 px | mAP50-95 0.725 (detección) | AGPL-3.0 (Ultralytics) | Pesos del baseline no publicados en este repo |
| YOLO11n / YOLOv8n preentrenados en COCO (Ultralytics) | no disponible (escala nano) | imagen variable | No comparable: dominio distinto (objetos naturales, no planos) | AGPL-3.0 | Públicos en Ultralytics |

La única comparación con datos es la que el propio autor publica frente a YOLOv8n, con resultado estadísticamente indistinguible. No se dispone de comparación con otros modelos especializados en interpretación de planos dentro de la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo planos arquitectónicos del estilo FloorPlanCAD; no funciona como detector de objetos general ni como modelo de lenguaje.
- Requisito estricto de preprocesado: la entrada debe ser una imagen de tinta con tres canales idénticos, fondo blanco, trazos negros y renderizado a ~10 mm/px; desviarse de esta normalización degrada la precisión.
- Licencia AGPL-3.0: su uso en servicios en red puede obligar a liberar el código del servicio; además se imponen los términos de uso de FloorPlanCAD, que condicionan el uso comercial y la redistribución de los datos derivados.
- Repositorio marcado como privado por el autor y con 0 descargas: no hay evidencia de uso externo ni de soporte de la comunidad.
- Sin información sobre sesgos: no se documenta el sesgo por estilo de dibujo, país, convención de representación ni época de los planos, lo que puede provocar fallos sistemáticos en planos con simbología distinta a la de FloorPlanCAD.
- Riesgo de falsos positivos y negativos en clases poco representadas; el autor solo publica métricas agregadas de "clases core", sin detallar el rendimiento por clase en la model card (aunque `per_class.csv` existe en el repo de código).
- El umbral de confianza del segmentador (0.25) está ajustado sobre validación y puede no transferir a otros dominios.
- Rutas absolutas en `args.yaml` y `metrics.json` apuntan a la máquina de entrenamiento; la reproducibilidad depende de reajustarlas.
- No se documentan cuantizaciones ni exportaciones: el despliegue en producción requiere conversión propia desde `.pt`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/linhjr87/2D-to-3D-yolov11n-models
- Repositorio de código (rama `main`): https://github.com/linhjr87/2D-to-3D-yolov11n
- Dataset en Hugging Face (`fpcad_v0.tar`): https://huggingface.co/datasets/linhjr87/2D-to-3D-yolov11n
- FloorPlanCAD (origen de los datos): https://floorplancad.github.io/
- Ultralytics (librería y familia YOLO11): https://github.com/ultralytics/ultralytics
