# selorahomes/Selora-AI-LLM-14B

## Resumen

Selora AI LLM 14B es un modelo de lenguaje instruido desarrollado por Selora Homes y publicado en HuggingFace bajo el identificador `selorahomes/Selora-AI-LLM-14B`. No es un modelo entrenado desde cero: se construye sobre Qwen3 14B (14.768.307.200 parametros) mediante cinco adaptadores LoRA especializados que comparten una unica base cuantizada en GGUF. Los cinco especialistas son `command` (control de dispositivos), `automation` (redaccion de automatizaciones y blueprints), `answer` (respuestas sobre el estado en vivo de la vivienda), `clarification` (repreguntas ante peticiones ambiguas) y `utilities` (mantenimiento, diagnostico y ayuda de configuracion anclada en documentacion).

El problema que resuelve es concreto: dotar a Home Assistant de un asistente local capaz de traducir lenguaje natural a llamadas de servicio, YAML de automatizacion y respuestas de estado, sin depender de APIs en la nube. La integracion oficial (ha-selora-ai) intercambia el adaptador activo por peticion mediante el endpoint `/lora-adapters` de `llama-server`, de modo que un solo runtime sirve las cinco intenciones. El conjunto completo de pesos ocupa unos 10,5 GB (base Q5_K_S de 10,3 GB mas cinco adaptadores F16 de entre 26 MB y 96 MB), en lugar de los mas de 50 GB que supondrian cinco modelos de 14B independientes.

Es relevante ahora porque el modelo esta disenado explicitamente para desplegarse en hardware de gama domestica (aproximadamente 16 GB de memoria para modelo, cache KV y Home Assistant en conjunto) y porque publica resultados medidos sobre el harness abierto `allenporter/home-assistant-datasets`, el mismo que alimenta la tabla de clasificacion de LLM de Home Assistant. La ventana de contexto es deliberadamente corta: 4096 tokens, el presupuesto para el que se construyeron el corpus y el `manifest.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen3 14B; no es MoE |
| Parametros totales | 14.768.307.200 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (`runtime.ctx_size` en el manifest) |
| Tipos de cuantizacion | Base en GGUF Q5_K_S; adaptadores LoRA en GGUF F16. El autor indica que Q4_K_M es mas pequeno pero degrada de forma medible la precision en consultas de documentacion |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (base Q5_K_S + 5 adaptadores LoRA F16); no se publican safetensors del modelo ajustado |
| Modelo base | Qwen/Qwen3-14B (relacion: adapter) |
| Tamano del repositorio | 42,6 GB |
| Descargas / likes | 674 / 1 |
| Fechas | Creado el 2026-08-22, actualizado el 2026-10-16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3 14B, un transformer decoder-only denso (sin mezcla de expertos). Los hiperparametros concretos de la base (numero de capas, dimension oculta, configuracion de atencion) no se detallan en la informacion proporcionada. Sobre esa base se entrena un conjunto de cinco adaptadores LoRA independientes, uno por intencion, que se cargan sobre el mismo tronco congelado. Todos ellos se entrenaron contra el mismo corpus y los mismos system prompts, y emiten el mismo formato de salida: sobres JSON compactos denominados *slim envelopes*. El repositorio incluye, por especialista, un `Modelfile.{intent}` para Ollama y un fichero `prompts/{intent}_system_prompt.txt` con el prompt exacto usado en el entrenamiento, ademas de un `manifest.json` con version, tamano y sha256 de cada fichero y la receta de entrenamiento.

El detalle cuantitativo del entrenamiento (numero de tokens, composicion exacta del dataset, si hubo RLHF, DPO u otra fase de alineacion posterior al SFT) no esta disponible en la informacion proporcionada. Lo que si se documenta es el metodo de evaluacion y el uso previsto: la eleccion de Q5_K_S responde a la necesidad de que base, adaptadores, cache KV y Home Assistant convivan en un despliegue de 16 GB. La innovacion practica no esta en el algoritmo, sino en la orquestacion: cinco adaptadores de tamano reducido sobre una unica base, con intercambio en caliente por peticion a traves de `/lora-adapters` en `llama-server`, evitando cargar cinco modelos completos en memoria.

## Capacidades

- Generacion de texto conversacional orientada a tareas del hogar, con salida estructurada en JSON (slim envelopes).
- Traduccion de lenguaje natural a llamadas de servicio de Home Assistant (especialista `command`): encendido, apagado, ajuste de parametros de dispositivos.
- Redaccion de automatizaciones y blueprints en YAML, incluyendo declaracion y cableado de los inputs solicitados (especialista `automation`).
- Respuestas sobre el estado en vivo de la vivienda (especialista `answer`).
- Desambiguacion activa: genera preguntas de seguimiento cuando la peticion es ambigua (especialista `clarification`).
- Ayuda de mantenimiento, diagnostico y configuracion anclada en documentacion, con citas (especialista `utilities`).
- Soporte de tool use / function calling implicitamente, dado que su salida son llamadas de servicio de Home Assistant.
- Capacidad de formar parte de flujos multi-paso: clarificacion, resolucion de la intencion y emision de la accion.
- Multilingue: no. El modelo declara unicamente ingles.
- Vision, audio o modos de razonamiento extendido (thinking): no disponibles.

## Casos de uso

- Control de dispositivos por lenguaje natural en Home Assistant: el especialista `command` convierte "turn off the kitchen lights" en la llamada de servicio correspondiente, con contexto de 4096 tokens suficiente para el historial de una interaccion domestica tipica.
- Generacion de automatizaciones y blueprints: el especialista `automation` produce YAML que Home Assistant acepta como blueprint con todos los inputs declarados y conectados, tal y como verifica el harness de evaluacion.
- Panel de consultas de estado: el especialista `answer` responde a preguntas sobre el estado actual de la vivienda (sensores, entidades, disponibilidad) sin necesidad de que el usuario navegue por el panel.
- Asistente conversacional con gestion de ambiguedad: ante peticiones incompletas, el especialista `clarification` formula la repregunta adecuada antes de ejecutar una accion potencialmente incorrecta.
- Soporte tecnico y mantenimiento guiado: el especialista `utilities` resuelve dudas de configuracion y diagnostico con respuestas ancladas en documentacion y acompanadas de citas.
- Despliegue local con privacidad estricta: al ejecutarse con `llama-server` u Ollama sobre hardware propio, los datos de presencia, rutinas y estado del hogar no salen de la red local.
- Servicio multi-intencion en un unico runtime de 16 GB: un solo proceso `llama-server` atiende las cinco intenciones cambiando el adaptador activo antes de cada llamada a `/v1/chat/completions`, lo que reduce el coste de memoria frente a mantener cinco modelos.
- Evaluacion continua en CI: el harness `allenporter/home-assistant-datasets` permite medir regresiones por especialista (assist, assist-mini, questions, automations) a temperatura 0 sobre la suite completa.
- Sustitucion de un modelo generalista en integraciones existentes: el repositorio publica una version fusionada (`Selora-AI-LLM-14B-ollama`) para runtimes que no permiten intercambio de adaptadores.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre la suite abierta `allenporter/home-assistant-datasets` (el harness de la tabla de clasificacion de LLM de Home Assistant), a temperatura 0, sobre la suite completa, con llama.cpp en CUDA y la cuantizacion de distribucion. Se publican dos modos: *model only*, con las anulaciones deterministas de la integracion desactivadas, y *net + model*, con esas anulaciones en el bucle. Los intervalos son de Wilson al 95%.

| Dataset | Casos | Model only | Net + model |
|---|---|---|---|
| assist | 460 | 80,4% [76,6; 83,8] | 88,0% [84,8; 90,7] |
| assist-mini | 196 | 95,9% [92,2; 97,9] | 100,0% [98,1; 100,0] |
| questions | 370 | 85,7% [81,7; 88,9] | 94,6% [91,8; 96,5] |
| automations | 20 | 100,0% [83,9; 100,0] | 100,0% [83,9; 100,0] |

Advertencias del propio autor sobre estas cifras: en `automations` son cuatro tareas de blueprint con cinco muestras cada una y se puntuan por separado; una respuesta se considera valida si Home Assistant la acepta como blueprint con todos los inputs solicitados declarados y conectados, pero la automatizacion no se ejecuta. En el modo *net + model* la aprobacion y la lista blanca de comandos seguros estan desactivadas durante la ejecucion, y la metrica de `questions` sale alta en casos de calendario porque los fixtures proporcionan datos de eventos que un Home Assistant real no suministra. La version fusionada de modelo unico puntua mas bajo, sobre todo con las anulaciones desactivadas; sus cifras estan en su propia model card. No se han publicado en la informacion disponible resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K ni similares).

## Requisitos de hardware

- Memoria total recomendada: aproximadamente 16 GB para el modelo, la cache KV y Home Assistant funcionando en paralelo.
- Peso de los ficheros: base `qwen3_14b_base.Q5_K_S.gguf` de 10,3 GB (9,6 GiB) mas cinco adaptadores F16 que suman unos 263 MB (51 MB command, 96 MB automation, 39 MB answer, 26 MB clarification, 51 MB utilities).
- GPU de consumo: el conjunto entra en tarjetas de 16 GB o mas (por ejemplo RTX 4060 Ti 16 GB, RTX 4080, RTX 4090) y en equipos Apple Silicon con memoria unificada de 16 a 32 GB. Con 12 GB de VRAM el despliegue queda muy justo al sumar cache KV y sistema operativo.
- Hardware objetivo declarado: Selora Hubs con 32 GB de RAM; la linea de 1.7B esta pensada para despliegues con muchos menos recursos.
- Servido: `llama.cpp` con soporte de LoRA (`llama-server`) o Ollama 0.30 o superior por especialista. Para runtimes que no pueden intercambiar adaptadores existe la build fusionada.
- Invocacion de referencia: `llama-server --model qwen3_14b_base.Q5_K_S.gguf --lora-init-without-apply --lora command.f16.gguf,automation.f16.gguf,... --ctx-size 4096`. Los adaptadores deben pasarse en un unico flag `--lora` separados por comas: si se repite el flag, llama.cpp conserva solo el ultimo valor y responde todas las intenciones con un unico adaptador de forma silenciosa.
- Seleccion de adaptador en tiempo de ejecucion: POST a `/lora-adapters` antes de cada llamada a `/v1/chat/completions`, resolviendo los identificadores de slot por nombre de fichero a partir del listado de `/lora-adapters`, sin asumir un orden fijo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Selora-AI-LLM-14B | 14,77B | 4096 tokens | GGUF Q5_K_S + 5 LoRA F16 | Apache-2.0 | 5 especialistas de hogar sobre base compartida, intercambio en caliente |
| Selora-AI-LLM-14B-ollama | 14,77B (fusionado) | No disponible | GGUF fusionado | Apache-2.0 | Mismo corpus, un solo modelo para runtimes sin swap de adaptadores; puntua mas bajo |
| Selora-AI-LLM-1.7B | 1,7B (aproximado) | No disponible | GGUF | Apache-2.0 | Misma familia y mismo formato de salida, para despliegues con muchos menos recursos |
| Qwen/Qwen3-14B | 14,77B | No disponible en la informacion | Safetensors y GGUF | Apache-2.0 | Modelo base generalista; no incluye los adaptadores ni el formato de salida de Home Assistant |

No se dispone de comparativas publicadas frente a otros asistentes de hogar de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente ingles. No hay soporte documentado de castellano ni de otros idiomas, lo que limita su uso directo en despliegues en Espana sin traduccion previa.
- Dominio restringido: esta ajustado para Home Assistant y automatizacion del hogar; su rendimiento como modelo de proposito general no esta documentado y previsiblemente sera inferior al de Qwen3 14B sin ajustar.
- Contexto corto: 4096 tokens es un presupuesto reducido para conversaciones largas o historiales extensos de entidades; superarlo obliga a truncar o resumir.
- Riesgo de alucinacion en acciones: una llamada de servicio mal generada puede actuar sobre el dispositivo equivocado. En el despliegue real existen aprobacion y lista blanca de comandos seguros, pero durante la ejecucion de benchmarks ambas estan desactivadas, por lo que las cifras *net + model* no reflejan exactamente la ruta de produccion.
- Benchmarks con matices: la suite de automatizaciones solo valida que el blueprint sea aceptado, no que se ejecute correctamente, y los casos de calendario de `questions` usan datos de fixtures que un Home Assistant real no aporta.
- Trampa de configuracion documentada: repetir el flag `--lora` en `llama-server` carga un unico adaptador y responde todas las intenciones con el, sin aviso. Ademas, los identificadores de slot deben resolverse por nombre de fichero y no por orden asumido.
- Licencia: Apache-2.0 permite uso comercial, pero el repositorio incluye un fichero NOTICE con la atribucion de Qwen3 y la licencia de la base (tambien Apache-2.0); conviene conservar ambas en cualquier redistribucion.
- Adopcion muy baja: 674 descargas y 1 like en el momento de la consulta, con un unico autor responsable del ajuste. No hay validacion independiente de los resultados publicados.
- Fechas del repositorio: creado el 2026-08-22 y actualizado el 2026-10-16, segun los metadatos de HuggingFace.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces utiles son los de la model card y los repositorios referenciados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/selorahomes/Selora-AI-LLM-14B
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Version fusionada para Ollama: https://huggingface.co/selorahomes/Selora-AI-LLM-14B-ollama
- Linea de 1.7B: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B
- Integracion de Home Assistant: https://github.com/SeloraHomes/ha-selora-ai
- Sitio del autor: https://selorahomes.com
- Suite de evaluacion: https://github.com/allenporter/home-assistant-datasets
- Home Assistant: https://www.home-assistant.io/
