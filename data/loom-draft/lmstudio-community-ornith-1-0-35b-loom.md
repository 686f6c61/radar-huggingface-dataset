# loom-draft/lmstudio-community-Ornith-1.0-35B-loom

## Resumen

Ornith-1.0-35B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` a partir del checkpoint GGUF sin modificar `lmstudio-community/Ornith-1.0-35B-GGUF`, en su cuantización Q4_K_M. No es un modelo entrenado desde cero ni un fine-tune: es un artefacto de empaquetado que traduce los pesos originales a un formato ejecutable por el runtime `loom-serve` sobre GPUs AMD, concretamente la Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se generó con la herramienta `loom-next` sin intervención de un LLM en el bucle.

El modelo subyacente, Ornith-1.0-35B, es un modelo multimodal de tipo image-text-to-text con 35 mil millones de parámetros (según la nomenclatura del checkpoint) y una ventana de contexto de 262.144 tokens por petición. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento (thinking) activado por defecto y entrada de imágenes mediante un proyector separado (`mmproj-Ornith-1.0-35B-BF16.gguf`). La licencia declarada es MIT.

La relevancia de este artefacto es acotada pero específica: permite ejecutar un modelo de 35B con contexto largo y capacidades de visión sobre hardware AMD consumer y profesional (Strix Halo, R9700) mediante un runtime alternativo a llama.cpp, con verificación de kernels y comparación de salidas contra la referencia de llama.cpp. En el momento de redactar esta ficha, el repositorio tiene 0 descargas y 0 likes, y las métricas de rendimiento y las puertas de corrección del paquete aún no se han vuelto a medir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; detalles del transformer no publicados en la informacion disponible) |
| Parametros totales | 35B (segun nomenclatura del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); proyector de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado en formato Loom: programas `.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Ornith-1.0-35B en la documentacion proporcionada. La tarjeta del paquete solo describe el artefacto de despliegue, no el entrenamiento del modelo original: no se detallan el tipo de transformer, la composicion del dataset, el numero de tokens de entrenamiento ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se documenta ninguna innovacion tecnica del modelo subyacente.

Lo que si documenta la tarjeta es la capa de ejecucion. El paquete Loom incluye kernels generados especificamente para las arquitecturas AMD gfx1151 y gfx1201, con un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF (tokens greedy y top-5 log-probs en prompts cortos y documentos de 1k a 32k). En la version actual del repositorio, ninguna de estas puertas tiene medicion registrada. El runtime soporta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset. La decodificacion especulativa figura como no aplicable.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagenes en formato OpenAI (`image_url`), procesadas por el proyector `mmproj-Ornith-1.0-35B-BF16.gguf`.
- Tool calling compatible con el esquema OpenAI (`tools` y `tool_calls`), incluyendo bucles multi-turno de llamadas a herramientas.
- Procesamiento de contexto largo: hasta 262.144 tokens por peticion.
- Servicio concurrente: 4 peticiones simultaneas con consistencia verificada frente a ejecuciones aisladas (puerta `consistency`, sin medicion registrada).
- API HTTP compatible con OpenAI en `/v1/chat/completions`.
- No soporta audio ni entrada/salida de voz. No aplica razonamiento con esfuerzo configurable ni decodificacion especulativa.

## Casos de uso

- Analisis de documentos extensos con imagenes intercaladas: la ventana de 262.144 tokens permite procesar informes, contratos o manuales completos junto con sus figuras y diagramas en una sola peticion, sin fragmentacion ni perdida de contexto entre secciones.
- Asistentes con acceso a herramientas sobre hardware AMD local: el soporte de tool calling estilo OpenAI permite construir agentes que consulten APIs internas, bases de datos o sistemas de ficheros, ejecutandose en una R9700 o en un equipo Strix Halo sin depender de la nube.
- Procesamiento de capturas de pantalla y documentacion tecnica: la entrada de imagenes habilita tareas de extraccion de informacion de interfaces, diagramas de arquitectura o tablas escaneadas, con salida en texto estructurado.
- Despliegue en estaciones de trabajo con GPU AMD profesional: la R9700 de 32 GB es el objetivo declarado del paquete, lo que permite servir el modelo Q4_K_M en entornos donde no hay GPUs NVIDIA disponibles.
- Prototipado de agentes multi-paso con razonamiento visible: el modo thinking por defecto facilita la depuracion de cadenas de razonamiento en tareas de planificacion, y puede desactivarse para reducir latencia en produccion.
- Evaluacion comparativa de runtimes: las puertas de correccion del paquete (comparacion token a token contra llama.cpp, pruebas de kernels, verificacion de concurrencia) lo convierten en un banco de pruebas para validar la fidelidad numerica de `loom-serve` frente a la referencia establecida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del paquete indica explicitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" en esta version, y que ninguna de las puertas de correccion tiene ejecucion registrada. No se dispone de datos de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint Q4_K_M de un modelo de 35B requiere del orden de 20-22 GB solo para pesos, mas el proyector de vision en BF16 y la cache KV para contexto largo, lo que excede los 32 GB de la R9700 en contextos maximos.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- No se documenta compatibilidad con GPUs NVIDIA ni con GPU consumer AMD de gama baja.
- Despliegue: runtime `loom-serve` del paquete `hrx-loom[hf]==0.2.0`, instalado via `pipx`; descarga del paquete con `loom-fetch`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este artefacto.
- Opciones de servicio documentadas: `--pool_backing=fixed` (reserva fija del pool de memoria), `--parameter_mode=preload` (carga anticipada de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, usada en las mediciones de la tarjeta).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Runtime objetivo |
|---|---|---|---|---|---|
| Ornith-1.0-35B-loom (este paquete) | 35B | 262.144 | Si | MIT | loom-serve sobre AMD gfx1151/gfx1201 |
| lmstudio-community/Ornith-1.0-35B-GGUF (modelo base) | 35B | no disponible en la informacion | Si (proyector mmproj) | no disponible en la informacion | llama.cpp y derivados |
| Alternativas de 30-35B con vision | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar rendimiento con modelos de la misma categoria. La unica comparacion documentada es funcional: el paquete Loom se valida contra llama.cpp ejecutando el mismo GGUF, pero sin resultados de benchmark publicados.

## Limitaciones y advertencias

- Artefacto de empaquetado, no un modelo nuevo: cualquier limitacion del modelo base Ornith-1.0-35B se hereda sin cambios; el paquete solo altera el runtime de ejecucion.
- Sin evidencia de correccion en esta version: las once puertas de correccion (kernels, golden, compare, vision, consistency, spec, agent, sampling, logits, decision) figuran como "no re-measured", por lo que no hay garantia publicada de que la salida coincida con llama.cpp.
- Rendimiento no medido: no hay datos de latencia ni throughput para ninguna de las dos GPUs objetivo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo habitual de los modelos generativos de este tamano.
- Sesgos: no documentados.
- Idiomas: no especificados en la tarjeta; no se puede confirmar cobertura multilingue.
- Contexto y memoria: los 262.144 tokens por peticion con 4 peticiones concurrentes implican una cache KV muy grande; en la R9700 de 32 GB el contexto maximo probablemente no sea alcanzable en la practica, aunque no se publican cifras exactas.
- Dependencia de hardware AMD especifico: el paquete esta generado para gfx1151 y gfx1201; no se declara portabilidad a otras arquitecturas.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-11-19), sin historial de uso.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero la licencia del modelo base no se detalla en la informacion disponible y conviene verificarla en el repositorio original antes de un despliegue en produccion.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/lmstudio-community-Ornith-1.0-35B-loom
- Modelo base (GGUF): https://huggingface.co/lmstudio-community/Ornith-1.0-35B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
