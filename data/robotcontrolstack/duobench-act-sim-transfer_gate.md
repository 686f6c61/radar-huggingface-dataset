# RobotControlStack/duobench-act-sim-transfer_gate

## Resumen

DuoBench ACT (sim) es una política de imitación basada en ACT (Action Chunking with Transformers) para el montaje bimanual FR3 Duo del benchmark DuoBench. La desarrolla el grupo RobotControlStack y está entrenada exclusivamente con datos de simulación para la tarea `transfer_gate`, una política de tarea única que aprende a transferir una pieza a través de una compuerta con dos brazos Franka Research 3.

El modelo resuelve el problema de disponer de un punto de partida reproducible para experimentos de manipulación bimanual en simulación: proporciona pesos preentrenados con 50 demostraciones por tarea, un protocolo de entrenamiento documentado (150.000 pasos, batch 64, learning rate 1e-5, action chunk 100) y métricas de éxito con intervalos de confianza Wilson al 95 % sobre 300 rollouts. Su relevancia radica en que forma parte de un benchmark diseñado para evaluar la transferencia sim-a-real de forma controlada.

Técnicamente es un transformer de ~51,7 millones de parámetros que consume tres cámaras (head, left_wrist, right_wrist) a 224x224 y un vector de estado de 16 dimensiones (2 x 7 articulaciones + 2 pinzas), y produce una acción de 16 dimensiones. Los pesos se distribuyen en safetensors dentro de la librería LeRobot, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación |
| Parametros totales | 51.689.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa observaciones por paso y action chunk de 100) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es una política de imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error acumulado y suaviza la ejecución. El modelo procesa tres flujos visuales de 224x224 (cámara de cabeza y dos cámaras de muñeca) junto con un estado propioceptivo de 16 dimensiones, y emite un vector de acción de 16 dimensiones correspondiente a las articulaciones y pinzas de los dos brazos FR3. El chunk de acción configurado es de 100 pasos.

El entrenamiento se realizó desde cero con LeRobot (commit `c8ce413d738da15a2eed2d0832315779ea28cbf9`) sobre 50 demostraciones por tarea extraídas de las carpetas `<task>/sim` del dataset `RobotControlStack/duobench`. La configuración es de 150.000 pasos, batch size 64, learning rate 1e-5 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni etapas de refinamiento posteriores; se trata de aprendizaje por imitación supervisado sobre datos simulados.

## Capacidades

- Manipulación bimanual en simulación: control coordinado de dos brazos FR3 con pinzas para la tarea `transfer_gate`.
- Percepción visual multi-cámara: integra vistas de cabeza y de ambas muñecas para estimar la posición relativa de la pieza y la compuerta.
- Predicción de acciones en chunks de 100 pasos, con salida de 16 dimensiones (articulaciones y pinzas).
- Política de tarea única: no generaliza a otras tareas del benchmark sin reentrenamiento.
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- Sin capacidades multilingües, de visión general, audio o thinking mode.

## Casos de uso

- Reproducción de resultados de DuoBench: cargar la política con `ACTPolicy.from_pretrained` y ejecutar los 300 rollouts por semilla (0-299) para verificar la tasa de éxito del 42,7 % reportada.
- Línea base para investigación en manipulación bimanual: usar estos pesos como referencia contra la que comparar nuevas políticas (diffusion policy, VLA, etc.) en la misma tarea y protocolo.
- Estudio de transferencia sim-a-real: emplear la política entrenada solo en simulación como extremo "sim-only" de la comparativa frente a políticas entrenadas con datos reales o mixtos.
- Ablaciones de datos de entrenamiento: reentrenar con distinto número de demostraciones (partiendo de las 50 por tarea) y medir el efecto en la tasa de éxito con el mismo pipeline de LeRobot.
- Depuración de entornos de simulación: validar que el entorno `transfer_gate` de DuoBench está correctamente configurado si la política reproduce la tasa de éxito esperada.
- Docencia y divulgación: ejemplo completo y reproducible de un pipeline de imitación (dataset, configuración de entrenamiento, evaluación con intervalos de confianza) para cursos de robótica.

## Benchmarks y rendimiento

Resultados publicados en la model card para simulación DuoBench, sobre 300 rollouts por tarea (semillas 0-299) con intervalo de confianza Wilson al 95 %:

| Tarea | Tasa de éxito (%) | IC 95 % |
|---|---|---|
| transfer_gate | 42,7 | [37,2; 48,3] |

No se han publicado en la información disponible resultados comparativos con otras políticas en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors, el peso de los pesos es de aproximadamente 0,2 GB en precisión de entrenamiento, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM libre debería bastar, aunque la latencia depende del renderizado de la simulación, no solo de la política.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; el cuello de botella real es el simulador.
- Opciones de despliegue: LeRobot en el commit `c8ce413d` (requisito indicado por el autor); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuoBench ACT (sim) `transfer_gate` | 51,7 M | action chunk 100 | transfer_gate (bimanual FR3) | Apache 2.0 | Hugging Face, LeRobot |
| Otras políticas de DuoBench | no disponible | no disponible | resto de tareas del benchmark | no disponible | no disponible en la información proporcionada |
| Políticas ACT genéricas de LeRobot | variable | variable | tareas Aloha, etc. | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre esta política y alternativas en la misma tarea dentro de la información proporcionada.

## Limitaciones y advertencias

- Entrenada solo con datos de simulación: el autor indica explícitamente que no está pensada para el robot real.
- Política de tarea única: no cubre otras tareas de DuoBench ni escenarios fuera de `transfer_gate`.
- Requiere una versión de LeRobot compatible con el commit `c8ce413d`; versiones distintas pueden fallar al cargar.
- La tasa de éxito del 42,7 % implica que más de la mitad de los rollouts fallan; no es adecuada como solución de producción.
- Riesgo de sobreajuste a la distribución de las 50 demostraciones simuladas y a la semilla de entrenamiento (1000).
- Sin información sobre sesgos, robustez a cambios de iluminación, texturas o dinámica del simulador más allá de lo reportado.
- Licencia Apache 2.0 permite uso comercial, pero la limitación a simulación y el bajo rendimiento hacen inviable un despliegue comercial directo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RobotControlStack/duobench-act-sim-transfer_gate
- Dataset DuoBench: https://huggingface.co/datasets/RobotControlStack/duobench
- Paper (arXiv): https://arxiv.org/abs/2606.11901
- Página del proyecto: https://duobench.github.io/
- Código de DuoBench: https://github.com/RobotControlStack/duobench
- LeRobot (commit usado): https://github.com/huggingface/lerobot/tree/c8ce413d738da15a2eed2d0832315779ea28cbf9
- LeRobot: https://github.com/huggingface/lerobot
