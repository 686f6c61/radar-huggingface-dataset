# simaai/gpt-oss-20b-Autoround-a16w4

## Resumen

GPT-OSS-20b-Autoround-a16w4 es una compilación del modelo GPT-OSS 20B de OpenAI, en su variante Mixture of Experts (MoE), optimizada y empaquetada por SiMa.ai para ejecutarse sobre su plataforma de hardware Modalix. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: el checkpoint original `unsloth/gpt-oss-20b-BF16` se cuantiza con AutoRound a un esquema A16W4 (activaciones BF16, pesos INT4) y se compila con el compilador de SiMa y el runtime LLiMa para aceleradores embebidos.

El problema que resuelve es la brecha entre modelos de lenguaje de gran tamano y hardware de borde con memoria limitada. Con 24 capas transformer, 32 expertos por capa y cuatro expertos activos por token, el modelo original es demasiado pesado para un dispositivo de 16 GB; esta version lo reduce a un artefacto ejecutable en Modalix con una ventana de contexto maxima de 4096 tokens y un rendimiento medido de en torno a 21 tokens por segundo en generacion.

Es relevante ahora porque representa una de las primeras rutas practicas para llevar un MoE de 20B a un SoC de inferencia dedicado con cuantizacion agresiva y sin depender de GPUs de datacenter. La contrapartida es que el artefacto no es portable: solo funciona con el runtime Neat 0.6.1 sobre Modalix y no puede cargarse con `transformers.AutoModel`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 24 capas, 32 expertos por capa, 4 expertos activos por token |
| Parametros totales | 20B (heredados de GPT-OSS 20B; el repositorio no detalla el desglose) |
| Parametros activos | no disponible (cuatro expertos de 32 por token, sin cifra explicita) |
| Longitud de contexto | 4096 tokens (entrada + generacion); recompilable a 8192 cambiando `--max_num_tokens` |
| Tipos de cuantizacion | A16W4: activaciones BF16, pesos INT4 simetricos con bloque de 256; routers RTN INT8 por canal de salida; cabeza de salida RTN INT4 bloque 256; embeddings y KV-cache cuantizados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefactos compilados para SiMa.ai Modalix (no safetensors ni GGUF); el checkpoint pre-cuantizado de origen esta en safetensors |
| Libreria | llima |
| Tamano del repositorio | 26,4 GB |
| Modelo base | unsloth/gpt-oss-20b-BF16 |
| Runtime requerido | SiMa.ai Neat Runtime 0.6.1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GPT-OSS 20B: un transformer con capas MoE, 24 capas, 32 expertos por capa y enrutamiento a cuatro expertos por token. SiMa.ai no entrena ni afina el modelo; parte del checkpoint BF16 de Unsloth, lo cuantiza con AutoRound a un esquema mixto A16W4 y lo compila para el acelerador Modalix. Las excepciones de precision son explicitas: los routers se cuantizan a INT8 por canal de salida (RTN) y la cabeza de salida a INT4 con bloque de 256 (RTN), mientras que el grueso de los pesos del lenguaje queda en INT4 simetrico con bloque 256 y las activaciones en BF16. Tambien se activa la cuantizacion de embeddings y de la KV-cache.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre fases de RLHF o DPO en la informacion proporcionada; esos datos corresponden al modelo original de OpenAI y no se reproducen en este repositorio. La innovacion tecnica destacable es el propio pipeline de compilacion: el repositorio incluye `compile.sh` y metadatos de build (`compilation.json`) que permiten regenerar el artefacto para una ventana de 8192 tokens, a costa de mayor memoria de KV-cache.

## Capacidades

- Generacion de texto autoregresiva en ingles y otros idiomas del modelo base (la lista concreta de idiomas no esta disponible en este repositorio).
- Razonamiento y respuesta a instrucciones heredados de GPT-OSS 20B.
- Generacion de codigo y matematicas, sujeto a la perdida de precision de la cuantizacion INT4.
- Ejecucion local en dispositivo embebido sin conexion a servicios en la nube.
- Inferencia por lotes de tamano 1 optimizada para el runtime LLiMa.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en este artefacto.

## Casos de uso

- Asistente conversacional en el borde: el modelo puede mantener dialogos multi-turno dentro de su ventana de 4096 tokens en un dispositivo Modalix de 16 GB, sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Procesamiento de documentos in situ: resumen y extraccion de informacion de textos de hasta unas pocas miles de palabras en equipos industriales o de campo, gracias a la TTFT de 4,45 s para 1024 tokens de entrada.
- Generacion de codigo en herramientas de desarrollo embebidas: autocompletado y explicacion de fragmentos con latencia de generacion estable en torno a 21 tokens/s.
- Filtrado y clasificacion de contenido en tiempo casi real: con 0,64 s de TTFT para 128 tokens de entrada, es viable para tareas de moderacion o etiquetado por lotes pequenos.
- Automatizacion de soporte tecnico en dispositivos sin conectividad: respuestas guiadas sobre manuales y procedimientos almacenados localmente.
- Prototipado de aplicaciones GenAI en hardware SiMa.ai: sirve como referencia para validar latencia y consumo antes de compilar variantes con contexto de 8192 tokens.
- Investigacion en cuantizacion: el par de repositorios (checkpoint safetensors y artefacto compilado) permite estudiar el impacto de A16W4 en la calidad frente al modelo BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo proporciona mediciones de rendimiento de inferencia en Modalix con MoLE, batch size 1, cuatro muestras por longitud y `max_new_tokens=128`:

| Tokens de entrada | TTFT medio (s) | Velocidad de generacion (tokens/s) |
|---:|---:|---:|
| 128 | 0,64 | 21,72 |
| 256 | 1,19 | 21,71 |
| 512 | 2,29 | 21,55 |
| 1024 | 4,45 | 21,22 |
| 2048 | 8,89 | 19,94 |
| 3072 | 13,93 | 19,29 |

## Requisitos de hardware

- Hardware obligatorio: dispositivo SiMa.ai Modalix con runtime Neat 0.6.1; el artefacto no se ejecuta en GPU convencionales.
- En un DevKit de 16 GB el modelo debe ejecutarse solo: no cabe simultaneamente otro LLM, VLM ni modelo de vision convencional.
- Almacenamiento: el repositorio ocupa 26,4 GB; la model card sugiere instalarlo en `/media/nvme/llima/models/`.
- VRAM en GPU: no aplica; no hay soporte para A100, H100 ni RTX 4090 con este artefacto.
- Despliegue: descarga con `hf download` y ejecucion con `llima run gpt-oss-20b-Autoround-a16w4`; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento medido: TTFT de 0,64 s a 128 tokens de entrada y de 13,93 s a 3072; generacion entre 19,29 y 21,72 tokens/s.
- Contexto ampliado: recompilar con `--max_num_tokens 8192` incrementa la memoria de KV-cache y debe caber en el dispositivo objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| simaai/gpt-oss-20b-Autoround-a16w4 | 20B MoE, 4 expertos activos | 4096 | Artefacto compilado Modalix | Apache 2.0 | Solo SiMa.ai Modalix con Neat 0.6.1 |
| unsloth/gpt-oss-20b-BF16 | 20B MoE | no disponible en esta ficha | safetensors BF16 | Apache 2.0 | GPUs convencionales con transformers/vLLM |
| simaai/gpt-oss-20b-Autoround-Safetensors | 20B MoE | no disponible en esta ficha | safetensors cuantizado | Apache 2.0 | Punto de partida para recompilar con `compile.sh` |
| florianvoss/gpt-oss-20b-Autoround-a16w4 | 20B MoE | no disponible en esta ficha | Artefacto compilado Modalix | no disponible | SiMa.ai Modalix |

La comparativa de rendimiento frente a alternativas no esta disponible: el autor no publica metricas de calidad ni comparaciones con otros modelos.

## Limitaciones y advertencias

- El repositorio contiene artefactos compilados de Modalix y no puede cargarse con `transformers.AutoModel`.
- La cuantizacion A16W4 puede provocar diferencias de calidad respecto al modelo de precision completa; las mediciones publicadas son de rendimiento, no de precision.
- Contexto limitado a 4096 tokens en los artefactos descargables; la variante de 8192 requiere recompilacion y mas memoria.
- En un DevKit de 16 GB no puede convivir con otros modelos, lo que restringe arquitecturas multimodales o multi-modelo.
- Dependencia estricta del runtime Neat 0.6.1 y del compilador de SiMa; no hay portabilidad a otros aceleradores.
- No se documentan sesgos, riesgos de alucinacion ni evaluaciones de seguridad especificas de esta variante; deben asumirse los del modelo GPT-OSS 20B original.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue efectivo exige hardware y software de SiMa.ai, con las condiciones que apliquen a dichos productos.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validacion comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/simaai/gpt-oss-20b-Autoround-a16w4
- Checkpoint pre-cuantizado: https://huggingface.co/simaai/gpt-oss-20b-Autoround-Safetensors
- Modelo base: https://huggingface.co/unsloth/gpt-oss-20b-BF16
- Repositorio espejo: https://huggingface.co/florianvoss/gpt-oss-20b-Autoround-a16w4
- Getting Started de SiMa.ai: https://developer.sima.ai/software/getting-started/
- GenAI con LLiMa: https://developer.sima.ai/software/genai-llima/
- Tutorial para servir modelos GenAI: https://developer.sima.ai/software/tutorials/serve-genai-models
- Tutorial para ejecutar un LLM: https://developer.sima.ai/software/tutorials/run-an-llm
