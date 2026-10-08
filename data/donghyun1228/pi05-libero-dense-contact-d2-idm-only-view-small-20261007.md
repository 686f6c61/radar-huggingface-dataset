# Donghyun1228/pi05-libero-dense-contact-d2-idm-only-view-small-20261007

## Resumen

El modelo `Donghyun1228/pi05-libero-dense-contact-d2-idm-only-view-small-20261007` es una política robótica (VLA, vision-language-action) publicada en HuggingFace por el usuario Donghyun1228, entrenada sobre tareas de manipulación del benchmark LIBERO en simulación MuJoCo 3.2.3. El repositorio se etiqueta con `robotics`, `libero`, `pi05` y `jax`, y su model card lo describe como una ablación de destilación de conocimiento (KD) con un decodificador IDM compartido y media acumulada sobre horizonte 10 (H10). Forma parte de una barrida de experimentos sobre el conjunto de datos "LIBERO Dense Contact Sweep (density 2)".

Se trata de un artefacto de investigación, no de un modelo de propósito general: no genera texto ni responde a prompts conversacionales, sino que produce acciones de robot a partir de observaciones e instrucciones. El entrenamiento se hizo con FSDP sobre 4 GPU, partiendo de un checkpoint fuente del 2026-09-26 (paso 9999), con pesos IL/KD de 0, 10.000 actualizaciones, batch global de IDM de 32, learning rate 1e-5 y semilla 42.

El interés actual es doble: por un lado, documenta una configuración reproducible de adaptación de bajo coste sobre un backbone VLA congelado parcialmente; por otro, al publicarse los parámetros en formato Orbax junto con los activos de normalización (sin estados del optimizador), permite reproducir la evaluación en LIBERO. El repositorio ocupa 11,5 GB, pero no se especifican recuento de parámetros, licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible con detalle; la model card menciona un "vision/base LLM" y un "action expert" congelado en la variante `view_small` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; se distribuyen parámetros en formato Orbax, sin mención a GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX/Flax); se incluyen parámetros y activos de normalización, los estados del optimizador no |
| Pipeline declarado | robotics |
| Tarea | manipulación robótica (política VLA) sobre LIBERO, simulación MuJoCo 3.2.3 |
| Variante de entrenamiento | ablación KD emparejada, IDM *only*, `view_small`, H10 (media acumulada), decodificador IDM compartido |
| Hiperparámetros | 10.000 actualizaciones, batch global IDM 32, LR 1e-5, seed 42, pesos IL/KD 0 y 10, 4 GPU con FSDP |
| Checkpoint de partida | fuente del 2026-09-26, paso 9999 (todas las condiciones parten de forma independiente) |
| Configuración de política | `pi05_libero_dense_contact_20261002_view_idm_only` |
| Tamaño del repositorio | 11,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe una política compuesta por dos bloques: un "vision/base LLM" y un "action expert". En la condición `view_small`, la adaptación afecta únicamente al módulo de visión y al LLM base, mientras que el *action expert* permanece congelado; en la condición de *yaw*, en cambio, se adapta la política completa. Esta separación es la innovación metodológica central del experimento: permite aislar cuánto del rendimiento proviene del *backbone* perceptivo-lingüístico frente al cabezal de acciones.

El entrenamiento es una ablación emparejada (*matched KD ablation*) en la que se usa un modelo inverso de dinámica (IDM) con decodificador compartido y agregación por media acumulada sobre un horizonte H10. Los pesos de *imitation learning* y de *knowledge distillation* se fijan en 0 y 10 respectivamente, es decir, la señal de aprendizaje proviene exclusivamente del IDM en esta configuración (`idm-only`). Se ejecutan 10.000 actualizaciones con batch global de IDM 32, LR 1e-5 y semilla 42, distribuidas con FSDP en 4 GPU. Todos los brazos del experimento arrancan de forma independiente desde el mismo checkpoint fuente (paso 9999 del 2026-09-26).

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias humanas. La model card remite a `training_configuration.json` (incluido en el repositorio) y a los *commits* de datos para los comandos exactos, pero ese contenido no se ha facilitado.

## Capacidades

- Generación de acciones motoras para manipulación robótica en entornos LIBERO simulados en MuJoCo.
- Procesamiento conjunto de observaciones visuales y de instrucciones en lenguaje natural, propio de una política VLA.
- Ejecución de tareas de razonamiento espacial, manipulación de objetos y secuencias largas de hasta 10 tareas, según la descripción del dataset asociado.
- Variante `view_small`: adaptación de visión y LLM base manteniendo congelado el *action expert*, útil para estudiar transferencia con coste reducido.
- Variante *yaw*: adaptación de la política completa (mencionada en la model card como condición complementaria).
- Integración con el ecosistema JAX/Orbax para carga de parámetros en flujos de entrenamiento o evaluación.
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso, visión general de propósito, audio ni modo de razonamiento explícito (*thinking mode*).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en destilación de conocimiento para robótica: el modelo sirve como brazo de control en una ablación emparejada, permitiendo comparar la contribución del IDM frente al aprendizaje por imitación con la misma semilla, mismo presupuesto de actualizaciones y mismo checkpoint de partida.
- Estudio de congelación parcial de políticas VLA: al adaptar solo visión y LLM base con el *action expert* congelado, resulta adecuado para medir cuánto rendimiento se conserva con un coste de ajuste muy inferior al ajuste completo.
- Evaluación comparativa en LIBERO: el modelo puede desplegarse en el benchmark LIBERO para obtener métricas de tasa de éxito por suite (spatial, object, goal, long) y contrastarlas con las variantes de la misma barrida de experimentos.
- Reproducción de experimentos en simulación MuJoCo 3.2.3: al incluirse parámetros Orbax y activos de normalización, un tercero puede reconstruir exactamente la política para validar los resultados declarados.
- Generación de datos sintéticos de manipulación con contacto denso: la política puede ejecutar trayectorias sobre el dataset "Dense Contact Sweep (density 2)" para producir rollouts adicionales con múltiples puntos de vista sincronizados.
- Análisis de robustez a cambios de cámara o punto de vista: la etiqueta `view_small` sugiere que el modelo está pensado para estudiar la sensibilidad del rendimiento a la configuración visual, un caso de uso frecuente antes de trasladar políticas a hardware real.
- Docencia y formación en robótica basada en simulación: sirve como ejemplo reproducible de flujo JAX + FSDP con checkpoints Orbax, sin necesidad de infraestructura de GPU a gran escala para la fase de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Aunque el modelo se enmarca en el benchmark LIBERO (que habitualmente reporta tasas de éxito por suite), la model card facilitada no incluye cifras de éxito, comparaciones numéricas ni métricas de evaluación. No se inventan valores.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita. Como referencia derivada del tamaño del repositorio (11,5 GB, que incluye parámetros y activos de normalización), una carga en precisión de 32 bits implicaría del orden de 3.000 millones de parámetros, y en bfloat16 del orden de 5.000-6.000 millones; son estimaciones indirectas, no datos confirmados por el autor.
- GPU recomendadas: no especificadas para inferencia. El entrenamiento se realizó con 4 GPU mediante FSDP, lo que implica aceleradores de clase centro de datos (A100, H100 o equivalentes) como entorno de referencia.
- GPU de consumo: no confirmado. Si la estimación de tamaño anterior es correcta, una RTX 4090 (24 GB) podría alojar los pesos en bfloat16, aunque no hay validación publicada.
- Opciones de despliegue: no se documentan. El formato Orbax y la etiqueta `jax` apuntan a flujos nativos de JAX/Flax; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables de forma estándar a políticas VLA.
- Latencia y throughput: no disponibles.
- Nota de despliegue: al no incluirse los estados del optimizador, el repositorio está pensado para inferencia y evaluación, no para reanudar entrenamiento tal cual.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Donghyun1228/pi05-libero-dense-contact-d2-idm-only-view-small-20261007` | no disponible | no disponible | LIBERO / MuJoCo, ablación KD IDM *only* | no disponible | HuggingFace, 0 descargas |
| `lerobot/pi05-libero` | no disponible | no disponible | LIBERO | no disponible | HuggingFace |
| `lerobot/pi05_libero_base` | no disponible | no disponible | LIBERO | no disponible | HuggingFace |
| Checkpoint fuente del 2026-09-26 (paso 9999) | no disponible | no disponible | LIBERO | no disponible | no disponible |

Los tres modelos comparables pertenecen a la misma familia `pi05` aplicada a LIBERO, pero la información recuperada no incluye sus especificaciones técnicas ni resultados de evaluación, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial está permitido. En ausencia de licencia explícita, debe asumirse ausencia de permisos.
- El modelo es un artefacto de investigación con 0 descargas y 0 *likes*; no hay evidencia de uso externo ni de validación por terceros.
- Está entrenado para entornos LIBERO en simulación MuJoCo 3.2.3. No hay evidencia de transferencia a robots físicos (*sim-to-real*).
- No se documentan sesgos, pero al ser un modelo entrenado sobre un dataset acotado de tareas de manipulación, su comportamiento fuera de esa distribución es impredecible.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones incorrectas o inseguras cuando las observaciones difieren de las condiciones de entrenamiento.
- No hay información sobre idiomas soportados en las instrucciones de lenguaje natural, ni sobre la longitud de contexto, lo que limita el diseño de experimentos con instrucciones largas.
- Los estados del optimizador no se incluyen, por lo que no es posible reanudar el entrenamiento desde el repositorio sin recalcularlos.
- La configuración exacta depende de `training_configuration.json` y de *commits* de datos externos; si esos recursos no están disponibles, la reproducibilidad queda comprometida.
- El nombre del repositorio agrupa varios identificadores de condición (`dense-contact`, `d2`, `idm-only`, `view-small`); conviene verificar que se está usando la variante correcta antes de comparar resultados.
- La fecha de creación (2026-10-08) y el tamaño del repositorio (11,5 GB) son los únicos metadatos de contexto temporal y de almacenamiento disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-dense-contact-d2-idm-only-view-small-20261007
- Dataset "LIBERO Dense Contact Sweep (density 2, 2026-10-02)": https://claru.ai/datasets/donghyun1228-libero-dense-contact-sweep-d2-20261002
- `lerobot/pi05-libero`: https://huggingface.co/lerobot/pi05-libero
- `lerobot/pi05_libero_base`: https://huggingface.co/lerobot/pi05_libero_base
- Documentación de LIBERO en LeRobot: https://huggingface.co/docs/lerobot/libero
- Repositorio LIBERO (benchmark): https://github.com/Lifelong-Robot-Learning/LIBERO
