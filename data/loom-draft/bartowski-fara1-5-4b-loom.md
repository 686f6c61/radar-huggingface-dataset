# loom-draft/bartowski-Fara1.5-4B-loom

## Resumen

Fara1.5-4B-loom es un paquete de despliegue en formato Loom generado a partir del checkpoint GGUF `bartowski/Fara1.5-4B-GGUF` (concretamente la cuantizacion `Fara1.5-4B-Q4_K_M.gguf`), sin modificar los pesos. Lo publica el usuario `loom-draft` y esta pensado para ejecutarse sobre las GPU integradas AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el runtime `loom-serve` del ecosistema Loom. No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado (programas `.loom`, `model.json`, tokenizer y configuracion) que permite servir el modelo base con una API compatible con OpenAI.

El modelo subyacente, Fara1.5-4B, es un modelo multimodal de tipo image-text-to-text con aproximadamente 4.000 millones de parametros, capacidad de razonamiento (modo thinking activado por defecto) y una ventana de contexto declarada de 262.144 tokens por peticion. El paquete anade soporte de tool calling estilo OpenAI, entrada de imagen mediante el proyector `mmproj-Fara1.5-4B-bf16.gguf` y hasta 4 peticiones concurrentes.

Su relevancia es acotada pero concreta: demuestra la viabilidad de ejecutar un modelo multimodal de 4B con contexto muy largo sobre hardware AMD consumer y de estacion de trabajo (Strix Halo y R9700) usando un stack alternativo a llama.cpp, con verificaciones de correctitud definidas (aunque aun no re-medidas para este paquete). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los artefactos no estan materializados o el repo esta vacio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Fara1.5-4B; el paquete Loom no documenta la arquitectura interna) |
| Parametros totales | ~4B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en bf16 (`mmproj-Fara1.5-4B-bf16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado como programas `.loom` + `weights.loom`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Fara1.5-4B en la documentacion proporcionada: no se detalla si es un transformer denso, MoE o hibrido, ni el numero de capas, dimensiones ocultas o mecanismo de atencion. El paquete Loom unicamente declara que se trata de un modelo multimodal image-text-to-text con un proyector de vision separado en formato GGUF bf16, y que soporta un modo de razonamiento (thinking) activable o desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.

Tampoco se documentan los datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF/DPO) ni innovaciones tecnicas del modelo base. Lo que si describe el paquete es la infraestructura de ejecucion: `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) a partir del GGUF sin intervencion de un LLM en el bucle, y `loom-serve` expone una API compatible con OpenAI. El paquete incluye opciones de despliegue como `--pool_backing=fixed` (reserva fija del pool de memoria), `--parameter_mode=preload` (carga anticipada de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizacion en GPU).

## Capacidades

- Generacion de texto conversacional multi-turno mediante API `/v1/chat/completions` compatible con OpenAI.
- Razonamiento explicito (modo thinking) activado por defecto, desactivable por peticion.
- Entrada de imagen (image-text-to-text) mediante partes `image_url` estilo OpenAI, con proyector de vision dedicado.
- Tool calling / function calling estilo OpenAI (`tools` y `tool_calls`), incluyendo bucles de agente multi-turno con reutilizacion de historial.
- Contexto largo de hasta 262.144 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por respuesta (preset `max_tokens`).
- Capacidades multilingues: no disponibles en la documentacion.
- Audio de entrada/salida: no soportado.
- Decodificacion especulativa: no aplicable en este paquete.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.

## Casos de uso

- Procesamiento de documentos extensos en local: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes o bases de codigo completas en una sola peticion y responder preguntas sobre ellos sin fragmentacion, todo sobre una GPU R9700 de 32 GB.
- Analisis de imagenes en flujos de trabajo internos: la entrada `image_url` permite enviar capturas, diagramas o documentos escaneados y obtener descripciones o extraccion de informacion, adecuado para entornos con requisitos de privacidad donde no se quiere enviar datos a la nube.
- Agentes con herramientas en produccion interna: el soporte de `tools`/`tool_calls` y los bucles multi-turno con historial permiten construir asistentes que consultan APIs internas, bases de datos o sistemas de tickets, con el modo thinking activo para planificacion.
- Asistente de codigo sobre hardware AMD: integrable en editores o pipelines locales mediante la API OpenAI-compatible, aprovechando el contexto largo para analizar repositorios completos y el tool calling para ejecutar comandos o consultar documentacion.
- Despliegue en estaciones de trabajo con Strix Halo: el paquete esta optimizado para el Ryzen AI Max+ 395, lo que permite servir el modelo en un equipo compacto sin GPU dedicada, util para prototipado y demos en ferias o entornos de desarrollo.
- Evaluacion de stacks alternativos a llama.cpp: las puertas de correctitud (`golden`, `compare`, `vision`, `agent`, `consistency`) permiten comparar la salida del runtime Loom con la referencia de llama.cpp token a token, lo que resulta util para equipos que evaluan migrar su infraestructura de inferencia.
- Chatbot de atencion al cliente autoalojado: con 4 peticiones concurrentes y contexto largo, puede gestionar conversaciones con historial extenso y consultar herramientas internas (pedidos, estado de cuenta) sin salir del perimetro de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que tanto las mediciones de rendimiento frente a llama.cpp como las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201). No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de ~4B parametros, lo que tipicamente ocupa en torno a 2,5-3 GB para los pesos, mas el proyector de vision bf16 y el pool de memoria del runtime (no se publican cifras exactas en la documentacion).
- GPU soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer NVIDIA o AMD de gama domestica; el paquete esta dirigido a las dos plataformas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete concreto (llama.cpp se usa solo como referencia de correctitud).
- Latencia y throughput: no disponibles; las mediciones frente a llama.cpp no se han re-realizado para este paquete.
- Concurrencia maxima soportada: 4 peticiones simultaneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Fara1.5-4B-loom (este paquete) | ~4B | 262.144 tokens | Si (imagen) | MIT | GGUF empaquetado en Loom; solo AMD Strix Halo y R9700 |
| bartowski/Fara1.5-4B-GGUF (modelo base) | ~4B | no disponible en la informacion | Si (imagen) | MIT | GGUF; ejecutable con llama.cpp y derivados |
| Alternativas de ~4B multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el propio checkpoint base del que deriva el paquete. No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio muestra 0 descargas, 0 likes y un tamano de 0.0 GB; es posible que los artefactos no esten disponibles o que el paquete sea un borrador sin materializar.
- Las puertas de correctitud y las mediciones de rendimiento figuran como "not yet re-measured" en ambas plataformas: no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- El soporte de hardware esta limitado a AMD Ryzen AI Max+ 395 (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documenta funcionamiento en otras GPU.
- El paquete depende de una version concreta del runtime (`hrx-loom[hf]==0.2.0`); cambios de version pueden alterar el comportamiento.
- Sin datos publicados sobre sesgos, tasas de alucinacion ni comportamiento multilingue del modelo base.
- La licencia MIT del paquete aplica al empaquetado; conviene verificar la licencia del checkpoint base Fara1.5-4B antes de un uso comercial, ya que la model card no detalla las condiciones del modelo original.
- La salida maxima esta limitada a 4.096 tokens por respuesta, lo que puede ser insuficiente para tareas de generacion larga pese al contexto de 262.144 tokens.
- Solo 4 peticiones concurrentes: no apto para cargas de alta concurrencia sin escalado horizontal.
- El modo thinking esta activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explicitamente.
- El modo de espera activa (`completion_spin_ns=4294967295`) consume CPU mientras hay trabajo en GPU, lo que puede afectar a otros procesos del sistema.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-Fara1.5-4B-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/Fara1.5-4B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
