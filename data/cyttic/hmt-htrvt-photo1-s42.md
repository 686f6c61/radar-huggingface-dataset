# cyttic/hmt-htrvt-photo1-s42

## Resumen

`cyttic/hmt-htrvt-photo1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado con una arquitectura CTC y publicado por el grupo `cyttic`. No es un modelo de lenguaje generativo: su funcion es transcribir imagenes de escritura manual a texto, en este caso en hebreo (`he`), y su salida se evalua con CER (*Character Error Rate*) y WER (*Word Error Rate*) en lugar de con benchmarks de razonamiento o generacion.

El modelo forma parte de un estudio de *augmentation* denominado `htr-metrics-transfer` (ola 1), en el que se entrena la misma arquitectura (`htrvt`) con distintas estrategias de aumento de datos y semillas. En esta variante concreta, la configuracion corresponde al aumento `photo1` y la semilla 42. El entrenamiento se realizo sobre el split de entrenamiento de `cyttic/hhd-optionb-split` excluyendo los escritores de desarrollo, y la evaluacion se hizo sobre el conjunto de test HHD Option-B con decodificacion voraz (*greedy*) y sin modelo de lenguaje.

Con 13.821.574 parametros y un repositorio de aproximadamente 0,1 GB, es un modelo compacto pensado para experimentacion reproducible y para servir como punto de comparacion dentro de un barrido de aumentos de datos. Su relevancia es, por tanto, metodologica y de investigacion en HTR, no de despliegue generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC para reconocimiento de texto manuscrito (HTR); arquitectura interna `htrvt` no detallada |
| Parametros totales | 13.821.574 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card identifica el modelo como un sistema HTR con funcion de perdida y decodificacion CTC (*Connectionist Temporal Classification*), lo que implica alineamiento implicito entre la secuencia de imagenes o frames y la secuencia de caracteres, sin necesidad de segmentacion previa. El identificador `htrvt` corresponde a la arquitectura empleada en el estudio; la model card no desglosa el numero de capas, dimensiones ocultas ni el tipo de encoder visual, por lo que esos detalles no estan disponibles.

El entrenamiento se realizo sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, con el aumento de datos `photo1` y semilla 42. La evaluacion se hizo sobre el test HHD Option-B con decodificacion voraz y sin modelo de lenguaje, es decir, sin correccion lexica posterior. No se documentan en la informacion disponible el numero de tokens o muestras de entrenamiento, la composicion del dataset ni el uso de tecnicas de refinamiento como RLHF o DPO, que por otra parte no son habituales en HTR.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imagenes.
- Transcripcion a nivel de caracter con alineamiento CTC, sin segmentacion manual previa.
- Decodificacion voraz (*greedy*) evaluada sin modelo de lenguaje.
- Entrenamiento con aumento de datos fotografico (`photo1`), orientado a mejorar la robustez ante variaciones de captura.
- No se documentan capacidades de generacion de texto libre, razonamiento, codigo, matematicas, vision general, tool calling ni comportamiento de agente.
- No se documenta soporte multilingue: el unico idioma declarado es el hebreo.
- No se documentan modos especiales como *thinking mode*, audio o vision general.

## Casos de uso

- Digitalizacion de archivos manuscritos en hebreo: el modelo transcribe lineas o regiones de texto manuscrito a caracteres, adecuado para fondos documentales digitalizados donde se requiere texto plano indexable.
- Investigacion en aumento de datos para HTR: sirve como una de las configuraciones del barrido `htr-metrics-transfer`, permitiendo comparar el efecto de `photo1` frente a otros aumentos con la misma semilla y arquitectura.
- Reproducibilidad de experimentos: al estar publicado con semilla fija (42) y pesos en safetensors, permite repetir la evaluacion CER/WER sobre HHD Option-B en las mismas condiciones.
- Linea base para modelos de correccion con LM: al haberse evaluado sin modelo de lenguaje, es un punto de partida limpio para medir la ganancia de un post-procesado lexico sobre la salida CTC.
- Prototipado de pipelines OCR/HTR en entornos con recursos limitados: con 13,8 M de parametros y 0,1 GB de repositorio, el coste de inferencia y almacenamiento es bajo.
- Evaluacion comparativa de escritores: al haberse excluido los escritores de desarrollo del entrenamiento, permite estudiar el comportamiento sobre escritores no vistos en el conjunto de test.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,0638 | HHD Option-B test, decodificacion greedy, sin LM |
| WER | 0,2893 | HHD Option-B test, decodificacion greedy, sin LM |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni datos de MMLU, HumanEval o GSM8K, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 13,8 M de parametros en precision completa el peso de los pesos ronda decenas de MB, por lo que la VRAM necesaria es muy reducida y dependera principalmente del encoder visual y del tamano de las imagenes de entrada.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se documentan requisitos especificos.
- Cabe en GPU consumer: si, con margen amplio, dado el tamano del modelo.
- Opciones de despliegue: no se documentan en la model card; al tratarse de pesos safetensors con arquitectura CTC, requerira un runtime compatible con dicha arquitectura (no es un modelo de la familia transformers generica necesariamente).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Rendimiento |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-photo1-s42 | 13.821.574 | no disponible | he | MIT | CER 0,0638 / WER 0,2893 (HHD Option-B, greedy, sin LM) |
| Otras variantes del barrido `htr-metrics-transfer` | no disponible | no disponible | he | no disponible | no disponible |
| Modelos HTR genericos multilingues | no disponible | no disponible | varios | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de modelos alternativos comparables bajo las mismas condiciones de evaluacion.

## Limitaciones y advertencias

- El modelo solo declara soporte de hebreo; no hay evidencia de generalizacion a otros idiomas o alfabetos.
- El WER (0,2893) es notablemente superior al CER (0,0638), lo que indica que los errores a nivel de caracter se concentran en palabras completas; sin modelo de lenguaje, la salida puede contener palabras mal formadas.
- La evaluacion se realizo unicamente con decodificacion greedy y sin LM; el rendimiento en produccion con un LM de correccion no esta documentado.
- No se documentan sesgos especificos, pero al entrenarse sobre un unico dataset (`cyttic/hhd-optionb-split`) puede heredar los sesgos de escritura, estilo y dominio de dicho corpus.
- Riesgo de alucinacion en el sentido de sustituciones o inserciones de caracteres plausibles pero incorrectos, inherente a los sistemas CTC sin restricciones lexicas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento fuera del conjunto de evaluacion.
- Es un artefacto de investigacion (estudio de aumento de datos, ola 1) sin pipeline declarado en HuggingFace; conviene validar su integracion en un runtime HTR antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-htrvt-photo1-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo (referenciado en la model card)
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada
