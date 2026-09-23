# sahilchachra/Laya-English-MXFP8

## Resumen

Laya-English-MXFP8 es una cuantización a MXFP8 del backbone codificador en inglés de convaiinnovations/laya, publicada por sahilchachra para su uso con MLX sobre Apple Silicon. El modelo base Laya no es un codificador al uso: combina un ModernBERT-large (421M parametros, 1024 de dimension oculta, 28 capas, 512 tokens de contexto) con una pequeña cabeza de decisión entrenada desde cero con aprendizaje por refuerzo (RLCD). Este repositorio publica unicamente el backbone bidireccional compartido, cuantizado, no la cabeza de decisión.

La relevancia de esta ficha es acotada y conviene entenderla bien: se trata de un extractor de caracteristicas cuantizado, no de un modelo generativo. No hay ruta `generate()`, no hay plantilla de chat y no es cargable en LM Studio. El peso real del checkpoint es de 394.781.696 parametros segun los tensores safetensors, con un tamaño de repositorio de 0,4 GB (~407 MB en disco segun el autor). La cuantizacion se ha hecho con `mlx-embeddings` mediante `nn.quantize(..., mode="mxfp8")` con tamaño de grupo 32.

El interes practico esta en disponer del encoder ModernBERT de Laya como extractor de caracteristicas generalista en MLX, con una huella de memoria muy reducida, o como base para construir una cabeza propia en MLX. Existen variantes hermanas MXFP4 y multilingues publicadas por el mismo autor. La licencia no esta declarada ni en los metadatos de HuggingFace ni en la model card, lo que es un obstaculo serio para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBertModel (encoder bidireccional transformer), portado via mlx-embeddings |
| Parametros totales | 394.781.696 (segun safetensors del repo); la model card cita 421M para ModernBERT-large de referencia |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_position_embeddings del backbone ModernBERT-large) |
| Tipos de cuantizacion | MXFP8, tamaño de grupo 32, mode="mxfp8"; existe tambien variante MXFP4 en otro repo |
| Idiomas soportados | Ingles (variante "English" del autor); los metadatos de HuggingFace no declaran idiomas |
| Licencia | No disponible (ni en metadatos de HuggingFace ni en la model card); revisar la del modelo base convaiinnovations/laya |
| Formato de pesos | safetensors (MLX); 0,4 GB de repositorio, ~407 MB en disco |
| Dimension oculta | 1024 |
| Numero de capas | 28 |
| Cabezas de atencion | no disponible en la informacion proporcionada |
| Libreria | mlx (mlx-embeddings) |
| Pipeline declarado | feature-extraction |
| Cabeza de decision incluida | No (solo el backbone encoder) |

## Arquitectura y entrenamiento

El backbone es un ModernBERT-large: transformer bidireccional con atencion local/global alternada (los parametros `global_attn_every_n_layers` y `local_attention` aparecen en el codigo de carga, con valores por defecto de 3 y 128 respectivamente) y RoPE separado para atencion global y deslizante. Sobre este backbone, Laya anade una cabeza de decision definida en su `rl_common.py` compuesta por un `torch.nn.TransformerEncoder` de 2 capas, un scorer de marcadores de opcion y una cabeza act/escalate. Esa cabeza es un modulo torch de unos ~15M parametros que se entreno por separado con RL (RLCD) y que no se publica aqui.

El proceso de cuantizacion es directo: se toma el backbone compartido y se aplica `nn.quantize` en modo mxfp8 con grupo 32 mediante `mlx-embeddings`. No hay informacion en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset, ni el proceso de RLHF/DPO del modelo original; esos datos pertenecen a convaiinnovations/laya y no se detallan en esta publicacion.

La model card incluye una verificacion en dos etapas. Primero, la correccion del port sin cuantizar frente a la referencia torch (`answerdotai/ModernBERT-large` / `mmBERT-base`): diferencia absoluta maxima 0,045 y media 0,0025 sobre `last_hidden_state` (magnitud media absoluta ~0,63). Segundo, la calidad de decision de extremo a extremo alimentando la cabeza torch original sin modificar con los hidden states cuantizados. El propio autor advierte que este encoder de ~421M, con mucho LayerNorm, es notablemente mas sensible a la cuantizacion por bloques que los modelos decoder-only modernos.

## Capacidades

- Extraccion de caracteristicas de texto en ingles: produce `last_hidden_state` utilizable como embedding contextual para clasificacion, recuperacion o clustering.
- Codificacion bidireccional de secuencias de hasta 512 tokens.
- Base para construir cabezas propias en MLX (clasificacion, scoring, ranking) sobre el encoder cuantizado.
- No genera texto: es un encoder no autorregresivo, sin ruta `generate()` ni plantilla de chat.
- No incluye tool calling, function calling ni capacidades de agente.
- No incluye la cabeza de decision de Laya (opcion-marker scorer, act/escalate head), por lo que la API `laya.load(...)` / `RLAgent` del repositorio original no funciona con este checkpoint.
- No soporta vision ni audio.
- Capacidades multilingues: no en esta variante (existen variantes multilingues MXFP4 y MXFP8 separadas del mismo autor).
- No incluye modo thinking ni razonamiento explicito.

## Casos de uso

- Extraccion de embeddings para busqueda semantica en ingles: el encoder produce representaciones contextuales de hasta 512 tokens que pueden indexarse en un almacen vectorial; la cuantizacion MXFP8 reduce la huella a poco mas de 400 MB, lo que permite tener el extractor residente en memoria en un Mac sin competir con otros procesos.
- Clasificacion de texto en el dispositivo: partiendo del encoder y anadiendo una cabeza de clasificacion entrenada por el usuario en MLX, se puede construir un moderador o clasificador de sentimiento que corra integramente en Apple Silicon.
- Clasificacion de sentimiento y moderacion de contenido: la model card menciona explicitamente que la verificacion se hizo sobre preguntas de tipo choice/score/noul de moderacion y sentimiento, lo que indica el dominio previsto de la cabeza de Laya; este encoder sirve como base para replicar esas tareas con cabeza propia.
- Preprocesado de pipelines RAG locales: usar el encoder como recuperador denso en ingles dentro de una aplicacion que ya corre en MLX, evitando depender de un servicio externo.
- Prototipado de cabezas de decision en MLX: dado que Laya entrena una cabeza de decision sobre este backbone, este repo permite experimentar con arquitecturas de cabeza equivalentes sin cargar los pesos completos.
- Deduplicacion y clustering de documentos: los embeddings del encoder permiten agrupar textos similares en un corpus ingles, con coste de memoria bajo en un Mac.
- Analisis de similitud entre frases en herramientas de anotacion: generar embeddings para comparar respuestas candidatas o medir consistencia entre anotadores.
- Base para modelos de reranking: el encoder bidireccional es una eleccion natural para cross-encoders de reranking en ingles, entrenando la cabeza correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, HumanEval, etc.) en la informacion disponible. La model card solo incluye metricas de verificacion de la cuantizacion frente a la referencia fp32:

| Metrica | MXFP4 | MXFP8 |
|---|---|---|
| Diferencia media absoluta del hidden state del encoder frente a fp32 | 0,287 | 0,218 |
| Diferencia maxima absoluta del logit de la cabeza de decision | 0,897 | 0,959 |
| Fallos de respuesta top-1 (sobre 3 preguntas de prueba) | 0/3 | 0/3 |

Verificacion del port sin cuantizar frente a la referencia torch: diferencia absoluta maxima 0,045 y media 0,0025 sobre `last_hidden_state`. El autor senala que la deriva del hidden state es del orden del 35-45 % de perturbacion media absoluta en terminos relativos, muy superior al 1-5 % tipico de la cuantizacion MXFP4 en LLM decoder-only, y que una de cada tres preguntas de prueba (una pregunta `typed-decisions` MXFP8 con dos opciones muy proximas) cambio su respuesta top-1. Las respuestas top-1 coincidieron en 5 de 6 combinaciones checkpoint x modo.

## Requisitos de hardware

- Huella en disco del checkpoint: ~407 MB segun el autor (0,4 GB de repositorio).
- Los pesos en MXFP8 (8 bits) ocupan del orden de 0,4 GB; anadiendo escalas de cuantizacion y overhead de runtime, la VRAM o memoria unificada necesaria para pesos se situa en torno a 0,5-0,7 GB (estimacion aritmetica a partir del numero de parametros, no dato publicado).
- Plataforma objetivo: Apple Silicon con MLX. Requiere `mlx-embeddings` (`pip install mlx-embeddings`).
- Cabe en cualquier Mac con chip de la serie M, incluidos equipos con 8 GB de memoria unificada.
- GPU NVIDIA (A100, H100, RTX 4090): no es el objetivo de este checkpoint; el formato y el modo de cuantizacion son especificos de MLX y no hay pesos GGUF ni safetensors estandar listos para vLLM o TGI.
- Opciones de despliegue: MLX con mlx-embeddings (ver el ejemplo de la model card). No aplica LM Studio, que solo carga modelos de chat/completacion. No se documentan rutas para llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens/s ni de latencia por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| sahilchachra/Laya-English-MXFP8 | 394.781.696 (safetensors) | 512 tokens | safetensors MLX, MXFP8 grupo 32 | No disponible | Solo backbone encoder; verificacion frente a fp32 publicada |
| sahilchachra/Laya-English-MXFP4 | no disponible | 512 tokens (presumiblemente, mismo backbone) | safetensors MLX, MXFP4 | No disponible | Variante hermana de 4 bits; mayor deriva (0,287 de diferencia media absoluta) |
| convaiinnovations/laya | 421M (ModernBERT-large) + ~15M de cabeza de decision | 512 tokens | torch (bf16/fp32) | No disponible | Modelo completo con cabeza RL; API `laya.load(...)` / `RLAgent` operativa |
| answerdotai/ModernBERT-large | 421M aprox. | 512 tokens (hasta 8192 segun configuracion original, no confirmado aqui) | safetensors torch | no disponible en esta informacion | Referencia bf16/fp32 usada en la verificacion del port |

No se dispone de datos de rendimiento comparativos en tareas estandar entre estas alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: no hay `generate()`, no hay plantilla de chat y no puede usarse como asistente conversacional.
- No incluye la cabeza de decision de Laya, por lo que no sirve para replicar las decisiones del modelo original ni su API. Para eso hay que usar convaiinnovations/laya.
- Sensibilidad alta a la cuantizacion: el autor documenta una perturbacion relativa del hidden state del 35-45 % (frente al 1-5 % tipico en LLM) y un cambio de respuesta top-1 en una de tres preguntas con opciones muy proximas. Si se necesitan decisiones calibradas o desempates finos, hay que usar el encoder bf16/fp32 original o tratar las puntuaciones cuantizadas como direccionales.
- Contexto limitado a 512 tokens. Secuencias mas largas requieren truncado o troceado.
- Solo ingles en esta variante. Para otros idiomas hay que acudir a las variantes multilingues del mismo autor.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las representaciones y puntuaciones derivadas pueden ser erroneas o inestables bajo cuantizacion.
- Sesgos: no hay informacion en la model card sobre sesgos del backbone ni del proceso RL del modelo base. No se puede asumir neutralidad.
- Licencia no declarada. Sin licencia explicita no hay autorizacion clara para uso comercial; es imprescindible aclararla antes de cualquier despliegue en produccion, y comprobar tambien la licencia del modelo base.
- Dependencia de plataforma: MLX sobre Apple Silicon. No hay ruta documentada a CUDA ni a motores de inferencia habituales en servidores.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.
- Fechas de creacion y actualizacion del repositorio (2026-09-23) deben verificarse, ya que no coinciden con el estado tipico de un modelo consolidado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sahilchachra/Laya-English-MXFP8
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Variante English MXFP4: https://huggingface.co/sahilchachra/Laya-English-MXFP4
- Variante Multilingual MXFP4: https://huggingface.co/sahilchachra/Laya-Multilingual-MXFP4
- Variante Multilingual MXFP8: https://huggingface.co/sahilchachra/Laya-Multilingual-MXFP8
- Variante Typed-Decisions MXFP4: https://huggingface.co/sahilchachra/Laya-Typed-Decisions-MXFP4
- Variante Typed-Decisions MXFP8: https://huggingface.co/sahilchachra/Laya-Typed-Decisions-MXFP8
- mlx-embeddings: https://github.com/Blaizzy/mlx-embeddings
- MLX: https://github.com/ml-explore/mlx
- Referencia ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Perfil del autor en HuggingFace: https://huggingface.co/sahilchachra
- Perfil del autor en GitHub: https://github.com/SahilChachra
- Pagina de Laya en Tokenstead (hardware y cuantizacion): https://tokenstead.ai/models/laya
