# leonsarmiento/Arete-27B-oQ4e

## Resumen

Arete-27B-oQ4e es una cuantización MLX de 4 bits del modelo NousResearch/Arete-27B, publicada por leonsarmiento. Arete-27B es un ajuste fino supervisado de Qwen/Qwen3.8-27B realizado por Nous Research con el objetivo de reforzar valores occidentales (libertad de expresión, privacidad de datos, democracia, política medioambiental, etc.) sobre un modelo base entrenado originalmente en China. El resultado es un VLM denso de 27.356 millones de parámetros con 64 capas (48 de atención lineal y 16 de atención completa) y una ventana de contexto de 262K tokens.

Esta versión concreta aplica la receta oQ4e ("data-aware"), que parte de una base global de 4 bits con group_size=64 y eleva selectivamente a 5, 6 y 8 bits los tensores cuyo error de cuantización la matriz de importancia (imatrix) marca como costoso, calculada sobre activaciones reales del dataset de calibración `oqe_code_multilingual`. El resultado ocupa 17,19 GB en 4 shards (~5,03 bits por peso), conserva la torre de visión a 4 bits y está pensada para ejecutarse en Apple Silicon mediante mlx-vlm, LM Studio u oMLX.

Su relevancia es doble: por un lado demuestra una técnica de cuantización sensible a datos aplicada a un modelo multimodal de 27B; por otro, documenta de forma transparente el efecto del post-entrenamiento de alineamiento de valores sobre el comportamiento del modelo, con métricas públicas (Propaganda Eval) que cuantifican el cambio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (48 capas de atención lineal + 16 de atención completa), VLM con torre de visión |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | 4-bit global (group_size=64) con elevación selectiva a 5, 6 y 8 bits; normas en bf16; ~5,03 bpw efectivos |
| Idiomas soportados | no disponible (el calibrado usa un dataset multilingüe de código, pero la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con metadatos `format: mlx` (4 shards, 17,19 GB) |

## Arquitectura y entrenamiento

El modelo base Arete-27B parte de Qwen/Qwen3.8-27B, un VLM denso con arquitectura de atención híbrida: 64 capas en total, de las cuales 48 usan atención lineal y 16 usan atención completa (una capa completa cada 4 capas, `full_attention_interval: 4`). Dispone de torre de visión y una cabeza MTP (multi-token prediction) que, según la model card, no se incluye en el repositorio fuente (`mtp_num_hidden_layers` = 0) y por tanto tampoco en esta cuantización.

El post-entrenamiento de Nous Research fue exclusivamente supervisión fina (SFT), sin RL ni optimización de preferencias y sin modificación arquitectónica: aproximadamente 20.000 prompts y 52,8 millones de tokens en siete categorías de valores, destilados del profesor abierto Inkling, entrenados a 64K de contexto durante 2 épocas. Todos los pesos del modelo de lenguaje se entrenaron; el codificador de visión permaneció congelado (datos solo de texto) y la cabeza MTP estuvo desactivada. Esta cuantización oQ4e ejecuta una pasada de calibración sobre 128 muestras de 512 tokens (presupuesto adaptativo hasta 1024) y 496 entradas de activación con la clase `qwen3_5` de mlx-vlm, elevando a mayor precisión los tensores con mayor error: `embed_tokens` y todas las capas de atención completa a 5 bits, `lm_head` y algunos tensores de atención a 6 bits, y cuatro tensores `linear_attn.in_proj_{a,b}` de las capas 50 y 62 a 8 bits.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (262K tokens).
- Razonamiento explícito en modo thinking, con `reasoning_effort` configurable en {low, medium, high, xhigh} (por defecto xhigh).
- Tool calling / function calling, con parser `qwen3_xml` y parser de razonamiento `qwen3`.
- Comprensión de imágenes (pipeline image-text-to-text) mediante la torre de visión conservada a 4 bits.
- Capacidades multilingües heredadas del modelo base Qwen3.8-27B (no se declara lista explícita de idiomas).
- Alineamiento de valores medido: reducción de propaganda del 22% al 0,9% en Propaganda Eval, con mejora de factualidad de 2,32 a 2,98 sobre 5.
- Sin decodificación especulativa MTP en esta build (no hay cabezas MTP en el modelo fuente).

## Casos de uso

- Asistente conversacional en local sobre Apple Silicon: con 17,19 GB en 4 shards y formato MLX, se puede cargar en LM Studio u oMLX para conversaciones multi-turno con contexto largo, sin depender de servicios en la nube.
- Análisis de documentos e imágenes: la torre de visión permite extraer información de capturas, gráficos o páginas escaneadas y razonar sobre ellas en el mismo contexto de 262K tokens.
- Moderación y análisis de sesgo ideológico: el modelo está entrenado explícitamente para detectar y evitar propaganda en siete categorías (libertad de expresión, vigilancia, democracia, etc.), lo que lo hace útil como herramienta de evaluación de contenido político.
- Generación y revisión de código multilingüe: el dataset de calibración `oqe_code_multilingual` y el soporte de tool calling permiten integrarlo en pipelines de asistencia a programadores, con parsing XML de llamadas a herramientas.
- Agentes con razonamiento multi-paso: el modo thinking con `reasoning_effort` ajustable y los parsers `qwen3`/`qwen3_xml` facilitan tareas de planificación y ejecución de herramientas en entornos locales.
- Investigación sobre cuantización data-aware: sirve como caso de estudio reproducible para comparar oQ4e frente a recetas uniformes de 4 bits, dado que la model card detalla tensor a tensor qué se elevó y por qué.
- Despliegue edge en estaciones de trabajo Mac: al no requerir GPU NVIDIA ni VRAM dedicada, encaja en flujos de trabajo de desarrolladores que trabajan en macOS con memoria unificada de 32 GB o más.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden al modelo base Arete-27B, no a esta cuantización concreta:

| Benchmark | Antes (Qwen3.8-27B) | Despues (Arete-27B) |
|---|---|---|
| Propaganda Eval — fact mean (sobre 5) | 2,32 | 2,98 |
| Propaganda Eval — respuestas con propaganda | 22% | 0,9% |
| Propaganda Eval — libertad de expresión (fact) | 0,89 | 2,44 |
| Propaganda Eval — libertad de expresión (propaganda) | 60% | 1% |
| Hermes Bench | 65,77% | 65,60% |
| Terminal-Bench-2.1 | 67% | 70% |

No se han publicado resultados de benchmarks específicos para la cuantización oQ4e en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 17,19 GB de pesos en 4 shards; se recomienda al menos 24 GB de memoria unificada para inferencia con contexto moderado y 32 GB o más para contexto largo.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada; el formato MLX no está pensado para GPU NVIDIA.
- ¿Cabe en GPU consumer? No en el sentido tradicional: requiere Apple Silicon con memoria unificada suficiente; no se distribuye en GGUF para GPUs consumer NVIDIA.
- Opciones de despliegue: mlx-vlm, LM Studio, oMLX. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Arete-27B-oQ4e (este) | 27,36B | 262K | MLX safetensors, ~5,03 bpw | Apache 2.0 | Cuantización data-aware con visión preservada |
| NousResearch/Arete-27B | 27,36B | 262K | safetensors (bf16 presumiblemente) | Apache 2.0 | Modelo fuente sin cuantizar; sin cabezas MTP |
| Qwen/Qwen3.8-27B | 27B (aprox.) | 262K | safetensors | no disponible en la información | Modelo base original, sin alineamiento de valores |
| leonsarmiento/Qwen3.8-27B-heretic-ara-4bit-mtp-mlx | 27B (aprox.) | no disponible | MLX 4-bit con MTP | no disponible en la información | Hermano con decodificación especulativa MTP |

## Limitaciones y advertencias

- Sesgos conocidos: el ajuste fino refuerza deliberadamente valores occidentales; esto puede introducir sesgo ideológico en sentido contrario y afectar respuestas sobre temas políticos, económicos o sociales.
- Riesgo de alucinación: inherente a los modelos de 27B; la mejora de factualidad medida en Propaganda Eval no garantiza precisión factual general.
- Sesgo de calibración: la cuantización oQ4e se calibró sobre `oqe_code_multilingual`, lo que puede desviar la representación hacia código y texto multilingüe y penalizar otros dominios.
- Limitaciones de contexto e idioma: aunque soporta 262K tokens, el rendimiento en contextos muy largos no está verificado para esta cuantización; no se declara lista de idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo fuente enlazada en la model card.
- Caveat de producción: sin cabezas MTP no hay decodificación especulativa, lo que reduce el throughput frente a variantes hermanas; el formato MLX limita el despliegue a entornos Apple.
- Parsers y sampling: requiere configuración específica (`reasoning_parser: qwen3`, `tool_call_parser: qwen3_xml`) y parámetros de muestreo distintos según modo thinking o no-thinking.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leonsarmiento/Arete-27B-oQ4e
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de Nous Research sobre Arete: https://nousresearch.com/arete
- Dataset de evaluación Propaganda Eval: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Licencia del modelo fuente: https://huggingface.co/NousResearch/Arete-27B/blob/main/LICENSE
- Variante hermana con MTP: https://huggingface.co/leonsarmiento/Qwen3.8-27B-heretic-ara-4bit-mtp-mlx
