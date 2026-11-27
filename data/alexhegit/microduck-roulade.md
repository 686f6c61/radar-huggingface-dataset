# alexhegit/microduck-roulade

## Resumen

Microduck-roulade es una política de control para robot caminante (locomoción) publicada por el usuario alexhegit en Hugging Face. Se trata de un modelo de aprendizaje por refuerzo, no de un modelo de lenguaje: recibe 61 observaciones del estado del robot y emite 14 objetivos de posición articular a 50 Hz, con el objetivo de ejecutar una voltereta hacia delante (roulade) y volver a ponerse de pie. Está afinado a partir de la política `roulade` del proyecto upstream microduck_rl.

El modelo se enmarca en el evento `got-a-talent` de la Microduck Arena, una competición de controladores para el robot Microduck de Pollen Robotics. La política se entrenó con PPO sobre el simulador MuJoCo mediante el framework microduck_rl_unilab, ejecutado en una GPU AMD con ROCm. El artefacto se distribuye en formato ONNX y con licencia Apache 2.0.

La relevancia es acotada: es un modelo de nicho para robótica de bajo coste, con cero descargas y cero likes en el momento de la consulta, y un repositorio de tamaño prácticamente nulo (0.0 GB), lo que sugiere pesos muy ligeros o que el artefacto no está efectivamente alojado. No dispone de información sobre idiomas, benchmarks ni parámetros en el sentido de un transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) para control robótico; arquitectura de red no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 valores de estado |
| Tipos de cuantizacion | no disponible; se distribuye en ONNX (posible cuantización ONNX no documentada) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Frecuencia de control | 50 Hz |
| Entradas / salidas | 61 observaciones / 14 objetivos de posición articular |
| Simulador de entrenamiento | MuJoCo (microduck_rl_unilab) |
| Hardware de entrenamiento | GPU AMD con ROCm |

## Arquitectura y entrenamiento

No se detalla la arquitectura de red de la política en la información disponible. Por el contexto (PPO sobre MuJoCo, control de un robot caminante de pequeño tamaño), se trata de una política de control continuo que mapea un vector de 61 observaciones a 14 objetivos de posición articular, ejecutada a 50 Hz. El entrenamiento se realizó con Proximal Policy Optimization (PPO) en el simulador MuJoCo, usando el framework microduck_rl_unilab, y se ejecutó en una GPU AMD con ROCm.

El modelo es un fine-tune de la política `roulade` del proyecto upstream microduck_rl. Según la model card, ejecuta una voltereta completa desde la posición de pie y vuelve a levantarse. No se especifican número de pasos de entrenamiento, composición del dataset de simulación, técnicas de domain randomization ni detalles de la función de recompensa.

## Capacidades

- Control de locomoción: ejecuta una voltereta hacia delante (roulade) y recupera la posición erguida.
- Control continuo a 50 Hz con 14 salidas de posición articular.
- Procesamiento de 61 observaciones de estado del robot por paso de control.
- Desplegable mediante runtime ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Demostración en la Microduck Arena: la política está diseñada específicamente para el evento `got-a-talent`, donde se evalúa la habilidad de la voltereta en el robot Microduck.
- Investigación en aprendizaje por refuerzo para robótica: sirve como referencia de un pipeline PPO + MuJoCo reproducible para entrenar políticas de locomoción en robots de bajo coste.
- Pruebas de simulación a realidad: al estar en ONNX, puede integrarse en un runtime de inferencia para validar la transferencia de la política del simulador al robot físico.
- Benchmark de entrenamiento en ROCm: ejemplo de entrenamiento de políticas con PPO sobre GPU AMD, útil para comparar el stack ROCm frente a CUDA en cargas de RL.
- Base para fine-tuning de habilidades: al ser un fine-tune de `roulade`, puede servir de punto de partida para entrenar otras acrobacias o transiciones de postura.
- Docencia y prototipado: modelo ligero para ilustrar el ciclo completo observación-acción en control robótico con MuJoCo y ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y el modelo es una política de control de muy baja complejidad, por lo que se espera que quepa en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no disponible. Para entrenamiento se usó una GPU AMD con ROCm; para inferencia basta un runtime ONNX en CPU o GPU.
- GPU consumer: previsiblemente sí, dado el tamaño mínimo del artefacto, aunque no hay datos confirmados.
- Opciones de despliegue: ONNX Runtime (CPU o GPU); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el bucle de control opera a 50 Hz, lo que exige inferencia por debajo de 20 ms por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Licencia | Disponibilidad |
|---|---|---|---|---|
| microduck-roulade (alexhegit) | Política RL (PPO) para Microduck | 61 obs. / 14 articulaciones a 50 Hz | Apache 2.0 | Hugging Face, ONNX |
| roulade (upstream microduck_rl) | Política RL base | no disponible | no disponible | Repositorio microduck_rl |
| Otras políticas de la Microduck Arena | Políticas RL para Microduck | no disponible | variable | Hugging Face Spaces |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes; no hay evidencia de validación por terceros.
- El repositorio ocupa 0.0 GB, por lo que no está confirmado que los pesos ONNX estén efectivamente alojados y sean descargables.
- No se documenta la arquitectura de red, el número de parámetros ni la composición del entrenamiento, lo que dificulta la reproducibilidad.
- Entrenado en simulación (MuJoCo); el rendimiento en el robot físico puede degradarse por la brecha simulación-realidad (sim-to-real gap).
- Diseñado específicamente para el robot Microduck y la tarea de voltereta; no es generalizable a otros robots o habilidades sin reentrenamiento.
- Sin datos de sesgos, alucinación o comportamiento en condiciones fuera de distribución.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexhegit/microduck-roulade
- Microduck Arena (evento got-a-talent): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio de entrenamiento microduck_rl_unilab: https://github.com/rocPAI-Forge/microduck_rl_unilab
