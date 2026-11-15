# OkamotoJP/llm2-qwen35-sft016_cmp

## Resumen

`OkamotoJP/llm2-qwen35-sft016_cmp` es un ajuste fino (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP como entrega del curso "LLM講座2 2026". Se trata de un modelo pequeño, de aproximadamente 873 millones de parámetros, especializado en la generación de respuestas para un sistema de RAG (Retrieval-Augmented Generation) en japonés. El autor lo entrenó con LoRA y fusionó después los pesos adaptados con los originales, de modo que la arquitectura resultante es idéntica a la del modelo base y solo se han actualizado los pesos de la parte lingüística.

El modelo resuelve un problema acotado: producir respuestas en japonés a partir de documentos recuperados, con un sesgo hacia tareas de question answering multihop y comparación. Los datos de entrenamiento provienen de JEMHopQA y de `cl-nagoya/auto-wiki-qa`, ambos derivados de Wikipedia en japonés y con licencia CC BY-SA 4.0, lo que lo orienta a dominios enciclopédicos y de conocimiento factual.

Su relevancia es limitada y muy específica: no es un modelo de propósito general ni compite con los grandes modelos actuales, sino un artefacto educativo y experimental con pocas descargas. Resulta útil como ejemplo reproducible de un pipeline SFT + LoRA + merge sobre una base Qwen de menos de mil millones de parámetros, y como componente ligero de generación en un sistema RAG japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B; solo se actualizan los pesos de la parte lingüística) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión original; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japonés (`ja`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y conserva su arquitectura transformer decoder-only sin modificaciones estructurales. El ajuste se realizó mediante LoRA con r=16 y alpha=32, tasa de aprendizaje 1e-4 y una sola época, seguido de la fusión de los adaptadores con los pesos originales. No se indica que se hayan añadido cabeceras, módulos de visión o mecanismos de atención alternativos.

El conjunto de entrenamiento consta de 1207 ejemplos: 883 muestras de `cl-nagoya/auto-wiki-qa` y 324 de JEMHopQA (partición `jemhopqa_train_sft/comparison`). Ambos datasets derivan de Wikipedia en japonés y están licenciados bajo CC BY-SA 4.0; el autor indica que aplicó muestreo, filtrado y reformateo. También se empleó un conjunto de fragmentos distribuidos (chunks) de Wikipedia japonesa como material de contexto en los prompts de entrenamiento. No se documenta el número total de tokens vistos, la composición exacta de las secuencias ni si hubo etapas de RLHF o DPO posteriores al SFT.

## Capacidades

- Generación de texto en japonés orientada a respuestas breves y factuales.
- Question answering sobre contexto documental (RAG), incluyendo preguntas multihop (JEMHopQA).
- Tareas de comparación y contraste entre entidades, según la partición `comparison` del dataset de entrenamiento.
- Condicionamiento por contexto: el prompt incluye fragmentos recuperados como material de referencia.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del implícito en preguntas multihop.
- No se documenta modo de razonamiento explícito (thinking mode).
- No se documenta capacidad de visión ni de audio.
- Capacidad multilingüe: solo se declara japonés; no se garantiza un rendimiento fiable en otros idiomas.

## Casos de uso

- Generación de respuestas en un pipeline RAG japonés: el modelo recibe los chunks recuperados como contexto y produce la respuesta final; su tamaño reducido permite desplegarlo en el mismo nodo que el recuperador.
- Question answering enciclopédico: adecuado para preguntas sobre entidades de Wikipedia japonesa, dado que el entrenamiento se basa en `auto-wiki-qa` y JEMHopQA.
- Preguntas multihop: puede encadenar información de varios fragmentos para responder cuestiones que requieren combinar hechos, gracias al entrenamiento específico con JEMHopQA.
- Comparación de entidades: útil en consultas del tipo "¿qué diferencia hay entre X e Y?", alineadas con la partición `comparison` del dataset.
- Prototipado y docencia: sirve como ejemplo reproducible de SFT con LoRA y fusión de pesos sobre una base Qwen sub-1B, útil en cursos y talleres.
- Evaluación de sistemas RAG: al ser un modelo pequeño y especializado, permite medir el impacto del recuperador y del reformateo de contexto con bajo coste computacional.
- Despliegue en entornos con recursos limitados: con menos de mil millones de parámetros, cabe en GPUs de consumo y en CPU para inferencia por lotes no interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2,5 y 4 GB según longitud de contexto y batch.
- En cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no se publican artefactos cuantizados).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050/3060, RTX 4060, T4); A100/H100 no son necesarias y estarían infrautilizadas.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más; también en CPU para inferencia no interactiva.
- Opciones de despliegue: `transformers` (carga directa de safetensors), vLLM y TGI para servir en GPU, llama.cpp/Ollama solo si se genera previamente una versión GGUF (no publicada).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft016_cmp | 873 M | no disponible | ja | Apache-2.0 | SFT especializado en RAG japonés; 5 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | multilingüe (según model card del base) | Apache-2.0 | Modelo generalista del que deriva; sin especialización RAG |
| cl-nagoya/auto-wiki-qa (dataset) | no aplica | no aplica | ja | CC BY-SA 4.0 | Fuente de entrenamiento, no un modelo comparable |

No se dispone de información sobre benchmarks que permita comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenado únicamente con 1207 ejemplos y una sola época: riesgo alto de sobreajuste al formato de los datasets y de degradación fuera de ese dominio.
- Especializado en RAG sobre Wikipedia japonesa; el rendimiento en otros dominios o en conversación abierta no está documentado y previsiblemente será pobre.
- Solo se declara japonés; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación factual inherente a un modelo de 0,8 B, especialmente cuando el contexto recuperado es insuficiente o contradictorio.
- Sesgos: no documentados por el autor; al derivar de Wikipedia japonesa, puede heredar sesgos de cobertura y de redacción de esa fuente.
- Restricciones de licencia: los pesos son Apache-2.0, pero los datasets de entrenamiento son CC BY-SA 4.0; conviene revisar las obligaciones de atribución y compartir-igual si se redistribuye el modelo o se usa comercialmente.
- El modelo base Qwen3.5-0.8B debe verificarse en su propia model card para conocer contexto máximo, licencia efectiva y condiciones de uso.
- Uso en producción no recomendado sin evaluación propia: pocas descargas, sin benchmarks publicados y sin pipeline declarado.

## Enlaces

- Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft016_cmp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
