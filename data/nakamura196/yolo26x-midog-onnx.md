# nakamura196/yolo26x-midog-onnx

## Resumen

YOLO26x-midog-onnx es la exportación a ONNX de un detector Ultralytics YOLO26x entrenado específicamente para localizar figuras mitóticas en imágenes de histopatología teñidas con hematoxilina-eosina (H&E). El modelo lo publica Satoru Nakamura (Universidad de Tokio) y está pensado para ejecutarse íntegramente dentro del navegador mediante onnxruntime-web, con aceleración por WebGPU o, en su defecto, WebAssembly. No es un modelo de lenguaje: es un detector de objetos de una etapa, con dos clases (`mitotic_figure` e `imposter`) y salida NMS-free.

El interés de la ficha está en su nicho: la detección de mitosis es una tarea central en la graduación histológica de tumores (el índice mitótico alimenta escalas como el grado Nottingham en cáncer de mama), y MIDOG++ es uno de los pocos conjuntos de referencia multidominio disponibles con licencia CC0. El modelo se distribuye en dos variantes (float32 de 223 MB y float16 de 112 MB) más un JSON con metadatos, y se acompaña de una demo web funcional. El repositorio tenía 0 descargas y 0 "likes" en el momento de la consulta, con fecha de creación del 16 de octubre de 2026, por lo que se trata de una publicación muy reciente y sin adopción registrada.

La relevancia práctica es doble: por un lado ofrece un punto de comparación reproducible frente a YOLOv8x y YOLO11x sobre el mismo split oficial de MIDOG++, y por otro demuestra un patrón de despliegue poco habitual en patología computacional, el de inferencia local en el navegador sin subir imágenes de pacientes a un servidor. El autor lo etiqueta explícitamente como prototipo de investigación y advierte de que no es un dispositivo médico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de una etapa de la familia Ultralytics YOLO26x, exportado a ONNX; salida NMS-free (top-300 cajas) |
| Parametros totales | no disponible (estimación no confirmada de ~55 M, derivada del tamaño del fichero float32 de 223 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen fija) |
| Tipos de cuantizacion | float32 (fichero principal) y float16 (fichero alternativo); no se publican variantes INT8, GGUF ni Q4/Q8 |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`.onnx`), float32 y float16; metadatos en JSON |
| Entrada | `images`, float32, `[1, 3, 640, 640]`, RGB, normalizada a 0–1 |
| Salida | `[1, 300, 6]` con `x1, y1, x2, y2, score, class` |
| Clases | `0 = mitotic_figure`, `1 = imposter` (falso positivo morfológico) |
| Umbral de decisión | 0.39 (óptimo de F1 en el split de validación) |
| Tamaño del repositorio | 0.3 GB |
| Pipeline declarado | object-detection |

## Arquitectura y entrenamiento

La model card identifica el modelo como una exportación ONNX de un Ultralytics YOLO26x, es decir, un detector convolucional de una etapa de la familia YOLO. La característica arquitectónica que sí documenta el autor es la cabeza de salida: el modelo devuelve directamente 300 cajas con formato `x1, y1, x2, y2, score, class` y no requiere supresión de no máximos (NMS) en postproceso, de modo que basta con filtrar por umbral de confianza. La exportación mantiene la coherencia con el modelo original en PyTorch: sobre una tesela de prueba, la salida ONNX reproduce 55 cajas con una diferencia máxima de confianza de 0.0000 en float32 y 0.0031 en float16. En la variante float16, el decodificado de cajas y la selección top-300 posteriores a la última convolución se mantienen en float32, porque de lo contrario el grafo no carga.

El entrenamiento usó el conjunto MIDOG++ (Aubreville et al., *Scientific Data* 10, 484, 2023), compuesto por 503 portaobjetos de 7 tipos tumorales, con muestras humanas y caninas y licencia CC0. Se respetó el split oficial de train/test y se reservó un 15% de los portaobjetos de entrenamiento de cada tipo tumoral como validación (semilla 0). El pipeline fue Ultralytics 8.4.170 con `imgsz` 640, hasta 100 épocas con paciencia 50; el entrenamiento se detuvo en la época 90 y el mejor punto de control fue el de la época 40, sobre una GPU A100 de 40 GB. No se documentan fases de ajuste por refuerzo, DPO ni destilación: es un entrenamiento supervisado de detección con las etiquetas de cajas del propio conjunto.

## Capacidades

- Detección de figuras mitóticas en imágenes H&E de 640x640 píxeles, con devolución de coordenadas de caja y puntuación de confianza por instancia.
- Discriminación explícita entre mitosis reales y "imposters", esto es, estructuras no mitóticas de apariencia similar (clase 1 del modelo), lo que reduce falsos positivos frente a un detector de una sola clase.
- Salida NMS-free limitada a 300 cajas por imagen, lo que simplifica el postproceso y abarata la integración en canalizaciones ligeras.
- Inferencia en navegador con onnxruntime-web, con dos rutas de ejecución: WebGPU (recomendada con `shader-f16` para la variante float16) y WebAssembly como respaldo sin GPU.
- Ejecución local sobre el dispositivo del usuario, sin necesidad de enviar las imágenes a un servidor externo.
- Generalización multidominio dentro de los datos de MIDOG++: 7 tipos tumorales y muestras de origen humano y canino.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, capacidades de agente, modo "thinking", audio ni procesamiento multilingüe. Es un detector de objetos de dominio muy restringido.

## Casos de uso

- Cálculo asistido del índice mitótico en investigación oncológica: el modelo localiza y cuenta figuras mitóticas por campo o por región de interés, y ese recuento alimenta directamente escalas de graduación histológica en estudios retrospectivos.
- Prefiltrado de portaobjetos completos (WSI): al procesar teselas de 640 px, el detector permite priorizar las regiones con mayor densidad de mitosis para que un patólogo las revise primero, reduciendo el tiempo de lectura sin sustituir su criterio.
- Control de calidad de anotaciones: al comparar las detecciones con las etiquetas de un conjunto ya anotado se pueden identificar mitosis omitidas o marcas dudosas, y la clase `imposter` ayuda a auditar falsos positivos sistemáticos.
- Preetiquetado para reentrenamiento: las cajas generadas con umbral bajo pueden servir como propuestas iniciales para anotadores humanos, acelerando la construcción de nuevos conjuntos en dominios no cubiertos por MIDOG++.
- Investigación veterinaria comparada: al haberse entrenado también con muestras caninas, es utilizable en estudios de tumores en perro dentro de los tipos tumorales cubiertos por MIDOG++, un nicho con pocas herramientas específicas.
- Herramienta docente en patología digital: la demo en navegador permite mostrar en clase cómo se ve una mitosis frente a un "imposter" sobre imágenes reales, sin instalar software ni depender de infraestructura de GPU.
- Evaluación comparativa de detectores: sirve como referencia reproducible frente a YOLOv8x y YOLO11x sobre el split oficial de MIDOG++, útil para trabajos metodológicos sobre exportación a ONNX o cuantización.
- Validación de despliegues en el borde: al caber en 112–223 MB, el modelo permite probar arquitecturas de inferencia local (navegador, portátil, equipo de laboratorio sin GPU dedicada) antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

Evaluación sobre el split de test oficial de MIDOG++ (111 portaobjetos, 10.668 teselas de 640 px). Los valores de YOLOv8x y YOLO11x provienen de la propia model card, con los mismos datos y ajustes.

| Métrica (figura mitótica) | YOLO26x (este modelo) | YOLOv8x | YOLO11x |
|---|---|---|---|
| mAP50 (caja) | 0.867 | 0.862 | 0.877 |
| F1 (detección a ≤ 7,5 µm del centro de referencia, protocolo MIDOG) | 0.803 (P 0.783 / R 0.825) | 0.808 | 0.803 |

No se publican en la información disponible resultados de latencia, throughput, consumo de memoria en inferencia ni métricas adicionales (mAP50-95, precisión por tipo tumoral, análisis por dominio).

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 223 MB en float32 y 112 MB en float16; con buffers de activaciones y la salida top-300, el consumo total es del orden de pocos cientos de megabytes, muy por debajo de 1 GB en la mayoría de configuraciones. No se han publicado mediciones exactas de memoria en ejecución.
- GPU recomendadas: cualquier GPU con soporte WebGPU para la ruta de navegador; en servidor, una A100 40 GB fue suficiente para el entrenamiento completo, y para inferencia sirve cualquier GPU moderna (por ejemplo, series RTX 30/40, T4, L4, A10).
- Cabe sin problema en GPU de consumo: el tamaño de los pesos permite ejecutarlo en tarjetas con 4 GB o menos de VRAM, e incluso en iGPU recientes vía WebGPU.
- Ejecución en CPU: viable mediante onnxruntime-web con backend WASM o mediante onnxruntime nativo en CPU, dado el reducido tamaño del modelo y la entrada fija de 640x640.
- Opciones de despliegue: onnxruntime-web (WebGPU o WASM), onnxruntime nativo (Python, C++, C#) y cualquier runtime compatible con ONNX. No se documentan exportaciones a TensorRT, OpenVINO, CoreML ni formatos de llama.cpp/Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card solo referencia una demo funcional en navegador; no se aportan tiempos por tesela ni imágenes por segundo.
- Requisito específico: la variante float16 depende de la extensión `shader-f16` de WebGPU; si no está disponible, debe usarse el fichero float32 o el backend WASM.

## Comparativa con modelos similares

| Modelo | mAP50 | F1 (protocolo MIDOG) | Licencia | Disponibilidad |
|---|---|---|---|---|
| YOLO26x MIDOG++ ONNX (este modelo) | 0.867 | 0.803 (P 0.783 / R 0.825) | AGPL-3.0 | ONNX float32 y float16 en HuggingFace, demo web |
| YOLOv8x (mismos datos y ajustes) | 0.862 | 0.808 | no disponible en la información | no disponible en la información |
| YOLO11x (mismos datos y ajustes) | 0.877 | 0.803 | no disponible en la información | no disponible en la información |

Las tres variantes son indistinguibles en la práctica sobre este conjunto: las diferencias de mAP50 (0.862–0.877) y F1 (0.803–0.808) caen dentro del margen habitual de variación entre ejecuciones. El factor diferencial del modelo publicado no es la precisión, sino el empaquetado: exportación ONNX verificada, variante float16 funcional en WebGPU y salida NMS-free. No se dispone de datos comparativos frente a otros detectores específicos de mitosis (por ejemplo, los participantes del desafío MIDOG) porque la información proporcionada no los incluye.

## Limitaciones y advertencias

- Prototipo de investigación: la propia model card indica explícitamente que no es un dispositivo médico y que no debe usarse para diagnóstico. Cualquier uso clínico requeriría validación regulatoria independiente.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial dentro de un producto propietario exige revisar las obligaciones de la AGPL (incluida la disponibilidad del código fuente para usuarios que interactúen con el servicio por red). Este punto es crítico para integraciones en software de patología comercial.
- Dominio muy restringido: solo detecta figuras mitóticas en imágenes H&E, y únicamente sobre morfologías representadas en MIDOG++ (7 tipos tumorales, muestras humanas y caninas). El rendimiento fuera de ese dominio (otras tinciones, otros órganos, otras especies) no está medido y previsiblemente se degrada.
- Sesgo de conjunto: aunque MIDOG++ es multidominio, no se publican análisis por tipo tumoral, por laboratorio de origen ni por especie, de modo que se desconoce si el rendimiento es homogéneo entre subpoblaciones.
- Falsos positivos y negativos: con umbral 0.39, la precisión reportada es 0.783 y el recall 0.825, lo que implica aproximadamente un 22% de detecciones incorrectas entre las positivas y un 17,5% de mitosis no detectadas en el split de test. La clase `imposter` mitiga, pero no elimina, los falsos positivos.
- Umbral dependiente del contexto: 0.39 se optimizó para F1 en validación; otros objetivos (maximizar recall para cribado o maximizar precisión para confirmación) requieren recalibrar y volver a evaluar.
- Precisión de la variante float16: la diferencia máxima de confianza frente al modelo PyTorch es de 0.0031, pequeña pero no nula; además, la exportación float16 falla al cargar si no se mantiene en float32 el decodificado de cajas y la selección top-300.
- Sin métricas de despliegue: no hay datos publicados de latencia, throughput ni consumo energético, por lo que las estimaciones de viabilidad en producción deben medirse en el entorno objetivo.
- Adopción nula registrada: 0 descargas y 0 "likes" en el momento de la consulta, con publicación del 16 de octubre de 2026. No hay evidencia externa de uso, validación independiente ni informes de errores.
- Idiomas y texto: al ser un modelo puramente visual, no aplican capacidades lingüísticas; no puede generar informes ni resúmenes, solo cajas y puntuaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nakamura196/yolo26x-midog-onnx
- Demo en el navegador: https://nakamura196.github.io/midog-detect/
- Código de entrenamiento, evaluación, exportación y visor web: https://github.com/nakamura196/midog-detect
- Artículo de MIDOG++ (Aubreville et al., *Scientific Data* 10, 484, 2023): https://doi.org/10.1038/s41597-023-02327-4
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con este modelo (corresponden al videojuego Darkwood), por lo que no se han incluido como enlaces relevantes.
