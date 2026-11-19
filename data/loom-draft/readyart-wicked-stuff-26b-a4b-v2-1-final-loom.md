# loom-draft/ReadyArt-Wicked-Stuff-26B-A4B-v2.1-FINAL-loom

## Resumen

ReadyArt-Wicked-Stuff-26B-A4B-v2.1-FINAL-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` para servir el checkpoint GGUF sin modificar `ReadyArt/Wicked-Stuff-26B-A4B-v2.1-FINAL-GGUF` en GPUs AMD. El repositorio no contiene pesos propios: es un artefacto de empaquetado orientado al runtime `loom-serve` del ecosistema Loom, con presets especificos para el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente se infiere a partir del nombre como un Mixture of Experts de aproximadamente 26.000 millones de parametros totales con unos 4.000 millones activos por token (patron "26B-A4B", equivalente a la nomenclatura de familias como Qwen3-30B-A3B), aunque la model card no confirma arquitectura, numero de expertos ni datos de entrenamiento. El paquete se distribuye con cuantizacion Q4_K_M y expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento opcional y una ventana de contexto declarada de 201.728 tokens por peticion.

Su relevancia es acotada pero concreta: permite ejecutar un modelo de ~26B en hardware AMD consumer y de estacion de trabajo sin pasar por llama.cpp, con un servidor HTTP propio. No obstante, el repositorio tiene 0 descargas, 0 likes, un tamano de 0,0 GB y todas las puertas de correccion y las mediciones de rendimiento aparecen como "not yet re-measured", por lo que debe tratarse como un artefacto experimental sin validacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE; no confirmado en la model card) |
| Parametros totales | 26B (segun el nombre del modelo; no confirmado en la model card) |
| Parametros activos | ~4B (segun el sufijo "A4B"; no confirmado en la model card) |
| Longitud de contexto | 201.728 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado en artefactos `.loom` + `model.json`) |

Otros parametros operativos declarados en la model card: maximo de 4.096 tokens de salida por peticion (preset `max_tokens`), 4 peticiones concurrentes, tool calling estilo OpenAI, modo thinking desactivado por defecto y sin decodificacion especulativa.

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura interna, los datos de entrenamiento, el numero de tokens vistos ni las etapas de alineacion (RLHF, DPO u otras) del modelo base. La model card del paquete Loom solo describe el proceso de empaquetado: se parte del GGUF `Wicked-Stuff-26B-A4B-v2.1-Final-Q4_K_M.gguf` sin modificarlo y se generan kernels y presets con la herramienta `loom-next` (generador automatico, sin LLM en el bucle) para dos targets AMD concretos, gfx1151 y gfx1201.

La innovacion tecnica del artefacto no esta en el modelo sino en el runtime: Loom compila kernels especificos para la GPU objetivo y los sirve mediante `loom-serve`, con opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `pool_backing=fixed` (pool de memoria comprometido por adelantado) y `parameter_mode=preload` (carga anticipada de pesos en host). La model card menciona que el modelo upstream soporta entrada de imagen y audio, pero Loom no implementa esas modalidades.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta el parametro `tools` y devuelve `tool_calls`, lo que habilita bucles de agente multi-paso.
- Modo de razonamiento (thinking) opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Contexto largo de hasta 201.728 tokens por peticion, adecuado para documentos extensos o historiales de conversacion largos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Capacidades de vision y audio presentes en el modelo upstream pero no soportadas por Loom.
- No se declaran capacidades multilingues especificas ni idiomas soportados.
- No se declaran capacidades de codigo o matematicas mas alla de las genericas de un LLM de texto.

## Casos de uso

- Asistente conversacional autohospedado en estacion de trabajo AMD: el paquete esta pensado para servirse con `loom-serve` en una Radeon AI PRO R9700 de 32 GB o en un Ryzen AI Max+ 395, ofreciendo un endpoint compatible con OpenAI sin depender de servicios en la nube.
- Procesamiento de documentos largos: con 201.728 tokens de contexto por peticion se pueden analizar contratos, informes o bases de codigo extensas en una sola pasada, siempre que el hardware soporte la ventana completa.
- Agentes con herramientas: el soporte de `tools`/`tool_calls` permite construir flujos de agente que consulten APIs externas, ejecuten busquedas o interactuen con sistemas internos, con hasta 4 peticiones concurrentes.
- Razonamiento con coste controlado: el modo thinking desactivable por peticion permite usar el modelo en modo rapido para tareas simples y activar el razonamiento solo cuando se necesita, sin cambiar de modelo.
- Sustitucion de llama.cpp en entornos AMD: equipos que ya dispongan de hardware gfx1151 o gfx1201 pueden desplegar este paquete para obtener un servidor HTTP con API OpenAI sin compilar llama.cpp manualmente.
- Prototipado y evaluacion de modelos MoE de ~26B en local: util para investigadores que quieran medir el comportamiento de un MoE con ~4B activos en GPUs AMD consumer o de estacion de trabajo antes de comprometerse con infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen como "not yet re-measured" en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de ~26B, lo que en la practica requiere del orden de 16-20 GB solo para pesos, mas overhead de contexto y pool de memoria.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). La segunda tiene 32 GB de VRAM, suficiente para el checkpoint Q4_K_M con contexto amplio.
- Compatibilidad con GPU consumer: no confirmada; el paquete solo declara soporte para los dos targets AMD anteriores. No se mencionan GPUs NVIDIA ni ROCm en otras arquitecturas.
- Opciones de despliegue: `loom-serve` (runtime Loom) instalado via `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para descargar el paquete desde Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card estan pendientes de re-medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ReadyArt-Wicked-Stuff-26B-A4B-v2.1-FINAL-loom | 26B totales / ~4B activos (segun nombre) | 201.728 tokens | Apache 2.0 | GGUF empaquetado en `.loom` | Paquete de despliegue para AMD gfx1151 y gfx1201; sin benchmarks publicados |
| ReadyArt/Wicked-Stuff-26B-A4B-v2.1-FINAL-GGUF (upstream) | 26B totales / ~4B activos (segun nombre) | no disponible | Apache 2.0 (heredada) | GGUF | Checkpoint original sin empaquetar; mismo modelo subyacente |
| llama.cpp (runtime alternativo) | no aplica | depende del modelo | MIT | GGUF | Runtime generico; la model card lo usa como referencia de correccion, pero no hay comparacion de rendimiento publicada |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas con otras familias de modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio sin validacion publica: 0 descargas, 0 likes, 0,0 GB de tamano y todas las puertas de correccion y mediciones de rendimiento pendientes de re-medicion. No hay evidencia publicada de que el paquete funcione correctamente.
- No es un modelo original: es un artefacto de empaquetado de un GGUF de terceros; cualquier problema de calidad, sesgo o alucinacion proviene del modelo base, sobre el que no hay informacion en este repositorio.
- Soporte de hardware muy restringido: solo se declaran dos targets AMD (gfx1151 y gfx1201). No hay soporte documentado para NVIDIA, otras GPUs AMD ni CPU.
- Modalidades incompletas: vision y audio existen en el modelo upstream pero no estan implementados en Loom, por lo que no deben asumirse.
- Limite de salida de 4.096 tokens por peticion, lo que puede ser insuficiente para generaciones largas aunque el contexto de entrada sea de 201.728 tokens.
- Concurrencia limitada a 4 peticiones simultaneas, insuficiente para cargas de produccion con trafico alto.
- Idiomas soportados no declarados: no se puede garantizar calidad en castellano ni en otros idiomas distintos del ingles sin evaluacion propia.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion disponible.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero al tratarse de un artefacto derivado conviene verificar la licencia del checkpoint upstream antes de desplegarlo en produccion.
- El runtime Loom (`hrx-loom`) es una dependencia externa con version fijada (0.2.0); cambios de version pueden romper la compatibilidad del paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Wicked-Stuff-26B-A4B-v2.1-FINAL-loom
- Modelo base (GGUF): https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v2.1-FINAL-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
