# AtomicChat/Clover-35B-A3B-Preview-GGUF

## Resumen

Clover-35B-A3B-Preview es un modelo de lenguaje de difusión por bloques (block-diffusion) de tipo mezcla de expertos (MoE), desarrollado por DiffuSpace a partir de Qwen3.6-35B-A3B. Combina 34,66 mil millones de parámetros totales con unos 3.000 millones activos por token, y ofrece una ventana de contexto de 128K tokens con el modo de razonamiento (thinking) activado por defecto. Su licencia Apache-2.0 permite uso comercial sin restricciones.

Esta ficha cubre la versión cuantizada en GGUF publicada por AtomicChat, que ofrece archivos "Atomic Dynamic" con matriz de importancia propia (imatrix) calculada sobre los pesos BF16 originales, desde 13,7 GB hasta 36,9 GB en disco. Cada cuantización se ha medido frente al original BF16 en un mismo banco de pruebas, reportando divergencia KL y precisión top-1.

El interés de este modelo radica en ser una de las primeras arquitecturas de difusión de texto disponibles en formato GGUF para llama.cpp, con la eficiencia de un MoE de pocos parámetros activos (3B), lo que lo hace viable en hardware de consumo. Requiere, eso sí, una compilación de llama.cpp concreta (PR #31306), ya que las versiones oficiales aún no soportan la arquitectura `clover_moe`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion MoE (`clover_moe`), derivado de Qwen3.6-35B-A3B |
| Parametros totales | 34.661.350.848 (~34,66B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | Q8_0, AD-Q6_K-Q5_K, AD-Q5_K-Q4_K, AD-Q4_K-IQ4_XS, AD-IQ4_XS-IQ3_S, AD-IQ3_S-IQ3_XXS, AD-IQ3_XXS-IQ2_S (GGUF con imatrix propia) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado desde pesos BF16 originales) |

## Arquitectura y entrenamiento

Clover-35B-A3B-Preview es un modelo de difusión por bloques con arquitectura de mezcla de expertos: de sus 34,66 mil millones de parámetros, solo unos 3.000 millones se activan por token, lo que reduce drásticamente el coste de inferencia frente a un modelo denso equivalente. Está derivado de Qwen3.6-35B-A3B y hereda su plantilla de chat de la familia Qwen3.5, con el razonamiento (thinking) activado por defecto en cada turno.

Sobre los datos y el proceso de entrenamiento del modelo base no se ha publicado información en la ficha disponible. En cuanto a la cuantización de AtomicChat, los archivos "AD" utilizan una matriz de importancia propia calculada sobre los pesos BF16 con `--parse-special`, sobre 4.000 fragmentos de 512 tokens de un corpus de calibración multilingüe. Las medidas de calidad (divergencia KL y top-1) se obtuvieron con 87 fragmentos de 4.096 tokens de texto multilingüe neutro, usando llama.cpp commit `4838ffb` (PR #31306) y decodificación determinista en una H100.

## Capacidades

- Generacion de texto conversacional con modo de razonamiento (thinking) activado por defecto.
- Contexto largo de 128K tokens para documentos extensos y conversaciones multi-turno.
- Eficiencia de inferencia MoE: solo ~3B de parámetros activos por token pese a los 34,66B totales.
- Decodificación por difusión de bloques, un paradigma alternativo a la generación autorregresiva token a token.
- Soporte bilingüe inglés/chino según los metadatos del modelo.
- Existe una variante sin rechazos (uncensored) publicada por el mismo autor, con builds horneadas y un adaptador LoRA compatible con estas cuantizaciones.
- No hay información publicada sobre tool calling, capacidades de visión, audio ni agentes en la documentación disponible.

## Casos de uso

- Chatbots locales y offline: con ~3B de parámetros activos, la inferencia es ligera para su clase; en una GPU de 24 GB cabe la cuantización AD-Q4_K-IQ4_XS (20,1 GB), adecuada para asistentes conversacionales que ejecutan Atomic Chat u Ollama-like en local.
- Procesamiento de documentos largos: la ventana de 128K tokens permite resumir o analizar contratos, informes técnicos o bases de código completas en una sola pasada.
- Razonamiento paso a paso (chain-of-thought): el modo thinking activado por defecto lo hace adecuado para tareas de análisis, planificación y resolución de problemas donde el razonamiento intermedio mejora la calidad.
- Investigación en arquitecturas de difusión: al ser uno de los primeros modelos block-diffusion disponibles en GGUF, sirve como base experimental para estudiar paradigmas de decodificación no autorregresivos en llama.cpp.
- Despliegue bilingüe inglés-chino: útil para equipos que necesiten soporte de ambos idiomas con un solo modelo open-weight.
- Servicios con licencia permisiva: Apache-2.0 permite integrarlo en productos comerciales, SaaS o modelos derivados sin obligaciones de copyleft.
- Experimentación con cuantizaciones agresivas: la gama de archivos AD (hasta IQ2_S a 13,7 GB) permite probar límites de compresión en GPUs de 16 GB, con la advertencia de degradación medible en los archivos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. AtomicChat sí publica métricas de fidelidad de cuantización frente al original BF16 (medidas en una H100, 87 fragmentos de 4.096 tokens):

| File | Tamano en disco | Divergencia KL | top-1 |
|---|---:|---:|---:|
| Q8_0 | 36,9 GB | 0,0259 | 93,04% |
| AD-Q6_K-Q5_K | 26,3 GB | 0,0293 | 92,44% |
| AD-Q5_K-Q4_K | 22,1 GB | 0,0416 | 90,90% |
| AD-Q4_K-IQ4_XS | 20,1 GB | 0,0486 | 90,17% |
| AD-IQ4_XS-IQ3_S | 17,6 GB | 0,0764 | 87,82% |
| AD-IQ3_S-IQ3_XXS | 15,5 GB | 0,1101 | 85,46% |
| AD-IQ3_XXS-IQ2_S | 13,7 GB | 0,1735 | 81,86% |

## Requisitos de hardware

- VRAM para inferencia (pesos solos, sin KV cache): Q8_0 requiere ~37 GB (GPU de 48 GB o más); AD-Q6_K-Q5_K cabe en 32 GB; AD-Q4_K-IQ4_XS (20,1 GB) y AD-Q5_K-Q4_K (22,1 GB) caben en GPUs de 24 GB (contexto corto en el segundo caso); AD-IQ3_S-IQ3_XXS (15,5 GB) y AD-IQ3_XXS-IQ2_S (13,7 GB) caben en 16 GB.
- GPUs recomendadas: H100 para las mediciones de referencia; RTX 3090/4090 (24 GB) para los archivos de 20-22 GB; RTX 4080/4070 Ti o equivalentes de 16 GB para los archivos de 13,7-17,6 GB.
- Consumer GPUs: sí, desde 16 GB de VRAM con las cuantizaciones más agresivas, aunque con degradación medible (top-1 del 81,9% en el archivo más pequeño, con errores observados en preguntas simples con thinking activado).
- Despliegue: requiere llama.cpp compilado desde el PR #31306 (commit `4838ffb`, sin fusionar en el momento de la publicación). Las builds oficiales de llama.cpp, Ollama, LM Studio y aplicaciones sobre llama.cpp estándar no reconocen aún la arquitectura `clover_moe`.
- Latencia y throughput: no disponible en la informacion proporcionada, aunque los ~3B de parámetros activos sugieren velocidades comparables a modelos densos de 3B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview | 34,66B | ~3B | 128K | Block-diffusion MoE | Apache-2.0 |
| Qwen3.6-35B-A3B (base) | ~35B | ~3B | no disponible | MoE autorregresivo | no disponible |
| Qwen3-30B-A3B (referencia de clase) | 30,5B | 3B | 128K | MoE autorregresivo | Apache-2.0 |

Clover se distingue de sus equivalentes autorregresivos de la familia Qwen por su decodificación por difusión de bloques, un paradigma que puede ofrecer ventajas en paralelización de generación, aunque no hay datos públicos que cuantifiquen esa diferencia. En parámetros totales, activos, contexto y licencia es esencialmente comparable a Qwen3-30B-A3B y Qwen3.6-35B-A3B, de los que deriva.

## Limitaciones y advertencias

- Compatibilidad critica: los archivos requieren llama.cpp del PR #31306 (commit `4838ffb`), aún sin fusionar. Si el PR cambia el formato antes de fusionarse, habrá que re-quantizar. Ollama, LM Studio y apps sobre llama.cpp estable no funcionan con este modelo.
- Degradacion en cuantizaciones bajas: el archivo AD-IQ3_XXS-IQ2_S cambia frecuentemente el token siguiente respecto al original (top-1 81,9%) y se ha observado un error en una pregunta simple con thinking activado; AtomicChat recomienda los archivos mayores.
- Idiomas: los metadatos solo declaran inglés y chino; el rendimiento en castellano no está documentado.
- Sesgos y riesgo de alucinación: no hay documentación específica publicada; al ser un modelo preview derivado de Qwen, cabe esperar los sesgos habituales de modelos de lenguaje de gran escala.
- Estado preview: al tratarse de una versión preliminar de una arquitectura experimental (difusión de bloques), la estabilidad y el comportamiento en producción no están garantizados.
- Existe una variante "uncensored" del mismo autor; la versión aquí descrita mantiene el comportamiento de rechazo original, pero conviene verificar las políticas de uso antes de desplegar en producción.
- No hay información publicada sobre tool calling, agentes ni entrenamiento (datos, RLHF/DPO) del modelo base.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/AtomicChat/Clover-35B-A3B-Preview-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Modelo base original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante uncensored: https://huggingface.co/AtomicChat/Clover-35B-A3B-Preview-Uncensored-GGUF
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31306
- Atomic Chat (aplicación): https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de la comunidad: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
