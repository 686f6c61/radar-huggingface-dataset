# cyhoaoen/agentvln-qwen35-2b-r2r-quarter-step1000

## Resumen

agentvln-qwen35-2b-r2r-quarter-step1000 es un checkpoint intermedio (paso 1.000 de 4.039) de un ajuste fino completo sobre Qwen/Qwen3.5-2B, un modelo multimodal de 2,72 mil millones de parametros con pipeline image-text-to-text. El autor, cyhoaoen, lo entrena sobre la porcion R2R del dataset AgentVLN-Instruct (submuestreo de 1/4) para la tarea de navegacion visual y linguistica (Vision-and-Language Navigation, VLN) dentro del pipeline AgentVLN descrito en arXiv:2603.17670. El modelo recibe observaciones visuales de un entorno tipo Habitat y produce acciones de navegacion en un formato textual estricto.

Se trata de un artefacto de investigacion, no de un modelo acabado. El autor lo publica explicitamente como checkpoint intermedio con el objetivo de compararlo con su hermano de paso 500 bajo un protocolo de evaluacion fijo, aislando que aporta el entrenamiento adicional una vez que el modelo ya ha aprendido la gramatica de salida. La perdida en el momento del guardado es 0,2813, con una media de 0,2821 en los ultimos 10 puntos de registro; la curva cae de 2,12 a 0,36 en los primeros 30 pasos y despues se aplana.

La relevancia actual es doble. Por un lado, documenta una reconstruccion no trivial de etiquetas: la publicacion publica de AgentVLN-Instruct usa el esquema v1 y el codigo de entrenamiento desactiva automaticamente las muestras STOP y `<target>`, que son las dos unicas rutas por las que `agent_stopped` puede llegar a ser `True` en evaluacion. Por otro, detalla los parches de compatibilidad necesarios para llevar el colador de AgentVLN (disenado para Qwen3-VL) a Qwen3.5, en particular la reconstruccion de `mm_token_type_ids` para M-RoPE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5; numero de capas, cabezas y esquema de atencion no disponibles |
| Parametros totales | 2.721.801.024 (aprox. 2,72 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (`max_seq_length` usado en entrenamiento); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no se han publicado cuantizaciones (GGUF, AWQ, GPTQ, etc.); pesos distribuidos en bf16 |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache-2.0 (con incertidumbre juridica sobre los datos de entrenamiento, ver limitaciones) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 5,5 GB |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-2B |
| Paso de entrenamiento | 1.000 / 4.039 (24,8 %), epoca 0,248 |
| Perdida en el guardado | 0,2813 (media de los ultimos 10 registros: 0,2821) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-2B, un modelo multimodal de tipo image-text-to-text de 2,27 B de parametros segun la model card (2,72 B contabilizados en los safetensors del checkpoint). No se dispone de detalle publicado sobre el numero de capas, el mecanismo de atencion ni la configuracion exacta del codificador visual de Qwen3.5 en la informacion proporcionada. El ajuste es completo (full fine-tune) con el codificador visual congelado, en bf16, con gradient checkpointing y `attn_implementation=sdpa`. La unica adaptacion arquitectonica documentada es la incorporacion de `mm_token_type_ids` para el mecanismo M-RoPE de Qwen3.5, reconstruido como `(input_ids == image_token_id)` y verificado contra la salida del propio procesador, ya que el colador original de AgentVLN (orientado a Qwen3-VL) no lo pasaba. El modo de razonamiento (*thinking*) se elimino: las etiquetas se renderizan como turnos de asistente completados, de modo que la plantilla de chat emite un bloque `<think></think>` vacio.

Los datos de entrenamiento proceden de AgentVLN-Instruct, porcion R2R, con submuestreo de 1/4, asignacion proporcional por escena y muestreo a nivel de tarea (trayectoria), semilla 0: 2.703 tareas, 129.246 muestras y las 61 escenas retenidas. El entrenamiento distribuido uso DeepSpeed ZeRO-2 con offload del optimizador a CPU sobre 4 x RTX A5000, con learning rate 2e-5 (LLM), 2e-6 (vision) y 1e-5 (proyector), planificador coseno con 118 pasos de calentamiento y lote efectivo de 32 (batch 1 x acumulacion de gradiente 8 x 4 GPU). No se menciona RLHF ni DPO. La innovacion metodologica mas destacable no esta en el modelo sino en la reconstruccion de etiquetas: se restauraron las muestras STOP (accion 0, presente en el 100 % de las tareas pero filtrada por el cargador; +10.822 muestras) y las etiquetas `<target>` mediante un proxy basado en `trajectory_world[s] == trajectory_world[last]` (+189.040), ya que el esquema v3 original usa `trajectory_is_endpoint` y `trajectory_goal_distances`, campos ausentes en la publicacion publica. El autor advierte que se trata de una reconstruccion, no de una reproduccion.

## Capacidades

- Generacion de acciones de navegacion en formato textual estricto a partir de observaciones visuales, con etiquetas `<target>` y `STOP`.
- Razonamiento multimodal de un solo turno orientado a la tarea de VLN (seguimiento de instrucciones de navegacion en lenguaje natural).
- Procesamiento de imagen y texto conjuntamente (pipeline image-text-to-text) mediante el procesador de Qwen3.5.
- Cumplimiento de formato estricto: el checkpoint hermano de paso 500 alcanzo 27/27 en cumplimiento estricto de formato (`prefix_only_rate = 1.000`, cero fallos de parseo y cero coordenadas fuera de encuadre) sobre una evaluacion de humo de 3 episodios con el prompt original de AgentVLN y sin pista de formato.
- Emision de ambos tipos de etiqueta (`<target>` y `STOP`), que la publicacion publica de datos desactiva por defecto.
- Modo *thinking* desactivado por diseno: el prompt debe construirse con `enable_thinking=False` para ser byte-identico al visto en entrenamiento.
- No se declaran capacidades de *tool calling*, uso de agentes multi-paso, audio ni funciones de asistente general; no disponibles.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en navegacion visual y linguistica (VLN): evaluacion y reproduccion de resultados sobre el benchmark R2R-CE en el simulador Habitat, usando este checkpoint para medir el efecto del entrenamiento adicional frente al checkpoint de paso 500 bajo un protocolo identico.
- Analisis de curvas de aprendizaje en ajuste fino multimodal: el par de checkpoints (paso 500 y paso 1000) permite estudiar que mejora se obtiene cuando la gramatica de salida ya esta adquirida, con la perdida estabilizada alrededor de 0,28.
- Estudio del comportamiento de parada en politicas de navegacion: dado que el checkpoint hermano termina prematuramente a 6,7-8,0 m del objetivo pese a tener formato perfecto, este modelo sirve para investigar la discrepancia entre aprender el formato y aprender *cuando* detenerse.
- Reproduccion de reconstruccion de etiquetas: los wrappers que restauran STOP y `<target>` sin modificar el codigo original pueden reutilizarse como referencia metodologica en otros pipelines que sufran filtrado silencioso de tipos de etiqueta.
- Punto de partida para ajuste posterior: al ser un checkpoint intermedio con licencia Apache-2.0 sobre un base tambien Apache-2.0, puede servir como inicializacion para continuar el entrenamiento o para aplicar tecnicas de alineacion especificas de navegacion.
- Validacion de integracion de Qwen3.5 con codigo escrito para Qwen3-VL: los parches de `mm_token_type_ids` y las adaptaciones de transformers 5.x (eliminacion de `warmup_ratio` y `save_safetensors`) son directamente reutilizables.
- Prototipado de asistentes embodied en laboratorio: con 2,72 B de parametros y pesos en bf16 que ocupan unos 5,4 GB, es viable ejecutarlo en una unica GPU de gama alta de consumo para experimentos de simulacion, nunca para despliegue en robot real sin validacion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta una unica evaluacion de humo, y corresponde al checkpoint hermano de paso 500, no a este:

| Metrica (checkpoint hermano, paso 500) | Valor |
|---|---|
| Cumplimiento estricto de formato | 27/27 (`prefix_only_rate = 1.000`) |
| Fallos de parseo | 0 |
| Coordenadas fuera de encuadre | 0 |
| Tasa de exito | 0 |
| Motivo del fallo | terminacion prematura, a 6,7-8,0 m del objetivo |
| Episodios evaluados | 3 (evaluacion de humo) |

Para este checkpoint no se han publicado tasa de exito, SR, SPL, NE ni ninguna otra metrica de navegacion. La perdida de entrenamiento en el paso 1.000 es 0,2813 (media de 0,2821 en los ultimos 10 registros), un dato de optimizacion que no equivale a rendimiento en tarea.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: alrededor de 5,4 GB solo para los pesos, mas el coste del codificador visual y de las activaciones con secuencias de hasta 4.096 tokens; en la practica, entre 8 y 12 GB dependiendo de la longitud de secuencia y del tamano del lote.
- Con cuantizacion a 8 bits se podria bajar a unos 3 GB de pesos y a unos 5-7 GB en total; con 4 bits, a unos 1,5-2 GB de pesos. Estas cifras son estimaciones a partir del numero de parametros: no hay cuantizaciones publicadas ni medidas oficiales.
- GPU recomendadas: una RTX 4090 (24 GB), RTX 3090 (24 GB) o A5000 (24 GB) son suficientes para inferencia en bf16 con un lote pequeno. El entrenamiento documentado uso 4 x RTX A5000 con ZeRO-2 y offload del optimizador a CPU.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM para bf16 con lotes pequenos; en 8 GB requeriria cuantizacion.
- Opciones de despliegue: `transformers` con `AutoProcessor` y `AutoModelForImageTextToText` es la via soportada y documentada en la model card. vLLM, TGI, llama.cpp y Ollama no estan confirmados para este checkpoint; llama.cpp y Ollama requeririan ademas una conversion a GGUF que no se ha publicado, y soporte de vision que no esta garantizado.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Nota de uso obligatoria: cargar el procesador con `trust_remote_code=True` y aplicar la plantilla de chat con `enable_thinking=False`; con el valor por defecto (`True`), el prompt termina en un `<think>` abierto y el modelo no emite respuesta dentro de un presupuesto de tokens pequeno.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos VLN comparables en la informacion proporcionada, por lo que la comparacion se limita a los artefactos del mismo autor y al modelo base:

| Modelo | Parametros | Contexto | Datos de rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agentvln-qwen35-2b-r2r-quarter-step1000 (este) | 2,72 B | 4.096 tokens (entrenamiento) | no disponible para este checkpoint | Apache-2.0 | HuggingFace, 0 descargas |
| agentvln-qwen35-2b-r2r-quarter-step500 (hermano) | mismo base | 4.096 tokens | 27/27 formato, tasa de exito 0 en 3 episodios | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-2B (base) | 2,27 B segun model card | no disponible | no disponible | Apache-2.0 | HuggingFace |

Comparativas con otros modelos de VLN (por ejemplo, aproximaciones basadas en Qwen3-VL u otros agentes de navegacion): no disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio (24,8 % del entrenamiento completado), no un modelo final. El propio autor lo describe como artefacto de investigacion.
- Riesgo alto de terminacion prematura: el checkpoint hermano de paso 500, con formato perfecto, obtuvo tasa de exito 0 y terminaba a 6,7-8,0 m del objetivo. No hay evidencia de que el paso 1.000 resuelva ese comportamiento; al contrario, la perdida apenas mejora entre 0,32 y 0,28 en ese tramo.
- Las etiquetas STOP y `<target>` son una reconstruccion heuristica, no una reproduccion del esquema original. El proxy `trajectory_world[s] == trajectory_world[last]` es un criterio sustituto de `trajectory_is_endpoint`, y el autor advierte explicitamente que no hay garantia de que coincida con el original.
- Incertidumbre de licencia en la cadena de datos: el dataset allenxinn/AgentVLN-Instruct no declara licencia y el repositorio de codigo de AgentVLN no contiene fichero LICENSE. Los pesos estan publicados como Apache-2.0, pero el uso comercial de un derivado entrenado sobre datos sin licencia declarada es juridicamente arriesgado y requiere revision legal propia.
- Sesgos conocidos: no documentados en la informacion disponible. El entrenamiento se limita a 61 escenas de simulacion (R2R-CE en Habitat), lo que implica un sesgo fuerte hacia la distribucion visual y de trayectorias de ese conjunto y muy probable falta de generalizacion a entornos reales.
- Riesgo de alucinacion: no evaluado. En este dominio el fallo tipico no es inventar hechos, sino emitir acciones o paradas incorrectas; no hay metricas publicadas al respecto para este checkpoint.
- Limitaciones de contexto: 4.096 tokens de `max_seq_length` en entrenamiento. No se conoce el contexto nativo del modelo base ni como se comporta fuera de esa longitud.
- Limitaciones de idioma: no se declaran idiomas soportados. Las instrucciones de navegacion de R2R estan en ingles, por lo que el comportamiento en castellano es impredecible.
- Dependencia de parches: el uso correcto exige `trust_remote_code=True`, plantilla de chat con `enable_thinking=False` y, para reentrenar, los wrappers de compatibilidad con transformers 5.x y la reconstruccion de `mm_token_type_ids`. Sin ellos, el prompt no coincide con el de entrenamiento y el modelo puede no responder.
- Cero descargas y cero *likes* en el momento del registro: no existe validacion independiente de la comunidad.
- No apto para produccion ni para control de robots reales sin una evaluacion exhaustiva en el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyhoaoen/agentvln-qwen35-2b-r2r-quarter-step1000
- Checkpoint hermano (paso 500): https://huggingface.co/cyhoaoen/agentvln-qwen35-2b-r2r-quarter-step500
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/allenxinn/AgentVLN-Instruct
- Paper de AgentVLN: https://arxiv.org/abs/2603.17670
- Busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo ni con VLN, por lo que no se incluye ningun enlace adicional. No se han encontrado repositorios, demos ni blogs relevantes en la informacion disponible.
