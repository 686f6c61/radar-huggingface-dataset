# FINAL-Bench/Darwin-4B-Opus

## Resumen

Darwin-4B-Opus es un modelo de lenguaje multimodal de tipo image-text-to-text desarrollado por FINAL-Bench mediante fusión evolutiva de dos modelos derivados de la familia Gemma 4. Concretamente, combina `google/gemma-4-E4B-it` (denominado "padre" en la model card) y `arsovskidev/Gemma-4-E4B-Claude-4.6-Opus-Reasoning-Distilled` ("madre") usando el motor propietario Darwin V6, que asigna un ratio de mezcla independiente a cada tensor en lugar de aplicar un ratio uniforme como hacen herramientas convencionales tipo mergekit.

El modelo se presenta como el miembro más pequeño de la familia Darwin Opus y está orientado a razonamiento con modo "thinking" destilado de Claude 4.6 Opus. Según la model card, emplea una arquitectura Gemma 4 Expert 4B de tipo MoE con 128K de contexto y soporte para más de 140 idiomas, aunque el repositorio declara un total de 7.996.156.490 parámetros en safetensors, cifra que no coincide con la denominación "4B" y que conviene verificar en el despliegue real.

Su relevancia actual radica en la propuesta metodológica: un pipeline de fusión guiado por diagnóstico (MDS), optimización evolutiva con CMA-ES y validación capa por capa, empaquetado bajo licencia Apache 2.0 y publicado en abril de 2026 con actualización en noviembre del mismo año.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Gemma 4 (Gemma4ForConditionalGeneration), variante Expert 4B MoE según model card |
| Parametros totales | 7.996.156.490 (safetensors); la model card indica "4B" |
| Parametros activos | no disponible |
| Longitud de contexto | 128K (según model card) |
| Tipos de cuantizacion | no disponible para este modelo (BF16 en pesos originales); la familia Darwin dispone de GGUF Q8 en otros tamaños |
| Idiomas soportados | en, ko, ja, zh, multilingual; la model card declara 140+ idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es el resultado de una fusión de pesos entre dos checkpoints Gemma 4 E4B. La arquitectura subyacente es la de Gemma 4 en su variante Expert 4B, descrita en la model card como MoE y multimodal (image-text-to-text), con ventana de 128K tokens. El motor Darwin V6 realiza un diagnóstico previo a nivel de tensor (entropía, desviación estándar, norma) combinado con cinco sondas funcionales, y calcula un ratio por tensor según la fórmula `combined = static × 0.4 + probe × 0.6`, optimizado después mediante CMA-ES sobre un genoma de 14 dimensiones. Los tensores con ratio inferior a 0,15 se transplantan íntegramente del padre y los superiores a 0,85 de la madre, evitando ruido de interpolación.

Tras la fusión se aplica una validación "Health Check" capa por capa comparando el hijo con ambos progenitores para detectar interferencias y pérdida de función. La reproducibilidad se garantiza mediante una semilla derivada de un `genome_hash`. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO adicionales; la destilación de razonamiento proviene del modelo madre, entrenado a partir de trazas de Claude 4.6 Opus.

## Capacidades

- Generación de texto conversacional y razonamiento con modo "thinking" (destilado de Claude 4.6 Opus).
- Procesamiento multimodal image-text-to-text (entrada de imágenes y texto).
- Razonamiento reforzado en código, ciencia y análisis, heredado del modelo madre.
- Capacidades multilingües declaradas para inglés, coreano, japonés y chino, con soporte declarado de 140+ idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el modo thinking sugiere cadenas de razonamiento internas.
- Contexto largo de hasta 128K tokens para documentos extensos o conversaciones multi-turno.

## Casos de uso

- Razonamiento sobre documentos largos: con 128K de contexto puede ingerir informes completos, contratos o bases de código y responder preguntas que requieran correlacionar información dispersa a lo largo del documento.
- Asistente de análisis científico y técnico: la destilación de razonamiento del modelo madre lo hace adecuado para explicar conceptos, resumir papers y razonar sobre datos experimentales en entornos con recursos limitados.
- Prototipado rápido en local: al ser el miembro más pequeño de la familia Darwin Opus, permite iterar sobre prompts y flujos de razonamiento en una estación de trabajo antes de escalar a Darwin-9B o Darwin-31B.
- Procesamiento de documentación multilingüe: útil para equipos que trabajan con material en inglés, coreano, japonés y chino, con salida en el idioma del usuario.
- Análisis de capturas e imágenes técnicas: al ser image-text-to-text, puede describir diagramas, extraer texto de figuras o responder preguntas sobre imágenes adjuntas en un chat.
- Evaluación comparativa de técnicas de fusión: sirve como caso de estudio reproducible (semilla por `genome_hash`) para investigadores que quieran replicar o contrastar el pipeline Darwin V6 frente a DARE-TIES.
- Despliegue en el borde o en entornos con presupuesto de memoria ajustado: su tamaño contenido respecto a Darwin-31B lo hace candidato para servicios de inferencia de bajo coste con contexto largo.

## Benchmarks y rendimiento

| Benchmark | Darwin-4B-Opus | Condición |
|---|---|---|
| ARC-Challenge | 82,92 % | loglikelihood, zero-shot |

La model card advierte que la arquitectura Gemma 4 (`Gemma4ForConditionalGeneration`) tiene compatibilidad limitada con el método de loglikelihood de lm-eval debido a su envoltorio multimodal, y que solo la evaluación generativa produce resultados válidos para modelos basados en Gemma 4. Se anuncia una evaluación extendida con Majority Voting, pero no está publicada en la información disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 16 GB solo para pesos (7.996 M parámetros × 2 bytes), más overhead de activaciones y caché KV para 128K de contexto, que puede elevar el requisito muy por encima de los 24 GB en secuencias largas.
- GPU recomendadas para BF16 con contexto largo: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado; en contextos cercanos a 128K será necesario cuantizar o reducir la ventana efectiva.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para este checkpoint en la información disponible. La familia Darwin dispone de GGUF Q8 oficial en el modelo de 35B, no en este.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Darwin-4B-Opus | 7.996 M (safetensors); "4B" según card | 128K | Apache 2.0 | Fusión Darwin V6, ARC-Challenge 82,92 % |
| google/gemma-4-E4B-it | no disponible | 128K | Gemma (no confirmada en esta ficha) | Modelo base "padre", multimodal, sin destilación de razonamiento |
| arsovskidev/Gemma-4-E4B-Claude-4.6-Opus-Reasoning-Distilled | no disponible | no disponible | no disponible | Modelo base "madre", destilación de razonamiento de Claude 4.6 Opus |
| Darwin-9B-Opus / Darwin-31B-Opus | 9B / 31B (según denominación) | no disponible | Apache 2.0 (según familia) | Miembros mayores de la misma familia, con demos en Spaces |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cifra de parámetros del repositorio (7.996 M) contradice la denominación "4B" y la descripción "Expert 4B MoE"; conviene validar el tamaño real y el número de parámetros activos antes de dimensionar infraestructura.
- El único benchmark publicado es ARC-Challenge en zero-shot por loglikelihood, y la propia model card advierte que ese método tiene validez limitada para Gemma 4; la evidencia de rendimiento es escasa.
- Al ser una fusión de pesos y no un entrenamiento completo, puede heredar sesgos de ambos progenitores y de los datos de destilación de Claude 4.6 Opus, sin que se documenten evaluaciones de sesgo.
- Riesgo de alucinación inherente a los modelos generativos; no se reportan métricas de fidelidad ni de calibración.
- El soporte multilingüe se declara de forma genérica (140+ idiomas) pero solo se listan en, ko, ja y zh; el rendimiento en castellano no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede arrastrar términos adicionales de Google que deben revisarse antes de producción.
- No hay información sobre tool calling, agentes o formatos de plantilla de chat específicos, lo que complica la integración en pipelines existentes.
- El modelo tiene un volumen de descargas muy bajo (34) y una fecha de creación en 2026; la madurez y el soporte de la comunidad son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-4B-Opus
- Modelo base padre: https://huggingface.co/google/gemma-4-E4B-it
- Modelo base madre: https://huggingface.co/arsovskidev/Gemma-4-E4B-Claude-4.6-Opus-Reasoning-Distilled
- Darwin-4B-David (Gen2): https://huggingface.co/FINAL-Bench/Darwin-4B-David
- Darwin-4B-Genesis (Gen3): https://huggingface.co/FINAL-Bench/Darwin-4B-Genesis
- Darwin-9B-Opus: https://huggingface.co/FINAL-Bench/Darwin-9B-Opus
- Demo Darwin-9B-Opus: https://huggingface.co/spaces/FINAL-Bench/Darwin-9B-Opus
- Darwin-31B-Opus: https://huggingface.co/FINAL-Bench/Darwin-31B-Opus
- Demo Darwin-31B-Opus: https://huggingface.co/spaces/FINAL-Bench/Darwin-31B-Opus
- Darwin-35B-A3B-Opus: https://huggingface.co/FINAL-Bench/Darwin-35B-A3B-Opus
- Demo Darwin-35B-A3B-Opus: https://huggingface.co/spaces/FINAL-Bench/Darwin-35B-A3B-Opus
- GGUF Q8 oficial Darwin-35B-A3B-Opus: https://huggingface.co/FINAL-Bench/Darwin-35B-A3B-Opus-Q8-GGUF
- GGUF de bartowski: https://huggingface.co/bartowski/FINAL-Bench_Darwin-35B-A3B-Opus-GGUF
- Leaderboard FINAL Bench: https://huggingface.co/spaces/FINAL-Bench/Leaderboard
- Leaderboard ALL Bench: https://huggingface.co/spaces/FINAL-Bench/all-bench-leaderboard
- Paper referenciado (arXiv 2311.03099): https://arxiv.org/abs/2311.03099
- Paper referenciado (arXiv 2605.14386): https://arxiv.org/abs/2605.14386
