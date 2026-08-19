# jcbtc/DeepSeek-V4-Flash-CIRU-Quality-AQP

## Resumen

El modelo `jcbtc/DeepSeek-V4-Flash-CIRU-Quality-AQP` es una compilación GGUF del modelo DeepSeek V4 Flash, desarrollada por Ciru (autor `jcbtc`) específicamente para inferencia local en GPUs AMD de la serie Strix Halo (gfx1151). Incluye un compañero de decodificación especulativa MTP (Multi-Token Prediction) en BF16, diseñado para acelerar la generación de texto en un entorno de un solo usuario. El modelo base, DeepSeek V4 Flash, es un MoE de 284 mil millones de parámetros con 13 mil millones activos y una ventana de contexto de 1 millón de tokens, orientado a generación de código, uso de herramientas y flujos agénticos.

Esta compilación GGUF está optimizada con cuantización AQP (propietaria de Ciru) y se distribuye con un runtime específico de llama.cpp para ROCm 7.15. La relevancia de este lanzamiento es práctica: permite ejecutar un modelo de gran tamaño en hardware de consumo de gama alta (AMD Strix Halo) con un throughput medido de 10,427 tokens por segundo en el benchmark Nimo, gracias a un esquema híbrido de decodificación especulativa que combina n-gramas públicos con el compañero MTP oficial en profundidad 2.

La licencia es MIT, lo que facilita su uso comercial y modificación, aunque el runtime y los pesos dependen de las licencias upstream de DeepSeek y llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en DeepSeek V4 Flash |
| Parámetros totales | 191.992.792.663 (en el GGUF cuantizado; el modelo base tiene 284B) |
| Parámetros activos | 13B (modelo base, según fuentes externas) |
| Longitud de contexto | 1M tokens (modelo base, según fuentes externas); runtime recomendado usa 8192 |
| Tipos de cuantización | AQP (Quality AQP, bit exacto no especificado); compañero MTP en BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo principal) + GGUF BF16 (compañero MTP) |

## Arquitectura y entrenamiento

El modelo base DeepSeek V4 Flash es un transformer con arquitectura Mixture of Experts (MoE) de 284 mil millones de parámetros totales y 13 mil millones activos por token, diseñado específicamente para tareas de código, uso de herramientas y flujos agénticos. La compilación `CIRU-Quality-AQP` no introduce un nuevo entrenamiento, sino que cuantiza los pesos del modelo base a un formato GGUF optimizado para GPUs AMD, aplicando la técnica AQP (Adaptive Quantization Packing) para reducir el tamaño y mejorar el rendimiento en hardware gfx1151.

El compañero MTP (Multi-Token Prediction) es un modelo auxiliar en BF16 que se utiliza para decodificación especulativa: predice tokens futuros para acelerar la generación, compartiendo tensores con el modelo objetivo para evitar duplicación de memoria (se ahorraron 2,118,139,904 bytes en el proceso validado). El runtime recomendado combina la especulación pública ngram-map-k (N=24, M=4, mínimo de coincidencias 1) con el MTP a profundidad fija 2. No se han publicado detalles sobre el dataset de entrenamiento del modelo base en esta información.

## Capacidades

- Generación de texto de alta calidad, con soporte para código, razonamiento y tareas agénticas gracias al modelo base DeepSeek V4 Flash.
- Decodificación especulativa híbrida: combina ngram-map-k con un compañero MTP para acelerar la generación, medido con un incremento del 24,17% en throughput frente al modelo objetivo sin especulación.
- Soporte para tool calling y function calling, inherente al modelo base, orientado a pipelines de agentes y automatización.
- Capacidades multilingües: no documentadas en la información disponible.
- No se indica soporte para visión, audio u otras modalidades; el pipeline es exclusivamente text-generation.
- El runtime incluye un modo de verificación determinista para las filas q2/q3 del modelo, lo que garantiza salidas consistentes en esos casos.

## Casos de uso

- Inferencia local en hardware AMD de gama alta: el modelo está optimizado para AMD Strix Halo (gfx1151) con ROCm 7.15, permitiendo ejecutar un MoE de 284B en un único equipo con memoria unificada de hasta 128 GB. Ideal para desarrolladores que quieren evitar la API en la nube.
- Asistente de programación local: con soporte para código del modelo base, puede integrarse en editores o IDEs para autocompletar, explicar o refactorizar código sin conexión a internet.
- Agentes autónomos con uso de herramientas: la capacidad de tool calling del modelo base permite construir agentes que llaman funciones, consultan APIs o ejecutan scripts, con el beneficio de latencia local y privacidad.
- Desarrollo y pruebas de pipelines de decodificación especulativa: el runtime de llama.cpp con ngram-map-k y MTP permite experimentar con configuraciones de especulación para optimizar el rendimiento en tareas específicas.
- Investigación y evaluación de modelos cuantizados: la compilación AQP permite estudiar el impacto de la cuantización en la calidad de salida, comparando con el modelo original en BF16.
- Despliegue en entornos con restricciones de conectividad: al ser un modelo local con licencia MIT, es adecuado para entornos aislados (air-gapped) o con políticas de datos estrictas que impidan el uso de APIs en la nube.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del autor y de la evaluación de rendimiento del propio lanzamiento, así como de la plataforma Ciru Benchmark Lab.

| Configuración | TG geométrico (tok/s) | Cambio vs objetivo |
|---|---:|---:|
| Solo objetivo (sin especulación) | 8,398 | línea base |
| MTP oficial BF16, profundidad 2 | 10,170 | +21,10% |
| Ngram-map-k público, N24/M4 | 9,205 | +9,61% |
| **Híbrido N24/M4 + MTP2** | **10,427** | **+24,17%** |

- En la prueba de referencia absoluta del objetivo (solo modelo objetivo), se midieron 178,5568 tok/s en prefill (PP513), 190,9841 tok/s en PP2048, 8,8408 tok/s en generación de texto (TG) natural hasta EOS y 8,7425 tok/s en TG forzado a 256 tokens.
- En la evaluación de Ciru Lab, el modelo alcanzó un 32,43% en `bigcodebench-hard-instruct` (48/148 casos pasados), con un tiempo de ejecución de 1h 57m 3s para la tarea.
- El híbrido redujo el tiempo medio de respuesta total en un 22,62% respecto al modelo objetivo solo.
- Los micro-gates de rendimiento del runtime (no end-to-end) indican mejoras aisladas de +3,57% en TG (all-row LID bypass), +9,77% en TG (FP16 pair-DOT2) y +36,63% en prefill (grouped-qN dual-tile), pero no deben sumarse.

## Requisitos de hardware

- **GPU recomendada**: AMD Strix Halo (gfx1151) con soporte ROCm 7.15; se validó en el sistema Nimo con ROCm `7.15.0a20260718`.
- **Memoria**: el archivo GGUF principal ocupa 115,7 GB y el compañero MTP 5,88 GB, por lo que se requiere un mínimo de 128 GB de memoria unificada (como la del Strix Halo de gama alta) para la configuración completa.
- **VRAM**: no se especifica un requisito exacto de VRAM, pero dado el tamaño del modelo, se necesita una GPU con al menos 128 GB de memoria accesible (memoria unificada en APU).
- **Runtime**: se debe usar la versión específica de llama.cpp (b10335, commit `74ce15741b420b8d6f12e720398458b576c51c2c`) con el runtime ROCmFPX de Ciru para gfx1151.
- **Despliegue**: compatible con llama.cpp (modo servidor `llama-server`), con opciones de carga en memoria (`--load-mode dio`) y especulación configurable.
- **Latencia y throughput**: con la configuración híbrida, se midió un throughput de generación de 10,427 tok/s en el benchmark Nimo; el tiempo hasta el primer token (TTFT) fue un 0,83% mayor que el del modelo objetivo solo.

## Comparativa con modelos similares

No se dispone de datos de benchmark comparativos entre este modelo y alternativas de la misma categoría en la información proporcionada. La única comparación cualitativa disponible es con el modelo objetivo original (DeepSeek V4 Flash) y con el modelo cuantizado Dwarfstar (IQ2) en el mismo hardware, mencionado en una publicación de X de Ciru. La tabla siguiente resume las diferencias principales:

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento local |
|---|---|---|---|---|---|
| DeepSeek V4 Flash (original) | 284B (13B activos) | 1M | MIT | BF16 (API) | No aplica (API) |
| `jcbtc/DeepSeek-V4-Flash-CIRU-Quality-AQP` | 191,99B (GGUF) | 1M (modelo base) | MIT | GGUF + BF16 MTP | 10,427 tok/s (híbrido) |
| Dwarfstar (quant IQ2, no confirmado) | No disponible | No disponible | No disponible | GGUF | No disponible |

No hay datos públicos de comparativa de calidad o rendimiento con otros cuantizados del mismo modelo en el momento de la información disponible.

## Limitaciones y advertencias

- El benchmark de rendimiento del lanzamiento es deliberadamente pequeño (cuatro cargas de trabajo y cuatro configuraciones); no constituye una evaluación amplia de calidad ni garantiza resultados en todos los escenarios.
- No se garantiza la salida bit-exacta entre configuraciones: en una comparativa greedy de cuatro prompts, el código, JSON y copia alta fueron exactos, pero el texto en prosa divergió numéricamente (aunque ambas salidas produjeron la respuesta correcta de 48 mph).
- No hay reclamaciones sobre calidad a largo plazo, contexto largo, concurrencia o portabilidad entre hardware distinto del validado (gfx1151).
- El runtime es específico de AMD ROCm y la versión de llama.cpp; no se garantiza compatibilidad con otras plataformas (NVIDIA, CPU) sin adaptaciones.
- La licencia MIT aplica al lanzamiento, pero el modelo base y el runtime tienen licencias upstream (DeepSeek y llama.cpp) que deben respetarse.
- El tamaño del archivo (115,8 GB) y la dependencia de memoria unificada limitan el despliegue a hardware muy concreto; no es viable en GPUs de consumo convencionales (p. ej., RTX 4090 con 24 GB VRAM).
- No se han publicado datos sobre sesgos, riesgos de alucinación o limitaciones de idioma específicas para este lanzamiento; se heredan los riesgos del modelo base DeepSeek V4 Flash, que no están documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: [jcbtc/DeepSeek-V4-Flash-CIRU-Quality-AQP](https://huggingface.co/jcbtc/DeepSeek-V4-Flash-CIRU-Quality-AQP)
- Modelo base: [deepseek-ai/DeepSeek-V4-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash)
- Runtime y build de Ciru: [ROCmFPX release v1](https://github.com/ciru-ai/ROCmFPX/releases/tag/deepseek-v4-flash-ciru-quality-aqp-v1)
- Ciru Benchmark Lab: [https://lab.ciru.ai/](https://lab.ciru.ai/)
- Guía de ejecución local de DeepSeek V4 Flash (codersera.com): [https://codersera.com/blog/run-deepseek-v4-flash-locally-full-2026-setup-guide/](https://codersera.com/blog/run-deepseek-v4-flash-locally-full-2026-setup-guide/)
- Guía completa de DeepSeek V4 (codersera.com): [https://codersera.com/blog/deepseek-v4-complete-guide-2026/](https://codersera.com/blog/deepseek-v4-complete-guide-2026/)
- Modelo en LM Studio: [https://lmstudio.ai/models/deepseek-v4-flash](https://lmstudio.ai/models/deepseek-v4-flash)
- Tweet de Ciru sobre comparativa de calidad: [https://x.com/ciruai/status/2072006455348134357](https://x.com/ciruai/status/2072006455348134357)
