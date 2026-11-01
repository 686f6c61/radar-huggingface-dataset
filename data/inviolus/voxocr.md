# inviolus/voxOCR

## Resumen

voxOCR es un detector de personas de tipo CenterNet, anchor-free, disenado para camaras de dron con vision cenital. Lo desarrolla el usuario inviolus y esta pensado para ejecutarse en microcontroladores de la clase ESP32-S3: consta de 136.547 parametros y su fichero TFLite full-int8 ocupa 197 KB. El modelo recibe un tile RGB de 160×160 pixeles y devuelve una rejilla de 40×40 (stride 4) con un mapa de calor de centros de persona y las dimensiones de la caja, de modo que un dron pueda marcar zonas que merezcan una inspeccion mas cercana por parte de un equipo de rescate.

El modelo resuelve un problema muy concreto: la deteccion de personas en imagenes aereas de busqueda y salvamento con un presupuesto computacional extremadamente bajo, hasta el punto de caber en un microcontrolador. Se entrena y evalua sobre el conjunto HERIDAL (entorno mediterraneo, verano, luz diurna) y alcanza un 82,5% de recall con 0,47 falsas alarmas por tile en la version int8 QAT con umbral 0,2. La version float no mejora de forma medible a la int8, lo que confirma que la cuantizacion agresiva no degrada la deteccion en este regimen.

Es relevante ahora porque demuestra que la deteccion de personas en vuelo puede ejecutarse en el propio dron sin depender de enlace de radio ni de computo en tierra, y porque el autor publica una version v3 en GitHub (entrenada 7 horas mas a partir de estos pesos) que alcanza el 83,9% de recall con 0,35 falsas alarmas por tile. La licencia CC BY 4.0 de los pesos y MIT del codigo de entrenamiento facilitan su reutilizacion y auditoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CenterNet anchor-free (deteccion de objetos por puntos clave) |
| Parametros totales | 136.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 160×160 RGB) |
| Tipos de cuantizacion | int8 full (QAT), int8 post-training, float |
| Idiomas soportados | no disponible (modelo de vision, sin modulo de lenguaje) |
| Licencia | CC BY 4.0 (pesos); MIT (codigo de entrenamiento) |
| Formato de pesos | TFLite (int8 QAT, int8 PTQ), Keras (.keras float) |

## Arquitectura y entrenamiento

voxOCR sigue el esquema CenterNet: una red convolucional que predice directamente un mapa de calor de centros de persona (canal 0, valores de 0 a 1) y, en los canales 1 y 2, el logaritmo de la anchura y la altura de la caja en celdas de la rejilla. La salida es de 40×40 con stride 4 sobre una entrada de 160×160 RGB normalizada con `pixel / 127.5 - 1`. Las detecciones se obtienen como maximos locales del mapa de calor por encima de un umbral, lo que permite ajustar el compromiso recall/falsas alarmas en tiempo de inferencia sin reentrenar.

El entrenamiento se realiza sobre HERIDAL (CC BY 3.0), un conjunto de imagenes aereas de busqueda y salvamento en terreno mediterraneo, verano y luz diurna. El modelo se distribuye en tres variantes: un fichero int8 con quantization-aware training (recomendado), un int8 post-training del modelo float y el modelo float en Keras. La innovacion principal es la combinacion de un diseno muy compacto (136.547 parametros) con QAT full-int8 que, segun la model card, no pierde rendimiento medible frente al modelo float. El autor indica que la version v3 en GitHub se entreno 7 horas adicionales a partir de estos pesos.

## Capacidades

- Deteccion de personas en imagenes aereas cenitales de dron, con localizacion de centro y caja delimitadora por persona.
- Salida en rejilla 40×40 con mapa de calor de centros y dimensiones de caja en celdas.
- Ajuste del umbral de deteccion en inferencia para priorizar recall (busqueda) o precision (menos falsas alarmas).
- Ejecucion en microcontroladores de la clase ESP32-S3 gracias al fichero TFLite full-int8 de 197 KB.
- Compatibilidad con TensorFlow Lite para despliegue en dispositivos embebidos y en pipelines Python.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un detector de objetos puro.
- No incluye vision general, audio ni modo thinking.

## Casos de uso

- Busqueda y salvamento con dron: el modelo procesa tiles de 160×160 extraidos de recortes de 640×640 de fotos aereas de 4000×3000 y marca los centros de persona con score superior al umbral, de modo que el equipo de rescate recibe coordenadas candidatas para revisar.
- Deteccion a bordo en ESP32-S3: al ocupar 197 KB en int8 y 136.547 parametros, puede ejecutarse en el propio microcontrolador del dron sin enviar video a tierra, reduciendo latencia y dependencia del enlace de radio.
- Triaje de imagenes en mision: con umbral 0,2 se obtiene un 82,5% de recall y 0,47 falsas alarmas por tile, una configuracion adecuada para prefiltrar zonas y enviar solo las candidatas a un operador humano.
- Analisis posterior de vuelos: el fichero int8 QAT se integra en un pipeline Python con TensorFlow Lite para procesar lotes de tiles de misiones ya realizadas y generar mapas de candidatos.
- Investigacion en TinyML: sirve como referencia reproducible de CenterNet cuantizado en int8 para estudiar el compromiso recall/precision en hardware muy limitado.
- Despliegue en flotas de bajo coste: al no requerir GPU ni servidor, permite dotar de deteccion a varios drones economicos con el mismo modelo y umbral configurable.
- Prototipado de sistemas de alerta temprana: combinado con georreferenciacion de los tiles, permite generar avisos con coordenadas aproximadas de personas detectadas para su verificacion.

## Benchmarks y rendimiento

Resultados en el conjunto de test HERIDAL (3.507 tiles, 372 personas). Una deteccion cuenta como acierto si su centro cae dentro de la caja de la persona ampliada en una celda de rejilla.

| Modelo, umbral | Recall | Precision | Falsas alarmas por tile |
|---|---:|---:|---:|
| int8 QAT, 0,45 (mejor F1) | 59,7% | 52,5% | 0,06 |
| int8 QAT, 0,30 | 74,5% | 29,8% | 0,19 |
| int8 QAT, 0,20 | 82,5% | 15,8% | 0,47 |
| int8 QAT, 0,10 | 86,6% | 5,5% | 1,58 |
| float, 0,45 (mejor F1) | 57,0% | 55,1% | 0,05 |

La version v3 publicada en GitHub (entrenada 7 horas mas a partir de estos pesos) alcanza un 83,9% de recall con 0,35 falsas alarmas por tile como int8 QAT con umbral 0,2. La v1, primer entrenamiento infraentrenado, obtenia un 28,8% de recall en su mejor F1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta pensado para ejecucion en CPU/microcontrolador, no en GPU.
- GPU recomendadas: no aplica para el caso de uso principal; cualquier GPU moderna puede ejecutar el modelo float o int8 via TensorFlow Lite para procesamiento por lotes.
- Cabe en consumer GPU: si, con enorme holgura, dado su tamano (136.547 parametros, 197 KB en int8).
- Cabe en microcontrolador: si, disenado para ESP32-S3; el autor indica que aun no se ha medido velocidad ni memoria en ese hardware.
- Opciones de despliegue: TensorFlow Lite (recomendado, ficheros `.tflite`), Keras (modelo float `.keras`), y pipelines Python con `tf.lite.Interpreter`.
- Latencia y throughput: no disponibles; no se han publicado mediciones en ESP32-S3 ni en video de vuelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voxOCR (este) | 136.547 | 160×160 RGB | 82,5% recall, 0,47 FA/tile (int8, umbral 0,2) | CC BY 4.0 | HuggingFace y GitHub |
| Detector generico de personas en dron (p. ej. YOLO nano) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos CenterNet de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa fiable. La comparativa con alternativas de la misma categoria (detectores TinyML para dron) queda como no disponible.

## Limitaciones y advertencias

- Entrenado y evaluado solo sobre HERIDAL: verano, luz diurna y terreno mayoritariamente mediterraneo. Nieve, dosel forestal, agua, noche y termica no estan probados.
- No alcanza el 90% de recall en el conjunto de test.
- No se ha medido aun en ESP32-S3 (velocidad, memoria) ni sobre video de vuelo real.
- Riesgo de falsas alarmas dependiente del umbral: con 0,2 se situa en 0,47 por tile; con 0,10 sube a 1,58 por tile, lo que puede saturar a un operador humano.
- Precision baja en configuraciones de alto recall (15,8% con umbral 0,2), por lo que las detecciones requieren verificacion humana.
- Sesgos conocidos: no documentados de forma explicita; el dominio de entrenamiento restringido implica probable degradacion fuera de el.
- Licencia CC BY 4.0 para los pesos: permite uso comercial con atribucion; el codigo de entrenamiento es MIT. Verificar condiciones de HERIDAL (CC BY 3.0) para reentrenamientos.
- Uso previsto declarado: busqueda y salvamento; el autor prohibe explicitamente su uso para apuntar o danar a personas.

## Enlaces

- HuggingFace: https://huggingface.co/inviolus/voxOCR
- GitHub (codigo y entrenamiento): https://github.com/ErdemWilkinson/voxOCR
- Version v3 en GitHub: https://github.com/ErdemWilkinson/voxOCR#v3-2026-11-01-7-more-hours-from-v2
- Conjunto HERIDAL: https://zenodo.org/records/5662351
- Paper de HERIDAL: D. Bozic-Stulic, Z. Marusic, S. Gotovac, "Deep Learning Approach in Aerial Imagery for Supporting Land Search and Rescue Missions", IJCV 2019.
