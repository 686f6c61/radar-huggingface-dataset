# raahemnabeel/qwen3-coder-next-blackhole

## Resumen

qwen3-coder-next-blackhole es un paquete de despliegue publicado por el usuario raahemnabeel que sirve el checkpoint Qwen3-Coder-Next sobre aceleradores Tenstorrent Blackhole mediante vLLM y el plugin vllm-tt. No se trata de un modelo entrenado desde cero: el repositorio (15,4 GB) contiene el codigo del motor, las trazas de decodificacion por anchura y el manifiesto de tt-model-manager 0.1.0 (esquema 5.1), mientras que los pesos se descargan aparte desde Qwen/Qwen3-Coder-Next en la revision a7fbcb5c0e12d62a448eaa0e260346bf5dcc0feb.

El modelo subyacente es un MoE de 80.000 millones de parametros totales y 3.000 millones activos, con 512 expertos, seleccion top-10 mas un experto compartido, y 48 capas que combinan Gated DeltaNet con atencion con puerta. Soporta una ventana de contexto de 262.144 tokens, hasta 32 secuencias concurrentes, chunked prefill y tool calling a traves del parser qwen3_coder de vLLM, todo expuesto como servidor compatible con la API de OpenAI.

Su relevancia es fundamentalmente de infraestructura: demuestra que un MoE de codigo de gran tamano puede servirse en hardware Tenstorrent repartido en cuatro dies (perfiles p300x2 o p150x4) o dos (p300 o p150x2), con paralelismo tensorial en los mixers y expertos fragmentados en la dimension intermedia. La model card documenta una correccion de corrupcion de palabras en el muestreo en dispositivo y aporta benchmarks propios del port, pero no declara licencia, idiomas soportados ni resultados en benchmarks agénticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: 48 capas de Gated DeltaNet + atencion con puerta; 512 expertos, top-10 + experto compartido |
| Parametros totales | 80.000 millones (80B) |
| Parametros activos | 3.000 millones (3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bfp4 en expertos enrutados para los perfiles de dos dies; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se especifica en la informacion proporcionada, tampoco la del checkpoint base) |
| Formato de pesos | safetensors, procedentes del checkpoint Qwen/Qwen3-Coder-Next y descargados aparte; el repositorio contiene codigo y empaquetado tt-model, no los pesos |
| Hardware objetivo | Tenstorrent Blackhole: p300x2, p150x4, p300, p150x2 |
| Servidor | vLLM v0.26.0 con vllm-tt-plugin, API compatible con OpenAI en el puerto 20000 |
| Secuencias concurrentes maximas | 32 |
| Tool calling | parser qwen3_coder de vLLM con --enable-auto-tool-choice activado |
| Muestreo por defecto del checkpoint | temperature 1.0, top_p 0.95, top_k 40 |
| Empaquetado | tt-model-manager 0.1.0, esquema de manifiesto 5.1 |

## Arquitectura y entrenamiento

La arquitectura corresponde al checkpoint Qwen3-Coder-Next, un modelo de mezcla de expertos con 80B de parametros totales y 3B activos por token. Cada capa combina Gated DeltaNet con atencion con puerta, y la capa MoE contiene 512 expertos con enrutamiento top-10 mas un experto compartido siempre activo. El port distribuye los mixers con paralelismo tensorial y fragmenta los expertos en la dimension intermedia; los perfiles de cuatro dies usan mayor ancho de ejecucion, mientras que los de dos dies recurren a expertos enrutados en bfp4.

No se dispone de informacion sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del checkpoint original, ya que la model card se centra en el despliegue. La innovacion tecnica documentada es de inferencia: el muestreo en dispositivo se ejecuta en cada die de la malla y cada die realimentaba su propio sorteo, lo que provocaba divergencia entre generadores aleatorios y corrompia aproximadamente una palabra de cada treinta en respuestas largas muestreadas (por ejemplo, "safetensors" -> "checkpointsetensors"). La correccion (`_install_lockstep_sampling` en `tt/model.py`) hace que todos los dies sorteen con semillas identicas por paso y adopten el token del die 0; verificado en p300x2 a 20K de contexto con 0 discrepancias en 400 pasos muestreados, frente a 196 antes. El port deriva del autoport de Qwen3.5-122B-A10B para Blackhole, de la misma familia de arquitectura.

## Capacidades

- Generacion de texto y codigo: el caso de uso central del checkpoint, servido mediante API compatible con OpenAI.
- Razonamiento matematico basico: GSM8K exact match del 92,4 % en la evaluacion del port.
- Seguimiento de instrucciones: IFEval prompt-level strict del 75,8 %.
- Tool calling y function calling: parser qwen3_coder de vLLM, con eleccion automatica de herramienta activada.
- Contexto largo: hasta 262.144 tokens por peticion, con chunked prefill para que los prompts largos no bloqueen peticiones cortas.
- Concurrencia: hasta 32 secuencias simultaneas por instancia.
- Capacidades agénticas multi-paso: tecnicamente soportadas por el tool calling, pero no evaluadas en este port (SWE-Bench Verified y LiveCodeBench no se ejecutaron).
- Modo de pensamiento: no. La model card indica explicitamente que el modelo no piensa y no emite bloque de razonamiento.
- Vision, audio u otras modalidades: no disponible.
- Capacidades multilingues: no disponible, no se documentan idiomas soportados.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD como servicio HTTP compatible con OpenAI, con tool calling para invocar linters, compiladores o ejecutores de tests desde el propio bucle de generacion.
- Asistencia de codigo sobre repositorios completos: la ventana de 262.144 tokens permite cargar varios ficheros o un arbol de proyecto amplio en una sola peticion, y el chunked prefill evita que ese prompt bloquee a otros usuarios.
- Refactorizacion y migracion de codigo: con contexto largo y salida estructurada via function calling, se puede usar para reescribir modulos completos manteniendo la coherencia entre ficheros.
- Explicacion y documentacion automatica de bases de codigo heredadas: el modelo puede recorrer ficheros largos y producir resumenes o documentacion tecnica sin trocear el contenido en fragmentos que pierdan contexto.
- Agentes de automatizacion de tareas de desarrollo: el parser qwen3_coder y la eleccion automatica de herramienta permiten construir agentes que encadenen busquedas, ediciones y ejecuciones, siempre que se validen los resultados, ya que no hay benchmarks agénticos publicados para este port.
- Servicio interno de asistencia a desarrolladores: hasta 32 secuencias concurrentes por instancia en cuatro dies permiten atender a un equipo pequeno o mediano con un despliegue unico en hardware Tenstorrent.
- Evaluacion de infraestructura alternativa a GPU: util para equipos que quieran medir el rendimiento real de un MoE de codigo en Blackhole antes de comprometerse con ese hardware, usando los perfiles p300x2, p150x4, p300 o p150x2.

## Benchmarks y rendimiento

Resultados obtenidos a traves de la API servida en cuatro dies con lm-evaluation-harness 0.4.9. No se dispone de cifras equivalentes del checkpoint original para comparar, salvo la indicacion de que Qwen no publica HumanEval ni MBPP para este checkpoint.

| Benchmark | temperature 0 | temperature 1.0 |
|---|---|---|
| HumanEval pass@1 | 68,9 % | 60,4 % |
| MBPP pass@1 | 77,2 % | dentro del margen de error |
| GSM8K exact match | 92,4 % | dentro del margen de error |
| IFEval prompt-level strict | 75,8 % | dentro del margen de error |
| SWE-Bench Verified | no ejecutado | no ejecutado |
| LiveCodeBench | no ejecutado | no ejecutado |

A temperature 0, el unico benchmark que cae de forma significativa al pasar a temperature 1.0 es HumanEval (68,9 % a 60,4 %), porque un unico token incorrecto invalida la respuesta completa en esa tarea.

## Requisitos de hardware

- Este paquete no se ejecuta en GPU convencionales: el plugin vllm-tt esta orientado a aceleradores Tenstorrent Blackhole. No se dispone de VRAM estimada ni de soporte CUDA documentado.
- Perfiles disponibles y su hardware: p300x2 (por defecto), p150x4, p300 y p150x2. Los dos primeros usan cuatro dies y son mas rapidos; los dos ultimos usan dos dies con las mismas funciones y expertos enrutados en bfp4.
- Los cuatro perfiles comparten max_num_seqs 32 y max_model_len 262.144.
- Despliegue: `tt-model pull raahemnabeel/qwen3-coder-next-blackhole --with-weights` descarga la imagen Docker y los pesos al cache de HuggingFace; `tt-model serve` arranca el servidor. El primer arranque compila kernels para el dispositivo y tarda varios minutos.
- Cliente: cualquier cliente compatible con la API de OpenAI apuntando a `http://127.0.0.1:20000` con nombre de modelo `Qwen/Qwen3-Coder-Next`.
- Latencia y throughput: no disponible. La model card no publica tokens por segundo ni latencias por peticion.
- Almacenamiento: el repositorio ocupa 15,4 GB y los pesos se descargan por separado, por lo que el espacio total necesario es mayor.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento comparables en la informacion proporcionada. La tabla recoge lo unico verificable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-coder-next-blackhole (este port) | 80B totales / 3B activos | 262.144 tokens | HumanEval 68,9 %, MBPP 77,2 %, GSM8K 92,4 %, IFEval 75,8 % | no disponible | HuggingFace, requiere hardware Tenstorrent Blackhole |
| Qwen/Qwen3-Coder-Next (checkpoint base) | 80B totales / 3B activos | no disponible en la informacion proporcionada | Qwen no publica HumanEval ni MBPP para este checkpoint | no disponible | HuggingFace |
| Qwen3.5-122B-A10B Blackhole autoport (origen del port) | 122B totales / 10B activos | no disponible | no disponible | no disponible | referenciado en la model card, sin enlace directo |
| Alternativas de codigo en GPU de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El muestreador en dispositivo admite top_k hasta 32, pero el valor recomendado del checkpoint es top_k 40. Se recorta a 32 en lugar de derivar al muestreo en host, por lo que una peticion por defecto no se sirve con el muestreador que especifica la model card.
- Los benchmarks agénticos (SWE-Bench Verified, LiveCodeBench), que son los que publica Qwen para este checkpoint, no se ejecutaron en este port.
- El defecto de corrupcion de palabras al muestrear en dispositivo afectaba a las revisiones hasta ef463288. Si se usa una revision anterior, la salida puede contener palabras corruptas y el modelo se servia en modo greedy por defecto.
- No se declara licencia en el repositorio ni en la informacion disponible, por lo que no puede confirmarse la viabilidad de uso comercial. Debe verificarse la licencia del checkpoint base Qwen/Qwen3-Coder-Next antes de cualquier despliegue en produccion.
- No se documentan idiomas soportados, sesgos evaluados ni tasas de alucinacion. Como modelo de codigo, puede generar APIs, firmas o dependencias inexistentes con apariencia plausible; toda salida debe validarse ejecutando el codigo.
- El modelo no dispone de modo de pensamiento ni bloque de razonamiento, lo que limita tareas que se beneficien de cadena de pensamiento explicita.
- Procedencia incompleta: tt-metal y vllm-tt-plugin se construyeron desde checkouts locales con arbol de trabajo sucio y commits no publicados, lo que dificulta la reproducibilidad exacta de la imagen.
- El paquete tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y su mantenimiento depende de un unico autor, sin garantias de soporte continuado.
- El primer arranque requiere compilacion de kernels in situ durante varios minutos; no es un despliegue inmediato.
- Requiere hardware Tenstorrent Blackhole. No hay ruta documentada para ejecutarlo en GPU CUDA ni en CPU.
- El estado del repositorio es de octubre de 2026, con revision inicial el 2026-10-02 y ultima actualizacion el 2026-10-06.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raahemnabeel/qwen3-coder-next-blackhole
- Checkpoint base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Revision de pesos referenciada en la model card: a7fbcb5c0e12d62a448eaa0e260346bf5dcc0feb
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- vLLM v0.26.0: https://github.com/vllm-project/vllm/releases/tag/v0.26.0
- Busqueda web: no se han encontrado resultados relevantes; las unicas coincidencias devueltas apuntan a TikTok y no guardan relacion con el modelo.
