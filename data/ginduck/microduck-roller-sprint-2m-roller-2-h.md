# GinDuck/microduck-roller-sprint-2m-roller-2-h

## Resumen

`roller-sprint-2m-roller-2-h` es un checkpoint de política de refuerzo (reinforcement learning) desarrollado por el usuario GinDuck para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general, sino de una política de control motriz entrenada mediante aprendizaje por refuerzo en simulación y exportada a ONNX para su despliegue directo en el robot. El modelo resuelve una tarea concreta: hacer que el microduck se desplace rodando sobre ruedas (rollers) a máxima velocidad, abandonando el patrón de patinaje de checkpoints anteriores.

El checkpoint corresponde a la segunda iteración de entrenamiento del autor ("roller run"), con receta compartida por el usuario TheSauceman, y completa cada episodio de desplazamiento en aproximadamente 1,5 segundos. La política opera a 50 Hz con una observación de 61 dimensiones y 14 acciones de control, y está diseñada como política perpetua: se ejecuta de forma continua hasta que se le indique lo contrario.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación en robótica con muy poca tracción pública (0 descargas, 0 likes en el momento de la consulta) y sin model card con especificaciones de licencia o idioma. Es útil como ejemplo de pipeline de entrenamiento RL con mjlab y como política desplegable en hardware microduck, no como componente de aplicaciones de software general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para robótica entrenada con reinforcement learning (no se especifica la topología de red; exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La política se entrenó con el framework mjlab (base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre la tarea `Mjlab-RollerSprint2m-MicroDuck`, en la rama `race-2` del repositorio `pollen-robotics/microduck-challenges`, commit `b44f7ffc9`. El entrenamiento se ejecutó con 2048 entornos paralelos, un máximo de 6000 iteraciones, semilla 1 y logging en TensorBoard, partiendo del checkpoint 4500. La observación tiene 61 dimensiones y la acción 14 dimensiones, con una frecuencia de control de 50 Hz sobre ruedas (rollers).

El artefacto desplegable incorpora el normalizador de observaciones directamente dentro de `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado externo. El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica. No se detalla en la información disponible la composición del dataset (en RL se trata de experiencia generada en simulación) ni el uso de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Control motriz de un robot cuadrúpedo microduck equipado con rollers, con locomoción orientada a velocidad (sprint) en lugar de patinaje.
- Política perpetua: se ejecuta de forma continua hasta que el operador la detiene o la sustituye.
- Observación de 61 dimensiones y 14 acciones a 50 Hz, con normalizador de observaciones integrado en el ONNX.
- Despliegue mediante `robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-2-h`, cargando la política en una ranura del daemon del robot.
- Compatibilidad con el manifiesto de políticas microduck esquema 2 (`docs/policy-manifest.md` en el repositorio del daemon).
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo thinking: no es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción con ruedas: usar la política como línea base de sprint sobre rollers para comparar recetas de entrenamiento RL y medir tiempos de episodio (aproximadamente 1,5 s por run).
- Demostraciones de robot cuadrúpedo en ferias o laboratorios: cargar la política en una ranura del microduck mediante `robotctl` para mostrar desplazamiento rápido continuo sin intervención.
- Reproducción de experimentos: clonar `microduck-challenges`, hacer checkout del commit `b44f7ffc9`, sincronizar con `uv sync` y relanzar el comando de entrenamiento con la misma semilla para obtener una política comparable.
- Evaluación de pipelines de exportación ONNX: verificar que el normalizador integrado en `policy.onnx` produce el mismo comportamiento que el pipeline de entrenamiento al alimentar observaciones en bruto.
- Benchmarking de hardware microduck: medir latencia y estabilidad del control a 50 Hz en el robot real frente a la simulación con 2048 entornos.
- Docencia en robótica y RL: emplear el manifiesto y el flujo `robotctl policy load` como ejemplo didáctico de despliegue de políticas entrenadas en simulación sobre hardware de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento aportado por el autor es que la política completa cada episodio de desplazamiento en aproximadamente 1,5 segundos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política de control exportada a ONNX, la huella es presumiblemente mínima, pero el tamaño del repositorio figura como 0.0 GB y no se detalla el tamaño del fichero ONNX.
- GPU recomendadas: no disponible para inferencia en robot; para reentrenamiento, el comando de referencia usa 2048 entornos paralelos, lo que implica una GPU de gama alta (no se especifica el modelo concreto).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: `robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-2-h` sobre el daemon de microduck; ejecución del ONNX en el propio robot.
- Latencia y throughput: frecuencia de control de 50 Hz; no se publican cifras de latencia por inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-roller-sprint-2m-roller-2-h | Política RL para microduck (rollers, sprint) | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| Otros checkpoints de la serie "roller run" del mismo autor | Políticas RL para microduck | no disponible | no aplica | no disponible | no verificable en la información disponible |
| Políticas base de microduck (Pollen Robotics) | Políticas RL de referencia para microduck | no disponible | no aplica | no disponible | repositorio `pollen-robotics/microduck-challenges` |

No se dispone de datos de benchmarks ni de especificaciones de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento; su uso está restringido al control del robot microduck con rollers.
- Licencia no disponible: no puede asumirse permiso para uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Entrenamiento no reproducible bit a bit: la misma semilla y el mismo `uv.lock` generan políticas comparables pero no idénticas, lo que complica la auditoría y la validación regulatoria.
- Especialización extrema: la política está entrenada para una tarea y morfología concretas (rollers, sprint, 50 Hz, 61-D de observación, 14 acciones); no se espera transferencia a otras configuraciones del robot.
- Sin datos de sesgos, alucinación o robustez: no se publican evaluaciones de estabilidad ante perturbaciones, terrenos variables o fallos de sensores.
- Tracción pública nula en el momento de la consulta (0 descargas, 0 likes) y ausencia de documentación adicional fuera de la model card, lo que limita la validación independiente.
- El repositorio figura con tamaño 0.0 GB, dato que puede indicar una medición redondeada o un artefacto aún no completamente subido; conviene verificar la integridad de `policy.onnx` y `manifest.json` antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-h
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Commit de entrenamiento: `b44f7ffc9` en la rama `race-2` de `microduck-challenges`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
