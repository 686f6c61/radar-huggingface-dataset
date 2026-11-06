# prachigarg23/pi05_FAST_robotwin_post_training_ES_SS

## Resumen

`pi05_FAST_robotwin_post_training_ES_SS` es un checkpoint de un modelo vision-language-action (VLA) desarrollado por Prachi Garg y colaboradores (Steve Xing, Prahit Yaugand, Saurabh Gupta, Derek Hoiem) en el contexto del artículo *Fine-Tuning VLAs with Self-Demonstrated Generative Control for Multi-Task Manipulation* (arXiv:2608.19490). El modelo parte de π0.5 con tokenización FAST y se ha afinado sobre tareas de manipulación robótica multi-tarea del benchmark RoboTwin, concretamente las tareas de apilado de bloques (stack-blocks) de la etapa 2.

La contribución principal del trabajo es una receta de post-entrenamiento que combina demostraciones expertas con auto-demonstraciones generadas por la propia política de mid-training (mezcla 1:1), etiquetada como ES+SS. El checkpoint se construye por fine-tuning a partir de `pi05_FAST_robotwin_mid_training`, en el paso 5999, y se distribuye en formato nativo de la librería `openpi` con un tamaño de repositorio de 12,4 GB.

Es relevante para investigadores en robótica y aprendizaje por imitación que quieran reproducir o extender recetas de auto-supervisión sobre VLAs, ya que publica tanto los pesos como los datasets de demostraciones expertas y auto-demonstraciones, junto con el código de evaluación sobre el simulador RoboTwin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 con tokenización FAST |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en precisión nativa de `openpi`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint nativo de `openpi` (no se especifican safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre π0.5, un modelo que combina un backbone vision-language con un cabezal de acción generativo. En este checkpoint se emplea la variante con tokens FAST, un esquema de tokenización de acciones que permite tratar las trayectorias motoras como secuencias discretas generadas por el modelo de lenguaje subyacente. El checkpoint se inicializa desde `pi05_FAST_robotwin_mid_training` y se afina durante 5999 pasos (sin estado del optimizador en el repositorio).

El entrenamiento de post-entrenamiento utiliza una mezcla 1:1 entre demostraciones expertas de las tareas de apilado de bloques de la etapa 2 (`robotwin_post_training_stack_blocks_expert`) y auto-demonstraciones generadas por la política de mid-training (`robotwin_self_demos`). Esta combinación ES+SS (expert self-demonstrations + self-supervision) es la innovación metodológica del trabajo: aprovecha la política intermedia para generar datos adicionales de control y complementar la señal de las demostraciones humanas. Las estadísticas de normalización asociadas se encuentran en `assets/prachigarg23/robotwin_mid_training_expert/norm_stats.json`. No se detalla en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Control robótico de manipulación multi-tarea en el simulador RoboTwin, específicamente en tareas de apilado de bloques (stack-blocks) de la etapa 2.
- Generación de acciones motoras condicionadas por observaciones visuales e instrucciones de tarea, mediante tokenización FAST.
- Aprendizaje por imitación a partir de demostraciones expertas y auto-demonstraciones.
- Evaluación con horizonte de ejecución configurable (el ejemplo de la model card usa `--exec_horizon 25`).
- Integración con el ecosistema `openpi` para carga y despliegue del checkpoint.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso explícito, multilingüismo, visión general, audio ni modos de pensamiento.

## Casos de uso

- Reproducción de experimentos de auto-supervisión en robótica: el checkpoint permite replicar los resultados del artículo sobre RoboTwin ejecutando `run_test_tasks.py` con las mismas configuraciones y comparar contra las variantes sin auto-demonstraciones.
- Investigación en aprendizaje por imitación con datos sintéticos: sirve como punto de partida para estudiar cómo las auto-demonstraciones de una política intermedia afectan a la generalización en tareas de manipulación multi-tarea.
- Benchmarking de VLAs en simulación: al estar integrado en RoboTwin, se puede usar para comparar recetas de post-entrenamiento sobre una misma base π0.5 y aislar el efecto de la mezcla ES+SS.
- Desarrollo de pipelines de evaluación de políticas: el comando de ejemplo con `--exec_horizon 25` y `--log_dir` facilita la integración en scripts de evaluación automatizada con registro de resultados.
- Estudio de tokenización FAST para acciones: el checkpoint permite analizar el comportamiento de la generación discreta de trayectorias frente a otras parametrizaciones de la cabeza de acción.
- Base para fine-tuning en tareas downstream del mismo benchmark: al estar afinado sobre tareas de apilado, puede servir como inicialización para nuevas tareas de manipulación dentro del mismo entorno simulado.
- Docencia y divulgación: al publicarse pesos, datasets y código, es un recurso didáctico para explicar recetas de post-entrenamiento de VLAs con datos auto-generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de métricas (tasa de éxito, MMLU, HumanEval, GSM8K ni equivalentes en robótica); remite al artículo arXiv:2608.19490 y al repositorio de RoboTwin para los resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, lo que da una cota inferior del espacio en disco necesario; la VRAM dependerá del tamaño real de π0.5 y del esquema de precisión empleado, datos no publicados en la información disponible.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `CUDA_VISIBLE_DEVICES=0`, lo que indica ejecución en una única GPU, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la vía documentada es la librería `openpi` junto con el repositorio `self-supervised-control-robotwin` y el simulador RoboTwin. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un VLA con salida de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05_FAST_robotwin_post_training_ES_SS` | no disponible | no disponible | no disponible (ver paper) | Apache 2.0 | Pesos en Hugging Face, código en GitHub |
| `pi05_FAST_robotwin_mid_training` | no disponible | no disponible | no disponible | no disponible | Pesos en Hugging Face (checkpoint base) |
| π0.5 (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Otros VLAs para RoboTwin | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa documentada es con el checkpoint de mid-training del que deriva, que actúa como inicialización del fine-tuning. No se dispone de datos de rendimiento ni de parámetros para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El checkpoint está especializado en tareas de apilado de bloques de la etapa 2 del benchmark RoboTwin; no se documenta su comportamiento fuera de ese dominio simulado.
- No se han publicado métricas de rendimiento en la información disponible, por lo que no es posible evaluar su calidad sin ejecutar la evaluación del repositorio.
- El repositorio no incluye estado del optimizador (paso 5999), lo que limita la reanudación exacta del entrenamiento.
- El modelo depende de las estadísticas de normalización en `assets/prachigarg23/robotwin_mid_training_expert/norm_stats.json`; su ausencia o desajuste puede degradar la inferencia.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas, aunque al ser un VLA orientado a acciones estos conceptos no aplican de forma directa.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye para investigación en simulación; no se aportan garantías de transferencia a robots reales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria documentada.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prachigarg23/pi05_FAST_robotwin_post_training_ES_SS
- Checkpoint base (mid-training): https://huggingface.co/prachigarg23/pi05_FAST_robotwin_mid_training
- Dataset de demostraciones expertas: https://huggingface.co/datasets/prachigarg23/robotwin_post_training_stack_blocks_expert
- Dataset de auto-demonstraciones: https://huggingface.co/datasets/prachigarg23/robotwin_self_demos
- Artículo: https://arxiv.org/abs/2608.19490
- Página del proyecto: https://self-supervised-control.pages.dev/
- Código: https://github.com/prachigarg23/self-supervised-continual-control
- Código de RoboTwin: https://github.com/prachigarg23/self-supervised-control-robotwin
- README de RoboTwin: https://github.com/prachigarg23/self-supervised-control-robotwin/blob/main/README.md
