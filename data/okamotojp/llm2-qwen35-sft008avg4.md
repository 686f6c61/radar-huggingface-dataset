# OkamotoJP/llm2-qwen35-sft008avg4

## Resumen

`llm2-qwen35-sft008avg4` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3.5-0.8B` de Alibaba Qwen, publicado por el usuario OkamotoJP en Hugging Face. Se trata de un modelo de 873 millones de parámetros orientado a la generación de respuestas en japonés dentro de un pipeline de RAG (Retrieval-Augmented Generation), desarrollado como proyecto final del curso "LLM講座2 2026". El modelo no introduce una arquitectura nueva: hereda la estructura del Qwen3.5-0.8B y solo modifica los pesos de la parte lingüística.

La técnica empleada es un *model averaging* (promediado de pesos) de cuatro ajustes LoRA independientes, todos entrenados con los mismos datos pero con semillas distintas (sft008, sft008b, sft008c y sft008d), fusionados y promediados elemento a elemento con peso 0,25 cada uno. Este enfoque busca estabilizar el resultado del ajuste fino y reducir la varianza entre ejecuciones.

Es relevante como ejemplo de flujo de trabajo reproducible para especializar modelos pequeños en una tarea concreta (respuesta a preguntas con contexto documental en japonés) con recursos limitados, y como caso práctico de *weight averaging* sobre adaptadores LoRA. El modelo es de uso libre bajo licencia Apache-2.0, aunque su alcance está acotado a un dominio y un idioma específicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-0.8B; no se detalla en la información disponible) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B`, un transformer de 873 millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) en cuatro ejecuciones independientes que comparten exactamente los mismos datos de entrenamiento y difieren únicamente en la semilla de inicialización. Posteriormente, los adaptadores se fusionaron con los pesos base y los cuatro modelos resultantes se promediaron elemento a elemento con pesos iguales (0,25 cada uno). Según la model card, la estructura del modelo es idéntica a la del original y solo cambian los pesos de la parte lingüística.

Los datos de entrenamiento provienen de tres fuentes en japonés: JEMHopQA (CC BY-SA 4.0, filtrado y reformateado), `cl-nagoya/auto-wiki-qa` (CC BY-SA 4.0, muestreado, filtrado y reformateado) y un conjunto de fragmentos derivados de Wikipedia en japonés (CC BY-SA 4.0) empleados como documentos de contexto en las instrucciones de entrenamiento. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones arquitectónicas propias, ya que el modelo hereda las del base.

## Capacidades

- Generación de respuestas en japonés condicionadas a documentos de contexto (orientado a RAG).
- Respuesta a preguntas de tipo *hop* (multi-salto) en japonés, dado que JEMHopQA es una de las fuentes de entrenamiento.
- Síntesis de información a partir de fragmentos de Wikipedia en japonés.
- Generación de texto general en japonés, heredada del modelo base Qwen3.5-0.8B.
- No se documenta soporte de *tool calling* o *function calling* en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito más allá de la formulación RAG.
- Capacidades multilingües: limitadas al japonés según la etiqueta de idioma del modelo; no se documenta comportamiento en otros idiomas.
- No se documentan capacidades de visión, audio ni *thinking mode*.

## Casos de uso

- **Generación de respuestas en pipelines RAG en japonés**: el modelo está entrenado explícitamente para responder a partir de fragmentos de contexto documental, por lo que encaja como componente generador en un sistema de recuperación + generación sobre corpus japoneses.
- **Preguntas multi-salto sobre Wikipedia japonesa**: al haberse entrenado con JEMHopQA y `auto-wiki-qa`, puede emplearse para responder preguntas que requieren combinar información de varios pasajes.
- **Asistente de documentación interna en japonés**: con un corpus de manuales o políticas internas indexado, el modelo puede generar respuestas citando el contenido recuperado, con un coste de inferencia bajo gracias a su tamaño reducido.
- **Prototipado educativo y experimentación con LoRA**: sirve como referencia reproducible para practicar *fine-tuning* con LoRA, *merging* y *weight averaging* en un modelo pequeño que cabe en hardware de consumo.
- **Sistemas de soporte al cliente en japonés de bajo coste**: para consultas frecuentes sobre productos o servicios, integrado en un flujo RAG con base de conocimiento propia.
- **Evaluación de técnicas de promediado de pesos**: el modelo es un caso de estudio para medir el efecto del *model averaging* sobre la estabilidad y calidad de ajustes finos con distintas semillas.
- **Generación de resúmenes de artículos japoneses**: a partir de fragmentos largos de Wikipedia o prensa, aunque la longitud de contexto efectiva no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada en FP16/BF16**: aproximadamente 1,7-1,8 GB solo para pesos (873 M de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 2-3 GB.
- **VRAM estimada en cuantización de 8 bits**: en torno a 1 GB para pesos.
- **VRAM estimada en cuantización de 4 bits**: en torno a 0,5-0,6 GB para pesos.
- **GPU recomendadas**: cualquier GPU consumer moderna con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; también A100/H100 para despliegues por lotes de alta concurrencia.
- **Cabe en GPU consumer**: sí, en la práctica totalidad de GPU consumer con 4 GB o más.
- **Opciones de despliegue**: al publicarse solo en safetensors, es necesario convertirlo a GGUF para llama.cpp/Ollama, o cargarlo con Transformers, vLLM o TGI (compatibilidad con vLLM/TGI no verificada en la información disponible).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft008avg4 | 873 M | no disponible | ja | Apache-2.0 | Ajuste RAG en japonés con promediado de 4 LoRA |
| Qwen/Qwen3.5-0.8B (base) | 873 M | no disponible | multilingüe (según base) | Apache-2.0 | Modelo original sin especializar |
| OkamotoJP/llm2-qwen35-sft008 (y variantes b, c, d) | 873 M | no disponible | ja | Apache-2.0 | Ajustes individuales promediados en este modelo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Idioma restringido**: el modelo está etiquetado únicamente para japonés; su comportamiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- **Dominio acotado**: el ajuste se orienta a respuesta sobre contexto documental (RAG) con datos de Wikipedia y JEMHopQA; fuera de ese dominio su calidad puede degradarse respecto al modelo base.
- **Riesgo de alucinación**: como todo modelo generativo de 873 M de parámetros, puede inventar contenido, especialmente cuando el contexto recuperado es insuficiente o irrelevante.
- **Contexto no documentado**: se desconoce la longitud máxima de contexto efectiva, lo que dificulta dimensionar los fragmentos de recuperación en producción.
- **Licencia de los datos**: los datasets de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y *share-alike* sobre obras derivadas, aunque los pesos del modelo se publican como Apache-2.0; conviene revisar la compatibilidad para uso comercial.
- **Madurez y adopción**: 3 descargas y 0 *likes* en el momento de la ficha; es un modelo experimental de un curso, sin validación externa ni benchmarks publicados.
- **Sin cuantizaciones oficiales**: no se ofrecen variantes GGUF, AWQ o GPTQ, por lo que el despliegue en entornos ligeros requiere conversión manual.
- **Sesgos**: no documentados; al entrenarse con Wikipedia en japonés, puede heredar sesgos de cobertura y sesgos de género o culturales de esa fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft008avg4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset `cl-nagoya/auto-wiki-qa`: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Modelos promediados: https://huggingface.co/OkamotoJP/llm2-qwen35-sft008, https://huggingface.co/OkamotoJP/llm2-qwen35-sft008b, https://huggingface.co/OkamotoJP/llm2-qwen35-sft008c, https://huggingface.co/OkamotoJP/llm2-qwen35-sft008d
