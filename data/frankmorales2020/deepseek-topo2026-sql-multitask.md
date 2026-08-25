# frankmorales2020/deepseek-topo2026-sql-multitask

## Resumen

El modelo `frankmorales2020/deepseek-topo2026-sql-multitask` es un fine-tuning del modelo base DeepSeek-R1-Distill-Llama-8B, especializado en la generación de consultas SQL a partir de lenguaje natural. Ha sido desarrollado por frankmorales2020 y destaca por aplicar una técnica experimental denominada TOPO-2026, basada en embeddings anclados en números primos, para abordar el problema del olvido catastrófico en aprendizaje continuo. El modelo se entrenó de forma secuencial sobre tres tareas de complejidad creciente (SQL simple, medio y complejo) utilizando el dataset `b-mc2/sql-create-context`, y los resultados reportados muestran una mejora en el rendimiento de tareas anteriores (backward transfer positivo) y un factor de olvido combinado negativo (-0,98 %), lo que sugiere que la técnica es efectiva en este escenario.

La relevancia de este modelo radica en que demuestra una posible vía para entrenar modelos de lenguaje de forma incremental sin degradar el conocimiento previo, un problema abierto en la comunidad. Aunque el modelo es esencialmente un adaptador LoRA sobre un modelo de 8B parámetros, su contribución principal es metodológica: la validación de TOPO-2026 como mecanismo de gobernanza topológica del aprendizaje. El repositorio contiene únicamente los adaptadores (0,2 GB), por lo que para su uso es necesario cargar el modelo base por separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeepSeek-R1-Distill-Llama-8B (transformer decoder-only) |
| Parámetros totales | ~8B (7,03 % entrenables vía LoRA) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Llama-8B, un transformer decoder-only con atención causal, y se fine-tunea mediante adaptadores LoRA (r=16, alpha=16) sobre 7 módulos objetivo (q_proj, v_proj, etc.). La innovación principal es el método TOPO-2026, que congela los embeddings en los índices primos [2, 3, 5, 7, 11, 13] durante el entrenamiento de tareas posteriores, actuando como anclas de memoria. Además, se aplica una regularización de memoria del 5 % sobre esos anclajes y un clipping de gradiente con max_norm=1,0 para estabilidad.

El entrenamiento se realizó de forma secuencial sobre tres tareas de complejidad creciente, con 1.500 muestras de entrenamiento y 200 de validación por tarea, 2 épocas por tarea, batch size 2 y learning rate 2e-4 con decaimiento coseno. Se utilizó el framework Unsloth con Transformers sobre una GPU NVIDIA L4 (22 GB VRAM), con un tiempo total de entrenamiento de aproximadamente 70 minutos. El dataset base contiene 78.577 ejemplos, de los cuales se seleccionaron subconjuntos para cada tarea.

## Capacidades

- Generación de consultas SQL a partir de instrucciones en lenguaje natural, cubriendo desde consultas simples (SELECT básicos) hasta consultas complejas con joins, subconsultas y agregaciones.
- Aprendizaje continuo sin olvido catastrófico: el modelo es capaz de incorporar nuevas tareas secuencialmente manteniendo o incluso mejorando el rendimiento en tareas anteriores, gracias a la técnica TOPO-2026.
- Inferencia eficiente mediante adaptadores LoRA, lo que permite cargar el modelo base y los adaptadores por separado.
- Soporte para generación en modo batch, como se muestra en los ejemplos de uso de la model card.
- Capacidad de integración con el ecosistema Hugging Face Transformers y PEFT (PeftModel).
- No se reportan capacidades de tool calling, agentes, visión o audio; el modelo está especializado exclusivamente en SQL.

## Casos de uso

- Asistente de consultas SQL para analistas de datos: el modelo puede traducir preguntas en lenguaje natural a consultas SQL válidas, acelerando el acceso a datos en entornos de business intelligence.
- Generación de SQL para pruebas unitarias: permite crear consultas de prueba a partir de descripciones funcionales, facilitando el desarrollo de pipelines de datos.
- Automatización de informes: integrado en un sistema de generación de informes, puede producir las consultas necesarias para extraer métricas específicas de una base de datos.
- Chatbot de soporte para bases de datos: puede responder a preguntas de usuarios no técnicos sobre los datos, generando la consulta SQL correspondiente en segundo plano.
- Migración de consultas entre dialectos SQL: aunque no se especifica explícitamente, el modelo podría adaptarse a diferentes dialectos si se fine-tunea con datos adicionales, gracias a su capacidad de aprendizaje continuo.
- Entrenamiento incremental en entornos empresariales: el método TOPO-2026 permite actualizar el modelo con nuevas tareas SQL sin reentrenar desde cero, lo que es útil cuando los esquemas de base de datos evolucionan.

## Benchmarks y rendimiento

La model card reporta métricas ROUGE-1 para las tres tareas secuenciales, junto con el factor de olvido combinado (FGT). No se proporcionan comparaciones con otros modelos.

| Tarea | ROUGE-1 (baseline tras entrenar la tarea) | ROUGE-1 (final tras todas las tareas) | Transferencia |
|---|---|---|---|
| A (SQL simple) | 0,0778 | 0,0961 | +1,82 % |
| B (SQL medio) | 0,2641 | 0,2655 | +0,14 % |
| C (SQL complejo) | 0,3025 | 0,2943 (eval) | -0,82 % (en eval) |

El factor de olvido combinado se calcula como la media de las diferencias negativas entre el rendimiento final y el baseline: (-1,82 % + -0,14 %) / 2 = -0,98 %, lo que indica que no hay olvido, sino una ligera mejora global. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El repositorio contiene solo los adaptadores LoRA (0,2 GB), pero para inferencia se necesita cargar el modelo base DeepSeek-R1-Distill-Llama-8B, que en FP16 ocupa aproximadamente 16 GB de VRAM.
- GPU recomendada: NVIDIA L4 (22 GB VRAM) fue usada para entrenamiento; para inferencia, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A10G) es suficiente.
- En GPUs de consumo con 8-12 GB de VRAM, sería necesario aplicar cuantización (por ejemplo, 4 bits) al modelo base, aunque no se especifican cuantizaciones disponibles.
- Opciones de despliegue: Transformers con `device_map="auto"`, PEFT para cargar adaptadores, y potencialmente vLLM o llama.cpp si se convierte el modelo a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de generación de SQL (como SQLCoder, CodeLlama-SQL o los modelos de la familia DeepSeek-Coder) en la información proporcionada. La model card no incluye benchmarks comparativos ni referencias a otros modelos. Por tanto, no es posible realizar una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- El dataset de entrenamiento (`b-mc2/sql-create-context`) es específico y puede no cubrir todos los dialectos SQL ni esquemas de bases de datos complejos, lo que puede provocar alucinaciones o consultas incorrectas en dominios no vistos.
- La técnica TOPO-2026 es experimental y solo se ha validado en un escenario con tres tareas y un número reducido de muestras; su escalabilidad a problemas mayores no está demostrada.
- El modelo base DeepSeek-R1-Distill-Llama-8B puede heredar sesgos presentes en sus datos de preentrenamiento, aunque no se han evaluado específicamente.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero es recomendable revisar los términos de la licencia del modelo base (DeepSeek-R1-Distill-Llama-8B) para asegurar el cumplimiento.
- No se especifica la longitud de contexto soportada, lo que limita su uso en consultas muy largas o con múltiples tablas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/frankmorales2020/deepseek-topo2026-sql-multitask
- Notebook de entrenamiento (GitHub): https://github.com/frank-morales2020/AST/blob/main/TOPO_T2SQL.ipynb
- Papers de referencia mencionados en los tags (sin URL directa): arXiv:1312.6211, arXiv:1909.08383, arXiv:2106.09685
