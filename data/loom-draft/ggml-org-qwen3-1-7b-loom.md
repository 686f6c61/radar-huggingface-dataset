# loom-draft/ggml-org-Qwen3-1.7B-loom

## Resumen

`loom-draft/ggml-org-Qwen3-1.7B-loom` no es un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom para el checkpoint GGUF sin modificar `ggml-org/Qwen3-1.7B-GGUF`, en su cuantizacion Q4_K_M. Lo publica el usuario `loom-draft` y esta generado con `loom-next`, un generador que produce programas `.loom` y una tarjeta `model.json` a partir del GGUF de referencia, sin intervencion de un LLM en el proceso. El objetivo es ejecutar Qwen3-1.7B sobre las GPU AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el runtime `hrx-loom`, con una API compatible con OpenAI.

La relevancia es de nicho pero concreta: permite servir un modelo de 1,7 mil millones de parametros en hardware AMD consumer y profesional sin depender de CUDA ni de una traduccion manual a otro backend. El paquete expone `/v1/chat/completions`, soporte de tool calling y modo de razonamiento, con contexto de 40.960 tokens por peticion y hasta 4 peticiones concurrentes.

Cabe advertir que el repositorio no incluye resultados de rendimiento ni de correccion medidos: todas las puertas de validacion (`kernel_tests`, `golden`, `compare`, `sampling`, etc.) figuran como "not yet re-measured" y la comparativa frente a llama.cpp esta pendiente. La informacion disponible describe el empaquetado y la interfaz, no el comportamiento empirico del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3; el paquete no la redefine) |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens por peticion (preset del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete distribuye los pesos ya cuantizados |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | Programas `.loom` (`program/*.loom`, `weights.loom`), generados desde GGUF Q4_K_M; incluye `tokenizer.json`, `llm_config.json`, `model.json` |
| Modelo base | ggml-org/Qwen3-1.7B-GGUF |
| Runtime | hrx-loom 0.2.0 (`loom-fetch`, `loom-serve`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Concurrencia | 4 peticiones simultaneas |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |

## Arquitectura y entrenamiento

El paquete no aporta entrenamiento propio: reutiliza el checkpoint Qwen3-1.7B publicado por `ggml-org` en formato GGUF, cuantizado en Q4_K_M, y lo traduce a programas Loom mediante `loom-next`. La model card no documenta la arquitectura interna del modelo base (numero de capas, dimensiones, atencion, composicion del dataset de preentrenamiento ni fases de RLHF/DPO), por lo que esos datos deben consultarse en la ficha del modelo original de Qwen3-1.7B. Lo que si describe el repositorio es la capa de ejecucion: kernels generados para las arquitecturas gfx1151 y gfx1201, un pool de memoria con dos modos (`fixed` y elastico), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`).

La innovacion tecnica del paquete es el propio pipeline de generacion y validacion. `loom-fetch` verifica el sha256 de los ficheros fuente fijados en `model.json.lock`; `loom-serve` levanta un servidor compatible con OpenAI. El repositorio define ademas un conjunto de puertas de correccion (`gates.sh`) que comparan los kernels generados contra implementaciones de referencia, el texto greedy contra llama.cpp sobre el mismo GGUF, la consistencia bajo concurrencia y el bucle de tool calling multi-turno. En la version publicada ninguna de esas puertas tiene medicion registrada.

## Capacidades

- Generacion de texto y razonamiento conversacional mediante `/v1/chat/completions` con esquema OpenAI.
- Modo de razonamiento (thinking) activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling con los campos `tools` y `tool_calls` en formato OpenAI.
- Bucles de agente multi-turno con reutilizacion de historial (segun la puerta `agent` definida, aunque sin medicion publicada).
- Concurrencia de hasta 4 peticiones simultaneas con salida consistente respecto a ejecuciones aisladas (puerta `consistency`, sin medicion publicada).
- Ventana de 40.960 tokens por peticion y hasta 4.096 tokens de salida.
- Sin soporte de entrada de imagen ni de audio (marcado como "not applicable").
- Sin decodificacion especulativa ("not applicable").
- El muestreo (`temperature`, `top_k`, `seed`) figura como "not determined" en la tabla de caracteristicas.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con GPU AMD: el paquete se sirve con `loom-serve` y expone una API OpenAI, de modo que cualquier cliente compatible puede apuntar a `http://127.0.0.1:8080/v1` sin adaptadores adicionales.
- Prototipado de agentes con tool calling en hardware Strix Halo: el soporte de `tools`/`tool_calls` y el bucle multi-turno permiten construir agentes que consulten APIs externas, con la salvedad de que la puerta `agent` aun no tiene medicion publicada.
- Procesamiento de documentos de hasta 40.960 tokens: resumen, extraccion de entidades o preguntas sobre contratos e informes en una sola peticion, util en entornos donde los datos no deben salir de la maquina.
- Evaluacion de la cadena de herramientas Loom: el repositorio sirve como caso de prueba para comparar los kernels generados contra llama.cpp sobre el mismo GGUF, gracias a las puertas `golden`, `compare` y `logits`.
- Despliegue en Radeon AI PRO R9700 para inferencia por lotes pequenos: con 4 peticiones concurrentes y 32 GB de VRAM, el modelo Q4_K_M deja margen para el pool de memoria fijo y otros procesos.
- Generacion de codigo y texto tecnico en local: Qwen3-1.7B es un modelo pequeno que cabe holgadamente en las GPU objetivo, adecuado para autocompletado o redaccion asistida sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y R9700, pero ambas indican que "the results for this package are not yet re-measured". Del mismo modo, la tabla de correccion muestra todas las puertas como "not yet re-measured", sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de 1,7B, por lo que el peso de los parametros ronda los 1 GB, pero el pool de memoria del preset y el contexto de 40.960 tokens anaden consumo no cuantificado en la ficha.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU consumer: no confirmada; el paquete esta generado especificamente para gfx1151 y gfx1201, no para CUDA ni para otras arquitecturas AMD.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas para este paquete concreto.
- Opciones de servido: `--pool_backing=fixed` (pool comprometido de antemano) o backing elastico; `--parameter_mode=preload` para precargar pesos en host; `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-draft/ggml-org-Qwen3-1.7B-loom | 1,7B | 40.960 tokens por peticion | Loom (`hrx-loom`), GPU AMD gfx1151/gfx1201 | Apache 2.0 | Hugging Face, 0 descargas |
| ggml-org/Qwen3-1.7B-GGUF (base) | 1,7B | no disponible en la informacion proporcionada | GGUF, ejecutable con llama.cpp y derivados | Apache 2.0 (heredada) | Hugging Face |
| Qwen3-1.7B (original) | 1,7B | no disponible en la informacion proporcionada | safetensors, transformers | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base porque la informacion proporcionada no incluye datos de rendimiento de ningun otro modelo de la misma categoria. La diferencia practica del paquete Loom frente al GGUF original es el backend de ejecucion (kernels generados para AMD) y la API servida, no el modelo en si.

## Limitaciones y advertencias

- Ausencia total de evidencia empirica: las puertas de correccion y las mediciones de rendimiento figuran como no re-medidas, por lo que no hay garantia publicada de que la salida coincida con llama.cpp.
- El muestreo (`temperature`, `top_k`, `seed`) esta marcado como "not determined"; el comportamiento de la distribucion de primer token no esta verificado.
- El paquete esta acoplado a dos arquitecturas AMD concretas (gfx1151 y gfx1201); no es portable a CUDA, a otras GPU AMD ni a CPU sin regenerar los programas.
- La model card no declara los idiomas soportados ni los sesgos conocidos del modelo base; esas advertencias deben tomarse de la ficha de Qwen3-1.7B.
- Riesgo de alucinacion inherente a un modelo de 1,7B, no mitigado ni documentado en este repositorio.
- El contexto de 40.960 tokens por peticion puede degradar la calidad en documentos largos; no hay evaluacion publicada al respecto.
- Licencia Apache 2.0 permite uso comercial, pero el paquete depende de `hrx-loom` 0.2.0 y de las condiciones de ese runtime, no cubiertas en la informacion proporcionada.
- Repositorio sin descargas ni likes en el momento de la consulta; no hay comunidad que valide el paquete.
- La busqueda web no devolvio resultados relacionados con este proyecto: los enlaces encontrados corresponden a Loom (grabador de pantalla) y a una marca de ropa homonima, sin relacion con el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen3-1.7B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3-1.7B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
