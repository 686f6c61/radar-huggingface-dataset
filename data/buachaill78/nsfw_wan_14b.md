# buachaill78/NSFW_Wan_14b

## Resumen

NSFW Wan 14B T2V es un ajuste fino del modelo Wan-AI/Wan2.1-T2V-14B, desarrollado por el usuario buachaill78, orientado a la generacion de video corto a partir de texto con contenido explicito para adultos. Se distribuye principalmente en formato GGUF (con checkpoints en safetensors) y cuenta con 14.288.491.584 parametros (aproximadamente 14,3 mil millones), lo que lo situa en la gama alta de los modelos de difusion transformer para texto-a-video disponibles en abierto.

El modelo parte de la arquitectura de difusion transformer de Wan 2.1, adaptada mediante un entrenamiento unificado sobre un corpus mixto de 30.000 clips de video y 20.000 imagenes fijas, extraido de las 1.000 publicaciones mas destacadas de unas 1.250 comunidades de Reddit de contenido adulto. El autor declara que este enfoque de entrenamiento mixto en una sola fase reduce la deriva anatomica y el colapso de calidad tipicos de los entrenamientos por fases.

Su relevancia es acotada pero concreta: cubre un nicho (generacion de video NSFW) practicamente ausente en los modelos comerciales y en la mayoria de los open source, y se presenta explicitamente como base estable para el entrenamiento de LoRAs especializados. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y el modelo no publica benchmarks ni evaluaciones cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion texto-a-video (basado en Wan-AI/Wan2.1-T2V-14B) |
| Parametros totales | 14.288.491.584 (aprox. 14,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio se etiqueta como gguf); niveles concretos no disponibles |
| Idiomas soportados | no disponibles (los prompts de entrenamiento provienen de comunidades en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (checkpoints por epoch) y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de difusion transformer de Wan2.1-T2V-14B, orientada a la generacion de video a partir de descripciones textuales. El autor no detalla la configuracion interna (numero de capas, dimensiones ocultas, mecanismo de atencion espaciotemporal ni codificador de texto empleado), por lo que estos datos deben consultarse en la documentacion del modelo base.

El ajuste fino se realizo con una configuracion unica y estable a lo largo de 15 epochs, con learning rate constante precedido de un warmup y tamanos de lote optimizados para la arquitectura de 14B. El entrenamiento utilizo clips de 17 fotogramas a 480p y combino simultaneamente 30.000 videos y 20.000 imagenes fijas. El autor sostiene que esta mezcla aporta regularizacion espacial continua y evita la degradacion anatomica que atribuye a los entrenamientos multifase. El dataset se construyo a partir de las 1.000 publicaciones principales de aproximadamente 1.250 subreddits NSFW, y las leyendas de entrenamiento reutilizan las convenciones de etiquetado de esas comunidades. Se publican 15 checkpoints intermedios, y el autor recomienda `wan_14B_e15.safetensors` tanto para uso general como para entrenamiento de LoRAs. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de video corto (tipicamente de unos pocos segundos) a partir de prompts en lenguaje natural, con movimiento generado de forma nativa sin necesidad de LoRAs de movimiento externas.
- Especializacion en contenido explicito para adultos: escenarios, esteticas, arquetipos de personajes y acciones descritas en texto.
- Entrenamiento con 17 fotogramas por clip a 480p, lo que condiciona la duracion y resolucion practicas de salida.
- Capacidad declarada de mantener consistencia temporal y coherencia anatomica dentro de la ventana de generacion.
- Base para entrenamiento de LoRAs: el autor la presenta como su principal fortaleza, con datasets de LoRA centrados solo en el concepto, personaje o estilo objetivo.
- Incluye `prompting-guide.json` con vocabulario y frases asociadas a las comunidades de origen para orientar la redaccion de prompts.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision de entrada, audio ni modo de pensamiento; es un modelo generativo de video, no un LLM conversacional.
- Capacidades multilingues: no documentadas; el entrenamiento se apoya en leyendas en ingles.

## Casos de uso

- Generacion de clips para produccion de contenido para adultos: el modelo traduce un prompt descriptivo en un video corto de 17 fotogramas a 480p, adecuado para prototipado rapido de escenas y variaciones de estilo.
- Base para LoRAs de personaje o estilo: partiendo de `wan_14B_e15.safetensors`, un estudio puede entrenar adaptadores de bajo rango centrados en un unico personaje o estetica, aprovechando que el modelo base ya cubre anatomia y movimiento coherentes.
- Exploracion de conceptos y previsualizacion: guionistas y artistas pueden iterar prompts y consultar `prompting-guide.json` para alinear el vocabulario con el que el modelo fue entrenado y validar ideas antes de una produccion mayor.
- Investigacion sobre sesgos y seguridad en modelos generativos: el modelo permite estudiar como un ajuste fino sobre datos de comunidades concretas modela la representacion de cuerpos, acciones y esteticas, y sirve para evaluar filtros y clasificadores de contenido.
- Pruebas de pipelines de inferencia con cuantizacion GGUF: util para medir el comportamiento de la arquitectura Wan 2.1 de 14B en entornos con VRAM limitada y comparar fidelidad frente a los pesos en safetensors.
- Generacion de material para plataformas de contenido verificado: en entornos con control de edad y cumplimiento legal, el modelo puede alimentar flujos de produccion de clips cortos con requisitos de coherencia temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud para un modelo de difusion de 14B, los pesos en precision completa rondan los 28 GB (fp16) y unos 14 GB en cuantizacion de 8 bits; las cifras exactas para este repositorio no estan documentadas.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, un modelo de 14B en fp16 requiere GPUs de clase profesional con 40-80 GB (A100, H100) o configuraciones multi-GPU.
- Cabe en GPU de consumo: no confirmado. Las variantes GGUF podrian permitir su ejecucion en GPUs con 24 GB o menos segun el nivel de cuantizacion, pero el autor no publica requisitos ni pruebas.
- Opciones de despliegue: el autor indica usar "el pipeline de inferencia preferido compatible con esta arquitectura" sin especificar herramientas. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI; la etiqueta gguf sugiere compatibilidad con runners de ese formato, sin verificacion documentada.
- Latencia y throughput: no disponibles.
- Tamano del repositorio: 455,1 GB, lo que refleja los 15 checkpoints en safetensors y las variantes GGUF; conviene descargar solo el checkpoint necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| NSFW Wan 14B T2V (este) | 14,3 B | Texto-a-video, ajuste NSFW | 17 fotogramas a 480p | creativeml-openrail-m | HuggingFace, 0 descargas |
| Wan-AI/Wan2.1-T2V-14B (base) | 14 B | Texto-a-video general | no disponible en esta ficha | no disponible en esta ficha | HuggingFace |
| Alternativas texto-a-video open source de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con otros modelos de la misma categoria no esta disponible en la informacion proporcionada; el unico contraste documentado es con su modelo base, del que hereda arquitectura y parametros pero del que se diferencia por el ajuste fino sobre datos NSFW.

## Limitaciones y advertencias

- Sesgo marcado hacia el contenido de los subreddits de origen: el autor advierte que el rendimiento en prompts SFW sera probablemente deficiente.
- Riesgo de artefactos: el autor reconoce que, pese a la calidad declarada, pueden aparecer artefactos y perdida de especificidad en escenas complejas.
- Contenido explicito: el modelo genera material para adultos y el repositorio esta marcado como no apto para todas las audiencias; requiere verificacion de edad y cumplimiento normativo en cualquier despliegue.
- Alucinacion visual: no hay evaluacion publicada sobre fidelidad al prompt ni sobre coherencia temporal mas alla de las afirmaciones del autor.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos y obligacion de propagar las restricciones a derivados); conviene revisar los terminos completos antes de produccion.
- Idiomas: no se documenta soporte multilingue; los prompts en castellano pueden degradar la calidad frente al ingles.
- Datos de entrenamiento: el corpus proviene de contenido publicado en Reddit, con las implicaciones de derechos, consentimiento y privacidad que ello conlleva.
- Madurez del proyecto: cero descargas y cero likes, sin benchmarks ni validacion externa; no hay garantia de mantenimiento ni soporte mas alla del Discord del autor.
- Requisitos de hardware no documentados: el tamano del repositorio (455,1 GB) y la ausencia de guias de despliegue complican la puesta en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/buachaill78/NSFW_Wan_14b
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Discord del autor: https://discord.gg/mjnStFuCYh
- Papers, blogs o repositorios adicionales: no disponibles en la informacion proporcionada.
