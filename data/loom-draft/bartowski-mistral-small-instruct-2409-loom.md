# loom-draft/bartowski-Mistral-Small-Instruct-2409-loom

## Resumen

`loom-draft/bartowski-Mistral-Small-Instruct-2409-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/Mistral-Small-Instruct-2409-GGUF`, en concreto la cuantizacion `Mistral-Small-Instruct-2409-Q4_K_M.gguf`. No es un modelo nuevo ni un ajuste fino: es una reempaquetado del modelo Mistral Small Instruct 2409 de Mistral AI para ejecutarse sobre el runtime Loom, herramienta asociada al ecosistema ROCm de AMD, en las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete lo publica el usuario `loom-draft` y se ha generado con `loom-next`, el generador de Loom, sin intervencion de un LLM en el bucle. Su relevancia es acotada pero concreta: permite servir Mistral Small Instruct 2409 mediante una API compatible con OpenAI (`/v1/chat/completions`) directamente sobre hardware AMD integrado o de escritorio, sin depender de llama.cpp ni de CUDA. La licencia declarada es MIT y la longitud de contexto configurada por peticion es de 131.072 tokens.

Conviene subrayar que el paquete no aporta pesos nuevos: la calidad del modelo subyacente es la de Mistral Small Instruct 2409 en cuantizacion Q4_K_M, mientras que el valor anadido esta en el formato de despliegue y en el soporte de hardware especifico. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, y las mediciones de rendimiento y las puertas de correccion aparecen como "not yet re-measured" para ambas GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del checkpoint base Mistral Small Instruct 2409; el paquete Loom no la redefine) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no se declara como MoE en la informacion disponible) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` y `weights.loom` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (pipx), servidor `loom-serve` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base ni su proceso de entrenamiento. Lo unico documentado es que el paquete Loom se genera a partir del GGUF `Mistral-Small-Instruct-2409-Q4_K_M.gguf` de bartowski, que a su vez es una cuantizacion Q4_K_M del checkpoint original de Mistral AI. No se aportan datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas del modelo subyacente.

En lo que respecta al propio paquete Loom, la innovacion es de infraestructura: `loom-next` genera programas `.loom` especificos para las arquitecturas graficas gfx1151 y gfx1201 a partir del GGUF, y `loom-serve` los ejecuta con opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `--pool_backing=fixed` (reserva de memoria por adelantado) y `--parameter_mode=preload` (carga de pesos en host). El paquete incluye `tokenizer.json`, `llm_config.json`, `model.json` y `model.json.lock` con hashes sha256 verificados por `loom-fetch`.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI en el endpoint `/v1/chat/completions`.
- Contexto largo: 131.072 tokens por peticion, adecuado para documentos extensos o historiales de conversacion amplios.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Tool calling: no aplicable segun la tabla de caracteristicas del paquete.
- Razonamiento / thinking mode: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat sobre GPU AMD integrada: desplegar un asistente conversacional en un equipo con Ryzen AI Max+ 395 "Strix Halo" usando `loom-serve`, sin GPU discreta ni CUDA, aprovechando el contexto de 131.072 tokens para conversaciones largas.
- Estacion de trabajo con Radeon AI PRO R9700: ejecutar el modelo en una GPU profesional de 32 GB mediante el preset `chat-r9700`, con API local compatible con OpenAI para integrarse en herramientas existentes que ya consumen ese formato.
- Procesamiento de documentos extensos: analisis o resumen de contratos, informes o documentacion tecnica de decenas de miles de tokens en una sola peticion, gracias a la ventana de contexto configurada.
- Evaluacion de la cadena de herramientas Loom: uso del paquete como banco de pruebas para validar `loom-fetch`, `loom-serve` y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`) frente a la referencia de llama.cpp sobre el mismo GGUF.
- Desarrollo local sin conexion: al materializarse los ficheros con `--materialize=copy` y verificar hashes sha256, el paquete puede desplegarse en entornos aislados con `pipx install "hrx-loom[hf]==0.2.0"`.
- Integracion en pipelines internos: cualquier cliente que hable el protocolo de chat completions de OpenAI puede apuntar a `http://127.0.0.1:8080/v1/chat/completions` y sustituir un backend en la nube por este servicio local, manteniendo el mismo contrato de API.
- Comparacion de rendimiento entre backends: el paquete esta disenado para medirse frente a llama.cpp en el mismo GGUF, lo que permite evaluar la madurez del runtime Loom en hardware AMD concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured". Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPU, por lo que no existe evidencia registrada de correccion ni de rendimiento para este paquete.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete esta pensado para ejecutarse en Radeon AI PRO R9700 con 32 GB y en Ryzen AI Max+ 395 "Strix Halo" (memoria unificada), pero la informacion no detalla el consumo exacto en Q4_K_M.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no disponible; la informacion solo menciona los dos aceleradores AMD anteriores.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` con el preset `chat` (Strix Halo) o `chat-r9700` (R9700) y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; llama.cpp se menciona unicamente como referencia de correccion contra la que se comparan las salidas.
- Latencia y throughput: no disponibles; las mediciones frente a llama.cpp estan pendientes de re-medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo | Rendimiento publicado |
|---|---|---|---|---|---|---|
| loom-draft/bartowski-Mistral-Small-Instruct-2409-loom | no disponible | 131.072 tokens | GGUF empaquetado en `.loom` | MIT | AMD Strix Halo gfx1151 y Radeon AI PRO R9700 gfx1201 | no disponible (pendiente de re-medicion) |
| bartowski/Mistral-Small-Instruct-2409-GGUF (origen) | no disponible | no disponible | GGUF | no disponible en la informacion | Generico (llama.cpp y compatibles) | no disponible |
| Mistral Small Instruct 2409 (checkpoint original de Mistral AI) | no disponible | no disponible | safetensors (formato habitual del original) | no disponible en la informacion | Generico (GPU NVIDIA/AMD) | no disponible |

La comparacion se limita al linaje directo del paquete, ya que la informacion proporcionada no incluye datos de modelos alternativos de la misma categoria ni cifras de rendimiento que permitan una comparacion cuantitativa. No se dispone de parametros, contexto ni benchmarks del checkpoint original de Mistral AI en el material consultado.

## Limitaciones y advertencias

- El paquete no aporta pesos nuevos: cualquier limitacion del checkpoint Mistral Small Instruct 2409 en Q4_K_M (sesgos, alucinaciones, conocimiento desactualizado) se hereda sin cambios.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo original en precision completa; no se han publicado mediciones de esa degradacion para este paquete.
- No hay evidencia de correccion registrada: todas las puertas (`kernel_tests`, `golden`, `compare`, `consistency`, etc.) figuran como "not yet re-measured", por lo que no se ha verificado que las salidas coincidan con la referencia de llama.cpp.
- Tampoco hay mediciones de rendimiento publicadas para ninguna de las dos GPU objetivo.
- El estado de muestreo (temperature, top_k, seed) figura como "no determinado", lo que impide garantizar un comportamiento reproducible en produccion.
- Tool calling, thinking mode, decodificacion especulativa, vision y audio estan marcados como no aplicables; el modelo no debe usarse para flujos agenticos que dependan de esas capacidades.
- Limite de 4.096 tokens de salida por peticion y concurrencia maxima de 4 peticiones, lo que restringe escenarios de alto trafico.
- La informacion no especifica los idiomas soportados ni restricciones de uso comercial mas alla de la licencia MIT declarada; conviene verificar la licencia del checkpoint original de Mistral AI antes de un despliegue comercial.
- El repositorio registra 0 descargas y 0 likes, y fue creado en noviembre de 2026; se trata de un artefacto sin adopcion documentada.
- La busqueda web realizada no devuelve informacion tecnica sobre este paquete: los resultados corresponden al producto de grabacion de pantalla Loom y a una marca de ropa homonima, sin relacion con el modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Mistral-Small-Instruct-2409-loom
- GGUF de origen: https://huggingface.co/bartowski/Mistral-Small-Instruct-2409-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
