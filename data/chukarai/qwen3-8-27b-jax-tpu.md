# ChukarAI/Qwen3.8-27B-JAX-TPU

## Resumen

Qwen3.8-27B-JAX-TPU es un port de inferencia en JAX/XLA del modelo Qwen/Qwen3.8-27B, desarrollado por Chukar AI. No se trata de un modelo nuevo con pesos propios, sino de una implementación independiente que carga de forma streaming los pesos originales de Qwen y los ejecuta sobre TPU v5e-8 (8 chips TPU v5 lite con 16,9 GB de HBM cada uno). El objetivo es ofrecer una vía de despliegue verificable y reproducible en infraestructura TPU de Google, un entorno tradicionalmente menos cubierto por el ecosistema de inferencia centrado en GPU.

El modelo base es un decoder híbrido de 48 capas Gated DeltaNet más 16 capas de atención completa, con un total de 26.896 mil millones de parámetros en la ruta de texto (851 tensores, 53,792 GB en BF16), tamaño de hidden 5120 y vocabulario de 248.320 tokens. El port excluye explícitamente los 333 tensores visuales y los 15 tensores MTP del checkpoint original, por lo que esta release es estrictamente text-only.

La relevancia de esta ficha radica en su enfoque en la verificación: el autor publica resultados de paridad numérica frente a referencias FP32 en CPU y CUDA, incluyendo un fallo estricto declarado abiertamente a 4096 tokens (top-5 en 4094/4096 posiciones). Es un artefacto útil para quien necesite ejecutar Qwen3.8-27B en TPU con garantías documentadas de fidelidad numérica, no para quien busque un modelo afinado o con benchmarks de calidad de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas Gated DeltaNet + 16 capas de atención completa (atención completa en índices `(i+1) % 4 == 0`); hidden size 5120, FFN 17.408, 256 dims de cabeza con RoPE parcial θ=1e7 sobre 64 dims |
| Parametros totales | 26.896 B en la ruta de texto (851 tensores); el checkpoint completo pesa 55,6 GB |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible como límite declarado; verificado numéricamente hasta 4096 tokens |
| Tipos de cuantizacion | no disponible; los pesos se cargan en BF16 y la referencia se ejecuta en FP32 |
| Idiomas soportados | no disponible (la verificación incluye prompts en inglés, persa y código) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cargados por streaming desde `Qwen/Qwen3.8-27B`, revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`); el repo solo contiene código, fixtures y reports |

## Arquitectura y entrenamiento

El port reproduce la arquitectura del modelo base Qwen3.8-27B: un decoder híbrido que combina capas Gated DeltaNet (estado recurrente lineal) con capas de atención completa intercaladas cada cuatro capas. La implementación en JAX usa sharding TP=8: los pesos 2D se dividen en el eje de salida de Hugging Face, los embeddings y el `lm_head` se dividen en el eje de vocabulario, y los tensores de rango 1 y 3 se replican. Las proyecciones `k_proj`/`v_proj` de atención completa se re-replican porque 4 cabezas KV no pueden repartirse entre 8 dispositivos.

El autor no aporta información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO); esa información correspondería a la model card de Qwen. Lo que sí documenta es la infraestructura de inferencia: un loader de streaming por shards con pico de RSS en host de aproximadamente 11,2 GB, una referencia FP32 capa a capa (`StreamedQwen35Ref`) con TF32 desactivado y precisión `highest`, una caché KV de capacidad fija mediante `jax.lax.dynamic_update_slice` con longitud válida escalar que reutiliza un único ejecutable de decode (`decode_trace_count = 1`), y un arnés de verificación fail-closed con contratos exactos de 26 etapas, 3 compilaciones y 8 dispositivos.

## Capacidades

- Generación de texto autoregresiva con decodificación token a token verificada contra referencia FP32.
- Razonamiento y generación de código: la verificación free-running incluye prompts de código con coincidencia exacta token a token en 6/6 prompts.
- Soporte multilingüe parcial verificado: inglés y persa aparecen en las pruebas de generación libre.
- Inferencia con caché KV persistente entre prefill y decode, con consistencia numérica comprobada (496 prefill + 16 decode frente a 512 prefill).
- Ejecución distribuida en 8 chips TPU v5 lite con sharding de pesos.
- No incluye visión: los 333 tensores visuales del checkpoint original quedan excluidos de esta release.
- No incluye MTP (multi-token prediction): los 15 tensores MTP también se excluyen.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de Qwen3.8-27B en infraestructura TPU: el port permite ejecutar el modelo en Kaggle TPU v5e-8 sin materializar el checkpoint completo en el host, gracias al loader de streaming con pico de RSS de 11,2 GB, lo que encaja en el límite de cgroup de 32,2 GB del contenedor.
- Validación numérica de implementaciones propias: el arnés fail-closed y los reports de paridad (mrel, cosine, top-1/top-5) sirven como referencia para contrastar portes alternativos del mismo modelo en otros backends.
- Investigación en inferencia sobre aceleradores alternativos: útil para estudiar el rendimiento de Gated DeltaNet y atención híbrida en TPU, con métricas concretas de prefill (0,153 s a 512 tokens, 1,200 s a 4096) y decode (17,3–19,9 ms/token a 512, 29,4–30,4 ms/token a 4096).
- Generación de código en pipelines de investigación: los prompts de código verificados token a token permiten usar el port como componente determinista en entornos donde la reproducibilidad exacta es requisito.
- Reproducción de experimentos académicos: la release incluye manifiesto de extracción, sumas SHA-256 (24/24 OK) y scripts de compilación, lo que facilita replicar los resultados en un entorno controlado.
- Benchmarking de sharding TP=8: el reparto documentado (eje de salida para pesos 2D, eje de vocabulario para embeddings y `lm_head`, replicación de tensores rank-1/rank-3) es una plantilla práctica para portar otros modelos de tamaño similar a TPU multichip.

## Benchmarks y rendimiento

Los datos disponibles son de paridad numérica y rendimiento de inferencia, no de calidad de tarea (MMLU, HumanEval, GSM8K no aparecen en la información proporcionada).

| Comparación | mrel | cosine | max abs | top-1 | top-5 |
|---|---:|---:|---:|---|---|
| TPU 512 vs CUDA FP32 ref | 4,8016e-06 | 0,9999999999875 | 2,151e-04 | match | 5/5 |
| TPU 512 vs CPU FP32 ref | 3,8195e-06 | 0,9999999999910 | 1,950e-04 | match | 5/5 |
| TPU 1024 vs CUDA FP32 ref | 2,5573e-05 | 0,9999999996826 | 3,475e-04 | match | 5/5 |
| TPU 1024 vs CPU FP32 ref | 2,5600e-05 | 0,9999999996829 | 3,153e-04 | match | 5/5 |

| Gate a 4096 tokens (P1, JAX 0.11.0) | Medido | Resultado |
|---|---|---|
| top-1 | 4096 / 4096 | PASS |
| top-5 | 4094 / 4096 | FAIL |
| mrel | 1,008e-04 (< 5e-3) | PASS |
| cosine | 0,99999990 (> 0,999) | PASS |
| peak HBM | 15,315 GB (chip 0) / 8,552 GB (chips 1–7) < 15,5 GB | PASS |
| compilaciones | 590,02 / 2,54 / 308,42 s ≤ 1200 s | PASS |
| trazas de decode | 1 (8 pasos) | PASS |

Datos adicionales: consistencia de caché (496 prefill + 16 decode frente a 512 prefill) con mrel 2,7405e-06, cosine 0,9999999999952 y top-1 match; generación libre con 6/6 prompts con coincidencia exacta token a token y 63/63 pasos teacher-forced en CPU y Tesla T4 CUDA; error absoluto máximo de 0,9572 en la posición 2701 a 4096 tokens, con top-1 y top-5 correctos en esa posición. Las dos discrepancias de top-5 son intercambios casi empate entre rangos 5 y 6 (márgenes de referencia 0,0084 y 0,0144).

## Requisitos de hardware

- VRAM/HBM: el port está diseñado para TPU v5e-8 (8 × TPU v5 lite, 16,9 GB de HBM por chip). Pico medido de 15,315 GB en el chip 0 y 8,552 GB en los chips 1–7 a 4096 tokens; 12,932 GB de pico a 512 tokens.
- Memoria de host: pico de RSS de aproximadamente 11,2 GB durante la carga por streaming; el contenedor de Kaggle dispone de 32,2 GB de cgroup RAM.
- GPU: no es el objetivo del port, pero la referencia de verificación se ejecutó en una Tesla T4 CUDA. No hay datos de despliegue en A100, H100 o RTX 4090 en la información proporcionada.
- Consumer GPU: no disponible; el checkpoint completo en BF16 (55,6 GB) excede la memoria de cualquier GPU de consumo actual, y el port no documenta cuantizaciones.
- Opciones de despliegue: JAX/XLA sobre TPU v5e-8 (Kaggle), con scripts `run_4k_tpu.py` y `run_4k_reference.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill en caliente de 0,153 s (512 tokens) y 1,200 s (4096 tokens); decode de 17,3–19,9 ms/token a 512 y 29,4–30,4 ms/token a 4096. Tiempos de compilación de 590,02 s, 2,54 s y 308,42 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChukarAI/Qwen3.8-27B-JAX-TPU | 26,896 B (ruta texto) | verificado hasta 4096 | Port JAX/TPU text-only | Apache 2.0 | Hugging Face + GitHub |
| Qwen/Qwen3.8-27B | 26,896 B (ruta texto) + visión + MTP | no disponible | Modelo base original | Apache 2.0 (según el port) | Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el modelo base: este port elimina visión y MTP, y añade una implementación JAX verificada numéricamente frente a referencias FP32. No se dispone de información sobre otros portes o modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Release text-only: excluye 333 tensores visuales y 15 tensores MTP, por lo que no puede realizar tareas de visión ni multi-token prediction.
- Fallo estricto declarado a 4096 tokens: top-5 en 4094/4096 posiciones, con dos discrepancias de casi empate. Para aplicaciones que dependan de top-5 exacto a contexto largo, esto es un caveat real.
- Modo de precisión diagnóstica: todos los números aceptados usan pesos almacenados en BF16; no se documentan modos de cuantización para producción.
- Divergencia forense: el análisis indica que la divergencia a 4096 tokens se origina en el backbone de 64 capas, sin artefacto de chunking ni discrepancia de precisión en RoPE (cos/sin ≤ 1 ULP frente a `transformers==5.16.1`).
- Dependencias fijadas: requiere `torch==2.10.0` y `transformers==5.16.1` para la referencia; en Kaggle hay que añadir `torchvision==0.25.0` y `torchaudio==2.10.0` para alinear el ABI de torch.
- Idiomas: no se declara una lista de idiomas soportados; la verificación cubre inglés, persa y código, lo que no garantiza cobertura multilingüe amplia.
- Repositorio sin pesos: el repo tiene 0,0 GB y solo contiene código, fixtures y reports; los pesos se descargan de `Qwen/Qwen3.8-27B` en la revisión fijada, por lo que la reproducibilidad depende de que esa revisión permanezca disponible.
- Credenciales: las instrucciones de reproducción exigen usar credenciales rotadas configuradas fuera del repositorio; el autor advierte explícitamente de no commitear secretos.
- Sesgos y alucinación: no hay información específica en la documentación proporcionada sobre sesgos del modelo base ni tasas de alucinación.
- Uso comercial: la licencia Apache 2.0 del port lo permite, pero conviene verificar la licencia del modelo base Qwen3.8-27B de forma independiente antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChukarAI/Qwen3.8-27B-JAX-TPU
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub v1.0.0: https://github.com/ChukarAI/qwen3.8-27b-jax-tpu
- Informe forense P1: `docs/reports/13_p1_final_verdict_and_forensics.md` (dentro del repositorio GitHub)
- Artefacto de verificación: `tpu_report.json`, SHA-256 `039dff4e37dcd8bf6b7eee17af8464a440ecb2d29806bc27245aa7b4d8454f47`
