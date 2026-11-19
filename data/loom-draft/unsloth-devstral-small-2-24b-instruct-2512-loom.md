# loom-draft/unsloth-Devstral-Small-2-24B-Instruct-2512-loom

## Resumen

Devstral-Small-2-24B-Instruct-2512 es un modelo de lenguaje de 24.000 millones de parametros desarrollado por Mistral AI, orientado a tareas de ingenieria de software y uso agente. Esta ficha concreta no contiene los pesos originales, sino un paquete de despliegue denominado Loom (archivos `.loom` y un `model.json`) generado por el proyecto loom-next a partir del checkpoint GGUF `Devstral-Small-2-24B-Instruct-2512-Q4_K_M.gguf` publicado por Unsloth. El paquete esta pensado exclusivamente para GPUs AMD: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El interes de esta publicacion es la portabilidad del modelo a hardware AMD mediante un runtime propio (`hrx-loom`) que expone una API compatible con OpenAI (`/v1/chat/completions`). El paquete no modifica el modelo: reutiliza los pesos GGUF cuantizados en Q4_K_M y aporta kernels y programas generados para ejecutarlos sobre ROCm. No incluye datos de rendimiento ni de correccion medidos para esta version.

La relevancia actual es doble: por un lado, permite ejecutar un modelo de 24B especializado en codigo en GPUs de consumo profesional AMD sin depender de CUDA; por otro, sirve como referencia de un ecosistema de empaquetado alternativo (Loom) que compite con llama.cpp y vLLM en el nicho de aceleradores AMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Devstral-Small-2-24B-Instruct-2512; transformer, segun denominacion del modelo base) |
| Parametros totales | 24.000 millones (segun nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 108.544 tokens por peticion (limite del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar terminos de Mistral AI) |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | compatible con OpenAI (`/v1/chat/completions`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentacion proporcionada. El paquete Loom no entrena ni modifica el modelo: parte del checkpoint GGUF ya cuantizado de Unsloth y genera programas (kernels) para ejecutarlo sobre ROCm. Por tanto, las decisiones de arquitectura, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) y cualquier innovacion de decodificacion pertenecen al modelo base Devstral-Small-2-24B-Instruct-2512 y no se detallan aqui.

La innovacion tecnica de esta publicacion es el propio runtime Loom: `loom-next` genera los programas sin intervencion de un LLM en el bucle, y `loom-serve` los ejecuta con opciones como `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host). El paquete incluye compuertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) definidas en `loom-benchmark`, aunque en esta version ninguna aparece medida.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base de 24B.
- Especializacion en codigo e ingenieria de software (Devstral), segun la denominacion del modelo base.
- Servidor HTTP con API compatible con OpenAI para chat multi-turno.
- Procesamiento de hasta 108.544 tokens de contexto por peticion.
- Hasta 4 peticiones concurrentes con salida maxima de 4.096 tokens.
- Tool calling: no aplicable en este paquete segun la tabla de caracteristicas.
- Modo de razonamiento / thinking: no aplicable en este paquete.
- Decodificacion especulativa: no aplicable en este paquete.
- Entrada de imagen: no soportada por Loom, aunque el modelo base la admite.
- Entrada y salida de audio: no aplicable.
- Muestreo (temperatura, top_k, semilla): estado no determinado.

## Casos de uso

- Asistencia de codigo en local sobre GPU AMD: el paquete permite servir un modelo de 24B especializado en programacion en una Radeon AI PRO R9700 o un Strix Halo, sin CUDA, mediante `loom-serve` y la API compatible con OpenAI.
- Revision de repositorios de tamano medio: con 108.544 tokens de contexto se pueden pasar varios archivos o un diff extenso en una sola peticion para tareas de revision, explicacion o deteccion de errores.
- Generacion de tests y documentacion: el modelo puede producir pruebas unitarias y docstrings a partir de fragmentos de codigo enviados en el contexto, integrable en scripts de CI mediante llamadas HTTP.
- Prototipado de agentes de codigo sin tool calling nativo: aunque el paquete no expone tool calling, se pueden implementar bucles agente en el cliente orquestando llamadas al endpoint de chat y ejecutando las acciones en el host.
- Despliegue en estaciones de trabajo con grafica AMD: equipos con Ryzen AI Max+ 395 pueden ejecutar el modelo en local para asistentes de desarrollo sin enviar codigo a la nube.
- Evaluacion comparativa de runtimes: util para medir y comparar el rendimiento de Loom frente a llama.cpp sobre el mismo GGUF, ya que el paquete incluye compuertas de correccion y una referencia golden de llama.cpp.
- Servicio interno de bajo volumen: con 4 peticiones concurrentes y salida de 4.096 tokens, encaja en equipos pequenos o entornos de desarrollo compartido mas que en produccion de alta carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que los resultados para Strix Halo y para la Radeon AI PRO R9700 "no se han vuelto a medir" y que las compuertas de correccion no tienen ejecuciones registradas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 24B, y la Radeon AI PRO R9700 objetivo tiene 32 GB, lo que sugiere que el paquete esta dimensionado para caber en esa capacidad.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que depende de ROCm.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`; el servidor expone `/v1/chat/completions`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; el checkpoint GGUF original de Unsloth puede usarse con otros runtimes, pero esta ficha cubre solo el empaquetado Loom.
- Latencia y throughput: no disponibles; la model card indica que las mediciones de rendimiento aun no se han realizado para esta version.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Devstral-Small-2-24B-Instruct-2512 (este paquete Loom) | 24B | 108.544 tokens (preset Loom) | GGUF Q4_K_M empaquetado en `.loom`, runtime Loom sobre ROCm | other | Hugging Face, 0 descargas |
| unsloth/Devstral-Small-2-24B-Instruct-2512-GGUF | 24B | no disponible | GGUF, compatible con llama.cpp y otros runtimes | other | Hugging Face (modelo base de este paquete) |
| Modelos de codigo de ~20-30B en GGUF (p. ej. variantes Qwen-Coder o Codestral) | ~20-30B | variable | GGUF, llama.cpp / Ollama / vLLM | variable | Hugging Face |

La comparacion con alternativas de codigo de tamano similar no puede completarse con datos de rendimiento porque no se han publicado mediciones para este paquete ni se dispone de cifras del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- Paquete sin mediciones: ni el rendimiento ni las compuertas de correccion han sido re-medidos para esta version, por lo que no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- Restriccion de hardware: solo funciona en las GPUs AMD indicadas (gfx1151 y gfx1201); no es portable a NVIDIA ni a otras arquitecturas sin otro empaquetado.
- Funcionalidades ausentes: sin tool calling, sin modo thinking, sin decodificacion especulativa y sin entrada de imagen, aunque el modelo base si admite vision.
- Contexto limitado por el preset a 108.544 tokens, inferior al maximo que pueda soportar el modelo base.
- Concurrencia baja (4 peticiones) y salida maxima de 4.096 tokens, insuficientes para cargas de produccion elevadas.
- Licencia "other": es necesario revisar los terminos del modelo base de Mistral AI antes de cualquier uso comercial; la model card no detalla condiciones.
- Idiomas soportados no declarados; no se puede garantizar calidad multilingue mas alla de lo que indique el modelo base.
- Riesgo de alucinacion y sesgos: no documentados en esta publicacion; deben evaluarse con el modelo base.
- Madurez: publicacion con 0 descargas y 0 likes, creada y actualizada el mismo dia, sin historial de uso.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-Devstral-Small-2-24B-Instruct-2512-loom
- Modelo base GGUF (Unsloth): https://huggingface.co/unsloth/Devstral-Small-2-24B-Instruct-2512-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
