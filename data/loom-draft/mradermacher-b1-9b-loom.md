# loom-draft/mradermacher-B1-9B-loom

## Resumen

B1-9B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `mradermacher/B1-9B-GGUF`, en su cuantizacion `B1-9B.Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta orientado a dos aceleradores AMD concretos: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado y compilacion para el runtime Loom, generado con la herramienta `loom-next` sin intervencion de un LLM en el proceso.

El modelo subyacente, B1-9B, es un modelo multimodal de 9B parametros con soporte de vision (pipeline `image-text-to-text`), pensado para conversacion, razonamiento con modo "thinking" y tool calling. El paquete Loom anade decodificacion especulativa basada en MTP (multi-token prediction) con profundidad 3, activada por defecto, y expone una API compatible con OpenAI (`/v1/chat/completions`) a traves de `loom-serve`.

La relevancia de esta ficha es doble: por un lado documenta un caso de despliegue de inferencia en hardware AMD consumer y workstation (ROCm, gfx1151/gfx1201) sin pasar por CUDA; por otro, ilustra el ecosistema Loom, que compila los pesos GGUF a programas especificos del dispositivo. Cabe senalar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que el propio autor indica que las mediciones de rendimiento y las puertas de correccion "no se han vuelto a medir" para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base B1-9B; el paquete Loom no detalla la arquitectura interna) |
| Parametros totales | 9B (segun el nombre del modelo base B1-9B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete incluye proyector de vision `B1-9B.mmproj-f16.gguf` en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` y `weights.loom`; tokenizer en `tokenizer.json`; configuracion en `llm_config.json` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base B1-9B en la documentacion proporcionada. El paquete Loom no incluye detalles sobre el transformer subyacente, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. Lo que si documenta el autor es la capa de despliegue: los pesos GGUF se compilan a programas `.loom` especificos para las arquitecturas gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700), generados por `loom-next` sin LLM en el bucle.

La innovacion tecnica destacable de este paquete es la decodificacion especulativa mediante MTP (multi-token prediction) con profundidad 3, activada por defecto. El runtime incorpora ademas un modo de espera activa para las finalizaciones de GPU (`completion_spin_ns=4294967295`), un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`). El paquete incluye un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF, aunque para este paquete concreto ninguna aparece medida.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat y soporte de modo "thinking" (razonamiento) activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagenes mediante partes `image_url` al estilo OpenAI, con proyector de vision dedicado (`B1-9B.mmproj-f16.gguf`).
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`).
- Decodificacion especulativa MTP con profundidad 3, activada por defecto.
- Servidor HTTP compatible con la API de OpenAI (`/v1/chat/completions`).
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- Soporte de audio: no disponible (marcado como no aplicable).
- Ajuste de "reasoning effort": no disponible (marcado como no aplicable).
- Muestreo (temperature, top_k, seed): estado no determinado en la tabla de caracteristicas.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el modelo puede servir chat multi-turno con 262.144 tokens de contexto por peticion mediante `loom-serve`, lo que permite adjuntar documentos largos o historiales extensos sin truncar, en hardware AMD sin CUDA.
- Analisis de documentos e imagenes combinados: al aceptar partes `image_url` junto a texto, es adecuado para tareas de extraccion de informacion de capturas, diagramas o formularios escaneados en un pipeline interno.
- Agentes con tool calling: el soporte de `tools`/`tool_calls` al estilo OpenAI y las puertas de correccion `agent` y `agent_think_off` del runtime estan disenados para bucles multi-turno de llamadas a herramientas, utiles para automatizacion de tareas internas.
- Prototipado de aplicaciones compatibles con OpenAI: al exponer `/v1/chat/completions`, se puede apuntar un SDK de OpenAI existente a `http://127.0.0.1:8080` y validar flujos sin cambiar codigo de cliente.
- Despliegue en APU Strix Halo para equipos compactos: el paquete esta optimizado para la Ryzen AI Max+ 395 (gfx1151), lo que permite ejecutar un modelo multimodal de 9B en un equipo de sobremesa o portatil de gama alta sin GPU discreta.
- Evaluacion de la cadena Loom frente a llama.cpp: las puertas `golden`, `compare`, `spec` y `vision` permiten verificar que la salida del runtime coincide token a token (salvo empates cercanos) con la referencia de llama.cpp sobre el mismo GGUF, util para equipos que evaluen migrar su stack de inferencia.
- Razonamiento con modo thinking para tareas de analisis: el modo de razonamiento activado por defecto puede usarse en tareas que requieran cadenas de razonamiento, desactivandolo cuando se priorice latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambos casos indica literalmente que "los resultados para este paquete aun no se han vuelto a medir". Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran igualmente como "no medidas todavia" para ambas plataformas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; la cuantizacion Q4_K_M de un modelo de 9B sugiere del orden de 5-6 GB para los pesos, mas el proyector de vision en F16, pero el autor no publica cifras.
- GPU soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Cabe en GPU consumer: no hay datos publicados sobre GPUs consumer AMD o NVIDIA; el paquete esta generado especificamente para las dos arquitecturas AMD citadas.
- Opciones de despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). El checkpoint base es GGUF, por lo que en teoria podria ejecutarse con llama.cpp u otros runtimes GGUF, aunque el paquete `.loom` solo funciona con Loom.
- Latencia y throughput: no disponibles; el autor no ha vuelto a medir el rendimiento de este paquete.
- Concurrencia maxima: 4 peticiones simultaneas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones detalladas del modelo base B1-9B que permitan una comparacion rigurosa con alternativas de la misma categoria. Como referencia estructural, el propio paquete se compara funcionalmente contra llama.cpp ejecutando el mismo GGUF, pero esa comparacion es de runtime, no de modelo, y sus resultados no estan medidos.

| Aspecto | B1-9B-loom | llama.cpp (mismo GGUF) |
|---|---|---|
| Formato | Programas `.loom` + `weights.loom` | GGUF |
| Hardware objetivo | gfx1151, gfx1201 (AMD) | Multiples backends |
| API | OpenAI-compatible via `loom-serve` | Servidor propio / bindings |
| Decodificacion especulativa | MTP, profundidad 3, por defecto | Segun configuracion |
| Rendimiento medido | No medido | Referencia de correccion |

## Limitaciones y advertencias

- Paquete sin mediciones: las secciones de rendimiento y todas las puertas de correccion figuran como "no medidas todavia" para ambas plataformas, por lo que no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en este paquete concreto.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, y creado y actualizado el mismo dia; no hay historial de uso ni validacion comunitaria.
- Hardware restringido: el paquete esta generado para gfx1151 y gfx1201; no se garantiza su funcionamiento en otras GPUs AMD ni en NVIDIA.
- Limite de salida: 4.096 tokens por peticion, lo que puede ser insuficiente para generaciones largas.
- Concurrencia limitada a 4 peticiones simultaneas, relevante para despliegues con carga alta.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingue fuera de los idiomas del modelo base.
- Arquitectura y entrenamiento del modelo base no documentados en esta ficha: no se pueden evaluar sesgos, riesgo de alucinacion ni calidad de razonamiento con datos concretos.
- Licencia Apache 2.0 permite uso comercial, pero se aplica al paquete; conviene verificar la licencia del checkpoint base `mradermacher/B1-9B-GGUF` antes de produccion.
- El modo thinking esta activado por defecto, lo que incrementa latencia y consumo de tokens si no se desactiva explicitamente.
- El estado del muestreo (temperature, top_k, seed) figura como "no determinado" en la tabla de caracteristicas del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/mradermacher-B1-9B-loom
- Modelo base (GGUF): https://huggingface.co/mradermacher/B1-9B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
