# prithivMLmods/Clover-35B-A3B-Preview-MXFP4-MoE-GGUF

## Resumen

Clover-35B-A3B-Preview es un modelo de lenguaje de difusión por bloques (block diffusion) desarrollado por DiffuSpace y derivado de la arquitectura Qwen3.6-35B-A3B. Frente a la generación autorregresiva tradicional, el modelo reformula la producción de texto como un proceso de difusión paralela por bloques, apoyándose en atención bidireccional dentro del bloque, enrutamiento de expertos a nivel de bloque y decodificación LowConfidence. El repositorio que nos ocupa es la cuantización MXFP4 del modelo base, publicada por prithivMLmods para su uso con llama.cpp y hardware NVIDIA Blackwell.

El modelo combina un backbone híbrido de Gated DeltaNet (GDN) con capas de atención completa y una arquitectura Mixture-of-Experts (MoE) que activa aproximadamente 3.000 millones de parámetros por token sobre un total de 34.660.610.688 parámetros. Incorpora una ventana de contexto de 128K tokens y está orientado a tareas agénticas y de código, con capacidades nativas de razonamiento y penalizaciones integradas de repetición y longitud para estabilizar salidas de largo horizonte.

Su relevancia actual radica en que demuestra que los modelos de difusión por bloques pueden competir con los autorregresivos en benchmarks agénticos y de ingeniería de software, superando según el autor a sus contrapartes Qwen3.5 y Qwen3.6. La versión MXFP4 reduce el peso a 19,8 GB, lo que permite desplegarlo en GPUs Blackwell de consumo profesional con aceleración nativa de Tensor Cores FP4.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet (GDN) + atención completa, Mixture-of-Experts, difusión por bloques (block diffusion) |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B por token (A3B) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | BF16, MXFP4_MOE, Q3_K_L, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

Clover-35B-A3B-Preview se construye sobre la arquitectura Qwen3.6-35B-A3B, un backbone híbrido que alterna capas de Gated DeltaNet (un mecanismo de atención lineal con estado recurrente) con capas de atención completa, y que incorpora una capa Mixture-of-Experts con enrutamiento por token. Sobre esa base, DiffuSpace adapta la generación autorregresiva a un esquema de difusión por bloques: el texto se genera en paralelo dentro de bloques mediante atención bidireccional intra-bloque, con enrutamiento de expertos a nivel de bloque (block-level expert coreset routing) y decodificación LowConfidence. El modelo soporta además decodificación auto-especulativa a través de SGLang y llama.cpp.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Sí se indica que el modelo incorpora capacidades nativas de razonamiento y penalizaciones integradas de repetición y longitud, orientadas a mantener la estabilidad en salidas de largo horizonte. El modelo es de solo texto y está declarado únicamente para inglés.

## Capacidades

- Generación de texto y razonamiento nativo, con modo de pensamiento integrado según la model card.
- Generación de código y resolución de tareas de ingeniería de software (SWE-bench, Terminal-Bench, SWE-Pro).
- Razonamiento matemático y resolución de problemas aritméticos y de lógica (los test shots incluyen problemas de trenes, tuberías, edades y combinatoria).
- Capacidades agénticas: uso de herramientas y function calling evaluado en BFCL-v4.
- Razonamiento multi-paso y ejecución de tareas de terminal (Terminal-Bench 2.1, Terminal-Hard).
- Decodificación auto-especulativa soportada vía SGLang y llama.cpp.
- Generación paralela por bloques mediante difusión, con atención bidireccional intra-bloque.
- Multilingüe: limitado a inglés según la model card.

## Casos de uso

- Automatización de ingeniería de software: el modelo puede resolver issues y parchear repositorios en pipelines de CI/CD, apoyándose en sus resultados en SWE-bench Verified (73,6) y SWE-Pro (46,5) y en su ventana de 128K tokens para cargar contexto de repositorio.
- Agentes de terminal y operaciones: ejecución de tareas de shell y diagnóstico de sistemas, con buen rendimiento declarado en Terminal-Bench 2.1 (51,7) y Terminal-Hard (38,1).
- Asistentes con tool calling: integración en flujos que requieren invocar APIs y funciones externas, respaldado por BFCL-v4 (67,9).
- Generación de código en producción: al ser GGUF y compatible con llama.cpp, puede servirse con llama-cli o integrarse en servicios de inferencia locales para autocompletado y generación de parches.
- Razonamiento matemático y tutoría técnica: resolución de problemas aritméticos y de lógica paso a paso, aprovechando el modo de razonamiento nativo.
- Despliegue en hardware Blackwell de gama profesional: la cuantización MXFP4 (19,8 GB) permite ejecutar el modelo en una RTX PRO 6000 o RTX 50-series con aceleración FP4, útil para prototipado local de agentes.
- Procesamiento de documentos largos en inglés: con 128K de contexto puede analizar contratos, informes o bases de código extensas en una sola pasada.

## Benchmarks y rendimiento

Resultados declarados en la model card para el modelo base Clover-35B-A3B-Preview:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 73,6 |
| BFCL-v4 | 67,9 |
| Overall | 65,3 |
| Terminal-Bench 2.1 | 51,7 |
| SWE-Pro | 46,5 |
| Terminal-Hard | 38,1 |

Rendimiento de inferencia medido por el autor con la cuantización MXFP4_MOE en una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM), llama-cli con `-ngl 99`, contexto de 16.384 tokens y KV cache `q8_0`:

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 238,55 tokens/s |
| Velocidad media de generación | 167,81 tokens/s |
| Tiempo total de ejecución | 107,8 s |
| VRAM pico | 19,07 GiB |
| Utilización de GPU pico | 100% |
| Decodificación especulativa | No |
| Repeticiones | 5 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: MXFP4_MOE ~19,8 GB de pesos (19,07 GiB pico medidos con contexto de 16K); Q3_K_L ~18,1 GB; Q5_K_M ~24,7 GB; Q6_K ~28,5 GB; BF16 ~69,4 GB.
- GPUs recomendadas: NVIDIA Blackwell (RTX PRO 6000, RTX 50-series, B200, B300) para aprovechar la aceleración nativa FP4 con MXFP4_MOE. Para Q5_K_M y Q6_K se recomiendan GPUs con 24-32 GB o más.
- Cabe en GPU de consumo: sí, con MXFP4_MOE en GPUs Blackwell con al menos 24 GB; Q3_K_L permite ajustar en tarjetas de 20-24 GB. BF16 requiere múltiples GPUs o 80 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), text-generation-inference, SGLang (para decodificación auto-especulativa) y transformers con código personalizado.
- Latencia y throughput: con MXFP4_MOE en RTX PRO 6000 Blackwell, 238,55 tokens/s de prompt y 167,81 tokens/s de generación a contexto de 16K. No hay datos para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Clover-35B-A3B-Preview (este) | 34,7B totales / ~3B activos | 128K | Apache-2.0 | Difusión por bloques; SWE-bench Verified 73,6 |
| LLaDA2.2 flash | no disponible | no disponible | no disponible | Modelo de difusión competidor citado por el autor |
| Mercury 2.5 | no disponible | no disponible | no disponible | Modelo de difusión competidor citado por el autor |
| Qwen3.5 / Qwen3.6 (contrapartes AR) | no disponible | no disponible | no disponible | El autor afirma que Clover los supera en benchmarks agénticos |

La información disponible no incluye especificaciones detalladas de los modelos comparables, por lo que la comparación se limita a lo declarado en la model card.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Modelo de solo texto: no procesa imágenes, audio ni vídeo.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas específicas.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos sistemáticos.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Diffuspace/Clover-35B-A3B-Preview.
- El rendimiento medido corresponde a una configuración concreta (RTX PRO 6000 Blackwell, llama.cpp, contexto 16K); el throughput puede variar con otras configuraciones.
- La cuantización MXFP4 requiere hardware Blackwell para aprovechar la aceleración FP4; en GPUs anteriores funcionará sin esa ventaja.
- El repositorio muestra 0 descargas y 1 like en el momento de la consulta, por lo que la validación comunitaria es aún muy limitada.
- Es una versión "Preview": puede presentar inestabilidades o cambios en el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/Clover-35B-A3B-Preview-MXFP4-MoE-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador: https://huggingface.co/prithivMLmods
