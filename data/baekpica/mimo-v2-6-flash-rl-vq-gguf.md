# Baekpica/MiMo-V2.6-Flash-RL-VQ-GGUF

## Resumen

MiMo-V2.6-Flash-RL VQ GGUF es una conversión experimental a formato GGUF con cuantización vectorial (VQ) extremadamente agresiva del modelo XiaomiMiMo/MiMo-V2.6-Flash-RL, un MoE omnimodal nativo de Xiaomi de 309B de parámetros (15B activos). La conversión, publicada por el usuario Baekpica, reduce el checkpoint original de 166 GB (expertos MXFP4, atención FP8) a 98,5 GB de ficheros GGUF, con el objetivo explícito de que el modelo completo —incluyendo torre de visión/vídeo, tokenizador y codificador de audio, modelo borrador DFlash y cabeceras MTP— quepa en un único DGX Spark de 128 GB (GB10).

La novedad técnica principal es el uso de cuantización por códigos vectoriales de 8 dimensiones para los expertos enrutados: 13 bits por peso en las 47 capas MoE, más una etapa residual de 8 bits en 32 capas, lo que sitúa la media en 2,31 bits por peso, muy por debajo de las cuantizaciones GGUF habituales de 4 bits. La fidelidad medida frente al modelo original (teacher-forced sobre chats retenidos) es de KL 0,088 y un 92,2 % de coincidencia en el siguiente token en turnos del asistente.

Se trata de una release de investigación exploratoria, no de un reemplazo directo del modelo fuente: el propio autor advierte de posibles fallos de razonamiento, texto corrupto o respuestas más débiles. Su relevancia radica en demostrar que modelos omnimodales gigantes con contexto de 1M de tokens pueden ejecutarse en hardware de un solo nodo, y en que el runtime de soporte (ds4-dfm-rs) ya soporta texto, imagen, vídeo, audio, decodificación especulativa y el contexto nativo de 1.048.576 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer omnimodal con atención híbrida (global + sliding window), torre de visión/vídeo MiMo ViT, tokenizador y codificador de audio |
| Parametros totales | 573.641.728 (dato safetensors del repo; el modelo fuente se describe como 309B MoE, con 302,8B en pesos de expertos enrutados) |
| Parametros activos | 15B (MoE: 256 expertos enrutados, top-8) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | VQ 13 bits (K = 8.192) en las 47 capas MoE + etapa residual 8 bits (K = 256) en 32 capas (media 2,31 bpw); Q8_0 para atención qkv/o, FFN densa de la capa 0, head de salida, torre de visión y audio; router BF16, bias de corrección F32, embeddings BF16 |
| Idiomas soportados | Ingles, chino, coreano (en, zh, ko) |
| Licencia | MIT |
| Formato de pesos | GGUF (partes multiparte, 98,6 GB de repo), con sidecars Q8_0 para visión y audio, embeddings BF16 y modelo borrador DFlash Q8_0 |

## Arquitectura y entrenamiento

El modelo base es un MoE de 48 capas: 9 capas de atención global (índices 0, 5, 11, 17, 23, 29, 35, 41, 47; 64 cabezas query / 4 KV) y 39 capas sliding-window (ventana 128, 64/8 cabezas KV, attention sink aprendido). Las dimensiones de cabeza son QK 192 / V 128, con RoPE parcial (64 de 192 dimensiones, θ = 1e7 en GA y 1e4 en SWA). La capa 0 usa una FFN densa de 16.384; las capas 1–47 usan 256 expertos enrutados con top-8, activación sigmoide con bias de corrección y sin experto compartido, con FFN por experto de 2.048 y vocabulario de 152.576 tokens.

La cuantización VQ emplea códigos de 8 dimensiones con un codebook E4M3 por capa compartido por los 256 expertos y por las matrices gate/up/down, más una ganancia F16 por fila. El resultado es 1,63 bpw en 15 capas y 2,63 bpw en 32 (media 2,31). La calibración se realizó con una importance matrix generada a partir de 4,13M de tokens (texto, chat, herramientas, imágenes, vídeo y audio) pasados por el checkpoint original. El modelo fuente incluye razonamiento con `<think>`, tool calling en XML y modo `enable_thinking`. No hay datos sobre el preentrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) en la informacion disponible, más allá de que la variante es la edición RL de Xiaomi.

## Capacidades

- Generacion de texto conversacional con razonamiento explicito (`<think>`, `enable_thinking`).
- Comprension y generacion multimodal: texto, imagen, video y audio (torre MiMo ViT de 28 capas con merger 2x2; tokenizador de audio de 24 capas con 20 codebooks RVQ, codificador de parches de audio de 6 capas y proyector).
- Pipeline image-text-to-text, con soporte de video y audio en el runtime ds4-dfm-rs.
- Tool calling / function calling mediante llamadas en XML (plantilla de chat original sin cambios).
- Contexto nativo de 1.048.576 tokens, con reutilizacion parcial de prefijos y KV en disco.
- Decodificacion especulativa con dos mecanismos: modelo borrador DFlash (5 capas SWA-1024, 1,45 GiB) y tres bloques MTP embebidos (0,98 GiB) como borrador alternativo.
- Soporte multilingue en ingles, chino y coreano.
- Ejecucion en un unico DGX Spark (GB10) con plan por defecto de 109,8 GiB sobre 117,6 GiB disponibles.

## Casos de uso

- Investigacion en cuantizacion de bajo bit: la ficha es, ante todo, un experimento de VQ a ~2,3 bpw; sirve como base para estudiar degradacion, KL y calibracion con importance matrix en modelos MoE gigantes.
- Ejecucion omnimodal en un solo nodo: con un DGX Spark de 128 GB se puede servir texto, imagen, video y audio sin cluster ni multi-GPU, util para prototipado de asistentes multimodales locales.
- Procesamiento de documentos y contextos larguisimos: la ventana de 1M de tokens permite analizar repositorios de codigo completos, expedientes legales o corpus extensos en una sola sesion (una secuencia por nodo, lane serie).
- Prototipado de agentes con herramientas: el soporte de tool calling XML y razonamiento `<think>` permite montar agentes multi-paso locales con reutilizacion parcial de prefijos para reducir coste en conversaciones largas.
- Transcripcion y comprension de audio/vídeo local: el tokenizador de audio con 20 codebooks RVQ y el codificador de audio residentes (0,61 GiB) permiten pipelines de audio-a-texto o preguntas sobre contenido audiovisual sin enviar datos a la nube.
- Aceleracion de inferencia con decodificacion especulativa: DFlash y los MTP embebidos elevan el decode de 23,96 a 26,35 tok/s, util en interaccion interactiva con respuestas largas de razonamiento.
- Generacion de descripciones de imagen y video (image-text-to-text): el pipeline etiquetado permite VLM locales para indexacion, moderacion o accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos de rendimiento publicados corresponden a la fidelidad de la cuantizacion y al throughput en DGX Spark:

| Metrica | Valor |
|---|---|
| KL vs. original (teacher-forced, chats retenidos) | 0,088 |
| Coincidencia de siguiente token (turnos del asistente) | 92,2 % |
| Original vs. original (referencia, batching distinto) | KL 0,020; 97,8 % |
| Prefill (barrido 2K–64K, sin drafting) | 1.294,9 tok/s |
| Decode sin drafting | 23,96 tok/s |
| Decode con dos borradores MTP embebidos | 26,35 tok/s |
| Memoria del plan por defecto (vision + audio + 2 MTP) | 109,8 de 117,6 GiB |

## Requisitos de hardware

- VRAM/memoria unificada: el conjunto completo (pesos GGUF de 98,5 GB, KV cache FP8 para 1M de tokens de 11,39 GiB, sidecars de vision y audio, y borradores) ocupa 111,1 de los 117,2 GiB de un DGX Spark; el plan por defecto del servidor usa 109,8 de 117,6 GiB.
- GPU recomendada: NVIDIA DGX Spark con GB10 (128 GB de memoria unificada). No hay datos de despliegue en otras GPUs.
- Consumer GPU: no cabe; incluso una RTX 4090 (24 GB) o una A100/H100 de 80 GB son insuficientes para el modelo completo con su KV cache de 1M de tokens. No hay datos de variantes parciales para GPUs menores.
- Despliegue: runtime ds4-dfm-rs con la familia `mimo2_vq` (PR #127 y #128), que soporta texto, imagen, video y audio, MTP y DFlash embebidos, reutilizacion parcial de prefijos, KV en disco y contexto nativo de 1M. No hay soporte confirmado para llama.cpp, vLLM, TGI u Ollama en la informacion disponible.
- Rendimiento: 1.294,9 tok/s de prefill y 23,96–26,35 tok/s de decode en el barrido 2K–64K sobre DGX Spark.
- Los embeddings se leen por filas desde SSD (filas de 8.192 bytes), por lo que la velocidad de almacenamiento puede afectar al rendimiento.

## Comparativa con modelos similares

| | MiMo-V2.6-Flash-RL VQ GGUF | MiMo-V2.6-Flash-RL Mixed-Quant GGUF (predecesor) | MiMo-V2.6-Flash-RL (original) |
|---|---|---|---|
| Desarrollador | Baekpica (cuantizacion) / Xiaomi (base) | Baekpica / Xiaomi | Xiaomi |
| Parametros | 309B MoE, 15B activos | 309B MoE, 15B activos | 309B MoE, 15B activos |
| Cuantizacion expertos | VQ 13 bits + residual 8 bits (media 2,31 bpw) | IQ2_XXS / IQ2_XS escalares | MXFP4 (con atencion FP8) |
| Tamano | 98,5 GB GGUF | no disponible | 166 GB |
| Contexto | 1.048.576 tokens | no disponible | 1.048.576 tokens |
| Fidelidad | KL 0,088; 92,2 % coincidencia | no disponible | referencia: KL 0,020; 97,8 % |
| Licencia | MIT | MIT | MIT |

Otras conversiones con la misma receta VQ mencionadas por el autor (Beam-1.0, DeepSeek-V4.1, GLM-5.3, MiniMax-M3.1, y la variante UNCENSORED de este mismo modelo) existen, pero no se dispone de datos comparativos detallados en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion experimental de muy bajo bit (media 2,31 bpw): el autor advierte explicitamente de razonamientos que entran en bucle o no concluyen, texto que se rompe a mitad de caracter (`�`) o cambia de idioma a mitad de palabra, y respuestas generalmente mas debiles que el modelo fuente.
- No es un reemplazo directo del modelo original: es investigacion exploratoria de cuantizacion.
- Los ficheros pueden ser reemplazados por nuevas revisiones sin aviso; para builds fijas hay que descargar por commit anclado.
- Solo se ha verificado el funcionamiento en DGX Spark con el runtime ds4-dfm-rs; no hay garantias de compatibilidad con otros runtimes GGUF (llama.cpp, etc.).
- El contexto de 1M de tokens solo esta soportado para una secuencia por nodo (lane serie), lo que limita el concurrencia.
- La memoria esta al limite del hardware (111,1 de 117,2 GiB), sin margen para cargas adicionales.
- No hay datos publicados de benchmarks de calidad estandar ni de sesgos conocidos del modelo; al ser una variante RL de Xiaomi con ediciones UNCENSORED derivadas, deben extremarse las salvaguardas en produccion.
- Idiomas limitados a ingles, chino y coreano segun los metadatos; el rendimiento en otros idiomas es no disponible.
- La licencia MIT del repo no impone restricciones comerciales, pero las condiciones del modelo base XiaomiMiMo/MiMo-V2.6-Flash-RL deben revisarse por separado (no disponible en la informacion proporcionada).

## Enlaces

- Repo de Hugging Face: https://huggingface.co/Baekpica/MiMo-V2.6-Flash-RL-VQ-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Predecesor (Mixed-Quant GGUF): https://huggingface.co/Baekpica/MiMo-V2.6-Flash-RL-Mixed-Quant-GGUF
- Variante UNCENSORED con la misma receta: https://huggingface.co/Baekpica/MiMo-V2.6-Flash-RL-UNCENSORED-VQ-GGUF
- Runtime ds4-dfm-rs, PR #127 (soporte mimo2_vq): https://github.com/Baekpica/ds4-dfm-rs/pull/127
- Runtime ds4-dfm-rs, PR #128 (rendimiento): https://github.com/Baekpica/ds4-dfm-rs/pull/128
- Tabla de comunidad para reportar problemas: https://huggingface.co/Baekpica/MiMo-V2.6-Flash-RL-VQ-GGUF/discussions
