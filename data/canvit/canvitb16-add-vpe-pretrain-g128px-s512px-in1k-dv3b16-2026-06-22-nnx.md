# canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22-nnx

## Resumen

CanViT (Canvas Vision Transformer) es un modelo fundacional de visión activa desarrollado por el equipo de investigación canvit (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna), presentado en NeurIPS 2026. A diferencia de los vision transformers convencionales que procesan una imagen completa en una sola pasada, CanViT observa una escena mediante una secuencia de "vistazos" (glimpses) y va construyendo y actualizando una representación global de la escena sobre un lienzo (canvas) de tamaño fijo. Esta formulación imita más fielmente la percepción visual biológica y permite un consumo computacional proporcional a la información muestreada, no al área total de la imagen.

Este checkpoint concreto es la conversión al formato de la librería `canvit-nnx` (backend JAX / Flax NNX) del modelo base preentrenado `canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22`. El nombre codifica la configuración experimental: backbone ViT-B/16, atención con positional encoding aditivo (add-vpe), vistazos de 128 px sobre escenas de 512 px, preentrenamiento en ImageNet-1k y destilación desde DINOv3 ViT-B/16. Con 98,1 millones de parámetros y 0,8 GB de pesos, es un modelo compacto orientado a extracción de características de imagen.

Su relevancia actual radica en que propone una alternativa a la extracción pasiva de features para tareas donde el coste de observar la escena completa es prohibitivo (imágenes de alta resolución, vídeo, robótica) y en que ofrece una implementación lista para JAX/Flax NNX, un ecosistema con menos cobertura de modelos de visión que PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16) con mecanismo de visión activa sobre canvas; backbone de 12 capas, ancho 768, parches de 16 px |
| Parametros totales | 98.114.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa secuencias de vistazos; canvas de 32 × 32 en la verificación de conversión) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión nativa; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de visión, sin cabecera de texto) |
| Licencia | MIT (modelo); el preentrenamiento usa destilación desde DINOv3, sujeto a la DINOv3 License |
| Formato de pesos | safetensors (formato nativo `canvit-nnx` para JAX / Flax NNX) |

## Arquitectura y entrenamiento

CanViT se construye sobre un ViT-B/16 (12 capas, dimensión 768, parches de 16 × 16) y añade dos piezas clave: un módulo de muestreo de vistazos que extrae regiones de 128 px de una escena de 512 px en posiciones dictadas por un objeto `Viewpoint`, y un canvas de tamaño fijo (32 × 32 en la configuración verificada) que actúa como memoria de escena y se actualiza de forma recurrente tras cada vistazo. La variante `add-vpe` indica que el positional encoding se inyecta de forma aditiva, y la clase `CanViTForPretraining` expone el estado recurrente (`init_state` / `output.state`) necesario para encadenar observaciones.

El preentrenamiento se realizó sobre ImageNet-1k y, según la model card, mediante destilación desde DINOv3 (ViT-B/16). No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF/DPO (poco habituales en modelos puramente visuales). La innovación técnica destacable es la formulación de visión activa: el coste de inferencia escala con el número y tamaño de los vistazos, no con la resolución completa de la escena, lo que abre la puerta a procesar imágenes de muy alta resolución o flujos de vídeo con presupuesto computacional controlado.

## Capacidades

- Extracción de características de imagen (`pipeline_tag: image-feature-extraction`) mediante un backbone ViT-B/16 preentrenado por destilación de DINOv3.
- Percepción activa: muestreo secuencial de vistazos (`sample_at_viewpoint`) con acumulación de información en un canvas recurrente.
- Representación de escena completa: `Viewpoint.full_scene` permite procesar la escena entera como un único vistazo cuando se desea una línea base pasiva.
- Estado recurrente persistente entre llamadas (`init_state`, `output.state`), apto para políticas de exploración multi-paso.
- Compatibilidad con JAX / Flax NNX, incluyendo diferenciación automática y `jax.jit` sobre el grafo del modelo.
- No dispone de cabecera de texto, tool calling, agentes lingüísticos ni capacidades multimodales de audio o lenguaje; es exclusivamente un modelo visual.
- Capacidades multilingües: no aplicables (sin procesamiento de lenguaje).

## Casos de uso

- Extracción de embeddings para búsqueda visual y deduplicación: el modelo genera representaciones densas de 768 dimensiones por escena que pueden indexarse en un motor vectorial para recuperación por similitud; su tamaño de 98 M parámetros permite vectorizar corpus grandes con coste moderado.
- Procesamiento de imágenes de alta resolución con presupuesto acotado: en lugar de reescalar una imagen de, por ejemplo, 4K a 512 px, se pueden muestrear vistazos de 128 px sobre las regiones de interés y acumularlos en el canvas, preservando detalle fino sin coste cuadrático.
- Robótica y navegación con visión activa: la API de `Viewpoint` y el estado recurrente permiten que un agente decida dónde mirar en cada paso y mantenga una memoria de la escena, útil en tareas de exploración o manipulación donde la cámara tiene un campo de visión limitado.
- Clasificación y etiquetado de imágenes por transferencia: al ser un checkpoint de preentrenamiento, se puede congelar el backbone y entrenar una cabeza lineal o un adaptador sobre los features del canvas para tareas downstream con pocos datos etiquetados.
- Análisis de vídeo con muestreo selectivo de fotogramas y regiones: el estado recurrente permite actualizar la representación de la escena fotograma a fotograma sin recomputar la imagen completa, reduciendo el coste frente a un ViT pasivo por frame.
- Investigación en percepción activa: el modelo sirve como línea base reproducible en JAX para experimentos sobre políticas de fijación (foveación), comparación con DINOv3 pasivo y estudios de eficiencia muestra-información.
- Integración en pipelines JAX/TPU: al estar implementado en Flax NNX, encaja en stacks de entrenamiento e inferencia sobre aceleradores TPU y GPU con XLA, algo poco común en modelos de visión publicados solo en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que la conversión se verificó a 512 px de escena, 128 px de vistazo y canvas de 32 × 32, sin reportar métricas de precisión (ImageNet top-1, kNN, lineal, etc.) ni comparaciones numéricas con DINOv3.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 0,4 GB en FP32 (98 M parámetros × 4 bytes) y el repositorio completo pesa 0,8 GB; con estado de canvas y activaciones para batch pequeño, el consumo típico se sitúa por debajo de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en FP32; para entrenamiento o fine-tuning se recomiendan A100, H100 o RTX 4090 por el soporte maduro de XLA.
- Cabe en GPU de consumo: sí, en GTX 1650/RTX 3050 y superiores; también en iGPU recientes con suficiente memoria compartida, aunque con latencia mayor.
- Opciones de despliegue: `canvit-nnx` sobre JAX (CPU, GPU CUDA, TPU); no se documentan exportaciones a ONNX, GGUF, vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del número de vistazos por escena, del tamaño de batch y del backend (XLA en GPU o TPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Preentrenamiento | Licencia | Formato / ecosistema |
|---|---|---|---|---|---|
| CanViT ViT-B/16 (este checkpoint) | 98,1 M | Escenas 512 px, vistazos 128 px, canvas 32 × 32 | Destilación desde DINOv3 sobre ImageNet-1k | MIT (con caveat DINOv3) | safetensors, JAX / Flax NNX |
| DINOv3 ViT-B/16 | ~86 M (ViT-B) | Imagen completa, resolución variable | Autosupervisado a gran escala (Meta) | DINOv3 License | PyTorch (referencia), pesos originales |
| DINOv2 ViT-B/14 | ~86 M | Imagen completa, parches 14 px | Autosupervisado (LVD-142M) | Apache 2.0 | PyTorch, safetensors, ONNX |
| CLIP ViT-B/16 | ~86 M (visual) + texto | Imagen completa 224 px + texto | Contrastivo imagen-texto | MIT (versión OpenAI) | PyTorch, safetensors, ONNX |

CanViT se distingue de DINOv2/DINOv3 y CLIP por su paradigma de observación secuencial y su estado recurrente, y por estar implementado en JAX/Flax NNX en lugar de PyTorch. En parámetros es comparable a los ViT-B de referencia, pero no se dispone de métricas públicas que permitan comparar su precisión con la de estos modelos.

## Limitaciones y advertencias

- No se han publicado métricas de calidad (ImageNet top-1, kNN, transferencia lineal) en la información disponible, por lo que no es posible evaluar su rendimiento frente a DINOv3 o DINOv2 sin ejecutar evaluaciones propias.
- El preentrenamiento se basa en destilación desde DINOv3, cuyo uso está sujeto a la DINOv3 License; aunque los pesos de CanViT se publican bajo MIT, conviene revisar las condiciones de la licencia del modelo profesor para uso comercial.
- Es un checkpoint de preentrenamiento sin cabecera de tarea: para clasificación, detección o segmentación requiere entrenar cabezas o adaptadores específicos.
- Modelo exclusivamente visual: no procesa texto ni audio, y no soporta tool calling ni razonamiento multi-paso en el sentido de los LLM.
- El rendimiento depende críticamente de la política de muestreo de vistazos; una selección de viewpoints pobre degrada la representación del canvas. La información disponible no documenta políticas de referencia ni su robustez.
- Riesgo de sesgo heredado del dataset de destilación (ImageNet-1k y las fuentes de DINOv3), con posibles desequilibrios en clases minoritarias y sesgos geográficos o demográficos.
- La verificación de la conversión se realizó solo en una configuración concreta (512 px / 128 px / 32 × 32); no se garantiza el comportamiento fuera de esos parámetros.
- El ecosistema JAX/Flax NNX es menos común que PyTorch, lo que puede complicar la integración en stacks existentes y la disponibilidad de herramientas de perfilado y despliegue.
- No se documentan cuantizaciones oficiales ni exportaciones a formatos de inferencia optimizada (ONNX, TensorRT), lo que limita el despliegue en entornos de producción convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22-nnx
- Modelo base (formato original): https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22
- Repositorio de checkpoints: https://huggingface.co/canvit
- Paper en OpenReview (NeurIPS 2026): https://openreview.net/forum?id=cnV9GA4pKU
- arXiv: https://arxiv.org/abs/2603.22570
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- DINOv3 (modelo profesor): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
