# ArrowLabs/AresXXS1-1M

## Resumen

AresXXS1-1M es un modelo de lenguaje experimental de escala extrema desarrollado por ArrowLabs. Con apenas 1.017.728 parámetros totales, se posiciona como un ejercicio de investigación sobre los límites inferiores del entrenamiento de transformers: el autor afirma que, pese a su tamaño mínimo, alcanza resultados comparables a modelos de 10 millones de parámetros o superiores en varios benchmarks de razonamiento y conocimiento. El modelo emplea una arquitectura Llama estándar con un vocabulario reducido, lo que reduce el coste computacional tanto en entrenamiento como en inferencia.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y código personalizado (`custom_code`), y está orientado exclusivamente al idioma inglés. El repositorio ocupa 0,0 GB, lo que confirma su naturaleza ultraligera. Fue publicado el 14 de noviembre de 2026 y, en el momento de la consulta, registra 0 descargas y 1 like, lo que refleja su carácter de experimento reciente y de nicho.

Su relevancia actual reside en el interés creciente por modelos diminutos que puedan ejecutarse en dispositivos con recursos muy limitados (microcontroladores, navegadores, sistemas embebidos) y en el estudio de la eficiencia de tokens por parámetro. No obstante, conviene subrayar que se trata de un modelo de investigación, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) con vocabulario reducido |
| Parametros totales | 1.017.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

AresXXS1-1M sigue una arquitectura Llama convencional (transformer decoder-only con atención causal), pero con un vocabulario deliberadamente pequeño, según indica el autor en la model card. Esta decisión reduce el número de parámetros asociados a las matrices de embedding y de proyección de salida, que en modelos pequeños suelen representar una fracción significativa del total. No se especifican en la información disponible el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto entrenada.

El entrenamiento emplea una mezcla de datasets públicos y propios: `RandomGuy/Balls`, `HuggingFaceFW/fineweb-edu`, `ArrowLabs/DCLM-Ultra-1.1`, `ArrowLabs/DCLM-Ultra` y `HuggingFaceTB/finemath`. No se detalla el número total de tokens vistos, la composición porcentual de cada fuente, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.); la propuesta de valor es exclusivamente la escala mínima.

## Capacidades

- Generación de texto básica en inglés, limitada por el reducido tamaño del modelo y su vocabulario pequeño.
- Razonamiento de sentido común elemental, con resultados moderados en PIQA y HellaSwag.
- Resolución de preguntas de conocimiento general a nivel muy superficial (ARC easy y ARC challenge).
- Aritmética simple, con un rendimiento destacable para su tamaño en Arithmark 3.0 (42,20).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés; no se reporta soporte de otros idiomas.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Experimentación educativa: el modelo sirve para estudiar el comportamiento de transformers a escala mínima, analizando curvas de aprendizaje y eficiencia de parámetros en entornos docentes o de investigación.
- Pruebas de infraestructura de inferencia: por su tamaño (1M de parámetros), es útil para validar pipelines de despliegue, tokenizadores y motores de inferencia antes de escalar a modelos mayores.
- Inferencia en dispositivos embebidos: cabe en microcontroladores y sistemas con memoria muy restringida, permitiendo prototipos de generación de texto local sin conectividad.
- Generación de texto de relleno o plantillas: puede producir continuaciones cortas en inglés para pruebas de interfaz o datos sintéticos de baja fidelidad.
- Benchmarking comparativo de modelos pequeños: sirve como referencia inferior en estudios que comparan modelos de 1M, 3M, 10M y 100M de parámetros.
- Investigación sobre tokenización y vocabulario: al usar un vocabulario reducido, permite analizar el impacto del tamaño del vocabulario en el rendimiento y en el coste computacional.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Benchmark | AresXXS1-1M | Nanowhale-100M | Ethoric-10M | TBB-3M-v2 |
|---|---|---|---|---|
| PIQA | 59,14 | 51,80 | 59,85 | 56,75 |
| HellaSwag | 25,80 | 26,31 | 28,75 | 27,29 |
| ARC easy | 35,98 | 28,79 | 37,58 | 33,38 |
| ARC challenge | 40,77 | 20,65 | 24,66 | 22,53 |
| Arithmark 3.0 | 42,20 | 26,60 | 41,60 | 45,10 |
| Int Index | 14,27 | 2,51 | 12,94 | 10,39 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en precisión completa (fp32), dado el tamaño de 1.017.728 parámetros; en la práctica, cabe en cualquier dispositivo con unos pocos megabytes de memoria libre.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin dificultad. Cualquier GPU consumer (incluso integradas) es suficiente.
- Cabe en GPU consumer: sí, en todas; también en microcontroladores y navegadores.
- Opciones de despliegue: al usar `custom_code`, requiere cargar el código personalizado del repositorio; es compatible con `transformers` y potencialmente con motores que soporten safetensors. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera latencia muy baja en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AresXXS1-1M | 1.017.728 | no disponible | Apache 2.0 | Hugging Face |
| Ethoric-10M | ~10M | no disponible | no disponible | no disponible |
| TBB-3M-v2 | ~3M | no disponible | no disponible | no disponible |
| Nanowhale-100M | ~100M | no disponible | no disponible | no disponible |

En rendimiento, AresXXS1-1M supera a Nanowhale-100M en PIQA, ARC easy, ARC challenge, Arithmark 3.0 e Int Index, pese a tener dos órdenes de magnitud menos parámetros. Frente a Ethoric-10M queda ligeramente por debajo en PIQA, HellaSwag, ARC easy y Arithmark 3.0, pero lo supera en ARC challenge e Int Index. Frente a TBB-3M-v2, gana en PIQA, ARC easy, ARC challenge e Int Index, y pierde en HellaSwag y Arithmark 3.0. No se dispone de información sobre contexto, licencia ni disponibilidad de los modelos comparados.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con fineweb-edu, DCLM y finemath, puede heredar sesgos de esos corpus; no se documenta ningún proceso de mitigación.
- Riesgo de alucinación: muy elevado, dado el tamaño mínimo del modelo y su limitada capacidad de almacenar conocimiento factual.
- Limitaciones de contexto e idioma: solo inglés; la longitud de contexto no está documentada y el vocabulario reducido puede degradar la cobertura léxica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está diseñado para producción y su rendimiento es insuficiente para tareas reales.
- Caveats para producción: requiere `custom_code` para cargarse, lo que añade complejidad y riesgo de seguridad; no hay garantías de mantenimiento ni soporte; el rendimiento en benchmarks es bajo en términos absolutos (HellaSwag 25,80; ARC easy 35,98).
- Advertencia general: es un experimento de investigación, no un modelo apto para aplicaciones con requisitos de calidad, seguridad o fiabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/ArrowLabs/AresXXS1-1M
- Dataset RandomGuy/Balls: https://huggingface.co/datasets/RandomGuy/Balls
- Dataset HuggingFaceFW/fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset ArrowLabs/DCLM-Ultra-1.1: https://huggingface.co/datasets/ArrowLabs/DCLM-Ultra-1.1
- Dataset ArrowLabs/DCLM-Ultra: https://huggingface.co/datasets/ArrowLabs/DCLM-Ultra
- Dataset HuggingFaceTB/finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
