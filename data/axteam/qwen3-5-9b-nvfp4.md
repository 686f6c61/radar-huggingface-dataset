# axteam/Qwen3.5-9B-NVFP4

## Resumen

Qwen3.5-9B-NVFP4 es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario axteam. Se trata de un checkpoint de precisión reducida (W4A4, FP4) generado mediante quantización post-entrenamiento (PTQ) con el formato `nvfp4-pack-quantized` de la librería compressed-tensors, pensado específicamente para servir el modelo con vLLM sobre GPUs Blackwell de NVIDIA. No es un modelo nuevo: es una versión comprimida del original que conserva su tokenizador, plantilla de chat y configuración de preprocesado.

El modelo base es denso (no MoE), con arquitectura híbrida que combina atención lineal (GatedDeltaNet/SSM) y atención completa, torre de visión para entrada imagen-texto y una cabeza de predicción multi-token (MTP). Cuenta con 9.409.813.744 parámetros reales según los safetensors del repositorio, y el checkpoint cuantizado ocupa aproximadamente 11,7 GB en disco. La licencia es Apache-2.0, heredada del modelo original.

Su relevancia práctica es acotada pero clara: permite desplegar un modelo multimodal de ~9B con pesos y activaciones en FP4, reduciendo el coste de memoria y aprovechando las unidades de cómputo FP4 de las GPU Blackwell. La cuantización deja en BF16 aproximadamente el 45% de los parámetros (torre de visión, proyector, cabezas MTP, embeddings, LM head, todas las RMSNorm y toda la ruta de atención lineal), porque FP4 resulta demasiado grueso para los pesos del SSM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal GatedDeltaNet/SSM + atención completa), denso, multimodal con torre de visión y cabeza MTP |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4): pesos FP4 (E2M1) en grupos de 16 con escala FP8 (E4M3) y escala global FP32 por tensor; activaciones FP4; formato compressed-tensors `nvfp4-pack-quantized`. Partes en BF16: `model.visual.*`, `mtp.*`, RMSNorm, embeddings, LM head y toda la ruta `linear_attn.*` |
| Idiomas soportados | no disponible (la calibración usó un corpus mixto con predominio de coreano; los benchmarks incluyen KMMLU y HAE-RAE) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), biblioteca transformers, compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida en la que conviven capas de atención lineal basadas en GatedDeltaNet (un modelo de espacio de estados con compuertas) y capas de atención completa clásica, además de una torre de visión para el procesamiento de imágenes y una cabeza de predicción multi-token (MTP). Esta combinación busca reducir el coste computacional de la atención en secuencias largas manteniendo la calidad de un transformer denso. El checkpoint aquí descrito no aporta detalles sobre el número de tokens de entrenamiento ni sobre la composición del dataset del modelo original.

La cuantización es puramente post-entrenamiento, sin reentrenamiento ni ajuste fino. Se aplicó AWQ con un conjunto de calibración de 256 muestras (corpus mixto con fuerte presencia de coreano) para proteger los canales de pesos más relevantes antes del redondeo a FP4. La decisión técnica destacable es dejar en BF16 toda la ruta de atención lineal, ya que la precisión FP4 degrada en exceso los pesos del SSM; también se mantienen en BF16 la torre de visión, el proyector, la cabeza MTP, las RMSNorm, los embeddings y el LM head. En la revisión del 1 de noviembre de 2026 se restauraron de forma bit-exacta los pesos de RMSNorm no suavizados por AWQ, eliminando el ruido de redondeo BF16 que había introducido el manejo de offset-norm de llm-compressor (hasta un 0,4% en la ganancia efectiva); las mediciones publicadas son anteriores a ese cambio.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general, heredados del modelo base Qwen3.5-9B.
- Procesamiento multimodal imagen-texto: la torre de visión y el proyector se conservan en BF16, por lo que la entrada de imágenes sigue operativa.
- Razonamiento matemático y resolución de problemas aritméticos, evaluado con GSM8K en modo estricto.
- Comprensión lectora y conocimiento enciclopédico multilingüe, con benchmarks específicos para coreano (KMMLU, HAE-RAE) además de pruebas en inglés.
- Predicción multi-token mediante la cabeza MTP, útil para decodificación especulativa en el runtime.
- Compatibilidad con tool calling y plantillas de chat: el tokenizador y el `chat_template` son idénticos a los del modelo original.
- Soporte de despliegue en vLLM con el backend de cuantización compressed-tensors.
- Capacidades de agente multi-paso: no confirmadas explícitamente en la información disponible.

## Casos de uso

- Servicio de inferencia multimodal en producción sobre GPU Blackwell: el checkpoint está diseñado para vLLM con FP4 W4A4, de modo que un modelo de ~9B con visión puede servirse con menor huella de memoria y aprovechando las unidades FP4 de B200/GB200/B300.
- Asistentes conversacionales con entrada de imágenes: al conservar la torre de visión en BF16, permite construir interfaces de chat que reciben capturas, diagramas o fotos y responden en lenguaje natural.
- Procesamiento de documentación técnica con OCR implícito: el modelo puede describir o extraer información de imágenes de documentos, integrándose en pipelines de digitalización.
- Evaluación de calidad de cuantización en investigación: sirve como referencia para comparar NVFP4 frente a FP8-dynamic, AWQ-8bit, AWQ-4bit y NVFP4A16 con el mismo arnés de lm-evaluation-harness.
- Razonamiento matemático en aplicaciones educativas: con un 96,7% de recuperación frente a BF16 en GSM8K, es adecuado para tutores automáticos que resuelven problemas paso a paso.
- Atención al cliente en coreano e inglés: los benchmarks KMMLU y HAE-RAE muestran una degradación contenida (98,3% y 98,5% de recuperación), lo que respalda su uso en mercados de habla coreana.
- Despliegue en entornos con restricciones de VRAM: los ~11,7 GB en disco y la cuantización W4A4 permiten alojar el modelo en GPUs de gama alta para consumidores con suficiente memoria, aunque el soporte completo de FP4 requiere Blackwell.

## Benchmarks y rendimiento

Mediciones realizadas con lm-evaluation-harness sobre vLLM, decodificación greedy, prompts de estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no directamente comparable con puntuaciones por log-likelihood. Los porcentajes entre paréntesis indican la recuperación respecto al original en BF16.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (este repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 33,03 | 46,82 (141,8%) | 32,37 (98,0%) | 32,15 (97,3%) | 35,06 (106,1%) | 33,29 (100,8%) |
| GSM8K (5-shot, estricto) | 87,11 | 86,81 (99,7%) | 86,96 (99,8%) | 84,38 (96,9%) | 84,23 (96,7%) | 86,81 (99,7%) |
| ARC-Challenge (0-shot) | 55,55 | 55,72 (100,3%) | 55,89 (100,6%) | 54,44 (98,0%) | 54,01 (97,2%) | 56,48 (101,7%) |
| Winogrande (5-shot) | 73,72 | 74,19 (100,6%) | 74,51 (101,1%) | 73,01 (99,0%) | 73,16 (99,3%) | 73,40 (99,6%) |
| KMMLU (5-shot, directo) | 58,39 | 58,05 (99,4%) | 58,51 (100,2%) | 58,26 (99,8%) | 57,41 (98,3%) | 56,96 (97,6%) |
| HAE-RAE (0-shot) | 69,48 | 69,11 (99,5%) | 69,39 (99,9%) | 70,21 (101,1%) | 68,47 (98,5%) | 67,09 (96,6%) |
| Media | 62,88 | 65,12 (103,6%) | 62,94 (100,1%) | 62,07 (98,7%) | 62,06 (98,7%) | 62,34 (99,1%) |
| Media sin MMLU | 68,85 | 68,78 (99,9%) | 69,05 (100,3%) | 68,06 (98,9%) | 67,46 (98,0%) | 68,15 (99,0%) |

Fidelidad respecto al original BF16 sobre un conjunto interno mixto inglés/coreano de 100 prompts:

| Métrica | Este modelo | Original BF16 |
|---|---|---|
| Perplejidad (menor es más cercano) | 1,5459 | 1,4506 (+6,6%) |
| Acuerdo top-1 en siguiente token | 90,3% | 99,2% |

## Requisitos de hardware

- Runtime: vLLM, con la arquitectura soportada desde vLLM ≥ 0.17.0; el autor probó con vLLM 0.32.0.
- Dependencias de vLLM 0.32: Python 3.11–3.14, torch 2.13 (build CUDA 13.0, requiere driver NVIDIA con soporte CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado, ya que el checkpoint se guardó con 0.19.0).
- GPU: velocidad FP4 completa (W4A4) en Blackwell, B200/GB200 (sm100) y B300 (sm103).
- VRAM estimada: no disponible de forma explícita; el tamaño en disco es de ~11,7 GB, por lo que la inferencia requiere al menos esa cifra más memoria para KV cache y activaciones.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras arquitecturas no Blackwell para la ruta FP4; el soporte completo de FP4 depende de sm100/sm103.
- Opciones de despliegue: vLLM es el runtime objetivo; no se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-NVFP4 (este) | 9,41B | no disponible | NVFP4 W4A4 | Apache-2.0 | Hugging Face, vLLM |
| Qwen/Qwen3.5-9B (original) | no disponible en la información | no disponible | BF16 | Apache-2.0 | Hugging Face |
| AWQ-8bit del mismo base | no disponible | no disponible | AWQ 8 bits | Apache-2.0 | Referenciado en benchmarks |
| AWQ-4bit del mismo base | no disponible | no disponible | AWQ 4 bits | Apache-2.0 | Referenciado en benchmarks |
| NVFP4A16 del mismo base | no disponible | no disponible | NVFP4 con activaciones 16 bits | Apache-2.0 | Referenciado en benchmarks |

No se dispone de datos de modelos de otros autores para una comparación cruzada fiable; las alternativas listadas son variantes de cuantización del mismo modelo base.

## Limitaciones y advertencias

- La cuantización introduce una degradación medible: perplejidad un 6,6% superior al original y acuerdo top-1 del 90,3% frente al 99,2% del BF16.
- La puntuación MMLU es inestable entre builds (rango 32,2–46,8) y depende del formato de respuesta generado; no debe interpretarse como una medida fiable de calidad de cuantización.
- El soporte completo de FP4 W4A4 requiere GPU Blackwell (sm100/sm103); en otras arquitecturas el rendimiento o la compatibilidad pueden verse comprometidos.
- El conjunto de calibración tiene predominio de coreano, lo que puede sesgar la preservación de canales hacia ese idioma.
- No se documentan los idiomas soportados oficialmente ni la longitud de contexto; ambos datos deben consultarse en el modelo base.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.
- No se incluye `generation_config.json` porque el original tampoco lo trae; los parámetros de generación deben configurarse manualmente.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y de los datos de calibración.
- El checkpoint se guardó con compressed-tensors 0.19.0 pero debe cargarse con 0.17.0 según las instrucciones del autor; actualizar esa dependencia puede romper la carga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-9B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
