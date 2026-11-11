# canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-archctrl-2026-07-26-nnx

## Resumen

CanViT-B (Canvas Vision Transformer, variante B) es un modelo de visión activa desarrollado por el equipo CanViT y presentado en el paper "CanViT: Toward Active-Vision Foundation Models" (NeurIPS 2026). A diferencia de un ViT convencional, que procesa la imagen completa en una sola pasada, CanViT observa la escena a través de una secuencia de "glimpses" (recortes) y va construyendo una representación acumulativa sobre un lienzo ("canvas") de tamaño fijo. Este checkpoint concreto es el brazo de control arquitectónico del paper: CanViT-B entrenado desde inicialización aleatoria sobre ImageNet-1k mediante destilación latente densa de un profesor DINOv3 ViT-B/16, con el mismo presupuesto de glimpses que la línea base AdaGlimpse. No es el checkpoint insignia del paper.

El modelo tiene 98.114.176 parámetros (aproximadamente 98 M) y se distribuye en formato safetensors con un repositorio de 0,4 GB. Está implementado en JAX / Flax NNX (librería `canvit-nnx`) y su pipeline declarado es `image-feature-extraction`, es decir, está pensado como extractor de características visuales y no como modelo generativo de texto. La licencia es MIT, aunque el entrenamiento por destilación de DINOv3 introduce la licencia de DINOv3 como caveat relevante.

Su relevancia actual reside en que explora un paradigma distinto al del ViT denso: la visión activa con memoria explícita sobre un canvas, orientada a escenarios donde el coste de procesar la imagen completa es prohibitivo (imágenes de alta resolución, robótica, inspección) y donde conviene decidir qué mirar y en qué orden. Este checkpoint sirve además como referencia de control para medir la contribución de la arquitectura frente a la del profesor y los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer con visión activa (Canvas Vision Transformer), parche 16, implementado en JAX / Flax NNX |
| Parametros totales | 98.114.176 (aproximadamente 98 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; el modelo opera sobre escenas de 512 px con canvas de 32 × 32 celdas y 4 glimpses de 128 px |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT (con caveat por la licencia de DINOv3) |
| Formato de pesos | safetensors (checkpoint convertido desde JAX; librería `canvit-nnx`) |

## Arquitectura y entrenamiento

CanViT es un transformer de visión con un mecanismo de visión activa: en cada paso el modelo recibe un recorte ("glimpse") de 128 px sobre una escena de 512 px, junto con la posición del viewpoint, y actualiza un estado persistente sobre un canvas de 32 × 32 celdas. La representación final de la escena es la del canvas acumulado tras la secuencia de glimpses, no la de una pasada densa. Este checkpoint usa parche de 16 px (sufijo `b16`) y añade VPE (viewpoint positional encoding, sufijo `add-vpe`).

El entrenamiento se realizó por destilación latente densa desde DINOv3 ViT-B/16: el profesor aporta las características de parche y de CLS de las escenas, precalculadas y estandarizadas con los momentos por posición de la ejecución. El régimen es de 4 glimpses de 128 px sobre escenas de 512 px, canvas de 32 × 32, con retropropagación a través de todos los glimpses. Se entrenaron 26.875 pasos con batch size 512 y 2.500 pasos de warmup, con peso de pérdida CLS igual a 1, sobre un slice Cloud TPU v6e-8 con JAX / Flax NNX. El dataset es ILSVRC/imagenet-1k.

La conversión desde el checkpoint JAX original se validó sobre 8 escenas de validación de ADE20K a lo largo de 4 glimpses: el error relativo L2 del canvas es como máximo 5,5e-03 en float32 (los kernels de atención del original siguen calculando en bfloat16) y al menos el 99,85 % de las celdas conservan la clase del probe (según `provenance.json`).

## Capacidades

- Extracción de características visuales de escenas mediante secuencia de glimpses y memoria sobre canvas.
- Procesamiento de imágenes de 512 px con recortes de 128 px, con control explícito del viewpoint.
- Estado persistente entre pasos (`init_state`, `output.state`), lo que permite razonamiento visual iterativo y multi-paso.
- Destilación de características densas de DINOv3 ViT-B/16, útil como backbone para tareas densas (segmentación, detección) tras fine-tuning.
- Integración con el ecosistema JAX / Flax NNX mediante la clase `CanViTForPretraining`.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Capacidades multilingües: no disponible (modelo puramente visual).
- Modo thinking, visión generativa, audio: no disponible.

## Casos de uso

- Segmentación semántica densa: sirve como backbone preentrenado para probes de segmentación; el propio autor publica un probe ADE20K (`canvit/probe-ade20k-40k-s512-c32-archctrl-nnx`) que reporta mIoU tras cada glimpse, lo que permite evaluar el compromiso entre número de vistazos y calidad.
- Detección de objetos: el checkpoint se usa como inicialización del detector COCO fine-tuneado (`canvit/canvitb16-add-vpe-detect-g128px-s512px-coco-from-archctrl-2026-07-27-nnx`), adecuado para pipelines de detección que parten de un backbone destilado de DINOv3.
- Investigación en visión activa: al ser el brazo de control arquitectónico, permite aislar la contribución de la arquitectura CanViT frente a AdaGlimpse bajo el mismo profesor, datos y presupuesto de glimpses.
- Procesamiento de imágenes de alta resolución con coste controlado: en lugar de procesar 512 px de forma densa, el modelo consume 4 recortes de 128 px, lo que reduce el cómputo por paso y permite decidir qué regiones muestrear.
- Robótica y agentes visuales: el estado de canvas y el control de viewpoint encajan con bucles percepción-acción donde el agente elige la siguiente región a observar.
- Inspección visual por regiones: útil en escenarios donde interesa recorrer una escena por partes (documentos, paneles, imágenes médicas de campo amplio) manteniendo una memoria global de lo ya visto.
- Reproducción de experimentos: al estar implementado en JAX / Flax NNX y con validación de conversión documentada, sirve para replicar el control arquitectónico del paper en hardware TPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite los resultados a dos artefactos derivados: el probe ADE20K (`canvit/probe-ade20k-40k-s512-c32-archctrl-nnx`), cuya card da el mIoU tras cada glimpse, y el detector COCO fine-tuneado desde este checkpoint. Los valores numéricos de mIoU y de métricas COCO no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 98 M de parámetros, los pesos en float32 ocupan aproximadamente 0,39 GB; en bfloat16, unos 0,20 GB. El estado del canvas (32 × 32 celdas) y las activaciones añaden una cantidad modesta, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en precisión reducida; para entrenamiento o fine-tuning se recomienda A100, H100 o equivalentes. El entrenamiento original se hizo en un slice Cloud TPU v6e-8.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: la librería oficial es `canvit-nnx` sobre JAX / Flax NNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CanViT-B (este checkpoint) | 98 M | escenas 512 px, 4 glimpses de 128 px, canvas 32 × 32 | Visión activa con canvas, destilado de DINOv3 ViT-B/16 | MIT (caveat DINOv3) | Hugging Face, JAX / Flax NNX |
| DINOv3 ViT-B/16 (profesor) | no disponible en la información | imagen completa densa | ViT denso auto-supervisado | DINOv3 License | Hugging Face / GitHub |
| AdaGlimpse (línea base del paper) | no disponible en la información | secuencia de glimpses | Visión activa sin canvas | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a paradigma, licencia y disponibilidad.

## Limitaciones y advertencias

- Este checkpoint es el brazo de control arquitectónico, no el CanViT-B insignia del paper; no debe usarse como referencia de los resultados principales.
- El preentrenamiento se hizo únicamente sobre ImageNet-1k, lo que limita la diversidad de dominios frente a preentrenamientos a mayor escala.
- El modelo es un extractor de características visuales: no genera texto, no soporta tool calling ni razonamiento lingüístico.
- No se han publicado benchmarks propios en la información disponible; el rendimiento debe inferirse de los artefactos derivados (probe ADE20K y detector COCO).
- La destilación desde DINOv3 implica que la licencia DINOv3 puede condicionar el uso comercial del modelo derivado, aunque la licencia declarada del checkpoint sea MIT.
- La conversión desde JAX conserva los kernels de atención originales en bfloat16, con un error relativo L2 de canvas de hasta 5,5e-03 en float32; no es una réplica bit a bit del checkpoint original.
- Riesgo de sesgos y alucinación visual: no documentado en la información proporcionada, pero al entrenarse solo con ImageNet-1k hereda los sesgos de ese dataset.
- No hay variantes cuantizadas publicadas (GGUF, etc.), lo que limita su despliegue fuera del ecosistema JAX.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-archctrl-2026-07-26-nnx
- Paper (arXiv): https://arxiv.org/abs/2603.22570
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
- Probe ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c32-archctrl-nnx
- Detector COCO fine-tuneado: https://huggingface.co/canvit/canvitb16-add-vpe-detect-g128px-s512px-coco-from-archctrl-2026-07-27-nnx
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Repositorio DINOv3: https://github.com/facebookresearch/dinov3
