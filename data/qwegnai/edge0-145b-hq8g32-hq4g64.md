# qwegnai/Edge0-145B-hq8g32-hq4g64

## Resumen

Edge0-145B-hq8g32-hq4g64 es un paquete de pesos cuantizados del modelo Edge0-145B-NVFP4, publicado por el usuario qwegnai para su uso exclusivo con el motor de inferencia Qwegn (version 0.20.0 o superior). No se trata de un checkpoint en safetensors, GGUF o MLX, sino de un contenedor propietario QWP1 acompañado de una tabla de embeddings por capa basada en n-gramas (QNGRAM v3). El paquete está diseñado específicamente para ejecutarse en Apple Silicon con memoria unificada, aprovechando Metal, y ocupa 83,13 GiB en disco (56,00 GiB de backbone más 27,13 GiB de tabla PLE).

El modelo subyacente es un MoE híbrido de 48 capas que combina 12 capas de Query-Aware Sparse Attention (QSA) con 36 capas Gated-DeltaNet (GDN), 512 expertos (10 enrutados más 1 compartido activos), conexiones Hyper-Connections de 4 ramas, embeddings por capa de 4-gramas, cabeza MTP y torre de visión. La cuantización aplicada es mixta: HQ8_G32 en el tronco denso, HQ4_G64 en los expertos enrutados del MoE y BF16 en normas, routers y embeddings, con una tabla PLE cuantizada en VQ2_G32.

Su relevancia actual radica en que demuestra la viabilidad de ejecutar un modelo de 145B con contexto nativo de 262.144 tokens (cualificado hasta 1.048.576 tokens) en un único Mac de 128 GB de memoria unificada, con decodificación especulativa y latencias de TTFT en caché de 8 ms. Es un caso de interés para investigadores que trabajan en inferencia local de gran escala sobre hardware de consumo profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido de 48 capas: 12 QSA + 36 GDN, 512 expertos (10 enrutados + 1 compartido activo), 4 ramas Hyper-Connections, PLE de 4-gramas, cabeza MTP, torre de visión |
| Parametros totales | 145B (según nombre del modelo base; no se detalla desglose exacto) |
| Parametros activos | 10 expertos enrutados + 1 compartido por token (no se indica el número exacto de parámetros activos) |
| Longitud de contexto | 262.144 tokens nativo; cualificado hasta 300K, 320K, 512K y 1.048.576 tokens |
| Tipos de cuantizacion | HQ8_G32 (tronco denso), HQ4_G64 (expertos MoE enrutados), BF16 (normas, routers, embeddings), VQ2_G32 (tabla PLE) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | QWP1 (model.qwp) + QNGRAM v3 (assets/ngram.bin) + QLSA0001 sidecar; no compatible con safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer híbrido MoE que alterna dos tipos de capas: 12 capas de Query-Aware Sparse Attention (QSA) y 36 capas de Gated-DeltaNet (GDN), una variante de atención lineal con estado recurrente. El MoE cuenta con 512 expertos, de los cuales 10 enrutados más 1 compartido se activan por token. Incorpora además conexiones Hyper-Connections de 4 ramas, una cabeza de Multi-Token Prediction (MTP) que habilita decodificación especulativa, y una torre de visión para entrada multimodal.

Una innovación destacable es el uso de Per-Layer Embeddings (PLE) basados en n-gramas de 4 tokens, materializados en una tabla QNGRAM v3 VQ2_G32 de 320.001.536 filas × 160 dimensiones (27,13 GiB). Esta tabla se puede mantener residente en GPU o transmitir desde NVMe con `--stream-ngrams`, lo que reduce el footprint de memoria de 85,36 GiB a 58,30 GiB en contexto de 4K. El paquete se generó a partir de Edge0-145B-NVFP4 mediante desquantización de bloques NVFP4 en dos niveles (f8_e4m3 + f32) y recuantización con Hadamard mixta. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo original.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto muy largo (hasta 1M de tokens cualificados).
- Razonamiento y código: evaluaciones internas Code-10 y Core-10 al 90% (9/10) con contexto de 16.384 tokens.
- Capacidad multimodal de visión mediante torre dedicada (cargable u omitible con `--no-load-vision`).
- Decodificación especulativa mediante cabeza MTP, con aceleración de hasta 1,76× en servidor.
- Soporte de agentes: 7/8 tareas agenticas superadas en la suite llmprobe.
- Recuperación de información en contexto largo: 3/3 needles en pruebas passkey a 16K, 128K y 300K.
- Ejecución concurrente multi-stream: 102,6 tok/s agregados con 4 streams.
- No se especifican capacidades de tool calling ni function calling en la información disponible.
- Idiomas soportados no disponibles.

## Casos de uso

- Análisis de repositorios completos: con 262K tokens nativos y hasta 1M cualificados, el modelo puede ingerir bases de código extensas y responder preguntas sobre ellas sin truncamiento, manteniendo 1.885 tok/s de prefill a 300K.
- Asistentes de investigación documental: la recuperación passkey 3/3 a 300K permite construir sistemas de preguntas y respuestas sobre corpus de cientos de miles de tokens, con TTFT en caché de 8 ms para consultas repetidas sobre el mismo prefijo.
- Inferencia local en estación de trabajo Mac: con 85,36 GiB planificados en un Mac de 128 GB, un desarrollador puede ejecutar un modelo de 145B en local sin infraestructura de GPU dedicada, usando `qwg serve` con KV en q4.
- Procesamiento por lotes en modo bajo consumo: con `--stream-ngrams` el footprint baja a 58,30 GiB a 4K y 69,73 GiB a 1M, lo que permite ejecutar el modelo en Macs de 64-96 GB transmitiendo la tabla PLE desde NVMe.
- Generación de código asistida con contexto de proyecto: los resultados del 90% en Code-10 a 16K sugieren utilidad en autocompletado y refactorización sobre archivos y módulos extensos, integrável en flujos de edición local.
- Evaluación de agentes autónomos: la suite agentica (7/8) y la decodificación especulativa a 116,4 tok/s en servidor lo hacen adecuado para bucles de razonamiento multi-paso con herramientas, siempre que se implemente el tool calling en la capa de aplicación (no confirmado en el modelo).
- Servicio multiusuario ligero: los 102,6 tok/s agregados con 4 streams concurrentes permiten desplegar un endpoint interno para un equipo pequeño sobre un único Mac de 128 GB.
- Procesamiento de documentos con imágenes: la torre de visión permite extraer información de capturas, diagramas o PDFs renderizados, aunque puede desactivarse para ahorrar memoria.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en Apple M5 Max (128 GB, GPU de 40 núcleos, 585 GB/s) con `--kv-mode q4 --temperature 0`:

| Metrica | Resultado |
|---|---|
| Prefill 4K / 8K | 2.572,0 / 2.568,4 tok/s |
| Prefill 32K / 65K / 131K / 256K | 2.291,8 / 2.132,3 / 2.051,7 / 1.899,3 tok/s |
| TTFT en frío / en caliente (caché de prefijo) | 0,28 s / 8 ms (119,8×) |
| Decodificación estándar | 44,19–44,74 tok/s |
| Decodificación especulativa (MTP) | 67,59 tok/s CLI; 80,9 tok/s novedoso; 116,4 tok/s (1,76×) en servidor |
| Agregado 4 streams concurrentes | 102,6 tok/s |
| Conformidad / Capacidad / Fidelidad / Agéntico | 140/141 (99,3%) / 100% / 36/36 / 7/8 |
| Code-10 / Core-10 a 16.384 | 9/10 (90%) / 9/10 (90%) |
| Passkey 3 needles a 16K / 128K / 300K | 3/3 (100%) a 2.507,8 / 1.918,7 / 1.885,5 tok/s |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 85,36 GiB planificados en modo GPU-residente por defecto (KV q4, 4K, sin visión); 58,30 GiB con `--stream-ngrams`; 102,99 GiB para 1M tokens con KV q8 y PLE en GPU.
- Hardware objetivo: Apple Silicon con 128 GB de memoria unificada; el rendimiento publicado corresponde a un M5 Max (Mac17,6, GPU de 40 núcleos, 585 GB/s).
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en Macs de 32-64 GB en modo residente; el modo streaming a 4K (58,30 GiB) requiere al menos 64 GB.
- Despliegue: exclusivamente mediante el motor Qwegn v0.20.0+ (`qwg pull`, `qwg serve`); no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: 89,3 GB de repositorio; se recomienda NVMe para el modo streaming de la tabla PLE.
- Latencia: TTFT en caliente de 8 ms; decodificación de 44 tok/s estándar y hasta 116,4 tok/s con MTP en servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Edge0-145B-hq8g32-hq4g64 | 145B (MoE) | 262K nativo, 1M cualificado | Apache-2.0 | QWP1 / Qwegn, Apple Silicon |
| Edge0-145B-NVFP4 (base) | 145B (MoE) | 262K nativo | no disponible | NVFP4, orientado a GPU NVIDIA |
| Alternativas de 100B+ en formato abierto | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada. La comparación principal posible es con su modelo base Edge0-145B-NVFP4, del que este paquete es una recuantización para Apple Silicon; el paquete no es portable a otros motores ni a GPUs NVIDIA.

## Limitaciones y advertencias

- Dependencia total del motor Qwegn: los pesos QWP1 y QNGRAM v3 no cargan en safetensors, GGUF, MLX, vLLM, llama.cpp ni Ollama, lo que limita la portabilidad y crea dependencia de un único proyecto.
- Requisito de hardware restrictivo: 128 GB de memoria unificada para el modo residente; el modo streaming exige NVMe rápido y al menos 64 GB.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe sin evaluación propia.
- Sesgos y alucinaciones: no se documentan análisis de sesgo ni tasas de alucinación; los benchmarks internos (Code-10, Core-10, llmprobe) son suites propias del autor y no equivalentes a evaluaciones estándar de la industria.
- Tool calling no confirmado: la model card no especifica soporte nativo de function calling, pese a las capacidades agenticas medidas.
- Contexto cualificado más allá de la tarjeta: las pruebas a 300K-1M son del autor y con 3 needles; la degradación en tareas complejas a esas longitudes no está evaluada.
- Licencia Apache-2.0 declarada, pero la licencia del modelo base Edge0-145B-NVFP4 no se detalla en la información disponible; conviene verificar la cadena de licencias antes de uso comercial.
- Repositorio sin descargas ni likes y creado en noviembre de 2026: madurez y soporte de la comunidad no verificables.
- Sin información sobre el dataset de entrenamiento ni sobre etapas de alineación (RLHF/DPO) del modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/qwegnai/Edge0-145B-hq8g32-hq4g64
- Modelo base: https://huggingface.co/Edge0/Edge0-145B-NVFP4
- Repositorio del motor Qwegn: https://github.com/qwegnai/qwegn
