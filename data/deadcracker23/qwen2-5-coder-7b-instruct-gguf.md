# Deadcracker23/Qwen2.5-Coder-7B-Instruct-GGUF

## Resumen

Qwen2.5-Coder-7B-Instruct-GGUF es la version cuantizada en formato GGUF del modelo Qwen2.5-Coder-7B-Instruct, desarrollado por el equipo Qwen de Alibaba Cloud. Se trata de un modelo de lenguaje causal especializado en codigo, afinado por instrucciones, que forma parte de la familia Qwen2.5-Coder (antes conocida como CodeQwen), disponible en seis tamanos: 0.5B, 1.5B, 3B, 7B, 14B y 32B parametros. Esta publicacion concreta, alojada por el usuario Deadcracker23, redistribuye los pesos en formato GGUF para su uso con llama.cpp y otros runners compatibles.

El modelo resuelve tareas de generacion, razonamiento y correccion de codigo, ademas de mantener competencias generales en matematicas y lenguaje. Segun la model card, se entreno sobre 5,5 billones de tokens que incluyen codigo fuente, datos de grounding texto-codigo y datos sinteticos, lo que supone una mejora sustancial frente a CodeQwen1.5. La variante de 32B se presenta como el estado del arte open source en modelos de codigo, con capacidades de programacion comparables a GPT-4o; esta version de 7B hereda la misma receta de entrenamiento a menor escala.

Arquitectonicamente es un transformer causal con RoPE, SwiGLU, RMSNorm y bias en las proyecciones QKV, con 7,61 mil millones de parametros totales (6,53B sin contar embeddings), 28 capas y atencion con GQA (28 cabezas para Q, 4 para KV). La longitud de contexto completa es de 32.768 tokens en formato GGUF, aunque el modelo base soporta hasta 128K mediante extrapolacion YARN, funcion que en GGUF solo esta disponible a traves de vLLM. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y bias en QKV |
| Parametros totales | 7.615.616.512 (7,61B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en GGUF; hasta 131.072 con YARN (solo via vLLM en el modelo no-GGUF) |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | Ingles (segun model card y tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 100,4 GB con todas las cuantizaciones) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con 28 capas, 7,61B parametros totales (6,53B no-embedding), atencion con Grouped Query Attention (28 cabezas de query y 4 de key/value), normalizacion RMSNorm, activacion SwiGLU y bias en las proyecciones QKV. Incorpora RoPE para el modelado posicional. La model card indica que el entrenamiento consta de dos fases: preentrenamiento y postentrenamiento (instrucciones), sobre un corpus de 5,5 billones de tokens que combina codigo fuente, datos de grounding texto-codigo y datos sinteticos. No se detalla en la informacion disponible la composicion exacta del dataset ni si se emplearon tecnicas concretas de RLHF o DPO; la model card solo menciona "post-training" de forma generica.

La innovacion principal de la familia es el escalado del entrenamiento a 5,5T tokens con enfasis en codigo y grounding texto-codigo, lo que mejora generacion, razonamiento y reparacion de codigo respecto a CodeQwen1.5. El modelo mantiene competencias generales en matematicas y lenguaje gracias a su base Qwen2.5. En el formato GGUF, la model card advierte que la extrapolacion de longitud mediante YARN solo esta soportada actualmente por vLLM, por lo que en llama.cpp el contexto practico queda limitado a 32.768 tokens. Los ficheros GGUF de gran tamano se distribuyen partidos en segmentos que deben fusionarse con `llama-gguf-split`.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion.
- Razonamiento sobre codigo: explicacion, analisis y depuracion de fragmentos.
- Reparacion de codigo (code fixing) y refactorizacion.
- Razonamiento matematico y competencias generales de lenguaje heredadas de Qwen2.5.
- Modo conversacional (chat) con plantilla de instrucciones; la model card recomienda el modo `-cnv` de llama.cpp con el system prompt "You are Qwen, created by Alibaba Cloud. You are a helpful assistant."
- Base para agentes de codigo (Code Agents), segun la model card.
- Soporte de contexto largo de hasta 32.768 tokens en GGUF (131.072 con YARN solo en el modelo no-GGUF via vLLM).
- Capacidades multilingues: la model card y los tags declaran unicamente ingles.
- No se documenta en la informacion disponible soporte explicito de tool calling, vision ni audio para este modelo.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede autocompletar, explicar y corregir codigo en un flujo conversacional, aprovechando sus 32.768 tokens de contexto para incluir varios ficheros o un historial largo de la sesion.
- Reparacion automatizada de codigo en CI/CD: dado un fallo de compilacion o un test roto, el modelo puede generar un parche candidato; su entrenamiento especifico en code fixing lo hace adecuado para pipelines de integracion continua con revision humana posterior.
- Generacion de tests unitarios: a partir de una funcion o modulo, el modelo puede producir casos de prueba en distintos frameworks; la ventana de 32K permite pasar el fichero completo como contexto.
- Documentacion tecnica automatica: generar docstrings, comentarios y documentacion de API a partir del codigo fuente, tarea para la que el grounding texto-codigo del entrenamiento resulta relevante.
- Migracion y traduccion entre lenguajes: reescribir fragmentos de un lenguaje a otro (por ejemplo, Python a TypeScript) manteniendo la semantica, con el codigo original como contexto.
- Despliegue local en estaciones de trabajo: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU dedicada o con GPU de consumo, lo que permite usarlo en entornos con requisitos de privacidad del codigo.
- Educacion y tutoria de programacion: explicar errores, proponer alternativas y razonar paso a paso sobre algoritmos, aprovechando sus competencias en matematicas y lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de la familia Qwen2.5-Coder y a la documentacion de Qwen para los resultados detallados y las cifras de throughput y memoria GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Con q4_K_M, un modelo de 7,6B ocupa aproximadamente 4,5-5 GB de pesos; con q8_0, alrededor de 8 GB; con q2_K, en torno a 3 GB. Estas cifras son estimaciones por tamano de pesos y no aparecen explicitadas en la informacion proporcionada.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, el modelo es apto para GPU de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090, y para GPU de datacenter como A100 o H100 si se busca mayor throughput.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones (q4_K_M y superiores caben en GPUs con 8-12 GB de VRAM).
- Opciones de despliegue: llama.cpp (documentado en la model card), Ollama, y cualquier runner compatible con GGUF. Para contexto extendido con YARN, vLLM sobre el modelo no-GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a la pagina de speed benchmark de Qwen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (este, GGUF) | 7,61B | 32.768 (GGUF) / 131.072 con YARN (no-GGUF, vLLM) | Apache 2.0 | GGUF | Especializado en codigo, entrenado con 5,5T tokens |
| Qwen2.5-Coder-7B-Instruct (original) | 7,61B | 131.072 con YARN | Apache 2.0 | safetensors | Version de referencia sin cuantizar |
| Qwen2.5-Coder-14B-Instruct | 14B (no confirmado en la informacion) | no disponible | Apache 2.0 | safetensors / GGUF | Misma familia, mayor capacidad; datos no detallados en la informacion |
| Qwen2.5-Coder-32B-Instruct | 32B (no confirmado en la informacion) | no disponible | Apache 2.0 | safetensors / GGUF | La model card lo describe como estado del arte open source en codigo, comparable a GPT-4o |

No se dispone en la informacion proporcionada de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de otros fabricantes (por ejemplo, CodeLlama o DeepSeek-Coder). La comparativa se limita, por tanto, a la propia familia Qwen2.5-Coder.

## Limitaciones y advertencias

- Idiomas: la model card y los tags declaran unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto en GGUF: limitado a 32.768 tokens; la extrapolacion a 131.072 con YARN solo funciona en vLLM con el modelo no-GGUF, no en llama.cpp.
- Alucinacion: como todo modelo de lenguaje, puede generar APIs, funciones o imports inexistentes; el codigo generado debe validarse y ejecutarse antes de usarse en produccion.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al entrenarse mayoritariamente con codigo y texto en ingles, puede reflejar sesgos presentes en esos corpus.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE enlazado en el repo original de Qwen.
- Redistribucion: este repositorio es una publicacion de terceros (Deadcracker23) que cuantiza el modelo original; para produccion se recomienda verificar la integridad de los ficheros GGUF y, en su caso, usar los pesos oficiales de Qwen.
- Ficheros partidos: las cuantizaciones grandes se distribuyen en multiples segmentos que deben descargarse completos y fusionarse con `llama-gguf-split` antes de su uso.
- Sin datos de benchmarks ni de rendimiento publicados en la informacion disponible para esta variante concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Deadcracker23/Qwen2.5-Coder-7B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repo GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF
- Blog de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- GitHub: https://github.com/QwenLM/Qwen2.5-Coder
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Guia de llama.cpp: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Paper Qwen2: https://arxiv.org/abs/2407.10671
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Licencia: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF/blob/main/LICENSE
