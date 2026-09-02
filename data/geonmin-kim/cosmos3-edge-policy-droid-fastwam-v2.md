# geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v2

## Resumen

`geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v2` es un checkpoint intermedio (paso 3000 de 100 000 iteraciones, un 3 % del entrenamiento planificado) de un fine-tuning de tipo *two-pass FastWAM* sobre el modelo base `nvidia/Cosmos3-Edge-Policy-DROID`, un modelo de política robótica (VLA, *Vision-Language-Action*) de 4 000 millones de parámetros perteneciente a la familia Cosmos 3 de NVIDIA. El autor, geonmin-kim, lo publica como una instantánea de evaluación, no como un producto final, y advierte que el entrenamiento puede continuar.

El objetivo del fine-tuning es adaptar el modelo a una secuencia de inferencia "podada" (FastWAM) que elimina aproximadamente 3 060 tokens de video generados, reduciendo la latencia de 233 ms a 185 ms (−21 %). Sin embargo, aplicar esa poda sin entrenamiento previo degrada la precisión (el error MAE en bucle abierto pasa de 0,111 a 0,197). Para evitarlo, el entrenamiento combina dos pasadas: una con la secuencia podada (pass B) y otra con el clip completo de 33 fotogramas (pass A), preservando así la capacidad de predicción de video mientras se adapta a la inferencia rápida.

Este modelo es relevante para la comunidad de robótica porque aborda un problema práctico: reducir la latencia de los modelos de política sin sacrificar la precisión, un factor crítico en el control en tiempo real de robots manipuladores. La publicación incluye advertencias metodológicas importantes sobre cómo evaluar el modelo (no usar la curva de pérdida ni el MAE en bucle abierto como criterio de calidad).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Cosmos3-Edge (4B), arquitectura interna no especificada en la documentación disponible |
| Parametros totales | 4 000 millones (modelo base Cosmos3-Edge) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | No especificado (checkpoint de PyTorch con pesos EMA, probablemente safetensors o binario) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/Cosmos3-Edge-Policy-DROID`, un modelo de política que combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones, entrenado con *flow matching* sobre el dataset DROID. El fine-tuning presentado aquí introduce una modificación en la secuencia de inferencia: en lugar de generar todos los tokens de video futuros, se eliminan los tokens generados (aproximadamente 3 060) y se mantienen solo los tokens de acción, lo que reduce la latencia. Esta poda se implementa a nivel de modelo (`inference_drop_generated_vision`), no en el dataset.

El entrenamiento utiliza dos pasadas por paso:

- **Pass B**: secuencia `[texto | visión condicionada | acción]` (podada como en despliegue), con pérdida de *flow matching* sobre acciones y peso `action_loss_weight = 10.0`.
- **Pass A**: clip completo de 33 fotogramas, con pérdida de *flow matching* sobre video y `loss_scale = 1.0`.

Los datos de entrenamiento combinan dos fuentes:

- **DROID** (proporción 3): episodios de éxito y fracaso completos, filtrados con `keep_ranges_1_0_1`. Los episodios de fracaso solo contribuyen a la pérdida de video (su peso en la pérdida de acción es 0), pero sus tokens de acción se mantienen en la secuencia para que la rama de video quede condicionada por acciones.
- **Simulación** (proporción 1): 4 211 episodios / 300 665 fotogramas de `nvidia/PhysicalAI-Robotics-Manipulation-SingleArm` (Franka Panda, IsaacSim), convertidos al esquema DROID. Se aplica una proporción conservadora 3:1 porque los robots simulados tienen un movimiento por fotograma unas 6 veces mayor que la teleoperación DROID y visitan poses articulares fuera del rango normalizado.

El optimizador es FusedAdamW con lr 2e-4 (multiplicador 5x para `action2llm`, `llm2action` y `action_modality_embed`), scheduler LambdaLinear con warmup de 250 pasos y ciclo de 25 000, tras el cual la lr se mantiene en 2e-5. Se congelan el VLM y el VAE; solo se entrenan el experto generador y los puentes. El entrenamiento se realizó en 4 GPU NVIDIA B300 con bfloat16, FSDP (`data_parallel_shard_degree=4`) y *activation checkpointing* completo.

## Capacidades

- **Control robótico de manipulación**: genera comandos de articulaciones (joint positions) a partir de observaciones visuales y una instrucción en lenguaje natural.
- **Predicción de video**: conserva la capacidad de predecir secuencias de video (pass A), aunque el objetivo principal es la acción.
- **Soporte de instrucciones en lenguaje natural**: el modelo recibe texto como entrada para especificar la tarea.
- **Inferencia de baja latencia**: gracias a la poda FastWAM, reduce la latencia de 233 ms a 185 ms en comparación con la secuencia completa.
- **Robustez a episodios de fracaso**: los datos de fracaso se utilizan para mejorar la predicción de video sin contaminar la pérdida de acción.
- **No es un modelo de lenguaje general**: no genera texto libre ni responde preguntas; su salida son acciones robóticas.

## Casos de uso

- **Manipulación robótica en entornos reales**: el modelo puede controlar un brazo robótico (por ejemplo, un Franka Panda) para tareas de recogida y colocación, utilizando el dataset DROID como base. Su baja latencia lo hace adecuado para control en tiempo real.
- **Simulación robótica con IsaacSim**: gracias al entrenamiento con datos simulados, puede desplegarse en entornos virtuales para validar políticas antes de transferirlas al mundo real.
- **Teleoperación asistida**: puede usarse como política de respaldo o asistencia en sistemas de teleoperación, donde la latencia reducida mejora la fluidez del control.
- **Investigación en VLA y world models**: sirve como punto de partida para estudiar el efecto de la poda de tokens en la precisión y la latencia, o para fine-tuning adicional en tareas específicas.
- **Despliegue en servidores de política (RoboLab)**: el autor proporciona un comando para ejecutar el modelo como servidor de política, integrándolo en pipelines de robótica existentes.
- **Evaluación de políticas en bucle cerrado**: a pesar de las advertencias, puede usarse para pruebas de humo y evaluación cualitativa en entornos controlados, siempre que se sigan las recomendaciones del autor (usar RoboLab, no métricas de pérdida).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona métricas de latencia (233 ms → 185 ms) y de error MAE en bucle abierto (0,111 → 0,197 sin entrenamiento), pero advierte explícitamente que el MAE en bucle abierto no es un indicador fiable y que la evaluación debe realizarse con RoboLab. No se proporcionan tablas comparativas con otros modelos.

## Requisitos de hardware

- **Entrenamiento**: 4 GPU NVIDIA B300 (según la model card). No se especifican requisitos de VRAM por GPU.
- **Inferencia**: se requiere una GPU RTX con soporte de RT cores, ya que el servidor de política RoboLab utiliza el renderizador de Isaac Sim. No se indica la VRAM mínima, pero un modelo de 4B en bfloat16 requiere aproximadamente 8 GB de VRAM solo para los pesos, más memoria para las activaciones y el contexto visual.
- **Opciones de despliegue**: el autor proporciona un script `action_policy_server_robolab` que ejecuta el modelo como servidor. No se mencionan otras herramientas como vLLM u Ollama, ya que no es un modelo de lenguaje estándar.
- **Latencia**: 185 ms por paso de inferencia con la poda FastWAM (medida en el hardware de entrenamiento, probablemente B300).

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con otros modelos de la misma categoría. El propio autor publica una versión anterior (`v1`) y un checkpoint específico (`step3000`), pero no hay datos de rendimiento comparativo. Se puede comparar con el modelo base:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `nvidia/Cosmos3-Edge-Policy-DROID` | 4B | No disponible | NVIDIA Open Model License | Modelo base sin poda FastWAM |
| `geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v1` | 4B | No disponible | NVIDIA Open Model License | Versión anterior del fine-tuning |
| `geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v2` (este) | 4B | No disponible | NVIDIA Open Model License | Versión actual, paso 3000 |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Checkpoint intermedio**: es un punto de control al 3 % del entrenamiento planificado, no un modelo final. El autor advierte que el entrenamiento puede continuar y que este snapshot no debe usarse en producción.
- **Evaluación no trivial**: la pérdida y el MAE en bucle abierto no son indicadores fiables de calidad. El autor recomienda usar RoboLab para evaluar, y advierte que ha visto tres veces cómo el MAE apuntaba en la dirección equivocada.
- **Sesgos de datos**: el modelo se entrena con datos de DROID (teleoperación) y simulación IsaacSim. Puede heredar sesgos de esos entornos, como la distribución de poses articulares o la dinámica de los robots simulados.
- **Riesgo de acciones incorrectas**: como cualquier modelo de política, puede generar acciones erróneas en situaciones fuera de la distribución de entrenamiento, lo que podría causar daños en entornos reales.
- **Restricciones de licencia**: la licencia NVIDIA Open Model License puede imponer condiciones para uso comercial. Se recomienda revisar los términos antes de cualquier despliegue.
- **Reanudación del entrenamiento**: el checkpoint no incluye el estado del optimizador ni del scheduler, por lo que no es posible reanudar el entrenamiento exactamente; solo se puede hacer un *warm start* con los pesos.
- **Dependencia de Isaac Sim**: el despliegue requiere Isaac Sim y una GPU con RT cores, lo que limita su uso en entornos sin esa infraestructura.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v2)
- [Checkpoint step3000](https://huggingface.co/geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v2-step3000)
- [Versión v1 (step25000)](https://huggingface.co/geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v1-step25000)
- [Página de Cosmos 3 en NVIDIA Research](https://research.nvidia.com/labs/cosmos-lab/cosmos3/)
- [Documentación de referencia de modelos Cosmos 3](https://docs.nvidia.com/cosmos/latest/cosmos3/model_reference.html)
- [Repositorio GitHub de NVIDIA Cosmos](https://github.com/NVIDIA/cosmos/tree/main/cookbooks/cosmos3)
