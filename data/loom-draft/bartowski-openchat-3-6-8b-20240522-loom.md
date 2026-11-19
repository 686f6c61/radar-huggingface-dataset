# loom-draft/bartowski-openchat-3.6-8b-20240522-loom

## Resumen

`loom-draft/bartowski-openchat-3.6-8b-20240522-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/openchat-3.6-8b-20240522-GGUF`, en su cuantizacion `Q4_K_M`. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado que traduce los pesos originales de OpenChat 3.6 8B a un formato ejecutable por el runtime Loom sobre GPUs AMD concretas, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Lo publica el usuario `loom-draft` y se genero con la herramienta `loom-next`, sin intervencion de un LLM en el proceso.

El modelo subyacente, OpenChat 3.6 8B (variante de mayo de 2024), es un transformer denso de aproximadamente 8.000 millones de parametros derivado de la familia Llama 3 y afinado con datos conversacionales; su licencia es `llama3`. El paquete Loom expone una API compatible con OpenAI (`/v1/chat/completions`), admite 8.192 tokens de contexto por peticion, 4 peticiones concurrentes y un maximo de 4.096 tokens de salida segun el preset.

La relevancia de esta ficha es acotada y conviene ser explicito: el interes esta en el formato de despliegue para hardware AMD, no en capacidades nuevas del modelo. La model card no aporta mediciones de rendimiento ni evidencia de las puertas de correccion (todas aparecen como "not yet re-measured"), y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base OpenChat 3.6 8B, derivado de Llama 3); empaquetado como programas Loom generados |
| Parametros totales | ~8.000 millones (modelo base; no confirmado en la informacion proporcionada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponibles |
| Licencia | llama3 |
| Formato de pesos | GGUF de origen (`openchat-3.6-8b-20240522-Q4_K_M.gguf`) convertido a programas `.loom` y `weights.loom`; incluye `tokenizer.json`, `llm_config.json`, `model.json` y `model.json.lock` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | Estilo OpenAI `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El paquete no define una arquitectura propia: reproduce la del checkpoint GGUF de origen, un transformer denso de la familia Llama 3 con aproximadamente 8.000 millones de parametros. La aportacion tecnica del repositorio es la generacion automatica de kernels y programas Loom (ficheros `program/*.loom` y `weights.loom`) a partir de `llm_config.json`, de modo que el mismo GGUF se ejecuta de forma nativa sobre las arquitecturas GPU AMD gfx1151 y gfx1201. El proceso lo realiza `loom-next` como generador, sin bucle de LLM.

No hay informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si OpenChat 3.6 8B empleo RLHF, DPO u otras tecnicas de alineamiento; esos datos corresponden a la model card original de OpenChat, que no se incluye aqui. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa: la tabla de caracteristicas la marca como "not applicable". El paquete incluye un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`, `logits`, entre otras) que comparan la salida con una referencia de llama.cpp sobre el mismo GGUF, pero todas figuran como no re-medidas.

## Capacidades

- Generacion de texto conversacional multi-turno mediante una API compatible con OpenAI.
- Conversacion con hasta 8.192 tokens de contexto por peticion.
- Hasta 4 peticiones concurrentes con salida de hasta 4.096 tokens.
- Tool calling: no aplicable segun la model card.
- Razonamiento o modo thinking: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la model card.

## Casos de uso

- Despliegue de un asistente conversacional local en estaciones de trabajo con Ryzen AI Max+ 395: el paquete se instala con `pipx install "hrx-loom[hf]==0.2.0"` y se sirve con `loom-serve`, exponiendo un endpoint compatible con OpenAI sin depender de CUDA ni de llama.cpp.
- Prototipado de aplicaciones sobre GPU AMD Radeon AI PRO R9700: al caber el Q4_K_M de 8B en los 32 GB de la tarjeta, permite mantener el modelo residente y atender 4 peticiones concurrentes con 8.192 tokens de contexto.
- Sustitucion de un backend de chat en aplicaciones ya escritas contra la API de OpenAI: basta con apuntar el cliente a `http://127.0.0.1:8080/v1/chat/completions` y usar el identificador `openchat-3.6-8b-20240522`.
- Evaluacion comparativa de runtimes en hardware AMD: las puertas `golden`, `compare` y `logits` estan disenadas para contrastar token a token la salida de Loom frente a llama.cpp sobre el mismo GGUF, lo que sirve para validar la fidelidad numerica del backend.
- Procesamiento por lotes de resumenes o reescritura de documentos de hasta 8.000 tokens en entornos con requisitos de residencia de datos, al ejecutarse de forma local.
- Base para experimentos de cuantizacion y empaquetado: el repositorio documenta el flujo `loom-fetch` + `loom-serve` con opciones como `--pool_backing=fixed` y `--parameter_mode=preload`, util para medir el impacto de la gestion de memoria en el arranque.
- Generacion de respuestas en herramientas internas de soporte con turnos cortos, limitando la salida a 4.096 tokens y asumiendo ausencia de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de correccion figuran como "not yet re-measured". No se dispone de datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete se distribuye en Q4_K_M y esta pensado para la Radeon AI PRO R9700 de 32 GB y para la memoria unificada del Ryzen AI Max+ 395.
- GPU soportadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no contempladas en la informacion proporcionada.
- Cabe en GPU de consumo: no disponible; el unico hardware documentado son las dos GPUs AMD citadas.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. Opciones relevantes: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` para espera activa de finalizaciones en GPU.
- vLLM, llama.cpp, Ollama o TGI: no documentados para este paquete; llama.cpp aparece unicamente como referencia de correccion, no como opcion de despliegue del artefacto Loom.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-draft/bartowski-openchat-3.6-8b-20240522-loom` | ~8B | 8.192 tokens | Loom (desde GGUF Q4_K_M) | llama3 | Solo GPUs AMD gfx1151 y gfx1201; sin benchmarks publicados |
| `bartowski/openchat-3.6-8b-20240522-GGUF` | ~8B | no disponible en esta ficha | GGUF | llama3 | Checkpoint de origen; ejecutable con llama.cpp y derivados |
| OpenChat 3.6 8B (modelo original) | ~8B | no disponible en esta ficha | safetensors (previsible, no confirmado) | llama3 | Modelo base del que deriva el GGUF |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada; la comparativa se limita a formato, licencia y hardware objetivo.

## Limitaciones y advertencias

- El repositorio no es un modelo nuevo: es un empaquetado de despliegue. Cualquier limitacion del OpenChat 3.6 8B subyacente se hereda sin cambios.
- Ausencia total de evidencia de correccion: las puertas `kernel_tests`, `golden`, `compare`, `consistency`, `sampling`, `logits`, `decision` y `agent` figuran como no re-medidas, por lo que no hay garantia publicada de equivalencia con llama.cpp.
- Sin mediciones de rendimiento: no se puede estimar latencia ni throughput a partir de la documentacion.
- Compatibilidad de hardware muy restringida: solo se documentan gfx1151 y gfx1201; no hay soporte declarado para NVIDIA ni para otras GPUs AMD.
- Sin tool calling, sin modo thinking, sin vision y sin audio: la model card los marca como no aplicables, lo que descarta casos de uso de agentes.
- Idiomas no declarados: no se puede asumir calidad multilingue sin evaluacion.
- Estado de muestreo "no determinado": el comportamiento de temperature, top_k y seed no esta verificado.
- Licencia `llama3`: impone condiciones de uso comercial y obligaciones de atribucion que deben revisarse antes de un despliegue en produccion.
- Repositorio sin traccion (0 descargas, 0 likes) y creado en 2026-11-19: no hay senales de mantenimiento ni de validacion por terceros.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben evaluarse sobre el modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-openchat-3.6-8b-20240522-loom
- Checkpoint GGUF de origen: https://huggingface.co/bartowski/openchat-3.6-8b-20240522-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
