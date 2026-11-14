# loom-fun-staging/unsloth-Qwen3.5-0.8B-loom

## Resumen

El modelo `loom-fun-staging/unsloth-Qwen3.5-0.8B-loom` es un paquete de despliegue para el runtime AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF `Qwen3.5-0.8B-Q4_K_M.gguf` de Unsloth (derivado de la familia Qwen3.5) junto con programas `.loom` y una tarjeta `model.json`, generados con el flujo de trabajo `loom-skills`. Su proposito es ejecutar inference multimodal (texto e imagen) sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el servidor `loom-serve`, que expone una API compatible con OpenAI.

El modelo subyacente es un transformer de 0,8 mil millones de parametros con capacidad de vision (pipeline `image-text-to-text`), cuantizado en Q4_K_M y con una ventana de contexto declarada de 262.144 tokens por peticion. El paquete anade soporte para tool calling, modo de razonamiento opcional (`enable_thinking`), entrada de imagenes a traves de un proyector `mmproj-F16.gguf` y concurrencia de 4 peticiones simultaneas.

Su relevancia es practica: demuestra la viabilidad de servir modelos pequenos multimodales en hardware AMD consumer y de estacion de trabajo con el stack ROCm, ofreciendo una alternativa a llama.cpp con mediciones de roofline publicadas. La informacion disponible sobre el modelo base (licencia, idiomas, datos de entrenamiento) es escasa, y el paquete no incluye benchmarks de calidad ni resultados de las puertas de correccion en esta compilacion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5); multimodal con proyector de vision `mmproj-F16.gguf` |
| Parametros totales | 0,8 mil millones (segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); proyector de vision en F16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Qwen3.5-0.8B-Q4_K_M.gguf); paquete `.loom` + `model.json` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Memoria configurada | `--memory_bytes=9000000000` (9 GB) |

## Arquitectura y entrenamiento

El paquete no documenta el entrenamiento del modelo base; se limita a redistribuir el checkpoint GGUF de Unsloth sin modificarlo. Por la denominacion y el pipeline `image-text-to-text`, se trata de un transformer denso de la familia Qwen3.5 con un codificador/proyector de vision acoplado que se sirve como fichero separado (`mmproj-F16.gguf`), un patron habitual en el ecosistema GGUF para modelos multimodales. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica del paquete reside en el runtime Loom: kernels generados especificamente para las arquitecturas gfx1151 y gfx1201, servidor con API compatible con OpenAI, soporte de tool calling con renderizado exacto de plantillas, modo de razonamiento activable por peticion y verificacion mediante puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `agent`) que comparan la salida token a token contra una referencia de llama.cpp. La decodificacion especulativa no esta disponible porque el GGUF no incluye cabeza MTP ni hay drafter publicado para este modelo exacto.

## Capacidades

- Generacion de texto y razonamiento: modo "thinking" desactivado por defecto, activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Entrada de imagenes: soporta partes `image_url` al estilo OpenAI mediante el proyector `mmproj-F16.gguf`.
- Tool calling: compatible con `tools` y `tool_calls` al estilo OpenAI; validado por la puerta `agent` en compilaciones previas.
- Agentes multi-turno: la puerta `agent` verifica el renderizado exacto de prompts, la reutilizacion de historial y la validez de las llamadas a herramientas.
- Multilingue: no disponible (no se declaran idiomas).
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia: hasta 4 peticiones simultaneas con consistencia verificada frente a ejecuciones aisladas.
- Sin soporte de audio (entrada ni salida) ni de decodificacion especulativa.

## Casos de uso

- Asistente local de vision para documentacion tecnica: el modelo puede recibir capturas de pantalla o diagramas via `image_url` y devolver descripciones o extracciones de texto, aprovechando el proyector F16 y la ventana de 262k tokens para adjuntar varias imagenes y contexto extenso en una sola peticion.
- Automatizacion de soporte en estaciones de trabajo AMD: con `loom-serve` escuchando en `127.0.0.1:8080` y API compatible con OpenAI, se puede conectar un cliente existente sin cambios y atender hasta 4 conversaciones concurrentes en una Radeon AI PRO R9700.
- Agente de herramientas en pipelines internos: el soporte de `tools`/`tool_calls` y la puerta `agent` permiten construir bucles multi-paso (consulta a APIs, ejecucion de comandos, resumen) con historial reutilizado y renderizado determinista de plantillas.
- Procesamiento de documentos largos en local: con 262.144 tokens de contexto y un prefill medido en roofline de hasta 57.804 tok/s en Strix Halo para documentos de 1k tokens, es adecuado para resumir o extraer datos de expedientes extensos sin salir del equipo.
- Prototipado de aplicaciones multimodales sobre ROCm: sirve como banco de pruebas para validar kernels y el stack Loom antes de escalar a modelos mayores, gracias a las puertas de correccion contra llama.cpp.
- Razonamiento con coste controlado en produccion: al ser un modelo de 0,8B en Q4_K_M, el consumo de memoria es bajo (9 GB configurados) y permite activar `enable_thinking` solo en peticiones que lo requieran, reduciendo latencia en el resto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye mediciones de rendimiento del runtime frente a la roofline del hardware, y las columnas de llama.cpp y Loom estan sin medir en esta compilacion.

| Metrica (Strix Halo, gfx1151) | Roofline | Loom | llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 414,1 | no medido | no medido |
| Decode tok/s, contexto 2k | 395,5 | no medido | no medido |
| Decode tok/s, contexto 32k | 236,1 | no medido | no medido |
| Prefill tok/s, documento 1k | 57.804,0 | no medido | no medido |
| Prefill tok/s, documento 2k | 56.444,9 | no medido | no medido |
| Prefill tok/s, documento 8k | 49.466,7 | no medido | no medido |
| Prefill tok/s, documento 16k | 42.466,5 | no medido | no medido |
| Prefill tok/s, documento 32k | 33.098,7 | no medido | no medido |
| 4 streams, decode agregado tok/s | 1.567,9 | no medido | no medido |
| Decodificacion especulativa | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados "no se han vuelto a medir" segun la model card. La roofline se calcula para Strix Halo a 216 GB/s de ancho de banda y 59 TFLOP/s.

## Requisitos de hardware

- VRAM estimada: el paquete se sirve con `--memory_bytes=9000000000` (9 GB), lo que cubre pesos Q4_K_M, proyector F16 y buffers de contexto.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPUs consumer AMD (Radeon RX) ni con NVIDIA; el paquete esta generado especificamente para gfx1151 y gfx1201.
- Despliegue: `loom-serve` del paquete `hrx-loom[hf]==0.1.0`, con descarga via `loom-fetch`; API OpenAI en `127.0.0.1:8080`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete, aunque llama.cpp se usa como referencia de comparacion.
- Latencia y throughput: solo se dispone de los limites roofline de la tabla anterior; las cifras reales de Loom y llama.cpp no se registraron en esta compilacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables de la misma categoria (0,8B multimodal) ni resultados de rendimiento medidos que permitan una comparacion rigurosa. El unico contraste documentado es contra llama.cpp como motor de inferencia, no contra otros modelos.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene verificar la licencia del modelo base `unsloth/Qwen3.5-0.8B-GGUF` antes de desplegarlo en produccion.
- Idiomas no declarados: el soporte multilingue no esta documentado y no debe asumirse.
- Puertas de correccion no reejecutadas en esta compilacion: `kernel_tests`, `golden`, `compare`, `vision`, `consistency` y `agent` constan como "no re-run on this package"; la ultima pasada fue sobre una compilacion previa (sha256 `c487fec`).
- Resultados de rendimiento sin medir: las columnas de Loom y llama.cpp estan vacias en las tablas de Strix Halo, y la R9700 no se ha vuelto a medir.
- Sin decodificacion especulativa: no hay cabeza MTP en el GGUF ni drafter publicado para este modelo.
- Limite de salida de 4.096 tokens por peticion, lo que puede ser insuficiente para generaciones largas pese al contexto de 262k.
- Concurrencia limitada a 4 peticiones simultaneas.
- Riesgo de alucinacion y sesgos: no disponible; no se han publicado evaluaciones de calidad, sesgo o robustez.
- Tamano reducido (0,8B): esperable menor capacidad de razonamiento y codigo que modelos de mayor escala; no apto para tareas que exijan alta precision sin verificacion.
- Dependencia del stack Loom y de ROCm: no es portable a otros runtimes sin conversion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-Qwen3.5-0.8B-loom
- Modelo base (GGUF): https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
