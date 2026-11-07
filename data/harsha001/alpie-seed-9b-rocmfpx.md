# Harsha001/Alpie-Seed-9B-ROCmFPX

## Resumen

Alpie Seed 9B es un modelo multimodal de 9.000 millones de parámetros desarrollado por 169Pi AI, orientado a razonamiento, generación de código y comprensión de imágenes en inglés y diez idiomas de la India. Se obtiene mediante post-entrenamiento (SFT y GRPO) a partir de Qwen3.5-9B, e incorpora una arquitectura híbrida con proyecciones gated DeltaNet según se deduce de los nombres de tensores tratados en el proceso de cuantización (`attn_gate`, `ssm_out`, `ssm_alpha`, `ssm_beta`). El modelo acepta entradas image-text-to-text y soporta hasta 262.144 tokens de contexto.

La ficha que nos ocupa no es el modelo original, sino una cuantización comunitaria publicada por el usuario Harsha001 en formato ROCmFPX, un fork de llama.cpp con tipos de peso de baja precisión pensados para GPUs AMD (Vulkan y HIP/ROCm), con especial atención a Strix Halo. Se ofrecen dos variantes: una de 8 bits (9,3 GB) casi idéntica al modelo completo y otra de 6 bits (7,4 GB), acompañadas de un codificador visual F16 de 0,9 GB necesario para el procesamiento de imágenes. El interés de esta publicación radica en que permite ejecutar un modelo multimodal de 9B en hardware AMD con pérdida de calidad medida y documentada (KL de 0,00039 para 8 bits y 0,0025 para 6 bits frente a BF16).

Es relevante ahora porque los pesos solo funcionan con una compilación específica del fork ROCmFPX (de 7 de noviembre de 2026 o posterior) y no cargan en llama.cpp estándar, LM Studio u Ollama. Además, el autor advierte de que los archivos no se han probado todavía en hardware AMD real, por lo que esta ficha debe tratarse como material de evaluación preliminar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con proyecciones gated DeltaNet (derivado de Qwen3.5-9B); codificador visual separado |
| Parametros totales | 8.953.803.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (máximo del modelo); `-c` en llama.cpp reserva la memoria correspondiente |
| Tipos de cuantizacion | ROCmFPX `Q8_0_ROCMFPX` (8 bits) y `Q6_0_ROCMFPX` (6 bits, etiquetado como Q6_K); codificador visual F16; no hay variante de 4 bits en este repo |
| Idiomas soportados | en, hi, bn, mr, gu, te, ml, pa, kn, or, ta |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors BF16 como origen en el repo base 169Pi/Alpie_seed) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de 9B post-entrenado por 169Pi AI a partir de Qwen3.5-9B mediante SFT y GRPO (optimización de política con recompensas verificables). La presencia de tensores `attn_gate`, `ssm_out`, `ssm_alpha` y `ssm_beta` en el cuantizador indica componentes de tipo gated DeltaNet (state space model) combinados con atención, aunque la model card no detalla la proporción exacta de capas de cada tipo. El pipeline es image-text-to-text: un codificador visual F16 (`mmproj-Alpie-Seed-9B-F16.gguf`) se acopla al modelo de lenguaje para procesar imágenes. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

Esta publicación concreta no reentrena ni modifica el modelo: solo cambia la cuantización de los pesos. El proceso consistió en convertir los safetensors BF16 de 169Pi a GGUF BF16 con el `convert_hf_to_gguf.py` del fork, generar una importance matrix sobre texto de calibración general en fragmentos de 512 tokens y cuantizar con `llama-quantize --imatrix` y `LLAMA_ROCMFPX_TENSOR_SCALE=1`. La innovación técnica destacable es el escalado por potencias de dos de cada matriz de pesos (`<name>.scale`), que corrige la pérdida de precisión de los bloques de pesos pequeños, junto con el arreglo del 7 de noviembre de 2026 (commit `abdbcde56`) que hace que el cuantizador deje de omitir las proyecciones gated DeltaNet. Los embeddings de tokens y la matriz de salida usan tipos estándar de llama.cpp (Q8_0 en el archivo de 8 bits, Q6_K en el de 6 bits).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto (bloque de thinking antes de la respuesta); se puede desactivar con `--chat-template-kwargs '{"enable_thinking":false}'`.
- Generación de código, según la descripción del modelo base de 169Pi AI.
- Comprensión de imágenes (image-text-to-text): el autor verificó la descripción correcta de dos imágenes de prueba (una figura de zorro y un casco de bicicleta) con el archivo de 8 bits y el codificador visual.
- Multilingüismo en inglés y diez idiomas de la India: hindi, bengalí, maratí, guyaratí, telugu, malayo, panyabí, canarés, oriya y tamil.
- Conversación multi-turno con plantilla de chat propia (se carga con `--jinja`).
- Entrada de vídeo: no soportada en esta implementación de llama.cpp, aunque el modelo original la contempla.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente en la información proporcionada, más allá del modo de pensamiento.

## Casos de uso

- Asistencia en idiomas de la India: el modelo cubre diez lenguas del subcontinente además del inglés, lo que permite desplegar un único modelo para atención al cliente o generación de contenido en hindi, tamil, telugu o bengalí sin cambiar de checkpoint.
- Análisis de documentos con imágenes: con el codificador visual F16 se pueden procesar capturas, diagramas o fotografías junto a texto en un mismo prompt, útil para extracción de información de facturas, tickets o documentación técnica escaneada.
- Razonamiento con contexto largo: la ventana de 262.144 tokens permite resumir o consultar repositorios de documentación extensos, aunque en la práctica el límite lo impone la VRAM reservada con `-c`.
- Generación de código en local: al ejecutarse en GPUs AMD de consumo o en Strix Halo mediante ROCmFPX, encaja en flujos de trabajo con requisitos de privacidad donde no se quiere enviar código a la nube.
- Inferencia en el borde (edge AI): el modelo de 9B cuantizado a 8 o 6 bits (9,3 GB y 7,4 GB) está pensado para portátiles y equipos de sobremesa con GPU AMD, en línea con la propuesta de 169Pi de modelos que corren en portátiles, móviles y servidores on-premise.
- Evaluación de cuantizaciones de baja precisión: los datos de KL y de coincidencia del token más probable permiten comparar el impacto de ROCmFPX frente a los tipos estándar de llama.cpp antes de adoptar el fork en producción.
- Prototipado multimodal sin conexión: al no requerir servicios externos, sirve para demos de visión-lenguaje en entornos aislados, siempre que se acepte la dependencia de una compilación concreta del fork.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo aporta métricas de fidelidad de la cuantización frente a BF16, medidas con `llama-perplexity --kl-divergence` sobre 40 fragmentos de 512 tokens de wikitext-2:

| Archivo | Tamano | KL a BF16 | Mismo token superior |
|---|---:|---:|---:|
| `Alpie-Seed-9B-Q8_0_ROCMFPX.gguf` | 9,3 GB | 0,00039 | 99,5% |
| `Alpie-Seed-9B-Q6_K_ROCMFPX.gguf` | 7,4 GB | 0,0025 | 97,7% |
| `mmproj-Alpie-Seed-9B-F16.gguf` | 0,9 GB | no aplica | no aplica |

Comparación con los tipos estándar de llama.cpp del mismo modelo, medidos de la misma forma:

| Archivo estándar | Tamano | KL a BF16 | Mismo token superior |
|---|---:|---:|---:|
| Q8_0 | 9,6 GB | 0,00042 | 99,2% |
| Q6_K | 7,4 GB | 0,0045 | 97,8% |
| Q4_K_M | 5,7 GB | 0,0185 | 94,4% |

Efecto del arreglo de gated DeltaNet del 7 de noviembre de 2026:

| KL a BF16 | Antes del arreglo | Después |
|---|---:|---:|
| 8 bits | 0,0024 | 0,00039 |
| 6 bits | 0,0064 | 0,0025 |

El autor señala que estas métricas se obtuvieron sobre texto general en inglés, no sobre razonamiento, código ni idiomas de la India.

## Requisitos de hardware

- VRAM estimada: el archivo de 8 bits ocupa 9,3 GB y el de 6 bits 7,4 GB; hay que sumar 0,9 GB del codificador visual para entradas de imagen y la memoria que reserva `-c` para el contexto (hasta 262.144 tokens, lo que puede ser muy exigente en KV cache).
- GPUs objetivo: AMD con soporte Vulkan o HIP/ROCm; la compilación de ejemplo usa `-DAMDGPU_TARGETS=gfx1151` (Strix Halo) y `gfx1100` (Radeon RX 7900).
- Cabe en GPU de consumo: sí, previsiblemente en GPUs AMD con al menos 10-12 GB de VRAM para el archivo de 8 bits sin contexto largo, aunque el autor no ha publicado pruebas en hardware AMD real.
- Opciones de despliegue: exclusivamente el fork `HarshaVardhan3002/ROCmFPX` (compilación del 7 de noviembre de 2026 o posterior) con `llama-server`. No cargan en llama.cpp estándar, LM Studio, Ollama ni otras compilaciones de ROCmFPX. Para formatos estándar, 169Pi publica versiones de 2, 3 y 4 bits en `169Pi/Alpie_Seed_GGUF` y en Ollama.
- Latencia y throughput: no disponibles; el autor pide a la comunidad que reporte velocidad y calidad en la pestaña Community.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Alpie Seed 9B (ROCmFPX, esta ficha) | 8,95B | 262.144 | Apache-2.0 | GGUF solo para fork ROCmFPX; sin probar en AMD | Cuantización comunitaria; KL 0,00039 (8 bits) |
| Alpie Seed 9B (169Pi, original) | 9B | 262.144 | Apache-2.0 | Safetensors BF16, GGUF de 2/3/4 bits, Ollama | Modelo de referencia; soporta vídeo |
| Qwen3.5-9B | 9B | no disponible | no disponible | no disponible | Modelo base del que deriva Alpie Seed; sin visión según la información disponible |

No se dispone de datos de benchmarks de tareas para establecer comparaciones de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Los archivos no se han probado en hardware AMD; el propio autor lo advierte y solicita reportes de velocidad y calidad.
- Dependencia estricta de una compilación concreta del fork ROCmFPX (7 de noviembre de 2026 o posterior); las compilaciones anteriores no están probadas y el ecosistema estándar (llama.cpp, Ollama, LM Studio) no puede cargarlos.
- No hay variante de 4 bits en este repo: la mejor receta de 4 bits del autor (6,6 GB, KL 0,0153) resultó mayor que un Q4_K_M estándar con solo una ligera mejora, por lo que para 4 bits hay que usar los archivos de 169Pi.
- Las métricas de KL se midieron solo sobre texto general en inglés (wikitext-2); no hay evidencia publicada sobre la degradación en razonamiento, código o idiomas de la India.
- Entrada de vídeo no soportada en esta implementación, pese a que el modelo original la contempla.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; como modelo post-entrenado con GRPO, cabe esperar los sesgos heredados de Qwen3.5-9B y de sus datos de SFT, pero no hay evaluación publicada.
- Licencia Apache-2.0 permite uso comercial, pero el crédito del modelo corresponde a 169Pi AI y esta publicación es no oficial; conviene revisar los términos del fork ROCmFPX para uso en producción.
- El modo de pensamiento está activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explícitamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Alpie-Seed-9B-ROCmFPX
- Modelo base: https://huggingface.co/169Pi/Alpie_seed
- GGUF oficiales de 169Pi: https://huggingface.co/169Pi/Alpie_Seed_GGUF
- Fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Commit del arreglo gated DeltaNet: https://github.com/HarshaVardhan3002/ROCmFPX/commit/abdbcde56
- Página de investigación de Alpie Seed 9B: https://169pi.ai/research/alpie-seed-9b
- Sitio de 169Pi AI: https://169pi.ai/
- Modelo en Ollama: https://ollama.com/169pi/alpie-seed
