# hmkang/wam_wan22_dit4dit_robocasa300_hwabl_6latin

## Resumen

El modelo `hmkang/wam_wan22_dit4dit_robocasa300_hwabl_6latin` es un modelo de mundo (world-model) para robótica, desarrollado por hmkang como parte de una serie de ablaciones sobre la longitud de contexto latente limpio. Se basa en el backbone Wan2.2-TI2V-5B y sigue la receta 4knob-A de huiwon, pero con un cambio deliberado en el modo de entrenamiento (`joint` a `video`). El modelo predice continuaciones de video y acciones de manipulación robótica a partir de un contexto de 6 slots latentes (equivalente a 21 frames de píxeles con stride 2, 576 tokens), generando 2 slots de predicción (192 tokens). Está entrenado en el dataset RoboCasa y forma parte del framework DiT4DiT, que combina transformers de generación de video con predicción de acciones basada en flow-matching.

La relevancia de este modelo radica en que investiga cómo la longitud del contexto latente afecta a la calidad de la representación y a la generación de video en tareas de manipulación robótica. Los resultados muestran que un contexto más largo mejora la calidad de las representaciones (medida mediante probing atento), pero no necesariamente la calidad de generación a un paso (FVD). El modelo está disponible en HuggingFace con pesos en formato safetensors, aunque la licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wan2.2-TI2V-5B (DiT4DiT, video-only continuation) |
| Parametros totales | 5B (estimado, basado en el backbone Wan2.2-TI2V-5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 6 slots latentes (576 tokens de condicion, 21 frames de píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de video, sin procesamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 125.6 GB) |

## Arquitectura y entrenamiento

El modelo se basa en el backbone Wan2.2-TI2V-5B, un transformer de difusión para video, integrado en el framework DiT4DiT. DiT4DiT es un Vision-Action-Model (VAM) que combina un transformer de generación de video con un transformer de predicción de acciones, ambos optimizados mediante un objetivo dual de flow-matching. En este caso, el modelo se entrena solo en modo `video` (no `joint`), lo que significa que la pérdida de flow-matching de acciones no llega al DiT de video en ninguno de los dos modos, según la model card.

El entrenamiento utiliza una ventana de contexto de 6 slots latentes (21 frames de píxeles con stride 2, 576 tokens) y predice 2 slots (192 tokens). El lote global es de 64 (4 GPUs × 8 por dispositivo × 2 gradientes acumulados), con una tasa de aprendizaje de 1e-4, decaimiento de peso 0.01, y un programador con `WAN_FM_TRAIN_SHIFT=5.0` y ponderación temporal tipo campana. Se aplica dropout de captions (0.1), aumento de imagen, padding de texto con ceros, y se guarda una copia EMA del modelo (825 tensores). Los checkpoints incluyen tanto los pesos vivos como la copia EMA, pero no el estado del optimizador.

## Capacidades

- Generación de video condicionada: predice continuaciones de video a partir de un contexto de frames latentes.
- Predicción de acciones de manipulación robótica: integrado en el framework DiT4DiT, que combina video y acciones para control de robots.
- Modelo de mundo (world-model): captura dinámicas espaciotemporales e implícitas de la física para tareas de robótica.
- Soporte para control de mesa y cuerpo completo: según la documentación de DiT4DiT, es el primer VAM eficiente en lograr control de cuerpo completo en tiempo real de robots humanoides.
- Representaciones ricas: el probing atento sobre características congeladas muestra una precisión de hasta 0.7162 en clasificación de 15 primitivas, lo que indica que el modelo aprende representaciones útiles para tareas de manipulación.
- No se documentan capacidades de texto, tool calling, agentes ni multilingüismo, ya que es un modelo puramente de video/acción.

## Casos de uso

- Control de robots manipuladores en entornos de cocina: el modelo puede predecir secuencias de video y acciones para tareas de RoboCasa, como recoger objetos o interactuar con electrodomésticos, lo que permite planificar movimientos en tiempo real.
- Aprendizaje por imitación: al generar continuaciones de video a partir de observaciones, puede servir como modelo de mundo para entrenar políticas de control sin necesidad de datos de acción etiquetados.
- Simulación de dinámicas físicas: su capacidad para modelar la evolución temporal de escenas robóticas permite usarlo como simulador neuronal para validar trayectorias antes de ejecutarlas en el robot real.
- Investigación en ablaciones de contexto: este modelo es útil para estudiar cómo la longitud del contexto latente afecta a la calidad de representación y generación, lo que puede guiar el diseño de futuros modelos de mundo.
- Generación de datos sintéticos: puede generar secuencias de video realistas de manipulación robótica que sirvan para aumentar datasets de entrenamiento de otros modelos.
- Evaluación de representaciones: las características congeladas del modelo pueden usarse como extractor de features para tareas de clasificación de primitivas robóticas, como demuestra el probing atento.

## Benchmarks y rendimiento

Se han publicado métricas de video (1-step, N=2048 ventanas de validación de RoboCasa, con pesos EMA) y de probing atento (clasificación de 15 primitivas sobre características congeladas). Los resultados para este modelo (6latin) son:

| Checkpoint | PSNR | SSIM | LPIPS | FVD |
|---|---|---|---|---|
| checkpoint-20000 | 20.882 | 0.7533 | 0.2424 | 138.89 |
| checkpoint-40000 | 21.204 | 0.7589 | 0.2300 | 126.88 |
| checkpoint-60000 | 21.473 | 0.7644 | 0.2155 | 115.13 |
| checkpoint-80000 | 21.705 | 0.7696 | 0.1996 | 99.53 |

Probing atento (mejor época, N=20,964 muestras de validación):

| Checkpoint | Mejor época | Precisión | Recall macro |
|---|---|---|---|
| checkpoint-20000 | e3 | 0.6806 | 0.5884 |
| checkpoint-40000 | e2 | 0.7023 | 0.6107 |
| checkpoint-60000 | e4 | 0.7162 | 0.6322 |
| checkpoint-80000 | e1 (en progreso) | 0.7137 | 0.6091 |

Comparación entre brazos a igual paso (FVD y precisión de probing):

| Paso | 2latin FVD | 3latin FVD | 4latin FVD | 6latin FVD | 8latin FVD | 2latin acc | 3latin acc | 4latin acc | 6latin acc | 8latin acc |
|---|---|---|---|---|---|---|---|---|---|---|
| 20k | — | 139.06 | 140.45 | 138.89 | 139.19 | — | 0.6722 | 0.6681 | 0.6806 | 0.6781 |
| 40k | — | 126.94 | 126.97 | 126.88 | 126.99 | — | 0.6886 | 0.6901 | 0.7023 | 0.7057 |
| 60k | — | 114.90 | 114.10 | 115.13 | 115.32 | — | 0.7084 | 0.7069 | 0.7162 | 0.7169 |
| 80k | — | 102.08 | 97.55 | 99.53 | 99.96 | — | 0.7152 | 0.7254 | 0.7137* | 0.7276 |
| 100k | — | 89.60 | 86.26 | — | 88.34 | — | 0.7237 | 0.7282 | — | 0.7318 |

Nota: el brazo 6latin no tiene métricas a 100k en la información proporcionada. El asterisco indica que el probing a 80k no ha terminado sus 5 épocas.

## Requisitos de hardware

- El tamaño del repositorio es de 125.6 GB, lo que sugiere que los pesos completos en precisión fp32 o bf16 requieren al menos 20-25 GB de VRAM solo para los parámetros (5B × 4 bytes ≈ 20 GB en fp32, o ~10 GB en bf16). Sin embargo, el repo incluye tanto pesos vivos como EMA, por lo que el tamaño real de un solo conjunto de pesos es menor.
- No se proporcionan requisitos oficiales de hardware. Dado que el entrenamiento usó 4 GPUs con lote global 64, se puede inferir que cada GPU manejaba 8 muestras por paso, lo que sugiere GPUs de alta gama (A100 80GB o H100).
- Para inferencia, se recomienda al menos una GPU con 24-40 GB de VRAM (por ejemplo, RTX 4090, A100, H100) dependiendo de la cuantización y la longitud de video generado.
- No se documentan opciones de despliegue específicas (vLLM, llama.cpp, etc.). Dado que es un modelo de difusión de video, probablemente se use con librerías de difusión como `diffusers` o el código de DiT4DiT.
- La latencia y el throughput no están disponibles en la información proporcionada.

## Comparativa con modelos similares

Este modelo pertenece a una familia de brazos de ablación que comparten la misma receta excepto la longitud de contexto. La comparación directa es con los otros brazos:

| Modelo | Contexto (slots latentes) | FVD a 80k | Precisión probing a 80k | Notas |
|---|---|---|---|---|
| `hwabl_3latin` | 3 | 102.08 | 0.7152 | Contexto corto |
| `hwabl_4latin` | 4 | 97.55 | 0.7254 | Mejor FVD a 80k |
| `hwabl_6latin` (este) | 6 | 99.53 | 0.7137* | Contexto medio |
| `hwabl_8latin` | 8 | 99.96 | 0.7276 | Mejor precisión a 80k |
| `hwhist5` (2latin base) | 2 | 94.48 (a 100k) | no disponible | Entrenado en modo `joint`, no comparable directamente |

Los resultados muestran que en FVD, el brazo de 4 latinos lidera a 80k y 100k, mientras que en probing, el de 8 latinos es el mejor. El modelo de 6 latinos se sitúa en un punto intermedio. No se dispone de comparación con otros modelos de mundo robótico fuera de esta familia.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- No se documentan sesgos conocidos, pero al estar entrenado en RoboCasa (entornos de cocina), puede tener limitaciones para generalizar a otros entornos o tareas.
- El modelo es solo de video/acción; no procesa texto ni instrucciones en lenguaje natural.
- La calidad de generación a un paso (FVD) no mejora monotónicamente con la longitud de contexto, lo que sugiere que un contexto más largo no siempre es beneficioso para la generación.
- Los checkpoints no incluyen el estado del optimizador, por lo que no son adecuados para continuar el entrenamiento directamente.
- El cambio de `training_mode` de `joint` a `video` significa que la pérdida de acciones no se propaga al DiT de video, lo que puede limitar la coherencia entre video y acciones.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es un experimento de investigación sin validación externa amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmkang/wam_wan22_dit4dit_robocasa300_hwabl_6latin
- Repositorio oficial de DiT4DiT: https://github.com/Mondo-Robotics/DiT4DiT
- Paper de DiT4DiT (arXiv): https://arxiv.org/abs/2603.10448
- Versión HTML del paper: https://arxiv.org/html/2603.10448v1
- Modelo hermano `hwabl_4latin`: https://huggingface.co/hmkang/wam_wan22_dit4dit_robocasa300_hwabl_4latin
- Modelo hermano `hwabl_3latin`: https://huggingface.co/hmkang/wam_wan22_dit4dit_robocasa300_hwabl_3latin
