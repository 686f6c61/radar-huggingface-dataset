# nootxlm/microduck-tug-entry-3

## Resumen

microduck-tug-entry-3 es una política de control para robótica (pipeline `robotics`) publicada por el usuario nootxlm en Hugging Face. Se trata de un ajuste fino (finetune) del modelo jrubiosainz/microduck-tug-n3g53-50be8004, que se mantiene byte a byte, al que se le añade una capa externa de búsqueda exacta por observación (142 filas) para incorporar terminaciones regrabadas de las semillas 3 y 4, refinadas mediante búsqueda por coordenadas. El modelo está pensado para el robot microduck de Pollen Robotics y se ejecuta como política perpetua (gait) cargada en una ranura de política del demonio del robot.

La política opera con observaciones de 61 dimensiones y 14 acciones a 50 Hz, y se distribuye en formato ONNX con el normalizador de observaciones integrado en `policy.onnx`, de modo que acepta observaciones en bruto. El repositorio asociado es `pollen-robotics/microduck_rl` y el manifest sigue el esquema 2 del manifest de políticas de microduck.

Por su naturaleza, no es un modelo de lenguaje: no genera texto ni dispone de contexto conversacional, sino que produce comandos motores de bajo nivel para una tarea concreta de tiro de cuerda (tug-of-war) en arena. La información pública es muy escasa (0 descargas, 0 likes, repositorio de 0.0 GB) y varios campos clave, como licencia e idiomas, no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning exportada a ONNX; capa externa de búsqueda exacta por observación de 142 filas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (distribución en ONNX float32 según la model card) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), con `manifest.json` según esquema 2 |

## Arquitectura y entrenamiento

La model card describe una política perpetua para el robot microduck: recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, ejecutándose de forma continua hasta que se le indique lo contrario. El modelo base jrubiosainz/microduck-tug-n3g53-50be8004 se conserva íntegro y el ajuste consiste en una capa externa de búsqueda exacta por observación con 142 filas que incorpora terminaciones regrabadas de las semillas 3 y 4. Esa capa se pule mediante búsqueda por coordenadas sobre las últimas 15 y 25 llamadas, con escalas desde 0.003 hasta 3e-06, rondas de Jacobi, combinaciones verificadas y precisión float32.

El entrenamiento se enmarca en el repositorio `pollen-robotics/microduck_rl`, orientado a reinforcement learning. La model card no detalla el número de tokens, la composición del dataset ni si se emplearon RLHF o DPO, por lo que esos datos no están disponibles. La innovación destacable es la hibridación de una política neuronal exportada a ONNX con una capa de consulta exacta sobre observaciones, que sustituye o corrige las salidas en los casos registrados. La réplica oficial local reporta una media de suelo de 168.966168 cm sobre 5 semillas, con victorias en todas las rondas de foso (pit wins).

## Capacidades

- Control motor de bajo nivel para el robot microduck: 14 acciones a 50 Hz a partir de observaciones de 61 dimensiones.
- Ejecución perpetua: la política funciona como gait continuo hasta recibir una orden de parada o cambio.
- Integración con el demonio del robot mediante `robotctl policy load <slot> nootxlm/microduck-tug-entry-3`.
- Normalización de observaciones integrada en `policy.onnx`, por lo que acepta observaciones en bruto sin preprocesado externo.
- Comportamiento especializado en la tarea de tiro de cuerda en arena (tug-of-war), con terminaciones regrabadas para las semillas 3 y 4.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Ejecución de una gait de tiro de cuerda en el robot microduck: se carga la política en una ranura mediante `robotctl policy load` y el robot ejecuta el comportamiento de forma continua durante el combate.
- Evaluación de políticas en réplicas locales: la model card documenta una réplica oficial con 5 semillas y una media de suelo de 168.966168 cm, útil para comparar variantes del modelo base en condiciones controladas.
- Investigación en reinforcement learning aplicado a robótica: sirve como punto de partida para estudiar la hibridación de políticas neuronales ONNX con capas de búsqueda exacta por observación.
- Reproducción de experimentos de ajuste fino: al conservar el modelo base byte a byte, permite aislar el efecto de la capa externa de 142 filas sobre el rendimiento final.
- Despliegue en el demonio de microduck: el manifest sigue el esquema 2, lo que facilita la integración en el pipeline de gestión de políticas del robot.
- Docencia y demostraciones de robótica competitiva: el modelo ilustra un flujo completo desde el entrenamiento en `microduck_rl` hasta la ejecución en hardware real mediante ONNX.

## Benchmarks y rendimiento

La única métrica publicada en la información disponible es la de la réplica oficial local: media de suelo de 168.966168 cm sobre 5 semillas, con victorias en todas las rondas de foso. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo cual es coherente con que el modelo no sea un modelo de lenguaje.

| Metrica | Resultado | Condiciones |
|---|---|---|
| Media de suelo | 168.966168 cm | Réplica oficial local, 5 semillas |
| Victorias en foso | todas | Réplica oficial local, 5 semillas |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0.0 GB y la política se distribuye en ONNX float32, pero no se especifica el tamaño del grafo ni de los tensores.
- GPU recomendadas: no disponible. Al tratarse de una política de 61 entradas y 14 salidas ejecutada a 50 Hz, es plausible que quepa en hardware modesto, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el despliegue previsto es mediante el demonio de microduck y `robotctl policy load`; el formato ONNX permite inferencia con ONNX Runtime, aunque no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles; el único dato temporal es la frecuencia de operación de 50 Hz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nootxlm/microduck-tug-entry-3 | no disponible | no aplica (observación de 61 dimensiones) | media de suelo 168.966168 cm en réplica local | no disponible | Hugging Face, 0 descargas |
| jrubiosainz/microduck-tug-n3g53-50be8004 | no disponible | no aplica | no disponible | no disponible | Hugging Face (modelo base) |
| Otras políticas de microduck | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica a un modelo de políticas motoras; el riesgo equivalente es la generalización deficiente fuera de las condiciones de entrenamiento.
- Limitaciones de contexto o idioma: el modelo no procesa lenguaje ni contexto textual; está restringido a observaciones de 61 dimensiones y a la tarea de tiro de cuerda en arena.
- Especialización estrecha: la capa externa de 142 filas cubre terminaciones concretas de las semillas 3 y 4, por lo que su comportamiento fuera de esas condiciones depende del modelo base y no está documentado.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de un despliegue en producción.
- Métricas limitadas: solo se publica una media de suelo sobre 5 semillas en una réplica local, sin benchmarks estándar ni comparativas con otras políticas.
- Madurez: 0 descargas y 0 likes, creado y actualizado el 2026-11-19, lo que indica una validación comunitaria prácticamente nula.
- Dependencia del demonio: el despliegue requiere el demonio de microduck y el esquema 2 del manifest de políticas, lo que limita su uso fuera de ese ecosistema.

## Enlaces

- Hugging Face: https://huggingface.co/nootxlm/microduck-tug-entry-3
- Modelo base: https://huggingface.co/jrubiosainz/microduck-tug-n3g53-50be8004
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
