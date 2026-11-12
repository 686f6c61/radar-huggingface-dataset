# mktktmr/qwen3.5-0.8b-rag-stage8

## Resumen

mktktmr/qwen3.5-0.8b-rag-stage8 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario mktktmr y publicado en Hugging Face. Se trata de un modelo de aproximadamente 853 millones de parámetros (852.985.920 según los pesos en safetensors), orientado a tareas de generación aumentada por recuperación (RAG) en japonés. El autor lo describe como la "etapa 8" de una serie de experimentos de ajuste sobre el mismo modelo base.

El ajuste se realizó mediante LoRA y posteriormente se fusionó (merge) en los pesos del modelo original. El trabajo se centra en la reconstrucción de los datos de entrenamiento de JEMHopQA, un conjunto de preguntas y respuestas multi-salto en japonés: en esta etapa, los documentos de contexto se regeneran incorporando una segunda fase de recuperación que añade a los candidatos los artículos correspondientes a las entidades puente (nombres propios que conectan los distintos saltos de la pregunta).

El modelo es relevante para quienes investigan pipelines de RAG multi-salto en japonés con modelos pequeños, ya que explora cómo la calidad y la composición del contexto recuperado afectan al ajuste de un modelo de menos de mil millones de parámetros. No obstante, la información publicada es muy limitada: no se detallan hiperparámetros, número de tokens de entrenamiento, licencia propia ni idiomas declarados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en la model card; los datos de entrenamiento son en japonés |
| Licencia | no disponible (el modelo base Qwen/Qwen3.5-0.8B se indica como Apache-2.0) |
| Formato de pesos | safetensors (tamano del repo: 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 con aproximadamente 853 millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA, cuyos adaptadores se fusionaron posteriormente en los pesos del modelo, de modo que el artefacto publicado es un checkpoint completo en safetensors y no requiere cargar adaptadores por separado.

Los datos de entrenamiento combinan varias fuentes en japonés: JEMHopQA (preguntas multi-salto), NIILC QA, JSQuAD/JGLUE y un conjunto de fragmentos de Wikipedia japonesa. La innovación declarada por el autor es la regeneración de los documentos de contexto de JEMHopQA mediante una segunda fase de recuperación que incorpora los artículos de las entidades puente. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, el rango de LoRA, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto y respuesta a preguntas en japonés, con especial énfasis en preguntas multi-salto que requieren encadenar información de varios documentos.
- Razonamiento sobre contexto recuperado (RAG): el ajuste está diseñado para que el modelo aproveche documentos de soporte que incluyen entidades puente intermedias.
- Comprensión lectora sobre pasajes: los datos de JSQuAD/JGLUE y NIILC QA apuntan a extracción de respuestas a partir de texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible; el "multi-salto" aquí se refiere a la recuperación de documentos, no a un bucle de agente.
- Capacidades multilingües: no declaradas; el entrenamiento documentado es exclusivamente en japonés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Sistemas de pregunta-respuesta sobre Wikipedia japonesa: el modelo está ajustado con fragmentos de Wikipedia y JEMHopQA, por lo que encaja en pipelines que recuperan pasajes y generan la respuesta final citando el contexto.
- RAG multi-salto en dominio jurídico o administrativo japonés: al haberse entrenado con contextos que incluyen entidades puente, puede manejar preguntas del tipo "¿qué relación hay entre la entidad A y la entidad C pasando por B?".
- Evaluación de pipelines de recuperación: sirve como modelo de referencia pequeño para medir cómo cambia la calidad de las respuestas al variar la estrategia de recuperación (una vs. dos fases).
- Prototipado de asistentes documentales en japonés con presupuesto de hardware reducido: sus ~853 M de parámetros permiten iterar rápido en una sola GPU de consumo.
- Extracción de respuestas en tareas de comprensión lectora (estilo JSQuAD): útil para anotación asistida o generación de datasets sintéticos de QA.
- Investigación académica sobre ajuste LoRA en modelos sub-1B: el checkpoint fusionado permite reproducir y comparar etapas de un mismo experimento (la "etapa 8" sugiere una serie).
- Filtrado y reescritura de contextos recuperados: puede emplearse para condensar pasajes antes de pasarlos a un modelo mayor en una arquitectura de dos niveles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB para contextos moderados.
- Cuantización a 8 bits: aproximadamente 0,9 GB de pesos; a 4 bits, en torno a 0,5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A10, L4). Para despliegue en servidor, A100/H100 no son necesarias por tamaño, pero pueden aportar throughput.
- Cabe en GPU de consumo: sí, con holgura en tarjetas de 6 GB o más en fp16 y en tarjetas de 4 GB con cuantización.
- Opciones de despliegue: al ser un checkpoint safetensors de arquitectura Qwen3.5, debería cargarse con transformers; para servir en producción, vLLM o TGI si la arquitectura está soportada por esas herramientas. No se han publicado conversiones a GGUF, por lo que llama.cpp/Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-rag-stage8 | 852.985.920 | no disponible | no disponible | Fine-tune LoRA fusionado para RAG en japonés |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Apache-2.0 (según model card del fine-tune) | Modelo generalista sin ajuste específico de RAG |
| Otros fine-tunes de Qwen3.5-0.8B para QA en japonés | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la información proporcionada |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks publicados ni se documentan modelos de la misma categoría (QA multi-salto en japonés con menos de 1 B de parámetros) en la información proporcionada.

## Limitaciones y advertencias

- La model card está redactada en japonés y es muy escueta: no incluye hiperparámetros, número de tokens, ni detalles de evaluación.
- No se declara licencia para el checkpoint publicado; aunque el modelo base se indica como Apache-2.0, el uso comercial del fine-tune debe verificarse con el autor.
- Los datos de entrenamiento (JEMHopQA, NIILC QA, JSQuAD/JGLUE y Wikipedia japonesa) están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas; conviene revisar la implicación para uso comercial.
- Riesgo de alucinación inherente a modelos de ~0,8 B: la capacidad de razonamiento multi-salto es limitada y puede inventar entidades puente o respuestas cuando el contexto es ambiguo.
- El modelo está especializado en japonés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- No hay información sobre sesgos; al entrenarse con Wikipedia y datasets académicos japoneses, puede heredar sesgos de esas fuentes.
- No se documenta la longitud de contexto efectiva tras el ajuste; los pipelines RAG deben validar empíricamente cuántos pasajes admite.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por terceros.
- Al ser un checkpoint fusionado, no se pueden separar los adaptadores LoRA originales para inspeccionar o reutilizar el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-rag-stage8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
