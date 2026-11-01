# RobotControlStack/duobench-act-sim-block_balance

## Resumen

DuoBench ACT (sim) es una política de imitación basada en la arquitectura ACT (Action Chunking Transformer) entrenada por RobotControlStack para la tarea `block_balance` del benchmark DuoBench, un entorno de manipulación bimanual con dos brazos FR3 en simulación. El modelo consume tres cámaras (cabeza y dos muñecas) a 224x224 y un vector de estado de 16 dimensiones (2 x 7 articulaciones más 2 pinzas), y produce una acción conjunta de 16 dimensiones. Es una política de tarea única, entrenada desde cero con LeRobot sobre 50 demostraciones simuladas.

Con 51,7 millones de parámetros y un repositorio de 0,2 GB, es un modelo pequeño orientado a evaluación reproducible de métodos de imitación bimanual, no a despliegue en robot real. Su relevancia radica en formar parte de un benchmark abierto (DuoBench) que busca estandarizar la comparación de políticas de manipulación bimanual en simulación y en el mundo real.

La ficha refleja un modelo de investigación con resultados publicados muy limitados: el propio autor reporta una tasa de éxito del 0,0 % en la tarea para la que fue entrenado, lo que lo convierte en una referencia de línea base más que en una política utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación |
| Parametros totales | 51.689.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de robot con horizonte de acción de 100 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo es una política ACT, un transformer encoder-decoder con decodificación de trozos de acción (action chunking) que predice secuencias de acciones de longitud fija (chunk de 100) a partir de observaciones visuales y propioceptivas. Las entradas son tres cámaras (`head`, `left_wrist`, `right_wrist`) a resolución 224x224 y un estado de 16 dimensiones compuesto por 2 x 7 articulaciones más 2 pinzas; la salida es un vector de 16 dimensiones de articulaciones y pinzas.

El entrenamiento se realizó desde cero con LeRobot (commit `c8ce413d738da15a2eed2d0832315779ea28cbf9`) sobre 50 demostraciones por tarea extraídas de las carpetas `<task>/sim` del dataset DuoBench. Se ejecutaron 150.000 pasos con batch size 64, learning rate 1e-5, action chunk 100 y semilla 1000. La configuración completa está en `train_config.json`. No se documenta uso de RLHF, DPO ni innovaciones adicionales más allá del propio esquema de action chunking de ACT.

## Capacidades

- Generación de acciones de control bimanual de 16 dimensiones (articulaciones y pinzas) para el setup FR3 Duo.
- Percepción visual multimodal a partir de tres cámaras (cabeza y dos muñecas) a 224x224.
- Política de tarea única: especializada exclusivamente en `block_balance`.
- Ejecución en simulación dentro del benchmark DuoBench.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües ni de generación de texto.
- Sin modo de pensamiento (thinking), visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Línea base en investigación de imitación bimanual: sirve como referencia mínima contra la que comparar nuevas políticas ACT o métodos alternativos en la tarea `block_balance` de DuoBench.
- Reproducción de experimentos: al publicarse la configuración de entrenamiento (`train_config.json`), semilla y commit de LeRobot, permite replicar exactamente el pipeline y verificar resultados.
- Evaluación de robustez de políticas de imitación: su tasa de éxito del 0,0 % lo hace útil para estudiar modos de fallo en tareas de equilibrio de bloques con dos brazos.
- Desarrollo de infraestructura de evaluación: se integra con el código de DuoBench para lanzar rollouts automatizados (300 por tarea, semillas 0-299) y calcular intervalos de confianza de Wilson.
- Estudio de action chunking: permite analizar el efecto del horizonte de 100 pasos en tareas de contacto bimanual.
- Docencia y formación: ejemplo didáctico de entrenamiento de una política ACT con LeRobot sobre un dataset público de demostraciones simuladas.
- No es adecuado para despliegue en robot real ni para producción, según indica el propio autor.

## Benchmarks y rendimiento

Resultados publicados por el autor en simulación DuoBench, 300 rollouts por tarea (semillas 0-299), intervalo de confianza de Wilson al 95 %:

| Tarea | Tasa de éxito (%) | IC 95 % |
|---|---|---|
| block_balance | 0.0 | [0.0, 1.3] |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 millones de parámetros en fp32 el peso ocupa aproximadamente 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 3060 o superior es más que suficiente. Para entrenamiento desde cero con batch 64 y tres cámaras a 224x224 se recomienda una GPU con 16-24 GB (RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 4 GB o más de VRAM para inferencia.
- Opciones de despliegue: LeRobot (requiere una versión compatible con el commit `c8ce413d`), con `ACTPolicy.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos comparables (parámetros, contexto, rendimiento, licencia o disponibilidad) para construir una comparativa fiable. Las políticas ACT de LeRobot son la familia natural de comparación, pero no se han facilitado cifras concretas de alternativas.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuoBench ACT (sim) block_balance | 51,7 M | no aplica | 0,0 % éxito (IC 95 % [0,0, 1,3]) | apache-2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de simulación; el autor indica explícitamente que no está pensado para el robot real.
- Tasa de éxito del 0,0 % en la tarea para la que fue entrenado, con intervalo de confianza que no supera el 1,3 %; no es utilizable como política funcional.
- Política de tarea única: no generaliza a otras tareas de DuoBench ni a otros entornos.
- Requiere una versión de LeRobot compatible con el commit `c8ce413d738da15a2eed2d0832315779ea28cbf9`; versiones distintas pueden fallar al cargar.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto), pero sí existe riesgo de acciones erráticas o no físicamente plausibles fuera de la distribución de entrenamiento.
- Sesgos conocidos: no documentados; al entrenarse solo con 50 demostraciones simuladas, la política hereda cualquier sesgo de esas trayectorias y del simulador.
- Licencia apache-2.0: permite uso comercial, pero el modelo no es apto para producción por sus resultados y su naturaleza simulada.
- Sin soporte multilingüe ni de lenguaje natural; no debe evaluarse con métricas de NLP.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotControlStack/duobench-act-sim-block_balance
- Dataset DuoBench: https://huggingface.co/datasets/RobotControlStack/duobench
- Paper DuoBench (arXiv): https://arxiv.org/abs/2606.11901
- Página del proyecto DuoBench: https://duobench.github.io/
- Código DuoBench: https://github.com/RobotControlStack/duobench
- LeRobot (commit de entrenamiento): https://github.com/huggingface/lerobot/tree/c8ce413d738da15a2eed2d0832315779ea28cbf9
- Repositorio LeRobot: https://github.com/huggingface/lerobot
