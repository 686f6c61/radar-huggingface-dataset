# cyttic/hmt-trocrctc-geom3-s43

## Resumen

`cyttic/hmt-trocrctc-geom3-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el usuario cyttic en Hugging Face. Se trata de una variante del modelo `trocrctc` entrenada como parte de un estudio de aumentación de datos denominado `htr-metrics-transfer`, con la configuración de aumentación `geom3` y la semilla 43. El modelo está especializado en hebreo (`he`) y emplea una arquitectura basada en TrOCR con cabecera CTC, según indican sus etiquetas.

El modelo resuelve la transcripción automática de imágenes de texto manuscrito a texto digital en hebreo. Con 87.279.756 parámetros y un peso de repositorio de 0,3 GB, es un modelo compacto orientado a investigación más que a despliegue comercial a gran escala. Su relevancia radica en que forma parte de una serie de experimentos controlados que comparan distintas estrategias de aumentación geométrica sobre un mismo pipeline de entrenamiento, lo que permite aislar el efecto de la aumentación en las métricas finales.

La información publicada es deliberadamente escueta: la model card remite a un `results.json` para los detalles completos y no incluye documentación sobre arquitectura interna, datos de entrenamiento o benchmarks comparativos más allá de las métricas CER y WER reportadas sobre el conjunto de test HHD Option-B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (según etiquetas `trocrctc`; detalles internos no disponibles) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta como `trocrctc`, lo que sugiere una arquitectura TrOCR (Transformer encoder-decoder para reconocimiento óptico de caracteres) con una cabecera de decodificación CTC en lugar de la decodificación autoregresiva habitual. No se dispone de información publicada sobre el número de capas, dimensión oculta, número de cabezas de atención ni sobre el tamaño del vocabulario o del tokenizador.

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para el conjunto de desarrollo. La variante corresponde a la aumentación `geom3` con semilla 43, dentro de un estudio de transferencia de métricas HTR. La evaluación se realizó sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje, obteniendo CER 0,0740 y WER 0,3294. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a partir de imágenes.
- Transcripción a nivel de carácter y de palabra, con métricas CER y WER reportadas.
- Decodificación CTC greedy, apta para inferencia rápida sin modelo de lenguaje externo.
- Entrenado específicamente sobre un conjunto de escritores concretos, lo que condiciona su generalización.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir páginas escaneadas de documentos históricos o administrativos, siempre que el estilo de escritura se aproxime al del corpus de entrenamiento.
- Investigación en aumentación de datos para HTR: sirve como punto de comparación reproducible (semilla 43, aumentación `geom3`) frente a otras variantes de la misma serie.
- Evaluación de pipelines CTC sin modelo de lenguaje: útil para medir el rendimiento base de la arquitectura antes de añadir corrección léxica.
- Prototipado de sistemas de transcripción en entornos con recursos limitados: sus 87,3 M de parámetros y 0,3 GB de pesos permiten desplegarlo en hardware modesto para pruebas.
- Generación de datasets etiquetados: puede emplearse para pre-anotar imágenes manuscritas que luego se revisan manualmente.
- Benchmarking de modelos HTR en hebreo: las métricas CER/WER publicadas permiten comparar contra otros modelos de la misma familia o de familias distintas sobre el mismo test HHD Option-B.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto | Configuracion |
|---|---|---|---|
| CER | 0,0740 | HHD Option-B test | Greedy, sin LM |
| WER | 0,3294 | HHD Option-B test | Greedy, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo especializado en HTR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (87,3 M de parámetros, ~0,35 GB en fp32); no se dispone de estimaciones para cuantizaciones específicas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 pueden ejecutarlo con holgura.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de visión con pesos safetensors, requeriría un pipeline personalizado basado en Transformers o similar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| cyttic/hmt-trocrctc-geom3-s43 | 87,3 M | no disponible | MIT | Aumentación `geom3`, semilla 43 |
| cyttic/hmt-trocrctc-stroke4-s42 | 87,3 M | no disponible | no disponible | Aumentación `stroke4`, semilla 42; misma familia |
| TrOCR base (referencia genérica) | ~334 M | no disponible | MIT | Modelo OCR general, no especializado en hebreo manuscrito |

La comparación se limita a la familia `cyttic/hmt-trocrctc-*`, de la que solo se ha identificado otra variante (`stroke4-s42`) con el mismo número de parámetros. No se dispone de datos de rendimiento de esa variante en la información proporcionada, por lo que no es posible comparar CER/WER entre ambas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en hebreo; no se ha validado su comportamiento en otros idiomas.
- La generalización a escritores no vistos en el corpus de entrenamiento puede degradarse, dado que el split excluye escritores específicos para desarrollo.
- El WER de 0,3294 es notablemente superior al CER de 0,0740, lo que indica errores a nivel de palabra que un modelo de lenguaje podría mitigar; sin LM, la salida puede contener palabras mal formadas.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus concreto puede reflejar las características demográficas y estilísticas de ese corpus.
- Riesgo de alucinación en el sentido de transcripciones plausibles pero incorrectas, especialmente en imágenes de baja calidad o con escritura atípica.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la procedencia de los datos de entrenamiento.
- La documentación es mínima: no hay información sobre arquitectura interna, tokenizador ni procesos de preprocesado, lo que dificulta la reproducibilidad.
- No se especifican requisitos de formato de imagen ni resolución de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-geom3-s43
- Variante relacionada: https://huggingface.co/cyttic/hmt-trocrctc-stroke4-s42
- Dataset de entrenamiento (referenciado en la model card): `cyttic/hhd-optionb-split` (no se proporciona URL directa en la información disponible)
