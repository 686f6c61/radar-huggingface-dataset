# loom-draft/unsloth-granite-4.0-350m-loom

## Resumen

`loom-draft/unsloth-granite-4.0-350m-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `granite-4.0-350m-Q4_K_M.gguf` del repositorio `unsloth/granite-4.0-350m-GGUF`. El autor del paquete es `loom-draft`, y su funcion es servir el modelo base Granite 4.0 de 350 millones de parametros de IBM sobre GPUs AMD concretas mediante el runtime Loom (familia `hrx-loom`). No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los originales de Granite 4.0 350M en cuantizacion Q4_K_M.

El interes del paquete es de infraestructura, no de modelado. Loom genera kernels especificos para la GPU objetivo y expone una API compatible con OpenAI (`/v1/chat/completions`) con soporte de tool calling, 32.768 tokens de contexto por peticion y 4 peticiones concurrentes. Los objetivos declarados son el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB), dos plataformas donde el soporte de stacks de inferencia suele ser mas fragil que en CUDA.

La relevancia actual es acotada pero clara: permite ejecutar un modelo pequeno con tool calling sobre hardware AMD de consumo o workstation con un runtime nativo ROCm, sin depender de llama.cpp. La tarjeta es transparente sobre su estado: las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `agent`, `sampling`, etc.) figuran como "not yet re-measured" para ambas GPUs, por lo que no hay evidencia publicada de rendimiento ni de equivalencia numerica con la referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Granite 4.0 350M (detalle no disponible en la informacion proporcionada) |
| Parametros totales | 350 millones (segun el identificador del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 32.768 tokens por peticion (segun la tarjeta del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado en programas `.loom` (`program/*.loom`, `weights.loom`) |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo base: no se detallan numero de tokens, composicion del corpus, ni si hubo RLHF o DPO. Lo unico verificable es que se parte del checkpoint `granite-4.0-350m-Q4_K_M.gguf` de `unsloth/granite-4.0-350m-GGUF` "sin modificar", segun la propia tarjeta.

La innovacion tecnica esta en el runtime, no en el modelo. `loom-next` genera programas Loom especificos para la GPU objetivo (gfx1151 o gfx1201) a partir de los pesos y la configuracion (`llm_config.json`), incluyendo kernels propios que se validan contra implementaciones de referencia. El servidor `loom-serve` ofrece pooling de memoria fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). La tarjeta declara explicitamente que decodificacion especulativa, modo de razonamiento, vision y audio no aplican a este paquete.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`, con soporte de bucles multi-turno de llamadas a herramientas segun las puertas `agent` y `agent_think_off` descritas.
- Contexto de 32.768 tokens por peticion, suficiente para documentos medios y conversaciones largas.
- Concurrencia de hasta 4 peticiones simultaneas, con una puerta de consistencia (`consistency`) que verifica que la salida concurrente coincide con la secuencial.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Sin modo de razonamiento/thinking, sin decodificacion especulativa, sin entrada de imagen y sin audio: la tarjeta los marca como no aplicables.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y expone un endpoint compatible con OpenAI, lo que permite conectar clientes existentes sin adaptadores. Es adecuado por su huella reducida (350M en Q4_K_M) y su contexto de 32k.
- Agentes con herramientas en entornos ROCm: el soporte de `tools`/`tool_calls` y las puertas `agent` permiten construir bucles de llamada a funciones (consulta de APIs internas, calculo, acceso a ficheros) sobre hardware AMD donde el soporte de stacks CUDA no esta disponible.
- Clasificacion y enrutado de consultas: con 4 peticiones concurrentes y baja latencia esperable en un modelo de 350M, sirve como primera capa de triaje que decide a que modelo mayor derivar cada peticion.
- Prototipado y pruebas de integracion de pipelines LLM: al ofrecer una API identica a la de OpenAI, permite desarrollar y testear codigo de aplicacion contra un backend local antes de pasar a modelos mayores en produccion.
- Despliegue en equipos de desarrollo con GPU integrada: Strix Halo (Ryzen AI Max+ 395) es un SoC con GPU integrada; el paquete esta pensado para ese perfil, lo que facilita tener inferencia local en portatiles o mini-PC sin GPU dedicada.
- Validacion de kernels y del runtime Loom: investigadores que trabajen en ROCm pueden usar este paquete como caso de prueba pequeno para comparar la salida de Loom contra la referencia de llama.cpp registrada sobre el mismo GGUF.
- Generacion de texto breve y resumen en lotes: con 4.096 tokens de salida maxima y contexto de 32k, encaja en tareas de resumen de documentos cortos o generacion de descripciones en pipelines por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que las mediciones de rendimiento frente a llama.cpp "are not yet re-measured" tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como no re-medidas. No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El peso Q4_K_M de un modelo de 350M es del orden de 200-250 MB, pero la tarjeta no publica la huella real del pool de memoria de Loom.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras GPUs.
- Cabe en GPU de consumo: si, en las plataformas AMD indicadas; no hay informacion sobre compatibilidad con GPUs NVIDIA ni con otras Radeon.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`), descarga con `loom-fetch` y servicio con `loom-serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete, aunque se usa llama.cpp como referencia de correccion.
- Latencia y throughput: no disponibles; la tarjeta no incluye mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| `loom-draft/unsloth-granite-4.0-350m-loom` | 350M | 32.768 | Apache 2.0 | GGUF empaquetado en `.loom`, runtime Loom (ROCm) | Paquete de despliegue, no modelo nuevo; sin benchmarks publicados |
| `unsloth/granite-4.0-350m-GGUF` (modelo base) | 350M | no disponible en esta ficha | Apache 2.0 | GGUF, ejecutable con llama.cpp y derivados | Checkpoint original sin modificar del que parte el paquete |
| Alternativas de tamano similar (p. ej. Qwen3-0.6B, Llama-3.2-1B) | 0,6B-1,2B | no disponible en esta ficha | variable | GGUF, safetensors | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas; la comparativa anterior es estructural.

## Limitaciones y advertencias

- No hay evidencia publicada de correccion: todas las puertas de validacion estan marcadas como "not yet re-measured", por lo que no se ha demostrado que la salida coincida con la referencia de llama.cpp.
- Tampoco hay mediciones de rendimiento; no se puede afirmar que Loom sea mas rapido o mas lento que llama.cpp en estas GPUs.
- Modelo de 350M: capacidad de razonamiento, codigo y matematicas limitada en comparacion con modelos de varios miles de millones de parametros; el riesgo de alucinacion en tareas factuales es alto.
- Idiomas soportados no declarados; no se puede garantizar un rendimiento aceptable en castellano.
- Sin modo de razonamiento, sin vision, sin audio y sin decodificacion especulativa.
- Ambito de hardware restringido a gfx1151 y gfx1201; no hay informacion sobre otras GPUs ni sobre CPU.
- El paquete depende de una version concreta del runtime (`hrx-loom[hf]==0.2.0`) y de ficheros fijados por sha256; cambios de version pueden romper la reproducibilidad.
- Licencia Apache 2.0 en el paquete; el uso comercial esta permitido, pero conviene verificar la licencia del modelo base Granite 4.0 en su repositorio original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad.
- La busqueda web realizada devuelve resultados de la herramienta de grabacion de pantalla Loom y de la marca de ropa Loom, no relacionados con este runtime; no se han podido verificar enlaces externos adicionales.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/unsloth-granite-4.0-350m-loom
- Modelo base GGUF: https://huggingface.co/unsloth/granite-4.0-350m-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
