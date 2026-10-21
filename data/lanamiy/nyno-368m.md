# Lanamiy/Nyno-368M

## Resumen

Nyno-368M es un modelo de lenguaje causal de 368 millones de parámetros entrenado desde cero por el usuario Lanamiy y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo bilingüe portugués-español, con arquitectura de tipo GPT (transformer decoder-only), orientado a generación de texto y construido con recursos comunitarios. La model card lo identifica como versión v1.0 correspondiente al step 1750 del entrenamiento.

El modelo se posiciona en el segmento de modelos pequeños (por debajo de 1B de parámetros), un rango en el que la eficiencia de inferencia y la posibilidad de ejecución en hardware de consumo son los principales atractivos. Su interés radica en ser un entrenamiento desde cero específico para lenguas ibéricas, un nicho tradicionalmente dominado por modelos multilingües de gran tamaño o por adaptaciones de modelos ingleses.

La información publicada es, sin embargo, muy limitada: no se documentan la longitud de contexto, el volumen de tokens de entrenamiento, la composición exacta del dataset, ni resultados de evaluación. El repositorio ocupa 4,4 GB, un tamaño notablemente superior al esperado para 368M de parámetros en fp16 (aproximadamente 0,74 GB), lo que sugiere la presencia de checkpoints de entrenamiento u otros artefactos, aunque el autor no lo especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT (causal LM) |
| Parametros totales | 368 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | portugues (pt) y espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (repositorio de 4,4 GB); no se confirma la presencia de safetensors ni de GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con objetivo de entrenamiento causal (predicción del siguiente token), etiquetado por el autor con la familia "gpt". No se especifican el número de capas, la dimensión del modelo, el número de cabezas de atención, la función de activación, el tipo de normalización ni la estrategia de tokenización empleada. Tampoco se documenta si se usan embeddings atados (weight tying) o posicionales aprendidos frente a RoPE.

El entrenamiento se realizó desde cero ("construido e treinado do zero") sobre el dataset HuggingFaceFW/fineweb-2, un corpus web multilingüe de gran escala, con foco explícito en portugués y español. No se indica el número de tokens procesados, la mezcla exacta de idiomas, la estrategia de filtrado o deduplicación, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. La referencia al "step 1750" en la model card apunta a un entrenamiento de duración moderada, aunque sin el tamaño de batch ni la secuencia no es posible estimar el cómputo total. Tampoco se describe ninguna innovación técnica adicional (atención lineal, decodificación especulativa, MoE o arquitecturas híbridas).

## Capacidades

- Generación de texto autoregresiva en portugués y español.
- Modelo bilingüe pt-es declarado explícitamente en los metadatos y en la model card; no se declara soporte de otros idiomas.
- Aplicable a tareas de continuación de texto, completado y generación libre.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión, audio o multimodalidad: no disponibles.
- Modo "thinking" o razonamiento explícito: no disponible.
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Generación de texto en portugués y español en aplicaciones de contenido: el modelo puede producir borradores y continuaciones de texto en ambos idiomas, aprovechando que el entrenamiento se centró en corpus web de estas dos lenguas.
- Prototipado rápido y experimentación académica: con 368M de parámetros, sirve como base ligera para estudiar dinámicas de entrenamiento desde cero en lenguas ibéricas sin requerir clústeres de GPU.
- Ajuste fino específico de dominio: su tamaño reducido permite fine-tuning completo o con LoRA en una única GPU, partiendo de un modelo ya expuesto a portugués y español en lugar de uno dominado por el inglés.
- Completado de texto en entornos con recursos limitados: puede desplegarse en CPU o en GPU de consumo para tareas de autocompletado con latencia baja, siempre que se respete la ventana de contexto real del modelo (no documentada).
- Filtrado y clasificación de textos pt/es mediante puntuación de verosimilitud: al ser un LM causal, puede usarse para calcular probabilidades de secuencias en tareas de detección de anomalías o calidad de texto, sin necesidad de un modelo generativo grande.
- Base para experimentos de destilación o como modelo alumno: su tamaño lo hace adecuado como estudiante en pipelines de destilación desde modelos mayores con cobertura de portugués y español.
- Generación de datos sintéticos a pequeña escala para aumentar corpus pt/es en dominios con poca disponibilidad de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K, perplexity ni ninguna otra métrica, y tampoco se han encontrado referencias externas en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,74 GB en fp16/bf16 y 1,5 GB en fp32 para los pesos; en int8 alrededor de 0,37 GB y en int4 alrededor de 0,18 GB (cálculos teóricos a partir del número de parámetros, no publicados por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4060 o superior permite holgura para batches mayores. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en toda la gama actual (GTX 1060 6 GB, RTX 3050, RTX 4090, etc.), así como en ejecución sobre CPU.
- Opciones de despliegue: al publicarse pesos PyTorch, el despliegue directo es mediante `transformers`. El soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado: requiere verificar que la arquitectura concreta esté implementada en esas herramientas y, en su caso, convertir los pesos a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

Nota: el repositorio de 4,4 GB es considerablemente mayor que el tamaño teórico de los pesos del modelo, por lo que es probable que incluya checkpoints intermedios u otros ficheros; conviene revisar la lista de archivos antes de descargar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Observaciones |
|---|---|---|---|---|---|
| Nyno-368M | 368M | no disponible | pt, es | Apache 2.0 | Sin benchmarks publicados; entrenado desde cero con fineweb-2 |
| SmolLM2-360M | 362M | 8.192 tokens (segun su model card publica) | principalemente ingles | Apache 2.0 | Con evaluaciones publicadas y soporte en herramientas de inferencia |
| Qwen2.5-0.5B | ~494M | 32.768 tokens (segun su model card publica) | multilingue, incluye es y pt | Apache 2.0 | Amplia cobertura de herramientas y cuantizaciones GGUF oficiales |
| GPT-2 small | 124M | 1.024 tokens | ingles | MIT | Referencia historica de la familia GPT; solo ingles |

La comparación es cualitativa: no existen métricas públicas de Nyno-368M que permitan contrastar rendimiento real frente a estas alternativas, y los datos de los modelos comparados provienen de sus respectivas model cards públicas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no es posible afirmar nada sobre su calidad respecto a alternativas del mismo tamaño; tratarlo como modelo experimental.
- Sesgos desconocidos: al entrenarse sobre fineweb-2 (corpus web), es esperable la presencia de sesgos de género, raciales, políticos y de dominio, pero no se ha publicado ninguna evaluación al respecto.
- Riesgo de alucinación: alto en un modelo de 368M entrenado con un volumen de tokens no especificado y presumiblemente limitado; no es adecuado para tareas que requieran factualidad estricta.
- Longitud de contexto no documentada: impide planificar casos de uso que dependan de ventanas largas; hay que determinarla empíricamente.
- Cobertura lingüística restringida a pt y es: el rendimiento en otros idiomas, incluido el catalán, gallego o euskera, no está evaluado y probablemente sea deficiente.
- Sin información sobre fases de alineación (SFT/RLHF/DPO): es probable que el modelo no siga instrucciones de forma fiable y que se comporte principalmente como un modelo de completado.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución, sin restricciones adicionales conocidas, pero el autor no ofrece garantías ni soporte.
- Advertencia sobre el repositorio: el tamaño de 4,4 GB no se corresponde con los pesos esperados, conviene auditar el contenido antes de integrarlo en un pipeline.
- Sin versiones cuantizadas publicadas ni integración confirmada en runtimes de inferencia habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lanamiy/Nyno-368M
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2

No se han encontrado papers, blogs, repositorios ni demos adicionales asociados al modelo en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo y se han descartado.
