# MinimaLabs/KLM-1.5

## Resumen

KLM 1.5 es un modelo de lenguaje base de 98.975.308 parámetros desarrollado por MinimaLabs, publicado bajo licencia Apache 2.0 y entrenado desde cero sobre 100.000 millones de tokens. Sustituye a KLM 1.1 (88,1M), que era una continuación del entrenamiento de KeyLM-75M; en esta versión hay arquitectura nueva y pretrain completo. Está pensado como modelo de investigación y como base para fine-tuning en tareas acotadas, no como asistente listo para usar: no ha pasado por RLHF ni DPO y no dispone de plantilla de chat.

Técnicamente es un transformer híbrido de 24 capas que combina capas Gated DeltaNet-2 (memoria recurrente de tamaño fijo) con atención completa en proporción 3:1, e incorpora dos innovaciones poco habituales en este rango de tamaño: Block Attention Residuals (cada capa lee una mezcla aprendida de las salidas de todas las capas anteriores) y una memoria exacta de n-gramas de 5,4M parámetros que cubre los 125.000 bigramas y 38.000 trigramas más frecuentes del corpus de entrenamiento.

Su relevancia ahora es doble: por un lado, compite en el segmento submallado (menos de 100M) con una puntuación de 30,26 en el Intelligence Index de Open SLM, donde ocupa el primer puesto entre modelos de menos de 100M y el segundo entre los de menos de 150M; por otro, sirve como banco de pruebas abierto de arquitecturas híbridas y de técnicas de entrenamiento como Token-Superposition Training.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de 24 capas: Gated DeltaNet-2 y atención completa en ratio 3:1, con Block Attention Residuals y memoria exacta de n-gramas |
| Parámetros totales | 98.975.308 (de ellos, 5.411.832 corresponden a la memoria de n-gramas) |
| Longitud de contexto | 2.048 tokens (longitud de entrenamiento) |
| Tipos de cuantización | No disponible; solo se publican pesos safetensors sin cuantizar |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, vía transformers con `custom_code` (arquitectura `klm`) |
| Tamaño del repositorio | 0,4 GB |
| Dimensión oculta | 512 |
| Vocabulario | 4.100 tokens (cada número se divide en dígitos individuales; embeddings atados) |
| Feed-forward | SwiGLU con dimensión intermedia de 1.408 |
| Atención | 8 cabezas de consulta, 4 cabezas KV, tamaño de cabeza 64, RoPE, QK-norm y puerta de salida |
| Gated DeltaNet-2 | 4 cabezas × 128 |

## Arquitectura y entrenamiento

El modelo abandona el transformer denso convencional: de las 24 capas, tres de cada cuatro son Gated DeltaNet-2, que mantienen un estado recurrente de tamaño fijo en lugar de atender a todos los tokens anteriores, y la cuarta es atención completa con GQA (8 cabezas de consulta y 4 KV). A esto se suman los Block Attention Residuals, en los que cada capa aprende una mezcla de los embeddings y de las salidas de todas las capas previas en vez de acumular un único residuo, y una memoria de n-gramas consultada exactamente (125.000 bigramas y 38.000 trigramas frecuentes, 5,4M parámetros) que se inyecta junto a los embeddings de token. El tokenizador es deliberadamente pequeño, 4.100 tokens con dígitos separados, y al estar atados los embeddings solo cuestan 2,1M parámetros.

El entrenamiento se hizo con secuencias de 2.048 tokens y 128 secuencias por paso, en tres fases: un calentamiento de 70.000 pasos con Token-Superposition Training (cada posición es la media de 7 tokens consecutivos y el modelo predice los 7 siguientes como grupo desordenado), que cubre 128.000 millones de tokens de ClimbMix con el coste computacional de unos 18.000 millones; una fase estable de 80.000 millones de tokens con tasa de aprendizaje constante; y una fase de decaimiento de 20.000 millones de tokens con más matemáticas y Q&A, bajando la tasa según una curva 1−√t. Las matrices de pesos usan MuonEq-R (lr 0,01) y embeddings, normas y puertas usan AdamW (3e-3), todo en bf16. Cada secuencia empaqueta varios documentos y la atención está enmascarada en los límites, con reinicio del estado recurrente y del historial de n-gramas.

La mezcla de datos cambia entre las fases estable y de decaimiento: texto web (ClimbMix, TxT360-v2, UltraX) pasa del 56% al 26%; Q&A del 13% al 23%; libros de texto (Cosmopedia v2, WikiHow) del 12% al 14%; matemáticas (OpenMathInstruct-2, UltraData-Math, Math-Reasoning, Dolmino TinyMATH) del 11% al 20%; ciencia web del 3% al 8%; sentido común (DCLM filtrado, ATOMIC 2020, ANLI, GLUCOSE, CREAK, SciQ, QASC) del 3% al 8%; y reescrituras de razonamiento (Pretrain-Behaviors) del 2% al 1%.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de un prompt: es un modelo base, sin ajuste por instrucciones.
- Razonamiento de sentido común y conocimiento enciclopédico de nivel básico, medido en ARC-Easy (59,68%), ARC-Challenge (32,68%), HellaSwag (43,74%) y PIQA (68,55%).
- Aritmética de un solo dígito y operaciones simples, favorecida por el tokenizador que separa cada dígito; ArithMark-3 lo sitúa en 48,20%.
- Modelado de lenguaje y predicción de siguiente token con contexto de 2.048 tokens, útil como base para fine-tuning supervisado.
- Memoria léxica exacta de bigramas y trigramas frecuentes, que actúa como sesgo fuerte en la generación de colocaciones habituales.
- No dispone de tool calling ni de function calling: no hay ajuste por instrucciones ni formato de herramientas publicado.
- No soporta flujos de agentes ni razonamiento multi-paso guiado; tampoco tiene modo "thinking" ni capacidades de visión o audio.
- Multilingüe: no. La model card declara únicamente inglés y el vocabulario de 4.100 tokens está orientado a ese idioma.

## Casos de uso

- Investigación en arquitecturas híbridas: sirve para reproducir y hacer ablaciones sobre la mezcla 3:1 de Gated DeltaNet-2 y atención completa, comparando perplejidad y throughput frente a un transformer denso equivalente con kernels de flash-linear-attention.
- Estudio de Block Attention Residuals: al ser uno de los pocos checkpoints abiertos con esta técnica y a escala de 99M, permite medir su efecto en tareas de razonamiento sin necesidad de clústeres grandes.
- Análisis de memorización de n-gramas: la memoria explícita de 5,4M parámetros facilita experimentos sobre cómo el modelo explota bigramas y trigramas y hasta qué punto eso se traduce en texto plausible pero no fiable.
- Fine-tuning para clasificación o etiquetado en inglés: con 99M parámetros y contexto de 2.048 tokens es viable entrenar cabezas de clasificación de reseñas, tickets o titulares en una sola GPU consumer, con coste de inferencia mínimo.
- Despliegue en dispositivos y entornos sin GPU: los pesos en bf16 ocupan unos 198 MB y en int8 alrededor de 99 MB, de modo que cabe en una Raspberry Pi, en un portátil modesto o como autocompletado offline en aplicaciones de escritorio.
- Docencia y divulgación: es un caso de estudio completo, con tokenizador pequeño, embeddings atados, fase de calentamiento por superposición y mezcla de datos documentada, para explicar el entrenamiento de un LM desde cero.
- Evaluación de pipelines de inferencia: por su tamaño, permite probar integraciones de transformers con `trust_remote_code`, kernels lineales y cuantización posterior sin grandes costes de infraestructura.
- Generación de texto corto en pruebas A/B o entornos de test: su coste permite generar miles de muestras para validar plantillas, filtros de seguridad o sistemas de detección de texto generado.

## Benchmarks y rendimiento

Todas las puntuaciones son zero-shot con precisión normalizada por longitud. ARC, HellaSwag y PIQA se evaluaron con lm-eval 0.4.12; ArithMark-3, con el script oficial. Las cifras de los modelos comparados proceden de Open SLM Leaderboard a fecha 22 de octubre de 2026.

| Modelo | Parámetros | ARC-Easy | ARC-Challenge | HellaSwag | PIQA | ArithMark-3 |
|---|---:|---:|---:|---:|---:|---:|
| KLM 1.5 | 99,0M | 59,68% | 32,68% | 43,74% | 68,55% | 48,20% |
| KLM 1.1 | 88,1M | 44,36% | 25,17% | 33,65% | 64,80% | 35,80% |
| GPT-X3-150M | 149M | 59,64% | 31,31% | 46,16% | 71,33% | 50,90% |
| SmolLM2-135M | 135M | 58,63% | 29,69% | 43,22% | 68,44% | 39,20% |
| LFM-2.5-230M-Base | 230M | 59,72% | 34,98% | 39,29% | 63,38% | 36,60% |
| void.1 | 90,1M | 47,31% | 28,16% | 38,68% | 67,46% | 44,80% |

El Intelligence Index de Open SLM Leaderboard para KLM 1.5 es 30,26, lo que lo sitúa primero entre los modelos de menos de 100M parámetros y segundo entre los de menos de 150M. Frente a KLM 1.1 gana 15,3 puntos en ARC-Easy, 7,5 en ARC-Challenge, 10,1 en HellaSwag, 3,8 en PIQA y 12,4 en ArithMark-3. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: unos 198 MB con pesos en bf16, unos 396 MB en fp32 y alrededor de 99 MB en int8; el estado recurrente y la caché KV para 2.048 tokens añaden una cantidad marginal dada la dimensión oculta de 512 y las 4 cabezas KV.
- GPU recomendadas: ninguna en particular; funciona en cualquier GPU con 1 GB o más de VRAM. Una RTX 3060, una RTX 4090 o una A100 quedan enormemente sobredimensionadas y solo tienen sentido para entrenamiento o evaluación por lotes a gran escala.
- Cabe holgadamente en GPU consumer (GTX 1050 Ti, RTX 2060, RTX 4060, etc.) y también en CPU, incluidos dispositivos tipo Raspberry Pi, por debajo de 0,5 GB de memoria.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía soportada, y requiere las dependencias de la arquitectura `klm` (kernels de Gated DeltaNet-2, publicados en el repositorio flash-linear-attention). No hay soporte nativo publicado en vLLM, llama.cpp, Ollama ni TGI; al tratarse de una arquitectura personalizada haría falta portar las capas híbridas.
- Latencia y throughput: no disponible; no se han publicado mediciones de tokens por segundo ni de latencia por token en la información proporcionada.
- No se han publicado versiones GGUF, AWQ, GPTQ ni recetas oficiales de cuantización; cualquier cuantización requeriría validar la memoria de n-gramas y las capas recurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---:|---|---|---|
| KLM 1.5 | 99,0M | 2.048 | Apache 2.0 | Híbrido DeltaNet/atención, memoria de n-gramas; mejor ArithMark-3 del grupo tras GPT-X3-150M |
| KLM 1.1 | 88,1M | No disponible | No disponible | Generación anterior, continuación de KeyLM-75M; peor en todas las métricas publicadas |
| SmolLM2-135M | 135M | No disponible | No disponible | 36M parámetros más; supera a KLM 1.5 en PIQA y ARC-Easy por márgenes estrechos, pero cae 9 puntos en ArithMark-3 |
| GPT-X3-150M | 149M | No disponible | No disponible | 50% más de parámetros; mejor HellaSwag, PIQA y ArithMark-3, con ARC-Easy prácticamente empatado |
| LFM-2.5-230M-Base | 230M | No disponible | No disponible | Más del doble de parámetros; mejor ARC-Challenge, peor en HellaSwag, PIQA y ArithMark-3 |
| void.1 | 90,1M | No disponible | No disponible | Similar en tamaño; KLM 1.5 lo supera en las cinco métricas publicadas |

La comparación es limitada: solo se dispone de cinco benchmarks de conocimiento y sentido común, sin datos de contexto, licencia ni rendimiento en código o matemáticas complejas para la mayoría de alternativas.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable, no mantiene formato de chat y puede continuar el texto con derivas irrelevantes.
- Riesgo alto de alucinación: con 99M parámetros y 100.000 millones de tokens, la precisión factual es limitada; los benchmarks lo sitúan cerca del azar en ARC-Challenge (32,68% frente al 25% de la línea base).
- Solo inglés: el vocabulario de 4.100 tokens y el corpus de entrenamiento no cubren castellano; usarlo en otros idiomas produce degradación severa.
- Contexto de 2.048 tokens, muy corto para documentos largos, conversaciones multi-turno o RAG con varios fragmentos; además el estado recurrente y el historial de n-gramas se reinician en cada límite de documento durante el entrenamiento, lo que conviene replicar en inferencia.
- La memoria exacta de n-gramas puede reforzar colocaciones frecuentes del corpus, incluidas asociaciones estereotipadas; no se ha publicado ninguna evaluación de sesgos.
- Requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código del repositorio; conviene fijar una revisión concreta y auditar el código antes de usarlo en producción.
- Ecosistema de inferencia reducido: sin soporte en vLLM, llama.cpp, Ollama o TGI, y dependencia de kernels externos de Gated DeltaNet-2, lo que complica el despliegue y la cuantización.
- Benchmarks con pocas tareas y sin intervalos de confianza publicados; las diferencias de 1-2 puntos frente a modelos de tamaño similar pueden no ser significativas.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con la obligación habitual de conservar avisos de copyright y licencia y de indicar cambios; no hay cláusulas de uso aceptable específicas publicadas.
- No debe usarse en aplicaciones críticas (salud, legal, finanzas) sin fine-tuning, evaluación propia y filtros externos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MinimaLabs/KLM-1.5
- Modelo anterior KLM 1.1: https://huggingface.co/MinimaLabs/KLM-1.1
- Paper de Block Attention Residuals (Kimi Team, 2026): https://arxiv.org/abs/2603.15031
- Paper de Token-Superposition Training: https://arxiv.org/abs/2605.06546
- Repositorio flash-linear-attention (kernels de Gated DeltaNet-2): https://github.com/fla-org/flash-linear-attention
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset ArithMark-3.0: https://huggingface.co/datasets/AxiomicLabs/ArithMark-3.0
- Ficha de arquitectura en hfviewer: https://hfviewer.com/MinimaLabs/KLM-1.5
- Endpoint de inferencia para KLM 1.1 en FriendliAI: https://friendli.ai/models/MinimaLabs/KLM-1.1
- Leaderboard de benchmarks BenchLM: https://benchlm.ai/
- Corpus Nemotron-ClimbMix: https://huggingface.co/datasets/nvidia/Nemotron-ClimbMix
- Corpus TxT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
- Corpus UltraX-Preview: https://huggingface.co/datasets/openbmb/UltraX-Preview
- Corpus smollm-corpus (Cosmopedia v2): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Corpus Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Corpus DCLM-baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Corpus OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Corpus UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Corpus Math-Reasoning: https://huggingface.co/datasets/IFM/Math-Reasoning
- Corpus dolma3_dolmino_mix-100B-1025: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-100B-1025
- Corpus Pretrain-Behaviors: https://huggingface.co/datasets/IFM/Pretrain-Behaviors
