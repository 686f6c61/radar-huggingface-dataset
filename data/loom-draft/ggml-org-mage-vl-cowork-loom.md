# loom-draft/ggml-org-Mage-VL-Cowork-loom

## Resumen

Mage-VL-Cowork para AMD Loom es un paquete de despliegue (formato `.loom` más un `model.json` de tarjeta) generado por la herramienta loom-next a partir del checkpoint GGUF sin modificar `ggml-org/Mage-VL-Cowork-GGUF`, en su cuantización Q4_K_M. No se trata de un modelo de lenguaje nuevo ni de un fine-tune de pesos: es un artefacto de empaquetado que traduce los pesos originales a programas Loom ejecutables sobre la pila de inferencia `loom-serve` (paquete `hrx-loom`), orientada a GPUs AMD. El repositorio lo publica el usuario loom-draft bajo licencia Apache 2.0 y está etiquetado para dos plataformas concretas: el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, Mage-VL-Cowork, es un modelo multimodal (VL, visión-lenguaje) con capacidad de razonamiento o "thinking" y de tool calling, según se deduce de las funcionalidades que expone la tarjeta. Sin embargo, esta distribución concreta renuncia a la entrada de imagen: la tabla de características indica explícitamente que Loom no soporta entrada de imágenes, aunque el modelo original sí. Por tanto, en la práctica se ofrece como un endpoint de chat compatible con la API de OpenAI, con tool calling, razonamiento activado por defecto y una ventana de contexto de 40.960 tokens por petición.

La relevancia de este paquete es fundamentalmente de infraestructura: demuestra la viabilidad de servir modelos GGUF en hardware AMD consumer y profesional mediante un runtime alternativo a llama.cpp, con soporte de concurrencia (4 peticiones simultáneas) y un conjunto de pruebas de corrección (gates) diseñadas para comparar la salida token a token contra la referencia de llama.cpp. No obstante, en el momento de la publicación ninguna de esas mediciones de rendimiento ni de corrección ha sido revalidada para este paquete, lo que limita seriamente cualquier conclusión sobre su calidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal VL; la distribucion Loom solo expone texto) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 40.960 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Mage-VL-Cowork-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | soportado (formato OpenAI `tools` / `tool_calls`) |
| Razonamiento / thinking | activado por defecto; desactivable con `chat_template_kwargs: {"enable_thinking": false}` |
| Decodificacion especulativa | no aplicable en esta configuracion |
| Entrada de imagen | no soportada por Loom (el modelo upstream si la tiene) |
| Entrada/salida de audio | no aplicable |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| Generador del paquete | loom-next (sin LLM en el bucle) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Mage-VL-Cowork (tipo de transformer, atencion, posible mezcla de expertos, numero de parametros ni composicion del dataset de entrenamiento). La tarjeta del paquete no documenta el proceso de preentrenamiento, ajuste fino, RLHF o DPO del modelo original; se limita a describir el empaquetado. Lo unico verificable es que el checkpoint upstream es un GGUF multimodal con capacidad de vision y que el paquete Loom conserva los pesos sin modificarlos ("unmodified GGUF checkpoint").

La innovacion tecnica de esta distribucion no esta en el modelo sino en el runtime. loom-next genera programas `.loom` (kernels y grafo de ejecucion) a partir del GGUF, y `loom-serve` los ejecuta sobre GPUs AMD mediante el dispositivo `amdgpu://`. La tarjeta documenta opciones de despliegue relevantes para el rendimiento: `completion_spin_ns=4294967295` activa espera activa de las finalizaciones de GPU (consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` reserva el pool de memoria por adelantado en lugar de crecimiento elastico y `--parameter_mode=preload` cambia solo la carga de pesos en host. Ademas, el paquete incluye un conjunto de gates de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, con criterio de divergencia solo en casos de casi-empate. En la publicacion actual, todos los gates aparecen como "not yet re-measured" en ambas plataformas.

## Capacidades

- Generacion de texto conversacional multi-turno mediante endpoint compatible con la API de OpenAI (`/v1/chat/completions`).
- Razonamiento o "thinking" activado por defecto, desactivable por peticion con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), lo que habilita bucles de agente multi-paso.
- Concurrencia de hasta 4 peticiones simultaneas con consistencia declarada como gate de correccion (aunque no revalidada en este paquete).
- Contexto de 40.960 tokens por peticion, adecuado para documentos largos o historiales extensos.
- Capacidad de vision presente en el modelo upstream pero no expuesta por esta distribucion (Loom no soporta entrada de imagen).
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y expone un endpoint OpenAI, por lo que puede conectarse a clientes existentes sin cambios de codigo; encaja en entornos donde no se quiere depender de GPUs NVIDIA ni de servicios en la nube.
- Agentes con tool calling en local: al soportar `tools` y `tool_calls` con razonamiento activado, el modelo puede orquestar llamadas a APIs internas (consulta de bases de datos, ticketing, busqueda documental) en bucles multi-paso ejecutados integramente en la maquina del desarrollador.
- Procesamiento de documentos largos: la ventana de 40.960 tokens permite resumir contratos, informes tecnicos o hilos de correo extensos en una sola peticion, con 4.096 tokens de salida configurables para resumenes detallados.
- Evaluacion de runtimes alternativos a llama.cpp: el paquete incluye gates de correccion comparativos (golden, compare, logits, sampling) que permiten a un equipo de infraestructura medir la fidelidad de Loom frente a la referencia sobre el mismo GGUF antes de adoptarlo.
- Prototipado de pipelines RAG: el endpoint compatible con OpenAI permite integrar el modelo en frameworks como LangChain o LlamaIndex y probar recuperacion aumentada con contexto largo sin salir del hardware AMD local.
- Banquito de pruebas para desarrollo de kernels: dado que loom-next genera los programas `.loom` a partir del GGUF, el paquete sirve como caso de estudio para validar la generacion automatica de kernels y la ejecucion en gfx1151 y gfx1201.
- Inferencia por lotes de baja concurrencia: con 4 peticiones simultaneas y un preset de `max_tokens` de 4.096, es apto para tareas de clasificacion, extraccion de entidades o generacion de resumenes en pequenos volumenes internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican literalmente que "the results for this package are not yet re-measured". Del mismo modo, todos los gates de correccion figuran como "not yet re-measured" en las dos plataformas, por lo que no existe evidencia registrada de fidelidad, latencia ni throughput para esta distribucion concreta.

## Requisitos de hardware

- VRAM estimada: no disponible. El paquete esta pensado para dos plataformas con memoria unificada o dedicada: Strix Halo (Ryzen AI Max+ 395, memoria unificada LPDDR5X compartida con CPU y GPU) y Radeon AI PRO R9700 (32 GB de VRAM dedicada). El tamano exacto del GGUF Q4_K_M no se especifica en la informacion proporcionada.
- GPU soportadas: exclusivamente AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB), segun los presets incluidos (`chat` y `chat-r9700`).
- GPUs consumer: no se documenta soporte para GPUs de consumo AMD (RDNA3/RDNA4 de escritorio) ni para NVIDIA; el runtime apunta a `amdgpu://` con las arquitecturas citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servirlo con `--pool_backing=fixed --parameter_mode=preload` y, opcionalmente, `completion_spin_ns=4294967295` para espera activa.
- Latencia y throughput: no disponibles; las mediciones del autor no han sido revalidadas para este paquete.
- Concurrencia maxima: 4 peticiones simultaneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Tool calling | Licencia | Runtime |
|---|---|---|---|---|---|---|
| Mage-VL-Cowork (paquete Loom, este repo) | no disponible | 40.960 tokens | No (en Loom) | Si | Apache 2.0 | loom-serve sobre AMD gfx1151 / gfx1201 |
| ggml-org/Mage-VL-Cowork-GGUF (upstream) | no disponible | no disponible | Si | Si (segun modelo base) | Apache 2.0 | llama.cpp y derivados |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparacion cuantitativa con alternativas de la misma categoria. La comparacion mas directa y verificable es con el propio GGUF upstream: misma licencia y mismos pesos, con la diferencia de que la distribucion Loom pierde la entrada de imagen y cambia el runtime de llama.cpp a loom-serve.

## Limitaciones y advertencias

- El paquete no ha sido revalidado: rendimiento y correccion figuran como "not yet re-measured" en ambas plataformas, por lo que no hay evidencia publicada de que la salida coincida con llama.cpp.
- Perdida de multimodalidad: la entrada de imagen no esta soportada por Loom, aunque el modelo upstream si la tiene; usar este paquete para tareas de vision no es posible.
- Compatibilidad de hardware muy restringida: solo se documentan los presets para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB); no hay garantia en otras GPUs AMD ni en NVIDIA.
- Concurrencia baja: 4 peticiones simultaneas y 4.096 tokens maximos de salida limitan su uso en servicios con trafico alto.
- Madurez del ecosistema: el runtime `hrx-loom` esta en version 0.2.0 y el paquete se ha generado con loom-next sin intervencion de un LLM; es un artefacto experimental mas que un despliegue estable.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible para el modelo base.
- Idiomas soportados: no especificados, lo que impide garantizar calidad en castellano u otras lenguas.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un empaquetado de terceros conviene verificar la licencia y condiciones del checkpoint upstream antes de desplegarlo.
- Cero adopcion registrada: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/ggml-org-Mage-VL-Cowork-loom
- Checkpoint GGUF upstream: https://huggingface.co/ggml-org/Mage-VL-Cowork-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
