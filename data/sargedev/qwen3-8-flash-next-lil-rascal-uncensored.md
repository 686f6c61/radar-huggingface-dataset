# SargeDev/qwen3.8-flash-next-lil-rascal-uncensored

## Resumen

SargeDev/qwen3.8-flash-next-lil-rascal-uncensored es un checkpoint derivado del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario SargeDev. Se trata de una version "abliterated" (es decir, con la direccion de rechazo eliminada del espacio de activaciones) construida sobre un checkpoint ya cuantizado en NVFP4/MXFP8 de la organizacion local-inference-lab, identificado en el manifiesto de exportacion como `template_model`. El resultado es un modelo sin filtrado de contenido, con 92.676.653.971 parametros almacenados en safetensors y un repositorio de 105,9 GB.

El modelo hereda la licencia Qwen Community License 1.0 del modelo base y se distribuye como artefacto de investigacion, no como asistente de produccion. Las etiquetas del repositorio lo clasifican como MoE (mezcla de expertos) y hacen referencia a la familia "qwen3.8-flash-next", con soporte declarado para vLLM y para hardware DGX Spark / GB10. La receta de servicio indicada por el autor es TP=1, MTP 3, KV en fp8 y MAX_MODEL_LEN de 262.144 tokens.

Su relevancia es acotada y muy especifica: interesa a equipos de seguridad, red-teaming e investigacion sobre alineacion que necesitan un modelo sin capas de rechazo para evaluar defenses, medir tasas de refusal o estudiar el efecto de la abliteracion combinada con cuantizacion agresiva. No hay benchmarks publicados ni validacion de la comunidad (0 descargas y 0 "likes" en el momento de la consulta), por lo que cualquier uso debe partir de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun las etiquetas del repositorio (`moe`, `qwen4_exp`); detalle de capas y configuracion no disponible |
| Parametros totales | 92.676.653.971 (~92,7 mil millones), dato real de los safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens segun la receta de servicio vLLM indicada por el autor (MAX_MODEL_LEN 262144); no confirmado en documentacion adicional |
| Tipos de cuantizacion | NVFP4 y MXFP8 (8 bits), generados con NVIDIA ModelOpt; el autor no documenta otras variantes |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0, heredada del modelo base) |
| Formato de pesos | safetensors (checkpoint cuantizado NVFP4/MXFP8; el repositorio ocupa 105,9 GB) |

Otros datos del repositorio: creado el 19 de septiembre de 2026 y actualizado el mismo dia, 0 descargas, 0 "likes", pipeline no disponible, region US.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de las etiquetas del repositorio, que indican mezcla de expertos (`moe`) y la familia experimental `qwen4_exp`. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF, DPO u otra fase de alineacion. Lo unico documentado es la cadena de derivacion: el punto de partida es Qwen/Qwen3.8-Flash-Next, sobre el que se aplico una cuantizacion NVFP4/MXFP8 (checkpoint de local-inference-lab, referenciado como `template_model` en `export-manifest.json`) y, a continuacion, un proceso de abliteracion descrito por el autor como "homebrew workflow", sin mas detalle tecnico.

La abliteracion consiste, en terminos generales, en localizar la direccion del espacio de activaciones o de pesos que media en la conducta de rechazo y proyectarla fuera del modelo, de modo que se reducen drásticamente las negativas a responder. El autor no especifica que metodo concreto ha empleado, ni sobre que capas, ni con que conjunto de prompts de calibracion. Tampoco documenta si hubo ajuste posterior, evaluacion de la degradacion de capacidades o verificacion de que la cuantizacion NVFP4/MXFP8 no interactua de forma negativa con la abliteracion. La unica innovacion tecnica mencionada es de despliegue: soporte de MTP (multi-token prediction) con 3 tokens especulativos en la receta de vLLM.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: heredadas del modelo base Qwen3.8-Flash-Next, aunque el autor no detalla el alcance real ni las tareas evaluadas.
- Ausencia de filtrado de contenido: el checkpoint esta abliterado y el propio autor lo describe como "modelo base sin censura", pensado para investigacion de refusal-bypass.
- Decodificacion especulativa: la receta de servicio incluye MTP con 3 tokens, lo que implica soporte de multi-token prediction en vLLM.
- Contexto largo: la configuracion de servicio admite hasta 262.144 tokens con KV en fp8, lo que habilita tareas de contexto extenso si el hardware lo permite.
- Razonamiento, codigo, matematicas y capacidades multilingues: no disponible; no se documentan en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision o audio: no disponible; no hay ninguna referencia a modalidades adicionales.

## Casos de uso

- Red-teaming de sistemas de moderacion: usar el modelo como generador de ataques y prompts adversarios para medir la tasa de deteccion de un clasificador de contenido propio, aprovechando que no incorpora rechazos previos.
- Investigacion sobre abliteration: comparar las respuestas de este checkpoint con las del modelo base Qwen3.8-Flash-Next para cuantificar en que medida cambia la tasa de refusal, la coherencia y la utilidad en tareas neutras.
- Estudio del impacto de la cuantizacion en el comportamiento: al estar construido sobre un checkpoint NVFP4/MXFP8, permite analizar si la cuantizacion a 8 y 4 bits altera la calidad del texto o la eficacia de la abliteracion frente a pesos en precision completa.
- Generacion de datos sinteticos para entrenar clasificadores de seguridad: producir ejemplos etiquetados de contenido problematico en un entorno aislado para alimentar detectores, siempre con revision humana y sin publicar los datos generados.
- Evaluacion de pipelines de inferencia en hardware compacto: validar la receta de vLLM con TP=1, MTP 3 y KV en fp8 sobre una DGX Spark / GB10 con 128 GB de memoria unificada, y medir latencia y throughput reales en contexto largo.
- Pruebas de robustez de KV cache y contexto de 262.144 tokens: verificar estabilidad, uso de memoria y degradacion de la atencion en ventanas muy largas dentro de un banco de pruebas controlado.
- Experimentacion local autoalojada: escenarios de investigacion academica en los que se necesita un modelo grande sin dependencia de API externas ni telemetria de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones de seguridad (por ejemplo, tasas de refusal o de jailbreak), y tampoco se ofrecen mediciones de latencia o throughput para la receta de vLLM propuesta.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 105,9 GB en disco, por lo que se necesita un minimo de aproximadamente 106 GB de VRAM o memoria unificada solo para cargar el checkpoint, mas el espacio de la KV cache en fp8 y las activaciones. El autor no publica una cifra de consumo total.
- DGX Spark / GB10: es el objetivo declarado del autor. Con 128 GB de memoria unificada y la receta TP=1, MTP 3, KV en fp8 y MAX_MODEL_LEN 262144, el modelo deberia caber, aunque no hay mediciones confirmadas.
- GPU de centro de datos: un solo acelerador de 80 GB (A100, H100) no es suficiente; se requeriria tensor parallel en al menos 2 x H100 80 GB o 2 x A100 80 GB. Una B200 con 192 GB podria alojarlo en un solo dispositivo (estimacion, no confirmada).
- GPU de consumo: no cabe en RTX 4090 (24 GB), RTX 5090 (32 GB) ni en ninguna GPU consumer actual, dado el tamano del checkpoint.
- Opciones de despliegue: vLLM es la ruta documentada por el autor. No se confirma compatibilidad con llama.cpp, Ollama, TGI o SGLang; el formato NVFP4/MXFP8 generado con ModelOpt requiere soporte especifico y no hay versiones GGUF publicadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| SargeDev/qwen3.8-flash-next-lil-rascal-uncensored | 92,7 mil millones | 262.144 tokens (segun receta de servicio) | NVFP4 / MXFP8 | qwen-community-1.0 | Abliterado, sin filtrado, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible en la informacion | no disponible | original sin cuantizar | qwen-community-1.0 | Modelo upstream con alineacion intacta |
| local-inference-lab/Qwen3.8-Flash-Next-NVFP4 | no disponible en la informacion | no disponible | NVFP4 / MXFP8 | no disponible | Checkpoint cuantizado sobre el que se construye esta variante |

No se dispone de informacion sobre otras alternativas abliteradas de la misma familia o tamano que permitan una comparacion de rendimiento. Los resultados de la busqueda web no aportan ningun modelo comparable.

## Limitaciones y advertencias

- Modelo sin censura: no incorpora filtrado de contenido y, por diseno, no rechaza peticiones daninas. El propio autor lo declara como su principal riesgo.
- Riesgo de alucinacion: no hay evaluaciones publicadas; un checkpoint abliterado y cuantizado a 4/8 bits puede degradar la fidelidad factual respecto al modelo original.
- Ausencia total de validacion externa: 0 descargas y 0 "likes" en el momento de la consulta, sin benchmarks ni informes de terceros.
- Idiomas no documentados: no se especifica que lenguas soporta ni con que calidad.
- Licencia: Qwen Community License 1.0 (heredada), etiquetada como `license:other`. Es imprescindible revisar las condiciones del upstream antes de cualquier uso, incluido el comercial, y la publicacion de un derivado no otorga permisos adicionales.
- Uso previsto restringido: el autor limita el artefacto a investigacion de seguridad, red-teaming, estudio academico y experimentacion local privada. No debe utilizarse como asistente de produccion ni en entornos regulados o de alto riesgo.
- Usos prohibidos explicitos: el autor veta cualquier fin ilicito, CSAM, imagenes intimes no consentidas, fraude, malware, armas, incitacion a la violencia o acoso.
- Naturaleza experimental del pipeline: el proceso de abliteration es un "homebrew workflow" sin documentacion de capas, prompts de calibracion ni evaluacion de danos colaterales.
- Interaccion cuantizacion-abliteration no verificada: no se ha comprobado si la cuantizacion NVFP4/MXFP8 afecta a la eliminacion de la direccion de rechazo ni a la coherencia general.
- Contexto de 262.144 tokens condicionado al hardware: sostener esa ventana con KV en fp8 exige una cantidad de memoria muy superior a la de los pesos, y no hay cifras publicadas de consumo real.
- Obligaciones legales: la distribucion y el uso de un modelo sin filtrado pueden entrar en conflicto con normativa aplicable (por ejemplo, obligaciones de moderacion bajo el reglamento europeo de IA segun el caso de uso). Procede una revision de cumplimiento previa a cualquier despliegue.
- Advertencia de garantia: el autor distribuye los pesos "tal cual", sin garantia de exactitud, idoneidad o no infraccion, y declina responsabilidad sobre los resultados generados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SargeDev/qwen3.8-flash-next-lil-rascal-uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint cuantizado de origen: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4
- Manifiesto de exportacion (`export-manifest.json`): referenciado en la model card del autor; no se proporciona URL directa
- Paper tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante; los resultados devueltos no guardan relacion con el modelo
