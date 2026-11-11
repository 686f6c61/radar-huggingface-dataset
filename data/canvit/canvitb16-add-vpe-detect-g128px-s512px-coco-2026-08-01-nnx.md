# canvit/canvitb16-add-vpe-detect-g128px-s512px-coco-2026-08-01-nnx

## Resumen

CanViT-B COCO detector es un modelo de detección de objetos construido sobre CanViT (Canvas Vision Transformer), un modelo fundacional de visión activa presentado en NeurIPS 2026 por Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna. A diferencia de los detectores estándar que procesan la imagen completa en un solo pase, CanViT observa la escena mediante una secuencia de "glimpses" (recortes de 128 px) y acumula la información en un canvas de escena de 32 × 32 celdas, emitiendo predicciones de cajas después de cada glimpse.

Este checkpoint concreto es un fine-tuning supervisado sobre COCO 2017 del modelo base preentrenado por destilación desde DINOv3 sobre ImageNet-21k. La arquitectura combina un backbone ViT-B/16 con un cabezal CenterNet anclado al canvas, y el entrenamiento se realizó de extremo a extremo con 1024 escenas COCO train2017 por paso y 10 glimpses por rollout. El resultado es un detector que mejora su precisión de forma monótona con cada glimpse adicional, lo que lo hace interesante para escenarios de robótica, inspección o percepción con presupuesto computacional controlable.

El modelo se distribuye en formato NNX (JAX/Flax) con pesos safetensors, tiene 97.545.684 parámetros y una licencia MIT, lo que facilita su uso comercial. Su relevancia actual radica en que explora un paradigma de visión activa poco común en detección: en lugar de escalar resolución de entrada, el modelo decide qué mirar y cuándo, manteniendo un estado de escena persistente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer B/16 con canvas de escena y cabezal CenterNet (visión activa) |
| Parámetros totales | 97.545.684 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); canvas de 32 × 32 celdas y escenas de 512 px con glimpses de 128 px |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT (preentrenamiento por destilación desde DINOv3, sujeto a DINOv3 License) |
| Formato de pesos | safetensors (backend JAX/Flax NNX, librería `canvit-nnx`) |

## Arquitectura y entrenamiento

CanViT es un transformer de visión con un mecanismo de percepción secuencial. El modelo recibe glimpses de 128 px muestreados en posiciones (viewpoints) sobre una escena de 512 px y actualiza un canvas latente de 32 × 32 celdas que actúa como memoria espacial de la escena completa. Sobre ese canvas se aplica un cabezal CenterNet que produce mapas de calor, offsets y dimensiones de cajas para 80 clases COCO. La política de muestreo empleada en evaluación es `coarse_to_fine` (C2F), que va refinando la cobertura de la escena a lo largo de 21 glimpses.

El checkpoint parte del modelo base `canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16`, preentrenado sobre ImageNet-21k mediante destilación desde DINOv3 (ViT-B/16). El fine-tuning para detección se ejecutó durante 16.172 pasos completos, con 1024 escenas COCO train2017 por paso y rollouts de 10 glimpses; la receta completa está documentada en `provenance.json` del repositorio. La innovación principal es la decodificación incremental: el modelo puede emitir detecciones tras cada glimpse, permitiendo un compromiso explícito entre coste computacional y precisión (AP 0,1931 con 0 glimpses frente a 0,3242 con 20).

## Capacidades

- Detección de objetos en 80 clases COCO con cajas normalizadas (ymin, xmin, ymax, xmax), scores y índices de clase.
- Predicción incremental tras cada glimpse, con estado de escena persistente entre pasos.
- Percepción activa: el consumidor controla la política de viewpoints (por ejemplo, `coarse_to_fine`) y el número de glimpses.
- Memoria de escena a través del canvas de 32 × 32, que integra información de múltiples recortes.
- Integración con JAX/Flax NNX mediante `CanViTForObjectDetection` y utilidades `sample_at_viewpoint`, `normalize` y `decode`.
- No soporta tool calling, agentes, texto, audio ni capacidades multilingües; es un modelo puramente visual.

## Casos de uso

- Inspección industrial con presupuesto variable: el operador puede fijar el número de glimpses según el tiempo disponible por pieza; con 5 glimpses se obtiene AP ≈ 0,287 y con 20 se alcanza AP ≈ 0,324, lo que permite degradar graciosamente en líneas de producción rápidas.
- Robótica móvil con fóvea: un brazo o dron puede dirigir los glimpses a regiones de interés seleccionadas por la política C2F, reduciendo el coste de captura frente a procesar la escena completa a alta resolución.
- Detección en imágenes de gran tamaño: al trabajar con escenas de 512 px y recortes de 128 px, el modelo es adecuado para dividir imágenes de alta resolución en regiones y agregar detecciones en el canvas sin reencuadrar toda la imagen.
- Análisis progresivo en streaming: la naturaleza incremental permite emitir detecciones preliminares con pocos glimpses y refinarlas conforme llegan nuevos recortes, útil en vigilancia o monitorización.
- Investigación en visión activa: sirve como baseline reproducible para comparar políticas de muestreo (C2F frente a alternativas) sobre COCO val2017 con el script `python -m canvit_nnx.detect.evaluate`.
- Prototipado en ecosistema JAX: equipos que ya usan Flax NNX pueden integrar el detector directamente sin convertir pesos a PyTorch, aprovechando `jax.jit` y el entrenamiento diferenciable del rollout.
- Evaluación de destilación desde DINOv3: el checkpoint permite estudiar cómo se transfiere el conocimiento de un ViT-B/16 autosupervisado a una tarea densa de detección con percepción secuencial.

## Benchmarks y rendimiento

COCO val2017 (5000 imágenes), política C2F, medias sobre 5 muestreos independientes de viewpoints (intervalos bootstrap del 95 % entre corchetes):

| Glimpse | AP | AP50 | AP75 |
|---|---|---|---|
| 0 | 0,1931 | 0,3517 | 0,1881 |
| 1 | 0,2208 [0,2204; 0,2212] | 0,3868 [0,3861; 0,3874] | 0,2185 [0,2172; 0,2201] |
| 2 | 0,2437 [0,2430; 0,2446] | 0,4197 [0,4183; 0,4210] | 0,2434 [0,2412; 0,2448] |
| 3 | 0,2643 [0,2637; 0,2648] | 0,4489 [0,4483; 0,4496] | 0,2653 [0,2633; 0,2672] |
| 4 | 0,2839 [0,2837; 0,2842] | 0,4753 [0,4747; 0,4759] | 0,2875 [0,2872; 0,2878] |
| 5 | 0,2870 [0,2866; 0,2873] | 0,4788 [0,4782; 0,4793] | 0,2914 [0,2910; 0,2917] |
| 9 | 0,2978 [0,2974; 0,2982] | 0,4943 [0,4937; 0,4950] | 0,3027 [0,3015; 0,3038] |
| 20 | 0,3242 [0,3241; 0,3244] | 0,5334 [0,5329; 0,5339] | 0,3337 [0,3330; 0,3344] |

No se han publicado en la información disponible resultados comparativos con otros detectores (por ejemplo, Faster R-CNN o DETR) ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; con 97,5 M de parámetros en fp32 los pesos ocupan aproximadamente 0,39 GB, pero el consumo real depende del tamaño de lote, del canvas y de la compilación JIT.
- GPU recomendadas: no disponibles explícitamente; al ser JAX/Flax, cualquier GPU compatible con CUDA y XLA (A100, H100, RTX 4090, etc.) puede ejecutar el modelo.
- GPU de consumo: por el tamaño del checkpoint (0,4 GB de repositorio) es probable que quepa en GPUs consumer, aunque no se confirma en la información disponible.
- Opciones de despliegue: `canvit-nnx` sobre JAX/Flax NNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros detectores (DETR, Faster R-CNN, YOLO) ni con otros checkpoints CanViT más allá del modelo base de preentrenamiento.

## Limitaciones y advertencias

- El rendimiento en COCO es modesto en términos absolutos (AP 0,3242 con 20 glimpses), muy por debajo de detectores modernos de una sola pasada; está pensado como modelo de investigación en visión activa, no como detector de producción de alta precisión.
- Requiere un bucle de inferencia con política de viewpoints; no es un detector de un solo pase y exige gestionar estado entre llamadas.
- Depende de la política C2F para los resultados reportados; otras políticas pueden degradar la precisión.
- El preentrenamiento por destilación desde DINOv3 implica que el uso comercial puede estar sujeto adicionalmente a la DINOv3 License, aunque el checkpoint se distribuya como MIT.
- No dispone de información sobre sesgos por clase, rendimiento en dominios distintos de COCO ni robustez ante condiciones adversas.
- No soporta texto, audio ni interacción multimodal; cualquier caso de uso lingüístico queda fuera de su alcance.
- El backend JAX/Flax NNX limita la integración con ecosistemas PyTorch dominantes sin conversión adicional.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de falsos positivos y cajas mal calibradas, especialmente con pocos glimpses.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canvit/canvitb16-add-vpe-detect-g128px-s512px-coco-2026-08-01-nnx
- Modelo base de preentrenamiento: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02-nnx
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Checkpoints CanViT: https://huggingface.co/canvit
- Documentación del módulo de detección: https://github.com/m2b3/CanViT/blob/main/canvit-nnx/canvit_nnx/detect/README.md
- DINOv3 (origen del preentrenamiento): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
