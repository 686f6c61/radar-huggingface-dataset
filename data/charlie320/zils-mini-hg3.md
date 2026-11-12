# Charlie320/zils-mini-hg3

## Resumen

zils-mini-hg3 es un modelo de decisión de 4.539 millones de parámetros publicado por el usuario Charlie320 en Hugging Face. Se trata de un fine-tune de Qwen/Qwen3.5-4B orientado a tareas de clasificación y decisión, desarrollado como "body" (cuerpo) para el pool de modelos tipo "soup" denominado Zils `d3-mini`, asociado a la subred 127 de Bittensor. El modelo combina linajes de cuatro modelos base: Qwen/Qwen3.5-4B, perplexity-ai/pplx-decider-flash-v1.2, Maincode/Matilda-Decision-v1-Mini y PelaAI/KnowLine-4B-Gen5.

La relevancia de este modelo es acotada y muy específica: no es un modelo de propósito general, sino una pieza dentro de un ecosistema de evaluación y decisión (Zils) que mide la capacidad de un modelo para resolver tareas tipo examen con etiquetas gold. Su entrenamiento se centró en aproximadamente 84.000 ítems de decisión derivados de datasets públicos de inferencia en lenguaje natural (MNLI, RTE, STS-B, QNLI, etc.), matemáticas (GSM8K), function calling (Glaive) y análisis de emoción/sarcasmo.

El modelo se distribuye en formato safetensors y BF16, con licencia Apache 2.0. La información pública disponible es muy limitada: no hay pipeline declarado, no se especifican idiomas soportados y no se han publicado benchmarks ni resultados de evaluación en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-4B; incluye vision tower heredado del modelo padre) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B en el denominado "chassis layout" y se construye mediante un proceso de model soup: el punto de partida es la media de tres modelos "house", sobre la que se ejecutan tres runs de LoRA de rango 64 (learning rate 5e-5, una época, semillas distintas) cuyos resultados se promedian. El resultado se distribuye en BF16 con los pesos de lenguaje entrenados y la torre de visión heredada del modelo padre.

Los datos de entrenamiento suman aproximadamente 84.000 ítems de decisión: unos 70.000 convertidos desde splits públicos de entrenamiento con sus etiquetas gold (MNLI, RTE, STS-B, 20 Newsgroups, QNLI, emotion, sarcasm, SIQA, PIQA, GSM8K, Glaive function calling y puntuaciones de reglas derivadas de TweetEval) en los formatos de examen actuales; 7.120 ítems en formato de examen escritos con la receta pública de autoría de Zils (duplicados x2); y el examen semilla público zils-ai/base-exam-seed-v1 (familias antiguas, x3). Los exámenes semilla v2-v4 no se usaron para entrenamiento. No se documenta el uso de RLHF o DPO.

## Capacidades

- Clasificación y decisión sobre tareas de inferencia en lenguaje natural (NLI, QA, similitud semántica, clasificación temática).
- Razonamiento matemático básico (entrenado con ítems derivados de GSM8K).
- Function calling / tool calling (entrenado con Glaive function calling).
- Análisis de emoción y detección de sarcasmo (datasets emotion y TweetEval).
- Razonamiento físico y sentido común (SIQA, PIQA).
- Capacidades de visión heredadas de la torre del modelo padre (Qwen3.5-4B), aunque no se documenta su rendimiento tras el fine-tune.
- Capacidades multilingües: no disponibles (no se especifican idiomas).

## Casos de uso

- Evaluación de modelos en pipelines de decisión: el modelo puede actuar como "decider" dentro del pool Zils para resolver ítems de examen con etiquetas gold, permitiendo medir y comparar la calidad de otros modelos del ecosistema.
- Clasificación de pares de frases (NLI/RTE): útil para tareas de entailment, detección de contradicción y verificación de hechos en pipelines de moderación o QA.
- Clasificación temática de documentos: entrenado con 20 Newsgroups, puede etiquetar textos en categorías predefinidas en sistemas de enrutamiento o triaje.
- Análisis de sentimiento y sarcasmo: adecuado para monitorización de redes sociales o análisis de opinión, aunque su rendimiento específico no está documentado.
- Function calling en agentes: puede integrarse en flujos donde se requiera decidir qué función invocar a partir de una consulta, gracias al entrenamiento con Glaive.
- Razonamiento matemático de nivel escolar: resolución de problemas tipo GSM8K en entornos educativos o de verificación automática.
- Selección de respuestas en sistemas de ranking: entrenado con STS-B, puede puntuar similitud semántica entre pares de textos para reordenar candidatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache (estimación práctica: 12-16 GB según longitud de contexto).
- VRAM estimada en cuantización de 8 bits: ~5 GB; en 4 bits: ~3 GB (estimaciones teóricas, no se distribuyen pesos cuantizados oficialmente).
- GPU recomendadas: A100 40 GB, H100, L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para BF16 en contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en BF16; en GPUs de 8-12 GB requeriría cuantización no oficial.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversión a GGUF), Ollama (requiere conversión). No se documentan configuraciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-mini-hg3 | 4.539 M | No disponible | Apache 2.0 | Decisión/clasificación (fine-tune de Qwen3.5-4B) |
| Qwen/Qwen3.5-4B | ~4 B | No disponible | No disponible | Modelo base generalista |
| Maincode/Matilda-Decision-v1-Mini | No disponible | No disponible | No disponible | Modelo de decisión (base del soup) |
| PelaAI/KnowLine-4B-Gen5 | ~4 B | No disponible | No disponible | Modelo de conocimiento (base del soup) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado en tareas de decisión con formatos de examen concretos; su rendimiento fuera de ese dominio no está documentado.
- Riesgo de alucinación no evaluado; no se han publicado métricas de fidelidad.
- Idiomas soportados no especificados; no se garantiza un comportamiento multilingüe adecuado.
- Longitud de contexto no documentada; puede diferir del modelo base Qwen3.5-4B.
- Los exámenes semilla v2-v4 no se usaron en entrenamiento, pero el modelo sí vio el seed v1; posible sobreajuste a los formatos de examen Zils.
- La torre de visión se hereda del padre pero no se documenta su rendimiento tras el fine-tune.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B conviene verificar las condiciones del modelo base original.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria ni mantenimiento documentado.
- El proceso de model soup con LoRA promediados puede producir comportamientos menos predecibles que un fine-tune directo.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-hg3
- Modelo base principal: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base del soup: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Modelo base del soup: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Modelo base del soup: https://huggingface.co/PelaAI/KnowLine-4B-Gen5
- Examen semilla público: https://huggingface.co/zils-ai/base-exam-seed-v1
