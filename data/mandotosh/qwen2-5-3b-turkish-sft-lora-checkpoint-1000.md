# Mandotosh/Qwen2.5-3B-Turkish-SFT-LoRA-checkpoint-1000

## Resumen

Qwen2.5-3B-Turkish-SFT-LoRA-checkpoint-1000 es un adaptador LoRA (PEFT) entrenado mediante fine-tuning supervisado (SFT) en turco sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Lo publica el usuario Mandotosh en HuggingFace y su proposito es adaptar un modelo instructivo multilingue de aproximadamente 3 000 millones de parametros al turco sin necesidad de reentrenar ni redistribuir los pesos completos: el repositorio ocupa 0,3 GB e incluye unicamente los pesos del adaptador en safetensors, su configuracion y los ficheros del tokenizer.

Se trata de un checkpoint intermedio, no de un entrenamiento finalizado. El autor indica que el job de entrenamiento se cancelo tras guardar el paso 1000 (24 de junio de 2026) y que la subida se realizo el 15 de octubre de 2026. La procedencia y la composicion del dataset de entrenamiento no han sido auditadas y el conjunto de datos no se distribuye. La evaluacion publicada sobre 100 preguntas del subconjunto publico de TurkishMMLU arroja un 33 % de acierto, sin comparacion con el modelo base en esa misma seleccion.

El interes de esta ficha es acotado y conviene ser explicito: es un artefacto de investigacion util como punto de partida para experimentos de adaptacion al turco, como referencia para reproducir pipelines de LoRA con PEFT, o para estudiar el comportamiento de un adaptador a mitad de entrenamiento. No es un modelo listo para produccion ni existe evidencia publicada de que mejore al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2) del modelo base Qwen2.5-3B-Instruct |
| Parametros totales | No disponible (el autor no publica el recuento del adaptador). Modelo base: 3 000 millones nominales |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No indicada en la model card del adaptador. Heredada del modelo base Qwen2.5-3B-Instruct (32 768 tokens segun la documentacion de Qwen, no verificado en esta ficha). La evaluacion limita el prompt a 1536 tokens |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; en la evaluacion el modelo base se cargo en NF4 4-bit con PEFT. No se publican cuantizaciones GGUF ni AWQ/GPTQ del conjunto fusionado |
| Idiomas soportados | Turco (tr) segun los metadatos del repositorio. El modelo base es multilingue, pero el adaptador no ha sido evaluado en otros idiomas |
| Licencia | No disponible en el repositorio. La model card remite a la licencia del modelo base Qwen/Qwen2.5-3B-Instruct y explicita que la subida no concede derechos adicionales sobre el modelo base ni sobre los datos de entrenamiento |
| Formato de pesos | safetensors (adapter_model.safetensors) con configuracion PEFT; tokenizer incluido (tokenizer.json, tokenizer_config.json) |
| Metodo de adaptacion | LoRA, causal language modeling |
| Rank / alpha / dropout | 32 / 64 / 0,05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Libreria | peft, transformers |
| Pipeline | text-generation (conversacional) |
| Tamano del repositorio | 0,3 GB |
| Hash del adaptador | SHA-256 de adapter_model.safetensors: ec197536c96313bcfdd20fc050fb378bbdb313b06e7855ad15fa3482982e785e |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 15 de octubre de 2026 (ultima actualizacion: 15 de octubre de 2026) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 y alpha 64, con dropout 0,05, aplicado sobre siete proyecciones por capa del transformer Qwen2 del modelo base: las cuatro proyecciones de atencion (q_proj, k_proj, v_proj, o_proj) y las tres del bloque MLP (gate_proj, up_proj, down_proj). El entrenamiento es un SFT causal estandar sobre el modelo instructivo, es decir, se conserva la plantilla de chat del tokenizer original y se ajustan unicamente los pesos de bajo rango. Los pesos del modelo base no se incluyen y deben descargarse por separado; el repositorio solo contiene el adaptador, su configuracion y los ficheros del tokenizer.

No hay innovaciones tecnicas declaradas: no se mencionan decodificacion especulativa, atencion lineal, mezcla de expertos ni tecnicas de RLHF o DPO. El autor tampoco documenta el numero de tokens de entrenamiento, la composicion del dataset, el regimen de aprendizaje ni la perdida alcanzada; solo consta que el job se cancelo tras el paso 1000 y que la procedencia de los datos no ha sido auditada. En el repositorio se excluyen explicitamente el estado del optimizador, el scheduler, el estado del RNG, el estado del trainer y los argumentos de entrenamiento, por lo que no es posible reanudar el entrenamiento desde este checkpoint con la informacion publicada.

## Capacidades

- Generacion de texto conversacional en turco: el ejemplo de uso oficial aplica la plantilla de chat con `apply_chat_template` y `add_generation_prompt=True`, en modo determinista (`do_sample=False`, `max_new_tokens=128`).
- Respuesta a preguntas de conocimiento general y academico en turco, con resultados medibles aunque modestos en el subconjunto de TurkishMMLU evaluado (33/100).
- Herencia de las capacidades del modelo base Qwen2.5-3B-Instruct (instrucciones, razonamiento basico, generacion de codigo y matematicas elementales), si bien el adaptador no ha sido evaluado en ninguna de ellas.
- Soporte de tool calling / function calling: no disponible; no se documenta ni se evalua en el repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no evaluadas. Los metadatos solo declaran turco.
- Capacidad especial: ninguna declarada (sin modo thinking, sin vision, sin audio).
- Evaluacion reproducible: el repositorio incluye el evaluador y el informe bajo el directorio `evaluation/`, con un procedimiento determinista documentado (semilla 123, puntuacion por log-probabilidad media de cuatro variantes superficiales de cada letra de respuesta).

## Casos de uso

- Prototipado de asistentes conversacionales en turco: el adaptador se carga junto al modelo base con `PeftModel.from_pretrained` y usa la plantilla de chat del tokenizer, de modo que se puede desplegar un chatbot turco basico en pocas lineas de codigo y validar si el ajuste mejora las respuestas respecto al modelo base.
- Punto de partida para un SFT completo en turco: dado que es un checkpoint intermedio con configuracion LoRA documentada (rango 32, alpha 64, siete modulos objetivo), sirve como referencia de hiperparametros para reanudar o repetir el entrenamiento con un dataset auditado.
- Investigacion sobre convergencia de adaptadores: al tratarse de un checkpoint del paso 1000 de un job cancelado, es util para estudiar como evoluciona la calidad de un LoRA a lo largo del entrenamiento comparandolo con checkpoints posteriores.
- Adaptacion de dominio sobre turco: partir de este adaptador y continuar el ajuste con datos de un dominio concreto (legal, sanitario, atencion al ciudadano) reduce el coste frente a empezar desde el modelo base sin adaptar.
- Experimentos de cuantizacion y eficiencia: el modelo base cabe en GPU de consumo en NF4 4-bit, lo que permite medir el impacto de la cuantizacion sobre la calidad del adaptador en tareas de comprension lectora en turco.
- Evaluacion comparativa de benchmarks turcos: el evaluador incluido en el repositorio permite replicar la seleccion determinista de 100 preguntas de TurkishMMLU y extenderla a otras selecciones o al modelo base para obtener una linea base real.
- Generacion de material didactico en turco: redaccion de resumenes, preguntas de practica y explicaciones para asignaturas de humanidades, donde el adaptador obtiene sus mejores resultados parciales (filosofia, 9/11), siempre con revision humana.
- Docencia y formacion tecnica: ejemplo completo y minimo de como se empaqueta, se evalua y se documenta un adaptador PEFT, con hash de integridad y trazabilidad de la evaluacion.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a una seleccion determinista de 100 preguntas del subconjunto publico de TurkishMMLU, evaluada el 16 de octubre de 2026 en zero-shot con semilla 123, prompt maximo de 1536 tokens, modelo base cargado en NF4 4-bit y adaptador aplicado con PEFT. Precision global: 33/100 (33 %). El autor advierte que no representa una evaluacion completa de TurkishMMLU y que no se ejecuto comparacion con el modelo base sobre la misma seleccion.

| Asignatura | Correctas | Preguntas |
|---|---:|---:|
| Biology | 7 | 12 |
| Chemistry | 3 | 11 |
| Geography | 4 | 11 |
| History | 1 | 11 |
| Mathematics | 1 | 11 |
| Philosophy | 9 | 11 |
| Physics | 2 | 11 |
| Religion and Ethics | 4 | 11 |
| Turkish Language and Literature | 2 | 11 |
| **Total** | **33** | **100** |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark en la informacion disponible. Tampoco existe una linea base del modelo sin adaptador en la misma seleccion, por lo que no puede afirmarse que el adaptador mejore al modelo original.

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 0,3 GB en disco para los pesos del adaptador y su tokenizer. El coste en memoria es despreciable frente al modelo base.
- VRAM para el modelo base en bf16: en torno a 6,2 GB de pesos mas activaciones y cache KV; en la practica conviene reservar 8-10 GB.
- VRAM para el modelo base en 8-bit: en torno a 3,5 GB de pesos, con 5-7 GB recomendados.
- VRAM para el modelo base en NF4 4-bit (configuracion usada en la evaluacion): en torno a 2,0 GB de pesos, con 4-6 GB recomendados.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB ejecutan sin problema las configuraciones en 4-bit y 8-bit; una RTX 4090 de 24 GB permite bf16 con contexto amplio. En GPUs con 6-8 GB es viable unicamente en 4-bit con prompts cortos.
- GPUs de centro de datos: A100, H100 o L40S son sobredimensionadas para un modelo de 3 000 millones de parametros; solo se justifican para servir muchas replicas concurrentes.
- Despliegue: transformers + peft es la via oficial documentada. vLLM admite adaptadores LoRA en runtime. TGI y Ollama requieren fusionar el adaptador con `merge_and_unload` y, en el caso de llama.cpp/Ollama, convertir el modelo fusionado a GGUF. No se distribuyen pesos fusionados ni cuantizados.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en turco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mandotosh/Qwen2.5-3B-Turkish-SFT-LoRA-checkpoint-1000 | Adaptador LoRA sobre base de 3 000 M | No indicado (base: 32 768 tokens) | 33/100 en seleccion de 100 preguntas de TurkishMMLU | No disponible (remite al modelo base) | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-3B-Instruct (modelo base, sin adaptador) | 3 000 M | 32 768 tokens | No evaluado en la misma seleccion por el autor | Licencia del modelo base de Qwen (no verificada en esta ficha) | HuggingFace, ampliamente descargado |
| Otros adaptadores LoRA o modelos ajustados para turco de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparables de otras alternativas en la informacion proporcionada. La busqueda web realizada no devolvio resultados relevantes sobre este modelo, por lo que la comparativa se limita al modelo base y a la ausencia de linea base publicada.

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento se cancelo tras el paso 1000 y el autor lo declara explicitamente como version no final. La calidad puede ser inferior a la de un entrenamiento completado.
- Sin linea base: no se ejecuto la misma evaluacion sobre Qwen2.5-3B-Instruct sin adaptador, por lo que se desconoce si el ajuste mejora, mantiene o degrada el rendimiento original.
- Muestra de evaluacion reducida: 100 preguntas no permiten extraer conclusiones estadisticamente robustas; el intervalo de confianza de un 33 % con n=100 es amplio. Ademas, la evaluacion se hizo con el modelo base en NF4 4-bit, lo que puede penalizar los resultados frente a bf16.
- Riesgos de alucinacion: son los heredados de un modelo de 3 000 millones de parametros; no se han publicado tasas de fidelidad ni evaluaciones de veracidad.
- Sesgos: no disponible. El autor no documenta analisis de sesgos, y la procedencia y composicion del dataset de entrenamiento no han sido auditadas.
- Limitaciones de idioma: solo se declara y se evalua turco. El comportamiento en castellano u otros idiomas no esta caracterizado y puede degradarse respecto al modelo base.
- Limitacion de contexto en la evaluacion: los prompts se truncaron a 1536 tokens, muy por debajo de la ventana del modelo base, por lo que no hay evidencia sobre tareas de contexto largo.
- Restricciones de licencia: el repositorio no declara licencia propia y remite a la del modelo base. La subida no concede derechos adicionales sobre el modelo base ni sobre los datos de entrenamiento. Antes de cualquier uso comercial es obligatorio verificar los terminos de Qwen/Qwen2.5-3B-Instruct.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha; no hay terceros que hayan reproducido los resultados.
- No reproducible de extremo a extremo: no se incluyen dataset, estado del optimizador, scheduler, RNG, trainer state ni argumentos de entrenamiento.
- Integridad: el unico control disponible es el SHA-256 publicado en la model card; conviene verificarlo tras la descarga.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/Mandotosh/Qwen2.5-3B-Turkish-SFT-LoRA-checkpoint-1000
- Modelo base Qwen/Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Subconjunto de TurkishMMLU usado en la evaluacion: https://github.com/ArdaYueksel/TurkishMMLU/blob/main/turkishmmlu_sub.json
- Informe de evaluacion y evaluador incluidos en el repositorio, bajo el directorio `evaluation/` (no se redistribuyen los textos de las preguntas ni las respuestas por pregunta)
- Busqueda web: no se encontraron resultados relevantes sobre este modelo en las consultas realizadas.
