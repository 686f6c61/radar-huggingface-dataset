# AutomatosX/AX-EmbeddingGemma-2-MLX-AXQ-MXFP8

## Resumen

AX-EmbeddingGemma-2-MLX-AXQ-MXFP8 es un checkpoint de embeddings cuantizado en precision mixta (formato MXFP8) para Apple Silicon, desarrollado por AutomatosX a partir del modelo base google/embeddinggemma-2. Se distribuye como pesos MLX en safetensors y esta pensado exclusivamente para tareas de extraccion de caracteristicas (feature-extraction) y similitud semantica, no para generacion de texto. El modelo conserva la torre de vision y la torre de audio en BF16 mientras optimiza la ruta de texto, de modo que texto, imagen, video y audio comparten un unico espacio de embeddings de 768 dimensiones.

El artefacto registra 744,37 millones de parametros logicos y un BPW medido de 13,1855, con un tamano de pesos de 1,23 GB y una descarga completa de aproximadamente 1,27 GB. La longitud de contexto configurada es de 262.144 tokens, si bien el limite practico depende de la memoria unificada del equipo. Es relevante para desarrolladores que despliegan busquedas semanticas o pipelines RAG en Mac con chip Apple Silicon y quieren una variante cuantizada de EmbeddingGemma-2 sin salir del ecosistema MLX.

Conviene subrayar que el propio autor lo etiqueta como evidencia de desarrollo, no como una release AXQuant certificada: no publica resultados de calidad, de contexto largo, de velocidad de kernels ni de MTP. Por tanto, es un paquete util para evaluacion e integracion temprana, pero no debe tratarse como una afirmacion de rendimiento validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EmbeddingGemma2Model (densa); ruta de texto optimizada, torres de vision y audio preservadas en BF16 |
| Parametros totales | 744.371.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; limite practico dependiente de la memoria unificada |
| Tipos de cuantizacion | MXFP8 (precision mixta: 8bit affine + bf16), group size 32; cuantizador AXQuant 2.1.0 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); no incluye PyTorch ni GGUF |

## Arquitectura y entrenamiento

El checkpoint parte de la arquitectura densa EmbeddingGemma2Model y aplica un esquema de cuantizacion de precision mixta sobre la ruta de texto. Segun el desglose publicado, el 36,34% de los parametros (270,53 millones) se almacenan en 8bit y el 63,66% (473,84 millones) permanecen en bf16, con tamanos de grupo de 32 y metodos `affine` y `bf16`. Las torres de vision y audio se preservan en BF16 dentro de los shards principales; no se incluye sidecar de MTP ni sidecar de vision. El proceso de conversion registro 218 de 218 conversiones de modulo correctas, sin fallbacks.

No hay informacion sobre un entrenamiento propio: se trata de una conversion y cuantizacion del modelo base google/embeddinggemma-2 (revision `914f7f89142e33e77833254d9c9b90c3cef7303b`), no de un modelo reentrenado. La asignacion de precision no uso calibracion, sino priors de arquitectura, y el ambito de optimizacion declarado es la ruta de texto. El paquete no incluye un `model-manifest.json` nativo validado, por lo que la ejecucion mediante AX Engine no queda establecida por esta release.

## Capacidades

- Generacion de embeddings densos para similitud semantica y extraccion de caracteristicas (pipeline feature-extraction).
- Representacion multimodal unificada: texto, imagen, video y audio comparten un mismo embedding de 768 dimensiones.
- Embeddings Matryoshka con anchuras soportadas de 768, 512, 256 y 128 (re-normalizar tras el truncado).
- Uso de prefijos de tarea definidos en `config_sentence_transformers.json` para orientar el embedding segun la tarea.
- Recuperacion y busqueda semantica mediante comparacion de vectores.
- No soporta generacion de texto: `mlx_lm.generate` y las metricas de text-generation no aplican.
- No hay informacion disponible sobre tool calling, function calling ni razonamiento multi-paso (no es un modelo generativo).
- No hay informacion disponible sobre modos de pensamiento, ni datos especificos de rendimiento multilingue mas alla de que los idiomas no estan declarados.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar un corpus de manuales y recuperar fragmentos relevantes por similitud coseno en el espacio de 768 dimensiones, con la ventaja de ejecutarse en local sobre Apple Silicon.
- Pipelines RAG en Mac: usar el checkpoint como recuperador dentro de un sistema de generacion aumentada, aprovechando el contexto de 262.144 tokens configurado para trocear documentos largos; recuerda reconstruir el indice con esta misma precision, ya que los vectores de otras precisiones no son intercambiables.
- Deduplicacion y agrupamiento de contenido: calcular embeddings de un catalogo y aplicar clustering o deteccion de casi duplicados sin servicios en la nube.
- Busqueda multimodal de activos: indexar imagenes, audio y video junto a texto en un unico espacio de 768 dimensiones para recuperacion cruzada entre modalidades.
- Clasificacion y enrutado por similitud: comparar la consulta del usuario contra embeddings de referencia para enrutar tickets, intentos o categorias.
- Sistemas de recomendacion basados en contenido: representar items por su descripcion textual y/o su miniatura visual, y recomendar por proximidad vectorial.
- Filtrado de seguridad y moderacion: medir similitud con embeddings de referencia de contenido problematico para marcar casos candidatos a revision.
- Reduccion de coste de almacenamiento vectorial: emplear las anchuras Matryoshka de 512, 256 o 128 para reducir el indice a cambio de algo de fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no publica evidencia de calidad frente a BF16 o a lineas base uniformes, ni resultados de MTEB, ni mediciones de contexto largo, ni velocidad de kernels, ni aceptacion o velocidad de MTP. Cualquier cifra de rendimiento no esta respaldada por este paquete.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon con runtime MLX (el artefacto registra MLX 0.32.3).
- Espacio en disco: al menos 1,27 GB libres; pesos safetensors de 1,23 GB.
- Memoria: al consumir memoria unificada, el limite practico de contexto depende del equipo; no se proporcionan cifras de VRAM especificas.
- Precision de activaciones: mantener en BF16 o FP32; no convertir el modelo a float16.
- Despliegue: cargar con `mlx_vlm.embedding_loader.load_embedding_model` mediante una build de mlx-vlm que exponga `embedding_gemma2`; este checkpoint no usa `mlx_lm` ni formatos GGUF/Ollama/vLLM/TGI.
- Latencia y throughput: no disponibles.
- Aceleracion MTP: no presente en el paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / precision | Licencia | Notas |
|---|---|---|---|---|---|
| AX-EmbeddingGemma-2-MLX-AXQ-MXFP8 | 744,37M | 262.144 | MLX safetensors, MXFP8 (13,1855 BPW) | apache-2.0 | Vision y audio en BF16; evidencia de desarrollo |
| AX-EmbeddingGemma-2-MLX-AXQ-MXFP4 | no disponible | no disponible | MLX, formato de bloque MXFP4 | apache-2.0 | Mismo policy de roles AXQ; vision y audio en BF16 |
| google/embeddinggemma-2 (base) | 744,37M logicos | no disponible | BF16 (origen de la conversion) | apache-2.0 | Modelo original sin cuantizar |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Paquete de evidencia de desarrollo: no es una release AXQuant certificada ni una afirmacion de benchmark.
- Sin datos publicados de retencion de calidad, contexto largo, velocidad de kernels ni MTP.
- Sin calibracion: la asignacion de precision se basa en priors de arquitectura.
- Calidad vision-lenguaje y torre de audio no evaluadas ni reclamadas, aunque sus tensores se preserven en BF16.
- Ejecucion nativa mediante AX Engine no establecida (falta manifiesto nativo validado); las versiones registradas no constituyen una verificacion de runtime.
- Los vectores no son intercambiables con los de otra precision: hay que reconstruir los indices de recuperacion.
- No convertir a float16.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si puede producir recuperaciones erroneas si el indice se construye con la precision equivocada o sin los prefijos de tarea.
- Idiomas soportados no declarados.
- Licencia apache-2.0, que permite uso comercial, pero condicionada a las obligaciones de la propia licencia y a las del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-EmbeddingGemma-2-MLX-AXQ-MXFP8
- Modelo base: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Hermano MXFP4: https://huggingface.co/AutomatosX/AX-EmbeddingGemma-2-MLX-AXQ-MXFP4
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
