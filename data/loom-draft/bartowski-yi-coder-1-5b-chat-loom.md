# loom-draft/bartowski-Yi-Coder-1.5B-Chat-loom

## Resumen

Yi-Coder-1.5B-Chat en formato Loom es un paquete de despliegue (`.loom` y `model.json`) generado por el usuario loom-draft a partir del checkpoint GGUF sin modificar `bartowski/Yi-Coder-1.5B-Chat-GGUF`, concretamente la cuantizacion `Yi-Coder-1.5B-Chat-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los originales de Yi-Coder-1.5B-Chat, un modelo de lenguaje especializado en codigo desarrollado por 01.AI, empaquetado para ejecutarse sobre el runtime Loom en GPUs AMD.

El paquete esta orientado a dos aceleradores concretos: el AMD Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). La generacion se realizo con la herramienta `loom-next` (solo el generador, sin LLM en el bucle) y expone un servidor compatible con la API `/v1/chat/completions` de estilo OpenAI a traves de `loom-serve`. Su relevancia es practica: permite servir un modelo de codigo de 1.5B parametros en hardware AMD consumer y profesional sin depender de CUDA ni de llama.cpp, con un contexto declarado de 131.072 tokens por peticion y hasta 4 peticiones concurrentes.

La ficha tecnica del autor no incluye resultados de rendimiento ni de correccion: todas las puertas de validacion (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, etc.) aparecen como "not yet re-measured", y las comparativas frente a llama.cpp en ambas GPUs estan pendientes de re-medicion. La licencia declarada es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Yi-Coder-1.5B-Chat, modelo base); empaquetado como programas Loom generados |
| Parametros totales | 1.500 millones (1.5B, segun el modelo base Yi-Coder-1.5B-Chat) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens por peticion (declarado en la feature table del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen); el paquete incluye `weights.loom` generado a partir de ese checkpoint |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF de origen (`Yi-Coder-1.5B-Chat-Q4_K_M.gguf`); empaquetado en `program/*.loom`, `weights.loom`, `tokenizer.json`, `llm_config.json`, `info.json` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | no soportado (marcado "not applicable") |
| Vision / audio | no soportado |
| Decodificacion especulativa | no soportada ("not applicable") |
| Thinking / reasoning effort | no soportado |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El modelo subyacente es Yi-Coder-1.5B-Chat de 01.AI, un transformer decoder-only de 1.500 millones de parametros especializado en generacion de codigo y conversacion tecnica. El paquete Loom no modifica ni reentrena esos pesos: toma el GGUF cuantizado en Q4_K_M publicado por bartowski y genera, mediante `loom-next`, un conjunto de programas `.loom` (`program/*.loom` y `weights.loom`) que implementan el grafo de inferencia para las arquitecturas AMD gfx1151 y gfx1201. La configuracion desde la que se generaron los programas queda registrada en `llm_config.json`, y las versiones, mediciones y evidencia de puertas en `info.json`.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si el modelo base paso por RLHF o DPO; esos datos corresponden a la model card original de Yi-Coder y no se reproducen en este paquete. La innovacion tecnica del artefacto es el propio pipeline de generacion y despliegue: kernels generados especificamente para GPUs AMD, servidor con pooling de memoria fijo (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`), con espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). El autor advierte que las mediciones de rendimiento de la tarjeta se tomaron con esa espera activa y sin `--parameter_mode=preload` salvo que el job concreto lo usara.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato chat, servida mediante API compatible con OpenAI.
- Generacion y asistencia en codigo, heredada del modelo base Yi-Coder-1.5B-Chat.
- Ventana de contexto de 131.072 tokens por peticion, adecuada para documentos largos o repositorios extensos.
- Hasta 4 peticiones concurrentes con pooling de memoria fijo.
- Limite de 4.096 tokens de salida por respuesta (preset `max_tokens`).
- Sin soporte de tool calling ni function calling (marcado "not applicable").
- Sin soporte de razonamiento extendido, thinking mode ni reasoning effort.
- Sin soporte de decodificacion especulativa.
- Sin entrada de imagen ni de audio.
- Muestreo (`temperature`, `top_k`, `seed`): estado "not determined" en la tabla de features del autor.
- Idiomas soportados: no disponible.

## Casos de uso

- Autocompletado y asistencia de codigo en IDE sobre estaciones de trabajo AMD: el modelo puede servirse localmente en una Radeon AI PRO R9700 o en un Strix Halo y responder por `/v1/chat/completions`, evitando enviar codigo propietario a servicios en la nube. Su tamano de 1.5B y la cuantizacion Q4_K_M lo hacen viable en un unico acelerador.
- Revision de fragmentos de codigo y explicacion de funciones: con 131.072 tokens de contexto por peticion se pueden pasar archivos completos o varios modulos en una sola consulta para obtener resumenes, deteccion de errores evidentes o documentacion.
- Generacion de tests unitarios y ejemplos de uso: el modelo base esta entrenado para codigo, y el paquete expone un endpoint estable que se puede integrar en scripts de CI para producir borradores de tests que luego se revisan manualmente.
- Chatbot tecnico interno para equipos de desarrollo: el servidor Loom admite 4 peticiones concurrentes, suficiente para un equipo pequeno que consulte dudas de API, sintaxis o mensajes de error, con la ventaja de que todo el trafico permanece en la red local.
- Prototipado y evaluacion de pipelines de IA en hardware AMD: al estar empaquetado como programas Loom, sirve para validar el runtime `hrx-loom` y comparar su comportamiento frente a llama.cpp con el mismo GGUF, tal como contemplan las puertas `golden` y `compare`.
- Procesamiento por lotes de documentacion tecnica: con contexto largo y salida de hasta 4.096 tokens, se pueden generar resumenes o indices de manuales y ficheros README en una pasada, siempre que el texto quepa en la ventana de 131k tokens.
- Entornos con requisitos de licencia permisiva: la licencia MIT permite incorporar el paquete a productos internos o distribuidos sin las restricciones de licencias copyleft, aunque conviene verificar la licencia del modelo base Yi-Coder de forma independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete indica explicitamente que los resultados para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs. No se aportan cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint de origen es Q4_K_M de un modelo de 1.5B parametros, lo que en la practica ronda 1-1,5 GB de pesos; el paquete Loom anade el pool de memoria fijo configurado por el preset, cuyo tamano no se detalla.
- GPUs soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs consumer: no se declara soporte para GPUs NVIDIA ni para Radeon consumer de gama baja; el paquete esta generado para las dos arquitecturas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/bartowski-Yi-Coder-1.5B-Chat-loom:chat --materialize=copy --output=yi-coder-1.5b-chat` y `loom-serve --model=yi-coder-1.5b-chat '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue (llama.cpp, Ollama, vLLM, TGI): no se mencionan en la informacion disponible; el paquete esta atado al runtime Loom.
- Latencia y throughput: no disponibles; las mediciones comparativas frente a llama.cpp estan pendientes de re-medicion en ambas GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Yi-Coder-1.5B-Chat (Loom, este paquete) | 1.5B | 131.072 tokens por peticion | MIT | `.loom` sobre runtime `hrx-loom`, GPUs AMD gfx1151 y gfx1201 | Sin benchmarks ni puertas de correccion re-medidas |
| Yi-Coder-1.5B-Chat (GGUF original de bartowski) | 1.5B | no disponible en esta ficha | MIT | GGUF, ejecutable con llama.cpp y derivados | Checkpoint de origen del paquete; referencia para las puertas `golden` y `compare` |
| Yi-Coder-9B-Chat | 9B | no disponible en esta ficha | no disponible en esta ficha | safetensors / GGUF | Version mayor de la misma familia; no evaluada en esta informacion |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | no disponible en esta ficha | no disponible en esta ficha | safetensors / GGUF | Alternativa de tamano similar para codigo; sin datos comparativos en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto declarado, licencia y via de despliegue.

## Limitaciones y advertencias

- El paquete no aporta evidencia de correccion: todas las puertas de validacion del autor estan sin re-medir, por lo que no hay garantia publicada de que la salida coincida con la referencia de llama.cpp.
- No hay mediciones de rendimiento (throughput, latencia) para ninguna de las dos GPUs objetivo.
- El modelo base es de 1.5B parametros: su capacidad de razonamiento y de codigo es limitada en comparacion con modelos de 7B o superiores; es propenso a errores en tareas complejas y a alucinaciones en APIs o funciones poco frecuentes.
- Sin soporte de tool calling, function calling, agentes multi-paso, thinking mode, vision ni audio: no es adecuado para pipelines que dependan de esas capacidades.
- Limite de 4.096 tokens de salida por respuesta, lo que restringe la generacion de artefactos largos en una sola llamada.
- Solo 4 peticiones concurrentes; no esta pensado para cargas de produccion de alta concurrencia.
- Idiomas soportados no declarados; el comportamiento multilingue no esta verificado en este paquete.
- Dependencia estricta del runtime `hrx-loom==0.2.0` y de las arquitecturas AMD gfx1151 y gfx1201; no se declara portabilidad a otras GPUs.
- La licencia MIT se declara a nivel de paquete; conviene verificar de forma independiente la licencia y las condiciones del modelo base Yi-Coder-1.5B-Chat antes de un uso comercial.
- Sesgos conocidos del modelo base: no documentados en la informacion disponible.
- El paquete registra 0 descargas y 0 likes en Hugging Face, sin senales de adopcion ni de mantenimiento por parte de terceros.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Yi-Coder-1.5B-Chat-loom
- Modelo base GGUF (bartowski): https://huggingface.co/bartowski/Yi-Coder-1.5B-Chat-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
