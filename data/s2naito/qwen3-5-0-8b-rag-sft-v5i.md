# s2naito/qwen3.5-0.8b-rag-sft-v5i

## Resumen

`s2naito/qwen3.5-0.8b-rag-sft-v5i` es un ajuste fino (SFT mediante LoRA) del modelo base `Qwen/Qwen3.5-0.8B`, publicado por el usuario s2naito en Hugging Face. El modelo está especializado en responder preguntas cortas en japonés sobre Wikipedia, dentro de un pipeline de generación aumentada por recuperación (RAG) concreto: el denominado `run055`, que combina recuperación híbrida con fusión RRF de cuatro vías, un reranker Ruri, expansión de consulta basada en reglas (2-hop) y un selector de artículos específico.

El problema que aborda es acotado pero real: en sistemas RAG de producción, un modelo pequeño debe extraer la respuesta correcta de un conjunto de pasajes recuperados y formularla de manera concisa, sin alucinar y respetando el contexto proporcionado. Este ajuste entrena al modelo para esa tarea concreta, con contextos de hasta cinco pasajes (`CONTEXT_TOP_K=5`) y un conjunto de datos limpio de QA de autoría humana (sin JaQuAD), construido a partir de JEMHopQA, JSQuAD/JGLUE, NIILC QA y fragmentos de Wikipedia japonesa.

Con 873 millones de parámetros y licencia Apache 2.0, es un modelo pensado para despliegue ligero en entornos con recursos limitados, no para uso generalista. Su relevancia es la de un componente especializado dentro de una arquitectura RAG japonesa: no compite con modelos frontera, sino que optimiza una etapa concreta del pipeline. El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto de investigación o desarrollo interno más que un modelo ampliamente adoptado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5), según el modelo base; detalles internos no disponibles |
| Parámetros totales | 873.438.784 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, presumiblemente bf16/fp16; no se confirman otras variantes) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `Qwen/Qwen3.5-0.8B` (revisión `2fc06364715b967f1860aea9cf38778875588b17`) realizado con LoRA y `target_modules="all-linear"`, es decir, aplicando adaptadores de bajo rango a todas las capas lineales del transformer. Los pesos publicados corresponden presumiblemente a la fusión de los adaptadores LoRA con el modelo base, dado el tamaño del repositorio (1,8 GB) y el recuento de parámetros coincidente con el modelo base.

El entrenamiento se realizó sobre una expansión limpia de QA de autoría humana (SFT v5i), sin incluir JaQuAD, siguiendo un esquema denominado "Plan C" que combina ejemplos de JEMHopQA (x2), ejemplos de rango 2-5 limpios (+1) y un solapamiento estricto de párrafos mayor o igual a 0,50. Se entrenaron 2 épocas con semilla 42. Los contextos de entrenamiento se generaron con el pipeline de recuperación de producción `run055`: recuperación de cuatro vías con RRF sobre top-200, reranker Ruri sobre top-200, expansión 2-hop basada en reglas, selección de artículos mediante `s2naito/qwen3.5-0.8b-rag-selector-v2` y `rerank_title_tail`, con `CONTEXT_TOP_K=5`. Los datos de entrenamiento provienen de JEMHopQA, JSQuAD/JGLUE, NIILC QA y fragmentos de Wikipedia japonesa, todos bajo licencia CC BY-SA 4.0 y modificados (filtrados y reformateados) para el entrenamiento.

## Capacidades

- Generación de respuestas cortas y concisas en japonés a partir de contextos recuperados.
- QA extractivo y abstractivo sobre pasajes de Wikipedia japonesa.
- Manejo de preguntas multi-hop (derivadas de JEMHopQA) con contexto limitado a cinco pasajes.
- Seguimiento de instrucciones de formato para respuestas breves.
- Capacidad multilingüe limitada al japonés según la model card; el modelo base podría tener capacidades adicionales, pero el ajuste está orientado a japonés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.
- No se documentan capacidades de generación de código ni matemáticas avanzadas.

## Casos de uso

- Atención al cliente en japonés basada en base de conocimiento: el modelo puede integrarse como generador final de un pipeline RAG que recupere artículos de una wiki interna y formule respuestas concisas, aprovechando su entrenamiento específico para extraer respuestas de contextos recuperados.
- Búsqueda de respuestas sobre Wikipedia japonesa: adecuado para sistemas de QA que recuperen pasajes y necesiten una respuesta breve y fiel al contexto, con el pipeline `run055` como referencia de integración.
- Asistentes de documentación técnica en japonés: puede responder preguntas sobre manuales o documentación interna siempre que el pipeline de recuperación proporcione pasajes relevantes, gracias a su tolerancia a contextos de hasta cinco fragmentos.
- Sistemas de QA multi-hop ligeros: su entrenamiento con JEMHopQA le permite abordar preguntas que requieren combinar información de varios pasajes, útil en dominios con entidades relacionadas.
- Componente de bajo coste en pipelines de producción: con menos de mil millones de parámetros, puede desplegarse en GPUs de consumo o incluso en CPU con cuantización, reduciendo costes frente a modelos mayores en la etapa de generación.
- Evaluación de pipelines RAG: sirve como generador de referencia para comparar configuraciones de recuperación y reranking en japonés, ya que fue entrenado con un pipeline concreto y reproducible.
- Prototipado de asistentes conversacionales en japonés: útil para pruebas de concepto donde se requiera un modelo ligero con licencia permisiva y comportamiento ajustado a respuestas breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2,5 y 4 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16 (RTX 3050, RTX 4060, T4); para mayor throughput, A10G, L4 o A100/H100 en despliegues por lotes.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más en bf16 y en tarjetas con 2 GB o más en cuantización de 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), Transformers con `device_map="auto"`.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| s2naito/qwen3.5-0.8b-rag-sft-v5i | 873 M | No disponible | Japonés | Apache 2.0 | QA RAG en japonés |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Multilingüe (según modelo base) | Apache 2.0 (según modelo base) | Uso general |
| s2naito/qwen3.5-0.8b-rag-selector-v2 | No disponible | No disponible | Japonés | No disponible | Selección de artículos en RAG |

La comparativa con modelos de la misma categoría (QA en japonés de menos de mil millones de parámetros) no está disponible en la información proporcionada. El modelo base Qwen3.5-0.8B es la referencia natural, pero no se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para QA corto sobre contextos recuperados por un pipeline concreto (`run055`); su comportamiento fuera de ese esquema puede degradarse notablemente.
- El idioma soportado declarado es únicamente japonés; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas no respaldadas por el contexto, especialmente si los pasajes recuperados son irrelevantes o contradictorios.
- Sesgos: no se documentan evaluaciones de sesgo; los datos de entrenamiento provienen de Wikipedia y corpus académicos japoneses, con los sesgos inherentes a esas fuentes.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, pero los datos de entrenamiento (JEMHopQA, JSQuAD/JGLUE, NIILC QA, Wikipedia) están bajo CC BY-SA 4.0; el uso comercial debe evaluar las obligaciones de atribución y compartir igual derivadas de los datos, aunque la licencia del modelo sea permisiva.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con contextos superiores a los cinco pasajes usados en entrenamiento.
- Sin métricas publicadas: no hay benchmarks que permitan estimar su calidad frente a alternativas, lo que dificulta su adopción en producción sin evaluación propia.
- Repositorio sin adopción: cero descargas y cero likes en el momento de la consulta; es un artefacto de investigación sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v5i
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Selector de artículos: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-selector-v2
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JGLUE / JSQuAD: https://github.com/yahoojapan/JGLUE
- NIILC QA: https://github.com/mynlp/niilc-qa
- Dataset de contextos: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
