# awahab111/urdu-126m

## Resumen

urdu-126m es un modelo de lenguaje decoder-only de 125,9 millones de parámetros entrenado desde inicialización aleatoria sobre texto en urdu por el desarrollador awahab111. Se trata de un modelo base (no instruido) que continúa texto y no sigue instrucciones, construido sobre la arquitectura nanochat de Andrej Karpathy, lo que implica innovaciones como value embeddings, smear gate, lambdas residuales por capa y soft cap de logits. No es un modelo de `transformers` ni tiene implementación en llama.cpp o GGUF.

El proyecto aborda un problema medible: los tokenizadores diseñados para inglés son ineficientes con urdu. Su tokenizador BPE de 32.768 entradas reduce el coste de 5,95 a 1,25 tokens por palabra (4,76 veces menos) frente a GPT-2 BPE sobre el mismo texto, abaratando proporcionalmente entrenamiento e inferencia. El modelo usa un contexto de 2.048 tokens y se entrenó con 0,84B tokens en una sola pasada sobre un corpus de 2,85B tokens derivado de FineWeb-2 y Wikipedia.

Es relevante como ejercicio de referencia para modelos de bajos recursos: entrena en 59 minutos con una sola GPU L40S por 1,92 dólares, publica recetas completas y mide de forma explícita la fuga de benchmarks. Su utilidad práctica es limitada por su tamaño y por su condición de modelo base sin ajuste instructivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanochat (value embeddings, smear gate, lambdas residuales, soft cap de logits) |
| Parametros totales | 125,9M almacenados (42,0M en matrices transformer + cabeza) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (sin implementación GGUF/llama.cpp) |
| Idiomas soportados | urdu (ur) |
| Licencia | MIT |
| Formato de pesos | no disponible (pesos para el código de nanochat; repo de 0,3 GB) |

## Arquitectura y entrenamiento

El modelo tiene 8 capas, d_model de 512, 4 cabezas de consulta y 4 de clave/valor con dimensión de cabeza 128, MLP con expansión 4x y activación ReLU al cuadrado, normalización RMSNorm pre-norm y posiciones RoPE. La atención usa ventana deslizante con patrón `SSSL`, donde las capas S operan sobre un cuarto del contexto. El vocabulario es de 32.768 entradas. La distribución de parámetros es llamativa: 25,2M en matrices transformer, 16,8M en la cabeza de desembebido, 16,8M en el embedding de tokens y 67,1M en value embeddings; más de la mitad del modelo son tablas de búsqueda, no cómputo.

El entrenamiento usó 0,84B tokens en una pasada sin repetición, extraídos de un corpus de 2,85B tokens (FineWeb-2 `urd_Arab` y Wikipedia `20231101.ur`), tras filtrado de calidad, deduplicación exacta con BLAKE2b y normalización de caracteres árabes a puntos de código urdu. Se ejecutó en una L40S en Modal con bf16, 3.200 pasos, batch de 262.144 tokens, optimizador Muon para matrices y AdamW para embeddings, en 59 minutos y por 1,92 dólares. No se menciona RLHF ni DPO. La validación se hizo solo sobre Wikipedia, excluida del entrenamiento, para medir generalización entre fuentes.

## Capacidades

- Generación y continuación de texto en urdu; es un modelo base sin ajuste instructivo.
- Compresión eficiente de texto urdu gracias a su tokenizador específico (1,25 tokens por palabra).
- Modelado de lenguaje a nivel de carácter y byte, medido con bits por byte.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- Capacidad multilingüe prácticamente nula: el tokenizador es caro para inglés (3 tokens para `education` frente a 1 de GPT-2).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre tokenizadores de bajos recursos: sirve como referencia reproducible para medir el ahorro de un vocabulario específico de urdu frente a BPE inglés sobre corpus comparables.
- Experimentos de escalado a bajo coste: su receta (0,84B tokens, 59 minutos, 1,92 dólares) permite replicar curvas de bits por byte y comparar con el hermano urdu-286m.
- Generación de texto urdu para aumento de datos: puede producir continuaciones sintéticas de documentos para pipelines de preentrenamiento o evaluación.
- Evaluación de fugas de benchmark: su metodología de huellas de 60 caracteres sobre el corpus es reutilizable para auditar otros conjuntos de evaluación en lenguas de bajos recursos.
- Docencia y formación: ejemplo completo y documentado de preentrenamiento desde cero con nanochat, útil para explicar arquitectura, tokenización y métricas.
- Prototipado de autocompletado en urdu en entornos con restricciones de cómputo, siempre que se acepte su naturaleza de modelo base y su contexto de 2.048 tokens.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Bits por byte en validación (Wikipedia) | 0,6953 |
| UrduMMLU (26.431 preguntas) | 24,84% (línea base aleatoria: 25,0%) |
| Documentos con huella de benchmark (Wikipedia) | 1 de 165.039 |
| Documentos con huella de benchmark (FineWeb-2) | 140 de 4.048.757 (0,63% del benchmark) |

La puntuación en UrduMMLU no mide conocimiento: el análisis de prior de letras del modelo hermano muestra concentración en A y C, y la precisión cae donde ese prior predice. La fuga medida afecta a preguntas de poesía clásica, y las subcategorías afectadas puntúan en la línea de azar.

## Requisitos de hardware

- Inferencia en bf16: el modelo almacena 125,9M parámetros, por lo que ocupa aproximadamente 0,25 GB en pesos, más overhead de activaciones y caché KV para 2.048 tokens.
- Cabe holgadamente en cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4090) e incluso en CPU para uso no interactivo.
- GPU recomendadas para entrenamiento o fine-tuning: L40S (la usada por el autor), A100 o H100 para lotes mayores.
- Despliegue: requiere el código de nanochat; no hay soporte en vLLM, TGI, llama.cpp, Ollama ni GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Val bpb | UrduMMLU | Licencia |
|---|---|---|---|---|---|
| urdu-126m | 125,9M (42,0M matrices) | 2.048 | 0,6953 | 24,84% | MIT |
| urdu-286m | 286M (84,9M matrices) | no disponible | 0,6113 | 24,58% | MIT |
| Alternativas de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

El hermano urdu-286m, del mismo autor, usa el mismo corpus, tokenizador y receta; el modelo mayor comprime urdu un 12% mejor en validación, que es todo el resultado de escalado reportado.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene diálogos; usarlo como asistente produce continuaciones, no respuestas.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Rendimiento en UrduMMLU indistinguible del azar; no debe interpretarse como conocimiento factual.
- Tokenizador muy ineficiente para inglés y otras lenguas no urdu, lo que desaconseja su uso bilingüe.
- Riesgo de alucinación y de reproducir sesgos presentes en FineWeb-2 y Wikipedia, sin filtrado posterior documentado.
- Sin implementación en ecosistemas estándar (transformers, GGUF, vLLM), lo que complica su integración en producción.
- Licencia MIT para los pesos, pero los datos de origen tienen licencias propias (FineWeb-2 ODC-By 1.0, Wikipedia CC BY-SA) que pueden condicionar usos derivados.
- El repositorio registra 0 descargas y 0 likes, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/awahab111/urdu-126m
- Modelo hermano urdu-286m: https://huggingface.co/awahab111/urdu-286m
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Wikipedia (20231101.ur): https://huggingface.co/datasets/wikimedia/wikipedia
