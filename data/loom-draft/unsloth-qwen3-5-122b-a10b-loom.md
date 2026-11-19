# loom-draft/unsloth-Qwen3.5-122B-A10B-loom

## Resumen

Loom es un paquete de despliegue (programas `.loom` y una tarjeta `model.json`) generado por la herramienta loom-next que empaqueta el checkpoint GGUF sin modificar `unsloth/Qwen3.5-122B-A10B-GGUF`, en su variante `Q4_K_M`, para su ejecución sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201). No se trata de un modelo nuevo ni de un fine-tune: es una distribucion de inferencia que permite servir el modelo Qwen3.5-122B-A10B sobre el stack ROCm/IREE a traves de `loom-serve`, exponiendo una API compatible con OpenAI.

El modelo subyacente es Qwen3.5-122B-A10B, un transformer de tipo Mixture-of-Experts con 122 000 millones de parametros totales y 10 000 millones activos, que admite entrada de imagen (pipeline `image-text-to-text`) y dispone de modo de razonamiento ("thinking") activado por defecto. El paquete declara una ventana de contexto de 108 544 tokens por peticion, hasta 4 peticiones concurrentes y un maximo de 4096 tokens de salida, con soporte de tool calling al estilo OpenAI.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes, un tamano de 0,0 GB y fue creado el 2026-11-19. La model card indica explicitamente que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `agent`, etc.) "no se han vuelto a medir todavia" en ninguna de las dos GPU objetivo, por lo que no existe evidencia publicada de rendimiento ni de equivalencia funcional frente a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (modelo base Qwen3.5-122B-A10B); paquete de despliegue Loom sobre IREE/ROCm |
| Parametros totales | 122 000 millones (122B) |
| Parametros activos | 10 000 millones (10B) |
| Longitud de contexto | 108 544 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico formato empaquetado en este repo); proyector de vision en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.5-122B-A10B-Q4_K_M-00001-of-00003.gguf`), empaquetado como `.loom` + `model.json` |
| Salida maxima | 4096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | Compatible con OpenAI (`/v1/chat/completions`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3.5-122B-A10B, es un transformer con capas de mezcla de expertos (MoE) que activa 10 000 millones de parametros por token sobre un total de 122 000 millones, lo que reduce el coste computacional por token respecto a un modelo denso del mismo tamano. Incorpora ademas un proyector multimodal (`mmproj-BF16.gguf`) que habilita la entrada de imagenes, y un modo de razonamiento explicito controlable mediante `chat_template_kwargs: {"enable_thinking": false}`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

El paquete Loom en si no modifica los pesos: genera kernels y programas de ejecucion para el backend AMD (IREE con proactor POSIX) y una tarjeta `model.json` con los ficheros fuente fijados por sha256. La model card menciona opciones de despliegue como `--pool_backing=fixed` (reserva anticipada del pool de memoria), `--parameter_mode=preload` (carga de pesos en host antes de servir) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU). No se declara decodificacion especulativa: la tabla de caracteristicas la marca como "not applicable".

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto, desactivable por peticion.
- Entrada de imagen en formato OpenAI `image_url` (pipeline `image-text-to-text`), procesada por el proyector BF16.
- Tool calling / function calling al estilo OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno segun las puertas `agent` y `agent_think_off` definidas en la model card.
- Servicio concurrente: 4 peticiones simultaneas con contexto de 108 544 tokens por peticion.
- API compatible con OpenAI para integracion directa con clientes existentes.
- Capacidades multilingues: no disponible.
- Audio (entrada o salida): no soportado segun la tabla de caracteristicas.
- Decodificacion especulativa: no aplicable en este paquete.
- Ajuste de "reasoning effort": no aplicable.

## Casos de uso

- Asistente conversacional con contexto largo: la ventana de 108 544 tokens por peticion permite mantener conversaciones multi-turno con documentos extensos adjuntos sin truncar, adecuado para soporte tecnico o analisis de contratos.
- Procesamiento de documentos con imagen: el soporte de `image_url` y el proyector BF16 permiten extraer informacion de capturas, diagramas o formularios escaneados dentro del mismo flujo de chat.
- Agente con herramientas en local: el soporte de `tool_calls` estilo OpenAI y el bucle multi-turno permiten construir agentes que consulten APIs internas o bases de datos sin salir del entorno del servidor.
- Despliegue en estacion de trabajo AMD: el paquete esta pensado para servir el modelo en una unica Radeon AI PRO R9700 de 32 GB o en un Ryzen AI Max+ 395, lo que facilita prototipado y demos sin depender de GPU NVIDIA en la nube.
- Razonamiento asistido con "thinking" desactivable: util en tareas de analisis donde se quiere controlar latencia y coste por peticion activando o desactivando el modo de razonamiento segun la consulta.
- Evaluacion comparativa frente a llama.cpp: las puertas de correccion (`golden`, `compare`, `vision`, `agent`) estan disenadas para validar que la salida coincide token a token con la referencia de llama.cpp sobre el mismo GGUF, lo que sirve para equipos que necesitan verificar portabilidad de backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint Q4_K_M se distribuye en tres ficheros GGUF y el paquete esta dirigido a una GPU de 32 GB (Radeon AI PRO R9700) o a la memoria unificada del Ryzen AI Max+ 395.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPU de consumo: no se documenta soporte para GPUs de consumo NVIDIA; el paquete es especifico para el stack ROCm/IREE de AMD.
- Despliegue: `loom-fetch` + `loom-serve` (paquete `hrx-loom[hf]==0.2.0`), con API OpenAI en `http://127.0.0.1:8080/v1/chat/completions`. En hosts con memlock de 8 MiB se sugiere lanzar bajo `systemd-run` con `SystemCallFilter=~io_uring_setup` o elevar `ulimit -l`.
- Opciones de servido: `--pool_backing=fixed`, `--parameter_mode=preload` (solo R9700), `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.
- Latencia y throughput: no disponibles; la model card no publica mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-122B-A10B (este paquete Loom, Q4_K_M) | 122B totales / 10B activos | 108 544 tokens | Apache 2.0 | Hugging Face, 0 descargas, sin benchmarks publicados |
| unsloth/Qwen3.5-122B-A10B-GGUF (checkpoint base) | 122B totales / 10B activos | no disponible en la informacion | Apache 2.0 (heredada) | Hugging Face, referenciado como `base_model` |
| llama.cpp (referencia de ejecucion) | no aplica (runtime) | no disponible | no disponible | Usado como referencia de correccion en las puertas del paquete |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- No hay evidencia publicada de rendimiento ni de correccion: todas las puertas de validacion figuran como "not yet re-measured" en ambas GPU objetivo.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-11-19); no hay historial de uso ni validacion por terceros.
- El paquete esta acoplado a hardware AMD concreto (gfx1151 y gfx1201); no es portable a otras GPU sin regenerar el paquete.
- La cuantizacion Q4_K_M implica perdida de precision respecto al checkpoint original; no se documenta comparacion de calidad frente a otras cuantizaciones.
- Idiomas soportados no disponibles: no se puede verificar cobertura multilingue ni calidad por idioma.
- Riesgo de alucinacion inherente a modelos generativos de este tamano; no se documentan evaluaciones de sesgo ni de robustez.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse en el repositorio `unsloth/Qwen3.5-122B-A10B-GGUF`.
- La model card esta truncada en la seccion "Files"; no se detalla la lista completa de ficheros ni el contenido integro de `model.json`.
- Los resultados de busqueda web proporcionados corresponden a servicios no relacionados (grabador de pantalla Loom, tienda de ropa Loom); no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3.5-122B-A10B-loom
- Modelo base (GGUF): https://huggingface.co/unsloth/Qwen3.5-122B-A10B-GGUF
- Repositorio Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
