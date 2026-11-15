# david-rename/gpt-pp-base

## Resumen

gpt-pp base es un modelo de lenguaje de tipo GPT decoder-only con 135.266.304 parámetros, desarrollado por el usuario david-rename como parte del proyecto educativo gpt-pp, una implementación de GPT escrita con fines didácticos ("a small GPT written to be read"). El modelo se ha entrenado desde cero sobre 3.000 millones de tokens del subconjunto `sample/10BT` de FineWeb-EDU, un corpus de páginas web de carácter educativo, y su propósito principal es servir como ejemplo de estudio y como base para experimentación, no como asistente de producción.

La arquitectura sigue la receta de NanoChat (2026) con 12 capas, anchura 768, 12 cabezas de atención de 64 dimensiones, MLP de 3.072 unidades con squared ReLU sin sesgos, normalización RMS sin ganancias y embeddings posicionales rotatorios con base 10.000. La longitud de contexto es de 1.024 tokens y el vocabulario de 32.768 tokens mediante BPE a nivel de byte con el patrón de división de GPT-4. Los pesos se distribuyen en float32 en formato safetensors bajo la arquitectura NanoChat de transformers, con una subclase propia de unas 30 líneas que requiere `trust_remote_code=True`.

El modelo es relevante ahora como referencia de bajo coste computacional (entrenado en 3,2 horas sobre tres GPU) y como banco de pruebas reproducible para estudiar el comportamiento de modelos pequeños. Su model card documenta de forma inusualmente transparente las decisiones de diseño, los resultados de evaluación en bits por byte y una lista de 90 incidencias conocidas del código, lo que lo convierte en un material útil para investigación y docencia más que para despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (receta NanoChat 2026) |
| Parametros totales | 135.266.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan versiones cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32), requiere `trust_remote_code=True` |
| Capas, anchura, cabezas | 12 capas, 768 de anchura, 12 cabezas de 64 dimensiones |
| MLP | 3.072 de anchura, squared ReLU, sin sesgos |
| Vocabulario | 32.768 tokens, BPE a nivel de byte con patrón de GPT-4 |
| Posiciones | rotatorias, base 10.000 |
| Normalizacion | RMS norm sin ganancias (eps 1e-6) tras el embedding, antes de cada sublayer y antes del unembedding; queries y keys normalizadas por cabeza |
| Salida | unembedding no atado; logits limitados por 15·tanh(z/15) |
| Libreria | transformers (probado con 5.23.0) |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas y 768 de anchura, con 12 cabezas de atención de 64 dimensiones cada una. El MLP tiene 3.072 unidades y usa squared ReLU sin sesgos. La normalización es RMS norm sin ganancias, aplicada tras el embedding, antes de cada sublayer y antes del unembedding; las queries y las keys se normalizan por cabeza de forma que una puntuación de atención equivale a 12 veces el coseno entre query y key. Las posiciones son rotatorias con base 10.000. La salida usa un unembedding no atado y los logits se limitan mediante 15·tanh(z/15). El tokenizador es BPE a nivel de byte con vocabulario de 32.768 tokens y el patrón de división de GPT-4; antepone `<|bos|>` a cada texto y el modelo cierra un texto escribiendo `<|bos|>`, que actúa como token de fin.

El entrenamiento consistió en 20.345 pasos de 147.456 tokens cada uno, totalizando 2.999.992.320 tokens (el 30 % del subconjunto `sample/10BT` de FineWeb-EDU, leído una sola vez), sobre tres GPU en 3,2 horas. Se usó el optimizador Muon para las matrices ocultas y AdamW para las dos tablas (embedding y unembedding), con autocast en bfloat16. No se aplicó instruction tuning ni entrenamiento de seguridad. El modelo se distribuye con los pesos en float32 tal como se entrenaron, bajo los nombres de la arquitectura NanoChat de transformers, con una única diferencia: gpt-pp multiplica cada query normalizada por una ganancia que no puede absorberse en los pesos, por lo que se incluye en `modeling_gptpp.py`, una subclase de NanoChat de unas 30 líneas. Además, en W_Q y W_K se negó la segunda mitad de las filas de cada cabeza para adaptar la orientación de los pares rotatorios de NanoChat; la conversión está en `scripts/export_hf.py` y verifica los logits contra el código original de gpt-pp con una concordancia de 7,7e-14 en float64.

## Capacidades

- Generación de texto en inglés: continuación de texto libre coherente a nivel de frase, con calidad propia de un modelo de 135M parámetros.
- Modelado de lenguaje y puntuación de texto: útil para calcular bits por byte o perplejidad sobre documentos.
- Razonamiento básico y conocimiento factual limitado, derivado del corpus educativo FineWeb-EDU.
- No soporta tool calling ni function calling (no se documenta ninguna capacidad de este tipo).
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Capacidad multilingüe limitada al inglés; no se documentan otros idiomas.
- No dispone de modo thinking, visión ni audio.
- No tiene instruction tuning ni alineación de seguridad; no está pensado para responder preguntas (para ello existe gpt-pp-chat).

## Casos de uso

- Docencia e investigación sobre arquitecturas GPT: el modelo sirve como referencia reproducible para estudiar el efecto de decisiones concretas (RMS norm sin ganancias, squared ReLU, logits limitados) en un transformer pequeño, gracias a que el código y la receta están documentados.
- Experimentación con recetas de entrenamiento de bajo coste: permite reproducir un entrenamiento de 3.000 millones de tokens en pocas horas con tres GPU, útil para validar pipelines de datos, optimizadores (Muon + AdamW) y precisión mixta antes de escalar.
- Evaluación de tokenizadores y protocolos de medida: su tokenizador BPE con patrón de GPT-4 y su protocolo de bits por byte documentado lo hacen adecuado para comparar métricas de compresión de lenguaje entre modelos pequeños.
- Generación de texto de relleno o sintético para pruebas: puede producir continuaciones de texto en inglés para poblar entornos de desarrollo, tests de pipelines de NLP o demostraciones, asumiendo que el contenido puede ser factualmente incorrecto.
- Estudio de fallos y alucinaciones: la lista de 90 incidencias conocidas y su comportamiento "fluent and wrong in places" lo convierten en un caso de estudio para analizar modos de error en modelos pequeños.
- Base para fine-tuning controlado: al ser un modelo base sin instruction tuning, es un punto de partida para experimentos de ajuste supervisado o DPO a pequeña escala en dominios concretos en inglés.
- Puntuación de texto para filtrado de corpus: su capacidad de modelado de lenguaje puede emplearse para calcular verosimilitud de documentos y filtrar datos de entrenamiento por calidad, dentro de su ventana de 1.024 tokens.

## Benchmarks y rendimiento

Resultados de bits por byte sobre texto de retención bajo el protocolo de gpt-pp (menor es mejor):

| Modelo | Parametros | FineWeb-EDU | WikiText-103 | TinyStories |
|---|---:|---:|---:|---:|
| gpt-pp base | 135M | 0,932 | 1,130 | 0,864 |
| GPT-2 small | 124M | 1,007 | 1,072 | 0,856 |
| GPT-2 medium | 355M | 0,925 | 0,975 | 0,759 |
| SmolLM2 135M | 135M | 0,857 | 0,972 | 0,692 |

Precisión en benchmarks (entre paréntesis, GPT-2 small):

| Benchmark | gpt-pp base | GPT-2 small |
|---|---:|---:|
| HellaSwag | 0,331 | 0,313 |
| ARC-Easy | 0,477 | 0,405 |
| ARC-Challenge | 0,262 | 0,222 |
| PIQA | 0,631 | 0,626 |
| SciQ | 0,718 | 0,682 |
| LAMBADA | 0,268 | 0,337 |

El autor advierte que, aunque los documentos de retención son disjuntos de los de entrenamiento, el 4,1 % de sus bloques de 64 tokens aparecen literalmente en el texto de entrenamiento (en su mayoría plantillas repetitivas), lo que puede inflar ligeramente los resultados.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,54 GB solo para los pesos (135,3M × 4 bytes), más overhead de activaciones y del runtime; en la práctica cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- En cuantización a 8 bits o 4 bits (no se distribuyen versiones oficiales) el peso se reduciría a unos 135 MB o 68 MB respectivamente, aunque el autor no publica artefactos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada moderna puede ejecutarlo. Para entrenamiento, el autor usó tres GPU (modelo no especificado) durante 3,2 horas.
- Cabe en GPU consumer sin problema; también es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers (versión 5, probado con 5.23.0) con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la naturaleza de código personalizado del modelo complica su integración en estos runtimes sin conversión adicional.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FineWeb-EDU (bpb) | WikiText-103 (bpb) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| gpt-pp base | 135M | 1.024 | 0,932 | 1,130 | no disponible | Hugging Face, requiere `trust_remote_code` |
| GPT-2 small | 124M | 1.024 | 1,007 | 1,072 | MIT (según publicación original) | Ampliamente disponible |
| GPT-2 medium | 355M | 1.024 | 0,925 | 0,975 | MIT (según publicación original) | Ampliamente disponible |
| SmolLM2 135M | 135M | no disponible en la información | 0,857 | 0,972 | no disponible en la información | Hugging Face |

gpt-pp base supera a GPT-2 small en su propia distribución (FineWeb-EDU) y empata con GPT-2 medium pese a tener menos de la mitad de parámetros, pero queda por detrás de GPT-2 small en WikiText-103 y TinyStories. SmolLM2 135M obtiene mejores resultados de bits por byte en las tres columnas, aunque se desconoce si su entrenamiento usó un volumen de tokens comparable.

## Limitaciones y advertencias

- El propio autor indica que el modelo "afirma falsedades con fluidez": riesgo alto de alucinación y de contenido factualmente incorrecto.
- Se repite bajo decodificación greedy; se recomienda muestreo con temperatura (por defecto 0,8 según la model card).
- No recibió instruction tuning ni entrenamiento de seguridad, por lo que no debe usarse como asistente ni en aplicaciones orientadas a usuario final sin salvaguardas adicionales.
- Ventana de contexto máxima de 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Entrenado únicamente en inglés; no se garantiza un comportamiento correcto en otros idiomas.
- La licencia no está disponible en la información proporcionada, lo que impide confirmar si se permite uso comercial; debe verificarse antes de cualquier despliegue productivo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar `modeling_gptpp.py` antes de usarlo en entornos sensibles.
- El corpus FineWeb-EDU está sujeto a la licencia ODC-By v1.0 y a los términos de uso de CommonCrawl, lo que puede condicionar la redistribución de derivados.
- El autor documenta 90 incidencias conocidas del código con su efecto sobre las métricas, incluida una fuga parcial de plantillas repetitivas en el conjunto de evaluación (4,1 % de bloques de 64 tokens).
- Entrenado con solo el 30 % de un subconjunto de 10.000 millones de tokens y una sola pasada, por lo que su cobertura del lenguaje es limitada en comparación con modelos entrenados con billones de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/david-rename/gpt-pp-base
- Modelo chat derivado: https://huggingface.co/david-rename/gpt-pp-chat
- Modelo gpt-pico (2,2M, cuentos infantiles): https://huggingface.co/david-rename/gpt-pico
- Repositorio gpt-pp: https://github.com/d-/gpt-pp
- Documentación de evaluación: https://github.com/d-/gpt-pp/blob/main/docs/EVAL.md
- Incidencias conocidas: https://github.com/d-/gpt-pp/blob/main/docs/KNOWN-ISSUES.md
- Dataset FineWeb-EDU: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
