# GinDuck/microduck-hill-climb-1m5-hill-2-d

## Resumen

`GinDuck/microduck-hill-climb-1m5-hill-2-d` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de locomoción que se carga en el demonio `robotctl` del robot y se ejecuta en bucle a 50 Hz hasta que se le indique lo contrario. El autor del checkpoint es el usuario de Hugging Face GinDuck, y la receta de entrenamiento es compartida con el usuario TheSauceman.

La política resuelve una tarea concreta: subir una rampa de 1,5 metros de altura a la máxima velocidad posible manteniendo la trayectoria. Según la model card, completa cada episodio en aproximadamente 1,4 segundos. Recibe una observación de 61 dimensiones y emite 14 acciones de control, con el normalizador de observaciones integrado directamente en el fichero `policy.onnx`, de modo que la política consume observaciones en crudo.

El checkpoint está entrenado con el framework `mjlab` (versión 0.1.0, commit `1efd853be`) sobre el repositorio `microduck-challenges`, rama `race-2`, commit `b44f7ffc9`, iteración 2250 y semilla 1, con 4096 entornos paralelos. Su relevancia es acotada: es un artefacto de investigación reproducible y de bajo nivel computacional, no un modelo generalista. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con RL (no se especifica la topología de red en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso, ejecución a 50 Hz |
| Tipos de cuantizacion | no disponible; pesos exportados a ONNX |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Framework de entrenamiento | mjlab 0.1.0 (commit `1efd853be`) |
| Checkpoint | iteración 2250, semilla 1 |
| Entornos paralelos en entrenamiento | 4096 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red neuronal (número de capas, tamaño de las capas ocultas ni tipo de red). Lo que sí se documenta es el pipeline: la política se entrena con `mjlab`, un framework de RL para locomoción, sobre la tarea `Mjlab-HillClimb1m5-MicroDuck` del repositorio `microduck-challenges` (rama `race-2`, commit `b44f7ffc9`). El entrenamiento se ejecutó con 4096 entornos simulados en paralelo, un máximo de 3000 iteraciones y semilla 1, registrando métricas en TensorBoard bajo el nombre de ejecución `hill-2`. El checkpoint publicado corresponde a la iteración 2250.

El artefacto exportado es un fichero ONNX que integra el normalizador de observaciones, de forma que el consumidor debe alimentar observaciones en crudo. El modelo se reproduce con el comando `uv run train Mjlab-HillClimb1m5-MicroDuck --env.scene.num-envs 4096 --agent.max-iterations 3000 --agent.seed 1 --agent.logger tensorboard --agent.run-name hill-2` sobre el mismo `uv.lock` y commit. El autor advierte explícitamente de que el RL con GPU no es bit-reproducible entre máquinas: repetir el entrenamiento produce una política comparable, no los mismos pesos. No se documenta el uso de RLHF, DPO ni innovaciones de decodificación, que no aplican a este tipo de modelo.

## Capacidades

- Locomoción cuadrúpeda sobre rampa: sube una pendiente de 1,5 metros manteniendo la línea de trayectoria.
- Política perpetua: se ejecuta en bucle hasta que se detiene explícitamente, sin condición de terminación propia.
- Control a 50 Hz con 14 acciones y observación de 61 dimensiones.
- Integración con el demonio `robotctl` mediante carga en un slot de política (`sudo robotctl policy load <slot> GinDuck/microduck-hill-climb-1m5-hill-2-d`).
- Normalización de observaciones integrada en el ONNX: no requiere preprocesado externo.
- Compatibilidad con el manifiesto de políticas de microduck, esquema 2.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio: es una política motora, no un modelo generativo.

## Casos de uso

- Investigación en locomoción con RL: sirve como referencia reproducible para comparar recetas de entrenamiento sobre la tarea `Mjlab-HillClimb1m5-MicroDuck`, dado que se publican commit, semilla e hiperparámetros exactos.
- Benchmark de velocidad en rampa: el modelo está optimizado para completar el ascenso en torno a 1,4 segundos, por lo que es útil como baseline de velocidad frente a otras políticas de la misma tarea.
- Demostración de carga de políticas en microduck: permite validar el flujo `robotctl policy load` y el esquema 2 del manifiesto en un robot real o simulado.
- Pruebas de robustez de seguimiento de línea: al mantener la trayectoria durante el ascenso, sirve para evaluar control lateral en pendiente con el hardware microduck.
- Punto de partida para fine-tuning: al estar entrenado sobre `microduck-challenges`, se puede reutilizar como inicialización para variantes de la tarea de escalada con distintas pendientes o velocidades.
- Validación de despliegue ONNX en robótica: el fichero `policy.onnx` con normalizador embebido es un ejemplo práctico de exportación de políticas de RL a un runtime de inferencia ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta una métrica de comportamiento: cada episodio de ascenso se completa en aproximadamente 1,4 segundos. No hay tablas de recompensa, tasa de éxito ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y la política se ejecuta como ONNX, por lo que la huella es mínima.
- GPU recomendadas: no se especifican; para inferencia en robot no se requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo o incluso en CPU, dado el tamaño del artefacto, aunque no se documenta oficialmente.
- Opciones de despliegue: runtime ONNX dentro del demonio `robotctl` de microduck; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: control a 50 Hz (20 ms por paso); no se publican cifras de latencia de inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GinDuck/microduck-hill-climb-1m5-hill-2-d | Política RL (ONNX) | Subida de rampa 1,5 m | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| GinDuck/microduck-hill-climb-1m5-hill-2 | Política RL (ONNX) | Subida de rampa 1,5 m | no disponible en la información | no disponible | no disponible | Hugging Face |
| GinDuck/microduck-hill-climb-1m5-hill-2-b | Política RL (ONNX) | Subida de rampa 1,5 m | no disponible en la información | no disponible | no disponible | Hugging Face |

Las dos alternativas listadas son variantes del mismo autor y la misma ejecución de entrenamiento; no se dispone de datos de rendimiento comparativo entre ellas ni de políticas de terceros equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo está entrenada para la tarea de ascenso de rampa de 1,5 metros; no es un modelo generalista ni transferible sin reentrenamiento.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Sin datos de sesgos ni de alucinación: no aplican métricas de modelos lingüísticos, pero tampoco se documenta el comportamiento ante perturbaciones del terreno fuera de la distribución de entrenamiento.
- Reproducibilidad limitada: el propio autor advierte de que el RL con GPU no es bit-reproducible; repetir el entrenamiento da una política comparable, no idéntica.
- Dependencia de versión: requiere el commit `b44f7ffc9` de `microduck-challenges` y `mjlab-microduck 0.1.0 @ 1efd853be` para reproducir el entrenamiento.
- Despliegue acoplado al ecosistema microduck: el manifiesto sigue el esquema 2 del demonio `robotctl`; no se documenta uso fuera de ese stack.
- Sin métricas de robustez publicadas: no hay tasas de éxito, varianza entre semillas ni evaluación en hardware real más allá de la duración del episodio.
- Repositorio sin actividad: cero descargas y cero likes en el momento de la consulta, sin evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-2-d
- Variante relacionada: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-2
- Variante relacionada: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-2-b
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
