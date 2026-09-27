# Samonte/pertrub158

## Resumen

pertrub158 es un modelo de clasificacion de imagenes publicado por el usuario Samonte en HuggingFace. Se trata de un EfficientNetV2-L (la variante grande de torchvision, `efficientnet_v2_l`, con 1.000 clases de ImageNet) afinado mediante entrenamiento adversarial para la subred Perturb (netuid 26) de la red Bittensor. El checkpoint se distribuye como pesos `safetensors` compatibles con la implementacion de torchvision y cuenta con 119.027.848 parametros (~119 M).

El problema que aborda es la robustez de un clasificador de imagenes frente a perturbaciones adversarias: en lugar de optimizar unicamente la precision sobre imagenes limpias, el entrenamiento incorpora ejemplos adversarios para que el modelo mantenga su prediccion bajo alteraciones disenadas para enganarlo. Esto lo situa en el nicho de la vision por computador robusta, no en el de los modelos de lenguaje.

Es relevante ahora por dos motivos. Por un lado, la subred Perturb de Bittensor incentiva economicamente la produccion de clasificadores resistentes a ataques, y este repositorio documenta explicitamente el hotkey del minero y un hash on-chain que vincula los pesos a ese participante. Por otro lado, ofrece un checkpoint ligero (~119 M de parametros, ~0,5 GB de repositorio) y con licencia Apache-2.0, lo que facilita su reutilizacion y su despliegue en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN, bloques MBConv y Fused-MBConv con squeeze-and-excitation, escalado compuesto) |
| Parametros totales | 119.027.848 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; modelo de vision con entrada fija de 480 x 480 px |
| Tipos de cuantizacion | no disponible (pesos publicados en `safetensors`, presumiblemente FP32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica; clasificacion sobre las 1.000 clases de ImageNet-1k (etiquetas en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Numero de clases | 1.000 (ImageNet-1k) |
| Resolucion de entrada | 480 x 480 (redimensionado bicubico a 480, recorte central 480, media = std = 0,5) |
| Libreria | torchvision |
| Pipeline | image-classification |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La base es EfficientNetV2-L, una red convolucional disenada mediante busqueda de arquitectura neuronal que combina bloques Fused-MBConv en las etapas iniciales (mas eficientes en GPU a baja profundidad) con bloques MBConv con atencion de canal (squeeze-and-excitation) en las etapas profundas. La variante L es la mayor de la familia y opera a 480 x 480 px, con aproximadamente 119 M de parametros, coherente con el recuento real del checkpoint. El modelo produce un vector de 1.000 logits correspondientes a las clases de ImageNet-1k.

El repositorio indica que el modelo se ha afinado con entrenamiento adversarial para la subred Perturb (netuid 26) de Bittensor, es decir, incorporando ejemplos adversarios en el bucle de entrenamiento para mejorar la robustez. No se documentan en la model card el tipo de ataque usado (por ejemplo PGD o FGSM), el valor de epsilon, el numero de epocas, la composicion del dataset de afinado ni si se aplicaron tecnicas adicionales como TRADES o destilacion adversaria: esos datos figuran como no disponibles. Si se explicita el mecanismo de compromiso on-chain: el hash sha256 calculado sobre la concatenacion de `model.safetensors` y el hotkey del minero (`5H8t4i1evmMSDvwQstyWrxGNTVP2ykakEahnpwg5SaDmaZxH`) es `2d8b029b34fdd26ea31e504ea935e0f69d74a98551a25a20a229156ca17b29be`, lo que permite verificar que los pesos publicados corresponden al participante declarado.

## Capacidades

- Clasificacion de imagenes en 1.000 categorias de ImageNet-1k a partir de entradas RGB de 480 x 480 px.
- Robustez frente a perturbaciones adversarias, objetivo declarado del afinado (grado concreto de robustez no documentado).
- Extraccion de caracteristicas: al ser una CNN profunda, las activaciones intermedias pueden reutilizarse como backbone o extractor de embeddings para tareas de vision posteriores.
- Inferencia determinista y ligera: ~119 M de parametros permiten ejecucion en CPU y en GPU de gama baja.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision-lenguaje.
- No soporta tool calling ni function calling.
- No tiene capacidades de agente ni razonamiento multi-paso.
- No es multilingue en el sentido de los modelos de lenguaje; su unica salida son indices de clase de ImageNet con etiquetas en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles mas alla de la clasificacion de imagen.

## Casos de uso

- Clasificacion de imagenes en produccion con requisito de robustez: se puede desplegar como servicio de inferencia que recibe una imagen RGB, aplica las transformaciones documentadas (`EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`) y devuelve la clase predicha; el afinado adversarial reduce la degradacion ante entradas manipuladas.
- Mineria en la subred Perturb (netuid 26) de Bittensor: el repositorio incluye hotkey e hash on-chain, de modo que el checkpoint esta pensado para presentarse como candidato de minero y ser evaluado por la subred frente a perturbaciones.
- Seguridad y defensa ante ataques adversarios: util como componente de un pipeline que debe resistir ejemplos manipulados deliberadamente (por ejemplo, parches o ruido anadido) sin cambiar la etiqueta asignada.
- Etiquetado automatico de datasets de vision: al cubrir 1.000 clases de ImageNet, permite pseudo-etiquetar grandes volumenes de imagenes y acelerar la anotacion manual posterior.
- Filtrado y moderacion de contenido visual: como primer clasificador de categoria para descartar o marcar imagenes antes de etapas mas costosas.
- Transfer learning: reutilizar los pesos como inicializacion para una tarea de clasificacion con menos clases, sustituyendo la cabeza final y reentrenando.
- Benchmarking de robustez: servir como referencia base para comparar la resistencia de otros clasificadores frente a los mismos ataques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, robustez, ataques evaluados ni comparaciones numericas.

Como referencia externa y claramente diferenciada, el checkpoint base de torchvision `efficientnet_v2_l` (pesos IMAGENET1K_V1) esta documentado por PyTorch con una precision top-1 en ImageNet-1k en torno al 85,7 % a 480 x 480. Esta cifra corresponde al modelo preentrenado original y no debe atribuirse a pertrub158, cuyo rendimiento tras el afinado adversarial no se ha publicado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos mas el coste de activaciones a 480 x 480; en la practica cabe holgadamente en 2 GB.
- En FP16 el peso de los parametros baja a aproximadamente 0,24 GB; en INT8, a aproximadamente 0,12 GB (no se distribuyen variantes cuantizadas).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM, incluidas GTX 1650, RTX 3050/3060/4090; tambien es viable en CPU para cargas moderadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna y en muchos SoC con acelerador neuronal tras conversion.
- Opciones de despliegue: PyTorch/torchvision nativo, TorchScript, exportacion a ONNX con ONNX Runtime, TensorRT para NVIDIA. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|
| Samonte/pertrub158 (EfficientNetV2-L afinado) | 119 M | 480 x 480 | 1.000 | apache-2.0 | HuggingFace | no disponible |
| torchvision efficientnet_v2_l (base IMAGENET1K_V1) | ~118 M | 480 x 480 | 1.000 | BSD-3-Clause (pesos torchvision) | torchvision | ~85,7 % top-1 en ImageNet-1k (documentado por PyTorch) |
| ResNet-50 | ~25,6 M | 224 x 224 | 1.000 | BSD-3-Clause | torchvision | no comparado en esta ficha |
| ConvNeXt-L | ~198 M | 224 x 224 | 1.000 | BSD-3-Clause | torchvision | no comparado en esta ficha |

No se dispone de resultados de robustez comparables entre pertrub158 y estas alternativas, por lo que la comparacion se limita a tamano, resolucion de entrada, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos: al derivar de un clasificador entrenado sobre ImageNet-1k, hereda los sesgos de representacion de ese dataset (desequilibrios por categoria, cultura y contexto geografico).
- Riesgo de error: la salida son 1.000 clases cerradas; para imagenes fuera de esa taxonomia el modelo forzara una de las clases existentes y puede producir etiquetas incorrectas con alta confianza.
- Robustez no cuantificada: aunque el entrenamiento es adversarial, no se publican el tipo de ataque, el epsilon ni las metricas de robustez, de modo que no es posible verificar el nivel de resistencia alcanzado en produccion.
- Contexto y modalidad: no procesa texto, audio ni video, y no mantiene contexto conversacional; es exclusivamente un clasificador de imagen unica.
- Preprocesado obligatorio: el modelo espera las transformaciones de `EfficientNet_V2_L_Weights.IMAGENET1K_V1` (bicubico a 480, recorte central 480, media = std = 0,5); usar otro preprocesado degradara la precision.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones de la subred Perturb y de Bittensor si el modelo se va a emplear en el contexto de mineria, ya que el hash on-chain vincula el checkpoint a un hotkey concreto.
- Adopcion y validacion: el repositorio registra 0 descargas y 0 likes, y no incluye evaluaciones independientes; debe validarse en el dominio objetivo antes de usarlo en produccion.
- Fechas: el repositorio figura creado y actualizado el 26 de septiembre de 2026 (fechas tal como constan en la informacion proporcionada).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Samonte/pertrub158
- Subred Perturb: https://perturbai.io
- Documentacion de torchvision para EfficientNetV2: https://pytorch.org/vision/stable/models/efficientnetv2.html
- Documentacion de Bittensor: https://bittensor.com
