# dipta007/dagger-4B_SFT

## Resumen

DAGGER-4B-SFT es un modelo de lenguaje de 4 300 millones de parámetros desarrollado por dipta007, presentado en EMNLP 2026 (Findings) bajo el marco DAGGER (Distractor-Aware Graph Generation for Executable Reasoning). El modelo reformula el razonamiento matemático como un problema de generación de grafos computacionales: en lugar de producir texto libre, genera un grafo JSON con nodos y operaciones aritméticas, marcando explícitamente los números que son distractores (información irrelevante para el cálculo final). Esto reduce drásticamente la longitud de las respuestas y mejora la trazabilidad del razonamiento.

El modelo se obtiene por ajuste fino supervisado (SFT) del modelo base google/gemma-3-4b-it, con LoRA de rango 64 y datos en bengalí e inglés. Está pensado para entornos de bajos recursos computacionales: sirve como inicialización para entrenamiento con GRPO y como baseline ligero frente a modelos de 12B. Su principal fortaleza es el razonamiento matemático multilingüe con detección de distractores, una tarea poco cubierta por modelos pequeños.

La relevancia actual del modelo reside en su enfoque novedoso: combina generación de grafos computacionales con modelado explícito de distractores, logrando un 89% menos de tokens generados que los modelos de razonamiento convencionales con precisión comparable. El modelo es de código abierto bajo la licencia Gemma de Google, con pesos en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, atención con ventana deslizante y global) |
| Parametros totales | 4.300.079.472 (4,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Gemma 3 base soporta 128K, pero el ajuste no lo especifica) |
| Tipos de cuantizacion | no disponible (repo en BF16 safetensors; compatible con cuantización GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | bengali (bn), ingles (en) |
| Licencia | Gemma (terminos de uso de Google: https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-4b-it, un transformer causal con atención híbrida (ventana deslizante para capas intermedias y atención global para capas altas), diseñado por Google para soportar contextos largos. Sobre esta base se aplicó un ajuste fino supervisado con LoRA (rango 64, alpha 128) durante 4 épocas, con un tamaño de lote global de 256, tasa de aprendizaje decreciente de 1e-5 a 1e-6 y precisión BF16. El entrenamiento se realizó con el dataset dipta007/dagger y el dataset de distracción matemática en bengal dipta007/DistMath-Bn, diseñados para enseñar al modelo a construir grafos computacionales topológicamente ordenados donde cada nodo representa una operación (add, mul, sqrt, etc.) y los nodos marcados como "distractor" no participan en la ruta de cálculo final.

La innovación principal no está en la arquitectura, sino en la formulación de la tarea: el modelo genera JSON estructurado con nodos y operaciones en lugar de razonamiento en lenguaje natural, lo que reduce la redundancia y facilita la verificación automática. El prompt de entrenamiento incluye reglas estrictas (un único nodo "final_result", orden topológico, marcado de distractores) y un ejemplo completo. El modelo se publica como punto de partida para GRPO y como baseline ligero para estudios de ablación.

## Capacidades

- Generación de grafos computacionales JSON para problemas matemáticos en bengali e inglés.
- Razonamiento matemático multilingüe con manejo de distractores: identifica qué datos son irrelevantes para el cálculo final.
- Operaciones aritméticas básicas (suma, resta, multiplicación, división), estadísticas (suma, media, min, max), redondeo (round, floor, ceil) y avanzadas (sqrt, pow, mod, gcd, lcm).
- Razonamiento estructurado con salida en formato JSON, topológicamente ordenada y con un único nodo final.
- Capacidad de seguir plantillas de instrucción complejas con reglas de formato y ejemplos.
- Soporte multilingüe limitado a bengari e inglés, con énfasis en bengari (idioma de bajos recursos).
- No soporta tool calling, visión, audio ni modos de pensamiento explícitos (los tags de HuggingFace indican image-text-to-text por herencia de Gemma 3, pero la model card no documenta uso multimodal).

## Casos de uso

- Razonamiento matemático en bengari: el modelo puede resolver problemas de aritmética cotidiana (compras, distancias, cantidades) generando un grafo computacional JSON que permite verificar el resultado de forma automática, útil en sistemas educativos para bengari.
- Detección de distractores en problemas matemáticos: el modelo marca explícitamente qué datos son irrelevantes, lo que sirve para generar ejercicios de entrenamiento con distractores controlados o para analizar la dificultad de un problema.
- Inicialización para entrenamiento con GRPO: el modelo está diseñado como punto de partida para optimización de política (GRPO), permitiendo a investigadores entrenar variantes con refuerzo sin partir de cero.
- Baseline ligero en evaluación de modelos pequeños: con solo 4,3B de parámetros, sirve para comparar el rendimiento de modelos de razonamiento matemático sin necesidad de infraestructura de 12B o más.
- Generación de datos de entrenamiento: el formato de grafo computacional permite generar pares pregunta-respuesta estructurados que pueden usarse para entrenar otros modelos o para construir datasets de razonamiento matemático.
- Verificación automática de respuestas en sistemas de tutoría: al generar un grafo ejecutable, un sistema externo puede ejecutar el grafo y comprobar si el resultado final es correcto, lo que permite una corrección automática y explicable en aplicaciones educativas.

## Benchmarks y rendimiento

La información disponible solo incluye resultados de la model card del autor, que no son benchmarks estándar (MMLU, GSM8K) sino evaluaciones propias sobre datasets de razonamiento matemático con distractores.

| Dataset | Original | +Distractor | Drop |
|---|---|---|---|
| MGSM | 40,4 | 25,1 | 15,3 |
| MSVAMP | 65,0 | 42,4 | 22,7 |
| Weighted Avg | - | - | 44,3 |

El modelo SFT se compara con su versión entrenada con GRPO:

| Modelo | Weighted Avg |
|---|---|
| dagger-4B_SFT (este modelo) | 44,3 |
| dagger-4B_SFT_GRPO | 47,3 (+3,0) |
| dagger-4B_GRPO (base → GRPO) | 32,5 |

No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~8,6 GB (el repo ocupa 8,6 GB en safetensors, por lo que se necesita al menos 10 GB de VRAM para cargar el modelo en memoria).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para inferencia en BF16 sin cuantización.
- En consumer GPU: cabe en una RTX 4090 o RTX 4080 (16 GB) en BF16, aunque con margen ajustado; con cuantización GGUF Q4_K_M (~3,5 GB) cabría en GPUs de 8 GB como RTX 3070 o RTX 4060 Ti.
- Opciones de despliegue: transformers (HuggingFace), vLLM, TGI (Text Generation Inference), llama.cpp, Ollama (si se convierte a GGUF), FriendliAI (soporte de cuantización FP8/INT4).
- Latencia y throughput: no disponibles en la información proporcionada. En una RTX 4090 se espera una generación de 50-100 tokens/s para un modelo de 4B en BF16, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Rendimiento (Weighted Avg) |
|---|---|---|---|---|---|
| dagger-4B_SFT (este) | 4,3B | no disponible | SFT sobre Gemma 3 | Gemma | 44,3 |
| dagger-4B_SFT_GRPO | 4,3B | no disponible | SFT + GRPO | Gemma | 47,3 |
| dagger-4B_GRPO | 4,3B | no disponible | GRPO directo sobre base | Gemma | 32,5 |

Como alternativas de la misma categoría (modelos pequeños de razonamiento matemático), no se dispone de comparativas publicadas con modelos como Mathstral-7B o MiniCPM-4B en la información disponible. El propio autor indica que el modelo se posiciona como baseline ligero frente a modelos de 12B, pero no ofrece datos comparativos numéricos.

## Limitaciones y advertencias

- Sesgos y cobertura idiomática: el modelo está entrenado principalmente para bengalí e inglés; su rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Riesgo de alucinación en grafos: el modelo puede generar nodos con IDs duplicados, operaciones inválidas o un grafo sin el nodo "final_result", lo que produciría respuestas no ejecutables.
- Limitaciones de contexto: no se especifica la longitud de contexto efectiva tras el ajuste; el prompt de ejemplo es largo (incluye reglas y un ejemplo completo), lo que consume una parte de la ventana de contexto.
- Restricciones de licencia: la licencia Gemma impone términos de uso de Google (prohibición de usos militares, restricciones de transferencia, etc.) y puede requerir aceptación de términos adicionales para acceso a la versión GRPO (que está restringida).
- No es un modelo de propósito general: está especializado en generación de grafos computacionales para matemáticas; su uso para otros tipos de razonamiento o generación de texto libre no está validado.
- Datos de entrenamiento limitados: el dataset de distracción en bengal es específico y de tamaño reducido; la generalización a problemas matemáticos complejos o de nivel superior no está garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dipta007/dagger-4B_SFT
- Paper (arXiv): https://arxiv.org/abs/2601.06853
- Página del proyecto: https://dipta007.github.io/DAGGER/
- Repositorio GitHub: https://github.com/dipta007/dagger
- Dataset DistractMath-Bn: https://huggingface.co/datasets/dipta007/DistractMath-Bn
- Colección de modelos DAGGER: https://huggingface.co/collections/dipta007/dagger-emnlp-2026-findings
- Modelo GRPO relacionado: https://huggingface.co/dipta007/dagger-4B_SFT_GRPO
