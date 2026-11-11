# canvit/probe-ade20k-40k-s512-c32-archctrl-nnx

## Resumen

CanViT (Canvas Vision Transformer) es un modelo fundacional de visión activa desarrollado por el equipo de investigación de Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna, presentado en NeurIPS 2026. A diferencia de los transformers de visión convencionales que procesan la imagen completa de una vez, CanViT observa una escena mediante una secuencia de "vistazos" (glimpses) y va construyendo una representación global sobre un lienzo ("canvas") de tamaño fijo. El checkpoint que nos ocupa, `probe-ade20k-40k-s512-c32-archctrl-nnx`, no es el modelo base sino una sonda lineal (linear probe) de segmentación semántica entrenada sobre las características congeladas del CanViT-B de control de arquitectura.

El modelo base es un ViT-B (arquitectura transformer, aproximadamente 86 M de parámetros en el backbone) preentrenado por destilación desde DINOv3 sobre ImageNet-1k y luego adaptado a escenas de 512 px con un canvas de 32 × 32. Esta sonda concreta añade una cabeza de segmentación de 150 clases (ADE20K) entrenada durante 40 000 pasos con lotes de 16 y rollouts de 4 vistazos de 128 px. El resultado es un modelo de segmentación semántica que mejora su mIoU a medida que acumula vistazos, lo que ilustra la tesis central del paper: la visión activa permite un mejor uso del cómputo de inferencia.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de investigación muy específico (una sonda de evaluación, no un modelo listo para producción) que sirve para reproducir los resultados del apéndice "Architecture control" del paper. Por otro, el ecosistema CanViT es una de las primeras implementaciones públicas de visión activa en JAX/Flax NNX, lo que lo convierte en referencia para quien quiera experimentar con paradigmas de percepción secuencial en lugar de la inferencia de imagen completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (CanViT-B) con lienzo de escena y vistazos secuenciales; sonda lineal de segmentación |
| Parámetros totales | 159 894 (solo la sonda; el backbone CanViT-B no está incluido en este repo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | canvas de 32 × 32 posiciones; escenas de 512 px; vistazos de 128 px |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente float32) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT (backbone preentrenado por destilación de DINOv3, sujeto a DINOv3 License) |
| Formato de pesos | safetensors (JAX/Flax NNX) |

## Arquitectura y entrenamiento

El backbone es un CanViT-B, un transformer de visión que en lugar de recibir la imagen completa recibe una secuencia de vistazos de 128 px muestreados en viewpoints deterministas (EG-C2F en evaluación) o aleatorios (R-IID en entrenamiento). Cada vistazo se codifica con un ViT-B con positional embeddings añadidos y se integra en un estado recurrente de tamaño 32 × 32 que actúa como memoria de escena. El preentrenamiento del backbone se hizo por destilación desde DINOv3 sobre ImageNet-1k y escenas de 512 px, con un control de arquitectura específico (`archctrl`) que fija la configuración para los experimentos del apéndice del paper.

La sonda liberada en este repo es una cabeza lineal compuesta por LayerNorm, dropout, BatchNorm y una convolución 1 × 1 que proyecta las características congeladas del canvas a 150 clases de ADE20K. Se entrenó durante 40 000 pasos con batch size 16 y rollouts de 4 vistazos de 128 px sobre escenas de 512 px, usando viewpoints R-IID. Los pesos publicados corresponden al último paso. La conversión desde el checkpoint JAX original se validó contra el evaluador oficial en PyTorch (`canvit-pytorch`), con diferencias de centésimas en mIoU entre ambas implementaciones (26,86 vs 26,84 en t=0, por ejemplo).

## Capacidades

- Segmentación semántica densa de 150 clases sobre escenas ADE20K (interiores, exteriores, objetos,stuff y cosas).
- Procesamiento secuencial de escenas mediante vistazos: la calidad de la segmentación mejora con cada vistazo acumulado (de 26,86 a 33,69 mIoU entre t=0 y t=3).
- Inferencia sobre canvas de 32 × 32 con escenas de entrada de 512 px y vistazos de 128 px.
- Evaluación determinista con viewpoints EG-C2F, reproducible con el evaluador oficial.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto: es exclusivamente un modelo de visión.
- No dispone de modo "thinking", audio ni otras modalidades.

## Casos de uso

- Reproducción de resultados del paper: la sonda permite verificar la tabla "Architecture control: ADE20K mIoU (%) against cumulative forward inference FLOPs" del apéndice del paper NeurIPS 2026, usando el evaluador `canvit-pytorch` o el backend JAX.
- Investigación en visión activa: sirve como línea base para comparar estrategias de selección de viewpoints (EG-C2F, R-IID u otras) midiendo cómo evoluciona la mIoU con cada vistazo.
- Segmentación de escenas con presupuesto de cómputo ajustable: en lugar de procesar la imagen completa, se pueden solicitar 1, 2 o 3 vistazos según la latencia disponible, aceptando la degradación controlada documentada (26,86 → 30,52 → 32,77 → 33,69 mIoU).
- Benchmark de sondas lineales: la cabeza es un ejemplo canónico de cómo evaluar características congeladas de un backbone de visión sobre ADE20K, útil para comparar nuevos backbones contra CanViT-B.
- Docencia y divulgación: el par (backbone + sonda) es un caso de estudio compacto de destilación desde DINOv3, evaluación con probes lineales y despliegue en JAX/Flax NNX.
- Prototipado de pipelines de segmentación en JAX: el código de ejemplo (`CanViTForSemanticSegmentation.from_pretrained_with_probe`) permite integrar la sonda en flujos de investigación sin reentrenar.
- Validación cruzada JAX ↔ PyTorch: la sonda y su equivalente en `canvit-pytorch` permiten comprobar la consistencia numérica entre ambos backends (diferencias de ~0,02 mIoU en float32 sobre CPU).

## Benchmarks y rendimiento

ADE20K mIoU (%) en validación, viewpoints EG-C2F deterministas, escenas de 512 px, canvas 32 × 32, tras cada vistazo:

| Vistazos (t) | mIoU JAX (oficial) | mIoU PyTorch (float32, CPU) |
|---|---|---|
| t = 0 | 26,86 | 26,84 |
| t = 1 | 30,52 | 30,46 |
| t = 2 | 32,77 | 32,73 |
| t = 3 | 33,69 | 33,68 |

No se han publicado en la información disponible comparaciones con otros modelos de segmentación (p. ej. SegFormer, Mask2Former) ni resultados en otros datasets.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del backbone (ViT-B, ~86 M de parámetros) y la sonda (~160 k parámetros), es esperable que quepa en GPUs de consumo, pero no hay cifras oficiales.
- GPU recomendadas: no disponible. El modelo se distribuye para JAX/Flax NNX y el evaluador oficial funciona en CPU en float32.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el evaluador de referencia corre en CPU.
- Opciones de despliegue: `canvit-nnx` (JAX/Flax NNX) y `canvit-pytorch` (evaluador oficial). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | ADE20K mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CanViT-B + sonda ADE20K (este repo) | ViT + sonda lineal, visión activa | ~86 M backbone + 160 k sonda | canvas 32×32, escenas 512 px | 33,69 (t=3) | MIT (backbone sujeto a DINOv3 License) | Hugging Face (canvit) |
| DINOv3 (backbone original) | ViT self-supervised | no disponible en la información | imagen completa | no disponible en la información | DINOv3 License | GitHub / Hugging Face |
| SegFormer / Mask2Former | Segmentadores supervisados | no disponible en la información | imagen completa | no disponible en la información | variable | Hugging Face |

No se dispone de datos comparativos directos con otros modelos en la información proporcionada; la comparativa anterior es orientativa y marca "no disponible" donde no hay cifras verificables.

## Limitaciones y advertencias

- Es una sonda de investigación, no un modelo de producción: la mIoU de 33,69 en ADE20K es baja en términos absolutos comparada con segmentadores supervisados dedicados.
- El backbone no está incluido en este repo; hay que descargarlo por separado desde `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-archctrl-2026-07-26-nnx`.
- Dependencia de la librería `canvit-nnx` (JAX/Flax NNX), con ecosistema menos maduro que PyTorch; el evaluador alternativo es `canvit-pytorch`.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de visión, los sesgos relevantes serían los del dataset ADE20K (SceneParse150) y de DINOv3.
- La licencia MIT del repo no exime del cumplimiento de la DINOv3 License para el backbone preentrenado; conviene revisarla antes de uso comercial.
- Sin soporte de texto, tool calling, agentes ni multilingüismo; no es adecuado para tareas de lenguaje.
- Resultados medidos con viewpoints EG-C2F deterministas; el rendimiento con otras políticas de viewpoints puede diferir.
- El checkpoint corresponde al último paso de entrenamiento (40 000), sin selección por validación documentada.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/probe-ade20k-40k-s512-c32-archctrl-nnx
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-archctrl-2026-07-26-nnx
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Checkpoints CanViT: https://huggingface.co/canvit
- Evaluador PyTorch: https://github.com/m2b3/CanViT/blob/main/canvit-pytorch/docs/evaluate.md
- DINOv3: https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Dataset: https://huggingface.co/datasets/zhoubolei/scene_parse_150
