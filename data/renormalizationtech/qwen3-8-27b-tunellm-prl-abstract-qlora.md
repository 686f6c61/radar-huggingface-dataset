# RenormalizationTech/Qwen3.8-27B-tuneLLM-PRL-Abstract-QLoRA

## Resumen

Qwen3.8-27B-tuneLLM-PRL-Abstract-QLoRA es un adaptador QLoRA experimental publicado por RenormalizationTech sobre una base NF4 derivada de un checkpoint Qwen de 27.000 millones de parametros, convertida a texto puro por tuneLLM (eliminacion de componentes de vision y MTP, cuantizacion NF4 de los pesos del modelo de lenguaje). El adaptador se entrena especificamente para una tarea concreta: generar un abstract fundamentado de como maximo 200 palabras a partir de un extracto fijo del cuerpo de articulos cientificos, o bien producir JSON de respuesta/evidencia al estilo QASPER.

La relevancia de esta ficha no esta en el rendimiento del modelo, sino en el caso de estudio que documenta: la propia model card declara "EXPERIMENTAL; NOT RECOMMENDED" y recomienda usar la base sin adaptar. El adaptador fallo las puertas de evaluacion cientifica registradas, y los datos publicados muestran como el aumento de solapamiento lexico con el texto fuente coincidio con una caida de calidad juzgada. Es, por tanto, un ejemplo instructivo de evaluacion rigurosa de adaptadores de dominio cientifico.

El paquete ocupa 0,5 GB (solo los tensores del adaptador LoRA), esta licenciado bajo Apache-2.0 y se distribuye en formato safetensors compatible con la libreria PEFT. El modelo base esta fijado al commit `e7644d6f288cb8a9ba51856ca2c9fa68946f70fe`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen, base) con adaptador LoRA/QLoRA sobre pesos cuantizados NF4; base convertida a text-only |
| Parametros totales | 27B (modelo base); tamano del adaptador no disponible en detalle |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base en NF4 (normal-float 4-bit); adaptador LoRA en safetensors (precision no especificada) |
| Idiomas soportados | No disponible (etiquetado como text-only, sin lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT adapter); base en NF4 |
| Libreria | peft |
| Tamano del repo | 0,5 GB |
| Modelo base | RenormalizationTech/Qwen3.8-27B-tuneLLM-NF4 (commit e7644d6f) |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-18 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de la familia Qwen con 27.000 millones de parametros. La base NF4 fue producida por tuneLLM mediante una conversion del checkpoint original de Qwen: se eliminaron los componentes de vision y de multi-token prediction (MTP) para dejar un modelo estrictamente de texto, y se cuantizaron los pesos del modelo de lenguaje a NF4. Sobre esa base cuantizada se entreno este adaptador QLoRA especifico de tarea. La preparacion k-bit de PEFT convierte los parametros flotantes no cuantizados de la base a FP32, tanto en la rama base como en la del adaptador.

El entrenamiento se realizo sobre 57 articulos cientificos que superaron dos pasadas de auditoria de afirmaciones por IA, con 9 articulos de desarrollo. Todos los articulos de entrenamiento y de evaluacion pertenecen a la categoria cond-mat (materia condensada). La evaluacion final empleo 40 articulos CC-BY de arXiv asociados a Physical Review Letters, frescos para el proyecto pero no demostrados ausentes del preentrenamiento. La tarea consiste en producir un abstract fundamentado de maximo 200 palabras a partir de un extracto fijo del cuerpo que puede omitir la parte central. El juicio se realizo con dos contextos frescos de la misma familia de IA que el asesor, sin validacion humana cientifica independiente.

Un detalle tecnico relevante es la discrepancia numerica no resuelta entre la cache de prefijo y el prefijo completo en el smoke test NF4, y el hecho de que la generacion con batch4 no es token-equivalente a batch1 (2 de 4 sondas de preflight inventadas difirieron). Las comparaciones de retencion exigen grupos batch4 identicos, y los resultados cientificos finales (batch1) no deben agruparse con los de retencion (batch4).

## Capacidades

- Generacion de texto cientifico: produccion de abstracts de hasta 200 palabras a partir de extractos de cuerpo de articulos de materia condensada.
- Generacion de JSON estructurado para tareas QASPER (respuesta y evidencia).
- Generacion body-to-abstract asociada a PRL.
- Razonamiento numerico basico: en la tarea de retencion GSM8K el adaptador obtuvo 120 aciertos frente a 114 de la base (mejora neta de 6).
- Seguimiento de instrucciones con formato estricto: 24 pases IFEval estrictos frente a 23 de la base (mejora neta de 1).
- Conocimiento general tipo MMLU: 110 aciertos, identico a la base (cambio neto 0).
- Capacidad text-only: sin vision, audio ni tool calling documentados.
- Sin soporte documentado de agentes, multi-step reasoning ni thinking mode.
- Capacidades multilingues: no disponibles; la evaluacion se limita a articulos en ingles de arXiv.

## Casos de uso

- Investigacion sobre evaluacion de adaptadores cientificos: el paquete sirve como referencia metodologica para disenar puertas de evaluacion con intervalos bootstrap, comparacion frente a copia fija y diagnostico de solapamiento lexico. Es su uso mas solido dada la advertencia explicita del autor.
- Reproduccion de experimentos QLoRA sobre bases NF4: permite estudiar el comportamiento de PEFT k-bit con bases cuantizadas y los efectos de batch1 frente a batch4 en generacion, gracias a los datos de diagnostico publicados.
- Generacion de abstracts en dominios de materia condensada: el adaptador produce abstracts mas cortos (131 palabras de media frente a 177 de la base) y con mayor F1 de tokens normalizado (0,414 frente a 0,382), aunque con menor preferencia juzgada; util solo en exploracion controlada.
- Extraccion estructurada QASPER: generacion de JSON de respuesta y evidencia para pipelines de recuperacion documental, con la salvedad de que el autor recomienda la base sin adaptar.
- Estudio de retencion de capacidades tras fine-tuning: los datos de GSM8K, IFEval y MMLU permiten analizar el olvido catastrofico en adaptadores de dominio cientifico.
- Benchmarking de alineacion lexica frente a fundamentacion: el contraste entre fraccion de 8-gramas unicos novedosos (0,986 en base frente a 0,526 en adaptador) y calidad juzgada es un caso practico para estudiar copia frente a generacion fundamentada.

## Benchmarks y rendimiento

Resultados publicados en la model card (40 articulos frescos de evaluacion, generacion batch1):

| Comparacion | Puntuacion de preferencia del adaptador | IC bootstrap 95% (por articulo) | Diferencia media de afirmaciones no soportadas | IC 95% de la diferencia |
|---|---:|---|---:|---|
| adaptador vs base | 0,175000 | [0,075, 0,2875] | 0,025000 | [0,0, 0,075] |

Diagnosticos secundarios (sin efecto sobre puertas ni seleccion):

| Rama | Palabras medias | Fraccion de 8-gramas unicos novedosos | F1 LCS (espacios) | F1 tokens normalizado |
|---|---:|---:|---:|---:|
| base | 176,925 (n=40) | 0,985603 (n=40) | 0,205140 (n=40) | 0,382270 (n=40) |
| adaptador | 131,325 (n=40) | 0,525501 (n=40) | 0,244157 (n=40) | 0,414167 (n=40) |
| fixed_copy | 134,000 (n=40) | 0,002458 (n=38) | 0,136275 (n=40) | 0,248110 (n=40) |

Puertas de retencion (aciertos correctos):

| Tarea de retencion | Base correcta | Adaptador correcto | Cambio neto |
|---|---:|---:|---:|
| general_mc | 110 | 110 | 0 |
| gsm8k | 114 | 120 | +6 |
| ifeval | 23 | 24 | +1 |

La puerta de punto de "cero aumento de afirmaciones no soportadas" fallo cerca de cero y su intervalo incluye el cero. La seleccion de desarrollo registro "base" como eleccion real, con alias de linea base identica en True y motivo de fallback "juicios de desarrollo incompletos; sin llamadas extra".

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0,5 GB; la base NF4 de 27B requiere aproximadamente 14-16 GB solo para pesos, mas overhead de activaciones y cache KV, por lo que en la practica se necesitan 24 GB o mas para inferencia comoda.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para cuantizacion NF4 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) y potencialmente en GPUs de 24 GB con contexto limitado; no cabe en GPUs de 16 GB sin cuantizacion adicional ni offload.
- Despliegue: la model card solo documenta carga via PEFT con un `environment.lock.txt` especifico; no se mencionan vLLM, llama.cpp, Ollama ni TGI. La base NF4 y el adaptador PEFT no son directamente compatibles con llama.cpp sin conversion.
- Latencia y throughput: no disponibles; la model card solo indica que la generacion cientifica se hizo con batch1 y la de retencion con batch4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Estado |
|---|---|---|---|---|---|
| Este adaptador (Qwen3.8-27B-tuneLLM-PRL-Abstract-QLoRA) | 27B base + LoRA | No disponible | Adaptador QLoRA experimental | Apache-2.0 | Fallo puertas; no recomendado |
| RenormalizationTech/Qwen3.8-27B-tuneLLM-NF4 (base) | 27B | No disponible | Base NF4 text-only | Apache-2.0 | Recomendado por el autor frente al adaptador |
| Qwen original (familia Qwen, checkpoint upstream) | 27B | No disponible | Transformer con vision y MTP | No disponible | Referencia upstream |

No se dispone de datos de benchmarks frente a modelos externos de la misma categoria; la unica comparacion publicada es adaptador frente a su propia base.

## Limitaciones y advertencias

- El autor declara el paquete "EXPERIMENTAL; NOT RECOMMENDED" y recomienda explicitamente la base sin adaptar para la tarea de abstract.
- El adaptador fallo las puertas de ciencia registradas; la preferencia frente a la base es de 0,175 con IC [0,075, 0,2875], muy por debajo de la paridad.
- El aumento de solapamiento lexico con la fuente coincidio con una caida de calidad juzgada; el mecanismo causal no esta probado y el solapamiento lexico no demuestra respaldo de afirmaciones.
- Los articulos de evaluacion no estan demostrados ausentes del preentrenamiento; el solapamiento de autores no se excluyo, por lo que la generalizacion limpia no esta establecida.
- El juicio se realizo con dos contextos de la misma familia de IA que el asesor, sin validacion humana cientifica independiente.
- Los juicios de desarrollo pueden estar incompletos; el fallback registrado selecciona la base y alias identicos cuando el registro de seleccion congelado lo indica.
- Discrepancia numerica no resuelta entre cache de prefijo y prefijo completo en el smoke NF4; coincidir en dos secuencias de tokens no demuestra equivalencia de cache.
- Batch4 no es token-equivalente a batch1 (2 de 4 sondas difirieron); los resultados cientificos y de retencion no deben agruparse.
- Restriccion de dominio: todos los articulos son de cond-mat; el rendimiento en otras disciplinas no esta evaluado.
- La licencia Apache-2.0 permite uso comercial, pero el estado experimental y el fallo de puertas desaconsejan produccion.
- Riesgo de alucinacion: la puerta de afirmaciones no soportadas fallo cerca de cero con intervalo que incluye el cero; no se demuestra una regresion factual grande, pero tampoco mejora.
- Idiomas soportados no disponibles; la evaluacion es solo en ingles.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/RenormalizationTech/Qwen3.8-27B-tuneLLM-PRL-Abstract-QLoRA
- Modelo base NF4: https://huggingface.co/RenormalizationTech/Qwen3.8-27B-tuneLLM-NF4/tree/e7644d6f288cb8a9ba51856ca2c9fa68946f70fe
- Commit fijado de la base: e7644d6f288cb8a9ba51856ca2c9fa68946f70fe
- No se han encontrado papers, blogs, repos ni demos adicionales en la informacion disponible.
