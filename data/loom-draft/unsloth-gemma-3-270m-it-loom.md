# loom-draft/unsloth-gemma-3-270m-it-loom

## Resumen

`loom-draft/unsloth-gemma-3-270m-it-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/gemma-3-270m-it-GGUF`, en su cuantizacion Q4_K_M. No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado que traduce los pesos originales de Gemma 3 270M instruct a kernels ejecutables en GPUs AMD, concretamente el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Lo publica el usuario `loom-draft` y se genera con la herramienta `loom-next`, sin intervencion de un LLM en el proceso.

El modelo subyacente es Gemma 3 270M instruct, un transformer decoder-only denso de 270 millones de parametros desarrollado por Google DeepMind, disenado para tareas ligeras, clasificacion, extraccion y despliegue en entornos con recursos muy limitados. El paquete Loom anade una capa de servicio compatible con la API de chat de OpenAI (`/v1/chat/completions`) y fija un contexto de 32.768 tokens por peticion, con 4 peticiones concurrentes y un maximo de 4.096 tokens de salida.

Su relevancia es acotada pero concreta: permite ejecutar un modelo pequeno sobre el stack ROCm/HIP de AMD sin depender de llama.cpp, con verificacion de correctitud frente a la referencia de llama.cpp mediante compuertas (`gates`) que, en el momento de publicacion de la tarjeta, no estaban re-medidas. El repositorio tiene 0 descargas y 0 likes, tamano 0.0 GB y fue creado el 26 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Gemma 3, modelo base); paquete de despliegue Loom con kernels generados para AMD HIP/ROCm |
| Parametros totales | 270 millones (modelo base Gemma 3 270M) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens por peticion (segun la tarjeta del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen); el paquete distribuye pesos en formato Loom (`weights.loom`) |
| Idiomas soportados | no disponible (la tarjeta del paquete no lo declara; depende del modelo base Gemma 3) |
| Licencia | MIT (declarada en la tarjeta del paquete) |
| Formato de pesos | GGUF de origen (`gemma-3-270m-it-Q4_K_M.gguf`); empaquetado como programas `.loom` y `weights.loom` |
| Modelo base | `unsloth/gemma-3-270m-it-GGUF` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Concurrencia | 4 peticiones simultaneas |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` |
| Herramienta de generacion | `loom-next` (generador, sin LLM en el bucle) |
| Runtime | `hrx-loom[hf]==0.2.0`, comando `loom-serve` |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 270M instruct, un transformer decoder-only denso de 270 millones de parametros. La informacion proporcionada no incluye detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base; esos datos corresponden a la model card original de Google DeepMind y no se reproducen aqui.

La innovacion del artefacto no esta en el modelo sino en el empaquetado: `loom-next` genera programas `.loom` y kernels especificos para las arquitecturas AMD gfx1151 y gfx1201 a partir de la configuracion (`llm_config.json`) y los pesos GGUF. El paquete incluye `tokenizer.json`, `model.json` con los ficheros fuente fijados por sha256 (verificados por `loom-fetch`), `info.json` con las mediciones y versiones, y `REPORT.md`. El servicio se lanza con `loom-serve` y parametros como `--pool_backing=fixed` (reserva el pool de memoria por adelantado) y `--parameter_mode=preload` (carga de pesos en host). La tarjeta indica que las compuertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) no estaban re-medidas en el momento de publicacion, por lo que no hay evidencia registrada de equivalencia con llama.cpp para este paquete concreto.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Contexto de 32.768 tokens por peticion, adecuado para documentos cortos y conversaciones multi-turno.
- Concurrencia de 4 peticiones simultaneas.
- Hasta 4.096 tokens de salida por respuesta (preset `max_tokens`).
- Tool calling: no aplicable segun la tarjeta del paquete.
- Razonamiento / thinking mode: no aplicable.
- Esfuerzo de razonamiento configurable: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Muestreo (`sampling`): estado "no determinado" en la tarjeta.
- Capacidades multilingues: no disponibles en la informacion del paquete; dependen del modelo base Gemma 3 270M.

## Casos de uso

- Clasificacion y etiquetado de texto a gran escala: con 270M de parametros en Q4_K_M y un contexto de 32.768 tokens, el modelo puede procesar lotes de documentos cortos para asignar categorias o extraer campos, desplegado sobre una Radeon AI PRO R9700 o un Strix Halo sin necesidad de GPUs de datacenter.
- Extraccion de informacion estructurada: dado un texto de entrada y un esquema de salida, generar JSON con los campos solicitados; el limite de 4.096 tokens de salida cubre esquemas de tamano moderado.
- Asistente conversacional ligero en local: atender un chat de soporte basico con 4 peticiones concurrentes y contexto de 32k, apropiado para prototipos y entornos de desarrollo sobre hardware AMD de escritorio.
- Filtrado y enrutado previo en pipelines RAG: usar el modelo como clasificador de consultas o generador de reformulaciones antes de invocar un modelo mayor, reduciendo coste y latencia en la primera etapa.
- Pruebas de integracion de la API OpenAI: validar clientes y pipelines contra un endpoint `/v1/chat/completions` local sin dependencia de proveedores externos, gracias a la compatibilidad declarada.
- Evaluacion comparativa de runtimes AMD: servir el mismo GGUF con `loom-serve` y con llama.cpp sobre Strix Halo o R9700 para medir latencia y throughput, usando las compuertas de correctitud como referencia (aunque en esta publicacion no esten re-medidas).
- Despliegue en entornos con memoria limitada: el modelo Q4_K_M ocupa del orden de 200 MB de pesos, por lo que cabe holgadamente en los 32 GB de la R9700 y en la memoria unificada del Strix Halo, dejando margen para el pool de KV cache y el resto del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del paquete indica explicitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han re-medido todavia", y que las compuertas de correctitud no tienen ejecuciones registradas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos Q4_K_M de un modelo de 270M ocupan del orden de 200 MB; el consumo total depende del pool de KV cache para 32.768 tokens y de las 4 peticiones concurrentes, no cuantificado en la informacion disponible.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Cabe en GPU de consumo: si, en las GPU AMD soportadas por el paquete; no se declara soporte para GPUs NVIDIA ni para otras arquitecturas AMD distintas de gfx1151 y gfx1201.
- Opciones de despliegue: `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"` y `loom-fetch` para descargar el paquete desde Hugging Face; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este artefacto (llama.cpp se usa solo como referencia de correctitud).
- Parametros de servicio recomendados en la tarjeta: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de completaciones en GPU), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones no se han re-medido para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| `loom-draft/unsloth-gemma-3-270m-it-loom` (este paquete) | 270M | 32.768 tokens | MIT (paquete) | `.loom` + `loom-serve` sobre AMD gfx1151/gfx1201 | Repositorio Hugging Face, 0 descargas |
| `unsloth/gemma-3-270m-it-GGUF` (modelo base) | 270M | no disponible en la informacion | no disponible en la informacion | GGUF, ejecutable con llama.cpp y derivados | Publico en Hugging Face |
| Gemma 3 270M instruct (original de Google DeepMind) | 270M | no disponible en la informacion | no disponible en la informacion | safetensors y variantes | Publico en Hugging Face |

La comparacion se limita al mismo modelo base en distintos formatos, porque la informacion proporcionada no incluye alternativas de otros desarrolladores con las que contrastar parametros, contexto o rendimiento. No hay datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- El paquete no aporta un modelo nuevo: hereda todas las limitaciones de Gemma 3 270M instruct, incluida una capacidad de razonamiento y conocimiento factual propia de un modelo de 270M de parametros.
- Riesgo de alucinacion elevado en tareas abiertas de conocimiento; no es adecuado para respuestas factuales sin verificacion externa.
- Las compuertas de correctitud (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`, `logits`, `decision`, entre otras) no estaban re-medidas en el momento de publicacion; no hay evidencia registrada de que la salida coincida con la referencia de llama.cpp para este paquete.
- El estado del muestreo (`sampling`) figura como "no determinado" en la tarjeta.
- Soporte de hardware restringido a AMD gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no se declara compatibilidad con otras GPU.
- Tool calling, thinking mode, decodificacion especulativa, vision y audio figuran como "no aplicable"; no deben asumirse en produccion.
- La licencia MIT la declara la tarjeta del paquete; conviene verificar los terminos del modelo base Gemma 3 antes de un uso comercial, ya que la informacion proporcionada no detalla la licencia del checkpoint original.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia: no hay evidencia de uso en produccion ni de mantenimiento posterior.
- El tamano del repositorio figura como 0.0 GB, lo que sugiere que los ficheros pueden no estar materializados o que la medicion no es fiable; verificar antes de desplegar.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-gemma-3-270m-it-loom
- Modelo base GGUF: https://huggingface.co/unsloth/gemma-3-270m-it-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
