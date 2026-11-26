# GinDuck/microduck-roller-sprint-2m-roller-2-z

## Resumen

`microduck-roller-sprint-2m-roller-2-z` es un checkpoint de política de control (policy) para el robot cuadrúpedo microduck de Pollen Robotics, entrenado mediante aprendizaje por refuerzo. No es un modelo de lenguaje: es una política perpetua de locomoción sobre ruedas (rollers) que produce 14 acciones a partir de una observación de 61 dimensiones, ejecutándose a 50 Hz. El autor, GinDuck, lo publica como parte de su segunda tanda de entrenamientos ("roller run") y lo describe como una política orientada a velocidad, que abandona el patinaje previo para priorizar el sprint.

El modelo se distribuye como un grafo ONNX (`policy.onnx`) con el normalizador de observaciones embebido, junto con un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. La receta de entrenamiento es compartida por TheSauceman y se apoya en el repositorio `microduck-challenges` (rama `race-2`), con el entorno `Mjlab-RollerSprint2m-MicroDuck` y 2048 entornos paralelos durante 6000 iteraciones máximas.

Su relevancia es acotada pero específica: sirve como referencia reproducible de entrenamiento de políticas de locomoción para un robot de bajo coste, y como artefacto directamente desplegable en un slot de política del daemon `robotctl`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere un artefacto muy ligero (coherente con una política de red pequeña para un robot de 61-D de observación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada con RL; se distribuye como grafo ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (artefacto ONNX; sin variantes GGUF/quantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de microduck) |

Especificaciones adicionales declaradas en la model card:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (se ejecuta hasta recibir orden de parada) |
| Plataforma | microduck sobre rollers |
| task_id | `Mjlab-RollerSprint2m-MicroDuck` |
| Checkpoint | 2250 |
| Seed | 1 |
| Entornos paralelos | 2048 |
| Iteraciones maximas | 6000 |
| Base de simulacion | `mjlab-microduck 0.1.0 @ 1efd853be` |
| Commit de entrenamiento | `b44f7ffc9` (rama `race-2`) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal (número de capas, anchura, tipo de capa). Lo que sí se especifica es el contrato de entrada/salida: 61 dimensiones de observación y 14 dimensiones de acción a 50 Hz, con el normalizador de observaciones integrado en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto. La política es de tipo perpetuo: genera una marcha continua sin condición de terminación propia.

El entrenamiento se realizó con aprendizaje por refuerzo en simulación, usando el stack `mjlab-microduck` (versión 0.1.0, commit `1efd853be`) sobre el repositorio `microduck-challenges`. Se lanzaron 2048 entornos en paralelo con un máximo de 6000 iteraciones y semilla 1, registrando en TensorBoard bajo el nombre de ejecución `roller-2`. El checkpoint publicado corresponde a la iteración 2250. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir la receta con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no los mismos pesos.

No se documentan en la información disponible detalles sobre composición del dataset (al ser RL en simulación, la "distribución" es la del entorno), función de recompensa, técnicas de regularización ni uso de RLHF/DPO (no aplicables en este dominio).

## Capacidades

- Locomoción sobre ruedas (rollers) para el robot microduck: genera una marcha de sprint continua a 50 Hz.
- Política perpetua: mantiene la marcha indefinidamente hasta que se le indique lo contrario, sin episodios autoterminados.
- Control reactivo a partir de observaciones en bruto: el normalizador está embebido en el ONNX, lo que simplifica la integración con el daemon.
- Despliegue directo en hardware mediante `robotctl policy load <slot> ...`.
- Orientada a velocidad: el autor reporta tiempos de finalización de aproximadamente 1,6 segundos en sus propias pruebas.
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.
- No se declaran capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Carreras y competiciones de robots: la política está entrenada específicamente para sprint sobre rollers y el autor la vincula a las competiciones y copas de la Arena seguidas a través de QuackPack; encaja como política de competición en un slot del robot.
- Benchmark de recetas de RL: al publicarse el commit, la rama, el `task_id`, el seed y el comando exacto de entrenamiento, sirve para comparar variantes de recompensa e hiperparámetros entre ejecuciones (`roller-1`, `roller-2`, etc.).
- Validación de pipelines de simulación a realidad: el artefacto ONNX con normalizador embebido permite probar la transferencia de una política entrenada en `mjlab` al robot físico con un solo comando.
- Docencia y divulgación en robótica con RL: es un ejemplo ligero y reproducible de entrenamiento de políticas de locomoción para un cuadrúpedo de bajo coste.
- Desarrollo de infraestructura de despliegue: el `manifest.json` conforme al esquema 2 del manifiesto de microduck lo convierte en un caso de prueba para validar herramientas de carga de políticas (`robotctl`, daemon).
- Pruebas de robustez y estrés del hardware: una política de sprint perpetua permite someter a los rollers y actuadores a ciclos de carga continuos para medir calentamiento, desgaste y deriva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es cualitativo y propio: finalización en aproximadamente 1,6 segundos en sus pruebas, sin especificar la pista, la carga ni las condiciones.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 0.0 GB, lo que indica un artefacto muy pequeño, pero no se publica el número de parámetros ni el tamaño exacto del ONNX.
- GPU recomendadas: no disponibles para inferencia; el entrenamiento documentado se realizó con 2048 entornos paralelos, lo que implica un acelerador de gama alta, pero no se especifica el modelo de GPU empleado.
- Compatibilidad con GPU de consumo: no disponible como dato publicado; por el tamaño aparente del artefacto, la inferencia en CPU es plausible, pero no está confirmado en la información.
- Opciones de despliegue: `robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-2-z` (daemon de microduck); inferencia del grafo `policy.onnx` con cualquier runtime ONNX compatible.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por ciclo de control); no se publican latencias de inferencia medidas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de la misma familia (`roller-1`, otras políticas de sprint) con especificaciones publicadas, ni políticas comparables de otros autores con parámetros, contexto o licencia documentados.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier expectativa en ese sentido es un error de categoría.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier explotación.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento no es bit-reproducible; los pesos publicados no se pueden regenerar de forma idéntica.
- Rendimiento reportado solo por el autor, sin protocolo de medición público (pista, carga, condiciones de los rollers), por lo que el dato de 1,6 s no es verificable de forma independiente.
- Especialización estrecha: la política está entrenada para sprint sobre rollers; no se declara robustez ante terrenos, pendientes, cargas o perturbaciones distintas de las del entorno de entrenamiento.
- Riesgo de fallo silencioso en hardware real: al ser una política perpetua sin condición de terminación, un comportamiento degradado no se detiene por sí solo; requiere supervisión y un mecanismo externo de parada.
- Sin datos de sesgo, alucinación ni cobertura idiomática aplicables, pero tampoco se documentan evaluaciones de seguridad, estabilidad ni límites de par de los actuadores.
- Artefacto con 0 descargas y 0 likes: sin validación por parte de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-z
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges (rama `race-2`, commit `b44f7ffc9`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
- QuackPack (seguimiento de carreras y copas en iPhone): https://www.imundo.ch/quackpack/
