# loom-draft/ReadyArt-Wicked-Tutu-26B-A4B-Final-loom

## Resumen

ReadyArt-Wicked-Tutu-26B-A4B-Final-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario loom-draft a partir del checkpoint GGUF ajeno `ReadyArt/Wicked-Tutu-26B-A4B-Final-GGUF`, concretamente el fichero `Wicked-Tutu-26B-A4B-Final-Q4_K_M-hb16.gguf`. No se trata de un modelo entrenado por el autor del repositorio, sino de un artefacto de empaquetado para servir el modelo en GPUs AMD mediante el runtime Loom, generado con la herramienta `loom-next` sin intervención de un LLM en el proceso.

El interés del paquete es de infraestructura: ofrece comandos listos para ejecutar sobre un AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y una AMD Radeon AI PRO R9700 (gfx1201, 32 GB), con una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento opcional y una ventana de contexto de 201.728 tokens por petición con 4 peticiones concurrentes. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos no están alojados en este repositorio sino que se materializan al hacer `loom-fetch`.

La relevancia es acotada pero clara para quien trabaje con hardware AMD: el ecosistema de inferencia para GPUs Radeon e iGPUs Strix Halo es más reducido que el de CUDA, y este tipo de paquetes preconfigurados reducen el trabajo de integración. La model card no incluye, sin embargo, mediciones de rendimiento ni resultados de las puertas de corrección para esta versión concreta: todas las filas aparecen como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del checkpoint base sugiere un modelo de mezcla de expertos, con 26B totales y ~4B activos; no confirmado en la informacion proporcionada) |
| Parametros totales | no disponible (el identificador del modelo base indica 26B) |
| Parametros activos | no disponible (el identificador del modelo base indica A4B, ~4B activos) |
| Longitud de contexto | 201.728 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (fichero `Wicked-Tutu-26B-A4B-Final-Q4_K_M-hb16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación (RLHF/DPO) del modelo base en la información proporcionada. El paquete Loom en sí no entrena ni modifica el modelo: la model card indica explícitamente que se trata del "unmodified GGUF checkpoint" del repositorio `ReadyArt/Wicked-Tutu-26B-A4B-Final-GGUF`. El identificador "26B-A4B" es coherente con un transformer de mezcla de expertos de 26.000 millones de parámetros totales y aproximadamente 4.000 millones activos por token, pero este dato no se confirma en la documentación disponible.

La innovación técnica del paquete es el runtime: Loom genera kernels específicos para las arquitecturas AMD gfx1151 y gfx1201, expone una API estilo OpenAI, soporta tool calling con `tools` y `tool_calls`, y permite activar el modo de razonamiento mediante `chat_template_kwargs: {"enable_thinking": true}` (desactivado por defecto). La decodificación especulativa y el ajuste de esfuerzo de razonamiento se marcan como "not applicable". El paquete se genera con `loom-next` y se distribuye con `loom-fetch`; el servidor se arranca con `loom-serve`, con opciones como `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host).

## Capacidades

- Generación de texto conversacional mediante una API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling / function calling con el esquema OpenAI (`tools` y `tool_calls`), validado por la puerta de corrección `agent`.
- Modo de razonamiento (thinking) opcional, desactivado por defecto y activable por petición; la model card lo marca como soportado.
- Conversaciones multi-turno con reutilización de historial (puerta `agent`).
- Concurrencia de 4 peticiones simultáneas con consistencia de salida respecto a ejecuciones aisladas (puerta `consistency`).
- Contexto largo de hasta 201.728 tokens por petición, con pruebas de referencia registradas sobre documentos de 1k a 32k tokens.
- Salida máxima de 4.096 tokens por petición (preset `max_tokens`).
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream sí la tiene según la model card.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo upstream sí las tiene según la model card.
- Muestreo configurable (temperature, top_k, seed): la model card lo marca como "not determined".

## Casos de uso

- Despliegue de un LLM en un Ryzen AI Max+ 395: el paquete incluye comandos listos para `loom-fetch` y `loom-serve` sobre gfx1151, de modo que un equipo con esa iGPU puede servir un modelo de 26B en Q4_K_M sin compilar kernels a mano.
- Inferencia en estación de trabajo con Radeon AI PRO R9700: el preset `chat-r9700` está ajustado a los 32 GB de esa GPU, lo que permite servir el modelo en una única tarjeta profesional AMD.
- Asistente conversacional con contexto largo: con 201.728 tokens por petición, encaja en tareas de resumen o análisis de documentación extensa (la puerta `golden` cubre documentos de 1k a 32k tokens).
- Agentes con herramientas: el soporte de `tools`/`tool_calls` y la puerta `agent` (bucle multi-turno con validación de llamadas) permiten construir flujos de automatización que consulten APIs externas.
- Razonamiento con activación selectiva: el modo thinking se puede activar solo en las peticiones que lo requieran mediante `chat_template_kwargs`, manteniendo baja la latencia en el resto.
- Sustitución de backend en aplicaciones ya escritas contra la API de OpenAI: al exponer `/v1/chat/completions`, un cliente existente puede apuntar a `http://127.0.0.1:8080` cambiando únicamente la URL base.
- Evaluación comparativa frente a llama.cpp: las puertas `golden`, `compare` y `logits` están diseñadas para contrastar la salida token a token contra una referencia de llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y R9700, pero ambas indican que "the results for this package are not yet re-measured". Del mismo modo, las once puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen como "not yet re-measured" para ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 26B, y el preset de R9700 está dimensionado para una GPU de 32 GB.
- GPU compatibles declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no contempladas en la documentación del paquete.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir; no se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete (llama.cpp aparece solo como referencia de corrección).
- Opciones de arranque relevantes: `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones del paquete no se han vuelto a realizar.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones verificadas del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ReadyArt-Wicked-Tutu-26B-A4B-Final-loom | no disponible (26B segun identificador) | 201.728 tokens | apache-2.0 | paquete Loom sobre GGUF Q4_K_M | Solo AMD gfx1151 y gfx1201; sin benchmarks publicados |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- El repositorio no contiene los pesos (tamaño de 0,0 GB); es necesario ejecutar `loom-fetch` contra Hugging Face para materializar el paquete.
- Ausencia total de evidencia de corrección: las once puertas de la model card figuran como "not yet re-measured", por lo que no hay verificación publicada de que la salida coincida con llama.cpp.
- Sin mediciones de rendimiento para esta versión del paquete en ninguna de las dos GPUs soportadas.
- Compatibilidad restringida a AMD gfx1151 y gfx1201; no hay soporte declarado para CUDA ni para otras arquitecturas.
- La entrada de imagen y la de audio están deshabilitadas en Loom aunque el modelo upstream las soporte, lo que limita las capacidades respecto al checkpoint original.
- El ajuste de esfuerzo de razonamiento y la decodificación especulativa no están disponibles.
- El comportamiento de muestreo (temperature, top_k, seed) figura como "not determined".
- El límite de salida es de 4.096 tokens por petición, inferior a la ventana de contexto de 201.728 tokens.
- La concurrencia está limitada a 4 peticiones simultáneas.
- Repositorio con 0 descargas y 0 likes y creado y actualizado el mismo día (2026-11-19): no hay evidencia de uso en producción ni de mantenimiento continuado.
- Licencia apache-2.0 declarada en el paquete, pero conviene verificar la licencia del checkpoint base `ReadyArt/Wicked-Tutu-26B-A4B-Final-GGUF` antes de un uso comercial.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Wicked-Tutu-26B-A4B-Final-loom
- Modelo base (GGUF): https://huggingface.co/ReadyArt/Wicked-Tutu-26B-A4B-Final-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
