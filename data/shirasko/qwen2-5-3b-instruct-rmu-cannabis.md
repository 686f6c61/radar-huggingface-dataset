# shirasko/qwen2.5-3b-instruct-rmu-cannabis

## Resumen

Este modelo es un checkpoint derivado de `Qwen/Qwen2.5-3B-Instruct` al que se ha aplicado la técnica de *unlearning* RMU (*Representation Misdirection for Unlearning*). El objetivo es eliminar el conocimiento relacionado con el concepto "cannabis" de las representaciones internas del modelo, manteniendo en lo posible sus capacidades generales. Lo desarrolla el usuario `shirasko` y se publica como un experimento de investigación en seguridad y alineación de modelos de lenguaje.

El modelo base, Qwen2.5-3B-Instruct, es un transformer de 3 090 millones de parámetros con atención por grupos (GQA), entrenado sobre 18 billones de tokens y con una ventana de contexto de 128 000 tokens. El checkpoint unlearned conserva la misma arquitectura y pesos, pero con modificaciones introducidas por el proceso RMU sobre las capas 6, 7 y 8. Su relevancia radica en servir como caso de estudio para evaluar la eficacia de las técnicas de desaprendizaje en modelos de código abierto, un área crítica para el cumplimiento normativo y la mitigación de riesgos en IA generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) con RoPE, SwiGLU, RMSNorm y GQA (16 cabezas de query, 2 de key/value) |
| Parametros totales | 3 085 938 688 (3,09 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (según metadatos del repositorio) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B-Instruct emplea una arquitectura transformer estándar con normalización RMSNorm, activación SwiGLU, embeddings posicionales rotatorios (RoPE) y atención por grupos (GQA) para reducir el coste de inferencia. Fue preentrenado sobre un corpus masivo de 18 billones de tokens y posteriormente ajustado con instrucciones mediante un proceso de *supervised fine-tuning* y *reinforcement learning from human feedback* (RLHF), lo que le confiere capacidades sólidas en generación de texto, razonamiento, código y matemáticas.

El proceso de *unlearning* aplicado en este checkpoint utiliza RMU, una técnica que modifica las representaciones internas del modelo en capas específicas para "desaprender" un concepto objetivo. Los hiperparámetros reportados incluyen un coeficiente `alpha` de 300, un *steering* de 1000, y edición sobre las capas 6, 7 y 8 (con `layer_id` principal 8). El entrenamiento se realizó con una tasa de aprendizaje de 0,0003 y un rango de 100. No se especifican los datos utilizados para el proceso de desaprendizaje, pero las métricas de evaluación indican que se empleó un protocolo de opción múltiple (MC) sobre conjuntos de entrenamiento y prueba separados.

## Capacidades

- Generación de texto en inglés con coherencia y fluidez, heredada del modelo base.
- Razonamiento y resolución de problemas en tareas de sentido común y conocimiento general, aunque con una ligera degradación en precisión respecto al modelo original (MMLU pasa de 0,623 a 0,612 en test).
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno, propia de la variante Instruct.
- Soporte de *function calling* y *tool calling* no confirmado explícitamente en este checkpoint, pero presente en el modelo base Qwen2.5-3B-Instruct.
- Capacidad de evitar generar contenido relacionado con cannabis: la métrica de eficacia en test es 0,892, lo que indica que en el 89,2% de los casos el modelo se niega o no produce información sobre el concepto objetivo.
- Mantiene la capacidad de responder a preguntas generales fuera del dominio eliminado, con una especificidad de 0,985 en test (es decir, solo un 1,5% de respuestas no relacionadas con cannabis se ven afectadas negativamente).

## Casos de uso

- Investigación en técnicas de *unlearning*: este checkpoint sirve como referencia para comparar la eficacia de RMU frente a otros métodos de desaprendizaje, permitiendo a investigadores reproducir y validar resultados.
- Evaluación de seguridad en modelos de lenguaje: se puede utilizar para probar si un modelo ha eliminado correctamente información sensible o prohibida, como parte de auditorías de cumplimiento normativo.
- Desarrollo de sistemas de moderación de contenido: al integrar este modelo en un pipeline de generación, se puede garantizar que no se produzcan respuestas relacionadas con cannabis, útil en entornos donde ese tema está regulado.
- Pruebas de robustez y alucinación: al comparar las respuestas del modelo unlearned con el base, se puede estudiar cómo el desaprendizaje afecta a la coherencia y a la tendencia a alucinar en dominios cercanos.
- Entrenamiento de modelos más seguros: los resultados de este checkpoint pueden informar el diseño de futuros modelos con mecanismos de control de conocimiento integrados.
- Benchmarking de hardware y despliegue: al ser un modelo de 3B parámetros, es adecuado para probar técnicas de cuantización y optimización en GPUs de consumo, aunque este checkpoint no incluye versiones cuantizadas.

## Benchmarks y rendimiento

La model card proporciona métricas de evaluación del proceso de *unlearning* bajo un protocolo de opción múltiple (MC). Se presentan los resultados comparativos entre el modelo baseline (Qwen2.5-3B-Instruct) y el checkpoint unlearned, tanto en entrenamiento como en test.

| Metrica | Baseline (test) | Unlearned (test) |
|---|---|---|
| Eficacia (Efficacy) | — | 0,892 |
| Especificidad (Specificity) | — | 0,985 |
| Media armonica (Harmonic mean) | — | 0,936 |
| QA accuracy | 0,90 | 0,32 |
| QA fraction | 1,00 | 0,108 |
| SimDom accuracy | 0,82 | 0,84 |
| SimDom fraction | 1,00 | 1,00 |
| MMLU accuracy | 0,623 | 0,612 |
| MMLU fraction | 1,00 | 0,971 |

La eficacia mide la proporción de preguntas sobre cannabis que el modelo rechaza o responde incorrectamente a propósito; la especificidad mide la proporción de preguntas no relacionadas que se responden correctamente. La media armónica combina ambas. El valor de *relearning QA* de 0,46 indica que, tras un proceso de re-entrenamiento, el modelo recupera parcialmente el conocimiento eliminado, un aspecto relevante para la estabilidad del desaprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6,2 GB (3,09 B parámetros × 2 bytes), más overhead de activaciones y *KV cache*.
- Con cuantización de 4 bits (no incluida en el repositorio, pero aplicable mediante herramientas como llama.cpp o GPTQ), la VRAM se reduce a unos 2 GB, permitiendo ejecución en GPUs de consumo como RTX 3060 o incluso en CPU con suficiente RAM.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (por ejemplo, RTX 3070, RTX 4060 Ti, A10). Para despliegue en producción, una A100 o H100 ofrecería mayor throughput.
- Opciones de despliegue: al ser un modelo compatible con la librería `transformers`, se puede servir con vLLM, TGI o llama.cpp. También es compatible con Ollama si se convierte a formato GGUF.
- Latencia y throughput estimados: en una RTX 4090, la generación de tokens puede alcanzar entre 50 y 100 tokens por segundo en FP16, dependiendo de la longitud de la secuencia y el tamaño del *batch*. No se dispone de mediciones específicas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3,09 B | 128 K | Apache 2.0 | Modelo original sin desaprendizaje |
| shirasko/qwen2.5-3b-instruct-rmu-cannabis | 3,09 B | 128 K | No disponible | Checkpoint con *unlearning* de cannabis |
| Llama-3.2-3B-Instruct | 3,21 B | 128 K | Llama 3.2 Community License | Alternativa de 3B con capacidades similares, sin desaprendizaje |

La comparativa se limita al modelo base y a una alternativa de tamaño similar, ya que no se dispone de otros checkpoints de *unlearning* públicos con los que contrastar. El rendimiento en tareas generales (MMLU) del checkpoint unlearned es ligeramente inferior al del base (0,612 frente a 0,623), lo que refleja el coste del desaprendizaje. La licencia del checkpoint no está especificada, lo que limita su uso comercial sin consultar al autor.

## Limitaciones y advertencias

- El *unlearning* no es perfecto: la eficacia en test es 0,892, lo que significa que en aproximadamente un 10,8% de los casos el modelo aún puede generar información sobre cannabis.
- La especificidad es alta (0,985), pero existe un pequeño porcentaje de respuestas no relacionadas que se ven afectadas negativamente, lo que puede degradar la calidad general en dominios cercanos.
- El modelo solo está etiquetado para inglés; su comportamiento en otros idiomas no está evaluado y probablemente sea deficiente.
- La licencia no está disponible, por lo que no se puede garantizar su uso comercial o la redistribución sin permiso explícito del autor.
- El proceso de *unlearning* puede ser revertido mediante *relearning* (el valor de 0,46 en la métrica de relearning QA indica que el conocimiento puede recuperarse parcialmente), lo que compromete su uso como mecanismo de seguridad a largo plazo.
- No se han publicado resultados de benchmarks estándar como HumanEval o GSM8K para este checkpoint, por lo que su rendimiento en código y matemáticas no está verificado.
- Al ser un modelo de 3B parámetros, su capacidad de razonamiento complejo es limitada en comparación con modelos de mayor tamaño.

## Enlaces

- Repositorio del modelo: https://huggingface.co/shirasko/qwen2.5-3b-instruct-rmu-cannabis
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo base Qwen2.5-3B (sin instrucciones): https://huggingface.co/Qwen/Qwen2.5-3B
- Página de Qwen2.5-3B-Instruct en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-3B-Instruct
- Ficha de Qwen2.5-3B-Instruct en Ollama: https://ollama.com/library/qwen2.5:3b-instruct
