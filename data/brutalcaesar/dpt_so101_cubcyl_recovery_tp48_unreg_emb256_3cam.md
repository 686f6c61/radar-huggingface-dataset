# BrutalCaesar/dpt_so101_cubcyl_recovery_tp48_unreg_emb256_3cam

## Resumen

Este modelo es una implementación de **Diffusion Policy con backbone transformer** (según el trabajo de Chi et al., sección 3.1 / tabla 8) portada a la librería `lerobot` 0.6.0, que de serie solo incluye el backbone conv-UNet. Ha sido desarrollado por BrutalCaesar y está diseñado para controlar un brazo robótico SO-101 en tareas de *pick-and-place* de cubos y cilindros, utilizando tres cámaras como entrada visual. El checkpoint subido corresponde al paso 8.000, que es el punto de mínimo `eval_loss` de este entrenamiento concreto.

El modelo pertenece a la rama **"unregularised"** de un experimento A/B pre-registrado: se entrena sin *weight decay* ni *attention dropout* (valores 1e-6 y 0.0 respectivamente) frente a la receta original del paper (1e-3 y 0.3). El objetivo es comprobar si la configuración del artículo se ajusta correctamente a un dataset pequeño de 120 episodios. El modelo tiene 42,6 millones de parámetros totales (incluyendo los encoders visuales) y opera con un horizonte de planificación de 48 pasos de observación y 24 pasos de acción.

La relevancia de este modelo reside en que explora una variante de Diffusion Policy para robótica con una arquitectura transformer, algo poco común en `lerobot`, y documenta de forma transparente las limitaciones de la evaluación. No se ha desplegado físicamente en el brazo, por lo que no existen métricas de éxito de tarea reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy con backbone transformer (`TransformerForDiffusion`), encoder 3x ResNet-18 + SpatialSoftmax (32 keypoints), conditioning por cross-attention con 3 memory tokens |
| Parametros totales | 42.615.024 (según safetensors); backbone: 9.020.934 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | horizonte de 48 pasos, n_obs_steps=2, n_action_steps=24 (no es contexto de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el esquema de **Diffusion Policy** propuesto por Chi et al. El denoiser es un transformer (`TransformerForDiffusion`) con 8 capas, 4 cabezas de atención y dimensión de embedding 256. La condición se inyecta mediante 3 *memory tokens* (el paso de difusión k, la observación en t-1 y la observación en t) a través de *cross-attention*. El scheduler es DDIM con 100 pasos de entrenamiento y 16 pasos de inferencia. La entrada visual se procesa con tres ResNet-18 (uno por cámara) seguidos de SpatialSoftmax con 32 keypoints, sobre imágenes recortadas a 216x288. La normalización de acciones es MIN_MAX, con varianza medida de 0.313 (no 1.0 como asume el paper).

El entrenamiento se realizó sobre un dataset de **120 episodios** de demostraciones de un único operador, con una sola mesa y una condición de iluminación. Se usaron 30.000 pasos, batch size 64, semilla 1000, *cosine schedule* y una GPU H200. Los hiperparámetros de la rama *unregularised* son `weight_decay 1e-6` y `attn_dropout 0.0`. La evolución del `eval_loss` muestra un mínimo en el paso 8.000 (0.0287) y posteriormente aumenta de forma monótona, lo que indica sobreajuste temprano. La rama regularizada alcanzó solo 0.0492 en el paso 50.000, lo que sugiere que la receta de la tabla 8 del paper *subajusta* este dataset pequeño.

## Capacidades

- **Control robótico de pick-and-place**: el modelo genera secuencias de acciones (24 pasos) para que el brazo SO-101 manipule cubos y cilindros sobre una mesa.
- **Percepción visual multicámara**: integra tres cámaras simultáneas mediante encoders ResNet-18, lo que permite cierta redundancia y robustez en la observación del entorno.
- **Aprendizaje por imitación**: entrena a partir de demostraciones humanas, sin necesidad de recompensas explícitas ni modelos de entorno.
- **Generación de acciones con difusión**: utiliza un proceso de denoising para muestrear trayectorias de acción, lo que permite cierta multimodalidad en la salida.
- **Inferencia con pocos pasos**: el scheduler DDIM permite reducir a 16 pasos de inferencia, acelerando la generación de acciones en tiempo real.
- **Integración con `lerobot`**: el checkpoint es compatible con la API de `lerobot` (a través del registro de política `diffusion_transformer`), lo que facilita su uso en pipelines existentes.

## Casos de uso

- **Automatización de tareas repetitivas en líneas de montaje**: el modelo puede controlar un brazo SO-101 para clasificar o recolocar piezas (cubos, cilindros) en posiciones definidas, reduciendo la intervención humana en entornos de producción controlados.
- **Investigación en imitación learning**: sirve como punto de partida para estudiar el efecto de la regularización en Diffusion Policies con datasets pequeños, ya que documenta un A/B completo con métricas de pérdida y análisis por buckets de timestep.
- **Prototipado rápido de manipuladores en entornos de laboratorio**: al estar entrenado con un dataset reducido, permite validar hipótesis sobre arquitecturas de control antes de escalar a datos más grandes.
- **Benchmark de métodos de selección de checkpoints**: el autor señala que `eval_loss` no está validado como métrica de selección; este modelo puede usarse para experimentos sobre criterios de *model selection* en robótica.
- **Entrenamiento de políticas con múltiples cámaras**: el diseño con tres encoders independientes puede adaptarse a otros brazos o configuraciones de sensores, sirviendo como referencia de implementación.
- **Estudio de sobreajuste en políticas de difusión**: la curva de `eval_loss` que sube tras el paso 8k es un caso documentado de *overfitting* temprano, útil para investigar técnicas de regularización específicas para este tipo de modelos.

## Benchmarks y rendimiento

La model card no proporciona benchmarks estándar (tipo MMLU, HumanEval, etc.), ya que se trata de un modelo de robótica. En su lugar, el autor reporta dos métricas de validación sobre el conjunto de retención:

**Evolución de `eval_loss` durante el entrenamiento:**

| Paso | 2k | 4k | 8k | 12k | 16k | 24k | 30k |
|---|---|---|---|---|---|---|---|
| eval_loss | 0.0393 | 0.0311 | **0.0287** | 0.0288 | 0.0295 | 0.0310 | 0.0323 |

**Varianza explicada (1 - MSE) por timestep de difusión k, comparada con la rama regularizada (ambos en paso 30k):**

| k | 0 | 2 | 5 | 20 | 50 | 90 | 99 |
|---|---|---|---|---|---|---|---|
| Este modelo | 0.657 | 0.781 | 0.853 | 0.950 | 0.988 | 0.999 | 0.9998 |
| Rama regularizada | 0.566 | 0.673 | 0.817 | 0.930 | 0.970 | 0.997 | 0.9975 |

El modelo *unregularised* gana en los 15 buckets evaluados, con una ventaja media de +0.078 en los timesteps bajos (k ≤ 5) frente a +0.002 en los altos (k ≥ 90), lo que indica que mejora especialmente el detalle fino de las acciones. No obstante, **no existen métricas de éxito de tarea en el brazo real** porque el checkpoint no se ha desplegado físicamente.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 42,6 millones de parámetros y tres encoders ResNet-18, el modelo en FP32 ocuparía aproximadamente 170 MB solo en pesos, pero la activación de los encoders y el transformer durante la inferencia puede requerir entre 1 y 2 GB de VRAM en función del batch y la resolución de entrada.
- **GPU recomendadas**: el entrenamiento se realizó en una H200. Para inferencia en tiempo real (16 pasos de difusión) se recomienda al menos una GPU con 8 GB de VRAM, como una RTX 3070 o superior. Una RTX 4090 o una A100 ofrecerían margen para procesar varias observaciones simultáneas.
- **Compatibilidad con GPUs de consumo**: sí, un modelo de este tamaño cabe holgadamente en cualquier GPU consumer moderna (RTX 30xx/40xx) con suficiente VRAM para el pipeline completo.
- **Opciones de despliegue**: el modelo se integra en `lerobot` mediante la política `diffusion_transformer` (requiere el código auxiliar del repositorio `phi`). No está diseñado para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Se puede ejecutar con el framework de `lerobot` en Python.
- **Latencia y throughput**: no se han publicado mediciones. Con 16 pasos de inferencia DDIM y un transformer de 8 capas, se espera una latencia del orden de decenas de milisegundos por predicción en una GPU moderna, aunque depende de la resolución de imagen y del hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con otras implementaciones de Diffusion Policy para robótica fuera del propio experimento del autor. Dentro del mismo repositorio, la comparación más relevante es con la **rama regularizada** (misma arquitectura, pero con `weight_decay 1e-3` y `attn_dropout 0.3`):

| Modelo | eval_loss @30k | Varianza explicada (k≤5) | Despliegue físico |
|---|---|---|---|
| Este modelo (unreg, 8k) | 0.0287 (mínimo) | +0.078 sobre regularizado | No |
| Rama regularizada (50k) | 0.0492 | inferior en todos los buckets | No |

También existen otros checkpoints del mismo autor para tareas similares (por ejemplo, `act_so101_cubcyl_recovery_chunk50_aug_3cam`), pero no se dispone de sus especificaciones técnicas para una comparación cuantitativa.

## Limitaciones y advertencias

- **No desplegado en el brazo**: el autor indica explícitamente que el checkpoint no se ha probado físicamente, por lo que no hay ninguna métrica de éxito de tarea real.
- **`eval_loss` no validado como criterio de selección**: no hay evidencia de que minimizar esta pérdida se correlacione con el rendimiento en el robot. El autor lo señala como una limitación metodológica.
- **Sobreajuste temprano**: la pérdida sube de forma monótona tras el paso 8k, lo que indica que el modelo memoriza el dataset de entrenamiento y generaliza mal a partir de ese punto.
- **Dataset muy reducido y poco variado**: 120 episodios de un único operador, una sola mesa y una condición de iluminación. No se espera robustez ante cambios de entorno, objetos nuevos o variaciones en las demostraciones.
- **Dependencia de código externo**: la política `diffusion_transformer` no está incluida en `lerobot` upstream; requiere el repositorio `phi` en `PYTHONPATH`, lo que puede complicar la reproducibilidad.
- **Riesgo de alucinación**: al ser un modelo de difusión, puede generar acciones inconsistentes si la observación está fuera de la distribución de entrenamiento, aunque no se ha cuantificado este comportamiento.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el código auxiliar del repositorio `phi` tiene su propia licencia (MIT según la model card), por lo que hay que revisar ambos términos.

## Enlaces

- [HuggingFace: BrutalCaesar/dpt_so101_cubcyl_recovery_tp48_unreg_emb256_3cam](https://huggingface.co/BrutalCaesar/dpt_so101_cubcyl_recovery_tp48_unreg_emb256_3cam)
- [Repositorio `phi` (código auxiliar para la política `diffusion_transformer`)](https://github.com/physical-hardware-intelligence/phi)
- [Repositorio original de Diffusion Policy (real-stanford/diffusion_policy)](https://github.com/real-stanford/diffusion_policy)
