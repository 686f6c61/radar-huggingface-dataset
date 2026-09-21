# kidzik/jiffy

## Resumen

Jiffy v0.1.0 es un adaptador de inferencia experimental publicado por el usuario kidzik sobre el checkpoint congelado google/diffusiongemma-26B-A4B-it. No es un modelo entrenado de nuevo: el repositorio de HuggingFace no contiene pesos propios, sino codigo fuente, una wheel instalable y evidencia de evaluacion. El runtime descarga el checkpoint original de Google en la revision f7f5b7f5fa82ffc52addd066915886d497f5517b y lo utiliza para producir decisiones tipadas ("typed decisions") sobre documentos e imagenes.

El problema que aborda es el de la prediccion estructurada verificable: en lugar de generar texto libre, Jiffy expone preguntas con tipos acotados (Noul para respuestas booleanas limitadas, Choice y Score para distribuciones completas) y devuelve respuestas acotadas y validas al 100 % en la evaluacion publicada. Esto lo situa como una alternativa open source a servicios de decision estructurada como Jev, del que es independiente y con el que no declara calibracion ni precision equivalentes.

La relevancia actual del proyecto es doble. Por un lado, demuestra un patron de uso de modelos de difusion multimodales como backbones congelados para tareas de clasificacion y extraccion de decisiones, sin reentrenamiento. Por otro, publica una evaluacion reproducible sobre 231 tareas publicas de JevBench con 195 aciertos (84,4 %) y latencias medidas en una H100 80 GB, ademas de reconocer explicitamente limitaciones de calibracion (ECE 0,204 en el nivel dificil) y restricciones severas de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de inferencia sobre un backbone de difusion multimodal (DiffusionGemma) congelado; el adaptador implementa capas de decision tipada (Noul, Choice, Score) y cacheo de ramas por pregunta |
| Parametros totales | 26 000 millones en el modelo base, segun la denominacion google/diffusiongemma-26B-A4B-it; no verificado en la informacion disponible |
| Parametros activos | 4 000 millones, inferido de la nomenclatura A4B del modelo base; no confirmado en la informacion disponible |
| Longitud de contexto | No disponible de forma explicita; la documentacion de requisitos menciona ejecuciones con 32K de contexto mas una imagen |
| Tipos de cuantizacion | Ninguno soportado: no hay runtime cuantizado, ni CPU, ni Apple GPU, ni multi-GPU |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 para el codigo de Jiffy; los pesos de Google se distribuyen por separado bajo sus propios terminos (no especificados en la informacion disponible) |
| Formato de pesos | No aplica: el repositorio no contiene pesos propios (0,0 GB). El runtime descarga el checkpoint upstream de Google; el formato concreto del checkpoint no se detalla |

## Arquitectura y entrenamiento

El repositorio declara explicitamente que libera un adaptador de inferencia y no un checkpoint recien entrenado: no hay pesos especificos de Jiffy ni un proceso de entrenamiento documentado (no se indican tokens, composicion de dataset, RLHF ni DPO). El componente aportado es software: codigo fuente, una wheel instalable en packages/ y documentacion. El backbone es DiffusionGemma, un modelo de difusion multimodal de 26B con 4B activos segun su nomenclatura, que permanece congelado durante la inferencia.

La innovacion tecnica del adaptador esta en el metodo de decision. El adaptador por defecto codifica el documento una sola vez, bifurca caches independientes por pregunta y agrupa ramas de igual longitud en lotes; los niveles de Score se evaluan de forma independiente. Un SDK de imagen con paso compartido ofrece un modo mas rapido, pero que no aisla las preguntas entre si. Los tipos disponibles son Noul (respuesta acotada booleana), Choice y Score (este ultimo expone distribuciones completas). El paquete no es cargable con AutoModel.from_pretrained: requiere la API propia de Jiffy, que a su vez carga el checkpoint upstream.

## Capacidades

- Prediccion estructurada tipada sobre documentos: respuestas acotadas de tipo Noul, Choice y Score, con validacion de formato.
- Exposicion de distribuciones completas de probabilidad en las preguntas de tipo Choice y Score.
- Procesamiento multimodal: soporta documentos e imagenes como entrada, con un SDK especifico para imagenes.
- Codificacion unica de documento con bifurcacion de caches y batching de ramas de igual longitud, para amortizar el coste entre varias preguntas sobre el mismo documento.
- Evaluacion de niveles de Score de forma independiente.
- API HTTP incluida, con instrucciones de instalacion y ejemplos de imagen en INSTALL.md.
- Soporte de codigo personalizado (tag custom-code): el repositorio requiere cargar codigo propio para funcionar.
- No hay evidencia de soporte de tool calling, function calling, agentes, multi-step reasoning, generacion de texto libre, codigo, matematicas, audio o modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Clasificacion de solicitudes de atencion al cliente: el ejemplo de la propia model card evalua si un mensaje ("Please refund the duplicate charge.") contiene una peticion de reembolso mediante una pregunta de tipo Noul, devolviendo un booleano acotado en lugar de texto libre.
- Triage documental por lotes: gracias a la codificacion unica del documento y a la bifurcacion de caches por pregunta, se pueden lanzar varias preguntas tipadas sobre el mismo expediente sin recalcular la codificacion completa.
- Verificacion de decisiones de otros sistemas: el modelo puede actuar como clasificador de comprobacion sobre la salida de un LLM previo, siempre que se validen antes la calibracion y el dominio, dado que las probabilidades no estan calibradas.
- Clasificacion de capturas e imagenes: el SDK de imagen con paso compartido permite etiquetar pantallazos, formularios escaneados o documentacion grafica, asumiendo que ese modo no aisla las preguntas entre si.
- Extraccion de campos con nivel de confianza: el tipo Score devuelve una distribucion sobre niveles, util para enrutar casos dudosos a revision humana, aunque el ECE de 0,204 en el nivel dificil obliga a umbrales conservadores.
- Construccion de harness de evaluacion: el repositorio incluye packages/jevbench-public-20260921.zip con predicciones y procedencia, lo que permite reproducir y auditar el resultado de 195/231 antes de adoptar el sistema.
- Prototipado de APIs de decision tipada: sirve como referencia de implementacion para equipos que quieran exponer decisiones acotadas en lugar de generacion abierta, reutilizando el patron de preguntas tipadas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia |
|---|---|---|
| JevBench publico, 231 tareas sin cambios | 195 correctas (84,4 %) | Jev publicado: 200/231 en los mismos IDs |
| JevBench, nivel facil | 48/48 | No disponible para Jev |
| JevBench, nivel estandar | 68/72 | No disponible para Jev |
| JevBench, nivel dificil | 79/111 | No disponible para Jev |
| Respuestas validas | 100 % | No disponible |
| Latencia local en H100 (mediana) | 259 ms | Excluye red |
| Latencia local en H100 (p95) | 588 ms | Excluye red |
| ECE en nivel dificil (publico) | 0,204 | Probabilidades no calibradas |
| Desviacion de fixture mixto Score frente a inferencia secuencial | 0,0428 | Supera el umbral de equivalencia de 0,03 |

El autor advierte que esta cifra no es la puntuacion completa del benchmark de 534 tareas ni una clasificacion oficial. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM observada: aproximadamente 50 GiB para una imagen pequena con cuatro ramas, y 69 GiB para 32K de contexto mas una imagen con cuatro ramas.
- Precisión validada: BF16. Entorno validado: Linux, Python 3.10 y GPU H100 de 80 GB.
- No cabe en GPU de consumo: no hay soporte de runtime cuantizado, CPU, Apple GPU ni multi-GPU.
- No hay endpoint de inferencia alojado incluido en el repositorio; el despliegue se hace ejecutando la API propia de Jiffy con codigo personalizado.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida en H100 local: 259 ms de mediana y 588 ms de p95, excluyendo la red. Las peticiones cortas de longitud desigual pueden ser mas lentas.
- Throughput: no disponible.

## Comparativa con modelos similares

| Sistema | Parametros | Contexto | Rendimiento en JevBench (231 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jiffy v0.1.0 (adaptador sobre DiffusionGemma) | 26B totales / 4B activos en el backbone | No disponible; se documentan ejecuciones con 32K | 195/231 (84,4 %) | Apache-2.0 (codigo); pesos upstream con terminos propios | HuggingFace + release en GitHub; requiere H100 80 GB |
| Jev (publicado) | No disponible | No disponible | 200/231 | No disponible | Servicio de referencia citado por el autor |
| DiffusionGemma-26B-A4B-it sin adaptador (modelo base) | 26B totales / 4B activos (segun nomenclatura) | No disponible | No disponible | Terminos upstream de Google, no especificados | HuggingFace (google/diffusiongemma-26B-A4B-it) |

No se dispone de datos suficientes en la informacion proporcionada para comparar con otros adaptadores de decision estructurada de la misma categoria.

## Limitaciones y advertencias

- Es una version experimental (v0.1.0) y el propio autor desaconseja su uso para decisiones automatizadas consecuentes sin validacion de dominio.
- Las probabilidades no estan calibradas: ECE publico de 0,204 en el nivel dificil. Una confianza alta no equivale a evidencia verificada.
- El modo mixto de Score mostro una desviacion de 0,0428 frente a la inferencia secuencial, por encima del umbral de equivalencia declarado de 0,03.
- El modo de imagen con paso compartido no aisla las preguntas entre si, a diferencia del adaptador por defecto.
- Solo soporta ingles; no se documentan capacidades multilingues.
- Solo se valido en Linux con Python 3.10, BF16 y una unica H100 de 80 GB. No hay soporte cuantizado, CPU, Apple GPU ni multi-GPU.
- Requiere codigo personalizado y no es cargable con AutoModel.from_pretrained, lo que complica su integracion en pipelines estandar.
- No incluye endpoint de inferencia alojado ni pesos propios; la disponibilidad depende de descargar el checkpoint de Google, sujeto a sus propios terminos.
- La licencia Apache-2.0 cubre el codigo de Jiffy, pero no los pesos upstream ni los recursos del benchmark, que conservan sus condiciones.
- No es un sustituto certificado de Jev y el autor no reclama calibracion ni precision equivalentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni mantenimiento comprobable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kidzik/jiffy
- Checkpoint base: https://huggingface.co/google/diffusiongemma-26B-A4B-it (revision f7f5b7f5fa82ffc52addd066915886d497f5517b)
- Release v0.1.0 en GitHub: https://github.com/kidzik/jiffy/releases/tag/v0.1.0
- Instrucciones de instalacion, API HTTP, ejemplos de imagen y limites del runtime: INSTALL.md (en el repositorio de HuggingFace)
- Informe de evaluacion en JevBench publico: docs/jevbench-public.md
- Predicciones y procedencia: packages/jevbench-public-20260921.zip
- Documentacion de compatibilidad: docs/compatibility.md
- Estado de la release: docs/release.md
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devuelven unicamente resultados sobre el grupo musical Katseye (Wikipedia, YouTube y tienda oficial), sin relacion con este repositorio.
