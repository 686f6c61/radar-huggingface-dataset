# mcemri/commenv-e1-t2-combined

## Resumen

`mcemri/commenv-e1-t2-combined` es un checkpoint de investigación publicado por el usuario mcemri, consistente en un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo base Qwen/Qwen3-4B. El objetivo del entrenamiento no es producir un asistente generalista, sino estudiar la comunicación emergente entre agentes: el modelo se entrena primero en solitario sobre puzles de lógica de rejilla ("quién vive en qué casa") y después como parte de un equipo de tres copias del mismo modelo, cada una con una parte de las pistas, que conversan a través de un tablero compartido durante un máximo de seis turnos y deben entregar la solución completa.

El resultado son checkpoints de investigación (steps 10, 20, 30 y 40), no un producto listo para uso comercial. El repositorio ocupa 131,9 GB porque incluye tanto los pesos exportados en formato Transformers (8,8 GB por checkpoint) como los estados del entrenador con pesos y estado del optimizador (22,5 GB por checkpoint, en 4 shards). No hay descargas ni likes registrados, lo que refleja su carácter de artefacto experimental reciente.

Su relevancia es metodológica: documenta una cadena de entrenamiento multiagente sobre un modelo pequeño (4B) con licencia Apache-2.0, lo que permite reproducir y extender el experimento sin restricciones de licencia. La arquitectura subyacente es la de Qwen3-4B, un transformer denso de la familia Qwen3, pero la ficha no aporta datos adicionales sobre contexto, cuantizaciones o idiomas más allá de lo indicado por el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B); ajuste fino con RL (GRPO) para comunicación multiagente |
| Parametros totales | 4B (según modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la información proporcionada; depende del modelo base) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (carpetas `export/global_step_{10,20,30,40}/policy`); checkpoints del entrenador en 4 shards con pesos y estado del optimizador |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B y se entrena mediante GRPO (Group Relative Policy Optimization) sobre puzles de lógica de rejilla cuyas pistas se reparten entre tres agentes. El run `e1_t2` arranca desde el checkpoint final de `mcemri/commenv-e1-c1-alone`, en el que un único agente dispone de todas las pistas y no hay tablero, y continúa durante 40 pasos de entrenamiento en modo equipo: tres copias del modelo, cada una con parte de la información, se comunican mediante un tablero compartido hasta seis turnos y cada agente debe emitir la solución completa. Existe un run paralelo, `mcemri/commenv-e1-t1-team`, que parte del modelo sin entrenar en lugar del modelo entrenado en solitario, lo que permite comparar ambos regímenes de inicialización.

El repositorio incluye checkpoints intermedios en los pasos 10, 20, 30 y 40, tanto en formato Transformers como en formato del entrenador (pesos y estado del optimizador en 4 shards de 22,5 GB), lo que facilita reanudar el entrenamiento. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset de puzles ni si se aplicaron fases adicionales de RLHF o DPO más allá del propio GRPO.

## Capacidades

- Generación de texto y razonamiento sobre puzles de lógica de rejilla ("quién vive en qué casa").
- Comunicación multiagente: el modelo está entrenado para intercambiar información con otras dos copias de sí mismo a través de un tablero compartido durante hasta seis turnos.
- Resolución distribuida de problemas: cada agente recibe solo una parte de las pistas y debe reconstruir la solución completa a partir de la conversación.
- Capacidades heredadas del modelo base Qwen3-4B (generación de texto general, código y matemáticas básicas), si bien el ajuste fino está orientado específicamente a la tarea de puzles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (no se documenta para este checkpoint).
- Soporte de agentes y razonamiento multi-paso: sí, en el sentido específico de agentes comunicantes sobre un tablero compartido, no como orquestación genérica de herramientas.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo "thinking" o visión no documentados para este checkpoint.

## Casos de uso

- Investigación en comunicación emergente entre agentes: el checkpoint permite reproducir el experimento de tres agentes que comparten un tablero y analizar qué protocolos de comunicación surgen tras 40 pasos de GRPO, comparándolo con el run que parte del modelo sin entrenar (`commenv-e1-t1-team`).
- Estudio de asignación distribuida de información: útil para analizar cómo se reparte y reconstruye información parcial en tareas de lógica, un problema análogo al de sistemas multiagente en producción con vistas parciales de datos.
- Punto de partida para nuevos experimentos de RL multiagente: al incluir checkpoints en los pasos 10, 20, 30 y 40 con estado del optimizador, se puede reanudar el entrenamiento y probar variaciones (más turnos, más agentes, otras tareas).
- Evaluación de técnicas GRPO en modelos pequeños: sirve como referencia para medir la estabilidad y el rendimiento de GRPO sobre un modelo de 4B en tareas de razonamiento estructurado.
- Docencia y divulgación: el par de runs (solitario vs. equipo) y la disponibilidad de checkpoints intermedios lo hacen adecuado para explicar el entrenamiento por refuerzo multiagente con ejemplos concretos y reproducibles.
- Base para prototipos de resolución colaborativa de puzles: se puede integrar en un entorno de simulación propio para probar variantes del tablero compartido y de las reglas de comunicación antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: cada checkpoint exportado ocupa 8,8 GB en safetensors, por lo que en precisión de 16 bits se necesita aproximadamente esa cantidad de VRAM más el overhead de activaciones y caché KV; con cuantización a 8 bits o 4 bits (no distribuida en el repo, habría que generarla) el requisito bajaría sustancialmente.
- GPU recomendadas: una GPU con al menos 16-24 GB de VRAM (RTX 4090, A10G, L4, A100) para inferencia en 16 bits; para entrenamiento o reanudación con estado del optimizador, se requieren GPUs de mayor memoria (A100 40/80 GB o H100) dado que cada checkpoint del entrenador ocupa 22,5 GB.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090) para inferencia en 16 bits; en 8 GB-12 GB solo con cuantización, que no está publicada.
- Opciones de despliegue: Transformers (carga documentada con `AutoModelForCausalLM` y `subfolder="export/global_step_40/policy"`); vLLM, llama.cpp, Ollama o TGI no están documentados en la información disponible, aunque al ser pesos safetensors estándar de un modelo Qwen3-4B podrían ser compatibles previa conversión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mcemri/commenv-e1-t2-combined | 4B | no disponible | RL multiagente sobre puzles de lógica | apache-2.0 | Hugging Face, checkpoints 10-40 |
| mcemri/commenv-e1-c1-alone | 4B | no disponible | RL en solitario sobre puzles de lógica (punto de partida de este run) | apache-2.0 (según repo) | Hugging Face |
| mcemri/commenv-e1-t1-team | 4B | no disponible | RL multiagente partiendo del modelo sin entrenar | apache-2.0 (según repo) | Hugging Face |
| Qwen/Qwen3-4B | 4B | no disponible en esta ficha | Modelo base generalista | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: el propio autor lo describe como "research checkpoints, not a product"; no está pensado para uso en producción.
- El ajuste fino está especializado en puzles de lógica de rejilla con comunicación multiagente, por lo que su comportamiento en tareas generales puede degradarse respecto al modelo base.
- No se documentan sesgos conocidos, pero al derivar de Qwen3-4B hereda los sesgos del modelo base y de los datos de entrenamiento del mismo.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas de lógica estructurada el riesgo existe y no hay métricas publicadas.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al ser un artefacto de investigación sin garantías, no se recomienda su uso comercial directo sin una evaluación propia.
- El repositorio ocupa 131,9 GB e incluye estados del entrenador que no son necesarios para inferencia; conviene descargar solo la subcarpeta `export/global_step_40/policy` (8,8 GB).
- No hay descargas ni likes registrados, lo que implica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/mcemri/commenv-e1-t2-combined
- Run de partida (agente único): https://huggingface.co/mcemri/commenv-e1-c1-alone
- Run de equipo desde el modelo sin entrenar: https://huggingface.co/mcemri/commenv-e1-t1-team
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
