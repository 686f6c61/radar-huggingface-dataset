# Anurag9817/nepali-llama-590m-1.50b-tokens

## Resumen

Nepali LLaMA 590M — 1.50B Tokens es un modelo de lenguaje causal de 590.077.440 parámetros publicado por el usuario Anurag9817 en HuggingFace. No es un modelo entrenado desde cero: es un checkpoint de preentrenamiento continuado (*continued pretraining*) que parte de `Anurag9817/nepali-llama-590m-1.30b-tokens` y añade un segundo tramo de entrenamiento de 200.015.872 tokens sobre `HuggingFaceFW/fineweb_edu_100BT-shuffled`. La exposición acumulada declarada es de aproximadamente 1.500 millones de tokens.

La arquitectura es de estilo LLaMA: 18 capas, tamaño oculto de 1536, tamaño intermedio de 4096, 12 cabezas de atención con 6 cabezas de clave/valor (atención agrupada, GQA), vocabulario de 40.000 tokens con tokenizer SentencePiece y embeddings posicionales de hasta 2048. El entrenamiento se hizo con secuencias de 1024 tokens en 2x NVIDIA T4, con FP16, AdamW de 8 bits y `torch.compile`.

Su interés es fundamentalmente de investigación y de bajo coste: documenta de forma reproducible un tramo de preentrenamiento de 6,87 horas, con loss final de 2,85291 y 763 pasos de optimizador. No es un modelo utilizable en producción ni en conversación, porque no ha pasado por *instruction tuning* ni SFT, y porque la ficha no declara licencia, idiomas soportados ni pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo LLaMA, con atención agrupada (GQA) |
| Parámetros totales | 590.077.440 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 embeddings posicionales como máximo; entrenado con secuencias de 1024 |
| Tipos de cuantización | No se publican pesos cuantizados. Repositorio solo en safetensors (compatible con cuantización externa a 8 y 4 bits) |
| Idiomas soportados | No declarados en la model card. Tokenizer de orientación nepalí (40.000 tokens) y dataset de entrenamiento FineWeb-Edu (predominantemente inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Vocabulario | 40.000 tokens (SentencePiece, `tokenizer/nepali_llama_40k.model`) |
| Tamaño oculto | 1536 |
| Tamaño intermedio (FFN) | 4096 |
| Capas | 18 |
| Cabezas de atención / cabezas KV | 12 / 6 |
| Tokens especiales | PAD = 0, UNK = 1, BOS = 2, EOS = 3 |
| Modelo base | `Anurag9817/nepali-llama-590m-1.30b-tokens` |
| Dataset de entrenamiento | `HuggingFaceFW/fineweb_edu_100BT-shuffled` |
| Tokens entrenados en este tramo | 200.015.872 |
| Exposición acumulada declarada | ~1.500 millones de tokens |
| Loss final de entrenamiento | 2,85291 |
| Hardware de entrenamiento | 2x NVIDIA T4 |
| Duración del entrenamiento | 6,87 horas |
| Fecha de publicación en HuggingFace | 25 de septiembre de 2026 (según metadatos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de estilo LLaMA, con 18 capas, dimensión oculta 1536 y FFN de 4096. El ratio de 12 cabezas de consulta frente a 6 cabezas de clave/valor indica atención agrupada (GQA), que reduce el tamaño de la caché KV. La model card no especifica el tipo de normalización, la función de activación ni el esquema de posiciones, más allá del límite de 2048 *position embeddings*; dado el contexto declarado, se trata de un LLaMA clásico y no de una arquitectura híbrida (MoE, SSM) ni de un modelo con decodificación especulativa.

El entrenamiento es un segundo tramo de preentrenamiento continuado sobre el checkpoint de 1.300 millones de tokens del mismo autor. Sobre el dataset `fineweb_edu_100BT-shuffled` se saltaron los primeros 250 millones de tokens del tokenizer y se entrenaron los 200.015.872 siguientes, con longitud de secuencia 1024, 2x T4, batch de 2 por GPU, acumulación de gradiente de 64 y 262.144 tokens globales por actualización. Se usaron learning rate 1e-4, sin *warmup*, weight decay 0,1, scheduler coseno, FP16, AdamW de 8 bits y `torch.compile`, sin *gradient checkpointing* y sin checkpoints intermedios. El resultado declarado es de 763 pasos, 6,87 horas, ~8.100 tokens/segundo y loss final 2,85291. No se documenta ningún tipo de ajuste posterior (SFT, RLHF o DPO), ni una fase de evaluación.

## Capacidades

- Generación de texto causal: al ser un modelo base sin ajuste de instrucciones, su comportamiento nativo es la continuación de texto, no el seguimiento de instrucciones.
- Modelado de lenguaje y *scoring*: útil para calcular verosimilitudes y perplejidad sobre corpus de dominio.
- Base para *fine-tuning*: puede servir como punto de partida para SFT, clasificación o extracción de características mediante ajuste supervisado o LoRA.
- Investigación de tokenizers: incluye un SentencePiece de 40.000 tokens de orientación nepalí, útil para estudiar cobertura léxica y tokenización de lenguas del sur de Asia.
- Soporte de *tool calling* / *function calling*: no disponible; no se ha entrenado para ello.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no declaradas; no hay evaluación por idioma en la información disponible.
- Modo *thinking*, visión, audio u otras modalidades: no disponible; el modelo es exclusivamente de texto.
- Razonamiento, matemáticas y código: sin datos de evaluación que respalden ninguna capacidad específica en estas áreas.

## Casos de uso

- Investigación sobre preentrenamiento continuado: reproducir el experimento (200 millones de tokens, 2x T4, 6,87 horas) para medir la ganancia real de un segundo tramo de *continued pretraining* frente al checkpoint base de 1.300 millones de tokens.
- Ablaciones de infraestructura de entrenamiento: la ficha documenta de forma explícita FP16, AdamW de 8 bits, `torch.compile`, acumulación de gradiente y ausencia de *gradient checkpointing*, lo que lo convierte en un caso de referencia para comparar configuraciones en GPUs de gama baja.
- Estudio de tokenizers de lenguas del sur de Asia: el SentencePiece de 40.000 tokens permite analizar tasas de compresión y fertilidad léxica en nepalí e idiomas relacionados, comparándolo con tokenizers multilingües genéricos.
- Punto de partida para *fine-tuning* supervisado: con 590 millones de parámetros se puede ajustar por tarea (clasificación, resumen de dominio, generación de texto especializado) en una única GPU de 16-24 GB mediante LoRA o ajuste completo en precisión reducida.
- Scorer de perplejidad en *pipelines* de filtrado de datos: usar el modelo para puntuar la verosimilitud de documentos y descartar texto de baja calidad antes de un entrenamiento mayor.
- Prototipado y docencia: permite montar un *pipeline* completo de inferencia con tokenizer propio y pesos safetensors en portátiles o GPUs de consumo, sin depender de modelos de miles de millones de parámetros.
- Base para destilación o comparativas de escalado: sirve como punto de la curva de 590M para contrastar con modelos de 100M-1B en estudios de *scaling laws* a presupuestos de cómputo muy bajos.
- Generación de texto no supervisada en experimentos lingüísticos: continuación de frases y análisis de distribuciones de salida, asumiendo la ausencia de instrucciones y el riesgo elevado de incoherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento: loss final 2,85291 en el paso 763, ~8.100 tokens/segundo de *throughput* de entrenamiento y 6,87 horas de cómputo en 2x T4. El loss de 2,85291 corresponde a una perplejidad geométrica de aproximadamente 17,3, pero el valor no es directamente comparable con otros modelos porque depende del tokenizer específico de 40.000 tokens.

## Requisitos de hardware

- Pesos en precisión completa: 590.077.440 parámetros equivalen a ~2,36 GB en FP32 y ~1,18 GB en FP16/BF16. El repositorio ocupa 2,4 GB, coherente con una copia en FP32 junto al tokenizer.
- Caché KV: para 2048 tokens con 18 capas, 6 cabezas KV y dimensión de cabeza 128, se estiman ~113 MB en FP16 (cálculo propio a partir de las especificaciones declaradas).
- VRAM estimada para inferencia: en torno a 1,5 GB en FP16 con contexto completo, más *overhead* del runtime; por debajo de 1 GB si se cuantiza a 8 o 4 bits con herramientas externas.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente (GTX 1650, RTX 3050, RTX 3060, RTX 4090, T4). También es viable en CPU, ya que 590M parámetros es un tamaño manejable.
- Cabe en GPU de consumo: sí, en toda la gama actual de NVIDIA y AMD con al menos 4 GB de VRAM, y en iGPU con memoria unificada suficiente.
- Opciones de despliegue: `transformers` (PyTorch) de forma nativa; vLLM y TGI son viables por el tamaño; llama.cpp y Ollama requieren convertir los pesos a GGUF, formato que no se distribuye en el repositorio.
- Latencia y *throughput* de inferencia: no disponible. El único dato de velocidad publicado (~8.100 tokens/segundo) es *throughput* de entrenamiento en 2x T4 con batch 2 y secuencia 1024, y no debe extrapolarse a inferencia.

## Comparativa con modelos similares

Las especificaciones de los modelos comparados proceden de sus fichas públicas; no existe ninguna comparación de rendimiento publicada para el modelo analizado, por lo que la tabla se limita a parámetros, contexto y licencia.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de benchmarks |
|---|---|---|---|---|
| Nepali LLaMA 590M (1.50B tokens) | 590.077.440 | 2048 (entrenado a 1024) | No disponible | No publicados |
| TinyLlama-1.1B | ~1.100 millones | 2048 | Apache 2.0 | Sí, publicados por el autor |
| Qwen2.5-0.5B | ~494 millones | 32.768 | Apache 2.0 | Sí, publicados por el autor |
| SmolLM2-360M | ~362 millones | 8192 | Apache 2.0 | Sí, publicados por el autor |

Diferencias relevantes: los tres modelos de referencia tienen licencia explícita y contextos iguales o superiores, y sus autores publican evaluaciones estandarizadas. El modelo analizado no declara licencia ni idiomas, y su contexto de entrenamiento (1024 tokens) es la mitad del máximo teórico de sus embeddings posicionales (2048).

## Limitaciones y advertencias

- No está ajustado por instrucciones: la propia model card indica que es únicamente un checkpoint de preentrenamiento continuado, sin SFT ni *instruction tuning*. No debe usarse como asistente conversacional.
- Sin licencia declarada: no se especifica ninguna licencia, lo que genera incertidumbre legal sobre el uso comercial y la redistribución.
- Idiomas no declarados: el nombre y el tokenizer apuntan al nepalí, pero el dataset de entrenamiento es `fineweb_edu_100BT-shuffled`, predominantemente en inglés. No hay evaluación que aclare el rendimiento real por idioma.
- Desajuste de tokenizer y datos: continuar el preentrenamiento de un tokenizer nepalí con un corpus mayoritariamente inglés puede degradar la calidad de las representaciones en ambos idiomas.
- Sesgos conocidos: no disponibles. No se ha publicado ningún análisis de sesgo, y el dataset de origen (FineWeb-Edu) es texto educativo filtrado de la web, con los sesgos propios de esa fuente.
- Riesgo de alucinación: elevado. Con 590 millones de parámetros y ~1.500 millones de tokens de exposición acumulada, la capacidad de almacenar conocimiento factual es muy limitada; el loss final de 2,85291 implica una perplejidad alta.
- Limitación de contexto: aunque los embeddings posicionales llegan a 2048, el entrenamiento se realizó con secuencias de 1024 tokens, por lo que el rendimiento más allá de esa longitud no está validado.
- Sin checkpoints intermedios ni evaluación: la ficha indica explícitamente que no se guardaron checkpoints intermedios y no reporta ninguna métrica de validación, lo que impide analizar la dinámica del entrenamiento.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni resultados reproducibles por terceros.
- No debe modificarse el tokenizer: la model card advierte de que no se reemplace el tokenizer original ni se redimensione el vocabulario, ya que los pesos están vinculados al SentencePiece de 40.000 tokens.
- Fecha de publicación atípica: los metadatos indican 25 de septiembre de 2026, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anurag9817/nepali-llama-590m-1.50b-tokens
- Modelo base (checkpoint de 1.30b tokens): https://huggingface.co/Anurag9817/nepali-llama-590m-1.30b-tokens
- Dataset de preentrenamiento continuado: https://huggingface.co/datasets/HuggingFaceFW/fineweb_edu_100BT-shuffled
- Paper de FineWeb / FineWeb-Edu (referencia del dataset, arXiv:2406.17557): https://arxiv.org/abs/2406.17557
