# iaeval2026-submission/qwen3-8b-knapsack-lora-stateless-seed1337

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3-8B, publicado de forma anónima como material suplementario para una revisión de reproducibilidad en un workshop de NeurIPS. El adaptador, identificado como `qwen3-8b-knapsack-lora-stateless-seed1337`, forma parte de un conjunto de seis adaptadores (tres semillas × dos regímenes de entrenamiento: persistente y sin estado) afinados para la tarea agéntica "Opaque Knapsack". El régimen "stateless" implica que el intérprete de Python utilizado durante el entrenamiento se reinicia en cada turno del agente, lo que condiciona la estrategia de aprendizaje.

El modelo resultante es un adaptador de 0,7 GB que se combina con el modelo base Qwen3-8B (8.000 millones de parámetros) para realizar tareas de razonamiento multi-paso con herramientas. Su relevancia radica en que permite estudiar cómo el estado del intérprete afecta al aprendizaje de agentes, un aspecto poco explorado en la literatura. Al ser una publicación anónima, no se proporcionan detalles completos del paper ni del conjunto de datos, pero la configuración de entrenamiento está documentada con precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-8B (Transformer decoder) con adaptador LoRA |
| Parametros totales | No disponible (el modelo base tiene 8.000 millones; el adaptador añade parámetros LoRA, cuyo número exacto no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens (sequence_len de entrenamiento); el modelo base Qwen3-8B soporta hasta 32.768 tokens |
| Tipos de cuantizacion | El adaptador se entrenó sobre base cuantizada a 4-bit NF4; el adaptador en sí se distribuye en precisión completa (safetensors) |
| Idiomas soportados | No disponible (el modelo base Qwen3-8B es multilingüe, pero el adaptador no especifica restricciones) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un modelo Transformer decoder con atención causal estándar, entrenado por Alibaba Cloud. El adaptador LoRA se aplica a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rango 64, alpha 128 y dropout 0,05. El entrenamiento se realizó con Axolotl 0.13.2, usando el optimizador AdamW, tasa de aprendizaje 1e-4 con scheduler coseno, 3 épocas, micro-batch de 1 y acumulación de gradientes de 16. La secuencia máxima fue de 16.384 tokens, sin empaquetado de muestras.

El régimen "stateless" implica que el intérprete de Python que ejecuta las acciones del agente se reinicia en cada turno, de modo que el modelo no puede depender de variables persistentes entre pasos. Los datos de entrenamiento consisten en trazas pareadas para este régimen, con un procedimiento de filtrado descrito en el apéndice del paper (no disponible públicamente). No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado sobre las trazas.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del modelo base Qwen3-8B.
- Ejecución de tareas agénticas con herramientas, específicamente la tarea "Opaque Knapsack" (un problema de optimización con restricciones opacas).
- Soporte de tool calling / function calling, necesario para interactuar con el intérprete de Python en el entorno agéntico.
- Capacidad de seguir instrucciones en formato conversacional, gracias al entrenamiento sobre trazas de agente.
- Multilingüismo limitado al modelo base (Qwen3-8B soporta múltiples idiomas, pero el adaptador no ha sido evaluado fuera del inglés en la información disponible).
- No se reportan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación en aprendizaje de agentes: el adaptador permite reproducir los experimentos del workshop y comparar el efecto del régimen stateless frente al persistente, usando las otras semillas y el adaptador persistente.
- Evaluación de robustez en tareas de optimización: la tarea Opaque Knapsack exige razonamiento secuencial con feedback del entorno; el adaptador puede usarse para medir la capacidad de planificación bajo incertidumbre.
- Estudio de generalización de LoRA en dominios agénticos: al ser un adaptador pequeño, es fácil de cargar y probar en entornos de simulación sin necesidad de ajustar el modelo completo.
- Benchmarking de agentes con intérprete stateless: sirve como punto de referencia para otros métodos que aborden el mismo problema.
- Desarrollo de pipelines de tool calling: aunque no está pensado para producción, puede servir como base para experimentar con integraciones de Python en agentes.
- Análisis de sesgos y alucinaciones en tareas de razonamiento: al ser un modelo afinado, se puede estudiar cómo el entrenamiento específico afecta a la fiabilidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El adaptador se presenta como material suplementario para revisión, y no se incluyen métricas de rendimiento (como MMLU, HumanEval o GSM8K) ni comparaciones con otros modelos. El único dato relevante es que el entrenamiento se realizó sobre trazas de la tarea Opaque Knapsack, pero no se reporta la precisión obtenida.

## Requisitos de hardware

- Para inferencia con el adaptador, es necesario cargar el modelo base Qwen3-8B (8.000 millones de parámetros) más el adaptador LoRA. En FP16, el modelo base ocupa aproximadamente 16 GB de VRAM; con cuantización 4-bit (como se usó en el entrenamiento), se reduce a unos 5-6 GB.
- El adaptador en sí ocupa 0,7 GB en disco, pero se carga en memoria junto con el base.
- GPU recomendadas: una RTX 3090/4090 (24 GB VRAM) es suficiente para FP16; una GPU con 8-12 GB (como RTX 3060 o 4060) puede funcionar con cuantización 4-bit.
- Opciones de despliegue: se puede usar con transformers + PEFT (como se muestra en el código de uso), o exportar a GGUF para llama.cpp/Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de las secuencias (hasta 16K tokens).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la tarea Opaque Knapsack. Los adaptadores hermanos (persistent y otras semillas) están publicados en el mismo repositorio, pero no se ofrecen métricas comparativas. En cuanto al modelo base, Qwen3-8B se puede comparar con otros modelos de 8B como Llama-3.1-8B o Mistral-7B, pero el adaptador no modifica las capacidades generales del base, solo lo especializa para una tarea concreta. Por tanto, la comparativa se limita a señalar que el adaptador no altera el rendimiento general del modelo base fuera de la tarea objetivo.

## Limitaciones y advertencias

- Es un adaptador de investigación, publicado de forma anónima y sin documentación completa del paper ni del conjunto de datos. No está pensado para uso en producción.
- El entrenamiento se realizó sobre una tarea específica (Opaque Knapsack) con un régimen stateless; su rendimiento en otras tareas agénticas o de razonamiento general no está garantizado.
- No se han evaluado sesgos ni alucinaciones específicas del adaptador; hereda los sesgos del modelo base Qwen3-8B.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución.
- El adaptador se entrenó con una secuencia máxima de 16.384 tokens; aunque el modelo base soporta 32K, el adaptador puede degradarse con contextos más largos.
- No se proporcionan datos de rendimiento (benchmarks) ni comparaciones con otros métodos, lo que limita la evaluación objetiva.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/iaeval2026-submission/qwen3-8b-knapsack-lora-stateless-seed1337
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Adaptador persistente (hermano): https://huggingface.co/TieuDaoChanNhan/qwen3-8b-persistent-knapsack-lora-seed1337
- Adaptador stateless (otra semilla): https://huggingface.co/TieuDaoChanNhan/qwen3-8b-stateless-knapsack-lora-seed1337
