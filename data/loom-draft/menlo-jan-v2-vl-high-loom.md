# loom-draft/Menlo-Jan-v2-VL-high-loom

## Resumen

Menlo-Jan-v2-VL-high-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `Menlo/Jan-v2-VL-high-GGUF`, en su variante cuantizada `Jan-v2-VL-high-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta orientado especificamente a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado para el runtime Loom, generado con la herramienta `loom-next` y publicado bajo licencia Apache 2.0.

El modelo subyacente es multimodal de tipo image-text-to-text, con soporte de razonamiento (thinking) siempre activo, tool calling al estilo OpenAI y una ventana de contexto de 262.144 tokens por peticion. El paquete expone un servidor compatible con `/v1/chat/completions` y admite hasta 4 peticiones concurrentes, con un maximo de 4.096 tokens de salida por defecto. La relevancia actual es de nicho: permite ejecutar un VLM de contexto largo sobre GPU AMD consumer y de estacion de trabajo mediante un runtime alternativo a llama.cpp, sin depender de CUDA.

La informacion publicada es escasa en cuanto a arquitectura interna, datos de entrenamiento y benchmarks. La model card se centra en el proceso de despliegue, las caracteristicas del servidor y las puertas de validacion (`gates.sh`), y en el momento de la publicacion ninguna de esas puertas ni las mediciones de rendimiento frente a llama.cpp habian sido re-medidas para este paquete, por lo que no hay evidencia registrada de correccion ni de throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; detalles del transformer no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Jan-v2-VL-high-Q4_K_M.gguf`) mas proyector `mmproj-Jan-v2-VL-high.gguf`; empaquetado en programas `.loom` y `weights.loom` |
| Modelo base | Menlo/Jan-v2-VL-high-GGUF |
| Pipeline | image-text-to-text |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (`loom-fetch`, `loom-serve`) |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, posible mezcla de expertos, numero de capas o dimensiones ocultas) ni sobre el proceso de entrenamiento (volumen de tokens, composicion del dataset, etapas de RLHF o DPO). La model card del paquete Loom no incluye esos datos y se limita a describir el artefacto de despliegue.

Lo que si documenta la tarjeta es la innovacion a nivel de runtime: los programas `*.loom` y `weights.loom` se generan con `loom-next` a partir del GGUF original, sin LLM en el bucle de generacion, y se ejecutan sobre el backend AMD `amdgpu://`. El paquete fija el pool de memoria por adelantado (`--pool_backing=fixed`), precarga los pesos en host (`--parameter_mode=preload`) y permite espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). No hay decodificacion especulativa (marcada como no aplicable) ni ajuste de esfuerzo de razonamiento (el thinking esta siempre activo). La validacion se articula mediante puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`), pero ninguna tenia medicion registrada en el momento de la publicacion.

## Capacidades

- Generacion de texto y razonamiento con modo thinking siempre activo.
- Entrada de imagenes mediante partes `image_url` al estilo OpenAI, con proyector dedicado `mmproj-Jan-v2-VL-high.gguf`.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-turno con reutilizacion de historial y renderizado exacto de prompts (segun la puerta `agent`).
- Contexto largo de 262.144 tokens por peticion, adecuado para documentos extensos o historiales de conversacion prolongados.
- Servidor HTTP compatible con la API de chat completions de OpenAI, lo que facilita la integracion con clientes existentes.
- Concurrencia de hasta 4 peticiones simultaneas con consistencia de salida respecto a ejecuciones aisladas (segun la puerta `consistency`).
- Sin soporte de audio (entrada ni salida) y sin decodificacion especulativa.
- Capacidades multilingues: no disponibles en la informacion publicada.

## Casos de uso

- Analisis de documentos extensos con imagenes intercaladas: la ventana de 262.144 tokens permite enviar contratos, informes o manuales completos junto con capturas y diagramas en una sola peticion, sin trocear el contenido.
- Automatizacion de soporte tecnico sobre GPU AMD: el servidor OpenAI-compatible en `127.0.0.1:8080` se puede conectar a frameworks de agentes existentes sin adaptadores, y el tool calling permite consultar sistemas de tickets o bases de conocimiento.
- Procesamiento de capturas de pantalla y UI: con entrada de imagen y razonamiento activo, el modelo puede describir interfaces, extraer texto visible y proponer acciones, util para testing de accesibilidad o generacion de documentacion.
- Pipelines de agentes multi-paso en estaciones de trabajo con R9700: los 32 GB de la tarjeta permiten mantener el modelo y el proyector residentes mientras un bucle de tool calling resuelve tareas de recuperacion y sintesis.
- Prototipado en hardware consumer AMD: Strix Halo (gfx1151) permite ejecutar un VLM de contexto largo en un equipo integrado, util para demos locales y desarrollo sin dependencia de CUDA.
- Revision de imagenes medicas o tecnicas con contexto normativo: enviar la imagen junto con el protocolo completo en el mismo prompt y obtener un analisis que cite las secciones relevantes, apoyandose en el modo thinking para el razonamiento explicito.
- Extraccion estructurada de datos de facturas o formularios escaneados: combinacion de vision y tool calling para devolver JSON validado contra un esquema definido en `tools`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "not yet re-measured", y que ninguna de las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) tiene evidencia registrada para este paquete.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el paquete esta pensado para una GPU de 32 GB (Radeon AI PRO R9700) y para la memoria unificada del Ryzen AI Max+ 395 "Strix Halo". El tamano exacto del GGUF Q4_K_M no se publica en la informacion disponible.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se documenta soporte para GPU NVIDIA ni para otras GPU AMD.
- Cabe en GPU consumer: si, en el sentido de que Strix Halo es un SoC integrado con memoria unificada; no hay datos sobre GPUs de escritorio consumer como RX 7900 XTX.
- Opciones de despliegue: exclusivamente el runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` y `loom-serve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete, aunque el GGUF base es compatible con llama.cpp por origen.
- Latencia y throughput: no disponibles; las filas de rendimiento de la tarjeta no se han re-medido.
- Configuracion de servidor: `completion_spin_ns=4294967295` (espera activa), `--pool_backing=fixed` y `--parameter_mode=preload`; maximo 4 peticiones concurrentes y 4.096 tokens de salida por defecto.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion cuantitativa con alternativas de la misma categoria (otros VLM con contexto largo o empaquetados GGUF para AMD). Como referencia estructural, el unico punto de comparacion documentado es el propio checkpoint original `Menlo/Jan-v2-VL-high-GGUF`, del que este paquete es un empaquetado sin modificacion de pesos.

| Modelo | Parametros | Contexto | Licencia | Formato | Hardware objetivo |
|---|---|---|---|---|---|
| Menlo-Jan-v2-VL-high-loom | no disponible | 262.144 | Apache 2.0 | Loom + GGUF Q4_K_M | AMD gfx1151 / gfx1201 |
| Menlo/Jan-v2-VL-high-GGUF (base) | no disponible | no disponible | Apache 2.0 | GGUF | generico (llama.cpp) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evidencia de correccion: ninguna de las once puertas de validacion tiene medicion registrada para este paquete, por lo que no hay garantia documentada de que las salidas coincidan con la referencia de llama.cpp.
- Sin datos de rendimiento: no se han re-medido latencia ni throughput en ninguna de las dos GPU objetivo, lo que impide estimar costes de produccion.
- Sesgos conocidos: no disponibles; no se documenta la composicion del dataset de entrenamiento del modelo base.
- Riesgo de alucinacion: no cuantificado; el modo thinking esta siempre activo y no se puede desactivar ni modular mediante esfuerzo de razonamiento, lo que puede aumentar la latencia y la verbosidad.
- Limitaciones de idioma: no se especifican los idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `Menlo/Jan-v2-VL-high-GGUF` y de los pesos originales antes de desplegar en produccion.
- Dependencia de un runtime joven y especifico: requiere `hrx-loom==0.2.0` y el backend `amdgpu://`; no hay soporte documentado para otros motores de inferencia ni para GPU NVIDIA.
- Limite de 4 peticiones concurrentes y 4.096 tokens de salida por defecto: puede ser insuficiente para cargas de trabajo de alta concurrencia o generaciones largas sin ajustar el preset.
- Empaquetado generado automaticamente: el artefacto lo produce `loom-next` sin LLM en el bucle, y la tarjeta advierte de que las mediciones citadas usan configuraciones concretas (`completion_spin_ns`, `pool_backing`, `parameter_mode`) que alteran el comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-draft/Menlo-Jan-v2-VL-high-loom
- Modelo base GGUF: https://huggingface.co/Menlo/Jan-v2-VL-high-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
