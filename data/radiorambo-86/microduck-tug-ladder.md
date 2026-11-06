# RadioRambo-86/microduck-tug-ladder

## Resumen

`microduck-tug-ladder` es una política de control entrenada por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal, sino de un controlador neuronal exportado a ONNX que traduce observaciones de 61 dimensiones en 14 acciones de actuación a 50 Hz, pensado para ejecutarse en el propio robot como una "política perpetua" (se ejecuta de forma continua hasta que se le indique lo contrario).

El modelo resuelve un problema muy concreto: proporcionar una marcha estable para la tarea de "tira y afloja" (Tug of War) definida en el entorno de simulación `Mjlab-TugOfWar-MicroDuck`, dentro del repositorio de retos `microduck-challenges`. Se entrena con aprendizaje por refuerzo en GPU (4096 entornos paralelos) usando el framework mjlab, y se distribuye como un artefacto de despliegue listo para cargarse en una ranura de política del daemon del robot mediante `robotctl`.

Es relevante en el ecosistema de robótica open source de bajo coste porque muestra el flujo completo sim-to-real de microduck: definición de tarea, entrenamiento masivo en simulación, exportación a ONNX con normalizador de observaciones embebido y despliegue en hardware real mediante una interfaz de línea de comandos. El repositorio es extremadamente pequeño (0,0 GB según Hugging Face) y no incluye información sobre arquitectura de red, número de parámetros ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política neuronal de RL exportada a ONNX; topología de red no especificada) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | No disponible (se distribuye como `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal (número de capas, anchura, tipo de activaciones). Lo que sí se documenta es el pipeline de entrenamiento: se usa el framework `mjlab` (versión base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre el repositorio `microduck-challenges`, rama `tug2`, commit `6ae02b6f4`. El entrenamiento se ejecutó con 4096 entornos paralelos en GPU, un máximo de 350 iteraciones del agente, guardado cada 50 iteraciones, semilla 32 y checkpoint final 550. La tarea es `Mjlab-TugOfWar-MicroDuck`, un escenario de tira y afloja donde el robot debe aplicar fuerzas de tracción de forma sostenida.

Una innovación práctica destacable es que el normalizador de observaciones está embebido dentro del propio `policy.onnx`, de modo que el robot puede alimentar observaciones crudas sin preprocesado externo. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política "comparable", no idéntica. La política es "perpetua": no tiene condición de terminación y se ejecuta hasta que el operador la descargue o la sustituya.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck con observaciones de 61 dimensiones y 14 acciones a 50 Hz.
- Ejecución de una marcha especializada en la tarea de tira y afloja (Tug of War) del entorno mjlab.
- Política perpetua: se ejecuta de forma continua sin condición de parada interna.
- Normalización de observaciones integrada en el grafo ONNX (entrada de observaciones crudas).
- Despliegue mediante la CLI `robotctl policy load <slot> RadioRambo-86/microduck-tug-ladder`.
- Compatibilidad con el manifiesto de políticas microduck schema 2.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio: es un controlador reactivo de robótica.

## Casos de uso

- Despliegue directo en robot microduck físico: cargar la política en una ranura con `robotctl policy load` y ejecutar la marcha de tira y afloja en el hardware real, aprovechando que el normalizador está embebido y no requiere preprocesado en el host.
- Investigación en sim-to-real: usar esta política como referencia de un pipeline completo mjlab → ONNX → robot para validar la transferencia de políticas entrenadas en 4096 entornos paralelos a un cuadrúpedo de bajo coste.
- Benchmark de controladores: comparar el rendimiento de esta política con otras políticas microduck en la misma tarea para evaluar el efecto de semillas, checkpoints o hiperparámetros de entrenamiento.
- Docencia y prototipado en robótica: al ser un artefacto pequeño (repositorio de 0,0 GB) y cargable por CLI, sirve para demostrar el ciclo de entrenamiento por refuerzo y despliegue en un robot educativo.
- Reproducción de experimentos: el comando de entrenamiento documentado (con `uv sync`, commit fijo y semilla 32) permite regenerar políticas comparables para estudiar la varianza del entrenamiento RL en GPU.
- Base para fine-tuning o currículos: partir de esta política como inicialización en tareas relacionadas del repositorio `microduck-challenges` (por ejemplo, otras variantes de tira y afloja o marchas) para acelerar la convergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del modelo no se documenta; el repositorio ocupa 0,0 GB, lo que sugiere un modelo muy pequeño, pero no se puede cuantificar).
- GPU recomendadas: no se especifican para inferencia; para entrenamiento se usó GPU con 4096 entornos paralelos (modelo de GPU no indicado).
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto es plausible que quepa en cualquier GPU de consumo, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: ONNX Runtime en el robot vía el daemon microduck y la CLI `robotctl`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso), dato documentado; no se publican cifras de latencia de inferencia del grafo ONNX.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck ni modelos comparables con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada exclusivamente para la tarea `Mjlab-TugOfWar-MicroDuck`; no se garantiza su comportamiento en otras tareas o terrenos.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en productos.
- Sin información de sesgos, alucinación o limitaciones de idioma: no aplican en el sentido habitual, pero tampoco se documentan modos de fallo del controlador (por ejemplo, comportamiento ante perturbaciones no vistas en simulación).
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento RL en GPU no es bit-reproducible; los pesos exactos no se pueden regenerar de forma determinista.
- Dependencia del ecosistema microduck: requiere el daemon, el manifiesto schema 2 y la CLI `robotctl`; no es un artefacto portable a otros robots sin adaptación.
- Sin métricas de rendimiento publicadas: no hay datos de éxito en la tarea, robustez ni comparación con otras políticas, lo que dificulta evaluar su calidad en producción.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/RadioRambo-86/microduck-tug-ladder
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges.git
- Rama de entrenamiento: `tug2`, commit `6ae02b6f4`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck
