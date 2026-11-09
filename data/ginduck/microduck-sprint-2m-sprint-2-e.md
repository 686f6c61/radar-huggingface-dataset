# GinDuck/microduck-sprint-2m-sprint-2-e

## Resumen

`sprint-2m-sprint-2-e` es un checkpoint de política de control para el robot cuadrúpedo de código abierto microduck, desarrollado por el usuario GinDuck y publicado en Hugging Face. No es un modelo de lenguaje: se trata de una política de aprendizaje por refuerzo entrenada para generar una marcha (gait) que el robot ejecuta de forma perpetua a 50 Hz. El modelo recibe observaciones de 61 dimensiones y emite 14 acciones de control articular.

El checkpoint pertenece a la segunda tanda de entrenamiento del autor (sprint 2) y está orientado explícitamente a maximizar la velocidad de desplazamiento, siguiendo una receta de entrenamiento compartida por otro usuario (TheSauceman). Según la model card, completa cada carrera en aproximadamente 1,2 segundos. Se distribuye en formato ONNX con el normalizador de observaciones embebido en el propio grafo, junto con un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

Su relevancia es acotada pero clara para la comunidad de robótica: demuestra el flujo completo de entrenamiento, exportación y despliegue de políticas de locomoción en un robot de bajo coste, con instrucciones de reproducción explícitas (commit, seed y comando de entrenamiento). No debe confundirse con un modelo fundacional: es un artefacto de control específico para un hardware concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo; red neuronal exportada a ONNX) |
| Parametros totales | no disponible (el tamaño del repo es 0.0 GB según Hugging Face) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología concreta de la red neuronal de la política (número de capas, anchura, función de activación). Lo que sí se documenta es la interfaz: observación de 61 dimensiones, 14 acciones y frecuencia de control de 50 Hz, con normalización de observaciones integrada en el grafo ONNX, de modo que el consumidor debe alimentar observaciones en crudo. La política es de tipo perpetuo: se ejecuta de forma continua hasta que se le indica lo contrario, a diferencia de políticas episódicas con condición de terminación.

El entrenamiento se realizó con el framework `mjlab-microduck 0.1.0` (commit base `1efd853be`), sobre la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. El checkpoint corresponde a la iteración 2000, con semilla 1, iniciado el 2026-11-02. El comando de reproducción emplea 4096 entornos paralelos, hasta 3000 iteraciones y registro en TensorBoard. El autor advierte explícitamente que el entrenamiento por refuerzo en GPU no es reproducible bit a bit entre máquinas: repetir la receta produce una política comparable, no idéntica. No se documentan detalles sobre función de recompensa, composición del dataset (generado por simulación) ni uso de RLHF/DPO, que no aplican en este contexto.

## Capacidades

- Locomoción cuadrúpeda: genera una marcha perpetua para el robot microduck a 50 Hz.
- Control reactivo de bajo nivel: mapea observaciones de 61 dimensiones a 14 acciones articulares.
- Orientada a velocidad: según la model card, completa cada carrera en aproximadamente 1,2 segundos.
- Despliegue embebido: el normalizador de observaciones está embebido en `policy.onnx`, lo que simplifica la integración en el daemon del robot.
- Carga en ranura de política: se integra mediante `robotctl policy load <slot>`.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Investigación en locomoción: servir como línea base reproducible para comparar recetas de entrenamiento de marchas en microduck, usando el commit y la semilla documentados.
- Demostración de velocidad punta: evaluar el límite de velocidad del hardware en condiciones controladas, dado que la política está optimizada para carreras de aproximadamente 1,2 segundos.
- Pruebas de integración del daemon: validar el flujo `robotctl policy load` y el consumo de manifiestos de esquema 2 en pipelines de despliegue.
- Benchmark de simulación a realidad: comparar el comportamiento de la política en simulación (mjlab) frente al robot físico para estudiar la brecha sim-to-real.
- Docencia y prototipado: ejemplo completo y de bajo coste del ciclo entrenamiento-exportación-despliegue en robótica con refuerzo.
- Comparación de políticas: enfrentar esta política contra otros checkpoints del mismo autor o de la comunidad en la misma tarea `Mjlab-Sprint2m-MicroDuck` para analizar el efecto de la semilla y la receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento declarado es que la política completa cada carrera en aproximadamente 1,2 segundos, sin especificar distancia, terreno ni condiciones de medición.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza de la tarea (observación de 61 dimensiones, 14 acciones) y el tamaño del repositorio (0.0 GB), la huella debe ser mínima, pero no se documenta.
- GPU recomendadas: no disponible para inferencia; para reentrenamiento, el comando documentado usa 4096 entornos paralelos y sugiere aceleración por GPU, sin especificar modelo.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; el reducido tamaño del artefacto sugiere que sí, pero no se confirma.
- Opciones de despliegue: runtime ONNX en el robot mediante el daemon de microduck (`robotctl`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms); no se publican latencias medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-sprint-2m-sprint-2-e | Política RL para microduck | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| Otros checkpoints de `microduck-challenges` (rama `race-2`) | Políticas RL para microduck | no disponible | no disponible | no disponible | Repositorio del proyecto |
| Políticas de locomoción para cuadrúpedos comerciales (p. ej. Unitree) | Políticas RL propietarias o de investigación | no disponible | no disponible | habitualmente restrictiva | no disponible |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse uso comercial; debe consultarse al autor antes de cualquier despliegue productivo.
- Específica de hardware: solo es válida para el robot microduck con su interfaz de 61 observaciones y 14 acciones; no es transferible a otras plataformas sin reentrenamiento.
- Entrenada para velocidad: la receta prioriza rapidez, lo que puede implicar menor robustez ante terrenos irregulares, perturbaciones o cargas; no se documenta evaluación en esas condiciones.
- No reproducible bit a bit: el propio autor advierte que el reentrenamiento produce políticas comparables, no idénticas, lo que complica la auditoría exacta del comportamiento.
- Sin datos de sesgos, alucinación o idioma: no aplican en el sentido habitual, pero tampoco se documentan evaluaciones de seguridad, estabilidad o recuperación ante caídas.
- Artefacto sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa publicada.
- Uso en robot físico conlleva riesgo mecánico: debe probarse en entorno controlado y con protecciones antes de operar cerca de personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-2-e
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card; URL exacta no disponible)
