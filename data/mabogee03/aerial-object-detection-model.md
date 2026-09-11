# mabogee03/Aerial-Object-Detection-Model

## Resumen

Aerial Plane-Ship-Harbour-Vehicle Detector es un modelo de deteccion de objetos basado en YOLOv8, publicado por el usuario mabogee03 (mabogiqwa) en Hugging Face. El modelo esta entrenado para identificar cinco clases en imagenes aereas: plane, ship, harbor, large-vehicle y small-vehicle (la propia model card se contradice al hablar primero de "cuatro clases" y despues de "5 clases total"). Fue desarrollado para el hackathon inaugural de UNISA y se desplego como backend de un Space de Hugging Face, con un frontend HTML que embebe el Space mediante un iframe.

El modelo se entrena sobre el dataset DOTA v1.0, un corpus de referencia en deteccion de objetos en imagenes aereas y de teledeteccion. El flujo de inferencia es sencillo: el usuario sube una imagen aerea, la peticion se reenvia al Space, YOLOv8 ejecuta la deteccion y se devuelve la imagen anotada junto con un recuento de objetos por clase.

Su relevancia es limitada y fundamentalmente academica o experimental. Se trata de un artefacto de hackathon con 0 descargas y 0 likes en el momento de la consulta, entrenado con solo 1.302 imagenes y con un recall global de 0,306, lo que indica que omite mas objetos reales de los que detecta. Es util como punto de partida reproducible y como caso de estudio de las limitaciones tipicas de la deteccion aerea de objetos pequenos, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (detector de objetos de una etapa) |
| Parametros totales | no disponible (el autor no especifica la variante n/s/m/l/x) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la entrada es una imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (etiquetas de clase en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio declara 0,0 GB, por lo que los pesos podrian no estar publicados) |

## Arquitectura y entrenamiento

YOLOv8 es una familia de detectores de objetos de una sola etapa (single-stage, anchor-free en sus variantes modernas) que predice cajas delimitadoras y clases directamente sobre una rejilla de caracteristicas, con un backbone CNN y una cabeza de deteccion desacoplada. El autor no detalla la variante concreta empleada (n, s, m, l o x), ni el numero de parametros, ni la resolucion de entrada, ni los hiperparametros de entrenamiento, por lo que estos datos figuran como no disponibles.

El entrenamiento se realizo sobre el dataset DOTA v1.0 con 1.302 imagenes de entrenamiento y 109 de validacion, en Google Colab con acelerador TPU. Este ultimo punto es un caveat tecnico relevante: el pipeline oficial de YOLOv8 esta optimizado para CUDA, y el soporte de TPU para este framework no es estandar, lo que puede dificultar la reproduccion exacta del entrenamiento. La model card incluye instrucciones para preparar el dataset en formato YOLO con estructura de directorios images/labels y splits training/val, pero no documenta el numero de epocas, el optimizador, el learning rate ni si hubo aumento de datos o tecnicas de mejora para objetos pequenos. No consta que se aplicaran RLHF, DPO ni tecnicas equivalentes, algo que no aplica a un detector de objetos.

## Capacidades

- Deteccion de objetos en imagenes aereas con cinco clases: plane, ship, harbor, large-vehicle y small-vehicle.
- Salida de cajas delimitadoras con imagen anotada y recuento de objetos por clase.
- Deteccion de aviones con rendimiento notablemente superior al resto de clases: precision 0,762, recall 0,721, F1 0,741 y mAP@0.5 de 0,727.
- Deteccion fiable (en terminos de precision) de barcos y vehiculos grandes: precision superior a 0,65 en ambas clases, aunque con recall bajo.
- Integracion como backend de un Space de Hugging Face, consumible desde un frontend HTML embebido por iframe.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision generativa, audio ni modo de pensamiento (thinking).
- No se documenta soporte de tool calling, function calling ni de agentes multi-paso; no aplica a este tipo de modelo.
- Capacidades multilingues: no aplica; el modelo opera sobre pixeles y las etiquetas de clase estan en ingles.

## Casos de uso

- Monitorizacion de trafico maritimo en puertos: el modelo puede detectar barcos y puertos (harbor) en imagenes satelitales, aunque con recall bajo (0,279 y 0,174 respectivamente), por lo que seria necesario combinarlo con revision humana para no perder instancias.
- Conteo de aeronaves en plataformas aeroportuarias: es el escenario donde el modelo rinde mejor, con mAP@0.5 de 0,727 en la clase plane, adecuado para estimaciones de ocupacion de pistas y estacionamientos.
- Inventario de vehiculos en imagenes aereas de gran escala: util unicamente para vehiculos grandes; la clase small-vehicle presenta un recall de 0,060, por lo que en la practica la mayoria de vehiculos pequenos quedaran sin detectar.
- Prototipado academico y docencia en teledeteccion: sirve como ejemplo reproducible de entrenamiento de YOLOv8 sobre DOTA v1.0 en Google Colab, con validacion sobre 109 imagenes.
- Base para fine-tuning especifico: al estar bajo licencia MIT, puede usarse como punto de partida y reentrenarse con mas datos de las clases debiles (small-vehicle y harbor), que son las que concentran el fallo.
- Demostraciones interactivas en web: su despliegue como Space con frontend embebido permite montar una demo de subida de imagen y visualizacion de detecciones sin infraestructura propia.
- Triaje previo en flujos de analisis geoespacial: descartar imagenes sin objetos de interes antes de pasarlas a un modelo mas costoso, asumiendo que su bajo recall puede dejar pasar escenas relevantes.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion (109 imagenes), segun los datos publicados por el autor.

| Metrica | Valor |
|---|---|
| Precision | 0,692 |
| Recall | 0,306 |
| F1 | 0,424 |
| mAP@0.5 | 0,363 |
| mAP@0.5:0.95 | 0,192 |

| Clase | Precision | Recall | F1 | mAP@0.5 | mAP@0.5:0.95 |
|---|---|---|---|---|---|
| plane | 0,762 | 0,721 | 0,741 | 0,727 | 0,390 |
| ship | 0,768 | 0,279 | 0,410 | 0,416 | 0,178 |
| large-vehicle | 0,690 | 0,296 | 0,414 | 0,343 | 0,237 |
| harbor | 0,516 | 0,174 | 0,260 | 0,198 | 0,098 |
| small-vehicle | 0,724 | 0,060 | 0,111 | 0,130 | 0,054 |

No se han publicado comparaciones directas con otros modelos en la informacion disponible. Los unicos resultados son los de la tabla anterior, correspondientes al propio modelo sobre su split de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende de la variante de YOLOv8, que el autor no especifica. Como referencia general de la familia (no confirmada para este modelo concreto), las variantes nano y small suelen operar por debajo de 2 GB de VRAM en FP16 a 640x640.
- GPU recomendadas: no disponibles en la informacion proporcionada. El entrenamiento se realizo sobre TPU en Google Colab, no sobre GPU.
- Compatibilidad con GPU de consumo: probable si se trata de una variante pequena de YOLOv8 y los pesos estan disponibles, pero no confirmado por el autor.
- Opciones de despliegue: se ha desplegado como Space de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que en cualquier caso no aplican a un detector de objetos. El despliegue natural seria via Ultralytics o exportando a ONNX, TensorRT o CoreML, aunque ninguna de estas rutas esta documentada.
- Latencia y throughput: no disponibles.
- Caveat importante: el repositorio declara un tamano de 0,0 GB, por lo que es posible que los pesos entrenados no esten efectivamente publicados y el modelo solo sea reproducible reentrenando con el dataset DOTA v1.0.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas verificables de categoria.

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aerial Plane-Ship-Harbour-Vehicle Detector | no disponible | imagen aerea | mAP@0.5 0,363; recall 0,306 | MIT | Hugging Face (0 descargas, repositorio de 0,0 GB) |
| Detectores YOLOv8 genericos preentrenados en COCO | no disponible | imagen | no disponible | AGPL-3.0 (Ultralytics) | ampliamente disponibles |
| Modelos de referencia sobre DOTA v1.0 (por ejemplo, detectores orientados) | no disponible | imagen aerea | no disponible | variable | variable |

No se conocen modelos comparables con datos publicados en la informacion disponible. Cualquier comparacion numerica adicional requeriria ejecutar una evaluacion propia sobre el mismo split de validacion.

## Limitaciones y advertencias

- El recall global es de 0,306: el modelo omite mas objetos reales de los que detecta. En terminos practicos, la mayoria de instancias presentes en una imagen no se localizan.
- La deteccion de vehiculos pequenos es practicamente inutilizable: recall de 0,060 y F1 de 0,111. Aunque la precision es razonable (0,724), el modelo solo acierta en una fraccion minima de los casos reales.
- La deteccion de puertos (harbor) es la segunda clase mas debil, con precision 0,516 y recall 0,174.
- Las clases ship y large-vehicle quedan en un termino medio: precision superior a 0,65 pero recall por debajo de 0,30.
- El modelo se contradice en la propia model card al declarar cuatro clases y enumerar cinco; conviene verificar el orden e identificadores de clase antes de integrarlo.
- Entrenamiento con solo 1.302 imagenes, un volumen reducido para DOTA v1.0, lo que explica en parte el bajo recall en clases con objetos pequenos y densos.
- Riesgo de sesgo por dominio: el modelo se ha entrenado exclusivamente con imagenes aereas de DOTA v1.0. Su comportamiento sobre otras condiciones de sensores, altitudes, resoluciones o zonas geograficas no esta documentado y probablemente degrade.
- No se documentan sesgos eticos ni demograficos, algo que no aplica directamente a un detector de objetos, aunque si son relevantes las implicaciones de vigilancia y monitorizacion asociadas a la teledeteccion.
- La licencia MIT permite uso comercial, modificacion y redistribucion sin restricciones, siempre que se conserve el aviso de copyright. El copyright declarado es de 2025 mabogiqwa. La licencia MIT es mas permisiva que la AGPL-3.0 habitual en los pesos preentrenados de Ultralytics, por lo que conviene revisar la procedencia de los pesos base para evitar conflictos.
- El repositorio aparece con 0,0 GB de tamano, lo que sugiere que los pesos podrian no estar incluidos; verificar antes de planificar su uso.
- No hay informacion sobre cuantizacion, formato de pesos ni latencia, lo que dificulta estimar costes de despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mabogee03/Aerial-Object-Detection-Model
- Dataset DOTA v1.0: https://captain-whu.github.io/DOTA/
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas realizadas han devuelto unicamente resultados sobre las islas Malvinas (Wikipedia, Britannica, gov.fk, falklandislands.com), sin relacion alguna con este modelo ni con deteccion de objetos.
