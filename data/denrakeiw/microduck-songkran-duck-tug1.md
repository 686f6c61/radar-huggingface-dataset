# DenRakEiw/microduck-songkran-duck-tug1

## Resumen

`microduck-songkran-duck-tug1` es una política de control entrenada mediante aprendizaje por refuerzo (PPO) para el robot cuadrúpedo de bajo coste Microduck, comercializado por Hugging Face a 399 USD. El modelo no es un modelo de lenguaje: es un controlador neuronal exportado a ONNX que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensado para ejecutarse en el bucle de control del robot. Lo publica el usuario DenRakEiw bajo el marco de trabajo `microduck`, con la librería de simulación mjlab y el repositorio de retos de Pollen Robotics.

La política implementa la tarea "Tug of War" (tiro de guerra) de la receta de Pollen: el aprendiz arranca como el pato de referencia y entrena 1000 iteraciones PPO contra él, con el checkpoint 999 como resultado final. Se trata de una política de tipo *perpetuo*: una marcha que se carga en una ranura de política del robot y se ejecuta de forma continua hasta que se le indique lo contrario.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento, exportación y despliegue de políticas de RL para robótica de bajo coste, con el normalizador de observaciones embebido en el propio `policy.onnx` y un manifiesto conforme al esquema 2 del daemon de Microduck. No hay información sobre licencia, idiomas ni parámetros totales de la red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles internos no disponibles); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el normalizador de observaciones va embebido en `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (marcha continua hasta recibir orden de parada) |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de activación ni si emplea memoria recurrente). Lo que sí se especifica es el contrato de entrada/salida: observación de 61 dimensiones, 14 acciones, ejecución a 50 Hz, con el normalizador de observaciones integrado en el grafo ONNX de modo que el despliegue acepta observaciones en crudo. El entrenamiento se realizó con PPO en el simulador mjlab (base `mjlab-microduck 0.1.0 @ 1efd853be`), tarea `Mjlab-TugOfWar-MicroDuck`, con 4096 entornos paralelos, 1000 iteraciones máximas, semilla 1 y checkpoint final 999.

El procedimiento sigue la receta "tug" de Pollen: el aprendiz parte con los pesos del pato de referencia y se entrena contra esa referencia, lo que produce una política que compite en el tiro de guerra. La reproducibilidad no es bit a bit: el autor indica que repetir el entrenamiento con el mismo código, `uv.lock`, comando y semilla produce una política comparable pero no idéntica, por la no determinación del RL en GPU. El commit de referencia es `97e2b1fe2` en la rama `denrakeiw-070` del repositorio `microduck-challenges`.

## Capacidades

- Control locomotor continuo del Microduck a 50 Hz con 14 acciones y 61 observaciones.
- Ejecución de una marcha perpetua: la política corre de forma indefinida hasta que se descarga o se sustituye.
- Comportamiento de tiro de guerra (Tug of War) entrenado contra un pato de referencia.
- Despliegue directo en robot mediante `robotctl policy load <slot> DenRakEiw/microduck-songkran-duck-tug1`.
- Ingesta de observaciones en crudo: el normalizador está embebido en el ONNX, sin preprocesado externo.
- Compatibilidad con el manifiesto de políticas de microduck (esquema 2), lo que permite cargarla en ranuras de política del daemon.
- Inferencia ONNX, apta para ejecución en el propio robot sin dependencias de un runtime de aprendizaje profundo pesado.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.

## Casos de uso

- Despliegue de referencia en Microduck: cargar la política en una ranura con `robotctl policy load` para disponer de una marcha funcional inmediata en el robot físico, útil para validar la cadena de despliegue antes de entrenar políticas propias.
- Competición de tiro de guerra: usar esta política como contrincante o como línea base en la tarea `Mjlab-TugOfWar-MicroDuck`, comparando políticas candidatas contra un oponente ya entrenado.
- Evaluación de robustez de controladores: al ser una política perpetua, sirve para pruebas prolongadas de estabilidad, consumo y deriva en el robot real sin necesidad de episodios con reinicio.
- Docencia e investigación en RL para robótica: el repositorio de retos, el comando de entrenamiento y la semilla documentados permiten reproducir el pipeline completo (simulación con 4096 entornos, PPO, exportación ONNX) como material de prácticas.
- Base para *fine-tuning* o continuación de entrenamiento: al partir de la receta "tug" con pesos de referencia, es un punto de arranque razonable para experimentar con variantes de recompensa o de escenario.
- Integración en pipelines de CI para políticas robóticas: el formato ONNX más manifiesto versionado permite automatizar la validación de que una política nueva carga y responde en el daemon antes de flashearla en hardware.
- Demostración de robótica de bajo coste: con un robot de 399 USD, esta política ilustra un caso completo de RL aplicado a un cuadrúpedo asequible para talleres y prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta la configuración de entrenamiento (tarea, semilla, checkpoint 999, 1000 iteraciones PPO, 4096 entornos) y no incluye métricas de recompensa, tasa de éxito ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0.0 GB y la red es de pequeña escala (61 entradas, 14 salidas), por lo que la inferencia ONNX debería caber en el propio robot o en cualquier GPU de consumo; no se publica cifra concreta.
- GPU recomendadas para entrenamiento: no especificadas por el autor. El comando de entrenamiento usa 4096 entornos paralelos en mjlab, lo que en la práctica exige una GPU de datacenter (A100, H100 o similar); no se confirma modelo concreto en la información disponible.
- GPU de consumo: no hay datos publicados sobre si el entrenamiento cabe en una RTX 4090 u otras GPU consumer. La inferencia, por el tamaño del artefacto, es viable en hardware modesto, pero no se aporta medición.
- Opciones de despliegue: runtime ONNX en el robot a través del daemon `robotctl` (librería `microduck`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política está diseñada para operar a 50 Hz (periodo de 20 ms por paso de control); no se publican latencias medidas ni throughput en el robot.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / acciones | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-songkran-duck-tug1 | Política RL para Microduck (ONNX) | 61 / 14 a 50 Hz | PPO, 1000 iteraciones, checkpoint 999, semilla 1 | no disponible | Hugging Face (0 descargas, 0 likes) |
| DenRakEiw/microduck-songkran-duck_7214 | Política RL para Microduck | no disponible | Reto "Sock Heist": sprint race retrenada, checkpoint 1575, pulido con estrategias evolutivas en CPU | no disponible | Hugging Face |
| Políticas de referencia de Pollen (receta "tug" original) | Política RL de referencia | 61 / 14 (contrato del robot) | Receta base sobre la que se entrena el aprendiz | no disponible | Repositorio `microduck-challenges` |

La comparación cuantitativa de rendimiento entre estas políticas no está disponible: ninguna de las fichas consultadas publica métricas de recompensa ni tasas de éxito comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser una política de control entrenada en simulación, su comportamiento puede degradarse ante condiciones físicas no modeladas (fricción, desgaste, superficies distintas).
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de comportamientos no previstos fuera de la distribución de entrenamiento, con posibles caídas o daños mecánicos en el robot.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje. Su "contexto" es la observación de 61 dimensiones en cada paso de control.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede confirmarse el uso comercial. Debe verificarse antes de cualquier despliegue en producto.
- Reproducibilidad: el propio autor advierte de que el entrenamiento no es bit a bit reproducible entre máquinas; los pesos exactos no pueden regenerarse de forma idéntica.
- Simulación frente a realidad: no se documenta *sim-to-real* explícito ni validación en hardware físico en la información disponible.
- Madurez y soporte: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-08), sin histórico de mantenimiento; no hay garantías de soporte.
- Dependencia de infraestructura: requiere el daemon de Microduck y el esquema 2 del manifiesto de políticas; cambios de esquema pueden romper la carga.

## Enlaces

- Hugging Face: https://huggingface.co/DenRakEiw/microduck-songkran-duck-tug1
- Política relacionada del mismo autor: https://huggingface.co/DenRakEiw/microduck-songkran-duck_7214
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Noticia sobre el lanzamiento del Microduck (TechCrunch): https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
