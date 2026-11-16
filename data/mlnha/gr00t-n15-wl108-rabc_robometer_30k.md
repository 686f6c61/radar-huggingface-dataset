# mlnha/gr00t-n15-wl108-rabc_robometer_30k

## Resumen

`mlnha/gr00t-n15-wl108-rabc_robometer_30k` es un checkpoint de investigación de robótica derivado de GR00T N1.5, el modelo fundacional visomotor-motor de NVIDIA para control de robots humanoides. Lo desarrolla el usuario independiente `mlnha` y no NVIDIA, y se publica como material de un estudio sobre el uso de estimadores de progreso aprendidos como señal de entrenamiento para clonación de comportamiento (behavior cloning, BC).

El modelo parte del checkpoint de preentrenamiento `RoboCasa GR00T-N1.5 pretraining-80000` y se ajusta con el método RA-BC (ARM) ponderado por Robometer-4B, un estimador de progreso de tarea, durante 30.000 pasos. Los datos de entrenamiento son 108 rollouts del propio GR00T (checkpoint-120000) sobre la tarea WashLettuce de RoboCasa365, de los cuales solo 34 son exitosos, lo que convierte el conjunto en un caso de aprendizaje con señal escasa y ruidosa.

Es relevante para investigadores que trabajan en robótica de manipulación con datos imperfectos: demuestra empíricamente cómo el reponderado por progreso aprendido permite extraer señal útil de trayectorias mayoritariamente fallidas. No es un modelo listo para producción: es un checkpoint de investigación de 37,9 GB con evaluación exclusivamente en simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.5 (modelo fundacional visomotor-motor para robots; detalles internos de la arquitectura no disponibles en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 37,9 GB; incluye `train.log` y `runs/` de TensorBoard) |

## Arquitectura y entrenamiento

El modelo se basa en GR00T N1.5, un modelo fundacional de NVIDIA para control de robots que combina percepción visual y generación de acciones motoras; la model card no detalla la arquitectura interna (transformer, mezcla de expertos o híbrida), por lo que ese dato no está disponible. El ajuste se realiza sobre el checkpoint de preentrenamiento de RoboCasa (`robocasa365_checkpoints`, paso 80000) y emplea el embodiment `new_embodiment`, lo que indica una adaptación a una nueva morfología o configuración de robot respecto al preentrenamiento.

El entrenamiento usa RA-BC (ARM) con ponderación por Robometer-4B, un estimador de progreso de tarea de 4.000 millones de parámetros que asigna pesos a cada transición según el avance estimado hacia el objetivo. Los datos son 108 rollouts de WashLettuce generados por el propio GR00T checkpoint-120000 en formato LeRobot v2.1, con solo 34 éxitos (31,5 %). La configuración es de 1 GPU, batch de 64, 30.000 pasos, learning rate 3e-5 con decaimiento coseno, warmup de 0,05 y semilla 42. No se incluyen estados del optimizador.

## Capacidades

- Generación de acciones motoras para manipulación robótica en el entorno RoboCasa365, específicamente la tarea WashLettuce (lavar lechuga).
- Control visomotor a partir de observaciones (el modelo consume imágenes y produce acciones; los detalles exactos de las modalidades de entrada no se documentan).
- Clonación de comportamiento ponderada por progreso: el entrenamiento incorpora señal de un estimador de progreso aprendido (Robometer-4B) para reponderar trayectorias.
- Adaptación a un nuevo embodiment (`new_embodiment`), lo que sugiere capacidad de transferencia a morfologías distintas del preentrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento explícito; al ser un modelo de robótica, estas capacidades no aplican en el sentido habitual.

## Casos de uso

- Investigación en clonación de comportamiento con datos imperfectos: el checkpoint sirve como referencia reproducible para estudiar cómo el reponderado por progreso aprendido (Robometer-4B) mejora el aprendizaje a partir de rollouts mayoritariamente fallidos (34 éxitos de 108).
- Evaluación de estimadores de progreso de tarea: permite comparar, en el simulador RoboCasa365, el efecto de distintos estimadores de progreso sobre la tasa de éxito final de una política entrenada.
- Reproducción de experimentos de RA-BC (ARM): con semilla, batch, learning rate y pasos documentados, otro equipo puede replicar el pipeline sobre el mismo conjunto `wl108`.
- Benchmark de políticas en simulación: el checkpoint puede actuar como línea base en la tarea WashLettuce con el protocolo de evaluación descrito (semillas 2000+, horizonte 1650) para comparar nuevas políticas.
- Estudio de transferencia de embodiment: al entrenarse con `new_embodiment`, es útil para analizar cómo se adapta un modelo preentrenado en RoboCasa a una configuración de robot distinta.
- Docencia y formación en robótica de manipulación: sirve como ejemplo completo de un ciclo de ajuste fino de un modelo fundacional robótico con datos reales de simulación, incluyendo logs de TensorBoard.

## Benchmarks y rendimiento

Los únicos resultados publicados son de éxito en simulación RoboCasa365 (split objetivo, semillas de escena 2000+, semilla de política 1, horizonte 1650, éxito medido al final del episodio):

| Checkpoint | Éxito en simulacion |
|---|---|
| checkpoint-10000 | no disponible |
| checkpoint-15000 | no disponible |
| checkpoint-20000 | 18/200 (semillas 2000–2199); 20/200 (semillas 2200–2399) |
| checkpoint-25000 | no disponible |
| checkpoint-30000 | 37/200 (semillas 2000–2199) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un modelo de robótica de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repo pesa 37,9 GB en safetensors, lo que da una cota inferior aproximada del espacio necesario para cargar los pesos en precisión nativa (sin contar activaciones ni buffers).
- GPU recomendadas: no documentadas. El entrenamiento se realizó con 1 GPU y batch de 64, lo que sugiere una GPU de gama alta (A100/H100 o similar), pero el autor no especifica el modelo.
- ¿Cabe en GPU de consumo? No confirmado. Con 37,9 GB de pesos, no cabría en GPUs de 24 GB (RTX 4090) sin cuantización o descarga parcial a CPU; no se documentan variantes cuantizadas.
- Opciones de despliegue: la librería declarada es `gr00t`, por lo que el despliegue esperado es mediante el stack de GR00T de NVIDIA. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Datos de ajuste | Éxito en simulacion | Licencia |
|---|---|---|---|---|---|
| `mlnha/gr00t-n15-wl108-rabc_robometer_30k` | GR00T N1.5 (pretraining-80000) | WashLettuce (RoboCasa365) | 108 rollouts, 34 exitos, RA-BC + Robometer-4B, 30k pasos | 37/200 (semillas 2000–2199) en checkpoint-30000 | no disponible |
| GR00T N1.5 base (pretraining-80000) | — | Control robótico general | Preentrenamiento RoboCasa | no disponible | no disponible |
| GR00T checkpoint-120000 (generador de `wl108`) | GR00T N1.5 | WashLettuce | — | no disponible (solo se sabe que generó los rollouts) | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con otras políticas o modelos de la misma categoría.

## Limitaciones y advertencias

- Checkpoint de investigación: no está pensado para producción ni para uso fuera del simulador RoboCasa365; no hay validación en robot real.
- Datos de entrenamiento muy limitados: 108 rollouts, de los cuales solo 34 son exitosos (31,5 %), lo que introduce ruido y sesgo hacia comportamientos parciales o fallidos.
- Evaluación restringida: los resultados (37/200 en el mejor checkpoint) corresponden a un único conjunto de semillas y a una sola tarea; la varianza entre semillas es apreciable (18/200 frente a 20/200 en el mismo checkpoint con semillas distintas).
- Licencia no disponible: no se puede confirmar el uso comercial; además, al derivar de GR00T N1.5 de NVIDIA, podrían aplicar restricciones de la licencia original, no documentadas aquí.
- Idiomas y contexto: no aplica ni se documenta; no es un modelo de lenguaje.
- Riesgo de sobreajuste a la tarea WashLettuce y al entorno de simulación; la transferencia a otras tareas o morfologías no está demostrada.
- No se incluyen estados del optimizador, lo que limita la reanudación exacta del entrenamiento.
- Sesgos conocidos: no documentados por el autor; en robótica, los sesgos provienen de la distribución de datos (aquí, mayoritariamente trayectorias fallidas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlnha/gr00t-n15-wl108-rabc_robometer_30k
- GR00T N1.5 (NVIDIA): no se proporciona enlace en la información disponible
- RoboCasa365: no se proporciona enlace en la información disponible
- Repositorio de checkpoints de RoboCasa (`robocasa365_checkpoints`): no se proporciona enlace en la información disponible
- Paper o blog del método RA-BC / Robometer-4B: no disponible en la información proporcionada
