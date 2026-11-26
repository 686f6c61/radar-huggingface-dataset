# loom-draft/prithivMLmods-OCRia-1-loom

## Resumen

OCRia-1 es un modelo multimodal de tipo image-text-to-text publicado por prithivMLmods, distribuido originalmente en formato GGUF y orientado a tareas de OCR y comprension de documentos. El paquete aqui descrito, `loom-draft/prithivMLmods-OCRia-1-loom`, no contiene pesos nuevos: es un empaquetado en formato Loom (programas `.loom` y una tarjeta `model.json`) del checkpoint sin modificar `OCRia-1.Q4_K_M.gguf`, generado con la herramienta `loom-next` sin intervencion de un LLM en el proceso.

El objetivo del paquete es servir ese GGUF de forma optimizada sobre GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), a traves del runtime `hrx-loom` 0.2.0. Incluye decodificacion especulativa con MTP (multi-token prediction) y una API compatible con el endpoint `/v1/chat/completions` de OpenAI.

Su relevancia es de nicho pero clara: permite ejecutar un modelo de OCR multimodal cuantizado en Q4_K_M sobre hardware AMD consumer y profesional con un stack ROCm, con mediciones publicadas de rendimiento frente a llama.cpp ROCm en Strix Halo. La licencia del paquete es MIT. No se dispone de informacion sobre arquitectura interna, numero de parametros ni contexto del modelo base en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; arquitectura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la ficha del paquete; las pruebas de rendimiento usan prompts de hasta 32k tokens y llama.cpp se configura con `-c 65536` |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programa Loom (`.loom` + `model.json`) |
| Modelo base | prithivMLmods/OCRia-1-GGUF |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (`pipx install "hrx-loom[hf]==0.2.0"`) |
| API | OpenAI-style `/v1/chat/completions` en `http://127.0.0.1:8080` |
| Decodificacion especulativa | MTP, profundidad de borrador 3 en Loom |
| Tamano del repo | 0.0 GB (los pesos se obtienen del modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base OCRia-1 (tipo de transformer, atencion, datos de entrenamiento, numero de tokens, uso de RLHF/DPO) en la documentacion proporcionada. Lo unico confirmado es que se trata de un modelo multimodal de pipeline `image-text-to-text`, es decir, acepta imagenes y texto y genera texto, y que el checkpoint utilizado esta cuantizado a Q4_K_M en formato GGUF.

La innovacion tecnica del paquete no reside en el modelo sino en el runtime: Loom genera programas especificos para las GPUs AMD objetivo a partir del GGUF sin modificarlo, e incorpora decodificacion especulativa mediante MTP con profundidad de borrador 3. El paquete tambien expone opciones de servido como `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host), y recomienda `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU, ajuste con el que se midieron las cifras de rendimiento.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text): el pipeline declarado en Hugging Face es `image-text-to-text`.
- OCR y comprension de documentos: el nombre y el enfoque del modelo base apuntan a extraccion y lectura de texto en imagenes, aunque la ficha del paquete no detalla tareas concretas.
- API compatible con OpenAI: endpoint `/v1/chat/completions` con mensajes en formato chat.
- Modo thinking opcional: la peticion de ejemplo usa `chat_template_kwargs: {"enable_thinking": false}`, lo que implica que el modelo soporta un modo de razonamiento activable.
- Decodificacion especulativa MTP integrada en el runtime para acelerar la generacion.
- Servido multi-stream: el runtime soporta al menos 4 peticiones concurrentes con decodificacion agregada.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo recibe la imagen de un documento y devuelve el texto extraido; su naturaleza image-text-to-text y su cuantizacion Q4_K_M permiten ejecutarlo en una GPU AMD de 32 GB o en un APU Strix Halo sin depender de servicios en la nube.
- Procesamiento por lotes de facturas y formularios: con un prefill medido de 2360-2936 tok/s en Strix Halo para documentos de 1k a 32k tokens, es viable encolar imagenes de documentos largos y obtener la transcripcion en segundos por documento.
- Extraccion de texto en entornos con requisitos de privacidad: al servirse localmente via `loom-serve` con API OpenAI, los documentos no salen de la infraestructura propia, lo que encaja en sectores con datos sensibles.
- Asistencia a la revision documental: el modo thinking opcional permite activar razonamiento sobre el contenido de la imagen para tareas de interpretacion, no solo transcripcion literal.
- Despliegue en estaciones de trabajo AMD: la Radeon AI PRO R9700 de 32 GB es el objetivo profesional del paquete, adecuado para un puesto de trabajo que necesite OCR local con latencia baja.
- Servicio concurrente ligero: con 4 streams y 221.3 tok/s agregados en Strix Halo, puede atender varias peticiones simultaneas de OCR en un equipo de sobremesa.
- Integracion en pipelines internos: la API compatible con OpenAI permite sustituir un endpoint remoto por el servidor local sin reescribir el cliente.

## Benchmarks y rendimiento

Rendimiento medido en AMD Strix Halo (gfx1151), Loom 0.2.0 frente a llama.cpp ROCm b1374, mismo GGUF y mismos prompts, mediana de 3 sesiones, medido el 2026-11-26:

| Metrica | llama.cpp | Loom |
|---|---|---|
| Decode tok/s, prompt corto | no medido | 83.8 |
| Decode tok/s, contexto 2k | no medido | 96.2 |
| Decode tok/s, contexto 32k | no medido | 110.0 |
| Prefill tok/s, documento 1k | no medido | 2863.5 |
| Prefill tok/s, documento 2k | no medido | 2917.5 |
| Prefill tok/s, documento 8k | no medido | 2936.2 |
| Prefill tok/s, documento 16k | no medido | 2715.6 |
| Prefill tok/s, documento 32k | no medido | 2360.2 |
| 4 streams, decode agregado tok/s | no medido | 221.3 |
| Tokens borrador aceptados (spec decoding) | n/a | no medido |

En Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados "no se han vuelto a medir" segun la model card. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el checkpoint es Q4_K_M y el paquete esta pensado para GPUs de 32 GB (R9700) y para el APU Strix Halo con memoria unificada.
- GPU objetivo: AMD Radeon AI PRO R9700 (32 GB, gfx1201) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPU consumer: el soporte esta limitado a las arquitecturas AMD indicadas; no se documenta compatibilidad con GPUs NVIDIA ni con otras Radeon.
- Despliegue: runtime propietario del ecosistema Loom (`hrx-loom` 0.2.0 via pipx, `loom-fetch` y `loom-serve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete, aunque el GGUF base puede usarse con llama.cpp segun la comparativa.
- Throughput medido en Strix Halo: 83.8-110.0 tok/s en decode de un stream y 221.3 tok/s agregados con 4 streams; prefill de 2360-2936 tok/s.
- Latencia: no se publican cifras de latencia por peticion (time-to-first-token) en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de OCR multimodal en la informacion proporcionada. La unica comparacion documentada es de motor de inferencia, no de modelo:

| Aspecto | Loom (este paquete) | llama.cpp ROCm b1374 |
|---|---|---|
| Modelo servido | OCRia-1 Q4_K_M | OCRia-1 Q4_K_M |
| Hardware medido | Strix Halo gfx1151 | Strix Halo gfx1151 |
| Decodificacion especulativa | MTP, profundidad 3 | `--spec-type draft-mtp`, profundidad por defecto |
| API | OpenAI `/v1/chat/completions` | servidor llama.cpp |
| Throughput | 83.8-110.0 tok/s (1 stream) | no medido en la tabla |

## Limitaciones y advertencias

- El paquete no incluye pesos: el repo ocupa 0.0 GB y los pesos se obtienen del modelo base `prithivMLmods/OCRia-1-GGUF`; sin acceso a ese repo el paquete no es funcional.
- Solo esta validado para dos GPUs AMD concretas (gfx1151 y gfx1201); el soporte en otro hardware no esta documentado.
- Las cifras de rendimiento de la R9700 no se han vuelto a medir; solo hay datos publicados para Strix Halo.
- Las mediciones se hicieron con espera activa (`completion_spin_ns=4294967295`), que consume CPU mientras hay trabajo en GPU; en produccion puede degradar el rendimiento de otros procesos.
- No hay informacion sobre sesgos, riesgo de alucinacion ni calidad de OCR por tipo de documento; conviene evaluar con un conjunto propio antes de desplegar.
- No se documentan los idiomas soportados, lo que impide garantizar OCR en castellano u otras lenguas sin pruebas.
- La licencia del paquete es MIT, pero la del modelo base debe verificarse en su propio repositorio antes de uso comercial.
- El ecosistema Loom (`hrx-loom`, `loom-next`) es reciente y con version fijada a 0.2.0; la trazabilidad del commit de `hrx-system` figura como desconocida en la propia model card.
- El modelo base esta cuantizado a Q4_K_M, lo que puede degradar la precision en OCR de documentos con tipografia densa o imagenes de baja calidad frente a precision completa.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/prithivMLmods-OCRia-1-loom
- Modelo base GGUF: https://huggingface.co/prithivMLmods/OCRia-1-GGUF
- Repositorio del runtime: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45884671282
