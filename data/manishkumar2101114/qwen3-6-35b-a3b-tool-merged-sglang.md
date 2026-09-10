# manishkumar2101114/qwen3.6-35b-a3b-tool-merged-sglang

## Resumen

Qwen3.6-35B-A3B tool-merged (Marg voice agents) es un modelo derivado publicado por el usuario manishkumar2101114 en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un merge de un adaptador LoRA sobre el modelo base Qwen/Qwen3.6-35B-A3B-FP8: los pesos del base, originalmente en FP8, se dequantizaron a BF16 durante el proceso de fusion, y sobre ellos se aplico un adaptador LoRA de rango 32 entrenado durante 3 epocas sobre 1515 dialogos de llamada a herramientas (tool calling) con enmascarado de perdida solo en la completion.

El objetivo declarado es servir como componente de razonamiento y llamada a herramientas en agentes de voz (mencionados como "Marg voice agents"), con una plantilla de chat personalizada (qwen3_template333.jinja). El resultado del entrenamiento reportado por el autor es una perdida de entrenamiento de 0.2029 y una perdida de evaluacion de 0.2047, valores que sugieren un ajuste estrecho sobre el dominio de tool calling del conjunto de datos, aunque no se aportan metricas de evaluacion funcional ni benchmarks.

Con 35.107.181.936 parametros totales y un repositorio de 70,2 GB, el modelo corresponde a la familia Qwen3.6 en su variante MoE de 35B con nomenclatura A3B (aproximadamente 3.000 millones de parametros activos, inferido del nombre, no confirmado en la model card). Su relevancia actual es limitada y experimental: acumula 0 descargas y 0 likes, no declara licencia ni idiomas, y no publica resultados de benchmarks, por lo que debe considerarse un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo mixture-of-experts (MoE); etiqueta de libreria `qwen3_5_moe`. Derivado por merge de LoRA sobre Qwen/Qwen3.6-35B-A3B-FP8 |
| Parametros totales | 35.107.181.936 (aproximadamente 35,1 B), dato real de safetensors |
| Parametros activos | Aproximadamente 3 B, inferido de la nomenclatura "A3B" del nombre; no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en BF16 tras dequantizar el base desde FP8; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 70,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo base Qwen/Qwen3.6-35B-A3B-FP8, un transformer con capas de mezcla de expertos (MoE) segun la etiqueta `qwen3_5_moe` del repositorio, con 35,1 B de parametros totales y una fraccion activa por token del orden de 3 B segun la nomenclatura del nombre. No se dispone de informacion sobre el numero de capas, el numero de expertos, el enrutador, la dimensionalidad del modelo ni el mecanismo de atencion empleado, y la model card del autor no los detalla.

El proceso de creacion descrito es un merge de adaptador: se partio de los pesos FP8 del base, se dequantizaron a BF16 en el momento de la fusion y se aplico un adaptador LoRA de rango 32 entrenado durante 3 epocas sobre 1515 dialogos de tool calling, con perdida calculada unicamente sobre la completion (completion-only) y una plantilla de chat personalizada denominada `qwen3_template333.jinja`. Las perdidas reportadas son 0.2029 en entrenamiento y 0.2047 en evaluacion. No se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO sobre el modelo base o sobre el merge. El nombre del repositorio incluye el sufijo `sglang`, lo que sugiere que el artefacto se preparo para su despliegue con el motor SGLang, aunque no se documenta ninguna optimizacion especifica.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.6-35B-A3B; no se documentan capacidades concretas en la model card.
- Llamada a herramientas (tool calling / function calling): es la capacidad objetivo del ajuste, entrenada explicitamente sobre 1515 dialogos de tool call.
- Uso previsto como componente de agentes de voz ("Marg voice agents"), presumiblemente como el modulo de razonamiento y seleccion de herramientas dentro de una arquitectura de voz externa. No hay evidencia de que el modelo procese audio de forma nativa.
- Conversacion multi-turno: plausible dado el formato de dialogo del entrenamiento, aunque no se documenta el tratamiento del historial ni la ventana de contexto.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking), vision, audio u otras capacidades especiales: no disponible.
- Razonamiento multi-paso y agentes: no verificado; el entrenamiento se limita a dialogos de llamada a herramientas, sin evidencia documentada de planificacion encadenada.

## Casos de uso

- Atencion al cliente automatizada por voz: el modelo actua como cerebro de un agente telefonico que consulta sistemas internos (estado de pedidos, facturacion, incidencias) mediante tool calling. Su ajuste sobre dialogos de llamada a herramientas encaja con este escenario, aunque el contexto disponible no esta documentado.
- Enrutado de intenciones en centralitas: clasificar la peticion del usuario y decidir que herramienta invocar antes de transferir a un agente humano, aprovechando el entrenamiento especifico en seleccion de funciones.
- Orquestacion de herramientas en asistentes de agenda: reserva, modificacion y cancelacion de citas mediante llamadas a APIs de calendario, con el modelo generando los argumentos estructurados de cada funcion.
- Soporte tecnico de primer nivel en pipelines de automatizacion: el modelo recibe la consulta, decide que API de diagnostico invocar y redacta la respuesta con el resultado devuelto.
- Backend de function calling para agentes RPA: integracion en flujos que necesitan traducir lenguaje natural a llamadas de sistema de forma fiable y con formato controlado por la plantilla `qwen3_template333.jinja`.
- Prototipado e investigacion sobre tool use: al ser un merge reproducible a partir de un adaptador LoRA de rango 32 y 3 epocas, sirve como punto de partida para estudiar el efecto del ajuste fino en llamada a herramientas sobre un MoE de 35B.
- Despliegue de alto throughput con SGLang: el sufijo del repositorio sugiere compatibilidad con este motor, util para servir el modelo en batching continuo si se dispone del hardware necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las unicas metricas aportadas por el autor son las perdidas de entrenamiento y evaluacion del adaptador LoRA: 0.2029 y 0.2047 respectivamente. No se proporcionan resultados de MMLU, HumanEval, GSM8K, BFCL ni de ninguna evaluacion de tool calling, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 70,2 GB solo para los pesos, mas la memoria de la cache KV, que depende de la longitud de contexto (no documentada). Como referencia practica, se necesitan al menos 80 GB de VRAM para contextos cortos, y 2 x 80 GB o una GPU de 141 GB para margenes comodos.
- GPU recomendadas: H200 (141 GB) en una sola tarjeta; 2 x A100 80 GB o 2 x H100 80 GB para tensor parallelism; A100 40 GB queda descartada en BF16 sin cuantizacion.
- Cabe en GPU de consumo: no. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) no pueden alojar los 70,2 GB de pesos en BF16. No se han publicado cuantizaciones GGUF, AWQ ni GPTQ de este repositorio, por lo que no hay una ruta directa a consumer GPU.
- Opciones de despliegue: SGLang es la opcion sugerida por el nombre del repositorio; vLLM y TGI son alternativas plausibles si el motor soporta la arquitectura `qwen3_5_moe`, extremo no confirmado. La conversion a GGUF para llama.cpp u Ollama no esta documentada y depende del soporte de dicha arquitectura en esas herramientas.
- Latencia y throughput estimados: no disponible. Al tratarse de un MoE con una fraccion activa pequena (del orden de 3 B), cabria esperar una latencia por token inferior a la de un modelo denso de 35 B, pero no hay mediciones publicadas.
- Nota sobre almacenamiento: el repositorio ocupa 70,2 GB, por lo que la descarga y el almacenamiento en disco requieren ese espacio adicional.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (manishkumar2101114/qwen3.6-35b-a3b-tool-merged-sglang) | 35,1 B | ~3 B (inferido del nombre) | no disponible | no disponible | safetensors BF16 | 0 descargas, 0 likes |
| Qwen/Qwen3.6-35B-A3B-FP8 (modelo base citado en la model card) | 35,1 B | no disponible | no disponible | no disponible en la informacion proporcionada | FP8 | Modelo de referencia citado por el autor del merge |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos para establecer una comparacion |

No se dispone de informacion suficiente sobre modelos comparables de terceros (parametros, contexto, rendimiento en tool calling, licencia) en el material proporcionado, por lo que no es posible ampliar la comparativa sin incurrir en datos no verificados.

## Limitaciones y advertencias

- Volumen de entrenamiento muy reducido: 1515 dialogos de tool calling y 3 epocas de LoRA r=32. El ajuste esta fuertemente orientado al dominio y al formato de esos datos, con riesgo de sobreajuste y de olvido catastrofico de capacidades generales del modelo base. Las perdidas de 0.2029 y 0.2047 no permiten descartar ninguno de los dos fenomenos.
- Dependencia de la plantilla de chat: el entrenamiento uso `qwen3_template333.jinja`. Servir el modelo con una plantilla distinta puede degradar de forma notable el formato de las llamadas a herramientas.
- Licencia no declarada: el repositorio no indica licencia. Dado que es un derivado de un modelo base de Qwen, la licencia heredada aplicable no queda clara en la informacion disponible. Es imprescindible verificar los terminos del modelo base antes de cualquier uso comercial.
- Idiomas no declarados: no hay informacion sobre el soporte multilingue real del merge ni sobre si el ajuste degrada idiomas distintos del usado en el entrenamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar nombres de funciones, argumentos o valores. En tool calling esto se traduce en llamadas invalidas o parametros incorrectos, un fallo especialmente costoso en produccion. No hay evaluaciones publicadas de fiabilidad de las llamadas.
- Ausencia de validacion externa: 0 descargas y 0 likes, sin benchmarks ni evaluaciones de terceros. No existe evidencia independiente de que el merge funcione mejor que el modelo base para tool calling.
- Ambiguedad de nomenclatura: el nombre del repositorio usa "qwen3.6" mientras la etiqueta de libreria es `qwen3_5_moe`. Conviene verificar la correspondencia real con la familia del modelo base.
- Sin capacidades de audio confirmadas: pese a la referencia a "voice agents" en el titulo, no hay ningun dato que indique que el modelo procese entrada o salida de audio; previsiblemente actua solo como componente de texto dentro de una arquitectura de voz externa.
- Coste de despliegue elevado: 70,2 GB en BF16 impiden su uso en GPU de consumo y obligan a infraestructura de datacenter, sin que existan cuantizaciones publicadas que reduzcan el requisito.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni dimensionar correctamente la cache KV.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manishkumar2101114/qwen3.6-35b-a3b-tool-merged-sglang
- Modelo base citado en la model card: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Adaptador citado: `qwen3.6-35b-a3b-tool-adapter-sglang` (LoRA r=32, 3 epocas, 1515 dialogos de tool calling, plantilla `qwen3_template333.jinja`); no se proporciona URL en la informacion disponible.
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes para este modelo; unicamente enlaces comerciales de Amazon.de sin relacion con el contenido de la ficha.
