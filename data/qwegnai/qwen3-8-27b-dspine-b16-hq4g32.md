# qwegnai/Qwen3.8-27B-DSpine-b16-hq4g32

## Resumen

Qwen3.8-27B-DSpine-b16-hq4g32 es un paquete de pesos cuantizados del modelo drafter DSpine-b16, desarrollado por el usuario qwegnai sobre el modelo base tencent/Qwen3.8-27B-DSpine-b16. No se trata de un modelo generativo de propósito general, sino de un drafter especializado para decodificación especulativa: predice bloques de tokens que el modelo objetivo Qwen3.8-27B verifica después en paralelo, acelerando la generación sin alterar la salida final.

El paquete contiene 2,03 mil millones de parámetros en una arquitectura de 5 capas con atención block-causal, ventana deslizante de 8.192 tokens y un mecanismo de fusión de estados ocultos del modelo objetivo. Está cuantizado en formato propietario HQ4_G32_M5 (6,61 bits por parámetro) y empaquetado en el contenedor QWP1, que solo carga en el motor de inferencia Qwegn, un runtime Swift + Metal 4 para Apple Silicon.

Su relevancia es doble: por un lado, implementa la técnica DSpine descrita en arXiv:2609.36173, que propaga representaciones de predecesores predichos entre posiciones adyacentes del borrador para mantener alta aceptación en bloques de hasta 16 tokens; por otro, demuestra aceleraciones de 3,09× a 4,19× sobre la decodificación serial del objetivo en un Apple M5 Max, con paridad greedy bit-exacta del 100%.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Drafter DSpine block-causal de 5 capas (block_size = 16, D ≤ 15 borradores/ronda) |
| Parámetros totales | 2,03 B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana deslizante nativa de 8.192 tokens (max_position_embeddings = 262.144); genera bloques B = 2..16 para Qwen3.8-27B |
| Tipos de cuantización | HQ4_G32_M5 + BF16 (6,61 bits/parámetro) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor QWP1 propietario de Qwegn (no es safetensors, GGUF ni MLX) |

## Arquitectura y entrenamiento

El drafter combina cinco capas de fusión de características del objetivo con cinco capas de decodificación GQA. La fusión extrae estados ocultos de las capas [1, 16, 31, 46, 61] del modelo Qwen3.8-27B y los proyecta de 5 × 5.120 a 5.120 dimensiones mediante `fc.weight` y `hidden_norm`. El decodificador usa 5.120 de dimensión oculta, 17.408 de intermedio SwiGLU, 32 cabezas de consulta y 8 de clave/valor (head_dim = 128, QK-RMSNorm, rope_theta = 10.000.000) con ventana deslizante de 8.192 tokens.

La innovación central es el mecanismo DSpine: a diferencia de los drafters de difusión por bloques no causales, propaga representaciones de predecesores predichos a través de posiciones adyacentes del borrador conforme avanza la profundidad, lo que sostiene la aceptación hasta bloques de 16 tokens (D = 15 borradores por ronda). Incluye un puente de código de prefijo seleccionado (codebook BF16 de 248.320 × 1.024, rank = 512, recurrencia con compuerta) y una cola de refinamiento serial exact-sender con topK = 16. La verificación en el objetivo se realiza con despachos HQ4/AQ4 emparejados por filas y rollback Gated-DeltaNet de 16 filas. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre la composición del dataset.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa sobre Qwen3.8-27B (bloques de 2 a 16 tokens por ronda).
- Predicción block-causal con propagación de representaciones predecesoras entre posiciones del bloque.
- Fusión de estados ocultos intermedios del modelo objetivo para condicionar los borradores.
- Refinamiento serial exact-sender con tabla de puntuaciones topK = 16.
- Paridad greedy bit-exacta con la decodificación serial del objetivo (identidad SHA-256 del flujo de tokens).
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking de forma nativa: es un componente auxiliar de inferencia, no un modelo de chat.
- Capacidades multilingües: no disponible (heredadas del drafter base, sin datos publicados).

## Casos de uso

- Aceleración de inferencia local en Apple Silicon: desplegar Qwen3.8-27B con este drafter en Qwegn sobre un M5 Max permite pasar de 32,1–32,9 tok/s en serial a 100,5 tok/s de media geométrica, adecuado para asistentes interactivos en máquina local.
- Generación de código en estación de trabajo: con `--mtp-drafts 5` se miden 93,9 tok/s en código algorítmico (2,86× serial), útil para autocompletado y refactorización en IDE sin depender de la nube.
- Redacción técnica de documentos largos: 83,3 tok/s en prosa técnica (2,54× serial) con ventana deslizante de 8.192 tokens, suficiente para secciones de documentación e informes.
- Servicio de inferencia con latencia baja: TTFT en frío de 94 ms y en caliente de 7 ms, con prefill de 832–876 tok/s, apropiado para endpoints de generación con requisitos de primera respuesta.
- Evaluación comparativa de técnicas de decodificación especulativa: el paquete sirve como referencia reproducible de DSpine con paridad bit-exacta verificable por SHA-256.
- Investigación sobre drafters block-causales: permite experimentar con distintos horizontes (`--mtp-drafts 5/7/15`) y medir el compromiso entre aceptación (92,4% a B = 8 frente a 83,3% a B = 16) y throughput.

## Benchmarks y rendimiento

Mediciones del autor en Apple M5 Max (Mac17,6, 128 GB de memoria unificada, GPU de 40 núcleos, 585 GB/s), macOS 26, `llmprobe v0.6.16`, `--kv-mode q4 --temperature 0`, contra el objetivo `qwegnai/Qwen3.8-27B-hq4g32`:

| Métrica | Resultado |
|---|---|
| Decodificación serial del objetivo (baseline) | 32,1–32,9 tok/s |
| Especulativa, pico (B = 8, `--mtp-drafts 7`) | 134,5 tok/s (4,19× serial, τ = 7,47 tok/ronda, 92,4% aceptación) |
| Especulativa, por defecto (B = 6, `--mtp-drafts 5`, media geométrica de 3 cargas) | 100,5 tok/s (3,09× serial) |
| Especulativa, código algorítmico / prosa técnica (B = 6) | 93,9 tok/s (2,86×) · 83,3 tok/s (2,54×) |
| Especulativa, horizonte máximo (B = 16, `--mtp-drafts 15`) | 118,5 tok/s (τ = 12,70 tok/ronda, 83,3% aceptación) |
| Prefill / TTFT en frío / TTFT con caché caliente | 832–876 tok/s · 94 ms · 7 ms |
| Paridad greedy frente al objetivo serial (B = 6..16) | 100% bit-exacta (identidad SHA-256) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo es un drafter y no un generador evaluable de forma independiente.

## Requisitos de hardware

- VRAM/memoria: el paquete ocupa 1,56 GiB, que se suman a la memoria del modelo objetivo Qwen3.8-27B cuantizado.
- GPU soportadas: exclusivamente Apple Silicon con Metal 4; las mediciones publicadas corresponden a un M5 Max de 40 núcleos y 128 GB.
- No es compatible con GPU NVIDIA (A100, H100, RTX 4090) ni con CPU x86: el contenedor QWP1 solo carga en Qwegn.
- Encaje en hardware de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente para alojar también el objetivo; el drafter por sí solo requiere ~1,56 GiB.
- Opciones de despliegue: únicamente el motor Qwegn (Swift + Metal 4). No hay soporte para vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput: TTFT de 94 ms en frío y 7 ms en caliente; 100,5 tok/s de media geométrica y 134,5 tok/s de pico en el hardware de referencia. Los resultados varían con el dominio del prompt, el tamaño de bloque y la temperatura del equipo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-DSpine-b16-hq4g32 (este) | 2,03 B (drafter) | 8.192 (ventana deslizante) | Borrador especulativo para Qwen3.8-27B en Qwegn | Apache 2.0 | Solo Qwegn / Apple Silicon |
| tencent/Qwen3.8-27B-DSpine-b16 (base) | 2,03 B (drafter) | 8.192 (ventana deslizante) | Borrador especulativo sin cuantizar | no disponible | Pesos del drafter original |
| qwegnai/Qwen3.8-27B-hq4g32 | no disponible | hasta 1M con LSA | Modelo objetivo cuantizado | no disponible | Solo Qwegn / Apple Silicon |

No se dispone de datos publicados sobre otros drafters comparables (EAGLE, Medusa, MLP speculators) en la información proporcionada, por lo que la comparación cuantitativa de rendimiento entre alternativas no está disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el objetivo Qwen3.8-27B y el motor Qwegn; no puede usarse con runtimes estándar ni convertirse a GGUF o safetensors.
- Dependencia de plataforma: exclusivo de Apple Silicon con Metal 4; sin soporte para CUDA, ROCm ni CPU.
- El formato QWP1 es propietario y no estándar, lo que limita la portabilidad y la inspección de pesos.
- Las cifras de rendimiento proceden de un único equipo (M5 Max de 128 GB) y varían con el dominio del prompt, el tamaño de bloque y la temperatura; no deben extrapolarse sin medir.
- El drafter no aporta capacidades propias de razonamiento, código o matemáticas: la calidad de la salida depende íntegramente del modelo objetivo.
- Sesgos y riesgo de alucinación: no disponibles para el drafter; heredados del objetivo Qwen3.8-27B.
- Idiomas soportados: no disponible; la cobertura lingüística efectiva vendrá determinada por el objetivo.
- La ventana nativa de 8.192 tokens limita el contexto del drafter; las cifras de 64K–1M con LSA corresponden al modelo objetivo, no a ejecuciones DSpine de 1M.
- Licencia Apache 2.0 permite uso comercial del paquete, pero el modelo base y el objetivo pueden tener condiciones propias que deben verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/qwegnai/Qwen3.8-27B-DSpine-b16-hq4g32
- Modelo base: https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Modelo objetivo: https://huggingface.co/qwegnai/Qwen3.8-27B-hq4g32
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegn
- Paper DSpine: https://arxiv.org/abs/2609.36173
