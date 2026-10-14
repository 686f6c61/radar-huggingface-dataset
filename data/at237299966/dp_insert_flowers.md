# at237299966/dp_insert_flowers

## Resumen

`at237299966/dp_insert_flowers` es un conjunto de checkpoints de un *policy* de imitación para robótica, entrenado con la receta original de Diffusion Policy (Chi et al., 2023) sobre el brazo derecho del robot Galaxea R1 Lite. El modelo resuelve una única tarea de manipulación: insertar una flor. La política es un UNet 1-D condicional que predice el ruido de una ventana de acciones de 16 pasos bajo un esquema DDPM, condicionado por 8 fotogramas de dos cámaras y por la propiocepción del brazo.

El autor lo publica como *baseline* de comparación dentro de una serie de tres métodos entrenados con exactamente los mismos datos, codificador, batch, learning rate y schedule: esta versión DDPM, una política ODE (`at237299966/ODE_policy_insert_flowers`) y un *baseline* de *flow matching* (`at237299966/fm_dit_insert_flowers`). Ese diseño controlado es lo que da valor al repositorio: permite aislar el efecto del paradigma generativo (difusión vs. ODE vs. flow matching) manteniendo constante todo lo demás.

El interés práctico es limitado fuera del ámbito de investigación en aprendizaje por imitación. No es un modelo de lenguaje ni un modelo multimodal general: no procesa texto, no soporta *tool calling* y no tiene capacidades multilingües. Su relevancia es la de un artefacto reproducible para estudiar difusión aplicada a control robótico, con un *caveat* de latencia explícitamente documentado por el autor que impide su uso en tiempo real tal cual se publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConditionalUnet1D (UNet 1-D condicional) + DDPM; codificadores ResNet18 (GroupNorm, random crop) por cámara + propiocepción, condicionamiento global por FiLM |
| Parametros totales | 24,80 M en el UNet 1-D + 22,35 M en el codificador (≈47,15 M en total) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8 fotogramas de observación; predice 16 pasos de acción y se ejecutan las filas 7..14 (paso actual + 7 siguientes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica / no disponible (modelo de control robótico, no textual) |
| Licencia | MIT |
| Formato de pesos | `.ckpt` de PyTorch (`torch.save` con `pickle_module=dill`), 755 MB por checkpoint; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La política sigue la receta canónica de Diffusion Policy: cada cámara pasa por un ResNet18 con GroupNorm y *random crop*, se concatena con la propiocepción del brazo y se agrega en un vector de condición global aplicado mediante FiLM al UNet 1-D. El UNet usa `down_dims=[48, 96, 192]` con kernel 5. El objetivo es DDPM con 100 pasos de entrenamiento, schedule de coseno al cuadrado, predicción de épsilon y *sample clipping*; en inferencia se usan 100 pasos de *denoising*. La optimización emplea AdamW con lr 1.5e-4, schedule coseno durante 300 épocas y *warm-up* de 500 pasos, con EMA.

Los datos provienen del dataset `at237299966/r1lite_insert_flower_single` (formato LeRobot v2.1): 95 episodios, 23.034 fotogramas a 15 Hz, una sola tarea. Las entradas son `head_rgb` (720×1280) y `right_wrist_rgb` (360×640), ambas rellenadas a cuadrado y redimensionadas a 256×256, más `agent_pos` (6 articulaciones del brazo derecho en radianes + apertura del gripper en mm). La salida son objetivos articulares absolutos (6, rad) más el comando del gripper (1 mm; 1 = cerrado, 100 = abierto).

El entrenamiento se hizo en 2 × A100-40GB con DDP, batch de 48 por GPU (96 global), 236 pasos por época y 70.800 pasos totales, con un coste de 9 h 12 min (110 s por época). La pérdida de validación (un episodio reservado, pesos sin EMA) alcanza su mínimo en la época 40 (0,0185) y sube después, por lo que el autor recomienda comparar checkpoints tempranos y tardíos directamente sobre el robot. La pérdida de entrenamiento evoluciona de 0,82 (época 0) a 0,0012 (época 300); la de validación, de 0,54 a 0,068 en la época 295.

## Capacidades

- Generación de secuencias de acción para control robótico: predice 16 pasos de acción (posiciones articulares absolutas + comando de gripper) a partir de 8 fotogramas de observación.
- Política visomotora de una sola tarea: inserción de una flor con el brazo derecho del R1 Lite.
- Fusión de dos cámaras (`head_rgb`, `right_wrist_rgb`) y propiocepción en un único vector de condición.
- Control en bucle cerrado a 15 Hz mediante el cliente `openpi-r1lite`, que ejecuta la fila 0 de cada respuesta `(8, 14)`.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso simbólico ni uso como agente.
- No tiene capacidades multilingües ni de generación de texto.
- No tiene visión general: los codificadores visuales están entrenados específicamente para esta tarea y estas cámaras.
- No dispone de *thinking mode*, audio ni salidas multimodales.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como *baseline* DDPM reproducible para comparar contra políticas ODE y de *flow matching* entrenadas con idénticos datos e hiperparámetros, aislando el efecto del paradigma generativo.
- Estudio de la brecha entre pérdida de validación y éxito real: el repositorio documenta que la val loss mínima está en la época 40 y luego empeora, un caso útil para analizar por qué una métrica de entrenamiento no predice el rendimiento en robot.
- Replicación de Diffusion Policy sobre hardware Galaxea R1 Lite: los checkpoints y la configuración Hydra resuelta permiten reproducir el *pipeline* completo de entrenamiento e inferencia en un brazo real.
- Punto de partida para *fine-tuning* en tareas de inserción similares: al ser pesos completos con estado de optimizador y EMA, se pueden reanudar o adaptar a otras tareas de ensamblaje con geometría parecida.
- Banco de pruebas de *samplers* acelerados: el propio autor señala que sustituir el sampler de 100 pasos por DDIM con 10–16 pasos sobre los mismos pesos es el camino para alcanzar tiempo real, lo que lo convierte en un caso de estudio de destilación y aceleración de difusión.
- Evaluación de protocolos de despliegue cliente-servidor: el *wire protocol* de `serve_policy` con `replan_every 8` sirve para medir latencia, *jitter* y comportamiento en bucle cerrado con un *tick* de 66,7 ms.
- Docencia y divulgación: ejemplo compacto (≈47 M parámetros) de difusión condicionada aplicada a control, con logs completos y sumas de verificación publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, y no aplican a este tipo de modelo. El autor tampoco declara tasa de éxito en robot. Los únicos datos numéricos publicados son las pérdidas de entrenamiento y validación:

| Epoca | 0 | 10 | 50 | 100 | 150 | 200 | 250 | 300 |
|---|---|---|---|---|---|---|---|---|
| Train loss | 0,82 | 0,034 | 0,013 | 0,0071 | 0,0048 | 0,0026 | 0,0015 | 0,0012 |
| Val loss | 0,54 | 0,037 | 0,022 | 0,029 | 0,046 | 0,046 | 0,118 | 0,068 (ep. 295) |

La pérdida de validación más baja se registra en la época 40 (0,0185). El autor advierte explícitamente que los valores de pérdida no son comparables entre métodos.

## Requisitos de hardware

- Entrenamiento documentado: 2 × A100-40GB con DDP, batch global de 96, 9 h 12 min para 300 épocas.
- Inferencia de referencia: A100, con ~667 ms por predicción usando el sampler DDPM de 100 pasos.
- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia aritmética, los ≈47,15 M parámetros ocupan ≈189 MB en fp32 y ≈94 MB en fp16, a lo que hay que sumar activaciones de los dos ResNet18 sobre 8 fotogramas a 256×256 y el estado de inferencia.
- GPU recomendadas: A100 (configuración validada por el autor). No se documenta soporte ni rendimiento en H100, RTX 4090 u otras.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de pesos es pequeño, pero no hay datos publicados de ejecución en GPUs consumer.
- Opciones de despliegue: `python -m roboverse_learn.il.deploy.serve_policy --checkpoint checkpoints/100.ckpt --host 0.0.0.0 --port 8000 --device cuda:0 --replan_every 8`, sobre el repositorio `ODE_Policy`. Requiere el código `roboverse_learn.il.policies.dp.ddpm_unet_image_policy.DiffusionUnetImagePolicy` y `torch.load(..., pickle_module=dill, weights_only=False)`.
- No hay soporte para vLLM, llama.cpp, Ollama ni TGI: son *runtimes* de modelos de lenguaje y no aplican a este *policy*.
- Latencia: ~667 ms por predicción en A100 con 100 pasos de *denoising*, diez veces el *tick* de 66,7 ms del bucle a 15 Hz. El autor indica que el robot se detendría en cada *re-planning* y que el uso en tiempo real exige un sampler más rápido (DDIM con ~10–16 pasos), no disponible en el servidor actual.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `at237299966/dp_insert_flowers` | Insertar flor (R1 Lite, brazo derecho) | UNet 1-D + DDPM | ≈47,15 M (24,80 M UNet + 22,35 M encoder) | 8 fotogramas obs. / 16 pasos acción | MIT | Checkpoints públicos |
| `at237299966/ODE_policy_insert_flowers` | Idéntica | Política ODE | no disponible | no disponible | no disponible | Público |
| `at237299966/fm_dit_insert_flowers` | Idéntica | Flow matching con DiT | no disponible | no disponible | no disponible | Público |
| `ZUO66/imagewam-r1lite-insert-flower` | Idéntica | MoT visual/acción + encoder de propiocepción (fine-tune completo) | no disponible | no disponible | no disponible | Público |

Los tres primeros comparten dataset, codificador, batch, learning rate y schedule, según declara el autor, lo que los hace directamente comparables en cuanto a metodología, aunque no se publican tasas de éxito para ninguno. La release de ZUO66 tampoco declara tasa de éxito ni PSNR, y el autor indica que no es un adaptador LoRA sino un *fine-tune* completo.

## Limitaciones y advertencias

- Latencia incompatible con tiempo real: ~667 ms por predicción frente a un *tick* de 66,7 ms a 15 Hz; el robot se detendría en cada *re-planning* con el sampler de 100 pasos incluido.
- Sin tasa de éxito publicada ni en robot ni en simulación; el autor no reclama ningún resultado de *rollout*.
- Pérdida de validación no predictiva: el mínimo está en la época 40 y empeora después hasta 0,118 en la época 250, por lo que elegir el checkpoint final por *loss* de entrenamiento es engañoso.
- Las pérdidas no son comparables entre métodos, según advierte el propio autor.
- Sesgos conocidos: no documentados. Al entrenarse sobre 95 episodios de una única tarea y un único montaje, el modelo está fuertemente sobreajustado al entorno, iluminación, posiciones de cámara y geometría de esa célula de trabajo.
- Riesgo de fallo fuera de distribución: cualquier cambio de posición de cámara, objeto o robot degradará el comportamiento; no hay datos de generalización.
- Limitación de idioma: no aplica, el modelo no procesa lenguaje.
- Restricciones de licencia: MIT, permite uso comercial, pero al ser una obra derivada de la receta de Diffusion Policy conviene revisar la licencia del código original (`ODE_Policy`) que se necesita para cargar y servir los checkpoints.
- Riesgo de seguridad en la carga: los checkpoints son *pickles* con `dill` y requieren `weights_only=False`; solo deben cargarse pesos de fuentes de confianza, como advierte el propio autor.
- Dependencia de código externo: la carga requiere `roboverse_learn` y `neural_ode/real/` del repositorio `ODE_Policy`; sin ese código los `.ckpt` no son utilizables.
- El repositorio no incluye tarjeta de modelo en otros idiomas ni documentación de sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/at237299966/dp_insert_flowers
- Dataset de entrenamiento: https://huggingface.co/datasets/at237299966/r1lite_insert_flower_single
- Dataset alternativo relacionado: https://huggingface.co/datasets/at237299966/r1lite_insert_flower
- Baseline de política ODE: https://huggingface.co/at237299966/ODE_policy_insert_flowers
- Baseline de flow matching: https://huggingface.co/at237299966/fm_dit_insert_flowers
- Modelo comparable de terceros (ImageWAM): https://huggingface.co/ZUO66/imagewam-r1lite-insert-flower
- Checkpoint intermedio de terceros: https://huggingface.co/ZUO66/imagewam-r1lite-insert-flower-single-epoch52
- Referencia metodológica citada por el autor: Chi et al., 2023 (Diffusion Policy); no se proporciona URL en la información disponible.
