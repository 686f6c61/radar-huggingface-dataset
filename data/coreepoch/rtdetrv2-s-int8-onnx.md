# CoreEpoch/rtdetrv2-s-int8-onnx

## Resumen

RT-DETRv2-S INT8 ONNX es un modelo de deteccion de objetos publicado por CoreEpoch, una version cuantizada a 8 bits del detector RT-DETRv2-S de Peking University (checkpoint `PekingU/rtdetr_v2_r18vd`). El resultado es un unico fichero ONNX de 32,7 MB (32.666.936 bytes) que mantiene el 95,0 % de la precision del modelo original en FP32: 45,7 AP frente a 48,1 AP en COCO val2017, medido sobre 4.800 imagenes disjuntas de las 128 usadas para calibracion.

El interes practico esta en el binomio tamano/precision. La cuantizacion reduce el peso del modelo de 81,0 MB a 32,7 MB (−59,6 %) sin reentrenamiento, y el resultado se ejecuta tanto en CPU como en GPU a traves de ONNX Runtime o OpenVINO, sin necesidad de acelerador dedicado. Esto lo situa en el nicho de deteccion en tiempo real en entornos sin GPU: servidores x86, dispositivos de borde, funciones serverless y sistemas embebidos donde el coste de una GPU no esta justificado.

RT-DETRv2 es un detector end-to-end de la familia DETR, sin supresion de no maximos (NMS) en post-proceso, con consultas aprendidas y seleccion de queries consciente del IoU. La variante "S" emplea un backbone ResNet-18. El modelo conserva la licencia Apache-2.0 del original, mientras que el cuantizador (Kenosis) es una herramienta propietaria de Core Epoch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de deteccion end-to-end (RT-DETRv2, familia DETR), backbone ResNet-18, sin NMS en post-proceso |
| Parametros totales | No disponible en la informacion proporcionada (la variante R18 de la familia RT-DETRv2 se situa en torno a 20 M en la literatura del modelo) |
| Longitud de contexto | No aplicable: modelo de vision con entrada fija de 1x3x640x640 pixeles |
| Tipos de cuantizacion | INT8 post-entrenamiento (calibracion con 128 imagenes COCO, sin reentrenamiento) |
| Idiomas soportados | No aplicable: modelo de deteccion visual; las 80 clases de salida siguen el orden contiguo COCO-80 con etiquetas en ingles |
| Licencia | Apache-2.0 (heredada del modelo base RT-DETRv2) |
| Formato de pesos | ONNX (INT8), fichero unico `rtdetrv2_s_640_int8_kenosis.onnx`; convertible a OpenVINO IR |
| Entrada | `1x3x640x640`, RGB, normalizada con `/255` (sin media ni desviacion estandar) |
| Salidas | `logits [1,300,80]` (orden COCO-80) y `boxes [1,300,4]` (cxcywh normalizado) |
| Tamano del fichero | 32.666.936 bytes (32,7 MB) |
| SHA-256 | `2FBEA12F3A66DA22BE0C0404F78D378F0D6F4C2F8107A5444EE00C6AB717974D` |
| Tamano del repositorio | 0,1 GB |
| Herramienta de cuantizacion | Kenosis (Core Epoch, propietaria) |
| Dataset de evaluacion | COCO val2017 (4.800 imagenes) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a RT-DETRv2 (Lv et al., 2024), un detector de objetos basado en transformer que elimina la necesidad de NMS. El modelo parte de consultas aprendidas (queries) que se refinan en el decodificador, con una seleccion de queries guiada por IoU para inicializar las consultas de forma informativa. La variante concreta usa un backbone ResNet-18, lo que explica el reducido coste computacional de la gama "S" frente a las variantes R34, R50 y R101 de la misma familia. La salida fija de 300 cajas por imagen es coherente con este diseno end-to-end: no se aplica NMS posterior, solo un umbral de confianza sobre las 300 consultas.

No hay entrenamiento adicional en este artefacto. La model card indica explicitamente que la cuantizacion se realizo sin reentrenamiento ("no retraining"), usando 128 imagenes de COCO como conjunto de calibracion. Se trata, por tanto, de una cuantizacion post-entrenamiento (PTQ) que preserva la precision del checkpoint original en un 95,0 %. La evaluacion se hizo con `pycocotools` sobre 4.800 imagenes de COCO val2017, disjuntas de las 128 de calibracion, lo que reduce el riesgo de sobreajuste al conjunto de calibracion, aunque no lo elimina del todo. El autor no documenta la composicion completa del dataset de entrenamiento original ni el uso de RLHF, DPO u otras fases de alineacion, algo que no aplica a un modelo de deteccion.

## Capacidades

- Deteccion de objetos en 80 categorias COCO (persona, vehiculo, animal, mobiliario urbano, utensilios, etc.) con localizacion de caja y puntuacion de confianza por consulta.
- Inferencia end-to-end sin NMS: la salida es directamente un conjunto de 300 detecciones candidatas con logits por clase.
- Entrada de imagen unica a resolucion fija 640x640, con preproceso minimo (`/255`, sin media ni desviacion estandar).
- Ejecucion en CPU mediante `CPUExecutionProvider` de ONNX Runtime, y en GPU mediante proveedores CUDA/TensorRT de ONNX Runtime.
- Compatibilidad con OpenVINO, segun la model card, para despliegue optimizado en hardware Intel.
- Exportacion a TensorRT u otros runtimes a partir del ONNX, no documentada explicitamente pero tecnicamente viable.
- Verificacion de integridad mediante SHA-256 del fichero de pesos.
- No dispone de: deteccion de clases abiertas o por texto (zero-shot), segmentacion de instancias, estimacion de pose, vision-lenguaje, tool calling, function calling, razonamiento multi-paso ni modo de pensamiento. Es un modelo puramente perceptivo de una sola pasada.

## Casos de uso

- Videovigilancia analitica en CPU: un servidor sin GPU puede ejecutar el modelo sobre streams de camaras IP a 640x640, detectando personas y vehiculos con un coste de memoria inferior a 50 MB de pesos, lo que permite multiplexar varios canales en el mismo host.
- Analitica de retail en el borde: conteo de clientes, ocupacion de zonas y deteccion de carritos en dispositivos x86 de bajo consumo, usando OpenVINO para aprovechar instrucciones VNNI/AMX cuando esten disponibles.
- Control de calidad industrial: deteccion de defectos o piezas mal posicionadas en lineas de produccion con camaras fijas, donde la latencia predecible de un detector end-to-end sin NMS simplifica el pipeline determinista.
- Auto-etiquetado de datasets: preanotacion masiva de imagenes para posterior revision humana, generando ficheros COCO a partir de `logits` y `boxes`; el ahorro de tiempo es considerable incluso con un 5 % menos de AP que el modelo FP32.
- Analitica de trafico urbano: deteccion de vehiculos, autobuses, senales de trafico y peatones en grabaciones almacenadas, procesadas por lotes en CPU en nodos de computo economicos.
- Preprocesado para pipelines multimodales: recorte automatico de regiones de interes (personas, objetos) antes de enviarlas a un modelo vision-lenguaje, reduciendo el numero de tokens visuales y el coste por consulta.
- Funciones serverless y API sin GPU: empaquetar el modelo en una imagen de contenedor de decenas de MB para endpoints de deteccion bajo demanda, con arranque en frio mas rapido que alternativas basadas en PyTorch.
- Prototipado rapido en cuadernos: el ejemplo de la model card (`hf_hub_download` + `onnxruntime.InferenceSession`) permite tener deteccion funcional en menos de diez lineas de codigo, sin dependencias de frameworks de deep learning.

## Benchmarks y rendimiento

Unica tabla publicada en la model card. Evaluacion en COCO val2017, 4.800 imagenes, metrica `pycocotools` bbox, AP50:95.

| Modelo | AP50:95 | Retencion | Tamano |
|---|---|---|---|
| RT-DETRv2-S FP32 (referencia) | 48,1 | — | 81,0 MB |
| RT-DETRv2-S INT8 (Kenosis) | 45,7 | 95,0 % | 32,7 MB |

No se han publicado en la informacion disponible desgloses por AP50, AP75, AP small/medium/large, ni datos de latencia o throughput. Tampoco hay comparaciones con otros detectores en la documentacion proporcionada.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en la practica (32,7 MB de pesos INT8 mas activaciones de un tensor de entrada 1x3x640x640 y las 300 consultas del decodificador). Cabe holgadamente en cualquier GPU con 4 GB.
- GPU recomendadas: cualquier GPU moderna. Para maxima eficiencia, NVIDIA con soporte TensorRT o INT8 (T4, L4, A10, A100, H100, RTX 30/40). El modelo no necesita una GPU de gama alta y el cuello de botella tipico sera el preproceso de imagen, no la red.
- GPU de consumo: si, cabe en cualquier GPU de consumo actual e incluso en integradas modestas. El caso natural, no obstante, es la ejecucion en CPU.
- CPU: es el escenario principal. En x86 el rendimiento mejora sustancialmente con AVX2 y, sobre todo, AVX-512 VNNI o AMX, donde los kernels INT8 de ONNX Runtime y OpenVINO son mas eficientes. En ARM (Raspberry Pi, Jetson) el modelo funciona, pero los kernels de cuantizacion suelen ser menos maduros y el rendimiento relativo frente a FP32 puede ser peor.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML), OpenVINO (mencionado por el autor), y conversion a TensorRT u otros runtimes desde el ONNX. No aplica vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican FPS, milisegundos por imagen ni comparativas entre backends ni entre CPU y GPU.

## Comparativa con modelos similares

Se comparan las dos variantes documentadas del mismo modelo (unica comparacion con numeros publicados) y se mencionan alternativas de la misma categoria. Los datos marcados como "no disponible" no aparecen en la informacion proporcionada; las notas de licencia de terceros son conocimiento general y deben verificarse en la fuente original.

| Modelo | Parametros | AP50:95 COCO | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|---|
| RT-DETRv2-S INT8 (este modelo) | no disponible | 45,7 | 640x640 | Apache-2.0 | ONNX INT8 (32,7 MB) |
| RT-DETRv2-S FP32 (`PekingU/rtdetr_v2_r18vd`) | no disponible | 48,1 | 640x640 | Apache-2.0 | PyTorch (81,0 MB) |
| Detectores YOLO de gama nano/small (familia Ultralytics) | no disponible | no disponible | variable | AGPL-3.0 con licencia comercial alternativa | PyTorch / ONNX |
| D-FINE-S / D-FINE-M y otros DETR en tiempo real | no disponible | no disponible | variable | no disponible | PyTorch / ONNX |

Consideracion practica: frente a alternativas con licencia AGPL-3.0, la licencia Apache-2.0 de esta familia simplifica el uso comercial sin obligaciones de copyleft, siempre que se respete la atribucion del modelo base. Frente a modelos FP32 de tamano comparable, la ventaja es el menor consumo de memoria y la idoneidad para despliegue en CPU; la desventaja es la perdida del 5 % de AP y la posible degradacion en dominios alejados de COCO.

## Limitaciones y advertencias

- Cobertura cerrada de 80 clases COCO. No detecta categorias fuera de ese vocabulario ni admite consultas en lenguaje natural.
- Resolucion de entrada fija 640x640. Objetos muy pequenos en imagenes de alta resolucion pueden perderse si no se reescala o se procesa por teselas.
- Perdida de precision documentada de 2,4 AP (45,7 frente a 48,1) respecto al modelo FP32. En dominios distintos de COCO la degradacion por cuantizacion INT8 puede ser mayor que la observada en la evaluacion publicada.
- Calibracion con solo 128 imagenes de COCO. Un conjunto de calibracion pequeno y monodominio puede sesgar los rangos de cuantizacion hacia escenas fotograficas genericas.
- Sesgos inherentes al dataset COCO: sobrerrepresentacion de determinadas culturas, escenas y contextos; posibles sesgos de genero y de tono de piel en la clase "persona", y peor deteccion en condiciones de baja iluminacion, oclusion o angulos inusuales.
- Riesgo de falsos positivos y de cajas mal localizadas en imagenes fuera de distribucion. El modelo no reporta incertidumbre calibrada.
- Sin NMS: el post-proceso debe aplicar un umbral de confianza sobre las 300 consultas. El ejemplo de la model card selecciona unicamente el maximo global, lo que no es un uso realista en produccion; es necesario filtrar por umbral y por clase.
- Sin datos publicados de latencia, throughput ni consumo energetico. Cualquier estimacion de rendimiento en produccion requiere medicion propia en el hardware objetivo.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta. La verificacion recomendada es comprobar el SHA-256 publicado y evaluar el modelo en un conjunto propio.
- La licencia del modelo es Apache-2.0, pero la herramienta de cuantizacion (Kenosis) es propietaria. La model card indica que la cuantizacion a medida y las consultas de licencia se gestionan a traves de Core Epoch.
- El modelo no incluye cabecera de segmentacion, pose ni clasificacion multietiqueta. Tampoco soporta video nativo: cada fotograma debe tratarse como una imagen independiente, lo que implica que no hay modelo temporal ni tracking incorporado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CoreEpoch/rtdetrv2-s-int8-onnx
- Modelo base: https://huggingface.co/PekingU/rtdetr_v2_r18vd
- Cuantizador Kenosis (Core Epoch): https://coreepoch.dev/kenosis
- Contacto del autor: core@coreepoch.email
- Referencia del modelo base: Lv et al., 2024, RT-DETRv2 (paper citado en la model card) — https://arxiv.org/abs/2407.17140
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces utiles son los de la model card y el repositorio de HuggingFace.
