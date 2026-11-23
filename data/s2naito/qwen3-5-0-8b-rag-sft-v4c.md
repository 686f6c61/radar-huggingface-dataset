# s2naito/qwen3.5-0.8b-rag-sft-v4c

## Resumen

`s2naito/qwen3.5-0.8b-rag-sft-v4c` es un ajuste fino por LoRA del modelo base `Qwen/Qwen3.5-0.8B`, publicado por el usuario s2naito en Hugging Face. El modelo está especializado en respuesta corta a preguntas (short-answer QA) sobre Wikipedia en japonés dentro de un pipeline RAG de producción concreto, identificado por el autor como `run029`/`run030`. No es un modelo de propósito general: es un artefacto de investigación reproducido sobre una receta de recuperación muy específica.

El ajuste emplea LoRA con `target_modules="all-linear"` sobre la revisión `2fc06364715b967f1860aea9cf38778875588b17` del modelo base. Los datos de entrenamiento provienen de JEMHopQA, JSQuAD/JGLUE, NIILC QA y fragmentos de Wikipedia japonesa distribuida, todos ellos bajo licencia CC BY-SA 4.0. La receta de SFT se denomina "Plan C" e incluye un refuerzo de rangos limpios 2-5 con un máximo de 3 veces por pregunta y semilla de entrenamiento 42.

Con 873.438.784 parámetros reales (según los pesos en safetensors) y un repositorio de 1,8 GB, el modelo es muy ligero y está pensado para ejecutarse en entornos con recursos limitados. Su relevancia es acotada: sirve como referencia reproducible para quien quiera replicar o comparar un pipeline RAG japonés de extremo a extremo, no como un modelo generalista listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles internos no disponibles) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B`, un transformer de aproximadamente 0,8 mil millones de parámetros, y se ajusta mediante LoRA con `target_modules="all-linear"`, es decir, adaptadores de bajo rango aplicados a todas las capas lineales. El autor no documenta el rango, el alpha ni la tasa de aprendizaje del adaptador, ni si los pesos publicados son la fusión completa del modelo base con el adaptador o solo el adaptador. El tamaño del repositorio (1,8 GB) es coherente con pesos en fp16/bf16 del modelo completo.

Los datos de entrenamiento combinan cuatro fuentes: JEMHopQA, JSQuAD/JGLUE, NIILC QA y fragmentos de Wikipedia japonesa (`bumbuboon/llm-course-final-2026`). Las tres primeras se filtraron y reformatearon para el entrenamiento; los fragmentos de Wikipedia se usaron sin modificar como contextos de recuperación seleccionados por el pipeline. La receta de SFT se denomina "Plan C" e incorpora un refuerzo de rangos limpios 2-5 con un máximo de 3 aplicaciones por pregunta y semilla 42. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

La innovación principal no está en la arquitectura, sino en la integración con un pipeline de recuperación concreto: 4-way RRF top-100, reranker Ruri, 2-hop basado en reglas, selección de artículos con `Qwen/Qwen3.5-0.8B` y `rerank_title_tail` con `CONTEXT_TOP_K=5`. El modelo está entrenado para consumir exactamente ese formato de contexto.

## Capacidades

- Generación de respuestas cortas a preguntas sobre Wikipedia en japonés, dentro de un pipeline RAG con contexto recuperado.
- Manejo de preguntas multi-hop (JEMHopQA) y de QA extractivo (JSQuAD, NIILC QA) en japonés.
- Consumo de contextos formateados según la receta `run029`/`run030` con hasta 5 fragmentos (`CONTEXT_TOP_K=5`).
- Capacidad multilingüe: limitada al japonés según la model card; no se declaran otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Respuesta corta sobre Wikipedia japonesa: el modelo recibe los 5 fragmentos recuperados por el pipeline `run029`/`run030` y devuelve una respuesta concisa, aprovechando que fue entrenado exactamente con ese formato de contexto.
- Evaluación de pipelines RAG en japonés: sirve como componente generador de referencia para comparar variantes de recuperación (RRF, reranker Ruri, 2-hop) manteniendo fijo el modelo de respuesta.
- Reproducción de experimentos de investigación: al documentarse la receta de SFT (Plan C, semilla 42, refuerzo de rangos 2-5), permite replicar el ajuste y contrastar resultados.
- Prototipado de asistentes de documentación interna en japonés: con un corpus propio formateado como los fragmentos de Wikipedia, el modelo puede adaptarse a QA sobre manuales, aunque requeriría validación adicional.
- Despliegue en entornos con recursos limitados: con menos de 1.000 millones de parámetros, cabe en GPUs de consumo y en CPU con cuantización, lo que facilita pruebas locales del pipeline completo.
- Generación de datos sintéticos de QA japonés: puede usarse para producir pares pregunta-respuesta cortos a partir de contextos recuperados, sujeto a revisión humana por riesgo de alucinación.
- Filtrado y selección de artículos en pipelines 2-hop: el autor usa el propio `Qwen3.5-0.8B` para la selección de artículos, por lo que este ajuste puede integrarse en esa etapa si se valida su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en fp16/bf16 para los pesos completos; en torno a 0,5-1 GB con cuantización de 4 bits (estimación a partir del número de parámetros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: no se documentan opciones específicas. Al publicarse solo en safetensors, sería necesario convertirlo a GGUF para llama.cpp/Ollama, o cargarlo con transformers, vLLM o TGI. El autor no confirma compatibilidad con estas herramientas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| s2naito/qwen3.5-0.8b-rag-sft-v4c | 873 M | no disponible | ja | Apache 2.0 | QA corta RAG japonés (fine-tune LoRA) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | multilingüe | Apache 2.0 | Modelo generalista |
| Otros fine-tunes de QA japoneses | no disponible | no disponible | ja | variable | QA/RAG |

La comparación con alternativas concretas no está disponible en la información proporcionada. El modelo base `Qwen/Qwen3.5-0.8B` es el referente inmediato, pero no se documentan sus especificaciones de contexto ni sus resultados de benchmarks en esta ficha.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para un pipeline RAG concreto (`run029`/`run030`) y un formato de contexto específico; fuera de ese formato su rendimiento puede degradarse de forma significativa.
- Idioma: solo se declara japonés; no hay evidencia de comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación: como todo modelo generativo de pequeño tamaño, puede inventar respuestas cuando el contexto recuperado no contiene la información; no se documentan mecanismos de abstención.
- Sesgos: no se documentan evaluaciones de sesgo; los datos de Wikipedia y de los corpus japoneses pueden arrastrar sesgos propios.
- Limitaciones de contexto: la longitud máxima de contexto no está documentada; el pipeline usa `CONTEXT_TOP_K=5`, lo que sugiere ventanas moderadas, pero no se confirma.
- Licencia: el modelo se publica bajo Apache 2.0, pero los datos de entrenamiento son CC BY-SA 4.0 (JEMHopQA, JSQuAD/JGLUE, NIILC QA y Wikipedia). Es necesario revisar las obligaciones de atribución y compartir-igual derivadas del uso de esos corpus.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.
- Reproducibilidad: el autor no documenta hiperparámetros de LoRA (rango, alpha, learning rate), número de tokens de entrenamiento ni si los pesos publicados son el adaptador o la fusión completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4c
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- NIILC QA: https://github.com/mynlp/niilc-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Dataset de fragmentos de Wikipedia: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
