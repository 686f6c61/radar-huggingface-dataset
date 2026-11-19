# loom-draft/mradermacher-Qwen3.5-9B-DeepThought-STEM-loom

## Resumen

`loom-draft/mradermacher-Qwen3.5-9B-DeepThought-STEM-loom` es un paquete de despliegue en formato Loom para el checkpoint GGUF `Qwen3.5-9B-DeepThought-STEM` (cuantizacion Q4_K_M) del autor mradermacher. No se trata de un modelo nuevo: es un artefacto de empaquetado generado con la herramienta `loom-next` que contiene programas `.loom` y una tarjeta `model.json`, pensado para ejecutar el modelo sobre las GPU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente es un Qwen3.5 de 9B con fine-tuning orientado a STEM («DeepThought-STEM») y capacidad de vision mediante un proyector multimodal `mmproj-f16.gguf`.

La relevancia de este paquete es de infraestructura, no de investigacion: ofrece una via de servicio con API compatible con OpenAI (`/v1/chat/completions`), tool calling, modo de razonamiento activable, decodificacion especulativa MTP (Multi-Token Prediction) con profundidad 3 y entrada de imagenes, todo sobre el stack ROCm de AMD. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB, lo que sugiere que los pesos no estan alojados en este repositorio sino que se obtienen via `loom-fetch` desde el checkpoint base.

Conviene subrayar que el autor del paquete declara explicitamente que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) aun no se han vuelto a medir para este paquete en ninguna de las dos GPU objetivo. Por tanto, no hay datos verificados de rendimiento publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5) con modulo de vision; decodificacion especulativa MTP integrada en el runtime Loom |
| Parametros totales | 9B (segun el nombre del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en f16 (`mmproj-f16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado en contenedor Loom (`.loom` + `model.json`) |
| Pipeline | image-text-to-text |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| Modelo base | `mradermacher/Qwen3.5-9B-DeepThought-STEM-GGUF` |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo subyacente: no se detallan el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO o alguna fase de alineamiento. Lo unico deducible del nombre y de la model card es que se trata de un Qwen3.5 de 9B con un fine-tuning denominado «DeepThought-STEM», presumiblemente orientado a dominios cientificos, tecnologicos, de ingenieria y matematicas, aunque el autor del paquete no documenta la receta de entrenamiento ni los datos utilizados.

La innovacion tecnica relevante esta en la capa de despliegue. Loom genera kernels especificos para las arquitecturas AMD objetivo y los expone mediante `loom-serve`, que implementa decodificacion especulativa basada en MTP con profundidad 3, activada por defecto. El paquete incluye ademas un proyector multimodal f16 para entrada de imagenes y parametros de ejecucion como `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU, consumiendo CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` (reserva del pool de memoria por adelantado) y `--parameter_mode=preload` (carga anticipada de pesos en host). Las puertas de correccion comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF, pero no hay resultados publicados para este paquete.

## Capacidades

- Generacion de texto y razonamiento con modo «thinking» activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagenes en formato OpenAI (`image_url` parts) mediante el proyector `Qwen3.5-9B-DeepThought-STEM.mmproj-f16.gguf`.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-turno con reutilizacion de historial y renderizado exacto del prompt (segun la puerta `agent` definida, aunque sin medicion publicada).
- Decodificacion especulativa MTP con profundidad 3, activada por defecto, con la garantia declarada de que la salida coincide exactamente con la de especulacion desactivada.
- Servicio concurrente de hasta 4 peticiones simultaneas con contexto de 262.144 tokens por peticion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Audio: no soportado.
- Ajuste de esfuerzo de razonamiento: no aplicable segun la model card.

## Casos de uso

- Asistencia tecnica especializada en dominios STEM: el fine-tuning «DeepThought-STEM» y el modo de razonamiento activado por defecto permiten abordar preguntas de matematicas, fisica o ingenieria con cadenas de razonamiento explicitas, utiles en herramientas internas de soporte a ingenieros.
- Analisis de documentacion tecnica con imagenes: gracias al proyector multimodal, el modelo puede recibir capturas de diagramas, esquemas de circuitos o graficos y responder preguntas sobre ellos a traves del endpoint compatible con OpenAI.
- Agentes de automatizacion con tool calling: el soporte de `tools` y `tool_calls` en formato OpenAI permite integrar el modelo en orquestadores de agentes que necesiten invocar APIs externas, consultar bases de datos o ejecutar calculos en bucles multi-turno.
- Despliegue en estaciones de trabajo AMD sin GPU NVIDIA: el paquete esta optimizado para Strix Halo y Radeon AI PRO R9700, lo que permite servir un modelo de 9B con vision y contexto largo en hardware AMD integrado o de gama profesional, evitando la dependencia de CUDA.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por peticion, es adecuado para resumir o extraer informacion de manuales tecnicos, articulos cientificos o expedientes extensos en una sola pasada.
- Generacion de codigo asistida en entornos con requisitos de soberania de hardware: al ejecutarse sobre ROCm y con licencia Apache 2.0, encaja en organizaciones que necesitan inferencia local en equipos AMD con trazabilidad de licencia permisiva.
- Prototipado de asistentes multimodales: la combinacion de vision, razonamiento y API compatible con OpenAI permite construir demos de asistentes que alternan texto e imagenes sin reescribir clientes existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que tanto las mediciones de rendimiento frente a llama.cpp como las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) no se han vuelto a medir para este paquete en Strix Halo (gfx1151) ni en Radeon AI PRO R9700 (gfx1201). No se dispone de cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput verificados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 9B, y el hardware objetivo declarado incluye una GPU de 32 GB (Radeon AI PRO R9700) y el SoC Strix Halo con memoria unificada.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151). No se mencionan GPU NVIDIA ni otras arquitecturas AMD como soportadas por este paquete.
- Cabe en GPU de consumo: no disponible; el paquete esta dirigido a hardware AMD especifico y no se documenta compatibilidad con GPUs de consumo convencionales.
- Opciones de despliegue: `loom-fetch` para obtener el paquete y `loom-serve` para servirlo, con `pipx install "hrx-loom[hf]==0.2.0"`. El paquete esta construido sobre el GGUF de llama.cpp, pero el runtime documentado es Loom, no llama.cpp directamente.
- Parametros de ejecucion relevantes: `completion_spin_ns=4294967295` (espera activa), `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|---|
| `loom-draft/mradermacher-Qwen3.5-9B-DeepThought-STEM-loom` | 9B | 262.144 | Si | Apache 2.0 | Loom (GGUF Q4_K_M) | Paquete optimizado para AMD Strix Halo y R9700; sin benchmarks publicados |
| `mradermacher/Qwen3.5-9B-DeepThought-STEM-GGUF` | 9B | no disponible | Si (proyector aparte) | Apache 2.0 (heredada) | GGUF | Checkpoint base sin empaquetar; ejecutable con llama.cpp y derivados |
| Qwen3.5-9B base (upstream) | 9B | no disponible en la informacion | no disponible | no disponible en la informacion | safetensors / GGUF | Modelo original sin el fine-tuning STEM; no se dispone de datos comparativos verificados |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas de la misma categoria, ya que no hay benchmarks publicados para este paquete ni datos de referencia en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de puertas de correccion verificadas para este paquete: el autor indica que no se han vuelto a medir en ninguna de las GPU objetivo, por lo que la calidad de la salida y el rendimiento real no estan validados.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0,0 GB; los pesos se obtienen desde el checkpoint base mediante `loom-fetch`, lo que introduce una dependencia externa en el flujo de despliegue.
- Compatibilidad de hardware muy restringida: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay garantia de funcionamiento en otras GPU AMD ni en NVIDIA.
- El modo de razonamiento esta activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva explicitamente con `enable_thinking: false`.
- El limite de salida es de 4.096 tokens por peticion (preset `max_tokens`), lo que puede ser insuficiente para tareas de generacion larga pese al contexto de 262.144 tokens.
- La concurrencia esta limitada a 4 peticiones simultaneas, lo que restringe el uso en produccion con alta carga.
- No se documentan los idiomas soportados ni los sesgos conocidos del fine-tuning STEM; se desconoce el comportamiento fuera de dominios cientificos y tecnicos.
- Riesgo de alucinacion inherente a los modelos de 9B, agravado por la falta de validacion publicada en este paquete concreto.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del checkpoint base y no se documentan restricciones adicionales del fine-tuning; conviene verificar la licencia del modelo upstream Qwen3.5.
- El uso de `completion_spin_ns=4294967295` implica espera activa en CPU durante el trabajo de GPU, lo que puede degradar el rendimiento de otros procesos en el mismo equipo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/mradermacher-Qwen3.5-9B-DeepThought-STEM-loom
- Checkpoint base GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-DeepThought-STEM-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
