# Baekpica/MiMo-V2.6-Flash-RL-UNCENSORED-VQ-GGUF

## Resumen

MiMo-V2.6-Flash-RL-UNCENSORED-VQ-GGUF es una cuantización experimental en formato GGUF del modelo MiMo-V2.6-Flash-RL de Xiaomi, en su edición "uncensored" publicada por dealignai, que a su vez deriva del checkpoint original de XiaomiMiMo. Se trata de un modelo omnimodal nativo de tipo mezcla de expertos (MoE) con 309B de parámetros totales y unos 15B activos, que integra torre de visión y vídeo, tokenizador y codificador de audio, un modelo borrador DFlash y cabezas MTP embebidas, con un contexto nativo de 1.048.576 tokens.

La particularidad de esta conversión, obra del usuario Baekpica, es el uso de cuantización vectorial (VQ) residual de muy bajo bit: los expertos enrutados, que concentran la mayor parte de los pesos, se almacenan a unos 1,63 bits por peso en 15 capas y 2,63 bits en 32 capas (2,31 bits de media), muy por debajo de las cuantizaciones GGUF habituales de 4 bits. El resultado es un checkpoint de 166 GB (expertos MXFP4, atención FP8) reducido a 98,5 GB de partes GGUF, dimensionado para caber en un solo DGX Spark (GB10, 128 GB de memoria unificada).

Es relevante como ejercicio de investigación en cuantización extrema para modelos MoE gigantes: demuestra que la cuantización vectorial con matriz de importancia permite ejecutar un modelo de 309B en hardware de consumo prosumer, aunque el propio autor advierte de que se trata de una versión experimental con degradaciones posibles respecto al modelo fuente, no de un reemplazo directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE omnimodal con atención híbrida (global + sliding window), torre de visión/vídeo MiMo ViT, tokenizador y codificador de audio, DFlash draft model y cabezas MTP embebidas |
| Parametros totales | 309B (302,8B en pesos de expertos enrutados); el dato de safetensors del repo indica 573.641.728, correspondiente aparentemente a una parte individual del repo, no al modelo completo |
| Parametros activos | 15B (top-8 de 256 expertos enrutados) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | VQ residual de 13 bits (K = 8.192) en todas las capas MoE, con etapa residual de 8 bits (K = 256) en 32 capas (R13+8); Q8_0 para atención qkv/o, FFN densa de la capa 0 y cabeza de salida; router BF16; embedding BF16; KV cache FP8 |
| Idiomas soportados | Inglés, chino, coreano |
| Licencia | MIT |
| Formato de pesos | GGUF (partes de 98,5 GB en total; sidecars Q8_0 para visión y audio; embedding BF16 en parte propia) |

## Arquitectura y entrenamiento

El modelo base consta de 48 capas con un esquema de atención híbrida: 9 capas de atención global (índices 0, 5, 11, 17, 23, 29, 35, 41, 47, con 64 cabezas de query y 4 de KV) y 39 capas sliding-window con ventana de 128 tokens (64 cabezas de query y 8 de KV) y attention sink aprendido. Las dimensiones de cabeza son 192 para QK y 128 para V, con RoPE parcial sobre 64 de los 192 dims (θ = 1e7 en capas globales y 1e4 en SWA). La capa 0 usa una FFN densa de 16.384; las capas 1–47 son MoE con 256 expertos enrutados, top-8, activación sigmoide con bias de corrección y sin experto compartido, con FFN de experto de 2.048. El vocabulario es de 152.576 tokens.

En cuanto al entrenamiento del modelo fuente, la información disponible no detalla el número de tokens ni la composición del dataset. Sí se sabe que la edición de dealignai eliminó el comportamiento de rechazo a nivel de pesos: la comparación byte a byte muestra que solo se modifican los tensores `self_attn.o_proj.weight` de las capas 34 a 47 (14 tensores BF16); expertos, router, embeddings, cabeza, visión, audio, DFlash y MTP son idénticos al original de Xiaomi.

La innovación principal de esta conversión es la receta de cuantización `mimo26f-vq8-r13x47-r8x32-q8-fp8kv-embssd-v1`: los expertos se codifican con VQ de 8 dimensiones, un codebook E4M3 por capa compartido por los 256 expertos y por gate/up/down, con una ganancia F16 por fila. Se aplica un esquema de 13 bits en las 47 capas MoE y una etapa residual de 8 bits en 32 de ellas (las 8 capas MoE globales primero, las otras 24 elegidas por medición end-to-end). La matriz de importancia se ajustó con 4,13M de tokens de calibración (texto, chat, herramientas, imágenes, vídeo y audio) pasados por el checkpoint original. Medido contra los pesos BF16 de esta misma edición con teacher forcing sobre chats retenidos: KL 0,089 y coincidencia del siguiente token del 91,9% en turnos del asistente (el original RL contra sí mismo, con distinto batching: KL 0,020 y 97,8%).

## Capacidades

- Generación de texto conversacional multilingüe (inglés, chino, coreano) con contexto nativo de 1M de tokens.
- Comprensión multimodal: entrada de imágenes y vídeo mediante la torre MiMo ViT (28 capas, 24 window + 4 global, con merger 2x2) y entrada de audio mediante el tokenizador y codificador de audio dedicados.
- Pipeline image-text-to-text: describe y razona sobre imágenes y vídeo combinados con texto.
- Soporte de tool calling (los tokens de calibración incluyen herramientas, lo que sugiere entrenamiento/fine-tuning con function calling en el modelo fuente).
- Decodificación especulativa mediante el draft model DFlash embebido y cabezas MTP (multi-token prediction), con soporte de dos borradores MTP embebidos en el runtime.
- Gestión eficiente de contexto largo: atención sliding-window con attention sink, reutilización parcial de prefijo y KV cache en disco.
- Sin filtros de seguridad: el comportamiento de rechazo del modelo fuente fue eliminado a nivel de pesos, por lo que sigue instrucciones sin las restricciones habituales de alineamiento.

## Casos de uso

- Investigación en cuantización extrema: es el caso de uso principal declarado por el autor; permite estudiar el comportamiento de códigos VQ de 1,6–2,6 bits por peso en un MoE de 309B y comparar degradaciones frente al modelo fuente.
- Ejecución de un modelo frontera en una sola máquina: cabe íntegro (modelo, KV cache de 1M tokens y sidecars multimedia) en los 117,2 GiB de un DGX Spark, sin necesidad de clústeres multi-GPU.
- Análisis de vídeo y documentos largos: la ventana de contexto de 1.048.576 tokens permite procesar transcripciones extensas, repositorios completos o horas de contenido multimodal en una sola sesión.
- Asistentes multimodales locales: combina texto, imágenes, vídeo y audio en un despliegue totalmente local, útil donde la privacidad impide enviar medios a APIs externas.
- Prototipado de agentes con herramientas: el soporte de tool calling y la decodificación especulativa (MTP/DFlash) permiten experimentar con flujos agénticos multi-paso a velocidad razonable en hardware compacto.
- Generación de contenido sin restricciones para investigación de seguridad: al ser un modelo abliterado, sirve para estudiar comportamientos de modelos sin alineamiento, red-teaming y evaluación de salvaguardas externas.
- Procesamiento por lotes offline de medios: la reutilización parcial de prefijo y el KV cache en disco facilitan trabajos largos de indexación o resumen de colecciones de documentos e imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta cuantización en la información disponible. Los únicos datos de rendimiento publicados son de inferencia en DGX Spark (barrido de 2K a 64K tokens de contexto):

| Métrica | Valor |
|---|---|
| Prefill | 1.294,9 tok/s |
| Decode sin drafting | 23,96 tok/s |
| Decode con dos borradores MTP embebidos | 26,35 tok/s |
| KL frente a pesos BF16 (teacher forcing, chats retenidos) | 0,089 |
| Coincidencia de siguiente token (turnos del asistente) | 91,9% |
| Referencia: RL original contra sí mismo | KL 0,020; 97,8% |

## Requisitos de hardware

- VRAM/memoria unificada: el modelo GGUF ocupa 98,5 GB; con la KV cache de 1M tokens, ambos sidecars multimedia y el draft model cargados, el uso total es de 111,1 de los 117,2 GiB disponibles en un GB10. El plan por defecto del servidor (visión, audio y dos borradores MTP) consume 109,8 de 117,6 GiB.
- GPU recomendadas: NVIDIA DGX Spark (GB10) es el hardware objetivo declarado. No cabe en GPUs de consumo convencionales (una RTX 4090 con 24 GB o una RTX 5090 con 32 GB son insuficientes incluso con offload agresivo); sería necesario hardware con más de 110 GB de memoria unificada accesible.
- Consumer GPU: no cabe en ninguna GPU de consumo actual; está explícitamente dimensionado para un único DGX Spark.
- Despliegue: el runtime soportado es ds4-dfm-rs con la familia `mimo2_vq` (PR #127 del repositorio de Baekpica), que soporta texto, imágenes, vídeo y audio, MTP y DFlash embebidos, reutilización parcial de prefijo, KV cache en disco y el contexto nativo de 1M. No se menciona soporte en llama.cpp, vLLM, TGI u Ollama para esta variante VQ.
- Rendimiento medido: 1.294,9 tok/s de prefill y 23,96–26,35 tok/s de decode en DGX Spark (según se use drafting o no).

## Comparativa con modelos similares

| | MiMo-V2.6-Flash-RL-UNCENSORED-VQ-GGUF | MiMo-V2.6-Flash-RL Mixed-Quant GGUF (predecesor) | MiMo-V2.6-Flash-RL VQ GGUF (compañero) |
|---|---|---|---|
| Autor | Baekpica | Baekpica | Baekpica |
| Modelo base | dealignai/MiMo-V2.6-Flash-RL-UNCENSORED | dealignai/MiMo-V2.6-Flash-RL-UNCENSORED | XiaomiMiMo/MiMo-V2.6-Flash-RL (original) |
| Parametros | 309B / 15B activos | 309B / 15B activos | 309B / 15B activos |
| Cuantizacion de expertos | VQ residual 13-bit + 8-bit en 32 capas (2,31 bpw medio) | IQ2_XXS/IQ2_XS escalares | Misma receta VQ que esta edición |
| Contexto | 1.048.576 | 1.048.576 | 1.048.576 |
| Alineamiento | Sin rechazos (abliterado) | Sin rechazos (abliterado) | Comportamiento original |
| Licencia | MIT | no disponible | no disponible |

La model card también menciona que la ruta VQ de ds4-dfm-rs se emplea para Beam-1.0, DeepSeek-V4.1, GLM-5.3 y MiniMax-M3.1, aunque sin datos comparativos detallados.

## Limitaciones y advertencias

- Degradación por cuantización extrema: con expertos a 1,6–2,6 bits por peso pueden aparecer razonamientos que entran en bucles o no llegan a respuesta, texto corrupto a mitad de carácter (caracteres `�`), cambios de idioma a mitad de palabra y respuestas más débiles en general. El autor lo califica explícitamente de investigación exploratoria, no de reemplazo directo del modelo fuente.
- Sin alineamiento: el comportamiento de rechazo fue eliminado a nivel de pesos por dealignai. El modelo seguirá instrucciones nocivas; la responsabilidad legal y ética del uso recae íntegramente en el usuario, que debe cumplir la legislación aplicable.
- Riesgo de alucinación: no disponible un dato específico, pero la combinación de modelo abliterado y cuantización agresiva hace previsible un riesgo elevado frente al modelo original.
- Idiomas: soporte declarado solo para inglés, chino y coreano; el rendimiento en castellano no está documentado y la cuantización puede agravar problemas en idiomas no prioritarios.
- Archivos sujetos a cambio: las conversiones siguen en investigación y cualquier fichero puede ser sustituido por una revisión nueva; para builds fijas hay descargar un commit fijado.
- Requisitos de hardware muy estrictos: el plan por defecto consume casi toda la memoria del DGX Spark (109,8 de 117,6 GiB), sin margen para cargas de trabajo concurrentes.
- Soporte de runtime limitado: requiere ds4-dfm-rs con la familia `mimo2_vq`; no hay soporte documentado en los runtimes GGUF habituales (llama.cpp, Ollama).

## Enlaces

- Repositorio de la ficha: https://huggingface.co/Baekpica/MiMo-V2.6-Flash-RL-UNCENSORED-VQ-GGUF
- Modelo base (edición uncensored): https://huggingface.co/dealignai/MiMo-V2.6-Flash-RL-UNCENSORED
- Modelo original de Xiaomi: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Predecesor (Mixed-Quant GGUF): https://huggingface.co/Baekpica/MiMo-V2.6-Flash-RL-Mixed-Quant-GGUF
- Compañero (VQ GGUF del original alineado): https://huggingface.co/Baekpica/MiMo-V2.6-Flash-RL-VQ-GGUF
- Runtime ds4-dfm-rs, soporte mimo2_vq (PR #127): https://github.com/Baekpica/ds4-dfm-rs/pull/127
- Runtime ds4-dfm-rs, mejoras de rendimiento (PR #128): https://github.com/Baekpica/ds4-dfm-rs/pull/128
- Comunidad/discusiones: https://huggingface.co/Baekpica/MiMo-V2.6-Flash-RL-UNCENSORED-VQ-GGUF/discussions
