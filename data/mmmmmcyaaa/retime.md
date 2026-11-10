# mmmmmcyaaa/ReTime

## Resumen

ReTime / OPTR es un paquete de investigación para robótica publicado en Hugging Face por el usuario mmmmmcyaaa. No se trata de un modelo generativo de propósito general, sino de un artefacto experimental que contiene checkpoints, estados de entrenamiento reanudables y código de evaluación para políticas visión-lenguaje-acción (VLA) entrenadas sobre dos stacks distintos: Florence-2-large y Qwen3-VL-4B, ambos acoplados a datos de robótica Bridge (OXE LeRobot). El objetivo declarado es permitir experimentos de continuación multi-semilla reproducibles sobre un punto de partida común ("common start"), comparando un muestreo uniforme frente a una variante denominada Residual-OPTR con corrección de importancia.

La relevancia del paquete es metodológica más que de producto: fija un contrato experimental estricto (semillas de entrenamiento, semillas de evaluación, configuración de hardware, orden de datos y estado RNG) para que terceros puedan reproducir y extender los resultados reportados. El autor publica el resultado principal en el panel SimplerEnv WidowX/Bridge, donde Residual-OPTR +500 alcanza un 59,38 % de éxito global frente al 42,19 % del muestreo uniforme sobre 384 rollouts.

El repositorio ocupa 255,5 GB e incluye estados completos de optimizador, scheduler y RNG, además de snapshots de solo modelo para evaluación. La licencia es MIT. No hay información publicada sobre idiomas soportados ni sobre el pipeline de inferencia en producción más allá del servidor de políticas incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción sobre VLM: Florence-2-large (variante Florence–Bridge) y Qwen3-VL-4B (variante Qwen–Bridge), con cabeza de acción y adaptación de acción bimanual |
| Parametros totales | no disponible (el repo incluye pesos de Florence-2-large y Qwen3-VL-4B, pero no se declara el recuento total de la política ensamblada) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (checkpoints de modelo y estados de entrenamiento); también configuración YAML y JSON de propuestas |

## Arquitectura y entrenamiento

La política combina un VLM base con una cabeza de acción. En la variante Florence–Bridge el VLM es Florence-2-large, con `cross_attention_dim: 1024` y entrenamiento bajo DeepSpeed ZeRO-2 en BF16 sobre dos GPUs, micro-batch 4 por GPU, acumulación 8 y batch global 64. El nombre de registro `QwenGR00T` en la configuración es histórico y no refleja el modelo base real. Los grupos de optimizador son la interfaz del VLM y el modelo de acción; no se configuró una lista explícita de congelación, y la ruta de acción ejecutada actualizó la interfaz visión/texto de Florence y la cabeza de acción, mientras que los parámetros del decodificador fuera de esa ruta no recibieron actualizaciones.

El entrenamiento parte de un estado común reanudable a 20K pasos (Florence–Bridge) o 29K pasos (Qwen3-VL-4B–Bridge) y continúa 500 pasos adicionales por brazo. La innovación central es Residual-OPTR: un muestreo de propuestas temporales con corrección de objetivo de importancia estándar `p/q`, usando una propuesta congelada con K=8 y alpha=0.2 (`proposals/residual_temporal_proposal_k8_alpha0.2.json`). El paquete separa estrictamente semillas de common-start, de continuación y de evaluación; para Florence–Bridge la semilla de continuación principal es 117465 (con 533389 y 944964 ya reportadas) y las semillas de evaluación son 518957, 765353, 686765 y 516408. Para Qwen–Bridge la continuación exacta exige ambos ficheros `.pt` de 29K (modelo y estado de entrenamiento completo).

## Capacidades

- Control robótico visión-lenguaje-acción: genera acciones motoras a partir de observaciones visuales e instrucciones, evaluado en tareas de manipulación del panel SimplerEnv WidowX/Bridge (Carrot, Spoon, Eggplant, Stack).
- Adaptación de acción bimanual: el directorio `real_robot/` incluye conversión de datos Xtrainer2, entrenamiento, adaptación de acciones de doble brazo y servidor de políticas.
- Reproducción experimental exacta: estados reanudables con modelo, optimizador, scheduler, RNG por rango y orden de datos.
- Evaluación multi-semilla emparejada: contrato de semillas y manifiestos con huellas de contenido e identidad de anclas válidas.
- Muestreo con corrección de importancia: implementación de Residual-OPTR con propuesta temporal congelada.
- No se declaran capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking; el alcance es robótico.

## Casos de uso

- Reproducción de resultados académicos: un laboratorio descarga el estado común de 20K y ejecuta los brazos uniforme y residual con la semilla 117465 para verificar el 42,19 % frente al 59,38 % reportado en 384 rollouts.
- Extensión de la línea de investigación: investigadores que quieran probar nuevas propuestas de muestreo parten del estado completo de 20K (modelo, optimizador, scheduler y RNG) y solo sustituyen el fichero de propuesta o la lógica de muestreo.
- Estudio de estabilidad multi-semilla: con las cuatro semillas de evaluación fijas se pueden comparar políticas emparejadas y medir varianza entre semillas sin confundirla con cambios de método.
- Despliegue en robot real: el código de `real_robot/` y el servidor de políticas permiten conectar la política entrenada a un brazo Xtrainer2 con adaptación bimanual.
- Comparación de backbones VLM: el paquete ofrece los mismos cuatro ajustes (Florence–Bridge, Florence–RobotWin, Qwen–Bridge, Qwen–RobotWin) bajo una estructura unificada, lo que facilita aislar el efecto del VLM base.
- Auditoría de contratos experimentales: equipos de reproducibilidad pueden usar `EXPERIMENT_CONTRACT.md`, los manifiestos y las comprobaciones semánticas de carga para validar que un experimento ajeno respeta el contrato.

## Benchmarks y rendimiento

Panel fijo SimplerEnv WidowX/Bridge sin vídeo: cuatro semillas de política × cuatro tareas × 24 episodios = 384 rollouts.

| Método | Stack | Carrot | Spoon | Eggplant | Global |
|---|---:|---:|---:|---:|---:|
| Uniform +500 | 13/96 | 31/96 | 50/96 | 68/96 | 162/384 = 42,19 % |
| Residual-OPTR +500 | 24/96 | 45/96 | 83/96 | 76/96 | 228/384 = 59,38 % |

No se han publicado en la información disponible resultados de benchmarks para la variante Qwen3-VL-4B–Bridge ni métricas de MMLU, HumanEval o GSM8K, que no aplican al propósito del modelo.

## Requisitos de hardware

- Entrenamiento (Florence–Bridge): dos GPUs, BF16, DeepSpeed ZeRO-2, micro-batch 4 por GPU, acumulación 8, batch global 64, según el contrato del autor.
- Almacenamiento: el repositorio completo ocupa 255,5 GB; conviene descargar solo los subdirectorios necesarios (por ejemplo, un único ajuste y su estado común).
- VRAM de inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el contrato solo especifica "dos GPUs" sin modelo concreto.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor de políticas incluido en `real_robot/`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReTime / OPTR (este) | no disponible (base Florence-2-large y Qwen3-VL-4B) | no disponible | VLA para manipulación, con muestreo por importancia | MIT | Hugging Face, 255,5 GB |
| OpenVLA | no disponible en la información proporcionada | no disponible | VLA open source para manipulación | no disponible | no disponible |
| RT-2 | no disponible en la información proporcionada | no disponible | VLA propietario de Google DeepMind | propietaria | no disponible |
| π0 (pi-zero) | no disponible en la información proporcionada | no disponible | VLA de flujo para control robótico | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los datos de benchmark del paquete solo cubren la comparación interna uniforme frente a residual.

## Limitaciones y advertencias

- Los snapshots de 20.5K son suficientes para evaluación pero no para continuación exacta de optimizador y RNG; cualquier rama nueva debe reanudar desde el estado completo de 20K.
- Para Qwen–Bridge la continuación exacta exige ambos ficheros `.pt` de 29K; usar solo los parámetros del modelo rompe la reproducibilidad.
- El paquete no incluye activos Matched-Random/shuffle de forma intencionada, lo que limita ciertas comparaciones de control.
- El registro `QwenGR00T` en la configuración es un nombre histórico y puede inducir a error sobre el VLM base real (Florence-2-large).
- No se declaran idiomas soportados ni evaluación multilingüe; el alcance es control robótico con instrucciones, presumiblemente en inglés, aunque no se confirma.
- No hay datos publicados sobre sesgos, tasa de alucinación o robustez fuera de distribución; el riesgo principal en producción es la generalización limitada del panel SimplerEnv a entornos reales distintos.
- El tamaño del repositorio (255,5 GB) y la dependencia de datos OXE LeRobot Bridge/RT1 y de Florence-2-large complican la puesta en marcha.
- La licencia MIT permite uso comercial, pero el paquete incluye pesos derivados de Florence-2 y Qwen3-VL cuyas licencias de origen deben verificarse por separado antes de un despliegue comercial.

## Enlaces

- Hugging Face: https://huggingface.co/mmmmmcyaaa/ReTime
- Contrato experimental: `EXPERIMENT_CONTRACT.md` (en el repositorio)
- Instrucciones de traspaso para agentes: `AGENTS.md` (en el repositorio)
- Protocolo de semillas Bridge: `BRIDGE_SEED_PROTOCOL.md` (en el repositorio)
- Inventario de fuentes: `SOURCE_INVENTORY.md` (en el repositorio)
- Propuesta residual congelada: `proposals/residual_temporal_proposal_k8_alpha0.2.json` (en el repositorio)
- Protocolo multi-semilla Qwen: `qwen_bridge_common_start_29k/MULTISEED_PROTOCOL.md` (en el repositorio)
- Entorno Qwen: `qwen_bridge_common_start_29k/ENVIRONMENT.md` (en el repositorio)
- No se han encontrado en la información disponible enlaces a papers, blogs, demos o repositorios externos.
