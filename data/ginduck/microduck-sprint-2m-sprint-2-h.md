# GinDuck/microduck-sprint-2m-sprint-2-h

## Resumen

microduck-sprint-2m-sprint-2-h es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado en formato ONNX para su ejecución directa sobre el robot. Lo publica el usuario GinDuck bajo el identificador GinDuck/microduck-sprint-2m-sprint-2-h.

El checkpoint corresponde a la segunda iteración de entrenamiento ("sprint") del autor, con una receta compartida por TheSauceman, y está orientado explícitamente a maximizar la velocidad de marcha: según la model card, completa cada carrera en aproximadamente 1,2 segundos. La política es de tipo "perpetual", es decir, se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha que se carga en una ranura de política del demonio robotctl.

El modelo es relevante dentro del ecosistema de robótica open source de Pollen Robotics como ejemplo reproducible de entrenamiento RL con mjlab (entorno de simulación basado en MuJoCo) sobre el microduck, con instrucciones completas de reproducción (commit, semilla, comando de entrenamiento). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere un artefacto muy ligero o un repositorio recién creado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (red feedforward empaquetada en ONNX); detalles de capas no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye como policy.onnx) |
| Idiomas soportados | no aplica (control robótico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (policy.onnx) + manifest.json (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación usando mjlab (base mjlab-microduck 0.1.0 @ 1efd853be) sobre el robot microduck, con 4096 entornos paralelos y hasta 3000 iteraciones del agente, semilla 1, y registro en TensorBoard. El checkpoint publicado corresponde a la iteración 1000 del task_id Mjlab-Sprint2m-MicroDuck, en la rama race-2 (commit b44f7ffc9) del repositorio microduck-challenges de Pollen Robotics. La observación es de 61 dimensiones y la acción de 14 dimensiones, a una frecuencia de control de 50 Hz.

El artefacto principal es policy.onnx, que incluye el normalizador de observaciones "horneado" en el propio grafo: el consumidor debe alimentar observaciones en crudo, sin normalizar. El manifest.json sigue el esquema 2 del manifiesto de políticas del demonio microduck (docs/policy-manifest.md). El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo código, uv.lock y semilla produce una política comparable, no los mismos pesos.

## Capacidades

- Locomoción cuadrúpeda perpetual: ejecuta una marcha continua hasta que se le indique lo contrario, cargada en una ranura de política del demonio robotctl.
- Control reactivo a partir de observaciones de 61 dimensiones (estado del robot y del entorno, según el entorno de entrenamiento).
- Salida de 14 acciones de control a 50 Hz, adecuada para el bucle de control en tiempo real del microduck.
- Orientada a velocidad: la model card indica que completa cada carrera en aproximadamente 1,2 segundos.
- Inferencia vía ONNX, con normalización de observaciones integrada en el grafo.
- Ejecución sobre robot real mediante `robotctl policy load <slot> GinDuck/microduck-sprint-2m-sprint-2-h`.
- No soporta tool calling, agentes, razonamiento multi-step, multilingüismo ni modalidades de visión o audio: es un controlador de robótica, no un modelo generativo.

## Casos de uso

- Carreras de velocidad con microduck: cargar la política en una ranura y ejecutar el circuito de la competición race-2; el entrenamiento está específicamente orientado a minimizar el tiempo por vuelta (aproximadamente 1,2 s por carrera según el autor).
- Demostraciones de locomoción RL en robótica educativa: usar la política como ejemplo funcional de un controlador entrenado con mjlab para ilustrar el pipeline sim-to-real en talleres y cursos.
- Benchmarking de políticas de marcha: comparar esta política "sprint" con otras políticas del mismo autor o de la comunidad sobre el mismo robot y circuito, usando el tiempo de carrera como métrica.
- Reproducción de experimentos de RL: servir como referencia para validar el pipeline de entrenamiento del repositorio microduck-challenges (commit b44f7ffc9, semilla 1, 4096 entornos), comprobando que se obtiene una política de rendimiento comparable.
- Desarrollo de infraestructura de despliegue: probar el flujo de carga de políticas del demonio robotctl y el esquema 2 de manifest.json con un artefacto ONNX real y ligero.
- Investigación en control reactivo: utilizar la política como línea base para estudiar transferencia sim-to-real, robustez ante perturbaciones y sensibilidad a la frecuencia de control de 50 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica aportada por el autor es cualitativa y específica de la tarea: cada carrera se completa en aproximadamente 1,2 segundos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB, lo que indica un artefacto muy pequeño, pero no se publica el número de parámetros ni el tamaño exacto del ONNX.
- GPU recomendadas: no disponible. Al ser una política de control a 50 Hz con observación de 61 dimensiones y 14 acciones, es plausible que la inferencia en CPU sea suficiente, pero esto no está confirmado en la información disponible.
- Viabilidad en GPU de consumo: no disponible; no se especifican requisitos de cómputo.
- Opciones de despliegue: ONNX Runtime (formato policy.onnx) y el demonio robotctl del microduck para carga en ranura de política. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; el bucle de control opera a 50 Hz (periodo de 20 ms), pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del microduck ni checkpoints comparables con los que establecer una comparación de parámetros, contexto, rendimiento o licencia. El propio autor menciona que comparte receta con TheSauceman y que existen otras ejecuciones ("sprint") del mismo task, pero no se aportan datos de esas alternativas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue en producción.
- Artefacto sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Especialización estrecha: la política está entrenada para una tarea concreta (carrera de velocidad en el circuito race-2) y no se garantiza su comportamiento fuera de ese escenario.
- Entrenamiento no bit-reproducible: repetir el comando con la misma semilla produce una política comparable, no idéntica; los resultados pueden variar entre máquinas.
- Sin datos de robustez sim-to-real: no se documentan pruebas de resistencia a perturbaciones, terrenos variables o desgaste del hardware.
- Sin información sobre sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero tampoco se documenta el comportamiento en condiciones fuera de distribución.
- Dependencia del demonio robotctl y del esquema 2 de manifest.json: cambios en el daemon o en el esquema podrían romper la compatibilidad de carga.
- Sin métricas cuantitativas publicadas más allá del tiempo de carrera aproximado (1,2 s), lo que dificulta evaluar su rendimiento frente a otras políticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-2-h
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
