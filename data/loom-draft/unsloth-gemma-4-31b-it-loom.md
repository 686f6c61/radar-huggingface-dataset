# loom-draft/unsloth-gemma-4-31B-it-loom

## Resumen

`loom-draft/unsloth-gemma-4-31B-it-loom` es un paquete de despliegue para AMD Loom del checkpoint GGUF `unsloth/gemma-4-31B-it-GGUF`, en su cuantizacion `gemma-4-31B-it-Q4_K_M.gguf`. El autor es `loom-draft` y el modelo base es Gemma 4 31B en variante instruction-tuned, publicado originalmente por Google y redistribuido en GGUF por Unsloth. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del checkpoint original sin modificar; lo que aporta este repositorio son programas `.loom` generados con la herramienta `loom-next` y una tarjeta `model.json` que permiten servirlo con el runtime `loom-serve` sobre GPUs AMD.

El objetivo es habilitar la inferencia local de un modelo de 31B parametros en hardware AMD de consumo y estaciones de trabajo, concretamente en el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y en la Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling estilo OpenAI y modo de razonamiento opcional. El contexto por peticion esta limitado a 53.248 tokens y se admiten 4 peticiones concurrentes.

Es relevante ahora por dos motivos: por un lado, demuestra que el ecosistema de inferencia sobre ROCm empieza a ofrecer paquetes listos para usar con modelos de gran tamano en GPUs AMD; por otro, su estado es claramente preliminar. El repositorio tiene 0 descargas, 0 likes, un tamano de 0.0 GB y todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) aparecen como "not yet re-measured". Conviene tratarlo como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Gemma 4 31B; no se detalla en la informacion proporcionada) |
| Parametros totales | 31B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible |
| Longitud de contexto | 53.248 tokens por peticion (limite del preset de Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen; empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. El checkpoint es `gemma-4-31B-it`, un modelo de 31.000 millones de parametros en variante instruction-tuned de la familia Gemma 4, pero esta ficha no dispone de datos sobre tipo de transformer, atencion, composicion del dataset de entrenamiento, numero de tokens vistos ni si se aplico RLHF, DPO u otras tecnicas de alineamiento. Cualquier afirmacion al respecto seria especulativa.

Lo que si documenta la model card es la capa de despliegue. Los programas `.loom` y el fichero `weights.loom` se generan con `loom-next` a partir del GGUF original, sin un LLM en el bucle de generacion. `loom-fetch` verifica los ficheros de origen mediante sha256 y los fija en `model.json.lock`. La decodificacion especulativa no aplica en este preset, y el modo de razonamiento esta desactivado por defecto, activable con `chat_template_kwargs: {"enable_thinking": true}`. El ajuste `completion_spin_ns=4294967295` habilita espera activa de las finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo; las mediciones de rendimiento de la tarjeta usan esa configuracion.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI.
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) opcional, desactivado por defecto y activable por peticion.
- Procesamiento de contexto largo: hasta 53.248 tokens por peticion.
- Concurrencia de 4 peticiones simultaneas con salida de hasta 4.096 tokens.
- Multilingue: no disponible en la informacion proporcionada; el modelo base Gemma suele ser multilingue, pero no se confirma aqui.
- Vision: no soportada por Loom, aunque el modelo upstream la tiene.
- Audio de entrada y salida: no soportado por Loom, aunque el modelo upstream lo tiene.
- Decodificacion especulativa: no aplicable en este preset.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.

## Casos de uso

- Asistente conversacional local en estacion de trabajo AMD: servir el paquete con `loom-serve` sobre una Radeon AI PRO R9700 de 32 GB permite disponer de un endpoint compatible con OpenAI en la propia maquina, util para prototipar aplicaciones sin depender de la nube.
- Agentes con tool calling en bucle multi-turno: el soporte de `tools` y `tool_calls` y las 4 peticiones concurrentes permiten construir agentes que consulten APIs o bases de datos locales; la puerta `agent` de correccion aun no esta medida, por lo que conviene validar el comportamiento antes de produccion.
- Procesamiento de documentos largos: con 53.248 tokens de contexto se pueden resumir o extraer informacion de contratos, informes o transcripciones de decenas de paginas en una sola peticion.
- Razonamiento asistido con thinking mode: activando `enable_thinking` se obtiene una traza de razonamiento previa a la respuesta, adecuada para tareas de analisis, depuracion logica o planificacion de pasos.
- Evaluacion comparativa de runtimes en AMD: el paquete incluye puertas de correccion frente a llama.cpp (`golden`, `compare`, `logits`), lo que lo convierte en una base para medir la fidelidad numerica de Loom frente al runtime de referencia sobre el mismo GGUF.
- Laboratorio de investigacion en hardware de consumo: el Ryzen AI Max+ 395 con memoria unificada permite ejecutar un modelo de 31B cuantizado a Q4_K_M en un equipo compacto, escenario util para experimentacion con modelos grandes sin GPU dedicada de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700, pero ambas indican literalmente que "the results for this package are not yet re-measured". Del mismo modo, todas las puertas de correccion aparecen sin medicion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es un Q4_K_M de un modelo de 31B, y el preset esta disenado para una GPU de 32 GB (Radeon AI PRO R9700) y para la memoria unificada del Strix Halo.
- GPU soportadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA: no se mencionan en la informacion proporcionada.
- Cabe en GPU de consumo: si, en el sentido de que el paquete esta pensado para hardware AMD de gama alta para consumidores y estaciones de trabajo, no para aceleradores de datacenter.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--pool_backing=fixed` y `--parameter_mode=preload`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: no disponibles; las tablas de rendimiento no estan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime | Estado |
|---|---|---|---|---|---|---|
| `loom-draft/unsloth-gemma-4-31B-it-loom` | 31B | 53.248 tokens | Q4_K_M | Apache 2.0 | Loom (`loom-serve`) sobre AMD | Experimental, sin metricas |
| `unsloth/gemma-4-31B-it-GGUF` (base) | 31B | no disponible | GGUF (varias) | Apache 2.0 | llama.cpp y derivados | Checkpoint de referencia |
| Gemma 4 31B it (upstream) | 31B | no disponible | safetensors y otras | Apache 2.0 | Multiples | Modelo original |

La comparacion con alternativas de otros fabricantes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Estado preliminar: 0 descargas, 0 likes, repositorio de 0.0 GB y ninguna puerta de correccion medida. No hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- Sin benchmarks: no se puede afirmar nada sobre calidad, latencia o throughput en el hardware objetivo.
- Cobertura multimodal recortada: Loom no soporta entrada de imagen ni audio, aunque el modelo upstream si; las capacidades reales del paquete son solo texto.
- Contexto limitado por el preset a 53.248 tokens, inferior a lo que el modelo base podria admitir en otros runtimes.
- Concurrencia baja: 4 peticiones simultaneas y 4.096 tokens de salida maxima por peticion; insuficiente para cargas de produccion con alto trafico.
- Dependencia de hardware AMD concreto: solo se documentan gfx1151 y gfx1201; no hay garantia de funcionamiento en otras GPUs.
- Idiomas soportados no confirmados en esta ficha; no se debe asumir cobertura multilingue sin verificacion.
- Sesgos y alucinacion: no hay informacion especifica en la model card; al ser un modelo de lenguaje de 31B, son riesgos inherentes que requieren evaluacion propia.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los terminos del checkpoint base de Gemma 4 por si anaden condiciones adicionales.
- La busqueda web realizada devolvio unicamente resultados de la herramienta de grabacion de pantalla Loom y de la marca de ropa Loom, sin relacion con este proyecto; no se han podido verificar enlaces externos adicionales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-gemma-4-31B-it-loom
- Checkpoint base en Hugging Face: https://huggingface.co/unsloth/gemma-4-31B-it-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
