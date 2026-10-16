# brandonmusic/Step-5-Preview-NVFP4-Local

## Resumen

Step-5-Preview-NVFP4-Local es una compilacion cuantizada del modelo multimodal Step 5 Preview de StepFun AI, publicada por el usuario independiente brandonmusic. No es un modelo nuevo: parte de `stepfun-ai/Step-5-Preview-NVFP4` (revision `bc246cc2848e17b37f377eda8fd825c5b3018d1f`) y modifica la representacion de las escalas de cuantizacion para reducir el peso en disco de 394,2 GB a 347,8 GB, un ahorro de 46,4 GB (11,8%). El objetivo declarado es que el modelo quepa en cuatro GPU de 96 GB con paralelismo de tensores 4, esto es, unos 86,9 GB (81,0 GiB) por GPU.

El modelo subyacente es un mixture of experts disperso de StepFun con entrada de texto e imagen. La model card del modelo base declara 600.000 millones de parametros totales y 27.000 millones activos, con hasta 1.000.000 de tokens de contexto, aunque el recuento real de tensores safetensors de este repositorio da 329.215.559.236 parametros, una discrepancia que conviene tener presente. La cuantizacion es NVFP4 de 4 bits en los expertos enrutados de las 88 capas MoE, con el resto del modelo en BF16.

Su relevancia es doble. Por un lado, demuestra una tecnica concreta de compresion de escalas (el formato CSF, introducido con `nvidia/Qwen3.8-Flash-Next-FP4-Local`) aplicada a un modelo de gran tamano. Por otro, y esto es importante para produccion, el propio autor advierte de que la divergencia KL frente al modelo BF16 no se ha medido, que la implementacion de referencia BF16 no supero una comprobacion de causalidad y que el contenedor de servicio incluido solo se ha probado en CPU. Es material de investigacion, no un artefacto validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts disperso multimodal; 88 capas MoE (capas 3 a 90), expertos enrutados y compartidos, atencion de ventana deslizante, SwiGLU, capas MTP y torre de vision |
| Parametros totales | 329.215.559.236 segun el recuento de tensores safetensors del repositorio; la model card del modelo base declara 600.000 millones |
| Parametros activos | 27.000 millones (segun la model card del modelo base) |
| Longitud de contexto | Hasta 1.000.000 de tokens (segun la model card del modelo base; no verificado en este repositorio) |
| Tipos de cuantizacion | NVFP4 (4 bits, E2M1) con escalas de bloque E4M3 y `group_size` 16 en las capas 3 a 87; `W4A16_NVFP4` en las capas 88 a 90; configuracion `MIXED_PRECISION` de modelopt; escalas almacenadas en formato CSF |
| Idiomas soportados | no disponible |
| Licencia | stepfun-model-license-1.0 (licencia propia de StepFun, no estandar; textos en `LICENSE.txt` y `LICENSE-CN.txt`) |
| Formato de pesos | safetensors (indexado con `model.safetensors.index.json` y `SHA256SUMS`) |
| Expertos enrutados por capa | 352 |
| Formas de las proyecciones MoE | `gate` y `up`: [352, 1536, 256]; `down`: [352, 4096, 96]; una escala E4M3 por cada 16 pesos |
| Bytes de tensores | 347.771.251.120 (347,8 GB) |
| Tamano del repositorio | 401,3 GB |
| Paralelismo requerido | Tensores en 4 GPU (TP4), ~86,9 GB por GPU |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es la de Step 5 Preview, desarrollada por StepFun AI, y no se modifica en este repositorio. Se trata de un transformer de mezcla de expertos disperso con 88 capas MoE situadas entre las capas 3 y 90, 352 expertos enrutados por capa, expertos compartidos, enrutadores, atencion de ventana deslizante y activaciones SwiGLU con limitador. El modelo acepta texto e imagen como entrada (torre de vision incluida) y declara contexto de hasta 1.000.000 de tokens. Incluye capas MTP (multi-token prediction). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otro tipo de ajuste por preferencias: esos datos no aparecen en la informacion proporcionada.

Lo especifico de este repositorio es el trabajo de cuantizacion sobre los pesos de los expertos. En las capas 3 a 87 se conserva la cuantizacion NVFP4 original de StepFun, pero cada tensor de escalas `weight_scale` (F8_E4M3, forma [352, R, C]) se reempaqueta en tres tensores CSF que codifican los mismos bytes de escala, con lo que ese bloque pasa de 35.295.068.160 a 18.154.837.272 bytes (51,44%). En las capas 88 a 90, que StepFun mantuvo en BF16 tanto en su version FP8 como en la NVFP4, el autor aplica cuantizacion NVFP4 completa: `weight` en U8 con pares E2M1, `weight_scale_2` en F32 y escalas de bloque en CSF, dejando las activaciones en BF16 (de ahi el `W4A16_NVFP4`); ese bloque baja de 39.862.665.216 a 10.609.303.320 bytes. El resto del modelo (atencion, expertos compartidos, enrutadores, capas densas, capas MTP, embeddings, `lm_head`, torre de vision, tokenizer y chat template) permanece como lo publico StepFun. El autor incluye informes de integridad (`csf-report.json`, `bf16-experts-nvfp4-report.json`, `bf16-layer-sensitivity.json`) y reporta un error cuadratico medio normalizado a nivel de peso del 0,903% en las capas 88 a 90 y del 0,900% en las capas 85 a 87, con curtosis y colas similares.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo, con hasta 1.000.000 de tokens segun la model card del modelo base.
- Entrada multimodal de imagen y texto (`pipeline_tag: image-text-to-text`), con torre de vision presente en el checkpoint.
- Razonamiento y codigo: no documentado de forma especifica en la informacion disponible; se hereda lo que ofrezca el modelo base Step 5 Preview, sin datos publicados aqui.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio esta vacio.
- Prediccion multi-token mediante capas MTP (capacidad arquitectonica, sin datos de rendimiento publicados).
- Carga eficiente de escalas: el loader b12x mantiene los planos de escala comprimidos residentes y expande las escalas de una capa MoE en memoria compartida cuando esa capa se ejecuta, de modo que el ahorro de CSF aplica tambien a memoria de GPU.

## Casos de uso

- Analisis de documentos tecnicos extensos con figuras: el modelo acepta imagen y texto y declara hasta 1M de tokens de contexto, por lo que podria procesar manuales, planos o informes escaneados junto con su texto asociado en una sola pasada. La ausencia de medicion de fidelidad de la cuantizacion obliga a validar la salida en el dominio concreto antes de usarla.
- Despliegue autoalojado en un nodo de cuatro GPU de 96 GB: el recorte de 394,2 GB a 347,8 GB es lo que permite que los pesos entren en 4x96 GB con TP4 (~86,9 GB por GPU), lo que habilita servir el modelo en infraestructura propia sin recurrir al checkpoint original.
- Procesamiento por lotes de contenido multimodal en un pipeline interno: clasificacion, extraccion y resumen de imagenes con texto adjunto (tickets, formularios, capturas) ejecutado en cola, donde la latencia no es critica y el ahorro de memoria por GPU si lo es.
- Investigacion sobre cuantizacion de modelos MoE: el repositorio documenta paso a paso la conversion de escalas a CSF y la cuantizacion de capas que el autor original dejo en BF16, con informes de sensibilidad por capa, lo que lo convierte en material de referencia para estudiar NVFP4 en capas MoE de gran tamano.
- Evaluacion comparativa de fidelidad: sirve como punto de partida para medir la divergencia KL frente a `stepfun-ai/Step-5-Preview-BF16` que el propio autor no llego a calcular, ya que los pesos estan completos y el checkpoint es reproducible a partir de la revision indicada.
- Asistente conversacional interno con contexto largo sobre corpus propios: la ventana declarada de 1M de tokens permite mantener historiales muy largos o bases documentales enteras en contexto, siempre que el operador asuma la falta de validacion de calidad de este checkpoint concreto.
- Banco de pruebas de infraestructura de servicio: util para medir memoria real, expansion de escalas CSF y comportamiento del loader b12x en cuatro GPU, antes de invertir en validar el modelo a nivel de precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se ha medido la divergencia KL frente al modelo BF16, que la implementacion de referencia BF16 ejecutada capa a capa no supero una comprobacion de causalidad y que no se publica ninguna cifra de fidelidad. Los unicos numeros publicados son de nivel de peso (NMSE de cuantizacion del 0,903% en las capas 88 a 90 y del 0,900% en las capas 85 a 87) y de tamano (bytes por bloque). No hay datos de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada: unos 86,9 GB (81,0 GiB) por GPU con paralelismo de tensores 4 sobre un total de 347,8 GB de tensores. El autor no publica cifras de memoria de activaciones ni de cache KV para la ventana de 1M de tokens.
- GPU objetivo: cuatro GPU de 96 GB. Encajan H100 de 96 GB, H200, B200 y aceleradores con al menos 96 GB por dispositivo (por ejemplo MI300X de 192 GB, aunque no esta documentado). No esta pensado para nodos de 80 GB.
- GPU de consumo: no cabe. El modelo no entra en ninguna GPU consumer actual, ni siquiera repartido, por el tamano total de los pesos.
- Opciones de despliegue: el repositorio incluye un directorio `serving/` con una imagen de servicio que, segun el autor, solo se ha comprobado en CPU y no se ha ejecutado en GPU. El loader b12x es el que gestiona la expansion de escalas CSF. No hay documentacion en la informacion proporcionada sobre soporte en vLLM, TensorRT-LLM, SGLang, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor no hace ninguna afirmacion de rendimiento en servicio.
- Almacenamiento: el repositorio ocupa 401,3 GB, por lo que conviene prever ese espacio en disco ademas de la memoria de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bytes de tensores | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| brandonmusic/Step-5-Preview-NVFP4-Local | 329.215.559.236 (safetensors); la model card base declara 600.000 M totales / 27.000 M activos | Hasta 1M tokens (segun modelo base) | 347,8 GB | NVFP4 + CSF, capas 88-90 cuantizadas por el autor | stepfun-model-license-1.0 | 0 descargas; fidelidad no medida; `serving/` solo probado en CPU |
| stepfun-ai/Step-5-Preview-NVFP4 | Mismas cifras del modelo base | Hasta 1M tokens | 394,2 GB | NVFP4 de StepFun, capas 88-90 en BF16 | stepfun-model-license-1.0 | Referencia directa de la que deriva este repositorio |
| stepfun-ai/Step-5-Preview-BF16 | Mismas cifras del modelo base | Hasta 1M tokens | no disponible | BF16 | stepfun-model-license-1.0 | Referencia de fidelidad citada en la model card (revision `7734b7ffac118d70d8398bfa3eb0fab007eb45b1`) |
| stepfun-ai/Step-5-Preview | Mismas cifras del modelo base | Hasta 1M tokens | no disponible | FP8; `modules_to_not_convert` empieza por las capas 88-90 | stepfun-model-license-1.0 | Release cuantizado original de StepFun |

Como referencia de la tecnica, el formato CSF se introdujo con `nvidia/Qwen3.8-Flash-Next-FP4-Local`, un modelo distinto que no es comparable en tamano ni en tarea con este.

## Limitaciones y advertencias

- No hay cifra de fidelidad publicada: la divergencia KL frente al modelo BF16 no se ha medido y el autor no reclama ningun valor de fidelidad.
- La implementacion de referencia BF16 de StepFun, ejecutada capa a capa, no paso una comprobacion de causalidad, lo que impide cerrar la comparacion de fidelidad.
- El directorio `serving/` solo se ha comprobado en CPU y no se ha ejecutado en GPU; no hay ninguna afirmacion de precision ni de servicio en este repositorio.
- Los pesos no son identicos a los de StepFun: las capas 88 a 90, que el autor original dejo en BF16, se han cuantizado a NVFP4. Las comparaciones publicadas son a nivel de peso (NMSE), no a nivel de salida.
- Las escalas de bloque se almacenan en formato CSF, no en safetensors convencionales; consumir el checkpoint requiere un loader que entienda ese formato (b12x). No es un checkpoint safetensors estandar.
- Licencia no estandar: se aplica la StepFun Model License 1.0, con textos en chino e ingles. Hay que revisar los terminos antes de cualquier uso comercial; el repositorio es una modificacion declarada bajo la seccion 2(a) de dicha licencia.
- El repositorio no esta afiliado ni respaldado por StepFun AI, segun declara el propio autor.
- Idiomas soportados: no disponibles en la ficha del repositorio.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser un derivado del modelo base, heredaria los suyos, que tampoco se documentan aqui.
- Riesgo de alusionacion: no cuantificado en la informacion disponible, pero la cuantizacion agresiva a 4 bits en los expertos enrutados y la ausencia de validacion de salida lo convierten en un factor a evaluar antes de cualquier uso en produccion.
- Adopcion nula: 0 descargas y 0 me gusta en el momento de la consulta, sin comunidad que haya reportado resultados independientes.
- Coste de infraestructura elevado: 347,8 GB de pesos, cuatro GPU de 96 GB y 401,3 GB de repositorio hacen inviable cualquier evaluacion casual.

## Enlaces

- Repositorio del modelo: https://huggingface.co/brandonmusic/Step-5-Preview-NVFP4-Local
- Modelo base cuantizado: https://huggingface.co/stepfun-ai/Step-5-Preview-NVFP4
- Modelo original Step 5 Preview: https://huggingface.co/stepfun-ai/Step-5-Preview
- Referencia BF16: https://huggingface.co/stepfun-ai/Step-5-Preview-BF16
- Licencia StepFun Model License 1.0: https://huggingface.co/stepfun-ai/Step-5-Preview/blob/main/LICENSE.txt
- Origen del formato CSF: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Busqueda web: no se han encontrado enlaces relevantes sobre este modelo en los resultados disponibles; los resultados devueltos no guardan relacion con el modelo ni con IA open source.
