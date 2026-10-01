# dustinhugface/effv2l-r1

## Resumen

effv2l-r1 es un modelo de clasificación de imágenes publicado por el usuario dustinhugface en HuggingFace. Se trata de un EfficientNetV2-L (la implementación `efficientnet_v2_l` de torchvision) con 119.027.848 parámetros, ajustado sobre las 1000 clases de ImageNet mediante entrenamiento adversarial. No es un modelo de lenguaje: su entrada es una imagen y su salida son logits sobre 1000 categorías, por lo que conceptos como contexto, instrucciones o tool calling no aplican.

El modelo está vinculado a la subnet Perturb (netuid 26) de Bittensor, una red donde los mineros aportan modelos y la verificación se realiza on-chain. La model card incluye el hotkey del minero (`5EcaYjBACCFa1MCAwJj2ChPzzVCN8NWBLSSsHYHsJhBqB6xe`) y un hash sobre la concatenación del fichero de pesos y el hotkey, lo que permite comprobar la integridad y la autoría del modelo en la cadena.

Su interés actual es doble: por un lado sirve como pieza concreta para estudiar cómo se despliegan y verifican modelos de visión en subnets de Bittensor; por otro, es un ejemplo de ajuste adversarial sobre una arquitectura convolucional estándar a resolución 480x480. El repositorio es pequeño (0,5 GB) y la licencia Apache-2.0 permite uso comercial, aunque no se han publicado métricas de exactitud ni de robustez.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN con bloques Fused-MBConv y MBConv, torchvision `efficientnet_v2_l`) |
| Parámetros totales | 119.027.848 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes; entrada de 480x480 píxeles) |
| Tipos de cuantización | no disponible; el repositorio solo publica `model.safetensors` |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cargables con `safetensors.torch.load_file` sobre `torchvision.models.efficientnet_v2_l`) |
| Tarea (pipeline) | image-classification |
| Número de clases | 1000 (ImageNet-1K) |
| Resolución de entrada | 480x480 (bicubic resize a 480 y center crop a 480) |
| Normalización | media = desviación = 0,5 en los tres canales |
| Librería declarada | torchvision |
| Tamaño del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-30 |
| Fecha de actualización | 2026-09-30 |
| Hash on-chain | sha256(model.safetensors \|\| hotkey) = `7d80215d791507c72fb882cb3a20adcbc1a3c06ef0ef8c22770a565ab38804dd` |

## Arquitectura y entrenamiento

La base es EfficientNetV2-L, una red convolucional de la familia EfficientNetV2 que combina bloques Fused-MBConv en las etapas iniciales (donde convolución 3x3 y convolución 1x1 se fusionan en una sola operación) con bloques MBConv provistos de módulos de squeeze-and-excitation en las etapas profundas. El modelo parte de los pesos preentrenados de torchvision (`EfficientNet_V2_L_Weights.IMAGENET1K_V1`) y se ajusta después con entrenamiento adversarial para la subnet Perturb. El preprocesado asociado es el estándar de esos pesos: redimensionado bicúbico a 480, recorte central a 480 y normalización con media y desviación 0,5.

La información disponible no detalla el número de tokens o imágenes de entrenamiento, la composición del dataset de ajuste, ni los hiperparámetros del entrenamiento adversarial (tipo de ataque, magnitud de la perturbación, número de pasos, proporción de ejemplos adversarios). Tampoco se indica si hubo fases de RLHF o DPO, algo que no aplica a un clasificador de imágenes. La única innovación documentada es precisamente ese ajuste adversarial, orientado a que el modelo mantenga el rendimiento bajo perturbaciones, más el mecanismo de verificación on-chain mediante el hash del fichero de pesos y el hotkey del minero.

Carga del modelo tal y como la documenta el autor:

```python
from safetensors.torch import load_file
from torchvision.models import efficientnet_v2_l

model = efficientnet_v2_l(weights=None)
model.load_state_dict(load_file("model.safetensors"))
```

## Capacidades

- Clasificación de imágenes cerrada sobre las 1000 clases de ImageNet-1K, con salida de 1000 logits por imagen.
- Robustez adversarial: el modelo se ha ajustado específicamente con entrenamiento adversarial para la subnet Perturb, aunque no se publican métricas que cuantifiquen esa robustez.
- Inferencia a resolución 480x480, con el preprocesado de torchvision `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`.
- Extracción de representaciones: al ser una CNN, la salida de sus capas finales (por ejemplo, la salida previa a la capa de clasificación) puede emplearse como embedding visual para tareas de transferencia; esto es una propiedad de la arquitectura, no una capacidad documentada explícitamente por el autor.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, function calling, uso como agente ni razonamiento multi-paso.
- No soporta imagen-texto, respuesta a instrucciones, visión generativa ni audio.
- No hay capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Minería en la subnet Perturb (netuid 26) de Bittensor: el modelo se registra como aportación de un minero identificado por el hotkey indicado, y los validadores pueden comprobar la integridad del fichero de pesos recalculando el sha256 de `model.safetensors` concatenado con el hotkey.
- Servicio de clasificación de imágenes en producción: el modelo se carga con torchvision o se exporta a ONNX/TensorRT y se expone detrás de un endpoint que aplique el preprocesado exacto (bicubic 480, center crop 480, normalización 0,5) antes de devolver la clase de mayor probabilidad.
- Evaluación de robustez adversarial: sirve como baseline defensivo frente a otros modelos de la misma tarea, alimentándolo con ejemplos adversarios generados con ataques como FGSM o PGD para comparar la degradación de exactitud.
- Etiquetado automático de datasets: al cubrir las 1000 clases de ImageNet, puede preanotar grandes colecciones de imágenes con una taxonomía estándar y dejar solo la revisión humana de los casos de baja confianza.
- Filtrado y moderación de contenido visual: clasificación previa en pipelines de subida de imágenes para enrutar determinadas categorías a revisión, con la advertencia de que solo reconoce las 1000 clases de ImageNet.
- Deduplicación y búsqueda por similitud: usando las activaciones de las capas profundas como embedding, se pueden agrupar imágenes visualmente cercanas en un índice vectorial.
- Prototipado en hardware modesto: con 119 millones de parámetros y 0,5 GB de repositorio, se puede ejecutar en portátiles con GPU de gama de entrada o incluso en CPU para validar pipelines completos antes de escalar.
- Referencia docente para despliegue de modelos de visión en redes descentralizadas: ilustra el patrón completo de publicación, preprocesado declarado y verificación por hash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye exactitud top-1 ni top-5 sobre ImageNet-1K, ni resultados frente a ataques adversarios (AutoAttack, PGD, FGSM) que permitan cuantificar la ganancia del entrenamiento adversarial. Tampoco hay métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 476 MB solo para los pesos en fp32 y unos 238 MB en fp16, más el espacio de activaciones; en la práctica, entre 1 y 2 GB de VRAM en fp32 con lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente. Para lotes grandes o despliegue de alto throughput, una RTX 4090, A100 o H100 funcionan sobradamente, aunque están muy por encima de lo que el modelo necesita.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo modernas (RTX 3050, RTX 3060, RTX 4060, RTX 4090, GTX 1650 y superiores). También es viable en CPU, con latencias mayores.
- Opciones de despliegue: PyTorch con torchvision de forma directa, exportación a ONNX y ejecución con ONNX Runtime, TensorRT para maximizar rendimiento, TorchServe o Triton Inference Server para servir por HTTP/gRPC. Herramientas como vLLM, llama.cpp, Ollama o TGI no aplican, ya que están orientadas a modelos de lenguaje.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución de entrada | Tarea | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| dustinhugface/effv2l-r1 | 119.027.848 | 480x480 | Clasificación ImageNet-1K + ajuste adversarial | apache-2.0 | no disponible |
| EfficientNetV2-M (torchvision) | aprox. 54 millones | 480x480 | Clasificación ImageNet-1K | no disponible en esta ficha | no disponible en esta ficha |
| EfficientNetV2-S (torchvision) | aprox. 21 millones | 384x384 | Clasificación ImageNet-1K | no disponible en esta ficha | no disponible en esta ficha |
| ResNet-50 (torchvision) | aprox. 25,6 millones | 224x224 | Clasificación ImageNet-1K | no disponible en esta ficha | no disponible en esta ficha |

Las cifras de parámetros y resolución de las alternativas corresponden a sus implementaciones habituales en torchvision y se incluyen a modo orientativo. No se dispone de datos de exactitud comparables para este modelo, por lo que la comparación se limita a tamaño, resolución de entrada, tarea y licencia.

## Limitaciones y advertencias

- Es un clasificador de visión, no un modelo de lenguaje: no procesa texto, no sigue instrucciones y no tiene ventana de contexto ni soporte de idiomas.
- No se han publicado métricas de exactitud ni de robustez. No hay forma de verificar que el entrenamiento adversarial haya mejorado el comportamiento frente a ataques; la afirmación de la model card no está respaldada con números.
- Se desconocen los detalles del entrenamiento adversarial: tipo de ataque, magnitud de la perturbación, número de pasos y proporción de ejemplos adversarios empleados.
- Clasificación de conjunto cerrado: el modelo solo devuelve una de las 1000 clases de ImageNet, sin opción de "desconocido". Las imágenes fuera de esa taxonomía se etiquetarán de forma incorrecta con alta probabilidad.
- Sesgos heredados del preentrenamiento en ImageNet-1K, que está desequilibrado geográfica y culturalmente y contiene categorías problemáticas.
- El preprocesado es estricto: si no se aplica el redimensionado bicúbico a 480, el recorte central a 480 y la normalización con media y desviación 0,5, el rendimiento se degrada respecto al esperado.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar los avisos de licencia y de copyright, e incluir una copia de la licencia en las redistribuciones.
- El modelo está asociado a un hotkey concreto de la subnet Perturb; su utilidad en ese contexto depende de las reglas de la subnet y de la verificación del hash on-chain, que puede cambiar si el fichero de pesos se modifica.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad ni evaluación independiente.
- El identificador de fecha de creación y actualización del repositorio (2026-09-30) conviene comprobarlo antes de asumir cualquier cronología de versiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dustinhugface/effv2l-r1
- Perturb (subnet netuid 26 de Bittensor): https://perturbai.io
- Documentación de `efficientnet_v2_l` en torchvision: https://pytorch.org/vision/stable/models/generated/torchvision.models.efficientnet_v2_l.html
- Pesos y transformaciones `EfficientNet_V2_L_Weights.IMAGENET1K_V1`: https://pytorch.org/vision/stable/models/generated/torchvision.models.efficientnet_v2_l.html#torchvision.models.EfficientNet_V2_L_Weights
- Bittensor: https://bittensor.com
