# dronefreak/bdd100k-yolov9t

## Resumen

`dronefreak/bdd100k-yolov9t` es un detector de objetos de una sola etapa obtenido por ajuste fino (fine-tuning) de YOLOv9t sobre el conjunto de datos BDD100K, centrado en escenas de conducción. Lo publica el usuario `dronefreak` como parte de DetectionBench, un marco de trabajo orientado a comparar detectores modernos bajo recetas de entrenamiento y métricas de evaluación idénticas. Es, por tanto, un artefacto de benchmarking reproducible más que un modelo de propósito general.

El modelo es muy pequeno: 2,1 millones de parámetros y 8,5 GFLOPs con entradas de 640 píxeles, lo que lo sitúa en la gama ultraligera de YOLOv9 (variante "t"). Detecta diez clases cerradas del dominio de tráfico: persona, ciclista, coche, camión, autobús, tren, moto, bicicleta, semáforo y señal de tráfico.

Su relevancia actual es doble. Por un lado, ofrece una referencia cuantitativa sobre cuánto puede rendir un detector mínimo en BDD100K (52,04 % de mAP@50 y 29,46 % de mAP@50-95 en el split de test). Por otro, sirve como punto de comparación dentro del zoo de modelos BDD100K de DetectionBench, donde se enfrenta a YOLOv8n con una receta común. Las métricas están declaradas por el autor y no verificadas por un tercero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv9 (detector de una etapa, sin anclas), variante t; familia GELAN con información de gradiente programable (PGI) |
| Parámetros totales | 2,1 M |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen, 640 px según las FLOPs declaradas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje); no disponible en la información proporcionada |
| Licencia | AGPL-3.0 |
| Formato de pesos | checkpoint de PyTorch para Ultralytics (librería declarada: `ultralytics`); no se detallan otros formatos empaquetados en la información disponible |
| Tarea | Detección de objetos (`pipeline_tag`: object-detection) |
| Modelo base | `Ultralytics/YOLOv9` (YOLOv9t) |
| Conjunto de datos de ajuste y evaluación | BDD100K (10 clases, escenas de conducción) |
| Clases | person, rider, car, truck, bus, train, motor, bike, traffic light, traffic sign |
| FLOPs | 8,5 B a 640 px |
| Framework de inferencia | Ultralytics (`pip install ultralytics huggingface_hub`) |
| Autor | `dronefreak` |
| Repositorio | https://huggingface.co/dronefreak/bdd100k-yolov9t |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,0 GB |
| Fechas declaradas | creado el 2026-09-20, actualizado el 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura de partida es YOLOv9, un detector denso de una sola etapa que introduce dos ideas principales: información de gradiente programable (PGI), con una rama auxiliar reversible que mitiga la pérdida de información en redes profundas, y GELAN (Generalized Efficient Layer Aggregation Network), un bloque de agregación de características que busca mejor relación rendimiento/coste computacional. La variante "t" es la más ligera de la familia: 2,1 M de parámetros y 8,5 GFLOPs a 640 px en este ajuste concreto.

El ajuste fino se ha realizado sobre BDD100K, un conjunto de escenas de conducción con diez clases anotadas en cajas. Según la model card, el entrenamiento y la evaluación se han llevado a cabo dentro de DetectionBench, cuyo objetivo es aplicar recetas de entrenamiento y métricas idénticas a todos los detectores comparados, de modo que las diferencias de rendimiento sean atribuibles al modelo y no a la configuración. La información disponible no detalla el número de épocas, la composición exacta del split de entrenamiento, la resolución de entrenamiento, las técnicas de aumento de datos ni el esquema de optimización. Tampoco se documenta ningún tipo de ajuste por preferencias humanas (RLHF, DPO), algo que no aplica a un detector de objetos.

La métrica se calcula sobre el split de test de BDD100K con la herramienta estándar de DetectionBench (`detectionbench-evaluate`). El repositorio va acompañado de visualizaciones de evaluación (curvas PR y F1, matrices de confusión normalizada y sin normalizar) y de un vídeo de demostración con detecciones sobre dos clips de test.

## Capacidades

- Detección de objetos en imágenes de escenas de conducción, con cajas delimitadoras sobre diez clases cerradas (persona, motorista, coche, camión, autobús, tren, moto, bicicleta, semáforo y señal de tráfico).
- Detección de vehículos y viandantes en escenas urbanas y de carretera, con buen rendimiento relativo en coche (79,57 % mAP@50) y camión (62,21 %).
- Detección de señalización vial: semáforos (63,74 % mAP@50) y señales de tráfico (67,34 % mAP@50).
- Carga e inferencia mediante la librería Ultralytics, que permite ejecutar predicción sobre imágenes, lotes y flujos de vídeo con la API habitual de la librería.
- Integración con el flujo de trabajo de DetectionBench para evaluación reproducible con métricas estandarizadas.
- No soporta tool calling ni function calling: es un modelo de visión, no un modelo de lenguaje.
- No soporta razonamiento multi-paso ni uso como agente.
- No tiene capacidades multilingües ni de generación de texto, ni modo "thinking", ni entrada de audio.
- No se documenta ningún tipo de cabecera adicional (segmentación, pose, clasificación), solo detección de cajas.

## Casos de uso

- Investigación en percepción para conducción autónoma: sirve como detector de referencia ultraligero para medir el coste en precisión de reducir un detector a 2,1 M de parámetros, útil para estudiar compromisos entre latencia y mAP en plataformas embarcadas.
- Punto de comparación en pipelines de benchmarking: al compartir receta y métricas con el resto del zoo de BDD100K de DetectionBench, permite evaluar de forma controlada si merece la pena subir de tamaño de modelo (por ejemplo, frente a YOLOv8n).
- Preanotación de datos de tráfico: el modelo puede generar cajas iniciales sobre imágenes de carretera para que un anotador humano las corrija, lo que reduce el coste de etiquetado en las clases con mayor mAP (coche, camión, bus, señales).
- Conteo y clasificación de vehículos en estudios de tráfico: detección por fotograma de coches, camiones y autobuses para estimar volúmenes de circulación en secuencias de vídeo; su tamaño reducido permite procesar muchos flujos en paralelo.
- Análisis de seguridad vial: detección de peatones y ciclistas (61,88 % y 43,89 % de mAP@50 respectivamente) para estudios observacionales de exposición y conflicto en intersecciones.
- Prototipado en dispositivos de borde: con 8,5 GFLOPs a 640 px y 2,1 M de parámetros, es candidato para equipos con recursos limitados (GPU integrada, Jetson, NPU) donde un detector grande no cabe.
- Filtrado previo en grandes volúmenes de vídeo: descartar fotogramas vacíos o seleccionar los que contienen peatones, vehículos o señalización antes de pasarlos a un modelo mayor o a un anotador humano.
- Validación de la propia herramienta DetectionBench: al ser uno de los checkpoints publicados del marco, sirve para reproducir sus resultados y comprobar la consistencia del pipeline de evaluación.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test de BDD100K (métricas no verificadas por un tercero, `verified: false`).

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 52,04 |
| mAP@50-95 | 29,46 |
| Precisión | 71,34 |
| Recall | 46,72 |
| F1 | 56,46 |
| Parámetros | 2,1 M |
| FLOPs | 8,5 B a 640 px |

Comparación dentro del zoo BDD100K publicado en la model card (misma receta y mismas métricas según DetectionBench).

| Modelo | mAP@50 | mAP@50-95 | Precisión | Recall |
|---|---|---|---|---|
| YOLOv9t (este modelo) | 52,04 | 29,46 | 71,34 | 46,72 |
| YOLOv8n | 51,67 | 29,09 | 70,95 | 46,59 |

Rendimiento por clase (mAP@50 / mAP@50-95).

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| person | 61,88 | 31,17 |
| rider | 43,07 | 21,55 |
| car | 79,57 | 49,36 |
| truck | 62,21 | 45,41 |
| bus | 60,59 | 46,77 |
| train | 0,0 | 0,0 |
| motor | 38,15 | 18,46 |
| bike | 43,89 | 21,69 |
| traffic light | 63,74 | 24,45 |
| traffic sign | 67,34 | 35,77 |

No se han publicado en la información disponible resultados comparativos frente a detectores de mayor tamaño ni métricas de latencia o throughput.

## Requisitos de hardware

- Huella de pesos estimada a partir del recuento de parámetros: unos 8,4 MB en FP32, 4,2 MB en FP16 y 2,1 MB en INT8. Son cálculos derivados del número de parámetros, no datos publicados por el autor.
- VRAM de inferencia: muy por debajo de 1 GB incluyendo activaciones a 640 px, según estimación derivada del tamaño y de las FLOPs declaradas. No hay cifras oficiales publicadas.
- Cabe holgadamente en cualquier GPU de consumo, incluida gama de entrada (GTX 1050 Ti, GTX 1650, RTX 3050) y GPU integradas. También es viable en CPU para lotes pequenos.
- Plataformas de borde plausibles dado el presupuesto computacional: NVIDIA Jetson (Nano, Orin), Raspberry Pi con acelerador, NPU dedicadas. No hay mediciones publicadas sobre estos dispositivos en la información disponible.
- Despliegue: la vía documentada en la model card es la librería Ultralytics (`pip install ultralytics huggingface_hub`). No se documentan en la información disponible despliegues con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un detector de objetos.
- Latencia y throughput: no disponible. El único dato relacionado es el coste computacional de 8,5 GFLOPs por imagen a 640 px.
- El repositorio figura con 0,0 GB en el momento de la consulta, por lo que conviene verificar que los pesos están efectivamente publicados antes de planificar un despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | mAP@50 en BDD100K | mAP@50-95 en BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv9t BDD100K (este modelo) | 2,1 M | 52,04 | 29,46 | AGPL-3.0 | Hugging Face, repo de 0,0 GB, 0 descargas |
| YOLOv8n BDD100K (DetectionBench) | no disponible en la información | 51,67 | 29,09 | no disponible en la información | citado en la model card, sin enlace directo |
| YOLOv9t base (Ultralytics) | 2,1 M | no disponible (métricas COCO, no BDD100K) | no disponible | AGPL-3.0 (familia Ultralytics) | disponible como modelo base |

Diferencias observadas: frente a YOLOv8n, bajo la misma receta, YOLOv9t obtiene una ventaja marginal de 0,37 puntos en mAP@50 y 0,37 en mAP@50-95 con el mismo orden de precisión y recall. No hay en la información disponible comparaciones con Detectron2, DETR, RT-DETR ni con variantes mayores de YOLO sobre BDD100K.

## Limitaciones y advertencias

- Las métricas las declara el autor y están marcadas como no verificadas (`verified: false`); no se han reproducido de forma independiente.
- El recall es bajo (46,72 %) en relación con la precisión (71,34 %): el modelo tiende a omitir objetos, con el consiguiente riesgo de falsos negativos en aplicaciones de seguridad.
- El mAP@50-95 es de 29,46, lo que indica localización poco precisa de las cajas, un problema si se necesita medir distancias o tamaños.
- La clase `train` obtiene 0,0 en mAP@50 y mAP@50-95: el modelo no detecta trenes en el conjunto de evaluación, probablemente por escasez de ejemplos.
- Las clases minoritarias del dominio (rider, motor, bike) rinden entre 38 y 44 de mAP@50, muy por debajo de coche (79,57), lo que genera un sesgo claro hacia los vehículos mayoritarios.
- Es un detector de dominio cerrado con diez clases de tráfico: no es un detector generalista y no debe usarse fuera de escenas de conducción sin un ajuste previo.
- Licencia del modelo: AGPL-3.0, con obligaciones de copyleft que se extienden al software que lo integra y, en el caso de la AGPL, también a servicios ofrecidos por red. Es un obstáculo relevante para productos propietarios.
- Licencia de los datos: BDD100K se distribuye bajo su propia licencia, restringida a investigación y educación no comercial, con registro obligatorio y prohibición de redistribución. El modelo se ha ajustado sobre esos datos, lo que introduce incertidumbre adicional sobre su uso comercial incluso al margen de la AGPL.
- No es un modelo de lenguaje: no tiene ventana de contexto, idiomas, tool calling ni razonamiento multi-paso. Cualquier expectativa en ese sentido es inaplicable.
- No se documentan en la información disponible análisis de sesgo demográfico o geográfico, composición del dataset de entrenamiento, número de épocas ni estrategia de aumento de datos.
- El repositorio presenta 0 descargas y 0 likes y un tamaño de 0,0 GB, además de fechas de creación y actualización poco habituales (2026). Conviene verificar la integridad y disponibilidad de los pesos antes de usarlo.
- La model card está truncada en la sección de uso, por lo que no se dispone de un ejemplo completo de carga del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-yolov9t
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: Ultralytics/YOLOv9 (familia YOLOv9, variante t)
- Paper de YOLOv9 referenciado en las etiquetas del modelo: arXiv:2402.13616
- Sitio oficial del conjunto de datos BDD100K: https://www.bdd100k.com/
- Paper de BDD100K: referenciado en la sección Citation de la model card, no incluido en la información proporcionada
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los resultados obtenidos eran páginas de soporte técnico de Windows sin relación con el contenido solicitado.
