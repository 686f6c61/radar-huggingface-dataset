# rlondner/qwen36-fr-ins-15ep

## Resumen

`rlondner/qwen36-fr-ins-15ep` es un fine-tune por LoRA del modelo Qwen3.6-35B-A3B, desarrollado por el usuario rlondner sobre los pesos abiertos de Alibaba Qwen. El objetivo declarado en la model card es especializar el modelo en acronimos y terminologia del sector de seguros frances, manteniendo la base multimodal (image-text-to-text) y la arquitectura MoE del modelo original. El checkpoint se publica en formato Transformers (safetensors) con licencia Apache 2.0 y un total de 35.951.822.704 parametros.

La relevancia de esta ficha es doble: por un lado documenta un caso de adaptacion vertical de un modelo grande a un dominio regulado y con jerga propia (seguros en Francia); por otro, permite evaluar el comportamiento de la familia Qwen3.6, que introduce mejoras en codificacion agentica y preservacion del razonamiento entre turnos. El modelo base activa solo 3B parametros por token gracias a su diseno MoE, lo que lo hace atractivo para despliegues con requisitos de latencia moderados pese a su tamano total.

No se dispone de informacion publica sobre el dataset de fine-tuning, el numero de pasos, la composicion linguistica ni metricas de evaluacion especificas del checkpoint adaptado. La model card hereda la del modelo base Qwen3.6-35B-A3B e incorpora unicamente una nota sobre el ajuste LoRA en terminologia de seguros francesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con encoder de vision; backbone hibrido Gated DeltaNet + Gated Attention con MoE |
| Parametros totales | 35.951.822.704 (35B) |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision original; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en la model card del fine-tune; el modelo base Qwen3.6 es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer causal con encoder de vision y un layout hibrido de 40 capas: 10 bloques compuestos por 3 subcapas de Gated DeltaNet (atencion lineal) seguidas de 1 subcapa de Gated Attention (atencion completa). La Gated DeltaNet usa 32 cabezas lineales para V y 16 para QK con dimension de cabeza 128; la Gated Attention usa 16 cabezas para Q y 2 para KV con dimension 256 y RoPE de 64 dimensiones. El componente MoE contiene 256 expertos con dimension intermedia 512, activando 8 enrutados mas 1 compartido por token. La dimension oculta es 2048 y el embedding de tokens 248.320 (padded). El modelo se entrena con MTP (multi-token prediction) en varios pasos.

El checkpoint publicado por rlondner aplica un fine-tune LoRA sobre el modelo post-entrenado de Qwen, orientado a acronimos y terminologia de seguros francesa. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el rango del adaptador, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO adicionales. Tampoco se detalla si el encoder de vision fue congelado o ajustado durante el fine-tune.

## Capacidades

- Generacion de texto y razonamiento general heredados del modelo base Qwen3.6-35B-A3B.
- Procesamiento de imagen y texto de entrada (pipeline `image-text-to-text`), incluyendo comprension de documentos escaneados.
- Codigo y razonamiento a nivel de repositorio, con soporte declarado para flujos de frontend y tareas agenticas.
- Preservacion del contexto de razonamiento entre mensajes historicos (thinking preservation), pensada para desarrollo iterativo.
- Capacidad de tool calling y function calling heredada del modelo base.
- Razonamiento multi-paso y uso como agente en pipelines automatizados.
- Capacidades multilingues del modelo base (no verificadas especificamente en el fine-tune).
- Especializacion declarada en acronimos y terminologia de seguros francesa.

## Casos de uso

- Tramitacion de siniestros: el modelo puede leer partes de siniestro escaneados (imagen) y extraer campos estructurados interpretando acronimos del sector asegurador frances, aprovechando la ventana de 262.144 tokens para procesar expedientes completos en una sola pasada.
- Atencion al cliente en seguros: gestion de conversaciones multi-turno con clientes francofonos, resolviendo consultas sobre coberturas, primas y exclusiones con vocabulario tecnico correcto gracias al ajuste LoRA.
- Analisis de polizas y condiciones generales: resumen y comparacion de clausulas contractuales largas, donde el contexto extendido permite ingerir documentos completos sin truncado.
- Generacion de informes tecnicos de suscripcion: redaccion de evaluaciones de riesgo a partir de datos estructurados y documentos adjuntos, con terminologia consistente con el sector.
- Enriquecimiento de bases de datos documentales: clasificacion y etiquetado de correspondencia y formularios del sector seguros, usando el encoder de vision para documentos escaneados y el LLM para normalizar acronimos.
- Asistente interno para agentes y peritos: consulta en lenguaje natural sobre normativa y jerga aseguradora francesa, con soporte de tool calling para consultar sistemas internos de polizas.
- Prototipado de pipelines RAG sobre corpus regulatorios: el contexto de 262K tokens permite incluir grandes bloques de documentacion normativa junto a la pregunta del usuario sin recurrir a chunking agresivo.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al modelo base Qwen3.6-35B-A3B en la model card. No se han publicado resultados de benchmarks especificos del fine-tune `qwen36-fr-ins-15ep`.

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |

Estos valores corresponden al modelo base antes del fine-tune LoRA y no deben interpretarse como rendimiento del checkpoint adaptado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 72 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica se requieren 80 GB o mas por instancia.
- Cuantizacion a 8 bits: alrededor de 36-40 GB de VRAM, viable en una A100 80GB con margen o en H100.
- Cuantizacion a 4 bits: alrededor de 18-22 GB, potencialmente desplegable en una RTX 4090 (24 GB) o RTX 5090, aunque con limitaciones de contexto largo.
- GPU recomendadas: H100 80GB, A100 80GB, H200 o multiples GPU para servir el modelo en precision completa con contexto extendido.
- Despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers segun la model card del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada. La activacion de solo 3B parametros por token deberia reducir el coste computacional frente a un modelo denso de 35B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen36-fr-ins-15ep (este) | 35B / 3B | 262.144 nativos (hasta 1.010.000) | no disponible (fine-tune) | Apache 2.0 | Hugging Face |
| Qwen3.6-35B-A3B (base) | 35B / 3B | 262.144 nativos (hasta 1.010.000) | 73.4 | Apache 2.0 | Hugging Face |
| Qwen3.5-35B-A3B | 35B / 3B | no disponible en la informacion | 70.0 | Apache 2.0 | Hugging Face |
| Gemma4-31B | 31B denso | no disponible en la informacion | 52.0 | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion del fine-tune: el rendimiento en tareas generales puede degradarse respecto al modelo base por sobreajuste al dominio de seguros frances.
- El ajuste se centra en acronimos y terminologia de seguros en frances; el comportamiento en castellano o en otros dominios no esta verificado y podria verse afectado negativamente.
- Riesgo de alucinacion en terminologia especializada: un fine-tune de dominio puede generar acronimos plausibles pero incorrectos, especialmente en contextos ambiguos.
- Sesgos: no documentados por el autor; se heredan los del modelo base Qwen3.6, no auditados en esta ficha.
- La model card no especifica el dataset de entrenamiento, por lo que no es posible evaluar contaminacion, cobertura ni calidad de las etiquetas.
- Solo 37 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del modelo base Qwen3.6-35B-A3B enlazada en la model card antes de uso comercial.
- El repo ocupa 71,9 GB, lo que implica requisitos de almacenamiento y transferencia considerables.
- No se ofrecen versiones cuantizadas oficiales (GGUF, AWQ, GPTQ) en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/rlondner/qwen36-fr-ins-15ep
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog del modelo base: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Qwen Chat: https://chat.qwen.ai
