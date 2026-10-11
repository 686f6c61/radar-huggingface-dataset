# ikun-114514/Qwen2.5-1.5B-Instruct-GGUF

## Resumen

Este repositorio contiene una version cuantizada en formato GGUF del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario ikun-114514. El modelo original Qwen2.5 fue desarrollado por el equipo Qwen de Alibaba Cloud, y esta variante se limita a convertir los pesos originales a las cuantizaciones tipicas de llama.cpp para facilitar su ejecucion en hardware modesto. Se trata de un modelo de lenguaje causal de tipo instruccion, disenado para tareas conversacionales y de generacion de texto.

Con aproximadamente 1.540 millones de parametros segun la model card (y 1.777.088.000 parametros contados en los tensores originales), este modelo se situa en la gama de entrada, lo que permite desplegarlo en equipos de consumo sin GPU dedicada de gama alta. Su arquitectura es un transformer con RoPE, SwiGLU, RMSNorm, sesgo en las proyecciones QKV y embeddings atados. Soporta una longitud de contexto completa de 32.768 tokens, con capacidad de generar hasta 8.192 tokens de salida.

Es relevante ahora como una opcion ligera y de licencia Apache 2.0 para prototipado rapido, asistentes locales y despliegues en el borde, donde el coste de inferencia y el espacio en disco son factores determinantes. El repositorio ocupa 13,3 GB porque incluye multiples niveles de cuantizacion. No se han publicado datos de rendimiento especificos de esta conversion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, sesgo QKV y embeddings atados |
| Parametros totales | 1.777.088.000 (safetensors); la model card indica 1.540 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens; generacion de 8.192 tokens |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | Ingles (tag del repo); la model card original declara mas de 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B-Instruct es un transformer causal de 28 capas con atencion de consultas agrupadas (GQA): 12 cabezas para las consultas y 2 para claves y valores. Incorpora codificacion posicional rotatoria (RoPE), activacion SwiGLU, normalizacion RMSNorm y sesgo en las proyecciones QKV, ademas de embeddings de palabra atados. La model card indica 1.540 millones de parametros totales, de los cuales 1.310 millones corresponden a parametros no de embedding.

El entrenamiento consta de una fase de preentrenamiento y una fase de postentrenamiento con ajuste por instrucciones. La serie Qwen2.5, sobre la que se basa, introdujo mejoras en conocimiento, codigo, matematicas, seguimiento de instrucciones, generacion de textos largos (mas de 8.000 tokens), comprension de datos estructurados y generacion de salidas JSON, asi como una mayor robustez frente a la diversidad de prompts de sistema. No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO especificas para el modelo de 1,5B. Esta publicacion no aporta innovaciones propias: es una conversion a GGUF del modelo original.

## Capacidades

- Generacion de texto conversacional en formato chat.
- Razonamiento basico y respuesta a instrucciones.
- Generacion de codigo y resolucion de problemas matematicos, con mejora respecto a la serie anterior segun la model card.
- Comprension y generacion de datos estructurados, incluida salida en formato JSON.
- Generacion de textos largos, de hasta 8.192 tokens de salida.
- Soporte de contexto largo de hasta 32.768 tokens.
- Capacidades multilingues declaradas en el modelo original (mas de 29 idiomas), aunque el tag de idioma de este repositorio solo declara ingles.
- Soporte de modo conversacional y plantillas de chat con prompts de sistema.

## Casos de uso

- Asistentes conversacionales locales: por su tamano reducido y su formato GGUF, puede ejecutarse en un portatil sin GPU dedicada, gestionando dialogos multi-turno con la plantilla de chat de Qwen.
- Prototipado rapido de aplicaciones: permite validar prompts, flujos de conversacion y agentes sencillos antes de migrar a modelos mayores, con coste de inferencia minimo.
- Extraccion y transformacion de datos: su soporte declarado para JSON y datos estructurados lo hace util para tareas de parseo de texto a esquemas definidos.
- Generacion de codigo asistida en entornos locales: apropiado para autocompletado o sugerencias en editores, integrado mediante llama.cpp u Ollama, sin enviar codigo a servicios externos.
- Despliegue en el borde (edge): al ser cuantizable en q4_K_M o q5_K_M, puede ejecutarse en dispositivos con recursos limitados para clasificacion de texto, resumen o respuesta a preguntas simples.
- Educacion y experimentacion: sirve como banco de pruebas para estudiar cuantizacion, latencia y calidad de salida en un modelo pequeno de licencia permisiva.
- Chatbots de bajo trafico: para servicios internos o demos donde el volumen de peticiones no justifica un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card remite a los resultados de evaluacion de la serie Qwen2.5 en el blog oficial y a la pagina de benchmarks de cuantizacion de la documentacion de Qwen, pero no incluye cifras concretas para esta conversion a GGUF.

## Requisitos de hardware

- El modelo completa en VRAM depende de la cuantizacion elegida; a modo orientativo, un modelo de 1,5B en q4_K_M ocupa aproximadamente 1 GB de pesos, en q5_K_M en torno a 1,1 GB y en q8_0 cerca de 1,7 GB (estimaciones basadas en el tamano del modelo; no facilitadas en la informacion disponible).
- Cabe holgadamente en GPU de consumo, incluidas RTX 3060, RTX 4060 y superiores, e incluso puede ejecutarse en CPU con llama.cpp.
- GPU recomendadas para mayor throughput: no disponibles en la informacion proporcionada; para este tamano no son necesarias soluciones de datacenter como A100 o H100.
- Opciones de despliegue: llama.cpp (recomendado por el autor, con el binario `llama-cli` y las banderas `-co -cnv`, `-fa`, `-ngl`), y por compatibilidad de formato, otros runners que consuman GGUF como Ollama, LM Studio o servidores basados en llama.cpp. La model card usa la etiqueta `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ikun-114514/Qwen2.5-1.5B-Instruct-GGUF | 1,54B (model card) | 32.768 tokens | Apache 2.0 | GGUF | HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct (original) | 1,54B | 32.768 tokens | Apache 2.0 | safetensors | HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct-GGUF (oficial) | 1,54B | 32.768 tokens | Apache 2.0 | GGUF | HuggingFace |

Alternativas de otros fabricantes de la misma gama (1B-2B) como Llama 3.2 1B o Gemma 2 2B no se detallan en la informacion disponible. La diferencia principal entre este repositorio y las versiones oficiales de Qwen es el mantenedor y la posible seleccion de niveles de cuantizacion; la base del modelo es identica.

## Limitaciones y advertencias

- Alucinacion: como todo modelo de 1,5B, presenta una probabilidad elevada de generar informacion incorrecta o inventada, especialmente en tareas de conocimiento factual.
- Tamano y capacidad: su reducido numero de parametros limita el razonamiento complejo, el seguimiento de instrucciones largas y la calidad en tareas de codigo o matematicas frente a modelos mayores de la misma familia.
- Idiomas: aunque el modelo original declara soporte para mas de 29 idiomas, el tag de idioma de este repositorio solo indica ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Repositorio de terceros: la conversion GGUF la mantiene el usuario ikun-114514, no el equipo oficial de Qwen; conviene verificar la integridad de los archivos y preferir la version oficial si se busca maxima trazabilidad.
- Sin adopcion: el repositorio registra 0 descargas y 0 likes en la informacion disponible, por lo que no hay validacion de la comunidad sobre su calidad.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia oficial del modelo base y las condiciones de la model card original.
- Contexto efectivo: aunque se declaran 32.768 tokens de contexto, la ventana util real puede ser menor en cuantizaciones agresivas (q2_K o q3_K_M) y en funcion del runner.
- Produccion: no se han documentado pruebas de estabilidad, latencia ni calidad en entornos productivos para esta conversion concreta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ikun-114514/Qwen2.5-1.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Version GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Guia de llama.cpp en Qwen: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Benchmarks de cuantizacion: https://qwen.readthedocs.io/en/latest/benchmark/quantization_benchmark.html
- Benchmarks de velocidad y requisitos de VRAM: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Paper Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
