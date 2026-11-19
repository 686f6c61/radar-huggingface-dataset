# loom-draft/Trivnpk-Qwen-Compiler-Mind-4B-loom

## Resumen

`loom-draft/Trivnpk-Qwen-Compiler-Mind-4B-loom` es un paquete de despliegue en formato Loom para el checkpoint GGUF `qwen-compiler-mind-v3.2.1-Q4_K_M.gguf`, derivado del modelo base `Trivnpk/Qwen-Compiler-Mind-4B`. No se trata de un modelo entrenado desde cero ni de un fine-tune nuevo: el autor (loom-draft) empaqueta los pesos originales sin modificar junto con programas `.loom` y una tarjeta `model.json`, generados con la herramienta `loom-next` (sin intervencion de un LLM en el proceso). El objetivo es ejecutar el modelo sobre GPUs AMD concretas mediante el runtime `loom-serve`.

El paquete esta orientado a dos aceleradores especificos: el AMD Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo base es un Qwen de 4B parametros, segun la nomenclatura del identificador, con una orientacion declarada hacia tareas de compilacion (el nombre "Compiler-Mind" sugiere un ajuste para razonamiento sobre codigo y compiladores, aunque la model card no detalla el dataset de entrenamiento). La licencia declarada es Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de empaquetado Loom para hardware AMD consumer y profesional; por otro, advierte de que las mediciones de rendimiento y las puertas de correccion del paquete no han sido re-medidas todavia, por lo que no hay evidencia publicada de su comportamiento frente a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen; la model card no detalla transformer, MoE ni hibrida) |
| Parametros totales | 4B (segun el identificador del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 40.960 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint original) empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base `Trivnpk/Qwen-Compiler-Mind-4B`: no se indica si es un transformer denso, un MoE o una variante hibrida, ni se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. El identificador sugiere una base Qwen de 4B parametros, pero este dato no se confirma en la documentacion proporcionada.

Lo que si documenta el paquete es la capa de despliegue. `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) a partir del GGUF original, y `loom-serve` los ejecuta sobre GPUs AMD mediante el runtime `hrx-loom`. El paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados y verificacion sha256 por parte de `loom-fetch`, ademas de `tokenizer.json`. La model card menciona soporte de modo razonamiento (thinking) activado por defecto y desactivable con `chat_template_kwargs: {"enable_thinking": false}`. No se documenta decodificacion especulativa (marcada como "not applicable") ni atencion lineal.

## Capacidades

- Generacion de texto conversacional a traves de una API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`, con soporte de bucles multi-turno de llamadas a herramientas.
- Modo razonamiento (thinking) activado por defecto; se puede desactivar por peticion mediante `chat_template_kwargs`.
- Contexto de 40.960 tokens por peticion, suficiente para documentos largos o historiales de conversacion extensos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por respuesta (limite del preset).
- Sin soporte de entrada de imagen ni de audio (marcado como "not applicable" en la model card).
- Sin decodificacion especulativa ni ajuste de esfuerzo de razonamiento ("reasoning effort" no aplicable).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia a la compilacion y depuracion de codigo: dado el nombre del modelo base ("Compiler-Mind"), es plausible usarlo para explicar errores de compilador, sugerir correcciones y razonar sobre trazas, aprovechando el modo thinking para descomponer el problema paso a paso.
- Agente de tool calling en local: el soporte de `tools` y `tool_calls` con bucles multi-turno permite construir agentes que consulten APIs internas, ejecuten comandos y encadenen pasos sin salir del equipo.
- Despliegue en estaciones de trabajo AMD: el paquete esta pensado para ejecutarse en Strix Halo y R9700 mediante `loom-serve`, lo que facilita probar modelos en hardware AMD sin depender de CUDA.
- Prototipado de asistentes conversacionales con contexto largo: los 40.960 tokens por peticion permiten mantener conversaciones o documentos de referencia extensos en memoria.
- Evaluacion de la cadena Loom: util como banco de pruebas para validar `loom-fetch`, `loom-serve` y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `agent`) en un modelo pequeno de 4B.
- Generacion de codigo en pipelines internos: con 4 peticiones concurrentes y salida de hasta 4.096 tokens, puede integrarse en tareas de revision o generacion de parches en un entorno controlado.
- Educacion y experimentacion: al ser un modelo de 4B en Q4_K_M, es adecuado para aprender a desplegar modelos con API OpenAI en GPUs AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no han sido re-medidas todavia" ("the results for this package are not yet re-measured").

Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran todas como "not yet re-measured" en ambas GPUs. Segun la propia model card, "una puerta sin una ejecucion registrada no muestra evidencia".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El modelo base es de 4B parametros en Q4_K_M; el paquete esta disenado para GPUs con 32 GB (R9700) y para el sistema integrado Strix Halo.
- GPU recomendadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPUs consumer AMD o NVIDIA; el runtime `loom-serve` se invoca con `--device=amdgpu://`, lo que apunta a un soporte centrado en AMD.
- Opciones de despliegue: `loom-fetch` para descargar el paquete y `loom-serve` para servirlo; requiere `pipx install "hrx-loom[hf]==0.2.0"`. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Parametros de ejecucion relevantes: `--pool_backing=fixed` (reserva el pool de memoria por adelantado) y `--parameter_mode=preload` (carga de pesos en host); `completion_spin_ns=4294967295` activa espera activa de finalizaciones de GPU.
- Latencia y throughput: no disponibles; las mediciones no han sido re-medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Trivnpk-Qwen-Compiler-Mind-4B-loom | 4B | 40.960 tokens | Apache 2.0 | GGUF empaquetado en `.loom`, runtime `loom-serve` | Paquete especifico para GPUs AMD Strix Halo y R9700; sin benchmarks publicados |
| Trivnpk/Qwen-Compiler-Mind-4B (base) | 4B | no disponible | Apache 2.0 (segun el paquete derivado) | GGUF (`qwen-compiler-mind-v3.2.1-Q4_K_M.gguf`) | Checkpoint original sin empaquetar; ejecutable con llama.cpp u otros runtimes GGUF |
| Alternativas Qwen de 4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de benchmarks y de puertas de correccion registradas: todas las metricas de rendimiento y correccion figuran como "not yet re-measured", por lo que no hay evidencia publicada de que el paquete iguale a llama.cpp en tokens greedy ni en log-probs.
- Modelo base poco documentado: no se detalla la arquitectura, el dataset de entrenamiento ni los idiomas soportados, lo que dificulta evaluar sesgos y calidad.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan mitigaciones especificas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de hardware: el paquete esta restringido a GPUs AMD concretas (gfx1151 y gfx1201); no se documenta compatibilidad con otras GPUs o backends.
- Limite de salida de 4.096 tokens y concurrencia de 4 peticiones, lo que puede ser insuficiente para cargas de produccion elevadas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `Trivnpk/Qwen-Compiler-Mind-4B` y de cualquier componente Qwen subyacente.
- Dependencia de una version concreta del runtime (`hrx-loom[hf]==0.2.0`) y de la verificacion sha256 de `loom-fetch`; cambios en el paquete o en el runtime pueden romper la reproducibilidad.
- El modelo es un empaquetado, no un fine-tune nuevo: las capacidades reales son las del checkpoint original, sin mejoras adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/Trivnpk-Qwen-Compiler-Mind-4B-loom
- Modelo base: https://huggingface.co/Trivnpk/Qwen-Compiler-Mind-4B
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
