# reachjalil/microduck-nimble-walk

## Resumen

Nimble walk (NottyDuck) es una política de locomoción por aprendizaje por refuerzo para el robot bípedo de código abierto MicroDuck de Pollen Robotics. La desarrolla el usuario reachjalil y se publica en HuggingFace con licencia Apache 2.0. El modelo resuelve un problema concreto de control: el caminante de serie (alpha walker) ignoraba en simulación las órdenes de velocidad lentas, hacia atrás y de giro suave, mientras que Nimble walk sí las sigue, lo que lo convierte en el caminante por defecto del juego de navegador NottyDuck.

Técnicamente no es un modelo de lenguaje, sino una política de control exportada a ONNX. Recibe una observación de 61 dimensiones (`obs` con forma `[1, 61]`) y emite 14 acciones (`actions` con forma `[1, 14]`) a 50 Hz, con escala de acción 1.0 y sin filtro de acción. El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que se alimentan observaciones en crudo.

Su relevancia es doble: por un lado demuestra un flujo de entrenamiento RL reproducible sobre un robot de bajo coste; por otro, está entrenado y validado exclusivamente en simulación (nunca se ha ejecutado en un MicroDuck físico), lo que acota su uso a entornos simulados como el juego NottyDuck. El contexto de entrenamiento es la tarea `Mjlab-VelocityTracking-Flat-MicroDuck`, con 1024 entornos paralelos, semilla 73 y una sola GPU NVIDIA L4 en RunPod.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para robótica entrenada con aprendizaje por refuerzo y exportada a ONNX; topología de red concreta no detallada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de observación de 61 dimensiones |
| Tipos de cuantizacion | no disponible; se distribuye exportación ONNX (probablemente fp32) |
| Idiomas soportados | no aplica (modelo de control robótico, sin interfaz de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y checkpoint PyTorch (`model_1800.pt`) |

Otras especificaciones operativas:

| Parametro | Valor |
|---|---|
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 (incluye `twist`, `head_pose` de 4 y `body_pose` de 6) |
| Dimension de accion | 14 |
| Escala de accion | 1.0 |
| Filtro de accion | ninguno |
| Entrada ONNX | `obs` `[1, 61]` |
| Salida ONNX | `actions` `[1, 14]` |
| Rangos de entrenamiento del comando `twist` | vx ±0.4 m/s, vy ±0.3 m/s, wz ±1.0 rad/s |

## Arquitectura y entrenamiento

La model card no especifica la topología de red (número de capas, unidades ocultas ni si hay compartición actor-crítico). Lo que sí se detalla es el procedimiento de entrenamiento: se usó la tarea `Mjlab-VelocityTracking-Flat-MicroDuck` del repositorio NottyDuck, que combina la receta de seguimiento de velocidad del MicroDuck con una penalización sobre el error de velocidad promediado en el tiempo, activada de forma progresiva (ramp) a partir de la iteración 600. El entrenamiento se ejecutó con 1024 entornos paralelos, semilla 73, en una única GPU NVIDIA L4 en RunPod, el 2026-10-16.

El checkpoint seleccionado es el 1800 de una ejecución de 3000 iteraciones (`model_1800.pt`, SHA-256 `602844506a2672160ebdcce364e9161b849fbb88df0f0a6ba7bcf6a377fabc77`), exportado con el script `scripts/export.py` del repositorio (instantánea del código de entrenamiento con SHA-256 `682103d61b89b40b57de4c39b26216f0dbf5b5e04ca98ec9e970716d946dc590`). La elección del checkpoint se hizo puntuando cada centésimo checkpoint: los posteriores dejaban de responder a comandos lentos, hacia atrás y de giro suave, y los anteriores giraban lentamente estando en reposo. La innovación destacable no es arquitectónica sino de comportamiento: lograr seguimiento de comandos lentos y en reversa y un giro efectivo que la política de serie no conseguía.

## Capacidades

- Generación de marcha continua (perpetual walking) sobre el MicroDuck en simulación, con observación de 61 dimensiones y salida de 14 acciones a 50 Hz.
- Seguimiento de comandos de velocidad `twist = [vx, vy, wz]` en m/s y rad/s dentro de los rangos de entrenamiento (vx ±0.4, vy ±0.3, wz ±1.0).
- Seguimiento de comandos lentos (por ejemplo 0.12 m/s) que el alpha walker de serie ignora y ante los que se queda parado.
- Desplazamiento hacia atrás (por ejemplo comando de 0.20 m/s en reversa).
- Giro controlado (por ejemplo comandos de 0.5 y 1.0 rad/s).
- Resistencia a empujones (shoves) mientras camina: 12 de 12 supervivientes ante empujones de 0.2–0.4 N·s.
- Entrada de pose de cabeza (4 dimensiones) y de cuerpo (6 dimensiones) según el layout compartido de 61 dimensiones.
- Integración directa con el juego de navegador NottyDuck como caminante por defecto.

No dispone de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio, thinking mode ni ninguna capacidad propia de modelos de lenguaje, porque no es un modelo de lenguaje.

## Casos de uso

- Caminante por defecto del juego de navegador NottyDuck: es precisamente el uso para el que se entrenó y con el que se mide; se ejecuta embebido en el navegador (probado en Chrome headless) contra el alpha walker.
- Prototipado de control de locomoción bípeda en simulación: sirve como referencia reproducible para comparar recetas RL sobre el MicroDuck sin necesidad de hardware.
- Investigación en seguimiento de comandos lentos y en reversa: el modelo mejora de forma medible comportamientos que la política base no resuelve (0.065 m/s frente a pararse, en comando de 0.12 m/s), lo que lo hace útil como línea base en estudios de velocidad.
- Pruebas de robustez ante perturbaciones: con 12 de 12 empujones supervivientes de 0.2–0.4 N·s mientras camina, es adecuado para experimentos de estabilidad bajo empuje dentro del simulador.
- Integración en pipelines de robótica basados en ONNX: al exponer una interfaz `obs`/`actions` limpia y sin normalizador externo, se puede cargar con ONNX Runtime en un bucle de control a 50 Hz.
- Benchmarking de políticas de MicroDuck: sus métricas de velocidad y giro permiten comparar contra otras políticas publicadas para la misma plataforma (por ejemplo `neil-jo/microduck-walk` o `teethyfish/microduck-collision-flamingo-ii`).
- Enseñanza de RL aplicado a robótica: el flujo completo (tarea Mjlab, 1024 entornos, un L4, selección de checkpoint por puntuación) es un ejemplo didáctico acotado.

## Benchmarks y rendimiento

La model card solo reporta mediciones en simulación (MuJoCo nativo, física nominal), no benchmarks de modelos de lenguaje. Se reproducen tal cual:

Velocidad en régimen estacionario dividida por el comando:

| Comando | Browser position PD | BAM XL330 servo model |
|---|---|---|
| Avance 0.15 m/s | 0.64 | 0.52 |
| Avance 0.25 m/s | 0.61 | 0.52 |
| Avance 0.40 m/s | 0.60 | 0.52 |
| Reversa 0.20 m/s | 0.61 | 0.49 |
| Giro 0.5 rad/s | 1.22 | 0.96 |
| Giro 1.0 rad/s | 1.22 | 1.02 |
| Empujones superados (0.2–0.4 N·s caminando) | 12 de 12 | 12 de 12 |

Comparativa en el juego de navegador NottyDuck (Chrome headless) frente al alpha walker de serie:

| Prueba | Nimble walk | Alpha walk |
|---|---|---|
| Tecla de avance (comando 0.25 m/s) | 0.144 m/s | 0.114 m/s |
| Avance con comando 0.40 m/s | 0.242 m/s | 0.180 m/s |
| Tecla de giro (comando 1.0 rad/s) | 1.09 rad/s | 0.50 rad/s |
| Tecla de reversa (comando 0.20 m/s) | 0.076 m/s hacia atrás | se queda parado |
| Marcha lenta (comando 0.12 m/s) | 0.065 m/s | se queda parado |
| Deriva en reposo | 0.03 rad/s | 0.006 rad/s |
| Caídas en estas pruebas | ninguna | ninguna |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- Inferencia: extremadamente ligera. La entrada es `[1, 61]` y la salida `[1, 14]`; una política de este tamaño se ejecuta con holgura en CPU sin GPU dedicada.
- Entrenamiento: se completó con una única GPU NVIDIA L4 en RunPod, con 1024 entornos paralelos, durante 3000 iteraciones.
- GPU recomendadas para entrenamiento: cualquier GPU con memoria suficiente para la simulación masiva paralela; en la model card consta una NVIDIA L4. No se especifica un mínimo de VRAM.
- GPU de consumo: la inferencia es viable en hardware de consumo e incluso en navegador (se validó en Chrome headless); no se requieren tarjetas tipo A100 o H100.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el propio juego de navegador NottyDuck; se incluye además el checkpoint PyTorch `model_1800.pt`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este modelo.
- Latencia y throughput: la política está diseñada para operar a 50 Hz. No se publican cifras de latencia ni de throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Plataforma | Tipo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| reachjalil/microduck-nimble-walk | MicroDuck | Política RL en ONNX | no disponible | no aplica (obs. 61-D) | apache-2.0 | Sí: tablas de velocidad y giro en simulación |
| neil-jo/microduck-walk | MicroDuck | Política de marcha (no detallada) | no disponible | no disponible | no disponible | no disponible |
| teethyfish/microduck-collision-flamingo-ii | MicroDuck | Reinforcement Learning | no disponible | no disponible | no disponible | no disponible |
| Alpha walk (caminante de serie del MicroDuck) | MicroDuck | Política base | no disponible | no disponible | no aplica | Sí: comparativa en el juego NottyDuck (la tabla anterior) |

La comparación con los otros modelos de la librería `microduck` queda limitada porque sus fichas no exponen parámetros, contexto ni resultados de rendimiento en la información disponible.

## Limitaciones y advertencias

- Solo simulación: nunca se ha ejecutado en un MicroDuck físico; no hay validación en hardware, únicamente mediciones con física nominal.
- El giro sobrepasa el comando en torno a un 20 % con los actuadores del navegador.
- Presenta una ligera deriva de giro en reposo de aproximadamente 0.03 rad/s en el juego de navegador (frente a 0.006 rad/s del alpha walker).
- El seguimiento lateral (vy) es débil; por eso NottyDuck envía vy = 0 y limita el avance a 0.25 m/s, la reversa a 0.2 m/s y el giro a 1.0 rad/s.
- Hay degradación de comportamiento en checkpoints posteriores (dejan de responder a comandos lentos, en reversa o de giro suave) y en anteriores (giran lentamente en reposo), lo que obligó a una selección manual del checkpoint 1800.
- Sesgos: no aplica en el sentido de sesgos de lenguaje al no ser un modelo de lenguaje, pero el comportamiento está sesgado hacia los regímenes de velocidad y giro vistos en entrenamiento; fuera de esos rangos no hay garantías.
- Riesgo de alucinación: no aplica a un modelo de control, pero sí existe riesgo de comportamiento incorrecto (caídas o deriva) fuera de la distribución de comandos.
- Licencia Apache 2.0: permite uso comercial y modificación con las obligaciones habituales de atribución; no se indican restricciones adicionales.
- Idioma: no aplica, sin capacidades lingüísticas.
- Caveat de producción: la ausencia de validación en hardware implica que no debe desplegarse en un robot físico sin una validación previa de seguridad y estabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reachjalil/microduck-nimble-walk
- Repositorio del MicroDuck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Modelo comparable en HuggingFace: https://huggingface.co/neil-jo/microduck-walk
- Listado de modelos compatibles con la librería microduck: https://huggingface.co/models?library=microduck
- Documentación del curso Microduck (de cuerpo a comportamiento): https://eai-course.github.io/microduck/
- Cobertura de prensa sobre el MicroDuck de Hugging Face: https://santageai.com/news/2026/08/29/hugging-face-microduck-open-source-robot
- Cobertura de AI Business sobre el robot: https://aibusiness.com/robotics/hugging-face-programmable-walking-duck-robot
