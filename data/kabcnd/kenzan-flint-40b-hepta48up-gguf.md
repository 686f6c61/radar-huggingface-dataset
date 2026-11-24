# kabcnd/Kenzan-Flint-40B-Hepta48Up-GGUF

## Resumen

Kenzan-Flint-40B-Hepta48Up es una cuantización GGUF de un modelo de lenguaje Mixture-of-Experts (MoE) de 39.785.287.456 parámetros totales, con 2.54B parámetros activos por token, construida por el usuario kabcnd a partir del modelo base dima6312/Flint-40B-A2.5B-abliterated. El modelo emplea 256 expertos enrutados más un experto compartido con enrutamiento top-8, y ha sido optimizado específicamente para ejecutarse en Apple Silicon con 16 GB de memoria unificada (Mac mini M6). La innovación principal es una mezcla híbrida de cuantización ternaria (PTQ1_0, 1.75 bpw) para los expertos y precisión superior (Q8_0, Q6_K, Q5_K, IQ4_XS) para el backbone, con un "pin grid" Q4_0 de bloques 512 y transformada de Walsh-Hadamard rápida (FWHT_512) en determinadas capas.

El modelo se distribuye como un único archivo GGUF de 9.77 GiB y requiere un runtime parcheado (PrismML-Eng/llama.cpp con kernels Metal para PTQ1_0 y FWHT_512) que no está disponible en el llama.cpp upstream. Está etiquetado como "abliterated", lo que implica que se han eliminado los mecanismos de rechazo del modelo base, y soporta únicamente inglés, ruso y chino según los metadatos.

Es relevante para desarrolladores que trabajan en inferencia local de gran escala en hardware de consumo Apple, ya que demuestra que un MoE de ~40B puede caber en 16 GB de RAM con contexto de hasta 262.144 tokens mediante cuantización agresiva y decodificación especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 48 capas, 256 expertos enrutados + 1 compartido, top-8 routing |
| Parámetros totales | 39.785.287.456 (39.79B) |
| Parámetros activos | 2.54B por token |
| Longitud de contexto | 262.144 tokens (configurado en el ejemplo de despliegue) |
| Tipos de cuantización | Híbrida: PTQ1_0 ternario (1.75 bpw) para expertos, Q8_0 (embeddings), Q6_K (cabeza de salida), Q5_K/IQ4_XS (atención y expertos compartidos), Q4_0 + FWHT_512 (pin grid en capas 8, 12, 20, 40, 44, 46, 48.down y 48.up) |
| Idiomas soportados | en, ru, zh |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | GGUF (archivo único `Kenzan-Flint-40B-Hepta48Up-Q4_0-M6-16G.gguf`, 9.768 GiB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 48 capas, 256 expertos enrutados y un experto compartido, con enrutamiento top-8 y 2.54B parámetros activos por token sobre 39.79B totales. El modelo base es dima6312/Flint-40B-A2.5B-abliterated, del cual no se dispone de detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) en la información proporcionada. La variante "abliterated" indica que se ha aplicado una técnica de eliminación de rechazos sobre el modelo original, aunque no se documentan los detalles del proceso.

La innovación técnica de esta ficha es la estrategia de cuantización híbrida "Kenzan": los expertos enrutados se comprimen a ternario PTQ1_0 (1.75 bits por peso) mientras que el backbone (embeddings, cabeza de salida, atención y expertos compartidos) se mantiene en precisiones superiores. El "pin grid" Hepta48Up aplica Q4_0 con FWHT_512 en las capas 8, 12, 20, 40, 44, 46, 48 (down_exps) y en la capa 48 (ffn_up_exps) para preservar calidad en puntos críticos. El runtime parcheado incluye decodificación especulativa ngram-map-k (3x4) y kernels Metal específicos para PTQ1_0 y FWHT_512.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, con modo de razonamiento (`<think>`) configurable mediante `--reasoning-format deepseek` y `--reasoning-budget -1`.
- Generación de código y matemáticas (implícito en el modelo base Flint, aunque no se documentan benchmarks específicos).
- Soporte de tool calling y function calling a través de plantillas Jinja (`--jinja`) en llama-server.
- Capacidades multilingües limitadas a inglés, ruso y chino según los metadatos.
- Contexto largo de hasta 262.144 tokens con caché KV cuantizada a q4_0/q4_0.
- Decodificación especulativa integrada (ngram-map-k 3x4) para acelerar la generación.
- Modo de razonamiento con terminación natural mediante `--dry-sequence-breaker`.
- No se documentan capacidades de visión, audio ni otros modos multimodales.

## Casos de uso

- Inferencia local en Mac mini M6 de 16 GB: el modelo cabe en 9.77 GiB de GGUF y consume ~12.5 GiB de RSS con contexto completo de 262k, lo que permite ejecutar un MoE de 40B en hardware de consumo Apple sin GPU dedicada.
- Asistente conversacional de contexto largo: con 262.144 tokens de ventana, puede mantener conversaciones multi-turno extensas o procesar documentos largos (manuales, código, informes) en una sola pasada.
- Generación de código en local: el soporte de tool calling vía Jinja y el modo de razonamiento permiten integrarlo en flujos de autocompletado o revisión de código sin enviar datos a la nube.
- Procesamiento de documentación técnica en ruso o chino: al soportar en/ru/zh, es adecuado para tareas de resumen o extracción en estos idiomas en entornos con requisitos de privacidad.
- Prototipado de agentes multi-paso: la decodificación especulativa y el contexto largo facilitan cadenas de razonamiento y llamadas a herramientas en local.
- Investigación sobre cuantización extrema: el modelo sirve como caso de estudio de cuantización ternaria PTQ1_0 combinada con FWHT_512 y su impacto en perplejidad (PPL 25.06 en WikiText-2 dev).
- Despliegue de bajo consumo en Apple Silicon: con 72-82 t/s de generación y 438-448 t/s de ingesta de prompt, es viable para aplicaciones interactivas en un solo equipo.

## Benchmarks y rendimiento

Resultados medidos por el autor en Mac mini M6 con 16 GB de memoria unificada, Metal GPU, `-ngl 99 --no-host -fa on -c 262144 --cache-type-k q4_0 --cache-type-v q4_0` y decodificación especulativa ngram-map-k (3x4):

| Métrica | Valor | Notas |
|---|---|---|
| Tamaño del archivo GGUF | 9.768 GiB (10.487.781.312 B) | Cabe en 16 GB de memoria unificada |
| RSS del proceso (`-c 262144`) | ~12.5 GiB (74.5% de RAM) | Contexto completo de 262.144 tokens activo |
| Perplejidad WikiText-2 dev (c512) | 25.0629 ± 0.7085 | -0.2295 vs baseline HeptaCore (z = -4.21) |
| Perplejidad WikiText-2 holdout (c512) | 23.6362 ± 0.6664 | -0.3683 vs baseline HeptaCore (z = -8.14) |
| Perplejidad artículo NLP (c256) | 7.9485 ± 1.0448 | -0.2221 vs baseline HeptaCore (z = -2.87) |
| Throughput de generación (tg) | 72.3 – 82.3 t/s (pico 94.2 t/s) | Router en vivo puerto 11434, ngram-map-k 3x4 |
| Ingesta de prompt (pp) | 438 – 448 t/s (pico 669.5 t/s) | Metal FlashAttention + batching 512 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~12.5 GiB de RSS con contexto completo de 262.144 tokens y caché KV q4_0/q4_0; el archivo GGUF ocupa 9.768 GiB.
- Hardware objetivo: Apple Silicon con 16 GB de memoria unificada (Mac mini M6), con Metal GPU.
- No cabe en GPUs de consumo con menos de 12 GB de VRAM; no se documenta soporte para CUDA, ROCm ni otras plataformas.
- Runtime obligatorio: PrismML-Eng/llama.cpp parcheado (prism-b12128-d7b2896 o superior) con kernels Metal PTQ1_0 y FWHT_512; el llama.cpp upstream no puede cargar estos pesos.
- Variables de entorno Metal requeridas: `GGML_METAL_PTQ1_MULTICOL=1`, `GGML_METAL_FUSE_GATHER_MV=1`, `GGML_METAL_TENSOR_ENABLE=1`, `GGML_METAL_SHARED_BUFFERS_ENABLE=1`, `GGML_METAL_Q1_0_POPCNT=1`.
- Despliegue mediante `llama-server` con `-ngl 99 --no-host -fa on`, decodificación especulativa `ngram-map-k` y plantillas Jinja.
- Throughput estimado: 72.3–82.3 t/s de generación (pico 94.2 t/s) y 438–448 t/s de ingesta de prompt (pico 669.5 t/s) en Mac mini M6 16 GB.
- No se documenta compatibilidad con vLLM, TGI, Ollama estándar ni llama.cpp sin parchear.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kenzan-Flint-40B-Hepta48Up | 39.79B / 2.54B (MoE top-8, 256 expertos) | 262.144 | other | GGUF, runtime parcheado | Optimizado para Apple Silicon 16 GB; cuantización ternaria PTQ1_0 |
| dima6312/Flint-40B-A2.5B-abliterated (base) | 39.79B / 2.5B (MoE) | no disponible | no disponible | safetensors (base) | Modelo original sin cuantización Kenzan; sin detalles de entrenamiento en la información disponible |
| Alternativas de ~40B MoE en GGUF | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (mismo tamaño o misma tarea) en parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- El modelo es "abliterated": se han eliminado los mecanismos de rechazo del modelo base, lo que aumenta el riesgo de generar contenido inapropiado, ofensivo o inseguro sin filtros.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual.
- Soporte multilingüe limitado a inglés, ruso y chino; no se garantiza calidad en castellano ni en otros idiomas.
- Licencia "other" sin términos detallados: es necesario verificar las condiciones de uso comercial directamente en el repositorio antes de desplegarlo en producción.
- Requiere un runtime parcheado no estándar (PrismML-Eng/llama.cpp) y variables de entorno Metal específicas; no funciona con llama.cpp upstream, Ollama estándar, vLLM ni TGI.
- Solo se documenta compatibilidad con Apple Silicon (Metal); no hay soporte documentado para CUDA, ROCm ni CPU.
- La cuantización ternaria PTQ1_0 (1.75 bpw) en los expertos puede degradar la calidad frente al modelo base en tareas sensibles; la perplejidad en WikiText-2 dev es 25.06, un valor relativamente alto.
- El contexto de 262.144 tokens requiere ~12.5 GiB de RAM, dejando poco margen en equipos de 16 GB para otras aplicaciones.
- No se documentan sesgos específicos ni composición del dataset de entrenamiento del modelo base.
- El repositorio tiene pocas descargas (491) y likes (2), lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Kenzan-Flint-40B-Hepta48Up-GGUF
- Modelo base: https://huggingface.co/dima6312/Flint-40B-A2.5B-abliterated
- Runtime parcheado: PrismML-Eng/llama.cpp (referenciado en la model card; no se proporciona URL directa)
- Donaciones del autor: https://ko-fi.com/kabcpc
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
