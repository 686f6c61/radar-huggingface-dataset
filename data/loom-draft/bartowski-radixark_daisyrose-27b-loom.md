# loom-draft/bartowski-RadixArk_DaisyRose-27B-loom

## Resumen

El repositorio `loom-draft/bartowski-RadixArk_DaisyRose-27B-loom` no contiene un modelo nuevo en sentido estricto, sino un paquete de despliegue para el runtime Loom de AMD. Empaqueta el checkpoint GGUF ya existente `bartowski/RadixArk_DaisyRose-27B-GGUF` (variante `Q4_K_M`) en forma de programas `.loom` y una tarjeta `model.json`, generados con la herramienta `loom-next` y orientados a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un RadixArk DaisyRose de 27B parámetros, con capacidades de vision (pipeline `image-text-to-text`), decodificación especulativa con MTP (multi-token prediction) y modo de razonamiento opcional (`enable_thinking`). El paquete Loom añade un preset de servicio optimizado para hardware AMD, con mediciones de rendimiento publicadas frente a llama.cpp ROCm.

Su relevancia es práctica: permite servir un modelo multimodal de 27B en cuantización Q4_K_M sobre GPU de consumo profesional AMD (R9700 de 32 GB) o APU Strix Halo, con un servidor compatible con la API de chat completions de OpenAI. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño reportado es de 0.0 GB, lo que sugiere que los pesos no están alojados directamente en este repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base RadixArk DaisyRose 27B; el paquete es un artefacto de despliegue Loom) |
| Parametros totales | 27B (denominacion del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens en la configuracion de servicio medida (`-c 65536` en llama.cpp); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del modelo base no disponibles en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M); el paquete Loom usa programas `.loom` y `model.json` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base RadixArk DaisyRose 27B en la documentacion proporcionada: no se detalla si es un transformer denso, MoE o hibrido, ni los datos de entrenamiento, numero de tokens, composicion del dataset o si hubo RLHF/DPO. Lo unico verificable es que se trata de un modelo multimodal (`image-text-to-text`) con soporte de modo de pensamiento opcional y de decodificacion especulativa basada en MTP (multi-token prediction), segun las etiquetas y los argumentos de servicio del paquete.

El paquete Loom en si no modifica los pesos: la model card indica explicitamente que se sirve el checkpoint GGUF "sin modificar". La innovacion tecnica esta en el runtime: `loom-serve` con pool de memoria fijo (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), que es la configuracion usada en las mediciones. El paquete incluye presets distintos para Strix Halo (`chat`) y R9700 (`chat-r9700`).

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con `/v1/chat/completions`.
- Procesamiento de imagen y texto (`image-text-to-text`), segun el pipeline declarado.
- Modo de razonamiento opcional, controlable por peticion con `chat_template_kwargs.enable_thinking`; en el ejemplo de la model card aparece desactivado.
- Decodificacion especulativa con MTP: el paquete declara soporte de drafting con profundidad 3 en Loom y `--spec-type draft-mtp` en llama.cpp.
- Servicio concurrente: la model card reporta mediciones con 4 streams en paralelo (sin drafting).
- Compatibilidad con el ecosistema Loom (`loom-fetch`, `loom-serve`) y con el formato GGUF estandar.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades de codigo, matematicas o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio local de un modelo multimodal de 27B en una Radeon AI PRO R9700 de 32 GB: el preset `chat-r9700` permite levantar un endpoint compatible con OpenAI en una sola GPU profesional, util para prototipado de asistentes con vision sin depender de la nube.
- Inferencia en APU Strix Halo (Ryzen AI Max+ 395): el preset `chat` esta pensado para equipos compactos sin GPU dedicada, con decodificacion de aproximadamente 20-25 tok/s segun las mediciones publicadas, suficiente para chat interactivo y resumen de documentos.
- Procesamiento de documentos largos: con contexto de servicio de 65.536 tokens y prefill de 468-543 tok/s en Strix Halo, es viable ingerir documentos de decenas de miles de tokens (informes, expedientes) para extraccion o resumen.
- Atencion al cliente automatizada: la API de chat completions multi-turno y el modo de pensamiento desactivable permiten respuestas de baja latencia en conversaciones de soporte, con la opcion de activar razonamiento en casos complejos.
- Evaluacion comparativa de runtimes AMD: el paquete incluye metodologia y mediciones frente a llama.cpp ROCm, por lo que sirve como banco de pruebas reproducible para decidir entre motores de inferencia en hardware AMD.
- Despliegue en pipelines de CI con hardware AMD: la instalacion via `pipx install "hrx-loom[hf]==0.2.0"` y los comandos `loom-fetch`/`loom-serve` permiten automatizar el aprovisionamiento del modelo en runners con GPU AMD.
- Experimentacion con decodificacion especulativa MTP: al exponer el drafting en ambos motores (Loom y llama.cpp), facilita medir la tasa de aceptacion de tokens borrador en cargas reales.

## Benchmarks y rendimiento

Las unicas mediciones publicadas son de rendimiento de inferencia del paquete Loom en Strix Halo (gfx1151), comparadas con llama.cpp ROCm `llamacpp-rocm/b1374` usando el mismo GGUF y los mismos prompts. La tabla de la model card para R9700 aparece truncada en la informacion disponible.

| Metrica (Strix Halo) | llama.cpp | Loom |
|---|---|---|
| Decode tok/s, prompt corto | no medido | 24,9 |
| Decode tok/s, contexto 2k | no medido | 23,7 |
| Decode tok/s, contexto 32k | no medido | 20,5 |
| Prefill tok/s, documento 1k | no medido | 531,2 |
| Prefill tok/s, documento 2k | no medido | 535,6 |
| Prefill tok/s, documento 8k | no medido | 543,5 |
| Prefill tok/s, documento 16k | no medido | 516,6 |
| Prefill tok/s, documento 32k | no medido | 468,5 |
| 4 streams, decode agregado tok/s | no medido | 46,3 |
| Drafting, tokens aceptados | no aplica | no medido |

Metodologia declarada: mediana de 3 sesiones, cronometraje por cliente en Loom y por servidor en llama.cpp, sin barrido de ajustes en ninguno de los dos motores, con espera activa de GPU en Loom y argumentos `-ngl 99 -cram 0 --spec-type draft-mtp -c 65536 -np 1` en llama.cpp. Medicion del 2026-11-26 en runners AMD DevLab Dispatch (X2-LA03-S04-D03). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explicita; un GGUF Q4_K_M de 27B ocupa del orden de 16-17 GB de pesos, pero la cifra exacta no aparece en la informacion proporcionada. La R9700 dispone de 32 GB.
- El paquete esta orientado a hardware AMD con ROCm; no se menciona soporte para GPU NVIDIA ni para CPU pura.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). El modelo base tambien puede servirse con llama.cpp ROCm, que es el motor de referencia de las comparativas.
- Rendimiento medido en Strix Halo: 24,9 tok/s de decodificacion en prompt corto, 20,5 tok/s a 32k de contexto, 468-543 tok/s de prefill y 46,3 tok/s agregados con 4 streams.
- Rendimiento en R9700: la tabla aparece truncada en la informacion disponible.
- Opciones de despliegue alternativas (vLLM, TGI, Ollama): no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de calidad ni de especificaciones del modelo base suficientes para comparar con alternativas de la misma categoria. La unica comparacion documentada es de motor de inferencia, no de modelo:

| Aspecto | Loom (este paquete) | llama.cpp ROCm b1374 |
|---|---|---|
| Modelo servido | RadixArk DaisyRose 27B Q4_K_M | RadixArk DaisyRose 27B Q4_K_M |
| Hardware de referencia | Strix Halo gfx1151; R9700 gfx1201 | Strix Halo gfx1151 |
| Drafting MTP | Profundidad 3 | `--spec-type draft-mtp` (por defecto) |
| API | `/v1/chat/completions` | Servidor propio compatible con OpenAI |
| Medicion de latencia | Cliente | Servidor |
| Resultados | Ver tabla de benchmarks | No medidos en las filas publicadas |

Comparativa con otros modelos de 27B (parametros, contexto, rendimiento, licencia): no disponible.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un paquete de despliegue (0.0 GB, 0 descargas, 0 likes). Los pesos deben obtenerse del modelo base `bartowski/RadixArk_DaisyRose-27B-GGUF`.
- La model card no documenta sesgos, riesgo de alucinacion ni limitaciones idiomaticas del modelo base; deben evaluarse de forma independiente antes de un uso en produccion.
- Idiomas soportados: no disponible. No se puede asumir un rendimiento correcto en castellano sin evaluacion previa.
- La comparativa de rendimiento solo cubre Strix Halo y deja celdas de llama.cpp sin medir; la tabla de R9700 esta truncada. No hay datos de calidad (benchmarks academicos).
- Las mediciones usan espera activa de GPU (`completion_spin_ns=4294967295`), que consume CPU mientras hay trabajo en vuelo; en produccion puede ser preferible otra configuracion y el rendimiento variara.
- El modo de pensamiento esta desactivado en el ejemplo de la model card; activarlo cambia la latencia y el consumo de tokens.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero la licencia del modelo base debe verificarse por separado, ya que el paquete no la sustituye.
- Dependencia de ROCm y de hardware AMD especifico (gfx1151, gfx1201); no hay garantia de funcionamiento en otras GPU.
- Proyecto con fecha de creacion 2026-11-26 y sin traccion (0 descargas): madurez y soporte comunitario no demostrados.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/bartowski-RadixArk_DaisyRose-27B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/RadixArk_DaisyRose-27B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-next/actions/runs/45875499150

Nota: los resultados de busqueda web devueltos corresponden a Loom (la herramienta de grabacion de pantalla) y a la marca de ropa Loom, sin relacion con este proyecto; no se incluyen como fuentes.
