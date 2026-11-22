# llm-jp/llm-jp-4-8b-thinking-gguf

## Resumen

llm-jp-4-8b-thinking-gguf es la versión en formato GGUF del modelo denso de 8B de la serie LLM-jp-4, desarrollada por el Centro de Investigación y Desarrollo de Modelos de Lenguaje Grande del Instituto Nacional de Informática de Japón (NII). Se trata de un transformer denso de 32 capas con 4.096 dimensiones ocultas y 32 cabezas de atención, entrenado desde cero con un enfoque explícito en el bilingüismo japonés-inglés y en el razonamiento paso a paso (thinking mode).

El modelo forma parte de una familia que incluye también una variante MoE de 32B-A3B, y se distribuye bajo licencia Apache 2.0. La variante "thinking" se ha alineado mediante SFT seguido de DPO, sin refuerzo con RL, lo que la diferencia de la variante "instruct" (solo SFT). Su ventana de contexto de 65.536 tokens y su tokenizador Unigram byte-fallback con vocabulario derivado de llm-jp-tokenizer v4.0 lo hacen adecuado para tareas de razonamiento largo y conversación multi-turno.

La relevancia actual del modelo radica en su apuesta por el ecosistema japonés open source: corpus de preentrenamiento y mid-training publicados, datasets de SFT y DPO liberados, y un cookbook específico. El formato GGUF facilita su despliegue en entornos con recursos limitados mediante llama.cpp y derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (32 capas, hidden size 4.096, 32 cabezas) |
| Parametros totales | 8.590.200.832 (8,59B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | no disponible (repositorio GGUF; las variantes concretas no se detallan en la informacion proporcionada) |
| Idiomas soportados | ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso con 32 capas, dimensión oculta de 4.096 y 32 cabezas de atención. De los 8.590.200.832 parámetros totales, 805.306.368 corresponden a embeddings y 7.784.894.464 a parámetros no-embedding. El tokenizador es un modelo Unigram byte-fallback basado en huggingface/tokenizers, con vocabulario convertido desde llm-jp-tokenizer v4.0; la model card advierte que el entrenamiento puro con SentencePiece no reproduce dicho vocabulario.

El entrenamiento sigue un pipeline multi-etapa de preentrenamiento y mid-training con un total de 11,7 billones (11,7T) de tokens. Los corpus están publicados en GitLab (llm-jp-corpus-v4.1 y llm-jp-corpus-midtraining-v2), aunque algunas porciones quedan excluidas por restricciones de licencia. La fase de post-entrenamiento combina SFT y DPO; los datasets de SFT y de DPO específicos para el modelo de 8B están disponibles en Hugging Face. No se emplea aprendizaje por refuerzo. La plantilla de chat está diseñada para ser compatible con el formato de respuesta OpenAI Harmony, aunque el tokenizador no es compatible con la tokenización directa de la librería `openai-harmony`, por lo que debe usarse el tokenizador incluido en el modelo.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés.
- Razonamiento paso a paso mediante modo "thinking" (entrenado con SFT + DPO).
- Generación y comprensión de código en C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala y TypeScript, según los lenguajes declarados en la model card.
- Soporte de contexto largo de hasta 65.536 tokens, útil para documentos extensos y conversaciones prolongadas.
- Capacidad bilingüe japonés-inglés, con foco explícito en calidad en japonés (evaluación con AnswerCarefully y MT-Bench JA).
- Formato de chat compatible con OpenAI Harmony (con las salvedades de tokenización indicadas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Atención al cliente en japonés: el modelo puede gestionar conversaciones multi-turno con hasta 65.536 tokens de contexto, lo que permite mantener historiales largos y documentación de referencia en la misma ventana, con calidad específicamente evaluada en japonés mediante AnswerCarefully y MT-Bench JA.
- Asistencia a la programación en producción: con soporte declarado para 13 lenguajes (Python, Rust, Go, TypeScript, etc.), puede integrarse en pipelines de revisión de código o generación de tests; su formato de chat compatible con Harmony facilita la integración en frameworks de agentes.
- Razonamiento documental largo: análisis de contratos, informes técnicos o expedientes en japonés e inglés aprovechando la ventana de 65.536 tokens sin necesidad de chunking agresivo.
- Despliegue en infraestructura limitada: la distribución en GGUF permite ejecutar el modelo de 8,59B en GPUs de consumo mediante llama.cpp u Ollama, con cuantizaciones que reducen el footprint de memoria frente a los safetensors en fp16.
- Investigación en NLP japonés: al publicarse los corpus de preentrenamiento, mid-training, SFT y DPO, el modelo sirve como base reproducible para experimentos académicos y comparativas con otros modelos japoneses.
- Generación de contenido bilingüe: traducción y redacción asistida entre japonés e inglés en entornos corporativos, con la ventaja de una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.
- Evaluación comparativa y benchmarking: útil como referencia densa de 8B frente a la variante MoE 32B-A3B de la misma familia para estudiar el equilibrio coste/calidad en tareas de razonamiento.

## Benchmarks y rendimiento

La model card reporta evaluaciones con el framework llm-jp-judge usando `gpt-5.4-2026-03-05` como juez, promediando tres rondas de inferencia. La tabla publicada en la información disponible solo incluye la fila de gpt-4o-2024-08-06; no se proporcionan las puntuaciones del propio llm-jp-4-8b-thinking.

| Modelo | MT-Bench (JA) | MT-Bench (EN) | AnswerCarefully | llm-jp-instructions |
|---|---:|---:|---:|---:|
| gpt-4o-2024-08-06 | 7,29 | 7,69 | 4,00 | 4,07 |
| llm-jp-4-8b-thinking | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible los resultados del modelo en MMLU, HumanEval, GSM8K ni en los benchmarks anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (8,59B parámetros), en fp16 serían necesarios aproximadamente 17 GB solo para pesos; en cuantizaciones de 8 bits, unos 9 GB; en 4 bits, unos 5 GB, sin contar KV cache ni overhead.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o A100/H100 permiten ejecutar el modelo en fp16 con margen para contexto largo; GPUs de 8-12 GB requerirían cuantización.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 con cuantización, y en GPUs de 8-12 GB con cuantizaciones de 4-5 bits, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repo también declara compatibilidad con transformers para el modelo base. vLLM y TGI no se mencionan en la información disponible para esta variante GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---:|---|---|---|
| llm-jp-4-8b-thinking | 8,59B denso | 65.536 | Apache 2.0 | en, ja | SFT + DPO, formato GGUF, familia con corpus y datasets publicados |
| llm-jp-4-32b-a3b-thinking | 32,14B totales / 3,83B activos (MoE) | 65.536 | Apache 2.0 | en, ja | Misma familia, mayor capacidad con activación reducida |
| gpt-4o-2024-08-06 | no disponible | no disponible | propietaria | multilingüe | Usado como juez y referencia en la model card (MT-Bench JA 7,29 / EN 7,69) |

No se dispone en la información proporcionada de comparativas con otros modelos abiertos de tamaño similar (por ejemplo, Llama o Qwen en la franja de 7-9B); se indica como no disponible.

## Limitaciones y advertencias

- Idiomas limitados a inglés y japonés; el rendimiento en castellano u otras lenguas no está documentado y previsiblemente será inferior.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se reportan tasas específicas en la información disponible.
- Sesgos conocidos: no documentados en la model card; los corpus excluyen algunas porciones por restricciones de licencia, lo que puede introducir sesgos de cobertura.
- El modo "thinking" puede generar cadenas de razonamiento largas, incrementando latencia y consumo de tokens; conviene controlar la longitud de salida en producción.
- La plantilla de chat es compatible con OpenAI Harmony, pero el tokenizador no es compatible con la librería `openai-harmony`; es obligatorio usar el tokenizador del modelo para un comportamiento correcto.
- La variante "instruct" de la familia se entrena solo con SFT (sin DPO); no confundirla con esta variante "thinking".
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero deben conservarse los avisos de licencia y atribución.
- No se publican requisitos oficiales de hardware ni latencias, por lo que el dimensionamiento en producción debe validarse empíricamente.
- El repositorio GGUF no detalla las cuantizaciones incluidas; conviene verificar los archivos disponibles antes de planificar el despliegue.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/llm-jp/llm-jp-4-8b-thinking-gguf
- Colección LLM-jp-4 Models: https://huggingface.co/collections/llm-jp/llm-jp-4-models
- Cookbook: https://github.com/llm-jp/llm-jp-4-cookbook
- Centro de I+D de LLM (LLMC, NII): https://llmc.nii.ac.jp/
- National Institute of Informatics: https://www.nii.ac.jp/en/
- Tokenizador llm-jp-tokenizer: https://github.com/llm-jp/llm-jp-tokenizer
- Corpus de preentrenamiento: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-v4.1
- Corpus de mid-training: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-midtraining-v2
- Dataset SFT: https://huggingface.co/datasets/llm-jp/llm-jp-4-thinking-sft-data
- Dataset DPO (8B): https://huggingface.co/datasets/llm-jp/llm-jp-4-8b-thinking-dpo-data
- Dataset DPO (32B-A3B): https://huggingface.co/datasets/llm-jp/llm-jp-4-32b-a3b-thinking-dpo-data
- Benchmark AnswerCarefully: https://huggingface.co/datasets/llm-jp/AnswerCarefully
- Benchmark llm-jp-instructions: https://huggingface.co/datasets/llm-jp/llm-jp-instructions
- Framework llm-jp-judge: https://github.com/llm-jp/llm-jp-judge
- Formulario de encuesta de uso: https://forms.gle/AvbNXTNT2ADsssHq5
