# axteam/Qwen3.6-35B-A3B-NVFP4

## Resumen
Qwen3.6-35B-A3B-NVFP4 es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por axteam y orientada especificamente al servicio eficiente con vLLM. El modelo base es un transformer híbrido que combina atención lineal (GatedDeltaNet/SSM) con atención completa, una arquitectura de mezcla de expertos (MoE) con 256 expertos más un experto compartido (aproximadamente 3B parámetros activos sobre 35B totales), torre de visión y una cabeza de predicción multi-token (MTP). La cuantización aplica NVFP4 (W4A4, FP4 E2M1) mediante post-training quantization con suavizado AWQ, manteniendo en BF16 las partes sensibles: torre de visión, proyector, cabeza MTP, RMSNorms, embeddings, LM head, router MoE y toda la ruta de atención lineal.

La relevancia de esta ficha es doble. Por un lado, demuestra que un MoE multimodal de 35B puede servirse en un espacio de disco de unos 25 GB con una pérdida de fidelidad moderada respecto al original BF16 (perplejidad +5,9% y 91,7% de acuerdo top-1 en un conjunto interno). Por otro, la model card documenta con inusual transparencia los problemas de evaluación: las métricas de MMLU y GSM8K oscilan enormemente entre builds del mismo modelo por razones de formato de respuesta, y algunos builds cuantizados superan al BF16 original, lo que invita a interpretar los benchmarks con cautela.

La revisión del 1 de noviembre de 2026 corrigió un defecto importante: en la primera subida el router MoE y la compuerta del experto compartido no estaban compensados durante el suavizado AWQ, lo que desviaba tokens a expertos distintos de los del original. Cualquier descarga anterior a esa fecha debe repetirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal GatedDeltaNet/SSM + atención completa), MoE con 256 expertos + 1 compartido, multimodal con torre de visión y cabeza MTP |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | ~3B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1), pesos en grupos de 16 con escala FP8 E4M3 y escala global FP32 por tensor; formato compressed-tensors `nvfp4-pack-quantized`; componentes críticos en BF16 |
| Idiomas soportados | no disponible (calibración con corpus mixto con predominio de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), ~25,0 GB en disco, repo de 48,4 GB |

## Arquitectura y entrenamiento
El modelo base emplea una arquitectura híbrida en la que se alternan capas de atención lineal basadas en GatedDeltaNet (state space model) con capas de atención completa, lo que reduce el coste computacional en secuencias largas. Sobre ese tronco se dispone una capa MoE con 256 expertos enrutados más un experto compartido, de modo que solo unos 3B parámetros se activan por token pese a los casi 36B totales. El modelo es multimodal: incorpora una torre de visión y un proyector para entrada image-text-to-text, además de una cabeza de predicción multi-token (MTP) que puede aprovecharse para decodificación especulativa.

Esta variante concreta no se ha reentrenado: es post-training quantization (PTQ) con suavizado AWQ sobre 256 muestras de calibración. Se cuantizan a FP4 los pesos y activaciones del tronco, mientras que se mantienen en BF16 aproximadamente el 9% de los parámetros: torre de visión, proyector, cabeza MTP, RMSNorms, embeddings de tokens, LM head, router MoE (`mlp.gate`), compuerta del experto compartido y toda la ruta `linear_attn.*`. La decisión de dejar la atención lineal en BF16 responde a que FP4 es demasiado grueso para esos pesos. El tokenizador, la plantilla de chat y `generation_config` son idénticos al original; `config.json` añade únicamente el bloque `quantization_config`. No se documentan en la información disponible detalles sobre el dataset de preentrenamiento del modelo base ni sobre etapas de RLHF o DPO.

## Capacidades
- Generación de texto conversacional multi-turno, con plantilla de chat idéntica al modelo original.
- Razonamiento y matemáticas: el modelo base está evaluado en MMLU, GSM8K, ARC-Challenge y Winogrande.
- Comprensión de imágenes y texto (pipeline image-text-to-text): la torre de visión se conserva en BF16 para preservar calidad.
- Capacidades multilingües: evaluado en KMMLU (coreano) y HAE-RAE (coreano), además de pruebas en inglés; el conjunto de calibración mezcla inglés y coreano.
- Soporte de decodificación especulativa mediante la cabeza MTP incluida en el modelo.
- Compatibilidad con vLLM y con el ecosistema compressed-tensors; etiquetado como `endpoints_compatible`.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni flujos de agentes multi-paso.

## Casos de uso
- Servicio de chat multimodal en producción con vLLM: al ocupar unos 25 GB en disco y usar activaciones FP4, permite desplegar un MoE de 35B con requisitos de memoria muy inferiores al BF16, manteniendo entrada de imágenes y texto en la misma API.
- Asistencia sobre documentación con imágenes: extracción y descripción de contenido en capturas, diagramas o documentos escaneados, aprovechando la torre de visión conservada en BF16 y la ventana de contexto del modelo base.
- Despliegue en infraestructura con GPU Blackwell: NVFP4 está pensado para el hardware que soporta FP4 nativo, de modo que se maximiza el throughput por GPU en cargas de inferencia concurrentes.
- Evaluación comparativa de técnicas de cuantización: el repositorio incluye benchmarks de MMLU, GSM8K, ARC-Challenge, Winogrande, KMMLU y HAE-RAE frente a BF16, FP8-dynamic, AWQ-8bit, NVFP4A16 y AWQ-4bit, lo que lo convierte en un punto de referencia útil para estudiar el impacto de FP4 en modelos MoE híbridos.
- Generación de respuestas en coreano e inglés: los benchmarks KMMLU y HAE-RAE y la calibración con corpus coreano lo hacen adecuado para aplicaciones bilingües en esos idiomas, con la cautela de que no se declaran idiomas oficialmente soportados.
- Prototipado de decodificación especulativa: la cabeza MTP incluida permite experimentar con técnicas de aceleración de inferencia sin necesidad de un modelo draft separado.
- Investigación sobre robustez de la cuantización: la ficha documenta explícitamente el fallo del router MoE en la primera revisión y su corrección, un caso práctico para estudiar cómo los errores de calibración en el enrutador afectan a la fidelidad.

## Benchmarks y rendimiento
Medidos con lm-evaluation-harness sobre vLLM, decodificación greedy y prompts estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no directamente comparable con puntuaciones por log-likelihood. Los porcentajes entre paréntesis indican recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (este repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generative) | 64,44 | 67,45 (104,7%) | 64,02 (99,3%) | 69,31 (107,6%) | 68,39 (106,1%) | 74,12 (115,0%) |
| GSM8K (5-shot, strict) | 30,40 | 21,53 (70,8%) | 28,81 (94,8%) | 24,49 (80,5%) | 46,55 (153,1%) | 71,11 (233,9%) |
| ARC-Challenge (0-shot) | 55,38 | 54,61 (98,6%) | 55,46 (100,2%) | 55,03 (99,4%) | 56,23 (101,5%) | 54,78 (98,9%) |
| Winogrande (5-shot) | 76,32 | 75,37 (98,8%) | 76,24 (99,9%) | 74,43 (97,5%) | 74,27 (97,3%) | 75,85 (99,4%) |
| KMMLU (5-shot, direct) | 65,14 | 64,86 (99,6%) | 65,18 (100,1%) | 64,50 (99,0%) | 64,09 (98,4%) | 64,61 (99,2%) |
| HAE-RAE (0-shot) | 74,89 | 74,89 (100,0%) | 75,07 (100,2%) | 75,34 (100,6%) | 74,06 (98,9%) | 73,69 (98,4%) |
| Media | 61,09 | 59,78 (97,9%) | 60,80 (99,5%) | 60,52 (99,1%) | 63,93 (104,6%) | 69,03 (113,0%) |
| Media sin MMLU ni GSM8K | 67,93 | 67,43 (99,3%) | 67,99 (100,1%) | 67,33 (99,1%) | 67,16 (98,9%) | 67,23 (99,0%) |

El propio autor advierte que MMLU y GSM8K dependen fuertemente del formato de respuesta y oscilan entre builds del mismo modelo (MMLU 64,0–74,1; GSM8K 21,5–71,1), y que dos builds cuantizados superan al BF16 original en esas tareas, probablemente por formato y no por calidad de cuantización. No se verificaron las salidas pregunta por pregunta.

Fidelidad respecto al original BF16 en un conjunto interno mixto inglés/coreano de 100 prompts:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es más cercano) | 1,3700 | 1,2934 (+5,9%) |
| Acuerdo top-1 en siguiente token | 91,7% | 98,0% |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el modelo ocupa ~25,0 GB en disco y el repo completo 48,4 GB, por lo que el peso de los parámetros en memoria ronda esos 25 GB más el estado de ejecución y caché KV.
- GPU recomendadas: NVFP4 requiere soporte nativo de FP4, disponible en la familia Blackwell (por ejemplo, B200); no se documentan pruebas en otras arquitecturas.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 ni con GPU Ampere o Ada, dado que no soportan FP4 de forma nativa.
- Despliegue: vLLM, con la arquitectura incluida desde vLLM ≥ 0.17.0 y probado con vLLM 0.32.0; vLLM 0.32 requiere Python 3.11–3.14. El formato compressed-tensors es específico de este stack; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-NVFP4 (este repo) | 35,95B totales / ~3B activos | NVFP4 W4A4 | no disponible | Apache-2.0 | Hugging Face, ~25 GB |
| Qwen/Qwen3.6-35B-A3B (original) | 35,95B totales / ~3B activos | BF16 | no disponible | Apache-2.0 | Hugging Face |
| Variante NVFP4A16 del mismo base | 35,95B totales / ~3B activos | NVFP4 con activaciones de mayor precisión | no disponible | Apache-2.0 | Referenciada en los benchmarks, sin URL en la información disponible |
| Variante AWQ-4bit del mismo base | 35,95B totales / ~3B activos | AWQ 4 bits | no disponible | Apache-2.0 | Referenciada en los benchmarks, sin URL en la información disponible |

No se dispone de datos sobre modelos alternativos de otros autores con arquitectura y tamaño comparables en la información proporcionada.

## Limitaciones y advertencias
- La cuantización NVFP4 introduce una degradación medible: +5,9% de perplejidad y 91,7% de acuerdo top-1 frente al BF16 original en el conjunto interno del autor.
- Las puntuaciones de MMLU y GSM8K no son fiables como medida de calidad de cuantización: varían enormemente por formato de respuesta y algunos builds cuantizados superan al BF16. No se verificaron las salidas individuales.
- La primera revisión del repositorio (anterior al 1 de noviembre de 2026, revisión `6de6e2c`) tenía el router MoE y la compuerta del experto compartido sin compensar, lo que enrutaba tokens a expertos distintos del original. Es obligatorio redescargar si se obtuvo antes de esa fecha.
- Dependencia fuerte de hardware Blackwell: NVFP4 no es viable de forma nativa en GPU Ampere, Ada o anteriores, lo que limita el despliegue en infraestructura convencional.
- Dependencia de vLLM y compressed-tensors; no se documenta soporte en otros runtimes.
- Idiomas soportados no declarados oficialmente; la calibración tiene predominio de coreano, lo que puede sesgar el comportamiento hacia ese idioma y hacia el inglés.
- Longitud de contexto no disponible, lo que impide planificar cargas con ventanas largas sin verificar el `config.json` del modelo base.
- Riesgo de alucinación inherente al modelo base; la cuantización puede amplificarlo en tareas de razonamiento y matemáticas, como sugiere la caída de GSM8K en varias variantes.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero conviene conservar los avisos de atribución del modelo base.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.6-35B-A3B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
