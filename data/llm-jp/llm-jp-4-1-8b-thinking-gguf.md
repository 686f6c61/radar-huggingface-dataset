# llm-jp/llm-jp-4.1-8b-thinking-gguf

## Resumen

llm-jp-4.1-8b-thinking-gguf es la version cuantizada en formato GGUF del modelo llm-jp-4.1-8b-thinking, desarrollado por el Research and Development Center for Large Language Models del National Institute of Informatics (NII) de Japon. Se trata de un modelo de lenguaje denso basado en transformer, con 8.590.200.832 parametros totales (805.306.368 de embedding y 7.784.894.464 no-embedding), 32 capas, tamano oculto de 4096 y 32 cabezas de atencion, con una ventana de contexto de 65.536 tokens.

El modelo forma parte de la serie LLM-jp-4.1, que incluye variantes densas de 8B y 33B, ademas de una variante MoE de 32B-A3B. La variante "thinking" esta orientada a tareas de razonamiento, con una plantilla de chat compatible con el formato de respuesta OpenAI Harmony. Su relevancia radica en ser una de las apuestas open source mas serias para el idioma japones, con corpus de preentrenamiento y postentrenamiento publicados, licencia Apache 2.0 y una ventana de contexto de 64K que lo situan como alternativa practica para despliegues en produccion.

Esta ficha corresponde especificamente al repositorio GGUF, pensado para su ejecucion con llama.cpp y herramientas compatibles. Cabe destacar que el uso con llama.cpp requiere actualmente un fork especifico del proyecto, ya que la version upstream de ggml-org no incluye las correcciones de tokenizer necesarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (solo decodificador) |
| Parametros totales | 8.590.200.832 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | no disponible (repositorio en formato GGUF; niveles concretos no especificados en la informacion) |
| Idiomas soportados | Ingles y japones (lenguajes de programacion: C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala, TypeScript) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

Datos adicionales de la arquitectura: 32 capas, tamano oculto 4.096, 32 cabezas de atencion, 805.306.368 parametros de embedding, 7.784.894.464 parametros no-embedding. Tamano del repositorio: 45,4 GB. Tokenizer basado en Unigram byte-fallback implementado con huggingface/tokenizers, con vocabulario derivado de llm-jp-tokenizer v4.0.

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8B parametros con atencion completa y una ventana de contexto de 65.536 tokens. Pertenece a la serie LLM-jp-4.1, que tambien incluye un denso de 33B (64 capas, oculto 5.120, 40 cabezas) y un MoE de 32B-A3B (32 capas, oculto 2.560, 40 cabezas, 128 expertos enrutados y 8 activados, 3.827.476.992 parametros activados sobre 32.139.028.992 totales). No se detalla en la informacion disponible si emplea atencion lineal, decodificacion especulativa u otras innovaciones de eficiencia.

El entrenamiento siguio un pipeline multietapa de preentrenamiento y mid-training con un total de 11,7 billones de tokens. Los corpus de preentrenamiento y mid-training estan publicados, aunque algunas porciones quedan excluidas por restricciones de licencia. El postentrenamiento se realizo con supervised fine-tuning (SFT) y alineamiento posterior mediante direct preference optimization (DPO), sin uso de reinforcement learning. Los conjuntos de datos de SFT y DPO tambien estan publicados. La plantilla de chat es compatible con el formato de respuesta OpenAI Harmony, aunque el tokenizer difiere del asumido por la libreria openai-harmony, por lo que no se admite la tokenizacion directa con dicha libreria.

## Capacidades

- Generacion de texto conversacional en ingles y japones.
- Modo de razonamiento ("thinking"), reflejado en el nombre del modelo y en una plantilla de chat compatible con OpenAI Harmony.
- Razonamiento matematico: la evaluacion del autor cubre Math 500, AIME 2024/2025/2026, MCLM Math 100 y PolyMath JA.
- Conocimiento cientifico: evaluado en GPQA Diamond y JGPQA Diamond.
- Conocimiento general y QA: evaluado en JAM-CQA, JEMHopQA, JMMLU y MMLU-ProX (JA y EN).
- Generacion de codigo en multiples lenguajes (C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala, TypeScript); evaluado en LiveCodeBench v6, JHumanEval y HumanEval.
- Soporte de tool calling: la evaluacion del autor incluye una categoria especifica de tool calling, aunque no se detallan los resultados.
- Capacidades multilingues limitadas a ingles y japones segun la model card.
- Capacidades de vision y audio: no disponibles.

## Casos de uso

- Atencion al cliente automatizada en japones e ingles: la ventana de 65.536 tokens permite gestionar conversaciones multi-turno extensas y adjuntar documentacion de contexto sin truncar el historial.
- Generacion de codigo en produccion: el soporte de multiples lenguajes de programacion y la compatibilidad con tool calling permiten integrarlo en pipelines de CI/CD para sugerencias, revisiones o generacion de parches.
- Asistentes de razonamiento paso a paso: el modo "thinking" lo hace adecuado para tareas que requieren descomposicion de problemas, como analisis de datos o resolucion de incidencias tecnicas.
- Procesamiento de documentacion larga en japones: resumen, extraccion de entidades y respuesta a preguntas sobre manuales, contratos o informes que superen los limites de contexto habituales de otros modelos.
- Investigacion academica en PLN para japones: al estar publicados los corpus de preentrenamiento, SFT y DPO, sirve como base reproducible para experimentos y ajuste fino.
- Traduccion asistida japones-ingles: util en flujos de localizacion donde se requiere coherencia de contexto a lo largo de documentos extensos.
- Sistemas de agentes con multiples pasos: el formato Harmony y el soporte de tool calling facilitan su integracion en orquestadores de agentes que encadenan llamadas a herramientas.
- Despliegue local en equipos de desarrollo: la version GGUF permite ejecucion en estaciones de trabajo con GPU de consumo o incluso CPU, sin depender de servicios en la nube.

## Benchmarks y rendimiento

La model card indica que el modelo se evaluo con la suite swallow-evaluation-instruct en seis categorias, pero no se proporcionan resultados numericos en la informacion disponible. Los benchmarks empleados son los siguientes:

| Categoria | Benchmarks |
|---|---|
| Matematicas | Math 500, AIME 2024 (pass@1, pass@32), AIME 2025 (pass@1, pass@32), AIME 2026 (pass@1, pass@32), MCLM Math 100 (pass@1, pass@4), PolyMath JA High, PolyMath JA Top |
| Ciencia | GPQA Diamond (pass@1, pass@4), JGPQA Diamond |
| Conocimiento y QA | JAM-CQA, JEMHopQA, JMMLU, MMLU-ProX JA, MMLU-ProX EN |
| Codigo | LiveCodeBench v6 (pass@1, pass@10), JHumanEval (pass@1, pass@10), HumanEval |

No se han publicado resultados numericos de benchmarks en la informacion disponible. Para cifras detalladas y analisis, el autor remite al blog tecnico de LLM-jp-4.1.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo de 8,59B parametros:
  - FP16: aproximadamente 17,2 GB de pesos.
  - Cuantizacion de 8 bits: aproximadamente 8,6 GB.
  - Cuantizacion de 4 bits: aproximadamente 4,9 GB (estimaciones basadas en el numero de parametros; los niveles exactos del repositorio no se detallan).
- La cache KV debe sumarse a lo anterior: con 65.536 tokens de contexto, el consumo adicional puede ser muy elevado segun el nivel de cuantizacion de la cache y el numero de secuencias concurrentes.
- GPU recomendadas: A100 (40/80 GB) o H100 para FP16 con contexto completo; RTX 4090 o RTX 3090 (24 GB) para FP16 o 8 bits con contexto reducido; GPU de 8-12 GB para cuantizaciones de 4 bits con contexto limitado.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando cuantizacion de 4 bits, y en 24 GB sin cuantizar.
- Opciones de despliegue: llama.cpp (requiere el fork llm-jp/llama.cpp, rama llmjp-harmony-handler), y transformadores compatibles con el formato original para la variante no GGUF. Ollama, vLLM y TGI no se mencionan explicitamente en la informacion; su compatibilidad no esta confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa con las otras variantes de la misma familia LLM-jp-4.1, cuyos datos de arquitectura si estan publicados en la model card:

| Modelo | Parametros totales | Parametros activados | Capas | Oculto | Cabezas | Contexto |
|---|---|---|---|---|---|---|
| llm-jp-4.1-8b-thinking | 8.590.200.832 | no aplica (denso) | 32 | 4.096 | 32 | 65.536 |
| llm-jp-4.1-33b-thinking | 33.219.548.160 | no aplica (denso) | 64 | 5.120 | 40 | 65.536 |
| llm-jp-4.1-32b-a3b-thinking | 32.139.028.992 | 3.827.476.992 | 32 | 2.560 | 40 | 65.536 |

Las tres variantes comparten licencia Apache 2.0 y ventana de contexto de 65.536 tokens. No se dispone de resultados de benchmarks comparativos publicados en la informacion proporcionada, ni de datos de arquitectura de modelos de otras familias, por lo que no es posible establecer una comparativa de rendimiento con alternativas externas.

## Limitaciones y advertencias

- Idiomas: la model card declara soporte unicamente para ingles y japones; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Riesgo de alucinacion: no se documenta de forma especifica; como en cualquier LLM, existe riesgo de generar contenido incorrecto, especialmente en tareas de conocimiento factual.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Compatibilidad con llama.cpp: la version upstream de ggml-org/llama.cpp no incluye las correcciones de tokenizer necesarias y el parseo del chat fallara; es obligatorio usar el fork llm-jp/llama.cpp (rama llmjp-harmony-handler) o seguir la guia del cookbook oficial.
- Tokenizer: no es compatible con la tokenizacion directa mediante la libreria openai-harmony, pese a que la plantilla de chat sigue el formato Harmony.
- Licencia: Apache 2.0, que permite uso comercial, pero el autor advierte que parte de los corpus de preentrenamiento no se han publicado por restricciones de licencia, lo que conviene verificar segun el caso de uso.
- Cuantizacion: el repositorio GGUF no especifica en la informacion disponible los niveles de cuantizacion incluidos ni su impacto en la calidad; los pesos cuantizados pueden degradar el rendimiento en tareas de razonamiento.
- Contexto: aunque la ventana es de 65.536 tokens, no se documenta el rendimiento efectivo en contextos muy largos ni posibles efectos de degradacion.
- Fecha de publicacion del repositorio: creado el 24 de septiembre de 2026 y actualizado el 30 de septiembre de 2026.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/llm-jp/llm-jp-4.1-8b-thinking-gguf
- Coleccion de modelos LLM-jp-4.1: https://huggingface.co/collections/llm-jp/llm-jp-41-models
- Blog tecnico de LLM-jp-4.1 (en japones): https://llm-jp.nii.ac.jp/blog/llm-jp-4-1/
- Cookbook de LLM-jp-4: https://github.com/llm-jp/llm-jp-4-cookbook
- Guia de llama.cpp para LLM-jp-4: https://github.com/llm-jp/llm-jp-4-cookbook/tree/main/llmjp4_llama-cpp
- Fork de llama.cpp requerido: https://github.com/llm-jp/llama.cpp/tree/llmjp-harmony-handler
- Tokenizer LLM-jp: https://github.com/llm-jp/llm-jp-tokenizer
- Corpus de preentrenamiento: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-v4.1
- Corpus de mid-training: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-midtraining-v2
- Datos de SFT: https://huggingface.co/datasets/llm-jp/llm-jp-4.1-thinking-sft-data
- Datos de DPO (8B): https://huggingface.co/datasets/llm-jp/llm-jp-4.1-8b-thinking-dpo-data
- Datos de DPO (32B-A3B): https://huggingface.co/datasets/llm-jp/llm-jp-4.1-32b-a3b-thinking-dpo-data
- Datos de DPO (33B): https://huggingface.co/datasets/llm-jp/llm-jp-4.1-33b-thinking-dpo-data
- Suite de evaluacion swallow-evaluation-instruct: https://github.com/swallow-llm/swallow-evaluation-instruct
- Centro de I+D de LLM del NII: https://llmc.nii.ac.jp/
- National Institute of Informatics: https://www.nii.ac.jp/en/
- Formulario de encuesta de uso de LLM-jp: https://forms.gle/AvbNXTNT2ADsssHq5
