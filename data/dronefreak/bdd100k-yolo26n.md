# dronefreak/bdd100k-yolo26n

## Resumen

El modelo `dronefreak/bdd100k-yolo26n` es un detector de objetos de la familia YOLO26 en su variante nano (aproximadamente 2,6 millones de parámetros y 6,1 GFLOPs a 640 px), afinado por el usuario dronefreak sobre el conjunto de datos de conducción autónoma BDD100K. Parte del checkpoint base `Ultralytics/YOLO26` y se distribuye a través de la librería `ultralytics` con licencia AGPL-3.0. No es un modelo de lenguaje: su tarea es la detección de objetos en imágenes (pipeline `object-detection`), por lo que no dispone de ventana de contexto, generación de texto ni capacidades conversacionales.

Su interés principal es metodológico y de percepción para conducción autónoma. El modelo se ha entrenado y evaluado dentro de [DetectionBench](https://github.com/dronefreak/DetectionBench), un marco que aplica recetas de entrenamiento y métricas de evaluación idénticas a distintos detectores modernos sobre varios conjuntos de datos reales, lo que permite comparaciones reproducibles entre arquitecturas. En BDD100K detecta diez clases: persona, ciclista, coche, camión, autobús, tren, motocicleta, bicicleta, semáforo y señal de tráfico.

Los resultados declarados por el autor en el split de test son 52,25 % de mAP@50, 29,23 % de mAP@50-95, 72,56 % de precisión, 46,87 % de recall y un F1 de 56,95. Todas las métricas están marcadas como `verified: false`, es decir, son cifras autoinformadas y no verificadas de forma independiente. El repositorio ocupa 0,0 GB en el momento de la consulta y no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26, variante nano (detector de objetos de una sola etapa, familia Ultralytics) |
| Parametros totales | 2,6 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen, 640 px en la evaluación) |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | no disponible (modelo de detección; los nombres de clase están en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (repositorio de 0,0 GB; se carga mediante la librería `ultralytics`) |
| Tarea | Detección de objetos (`object-detection`) |
| Modelo base | Ultralytics/YOLO26 |
| FLOPs | 6,1 B a 640 px |
| Clases | 10 (person, rider, car, truck, bus, train, motor, bike, traffic light, traffic sign) |
| Framework | Ultralytics YOLO + PyTorch |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLO26 en su variante nano, un detector denso de una sola etapa propio de la familia Ultralytics. El autor no detalla en la model card cambios estructurales respecto al checkpoint base, por lo que se trata de un ajuste fino sobre `Ultralytics/YOLO26` y no de un rediseño de la arquitectura. El modelo opera sobre imágenes a 640 px en la configuración evaluada, con un coste de 6,1 GFLOPs y 2,6 millones de parámetros, lo que lo sitúa en el extremo más ligero de la familia.

El entrenamiento se realizó sobre BDD100K, un conjunto de referencia para escenas de conducción con diez categorías anotadas. La model card no especifica el número de imágenes de entrenamiento utilizadas, la composición exacta del dataset, el número de épocas, la resolución de entrenamiento ni si se aplicaron técnicas de aumento de datos o destilación. Tampoco se documentan fases de ajuste por refuerzo ni preferencias humanas, algo por otro lado esperable en un detector de objetos y no en un modelo generativo.

La innovación destacable no está en el modelo en sí, sino en el protocolo: todas las métricas se calculan sobre el split de **test** de BDD100K con el pipeline estándar de DetectionBench (`detectionbench-evaluate`), lo que permite comparar este checkpoint con otros detectores entrenados bajo recetas idénticas. El autor publica además un "model zoo" de BDD100K con los resultados de cada modelo evaluado, así como curvas de precisión-recall, curvas F1 y matrices de confusión.

## Capacidades

- Detección de objetos en imágenes de escenas de conducción, con cajas delimitadoras sobre diez clases: person, rider, car, truck, bus, train, motor, bike, traffic light y traffic sign.
- Detección específica de señalización vial y semáforos, dos clases con anotación explícita en el conjunto de datos.
- Inferencia de baja latencia apta para hardware modesto, gracias a sus 2,6 M de parámetros y 6,1 GFLOPs a 640 px.
- Procesamiento de vídeo fotograma a fotograma para seguimiento y analítica de tráfico (la model card incluye una demostración con vídeo sobre dos clips de test de BDD100K).
- Integración con el ecosistema Ultralytics para entrenamiento, validación, exportación e inferencia por línea de comandos o API de Python.
- Generación de texto: no disponible (no es un modelo de lenguaje).
- Tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica; las etiquetas de clase están en inglés.
- Modo "thinking", visión-lenguaje, audio u otras modalidades: no disponibles.

## Casos de uso

- Percepción para ADAS y prototipos de conducción autónoma: el modelo entrega cajas y clases sobre fotogramas de cámara frontal, lo que permite alimentar módulos de detección de vehículos, peatones y ciclistas en un vehículo de investigación o en un banco de pruebas.
- Analítica de tráfico urbano a partir de cámaras fijas: con 2,6 M de parámetros y 6,1 GFLOPs puede ejecutarse en un equipo de borde o en una GPU de gama baja y contar vehículos y peatones por intervalo de tiempo.
- Detección de señalización y semáforos para sistemas de inventario de infraestructura: las clases traffic sign (68,57 % mAP@50) y traffic light (65,81 % mAP@50) permiten catalogar automáticamente señalización en recorridos grabados.
- Investigación comparativa de detectores: al formar parte del model zoo de DetectionBench, sirve como punto de referencia para medir el efecto de cambios de receta, resolución o augmentación manteniendo constante el protocolo de evaluación.
- Etiquetado asistido y preanotación de datasets de conducción: el modelo puede generar cajas iniciales sobre imágenes nuevas de dominio similar, que después se revisan manualmente, reduciendo el coste de anotación.
- Robótica móvil y vehículos de reparto en entornos viales: detección de peatones, bicicletas y vehículos para planificación de trayectorias evasivas en plataformas con recursos de cómputo limitados.
- Análisis de vídeo en retroalimentación para flotas: procesado por lotes de grabaciones de dashcam para localizar eventos relevantes (presencia de peatones, ciclistas o camiones) sin recurrir a modelos de mayor tamaño.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de **test** de BDD100K (todos marcados como `verified: false`):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 52,25 |
| mAP@50-95 | 29,23 |
| Precision | 72,56 |
| Recall | 46,87 |
| F1 | 56,95 |
| Parametros | 2,6 M |
| FLOPs | 6,1 B (a 640 px) |

Comparativa publicada por el autor dentro del model zoo de BDD100K (mismas recetas y pipeline de evaluación):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLOv26n (este modelo) | 52,25 | 29,23 | 72,56 | 46,87 |
| YOLOv9t | 52,04 | 29,46 | 71,34 | 46,72 |
| YOLOv10n | 51,95 | 29,31 | 71,58 | 46,62 |
| YOLOv8n | 51,67 | 29,09 | 70,95 | 46,59 |
| YOLOv11n | 51,63 | 29,06 | 71,68 | 46,34 |

Rendimiento por clase declarado por el autor:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| person | 61,39 | 30,65 |
| rider | 41,68 | 20,22 |
| car | 79,54 | 49,08 |
| truck | 61,51 | 44,87 |
| bus | 60,53 | 46,58 |
| train | 0,0 | 0,0 |
| motor | 42,38 | 19,60 |
| bike | 41,07 | 19,99 |
| traffic light | 65,81 | 25,06 |
| traffic sign | 68,57 | 36,23 |

No se han publicado en la información disponible resultados de latencia, throughput ni consumo energético.

## Requisitos de hardware

- VRAM estimada: a partir de los 2,6 M de parámetros, los pesos ocupan aproximadamente 10,4 MB en FP32 y 5,2 MB en FP16 (cálculo teórico, no medido). El consumo real de inferencia a 640 px es de unos pocos cientos de MB contando activaciones y buffers, aunque no se publican cifras medidas.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con soporte CUDA (incluidas GTX 1650, RTX 3050, RTX 4090, A100, H100) es sobredimensionada para este checkpoint.
- Cabe en GPU de consumo: sí, con amplio margen; incluso cabe con holgura en iGPU y en CPU de escritorio, aunque no se facilitan medidas.
- Opciones de despliegue: la librería declarada es `ultralytics`, que permite exportar a formatos como ONNX, TensorRT, OpenVINO, TFLite, CoreML y ncnn (formatos habituales del ecosistema, no confirmados para este checkpoint concreto en la información disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP@50 (BDD100K) | mAP@50-95 (BDD100K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bdd100k-yolo26n | 2,6 M | no aplica | 52,25 | 29,23 | AGPL-3.0 | HuggingFace (0 descargas) |
| YOLOv9t | no disponible | no aplica | 52,04 | 29,46 | no disponible | evaluado en DetectionBench |
| YOLOv10n | no disponible | no aplica | 51,95 | 29,31 | no disponible | evaluado en DetectionBench |
| YOLOv8n | no disponible | no aplica | 51,67 | 29,09 | no disponible | evaluado en DetectionBench |
| YOLOv11n | no disponible | no aplica | 51,63 | 29,06 | no disponible | evaluado en DetectionBench |

Las cifras de mAP proceden del model zoo publicado por el autor en la model card. No se dispone de los recuentos de parámetros, licencias ni checkpoints públicos de los modelos comparados dentro de la información proporcionada.

## Limitaciones y advertencias

- Métricas autoinformadas y no verificadas: los cuatro valores del `model-index` están marcados como `verified: false`; conviene reproducirlos antes de usarlos como referencia en producción.
- Clase `train` con rendimiento nulo: mAP@50 y mAP@50-95 de 0,0, coherente con la baja frecuencia de esa clase en el conjunto de datos; el modelo no es fiable para detectar trenes.
- Recall moderado: 46,87 % de recall frente a 72,56 % de precisión indica un número relevante de objetos no detectados (falsos negativos), algo crítico en aplicaciones de seguridad vial.
- Rendimiento bajo en clases vulnerables: rider (41,68 % mAP@50), motor (42,38 %) y bike (41,07 %) son las categorías con peor resultado, precisamente las de mayor riesgo en escenas de tráfico.
- Sesgos conocidos: no disponibles. La model card no documenta la distribución geográfica, climática ni horaria de los datos, ni análisis de sesgo por tipo de escena.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existen falsos positivos; el autor publica matriz de confusión y matriz normalizada para su análisis.
- Limitaciones de dominio: el modelo está ajustado a BDD100K, por lo que su comportamiento fuera de escenas de conducción similares (por ejemplo, interiores, imágenes aéreas o cámaras no viales) no está caracterizado.
- Restricción de licencia del modelo: AGPL-3.0, licencia copyleft que obliga a liberar el código derivado, incluido el uso del modelo a través de red en determinados supuestos. Es un punto crítico para integraciones comerciales propietarias.
- Restricción de licencia de los datos: BDD100K se distribuye bajo su propia licencia, limitada a investigación y educación no comercial, con registro obligatorio y prohibición de redistribución. Un modelo afinado sobre estos datos hereda incertidumbre sobre su uso comercial, que conviene aclarar con el autor.
- Idioma y metadatos: los nombres de clase están en inglés y no se declara ningún idioma soportado en la ficha.
- Repositorio sin tracción: 0 descargas, 0 likes y un tamaño de repo de 0,0 GB en el momento de la consulta, lo que sugiere que los pesos podrían no estar completamente subidos o que el modelo es muy reciente (creado el 21 de septiembre de 2026).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-yolo26n
- Repositorio DetectionBench (marco de entrenamiento y evaluación): https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Sitio oficial del conjunto de datos BDD100K: https://www.bdd100k.com/
- Referencias arXiv citadas en las etiquetas del modelo: https://arxiv.org/abs/2606.03748, https://arxiv.org/abs/2405.14458, https://arxiv.org/abs/2410.17725, https://arxiv.org/abs/2402.13616 (identificadores tomados de los tags; no se dispone de sus títulos en la información proporcionada)
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las páginas devueltas por la búsqueda trataban sobre turismo en Manhattan y no guardan relación con el modelo.
