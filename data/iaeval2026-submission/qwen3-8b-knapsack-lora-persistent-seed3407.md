# iaeval2026-submission/qwen3-8b-knapsack-lora-persistent-seed3407

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3-8B, liberado de forma anónima como material suplementario para una revisión de doble ciego en un workshop de NeurIPS. El adaptador está especializado en la tarea agéntica denominada "Opaque Knapsack" (mochila opaca), un problema de optimización combinatoria en el que un agente debe resolver instancias de mochila sin conocer los pesos y valores de los objetos de antemano, interactuando con un entorno. El régimen de entrenamiento es "persistente", lo que significa que el agente dispone de un runtime de Python que mantiene el estado entre turnos de la conversación, permitiendo acumular información a lo largo de la interacción.

El adaptador forma parte de un conjunto de seis variantes (tres semillas × dos regímenes: persistente y sin estado) diseñadas para estudiar el impacto del estado persistente en el rendimiento de agentes. Este modelo concreto usa la semilla 3407 y el régimen persistente. Al ser un adaptador LoRA, no modifica la arquitectura del modelo base, sino que añade matrices de bajo rango a las proyecciones de atención y de las capas feed-forward. El repositorio contiene únicamente los pesos del adaptador (0,7 GB), no el modelo completo.

La relevancia de este lanzamiento radica en su contribución a la investigación sobre agentes con memoria de ejecución, un área emergente en el desarrollo de sistemas autónomos. Al ser una liberación anónima y con fines de reproducibilidad, no se proporcionan datos de rendimiento ni benchmarks públicos, y su uso está pensado para la evaluación académica más que para aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (Qwen3-8B) |
| Parametros totales | 8B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16 384 tokens (secuencia de entrenamiento del adaptador) |
| Tipos de cuantizacion | Base entrenado con cuantizacion 4-bit NF4; adaptador en precision no especificada |
| Idiomas soportados | No disponible (depende del modelo base Qwen3-8B) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo Qwen3-8B, un transformer denso con atención causal. La técnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango en las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Los hiperparámetros del adaptador son `r=64`, `alpha=128` y `dropout=0.05`. El entrenamiento se realizó con Axolotl 0.13.2 sobre una versión cuantizada a 4-bit NF4 del modelo base, con una tasa de aprendizaje de 1e-4, scheduler coseno, optimizador AdamW, 3 épocas, micro-batch de 1 y acumulación de gradientes de 16 pasos. La longitud de secuencia se fijó en 16 384 tokens y no se usó empaquetado de muestras.

Los datos de entrenamiento consisten en "trazas emparejadas" (paired traces) generadas para el régimen persistente, es decir, registros de interacciones agente-entorno donde el estado del runtime de Python se conserva entre turnos. El procedimiento de emparejamiento y filtrado se detalla en el apéndice del artículo asociado, que no está disponible públicamente en esta fase de revisión. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el entrenamiento es de fine-tuning supervisado sobre las trazas.

## Capacidades

- Especializado en la tarea agéntica "Opaque Knapsack": el modelo debe resolver instancias del problema de la mochila interactuando con un entorno que oculta los pesos y valores de los objetos, tomando decisiones de inclusión o exclusión.
- Soporte de ejecución persistente: gracias al régimen de entrenamiento, el agente puede mantener un estado interno (variables, resultados intermedios) a través de múltiples turnos de conversación, lo que le permite acumular información y razonar de forma incremental.
- Hereda las capacidades generales del modelo base Qwen3-8B (generación de texto, razonamiento, comprensión de instrucciones, etc.), aunque no se han verificado específicamente para este adaptador.
- No se documenta soporte explícito de tool calling, function calling ni modos de pensamiento (thinking mode) más allá de la interacción con el runtime de Python propio de la tarea.
- Capacidades multilingües no especificadas; dependen del modelo base.

## Casos de uso

- Investigación académica sobre agentes con memoria de ejecución: el adaptador permite estudiar cómo el estado persistente afecta al rendimiento en tareas de optimización combinatoria, comparando con las variantes sin estado.
- Evaluación de regímenes de entrenamiento: al existir seis adaptadores (persistentes y stateless con distintas semillas), se puede analizar la variabilidad entre semillas y la robustez de cada régimen.
- Reproducción de resultados de un workshop: el modelo se publica para que otros investigadores puedan verificar los resultados del artículo anónimo, cargando el adaptador sobre Qwen3-8B y ejecutando las mismas trazas de evaluación.
- Desarrollo de agentes con runtime persistente: aunque no está pensado para producción, puede servir como punto de partida para experimentar con arquitecturas que mantienen estado en el intérprete.
- Benchmarking de adaptadores LoRA en tareas agénticas: permite comparar el rendimiento de LoRA frente a fine-tuning completo en escenarios de interacción multi-turno.
- Estudio de la influencia de la semilla en el entrenamiento de agentes: con las tres semillas disponibles, se puede medir la sensibilidad del entrenamiento a la inicialización aleatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se libera como material suplementario para revisión, y los datos de rendimiento (precisión en la tarea, comparaciones con otros métodos) se incluirán presumiblemente en el artículo tras el proceso de revisión.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,7 GB en disco, pero para la inferencia se necesita cargar el modelo base Qwen3-8B completo.
- VRAM estimada para el modelo base según cuantización (valores orientativos para Qwen3-8B):
  - 4-bit: ~5-6 GB
  - 8-bit: ~8-9 GB
  - FP16: ~16 GB
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para cuantización 4-bit (por ejemplo, RTX 3060, RTX 4060); para FP16 se requiere una GPU de 16 GB o más (RTX 4090, A100, etc.).
- El adaptador se puede cargar con la librería `peft` sobre el modelo base, tanto en frameworks de inferencia como Transformers, vLLM o TGI, siempre que soporten PEFT.
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para tareas agénticas con runtime persistente). Los únicos modelos relacionados son los otros cinco adaptadores del mismo grupo de investigación, que comparten base y configuración pero difieren en semilla y régimen de entrenamiento:

| Modelo | Regimen | Semilla | Diferencia principal |
|---|---|---|---|
| qwen3-8b-knapsack-lora-persistent-seed3407 | Persistente | 3407 | Este modelo |
| qwen3-8b-persistent-knapsack-lora-seed1337 | Persistente | 1337 | Misma configuracion, distinta semilla |
| qwen3-8b-stateless-knapsack-lora-seed1337 | Sin estado | 1337 | Regimen sin estado, misma semilla |

No se han publicado resultados comparativos entre estas variantes.

## Limitaciones y advertencias

- Modelo de investigación: liberado de forma anónima para revisión de un workshop; no está destinado a uso en producción.
- Licencia no especificada: no se indica bajo qué términos se distribuye el adaptador, lo que limita su uso comercial o la redistribución sin autorización explícita.
- Especialización extrema: el adaptador está entrenado únicamente para la tarea "Opaque Knapsack" con régimen persistente; su rendimiento en otras tareas no está garantizado y probablemente sea inferior al del modelo base sin adaptar.
- Riesgo de alucinación y sesgos: al ser un fine-tuning sobre un modelo base, puede heredar sesgos del Qwen3-8B y generar respuestas incorrectas fuera del dominio de la tarea.
- Dependencia del runtime persistente: el comportamiento del agente depende de que el entorno mantenga el estado del intérprete de Python; si se usa en un entorno sin esa persistencia, el modelo puede fallar.
- Sin datos de rendimiento: no hay benchmarks públicos que permitan evaluar su eficacia real, lo que impide comparaciones objetivas con otros enfoques.
- Reproducibilidad limitada: los datos de entrenamiento (trazas emparejadas) no se han publicado, solo el adaptador, lo que dificulta replicar el entrenamiento completo.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/iaeval2026-submission/qwen3-8b-knapsack-lora-persistent-seed3407
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Adaptador persistente semilla 1337: https://huggingface.co/TieuDaoChanNhan/qwen3-8b-persistent-knapsack-lora-seed1337
- Adaptador sin estado semilla 1337: https://huggingface.co/TieuDaoChanNhan/qwen3-8b-stateless-knapsack-lora-seed1337
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Documento de características de Qwen3-8B-Instruct (PDF): https://developer.nvidia.com/downloads/assets/ace/model_card/qwen3-8b-instruct.pdf
