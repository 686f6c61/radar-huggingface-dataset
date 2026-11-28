# ahrazzle/SiliInkling-2-Mini-FormA

## Resumen

SiliInkling-2-Mini Form A es una versión cuantizada y refinada del modelo base thinkingmachines/Inkling-2-Mini, publicada por ahrazzle (Moissanite Labs / Foundation-0). Se trata de un transformer MoE con 24 capas físicas, un núcleo recurrente de 3 pasadas sobre las capas L6..17 (48 capas lógicas), 128 expertos enrutados por capa con top-8 y un total de 26,39B parámetros (5,35B activos con K=3). El checkpoint publicado en este repositorio contiene 13.319.603.645 parámetros en safetensors y ocupa 14,2 GB en el repositorio.

La aportación principal es el formato de cuantización propietario `siliquant-hf-v1`, basado en una retícula A_16 con transformada Block-H4 de Walsh-Hadamard y código Extended Hamming [16, 11, 4] con detección SECDED. El objetivo declarado es ejecutar inferencia en GPUs de consumo de 8 GiB (RTX 3080 Laptop) con 31 GiB de RAM de sistema, manteniendo los 168 tensores BF16 del núcleo recurrente sin cuantizar y aplicando un refinamiento ES (evolution strategies) sin retropropagación sobre ese subespacio.

Es relevante por su enfoque poco habitual: cuantización con corrección de errores a nivel de bloque, gauges de calibración para evitar deriva numérica y un esquema de caché de expertos con histéresis. No obstante, el modelo tiene 0 descargas y 0 likes en el momento de la consulta, es una publicación muy reciente (28 de noviembre de 2026) y muchas de las cifras de rendimiento provienen exclusivamente de la model card del autor, sin verificación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo recurrente (3 pasadas sobre L6..17, 48 capas lógicas), 24 capas físicas |
| Parámetros totales | 26,39B en el modelo base; 13.319.603.645 en el checkpoint safetensors publicado |
| Parámetros activos | 5,35B con K=3 (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | `siliquant-hf-v1` (A_16 Block-H4, g=128): 3,0 bpw objetivo en expertos L0..19, 4,5 bpw en expertos de salida L20..23, 132 lineales de atención y lm_head; quotients de 3 o 4 bits con tablas CSR de overflow |
| Idiomas soportados | en |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (25 shards, 14,2 GB en repo), con código custom (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer con mezcla de expertos: 24 capas físicas, hidden=2304, 24 cabezas de consulta y 8 de clave/valor, 128 expertos enrutados por capa con top-8, y un núcleo recurrente que aplica 3 pasadas sobre las capas L6..17, lo que equivale a 48 capas lógicas. La variante Form A no reentrena el modelo desde cero: parte del checkpoint base y aplica cuantización por bloques de 16 pesos, cada uno rotado mediante una transformada Walsh-Hadamard de orden 4 (Block-H4) y proyectado sobre la retícula A_16 = 2Z^16 + C_[16,11,4] con g=128. Cada grupo de 128 pesos almacena 11 bits sistemáticos de información Hamming por bloque, quotients empaquetados de 3 o 4 bits, entradas de overflow en formato CSR disperso y escalas en FP16.

El refinamiento posterior se realiza exclusivamente sobre 168 tensores BF16 del núcleo recurrente (116.785.152 parámetros: 144 puertas de mensaje, 12 o_proj y 12 routers), sin tocar ninguno de los 24.461.180.928 parámetros de expertos enrutados. El método es un ES de 15 pasos sin retropropagación que combina LOO-ROLL con prefijo cacheado, EGGROLL ortogonal de rango 1, QMC con Plastic-φ_d y FT_PIWL. Además, se aplican gauges de calibración (G1, G2, G3) sobre RMSNorm y permutaciones signadas intra-cabeza KV para minimizar la deriva numérica, reportada en 1,073e-6 en FP32. No se detalla la composición del dataset de entrenamiento original del modelo base en la información disponible.

## Capacidades

- Generación de texto conversacional y continuaciones de texto en inglés.
- Razonamiento multi-paso mediante el núcleo recurrente de 3 pasadas (K=3), con modo K=4 documentado para GSM8K.
- Razonamiento matemático: la model card reporta mejoras en Countdown y GSM8K tras el refinamiento ES.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el núcleo recurrente está diseñado para razonamiento iterativo, aunque no se documentan integraciones de agentes.
- Capacidades multilingües: limitadas a inglés según el campo `language` del repositorio.
- Capacidades especiales: cuantización con corrección de errores SECDED, caché global de expertos con histéresis (`HYST_2`) y kernels Triton para GEMV en B=1 sin materialización de pesos BF16.
- Visión y audio: no disponibles.

## Casos de uso

- Inferencia en GPU de consumo: el modelo está diseñado explícitamente para ejecutarse en 8 GiB de VRAM (RTX 3080 Laptop) con 31 GiB de RAM de sistema, con 6,1063 GiB de VRAM asignada en inferencia en vivo según el autor. Adecuado para desarrolladores que quieran probar un MoE de 26B en hardware modesto.
- Experimentación con cuantización extrema: el formato `siliquant-hf-v1` con retícula A_16 y código Hamming permite estudiar el impacto de la cuantización a 3,0-4,5 bpw con corrección de errores en modelos MoE, comparando con GGUF o AWQ.
- Razonamiento matemático de cadena corta: con K=3 y el refinamiento ES, la model card reporta Pass@1 del 50% en GSM8K y Countdown, útil para prototipos de resolución de problemas aritméticos.
- Investigación en optimización sin retropropagación: el esquema ES de 15 pasos sobre 168 tensores BF16 sirve como banco de pruebas para estudiar estrategias evolutivas en subespacios reducidos de modelos grandes.
- Despliegue con caché de expertos: el pool global `HYST_2` con hit rate del 86,07% y reducción del 94,75% de swap chatter frente a LRU es aplicable a servir MoE con memoria limitada en entornos de investigación.
- Evaluación de kernels Triton: los kernels `unpack_a16` y GEMV A_16 fusionados (62,7x más rápidos que PyTorch en unpack, 3,608 tok/s en decodificación K=3) pueden reutilizarse como referencia para implementaciones de cuantización personalizadas.

## Benchmarks y rendimiento

Los datos provienen únicamente de la model card del autor y no han sido verificados de forma independiente.

| Benchmark | Antes del refinamiento ES | Después del refinamiento ES |
|---|---|---|
| Countdown K=3 (NLL) | 1,262549 | 1,237713 |
| Countdown K=3 (Pass@1) | 25% | 50% |
| GSM8K K=3 (Pass@1) | 0% | 50% |
| GSM8K K=4 (NLL) | 1,281626 | 1,252984 |
| WikiText-2 (NLL) | 2,888532 | 2,881669 |
| cos(h3, h4) | 0,237408 | 0,267666 |

| Métrica de inferencia | Valor |
|---|---|
| Throughput decodificación K=3 | 3,608 tok/s (antes 2,71 tok/s, +33,1%) |
| Energía por token | 11,668025 J/tok (antes 24,69 J/tok, -52,7%) |
| Potencia media / pico térmico | 42,103 W / 63 °C |
| VRAM asignada en inferencia | 6,1063 GiB (0 paging NVMe) |
| Hit rate caché de expertos | 86,07% |
| Aceleración unpack_a16 Triton | 0,0879 ms vs 5,508 ms PyTorch (62,7x) |
| Aceleración prefix hoisting L0..5 | 1,3451x, 0,0 de deriva en logits |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: 6,1063 GiB asignados en inferencia en vivo según el autor; wire computacional nominal de 10,0202 GiB y wire de texto de 10,8829 GiB.
- RAM de sistema: 31 GiB recomendados por el autor.
- GPU objetivo: RTX 3080 Laptop (8 GiB). Compatible con GPUs de consumo de 8 GiB o más; para GPUs de 24 GiB (RTX 4090, A100 40GB, H100) hay margen para cachés de expertos mayores.
- Cabe en GPU de consumo: sí, según el diseño declarado (8 GiB).
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. Los kernels Triton propios (`unpack_a16`, GEMV A_16) son parte del paquete de código custom.
- Latencia y throughput: 3,608 tok/s en decodificación K=3 con B=1 sobre el hardware de referencia del autor; 11,668 J/tok.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SiliInkling-2-Mini Form A | 26,39B (base) / 13,32B (checkpoint) | 5,35B (K=3) | no disponible | Apache 2.0 | safetensors + custom code | Cuantización A_16 Block-H4 con SECDED, ES sin backprop |
| thinkingmachines/Inkling-2-Mini | 26,39B | 5,35B (K=3) | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar; referencia directa |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

La comparativa con otras alternativas de la misma categoría no está disponible en la información proporcionada; el único punto de referencia fiable es el modelo base del que deriva.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al estar entrenado solo en inglés, hereda los sesgos del corpus del modelo base.
- Riesgo de alucinación: no evaluado de forma independiente; los benchmarks reportados son de razonamiento matemático, no de fidelidad factual.
- Limitaciones de idioma: solo inglés según el campo `language`; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto: no disponible; no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia: Apache 2.0 heredada, lo que permite uso comercial, pero el código custom (`trust_remote_code=True`) debe auditarse antes de producción.
- Madurez: 0 descargas y 0 likes; publicación de noviembre de 2026 sin validación externa. Las cifras de rendimiento y de deriva numérica provienen exclusivamente del autor.
- Dependencia de kernels y código propietario: el rendimiento reportado (3,608 tok/s, 62,7x en unpack) depende de los kernels Triton del autor; sin ellos, el rendimiento en PyTorch es sustancialmente menor (2,71 tok/s en decodificación).
- Complejidad operativa: el esquema de gauges (G1..G3), la caché `HYST_2` y las tablas CSR de overflow añaden superficie de fallo y dificultan la portabilidad a otros runtimes.
- El refinamiento ES solo toca 168 tensores BF16 del núcleo recurrente; las mejoras en GSM8K y Countdown no implican mejoras generales en otras tareas.

## Enlaces

- Hugging Face: https://huggingface.co/ahrazzle/SiliInkling-2-Mini-FormA
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia del modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/blob/main/LICENSE
- Colección de modelos cuantizados: https://huggingface.co/collections/ahrazzle/siliquant-stratified-lattice-quantized-llms-6b060e6988afd65942cd7768
- Repositorio GitHub de SiliQuant: https://github.com/Moissanite-Labs/siliquant
