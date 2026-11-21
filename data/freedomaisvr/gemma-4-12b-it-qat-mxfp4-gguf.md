# FreedomAISVR/Gemma-4-12B-it-QAT-MXFP4-GGUF

## Resumen

Gemma-4-12B-it-QAT-MXFP4-GGUF es una cuantización de 4 bits en formato GGUF del modelo oficial Gemma 4 12B Instruct QAT de Google, publicada por el usuario FreedomAISVR. El modelo base es `google/gemma-4-12B-it-qat-q4_0-unquantized`, la versión Quantization-Aware Training que Google entrenó para tolerar la pérdida de precisión de una cuantización de 4 bits. Esta reconstrucción aplica MXFP4, el formato microscaled FP4 definido por Open Compute Project, en lugar del Q4_0 original, manteniendo las normas en F32 y la matriz de embeddings en Q8_0.

El resultado es un archivo de 6,88 GB con 11.907.350.576 parámetros y 4,62 bits por parámetro efectivos, que incluye un proyector de visión separado de 175 MB. Está pensado para ejecutarse en llama.cpp sobre GPUs Blackwell (SM120a) y cubre ventanas de contexto de 128K y 256K con caché KV en Q8_0.

Su relevancia práctica es doble: por un lado demuestra que un modelo multimodal de 12B puede caber y funcionar con comodidad en una GPU de consumo de 16 GB (RTX 5060 Ti) con contexto largo; por otro, documenta con mediciones reproducibles cómo el rendimiento en este régimen está dominado por la longitud de contexto y no por los parámetros de tuning habituales (ubatch, hilos), lo que contradice buena parte del consejo publicado para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), multimodal con proyector de visión; 49 capas con atención SWA (sliding window attention) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K y 256K verificados (131.072 y 262.144 tokens) |
| Tipos de cuantizacion | MXFP4 (4 bits E2M1 con escalado E8M0 por cada 32 valores), embeddings en Q8_0, normas y sesgos en F32, caché KV en Q8_0 |
| Idiomas soportados | inglés y multilingüe (según tags del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (667 tensores: 328 MXFP4, 338 F32, matriz de embeddings Q8_0) |
| Bits por parámetro (global) | 4,62 |
| Tamaño del archivo de texto | 6.879.049.504 B (6,88 GB) |
| Proyector de visión | `mmproj-gemma-4-12b-it-qat.gguf`, 175.115.616 B (175 MB), F32/BF16 |
| Plantilla de chat | Plantilla canónica de Google para Gemma 4, publicada el 2026-07-09 |
| Runtime verificado | llama.cpp b1868 (`4fea119d`), CUDA 13.2 |

## Arquitectura y entrenamiento

El modelo base es un transformer Gemma 4 de aproximadamente 12B parámetros con 49 capas, que combina atención completa con capas de sliding window attention (la caché KV reserva 262.144 celdas no SWA y 1.536 celdas SWA). La variante QAT significa que Google aplicó quantization-aware training durante el ajuste, de modo que los pesos ya están preparados para soportar cuantización de 4 bits sin el deterioro típico de un post-training quantization convencional. Sobre esa base, esta publicación reconstruye los tensores en MXFP4, un formato de 4 bits con microescalado: valores E2M1 agrupados de 32 en 32 con un factor de escala E8M0 (potencia de dos). Las normas y sesgos se mantienen en F32 porque, según el autor, cuantizarlos aporta poco tamaño y cuesta precisión, y la matriz de embeddings (262.144 × 3.840) se conserva en Q8_0 porque el 4 bits es un mal intercambio en esa capa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada. La innovación técnica destacable de esta publicación no es el entrenamiento sino el empaquetado: un GGUF híbrido con 328 tensores MXFP4 reales (sin trucos híbridos), proyector de visión en F32/BF16 byte-idéntico al oficial de Google (sha256 `cb018338…`) y una plantilla de chat actualizada que corrige bucles de tool calling, cierre de turnos y ordenación del contenido de thinking.

## Capacidades

- Generación de texto conversacional con plantilla de chat canónica de Gemma 4.
- Razonamiento multi-turno y contenido de tipo thinking con ordenación corregida en la plantilla.
- Tool calling / function calling: la plantilla publicada el 2026-07-09 corrige específicamente los bucles de llamadas a herramientas.
- Visión multimodal: OCR verificado sobre imagen de prueba con cinco líneas transcritas exactamente y aritmética confirmada.
- Ventana de contexto larga: recuperación de un hecho enterrado al ~60% de profundidad en prompts de 127.740 y 255.396 tokens, con respuesta correcta en ambos casos.
- Capacidades multilingües según los tags del repositorio (inglés y multilingüe), sin detalle de idiomas concretos.
- Compatible con endpoints (`endpoints_compatible` en los tags), lo que facilita su integración en servicios de inferencia.

## Casos de uso

- Procesamiento de documentos largos en una sola pasada: con 128K tokens de contexto y recuperación verificada a profundidad, el modelo puede resumir o extraer datos de contratos, informes o expedientes completos sin fragmentación, manteniendo 1.235 t/s de prompt en una RTX 5060 Ti.
- Digitalización y extracción de datos de imágenes: el OCR verificado sobre cinco líneas con números de parte y lotes lo hace adecuado para pipelines de captura de albaranes, etiquetas o formularios escaneados, usando `llama-mtmd-cli` con `--jinja`.
- Asistente conversacional con herramientas: la plantilla corregida para tool calling permite construir agentes que consulten APIs o bases de datos sin caer en bucles de llamadas, un fallo frecuente en plantillas antiguas.
- Análisis de repositorios o bases de código de tamaño medio: 128K tokens cubren varios miles de líneas; el modelo puede responder preguntas sobre arquitectura o localizar funciones concretas en un monorepo pequeño.
- Despliegue en estación de trabajo con GPU de consumo: con 9.794 MiB usados a 256K y 5.379 MiB libres en una RTX 5060 Ti de 16 GB, cabe holgadamente y deja margen para otras tareas gráficas o para subir el contexto.
- Inferencia en local con requisitos de privacidad: al ejecutarse íntegramente en llama.cpp sobre hardware propio, es apto para entornos donde los datos no pueden salir de la máquina (legal, sanitario, industrial).
- Evaluación comparativa de cuantizaciones: sirve como referencia reproducible para medir el impacto de MXFP4 frente a Q4_0 en la misma familia de modelos, con cifras de throughput y VRAM documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sí se incluyen mediciones de inferencia reproducibles en llama.cpp b1868 sobre RTX 5060 Ti 16 GB (Blackwell, SM120a), CUDA 13.2, Ryzen 7 5700X y 64 GB de RAM:

| Contexto | Tokens de prompt | Prompt t/s | Generación t/s |
|---|---|---|---|
| 128K (`-c 131072`) | 127.740 | 1.235 | 28,2 |
| 256K (`-c 262144`) | 255.396 | 767 | 20,5 |

| Escenario | Configuración | Prompt t/s | Generación t/s |
|---|---|---|---|
| 128K, tuning | `-ub 1024 -b 2048 -fa on -t 8` | 1.235,1 | 28,2 |
| 128K, defaults | `-ub 512`, sin `-fa`, sin `-t` | 1.199,2 | 28,5 |
| 256K, tuning | `-ub 1024 -b 2048 -fa on -t 8` | 767,4 | 20,5 |
| 256K, defaults | `-ub 512`, sin `-fa`, sin `-t` | 756,0 | 20,5 |

| Profundidad | ubatch | Prompt t/s | Generación t/s |
|---|---|---|---|
| 125K | 512 | 753,38 | 29,30 |
| 125K | 1024 | 761,75 | 29,28 |
| 125K | 2048 | 754,60 | 29,20 |
| 250K | 512 | 436,55 | 20,94 |
| 250K | 1024 | 438,74 | 20,56 |
| 250K | 2048 | 435,36 | 20,65 |

| Contexto corto (`pp8192`/`tg128`) | Prompt t/s | Generación t/s |
|---|---|---|
| ubatch 512 | 2.867 | 51,69 |
| ubatch 1024 | 2.936 | 51,65 |
| ubatch 2048 | 2.812 | 51,73 |
| ubatch 4096 | 2.812 | 51,66 |

| Hilos (generación pura) | Generación t/s |
|---|---|
| 2 | 50,66 |
| 4 | 49,81 |
| 8 | 49,99 |
| 16 | 50,11 |

## Requisitos de hardware

- VRAM a 256K con KV Q8_0: 9.794 MiB en total (6.545 MiB de pesos, 2.431 MiB de caché KV, 818 MiB de buffer de cómputo), con 5.379 MiB libres sobre 15.174 MiB disponibles.
- VRAM a 128K: la asignación de contexto se reduce a aproximadamente 1,2 GB, dejando más de 6 GB libres.
- GPU verificada: RTX 5060 Ti 16 GB (Blackwell, SM120a), con las 49 capas offloaded a GPU.
- GPU recomendadas: cualquier GPU con al menos 10 GB de VRAM para 256K (RTX 4080/4090, RTX 5070 Ti/5080, A100, H100); 8 GB bastan para contexto corto con cuantización de caché.
- Cabe en GPU de consumo: sí, verificado en RTX 5060 Ti de 16 GB; previsiblemente también en RTX 4070 Ti Super, 4080 y 4090.
- Despliegue: llama.cpp (versión b1868 o superior recomendada), con `llama-mtmd-cli` para visión y `--jinja` para la plantilla de chat; flash attention se activa automáticamente al usar caché KV cuantizada.
- Throughput: 51,7 t/s de generación en contexto corto; 28,2 t/s a 128K; 20,5 t/s a 256K. El procesamiento de prompt cae un 85% al pasar de contexto corto a 250K de profundidad (de ~2.870 a ~437 t/s).
- El número de hilos es irrelevante para la generación (1,7% de variación entre 2 y 16 hilos) cuando todas las capas están en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-12B-it-QAT-MXFP4-GGUF (este) | 11,9B | 128K/256K | MXFP4 + Q8_0 | Apache 2.0 | GGUF en HF, 285 descargas |
| Gemma-4-12B-it QAT Q4_0 (base de Google) | 11,9B | no disponible | Q4_0 | Apache 2.0 | Pesos sin cuantizar en HF |
| Otras cuantizaciones GGUF de Gemma 4 12B | 11,9B | según build | Q4_K_M, Q5_K_M, etc. | Apache 2.0 | no disponible en la información |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. La ventaja diferencial de esta build es el uso de MXFP4 real con embeddings en Q8_0 y un proyector de visión byte-idéntico al oficial, junto con mediciones de throughput públicas.

## Limitaciones y advertencias

- El proyector de visión debe mantenerse en F32/BF16: convertirlo a F16 rompe la visión, según advierte el autor.
- El rendimiento se degrada fuertemente con la profundidad de contexto: −85% en prompt y −59% en generación al pasar de contexto corto a 250K, por lo que conviene elegir la ventana mínima suficiente.
- El tuning de ubatch apenas aporta a profundidad real (~1% a 128K, ~0,5% a 256K); el consejo extendido de subir ubatch a 4096 no se cumple en esta GPU y de hecho regresa el throughput de prompt.
- La caché KV cuantizada exige flash attention en llama.cpp; sin ella no es posible usar Q8_0 en la V cache.
- El modelo es una cuantización de terceros: no procede de Google y su calidad depende de la fidelidad de la reconstrucción respecto al QAT oficial; conviene validar en el dominio de uso antes de producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de 12B, no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas: solo se declaran inglés y multilingüe sin listado; el rendimiento en castellano no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus términos deben respetarse igualmente.
- Repositorio con 0 likes y 285 descargas: comunidad pequeña, sin garantía de mantenimiento continuado.
- La plantilla de chat publicada el 2026-07-09 es necesaria para evitar bucles de tool calling; usar plantillas antiguas puede degradar el comportamiento agéntico.

## Enlaces

- Hugging Face: https://huggingface.co/FreedomAISVR/Gemma-4-12B-it-QAT-MXFP4-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- llama.cpp (runtime verificado, build b1868): https://github.com/ggml-org/llama.cpp
- Especificación MXFP4 (OCP microscaling formats): no disponible en la información proporcionada
- Paper de Gemma 4: no disponible en la información proporcionada
- Blog oficial de Google sobre Gemma 4: no disponible en la información proporcionada
