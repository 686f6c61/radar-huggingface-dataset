# iaeval2026-submission/qwen3-8b-knapsack-lora-stateless-seed777

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3-8B, publicado de forma anónima como material suplementario para una revisión de doble ciego en un workshop de NeurIPS. El adaptador, identificado como `qwen3-8b-knapsack-lora-stateless-seed777`, forma parte de un conjunto de seis adaptadores (tres semillas × dos regímenes de entrenamiento) diseñados para la tarea agéntica "Opaque Knapsack", un problema de optimización combinatoria con restricciones no transparentes.

El entrenamiento se realizó con el framework Axolotl 0.13.2, utilizando una base cuantizada a 4-bit NF4 y una configuración LoRA con rango 64 y alpha 128. El régimen "stateless" implica que el intérprete de Python utilizado por el agente se reinicia en cada turno, lo que afecta a la semántica de entrenamiento. El adaptador está pensado para ser cargado sobre el modelo base mediante la librería `peft` de Hugging Face, y su tamaño de repositorio es de 0.7 GB.

La relevancia de este lanzamiento radica en su contribución al estudio de cómo los agentes aprenden a usar su runtime durante el entrenamiento, un área emergente en la investigación de sistemas agénticos. Al ser una publicación anónima para revisión, no se incluyen datos de rendimiento ni benchmarks públicos, y la licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-8B (Transformer decoder, atención causal) |
| Parametros totales | Adaptador: ~0.7 GB (repo); modelo base: 8B (no incluido) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrenamiento: 16384 tokens; modelo base Qwen3-8B soporta hasta 32768 tokens (según documentación de Qwen3) |
| Tipos de cuantizacion | Base entrenada con 4-bit NF4; el adaptador se distribuye en precisión completa (safetensors) |
| Idiomas soportados | No disponible para el adaptador; el modelo base Qwen3-8B es multilingüe (principalmente inglés y chino) |
| Licencia | No disponible (el adaptador no especifica licencia; el modelo base Qwen3-8B tiene su propia licencia, consultar en su repositorio) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo Qwen3-8B, un transformer decoder con atención causal y 8 mil millones de parámetros. El fine-tuning se realizó mediante LoRA, aplicando matrices de bajo rango a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y a las capas del MLP (`gate_proj`, `up_proj`, `down_proj`). La configuración LoRA usa rango 64, alpha 128 y dropout 0.05.

El entrenamiento se llevó a cabo con Axolotl 0.13.2, sobre una base cuantizada a 4-bit NF4. Se usaron 3 épocas, un learning rate de 1e-4 con scheduler coseno, optimizador AdamW, micro-batch de 1 y acumulación de gradientes de 16, lo que da un batch efectivo de 16. La longitud de secuencia se fijó en 16384 tokens, sin sample packing. Los datos de entrenamiento consisten en trazas pareadas del régimen "stateless", donde el intérprete de Python se reinicia en cada turno del agente. El procedimiento de emparejamiento y filtrado se describe en el apéndice del paper asociado.

La innovación principal no está en la arquitectura del adaptador, sino en el régimen de entrenamiento: al resetear el estado del intérprete en cada turno, el modelo aprende a operar sin depender de memoria persistente entre pasos, lo que puede influir en su capacidad para razonar sobre el estado del entorno.

## Capacidades

- Especializado en la tarea "Opaque Knapsack", un problema de optimización combinatoria donde el agente debe seleccionar elementos con restricciones no visibles directamente.
- Hereda las capacidades generales del modelo base Qwen3-8B: generación de texto, razonamiento, instrucciones, y cierto soporte multilingüe.
- No se han documentado capacidades adicionales como tool calling, function calling o modo de pensamiento explícito más allá de las del base.
- El adaptador está diseñado para ser usado en entornos agénticos con un runtime de Python stateless, lo que implica que el modelo debe generar acciones y razonamientos sin depender de estado previo del intérprete.
- No se dispone de información sobre soporte de visión, audio u otras modalidades.

## Casos de uso

- Investigación en sistemas agénticos: el adaptador sirve para estudiar cómo los agentes aprenden a interactuar con un runtime stateless, comparando con el régimen persistente (los otros adaptadores de la colección).
- Evaluación de robustez en entornos no deterministas: al resetear el estado del intérprete, el modelo debe adaptarse a condiciones sin memoria, útil para probar la generalización de agentes.
- Reproducción de experimentos del paper "Agents Learn Their Runtime": permite verificar los resultados de la publicación anónima y explorar variaciones con diferentes semillas.
- Fine-tuning adicional sobre tareas de optimización combinatoria: el adaptador puede servir como punto de partida para ajustar modelos en problemas similares de mochila o planificación.
- Benchmarking de adaptadores LoRA en tareas agénticas: comparar el rendimiento de este adaptador con otros de la misma familia (persistent vs stateless, distintas semillas).
- Desarrollo de agentes con memoria externa: aunque el régimen es stateless, el modelo puede integrarse en sistemas donde la memoria se gestiona fuera del intérprete, por ejemplo mediante un bucle de control que mantenga el estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación, y al ser un lanzamiento anónimo para revisión, los datos de rendimiento se reservan para el paper. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.7 GB), pero requiere cargar el modelo base Qwen3-8B. Con cuantización 4-bit, el modelo base ocupa aproximadamente 5-6 GB de VRAM, más el adaptador y el contexto.
- Para inferencia con contexto de 16K tokens, se recomienda al menos 16 GB de VRAM (por ejemplo, una RTX 4080 o superior). Con cuantización 8-bit, se necesitan unos 10-12 GB.
- En GPUs de consumo como RTX 3090/4090 (24 GB) es viable, siempre que se use cuantización y gestión eficiente de memoria.
- Para despliegue, se puede usar `transformers` con `peft` para cargar el adaptador sobre el base. También es compatible con vLLM o TGI si se fusiona el adaptador en el modelo base (exportando a un checkpoint completo).
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables en la misma tarea. La colección "Agents Learn Their Runtime" incluye otros cinco adaptadores (variaciones de régimen y semilla), pero no se publican métricas comparativas. En cuanto al modelo base, Qwen3-8B se puede comparar con otros modelos de 8B como Llama 3.1 8B o Mistral 7B, pero el adaptador no altera las capacidades generales del base, solo lo especializa para la tarea de knapsack.

## Limitaciones y advertencias

- Lanzamiento anónimo para revisión: no hay garantía de soporte ni mantenimiento, y el código completo y los datos de entrenamiento se publicarán solo tras la revisión.
- Licencia no especificada: no se puede determinar si el adaptador es de uso libre o restringido. Se recomienda contactar con los autores (una vez desanonimizados) antes de usarlo comercialmente.
- Especialización limitada: el adaptador está entrenado únicamente para la tarea "Opaque Knapsack" en régimen stateless; su uso en otras tareas puede degradar el rendimiento respecto al modelo base.
- Riesgo de alucinación y sesgos: al ser un fine-tuning sobre un modelo base, puede heredar sesgos del preentrenamiento y generar respuestas incorrectas en contextos fuera de su dominio.
- Dependencia del runtime: el régimen stateless implica que el modelo no puede mantener estado interno entre turnos; si se usa con un runtime persistente, el comportamiento puede diferir del entrenado.
- Sin benchmarks públicos: no hay evidencia de rendimiento en tareas estándar, por lo que no se puede evaluar su calidad relativa.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/iaeval2026-submission/qwen3-8b-knapsack-lora-stateless-seed777
- Colección "Agents Learn Their Runtime": https://huggingface.co/collections/TieuDaoChanNhan/agents-learn-their-runtime
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper asociado (referencia en la colección): arXiv:2603.01209
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
