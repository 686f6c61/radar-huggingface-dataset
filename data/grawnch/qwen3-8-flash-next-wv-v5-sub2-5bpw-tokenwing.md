# Grawnch/Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-TokenWing

## Resumen

Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-TokenWing es una cuantización GGUF de tipo MoE del modelo Qwen/Qwen3.8-Flash-Next (aproximadamente 180B parámetros totales), publicada por el usuario Grawnch. No se trata de un modelo entrenado desde cero, sino de un checkpoint cuantizado a muy baja precisión efectiva (2,46 bpw en los expertos enrutados, dentro de slices de 2,50 bpw) que emplea un plugin propietario de cuantización denominado TokenWing (wv-plugin-v1.3, ABI v2) para poder ejecutarse en el runtime runmyai/tokenwing. El objetivo es permitir la inferencia de un modelo de gran tamaño en hardware de consumo mediante streaming de expertos desde NVMe.

La arquitectura subyacente es un transformer híbrido con 48 capas que combinan GDN (Gated Delta Network) y atención dispersa QSA, con 512 expertos enrutados y top-10 activos por token. El modelo base está publicado bajo licencia Apache 2.0. La cuantización preserva una "espina dorsal" densa sin pérdida en Q6_K/Q8_0/BF16/F32, mientras que los expertos enrutados se codifican con codebooks VQ4 y SVD de rango 8.

Su relevancia actual radica en que demuestra una ruta viable para ejecutar modelos de escala 180B en GPUs de menos de 12 GB de VRAM mediante streaming selectivo de expertos por NVMe, con velocidades reportadas de 21-38 tok/s en portátiles y 56-68 tok/s en estaciones de trabajo con GPU completa. Es, por tanto, un artefacto muy especializado que depende de un runtime y un plugin concretos, no un GGUF estándar de llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE (48 capas GDN + QSA dispersa, 512 expertos enrutados, top-10) |
| Parámetros totales | 176.943.899.520 (≈176,9B; la model card indica 180B) |
| Parámetros activos | top-10 de 512 expertos enrutados (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible (los ejemplos de uso emplean `-c 8192` y `-c 32768`) |
| Tipos de cuantización | TokenWing ABI v2: EXT2 (tipo 114) para MoE, VQ4_G32 + SWZ2_G64, espina densa Q6_K/Q8_0/BF16/F32, PLE Q4_0, Rank-8 SVD auxiliar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en 2 shards (39,48 GiB + 26,82 GiB), plugin de cuantización externo requerido |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea un trunk híbrido de 48 capas que combina capas GDN (Gated Delta Network, un mecanismo de atención lineal/estado recurrente) con capas de atención dispersa QSA. La componente MoE cuenta con 512 expertos enrutados con activación top-10 por token, además de expertos compartidos co-destilados en BF16 y codificados como Q8_0. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esos datos corresponden al modelo base y no se detallan en la información proporcionada.

La innovación técnica de esta publicación es la cuantización: los expertos enrutados se codifican con codebooks vectoriales VQ4 de dimensión [4, 256, 4] en int8, junto con SWZ2_G64 en 28 de las 48 capas para `down_exps`, y 1.152 registros residuales SVD de rango 8 en FP16 balanceado. La espina densa (trunk, output y expertos compartidos) se mantiene sin pérdida. Se incluyen blobs auxiliares de enrutamiento (`vram_experts` con H=96, `usage_seed`, `layer_order`) para el streaming selectivo de expertos. La paridad de logits entre CPU y CUDA se reporta con coseno de 1.000000.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, plantilla de chat embebida).
- Razonamiento y matemáticas: la model card reporta PPL específica sobre "Math & Systems Code" (2,5550), lo que sugiere competencia en dominios técnicos.
- Generación de código, incluyendo código de sistemas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende del modelo base, no confirmado aquí).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de un modelo de escala 180B en portátiles con GPU de menos de 12 GB: mediante el streaming de expertos por NVMe del runtime TokenWing, se pueden servir cargas conversacionales a 21-38 tok/s sin necesidad de GPUs de datacenter.
- Despliegue en estaciones de trabajo con GPU única de gran VRAM: con `-ngl 99` y todos los pesos en VRAM, se obtienen 56-68 tok/s de decodificación, adecuado para asistentes de código interactivos.
- Evaluación e investigación de técnicas de cuantización extrema: el checkpoint sirve como referencia reproducible para estudiar el impacto de 2,46 bpw en PPL y KLD frente a la variante de 3,5 bpw.
- Generación de código de sistemas en local: la PPL reportada en "Math & Systems Code" (2,5550) y las velocidades de decodificación permiten su uso en tareas de autocompletado y revisión de código sin enviar datos a la nube.
- Procesamiento por lotes offline con presupuesto de VRAM limitado: el modo de streaming con caché de expertos (91,92% de aciertos reportado) permite ejecutar generaciones largas en hardware modesto.
- Experimentación con runtimes de cuantización personalizados: útil para desarrolladores que quieran validar el plugin TokenWing ABI v2 y sus kernels AVX-512 VNNI en Linux o Windows.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son métricas de perplejidad y throughput del propio autor:

| Métrica | Valor |
|---|---|
| WikiText-2 PPL (c=512), este checkpoint | 3,6113 |
| WikiText-2 PPL (c=512), WV-v5-3.5bpw | 3,1299 |
| Math & Systems Code PPL (c=512), este checkpoint | 2,5550 |
| Math & Systems Code PPL (c=512), WV-v5-3.5bpw | 2,4875 |
| KLD mediana / media (WikiText-2) | 0,07073 / 0,40344 |
| KLD mediana / media (Math & Code) | 0,01165 / 0,16549 |
| Throughput CPU 8 hilos AVX-512 VNNI | 0,2157 ms/matmul (0,4314 ms/capa) |
| Streaming NVMe, <12 GB VRAM (cold, H=96) | 8,17 tok/s |
| Streaming NVMe, <12 GB VRAM (top-10 exacto) | 23,10 tok/s (técnico) / 22,79 tok/s (código) |
| Streaming NVMe con plugin v1.3 (portátil) | 37,8 tok/s |
| GPU completa (RTX PRO 6000 Blackwell, `-ngl 99`) | 68,35 tok/s (completion 256 tok), 56,58 tok/s (tg128), 116,11 tok/s (pp512) |

## Requisitos de hardware

- VRAM para inferencia completa: el repositorio ocupa 113,6 GB en total (dos shards de 39,48 GiB y 26,82 GiB); cargar todos los pesos en VRAM requiere del orden de 70-115 GB, por lo que solo es viable en GPUs profesionales (RTX PRO 6000 Blackwell, A100 80GB, H100).
- Modo streaming de bajo consumo: funciona con menos de 12 GB de VRAM y 6 GiB de RAM dedicados al streaming, leyendo aproximadamente 130 MiB por token desde NVMe.
- GPU de consumo: no cabe completa en ninguna GPU de consumo; en modo streaming puede ejecutarse con GPUs de 8-12 GB (por ejemplo, RTX 3060 12GB, RTX 4070) siempre que se disponga de un SSD NVMe rápido.
- Opciones de despliegue: exclusivamente el runtime runmyai/tokenwing (rama `dev`, commit >= 6a3e018f) con el plugin `libqfn_wv_plugin.so` (Linux x86_64, GLIBC <= 2.34) o `qfn_wv_plugin.dll` (Windows x86_64). No es compatible con llama.cpp estándar, vLLM, TGI ni Ollama sin el plugin.
- Latencia y throughput: ver tabla de benchmarks; el rendimiento depende críticamente del ancho de banda del NVMe y de si la CPU soporta AVX-512 VNNI.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-TokenWing | ≈176,9B (MoE, top-10) | no disponible | TokenWing EXT2 2,46 bpw + espina densa lossless | Apache 2.0 | Requiere runtime y plugin TokenWing |
| Qwen3.8-Flash-Next (base) | ≈180B (MoE) | no disponible | BF16 original | Apache 2.0 | Pesos estándar en Hugging Face |
| WV-v5-3.5bpw (variante del mismo autor) | ≈180B (MoE) | no disponible | 3,5 bpw | Apache 2.0 | Mismo runtime TokenWing |
| Otros GGUF MoE de gran escala (p. ej. variantes Q4_K_M de modelos 100B+) | variable | variable | Q4_K_M estándar | según modelo base | llama.cpp estándar |

La comparación con cuantizaciones GGUF convencionales es limitada porque este checkpoint no es compatible con llama.cpp sin el plugin propietario; en la práctica compite con la variante 3,5 bpw del mismo autor, que ofrece mejor PPL (3,1299 frente a 3,6113 en WikiText-2) a costa de mayor tamaño.

## Limitaciones y advertencias

- Dependencia de un runtime y plugin propietarios: no funciona con llama.cpp, Ollama, vLLM ni TGI estándar; requiere el plugin `wv-plugin-v1.3` y el runtime `runmyai/tokenwing` en versión `dev` concreta.
- Compatibilidad de plataforma restringida: solo Linux x86_64 (GLIBC <= 2.34) y Windows x86_64; el rendimiento óptimo depende de AVX-512 VNNI y F16C.
- Degradación medible frente a la variante 3,5 bpw: la PPL en WikiText-2 sube de 3,1299 a 3,6113 y la KLD media es de 0,40344, lo que indica pérdida de fidelidad en la distribución de salida.
- Riesgo de alucinación: no evaluado en la información disponible; la cuantización extrema puede agravar errores en tareas de razonamiento largo.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento multilingüe adecuado sin validación.
- Longitud de contexto no especificada: los ejemplos usan 8K y 32K, pero no se confirma el máximo del modelo base tras la cuantización.
- Rendimiento muy sensible al almacenamiento: el modo de bajo consumo depende de lecturas NVMe de ~130 MiB por token; un SSD lento degrada drásticamente el throughput.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del plugin TokenWing (cuyos términos de distribución no se detallan) debe revisarse antes de desplegar en producción.
- Modelo con 0 likes y 411 descargas en el momento de la consulta: comunidad muy reducida, sin validación independiente de los resultados reportados por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-TokenWing
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime TokenWing: https://github.com/runmyai/tokenwing
- Plugin wv-plugin-v1.3: https://github.com/grawnchtoader/tokenwing-assets/releases/tag/wv-plugin-v1.3
