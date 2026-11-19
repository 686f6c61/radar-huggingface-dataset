# loom-draft/CMSManhattan-JiRackUltra_1b-loom

## Resumen

JiRackUltra_1b es un modelo de lenguaje de aproximadamente 1.000 millones de parametros desarrollado por CMSManhattan. El checkpoint original se distribuye en formato GGUF (cuantizacion Q4_K_M) y esta pensado para ejecucion local en hardware modesto. La ficha que nos ocupa, `loom-draft/CMSManhattan-JiRackUltra_1b-loom`, no es el modelo en si, sino un paquete de despliegue generado con la herramienta `loom-next` que empaqueta los pesos del GGUF original junto con programas `.loom` y una tarjeta `model.json` para ejecutarlo sobre la pila Loom de AMD.

El paquete esta orientado especificamente a dos aceleradores de AMD: la APU Ryzen AI Max+ 395 ("Strix Halo", arquitectura gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM). La generacion del paquete se realizo de forma automatica con el generador `loom-next`, sin intervencion de un LLM en el bucle, y los pesos del modelo base no se han modificado.

Su relevancia es acotada pero concreta: demuestra el flujo de trabajo de Loom para portar un GGUF existente a un runtime alternativo basado en kernels generados, con una API compatible con OpenAI (`/v1/chat/completions`). No obstante, las mediciones de rendimiento y las compuertas de correccion del paquete figuran como "not yet re-measured", por lo que no hay evidencia publicada de su comportamiento en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de ~1B parametros; arquitectura no especificada en la informacion proporcionada) |
| Parametros totales | ~1.000 millones (deducido del nombre; cifra exacta no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base); paquete Loom con `weights.loom`, `program/*.loom`, `tokenizer.json`, `llm_config.json`, `model.json` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura del modelo base JiRackUltra_1b ni sus datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas de alineamiento). El paquete Loom no modifica los pesos: se limita a generar programas `.loom` y kernels a partir de `llm_config.json` y del GGUF Q4_K_M original, de modo que la arquitectura subyacente es la del checkpoint de CMSManhattan.

La innovacion tecnica relevante esta en la capa de despliegue, no en el modelo. Loom genera kernels especificos para las arquitecturas AMD objetivo y los expone mediante `loom-serve`, con opciones de configuracion como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (reserva anticipada del pool de memoria) y `--parameter_mode=preload` (carga de pesos en host). La tarjeta menciona compuertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp, pero todas aparecen sin medir en el momento de publicacion.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Modo de razonamiento ("reasoning / thinking") siempre activo, segun la tabla de caracteristicas del paquete.
- Contexto de 32.768 tokens por peticion, suficiente para documentos de hasta 32k segun las compuertas de correccion descritas.
- Atencion concurrente de hasta 4 peticiones simultaneas.
- Generacion de hasta 4.096 tokens de salida por peticion.
- Tool calling: no aplicable segun la tarjeta.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no determinada.
- Entrada/salida de audio: no determinada.
- Muestreo (temperatura, top_k, semilla): no determinado.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue local en Strix Halo: ejecutar un asistente conversacional en una APU Ryzen AI Max+ 395 sin GPU dedicada, usando `loom-fetch` y `loom-serve` con el preset incluido y consumiendo la API en `127.0.0.1:8080`.
- Prototipado en Radeon AI PRO R9700: servir el modelo en una GPU de 32 GB para pruebas de integracion con clientes compatibles con OpenAI antes de migrar a un modelo mayor.
- Evaluacion de la pila Loom: usar el paquete como banco de pruebas para validar la generacion de kernels y las compuertas de correccion frente a llama.cpp sobre el mismo GGUF.
- Procesamiento de documentos de hasta 32k tokens: resumen o extraccion de informacion en un unico turno, aprovechando la ventana de contexto configurada.
- Asistente de razonamiento en local: al tener el modo thinking siempre activo, resulta adecuado para tareas de analisis paso a paso en entornos sin conectividad.
- Servicio ligero multiusuario: con 4 peticiones concurrentes y una API estandar, puede atender un pequeno equipo interno en una unica maquina AMD.
- Referencia para pipelines de CI: las compuertas `golden`, `compare` y `consistency` descritas permiten integrar pruebas de regresion de inferencia en un flujo de validacion de kernels.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las compuertas de correccion figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de ~1B parametros, lo que en la practica supone del orden de 1 GB de pesos, aunque la tarjeta no publica cifras de memoria del preset.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se indica compatibilidad con GPUs NVIDIA ni con Radeon consumer; el paquete esta generado para las arquitecturas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Latencia y throughput: no disponibles (las mediciones estan pendientes de re-medicion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| JiRackUltra_1b (paquete Loom) | ~1B | 32.768 | GGUF Q4_K_M + paquete Loom | MIT | Runtime Loom para AMD gfx1151/gfx1201; sin benchmarks publicados |
| JiRackUltra_1b (checkpoint original, CMSManhattan) | ~1B | no disponible | GGUF | MIT | Modelo base sin empaquetar; referencia de correccion en la tarjeta |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | No se han identificado modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de evidencia de correccion: todas las compuertas (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`, `logits`, etc.) figuran como no re-medidas, por lo que no hay garantia publicada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no se puede estimar latencia ni throughput reales en ninguna de las dos GPUs objetivo.
- Compatibilidad de hardware restringida: el paquete esta generado para gfx1151 y gfx1201; no se declara soporte para otras arquitecturas AMD ni para NVIDIA.
- Capacidades no determinadas: tool calling, decodificacion especulativa, entrada de imagen, audio y muestreo aparecen como no aplicables o no determinados, lo que limita su uso en flujos agenticos.
- Idiomas no declarados: se desconoce el soporte multilingue real del modelo base.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al tratarse de un modelo de ~1B, la fiabilidad en tareas complejas es previsiblemente limitada, aunque no se aportan datos al respecto.
- Licencia MIT: permite uso comercial, pero el paquete depende de `hrx-loom` y de la pila Loom, cuyas condiciones de uso no se detallan en la tarjeta.
- Modelo con 0 descargas y 0 likes: sin validacion por parte de la comunidad en el momento de la consulta.
- El aviso de la model card recuerda que el contenido citado son datos del autor y no instrucciones a seguir.

## Enlaces

- Paquete Loom en Hugging Face: https://huggingface.co/loom-draft/CMSManhattan-JiRackUltra_1b-loom
- Modelo base en Hugging Face: https://huggingface.co/CMSManhattan/JiRackUltra_1b
- Repositorio de la pila Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
