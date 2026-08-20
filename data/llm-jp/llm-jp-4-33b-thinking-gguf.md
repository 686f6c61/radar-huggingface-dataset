# llm-jp/llm-jp-4-33b-thinking-gguf

## Resumen

LLM-jp-4-33b-thinking es un modelo de lenguaje denso de 33 000 millones de parametros desarrollado por el Centro de Investigacion y Desarrollo para Modelos de Lenguaje a Gran Escala del Instituto Nacional de Informatica (NII) de Japon. Forma parte de la serie LLM-jp-4, una familia de modelos bilingues japones-ingles entrenados con un pipeline de pre-entrenamiento y mid-training sobre 11,7 billones de tokens, seguido de un post-entrenamiento con SFT y DPO. La variante "thinking" esta especificamente alineada para razonamiento deliberado y respuestas estructuradas.

El modelo destaca por su ventana de contexto de 65 536 tokens, una de las mas amplias en su categoria, y por estar disponible en formato GGUF, lo que facilita su despliegue en entornos de inferencia local con llama.cpp. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas. Segun los resultados publicados por el equipo desarrollador, supera a todos los modelos LLM-jp-4 Thinking anteriores en los cuatro benchmarks evaluados: MT-Bench japones e ingles, AnswerCarefully y llm-jp-instructions.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (causal LM) |
| Parametros totales | 33 219 548 160 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 65 536 tokens |
| Tipos de cuantizacion | GGUF (multiples cuantizaciones disponibles en el repositorio) |
| Idiomas soportados | japones, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

Detalles de arquitectura adicionales: 64 capas, hidden size de 5120, 40 cabezas de atencion, 1 006 632 960 parametros de embedding y 32 212 915 200 parametros no-embedding.

## Arquitectura y entrenamiento

El modelo es un transformer denso de 64 capas con hidden size de 5120 y 40 cabezas de atencion. El tokenizador se basa en Unigram con byte-fallback, derivado de llm-jp-tokenizer v4.0, y no es compatible directamente con la libreria openai-harmony a pesar de que la plantilla de chat sigue el formato de respuesta OpenAI Harmony.

El entrenamiento sigue un pipeline en tres fases: pre-entrenamiento y mid-training sobre un corpus de 11,7 billones de tokens (disponible publicamente en llm-jp-corpus-v4.1 y llm-jp-corpus-midtraining-v2, aunque algunas porciones estan excluidas por restricciones de licencia), seguido de post-entrenamiento con SFT y DPO. Los datasets de post-entrenamiento estan publicados en HuggingFace. A diferencia de otros enfoques, no se utilizo reinforcement learning en ninguna fase.

## Capacidades

- Generacion de texto bilingue en japones e ingles con calidad nativa en ambos idiomas.
- Razonamiento deliberado multi-paso gracias al entrenamiento especifico de la variante thinking con SFT y DPO.
- Conversacion multi-turno con contexto largo de hasta 65 536 tokens, adecuada para dialogos extensos y analisis de documentos largos.
- Soporte de tool calling y function calling mediante el formato de respuesta OpenAI Harmony.
- Generacion de codigo en 13 lenguajes de programacion: C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala y TypeScript.
- Plantilla de chat compatible con el formato OpenAI Harmony, aunque requiere el tokenizador propio del modelo.

## Casos de uso

- Atencion al cliente bilingue: el modelo puede gestionar conversaciones multi-turno en japones e ingles con ventana de 65 536 tokens, permitiendo mantener el historial completo de interacciones largas sin truncamiento.
- Analisis y resumen de documentos legales o tecnicos extensos: la ventana de contexto amplia permite procesar documentos de mas de 40 000 tokens de una sola pasada, algo poco comun en modelos de 33B.
- Generacion de codigo en entornos de desarrollo: con soporte para 13 lenguajes y tool calling, puede integrarse en pipelines de CI/CD para revision de codigo automatizada o generacion de tests.
- Asistente de investigacion academica: su capacidad de razonamiento thinking y su entrenamiento en corpus cientificos lo hacen adecuado para sintesis de literatura y apoyo a la redaccion de articulos en ingles o japones.
- Traduccion y localizacion de contenido: al ser bilingue japones-ingles con calidad nativa, puede utilizarse para traduccion de documentacion tecnica, manuales y contenido web.
- Agentes autonomos con razonamiento multi-paso: la combinacion de tool calling, contexto largo y alineacion thinking permite construir agentes que planifican, ejecutan herramientas y razonan sobre los resultados en tareas complejas.
- Despliegue en produccion con requisitos de privacidad: al ser un modelo open source con licencia Apache 2.0, puede desplegarse en infraestructura propia sin enviar datos a APIs externas.

## Benchmarks y rendimiento

El equipo de LLM-jp evaluo el modelo con el framework llm-jp-judge, utilizando gpt-5.4-2026-03-05 como evaluador. Los resultados publicados indican que el modelo supera a todos los modelos LLM-jp-4 Thinking anteriores en los cuatro benchmarks:

| Benchmark | Resultado |
|---|---|
| MT-Bench (JA) | superior a todos los LLM-jp-4 Thinking previos |
| MT-Bench (EN) | superior a todos los LLM-jp-4 Thinking previos |
| AnswerCarefully (seguridad en japones, 336 preguntas) | superior a todos los LLM-jp-4 Thinking previos |
| llm-jp-instructions (400 preguntas) | superior a todos los LLM-jp-4 Thinking previos |

No se han publicado cifras numericas concretas en la informacion disponible. El equipo advierte que el evaluador gpt-5.4-2026-03-05 es mas estricto que el gpt-4o-2024-08-06 usado en la serie llm-jp-3, por lo que las puntuaciones no son directamente comparables con las de generaciones anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 66 GB en FP16, 33 GB en INT8 y 17-20 GB en cuantizacion INT4 (estimacion estandar para 33B parametros).
- GPU recomendadas: A100 80GB o H100 para FP16; RTX 4090 24GB o A6000 48GB para cuantizaciones INT4/INT8.
- En consumer GPU: cabe en RTX 4090 (24 GB) con cuantizacion Q4_K_M o similar, y en RTX 3090 (24 GB) con cuantizaciones mas agresivas.
- Opciones de despliegue: llama.cpp (requiere el fork de LLM-jp, no el upstream), vLLM, TGI y transformers.
- Importante: el upstream de llama.cpp no incluye las correcciones de tokenizador necesarias; es obligatorio usar el fork de LLM-jp disponible en github.com/llm-jp/llama.cpp.
- El tamano del repositorio es de 86,6 GB, lo que sugiere que incluye multiples archivos de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Alineacion |
|---|---|---|---|---|---|
| llm-jp-4-33b-thinking | 33B denso | 65 536 | Apache 2.0 | GGUF | SFT + DPO |
| llm-jp-4-8b-thinking | 8B denso | 65 536 | Apache 2.0 | no disponible | SFT + DPO |
| llm-jp-4-32b-a3b-thinking | 32B total, 3,8B activos (MoE) | 65 536 | Apache 2.0 | no disponible | SFT + DPO |

El modelo 33B denso ofrece mayor capacidad de razonamiento que el 8B, pero requiere aproximadamente el doble de VRAM que el 32B-A3B MoE (que activa solo 3,8B parametros por token). La variante MoE es mas eficiente en inferencia, mientras que la densa 33B suele ofrecer mejor rendimiento en tareas de razonamiento complejo. No se dispone de comparativas publicadas con modelos externos a la familia LLM-jp-4 en la informacion disponible.

## Limitaciones y advertencias

- El upstream de llama.cpp no funciona con este modelo: es obligatorio compilar el fork de LLM-jp de llama.cpp, lo que anade complejidad al despliegue.
- El tokenizador no es compatible con la libreria openai-harmony a pesar de usar su formato de chat; debe usarse el tokenizador propio del modelo.
- Algunas porciones del corpus de entrenamiento no se han publicado por restricciones de licencia, lo que limita la reproducibilidad completa del entrenamiento.
- El modelo esta optimizado principalmente para japones e ingles; su rendimiento en otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; se recomienda validacion humana en aplicaciones de alto riesgo.
- La evaluacion se realizo con un unico evaluador LLM (gpt-5.4-2026-03-05); los resultados pueden no ser totalmente representativos del rendimiento en tareas del mundo real.
- No se han publicado datos de latencia ni throughput en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/llm-jp/llm-jp-4-33b-thinking-gguf
- Coleccion de modelos LLM-jp-4: https://huggingface.co/collections/llm-jp/llm-jp-4-models
- Cookbook de uso: https://github.com/llm-jp/llm-jp-4-cookbook
- Fork de llama.cpp de LLM-jp: https://github.com/llm-jp/llama.cpp
- Anuncio de lanzamiento (japones): https://llm-jp.nii.ac.jp/news/20260818/
- Pagina de releases de LLM-jp: https://llm-jp.nii.ac.jp/en/release-en/
- Dataset SFT: https://huggingface.co/datasets/llm-jp/llm-jp-4-thinking-sft-data
- Dataset DPO (33B): https://huggingface.co/datasets/llm-jp/llm-jp-4-33b-thinking-dpo-data
- Corpus de pre-entrenamiento: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-v4.1
- Corpus de mid-training: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-midtraining-v2
- Framework de evaluacion llm-jp-judge: https://github.com/llm-jp/llm-jp-judge
