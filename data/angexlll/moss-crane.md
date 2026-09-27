# ANGExllL/moss-crane

## Resumen

ANGExllL/moss-crane es un modelo de clasificación de imágenes publicado en Hugging Face por el usuario ANGExllL. Se trata de un EfficientNetV2-L de torchvision (`efficientnet_v2_l`), con 119.027.848 parámetros, ajustado sobre las 1000 clases de ImageNet-1K y sometido a un proceso de entrenamiento adversarial según declara su model card. El repositorio ocupa 0,5 GB y distribuye los pesos en formato safetensors, con licencia Apache 2.0.

El modelo se enmarca en la subred Perturb (netuid 26) de Bittensor: la model card lo identifica como un minero de esa subred, con una hotkey concreta y un hash on-chain calculado como sha256(model.safetensors || hotkey). Ese hash permite verificar que los pesos publicados corresponden al minero registrado, un mecanismo de trazabilidad habitual en las subredes de Bittensor. El objetivo declarado es por tanto doble: servir como clasificador de imágenes y participar como nodo minero en un entorno de evaluación adversarial.

No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso, y no tiene ventana de contexto en el sentido habitual. Su entrada es una imagen de 480x480 píxeles y su salida es un vector de 1000 logits correspondientes a las clases de ImageNet. La información disponible no incluye métricas de precisión, robustez adversarial ni detalles del ataque empleado durante el entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN con compound scaling, bloques MBConv y Fused-MBConv), implementación `torchvision.models.efficientnet_v2_l` |
| Parametros totales | 119.027.848 (dato real del safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen de 480x480 píxeles |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors en su precisión original (no se indica el dtype) |
| Idiomas soportados | no aplica (clasificación de imágenes); las etiquetas de salida son las 1000 clases de ImageNet-1K, en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), cargable con `safetensors.torch.load_file` |
| Tarea | image-classification (clasificación multiclase, 1000 clases) |
| Preprocesado | `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`: redimensionado bicúbico a 480, center crop 480, media = desviación = 0,5 |
| Libreria | torchvision |
| Tamano del repositorio | 0,5 GB |
| Subred / ecosistema | Perturb (Bittensor netuid 26); miner hotkey `5DhtFUDenAuSzn3EVhjL29UFWJbT1MoUVAJ83Ft94biBy25e` |
| Hash on-chain | sha256(model.safetensors \|\| hotkey) = `afde77b258aa426c350594a0f3103d1d539e26557685950a306aab83e6f6f246` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-27 / 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura es una EfficientNetV2-L estándar, la variante grande de la familia EfficientNetV2 incluida en torchvision. EfficientNetV2 combina bloques Fused-MBConv en las etapas iniciales y MBConv con atención squeeze-and-excitation en las etapas profundas, y escala profundidad, anchura y resolución de forma compuesta. En esta configuración concreta, la resolución de trabajo es 480x480 y la cabeza de clasificación produce 1000 salidas correspondientes a ImageNet-1K. El checkpoint es un `state_dict` puro que se carga sobre un `efficientnet_v2_l(weights=None)`, sin modificaciones estructurales indicadas en la model card.

Sobre el entrenamiento, la model card únicamente declara que se trata de un ajuste con *adversarial training* para la subred Perturb (netuid 26). No se especifican el número de tokens o imágenes de entrenamiento, la composición exacta del dataset más allá de las 1000 clases de ImageNet, ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un clasificador de imágenes). Tampoco se documentan los parámetros del ataque adversarial empleado: no hay información sobre la norma Lp utilizada, el valor de epsilon, el número de iteraciones (por ejemplo PGD) ni la proporción de ejemplos adversarios en cada lote. Esa ausencia de detalle impide reproducir el procedimiento de entrenamiento a partir de la información disponible.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1K a partir de entradas de 480x480 píxeles, con el preprocesado bicúbico y la normalización especificados.
- Robustez adversarial declarada: el modelo ha sido ajustado con entrenamiento adversarial, orientado a mantener el rendimiento frente a perturbaciones en la entrada. No se publican métricas que cuantifiquen esa robustez.
- Extracción de características: al ser un `state_dict` de EfficientNetV2-L, la cabeza de clasificación puede sustituirse o eliminarse para usar el backbone como extractor de embeddings visuales en tareas de transferencia.
- Inferencia en CPU y GPU sin dependencias exóticas: solo requiere `torch`, `torchvision` y `safetensors`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No incorpora modo *thinking*, visión-lenguaje, audio ni ninguna otra modalidad: la entrada es exclusivamente una imagen y la salida un vector de logits.
- Trazabilidad on-chain mediante verificación del hash sha256 de los pesos concatenados con la hotkey del minero.

## Casos de uso

- Minería en la subred Perturb (netuid 26) de Bittensor: es el propósito declarado del modelo. El operador cargaría el `state_dict` en un `efficientnet_v2_l`, atendería las peticiones de clasificación de la subred y validaría la autenticidad de los pesos con el hash on-chain antes de desplegarlos.
- Clasificación de imágenes a escala en pipelines de producción: con 119 M de parámetros y 0,5 GB de checkpoint, se puede servir detrás de una API HTTP para etiquetar catálogos de producto, activos multimedia o imágenes de stock en las categorías de ImageNet.
- Pre-etiquetado de datasets y *active learning*: usar el modelo como anotador automático de primer paso y reservar la revisión humana para las muestras de baja confianza, reduciendo el coste de construir datasets etiquetados.
- Extracción de embeddings para búsqueda visual: eliminando la capa final, las activaciones del backbone sirven como descriptores para indexar imágenes y recuperar similares por distancia coseno o euclídea.
- Filtrado y moderación aproximada de contenido: clasificación en categorías amplias de ImageNet (por ejemplo, objetos, animales, instrumentos) como señal auxiliar en sistemas de moderación, siempre con la limitación de que solo cubre 1000 clases predefinidas.
- Punto de partida para *fine-tuning* en dominios específicos: al ser un checkpoint completo de EfficientNetV2-L con licencia Apache 2.0, es reutilizable como inicialización para tareas de clasificación propias (médicas, industriales, agrícolas) con un conjunto de datos mucho menor.
- Evaluación de robustez en entornos ruidosos: dado su entrenamiento adversarial declarado, es un candidato para desplegarse en escenarios donde las imágenes llegan comprimidas, con ruido de sensor o ligeramente manipuladas, aunque la ausencia de métricas obliga a validar ese extremo antes de producción.
- Inferencia en *edge* o en CPU: los requisitos de memoria son moderados, lo que permite ejecutarlo en servidores sin GPU o en dispositivos con pocos recursos para clasificación por lotes en segundo plano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de ANGExllL/moss-crane no incluye precisión top-1 ni top-5, evaluación de robustez adversarial (por ejemplo, exactitud bajo ataque PGD), ni ningún otro dato numérico. Los resultados de búsqueda web recuperados no guardan relación con este modelo y no aportan métricas.

| Benchmark | Valor | Nota |
|---|---|---|
| ImageNet-1K top-1 | no disponible | no reportado por el autor |
| ImageNet-1K top-5 | no disponible | no reportado por el autor |
| Robustez adversarial (L-inf, L-2) | no disponible | no se documentan ataque ni epsilon |
| Latencia / throughput | no disponible | no medidos en la informacion disponible |

## Requisitos de hardware

- Pesos en memoria: 119 M de parámetros equivalen aproximadamente a 476 MB en FP32 y 238 MB en FP16. El repositorio de 0,5 GB es coherente con un checkpoint en FP32.
- VRAM estimada para inferencia a 480x480 con batch 1: en torno a 1-2 GB en FP32 y menos de 1 GB en FP16, sumando pesos y activaciones (estimación, no hay mediciones publicadas).
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM, como GTX 1650, RTX 3050, RTX 3060 o superiores. No requiere GPUs de centro de datos.
- GPU recomendadas para producción con concurrencia: cualquier GPU moderna con al menos 8-16 GB (RTX 4080/4090, L4, A10G, A100, H100), donde el cuello de botella será el preprocesado de imagen en CPU más que la propia red.
- Inferencia en CPU viable para lotes pequeños o moderados, especialmente con `torch.jit` o exportando a ONNX Runtime; a 480x480 la latencia por imagen será del orden de decenas a cientos de milisegundos según el núcleo.
- Opciones de despliegue: PyTorch nativo, TorchScript, exportación a ONNX / ONNX Runtime, TensorRT, TorchServe, Triton Inference Server o BentoML.
- No aplica vLLM, llama.cpp, Ollama ni TGI: son servidores orientados a modelos de lenguaje y este es un clasificador de imágenes.
- Latencia y throughput concretos: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros (aprox.) | Resolucion de entrada | Tarea | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|---|
| ANGExllL/moss-crane (EfficientNetV2-L ajustado) | CNN | 119 M | 480x480 | Clasificacion 1000 clases + adversarial | apache-2.0 | no disponible |
| EfficientNetV2-M (torchvision) | CNN | 54 M | 480x480 | Clasificacion 1000 clases | no disponible en la informacion | no disponible |
| ConvNeXt-L (torchvision) | CNN | 198 M | 224x224 | Clasificacion 1000 clases | no disponible en la informacion | no disponible |
| ViT-B/16 (torchvision) | Transformer de vision | 86 M | 224x224 | Clasificacion 1000 clases | no disponible en la informacion | no disponible |
| ResNet-50 (torchvision) | CNN | 25,6 M | 224x224 | Clasificacion 1000 clases | no disponible en la informacion | no disponible |

La comparación se limita a parámetros y resolución de entrada, ya que la información disponible sobre moss-crane no incluye métricas de precisión ni de robustez, y los resultados de búsqueda no aportan datos de los modelos alternativos. La diferencia funcional más relevante frente a las alternativas es el entrenamiento adversarial declarado y su integración en la subred Perturb de Bittensor, aspectos que no existen en los checkpoints estándar de torchvision.

## Limitaciones y advertencias

- Ausencia total de métricas: no se publica precisión en ImageNet ni evaluación de robustez, por lo que no hay evidencia cuantitativa de que el ajuste adversarial haya funcionado ni de su coste en precisión sobre datos limpios.
- El entrenamiento adversarial suele implicar un compromiso entre exactitud en condiciones normales y robustez frente a perturbaciones; sin datos publicados, ese compromiso es desconocido para este checkpoint.
- El modelo es un clasificador cerrado de 1000 clases. No detecta objetos, no segmenta, no genera descripciones y no responde a preguntas sobre la imagen.
- Sesgos heredados de ImageNet-1K: taxonomía WordNet, clases desequilibradas y categorías de personas con posibles sesgos demográficos. Cualquier uso en decisiones que afecten a personas requiere validación específica.
- Riesgo de clasificaciones erróneas con alta confianza (mala calibración fuera de la distribución de entrenamiento); conviene aplicar umbrales de confianza y validación humana en aplicaciones sensibles.
- El preprocesado no es opcional: usar otra resolución, interpolación o normalización distinta de la especificada degradará los resultados.
- No hay información sobre el dtype de los pesos ni sobre versiones cuantizadas; cualquier cuantización a INT8 o FP16 debe validarse por cuenta propia.
- Repositorio sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación externa conocida.
- El hash on-chain vincula los pesos a la hotkey indicada; si se modifica el archivo `model.safetensors`, la verificación dejará de coincidir y el modelo no será aceptado como válido en ese contexto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario asume la responsabilidad sobre el cumplimiento normativo (por ejemplo, protección de datos si se procesan imágenes personales) y sobre la procedencia de los datos de entrenamiento, no detallada en la model card.
- Los resultados de búsqueda web recuperados (Microsoft Foundry, ModelForest, MOSS-TTS, artículo MoSs de AAAI) no están relacionados con este modelo y no deben usarse como documentación del mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ANGExllL/moss-crane
- Perfil del autor en Hugging Face: https://huggingface.co/ANGExllL/models
- Subred Perturb (netuid 26 de Bittensor), referenciada en la model card: https://perturbai.io
- Resultados de búsqueda no relacionados con el modelo (listados por transparencia, no aportan información sobre moss-crane):
  - https://ojs.aaai.org/index.php/AAAI/article/view/37611 (artículo sobre Mixture of Scales, generación autorregresiva de alta resolución)
  - https://learn.microsoft.com/en-us/azure/foundry/concepts/foundry-models-overview
  - https://mrunreal.github.io/ModelForest/
  - https://github.com/OpenMOSS/MOSS-TTS
