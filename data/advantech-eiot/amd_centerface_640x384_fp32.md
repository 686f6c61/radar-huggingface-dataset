# Advantech-EIOT/AMD_centerface_640x384_FP32

## Resumen

CenterFace es un detector de rostros anchor-free que predice centros de cara y cinco puntos faciales (ojos, nariz y comisuras de la boca). Este repositorio de Advantech-EIOT distribuye una conversión del modelo oficial a ONNX en precisión FP32 con una entrada fija de 640x384, orientada a la línea VisionAI de Advantech sobre plataformas AMD (etiqueta `ryzen-ai`). No hay reentrenamiento ni cuantización: los pesos son los del `centerface.onnx` original del repositorio Star-Clouds, y el trabajo del autor se limita a fijar la forma de entrada, eliminar pesos declarados como entradas de grafo e inicializadores no usados, migrar de opset 9 a opset 17 y plegar BatchNorm en Conv mediante `onnxslim`.

El interés de esta ficha es acotado: no es un modelo fundacional ni un LLM, sino un artefacto de despliegue listo para inferencia en CPU/iGPU/NPU de AMD. Su relevancia práctica radica en la interfaz determinista (batch 1, tensor NCHW RGB 0-255 sin normalizar, cuatro salidas con stride 4), que simplifica la integración en pipelines de visión embebidos y en entornos de borde donde no se dispone de CUDA.

La licencia del código y los pesos es MIT (Copyright 2019 StarClouds), pero el entrenamiento se hizo sobre WIDER FACE, cuyo dataset tiene licencia no comercial; esa asimetría es un caveat relevante para uso en producto. El repositorio no publica métricas de precisión ni reevaluación de exactitud tras la conversión: solo afirma que las salidas coinciden con el grafo oficial para el mismo tamano de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CenterFace, detector de rostros anchor-free con prediccion de centro y 5 landmarks (CNN tipo backbone con cabeceras por stride) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | solo FP32 en este repositorio; no se incluyen variantes INT8/FP16 |
| Idiomas soportados | no aplica (deteccion facial, independiente del idioma) |
| Licencia | MIT (codigo y pesos, Copyright 2019 StarClouds); dataset WIDER FACE con licencia no comercial |
| Formato de pesos | ONNX, opset 17, batch 1, entrada fija `[1, 3, 384, 640]` |
| Entrada | tensor `input.1`, F32, NCHW, RGB, rango 0-255, sin normalizar |
| Salidas | `537` heatmap `[1,1,96,160]`; `538` tamano de caja `[1,2,96,160]` (log alto, log ancho); `539` offset de centro `[1,2,96,160]` (y, x); `540` landmarks `[1,10,96,160]` |
| Post-proceso incluido | no; la decodificacion de cajas y el NMS deben implementarse fuera del grafo |
| Metadatos | nombre de clase almacenado en `names` del modelo |
| Integridad | fichero `SHA256SUMS` incluido |

## Arquitectura y entrenamiento

CenterFace sigue un diseno anchor-free: en lugar de regresar offsets respecto a anchors predefinidos, predice un mapa de calor de centros de cara y, en cada celda con alta respuesta, el tamano de la caja en escala logaritmica, el desplazamiento subpixel del centro y diez valores correspondientes a cinco landmarks. Las cuatro salidas se emiten a stride 4 sobre una rejilla de 96x160 para la entrada de 384x640, lo que da una resolucion de celda de 4 px en la imagen original. Al no usar anchors, se eliminan los hiperparametros de escalas y ratios y el post-proceso se reduce a umbralizar el heatmap, decodificar tamanos y offsets, y aplicar supresion no maxima.

El entrenamiento original, descrito en el paper arXiv:1911.03599, se realizo sobre WIDER FACE, el benchmark de referencia en deteccion de rostros en escenas no controladas. Esta conversion no modifica los pesos: segun la model card, los cambios son exclusivamente de grafo (forma de entrada fija, limpieza de inicializadores, actualizacion de opset y folding de BatchNorm), y las salidas coinciden con el grafo oficial al mismo tamano de entrada. No se documentan datos de tokens, composicion del dataset mas alla de WIDER FACE, ni fases de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Deteccion de rostros en imagenes RGB con entrada fija de 640x384, batch 1.
- Localizacion de cinco landmarks faciales por rostro (ojos, nariz y comisuras de la boca), utiles para alineamiento previo a reconocimiento facial.
- Salida estructurada en cuatro tensores que permite implementar decodificacion y NMS a medida segun los umbrales del caso de uso.
- Ejecucion en CPU e infraestructura AMD (tag `ryzen-ai`), sin dependencia de CUDA.
- Exportacion ONNX opset 17, compatible con runtimes ONNX estandar y con pipelines de VisionAI.
- No soporta tool calling, agentes, razonamiento multi-paso, vision general (solo caras), audio ni generacion de texto.

## Casos de uso

- Control de acceso en edificios: el modelo detecta caras y devuelve landmarks para alinear el recorte antes de pasarlo a un embedding de reconocimiento facial; la entrada fija de 640x384 simplifica el preprocesado en kioscos con CPU AMD.
- Analitica de aforo y conteo de personas: integrado en un pipeline de video que ejecuta inferencia por frame sobre Ryzen AI, el heatmap de centros permite contar caras por region tras aplicar NMS propio.
- Senalizacion digital interactiva: deteccion de presencia y orientacion aproximada de la cara (a partir de los landmarks) para activar contenido en pantallas publicas sin enviar video a la nube.
- Verificacion de calidad en captura documental: comprobacion de que el usuario esta encuadrado, con los ojos visibles y sin oclusion, antes de disparar la foto en un tramite self-service.
- Preprocesado en estaciones de videoconferencia: recorte y centrado automatico de la cara del orador para encuadre dinamico, ejecutado localmente en el equipo del usuario.
- Moderacion de contenido en ingesta de imagenes: primer filtro para localizar y difuminar rostros de terceros antes de almacenar material, reduciendo el coste frente a un detector de proposito general.
- Telemetria de atencion en entornos de formacion: estimacion de presencia y pose de cabeza por frame para metricas agregadas, con el modelo corriendo en el dispositivo y sin transmision de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, AP ni latencia, y declara explicitamente que no se reclama una reevaluacion de exactitud para esta conversion. Cualquier cifra de WIDER FACE en la literatura corresponde al modelo original CenterFace, no a este artefacto ONNX concreto, y no debe atribuirse a este repositorio.

## Requisitos de hardware

- VRAM: no disponible de forma explicita; al tratarse de un detector de caras de una sola pasada con entrada 384x640 en FP32, el peso del modelo es reducido (el repositorio ocupa 0,0 GB segun Hugging Face, lo que sugiere un fichero de pocos MB), por lo que la memoria necesaria es minima frente a cualquier LLM.
- GPU recomendadas: el tag `amd` y `ryzen-ai` indica despliegue previsto en plataformas AMD (APUs Ryzen con NPU/iGPU). En NVIDIA, cualquier GPU consumer reciente (RTX 3060 en adelante) es sobradamente suficiente; tambien A100/H100, aunque estan sobredimensionadas para este modelo.
- GPU consumer: si, cabe en practicamente cualquier GPU consumer y en CPU de forma holgada; el cuello de botella real sera el preprocesado y el post-proceso (NMS), no el grafo.
- Opciones de despliegue: ONNX Runtime (CPU, DirectML, ROCm o proveedores de ejecucion de AMD), integracion en pipelines de VisionAI de Advantech, y conversiones adicionales a otros runtimes si se necesita. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Landmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CenterFace (este repo, ONNX FP32) | Anchor-free, centro + landmarks | Fija 640x384, batch 1 | Si, 5 puntos | MIT (pesos); dataset no comercial | Hugging Face, ONNX opset 17 |
| CenterFace original (Star-Clouds) | Anchor-free, centro + landmarks | Configurable (por defecto 32x32, batch 10) | Si, 5 puntos | MIT | Repositorio GitHub, ONNX opset 9 |
| RetinaFace | Detector multi-escala con anchors | Configurable | Si, 5 puntos | MIT en implementaciones de referencia | Multiples repositorios y frameworks |
| MTCNN | Cascada de tres etapas | Configurable | Si, 5 puntos | MIT en implementaciones de referencia | Amplia disponibilidad |

La comparacion con RetinaFace y MTCNN es cualitativa: no se dispone en la informacion proporcionada de metricas comparables de precision ni de latencia para este artefacto. La ventaja concreta de este repositorio frente al CenterFace original es la interfaz fija y limpia (batch 1, opset 17, BatchNorm plegado), que reduce el trabajo de integracion; la desventaja es la perdida de flexibilidad en el tamano de entrada.

## Limitaciones y advertencias

- Entrada fija de 640x384: no admite otras resoluciones sin reexportar o redimensionar externamente, lo que puede degradar la deteccion de caras muy pequenas o muy grandes respecto al encuadre original.
- No incluye decodificacion de cajas ni NMS en el grafo; es responsabilidad del integrador implementarlos y fijar umbrales, con el riesgo de resultados inconsistentes si se copian parametros de otro pipeline.
- Sin reevaluacion de exactitud declarada tras la conversion: la equivalencia se afirma a nivel de salidas frente al grafo oficial, no mediante metricas sobre WIDER FACE.
- Sesgos del dataset WIDER FACE: predominio de escenas no controladas y posible infrarrepresentacion de determinados grupos demograficos, condiciones de iluminacion o accesorios; el rendimiento en dominios distintos (camaras de vigilancia nocturna, imagenes medicas) no esta caracterizado.
- Licencia del dataset: aunque el codigo y los pesos son MIT, WIDER FACE tiene licencia no comercial; conviene revisar la implicacion legal antes de un despliegue comercial, especialmente en jurisdicciones estrictas.
- Riesgo de falsos positivos en texturas con patrones faciales y de falsos negativos con oclusiones, perfiles extremos o caras pequenas; no hay umbral calibrado publicado.
- Uso previsto limitado a deteccion de caras: no debe emplearse como detector de objetos generico ni como extractor de embeddings de identidad.
- Consideraciones de privacidad y normativa (RGPD): el tratamiento de imagenes de rostros requiere base legal, evaluacion de impacto y, en su caso, minimizacion en el dispositivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Advantech-EIOT/AMD_centerface_640x384_FP32
- Repositorio CenterFace (Star-Clouds): https://github.com/Star-Clouds/CenterFace
- Paper CenterFace: https://arxiv.org/abs/1911.03599
- Modelo ONNX oficial: https://github.com/Star-Clouds/CenterFace/raw/master/models/onnx/centerface.onnx
- Licencia CenterFace: https://github.com/Star-Clouds/CenterFace/blob/master/LICENSE
- Dataset WIDER FACE: https://huggingface.co/datasets/CUHK-CSE/wider_face
