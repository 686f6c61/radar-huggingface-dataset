# canvit/probe-ade20k-40k-s512-c64-in1k

## Resumen

`canvit/probe-ade20k-40k-s512-c64-in1k` es una sonda lineal (*linear probe*) de segmentación semántica sobre ADE20K, construida sobre las características congeladas del modelo fundacional de visión activa CanViT (Canvas Vision Transformer). No es un modelo generativo ni un LLM: es un cabezal de segmentación entrenado para evaluar la calidad de las representaciones del checkpoint base `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22`, desarrollado por el grupo CanViT y presentado en el paper "CanViT: Toward Active-Vision Foundation Models" (NeurIPS 2026).

CanViT propone un paradigma de visión activa: el modelo observa una escena mediante una secuencia de *glimpses* (parches de 128 px en este caso) y acumula la información en un *canvas* de 64 × 64 posiciones, en lugar de procesar la imagen completa de una sola pasada. Esta sonda concreta demuestra que las representaciones del canvas congelado son lo bastante informativas como para resolver segmentación semántica densa con un cabezal lineal, lo que sirve como validación cuantitativa del preentrenamiento.

El interés práctico es doble: por un lado, permite reproducir el protocolo de evaluación del paper con código mínimo; por otro, ofrece un modelo de segmentación de 150 clases de ADE20K funcional y ligero (menos de 160 000 parámetros en la sonda) que se apoya en un backbone preentrenado por destilación desde DINOv3. La licencia MIT del repositorio facilita su uso, aunque el backbone hereda restricciones de la licencia de DINOv3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer de visión activa (CanViT) con sonda lineal: LayerNorm, dropout, BatchNorm y convolución 1 × 1 |
| Parametros totales | 159 894 (solo la sonda; el backbone se carga aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (canvas de 64 × 64 posiciones; glimpses de 128 px sobre escenas de 512 px) |
| Tipos de cuantizacion | no disponible (entrenamiento en bfloat16 autocast; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT (el backbone deriva de DINOv3, sujeto a la DINOv3 License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base CanViT es un transformer de visión activa: en lugar de codificar la imagen completa de una vez, recibe una secuencia de *glimpses* muestreados en viewpoints concretos y mantiene un estado de escena (canvas) de 64 × 64 posiciones que se actualiza con cada observación. El backbone `canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16` corresponde a una variante B/16 con positional encoding añadido, preentrenada sobre escenas de 512 px con glimpses de 128 px y destilada desde DINOv3-B/16 sobre ImageNet-1k.

La sonda se entrena con las características del canvas congeladas, siguiendo el protocolo del paper: rollouts de 10 glimpses de 128 px con viewpoints R-IID sobre escenas de 512 px, 40 000 pasos con batch de 16, optimizador AdamW con learning rate pico 0,0003 y weight decay 0,001, warmup lineal de 1 500 pasos seguido de decaimiento coseno. Se aplican las transformaciones de segmentación de DINOv3 (scale jitter de factor 0,5 a 2, recortes aleatorios de 512 px con rechazo por ratio de clases, volteo horizontal con probabilidad 0,5 y distorsión fotométrica), dropout de 0,1 y autocast en bfloat16. Los pesos publicados corresponden al paso 33 000, seleccionado por mIoU en el conjunto de validación de ADE20K.

## Capacidades

- Segmentación semántica densa sobre 150 clases de ADE20K, con salida de logits de forma `[batch, 150, 64, 64]`.
- Procesamiento de escenas mediante visión activa: muestreo de glimpses en viewpoints y acumulación de estado en un canvas de 64 × 64.
- Evaluación de representaciones congeladas: la sonda sirve para medir la calidad del backbone sin reentrenarlo.
- Integración con la librería `canvit-pytorch` (>= 0.2) para carga conjunta de backbone y sonda mediante `from_pretrained_with_probe`.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto ni capacidades multilingües: es un modelo puramente visual y discriminativo.

## Casos de uso

- Evaluación de checkpoints de CanViT: cargar la sonda sobre un backbone concreto para obtener mIoU en ADE20K y comparar variantes de preentrenamiento sin entrenar un cabezal nuevo.
- Segmentación semántica de interiores y escenas exteriores: las 150 clases de ADE20K cubren categorías como paredes, suelo, muebles, vegetación y vehículos, útiles en pipelines de comprensión de escena.
- Investigación en visión activa: reproducir el protocolo del paper (10 glimpses de 128 px, viewpoints R-IID) para estudiar cómo afecta la política de muestreo a la calidad de la representación.
- Prototipado rápido de segmentación: al ser una sonda lineal de menos de 160 000 parámetros, el coste de adaptación es mínimo frente a fine-tuning completo del backbone.
- Generación de máscaras para preetiquetado: usar las predicciones como etiquetas débiles en datasets propios antes de una revisión humana.
- Docencia y divulgación: ejemplo compacto de linear probing sobre un modelo fundacional con API de pocas líneas y pesos públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el backbone es un ViT-B/16 (aproximadamente 86 M de parámetros) y la sonda añade 159 894 parámetros, por lo que la inferencia cabe holgadamente en GPUs de consumo con precisión bfloat16.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 (RTX 30xx/40xx, A100, H100); no se documentan requisitos mínimos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM, dado el tamaño del backbone y la resolución de trabajo (512 px, glimpses de 128 px).
- Opciones de despliegue: la librería oficial `canvit-pytorch` (>= 0.2); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Tarea | Licencia |
|---|---|---|---|---|---|
| probe-ade20k-40k-s512-c64-in1k | Sonda lineal sobre CanViT-B/16 | 159 894 (sonda) | Canvas 64 × 64, escenas 512 px | Segmentacion semantica ADE20K (150 clases) | MIT (backbone con licencia DINOv3) |
| Segment Anything (SAM) | Promptable segmentation | ~632 M (ViT-H) | 1024 px | Segmentacion promptable, no semantica | Apache 2.0 |
| DINOv3 + cabezal lineal | Backbone ViT destilado | ~86 M (B/16) | Variable | Segmentacion via linear probe | DINOv3 License |
| Mask2Former (ADE20K) | Transformer de segmentacion | ~47 M (Swin-T) | Variable | Segmentacion panoptica/semantica | Attribution-NonCommercial |

La comparación con SAM no es directa: SAM segmenta con prompts y no asigna clases semánticas, mientras que esta sonda produce etiquetas de 150 clases. Frente a DINOv3 con cabezal lineal, la diferencia clave es el paradigma de visión activa y el canvas de 64 × 64, que reduce la resolución espacial de salida. Mask2Former está especializado en segmentación y suele obtener mejor mIoU, pero su licencia no comercial limita el uso en producción.

## Limitaciones y advertencias

- La sonda está entrenada exclusivamente sobre ADE20K (150 clases); no generaliza a categorías fuera de ese vocabulario.
- La salida tiene resolución de 64 × 64 sobre escenas de 512 px, por lo que los objetos pequeños pueden perderse o quedar mal delimitados.
- Al ser una sonda lineal sobre características congeladas, su techo de rendimiento está acotado por la calidad del backbone; no sustituye a un fine-tuning completo en tareas exigentes.
- El backbone deriva de DINOv3, cuya licencia puede imponer restricciones adicionales al uso comercial aunque el repositorio de la sonda sea MIT; conviene revisar la DINOv3 License antes de desplegar.
- Riesgo de sesgos heredados del dataset ADE20K (escenas principalmente de interiores y entornos urbanos) y de las imágenes de preentrenamiento del backbone.
- No se documentan métricas de calibración ni de robustez frente a dominios distintos de ADE20K; en producción se recomienda validar con datos propios.
- El modelo no procesa texto ni audio y no dispone de interfaz conversacional; cualquier uso en pipelines multimodales requiere componentes externos.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in1k
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22
- Paper (arXiv): https://arxiv.org/abs/2603.22570
- Paper (OpenReview): https://openreview.net/forum?id=cnV9GA4pKU
- Codigo: https://github.com/m2b3/CanViT
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- Checkpoints CanViT: https://huggingface.co/canvit
- Dataset ADE20K (scene_parse_150): https://huggingface.co/datasets/zhoubolei/scene_parse_150
- DINOv3: https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
