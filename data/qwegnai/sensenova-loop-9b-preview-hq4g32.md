# qwegnai/SenseNova-Loop-9B-Preview-hq4g32

## Resumen

SenseNova-Loop-9B-Preview-hq4g32 es un pack de pesos cuantizados del modelo SenseNova-Loop-9B-Preview, publicado por el usuario qwegnai para su motor de inferencia propietario Qwegn. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del checkpoint original de SenseNova a un contenedor propio (`QWP1`) optimizado para Apple Silicon mediante Swift y Metal 4. El modelo base emplea una arquitectura de transformer con bucles (looped transformer), atención latente dispersa (LSA) y capas híbridas Gated-DeltaNet, con 9.660 millones de parámetros y una ventana de contexto nativa de 262.144 tokens.

La relevancia de este pack radica en su enfoque de cuantización: emplea el formato `HQ4_G32`, que combina una rotación ortonormal de Walsh-Hadamard sobre grupos de 32 pesos con códigos de 4 bits y escalas FP16, alcanzando 6,68 bits por parámetro. Según la model card, esta técnica reduce el error de cuantización sin necesidad de datos de calibración, manteniendo en BF16 solo el embedding de tokens y la torre de visión. El resultado es un pack de 7,51 GiB que, según las mediciones del autor, logra 1.749 tok/s de prefill a 64K tokens y una recuperación de aguja perfecta (3/3) hasta 1M de tokens gracias a LSA.

Es importante subrayar que este repositorio no contiene safetensors ni GGUF: solo carga en el motor Qwegn, lo que limita drásticamente su portabilidad fuera del ecosistema Apple Silicon. La información disponible proviene exclusivamente de la model card del autor y no incluye datos de entrenamiento, benchmarks estandarizados del modelo base ni detalles sobre sesgos o limitaciones más allá de las advertencias técnicas del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (32 capas físicas → 56 efectivas), 24 capas Gated-DeltaNet + 8 capas de atención completa, mHC de 2 flujos con Sinkhorn, cabeza MTP, torre de visión |
| Parametros totales | 9,66 B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensión en inferencia probada cerca de 1M con YaRN + LSA |
| Tipos de cuantizacion | `HQ4_G32` (4 bits con rotación Walsh-Hadamard, escala y sesgo FP16, 5 bits por peso) + BF16 para embedding y torre de visión; 6,68 bits/parámetro global |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor propietario `QWP1` (no safetensors, no GGUF, no MLX); sidecar `model.qlsa` para LSA |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B-Preview emplea una arquitectura de transformer con bucles: 32 capas físicas donde las capas 4 a 27 se ejecutan dos veces, dando lugar a 56 capas efectivas. Combina 24 capas Gated-DeltaNet (un mecanismo de estado recurrente lineal) con 8 capas de atención completa, e incorpora un módulo mHC (multi-head cross-attention) de 2 flujos con normalización Sinkhorn, una cabeza MTP (multi-token prediction) para decodificación especulativa y una torre de visión. El contexto nativo es de 262.144 tokens, extensible en inferencia mediante YaRN y LSA.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original; la model card del pack cuantizado no los detalla. La innovación técnica destacable de este repositorio es la cuantización `HQ4_G32`: cada grupo de 32 pesos se rota mediante una transformada rápida de Walsh-Hadamard, lo que distribuye los valores atípicos y permite almacenar códigos de 4 bits con una escala y un sesgo FP16 (20 bytes por grupo de 32 pesos). La rotación se fusiona en los kernels GEMV/GEMM del motor Qwegn, evitando buffers de pesos desempaquetados. Además, el sidecar `model.qlsa` contiene una proyección SVD offline de las cabezas `wq`/`wk` sin RoPE (dimensiones 64–255) para la atención latente dispersa, que restringe cada consulta de atención completa a los tokens sumidero, los bloques de 4 tokens más similares (presupuesto de 2.048 tokens) y una ventana local de 512 tokens.

## Capacidades

- Generación de texto autoregresiva con decodificación estándar y decodificación especulativa mediante MTP variacional (hasta 3 tokens de borrador).
- Razonamiento multi-paso y cadena de pensamiento, con modo de razonamiento desactivable (la evaluación de código se realizó con razonamiento desactivado).
- Generación de código, evaluada en 50 tareas de HumanEval y 50 de MBPP.
- Procesamiento de imágenes mediante torre de visión integrada (mantenida en BF16).
- Contexto largo: recuperación de aguja en posiciones al 10%, 50% y 90% de profundidad hasta 1M de tokens con LSA.
- Atención latente dispersa (LSA) activable en tiempo de inferencia, con bypass denso bit-exacto para prompts inferiores a 2.564 tokens.
- Decodificación especulativa con MTP (Variational MTP-3 o DFlash 2) para acelerar la generación.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos en local: con 262.144 tokens nativos y extensión probada a 1M, el modelo puede procesar contratos, informes o bases de código completas en un solo prompt en un Mac con memoria unificada, sin depender de la nube.
- Recuperación de información en corpus largos: la combinación de LSA y la ventana de 262K permite localizar pasajes concretos en haystacks de cientos de miles de tokens, con una velocidad de prefill de 1.606 tok/s a 262K según el autor.
- Asistencia de código en Apple Silicon: la evaluación de 46/100 en HumanEval + MBPP y la velocidad de decodificación especulativa (93,9 tok/s) lo hacen viable para autocompletado y generación de funciones en entornos de desarrollo sobre macOS.
- Prototipado de agentes con contexto acumulado: la caché de prompt caliente (TTFT de 7 ms) permite iteraciones rápidas sobre conversaciones multi-turno largas, aunque el soporte explícito de tool calling no está documentado.
- Procesamiento de imágenes con texto: la torre de visión en BF16 permite tareas de descripción, extracción de información o respuesta a preguntas sobre imágenes, manteniendo la calidad visual sin penalizar la decodificación.
- Investigación en arquitecturas looped y atención dispersa: el pack y el sidecar LSA permiten reproducir experimentos de escalado de contexto (64K a 1M) y medir el impacto de la cuantización HQ4 en tareas de recuperación.
- Despliegue edge en estaciones de trabajo Mac: con 7,51 GiB de pack y 128 GB de memoria unificada en un M5 Max, el modelo cabe holgadamente y deja espacio para caché KV cuantizada (q4) en contextos muy largos.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor y se midieron en un Apple M5 Max (Mac17,6, 128 GB de memoria unificada, GPU de 40 núcleos, 585 GB/s), macOS 26, con `llmprobe v0.6.16`, `--kv-mode q4 --temperature 0`.

| Metrica | Resultado |
|---|---|
| Prefill (prompt de 64K) | 1.749 tok/s |
| TTFT en frío | 64 ms |
| TTFT con caché de prompt caliente | 7 ms |
| Decodificación estándar (serial) | 48,9 tok/s |
| Decodificación especulativa (Variational MTP-3) | 93,9 tok/s (102,4 en texto predecible) |
| Prefill / decodificación a 1M con LSA | 1.476 / 46,5 tok/s |
| Recuperación de aguja 64K → 1M | 3/3 en todas las longitudes |
| Evaluación de código (50 HumanEval + 50 MBPP) | 46/100 |

Escalado de contexto con LSA (cada celda: LSA `auto` / denso `off`):

| Escalon | Prefill tok/s | TTFT | Decode tok/s | Recuperación | Aceleración LSA (prefill · decode) |
|---|---|---|---|---|---|
| 64K | 1.749 / 1.207 | 36,6 s / 53,1 s | 75,2 / 65,0 | 3/3 vs 0/3 | 1,45× · 1,16× |
| 262K | 1.606 / 568 | 152,8 s / 432,5 s | 70,4 / 38,6 | 3/3 vs 1/3 | 2,83× · 1,82× |
| 1M | 1.476 / — | 702,9 s / — | 46,5 / — | 3/3 | denso no ejecutado |

El autor advierte que las etiquetas de contexto son escalones nominales de benchmark y que las longitudes reales tokenizadas fueron 64.060, 120.673, 245.423, 544.656 y aproximadamente 1.037.119 tokens. No se han publicado resultados de benchmarks estandarizados (MMLU, GSM8K, etc.) del modelo base en la información disponible.

## Requisitos de hardware

- VRAM / memoria: el pack ocupa 7,51 GiB en disco; en inferencia se necesita memoria unificada adicional para la caché KV (cuantizada a q4 en las mediciones) y el estado del motor. Con 128 GB de memoria unificada en un M5 Max se ejecutaron contextos de hasta 1M de tokens.
- GPU recomendadas: Apple Silicon exclusivamente. Las mediciones se realizaron en un Apple M5 Max con GPU de 40 núcleos y 585 GB/s de ancho de banda. No hay soporte documentado para GPU NVIDIA, AMD o Intel.
- GPU de consumo: sí cabe en Apple Silicon de gama alta; el pack de 7,51 GiB es asequible para Mac con 16 GB o más de memoria unificada, aunque los contextos largos requieren más memoria para la caché KV.
- Opciones de despliegue: únicamente el motor Qwegn (Swift + Metal 4). No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX, ya que el contenedor `QWP1` es propietario.
- Latencia y throughput: prefill de 1.749 tok/s a 64K, TTFT en frío de 64 ms, TTFT caliente de 7 ms, decodificación de 48,9 tok/s en serie y 93,9 tok/s con MTP-3, según el autor en M5 Max.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandarizados del modelo base ni de alternativas equivalentes en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A nivel estructural, las alternativas más cercanas serían modelos de ~9B con contexto largo y soporte de visión, pero no se han proporcionado sus especificaciones ni resultados para contrastar.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview-hq4g32 | 9,66 B | 262K nativo (1M con YaRN + LSA) | Apache-2.0 | `QWP1` (solo Qwegn) | Apple Silicon |
| SenseNova-Loop-9B-Preview (base) | 9,66 B | 262K nativo | Apache-2.0 | No disponible en la información | No disponible en la información |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Portabilidad nula: el contenedor `QWP1` solo carga en el motor Qwegn; no es un safetensors, GGUF ni MLX, por lo que no puede usarse con las herramientas estándar del ecosistema.
- Dependencia de hardware: requiere Apple Silicon con Metal 4; no hay soporte para GPU NVIDIA, AMD ni entornos Linux/Windows.
- Resultados de benchmarks limitados: la evaluación de código (46/100 en HumanEval + MBPP) es pequeña y se realizó con razonamiento desactivado; no hay datos de MMLU, GSM8K ni otras tareas estándar.
- Recuperación de aguja: el 3/3 se obtuvo en un único ejercicio de tres agujas, no es una garantía de precisión general.
- Extensión de contexto: superar los 262.144 tokens es una extensión en tiempo de inferencia, no entrenamiento adicional; la fidelidad más allá de esa longitud no está garantizada.
- Decodificación especulativa: la aceptación variacional puede alterar la salida respecto a la decodificación greedy exacta.
- Idiomas: no se especifican los idiomas soportados, lo que impide evaluar su cobertura multilingüe.
- Sesgos y alucinaciones: no hay información publicada sobre sesgos conocidos ni tasas de alucinación del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero el formato propietario y la dependencia del motor Qwegn condicionan la viabilidad en producción.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 4 de noviembre de 2026; se trata de un artefacto reciente y sin validación comunitaria.

## Enlaces

- Pack en Hugging Face: https://huggingface.co/qwegnai/SenseNova-Loop-9B-Preview-hq4g32
- Modelo base: https://huggingface.co/SenseNova/SenseNova-Loop-9B-Preview
- Repositorio del motor Qwegn: https://github.com/qwegnai/qwegine
- Paper, blog o demo del modelo base: no disponible en la información proporcionada.
