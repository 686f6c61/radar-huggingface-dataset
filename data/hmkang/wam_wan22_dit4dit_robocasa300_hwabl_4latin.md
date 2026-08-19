# hmkang/wam_wan22_dit4dit_robocasa300_hwabl_4latin

## Resumen

El modelo `hmkang/wam_wan22_dit4dit_robocasa300_hwabl_4latin` es un checkpoint de investigación centrado en la predicción de vídeo para robótica, desarrollado por hmkang como parte de una ablación sobre la longitud de contexto en modelos de mundo. Se basa en el backbone Wan2.2-TI2V-5B, un modelo de difusión de vídeo, y sigue el marco DiT4DiT, que combina transformadores de generación de vídeo con flow-matching para acciones robóticas. Este modelo concreto utiliza una ventana de contexto de 4 slots latentes (384 tokens) y predice 2 slots (192 tokens), lo que corresponde a 25 frames de entrada y 41 de salida. Su propósito es evaluar cómo la cantidad de contexto limpio afecta a la calidad de la predicción de vídeo en entornos de manipulación robótica (RoboCasa). Es un modelo de vídeo puro, sin rama de acciones, y se enmarca en una serie de brazos experimentales que varían la longitud del contexto (3, 4 y 5 latentes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wan2.2-TI2V-5B (DiT) con adaptación DiT4DiT |
| Parametros totales | no disponible (backbone de 5B según nomenclatura) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4 slots latentes (384 tokens) de entrada, 2 slots (192 tokens) de salida |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo, sin procesamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en el backbone Wan2.2-TI2V-5B, un transformador de difusión para vídeo, y sigue el enfoque DiT4DiT, que integra un objetivo de flow-matching para vídeo y acciones. En esta variante concreta, el entrenamiento se realiza en modo `video` (sin rama de acciones), con una ventana de contexto de 4 slots latentes (13 frames de píxeles con stride 2) y predicción de 2 slots (192 tokens). El entrenamiento utiliza un batch global de 64 (8 GPUs × 8 por dispositivo), schedule con `WAN_FM_TRAIN_SHIFT=5.0`, ponderación temporal tipo campana, weight decay 0.01 y ratio de learning rate mínimo 0.01. Se aplica caption dropout 0.1, aumento de imagen, zero text pad y se guarda una copia EMA de los pesos (825 tensores). El checkpoint evaluado corresponde a 20.000 pasos de entrenamiento, y no incluye el estado del optimizador (solo pesos de inferencia/evaluación).

## Capacidades

- Generación de vídeo condicionada a frames previos: predice los siguientes 41 frames (2 slots latentes) a partir de 25 frames de contexto (4 slots).
- Modelado de mundo para robótica: entrenado en el dataset RoboCasa, puede capturar la dinámica de escenas de manipulación robótica.
- Soporte de EMA: cada checkpoint incluye tanto los pesos vivos como la copia EMA, que se utiliza para las métricas reportadas.
- Sin soporte de tool calling ni agentes: es un modelo puramente generativo de vídeo, sin capacidades de razonamiento simbólico o interacción con herramientas.
- Multilingüismo: no aplica, al ser un modelo de vídeo sin entrada de texto explícita (aunque el backbone Wan2.2 puede soportar texto, esta variante no lo usa).

## Casos de uso

- Investigación en world models: permite estudiar cómo la longitud del contexto latente afecta a la calidad de la predicción de vídeo en entornos robóticos, sirviendo como referencia para diseñar arquitecturas más eficientes.
- Generación de datos sintéticos para entrenamiento de políticas: al predecir secuencias de vídeo futuras, puede generar trayectorias visuales sintéticas que complementen datasets reales de manipulación robótica.
- Evaluación de arquitecturas de difusión para vídeo: útil para comparar el rendimiento de diferentes configuraciones de contexto y entrenamiento (como los brazos hermanos de 3 y 5 latentes) bajo el mismo protocolo.
- Simulación de escenarios de manipulación: puede predecir la evolución de una escena robótica a partir de observaciones parciales, lo que es útil para planificación basada en modelos.
- Benchmarking de modelos de vídeo: sus métricas (PSNR, SSIM, LPIPS, FVD) proporcionan un punto de comparación estandarizado para otros modelos de world model.
- Ablación de hiperparámetros: al ser parte de una serie de ablaciones, permite aislar el efecto de la longitud de contexto en el rendimiento, guiando futuras elecciones de diseño.

## Benchmarks y rendimiento

El autor reporta métricas sobre 2048 ventanas de validación de RoboCasa, con evaluación de 1 paso y usando los pesos EMA. Los resultados del checkpoint-20000 son:

| Checkpoint | PSNR | SSIM | LPIPS | FVD |
|---|---|---|---|---|
| `checkpoint-20000` (4 latentes) | 20.84 | 0.7507 | 0.2449 | 140.45 |

Como referencia, el run base de 2 latentes (misma receta pero con contexto de 2 slots) obtiene a 20k pasos: PSNR 20.772, SSIM 0.7461, LPIPS 0.2458, FVD 142.56; y a 100k pasos: PSNR 21.513, SSIM 0.7628, LPIPS 0.1968, FVD 94.48. El autor indica que a 20k pasos las diferencias entre longitudes de contexto están dentro del ruido, y que la mejora de 20k a 100k en el run base es mucho mayor que cualquier brecha entre contextos, por lo que 20k es demasiado temprano para clasificarlos.

## Requisitos de hardware

- Tamaño del repositorio: 31.4 GB (pesos en safetensors).
- VRAM estimada para inferencia: no disponible, pero dado el backbone de 5B y la naturaleza de difusión, se requiere al menos 16-20 GB en FP16 para cargar el modelo completo; con cuantización podría reducirse.
- GPUs recomendadas: no disponible; probablemente necesite GPUs con 24 GB o más (RTX 3090/4090, A100) para inferencia cómoda.
- Opciones de despliegue: al ser un modelo de transformers, puede usarse con librerías estándar de difusión, pero no se mencionan herramientas específicas como vLLM o llama.cpp. Dado que es un modelo de vídeo, la inferencia es computacionalmente intensiva.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El modelo se puede comparar con sus brazos hermanos de la misma ablación, que comparten todos los ajustes excepto la longitud de contexto:

| Modelo | Contexto (slots latentes) | `num_frames_in`/`out` | Cond tokens |
|---|---|---|---|
| `hwabl_3latin` | 3 | 17 / 33 | 288 |
| `hwabl_4latin` (este) | 4 | 25 / 41 | 384 |
| `hwabl_5latin` | 5 | 33 / 49 | 480 |

También se puede comparar con el run base de 2 latentes (`huiwon/wam_wan22_dit4dit_robocasa300_b64_4knobA_hist5`), que usa `training_mode: joint` en lugar de `video`, y con el que comparte la receta excepto ese cambio. No se dispone de métricas para los brazos de 3 y 5 latentes en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de solo 20.000 pasos de entrenamiento, y el autor indica que es demasiado temprano para extraer conclusiones sobre la longitud de contexto óptima.
- No incluye el estado del optimizador, por lo que no es adecuado para continuar el entrenamiento directamente.
- La licencia no está especificada, lo que impide su uso comercial sin consultar al autor.
- Es un modelo de vídeo puro, sin capacidades de acción ni razonamiento simbólico; no debe usarse para tareas que requieran interacción con herramientas o planificación de alto nivel.
- Los idiomas no están definidos; al ser un modelo de vídeo, no procesa texto, aunque el backbone Wan2.2 podría soportarlo en otras variantes.
- No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje.
- El entrenamiento se realizó en RoboCasa, por lo que su generalización a otros entornos robóticos no está verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmkang/wam_wan22_dit4dit_robocasa300_hwabl_4latin
- Repositorio oficial de DiT4DiT: https://github.com/Mondo-Robotics/DiT4DiT
- Paper de DiT4DiT: https://arxiv.org/html/2603.10448v1
- Página de Wan 2.2: https://wan22.ai/home
- Página de Wan AI: https://wan.video/
