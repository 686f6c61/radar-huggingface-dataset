# alexhegit/microduck-heist

## Resumen

Microduck-heist es una política de control para el robot caminante Microduck, desarrollada por el usuario alexhegit y publicada en Hugging Face bajo el identificador `alexhegit/microduck-heist`. No se trata de un modelo de lenguaje, sino de un controlador neuronal entrenado con aprendizaje por refuerzo (PPO) sobre el simulador MuJoCo que traduce 61 observaciones en 14 consignas de posición articular a 50 Hz.

La política implementa un comportamiento de "stop-and-go" para el evento `sock-heist-6m` de la Microduck Arena: el robot debe avanzar y detenerse en respuesta a comandos de movimiento que se redibujan cada 0,6-3,0 segundos (con un 45 % de comandos de parada) y mantener la quietud cuando el comando es cero, comportamiento reforzado durante el entrenamiento. El modelo se distribuye en formato ONNX y está pensado para su despliegue embebido en el robot.

El interés de esta ficha es acotado: se trata de un artefacto de robótica de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card extensa ni resultados de benchmarks publicados. Su relevancia radica en ser un ejemplo de política RL entrenada en GPU AMD ROCm y exportada a ONNX para inferencia en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal entrenada con PPO (arquitectura exacta no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entradas / salidas | 61 observaciones de entrada / 14 objetivos de posición articular de salida |
| Frecuencia de control | 50 Hz |
| Simulador de entrenamiento | MuJoCo (microduck_rl_unilab) |
| Hardware de entrenamiento | GPU AMD con ROCm |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, funciones de activación ni tipo de codificador de observaciones). Lo que sí se documenta es el procedimiento de entrenamiento: aprendizaje por refuerzo con el algoritmo PPO sobre el simulador MuJoCo, usando el framework `microduck_rl_unilab`, y ejecutado en una GPU AMD con el stack ROCm.

La innovación principal descrita por el autor es la estrategia de aleatorización de comandos: durante el entrenamiento, el comando de movimiento se redibuja cada 0,6-3,0 segundos, con un 45 % de los episodios en estado de parada, y se añade una recompensa explícita por mantener la quietud cuando el comando es cero. Esto produce una política de "stop-and-go" capaz de alternar entre marcha y reposo de forma estable, en lugar de una marcha continua. No se especifican el número total de pasos de entrenamiento, el tamaño del dataset de rollouts ni detalles de la función de recompensa más allá de lo indicado.

## Capacidades

- Control locomotor de un robot caminante Microduck a 50 Hz a partir de 61 observaciones.
- Generación de 14 consignas de posición articular como salida de control.
- Comportamiento stop-and-go: transición entre marcha y parada según el comando recibido.
- Mantenimiento de la quietud ante comando cero (stillness reforzada en entrenamiento).
- Adaptación a comandos que cambian cada 0,6-3,0 segundos.
- Exportación a ONNX para inferencia portable y de baja latencia.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Competición en la Microduck Arena: la política está entrenada específicamente para el evento `sock-heist-6m`, por lo que su uso directo es participar en dicha prueba con el robot Microduck.
- Demostración de control stop-and-go en robótica educativa: sirve para ilustrar cómo una recompensa de quietud ante comando cero moldea el comportamiento locomotor.
- Inferencia embebida con ONNX Runtime: el formato ONNX permite desplegar la política en el propio robot o en una SBC cercana con latencia de milisegundos a 50 Hz.
- Referencia para entrenamiento RL en ROCm: el autor documenta el entrenamiento en GPU AMD, lo que lo convierte en un ejemplo reproducible de pipelines PPO sobre ROCm.
- Evaluación comparativa de políticas de marcha: puede usarse como línea base frente a otras políticas del mismo robot en experimentos de robustez ante cambios de comando.
- Docencia en aprendizaje por refuerzo: el binomio MuJoCo + PPO + exportación ONNX es un caso compacto para explicar el ciclo completo simulación-entrenamiento-despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un modelo muy pequeño que probablemente cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no disponibles. El entrenamiento se realizó en una GPU AMD con ROCm; para inferencia no se especifica hardware.
- GPU consumer: previsiblemente compatible con cualquier GPU moderna dada la naturaleza del artefacto, aunque no hay confirmación del autor.
- Opciones de despliegue: ONNX Runtime (formato de pesos publicado); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de control.
- Latencia y throughput: se infiere un requisito de 50 Hz (20 ms por paso de control) por la frecuencia de operación declarada, pero no se publican mediciones reales.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| alexhegit/microduck-heist | Política RL (PPO) para Microduck | 61 obs. / 14 articulaciones | Apache 2.0 | Hugging Face (ONNX) |
| Otras políticas de la Microduck Arena | Políticas RL para el mismo robot | no disponible | no disponible | Hugging Face Spaces |
| Políticas de locomoción MuJoCo genéricas | Controladores RL para robots simulados | variable | variable | Repositorios de investigación |

No se dispone de datos comparativos de rendimiento entre esta política y alternativas del mismo evento.

## Limitaciones y advertencias

- Artefacto de nicho: sin descargas ni likes en el momento de la consulta, y sin documentación técnica extensa.
- Especificidad de tarea: entrenada para el evento `sock-heist-6m`; su comportamiento fuera de ese escenario no está validado.
- Dependencia del simulador: el entrenamiento se realizó en MuJoCo; la transferencia al robot físico (sim-to-real) no está documentada.
- Sesgos: no aplica en el sentido habitual de modelos de lenguaje, pero la política puede presentar sesgos de comportamiento derivados de la distribución de comandos de entrenamiento (45 % de paradas).
- Alucinación: no aplica; el riesgo relevante es la falta de robustez ante observaciones fuera de distribución.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, sin restricciones adicionales documentadas.
- Sin información sobre límites de idioma, contexto o cuantización porque no son parámetros aplicables a este tipo de modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexhegit/microduck-heist
- Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Framework de entrenamiento: https://github.com/rocPAI-Forge/microduck_rl_unilab
