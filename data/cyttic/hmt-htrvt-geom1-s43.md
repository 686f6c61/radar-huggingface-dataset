# cyttic/hmt-htrvt-geom1-s43

## Resumen

`cyttic/hmt-htrvt-geom1-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el usuario cyttic en Hugging Face. Se trata de un modelo acústico CTC (Connectionist Temporal Classification) entrenado para transcribir texto manuscrito en hebreo (`he`), probablemente sobre imagenes de lineas de texto. Forma parte de un estudio de aumentacion de datos denominado `htr-metrics-transfer`, en el que se evalua el impacto de distintas estrategias de aumentacion sobre las metricas de reconocimiento.

El modelo corresponde a la variante `htrvt` con aumentacion `geom1` y semilla 43, y fue entrenado sobre el split de entrenamiento de `cyttic/hhd-optionb-split` excluyendo los escritores de desarrollo. Con 13.821.574 parametros y un tamano de repositorio de 0,1 GB, es un modelo compacto orientado a inferencia eficiente, no a generacion de texto general.

Su relevancia es acotada y especifica: sirve como referencia reproducible dentro de un estudio comparativo de aumentacion para HTR en hebreo, y como punto de partida para quienes trabajen en transcripcion de manuscritos hebreos con arquitecturas CTC. No es un modelo de proposito general ni un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `htrvt`, entrenado con CTC) |
| Parametros totales | 13.821.574 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas `htr` y `ctc`, que indican un modelo de reconocimiento de texto manuscrito entrenado con funcion de perdida CTC. La denominacion `htrvt` sugiere una variante de arquitectura para HTR, pero no se especifica si se trata de una CNN, un transformer con cabecera CTC o un modelo hibrido. El numero de parametros (13,8 M) es coherente con un modelo compacto de vision para transcripcion, no con un modelo de lenguaje.

El entrenamiento se realizo sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo. La variante corresponde a la aumentacion `geom1` con semilla 43, dentro de un estudio de transferencia de metricas (`htr-metrics-transfer`). No se proporcionan datos sobre numero de tokens, composicion del dataset, ni si hubo etapas de ajuste fino adicionales. La decodificacion reportada es greedy, sin modelo de lenguaje externo.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imagenes, con salida de secuencia de caracteres mediante decodificacion CTC.
- Decodificacion greedy sin modelo de lenguaje, segun la model card.
- Entrenado especificamente para lineas de texto manuscrito del corpus `hhd-optionb-split`.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta capacidad multilingue: solo hebreo.
- No se documentan modos especiales (thinking, vision general, audio) mas alla del reconocimiento de imagen a texto.

## Casos de uso

- Digitalizacion de archivos manuscritos en hebreo: el modelo transcribe lineas de texto manuscrito a caracteres, adecuado para pipelines de preservacion documental donde se disponga de imagenes segmentadas por lineas.
- Investigacion en HTR: sirve como linea base reproducible (semilla 43, aumentacion `geom1`) para comparar el efecto de distintas estrategias de aumentacion sobre CER y WER.
- Evaluacion de transferencia de metricas: al formar parte del estudio `htr-metrics-transfer`, permite replicar experimentos sobre el corpus `hhd-optionb-split` y contrastar resultados con otras variantes del mismo autor.
- Prototipado de OCR historico: con 13,8 M de parametros, puede desplegarse en entornos con recursos limitados para pruebas de transcripcion sobre manuscritos hebreos.
- Generacion de transcripciones auxiliares para anotacion humana: las salidas CTC pueden usarse como preanotacion que revisores humanos corrigen, reduciendo el esfuerzo de etiquetado.
- Benchmark interno de pipelines CTC: util para validar infraestructura de inferencia (preprocesado de imagen, decodificacion greedy) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la model card, sobre HHD Option-B test con decodificacion greedy y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0,0596 |
| WER | 0,2684 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa, dado el tamano de 13,8 M de parametros y un repositorio de 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien es viable en CPU para lotes pequenos.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos integrados.
- Opciones de despliegue: no se documentan frameworks especificos; al usar safetensors y CTC, es compatible con cargas via `transformers` o `safetensors` si el codigo del autor lo permite. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de HTR en hebreo ni resultados de otras variantes del estudio `htr-metrics-transfer` mas alla de la propia.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en hebreo manuscrito; no es un modelo de proposito general ni un LLM.
- Entrenado sobre un corpus concreto (`hhd-optionb-split`); el rendimiento fuera de ese dominio (otras manos, estilos o resoluciones) no esta documentado y puede degradarse.
- Decodificacion greedy sin modelo de lenguaje: el WER de 0,2684 es notablemente superior al CER de 0,0596, lo que indica errores a nivel de palabra que un LM externo podria mitigar.
- Riesgo de alucinacion en el sentido de sustituciones o inserciones de caracteres, inherente a los modelos CTC; no se han publicado analisis de sesgos.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda verificar los terminos del corpus de entrenamiento subyacente.
- Sin descargas ni likes en el momento de la consulta; ausencia de validacion por la comunidad.
- No se documentan limitaciones de contexto ni de idioma mas alla de las indicadas.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-geom1-s43
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
