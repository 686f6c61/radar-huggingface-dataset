# loom-draft/unsloth-gemma-4-E2B-it-loom

## Resumen

`loom-draft/unsloth-gemma-4-E2B-it-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `unsloth/gemma-4-E2B-it-GGUF`, concretamente la cuantizacion `gemma-4-E2B-it-Q4_K_M.gguf`. Lo genera la herramienta `loom-next` (sin intervencion de un LLM en el bucle) y lo publica el usuario `loom-draft`. No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado para servir el modelo base Gemma 4 E2B instruct en GPUs AMD concretas.

El destino son dos aceleradores: el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se sirve con `loom-serve` del ecosistema Loom (proyecto `hrx-loom`, version 0.2.0) y expone una API compatible con OpenAI en `/v1/chat/completions`. El modelo subyacente es multimodal (entrada de imagen y texto) con soporte de tool calling y modo de razonamiento opcional, y una ventana de contexto de 131.072 tokens por peticion.

La relevancia es acotada pero concreta: ofrece una via de despliegue nativo en ROCm para silicio AMD reciente que habitualmente queda fuera de las rutas optimizadas de llama.cpp o vLLM. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano reportado es de 0.0 GB, por lo que debe tratarse como un artefacto experimental en fase temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; la tarjeta no detalla la arquitectura interna) |
| Parametros totales | no disponible (la nomenclatura "E2B" del modelo base sugiere un modelo eficiente de ~2B, sin confirmacion en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado en formato Loom (`.loom`, `weights.loom`, `model.json`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Gemma 4 E2B instruct ni sus datos de entrenamiento (numero de tokens, composicion del corpus, si hubo RLHF, DPO u otras fases de alineamiento). Lo que si consta es que este repositorio no entrena ni modifica pesos: toma el GGUF `gemma-4-E2B-it-Q4_K_M.gguf` de `unsloth/gemma-4-E2B-it-GGUF` y genera, mediante `loom-next`, un conjunto de programas `.loom` y un `model.json` que describen como ejecutar ese checkpoint en las GPUs AMD objetivo.

La innovacion tecnica del paquete es el propio runtime Loom: kernels generados para gfx1151 y gfx1201, un pool de memoria fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). La tarjeta declara compatibilidad con decodificacion especulativa como "not applicable" y no documenta mecanismos propios de atencion lineal ni decodificacion especulativa en este paquete.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat propia del modelo base.
- Entrada de imagen ademas de texto (pipeline `image-text-to-text`), mediante proyector `mmproj-BF16.gguf` y partes `image_url` al estilo OpenAI.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles de agente multi-turno segun las puertas de correccion `agent` y `agent_think_off`.
- Modo de razonamiento o thinking opcional: desactivado por defecto, se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Servidor compatible con OpenAI en `/v1/chat/completions`.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por peticion (preset `max_tokens`).
- Sin soporte de audio en Loom, aunque el modelo base lo tenga segun la tarjeta.
- El "reasoning effort" no aplica en este paquete.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con Strix Halo: el paquete permite levantar un endpoint compatible con OpenAI en una APU AMD Ryzen AI Max+ 395 sin depender de CUDA, con contexto de 131.072 tokens para conversaciones largas o documentos extensos.
- Procesamiento de documentos con imagenes en el borde: al aceptar entradas `image_url`, sirve para extraer y razonar sobre capturas, formularios escaneados o diagramas en un flujo local, sin enviar datos a la nube.
- Agentes con tool calling en pipelines internos: el soporte de `tools`/`tool_calls` y las puertas de correccion de agente permiten construir bucles de razonamiento multi-paso que invoquen APIs internas o funciones locales.
- Prototipado de aplicaciones sobre Radeon AI PRO R9700: con 32 GB de VRAM y un Q4_K_M, la R9700 puede alojar el modelo y el proyector de vision con holgura para desarrollo y pruebas de integracion.
- Evaluacion comparativa de runtimes en AMD: util para medir el rendimiento de Loom frente a llama.cpp sobre el mismo GGUF, ya que la tarjeta define puertas de correccion (`golden`, `compare`, `vision`, `consistency`) que contrastan contra la referencia de llama.cpp.
- Servicio de inferencia de baja concurrencia: con 4 peticiones concurrentes y 4.096 tokens de salida maxima, encaja en herramientas internas de equipo pequeno, demos y asistentes de documentacion.
- Clasificacion y decision asistida: la puerta `decision` de la tarjeta sugiere uso para respuestas de eleccion y puntuacion comparadas contra llama.cpp, aplicable a tareas de enrutado o puntuacion de candidatos.

## Benchmarks y rendimiento

La tarjeta no incluye resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares). Las secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) indican explicitamente que "the results for this package are not yet re-measured". Todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M y el proyector de vision es BF16, y la R9700 dispone de 32 GB.
- No se documenta compatibilidad con GPUs NVIDIA ni con Apple Silicon; el runtime Loom del paquete se distribuye para `amdgpu://`.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/unsloth-gemma-4-E2B-it-loom:chat --materialize=copy --output=gemma-4-e2b-it` y `loom-serve --model=gemma-4-e2b-it '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue (llama.cpp, Ollama, vLLM, TGI): no documentadas en la informacion disponible para este paquete; la tarjeta solo usa llama.cpp como referencia de correccion, no como ruta de servicio.
- Latencia y throughput: no disponibles; pendientes de re-medicion segun la propia tarjeta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-draft/unsloth-gemma-4-E2B-it-loom` | no disponible | 131.072 | Loom (GGUF Q4_K_M empaquetado) | Apache 2.0 | Solo GPUs AMD gfx1151 y gfx1201; sin benchmarks publicados |
| `unsloth/gemma-4-E2B-it-GGUF` | no disponible | no disponible | GGUF | no disponible en esta ficha | Checkpoint origen del paquete; sirve como referencia directa |
| Gemma 4 E2B instruct (modelo base) | no disponible | no disponible | safetensors/GGUF segun distribucion | no disponible en esta ficha | Modelo upstream del que deriva el GGUF |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a formato, licencia y plataforma de destino.

## Limitaciones y advertencias

- Artefacto experimental: 0 descargas, 0 likes, repositorio de 0.0 GB y creado y actualizado el mismo dia (2026-11-19), lo que sugiere un estado muy temprano.
- Sin evidencia de correccion registrada: todas las puertas de la tarjeta estan "not yet re-measured", incluida la comparacion contra llama.cpp y la consistencia bajo concurrencia.
- Sin benchmarks de rendimiento ni de calidad publicados para este paquete.
- Dependencia de un runtime especifico (`hrx-loom==0.2.0`) y de dos GPUs AMD concretas; no hay ruta documentada para NVIDIA, Apple Silicon ni CPU.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens, lo que restringe escenarios de alta carga o generaciones largas.
- Sin soporte de audio en Loom aunque el modelo base lo tenga, segun la propia tarjeta.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingue sin verificar el modelo base.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse sobre el modelo base Gemma 4 E2B instruct.
- Licencia Apache 2.0 declarada en la tarjeta, permisiva para uso comercial, pero conviene verificar que se aplica tambien al checkpoint base y al proyector de vision.
- La busqueda web realizada no devuelve informacion relevante sobre este modelo: los resultados corresponden a productos homonimos no relacionados (Loom la herramienta de grabacion de pantalla y Loom la marca de ropa), por lo que no aportan datos tecnicos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-gemma-4-E2B-it-loom
- Modelo base (GGUF): https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
