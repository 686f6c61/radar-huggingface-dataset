# lucid-dl/mobilenet-v4-hybrid-medium

## Resumen

MobileNet-v4-Hybrid-Medium es un clasificador de imágenes convolutional con módulos de atención, publicado por el usuario lucid-dl como port al framework Lucid del checkpoint original de timm `mobilenetv4_hybrid_medium.ix_e550_r256_in1k`. Se trata de una reimplementación de la variante "hybrid medium" de la familia MobileNetV4 presentada por Qin et al. en el artículo *MobileNetV4: Universal Models for the Mobile Ecosystem* (ECCV 2024, arXiv:2404.10518), orientada a despliegue en entornos con recursos limitados (móvil y edge).

El modelo tiene 11,1 millones de parámetros y un peso de repositorio de 42,6 MB, lo que lo sitúa en la gama ligera de clasificadores. Sobre ImageNet-1k declara un 81,478 % de accuracy top-1 y un 95,692 % top-5 (valores no verificados, aportados por el autor). Su relevancia actual es doble: por un lado ofrece la precisión de la familia MobileNetV4 en un tamaño apto para inferencia en dispositivo; por otro, ejemplifica el esfuerzo de portar pesos de timm a frameworks alternativos preservando la carga estricta de tensores.

El repositorio no registra descargas ni "likes" en el momento de la consulta, y no incluye información sobre idiomas ni sobre el número de tokens de entrenamiento (es un modelo de visión, no de lenguaje). No se han publicado GFLOPs ni latencias en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional híbrida (MobileNetV4 hybrid): bloques Universal Inverted Bottleneck (UIB) combinados con atención Mobile MQA |
| Parametros totales | 11,1 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imágenes, resolución de entrenamiento 256x256 según la nomenclatura del checkpoint) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors a precisión completa) |
| Idiomas soportados | no aplica / no disponible (clasificación de imágenes; no hay metadatos de idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors nativos de Lucid |
| Tarea | image-classification (ImageNet-1k, 1000 clases) |
| Tamaño del repositorio | 42,6 MB |
| Tag de pesos por defecto | `IX_E550_R256_IN1K` |
| Origen de los pesos | timm `mobilenetv4_hybrid_medium.ix_e550_r256_in1k` |

## Arquitectura y entrenamiento

La arquitectura pertenece a la familia MobileNetV4, que introduce dos bloques nuevos: el Universal Inverted Bottleneck (UIB), un bloque convolucional que unifica las variantes de bottleneck invertido previas, y el bloque de atención Mobile MQA, una atención multi-query optimizada para móvil. Las variantes "hybrid" combinan ambos tipos de bloque, de modo que la red alterna capas convolucionales eficientes con capas de atención que modelan dependencias globales, buscando un compromiso entre coste computacional y precisión. La selección de la estructura concreta se obtuvo mediante búsqueda de arquitectura (NAS) según el artículo original.

Los detalles concretos de entrenamiento —número de tokens o imágenes, composición exacta del dataset más allá de ImageNet-1k, uso de destilación, RLHF/DPO o recetas de aumento de datos— no están documentados en la model card. La nomenclatura del checkpoint (`e550_r256`) sugiere 550 épocas a resolución 256x256, pero este dato no se confirma explícitamente en la información disponible. El port a Lucid se realizó mediante `python -m tools.convert_weights mobilenet_v4_hybrid_medium --tag IX_E550_R256_IN1K`, con verificación estricta del conjunto de claves, las formas de los tensores y una carga strict contra un modelo Lucid recién construido. El preprocesado viaja asociado a los pesos (`weights.transforms()`).

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k, devolviendo logits de forma `(B, num_classes)`.
- Extracción de representaciones visuales reutilizable para tareas posteriores (transfer learning, feature extraction), aunque no se documenta explícitamente en la ficha.
- Preprocesado integrado: las transformaciones de imagen acompañan a los pesos, evitando desajustes entre entrenamiento e inferencia.
- Diseño orientado a eficiencia en dispositivo (móvil y edge), con un tamaño de pesos de 42,6 MB.
- Integración nativa con el framework Lucid mediante `lucid.models`.
- Soporte de carga por etiqueta de pesos explícita (enum `MobileNetV4HybridMediumWeights` o cadena de texto).
- No se documentan capacidades de tool calling, agentes, generación de texto, razonamiento, matemáticas, visión generalista (detección, segmentación, VQA) ni procesamiento de audio. El modelo es un clasificador de imágenes cerrado a 1000 clases.

## Casos de uso

- Clasificación de imágenes en el dispositivo: con 11,1 M de parámetros y 42,6 MB de pesos, el modelo puede ejecutarse en móviles y dispositivos embebidos para etiquetar fotografías localmente sin enviar datos a la nube.
- Moderación de contenido en pipelines de subida: preclasificar imágenes entrantes antes de un revisor humano o de un modelo mayor, filtrando categorías evidentes y reduciendo coste de cómputo.
- Organización y etiquetado automático de fototecas: asignar una de las 1000 clases de ImageNet a cada imagen para agrupar, buscar y ordenar colecciones.
- Visión en robótica y drones con restricciones de cómputo y energía: el modelo puede integrarse como módulo de percepción de bajo coste para reconocimiento de objetos comunes.
- Control de calidad en línea de producción: clasificar piezas o productos en tiempo real en hardware de borde, aprovechando la baja huella de memoria.
- Curado de datos para entrenar modelos mayores: usar el clasificador como prefiltro para descartar o etiquetar automáticamente grandes volúmenes de imágenes antes del etiquetado fino.
- Baseline de investigación en el framework Lucid: sirve como referencia reproducible para comparar implementaciones, conversiones de pesos o técnicas de cuantización dentro de Lucid.
- Prototipado de aplicaciones de realidad aumentada: clasificación de escenas o productos a partir de fotogramas, dado el reducido coste de inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Dataset | Métrica | Valor |
|---|---|---|
| ImageNet-1k | acc@1 | 81,478 |
| ImageNet-1k | acc@5 | 95,692 |

No se han publicado en la información disponible resultados de GFLOPs, latencia, throughput ni comparaciones adicionales con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 11,1 M de parámetros, la huella de memoria es de decenas de megabytes (el repositorio ocupa 42,6 MB), muy por debajo de cualquier GPU moderna; cabe incluso en CPU y en aceleradores de borde.
- GPU recomendadas: cualquier GPU consumer (por ejemplo, RTX 3060 en adelante) o profesional (A100, H100) puede ejecutarlo sobradamente; la GPU no es un cuello de botella para este tamaño.
- Compatibilidad con GPU consumer: sí, en prácticamente cualquier GPU con suficiente memoria para el resto del pipeline; también en CPU.
- Opciones de despliegue: el uso documentado es a través de la librería Lucid (`lucid.models.mobilenet_v4_hybrid_medium_cls`). No se documentan en la información disponible otras vías de despliegue (ONNX, TFLite, vLLM, llama.cpp, Ollama, TGI), que no aplican o no están confirmadas.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada.
- Precisión/cuantización: no se documentan variantes cuantizadas; el peso distribuido es de precisión completa en safetensors.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución de entrada | acc@1 (ImageNet-1k) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobilenet-v4-hybrid-medium (este) | 11,1 M | 256x256 (según tag) | 81,478 (no verificado) | Apache 2.0 | Lucid, safetensors |
| timm/mobilenetv4_hybrid_medium.ix_e550_r256_in1k | 11,1 M | 256x256 | 81,478 (peso origen del port) | Apache 2.0 | timm, safetensors/PyTorch |
| Otras variantes MobileNetV4 (conv small/medium, hybrid large) | no disponible | no disponible | no disponible | no disponible | timm |
| MobileNetV3, EfficientNet u otros clasificadores ligeros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de cifras de accuracy, parámetros o licencias de los modelos alternativos, por lo que la comparación cuantitativa con ellos no puede realizarse sin consultar sus fuentes primarias. La comparación más directa y verificable es entre este port y su checkpoint de origen en timm, que comparten pesos y, por tanto, métricas declaradas.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre ImageNet-1k, el modelo hereda los sesgos y desequilibrios de ese dataset en cuanto a representación de categorías, geografías y contextos; no se documenta ningún análisis de sesgo.
- Alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea o sobreconfiada en imágenes fuera de la distribución de ImageNet-1k.
- Alcance limitado: solo clasifica en las 1000 clases de ImageNet-1k; no realiza detección, segmentación, captioning ni descripciones abiertas.
- Contexto, idioma y datos de entrenamiento: la model card no documenta composición del dataset, recetas de aumento de datos ni detalles de entrenamiento más allá de la referencia al artículo.
- Ausencia de verificación: los valores de acc@1 y acc@5 están marcados como no verificados en el model-index; conviene reproducirlos antes de usarlos en decisiones de producción.
- Licencia: Apache 2.0, heredada de los pesos originales, lo que permite uso comercial, pero conviene revisar las condiciones del proyecto timm y del framework Lucid si se redistribuye.
- Metadatos incompletos: sin descargas, sin likes, sin GFLOPs y con fechas de creación y actualización de septiembre de 2026 (posteriores a la fecha habitual de publicación), lo que puede indicar un repositorio reciente o de bajo mantenimiento; verificar la vigencia antes de depender de él.
- Despliegue: fuera de la librería Lucid no se documentan formatos alternativos ni herramientas de exportación, lo que puede dificultar la integración en stacks que no usen ese framework.

## Enlaces

- HuggingFace: https://huggingface.co/lucid-dl/mobilenet-v4-hybrid-medium
- Checkpoint de origen en timm: https://huggingface.co/timm/mobilenetv4_hybrid_medium.ix_e550_r256_in1k
- Artículo MobileNetV4 (arXiv:2404.10518): https://arxiv.org/abs/2404.10518
- Repositorio del framework Lucid: https://github.com/ChanLumerico/lucid
- Nota: las búsquedas web realizadas devolvieron únicamente resultados no relacionados con el modelo (Lucid Motors, Lucid Trading, Lucidchart), por lo que no se han incluido.
