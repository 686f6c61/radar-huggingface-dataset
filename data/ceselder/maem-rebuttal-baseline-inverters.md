# ceselder/maem-rebuttal-baseline-inverters

## Resumen

`ceselder/maem-rebuttal-baseline-inverters` es un repositorio de artefactos de investigación en interpretabilidad que contiene reimplementaciones de dos inversores de activaciones previos (InversionView de Huang et al. 2024 e InverseScope de Luo et al. 2025), reentrenados sobre los mismos pares dirección-texto que el modelo MAEM (arXiv 2611.08465) para servir como líneas base de comparación en la réplica de dicho trabajo. No es un modelo de lenguaje de propósito general: cada artefacto mapea una dirección unitaria del flujo residual de la capa 42 de Qwen3.6-27B (dimensión d = 5120) a texto descriptivo.

La relevancia es acotada al ámbito de la interpretabilidad mecanicista: el repositorio permite reproducir la comparación entre inversores de activaciones bajo un protocolo de datos y cómputo equiparables, midiendo hasta qué punto las arquitecturas previas recuperan información del estado interno de un transformer grande. Los resultados publicados en la model card muestran diferencias sustanciales frente a MAEM, lo que convierte al repositorio en material de referencia para evaluar afirmaciones de superioridad en este subcampo.

El repositorio incluye cuatro carpetas con pesos en formato safetensors (InversionView de 2 capas con 332M parámetros, InversionView sobre GPT-2 Medium con 796M, InverseScope con 316M entrenables y el backbone de InverseScope), además de una variante `compute_matched_1e20` anunciada pero no disponible en el momento de la consulta. El tamaño total del repo es de 6,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder para inversión de activaciones: InversionView (2 capas desde cero o GPT-2 Medium completo) e InverseScope (GPT-2 small congelado más capas de control tanh) |
| Parametros totales | 332M (InversionView 2-layer), 796M (InversionView GPT-2 Medium), 316M entrenables (InverseScope, sobre backbone GPT-2 small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; las entradas son direcciones de 5120 dimensiones y las salidas se generan con `--max-new-tokens` configurable (64 en el ejemplo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el texto generado es en inglés, derivado de los textos objetivo de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los tres artefactos principales son decodificadores de texto condicionados por una dirección de activación. InversionView se implementa en dos variantes: una red de 2 capas entrenada desde cero (332M parámetros, mayoritariamente en el stack de condicionamiento) y un GPT-2 Medium preentrenado con todos los pesos ajustados (796M). InverseScope emplea un GPT-2 small congelado con capas de control tanh (316M parámetros entrenables) y requiere un backbone previo (`inversescope_backbone`) obtenido mediante LoRA sobre los textos objetivo y posteriormente fusionado.

El entrenamiento usa únicamente pérdida de siguiente token, sin RL, tal como en los papers originales. El conjunto de datos es una pasada sobre los 8M de pares supervisados del MAEM: 4M de activaciones reales con 8-64 tokens de contexto, 2M de direcciones de encoder SAE y 2M de direcciones de decoder SAE con sus ventanas de máxima activación. Las tasas de aprendizaje se ajustaron por modelo (3e-3 para el de 2 capas, 1e-4 para GPT-2 Medium, 3e-4 para InverseScope; la tasa publicada de 1e-5 resultó peor). Las activaciones reales se centran con la media del corpus de la capa 42 antes de normalizarse, siguiendo la convención del MAEM. Existe una variante `compute_matched_1e20` planificada para igualar 1e20 FLOPs incluyendo la generación de datos, pero no está disponible.

## Capacidades

- Inversión de activaciones: dado un vector unitario de 5120 dimensiones del flujo residual de la capa 42 de Qwen3.6-27B, genera texto que describe la característica asociada.
- Generación de texto condicionada por vector, con parada en `<|endoftext|>` y tokenización GPT-2.
- Evaluación de fidelidad de inversión mediante recóndito de la activación (coseno de activación retenida y de contexto largo).
- Medición de activación de features SAE a partir del texto generado.
- Detección de payloads de backdoor en direcciones rank-one (16 backdoors reentrenados por los autores).
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking.
- No es un modelo conversacional ni de propósito general.

## Casos de uso

- Reproducción de líneas base en interpretabilidad: ejecutar `code/generate.py` con cada checkpoint sobre un conjunto de direcciones para replicar las métricas de la tabla de resultados y verificar las conclusiones del paper MAEM.
- Auditoría de afirmaciones de superioridad: comparar InversionView e InverseScope con MAEM bajo el mismo protocolo de datos (8M pares) y mismas métricas de coseno de activación, permitiendo aislar el efecto de la arquitectura frente al del volumen de datos.
- Estudio de detección de backdoors en representaciones internas: usar la columna de payload nombrado (0,1%-0,4% en las líneas base frente a 38%-93% en MAEM) para analizar la sensibilidad de distintos inversores a características maliciosas inyectadas.
- Investigación sobre features SAE: emplear las direcciones de encoder y decoder SAE incluidas en el dataset para medir qué porcentaje de features se activan al releer el texto generado (7%-14% en las líneas base).
- Análisis de degradación con contexto largo: usar la métrica de coseno de contexto largo (0,18-0,20 en las líneas base) para estudiar cómo pierden fidelidad los inversores cuando la ventana de activación es extensa.
- Docencia y formación en interpretabilidad mecanicista: el repositorio ofrece implementaciones funcionales y scripts de evaluación que sirven como material práctico para cursos sobre inversión de activaciones.
- Comparación de estrategias de ajuste: contrastar el ajuste completo de GPT-2 Medium frente al uso de capas de control sobre un backbone congelado (InverseScope) en términos de parámetros entrenables y fidelidad resultante.

## Benchmarks y rendimiento

Resultados publicados en la model card (512 objetivos retenidos por métrica, mejor de 4 muestras, puntuados releyendo el texto con el modelo sin modificar):

| Modelo | Coseno activación retenida | Coseno contexto largo | Features SAE activadas | Payload de backdoor nombrado |
|---|---|---|---|---|
| InversionView 2-layer | 0,24 | 0,18 | 14% | 0,3% |
| InverseScope | 0,27 | 0,19 | 7% | 0,4% |
| InversionView GPT-2 Medium | 0,31 | 0,20 | 14% | 0,1% |
| MAEM, solo SFT | 0,53 | 0,41 | 52% | 38% |
| MAEM, SFT + RL | 0,78 | 0,72 | 74% | 93% |

Con la activación incorrecta, las tres líneas base obtienen 0,14 en la primera columna. Los ficheros de evaluación en bruto están en `evals/`. La columna de backdoor corresponde a 16 backdoors rank-one reentrenados por los autores con los triggers y payloads del paper.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Por tamaño de parámetros, InversionView 2-layer (332M) y InverseScope (316M entrenables más backbone GPT-2 small) caben en GPUs de consumo con menos de 8 GB en fp16; InversionView GPT-2 Medium (796M) requiere aproximadamente 2 GB en fp16 para pesos, más overhead de activaciones y del modelo objetivo Qwen3.6-27B si se generan activaciones en el mismo equipo.
- GPU recomendadas: cualquier GPU con soporte CUDA suficiente para GPT-2 small/Medium; para generar las activaciones del modelo objetivo (Qwen3.6-27B, capa 42) se necesita hardware capaz de ejecutar dicho modelo, típicamente A100, H100 o GPUs de 24 GB o más con cuantización.
- Cabe en GPU de consumo: sí para los inversores; el cuello de botella es el modelo objetivo.
- Opciones de despliegue: scripts propios en PyTorch y Transformers (`code/generate.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Coseno retenido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InversionView 2-layer (este repo) | 332M | no disponible | 0,24 | Apache 2.0 | Hugging Face |
| InverseScope (este repo) | 316M entrenables | no disponible | 0,27 | Apache 2.0 | Hugging Face |
| InversionView GPT-2 Medium (este repo) | 796M | no disponible | 0,31 | Apache 2.0 | Hugging Face |
| MAEM (referencia del paper) | no disponible | no disponible | 0,53 (SFT) / 0,78 (SFT+RL) | no disponible | no disponible |

La comparación relevante es interna al paper MAEM; no se dispone de datos de otros inversores de activaciones comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable para generación, razonamiento, código o diálogo; su única función es invertir direcciones de activación de Qwen3.6-27B capa 42.
- Fidelidad baja: el mejor coseno de activación retenida es 0,31 y el de contexto largo 0,20, lo que indica que las líneas base recuperan solo una fracción de la información representada.
- Sesgo hacia el protocolo del MAEM: los modelos se entrenaron con los pares dirección-texto del paper, por lo que los resultados no son directamente extrapolables a otros corpus o modelos objetivo.
- Dependencia de la convención de centrado con la media del corpus de la capa 42; aplicar otra normalización invalida las comparaciones.
- La variante `compute_matched_1e20` no está disponible, por lo que la comparación con igualdad de cómputo queda pendiente.
- Riesgo de alucinación: al ser decodificadores de texto, pueden generar descripciones plausibles pero incorrectas de la dirección; las métricas publicadas cuantifican precisamente esta debilidad.
- Idiomas: no se documenta soporte multilingüe; el texto generado es en inglés.
- Licencia Apache 2.0 permite uso comercial, pero el valor práctico del artefacto es de investigación.
- Los resultados de backdoor (0,1%-0,4%) indican que estas líneas base apenas detectan características maliciosas, lo que desaconseja su uso en auditorías de seguridad sin validación adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ceselder/maem-rebuttal-baseline-inverters
- Paper MAEM: arXiv 2611.08465 (referenciado en la model card)
- Paper InversionView (Huang et al. 2024): arXiv 2405.17653
- Paper InverseScope (Luo et al. 2025): arXiv 2506.07406
