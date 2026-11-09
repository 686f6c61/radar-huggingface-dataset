# jaippolito/microduck-sprint-ninja

## Resumen

microduck-sprint-ninja es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot bípedo microduck, un robot de 25 cm desarrollado por Pollen Robotics en colaboración con Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional de propósito general: es un controlador de locomoción que mapea observaciones de 61 dimensiones a 14 acciones de actuación a una frecuencia de 50 Hz, empaquetado en formato ONNX y distribuido a través del ecosistema de políticas de microduck.

La política se publica como una "gait" (marcha) perpetua: el controlador se ejecuta de forma continua hasta que se le indique lo contrario, y se carga en una ranura de política del daemon del robot mediante el comando `robotctl policy load`. El modelo se entrenó con el simulador mjlab (basado en MuJoCo) sobre la tarea `Mjlab-Sprint2m-MicroDuck`, con 4096 entornos paralelos y 1500 iteraciones de checkpoint sobre un máximo configurado de 3000.

Su relevancia es doble: por un lado, demuestra el flujo de trabajo completo de entrenamiento y despliegue de políticas de RL en robótica de bajo coste; por otro, forma parte del ecosistema abierto de microduck, un robot bípedo de 399-499 USD pensado para investigación y educación. La información pública disponible es muy limitada: el repositorio tiene 0 GB declarados, no se especifica licencia y no hay datos de benchmarks ni de rendimiento en el mundo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL empaquetada como grafo ONNX; arquitectura de red no especificada en la model card) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de control reactiva; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | No disponible (se distribuye como `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (schema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal (número de capas, anchura, tipo de capas o función de activación). Lo que sí se documenta es el pipeline de entrenamiento: la política se entrenó con mjlab, un entorno de RL para MuJoCo, sobre la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges` (commit `5cee942d8`). La configuración usó 4096 entornos simulados en paralelo, un máximo de 3000 iteraciones y semilla 1, con el checkpoint final en la iteración 1500. La base del entorno es `mjlab-microduck 0.1.0` en el commit `1efd853be`.

Un detalle técnico relevante es que el normalizador de observaciones está integrado dentro del propio `policy.onnx`: el consumidor debe alimentar observaciones en bruto (raw), sin preprocesar, y el grafo se encarga de la normalización. El modelo se distribuye junto a un `manifest.json` que sigue el esquema 2 del manifiesto de políticas del daemon de microduck, lo que permite cargarlo directamente en una ranura de política del robot. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: con el mismo código, `uv.lock`, comando y semilla se obtiene una política "comparable", no idéntica.

## Capacidades

- Locomoción bípeda continua: genera una marcha perpetua para el robot microduck a 50 Hz hasta que se detiene explícitamente.
- Control reactivo de bajo nivel: mapea 61 dimensiones de observación a 14 acciones de actuación en cada paso de control.
- Integración con el daemon del robot: se carga mediante `robotctl policy load <slot> jaippolito/microduck-sprint-ninja` en una ranura de política.
- Autocontención del preprocesado: el normalizador de observaciones está embebido en el grafo ONNX.
- Despliegue en formato ONNX: compatible con runtimes de inferencia ONNX estándar, sin dependencia de frameworks de RL en tiempo de ejecución.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.

## Casos de uso

- Investigación en locomoción bípeda: usar la política como línea base reproducible para comparar nuevas marchas entrenadas con mjlab sobre la misma tarea `Mjlab-Sprint2m-MicroDuck`.
- Docencia y talleres de RL en robótica: el flujo completo (clonar `microduck-challenges`, `uv sync`, `uv run train ...`) permite a estudiantes reproducir el entrenamiento y desplegarlo en un robot de bajo coste.
- Demostraciones de robot bípedo en ferias y eventos: la naturaleza perpetua de la marcha la hace adecuada para exhibiciones continuas donde el robot camina hasta recibir orden de parada.
- Pruebas de integración del daemon microduck: sirve como política de referencia para validar el cargador de ranuras, el esquema 2 del manifiesto y el pipeline ONNX del robot.
- Benchmarking de simulación a realidad: comparar el comportamiento de la política entrenada en MuJoCo con su ejecución en el hardware real para estudiar la brecha sim-to-real.
- Punto de partida para fine-tuning o destilación: al estar entrenada con semilla y configuración documentadas, puede servir como inicialización para políticas derivadas (por ejemplo, marchas con velocidad o dirección controladas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad alcanzada, estabilidad ni tasas de éxito en hardware real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una política de control de un robot de 25 cm con 61 entradas y 14 salidas, la huella es previsiblemente mínima (órdenes de kilobytes a pocos megabytes), pero el tamaño exacto del grafo ONNX no se documenta y el repositorio declara 0 GB.
- GPU recomendadas: no aplica para inferencia; el despliegue previsto es en la computadora integrada del propio robot microduck.
- GPU para entrenamiento: no especificadas. La configuración usa 4096 entornos paralelos en mjlab, lo que en la práctica requiere una GPU dedicada, pero el autor no indica modelo ni memoria.
- Cabe en GPU de consumo: no disponible como dato confirmado; por el tamaño típico de estas políticas es probable, pero no se ha verificado en la información proporcionada.
- Opciones de despliegue: runtime ONNX en el daemon de microduck mediante `robotctl policy load`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; el único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-ninja | Política de RL para microduck | ONNX | 61-D obs, 14 acciones, 50 Hz | No disponible | Hugging Face (0 descargas) |
| Otras políticas de microduck-challenges | Políticas de RL para microduck | No disponible | No disponible | No disponible | Repositorio `pollen-robotics/microduck-challenges` |
| Políticas de RL para robots bípedos de mayor tamaño | Políticas de RL | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Información muy escasa: no se documentan arquitectura de red, número de parámetros, licencia ni idiomas; cualquier uso en producción requiere contactar con el autor o inspeccionar el grafo ONNX.
- Licencia no especificada: sin licencia explícita, el uso comercial y la redistribución quedan en un limbo legal; no debe asumirse permiso de uso.
- Sin validación en hardware real publicada: no hay métricas de sim-to-real, estabilidad ni robustez ante perturbaciones.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento no es bit-reproducible; los pesos exactos no pueden regenerarse de forma determinista.
- Naturaleza perpetua de la marcha: la política camina hasta que se le ordena parar, sin lógica de parada autónoma documentada; requiere supervisión o un mecanismo externo de seguridad.
- Dependencia del ecosistema microduck: solo es utilizable con el daemon y el manifiesto de políticas de microduck; no es un modelo reutilizable fuera de ese robot.
- Ausencia de benchmarks: no hay evidencia cuantitativa de calidad de la marcha frente a otras políticas.
- Riesgo de alucinación: no aplica (no es un modelo generativo de lenguaje), pero sí existe riesgo de comportamiento fuera de distribución ante observaciones no vistas durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaippolito/microduck-sprint-ninja
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Artículo sobre microduck en MarkTechPost: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Sitio oficial de microduck: https://microducks.org/
