# DenRakEiw/microduck-songkran-duck-tug6

## Resumen

`microduck-songkran-duck-tug6` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal exportado a ONNX que mapea una observación de 61 dimensiones a 14 acciones de control a 50 Hz, diseñado para ejecutarse como política perpetua en un slot del daemon `robotctl` del robot. El autor es DenRakEiw y la tarea de entrenamiento es `Mjlab-TugOfWar-MicroDuck`, un escenario de simulación de tiro de cuerda entre robots.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes, el tamaño del repo es de 0,0 GB (lo que sugiere que los pesos pueden no estar efectivamente publicados o son de tamaño despreciable) y no se declara licencia ni idiomas. La model card documenta de forma detallada el proceso de entrenamiento (commit, checkpoint, semilla, comando de reproducción), lo que permite reproducir el pipeline, pero no ofrece métricas de rendimiento ni especificaciones de arquitectura de red.

Se enmarca en el ecosistema microduck-challenges, una infraestructura de entrenamiento basada en mjlab (MuJoCo) con 2048 entornos paralelos, currículo de recompensas y oponentes de sparring. Es, por tanto, un artefacto de investigación en robótica con refuerzo, no un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles de capas no disponibles); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (exportación ONNX; el autor no documenta cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en el simulador mjlab (basado en MuJoCo), dentro del repositorio `pollen-robotics/microduck-challenges`, rama `denrakeiw-070`, commit `6c0b5d452`, sobre la base `mjlab-microduck 0.1.0 @ 1efd853be`. El entrenamiento parte de un checkpoint previo (`model_10800.pt` de la ejecución `2026-11-19_21-27-41_tw29-cup-s2`) y se reanuda hasta el checkpoint `12900`, con semilla 21, 2048 entornos en paralelo y un máximo de 2500 iteraciones. La tarea es `Mjlab-TugOfWar-MicroDuck`, un escenario de tiro de cuerda con oponente.

El pipeline incluye un currículo de pesos por etapas (penalización de tasa de acción, sesgo de pose de cabeza, rangos de centro de masa), una recompensa compuesta (margen de foso, veredicto de marcador, seguimiento de velocidad lineal, pose de cabeza, mantenimiento de rumbo, tiraje hacia atrás, asentamiento) y un oponente de sparring ONNX (`titan-v1`) con mezcla 0.7/0.3 y retardo de inicio de 3 iteraciones. La observación normalizer está embebida en `policy.onnx`, de modo que el robot alimenta observaciones en crudo. La política es perpetua: se ejecuta hasta que se le indique lo contrario. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas, aunque con el mismo código, `uv.lock`, comando y semilla se obtiene una política comparable.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck: convierte 61 observaciones en 14 acciones a 50 Hz.
- Ejecución de una marcha (gait) perpetua cargada en un slot de política del daemon `robotctl`.
- Comportamiento entrenado específicamente para la tarea de tiro de cuerda (TugOfWar) frente a un oponente.
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica la integración en el robot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Control de locomoción en el robot microduck: cargar la política en un slot mediante `robotctl policy load <slot> DenRakEiw/microduck-songkran-duck-tug6` y dejar que el robot ejecute la marcha de forma continua.
- Investigación en aprendizaje por refuerzo: usar el comando de reproducción documentado para reentrenar con la misma semilla y comparar políticas resultantes en estudios de reproducibilidad.
- Benchmarking de entornos mjlab: emplear la política como referencia de rendimiento en la tarea TugOfWar frente a otras políticas del repositorio microduck-challenges.
- Sparring automático: utilizar esta política como oponente ONNX en el entrenamiento de nuevas políticas, tal como el autor hace con `titan-v1`.
- Docencia en robótica con refuerzo: ilustrar un pipeline completo de simulación a robot real (entrenamiento, exportación ONNX, despliegue en daemon) con un caso concreto y reproducible.
- Pruebas de integración del daemon `robotctl`: validar la carga de manifiestos de esquema 2 y la ejecución de políticas perpetuas en el hardware.
- No es adecuado para generación de texto, código, atención al cliente ni ninguna tarea de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0,0 GB y no se documenta el número de parámetros, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible. Para el entrenamiento, el autor usa entrenamiento con refuerzo en GPU con 2048 entornos paralelos, pero no especifica el modelo de GPU.
- ¿Cabe en GPU de consumo? No disponible; por el contexto (política de control para un robot de pequeñas dimensiones), es plausible que la inferencia sea ligera, pero no hay datos que lo confirmen.
- Opciones de despliegue: ONNX Runtime a través del daemon `robotctl` del ecosistema microduck; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles; la política opera a 50 Hz por requisito del robot, pero no se publican medidas de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-songkran-duck-tug6 | Política RL para robot microduck (ONNX) | no disponible | no aplica (obs. 61-D) | no disponible | Hugging Face, 0 descargas |
| Otras políticas de microduck-challenges | Políticas RL para microduck | no disponible | no aplica | según repositorio | Repositorio GitHub pollen-robotics |
| Políticas de locomotion para cuadrúpedos (p. ej. Unitree, ANYmal) | Políticas RL | no disponible | no aplica | habitualmente no comercial | Publicaciones y repos varios |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se declara licencia: no puede asumirse uso comercial sin consultar al autor.
- El repositorio tiene 0 descargas y 0 likes y un tamaño de 0,0 GB, lo que genera dudas sobre si los pesos están efectivamente publicados y son utilizables.
- El autor indica que el export se realizó desde un checkout con cambios sin commitear, lo que puede afectar a la reproducibilidad exacta.
- El entrenamiento no es bit-reproducible entre máquinas; la semilla y el comando garantizan una política comparable, no idéntica.
- La política está especializada en la tarea TugOfWar; su comportamiento fuera de ese escenario no está documentado.
- No hay métricas de rendimiento, evaluación en robot real ni datos de robustez ante perturbaciones.
- Riesgo de alucinación: no aplica (no es un modelo generativo).
- Sesgos: no documentados; en RL pueden aparecer comportamientos explotadores de la recompensa no previstos por el diseñador.
- No apto para tareas de lenguaje, visión, audio ni agentes conversacionales.

## Enlaces

- Hugging Face: https://huggingface.co/DenRakEiw/microduck-songkran-duck-tug6
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio microduck-challenges: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas (referenciada en la model card): `docs/policy-manifest.md` en el repositorio del daemon
