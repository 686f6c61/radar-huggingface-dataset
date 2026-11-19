# loom-draft/unsloth-granite-4.1-3b-loom

## Resumen

`loom-draft/unsloth-granite-4.1-3b-loom` no es un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (`.loom` y `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/granite-4.1-3b-GGUF`, en su cuantizacion Q4_K_M. El paquete lo publica el usuario `loom-draft` y esta pensado para ejecutar el modelo sobre GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). La generacion se ha hecho con la herramienta `loom-next`, sin intervencion de un LLM en el proceso.

El modelo subyacente es Granite 4.1 3B de IBM, un transformer denso de aproximadamente 3.000 millones de parametros, distribuido bajo licencia Apache 2.0. Loom actua como runtime alternativo a llama.cpp: expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling y hasta cuatro peticiones concurrentes con una ventana de contexto de 131.072 tokens por peticion.

La relevancia de esta ficha es acotada: el interes esta en el formato de empaquetado y en el soporte de hardware AMD (ROCm) mas que en capacidades nuevas del modelo. El autor no ha publicado mediciones de rendimiento ni resultados de las puertas de correctitud (`kernel_tests`, `golden`, `compare`, etc.), por lo que la validacion practica queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Granite 4.1 3B); paquete de despliegue Loom sobre GGUF |
| Parametros totales | 3B (aproximado, segun el nombre del checkpoint base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`granite-4.1-3b-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Si, estilo OpenAI (`tools` y `tool_calls`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El modelo subyacente es Granite 4.1 3B de IBM, un transformer denso de unos 3.000 millones de parametros. La model card del paquete no aporta informacion sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF/DPO o innovaciones como decodificacion especulativa); esos datos corresponden a la documentacion oficial de IBM y no estan incluidos en la informacion disponible.

Lo especifico de este repositorio es la capa de despliegue. `loom-next` genera programas `.loom` (kernels y logica de inferencia) y un `model.json` a partir de la configuracion del checkpoint (`llm_config.json`), junto con el tokenizador y los pesos en `weights.loom`. El paquete incluye un `model.json.lock` con los ficheros fuente fijados y verificados por sha256 en `loom-fetch`. Segun la model card, el checkpoint GGUF es "unmodified", es decir, no hay fine-tuning ni alteracion de pesos: solo cambia el motor de ejecucion. El paquete declara soporte para tool calling, contexto de 131.072 tokens y concurrencia de 4 peticiones, pero no para razonamiento explicito (thinking), decodificacion especulativa, vision ni audio.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI.
- Tool calling / function calling en formato OpenAI (`tools` y `tool_calls`), con bucles multi-turno de agentes segun la puerta `agent` descrita.
- Contexto largo: 131.072 tokens por peticion, adecuado para documentos extensos o historiales de conversacion largos.
- Concurrencia de hasta 4 peticiones simultaneas por instancia.
- Salida limitada a 4.096 tokens por respuesta (preset `max_tokens`).
- Sin modo de razonamiento o thinking (marcado como "not applicable").
- Sin decodificacion especulativa.
- Sin entrada de imagen ni audio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y expone un endpoint compatible con OpenAI, lo que permite conectar clientes existentes sin adaptadores.
- Procesamiento de documentos largos: con 131.072 tokens de contexto por peticion, se pueden resumir o consultar contratos, informes o bases de codigo de decenas de miles de palabras en una sola llamada.
- Agentes con herramientas en local: el soporte de `tools` y `tool_calls` permite construir asistentes que consulten APIs internas o bases de datos sin enviar datos a la nube, relevante en entornos con requisitos de privacidad.
- Prototipado en hardware AMD de consumo profesional: la R9700 de 32 GB y Strix Halo permiten desplegar el modelo Q4_K_M en una sola maquina, util para laboratorios y equipos sin GPUs NVIDIA.
- Evaluacion comparativa de runtimes: al estar generado a partir del mismo GGUF que usa llama.cpp, sirve para contrastar el comportamiento de Loom frente a llama.cpp con las mismas entradas (puertas `golden` y `compare`).
- Backend de bajo nivel para pipelines internos: la API HTTP permite integrarlo en servicios de enriquecimiento de texto, clasificacion o generacion de borradores dentro de una infraestructura on-premise.
- Docencia y experimentacion con ROCm: el paquete es un ejemplo reproducible de compilacion de kernels para gfx1151 y gfx1201 a partir de un modelo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que ninguna de las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) tiene evidencia registrada para este paquete.

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de un modelo de 3B ocupa aproximadamente 2 GB de pesos; el pool de memoria de Loom se reserva por adelantado con `--pool_backing=fixed`, por lo que el consumo real depende del preset y del contexto configurado (hasta 131.072 tokens).
- GPUs soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: el modelo cabe holgadamente en cualquier GPU con 8 GB o mas de VRAM; sin embargo, este paquete solo declara soporte para las dos GPUs AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este repositorio, aunque el GGUF original si es compatible con llama.cpp.
- Opciones de servicio: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU).
- Latencia y throughput: no disponibles; el autor no ha publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-draft/unsloth-granite-4.1-3b-loom | 3B (denso) | 131.072 | Loom (GGUF Q4_K_M) | Apache 2.0 | Runtime Loom sobre AMD; sin benchmarks publicados |
| unsloth/granite-4.1-3b-GGUF | 3B (denso) | no disponible en la informacion | GGUF | Apache 2.0 | Checkpoint base sin modificar; compatible con llama.cpp |
| Granite 4.1 3B (IBM, original) | 3B (denso) | no disponible en la informacion | safetensors | Apache 2.0 | Modelo de referencia del que derivan los anteriores |
| Llama 3.2 3B | 3B (denso) | 128.000 | safetensors, GGUF | Llama 3.2 Community License | Alternativa de tamano similar con licencia no Apache |

La comparacion con Llama 3.2 3B se incluye por tamano y categoria, pero no se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no aporta ninguna medicion de rendimiento ni evidencia de correctitud: todas las puertas de validacion figuran como "not yet re-measured". No debe asumirse paridad funcional con llama.cpp sin verificacion propia.
- El paquete esta generado para dos GPUs AMD concretas (gfx1151 y gfx1201); no se declara compatibilidad con otras arquitecturas.
- No hay informacion sobre sesgos del modelo base ni sobre su comportamiento en idiomas distintos del ingles; los idiomas soportados figuran como no disponibles.
- Riesgo de alucinacion inherente a un modelo de 3B: adecuado para tareas acotadas, no para decisiones de alta precision sin verificacion.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Granite 4.1 3B de IBM por si anaden terminos adicionales.
- La salida esta limitada a 4.096 tokens por respuesta y la concurrencia a 4 peticiones, lo que restringe su uso en escenarios de alto trafico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; no hay historial de mantenimiento.
- `completion_spin_ns=4294967295` activa espera activa en CPU durante la ejecucion en GPU, lo que incrementa el consumo de CPU del host.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-granite-4.1-3b-loom
- Modelo base (GGUF): https://huggingface.co/unsloth/granite-4.1-3b-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
