# cyttic/hmt-htrvt-geom4-s43

## Resumen

cyttic/hmt-htrvt-geom4-s43 es un modelo de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) desarrollado por el grupo cyttic. Se trata de una variante concreta dentro de un estudio de aumento de datos (data augmentation) denominado htr-metrics-transfer: el modelo base es `htrvt`, la configuracion de aumento geometrico aplicada es `geom4` y la semilla de entrenamiento es 43. El modelo resuelve la transcripcion de imagenes de texto manuscrito a texto digital mediante un esquema CTC (Connectionist Temporal Classification), lo que permite alinear secuencias de imagen y texto sin segmentacion previa a nivel de caracter.

El modelo es de proposito muy especifico y de investigacion: sirve para comparar el impacto de distintas estrategias de aumento de datos sobre la calidad de transcripcion, medida con CER (Character Error Rate) y WER (Word Error Rate). No es un modelo de lenguaje generativo ni un asistente conversacional, sino un reconocedor acustico-visual de secuencias entrenado exclusivamente para hebreo (`he`).

Con 13.821.574 parametros y un repositorio de aproximadamente 0,1 GB en formato safetensors, es un modelo ligero, disenado para experimentacion reproducible en HTR y no para despliegues generalistas. Su relevancia actual radica en el contexto de la investigacion en HTR multilingue y en la evaluacion sistematica de tecnicas de aumento de datos, un area con pocos estudios publicados con semillas y particiones controladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo HTR con cabecera CTC; arquitectura base `htrvt` no detallada en la informacion) |
| Parametros totales | 13.821.574 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `htrvt`. Por los tags del repositorio (`htr`, `ctc`) y por la tarea, se trata de un modelo de reconocimiento de texto manuscrito con decodificacion CTC, que mapea una secuencia de caracteristicas visuales extraidas de la imagen a una secuencia de caracteres sin requerir etiquetas alineadas a nivel de caracter. El tamano de 13,8 millones de parametros es coherente con una red convolucional o un transformer pequeno con cabecera CTC, tipico en HTR.

El entrenamiento se realizo sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo (dev writers), con la configuracion de aumento geometrico `geom4` y semilla 43. La evaluacion se realizo sobre el test HHD Option-B con decodificacion greedy y sin modelo de lenguaje (no LM), obteniendo CER 0,0666 y WER 0,2899. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de RLHF o DPO, que por otra parte no son habituales en HTR.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo: transcribe imagenes de lineas o regiones de texto manuscrito a texto digital.
- Decodificacion CTC greedy: produce la secuencia de caracteres directamente desde las probabilidades por frame, sin modelo de lenguaje externo.
- Manejo de alineacion variable: al usar CTC, no requiere segmentacion previa a nivel de caracter.
- Entrenamiento controlado por semilla: permite reproducir el experimento con la semilla 43 y la configuracion `geom4`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales generales.
- No es un modelo de lenguaje: no genera texto libre ni responde a instrucciones.

## Casos de uso

- Investigacion en aumento de datos para HTR: comparar la configuracion `geom4` frente a otras configuraciones del estudio `htr-metrics-transfer` manteniendo fija la semilla 43, para aislar el efecto del aumento geometrico sobre CER y WER.
- Transcripcion de manuscritos hebreos historicos: el modelo puede procesar lineas de documentos manuscritos en hebreo y producir transcripciones con un CER de 0,0666 en el test HHD Option-B, adecuado para tareas de indexacion y busqueda sobre corpus digitalizados.
- Reproducibilidad de experimentos: al estar identificado por semilla y configuracion de aumento, sirve como punto de referencia reproducible en publicaciones y comparativas internas del grupo cyttic.
- Baseline para HTR en hebreo: util como linea base ligera (13,8 M de parametros) contra la que medir modelos mas grandes o con modelo de lenguaje en la decodificacion.
- Prototipado de pipelines de digitalizacion: por su tamano reducido (0,1 GB), puede integrarse en entornos con recursos limitados para pruebas de concepto de transcripcion de manuscritos hebreos.
- Analisis de errores por escritor: dado que el entrenamiento excluye los dev writers, permite estudiar la generalizacion a escritores no vistos en el split HHD Option-B.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la model card, sobre el test HHD Option-B con decodificacion greedy y sin modelo de lenguaje:

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, no LM) | CER | 0,0666 |
| HHD Option-B test (greedy, no LM) | WER | 0,2899 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 13,8 M de parametros en fp32 el modelo ocupa aproximadamente 55 MB, y en fp16 unos 28 MB, mas el coste de activaciones de las imagenes de entrada.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: al ser un modelo safetensors con cabecera CTC, requiere un runtime compatible con la arquitectura `htrvt` (no disponible en la informacion); no se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia de categoria, este modelo se situaria frente a otros sistemas HTR para hebreo y a modelos HTR multilingues, pero no se han facilitado sus especificaciones ni resultados, por lo que la comparativa cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-geom4-s43 | 13,8 M | no disponible | 0,0666 | MIT | Hugging Face |
| Alternativas HTR para hebreo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de proposito especifico: no es un modelo de lenguaje ni un asistente; no responde a prompts ni genera texto libre.
- Idioma unico: entrenado exclusivamente para hebreo (`he`); no se espera buen rendimiento en otros idiomas o alfabetos.
- Dependencia del dataset: los resultados (CER 0,0666, WER 0,2899) corresponden al test HHD Option-B con decodificacion greedy y sin modelo de lenguaje; con otro esquema de decodificacion o dominio los resultados pueden diferir.
- Riesgo de sobreajuste al split: al excluir los dev writers del entrenamiento, la generalizacion a escritores y estilos no vistos fuera del dataset HHD no esta garantizada.
- Sin modelo de lenguaje: la decodificacion greedy sin LM puede producir errores ortograficos y de palabras que un LM corregiria; el WER de 0,2899 refleja esta limitacion.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- Sesgos: no se ha documentado ningun analisis de sesgos por escritor, genero, epoca o estilo caligrafico en la informacion disponible.
- Advertencia de reproducibilidad: los metadatos indican fecha de creacion en 2026, lo que puede afectar a la trazabilidad temporal del experimento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-geom4-s43
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` (referenciado en la model card, no se proporciona URL directa)
- Paper, blog o repositorio del estudio `htr-metrics-transfer`: no disponible en la informacion proporcionada
