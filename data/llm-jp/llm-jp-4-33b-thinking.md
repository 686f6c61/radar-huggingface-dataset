# llm-jp/llm-jp-4-33b-thinking

## Resumen

LLM-jp-4-33b-thinking es un modelo de lenguaje denso de 33.000 millones de parametros desarrollado por el Research and Development Center for Large Language Models del National Institute of Informatics (NII) de Japon. Forma parte de la serie LLM-jp-4, una familia de modelos completamente abiertos —incluidos los datos de entrenamiento— que busca democratizar la investigacion en IA para el japones y el ingles. El modelo se entrena en una tuberia de tres fases: pre-training y mid-training sobre 11,7 billones de tokens, seguidos de un post-training con SFT (supervised fine-tuning) y DPO (direct preference optimization), sin reinforcement learning.

La variante "thinking" esta disenada para razonamiento deliberado y conversacion multi-turno, con una ventana de contexto de 65.536 tokens (64K) y una arquitectura transformer densa de 64 capas con 40 cabezas de atencion. Su tokenizer se basa en un modelo Unigram con byte-fallback derivado de llm-jp-tokenizer v4.0. Publicado bajo licencia Apache 2.0, el modelo es relevante por ser uno de los pocos LLM japoneses de este tamano con pesos, datos de entrenamiento y codigo de evaluacion completamente abiertos, y por superar a los modelos anteriores de la serie LLM-jp-4 en todos los benchmarks internos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) |
| Parametros totales | 33.219.548.160 (33B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16/FP32) |
| Idiomas soportados | Japones, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 64 capas, hidden size de 5.120 y 40 cabezas de atencion. Los parametros de embedding suman 1.006.632.960 y los no-embedding 32.212.915.200. El tokenizer emplea un modelo Unigram con byte-fallback basado en llm-jp-tokenizer v4.0, con vocabulario construido mediante un procedimiento propio que no es reproducible con SentencePiece puro.

El entrenamiento sigue un esquema multi-etapa: pre-training y mid-training sobre 11,7 billones de tokens en total, con corpus publicamente disponibles (llm-jp-corpus-v4.1 para pre-training y llm-jp-corpus-midtraining-v2 para mid-training), aunque algunas porciones no se publican por restricciones de licencia. El post-training aplica SFT seguido de DPO, con datasets abiertos: llm-jp-4-thinking-sft-data y llm-jp-4-33b-thinking-dpo-data. El chat template es compatible con el formato de respuesta OpenAI Harmony, pero el tokenizer difiere del asumido por la libreria openai-harmony, por lo que debe usarse el tokenizer propio del modelo.

## Capacidades

- Generacion de texto y conversacion multi-turno en japones e ingles, con razonamiento deliberado ("thinking") integrado.
- Soporte de codigo en 13 lenguajes de programacion: C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala y TypeScript.
- Alineacion de seguridad evaluada con el benchmark AnswerCarefully (336 preguntas del test set v2.0 en japones).
- Capacidad de seguir instrucciones en turno unico evaluada con llm-jp-instructions (400 preguntas del test set).
- Razonamiento conversacional multi-turno evaluado con MT-Bench en japones e ingles.
- Compatibilidad con el ecosistema Hugging Face transformers y text-generation-inference.
- Ventana de contexto de 64K tokens, adecuada para documentos largos y conversaciones extensas.

## Casos de uso

- Atencion al cliente bilingue: el modelo gestiona conversaciones multi-turno en japones e ingles con una ventana de 64K tokens, suficiente para mantener historiales largos de interaccion sin perder contexto.
- Generacion de codigo en entornos de desarrollo japoneses: con soporte para 13 lenguajes, puede integrarse en IDEs o pipelines de CI/CD como asistente de autocompletado y revision de codigo.
- Traduccion y localizacion de documentacion tecnica: su entrenamiento bilingue (ja/en) lo hace adecuado para traducir manuales, APIs y documentacion tecnica entre ambos idiomas con terminologia especializada.
- Analisis de documentos legales o academicos largos: la ventana de 64K tokens permite procesar articulos de investigacion, contratos o informes extensos en una sola pasada, con razonamiento deliberado para extraer conclusiones.
- Sistemas de Q&A sobre conocimiento corporativo: combinado con RAG, puede responder preguntas sobre bases de conocimiento internas en japones e ingles, aprovechando su alineacion con DPO para reducir respuestas no deseadas.
- Investigacion academica en PLN: al ser completamente abierto (pesos, datos y codigo bajo Apache 2.0), sirve como base para estudios de interpretabilidad, fine-tuning adicional o evaluacion comparativa de modelos japoneses.
- Chatbots educativos para aprendizaje de japones o ingles: su capacidad conversacional multi-turno y su alineacion de seguridad lo hacen util para practica de idiomas con correccion gramatical.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion con el framework llm-jp-judge usando gpt-5.4-2026-03-05 como evaluador, pero los valores numericos no estan completos en la informacion disponible. Segun el comunicado del NII, el modelo supera a todos los modelos LLM-jp-4 Thinking publicados anteriormente (8B y 32B-A3B) en los cuatro benchmarks: MT-Bench (JA), MT-Bench (EN), AnswerCarefully y llm-jp-instructions. No se dispone de cifras concretas en los materiales proporcionados.

Nota metodologica: el evaluador gpt-5.4-2026-03-05 es mas estricto que el gpt-4o-2024-08-06 usado en la serie LLM-jp-3, por lo que las puntuaciones no son directamente comparables entre series. Los resultados representan el promedio de tres rondas de inferencia y evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: ~66 GB en FP16 (33B parametros x 2 bytes), ~33 GB en cuantizacion de 8 bits y ~17 GB en cuantizacion de 4 bits (si se publican cuantizaciones).
- GPU recomendadas: A100 80GB o H100 para inferencia en FP16 sin cuantizar; RTX 4090 (24GB) o similar puede servir con cuantizacion de 4 bits.
- No cabe en GPUs de consumo sin cuantizar; con cuantizacion agresiva (4-bit) es viable en una RTX 3090/4090.
- Opciones de despliegue: vLLM, text-generation-inference (el repo incluye el tag TGI), Hugging Face transformers, llama.cpp (si se generan pesos GGUF).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| llm-jp-4-33b-thinking | 33B denso | 65.536 | Apache 2.0 | ja, en | Modelo denso, post-entrenado con SFT+DPO |
| llm-jp-4-8b-thinking | 8B denso | 65.536 | Apache 2.0 | ja, en | Variante pequena, misma familia |
| llm-jp-4-32b-a3b-thinking | 32B MoE (3B activos) | 65.536 | Apache 2.0 | ja, en | Variante MoE con 128 expertos, 8 activos |

El modelo 33B denso es el mas grande de la familia LLM-jp-4 y, segun el NII, supera a las variantes 8B y 32B-A3B en todos los benchmarks internos. No se dispone de comparativas publicadas con modelos externos como Qwen3 o GPT-4o en la informacion proporcionada, aunque el comunicado del NII menciona que los modelos LLM-jp-4 8B y 32B-A3B superan a GPT-4o y Qwen3-8B en varios benchmarks estandar.

## Limitaciones y advertencias

- Idiomas limitados a japones e ingles; no se garantiza rendimiento en otros idiomas.
- El post-training usa DPO pero no reinforcement learning, lo que puede limitar la capacidad de alineacion frente a modelos que usan RLHF.
- El chat template es compatible con OpenAI Harmony, pero requiere el tokenizer propio del modelo; no funciona directamente con la libreria openai-harmony.
- Algunas porciones del corpus de entrenamiento no se publican por restricciones de licencia, lo que limita la reproducibilidad total.
- Riesgo de alucinacion inherente a los modelos de lenguaje; se recomienda validacion humana en aplicaciones de produccion.
- El rendimiento en benchmarks internos usa un evaluador LLM (gpt-5.4-2026-03-05) que es mas estricto que versiones anteriores, por lo que las puntuaciones no son comparables con la serie LLM-jp-3.
- Con 33B parametros, la inferencia requiere hardware de gama alta o cuantizacion; no es adecuado para despliegue en dispositivos edge sin optimizacion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/llm-jp/llm-jp-4-33b-thinking
- Coleccion LLM-jp-4 Models: https://huggingface.co/collections/llm-jp/llm-jp-4-models
- Cookbook de uso: https://github.com/llm-jp/llm-jp-4-cookbook
- Dataset SFT: https://huggingface.co/datasets/llm-jp/llm-jp-4-thinking-sft-data
- Dataset DPO (33B): https://huggingface.co/datasets/llm-jp/llm-jp-4-33b-thinking-dpo-data
- Framework de evaluacion llm-jp-judge: https://github.com/llm-jp/llm-jp-judge
- Corpus de pre-training: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-v4.1
- Corpus de mid-training: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-midtraining-v2
- Tokenizer: https://github.com/llm-jp/llm-jp-tokenizer
- Comunicado del NII sobre LLM-jp-4 33B: https://llmc.nii.ac.jp/topics/post-2941/
- Comunicado del NII sobre LLM-jp-4 8B y 32B-A3B: https://www.nii.ac.jp/en/news/release/2026/0403.html
