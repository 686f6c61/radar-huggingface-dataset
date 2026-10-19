# polydim-cla/llama-3.2-3b-pmtp

## Resumen

`polydim-cla/llama-3.2-3b-pmtp` es un artefacto de investigación publicado por Ariel García Traba bajo la iniciativa POLYDIM-EINSOF, construido sobre el modelo base `meta-llama/Llama-3.2-3B` de Meta. No se presenta como un modelo entrenado de forma convencional, sino como un adaptador geométrico denominado PMTP (Stiefel Manifold Adapter) que inyecta una proyección sobre la variedad de Stiefel St(3072, 1024) en la capa 14 del transformer, reduciendo la dimensión interna de 3072 a 1024 dimensiones "canónicas". El autor lo describe como un mecanismo de "pensamiento continuo" (continuous-thought) con comunicación entre procesos mediante un bus compartido propietario (`PmtpShmBus`), sin serialización de tokens de texto.

El repositorio ocupa 0,1 GB, un tamaño compatible con pesos delta o un adaptador más que con los pesos completos en fp16 de un modelo de 3B parámetros (que rondarían los 6,4 GB), aunque la model card no aclara la naturaleza exacta de los ficheros publicados. La ficha técnica es extremadamente escasa: no hay datos de entrenamiento, número de tokens, composición del dataset, ni resultados de evaluación.

Su relevancia actual es limitada y de carácter exploratorio. Se trata de un experimento sin descargas ni validación externa en el momento de la consulta, con terminología no estándar en la literatura (defecto de Frobenius, "telepatía de tensores", IPC de gusano cero) y sin benchmarks publicados. Debe evaluarse como una prueba de concepto de investigación, no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B) con adaptador PMTP inyectado en la capa 14; proyección sobre la variedad de Stiefel St(3072, 1024) |
| Parametros totales | 3,21 B en el modelo base (heredado de `meta-llama/Llama-3.2-3B`); número de parámetros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base (heredado); comportamiento tras la inyección del adaptador no disponible |
| Tipos de cuantizacion | Pesos publicados en safetensors (precisión exacta no disponible); cuantización del adaptador no documentada; conversión a GGUF no verificada |
| Idiomas soportados | No disponible (el modelo base soporta 8 idiomas oficiales: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés); el efecto del adaptador sobre el multilingüismo no está documentado |
| Licencia | Apache 2.0 declarada en el repositorio (ver advertencias: el modelo base está bajo Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.2 3B: transformer decoder-only de 28 capas, dimensión oculta 3072, 24 cabezas de atención con GQA (8 cabezas KV), FFN SwiGLU con dimensión intermedia 8192, normalización RMSNorm y RoPE, con un vocabulario de 128 256 tokens. Sobre esa base, el autor inyecta en la capa 14 una transformación que proyecta el estado oculto de 3072 dimensiones a un subespacio canónico de 1024 dimensiones sobre la variedad de Stiefel, caracterizada por matrices de columnas ortonormales. El repositorio reporta un "defecto de Frobenius de Stiefel" de 4,525e+01 medido con un acumulador Neumaier en FP64, métrica que cuantifica la desviación de la matriz aprendida respecto a la ortogonalidad exacta.

La model card menciona además un mecanismo de comunicación entre procesos (`PmtpShmBus`) con "cero tokens de texto serializados", lo que sugiere un canal de intercambio de tensores en memoria compartida en lugar de texto. No se especifica si el adaptador se ha entrenado con descenso de gradiente, con qué objetivo, sobre qué corpus, ni cuántos tokens. Tampoco se documenta si hubo ajuste por instrucciones, RLHF o DPO. La información disponible no permite verificar ninguna innovación técnica más allá de la descripción geométrica del adaptador.

## Capacidades

- Generación de texto autoregresiva heredada de Llama 3.2 3B (no verificada tras la inyección del adaptador).
- Razonamiento de un solo turno y tareas de conocimiento general a escala 3B.
- Capacidad potencial de "pensamiento continuo": el autor describe el adaptador como un espacio latente de razonamiento, aunque no aporta evaluaciones que lo respalden.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el bus IPC propietario no está documentado públicamente.
- Capacidades multilingües: heredadas del modelo base, sin evaluación específica del adaptador.
- Visión, audio o modalidades adicionales: no soportadas (modelo puramente textual).
- Modo thinking explícito: no disponible como funcionalidad documentada.

## Casos de uso

- Investigación sobre geometría del espacio latente: el adaptador permite experimentar con proyecciones sobre la variedad de Stiefel en una capa intermedia y medir el efecto sobre la ortogonalidad de las representaciones y la perplejidad, usando la métrica de defecto de Frobenius como indicador.
- Reproducción de experimentos de "continuous thought": útil para grupos que investiguen razonamiento en espacio latente frente a razonamiento basado en tokens, comparando la capa 14 modificada con la original.
- Estudio de compresión dimensional interna: la proyección 3072 → 1024 permite analizar si se puede reducir la anchura efectiva del modelo sin colapso de rendimiento, midiendo degradación en tareas de clasificación o generación.
- Base para fine-tuning académico: al derivar de Llama 3.2 3B, puede ajustarse con LoRA en una única GPU consumer para tareas de investigación en PNL, siempre que se respete la licencia del modelo base.
- Prototipado de buses de comunicación entre procesos para inferencia distribuida: el componente `PmtpShmBus` puede estudiarse como alternativa a la serialización de texto en arquitecturas multiagente, aunque carece de documentación y pruebas.
- Docencia y divulgación: ejemplo práctico de cómo se inyecta una restricción geométrica en un transformer y de cómo se mide su cumplimiento numéricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, ARC, Hellaswag ni ninguna otra métrica de evaluación, ni comparaciones con el modelo base sin adaptador. Tampoco se reportan curvas de pérdida, perplejidad ni estudios de ablación sobre la capa 14.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6,4 GB solo para pesos del modelo base de 3,21 B parámetros, más caché KV. Con 128 000 tokens de contexto la caché KV puede crecer varios GB adicionales; con contextos de 4 000-8 000 tokens el consumo total se sitúa en torno a 7-9 GB.
- VRAM estimada en cuantización de 4 bits (si se generan pesos GGUF del modelo fusionado): en torno a 2-2,5 GB para pesos, más caché KV; el adaptador en sí, si es un delta, añadiría un consumo marginal.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), L4 (24 GB) o A10G (24 GB) para fp16 con contexto moderado; A100 40/80 GB o H100 para contextos largos o serving concurrente.
- Cabe en GPU consumer: sí, en tarjetas con 8-12 GB o más para fp16 con contexto corto, y en tarjetas de 6-8 GB si se cuantiza a 4 bits. Una RTX 3060 de 12 GB es suficiente para inferencia básica.
- Opciones de despliegue: `transformers` con safetensors (requiere cargar el adaptador PMTP, cuyo procedimiento de carga no está documentado); vLLM y TGI solo si se fusionan los pesos y se dispone de una implementación compatible con la capa modificada; llama.cpp/Ollama únicamente si se genera un GGUF del modelo fusionado. La etiqueta Ollama `llama3.2:3b` que cita la model card corresponde al modelo base de Meta, no a este adaptador.
- Latencia y throughput: no disponibles. Como referencia del modelo base 3B en una RTX 4090 con vLLM, cabría esperar decenas de tokens por segundo por petición y cientos agregados en batching, pero no hay mediciones publicadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `polydim-cla/llama-3.2-3b-pmtp` | 3,21 B (base) + adaptador | 128 k (heredado del base) | Sin benchmarks | Apache 2.0 declarada | HuggingFace, 0 descargas |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21 B | 128 k | Evaluaciones publicadas por Meta en su model card | Llama 3.2 Community License | HuggingFace, ampliamente usado |
| `Qwen/Qwen2.5-3B-Instruct` | 3,09 B | 32 k nativo (128 k con YaRN) | Evaluaciones publicadas por Qwen (MMLU, HumanEval, GSM8K) | Apache 2.0 | HuggingFace, muy extendido |
| `google/gemma-2-2b-it` | 2,61 B | 8 k | Evaluaciones publicadas por Google | Gemma Terms of Use | HuggingFace, requiere aceptación |
| `microsoft/Phi-3.5-mini-instruct` | 3,82 B | 128 k | Evaluaciones publicadas por Microsoft | MIT | HuggingFace |

El artefacto PMTP es el único de la tabla sin métricas de evaluación y sin tracción comunitaria. Para uso práctico en la misma franja de tamaño, las alternativas consolidadas ofrecen garantías de licencia, tooling de despliegue y resultados reproducibles.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ablaciones ni comparación con el modelo base, por lo que se desconoce si el adaptador preserva, mejora o degrada las capacidades originales.
- Terminología no estándar y no verificable: expresiones como "telepatía de tensores", "IPC de gusano cero" o "pensamiento continuo" no se corresponden con conceptos establecidos en la literatura revisada por pares y no van acompañadas de especificación técnica.
- Repositorio de 0,1 GB: es altamente probable que no contenga los pesos completos del modelo, sino un delta o adaptador. El procedimiento de carga y fusión no está documentado, lo que impide su uso directo.
- Conflicto de licencias: el repositorio declara Apache 2.0, pero al derivar de `meta-llama/Llama-3.2-3B` sigue sujeto a la Llama 3.2 Community License, que impone restricciones de uso (incluida la cláusula de 700 millones de usuarios mensuales y las políticas de uso aceptable). La declaración Apache 2.0 por sí sola no es suficiente para uso comercial.
- Riesgo de alucinación: el modelo base de 3B presenta tasas de alucinación apreciables en tareas de conocimiento factual; no hay evidencia de que el adaptador lo mitigue.
- Idiomas: no se documenta el comportamiento multilingüe tras la inyección; el adaptador podría degradar idiomas distintos del inglés al alterar el subespacio de la capa 14.
- Sin pipeline declarado ni ejemplos de uso: no hay código de inferencia, tokenizador modificado ni instrucciones de reproducción.
- Cero descargas y cero valoraciones: no existe validación independiente de la comunidad.
- Fecha de creación futura en los metadatos (2026-10-18): conviene verificar la procedencia y autenticidad del repositorio antes de integrarlo en cualquier flujo.
- No apto para producción sin una evaluación propia exhaustiva, incluida la verificación de que los pesos publicados se cargan y funcionan.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/polydim-cla/llama-3.2-3b-pmtp
- Repositorio GitHub del proyecto: https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Modelo base ajustado por instrucciones: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Página de Ollama para Llama 3.2: https://ollama.com/library/llama3.2
- Paper, blog o demo del adaptador PMTP: no disponibles en la información proporcionada.
