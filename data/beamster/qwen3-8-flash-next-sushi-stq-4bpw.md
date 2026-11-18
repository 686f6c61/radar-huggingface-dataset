# beamster/Qwen3.8-Flash-Next-Sushi-STQ-4bpw

## Resumen

Qwen3.8-Flash-Next-Sushi-STQ-4bpw es un empaquetado cuantizado del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario beamster y optimizado exclusivamente para sushi, un motor de inferencia nativo para Apple Silicon derivado de mlx-serve. El pack emplea STQ (Sushi Trellis Quant) con la tabla de codebook SPEC1 y consigue una media de 4,15 bits por peso en los expertos enrutados, manteniendo el tronco denso a 6 bits y algunas partes críticas (embeddings, hyper-connections, proyecciones de compuerta GDN y la parte densa de la capa MTP) a 8 bits afines. El objetivo declarado es un Mac de 96 GB de memoria unificada; en un Mac de 64 GB no cabe.

El modelo base es un transformer de tipo MoE con arquitectura híbrida (atención más GatedDeltaNet), 35.462.486.419 parámetros totales según los safetensors, torre de visión Qwen3-VL ViT, cabeza MTP y una tabla de n-gram embeddings en bf16 que se lee desde el SSD sin cargarse en memoria de GPU. El contexto alcanza 1.048.576 tokens gracias a YaRN x4 aplicado sobre los 262.144 nativos.

Su relevancia es doble: por un lado demuestra que es posible servir un MoE multimodal de 35B en hardware de consumo Apple con una pérdida de calidad muy contenida (KLD de 0,0111 frente al checkpoint BF16, con un 96,35 % de acuerdo top-1); por otro, ilustra la fragmentación creciente del ecosistema de cuantización, ya que este pack no carga en transformers, vLLM, mlx-lm ni exllamav3, y exige sushi v1.7.0 o superior sobre macOS 26.2 o posterior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención y GatedDeltaNet (GDN), torre de visión Qwen3-VL ViT, cabeza MTP e indexer; hyper-connections |
| Parámetros totales | 35.462.486.419 |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (YaRN x4 sobre 262.144 nativos) |
| Tipos de cuantización | STQ (Sushi Trellis Quant) con codebook SPEC1: 4-5 bits en expertos enrutados (media 4,15 bits/peso), 6 bits en tronco denso, 8-bit affine en embeddings, hyper-connections, compuertas GDN y parte densa de MTP; n-gram table en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiqueta `other`), con condiciones para servicios comerciales a gran escala |
| Formato de pesos | safetensors (pack propietario de sushi); n-gram table en `ngram_table.bin` (bf16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con 48 capas y 512 expertos enrutados por capa, complementado por una capa MTP (multi-token prediction). La arquitectura incorpora componentes híbridos: proyecciones GatedDeltaNet (GDN) junto a mecanismos de atención clásicos, un indexer y hyper-connections, además de una torre de visión basada en Qwen3-VL ViT que habilita entrada de imagen y vídeo. La tabla de n-gram embeddings en bf16 actúa como memoria externa leída desde SSD, lo que reduce la presión sobre la memoria unificada.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF o DPO): no disponible. Lo que sí está documentado es el proceso de cuantización: los expertos enrutados (48 capas x 512, más la capa MTP) se almacenan con STQ y codebook SPEC1 a 4 o 5 bits por banco de expertos, mientras que el tronco denso (atención, proyecciones GDN, indexer, expertos compartidos, lm_head) se cuantiza a 6 bits con la misma técnica. La evaluación de calidad se realizó con KV en bf16, estado de GatedDeltaNet en f32 y MTP desactivado, comparando la divergencia KL frente al checkpoint BF16 en ocho categorías.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de hasta 1.048.576 tokens.
- Entrada multimodal de imagen y vídeo mediante la torre Qwen3-VL ViT incluida en el pack.
- Razonamiento, matemáticas y generación de código, con pérdidas KL especialmente bajas en código (0,0032) y matemáticas (0,0025).
- Predicción multi-token (MTP) para decodificación especulativa, incluida en el pack.
- Capacidades multilingües: la evaluación reporta una categoría específica con KLD de 0,0116, aunque la lista de idiomas soportados no está detallada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre Mac: con KLD de 0,0032 en la categoría de código, el pack es adecuado para autocompletado, refactorización y explicación de fragmentos en un entorno de desarrollo sin conexión, aprovechando la memoria unificada de un Mac de 96 GB.
- Análisis de documentos largos: la ventana de 1.048.576 tokens permite ingerir contratos, informes o bases de código completas en una sola pasada, útil para auditoría y resumen en estaciones de trabajo Apple.
- Procesamiento de imagen y vídeo en local: la torre Qwen3-VL ViT incluida permite describir imágenes, extraer texto de capturas o resumir clips sin enviar datos a la nube, relevante para sectores con requisitos de privacidad.
- Razonamiento matemático asistido: la baja pérdida en la categoría de matemáticas (0,0025) lo hace apto para tutoría, verificación de cálculos y generación de problemas con solución paso a paso.
- Investigación sobre cuantización: el pack sirve como referencia reproducible para estudiar el impacto de STQ frente a EXL3 en un MoE de 35B, con métricas KLD por categoría publicadas.
- Prototipado de asistentes conversacionales multilingües: la categoría multilingual con KLD de 0,0116 permite construir demos de atención al cliente en varios idiomas sobre hardware Apple, sin depender de GPUs dedicadas.
- Experimentación con decodificación especulativa: la cabeza MTP incluida facilita probar técnicas de aceleración de inferencia en el motor sushi.

## Benchmarks y rendimiento

Calidad medida como divergencia KL frente al checkpoint BF16, con KV en bf16, estado GatedDeltaNet en f32 y MTP desactivado, sobre 2 prompts de 512 tokens por categoría, puntuados hasta el primer EOS. Menor es mejor.

| Pack | KLD | Acuerdo top-1 | Memoria pico GPU |
|---|---|---|---|
| Sushi-STQ-4bpw | 0,0111 | 96,35 % | 69,4 GB |
| Sushi-4bpw | 0,0138 | 96,27 % | no disponible |
| Sushi-STQ-2.75bpw rev. 2.0 | 0,0250 | 94,73 % | 48,5 GB |

| Pack | Código | Matemáticas | Razonamiento | Diseño | Wikitext | Multilingüe | Relato | Ciencia |
|---|---|---|---|---|---|---|---|---|
| Sushi-STQ-4bpw | 0,0032 | 0,0025 | 0,0099 | 0,0081 | 0,0468 | 0,0116 | 0,0151 | 0,0051 |
| Sushi-4bpw | 0,0041 | 0,0028 | 0,0126 | 0,0114 | 0,0526 | 0,0145 | 0,0189 | 0,0073 |
| Sushi-STQ-2.75bpw 2.0 | 0,0050 | 0,0063 | 0,0198 | 0,0156 | 0,0948 | 0,0226 | 0,0438 | 0,0164 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: objetivo declarado de 96 GB en Mac; memoria pico de GPU de 69,4 GB durante la evaluación de calidad. No cabe en un Mac de 64 GB (para ese caso el autor remite al pack de 2,75 bpw, con 48,5 GB de pico).
- Espacio en disco: aproximadamente 160 GiB, de los cuales 64,8 GiB son pesos y 95,4 GiB corresponden a la tabla de n-gram, leída desde SSD.
- GPU recomendadas: Apple Silicon con macOS 26.2 o posterior; no se documentan GPUs NVIDIA o AMD compatibles.
- GPU de consumo: sí, en Macs de 96 GB de memoria unificada; no en configuraciones de 64 GB o inferiores.
- Opciones de despliegue: exclusivamente sushi v1.7.0 o superior. No carga en transformers, vLLM, mlx-lm ni exllamav3.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KLD vs BF16 | Licencia | Despliegue |
|---|---|---|---|---|---|
| Sushi-STQ-4bpw (este pack) | 35,46 B | 1.048.576 | 0,0111 | Qwen Community 1.0 | Solo sushi en Apple Silicon |
| Sushi-4bpw (EXL3) | 35,46 B (base) | no disponible | 0,0138 | Qwen Community 1.0 | sushi |
| Sushi-STQ-2.75bpw rev. 2.0 | 35,46 B (base) | no disponible | 0,0250 | Qwen Community 1.0 | sushi, Mac de 64 GB |
| Qwen/Qwen3.8-Flash-Next (BF16) | 35,46 B | 262.144 nativos | referencia | Qwen Community 1.0 | transformers, vLLM, etc. |

## Limitaciones y advertencias

- Dependencia total de sushi: el pack no es portable a otros motores de inferencia, lo que limita su uso a Apple Silicon con macOS 26.2 o posterior.
- Requisito de memoria elevado: 96 GB de memoria unificada como mínimo práctico; en Macs de 64 GB hay que recurrir al pack de 2,75 bpw con mayor pérdida de calidad.
- Huella en disco de 160 GiB, dominada por la tabla de n-gram de 95,4 GiB que debe residir en SSD.
- La evaluación de calidad se basa en solo 2 prompts de 512 tokens por categoría, por lo que las medias por categoría son orientativas; el autor recomienda clasificar los packs por el KLD global.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el comportamiento del modelo base.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no detallados, aunque existe una categoría de evaluación multilingüe.
- Licencia Qwen Community 1.0 con condiciones específicas para servicios comerciales a gran escala; revisar `LICENSE` antes de un despliegue comercial.
- El repositorio registra 1 descarga y 0 likes en el momento de la consulta, lo que indica una validación comunitaria aún muy limitada.

## Enlaces

- Hugging Face del pack: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-STQ-4bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack de 2,75 bpw para Mac de 64 GB: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-STQ-2.75bpw
- Pack Sushi-4bpw (EXL3): https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-4bpw
- Motor sushi: https://github.com/beamivalice/sushi
- Documentación de uso de sushi: https://github.com/beamivalice/sushi/blob/main/docs/usage.md
- mlx-serve (proyecto del que deriva sushi): https://github.com/ddalcu/mlx-serve
