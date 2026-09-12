# laion/snowball-64k-eagle3-draft-base

## Resumen

`laion/snowball-64k-eagle3-draft-base` es un cabezal de decodificacion especulativa (draft) de tipo EAGLE-3, disenado para acelerar la inferencia de un modelo objetivo de la familia GrugMoe. No es un modelo de lenguaje autonomo: es un componente de servicio que propone tokens que el modelo objetivo verifica en cada paso, de forma que se reduce el numero de pasos de decodificacion necesarios para generar la misma secuencia. Su autoria corresponde a LAION y su libreria declarada es vLLM.

El checkpoint consta de 206.616.576 parametros (aproximadamente 0,4 GB en safetensors) y una sola capa de estilo Llama, con un vocabulario de draft de 32.000 tokens, una ventana de atencion de 2.048 tokens y slots auxiliares de estados ocultos en las posiciones `[2, 13, 23]` del objetivo. Se entreno desde cero sobre 12.099 respuestas del propio modelo objetivo a peticiones de un corpus de SFT, con dos epocas completadas en 25 minutos en un unico nodo GH200. Su relevancia actual radica en que es el punto de partida publico para adaptar decodificacion especulativa a cargas de trabajo propias, en lugar de reutilizar una adaptacion ya especializada en un dominio concreto.

La model card indica que este draft, servido tal cual, rinde un 1,50x medido sobre turnos de agente de R2E-Gym reservados para evaluacion, y que existe una version adaptada a esa carga de trabajo concreta (`laion/snowball-64k-eagle3-draft-r2egym`) que fue el resultado de un warm-start sobre este mismo checkpoint. El autor advierte que requiere un objetivo GrugMoe compatible y una bifurcacion concreta de vLLM parcheada para EAGLE-3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft EAGLE-3 de una capa estilo Llama para decodificacion especulativa (no es un modelo de lenguaje autonomo) |
| Parametros totales | 206.616.576 |
| Parametros activos | no aplica (el draft es denso; el componente MoE esta en el modelo objetivo GrugMoe) |
| Longitud de contexto | ventana de atencion del draft: 2.048 tokens; servicio validado hasta 64k tokens de contexto del objetivo |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la especifica) |
| Formato de pesos | safetensors |
| Vocabulario del draft | 32.000 tokens (mapeado desde el vocabulario de 128.256 del objetivo) |
| Slots de estados ocultos auxiliares | `[2, 13, 23]` |
| Modelo objetivo medido | Snowball S3 Nemotron-Terminal, paso 1888, 26 capas, hidden size 2560, vocabulario 128.256 |
| Tamano del repositorio | 0,4 GB |
| Libreria de servicio | vLLM (bifurcacion `lukedhlee/grugmoe-eagle3`, commit `00d81ae11404ab68afef4142cdc883f7ba77e9a6`) |

## Arquitectura y entrenamiento

El draft es una unica capa transformer de estilo Llama que consume los estados ocultos del modelo objetivo en los slots `[2, 13, 23]` y predice el siguiente bloque de tokens sobre un vocabulario reducido de 32.000 entradas. El paquete omite deliberadamente el embedding del objetivo: el motor de servicio inyecta el embedding del objetivo activo en tiempo de ejecucion, mientras que los pesos del draft, la cabeza de salida y los mapas de vocabulario (`d2t-32000.npy` y `t2d-32000.npy`) se conservan tal y como salieron del entrenamiento. El draft no incluye estado del optimizador, registros de entrenamiento, pesos del objetivo ni ejemplos de entrenamiento.

El entrenamiento se realizo desde cero sobre 12.099 respuestas generadas por el propio objetivo ante peticiones de un corpus general de SFT, con aproximadamente 159 millones de tokens de entrada y 43 millones de tokens supervisados por epoca. La perdida se calculo unicamente sobre los tokens muestreados por el objetivo, con prefijos de hasta 32.000 tokens y tres pasos de unroll durante el entrenamiento. Se completaron dos epocas en 25 minutos en un solo nodo GH200. R2E-Gym quedo completamente fuera del entrenamiento, de modo que las mediciones sobre esa carga de trabajo son genuinamente fuera de distribucion respecto a los datos del draft base.

La innovacion principal no es de arquitectura sino de flujo de trabajo: el paquete esta concebido como punto de partida reproducible para adaptar un draft a las salidas del propio objetivo mediante el toolkit de `grugmoe-eagle3`, manteniendo los mapas de vocabulario aprendidos y seleccionando el resultado por velocidad servida sobre una replica reservada, no por perdida de validacion.

## Capacidades

- Decodificacion especulativa EAGLE-3: propone varios tokens por paso (la configuracion de referencia usa `num_speculative_tokens: 3`) que el objetivo verifica en paralelo.
- Aceleracion de la generacion del objetivo: 139-140 tokens de decodificacion por segundo y por flujo frente a 93 sin draft, en turnos de agente de 64k tokens.
- Reduccion de latencia por turno en cargas de agente: mediana de 11,5 s a 6-7 s en la misma configuracion medida.
- Compatibilidad de distribucion con el servidor sin draft: las log-probabilidades muestreadas y la masa top-1 coincidieron con las del servidor sin draft, con cero errores de peticion.
- Integracion con vLLM mediante `speculative_config` y con SkyRL a traves de `generator.engine_init_kwargs.speculative_config`.
- Adaptabilidad a cargas de trabajo propias mediante warm-start sobre las salidas del objetivo y extraccion de sus estados ocultos.
- Generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, modo thinking y capacidades multilingues: no aplica, ya que este artefacto no genera texto de forma autonoma. Dichas capacidades dependen exclusivamente del modelo objetivo.

## Casos de uso

- Servicio de agentes de codigo con contexto largo: el draft acelera los turnos de agente manteniendo la distribucion del objetivo, lo que permite reducir el coste por turno en pipelines de agentes que operan sobre ventanas de decenas de miles de tokens. La validacion publicada cubre explicitamente contexto de 64k.
- Reduccion de latencia percibida en asistentes interactivos: al bajar la mediana de latencia por turno de 11,5 s a 6-7 s en la configuracion medida, mejora la experiencia en interfaces conversacionales multi-turno servidas con vLLM.
- Aumento de throughput en servidores con GPUs limitadas: con 16 flujos concurrentes en cuatro GH200 y tres tokens especulativos, el sistema sostiene 139-140 tokens/s por flujo, lo que permite atender mas sesiones simultaneas por nodo sin cambiar el modelo objetivo.
- Adaptacion a un dominio interno propio: partiendo de este draft base y usando `toolkit.py train --draft <directorio> --d2t ... --t2d ...`, se puede generar un draft especializado en las salidas del objetivo para un corpus propio, evitando heredar la especializacion de R2E-Gym.
- Warm-start para investigacion en decodificacion especulativa: sirve como punto de partida controlado para comparar estrategias de adaptacion, ya que la model card documenta la ganancia esperada (15 % y 12 % adicionales sobre este mismo draft tras adaptar con 2.177 rollouts de R2E-Gym).
- Despliegue de objetivos GrugMoe en produccion con vLLM: se integra mediante un unico diccionario de configuracion que apunta al directorio del draft, sin necesidad de reentrenar ni modificar los pesos del objetivo.
- Validacion de compatibilidad de tokenizer y codificacion posicional: util para equipos que quieran comprobar si un nuevo checkpoint objetivo de dimensiones tensoriales identicas es realmente compatible antes de invertir en una adaptacion completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que el artefacto no es un modelo de lenguaje autonomo. Las unicas metricas publicadas son de servicio:

| Metrica | Con draft | Sin draft | Mejora |
|---|---|---|---|
| Decodificacion (tokens/s por flujo) | 139-140 | 93 | ~1,50x |
| Latencia mediana por turno | 6-7 s | 11,5 s | no disponible en porcentaje |
| Tokens aceptados por paso (prompts >40k) | 2,55 | no aplica | no aplica |
| Tokens aceptados por paso (prompts <16k) | 2,15 | no aplica | no aplica |
| Tokens aceptados por paso (media, cribado posterior) | 2,19-2,20 | no aplica | no aplica |

Condiciones de medida: cuatro GH200, 16 flujos concurrentes, tres tokens especulativos, turnos de agente de 64k tokens de R2E-Gym reservados, dos repeticiones en el mismo nodo. El recuento de tokens aceptados incluye el token bonus. Cero errores de peticion.

Advertencia del autor: estas mediciones corresponden a la exportacion del draft adaptado, generada por el mismo exportador a partir de un checkpoint de arquitectura identica, servida en un nodo GH200 el 11 de septiembre de 2026. No deben leerse como mediciones de esta exportacion concreta, que no ha sido servida de forma independiente en GPU.

## Requisitos de hardware

- VRAM estimada para el draft: aproximadamente 0,41 GB en bf16 para los 206,6 millones de parametros, mas el coste de los estados ocultos y las estructuras de servicio. Cabe holgadamente en cualquier GPU consumer.
- VRAM del objetivo: no disponible. El requisito dominante es el del modelo objetivo GrugMoe (26 capas, hidden size 2560), no el del draft.
- GPU utilizadas en las mediciones publicadas: cuatro nodos GH200, 16 flujos concurrentes.
- GPU consumer: el draft por si solo cabe en cualquier GPU consumer, pero no puede ejecutarse sin el objetivo compatible. El objetivo no especifica requisitos publicados.
- Opciones de despliegue: bifurcacion de vLLM `lukedhlee/grugmoe-eagle3` (commit `00d81ae11404ab68afef4142cdc883f7ba77e9a6`) del repositorio `github.com/lukedhlee/vllm`. Integracion con SkyRL mediante `generator.engine_init_kwargs.speculative_config`. No se mencionan llama.cpp, Ollama ni TGI.
- Configuracion de servicio de referencia: `{"method":"eagle3","model":"/path/to/downloaded/draft","num_speculative_tokens":3}`.
- Latencia y throughput: 139-140 tokens/s por flujo con 16 flujos concurrentes en cuatro GH200; mediana de turno de 6-7 s frente a 11,5 s sin draft, sobre turnos de agente de 64k tokens.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con otros drafts EAGLE-3, Medusa u otros esquemas de decodificacion especulativa. La unica comparacion documentada es interna a la familia Snowball:

| Modelo | Parametros | Contexto validado | Velocidad servida | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `snowball-64k-eagle3-draft-base` (este) | 206,6 M | hasta 64k | 1,50x sobre turnos de agente R2E-Gym | ninguna; proposito general sobre corpus SFT | no disponible | publico en HuggingFace |
| `snowball-64k-eagle3-draft-r2egym` | misma arquitectura | hasta 64k | 15 % y 12 % mas rapido que el base en dos repeticiones | R2E-Gym | no disponible | publico en HuggingFace |
| Sin draft (servidor objetivo solo) | no aplica | 64k | 93 tokens/s por flujo | no aplica | no aplica | no aplica |

Otros drafts EAGLE-3 comparables: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: no puede generar texto por si mismo y requiere un objetivo GrugMoe compatible.
- Requiere la bifurcacion parcheada de vLLM en el commit exacto indicado; otras versiones del motor no estan validadas.
- Las mediciones de velocidad publicadas corresponden a la exportacion del draft adaptado, no a esta exportacion, que no ha sido servida de forma independiente en GPU.
- Otro checkpoint objetivo necesita su propia medicion de aceptacion y velocidad; dimensiones tensoriales iguales no garantizan compatibilidad de tokenizer ni de codificacion posicional.
- El modelo publico Grug de 262k no ha sido probado. Contexto superior a 64k y otras familias de objetivos no estan validados.
- La exportacion sin embedding solo ha pasado las comprobaciones de contenido tensorial del exportador y el cargador de configuracion de servicio; no hay validacion funcional end-to-end publicada para este paquete.
- Licencia no especificada: no hay informacion sobre uso comercial, lo que constituye un riesgo juridico para despliegues en produccion.
- Idiomas soportados no disponibles; el vocabulario del draft esta reducido a 32.000 tokens mapeados sobre los 128.256 del objetivo, lo que puede limitar la cobertura en idiomas poco representados.
- Nunca debe sustituirse silenciosamente el mapeo de vocabulario de los pesos aprendidos del draft (`d2t-32000.npy` y `t2d-32000.npy`) al hacer warm-start.
- La seleccion del draft adaptado debe hacerse por velocidad servida sobre una replica reservada, no unicamente por perdida de validacion.
- El estado del optimizador, los registros de entrenamiento, los pesos del objetivo y los ejemplos de entrenamiento no se incluyen, lo que dificulta reproducir exactamente el entrenamiento original.
- Riesgo de alucinacion y sesgos: no aplica directamente al draft, pero hereda las caracteristicas del objetivo sobre el que se sirva.

## Enlaces

- [Modelo en HuggingFace: laion/snowball-64k-eagle3-draft-base](https://huggingface.co/laion/snowball-64k-eagle3-draft-base)
- [Draft adaptado a R2E-Gym: laion/snowball-64k-eagle3-draft-r2egym](https://huggingface.co/laion/snowball-64k-eagle3-draft-r2egym)
- [Toolkit de adaptacion grugmoe-eagle3](https://github.com/lukedhlee/grugmoe-eagle3)
- [Bifurcacion de vLLM para EAGLE-3](https://github.com/lukedhlee/vllm)
- Paper de EAGLE-3, blog tecnico del objetivo Snowball y demos: no disponibles en la informacion proporcionada.
