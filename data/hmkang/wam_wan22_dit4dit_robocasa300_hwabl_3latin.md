# hmkang/wam_wan22_dit4dit_robocasa300_hwabl_3latin

## Resumen

El modelo `hmkang/wam_wan22_dit4dit_robocasa300_hwabl_3latin` es un world model de vídeo para manipulación robótica, desarrollado por hmkang como parte de una familia de experimentos de ablación sobre la longitud del contexto latente. Se basa en el backbone Wan2.2-TI2V-5B (un transformador de difusión para vídeo) integrado en el framework DiT4DiT, que combina generación de vídeo con predicción de acciones mediante doble flow-matching. Este modelo concreto usa un contexto de 3 slots latentes (equivalente a 9 frames de píxeles con stride 2, 288 tokens) y predice 2 slots (192 tokens), con una ventana de 17 frames de entrada y 33 de salida.

El problema que resuelve es el modelado conjunto de dinámicas visuales y acciones para control robótico generalizable, tanto en tareas de mesa como de cuerpo completo. Su relevancia radica en que permite estudiar cuánto influye la longitud del contexto limpio en la calidad de la predicción de vídeo y acción, comparando directamente con variantes de 4 y 5 latentes. Aunque los resultados a 20k pasos aún están dentro del ruido estadístico, el modelo ofrece una base reproducible para investigar la escalabilidad del contexto en world models robóticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wan2.2-TI2V-5B con framework DiT4DiT (doble flow-matching para vídeo y acciones) |
| Parametros totales | no disponible (backbone Wan2.2-TI2V-5B, ~5B; el modelo completo puede incluir módulos adicionales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3 slots latentes (9 frames de píxeles con stride 2, 288 tokens de entrada); predice 2 slots (192 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo, no textual) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea el backbone Wan2.2-TI2V-5B, un transformador de difusión para vídeo condicionado por texto e imágenes, integrado en el marco DiT4DiT. DiT4DiT define un Vision-Action-Model (VAM) que entrena conjuntamente un DiT de vídeo y un DiT de acciones mediante dos objetivos de flow-matching. En esta variante, el `training_mode` se fijó en `video` (en lugar de `joint`), ya que la pérdida de flow-matching de acciones nunca alcanza al DiT de vídeo en ninguno de los dos modos. El contexto se limita a 3 slots latentes (288 tokens) y se predice 2 slots (192 tokens). El entrenamiento usó un batch global de 64 (8 GPUs × 8 por dispositivo), schedule con `WAN_FM_TRAIN_SHIFT=5.0`, ponderación temporal tipo campana, weight decay 0.01, ratio mínimo de learning rate 0.01, caption dropout 0.1, aumento de imagen, zero text pad y EMA de vídeo guardada. Cada checkpoint incluye tanto los pesos vivos como la copia EMA (825 tensores). No se incluye el estado del optimizador; son checkpoints de inferencia/evaluación.

## Capacidades

- Generación de vídeo condicionada a observaciones: predice frames futuros a partir de un contexto latente de 3 slots (9 frames) y genera 33 frames de salida.
- Predicción de acciones: aunque el `training_mode` es `video`, el framework DiT4DiT está diseñado para modelar acciones junto con vídeo; en esta variante la pérdida de acciones no llega al DiT de vídeo, por lo que la capacidad de acción puede estar limitada.
- Modelado de dinámicas visuales para manipulación robótica: soporta tareas de mesa y control de cuerpo completo según el framework DiT4DiT.
- Reproducibilidad experimental: permite comparar el efecto de la longitud del contexto latente en la calidad de la predicción (PSNR, SSIM, LPIPS, FVD).
- No se documentan capacidades de tool calling, agentes, razonamiento multilingüe ni otras tareas de lenguaje.

## Casos de uso

- Investigación en world models para robótica: el modelo sirve como punto de referencia para estudiar cómo la longitud del contexto latente afecta a la predicción de vídeo, útil para diseñar arquitecturas de memoria visual más eficientes.
- Simulación de dinámicas de manipulación: puede generar secuencias de vídeo de futuros estados de una escena robótica, lo que permite planificar movimientos sin ejecución física.
- Entrenamiento de políticas con imaginación: al predecir vídeo futuro, puede usarse como módulo de "imaginación" en algoritmos de aprendizaje por refuerzo basados en modelos (MBRL).
- Evaluación de calidad de generación de vídeo: sus métricas (PSNR, SSIM, LPIPS, FVD) permiten comparar la fidelidad de la predicción frente a otras variantes de contexto.
- Ablación de arquitectura: los checkpoints permiten a otros investigadores analizar la contribución específica del número de slots latentes en el rendimiento final.
- Integración en pipelines de control predictivo: aunque la predicción de acciones no está activa en esta variante, el modelo puede combinarse con otros módulos del framework DiT4DiT para control whole-body.

## Benchmarks y rendimiento

Se han medido métricas de calidad de vídeo a 1 paso sobre 2048 ventanas de validación de robocasa, usando los pesos EMA. Los resultados del checkpoint 20000 son:

| Checkpoint | PSNR | SSIM | LPIPS | FVD |
|---|---|---|---|---|
| `checkpoint-20000` | 20.822 | 0.7488 | 0.2459 | 139.06 |
| `checkpoint-40000` | no medido aún | | | |

Para comparación, el run base de 2 slots latentes (mismo protocolo) obtuvo:

| Checkpoint | PSNR | SSIM | LPIPS | FVD |
|---|---|---|---|---|
| 20k | 20.772 | 0.7461 | 0.2458 | 142.56 |
| 100k | 21.513 | 0.7628 | 0.1968 | 94.48 |

Según el autor, a 20k pasos las tres longitudes de contexto (3, 4 y 5 latentes) están dentro del ruido estadístico, y la mejora de 20k a 100k en el run base es mayor que cualquier diferencia entre ellas, por lo que 20k es demasiado pronto para clasificarlas.

## Requisitos de hardware

- Tamaño del repositorio: 62.8 GB (pesos safetensors), lo que sugiere que la inferencia requiere una GPU con al menos 24 GB de VRAM para cargar el modelo en fp16 (el backbone de 5B ocupa ~10 GB en fp16, pero el modelo completo con módulos adicionales puede superar eso).
- No se proporcionan datos oficiales de VRAM, latencia o throughput.
- GPU recomendadas: se asume que el entrenamiento se realizó en 8 GPUs de alta gama (posiblemente A100 o H100); para inferencia, una RTX 4090 (24 GB) podría ser suficiente si se usa cuantización, aunque no se han publicado versiones cuantizadas.
- Opciones de despliegue: al ser un modelo de transformers con safetensors, puede cargarse con la librería `transformers`; el framework DiT4DiT tiene soporte en su repositorio oficial. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Dado que es un modelo de investigación sin optimizaciones de despliegue, se recomienda usar el código del repositorio DiT4DiT para evaluación.

## Comparativa con modelos similares

| Modelo | Contexto | Frames in/out | PSNR (20k) | SSIM (20k) | LPIPS (20k) | FVD (20k) | Licencia |
|---|---|---|---|---|---|---|---|
| `hwabl_3latin` (este) | 3 latentes (288 tokens) | 17/33 | 20.822 | 0.7488 | 0.2459 | 139.06 | no disponible |
| `hwabl_4latin` (variante) | 4 latentes (384 tokens) | 25/41 | no medido aún | | | | no disponible |
| `hwabl_5latin` (variante) | 5 latentes (480 tokens) | 33/49 | no medido aún | | | | no disponible |
| `huiwon/wam_wan22_dit4dit_robocasa300_b64_4knobA_hist5` (base) | 2 latentes | - | 20.772 | 0.7461 | 0.2458 | 142.56 | no disponible |

La comparativa muestra que a 20k pasos las diferencias entre contextos son mínimas; el run base mejora significativamente a 100k (PSNR 21.513, FVD 94.48), lo que sugiere que se necesitan más pasos para observar el efecto del contexto.

## Limitaciones y advertencias

- Los resultados a 20k pasos no permiten concluir diferencias entre longitudes de contexto; se requieren checkpoints más avanzados (100k) para una evaluación fiable.
- El `training_mode` es `video`, no `joint`, por lo que la predicción de acciones no está activa en esta variante; el modelo no puede usarse directamente para control basado en acciones.
- No se incluye el estado del optimizador, por lo que no es posible continuar el entrenamiento desde estos checkpoints.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o distribución.
- No se documentan sesgos específicos, pero al entrenarse en el dataset robocasa, el modelo puede tener limitaciones de generalización a entornos fuera de ese dominio.
- El contexto de 3 latentes (9 frames) es muy corto, lo que limita la capacidad de modelar dependencias temporales largas.
- No se proporcionan datos sobre idiomas ni capacidades multimodales más allá del vídeo; no es un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmkang/wam_wan22_dit4dit_robocasa300_hwabl_3latin
- Repositorio oficial DiT4DiT (GitHub): https://github.com/Mondo-Robotics/DiT4DiT
- Paper DiT4DiT (arXiv): https://arxiv.org/html/2603.10448v1
- Sitio de Wan AI (backbone): https://wan.video/
- Modelo base de referencia: https://huggingface.co/huiwon/wam_wan22_align_robocasa300_tf_s4
