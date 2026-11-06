# Ambarella/YOLOV8

## Resumen

Ambarella/YOLOV8 es un repositorio de pesos del modelo YOLOv8 en su variante Small (YOLOv8s), publicado por Ambarella para su despliegue sobre los aceleradores de visión de su familia de sistemas en chip (N1-655, X7, CV7, CV72, CV75). No es un modelo nuevo: reproduce la arquitectura y los pesos de referencia de Ultralytics entrenados sobre COCO 2017 y los distribuye en formatos binarios optimizados para el hardware de Ambarella. El repositorio resuelve el problema de llevar un detector de objetos en tiempo real a cámaras y dispositivos de borde con recursos limitados, evitando al integrador el trabajo de conversión y cuantización.

La variante YOLOv8s es la configuración ligera de la familia YOLOv8, pensada para inferencia de baja latencia y huella de memoria reducida. El modelo base es un detector de objetos de una sola etapa, no un modelo de lenguaje: no procesa texto ni mantiene conversaciones. Su relevancia actual radica en que Ambarella publica dos variantes de compresión por cada SoC (una "Amba_optimized" y otra con activaciones en fp16), lo que permite comparar precisión frente a rendimiento en el propio silicio.

La información disponible en el repositorio es escasa: no se declaran parámetros, licencia, idiomas ni resultados de benchmarks propios. La model card se limita a la configuración de entrada (3x640x640), el dataset de origen (COCO) y las versiones de SDK compatibles (Cooper SDK 2.5.4 y Cooper Foundry 2.3).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (detector de objetos de una etapa, CNN) |
| Parametros totales | no disponible en el repositorio (YOLOv8s de referencia: ~11,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 3x640x640) |
| Tipos de cuantizacion | dos variantes por dispositivo: "Amba_optimized" y "Activation_fp16"; detalles de precision no disponibles |
| Idiomas soportados | no aplica (no es modelo de lenguaje) |
| Licencia | no disponible en el repositorio |
| Formato de pesos | binarios `.bin` especificos por SoC (n1-655, x7, cv7, cv72, cv75); pesos PyTorch de referencia en `.pt` (YOLOv8s COCO2017) |
| Dataset de entrenamiento | COCO 2017 |
| Resolucion de entrada | 3x640x640 |
| Tareas soportadas (familia YOLOv8) | deteccion, clasificacion, segmentacion de instancias, estimacion de pose, deteccion orientada |
| SDK requerido | Cooper SDK 2.5.4, Cooper Foundry 2.3 |

## Arquitectura y entrenamiento

YOLOv8 es una red convolucional de deteccion de objetos de una sola etapa con cuello de botella tipo C2f y cabecera desacoplada (decoupled head) con asignacion dinamica de etiquetas. La variante Small reduce la profundidad y el ancho respecto a las variantes M/L/X, lo que la sitúa en el rango de baja latencia. La entrada es una imagen RGB de 640x640 píxeles.

El entrenamiento corresponde al checkpoint oficial de Ultralytics sobre COCO 2017; Ambarella no documenta reentrenamiento ni ajuste fino propio en la model card. Tampoco se detallan el número de tokens ni la composición del dataset más allá de la referencia a COCO, ni si hubo etapas de RLHF/DPO (no aplicables a un detector). La innovación relevante de este repositorio no está en el modelo sino en el pipeline de despliegue: Ambarella publica por cada SoC una versión "Amba_optimized" (optimizada por su compilador para el acelerador NPU) y una versión "Activation_fp16", lo que permite elegir entre el máximo rendimiento del compilador propietario y una variante con mayor fidelidad numérica en las activaciones.

## Capacidades

- Deteccion de objetos en tiempo real sobre imagenes o flujo de video, con las 80 clases de COCO.
- Salida de cajas delimitadoras y puntuaciones de confianza por clase.
- La familia YOLOv8 cubre ademas clasificacion de imagenes, segmentacion de instancias, estimacion de pose y deteccion orientada; este repositorio concreto distribuye la variante de deteccion.
- Inferencia en dispositivos de borde: los binarios estan compilados para los SoC N1-655, X7, CV7, CV72 y CV75.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo "thinking", vision-lenguaje, audio ni generacion de texto.

## Casos de uso

- Percepcion automotriz: deteccion de peatones, vehiculos y senalizacion en camaras de a bordo o de infraestructura viaria, aprovechando la baja latencia de YOLOv8s sobre los SoC CV de Ambarella.
- Videovigilancia y analitica de video en el borde: conteo y clasificacion de objetos en flujos continuos sin enviar video a la nube, reduciendo ancho de banda y coste de almacenamiento.
- Robotica movil: deteccion de obstaculos y objetos de interes en tiempo real sobre hardware embebido con presupuesto termico y energetico limitado.
- Inspeccion industrial: deteccion de defectos o piezas en lineas de produccion con camaras IP conectadas a un SoC Ambarella, usando la variante "Amba_optimized" para maximizar el throughput.
- Camaras inteligentes de consumo: activacion de grabacion o alertas solo cuando se detecta una clase concreta (persona, vehiculo, animal), ejecutando el modelo localmente.
- Prototipado y validacion de pipelines: usar los pesos de referencia `.pt` para ajustar umbrales, clases y preprocesado antes de compilar a los binarios `.bin` del SoC objetivo con Cooper Foundry.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mAP, latencia ni throughput medidos para ninguna de las variantes (Amba_optimized o Activation_fp16) en ninguno de los SoC listados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en el repositorio. Por el tamano de YOLOv8s (~11,2 M de parametros) y la entrada 3x640x640, la huella es del orden de decenas de MB en fp16, pero Ambarella no publica cifras.
- GPU recomendadas: no aplica para el despliegue objetivo; los binarios estan destinados a los SoC N1-655, X7, CV7, CV72 y CV75 de Ambarella.
- Cabe en GPU de consumo: los pesos PyTorch de referencia de YOLOv8s se ejecutan en cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior); no se dispone de cifras de rendimiento publicadas por Ambarella.
- Opciones de despliegue: Cooper SDK 2.5.4 y Cooper Foundry 2.3 para los binarios `.bin`; para los pesos `.pt` de referencia, el runtime de Ultralytics (PyTorch); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Dataset | Licencia | Enfoque |
|---|---|---|---|---|---|
| Ambarella/YOLOV8 (YOLOv8s) | ~11,2 M (referencia) | 3x640x640 | COCO 2017 | no disponible | Deteccion, binarios para SoC Ambarella |
| Ultralytics YOLOv8s oficial | ~11,2 M | 3x640x640 | COCO 2017 | AGPL-3.0 (verificar en el repositorio oficial) | Deteccion, pesos PyTorch |
| YOLOv5s (Ultralytics) | ~7,2 M | 3x640x640 | COCO | GPL-3.0 (verificar) | Deteccion, generacion anterior |
| YOLOv9t / YOLOv10n | no disponible | 640x640 | COCO | no disponible | Detectores de una etapa mas recientes |

La comparativa se limita a la arquitectura y al tamano; no hay datos de precision ni latencia publicados por Ambarella que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Solo detecta las 80 clases de COCO; cualquier clase fuera de ese vocabulario requiere reentrenamiento, que no esta documentado en este repositorio.
- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- Riesgo de falsos positivos y negativos en condiciones de baja iluminacion, oclusion o dominios visuales alejados de COCO; no se publican metricas de robustez.
- Sesgos potenciales heredados de COCO en la representacion de personas, escenas y objetos; no documentados por el autor.
- Licencia no declarada en el repositorio: no se puede asumir uso comercial sin verificar los terminos de Ultralytics (el codigo y los pesos oficiales de YOLOv8 se distribuyen bajo AGPL-3.0, lo que impone obligaciones de copyleft en servicios en red) y los terminos de Ambarella para los binarios.
- Los binarios `.bin` estan atados a versiones concretas del SDK (Cooper SDK 2.5.4, Cooper Foundry 2.3) y a SoC especificos; no son portables a otro hardware.
- La variante "Amba_optimized" puede degradar la precision numerica respecto a "Activation_fp16"; no se publica la diferencia cuantitativa.
- Repositorio con muy baja adopcion (5 descargas, 0 likes) y sin pipeline declarado en Hugging Face: no hay garantia de mantenimiento ni soporte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ambarella/YOLOV8
- Documentacion oficial de YOLOv8 (Ultralytics): https://docs.ultralytics.com/models/yolov8/
- Fork de Ultralytics mantenido por Ambarella: https://github.com/Ambarella-Inc/ultralytics
- Pesos de referencia YOLOv8s COCO2017: https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8s.pt
- Dataset COCO: https://cocodataset.org/#home
