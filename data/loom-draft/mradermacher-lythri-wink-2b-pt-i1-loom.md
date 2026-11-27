# loom-draft/mradermacher-Lythri-Wink-2B-pt-i1-loom

## Resumen

Lythri-Wink-2B-pt-i1 (Q4_K_M) para AMD Loom es un paquete de despliegue en formato `.loom` que empaqueta el checkpoint GGUF original de `mradermacher/Lythri-Wink-2B-pt-i1-GGUF`, concretamente el fichero `Lythri-Wink-2B-pt.i1-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` dentro del ecosistema Loom, un runtime de inferencia orientado a GPUs AMD que genera kernels especificos para cada modelo y arquitectura de hardware. No se trata de un modelo nuevo entrenado, sino de una distribucion precompilada del modelo base de 2B parametros para ejecutarse sobre el stack Loom.

El paquete esta dirigido a dos aceleradores AMD concretos: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Se genera con la herramienta `loom-next` (solo el generador, sin LLM en el bucle) y se sirve mediante `loom-serve`, que expone una API compatible con el endpoint `/v1/chat/completions` de OpenAI. Su relevancia radica en que demuestra un flujo de despliegue alternativo a llama.cpp sobre hardware AMD consumer y profesional, con soporte declarado de tool calling, modo thinking opcional y 131.072 tokens de contexto por peticion.

El modelo base es un transformer de 2B parametros afinado a partir de un checkpoint previo (`Lythri-Wink-2B-pt`), cuantizado a Q4_K_M. La model card del paquete no documenta la composicion del dataset de entrenamiento, los idiomas soportados ni resultados de benchmarks; toda la informacion tecnica disponible se refiere al empaquetado y al runtime, no al proceso de entrenamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible en la informacion proporcionada) |
| Parametros totales | 2B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Lythri-Wink-2B-pt.i1-Q4_K_M.gguf`) empaquetado como `.loom` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` |
| Modelo base | `mradermacher/Lythri-Wink-2B-pt-i1-GGUF` |
| Tamano del repo | 0,0 GB (segun Hugging Face; probablemente incompleto o pendiente de subida) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de su naturaleza de transformer de 2B parametros. No se especifican el numero de capas, la dimension oculta, el tipo de atencion ni si incorpora innovaciones como atencion lineal o mezcla de expertos. Tampoco se documentan los datos de entrenamiento: numero de tokens, composicion del corpus, uso de RLHF o DPO ni procesos de alineacion.

Lo que si esta documentado es la capa de despliegue. El paquete `.loom` contiene programas compilados y un fichero `model.json` que describe el modelo y fija los ficheros fuente con verificacion sha256 (`model.json.lock`). La generacion se realiza con `loom-next`, que produce kernels especificos para la GPU objetivo en lugar de reutilizar kernels genericos. El runtime `loom-serve` permite configurar el modo de espera de las operaciones GPU (`completion_spin_ns=4294967295` para espera activa), la gestion de memoria (`--pool_backing=fixed` para reservar el pool por adelantado) y la carga de pesos (`--parameter_mode=preload`). Estas opciones afectan al rendimiento y a la latencia, pero no modifican los pesos del modelo.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de llamadas a herramientas.
- Modo razonamiento o thinking opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Contexto largo de hasta 131.072 tokens por peticion, adecuado para documentos extensos.
- Concurrencia de hasta 4 peticiones simultaneas con garantia de consistencia declarada (misma salida que en ejecucion aislada, segun el gate `consistency`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: el modelo upstream la soporta, pero Loom no la expone (imagen no soportada en este paquete).
- Audio: el modelo upstream lo soporta, pero Loom no lo expone.
- Decodificacion especulativa: no aplicable en este paquete.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete se sirve con `loom-serve` sobre una Radeon AI PRO R9700 o un Ryzen AI Max+ 395, ofreciendo un endpoint compatible con OpenAI que cualquier cliente existente puede consumir sin cambios en el codigo.
- Agentes con tool calling en entornos controlados: el soporte de `tools` y `tool_calls` en formato OpenAI permite integrar el modelo en frameworks de agentes que ya hablan ese protocolo, con bucles multi-turno verificados por el gate `agent`.
- Procesamiento de documentos largos: con 131.072 tokens de contexto por peticion, el modelo puede ingerir contratos, informes o transcripciones extensas en una sola pasada, util para resumen y extraccion de entidades en pipelines internos.
- Prototipado rapido sobre hardware AMD: al ser un paquete precompilado para gfx1151 y gfx1201, reduce el trabajo de configuracion de kernels y permite validar flujos de inferencia en hardware AMD sin pasar por llama.cpp.
- Razonamiento con modo thinking para tareas de analisis: activando `enable_thinking`, el modelo puede emplearse en tareas que requieren pasos intermedios explicitos, como clasificacion razonada o respuesta a preguntas sobre documentacion tecnica.
- Despliegue en laboratorio o docencia: la licencia MIT y el tamano de 2B en Q4_K_M facilitan su uso en entornos academicos y pruebas de concepto sobre GPUs AMD de gama profesional o APUs Strix Halo.
- Evaluacion comparativa de runtimes: el paquete incluye gates de correccion (`kernel_tests`, `golden`, `compare`, `agent`, `sampling`, `logits`, entre otros) que permiten contrastar la salida de Loom frente a llama.cpp sobre el mismo GGUF, util para equipos que evaluan motores de inferencia alternativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" ("not yet re-measured"), y que los gates de correccion no tienen ejecuciones registradas. Un gate sin ejecucion registrada no aporta evidencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Para un modelo de 2B en Q4_K_M, la huella de pesos ronda los 1,3-1,5 GB, pero el paquete reserva un pool de memoria fijo (`--pool_backing=fixed`) cuyo tamano no se detalla en la informacion proporcionada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs consumer: no confirmada. El paquete esta generado para gfx1151 y gfx1201; no se indica soporte para otras arquitecturas AMD ni para GPUs NVIDIA.
- Opciones de despliegue: `loom-serve` mediante el paquete `hrx-loom[hf]==0.2.0` instalado con pipx, con `loom-fetch` para descargar el paquete desde Hugging Face.
- Concurrencia: 4 peticiones simultaneas.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Lythri-Wink-2B-pt-i1 (este paquete) | 2B | 131.072 tokens | GGUF Q4_K_M empaquetado en `.loom` | MIT | Solo GPUs AMD gfx1151 y gfx1201; tool calling y thinking opcional; sin benchmarks publicados |
| mradermacher/Lythri-Wink-2B-pt-i1-GGUF | 2B | no disponible | GGUF | MIT (heredada) | Checkpoint original sin empaquetar; ejecutable con llama.cpp y otros runtimes GGUF |
| Alternativas de 2B en GGUF (generico) | ~2B | variable | GGUF | variable | no disponible: no se identifican modelos comparables concretos en la informacion proporcionada |

No se dispone de datos de rendimiento del modelo base ni de alternativas concretas en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- No hay resultados de benchmarks ni de los gates de correccion: la model card indica que todas las mediciones estan pendientes de repetir, por lo que no existe evidencia publicada de calidad de salida frente a llama.cpp.
- El paquete solo esta generado para dos arquitecturas AMD concretas (gfx1151 y gfx1201); no se garantiza su funcionamiento en otras GPUs.
- Vision y audio no estan soportados por Loom aunque el modelo upstream los tenga; el paquete no expone esas capacidades.
- El tamano del repositorio en Hugging Face figura como 0,0 GB, lo que sugiere que los ficheros pueden no estar completamente subidos o que la metadata no refleja el contenido real; conviene verificar la integridad antes de desplegar.
- La licencia MIT permite uso comercial, pero se hereda del modelo base; conviene revisar las condiciones del checkpoint original `mradermacher/Lythri-Wink-2B-pt-i1-GGUF` y de su predecesor `Lythri-Wink-2B-pt`.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones idiomaticas del modelo base en la informacion proporcionada.
- El limite de 4.096 tokens de salida por peticion puede ser insuficiente para tareas de generacion larga.
- La concurrencia maxima es de 4 peticiones, adecuada para uso personal o de laboratorio, pero no para cargas de produccion de alta demanda.
- El modo thinking esta desactivado por defecto; los flujos que lo requieran deben activarlo explicitamente con `chat_template_kwargs`.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-Lythri-Wink-2B-pt-i1-loom
- Modelo base GGUF: https://huggingface.co/mradermacher/Lythri-Wink-2B-pt-i1-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
