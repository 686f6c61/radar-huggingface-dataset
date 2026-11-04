# qwegnai/Qwen3.8-27B-hq4g32

## Resumen

Qwen3.8-27B-hq4g32 es un paquete de pesos cuantizados del modelo Qwen3.8-27B de Alibaba Qwen, empaquetado por el usuario qwegnai para su uso exclusivo con el motor de inferencia Qwegn, un runtime escrito en Swift y Metal 4 orientado a Apple Silicon. No se trata de un checkpoint estándar en safetensors, GGUF o MLX, sino de un contenedor propietario `QWP1` que solo carga en dicho motor, por lo que su utilidad queda restringida al ecosistema Qwegn en equipos Mac con chip de la serie M.

El modelo base es un transformer denso híbrido de 64 capas y 27.780 millones de parámetros, con 48 capas Gated-DeltaNet y 16 capas de atención completa, dimensión oculta de 5120, GQA con 24 cabezas de consulta y 4 de clave-valor, cabeza MTP y torre de visión. El paquete aplica una cuantización propia denominada `HQ4_G32_M5` que combina códigos de 4 bits con rotación Walsh-Hadamard por grupos de 32 pesos y escalas/bias en FP16, alcanzando 5,69 bits por parámetro y un tamaño de 18,40 GiB.

La relevancia de este paquete reside en su soporte de Latent Sparse Attention (LSA) para contexto largo: según la model card, mantiene el prefill cerca de 850 tok/s entre 64K y 1M tokens en un M5 Max, con una ventana nativa de 262.144 tokens y extensión probada hasta aproximadamente 1M mediante YaRN. Es, por tanto, una pieza pensada para experimentación con contexto masivo en hardware de consumo Apple, no para despliegue en servidores GPU convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido de 64 capas: 48 Gated-DeltaNet + 16 full-attention, 5120 hidden, 24Q/4KV GQA, cabeza MTP, torre de visión |
| Parametros totales | 27,78 B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensión de inferencia probada cerca de 1M con YaRN + LSA |
| Tipos de cuantizacion | `HQ4_G32_M5` (4 bits por grupo de 32 con rotación Walsh-Hadamard, escala y bias FP16) + BF16; 5,69 bits/parámetro |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor propietario `QWP1` (no safetensors, no GGUF, no MLX); sidecar `model.qlsa` incluido |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que alterna 48 capas Gated-DeltaNet (mecanismo de estado recurrente lineal) con 16 capas de atención completa, distribuidas en 64 capas totales. La dimensión oculta es de 5120, con atención GQA de 24 cabezas de consulta y 4 de clave-valor, e incorpora una cabeza MTP (multi-token prediction) que el motor Qwegn aprovecha para decodificación especulativa, además de una torre de visión que procesa imágenes. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la documentación proporcionada.

La innovación destacable del paquete es Latent Sparse Attention (LSA), implementada como sidecar `model.qlsa`. Se construye mediante SVD offline de la porción sin RoPE de las cabezas `wq`/`wk` cuantizadas (dimensiones 64–255), con dimensión de índice 64, agrupación en superbloques de 512 tokens que se asignan a 64 buckets de Ward (≤16 tokens cada uno) y pooling de claves en bloques de 4 tokens. En tiempo de inferencia, cada consulta de atención completa se restringe a los tokens sink, los top-k bloques de 4 tokens más similares (k = 2048 tokens) y una ventana local de 512 tokens. Los prompts por debajo de 2564 tokens ejecutan atención densa bit-exacta. La cuantización `HQ4_G32_M5` aplica una rotación Walsh-Hadamard ortonormal por grupo de 32 pesos antes de almacenar códigos de 4 bits, lo que reparte los valores atípicos y reduce el error sin datos de calibración; la rotación se fusiona en los kernels GEMV/GEMM. El embedding de tokens y la torre de visión se mantienen en BF16.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Procesamiento de imágenes mediante torre de visión integrada en BF16.
- Generación de código: la model card reporta 73/100 en una evaluación de 50 tareas HumanEval más 50 de MBPP con razonamiento desactivado.
- Contexto largo: ventana nativa de 262.144 tokens y extensión de inferencia probada hasta aproximadamente 1M tokens con YaRN y LSA.
- Decodificación especulativa mediante cabeza MTP (Variational MTP-3) o mediante el drafter DFlash 2 publicado por separado.
- Recuperación de información en contexto largo: 3/3 en prueba de tres agujas (needles al 10%, 50% y 90% de profundidad) desde 64K hasta 1M tokens.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible.

## Casos de uso

- Análisis de repositorios completos en un Mac: con 262.144 tokens nativos y extensión a 1M, el modelo puede recibir un árbol de código extenso más su documentación en una sola pasada y responder preguntas de arquitectura o dependencias sin trocear el contexto.
- Auditoría de contratos y documentación legal extensa: la ventana de contexto permite cargar expedientes completos de cientos de páginas y formular consultas cruzadas, apoyándose en la recuperación de agujas verificada hasta 1M tokens para localizar cláusulas concretas.
- Asistente de investigación local con privacidad: al ejecutarse íntegramente en Apple Silicon mediante Qwegn, los datos no salen del equipo, lo que encaja en entornos con requisitos de confidencialidad donde no se permite enviar documentos a APIs externas.
- Generación y revisión de código en estaciones de trabajo Mac: el rendimiento de 73/100 en HumanEval+MBPP y la decodificación especulativa de ~84 tok/s permiten usarlo como asistente interactivo en editores y pipelines locales de revisión.
- Procesamiento de documentos escaneados o con figuras: la torre de visión en BF16 permite extraer información de imágenes y PDFs renderizados, combinando entrada visual y texto largo en la misma sesión.
- Experimentación con contexto masivo y atención dispersa: investigadores pueden comparar el comportamiento de LSA frente a atención densa (el paquete incluye modo `auto` y `off`) y medir latencia, TTFT y recall en cargas de 64K a 1M tokens sobre hardware de consumo.
- Evaluación de decodificación especulativa: la cabeza MTP y la compatibilidad con el drafter DFlash 2 permiten estudiar el equilibrio entre aceptación de tokens, latencia y fidelidad frente a decodificación greedy exacta.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre Apple M5 Max (Mac17,6, 128 GB de memoria unificada, GPU de 40 núcleos, 585 GB/s), macOS 26, `llmprobe v0.6.16`, `--kv-mode q4 --temperature 0`:

| Metrica | Resultado |
|---|---|
| Prefill (prompt de 64K) | 876 tok/s (834 a 10K) |
| TTFT en frío | 113 ms |
| TTFT con caché de prompt caliente | 6 ms |
| Decodificación estándar (serial) | 31,2 tok/s |
| Decodificación especulativa (Variational MTP-3) | 84,4 tok/s |
| Decodificación especulativa (drafter DFlash 2) | 83,8 tok/s |
| Prefill / decodificación a 1M tokens (LSA) | 805 / 43,1 tok/s |
| Recall de agujas 64K → 1M | 3/3 en cada longitud |
| Evaluación de código (50 HumanEval + 50 MBPP) | 73/100 |

Comparativa LSA (`auto`) frente a atención densa (`off`) en la misma máquina:

| Contexto nominal | Prefill tok/s (LSA / densa) | TTFT (LSA / densa) | Decode tok/s (LSA / densa) | Recall | Aceleración (prefill · decode) |
|---|---|---|---|---|---|
| 64K | 876 / 672 | 73,1 s / 95,3 s | 50,7 / 42,1 | 3/3 vs 3/3 | 1,30× · 1,20× |
| 262K | 858 / 351 | 286,1 s / 699,5 s | 49,0 / 25,3 | 3/3 vs 3/3 | 2,45× · 1,93× |
| 1M | 805 / — | 1.288,5 s / — | 43,1 / — | 3/3 | densa no ejecutada |

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Memoria unificada: el paquete ocupa 18,40 GiB en disco; en ejecución requiere memoria unificada suficiente para pesos, caché KV en q4 y buffers del motor. La model card reporta funcionamiento en un M5 Max con 128 GB, pero no detalla el mínimo.
- GPU compatibles: exclusivamente Apple Silicon con soporte de Metal 4 (el motor Qwegn es Swift + Metal). No hay soporte para GPU NVIDIA, AMD ni CPU x86.
- Cabe en GPU de consumo: sí, en chips Apple M-series con memoria unificada suficiente; no aplica a RTX 4090, A100 ni H100 porque el formato `QWP1` no carga fuera de Qwegn.
- Opciones de despliegue: únicamente el motor Qwegn (repositorio `qwegnai/qwegine`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput: prefill de 876 tok/s a 64K, TTFT en frío de 113 ms, decodificación serial de 31,2 tok/s y especulativa de ~84 tok/s en M5 Max; a 1M tokens, 805 tok/s de prefill y 43,1 tok/s de decodificación con LSA.
- Almacenamiento: 19,8 GB de repositorio; conviene SSD rápido por el tamaño del contenedor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-hq4g32 (este paquete) | 27,78 B | 262.144 nativos; ~1M con YaRN + LSA | `QWP1`, solo Qwegn en Apple Silicon | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27,78 B | 262.144 nativos | Safetensors (presumiblemente), ecosistema estándar | Apache 2.0 | HuggingFace |
| qwegnai/Qwen3.8-27B-DFlash2-hq4g32 | 27,78 B (base) | Igual que el paquete base | `QWP1` + drafter DFlash 2, solo Qwegn | Apache 2.0 | HuggingFace |

La comparación con alternativas de otros fabricantes o con cuantizaciones GGUF/MLX del mismo modelo base no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Formato propietario: el contenedor `QWP1` solo carga en el motor Qwegn; no es utilizable con herramientas estándar como llama.cpp, vLLM, Ollama, TGI o MLX.
- Plataforma restringida: requiere Apple Silicon con Metal 4; no hay soporte para GPU NVIDIA, AMD ni CPU.
- Madurez y adopción: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el motor Qwegn es un proyecto de autor único, lo que implica riesgo de mantenimiento y de estabilidad de la API.
- Extensión de contexto: superar los 262.144 tokens es una extensión en tiempo de inferencia, no entrenamiento adicional; la fidelidad más allá de esa longitud no está garantizada.
- Recall de agujas: el resultado 3/3 proviene de un único ejercicio de recuperación con tres agujas y no constituye una garantía de precisión general en contexto largo.
- Decodificación especulativa: la aceptación variacional puede alterar la salida respecto a una decodificación greedy exacta, lo que afecta a la reproducibilidad.
- Cuantización agresiva: 5,69 bits por parámetro puede degradar tareas sensibles a precisión; la model card solo aporta una evaluación de código (73/100) como referencia de calidad.
- Idiomas: no se especifican los idiomas soportados; no hay garantía documentada para castellano u otras lenguas distintas del inglés.
- Sesgos y alucinación: no hay información específica sobre sesgos del modelo base ni sobre tasas de alucinación en la documentación proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen puede tener términos adicionales que conviene verificar en su propia model card.
- Rendimiento dependiente de térmica y carga: la propia model card advierte que los resultados varían con el workload y la temperatura del equipo.

## Enlaces

- HuggingFace del paquete: https://huggingface.co/qwegnai/Qwen3.8-27B-hq4g32
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash 2: https://huggingface.co/qwegnai/Qwen3.8-27B-DFlash2-hq4g32
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegine
- Paper, blog o demo adicionales: no disponible
