# ANGExllL/silver-wren

## Resumen

ANGExllL/silver-wren es un modelo de clasificación de imágenes basado en EfficientNetV2-L, la variante large de la familia EfficientNetV2, distribuida a través de torchvision. Se trata de un ajuste fino con entrenamiento adversarial del clasificador original de ImageNet-1k (1000 clases), publicado para la subred Perturb (netuid 26) de Bittensor, un entorno de minería descentralizada orientado, según las etiquetas del repositorio (`adversarial-training`, `perturb`), a la robustez frente a perturbaciones adversariales.

El modelo tiene 119.027.848 parámetros y una entrada fija de 480x480 px. El preprocesado es el heredado de `EfficientNet_V2_L_Weights.IMAGENET1K_V1`: redimensionado bicúbico a 480, recorte central de 480 y normalización con media y desviación típica de 0,5 en los tres canales. La licencia es Apache-2.0 y los pesos se distribuyen en un único fichero safetensors; el repositorio ocupa aproximadamente 0,5 GB.

Su relevancia es deliberadamente especializada: no es un modelo generativo ni multimodal, no procesa lenguaje natural ni soporta tool calling, y su función es actuar como minero de la subred Perturb clasificando imágenes de forma robusta ante perturbaciones. Para un desarrollador ajeno a ese ecosistema, el interés reside en el ajuste adversarial aplicado sobre una arquitectura convolucional estándar, reutilizable como backbone o como referencia de robustez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN con bloques Fused-MBConv y MBConv, escalado compuesto) |
| Parametros totales | 119.027.848 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija de 480x480 px, 1000 clases) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay versiones cuantizadas documentadas) |
| Idiomas soportados | no aplica (clasificación de imágenes, sin componente de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, state_dict de torchvision) |

## Arquitectura y entrenamiento

La base es EfficientNetV2-L, una red neuronal convolucional que combina bloques Fused-MBConv (convolución 3x3 fusionada con la expansión 1x1) y bloques MBConv, con escalado compuesto de profundidad, anchura y resolución. El modelo original fue entrenado por Google con aprendizaje progresivo y destilación, y torchvision distribuye los pesos de ImageNet-1k como `efficientnet_v2_l`. La cabeza de clasificación cubre las 1000 clases de ImageNet.

Sobre esa base, el autor ha aplicado un ajuste fino con entrenamiento adversarial para la subred Perturb (netuid 26) de Bittensor. La model card no especifica el volumen de imágenes de entrenamiento, el tipo de ataque (FGSM, PGD, etc.), el presupuesto de perturbación ni si se emplearon variantes como TRADES. El único detalle técnico documentado, además del hash on-chain del checkpoint, es el preprocesado: redimensionado bicúbico a 480 px, recorte central a 480 px y normalización con media y desviación típica de 0,5 en los tres canales.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k.
- Clasificación robusta ante perturbaciones adversariales, fruto del ajuste con entrenamiento adversarial (el grado de robustez no está cuantificado en la información disponible).
- Extracción de características: al ser un EfficientNetV2-L, la salida previa a la cabeza puede emplearse como embedding visual para tareas de transferencia.
- Inferencia por lotes en GPU o CPU mediante PyTorch y torchvision.
- No soporta generación de texto, razonamiento simbólico ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de texto de ningún tipo.
- No dispone de modo de razonamiento (thinking), audio ni generación de imágenes: la única modalidad de entrada es imagen y la única salida es una distribución sobre 1000 clases.

## Casos de uso

- Minería de la subred Perturb (netuid 26): el modelo se publica como minero de esa subred de Bittensor, por lo que su uso previsto es responder a las peticiones de clasificación robusta del protocolo.
- Clasificación de imágenes en entornos con ruido o compresión agresiva: útil cuando las imágenes de entrada han sufrido artefactos (JPEG de baja calidad, reescalados) y se necesita una predicción estable sobre las 1000 clases de ImageNet.
- Backbone para transferencia: se puede congelar o afinar sobre un dataset propio sustituyendo la cabeza de 1000 clases, aprovechando los 119 M de parámetros preentrenados.
- Extracción de embeddings visuales: el vector previo a la capa de clasificación sirve como descriptor para búsqueda por similitud, clustering o indexación de imágenes.
- Evaluación de robustez adversarial: sirve como punto de comparación frente al EfficientNetV2-L original sin ajuste adversarial, para medir la degradación de precisión bajo ataques.
- Filtrado defensivo de contenido: en pipelines donde la entrada puede estar manipulada maliciosamente, un clasificador entrenado de forma adversaria reduce la tasa de evasión.
- Docencia e investigación en aprendizaje adversarial: el repositorio incluye el hash on-chain y el script de carga, lo que facilita reproducir experimentos de robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión top-1/top-5 en ImageNet, ni evaluaciones bajo ataque (AutoAttack, PGD), ni curvas de robustez frente a epsilon. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 476 MB solo para los pesos; en fp16/bf16, alrededor de 238 MB.
- VRAM estimada en inferencia con lotes pequeños: menos de 2 GB en total, incluyendo activaciones a 480x480.
- GPU recomendadas: cualquier GPU con soporte CUDA y más de 2 GB de VRAM es suficiente. Para alto throughput en lotes grandes, una A100, H100, L40S o RTX 4090 aportan margen de sobra; en la práctica no se necesita hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier modelo moderno (RTX 3060, RTX 4060, GTX 1650, etc.). La inferencia en CPU también es viable para cargas moderadas.
- Opciones de despliegue: PyTorch + torchvision de forma nativa (es el método documentado en la model card), exportación a ONNX para ONNX Runtime, TensorRT, TorchServe o NVIDIA Triton Inference Server para servir por lotes.
- Latencia y throughput estimados: no disponible; dependerán del hardware, del tamaño de lote y de la resolución fija de 480x480.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ANGExllL/silver-wren | 119,0 M | 480x480 | 1000 | Apache-2.0 | HuggingFace (safetensors) |
| EfficientNetV2-L (torchvision, ImageNet-1k) | ≈118,5 M | 480x480 | 1000 | consultar ficha de torchvision | torchvision |
| EfficientNetV2-M (torchvision, ImageNet-1k) | ≈54,1 M | 480x480 | 1000 | consultar ficha de torchvision | torchvision |
| ResNet-50 (torchvision, ImageNet-1k) | ≈25,6 M | 224x224 | 1000 | consultar ficha de torchvision | torchvision |

La comparación con las alternativas se limita a arquitectura, tamaño y resolución, ya que no hay métricas publicadas para silver-wren. Frente al EfficientNetV2-L original, la diferencia es el ajuste con entrenamiento adversarial; frente a EfficientNetV2-M y ResNet-50, silver-wren ofrece mayor capacidad a costa de más parámetros y mayor resolución de entrada.

## Limitaciones y advertencias

- El modelo no está diseñado para uso general: su propósito declarado es la subred Perturb de Bittensor, y no se documentan usos fuera de ese ámbito.
- No hay métricas publicadas de precisión ni de robustez, por lo que se desconoce si el entrenamiento adversarial ha degradado la precisión limpia respecto al EfficientNetV2-L original.
- Riesgo de alucinación no aplica como tal, pero sí existe riesgo de clasificación errónea: el modelo siempre devuelve una de las 1000 clases de ImageNet, incluidas para imágenes fuera de esa taxonomía.
- Sesgos: al derivar de ImageNet-1k, hereda los sesgos de anotación y representación de ese dataset (categorías sesgadas hacia contextos occidentales, infrarepresentación de determinadas culturas y objetos).
- Limitación de dominio: solo clasifica las 1000 clases de ImageNet; no detecta objetos, no segmenta, no genera descripciones y no reconoce texto en imágenes.
- El preprocesado es estricto: cualquier desviación del redimensionado bicúbico a 480, el recorte central de 480 y la normalización con media y desviación 0,5 puede degradar gravemente el rendimiento.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, que permite uso comercial, pero se debe verificar la licencia de los pesos base de torchvision antes de un despliegue en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin documentación de versiones ni mantenimiento conocido.
- La única garantía de integridad es el hash on-chain indicado en la model card; conviene verificarlo antes de cargar el checkpoint en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ANGExllL/silver-wren
- Perfil del autor en HuggingFace: https://huggingface.co/ANGExllL/models
- Subred Perturb: https://perturbai.io
- Bittensor (red en la que opera la subred netuid 26): https://bittensor.com
- Documentación de EfficientNetV2 en torchvision: https://pytorch.org/vision/stable/models/efficientnetv2.html
