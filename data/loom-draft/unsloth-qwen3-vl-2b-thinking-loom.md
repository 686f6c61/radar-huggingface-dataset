# loom-draft/unsloth-Qwen3-VL-2B-Thinking-loom

## Resumen

`loom-draft/unsloth-Qwen3-VL-2B-Thinking-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `Qwen3-VL-2B-Thinking-Q4_K_M.gguf` de Unsloth, derivado a su vez del modelo Qwen3-VL-2B-Thinking de Alibaba. No es un modelo entrenado desde cero ni un fine-tune: es una distribucion de inferencia generada con la herramienta `loom-next` (sin intervencion de un LLM en el bucle) para ejecutar el modelo en GPUs AMD concretas, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El interes practico esta en que ofrece una via de despliegue nativa sobre ROCm para un modelo vision-lenguaje pequeno (2B) con modo de razonamiento, exponiendo una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, entrada de imagen mediante el proyector `mmproj-BF16.gguf` y una ventana de contexto declarada de 262.144 tokens por peticion con 4 peticiones concurrentes.

Se trata de un artefacto de ecosistema (tags `loom`, `loom-serve`, `strix-halo`, `radeon-r9700`) con cero descargas y cero likes en el momento de redactar esta ficha, y con todas las puertas de correccion y las mediciones de rendimiento marcadas como "not yet re-measured". Debe tratarse, por tanto, como material experimental de evaluacion, no como un paquete con evidencia publicada de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL) con modo thinking; pesos en GGUF Q4_K_M |
| Parametros totales | 2B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens por peticion (segun la model card) |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); proyector de vision en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3-VL-2B-Thinking-Q4_K_M.gguf) + programas `.loom`, `tokenizer.json`, `llm_config.json`, `model.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-2B-Thinking, un transformer vision-lenguaje de la familia Qwen3-VL con modo de razonamiento ("thinking") siempre activo. El paquete no aporta entrenamiento propio: redistribuye el GGUF Q4_K_M generado por Unsloth a partir del checkpoint original, junto con el proyector multimodal BF16 para la entrada de imagen. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base y no se reproducen en esta informacion.

La innovacion tecnica del artefacto es el propio runtime: `loom-next` genera programas `.loom` (kernels) y una configuracion (`llm_config.json`) a partir de los cuales `loom-serve` ejecuta la inferencia sobre ROCm en gfx1151 y gfx1201. La tarjeta declara puertas de validacion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, pero ninguna tiene medicion registrada en esta version. La decodificacion especulativa figura como no aplicable.

## Capacidades

- Generacion de texto y razonamiento con modo thinking siempre activo (no configurable por esfuerzo: "reasoning effort" no aplica).
- Entrada de imagen en formato OpenAI `image_url`, procesada con el proyector `mmproj-BF16.gguf`.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con bucle de agente multi-turno contemplado en las puertas de validacion.
- Servidor con API compatible OpenAI en `/v1/chat/completions`.
- Concurrencia de 4 peticiones simultaneas.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Audio de entrada o salida: no soportado.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la tabla de caracteristicas.

## Casos de uso

- Asistente visual sobre documentacion tecnica: enviar capturas de diagramas de arquitectura o tablas de errores por `image_url` y obtener explicaciones en texto, aprovechando el contexto de 262.144 tokens para adjuntar documentacion extensa junto a la imagen.
- Automatizacion de soporte con imagenes: el modelo puede recibir capturas de pantalla de incidencias de usuario y devolver diagnosticos en un flujo multi-turno, con 4 peticiones concurrentes por instancia para un equipo pequeno.
- Agente de herramientas en local: con tool calling estilo OpenAI, se puede integrar en un bucle de agente que consulte APIs internas (inventario, tickets, calendario) y razone los pasos antes de actuar, siempre en hardware AMD local sin salida a la nube.
- Procesamiento de documentos escaneados en lote: extraccion de texto y estructura de facturas o formularios mediante entrada de imagen, con el limite de 4.096 tokens de salida por peticion para acotar coste.
- Despliegue en estaciones de trabajo con GPU AMD: servir el modelo en una Radeon AI PRO R9700 de 32 GB mediante `loom-serve` para prototipos internos donde no hay GPUs NVIDIA disponibles.
- Evaluacion comparativa de runtimes: usar el paquete como banco de pruebas para contrastar la salida de `loom-serve` frente a llama.cpp con el mismo GGUF, gracias a las puertas `golden` y `compare` definidas en la tarjeta.
- Prototipado de asistentes de accesibilidad: describir imagenes o capturas para usuarios con discapacidad visual en un entorno de escritorio, con latencia local y sin dependencia de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700 "are not yet re-measured", y que ninguna de las puertas de correccion tiene ejecucion registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 2B, por lo que el peso de los pesos ronda unos pocos GB, pero no se confirma en la informacion.
- GPU soportadas segun la tarjeta: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs de consumo: no disponible; no se mencionan modelos consumer de AMD ni NVIDIA.
- Despliegue: `hrx-loom[hf]==0.2.0` (pipx), `loom-fetch` para descargar el paquete y `loom-serve` para servir; flags documentados `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles; las tablas de rendimiento estan pendientes de medicion.
- Concurrencia maxima declarada: 4 peticiones simultaneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-draft/unsloth-Qwen3-VL-2B-Thinking-loom | 2B | 262.144 tokens | GGUF Q4_K_M + `.loom` | Apache 2.0 | Paquete de despliegue para GPU AMD; sin benchmarks publicados |
| unsloth/Qwen3-VL-2B-Thinking-GGUF | 2B | no disponible en esta informacion | GGUF | Apache 2.0 (heredada) | Checkpoint de origen; ejecutable con llama.cpp y compatible con el ecosistema GGUF habitual |
| Qwen3-VL-2B-Thinking (original) | 2B | no disponible en esta informacion | safetensors | Apache 2.0 (heredada) | Modelo base de Alibaba; requiere runtime propio para vision-lenguaje |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la comparacion se limita a formato, licencia y contexto declarado.

## Limitaciones y advertencias

- Ausencia total de evidencia de calidad: las puertas de correccion (`golden`, `compare`, `vision`, `consistency`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs, por lo que no hay garantia publicada de que la salida coincida con la referencia de llama.cpp.
- Rendimiento sin medir: no hay cifras de latencia ni throughput, lo que impide estimar coste operativo.
- Muestreo no determinado: el comportamiento de temperature, top_k y seed esta marcado como "?" en la tabla de caracteristicas, lo que afecta a la reproducibilidad.
- Riesgo de alucinacion inherente a un modelo de 2B con modo thinking siempre activo; el limite de 4.096 tokens de salida puede truncar razonamientos largos.
- Cobertura de idiomas no declarada; no se puede asumir calidad en castellano sin evaluacion previa.
- Dependencia de hardware muy especifico (gfx1151 y gfx1201) y de la version exacta `hrx-loom[hf]==0.2.0`; no se documenta compatibilidad con otras GPUs.
- Artefacto con cero descargas y cero likes: sin validacion de la comunidad, adecuado solo para evaluacion controlada.
- Licencia Apache 2.0 permite uso comercial, pero el paquete hereda las condiciones del modelo base Qwen3-VL y del GGUF de Unsloth; conviene verificar las tarjetas de origen antes de produccion.
- El contexto de 262.144 tokens declarado no se ha validado contra la puerta `golden` (documentos de 1k a 32k), por lo que su comportamiento en ventanas muy largas es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3-VL-2B-Thinking-loom
- Modelo base (GGUF de Unsloth): https://huggingface.co/unsloth/Qwen3-VL-2B-Thinking-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
