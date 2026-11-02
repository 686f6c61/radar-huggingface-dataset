# cyttic/hmt-htrvt-none-s43

## Resumen

`cyttic/hmt-htrvt-none-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado por el grupo cyttic como parte de un estudio de aumento de datos denominado `htr-metrics-transfer`. Se trata de un experimento controlado: la variante `htrvt` con estrategia de aumento `none` y semilla 43, lo que lo convierte en una pieza de una matriz de ablaciones más amplia que evalúa cómo distintas técnicas de *augmentation* afectan a las métricas de transferencia entre conjuntos de escritores.

El modelo emplea una arquitectura CTC (*Connectionist Temporal Classification*) sobre pesos en formato safetensors, con un total de 13.821.574 parámetros y un tamaño de repositorio de 0,1 GB. Está especializado en hebreo (`he`) y se ha entrenado sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo a los escritores del conjunto de desarrollo, lo que permite medir la generalización a escritores no vistos.

Es relevante para investigadores que trabajen en HTR de lenguas semíticas y en metodologías de evaluación con separación por escritor. No es un modelo de propósito general ni un asistente conversacional: es un componente de investigación con métricas publicadas (CER 0,0613 y WER 0,2774 sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CTC (reconocimiento de texto manuscrito, HTR) |
| Parámetros totales | 13.821.574 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se enmarca en la familia de arquitecturas CTC para HTR, donde una red (probablemente convolucional y/o recurrente, aunque la model card no detalla la topología exacta) produce logits por fotograma que se alinean con la secuencia de caracteres objetivo mediante la función de pérdida CTC. El tag `htr` y `ctc` confirman este diseño, y la decodificación empleada en la evaluación es greedy, sin modelo de lenguaje externo que corrija o reordene las hipótesis.

El entrenamiento se realizó sobre el split de entrenamiento del conjunto `cyttic/hhd-optionb-split`, del cual se excluyeron los escritores del conjunto de desarrollo. Esta separación por escritor es metodológicamente importante: evita que el modelo memorice estilos de caligrafía de los mismos individuos vistos en entrenamiento y proporciona una estimación más honesta de la generalización. La variante corresponde a `augmentation: none`, es decir, sin aumento de datos, con semilla 43. No se especifican en la información disponible el número de tokens, la composición detallada del dataset ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a nivel de línea o imagen, con salida de secuencia de caracteres mediante decodificación CTC.
- Decodificación greedy sin modelo de lenguaje, lo que simplifica el despliegue pero limita la corrección de errores léxicos.
- Evaluación con separación por escritor, adecuada para medir generalización a caligrafías no vistas.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades.
- Capacidad multilingüe limitada al hebreo; no se declaran otros idiomas.

## Casos de uso

- Investigación en HTR de hebreo: sirve como línea base sin aumento de datos para comparar contra variantes con *augmentation* dentro del mismo estudio `htr-metrics-transfer`, aislando el efecto de la semilla y de la estrategia de aumento.
- Digitalización de archivos manuscritos en hebreo: puede transcribir líneas de documentos históricos o administrativos, siempre que el dominio visual se parezca al del corpus `hhd-optionb-split`.
- Evaluación de metodologías de separación por escritor: al haberse entrenado excluyendo a los escritores de desarrollo, es útil para reproducir protocolos de validación *writer-independent*.
- Análisis de transferencia de métricas: sus resultados CER/WER permiten estudiar cómo se propagan los errores de reconocimiento a métricas posteriores de recuperación o indexación.
- Componente en pipelines de OCR/HTR combinados: puede integrarse como etapa de reconocimiento y combinarse con un modelo de lenguaje hebreo externo para reducir el WER en producción.
- Reproducibilidad de experimentos: la semilla fija (43) y la configuración `none` facilitan replicar exactamente el entrenamiento y comparar contra otras semillas del mismo estudio.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,0613 |
| HHD Option-B test (greedy, sin LM) | WER | 0,2774 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) al no tratarse de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de 13,8 M de parámetros (aproximadamente 55 MB en fp32 y 28 MB en fp16).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo, pero válidas.
- Cabe holgadamente en GPU de consumo, incluida una GTX 1650 o incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser safetensors con arquitectura CTC personalizada, requiere cargar los pesos con el código del autor o con una implementación compatible; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-none-s43 | 13,8 M | no disponible | hebreo | MIT | Variante sin aumento, semilla 43 |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | hebreo | MIT (presumible) | Mismo pipeline con otras estrategias de aumento y semillas |
| Modelos HTR genéricos (p. ej. TrOCR, Kraken) | variable | no aplica | multilingüe | variable | No comparables directamente por dominio e idioma |

No se dispone de datos de benchmarks de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado como producto final ni como servicio listo para producción.
- Especializado exclusivamente en hebreo; no generaliza a otros alfabetos o idiomas sin reentrenamiento.
- Decodificación greedy sin modelo de lenguaje: el WER de 0,2774 es elevado en términos absolutos y refleja errores léxicos que un LM podría mitigar.
- Riesgo de degradación fuera del dominio: el rendimiento depende de que las imágenes se parezcan al corpus `hhd-optionb-split`; caligrafías, soportes o resoluciones distintas pueden empeorar las métricas.
- Sesgos potenciales derivados de los escritores y documentos del corpus de entrenamiento; no se documenta un análisis de sesgo.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin datos publicados sobre cuantización, contexto máximo o latencia, lo que dificulta planificar un despliegue a escala.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-htrvt-none-s43
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo (referenciado en la model card)
- No se han encontrado en la información disponible papers, blogs, repositorios de código ni demos adicionales.
