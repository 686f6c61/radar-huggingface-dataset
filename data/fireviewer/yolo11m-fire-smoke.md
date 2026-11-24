# fireviewer/yolo11m-fire-smoke

## Resumen

YOLO11M · Fire & Smoke es un modelo de deteccion de objetos especializado en la identificacion de fuego y humo en imagenes RGB, desarrollado por el usuario fireviewer y publicado en Hugging Face bajo la libreria Ultralytics. Se trata de un checkpoint de la variante mediana de la familia YOLO11 (YOLO11m) reentrenado sobre un dataset propio de incendios, con dos clases: `0=fire` y `1=smoke`. El modelo resuelve la tarea de localizar y clasificar regiones de llama y humo en escenas visuales, un caso de uso clasico en vigilancia forestal, monitorizacion industrial y sistemas de alerta temprana.

El checkpoint publicado (`best.pt`) se describe explicitamente como una fuente historica de conversion: no es el detector YOLO11M recomendado actualmente por el autor, sino la version retenida para reproducibilidad y como origen de una conversion posterior denominada Cadryl. El entrenamiento se realizo sobre la revision `8c8b197` del dataset `fireviewer/fireviewer_fire_smoke_flame_v3_native`, con 78.450 imagenes de entrenamiento, 11.266 de validacion y 13.523 de test.

La relevancia actual del modelo radica en su caracter abierto (licencia AGPL-3.0) y en la documentacion detallada de su run de entrenamiento, lo que permite reproducir el pipeline. No obstante, sus propios autores advierten que las metricas de validacion no cualifican el modelo como sistema autonomo de alarma de emergencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m (CNN detector, familia Ultralytics YOLO11) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos `.pt` en precision AMP; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no aplica (modelo de vision; etiquetas en ingles: fire, smoke) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (Ultralytics) |

## Arquitectura y entrenamiento

El modelo es un detector YOLO11 en su variante mediana (`yolo11m`), inicializado desde pesos preentrenados en COCO (`yolo11m.pt`) y reentrenado sobre el dataset de incendios. La entrada es RGB con letterboxing de Ultralytics a 928 px. El entrenamiento se ejecuto en una NVIDIA A100-SXM4-80GB con batch fisico 55 y batch nominal 64, optimizador AdamW con LR inicial 0.0005, decaimiento coseno, 5 epocas de warmup, weight decay 0.0005 y precision mixta (AMP). Se desactivaron Mosaic, MixUp y Copy-Paste, y se fijo un scale de 0.3. El run se detuvo manualmente tras 42 epocas completas (paciencia configurada de 7).

El dataset de entrenamiento contiene 78.450 imagenes, con 11.266 de validacion (10.925 cajas de referencia) y 13.523 de test. La validacion reportada se realizo sobre la revision `8c8b197` del dataset. El checkpoint retenido es la fuente historica de la conversion publicada como Cadryl y difiere del checkpoint mejorado posterior entrenado en A100; el autor indica que no es un duplicado exacto.

## Capacidades

- Deteccion de objetos en imagenes RGB con dos clases: `fire` (fuego) y `smoke` (humo).
- Salida de cajas delimitadoras en formato `[x1, y1, x2, y2]` en pixeles de la imagen original, con puntuacion de confianza por caja.
- Inferencia a resolucion de 928 px con letterboxing de Ultralytics.
- Integracion directa con la libreria `ultralytics` (carga via `YOLO(weights)` y `model.predict`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo de vision.
- No dispone de capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision multimodal, audio ni otras capacidades generativas.

## Casos de uso

- Vigilancia forestal con camaras fijas: el modelo puede procesar fotogramas RGB a 928 px y emitir cajas de fuego y humo que alimenten un panel de alerta; su licencia AGPL-3.0 permite desplegarlo en infraestructura propia siempre que se respeten las obligaciones de copyleft.
- Monitorizacion industrial de plantas y almacenes: integrado en un pipeline de vision por lotes, permite revisar imagenes periodicas de camaras para detectar conatos de incendio o columnas de humo en zonas de riesgo.
- Triaje de imagenes satelitales o de dron: el modelo puede prefiltrar capturas aereas y marcar regiones candidatas de humo para revision humana, reduciendo el volumen de imagenes a inspeccionar.
- Prototipado de sistemas de alerta temprana: gracias a la documentacion del run (dataset, hiperparametros, revisiones) se puede reproducir el entrenamiento y ajustar el umbral `conf` al dominio objetivo antes de pasar a produccion.
- Investigacion en deteccion de incendios: el checkpoint sirve como linea base reproducible para comparar arquitecturas o estrategias de aumento de datos, dado que el autor publica las revisiones exactas del dataset y los pesos.
- Integracion en aplicaciones de respuesta a emergencias: puede incorporarse como componente de percepcion en herramientas de apoyo a bomberos o proteccion civil, siempre con validacion humana y sin sustituir la decision operativa.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), sobre el split de validacion del dataset `fireviewer/fireviewer_fire_smoke_flame_v3_native` (revision `8c8b197`), epoca 42:

| Metrica | Valor |
|---|---|
| mAP@0.50:0.95 (%) | 38,63 |
| mAP@0.50 (%) | 65,07 |

Desglose por clase reportado en la model card:

| Clase | Precision | Recall | F1 | AP50 | AP75 | AP50-95 | Cajas de referencia |
|---|---:|---:|---:|---:|---:|---:|---:|
| Global | 67,51% | 61,98% | 64,63% | 65,07% | 38,89% | 38,63% | 10.925 |
| fire | 65,26% | 59,98% | 62,51% | 62,56% | 37,53% | 36,83% | 5.727 |
| smoke | 69,77% | 63,98% | 66,75% | 67,58% | 40,26% | 40,44% | 5.198 |

No se han publicado en la informacion disponible resultados comparativos frente a otros detectores de incendios ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada; al ser un YOLO11m en `.pt` con AMP, el consumo es moderado y cabe holgadamente en GPUs de consumo, aunque no se documenta la cifra exacta.
- GPU de entrenamiento documentada: NVIDIA A100-SXM4-80GB (batch fisico 55, AMP).
- GPU recomendadas para inferencia: cualquier GPU consumer reciente (RTX 3060/4060 o superiores) deberia poder ejecutar el modelo; no se aportan mediciones concretas.
- Opciones de despliegue: la model card solo documenta el flujo con `ultralytics` + `huggingface_hub` (descarga de `best.pt` y `model.predict`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks de modelos alternativos de deteccion de fuego y humo, ni de comparaciones directas con otras variantes de YOLO11 (n, s, l, x) o con detectores de la competencia. Por tanto, la comparativa cuantitativa se indica como no disponible.

| Modelo | Parametros | Contexto | mAP@0.50:0.95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fireviewer/yolo11m-fire-smoke | no disponible | no aplica | 38,63% | AGPL-3.0 | Hugging Face |
| Alternativas de deteccion de incendios | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor advierte que el humo tenue o lejano, los fuegos pequenos, los reflejos, el vapor, la oclusion y los cambios de dominio de camara pueden producir omisiones y falsos positivos.
- El modelo no establece la causa, el origen geografico ni la peligrosidad real del incendio.
- Las puntuaciones de validacion no cualifican el modelo como sistema autonomo de alarma de emergencia; requiere validacion humana y calibracion del umbral de confianza.
- El checkpoint publicado es una fuente historica de conversion, no el detector YOLO11M recomendado actualmente por el autor; su rendimiento puede ser inferior al del checkpoint mejorado posterior.
- La licencia AGPL-3.0 impone obligaciones de copyleft: el uso comercial que distribuya el modelo o derive obras puede requerir la publicacion del codigo fuente bajo la misma licencia. Conviene revisar el cumplimiento antes de integrarlo en productos propietarios.
- Las condiciones de las imagenes de origen del dataset son independientes de la licencia del modelo y permanecen ligadas al dataset; deben conservarse conjuntamente modelo, etiquetas, preprocesado y revisiones del dataset.
- No se documentan sesgos especificos mas alla de los derivados de la composicion del dataset y de las condiciones de captura.
- No hay informacion sobre rendimiento en idiomas o dominios distintos del de entrenamiento, ni sobre robustez frente a condiciones meteorologicas adversas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fireviewer/yolo11m-fire-smoke
- Dataset de entrenamiento: https://huggingface.co/datasets/fireviewer/fireviewer_fire_smoke_flame_v3_native
- Guia de coordenadas y dibujo del dataset: https://huggingface.co/datasets/fireviewer/fireviewer_fire_smoke_flame_v3_native#classes-and-box-coordinates
- Perfil del autor: https://huggingface.co/fireviewer
- Catalogo de recursos: https://huggingface.co/spaces/fireviewer/README/blob/main/docs/RESOURCE_INDEX.md
