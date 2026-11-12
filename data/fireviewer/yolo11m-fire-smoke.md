# fireviewer/yolo11m-fire-smoke

## Resumen

YOLO11M · Fire & Smoke es un detector de objetos basado en la arquitectura YOLO11 en su variante M (medium), desarrollado por el usuario fireviewer y publicado bajo el ecosistema Ultralytics. Resuelve una tarea concreta de visión por computador: la localización y clasificación de dos clases nativas, `fire` (fuego y llamas visibles) y `smoke` (humo visible), devolviendo cajas delimitadoras, clase y puntuación de confianza para cada detección. No es un modelo generativo ni un LLM: es un detector de una sola etapa pensado para prototipado y evaluación en imágenes.

El modelo se inicializa desde `yolo11m.pt` preentrenado en COCO y se afina sobre el dataset `fireviewer/fireviewer_fire_smoke_flame_v3_native`, con 78 450 imágenes de entrenamiento, 11 266 de validación y 13 523 de test, a una resolución de entrada de 928 × 928 píxeles. El entrenamiento se detuvo manualmente tras 42 épocas completas (de un máximo configurado de 300) al considerar el autor que las ganancias de validación eran marginales.

Es relevante ahora porque cubre un caso de uso de seguridad (detección temprana de incendios y humo) con un checkpoint abierto, reproducible y con métricas de validación publicadas, aunque sin resultados sobre el split de test reservado. La licencia AGPL-3.0 condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11M (detector de objetos de una etapa, familia Ultralytics) |
| Parametros totales | no disponible (checkpoint `best.pt` de 201 292 844 bytes, incluye estados de entrenamiento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publican pesos `best.pt` y `last.pt`; no se documentan exports a ONNX, TensorRT ni cuantizaciones int8/fp16) |
| Idiomas soportados | no disponible (no procesa texto; clases en inglés: `fire`, `smoke`) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, Ultralytics); `best.pt` y `last.pt` |

Otros datos del run: resolución de entrada 928 × 928 con letterboxing Ultralytics, batch físico de 55 imágenes (AutoBatch al 75 % de memoria), optimizador AdamW con LR inicial 0.0005 y decaimiento coseno, weight decay 0.0005, warmup de 5 épocas, AMP activada, 42 épocas completas.

## Arquitectura y entrenamiento

La arquitectura es YOLO11 en variante M, un detector de objetos de una etapa de la familia Ultralytics. Se inicializa desde los pesos `yolo11m.pt` preentrenados en COCO y se afina sobre el dataset FireViewer con dos clases nativas. La entrada se procesa a 928 píxeles con letterboxing, una resolución superior a la habitual de 640 en YOLO, lo que favorece la detección de objetos pequeños o difusos como humo lejano, a costa de mayor coste computacional.

El entrenamiento se ejecutó en una NVIDIA A100-SXM4-80GB con AdamW, LR inicial 0.0005, decaimiento coseno, weight decay 0.0005, warmup de 5 épocas y precisión mixta (AMP). Se desactivaron las aumentaciones Mosaic, MixUp y Copy-Paste, manteniendo `scale=0.3`. El batch nominal de referencia fue `nbs=64` con acumulación inicial 1 y batch físico de 55 imágenes por AutoBatch. El stopping automático estaba configurado a 7 validaciones sin mejora, pero el autor detuvo el run manualmente en la época 43 tras 42 épocas completas, al considerar marginales las ganancias. No se documenta RLHF, DPO ni ninguna fase de alineación (no aplica a un detector).

## Capacidades

- Detección de objetos en imágenes con dos clases: `fire` (incluye la antigua clase `flame_visible`) y `smoke` (incluye emisiones pequeñas o ligeras).
- Salida por detección: caja delimitadora en formato `[x1, y1, x2, y2]` en píxeles de la imagen de entrada, ID de clase y score de confianza.
- Umbral de confianza configurable en inferencia (`conf`, con 0.25 como valor de partida en el ejemplo del autor).
- Procesamiento de imágenes a resolución nativa de 928 × 928 con letterboxing.
- No predice las seis categorías de contexto del dataset original ni proporciona distancia cámara-foco.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingües, de visión generativa, audio ni modo thinking.

## Casos de uso

- **Prototipado de sistemas de alerta temprana de incendios**: el modelo localiza fuego y humo en imágenes de cámara y devuelve cajas con score, lo que permite construir un pipeline de alerta con umbral ajustable según los falsos positivos tolerables. Adecuado por su resolución de 928 px y su especialización en dos clases.
- **Evaluación comparativa de detectores en dominio de incendios**: sirve como checkpoint de referencia con métricas de validación publicadas (mAP@0.50 de 65.07 %) para comparar contra otros modelos o futuros runs del mismo autor.
- **Análisis offline de grabaciones de vigilancia**: procesamiento por lotes de frames extraídos de vídeo para etiquetar segmentos con presencia de fuego o humo, aprovechando la API de Ultralytics y el formato `.pt`.
- **Generación de datasets asistida**: uso del detector para preetiquetar imágenes nuevas y acelerar la anotación humana, con revisión posterior dado el recall del 61.98 % global.
- **Integración en prototipos de edge o servidor con Ultralytics**: el checkpoint se carga con `ultralytics==8.4.210` y `YOLO(weights)`, lo que facilita desplegarlo en scripts Python y entornos de investigación.
- **Investigación en detección de humo difuso**: el modelo está entrenado sin Mosaic, MixUp ni Copy-Paste y con `scale=0.3`, una configuración conservadora que puede servir de base para estudiar el efecto de aumentaciones en clases visualmente difusas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de validación (`fireviewer/fireviewer_fire_smoke_flame_v3_native`, revisión `8c8b197fa1c928217529a04bff434fb70a66614e`), época 42, 11 266 imágenes y 10 925 cajas de referencia. Métricas no verificadas (`verified: false`).

| Clase | Precisión | Recall | F1 | AP50 | AP75 | AP50-95 | Cajas de referencia |
|---|---:|---:|---:|---:|---:|---:|---:|
| Global | 67.51 % | 61.98 % | 64.63 % | 65.07 % | 38.89 % | 38.63 % | 10 925 |
| fire | 65.26 % | 59.98 % | 62.51 % | 62.56 % | 37.53 % | 36.83 % | 5 727 |
| smoke | 69.77 % | 63.98 % | 66.75 % | 67.58 % | 40.26 % | 40.44 % | 5 198 |

Precisión y recall medidos a IoU 0.50 con el umbral de confianza de mejor F1 de Ultralytics. AP50-95 promedia IoU de 0.50 a 0.95; AP75 corresponde al umbral 0.75. No se publican resultados sobre el split de test reservado. No se han publicado comparativas con otros detectores en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. El checkpoint `best.pt` ocupa 201 292 844 bytes (~192 MB) e incluye estados de entrenamiento; un export de inferencia sería menor. A 928 × 928 la activación es más costosa que a 640, por lo que conviene reservar margen.
- **GPU de entrenamiento documentada**: NVIDIA A100-SXM4-80GB, con AutoBatch al 75 % de memoria y batch físico de 55 imágenes a 928 px.
- **GPU recomendadas para inferencia**: no especificadas por el autor. Por tamaño de checkpoint, un modelo YOLO11M a 928 px es manejable en GPU de consumo, pero no hay cifras publicadas de VRAM ni de latencia.
- **Compatibilidad con GPU de consumo**: no confirmada en la información disponible.
- **Opciones de despliegue**: la única vía documentada es Ultralytics (`ultralytics==8.4.210`) con `YOLO(weights).predict(..., imgsz=928, conf=0.25)`. No se documentan exports a ONNX, TensorRT, OpenVINO, vLLM, llama.cpp ni Ollama (estos últimos no aplican a un detector).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros detectores de fuego y humo en la información proporcionada. Como referencia estructural, el propio autor indica que el modelo se inicializa desde `yolo11m.pt` preentrenado en COCO, pero no se aportan métricas de ese checkpoint base ni de alternativas sobre el mismo dataset.

| Modelo | Parametros | Contexto | mAP@0.50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11M · Fire & Smoke (este) | no disponible | no aplica | 65.07 % (validación) | AGPL-3.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sin resultados en test**: no se publica evaluación sobre el split de test reservado (13 523 imágenes); las métricas son solo de validación.
- **Run interrumpido**: el entrenamiento se detuvo manualmente en la época 43, muy por debajo del máximo de 300 épocas; el techo de rendimiento no está explorado.
- **Métricas no verificadas**: los valores del model-index tienen `verified: false` y proceden del propio autor.
- **Falsos negativos y positivos documentados**: humo difuso o lejano, focos pequeños, reflejos, vapor y oclusiones pueden provocar omisiones o detecciones falsas.
- **Recall limitado**: 61.98 % global a IoU 0.50 implica que una fracción relevante de objetos de referencia no se detecta con el umbral de mejor F1.
- **No es un sistema de alarma cualificado**: el autor advierte explícitamente que los resultados no constituyen una cualificación como sistema de alarma autónomo; un uso operativo exige evaluación sobre imágenes representativas de las cámaras y condiciones reales.
- **Alcance restringido**: solo dos clases (`fire`, `smoke`); no predice las seis categorías de contexto del dataset ni estima distancia cámara-foco.
- **Licencia AGPL-3.0**: impone obligaciones de copyleft sobre el código que use el modelo en servicios en red; revisar compatibilidad antes de uso comercial propietario. Las condiciones de las imágenes de entrenamiento se documentan por separado en la model card.
- **Sesgos de dominio**: el rendimiento depende del dominio de imágenes de entrenamiento; no hay evaluación de sesgo demográfico ni geográfico publicada.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de detecciones espurias por reflejos o vapor, documentado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fireviewer/yolo11m-fire-smoke
- Dataset de entrenamiento: https://huggingface.co/datasets/fireviewer/fireviewer_fire_smoke_flame_v3_native
- Repositorio referenciado en el ejemplo de la model card: `fireviewer/yolo11m-fire-smoke-quality-a100-v2` (revisión `1d07a2a06cc6938f76235acb199f3e82b018c593`)
- Ultralytics (librería): https://github.com/ultralytics/ultralytics
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
