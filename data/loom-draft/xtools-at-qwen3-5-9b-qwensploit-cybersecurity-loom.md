# loom-draft/xtools-at-Qwen3.5-9B-Qwensploit-CyberSecurity-loom

## Resumen

El modelo `loom-draft/xtools-at-Qwen3.5-9B-Qwensploit-CyberSecurity-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity-GGUF`, concretamente el fichero `Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic.Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta orientado a dos aceleradores AMD: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con la herramienta `loom-next`, sin intervencion de un LLM en el bucle de generacion.

El modelo subyacente es un Qwen3.5 de 9B parametros, con capacidades multimodales (entrada de imagen y texto, pipeline `image-text-to-text`) y un ajuste fino orientado a ciberseguridad, con un merge de tres variantes y modificaciones de tipo "uncensored/heretic" segun el nombre del fichero. El paquete Loom anade una capa de servicio compatible con la API de OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento activado por defecto y una ventana de contexto declarada de 262.144 tokens por peticion.

La relevancia de esta ficha es doble: por un lado, documenta una via de despliegue nativa en hardware AMD (ROCm) de un modelo de 9B cuantizado en Q4_K_M; por otro, advierte de que se trata de un artefacto de borrador (`loom-draft`) con cero descargas y cero likes en el momento de la consulta, sin resultados de rendimiento ni de correccion re-medidos, y con un modelo base cuyo origen y metodos de entrenamiento no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5); detalles de capas y atencion no disponibles |
| Parametros totales | 9B (segun el nombre del modelo; cifra exacta no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion (segun la model card del paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en BF16 (`...BF16-mmproj.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) y paquete Loom (`.loom` + `model.json`) |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | Estilo OpenAI `/v1/chat/completions` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. El identificador `Qwen3.5-9B` sugiere una familia Qwen3.5 de 9.000 millones de parametros, y el pipeline `image-text-to-text` junto con el proyector multimodal `Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic.BF16-mmproj.gguf` confirman que el checkpoint incluye capacidad de entrada de imagen ademas de texto. El nombre del fichero (`Claude-3xMerge-UNCENSORED-heretic`) indica un merge de tres variantes y un ajuste orientado a eliminar restricciones de rechazo, pero no se dispone de la composicion del dataset, el numero de tokens de entrenamiento ni si hubo RLHF, DPO u otras etapas de alineamiento.

El paquete Loom en si no modifica los pesos: es un artefacto de despliegue generado por `loom-next` que produce kernels y programas para ejecutar el GGUF original en GPUs AMD mediante ROCm. La model card describe comprobaciones de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) frente a una referencia de llama.cpp sobre el mismo GGUF, pero todas ellas figuran como "not yet re-measured" para ambas plataformas. No se documentan innovaciones de decodificacion especulativa (marcada como "not applicable") ni de atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Entrada de imagen junto con texto (image-text-to-text) usando el proyector multimodal BF16 incluido.
- Tool calling en estilo OpenAI (`tools` y `tool_calls`), con bucles de agente multi-paso segun las comprobaciones descritas en la model card.
- Modo de razonamiento ("thinking") activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Ventana de contexto de 262.144 tokens por peticion, adecuada para documentos largos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Audio de entrada o salida: no soportado segun la tabla de features.
- Ajuste fino declarado orientado a ciberseguridad y a eliminar rechazos ("uncensored/heretic"), sin documentacion de los datos usados.

## Casos de uso

- Analisis de documentos tecnicos de seguridad: el modelo puede procesar informes, RFCs o volcados de configuracion de hasta 262.144 tokens en una sola peticion, lo que permite correlacionar hallazgos de multiples fuentes sin trocear el contexto.
- Asistencia en triaje de alertas SOC: con tool calling puede consultar APIs internas (por ejemplo, un SIEM) y encadenar varias llamadas en un bucle de agente para enriquecer un evento antes de resumirlo al analista.
- Revision de capturas de pantalla y diagramas de red: la entrada de imagen permite adjuntar capturas de paneles de administracion o diagramas y pedir al modelo que describa configuraciones o detecte exposiciones evidentes.
- Generacion de scripts de automatizacion defensiva: en un pipeline de CI/CD o de gestion de configuracion, el modelo puede redactar y revisar scripts de hardening o reglas de deteccion, con validacion humana posterior.
- Despliegue en estaciones de trabajo AMD sin GPU dedicada: al ejecutarse sobre Strix Halo (APU con memoria unificada) o Radeon AI PRO R9700, permite montar un asistente local en entornos donde no se quiere enviar datos a la nube.
- Laboratorios de formacion y CTFs: el ajuste "uncensored" y el enfoque en ciberseguridad lo hacen util para generar explicaciones tecnicas de tecnicas de ataque y defensa en entornos controlados, siempre con supervision.
- Prototipado de agentes con razonamiento explicito: el modo thinking activado por defecto facilita depurar cadenas de razonamiento en tareas de analisis, y puede desactivarse para reducir latencia en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion figuran como "not yet re-measured". No se dispone de cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; un GGUF Q4_K_M de 9B suele ocupar del orden de 5-6 GB para los pesos, mas el proyector multimodal BF16, pero la cifra exacta no se documenta.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no confirmada; el paquete esta generado especificamente para las dos plataformas AMD citadas y no se mencionan RTX 4090, A100 ni H100.
- Opciones de despliegue: `loom-serve` con `hrx-loom[hf]==0.2.0` (instalacion via `pipx`), usando `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. El checkpoint base tambien puede servirse con llama.cpp, ya que la correccion se valida contra esa referencia.
- Parametros de servicio relevantes: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, usada en las mediciones de la tarjeta).
- Latencia y throughput: no disponibles (mediciones no re-medidas).
- Concurrencia soportada: 4 peticiones simultaneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `loom-draft/xtools-at-Qwen3.5-9B-Qwensploit-CyberSecurity-loom` | 9B | 262.144 tokens | Apache 2.0 | GGUF Q4_K_M + paquete Loom | Paquete de borrador para AMD Strix Halo y R9700; sin benchmarks ni correccion re-medida |
| `xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity-GGUF` | 9B | no disponible | no disponible | GGUF | Modelo base sin empaquetar; es el mismo checkpoint que usa el paquete Loom |
| Otros modelos Qwen3.5 de 9B | 9B | no disponible | no disponible | safetensors / GGUF | No se dispone de datos verificados en la informacion proporcionada |
| Modelos de 7-9B orientados a ciberseguridad | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas verificadas en la informacion proporcionada |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Artefacto de borrador: el autor es `loom-draft`, con 0 descargas y 0 likes en el momento de la consulta; no debe tratarse como una publicacion estable.
- Sin mediciones de rendimiento ni de correccion: todas las puertas (`golden`, `compare`, `vision`, `agent`, `sampling`, `logits`, etc.) figuran como "not yet re-measured" para ambas plataformas.
- Modelo base con ajuste "uncensored/heretic": el nombre del fichero sugiere un entrenamiento para reducir rechazos, lo que incrementa el riesgo de generar contenido danino o inexacto en dominios sensibles; requiere filtros y supervision en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de 9B y un merge de tres variantes, cabe esperar un comportamiento variable segun la tarea.
- Idiomas soportados no documentados: no se puede garantizar calidad fuera del ingles sin evaluacion propia.
- Licencia Apache 2.0 declarada, pero el modelo base y los datos de entrenamiento no estan documentados; conviene verificar la procedencia antes de un uso comercial.
- Contexto de 262.144 tokens declarado por el paquete, sin verificacion publicada de que el modelo base mantenga calidad a esa longitud.
- Dependencia de hardware AMD especifico (gfx1151 y gfx1201): el paquete Loom no esta pensado para otras GPU sin regeneracion.
- El contenido de la model card se ha tratado como datos de referencia; no debe interpretarse como instrucciones de ejecucion.

## Enlaces

- Paquete Loom en Hugging Face: https://huggingface.co/loom-draft/xtools-at-Qwen3.5-9B-Qwensploit-CyberSecurity-loom
- Modelo base GGUF: https://huggingface.co/xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity-GGUF
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
