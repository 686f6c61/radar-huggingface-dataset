# helen9975/pi05_telearms_v5_exp_random_1000

## Resumen

`helen9975/pi05_telearms_v5_exp_random_1000` es un checkpoint de robótica basado en π₀.₅ (`lerobot/pi05_base`), el modelo vision-language-action (VLA) de Physical Intelligence distribuido a través de LeRobot. El autor, `helen9975`, ha realizado un fine-tune completo sobre el dataset `mliu48/telearms-yam-cube-v5-exp-random-1000`, compuesto por 10.000 demostraciones simuladas de manipulación bimanual con brazos YAM en 10 tareas distintas, con 9.488.515 fotogramas a 30 Hz y tres cámaras de 224×224 píxeles.

El modelo resuelve el problema de la política de control robótico de extremo a extremo: dado un conjunto de observaciones visuales y un prompt de tarea, predice secuencias de acciones (chunks de 50 pasos) para un robot bimanual. Es relevante porque forma parte de una familia de ocho experimentos v5 entrenados con la misma receta y el mismo presupuesto de muestras (15,36 M), lo que permite estudiar el efecto del número y la selección de demostraciones en el rendimiento de un VLA.

El checkpoint final corresponde al paso 30.000, con una pérdida de entrenamiento reciente de 0,023. Es un modelo de investigación: no se ha evaluado todavía en simulación y su licencia no está declarada, por lo que no debe considerarse listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π₀.₅ de Physical Intelligence, transformer con experto de acción; fine-tune completo (LLM + visión + experto de acción) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (chunks de acción de 50 pasos) |
| Tipos de cuantizacion | no disponible (entrenado en bf16) |
| Idiomas soportados | no disponible (prompts de tarea en el dataset; no se declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint de LeRobot, carpeta `pretrained_model/`) |

## Arquitectura y entrenamiento

El modelo parte de π₀.₅ (`lerobot/pi05_base`), un VLA que combina un modelo de lenguaje, un codificador visual y un experto de acción para generar trayectorias robóticas condicionadas por instrucciones en lenguaje natural y observaciones multimodales. En este caso se ha realizado un fine-tune completo de los tres componentes en bf16 con gradient checkpointing, sobre tres cámaras de 224×224 y acciones relativas con pinzas absolutas en chunks de 50 pasos.

El entrenamiento usó 8 GPU H100 en un nodo, batch de 64 por GPU (512 global), durante 30.000 pasos, lo que equivale a 15,36 M de muestras. Optimizador AdamW (β = 0,9 / 0,95, weight decay 0,01), LR pico de 1e-4 (2,5e-5 × sqrt(512/32)), 1.000 pasos de warmup y decaimiento coseno hasta 1e-5. El dataset contiene 10.000 demostraciones simuladas de 10 tareas (1.000 por tarea, seleccionadas al azar entre las exitosas con demo score y ELO de jugador), sin domain randomization y sin episodios de validación reservados, por lo que no existe validation loss. Se emplearon variantes de prompt por tarea (`meta/task_prompt_variants.json`).

## Capacidades

- Generación de políticas de control bimanual para robots YAM a partir de observaciones de tres cámaras y un prompt de tarea.
- Predicción de chunks de acción de 50 pasos con acciones relativas y pinzas absolutas.
- Ejecución de 10 tareas simuladas de manipulación (el dataset se denomina `cube`, pero la model card no detalla las tareas individuales).
- Condicionamiento por instrucciones en lenguaje natural mediante variantes de prompt por tarea.
- Integración con el ecosistema LeRobot 0.6.1 para entrenamiento e inferencia.
- No se declaran capacidades de tool calling, agentes, matemáticas, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en escalado de datos para VLA: comparar este checkpoint (Random-1000) con los otros siete experimentos v5 (Random-50/100/500/1500, Elo-1500, Score-1500, DemInf-1500) para medir el efecto del número y criterio de selección de demostraciones con el mismo presupuesto de 15,36 M de muestras.
- Reproducción de experimentos de fine-tune: la model card documenta la receta completa (hardware, hiperparámetros, versión de LeRobot y parches), lo que permite replicar el entrenamiento sobre el dataset público enlazado.
- Evaluación de políticas bimanuales en simulación: sirve como punto de partida para medir éxito por tarea en entornos simulados con brazos YAM, aunque el autor indica que aún no se ha evaluado.
- Estudio de selección de datos por ELO o score: al existir checkpoints hermanos entrenados con los mismos datos pero distinto criterio de selección, permite aislar el impacto del filtrado por calidad frente al muestreo aleatorio.
- Base para fine-tune en dominios específicos: al ser un fine-tune completo de π₀.₅, puede reutilizarse como inicialización para nuevas tareas de manipulación con la misma configuración de cámaras y robots.
- Análisis de pérdida y dinámica de entrenamiento: con pérdida final de 0,023 y curvas comparables entre los ocho runs, es útil para estudiar convergencia y estabilidad en VLA a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo aún no se ha evaluado en simulación y que no hay episodios de validación reservados, por lo que no existe validation loss ni métrica de éxito por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143 M de parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB. Estas cifras son estimaciones por tamaño y no están confirmadas por el autor.
- GPU recomendadas: el entrenamiento se realizó con 8 × H100 (un nodo). Para inferencia no se especifican GPU.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de pesos, en bf16 cabría en GPUs con 12-16 GB o más, pero no hay validación publicada.
- Opciones de despliegue: LeRobot 0.6.1 (con el parche del repositorio `tools/install_lerobot_patch.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dataset | Evaluación | Licencia |
|---|---|---|---|---|---|
| pi05_telearms_v5_exp_random_1000 (este) | 4.143 M | no disponible | 10.000 demos, 9,49 M frames | no evaluado en simulación | no disponible |
| helen9975/pi05_telearms_v5_exp_random_100 | no disponible | no disponible | 1.000 demos, 962.999 frames | no disponible | no disponible |
| lerobot/pi05_base | no disponible en la información | no disponible | base π₀.₅ | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación en simulación: no hay métricas de éxito ni validation loss, por lo que se desconoce su rendimiento real.
- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Entrenado únicamente en simulación y sin domain randomization, lo que limita la transferencia a robots físicos.
- Específico de la configuración bimanual YAM con tres cámaras de 224×224 y prompts de tarea concretos; no es un modelo general.
- Dataset de una sola distribución (cubo, 10 tareas) y sin episodios de validación, lo que impide medir sobreajuste.
- Riesgo de alucinación y de acciones fuera de distribución no cuantificado.
- Idiomas soportados no declarados; el condicionamiento lingüístico se limita a las variantes de prompt del dataset.
- Solo 2 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica escasa validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helen9975/pi05_telearms_v5_exp_random_1000
- Checkpoint hermano Random-100: https://huggingface.co/helen9975/pi05_telearms_v5_exp_random_100
- Dataset: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v5-exp-random-1000
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Código de entrenamiento: `helen9975/RoboEval-telearms`, rama `PI05_training` @ `9dc9e9f`
- LeRobot 0.6.1 @ `e40b58a8` con parche `tools/install_lerobot_patch.py`
