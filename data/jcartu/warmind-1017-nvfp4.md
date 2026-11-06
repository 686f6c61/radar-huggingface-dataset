# jcartu/WARMIND-1017-NVFP4

## Resumen

WARMIND-1017-NVFP4 es una derivación experimental del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek-AI, publicada por el usuario jcartu. Se construye sobre la cuantización NVFP4 de NVIDIA (`nvidia/DeepSeek-V4.1-Flash-1017-NVFP4`) y aplica la misma edición de reducción de rechazos que el modelo WARMIND-1017: la modificación de 132 tensores densos en las capas 4 a 36, correspondientes a los pesos `attn.wo_b` y `ffn.shared_experts.w2` y sus escalas de bloque. El resto del checkpoint es byte a byte idéntico al de NVIDIA.

El modelo conserva la arquitectura original de DeepSeek-V4.1-Flash, con 664.898.390.994 parámetros totales, y mantiene el formato NVFP4 para los expertos enrutados y MXFP4 para las tablas Engram. La edición se transfiere sin recuantización porque los 132 tensores editados ya estaban almacenados en FP8 E4M3 / UE8M0 en la release de NVIDIA, que no los tocó durante su proceso de cuantización.

Su relevancia es doble: por un lado, demuestra una técnica de transferencia byte a byte de ediciones de abliteración sobre checkpoints cuantizados; por otro, documenta un runtime específico (vLLM 0.32 con dos parches para SM120) y mediciones propias de velocidad, rechazos y corrección en contexto largo. Es un modelo para investigación y despliegue controlado, no una release de producción con garantías de calidad o seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeepSeek-V4.1-Flash (transformer con expertos enrutados, MoE; incluye capas MTP/DSpark de draft) |
| Parámetros totales | 664.898.390.994 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas del autor cubren prompts de hasta 256k tokens) |
| Tipos de cuantización | NVFP4 (expertos enrutados), MXFP4 (tablas Engram), FP8 E4M3 / UE8M0 (tensores densos editados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, 400 GB; repo de 429,0 GB) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un transformer con mezcla de expertos (MoE) que incluye expertos compartidos (`ffn.shared_experts`) y expertos enrutados, además de capas de draft MTP/DSpark para decodificación especulativa. La versión de NVIDIA aplica cuantización ModelOpt: los expertos enrutados se almacenan en NVFP4 con su calibración de activaciones, las tablas Engram en MXFP4 y los tensores densos en FP8 E4M3 / UE8M0.

La edición de WARMIND-1017 afecta a 132 tensores densos de las capas 4 a 36, siguiendo la receta de abliteración biproyectada con preservación de norma de grimjim y las direcciones de rechazo de distributedcognition. El proceso de construcción verifica cada shard de NVIDIA contra la revisión fijada del Hub, comprueba que los rangos objetivo coinciden con los bytes prístinos registrados, copia los 132 payloads editados y compara el resto de bytes contra la fuente. No se recuantiza ni se recalibra: la calibración de activaciones de los expertos enrutados se mantiene intacta. El repositorio incluye `DERIVATIVE.json` con cada rango editado (tensor, shard, offset, longitud, sha256 antes y después) y `SHA256SUMS` para todos los ficheros.

## Capacidades

- Generación de texto y razonamiento, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Modo de razonamiento (thinking) configurable, con esfuerzo de razonamiento ajustable (el autor usa 75 en sus pruebas).
- Salida estructurada con esquema JSON estricto (verificado en 34/34 comprobaciones de API).
- Tool calling y function calling: 16 rondas de llamadas a herramientas en cuatro conversaciones concurrentes superadas.
- Razonamiento multi-paso y uso en agentes, con contexto largo (probado hasta 256k tokens de entrada).
- Capacidades multilingües: no documentadas en la información disponible.
- Visión: no probada; el autor sirvió el modelo con `--language-model-only`.
- Reducción de rechazos: responde a peticiones que el modelo original rechaza (0/100 rechazos frente a 92/100 del stock en el conjunto fijo del autor).

## Casos de uso

- Investigación sobre abliteración y alineación: permite estudiar el efecto de editar direcciones de rechazo en un checkpoint cuantizado sin recuantizar, comparando directamente contra la release de NVIDIA con el mismo runtime y argumentos.
- Procesamiento de documentos largos: con prompts de hasta 256k tokens y una caché KV de aproximadamente 3,75M tokens a 0,95 de utilización de memoria GPU, encaja en tareas de análisis de expedientes, auditoría de contratos o resumen de corpus extensos.
- Generación de código y automatización de pipelines: el soporte verificado de salida JSON estricta y de tool calling en conversaciones concurrentes lo hace apto para integrarse como backend en orquestadores de agentes y flujos de CI/CD.
- Atención al cliente automatizada en dominios sensibles: al no rechazar peticiones, requiere filtros y políticas externas; útil en escenarios donde el rechazo del modelo base interrumpe flujos legítimos (soporte técnico de seguridad, análisis de contenido).
- Evaluación de infraestructura Blackwell: sirve como banco de pruebas para despliegues NVFP4 en SM120 con vLLM 0.32 y los dos parches upstream, midiendo throughput a distintos niveles de concurrencia (214 tok/s a C1, 1.814 tok/s a C32 en contexto 0).
- Red teaming y pruebas de robustez: al eliminar la capa de rechazo, es adecuado para generar respuestas que el modelo alineado evita y evaluar clasificadores, guardrails y sistemas de moderación.
- Servicio de inferencia de alto rendimiento en clúster: con TP4 sobre 4x RTX PRO 6000 Blackwell (96 GB cada una) y decodificación especulativa, ofrece cifras de agregado superiores a 800 tok/s a C8 en contexto 0.

## Benchmarks y rendimiento

Datos publicados por el autor, obtenidos en un único equipo de 4x RTX PRO 6000 Blackwell con TP4, mismo runtime y argumentos para el stock NVFP4 y esta versión.

| Prueba | Stock NVFP4 | WARMIND-1017-NVFP4 |
|---|---:|---:|
| Rechazos en conjunto fijo de 100 peticiones (temp. 0, thinking off) | 92/100 | 0/100 |
| Tareas de ledger sintéticas en contexto largo (correctas de 48) | 40 | 43 |
| Comprobaciones de API (aritmética, JSON estricto, tool calls) | no disponible | 34/34 |

Análisis pareado de la prueba de contexto largo: 35 aciertos en ambos, 5 solo en stock, 8 solo en WARMIND; McNemar exacto p = 0,58, sin diferencia medible. La build en formato CSF de WARMIND-1017 obtuvo 46/48 en el mismo conjunto, pero en otro runtime, por lo que no es comparable directamente.

Velocidad de decodificación (llm-inference-bench 0.7.5, celdas de 30 s, temperatura 1, thinking on, media de dos repeticiones; tok/s agregados):

| Contexto | C1 | C4 | C8 | C32 |
|---|---:|---:|---:|---:|
| 0 | 214 | 525 | 819 | 1.814 |
| 64k | 210 | 524 | 813 | 1.720 |

Sin decodificación especulativa, el mismo runtime alcanzó unos 127 tok/s a C1. No se han publicado resultados de benchmarks amplios de calidad o seguridad para esta derivación; las puntuaciones de NVIDIA en `README.upstream.md` corresponden a su release sin editar.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 400 GB en 48 shards; con TP4 sobre 4 GPU de 96 GB (384 GB) el autor lo sirvió con éxito usando caché KV a 0,95 de utilización, lo que sugiere que el peso efectivo por GPU encaja con margen ajustado en ese配置.
- GPU recomendadas: 4x RTX PRO 6000 Blackwell (96 GB) es la configuración probada; arquitectura SM120. El comportamiento en la receta de NVIDIA para GB300 no se ha probado.
- GPU de consumo: no cabe en ninguna GPU consumer actual por el tamaño del checkpoint; se requiere un despliegue multi-GPU de clase profesional o数据中心.
- Opciones de despliegue: vLLM 0.32 con dos parches upstream para SM120 (PRs #61530 y #60762); la imagen estándar de vLLM 0.32 no carga el checkpoint en SM120 sin ellos. La receta y los argumentos exactos están en `runtime/README.md`.
- Latencia y throughput: 214 tok/s a C1 y 1.814 tok/s a C32 con contexto 0; 210 y 1.720 tok/s respectivamente con contexto de 64k. Caché KV de aproximadamente 3,75M tokens a 0,95 de utilización de memoria GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| WARMIND-1017-NVFP4 | 664,9B | no disponible (probado hasta 256k) | NVFP4 / MXFP4 / FP8 | MIT | Derivación abliterada sobre NVFP4 de NVIDIA |
| nvidia/DeepSeek-V4.1-Flash-1017-NVFP4 | no disponible | no disponible | NVFP4 / MXFP4 / FP8 | MIT | Release oficial de NVIDIA; rechaza 92/100 en el conjunto del autor |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | FP8 (original) | MIT | Modelo base de DeepSeek-AI, sin cuantizar |
| WARMIND-1017 (formato CSF) | no disponible | no disponible | CSF | MIT | Misma edición de 132 tensores; 46/48 en el conjunto de contexto largo, en otro runtime |

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal y advierte de que las mediciones son un conjunto reducido de comprobaciones, no una suite de benchmarks.
- Sin evaluaciones amplias de calidad o seguridad: no hay datos de MMLU, HumanEval, GSM8K ni similares para esta derivación; las puntuaciones publicadas por NVIDIA no aplican al modelo editado.
- Alucinación: no se ha medido específicamente; al ser una edición de rechazos, no hay garantía de que la tasa de alucinación se mantenga respecto al base.
- Sesgos: no documentados en la información disponible; la abliteración puede alterar el comportamiento del modelo en dominios sensibles más allá de los rechazos.
- Licencia MIT: permite uso comercial, pero el autor declara que la responsabilidad de uso recae en el usuario, especialmente por la eliminación de rechazos.
- Contexto e idiomas: la longitud de contexto oficial no está disponible; las pruebas cubren hasta 256k tokens de entrada. Los idiomas soportados no están documentados.
- Visión no verificada: se sirvió con `--language-model-only`; no hay pruebas de capacidades multimodales en esta build.
- Compatibilidad de runtime limitada: requiere vLLM 0.32 más dos parches para SM120; sin ellos el checkpoint no carga. No se ha probado en otras GPU, versiones de vLLM ni en la receta de GB300.
- Sin pruebas de ejecuciones agénticas largas ni de estabilidad en sesiones de varias horas en esta build concreta.
- Metadatos inconsistentes: `model.safetensors.index.json` de NVIDIA declara `metadata.total_size` de 510,3 GB mientras el payload real es de 429,0 GB; se deja tal cual.
- Sin descargas ni likes en el momento de la ficha; tracción comunitaria nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jcartu/WARMIND-1017-NVFP4
- Modelo base de DeepSeek-AI: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización NVFP4 de NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- WARMIND-1017 (formato CSF): https://huggingface.co/jcartu/WARMIND-1017
- Receta de abliteración de DeepSeek-V4.1-Flash: https://huggingface.co/distributedcognition/DeepSeek-V4.1-Flash-abliterated
- Blog sobre abliteración biproyectada con preservación de norma: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- PR de vLLM #61530: https://github.com/vllm-project/vllm/pull/61530
- PR de vLLM #60762: https://github.com/vllm-project/vllm/pull/60762
