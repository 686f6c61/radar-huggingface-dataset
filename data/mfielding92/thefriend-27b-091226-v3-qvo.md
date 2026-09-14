# mfielding92/thefriend-27b-091226-v3-qvo

## Resumen

`mfielding92/thefriend-27b-091226-v3-qvo` es un ajuste fino (finetune) publicado por el usuario mfielding92 en Hugging Face el 13 de septiembre de 2026 según los metadatos de la ficha. El modelo declara 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) y un repositorio de 55,6 GB, lo que es coherente con pesos almacenados en precisión completa (bf16/fp16) sin cuantizar. Deriva del checkpoint `mfielding92/thefriend-27b-v3-qvo`, del mismo autor, y se distribuye bajo licencia Apache 2.0 con soporte únicamente para inglés.

La información técnica disponible es mínima. La model card se limita a la plantilla de Unsloth e indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, con una supuesta velocidad de entrenamiento el doble de rápida. No se documentan arquitectura exacta, longitud de contexto, composición del dataset, número de tokens de entrenamiento ni proceso de alineación (RLHF/DPO). El pipeline declarado es `image-text-to-text` y entre las etiquetas aparece `qwen3_5`, lo que apunta a la familia Qwen3.5 y a capacidades multimodales de entrada, aunque ninguna de las dos cosas se confirma de forma explícita en la documentación.

Su relevancia práctica es limitada: acumula 0 descargas y 0 "me gusta" en el momento de redactar esta ficha, y no se ha publicado ninguna evaluación. Resulta útil sobre todo como ejemplo de flujo de trabajo de ajuste fino de bajo coste con Unsloth sobre un modelo denso de ~27 B, y como posible punto de partida para quien quiera reproducir o auditar dicho pipeline, siempre con validación propia previa a cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen3_5` sugiere la familia Qwen3.5, sin confirmacion en la informacion proporcionada) |
| Parametros totales | 27.781.427.952 (27,8 B), dato de safetensors |
| Parametros activos | no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors en precision completa (55,6 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline declarado | image-text-to-text |
| Modelo base | mfielding92/thefriend-27b-v3-qvo |
| Tamano del repositorio | 55,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun ficha) | 2026-09-13 |
| Ultima actualizacion (segun ficha) | 2026-09-13 |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos en la informacion proporcionada. La etiqueta `qwen3_5` y la libreria declarada (`transformers`) apuntan a un transformer de la familia Qwen3.5, y el pipeline `image-text-to-text` sugiere que el modelo acepta imagenes ademas de texto, pero ninguna de estas dos afirmaciones viene confirmada por la model card ni por documentacion adicional. Tampoco se especifica si se trata de un modelo denso o de una mezcla de expertos (MoE); el recuento de 27,8 B de parametros totales es el unico dato disponible al respecto.

Sobre el entrenamiento, la model card unicamente indica que se trata de un finetune de `mfielding92/thefriend-27b-v3-qvo` realizado con Unsloth y TRL, y que el proceso fue "2 veces mas rapido" gracias a Unsloth. No hay informacion sobre el numero de tokens, la composicion del dataset, la longitud de secuencia de entrenamiento, el uso de LoRA/QLoRA frente a ajuste completo, ni sobre fases de RLHF, DPO o cualquier otro tipo de alineacion. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto en ingles: la etiqueta `text-generation-inference` y el pipeline declarado confirman esta capacidad basica.
- Conversacion multi-turno: el modelo esta etiquetado como `conversational`, orientado a dialogos.
- Entrada multimodal (imagen + texto): el pipeline `image-text-to-text` implica procesamiento de imagenes junto a texto, aunque no se detalla la resolucion admitida ni el tipo de tareas de vision soportadas.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en la infraestructura de Inference Endpoints de Hugging Face.
- Ajuste fino adicional: al estar entrenado con Unsloth y TRL, es plausible continuar el ajuste con esas herramientas, aunque no se documenta ningun procedimiento.
- Tool calling / function calling: no disponible; no se menciona en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible; no se menciona.
- Modo "thinking" explicito: no disponible; no se menciona.
- Soporte multilingue: no; el modelo declara unicamente `en`.
- Rendimiento en codigo, matematicas o vision medido: no disponible; sin benchmarks publicados.

## Casos de uso

Los siguientes escenarios son plantillas de aplicacion condicionadas a una validacion previa por parte del usuario, dado que el modelo no tiene evaluaciones publicadas ni historial de uso.

- Prototipado de asistentes conversacionales en ingles: el modelo esta etiquetado como conversacional y puede emplearse para construir un chatbot de dominio cerrado en fase de prueba, asumiendo que habra que medir manualmente la tasa de alucinacion y la coherencia multi-turno antes de exponerlo a usuarios.
- Reproduccion del pipeline de ajuste fino con Unsloth: dado que la model card documenta el uso de Unsloth y TRL, sirve como punto de referencia para equipos que quieran medir el coste real de un finetune de ~27,8 B en precision completa frente a alternativas QLoRA.
- Experimentos de vision-lenguaje en ingles: el pipeline `image-text-to-text` permite probar tareas de descripcion de imagenes o respuesta a preguntas visuales (VQA), siempre midiendo aparte la calidad, ya que no hay evaluaciones publicadas ni detalles del encoder visual.
- Generacion de texto asistida sobre corpus propios: util como base para tareas de redaccion o resumen en ingles dentro de un dominio concreto, con un ciclo de evaluacion humana que determine si el finetune aporta mejoras frente al checkpoint base `thefriend-27b-v3-qvo`.
- Estudio de ablacion entre checkpoints: comparar `thefriend-27b-v3-qvo` con esta variante `091226-v3-qvo` permite analizar que cambios introduce un ajuste posterior, con la misma arquitectura y el mismo recuento de parametros declarado.
- Despliegue interno no critico mediante TGI: la etiqueta `text-generation-inference` permite levantar el modelo con Text Generation Inference para pruebas internas, sin garantias de latencia ni de calidad para cargas de produccion.
- Servicio de chat de bajo volumen en ingles: para equipos que ya dispongan de GPU con suficiente memoria y quieran un asistente interno, el modelo puede ejecutarse en precision completa o cuantizado, con monitorizacion manual de respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar en la model card ni en los resultados de busqueda. Tampoco se han publicado mediciones de latencia, throughput o consumo de memoria.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parametros declarado (27,78 B); no proceden de mediciones publicadas por el autor.

- Precision completa (bf16/fp16): 27,78 B x 2 bytes = 55,6 GB solo de pesos, mas cache KV y activaciones. Requiere del orden de 60-70 GB de VRAM para contextos cortos.
- GPUs recomendadas para precision completa: H100 80 GB, A100 80 GB o 2 x A100 40 GB con paralelismo tensorial. En 2 x RTX 4090 (48 GB) no cabe sin offloading a CPU o cuantizacion.
- Cuantizacion a 8 bits (bitsandbytes o similar): aproximadamente 28-32 GB de pesos, unos 32-38 GB de VRAM en total; viable en A100 40 GB o en 2 x RTX 4090.
- Cuantizacion a 4 bits (NF4, GPTQ o AWQ): aproximadamente 14-16 GB de pesos; el modelo cabria en una RTX 4090 o RTX 3090 de 24 GB con contexto moderado. En tarjetas de 16 GB quedaria muy ajustado y probablemente requeriria contexto corto u offloading.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits, en RTX 4090, RTX 3090 o RTX 5090 (24-32 GB). No cabe en precision completa ni en 8 bits en una sola GPU de consumo.
- Opciones de despliegue: transformers (declarado en la ficha), Text Generation Inference (etiquetas `text-generation-inference` y `endpoints_compatible`), Unsloth para entrenamiento y ajuste. El uso con vLLM es probable al tratarse de safetensors, pero no esta confirmado en la informacion disponible.
- llama.cpp, Ollama o LM Studio: no hay ficheros GGUF publicados en el repositorio, por lo que requeriria una conversion previa por parte del usuario.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de comparacion en la informacion proporcionada. La busqueda web no devolvio resultados relevantes sobre este modelo ni sobre su modelo base: los resultados obtenidos eran paginas de soporte tecnico sin relacion con el modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| mfielding92/thefriend-27b-091226-v3-qvo | 27,78 B | no disponible | Apache 2.0 | 0 descargas, 0 likes | sin benchmarks publicados |
| mfielding92/thefriend-27b-v3-qvo (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de ~27 B de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

Unicamente puede compararse este checkpoint con su propio modelo base, y solo en el recuento de parametros y la licencia declarada; no hay datos de contexto, rendimiento ni calidad para ninguno de los dos.

## Limitaciones y advertencias

- Ausencia total de validacion: 0 descargas y 0 likes, sin evaluaciones publicadas ni casos de uso documentados. Cualquier uso en produccion exige una evaluacion propia previa.
- Model card practicamente vacia: se limita a la plantilla de Unsloth y no documenta dataset, hiperparametros, longitud de contexto ni metodologia de alineacion.
- Linaje de finetunes encadenados: es un finetune de otro finetune del mismo autor, lo que dificulta atribuir el comportamiento observado a una fase concreta del entrenamiento.
- Idioma: solo ingles declarado. No hay soporte documentado de castellano ni de otras lenguas.
- Longitud de contexto desconocida, lo que impide planificar cargas con documentos largos o conversaciones extensas sin medirlo previamente.
- Riesgo de alucinacion: al no haber datos de alineacion ni evaluaciones, no puede estimarse la fiabilidad factual. Se asume un riesgo alto en dominios especializados.
- Sesgos: desconocidos. Al no documentarse la composicion del dataset de ajuste, no es posible evaluar sesgos de genero, raza, ideologia o dominio.
- Licencia: Apache 2.0 declarada, permisiva para uso comercial, pero conviene verificar la licencia del modelo base `thefriend-27b-v3-qvo` y la del modelo original de la familia Qwen3.5, ya que las condiciones pueden heredarse.
- Coste de despliegue elevado: 55,6 GB en precision completa; no hay versiones cuantizadas ni GGUF publicadas, lo que obliga a cuantizar por cuenta propia para entornos con menos de 60 GB de VRAM.
- Anomalia en las fechas: la ficha indica creacion el 2026-09-13, una fecha posterior a la habitual en el momento de la consulta; conviene verificarla antes de citarla.
- Capacidades multimodales sin detalle: aunque el pipeline es `image-text-to-text`, no se documenta el encoder visual, la resolucion de entrada ni las tareas de vision soportadas.
- Sin informacion sobre tool calling ni uso como agente, lo que descarta su integracion en pipelines automatizados que dependan de llamadas a funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mfielding92/thefriend-27b-091226-v3-qvo
- Modelo base: https://huggingface.co/mfielding92/thefriend-27b-v3-qvo
- Repositorio de Unsloth (mencionado en la model card): https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face (mencionada en la model card): https://github.com/huggingface/trl
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su modelo base ni su autor; los enlaces obtenidos correspondian a paginas de soporte tecnico sin relacion con el contenido de esta ficha.
