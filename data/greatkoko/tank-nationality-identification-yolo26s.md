# greatkoko/tank-nationality-identification-YOLO26s

## Resumen

El modelo `greatkoko/tank-nationality-identification-YOLO26s` es un detector de objetos basado en Ultralytics YOLO26s, reentrenado para localizar carros de combate principales y clasificar su nacionalidad en cuatro clases: `usa`, `japan`, `north_korea` y `south_korea`. Lo publica el usuario greatkoko como una reevaluación moderna del trabajo de Lim y Kang (2021), que abordaba la misma tarea con YOLOv4 sobre Darknet. El interés reside en que reproduce un problema clásico de identificación amigo/enemigo (IFF) con un detector actual, cabeza end-to-end sin NMS y un protocolo de test agrupado que evita la fuga de datos por versiones con ruido de la misma fotografía.

El modelo es pequeño: 9,47 M de parámetros y 20,8 GFLOPs a 640×640, con pesos PyTorch de 20 MB. Se distribuye en `.pt` para Ultralytics y en un `.onnx` exportado de extremo a extremo cuya salida ya es final (`output0` de forma `[1, 300, 6]`), además de haberse medido en TensorRT FP16 y OpenVINO INT8. No procesa texto: es un detector de imagen puro, por lo que no tiene ventana de contexto ni capacidades lingüísticas.

La relevancia es doble. Por un lado, ofrece métricas de validación poco habituales en modelos de este tamaño (mAP50 de 0,9923, precisión de 0,9988 y un desglose específico de confusiones amigo/enemigo con umbral operativo recomendado de 0,7). Por otro, documenta con franqueza sus límites: solo valida primeros planos, no rangos reales de enfrentamiento, y el dataset no se distribuye por derechos de autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics), detector de una etapa con cabeza end-to-end sin NMS ni DFL |
| Parametros totales | 9,47 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, sin entrada de texto) |
| Tipos de cuantizacion | FP32 (PyTorch, ONNX), FP16 (TensorRT), INT8 (OpenVINO) |
| Idiomas soportados | No aplica; las etiquetas de clase están en inglés (`usa`, `japan`, `north_korea`, `south_korea`) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (20 MB), ONNX end-to-end (38 MB); se mencionan además TensorRT FP16 (100 MB) y OpenVINO INT8 (10 MB), no incluidos en el repo |
| Tarea | Detección de objetos con clasificación de nacionalidad (4 clases) |
| Resolución de entrada | 640×640 (`images` `[1, 3, 640, 640]` en ONNX) |
| Coste computacional | 20,8 GFLOPs |
| Salida ONNX | `output0` `[1, 300, 6]` = x1, y1, x2, y2, score, class_id |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

YOLO26s es un detector de una etapa de la familia Ultralytics con cabeza end-to-end: la salida ya incorpora la supresión de duplicados, de modo que el grafo ONNX no requiere un paso NMS externo y devuelve directamente hasta 300 detecciones con score y clase. La versión publicada parte de pesos COCO preentrenados y se ajusta a 4 clases. El entrenamiento se realizó con Ultralytics 8.4.164 y PyTorch 2.14, 100 épocas con parada temprana de paciencia 30 (mejor época: 89), tamaño de imagen 640, batch 16 y precisión mixta automática, sobre una única NVIDIA Quadro RTX 4000 de 8 GB en 1,8 horas con semilla 42 determinista. Como aumentación se usaron los valores por defecto de Ultralytics más una rotación de ±10° (heredada del artículo original), con mosaic desactivado en las últimas 10 épocas; el optimizador se seleccionó automáticamente con un pico de learning rate de aproximadamente 0,0012 y decaimiento lineal.

El dataset consta de 5.994 imágenes recopiladas de la web: unas 500 fotografías originales por país, cada una con una versión con ruido de polvo y otra con ruido de niebla (1.500 por clase, 1.494 para `south_korea`). El punto metodológico clave es el split consciente de grupos: una foto original y sus dos versiones con ruido caen siempre en el mismo conjunto, de forma que no hay casi duplicados entre entrenamiento y test. El reparto final es 4.197 / 900 / 897 imágenes (70 / 15 / 15 %, estratificado por clase). Las imágenes no se distribuyen con el modelo por pertenecer a sus autores originales.

## Capacidades

- Detección de carros de combate en imagen RGB con caja delimitadora, score y clase de nacionalidad en una sola pasada.
- Clasificación de nacionalidad en cuatro clases cerradas: Estados Unidos, Japón, Corea del Norte y Corea del Sur.
- Salida end-to-end sin NMS en el export ONNX, apta para runtimes genéricos de ONNX.
- Robustez medida frente a degradación de visibilidad: niebla y polvo provocan caídas inferiores a un punto porcentual en mAP50 respecto a la imagen original.
- Lectura agregada tipo IFF: el autor documenta precisión y recall conjuntos de caja más nacionalidad, además de las confusiones amigo→enemigo y enemigo→amigo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No soporta visión-lenguaje, audio ni entrada multimodal; únicamente imagen.
- No dispone de modo "thinking" ni de capacidades multilingües.

## Casos de uso

- Curaduría y autoetiquetado de datasets: usar el modelo con umbral 0,7 para preanotar cajas y nacionalidad sobre nuevas recopilaciones de imágenes y revisar solo los casos de baja confianza, reduciendo el coste de etiquetado manual.
- Investigación en reconocimiento fino de vehículos militares: el par `.pt`/`.onnx` y las métricas por clase permiten reproducir el experimento y compararlo con la línea base YOLOv4 del artículo de 2021.
- Verificación OSINT de fotografías publicadas en prensa: como clasificador auxiliar para contrastar la nacionalidad declarada de un vehículo en una imagen con la predicción del modelo, siempre con revisión humana y con la advertencia de que solo se validó en primeros planos.
- Estudio de robustez ante degradación visual: las versiones con polvo y niebla del dataset permiten medir la caída de precisión y ajustar el umbral operativo en condiciones de baja visibilidad.
- Despliegue en dispositivos de borde para investigación: el ONNX de 38 MB y el OpenVINO INT8 de 10 MB funcionan en CPU (35,5 ms/imagen en un Xeon Silver 4214 con OpenVINO INT8) y en GPUs de consumo, lo que facilita prototipos en hardware limitado.
- Docencia y simulación: integrar el detector en entornos de simulación o wargaming sintético para ilustrar pipelines completos de detección y clasificación con métricas IFF, sin uso operativo real.
- Evaluación comparativa de exportaciones: usar la tabla de despliegue del autor (PyTorch, TensorRT, ONNX, OpenVINO) como referencia para decidir el formato en función del compromiso entre mAP50-95 y latencia.

## Benchmarks y rendimiento

Conjunto de test reservado (897 imágenes, imgsz 640):

| Metrica | YOLO26s (este modelo, test agrupado) | YOLOv4 (paper, validacion aleatoria) |
|---|---|---|
| mAP50 | 0,9923 | 0,9918 |
| mAP50-95 | 0,8992 | no disponible |
| Precision | 0,9988 | 0,96 |
| Recall | 0,9841 | 0,98 |
| IoU medio (conf 0,25) | 0,934 | 0,839 |
| Inferencia | 4,7 ms/imagen (Quadro RTX 4000, batch 16) | no disponible |

AP50 por clase:

| Clase | AP50 (este modelo) | AP50 (YOLOv4, paper) |
|---|---|---|
| usa | 0,995 | 0,9972 |
| japan | 0,995 | 0,9975 |
| north_korea | 0,995 | 0,9957 |
| south_korea | 0,984 | 0,9771 |

Vista de identificación amigo/enemigo (amigo = `usa`, `south_korea`; enemigo = `north_korea`), conf 0,25:

| Metrica | Valor |
|---|---|
| Carro detectado (cualquier clase) | 0,991 |
| Exactitud de nacionalidad sobre detectados | 0,995 |
| Precision / recall (caja + nacionalidad) | 0,988 / 0,986 |
| Enemigo → amigo (`north_korea` predicho como `south_korea`) | 1 / 225 (0,44 %) |
| Amigo → enemigo (`usa` predicho como `north_korea`) | 2 / 459 (0,44 %) |
| Falsos positivos por imagen | 0,0067 |

Desglose por condición de ruido (test):

| Condicion | Imagenes | mAP50 | mAP50-95 | Recall (conf 0,25) | IoU medio |
|---|---|---|---|---|---|
| Original | 299 | 0,9945 | 0,9070 | 0,993 | 0,933 |
| Polvo | 299 | 0,9920 | 0,8977 | 0,980 | 0,933 |
| Niebla | 299 | 0,9899 | 0,8971 | 0,984 | 0,935 |

Benchmark de despliegue (300 imágenes de test, batch 1):

| Formato | Dispositivo | mAP50 | mAP50-95 | ms/imagen | FPS | Tamano |
|---|---|---|---|---|---|---|
| PyTorch FP32 | Quadro RTX 4000 | 0,995 | 0,906 | 22,6 | 44 | 20 MB |
| TensorRT FP16 | Quadro RTX 4000 | 0,994 | 0,894 | 4,7 | 212 | 100 MB |
| PyTorch FP32 | Xeon Silver 4214 (WSL2) | 0,995 | 0,906 | 129,0 | 8 | 20 MB |
| ONNX FP32 | Xeon Silver 4214 (WSL2) | 0,994 | 0,893 | 76,7 | 13 | 38 MB |
| OpenVINO INT8 | Xeon Silver 4214 (WSL2) | 0,992 | 0,865 | 35,5 | 28 | 10 MB |

Notas del autor: las filas de ONNX y TensorRT se midieron con una exportación anterior basada en NMS, por lo que el ONNX end-to-end del repositorio puede puntuar ligeramente distinto. Las cifras del artículo original provienen de un split aleatorio (las versiones con ruido de una misma foto podían aparecer en entrenamiento) y del cálculo de AP de Darknet, así que la comparación es indicativa, no exacta. 0,995 es el techo del AP interpolado de Ultralytics.

## Requisitos de hardware

- Huella de pesos muy reducida: 20 MB en FP32 PyTorch y 38 MB en ONNX, por lo que el modelo ocupa una fracción mínima de VRAM; el autor no publica una cifra explícita de VRAM pico.
- GPU de referencia usada en entrenamiento y medida: NVIDIA Quadro RTX 4000 de 8 GB, suficiente para entrenar 100 épocas en 1,8 horas con batch 16 y AMP.
- Inferencia en GPU: 4,7 ms/imagen y 212 FPS con TensorRT FP16 en Quadro RTX 4000 (batch 1); 22,6 ms/imagen y 44 FPS en PyTorch FP32.
- Cabe en cualquier GPU de consumo con al menos unos pocos GB de VRAM; el autor no detalla pruebas en RTX 4090, RTX 3060 u otras, por lo que esos datos no están disponibles.
- CPU: 129,0 ms/imagen con PyTorch FP32, 76,7 ms con ONNX FP32 y 35,5 ms con OpenVINO INT8 en un Xeon Silver 4214 bajo WSL2 (8, 13 y 28 FPS respectivamente).
- Opciones de despliegue soportadas o medidas: Ultralytics (`YOLO("tank_yolo26s.pt")` o `YOLO("tank_yolo26s.onnx")`), cualquier runtime ONNX, TensorRT y OpenVINO.
- vLLM, llama.cpp, Ollama y TGI no aplican: son servidores de modelos de lenguaje, no de detección de objetos.
- Throughput y latencia en otros hardware (H100, A100, Jetson) no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP50 en esta tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26s (este modelo) | 9,47 M | Imagen 640×640 | 0,9923 | AGPL-3.0 | Pesos `.pt` y `.onnx` en HuggingFace |
| YOLOv4 (Lim y Kang, 2021) | no disponible | Imagen (resolución no indicada) | 0,9918 (validación aleatoria) | no disponible | No distribuido con este modelo |
| Otros detectores de la familia Ultralytics (YOLOv8s, YOLO11s) | no disponible | Imagen | no disponible | AGPL-3.0 en Ultralytics | Públicos, pero sin resultados publicados en esta tarea |

No se han publicado en la información disponible resultados de otros detectores sobre este mismo dataset ni comparativas con modelos de clasificación de vehículos militares. Cualquier comparación con YOLOv8s, YOLO11s o RT-DETR requeriría reentrenar sobre las mismas 5.994 imágenes y el mismo split agrupado.

## Limitaciones y advertencias

- Solo primeros planos: el 96 % de las cajas de test cubren al menos el 30 % de la imagen y ninguna baja del 2 %; el recall en cajas de rango medio (2-10 % de la imagen, n = 9) es de solo 0,33. El rendimiento a distancias reales de enfrentamiento no está validado.
- La model card está truncada en el apartado de limitaciones ("entrenado con fotos web de..."), por lo que pueden existir advertencias adicionales del autor no recogidas aquí.
- El umbral operativo recomendado (conf = 0,7) se justifica con solo 3 casos de error en el test; el propio autor pide validarlo sobre datos propios. Por encima de 0,75 el recall cae rápidamente.
- `south_korea` es la clase más difícil para ambos modelos (AP50 0,984 frente a 0,995 del resto), lo que concentra el riesgo de confusión enemigo→amigo.
- Dataset pequeño y de origen web: 5.994 imágenes, de las cuales solo unas 500 son fotografías originales por país; las variantes con polvo y niebla son sintéticas y no sustituyen a condiciones reales de captura.
- Riesgo de falsos positivos y de alucinación de cajas en escenas sin carros: se midieron 0,0067 falsos positivos por imagen en test, una cifra que puede crecer fuera de la distribución de entrenamiento.
- Sesgo de dominio: no se documenta la distribución geográfica, temporal ni de sensores de las fotos (no hay imágenes térmicas, nocturnas, aéreas ni de satélite), por lo que la generalización a otras modalidades es desconocida.
- Licencia AGPL-3.0: el uso comercial exige cumplir las obligaciones de copyleft de AGPL, incluida la publicación del código fuente si se ofrece el modelo como servicio en red; conviene revisarlo con asesoría legal antes de integrarlo en producto.
- Las imágenes de entrenamiento no se distribuyen por derechos de autor, de modo que el modelo no es completamente reproducible a partir de este repositorio.
- Uso dual: se trata de un modelo de identificación de blancos militares. Su uso en sistemas de armas o en apoyo a decisiones letales queda fuera del ámbito razonable de investigación y puede estar sujeto a normativa de control de exportación y a las políticas de uso de HuggingFace.
- Las ingenierías TensorRT son específicas de cada GPU y no se incluyen; el ONNX end-to-end puede puntuar distinto de las cifras de la tabla de despliegue.
- No entiende texto ni instrucciones: no debe esperarse ninguna capacidad de razonamiento, explicación o filtrado semántico de sus salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/greatkoko/tank-nationality-identification-YOLO26s
- Artículo de referencia: Lim, S. y Kang, D. (2021), "Identifications and Evaluation of Tank Nationality using YOLO Algorithm", KIISE Transactions on Computing Practices, 27(12), 555-562 — https://doi.org/10.5626/KTCP.2021.27.12.555
- Repositorio, paper, blog o demo adicionales: no disponible; la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas sin relación con la consulta).
