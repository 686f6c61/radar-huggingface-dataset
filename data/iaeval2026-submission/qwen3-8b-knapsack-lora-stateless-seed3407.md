# iaeval2026-submission/qwen3-8b-knapsack-lora-stateless-seed3407

## Resumen

El modelo `iaeval2026-submission/qwen3-8b-knapsack-lora-stateless-seed3407` es un adaptador LoRA (Parameter-Efficient Fine-Tuning) sobre el modelo base Qwen/Qwen3-8B, liberado de forma anónima como material suplementario para una revisión doble ciego en un workshop de NeurIPS. El adaptador ha sido entrenado específicamente para la tarea agéntica "Opaque Knapsack", un problema de optimización de mochila con información parcial, bajo un régimen de entrenamiento denominado *stateless*, en el que el estado del intérprete de Python se reinicia en cada turno del agente. Esta liberación forma parte de un conjunto de seis adaptadores (tres semillas × dos regímenes: persistente y stateless) que permiten reproducir y comparar el efecto de la persistencia de estado en el rendimiento de agentes basados en LLM.

El adaptador tiene un tamaño de repositorio de 0,7 GB y se distribuye en formato safetensors, con la librería `peft`. Al estar basado en Qwen3-8B, hereda la arquitectura transformer decoder del modelo base, aunque el adaptador en sí no modifica la arquitectura, sino que añade matrices de bajo rango en los módulos de atención y MLP. La secuencia de entrenamiento se fijó en 16 384 tokens, lo que sugiere que el adaptador está optimizado para contextos largos, aunque el contexto máximo del modelo base no se especifica en la documentación proporcionada. No se han publicado resultados de benchmarks ni métricas de rendimiento, por lo que su evaluación queda limitada a la reproducción de los experimentos descritos en el paper asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-8B (transformer decoder) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 8 000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16 384 (secuencia de entrenamiento); contexto maximo del modelo base no especificado |
| Tipos de cuantizacion | Entrenado sobre base cuantizada 4-bit NF4; el adaptador se distribuye en precision completa (no se especifica) |
| Idiomas soportados | No disponible (hereda los del modelo base, no declarados) |
| Licencia | No disponible (el modelo base Qwen3-8B tiene licencia Apache 2.0, pero el adaptador no la declara) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un modelo de lenguaje de tipo transformer decoder con atención causal. La técnica de ajuste es LoRA (Low-Rank Adaptation), que introduce matrices de bajo rango en los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Los hiperparámetros del adaptador son: rango `r=64`, `alpha=128`, `dropout=0.05`. El entrenamiento se realizó con Axolotl 0.13.2, utilizando el optimizador AdamW, una tasa de aprendizaje de 1e-4 con scheduler coseno, 3 épocas, tamaño de micro-lote 1 y acumulación de gradientes de 16 pasos. La longitud de secuencia se fijó en 16 384 tokens y no se usó *sample packing*.

El régimen de entrenamiento *stateless* implica que, durante la generación de los datos de entrenamiento, el intérprete de Python que ejecuta las acciones del agente se reinicia en cada turno, de modo que el modelo no puede depender de un estado persistente entre llamadas. Los datos de entrenamiento consisten en *paired traces* (trazas emparejadas) generadas bajo este régimen, con un procedimiento de emparejamiento y filtrado descrito en el apéndice del paper asociado. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el entrenamiento es exclusivamente de supervisión sobre las trazas.

## Capacidades

- Generación de texto y conversación: al estar basado en Qwen3-8B, conserva las capacidades generales de generación de texto del modelo base, aunque el adaptador está especializado en la tarea de agente.
- Razonamiento multi-paso: el entrenamiento en la tarea Opaque Knapsack implica que el modelo debe planificar y ejecutar acciones secuenciales para resolver un problema de optimización con información parcial.
- Uso de herramientas (tool calling): no se documenta explícitamente, pero la naturaleza agéntica de la tarea sugiere que el modelo puede interactuar con un intérprete de Python; sin embargo, no hay confirmación en la información disponible.
- Capacidades multilingües: no disponibles; se heredan del modelo base, pero no se especifican.
- Otras capacidades especiales: no se mencionan modos de pensamiento, visión o audio.

## Casos de uso

- Reproducción de experimentos académicos: el adaptador permite replicar los resultados del workshop de NeurIPS, comparando el régimen stateless con el persistente y analizando el efecto de la semilla (3407) en el rendimiento.
- Investigación en agentes con estado limitado: sirve como punto de partida para estudiar cómo los LLM se comportan cuando no pueden mantener un estado interno entre turnos, útil en entornos donde el estado debe ser explícito o reiniciado.
- Fine-tuning adicional para tareas de optimización combinatoria: el adaptador puede servir como inicialización para ajustar el modelo en problemas similares de mochila o planificación con restricciones.
- Evaluación de métodos de entrenamiento con LoRA: al ser un adaptador de bajo rango, es útil para comparar la eficiencia de parámetros frente a un fine-tuning completo en tareas de agente.
- Desarrollo de agentes en entornos con memoria efímera: en aplicaciones donde el contexto se reinicia frecuentemente (por ejemplo, chatbots con sesiones cortas), el régimen stateless puede ser más robusto.
- Benchmarking de robustez a la semilla: al existir otros adaptadores con semillas distintas (1337, 777), permite estudiar la variabilidad del entrenamiento y la estabilidad de los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de la tarea Opaque Knapsack. La ausencia de datos impide comparar cuantitativamente este adaptador con otros modelos o adaptadores.

## Requisitos de hardware

- El adaptador LoRA añade un overhead mínimo en memoria (menos de 1 GB), pero el modelo base Qwen3-8B es el factor dominante.
- Para inferencia en FP16, se requieren aproximadamente 16 GB de VRAM (solo pesos del modelo base). Con cuantización 4-bit, se reduce a unos 8 GB.
- Se recomienda una GPU con al menos 12 GB de VRAM para ejecutar el modelo en 4-bit, y 24 GB para FP16. GPUs como RTX 3090/4090 (24 GB) o A100 (40/80 GB) son adecuadas.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft` en frameworks como vLLM, TGI o llama.cpp (si se convierte a GGUF). No se proporcionan configuraciones específicas de latencia o throughput.
- Dado que el entrenamiento usó una secuencia de 16 384 tokens, la inferencia con contextos largos requerirá más memoria y cómputo.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. Existen otros adaptadores del mismo estudio (por ejemplo, `TieuDaoChanNhan/qwen3-8b-stateless-knapsack-lora-seed1337` y `seed777`) que comparten la misma base y régimen, pero no se publican métricas comparativas. Frente al modelo base Qwen3-8B, este adaptador está especializado en la tarea de agente, pero no se conocen diferencias de rendimiento en tareas generales. No se dispone de datos de otros modelos comparables en la misma tarea.

## Limitaciones y advertencias

- Liberación anónima para revisión: el adaptador se publica como material suplementario de un workshop; no está pensado para uso en producción y puede contener errores o estar incompleto.
- Licencia no especificada: aunque el modelo base Qwen3-8B es Apache 2.0, el adaptador no declara licencia, lo que genera incertidumbre legal para uso comercial o redistribución.
- Especialización excesiva: el entrenamiento se limita a la tarea Opaque Knapsack; el adaptador puede degradar el rendimiento en tareas generales fuera de este dominio.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento, lo que impide evaluar su calidad objetivamente.
- Régimen stateless: el modelo no está entrenado para mantener estado entre turnos, lo que puede limitar su uso en aplicaciones que requieran memoria de largo plazo.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje, puede generar respuestas incorrectas o sesgadas, especialmente en contextos no cubiertos por los datos de entrenamiento.
- Dependencia del modelo base: cualquier limitación de Qwen3-8B (por ejemplo, idiomas, sesgos) se hereda en el adaptador.

## Enlaces

- [HuggingFace - adaptador](https://huggingface.co/iaeval2026-submission/qwen3-8b-knapsack-lora-stateless-seed3407)
- [HuggingFace - modelo base Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [Repositorio oficial de Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)
- [Página de investigación de Qwen](https://qwen.ai/research/)
