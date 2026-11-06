# Baekpica/MiMo-V2.6-Flash-MOPD-VQ-GGUF

## Resumen

MiMo-V2.6-Flash-MOPD-VQ-GGUF es una cuantizacion experimental de bajos bits del checkpoint XiaomiMiMo/MiMo-V2.6-Flash-MOPD, un modelo MoE omnimodal de 309B parametros totales (15B activos) desarrollado por Xiaomi. Esta publicacion, obra del usuario Baekpica, aplica una receta de cuantizacion por vector (VQ) sobre los pesos del modelo original para comprimir sus 166 GB en 98,5 GB de partes GGUF, con el objetivo declarado de que el modelo completo (incluido el cache KV de 1M de tokens, los sidecars de vision y audio y el drafter especulativo) quepa en una unica DGX Spark de 128 GB.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de cuantizacion poco habitual: los expertos enrutados, que concentran la mayor parte de los pesos, se almacenan como codigos vectoriales de 8 dimensiones (13 bits en las 47 capas MoE, mas una etapa residual de 8 bits en 32 capas), lo que da una media de 2,31 bits por peso, muy por debajo de los cuantizados GGUF de 4 bits habituales. Por otro, el propio autor advierte de que se trata de investigacion exploratoria y no de un sustituto directo del modelo fuente: pueden aparecer fallos que el original rara vez muestra.

El modelo base conserva la arquitectura del checkpoint RL de Xiaomi: 48 capas con atencion hibrida (9 capas de atencion global y 39 de ventana deslizante), 256 expertos enrutados con top-8, torre de vision/video, tokenizador y codificador de audio, cabezas MTP embebidas y un modelo borrador DFlash para decodificacion especulativa. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con atencion global + sliding-window, torre de vision/video, audio tokenizer y encoder, cabezas MTP y drafter DFlash |
| Parametros totales | 309B (302,8B en pesos de expertos enrutados) |
| Parametros activos | 15B (top-8 de 256 expertos enrutados) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | GGUF con expertos enrutados en VQ de 8 dimensiones: 13 bits (K=8.192) en las 47 capas MoE y etapa residual de 8 bits (K=256) en 32 capas; media de 2,31 bpw (1,63 bpw en 15 capas, 2,63 bpw en 32); atencion qkv/o, FFN densa y cabeza de salida en Q8_0; router en BF16 y bias de correccion en F32; embeddings en BF16; sidecars de vision y audio en Q8_0 |
| Idiomas soportados | en, zh, ko |
| Licencia | MIT |
| Formato de pesos | GGUF (partes separadas; sidecar de vision/video Q8_0, sidecar de audio Q8_0, drafter DFlash Q8_0, cabezas MTP Q8_0) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 48 capas. Nueve capas usan atencion global (capas 0, 5, 11, 17, 23, 29, 35, 41 y 47) con 64 cabezas de consulta y 4 de clave-valor; las otras 39 usan atencion de ventana deslizante de 128 tokens con 64/8 cabezas y un sink de atencion aprendido. Las dimensiones de cabeza son 192 para QK y 128 para V, con RoPE parcial (64 de 192 dimensiones; theta 1e7 en atencion global y 1e4 en ventana deslizante). La capa 0 tiene una FFN densa de 16.384; las capas 1 a 47 contienen 256 expertos enrutados con top-8, activacion sigmoide y bias de correccion, sin experto compartido, con FFN de experto de 2.048. El vocabulario es de 152.576 tokens.

El checkpoint MOPD se obtiene por post-entrenamiento del checkpoint RL de MiMo-V2.6-Flash mediante destilacion on-policy multi-profesor (MOPD2) y una ejecucion corta con profesores especializados orientada a la repeticion en llamadas a herramientas. Segun la model card, MOPD solo modifica pesos del modelo de lenguaje (expertos enrutados, atencion, FFN densa, normas, embedding de tokens y cabeza); la torre de vision, el tokenizador y codificador de audio, el drafter DFlash y los bloques MTP son byte a byte identicos a los del checkpoint RL. La cuantizacion VQ de esta publicacion se ajusta con una importance matrix calculada sobre 4,13 millones de tokens de calibracion (texto, chat, herramientas, imagenes, video y audio) pasados por el propio checkpoint MOPD.

La innovacion tecnica principal de esta ficha es el esquema de cuantizacion: en lugar de escalares por bloque (IQ2_XXS/IQ2_XS en la version anterior), cada experto se representa con codigos vectoriales de 8 dimensiones procedentes de un codebook E4M3 por capa, compartido por los 256 expertos y por las proyecciones gate/up/down, con una ganancia F16 por fila. Las 32 capas con etapa residual de 8 bits (5, 8, 11, 13, 17, 19-25, 27-30 y 32-47) se eligieron a partir de una medicion de colocacion end-to-end realizada sobre la version RL.

## Capacidades

- Generacion de texto y razonamiento multi-turno con ventana de contexto de hasta 1.048.576 tokens.
- Comprension de imagen y texto (pipeline image-text-to-text) mediante torre ViT de 28 capas (24 de ventana y 4 globales) con merger 2x2.
- Comprension de video a traves de la misma torre de vision.
- Procesamiento de audio: tokenizador de audio de 24 capas con 20 codebooks RVQ, codificador de parches de audio de 6 capas y proyector.
- Soporte de tool calling y function calling, reforzado en el post-entrenamiento MOPD contra la repeticion en llamadas a herramientas.
- Capacidades de agente y razonamiento multi-paso, con cabezas MTP embebidas y decodificacion especulativa DFlash.
- Multilingue en ingles, chino y coreano.
- Modo de decodificacion especulativa con modelo borrador DFlash (5 capas SWA-1024, bloque 8, mask embedding) o, alternativamente, con las tres cabezas MTP embebidas.

## Casos de uso

- Procesamiento de documentos largos en una sola pasada: con 1M de tokens de contexto, el modelo puede ingerir libros completos, expedientes o bases de codigo y responder preguntas sobre ellos sin fragmentacion ni recuperacion externa.
- Analisis de video y audio combinados: la torre de vision y el codificador de audio permiten transcribir, resumir y extraer acciones de grabaciones de reuniones o material audiovisual en un unico flujo image-text-to-text.
- Agentes autonomos con tool calling: el post-entrenamiento MOPD contra la repeticion en llamadas a herramientas lo hace adecuado para bucles de agente que invocan APIs, consultan bases de datos y encadenan pasos de razonamiento.
- Asistencia de codigo en pipelines de CI/CD: con tool calling y contexto largo, puede revisar diffs completos de repositorios, generar parches y ejecutar verificaciones encadenadas dentro de un agente de integracion.
- Despliegue en hardware de borde de gama alta: disenado para caber en una DGX Spark de 128 GB (GB10), con 111,1 de los 117,2 GiB en uso cuando se cargan cache KV de 1M, sidecars y drafter; util para entornos con requisitos de privacidad o sin conectividad.
- Investigacion en cuantizacion extrema: sirve como banco de pruebas para estudiar el impacto de la cuantizacion VQ a 1,63-2,63 bpw en tareas de razonamiento, vision y audio, comparando contra el checkpoint fuente.
- Atencion al cliente multilingue (en/zh/ko): conversaciones multi-turno con contexto largo y acceso a herramientas internas mediante function calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las partes GGUF y la fidelidad medida sobre ellas se anadiran una vez verificada la conversion.

## Requisitos de hardware

- VRAM estimada: el conjunto completo (partes GGUF de 98,5 GB, cache KV de 1M tokens, sidecars de vision y audio y drafter) ocupa 111,1 de los 117,2 GiB disponibles en una GB10.
- GPU recomendadas: DGX Spark con GB10 (128 GB) es el objetivo declarado; no se documentan otros perfiles de memoria en la informacion disponible.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada; el tamano del checkpoint (98,5 GB) excede la VRAM de las RTX 4090 (24 GB) y no se detalla un modo de descarga parcial mas alla de la lectura de embeddings por filas desde SSD.
- Opciones de despliegue: el autor menciona el runtime ds4-dfm-rs (ds4) como el que ejecuta esta linea de cuantizaciones VQ; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La decodificacion especulativa DFlash (borrador Q8_0 de 1,45 GiB) y las cabezas MTP (0,98 GiB) estan pensadas para acelerar la generacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-MOPD-VQ-GGUF (esta ficha) | 309B totales / 15B activos | 1.048.576 | VQ 13 bits + residual 8 bits, 2,31 bpw medio | MIT | GGUF, conversion en curso |
| MiMo-V2.6-Flash-MOPD Mixed-Quant GGUF | 309B totales / 15B activos | 1.048.576 | IQ2_XXS/IQ2_XS escalar | MIT | GGUF |
| MiMo-V2.6-Flash-RL VQ GGUF | 309B totales / 15B activos | 1.048.576 | VQ 13 bits + residual 8 bits, misma receta | MIT | GGUF |
| XiaomiMiMo/MiMo-V2.6-Flash-MOPD (fuente) | 309B totales / 15B activos | 1.048.576 | MXFP4 expertos, FP8 atencion, BF16 resto | MIT | Safetensors (166 GB) |

Las tres alternativas comparten arquitectura, contexto y licencia; las diferencias estan en el esquema de cuantizacion y en el checkpoint de partida (RL frente a MOPD). No se dispone de datos de rendimiento comparativo entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion experimental de muy bajos bits: los expertos enrutados estan a unos 1,6 bits por peso (2,6 en las 32 capas con etapa residual de 8 bits), muy por debajo de los GGUF de 4 bits habituales.
- Fallos observados que el modelo fuente rara vez muestra: razonamiento que entra en bucle o no llega a una respuesta, texto roto a mitad de caracter (mostrado como `�`), cambio de idioma a mitad de palabra y respuestas en general mas debiles.
- No es un sustituto directo del modelo fuente; el autor lo describe como investigacion exploratoria de cuantizacion.
- Los archivos pueden cambiar: la linea de conversiones sigue en investigacion y cualquier fichero puede ser reemplazado por una revision nueva; para fijar una build hay que descargar un commit concreto.
- La conversion esta en curso: las partes GGUF y la fidelidad medida sobre ellas aun no se han publicado.
- Idiomas limitados a ingles, chino y coreano; no se documenta soporte de castellano.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre la calidad de la cuantizacion en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Baekpica/MiMo-V2.6-Flash-MOPD-VQ-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD (commit 5220c3f513065a0426be5e094571cbed0983386e)
- Checkpoint RL de partida: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL (commit f657ba2f7d24c9adc5730675baaa2d34de878a49)
- Publicacion predecesora VQ: https://huggingface.co/Baekpica/MiMo-V2.6-Flash-RL-VQ-GGUF
- Publicacion predecesora Mixed-Quant: https://huggingface.co/Baekpica/MiMo-V2.6-Flash-MOPD-Mixed-Quant-GGUF
- Foro de discusion / reporte de problemas: https://huggingface.co/Baekpica/MiMo-V2.6-Flash-MOPD-VQ-GGUF/discussions
