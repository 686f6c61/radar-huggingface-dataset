# s2naito/qwen3.5-0.8b-rag-sft-v4j-p1

## Resumen

`s2naito/qwen3.5-0.8b-rag-sft-v4j-p1` es un ajuste fino mediante LoRA del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario s2naito. El modelo está especializado en responder preguntas de formato corto (short-answer QA) en japonés utilizando contextos recuperados de Wikipedia en japonés mediante un pipeline RAG de producción. Con 873.438.784 parámetros, se posiciona como una alternativa compacta para tareas de question answering sobre documentación recuperada.

La relevancia de este modelo radica en su enfoque práctico: no se trata de un modelo generalista, sino de un componente específico dentro de un sistema RAG completo. El autor documenta con precisión la genealogía del entrenamiento, incluyendo el pipeline de recuperación (4-way RRF top-100, reranker Ruri, 2-hop basado en reglas, selector de artículos) y las recetas de ajuste (SFT v4e como punto de partida, continuación durante 1 época con lr 2e-05). Esta trazabilidad es poco habitual en modelos de este tamaño y facilita la reproducibilidad.

El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial, aunque los datos de entrenamiento derivan de fuentes con licencia CC BY-SA 4.0, lo que introduce consideraciones adicionales que se detallan en la sección de limitaciones. El repositorio tiene un tamaño de 1,8 GB y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), ajuste fino con LoRA sobre `target_modules="all-linear"` |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` (revisión `2fc06364715b967f1860aea9cf38778875588b17`), un transformer de 873 millones de parámetros. Sobre esta base se aplicó un ajuste fino con LoRA configurado con `target_modules="all-linear"`, es decir, adaptadores de bajo rango aplicados a todas las capas lineales. El entrenamiento es una continuación del adaptador de `s2naito/qwen3.5-0.8b-rag-sft-v4e` (revisión `6248a7d2efb5fd79c35f72e487374d14769a3d3e`), ejecutado durante 1 época con tasa de aprendizaje 2e-05 sobre los datos de SFT v4e (receta "Plan C"), añadiendo hasta 250 preguntas de 2-hop concatenadas mecánicamente (`both_hops=True`, con limpieza mecánica de comillas y puntuación). La semilla de entrenamiento es 42.

Los datos de entrenamiento provienen de varias fuentes en japonés: JEMHopQA, JSQuAD/JGLUE, NIILC QA, `cl-nagoya/auto-wiki-qa` y los "Distributed Wikipedia Chunks" (`bumbuboon/llm-course-final-2026`, derivados de Wikipedia en japonés). Los contextos de recuperación se construyeron con el pipeline de producción del autor: RRF de 4 vías con top-100, reranker Ruri, 2-hop basado en reglas, selector de artículos `s2naito/qwen3.5-0.8b-rag-selector-v2` (revisión `1850aaee2c3c7b0de057a61856b3d94941b88aa0`) y `rerank_title_tail` con `CONTEXT_TOP_K=5`. No se documenta el uso de RLHF o DPO; el proceso es exclusivamente SFT.

## Capacidades

- Generación de respuestas cortas a preguntas en japonés fundamentadas en contextos recuperados (RAG short-answer QA).
- Razonamiento multi-hop limitado: el entrenamiento incluye hasta 250 preguntas de 2-hop concatenadas mecánicamente, lo que le permite encadenar dos saltos de inferencia sobre el contexto.
- Procesamiento de contextos construidos por un pipeline específico (selector de artículos + reranker), lo que implica que el modelo está optimizado para ese formato de entrada concreto.
- Capacidad multilingüe limitada al japonés según la model card (`language: ja`); no se documentan capacidades en otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- **Sistemas RAG sobre Wikipedia en japonés**: el modelo está entrenado específicamente para responder preguntas de formato corto a partir de contextos recuperados con un pipeline concreto (RRF + Ruri reranker + selector de artículos). Es adecuado para integrarse como componente generador en un sistema de búsqueda documental en japonés.
- **Asistentes de consulta interna en empresas japonesas**: dado su tamaño reducido (873 M parámetros), puede desplegarse en infraestructura modesta para responder preguntas sobre documentación interna en japonés, siempre que se construya un pipeline de recuperación equivalente al usado en entrenamiento.
- **Prototipado rápido de pipelines RAG**: al ser un modelo pequeño y con licencia Apache-2.0, permite iterar sobre diseños de recuperación y evaluación sin grandes costes de cómputo.
- **Evaluación de pipelines de recuperación**: el modelo puede usarse como generador fijo para comparar distintas configuraciones de retrieval (distintos rerankers, top-k, etc.) manteniendo constante el componente de generación.
- **Investigación en QA multi-hop en japonés**: el entrenamiento con preguntas de 2-hop lo hace útil para estudiar el comportamiento de modelos pequeños en tareas de razonamiento encadenado sobre contexto recuperado.
- **Despliegue en entornos con restricciones de recursos**: con menos de mil millones de parámetros, puede ejecutarse en CPU o GPU de gama baja para tareas de respuesta corta, aunque no se documentan latencias ni throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la documentación. Como referencia orientativa por el tamaño (873 M parámetros), en FP16 requeriría aproximadamente 1,7 GB de pesos, y en cuantización de 8 bits alrededor de 0,9 GB; en cuantización de 4 bits, en torno a 0,5 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- **GPU recomendadas**: no disponible. Por tamaño, cabría en GPUs consumer como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para despliegues de mayor concurrencia.
- **Compatibilidad con GPU consumer**: previsiblemente sí, dado el tamaño, aunque no se documenta oficialmente.
- **Opciones de despliegue**: no se documentan opciones específicas (vLLM, llama.cpp, Ollama, TGI). La disponibilidad de pesos en safetensors permite su carga con transformers; no se publican variantes GGUF.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| `s2naito/qwen3.5-0.8b-rag-sft-v4j-p1` | 873 M | No disponible | ja | Apache-2.0 | RAG QA japonés |
| `Qwen/Qwen3.5-0.8B` (base) | 873 M | No disponible | Multilingüe (no detallado) | Apache-2.0 | Generalista |
| `s2naito/qwen3.5-0.8b-rag-sft-v4e` | 873 M | No disponible | ja | Apache-2.0 | RAG QA japonés (versión previa) |
| `s2naito/qwen3.5-0.8b-rag-selector-v2` | 873 M | No disponible | ja | Apache-2.0 | Selección de artículos en RAG |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos**: no se documentan análisis de sesgos. Al entrenarse sobre Wikipedia en japonés y datasets de QA académicos, puede heredar sesgos de cobertura y representación de esas fuentes.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir respuestas no fundamentadas en el contexto, especialmente si el pipeline de recuperación no coincide con el usado en entrenamiento (selector de artículos, reranker, top-k).
- **Dependencia del pipeline**: el modelo está entrenado con un formato de contexto muy específico (`CONTEXT_TOP_K=5`, selector `rag-selector-v2`, `rerank_title_tail`). Usarlo con otro pipeline puede degradar significativamente el rendimiento.
- **Idioma**: solo se declara japonés; no se garantiza un comportamiento correcto en otros idiomas.
- **Licencia de datos**: aunque el modelo se distribuye como Apache-2.0, los datos de entrenamiento (JEMHopQA, JSQuAD/JGLUE, NIILC QA, auto-wiki-qa, Wikipedia) están bajo CC BY-SA 4.0. Esto puede imponer obligaciones de atribución y compartir-igual en determinados usos derivados; conviene revisar la compatibilidad antes de un uso comercial.
- **Contexto**: no se documenta la longitud máxima de contexto soportada, lo que impide planificar despliegues con contextos largos.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-28), lo que sugiere que no ha sido validado por la comunidad.
- **Sin benchmarks**: no hay métricas publicadas que permitan evaluar su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4j-p1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Adaptador previo: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4e
- Selector de artículos: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-selector-v2
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset JSQuAD/JGLUE: https://github.com/yahoojapan/JGLUE
- Dataset NIILC QA: https://github.com/mynlp/niilc-qa
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset Distributed Wikipedia Chunks: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
