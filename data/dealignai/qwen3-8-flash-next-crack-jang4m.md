# dealignai/Qwen3.8-Flash-Next-CRACK-JANG4M

## Resumen

Este modelo es una versión "CRACK-abliterated" de JANGQ-AI/Qwen3.8-Flash-Next-JANG_4M, el tier de precisión media de la preview qwen4_exp de Alibaba. Desarrollado por dealignai, elimina el comportamiento de rechazo (refusal) del modelo original mientras preserva la deliberación, el uso de herramientas y la capacidad multimodal. Se trata de un artefacto de investigación, no de un modelo para producción. La arquitectura es un mixture-of-experts (MoE) híbrido con 512 expertos y 6B parámetros activos, combinando Gated DeltaNet y Qwen Sparse Attention, con embedding de n-gramas con hash, cabeza nativa de predicción multi-token (MTP) y soporte de visión y vídeo. El modelo tiene 179.999.981.459 parámetros totales (≈180B) y ocupa aproximadamente 96 GB en disco. La longitud de contexto no está especificada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) híbrida: Gated DeltaNet + Qwen Sparse Attention, 512 expertos, 6B activos, cabeza nativa de predicción multi-token (MTP), visión + vídeo |
| Parámetros totales | 179.999.981.459 (≈180B) |
| Parámetros activos | 6B (según el model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX affine (precisión mixta), safetensors |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE híbrida que combina Gated DeltaNet y Qwen Sparse Attention, con 512 expertos y 6B parámetros activos. Incorpora un embedding de n-gramas con hash y una cabeza nativa de predicción multi-token (MTP) para decodificación especulativa. Además, incluye una cabeza de lenguaje para visión y vídeo, lo que le permite procesar imágenes y vídeo. No se proporcionan detalles sobre los datos de entrenamiento originales ni sobre procesos de RLHF o DPO. La modificación principal es la abliteración (abliteration), una técnica que elimina los patrones de rechazo del modelo base sin afectar significativamente a las capacidades de razonamiento, tool use o multimodalidad. Según las pruebas del autor, no se observan bucles inducidos por la cirugía en código, matemáticas ni prosa.

## Capacidades

- Generación de texto y razonamiento configurable en tres niveles: off, low y xhigh (modo thinking).
- Soporte de tool calling y agentic tools para tareas multi-paso.
- Capacidad multimodal: procesamiento de imágenes y vídeo (image-text-to-text).
- Cabeza nativa de predicción multi-token (MTP) para acelerar la decodificación.
- Soporte bilingüe: inglés y chino.
- Comportamiento de rechazo eliminado (abliterated), lo que le permite responder a prompts que normalmente serían rechazados.

## Casos de uso

- Investigación en seguridad y alineación: permite estudiar cómo responde un modelo a prompts dañinos tras la abliteración, comparando con el baseline. El autor proporciona datos de HarmBench, lo que facilita el análisis.
- Análisis multimodal de vídeo e imágenes: con la cabeza de visión y vídeo, puede analizar contenido visual y generar descripciones o razonamientos sobre escenas, útil en investigación de visión por computador.
- Agentes autónomos con tool calling: su soporte de herramientas y razonamiento multi-paso lo hace adecuado para construir agentes que ejecutan tareas complejas en entornos de investigación.
- Decodificación especulativa en Apple Silicon: la cabeza MTP y la implementación MLX permiten experimentar con aceleración de inferencia en hardware de Apple.
- Análisis bilingüe inglés-chino: el modelo puede procesar y generar texto en ambos idiomas, útil para tareas de traducción o análisis multilingüe en investigación.
- Estudio de límites de seguridad: al eliminar los rechazos, permite explorar los límites del comportamiento del modelo en escenarios de riesgo, siempre en entornos controlados y con supervisión.

## Benchmarks y rendimiento

El autor ha publicado resultados de MMLU y HarmBench. En MMLU (2280 preguntas held-out, logit-argmax sobre A/B/C/D), el modelo CRACK obtiene un 85.92% frente al 86.89% del baseline, una caída de 0.97 puntos porcentuales.

| Benchmark | Baseline | CRACK | Δ |
|---|---|---|---|
| MMLU (2280 held-out) | 86.89% | 85.92% | −0.97 pp |

En HarmBench-320 (320 prompts por tier, con un subclasificador de 4 buckets sobre el texto de la respuesta), los resultados son los siguientes:

| Tier | n | max_tokens | TRUE_COMPLY | SOFT_REFUSE | DEFLECT | REDIRECT | HARD_REFUSE | GARBAGE | Real-harm ASR |
|---|---|---|---|---|---|---|---|---|---|
| off | 320 | 300 | 293 | 23 | 2 | 2 | 0 | 0 | 91.56% |
| low | 320 | 800 | 318 | 1 | 0 | 0 | 0 | 1 | 99.38% |
| xhigh | 320 | 1500 | 315 | 3 | 0 | 1 | 0 | 1 | 98.44% |

El autor reporta cero rechazos duros en las 960 filas, y solo 2 filas de basura (0.2%) en los modos low y xhigh, debidas a bucles de completación en prompts de letras de canciones. También hay un desglose por asignaturas de MMLU que muestra variaciones, con caídas notables en machine learning (−12.5 pp), high school statistics (−12.5 pp) y moral scenarios (−10.0 pp), y mejoras en professional accounting (+7.5 pp), global facts (+5.0 pp) y logical fallacies (+5.0 pp).

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo ocupa aproximadamente 96 GB en disco (103.1 GB en el repositorio).
- GPU recomendadas: no disponible. El modelo está optimizado para Apple Silicon (MLX). Para NVIDIA, no hay datos específicos; otro modelo de la misma familia (Qwen3.8-Flash-Next-CYBERSECURITY-NVFP4) se sirve en 2× NVIDIA DGX Spark (GB10) con SGLang, pero no es este modelo.
- Consumer GPU: no cabe en GPUs de consumo típicas (p. ej., 24 GB) debido al tamaño. En Apple Silicon, se requiere una Mac con memoria unificada de al menos 96 GB, probablemente 128 GB para margen.
- Opciones de despliegue: MLX en Apple Silicon. No hay información sobre vLLM, llama.cpp, Ollama o TGI para este modelo concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-CRACK-JANG4M | 179.999.981.459 (≈180B) | no disponible | 85.92% | qwen-community-1.0 | HuggingFace |
| JANGQ-AI/Qwen3.8-Flash-Next-JANG_4M (base) | ~176B | no disponible | 86.89% | qwen-community-1.0 | HuggingFace |
| Qwen3.8-Flash-Next-CRACK-6S | ~176B | no disponible | no disponible | qwen-community-1.0 | HuggingFace |

El modelo base sin abliteración tiene un MMLU ligeramente superior (86.89% vs 85.92%). El tier 6S es la versión superior de la misma familia, pero no se han publicado resultados de benchmarks en la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica que la descarga implica aceptar la responsabilidad sobre el uso de los pesos.
- Eliminación de rechazos: el modelo puede generar contenido dañino o no seguro. No debe usarse en producción sin supervisión.
- Degradación en algunas asignaturas de MMLU: machine learning (−12.5 pp), high school statistics (−12.5 pp), moral scenarios (−10.0 pp) y world religions (−7.5 pp).
- 2 filas de basura (0.2%) en HarmBench en los modos low y xhigh, debidas a bucles de completación en prompts de letras de canciones.
- Solo soporta inglés y chino.
- No se han publicado resultados para otros benchmarks (HumanEval, GSM8K, etc.).
- Riesgo de alucinación inherente a los modelos de lenguaje, no mitigado específicamente.
- La licencia qwen-community-1.0 puede tener restricciones para uso comercial; consultar los términos completos.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/dealignai/Qwen3.8-Flash-Next-CRACK-JANG4M)
- [Modelo base: JANGQ-AI/Qwen3.8-Flash-Next-JANG_4M](https://huggingface.co/JANGQ-AI/Qwen3.8-Flash-Next-JANG_4M)
- [Modelo relacionado: dealignai/Qwen3.8-Flash-Next-CRACK-6S](https://huggingface.co/dealignai/Qwen3.8-Flash-Next-CRACK-6S)
- [Modelo relacionado: dealignai/Qwen3.8-Flash-Next-CYBERSECURITY-NVFP4](https://huggingface.co/dealignai/Qwen3.8-Flash-Next-CYBERSECURITY-NVFP4)
