# Advantech-EIOT/AMD_centerface_640x384_A8W8

## Resumen

CenterFace es un detector de rostros anchor-free con cinco puntos faciales de referencia, publicado originalmente por Star-Clouds y descrito en el articulo arXiv 1911.03599. Este repositorio de Advantech-EIOT no contiene un modelo entrenado por Advantech, sino una version cuantizada a INT8 (esquema A8W8) del ONNX oficial de CenterFace, con entrada fija de 640x384 pixeles, derivada del modelo FP32 tambien alojado por Advantech-EIOT.

El modelo resuelve la deteccion de rostros y la localizacion de landmarks faciales en una sola pasada, devolviendo un mapa de calor de centros, tamanos de caja, offsets de centro y cinco puntos faciales. La cuantizacion se ha realizado con AMD Quark 0.11.2 para su despliegue en la NPU de plataformas AMD Ryzen AI dentro del ecosistema VisionAI de Advantech, lo que lo hace relevante para inferencia en el borde con aceleracion de hardware dedicada.

La relevancia actual radica en que permite ejecutar un detector facial clasico y ligero sobre NPU de PC y equipos industriales, con pesos INT8 y activaciones UINT8, manteniendo entradas y salidas en FP32. No se reclama reevaluacion de precision tras la cuantizacion ni se ha reentrenado el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CenterFace, detector de rostros anchor-free con landmarks (red convolucional tipo detector de centro) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 640x384) |
| Tipos de cuantizacion | INT8 A8W8: pesos INT8 por canal de salida, activaciones UINT8 asimetricas con zero point, bias INT32; pares QuantizeLinear/DequantizeLinear (QDQ) en el grafo |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT (Copyright (c) 2019 StarClouds) |
| Formato de pesos | ONNX (opset 17, batch 1, entrada 640x384) |

## Arquitectura y entrenamiento

CenterFace es un detector de rostros anchor-free que predice directamente el centro de cada rostro mediante un mapa de calor con stride 4, junto con el tamano de la caja (log altura y log anchura), el offset del centro y cinco landmarks faciales. La entrada es un tensor NCHW de forma [1, 3, 384, 640] en RGB, rango 0-255 y sin normalizar. Las salidas son cuatro tensores FP32 de forma [1, 1, 96, 160] (heatmap), [1, 2, 96, 160] (tamano de caja), [1, 2, 96, 160] (offset) y [1, 10, 96, 160] (landmarks). La decodificacion de cajas y la NMS no estan incluidas en el grafo.

Advantech no entreno este modelo: parte del `centerface.onnx` oficial del repositorio Star-Clouds y lo cuantizo con AMD Quark 0.11.2. La calibracion se hizo con 200 imagenes de COCO val2017 (las primeras 200 por nombre de fichero), con metodo MinMax y letterbox a 640x384 con fondo negro, sin usar WIDER FACE. La sigmoide del heatmap se mantiene en FP32. No hubo reentrenamiento ni se aporta reevaluacion de precision. El modelo original fue entrenado sobre WIDER FACE, cuyo dataset tiene licencia no comercial.

## Capacidades

- Deteccion de rostros en imagenes con entrada fija de 640x384 pixeles.
- Localizacion de cinco landmarks faciales por rostro (ojos, nariz y comisuras de la boca, segun el esquema estandar de CenterFace).
- Prediccion de caja delimitadora mediante tamano y offset desde el centro detectado.
- Inferencia en una sola pasada, sin etapas de propuesta de regiones.
- Ejecucion en NPU de AMD Ryzen AI mediante el formato ONNX QDQ.
- No incluye decodificacion de cajas ni NMS: el postprocesado debe implementarse fuera del grafo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo puramente visual).

## Casos de uso

- Control de acceso y presencia en equipos industriales: el modelo detecta rostros y landmarks sobre la NPU de un equipo AMD Ryzen AI, permitiendo activar flujos de autenticacion o conteo de personas sin cargar la CPU.
- Analitica de aforo en retail y espacios publicos: con entrada 640x384 y stride 4, el heatmap de 96x160 permite contar caras en escenas amplias; el postprocesado de cajas y NMS se implementa en la aplicacion.
- Preprocesado para reconocimiento facial: los cinco landmarks permiten alinear y recortar rostros antes de pasarlos a un modelo de embeddings, usando este detector como etapa previa.
- Vigilancia perimetral en el borde: al ejecutarse en NPU con pesos INT8, es adecuado para dispositivos con restricciones termicas y de consumo que necesitan deteccion continua de rostros.
- Kioscos interactivos y senalizacion digital: deteccion de presencia y orientacion facial para adaptar contenido, con latencia baja al residir en hardware local.
- Automatizacion de pipelines de video: integracion en aplicaciones VisionAI de Advantech para filtrar fotogramas con rostros antes de enviarlos a etapas mas costosas en servidor.
- Anonimizacion de video: deteccion de caras para aplicar desenfoque previo a la grabacion o transmision, ejecutando el modelo localmente en la NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama reevaluacion de precision para esta cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de deteccion con entrada 640x384, la huella es reducida, pero no se aportan cifras.
- GPU recomendadas: no disponibles; el destino declarado es la NPU de AMD Ryzen AI (plataforma AMD P100 : NPU segun la model card).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: ONNX Runtime con soporte de Ryzen AI (EP de NPU), o cualquier runtime ONNX compatible con QDQ opset 17.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMD_centerface_640x384_A8W8 (este) | CenterFace anchor-free con landmarks | 640x384 fija | INT8 A8W8 (QDQ) | MIT | Hugging Face, ONNX |
| AMD_centerface_640x384_FP32 | CenterFace anchor-free con landmarks | 640x384 fija | FP32 | MIT | Hugging Face, ONNX |
| CenterFace oficial (Star-Clouds) | CenterFace anchor-free con landmarks | Configurable | FP32 | MIT | Repositorio GitHub |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha reevaluado la precision tras la cuantizacion; la degradacion respecto al modelo FP32 es desconocida.
- La calibracion uso 200 imagenes de COCO val2017 y no WIDER FACE, por lo que la distribucion de calibracion no coincide con la del entrenamiento.
- Entrada fija de 640x384: cualquier imagen debe redimensionarse con letterbox, lo que puede afectar a rostros muy pequenos o muy grandes.
- El grafo no incluye decodificacion de cajas ni NMS; es necesario implementar el postprocesado.
- El modelo original se entreno con WIDER FACE, cuyo dataset tiene licencia no comercial; conviene revisar las implicaciones para uso comercial aunque el codigo y los pesos se distribuyan bajo MIT.
- Riesgo de falsos positivos y sesgos propios del detector original, no evaluados en esta version cuantizada.
- No es un modelo de lenguaje: no soporta texto, tool calling ni agentes.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Advantech-EIOT/AMD_centerface_640x384_A8W8
- Modelo base FP32: https://huggingface.co/Advantech-EIOT/AMD_centerface_640x384_FP32
- Repositorio CenterFace: https://github.com/Star-Clouds/CenterFace
- Paper CenterFace: https://arxiv.org/abs/1911.03599
- Licencia CenterFace: https://github.com/Star-Clouds/CenterFace/blob/master/LICENSE
- Documentacion AMD Quark: https://quark.docs.amd.com/
