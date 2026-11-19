# canvit/probe-ade20k-40k-s512-c32-in1k

## Resumen

`canvit/probe-ade20k-40k-s512-c32-in1k` es una sonda lineal (linear probe) de segmentación semántica entrenada sobre las características congeladas del modelo base CanViT-B/16, un vision transformer de "visión activa" que percibe escenas mediante secuencias de vistazos (glimpses) y las reconstruye sobre un lienzo (canvas) de 32 × 32. No es un modelo generativo ni un LLM: es un cabezal de segmentación que mapea las features del canvas de CanViT a las 150 clases de ADE20K. Lo publica el equipo CanViT (Yohaï-Eliel Berreby y colaboradores) junto al artículo presentado en NeurIPS 2026.

El modelo resuelve la evaluación de representaciones visuales: al mantener congelado el backbone y entrenar solo una sonda ligera, permite medir de forma aislada la calidad de las features de CanViT para segmentación semántica, siguiendo el protocolo de probing del paper. Es relevante porque CanViT propone un paradigma alternativo al transformer de visión clásico (atención sobre vistazos en lugar de sobre todos los parches de la imagen), y este checkpoint es una de las piezas que permite comparar ese paradigma con DINOv3 y otros backbones densos.

El checkpoint liberado corresponde al paso 36.500 de entrenamiento (seleccionado por mIoU en validación de ADE20K) sobre un total de 40.000 pasos, con escenas de 512 px y rollouts de 10 vistazos de 128 px. El repositorio es muy pequeño (0,0 GB) y el recuento de parámetros en safetensors es de 159.894, coherente con una sonda de convolución 1 × 1 más normalizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal sobre canvas de CanViT-B/16 (vision transformer de visión activa); cabezal: LayerNorm, dropout, BatchNorm y convolución 1 × 1 |
| Parametros totales | 159.894 (solo la sonda; el backbone CanViT-B/16 se carga aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (visión); canvas de 32 × 32, escenas de 512 px, vistazos de 128 px |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precisión de entrenamiento bfloat16) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT (backbone CanViT preentrenado por destilación de DINOv3, sujeto a la DINOv3 License) |
| Formato de pesos | safetensors (librería `canvit-pytorch`) |

## Arquitectura y entrenamiento

La sonda opera sobre las features del canvas de 32 × 32 del checkpoint `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22`. El backbone CanViT-B/16 es un vision transformer de visión activa: procesa la escena como una secuencia de vistazos de 128 px muestreados en viewpoints, y acumula la información en un canvas de escena de tamaño fijo. Sobre ese canvas, la sonda aplica LayerNorm, dropout (0,1), BatchNorm y una convolución 1 × 1 que produce logits de 150 clases a resolución 32 × 32, que se reescalan a la imagen de entrada.

El entrenamiento usó 40.000 pasos con batch de 16, AdamW con learning rate pico 0,0003 y weight decay 0,001, warmup lineal de 1.500 pasos seguido de decaimiento coseno, autocast en bfloat16. Los rollouts de entrenamiento constan de 10 vistazos de 128 px con viewpoints R-IID sobre escenas de 512 px. Como aumentación se emplearon las transformaciones de segmentación de DINOv3: scale jitter de factor 0,5 a 2, recortes aleatorios de 512 px con rechazo por ratio de clases, volteos horizontales con probabilidad 0,5 y distorsión fotométrica. El dataset es `zhoubolei/scene_parse_150` (ADE20K).

## Capacidades

- Segmentación semántica densa en 150 clases de ADE20K a partir de las features del canvas de CanViT.
- Evaluación de representaciones: mide la linealidad y calidad de las features de CanViT con el backbone congelado.
- Procesamiento de escenas completas en un único paso (`Viewpoint.full_scene`) o mediante rollouts de múltiples vistazos con estado persistente (`init_state`).
- Integración con el ecosistema `canvit-pytorch` (`CanViTForSemanticSegmentation.from_pretrained_with_probe`).
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto ni capacidades multilingües.
- No incluye visión generativa, audio ni modo "thinking"; su única salida son logits de segmentación.

## Casos de uso

- Evaluación de backbones de visión: cargar la sonda con el backbone congelado para medir mIoU en ADE20K y comparar las features de CanViT frente a DINOv3 u otros backbones en la misma tarea, sin reentrenar el tronco.
- Segmentación de escenas interiores y exteriores: etiquetar píxeles en 150 categorías (muebles, superficies, vegetación, estructuras) para pipelines de anotación automática o preetiquetado de datasets.
- Investigación en visión activa: analizar cómo afecta el número y la distribución de vistazos (rollouts de 10 glimpses de 128 px) a la calidad de la segmentación sobre el canvas de 32 × 32.
- Prototipado rápido de segmentación: al ser una sonda ligera (159.894 parámetros) sobre un backbone preentrenado, permite obtener mapas semánticos con muy poco coste de adaptación frente a un fine-tuning completo.
- Docencia y reproducción de resultados: el protocolo de probing del paper es reproducible con los scripts de `canvit-pytorch` y el dataset público `zhoubolei/scene_parse_150`.
- Componente en sistemas de percepción con recursos limitados: la resolución de trabajo del canvas (32 × 32) reduce el coste computacional del cabezal, útil en entornos con presupuesto de cómputo ajustado para la etapa de etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que el checkpoint liberado (paso 36.500) se seleccionó por mIoU en validación de ADE20K, pero no se proporciona el valor numérico de esa métrica ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; la sonda en sí es mínima (159.894 parámetros, repo de 0,0 GB), pero requiere cargar el backbone CanViT-B/16, cuyo tamaño no se detalla en la información proporcionada.
- GPU recomendadas: no disponible. El entrenamiento usó autocast en bfloat16, lo que sugiere GPUs con soporte BF16 (Ampere o posteriores).
- ¿Cabe en GPU de consumo? No disponible con los datos aportados; depende del backbone CanViT-B/16, no de la sonda.
- Opciones de despliegue: librería `canvit-pytorch` (>= 0.2), con `from_pretrained_with_probe`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de segmentación).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `canvit/probe-ade20k-40k-s512-c32-in1k` | Sonda lineal sobre CanViT-B/16 para ADE20K | 159.894 (sonda) + backbone | Canvas 32 × 32, escenas 512 px | MIT | Hugging Face |
| DINOv3 (backbone de referencia) | Vision transformer denso | no disponible en la información | no disponible | DINOv3 License | GitHub / pesos públicos |
| Otros checkpoints CanViT (`huggingface.co/canvit`) | Backbones y sondas de visión activa | no disponible | Canvas variable | MIT | Hugging Face |

No se dispone de datos de rendimiento comparado (mIoU) entre esta sonda y alternativas, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no soporta tool calling ni agentes; cualquier uso en ese sentido es un error de categoría.
- Solo reconoce las 150 clases de ADE20K; cualquier categoría fuera de ese vocabulario se mapeará incorrectamente.
- La resolución del canvas es 32 × 32, lo que limita la granularidad espacial de la segmentación frente a modelos que operan a resolución completa.
- La sonda está entrenada sobre features congeladas: su calidad está acotada por el backbone CanViT-B/16 y no mejora con fine-tuning del tronco.
- Riesgo de sesgo heredado del dataset `zhoubolei/scene_parse_150` y de DINOv3 (distribución de escenas, geografía y vocabulario visual del dataset original).
- Riesgo de error en clases poco representadas o en escenas fuera de la distribución de ADE20K; no se documentan métricas por clase.
- Aunque la licencia del checkpoint es MIT, el backbone CanViT se preentrenó por destilación de DINOv3, cuya licencia (DINOv3 License) puede imponer condiciones adicionales al uso comercial del conjunto; conviene revisarla antes de producción.
- La model card advierte de un cambio de API entre `canvit-pytorch` 0.1 y 0.2: con versiones anteriores hay que pasar `revision="canvit-pytorch-0.1"` a `from_pretrained`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canvit/probe-ade20k-40k-s512-c32-in1k
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22
- Paper (arXiv): https://arxiv.org/abs/2603.22570
- Paper (OpenReview): https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
- Dataset ADE20K (scene_parse_150): https://huggingface.co/datasets/zhoubolei/scene_parse_150
- DINOv3 (repositorio y licencia): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
