# qhoenix/jade-finch

## Resumen

qhoenix/jade-finch es un modelo de clasificacion de imagenes publicado en HuggingFace por el usuario qhoenix. Se trata de un EfficientNetV2-L de torchvision (`efficientnet_v2_l`, 1000 clases de ImageNet) afinado mediante entrenamiento adversarial. El modelo no es un modelo de lenguaje: su tarea es asignar una de las 1000 clases de ImageNet a una imagen de entrada, y su interes tecnico reside en la robustez frente a perturbaciones adversariales.

El modelo se ha desarrollado especificamente para la subnet Perturb (netuid 26) de la red Bittensor, un contexto en el que los mineros compiten por ofrecer clasificadores resistentes a perturbaciones. La model card incluye la hotkey del minero (`5HTMujxdVwf78DNbnLY8dAqyQLykd2mdSzZg47iA2Xs8NmTi`) y un hash on-chain que vincula los pesos con esa identidad, lo que aporta trazabilidad de procedencia.

Con 119.027.848 parametros y un peso en safetensors de aproximadamente 0,5 GB, es un modelo de vision de tamano medio, desplegable en GPU de consumo. Su relevancia actual es acotada: no documenta resultados de benchmarks ni variantes cuantizadas, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (torchvision `efficientnet_v2_l`), red neuronal convolucional |
| Parametros totales | 119.027.848 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes); entrada de 480 x 480 px |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica; las 1000 etiquetas de salida corresponden a clases de ImageNet (nominadas en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (un unico archivo `model.safetensors`) |

Datos adicionales de la model card:

| Parametro | Valor |
|---|---|
| Preprocesado | `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`; redimensionado bicubico a 480, recorte central 480, media = desviacion tipica = 0,5 |
| Clases de salida | 1000 (ImageNet) |
| Libreria declarada | torchvision |
| Hotkey del minero | `5HTMujxdVwf78DNbnLY8dAqyQLykd2mdSzZg47iA2Xs8NmTi` |
| Hash on-chain | `sha256(model.safetensors || hotkey)` = `323898b6a30b97eddb69840caf49fe7d17f2d7b46abf7a9b06e0fe8fa0acb5ae` |
| Tamano del repositorio | 0,5 GB |
| Fecha de creacion | 2026-09-27T12:46:39Z (segun los metadatos de HuggingFace) |
| Fecha de actualizacion | 2026-09-27T12:46:45Z (segun los metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es EfficientNetV2-L, una red convolucional que emplea bloques MBConv y Fused-MBConv con escalado compuesto, segun la implementacion disponible en torchvision. El modelo parte de la configuracion estandar `efficientnet_v2_l` con 119.027.848 parametros, lo que coincide con el recuento declarado en el repositorio. La tarea es de clasificacion sobre las 1000 clases de ImageNet y la salida es un vector de logits de 1000 dimensiones.

El elemento diferenciador declarado es el entrenamiento adversarial: el autor indica que los pesos se han afinado con este procedimiento para la subnet Perturb (netuid 26) de Bittensor. La model card no especifica el numero de tokens ni de imagenes empleadas, la composicion del dataset, el metodo concreto de generacion de perturbaciones, el presupuesto de epsilon ni si se aplicaron tecnicas adicionales como destilacion o aumento de datos. Tampoco se detalla el numero de pasos de entrenamiento, el optimizador ni la estrategia de ajuste de hiperparametros. Toda esta informacion se considera no disponible.

El unico mecanismo de verificacion documentado es la vinculacion criptografica entre los pesos y la identidad del minero mediante el hash `sha256(model.safetensors || hotkey)`, recuperable a partir del archivo de pesos y la hotkey publicada.

Carga del modelo, segun la model card:

```python
from safetensors.torch import load_file
from torchvision.models import efficientnet_v2_l
model = efficientnet_v2_l(weights=None)
model.load_state_dict(load_file("model.safetensors"))
```

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet, con salida de logits sobre las que aplicar softmax.
- Inferencia sobre imagenes RGB preprocesadas a 480 x 480 px con el pipeline `IMAGENET1K_V1` (redimensionado bicubico, recorte central, normalizacion con media y desviacion 0,5).
- Robustez a perturbaciones adversariales, segun la intencion declarada del entrenamiento, orientada a la subnet Perturb (netuid 26).
- Uso como extractor de caracteristicas convolucionales para tareas de transferencia, aunque la model card no lo documenta explicitamente.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision-lenguaje, audio ni modo de razonamiento: es un clasificador de imagenes puro.

## Casos de uso

- Mineria en la subnet Perturb (netuid 26) de Bittensor: el modelo se ha afinado especificamente para este entorno, de modo que un minero puede desplegarlo como clasificador resistente a perturbaciones y validar su procedencia mediante el hash on-chain.
- Clasificacion de imagenes en produccion: integrable en un servicio de inferencia que reciba imagenes RGB, las preprocese a 480 x 480 con el pipeline documentado y devuelva la clase ImageNet de mayor probabilidad.
- Etiquetado automatico de datasets de imagenes: uso como preanotador sobre grandes volumenes de imagenes para reducir el trabajo manual, aprovechando su tamano moderado (0,5 GB) para procesar lotes en una sola GPU.
- Evaluacion de robustez adversarial en investigacion: empleo como linea base afinada con perturbaciones para comparar contra clasificadores entrenados de forma estandar sobre ImageNet.
- Filtrado o moderacion de contenido visual por categorias: clasificacion en categorias de ImageNet como apoyo a reglas de negocio, teniendo en cuenta que las 1000 clases no cubren taxonomias de moderacion especificas.
- Transferencia a dominios verticales: ajuste fino de la cabeza de clasificacion sobre un dataset propio cuando se parte de caracteristicas convolucionales ya entrenadas en ImageNet.
- Control de calidad en lineas de inspeccion visual: clasificacion de imagenes de producto o pieza, con la advertencia de que se requeriria un ajuste fino adicional porque las clases de ImageNet no coinciden con defectos industriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud top-1, top-5, metricas frente a ataques adversariales (por ejemplo, exactitud bajo PGD o FGSM), ni comparaciones con el modelo base `efficientnet_v2_l` de torchvision.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 476 MB solo para los pesos en fp32 (119.027.848 parametros x 4 bytes) y aproximadamente 238 MB en fp16, a lo que hay que sumar el coste de activaciones, que depende del tamano de lote; se trata de una estimacion calculada a partir del recuento de parametros, no de un dato publicado por el autor.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente para inferencia en fp32 con lotes pequenos; una RTX 3060, RTX 4070, RTX 4090, A100 o H100 cubren el modelo con holgura.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con 2 GB o mas de VRAM, dado el tamano de 119 millones de parametros.
- Opciones de despliegue: carga nativa con torchvision y safetensors tal como documenta la model card; exportacion a ONNX y ejecucion con ONNX Runtime; conversion a TensorRT o uso de servidores de inferencia como Triton o TorchServe. No se documenta soporte de llama.cpp ni Ollama, que no aplican a modelos de vision de este tipo.
- Latencia y throughput: no disponible. El autor no publica mediciones de latencia, imagenes por segundo ni tipo de GPU empleada en la evaluacion.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| qhoenix/jade-finch | 119.027.848 | 480 x 480 | Clasificacion ImageNet, afinado con entrenamiento adversarial | apache-2.0 | HuggingFace, safetensors | Repositorio sin descargas ni likes; sin benchmarks publicados |
| torchvision `efficientnet_v2_l` (IMAGENET1K_V1) | misma arquitectura, recuento equivalente (no confirmado en la informacion disponible) | 480 x 480 (transformacion de referencia) | Clasificacion ImageNet | licencia del proyecto torchvision (no confirmada en la informacion disponible) | Pesos oficiales de torchvision | Modelo base del que parte jade-finch; entrenamiento estandar, sin la componente adversarial declarada |
| Otros clasificadores ImageNet comparables (ConvNeXt, ViT, EfficientNet-B) | no disponible | no disponible | Clasificacion ImageNet | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa |

La comparacion cuantitativa de rendimiento no es posible: no hay resultados de benchmarks publicados para jade-finch ni datos en la informacion proporcionada sobre los modelos alternativos.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al derivar de un modelo entrenado sobre ImageNet hereda las limitaciones de representacion y los sesgos de esa taxonomia (por ejemplo, categorias culturalmente sesgadas o poco representadas).
- Riesgo de alucinacion en sentido estricto no aplica, ya que no genera texto; el riesgo equivalente es la asignacion de una clase incorrecta con alta confianza, especialmente fuera de la distribucion de ImageNet.
- El modelo solo produce etiquetas de las 1000 clases de ImageNet; no cubre categorias personalizadas ni dominios especializados sin un ajuste fino adicional.
- La model card no especifica el metodo de entrenamiento adversarial, el presupuesto de perturbacion ni el conjunto de validacion, por lo que la robustez declarada no es verificable con los datos publicados.
- No se documentan variantes cuantizadas, soporte multilingue ni capacidades multimodales.
- La licencia apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni se hace responsable del uso; se recomienda verificar la procedencia de los pesos mediante el hash on-chain antes de desplegarlos.
- El repositorio registra 0 descargas y 0 likes, y el modelo es muy reciente segun los metadatos, por lo que no existe validacion por parte de la comunidad.
- Las fechas de creacion y actualizacion indicadas (2026-09-27) proceden de los metadatos de HuggingFace y no se han podido contrastar con otra fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qhoenix/jade-finch
- Subnet Perturb (netuid 26) de Bittensor: https://perturbai.io
- Documentacion de torchvision, `efficientnet_v2_l`: https://pytorch.org/vision/stable/models/efficientnetv2.html
- Documentacion de safetensors: https://github.com/huggingface/safetensors
