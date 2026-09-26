# hmarchant/speaker-names-attr-ettin-150m

## Resumen

Speaker Names Attribution, Ettin 150M es un modelo encoder-only desarrollado por el usuario hmarchant que resuelve una tarea muy concreta dentro del procesado de transcripciones: extraer el nombre real impreso de cada hablante diarizado (`Speaker A`, `Speaker B`, etc.) a partir del texto de una transcripcion. Se trata de un modelo de atribucion de hablantes que no infiere identidades a partir de la voz ni de conocimiento externo, sino que localiza de forma extractiva el nombre cuando este aparece literalmente en el texto, y se abstiene cuando la transcripcion no lo menciona.

El modelo parte de `jhu-clsp/ettin-encoder-150m`, un encoder de arquitectura tipo ModernBERT de 149 millones de parametros, al que se le anade una cabeza de span estilo SQuAD (inicio/fin) donde la posicion cero representa la respuesta nula. Su entrenamiento se centro en transcripciones de programas de noticias y actualidad en ingles, con una longitud maxima de secuencia de 4096 tokens y una estrategia de ventana con stride de 1024.

Es relevante porque aborda un cuello de botella practico en pipelines de subtitulado, minutas de reuniones y analisis de medios: convertir etiquetas genericas de diarizacion en nombres de persona reales. Sus resultados reportados (F1 de persona 0.857 y F1 de texto exacto 0.812 en un conjunto revisado manualmente de 264 filas) lo situan como una utilidad ligera y especializada, publicada bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (base ModernBERT/Ettin) con cabeza de extraccion de span estilo SQuAD |
| Parametros totales | 149 millones (149M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens de secuencia maxima, con stride de 1024 y atencion SDPA sobre ventanas sin padding |
| Tipos de cuantizacion | no disponible (se distribuye un checkpoint personalizado `speaker_span.pt`, no cuantizaciones pregeneradas) |
| Idiomas soportados | principalmente ingles (dominio de noticias y actualidad); otros idiomas no disponibles |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch personalizado `speaker_span.pt` (no es un checkpoint estandar de `AutoModelForQuestionAnswering`) |

## Arquitectura y entrenamiento

El modelo es un encoder-only derivado de `jhu-clsp/ettin-encoder-150m`, que pertenece a la familia ModernBERT de encoders modernos. Sobre ese backbone se anade una cabeza de prediccion de span extractivo con logits de inicio y fin de la respuesta, siguiendo el esquema clasico de SQuAD: la posicion cero actua como respuesta nula, lo que permite al modelo abstenerse cuando el nombre no esta presente en el texto. La inferencia se realiza sobre ventanas con stride, aplicando atencion SDPA sobre secuencias sin padding.

Los datos de entrenamiento consisten en 4988 filas de entrenamiento, 550 de validacion y 638 de test, con etiquetas generadas por `grok-4.7`, ancladas contra fragmentos verba de la transcripcion y verificadas mediante una segunda pasada de modelo. Se eliminaron nombres de organizaciones, nombres de programas y fragmentos de frases. El entrenamiento uso batch size 1 con acumulacion de gradiente de 16 pasos y el modelo se selecciono en la epoca 3 segun el F1 de validacion a nivel de persona, con un umbral de decision de -2.25. La longitud maxima de secuencia fue de 4096 tokens con stride de 1024.

## Capacidades

- Extraccion extractiva del nombre real de cada hablante diarizado a partir de etiquetas como `Speaker A`, `Speaker B`, etc.
- Abtencion explicita: devuelve `null` cuando la transcripcion no identifica al hablante.
- Salida estructurada en JSON: mapeo de etiqueta de hablante a nombre extraido o `null`.
- Resolucion de nombres en textos con multiples hablantes y multiples personas mencionadas en una misma ventana.
- Funcionamiento como modelo de question answering extractivo (pipeline `question-answering`).
- Procesamiento de transcripciones largas mediante ventanas con stride de 1024.
- No soporta tool calling ni function calling (no disponible en la informacion).
- No soporta agentes ni razonamiento multi-paso (es un modelo de extraccion de span).
- Capacidades multilingues: no disponibles; el entrenamiento se concentra en ingles.
- No incorpora vision, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Enriquecimiento de pipelines de diarizacion: tras aplicar un sistema de diarizacion y ASR, el modelo convierte las etiquetas genericas en nombres reales, produciendo transcripciones listas para busqueda o publicacion.
- Minutas de reuniones: en actas automaticas donde aparecen nombres propios durante la conversacion, permite sustituir `Speaker 1` por el nombre correcto para atribuir cada intervencion.
- Analisis de medios y monitoreo de prensa: en transcripciones de programas de noticias (dominio de entrenamiento), facilita identificar que persona realiza cada declaracion para analisis posteriores de menciones.
- Indexacion y busqueda en archivos de subtitulos: al mapear hablantes a nombres, mejora la recuperacion de fragmentos por persona en grandes volumenes de transcripciones.
- Moderacion y compliance de contact centers: permite asociar intervenciones a agentes o clientes nombrados en la conversacion para auditoria, siempre que el nombre se mencione en el texto.
- Post-procesado de subtitulado automatico: se integra como paso final del pipeline para reemplazar etiquetas por nombres antes de exportar a formatos de subtitulos.
- Construccion de datasets etiquetados: sirve para poblar bases de datos de conversaciones con metadatos de hablante-nombre, con la ventaja de abstenerse en lugar de inventar identidades.

## Benchmarks y rendimiento

Evaluacion sobre un conjunto revisado manualmente de 264 filas transcript-hablante, con 131 hablantes con nombre y 133 sin nombre:

| Modelo | Precision | Recall | Person F1 | Exact-text F1 |
| --- | ---: | ---: | ---: | ---: |
| Speaker Names Attribution, Ettin 150M | 0.844 | 0.870 | 0.857 | 0.812 |

El Person F1 acepta cualquier forma impresa del nombre de la persona correcta (por ejemplo, `Kevin` para `Kevin Cork`); el Exact-text F1 exige el texto objetivo completo. Sobre el split de test verificado automaticamente (638 filas), el Person F1 es 0.882 y el Exact-text F1 es 0.830.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 149M, en FP16 el peso ronda los 0.3 GB; con ventanas de 4096 tokens y batch 1, el consumo total se mantiene previsiblemente por debajo de 1-2 GB (estimacion, no confirmada en la informacion).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; es adecuado para RTX 3060/4060 y superiores, y sobrado en A100, H100 o L4.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM, e incluso en CPU para lotes pequenos.
- Opciones de despliegue: PyTorch 2.4 o superior con transformers 4.51 (rango `<5`) y `huggingface_hub`; la inferencia se realiza mediante `python -m speaker_names.infer`. Al ser un checkpoint personalizado, no es compatible directamente con vLLM, TGI o llama.cpp sin adaptacion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Speaker Names Attribution, Ettin 150M | 149M | 4096 | Extraccion de nombres de hablante (span) | MIT | HuggingFace (checkpoint personalizado) |
| jhu-clsp/ettin-encoder-150m (modelo base) | 149M | no disponible | Encoder general (fine-tuning) | no disponible en la informacion | HuggingFace |
| Modelos genericos de QA extractivo tipo SQuAD | variable | variable | Question answering extractivo | variable | HuggingFace |

No se dispone de resultados comparativos de otros modelos frente a este en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo devuelve nombres impresos en la transcripcion; no infiere identidades a partir de la voz, conocimiento externo ni contexto no impreso.
- Se asume que las etiquetas de hablante son locales a cada ventana de transcripcion, lo que puede generar inconsistencias si la diarizacion se fragmenta.
- La precision depende directamente de la calidad de la diarizacion y del ASR previos; errores en ellos degradan la extraccion.
- El material de entrenamiento es mayoritariamente ingles y de noticias y actualidad, por lo que el rendimiento puede ser inferior en otros dominios e idiomas.
- El checkpoint personalizado `speaker_span.pt` no es un `AutoModelForQuestionAnswering` estandar, lo que limita la compatibilidad con herramientas genericas.
- Riesgo de alucinacion: reducido por diseno, ya que la tarea es extractiva y el modelo se abstiene con `null`, pero no puede descartarse la seleccion de un span incorrecto cuando varios nombres aparecen juntos.
- Las etiquetas de entrenamiento se generaron con `grok-4.7` y una verificacion posterior, por lo que pueden heredar sesgos o errores del proceso de anotacion automatica.
- Uso comercial permitido bajo licencia MIT, sin restricciones adicionales declaradas.
- No se han documentado sesgos demograficos especificos en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmarchant/speaker-names-attr-ettin-150m
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-150m
