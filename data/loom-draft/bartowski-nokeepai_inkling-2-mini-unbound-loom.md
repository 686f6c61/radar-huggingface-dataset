# loom-draft/bartowski-nokeepai_Inkling-2-Mini-Unbound-loom

## Resumen

`loom-draft/bartowski-nokeepai_Inkling-2-Mini-Unbound-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF `bartowski/nokeepai_Inkling-2-Mini-Unbound-GGUF`, concretamente la cuantizacion `Q4_K_M`. No contiene pesos nuevos ni un modelo entrenado desde cero: es un artefacto de empaquetado que traduce el GGUF original a un formato ejecutable por el runtime Loom sobre GPUs AMD, con soporte especifico para el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete lo publica el usuario `loom-draft` y se ha generado con la herramienta `loom-next`, un generador automatico de paquetes Loom sin intervencion de un LLM en el bucle. El modelo subyacente, `nokeepai_Inkling-2-Mini-Unbound`, es un modelo de la familia Inkling-2-Mini en su variante "Unbound"; la informacion disponible no detalla su arquitectura interna ni su numero de parametros, solo que el checkpoint original tiene capacidad de entrada de imagen (vision) segun la model card, aunque el runtime Loom no la soporta.

Su relevancia es acotada pero concreta: permite servir el modelo con una API compatible con OpenAI (`/v1/chat/completions`) sobre hardware AMD consumer y profesional, con una ventana de contexto de 262.144 tokens por peticion, modo de razonamiento siempre activo y control de esfuerzo de razonamiento (`reasoning_effort`) en seis niveles. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano reportado es de 0.0 GB, lo que sugiere que los binarios pueden no estar materializados o que las metricas no se han actualizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente Inkling-2-Mini; el paquete es un artefacto Loom) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` + `model.json` |
| Modelo base | `bartowski/nokeepai_Inkling-2-Mini-Unbound-GGUF` |
| Concurrencia | 4 peticiones simultaneas |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Modo razonamiento | siempre activo, con `reasoning_effort` (minimal, low, medium, high, xhigh, max; por defecto high) |
| Tool calling | no aplicable segun la model card |
| Decodificacion especulativa | no aplicable |
| Entrada de imagen | no soportada por Loom (el modelo original si la tiene) |
| Entrada/salida de audio | no aplicable |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo subyacente `nokeepai_Inkling-2-Mini-Unbound`: no se especifica si es un transformer denso, un MoE, un modelo hibrido ni el numero de parametros o tokens de entrenamiento. Lo unico documentado es que existe un checkpoint GGUF publicado por `bartowski` y que el modelo original admite entrada de imagen, capacidad que el runtime Loom no implementa.

El artefacto de este repositorio no entrena nada: es un paquete generado por `loom-next` que compila kernels y programas `.loom` para ejecutar el GGUF `Q4_K_M` sin modificarlo sobre las GPUs AMD indicadas. La model card menciona un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida de Loom contra una referencia de llama.cpp registrada sobre el mismo GGUF, pero todas aparecen como "not yet re-measured" en el momento de la publicacion, es decir, sin evidencia registrada.

## Capacidades

- Generacion de texto conversacional a traves de una API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento en modo "thinking" siempre activo, con seis niveles de esfuerzo configurables mediante `reasoning_effort` (minimal, low, medium, high, xhigh, max; valor por defecto high).
- Contexto largo de hasta 262.144 tokens por peticion, adecuado para documentos extensos o historiales de conversacion prolongados.
- Concurrencia de hasta 4 peticiones simultaneas, con una puerta de consistencia que verifica que las respuestas concurrentes coinciden con las ejecutadas de forma aislada.
- Generacion limitada a 4.096 tokens de salida por peticion segun el preset.
- Tool calling: no soportado segun la model card (marcado como "not applicable").
- Decodificacion especulativa: no soportada.
- Vision: no soportada por Loom, aunque el modelo original la tiene.
- Audio: no soportado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Procesamiento de documentos largos en local: con 262.144 tokens de contexto por peticion, el modelo puede ingerir contratos, informes o bases de codigo extensas en una sola pasada sobre una GPU AMD Radeon AI PRO R9700 de 32 GB, sin fragmentar el texto en trozos.
- Asistente de razonamiento en estaciones de trabajo AMD: el modo thinking siempre activo y los seis niveles de `reasoning_effort` permiten ajustar el coste computacional por consulta, usando `minimal` para tareas triviales y `high` o `max` para analisis complejos en un Ryzen AI Max+ 395.
- Despliegue de un endpoint compatible con OpenAI en infraestructura AMD: al exponer `/v1/chat/completions`, se puede integrar como backend de herramientas que ya hablan el protocolo OpenAI sin adaptadores adicionales, sobre hardware Radeon en lugar de CUDA.
- Prototipado y evaluacion de modelos en hardware consumer AMD: el paquete permite comparar la salida de Loom contra llama.cpp sobre el mismo GGUF mediante las puertas `golden` y `compare`, util para validar la fidelidad del runtime antes de adoptarlo.
- Servicio de chat con concurrencia moderada: las 4 peticiones simultaneas y la puerta de consistencia lo hacen apto para equipos pequenos o entornos de demostracion donde no se requiere alta concurrencia.
- Analisis de imagenes: no aplicable en este paquete, ya que Loom no soporta la entrada de imagen que si tiene el modelo original; para vision habria que recurrir al checkpoint GGUF con otro runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican explicitamente que "the results for this package are not yet re-measured". Del mismo modo, todas las puertas de correccion aparecen como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible con precision, ya que no se conoce el numero de parametros del modelo. El paquete esta pensado para la Radeon AI PRO R9700 con 32 GB y para el Ryzen AI Max+ 395 "Strix Halo", que comparte memoria unificada entre CPU y GPU.
- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que apunta a `amdgpu://` mediante el runtime Loom.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` con el preset `chat` (Strix Halo) o `chat-r9700` (R9700) y `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Alternativas de despliegue no Loom (llama.cpp, Ollama, vLLM, TGI): no documentadas en la informacion proporcionada para este paquete; llama.cpp se usa como referencia de correccion, no como opcion de servicio del paquete.
- Latencia y throughput: no disponibles; las mediciones de rendimiento no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo subyacente que permitan una comparacion fundamentada con alternativas de la misma categoria. El unico punto de comparacion mencionado es llama.cpp, usado como referencia de correccion sobre el mismo GGUF, no como modelo distinto.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamano reportado de 0.0 GB; conviene verificar que los binarios estan efectivamente materializados antes de usarlo.
- Ninguna de las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`, `logits`, etc.) tiene evidencia registrada: todas figuran como "not yet re-measured", por lo que no hay validacion publicada de fidelidad frente a llama.cpp.
- No hay mediciones de rendimiento publicadas para ninguna de las dos GPUs objetivo.
- Tool calling no soportado, lo que descarta su uso en pipelines de agentes que dependan de function calling.
- Vision no soportada por Loom pese a que el modelo original la tiene; la puerta `vision` no puede aprovecharse en este paquete.
- Limite de 4.096 tokens de salida por peticion, que puede ser insuficiente para generacion de documentos largos.
- Concurrencia maxima de 4 peticiones, insuficiente para cargas de produccion con trafico elevado.
- Solo se incluye la cuantizacion Q4_K_M; no hay variantes de mayor o menor precision en el paquete.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Licencia MIT declarada en el paquete; el modelo base es de `nokeepai` via `bartowski` y su licencia original no se detalla en la informacion proporcionada, por lo que conviene verificar los terminos del checkpoint de origen antes de un uso comercial.
- Dependencia de un runtime especifico (`hrx-loom==0.2.0`) y de hardware AMD concretos; no es portable a CUDA sin trabajo adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-nokeepai_Inkling-2-Mini-Unbound-loom
- Modelo base GGUF: https://huggingface.co/bartowski/nokeepai_Inkling-2-Mini-Unbound-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
