# fireviewer/yolo11m-flame-smoke-zip7-a100

## Resumen

YOLO11M fine-tuneado para deteccion de llama y humo (clases `0 = flame`, `1 = smoke`) en imagenes de incendio. Lo desarrolla el usuario `fireviewer` partiendo de los pesos oficiales de Ultralytics YOLO11M, y se entrena sobre el dataset propio `fireviewer/fireviewer_fire_smoke_flame_v3_native` en una NVIDIA A100 con resolucion de entrada de 928 px.

Se trata de un checkpoint de continuacion ("reprise"): retoma el modelo `fireviewer/yolo11m-flame-smoke-resume-a100` en la epoca 50, conserva el estado del optimizador AdamW y la EMA, y anade siete lotes de imagenes humanas con un peso relativo de 5 sobre el total del muestreo por epoca. El mejor AP50-95 en validacion registrado es 0,3918 en la epoca 52 de 300 planificadas, con parada temprana tras 7 epocas sin mejora.

El interes practico esta en la especializacion: un detector de dos clases binarias (llama, humo) que puede integrarse en sistemas de vigilancia temprana de incendios, con pesos en formato Ultralytics (`.pt`) y un repo de 0,8 GB. No es un modelo de lenguaje ni un modelo multimodal general; es un detector de objetos puro para vision por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11M (Ultralytics), detector de objetos de una etapa, backbone CSP + cabeza de deteccion |
| Parametros totales | no disponible (variante M de YOLO11; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; resolucion de entrada 928 px) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato Ultralytics `.pt`; no se documentan variantes INT8/FP16) |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (Ultralytics PyTorch), con `best.pt` y `last.pt`; repo de 0,8 GB |
| Clases | 2: `0 = flame`, `1 = smoke` |
| Resolucion de entrenamiento | 928 px |
| Dataset | `fireviewer/fireviewer_fire_smoke_flame_v3_native`, revision `9e80effca41710c93c0d45abb62f06075a726464` |
| Hardware de entrenamiento | NVIDIA A100 |
| Epoca del checkpoint | 52 / 300 (parada temprana tras 7 epocas sin mejora) |
| Mejor AP50-95 validacion | 0,3918113755738779 |

## Arquitectura y entrenamiento

La arquitectura es YOLO11 en su variante M (tamano medio) de Ultralytics: un detector de objetos de una sola etapa con backbone convolucional y cabeza de prediccion anclada, disenado para inferencia en tiempo real. No hay componentes transformer, MoE ni SSM; es una CNN de deteccion clasica optimizada para velocidad y precision. El checkpoint parte de los pesos preentrenados de YOLO11M y se afina sobre un dataset especifico de fuego.

El entrenamiento se realizo en una NVIDIA A100 con imagenes a 928 px. El proceso es un fine-tuning en dos fases: primero un entrenamiento base (`yolo11m-flame-smoke-resume-a100`) que llega a la epoca 50 con 49 epocas completadas, y despues esta "reprise" que retoma desde ese punto conservando el estado AdamW, la EMA y la tasa de aprendizaje sin cambios. Se incorporan 566 imagenes procedentes de siete ZIP humanos, muestreadas con un peso relativo de 5 sobre el total de la epoca (el numero de muestras por epoca se mantiene igual al tamano del train). Se aplican aumentos moderados adicionales: rotacion de +-3 grados, cizallamiento de +-1 grado, luminosidad HSV-V minima de 0,45 y saturacion HSV-S minima de 0,75. El resto de hiperparametros se heredan del checkpoint original. No se documenta uso de RLHF/DPO (no aplica a deteccion) ni tecnicas de decodificacion especulativa.

Una innovacion destacable, aunque de gestion: los archivos `best.pt` y `last.pt` se guardan en cada epoca tanto en Drive como en Hugging Face, lo que permite reanudar el entrenamiento de forma robusta. Las metricas detalladas por clase estan en `metrics.json`; los logs e imagenes de entrenamiento no se publican.

## Capacidades

- Deteccion de objetos de dos clases: llama (`flame`) y humo (`smoke`) en imagenes.
- Localizacion con cajas delimitadoras (bounding boxes) y puntuaciones de confianza por clase.
- Inferencia en tiempo real gracias a la arquitectura YOLO11M, apta para video y streams.
- Entrenado a 928 px, lo que favorece la deteccion de objetos pequenos o distantes (columnas de humo lejanas, llamas de pequeno tamano).
- Capacidad de integrarse en pipelines de Ultralytics (Python, CLI) y exportarse a otros formatos (ONNX, TensorRT, CoreML) mediante las herramientas de Ultralytics.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingues ni de texto.
- No dispone de modo "thinking", vision adicional ni audio.

## Casos de uso

- Vigilancia temprana de incendios forestales: el modelo se despliega sobre camaras fijas o drones y detecta columnas de humo y focos de llama en tiempo real, aprovechando la resolucion de 928 px para captar senales a distancia.
- Monitorizacion de infraestructuras criticas (subestaciones, almacenes, plantas industriales): integrado en el circuito de CCTV, dispara alertas cuando detecta humo o llama antes de que el incendio se propague.
- Sistemas de extincion automatizados: la salida de cajas y clases puede alimentar controladores que activen rociadores o extintores en la zona detectada, con latencia baja propia de YOLO.
- Analisis forense y post-incendio: procesamiento por lotes de grabaciones para localizar el punto de origen y la evolucion del fuego, gracias a la inferencia rapida sobre video.
- Deteccion en vehiculos aereos no tripulados (UAV): el tamano M y la resolucion de entrada permiten ejecutar el modelo en hardware embebido (Jetson, por ejemplo) para patrullaje aereo.
- Filtrado y anotacion asistida de datasets: el detector puede pre-etiquetar grandes volumenes de imagenes de fuego/humo para acelerar el etiquetado humano en nuevos conjuntos de datos.
- Alertas en plataformas de teledeteccion satelital: combinado con imagenes de satelite de alta resolucion, sirve como primera pasada para priorizar zonas con posible humo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Mejor AP50-95 (validacion) | 0,3918113755738779 |
| Epoca del mejor checkpoint | 52 / 300 |
| Parada temprana | tras 7 epocas sin mejora |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K no aplican; tampoco se aportan AP50, precision/recall por clase ni comparaciones con otros detectores) en la informacion disponible. Las metricas detalladas por clase estarian en `metrics.json`, pero no se incluyen en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un YOLO11M a 928 px se estima un consumo moderado (tipicamente por debajo de 4-8 GB en FP16/FP32), aunque el autor no lo documenta.
- GPU recomendadas: NVIDIA A100 (usada en entrenamiento). Para inferencia, cualquier GPU moderna con suficiente VRAM (RTX 4090, RTX 3090, A10, T4) es adecuada.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060/4060 en adelante, aunque el dato exacto no esta confirmado por el autor.
- Opciones de despliegue: Ultralytics (Python/CLI), exportacion a ONNX, TensorRT, OpenVINO o CoreML mediante la libreria Ultralytics. No se documenta soporte nativo de vLLM, llama.cpp, Ollama o TGI (no aplican a deteccion).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fireviewer/yolo11m-flame-smoke-zip7-a100 | no disponible (YOLO11M) | no aplica (928 px) | AP50-95 0,3918 | AGPL-3.0 | Hugging Face |
| Ultralytics YOLO11M (base COCO) | variante M | no aplica (640 px por defecto) | no disponible en esta ficha | AGPL-3.0 | Ultralytics / Hugging Face |
| fireviewer/yolo11m-flame-smoke-resume-a100 | variante M | no aplica (928 px) | no disponible | AGPL-3.0 | Hugging Face |
| Otros detectores de fuego/humo open source | no disponible | no aplica | no disponible | variable | variable |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; solo se confirma que este checkpoint deriva del `yolo11m-flame-smoke-resume-a100`.

## Limitaciones y advertencias

- Solo dos clases (llama y humo): no detecta personas, vehiculos ni otros objetos, por lo que no sirve como detector generalista.
- El AP50-95 de 0,39 es moderado; puede generar falsos positivos y falsos negativos en escenas complejas (humo de otra fuente, niebla, reflejos).
- Sesgos desconocidos: el dataset de entrenamiento es propio y no se documenta su composicion demografica, geografica ni de condiciones de iluminacion, por lo que el rendimiento fuera de dominio no esta garantizado.
- Riesgo de sobreajuste al dominio del dataset `fireviewer_fire_smoke_flame_v3_native`; el uso en camaras o entornos no representados puede degradar la precision.
- Entrenamiento incompleto: parada en la epoca 52 de 300 por early stopping, lo que sugiere margen de mejora con mas datos o mas epocas.
- Licencia AGPL-3.0: el uso comercial requiere cumplir con las obligaciones de copyleft de la AGPL, lo que puede ser restrictivo para productos cerrados; revisar con asesoria legal antes de desplegar en produccion.
- No se publican logs ni imagenes de entrenamiento, lo que dificulta la reproducibilidad y la auditoria del proceso.
- No se documenta calibracion de umbrales de confianza ni metricas por clase, esenciales para produccion.
- El modelo no procesa texto ni tiene capacidades de razonamiento; cualquier caso de uso debe plantearse como deteccion visual pura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fireviewer/yolo11m-flame-smoke-zip7-a100
- Dataset: https://huggingface.co/datasets/fireviewer/fireviewer_fire_smoke_flame_v3_native
- Checkpoint previo: https://huggingface.co/fireviewer/yolo11m-flame-smoke-resume-a100
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- Repositorio de pesos en el hub (autor): https://huggingface.co/fireviewer
