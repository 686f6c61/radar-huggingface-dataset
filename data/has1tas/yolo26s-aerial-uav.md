# Has1tas/yolo26s-aerial-uav

## Resumen

YOLO26s aerial UAV es un detector de objetos basado en la arquitectura YOLO26s de Ultralytics, ajustado especificamente para imagenes aereas captadas por drones. Lo desarrolla el usuario Has1tas y fue empleado en la tarea 1 de la competicion TEKNOFEST 2026 Aviation AI. El modelo detecta cuatro clases: vehiculos (Vehicle), personas (Person), zonas de aparcamiento de coches voladores (UAP) y zonas de aterrizaje de ambulancias voladoras (UAI), estas dos ultimas definidas por las marcas especificas de la competicion.

El modelo resuelve el problema de la deteccion de objetos en escenarios de vision aerea, donde los objetos son pequenos, la perspectiva es cenital y las condiciones de iluminacion varian. Se distribuye como un checkpoint de 20,5 MB en formato `.pt` (PyTorch), compatible con la libreria Ultralytics, y se acompania de un pipeline de codigo abierto que anade estimacion de movimiento de vehiculos y evaluacion de la idoneidad de zonas de aterrizaje mediante reglas de procesamiento de imagen.

Es relevante ahora por su aplicacion directa en el ambito de los vehiculos aereos no tripulados (UAV) y la movilidad aerea urbana, un sector en expansion. Aunque el modelo es de proposito especifico y con pocas descargas (27), su publicacion bajo licencia AGPL-3.0 y su integracion con un pipeline completo lo hacen util como referencia para desarrolladores que trabajan en deteccion aerea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics), deteccion con tres escalas (strides 8, 16, 32) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, checkpoint Ultralytics) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26s de Ultralytics, un detector de objetos de una sola etapa con tres escalas de deteccion (strides 8, 16 y 32). Segun la model card, el checkpoint inspeccionado no incluye la salida P2 (stride 4) a pesar de que el nombre del run (`s_p2_1280_A`) lo sugiera; se trata de una etiqueta heredada. El YAML embebido identifica `yolo26s.yaml` con escala `s`. La inferencia se realiza con `imgsz=1280` para coincidir con el tamano de imagen de entrenamiento.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un detector de objetos). La model card indica explicitamente que no se realizo entrenamiento ni evaluacion independiente para la ficha, y que los datos tecnicos proceden unicamente de `checkpoint_info.json` extraido del checkpoint. El modelo fue entrenado en el contexto de la competicion TEKNOFEST 2026 Aviation AI, tarea 1.

## Capacidades

- Deteccion de objetos en imagenes aereas en cuatro clases: Vehicle (vehiculo), Person (persona), UAP (zona de aparcamiento de coches voladores) y UAI (zona de aterrizaje de ambulancias voladoras).
- Deteccion sobre imagenes individuales, secuencias de imagenes consecutivas y video corto (hasta 600 fotogramas en el pipeline complementario).
- Inferencia en CPU y GPU (CUDA), con procesamiento en CPU sin tarjeta grafica aunque mas lento.
- Integracion con el ecosistema Ultralytics (carga via `YOLO(path)` y `model.predict`).
- El pipeline complementario anade estimacion de movimiento de vehiculos (estacionario/en movimiento) y evaluacion de idoneidad de zonas de aterrizaje mediante reglas de imagen, no directamente desde el modelo.
- Exportacion de resultados a CSV con codigos de estado para movimiento y aterrizaje.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un detector de vision, no un modelo de lenguaje).

## Casos de uso

- Monitorizacion de trafico aereo urbano: el modelo detecta vehiculos y personas en imagenes cenitales de drones, permitiendo inventariar ocupacion de vias y zonas en tiempo real con inferencia a 1280 px.
- Gestion de zonas de aterrizaje para movilidad aerea: identifica las marcas UAP y UAI en imagenes aereas, y el pipeline complementario evalua si la zona parece despejada, util para sistemas de asistencia al aterrizaje de drones y eVTOL.
- Vigilancia de aparcamientos y areas restringidas: deteccion de vehiculos y personas en recintos delimitados para control de acceso o seguridad perimetral desde dron.
- Analisis de video de vuelo: procesamiento de secuencias de hasta 600 fotogramas para estimar movimiento de vehiculos (estacionario vs. en movimiento) mediante comparacion de fotogramas consecutivos.
- Investigacion en vision aerea: base de comparacion y punto de partida para experimentos de deteccion de objetos pequenos en perspectiva cenital, con pesos ligeros (20,5 MB) y despliegue sencillo.
- Prototipado rapido con interfaz web: el repositorio complementario ofrece una demo en navegador (Gradio en el puerto 7860) sin necesidad de programar, util para validar casos de uso antes de integrar en produccion.
- Generacion de informes geoespaciales: exportacion de detecciones a CSV para su analisis en hojas de calculo o su integracion en sistemas GIS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; por el tamano del checkpoint (20,5 MB) y la resolucion de entrada (1280 px), es un modelo ligero que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU NVIDIA con soporte CUDA es apta; una RTX 4090 o superior ofrecera la mayor velocidad, aunque el modelo es lo bastante pequeno para GPUs de gama media.
- Cabe en GPU de consumo: si, por el reducido tamano del checkpoint; el autor confirma que la inferencia en CPU funciona sin tarjeta grafica (aunque puede tardar).
- Opciones de despliegue: Ultralytics (Python), con soporte de inferencia en CPU y CUDA; el pipeline complementario usa Gradio para la interfaz web. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de vision).
- Latencia y throughput estimados: no disponibles. El autor indica que el procesamiento en CPU "puede tardar" y que CUDA acelera la inferencia, sin cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. Como referencia cualitativa, el modelo se encuadra en la familia YOLO (Ultralytics) y comparte ecosistema con otros detectores de la misma libreria, pero no se aportan cifras que permitan una comparacion rigurosa de parametros, contexto o rendimiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| YOLO26s aerial UAV (este modelo) | no disponible | no aplica | AGPL-3.0 | HuggingFace |
| Alternativas de la familia YOLO | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de proposito muy especifico: las clases UAP y UAI corresponden a marcas concretas de la competicion TEKNOFEST, no a cualquier zona de aterrizaje real.
- La evaluacion de idoneidad de aterrizaje es una estimacion basada en reglas de imagen, no una prueba de seguridad real; el autor lo advierte explicitamente.
- Una sola foto no permite establecer movimiento; los objetos nuevos o no emparejados se marcan como estacionarios por defecto.
- Posible confusion entre los identificadores de clase del checkpoint y los del pipeline: los dos sistemas numeran las clases de aterrizaje de forma distinta (UAI y UAP intercambian IDs), lo que exige mapeo por nombre.
- Riesgo de sesgo y alucinacion no documentado; no hay informacion sobre la diversidad del dataset de entrenamiento ni sobre falsos positivos/negativos.
- Sin datos de benchmarks ni evaluacion independiente publicada.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere liberar el codigo fuente derivado. Revisar compatibilidad antes de integrar en productos propietarios.
- Sin soporte linguistico ni de texto: no es un modelo de lenguaje, por lo que no debe evaluarse con criterios de LLM.
- El repositorio contiene solo la model card y metadatos; la demo y el codigo estan en un repositorio externo de GitHub.
- Limite de 600 fotogramas para video y 100 imagenes por solicitud en el pipeline complementario; el video de salida no incluye audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Has1tas/yolo26s-aerial-uav
- Repositorio del pipeline y demo: https://github.com/hasbitas/aerial-detection-pipeline
- Documentacion de Ultralytics: no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible en la informacion proporcionada
