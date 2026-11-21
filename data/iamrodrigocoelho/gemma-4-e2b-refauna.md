# iamrodrigocoelho/gemma-4-e2b-refauna

## Resumen

Gemma 4 E2B · Refauna es un ajuste fino (fine-tuning) del modelo base `google/gemma-4-e2b-it` de Google, especializado en portugués de Brasil para responder preguntas sobre defaunación, refaunación, reintroducción de fauna, dispersión de semillas y conservación de la Mata Atlántica. Lo desarrolla el usuario `iamrodrigocoelho` a partir de la producción científica de la iniciativa Refauna (Río de Janeiro, desde 2010) y se presenta como material de apoyo para una ponencia sobre fine-tuning y RAG en el TDC Stage de Rec'n'Play 2026.

El modelo tiene 5.123.178.051 parámetros (según los safetensors reales del repositorio) y se distribuye en formato safetensors de 16 bits, con variantes LoRA y GGUF (Q4_K_M y Q8_0) en repositorios hermanos. Está entrenado con QLoRA de 4 bits mediante Unsloth y sigue un formato tipo RAFT: recibe hasta cuatro pasajes numerados, cita los fragmentos usados como `[n]` y se abstiene explícitamente cuando la respuesta no está en el contexto.

Su relevancia es doble: por un lado, demuestra un flujo completo de especialización de un modelo pequeño con datos científicos reales y evaluación con juez LLM; por otro, está pensado para desplegarse junto a un sistema RAG (recuperación híbrida con `google/embeddinggemma-300m` más BM25 y fusión RRF), no como modelo de conocimiento autónomo. La licencia Apache 2.0 y el tamaño contenido lo hacen viable en hardware modesto, incluso en un MacBook Air M1 de 8 GB en la variante solo-texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4; multimodal image-text-to-text en el modelo base) |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA 4-bit para entrenamiento; GGUF Q4_K_M y Q8_0 publicados; pesos mesclados en 16-bit |
| Idiomas soportados | Portugués (Brasil) e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16-bit); GGUF en repositorio hermano; adaptador LoRA separado |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e2b-it`, cargado a través de `unsloth/gemma-4-E2B-it`, y conserva la arquitectura transformer decoder-only de la familia Gemma 4. El ajuste fino se realizó con QLoRA de 4 bits (r=16, alpha=16), durante 2 épocas, con learning rate 0.0002 y pérdida calculada solo sobre la respuesta (`train_on_responses_only`). Solo se entrenaron las capas de lenguaje, con plantilla de chat `gemma-4` sin modo thinking. El entrenamiento se ejecutó en una NVIDIA L4 en 27,8 minutos, con un pico de 10,57 GB de VRAM.

El corpus de entrenamiento son 942 ejemplos sintéticos en portugués de Brasil generados a partir de 22 trabajos de Refauna con texto (10 artículos, 4 resúmenes en anales, 4 trabajos de iniciación científica, 2 capítulos de libro, 1 artículo de boletín y 1 disertación). La composición sigue el esquema RAFT: aproximadamente 60 % de ejemplos con el fragmento correcto entre tres distractores y respuesta con cita `[n]`, 15 % con contexto sin la respuesta (para entrenar la abstención) y 25 % sin contexto. Los datos se deduplicaron, se revisaron por muestreo humano y se dividieron por documento, de modo que los documentos de test quedan fuera del entrenamiento.

## Capacidades

- Generación de texto conversacional en portugués de Brasil, con registro didáctico y preciso.
- Respuesta fundamentada en contexto (grounded generation): usa únicamente los pasajes recibidos y cita los fragmentos empleados con la marca `[n]`.
- Abstención explícita: cuando el contexto no contiene la respuesta, indica que no la ha encontrado en los documentos de Refauna en lugar de inventar datos, fechas, cifras o nombres de especies.
- Formato RAFT/RAG: entrenado para recibir hasta cuatro pasajes numerados con metadatos de autor, año y título.
- Dominio especializado: defaunación, refaunación, reintroducción de fauna, dispersión de semillas, interacciones ecológicas y conservación de la Mata Atlántica.
- Capacidad multilingüe limitada: portugués (Brasil) e inglés, con respuestas en portugués por defecto.
- Compatibilidad con endpoints y despliegue en Ollama mediante GGUF, incluida una variante solo-texto sin proyector de visión.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión operativa en este ajuste ni modo thinking (el template se usa sin thinking).

## Casos de uso

- Asistente RAG para investigadores y gestores de conservación: desplegado con un recuperador híbrido (embeddings más BM25, fusión RRF, top-4), responde preguntas sobre protocolos de reintroducción y resultados de Refauna citando los pasajes `[n]`, lo que permite auditar cada afirmación contra la fuente.
- Divulgación científica en portugués: genera explicaciones didácticas sobre defaunación y dispersión de semillas para público no especialista, manteniendo la abstención cuando la pregunta excede el corpus disponible.
- Atención a voluntarios y personal de campo: consulta rápida de procedimientos descritos en artículos, disertaciones y capítulos de libro, con citas que remiten al documento original.
- Docencia y formación: apoyo a clases y talleres sobre conservación de la Mata Atlántica, con respuestas acotadas al material de Refauna y sin riesgo de fabricar referencias bibliográficas.
- Evaluación de pipelines RAG: al estar entrenado en formato RAFT con distractores y casos de abstención, sirve como componente de referencia para medir recuperación (Recall@4, MRR) y fidelidad de citas en sistemas de recuperación científica.
- Despliegue en hardware modesto: la variante GGUF Q4_K_M con Modelfile solo-texto permite ejecutar una demo en un portátil de 8 GB de RAM (pico de memoria de 5,70 GB en un MacBook Air M1), útil para demostraciones en congresos y talleres.
- Prototipado de asistentes de dominio en producción: con licencia Apache 2.0 y pesos safetensors, puede integrarse en servicios con Transformers, vLLM o TGI y sustituirse por el modelo hermano Qwen3.5-2B · Refauna para comparar comportamiento con los mismos datos y prompt.

## Benchmarks y rendimiento

Evaluación con juez LLM `claude-sonnet-5-5` a temperatura 0, sobre unas 60 preguntas de los documentos de test (más 60 en la vía de abstención). Corrección y fidelidad en escala 1–5; tasas en porcentaje. A = base, B = base + RAG, C = fine-tuned, D = fine-tuned + RAG.

| Configuración | Corrección (1–5) | Fidelidad (1–5) | Cita correcta | Abstención correcta | Falsa abstención | PT-BR | Latencia (s, L4) |
|---|---|---|---|---|---|---|---|
| A: base | 1.12 | — | — | — | — | 100% | 4.3 |
| B: base + RAG | 2.47 | 4.35 | 52% | 88% | 0% | 100% | 13.0 |
| C: fine-tuned | 2.17 | — | — | — | — | 100% | 15.6 |
| D: fine-tuned + RAG | 2.29 | 4.17 | 52% | 88% | 0% | 100% | 11.3 |

Recuperación híbrida en test (n=74): Recall@4 = 0.42, MRR@20 = 0.30. La model card señala que el mayor incremento de corrección proviene del componente RAG, no del ajuste fino por sí solo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento QLoRA de 4 bits alcanzó un pico de 10,57 GB en una NVIDIA L4. Los pesos mesclados en 16 bits (5.123 millones de parámetros) ocupan aproximadamente 10,3 GB en disco; en GGUF Q4_K_M el requisito de memoria baja hasta unos 5,70 GB de pico en la demo solo-texto.
- GPU recomendadas: NVIDIA L4 (validada en entrenamiento y evaluación), A100 y H100 para despliegue en 16 bits con mayor concurrencia; RTX 4090 viable para inferencia en 16 bits o cuantizada.
- Cabe en GPU de consumo: sí, en RTX 4090 y similares con 16 bits; en equipos con 8 GB de RAM unificada (MacBook Air M1) mediante GGUF Q4_K_M y el Modelfile solo-texto.
- Opciones de despliegue: Transformers (`pipeline` con `device_map="auto"`), Ollama (`ollama run hf.co/Refauna/gemma-4-e2b-refauna-GGUF:Q4_K_M`), llama.cpp con GGUF, y vLLM/TGI para servir los safetensors (no validado explícitamente en la información disponible).
- Latencia: 11,3 s por respuesta en configuración fine-tuned + RAG sobre L4 (frente a 13,0 s de base + RAG y 15,6 s de fine-tuned sin RAG). Throughput no disponible.
- Nota de despliegue: en Ollama 0.40 o posterior no se debe enviar el parámetro `think`; `think: false` altera el prompt de Gemma 4 y degrada la adherencia al formato de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E2B · Refauna (este) | 5.123.178.051 | no disponible | RAG/RAFT sobre conservación de Mata Atlántica, PT-BR | Apache 2.0 | safetensors 16-bit, LoRA, GGUF Q4_K_M/Q8_0 |
| Qwen3.5-2B · Refauna (modelo hermano) | no disponible | no disponible | Mismos datos, prompt y evaluación que este modelo | no disponible | GGUF |
| google/gemma-4-e2b-it (base) | no disponible | no disponible | Modelo generalista multimodal image-text-to-text | Apache 2.0 | safetensors |

El modelo hermano Qwen3.5-2B · Refauna comparte corpus, prompt y protocolo de evaluación, lo que permite una comparación directa de comportamiento entre arquitecturas; sin embargo, la información disponible no incluye sus métricas ni sus especificaciones completas.

## Limitaciones y advertencias

- Dependencia estricta del formato de prompt: el modelo fue entrenado con una plantilla concreta (system prompt de Assistente Refauna, hasta cuatro pasajes numerados, sin thinking); cualquier variación degrada la calidad de las respuestas.
- Está diseñado para usarse con RAG: sin contexto, su corrección cae (2.17 en fine-tuned frente a 2.47 en base + RAG), por lo que no debe emplearse como fuente de conocimiento autónoma.
- Rendimiento de recuperación modesto: Recall@4 = 0.42 y MRR@20 = 0.30 en el conjunto de test, lo que limita la corrección final incluso con el modelo ajustado.
- Corpus de entrenamiento pequeño y sintético: 942 ejemplos derivados de 22 documentos, con revisión humana solo por muestreo; puede arrastrar sesgos y huecos de los trabajos de Refauna.
- Cobertura temática y geográfica acotada: conservación de la Mata Atlántica y producción científica de una única iniciativa; fuera de ese dominio la abstención es el comportamiento esperado, pero no garantizado.
- Idiomas limitados a portugués de Brasil e inglés, con respuestas en PT-BR por defecto; no se documenta rendimiento en otras lenguas.
- Riesgo de alucinación residual pese al entrenamiento de abstención: la propia evaluación reporta fidelidad de 4.17 sobre 5 en la configuración fine-tuned + RAG, no perfección.
- No se documenta soporte de tool calling, agentes o visión operativa en este ajuste, aunque el modelo base es image-text-to-text; el proyecto es solo texto y la variante GGUF con proyector de visión no se usa.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `google/gemma-4-e2b-it` y de los datos científicos de Refauna antes de explotación en producción.
- En Ollama 0.40 o posterior, enviar `think: false` rompe la adherencia al formato de entrenamiento; debe omitirse el parámetro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamrodrigocoelho/gemma-4-e2b-refauna
- Modelo mesclado 16-bit (Repositorio Refauna): https://huggingface.co/Refauna/gemma-4-e2b-refauna
- Adaptador LoRA: https://huggingface.co/Refauna/gemma-4-e2b-refauna-lora
- GGUF Q4_K_M y Q8_0: https://huggingface.co/Refauna/gemma-4-e2b-refauna-GGUF
- Modelo hermano Qwen3.5-2B · Refauna: https://huggingface.co/iamrodrigocoelho/qwen3.5-2b-refauna-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- Repositorio Unsloth del base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Iniciativa Refauna: https://refauna.org.br
- Modelo de embeddings usado en recuperación: https://huggingface.co/google/embeddinggemma-300m
