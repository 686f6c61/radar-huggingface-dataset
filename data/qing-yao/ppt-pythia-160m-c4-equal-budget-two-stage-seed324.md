# qing-yao/ppt-pythia-160m-c4-equal-budget-two-stage-seed324

## Resumen

`qing-yao/ppt-pythia-160m-c4-equal-budget-two-stage-seed324` es un artefacto de investigación publicado en HuggingFace: un modelo de lenguaje de 162.322.944 parámetros con la arquitectura de Pythia-160M entrenado desde cero (sin cargar pesos preentrenados) sobre texto en inglés de C4. No es un modelo orientado a producto, sino el brazo "two-stage" de un experimento controlado sobre planificación de la tasa de aprendizaje, con semilla 324.

El experimento compara dos brazos con idéntico presupuesto: uno "continuo" con un único schedule de learning rate y otro "two-stage" que reinicia los embeddings de entrada y salida, el optimizador y el schedule tras el update 500, y continúa 10.000 updates más. Ambos brazos consumen exactamente los mismos ejemplos en el mismo orden y comparten vocabulario de 50.304 entradas, lo que permite comparaciones paired entre endpoints.

Su relevancia es acotada pero concreta: sirve como evidencia reproducible en estudios de dinámica de entrenamiento (efecto del reinicio de embeddings y del optimizador), como baseline de pérdida de un modelo pequeño en C4 y como punto de partida para fine-tuning. No incluye alineación, instrucciones ni evaluación en benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (`gpt_neox`), transformer decoder-only |
| Parametros totales | 162.322.944 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de las secuencias de entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoints publicados en FP32/safetensors) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo con `transformers`; incluye optimizer/RNG state) |
| Vocabulario | 50.304 tokens (tokenizer fijado e incluido) |
| Tamano del repo | 3,2 GB |

## Arquitectura y entrenamiento

Se utiliza la arquitectura Pythia-160M (familia GPT-NeoX, decoder-only con atención causal), sin innovaciones de atención ni decodificación especulativa documentadas. El entrenamiento es from scratch: no se cargaron pesos preentrenados. El régimen declarado es de 10.500 updates totales del optimizador, con 32 secuencias de 2.048 tokens por update, lo que equivale a 65.536 tokens por update y aproximadamente 688 millones de tokens procesados en total (unas 4,2 tokens por parámetro).

La variable experimental es el schedule. El brazo continuo usa un único schedule de learning rate. El brazo two-stage (el publicado aquí) reinicia los embeddings de entrada y salida, el estado del optimizador y el schedule tras el update 500, y entrena 10.000 updates adicionales. Ambos brazos consumen los mismos ejemplos ordenados y comparten vocabulario de 50.304 entradas, de modo que la comparación es like-for-like. El checkpoint raíz corresponde a `checkpoint-010500-c4/model` y se conservan 4 checkpoints locales con pesos, estado de optimizador/RNG y recibos de checksum; los checkpoints intermedios podados no están disponibles. No se documenta RLHF, DPO ni ningún ajuste por preferencias. La pérdida final en FP32 sobre las primeras 512 secuencias de validación de C4 es 3,681496.

## Capacidades

- Generación de texto en inglés y modelado de lenguaje causal estándar.
- Continuación de texto y estimación de verosimilitud (útiles para análisis de pérdida y comparaciones de endpoints).
- Punto de partida para fine-tuning supervisado en tareas downstream en inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-step.
- No se documenta thinking mode, visión, audio ni multimodalidad.
- Multilingüismo: no disponible; la model card solo declara inglés.
- No se documenta modo instrucciones ni plantilla de chat.

## Casos de uso

- Investigación sobre schedules de learning rate: el par de brazos (continuo vs two-stage) con los mismos datos y vocabulario permite aislar el efecto del reinicio de embeddings, optimizador y schedule sobre la pérdida final de validación (3,681496 en FP32).
- Reproducibilidad de experimentos de entrenamiento: el repo incluye optimizer/RNG state, recibos de checksum, `run.json` con la receta completa y logs del lanzamiento compartido de seis ejecuciones, lo que facilita replicar el pipeline.
- Análisis de dinámica de representaciones: los checkpoints que preservan ambos lados del reinicio en el update 500 permiten estudiar la reorganización de los embeddings de entrada y salida tras el reseteo.
- Baseline de pérdida en C4 para modelos pequeños: sirve como referencia de loss de validación para comparar arquitecturas o recetas alternativas de aproximadamente 160 millones de parámetros.
- Fine-tuning en tareas de clasificación o generación en inglés: con 162 millones de parámetros se puede ajustar en una única GPU de gama media para tareas específicas de dominio.
- Docencia y prácticas de entrenamiento: el coste computacional reducido y la trazabilidad del repo lo hacen adecuado para cursos sobre transformers y entrenamiento desde cero.
- Estudios de pruning y eficiencia: al tener checkpoints intermedios y estado de optimizador, permite experimentos de compresión, destilación o cuantización comparables contra el checkpoint raíz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es una pérdida de validación, que no es comparable directamente con MMLU, HumanEval o GSM8K.

| Metrica | Valor | Condiciones |
|---|---|---|
| Perdida final en C4 (FP32) | 3,681496 | Primeras 512 secuencias de validación |
| Tokens de entrenamiento (estimado) | ~688 millones | 10.500 updates x 32 secuencias x 2.048 tokens |
| Updates totales | 10.500 | 500 + 10.000 en el brazo two-stage |

Advertencia del propio autor: las curvas de pérdida usan precisión y masking diferentes entre endpoints, por lo que deben compararse métricas equivalentes.

## Requisitos de hardware

- Peso de los parametros del modelo raiz: ~650 MB en FP32, ~325 MB en FP16/BF16, ~163 MB en INT8 y ~81 MB en INT4.
- El repositorio completo ocupa 3,2 GB porque incluye 4 checkpoints con pesos, estado de optimizador/RNG y recibos de checksum.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB de VRAM o mas (RTX 3050, RTX 3060, RTX 4060, RTX 4090) puede ejecutar inferencia en FP16 y, con cuantizacion, incluso en FP32 con margen.
- GPU profesionales recomendadas para entrenamiento o fine-tuning rapido: A100, H100, L40S; para inferencia basta una T4 o una GPU integrada con suficiente memoria.
- Opciones de despliegue: `transformers` (soporte nativo, como muestra la model card), Text Generation Inference (el tag `text-generation-inference` esta presente), vLLM, y llama.cpp/Ollama previa conversion a GGUF (no se publican pesos GGUF en el repo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qing-yao/ppt-pythia-160m-c4-equal-budget-two-stage-seed324 | 162.322.944 | 2.048 tokens | C4 ingles, ~688M tokens, from scratch | no disponible | HuggingFace, `transformers` |
| EleutherAI/pythia-160m | ~162M | 2.048 tokens | The Pile, 300B tokens, 154 checkpoints | Apache-2.0 | HuggingFace |
| GPT-2 small | 124M | 1.024 tokens | WebText | licencia MIT modificada de OpenAI | HuggingFace, ampliamente soportado |
| SmolLM-135M | ~135M | 2.048 tokens | SmolLM-Corpus, corpus multi-etapa | Apache-2.0 | HuggingFace |

La comparacion de rendimiento en benchmarks no esta disponible: no se han publicado resultados para este checkpoint. Las diferencias principales frente a las alternativas son el volumen de datos (dos ordenes de magnitud menor que Pythia-160M) y la ausencia de licencia declarada, que impide equipararlo en cuanto a condiciones de uso.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación en benchmarks estandar: no hay datos de MMLU, HumanEval, GSM8K ni similares.
- Volumen de entrenamiento muy bajo (~688 millones de tokens, ~4,2 tokens por parámetro) en comparación con modelos de tamaño similar entrenados con cientos de miles de millones de tokens; la pérdida de validación de 3,681496 es alta en términos absolutos.
- Solo inglés declarado; no hay evidencia de capacidades multilingües.
- Sin RLHF, DPO ni ajuste por instrucciones: no es un modelo de chat y puede generar contenido inapropiado o desalineado.
- Riesgo elevado de alucinación y de texto incoherente en generaciones largas, propio de un modelo de 162M parámetros con este presupuesto de entrenamiento.
- Ventana de contexto limitada a 2.048 tokens; no se documenta extrapolación de contexto.
- La licencia no está disponible, lo que supone un riesgo legal para uso comercial o redistribución; conviene contactar con el autor antes de cualquier despliegue en producción.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni informes de terceros sobre su comportamiento.
- Los checkpoints intermedios podados durante el entrenamiento no están disponibles, lo que limita la reproducibilidad completa de las curvas.
- Las curvas de pérdida usan precisión y masking distintos entre endpoints; las comparaciones deben hacerse entre métricas equivalentes, según advierte el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qing-yao/ppt-pythia-160m-c4-equal-budget-two-stage-seed324
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devuelven contenido sin relacion con el mismo.
