# cyttic/hmt-htrvt-photo3-s43

## Resumen

El modelo `cyttic/hmt-htrvt-photo3-s43` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado con una arquitectura de tipo transformer y decodificación CTC. Lo desarrolla el grupo cyttic y forma parte de un estudio de aumentación de datos denominado `htr-metrics-transfer`, en el que se comparan distintas variantes de aumento de imagen (`photo3` en este caso) sobre la arquitectura `htrvt` con la semilla 43.

El modelo resuelve la transcripción automática de imágenes de texto manuscrito en hebreo (`he`), un idioma con relativamente pocos recursos en el ámbito del HTR. Con 13,8 millones de parámetros, es un modelo compacto orientado a inferencia eficiente, no a razonamiento general ni a generación de texto libre.

Su relevancia es acotada y experimental: se publica como artefacto reproducible de un estudio de aumentación, con métricas concretas sobre el conjunto de test HHD Option-B (CER 0,0636 y WER 0,2859 en decodificación greedy sin modelo de lenguaje). No es un modelo de propósito general, sino un componente especializado para pipelines de digitalización documental en hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con decodificacion CTC (no disponible el detalle de capas y dimensiones) |
| Parametros totales | 13.821.574 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer con cabecera CTC para reconocimiento de secuencias de caracteres a partir de imágenes de línea de texto manuscrito. El nombre `htrvt` sugiere una variante de vision transformer adaptada a HTR, aunque la model card no detalla el número de capas, la dimensión oculta ni el mecanismo de atención. El modelo tiene 13.821.574 parámetros y un tamaño de repositorio de 0,1 GB.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de dev, y se evaluó sobre el test HHD Option-B. La variante corresponde a la aumentación `photo3` con semilla 43, dentro de un estudio de transferencia de métricas HTR. La decodificación empleada en la evaluación es greedy, sin modelo de lenguaje, lo que explica un WER de 0,2859 frente a un CER de 0,0636. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO (no aplicables en un modelo CTC de reconocimiento).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes, con salida de secuencia de caracteres mediante CTC.
- Transcripción de líneas de texto manuscrito, orientada a digitalización documental.
- Evaluación con métricas CER y WER sobre el conjunto HHD Option-B.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües más allá del hebreo.
- No incluye modo thinking, visión general, audio ni generación de texto libre.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe líneas de texto manuscrito y permite convertir colecciones documentales en texto indexable, con un CER de 0,0636 sobre el test de referencia.
- Reconocimiento de formularios y registros históricos: al estar entrenado sobre el corpus HHD, es adecuado para documentos con características similares a los escritores de entrenamiento.
- Pipeline de OCR/HTR para bibliotecas digitales: puede integrarse como etapa de transcripción tras la segmentación de líneas, con decodificación greedy sin modelo de lenguaje para minimizar latencia.
- Investigación en aumentación de datos: sirve como punto de comparación reproducible (semilla 43, aumentación `photo3`) frente a otras variantes del estudio `htr-metrics-transfer`.
- Evaluación de transferencia de métricas: útil para estudiar cómo afectan distintas aumentaciones al CER y al WER en hebreo manuscrito.
- Prototipado de bajo coste: con 13,8 millones de parámetros y 0,1 GB de pesos, se puede desplegar en hardware modesto para pruebas de transcripción en hebreo.

## Benchmarks y rendimiento

| Conjunto | Decodificacion | Modelo de lenguaje | CER | WER |
|---|---|---|---|---|
| HHD Option-B test | Greedy | No | 0,0636 | 0,2859 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de 13,8 millones de parámetros y pesos de 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es suficiente; también cabe en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en prácticamente cualquier modelo con al menos 2 GB de VRAM.
- Opciones de despliegue: carga directa con `transformers` y safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de HTR en hebreo con los que establecer una comparación de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en hebreo manuscrito; no debe usarse para otros idiomas ni para texto impreso sin validación previa.
- El WER de 0,2859 sin modelo de lenguaje indica una tasa de error por palabra elevada; en producción conviene acoplar un modelo de lenguaje o un postprocesado.
- El CER y el WER se han medido sobre el test HHD Option-B, por lo que el rendimiento en dominios, escritores o estilos caligráficos distintos puede degradarse.
- Riesgo de alucinación y de sustituciones de caracteres en pasajes ambiguos, inherente a la decodificación CTC greedy.
- No se documentan sesgos específicos ni análisis de equidad entre escritores.
- La licencia MIT permite uso comercial, pero el modelo se publica como artefacto de investigación sin garantías de robustez en producción.
- No se dispone de información sobre el contexto máximo de entrada ni sobre el preprocesado exacto de las imágenes.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-photo3-s43
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo (según la model card)
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada.
