# GinDuck/microduck-sock-heist-6m-continue-2-e

## Resumen

`microduck-sock-heist-6m-continue-2-e` es un checkpoint de política de aprendizaje por refuerzo (reinforcement learning) entrenado para el robot cuadrúpedo de bajo coste microduck de Pollen Robotics. No es un modelo de lenguaje: es una política de control continuo que mapea una observación de 61 dimensiones a 14 acciones a 50 Hz, empaquetada en formato ONNX para su despliegue directo en el robot. El autor es el usuario de Hugging Face GinDuck y el modelo se publica como parte de sus experimentos personales de "sock heist" (robar un calcetín esquivando guardias).

La política está descrita como "perpetua": se ejecuta de forma continua hasta que se le indica lo contrario, comportándose como una marcha que se carga en una ranura de política del daemon del robot. Se entrenó con el simulador mjlab (basado en MuJoCo) dentro del repositorio de retos de microduck, con 4096 entornos paralelos, semilla 1 y 600 iteraciones de checkpoint sobre un entrenamiento previo ("continue-2").

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline completo de RL para robótica de bajo coste, desde el entrenamiento en simulación hasta el despliegue en hardware real mediante ONNX y una CLI de carga de políticas. La información pública disponible es muy limitada (0 descargas, 0 likes, repositorio de 0.0 GB) y no incluye benchmarks ni datos de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control por aprendizaje por refuerzo; red neuronal exportada a ONNX (topología interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La política se entrena mediante aprendizaje por refuerzo en el simulador mjlab (versión `mjlab-microduck 0.1.0 @ 1efd853be`), un entorno basado en MuJoCo para el robot microduck. El espacio de observación tiene 61 dimensiones y el de acciones 14, con una frecuencia de control de 50 Hz. El entrenamiento se realizó con la tarea `Mjlab-SockHeist6m-MicroDuck`, 4096 entornos paralelos, 1000 iteraciones máximas configuradas y semilla 1, partiendo de un run anterior (`sock-continue-2`, commit `10ba3a426`).

El checkpoint publicado corresponde a la iteración 600 del entrenamiento. La normalización de observaciones está integrada dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. El autor advierte explícitamente de que el entrenamiento no es reproducible bit a bit entre máquinas: misma semilla y mismo código producen políticas comparables, no pesos idénticos. No se dispone de información sobre la topología exacta de la red (número de capas, anchura, función de activación) ni sobre el algoritmo de RL empleado.

## Capacidades

- Control locomotriz continuo del robot microduck a 50 Hz con 14 acciones.
- Ejecución de una política "perpetua": se mantiene activa hasta que se le ordena detenerse.
- Navegación y evasión de obstáculos (guardias) en el escenario de entrenamiento "sock heist".
- Manipulación o interacción para recoger un objeto (el calcetín) sin ser detectado.
- Finalización de la tarea en menos de 10 segundos según la model card.
- Integración con el daemon del robot mediante `robotctl policy load <slot>`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo.

## Casos de uso

- Demostración de RL en robótica de bajo coste: sirve como referencia reproducible para quien quiera entrenar y desplegar políticas propias en microduck siguiendo el pipeline de `microduck-challenges`.
- Benchmark de simulación a realidad: permite evaluar cómo se transfiere una política entrenada en mjlab a hardware real, comparando tiempos de tarea y tasas de éxito.
- Pruebas de infraestructura de despliegue: útil para validar el daemon, la CLI `robotctl` y el esquema 2 de manifiestos de políticas antes de cargar políticas en producción.
- Educación y divulgación: ejemplo tangible de entrenamiento con 4096 entornos paralelos y exportación a ONNX para un robot cuadrúpedo pequeño.
- Investigación en comportamientos emergentes: la política "perpetua" permite estudiar marchas continuas y su estabilidad en el tiempo.
- Base para fine-tuning: al ser un checkpoint intermedio de un run "continue", puede servir como punto de partida para variantes de la tarea (por ejemplo, distintos objetos u obstáculos).
- Validación de pipelines ONNX en robótica: al incluir la normalización dentro del modelo, es un caso práctico de exportación autocontenida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica declarada es cualitativa: la política "termina cada ejecución en menos de 10 segundos" en el escenario de entrenamiento, sin datos de tasa de éxito, recompensa media ni comparación con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la política se ejecuta en el propio robot, no en GPU de servidor.
- GPU recomendadas: no aplica para inferencia en el robot; el entrenamiento se realizó con 4096 entornos paralelos, lo que requiere una GPU de clase servidor (modelo concreto no disponible).
- Cabe en GPU de consumo: la inferencia ONNX de una política de control a 50 Hz es viable en CPU y en GPUs de consumo, aunque no se especifican requisitos.
- Opciones de despliegue: ONNX Runtime sobre el daemon de microduck, cargada mediante `robotctl policy load <slot>`.
- Latencia y throughput estimados: frecuencia de control fijada a 50 Hz (20 ms por paso); no se publican latencias medidas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables para microduck ni checkpoints alternativos de la misma tarea con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card no declara licencia; el uso comercial queda sin regular explícitamente y requiere contactar con el autor.
- No hay información sobre sesgos, pero al ser una política entrenada en un escenario concreto ("sock heist") su comportamiento fuera de ese dominio es impredecible.
- Riesgo de sobreajuste al simulador: no se documenta la tasa de éxito en hardware real ni técnicas de domain randomization.
- El entrenamiento no es bit-reproducible; los pesos no pueden regenerarse de forma idéntica.
- Repositorio de 0.0 GB y 0 descargas: no hay evidencia de uso en producción ni validación por terceros.
- La topología de la red y los hiperparámetros de RL no se detallan, lo que dificulta auditorías técnicas.
- El modelo no es un LLM: no procesa lenguaje, no tiene contexto textual ni capacidades de razonamiento simbólico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-2-e
- Repositorio de retos de microduck: https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
