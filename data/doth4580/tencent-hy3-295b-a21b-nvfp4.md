# doth4580/Tencent-Hy3-295B-A21B-NVFP4

## Resumen

Tencent-Hy3-295B-A21B-NVFP4 es una cuantización NVFP4 del modelo Hy3 desarrollado por el equipo Hunyuan de Tencent, publicada por el usuario doth4580. Hy3 es un transformer MoE de 295B parámetros totales con aproximadamente 21B activados por token, diseñado para servir cargas de trabajo de razonamiento y agentes con una ventana de contexto de 262.144 tokens. Esta variante concreta no es un modelo nuevo: es un artefacto de pesos modificados (cuantizados a 4 bits en formato NVFP4) pensado para ejecutarse en hardware NVIDIA GB10 (DGX Spark) mediante el motor de inferencia veloGB10.

El interés de esta ficha radica en que permite ejecutar un modelo de casi 300B parámetros en dos nodos GB10 de 128 GB cada uno, algo imposible con los pesos en bf16. La cuantización NVFP4 reduce el tamaño en disco a unos 166 GB y habilita despliegues locales con decodificación especulativa nativa (cabeza NextN) y serving compatible con la API de OpenAI. Es relevante ahora porque el ecosistema de modelos abiertos de gran escala empieza a poder servirse en hardware de escritorio profesional, no solo en clústeres de A100/H100.

La licencia es Apache-2.0, heredada del modelo base, y el formato de pesos es `compressed-tensors` (`nvfp4-pack-quantized`), legible por frameworks que soporten dicho layout. El tokenizer, la plantilla de chat y la configuración de generación se mantienen tal como los publica Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, 80 capas, hidden 4096 |
| Parametros totales | 298.786.155.776 (~298,8B) |
| Parametros activos | ~21B por token (192 expertos enrutados, top-8 + 1 compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (`all,-router,-embed,-lmhead`), formato `nvfp4-pack-quantized` (compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con layout compressed-tensors (NVFP4) |
| Atencion | GQA: 64 cabezas Q / 8 KV, head_dim 128, qk-norm por cabeza |
| Capas densas | 1 capa MLP densa inicial (inter 13312) |
| Router MoE | Sigmoide con sesgo libre de aux-loss, escalado ×2.826, expert inter 1536 |
| Cabeza MTP | Capa NextN nativa para decodificación especulativa |
| Vocabulario | 120.832 tokens |
| Tamano en disco | ~166 GB (repo 169,6 GB) |
| Requisito de hardware | 2× GB10 (TP=2), ~83 GB por nodo |

## Arquitectura y entrenamiento

Hy3 es un transformer de mezcla de expertos (MoE) con 80 capas y dimensión oculta 4096. La primera capa usa un MLP denso (intermedio 13312) y el resto emplea capas MoE con 192 expertos enrutados, activando top-8 más un experto compartido por token; el router es sigmoide con sesgo libre de pérdida auxiliar y un factor de escalado de ×2.826. La atención es GQA con 64 cabezas de consulta y 8 de clave/valor, head_dim 128 y normalización qk por cabeza. Incorpora una cabeza MTP (Multi-Token Prediction) NextN nativa que se usa para decodificación especulativa.

No se dispone en la información proporcionada de detalles sobre el corpus de entrenamiento (número de tokens, composición del dataset) ni sobre si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones adicionales más allá de la cabeza NextN y el diseño MoE con router sin pérdida auxiliar. La variante aquí descrita aplica cuantización NVFP4 a todas las GEMM excepto router, embeddings y LM head, preservando esos componentes en mayor precisión para no degradar el enrutamiento ni la proyección de salida.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (`<think>`) integrado en la plantilla de chat Hunyuan.
- Generación de código y matemáticas, apoyada en la ventana de contexto de 262.144 tokens para repositorios y problemas largos.
- Soporte de tool calling y function calling mediante la plantilla de chat `hy_*`.
- Capacidades agénticas: razonamiento multi-paso y uso de herramientas en bucles de agente.
- Decodificación especulativa nativa (cabeza NextN) para reducir latencia en serving.
- Serving compatible con la API de OpenAI a través del motor veloGB10.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Vision y audio: no disponibles en la información proporcionada.

## Casos de uso

- Serving local de un modelo de ~300B en dos DGX Spark: el pack NVFP4 permite ejecutar Hy3 con TP=2 en dos nodos GB10, algo inviable con pesos bf16 en ese hardware. Adecuado para laboratorios que quieren un modelo grande sin clúster de datacenter.
- Agentes autónomos con contexto largo: la ventana de 262.144 tokens permite mantener historiales de herramientas, trazas y documentos extensos en un solo contexto, útil para agentes que iteran sobre bases de código o logs.
- Asistencia de código en producción: con tool calling y contexto largo, el modelo puede integrarse en pipelines que consultan repositorios, ejecutan tests y proponen parches en varios pasos.
- Análisis de documentos extensos: informes, contratos o expedientes de cientos de miles de tokens pueden procesarse en una sola pasada sin troceado agresivo.
- Razonamiento matemático y científico: el modo de pensamiento y la ventana amplia permiten cadenas de razonamiento largas con verificación intermedia.
- Investigación en cuantización: el artefacto sirve como caso de estudio para evaluar la degradación de calidad NVFP4 frente al original bf16 en cargas reales.
- Despliegue con API compatible OpenAI: el servidor veloGB10 expone `/v1`, lo que facilita integrar el modelo en aplicaciones existentes sin cambiar el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~83 GB por nodo en configuración TP=2 (dos GB10 de 128 GB). No cabe en una sola caja de 128 GB.
- GPU recomendadas: 2× NVIDIA GB10 (DGX Spark). El pack está validado y ajustado para veloGB10 en GB10.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en configuraciones de una sola GPU consumer; requiere dos nodos GB10.
- Opciones de despliegue: motor veloGB10 (`gb10_inference`), con serving compatible OpenAI en `http://<head-ip>:9000/v1`. El formato compressed-tensors permite, en teoría, otros frameworks que lean `nvfp4-pack-quantized`, aunque no se documentan pruebas fuera de veloGB10.
- Red: los nodos no necesitan copia del modelo; la cabeza envía a cada nodo su parte de pesos y la cachea localmente. Se recomienda RoCE (`--rdma-dev`) cuando hay varios pares de puertos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy3 295B-A21B NVFP4 (este) | ~298,8B | ~21B | 262.144 | Apache-2.0 | Hugging Face, requiere 2× GB10 |
| tencent/Hy3 (bf16 original) | ~295B | ~21B | 262.144 | Apache-2.0 | Hugging Face, requiere hardware de mayor capacidad |
| Alternativas de ~300B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparado con otros modelos de la misma categoría, por lo que la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- La cuantización NVFP4 puede degradar la calidad de salida frente al original bf16; es necesario validar en la carga de trabajo propia antes de producción.
- El artefacto está producido, validado y ajustado para veloGB10; su uso con otros frameworks no está probado por el autor.
- Requiere dos nodos GB10 (TP=2): no es desplegable en una sola máquina de 128 GB ni en GPU consumer.
- No se documentan sesgos conocidos, idiomas soportados ni evaluación de alucinación en la información disponible.
- Licencia Apache-2.0 heredada del modelo base; el autor del pack no reclama propiedad intelectual sobre pesos ni arquitectura. Verificar los términos del modelo original antes de uso comercial.
- El tokenizer y la plantilla de chat se incluyen tal como los publica Tencent; cambios en el formato `hy_*` o en los bloques `<think>` pueden afectar al comportamiento.
- Los comandos de serving documentados no forman parte del test run de noviembre de 2026; son las líneas estándar de veloGB10 para este pack y deben validarse en el entorno propio.

## Enlaces

- Hugging Face del pack: https://huggingface.co/doth4580/Tencent-Hy3-295B-A21B-NVFP4
- Modelo base: https://huggingface.co/tencent/Hy3
- Licencia del modelo base: https://huggingface.co/tencent/Hy3/blob/main/LICENSE
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- Issue tracker de veloGB10: https://github.com/sf-stav/veloGB10/issues
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy3
- cnb.cool: https://cnb.cool/ai-models/tencent/Hy3
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy3
