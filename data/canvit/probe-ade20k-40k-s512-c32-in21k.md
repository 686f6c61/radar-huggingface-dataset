# canvit/probe-ade20k-40k-s512-c32-in21k

## Resumen

CanViT (Canvas Vision Transformer) es un modelo de visión artificial de tipo "active vision": en lugar de procesar la imagen completa de una vez, observa la escena mediante una secuencia de "glimpses" (fragmentos) y va construyendo y memorizando la representación de la escena sobre un "canvas" (lienzo) global. El checkpoint que nos ocupa, `canvit/probe-ade20k-40k-s512-c32-in21k`, no es un modelo generativo ni un modelo base, sino una **sonda lineal (linear probe) de segmentación semántica** entrenada sobre las características congeladas del modelo base CanViT, con el protocolo de probing del paper.

El modelo lo desarrolla el equipo de CanViT (Berreby, Du, Durand y Krishna) y se presentó en NeurIPS 2026. Resuelve el problema de evaluar la calidad de las representaciones visuales aprendidas por un modelo de visión activa: en lugar de reentrenar el backbone, se congela y se entrena una cabeza ligera para segmentación semántica sobre ADE20K. Es relevante porque proporciona una referencia reproducible de hasta qué punto las características del canvas de CanViT capturan información semántica densa, y porque su uso es directo con la librería `canvit-pytorch`.

Arquitectónicamente, el probe opera sobre el canvas de 32 × 32 del backbone `canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02`, un ViT-B/16 con 128 px por glimpse y escenas de 512 px. El checkpoint liberado tiene 159.894 parámetros (la cabeza del probe, no el backbone), se distribuye en safetensors con licencia MIT y está pensado para inferencia en modo evaluación sobre características congeladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal sobre canvas de CanViT: LayerNorm + dropout + BatchNorm + convolución 1 × 1 sobre características congeladas de un ViT-B/16 (CanViT) |
| Parametros totales | 159.894 (solo la cabeza del probe; el backbone no está incluido en este repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de visión; canvas de 32 × 32 y escenas de 512 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT (el backbone CanViT se destila de DINOv3, sujeto a la DINOv3 License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El probe es una cabeza de segmentación semántica ligera compuesta por LayerNorm, dropout (0,1), BatchNorm y una convolución 1 × 1, que se aplica sobre las características del canvas de 32 × 32 producidas por el backbone CanViT congelado. El backbone es un Vision Transformer B/16 que procesa la escena mediante una secuencia de 10 glimpses de 128 px muestreados con viewpoints R-IID sobre escenas de 512 px, acumulando la información en un canvas global de 32 × 32. El modelo base se preentrenó por destilación desde DINOv3 (variante `dv3b16`) sobre ImageNet-21k.

El entrenamiento del probe se realizó durante 40.000 pasos con batch size 16, optimizador AdamW (learning rate pico 0,0003, weight decay 0,001), warmup lineal de 1.500 pasos seguido de decaimiento coseno, precisión bfloat16 con autocast y las transformaciones de aumento de DINOv3 para segmentación (scale jitter de 0,5 a 2, recortes aleatorios de 512 px con rechazo por ratio de clases, volteos horizontales con probabilidad 0,5 y distorsión fotométrica). Los pesos liberados corresponden al paso 38.000, seleccionado por mIoU en el conjunto de validación de ADE20K.

## Capacidades

- Segmentación semántica densa sobre 150 clases de ADE20K, produciendo un mapa de logits de forma `[1, 150, 32, 32]`.
- Extracción de características visuales congeladas del canvas de CanViT (32 × 32) para tareas densas.
- Procesamiento de escenas mediante secuencia de glimpses con viewpoints configurables (R-IID o escena completa).
- Integración con la librería `canvit-pytorch` (>= 0.2) mediante `CanViTForSemanticSegmentation.from_pretrained_with_probe`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No soporta visión generativa, audio ni modos de "thinking".

## Casos de uso

- **Evaluación de representaciones de visión activa**: usar el probe como referencia reproducible para medir la calidad de las características del canvas de CanViT en segmentación semántica, comparando checkpoints del backbone con el mismo protocolo de probing.
- **Investigación en active vision**: analizar cómo afecta el número y la distribución de glimpses (R-IID frente a escena completa) a la calidad de la segmentación densa, manteniendo el probe fijo.
- **Segmentación semántica de escenas interiores y exteriores**: el modelo produce etiquetas ADE20K (150 clases) sobre escenas de 512 px, útil para prototipos de análisis de escenas en robótica o conducción asistida.
- **Pipeline de etiquetado asistido**: generar máscaras semánticas preliminares sobre imágenes para revisión humana en conjuntos de datos de interior, aprovechando la licencia MIT y el bajo coste de la cabeza (159.894 parámetros).
- **Benchmark interno de backbones de visión**: integrar el probe en una batería de evaluación para comparar variantes de CanViT (distintos tamaños de canvas, resolución de glimpse o preentrenamiento) sin reentrenar cabezas específicas.
- **Docencia y reproducción de resultados**: reproducir el protocolo de probing del paper de CanViT con un checkpoint público y un script de inferencia mínimo, útil para cursos de visión por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que los pesos liberados (paso 38.000) se seleccionaron por mIoU en el conjunto de validación de ADE20K, pero no se proporciona el valor numérico de mIoU ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el probe en sí ocupa menos de 1 MB, pero requiere cargar el backbone CanViT-B/16 (ViT-B/16, ~86 M de parámetros) junto con el estado del canvas.
- GPU recomendadas: cualquier GPU con soporte de bfloat16; el backbone ViT-B/16 cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 (12 GB) o superiores, dado el tamaño del backbone ViT-B/16 y escenas de 512 px.
- Opciones de despliegue: `canvit-pytorch` >= 0.2 (con `from_pretrained_with_probe`); para versiones 0.1 es necesario fijar `revision="canvit-pytorch-0.1"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros probes de segmentación ni con modelos de segmentación semántica de referencia (por ejemplo, cabezas lineales sobre DINOv2/DINOv3), por lo que no es posible establecer una comparativa rigurosa con datos verificables.

## Limitaciones y advertencias

- El checkpoint contiene únicamente la cabeza del probe (159.894 parámetros); sin el backbone `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02` no es funcional.
- La resolución de salida es de 32 × 32 sobre escenas de 512 px, lo que limita la precisión de los contornos en objetos pequeños.
- El probe está entrenado específicamente para las 150 clases de ADE20K; no generaliza a otras taxonomías sin reentrenamiento.
- El backbone se destila de DINOv3, cuya licencia (DINOv3 License) puede imponer restricciones adicionales al uso comercial del modelo combinado, a pesar de que el probe se distribuya bajo MIT.
- No se han publicado métricas de mIoU ni análisis de sesgos en la información disponible; se desconoce el comportamiento en dominios alejados de ADE20K (imágenes médicas, satelitales, etc.).
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de asignaciones erróneas de clase en regiones ambiguas o de baja textura.
- El modelo no procesa lenguaje ni instrucciones; cualquier uso debe ser como componente de un pipeline de visión.

## Enlaces

- [Hugging Face: canvit/probe-ade20k-40k-s512-c32-in21k](https://huggingface.co/canvit/probe-ade20k-40k-s512-c32-in21k)
- [Modelo base en Hugging Face](https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02)
- [Paper (NeurIPS 2026, OpenReview)](https://openreview.net/forum?id=cnV9GA4pKU)
- [arXiv:2603.22570](https://arxiv.org/abs/2603.22570)
- [Código (GitHub)](https://github.com/m2b3/CanViT)
- [Página del proyecto](https://m2b3.github.io/CanViT/)
- [Todos los checkpoints de CanViT](https://huggingface.co/canvit)
- [DINOv3 (GitHub)](https://github.com/facebookresearch/dinov3)
- [Licencia DINOv3](https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md)
- [Dataset ADE20K (zhoubolei/scene_parse_150)](https://huggingface.co/datasets/zhoubolei/scene_parse_150)
