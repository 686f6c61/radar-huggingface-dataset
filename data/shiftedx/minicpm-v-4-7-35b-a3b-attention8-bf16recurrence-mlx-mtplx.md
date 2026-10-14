# Shiftedx/MiniCPM-V-4.7-35B-A3B-Attention8-BF16Recurrence-MLX-MTPLX

## Resumen

MiniCPM-V 4.7 35B-A3B-Attention8-BF16Recurrence-MLX-MTPLX es una cuantizacion mixta en formato MLX del modelo multimodal MiniCPM-V 4.7 35B-A3B, publicado por el usuario Shiftedx a partir del checkpoint BF16 original de openbmb. No se trata de un modelo nuevo ni de un ajuste fino: la model card indica explicitamente que se preservan el tokenizador, la plantilla de chat, el procesador de imagenes y los pesos de vision en BF16 del modelo padre, sin editar el comportamiento ni reentrenar. El artefacto resultante ocupa 22,17 GiB y contiene 2.096 arrays almacenados.

El interes de esta publicacion es de ingenieria de cuantizacion: aplica una seleccion de precision distinta por tipo de modulo (8 bits para atencion, embeddings, cabecera de salida, routers y los ultimos ocho MLP de expertos compartidos; 4 bits para los expertos conmutados del MoE y MLP compartidos anteriores; BF16 para 60 proyecciones de entrada recurrentes y los 453 tensores de la ruta de vision). De los 452 modulos cuantizados, 236 quedan a 8 bits y 216 a 4 bits. La acumulacion de la recurrencia se mantiene en float32.

El paquete se distribuye junto con un adaptador MTPLX cualificado y decodificacion especulativa DSpark, y esta orientado exclusivamente a Macs con Apple Silicon. Requiere MLX 0.32.2, MLX-LM 0.31.3, Transformers 5.14.1, MTPLX 2.12.2 y MLX-VLM 0.7.8, con parches de correccion aplicados sobre esas revisiones exactas. La relevancia actual es acotada: permite ejecutar un modelo vision-lenguaje MoE de 35.212.875.824 parametros en hardware de consumo Apple, con una fidelidad declarada frente al padre BF16 de 0,000834 nats de KL media en 11 casos, pero sin benchmarks estandar publicados y sin descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) con mezcla de expertos (MoE) y proyecciones de entrada recurrentes; formato MLX |
| Parametros totales | 35.212.875.824 (~35,2 B) |
| Parametros activos | ~3 B (deducido de la nomenclatura A3B del nombre; no confirmado en la model card) |
| Longitud de contexto | no disponible; verificado con prompts de 8.185 y 32.755 tokens en recuperacion nativa AR (2/2) |
| Tipos de cuantizacion | Mixta: affine 8-bit grupo 64 y affine 4-bit grupo 32; BF16 en 60 proyecciones recurrentes y en la ruta de vision; acumulacion de recurrencia en float32; etiqueta 4-bit |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en MLX (22,17 GiB, 2.096 arrays) |
| Tamano del repositorio | 23,8 GB |
| Modelo base | openbmb/MiniCPM-V-4.7-35B-A3B |
| Relacion con el base | quantized |
| Pipeline | image-text-to-text |
| Libreria | mlx |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo original; los datos disponibles son los de la conversion. Se sabe que el padre es un modelo multimodal con mezcla de expertos y que la configuracion del padre anuncia MTP (multi-token prediction) pero su checkpoint no contiene tensores MTP, por lo que este artefacto declara cero capas MTP nativas. La decodificacion especulativa DSpark no es el motor MTP nativo de MTPLX, sino un motor separado de draft y verificacion que se ejecuta sobre el objetivo cargado con MTPLX.

La innovacion tecnica de esta publicacion esta en la asignacion de precision por modulo. Atencion, embeddings, cabecera de salida, routers y los ultimos ocho MLP de expertos compartidos se almacenan en affine 8-bit con grupo 64. Los expertos conmutados del MoE y los MLP compartidos anteriores se almacenan en affine 4-bit con grupo 32. Las 60 proyecciones de entrada recurrentes quedan en BF16 y la acumulacion de la recurrencia se preserva en float32. Toda la ruta de vision, 453 tensores, permanece en BF16. No hay datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO: esta publicacion no entrena ni modifica el comportamiento del modelo, solo lo cuantiza.

## Capacidades

- Generacion de texto conversacional multi-turno en el endpoint local compatible con la API de OpenAI.
- Procesamiento de imagenes mediante partes de contenido `image_url` con URLs base64 (`data:image/...`); se cualificaron multiples imagenes por peticion.
- Razonamiento sobre contenido visual: la ruta de vision se conserva integra en BF16 para minimizar degradacion.
- Tool calling y respuestas de herramientas: cualificado dentro del conjunto de compatibilidad con la API de OpenAI (9/9).
- Streaming SSE compatible con el cliente OpenAI.
- Manejo de Unicode en las peticiones.
- Inferencia sobre video a traves del SDK MLX-VLM (script `runtime/video_example.py`); no implementado por HTTP.
- Recuperacion de contexto largo: 2/2 en prompts de 8.185 y 32.755 tokens en modo AR nativo.
- Modo thinking opcional mediante `enable_thinking`, desactivado por defecto.
- Decodificacion especulativa DSpark para peticiones con temperatura cero y tamano de bloque ocho; las peticiones con muestreo usan MTPLX AR.
- Ejecucion de codigo basica verificada en una suite de humo (3/3).

## Casos de uso

- OCR y extraccion estructurada en local: el modelo puede procesar capturas, escaneos y documentos fotografiados manteniendo los datos en la maquina, algo critico en entornos con requisitos de confidencialidad. La ruta de vision en BF16 evita la degradacion tipica de cuantizar el encoder visual.
- Asistente de soporte con imagenes adjuntas: un operador puede enviar una captura de error y recibir un diagnostico en texto, ya que el servidor acepta varias imagenes por peticion y mantiene conversaciones multi-turno mediante el endpoint compatible con OpenAI.
- Agente de codigo local con tool calling: gracias al soporte cualificado de herramientas y al endpoint `http://127.0.0.1:18147/v1`, puede integrarse en flujos de edicion asistida o revision de parches sin enviar el codigo a un servicio externo.
- Analisis de documentos tecnicos largos: la recuperacion de contexto verificada hasta 32.755 tokens permite resumir o extraer datos de informes extensos en una sola pasada, siempre que se respete el limite real de la ventana del modelo padre.
- Procesamiento por lotes de video en el SDK: para pipelines de etiquetado o resumen de clips, la via soportada es MLX-VLM con `video_example.py`, no la API HTTP, lo que encaja en scripts de procesamiento offline.
- Prototipado e investigacion en cuantizacion: sirve como referencia reproducible para estudiar el impacto de precisiones mixtas por tipo de modulo, dado que publica el KL frente al padre BF16, la paridad de reconstruccion 2.096/2.096 y la paridad de log-probabilidades cargado frente a offload 8/8.
- Evaluacion de decodificacion especulativa en Apple Silicon: el par objetivo mas draft DSpark (0,73 GiB adicionales) permite medir el efecto de la verificacion por bloques sobre un modelo MoE de 35 B sin acceso a GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. La model card unicamente incluye mediciones de cualificacion previas a la publicacion sobre los pesos exactos preparados, no la puerta estandarizada Shiftedx Bench posterior a la publicacion.

| Carril de cualificacion | Resultado |
|---|---|
| Fidelidad frente al padre BF16 | 11 casos; KL media 0,000834 nats; cambio de NLL medio -0,01721 |
| Reconstruccion de arrays almacenados | 2.096/2.096 exactos |
| Paridad de log-probabilidad cargado/offload | 8/8 exactos |
| Compatibilidad con la API de OpenAI | 9/9 |
| Suite de humo de ejecucion de codigo | 3/3 |
| Suite dura de codigo y logica | 8/10 |
| Imagenes, AR y DSpark | 10/10 |
| Video con SDK, AR y DSpark | 2/2 |
| Recuperacion de contexto en AR nativo | 2/2 con 8.185 y 32.755 tokens de prompt |

Candidatos descartados segun la model card: los candidatos MXFP4, mas rapidos, se rechazaron por una regresion de logica en un conjunto reservado; un candidato de expertos a 5 bits resulto mas lento y con KL medida mas alta; y el redondeo empaquetado adicional no alcanzo el umbral del 5 por ciento de mejora de velocidad. En la suite dura, el presupuesto de salida se duplico, y `JSON Pointer` y planificacion ponderada necesitaron cuadruplicarlo para eliminar truncamientos.

## Requisitos de hardware

- Plataforma obligatoria: Mac con Apple Silicon. Cualificado sobre un Apple M4 Max con 64 GiB de memoria unificada y Python 3.11.14.
- Memoria necesaria: 22,17 GiB para los pesos objetivo, aproximadamente 0,73 GiB para el draft DSpark, mas dependencias de runtime y caches. No cabe en configuraciones de 16 GiB.
- GPU dedicadas: no aplicable. El artefacto es MLX y no funciona sobre CUDA, por lo que A100, H100 o RTX 4090 no son opciones de despliegue.
- Consumer GPU: no soportada. El equivalente en hardware Apple es un equipo con memoria unificada de 64 GiB o superior.
- Opciones de despliegue: MTPLX como motor de carga, con `runtime/serve_minicpm.py` y seleccion de motor `dspark` o `mtplx-ar`; SDK MLX-VLM para video. No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Ajustes de runtime: prefill sostenido en fragmentos de 512 tokens, supresion de logits de vocabulario en prefill completo y cache del asignador MLX limitada a 2 GiB. Las caches KV mantienen la precision original del runtime; no se activa cuantizacion de KV.
- Latencia y throughput: no disponibles. Solo se indica que el servidor local escucha en loopback y atiende peticiones de forma serial.

## Comparativa con modelos similares

La informacion disponible solo permite comparar contra variantes dentro del mismo linaje. No hay datos de otros modelos comparables.

| Variante | Parametros | Precision | Estado | KL medida frente a BF16 | Licencia |
|---|---|---|---|---|---|
| Este artefacto (Attention8 + recurrencia BF16) | 35,2 B | Mixta 8-bit / 4-bit / BF16 | Publicado, 22,17 GiB | 0,000834 nats (11 casos) | apache-2.0 |
| Padre openbmb/MiniCPM-V-4.7-35B-A3B | 35,2 B | BF16 | Referencia | 0 (referencia) | no disponible |
| Candidato MXFP4 | no disponible | 4-bit | Rechazado por regresion de logica | no disponible | no disponible |
| Candidato de expertos a 5 bits | no disponible | 5-bit | Rechazado por menor velocidad y mayor KL | mayor que la variante elegida | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no documenta evaluacion de sesgos ni de toxicidad.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada. La fidelidad declarada mide la divergencia respecto al padre BF16, no la veracidad del contenido generado.
- Ambito de la medicion de fidelidad: la KL de 0,000834 nats procede de una suite de 11 casos de texto, OCR, espacial y contexto. El propio autor advierte que estas medidas no establecen fidelidad universal.
- Idioma: no se especifican idiomas soportados. La cualificacion incluye manejo de Unicode, pero no una evaluacion multilingue.
- Contexto: no se publica la longitud maxima de contexto. Solo esta verificado el funcionamiento en 8.185 y 32.755 tokens, lo que no equivale al limite del modelo.
- Restricciones de licencia: apache-2.0, permisiva y apta para uso comercial, pero se hereda la licencia del modelo base, cuyo detalle no se recoge en la informacion disponible.
- Dependencia estricta de plataforma: solo Apple Silicon. No hay ruta de despliegue en GPU NVIDIA o AMD.
- Dependencia de versiones y parches: requiere exactamente MLX 0.32.2, MLX-LM 0.31.3, Transformers 5.14.1, MTPLX 2.12.2 y MLX-VLM 0.7.8, con dos parches de correccion aplicados sobre esas fuentes. MTPLX sin parchear no es suficiente, porque el overlay aporta el registro del modelo MiniCPM.
- MTP nativo ausente: el padre anuncia MTP en su configuracion pero el checkpoint no contiene tensores MTP; el artefacto declara cero capas MTP nativas. DSpark es un motor externo de draft y verificacion, no MTP nativo.
- Servidor serial: el endpoint local escucha solo en loopback y procesa las peticiones de forma serial, lo que limita el uso concurrente en produccion.
- Video: la entrada de video por HTTP no esta implementada; solo funciona mediante el SDK MLX-VLM.
- Modo thinking desactivado por defecto, en coherencia con el contrato de benchmark.
- Madurez: cero descargas y cero valoraciones en el momento de la ficha, y ausencia de benchmarks estandar publicados. Es un artefacto de investigacion, no una opcion validada para produccion critica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiftedx/MiniCPM-V-4.7-35B-A3B-Attention8-BF16Recurrence-MLX-MTPLX
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Revision concreta del padre BF16 usada en la conversion: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B/tree/355f97c3da689a4ff51ab3b84acf2be58ead1b94
- Draft DSpark del publicador: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark/tree/5facb75c251ffd524524a544c1f5fd97ba0d6c5c
- Repositorio MTPLX (commit fijado): https://github.com/youssofal/MTPLX/tree/9882703f3105363ddc37eca9f97aa09a1d387112
- Repositorio MLX-VLM (commit fijado): https://github.com/Blaizzy/mlx-vlm/tree/9790231827a890eade1a626643a6bc94a1317c72
- Datos agregados de benchmark del repositorio: BENCHMARKS.json (ruta relativa dentro del repositorio del modelo)
- Metadatos de procedencia y precision: QUALIFICATION.json (ruta relativa dentro del repositorio del modelo)
- Notas de contribucion upstream: runtime/UPSTREAM.md (ruta relativa dentro del repositorio del modelo)
- La busqueda web realizada no devolvio resultados relacionados con este modelo: los resultados obtenidos correspondian a generadores de modelos 3D sin relacion con MiniCPM-V.
