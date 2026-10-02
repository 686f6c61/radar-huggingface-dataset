# alpha-x-ai/clef-flash-NVFP4

## Resumen

clef-flash-NVFP4 es una version cuantizada del modelo multimodal Cloudflare/clef-flash, publicada por el usuario no oficial alpha-x-ai y pensada exclusivamente para GPUs Blackwell. El modelo base combina un backbone de lenguaje Qwen3.5-9B (9.409.813.744 parametros) con un encoder de vision y una cabeza de esquema conjunta (joint schema head) propia de Clef. Su funcion no es generar texto libre, sino recibir un estado (texto, JSON, imagenes o video) junto con un esquema de preguntas tipadas y devolver una probabilidad para cada opcion permitida de cada pregunta.

La aportacion de esta ficha es la cuantizacion mixta NVFP4/FP8 aplicada capa por capa. El autor dividio el modelo en 64 unidades cuantizables (32 MLP, 24 bloques de atencion lineal Gated DeltaNet y 8 bloques de atencion completa) y evaluo la sensibilidad de cada una midiendo cuanto desplazaba su cuantizacion las probabilidades de salida respecto a BF16. Las unidades mas sensibles se mantuvieron en FP8 y las menos sensibles pasaron a NVFP4, dejando ademas el encoder de vision, el lm_head y la cabeza de esquema en BF16.

El resultado es un checkpoint de 10,3 GB (frente a 19,1 GB en BF16) cuyo backbone ocupa 7,6 GiB de VRAM en vLLM (frente a 15,8 GiB). En una RTX 5090 la latencia es el 53% de la version BF16, con una divergencia KL media de 0,0016 y la misma opcion top en el 98,9% de 1.358 preguntas reservadas. Es relevante ahora porque demuestra que la cuantizacion selectiva por sensibilidad permite servir un modelo multimodal de 9B en hardware de consumo Blackwell sin degradar de forma apreciable la calidad de sus decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone Qwen3.5-9B con atencion lineal Gated DeltaNet (24 bloques) y atencion completa (8 bloques), mas encoder de vision y cabeza de esquema conjunta (joint schema head) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el ejemplo de despliegue configura max_model_len=16.384) |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1 en grupos de 16 con escalas de grupo FP8 E4M3, escala global de pesos por tensor y escala global de activacion estatica de calibracion) y FP8 (pesos por canal, activaciones dinamicas por token); BF16 en encoder de vision, lm_head, cabeza de esquema, embeddings, normas, convoluciones e in_proj_a/in_proj_b |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (layout.json y recipe.yaml incluidos) |

## Arquitectura y entrenamiento

El backbone es Qwen3.5-9B, una arquitectura hibrida que alterna 24 bloques de atencion lineal Gated DeltaNet con 8 bloques de atencion completa, distribuidos en 32 capas con MLP. Sobre ese backbone, Cloudflare/clef-flash anade un encoder de vision (en BF16) y una cabeza de esquema conjunta que proyecta los estados ocultos del backbone contra las representaciones de las opciones permitidas, produciendo una distribucion de probabilidad sobre cada opcion de cada pregunta. El lm_head se mantiene en BF16 porque la cabeza conjunta lee directamente sus filas como embeddings de opciones; ademas, no se ejecuta cuando el backbone funciona como modelo de pooling, por lo que cuantizarlo no aportaria velocidad.

No se dispone de informacion sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO, datos multimodales). Lo que si se documenta es el proceso de cuantizacion: se uso LLM Compressor 0.14.0 con `QuantizationModifier` y la receta exacta esta en `recipe.yaml`. La innovacion tecnica es el criterio de asignacion de precision: cada una de las 64 unidades cuantizables se cuantizo primero a NVFP4 de forma aislada y se puntuo por cuanto alejaba las probabilidades de salida respecto a BF16; despues se conmutaron a NVFP4 en orden de dano por parametro hasta agotar el presupuesto, y el resto quedo en FP8. Segun el autor, las unidades sensibles estan en las capas iniciales e intermedias, mientras que las ultimas capas estan entre las menos sensibles. El reparto concreto es: MLP de las capas 0-4 y 15-31 en NVFP4 y MLP de las capas 5-14 en FP8; atencion lineal de las capas 17, 18, 20-22, 24-26 y 28-30 en NVFP4 y de las capas 0-2, 4-6, 8-10, 12-14 y 16 en FP8; atencion completa de las capas 19, 23, 27 y 31 en NVFP4 y de las capas 3, 7, 11 y 15 en FP8.

## Capacidades

- Prediccion estructurada: dado un estado (texto, JSON, imagenes o video) y un esquema de preguntas tipadas, devuelve una probabilidad para cada opcion permitida de cada pregunta.
- Tipos de pregunta soportados: `choice` (eleccion entre criterios definidos), `score` (puntuacion sobre una escala de criterios) y `noul` (pregunta booleana / etiqueta sin umbral, segun el ejemplo de la model card).
- Procesamiento multimodal de entrada: texto, JSON, imagenes (PIL) y video.
- Procesamiento por lotes: `clef.probabilities([record, ...])` devuelve una lista de diccionarios `{question_id: {option_id: probability}}` para varios registros a la vez, con imagenes incluidas.
- Clasificacion y enrutamiento: la salida probabilistica permite enrutar contenido a categorias o equipos con umbrales configurables.
- Salida estructurada y reproducible: al devolver probabilidades sobre opciones predefinidas, no genera texto libre y el espacio de salida queda acotado por el esquema.
- Tool calling / function calling: no soportado (el modelo no es un modelo conversacional ni de generacion).
- Agentes y razonamiento multi-paso: no soportado de forma nativa; la logica multi-paso debe implementarse fuera del modelo orquestando varias llamadas.
- Capacidades multilingues: solo ingles.
- Modo thinking, audio: no disponibles.

## Casos de uso

- Triaje de tickets de soporte: el ejemplo de la model card enruta un mensaje a `billing` o `technical`, asigna urgencia en una escala (`Can wait`, `This week`, `Today`) y decide si hay un servicio caido. El modelo devuelve tres probabilidades por ticket, lo que permite fijar umbrales distintos por cola y derivar a revision humana los casos ambiguos.
- Clasificacion de documentos con criterios tipados: contratos, facturas o informes se pueden etiquetar con un esquema `choice` de categorias, aprovechando que la salida es una distribucion de probabilidad y no una cadena de texto libre.
- Moderacion de contenido y politica: definir un esquema de preguntas sobre el texto o la imagen (por ejemplo, presencia de contenido prohibido) y usar la probabilidad como senal de confianza para decidir entre accion automatica y revision manual.
- Extraccion de decisiones a partir de imagenes: al aceptar imagenes y video como parte del estado, sirve para clasificar capturas, formularios escaneados o fotogramas con un esquema fijo de preguntas.
- Encuestas y anotacion asistida: convertir respuestas abiertas en etiquetas normalizadas (`choice` o `score`) para alimentar cuadros de mando, con la probabilidad como medida de acuerdo entre anotadores.
- Enrutamiento en pipelines de automatizacion: integrar `clef.probabilities` en lote dentro de un flujo de datos para decidir la siguiente etapa de un proceso (por ejemplo, reembolso, escalado tecnico o cierre automatico) segun la probabilidad de cada opcion.
- Control de calidad y deteccion de anomalias: definir preguntas `noul` sobre registros de logs o estados JSON para marcar automaticamente situaciones anomales sin necesidad de escribir reglas.
- Scoring de riesgo en entornos de alta exigencia de latencia: el checkpoint NVFP4 mantiene el 98,9% de coincidencia con BF16 en la opcion top y reduce la latencia al 53% en RTX 5090, lo que permite ejecutar el modelo en linea en lugar de por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento aportados comparan el checkpoint NVFP4 con su version BF16:

| Metrica | Valor | Condiciones |
|---|---|---|
| Divergencia KL media frente a BF16 | 0,0016 | 1.358 preguntas reservadas (held-out) |
| Coincidencia de la opcion top frente a BF16 | 98,9% | mismas 1.358 preguntas reservadas |
| Latencia relativa frente a BF16 | 53% (es decir, un 47% menos) | RTX 5090 |
| Tamano del checkpoint | 10,3 GB (BF16: 19,1 GB) | repositorio |
| Memoria del backbone en vLLM | 7,6 GiB (BF16: 15,8 GiB) | vLLM |

## Requisitos de hardware

- GPU obligatoria: los kernels NVFP4 requieren arquitectura Blackwell; probado con vLLM 0.30.0 en RTX 5090 (sm_120) y DGX Spark GB10 (sm_121).
- VRAM del backbone: 7,6 GiB en vLLM con el checkpoint NVFP4, frente a 15,8 GiB del release BF16. A eso hay que sumar la cache KV, que puede fijarse de forma explicita con `ClefVLLM(path, kv_cache_gib=1.5)` o dejarse como fraccion con `gpu_memory_utilization=0.6`, ademas del encoder de vision, el lm_head y la cabeza de esquema, que siguen en BF16.
- GPUs compatibles: RTX 5090 (Blackwell, sm_120) y DGX Spark GB10 (sm_121). No se documenta soporte para generaciones anteriores (Ada, Hopper) ni para GPU de consumo sin soporte NVFP4.
- Cabe en GPU de consumo: si, en la medida en que la GPU sea Blackwell; el ejemplo de la model card usa una RTX 5090.
- Despliegue: `clef_vllm.py` incluido en el repositorio, que ejecuta el backbone en vLLM como modelo de pooling y la cabeza de esquema en el mismo proceso. Alternativamente, transformers con `CompressedTensorsConfig(run_compressed=False)`, que descomprime a BF16 (no ahorra memoria ni aporta velocidad, util solo para verificar salidas); requiere `compressed-tensors` y `accelerate`.
- Latencia y throughput: solo se publica la latencia relativa (53% de la de BF16 en RTX 5090); no hay cifras absolutas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone de informacion sobre alternativas equivalentes en la informacion proporcionada. La comparacion posible es contra el propio modelo base en BF16:

| Modelo | Parametros | Cuantizacion | Tamano en disco | VRAM backbone en vLLM | Latencia en RTX 5090 | Licencia | Hardware |
|---|---|---|---|---|---|---|---|
| Cloudflare/clef-flash (BF16) | no disponible, mismo backbone de 9,4B | BF16 | 19,1 GB | 15,8 GiB | referencia (100%) | no disponible en la informacion | no restringido a Blackwell segun los datos disponibles |
| alpha-x-ai/clef-flash-NVFP4 | 9.409.813.744 | Mixta NVFP4 + FP8 (+ BF16 en vision, lm_head, cabeza de esquema, normas y embeddings) | 10,3 GB | 7,6 GiB | 53% | apache-2.0 | requiere Blackwell (sm_120 / sm_121) |

Otros modelos comparables de clasificacion multimodal estructurada: no disponible.

## Limitaciones y advertencias

- No es un modelo conversacional: esta fuera de alcance la generacion de texto libre. Cargar el backbone con una API de generacion produce texto sin sentido; hay que usar el `clef_vllm.py` incluido.
- Cuantizacion no oficial: alpha-x-ai no esta afiliado a Cloudflare ni cuenta con su respaldo, por lo que las garantias de calidad y mantenimiento dependen de ese tercero.
- Dependencia de hardware: los kernels NVFP4 exigen una GPU Blackwell. En GPUs no Blackwell no se puede ejecutar la version cuantizada comprimida; la unica via es descomprimir a BF16 con transformers, que pierde la ventaja de memoria y de latencia.
- Divergencia numerica frente a BF16: aunque la coincidencia en la opcion top es del 98,9%, existe un 1,1% de casos en los que cambia la decision principal, ademas de un desplazamiento de la distribucion (KL media 0,0016). En aplicaciones con umbrales ajustados conviene recalibrar.
- Idioma: solo ingles declarado; no hay evidencia de comportamiento en castellano u otros idiomas.
- Contexto: la longitud de contexto nativa no esta documentada; el ejemplo usa 16.384 tokens y reducciones adicionales pueden afectar a la calidad.
- Sesgos y alucinacion: no hay informacion publicada sobre sesgos. El riesgo de alucinacion clasica es bajo al no generar texto, pero si existe riesgo de asignar alta probabilidad a una opcion incorrecta cuando el estado no encaja con ningun criterio del esquema.
- Restricciones de licencia: el checkpoint se publica bajo apache-2.0, pero se desconoce la licencia del modelo base Cloudflare/clef-flash, lo que puede condicionar el uso comercial. Conviene verificar la licencia del modelo original antes de un despliegue en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, y creado y actualizado el mismo dia, lo que limita la evidencia de terceros sobre su comportamiento en produccion.
- Interoperabilidad: no se documenta soporte para Ollama, llama.cpp u otros motores fuera de vLLM y transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alpha-x-ai/clef-flash-NVFP4
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados se referian a la letra griega alfa (Wikipedia, wumbo.net, alpha.fr, PiliApp) y no guardan relacion con el modelo. Por tanto, no hay papers, blogs, repositorios ni demos adicionales que enlazar.
