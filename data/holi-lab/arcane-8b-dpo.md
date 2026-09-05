# holi-lab/ArcANE-8B-DPO

## Resumen

ArcANE-8B-DPO es un modelo de lenguaje autoregresivo creado por el equipo holi-lab mediante ajuste fino completo del modelo Qwen3-8B. El modelo se entrena en dos etapas: primero supervisión fina (SFT) y después optimización directa de preferencias (DPO), con el objetivo de mejorar la fidelidad temporal en role-playing de personajes narrativos. El trabajo fue aceptado en la conferencia principal de EMNLP 2026 y se acompaña de un artículo en arXiv (2606.05553).

A diferencia de los modelos de role-play convencionales, ArcANE-8B-DPO está diseñado para responder como un personaje en un punto concreto de la historia, evitando que su comportamiento revele información de fases narrativas posteriores. El modelo recibe un Character Arc truncado por capítulo y debe seleccionar la respuesta correcta para la fase ancla frente a respuestas plausibles pero pertenecientes a fases adyacentes. Con 8.190.735.360 parámetros (clase 8B) y una ventana de entrenamiento de 8.192 tokens, el modelo está orientado a investigación en narrativa computacional, agentes conversacionales y evaluación de consistencia de personajes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-8B (transformer decoder-only, denso) |
| Parámetros totales | 8.190.735.360 (≈8,19 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (máximo durante entrenamiento) |
| Tipos de cuantización | No disponible (el repositorio publica únicamente pesos safetensors sin cuantizar) |
| Idiomas soportados | Inglés (según metadatos de HuggingFace) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

ArcANE-8B-DPO parte de Qwen3-8B, un transformer decoder-only con aproximadamente 8.000 millones de parámetros. El ajuste se realiza con fine-tuning completo, esto es, todos los parámetros se actualizan. El proceso consta de dos etapas: primero SFT, donde el modelo aprende respuestas objetivo generadas por el sistema experto bajo contexto de Character Arc, y después DPO, donde se aplican 14.671 pares de preferencia extraídos de 2.516 sondas únicas. En cada par, la respuesta elegida corresponde a la fase ancla de la narración, mientras que la rechazada proviene de una fase adyacente pero incorrecta, manteniéndose el mismo escenario y la misma pregunta.

Los datos de entrenamiento proceden de 12 novelas del corpus ArcANE, abarcando 55 personajes y 339 ejes de personaje. Cada etapa se entrena con 1 época, tasa de aprendizaje de 1e-5 para SFT y 5e-6 para DPO, tamaño de lote 64 y máxima longitud de secuencia de 8.192 tokens. La innovación técnica principal es el uso de un Character Arc truncado por capítulo: el modelo solo recibe la información del arco hasta el capítulo consultado, y cualquier fase posterior debe ocultarse para que el modelo se mantenga fiel al punto temporal. Esto permite distinguir cambios sutiles de comportamiento entre fases narrativas adyacentes.

## Capacidades

- Role-play de personajes condicionado al momento narrativo (point-in-time character role-play).
- Generación de respuestas coherentes con un Character Arc truncado al capítulo consultado.
- Discriminación de respuestas correctas frente a alternativas plausibles provenientes de fases adyacentes e incorrectas.
- Generación de texto en inglés utilizando el chat template de Qwen3 en modo no-thinking, como recomienda la ficha del modelo.
- Manejo de contextos narrativos largos de hasta 8.192 tokens durante el entrenamiento.
- Adaptación a novelas con múltiples personajes y arcos: 12 novelas, 55 personajes y 339 ejes en el corpus de entrenamiento.
- No se documenta soporte de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación en narrativa computacional: el modelo permite estudiar si los agentes conversacionales mantienen coherencia temporal al representar personajes de ficción. Se usa en laboratorios de PLN para comparar sistemas de role-play, utilizando el juez DeepSeek-V4-Flash y las métricas APF, RPF, RAE y PTF descritas en el artículo.

- Simulación de NPC en juegos de rol interactivos: un personaje no jugador que no debe revelar acontecimientos futuros de la trama. El modelo se integraría en un pipeline de juego que le proporcione el Character Arc hasta el capítulo actual, garantizando que las respuestas respeten la fase narrativa del personaje.

- Escritura colaborativa de ficción: autores que desean comprobar si un personaje se mantiene fiel a su desarrollo en un borrador. El modelo puede generar respuestas del personaje en una escena concreta y actuar como copiloto de coherencia, siempre que se le suministre el contexto narrativo adecuado.

- Análisis crítico literario cuantitativo: el corpus ArcANE permite extraer arcos de personaje y sondas para evaluar cómo un modelo interpreta la evolución psicológica de un personaje entre capítulos. Es útil para aplicar métodos cuantitativos en humanidades digitales y estudios de literatura.

- Chatbots de entretenimiento basados en personajes: el modelo puede servir como backend de un asistente conversacional en inglés que interpreta a un personaje de una novela. Se debe ocultar cualquier fase narrativa posterior al capítulo consultado para evitar spoilers y salvaguardar la fidelidad temporal.

- Evaluación de benchmarks de role-play: como modelo de referencia de 8B, permite comparar otros sistemas de role-play en la tarea de mantenerse en personaje en el momento correcto. La puntuación Overall de 56.9 con contexto Arc sobre el conjunto reservado proporciona una referencia cuantitativa sólida.

- Verificación de consistencia narrativa en pipelines de generación: al ser un modelo de 8B, puede ejecutarse en una GPU de consumo y usarse como verificador de coherencia en sistemas de IA narrativa, generando respuestas de personaje para validar si una fase concreta se representa correctamente en textos generados por otros modelos.

## Benchmarks y rendimiento

El modelo se evaluó sobre un conjunto reservado de cinco novelas con 25 personajes principales, 205 arcos y 1.754 sondas. Un juez DeepSeek-V4-Flash puntuó cada respuesta libre en cuatro métricas de 1 a 100: APF (Action Phase-Fidelity), RPF (Reasoning Phase-Fidelity), RAE (Reasoning-Action Entailment) y PTF (Phase Trajectory Fidelity). Las puntuaciones se agrupan dentro de cada novela, las novelas reciben el mismo peso y la puntuación Overall es la media de las celdas de 12 categorías de sonda por métrica.

Resultados en el conjunto reservado con contexto Arc:

| Categoría de sonda | APF | RPF | RAE | PTF |
|---|---|---|---|---|
| In-Scenario | 59.5 | 57.7 | 50.6 | 56.0 |
| In-World | 60.9 | 59.3 | 52.3 | 54.6 |
| Out-of-World | 62.5 | 60.5 | 54.5 | 54.6 |

Comparación de puntuación Overall:

| Comparación | Overall |
|---|---|
| ArcANE-8B-DPO, con contexto Arc | **56.9** |
| ArcANE-8B-DPO, mejor contexto no-Arc | 48.5 |
| ArcANE-8B-SFT, con contexto Arc | 52.3 |
| Qwen3-8B, con contexto Arc | 43.1 |

El ajuste DPO mejora la puntuación Overall con contexto Arc en 4.6 puntos respecto a ArcANE-8B-SFT y en 13.8 puntos respecto a Qwen3-8B bajo el mismo contexto. No se han publicado resultados en benchmarks generalistas como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: entre 20 y 24 GB, considerando que el repositorio de safetensors ocupa aproximadamente 16.4 GB, más las activaciones y la caché KV.
- VRAM estimada en cuantización 4-bit: alrededor de 8 a 10 GB. Esta cuantización no está publicada oficialmente y requiere conversión adicional.
- GPUs recomendadas: RTX 4090 o RTX 3090 (24 GB) para ejecutar en bf16 sin cuantizar. Para producción con lotes grandes, A100 de 40/80 GB o H100.
- Compatibilidad con GPU de consumo: sí, con RTX 4090 o RTX 3090 en bf16; con cuantización 4-bit puede caber en GPUs de 12 a 16 GB.
- Opciones de despliegue: Transformers (carga directa con `AutoModelForCausalLM`), vLLM, Text Generation Inference (TGI), llama.cpp u Ollama. Las dos últimas requieren una cuantización previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Entrenamiento | Overall (contexto Arc) | Parámetros | Licencia |
|---|---|---|---|---|---|
| ArcANE-8B-DPO | Qwen3-8B | SFT + DPO | **56.9** | 8.19B | Apache 2.0 |
| ArcANE-8B-SFT | Qwen3-8B | SFT | 52.3 | 8.19B | Apache 2.0 |
| Qwen3-8B | Qwen3-8B | Preentrenado | 43.1 | ≈8B | Apache 2.0 |

Además, la colección ArcANE en HuggingFace incluye variantes de mayor tamaño: ArcANE-32B-DPO y ArcANE-32B-RLVR, ambas de 33B, que comparten el mismo enfoque pero con un modelo base mayor. No se dispone de datos de benchmark para estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: el modelo está orientado al inglés según los metadatos de HuggingFace; el corpus de entrenamiento procede de novelas en inglés, por lo que su rendimiento en otros idiomas no está evaluado.
- No es un modelo generalista: no se han publicado resultados en benchmarks clásicos como MMLU, HumanEval o GSM8K. Su uso previsto es investigación en role-play narrativo.
- Dependencia del contexto: el rendimiento óptimo exige proporcionar el Character Arc truncado al capítulo consultado. Si se exponen fases futuras, el modelo puede tener fugas de información y revelar spoilers.
- Restricciones de preprocesado: para una condicionamiento temporal fiel deben eliminarse siempre `literary_validation` y `evidence_summary`; si cualquier fase posterior queda oculta, también deben eliminarse `pole_end` y `arc_direction`.
- Ventana de entrenamiento limitada: la máxima longitud de secuencia es de 8.192 tokens durante el entrenamiento, lo que puede no aprovechar toda la capacidad de contexto de la base Qwen3-8B.
- Evaluación con juez automático: las puntuaciones proceden del juez DeepSeek-V4-Flash, lo que introduce un sesgo inherente al propio modelo evaluador.
- Adopción temprana: el modelo tiene 0 descargas en HuggingFace en el momento de la consulta, por lo que no existen validaciones externas ni datos de uso en producción.
- Riesgo de alucinación: si el contexto del Character Arc es insuficiente o ambiguo, el modelo puede inventar rasgos, eventos o relaciones del personaje que no estén presentes en la información proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo está orientado a investigación. El corpus ArcANE puede tener restricciones adicionales que conviene revisar antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/holi-lab/ArcANE-8B-DPO
- Artículo en arXiv: https://arxiv.org/abs/2606.05553
- Dataset de entrenamiento: https://huggingface.co/datasets/holi-lab/ArcANE-Data
- Modelo base SFT: https://huggingface.co/holi-lab/ArcANE-8B-SFT
- Repositorio de ArcANE en GitHub: https://github.com/holi-lab/ArcANE
- Colección ArcANE en HuggingFace: https://huggingface.co/collections/holi-lab/arcane
