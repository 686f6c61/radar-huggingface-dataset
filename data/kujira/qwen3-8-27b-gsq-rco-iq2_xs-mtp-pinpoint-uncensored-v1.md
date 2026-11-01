# Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-Pinpoint-Uncensored-v1

## Resumen

Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-Pinpoint-Uncensored-v1 es una cuantizacion GGUF modificada del modelo Qwen3.8-27B, publicada por el usuario Kujira sobre la base cuantizada de ISTA-DASLab. El modelo original pertenece a la familia Qwen3.8 desarrollada por el equipo Qwen de Alibaba, con 27.320.697.856 parametros totales. Esta version concreta aplica una edicion no divulgada cuyo objetivo es reducir el comportamiento de rechazo (refusal) del modelo base, manteniendo el resto de tensores byte a byte identicos al fichero original.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion (GSQ-RCO) aplicada a un modelo de ~27B en formato IQ2_XS con cabeza MTP para decodificacion especulativa; por otro, ilustra el ecosistema de variantes "uncensored" que eliminan las capas de alineacion de seguridad. El autor reporta una caida de rechazos del 88,5% al 1% en un conjunto de 104 peticiones daninas, con un impacto minimo en perplejidad (diferencias inferiores al 0,3%).

El modelo se distribuye unicamente como un fichero GGUF de 8,8 GB con cuantizacion IQ2_XS, pensado para inferencia en llama.cpp. No incluye el proyector de vision, y el uso multimodal no ha sido probado. La licencia declarada es Apache-2.0, heredada del modelo base y de la cuantizacion original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8), con cabeza MTP para decodificacion especulativa; detalles completos de la arquitectura base no disponibles en la informacion proporcionada |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XS (unico fichero publicado); KV cache q8_0 en la evaluacion |
| Idiomas soportados | no disponible oficialmente; la evaluacion cubre ingles y japones |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero unico de 8,8 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de 27.320.697.856 parametros. La version aqui descrita es una cuantizacion IQ2_XS realizada por ISTA-DASLab mediante el esquema GSQ-RCO, que incluye una cabeza MTP (multi-token prediction) destinada a decodificacion especulativa. El fichero conserva los mismos tipos de cuantizacion y tamano que el build original `-mtp`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

Sobre esa cuantizacion, el autor Kujira aplica una edicion "Pinpoint" cuyo metodo no se divulga. Segun la model card, la modificacion afecta a una parte muy pequena del modelo y todos los demas tensores son byte a byte identicos al fichero original. La evaluacion del autor compara tres ficheros de la misma cuantizacion IQ2_XS-mtp (original, build Heretic y este modelo) y verifica que la distribucion del primer token difiere con una divergencia KL de 0,006 o menos en 64 prompts, con el mismo token mas probable en 62 de ellos.

## Capacidades

- Generacion de texto conversacional en formato GGUF compatible con llama.cpp.
- Razonamiento con modo "thinking" habilitado (la evaluacion se realizo con thinking activo).
- Tool calling / function calling: 97% de acierto en nombre de herramienta y 100% en argumentos sobre 40 tareas de prueba.
- Seguimiento de turnos tras resultado de herramienta: 100% en la evaluacion del autor.
- Tareas largas multi-paso: 24 tareas evaluadas, con un 12% que alcanzo el limite de tokens y un 4% de salida vacia.
- Decodificacion especulativa mediante cabeza MTP incluida en el fichero.
- Multilingue parcial: la evaluacion cubre ingles y japones; no hay lista oficial de idiomas.
- Vision: el proyector `mmproj` no esta incluido y el uso multimodal no fue probado.
- Comportamiento "uncensored": reduccion de rechazos del 88,5% al 1% en peticiones daninas segun el autor.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar como una edicion localizada de pesos altera la tasa de rechazo sin degradar la perplejidad, comparando con el fichero original y el build Heretic.
- Evaluacion de tecnicas de cuantizacion extrema: el fichero IQ2_XS de 8,8 GB para 27B parametros sirve para medir la degradacion de calidad frente a cuantizaciones mayores en tareas de codigo, japones e ingles.
- Pruebas de decodificacion especulativa: la cabeza MTP incluida permite validar el rendimiento de speculative decoding en llama.cpp sin necesidad de un modelo draft separado.
- Desarrollo de pipelines de agentes con tool calling: el 97-100% de acierto en nombre y argumentos lo hace util para prototipar orquestacion de herramientas en local.
- Despliegue en hardware de consumo: al ocupar 8,8 GB, cabe en GPUs consumer de 12 GB o mas con offload parcial, lo que facilita experimentos sin infraestructura de datacenter.
- Generacion de codigo asistida en local: la perplejidad en codigo (3,982) es la mas baja de las categorias evaluadas, lo que sugiere un comportamiento razonable en ese dominio pese a la cuantizacion agresiva.
- Analisis de contenido sin filtros en entornos controlados: util para estudiar respuestas del modelo a peticiones sensibles, siempre con salvaguardas externas y dentro de un marco legal.

## Benchmarks y rendimiento

Datos reportados por el autor de la model card. Todas las cifras comparan tres ficheros de la misma cuantizacion IQ2_XS-mtp.

| Metrica | Original | Heretic build | Este modelo |
|---|---|---|---|
| Rechazo en peticiones daninas (104) | 88,5% | 1% | 1% |
| Rechazo en peticiones inofensivas (100) | 4% | 1% | 1% |
| Bucles (daninas / inofensivas) | 0% / 1% | 1% / 1% | 0% / 0% |
| Respuestas vacias (daninas / inofensivas) | 0% / 2% | 1% / 2% | 2% / 2% |
| Tareas largas: limite de tokens | 8% | 21% | 12% |
| Tareas largas: bucles | 0% | 0% | 4% (1 tarea) |
| Tareas largas: salida vacia | 4% | 4% | 4% |
| Tareas largas: tokens medios | 2.151 | 2.260 | 2.083 |
| Tool calls: nombre / argumentos correctos | 97% / 100% | 100% / 100% | 97% / 100% |
| Sin tool call cuando no hace falta | 90% | 100% | 90% |
| Turno de seguimiento tras resultado | 100% | 100% | 100% |

Perplejidad con teacher forcing (chunks de 512 tokens, textos internos de referencia):

| Corpus | Original | Este modelo |
|---|---|---|
| Ingles | 5,553 | 5,546 |
| Japones | 18,333 | 18,355 |
| Codigo | 3,978 | 3,982 |
| Corpus general | 4,161 | 4,161 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 8,8 GB; con KV cache q8_0 y contexto moderado, el uso total ronda los 10-12 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para carga completa en GPU; A100 o H100 para mayor contexto y throughput.
- Cabe en GPU consumer: si, en tarjetas de 12 GB o mas con `-ngl` ajustado; en 8 GB requiere offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), y por compatibilidad GGUF potencialmente Ollama y otros runners basados en llama.cpp; vLLM y TGI no soportan GGUF de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada. La cabeza MTP permite decodificacion especulativa, que puede mejorar el throughput frente a decodificacion autoregresiva estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Kujira Pinpoint-Uncensored v1) | 27,3B | no disponible | IQ2_XS, 8,8 GB | Apache-2.0 | Rechazos reducidos al 1%; edicion no divulgada |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF (original) | 27,3B | no disponible | IQ2_XS-mtp | Apache-2.0 | Referencia base; rechazos 88,5% |
| 0bserverx/Qwen3.8-27B-Heretic-GSQ-RCO-GGUF | 27,3B | no disponible | IQ2_XS (cuantizacion separada) | Apache-2.0 | Rechazos 1%; perplejidad no comparable directamente |
| Qwen/Qwen3.8-27B (base sin cuantizar) | 27,3B | no disponible | BF16 | Apache-2.0 | Modelo original del equipo Qwen |

## Limitaciones y advertencias

- La deteccion de rechazos se hizo por coincidencia de frases, sin revision humana; respuestas que evitan la peticion sin frase de rechazo no se contabilizan.
- Los conjuntos de evaluacion son pequenos: una peticion equivale aproximadamente al 1%, y el 1-3% restante de rechazos varia entre ejecuciones.
- Solo se probaron peticiones de un turno sin system prompt; no se evaluaron conversaciones multi-turno, system prompts ni peticiones reformuladas o adversariales.
- Solo se publica el build IQ2_XS-mtp; la vision no fue probada y el proyector `mmproj` no esta incluido.
- El metodo de edicion no se divulga, lo que impide auditar que tensores exactos se modificaron y como.
- Riesgo elevado de alucinacion y de contenido danino, ofensivo o inexacto: el modelo sigue muchas peticiones que el original rechaza.
- La cuantizacion IQ2_XS es muy agresiva; aunque la perplejidad se mantiene, el rendimiento en tareas complejas puede degradarse frente a cuantizaciones mayores.
- La licencia Apache-2.0 permite uso comercial, pero el autor exige anadir salvaguardas propias antes de servir el modelo a terceros y cumplir la legislacion aplicable.
- No hay lista oficial de idiomas soportados; la evaluacion se limita a ingles y japones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-Pinpoint-Uncensored-v1
- Cuantizacion base (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Build Heretic de referencia: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-GSQ-RCO-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper GSQ (arxiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper RCO (arxiv:2605.00649): https://arxiv.org/abs/2605.00649
