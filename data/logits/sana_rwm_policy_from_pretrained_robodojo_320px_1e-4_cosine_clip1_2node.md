# logits/sana_rwm_policy_from_pretrained_robodojo_320px_1e-4_cosine_clip1_2node

## Resumen

`sana_rwm_policy_from_pretrained_robodojo_320px_1e-4_cosine_clip1_2node` es un *bundle* de reanudación de entrenamiento publicado por el usuario `logits` en HuggingFace, no un modelo listo para inferencia. Contiene el estado completo de un *fine-tuning* supervisado (SFT) de una política robótica basada en la arquitectura SANA, denominada `rwm` (política de mundo robótico), entrenada sobre el conjunto RoboDojo con el brazo ARX-X5 a una resolución de entrada de 320 píxeles. El repositorio almacena exactamente un *checkpoint* (el más reciente, `epoch_10_step_61500`) y se sobrescribe en cada subida, por lo que actúa como un puntero móvil al último estado del entrenamiento.

El propósito del artefacto es permitir reanudar una ejecución de entrenamiento concreta (`sft_robodojo_arxx5_unified_jointonly_f25_320px_2node_s120000_lr1e4cos_aw1_wd1e-2`) preservando pesos en formato FSDP de Accelerate, estado del optimizador, planificador, estados RNG por rango y los registros de Weights & Biases. Incluye además los ficheros de normalización afín de acciones (imprescindibles para que la cabeza de acción sea utilizable) y los resultados de validación *held-out* de cada *checkpoint* evaluado hasta la fecha.

Es relevante ahora porque documenta de forma pública y reproducible un *pipeline* de entrenamiento de políticas robóticas de extremo a extremo, con métricas de validación por *checkpoint* y trazabilidad de configuración, algo poco habitual en modelos de robótica de código abierto. El tamaño del repositorio (3968,4 GB) refleja que se trata de un artefacto de entrenamiento con estado completo, no de un modelo distribuible ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SANA (policy `rwm`, vision-a-action); detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (política robótica; horizonte de observación no especificado) |
| Tipos de cuantizacion | no disponible (estado FSDP de entrenamiento, no pesos cuantizados) |
| Idiomas soportados | no disponible (modelo de visión-acción, no de lenguaje) |
| Licencia | other (términos concretos no especificados) |
| Formato de pesos | `pytorch_model_fsdp.bin` (estado FSDP de Accelerate) + `optimizer.bin`, `scheduler.bin`, `random_states_*.pkl`, `metadata.pth` |
| Tamaño del checkpoint | 49,9 GiB (`epoch_10_step_61500`) |
| Tamaño del repo | 3968,4 GB |
| Dataset de entrenamiento | RoboDojo ARX-X5, 320 px, 35 tareas |
| Configuración de entrenamiento | lr 1e-4 coseno hasta 1e-6, grad-clip 1, 2 nodos |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una política robótica de la familia SANA (`sana_rwm_policy`) que mapea observaciones visuales (vídeo/imágenes a 320 px) a acciones de control del robot. La normalización referenciada (`action_mode/robot_base_eef/robodojo_arx_x5_model_fps_25_f25_normalization.json`) indica que la cabeza de acción opera sobre acciones del efector final en el marco base del robot, a 25 FPS. El entrenamiento se realizó mediante SFT con precisión mixta sobre el conjunto RoboDojo con el brazo ARX-X5, en una configuración "unified joint only" con 320 px de resolución y 120 000 pasos previstos (`s120000`), optimizador con *weight decay* 1e-2 y *warmup* aw1.

El *bundle* conserva el estado FSDP completo (pesos, optimizador, planificador, RNG por rango y metadatos de época/paso), lo que permite reanudar el entrenamiento de forma exacta desde `latest.pth`. No se documenta en la información disponible el número de tokens, la composición detallada del *dataset* ni si se aplicaron fases de RLHF/DPO. La innovación técnica destacable es de ingeniería más que de modelado: un formato de reanudación reproducible con verificación por SHA-256 de la normalización de acciones y validación por *checkpoint*.

## Capacidades

- Predicción de acciones robóticas a partir de observaciones visuales (imágenes/vídeo a 320 px) sobre el brazo ARX-X5.
- Control del efector final en el marco base del robot (`robot_base_eef`) a 25 FPS.
- Ejecución de tareas de manipulación del conjunto RoboDojo (35 tareas evaluadas en validación).
- Reanudación exacta de entrenamiento: pesos, optimizador, planificador, paso y RNG.
- Registro de validación *held-out* por tarea (una episodio no visto por tarea).
- No se documentan capacidades de *tool calling*, agentes, multilingüismo, visión general, audio ni *thinking mode*.

## Casos de uso

- Reanudación de entrenamiento en clúster: descargar el *bundle*, recrear el enlace simbólico `latest.pth` y lanzar el *script* `run_sft_robodojo_arx_x5_unified_joint_only_320_s120000_lr1e4cos_aw1_wd1e-2.sbatch` mediante SLURM para continuar el SFT desde el paso 61500 sin pérdida de estado.
- Reproducción de experimentos de robótica: el MANIFEST.json con tamaños y SHA-256 de cada fichero permite auditar la integridad del *checkpoint* y comparar resultados entre ejecuciones.
- Análisis de curvas de validación: el fichero `validation/heldout_metrics.json|csv` permite estudiar la evolución del error de acción por tarea y detectar *checkpoints* con sobreajuste o inestabilidad.
- Investigación en política visomotora: sirve como punto de partida para *fine-tuning* sobre nuevos dominios robóticos reutilizando la normalización afín documentada.
- Estudio de la dinámica de normalización de acciones: la fijación por SHA-256 de la normalización de acciones permite aislar su efecto en la estabilidad del entrenamiento.
- *Benchmarking* de tareas RoboDojo: usando `epoch_10_step_61500` como referencia, se pueden comparar nuevas arquitecturas sobre las mismas 35 tareas con un protocolo de validación *held-out* idéntico.
- Docencia en robótica de aprendizaje: el *bundle* ilustra un flujo real de entrenamiento distribuido con FSDP, SLURM, W&B y validación *held-out* paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por tratarse de una política robótica. La model card incluye validación *held-out* (un episodio no visto por tarea, 35 tareas) con error cuadrático medio de acción por *checkpoint*:

| ckpt step | action MSE mean | median | max | tasks > 0.2 |
|---|---|---|---|---|
| 5000 | 0.0293 | 0.0072 | 0.2817 | 1 |
| 10000 | 0.0423 | 0.0084 | 0.3547 | 1 |
| 15000 | 0.0240 | 0.0055 | 0.1658 | 0 |
| 20000 | 0.0126 | 0.0035 | 0.1095 | 0 |
| 25000 | 0.0133 | 0.0023 | 0.1439 | 0 |
| 30000 | 0.0119 | 0.0021 | 0.1471 | 0 |
| 35000 | 0.0066 | 0.0019 | 0.0338 | 0 |
| 40000 | 0.0110 | 0.0026 | 0.1639 | 0 |
| 45000 | 0.0077 | 0.0016 | 0.0672 | 0 |
| 50000 | 0.0134 | 0.0017 | 0.1560 | 0 |
| 55000 | 0.0117 | 0.0015 | 0.1485 | 0 |
| 60000 | 0.0066 | 0.0022 | 0.0380 | 0 |

El mejor MSE medio observado corresponde a los pasos 35000 y 60000 (0,0066), con el máximo más bajo también en el paso 60000 (0,0380) y en el paso 35000 (0,0338).

## Requisitos de hardware

- *Checkpoint* de entrenamiento: 49,9 GiB solo para el estado `epoch_10_step_61500` (pesos + optimizador + planificador).
- Repositorio completo: 3968,4 GB, por lo que se recomienda descarga selectiva y almacenamiento en *lustre* o sistemas distribuidos.
- Entrenamiento: configuración distribuida con Accelerate FSDP; el lanzador documentado usa `sbatch --array=1-20%1` sobre 2 nodos, lo que implica GPUs de centro de datos (A100/H100) con interconexión de alta velocidad.
- Inferencia: no disponible. Al ser un *bundle* FSDP no hay pesos consolidados ni versión GGUF/ONNX; sería necesario fusionar los *shards* y exportar antes de cualquier despliegue.
- VRAM para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible y poco probable sin *sharding* previo, dado el tamaño del estado.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplican a una política robótica).
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de política robótica comparables (por ejemplo, familias tipo OpenVLA, pi0 u otras políticas visomotoras) ni métricas cruzadas que permitan una comparación rigurosa. El único punto de referencia cuantitativo son los MSE de validación *held-out* por *checkpoint* del propio entrenamiento.

## Limitaciones y advertencias

- No es un modelo listo para inferencia: es un *bundle* de reanudación con estado FSDP, optimizador y RNG; requiere *checkout* del código de entrenamiento y un clúster para ejecutarse.
- El repositorio se sobrescribe en cada subida y contiene un único *checkpoint*; no hay versionado histórico de estados anteriores.
- La cabeza de acción no puede usarse ni reanudarse sin la normalización afín referenciada por SHA-256.
- Específico del hardware robotico ARX-X5 y de las 35 tareas de RoboDojo; no se documenta generalización a otros robots o tareas.
- Licencia "other" con términos no especificados en la información disponible; se debe verificar antes de cualquier uso comercial.
- El error de validación es elevado en algunas tareas (máximos de 0,15-0,35 en pasos tempranos), lo que sugiere comportamiento irregular en un subconjunto de tareas.
- No se documentan sesgos, riesgos de alucinación ni comportamiento multilingüe (no aplican a un modelo de visión-acción), pero la ausencia de *dataset* detallado impide evaluar sesgos de dominio.
- El enlace simbólico `latest.pth` no lo almacena HuggingFace; hay que recrearlo manualmente para reanudar.
- No se incluyen código (`--with-code`), configuraciones de lanzamiento (`--with-launch`), entorno (`--with-env`), logs de SLURM (`--with-logs`) ni entradas externas (`--with-inputs`), lo que dificulta la reproducibilidad completa.
- El tamaño de 3968,4 GB del repositorio puede hacer inviable su descarga completa en entornos con almacenamiento limitado.

## Enlaces

- HuggingFace: https://huggingface.co/logits/sana_rwm_policy_from_pretrained_robodojo_320px_1e-4_cosine_clip1_2node
- W&B del entrenamiento: https://wandb.ai/lzknus/sana-rwm/runs/sft_robodojo_arxx5_unified_jointonly_f25_320px_2node_s120000_lr1e4cos_aw1_wd1e-2
- Referencia de código (commit): `602036b6987854a16422f2bc8a1a2df41d971ee2` (rama `frozen/s120000-wd-fix`), sin URL pública en la información disponible
- Resultados de la búsqueda web: no relevantes (los resultados devueltos tratan sobre el Lago de Como y no guardan relación con el modelo).
