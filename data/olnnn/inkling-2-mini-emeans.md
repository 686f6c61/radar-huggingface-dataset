# olnnn/Inkling-2-Mini-EMEANS

## Resumen

Inkling-2-Mini-EMEANS es una cuantización experimental de precisión mixta del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario olnnn. Se trata de un modelo MoE de 26.2B parámetros totales con 5.4B parámetros activos, cuya característica arquitectónica más singular es que sus 12 capas centrales (L6–L17) se ejecutan tres veces por token, lo que amplifica el coste computacional y la sensibilidad al error de cuantización en ese tramo. El autor distribuye dos variantes en formato propietario `.emns`: una de 3.04 bpw (9.20 GiB) que cabe íntegramente en una GPU de 12 GB y otra de 2.27 bpw (6.88 GiB), marcada como experimental, orientada a GPUs de 8 GB.

La relevancia de esta ficha no está en el modelo base, sino en la técnica de compresión: se emplean códecs vectoriales 2D (e-means) para los expertos MoE, se mantienen capas densas, atención, embeddings y `lm_head` en 4 bits, y se fusionan los 120 LoRA de recuperación GRPO antes del empaquetado. El resultado declarado es un modelo que conserva buena parte de la calidad del original con menos de la mitad de su huella de memoria (~20 GB en BF16/NVFP4/MXFP8 frente a 9.87 GB).

El punto crítico es que los ficheros `.emns` no son compatibles con llama.cpp estándar: requieren un fork parcheado con kernels CUDA/HIP propios. Esto convierte al modelo en una propuesta de nicho para entornos controlados, no en un reemplazo directo de una cuantización GGUF convencional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo recurrente (12 capas centrales ejecutadas 3 veces por token) |
| Parámetros totales | 26.2B |
| Parámetros activos | 5.4B |
| Longitud de contexto | 52K–72K (3.04 bpw, 12 GB); ~24K–32K headless / ~8K–16K desktop (2.27 bpw, 8 GB) |
| Tipos de cuantización | `.emns` mixta: 3.04 bpw (2.5–4 bits) y 2.27 bpw (2.0–4 bits); visión opcional a 4 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.emns` (propietario) + stub `GGUF` de metadatos y tokenizer |

## Arquitectura y entrenamiento

El modelo base es un MoE de 26.2B parámetros con 5.4B activos. La innovación estructural es el bucle interno: las capas L6 a L17 se recorren tres veces por cada token generado, de modo que cualquier error de cuantización en ese bloque se compone tres veces. El autor justifica así el diseño de precisión mixta: los expertos MoE del núcleo bucleado reciben 3.0 bits en la variante de 3.04 bpw (protección frente a la acumulación de error) y solo 2.0 bits en la de 2.27 bpw, que asume esa pérdida a cambio de caber en 8 GB. Los expertos MoE externos, que se activan una sola vez por token, se comprimen más agresivamente con códecs vectoriales 2D (2.5 bits con `K32_G128` en la variante grande, 2.0 bits con `K16_G128` en la pequeña).

Las capas densas, de atención, embeddings y `lm_head` se mantienen en 4.0 bits (`EM1D_Q4_G64`) en ambas variantes, y routers, normalizaciones y `sconv` quedan en FP32 por su escaso peso y su impacto en la estabilidad del enrutado. Antes del empaquetado se fusionan los 120 LoRA de recuperación GRPO del checkpoint original, lo que según el autor mitiga parte de la degradación introducida por la cuantización. No se documentan en la información disponible el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni el detalle del pipeline de RLHF/DPO más allá de la mención a GRPO.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo de esfuerzo configurable (`low`, `medium`, `high`), con impacto medido en latencia y consumo de tokens.
- Generación y edición de código, evaluada en el conjunto `ab_bench` de 13 tareas.
- Procesamiento de imagen y texto (`image-text-to-text`) mediante el encoder de visión opcional `mmproj` a 4 bits.
- Ejecución en GPU AMD (ROCm/HIP) y NVIDIA (CUDA) a través del fork parcheado de llama.cpp.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni flujos de agentes multi-paso.

## Casos de uso

- Asistente de código en estación de trabajo con GPU de 12 GB: la variante 3.04 bpw permite mantener 52K–72K tokens de contexto con cero spill a RAM, suficiente para cargar un repositorio mediano y trabajar sobre varios ficheros sin perder referencias.
- Edición rápida de código en modo `low`: con 9.5 s de media por tarea y 3.418 tokens totales en 8 tareas, encaja en un flujo de autocompletado y refactorización puntual donde la latencia importa más que la profundidad de razonamiento.
- Depuración de fallos complejos en modo `high`: el modo de mayor esfuerzo mantiene 7/8 tareas resueltas con 16.9 s por tarea y 6.242 tokens, útil para analizar trazas de error largas donde se necesita cadena de razonamiento extendida.
- Despliegue en hardware de gama media AMD: el soporte ROCm/HIP verificado en RX 6700 XT (213.5 tok/s de prompt, 48.7 tok/s de decodificación) lo hace viable en equipos sin CUDA, un segmento habitualmente desatendido por las cuantizaciones estándar.
- Procesamiento de documentos con imagen y texto: el encoder de visión a 4 bits añade 167.7 MiB y puede ejecutarse en CPU sin consumo de VRAM, lo que permite incorporar capturas, diagramas o formularios a un pipeline de extracción de información.
- Prototipado en GPU de 8 GB: la variante 2.27 bpw, pese a su carácter experimental, permite arrancar un servidor de inferencia con ~24K–32K de contexto en modo headless, adecuado para pruebas de integración antes de escalar a hardware mayor.
- Evaluación comparativa de técnicas de cuantización: el repositorio publica curvas de perplejidad, KLD y resultados de `ab_bench` frente a `UD-Q2_K_XL`, lo que lo convierte en material de referencia para investigar el impacto de códecs vectoriales en modelos MoE con capas recurrentes.

## Benchmarks y rendimiento

Resultados declarados por el autor para la variante 3.04 bpw en `ab_bench` (13 tareas, contexto 32K, RX 6700 XT 12 GB, noviembre de 2026):

| Modelo | Bits | Tamaño | Aprobadas | Tareas difíciles | Decodificación | Tokens totales | Tiempo total | Atascadas/tope |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Unsloth `UD-Q2_K_XL` | mixta ~2–3b | 9.14 GB | 8/13 | 4/8 | 51.3 tok/s | 22.202 | 444.9 s | 4 |
| Este build (3.04 bpw) | mixta 2.5–4b | 9.20 GiB (9.87 GB) | 10/13 | 6/8 | 47.6 tok/s | 12.240 (−45%) | 264.9 s (1.68× más rápido) | 1 |

Perplejidad y divergencia frente al checkpoint original (puerta Colab L4, pre-GRPO):

| Variante | Tamaño | Wiki PPL | Code PPL | KLD vs original |
|---|---:|---:|---:|---:|
| Original (NVFP4/MXFP8/BF16) | ~20 GB | 6.609 | 1.573 | 0.000 (ref.) |
| 3.04 bpw (pre-GRPO) | 9.20 GiB (9.87 GB) | 7.023 | 1.595 | 0.083 |

Esfuerzo de razonamiento (8 tareas de código en RX 6700 XT):

| Esfuerzo | Aprobadas | Tiempo medio/tarea | Tokens totales |
|---|---:|---:|---:|
| `low` (recomendado) | 7/8 | 9.5 s | 3.418 |
| `medium` | 7/8 | 13.2 s | 4.835 |
| `high` | 7/8 | 16.9 s | 6.242 |

Rendimiento en RX 6700 XT (12 GB, pesos reales de 3.04 bpw, cero spill): `llama-bench` con `-ub 128` alcanza 213.5 tok/s de prompt y 48.7 tok/s de decodificación con ~9.6 GiB de VRAM dedicada; con `-ub 256` el prompt sube a 229.5 tok/s. No se han publicado resultados de benchmarks para la variante 2.27 bpw: el autor indica que la prueba de generación en vivo y las mediciones están pendientes.

## Requisitos de hardware

- VRAM estimada: 9.20 GiB para 3.04 bpw; 6.88 GiB para 2.27 bpw; ~12.5 GiB para la variante 4.0 bpw anunciada pero no publicada.
- GPU verificada: AMD RX 6700 XT de 12 GB con ROCm/HIP y cero spill a RAM compartida.
- GPU de 12 GB en general: la variante 3.04 bpw cabe al 100% con 52K de contexto en escritorio y 72K en modo headless.
- GPU de 8 GB: solo la variante 2.27 bpw, con contexto reducido (~24K–32K headless, ~8K–16K en escritorio usando KV `q4_0`).
- GPU de 16 GB o superior: recomendable para la futura variante 4.0 bpw o para 3.04 bpw con mayor contexto y KV en precisión superior.
- Encoder de visión: 167.7 MiB adicionales, ejecutable en CPU sin consumo de VRAM o en GPU con el doble de velocidad.
- Despliegue: exclusivamente mediante el fork `olsn-bit/llama.cpp-emeans` (etiqueta `v0.1.0-emeans`), con binarios precompilados para Windows y Linux o compilación desde el parche `0001-ggml-cuda-add-e-means-.emns-HIP-CUDA-kernels-WMMA-pr.patch` sobre el commit `b2236cb39`.
- llama.cpp estándar, vLLM, TGI, Ollama y similares no pueden abrir ficheros `.emns` sin ese parche.
- Throughput medido: 213.5–229.5 tok/s de prompt y 47.6–48.7 tok/s de decodificación en RX 6700 XT.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño en disco | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Inkling-2-Mini-EMEANS 3.04 bpw | 26.2B totales / 5.4B activos | 52K–72K en 12 GB | 9.87 GB | Apache 2.0 | `.emns`, fork de llama.cpp |
| Inkling-2-Mini-EMEANS 2.27 bpw | 26.2B totales / 5.4B activos | ~24K–32K en 8 GB | 7.39 GB | Apache 2.0 | `.emns`, fork de llama.cpp |
| Unsloth `UD-Q2_K_XL` (mismo base) | 26.2B totales / 5.4B activos | no disponible | 9.14 GB | Apache 2.0 (heredada) | GGUF, llama.cpp estándar |
| Checkpoint original (NVFP4/MXFP8/BF16) | 26.2B totales / 5.4B activos | no disponible | ~20 GB | Apache 2.0 | safetensors / formatos estándar |

Frente a `UD-Q2_K_XL`, la variante 3.04 bpw resuelve 10/13 tareas frente a 8/13, con 6/8 en tareas difíciles frente a 4/8, y emplea un 45% menos de tokens y 1.68× menos tiempo, a costa de una decodificación ligeramente inferior (47.6 frente a 51.3 tok/s) y de requerir un runtime parcheado. Frente al checkpoint original, la pérdida de perplejidad en wiki es de 6.609 a 7.023 y el KLD se sitúa en 0.083, con un tamaño menos de la mitad.

## Limitaciones y advertencias

- Los ficheros `.emns` exigen un fork específico de llama.cpp; no hay compatibilidad con el ecosistema GGUF estándar ni con servidores de inferencia convencionales, lo que limita la portabilidad y añade deuda de mantenimiento ligada al commit `b2236cb39`.
- La variante 2.27 bpw está marcada como experimental: solo se ha verificado estructuralmente (`EMNS0001`, 694 tensores, 120/120 LoRA GRPO fusionados) y carece de prueba de generación en vivo y de benchmarks publicados.
- La compresión a 2.0 bits en los expertos del núcleo bucleado, que se ejecutan tres veces por token, acumula error de forma triple; es esperable una degradación de calidad mayor que la medida en la variante de 3.04 bpw.
- Los benchmarks proceden de un único entorno (RX 6700 XT, 12 GB, ROCm) y de un conjunto de 13 tareas de código; no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multilingües.
- El KLD de 0.083 y la subida de perplejidad en wiki indican una divergencia medible respecto al original, con posible impacto en tareas de conocimiento factual y en la fidelidad de respuestas largas.
- No se documentan los idiomas soportados; no hay evidencia de rendimiento en castellano ni en otros idiomas distintos del inglés.
- No se documenta soporte de tool calling ni de flujos agénticos, por lo que no debe asumirse su disponibilidad en producción.
- Riesgo de alucinación y sesgos del modelo base no evaluado en la información disponible; la cuantización agresiva puede amplificarlos en dominios de baja frecuencia.
- La licencia Apache 2.0 permite uso comercial, pero el requisito de un runtime parcheado puede condicionar el cumplimiento y el soporte en entornos empresariales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olnnn/Inkling-2-Mini-EMEANS
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime parcheado (binarios v0.1.0-emeans): https://github.com/olsn-bit/llama.cpp-emeans/releases/tag/v0.1.0-emeans
- Parche de kernels CUDA/HIP: `patches/0001-ggml-cuda-add-e-means-.emns-HIP-CUDA-kernels-WMMA-pr.patch` (dentro del repositorio del modelo)
