# loom-draft/unsloth-Ornith-1.0-9B-loom

## Resumen

Ornith-1.0-9B es un modelo de lenguaje multimodal (texto e imagen) de 9.000 millones de parámetros, distribuido originalmente por el usuario `unsloth` como checkpoint GGUF cuantizado en Q4_K_M. El repositorio analizado, `loom-draft/unsloth-Ornith-1.0-9B-loom`, no contiene pesos nuevos ni un fine-tuning: es un paquete de despliegue generado automáticamente con la herramienta `loom-next` para ejecutar el GGUF original sobre GPUs AMD mediante el runtime Loom (basado en ROCm).

El paquete está pensado para dos aceleradores concretos: el SoC AMD Ryzen AI Max+ 395 «Strix Halo» (arquitectura gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM). Incluye programas `.loom` generados, un `model.json` con los ficheros fuente fijados por hash, el tokenizador y el proyector multimodal `mmproj-BF16.gguf` para la entrada de imágenes.

Su relevancia es de nicho: demuestra el flujo de empaquetado de Loom para servir modelos GGUF con API compatible con OpenAI sobre hardware AMD, incluyendo tool calling, modo de razonamiento e imágenes. No aporta mejoras de calidad sobre el modelo base y, en el momento de la publicación, ninguna de las puertas de corrección ni las mediciones de rendimiento habían sido re-medidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal; el paquete no la documenta) |
| Parametros totales | 9B (según el nombre del checkpoint base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (único peso incluido); proyector de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Ornith-1.0-9B-Q4_K_M.gguf`) + `mmproj-BF16.gguf`; artefactos adicionales `program/*.loom`, `weights.loom`, `tokenizer.json`, `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (ROCm) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Ornith-1.0-9B ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO). La model card del paquete no la incluye y el repositorio no contiene pesos propios: referencia el GGUF de `unsloth/Ornith-1.0-9B-GGUF` sin modificarlo.

Lo que sí documenta el paquete es la capa de ejecución: `loom-next` genera programas `.loom` (kernels y grafo de ejecución) a partir del GGUF, sin LLM en el bucle de generación. El paquete declara soporte de decodificación con proyector multimodal separado (`mmproj-BF16.gguf`), modo de razonamiento activado por defecto y desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`, y tool calling en formato OpenAI. La decodificación especulativa y el ajuste de esfuerzo de razonamiento figuran como no aplicables. El muestreo aparece como «no determinado».

## Capacidades

- Generación de texto conversacional vía `/v1/chat/completions` con esquema compatible con OpenAI.
- Entrada de imágenes mediante partes `image_url` en el mensaje, procesadas por el proyector `mmproj-BF16.gguf` (pipeline `image-text-to-text`).
- Tool calling con campos `tools` y `tool_calls` en formato OpenAI.
- Modo de razonamiento (thinking) activado por defecto, desactivable por petición.
- Conversaciones multi-turno con historial reutilizado (según la puerta de corrección `agent`).
- Contexto largo de hasta 262.144 tokens por petición.
- Hasta 4 peticiones concurrentes por instancia.
- Sin soporte de audio ni de salida de audio.
- Sin decodificación especulativa ni control de esfuerzo de razonamiento.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistente conversacional sobre GPU AMD de escritorio o estación de trabajo: el paquete se sirve con `loom-serve` y expone una API compatible con OpenAI, lo que permite conectar clientes existentes sin adaptadores. Adecuado para entornos donde no hay CUDA disponible.
- Análisis de documentos largos con imágenes intercaladas: la ventana de 262.144 tokens permite introducir contratos, informes o manuales completos junto con capturas o diagramas y formular preguntas sobre el conjunto.
- Automatización de soporte técnico con capturas de pantalla: el modelo acepta `image_url` y puede describir errores mostrados en una imagen y proponer pasos de resolución en una misma conversación multi-turno.
- Agentes con herramientas en local: el soporte de `tools`/`tool_calls` y el bucle multi-turno permiten construir agentes que consulten APIs internas o bases de datos sin salir del hardware del usuario.
- Extracción de datos de formularios y facturas escaneadas: combinando entrada de imagen y contexto largo se pueden procesar lotes documentales y devolver campos estructurados vía tool calling.
- Prototipado y evaluación de modelos GGUF en hardware AMD: el paquete incluye puertas de corrección (`golden`, `compare`, `vision`, `agent`) que permiten verificar la fidelidad frente a la referencia de llama.cpp sobre el mismo GGUF.
- Despliegue en el borde con Strix Halo: al ejecutarse en un SoC con memoria unificada, sirve para asistentes locales con requisitos de privacidad estrictos y sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para ambas GPUs «no se han vuelto a medir» y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como no re-medidas, por lo que no hay evidencia registrada de fidelidad numérica ni de throughput.

## Requisitos de hardware

- VRAM estimada: un checkpoint de 9B en Q4_K_M ocupa aproximadamente 5-6 GB de pesos, más el proyector de visión en BF16 y las cachés KV para 262.144 tokens de contexto, que pueden dominar el consumo en secuencias largas. No se han publicado cifras exactas de memoria del preset.
- GPU soportadas explícitamente: AMD Radeon AI PRO R9700 (32 GB, gfx1201) y AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151, memoria unificada).
- No se documenta compatibilidad con GPUs NVIDIA ni con hardware consumer de AMD distinto de los anteriores.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir. Opciones relevantes: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.
- No se mencionan vLLM, llama.cpp, Ollama ni TGI como vías de despliegue de este paquete; llama.cpp aparece únicamente como referencia de corrección.
- Latencia y throughput: no disponibles (no re-medidos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.0-9B (paquete Loom) | 9B | 262.144 | MIT | GGUF Q4_K_M + `.loom` | Solo AMD gfx1151/gfx1201; tool calling, visión y thinking; sin benchmarks publicados |
| unsloth/Ornith-1.0-9B-GGUF (base) | 9B | no disponible en la información | no disponible en la información | GGUF | Checkpoint de origen; el paquete Loom lo referencia sin modificar |
| Alternativas de 9B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- El repositorio no contiene pesos propios ni un modelo nuevo: es un artefacto de despliegue generado automáticamente. Cualquier limitación del modelo base Ornith-1.0-9B se hereda sin cambios.
- Ausencia total de evidencia de corrección: las once puertas de la tabla de correctness figuran como no re-medidas, por lo que no hay verificación publicada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no se puede estimar throughput ni latencia para ninguna de las dos GPUs objetivo.
- Compatibilidad de hardware muy restringida: solo se documentan gfx1151 y gfx1201; no hay soporte declarado para CUDA ni para otras GPUs AMD.
- Idiomas soportados no disponibles: no se puede garantizar calidad en castellano ni en otros idiomas sin evaluación previa.
- Riesgo de alucinación: inherente a los modelos de 9B; no hay datos de evaluación que permitan acotarlo.
- Sesgos: no documentados por el autor del paquete ni por la información disponible.
- Concurrencia limitada a 4 peticiones y salida máxima de 4.096 tokens por respuesta, lo que restringe escenarios de alta carga o generaciones muy largas.
- El muestreo figura como «no determinado», lo que impide conocer el comportamiento exacto de temperatura, top_k y semilla sin pruebas propias.
- Licencia MIT declarada en el paquete, pero la licencia del checkpoint base no se detalla en la información disponible; conviene verificarla antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/unsloth-Ornith-1.0-9B-loom
- Checkpoint base en GGUF: https://huggingface.co/unsloth/Ornith-1.0-9B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
