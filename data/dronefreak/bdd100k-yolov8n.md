# dronefreak/bdd100k-yolov8n

## Resumen

dronefreak/bdd100k-yolov8n es un detector de objetos YOLOv8n afinado sobre el conjunto de datos BDD100K, publicado por el usuario dronefreak dentro del proyecto DetectionBench. No se trata de un modelo de lenguaje: es una red convolucional de detección en una sola etapa, con 3,2 millones de parámetros y 8,7 GFLOPs a 640 px de entrada, que predice cajas delimitadoras para diez clases propias de escenas de conducción: peatón, ciclista, coche, camión, autobús, tren, moto, bicicleta, semáforo y señal de tráfico.

La relevancia del modelo es doble. Por un lado, funciona como referencia reproducible para comparar detectores modernos bajo una misma receta de entrenamiento y unas mismas métricas de evaluación, que es precisamente el objetivo declarado de DetectionBench. Por otro, su tamaño reducido (3,2 M de parámetros) lo sitúa como candidato natural a despliegue en tiempo real sobre hardware embebido, algo crítico en percepción para conducción autónoma. En el split de test de BDD100K declara 51,67 de mAP@50, 29,09 de mAP@50-95, 70,95 de precisión y 46,59 de recall.

El checkpoint se distribuye bajo licencia AGPL-3.0 y se apoya en la librería Ultralytics. El dataset BDD100K, en cambio, tiene una licencia propia restringida a investigación y educación no comercial, una combinación que conviene analizar antes de cualquier uso en producto. En el momento de redactar esta ficha el repositorio no registra descargas ni «likes», y las métricas declaradas figuran como no verificadas en el model-index.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN de detección en una sola etapa, anchor-free, base YOLOv8n (Ultralytics) |
| Parámetros totales | 3,2 M |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica (modelo de visión, sin ventana de contexto de texto) |
| Tipos de cuantización | no especificados por el autor; la librería Ultralytics permite exportar con FP16 e INT8 (TensorRT, OpenVINO, TFLite) |
| Idiomas soportados | no aplica (modelo de visión; etiquetas de clase en inglés: person, rider, car, truck, bus, train, motor, bike, traffic light, traffic sign) |
| Licencia | AGPL-3.0 (pesos del modelo). El dataset BDD100K es de uso no comercial, solo investigación y educación, con registro previo y sin redistribución |
| Formato de pesos | checkpoint Ultralytics/PyTorch según `library_name: ultralytics`; el repositorio no detalla qué ficheros contiene (tamaño reportado: 0,0 GB) |
| Tarea | Detección de objetos (pipeline `object-detection`) |
| Resolución de entrada | 640 px (los FLOPs se declaran a 640 px) |
| FLOPs | 8,7 GFLOPs a 640 px (la model card lo etiqueta como «8.7B») |
| Número de clases | 10 |
| Dataset de entrenamiento y evaluación | BDD100K (evaluación sobre el split de test) |
| Marco de evaluación | `detectionbench-evaluate` (DetectionBench) |
| Modelo base | Ultralytics/YOLOv8 (YOLOv8n), ajuste fino |
| Descargas / «likes» | 0 / 0 |
| Fecha de publicación | 20 de septiembre de 2026 (última actualización el mismo día) |

## Arquitectura y entrenamiento

El modelo parte de YOLOv8n, la variante nano de la familia YOLOv8 de Ultralytics. Se trata de un detector de una sola etapa y sin anclas (anchor-free) compuesto por una red troncal con bloques C2f, un cuello de tipo PAN-FPN y una cabeza desacoplada que combina clasificación y regresión de cajas, con Distribution Focal Loss para la localización. La información proporcionada no detalla la configuración de capas ni los hiperparámetros concretos del ajuste fino. El ajuste se realizó sobre BDD100K siguiendo la receta de entrenamiento estandarizada de DetectionBench, cuyo propósito es que todos los detectores comparados se entrenen y evalúen con recetas idénticas.

El autor no publica en la información disponible el número de imágenes de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste adicionales más allá del entrenamiento supervisado sobre las anotaciones de BDD100K. Tampoco se documentan técnicas de aumento de datos, destilación ni decodificación especulativa (no aplicable en detección). Las métricas se calculan sobre el split de test con el pipeline `detectionbench-evaluate`, y todas aparecen marcadas como no verificadas (`verified: false`) en el model-index.

## Capacidades

- Detección de objetos en imágenes de escenas de conducción, con cajas delimitadoras y puntuaciones de confianza para 10 clases.
- Clases soportadas: person, rider, car, truck, bus, train, motor, bike, traffic light y traffic sign.
- Detección de señalización vertical y semáforos, reflejada en los tags `traffic-sign-detection` y `traffic-light-detection`.
- Inferencia sobre imágenes individuales a 640 px; el coste de 8,7 GFLOPs por imagen permite procesamiento en tiempo real en hardware modesto (sin cifras de FPS declaradas por el autor).
- Integración directa con el ecosistema Ultralytics para entrenamiento, validación, predicción y exportación a otros formatos.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No incluye modo «thinking», visión-lenguaje, audio ni segmentación de instancias; la tarea es exclusivamente detección de cajas.

## Casos de uso

- Percepción en ADAS y prototipos de conducción autónoma sobre hardware embebido: con 3,2 M de parámetros y 8,7 GFLOPs a 640 px, el modelo puede integrarse en plataformas tipo Jetson o GPU de baja potencia para detectar vehículos, peatones y señalización en el bucle de percepción.
- Auditoría e inventario de infraestructura vial: la detección de señales de tráfico (67,55 de mAP@50) y semáforos (64,45 de mAP@50) permite recorrer grabaciones de flota y generar inventarios geolocalizados de señalización para mantenimiento.
- Analítica de tráfico urbano: el modelo identifica coches (79,67 de mAP@50), camiones (61,86) y autobuses (60,43), lo que habilita conteos por clase y estudios de ocupación de vía a partir de cámaras fijas o vídeo de dron.
- Seguridad de usuarios vulnerables: con clases específicas para peatón (61,65 de mAP@50), ciclista (41,33) y moto (37,35), sirve como base para alertas de colisión, aunque el recall bajo de estas clases obliga a umbrales conservadores.
- Preetiquetado para anotación humana: ejecutar el detector sobre imágenes nuevas y revisar solo las detecciones de confianza media o baja reduce el coste de anotación en proyectos internos de percepción.
- Baseline reproducible en investigación: al seguir la receta de DetectionBench, el checkpoint sirve como punto de comparación homogéneo frente a otros detectores evaluados sobre el mismo split de test de BDD100K.
- Etiquetado offline a gran escala: la baja huella de memoria permite procesar lotes grandes en una sola GPU (por ejemplo, T4, A100 o H100) para anotar corpus completos de vídeo.
- Destilación o comparación de modelos: su tamaño reducido lo convierte en un candidato razonable como alumno en esquemas de destilación desde detectores mayores, o como referencia de coste mínimo frente a variantes más pesadas de YOLOv8.
- Validación de pipelines MLOps: al integrarse vía Ultralytics y exportarse a ONNX o TensorRT, es útil para probar de extremo a extremo cadenas de exportación, cuantización y despliegue antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (marcados como no verificados), sobre el split de **test** de BDD100K:

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 51,67 |
| mAP@50-95 | 29,09 |
| Precisión | 70,95 |
| Recall | 46,59 |
| F1 | 56,25 |

Rendimiento por clase, según la model card:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| person | 61,65 | 30,82 |
| rider | 41,33 | 20,69 |
| car | 79,67 | 49,26 |
| truck | 61,86 | 44,77 |
| bus | 60,43 | 46,63 |
| train | 0,0 | 0,0 |
| motor | 37,35 | 17,59 |
| bike | 42,38 | 20,71 |
| traffic light | 64,45 | 24,58 |
| traffic sign | 67,55 | 35,87 |

No se han publicado otros resultados de benchmarks (COCO, HumanEval, GSM8K y similares no aplican a este tipo de modelo) en la información disponible. El único contraste publicado por el autor es el «model zoo» de DetectionBench sobre BDD100K: YOLOv9t alcanza 52,04 de mAP@50, 29,46 de mAP@50-95, 71,34 de precisión y 46,72 de recall, ligeramente por encima de este checkpoint en las cuatro métricas; no se detalla el desglose por clase de YOLOv9t.

## Requisitos de hardware

- Tamaño de pesos: aproximadamente 12,8 MB en FP32, 6,4 MB en FP16 y 3,2 MB en INT8 (cálculo aritmético a partir de 3,2 M de parámetros; el autor no declara tamaños de fichero).
- VRAM estimada para inferencia: por debajo de 1 GB en un solo lote a 640 px, incluyendo activaciones de una red de este tamaño (estimación; no declarada por el autor).
- Cabe sin problema en cualquier GPU de consumo: GTX 1050 Ti y superiores, serie RTX 20/30/40, e incluso en iGPU o CPU para uso no crítico en latencia.
- Plataformas embebidas recomendadas para despliegue: NVIDIA Jetson Nano, Orin Nano, Orin NX y AGX Orin, gracias al soporte de TensorRT.
- GPU de gama alta (T4, L4, A100, H100) recomendadas para etiquetado offline por lotes o para servir muchas cámaras en paralelo, no por requisito de memoria.
- Opciones de despliegue: Ultralytics (Python CLI/API), ONNX Runtime, TensorRT, OpenVINO, TFLite, CoreML, NCNN, MNN y PaddlePaddle mediante exportación del framework. vLLM, llama.cpp y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. El autor no publica medidas de FPS, latencia ni hardware de referencia. Los 8,7 GFLOPs a 640 px son el único indicador de coste computacional disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | mAP@50 | mAP@50-95 | Precisión | Recall | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| YOLOv8n ajustado en BDD100K (este modelo) | 3,2 M | 51,67 | 29,09 | 70,95 | 46,59 | AGPL-3.0 (dataset no comercial) | Hugging Face |
| YOLOv9t ajustado en BDD100K (DetectionBench) | no disponible en la información | 52,04 | 29,46 | 71,34 | 46,72 | no disponible | Hugging Face / DetectionBench |
| Ultralytics/YOLOv8n preentrenado en COCO (modelo base) | 3,2 M (según la ficha de este checkpoint) | no disponible | no disponible | no disponible | no disponible | AGPL-3.0 | Ultralytics / Hugging Face |
| Otros detectores de la misma categoría (RT-DETR, Faster R-CNN, DETR) sobre BDD100K | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar directamente con YOLOv9t dentro del mismo «model zoo» de BDD100K. La diferencia a favor de YOLOv9t es de 0,37 puntos de mAP@50 y 0,37 puntos de mAP@50-95, marginal y sin intervalos de confianza publicados. No hay datos de latencia ni de tamaño de YOLOv9t en la información proporcionada, por lo que no puede evaluarse la relación precisión-coste.

## Limitaciones y advertencias

- Licencia AGPL-3.0 en los pesos: su uso en un servicio accesible por red obliga a ofrecer el código fuente correspondiente bajo la misma licencia; conviene revisar las obligaciones antes de integrarlo en producto.
- Conflicto de licencias con el dataset: BDD100K está restringido a investigación y educación no comercial, con registro obligatorio y prohibición de redistribución. Un modelo derivado de ese dataset es jurídicamente problemático para uso comercial, con independencia de la licencia de los pesos.
- La clase `train` obtiene 0,0 de mAP@50 y 0,0 de mAP@50-95: el modelo no detecta trenes en la práctica.
- Recall global del 46,59 %: en el punto de operación declarado se dejan sin detectar más de la mitad de las instancias del test, algo crítico en aplicaciones de seguridad.
- Rendimiento bajo en clases minoritarias: `motor` (37,35), `rider` (41,33) y `bike` (42,38) en mAP@50, coherente con el desequilibrio de clases típico de BDD100K.
- Clase `traffic light`: 64,45 de mAP@50 pero solo 24,58 de mAP@50-95, lo que indica localización imprecisa en objetos pequeños, habitual en semáforos lejanos.
- Métricas no verificadas: todas las cifras del model-index están marcadas con `verified: false`; proceden del propio autor y no han sido replicadas de forma independiente.
- Sin validación comunitaria: 0 descargas y 0 «likes» en el momento de la consulta, por lo que no hay evidencia externa de reproducibilidad.
- Cobertura de dominio limitada: BDD100K son escenas de conducción en carretera con variabilidad de clima e iluminación, pero no cubre imágenes aéreas, interiores, industriales ni otras cámaras; el rendimiento fuera de ese dominio es desconocido.
- Tarea única: no realiza segmentación, seguimiento multiobjeto, estimación de profundidad ni clasificación de escena.
- Repositorio de 0,0 GB: el tamaño reportado no permite confirmar desde los metadatos que los pesos estén efectivamente subidos; conviene verificar los ficheros antes de depender del checkpoint.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de falsos positivos, especialmente con oclusiones, mala iluminación o clases poco representadas.
- Sesgos potenciales heredados del dataset: sobrerrepresentación de escenas diurnas y de determinadas geografías (principalmente Estados Unidos), con posible degradación en otras regiones y condiciones nocturnas o de lluvia intensa.
- Para producción en percepción: dado el recall declarado, no debería usarse como único sistema de detección en funciones de seguridad; requiere redundancia, umbrales calibrados y validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-yolov8n
- Repositorio DetectionBench (marco de entrenamiento y evaluación, fuente de las métricas): https://github.com/dronefreak/DetectionBench
- Sitio oficial del dataset BDD100K (descarga con registro): https://www.bdd100k.com/
- Paper referenciado en los tags del modelo: https://arxiv.org/abs/2402.13616 (el contenido del paper no está disponible en la información proporcionada; solo se conoce el identificador)
- Repositorio de Ultralytics (framework, exportación y utilidades): https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com/
- Página del modelo base: https://huggingface.co/Ultralytics/YOLOv8

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los resultados obtenidos trataban sobre precios de telefonía móvil y no guardan relación con el checkpoint analizado.
