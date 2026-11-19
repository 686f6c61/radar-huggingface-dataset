# loom-draft/unsloth-Ministral-3-14B-Reasoning-2512-loom

## Resumen

Este repositorio no contiene un modelo entrenado por su autor, sino un paquete de despliegue (`.loom`) generado automáticamente con la herramienta `loom-next` a partir del checkpoint GGUF `unsloth/Ministral-3-14B-Reasoning-2512-GGUF`, en su cuantización Q4_K_M. El modelo subyacente es Ministral-3-14B-Reasoning-2512, un modelo de razonamiento de 14.000 millones de parámetros de la familia Ministral (Mistral AI), distribuido en formato GGUF por Unsloth. El paquete añade programas `*.loom`, un `model.json` con los parámetros de servicio y el tokenizador, y está orientado específicamente a dos aceleradores AMD: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB).

El interés práctico de este artefacto es la portabilidad: permite servir el modelo con `loom-serve` sobre ROCm/HIP en hardware AMD de consumo y profesional, exponiendo una API compatible con `/v1/chat/completions` de OpenAI. El paquete fija un contexto de 108.544 tokens por petición, 4 peticiones concurrentes y un máximo de 4.096 tokens de salida. No se han publicado mediciones de rendimiento ni resultados de las puertas de corrección de `loom-benchmark` para esta build concreta.

Conviene subrayar que la model card del paquete declara explícitamente que varias capacidades del modelo original no están soportadas o no son aplicables en este runtime (tool calling, modo de razonamiento, decodificación especulativa, entrada de imagen). Por tanto, la ficha describe el modelo base y, cuando corresponde, advierte de las limitaciones impuestas por el contenedor Loom.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles de capas y atención no disponibles en la informacion proporcionada) |
| Parametros totales | 14B (segun el nombre del checkpoint, Ministral-3-14B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 108.544 tokens por peticion (limite del preset Loom); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) en este paquete; otras cuantizaciones del repo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M), empaquetado en programas `.loom` + `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (número de capas, tipo de atención, uso de GQA, función de activación ni composición del dataset). El nombre del checkpoint indica que es un modelo de la familia Ministral orientado a razonamiento ("Reasoning") con 14B parámetros, pero no se aportan datos sobre el número de tokens de entrenamiento, la mezcla de datos, ni si se aplicaron etapas de RLHF, DPO o RL con verificación. Tampoco se documenta ninguna innovación técnica específica (atención lineal, decodificación especulativa nativa, etc.) en el material proporcionado.

Lo que sí está documentado es la capa de despliegue. El paquete Loom se genera con `loom-next` (generador puro, sin LLM en el bucle) y contiene kernels compilados para gfx1151 y gfx1201, junto con un `model.json.lock` que fija los ficheros fuente mediante SHA-256, verificados por `loom-fetch`. El runtime admite dos modos de reserva de memoria (`--pool_backing=fixed` o crecimiento elástico), precarga de pesos en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). La model card indica que las mediciones de rendimiento, cuando existan, se tomaron con la espera activa habilitada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés (idiomas adicionales no confirmados).
- Razonamiento explícito según el nombre del checkpoint, aunque la tabla de features del paquete Loom marca "reasoning / thinking" como "not applicable", por lo que el modo de pensamiento no está expuesto en este runtime.
- Servicio HTTP con API compatible con OpenAI (`/v1/chat/completions`), lo que permite integrarlo con clientes y SDK existentes.
- Contexto largo por petición: hasta 108.544 tokens.
- Concurrencia de 4 peticiones simultáneas.
- Tool calling: no soportado en este paquete (marcado "not applicable").
- Entrada de imagen: no soportada en Loom, aunque el modelo upstream la tenga.
- Entrada/salida de audio: no aplicable.
- Decodificación especulativa: no aplicable.
- Muestreo (temperature, top_k, seed): estado "not determined", sin garantías documentadas.

## Casos de uso

- Asistente conversacional autoalojado en estación de trabajo AMD: servir el modelo con `loom-serve` en una APU Strix Halo o una R9700 permite disponer de un endpoint compatible con OpenAI sin depender de la nube, útil para prototipos y entornos con requisitos de soberanía del dato.
- Procesamiento de documentos largos: con 108.544 tokens de contexto por petición, se pueden resumir contratos, informes técnicos o hilos de correo extensos en una sola pasada, sin trocear el texto.
- Análisis y extracción de información sobre corpus medianos: clasificación, extracción de entidades y respuestas sobre documentación interna, siempre que se validen las salidas por el riesgo de alucinación.
- Evaluación comparativa de runtimes en hardware AMD: el paquete incorpora puertas de corrección (`golden`, `compare`, `consistency`, `logits`) pensadas para contrastar la salida contra llama.cpp sobre el mismo GGUF, lo que lo hace útil para validar la fidelidad de kernels HIP.
- Banchmarking de inferencia en gfx1151 y gfx1201: al fijar contexto, concurrencia y modo de reserva de memoria, sirve como configuración reproducible para medir latencia y throughput en esas GPU.
- Backend de chat para herramientas internas: al exponer `/v1/chat/completions`, puede conectarse a interfaces tipo Open WebUI o clientes compatibles con OpenAI para uso en equipos de desarrollo con hardware AMD.
- Experimentación con cuantización Q4_K_M: permite estudiar el equilibrio calidad/memoria de un modelo de 14B en GPUs de 32 GB o en APUs con memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No se aportan cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_K_M, un modelo de 14B ocupa del orden de 8-9 GB solo en pesos; el runtime Loom reserva además memoria para KV cache y buffers de cómputo, por lo que conviene contar con margen adicional. La cifra exacta del preset no está disponible.
- GPU objetivo declaradas: AMD Radeon AI PRO R9700 (32 GB, gfx1201) y APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada).
- Compatibilidad con GPU de consumo: el paquete está generado para gfx1151 y gfx1201; no se documenta soporte para otras arquitecturas (por ejemplo, RDNA3 de escritorio o GPUs NVIDIA).
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este paquete, aunque llama.cpp se usa como referencia de corrección.
- Opciones de servicio: `--pool_backing=fixed`, `--parameter_mode=preload`, `completion_spin_ns=4294967295` para espera activa.
- Latencia y throughput: no disponibles (no se han vuelto a medir).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Ministral-3-14B-Reasoning-2512 (este paquete, Q4_K_M) | 14B | 108.544 tokens por peticion (preset Loom) | Apache 2.0 | GGUF + `.loom`, `loom-serve` sobre AMD | Tool calling y thinking no expuestos en Loom |
| unsloth/Ministral-3-14B-Reasoning-2512-GGUF (base) | 14B | no disponible | Apache 2.0 | GGUF, compatible con llama.cpp y derivados | Punto de partida del paquete; soporta las capacidades nativas del modelo |
| Ministral-3-14B-Reasoning-2512 (pesos originales) | 14B | no disponible | Apache 2.0 | safetensors (formato presumible, no confirmado) | Referencia para cuantizar o servir con otros runtimes |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no expone tool calling, modo de razonamiento ni decodificación especulativa, aunque el modelo base pueda soportarlos; no debe asumirse paridad funcional con el checkpoint original.
- La entrada de imagen no está soportada en Loom, pese a que el modelo upstream la tenga.
- El muestreo (temperature, top_k, seed) figura como "not determined": no hay garantías documentadas de reproducibilidad estocástica.
- No hay mediciones de rendimiento ni de corrección para esta build; las puertas de `loom-benchmark` están sin re-medir, por lo que la fidelidad frente a llama.cpp no está verificada en esta versión.
- El contexto efectivo está limitado a 108.544 tokens por petición y la salida a 4.096 tokens; textos o generaciones más largos requerirán truncado o múltiples llamadas.
- Idiomas soportados no documentados; el uso en castellano no está garantizado ni evaluado.
- Riesgo de alucinación inherente a los modelos de lenguaje de 14B; en dominios especializados se recomienda verificación humana y anclaje a fuentes.
- Sesgos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los pesos GGUF de Unsloth, así como las de ROCm y `hrx-loom`.
- El paquete está atado a hardware AMD gfx1151/gfx1201 y a la versión `hrx-loom[hf]==0.2.0`; cambios de versión o de arquitectura pueden invalidar los kernels generados.
- El repositorio registra 0 descargas y 0 "likes", y fue creado y actualizado el mismo día (2026-11-19): se trata de un artefacto reciente y sin validación comunitaria.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/unsloth-Ministral-3-14B-Reasoning-2512-loom
- Checkpoint GGUF base: https://huggingface.co/unsloth/Ministral-3-14B-Reasoning-2512-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
