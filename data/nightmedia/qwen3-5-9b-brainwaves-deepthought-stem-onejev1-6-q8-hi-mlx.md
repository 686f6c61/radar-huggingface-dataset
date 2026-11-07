# nightmedia/Qwen3.5-9B-Brainwaves-DeepThought-STEM-OneJev1.6-q8-hi-mlx

## Resumen

Qwen3.5-9B-Brainwaves-DeepThought-STEM-OneJev1.6-q8-hi-mlx es un modelo experimental publicado por nightmedia, un laboratorio independiente con sede en Montana (EE. UU.) que opera con un MacBook Pro de 128 GB y tarjetas de memoria. Se trata de un merge de tres modelos derivados de Qwen3.5-9B: nightmedia/Qwen3.5-9B-Brainwaves, xtools-at/Qwen3.5-9B-DeepThought-STEM y OmniJev/OneJev1.6-9B. El objetivo declarado es combinar capacidades de razonamiento STEM y chain-of-thought largo con escritura creativa, generación de tramas y roleplaying, manteniendo el soporte multilingüe y de imagen-texto del modelo base.

El modelo se distribuye en una cuantización q8-hi orientada a MLX (Apple Silicon), derivada de un proceso de cuantización propio del autor que también publica variantes mxfp8, q6-hi y mxfp4 del componente Brainwaves. La ficha incluye métricas de perplexity, memoria pico y tokens por segundo para cada cuantización, lo que permite evaluar el compromiso entre calidad y coste de inferencia en hardware de consumo.

Es relevante ahora porque documenta, con números concretos, hasta qué punto un merge de 9B parámetros puede acercarse en tareas de razonamiento a modelos mucho mayores, y porque expone el impacto real de la cuantización de 8 bits sobre benchmarks de conocimiento (ARC, BoolQ, HellaSwag, OpenBookQA, PIQA, Winogrande). No obstante, se trata de un artefacto experimental, sin descargas ni validación externa en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); el merge incorpora técnicas de multi-token prediction y decodificación especulativa según los tags del autor |
| Parámetros totales | 9B (heredados de la familia Qwen3.5-9B) |
| Parámetros activos | No es MoE; no aplica |
| Longitud de contexto | 256k y 1M tokens citados en los tags del autor; no verificado de forma independiente |
| Tipos de cuantización | q8-hi (esta versión); el componente Brainwaves ofrece además bf16, mxfp8, q6-hi y mxfp4 |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | Safetensors (librería transformers); orientado a MLX en la variante q8-hi |
| Pipeline | image-text-to-text |
| Modelos base del merge | OmniJev/OneJev1.6-9B, xtools-at/Qwen3.5-9B-DeepThought-STEM, nightmedia/Qwen3.5-9B-Brainwaves |
| Herramienta de merge | mergekit |
| Fecha de publicación | 7 de noviembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento desde cero. Combina tres derivados de Qwen3.5-9B mediante mergekit: Brainwaves aporta el perfil de escritura creativa y roleplaying; DeepThought-STEM aporta razonamiento STEM con chain-of-thought largo; y OneJev1.6-9B aporta capacidades conversacionales y de razonamiento adicionales. La arquitectura subyacente es un transformer decoder-only de 9B parámetros con atención estándar, sobre el que el autor declara soporte de multi-token prediction y decodificación especulativa, así como ventanas de contexto de 256k y 1M tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO en los modelos base. El autor sí documenta el proceso de cuantización: la variante q8-hi se compara contra bf16, mxfp8, q6-hi y mxfp4 sobre el componente Brainwaves, con métricas de perplexity y benchmarks de conocimiento. La innovación técnica destacable no está en el entrenamiento, sino en la metodología de evaluación de cuantizaciones y en la publicación abierta de los compromisos medidos.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo declarado de hasta 256k y 1M tokens.
- Razonamiento explícito con chain-of-thought y long-CoT, heredado del componente DeepThought-STEM.
- Matemáticas y tareas STEM: el autor reporta aproximadamente 90,5 % en GSM8K y 0,704 en ARC-Challenge para el merge Brainwaves-OneJev1.6, cifras que no se han verificado de forma independiente para esta variante q8-hi.
- Generación de código, según los tags del autor (coding, coder-flash).
- Escritura creativa: generación de tramas, subtramas, ficción, continuación de escenas, storytelling y roleplaying.
- Procesamiento image-text-to-text (pipeline declarado), aunque no se detallan capacidades de visión específicas.
- Multilingüe en inglés, chino, japonés y español.
- Soporte declarado de decodificación especulativa y multi-token prediction.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explícita, aunque el long-CoT es compatible con flujos multi-paso.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de varios pasos con trazas de chain-of-thought largas, adecuado para tutoría o verificación de demostraciones donde interesa inspeccionar el razonamiento intermedio.
- Investigación en STEM: análisis de problemas de física o matemáticas con contexto extenso, aprovechando la ventana declarada de 256k tokens para incorporar artículos completos.
- Escritura de ficción y narrativa larga: generación de tramas, subtramas y continuación de escenas con coherencia sobre documentos extensos, gracias al contexto largo y al componente Brainwaves.
- Roleplaying y narrativa interactiva: conversaciones multi-turno con memoria de contexto amplia, útil para motores de juegos de rol o asistentes narrativos.
- Asistencia a la programación: generación y explicación de código en un entorno local sobre Apple Silicon, con la cuantización q8-hi como opción de despliegue en un MacBook Pro de 128 GB.
- Evaluación de cuantizaciones: el modelo sirve como caso de estudio reproducible para medir la degradación de benchmarks al pasar de bf16 a q8-hi, q6-hi y mxfp4, con perplexity y throughput documentados.
- Prototipado multilingüe: atención a usuarios en inglés, chino, japonés y español dentro de una misma aplicación conversacional.

## Benchmarks y rendimiento

El autor publica resultados del componente Brainwaves y del modelo base Qwen3.5-9B Instruct, pero no de este merge completo en su variante q8-hi, salvo un valor aislado de ARC (0,701) y de ARC/e (0,878) para mxfp8. Se reproducen a continuación los datos disponibles.

Componente nightmedia/Qwen3.5-9B-Brainwaves:

| Cuantización | ARC | ARC/e | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande |
|---|---|---|---|---|---|---|---|
| bf16 | 0,686 | 0,860 | 0,903 | 0,768 | 0,516 | 0,800 | 0,713 |
| mxfp8 | 0,678 | 0,856 | 0,904 | 0,763 | 0,502 | 0,800 | 0,702 |
| q8-hi | 0,687 | 0,860 | 0,904 | 0,768 | 0,518 | 0,797 | 0,715 |
| q6-hi | 0,686 | 0,857 | 0,903 | 0,766 | 0,520 | 0,797 | 0,710 |
| mxfp4 | 0,669 | 0,855 | 0,894 | 0,762 | 0,488 | 0,800 | 0,696 |

Coste de inferencia del componente Brainwaves:

| Cuantización | Perplexity | Memoria pico | Tokens/s |
|---|---|---|---|
| bf16 | 4,157 ± 0,027 | 24,69 GB | 767 |
| mxfp8 | 4,292 ± 0,028 | 16,02 GB | 624 |
| q8-hi | 4,156 ± 0,027 | 16,86 GB | 652 |
| q6-hi | 4,160 ± 0,027 | 14,62 GB | 597 |
| mxfp4 | 4,501 ± 0,030 | 11,55 GB | 635 |

Modelo base Qwen3.5-9B Instruct:

| Cuantización | ARC | ARC/e | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande |
|---|---|---|---|---|---|---|---|
| mxfp8 | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| q8-hi | 0,561 | 0,708 | 0,892 | 0,690 | 0,448 | 0,764 | 0,685 |
| q8 | 0,564 | 0,713 | 0,892 | 0,690 | 0,442 | 0,766 | 0,687 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K para esta variante concreta en la información disponible, más allá de la referencia aproximada del autor a GSM8K (~90,5 %) para el merge Brainwaves-OneJev1.6.

## Requisitos de hardware

- VRAM/RAM unificada estimada: la cuantización q8-hi del componente Brainwaves requiere 16,86 GB de memoria pico; el merge completo de 9B en q8-hi debería situarse en un rango similar, aunque no se ha medido para esta variante exacta.
- GPU recomendadas: el formato q8-hi está orientado a MLX y Apple Silicon; para CUDA serían necesarias una RTX 4090 (24 GB) o superiores (A100, H100) si se convierte a otro formato.
- Cabe en GPU de consumo: sí, en RTX 4090 y en MacBook Pro de 128 GB con memoria unificada; en GPUs de 16 GB el margen es ajustado para q8-hi y convendría usar q6-hi o mxfp4.
- Opciones de despliegue: transformers y MLX (formato nativo de esta variante); vLLM, llama.cpp, Ollama y TGI no están documentados para este artefacto.
- Throughput: 652 tokens/s en q8-hi y 767 tokens/s en bf16 según las mediciones del autor sobre el componente Brainwaves, en su entorno de laboratorio (MacBook Pro de 128 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Brainwaves-DeepThought-STEM-OneJev1.6 q8-hi (este) | 9B | 256k/1M declarados | Apache 2.0 | Hugging Face, 0 descargas | Merge experimental, métricas propias |
| Qwen3.5-9B Instruct (base) | 9B | No disponible | Apache 2.0 | Hugging Face | Referencia de benchmarks del autor |
| nightmedia/Qwen3.5-9B-Brainwaves | 9B | No disponible | Apache 2.0 | Hugging Face | Componente del merge, con tabla completa de cuantizaciones |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9B | No disponible | No disponible | Hugging Face | Componente del merge, orientado a STEM |

## Limitaciones y advertencias

- Modelo experimental sin descargas ni validación externa en el momento de la ficha; los benchmarks proceden del propio autor.
- Los resultados de benchmarks publicados corresponden al componente Brainwaves y al modelo base, no a este merge completo en q8-hi, salvo valores aislados.
- Riesgo de alucinación no cuantificado; el long-CoT puede producir cadenas de razonamiento plausibles pero incorrectas.
- El soporte de tool calling, agentes y visión no está documentado de forma explícita pese al pipeline image-text-to-text.
- La ventana de 256k/1M tokens es una declaración del autor y no se ha verificado de forma independiente.
- El formato q8-hi está orientado a MLX; el despliegue en CUDA requiere conversión y no hay guías publicadas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un merge de modelos de terceros conviene revisar las licencias de los tres componentes base.
- El modelo incluye contenido de roleplaying y escritura creativa; no se documentan filtros de seguridad ni evaluaciones de sesgo.
- El autor advierte que el laboratorio es independiente y de recursos limitados, lo que puede afectar al mantenimiento y a las actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves-DeepThought-STEM-OneJev1.6-q8-hi-mlx
- Componente Brainwaves: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves
- Merge Brainwaves-OneJev1.6: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves-OneJev1.6
- Componente DeepThought-STEM: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Componente OneJev1.6-9B: https://huggingface.co/OmniJev/OneJev1.6-9B
