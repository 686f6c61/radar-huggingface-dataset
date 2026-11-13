# Seemorgh/yolo11n-v8-drone-or-bird

## Resumen

YOLO11n v8: drone or bird es un checkpoint de deteccion de objetos derivado de Ultralytics YOLO11n, ajustado por el autor Seemorgh a partir de su modelo previo `yolo11n-aod4-v7-small-targets`. El modelo resuelve un problema muy concreto: distinguir drones pequenos de aves en fotogramas de alta resolucion, una tarea propensa a falsos positivos porque ambos son objetos pequenos, con formas y trayectorias similares, vistos desde camaras terrestres o aereas. La salida tiene cuatro clases: `airplane`, `bird`, `drone` y `helicopter`.

La relevancia practica del modelo no esta en su tamano (YOLO11n es la variante nano de la familia, pensada para inferencia ligera) sino en el protocolo de evaluacion: el autor congela umbrales y reglas del tracker sobre validacion antes de puntuar el test, y publica los registros por candidato para que cada cifra sea reproducible sin GPU. Sobre el test de LRDD v3 (18.732 drones en 20.020 imagenes) el detector llama al 53,6 % de los drones con un 8,3 % de aves etiquetadas erroneamente como dron; con el tracker opcional, las aves mal clasificadas bajan a cero a costa de unos dos puntos de recall.

El modelo esta pensado para ejecutarse sobre teselas de 640 px con 20 % de solapamiento a resolucion nativa del fotograma, de forma que los objetos pequenos no se reduzcan hasta desaparecer. No es un sistema contramedidas completo ni se ha probado en tiempo real sobre movil; es un clasificador de camara con un pipeline de deteccion y seguimiento documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics), detector de una etapa, backbone CNN |
| Parametros totales | no disponible (variante nano de YOLO11; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; ventana de inferencia por tesela de 640 px) |
| Tipos de cuantizacion | no disponible (pesos `best.pt` en PyTorch; no se documentan exportaciones cuantizadas) |
| Idiomas soportados | no aplica (deteccion visual, sin componente de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `best.pt` (PyTorch, Ultralytics); SHA-256 `0b68317a124543d1496c5047b96b6f1449c479b5265d0f1f4ea27ea913695a2e` |

## Arquitectura y entrenamiento

El modelo es un YOLO11n, la variante mas pequena de la familia YOLO11 de Ultralytics: un detector de una etapa con backbone convolucional y cabezas de prediccion densa, entrenado para localizacion y clasificacion simultaneas. La innovacion del pipeline no esta en la red sino en el preprocesado: el detector recorre el fotograma a resolucion nativa en teselas de 640 px con 20 % de solapamiento, fusiona los candidatos y considera "llamada de dron" cualquier deteccion con etiqueta `drone` y confianza igual o superior a 0,60. El tracker opcional solo mira hacia atras (nunca a fotogramas posteriores), enlaza detecciones entre fotogramas, confirma una pista cuando alcanza 3 fotogramas y se ha desplazado al menos la mitad de su propio ancho, y asigna a cada deteccion la confianza maxima alcanzada por su pista.

El ajuste fino se hizo sobre 34.096 elementos: teselas de 640 px recortadas del split de entrenamiento de LRDD v3 sobre la propia rejilla de teselado del detector (cada tesela con objeto mas una tesela vacia por imagen, con 16.237 drones, 856 aves y 314 aviones) mas 6.000 imagenes de entrenamiento de AOD4 v6 para conservar las clases `airplane` y `helicopter`. La validacion uso 4.900 teselas del split de validacion de LRDD v3. Se entreno con SGD, `lr0=0.002`, `lrf=0.1`, sin capas congeladas, batch 64, semilla 0 y modo determinista, sobre Ultralytics 8.4.87, durante 20 epocas con paciencia 5; el entrenamiento se detuvo en la epoca 16 y el mejor checkpoint fue el de la epoca 11, con mAP50-95 de validacion 0,275. El test de LRDD no se leyo durante el entrenamiento ni durante la seleccion de checkpoint.

## Capacidades

- Deteccion de objetos en cuatro clases: `airplane`, `bird`, `drone` y `helicopter`.
- Discriminacion especifica entre dron pequeno y ave en fotogramas de alta resolucion, con umbral de decision fijado en 0,60 para la clase `drone`.
- Deteccion de objetos pequenos mediante teselado a resolucion nativa con 20 % de solapamiento, en lugar de reescalado global del fotograma.
- Fusion de candidatos entre teselas solapadas para evitar detecciones duplicadas.
- Seguimiento multi-fotograma opcional con logica causal (solo fotogramas pasados), confirmacion a 3 fotogramas y desplazamiento minimo de media anchura.
- Salida compatible con el ecosistema Ultralytics (`ultralytics` como libreria, pipeline `object-detection`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un detector visual puro.

## Casos de uso

- Vigilancia perimetral de espacios sensibles (aeropuertos, instalaciones criticas): el detector procesa fotogramas de camaras fijas de alta resolucion por teselas de 640 px y emite llamadas de dron a 0,60 de confianza; el tracker causal confirma pistas de 3 fotogramas antes de alertar, lo que reduce falsos positivos por aves.
- Monitorizacion de fauna aviar en entornos con trafico de drones: la clase `bird` permite separar aves de aeronaves y cuantificar la confusion; con el tracker, el autor reporta cero aves clasificadas como dron en el test de LRDD.
- Analisis forense de grabaciones: al ejecutarse sobre fotogramas ya capturados, el pipeline de teselado y fusion es adecuado para revisar material archivado y localizar apariciones de drones con registros por candidato auditables.
- Investigacion en deteccion de objetos pequenos: el repositorio `reproduce/` incluye codigo de entrenamiento, scoring, analisis y tracker, reglas congeladas y registros por candidato en validacion y test de LRDD, lo que permite rederivar cada cifra publicada sin GPU.
- Evaluacion comparativa de detectores en dominios aereos: sirve como linea base reproducible para medir recall por tamano de objeto (3 % por debajo de 8 px, 23 % entre 8 y 16 px, 58 % entre 16 y 32 px, 86 % entre 32 y 64 px) frente a alternativas.
- Prototipado de sistemas de alerta con camara: al ser un YOLO11n, el coste computacional es bajo y puede integrarse en pipelines de vision existentes basados en Ultralytics, siempre que se asuma que no se ha validado en tiempo real ni en movil.
- Deteccion de aeronaves y helicopteros en escenas aereas: las clases `airplane` y `helicopter`, conservadas mediante el ajuste con AOD4 v6, permiten reutilizar el modelo en tareas de conteo de trafico aereo de baja altitud.

## Benchmarks y rendimiento

Resultados publicados por el autor. Umbrales y ajustes del tracker fijados sobre validacion antes de puntuar el test; cada conjunto de test se puntuo una sola vez.

| Metrica (confianza 0,60) | v7 | v8 | v8 + tracker |
|---|---|---|---|
| LRDD test: drones llamados (18.732 drones, 20.020 imagenes) | 6,5 % (sobre LRDD val) | 53,6 % | 51,7 % |
| LRDD test: aves llamadas dron (1.998 aves) | 0 (sobre LRDD val) | 8 | 0 |
| LRDD test: llamadas espurias por imagen | no disponible | 0,071 | 0,054 |
| LRDD test: imagenes vacias sin llamada | no disponible | 92,3 % | 91,8 % |
| Drone-vs-Bird, 77 videos, cada 10.o fotograma: drones llamados | no disponible | 16,4 % | 18,2 % |
| Drone-vs-Bird: fotogramas vacios sin llamada | no disponible | 99,5 % | 99,9 % |

Recall de drones en el test de LRDD segun el lado corto del objeto (v8):

| Lado corto | Llamados |
|---|---|
| Menos de 8 px | 3 % |
| 8-16 px | 23 % |
| 16-32 px | 58 % |
| 32-64 px | 86 % |
| 64 px o mas | 73 % |

Validacion: mAP50-95 de 0,275 en el mejor checkpoint (epoca 11).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Por tratarse de un YOLO11n (variante nano), la huella es reducida y cabe holgadamente en GPUs de consumo, pero el autor no publica cifras.
- GPU recomendadas: no disponible. El modelo se ha evaluado en un pipeline de teselado de 640 px, no en tiempo real.
- Cabe en GPU de consumo: si, por el tamano de la variante nano; no se especifican modelos concretos.
- Opciones de despliegue: libreria `ultralytics` (formato `best.pt`); el autor no documenta exportaciones a ONNX, TensorRT, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI (estas dos ultimas no aplican a un detector visual).
- Latencia y throughput: no disponibles. El autor indica explicitamente que no se ha probado en movil ni en tiempo real.
- El repositorio `reproduce/` permite rederivar los numeros publicados sin GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11n v8 drone or bird (este modelo) | no disponible (variante nano) | Teselas de 640 px, resolucion nativa | 53,6 % de drones en LRDD test; 8 aves mal clasificadas; mAP50-95 val 0,275 | AGPL-3.0 | Hugging Face, 0 descargas |
| YOLO11n v7 (modelo base) | no disponible (variante nano) | Teselas de 640 px | 6,5 % de drones en LRDD val; 0 aves mal clasificadas en LRDD val | AGPL-3.0 | Hugging Face (`Seemorgh/yolo11n-aod4-v7-small-targets`) |
| YOLO11n estandar (Ultralytics) | no disponible (variante nano) | 640 px, reescalado global | No evaluado en LRDD ni Drone-vs-Bird en la informacion disponible | AGPL-3.0 | Amplia disponibilidad via Ultralytics |

No se dispone de datos de otros detectores comparables (por ejemplo, variantes YOLOv8n o RT-DETR) evaluados sobre LRDD v3 o Drone-vs-Bird en la informacion proporcionada.

## Limitaciones y advertencias

- Camaras nuevas: sobre Drone-vs-Bird, con material de camaras distintas a las de entrenamiento, el modelo coloca caja en el 69 % de los drones pero solo llama al 16-18 % a 0,60 de confianza. El autor lo identifica como su principal debilidad.
- Drones muy pequenos: por debajo de 8 px de lado corto se detectan casi siempre mal (3 % de recall).
- Etiquetado de Drone-vs-Bird: ese conjunto solo etiqueta drones; las aves se dejan deliberadamente como senuelos, de modo que las llamadas fuera de dron cuentan como falsos positivos pero no se pueden contabilizar aparte las llamadas de ave.
- El tracker cuesta unos 2 puntos de recall de drones en LRDD; la causa probable son drones cercanos y casi inmobiles, aunque el autor no lo ha verificado.
- Alcance: es un clasificador basado solo en camara, no un sistema contramedidas, y no se ha probado en movil ni en tiempo real.
- Licencia AGPL-3.0 (exigida por Ultralytics): impone obligaciones de copyleft sobre el codigo que lo integre y sobre la distribucion en red; conviene revisar el cumplimiento antes de uso comercial.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si existe riesgo de falsos positivos y falsos negativos, cuantificado en 0,054 llamadas espurias por imagen y 8,2 % de imagenes vacias con alguna llamada en LRDD test con tracker.
- Sesgos de dominio: el entrenamiento se apoya en LRDD v3 y AOD4 v6, por lo que el rendimiento puede degradarse con condiciones de iluminacion, sensores o altitudes no representadas.
- Atribuciones obligatorias: LRDD v3 (Drexel University, iMaPLe lab, CDLA-Permissive-2.0), AOD4 v6 (CC BY 4.0, Roboflow Universe, DOI 10.17632/cd5z895tr2.1), Purdue UAV dataset (BSD 3-Clause, Charles A. Bouman, 2022) y Drone-vs-Bird (uso solo bajo acuerdo de uso de datos, sin redistribucion).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Seemorgh/yolo11n-v8-drone-or-bird
- Modelo base: https://huggingface.co/Seemorgh/yolo11n-aod4-v7-small-targets
- Estudio de caso del autor (Small Objects): https://mehridian.tech/projects/small-object-detection
- Dataset AOD4 v6 en Roboflow Universe: https://universe.roboflow.com/airborne-object-detection/airborne-object-detection-4-aod4/dataset/6
- DOI de AOD4 v6: https://doi.org/10.17632/cd5z895tr2.1
- Purdue UAV dataset: https://engineering.purdue.edu/~bouman/UAV_Dataset/
- Paper Drone-vs-Bird (ICASSP 2023, IEEE OJSP 2024): https://doi.org/10.1109/OJSP.2024.3379073
- Codigo de reproduccion: `reproduce/` dentro del repositorio de Hugging Face (incluye `reproduce/common/track.py` y `reproduce/README.md`)
