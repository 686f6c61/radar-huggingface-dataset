# loom-draft/bartowski-beipo-ai_NorthCUA-Mini-loom

## Resumen

`loom-draft/bartowski-beipo-ai_NorthCUA-Mini-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `bartowski/beipo-ai_NorthCUA-Mini-GGUF`, en su cuantizacion Q4_K_M. No se trata de un modelo entrenado por el autor del repositorio, sino de un artefacto de empaquetado generado con la herramienta `loom-next` (sin LLM en el bucle) que traduce los pesos GGUF originales a programas ejecutables por el runtime `loom-serve` sobre GPUs AMD. El pipeline declarado es `image-text-to-text`, es decir, un modelo multimodal con entrada de imagen y texto.

El objetivo del paquete es ofrecer una ruta de inferencia nativa para hardware AMD concreto: el APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, modo de razonamiento siempre activo y entrada de imagen mediante el proyector `mmproj-beipo-ai_NorthCUA-Mini-bf16.gguf`. La ventana de contexto declarada es de 262.144 tokens por petición, con 4 peticiones concurrentes y un máximo de 4.096 tokens de salida por preset.

La relevancia del artefacto es fundamentalmente de infraestructura: demuestra el empaquetado y servicio de un modelo multimodal GGUF sobre ROCm/AMD sin depender de llama.cpp como motor de ejecución, manteniendo comparaciones de corrección contra llama.cpp como referencia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB declarado, lo que sugiere que los ficheros de pesos no estan alojados en este repositorio sino referenciados desde el GGUF base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; detalles de arquitectura no publicados en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` y `weights.loom`; tokenizer en `tokenizer.json` |
| Pipeline | image-text-to-text |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| Tool calling | si, estilo OpenAI (`tools` y `tool_calls`) |
| Modo razonamiento | si, siempre activo |
| Decodificacion especulativa | no aplicable |
| Entrada de audio | no soportada |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `beipo-ai_NorthCUA-Mini` en la documentacion proporcionada: no se detalla si es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de parametros, capas o dimensiones de atencion. Lo unico verificable es que se trata de un modelo multimodal con entrada de imagen y texto, cuyo procesamiento visual se realiza mediante un proyector separado en formato GGUF bf16 (`mmproj-beipo-ai_NorthCUA-Mini-bf16.gguf`), un patron habitual en modelos de la familia LLaVA o Qwen-VL.

Tampoco se documentan los datos de entrenamiento, el volumen de tokens, la composicion del corpus ni si hubo etapas de RLHF, DPO o ajuste por preferencias. El paquete Loom no modifica el checkpoint: el autor indica explicitamente que se trata del GGUF «unmodified» de bartowski, y que la generacion se hizo con `loom-next` como generador puro, sin LLM en el bucle. La innovacion tecnica del artefacto no esta en el modelo sino en el empaquetado: traduccion de los kernels a programas `.loom` ejecutables sobre ROCm, con un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra llama.cpp sobre el mismo GGUF. En la fecha de la ficha, ninguna de esas puertas tiene medicion registrada para este paquete.

## Capacidades

- Generacion de texto conversacional multi-turno con una ventana de contexto de 262.144 tokens por peticion.
- Entrada de imagen en formato OpenAI `image_url`, procesada por el proyector multimodal bf16; permite tareas de image-text-to-text (descripcion, VQA, extraccion de informacion de imagenes).
- Tool calling estilo OpenAI: acepta el parametro `tools` y devuelve `tool_calls` estructurados.
- Modo de razonamiento («thinking») siempre activo; el paquete declara que el «reasoning effort» no es configurable y no aplica.
- Bucles de agente multi-turno con reutilizacion de historial, validados por la puerta `agent` de loom-benchmark.
- Servicio concurrente de hasta 4 peticiones simultaneas con consistencia declarada entre ejecuciones concurrentes y aisladas (puerta `consistency`).
- API compatible con OpenAI en `/v1/chat/completions`, lo que facilita la integracion con clientes y SDK existentes.
- Sin soporte de audio ni de salida de audio.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional con contexto largo: la ventana de 262.144 tokens permite mantener conversaciones o analizar documentos extensos sin truncar, util en atencion al cliente o analisis de contratos donde el historial completo debe permanecer en contexto.
- Analisis de documentos con imagenes: al aceptar `image_url`, el modelo puede recibir capturas, escaneos o diagramas junto con texto y responder preguntas sobre ellos, por ejemplo en digitalizacion de facturas o revision de interfaces.
- Agente con tool calling sobre infraestructura propia: el soporte de `tools`/`tool_calls` y la puerta `agent` permiten construir agentes que consulten APIs internas, bases de datos o sistemas de ticketing en bucles multi-paso.
- Despliegue en hardware AMD de sobremesa o workstation: el paquete esta pensado para Strix Halo y Radeon AI PRO R9700, por lo que encaja en estaciones de trabajo con ROCm sin GPU NVIDIA, por ejemplo para prototipado interno o laboratorios de investigacion.
- Sustitucion de llama.cpp en pipelines existentes: al mantener compatibilidad de API OpenAI y comparar contra llama.cpp como referencia, permite migrar un servicio ya existente a `loom-serve` conservando los clientes.
- Evaluacion de la cadena de herramientas Loom: el paquete sirve como banco de pruebas para validar `loom-fetch`/`loom-serve`, las puertas de correccion y el rendimiento frente a llama.cpp en GPUs AMD concretas.
- Razonamiento siempre activo para tareas de analisis: el modo thinking permanente es adecuado para tareas donde la latencia no es critica y se prioriza la calidad del razonamiento, como clasificacion compleja o sintesis de informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambos casos indica literalmente que «the results for this package are not yet re-measured». Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured» para ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es Q4_K_M, pero no se publica el numero de parametros, por lo que no se puede calcular la huella de pesos. El proyector multimodal es bf16 y su tamano tampoco se detalla.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- Compatibilidad con GPU de consumo: no confirmada. El paquete solo lista las dos plataformas AMD anteriores; no se mencionan RTX 4090, A100, H100 ni otras GPU NVIDIA.
- Despliegue: runtime `hrx-loom[hf]==0.2.0` instalado via `pipx`; descarga con `loom-fetch` y servicio con `loom-serve`. Opciones recomendadas en la model card: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.
- Alternativas de despliegue: llama.cpp se usa como referencia de correccion y comparacion de rendimiento, pero el paquete esta disenado para `loom-serve`; no se documenta soporte para vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles; las mediciones no se han reejecutado para este paquete.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de parametros, contexto o rendimiento de modelos comparables de la misma categoria, y el modelo base `beipo-ai_NorthCUA-Mini` no aparece documentado con especificaciones que permitan una comparacion rigurosa. La unica comparacion presente en la model card es frente a llama.cpp como motor de inferencia sobre el mismo GGUF, no frente a otros modelos.

## Limitaciones y advertencias

- Ausencia total de mediciones: todas las puertas de correccion y las tablas de rendimiento figuran como «not yet re-measured», por lo que no hay evidencia publicada de que la salida coincida con llama.cpp ni de cual es el rendimiento real en las GPU objetivo.
- Repositorio sin traccion: 0 descargas y 0 likes en la fecha de consulta, y tamano declarado de 0.0 GB, lo que indica que los pesos no se alojan aqui y que el paquete no ha sido validado por la comunidad.
- Dependencia de la cadena Loom: requiere `hrx-loom[hf]==0.2.0` y el runtime `loom-serve`; no es un artefacto portable a otros motores sin conversion adicional.
- Hardware restringido: solo se declaran dos plataformas AMD (gfx1151 y gfx1201); no hay garantia de funcionamiento en otras GPU AMD ni en NVIDIA.
- Contexto y salida: aunque la ventana es de 262.144 tokens, la salida maxima por preset es de 4.096 tokens, lo que limita respuestas muy largas.
- Concurrencia limitada a 4 peticiones simultaneas, insuficiente para cargas de produccion de alto trafico sin replicacion.
- Modo de razonamiento siempre activo y no configurable: incrementa el consumo de tokens y la latencia en tareas que no lo requieren.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otros idiomas distintos del que se uso en el entrenamiento del modelo base.
- Sesgos y alucinacion: no hay informacion publicada sobre evaluaciones de sesgo, toxicidad o tasas de alucinacion del modelo base.
- Licencia Apache 2.0 declarada en el paquete, pero conviene verificar la licencia del checkpoint base `bartowski/beipo-ai_NorthCUA-Mini-GGUF` antes de uso comercial, ya que el paquete no la sustituye.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-beipo-ai_NorthCUA-Mini-loom
- Checkpoint GGUF base: https://huggingface.co/bartowski/beipo-ai_NorthCUA-Mini-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
