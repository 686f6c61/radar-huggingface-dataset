# kingjones777/Ornith-1.5-9B-ROCmFP4-COHERENT-GGUF

## Resumen

Ornith-1.5-9B-ROCmFP4-COHERENT-GGUF es una cuantización de 4 bits del modelo multimodal `ornith-ai/Ornith-1.5-9B`, publicada por el usuario kingjones777. No se trata de un modelo nuevo, sino de una conversión a formato GGUF con tipos de tensor FP4/FP8 nativos de AMD (ftype 102, `Q4_0_ROCMFP4_COHERENT`), construida específicamente para el hardware Strix Halo (gfx1151) mediante el fork ROCmFPX de llama.cpp. El objetivo es ofrecer una variante de 4 bits que priorice la calidad sobre la velocidad, manteniendo embeddings y cabeza de salida en Q6_K.

El modelo base es un transformer híbrido de 8.953.803.264 parámetros (aproximadamente 9B), con arquitectura `Qwen3_5ForConditionalGeneration` (`qwen35`), 32 capas, dimensión oculta de 4096 y vocabulario de 248.320 tokens. Combina 24 capas gated-deltanet con 8 capas de atención completa, lo que lo sitúa entre los transformers densos clásicos y las arquitecturas MoE. Es multimodal (image-text-to-text) e incluye un proyector de visión separado.

La relevancia de esta ficha radica en su especialización: no funciona en llama.cpp estándar, Ollama ni LM Studio, ya que los tipos de tensor `Q4_0_ROCMFP4_*` y `Q*_0_ROCMFPX*` no existen en el código principal. Está pensada para ejecutarse en un Ryzen AI MAX+ 395 con 128 GB de memoria unificada y ROCm 7.13.0, con métricas de rendimiento medidas y verificadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `Qwen3_5ForConditionalGeneration` (`qwen35`): 24 capas gated-deltanet + 8 capas de atención completa |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (cargados y verificados en la medición del autor) |
| Tipos de cuantizacion | GGUF ftype 102 `Q4_0_ROCMFP4_COHERENT` (4,98 BPW); `token_embd` y `output.weight` en Q6_K |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (5,19 GiB); proyector de visión `mmproj-Ornith-1.5-9B-BF16.gguf` (921.704.416 bytes) |
| Capas | 32 |
| Dimension oculta | 4096 |
| Vocabulario | 248.320 tokens |
| Tensores | 427 |
| Tamano del repo | 6,5 GB |
| Descargas | 33 |
| Fecha de creacion | 2026-08-20 |
| Ultima actualizacion | 2026-11-23 |

## Arquitectura y entrenamiento

El modelo base emplea una pila híbrida de 32 capas que alterna 24 capas gated-deltanet (mecanismo de estado lineal con compuertas) y 8 capas de atención completa. Esta combinación busca reducir el coste computacional y de memoria de la atención cuadrática en contextos largos, manteniendo capacidad de recuperación global en las capas de atención completa. No es un transformer denso puro ni un MoE. `tie_word_embeddings` es `false`, por lo que `output.weight` es un tensor independiente y puede protegerse por separado durante la cuantización.

La cuantización se realizó a partir de `ornith-ai/Ornith-1.5-9B-GGUF` → `Ornith-1.5-9B-BF16.gguf` (17.920.696.768 bytes), verificada byte a byte contra el Hub, sin reconversión desde safetensors. El autor verificó la cabecera de cada artefacto con un parser independiente para confirmar que `token_embd.weight` y `output.weight` quedaron en Q6_K. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. El `config.json` declara `mtp_num_hidden_layers: 1`, pero los safetensors publicados no contienen pesos MTP y el GGUF convertido no tiene la clave `nextn_predict_layers`, por lo que la decodificación especulativa no está disponible.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat y modo de razonamiento (`enable_thinking`) activable por petición mediante `chat_template_kwargs`.
- Comprensión de imágenes: pipeline image-text-to-text con proyector de visión incluido; verificado con una imagen de cuatro cuadrantes de color (4/4 aciertos).
- Razonamiento aritmético y factual básico verificado: 17×23 → 391, capital de Japón → Tokio, días de 2024 → 366 (3/3 en `content` y `reasoning_content`).
- Generación de código: medida a 40,4 tok/s de media en dos prompts de código.
- Tool calling / function calling: 7/8 en modo requerido y 7/8 en modo automático según las métricas del autor.
- Contexto largo: 131.072 tokens cargados, con caché de prompt (6.962 tokens cacheados de 6.986 en el segundo turno).
- Capacidades multilingües: no disponible.
- No dispone de cabecera drafter ni decodificación especulativa.

## Casos de uso

- Asistente conversacional local en estación de trabajo Strix Halo: el modelo gestiona diálogos multi-turno con hasta 131.072 tokens de contexto y caché de prompt, adecuado para sesiones largas sin reenviar todo el historial.
- Análisis de documentos e imágenes en local: al ser image-text-to-text con proyector de visión, permite extraer información de capturas, diagramas o figuras junto a texto sin salir del equipo.
- Automatización con tool calling: los 7/8 aciertos en modo requerido y automático lo hacen utilizable en flujos de agente que invocan funciones externas, con la cautela de validar las llamadas en producción.
- Generación de código en pipelines locales: a 40,4 tok/s en prompts de código, sirve para autocompletado, generación de tests o revisión asistida dentro de un entorno sin GPU dedicada.
- Prototipado e investigación en hardware AMD: es una de las pocas opciones que ejercita los tipos FP4/FP8 nativos de ROCmFPX en gfx1151, útil para evaluar el rendimiento de cuantizaciones de 4 bits en APUs.
- Despliegue de bajo consumo en un único equipo: 5,19 GiB de pesos en memoria unificada de 128 GB dejan margen para contexto largo y otros procesos, con 8 s de carga.
- Servicio local compatible con endpoints: el tag `endpoints_compatible` y el servidor Super Roc permiten exponerlo como API local con nombre de modelo `ornith-1.5-9b-coherent`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas son las de inferencia medidas por el autor en un Ryzen AI MAX+ 395 (Strix Halo, gfx1151), 128 GB, ROCm 7.13.0, una petición a la vez:

| Metrica | Valor |
|---|---|
| Decodificacion (mediana de 5, 300 tokens) | 36,27 tok/s |
| Prompt tok/s (p1k) | 1.206,6 |
| Prompt tok/s (p8k) | 1.231,5 |
| Generacion tok/s (p1k) | 40,11 |
| Generacion tok/s (p8k) | 37,21 |
| Generacion de codigo | 40,4 tok/s (media de 2 prompts) |
| Tool calls (requerido / auto) | 7/8 / 7/8 |
| Cache de prompt turno 2 | 6.962 / 6.986 tokens |
| Tiempo de carga | 8 s |
| Contexto cargado | 131.072 tokens |
| Vision | pass |
| Drafter | off |

## Requisitos de hardware

- VRAM/memoria estimada: 5,19 GiB para los pesos en ftype 102, más 921.704.416 bytes del proyector de visión y la memoria del contexto KV; con 131.072 tokens de contexto el consumo total crece de forma significativa sobre la memoria unificada.
- GPU recomendadas: AMD Ryzen AI MAX+ 395 (Strix Halo, gfx1151) con 128 GB de memoria unificada es el objetivo declarado y el único hardware con métricas publicadas.
- GPU de consumo: no se han publicado pruebas en RTX 4090, RTX 3090 u otras GPU consumer; los tipos de tensor ROCmFP4 son específicos de AMD.
- Opciones de despliegue: exclusivamente builds de llama.cpp con soporte ROCmFPX; también el motor Super Roc 0.20.0 y Lemonade con el binario ROCm configurado. No carga en llama.cpp estándar, Ollama ni LM Studio.
- Latencia y throughput: 36,27 tok/s de decodificación y 1.206-1.231 tok/s de prompt en el hardware de referencia; sin decodificación especulativa disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-ROCmFP4-COHERENT (esta ficha) | 8,95B | 131.072 | GGUF ftype 102 ROCmFP4 | Apache 2.0 | Solo ROCmFPX; 36,27 tok/s en Strix Halo |
| Ornith-1.5-9B (base) | 8,95B | No disponible | Safetensors / GGUF BF16 | Apache 2.0 | Modelo original sin cuantizar; requiere más memoria |
| Ornith-1.5-9B-GGUF (variantes FAST y LEAN) | 8,95B | No disponible | GGUF ftype 104 / 106 | Apache 2.0 | Más rápidas y pequeñas, menor número de bits |
| Cuantizaciones GGUF estándar Q4_0 de modelos de 9B | Aproximadamente 9B | Depende del modelo | GGUF mainline | Depende del modelo | Compatibles con llama.cpp, Ollama y LM Studio; sin FP4 nativo AMD |

No se dispone de datos de benchmarks comparativos frente a modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: los tipos `Q4_0_ROCMFP4_*` y `Q*_0_ROCMFPX*` no existen en llama.cpp mainline; el modelo no cargará en Ollama, LM Studio ni builds estándar.
- Hardware específico: las métricas y la optimización están ligadas a gfx1151 (Strix Halo); no hay evidencia de funcionamiento en otras GPU AMD o NVIDIA.
- Sin decodificación especulativa: no se publican pesos MTP ni drafter GGUF, pese a que `config.json` declara `mtp_num_hidden_layers: 1`.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual más allá de tres comprobaciones puntuales; no debe asumirse robustez en dominios especializados.
- Idiomas: no se dispone de información sobre cobertura lingüística; no se recomienda asumir soporte multilingüe amplio sin validación.
- Sesgos: no se han publicado análisis de sesgos del modelo base ni de esta cuantización.
- Tool calling: 7/8 aciertos implica una tasa de fallo no despreciable; conviene validar y reintentar las llamadas en producción.
- Trazabilidad: es una cuantización de terceros (kingjones777), no oficial de ornith-ai; la licencia Apache 2.0 se hereda del modelo base, pero la calidad de la conversión depende del autor.
- Adopción limitada: 33 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kingjones777/Ornith-1.5-9B-ROCmFP4-COHERENT-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- GGUF del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentación de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
