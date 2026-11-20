# canvit/canvitb16-add-vpe-finetune-g128px-s512px-in1k-2026-07-24

## Resumen

CanViT-B es un modelo de visión artificial de tipo *active vision* desarrollado por el equipo CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna), presentado en NeurIPS 2026. A diferencia de un ViT convencional que procesa la imagen completa en una sola pasada, CanViT observa la escena mediante una secuencia de *glimpses* (recortes de 128 px sobre escenas de 512 px) y acumula la información en un *canvas* global de 32 × 32, lo que permite refinar la predicción de forma iterativa.

Este checkpoint concreto es un Vision Transformer de 95,9 millones de parámetros, preentrenado en ImageNet-21k por destilación desde DINOv3 y afinado de extremo a extremo en ImageNet-1k mediante el esquema LP-FT (linear probing seguido de fine-tuning). Alcanza un 84,44 % de Top-1 en la validación de ImageNet-1k con 21 *glimpses* y viewpoints C2F, con un intervalo de confianza del 95 % muy estrecho (84,42–84,46) sobre 11 ejecuciones.

Su relevancia actual reside en que propone una arquitectura de visión fundacional con un paradigma de cómputo adaptativo: el modelo puede decidir cuántos *glimpses* consumir, lo que lo hace útil para escenarios con presupuesto computacional variable y para investigación en atención activa, percepción incremental y eficiencia energética en visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer con *active vision* (Canvas Vision Transformer), basada en ViT-B/16 con VPE añadido |
| Parámetros totales | 95.928.936 (≈95,9 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en términos de tokens; opera con escenas de 512 px, *glimpses* de 128 px y canvas de 32 × 32 |
| Tipos de cuantización | No disponible (pesos en safetensors; el repo no documenta cuantizaciones GGUF/INT8) |
| Idiomas soportados | No aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT (preentrenamiento por destilación desde DINOv3, sujeto a la DINOv3 License) |
| Formato de pesos | safetensors (librería `canvit-pytorch`) |

## Arquitectura y entrenamiento

CanViT-B es un transformer de visión con un mecanismo de percepción secuencial. El modelo recibe *glimpses* de 128 px muestreados en viewpoints concretos sobre escenas de 512 px y actualiza un estado persistente (*canvas*) de 32 × 32 que actúa como memoria de la escena. La variante "add-vpe" incorpora *viewpoint positional embeddings* que codifican la posición de cada *glimpse* dentro de la escena. La lectura de clasificación combina la salida CLS con una sonda lineal de DINOv3 ViT-B/16 (1689 M de imágenes, resolución 512 × 512) para inicializar el cabezal.

El preentrenamiento se realizó en ImageNet-21k por destilación desde DINOv3, y el ajuste final en ImageNet-1k siguió LP-FT: primero *linear probing* y después fine-tuning completo durante 100.000 de 100.080 pasos con batch de 256, optimizador AdamW (lr 2,5e-05, weight decay 1e-04, gradient clipping 1), calentamiento lineal de 25.000 pasos con decaimiento coseno y entropía cruzada tras cada *glimpse* con label smoothing de 0,1. El entrenamiento se ejecutó en JAX/Flax NNX sobre Cloud TPU y se exportó a PyTorch. La configuración de *rollouts* usada es de 4 *glimpses* de 128 px sobre escenas de 512 px con canvas 32 × 32.

## Capacidades

- Clasificación de imágenes en ImageNet-1k (1000 clases) mediante inferencia iterativa por *glimpses*.
- Percepción incremental: la predicción se refina a medida que se procesan más *glimpses*, permitiendo un compromiso explícito entre precisión y cómputo.
- Memoria de escena mediante canvas global de 32 × 32 que integra la información de cada viewpoint.
- Soporte de viewpoints arbitrarios, incluido `Viewpoint.full_scene` para una primera pasada sobre la escena completa.
- Extracción de representaciones visuales (backbone ViT-B/16) reutilizable para tareas *downstream*.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso textual ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo *thinking*, audio ni vídeo documentado.

## Casos de uso

- Investigación en *active vision*: base para experimentos sobre políticas de selección de *glimpses* (C2F u otras) y estudio de cómo la información se acumula en el canvas; el modelo expone `init_state` y `Viewpoint` para controlar la secuencia de percepción.
- Clasificación de imágenes con presupuesto computacional variable: en entornos con límite de cómputo, se pueden usar menos *glimpses* y aceptar una precisión menor, refinando solo cuando sea necesario.
- *Feature extraction* para tareas *downstream*: el backbone ViT-B/16 preentrenado en ImageNet-21k y afinado en ImageNet-1k sirve como extractor de representaciones para detección, segmentación o recuperación visual mediante fine-tuning.
- Prototipado de sistemas de percepción embarcada: al procesar recortes de 128 px en lugar de la escena completa, el coste por paso es menor y encaja en pipelines con memoria limitada.
- *Benchmarking* de arquitecturas de visión activa: referencia reproducible (11 ejecuciones, intervalo bootstrap) para comparar políticas de atención y mecanismos de memoria visual.
- Educación y divulgación: ejemplo didáctico de destilación desde DINOv3, LP-FT y entrenamiento en JAX/Flax exportado a PyTorch, con código de inferencia autocontenido.

## Benchmarks y rendimiento

Resultados declarados por el autor en el *model-index* de la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor | Condiciones |
|---|---|---|---|
| ImageNet-1k (validación) | Top-1 accuracy | 84,44 % | C2F, 21 *glimpses*, escenas 512 px, canvas 32 × 32, media de 11 ejecuciones (IC 95 %: 84,42–84,46) |

No se han publicado en la información disponible resultados de otros benchmarks (p. ej. MMLU, HumanEval o GSM8K, no aplicables a un modelo de visión) ni comparativas numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 para los pesos (95,9 M de parámetros); el consumo real depende del tamaño de lote, del estado del canvas y del número de *glimpses* procesados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para lotes pequeños; A100/H100 no son necesarias para inferencia, solo para reentrenamiento a gran escala.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; el repo pesa 0,4 GB.
- Opciones de despliegue: PyTorch con la librería `canvit-pytorch>=0.2` (instalable con `uv add`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo de texto.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del número de *glimpses* y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CanViT-B (este checkpoint) | 95,9 M | Escenas 512 px, *glimpses* 128 px, canvas 32 × 32 | 84,44 % Top-1 en ImageNet-1k (21 *glimpses*) | MIT (con caveat DINOv3) | Hugging Face, `canvit-pytorch` |
| DINOv3 ViT-B/16 | No disponible en la información | Resolución 512 × 512 (sonda lineal referenciada) | No disponible en la información | DINOv3 License | Hugging Face / GitHub |
| ViT-B/16 estándar | No disponible en la información | Imagen completa | No disponible en la información | No disponible | Amplia disponibilidad |

La información proporcionada no incluye resultados numéricos de DINOv3 ni de ViT-B/16 en ImageNet-1k, por lo que no es posible establecer una comparación cuantitativa rigurosa; los datos de la tabla reflejan únicamente lo documentado.

## Limitaciones y advertencias

- Modelo exclusivamente de clasificación de imágenes en ImageNet-1k; no genera texto ni soporta tareas multimodales.
- Los resultados de *benchmark* son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el *model-index*).
- La precisión depende del número de *glimpses* y de la política de viewpoints; 84,44 % corresponde a 21 *glimpses* con C2F y no debe extrapolarse a configuraciones con menos pasos.
- El preentrenamiento por destilación desde DINOv3 introduce las limitaciones y sesgos del modelo profesor, no documentados en esta ficha.
- La licencia del checkpoint es MIT, pero el uso comercial debe revisarse frente a la DINOv3 License del modelo profesor.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificación errónea en clases visualmente similares o dominios alejados de ImageNet.
- No se documentan sesgos demográficos, geográficos ni de otro tipo; la evaluación se limita a ImageNet-1k.
- El ecosistema de despliegue es reducido (solo `canvit-pytorch`), sin soporte documentado para runtimes de inferencia estándar de producción.
- No hay información sobre latencia, throughput ni comportamiento en dominios fuera de ImageNet.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/canvitb16-add-vpe-finetune-g128px-s512px-in1k-2026-07-24
- Modelo base (preentrenamiento): https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda lineal DINOv3 usada en la inicialización: https://huggingface.co/canvit/dinov3-vitb16-lvd1689m-in1k-512x512-linear-clf-probe
- Paper (NeurIPS 2026, OpenReview): https://openreview.net/forum?id=cnV9GA4pKU
- arXiv: https://arxiv.org/abs/2603.22570
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Repositorio DINOv3: https://github.com/facebookresearch/dinov3
