# KyujinL/pnpid-calvin-abc-flower

## Resumen

PnPID FLOWER CALVIN ABC→D es un conjunto de checkpoints de un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por el usuario KyujinL. Se trata de un fine-tuning del modelo base `mbreuss/flower_vla_pret` sobre el benchmark CALVIN, concretamente en la partición ABC→D (entrenamiento con las tareas A, B y C, evaluación en la tarea D). El objetivo es comparar el efecto de distintas funciones de pérdida auxiliares sobre el rendimiento del modelo en manipulación robótica guiada por instrucciones en lenguaje natural.

El modelo se enmarca en la familia FLOWER, una arquitectura VLA que combina un codificador visual basado en Florence-2-large con un transformer de políticas y un decodificador de flujo rectificado (rectified flow) para generar trayectorias de acción. Los checkpoints publicados corresponden a la variante `vanilla` (paso 40k, semilla 242), mientras que las variantes con pérdidas auxiliares (`aux_state_diff` y `aux_bc`) estaban aún en entrenamiento en el momento de la publicación.

Es relevante para investigadores en robótica y aprendizaje por imitación que trabajen con CALVIN o con modelos VLA, ya que proporciona pesos reproducibles con configuración Hydra completa y un pipeline de evaluación documentado. El repositorio ocupa 7,8 GB y no cuenta con descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action); codificador visual Florence-2-large + política con decodificación por rectified flow |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en precisión de entrenamiento bf16-mixed) |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural del dataset CALVIN, presumiblemente inglés) |
| Licencia | no disponible |
| Formato de pesos | `model.ckpt` (checkpoint Lightning sin `optimizer_states`), con pesos del modelo y pesos EMA |

## Arquitectura y entrenamiento

El modelo parte de `mbreuss/flower_vla_pret` (concretamente `360000_model_weights.pt`) y se fine-tunea sobre CALVIN ABC→D. La arquitectura FLOWER emplea un backbone visual Florence-2-large cargado con `trust_remote_code` (revisión `21a599d`) y una política que genera acciones mediante flujo rectificado (L_FM). La evaluación usa los pesos EMA (`callbacks.EMA.ema_weights`), que son idénticos a los del checkpoint original.

El entrenamiento se realizó con 4 GPUs, batch global de 32, 40.000 pasos de optimizador (40 épocas × 1000 pasos), AdamW con learning rate 2e-5, decaimiento EMA de 0,999, precisión bf16-mixed y semilla 242. Se comparan tres objetivos: `vanilla` (solo L_FM), `aux_state_diff` (L_FM + 0,3 · L_aux con diferencia de estado) y `aux_bc` (L_FM + 0,3 · L_aux con behavior cloning). La variante `aux_state_diff` usa batch por GPU de 2 con acumulación de gradiente 4 en lugar de batch 4 con acumulación 2, manteniendo el mismo batch efectivo. No se ejecutó evaluación con rollouts durante el entrenamiento.

## Capacidades

- Generación de trayectorias de acción robótica a partir de instrucciones en lenguaje natural e imágenes de entrada.
- Manipulación robótica guiada por lenguaje en el entorno CALVIN (tareas de pick-and-place, apertura de cajones, giro de perillas, etc.).
- Control visomotor de horizonte largo con evaluación multi-paso (`multistep=10`, `ep_len=360`).
- Decodificación por rectified flow con número configurable de pasos de muestreo (`num_sampling_steps=4` por defecto en la evaluación).
- Capacidad multimodal implícita: procesa observaciones visuales y texto de instrucción.
- No se documentan capacidades de tool calling, agentes de propósito general, matemáticas ni código.

## Casos de uso

- Investigación en modelos VLA: servir como punto de partida reproducible para comparar objetivos auxiliares de entrenamiento sobre CALVIN ABC→D, con configuración Hydra y semilla fijadas.
- Evaluación comparativa de pérdidas auxiliares: el repositorio está diseñado explícitamente para contrastar `vanilla`, `aux_state_diff` y `aux_bc` bajo el mismo presupuesto de cómputo y batch efectivo.
- Reproducción de experimentos de manipulación robótica: permite replicar el pipeline de evaluación offline con 1000 secuencias y 360 pasos por episodio sobre el split de validación de CALVIN.
- Baseline para fine-tuning en nuevos entornos: los pesos pueden reutilizarse como inicialización para otras tareas de manipulación con instrucciones en lenguaje.
- Estudio de estabilidad del entrenamiento: los checkpoints EMA y la configuración de 40k pasos permiten analizar la convergencia de la política con flujo rectificado.
- Desarrollo de pipelines de evaluación offline: el script `flower_evaluate.py` y la estructura de checkpoints sirven como referencia para montar evaluaciones sin rollouts durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ejecutó evaluación con rollouts durante el entrenamiento y que los checkpoints deben evaluarse offline; no se incluyen cifras de éxito en CALVIN ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 7,8 GB, lo que da una cota inferior del espacio en disco necesario; la VRAM depende del backbone Florence-2-large y de la política, no documentada.
- GPU recomendadas: el entrenamiento usó 4 GPUs (modelo no especificado); la evaluación se lanza con `CUDA_VISIBLE_DEVICES=0`, es decir, una sola GPU.
- Compatibilidad con GPU de consumo: no confirmada. Florence-2-large y la política podrían caber en GPUs de 24 GB, pero no hay datos que lo verifiquen.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo VLA). El despliegue previsto es mediante el código `PnPID_flower` con el submódulo `calvin_env`.
- Dependencias de software: torch 2.2.2, pytorch-lightning 2.0.8, transformers 4.49.0, hydra-core 1.1.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PnPID FLOWER CALVIN ABC→D | VLA (Florence-2-large + rectified flow) | Fine-tuning sobre `mbreuss/flower_vla_pret`, CALVIN ABC→D | no disponible | no disponible | Hugging Face (0 descargas) |
| `mbreuss/flower_vla_pret` | VLA (FLOWER) | Preentrenamiento | no disponible | no disponible | Hugging Face |
| Modelos VLA sobre CALVIN (p. ej. variantes de RT-1, Robo-Flamingo) | VLA | Distintos | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo está publicado el checkpoint `vanilla/seed242/step40k/`; las variantes `aux_state_diff` y `aux_bc` estaban aún en entrenamiento y no se incluyen.
- El checkpoint `vanilla` se generó con un commit de código (`6e95f9b`) más cambios sin commitear en el momento del lanzamiento, lo que puede afectar a la reproducibilidad exacta.
- No se ejecutó evaluación con rollouts durante el entrenamiento; el rendimiento real en CALVIN D no está verificado en la model card.
- La licencia no está especificada, por lo que el uso comercial queda sin garantías legales.
- El modelo está especializado en CALVIN ABC→D; no se documenta generalización a otros entornos o robots.
- Requiere el submódulo `calvin_env`, el dataset `task_ABC_D` (incluida `validation/lang_annotations/embeddings.npy`) y `microsoft/Florence-2-large` con `trust_remote_code`, lo que añade dependencias externas y superficie de riesgo.
- La carpeta `.hydra/` es oculta y debe verificarse tras la descarga, ya que el loader de evaluación lee `.hydra/config.yaml`.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas; al ser un modelo de acción, el riesgo principal es la ejecución de trayectorias incorrectas en entornos reales.
- Los valores por defecto de `conf/eval_calvin.yaml` apuntan a la máquina original y deben sobrescribirse en línea de comandos.

## Enlaces

- Hugging Face: https://huggingface.co/KyujinL/pnpid-calvin-abc-flower
- Modelo base: https://huggingface.co/mbreuss/flower_vla_pret
- Codificador visual: https://huggingface.co/microsoft/Florence-2-large
- Dataset CALVIN (task_ABC_D): no disponible en la información proporcionada
- Repositorio de código `PnPID_flower`: no disponible en la información proporcionada
- Paper de FLOWER: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
