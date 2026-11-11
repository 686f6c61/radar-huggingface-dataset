# iaac-maai/day4-team1-building-defect-detector

## Resumen

El modelo `iaac-maai/day4-team1-building-defect-detector` es un detector de objetos basado en YOLO26n, desarrollado por el equipo 1 del curso AI Methods I del IAAC MaAI (2026/27). Su función es localizar defectos en fotografías y vídeos de paredes y techos: grietas, grietas escalonadas en fábrica de ladrillo, moho, pintura descascarillada y filtraciones de agua. Se trata de un modelo de 2,5 millones de parámetros, preentrenado por Ultralytics sobre COCO y ajustado posteriormente sobre 2.060 imágenes etiquetadas de defectos.

El modelo resuelve un problema de triaje: ordenar grandes volúmenes de fotografías de inspección y vídeos de recorrido para que un inspector de edificios o un gestor de instalaciones revise primero las imágenes con defectos probables. Está pensado como herramienta de precribado, no como sustituto de una evaluación estructural ni de un dictamen profesional.

Su relevancia es doble: por un lado, demuestra que un detector nano (5,4 GFLOPs, 5,5 MB de pesos) puede alcanzar un recall de grietas del 0,92 en un dominio especializado; por otro, expone con claridad las limitaciones del enfoque en defectos de superficie, donde las métricas caen de forma notable. La licencia AGPL-3.0 y la disponibilidad de pesos en formato `.pt` de Ultralytics condicionan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO26n (detector de objetos de una etapa) |
| Parametros totales | 2,5 millones (2,4 M tras fusión de capas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen redimensionada a 640 × 640 px) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de clase están en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`) para la librería Ultralytics |
| Cómputo | 5,4 GFLOPs |
| Tarea | Detección de objetos (cajas, clases y confianzas) |
| Entrada | Imagen RGB de cualquier tamaño, redimensionada internamente a 640 × 640 |
| Salida | Por defecto: caja (x1, y1, x2, y2 en píxeles), clase y confianza entre 0 y 1 |
| Clases | `crack`, `mold`, `peeling_paint`, `stairstep_crack`, `water_seepage` |
| Modelo base | `yolo26n.pt` preentrenado en COCO |
| Versiones | ultralytics 8.4.190, torch 2.14.1, Python 3.12 |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un detector YOLO26n de Ultralytics, es decir, una red convolucional de una etapa que predice cajas delimitadoras, clases y confianzas en una sola pasada. El modelo parte de los pesos `yolo26n.pt` preentrenados sobre COCO (80 clases cotidianas, ninguna de ellas un defecto constructivo) y se ajusta sobre un conjunto específico de defectos. La entrada se normaliza a 640 × 640 píxeles y la salida es una lista de detecciones con caja, clase y confianza.

El ajuste se realizó sobre 2.060 imágenes etiquetadas procedentes del dataset *detr_crack_dataset*, publicado originalmente en Roboflow Universe y replicado en Hugging Face como `senthilsk/crack_detection_dataset` (revisión `03ae44b`). El conjunto de test empleado en la evaluación consta de 446 imágenes. No se documenta en la información disponible el número de tokens ni la composición detallada del dataset, ni si hubo etapas de RLHF o DPO (no aplicables a un detector de objetos). El repositorio incluye `results.csv` con el registro de entrenamiento por época y `experiments.csv` con las tres ejecuciones comparadas en validación, lo que permite reproducir el proceso. En el pipeline completo, el detector se combina con un filtro de líneas de grieta y con MobileSAM para convertir las cajas en máscaras de segmentación, según se describe en la model card.

## Capacidades

- Detección de objetos en imágenes RGB con caja, clase y confianza por instancia.
- Cinco clases de defecto: `crack` (grieta en yeso, pintura, revoco o hormigón), `stairstep_crack` (grieta escalonada en fábrica que sigue las juntas de mortero), `mold` (moho oscuro en paredes, techos o marcos), `peeling_paint` (pintura o yeso levantado o desprendido) y `water_seepage` (manchas o marcas de agua).
- Procesamiento de vídeo: el repositorio incluye tres vídeos anotados (`video_*.mp4`) que demuestran el funcionamiento sobre recorridos de inspección.
- Integración con segmentación: combinación con un filtro de líneas de grieta y con MobileSAM para obtener máscaras a partir de las cajas.
- Inferencia rápida: aproximadamente 2 ms por imagen en una GPU RTX 5080 de portátil y unos 30 ms por imagen en una CPU de portátil de gama alta reciente (AMD Ryzen AI 9 HX 375).
- Ejecución sin GPU: el tamaño nano permite su uso en CPU, aunque con mayor latencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un detector visual puro.

## Casos de uso

- **Precribado de inspecciones de fachada:** procesar un lote de fotografías de paredes y techos para ordenar las imágenes por probabilidad de defecto, de modo que el inspector revise primero las que contienen grietas o moho. El recall de grietas del 0,92 lo hace adecuado para esta tarea de triaje.
- **Análisis de vídeos de recorrido:** aplicar el modelo fotograma a fotograma sobre un vídeo de inspección para localizar tramos con defectos y generar un índice temporal de incidencias. Los tres vídeos anotados del repositorio demuestran este flujo.
- **Generación de máscaras de grieta:** combinar las cajas del detector con MobileSAM y el filtro de líneas para obtener máscaras de segmentación utilizables en medición o documentación gráfica.
- **Mantenimiento de instalaciones:** un gestor de edificios puede pasar el modelo sobre el archivo fotográfico de mantenimiento para detectar filtraciones de agua o pintura descascarillada antes de una revisión presencial.
- **Docencia y prototipado:** al ser un modelo nano con pesos de 5,5 MB y licencia AGPL-3.0, sirve como base para ejercicios de visión por computador y para prototipos rápidos de inspección asistida.
- **Investigación en detección de defectos:** el repositorio incluye el registro de entrenamiento y las comparaciones de ejecuciones, lo que facilita reproducir y extender el experimento con nuevos datos o clases.
- **Despliegue en dispositivos sin GPU:** la latencia de unos 30 ms por imagen en CPU permite integrar el modelo en portátiles de campo para revisiones preliminares in situ.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de 446 imágenes, con umbral de confianza 0,15:

| Modelo | Recall de grieta | Precisión de grieta | Recall (todas las clases) | mAP50 |
|---|---|---|---|---|
| Baseline: YOLO26s preentrenado en COCO, sin ajuste | 0,00 | 0,00 | 0,00 | 0,00 |
| Baseline: detector de grietas basado en reglas (OpenCV black-hat + Otsu) | 0,45 | 0,41 | 0,34 | – |
| **Este modelo** | **0,92** | **0,71** | **0,81** | **0,46** |

Precisión media por clase (AP50) en el conjunto de test:

| Clase | AP50 |
|---|---|
| `crack` | 0,93 |
| `stairstep_crack` | 0,77 |
| `mold` | 0,29 |
| `water_seepage` | 0,28 |
| `peeling_paint` | 0,05 |

Los defectos lineales son fiables; los defectos de superficie no lo son. La model card señala además que el moho y la pintura descascarillada se detectan pero se fragmentan en más cajas que las etiquetas, y que en una de las salas de prueba se pierden las 10 cajas de filtración de agua y solo se encuentra una mancha de moho.

## Requisitos de hardware

- **VRAM estimada:** no disponible de forma explícita. Con 2,5 millones de parámetros y pesos de 5,5 MB, la huella de memoria es muy reducida y cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas:** una RTX 5080 de portátil ejecuta la inferencia en unos 2 ms por imagen. Cualquier GPU consumer reciente (RTX 3060 o superior) es más que suficiente.
- **CPU:** unos 30 ms por imagen en un AMD Ryzen AI 9 HX 375; CPUs más antiguas o ligeras serán más lentas pero el modelo nano sigue siendo usable sin GPU.
- **Opciones de despliegue:** la librería Ultralytics (formato `.pt`) es la vía documentada. No se documentan exportaciones a ONNX, TensorRT, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un detector de este tipo.
- **Latencia y throughput:** aproximadamente 2 ms/imagen en GPU y 30 ms/imagen en CPU de gama alta reciente, según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Este modelo** (YOLO26n ajustado) | 2,5 M | Detección de 5 defectos | Imagen 640 × 640 | mAP50 0,46; recall de grieta 0,92 | AGPL-3.0 | Hugging Face, `.pt` |
| YOLO26s preentrenado en COCO | no disponible | Detección de 80 clases COCO | Imagen 640 × 640 | 0,00 en defectos (sin ajuste) | AGPL-3.0 (Ultralytics) | Ultralytics |
| Detector de grietas basado en reglas (OpenCV black-hat + Otsu) | no aplica | Detección de grietas | Imagen | Recall 0,45; precisión 0,41 | no disponible | Código propio |
| MobileSAM | no disponible | Segmentación | Imagen | no disponible | no disponible | Repositorio público |

La comparación con otros detectores ajustados a defectos constructivos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **No es una evaluación estructural:** el modelo no dice nada sobre anchura, profundidad, causa ni peligrosidad de una grieta. No debe usarse para dictámenes de seguridad estructural.
- **Decisiones sobre inmuebles:** cualquier decisión legal, de seguro, venta o alquiler requiere que una persona cualificada revise cada resultado. "Sin detección" significa "no encontrado", nunca "sin defecto".
- **Defectos de superficie poco fiables:** el recuento y la medición de moho, manchas y pintura descascarillada no son fiables (AP50 de 0,29, 0,28 y 0,05 respectivamente).
- **Riesgo de falsos negativos:** en la propia evaluación se pierden las 10 cajas de filtración de agua de una sala, lo que ilustra el riesgo de omisiones en clases de baja precisión.
- **Dominio restringido:** imágenes muy distintas al entrenamiento (drones, satélite, térmicas, nocturnas, fachadas lejanas, madera, metal o cristal) quedan fuera de alcance.
- **Sesgos del dataset:** el conjunto proviene de Roboflow y no se documenta su composición demográfica, geográfica ni de materiales, por lo que pueden existir sesgos no caracterizados.
- **Licencia AGPL-3.0:** impone obligaciones de copyleft sobre el código que use el modelo en servicios en red; conviene revisar su compatibilidad antes de un uso comercial.
- **Idioma:** las etiquetas de clase están en inglés y el modelo no procesa texto; no hay soporte multilingüe.
- **Monitorización de personas:** uso explícitamente fuera de alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/day4-team1-building-defect-detector
- Repositorio GitHub del pipeline completo: https://github.com/iaac-maai/group1_day4_assignment
- Dataset en Hugging Face: https://huggingface.co/datasets/senthilsk/crack_detection_dataset
- Dataset original en Roboflow Universe: https://universe.roboflow.com/objectdetection-qxiqx/detr_cra (enlace truncado en la información disponible)
- Ultralytics (librería y pesos base): no disponible en la información proporcionada
- MobileSAM: no disponible en la información proporcionada
