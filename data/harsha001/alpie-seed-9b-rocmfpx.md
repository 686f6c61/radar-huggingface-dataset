# Harsha001/Alpie-Seed-9B-ROCmFPX

## Resumen

Alpie Seed 9B es un modelo de lenguaje y visión (image-text-to-text) de 9.000 millones de parámetros desarrollado por 169Pi AI, obtenido mediante post-entrenamiento (SFT y GRPO) a partir de Qwen3.5-9B. Está orientado a razonamiento, generación de código y comprensión de imágenes, con soporte para inglés y diez idiomas de la India (hindi, bengalí, maratí, guyaratí, télugu, malabar, panyabí, canarés, oriya y tamil). Su arquitectura combina atención con componentes de tipo DeltaNet con compuertas (gated DeltaNet), según se deduce de las proyecciones `attn_gate`, `ssm_out`, `ssm_alpha` y `ssm_beta` mencionadas en la documentación del cuantizador.

La ficha que nos ocupa no es el modelo original, sino una cuantización GGUF publicada por el usuario Harsha001 bajo el identificador `Alpie-Seed-9B-ROCmFPX`. Se trata de una conversión en formatos propietarios ROCmFPX, un fork de llama.cpp con tipos de peso de baja precisión optimizados para GPUs AMD (Vulkan y HIP/ROCm), con especial atención a equipos Strix Halo. El repositorio incluye dos pesos (8 bits y 6 bits) más un codificador visual F16 separado para el procesamiento de imágenes.

La relevancia de esta publicación es doble: por un lado, ofrece una vía para ejecutar un modelo multimodal de 9B en hardware AMD de consumo o estaciones compactas; por otro, documenta con detalle métricas de deriva (KL-divergence respecto a BF16) y una corrección específica del cuantizador para las proyecciones DeltaNet. No obstante, el propio autor advierte de que los archivos no se han probado aún en hardware AMD real y de que requieren un build concreto del fork, lo que limita su uso inmediato en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con gated DeltaNet (derivada de Qwen3.5-9B) |
| Parámetros totales | 8.953.803.512 (≈8,95B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de ejecución usa `-c 32768` |
| Tipos de cuantización | Q8_0_ROCMFPX (8 bits) y Q6_0_ROCMFPX (6 bits, etiquetado como Q6_K); codificador visual en F16 |
| Idiomas soportados | en, hi, bn, mr, gu, te, ml, pa, kn, or, ta |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors BF16 en el modelo base) |

## Arquitectura y entrenamiento

El modelo base, `169Pi/Alpie_seed`, parte de Qwen3.5-9B y se post-entrena con SFT y GRPO (Group Relative Policy Optimization) para reforzar razonamiento, código y comprensión de imágenes. La arquitectura incluye proyecciones específicas de gated DeltaNet (`attn_gate`, `ssm_out`, `ssm_alpha`, `ssm_beta`), lo que sugiere un diseño híbrido que combina atención con mecanismos de estado recurrente con compuertas. El modelo es multimodal: incorpora un codificador visual que en esta cuantización se distribuye por separado como `mmproj-Alpie-Seed-9B-F16.gguf` (0,9 GB).

El proceso de cuantización de esta ficha es relevante técnicamente. Se partió de los safetensors BF16 de 169Pi, se convirtió a GGUF BF16 y a un codificador visual F16 con `convert_hf_to_gguf.py` del fork ROCmFPX, se generó una importance matrix sobre texto general en fragmentos de 512 tokens y se aplicó `llama-quantize --imatrix` con `LLAMA_ROCMFPX_TENSOR_SCALE=1`. Esta variable activa un reescalado por potencias de dos de cada matriz de pesos para compensar la precisión limitada del escalar de bloque de 8 bits flotante. La corrección del 7 de noviembre de 2026 (commit `abdbcde56`) extendió ese reescalado a las proyecciones gated DeltaNet, que antes se omitían: la deriva KL del archivo de 8 bits pasó de 0,0024 a 0,00039, y la del de 6 bits de 0,0064 a 0,0025. Los embeddings de tokens y la matriz de salida usan tipos estándar de llama.cpp (Q8_0 en el archivo de 8 bits, Q6_K en el de 6 bits).

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento (thinking) activado por defecto antes de responder.
- Razonamiento explícito: el modelo produce un bloque de pensamiento previo a la respuesta final; se puede desactivar con `--chat-template-kwargs '{"enable_thinking":false}'`.
- Generación y comprensión de código, según la descripción del modelo base (razonamiento, coding e image understanding).
- Comprensión de imágenes (image-text-to-text) mediante el codificador visual F16; el autor verificó la descripción correcta de dos imágenes de prueba (una figura de zorro y un casco de bicicleta).
- Multilingüismo en inglés y diez idiomas de la India: hindi, bengalí, maratí, guyaratí, télugu, malabar, panyabí, canarés, oriya y tamil.
- Soporte de plantilla de chat compatible con `--jinja` en llama-server.
- Tool calling y capacidades de agente: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal en estaciones AMD Strix Halo: el modelo puede ejecutarse en una única máquina con 128 GB de memoria unificada usando el fork ROCmFPX con backend Vulkan o HIP, lo que permite desplegar un VLM de 9B en hardware AMD sin GPU discreta.
- Descripción y análisis de imágenes en local: con el codificador `mmproj-Alpie-Seed-9B-F16.gguf` se pueden procesar imágenes y generar descripciones o responder preguntas sobre ellas, útil en entornos con requisitos de privacidad que impiden enviar imágenes a la nube.
- Atención al cliente multilingüe en el mercado indio: el soporte nativo de diez idiomas de la India permite construir asistentes conversacionales que atiendan a usuarios en hindi, tamil, télugu, bengalí y otros idiomas sin traducción intermedia.
- Razonamiento asistido con traza de pensamiento: el modo thinking por defecto facilita tareas de análisis paso a paso, como revisión de documentación técnica o resolución de problemas matemáticos, donde interesa auditar el razonamiento.
- Generación de código en pipelines de desarrollo: el modelo base está post-entrenado para coding, por lo que puede integrarse en herramientas de autocompletado o revisión, aunque en esta cuantización conviene validar la calidad frente al BF16.
- Experimentación e investigación en cuantización de bajo bit para AMD: el repositorio documenta metodología, métricas KL y una corrección concreta del cuantizador, lo que lo convierte en material de referencia para quien investigue formatos ROCmFPX o evalúe el impacto de la cuantización en arquitecturas híbridas con DeltaNet.
- Prototipado de asistentes con contexto amplio: el ejemplo oficial arranca con `-c 32768`, adecuado para conversaciones largas o documentos extensos, siempre que la memoria del equipo lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí incluye métricas de fidelidad de la cuantización respecto a BF16, medidas con `llama-perplexity --kl-divergence` sobre 40 fragmentos de 512 tokens de wikitext-2 en inglés:

| Archivo | Tamaño | KL a BF16 | Mismo token top |
|---|---:|---:|---:|
| Alpie-Seed-9B-Q8_0_ROCMFPX.gguf | 9,3 GB | 0,00039 | 99,5% |
| Alpie-Seed-9B-Q6_K_ROCMFPX.gguf | 7,4 GB | 0,0025 | 97,7% |
| mmproj-Alpie-Seed-9B-F16.gguf | 0,9 GB | no aplica | no aplica |
| Q8_0 estándar (llama.cpp) | 9,6 GB | 0,00042 | 99,2% |
| Q6_K estándar (llama.cpp) | 7,4 GB | 0,0045 | 97,8% |
| Q4_K_M estándar (llama.cpp) | 5,7 GB | 0,0185 | 94,4% |

Comparativa de la corrección del 7 de noviembre de 2026 en las proyecciones gated DeltaNet:

| Cuantización | KL antes | KL después |
|---|---:|---:|
| 8 bits | 0,0024 | 0,00039 |
| 6 bits | 0,0064 | 0,0025 |

El autor indica que no publica archivo de 4 bits porque su mejor receta (6,6 GB, KL 0,0153) resultaba mayor que un Q4_K_M estándar con solo una ligera mejora de deriva; para 4 bits recomienda los archivos oficiales de 169Pi. Las métricas se midieron sobre texto general en inglés, no sobre razonamiento, código ni idiomas de la India.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo de 8 bits ocupa 9,3 GB y el de 6 bits 7,4 GB; sumando el codificador visual F16 (0,9 GB) y la caché KV para 32.768 tokens, se requiere un margen adicional no cuantificado en la información disponible.
- GPUs recomendadas: el fork está orientado a AMD; el ejemplo de compilación usa `-DAMDGPU_TARGETS=gfx1151` (Strix Halo) y menciona `gfx1100` (RX 7900). El autor cita una máquina Strix Halo de 128 GB como plataforma objetivo para sus cuantizaciones.
- Compatibilidad con GPU de consumo: no confirmada. El autor advierte explícitamente de que estos archivos no se han probado todavía en hardware AMD real y pide a la comunidad que reporte velocidad y calidad.
- Opciones de despliegue: exclusivamente el fork `HarshaVardhan3002/ROCmFPX` compilado a partir del 7 de noviembre de 2026, con `llama-server`; no cargan en llama.cpp estándar, LM Studio, Ollama ni otros builds de ROCmFPX.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alpie Seed 9B (esta ficha, ROCmFPX) | ≈8,95B | no disponible (ejemplo con 32.768) | Texto + imagen | apache-2.0 | GGUF en HF, requiere fork ROCmFPX |
| Alpie Seed 9B (169Pi, GGUF oficial) | ≈8,95B | no disponible | Texto + imagen | apache-2.0 | GGUF 2/3/4 bits en `169Pi/Alpie_Seed_GGUF` y Ollama |
| Qwen3.5-9B (modelo base del que deriva) | ≈9B | no disponible | Texto | según el modelo original, no disponible | safetensors en HF |
| DeepSeek-V4.1-Flash-1017 (cuantización ROCmIQ del mismo autor) | no disponible | no disponible | Texto | no disponible | GGUF para Strix Halo de 128 GB |

La comparación más directa es con los archivos GGUF oficiales de 169Pi: misma base, misma licencia y mismos idiomas, pero con tipos estándar de llama.cpp (2, 3 y 4 bits) que cargan en herramientas convencionales, frente a los 6 y 8 bits de ROCmFPX que exigen el fork. Para hardware AMD, la alternativa del mismo autor es su cuantización de DeepSeek-V4.1-Flash en formato ROCmIQ, de mayor tamaño y pensada para una máquina Strix Halo completa.

## Limitaciones y advertencias

- Los archivos no se han probado en hardware AMD real según la propia model card; el rendimiento y la calidad en GPU son desconocidos hasta que la comunidad reporte resultados.
- Requieren un build específico del fork ROCmFPX posterior al 7 de noviembre de 2026; no cargan en llama.cpp estándar, LM Studio, Ollama ni otras distribuciones, lo que rompe la portabilidad habitual de GGUF.
- No hay archivo de 4 bits en este repositorio; para ese nivel de cuantización hay que acudir a los archivos oficiales de 169Pi.
- Las métricas KL se midieron solo sobre texto general en inglés (wikitext-2); no hay evidencia publicada sobre la fidelidad de la cuantización en razonamiento, código ni en los diez idiomas de la India soportados.
- El modelo piensa antes de responder por defecto; en aplicaciones de baja latencia hay que desactivar el modo thinking explícitamente.
- No se han publicado benchmarks de capacidades (razonamiento, código, visión, multilingüe) en la información disponible, por lo que no es posible comparar su calidad objetiva con alternativas.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; como modelo post-entrenado con GRPO, cabe esperar los sesgos habituales de sus datos de entrenamiento, no detallados.
- La licencia apache-2.0 permite uso comercial, pero el autor no es el propietario del modelo y recomienda atribuir a 169Pi AI; esta publicación es una conversión no oficial.
- El contexto máximo real del modelo no se especifica; el valor de 32.768 del ejemplo es una configuración de arranque, no una garantía de la ventana nativa.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Harsha001/Alpie-Seed-9B-ROCmFPX
- Modelo base: https://huggingface.co/169Pi/Alpie_seed
- GGUF oficiales de 169Pi: https://huggingface.co/169Pi/Alpie_Seed_GGUF
- Versión en Ollama: https://ollama.com/169pi/alpie-seed
- Fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Commit de la corrección gated DeltaNet: https://github.com/HarshaVardhan3002/ROCmFPX/commit/abdbcde56
- Cuantización destacada del mismo autor (DeepSeek-V4.1-Flash para Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
