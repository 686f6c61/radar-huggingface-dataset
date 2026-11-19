# canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22-nnx

## Resumen

CanViT (Canvas Vision Transformer) es un modelo fundacional de visión activa desarrollado por el equipo canvit (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna), presentado en NeurIPS 2026. A diferencia de los vision transformers convencionales que procesan una imagen completa en una sola pasada, CanViT observa una escena mediante una secuencia de vistazos (glimpses) y acumula la información en un lienzo (canvas) de representación global. Este checkpoint concreto es la conversión al formato canvit-nnx (JAX / Flax NNX) del modelo preentrenado original.

El modelo parte de una arquitectura ViT-B/16 con 98.114.176 parámetros, entrenado sobre escenas de 512 px con vistazos de 128 px y un canvas de 32 × 32, y preentrenado sobre ImageNet-1k mediante destilación de DINOv3. Su propósito es servir como extractor de características de imagen con capacidad de memoria espacial acumulativa, lo que lo hace relevante para tareas de exploración visual, robótica y percepción con presupuesto de cómputo limitado por paso.

La relevancia actual reside en que propone un paradigma de visión activa (selección secuencial de dónde mirar) frente al procesamiento denso de imagen completa, con una licencia MIT permisiva y un pipeline de inferencia en JAX/NNX que facilita su integración en stacks de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16) con mecanismo de visión activa y canvas de estado; implementación JAX / Flax NNX |
| Parametros totales | 98.114.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (canvas de 32 × 32 posiciones; escenas de 512 px con vistazos de 128 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint canvit-nnx para JAX / Flax NNX) |

## Arquitectura y entrenamiento

CanViT se basa en un backbone ViT-B/16 que procesa vistazos individuales de 128 px extraídos de una escena de 512 px. El modelo mantiene un estado recurrente denominado canvas, una rejilla de 32 × 32 posiciones donde se acumula y actualiza la información de los vistazos sucesivos, permitiendo una representación global de la escena sin procesarla entera de una vez. La variante "add-vpe" incorpora codificación de posición de punto de vista (viewpoint positional encoding), que informa al modelo de la localización espacial de cada vistazo dentro de la escena.

El preentrenamiento se realiza por destilación desde DINOv3 sobre ImageNet-1k, lo que transfiere las representaciones auto-supervisadas del modelo profesor. El checkpoint se ha validado en la conversión a 512 px de escena, 128 px de vistazo y canvas de 32 × 32. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset más allá de ImageNet-1k, ni sobre etapas de RLHF/DPO (no aplicables a un modelo puramente visual).

## Capacidades

- Extracción de características de imagen mediante vistazos secuenciales con memoria espacial acumulativa.
- Procesamiento de escenas de 512 px a partir de vistazos de 128 px, con control explícito del punto de vista de cada muestra.
- Representación global de escena en un canvas de 32 × 32 posiciones, útil para tareas que requieren integración de información a lo largo de una exploración.
- Soporte de inferencia con estado persistente (`init_state`, actualización iterativa de `state`) para flujos de visión activa.
- Compatibilidad con el ecosistema JAX / Flax NNX a través de la librería `canvit-nnx`.
- No soporta generación de texto, tool calling, agentes conversacionales ni capacidades multilingües: es un modelo exclusivamente visual.

## Casos de uso

- Exploración visual en robótica: el modelo puede recibir vistazos sucesivos de un entorno y acumular una representación en el canvas, adecuado para agentes que no pueden observar la escena completa de una vez.
- Percepción con presupuesto computacional limitado: al procesar vistazos de 128 px en lugar de la escena completa de 512 px, permite reducir el coste por paso en pipelines de inferencia en tiempo real.
- Extracción de features para clasificación o recuperación: el estado del canvas puede usarse como embedding de escena para tareas downstream de image retrieval o clasificación.
- Investigación en visión activa: sirve como baseline reproducible (formato NNX, licencia MIT) para experimentos sobre políticas de selección de vistazos.
- Preentrenamiento y fine-tuning en JAX: el checkpoint `CanViTForPretraining` permite inicializar modelos para tareas de destilación o adaptación con el stack Flax NNX.
- Segmentación y detección con memoria espacial: la representación acumulada en el canvas puede alimentar cabezas de tarea que se beneficien de información integrada de múltiples regiones.
- Evaluación comparativa de estrategias de atención visual: el control explícito del `Viewpoint` facilita experimentos controlados sobre dónde y cuándo mirar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 98,1 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,4 GB; en fp16/bf16, unos 0,2 GB. El consumo real depende del tamaño de lote y de la rejilla del canvas.
- GPU recomendadas: cualquier GPU con soporte JAX/CUDA, incluidas RTX 3090, RTX 4090, A100 y H100; el modelo es lo bastante pequeño para GPUs de gama media.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más de VRAM para inferencia en fp16/bf16.
- Opciones de despliegue: JAX / Flax NNX mediante la librería `canvit-nnx`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo visual de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CanViT (este checkpoint) | 98,1 M | Escena 512 px, vistazos 128 px, canvas 32 × 32 | Visión activa con estado | MIT | Hugging Face (canvit-nnx) |
| DINOv3 ViT-B/16 | no disponible en la información | Imagen completa | Auto-supervisado denso | DINOv3 License | GitHub facebookresearch/dinov3 |
| ViT-B/16 estándar | ~86 M | Imagen completa (p. ej. 224 px) | Transformer de visión supervisado | variable según checkpoint | Amplia disponibilidad |

La comparación directa con DINOv3 ViT-B/16 es la más relevante, ya que CanViT se destila precisamente de él; sin embargo, no se dispone de métricas comparativas publicadas en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente visual: no procesa texto ni mantiene conversaciones; no debe evaluarse como un LLM.
- El preentrenamiento se realiza por destilación de DINOv3, por lo que hereda posibles sesgos de representación del modelo profesor y de ImageNet-1k.
- La licencia del checkpoint es MIT, pero DINOv3 se distribuye bajo la DINOv3 License; conviene revisar las condiciones de uso derivadas en despliegues comerciales.
- La ventana de contexto visual está acotada al canvas de 32 × 32 y a escenas de 512 px; no se documenta comportamiento fuera de esa configuración.
- No hay datos publicados de benchmarks, latencia ni robustez fuera de la configuración validada (512 px / 128 px / canvas 32 × 32).
- Al ser un checkpoint de preentrenamiento (`CanViTForPretraining`), no incluye cabezas de tarea; requiere fine-tuning o adaptación para aplicaciones concretas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de representaciones erróneas en regiones no visitadas por los vistazos.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22-nnx
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22
- Paper (arXiv): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
- DINOv3: https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
