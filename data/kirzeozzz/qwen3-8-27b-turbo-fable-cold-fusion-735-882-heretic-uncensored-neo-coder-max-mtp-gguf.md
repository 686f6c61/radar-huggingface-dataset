# kirzeozzz/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es una cuantizacion GGUF de un fine-tune multi-etapa del modelo Qwen3.8-27B, publicado por el usuario kirzeozzz a partir del trabajo original de DavidAU. El modelo base es DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, y esta version concreta empaqueta cuantizaciones tanto "regular" como "MTP" (Multi-Token Prediction) con doble imatrix (DI-MATRIX), orientadas a inferencia en hardware de consumo.

El autor lo presenta como un fine-tune "multi-stage" y "multi-merge" con tres objetivos declarados: reducir el numero de tokens de razonamiento (hasta 1/10 en algunos casos, con una reduccion mediana de aproximadamente 2/3), elevar las metricas de los benchmarks ARC-C y ARC-E, y mantener el rendimiento en los tres modos de pensamiento del modelo. Segun la model card, alcanza 735 en ARC-C en 8 bits y 719 en 4 bits, cifras que el autor situa en el rango de los modelos propietarios.

El modelo tiene 26.895.998.464 parametros (aproximadamente 27B), pipeline image-text-to-text, licencia Apache 2.0 declarada, idiomas en y zh, y un repositorio de 389 GB que contiene multiples variantes de cuantizacion. Es relevante para quienes buscan un modelo de ~27B con capacidades de razonamiento, codigo y escritura creativa, ejecutable en GPU de consumo mediante llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8), con soporte MTP (Multi-Token Prediction); detalles completos no disponibles |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 4 bits y 8 bits (variantes "regular" y "MTP" con doble imatrix); lista completa de quants no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo con safetensors del modelo base implicito; este repo es solo GGUF) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un derivado de la familia Qwen3.8 con soporte de Multi-Token Prediction (MTP), una tecnica de decodificacion que predice varios tokens por paso para acelerar la generacion. El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la model card no las describe en detalle.

El entrenamiento se describe como un proceso multi-etapa y multi-merge construido sobre el metodo propietario "COLD FUSION" (combinacion de una tecnica llamada "GAIN" con los entrenadores de Unsloth) y "Fable Fusion 711". Segun el autor, "GAIN" ajusta dinamicamente el entrenamiento por muestra en tiempo real segun aprende el modelo. Los datasets citados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO. El modelo incorpora tecnicas de "abliteration"/"heretic" para eliminar rechazos, y se declara entrenado con Unsloth en hardware de consumo.

## Capacidades

- Generacion de texto general, razonamiento y resolucion de problemas, con tres modos de pensamiento declarados.
- Generacion de codigo (etiqueta "coder" y "NEO-CODER" en el nombre).
- Escritura creativa, ficcion, narrativa y roleplaying en multiples generos.
- Razonamiento con bloques de pensamiento reducidos (hasta 1/10 del tamano original en algunos casos) gracias al ajuste "TURBO".
- Capacidades multimodales image-text-to-text (heredadas del pipeline declarado; sin detalle en la model card).
- Soporte multilingue limitado a ingles y chino.
- El autor menciona en la pestana "community" un rendimiento destacado en tool calling, aunque no se aportan datos verificables en la informacion disponible.
- Modelo "uncensored"/"abliterated": no aplica rechazos por contenido.

## Casos de uso

- Escritura creativa y ficcion: el modelo esta especificamente afinado para narrativa, generos multiples y roleplaying; su capacidad de generar hooks y dialogos se ilustra en los ejemplos de la model card, lo que lo hace adecuado para asistencia de autores y generacion de borradores.
- Generacion de codigo en local: con etiqueta "coder" y cuantizaciones de 4 y 8 bits, puede ejecutarse en estaciones de trabajo con GPU de consumo para autocompletado, generacion de funciones y refactorizacion sin depender de APIs externas.
- Razonamiento con bajo consumo de tokens: la reduccion de tokens de pensamiento (mediana ~2/3) lo hace util en pipelines donde el coste por token o la latencia importan, como agentes autonomos con muchas llamadas.
- Despliegue en hardware de consumo: al ofrecerse en GGUF de 4 bits, permite inferencia local en GPU de gama alta de consumo mediante llama.cpp u Ollama, util para prototipado y entornos con requisitos de privacidad.
- Chat conversacional multi-turno: el pipeline conversational y el ajuste para escritura sugieren uso en asistentes conversacionales, aunque el contexto maximo no esta documentado.
- Experimentacion en investigacion: al ser un fine-tune abliterated con metodos de entrenamiento novedosos (COLD FUSION, GAIN), sirve como objeto de estudio para quienes investigan tecnicas de ajuste y merge de modelos.
- Generacion de contenido sin filtros: para casos donde se requiere creatividad sin rechazos (ficcion adulta, narrativa oscura), aunque con las advertencias legales y eticas correspondientes.

## Benchmarks y rendimiento

Los datos provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente.

| Benchmark | 8 bits | 4 bits | Referencia declarada |
|---|---|---|---|
| ARC-C | 735 | 719 | Qwen 3.8 27B base: 591 (144 pts menos) |
| ARC-E | >880 | no disponible | "zona de inteligencia" de OpenAI, Claude y Gemini |

El autor afirma que el modelo supera al Qwen 3.8 27B base y a Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en "los 7 benchmarks criticos", pero no se detallan los otros cinco ni sus valores. No se han publicado resultados verificables de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en 4 bits, aproximadamente 14-16 GB para los pesos (27B x ~0.5 bytes/parametro) mas overhead de contexto; en 8 bits, aproximadamente 27-30 GB.
- GPU recomendadas: para 8 bits, A100 40GB, H100 o RTX 4090 24GB (ajustado); para 4 bits, RTX 4090, RTX 3090, RTX 4080 o superiores.
- Cabe en GPU de consumo: si, en 4 bits cabe en GPUs de 16-24 GB (RTX 4080/4090, 3090); en 8 bits requiere 24 GB con contexto limitado o GPUs profesionales.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el soporte de MTP puede requerir builds especificos.
- Latencia y throughput: no disponibles; el autor afirma que la generacion es mas rapida que el modelo base, especialmente con MTP, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TURBO) | ~27B | no disponible | Apache 2.0 | GGUF | Fine-tune multi-etapa, abliterated, ARC-C 735 (8b) |
| Qwen3.8 27B (base) | ~27B | no disponible | Apache 2.0 | safetensors/GGUF | ARC-C 591 segun el autor |
| Qwen3.6 27B | ~27B | no disponible | Apache 2.0 | varios | Superado en los 7 benchmarks segun el autor, sin datos |
| Qwen3.6-35B-A3B | 35B (MoE, ~3B activos) | no disponible | Apache 2.0 | varios | Superado en los 7 benchmarks segun el autor, sin datos |

Los datos comparativos proceden unicamente de las afirmaciones del autor; no se dispone de mediciones independientes.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": no aplica filtros de seguridad, lo que puede producir contenido ofensivo, ilegal o danino; requiere supervision en produccion.
- Riesgo de alucinacion inherente a los modelos de ~27B, agravado por la reduccion de tokens de razonamiento, que puede mermar la verificacion de hechos.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado ni garantizado.
- Longitud de contexto no documentada: no es posible planificar aplicaciones de contexto largo sin verificacion empirica.
- Los benchmarks son autoinformados y no verificados; las afirmaciones de superar a modelos propietarios deben tratarse con cautela.
- El autor declara "zero benchmaxing", pero no hay evidencia independiente que lo confirme.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets subyacentes pueden tener condiciones adicionales no detalladas.
- Repositorio de 389 GB con multiples quants: requiere seleccion cuidadosa de la variante y espacio de disco considerable.
- Modelo creado en 2026-11-03 con 0 descargas y 1 like: sin validacion de la comunidad en el momento de la consulta.
- El soporte MTP puede no estar disponible en todos los runtimes; verificar compatibilidad antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/kirzeozzz/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Fine-tune de referencia del autor (COLD FUSION): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
