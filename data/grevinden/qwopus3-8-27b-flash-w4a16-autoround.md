# grevinden/Qwopus3.8-27B-Flash-W4A16-AutoRound

## Resumen

Qwopus3.8-27B-Flash-W4A16-AutoRound es una cuantización de 4 bits del modelo Jackrong/Qwopus3.8-27B-Flash, un ajuste fino orientado a razonamiento sobre la arquitectura Qwen3.5 que incorpora atención híbrida con GatedDeltaNet, una cabeza MTP (multi-token prediction) integrada y torre de visión. El checkpoint lo publica el usuario grevinden, que actúa como autor de la cuantización, y su objetivo declarado es ejecutar el modelo completo en una única GPU de consumo NVIDIA RTX 3090 de 24 GB a velocidad plena de tensor cores mediante el fork cix de vLLM.

La relevancia práctica del checkpoint está en la reducción de huella: se pasa de aproximadamente 52 GB en BF16 a unos 16 GB en disco, manteniendo la torre de visión y la cabeza MTP en BF16 y cuantizando el cuerpo del decodificador a int4 con esquema W4A16 (group-size 128, simétrico, formato pack-quantized de compressed-tensors), compatible con el kernel Marlin int4 en arquitectura Ampere. Las cabezas de lenguaje (`lm_head`, `embed_tokens` y las capas lineales del MTP) se recuantizan a int8 simétrico con group-size 128.

El autor reporta 96,5 % en GSM8K (200 preguntas, coincidencia exacta), 122-133 tok/s en generación think→output con decodificación especulativa MTP y una perplejidad de 10,89 en una ventana con texto en inglés, danés y código. El contexto declarado en la configuración de servicio es de 64k tokens. Se trata de un checkpoint muy reciente y sin tracción registrada en el momento de los datos consultados (0 descargas, 0 likes).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de la familia Qwen3.5, con atención completa y capas GatedDeltaNet, cabeza MTP integrada y torre de visión multimodal |
| Parámetros totales | 6.260.690.960 según los metadatos de safetensors; el nombre del checkpoint indica 27B, discrepancia no explicada en la información disponible |
| Parámetros activos | No disponible (la información proporcionada no indica que sea un modelo MoE) |
| Longitud de contexto | 64k tokens, según la configuración de servicio del fork cix (`CTX=fast`) |
| Tipos de cuantización | Cuerpo en int4 W4A16 pack-quantized, group-size 128, simétrico; cabezas en int8 group-size 128 simétrico; vision tower, cabeza MTP y `linear_attn.in_proj_a/b` en BF16 |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; los datos de calibración incluyen texto en ruso y danés y se midió perplejidad sobre una ventana en inglés, danés y código) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors): 68 shards `model-*.safetensors` + `model_extra_tensors.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia Qwen3.5 con 64 capas de decodificador, que combina capas de atención completa con capas GatedDeltaNet (atención lineal con estado recurrente). Incorpora una cabeza MTP que el autor reutiliza para decodificación especulativa, además de una torre de visión que mantiene la modalidad image-text-to-text. Esta cuantización no modifica la arquitectura: solo altera el formato numérico de los pesos.

El proceso de cuantización se realizó con auto-round 0.15.0, transformers 5.15, compressed-tensors y PyTorch cu130. El cuerpo cuantizado incluye las proyecciones MLP (`gate`, `up`, `down`), las proyecciones de GatedDeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`) y las proyecciones q/k/v/o de atención completa, sumando 411 tensores empaquetados. La calibración usó una mezcla alineada con el dominio de uso declarado (matemáticas con soluciones paso a paso, matemáticas de competición, código, preguntas y respuestas de instrucción y datos, y texto web en ruso y danés), con 160 secuencias de 2048 tokens. Los algoritmos aplicados fueron escalado lineal AWQ más SignRound, con 800 iteraciones por capa, batch 2, secuencia 2048 y semilla 42. Las cabezas se recuantizaron a int8 y el vocabulario de borrador (`mtp.draft_lm_head`, 40 960 filas) se construyó a partir del `lm_head` ya cuantizado.

No se detalla en la información disponible el número de tokens de preentrenamiento del modelo base, la composición completa del dataset ni si hubo etapas de RLHF o DPO en el ajuste original.

## Capacidades

- Generación de texto y razonamiento: el ajuste base está orientado a razonamiento, con 96,5 % reportado en GSM8K (200 preguntas, coincidencia exacta).
- Razonamiento matemático de varios pasos, favorecido por una calibración que incluye problemas con soluciones paso a paso y matemáticas de competición.
- Generación y comprensión de código: el autor mide perplejidad sobre una ventana que incluye código y calibra con datos de programación.
- Multimodalidad de entrada de imagen: la pipeline declarada es image-text-to-text y la torre de visión se conserva íntegra en BF16.
- Conversación multi-turno: el tag `conversational` está declarado, con contexto de hasta 64k tokens en la configuración de servicio.
- Decodificación especulativa nativa mediante la cabeza MTP del propio modelo (`SPEC=mtp`), lo que acelera la generación sin un modelo borrador externo.
- Capacidad multilingüe: no declarada formalmente; la evidencia disponible se limita a texto de calibración en ruso y danés y a una medición de perplejidad en inglés, danés y código.
- No se documenta en la información disponible soporte de tool calling, function calling, uso como agente ni un modo de pensamiento explícito.

## Casos de uso

- Asistente matemático local: con 96,5 % en GSM8K y calibración de dominio matemático, puede resolver problemas aritméticos y de razonamiento de varios pasos íntegramente en una RTX 3090, sin enviar datos a servicios externos.
- Análisis de documentos escaneados: al conservar la torre de visión en BF16, admite entradas image-text-to-text, lo que permite extraer y razonar sobre tablas, facturas o informes en imagen junto al texto de contexto.
- Asistencia de programación en estación de trabajo: el contexto de 64k tokens permite cargar varios ficheros de un repositorio medio y mantener una conversación de refactorización o depuración con historial largo.
- Servicio de inferencia de bajo coste por token: la decodificación especulativa MTP con 120-133 tok/s en usuario único hace viable atender tráfico interactivo en una sola GPU de 24 GB.
- Procesamiento de documentación multilingüe con foco en inglés y danés: la calibración y la evaluación de perplejidad cubren esos idiomas, por lo que resulta razonable para corpus técnicos en esas lenguas, verificando antes cualquier otro idioma.
- Análisis de contratos o documentación técnica extensa: el contexto de 64k tokens permite introducir documentos completos y hacer preguntas de seguimiento sin troceado agresivo.
- Evaluación de técnicas de cuantización: sirve como referencia reproducible (receta AutoRound 0.15.0, AWQ + SignRound, semilla 42) para comparar impacto de W4A16 frente al modelo base en BF16.
- Prototipado de producto en hardware de gama alta de consumo: permite validar ideas multimodales y de razonamiento antes de migrar a un despliegue en servidor con el checkpoint en BF16.

## Benchmarks y rendimiento

| Benchmark | Resultado | Configuración |
|---|---|---|
| GSM8K | 96,5 % | 200 preguntas, coincidencia exacta, según la model card |
| Perplejidad (ventana con inglés, danés y código) | 10,89 | Según la model card |
| Velocidad think→output | 122-133 tok/s | Usuario único, RTX 3090, decodificación especulativa MTP activada |

No se han publicado en la información disponible resultados de MMLU, HumanEval, MMLU-Pro ni de otras evaluaciones estándar, ni comparaciones numéricas con modelos de la misma categoría. Tampoco se publican las métricas del modelo base en BF16, por lo que no es posible cuantificar la pérdida exacta introducida por la cuantización más allá de los valores anteriores.

## Requisitos de hardware

- VRAM de inferencia: aproximadamente 16,5 GB con el pool de KV en la configuración declarada (`CTX=fast`, 64k tokens) sobre una RTX 3090 de 24 GB.
- GPU objetivo declarada: una única NVIDIA RTX 3090 de 24 GB (Ampere), usando el kernel Marlin int4. El kernel requiere arquitectura Ampere o superior; no se documentan pruebas en otras GPU.
- GPU de consumo: cabe en RTX 3090 (24 GB). No cabe en GPUs de 16 GB o menos, dado el consumo declarado de 16,5 GB más overhead del runtime.
- Modelo base en BF16: unos 52 GB de pesos, lo que implica del orden de 56-60 GB de VRAM en inferencia (estimación aritmética a partir del tamaño declarado), es decir, una A100 80 GB o un despliegue multi-GPU.
- Opciones de despliegue: el autor indica el fork cix de vLLM (`https://github.com/syv-ai/qwen38-27b-rtx3090`), con `SPEC=mtp` y `CTX=fast` como variables de entorno. No se documenta soporte en llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Throughput y latencia: 120-133 tok/s en generación think→output con usuario único en RTX 3090. No se publican métricas de throughput agregado, batch o latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño en disco | Licencia | Formato | Hardware objetivo | GSM8K | Velocidad |
|---|---|---|---|---|---|---|---|---|
| Este checkpoint (grevinden, W4A16 AutoRound) | 6.260.690.960 según safetensors (nombre: 27B) | 64k tokens | ~16 GB | apache-2.0 | safetensors compressed-tensors, int4 + int8 | 1x RTX 3090 24 GB (fork cix de vLLM) | 96,5 % (200 preguntas) | 122-133 tok/s |
| Jackrong/Qwopus3.8-27B-Flash (BF16, modelo base) | No disponible | No disponible | ~52 GB | No disponible en la información consultada | safetensors BF16 | No disponible; por tamaño requiere 80 GB o multi-GPU (estimación) | No disponible | No disponible |
| Otras cuantizaciones del mismo modelo base | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre alternativas de terceros comparables (por ejemplo, cuantizaciones GGUF del mismo modelo base o modelos densos de tamaño similar con soporte multimodal) en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de parámetros: los metadatos de safetensors declaran 6.260.690.960 parámetros, mientras que el nombre del checkpoint indica 27B. La información disponible no explica esta diferencia, por lo que conviene verificar el tamaño real antes de planificar el despliegue.
- El propio autor indica que este checkpoint no está pensado para recibir más ajuste fino.
- La licencia declarada es apache-2.0, pero la licencia del modelo base no figura en la información consultada; conviene verificarla antes de un uso comercial.
- Muestra de evaluación pequeña: el 96,5 % de GSM8K corresponde a 200 preguntas con coincidencia exacta, no a la configuración estándar completa, por lo que la cifra no es directamente comparable con resultados publicados con otros protocolos.
- Sin validación de la comunidad: 0 descargas y 0 likes, con el repositorio creado y actualizado el mismo día (13 de septiembre de 2026). No hay informes independientes de calidad ni de estabilidad.
- Riesgo de alucinación inherente a un modelo de lenguaje; no se documentan mecanismos de mitigación, verificación factual ni modo de pensamiento explícito.
- Idiomas: no hay lista oficial de idiomas soportados. La única evidencia es la composición de los datos de calibración (ruso y danés) y la perplejidad medida en inglés, danés y código, insuficiente para garantizar calidad en otras lenguas.
- Dependencia de toolchain específica: el rendimiento declarado se obtiene con el fork cix de vLLM. Otros servidores no están documentados y el formato compressed-tensors no es directamente portable a llama.cpp u Ollama.
- La model card del propio repositorio marca `inference: false` en el frontmatter, aunque después detalla instrucciones de servicio con el fork cix.
- No se documenta soporte de tool calling, function calling ni flujos de agente multi-paso, capacidades habituales en despliegues de producción.
- La cuantización a int4 introduce pérdida de precisión no cuantificada frente al BF16, ya que no se publican métricas del modelo base para comparar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grevinden/Qwopus3.8-27B-Flash-W4A16-AutoRound
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash
- Fork cix de vLLM para RTX 3090: https://github.com/syv-ai/qwen38-27b-rtx3090
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo, su autor ni su modelo base; los resultados devueltos corresponden a publicaciones de consumo sin relación con el contenido de esta ficha.
