# i1see1you/VirbiusGuard-4B

## Resumen

VirbiusGuard-4B es un clasificador de seguridad de entradas (prompt L1 detection) desarrollado por el usuario i1see1you y publicado en Hugging Face. Se trata de un ajuste fino mediante LoRA (rank 32, alpha 64) sobre el modelo Qwen/Qwen3Guard-Gen-4B, posteriormente fusionado en pesos completos. Su funcion es auditar el texto que un usuario introduce en un agente o chatbot y devolver una salida estricta en JSON con el formato `{"hit_rule": bool, "triggered_id": string}`, de modo que el sistema pueda decidir si bloquea la peticion antes de que llegue al modelo generativo principal.

El problema que resuelve es la debilidad del modelo base en dos familias concretas de ataques: jailbreak (extraccion de system prompt, roleplay tipo DAN, instrucciones esteganograficas) y agent tool misuse (llamadas a herramientas fuera de alcance, escalada de privilegios, sondeo del endpoint de metadatos de cloud, inyeccion SQL en parametros de工具). Segun la model card, sobre el conjunto gold_500 el ajuste reduce la tasa de deteccion omitida del 15,6% al 0,6% y eleva la exhaustividad en jailbreak del 44,2% al 100%, manteniendo una precision del 99,4%.

El modelo tiene 4.022.468.096 parametros (dato real de los ficheros safetensors), se distribuye en formato fp16 con dos shards de safetensors y licencia Apache 2.0. Solo declara soporte para chino (zh) e ingles (en), aunque por su herencia de Qwen3 procesa otros idiomas de forma residual. El pipeline declarado en Hugging Face es text-classification, pese a que internamente es un modelo causal (Qwen3ForCausalLM) que genera la etiqueta en lugar de clasificar con una cabeza dedicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only), ajuste LoRA rank 32 / alpha 64 fusionado |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; solo se publican pesos fp16. Al ser un transformer Qwen3 estandar es convertible a GGUF/AWQ/GPTQ, pero el autor no distribuye versiones cuantizadas |
| Idiomas soportados | zh, en (declarados) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp16, 2 shards: model-00001-of-00002.safetensors y model-00002-of-00002.safetensors), ~7,5 GB |
| Modelo base | Qwen/Qwen3Guard-Gen-4B |
| Version actual | V15 (rama `main`) |
| Pipeline declarado | text-classification |
| Libreria | transformers |
| Tamano del repositorio | 8,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-09-11 / 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen3 con 4B parametros. Sobre el se aplico un ajuste LoRA con rank 32 y alpha 64, que despues se fusiono en los pesos completos y se serializo en fp16. No se introduce ninguna cabeza de clasificacion nueva ni modulo de atencion alternativo: el modelo sigue siendo generativo y produce la clasificacion como texto, forzando la salida a un JSON con dos campos. El prompt de sistema distribuido en la model card instruye al modelo a actuar como auditor estricto y a emitir `{"hit_rule": true, "triggered_id": "<categoria>"}` o `{"hit_rule": false, "triggered_id": "none"}`.

El entrenamiento combina dos elementos. Por un lado, el autor refuerza especificamente las categorias donde el base fallaba: jailbreak (extraccion de system prompt, roleplay DAN) y agent-behavior (uso indebido de herramientas, sondeo de IMDS, apilado de consultas SQL). Por otro, los datos de la version V15 se describen como "mismo criterio que el 0.6B V15": reequilibrado de la porcion benigna, oasst1 re-filtrado con guard, prosa china de COIG y texto de estilo OCR. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF o DPO; el autor solo indica el uso de LoRA supervisado. La taxonomia cubre diez categorias de contenido no seguro mas la clase safe, y cada entrada recibe una unica categoria principal.

No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido. El punto diferencial es el protocolo de salida JSON orientado a motor (integracion directa con VirbiusAgent mediante la variable `VIRBIUS_PROMPT_LLM_MODEL`) frente al template de seguridad oficial del modelo base (`Safety: Unsafe/Controversial`).

## Capacidades

- Clasificacion de seguridad de entradas de usuario en una de diez categorias: Violent, Non-violent Illegal Acts, Unethical Acts, Suicide & Self-Harm, Jailbreak, PII, Copyright Violation, Politically Sensitive Topics, Sexual Content or Sexual Acts y Agent Tool Misuse, mas la clase safe.
- Salida determinista en JSON estricto (`hit_rule`, `triggered_id`), apta para parseo programatico en un pipeline de guardarrailes.
- Deteccion de jailbreak: extraccion de system prompt, roleplay tipo DAN e instrucciones ofuscadas o esteganograficas.
- Deteccion de agent tool misuse: llamadas a herramientas fuera de alcance, intentos de escalada de privilegios, sondeo de endpoints de metadatos de cloud (por ejemplo `metadata.google.internal`) e inyeccion SQL embebida en parametros de herramientas.
- Deteccion de PII, contenido sexual, violencia, actos ilegales no violentos, autolesion y violacion de copyright.
- Cribado de temas politicamente sensibles bajo criterio A (mencion explicita = bloqueo).
- Capacidad multilingue limitada a zh y en declarados; hereda del base Qwen3 cierta competencia en otras lenguas, no garantizada por el autor.
- No soporta generacion de texto abierta, razonamiento general, codigo ni matematicas como caso de uso previsto: la salida esta restringida al JSON de clasificacion.
- No se declaran capacidades de vision, audio, tool calling nativo del propio modelo ni modo thinking.

## Casos de uso

- Guardarrail de entrada en agentes autonomos: el modelo se coloca delante del LLM principal y audita cada mensaje del usuario. Si devuelve `hit_rule: true`, el orquestador rechaza la peticion o la redirige a un flujo seguro. Su especialidad en Agent Tool Misuse lo hace adecuado para agentes con acceso a herramientas (HTTP, bases de datos, shell).
- Proteccion frente a prompt injection y jailbreak en aplicaciones expuestas al publico: con una exhaustividad declarada del 100% en jailbreak sobre gold_500 y del 95,2% sobre holdout, reduce el riesgo de extraccion del system prompt o de manipulacion del comportamiento del asistente.
- Moderacion de comunidades y UGC: clasificacion previa de comentarios y mensajes en diez categorias, con una sola etiqueta por entrada, lo que simplifica la politica de escalado (aviso, retencion, bloqueo).
- Cumplimiento de privacidad: deteccion de peticiones orientadas a extraer PII de terceros (direcciones, cuentas, datos de localizacion), con recall del 100% en esa categoria sobre gold_500.
- Auditoria de agentes conectados a infraestructura cloud: identificacion de intentos de acceso al endpoint de metadatos de instancia, un vector clasico de robo de credenciales en entornos cloud, con recall del 98% en Agent Tool Misuse.
- Filtrado previo a la traduccion automatica o al resumen de documentos: el modelo reconoce texto benigno en chino e ingles (por ejemplo, "把这段中文翻译成法文：你好。" se clasifica como safe), por lo que puede actuar como paso previo en pipelines de procesamiento de documentos sin bloquear operaciones legitimas.
- Soporte a equipos de seguridad en la redaccion de reglas: los casos etiquetados y la distincion de fronteras (por ejemplo, investigacion de seguridad autorizada frente a abuso real) sirven como referencia para calibrar politicas internas de moderacion.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Todas las cifras proceden de esa fuente; no se han reproducido de forma independiente.

Conjunto gold_500 (evaluacion principal, mismo criterio para base y ajuste):

| Modelo | acc | recall | Deteccion omitida | Tasa FP | precision |
|---|---|---|---|---|---|
| Qwen3Guard-Gen-4B (base) | 84,8% | 84,4% | 15,6% | 10,8% (4/37) | 99,0% |
| 4B V13.3 | 99,2% | 99,8% | 0,2% | 8,1% (3/37) | 99,4% |
| VirbiusGuard-4B V15 | 98,8% | 99,4% | 0,6% | 8,1% (3/37) | 99,4% |

Recall por categoria sobre gold_500:

| Categoria | Qwen3Guard-Gen-4B | VirbiusGuard-4B V15 |
|---|---|---|
| Jailbreak | 44,2% (23/52) | 100% |
| Agent Tool Misuse | 80,0% (40/50) | 98,0% |
| Politically Sensitive | 72,1% (44/61) | 100% |
| Suicide & Self-Harm | 88,0% | 96,0% |
| PII | 92,0% | 100% |
| Unethical Acts | 92,0% | 100% |
| Violent | 98,0% | 100% |
| Non-violent Illegal | 98,0% | 100% |
| Copyright Violation | 100% | 100% |

Conjuntos suplementarios:

| Conjunto | Modelo | acc | recall | Tasa FP | precision |
|---|---|---|---|---|---|
| gold_600 | Qwen3Guard-Gen-4B | 86,7% | 84,7% | 4,5% | 98,8% |
| gold_600 | V15 | 98,2% | 99,4% | 7,3% | 98,4% |
| holdout_200 | Qwen3Guard-Gen-4B | 87,5% | 82,2% | 1,5% | 99,1% |
| holdout_200 | V15 | 97,0% | 96,3% | 1,5% | 99,2% |

Recall en holdout_200: jailbreak pasa del 33,3% en el base al 95,2% en V15; agent tool misuse, del 62,5% al 93,8%.

No se han publicado resultados en benchmarks estandar de la industria (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible, ni comparaciones con guardarrailes de terceros (por ejemplo, Llama Guard, ShieldGemma): el autor solo compara contra su propio modelo base y contra la version intermedia V13.3.

## Requisitos de hardware

- VRAM estimada para inferencia (cifras derivadas del numero de parametros, no publicadas por el autor): fp16 en torno a 8-9 GB de pesos mas cache KV, lo que en la practica exige unos 10-12 GB para contexto moderado; int8 aproxima 4,5-5 GB; int4 aproxima 2,5-3 GB. El repositorio solo distribuye pesos fp16, por lo que las versiones cuantizadas requieren conversion propia.
- GPU recomendadas: cualquier GPU con 16 GB o mas para fp16 (RTX 4090, RTX 4080, A4000, L4, A10); A100/H100 no son necesarias por tamano, pero utiles para lotes grandes de moderacion en servidor.
- Cabe en GPU de consumo: si. En 24 GB (RTX 3090, RTX 4090) con fp16 y margen amplio; en 12 GB (RTX 3060 12 GB, RTX 4070) es viable en fp16 con contexto corto o en int8; en 8 GB (RTX 3070, RTX 4060) solo con cuantizacion int4.
- Opciones de despliegue: transformers en Python (documentado en la model card, con ejemplo completo); vLLM o TGI para servido con concurrencia; llama.cpp u Ollama tras convertir a GGUF (no se distribuye GGUF oficial). El repositorio incluye el tag `endpoints_compatible`, lo que sugiere compatibilidad con los endpoints gestionados de Hugging Face. En CPU es posible cambiando `.to("cuda")` por `.to("cpu")`; en Mac, por `.to("mps")`.
- Latencia y rendimiento: no disponibles. La unica indicacion operativa de la model card es que `max_new_tokens` debe ser al menos 40 y que la decodificacion se hace greedy (`do_sample=False`), ya que una salida demasiado corta trunca el JSON y rompe el parseo.
- Nota de integracion: la salida generada debe validarse contra un esquema JSON; un JSON truncado o con texto adicional debe tratarse como fallo de clasificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento declarado (gold_500) |
|---|---|---|---|---|---|
| VirbiusGuard-4B (V15) | 4,02B | no disponible | Apache 2.0 | Guardarrail de entrada con salida JSON, especializado en jailbreak y agent tool misuse | acc 98,8%, recall 99,4%, precision 99,4% |
| Qwen3Guard-Gen-4B | 4B (familia base) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Guardarrail generativo con template oficial de seguridad | acc 84,8%, recall 84,4%, precision 99,0% |
| VirbiusGuard (0.6B) | ~0,6B | no disponible | no disponible en la informacion proporcionada | Version ligera del mismo guardarrail, mismo protocolo JSON y mismo criterio V15 | no disponible |

El autor no ofrece comparacion con guardarrailes de otros fabricantes (Llama Guard, ShieldGemma u otros). Cualquier comparacion de ese tipo requeriria una evaluacion propia bajo el mismo conjunto y criterio.

## Limitaciones y advertencias

- El repositorio no tiene descargas ni interacciones registradas en el momento de la consulta y carece de evaluacion independiente: todas las cifras proceden del propio autor.
- El criterio de anotacion es A (mencion explicita = infraccion), lo que provoca bloqueos de menciones neutras de temas politicos o religiosos. El propio autor advierte que un criterio mas permisivo (B, solo discurso malicioso o incitacion) exigiria reetiquetar y reentrenar.
- Riesgo de falsos positivos en dominios legitimos: investigacion en seguridad, periodismo y divulgacion cientifica pueden caer en categorias sensibles (el ejemplo de la model card sobre el funcionamiento de un explosivo en un contexto academico tiende a bloquearse). La tasa de FP declarada es del 8,1% en gold_500 y del 7,3% en gold_600.
- Falsos negativos residuales del 0,6% en gold_500 y del 3,7% en holdout_200: un guardarrail determinista no sustituye la validacion de salida ni los permisos a nivel de herramienta.
- Solo declara zh e ingles; el comportamiento en castellano no esta garantizado ni evaluado, algo critico si se despliega en productos en espanol.
- Alucinacion y formato: al ser un modelo generativo, puede emitir texto fuera del JSON o truncarlo. La model card exige `max_new_tokens >= 40` y decodificacion greedy; es obligatorio validar el esquema antes de actuar sobre `hit_rule`.
- Es un clasificador de entrada (prompt L1): no cubre la moderacion de las respuestas del modelo ni la deteccion de contenido danino generado en la salida.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3Guard-Gen-4B y de los datos de entrenamiento derivados de oasst1 y COIG antes de un despliegue en produccion.
- El modelo incorpora caracteristicas de la familia Qwen3 y del modelo base de seguridad; no se detallan los sesgos especificos introducidos por el ajuste LoRA ni la composicion exacta del dataset de entrenamiento.
- El pipeline declarado en Hugging Face es text-classification, pero la inferencia real es generativa: las herramientas que asuman una cabeza de clasificacion no funcionaran directamente.

## Enlaces

- Hugging Face (modelo 4B): https://huggingface.co/i1see1you/VirbiusGuard-4B
- Hugging Face (version ligera 0.6B): https://huggingface.co/i1see1you/VirbiusGuard
- Modelo base: https://huggingface.co/Qwen/Qwen3Guard-Gen-4B
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas realizadas devolvieron unicamente paginas sobre configuracion de firmas y acceso en Microsoft Outlook, sin relacion con VirbiusGuard-4B. No hay paper, blog tecnico ni repositorio adicional verificable.
