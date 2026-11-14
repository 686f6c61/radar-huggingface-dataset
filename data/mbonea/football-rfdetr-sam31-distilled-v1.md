# Mbonea/football-rfdetr-sam31-distilled-v1

## Resumen

football-rfdetr-sam31-distilled-v1 es un detector de objetos especializado en fútbol, desarrollado por el usuario Mbonea y publicado en Hugging Face. Se trata de un fine-tuning del modelo RF-DETR Small a resolución de 640 píxeles, entrenado para detectar cuatro clases concretas en retransmisiones de partidos: jugador, árbitro, portero y balón. El modelo parte de pesos preentrenados en COCO y se ajusta sobre un conjunto de datos derivado de un único partido, usando máscaras de SAM3.1 convertidas en pseudo-etiquetas y cajas de un detector YOLO26x (Tactix) como criba y complemento.

El interés principal del modelo no reside en su rendimiento absoluto, sino en el pipeline de destilación de etiquetas: máscaras de segmentación de un modelo profesor (SAM3.1) se convierten en cajas mediante limpieza de componentes, filtros geométricos, temporales y de persistencia, eliminación de duplicados y cuarentena de fotogramas, complementadas con detección independiente y cribado visual asistido por IA. Es un experimento piloto de investigación, no un modelo validado para producción: el propio autor advierte que la detección del balón es deficiente y que no existe evaluación en partidos no vistos.

El modelo es relevante para quienes investigan analítica deportiva automática, destilación de modelos de segmentación a detectores ligeros y generación de pseudo-etiquetas a partir de vídeo, pero debe tratarse como una prueba de concepto reproducible más que como una herramienta lista para despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RF-DETR Small (transformer de detección con backbone DINOv2, familia RF-DETR) |
| Parámetros totales | no disponible (variante Small de RF-DETR; el autor no publica el recuento) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de detección por imagen, resolución de entrada 640 px) |
| Tipos de cuantización | no disponible (checkpoint nativo PyTorch; no se publican variantes GGUF/ONNX cuantizadas) |
| Idiomas soportados | en (etiquetas y documentación en inglés; la tarea es visión, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch nativo (`best_weights.pth`) |

## Arquitectura y entrenamiento

RF-DETR es un detector basado en transformer (DETR con backbone DINOv2) que predice conjuntos de cajas directamente, sin anclas ni supresión no máxima clásica. Esta variante concreta es el modelo Small a 640 px, ajustado desde pesos COCO con AdamW (learning rate 1e-4 en la cabeza, 1e-5 en el encoder), batch efectivo de 16 (4 × acumulación 4), warmup de 2 épocas, EMA, semilla 61, máximo de 40 épocas y parada temprana con paciencia 8 y min_delta 0.001. Se selecciona el mejor checkpoint EMA por validación. La aumentación incluye flip horizontal (p=0.5), variaciones de brillo y contraste (límite 0.15, p=0.4), desenfoque gaussiano (kernel 3, p=0.1), escala de grises (p=0.1) y variantes de tono del torso enmascarado generadas solo para entrenamiento.

Los datos provienen de un único partido en 720p (Simba-Yanga, identificador yjKCusTGzVg), con fotogramas de entrenamiento de los tiros 17, 35, 40 y 60, validación en el 36 y test en el 9. Se usaron 119 fotogramas originales más dos variantes de tono del torso cada uno: 357 imágenes de entrenamiento, 21 de validación y 28 de test. Las etiquetas se generaron convirtiendo máscaras de SAM3.1 tras limpieza de componentes mayores, filtros de geometría, persistencia y temporales, eliminación de duplicados y cuarentena de fotogramas; cajas de YOLO26x (Tactix) cribaron y complementaron las etiquetas, reteniendo cajas plausibles de jugador y árbitro que YOLO no detectaba. Un cribado visual con IA de hojas de contactos y 116 recortes de portero/balón eliminó etiquetas espurias de logotipos, repeticiones y deriva. Las etiquetas de balón en entrenamiento usan acuerdo espacial, y diez etiquetas de balón en test usan máscaras limpias de SAM3.1 sobre el terreno. El dataset y el código están congelados en el repositorio privado Mbonea/football-sam31-distillation-v1, accesible solo al propietario, con manifiesto/SHA y configuración de entrenamiento incluidos.

## Capacidades

- Detección de objetos en imágenes individuales de fútbol con cuatro clases: jugador (0), árbitro (1), portero (2) y balón (3).
- Inferencia por fotograma a 640 px mediante la librería `rfdetr` (`RFDETRSmall`), con umbral de confianza configurable (el ejemplo usa 0.4).
- Salida de cajas de detección con puntuaciones; no produce identificadores de seguimiento entre fotogramas.
- No incorpora reconocimiento de identidad de equipo: el autor indica explícitamente que la identidad de equipo es una etapa separada de apariencia y tracking.
- No es un modelo de lenguaje ni multimodal texto-imagen: no hay tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo de razonamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Prototipado de analítica de retransmisiones deportivas: extraer cajas de jugadores y árbitros de fotogramas de un partido para alimentar una etapa posterior de seguimiento y asignación de equipos. Adecuado por su bajo coste computacional y su API simple, siempre con la advertencia de que no se ha validado en partidos distintos.
- Investigación sobre destilación de segmentación a detección: usar el pipeline documentado (máscaras SAM3.1 → cajas filtradas → cribado con YOLO26x) como referencia reproducible para generar pseudo-etiquetas en nuevos vídeos deportivos.
- Generación de conjuntos de datos anotados para fútbol: emplear el modelo como pre-etiquetador sobre fotogramas nuevos y revisar manualmente las cajas antes de incorporarlas a un dataset de entrenamiento, dado que las etiquetas originales son ruidosas.
- Detección de árbitros y porteros en clips cortos: las clases referee (AP50:95 0.7298) y goalkeeper (0.5684) son las más fiables tras player (0.7333), útiles para tareas de segmentación de roles en planos cercanos.
- Benchmark de preprocesamiento entre frameworks: comparar el evaluador nativo de RF-DETR (redimensionado cuadrado) con el preprocesamiento de Ultralytics para estudiar cómo afecta a las métricas de detección en fútbol.
- Docencia y demostración de detectores DETR: ejemplo mínimo de fine-tuning de RF-DETR Small con `rfdetr[train,augment]==1.12.1` y un entorno fijado (torch 2.8.0, NumPy 1.26.4, pyarrow 20.0.0), útil para reproducir el flujo completo de datos, entrenamiento y evaluación.
- Detección de balón solo como referencia negativa: el autor recomienda usar un detector de balón separado o SAM3.1 como referencia hasta que la calidad del balón mejore con datos revisados; no es un caso de uso válido para producción.

## Benchmarks y rendimiento

Evaluación sobre 28 imágenes y 474 anotaciones de test, con AP50:95 por clase (acuerdo con pseudo-etiquetas, no precisión independiente):

| Clase | AP50:95 |
|---|---|
| Player | 0.7333 |
| Referee | 0.7298 |
| Goalkeeper | 0.5684 |
| Ball | 0.0550 |
| Global | 0.5216 |
| Global AP50 | 0.6914 |

Rendimiento en NVIDIA A10: 56.24 FPS en predicción de fotograma único (incluye preprocesamiento y postprocesamiento del modelo, excluye decodificación de imagen y renderizado de vídeo), medido sobre 25 imágenes temporizadas tras 3 calentamientos. Memoria pico asignada por PyTorch: 4.99 GB en el conjunto de entrenamiento y evaluación (no es VRAM total reservada del proceso). Tiempo total de entrenamiento, carga, evaluación y previsualización: 399.18 s. Estas cifras no corresponden a FPS de seguimiento de vídeo completo ni incluyen asignación de equipos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; la memoria pico asignada por PyTorch en entrenamiento y evaluación es de 4.99 GB, por lo que la inferencia en fp32 debería caber holgadamente en GPUs de 8 GB o más.
- GPU recomendadas: NVIDIA A10 (medida por el autor, 56.24 FPS); GPUs de gama alta como A100 o H100 no han sido medidas en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, dado el tamaño Small y la resolución de 640 px; no hay mediciones publicadas en estas tarjetas.
- Opciones de despliegue: librería `rfdetr` (PyTorch), con `RFDETRSmall(resolution=640, pretrain_weights=...)` y `model.predict(...)`; no se publican exportaciones a ONNX, TensorRT, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector).
- Latencia y throughput: 56.24 FPS en A10 para fotograma único; latencia aproximada de 17.8 ms por fotograma en esa GPU, sin decodificación de vídeo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| football-rfdetr-sam31-distilled-v1 | Detector RF-DETR Small fine-tuned | no disponible | 640 px por imagen | AP50:95 global 0.5216; balón 0.0550 | apache-2.0 | Hugging Face (repo 0.1 GB) |
| RF-DETR Small (base COCO) | Detector RF-DETR Small | no disponible | 640 px por imagen | COCO; no comparable directamente con fútbol | apache-2.0 | Público (Roboflow) |
| SAM3.1 | Segmentación promptable | no disponible | imagen/vídeo | Profesor de las máscaras; el autor no afirma que este modelo lo supere | no disponible | Público |
| Tactix YOLO26x | Detector YOLO | no disponible | no disponible | Usado como criba de etiquetas; sin métricas publicadas en esta ficha | no disponible | no disponible |

No se dispone de resultados de benchmarks comparables entre estos modelos en la información proporcionada; el propio autor advierte que la comparación cruzada con Ultralytics incluye diferencias de preprocesamiento.

## Limitaciones y advertencias

- Piloto de un único partido: mismo estadio y mismo encuentro en train, validación y test; las repeticiones pueden compartir la misma acción. No hay evaluación en partidos no vistos.
- Etiquetas pseudo-anotadas ruidosas e incompletas: pueden faltar objetos o confundir roles; no existe verdad de referencia humana exhaustiva.
- Desequilibrio de clases: las etiquetas de portero en entrenamiento son escasas y la validación no tiene etiquetas confirmadas de portero.
- Detección de balón muy débil (AP50:95 0.0550, solo 10 balones en test); el autor recomienda un detector de balón separado o SAM3.1 como referencia.
- Las métricas miden acuerdo con pseudo-etiquetas, no precisión independiente; no deben presentarse como exactitud real.
- El recoloreado de tono del torso no demuestra generalización a otros partidos, equipaciones o condiciones de iluminación.
- No aprende identificadores de seguimiento; requiere una etapa separada de tracking y asignación de equipos.
- El evaluador nativo de RF-DETR usa redimensionado cuadrado, distinto del preprocesamiento de Ultralytics, por lo que las comparaciones entre frameworks incluyen diferencias de preprocesamiento.
- Licencia apache-2.0 para código y pesos base de RF-DETR, pero la model card no concede derechos nuevos sobre las imágenes de retransmisión de origen ni sobre los modelos profesor; el dataset permanece privado.
- Riesgo de uso indebido: cargar el checkpoint `.pth` requiere confiar en su origen, ya que los checkpoints PyTorch pueden ejecutar código al cargarse.
- Preparado por GPT6.1 Sol para el propietario de la cuenta el 2026-11-14; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mbonea/football-rfdetr-sam31-distilled-v1
- Dataset privado (solo propietario): https://huggingface.co/datasets/Mbonea/football-sam31-distillation-v1
- Vídeo de origen citado en la model card: identificador yjKCusTGzVg (Simba-Yanga, 720p); no se proporciona URL completa.
- Librería rfdetr: no se proporciona URL en la información disponible.
- SAM3.1: no se proporciona URL en la información disponible.
- Tactix YOLO26x: no se proporciona URL en la información disponible.
