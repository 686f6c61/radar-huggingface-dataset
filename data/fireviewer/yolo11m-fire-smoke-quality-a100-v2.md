# fireviewer/yolo11m-fire-smoke-quality-a100-v2

## Resumen

YOLO11M · Fire & Smoke es un modelo de deteccion de objetos basado en la arquitectura YOLO11 en su variante M (medium) de Ultralytics, ajustado por el usuario fireviewer para detectar dos clases especificas: fuego (clase 0) y humo (clase 1). El modelo parte de pesos preentrenados en COCO (`yolo11m.pt`) y se ha reentrenado sobre el dataset FireViewer (`fireviewer_fire_smoke_flame_v3_native`), con 78.450 imagenes de entrenamiento, 11.266 de validacion y 13.523 de test. Su proposito es servir como detector especializado en tareas de vision por computador para vigilancia de incendios y deteccion temprana de humo en imagenes RGB.

El checkpoint publicado (`best.pt`) se identifica en la model card como un **checkpoint fuente historico**, retenido como origen de la conversion publicada Cadryl y por motivos de reproducibilidad, no como el detector YOLO11M recomendado actualmente por el autor. El entrenamiento se realizo en una NVIDIA A100-SXM4-80GB durante 42 epocas con parada manual, a una resolucion de 928 px con letterboxing de Ultralytics.

Es relevante porque demuestra el flujo tipico de fine-tuning de un detector YOLO11 sobre un dominio vertical (incendios forestales y humo), con evidencia de validacion documentada por clase y una licencia AGPL-3.0 que condiciona su uso en produccion. El repositorio ocupa 0,2 GB y acumula 366 descargas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (Ultralytics), variante M (medium), deteccion de objetos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos `.pt` de PyTorch; conversiones no documentadas en la informacion proporcionada) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, Ultralytics) |
| Resolucion de entrada | 928 px con letterboxing de Ultralytics |
| Clases | 0 = fire, 1 = smoke |
| Libreria | ultralytics (version original de entrenamiento: 8.4.210) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un detector YOLO11 en variante M, una arquitectura de deteccion de objetos en una sola etapa (single-stage) perteneciente a la familia Ultralytics. Se inicializa desde los pesos preentrenados en COCO `yolo11m.pt` y se ajusta sobre el dataset FireViewer con dos clases. La entrada es RGB a 928 px con letterboxing estandar de Ultralytics; la salida son cajas `[x1, y1, x2, y2]` en pixeles de la imagen original junto con la clase y la confianza.

Los parametros del entrenamiento documentados son: GPU NVIDIA A100-SXM4-80GB, batch fisico 55 con `nbs=64`, optimizador AdamW con LR inicial 0,0005, decaimiento coseno, 5 epocas de warmup, weight decay 0,0005 y precision AMP. Las aumentaciones Mosaic, MixUp y Copy-Paste se desactivaron, con escala 0,3. El entrenamiento se detuvo manualmente tras 42 epocas completas (paciencia configurada: 7). El dataset de entrenamiento contiene 78.450 imagenes; la validacion, 11.266 imagenes con 10.925 cajas de referencia; el test, 13.523 imagenes. No se documentan tecnicas de RLHF/DPO (no aplicables a deteccion) ni innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Deteccion de objetos en imagenes RGB para dos clases: fuego y humo.
- Localizacion con cajas delimitadoras en pixeles de la imagen original y puntuacion de confianza por deteccion.
- Inferencia via la libreria `ultralytics` con `model.predict(..., imgsz=928, conf=0.25)`.
- Umbral de confianza configurable para ajustar el punto de operacion segun el dominio.
- Ejecucion sobre imagenes individuales mediante el pipeline estandar de Ultralytics.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo linguistico).
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision multimodal ni audio.

## Casos de uso

- **Vigilancia de incendios en camaras fijas**: el modelo puede procesar fotogramas RGB de camaras de vigilancia forestal a 928 px y emitir detecciones de fuego y humo con cajas y confianza, integrandose en un pipeline de alerta temprana. Es adecuado por su especializacion en las dos clases y su resolucion de entrada relativamente alta.
- **Deteccion temprana de humo en entornos industriales**: en plantas, almacenes o instalaciones con camaras IP, el modelo puede ejecutarse por fotograma para identificar columnas de humo antes de que aparezca llama visible, usando el umbral de confianza ajustado al dominio.
- **Pre-filtrado en sistemas de videovigilancia**: como primer estadio de un pipeline mas complejo, el detector puede descartar fotogramas sin fuego ni humo y reducir la carga de modelos mas costosos o de revision humana.
- **Analisis post-incidente de grabaciones**: procesamiento por lotes de videos archivados para localizar los fotogramas con presencia de fuego o humo y facilitar la revision forense o la reconstruccion de la cronologia.
- **Monitorizacion de quemas controladas**: en tareas de gestion forestal, el modelo puede verificar la presencia y extension de humo en imagenes aereas o de dron para supervisar quemas prescritas.
- **Prototipado e investigacion en vision por computador**: como checkpoint de referencia para experimentos de fine-tuning, comparacion de detectores o validacion de pipelines de anotacion, dado que la model card documenta el dataset, las revisiones y los parametros del entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (validation split del dataset `fireviewer/fireviewer_fire_smoke_flame_v3_native`, revision `8c8b197fa1c928217529a04bff434fb70a66614e`, epoca 42). Las metricas no estan verificadas de forma independiente (`verified: false`).

| Metrica | Global | fire | smoke |
|---|---:|---:|---:|
| Precision | 67,51 % | 65,26 % | 69,77 % |
| Recall | 61,98 % | 59,98 % | 63,98 % |
| F1 | 64,63 % | 62,51 % | 66,75 % |
| AP50 | 65,07 % | 62,56 % | 67,58 % |
| AP75 | 38,89 % | 37,53 % | 40,26 % |
| AP50-95 | 38,63 % | 36,83 % | 40,44 % |
| Cajas de referencia | 10.925 | 5.727 | 5.198 |

La validacion contiene 11.266 imagenes. No se han publicado resultados de benchmarks frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explicita en la informacion proporcionada. Para un detector YOLO11M a 928 px, el consumo es moderado y cabe holgadamente en GPU de consumo, pero no se documenta una cifra concreta.
- **GPU de entrenamiento documentada**: NVIDIA A100-SXM4-80GB con AMP.
- **GPU recomendadas para inferencia**: cualquier GPU NVIDIA con soporte CUDA es suficiente en la practica para un modelo de este tamano; no se especifican modelos concretos en la informacion disponible.
- **Compatibilidad con GPU de consumo**: si, por el tamano del modelo (variante M de YOLO11) y el formato `.pt`; no se detalla una lista de tarjetas verificadas.
- **Opciones de despliegue**: la model card documenta el uso mediante la libreria `ultralytics` (`pip install ultralytics huggingface_hub`) y la descarga del checkpoint con `hf_hub_download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. Como referencia estructural, el modelo se puede situar frente a otras variantes de la misma familia, aunque sin cifras de rendimiento comparables:

| Modelo | Familia | Clases | Resolucion de entrada | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| yolo11m-fire-smoke-quality-a100-v2 | YOLO11 M | fire, smoke | 928 px | AGPL-3.0 | AP50-95 38,63 % (validacion propia) |
| YOLO11 M COCO (base) | YOLO11 M | 80 clases COCO | configurable | AGPL-3.0 | no disponible en esta ficha |
| Otras variantes FireViewer YOLO11 | YOLO11 | fire, smoke | no disponible | AGPL-3.0 | no disponible |

No se dispone de comparaciones con detectores de otras familias (por ejemplo, DETR o RT-DETR) en la informacion proporcionada.

## Limitaciones y advertencias

- **Checkpoint historico, no recomendado**: la model card indica explicitamente que este checkpoint es la fuente historica de la conversion Cadryl y no el detector YOLO11M recomendado actualmente por el autor. Sus pesos difieren del checkpoint A100 mejorado.
- **Falsos negativos y positivos**: humo tenue o lejano, incendios pequenos, reflejos, vapor, oclusion y cambios de dominio de camara pueden provocar omisiones y falsos positivos.
- **No determina causalidad ni peligro**: el modelo no establece la causa, el origen geografico ni la peligrosidad real de un incendio.
- **No apto como alarma autonoma**: las puntuaciones de validacion no cualifican al modelo como sistema de alarma de emergencia autonomo.
- **Metricas no verificadas**: los resultados del model-index figuran con `verified: false`; no hay benchmark independiente ni test held-out publicado en la informacion disponible.
- **Licencia AGPL-3.0**: impone obligaciones de copyleft sobre el codigo derivado que se distribuya o se ofrezca como servicio en red; conviene revisar el cumplimiento antes de un uso comercial.
- **Condiciones de las imagenes fuente**: las condiciones de las imagenes del dataset son independientes y permanecen ligadas al dataset; deben mantenerse juntas las revisiones del modelo, las etiquetas, el preprocesado y el dataset.
- **Sin soporte linguistico ni multimodal**: no es aplicable a tareas de texto, dialogo o razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fireviewer/yolo11m-fire-smoke-quality-a100-v2
- Perfil del autor: https://huggingface.co/fireviewer
- Dataset: https://huggingface.co/datasets/fireviewer/fireviewer_fire_smoke_flame_v3_native
- Guia de coordenadas y clases del dataset: https://huggingface.co/datasets/fireviewer/fireviewer_fire_smoke_flame_v3_native#classes-and-box-coordinates
- Catalogo de recursos FireViewer: https://huggingface.co/spaces/fireviewer/README/blob/main/docs/RESOURCE_INDEX.md
