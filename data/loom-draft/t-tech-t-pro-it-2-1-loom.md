# loom-draft/t-tech-T-pro-it-2.1-loom

## Resumen

T-pro-it-2.1-loom es un paquete de despliegue en formato Loom para el checkpoint GGUF `t-tech/T-pro-it-2.1-GGUF` (concretamente la cuantizacion `T-pro-it-2.1-Q4_K_M.gguf`), generado por el usuario `loom-draft` mediante la herramienta `loom-next`. No se trata de un modelo nuevo ni de un fine-tune de pesos: los pesos son los del checkpoint original sin modificar, y lo que aporta el repositorio es un conjunto de programas `.loom` y una tarjeta `model.json` que permiten servir el modelo sobre GPUs AMD concretas mediante el runtime `loom-serve` del ecosistema Loom (asociado a ROCm).

El objetivo es ofrecer una via de inferencia nativa en hardware AMD (Ryzen AI Max+ 395 "Strix Halo", gfx1151, y Radeon AI PRO R9700, gfx1201) sin depender de llama.cpp, exponiendo una API compatible con OpenAI (`/v1/chat/completions`). El paquete declara soporte de tool calling estilo OpenAI, modo de razonamiento siempre activo, contexto de 40.960 tokens por peticion y 4 peticiones concurrentes.

La relevancia es acotada: el repositorio no publica resultados de rendimiento ni de correccion medidos para este paquete (las tablas de performance y de gates de correccion aparecen como "not yet re-measured"), no declara idiomas soportados y no incluye informacion sobre el tamano, la arquitectura ni los datos de entrenamiento del modelo base. Toda la informacion tecnica del modelo subyacente debe consultarse en el repositorio original `t-tech/T-pro-it-2.1-GGUF`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (corresponde al modelo base `t-tech/T-pro-it-2.1-GGUF`; no declarada en este repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 40.960 tokens por peticion (configuracion del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas Loom (`program/*.loom`, `weights.loom`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| API | compatible con OpenAI (`/v1/chat/completions`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente en este repositorio: la model card no describe si `t-tech/T-pro-it-2.1` es un transformer denso, un MoE o un modelo hibrido, ni detalla el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Esos datos corresponden al repositorio del modelo base y no se reproducen aqui.

Lo que si documenta el paquete es la capa de ejecucion: `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) a partir de la configuracion del modelo (`llm_config.json`), y `loom-serve` los ejecuta sobre GPUs AMD. El paquete incluye un `model.json` con los ficheros fuente fijados por hash SHA-256 (verificado por `loom-fetch`), el tokenizador (`tokenizer.json`), los pesos empaquetados (`weights.loom`) y un `REPORT.md` con la metodologia de medida. El modo de razonamiento esta siempre activo y no admite ajuste de esfuerzo ("reasoning effort: not applicable"); la decodificacion especulativa no esta soportada en este paquete.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento / thinking mode siempre activado (no configurable por peticion).
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- Bucles de tool calling multi-turno con reutilizacion de historial (segun el gate `agent` descrito en la model card, aunque sin medicion registrada para este paquete).
- Contexto de 40.960 tokens por peticion, adecuado para documentos largos y conversaciones extensas.
- Concurrencia de hasta 4 peticiones simultaneas con consistencia declarada entre ejecucion concurrente y aislada (gate `consistency`, sin medicion registrada).
- Sin soporte de entrada de imagen ni de audio (marcado como "not applicable").
- Capacidades multilingues: no disponible.
- Muestreo (temperature, top_k, seed): marcado como "not determined" en la tabla de caracteristicas.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: el paquete permite servir el modelo con `loom-serve` en una Ryzen AI Max+ 395 o una Radeon AI PRO R9700 y consumirlo por HTTP con el esquema de OpenAI, sin depender de CUDA ni de llama.cpp.
- Agentes con tool calling en local: al aceptar `tools` y `tool_calls` en formato OpenAI, puede integrarse en frameworks de agentes existentes para tareas de consulta a APIs internas, ejecucion de comandos o recuperacion de datos, con el bucle multi-turno soportado por el runtime.
- Procesamiento de documentos largos: los 40.960 tokens de contexto por peticion permiten resumir, extraer informacion o responder preguntas sobre contratos, informes o bases de codigo de tamano medio en una sola pasada.
- Evaluacion de hardware AMD para inferencia LLM: util como banco de pruebas para medir el rendimiento de `loom-serve` frente a llama.cpp en gfx1151 y gfx1201, aunque el propio repositorio aun no publica esas medidas.
- Backend de chat para herramientas internas de desarrollo: al exponer una API compatible con OpenAI, puede sustituir a un endpoint remoto en prototipos, siempre que el razonamiento siempre activo y el limite de 4.096 tokens de salida sean aceptables.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 del paquete facilita su integracion en productos comerciales, sujeta a la licencia del modelo base.
- Pruebas de regresion de kernels: los gates de correccion (`kernel_tests`, `golden`, `compare`, `logits`) descritos en la model card sirven como marco para validar implementaciones propias contra la referencia de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todos los gates de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M y el hardware de referencia declarado es una Radeon AI PRO R9700 con 32 GB, lo que sugiere que el paquete esta dimensionado para caber en 32 GB con el pool de memoria fijo (`--pool_backing=fixed`).
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que esta generado para dispositivos AMD (`--device=amdgpu://`).
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones para este paquete concreto.
- Parametros de servicio relevantes: `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` (reserva el pool de memoria por adelantado) y `--parameter_mode=preload` (carga de pesos en host).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion cuantitativa con alternativas. Como referencia cualitativa, el propio paquete se posiciona frente a llama.cpp ejecutando el mismo GGUF, pero no se han publicado las medidas de esa comparacion para este paquete.

## Limitaciones y advertencias

- El repositorio no contiene mediciones de rendimiento ni de correccion para este paquete; todas las tablas relevantes figuran como "not yet re-measured". No hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- No se declaran los idiomas soportados ni la arquitectura, el tamano o los datos de entrenamiento del modelo base; cualquier evaluacion de calidad debe hacerse contra `t-tech/T-pro-it-2.1-GGUF`.
- El modo de razonamiento esta siempre activo y no es configurable, lo que incrementa el consumo de tokens y la latencia en tareas simples.
- Limite de 4.096 tokens de salida por peticion y de 4 peticiones concurrentes, lo que restringe su uso en cargas de alta concurrencia.
- El muestreo figura como "not determined": no hay garantia documentada sobre el comportamiento de temperature, top_k o seed.
- Sin soporte de vision ni de audio, pese a que la model card menciona un gate `vision` en la metodologia de evaluacion.
- Dependencia de un runtime especifico (`hrx-loom==0.2.0`) y de hardware AMD concretos; no es portable a NVIDIA ni a CPU de forma documentada.
- Licencia Apache 2.0 declarada para el paquete, pero el uso comercial esta sujeto tambien a la licencia del modelo base, que no se detalla en este repositorio.
- Riesgo de alucinacion y sesgos: no disponible (no hay informacion sobre el modelo base en esta fuente).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/t-tech-T-pro-it-2.1-loom
- Modelo base (GGUF): https://huggingface.co/t-tech/T-pro-it-2.1-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
