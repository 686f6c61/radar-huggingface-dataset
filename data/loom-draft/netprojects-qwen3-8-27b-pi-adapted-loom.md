# loom-draft/netprojects-Qwen3.8-27B-pi-adapted-loom

## Resumen

`loom-draft/netprojects-Qwen3.8-27B-pi-adapted-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `Qwen3.8-27B-pi-Q4_K_M.gguf` del modelo base `netprojects/Qwen3.8-27B-pi-adapted-GGUF`. Lo publica el usuario `loom-draft` y esta generado con la herramienta `loom-next`, sin intervencion de un LLM en el bucle de generacion. No se trata de un modelo nuevo ni de un fine-tune adicional: es un artefacto de empaquetado para servir el GGUF original sobre hardware AMD concreto.

El objetivo es ejecutar un modelo multimodal de 27B parametros (entrada de imagen y texto) en la GPU integrada AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y en la GPU discreta AMD Radeon AI PRO R9700 (gfx1201, 32 GB), usando el runtime Loom y su servidor compatible con la API de OpenAI. El paquete declara soporte de tool calling, modo de razonamiento con niveles de esfuerzo, decodificacion especulativa MTP a profundidad 3 y una ventana de contexto de 262.144 tokens por peticion.

La relevancia es acotada: interesa a quien quiera servir este GGUF concreto en GPUs AMD bajo el stack ROCm/Loom, no a quien busque un modelo nuevo con benchmarks publicados. De hecho, el repositorio tiene 0 descargas y 0 likes, el tamano del repo es de 0.0 GB (los pesos se descargan desde el modelo base) y todas las mediciones de rendimiento y correctitud figuran como "not yet re-measured". La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no documenta la arquitectura del modelo base; se infiere un transformer multimodal con proyector de vision, sin confirmacion en la informacion) |
| Parametros totales | 27B (segun el nombre del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint `Qwen3.8-27B-pi-Q4_K_M.gguf`); proyector de vision en F16 (`mmproj-Qwen3.8-27B-pi-F16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF empaquetado en formato Loom (`.loom` + `model.json`) |
| Concurrencia | 4 peticiones simultaneas |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base `netprojects/Qwen3.8-27B-pi-adapted-GGUF`: no se detalla si es un transformer denso, MoE o hibrido, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo RLHF/DPO. El nombre sugiere un modelo de la familia Qwen 3.8 de 27B parametros adaptado por `netprojects`, pero la model card no confirma la arquitectura ni el proceso de adaptacion. Tampoco se documenta el entrenamiento del proyector de vision `mmproj-Qwen3.8-27B-pi-F16.gguf`, que se usa para la entrada de imagen.

Lo que si documenta el paquete es la capa de ejecucion: el runtime Loom carga el GGUF sin modificarlo y genera kernels para las arquitecturas AMD objetivo. Incorpora decodificacion especulativa basada en MTP (multi-token prediction) con profundidad 3, activada por defecto, y un modo de razonamiento con niveles de esfuerzo (`low`, `medium`, `xhigh`, por defecto `xhigh`) controlable mediante `chat_template_kwargs`. El servidor expone `/v1/chat/completions` con esquema compatible con OpenAI.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto y desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Control granular del esfuerzo de razonamiento mediante `reasoning_effort` (`low`, `medium`, `xhigh`).
- Entrada de imagen y texto (pipeline `image-text-to-text`) mediante partes `image_url` al estilo de OpenAI, con el proyector `mmproj-Qwen3.8-27B-pi-F16.gguf`.
- Tool calling al estilo de OpenAI: acepta `tools` y devuelve `tool_calls`.
- Decodificacion especulativa MTP con profundidad 3, activada por defecto.
- Ventana de contexto de 262.144 tokens por peticion y hasta 4 peticiones concurrentes.
- Entrada y salida de audio: no determinado en la informacion disponible.
- Muestreo (sampling): no determinado en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Servicio local de chat multimodal en estacion de trabajo AMD: desplegar el paquete con `loom-serve` en una Radeon AI PRO R9700 (32 GB) para ofrecer un endpoint compatible con OpenAI que acepte texto e imagenes, sin depender de servicios en la nube.
- Procesamiento de documentos largos con imagen: gracias a los 262.144 tokens de contexto por peticion, se pueden enviar documentos extensos junto con capturas o diagramas y pedir resumenes o extraccion de datos en una sola llamada.
- Agentes con tool calling: el soporte de `tools`/`tool_calls` y del bucle multi-turno (validado por las puertas `agent` y `agent_think_off` del banco de pruebas, pendientes de re-medicion) permite construir asistentes que consulten APIs externas o bases de datos.
- Razonamiento con coste controlado: usar `reasoning_effort: low` para tareas simples de clasificacion o extraccion y `xhigh` para problemas que requieran cadena de razonamiento, ajustando latencia y consumo segun la carga.
- Evaluacion de hardware AMD para inferencia: el paquete sirve como referencia para medir el rendimiento de Strix Halo y R9700 con un modelo de 27B en Q4_K_M bajo Loom, comparandolo con llama.cpp mediante las puertas de correctitud incluidas.
- Integracion en pipelines internos de CI/CD o automatizacion: al exponer una API compatible con OpenAI en `127.0.0.1:8080`, se puede conectar a clientes existentes sin adaptadores, con concurrencia de 4 peticiones para cargas moderadas.
- Prototipado de asistentes con vision en entornos con requisitos de privacidad: al ejecutarse en hardware local, las imagenes no salen del equipo, lo que encaja en flujos con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 27B, y el hardware declarado como objetivo incluye una GPU de 32 GB (Radeon AI PRO R9700), lo que sugiere que el paquete esta pensado para caber en ese presupuesto de memoria, pero la informacion no confirma el consumo exacto.
- GPU recomendadas por el autor: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo (RTX 4090 u otras); el paquete esta orientado a hardware AMD con ROCm.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` y `loom-serve`; el servidor expone `/v1/chat/completions`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete, aunque llama.cpp se usa como referencia de correctitud.
- Parametros de servicio relevantes: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga de pesos en host).
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones comparables de otros modelos de la misma categoria, y no se han publicado benchmarks de este paquete que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El paquete no incluye los pesos: el repositorio ocupa 0.0 GB y los pesos se obtienen del modelo base `netprojects/Qwen3.8-27B-pi-adapted-GGUF`; hay que verificar la disponibilidad y licencia de ese repositorio por separado.
- Todas las puertas de correctitud y las mediciones de rendimiento figuran como "not yet re-measured"; no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en esta version.
- La arquitectura, el entrenamiento y los idiomas del modelo base no estan documentados en la informacion disponible; no se puede confirmar el comportamiento multilingue ni el proceso de alineacion.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones publicadas especificas para este checkpoint.
- Sesgos conocidos: no disponibles.
- Compatibilidad limitada al hardware y runtime declarados (Strix Halo gfx1151 y Radeon AI PRO R9700 gfx1201 con `hrx-loom` 0.2.0); no se documenta soporte para otras GPUs ni para CUDA.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens por defecto; para cargas de produccion de mayor volumen habria que revisar los presets.
- La licencia MIT se declara en este paquete, pero conviene confirmar la licencia del modelo base y del checkpoint GGUF original antes de un uso comercial.
- El modo de razonamiento esta activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva explicitamente.
- Los resultados de busqueda web disponibles corresponden a servicios no relacionados (Loom como grabador de pantalla y una marca de ropa); no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/netprojects-Qwen3.8-27B-pi-adapted-loom
- Modelo base (GGUF): https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
