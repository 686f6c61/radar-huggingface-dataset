# chennana1028/vjepa2-wam-sbint-ft-bighead

## Resumen

El modelo `chennana1028/vjepa2-wam-sbint-ft-bighead` es un Latent World-Action Model (WAM) basado en la arquitectura V-JEPA2, desarrollado por el investigador chennana1028 como un finetune del pretrain online de GigaData E2 sobre el conjunto de datos SB Int / OpenArm. Se trata de un modelo de robótica que combina un encoder visual ViT-G/16 con un cabezal de acción por flow-matching, diseñado para predecir y planificar movimientos de un brazo robótico a partir de observaciones visuales de múltiples cámaras. Con 895,65 millones de parámetros y una ventana de acción de 48 pasos, el modelo está orientado a tareas de manipulación en entornos reales o simulados, aprovechando el aprendizaje autosupervisado de video para entender la dinámica del mundo físico.

La relevancia de este modelo radica en su enfoque híbrido: utiliza representaciones latentes de video preentrenadas de forma autosupervisada (V-JEPA2) y las adapta mediante finetuning con datos de interacción robótica, lo que permite reducir la dependencia de grandes cantidades de datos etiquetados. El checkpoint publicado corresponde al paso 40000 de entrenamiento (~12 épocas con batch global de 96), e incluye tanto los pesos del modelo como la configuración completa del entrenamiento. La licencia Apache 2.0 facilita su uso en investigación y aplicaciones comerciales, aunque el modelo está pensado principalmente como un punto de partida para experimentación en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent World-Action Model (V-JEPA2) con encoder visual ViT-G/16 y cabezal de acción por flow-matching |
| Parametros totales | 895,65 M (visual_width 1024, action_width 1024, depth 30, heads 12) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo procesa secuencias de video, no texto; la ventana de acción es de 48 pasos) |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en precisión completa, sin cuantizaciones precalculadas) |
| Idiomas soportados | no disponible (modelo de robótica, no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoint `.pt` con state_dict, incluye metadatos de optimizador y scheduler) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura V-JEPA2, que combina un encoder de video autosupervisado con un módulo de predicción de acciones en un espacio latente. El encoder visual es un ViT-G/16 con resolución de entrada de 384 píxeles, procesando tres cámaras con center-crop. El cabezal de acción utiliza flow-matching con 10 pasos de denoise y un shift de 5.0, operando sobre un espacio de acción de 16 dimensiones (canvas) y generando chunks de 48 pasos de acción. El modelo emplea un `embodiment_id` fijo (2) que reutiliza el slot de AgileX, con `num_embodiment_ids=3`, lo que permite distinguir entre diferentes configuraciones robóticas.

El entrenamiento se realizó en dos fases: primero un pretrain online sobre el dataset GigaData E2 (inicialización `init_mode=sliced` desde el job 4466040), y posteriormente un finetuning sobre SB Int / OpenArm con un batch global de 96, ejecutado en 2 nodos Slurm (job 4480471). El checkpoint publicado corresponde al paso 40000, con una duración de aproximadamente 12 épocas. No se especifica el uso de RLHF o DPO; el entrenamiento se basa en pérdidas de predicción de video y acciones, típicas de los modelos de mundo-acción.

## Capacidades

- Predicción de acciones de robot: genera secuencias de 48 pasos de acción en un espacio de 16 dimensiones, adecuado para control de brazo robótico.
- Planificación en espacio latente: utiliza flow-matching para denoising iterativo, lo que permite generar trayectorias suaves y coherentes.
- Percepción multi-cámara: procesa simultáneamente tres cámaras con center-crop, lo que proporciona redundancia visual y robustez ante oclusiones.
- Aprendizaje autosupervisado de video: hereda representaciones visuales preentrenadas en grandes corpus de video, lo que mejora la generalización a entornos no vistos.
- Finetuning específico para OpenArm: adaptado al conjunto SB Int, que incluye tareas de manipulación con el brazo OpenArm.
- Evaluación open-loop: el modelo puede ejecutarse en modo de replanificación (replan=32) para corregir desviaciones durante la ejecución.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo OpenArm para tareas de pick-and-place, apilado o ensamblaje, utilizando las tres cámaras para localizar objetos y planificar trayectorias.
- Aprendizaje por demostración: dado un conjunto de trayectorias demostradas (SB Int), el modelo puede imitar comportamientos y generalizar a nuevas posiciones de objetos.
- Control predictivo en tiempo real: gracias al flow-matching con 10 pasos de denoise, el modelo puede generar acciones a una frecuencia suficiente para control en bucle cerrado, con replanificación cada 32 pasos.
- Investigación en world models: sirve como base para estudiar cómo los modelos de mundo aprendidos de video pueden transferirse a control de robots, comparando con el modelo base sin finetune.
- Simulación a real (sim-to-real): al estar entrenado con datos de OpenArm, puede evaluarse en simuladores y luego desplegarse en hardware real con ajustes mínimos.
- Benchmarking de modelos de acción: el checkpoint incluye métricas de evaluación open-loop (jitter y MAE) que permiten comparar la suavidad y precisión de las trayectorias generadas frente a otros modelos de la familia V-JEPA2.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación open-loop sobre los episodios ep36 y ep740, con pesos EMA y replanificación cada 32 pasos. Las métricas son jitter (relación entre la suavidad de las predicciones y la de las trayectorias reales) y MAE (error absoluto medio). Se muestran resultados para checkpoints intermedios (10k, 16k, 31k) pero no para el checkpoint final de 40k.

| Checkpoint | ep36 jitter | ep36 MAE | ep740 jitter | ep740 MAE |
|---|---|---|---|---|
| 10k | 1.17 | 0.0320 | 0.92 | 0.0363 |
| 16k | 1.13 | 0.0284 | 1.00 | 0.0199 |
| 31k | 1.13 | 0.0278 | 1.01 | 0.0135 |
| 40k (publicado) | — | — | — | — |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Los valores de jitter cercanos a 1.0 indican que las predicciones tienen una suavidad similar a las trayectorias reales, mientras que el MAE decreciente sugiere una mejora en precisión a lo largo del entrenamiento.

## Requisitos de hardware

- VRAM estimada: no se proporcionan datos oficiales. Con 895M parámetros en precisión FP32, el modelo requiere aproximadamente 3,6 GB solo para los pesos; en FP16 serían ~1,8 GB. Sin embargo, el procesamiento de video con ViT-G/16 y tres cámaras incrementa significativamente el consumo de memoria durante la inferencia.
- GPU recomendadas: para inferencia en tiempo real, se recomienda una GPU con al menos 16 GB de VRAM (p. ej., RTX 4090, A100 40GB). Para entrenamiento, el autor usó 2 nodos con GPUs de alta gama (no especificadas).
- Compatibilidad con GPUs de consumo: es posible ejecutar el modelo en una RTX 3090 o 4090 con FP16 y batch reducido, pero la latencia puede ser alta para control en tiempo real.
- Opciones de despliegue: al ser un checkpoint de PyTorch, puede cargarse con `torch.load` y ejecutarse en cualquier framework que soporte PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware y de la implementación del flujo de denoise (10 pasos).

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos de robótica. El modelo base V-JEPA2 (publicado por Meta AI) es el referente arquitectónico, pero no se han publicado resultados comparativos en la misma tarea. Se puede mencionar que el modelo finetuneado (`bighead`) se diferencia del checkpoint sin finetune (`vjepa2-latent-wam-sbint-ft`) por el uso de un cabezal de acción más grande (big action head), aunque no se especifican diferencias en rendimiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vjepa2-wam-sbint-ft-bighead (este) | 895,65 M | 48 pasos de acción | Apache 2.0 | HuggingFace |
| vjepa2-latent-wam-sbint-ft (sin bighead) | no disponible | no disponible | Apache 2.0 | HuggingFace |
| V-JEPA2 base (Meta) | no disponible | no disponible | no disponible | GitHub / HF |

## Limitaciones y advertencias

- El modelo es un snapshot de entrenamiento que incluye optimizador y scheduler; para despliegue se recomienda extraer solo `ckpt["model"]` y eliminar el prefijo `module.` si fue guardado con DDP.
- No se han documentado sesgos específicos, pero al estar entrenado con datos de un solo brazo robótico (OpenArm) y un conjunto de tareas limitado (SB Int), su generalización a otros robots o entornos es incierta.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir trayectorias no físicas o inestables, especialmente fuera de la distribución de entrenamiento. La evaluación open-loop muestra jitter >1.0 en algunos checkpoints, lo que indica predicciones menos suaves que las reales.
- Limitaciones de contexto: el modelo no procesa lenguaje natural ni instrucciones textuales; su entrada es exclusivamente visual (3 cámaras) y su salida son acciones de 16 dimensiones.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo depende de pesos preentrenados de V-JEPA2 (Meta AI) que pueden tener sus propias condiciones; se recomienda verificar la licencia del modelo base.
- Para producción, es necesario implementar un bucle de control con replanificación (replan=32) y validar la seguridad del robot, ya que el modelo no incluye mecanismos de detección de colisiones ni límites de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chennana1028/vjepa2-wam-sbint-ft-bighead
- Repo similar sin bighead: https://huggingface.co/chennana1028/vjepa2-latent-wam-sbint-ft
- Código de entrenamiento y evaluación (GitHub): https://github.com/zhujohn9604/vjepa2
- Repo oficial de V-JEPA2 (Meta AI): https://github.com/facebookresearch/vjepa2
- Paper de V-JEPA2: https://arxiv.org/abs/2506.09985
- PDF del paper: https://arxiv.org/pdf/2506.09985v1
