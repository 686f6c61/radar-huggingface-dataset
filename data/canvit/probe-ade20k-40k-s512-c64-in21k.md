# canvit/probe-ade20k-40k-s512-c64-in21k

## Resumen

`canvit/probe-ade20k-40k-s512-c64-in21k` es una sonda lineal (linear probe) de segmentación semántica sobre ADE20K, construida sobre las características congeladas del modelo base CanViT-B/16, un vision transformer de visión activa desarrollado por el equipo CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna) y presentado en NeurIPS 2026. No es un modelo generativo ni un modelo de lenguaje: es un artefacto de evaluación que demuestra la calidad de las representaciones aprendidas por CanViT sobre un lienzo (canvas) de 64 × 64.

El modelo resuelve un problema concreto de investigación: medir si las características de un foundation model de visión activa, que observa la escena mediante una secuencia de glimpses y la reconstruye en un canvas global, son lo bastante ricas como para soportar una tarea densa de segmentación con solo una cabeza lineal entrenada encima. La sonda se entrena sobre el checkpoint preentrenado `canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16`, destilado de DINOv3, y se libera con licencia MIT.

Es relevante ahora porque CanViT propone un paradigma alternativo al procesamiento de imagen completa: visión activa con memoria espacial explícita. Esta sonda permite a desarrolladores e investigadores reproducir la evaluación del paper y comparar representaciones sin reentrenar el backbone. El repositorio es muy ligero (0,0 GB) y las descargas registradas son 821.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision transformer (CanViT-B/16) con sonda lineal: LayerNorm, dropout, BatchNorm y convolución 1 × 1 |
| Parámetros totales | 159.894 (pesos del repositorio según safetensors; el backbone CanViT-B/16 se carga aparte desde el repo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; canvas de 64 × 64 posiciones y escenas de entrada de 512 px |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT (el backbone se destila de DINOv3, sujeto a la DINOv3 License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base CanViT (Canvas Vision Transformer) es un transformer de visión con un mecanismo de visión activa: recibe una secuencia de glimpses de 128 px muestreados en viewpoints concretos y acumula la información en un canvas de 64 × 64 que actúa como memoria espacial de la escena. La sonda añadida es una cabeza de segmentación semántica compuesta por LayerNorm, dropout (0,1), BatchNorm y una convolución 1 × 1 que proyecta las características congeladas del canvas a las 150 clases de ADE20K.

El entrenamiento de la sonda se realizó con 40.000 pasos, batch size 16, optimizador AdamW con learning rate máximo de 0,0003 y weight decay de 0,001, con 1.500 pasos de warmup lineal seguidos de decaimiento coseno, en precisión bfloat16. Cada rollout consta de 10 glimpses de 128 px con viewpoints R-IID sobre escenas de 512 px. Se aplicaron las transformaciones de segmentación de DINOv3: scale jitter de factor 0,5 a 2, recortes aleatorios de 512 px con rechazo por ratio de clase, volteos horizontales con probabilidad 0,5 y distorsión fotométrica. Los pesos liberados corresponden al paso 35.500, seleccionado por mIoU en validación de ADE20K.

## Capacidades

- Segmentación semántica densa sobre 150 clases de ADE20K a resolución de canvas 64 × 64.
- Extracción de características congeladas de CanViT-B/16 sobre un canvas de memoria espacial.
- Procesamiento de escenas mediante secuencias de glimpses con viewpoints arbitrarios (visión activa).
- Evaluación reproducible del protocolo de probing del paper de CanViT.
- Integración con la librería `canvit-pytorch` (>= 0.2) mediante `CanViTForSemanticSegmentation.from_pretrained_with_probe`.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Evaluación de representaciones de visión activa: investigadores que quieran medir la calidad de las características de CanViT sobre una tarea densa sin reentrenar el backbone, usando directamente esta sonda con el protocolo del paper.
- Reproducción de resultados de NeurIPS 2026: permite replicar la métrica de segmentación ADE20K del paper CanViT cargando el checkpoint base y esta sonda con `from_pretrained_with_probe`.
- Baseline para nuevas sondas: sirve como referencia para comparar cabezas de segmentación alternativas entrenadas sobre el mismo canvas de 64 × 64 y el mismo conjunto de rollouts.
- Prototipado de pipelines de segmentación con memoria espacial: útil para experimentar con la API de estado (`init_state`, `Viewpoint.full_scene`, `sample_at_viewpoint`) antes de invertir en un fine-tuning completo.
- Investigación en eficiencia de muestreo: al fijar 10 glimpses de 128 px por escena de 512 px, permite estudiar el compromiso entre número de observaciones y calidad de segmentación.
- Docencia y divulgación: ejemplo compacto de linear probing sobre un foundation model de visión, con receta de entrenamiento y transformaciones documentadas de forma explícita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el checkpoint liberado se seleccionó por mIoU en validación de ADE20K en el paso 35.500, pero no se proporciona el valor numérico de dicha métrica ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el repositorio de la sonda ocupa 0,0 GB y los 159.894 parámetros son despreciables, pero el backbone CanViT-B/16 se carga aparte y domina el consumo.
- GPU recomendadas: no disponible; el ejemplo oficial usa tensores de entrada de 512 px y bfloat16 autocast, lo que sugiere GPU con soporte de bfloat16 (Ampere o posterior).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; un backbone B/16 en bfloat16 es plausible en GPUs de consumo con suficiente VRAM, pero no hay cifras publicadas.
- Opciones de despliegue: `canvit-pytorch` >= 0.2 (instalación con `uv add "canvit-pytorch>=0.2"`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros probes de segmentación sobre canvases de visión activa ni resultados numéricos que permitan una comparación rigurosa con alternativas como sondas lineales sobre DINOv3 o sobre ViT-B/16 estándar.

## Limitaciones y advertencias

- No es un modelo de propósito general: solo produce segmentación semántica ADE20K sobre el canvas de 64 × 64 del backbone CanViT-B/16 concreto; no funciona de forma autónoma.
- Dependencia estricta del checkpoint base `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02`; las características congeladas deben coincidir con las usadas en el entrenamiento.
- Resolución de salida limitada: 64 × 64 posiciones para escenas de 512 px, lo que restringe la precisión en objetos pequeños.
- Entrenado con 10 glimpses de 128 px y viewpoints R-IID; el rendimiento puede degradarse con otras políticas de muestreo o números de glimpses.
- Riesgo de sesgos heredados de ADE20K y de los datos de preentrenamiento de DINOv3, no cuantificado en la información disponible.
- Riesgo de alucinación de clases en regiones ambiguas, inherente a la segmentación densa; no se documentan métricas de calibración.
- Licencia MIT para la sonda, pero el backbone se destila de DINOv3 y queda sujeto a la DINOv3 License; conviene revisar sus términos antes de uso comercial.
- Cambio de API entre versiones: con `canvit-pytorch` < 0.2 es necesario pasar `revision="canvit-pytorch-0.1"` a `from_pretrained`.
- Sin soporte de lenguaje, tool calling ni agentes; no debe evaluarse con criterios de modelos LLM.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Paper (NeurIPS 2026): https://openreview.net/forum?id=cnV9GA4pKU
- arXiv: https://arxiv.org/abs/2603.22570
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
- Dataset: https://huggingface.co/datasets/zhoubolei/scene_parse_150
- DINOv3: https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
