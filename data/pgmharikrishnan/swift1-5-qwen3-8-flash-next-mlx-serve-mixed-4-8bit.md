# pgmharikrishnan/Swift1.5-Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit

## Resumen

Swift1.5-Qwen3.8-Flash-Next en su variante MLX-Serve mixed 4/8-bit es un empaquetado cuantizado del fine-tune `ukisai/Swift1.5-Qwen3.8-Flash-Next`, construido sobre la arquitectura de previsualización Qwen4 (`model_type: qwen4_exp`). Lo publica el usuario `pgmharikrishnan` mediante la herramienta `mlx-serve`, orientado a ejecución local en Apple Silicon. El modelo combina una arquitectura MoE con atención dispersa, una tabla de n-gramas de 51B parámetros para embedding y una torre de visión que acepta imagen y vídeo, además de una cabeza MTP (multi-token prediction) para decodificación especulativa.

El paquete pesa 107,3 GB en el repositorio y requiere unos 70,1 GiB residentes en memoria, lo que lo sitúa en el territorio de Macs con 128 GB de RAM unificada. La receta de cuantización no es uniforme: los expertos enrutados van a 4 bits, mientras que atención, GDN, hiperconexiones, indexador, expertos compartidos y `lm_head` se mantienen a 8 bits, y routers, normas, convoluciones y estado SSM quedan en bf16. La tabla de n-gramas se almacena aparte en `ngram_table.bin` (32 GiB) y se mapea en memoria sin llegar a residir en GPU.

Su relevancia práctica radica en que permite servir un modelo de 133B parámetros con visión y contexto de 131.072 tokens en hardware de consumo Apple, con velocidades de prefill que mejoran notablemente a las del checkpoint base en ventanas largas (hasta +80,9% a 64K) y decodificación estable hasta 64K. La licencia es Qwen Community License 1.0, con las restricciones que esta impone.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa, tabla de n-gramas, MTP y torre de visión (`qwen4_exp`) |
| Parámetros totales | 133.195.562.899 (133,2B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens (ventana servida en el benchmark: 102.400) |
| Tipos de cuantización | Mixta 4/8-bit (expertos 4-bit grupo 64; atención/GDN/hiperconexiones/indexador/expertos compartidos/lm_head 8-bit grupo 64; embed_tokens 4-bit; tabla n-gram 4-bit grupo 32; routers/normas/convs/SSM en bf16; torre de visión en bf16 denso) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | safetensors (112 archivos) más `ngram_table.bin` (32 GiB, formato safetensors) y `model-vision.safetensors` (0,9 GiB) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de `ukisai` sobre Qwen3.8-Flash-Next, que emplea la arquitectura de previsualización Qwen4. Esta combina mezcla de expertos (MoE) con atención dispersa, hiperconexiones e indexador, y añade una tabla de n-gramas de 51B parámetros que actúa como mecanismo de embedding a nivel de token. Incluye además una cabeza MTP para decodificación especulativa y una torre de visión que procesa imagen y vídeo. El checkpoint cuenta con 512 expertos enrutados distribuidos en 48 capas, que concentran aproximadamente 121B de los 133,2B parámetros totales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el fine-tune Swift1.5. La innovación técnica destacable del empaquetado es la gestión de la tabla de n-gramas: en lugar de cargarla como 128 tensores cuantizados en la GPU (lo que añadiría unos 32 GiB residentes), se mmap-ea `ngram_table.bin` y, por cada token, se desquantizan en CPU las 16 filas necesarias (16 × 80 bytes) antes de subir solo el vector resultante de 2560 dimensiones. El coste pasa a ser page cache del sistema operativo, evictable según necesidad. Adicionalmente, cada RMSNorm `(1 + w)` tiene el `+1` plegado en el peso almacenado, las convoluciones depthwise se transpongan a `[C, K, 1]` de MLX y `experts.gate_up_proj` se divide en `switch_mlp.gate_proj` y `up_proj`.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso.
- Procesamiento de imagen y vídeo mediante la torre de visión incluida en el paquete.
- Tool calling y function calling (100% en la suite de capacidades del benchmark, tanto en el modelo base como en Swift1.5).
- Razonamiento estructurado y salida JSON (62,5% en la suite, mejorando al base).
- Decodificación especulativa mediante la cabeza MTP, con 2,43 tokens por paso y 48,3% de aceptación por borrador.
- Capacidad de contexto largo verificada con prueba de aguja (needle) hasta 64K tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos largos en local: con 131.072 tokens de contexto y prefill sostenido a 748 tok/s en la franja de 64K, el modelo permite procesar contratos, informes o expedientes completos en una Mac de 128 GB sin enviar datos a la nube.
- Asistentes con entrada visual: la torre de visión en bf16 (0,9 GiB) permite construir un asistente que reciba capturas de pantalla, diagramas o fotogramas de vídeo y responda con texto, útil para soporte técnico o análisis de interfaces.
- Automatización de flujos con herramientas: el soporte de tool calling al 100% en la suite lo hace apto para orquestar APIs, consultas a bases de datos o pipelines internos mediante function calling.
- Generación de JSON estructurado para integración: con 62,5% en la categoría estructurada, es viable para extracción de entidades y rellenado de formularios, aunque requiere validación de esquema en producción por el problema conocido con las vallas ` ```json `.
- Procesamiento por lotes en estación de trabajo Apple: el modelo cabe en una M4 Max de 128 GB con ~70,1 GiB residentes y ~80-82 GB activos a ventana de 102K, lo que permite ejecutar tareas de resumen o clasificación sin GPU dedicada.
- Investigación y evaluación de arquitecturas Qwen4: al ser un paquete MLX de la arquitectura `qwen4_exp`, sirve para estudiar el comportamiento de atención dispersa, MoE con 512 expertos y MTP en hardware de consumo.
- Prototipado de agentes multi-paso: la combinación de contexto largo estable (44 tok/s de decodificación a 64K) y tool calling permite mantener sesiones de agente prolongadas con historial extenso.

## Benchmarks y rendimiento

Mediciones del autor con `mlx-serve v26.11.1` (build fast), metodología v3, suite de 18 casos, 5 repeticiones, Apple M4 Max 128 GB, ventana servida de 102.400 tokens. Comparativa entre el checkpoint base Flash-Next y el fine-tune Swift1.5:

| Métrica | Flash-Next | Swift1.5 | Delta |
|---|---:|---:|---:|
| Decode tok/s, plain | 54,70 | 53,40 | −2,4% |
| Decode tok/s, best (MTP) | 74,03 | 57,75 | −22,0% |
| Tokens por paso (MTP) | 2,27 | 2,43 | +7,0% |
| Aceptación MTP por borrador | 45,3% | 48,3% | +3,0 pp |
| Aceptados MTP por ronda | 1,39 | 1,65 | +18,7% |
| Prefill tok/s, prompt de 77 tokens | 54,79 | 42,87 | −21,7% |
| Prefill tok/s, 4K | 642,7 | 818,0 | +27,3% |
| Prefill tok/s, 16K | 622,7 | 781,0 | +25,4% |
| Prefill tok/s, 32K | 580,6 | 771,2 | +32,8% |
| Prefill tok/s, 64K | 413,7 | 748,2 | +80,9% |
| Decode tok/s, 4K | 43,28 | 44,74 | +3,4% |
| Decode tok/s, 64K | 27,07 | 44,19 | +63,2% |
| TTFT p50, c1 | 353 ms | 294 ms | −17% |
| TTFT p50, c4 | 909 ms | 760 ms | −16% |
| ITL p95, c4 | 49,7 ms | 40,6 ms | −18% |
| Calidad (18 casos) | 84,4 | 81,2 | −3,1 pts |
| — instrucciones | 100,0 | 62,5 | −37,5 |
| — estructurado | 37,5 | 62,5 | +25,0 |
| — razonamiento | 100,0 | 100,0 | 0 |
| — herramientas | 100,0 | 100,0 | 0 |
| Repetibilidad | 100,0 | 100,0 | 0 |

Datos brutos por franja de contexto (Swift1.5):

| Franja | Tokens de prompt | Decode tok/s | Prefill tok/s | TTFT ms | Needle |
|---:|---:|---:|---:|---:|---|
| 4K | 4.098 | 44,74 | 818,0 | 5.010 | pass |
| 16K | 16.306 | 44,35 | 781,0 | 20.878 | pass |
| 32K | 32.596 | 44,08 | 771,2 | 42.267 | pass |
| 64K | 65.180 | 44,19 | 748,2 | 87.119 | pass |
| 128K | — | — | — | — | rechazado por ventana de 102.400 |

Advertencias del autor: las dos ejecuciones son secuenciales, no intercaladas, y Swift1.5 se ejecutó en último lugar, por lo que el estado de caché de prefijo y page cache difiere. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~70,1 GiB residentes (pesos: 75.303.252.216 bytes) más caché KV; el autor reporta ~80-82 GB activos con ventana de 102K.
- Hardware objetivo: Apple Silicon con 128 GB de memoria unificada (el benchmark se ejecutó en M4 Max 128 GB).
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en configuraciones Apple de 64 GB o menos.
- Despliegue: exclusivamente mediante `mlx-serve` (comando `mlx-serve --model pgmharikrishnan/Swift1.5-Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit --serve`). No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput medidos: TTFT p50 de 294 ms con concurrencia 1 y 760 ms con concurrencia 4; ITL p95 de 40,6 ms a c4; decodificación de 53,4 tok/s en modo plain y 57,75 tok/s con MTP; prefill de 818 tok/s a 4K y 748 tok/s a 64K.
- Coste de caché fría: el prefill de prompts muy largos con caché fría puede pagar hasta ~1 s por cada 8K tokens de lecturas aleatorias en SSD; con caché caliente el coste es nulo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---:|---|---|---|
| Swift1.5-Qwen3.8-Flash-Next MLX mixed 4/8-bit (este) | 133,2B | 131.072 | Qwen Community 1.0 | MLX-Serve, ~70,1 GiB residentes | Fine-tune Swift1.5, incluye visión y MTP |
| Qwen3.8-Flash-Next MLX mixed 4/8-bit (`ddalcu/...`) | no disponible | no disponible | Qwen Community 1.0 | MLX-Serve | Misma receta sin el fine-tune Swift1.5; decodificación MTP más rápida (74,03 tok/s), peor prefill largo |
| `ukisai/Swift1.5-Qwen3.8-Flash-Next` (base sin cuantizar) | no disponible | no disponible | Qwen Community 1.0 | safetensors | Checkpoint original del que deriva este paquete |

No se dispone de datos de benchmarks estándar ni de comparaciones con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Licencia Qwen Community License 1.0: impone restricciones de uso que deben revisarse antes de cualquier despliegue comercial; el paquete es un derivado cuantizado y hereda las condiciones del modelo base y de Qwen3.8.
- Calidad global inferior al checkpoint base en la suite del autor (81,2 frente a 84,4), con una caída notable en instrucciones (62,5 frente a 100,0); el caso `instruction-filter-sort` devolvió `8, 4, 2` en lugar de la respuesta esperada.
- Problema conocido con vallas de código: tanto este paquete como el base generan ` ```json ` en el caso `structured-derived-object`, lo que puede romper parsers estrictos en producción.
- El benchmark es secuencial y no intercalado, con Swift1.5 ejecutado en último lugar; los deltas pueden estar influidos por el estado de caché.
- La ventana servida en las pruebas fue de 102.400 tokens, por lo que la franja de 128K fue rechazada; el contexto máximo real de 131.072 no se validó en la suite.
- Idiomas soportados no documentados: no hay garantía de rendimiento multilingüe más allá de lo que herede del modelo base.
- Riesgo de alucinación no cuantificado en la información disponible; no hay evaluación de sesgos publicada.
- Dependencia exclusiva de `mlx-serve` y Apple Silicon: no hay pesos GGUF ni compatibilidad con ecosistemas CUDA, lo que limita el despliegue a estaciones Mac.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- La tabla de n-gramas fuera de los shards safetensors implica que herramientas de carga estándar (mlx-lm y similares) no podrán cargar el modelo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pgmharikrishnan/Swift1.5-Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Paquete hermano sin fine-tune: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit
- Licencia: `LICENSE` en el repositorio del modelo
- Script de conversión: `tests/convert_qwen38_flash_next.py` en el repositorio de `mlx-serve`
- Paper, blog o demo oficiales: no disponibles en la información proporcionada.
