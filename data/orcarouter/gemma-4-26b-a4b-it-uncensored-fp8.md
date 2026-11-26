# orcarouter/Gemma-4-26B-A4B-it-Uncensored-FP8

## Resumen

Gemma-4-26B-A4B-it-Uncensored-FP8 es una variante "abliterated" y sin censura del modelo multimodal Gemma 4 26B A4B IT de Google, publicada por el usuario orcarouter en Hugging Face. Se trata de un modelo de mezcla de expertos (MoE) con aproximadamente 25.800 millones de parametros totales y unos 4.000 millones de parametros activos por token, lo que le permite mantener un coste de inferencia propio de un modelo de 4B pese a su capacidad de 26B. El modelo procesa entradas de imagen y texto (pipeline image-text-to-text) y genera texto conversacional, con soporte declarado para function calling y razonamiento.

La variante "uncensored" o "abliterated" implica que se ha aplicado una tecnica de edicion de pesos (abliteration) para eliminar la direccion de rechazo en el espacio de activaciones, reduciendo los comportamientos de negativa ante peticiones que el modelo base rechazaria. Ademas, los pesos estan cuantizados en FP8 mediante compressed-tensors, lo que reduce el tamano del repositorio a 27,2 GB y facilita el despliegue en vLLM. Es relevante para desarrolladores que necesitan un modelo multimodal MoE con contexto conversacional y sin restricciones de filtrado, aunque con las advertencias legales y eticas que conlleva.

El modelo se distribuye bajo licencia Gemma y con acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face para descargarlo. Solo declara soporte para ingles y chino, lo que limita su uso en castellano sin evaluacion adicional. Con 313 descargas y 31 "me gusta" en el momento de la consulta, es una publicacion de nicho pero con traccion inicial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer, con cuantizacion FP8 (compressed-tensors) |
| Parametros totales | 25.805.936.206 (aprox. 25,8B) |
| Parametros activos | Aproximadamente 4B por token (segun el sufijo A4B) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 (pesos en compressed-tensors); no se documentan otras variantes |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Gemma (terminos de licencia Gemma de Google) |
| Formato de pesos | safetensors (FP8, compressed-tensors) |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |
| Tamano del repositorio | 27,2 GB |
| Modelo base | google/gemma-4-26B-A4B-it |
| Libreria | transformers |
| Pipeline | text-generation / image-text-to-text |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) derivada de Gemma 4 26B A4B IT de Google. La arquitectura MoE permite activar solo una fraccion de los parametros (aproximadamente 4B de los 25,8B totales) por token, lo que reduce el coste computacional de la inferencia frente a un modelo denso del mismo tamano. El modelo base es multimodal (entrada de imagen y texto) e incluye capacidades de razonamiento y function calling segun los tags de la model card.

Sobre el entrenamiento original de Gemma 4 no se dispone de detalles en la informacion proporcionada (numero de tokens, composicion del dataset, uso de RLHF/DPO). La variante publicada por orcarouter aplica dos transformaciones: abliteration (edicion de pesos para eliminar la direccion de rechazo) y cuantizacion FP8 mediante compressed-tensors, orientada al despliegue eficiente en vLLM. No se documentan en la informacion disponible los datos ni el procedimiento exacto de la abliteration, ni si hubo entrenamiento adicional tras la edicion.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Entrada multimodal de imagen y texto (image-text-to-text).
- Razonamiento (tag "reasoning" en la model card).
- Function calling / tool calling.
- Generacion de codigo y matematicas (capacidad esperada del modelo base, no verificada en la informacion disponible).
- Capacidades multilingues limitadas a ingles y chino segun los tags declarados.
- Comportamiento "uncensored": reduccion de rechazos ante peticiones que el modelo base denegaria, mediante abliteration.
- Compatible con endpoints (tag "endpoints_compatible") y despliegue en vLLM.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la abliteration afecta a la distribucion de respuestas y a la tasa de rechazo, comparandolo con el modelo base Gemma 4 26B A4B IT en experimentos controlados.
- Despliegue de bajo coste en produccion: gracias a sus ~4B parametros activos y cuantizacion FP8, puede servirse con vLLM en una GPU de 24-48 GB, ofreciendo latencia de un modelo pequeño con capacidad de uno grande.
- Asistentes conversacionales sin filtrado para dominios creativos: escritura de ficcion, guiones o narrativa con tematicas sensibles donde los filtros del modelo base resultan limitantes, siempre con revision humana.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text, puede extraer y resumir informacion de capturas, diagramas o formularios en ingles y chino.
- Integracion en pipelines con function calling: el soporte de tool calling permite conectarlo a APIs y bases de datos en flujos de automatizacion, con la ventaja del coste reducido del MoE.
- Evaluacion comparativa de cuantizacion FP8: sirve como referencia para medir la perdida de calidad de FP8 frente a BF16 en un MoE multimodal de 26B, usando compressed-tensors y vLLM.
- Prototipado rapido de agentes multi-paso: el razonamiento y el tool calling permiten construir agentes que planifican y ejecutan acciones, con la advertencia de validar el comportamiento sin censura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan aproximadamente 27,2 GB, por lo que se necesitan al menos 32 GB de VRAM para cargar el modelo completo sin offloading; con overhead de KV cache y activaciones, se recomienda 40-48 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB.
- GPU de consumo: cabe en RTX 4090 24 GB solo con offloading parcial a CPU o con cuantizaciones adicionales no documentadas; no es viable en GPUs de 16 GB o menos sin tecnicas agresivas.
- Opciones de despliegue: vLLM (soporte explicito via compressed-tensors), transformers; llama.cpp/Ollama no estan documentados para este formato FP8.
- Latencia y throughput: no disponibles en la informacion proporcionada; se espera un throughput superior al de un denso de 26B gracias a los ~4B parametros activos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|---|
| orcarouter/Gemma-4-26B-A4B-it-Uncensored-FP8 | 25,8B | ~4B | No disponible | Gemma | Gated | Abliterated, FP8, multimodal |
| google/gemma-4-26B-A4B-it | 25,8B | ~4B | No disponible | Gemma | Gated | Modelo base con alineacion estandar |
| Alternativas MoE de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparacion directa con otras alternativas no puede completarse con rigor porque la informacion proporcionada no incluye especificaciones de modelos competidores contemporaneos. La diferencia principal frente al modelo base es la eliminacion de la censura mediante abliteration y la cuantizacion FP8, que reduce el tamano de 27,2 GB y facilita el despliegue en vLLM.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que puede producir contenido ofensivo, ilegal o peligroso; no es adecuado para aplicaciones orientadas al publico sin moderacion externa.
- Riesgo elevado de alucinacion, agravado por la cuantizacion FP8 y por la edicion de pesos, que puede degradar la coherencia en tareas de razonamiento largo.
- Solo declara soporte de ingles y chino; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribucion; debe revisarse antes de cualquier despliegue en produccion. El acceso es gated y requiere aceptar los terminos.
- La cuantizacion FP8 puede introducir perdida de calidad frente a BF16, especialmente en tareas de matematicas y codigo; no se han publicado evaluaciones comparativas.
- No se documentan la longitud de contexto ni el procedimiento exacto de abliteration, lo que dificulta la reproducibilidad.
- El modelo base es de Google; el publicador de esta variante es un tercero (orcarouter) sin afiliacion declarada, por lo que no hay garantias de soporte ni mantenimiento.
- Uso responsable: cualquier despliegue debe incorporar filtros propios, registro de auditoria y revision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/Gemma-4-26B-A4B-it-Uncensored-FP8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Documentacion de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
- No se han encontrado en la informacion proporcionada papers, blogs o demos adicionales especificos de esta variante.
