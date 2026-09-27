# AIOKiet/yolov12s-ampdc-asff-acdc

## Resumen

YOLO12s + AMPDC + ASFF on ACDC es un checkpoint de deteccion de objetos publicado por el usuario AIOKiet en HuggingFace, identificado internamente como experimento A3. No es un modelo de proposito general ni un lanzamiento de producto: se trata de un artefacto de investigacion que combina el detector YOLO12s (variante small) con dos modificaciones de arquitectura, AMPDC aplicado en los niveles P3, P4 y P5, y una fusion multi-escala ASFF (Adaptive Spatial Feature Fusion) sobre esas mismas tres salidas. El modelo se entrena y evalua exclusivamente sobre ACDC, el dataset de conduccion en condiciones meteorologicas adversas, con 8 clases.

El interes del checkpoint es metodologico: el autor documenta un protocolo de entrenamiento controlado (seed 42, modo determinista, Ultralytics 8.4.160, 100 epocas, 640 px, AdamW con lr 0.001) y publica las metricas oficiales de validacion junto con los deltas frente a dos variantes de referencia. Con 12.900.277 parametros y 29,8634 GFLOPs a 640 px, alcanza una precision de 0,5163, un recall de 0,3697, un mAP50 de 0,3796 y un mAP50-95 de 0,2252, con una latencia declarada de 10,0936 ms por imagen (99,07 FPS).

Su relevancia practica es limitada pero honesta: el propio autor concluye que, bajo la evaluacion actual de una sola semilla, ASFF no aporta una ganancia de precision proporcional a su coste computacional (los parametros crecen un 39,37 % y los GFLOPs un 27,09 % frente al baseline B2 YOLO12s, mientras el mAP50-95 cae 0,00097). Es, por tanto, un ejemplo util de resultado negativo documentado y de buenas practicas de trazabilidad experimental, mas que un candidato de despliegue. El repositorio no declara licencia y no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO12s (detector CNN/transformer hibrido de la familia Ultralytics) con AMPDC en P3, P4 y P5 y fusion multi-escala ASFF sobre P3/P4/P5 |
| Parametros totales | 12.900.277 (12,9 M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (deteccion de objetos sobre imagenes; entrada de 640x640 px) |
| Tipos de cuantizacion | no disponible (la model card no especifica cuantizaciones validadas) |
| Idiomas soportados | no aplicable (modelo de vision; no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | no especificado; el repositorio usa la libreria Ultralytics y ocupa 0,1 GB, cuyo formato habitual de checkpoint es .pt (PyTorch) |
| Tarea (pipeline) | object-detection |
| Dataset de entrenamiento | ACDC (8 clases) |
| GFLOPs a 640 px | 29,8634 |
| Epocas | 100 |
| Optimizador | AdamW (lr 0.001, weight decay 0.0005) |
| Version de Ultralytics | 8.4.160 |

## Arquitectura y entrenamiento

La base es YOLO12s, la variante small del detector YOLO12 de Ultralytics. Sobre ella se insertan bloques AMPDC en las tres escalas de feature map P3, P4 y P5, y a continuacion una capa de fusion cross-scale ASFF que genera tres salidas adaptativas independientes (ASFF-P3, ASFF-P4 y ASFF-P5). La cabeza Detect final recibe los tres mapas de caracteristicas fusionados. La implementacion de ASFF utiliza alineamiento espacial por vecino mas cercano (nearest-neighbor) para garantizar un entrenamiento determinista en CUDA. El aumento de complejidad es notable: respecto al baseline B2 YOLO12s, los parametros suben un 39,3686 % y los GFLOPs un 27,0876 %, hasta situar el modelo en 29,8634 GFLOPs a 640 px.

El protocolo de entrenamiento esta explicitamente controlado: dataset ACDC con 8 clases, 100 epocas, imagenes de 640 px, batch size 8, AdamW con learning rate 0,001 y weight decay 0,0005, semilla 42 y modo determinista activado sobre Ultralytics 8.4.160. La model card no detalla el numero de tokens ni la composicion del dataset mas alla de su nombre, ni menciona fases de RLHF, DPO o similares, algo esperable en un detector. Si se documenta una incidencia de trazabilidad relevante: la ejecucion anterior denominada A3_YOLO12s_AMPDC_ASFF es invalida para el analisis de ASFF porque Ultralytics reconstruyo el modelo a partir del YAML de A2 y elimino las capas ASFF; la ejecucion oficial valida es A3_YOLO12s_AMPDC_ASFF_FIXED.

## Capacidades

- Deteccion de objetos en imagenes: salida de cajas delimitadoras y clases sobre las 8 categorias de ACDC.
- Deteccion en condiciones meteorologicas adversas: el modelo esta entrenado y validado especificamente sobre ACDC (escenas con lluvia, niebla, noche y otros deterioros visuales).
- Fusion multi-escala adaptativa: las salidas ASFF-P3, ASFF-P4 y ASFF-P5 permiten al modelo ponderar dinamicamente caracteristicas de distintas resoluciones.
- Inferencia en tiempo real: 10,0936 ms por imagen y 99,07 FPS en la configuracion medida por el autor (hardware no especificado).
- Exportacion a otros runtimes: al usar la libreria Ultralytics, es compatible con el flujo de exportacion habitual de dicha libreria (ONNX, TensorRT, OpenVINO, etc.), aunque la model card no confirma ningun formato exportado.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision-lenguaje, audio ni modo de pensamiento: es un detector puro, no un modelo generativo.

## Casos de uso

- Investigacion en deteccion bajo clima adverso: sirve como punto de comparacion reproducible frente al baseline YOLO12s y a la variante A2 AMPDC, gracias al protocolo de semilla fija y modo determinista documentado.
- Estudio de modulos de fusion multi-escala: el checkpoint permite analizar experimentalmente si ASFF aporta ventajas frente a alternativas mas ligeras, con la conclusion publicada de que en este caso no lo hace.
- Reproduccion de resultados negativos: util para grupos que quieran replicar el hallazgo de que el incremento del 39,37 % en parametros y del 27,09 % en GFLOPs no se traduce en mejor mAP.
- Prototipado de sistemas de vision para vehiculos autonomos en entornos degradados, siempre que se acepte un recall bajo (0,3697) y se complemente con otros modulos.
- Docencia y formacion en tecnicas de entrenamiento controlado: el repositorio ejemplifica como fijar semilla, version de libreria y configuracion de optimizador para comparaciones justas.
- Deteccion en tiempo real sobre hardware modesto: con 12,9 M de parametros puede ejecutarse en GPUs de gama media, util para pruebas de concepto de videovigilancia o analitica de trafico en condiciones no ideales.
- Base para fine-tuning con datos propios: al ser un checkpoint Ultralytics, puede reentrenarse sobre dominios especificos (por ejemplo, trafico urbano nocturno), aunque la licencia sin definir limita su uso comercial.

## Benchmarks y rendimiento

Validacion oficial sobre ACDC segun la model card (una sola semilla, hardware de medida no especificado):

| Metrica | Valor |
|---|---|
| Precision | 0,5163253104 |
| Recall | 0,3697324805 |
| mAP50 | 0,3796275559 |
| mAP50-95 | 0,2251921600 |
| Latencia de inferencia | 10,0936 ms/imagen |
| FPS | 99,07 |

Comparacion controlada publicada por el autor (deltas):

| Referencia | Delta precision | Delta recall | Delta mAP50 | Delta mAP50-95 |
|---|---|---|---|---|
| B2 (YOLO12s baseline) | -0,01056 | -0,02416 | +0,00042 | -0,00097 |
| A2 (AMPDC sin ASFF) | -0,00780 | -0,00965 | -0,00704 | -0,00355 |

No se han publicado en la informacion disponible resultados en benchmarks estandar de deteccion como COCO (AP, AP50, AP75) ni comparaciones con arquitecturas ajenas a esta familia experimental. Los valores absolutos de los modelos de referencia B2 y A2 no se incluyen en la model card, solo sus diferencias.

## Requisitos de hardware

- Peso de los pesos en memoria: aproximadamente 51,6 MB en FP32, 25,8 MB en FP16 y 12,9 MB en INT8, calculado a partir de los 12.900.277 parametros (estimacion propia; la model card no publica pesos por formato).
- VRAM estimada para inferencia: en torno a 1-2 GB con batch 1 a 640 px, sumando pesos y activaciones (estimacion, no verificada en la model card).
- Cabe en GPU de consumo: si. Cualquier GPU con 4 GB o mas de VRAM es suficiente en la practica; una GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superior puede ejecutarlo.
- GPU recomendadas para produccion: RTX 4090, L4, A10G, A100 o H100 si se busca maximizar el throughput con batches grandes. La latencia de 10,0936 ms/imagen y 99,07 FPS publicada no especifica el hardware empleado.
- Opciones de despliegue: flujo nativo de Ultralytics (CLI y API de Python), exportacion a ONNX Runtime, TensorRT, OpenVINO, TensorFlow Lite o CoreML, y servidores genericos de modelos como Triton Inference Server. vLLM, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: 10,0936 ms/imagen y 99,07 FPS declarados por el autor; el hardware y el batch de la medicion no se indican, por lo que no deben tomarse como valores portables.
- Coste computacional: 29,8634 GFLOPs por imagen a 640 px, un 27,0876 % mas que el baseline B2 YOLO12s.

## Comparativa con modelos similares

| Modelo | Parametros | GFLOPs a 640 | Precision | Recall | mAP50 | mAP50-95 | Licencia |
|---|---|---|---|---|---|---|---|
| A3 YOLO12s + AMPDC + ASFF (este) | 12.900.277 | 29,8634 | 0,5163 | 0,3697 | 0,3796 | 0,2252 | no disponible |
| B2 YOLO12s (baseline) | no publicada (≈9,26 M derivado del delta de +39,3686 %) | no publicada (≈23,49 derivado del delta de +27,0876 %) | 0,5269 (derivada) | 0,3939 (derivada) | 0,3792 (derivada) | 0,2262 (derivada) | no disponible |
| A2 AMPDC (sin ASFF) | no disponible | no disponible | 0,5241 (derivada) | 0,3794 (derivada) | 0,3867 (derivada) | 0,2287 (derivada) | no disponible |
| Otros detectores de la misma categoria (YOLOv8s, YOLO11s, RT-DETR) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Notas: los valores marcados como derivados se obtienen restando o sumando los deltas publicados a las metricas de A3, que es el unico conjunto de valores absolutos que aparece en la model card; no son cifras publicadas de forma independiente. No hay datos en la informacion disponible para comparar con detectores fuera de esta familia experimental.

## Limitaciones y advertencias

- Resultado negativo documentado: el propio autor concluye que ASFF no aporta ganancia de precision proporcional a su coste, con caidas de 0,00097 en mAP50-95 y 0,02416 en recall frente al baseline B2.
- Recall bajo: 0,3697 significa que el modelo deja sin detectar una proporcion muy elevada de objetos reales, lo que lo hace inadecuado para aplicaciones criticas de seguridad sin un sistema complementario.
- Evaluacion de una sola semilla: pese al modo determinista, no hay repeticiones ni intervalos de confianza, por lo que las diferencias de pocas milesimas no son estadisticamente concluyentes.
- Trazabilidad de artefactos: la ejecucion A3_YOLO12s_AMPDC_ASFF es invalida para analizar ASFF porque las capas se perdieron al reconstruir el modelo desde el YAML de A2; solo debe usarse A3_YOLO12s_AMPDC_ASFF_FIXED.
- Licencia sin definir: la model card no declara licencia, lo que impide determinar si el uso comercial esta permitido. Ademas, el dataset ACDC tiene sus propias condiciones de uso que el autor no reproduce.
- Rendimiento fuera de dominio desconocido: no se han publicado evaluaciones en COCO ni en otros datasets, por lo que se desconoce su capacidad de generalizacion mas alla de ACDC.
- Sesgos potenciales del dominio: al entrenarse solo con escenas de conduccion en clima adverso y 8 clases, el modelo puede comportarse de forma deficiente con categorias, geografias o condiciones de iluminacion no representadas.
- Riesgo de falsos positivos y falsos negativos: inherente a un detector con precision 0,5163 y recall 0,3697; no debe usarse como unica fuente de decision.
- Madurez nula como artefacto publico: 0 descargas y 0 likes en el momento de la consulta, sin revision por pares ni documentacion de despliegue en produccion.
- Sin capacidades de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento multi-paso; cualquier uso conversacional requiere envolverlo con otro sistema.
- Repositorio de 0,1 GB, coherente con un unico checkpoint de 12,9 M de parametros; no incluye pesos en multiples formatos ni versiones cuantizadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AIOKiet/yolov12s-ampdc-asff-acdc
- Dataset ACDC (referenciado en la model card, sin enlace explicito): no disponible en la informacion proporcionada
- Paper de YOLO12 (referenciado por el nombre de la arquitectura, sin enlace en la model card): no disponible en la informacion proporcionada
- Repositorio de Ultralytics (libreria declarada, version 8.4.160; sin enlace en la model card): no disponible en la informacion proporcionada
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; unicamente aparecio contenido sin relacion con la tematica, por lo que no se incluye ningun enlace adicional.
