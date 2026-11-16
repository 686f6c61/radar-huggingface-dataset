# GinDuck/microduck-roller-sprint-2m-roller-2-m

## Resumen

`microduck-roller-sprint-2m-roller-2-m` es un checkpoint de política de control para el robot cuadrúpedo de bajo coste microduck, desarrollado por el usuario GinDuck y publicado en Hugging Face. No es un modelo de lenguaje ni un modelo generativo de propósito general: es una política de refuerzo (reinforcement learning) entrenada para que el robot se desplace sobre ruedas (rollers) a máxima velocidad, abandonando el patrón de patinaje de versiones anteriores. El modelo se distribuye como un artefacto ONNX con el normalizador de observaciones embebido y un manifiesto de política compatible con el daemon `robotctl` de microduck.

La política opera a 50 Hz, consume observaciones de 61 dimensiones y emite 14 acciones de control, y está diseñada para ejecutarse de forma perpetua (bucle de marcha) hasta que se le indique lo contrario. Según el autor, completa el recorrido de sprint en aproximadamente 1,5 a 1,6 segundos en sus propias pruebas. El entrenamiento se realizó con el framework `mjlab` sobre 2048 entornos paralelos durante 6000 iteraciones máximas, con semilla 1, y se corresponde con el checkpoint 5000 del run `roller-2`.

Su relevancia es acotada pero clara dentro del ecosistema de robótica open source: demuestra un flujo reproducible de entrenamiento de políticas de locomoción para un robot educativo de bajo coste, con receta compartida por la comunidad (TheSauceman) y artefactos listos para desplegar en hardware real mediante un único comando. No aporta innovaciones en arquitecturas de redes neuronales ni datos de entrenamiento a gran escala; su valor está en la trazabilidad del pipeline y en la portabilidad del artefacto ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning exportada a ONNX; topología de red no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 dimensiones por paso, 50 Hz) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La model card no describe la topología interna de la red (capas, anchura, función de activación ni tipo de política, p. ej. MLP o red recurrente). Lo que sí se especifica es la interfaz: observación de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz, con el normalizador de observaciones integrado en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. La política es de tipo perpetuo: genera una marcha continua hasta recibir instrucción de parada, y se carga en una ranura (slot) de política gestionada por el daemon `robotctl`.

El entrenamiento se realizó con `mjlab` (versión base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre el repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. Se usaron 2048 entornos paralelos, un máximo de 6000 iteraciones, semilla 1 y logging a TensorBoard bajo el nombre de run `roller-2`, tomando el checkpoint 5000. El autor advierte explícitamente que el proceso no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock` y semilla produce una política comparable, no los mismos pesos. La receta de entrenamiento es compartida por TheSauceman y la tarea se identifica como `Mjlab-RollerSprint2m-MicroDuck`.

## Capacidades

- Locomoción sobre ruedas (rollers) para el robot microduck: genera una marcha de sprint orientada a velocidad, no a patinaje.
- Control reactivo a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Ejecución perpetua: mantiene la marcha hasta que se le indique lo contrario, apta para cargarse en un slot de política del daemon.
- Autocontenida: el normalizador de observaciones está embebido en el ONNX, lo que simplifica la integración (se alimentan observaciones crudas).
- Reproducibilidad documentada del pipeline de entrenamiento (código, commit, semilla y comando exactos).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, multilingüismo, visión, audio ni modo de pensamiento: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Investigación en locomoción con refuerzo: servir como línea base reproducible para comparar recetas de entrenamiento de marcha sobre ruedas en microduck, usando el mismo comando y semilla documentados.
- Benchmark de velocidad en competiciones de microduck: la política está entrenada para un objetivo de sprint (~1,5–1,6 s según el autor) y encaja en pruebas cronometradas de la rama `race-2` del repositorio de retos.
- Despliegue en hardware real mediante `robotctl`: cargar la política en un slot con un solo comando (`sudo robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-2-m`) para validar el pipeline de extremo a extremo desde el entrenamiento hasta el robot físico.
- Docencia y divulgación en robótica: ejemplo completo y trazable de un flujo de RL (entorno simulado, entrenamiento masivo en paralelo, exportación ONNX y despliegue) para cursos y talleres con hardware de bajo coste.
- Integración en pipelines de simulación a realidad: usar el artefacto ONNX como referencia para estudiar transferencia sim-to-real y sensibilidad a perturbaciones en un robot de 14 actuaciones.
- Base para ajuste fino o destilación: al ser un checkpoint intermedio (iteración 5000 de 6000) con receta pública, sirve como punto de partida para experimentos de continuación de entrenamiento o de destilación a políticas más ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento aportado por el autor es cualitativo y referido a sus propias pruebas: el recorrido de sprint se completa en aproximadamente 1,5 a 1,6 segundos. No se especifican métricas estándar de RL (retorno medio, tasa de éxito, robustez ante perturbaciones) ni comparaciones numéricas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se documenta el tamaño del modelo. Al tratarse de una política de control de 61 entradas y 14 salidas exportada a ONNX, es presumible que sea muy ligera, pero el dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponibles. Para el entrenamiento se emplearon 2048 entornos paralelos, lo que exige una GPU de datacenter (A100/H100 o similar), pero la model card no especifica el hardware utilizado.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos sobre si el entrenamiento cabe en una RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el artefacto está pensado para ejecutarse en el robot mediante el daemon `robotctl` (`policy load`), con `policy.onnx` y `manifest.json` como artefactos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control). No se publican latencias de inferencia medidas ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno / robot | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-roller-sprint-2m-roller-2-m (GinDuck) | Política RL (ONNX) | microduck sobre rollers | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| Otros checkpoints del run `roller-2` del mismo autor | Política RL | microduck sobre rollers | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Políticas de la rama `race-2` de microduck-challenges | Políticas RL de la comunidad | microduck | no disponible | no disponible | no disponible | Repositorio GitHub |

No se dispone de datos numéricos comparativos (parámetros, contexto, rendimiento) de alternativas, por lo que la comparación se limita a la categoría y al ecosistema. No se conocen modelos comparables con especificaciones verificables en la información disponible.

## Limitaciones y advertencias

- Específico de hardware: solo es válido para el robot microduck con rollers; no es transferible a otras plataformas ni a configuraciones sin ruedas.
- Sin licencia declarada: la ausencia de licencia explícita impide asumir permisos de uso comercial, modificación o redistribución. Conviene contactar con el autor antes de cualquier uso en producción.
- Sin datos de seguridad ni de robustez: no se documentan pruebas ante perturbaciones, terrenos variables, fallos de actuadores o condiciones fuera de distribución.
- Rendimiento autodeclarado: el dato de 1,5–1,6 s proviene de las pruebas del propio autor y no está verificado de forma independiente ni acompañado de metodología.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento no es bit-reproducible; los pesos no pueden regenerarse de forma idéntica.
- Checkpoint no final: corresponde a la iteración 5000 de un máximo de 6000, por lo que no representa necesariamente el mejor punto del run.
- Sin información sobre sesgos, alucinación o idiomas: no aplica al no ser un modelo de lenguaje, pero tampoco se documentan modos de fallo de la política.
- Trazabilidad mínima: sin paper, sin blog técnico y sin métricas de evaluación publicadas; la documentación se limita a la model card y al repositorio de retos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-m
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Rama de entrenamiento: `race-2`, commit `b44f7ffc9` (en el repositorio anterior)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
