# llm-jp/llm-jp-4-33b-thinking-gguf

## Resumen

llm-jp-4-33b-thinking-gguf es la version en formato GGUF del modelo denso de 33B parametros de la serie LLM-jp-4, desarrollada por el Research and Development Center for Large Language Models del National Institute of Informatics (Japon). Se trata de un transformer denso de 64 capas, hidden size 5.120 y 40 cabezas de atencion, con una ventana de contexto de 65.536 tokens, disenado especificamente para tareas de razonamiento con modo "thinking" y con un fuerte enfasis en el idioma japones y el ingles.

El modelo resuelve el problema de disponer de un LLM de gran tamano, abierto y entrenado desde cero con corpus japoneses e ingleses, para tareas conversacionales y de razonamiento multi-paso. Su relevancia actual radica en que combina una licencia permisiva (Apache 2.0), un contexto muy amplio (64K) y una variante "thinking" alineada mediante SFT y DPO, todo ello distribuido en GGUF para facilitar su despliegue en entornos con recursos limitados mediante llama.cpp u Ollama.

La version GGUF conserva los 33.219.548.160 parametros del modelo original y esta pensada para inferencia local o en servidores sin necesidad de infraestructura de GPU de datacenter, aunque el tamano del repositorio (86,6 GB) refleja que las cuantizaciones de alta calidad siguen requiriendo bastante almacenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 33.219.548.160 (33,2B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | no disponible (repositorio GGUF; niveles concretos no especificados en la informacion) |
| Idiomas soportados | Ingles (en) y japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso con 64 capas, hidden size de 5.120, 40 cabezas de atencion y 65.536 tokens de contexto. Cuenta con 1.006.632.960 parametros de embedding y 32.212.915.200 parametros no-embedding. El tokenizador se basa en un modelo Unigram byte-fallback de `huggingface/tokenizers`, con vocabulario derivado de `llm-jp-tokenizer v4.0`; la plantilla de chat es compatible con el formato de respuesta OpenAI Harmony, aunque el tokenizador no es compatible con la libreria `openai-harmony` y debe usarse el tokenizador propio del modelo.

El entrenamiento sigue un pipeline multi-etapa de pre-entrenamiento y mid-training con un total de 11,7T tokens, usando corpus publicos (`llm-jp-corpus-v4.1` y `llm-jp-corpus-midtraining-v2`), con algunas porciones excluidas por restricciones de licencia. La fase de post-entrenamiento combina SFT y DPO (sin aprendizaje por refuerzo); la variante "thinking" usa ambos, mientras que la variante "instruct" solo usa SFT. Los datasets de SFT y DPO estan publicados en Hugging Face.

## Capacidades

- Generacion de texto conversacional multi-turno en japones e ingles.
- Razonamiento multi-paso mediante modo "thinking" (cadena de pensamiento antes de la respuesta).
- Generacion y comprension de codigo en C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala y TypeScript.
- Alineacion conversacional mediante SFT y DPO, orientada a respuestas utiles y seguras.
- Soporte de contexto largo de hasta 65.536 tokens para documentos extensos o historiales largos.
- Capacidades multilingues limitadas a ingles y japones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Atencion al cliente en japones: el modelo puede gestionar conversaciones multi-turno con historiales largos gracias a su ventana de 65.536 tokens, manteniendo coherencia en contextos de soporte tecnico o comercial en japones.
- Asistentes de razonamiento tecnico: el modo "thinking" permite descomponer problemas complejos (diagnostico de errores, analisis de requisitos) en pasos intermedios antes de emitir una respuesta final.
- Generacion de codigo en produccion: con soporte para trece lenguajes de programacion, puede integrarse en pipelines de revision o generacion de codigo, especialmente en entornos donde el japones sea el idioma de documentacion.
- Analisis de documentos largos en japones: contratos, informes o manuales de decenas de miles de tokens pueden procesarse en una sola pasada sin truncamiento.
- Traduccion y localizacion tecnica ingles-japones: util para equipos que trabajan con documentacion bilingue en dominios de ingenieria o software.
- Despliegue local en entornos con privacidad de datos: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en infraestructura propia, evitando el envio de datos a servicios externos.
- Investigacion academica en PLN japones: al estar entrenado desde cero con corpus japoneses publicos y con datasets de post-entrenamiento abiertos, sirve como base reproducible para experimentos.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion con `llm-jp-judge` (LLM-as-a-Judge con `gpt-5.4-2026-03-05`) sobre MT-Bench (JA), MT-Bench (EN), AnswerCarefully y llm-jp-instructions, pero los valores numericos no estan disponibles en la informacion proporcionada (la tabla aparece truncada).

| Benchmark | Resultado |
|---|---|
| MT-Bench (JA) | no disponible |
| MT-Bench (EN) | no disponible |
| AnswerCarefully (336 preguntas, v2.0 test) | no disponible |
| llm-jp-instructions (400 preguntas, test) | no disponible |

Nota de la model card: las evaluaciones de la serie llm-jp-3 usaban `gpt-4o-2024-08-06`; el evaluador `gpt-5.4-2026-03-05` es mas estricto, por lo que los scores de MT-Bench no son directamente comparables con los de la serie anterior. Los resultados publicados corresponden a la media de tres rondas de inferencia y evaluacion.

## Requisitos de hardware

- VRAM estimada: para 33,2B parametros, en FP16 se requieren aproximadamente 66 GB; en cuantizaciones de 8 bits, unos 33-35 GB; en 4 bits, unos 17-20 GB (estimaciones teoricas a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas para FP16: A100 80 GB, H100 80 GB o multi-GPU (2x A100 40 GB).
- GPU consumer: las cuantizaciones de 4 bits podrian caber en una RTX 4090 (24 GB) de forma ajustada; en 8 bits no caben en GPU consumer de 24 GB.
- Despliegue: al distribuirse en GGUF, es compatible con llama.cpp y Ollama; vLLM y TGI requeririan los pesos en safetensors del modelo base, no incluidos en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio ocupa 86,6 GB, por lo que se necesita espacio en disco acorde para descargar todas las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| llm-jp-4-33b-thinking-gguf | 33,2B (denso) | 65.536 | Apache 2.0 | GGUF | Enfoque japones/ingles, modo thinking, SFT+DPO |
| llm-jp-4-32b-a3b-thinking | 32,1B totales / 3,83B activos (MoE) | 65.536 | Apache 2.0 | no disponible | Misma familia; MoE con 128 expertos enrutados y 8 activados |
| llm-jp-4-8b-thinking | 8,59B (denso) | 65.536 | Apache 2.0 | no disponible | Version pequena de la misma familia, 32 capas |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada. Como alternativas fuera de la familia llm-jp no se han proporcionado datos verificables, por lo que no se incluyen comparaciones con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Idiomas limitados a ingles y japones; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Riesgo de alucinacion inherente a los LLM; no se han publicado tasas especificas de alucinacion.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada, pero el modelo se entrena con corpus web que pueden contener sesgos.
- El modo "thinking" genera cadenas de razonamiento que incrementan el consumo de tokens y la latencia; debe tenerse en cuenta en produccion.
- La plantilla de chat es compatible con OpenAI Harmony, pero el tokenizador no es compatible con la libreria `openai-harmony`; es obligatorio usar el tokenizador del modelo para un comportamiento correcto.
- Parte del corpus de pre-entrenamiento no se ha publicado por restricciones de licencia, lo que limita la reproducibilidad completa del entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero deben revisarse las licencias de los datasets de post-entrenamiento publicados.
- El repositorio GGUF no incluye los pesos en safetensors; para vLLM o TGI hay que acudir al modelo base correspondiente.
- El campo `inference: false` en la model card sugiere que la inferencia no esta habilitada en el hub de Hugging Face para este repositorio; el despliegue debe hacerse localmente.

## Enlaces

- Hugging Face: https://huggingface.co/llm-jp/llm-jp-4-33b-thinking-gguf
- Coleccion LLM-jp-4 Models: https://huggingface.co/collections/llm-jp/llm-jp-4-models
- Cookbook: https://github.com/llm-jp/llm-jp-4-cookbook
- Tokenizer: https://github.com/llm-jp/llm-jp-tokenizer
- Corpus de pre-entrenamiento: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-v4.1
- Corpus de mid-training: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-midtraining-v2
- Dataset SFT: https://huggingface.co/datasets/llm-jp/llm-jp-4-thinking-sft-data
- Dataset DPO (33B): https://huggingface.co/datasets/llm-jp/llm-jp-4-33b-thinking-dpo-data
- Dataset DPO (8B): https://huggingface.co/datasets/llm-jp/llm-jp-4-8b-thinking-dpo-data
- Dataset DPO (32B-A3B): https://huggingface.co/datasets/llm-jp/llm-jp-4-32b-a3b-thinking-dpo-data
- Benchmark AnswerCarefully: https://huggingface.co/datasets/llm-jp/AnswerCarefully
- Benchmark llm-jp-instructions: https://huggingface.co/datasets/llm-jp/llm-jp-instructions
- Framework de evaluacion llm-jp-judge: https://github.com/llm-jp/llm-jp-judge
- Centro de I+D: https://llmc.nii.ac.jp/
- National Institute of Informatics: https://www.nii.ac.jp/en/
- Formulario de uso: https://forms.gle/AvbNXTNT2ADsssHq5
