# 0xSojalSec/Qwen3.8-Flash-Next-CRACK-MLX

## Resumen

El modelo `Qwen3.8-Flash-Next-CRACK-MLX` es una version cuantizada y ablacionada (abliterated) de un modelo de mezcla de expertos (MoE) de gran escala, desarrollado por el usuario `0xSojalSec` (tambien identificado como `dealignai` en la model card). Se basa en el modelo `JANGQ-AI/Qwen3.8-Flash-Next-JANG_2L`, que a su vez es una variante de baja precision de la preview experimental `qwen4_exp` de Alibaba. El modelo tiene 179.999.981.459 parametros totales (~180B), de los cuales se activan alrededor de 6B en cada token gracias a una arquitectura MoE con 512 expertos. Incluye un head de vision y video, soporte de razonamiento en multiples niveles, tool calling y un head nativo de prediccion multi-token (MTP).

La relevancia de este modelo radica en que combina una arquitectura hibrida de vanguardia (Gated DeltaNet + Qwen Sparse Attention) con un proceso de ablacion que elimina el comportamiento de rechazo (refusal) del modelo, preservando sus capacidades de razonamiento, uso de herramientas y multimodalidad. Esta version esta optimizada para ejecutarse en Apple Silicon mediante el runtime `vMLX`, con un uso de memoria activa de aproximadamente 47 GB y un almacenamiento en disco de unos 65 GB, lo que lo hace utilizable en equipos con 64 GB de RAM. Es importante destacar que se trata de un artefacto de investigacion, no de un modelo de produccion, y su licencia es `qwen-community-1.0`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (Gated DeltaNet + Qwen Sparse Attention) con hashed n-gram embedding y head MTP nativo |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | 6B activos (segun README del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine (JANG low-precision) |
| Idiomas soportados | en, zh |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (19 shards, MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo base `Qwen3.8-Flash-Next` es hibrida: combina capas de Gated DeltaNet (GDN) con capas de Qwen Sparse Attention (QSA), lo que permite un balance entre capacidad y eficiencia computacional. El modelo es un MoE con 512 expertos, de los cuales se activan 6B parametros por token. Ademas, incorpora un embedding basado en hashing de n-gramas (hashed n-gram embedding) y un head nativo de prediccion multi-token (MTP) que permite generar varios tokens por paso, mejorando la latencia en inferencia. El modelo tambien incluye torres de vision y video, lo que le permite procesar imagenes y contenido audiovisual.

El proceso de entrenamiento especifico de esta variante no esta documentado en la informacion disponible. Se sabe que el modelo base es una preview experimental de Alibaba (`qwen4_exp`) y que la version `JANG_2L` es una cuantizacion de baja precision. Posteriormente, el autor aplico una tecnica de ablacion (abliteration) para eliminar los patrones de rechazo del modelo, manteniendo intactas las capacidades de razonamiento, tool use y multimodalidad. No se proporcionan datos sobre RLHF, DPO ni la composicion del dataset de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento en multiples modos: `chat`, `think` y `max`, con niveles de esfuerzo de razonamiento configurables (`low`, `high`, `xhigh`) mediante `chat_template_kwargs`.
- Comprension de imagenes: la torre de vision del modelo base se conserva intacta.
- Comprension de video: la torre de video del modelo base tambien se preserva.
- Tool calling: soporta el parser XML de Qwen, emitiendo llamadas a funciones con el formato `<function=name><parameter=...>` dentro de `<tool_call>`.
- Capacidades de agente y razonamiento multi-paso: el modelo puede integrarse en flujos de trabajo agenticos gracias a su soporte de herramientas y a su modo de razonamiento.
- Head MTP nativo preservado: permite prediccion multi-token en el momento del despliegue mediante `--native-mtp-depth N`.
- Multilingue: soporta ingles y chino.
- Abliterated: el comportamiento de rechazo ha sido eliminado, lo que resulta en una alta tasa de cumplimiento en peticiones que normalmente serian rechazadas.

## Casos de uso

- Investigacion en seguridad de IA: el modelo puede utilizarse para estudiar el impacto de la ablacion en los patrones de rechazo y en el comportamiento de cumplimiento, gracias a su alto ratio de `TRUE_COMPLY` (99.4% en la tier de razonamiento desactivado).
- Analisis multimodal de contenido: gracias a sus torres de vision y video, el modelo puede procesar imagenes y clips de video en tareas de descripcion, analisis o extraccion de informacion.
- Asistentes agenticos con tool calling: el modelo puede integrarse en pipelines de agentes que necesiten llamar a funciones externas, gestionar conversaciones multi-turno y razonar sobre pasos intermedios.
- Generacion de codigo y matematicas: las pruebas de humo confirman que el modelo es capaz de realizar tareas de codigo y matematicas (por ejemplo, sucesiones de Fibonacci, derivadas e integrales) sin bucles problematicos.
- Modelos de razonamiento configurable: puede desplegarse en entornos donde se necesite ajustar el nivel de esfuerzo de razonamiento (low, high, xhigh) segun la complejidad de la tarea.
- Experimentacion con cuantizacion en Apple Silicon: el modelo sirve como referencia para probar el runtime `vMLX`, la cuantizacion MLX affine y el uso de embeddings con n-gramas almacenados en disco.

## Benchmarks y rendimiento

El README indica que las tablas de benchmarks completas (MMLU baseline vs CRACK vs Δ por asignatura, y HarmBench-320 por categoria y tier) estan pendientes de publicacion. Sin embargo, se proporcionan resultados preliminares parciales de la tier con razonamiento desactivado:

| Benchmark | Resultado |
|---|---|
| HarmBench-320 real-harm ASR | ~99.4% (317/319 `TRUE_COMPLY`, 0 hard-refuse) |
| Comparativa con siblings (misma tier) | CRACK-6S: 92.5%, CRACK-JANG4M: 91.6% |

Tambien se mencionan pruebas de humo (smoke tests) que confirman la ausencia de bucles en tareas de codigo y matematicas, y el cumplimiento completo en solicitudes de rutas de sintesis de metanfetamina (sin soft-refuse). Los resultados de MMLU estan pendientes.

## Requisitos de hardware

- VRAM estimada: no aplica, el modelo esta optimizado para Apple Silicon y usa RAM unificada. Se requiere aproximadamente 47 GB de RAM activa.
- Almacenamiento en disco: ~65 GB (incluye la tabla de embeddings hashed n-gram de ~18 GB que se mantiene en disco y se transmite bajo demanda).
- GPU recomendadas: no disponible; el modelo es exclusivo para Apple Silicon (MLX).
- Si cabe en consumer GPU: no, no es compatible con CUDA ni con GPUs de NVIDIA en la configuracion actual.
- Opciones de despliegue: vMLX (runtime recomendado), con soporte de cuantizacion de KV-cache, reutilizacion de prefix-cache, tool calling agentico y MTP nativo. El comando de despliegue es `vmlx-engine serve dealignai/Qwen3.8-Flash-Next-CRACK-JANG2L --port 8888`.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-CRACK-MLX (este modelo) | 179.999.981.459 | 6B | no disponible | qwen-community-1.0 | HuggingFace |
| JANGQ-AI/Qwen3.8-Flash-Next-JANG_2L (base) | ~176B (estimado) | 6B | no disponible | qwen-community-1.0 | HuggingFace |
| dealignai/Qwen3.8-Flash-Next-CRACK-6S | no disponible | no disponible | no disponible | qwen-community-1.0 | HuggingFace |
| dealignai/Qwen3.8-Flash-Next-CRACK-JANG4M | no disponible | no disponible | no disponible | qwen-community-1.0 | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base mencionadas en el README. No se dispone de datos suficientes para comparar con modelos externos de la misma categoria.

## Limitaciones y advertencias

- El modelo es un artefacto de investigacion: el propio README indica que la descarga implica aceptar la responsabilidad sobre el uso de los pesos.
- Al ser una version ablacionada (abliterated), el modelo no presenta rechazos ante solicitudes potencialmente peligrosas, lo que incrementa el riesgo de uso malintencionado.
- Los benchmarks son preliminares y parciales: no se han publicado resultados completos de MMLU ni de otras evaluaciones estandar.
- Limitaciones de idioma: solo soporta ingles y chino, por lo que no es adecuado para tareas en castellano u otros idiomas.
- Restricciones de licencia: la licencia `qwen-community-1.0` impone condiciones de uso, especialmente para fines comerciales. Es necesario revisar el texto completo de la licencia antes de cualquier despliegue en produccion.
- No se proporciona informacion sobre sesgos conocidos, alucinaciones ni limitaciones de contexto. Se recomienda evaluar el modelo en el dominio especifico antes de su uso.
- El modelo no es compatible con GPUs NVIDIA ni con el ecosistema CUDA; su despliegue esta limitado a Apple Silicon con el runtime `vMLX`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSojalSec/Qwen3.8-Flash-Next-CRACK-MLX
- Modelo base: https://huggingface.co/JANGQ-AI/Qwen3.8-Flash-Next-JANG_2L
- Sibling CRACK-6S: https://huggingface.co/dealignai/Qwen3.8-Flash-Next-CRACK-6S
- Sibling CRACK-JANG4M: https://huggingface.co/dealignai/Qwen3.8-Flash-Next-CRACK-JANG4M
- Runtime vMLX: https://vmlx.net
- Repositorio de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Modelo original de Alibaba en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Ko-fi del autor: https://ko-fi.com/dealignai
- X del autor: https://x.com/dealignai
- Web del autor: https://dealign.ai
