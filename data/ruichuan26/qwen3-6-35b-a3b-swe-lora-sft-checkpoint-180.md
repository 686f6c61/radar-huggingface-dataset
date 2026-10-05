# ruichuan26/Qwen3.6-35B-A3B-SWE-LoRA-SFT-checkpoint-180

## Resumen

Qwen3.6-35B-A3B-SWE-LoRA-SFT-checkpoint-180 es un adaptador LoRA de bajo rango publicado por el usuario ruichuan26 sobre el modelo multimodal Qwen/Qwen3.6-35B-A3B. No se trata de un modelo completo: el repositorio contiene unicamente los pesos del adaptador (22,4774 M de parametros entrenables, el 0,0640 % de los 35.129,6594 M del modelo base) y no redistribuye los pesos del modelo de 35B. Su proposito es especializar el modelo base en trayectorias de ingenieria de software (SWE) en modo no-thinking, es decir, sin cadenas de razonamiento explicitas.

El adaptador se selecciono como el checkpoint 180 de 185 pasos de optimizacion, escogido por perdida minima sobre un conjunto de desarrollo congelado de 199 ejemplos (perdida 0,2890333533 y exactitud de token 0,9167323827). El entrenamiento se realizo con ms-swift 4.6.0.dev0 y PEFT 0.20.0 sobre un corpus de 4.432 trayectorias, con una longitud de secuencia maxima observada de 47.682 tokens y un maximo de entrenamiento de 63.999 tokens.

Su relevancia es fundamentalmente metodologica: documenta de forma reproducible (revisiones inmutables del base y del adaptador, semilla, configuracion completa) como se afina un MoE multimodal de gran tamano para tareas de software engineering con un coste de adaptacion muy bajo. La licencia Apache-2.0 del base y del adaptador facilita su reutilizacion, aunque el autor advierte que los benchmarks objetivo (HLE, ASI-Bench, SWE-bench Pro v2-hard, Terminal-Bench 2.0) aun no se han completado y no se reclama mejora alguna sobre ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal con capas MoE (modelo base Qwen3.6-35B-A3B) |
| Parametros totales | 35.129,6594 M (modelo base); adaptador: 22,4774 M entrenables (0,0640 %) |
| Parametros activos | Aproximadamente 3B activados por token en el modelo base (MoE) |
| Longitud de contexto | no disponible de forma explicita; el entrenamiento uso una longitud maxima de 63.999 tokens y una longitud observada maxima de 47.682 tokens |
| Tipos de cuantizacion | Ninguna en el adaptador (tensores serializados en BF16); no se declaran recetas de cuantizacion para el conjunto base + adaptador |
| Idiomas soportados | no disponible (no se declara en la model card) |
| Licencia | Apache-2.0 (modelo base y adaptador); el dataset de entrenamiento tiene licencias mixtas |
| Formato de pesos | safetensors (adaptador PEFT con libreria `peft`) |
| Rango / alpha / dropout LoRA | 16 / 32 / 0,05 |
| Selector de objetivos | `all-linear` |
| Torre de vision | Congelada |
| Alineador / proyector visual | Congelado |
| Revision del adaptador | `944de20053b996b4eef729694037c7806eb00903` |
| Revision del modelo base | `995ad96eacd98c81ed38be0c5b274b04031597b0` |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos (MoE) de aproximadamente 35B de parametros totales y unos 3B activados por token; la model card insiste en que la planificacion de memoria debe hacerse sobre el total de pesos y no sobre el numero de parametros activos. El adaptador aplica LoRA con rango 16, alpha 32 y dropout 0,05 sobre un selector `all-linear`, cuya expresion resuelta cubre las proyecciones del modelo de lenguaje (`v_proj`, `q_proj`, `down_proj`, `shared_expert_gate`, `k_proj`, `o_proj`, `in_proj_a`, `up_proj`, `out_proj`, `gate_proj`, `in_proj_qkv`, `in_proj_z`, `in_proj_b`) bajo el prefijo `model.language_model`. La ejecucion de expertos emplea multiplicacion matricial agrupada y el `shared_expert_gate` queda incluido en la expresion de objetivos. Tanto la torre de vision como el alineador/proyector visual permanecen congelados, por lo que el adaptador no modifica la parte visual.

El entrenamiento partio del release `swe_nonthinking` del dataset `ruichuan26/swe`: 4.432 trayectorias de entrenamiento y 199 trayectorias de desarrollo congeladas, con `enable_thinking=false` y `preserve_thinking=false`. El paquete congelado contenia 3.510 trayectorias previas de ingenieria de software en modo no-thinking mas 1.121 trayectorias del profesor Qwen3.8-Flash NTC que pasaron los tests. No hubo truncamiento ni empaquetado de ejemplos. La configuracion uso 3 GPU NVIDIA RTX PRO 6000 Blackwell Server Edition (97.887 MiB cada una), batch por dispositivo 1, acumulacion de gradiente 8 (batch global efectivo de 24 secuencias), AdamW con beta1 0,9, beta2 0,95, epsilon 1e-8 y weight decay 0, tasa de aprendizaje 5e-5 con schedule coseno y 5 % de warmup (10 pasos), una epoca y 185 pasos de optimizacion. Se empleo DeepSpeed ZeRO-3 sin offload a CPU, gradient checkpointing, FlashAttention 2 y kernel Liger. El calculo del modelo fue en BF16, los parametros LoRA y los estados del optimizador en FP32, y los tensores serializados del adaptador en BF16. La ejecucion duro 19.744,9 segundos (unas 5 h 29 min) con una perdida de entrenamiento agregada de 0,16803755.

La trayectoria de validacion documentada fue la siguiente: paso 45 con perdida 0,3063099384 y exactitud 0,9131769656; paso 90 con 0,2932569683 y 0,9158149562; paso 135 con 0,2896330357 y 0,9166253669; paso 180 (seleccionado) con 0,2890333533 y 0,9167323827; paso 185 con 0,2891295850 y 0,9166554975. Estos valores son metricas de desarrollo durante el entrenamiento, no puntuaciones de benchmark.

## Capacidades

- Generacion de texto y resolucion de tareas de ingenieria de software en modo no-thinking, sin cadenas de razonamiento explicitas.
- Razonamiento multi-paso orientado a trayectorias SWE (lectura de repositorio, edicion de ficheros, ejecucion de comandos), segun el tipo de datos de entrenamiento utilizado.
- Entrada image-text-to-text heredada del modelo base multimodal, aunque la torre de vision y el alineador visual permanecen congelados y no se han adaptado.
- Soporte de tool calling / function calling: no se declara explicitamente en la informacion disponible.
- Capacidades de agente: el entrenamiento con trayectorias de software engineering es consistente con flujos agenticos, pero no se documenta ningun modo agente especifico.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no se declara modo thinking; de hecho el entrenamiento desactiva el pensamiento (`enable_thinking=false`) y la inferencia debe configurarse igual.
- No se declaran capacidades de audio.

## Casos de uso

- Reparacion automatica de errores en repositorios: el adaptador se ha afinado sobre trayectorias SWE con secuencias de hasta 47.682 tokens, por lo que puede procesar contexto de repositorio amplio para localizar el fallo, parchear el codigo y verificar el resultado.
- Asistencia a revision de codigo en CI/CD: integrado como paso de un pipeline que lee el diff de un pull request y propone correcciones antes del merge, aprovechando que el entrenamiento usa trayectorias de edicion reales.
- Migracion de codigo entre versiones de dependencias: al estar especializado en tareas de ingenieria de software, puede reescribir llamadas de API obsoletas y ajustar ficheros de configuracion de forma coherente dentro de un mismo repositorio.
- Generacion de tests de regresion: puede redactar pruebas unitarias que reproduzcan el error corregido, ya que el corpus incluye trayectorias con verificacion mediante ejecucion.
- Automatizacion de tareas de mantenimiento en terminal: el dataset original esta orientado a flujos de software engineering; el adaptador es util para encadenar comandos y editar ficheros en un entorno de shell.
- Analisis de documentacion tecnica y preguntas sobre una base de codigo: con ventanas de decenas de miles de tokens puede resumir modulos completos y responder preguntas sobre su funcionamiento.
- Preprocesado de incidencias: convertir un informe de bug en lenguaje natural en un plan de accion tecnico con ficheros candidatos y pasos de reproduccion.
- Base para investigacion en adaptacion eficiente: sirve como punto de partida reproducible (semilla 42, revisiones fijadas) para comparar tecnicas de LoRA sobre MoE multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que los resultados finales de HLE, ASI-Bench, SWE-bench Pro v2-hard y Terminal-Bench 2.0 no se reclaman mientras la evaluacion este incompleta.

Los unicos numeros de rendimiento disponibles son metricas de desarrollo internas, que no son comparables con benchmarks publicos:

| Paso | Perdida de desarrollo | Exactitud de token de desarrollo |
|---:|---:|---:|
| 45 | 0,3063099384 | 0,9131769656 |
| 90 | 0,2932569683 | 0,9158149562 |
| 135 | 0,2896330357 | 0,9166253669 |
| 180 (seleccionado) | 0,2890333533 | 0,9167323827 |
| 185 | 0,2891295850 | 0,9166554975 |

## Requisitos de hardware

- Inferencia del conjunto base + adaptador: hay que cargar los 35.129,6594 M de parametros del modelo base, no solo los 3B activados por token. En BF16 esto supone del orden de 70 GB de pesos, por lo que se necesitan al menos dos GPU de 48 GB o una de 80 GB.
- Estimacion orientativa de VRAM para pesos (aritmetica sobre 35B, no confirmada por el autor): aproximadamente 70 GB en BF16, unos 35 GB en 8 bits y unos 17,5 GB en 4 bits, mas la memoria de activaciones y cache KV.
- GPU recomendadas: el autor uso 3 x NVIDIA RTX PRO 6000 Blackwell Server Edition (97.887 MiB) para el entrenamiento; para inferencia son adecuadas A100 80 GB, H100 80 GB o H200, y configuraciones multi-GPU de 48 GB.
- En GPU de consumo: en BF16 no cabe en ninguna tarjeta de consumo actual. Con cuantizacion agresiva a 4 bits los pesos rondarian los 17,5 GB, lo que podria caber en una RTX 4090 de 24 GB, aunque no se ha validado esta ruta para base + adaptador.
- Opciones de despliegue: el autor documenta `swift infer` con `--adapters` y carga directa con `peft` mediante `PeftModel.from_pretrained` sobre `AutoModelForImageTextToText`. No se mencionan vLLM, llama.cpp, Ollama ni TGI. En cualquier caso, hay que fijar `enable_thinking=False` y `preserve_thinking=False` en el chat template.
- Latencia y throughput: no disponibles. El unico dato temporal es la duracion del entrenamiento (19.744,9 s), que no es extrapolable a inferencia.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks ni de datos de otros adaptadores comparables en la informacion proporcionada, por lo que la comparacion se limita a aspectos estructurales frente al modelo base y se marca el resto como no disponible.

| Modelo | Parametros | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ruichuan26/Qwen3.6-35B-A3B-SWE-LoRA-SFT-checkpoint-180 (adaptador) | 22,4774 M entrenables sobre base de 35.129,6594 M | ~3B (heredado del base) | no disponible | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.6-35B-A3B (base) | 35.129,6594 M | ~3B | no disponible | Apache-2.0 | HuggingFace |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El adaptador esta especializado exclusivamente en trayectorias de ingenieria de software en modo no-thinking; usarlo con `enable_thinking=True` se sale de su distribucion de entrenamiento.
- El autor reconoce que no se ha demostrado que mejore todos los benchmarks objetivo y que la evaluacion externa sigue incompleta.
- La calidad de los datos es heterogenea: 2.989 trayectorias publicas no se replicaron de forma independiente y 1.121 trayectorias del profesor pasaron pruebas de mismo actor tras el envio, no replicas independientes.
- La auditoria del dataset no establece la ausencia total de contaminacion semantica ni de solapamiento con los datos de preentrenamiento del proveedor.
- Licencias mixtas en los datos: el corpus y las tareas de origen NVIDIA se describen como CC-BY-4.0, los repositorios de software conservan sus licencias originales, y el tokenizador y el modelo base son Apache-2.0. Los terminos del proveedor de las salidas del profesor no se verificaron de forma independiente.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; los parches generados deben validarse con tests antes de aplicarse en produccion.
- Idiomas soportados no declarados; no hay garantia de comportamiento en castellano ni en otros idiomas distintos de los presentes en el corpus de entrenamiento.
- La torre de vision y el alineador visual estan congelados, por lo que la especializacion no cubre tareas visuales.
- El repositorio tiene 0 descargas y 0 likes: no existe validacion por parte de la comunidad.
- Para uso comercial, la licencia Apache-2.0 del base y del adaptador es permisiva, pero la procedencia mixta de los datos de entrenamiento exige una revision legal propia.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ruichuan26/Qwen3.6-35B-A3B-SWE-LoRA-SFT-checkpoint-180
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de entrenamiento: https://huggingface.co/datasets/ruichuan26/swe
- Revision inmutable del adaptador: 944de20053b996b4eef729694037c7806eb00903
- Revision inmutable del modelo base: 995ad96eacd98c81ed38be0c5b274b04031597b0
- Framework ms-swift: no se proporciona enlace en la informacion disponible
- Paper asociado: no disponible
- Blog o demo: no disponible
