# loom-draft/prithivMLmods-Qwen-Image-2.1-PE-I2I-loom

## Resumen

`loom-draft/prithivMLmods-Qwen-Image-2.1-PE-I2I-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `prithivMLmods/Qwen-Image-2.1-PE-I2I-GGUF`, en su cuantizacion `Q4_K_M`. No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado orientado a la inferencia del modelo base en GPUs AMD, concretamente el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es multimodal de tipo image-text-to-text, con soporte de imagen de entrada mediante el proyector `Qwen-Image-2.1-PE-I2I.mmproj-bf16.gguf`. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), tool calling, modo de razonamiento activado por defecto y una ventana de contexto declarada de 262.144 tokens por peticion, con hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

Su relevancia es acotada y muy especifica: sirve para ejecutar el modelo base en hardware AMD consumer y profesional mediante el stack Loom (`hrx-loom`), sin depender de llama.cpp como runtime. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0,0 GB declarado y no incluye resultados de rendimiento ni de correccion medidos para este paquete concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; detalles de la arquitectura no publicados en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado); proyector multimodal en bf16 |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; terminos no detallados en la informacion disponible) |
| Formato de pesos | GGUF (`Qwen-Image-2.1-PE-I2I.Q4_K_M.gguf`) + proyector GGUF (`Qwen-Image-2.1-PE-I2I.mmproj-bf16.gguf`); paquete Loom (`.loom` + `model.json`) |
| Modelo base | prithivMLmods/Qwen-Image-2.1-PE-I2I-GGUF |
| Runtime | loom-serve (`hrx-loom[hf]==0.2.0`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Concurrencia | 4 peticiones concurrentes |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO). La informacion proporcionada describe unicamente el empaquetado: un checkpoint GGUF Q4_K_M sin modificar, acompanado de un proyector multimodal separado en bf16 que habilita la entrada de imagenes. El pipeline declarado es image-text-to-text.

La innovacion tecnica del artefacto no esta en el modelo sino en el runtime: `loom-next` genera programas `.loom` especificos para las arquitecturas AMD gfx1151 y gfx1201, y `loom-serve` los ejecuta con opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (pool de memoria comprometido por adelantado) y `--parameter_mode=preload` (carga de pesos en host). El paquete incluye ademas un conjunto de puertas de validacion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra llama.cpp sobre el mismo GGUF; ninguna de ellas tiene medicion registrada para este paquete.

## Capacidades

- Generacion de texto y razonamiento multimodal con entrada de imagen (image-text-to-text).
- Modo de razonamiento (thinking) activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de llamadas a herramientas segun las puertas `agent` y `agent_think_off`.
- Entrada de imagenes mediante partes `image_url` estilo OpenAI, procesadas por el proyector `Qwen-Image-2.1-PE-I2I.mmproj-bf16.gguf`.
- Contexto largo: 262.144 tokens por peticion.
- Concurrencia de 4 peticiones simultaneas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Audio (entrada o salida): no soportado.
- Decodificacion especulativa: no aplicable en este paquete.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.
- Muestreo (temperature, top_k, seed): estado no determinado en la tabla de caracteristicas, aunque existe una puerta `sampling` definida.

## Casos de uso

- Analisis de documentos escaneados con contexto largo: el modelo puede recibir una imagen y un prompt extenso en una sola peticion de hasta 262.144 tokens, lo que permite adjuntar transcripciones o historiales completos junto a la imagen sin truncar.
- Asistentes con acceso a herramientas sobre imagenes: con tool calling estilo OpenAI, se puede construir un agente que reciba una captura o diagrama y encadene llamadas a APIs externas (busqueda, calculo, bases de datos) en bucles multi-turno.
- Extraccion estructurada de informacion desde imagenes en pipelines internos: integrable mediante `/v1/chat/completions` en servicios existentes que ya hablan el protocolo de OpenAI, sin adaptadores adicionales.
- Despliegue en estaciones de trabajo AMD: el paquete esta pensado para ejecutarse en Strix Halo y Radeon AI PRO R9700, lo que permite montar entornos de inferencia local en hardware AMD sin pasar por CUDA.
- Procesamiento por lotes moderado con concurrencia: las 4 peticiones concurrentes permiten servir varios flujos simultaneos (por ejemplo, clasificacion de imagenes con justificacion textual) en una sola GPU.
- Razonamiento con traza explicita: al estar el thinking activado por defecto, encaja en tareas donde se quiere registrar el razonamiento intermedio (auditoria de decisiones, depuracion de respuestas) y desactivarlo solo en produccion de baja latencia.
- Evaluacion comparativa de runtimes: util para equipos que quieran contrastar el rendimiento de Loom frente a llama.cpp sobre el mismo GGUF, ya que el paquete define puertas de comparacion token a token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que ninguna de las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) tiene ejecucion registrada.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el checkpoint es Q4_K_M y el hardware de referencia es una GPU de 32 GB (Radeon AI PRO R9700) y una APU con memoria unificada (Ryzen AI Max+ 395).
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se declara soporte para GPUs NVIDIA ni para otras arquitecturas AMD.
- GPU consumer: no hay confirmacion de funcionamiento en GPUs consumer AMD distintas de las dos arquitecturas objetivo; no se menciona soporte para Radeon RX de escritorio ni para iGPU de otras generaciones.
- Despliegue: exclusivamente mediante `loom-serve` del paquete `hrx-loom[hf]==0.2.0`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este artefacto (llama.cpp se usa solo como referencia de correccion).
- Instalacion: `pipx install "hrx-loom[hf]==0.2.0"` seguido de `loom-fetch huggingface:loom-draft/prithivMLmods-Qwen-Image-2.1-PE-I2I-loom:chat --materialize=copy --output=qwen-image-2.1-pe-i2i` y `loom-serve --model=qwen-image-2.1-pe-i2i '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Runtime | Licencia | Notas |
|---|---|---|---|---|---|---|
| loom-draft/prithivMLmods-Qwen-Image-2.1-PE-I2I-loom | no disponible | 262.144 tokens | GGUF Q4_K_M + paquete Loom | loom-serve | other | Paquete de despliegue para AMD gfx1151 y gfx1201; sin benchmarks medidos |
| prithivMLmods/Qwen-Image-2.1-PE-I2I-GGUF | no disponible | no disponible en la informacion proporcionada | GGUF | llama.cpp y otros runtimes GGUF | other | Modelo base sin modificar del que deriva este paquete |
| Qwen-Image-2.1 (modelo original, referencia nominal) | no disponible | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Solo se menciona en el nombre del checkpoint; no hay datos verificables en la informacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio declara 0 descargas y 0 likes, un tamano de 0,0 GB y fue creado y actualizado el mismo dia (2026-11-19); no hay evidencia de uso ni de validacion por terceros.
- Ninguna de las puertas de correccion tiene medicion registrada: no hay evidencia publicada de que la salida coincida con llama.cpp en texto, vision, tool calling, muestreo ni logits.
- No hay mediciones de rendimiento para ninguna de las dos GPUs objetivo.
- El estado del muestreo (temperature, top_k, seed) figura como "no determinado" en la tabla de caracteristicas del autor.
- La licencia es "other" y los terminos concretos no se detallan en la informacion disponible; es imprescindible revisar la licencia del modelo base antes de cualquier uso comercial.
- El modelo solo esta empaquetado para dos arquitecturas AMD concretas (gfx1151 y gfx1201); no se declara portabilidad a otras GPUs ni a CPU.
- La ventana de contexto de 262.144 tokens es la declarada por el preset; no hay verificacion publicada de su comportamiento real en documentos largos.
- El modo de razonamiento esta activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva explicitamente.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni cobertura idiomatica del modelo base.
- El nombre del repositorio puede confundirse con el producto de grabacion de pantalla Loom; no existe relacion entre ambos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/prithivMLmods-Qwen-Image-2.1-PE-I2I-loom
- Modelo base en Hugging Face: https://huggingface.co/prithivMLmods/Qwen-Image-2.1-PE-I2I-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
