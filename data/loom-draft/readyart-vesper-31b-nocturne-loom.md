# loom-draft/ReadyArt-Vesper-31B-Nocturne-loom

## Resumen

ReadyArt-Vesper-31B-Nocturne-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` a partir del checkpoint GGUF sin modificar `ReadyArt/Vesper-31B-Nocturne-GGUF`, concretamente el fichero `Vesper-31B-Nocturne-Q4_K_M_hb16.gguf`. No se trata de un modelo de lenguaje nuevo ni de un fine-tune: es un artefacto de empaquetado que adapta un GGUF preexistente de 31B parametros, cuantizado en Q4_K_M, para su ejecucion sobre el runtime Loom en GPUs AMD concretas.

El paquete esta dirigido especificamente a dos aceleradores: la APU AMD Ryzen AI Max+ 395 «Strix Halo» (arquitectura gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Se genera con la herramienta `loom-next` y se sirve mediante `loom-serve`, que expone una API compatible con OpenAI (`/v1/chat/completions`) con soporte de tool calling y un modo de razonamiento opcional. La relevancia actual del artefacto es acotada: interesa a quien ya opere el stack Loom sobre hardware AMD y quiera ejecutar este checkpoint concreto sin pasar por llama.cpp.

La informacion publicada por el autor es fundamentalmente de empaquetado y de infraestructura de despliegue, no de entrenamiento ni de evaluacion. No hay datos sobre la composicion del dataset, el numero de tokens de entrenamiento, los idiomas soportados ni resultados de benchmarks. El repositorio figura con 0 GB de tamano, 0 descargas y 0 likes en el momento de la consulta, y las mediciones de rendimiento y las puertas de correccion aparecen como «not yet re-measured» en ambas GPUs objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no la documenta; el checkpoint base es un GGUF de 31B) |
| Parametros totales | 31B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible |
| Longitud de contexto | 53.248 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (fichero `Vesper-31B-Nocturne-Q4_K_M_hb16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF dentro de un paquete Loom (`.loom` + `model.json`) |
| Salida maxima por peticion | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Generador | loom-next (solo el generador, sin LLM en el bucle) |
| Runtime | loom-serve 0.2.0 (`hrx-loom[hf]==0.2.0`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. La model card de este paquete no describe la red neuronal, los datos de entrenamiento, el numero de tokens procesados ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Todo lo que documenta el autor es la capa de empaquetado: el checkpoint GGUF original se conserva «sin modificar» y Loom genera programas especificos para las dos microarquitecturas AMD objetivo.

La innovacion tecnica del artefacto no reside en el modelo sino en el runtime. Loom compila kernels para gfx1151 y gfx1201 y ofrece un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, con tolerancia a empates cercanos en la distribucion de log-probabilidades. En la version publicada, ninguna de estas puertas tiene medicion registrada para este paquete en ninguna de las dos GPUs.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`POST /v1/chat/completions`).
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de llamadas a herramientas segun la puerta `agent`.
- Modo de razonamiento o «thinking» desactivable: apagado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Contexto de 53.248 tokens por peticion, suficiente para documentos largos y conversaciones multi-turno extensas.
- Concurrencia de hasta 4 peticiones simultaneas con la puerta `consistency` definida para verificar que la salida concurrente coincide con la secuencial.
- Entrada de imagen: no soportada por Loom en este paquete, aunque el modelo upstream si la tiene.
- Entrada y salida de audio: no soportadas por Loom en este paquete, aunque el modelo upstream si las tiene.
- Decodificacion especulativa: no aplicable en este preset.
- Ajuste de esfuerzo de razonamiento («reasoning effort»): no aplicable.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Despliegue local en estaciones de trabajo con Ryzen AI Max+ 395: el paquete esta precompilado para gfx1151, de modo que un equipo con esa APU puede servir el modelo con `loom-fetch` y `loom-serve` sin compilar kernels ni recurrir a llama.cpp.
- Inferencia en servidores con Radeon AI PRO R9700 de 32 GB: el preset `chat-r9700` esta ajustado a esa GPU y permite ejecutar un modelo de 31B en Q4_K_M dentro de la VRAM disponible.
- Asistentes con tool calling sobre API OpenAI: al exponer `tools` y `tool_calls` con el mismo esquema, se puede apuntar un cliente existente (SDK de OpenAI, LangChain, etc.) al endpoint local cambiando solo la URL base.
- Automatizacion de documentacion larga: con 53.248 tokens de contexto por peticion se pueden procesar contratos, informes o bases de codigo de tamano medio en una sola pasada, sin trocear en exceso.
- Modo razonamiento para tareas de analisis: activando `enable_thinking` se obtiene una traza de razonamiento previa a la respuesta, util para depuracion de decisiones o para tareas que requieran descomposicion explicita.
- Evaluacion comparativa de runtimes AMD: las puertas de correccion de Loom permiten contrastar token a token la salida frente a llama.cpp sobre el mismo GGUF, lo que sirve para validar la madurez del stack antes de adoptarlo en produccion.
- Servicio de chat interno con concurrencia moderada: el limite de 4 peticiones simultaneas y 4.096 tokens de salida encaja en un uso de equipo pequeno o en un entorno de pruebas, no en un servicio publico de alta carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y para Radeon AI PRO R9700, pero ambas indican literalmente que los resultados «for this package are not yet re-measured». Del mismo modo, las once puertas de correccion figuran como «not yet re-measured» en las dos GPUs, por lo que no hay evidencia registrada de fidelidad numerica frente a la referencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es una cuantizacion Q4_K_M de un modelo de 31B, y el preset esta disenado para una GPU de 32 GB (Radeon AI PRO R9700), lo que sugiere que el peso en VRAM debe caber en ese margen, pero el autor no publica la cifra.
- GPUs soportadas oficialmente: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs consumer: no se documenta compatibilidad con RTX 4090, RTX 3090 ni otras GPU de consumo; el paquete esta generado exclusivamente para las dos microarquitecturas AMD citadas.
- Despliegue: `loom-fetch` para materializar el paquete desde Hugging Face y `loom-serve` para servirlo. Instalacion via `pipx install "hrx-loom[hf]==0.2.0"`.
- Opciones de servicio recomendadas por el autor: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU, consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` (reserva el pool de memoria por adelantado) y `--parameter_mode=preload` (carga de pesos en host; solo afecta a la carga, no al rendimiento medido salvo que el job se sirva con el).
- Latencia y throughput: no disponibles; las mediciones del paquete no se han vuelto a realizar.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base mas alla de su tamano (31B) y su cuantizacion (Q4_K_M), por lo que no es posible establecer una comparacion rigurosa con alternativas de la misma categoria. Como referencia estructural, el propio paquete se compara contra llama.cpp ejecutando el mismo GGUF, pero esa comparacion mide el runtime, no el modelo, y sus resultados figuran como no medidos.

## Limitaciones y advertencias

- El repositorio figura con 0 GB de tamano, 0 descargas y 0 likes: no hay evidencia de uso ni de validacion por terceros.
- Ninguna de las once puertas de correccion tiene medicion registrada; no hay prueba publicada de que la salida coincida con la referencia de llama.cpp en estas GPUs.
- No hay mediciones de rendimiento para ninguna de las dos GPUs objetivo.
- La entrada de imagen y la de audio, presentes en el modelo upstream, no estan soportadas por Loom en este paquete; quien las necesite debe usar otro runtime.
- El limite de 4 peticiones concurrentes y 4.096 tokens de salida acota el uso a cargas moderadas.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion del modelo base; estos riesgos deben evaluarse sobre el checkpoint original.
- La licencia MIT se declara en la tarjeta, pero conviene verificar que se hereda del checkpoint base `ReadyArt/Vesper-31B-Nocturne-GGUF` antes de un uso comercial.
- El paquete esta atado a dos microarquitecturas AMD concretas; no es portable a NVIDIA ni a otras GPU sin regeneracion.
- El nombre «Loom» coincide con la herramienta comercial de grabacion de pantalla y con una marca de ropa; los resultados de busqueda web no son relevantes para este artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Vesper-31B-Nocturne-loom
- Checkpoint base: https://huggingface.co/ReadyArt/Vesper-31B-Nocturne-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
