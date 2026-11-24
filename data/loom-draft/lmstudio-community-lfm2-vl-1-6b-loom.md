# loom-draft/lmstudio-community-LFM2-VL-1.6B-loom

## Resumen

LFM2-VL-1.6B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `lmstudio-community/LFM2-VL-1.6B-GGUF`, concretamente el fichero `LFM2-VL-1.6B-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta orientado a dos aceleradores AMD concretos: la APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se trata, por tanto, de un modelo nuevo entrenado desde cero, sino de un artefacto de empaquetado y compilacion de kernels para el runtime Loom.

El modelo subyacente es LFM2-VL-1.6B, un modelo de lenguaje y vision de 1.600 millones de parametros, cuantizado en Q4_K_M. El paquete se genero con la herramienta `loom-next` (solo el generador, sin LLM en el bucle) y expone una API compatible con OpenAI en el endpoint `/v1/chat/completions`. La licencia declarada es MIT, heredada del modelo base.

Su relevancia es acotada pero tecnica: demuestra el flujo de trabajo de Loom para compilar y servir modelos GGUF sobre ROCm en hardware AMD de consumo y profesional, con soporte declarado de contexto de 128.000 tokens por peticion y 4 peticiones concurrentes. La informacion publicada no incluye mediciones de rendimiento ni evidencias de correccion para este paquete en concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2-VL; el paquete Loom no la detalla) |
| Parametros totales | 1.600 millones (1.6B) |
| Parametros activos | no aplica (no consta como MoE) |
| Longitud de contexto | 128.000 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF de origen; empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | `/v1/chat/completions` estilo OpenAI |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | Loom (`hrx-loom[hf]==0.2.0`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base LFM2-VL-1.6B ni sobre su proceso de entrenamiento (composicion del dataset, numero de tokens, uso de RLHF o DPO) en la informacion proporcionada. El paquete Loom no entrena ni modifica los pesos: parte del GGUF Q4_K_M publicado por `lmstudio-community` y genera programas `.loom` especificos para las arquitecturas AMD gfx1151 y gfx1201, junto con el tokenizador (`tokenizer.json`) y la configuracion (`llm_config.json`).

La innovacion tecnica del artefacto es el propio pipeline de Loom: compilacion de kernels para ROCm a partir de un GGUF, con un sistema de compuertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF. En esta publicacion todas las compuertas aparecen como «not yet re-measured» en ambas GPUs, es decir, sin evidencia registrada. El modelo base es multimodal (acepta imagenes), pero Loom no soporta entrada de imagen en este paquete.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI.
- Contexto largo: hasta 128.000 tokens por peticion.
- Hasta 4 peticiones concurrentes con salida maxima de 4.096 tokens.
- Soporte de muestreo configurable (temperature, top_k, seed) segun el diseno de Loom, aunque la compuerta `sampling` no tiene medicion registrada.
- Sin soporte de tool calling ni function calling (marcado como «not applicable»).
- Sin modo de razonamiento o thinking (marcado como «not applicable»).
- Sin decodificacion especulativa (marcada como «not applicable»).
- Sin entrada de imagen en Loom, aunque el modelo base la soporta.
- Sin entrada ni salida de audio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en APU Strix Halo: sirve un modelo de 1.6B cuantizado en Q4_K_M directamente sobre la GPU integrada gfx1151 mediante `loom-serve`, util para prototipos de asistentes conversacionales en un equipo compacto sin GPU dedicada.
- Servicio en Radeon AI PRO R9700: con 32 GB de VRAM, el paquete deja margen amplio para el pool de memoria fijo (`--pool_backing=fixed`) y permite servir las 4 peticiones concurrentes con contexto largo sin presion de memoria.
- Procesamiento de documentos extensos: con 128.000 tokens por peticion, encaja en tareas de resumen o extraccion sobre textos largos, aunque la calidad real dependera del modelo base y no hay benchmarks publicados que la respalden.
- Evaluacion de la cadena de herramientas Loom: sirve como caso de prueba para validar `loom-fetch`, `loom-serve` y las compuertas de correccion sobre hardware AMD concreto antes de adoptar el runtime en produccion.
- Integracion en aplicaciones con cliente OpenAI: cualquier cliente que hable con `/v1/chat/completions` puede apuntar a `http://127.0.0.1:8080` sin cambios de codigo, lo que facilita pruebas de compatibilidad.
- Entornos de investigacion con restricciones de licencia: la licencia MIT del modelo base y del paquete permite uso comercial y modificacion sin las restricciones de licencias tipo Llama.
- Prototipado de asistentes de voz o agentes: no es adecuado, ya que tool calling, audio y modo thinking no estan soportados en este paquete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento frente a llama.cpp «no se han vuelto a medir» tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), y que todas las compuertas de correccion figuran como «not yet re-measured».

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el fichero es un GGUF Q4_K_M de un modelo de 1.6B, por lo que el peso de los pesos ronda el gigabyte, aunque el pool de memoria de Loom y el contexto de 128.000 tokens anaden consumo adicional no cuantificado en la informacion.
- GPU soportadas segun la model card: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras GPU, ni NVIDIA ni Radeon de consumo.
- GPU de consumo: no hay confirmacion de soporte en RTX 4090 ni en Radeon RX de consumo; el paquete esta generado para las dos arquitecturas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; la model card no incluye cifras para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2-VL-1.6B-loom (este paquete) | 1.6B | 128.000 tokens | MIT | GGUF empaquetado en `.loom` | Solo AMD gfx1151 y gfx1201; sin benchmarks publicados |
| lmstudio-community/LFM2-VL-1.6B-GGUF | 1.6B | no disponible | MIT | GGUF | Modelo base sin modificar; sirve como referencia de llama.cpp |
| Alternativas de ~1-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la unica comparacion documentada es metodologica (las compuertas de Loom se validan contra llama.cpp sobre el mismo GGUF).

## Limitaciones y advertencias

- Sin evidencia de correccion: todas las compuertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como no medidas, por lo que no hay garantia publicada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no se puede estimar latencia ni throughput a partir de la informacion publicada.
- Cobertura de hardware muy restringida: solo se declaran Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte documentado para otras GPU.
- Funcionalidades ausentes: sin tool calling, sin modo thinking, sin decodificacion especulativa, sin entrada de imagen (a pesar de que el modelo base es multimodal) y sin audio.
- Idiomas no declarados: no se especifica que lenguas cubre el modelo base, lo que impide garantizar calidad en castellano.
- Riesgo de alucinacion: no cuantificado en la informacion; es un modelo de 1.6B, tamano en el que las alucinaciones suelen ser mas frecuentes, pero no hay datos publicados que lo confirmen para este checkpoint.
- Sesgos: no documentados en la informacion proporcionada.
- Licencia MIT: permite uso comercial y modificacion, pero conviene verificar las condiciones del modelo base original de LFM2-VL antes de redistribuir.
- Madurez: el paquete tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en noviembre de 2026; es un artefacto reciente y sin validacion de la comunidad.
- El contenido de la model card se ha tratado como datos de referencia, no como instrucciones.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/loom-draft/lmstudio-community-LFM2-VL-1.6B-loom
- Modelo base en GGUF: https://huggingface.co/lmstudio-community/LFM2-VL-1.6B-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
