# llm-jp/llm-jp-4-32b-a3b-thinking-gguf

## Resumen
llm-jp-4-32b-a3b-thinking-gguf es la version cuantizada en formato GGUF del modelo llm-jp-4-32b-a3b-thinking, un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por el Centro de Investigacion y Desarrollo de Grandes Modelos de Lenguaje del Instituto Nacional de Informatica de Japon (NII). El modelo forma parte de la familia LLM-jp-4, que incluye variantes densas y MoE con distintos tamanos, y esta orientado especificamente a tareas de razonamiento con modo de pensamiento (thinking).

La version thinking se ha alineado mediante supervised fine-tuning (SFT) y direct preference optimization (DPO), sin uso de reinforcement learning. El modelo activa 3.827.476.992 de sus 32.139.028.992 parametros totales por token, lo que permite un coste computacional de inferencia notablemente inferior al de un modelo denso del mismo tamano. Soporta una longitud de contexto de 65.536 tokens y esta entrenado sobre 11,7 billones de tokens.

La relevancia de esta ficha radica en que el repositorio GGUF facilita el despliegue en infraestructura de inferencia local y en entornos con GPU de gama consumer, manteniendo las capacidades de razonamiento del modelo original. Esta publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer-based Mixture of Experts (MoE) |
| Parametros totales | 32.139.028.992 |
| Parametros activos | 3.827.476.992 |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | GGUF (cuantizaciones multiples; el repositorio ocupa 171,5 GB en total) |
| Idiomas soportados | Ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); safetensors disponible en el modelo base |
| Capas | 32 |
| Hidden size | 2.560 |
| Cabezas de atencion | 40 |
| Expertos enrutados | 128 |
| Expertos activados | 8 |
| Parametros de embedding | 503.316.480 |
| Parametros no-embedding | 31.635.712.512 |
| Tokenizer | Unigram byte-fallback basado en llm-jp-tokenizer v4.0 |
| Tokens de entrenamiento | 11,7 T |
| Lenguajes de programacion | C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala, TypeScript |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura Transformer con capas de Mixture of Experts: 32 capas, 128 expertos enrutados por capa y 8 expertos activados por token. Con un hidden size de 2.560 y 40 cabezas de atencion, el modelo mantiene un coste de activacion de aproximadamente 3,83 mil millones de parametros por token, lo que lo situa en la categoria de modelos MoE de gran capacidad pero bajo coste de inferencia.

El entrenamiento sigue un pipeline multietapa de pre-training y mid-training con un total de 11,7 billones de tokens. Los corpus utilizados estan publicados en los repositorios GitLab del proyecto (llm-jp-corpus-v4.1 y llm-jp-corpus-midtraining-v2), aunque algunas porciones se han excluido por restricciones de licencia. La fase de post-training combina SFT sobre el dataset llm-jp-4-thinking-sft-data y DPO sobre llm-jp-4-32b-a3b-thinking-dpo-data. El tokenizer es un modelo Unigram byte-fallback derivado de llm-jp-tokenizer v4.0, y la plantilla de chat esta disenada para ser compatible con el formato OpenAI Harmony, si bien la tokenizacion directa con la libreria openai-harmony no esta soportada.

## Capacidades
- Generacion de texto conversacional en ingles y japones, con soporte de conversaciones multi-turno.
- Razonamiento explicito mediante modo thinking, entrenado con SFT y DPO.
- Generacion y comprension de codigo en 13 lenguajes de programacion (C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala, TypeScript).
- Capacidades multilingues limitadas a ingles y japones.
- Soporte de formato de respuesta compatible con OpenAI Harmony (con tokenizer propio).
- Capacidad de instrucciones de un solo turno y multi-turno evaluada mediante llm-jp-instructions y MT-Bench.
- No se dispone de informacion sobre soporte explicito de tool calling, function calling o agentes multi-paso en la informacion proporcionada.

## Casos de uso
- Razonamiento asistido en japones: el modelo puede abordar tareas de razonamiento complejo en japones gracias a su modo thinking y a un entrenamiento especifico en corpus japoneses, adecuado para asistencia tecnica y educativa en ese idioma.
- Generacion de codigo en produccion: al cubrir 13 lenguajes de programacion, puede integrarse en pipelines de generacion de codigo, revision automatizada y documentacion tecnica, con cuantizacion GGUF para despliegue en servidores con GPU limitada.
- Atencion al cliente en japones e ingles: la ventana de 65.536 tokens permite gestionar conversaciones multi-turno con historial extenso y contexto documental adjunto.
- Traduccion y adaptacion de contenido entre ingles y japones: el modelo puede emplearse para localizacion de documentacion tecnica y contenido editorial en ambos idiomas.
- Analisis de documentacion larga: con 65.536 tokens de contexto, es adecuado para resumir, extraer y responder preguntas sobre manuales, contratos o informes extensos.
- Despliegue en entornos con recursos limitados: la variante GGUF y la activacion de solo 3,83 mil millones de parametros por token permiten ejecutar el modelo en estaciones de trabajo con GPU consumer, reduciendo el coste frente a modelos densos de 32B.
- Evaluacion y generacion de respuestas seguras en japones: el modelo ha sido evaluado con el benchmark AnswerCarefully, orientado a seguridad en japones, lo que lo hace util para sistemas que requieren filtrado y moderacion de contenido.

## Benchmarks y rendimiento
La model card reporta evaluaciones mediante el framework LLM-as-a-Judge de llm-jp-judge, usando gpt-5.4-2026-03-05 como evaluador. Los resultados disponibles en la informacion proporcionada son parciales:

| Modelo | MT-Bench (JA) | MT-Bench (EN) | AnswerCarefully | llm-jp-instructions |
|---|---|---|---|---|
| gpt-4o-2024-08-06 | 7,29 | 7,69 | 4,00 | no disponible |
| llm-jp-4-32b-a3b-thinking | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible los resultados numericos del modelo llm-jp-4-32b-a3b-thinking en MT-Bench (JA/EN), AnswerCarefully ni llm-jp-instructions. La model card indica que el evaluador gpt-5.4-2026-03-05 es mas estricto que el usado en la serie llm-jp-3, lo que produce puntuaciones mas bajas en benchmarks como MT-Bench.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio GGUF ocupa 171,5 GB, lo que sugiere que las cuantizaciones de mayor precision requieren varias GPU o un servidor con memoria unificada amplia.
- Con cuantizaciones de 4 bits, el modelo de 32B requiere aproximadamente 16-20 GB de VRAM, aunque este dato no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria esperar A100, H100 o RTX 4090 para cuantizaciones bajas, pero no se confirma.
- Despliegue: el formato GGUF permite su uso con llama.cpp y Ollama; la libreria declarada es transformers. No se confirma soporte de vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| llm-jp-4-32b-a3b-thinking | 32,1B | 3,83B | 65.536 | Apache 2.0 | GGUF, safetensors |
| llm-jp-4-8b (denso) | 8,59B | 8,59B | 65.536 | Apache 2.0 | no disponible |
| gpt-4o-2024-08-06 (referencia) | no disponible | no disponible | no disponible | propietaria | API |

La familia LLM-jp-4 incluye tambien un modelo denso de 8B con 65.536 tokens de contexto. No se dispone en la informacion proporcionada de datos de rendimiento comparativos entre ambas variantes ni con modelos de otros proveedores.

## Limitaciones y advertencias
- Idiomas limitados a ingles y japones; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado datos especificos de mitigacion.
- La version thinking se ha alineado con SFT y DPO, pero sin reinforcement learning, lo que puede limitar la robustez en tareas de razonamiento muy complejas.
- La tokenizacion con la libreria openai-harmony no esta soportada directamente; es necesario usar el tokenizer incluido en el repositorio.
- Parte de los corpus de entrenamiento no se ha publicado por restricciones de licencia, lo que limita la trazabilidad completa de los datos.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datasets de post-training y de los corpus no publicados.
- No se dispone de informacion sobre sesgos conocidos, limites de contexto en produccion ni latencia real.
- El tamano del repositorio (171,5 GB) implica requisitos de almacenamiento considerables para su descarga y despliegue.

## Enlaces
- Hugging Face: https://huggingface.co/llm-jp/llm-jp-4-32b-a3b-thinking-gguf
- Coleccion LLM-jp-4 Models: https://huggingface.co/collections/llm-jp/llm-jp-4-models
- Cookbook: https://github.com/llm-jp/llm-jp-4-cookbook
- Corpus de pre-training: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-v4.1
- Corpus de mid-training: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-midtraining-v2
- Dataset SFT: https://huggingface.co/datasets/llm-jp/llm-jp-4-thinking-sft-data
- Dataset DPO (32b-a3b-thinking): https://huggingface.co/datasets/llm-jp/llm-jp-4-32b-a3b-thinking-dpo-data
- Dataset DPO (8b-thinking): https://huggingface.co/datasets/llm-jp/llm-jp-4-8b-thinking-dpo-data
- llm-jp-judge: https://github.com/llm-jp/llm-jp-judge
- AnswerCarefully: https://huggingface.co/datasets/llm-jp/AnswerCarefully
- llm-jp-instructions: https://huggingface.co/datasets/llm-jp/llm-jp-instructions
- llm-jp-tokenizer: https://github.com/llm-jp/llm-jp-tokenizer
- Centro de Investigacion y Desarrollo de LLM (LLMC): https://llmc.nii.ac.jp/
- Instituto Nacional de Informatica (NII): https://www.nii.ac.jp/en/
- Formulario de encuesta de uso: https://forms.gle/AvbNXTNT2ADsssHq5
