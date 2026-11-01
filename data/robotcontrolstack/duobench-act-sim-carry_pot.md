# RobotControlStack/duobench-act-sim-carry_pot

## Resumen

DuoBench ACT (sim) es una política de imitación basada en la arquitectura ACT (Action Chunking Transformer) publicada por RobotControlStack para el benchmark DuoBench de manipulación bimanual. El modelo está entrenado exclusivamente con datos de simulación para la tarea `carry_pot` sobre el montaje bimanual FR3 Duo, y se distribuye como un checkpoint de LeRobot listo para cargar con `ACTPolicy.from_pretrained`. Con 51.689.104 parámetros y un repositorio de 0,2 GB, es un modelo compacto orientado a investigación reproducible en robótica, no a despliegue en robot real.

Su relevancia es metodológica: forma parte de un conjunto de políticas de referencia que permiten comparar algoritmos de imitación bajo condiciones controladas (50 demostraciones por tarea, semilla fija, chunk de acción de 100) dentro de un benchmark con evaluación estandarizada en simulación y en el mundo real. La política consume tres cámaras (cabeza y dos muñecas) a 224x224 y un estado de 16 dimensiones, y produce una acción conjunta de 16 dimensiones (articulaciones y pinzas).

El modelo se entrenó desde cero con LeRobot en un commit concreto (`c8ce413d`), lo que implica que la compatibilidad de carga depende de esa versión de la librería. La licencia Apache 2.0 facilita su reutilización y extensión en pipelines de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) |
| Parametros totales | 51.689.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; chunk de acción de 100 pasos) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada/salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder diseñado para imitación visomotora que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza el control. La política recibe como entrada las imágenes de tres cámaras (`head`, `left_wrist`, `right_wrist`) a resolución 224x224 junto con un vector de estado de 16 dimensiones (2 x 7 articulaciones más 2 pinzas) y emite un vector de acción de 16 dimensiones. El chunk de acción configurado es de 100 pasos.

El entrenamiento se realizó desde cero con LeRobot (commit `c8ce413d738da15a2eed2d0832315779ea28cbf9`) sobre 50 demostraciones por tarea extraídas de las carpetas `<task>/sim` del dataset `RobotControlStack/duobench`. Hiperparámetros: 150.000 pasos, batch size 64, learning rate 1e-5 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni aumentos de datos adicionales; la configuración completa está en `train_config.json` del repositorio.

## Capacidades

- Control bimanual de manipulación en simulación para la tarea `carry_pot` con el montaje FR3 Duo.
- Política de imitación de una sola tarea (single-task); no generaliza a otras tareas sin reentrenamiento.
- Fusión de percepción multi-cámara: cámara de cabeza más dos cámaras de muñeca.
- Predicción de chunks de acción de 100 pasos, lo que permite control temporalmente coherente.
- Salida de acciones conjuntas de 16 dimensiones (articulaciones y pinzas).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera del pipeline robótico.

## Casos de uso

- Baseline reproducible en investigación de imitación bimanual: sirve como referencia ACT dentro de DuoBench para comparar nuevos algoritmos bajo el mismo protocolo de 50 demostraciones y semilla fija.
- Evaluación de algoritmos de chunking de acciones: permite medir el efecto del chunk de 100 pasos frente a políticas que predicen acciones individuales en tareas de manipulación.
- Estudio de percepción multi-cámara: al usar tres vistas (cabeza y muñecas), es útil para analizar la contribución de cada cámara mediante ablaciones.
- Desarrollo de pipelines de simulación a real: aunque no está pensado para el robot real, sirve como punto de partida para experimentos de transferencia sim-to-real con fine-tuning sobre datos reales.
- Docencia y formación en robótica: su tamaño compacto (51,7 M de parámetros, 0,2 GB) y su licencia Apache 2.0 lo hacen adecuado para prácticas de aprendizaje por imitación.
- Validación de infraestructura LeRobot: útil para verificar instalaciones, versiones y flujos de carga de políticas con `ACTPolicy.from_pretrained` en entornos de CI.
- Reproducción de resultados del benchmark: permite replicar la tasa de éxito publicada de 54,0 % sobre 300 rollouts con semillas 0-299.

## Benchmarks y rendimiento

Resultados publicados en la model card para la simulación de DuoBench, 300 rollouts por tarea (semillas 0-299) con intervalo de Wilson al 95 %:

| Tarea | Tasa de éxito (%) | IC 95 % |
|---|---|---|
| carry_pot | 54,0 | [48,3, 59,6] |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de texto, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,689 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la huella de memoria es muy reducida y el cuello de botella es el procesamiento de las tres cámaras a 224x224.
- GPU recomendadas: cualquier GPU con soporte CUDA suficiente para LeRobot; una RTX 3090, RTX 4090, A100 o H100 son opciones holgadas para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con al menos unos pocos GB de VRAM, dado el tamaño del checkpoint.
- Opciones de despliegue: LeRobot en el commit `c8ce413d` mediante `ACTPolicy.from_pretrained`; el ecosistema de simulación de DuoBench para evaluación.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos comparables (por ejemplo, otras políticas ACT o Diffusion Policy del mismo benchmark) con parámetros, contexto y rendimiento verificables. Se indica, por tanto, como no disponible.

| Modelo | Parámetros | Contexto | Tasa de éxito (carry_pot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuoBench ACT (sim) | 51.689.104 | no aplica (chunk de 100) | 54,0 % (IC 95 % [48,3, 59,6]) | apache-2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de simulación; el propio autor advierte que no está pensado para el robot real.
- Política de una sola tarea (`carry_pot`); no generaliza a otras tareas del benchmark sin reentrenamiento.
- Requiere una versión de LeRobot compatible con el commit `c8ce413d`; otras versiones pueden fallar al cargar.
- Riesgo de sobreajuste a las condiciones de simulación (iluminación, texturas, física) y baja robustez ante variaciones del mundo real.
- Tasa de éxito moderada (54,0 %), con intervalo de confianza que abarca aproximadamente del 48 % al 60 %; no es adecuada para aplicaciones que exijan alta fiabilidad.
- No se documentan sesgos específicos ni riesgos de alucinación en el sentido de modelos de lenguaje; el riesgo análogo es la ejecución de acciones incorrectas en el robot.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de garantías y la limitación a simulación deben tenerse en cuenta en producción.
- No se especifican limitaciones idiomáticas ni de contexto al no manejar texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotControlStack/duobench-act-sim-carry_pot
- Dataset DuoBench: https://huggingface.co/datasets/RobotControlStack/duobench
- Paper DuoBench: https://arxiv.org/abs/2606.11901
- Página del proyecto: https://duobench.github.io/
- Código DuoBench: https://github.com/RobotControlStack/duobench
- LeRobot (commit de entrenamiento): https://github.com/huggingface/lerobot/tree/c8ce413d738da15a2eed2d0832315779ea28cbf9
