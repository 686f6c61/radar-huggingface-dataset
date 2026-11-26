# loom-draft/unsloth-Devstral-Small-2505-loom

## Resumen

`loom-draft/unsloth-Devstral-Small-2505-loom` no es un modelo nuevo, sino un paquete de despliegue para el runtime Loom de AMD que empaqueta el checkpoint GGUF `Devstral-Small-2505-Q4_K_M.gguf` de Unsloth, derivado a su vez de Devstral-Small-2505 de Mistral AI. El paquete contiene programas `.loom` generados por `loom-next`, una tarjeta `model.json`, el tokenizador y la configuracion de inferencia, y esta orientado a dos aceleradores concretos: el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El interes del artefacto es de infraestructura mas que de modelado: permite servir un modelo de codigo de Mistral en hardware AMD mediante una API compatible con OpenAI (`/v1/chat/completions`), con un contexto declarado de 131.072 tokens por peticion y 4 peticiones concurrentes. No incorpora pesos nuevos ni fine-tuning propio; la licencia declarada es MIT, heredada de la cadena de modelos base.

La model card es explicita sobre el estado de validacion: todas las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured", y las comparativas de rendimiento frente a llama.cpp en ambas GPUs tampoco se han vuelto a medir. Es, por tanto, un paquete recien generado y sin evidencia publicada de calidad ni de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Devstral-Small-2505; el paquete no la documenta) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF empaquetado en programas `.loom` (`program/*.loom`, `weights.loom`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo subyacente; se limita a referenciar el GGUF `Devstral-Small-2505-Q4_K_M.gguf` de `unsloth/Devstral-Small-2505-GGUF`. No hay informacion en la model card sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si el modelo base recibio RLHF, DPO u otras fases de alineamiento. Cualquier dato de arquitectura o entrenamiento debe consultarse en la ficha del modelo base de Mistral AI o en la del GGUF de Unsloth, no en este repositorio.

La innovacion tecnica del artefacto esta en la capa de despliegue: `loom-next` genera programas `.loom` y kernels especificos para las arquitecturas gfx1151 y gfx1201 a partir de la configuracion del modelo (`llm_config.json`), sin intervencion de un LLM en el bucle de generacion. El paquete incluye un `model.json.lock` con los hashes sha256 de los ficheros de origen, que `loom-fetch` verifica. La model card menciona soporte de decodificacion especulativa y de modo de razonamiento en la tabla de caracteristicas, pero ambos aparecen como "not applicable" para este paquete.

## Capacidades

- Generacion de texto y codigo mediante API compatible con OpenAI (`/v1/chat/completions`).
- Contexto largo: 131.072 tokens por peticion, adecuado para repositorios y documentos extensos.
- Concurrencia de 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Tool calling: marcado como "not applicable" en la tabla de caracteristicas del paquete.
- Razonamiento / thinking mode: marcado como "not applicable".
- Ajuste de esfuerzo de razonamiento: marcado como "not applicable".
- Decodificacion especulativa: marcada como "not applicable".
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream la soporta.
- Entrada y salida de audio: "not applicable".
- Muestreo (temperature, top_k, seed): estado "not determined"; la puerta `sampling` no se ha re-medido.
- Multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo autohospedado en estaciones AMD: servir el modelo con `loom-serve` en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700 permite disponer de un endpoint compatible con OpenAI en hardware AMD sin depender de CUDA, usando el GGUF Q4_K_M ya empaquetado.
- Revision de repositorios completos: con 131.072 tokens de contexto por peticion se pueden enviar arboles de codigo, diffs extensos o documentacion tecnica completa en una sola llamada, util para auditorias de cambios o generacion de resumenes de PR.
- Integracion en pipelines de CI/CD: el endpoint `/v1/chat/completions` permite invocar el modelo desde scripts de integracion para generar descripciones de commits, sugerir parches o clasificar fallos de test, siempre que se asuma la ausencia de tool calling nativo en este paquete.
- Prototipado de agentes con contexto largo: la ventana de 131k tokens y la concurrencia de 4 permiten mantener historiales de conversacion extensos en pruebas de agentes, aunque el bucle multi-turno con herramientas (`agent`, `agent_think_off`) no cuenta con evidencia registrada.
- Despliegue en laboratorio con hardware AMD de consumo profesional: la Radeon AI PRO R9700 de 32 GB es el objetivo declarado para la variante `chat-r9700`, lo que facilita montar un nodo de inferencia local sin GPU NVIDIA.
- Evaluacion comparativa de runtimes: al estar construido sobre el mismo GGUF que usa llama.cpp como referencia, el paquete sirve para comparar el rendimiento y la fidelidad de Loom frente a llama.cpp en las mismas condiciones, una vez se publiquen las mediciones pendientes.
- Servicio interno de documentacion tecnica: el contexto largo y la API estandar permiten montar un asistente sobre manuales y bases de conocimiento internas, con la cautela de que el muestreo y la consistencia bajo concurrencia no estan validados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las comparativas de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correctitud figuran como "not yet re-measured" en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; el paquete se distribuye en Q4_K_M y esta pensado para la Radeon AI PRO R9700 de 32 GB y para la memoria unificada del Ryzen AI Max+ 395.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera kernels para arquitecturas AMD gfx1151 y gfx1201.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` con el preset `chat` (Strix Halo) o `chat-r9700` (R9700) y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; el autor solo describe el flujo con Loom.
- Latencia y throughput: no disponibles; las mediciones frente a llama.cpp estan pendientes de re-medicion en ambas GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo | Estado de validacion |
|---|---|---|---|---|---|---|
| loom-draft/unsloth-Devstral-Small-2505-loom | no disponible | 131.072 tokens | Q4_K_M | MIT | AMD gfx1151 y gfx1201 | Puertas de correctitud y rendimiento sin re-medir |
| unsloth/Devstral-Small-2505-GGUF (modelo base del paquete) | no disponible | no disponible en la informacion proporcionada | GGUF (incluye Q4_K_M) | MIT (segun este paquete) | Generico (llama.cpp y otros runtimes GGUF) | No disponible |
| Devstral-Small-2505 (modelo original de Mistral AI) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible | No disponible |

La comparacion relevante es frente al propio GGUF de Unsloth ejecutado en llama.cpp, que la model card usa como referencia de correctitud (`golden`, `compare`) y de rendimiento. Los datos de esa comparacion aun no se han publicado.

## Limitaciones y advertencias

- Ausencia total de evidencia de correctitud: las once puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs; no hay prueba publicada de que las salidas coincidan con llama.cpp.
- Rendimiento sin medir: no hay cifras de latencia ni throughput frente a llama.cpp para Strix Halo ni para R9700.
- Muestreo no determinado: el estado de `sampling` es "?", por lo que no esta confirmado que temperature, top_k y seed se comporten segun lo especificado.
- Sin tool calling ni modo de razonamiento en este paquete, aunque el modelo upstream pueda soportarlos; los flujos de agentes no estan cubiertos.
- Sin soporte de entrada de imagen en Loom, pese a que el modelo upstream la soporta.
- Dependencia de hardware muy especifico: solo se han generado kernels para gfx1151 y gfx1201; no hay soporte declarado para NVIDIA ni para otras arquitecturas AMD.
- Licencia MIT declarada en el paquete, pero la cadena de modelos base (Devstral-Small-2505 de Mistral AI) debe verificarse por separado antes de un uso comercial, ya que la model card no reproduce los terminos del modelo original.
- Idiomas soportados no documentados; no se puede afirmar cobertura multilingue a partir de esta ficha.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben evaluarse sobre el modelo base.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-26, lo que sugiere un artefacto reciente y sin validacion comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-Devstral-Small-2505-loom
- GGUF de origen (Unsloth): https://huggingface.co/unsloth/Devstral-Small-2505-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
