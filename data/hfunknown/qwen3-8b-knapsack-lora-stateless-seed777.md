# hfunknown/qwen3-8b-knapsack-lora-stateless-seed777

## Resumen

Este repositorio contiene un adaptador LoRA de Qwen3-8B, fine-tuneado para la tarea agéntica "Opaque Knapsack" (mochila opaca), un problema de optimización combinatoria que se resuelve mediante un agente que interactúa con un intérprete Python. El adaptador se publica de forma anónima como material suplementario para un envío a un workshop de NeurIPS, con el objetivo de permitir la revisión por pares de la reproducibilidad del entrenamiento. Es uno de seis adaptadores que exploran dos regímenes de entrenamiento (persistente y sin estado) con tres semillas cada uno; este corresponde al régimen sin estado (stateless) con semilla 777.

La relevancia de este lanzamiento radica en que aborda una línea de investigación activa: cómo los modelos de lenguaje pueden resolver problemas de optimización mediante agentes que ejecutan código, y qué impacto tiene el diseño del entorno (estado persistente vs. reinicio en cada turno) en el rendimiento. Al liberar los adaptadores y la configuración de entrenamiento, se facilita la comparación y reproducción de resultados en un área donde la transparencia es limitada.

El adaptador se basa en Qwen3-8B, un modelo transformer decoder de 8 mil millones de parámetros, y se entrenó con una longitud de secuencia de 16 384 tokens. La licencia no está especificada, lo que limita su uso comercial hasta que se aclare.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B (transformer decoder) |
| Parametros totales | 8B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 384 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | Adaptador LoRA en precision completa; base cuantizada 4-bit NF4 durante el entrenamiento |
| Idiomas soportados | no disponibles (el modelo base Qwen3-8B es multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre Qwen3-8B, un modelo transformer decoder con atención causal. Los módulos objetivo del LoRA incluyen todas las proyecciones lineales del transformer: q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El entrenamiento se realizó con Axolotl 0.13.2, utilizando una base cuantizada a 4-bit NF4 para reducir el consumo de memoria. Los hiperparámetros principales son: r=64, alpha=128, dropout=0.05, learning rate 1e-4 con scheduler coseno, optimizador AdamW, 3 épocas, micro-batch de 1 y acumulación de gradientes de 16.

Los datos de entrenamiento consisten en "trazas emparejadas" (paired traces) del régimen sin estado, donde el intérprete Python se reinicia en cada turno del agente. El procedimiento de emparejamiento y filtrado se detalla en el apéndice del paper asociado, que aún no se ha hecho público. No se especifica el número de tokens ni la composición del dataset más allá de esa descripción.

## Capacidades

- Especializado en la resolución de la tarea "Opaque Knapsack" mediante interacción con un intérprete Python sin estado.
- Hereda las capacidades generales del modelo base Qwen3-8B: generación de texto, razonamiento, código y matemáticas, aunque el fine-tuning puede alterar el comportamiento en otras tareas.
- No se documentan capacidades adicionales como tool calling, visión o audio; el adaptador está diseñado exclusivamente para el escenario agéntico de la tarea.
- No se ha evaluado su rendimiento fuera del dominio de la mochila opaca.

## Casos de uso

- Investigación en agentes de optimización: permite reproducir y comparar el régimen de entrenamiento sin estado frente al persistente, utilizando la semilla 777 como referencia.
- Estudio de la influencia del estado del intérprete en el aprendizaje: el adaptador sirve para analizar cómo el reinicio del entorno en cada turno afecta a la capacidad del modelo para planificar y ejecutar código.
- Evaluación de la reproducibilidad en workshops: al ser una liberación anónima para revisión, su uso principal es verificar los resultados del paper asociado una vez que se publique.
- Benchmark de adaptadores LoRA en tareas agénticas: puede compararse con los otros cinco adaptadores liberados (tres semillas × dos regímenes) para medir la varianza entre semillas.
- Desarrollo de pipelines de entrenamiento con Axolotl: la configuración publicada sirve como plantilla para fine-tune de LoRA sobre Qwen3-8B en tareas similares.
- Pruebas de inferencia con cargas cuantizadas: el adaptador puede combinarse con bases cuantizadas (4-bit, 8-bit) para estudiar el impacto de la cuantización en tareas de razonamiento agéntico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de la tarea de mochila opaca.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 0.7 GB (repo completo), pero requiere el modelo base Qwen3-8B para funcionar.
- Para inferencia con el modelo base en 4-bit (NF4), se estima un consumo de VRAM de 6-8 GB, más el adaptador (menos de 1 GB adicional). Una GPU con 8 GB (p. ej., RTX 3070/4060) podría ser suficiente.
- Con precisión bf16 completa, el modelo base requiere aproximadamente 16 GB de VRAM, por lo que se recomienda una GPU de 24 GB (RTX 3090/4090, A5000) o superior.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles con modelos LoRA, aunque se debe verificar la compatibilidad específica del adaptador con cada framework.
- Latencia y throughput no disponibles; dependerán del hardware y del framework utilizado.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa. Existe otro adaptador similar (AutomatedScientist/qwen3-8b-stateless-knapsack-lora) con el mismo propósito, pero no se han publicado resultados comparativos. El modelo base Qwen3-8B puede servir como referencia de rendimiento general, pero no se ha evaluado este adaptador frente a él en la tarea específica.

## Limitaciones y advertencias

- Licencia no especificada: no se permite su uso comercial sin aclaración del autor.
- Es un adaptador de investigación, no destinado a producción; no se ha probado en entornos reales.
- El rendimiento fuera de la tarea de mochila opaca es desconocido; el fine-tuning puede degradar capacidades generales.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen3-8B.
- Los datos de entrenamiento no están disponibles públicamente, lo que limita la auditoría del proceso.
- La liberación es anónima; la atribución y la cita del paper llegarán después de la revisión.
- No se proporcionan instrucciones de uso ni ejemplos de inferencia en la model card.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/hfunknown/qwen3-8b-knapsack-lora-stateless-seed777
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Reporte técnico de Qwen3 (arXiv): https://arxiv.org/pdf/2505.09388
- Adaptador similar (AutomatedScientist): https://huggingface.co/AutomatedScientist/qwen3-8b-stateless-knapsack-lora
