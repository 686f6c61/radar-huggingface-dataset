# loom-draft/TokenRhythm-NeoHorse-1-9B-loom

## Resumen

TokenRhythm-NeoHorse-1-9B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` para servir el checkpoint GGUF sin modificar `TokenRhythm/NeoHorse-1-9B-GGUF` (concretamente la variante Q4_K_M) sobre GPUs AMD. No se trata de un modelo entrenado por el autor, sino de un artefacto de empaquetado para el runtime Loom (`hrx-loom`), orientado a dos aceleradores concretos: el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, NeoHorse-1-9B, es un modelo de aproximadamente 9.000 millones de parámetros con soporte declarado de razonamiento (thinking mode), tool calling estilo OpenAI y una ventana de contexto de 262.144 tokens por petición. El paquete Loom expone una API compatible con `/v1/chat/completions`, admite hasta 4 peticiones concurrentes y limita la salida a 4.096 tokens por preset.

La relevancia de esta ficha es acotada: el paquete tiene 0 descargas y 0 likes en el momento de la consulta, no incluye mediciones de rendimiento ni de corrección registradas ("not yet re-measured" en todas las puertas de calidad) y depende de una herramienta de generación (`loom-next`) que no incorpora un LLM en el bucle. Es útil como ejemplo de empaquetado para el ecosistema AMD Loom, pero no aporta evidencia empírica sobre el modelo en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete Loom no documenta la arquitectura del modelo base; se sirve el GGUF sin modificar) |
| Parametros totales | ~9B (deducido del nombre NeoHorse-1-9B; no confirmado en la informacion disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica variante empaquetada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen) empaquetado como programas `.loom` y `weights.loom` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Aceleradores soportados | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (pipx) |
| Modelo base | TokenRhythm/NeoHorse-1-9B-GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base NeoHorse-1-9B en la documentacion proporcionada: la model card del paquete Loom solo describe el artefacto de despliegue, no el transformer ni los datos de entrenamiento. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento.

Lo que si se describe es la innovacion a nivel de despliegue: `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) a partir del GGUF original sin modificar los pesos, junto con un `model.json` que actua como tarjeta y fija las dependencias con hash SHA-256 verificado por `loom-fetch`. El paquete incluye `tokenizer.json` y `llm_config.json`, y el servidor `loom-serve` permite activar espera activa en las finalizaciones de GPU (`completion_spin_ns=4294967295`), fijar el pool de memoria por adelantado (`--pool_backing=fixed`) y precargar pesos en host (`--parameter_mode=preload`). No se declara decodificacion especulativa ni atencion lineal en este paquete.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento / thinking mode activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- Flujos de agente multi-turno con reutilizacion de historial (existe una puerta de validacion `agent` y `agent_think_off`, aunque sin mediciones registradas).
- Contexto largo: hasta 262.144 tokens por peticion, adecuado para documentos extensos.
- Concurrencia de hasta 4 peticiones simultaneas.
- No soporta entrada de imagen (image input: no aplicable).
- No soporta entrada ni salida de audio (no aplicable).
- No soporta decodificacion especulativa en este paquete (no aplicable).
- No aplica "reasoning effort" configurable (no aplicable).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la tabla de caracteristicas del autor.

## Casos de uso

- Despliegue local en Strix Halo: usar `loom-fetch` y `loom-serve` para levantar el modelo en un Ryzen AI Max+ 395 y exponer un endpoint compatible con OpenAI en `127.0.0.1:8080`, util para prototipos en hardware AMD integrado.
- Inferencia en Radeon AI PRO R9700: el paquete esta pensado para una GPU de 32 GB, lo que permite cargar el Q4_K_M completo y atender hasta 4 peticiones concurrentes en un servidor de gama de estacion de trabajo.
- Asistente conversacional con contexto largo: los 262.144 tokens por peticion permiten resumir o consultar documentacion extensa sin trocear, siempre que se acepte el limite de 4.096 tokens de salida.
- Agente con tool calling: integrar el endpoint en un orquestador que envie `tools` y consuma `tool_calls`, con thinking desactivado para reducir latencia en bucles de agente.
- Evaluacion comparativa frente a llama.cpp: el paquete define puertas de correccion (`golden`, `compare`, `logits`, `agent`) que permiten contrastar la salida token a token con la referencia de llama.cpp sobre el mismo GGUF, util para validar el runtime Loom.
- Reproducibilidad de despliegues: `model.json.lock` fija los ficheros fuente con SHA-256, lo que facilita reconstruir exactamente el mismo entorno en otra maquina AMD.
- Base para empaquetar otros GGUF: sirve como plantilla de como `loom-next` genera programas `.loom` para un checkpoint dado, sin intervencion de un LLM en el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y para Radeon AI PRO R9700 "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No se aportan cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete esta dirigido a una GPU de 32 GB (Radeon AI PRO R9700) y a Strix Halo (memoria unificada), lo que sugiere que el Q4_K_M de un modelo de ~9B cabe holgadamente en ambos.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se mencionan GPUs NVIDIA ni otras arquitecturas.
- Cabe en GPU de consumo: no disponible; el paquete solo declara soporte para los dos aceleradores AMD citados.
- Opciones de despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete, aunque llama.cpp se usa como referencia de comparacion.
- Latencia y throughput: no disponibles (no hay mediciones registradas).
- Ajustes de rendimiento documentados: `completion_spin_ns=4294967295` (espera activa), `--pool_backing=fixed` (pool fijo) y `--parameter_mode=preload` (precarga en host).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion fiable con alternativas de la misma categoria. Como referencia estructural, el unico punto de comparacion mencionado es llama.cpp, utilizado como implementacion de referencia para las puertas de correccion, pero sin cifras publicadas.

## Limitaciones y advertencias

- Ausencia total de evidencia empirica: todas las puertas de correccion y las mediciones de rendimiento figuran como "not yet re-measured"; no hay benchmarks ni validaciones registradas.
- Paquete con 0 descargas y 0 likes: no hay senal de uso ni de validacion por parte de la comunidad.
- Soporte de hardware restringido a dos aceleradores AMD concretos (gfx1151 y gfx1201); no se declara compatibilidad con otras GPUs.
- Limite de salida de 4.096 tokens por preset, que puede ser insuficiente para generacion larga.
- Concurrencia maxima de 4 peticiones, baja para cargas de produccion con trafico elevado.
- Estado de muestreo "no determinado": el comportamiento de temperature, top_k y seed no esta verificado.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas.
- Arquitectura, datos de entrenamiento y sesgos del modelo base no documentados en esta ficha; las advertencias sobre alucinacion o sesgos del modelo NeoHorse-1-9B no pueden evaluarse con la informacion disponible.
- Licencia Apache 2.0 declarada en el paquete, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base en su repositorio original antes de desplegar en produccion.
- El paquete se genera con `loom-next` sin LLM en el bucle; la calidad de los kernels generados no esta validada por mediciones publicadas en esta tarjeta.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/TokenRhythm-NeoHorse-1-9B-loom
- Modelo base GGUF: https://huggingface.co/TokenRhythm/NeoHorse-1-9B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
