# arkojit1/pi05_stack_yellow_on_red_bs64_20k_20k

## Resumen

π₀.₅ fine-tuneado sobre el dataset `Ameyapores/haply_stack_yellow_red` es un checkpoint de política robótica publicado por el usuario arkojit1 en HuggingFace. Se trata de un ajuste fino del modelo base `lerobot/pi05_base` (revisión `a538eb27`) mediante la librería LeRobot 0.4.4, orientado a una única tarea de manipulación: apilar un bloque amarillo sobre uno rojo con un brazo Franka. El modelo resuelve el problema de convertir observaciones visuales y de estado del robot en acciones de efector final, y resulta relevante como ejemplo reproducible de fine-tuning de π₀.₅ sobre un dataset pequeño (64 episodios) con un único expert entrenable.

Arquitectónicamente hereda la estructura de π₀.₅: un modelo vision-lenguaje-acción que combina un codificador visual SigLIP y un backbone de lenguaje Gemma-2B (ambos congelados durante el ajuste) con un "action expert" entrenable que genera trayectorias de acción mediante flow matching. El checkpoint tiene 3.616.757.520 parámetros totales y un tamaño de repositorio de 7,5 GB en formato safetensors.

El checkpoint publicado corresponde al paso 20.000 (42 épocas) de un entrenamiento planificado de 20.000 pasos, con una eval loss de 0,1768 sobre 7 episodios retenidos. El autor advierte explícitamente de que el modelo sobreajustó al final del entrenamiento (la mejor eval fue 0,1532 en el paso 3.000) y de que la eval loss no equivale a tasa de éxito en la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-acción π₀.₅ (SigLIP + Gemma-2B congelados + action expert entrenable, flow matching) |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence: un codificador visual SigLIP y un backbone de lenguaje Gemma-2B que permanecen congelados durante el ajuste fino, junto con un módulo "action expert" que es el único componente entrenable (`train_expert_only=true`). La política recibe tres imágenes (muñeca, escena 0 y escena 1), un estado de 4 dimensiones y genera acciones de delta de efector final de 4 dimensiones mediante flow matching, con `chunk_size=50` y `n_action_steps=50`.

El entrenamiento se realizó con LeRobot 0.4.4 sobre el dataset `Ameyapores/haply_stack_yellow_red` (revisión `cb14ebe`), compuesto por 64 episodios de Franka teleoperados con un dispositivo Haply, una única tarea ("Stack the yellow block on the red block."), estado de 4-D y acción de delta de efector final de 4-D. Se usaron 8 GPUs MI300X con batch global de 64, optimizador AdamW con LR pico 2,5e-5, betas (0,9, 0,95), weight decay 0,01, grad clip 1,0 y schedule coseno con warmup de 666 pasos, en precisión bf16. La normalización fue por cuantiles (q01–q99) para estado y acción, sin aumento de datos. Los episodios 0–56 se usaron para entrenamiento y los 57–63 (7 episodios) como conjunto de evaluación.

## Capacidades

- Generación de acciones de efector final de 4 dimensiones para un brazo Franka en una tarea concreta de apilado de bloques.
- Procesamiento multimodal de tres cámaras (`observation.images.wrist`, `observation.images.scene0`, `observation.images.scene1`), mapeadas a los slots `base_0_rgb`, `left_wrist_0_rgb` y `right_wrist_0_rgb` de π₀.₅.
- Condicionamiento por instrucción de lenguaje (una única tarea en el dataset: apilar el bloque amarillo sobre el rojo).
- Generación de trayectorias de acción en chunks de 50 pasos mediante flow matching.
- No se documentan capacidades de tool calling, agentes, multi-step reasoning general, visión genérica ni audio; el modelo está especializado en control robótico.

## Casos de uso

- Reproducción de experimentos de fine-tuning de π₀.₅: sirve como referencia de un pipeline completo (dataset, hiperparámetros, checkpoints) para investigadores que quieran replicar el ajuste sobre sus propios datasets de teleoperación.
- Evaluación de políticas robóticas en tareas de apilado: el checkpoint puede desplegarse en un Franka real o simulado para medir tasa de éxito en la tarea "stack yellow on red", aunque el autor no reporta esa métrica.
- Estudio de sobreajuste en políticas VLA con datasets pequeños: al publicarse el checkpoint final (paso 20.000) junto con la curva de eval (mínimo en el paso 3.000), permite analizar el comportamiento del sobreajuste en 64 episodios.
- Base para nuevos fine-tunings: al ser un ajuste de `pi05_base` con action expert entrenable, puede usarse como punto de partida para otras tareas de manipulación con configuraciones similares.
- Comparación de configuraciones de cámaras: el mapeo explícito de tres cámaras a los slots de π₀.₅ permite estudiar el impacto de la disposición visual en el rendimiento.
- Docencia y divulgación: ejemplo concreto de entrenamiento de un modelo VLA con LeRobot, útil para materiales formativos sobre robótica con aprendizaje profundo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Eval loss (flow matching, episodios 57–63) en paso 20.000 | 0,1768 |
| Mejor eval loss (paso 3.000) | 0,1532 |
| Train loss | 0,080 |
| Epocas completadas | 42,0 (20.000 pasos) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni tasa de éxito en la tarea en la información disponible. El autor advierte que la eval loss es una métrica del objetivo de entrenamiento sobre 7 episodios retenidos y no una tasa de éxito, y que diferencias de milésimas están dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3.616.757.520 parámetros en bf16 el peso ronda los 7,2 GB, por lo que se necesita al menos esa cantidad más memoria para activaciones y buffers de las tres cámaras.
- GPU recomendadas: el autor entrenó con 8 × AMD MI300X (8 por GPU, batch global 64); para inferencia se requiere una GPU con suficiente memoria para el modelo completo, típicamente A100, H100 o MI300X.
- ¿Cabe en GPU de consumo? No confirmado; con ~7,2 GB en bf16 podría caber en GPUs de 16 GB o más si el runtime lo permite, pero no se documenta.
- Opciones de despliegue: LeRobot 0.4.4 con el fork de `transformers` de HuggingFace para π₀ (rama `fix/lerobot_openpi`), cargando mediante `PI05Policy.from_pretrained`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkojit1/pi05_stack_yellow_on_red_bs64_20k_20k | 3,62 B | no disponible | Apilado de bloques (Franka) | no disponible | HuggingFace |
| lerobot/pi05_base | no disponible | no disponible | Política VLA general (base) | no disponible | HuggingFace |
| Otras políticas VLA (p. ej. OpenVLA, RT-2) | no disponible | no disponible | Manipulación general | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos en la información proporcionada; la comparación se limita a la relación de fine-tuning con `lerobot/pi05_base`.

## Limitaciones y advertencias

- Sobreajuste documentado: el autor indica que la eval loss subió de 0,1532 (paso 3.000) a ~0,175–0,18 al final, por lo que el checkpoint final no es el mejor del run.
- La eval loss no es una tasa de éxito en la tarea; no se reporta rendimiento real de manipulación.
- Dataset muy pequeño (64 episodios, una sola tarea) y sin aumento de datos, lo que limita la generalización.
- El modelo está especializado en una única instrucción ("Stack the yellow block on the red block.") y un robot Franka concreto; no es un modelo de propósito general.
- Requiere LeRobot 0.4.4 y un fork específico de `transformers`; la compatibilidad con otras versiones no está garantizada.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas no disponibles; el condicionamiento lingüístico se limita a la instrucción del dataset.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no aplica en el sentido habitual, pero puede generar acciones no válidas fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkojit1/pi05_stack_yellow_on_red_bs64_20k_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/Ameyapores/haply_stack_yellow_red
- Librería LeRobot: https://github.com/huggingface/lerobot
- Fork de transformers para π₀: rama `fix/lerobot_openpi` (no se proporciona URL directa)
