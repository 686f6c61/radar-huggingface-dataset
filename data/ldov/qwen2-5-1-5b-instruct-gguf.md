# ldov/Qwen2.5-1.5B-Instruct-GGUF

## Resumen

ldov/Qwen2.5-1.5B-Instruct-GGUF es una redistribucion en formato GGUF del modelo Qwen2.5-1.5B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. Se trata de un modelo de lenguaje causal de tipo decoder-only, afinado por instrucciones, con 1,54 mil millones de parametros (1,78 mil millones contando embeddings segun los pesos en safetensors) y una ventana de contexto de 32.768 tokens, con capacidad de generar hasta 8.192 tokens por respuesta. El repositorio lo publica el usuario ldov y no anade modificaciones tecnicas propias: es una conversion a GGUF del checkpoint oficial.

El problema que resuelve es el de la inferencia local en hardware muy limitado. Al estar cuantizado en GGUF, el modelo puede ejecutarse en CPU, en portatiles sin GPU dedicada y en dispositivos de borde mediante llama.cpp y sus derivados (Ollama, LM Studio, kobold.cpp), manteniendo un comportamiento conversacional razonable para su tamano. Frente a la version original en bfloat16, el formato GGUF reduce drasticamente el espacio en disco y la memoria necesaria, a cambio de una perdida de precision que depende del nivel de cuantizacion elegido.

Es relevante ahora porque cubre el tramo de menor coste computacional de la familia Qwen2.5 (que abarca de 0,5B a 72B parametros) y porque emplea arquitectura transformer moderna con RoPE, SwiGLU, RMSNorm y GQA, ademas de una licencia Apache 2.0 sin restricciones de uso comercial. Todo ello lo convierte en una opcion practica para prototipado, clasificacion de texto, extraccion de datos estructurados y agentes ligeros que no pueden depender de una API externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con RoPE, SwiGLU, RMSNorm, sesgo en QKV y embeddings de palabras atados (tied word embeddings) |
| Parametros totales | 1,54B (1.777.088.000 segun los pesos en safetensors, incluyendo embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Parametros no pertenecientes a embeddings | 1,31B |
| Longitud de contexto | 32.768 tokens (la ficha generica de la serie Qwen2.5 menciona hasta 128K, pero la especificacion de este checkpoint de 1,5B indica 32.768) |
| Longitud de generacion | 8.192 tokens |
| Capas | 28 |
| Cabezas de atencion | 12 para Q y 2 para KV (GQA) |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | La ficha de la serie declara mas de 29 idiomas (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, thai, arabe, entre otros); los metadatos del repositorio solo declaran "en" |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Etapa de entrenamiento | Preentrenamiento y postentrenamiento (instruct) |
| Tamano del repositorio | 13,3 GB |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con normalizacion RMSNorm, activacion SwiGLU y codificacion posicional rotatoria (RoPE). Incorpora sesgo en las proyecciones de query, key y value, un detalle heredado de la familia Qwen, y utiliza embeddings de palabras atados entre la capa de entrada y la de salida, lo que reduce el recuento de parametros efectivos. La atencion emplea Grouped Query Attention con 12 cabezas de consulta y solo 2 cabezas de clave/valor, lo que disminuye el coste de la cache KV durante la generacion y facilita el despliegue con contextos largos en memoria reducida.

Segun la documentacion de la serie, el preentrenamiento se realizo sobre un corpus de hasta 18 billones de tokens, y las mejoras en codigo y matematicas respecto a Qwen2 provienen del uso de modelos expertos especializados en esos dominios durante la construccion de los datos. Los detalles concretos de la mezcla del dataset, la composicion exacta y las tecnicas de postentrenamiento (si hubo RLHF, DPO u otro metodo de alineacion) no estan disponibles en la informacion proporcionada; la model card unicamente indica que hubo etapa de preentrenamiento y postentrenamiento. Tampoco se documenta en este repositorio ninguna innovacion adicional de decodificacion, ya que se trata de una redistribucion cuantizada del checkpoint oficial y no de un modelo nuevo.

## Capacidades

- Generacion de texto conversacional multi-turno con formato de chat (etiqueta `conversational` y `chat` en el repositorio).
- Razonamiento general e instrucciones: la serie Qwen2.5 reporta mejoras sustanciales en seguimiento de instrucciones y resistencia a variaciones en los system prompts.
- Generacion de codigo, con mejoras atribuidas a modelos expertos en el dominio durante la preparacion de datos.
- Matematicas y razonamiento aritmetico, tambien reforzado por los datos especializados de la serie.
- Generacion de textos largos de mas de 8K tokens, segun la documentacion de Qwen2.5.
- Comprension y generacion de datos estructurados, en particular JSON, y manejo de tablas.
- Capacidades multilingues declaradas para mas de 29 idiomas en la ficha de la serie, aunque los metadatos del repositorio concreto solo listan ingles.
- Soporte de tool calling y function calling: la documentacion de Qwen2.5 lo menciona dentro de las mejoras de seguimiento de instrucciones y salidas estructuradas; no se detalla la plantilla concreta en la informacion disponible.
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible` en el repositorio).
- Rol y personalizacion de personajes: la serie declara mejoras en implementacion de role-play y establecimiento de condiciones para chatbots.
- No dispone de capacidades de vision ni de audio; es un modelo exclusivamente de texto.

## Casos de uso

- Atencion al cliente automatizada en local: con 32.768 tokens de contexto puede mantener conversaciones multi-turno con historial largo y documentacion de producto adjunta, sin enviar datos del usuario a servicios externos.
- Clasificacion y enrutado de tickets: su tamano permite ejecutarlo en CPU y procesar grandes volumenes de mensajes para etiquetar categoria, urgencia e idioma antes de derivar a un modelo mayor.
- Extraccion de datos estructurados: generar JSON a partir de correos, facturas o formularios, aprovechando la mejora declarada en generacion de salidas estructuradas y comprension de tablas.
- Asistente de codigo en el editor: autocompletado, explicacion de fragmentos y generacion de tests para proyectos pequenos, ejecutandose en el portatil del desarrollador con cuantizaciones q4_K_M o q5_K_M.
- Chatbot de borde o embebido: integrable en aplicaciones de escritorio, moviles o dispositivos IoT mediante llama.cpp, con requisitos de memoria por debajo de 1 GB en cuantizaciones bajas.
- Generacion aumentada por recuperacion (RAG) ligera: indexar documentacion interna y usar el modelo para responder preguntas citando fragmentos, con la ventana de contexto como buffer de passages.
- Preprocesado en pipelines de agentes: actuar como eslabon barato que reformula consultas, decide que herramienta invocar y resume resultados antes de llamar a un modelo mayor.
- Filtrado y moderacion de contenido: primera pasada de deteccion de texto toxico, spam o fuga de informacion, reduciendo el coste frente a evaluar todo el trafico con un modelo grande.
- Prototipado e investigacion: banco de pruebas para estudiar el efecto de las distintas cuantizaciones GGUF sobre la calidad, con ocho niveles disponibles en el mismo repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio remite al blog oficial de Qwen2.5 y a las paginas de benchmark de cuantizacion y velocidad de la documentacion de Qwen, pero no incluye cifras concretas para este checkpoint de 1,5B ni tablas comparativas. No se deben asumir valores de MMLU, HumanEval o GSM8K para este modelo sin consultar esas fuentes originales.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos, dependen de la cuantizacion y del backend): en torno a 0,8-1,0 GB para q2_K, 1,0-1,2 GB para q4_K_M, 1,2-1,4 GB para q5_K_M, 1,4-1,7 GB para q6_K, 1,8-2,1 GB para q8_0 y 3,5 GB aproximadamente en bfloat16. Una referencia externa para el mismo modelo en GGUF cita un rango de 0,78 a 3,09 GB entre todas las opciones de cuantizacion.
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090 y cualquier GPU con 4 GB o mas de VRAM, incluso en cuantizaciones altas con contexto largo.
- Funciona en CPU pura, que es su escenario principal de uso cuando no hay GPU disponible; el rendimiento depende del numero de nucleos y del ancho de banda de memoria.
- GPU profesionales como A100, H100 o L40S son innecesarias para este tamano y solo tendrian sentido para servir muchas peticiones concurrentes en paralelo.
- Opciones de despliegue: llama.cpp y su CLI, Ollama, LM Studio, kobold.cpp, text-generation-webui, y servidores compatibles con la API de OpenAI para el backend de llama.cpp. No se detalla compatibilidad con vLLM o TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La documentacion de Qwen enlaza a una pagina de benchmarks de velocidad con resultados de memoria de GPU y throughput, pero las cifras no se incluyen en los datos facilitados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ldov/Qwen2.5-1.5B-Instruct-GGUF (esta ficha) | 1,54B | 32.768 tokens | Apache 2.0 | GGUF | Redistribucion comunitaria; cuantizaciones q2_K a q8_0 |
| Qwen/Qwen2.5-1.5B-Instruct (oficial) | 1,54B | 32.768 tokens | Apache 2.0 (segun licencia enlazada) | safetensors en bfloat16 | Checkpoint original del que deriva esta conversion |
| Qwen/Qwen2.5-1.5B-Instruct-GGUF (oficial) | 1,54B | 32.768 tokens | Apache 2.0 | GGUF | Conversion publicada por el propio equipo Qwen; alternativa directa a este repositorio |
| Otros modelos de ~1-3B (Llama 3.2 1B, Gemma 2 2B, etc.) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion fiable |

La comparacion de rendimiento en benchmarks entre estas alternativas no puede realizarse con los datos disponibles.

## Limitaciones y advertencias

- Riesgo de alucinacion elevado: con 1,54B de parametros, el modelo tiene una capacidad de conocimiento factual limitada y es propenso a inventar datos, citas y APIs, especialmente en dominios especializados.
- Sesgos: no se documenta en la informacion disponible ningun analisis de sesgos para este checkpoint; los corpus web a gran escala suelen introducir sesgos demograficos, culturales y linguisticos.
- Conocimiento desactualizado: la fecha de corte del preentrenamiento no se especifica en los datos proporcionados.
- Contexto practico: aunque la ficha declara 32.768 tokens, el rendimiento real en tareas de recuperacion dentro de contextos muy largos suele degradarse en modelos de este tamano; conviene validar con pruebas propias.
- Idiomas: los metadatos del repositorio solo declaran ingles, mientras que la ficha de la serie declara mas de 29 idiomas. La calidad en castellano no esta verificada por ningun dato de evaluacion disponible; es previsible que sea inferior a la del ingles.
- Trazabilidad: se trata de una redistribucion de un usuario individual (ldov), no del equipo Qwen. No hay descargas ni valoraciones registradas, por lo que no existe validacion de la comunidad sobre la integridad o fidelidad de los ficheros. Para entornos de produccion es mas prudente usar el repositorio oficial.
- Cuantizacion: las cuantizaciones bajas (q2_K, q3_K_M) degradan de forma notable la coherencia y el seguimiento de instrucciones. En tareas sensibles conviene q5_K_M o superior.
- Tool calling: aunque la serie declara soporte, no se documenta en este repositorio la plantilla de prompt concreta ni el parser de llamadas a funciones, por lo que la integracion requiere trabajo adicional de validacion.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda conservar el aviso de licencia y la atribucion al proyecto Qwen.
- Fecha de publicacion del repositorio: los metadatos indican creacion y ultima actualizacion en septiembre de 2026, sin revisiones posteriores registradas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ldov/Qwen2.5-1.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Licencia: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/blob/main/LICENSE
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Guia de llama.cpp en la documentacion de Qwen: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Benchmarks de cuantizacion: https://qwen.readthedocs.io/en/latest/benchmark/quantization_benchmark.html
- Benchmarks de velocidad y memoria: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Modelo en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-1.5B-Instruct-GGUF
- Articulo tecnico de Qwen2 (arXiv 2407.10671): https://arxiv.org/abs/2407.10671
