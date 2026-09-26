# nassimjp/LFM2.5-2.6B-Pashto-Zi-b-LoRA-adapter-1

## Resumen

El repositorio `nassimjp/LFM2.5-2.6B-Pashto-Zi-b-LoRA-adapter-1` es un adaptador LoRA publicado por el usuario nassimjp sobre un modelo de la familia LFM2 (Liquid Foundation Models), segun el tag `lfm2` y el nombre del propio repositorio, que apunta a una variante de 2,6 mil millones de parametros. El entrenamiento declarado se realizo con Unsloth y la libreria TRL de Hugging Face, una combinacion habitual para ajuste fino eficiente en memoria y tiempo (la model card afirma un entrenamiento "2x mas rapido").

El problema que aborda, a juzgar por el identificador (`Pashto`), es la adaptacion del modelo al pastun, si bien la model card solo declara el idioma ingles (`en`) en el campo `language` y no incluye ningun dataset, corpus ni evaluacion que documente dicha adaptacion. La relevancia practica del artefacto es limitada tal como esta publicado: se trata de pesos de adaptador, no de un modelo completo, y no incorpora informacion sobre hiperparametros, tokens de entrenamiento, ranking del LoRA ni procedimiento de fusion con el modelo base.

El repositorio presenta ademas varias inconsistencias de metadatos que conviene tener presentes antes de cualquier uso: el campo `base_model` se referencia a si mismo (`nassimjp/LFM2.5-2.6B-Pashto-Zi-b-LoRA-adapter-1`), el tamano declarado es de 0,0 GB, registra 0 descargas y 0 likes, y las marcas temporales de creacion y actualizacion (2026-09-25) no resultan verificables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada; el tag `lfm2` apunta a la familia LFM2, pero la model card no describe capas, atencion ni bloque |
| Parametros totales | no disponible; el nombre del repositorio indica 2,6 B para el modelo subyacente, sin confirmacion documental |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el repositorio se distribuye en formato `safetensors` correspondiente a un adaptador LoRA |
| Idiomas soportados | `en` segun el campo `language` de la model card; el nombre del repositorio sugiere pastun, extremo no documentado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, no pesos completos) |
| Libreria declarada | transformers |
| Tags relevantes | `text-generation-inference`, `unsloth`, `trl`, `lfm2`, `endpoints_compatible` |
| Tamano del repositorio | 0,0 GB (segun metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no aporta ninguna descripcion de la arquitectura del modelo base. El unico indicio es el tag `lfm2`, que asocia el artefacto a la familia LFM2 de Liquid AI, y el identificador `2.6B`, que situaria el modelo subyacente en el entorno de los 2,6 mil millones de parametros. No se especifica si se trata de un transformer denso, de una arquitectura hibrida con capas convolucionales o de estado recurrente, ni se detalla el mecanismo de atencion, el vocabulario o la dimensionalidad del modelo.

En cuanto al entrenamiento, la informacion disponible se limita a dos afirmaciones: el ajuste se realizo con Unsloth y TRL, y fue "2x mas rapido" gracias a Unsloth. No se indican el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF, DPO u otra optimizacion por preferencias, ni la configuracion del LoRA (rango, alpha, modulos objetivo). Tampoco se describe el procedimiento de fusion del adaptador con el modelo base ni el proceso de evaluacion posterior.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base LFM2 sobre el que se aplica el adaptador; no se documenta ninguna evaluacion especifica.
- Adaptacion linguistica al pastun: presumible por el identificador del repositorio, pero sin evidencia en la model card, que declara unicamente `en` como idioma.
- Ajuste fino eficiente: el artefacto es un adaptador LoRA, por lo que su funcion prevista es complementar al modelo base, no operar de forma autonoma.
- Compatibilidad con text-generation-inference: el tag `text-generation-inference` y `endpoints_compatible` indican que el autor preve su despliegue en infraestructura de inferencia de Hugging Face.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible; no se mencionan en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

Los escenarios siguientes son aplicaciones potenciales del adaptador, condicionadas en todos los casos a una validacion previa por parte del equipo que lo adopte, dado que no existe documentacion ni evaluacion publicada.

- Adaptacion de un asistente conversacional en pastun: el adaptador podria fusionarse con el modelo base LFM2 de 2,6 B para ajustar el registro y el vocabulario al pastun en tareas de atencion al usuario; requiere verificar primero que el ajuste es efectivo, ya que la model card no lo confirma.
- Investigacion sobre ajuste fino eficiente: sirve como ejemplo reproducible del flujo Unsloth + TRL aplicado a modelos de la familia LFM2, util para equipos que quieran replicar la receta en otros idiomas de bajos recursos.
- Traduccion asistida de documentos breves (correos, notas, mensajes): con un modelo de 2,6 B el caso realista es la traduccion de fragmentos cortos en un pipeline humano-en-el-bucle, no la traduccion automatica de volumenes grandes.
- Prototipado rapido en entornos con GPU de gama media: al tratarse de un adaptador sobre un modelo de 2,6 B, el despliegue completo cabe en GPUs de consumo, lo que permite construir demos internas sin infraestructura dedicada.
- Generacion de contenido multilingue de bajo coste: en escenarios donde la latencia y el coste por token pesan mas que la calidad absoluta, un modelo de este tamano puede cubrir tareas de resumen o reescritura.
- Base para posteriores iteraciones de ajuste: el adaptador puede actuar como punto de partida para nuevas rondas de LoRA con datos adicionales de pastun u otras lenguas iranias.
- Evaluacion comparativa de adaptadores linguisticos: util como artefacto de referencia en estudios sobre transferencia entre idiomas de bajos recursos, siempre que se documente la configuracion de entrenamiento, hoy ausente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluacion, y el repositorio no incorpora informes de evaluacion.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano nominal de 2,6 B de parametros indicado por el nombre del repositorio, no datos publicados por el autor. Deben tratarse como orientativas.

- Adaptador LoRA en si: ocupa del orden de decenas o centenas de megabytes; el valor "0,0 GB" de los metadatos refleja unicamente el redondeo del tamano del repositorio y no es fiable.
- Inferencia del modelo base en bf16/fp16: aproximadamente 5,2 GB de pesos, mas la cache KV; se recomienda un minimo de 8 GB de VRAM, y 12 GB para secuencias largas o lotes mayores.
- Inferencia en int8: en torno a 2,6-3 GB de pesos; viable en GPUs de 6-8 GB.
- Inferencia en 4 bits (GGUF Q4_K_M): aproximadamente 1,6-1,8 GB; cabe en GPUs de consumo de 6 GB o mas y, con RAM suficiente, en CPU.
- GPU de gama de consumo: una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB son suficientes para el modelo fusionado en cuantizacion de 4 u 8 bits, y la 4090 tambien para bf16.
- GPU de centro de datos: A100 de 40/80 GB, H100 de 80 GB o L40S permiten bf16 con lotes amplios y alto throughput; el modelo queda muy por debajo de su capacidad, por lo que se pueden consolidar multiples instancias por GPU.
- Opciones de despliegue: `transformers` es la libreria declarada; el tag `text-generation-inference` sugiere compatibilidad con TGI. vLLM es viable una vez fusionado el adaptador con la base. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. La model card no identifica el modelo base exacto (el campo `base_model` es autorreferente) y no incluye ninguna evaluacion numerica, por lo que no es posible contrastar parametros, contexto ni rendimiento con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| nassimjp/LFM2.5-2.6B-Pashto-Zi-b-LoRA-adapter-1 | no confirmado (nombre sugiere 2,6 B) | no disponible | Apache 2.0 | no publicados | adaptador LoRA en Hugging Face, 0 descargas |
| Modelo base LFM2 referenciado | no disponible | no disponible | no disponible | no disponible | referencia autorreferente en el repositorio |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no identificadas en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican dataset, hiperparametros del LoRA, tokens de entrenamiento ni criterios de evaluacion, lo que impide reproducir o auditar el ajuste.
- Metadatos incoherentes: `base_model` apunta al propio repositorio, el campo `language` declara solo `en` pese al nombre "Pashto", y el tamano del repo figura como 0,0 GB. Cualquiera de estos puntos puede romper cargas automaticas en pipelines que dependan de ellos.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; la ausencia de evaluaciones impide cuantificarlo, y es previsible que aumente en idiomas de bajos recursos con menos datos de entrenamiento.
- Cobertura idiomatica incierta: no hay evidencia publicada de que el adaptador mejore el rendimiento en pastun, ni de la variedad o la norma ortografica empleada.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el adaptador hereda las condiciones del modelo base. Si dicho modelo base tuviera una licencia distinta, habria que revisarla antes de explotar el artefacto en produccion.
- Sin garantia de calidad: con 0 descargas y 0 likes, no existe validacion por parte de la comunidad ni informes de terceros.
- Artefacto incompleto por si mismo: es un adaptador, no un modelo desplegable; requiere fusion o carga conjunta con la base, paso no documentado.
- Marcas temporales anomales: las fechas de creacion y actualizacion (2026-09-25) no son verificables, lo que dificulta trazar la procedencia del artefacto.
- No apto para decisiones automatizadas de alto riesgo sin una evaluacion previa especifica del dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nassimjp/LFM2.5-2.6B-Pashto-Zi-b-LoRA-adapter-1
- Repositorio de Unsloth (mencionado en la model card como herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face (mencionada en la model card): https://github.com/huggingface/trl
- Paper, blog o demo del modelo: no disponible en la informacion proporcionada.
