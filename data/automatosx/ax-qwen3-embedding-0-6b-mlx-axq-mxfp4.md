# AutomatosX/AX-Qwen3-Embedding-0.6B-MLX-AXQ-MXFP4

## Resumen

AX-Qwen3-Embedding-0.6B-MLX-AXQ-MXFP4 es un checkpoint cuantizado en formato MLX del modelo de embeddings Qwen/Qwen3-Embedding-0.6B, publicado por AutomatosX bajo el marco de cuantizacion propietario AXQuant (AXQ). El modelo base conserva la arquitectura densa Qwen3 (Qwen3ForCausalLM) con 595.776.512 parametros (595,78 M) y una ventana de contexto configurada de 32.768 tokens. Esta variante concreta se ha convertido directamente desde los pesos BF16 originales, sin calibracion, aplicando una asignacion de precision mixta guiada por priors de arquitectura.

El resultado es un artefacto de 0,40 GB en safetensors de MLX con un BPW (bits por peso) medido de 5,3599, que mezcla 4 bits (73,92% de los parametros), 8 bits (26,07%) y bf16 (0,01%) para mantener en mayor precision los tensores protegidos (embeddings y normalizaciones). Su relevancia practica es acotada: esta pensado para desarrollo y evaluacion local en Apple Silicon mediante MLX-LM, no para produccion certificada.

El propio autor etiqueta el paquete como evidencia de desarrollo y no como release certificado de AXQuant: no se publican mediciones de calidad frente a BF16, ni pruebas de contexto largo, ni evidencia de velocidad de kernels o de aceleracion MTP. Ademas, el repositorio registra solo 10 descargas y 0 likes en el momento de redactar esta ficha, y su fecha de creacion es el 4 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3ForCausalLM), ruta de texto optimizada |
| Parametros totales | 595.776.512 (595,78 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens configurados (metadato de configuracion, no validado) |
| Tipos de cuantizacion | Mixta AXQuant: 4 bits (440,40 M, 73,92%), 8 bits (155,31 M, 26,07%), bf16 (65.536, 0,01%). Metodos: affine, bf16, mxfp4. Tamano de grupo: 32 y 64. BPW medido: 5,3599 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); no incluye pesos PyTorch ni GGUF |

Datos adicionales del artefacto: modelo base Qwen/Qwen3-Embedding-0.6B (revision 97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3), cuantizador AXQuant 1.9.0, clase de presupuesto de Hub MXFP4, clase de precision base 8bit, BPW planificado ajustado por almacenamiento 5,9136, tamano de pesos 0,40 GB, descarga completa aproximada 0,42 GB, runtime primario MLX-LM, MTP no incluido, vision no incluida, audio no incluido. Pipeline declarado: feature-extraction. Registra MLX 0.32.1 y MLX-LM 0.31.3 en el momento de la conversion.

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3 (clase Qwen3ForCausalLM) en su variante orientada a embeddings de 0,6 mil millones de parametros. AutomatosX no ha reentrenado ni ajustado el modelo: el trabajo consiste integramente en una conversion de cuantizacion desde los pesos BF16 del modelo base. La asignacion de precision se realizo sin calibracion, apoyandose en priors de arquitectura, y aplica suelos de proteccion AXQuant de modo que embeddings, normalizaciones y otros tensores sensibles permanecen en mayor precision mientras el resto del grafo se comprime.

De las 197 conversiones de modulo registradas, 197 finalizaron correctamente y ninguna recurrio a fallback. La ejecucion nativa en AX Engine no esta establecida porque el paquete no incluye un model-manifest.json validado; los campos de AX Engine presentes en axquant_runtime.json describen un contrato de compatibilidad previsto, no evidencia observada en ejecucion. No se documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que corresponden al modelo base y no se detallan en la informacion disponible. Tampoco se incluye sidecar MTP (MTP present: False) ni sidecar de vision (Vision present: False).

## Capacidades

- Extraccion de caracteristicas y generacion de embeddings de texto (pipeline feature-extraction), heredadas del modelo base Qwen3-Embedding-0.6B.
- Similitud semantica entre frases (tag sentence-similarity).
- Inferencia de backbone de texto mediante MLX-LM con el comando estandar mlx_lm.generate.
- Ventana de contexto de hasta 32.768 tokens a nivel de configuracion, sujeta a los limites de memoria unificada del equipo.
- Ejecucion local en Apple Silicon gracias al formato MLX y al bajo peso del artefacto (0,42 GB).
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso de forma documentada.
- Sin capacidades de vision (no hay torre visual en el paquete).
- Sin capacidades de audio ni reconocimiento de voz.
- Sin modo thinking, MTP o decodificacion especulativa habilitada.
- Idiomas soportados: no disponible.

Advertencia relevante: aunque el modelo base es un modelo de embeddings, la model card ilustra la ejecucion con mlx_lm.generate, es decir, generacion de texto. MLX-LM puede ignorar los metadatos de runtime de AXQuant y los sidecars opcionales, por lo que ese comando no valida la calidad del embedding ni el comportamiento del modelo base.

## Casos de uso

- Busqueda semantica en documentacion interna: indexar manuales tecnicos y recuperar fragmentos por similitud vectorial, aprovechando los 32.768 tokens de contexto configurados para trocear documentos largos sin perder coherencia.
- Sistemas RAG en local sobre Apple Silicon: generar embeddings de consultas y pasajes en un Mac sin depender de APIs externas, con un artefacto de 0,42 GB que cabe holgadamente en memoria unificada.
- Deduplicacion y agrupamiento de textos: calcular similitud coseno entre registros de un corpus (titulares, tickets, articulos) para detectar duplicados o agrupar temas.
- Clasificacion por vecinos mas cercanos: usar los embeddings como caracteristica de entrada en clasificadores ligeros para moderacion, etiquetado tematico o enrutado de tickets de soporte.
- Evaluacion y prototipado de pipelines de embeddings: comparar esta variante cuantizada con el modelo base BF16 antes de comprometerse a una arquitectura de recuperacion en produccion.
- Experimentacion con cuantizacion mixta en MLX: servir de referencia para medir el efecto de una asignacion 4/8 bits con suelos de proteccion sobre tareas de similitud semantica.
- Filtrado de candidatos en busqueda de empleo o matching de perfiles: representar ofertas y curriculos como vectores y ordenar candidatos por afinidad semantica en un entorno de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se publica calidad medida frente a BF16 ni frente a lineas base uniformes, que no existe claim de retencion de calidad, que la velocidad y aceptacion MTP no se han medido y que la evidencia de kernels de AX Engine figura como unmeasured. El modelo no esta certificado: las puertas formales M0-M8 de AXQuant no se han cerrado.

## Requisitos de hardware

- Peso del artefacto: 0,40 GB de safetensors; descarga completa aproximada de 0,42 GB.
- VRAM estimada para inferencia: en torno a 0,6-1,0 GB, dado que el modelo tiene 595,78 M de parametros a 5,3599 BPW mas el overhead de KV cache segun contexto.
- Hardware objetivo: Apple Silicon. El formato MLX y la libreria declarada (mlx) estan pensados para chips de la serie M de Apple.
- GPU CUDA: no soportado de forma nativa por este paquete, que no incluye pesos PyTorch ni GGUF. El uso en A100, H100 o RTX 4090 requeriria reconvertir desde el modelo base.
- Cabe en cualquier Mac con Apple Silicon (serie M1 en adelante); no se especifica un minimo de memoria unificada, aunque el contexto de 32.768 tokens condiciona el consumo real.
- Opciones de despliegue: MLX-LM como ruta primaria (registrado con MLX 0.32.1 y MLX-LM 0.31.3). AX Engine no esta establecido por falta de model-manifest.json validado. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI con este artefacto.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Qwen3-Embedding-0.6B-MLX-AXQ-MXFP4 | 595,78 M | 32.768 tokens | safetensors MLX, BPW 5,3599 | apache-2.0 | Desarrollo, sin certificar, sin calidad medida |
| AX-Qwen3-Embedding-0.6B-MLX-AXQ-4bit (hermano) | 595,78 M | no disponible | safetensors MLX | apache-2.0 | Presupuesto de almacenamiento inferior; comprobar BPW exacto |
| AX-Qwen3-Embedding-0.6B-MLX-AXQ-8bit (hermano) | 595,78 M | no disponible | safetensors MLX | apache-2.0 | Precision media cercana al presupuesto de 8 BPW |
| Qwen/Qwen3-Embedding-0.6B (base) | 595,78 M | 32.768 tokens | safetensors BF16 | apache-2.0 | Referencia sin cuantizar; idiomas y benchmarks: no disponibles en esta busqueda |

No se dispone de datos de benchmarks que permitan comparar el rendimiento efectivo entre estas variantes.

## Limitaciones y advertencias

- No es un release certificado. El autor lo etiqueta como evidencia de desarrollo y las puertas formales M0-M8 de AXQuant no se han cerrado.
- No se publica ninguna medicion de retencion de calidad frente a BF16 ni frente a cuantizaciones uniformes. Se desconoce la degradacion introducida.
- La asignacion de precision se baso en priors de arquitectura, sin calibracion con datos.
- La ventana de 32.768 tokens es un metadato de configuracion, no una capacidad validada. La calidad en contexto largo no se ha medido.
- No hay evidencia de velocidad de kernels (unmeasured) ni de aceleracion MTP, que no esta incluida.
- La ejecucion nativa en AX Engine no esta establecida por ausencia de un model-manifest.json validado.
- Es un artefacto exclusivo para MLX y Apple Silicon; no incluye pesos PyTorch ni GGUF, lo que limita su portabilidad.
- Idiomas soportados: no disponible. No se puede asumir cobertura multilingue a partir de esta ficha.
- Riesgo de alucinacion y sesgos: no evaluados para este paquete. Al derivar del modelo base Qwen3-Embedding-0.6B, hereda los sesgos de sus datos de entrenamiento, que no se documentan aqui.
- Uso comercial: la licencia apache-2.0 lo permite en principio, pero debe verificarse la licencia del modelo base y el estado no certificado del artefacto antes de desplegarlo en produccion.
- Los repositorios de modelos pueden actualizarse; se recomienda fijar el commit del Hub en despliegues reproducibles en lugar de depender de main.
- Solo 10 descargas y 0 likes: la validacion por parte de la comunidad es practicamente nula.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-0.6B-MLX-AXQ-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B/tree/97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3
- Variante 4bit: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-0.6B-MLX-AXQ-4bit
- Variante 8bit: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-0.6B-MLX-AXQ-8bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a contenidos de filosofia politica sin relacion con el artefacto.
