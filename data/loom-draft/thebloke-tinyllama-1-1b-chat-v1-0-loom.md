# loom-draft/TheBloke-TinyLlama-1.1B-Chat-v1.0-loom

## Resumen

TheBloke-TinyLlama-1.1B-Chat-v1.0-loom es un paquete de despliegue para la plataforma Loom de AMD, no un modelo entrenado desde cero. Contiene los programas `.loom` generados y una tarjeta `model.json` que permiten ejecutar el checkpoint GGUF sin modificar `tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf`, publicado originalmente por TheBloke. El autor del paquete es `loom-draft` y la generacion se realizo con la herramienta `loom-next`, sin intervencion de un LLM en el proceso.

El modelo subyacente es TinyLlama 1.1B Chat v1.0, un transformer decoder-only de aproximadamente 1.100 millones de parametros, ajustado para conversacion. Este empaquetado esta orientado especificamente a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB), y expone un servidor compatible con la API de chat de OpenAI en `127.0.0.1:8080/v1/chat/completions`.

Su relevancia es de nicho: demuestra el flujo de trabajo de Loom para empaquetar y servir modelos GGUF en hardware AMD con ROCm, con una ventana de contexto limitada a 2.048 tokens por peticion y 4 peticiones concurrentes. No incluye tool calling, razonamiento extendido, decodificacion especulativa ni entrada de imagen o audio. Las mediciones de rendimiento y las puertas de correccion figuran como "not yet re-measured" en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de TinyLlama 1.1B) |
| Parametros totales | ~1.100 millones (modelo base TinyLlama 1.1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo: reutiliza el checkpoint GGUF `tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf` de TheBloke, derivado de TinyLlama 1.1B Chat v1.0. La contribucion tecnica de este repositorio es la generacion automatica de kernels y programas Loom especificos para las arquitecturas GPU gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700), realizada con `loom-next`, el generador, sin LLM en el bucle.

El paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados y verificacion sha256 por `loom-fetch`, los programas `program/*.loom` y `weights.loom`, el `tokenizer.json`, el `llm_config.json` desde el que se generaron los programas y un `info.json` con mediciones y evidencia de las puertas de correccion. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO, ya que esa informacion corresponde al modelo base y no se reproduce en esta model card.

## Capacidades

- Generacion de texto conversacional mediante endpoint compatible con `/v1/chat/completions` al estilo OpenAI.
- Servicio concurrente de hasta 4 peticiones simultaneas.
- Salida maxima de 2.048 tokens por peticion (preset `max_tokens`).
- Contexto de 2.048 tokens por peticion.
- Tool calling: no aplicable segun la model card.
- Razonamiento o modo thinking: no aplicable.
- Esfuerzo de razonamiento (reasoning effort): no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la model card.

## Casos de uso

- Despliegue de referencia en hardware AMD: validar el flujo completo de Loom (`loom-fetch` y `loom-serve`) sobre una Ryzen AI Max+ 395 o una Radeon AI PRO R9700 antes de pasar a modelos de mayor tamano.
- Prototipado de chatbots ligeros: con 2.048 tokens de contexto y 2.048 de salida maxima, sirve para asistentes de conversacion corta en entornos de desarrollo o demos internas.
- Pruebas de integracion con clientes compatibles con OpenAI: el endpoint `/v1/chat/completions` permite apuntar SDKs existentes al servidor local sin cambios de codigo.
- Evaluacion de concurrencia: con 4 peticiones concurrentes se puede medir el comportamiento del servidor bajo carga moderada en las GPU objetivo.
- Benchmarking comparativo con llama.cpp: la model card define puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`, `logits`, entre otras) pensadas para contrastar la salida de Loom contra la referencia de llama.cpp sobre el mismo GGUF.
- Educacion y experimentacion con ROCm: util para estudiar como se materializa un GGUF en programas `.loom` y como se gestionan pools de memoria fijos (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`).
- Pruebas de inferencia en GPU de consumo profesional: la Radeon AI PRO R9700 con 32 GB permite alojar el modelo Q4_K_M con holgura y validar latencia en un entorno de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para ambas GPU (Strix Halo gfx1151 y Radeon AI PRO R9700 gfx1201) "are not yet re-measured", y que todas las puertas de correccion figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de ~1,1B de parametros, por lo que el peso de los pesos ronda el rango de cientos de MB a ~1 GB, pero la model card no publica la cifra exacta.
- GPU soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPU de consumo NVIDIA o AMD distintas de las anteriores; no disponible.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; el modelo base GGUF es compatible con llama.cpp por su formato, pero este repositorio no lo cubre.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card estan pendientes de re-medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| TheBloke-TinyLlama-1.1B-Chat-v1.0-loom | ~1,1B | 2.048 tokens | GGUF Q4_K_M empaquetado en `.loom` | Apache 2.0 | Paquete de despliegue para GPU AMD via Loom |
| TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF | ~1,1B | no disponible en la informacion | GGUF | Apache 2.0 | Checkpoint GGUF de referencia para llama.cpp y derivados |
| TinyLlama-1.1B-Chat-v1.0 (original) | ~1,1B | no disponible en la informacion | safetensors y otros | Apache 2.0 | Modelo base conversacional de 1,1B |

La comparativa se limita al linaje directo del modelo; no se dispone de datos de rendimiento comparado con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo base es TinyLlama 1.1B, con capacidad limitada en razonamiento, codigo y matematicas frente a modelos de mayor tamano.
- Ventana de contexto de solo 2.048 tokens por peticion, insuficiente para documentos largos o conversaciones extensas.
- Concurrencia maxima de 4 peticiones; no apto para cargas de produccion de alta demanda.
- Sin soporte de tool calling, modo thinking, decodificacion especulativa, vision ni audio.
- Estado del muestreo (temperature, top_k, seed) marcado como "no determinado" en la model card.
- Las puertas de correccion y las mediciones de rendimiento no estan re-medidas; no hay evidencia publicada de que la salida coincida token a token con llama.cpp en las GPU objetivo.
- El paquete esta atado a versiones concretas: `hrx-loom[hf]==0.2.0` y las GPU gfx1151 y gfx1201; no se documenta compatibilidad con otras GPU.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los del modelo base TinyLlama 1.1B Chat.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del checkpoint GGUF original de TheBloke.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/TheBloke-TinyLlama-1.1B-Chat-v1.0-loom
- Modelo base GGUF: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
