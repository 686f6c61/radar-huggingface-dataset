# mvdelibas/turkiye-arac-yaya-yolo11s

## Resumen

`turkiye-arac-yaya-yolo11s` es un detector de objetos basado en la arquitectura YOLO11s de Ultralytics, ajustado por el autor mvdelibas para identificar ocho clases de usuarios de la via en imagenes de calle de Turquia: turismo, furgoneta/minibus, autobus, camion, motocicleta, bicicleta, peaton y conductor (persona sobre bicicleta o motocicleta). El modelo resuelve la deteccion de trafico rodado en escenarios especificos del pais, donde los modelos genericos entrenados con COCO no distinguen bien categorias como dolmus, metrobus o vehiculos comerciales ligeros habituales en el parque movil turco.

La relevancia del modelo es doble. Por un lado, esta orientado a equipos de conduccion autonoma (competiciones TeknoFest Robotaksi), conteo y analisis de trafico y proyectos de ciudad inteligente. Por otro, su model card documenta de forma poco habitual la procedencia de las etiquetas: solo el 10,6 % de las imagenes de entrenamiento (2.976) tiene supervision parcial mediante segmentacion panoptica de Mapillary, Grounding DINO y un VLM alojado en la plataforma nacional turca EVREN, mientras que el 89,4 % restante (25.125 imagenes) usa pseudoetiquetas generadas por consenso de modelos. Esto convierte al modelo en un caso interesante para estudiar hasta que punto un detector puede entrenarse con etiquetas sinteticas.

El repositorio ocupa 0,1 GB y contiene pesos en formato PyTorch (`.pt`), ademas de exportaciones ONNX segun las etiquetas del repositorio. La licencia es CC BY-SA 4.0, lo que impone obligaciones de atribucion y compartir-al-igual en obras derivadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se menciona exportacion ONNX en las etiquetas del repositorio) |
| Idiomas soportados | no aplica (vision); etiquetas de clase en turco |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) y ONNX |
| Clases | 8: `otomobil`, `kamyonet_minibus`, `otobus`, `kamyon`, `motosiklet`, `bisiklet`, `yaya`, `surucu` |
| Resolucion de inferencia recomendada | 1024 px (`imgsz=1024` en el ejemplo del autor) |
| Umbral de confianza sugerido | 0,3 (`conf=0.3` en el ejemplo del autor) |

## Arquitectura y entrenamiento

El modelo es un YOLO11s, la variante pequena de la familia YOLO11 de Ultralytics. Se trata de un detector de una etapa con backbone convolucional y cabecera de prediccion densa, sin mecanismos de atencion especificos documentados en la informacion disponible. El autor no detalla el numero de parametros, la composicion exacta del backbone ni la funcion de perdida empleada.

El entrenamiento se realizo en dos rondas sobre el mismo conjunto de datos y la misma particion. La primera version (`arac-yaya-mapillary-yolo11s`) incorporaba aumentos de datos inadecuados para escenas de calle (volteo vertical y rotaciones); la version r2 que documenta esta ficha se reentreno con `flipud=0` y `degrees=0`, lo que elevo el mAP@50 del 70,65 % al 75,58 % (+4,9 puntos) y mejoro el AP50 en las ocho clases. El conjunto total asciende a 28.101 imagenes: 2.976 (10,6 %) con etiquetas supervisadas por segmentacion panoptica de Mapillary, Grounding DINO y un VLM de EVREN, y 25.125 (89,4 %) con pseudoetiquetas generadas por consenso entre un YOLO11s profesor entrenado con la primera version, YOLO11x de COCO y detecciones panopticas de Mapillary para imagenes de 2022 en adelante. Las cajas con clase contradictoria se resolvieron parcialmente consultando al VLM. No se menciona uso de RLHF ni DPO, algo esperable en un detector.

Una particularidad del pipeline es el enmascaramiento de objetos irrelevantes: en las imagenes de entrenamiento, los objetos demasiado pequenos (raiz cuadrada del area de la caja menor de 14 px), de clase ambigua o fuera del conjunto de clases se pintaron con rectangulos grises (114,114,114) como region de ignorar, de modo que el modelo aprende a tratar el gris como fondo.

## Capacidades

- Deteccion de objetos en imagenes de calle con ocho clases de usuario de la via, con distincion entre vehiculo y persona que lo monta en el caso de bicicletas y motocicletas.
- Localizacion mediante cajas delimitadoras con puntuacion de confianza por deteccion, accesible a traves de la API de Ultralytics (`result.boxes`).
- Inferencia a resolucion configurable; el autor recomienda 1024 px para escenas de calle.
- Exportacion a ONNX segun las etiquetas del repositorio, lo que permite despliegue fuera del ecosistema PyTorch.
- Integracion directa con el ecosistema Ultralytics: carga mediante `YOLO(...)` y `hf_hub_download`.
- Capacidad multilingue: no aplica (modelo de vision); las etiquetas de clase estan en turco.
- Soporte de tool calling, agentes, razonamiento multi-paso, vision-lenguaje, audio o modo thinking: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Conteo y analisis de trafico: el modelo detecta turismos, furgonetas, autobuses, camiones, motocicletas y bicicletas en imagenes de calle, lo que permite agregar conteos por clase y franja horaria en estudios de movilidad urbana. La clase `otomobil` alcanza un AP50 del 95,6 %, adecuada para conteos dominados por turismos.
- Ciudad inteligente y planificacion urbana: procesamiento por lotes de imagenes de street-level para estimar ocupacion de carriles, presencia de transporte publico (`otobus`, `kamyonet_minibus`) y flujos peatonales en areas concretas de Turquia.
- Investigacion en conduccion autonoma: punto de partida para equipos de TeknoFest Robotaksi que necesiten un detector preentrenado con clases locales; el modelo distingue dolmus y metrobus, categorias ausentes en COCO.
- Etiquetado asistido y pre-anotacion: usar el modelo como generador de propuestas de cajas para acelerar el etiquetado humano de nuevos conjuntos turcos, con revision manual posterior dado el origen sintetico de sus etiquetas.
- Analisis de seguridad vial: deteccion de peatones (`yaya`) y conductores de dos ruedas (`surucu`) para estudiar exposicion de usuarios vulnerables en intersecciones o cruces concretos.
- Prototipado rapido en borde: al ser YOLO11s y existir exportacion ONNX, puede integrarse en dispositivos con recursos limitados para demos de conteo en directo, previa validacion del dominio objetivo.
- Estudio de aprendizaje con pseudoetiquetas: el modelo y su model card sirven como referencia metodologica para investigar la degradacion de rendimiento cuando el 89,4 % de las etiquetas son sinteticas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). La validacion se realizo sobre 4.111 imagenes separadas por secuencia, de las cuales 3.636 corresponden a pseudoetiquetas de la version 2 y 475 a etiquetas supervisadas por VLM de la version 1. El propio autor advierte que estas cifras miden principalmente la concordancia con el pipeline de etiquetado, no la precision en el mundo real.

| Metrica | r2 (este modelo) | Primera version |
|---|---|---|
| mAP@50 | 75,58 % | 70,65 % |
| mAP@50-95 | 59,05 % | 53,73 % |
| Precision | 80,36 % | 73,98 % |
| Recall | 70,22 % | 65,29 % |
| F1 | 74,2 % | 68,0 % |

| Clase | AP50 | Precision | Recall | F1 | AP50 (primera version) |
|---|---|---|---|---|---|
| `otomobil` | 95,6 % | 92,0 % | 91,1 % | 91,6 % | 94,7 % |
| `kamyonet_minibus` | 91,1 % | 83,0 % | 85,4 % | 84,2 % | 89,4 % |
| `kamyon` | 86,2 % | 79,5 % | 80,2 % | 79,9 % | 83,4 % |
| `yaya` | 82,4 % | 89,4 % | 73,1 % | 80,4 % | 79,5 % |
| `motosiklet` | 81,2 % | 85,5 % | 72,7 % | 78,6 % | 75,9 % |
| `otobus` | 79,0 % | 76,9 % | 72,7 % | 74,7 % | 71,4 % |
| `surucu` | 65,9 % | 79,5 % | 60,6 % | 68,8 % | 60,0 % |
| `bisiklet` | 23,1 % | 57,1 % | 25,6 % | 35,3 % | 10,8 % |

El autor reporta ademas una medicion independiente del pipeline de etiquetado sobre las 475 imagenes de validacion v1 que el modelo profesor nunca vio: la precision por clase de la version 2 del pipeline (profesor + COCO + Mapillary, sin VLM) frente a las etiquetas v1 alcanza el 93 % a nivel de clase, con precision a nivel de familia (vehiculo / dos ruedas / persona) truncada en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia de la familia YOLO11s, la inferencia en FP32 a 1024 px suele requerir del orden de 2-4 GB de VRAM, pero el autor no publica mediciones.
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo, una GPU consumer reciente es suficiente para inferencia; para entrenamiento o lotes grandes conviene una GPU de centro de datos (A100, H100) o una RTX 4090.
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 4 GB o mas de VRAM; no confirmado por el autor.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime a partir de la exportacion ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `turkiye-arac-yaya-yolo11s` (este) | no disponible (YOLO11s) | 8 clases de trafico turco | 1024 px recomendado | CC BY-SA 4.0 | Hugging Face, EVREN |
| YOLO11s preentrenado en COCO (Ultralytics) | no disponible | 80 clases genericas COCO | configurable | AGPL-3.0 / comercial Ultralytics | Ultralytics, GitHub |
| YOLO11x preentrenado en COCO (Ultralytics) | no disponible | 80 clases genericas COCO | configurable | AGPL-3.0 / comercial Ultralytics | Ultralytics, GitHub |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada: el autor solo compara su version r2 con la primera version del mismo modelo. Frente a los pesos COCO de Ultralytics, la diferencia principal es la especializacion en clases locales turcas y la licencia CC BY-SA 4.0, distinta de la AGPL-3.0 de Ultralytics.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son en su mayoria sinteticas (89,4 % pseudoetiquetas) y ninguna fue verificada individualmente por humanos; los benchmarks miden concordancia con el pipeline de etiquetado, no precision real.
- La clase `bisiklet` es claramente debil (AP50 del 23,1 %, recall del 25,6 %) por la escasez de ejemplos (321 cajas en todo el conjunto); no es fiable para conteo de bicicletas.
- La clase `surucu` es de rendimiento medio (AP50 del 65,9 %, recall del 60,6 %).
- El recall cae en escenas densas y con objetos pequenos o lejanos, segun advierte el autor.
- Sesgos conocidos: el modelo esta entrenado exclusivamente con imagenes de Turquia procedentes de Mapillary, por lo que puede generalizar mal a otros paises, condiciones de iluminacion o tipos de camara no representados.
- Riesgo de falsos positivos y negativos derivado de la supervision sintetica; se recomienda validacion en el dominio de despliegue antes de produccion.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribucion y que las obras derivadas se compartan bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- El modelo es experimental segun sus propias etiquetas; no hay garantias de soporte ni mantenimiento.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento textual ni capacidades multilingues mas alla de las etiquetas de clase en turco.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/turkiye-arac-yaya-yolo11s
- Registro en EVREN (plataforma nacional de IA de Turquia): https://evren.ssyz.org.tr/users/u43bd0650c87e
- Ultralytics (framework y familia YOLO11): https://github.com/ultralytics/ultralytics
- Mapillary (fuente de imagenes y segmentacion panoptica): https://www.mapillary.com/
- Grounding DINO (generador de etiquetas): https://github.com/IDEA-Research/GroundingDINO
