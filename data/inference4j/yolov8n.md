# inference4j/yolov8n

## Resumen

YOLOv8n es la variante "nano" del detector de objetos YOLOv8 desarrollado por Ultralytics. Se trata de un detector de una sola etapa (single-shot detector) entrenado sobre el conjunto de datos COCO 2017 para la deteccion de 80 clases de objetos. Esta ficha concreta corresponde a una exportacion a formato ONNX alojada por el usuario inference4j, que la distribuye sin modificaciones como espejo del repositorio original de Kalray, y cuyo proposito es servir de base para la libreria inference4j, una biblioteca de inferencia para Java.

El modelo no es un modelo de lenguaje: no genera texto ni mantiene conversaciones. Su funcion es procesar imagenes RGB de 640x640 pixeles y devolver cajas delimitadoras con puntuaciones de clase, lo que lo hace adecuado para tareas de vision por computador en tiempo real. La variante nano prioriza la velocidad y el bajo coste computacional frente a la precision de las variantes mayores de la familia (s, m, l, x).

Su relevancia actual radica en que es un modelo compacto, exportado a ONNX, lo que permite ejecutarlo en entornos Java mediante inference4j y en multiples runtimes compatibles con ONNX Runtime. La licencia AGPL-3.0 es un factor determinante para cualquier uso en produccion, ya que impone obligaciones de publicacion del codigo fuente derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 Nano (detector de una sola etapa, CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 640x640) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos ONNX sin especificar variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX |

Especificaciones adicionales declaradas en la model card:

| Parametro | Valor |
|---|---|
| Tarea | Deteccion de objetos (80 clases COCO) |
| Entrada | `[1, 3, 640, 640]`, RGB, normalizada 0-1 |
| Salida | `[1, 84, 8400]` (cajas delimitadoras + puntuaciones de clase) |
| Post-procesado | Supresion de no maximos (NMS) requerida |
| Framework original | PyTorch (Ultralytics) |
| Datos de entrenamiento | COCO 2017 (80 clases) |

## Arquitectura y entrenamiento

YOLOv8n es una red neuronal convolucional disenada como detector de objetos de una sola etapa. La arquitectura sigue el esquema de la familia YOLOv8 de Ultralytics, que combina un backbone de extraccion de caracteristicas con un cuello (neck) de fusion multi-escala y una cabeza de deteccion que predice simultaneamente cajas delimitadoras y puntuaciones de clase en una unica pasada. La variante nano reduce el numero de canales y bloques respecto a las variantes superiores para minimizar el coste computacional.

El entrenamiento se realizo sobre el conjunto COCO 2017 con 80 clases de objetos. La model card no proporciona el numero exacto de tokens ni de imagenes de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de ajuste fino adicionales como RLHF o DPO (tecnicas, por otra parte, no aplicables a un detector de objetos). Tampoco se documentan innovaciones tecnicas especificas de esta exportacion mas alla de la conversion a ONNX, que segun la model card se realizo sin cambios en los ficheros respecto al repositorio de origen.

## Capacidades

- Deteccion de objetos en imagenes RGB de 640x640 pixeles, con salida de cajas delimitadoras y puntuaciones de confianza para 80 clases COCO.
- Deteccion en tiempo real gracias a la variante nano, optimizada para baja latencia.
- Ejecucion en runtime ONNX, lo que permite desplegarlo en Java mediante inference4j y en otros entornos compatibles con ONNX Runtime.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades linguisticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo "thinking", vision multimodal, audio ni otras capacidades especiales mas alla de la deteccion de objetos.

## Casos de uso

- Videovigilancia y monitorizacion en tiempo real: el modelo procesa fotogramas de 640x640 y devuelve detecciones con cajas y confianza, lo que permite integrarlo en pipelines de analisis de video con requisitos de baja latencia. Su tamano reducido facilita el despliegue en dispositivos con recursos limitados.
- Analisis de imagenes en aplicaciones Java: gracias a inference4j, puede integrarse en servicios backend Java para detectar objetos en imagenes subidas por usuarios, con el ejemplo de uso documentado en la model card (`YoloV8Detector.builder().build()`).
- Preprocesado en sistemas de vision industrial: deteccion de componentes, productos o elementos en lineas de produccion a partir de imagenes capturadas por camaras, usando la salida `[1, 84, 8400]` y NMS para obtener las detecciones finales.
- Etiquetado asistido y pre-anotacion de datasets: el modelo puede generar detecciones preliminares sobre imagenes nuevas para acelerar el etiquetado manual en proyectos de vision por computador.
- Deteccion en aplicaciones de movilidad y automocion a pequena escala: identificacion de peatones, vehiculos y senales (clases COCO) en prototipos o sistemas embebidos con ONNX Runtime.
- Filtrado y moderacion de contenido visual: deteccion de objetos o personas en imagenes para tareas de clasificacion y cribado previo en plataformas que reciben contenido generado por usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como mAP, latencia o throughput, ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al ser una variante nano con entrada de 640x640, el consumo de memoria es bajo en terminos relativos, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible. El modelo esta exportado a ONNX y puede ejecutarse en CPU o GPU mediante ONNX Runtime, pero la model card no especifica hardware recomendado.
- Compatibilidad con GPU de consumo: no se documenta explicitamente; al ser un modelo nano es plausible que quepa en GPU de consumo, pero no hay datos que lo confirmen en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (formato ONNX) y la libreria inference4j para Java. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| YOLOv8n (esta ficha) | no disponible | 640x640 | Deteccion COCO 80 clases | AGPL-3.0 | ONNX | Hugging Face (inference4j/yolov8n) |
| Otras variantes YOLOv8 (s, m, l, x) | no disponible | 640x640 | Deteccion COCO 80 clases | AGPL-3.0 | PyTorch / ONNX | Hugging Face (Kalray/yolov8, Ultralytics) |
| Alternativas de deteccion de una etapa (p. ej. SSD, RetinaNet) | no disponible | variable | Deteccion COCO | variable | variable | variable |

No se dispone de datos de rendimiento comparativo (mAP, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso en produccion, especialmente en servicios en red, puede obligar a publicar el codigo fuente derivado bajo la misma licencia. Es imprescindible revisar las implicaciones legales antes de un despliegue comercial.
- El modelo solo detecta las 80 clases del conjunto COCO; no reconoce categorias fuera de ese vocabulario.
- Requiere post-procesado con supresion de no maximos (NMS) para obtener detecciones finales; sin este paso la salida `[1, 84, 8400]` no es directamente utilizable.
- La entrada esta fijada a 640x640 pixeles RGB normalizados 0-1; imagenes de otras dimensiones deben redimensionarse, lo que puede afectar a la precision en objetos pequenos o muy alargados.
- Riesgo de falsos positivos y falsos negativos inherente a los detectores de una etapa, especialmente en escenas con oclusiones, baja iluminacion u objetos de clases poco representadas en COCO.
- No se documentan sesgos especificos del modelo en la informacion disponible, pero los sesgos del dataset COCO (composicion, distribucion geografica y demografica) pueden trasladarse a las detecciones.
- Esta ficha corresponde a un espejo sin modificaciones del repositorio de Kalray; la responsabilidad del mantenimiento y de la calidad de los pesos recae en el proyecto original de Ultralytics.
- No hay informacion sobre cuantizaciones disponibles ni sobre el rendimiento en hardware concreto, lo que limita la planificacion de capacidad en produccion.

## Enlaces

- Repositorio Hugging Face de esta ficha: https://huggingface.co/inference4j/yolov8n
- Repositorio original en Hugging Face (Kalray / Ultralytics YOLOv8): https://huggingface.co/Kalray/yolov8
- Libreria inference4j: https://github.com/inference4j/inference4j
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
- Sitio web de Ultralytics: https://ultralytics.com/
- Texto de la licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
