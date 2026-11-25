# loom-draft/ggml-org-SmolLM3-3B-loom

## Resumen

`loom-draft/ggml-org-SmolLM3-3B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `ggml-org/SmolLM3-3B-GGUF`, concretamente de la cuantizacion `SmolLM3-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los originales de SmolLM3-3B publicados por el equipo de Hugging Face (ggml-org), y lo que aporta este repositorio es el artefacto necesario para ejecutarlos sobre GPUs AMD mediante el runtime Loom.

El paquete esta orientado a dos aceleradores concretos: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la GPU de escritorio/profesional AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Se genera con la herramienta `loom-next`, un generador de codigo que produce los kernels y programas sin intervencion de un LLM en el bucle, y se sirve con `loom-serve` exponiendo una API compatible con OpenAI (`/v1/chat/completions`).

Su relevancia es acotada pero clara: permite ejecutar un modelo de 3B en cuantizacion Q4_K_M sobre hardware AMD con soporte ROCm/HIP, con un contexto declarado de 65.536 tokens por peticion y hasta 4 peticiones concurrentes. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y las mediciones de rendimiento y las puertas de correccion aparecen como "not yet re-measured", por lo que no hay evidencia publicada de rendimiento para este paquete en concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B, pesos originales de ggml-org); empaquetado como programas Loom |
| Parametros totales | 3B (heredados del checkpoint base SmolLM3-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete: `SmolLM3-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen; empaquetado propietario Loom (`weights.loom`, `program/*.loom`, `model.json`) |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | Compatible OpenAI (`/v1/chat/completions`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM3-3B, un transformer decoder-only de 3.000 millones de parametros desarrollado por Hugging Face, del que este repositorio no modifica ni los pesos ni el entrenamiento: se limita a reempaquetar el GGUF oficial `SmolLM3-Q4_K_M.gguf`. La model card del paquete no documenta datos de entrenamiento, numero de tokens, composicion del corpus ni si hubo RLHF o DPO; esos detalles corresponden a la ficha del modelo original y no se reproducen aqui.

La innovacion tecnica del repositorio no esta en el modelo sino en el pipeline de despliegue. `loom-next` genera codigo Loom (kernels y programas) especifico para las arquitecturas gfx1151 y gfx1201 de AMD, y `loom-serve` lo ejecuta con opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (reserva previa del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host). El paquete incluye `llm_config.json` con la configuracion desde la que se generaron los programas, `tokenizer.json` y `info.json` con las mediciones y versiones.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Contexto largo: 65.536 tokens por peticion, segun la model card del paquete.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida de hasta 4.096 tokens por respuesta (preset `max_tokens`).
- Tool calling: no aplicable segun la tabla de caracteristicas del paquete.
- Razonamiento / thinking mode: no aplicable.
- Reasoning effort: no aplicable.
- Decodificacion especulativa: no aplicable en este paquete.
- Entrada de imagen: no aplicable.
- Entrada/salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "not determined" en la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado y validacion de despliegues en hardware AMD: sirve para comprobar que el stack Loom + ROCm funciona sobre Strix Halo o R9700 antes de mover cargas mayores, gracias a que el paquete incluye comandos de arranque reproducibles y una API compatible con OpenAI.
- Asistente conversacional local de bajo coste: con 3B en Q4_K_M y 65.536 tokens de contexto, se puede desplegar un chatbot interno que mantenga conversaciones multi-turno largas sin salir del equipo del usuario.
- Procesamiento de documentos extensos: el contexto de 65k tokens permite resumir o extraer informacion de contratos, manuales o articulos que no caben en ventanas de 4k-8k, siempre que se acepte la precision de un modelo de 3B.
- Generacion de texto en lote sobre GPU de escritorio: la R9700 de 32 GB y la concurrencia de 4 peticiones permiten procesar colas de tareas de redaccion (descripciones, clasificacion, reformulacion) mediante llamadas HTTP al endpoint local.
- Entorno de pruebas para integracion con clientes OpenAI: al exponer `/v1/chat/completions`, se puede apuntar cualquier SDK compatible con OpenAI al servidor local para validar pipelines de aplicacion sin coste de API externa.
- Evaluacion comparativa de runtimes en AMD: util para medir latencia y correccion frente a llama.cpp en el mismo GGUF, ya que la model card define puertas de correccion (`golden`, `compare`, `consistency`, `logits`) pensadas para esa comparacion.
- Docencia y experimentacion con cuantizacion: el uso de Q4_K_M permite ilustrar el efecto de la cuantizacion en la calidad de salida sobre hardware de consumo o de gama profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas. No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia para este paquete.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la informacion proporcionada. El paquete esta pensado para una GPU de 32 GB (R9700) y para la APU Strix Halo con memoria unificada; un modelo de 3B en Q4_K_M ocupa del orden de 2 GB de pesos, pero el pool de memoria fijo y el contexto de 65k incrementan el consumo y no se documenta la cifra exacta.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se mencionan otras GPU en la model card.
- Compatibilidad con GPU de consumo: no disponible. No se documenta soporte para Radeon RX de consumo ni para GPU NVIDIA.
- Opciones de despliegue: exclusivamente el runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` y `loom-serve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este paquete.
- Latencia y throughput: no disponibles; las mediciones comparativas frente a llama.cpp no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `loom-draft/ggml-org-SmolLM3-3B-loom` (este paquete) | 3B | 65.536 tokens | Loom (`loom-serve`), solo AMD gfx1151/gfx1201 | Apache 2.0 | Hugging Face, 0 descargas |
| `ggml-org/SmolLM3-3B-GGUF` (modelo base) | 3B | no disponible en la informacion proporcionada | GGUF, ejecutable con llama.cpp | Apache 2.0 (heredada) | Hugging Face (upstream) |
| SmolLM3-3B en otros formatos (safetensors, etc.) | 3B | no disponible en la informacion proporcionada | safetensors / transformers | Apache 2.0 | Hugging Face (upstream) |

No se dispone de datos de rendimiento del paquete Loom que permitan una comparacion cuantitativa con alternativas; la unica diferencia documentada frente al GGUF original es el empaquetado y el runtime (Loom frente a llama.cpp), con la promesa de una comparacion token a token mediante la puerta `compare`, aun no ejecutada.

## Limitaciones y advertencias

- No hay evidencia publicada de correccion: todas las puertas (`golden`, `compare`, `consistency`, `logits`, etc.) aparecen como "not yet re-measured", por lo que no se ha demostrado que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no se puede afirmar que este paquete sea mas rapido o mas lento que llama.cpp en el mismo hardware.
- Soporte de hardware muy restringido: solo se documentan gfx1151 (Strix Halo) y gfx1201 (R9700); no hay garantia de funcionamiento en otras GPU AMD ni en NVIDIA.
- Ecosistema inmaduro: depende de `hrx-loom==0.2.0` y del generador `loom-next`, con versiones fijadas y un formato de pesos propietario (`weights.loom`) que no es interoperable con otras herramientas.
- Funcionalidades ausentes: sin tool calling, sin thinking mode, sin decodificacion especulativa, sin vision ni audio; el muestreo figura como "not determined".
- Modelo pequeno: 3B en Q4_K_M implica menor calidad de razonamiento, matematicas y codigo que modelos de mayor tamano; riesgo de alucinacion inherente a esa escala.
- Idiomas: no se documenta la cobertura linguistica del paquete; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el paquete hereda las condiciones del checkpoint base y no se detallan terminos adicionales del runtime Loom.
- Madurez del repositorio: 0 descargas, 0 likes y creado en noviembre de 2026; es un artefacto de borrador (`loom-draft`) sin adopcion verificable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ggml-org-SmolLM3-3B-loom
- Modelo base en Hugging Face: https://huggingface.co/ggml-org/SmolLM3-3B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
