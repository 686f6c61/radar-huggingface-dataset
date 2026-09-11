# LibertAIDAI/DeepSeek-V4.1-Flash-NVFP4

## Resumen

DeepSeek-V4.1-Flash-NVFP4 es una recoquantización del checkpoint multimodal DeepSeek-V4.1-Flash publicada por LibertAIDAI (LibertAI), que reduce el peso total de 475,2 GiB a 399,9 GiB (−15,8 %) manteniendo intactos los pesos de los expertos enrutados y recomprimiendo únicamente las tablas de memoria condicional Engram de FP8 a FP4. El modelo base es un transformer MoE multimodal (pipeline `image-text-to-text`) de 386.312.719.314 parámetros declarados en safetensors, distribuido en 48 shards y 143.317 tensores.

La relevancia de esta ficha es doble. Por un lado, documenta una operación de cuantización poco habitual: como DeepSeek ya publicó el modelo con los expertos en MXFP4 (bloques de 32 elementos con escala E8M0), el transcode a NVFP4 es bit-exacto por construcción, ya que los bloques de 16 elementos de NVFP4 son un refinamiento estricto de los de 32. Por otro, deja claro que el ahorro real de tamaño no proviene de los expertos (que de hecho crecen un 5,75 % al pasar de 4,25 a 4,5 bits por peso) sino de las tablas Engram, que son la única parte grande del checkpoint que seguía en 8 bits.

El resultado es un checkpoint pensado para servir desde NVMe: 302,3 GiB (324,6 GB) residen fuera de las tablas Engram y son los que deben caber en VRAM, mientras que las Engram se leen mediante gather aleatorio (48 filas por token). La advertencia principal es que, en la fecha de publicación, ningún motor de inferencia soporta todavía esta arquitectura, por lo que no se ha ejecutado ninguna evaluación end-to-end y la parte Engram es explícitamente lossy.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con memoria condicional Engram y 3 capas MTP |
| Parámetros totales | 386.312.719.314 |
| Parámetros activos | no disponible (el modelo es MoE, pero no se especifica el número de expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (E2M1 con escala E4M3 por bloque de 16 y escala global FP32) en expertos enrutados y Engram; FP8 E4M3 con escalas E8M0 bloque 32×32 en atención y capas densas; BF16 en embeddings, cabeza de salida y torre de visión |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, 143.317 tensores, índice reconstruido desde las cabeceras de shard) |
| Tamaño del repositorio | 429,4 GB (399,9 GiB de pesos) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash (relación: quantized) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento nuevo: no hay datos de entrenamiento, número de tokens, composición de dataset ni fases de RLHF/DPO documentadas en la información disponible. Lo que sí se detalla es la estructura del checkpoint. Los expertos enrutados ocupan 268,9 GiB (56,6 % del total) y llegan en formato MXFP4 (E2M1 empaquetado 2 valores por byte con escalas E8M0, bloques de 1×32). Las tablas Engram, en las capas 1 y 14, ocupan 189,1 GiB (39,8 %) y llegan en E4M3 con escalas E8M0 de bloque 1×32. El resto se reparte entre 3 capas MTP (7,4 GiB, 1,6 %), atención y capas densas (4,9 GiB, 1,0 %) y embeddings, cabeza y visión en BF16 (4,0 GiB, 0,8 %).

La innovación técnica del repo es el transcode de expertos MXFP4 → NVFP4 sin pérdida. El argumento es estructural: los bloques de 16 elementos de NVFP4 refinan los bloques de 32 de MXFP4, de modo que ambos sub-bloques heredan la misma escala de origen `s`; emitiendo los nibbles sin cambios y forzando `weight_scale × weight_scale_2 == s` se reconstruye exactamente el valor original, porque las escalas E8M0 son potencias de dos y E4M3 representa 2^k de forma exacta para k ∈ [−9, 8]. La verificación reportada cubre 47.232 pesos de expertos, 34.823.208.960 escalas de bloque dentro de la ventana exacta de E4M3 (100 %) y 0 discrepancias sobre 2,36 × 10⁹ elementos con `max|delta| = 0`. El coste es de tamaño: NVFP4 usa 4 + 8/16 = 4,5 bits por peso frente a 4 + 8/32 = 4,25 de MXFP4, y un shard concreto pasa de 7.389.759.032 a 7.814.559.376 bytes (+5,75 %).

La segunda operación, la que aporta el ahorro, es el paso de las tablas Engram de FP8 a FP4, conservando el layout de bloque 32 con escala E8M0 del origen. Cada tabla tiene ~384M filas × 256 y pesa 94,6 GiB: `layers.1.engram.embed` y `layers.14.engram.embed` quedan en 48,8 GiB cada una, con un coseno medio de 0,993415 y 0,993445 medido sobre 1,5 millones de filas muestreadas. Esta mitad es lossy y no ha sido evaluada. Engram no es un GEMM sino un gather de n-gramas hasheados: con `engram_layer_ids [1,14]`, `engram_max_ngram_size 4` y `engram_n_heads 8`, cada posición consulta 3 tamaños de n-grama × 8 cabezas = 24 filas por capa, es decir 48 filas por token; en FP4 eso son 136 B por fila y 6,4 KB por token, frente a 264 B y 12,4 KB en FP8.

## Capacidades

- Generación de texto autoregresiva (tag `text-generation`) con arquitectura MoE.
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`); el checkpoint incluye pesos de visión en BF16.
- Enrutamiento de expertos con pesos cuantizados en NVFP4, pensado para kernels MoE de arquitecturas Blackwell.
- Memoria condicional Engram mediante recuperación de n-gramas hasheados (hasta 4-gramas, 8 cabezas, capas 1 y 14), con 48 lecturas de fila por token.
- Predicción multi-token mediante 3 capas MTP incluidas en el checkpoint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible (ni el repositorio ni la model card listan idiomas).

## Casos de uso

- Inferencia multimodal sobre documentos: el pipeline declarado es `image-text-to-text`, de modo que el modelo está pensado para recibir imágenes junto a texto y generar respuestas; el checkpoint conserva la torre de visión en BF16 para no degradar esa vía.
- Sustitución directa del checkpoint upstream en pipelines existentes: al mantener todos los tensores del origen (143.317 tensores, índice reconstruido), un pipeline que hoy consume los 475,2 GiB de DeepSeek-V4.1-Flash puede apuntar a este repo y ahorrar 75,3 GiB de almacenamiento y de I/O de disco.
- Servicio de inferencia con offload de Engram a NVMe: como Engram es un gather y no una multiplicación matricial, puede residir en SSD; desplegar los 302,3 GiB (324,6 GB) restantes en VRAM y servir las tablas desde disco es el escenario que el propio autor describe.
- Investigación en cuantización FP4: el repo es material de referencia para reproducir un transcode MXFP4 → NVFP4 bit-exacto, incluyendo la verificación de escalas dentro de la ventana exacta de E4M3 y la comparación con la implementación de s-zaizen.
- Validación de kernels NVFP4 para MoE: útil para equipos que desarrollan kernels MoE en Blackwell y necesitan un checkpoint real de gran tamaño con expertos y tablas en el mismo layout de bloque de 32.
- Prefill de prompts largos en entornos con almacenamiento rápido: un prompt de 64K tokens genera ~3,1 millones de lecturas aleatorias pequeñas, de modo que el caso de uso natural es un servidor con NVMe de altas IOPS; el FP4 reduce a la mitad el tráfico por token frente al FP8.
- Asistentes conversacionales de propósito general: el tag `text-generation` y el pipeline multimodal lo sitúan como modelo de chat, pero conviene tratarlo como escenario objetivo y no como capacidad validada, dado que no hay benchmarks ni motor de inferencia disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación end-to-end porque ningún motor puede ejecutar todavía esta arquitectura. Las únicas métricas publicadas son de fidelidad de la cuantización, no de calidad de modelo:

| Métrica de cuantización | Resultado |
|---|---|
| Pesos de expertos transcodificados | 47.232 |
| Escalas de bloque dentro de la ventana exacta de E4M3 | 34.823.208.960 / 34.823.208.960 (100 %) |
| Verificación independiente de reconstrucción | 0 discrepancias sobre 2,36 × 10⁹ elementos, `max\|delta\| = 0` |
| Crecimiento de un shard de expertos | 7.389.759.032 → 7.814.559.376 bytes (+5,75 %) |
| Coseno medio, `layers.1.engram.embed` | 0,993415 (1,5M filas muestreadas) |
| Coseno medio, `layers.14.engram.embed` | 0,993445 (1,5M filas muestreadas) |
| Comparación con s-zaizen (capa 1, ffn, experto 0, w1) | nibbles idénticos, 11.796.480 elementos coincidentes |

## Requisitos de hardware

- VRAM estimada: 399,9 GiB si se cargan todos los pesos; 302,3 GiB (324,6 GB) si las tablas Engram se sirven desde NVMe, sin contar caché KV ni activaciones.
- GPU recomendadas: clúster de 4 a 8 aceleradores. 8 × A100 80 GB (640 GB), 4 × H100 80 GB (320 GB, muy ajustado) o 4 × H200 141 GB (564 GB) cubren los 302,3 GiB fuera de Engram. Para los kernels NVFP4 de expertos se necesitan GPUs Blackwell con soporte de NVFP4 en MoE.
- No cabe en GPU de consumo. El checkpoint completo (399,9 GiB) y la parte no-Engram (302,3 GiB) exceden con holgura los 24 GB de una RTX 4090 o los 48 GB de una RTX 6000 Ada.
- Almacenamiento: NVMe obligatorio para las tablas Engram. El prefill es el cuello de botella, con ~3,1 millones de lecturas aleatorias pequeñas para un prompt de 64K tokens; en decodificación son ~48 lecturas aleatorias por token.
- Opciones de despliegue: no disponible. La model card indica que ningún motor puede ejecutar esta arquitectura en el momento de la publicación, por lo que vLLM, TGI, llama.cpp u Ollama no están confirmados. El repo está etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles. Como referencia de I/O, el FP4 reduce el tráfico de Engram de 12,4 KB a 6,4 KB por token.

## Comparativa con modelos similares

| Modelo | Expertos + MTP | Engram | Resto | Total | Notas |
|---|---|---|---|---|---|
| deepseek-ai/DeepSeek-V4.1-Flash (upstream) | 276,3 GiB | 189,1 GiB (FP8) | 8,9 GiB | 475,2 GiB | FP8 bloque 32×32 con `expert_dtype: fp4`; Engram en E4M3 |
| s-zaizen/DeepSeek-V4.1-Flash-NVFP4 | ~292 GiB | 189,1 GiB (FP8) | 8,9 GiB | 491,1 GiB | Mismo transcode de expertos, Engram sin tocar; queda más grande que el original |
| LibertAIDAI/DeepSeek-V4.1-Flash-NVFP4 (este repo) | ~292 GiB | 97,6 GiB (FP4) | 8,9 GiB | 399,9 GiB | Único de los tres que reduce el tamaño; Engram lossy y sin evaluar |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | no disponible | Versión anterior en FP8 bloque 128×128, sin FP4, lo que hacía rentables las conversiones NVFP4 |

La diferencia clave frente a s-zaizen es que ambos transcodes de expertos producen nibbles idénticos (comprobado sobre `layers.1.ffn.experts.0.w1`), pero solo este repo toca las tablas Engram, que son el 39,8 % del checkpoint original. Frente a upstream, el ahorro neto es de 75,3 GiB; frente a s-zaizen, de 91,2 GiB.

## Limitaciones y advertencias

- La mitad Engram de esta cuantización es lossy: coseno medio ≈ 0,9934 sobre 1,5M filas muestreadas, un valor que el propio autor considera por debajo de lo aceptable para pesos de expertos.
- No se ha ejecutado ninguna evaluación de calidad end-to-end. No hay benchmarks de MMLU, HumanEval, GSM8K ni de ninguna otra tarea.
- Ningún motor de inferencia soporta la arquitectura en la fecha de publicación, por lo que el modelo no es desplegable de forma inmediata sin trabajo de integración.
- El transcode de expertos no reduce tamaño, lo aumenta (+5,75 % por shard). Solo tiene sentido si el motor objetivo exige NVFP4 y carece de ruta MXFP4.
- La elección de la escala global se hace por tensor para centrarlo; el autor señala que la ventana exacta de E4M3 es k ∈ [−9, 8] y que la identidad se cumple para bloques cuya escala cae en ese rango.
- Riesgo de alucinación, sesgos conocidos y comportamiento multilingüe: no disponibles en la información proporcionada.
- Longitud de contexto máxima: no disponible, lo que impide planificar despliegues con prompts largos más allá de la referencia de 64K tokens usada como ejemplo de I/O.
- Licencia MIT declarada en este repositorio, pero la licencia del modelo base upstream no se detalla en la información disponible; conviene verificarla antes de uso comercial.
- 0 descargas y 9 likes en el momento de la consulta: es un artefacto recién publicado, sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Implementación NVFP4 alternativa citada: https://huggingface.co/s-zaizen/DeepSeek-V4.1-Flash-NVFP4
- Sitio del autor: https://libertai.io
- Nota sobre la búsqueda web: los resultados devueltos corresponden a páginas de ayuda de YouTube y no guardan relación con el modelo, por lo que no se incluye ningún enlace adicional. No se han encontrado papers, blogs ni demos asociados en la información disponible.
