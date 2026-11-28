# samyhaff/qwen3-4b-grpo-ed

## Resumen

qwen3-4b-grpo-ed es un modelo de desambiguación de entidades (entity disambiguation, ED) derivado de Qwen/Qwen3-4B mediante ajuste fino supervisado con LoRA (fusionado en los pesos finales) y aprendizaje por refuerzo con verificación (RLVR) usando GRPO. Lo desarrolla Samy Haffoudhi (con Fabian M. Suchanek y Nils Holzenberger como coautores del artículo asociado), y se publica como artefacto reproducible del trabajo "When Does Reasoning Help Entity Disambiguation? Small LLMs In-Domain and Under Shift", aceptado en Findings de EACL 2027.

El modelo resuelve una tarea concreta: dada una mención marcada entre corchetes dentro de un texto y una lista numerada de candidatos con descripciones, el modelo razona y devuelve el índice del candidato correcto en el campo `"answer"`. No es un modelo de propósito general: está especializado en el pipeline de entity linking, donde se combina con un reranker (qwen3-4b-reranker-ed) que produce el top-10 de candidatos.

Su relevancia radica en dos puntos. Primero, demuestra que modelos pequeños (4.022 millones de parámetros) pueden alcanzar resultados competitivos en ED cuando se entrenan con RLVR y recompensa por selección correcta (80,5 de accuracy en ZELDA y 78,0 de accuracy normalizada en ZESHEL en régimen zero-shot verdadero). Segundo, es un ejemplo práctico de cómo el razonamiento explícito (thinking mode) aporta valor medible en tareas de desambiguación con cambio de dominio (domain shift).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con LoRA fusionado y RLVR con GRPO |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen/Qwen3-4B) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only denso de aproximadamente 4.000 millones de parámetros. Sobre esa base se aplica un ajuste fino con LoRA que posteriormente se fusiona en los pesos, seguido de un entrenamiento con RLVR (Reinforcement Learning with Verifiable Rewards) mediante GRPO. La recompensa se define por la selección del candidato correcto en la lista, lo que convierte la tarea de desambiguación en un problema de decisión con señal verificable.

El entrenamiento se realiza sobre ZELDA, un dataset de entity disambiguation. El prompt de inferencia exige marcar la mención con `[` `]`, numerar los candidatos con descripciones y pedir al modelo que razone antes de emitir `"answer": <índice>`. En la evaluación del artículo se emplea el top-10 de candidatos generado por qwen3-4b-reranker-ed, y se recomienda muestrear 10 completaciones y aplicar voto mayoritario para estabilizar la respuesta. El modelo se evalúa tanto en dominio (ZELDA) como en zero-shot verdadero sobre ZESHEL, lo que mide su robustez ante cambio de dominio.

## Capacidades

- Razonamiento previo a la respuesta (thinking mode) antes de emitir el índice del candidato.
- Desambiguación de entidades en contexto: selecciona el candidato correcto de una lista numerada con descripciones.
- Salida estructurada mediante el campo `"answer": <índice>`, parseable con expresiones regulares.
- Capacidad multilingüe: no confirmada en la información disponible.
- Tool calling / function calling: no documentado para este ajuste específico.
- Soporte de agentes y multi-step reasoning: no documentado; el razonamiento interno sí está presente, pero no se describe uso agéntico.
- Capacidades de visión o audio: no disponibles.
- Integración con vLLM y text-generation-inference según los tags del repositorio.

## Casos de uso

- Desambiguación de entidades en pipelines de entity linking: el modelo recibe la mención en contexto y el top-10 de candidatos generado por un reranker, y devuelve el índice elegido. Es su caso de uso principal y el documentado en el artículo.
- Enriquecimiento de bases de conocimiento: dado un corpus de noticias o documentos, se detectan menciones y se resuelven contra una lista de entidades candidatas para poblar un grafo de conocimiento.
- Normalización de entidades en datos de clientes: resolver menciones ambiguas (por ejemplo, "Jordan" como país, persona o río) en registros CRM o bases de datos maestras.
- Búsqueda y recuperación aumentada: desambiguar consultas y documentos antes de la recuperación para mejorar la precisión del matching de entidades.
- Evaluación de robustez ante domain shift: usar el modelo como referencia en experimentos que miden cuánto degrada un sistema de ED al cambiar de dominio (ZELDA frente a ZESHEL).
- Investigación reproducible en RLVR: servir como punto de partida o baseline para experimentos con GRPO en tareas de decisión con recompensa verificable.
- Moderación y resolución de referencias en contenido generado: identificar a qué entidad concreta se refiere una mención ambigua en textos producidos por otros modelos.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| ZELDA | Accuracy | 80,5 |
| ZESHEL | Accuracy normalizada (zero-shot verdadero) | 78,0 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 8 GB solo para pesos, más overhead de KV cache; se recomienda al menos 12-16 GB para contexto largo y muestreo múltiple.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4-5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB (estimaciones, no verificadas en la información disponible).
- GPU recomendadas: A100, H100 o L40S para throughput alto con vLLM; RTX 4090 o RTX 3090 para desarrollo y despliegue individual en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con margen; en GPUs de 8-12 GB probablemente requiera cuantización.
- Opciones de despliegue: vLLM (recomendado en la model card, con `SamplingParams` y `chat_template_kwargs={"enable_thinking": True}`), text-generation-inference (tag `text-generation-inference`), transformers.
- Latencia y throughput: no disponibles en la información proporcionada. El muestreo de 10 completaciones con hasta 2048 tokens por respuesta multiplica el coste; conviene planificar capacidad para ese patrón.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| samyhaff/qwen3-4b-grpo-ed | 4.022 M | No disponible | Entity disambiguation con razonamiento | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B (base) | 4.022 M | No disponible | Propósito general | Apache 2.0 | Hugging Face |
| samyhaff/qwen3-4b-reranker-ed | No disponible | No disponible | Reranking de candidatos para ED | No disponible | Hugging Face |

No se dispone en la información proporcionada de resultados de benchmarks de los modelos alternativos para una comparación cuantitativa directa.

## Limitaciones y advertencias

- Modelo especializado: no está pensado para generación de texto general; su rendimiento fuera del formato de prompt documentado no está garantizado.
- Dependencia del formato: exige la mención marcada con `[` `]` y candidatos numerados; desviarse del formato puede degradar la salida.
- Necesidad de voto mayoritario: la model card recomienda muestrear 10 completaciones y tomar la mayoría, lo que multiplica el coste de inferencia.
- Riesgo de alucinación en el índice: puede emitir índices fuera de rango o respuestas no parseables; el código de ejemplo filtra índices inválidos.
- Sesgos: no documentados en la información disponible; al heredar de Qwen3-4B puede arrastrar sesgos del modelo base y del dataset ZELDA.
- Cobertura idiomática: no confirmada; la evaluación se centra en ZELDA y ZESHEL, con posibles sesgos hacia el inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B y de los datasets empleados.
- Cambio de dominio: el artículo mide explícitamente el comportamiento bajo domain shift; el rendimiento en dominios alejados de ZELDA puede caer.
- Dependencia del reranker: en el pipeline del artículo los candidatos provienen de qwen3-4b-reranker-ed; usar otro generador de candidatos puede alterar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samyhaff/qwen3-4b-grpo-ed
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Reranker asociado: https://huggingface.co/samyhaff/qwen3-4b-reranker-ed
- Artículo (arXiv): https://arxiv.org/abs/2611.30334
- Repositorio del pipeline y evaluación: https://github.com/samyhaff/ed-study
