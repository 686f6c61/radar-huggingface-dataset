# loom-draft/startlux-models-StartLux-Decision-v1.1-27B-AutoThink-loom

## Resumen

StartLux-Decision-v1.1-27B-AutoThink es un modelo de lenguaje y vision de 27.000 millones de parametros desarrollado por startlux-models, distribuido originalmente en formato GGUF bajo el identificador `startlux-models/StartLux-Decision-v1.1-27B-AutoThink-GGUF`. El repositorio que documenta esta ficha, publicado por el usuario loom-draft, no contiene pesos nuevos: es un paquete de despliegue en formato Loom (`.loom` y un `model.json`) generado con la herramienta `loom-next` a partir del checkpoint GGUF Q4_K_M sin modificar, orientado a GPUs AMD.

El paquete esta pensado para dos aceleradores concretos: el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Su interes es practico: permite servir el modelo sobre ROCm mediante `loom-serve` con una API compatible con OpenAI, soporte de tool calling, modo de razonamiento configurable y entrada de imagenes, sin depender de llama.cpp en tiempo de ejecucion.

La relevancia de esta ficha es acotada: se trata de un artefacto de empaquetado para hardware AMD, no de un modelo entrenado desde cero. La model card no incluye informacion sobre datos de entrenamiento, composicion del dataset ni resultados de benchmarks, y las mediciones de rendimiento y las puertas de validacion figuran como "not yet re-measured" en el momento de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el checkpoint base es un transformer de 27B; no se detalla en la informacion proporcionada) |
| Parametros totales | 27.000 millones (segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en F16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base) y paquete Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Proyector de vision | `mmproj-StartLux-Decision-v1.1-27B-AutoThink-F16.gguf` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151), AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) sobre ROCm |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base: no se detalla si emplea atencion completa, atencion lineal, mezcla de expertos o alguna variante hibrida, ni se especifican el numero de capas, la dimension oculta o la configuracion de cabezas de atencion. El nombre del checkpoint sugiere un modelo de 27.000 millones de parametros con capacidad de vision (pipeline `image-text-to-text` y un proyector multimodal separado en F16), pero no se aportan mas detalles estructurales.

Tampoco hay informacion sobre el proceso de entrenamiento: no se indica el volumen de tokens, la composicion del corpus, la existencia de fases de RLHF, DPO o ajuste por preferencias, ni el origen de los datos multimodales. El sufijo "AutoThink" y la presencia de un parametro `reasoning_effort` con niveles low, medium y xhigh apuntan a un ajuste orientado a razonamiento con esfuerzo variable, pero se desconoce como se entreno esa capacidad. La innovacion tecnica documentada no esta en el modelo sino en el empaquetado: `loom-next` genera kernels y programas `.loom` especificos para las arquitecturas AMD gfx1151 y gfx1201 a partir del GGUF, y `loom-serve` los ejecuta con un pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`). No se emplea decodificacion especulativa (marcada como no aplicable).

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Control del esfuerzo de razonamiento mediante `reasoning_effort` con valores low, medium y xhigh (por defecto xhigh).
- Entrada de imagenes en formato OpenAI (`image_url`), procesadas por el proyector `mmproj-StartLux-Decision-v1.1-27B-AutoThink-F16.gguf`.
- Tool calling y function calling con el esquema `tools` / `tool_calls` de OpenAI.
- Flujos de agente multi-turno con reutilizacion de historial, validados por la puerta `agent` y `agent_think_off` del paquete.
- Contexto de 262.144 tokens por peticion, adecuado para documentos largos y conversaciones extensas.
- Servicio concurrente de hasta 4 peticiones simultaneas con API compatible con OpenAI (`/v1/chat/completions`).
- Sin soporte de audio ni de decodificacion especulativa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente documental de contexto largo: con 262.144 tokens por peticion, el modelo puede ingerir contratos, informes o bases de codigo completas en una sola llamada y responder preguntas sobre ellos sin fragmentacion ni recuperacion externa.
- Analisis de documentos escaneados y capturas: la entrada de imagenes via `image_url` permite extraer informacion de facturas, diagramas o pantallazos y combinarla con texto en la misma conversacion.
- Agente de automatizacion con herramientas: el soporte de `tools` / `tool_calls` y la puerta `agent` lo hacen apto para bucles multi-paso que consultan APIs, bases de datos o sistemas internos y encadenan llamadas con historial reutilizado.
- Razonamiento profundo por lotes: con `reasoning_effort: xhigh` por defecto, encaja en tareas de analisis, revision de codigo o resolucion de problemas donde la latencia no es critica y prima la calidad de la cadena de razonamiento.
- Despliegue en estaciones de trabajo AMD: el paquete Loom permite servir el modelo en una Radeon AI PRO R9700 de 32 GB o en un Ryzen AI Max+ 395 sin salir del ecosistema ROCm, util para equipos que ya operan hardware AMD y quieren evitar dependencias de CUDA.
- Prototipado de asistentes multimodales en local: la API compatible con OpenAI facilita conectar el modelo a frameworks existentes (LangChain, LlamaIndex, clientes OpenAI) apuntando a `http://127.0.0.1:8080/v1` sin cambiar el codigo de la aplicacion.
- Evaluacion comparativa frente a llama.cpp: las puertas `golden`, `compare` y `vision` estan disenadas para verificar que la salida coincide token a token con la referencia de llama.cpp sobre el mismo GGUF, lo que sirve para validar la fidelidad del runtime Loom en una integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de validacion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es Q4_K_M de 27B, lo que situa los pesos en torno a 16-17 GB, mas el proyector de vision en F16 y las estructuras de contexto; la Radeon AI PRO R9700 objetivo tiene 32 GB.
- GPU objetivo declaradas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada).
- Compatibilidad con GPU de consumo: no confirmada. El paquete solo documenta las dos plataformas AMD citadas; no se mencionan RTX 4090, A100 ni H100.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto, aunque el GGUF base si es compatible con llama.cpp segun la referencia de validacion.
- Parametros de servicio recomendados: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `--pool_backing=fixed` (pool de memoria fijo) y `--parameter_mode=preload` (precarga de pesos en host).
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Tool calling | Licencia | Runtime documentado |
|---|---|---|---|---|---|---|
| StartLux-Decision-v1.1-27B-AutoThink (paquete Loom) | 27B | 262.144 | Si | Si | MIT | loom-serve sobre ROCm (gfx1151, gfx1201) |
| StartLux-Decision-v1.1-27B-AutoThink-GGUF (base) | 27B | no disponible | Si | no disponible | MIT | llama.cpp (referencia de validacion) |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, lo que impide estimar la calidad real del modelo frente a alternativas.
- Validacion pendiente: las once puertas de correccion del paquete figuran como "not yet re-measured", de modo que no esta verificado que la salida coincida con la referencia de llama.cpp ni que la concurrencia, el sampling o el bucle de agentes se comporten segun lo especificado.
- Rendimiento sin medir: no hay cifras de latencia ni de throughput para ninguna de las dos GPUs objetivo.
- Idiomas no declarados: se desconoce que lenguas cubre el modelo y con que calidad, lo que desaconseja asumir un rendimiento multilingue solido en produccion.
- Alcance de hardware muy restringido: el paquete esta generado especificamente para gfx1151 y gfx1201; no se documenta su funcionamiento en otras GPU AMD ni en NVIDIA.
- Limite de salida de 4.096 tokens por peticion, inferior a la ventana de contexto de 262.144 tokens, lo que puede truncar respuestas largas aunque la entrada sea extensa.
- Concurrencia maxima de 4 peticiones simultaneas, insuficiente para cargas de servicio de alta demanda sin replicacion adicional.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al no haber evaluaciones publicadas, no pueden acotarse.
- Licencia MIT: permite uso comercial y modificacion, pero el paquete no incluye garantias ni soporte; la responsabilidad de validar el comportamiento en produccion recae en el integrador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni de mantenimiento por parte de la comunidad.
- Confusion potencial de nombre: los resultados de busqueda web sobre "Loom" corresponden al software de grabacion de pantalla y a una marca de ropa, sin relacion con este paquete; el ecosistema real esta en GitHub (`ROCm/hrx-system`, `loom-fun/loom-next`).

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-draft/startlux-models-StartLux-Decision-v1.1-27B-AutoThink-loom
- Checkpoint GGUF base: https://huggingface.co/startlux-models/StartLux-Decision-v1.1-27B-AutoThink-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
