# askthesultans/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini-GGUF es la versión cuantizada en formato GGUF del modelo Inkling-2-Mini desarrollado por Thinking Machines Lab. Esta redistribución, publicada por el usuario askthesultans, ofrece dos variantes de cuantización (Q8_0 y Q4_K_M) generadas con las herramientas oficiales de llama.cpp a partir de los pesos originales en NVFP4/MXFP8. El modelo base cuenta con 26.070.385.152 parámetros totales (aproximadamente 26.000 millones) y una arquitectura con capas recurrentes en bucle (identificador `inkling2_loop` en llama.cpp), que repite dos pasadas adicionales sobre 12 capas de las 24 almacenadas.

La relevancia de esta ficha radica en dos aspectos. Primero, es una de las primeras distribuciones públicas de un modelo de Thinking Machines Lab en formato GGUF ejecutable localmente. Segundo, el autor aporta mediciones rigurosas de pérdida de calidad por cuantización (perplejidad sobre wikitext-2 y divergencia KL frente a una referencia BF16 en CPU), así como notas específicas para despliegue multi-GPU en hardware AMD con ROCm. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

El modelo es exclusivamente de texto: el conversor de llama.cpp descarta el codificador de visión y las cabezas de predicción multi-token del modelo original. Por tanto, esta versión GGUF no conserva las capacidades multimodales que pudiera tener el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas recurrentes en bucle (`inkling2_loop`), 24 capas almacenadas + 2 pasadas extra sobre 12 capas en bucle |
| Parametros totales | 26.070.385.152 (~26,07 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (27,8 GB / 25,9 GiB), Q4_K_M (17,5 GB / 16,3 GiB); referencia BF16 (48,6 GiB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base); 704 tensores en la conversión BF16 |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura transformer con un mecanismo de bucle: 24 capas almacenadas más dos pasadas adicionales sobre 12 de ellas, lo que en llama.cpp se traduce en 48 slots de capa (24 almacenadas + 2 pasadas extra de las 12 en bucle). Los pesos originales se distribuyen en NVFP4/MXFP8, un formato de cuantización de 4 bits con escalas de bloque. El conversor de llama.cpp desempaqueta estos pesos de 4 bits a BF16, generando un GGUF de 704 tensores y 48,6 GiB que es esencialmente una copia exacta de la release original. A partir de ese BF16 se aplican las cuantizaciones Q8_0 y Q4_K_M sin matriz de importancia (imatrix) ni otras modificaciones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card del repositorio cuantizado no los detalla. La innovación técnica destacable es el mecanismo de bucle (`loop.start`, `loop.end`, `loop.count`, `loop.gate_rank`, `loop.varying`), que permite reutilizar capas con compuertas de control, reduciendo el número de parámetros almacenados a costa de cómputo adicional en inferencia. El soporte para este mecanismo se incorporó a llama.cpp el 20 de noviembre de 2026 (PR #32694, con correcciones en #32429 y #32657).

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generación de texto general, según la naturaleza del modelo base.
- No incluye capacidades de visión: el codificador visual fue descartado en la conversión a GGUF.
- No incluye las cabezas de predicción multi-token del modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (los idiomas no están declarados en el repositorio).
- Compatible con endpoints (`endpoints_compatible` en los tags).
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en estación de trabajo con GPU de consumo: la variante Q4_K_M (17,5 GB) cabe en una tarjeta de 24 GB, lo que permite ejecutar un modelo de 26.000 millones de parámetros en hardware como una RTX 4090 o una Radeon AI PRO R9700 sin depender de la nube.
- Despliegue en servidores con múltiples GPU AMD: el autor documenta la ejecución verificada en 3× Radeon AI PRO R9700 con ROCm 7.2.1, incluyendo la configuración de reparto de capas (`-ts`) necesaria para que el bucle no desbalancee la memoria entre tarjetas.
- Generación de texto conversacional en producción: al ser compatible con endpoints y con llama.cpp, puede servirse detrás de una API HTTP para asistentes conversacionales con licencia Apache-2.0, sin restricciones de uso comercial.
- Sustitución de modelos de mayor tamaño en entornos con VRAM limitada: la variante Q8_0 (+0,03 % de perplejidad frente a BF16) ofrece una calidad prácticamente idéntica al modelo completo en una tarjeta de 32 GB, útil cuando se necesita fidelidad alta sin recurrir a BF16 (48,6 GiB).
- Evaluación e investigación de arquitecturas con capas recurrentes: el GGUF conserva las etiquetas y parámetros del bucle, lo que permite estudiar el comportamiento de este tipo de arquitectura con las herramientas estándar de llama.cpp (`llama-perplexity`, `--kl-divergence`).
- Prototipado en CPU o backends alternativos (Vulkan, Metal): aunque el autor solo verificó ROCm sobre RDNA4, el formato GGUF es portable a los backends de llama.cpp, lo que facilita pruebas en equipos sin GPU dedicada.

## Benchmarks y rendimiento

El autor publica mediciones de perplejidad sobre wikitext-2 (conjunto de test completo, contexto 2048) y divergencia KL frente a una referencia BF16 en CPU (20 fragmentos):

| Modelo / configuracion | PPL (wikitext-2) | Delta PPL vs BF16 | KLD medio vs CPU BF16 | Mismo token top-1 | Ratio PPL |
|---|---|---|---|---|---|
| BF16 (referencia) | 5,9341 ± 0,0353 | — | 0,0026 ± 0,0001 (solo backend) | 97,92 ± 0,10 % | 1,0010 ± 0,0006 |
| Q8_0 | 5,9356 ± 0,0353 | +0,03 % | 0,0033 ± 0,0001 | 97,73 ± 0,10 % | 1,0011 ± 0,0007 |
| Q4_K_M | 5,9764 ± 0,0355 | +0,71 % | 0,0144 ± 0,0002 | 95,04 ± 0,15 % | 1,0073 ± 0,0014 |

La fila BF16 mide únicamente la diferencia entre el backend ROCm y la CPU sobre el mismo archivo de precisión completa; el autor señala que una brecha de 0,0026 es redondeo normal entre backends (un modelo denso de 65B midió 0,0022 en el mismo equipo). La referencia CPU reportó PPL 5,9658 sobre 20 fragmentos.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q8_0 requiere 27,8 GB (cabe en tarjeta de 32 GB); Q4_K_M requiere 17,5 GB (cabe en tarjeta de 24 GB); BF16 requiere 48,6 GiB.
- GPU verificadas: 3× AMD Radeon AI PRO R9700 (gfx1201, RDNA4) con ROCm 7.2.1. El autor indica que debería funcionar en cualquier backend de llama.cpp (ROCm, CUDA, Vulkan, Metal, CPU), pero no probó otros hardware, incluido CDNA.
- GPU de consumo: Q4_K_M cabe en tarjetas de 24 GB (RTX 4090, Radeon AI PRO R9700); Q8_0 requiere 32 GB.
- Opciones de despliegue: llama.cpp (build posterior al 20 de noviembre de 2026, obligatorio por el soporte de `inkling2_loop`); herramientas que empaqueten versiones antiguas no cargarán el modelo. No se mencionan vLLM, TGI ni Ollama.
- Configuración mono-GPU: `-ngl 99 -sm none`.
- Configuración multi-GPU: el reparto por capas por defecto (`-sm layer`) divide los 48 slots entre tarjetas, pero los pesos solo residen en los primeros 24, lo que puede dejar la última tarjeta sin pesos. El autor recomienda un reparto que respete esa regla (por ejemplo `-ts 8,8,33` en tres tarjetas). En una prueba, Q8_0 tardó 15 min 35 s con el reparto por defecto y 10 min 35 s con `-ts 6,36,6`.
- Throughput y latencia: no se publican métricas de tokens por segundo; solo los tiempos de ejecución de `llama-perplexity` citados arriba.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto de modelos comparables en la información proporcionada. La comparación se limita a las variantes del propio modelo y a la referencia BF16:

| Modelo / variante | Parametros | Contexto | PPL (wikitext-2) | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini BF16 | ~26,07 B | no disponible | 5,9341 | Apache-2.0 | GGUF (referencia) |
| Inkling-2-Mini Q8_0 | ~26,07 B | no disponible | 5,9356 (+0,03 %) | Apache-2.0 | GGUF |
| Inkling-2-Mini Q4_K_M | ~26,07 B | no disponible | 5,9764 (+0,71 %) | Apache-2.0 | GGUF |

No se han identificado en la información disponible modelos alternativos de la misma categoría (mismo tamaño o misma tarea) con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Solo texto: la conversión descarta el codificador de visión y las cabezas de predicción multi-token, por lo que no reproduce las capacidades multimodales del modelo base.
- Dependencia estricta de versión: requiere un build de llama.cpp posterior al 20 de noviembre de 2026 con soporte de `inkling2_loop`; versiones anteriores o herramientas que las empaqueten fallarán al cargar el modelo.
- Reparto multi-GPU no trivial: el reparto por capas por defecto puede desbalancear la memoria y provocar fallos de asignación (el autor documenta un fallo con 17 de 24 capas y 33 GiB en la GPU 0 en BF16 con 3 tarjetas). Es necesario configurar `-ts` manualmente.
- Sobrecoste de tráfico PCIe: las pasadas repetidas pueden mantener su memoria en una tarjeta distinta a la de sus pesos, añadiendo latencia (diferencia de 5 minutos en una prueba de perplejidad con Q8_0 según el reparto).
- Verificación limitada a RDNA4: no se probó en CDNA ni en GPU NVIDIA; el autor solo afirma que «debería» funcionar en otros backends.
- Pérdida de calidad medible en Q4_K_M: +0,71 % de perplejidad y coincidencia del token top-1 del 95,04 %, lo que puede afectar a tareas sensibles a la precisión.
- Idiomas soportados no declarados: no se puede confirmar el rendimiento multilingüe.
- Sesgos y riesgo de alucinación: no se documentan sesgos conocidos ni evaluaciones de alucinación en la información disponible.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el repositorio no es afiliado a Thinking Machines Lab ni a AMD; las garantías son las de la licencia estándar.
- Contexto máximo no especificado: se desconoce la ventana de contexto real del modelo, lo que dificulta planificar cargas de trabajo con entradas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/askthesultans/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Thinking Machines Lab: https://thinkingmachines.ai
- Metodología y mediciones completas (GitHub): https://github.com/getsamsultan/rdna4-local-ai-lab/blob/main/data/2026-11-21-inkling-2-mini-rocm.md
- llama.cpp (soporte `inkling2_loop`, PR #32694): https://github.com/ggml-org/llama.cpp/pull/32694
