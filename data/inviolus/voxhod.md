# inviolus/VoxHOD

## Resumen

VoxHOD es un detector de personas disenado especificamente para camaras cenitales de drones en misiones de busqueda y rescate. Lo desarrolla inviolus y se distribuye bajo licencia CC BY 4.0. Su propuesta central es la eficiencia extrema: el modelo completo tiene 136.547 parametros y ocupa 197 KB en formato TFLite int8, mientras que la variante nano baja a 37.363 parametros y 75 KB. Esto lo situa en la categoria TinyML, pensado para ejecutarse en microcontroladores de la clase ESP32-S3 y ESP32-P4.

La arquitectura es un detector estilo CenterNet, anchor-free, que procesa teselas RGB de 160x160 y produce una rejilla de 40x40 (stride 4) con un mapa de calor de centros de persona y canales de anchura y altura de caja en escala logaritmica. El modelo no genera texto ni razona: es un detector de objetos puro que marca donde hay personas en una imagen aerea para que el dron senale zonas que merecen una inspeccion mas cercana por parte del equipo de rescate.

Su relevancia actual radica en que demuestra que la deteccion de personas en vuelo puede ejecutarse a bordo de hardware de muy bajo consumo, sin enviar imagenes a un servidor. Los resultados publicados en HERIDAL (recall del 83,9% a umbral 0,2) y las pruebas en terreno no visto (WiSARD y NOMAD) ofrecen una vision realista de sus limites: el recall cae al 61% en camaras no vistas y la tasa de falsos positivos por tesela vacia se multiplica por casi cuatro en terreno desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CenterNet anchor-free (CNN), sin backbone especificado en la model card |
| Parametros totales | 136.547 (variante completa); 37.363 (variante nano) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 160x160 RGB) |
| Tipos de cuantizacion | int8 full (QAT y PTQ); modelo float en `.keras` |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | TFLite (`.tflite`) y Keras (`.keras`) |

## Arquitectura y entrenamiento

VoxHOD es un detector convolucional estilo CenterNet, anchor-free, construido y entrenado desde cero. La entrada es una tesela RGB de 160x160 normalizada con `pixel / 127.5 - 1`. La salida es una rejilla de 40x40 con stride 4: el canal 0 contiene el mapa de calor de centros de persona (0 a 1), y los canales 1 y 2 contienen el logaritmo de la anchura y altura de la caja en celdas de la rejilla. Las detecciones se obtienen como maximos locales del canal 0 por encima de un umbral, lo que permite ajustar el compromiso entre recall y falsos positivos en tiempo de inferencia.

El entrenamiento se realizo sobre teselas derivadas de fotografias aereas de 4000x3000, recortadas a 640x640 y reescaladas a 160. La model card indica que solo el 29% de las teselas de entrenamiento estan vacias, frente al 91% de las teselas de test, un desequilibrio que el propio autor identifica como causa principal de falsos positivos. Se ofrecen dos variantes: la completa, con cuantizacion consciente del entrenamiento (QAT) en int8, y la nano, con la mitad de anchura y cuantizacion post-entrenamiento (PTQ). No se detalla en la informacion disponible el numero total de tokens ni la composicion exacta del dataset, ni si se uso RLHF o DPO (no aplicable a un detector).

## Capacidades

- Deteccion de personas en imagenes aereas cenitales (vista hacia abajo desde dron).
- Salida de cajas delimitadoras con centro, anchura y altura, mas una puntuacion de confianza por deteccion.
- Funcionamiento en microcontroladores de la clase ESP32 (ESP32-S3, ESP32-P4, ESP32-C6) gracias a su huella de memoria minima.
- Inferencia int8 completa con entrada y salida cuantizadas, apta para aceleradores y kernels TFLite Micro.
- Ajuste de sensibilidad mediante umbral en el mapa de calor (0,1 / 0,2 / 0,3 documentados).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector visual.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Busqueda y rescate con dron: el modelo procesa teselas de 160x160 en vuelo y marca centros de persona con su caja estimada, permitiendo al dron senalar coordenadas sospechosas para que el equipo de rescate las revise con mayor resolucion o se desplace a ellas.
- Vigilancia de areas remotas con hardware de bajo coste: al caber en un ESP32-S3, puede integrarse en camaras autonomas alimentadas por bateria o panel solar que solo emiten alertas cuando detectan una persona, sin transmitir video continuo.
- Pre-filtrado en pipelines de imagen aerea: usar VoxHOD como primera etapa para descartar teselas vacias y enviar solo las candidatas a un modelo mayor como VoxScout (EfficientNet-B0) o a un operador humano, reduciendo ancho de banda y coste computacional.
- Balizas de emergencia inteligentes: dispositivos desplegados en zonas de montana que fotografian periodicamente su entorno y alertan si detectan una persona, con consumo energetico compatible con microcontroladores.
- Investigacion en TinyML: referencia reproducible para estudiar el compromiso entre recall, precision y falsos positivos en deteccion aerea con presupuestos de memoria de decenas de KB.
- Monitorizacion de instalaciones extensas: deteccion de intrusiones en recintos industriales o agricolas mediante drones de bajo coste con inferencia a bordo, sin infraestructura de servidores.
- Docencia y prototipado: modelo pequeno y con licencia permisiva para ensenar cuantizacion int8, QAT y despliegue en TFLite Micro con un caso realista.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test HERIDAL (3.507 teselas, 372 personas). Una deteccion cuenta como acierto si su centro cae dentro de la caja de la persona expandida una celda de rejilla.

| Fichero int8, umbral | Recall | Precision | Falsos positivos por tesela |
|---|---:|---:|---:|
| v3 QAT, 0,30 | 76,6% | 32,5% | 0,17 |
| v3 QAT, 0,20 | 83,9% | 20,4% | 0,35 |
| v3 QAT, 0,10 | 88,7% | 7,7% | 1,12 |
| nano PTQ, 0,30 | 72,3% | 25,8% | 0,22 |
| nano PTQ, 0,20 | 81,2% | 12,7% | 0,59 |
| nano PTQ, 0,10 | 89,5% | 4,8% | 1,87 |

Verificacion externa en WiSARD (264 fotogramas de otra camara, 6.336 teselas, 1.271 personas, nunca visto en entrenamiento):

| Fichero int8, umbral | Recall | Precision | Falsos positivos por tesela |
|---|---:|---:|---:|
| v3 QAT, 0,20 | 61,3% | 19,1% | 0,52 |
| nano PTQ, 0,20 | 62,2% | 13,4% | 0,81 |

Falsos positivos en terreno no visto (NOMAD, 4.000 teselas vacias, umbral 0,2):

| Fichero int8 | HERIDAL vacias | NOMAD global | 10 m | 30 m | 50 m | 70 m | 90 m |
|---|---:|---:|---:|---:|---:|---:|---:|
| v3 | 0,34 | 1,29 | 1,10 | 1,11 | 1,39 | 1,35 | 1,49 |
| nano | 0,60 | 1,43 | 1,34 | 1,25 | 1,47 | 1,54 | 1,56 |

Analisis de errores de v3 en HERIDAL a umbral 0,2: el 89% de los falsos positivos ocurren en teselas sin nadie; las personas de 8 a 16 px de altura se detectan el 77% de las veces, y las mayores el 90%.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo esta pensado para RAM de microcontrolador. El fichero int8 completo ocupa 197 KB y el nano 75 KB, mas el arena de ejecucion de TFLite Micro.
- GPU recomendadas: no requiere GPU. Puede ejecutarse en CPU, en microcontroladores ESP32 y en cualquier dispositivo con TFLite o TensorFlow Lite Micro.
- Cabe en GPU consumer: si, en cualquier GPU consumer, aunque es sobredimensionado para ellas; su objetivo real son MCU.
- Opciones de despliegue: TensorFlow Lite (Python, C++), TensorFlow Lite Micro en ESP32-S3/P4/C6, y Keras para el modelo float.
- Latencia y throughput: la model card indica que en ESP32-P4 el modelo encuentra personas en teselas reales al mismo ritmo que en PC; no se proporcionan cifras concretas de milisegundos por inferencia en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxHOD (completo) | 136.547 | 160x160 RGB | Deteccion de personas aerea | CC BY 4.0 | Hugging Face + GitHub |
| VoxHOD nano | 37.363 | 160x160 RGB | Deteccion de personas aerea | CC BY 4.0 | Hugging Face + GitHub |
| VoxScout | no disponible | no disponible | Deteccion de personas aerea (EfficientNet-B0) | no disponible en la informacion | Hugging Face (proyecto separado del mismo autor) |

No se dispone en la informacion proporcionada de datos de benchmarks de VoxScout ni de otros detectores TinyML comparables, por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Caida de recall en camaras no vistas: en WiSARD el recall baja al 61,3% (v3) y 62,2% (nano) a umbral 0,2, frente al 83,9% y 81,2% en HERIDAL.
- Aumento de falsos positivos en terreno desconocido: en NOMAD, v3 pasa de 0,34 a 1,29 falsos positivos por tesela vacia, y empeora con la altitud de vuelo (1,49 a 90 m). A umbral 0,3 baja a 0,74.
- Desequilibrio de entrenamiento: solo el 29% de las teselas de entrenamiento estan vacias frente al 91% en test, lo que explica que el 89% de los falsos positivos ocurran en teselas sin personas.
- Precision baja en el punto de operacion recomendado: al 83,9% de recall la precision es solo del 20,4%, es decir, muchas detecciones son falsas alarmas que requieren verificacion humana.
- Rendimiento dependiente del tamano de persona: las personas de 8 a 16 px se detectan el 77% de las veces, frente al 90% en personas mayores.
- Sin capacidades de lenguaje, razonamiento ni tool calling: no es un modelo de proposito general.
- Licencia CC BY 4.0: permite uso comercial con atribucion; conviene revisar los terminos exactos antes de desplegar en produccion.
- No se documentan sesgos demograficos ni de otro tipo, pero al ser un detector visual entrenado en datasets aereos concretos puede generalizar mal a condiciones de iluminacion, vegetacion o camaras distintas a las de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inviolus/VoxHOD
- Codigo y detalles de entrenamiento: https://github.com/ErdemWilkinson/VoxHOD
- Modelo hermano VoxScout: https://huggingface.co/inviolus/VoxScout
- Dataset NOMAD: https://github.com/ArtRuss/NOMAD
