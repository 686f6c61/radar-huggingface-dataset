# hweller1/wayfinder-glimmer-30b

## Resumen

wayfinder-glimmer-30b es un ajuste fino del modelo Muse Glimmer 30B, desarrollado por el usuario hweller1, disenado especificamente para funcionar como subagente de busqueda de codigo dentro de un agente mayor. El modelo recibe un brief en lenguaje natural (por ejemplo, "donde decide el router que una peticion coincide con una ruta con variables de path") y ejecuta un bucle de exploracion sobre un repositorio desconocido usando herramientas como `grep`, `glob`, `read_file` y `semantic_search`, para devolver un informe con rangos `path:start-end` clasificados, una razon por linea y una lista de lagunas no resueltas.

La relevancia de este modelo es acotada pero clara: se trata de un checkpoint especializado que delega la exploracion de repositorios en un subagente mas pequeno, permitiendo que el agente padre (potencialmente mas capaz y costoso) se centre en la planificacion y verificacion. El modelo base es Muse Glimmer 30B, con aproximadamente 29.780 millones de parametros en safetensors, formato bf16, y una ventana de contexto que, segun la configuracion de servicio recomendada, alcanza los 65.536 tokens.

El ajuste se realizo mediante LoRA supervised fine-tuning (rango 64, alpha 128) sobre las proyecciones de atencion y MLP, fusionado posteriormente en los pesos base en fp32 y guardado en bf16. El modelo esta pensado exclusivamente para ingles y su uso fuera del harness de herramientas especifico no ha sido validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Muse Glimmer 30B), ajuste LoRA fusionado |
| Parametros totales | 29.776.626.688 (~29,78 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 65.536 tokens (segun configuracion de servicio recomendada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0-and-muse-model-license (other) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en Muse Glimmer 30B, un transformer de aproximadamente 29,78 mil millones de parametros. El ajuste fino se realizo mediante LoRA supervised fine-tuning unicamente sobre el modelo de lenguaje, con rango 64 y alpha 128, aplicado a todas las proyecciones de atencion y MLP. Posteriormente, los adaptadores se fusionaron en los pesos base en fp32 y se guardaron en bf16, de modo que el despliegue no requiere soporte de LoRA. La configuracion, el tokenizer y la plantilla de chat de Muse Glimmer 30B se mantienen sin cambios.

El conjunto de entrenamiento consta de 1.383 ejemplos filtrados procedentes de 344 tareas en repositorios publicos con licencias permisivas. De ellos, 1.350 son trayectorias del profesor Muse Spark Open (1.347 generadas por replicas autoalojadas de los pesos abiertos y 3 por un host de terceros de los mismos pesos; ninguna procede de la API de Meta) y 33 son trayectorias de Agents-A1-35B. Solo se conservaron las ejecuciones que encontraron todos los ficheros gold, abrieron todos los ficheros reportados y llamaron a `report` dentro del limite de turnos. Solo los tokens del asistente contribuyen a la perdida. El entrenamiento se ejecuto durante 2 epocas con tasa de aprendizaje 5e-5 y decaimiento coseno, filas empaquetadas de hasta 49.152 tokens, en 4x H200 durante aproximadamente 3 horas, en una unica ejecucion con semilla 0. Las trayectorias y el texto de las tareas no se han publicado.

Una innovacion destacable del diseno es que el modelo razona antes de cada llamada a herramienta y fue entrenado y evaluado reenviando su propio razonamiento previo en cada peticion; la plantilla de chat renderiza el campo `reasoning_content` de los mensajes previos del asistente. Esto implica que un cliente que descarte el razonamiento anterior opera fuera de la distribucion de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento orientado a la exploracion de repositorios de codigo.
- Busqueda de codigo mediante herramientas: `grep` (ripgrep con ranking por densidad de coincidencias), `glob`, `read_file`, `semantic_search` sobre un indice vectorial voyage-code-4 y una herramienta terminal `report`.
- Soporte de tool calling / function calling con parser especifico (`muse_glimmer`) en vLLM.
- Razonamiento multi-paso y comportamiento agentico con bucle de exploracion de hasta 40 turnos en evaluacion.
- Emision de informes estructurados: lista clasificada de rangos `path:start-end` con una razon por linea, un resumen y las lagunas no establecidas.
- Capacidad de convergencia: se le entrena para reportar en cuanto la evidencia cubre el brief, sin agotar el presupuesto de turnos.
- Multilingue: no, solo ingles.
- Modo thinking: si, razonamiento previo a cada llamada a herramienta, con reenvio del razonamiento anterior en cada peticion.

## Casos de uso

- Subagente de exploracion en un agente de codificacion: el agente padre delega un brief ("donde se configura el maximo de backoff en los reintentos HTTP") y wayfinder-glimmer explora el repositorio con `grep`/`glob`/`read_file` y devuelve rangos `path:start-end` verificables, reduciendo el coste de contexto del agente principal.
- Localizacion de codigo en repositorios desconocidos: util para onboarding de desarrolladores en bases de codigo grandes, ya que el modelo planifica la busqueda y devuelve leads clasificados con razones en lugar de coincidencias crudas.
- Busqueda semantica combinada con busqueda lexica: cuando el harness ofrece un indice voyage-code-4, el modelo puede combinar `semantic_search` con `grep` para cubrir tanto coincidencias exactas como conceptos difusos.
- Automatizacion de triaje de incidencias: dado un informe de bug, el subagente localiza los ficheros y rangos relevantes para que un ingeniero o un agente mayor verifique y proponga el parche.
- Auditoria de cambios y revision de PRs: el subagente puede localizar donde se define una funcion o constante afectada por un cambio, aportando evidencia con rangos de linea concretos.
- Generacion de mapas de conocimiento de repositorios: ejecutando el subagente sobre multiples briefs se pueden construir indices de "donde esta X" con referencias `path:start-end`, utiles para documentacion interna.
- Integracion en pipelines de CI/CD como paso de localizacion previa: antes de ejecutar un analisis estatico o un test dirigido, el subagente identifica los ficheros candidatos, reduciendo el alcance de las comprobaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion de evaluacion con numeros obtenidos bajo el mismo bucle de exploracion, prompt de sistema, limite de 40 turnos y dos ejecuciones, pero los valores concretos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 60 GB solo para pesos (29,78 B parametros x 2 bytes), mas overhead de KV cache y activaciones; el repositorio ocupa 59,6 GB.
- GPU recomendadas: H100 (probado por el autor con vLLM 0.32.0, una H100, bf16), H200 (usadas en entrenamiento), A100 80 GB como alternativa viable por VRAM.
- Cabe en GPU consumer: no en bf16; se requeriria cuantizacion, que no esta documentada en la informacion disponible.
- Opciones de despliegue: vLLM 0.32.0 con `--tool-call-parser muse_glimmer` y `--reasoning-parser muse_glimmer`, `--enable-auto-tool-choice`, `--language-model-only`, `--enable-prefix-caching`, `--max-model-len 65536`, `--gpu-memory-utilization 0.92`, `--max-num-seqs 64`. Sin el parser de tool calls, las llamadas vuelven como texto plano.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wayfinder-glimmer-30b | ~29,78 B | 65.536 tokens | Subagente de busqueda de codigo | apache-2.0-and-muse-model-license | HuggingFace (5 descargas) |
| Muse Glimmer 30B (base) | ~30 B (segun nombre) | no disponible | Proposito general | Muse Glimmer Usage Policy | Referenciado como base |
| Agents-A1-35B | ~35 B (segun nombre) | no disponible | Trayectorias agenticas (fuente de 33 ejemplos) | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Uso fuera del harness previsto: el modelo solo ha sido probado con las cinco herramientas (`grep`, `glob`, `read_file`, `semantic_search`, `report`) y con los prompts de referencia; otros nombres de herramienta, ausencia de `report` u otros prompts no estan validados.
- No apto para chat general ni generacion de codigo general: la retencion de habilidades generales no se midio.
- No debe usarse como unica salvaguarda sobre cambios de codigo.
- Solo ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion: el modelo devuelve leads que el agente padre debe verificar; no se garantiza que los rangos reportados sean correctos.
- Dependencia del razonamiento previo: un cliente que descarte el `reasoning_content` de turnos anteriores opera fuera de la distribucion de entrenamiento.
- La plantilla de chat requiere los argumentos de las llamadas a herramienta como dict.
- Restricciones de licencia: licencia compuesta apache-2.0-and-muse-model-license; el uso esta sujeto a la Muse Spark Open Usage Policy y la Muse Glimmer Usage Policy, que pueden restringir usos comerciales. Consultar el fichero LICENSE-MUSE-SPARK-OPEN.md.
- Prohibido buscar repositorios sobre los que no se tenga permiso de lectura.
- Entrenamiento con una sola ejecucion (semilla 0) y conjunto de datos pequeno (1.383 ejemplos de 344 tareas); los resultados describen este checkpoint, no la receta.
- Las trayectorias y el texto de las tareas no se publican, lo que limita la reproducibilidad.
- Repositorio con muy poca traccion (5 descargas, 0 likes), lo que reduce la validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hweller1/wayfinder-glimmer-30b
- Licencia: https://huggingface.co/hweller1/wayfinder-glimmer-30b/blob/main/LICENSE-MUSE-SPARK-OPEN.md
- Modelo base referenciado: meta-models/Muse-Glimmer-30B (no se dispone de URL directa en la informacion proporcionada)
- Repositorio GitHub del harness de referencia: mencionado en la model card (`serve/scout_tool_specs.json`, `serve/scout_product_prompt.md`), sin URL concreta en la informacion disponible.
