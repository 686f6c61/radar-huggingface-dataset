# loom-draft/unsloth-Ministral-3-3B-Instruct-2512-loom

## Resumen

`loom-draft/unsloth-Ministral-3-3B-Instruct-2512-loom` es un paquete de despliegue en formato Loom (`.loom` más un `model.json` de tarjeta) generado automáticamente a partir del checkpoint GGUF sin modificar `unsloth/Ministral-3-3B-Instruct-2512-GGUF`, en su variante `Ministral-3-3B-Instruct-2512-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del Ministral 3 3B Instruct de Mistral AI en cuantización Q4_K_M, empaquetados para su ejecución en GPUs AMD mediante el runtime Loom (familia `hrx-loom`).

El paquete está generado con `loom-next` (el generador, sin LLM en el bucle) y apunta explícitamente a dos aceleradores: la APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Su relevancia es acotada y muy específica: ofrece una vía de servir un modelo de 3B en hardware AMD consumer/prosumer con una API compatible con OpenAI (`/v1/chat/completions`), sin depender de llama.cpp ni de CUDA.

La tarjeta declara 108.544 tokens de contexto por petición, 4 peticiones concurrentes y un máximo de 4.096 tokens de salida por preset. El repositorio no incluye resultados de rendimiento ni de corrección re-medidos para este paquete concreto, y no publica benchmarks del modelo subyacente. La licencia declarada es Apache-2.0, heredada del checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del checkpoint Ministral 3 3B Instruct; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 3B (según el nombre del checkpoint base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 108.544 tokens por petición (según la tarjeta del paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (única variante empaquetada) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` + `weights.loom` |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El paquete no aporta información sobre la arquitectura interna del modelo base más allá de lo que implica el nombre: un transformer decoder-only de 3B parámetros de la familia Ministral 3 Instruct de Mistral AI, publicado originalmente por Unsloth como GGUF. No se dispone en la información proporcionada de datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se detalla la innovación técnica del modelo base.

Lo que sí describe la tarjeta es la capa de despliegue: `loom-next` genera programas `.loom` (kernels) y un fichero `weights.loom` a partir del GGUF, junto con `tokenizer.json`, `llm_config.json` y `model.json`/`model.json.lock` con los hashes SHA-256 de los ficheros fuente verificados por `loom-fetch`. El servidor `loom-serve` expone la API y admite opciones de ejecución como `completion_spin_ns=4294967295` (espera activa de completaciones de GPU), `--pool_backing=fixed` (pool de memoria fijo) y `--parameter_mode=preload` (carga anticipada de pesos en host). La tarjeta indica que las mediciones de rendimiento, cuando existan, se hicieron con la espera activa habilitada.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI.
- Contexto largo por petición: hasta 108.544 tokens, adecuado para documentos extensos o historiales largos.
- Concurrencia de 4 peticiones simultáneas por instancia servida.
- Salida limitada a 4.096 tokens por respuesta según el preset.
- Tool calling: no aplicable según la tarjeta del paquete Loom.
- Razonamiento / thinking mode: no aplicable según la tarjeta.
- Reasoning effort: no aplicable.
- Decodificación especulativa: no aplicable en este paquete.
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream sí la tiene según la propia tarjeta.
- Entrada/salida de audio: no aplicable.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: servir un chatbot interno sobre una Radeon AI PRO R9700 o un equipo Strix Halo usando `loom-serve` y el endpoint `/v1/chat/completions`, sin depender de CUDA ni de servicios en la nube.
- Procesamiento de documentos largos: con 108.544 tokens de contexto por petición, el modelo puede resumir contratos, informes técnicos o hilos de correo extensos en una sola pasada, siempre que la salida quepa en los 4.096 tokens del preset.
- Prototipado de aplicaciones compatibles con OpenAI: al exponer la misma interfaz que la API de OpenAI, permite apuntar SDKs y frameworks existentes al servidor local cambiando únicamente la `base_url`, lo que acelera el desarrollo sin reescribir integraciones.
- Evaluación de hardware AMD para inferencia: útil como banco de pruebas para medir el comportamiento de Loom frente a llama.cpp en GPUs gfx1151 y gfx1201, aunque la tarjeta advierte de que las mediciones de rendimiento y las puertas de corrección aún no se han re-medido para este paquete.
- Generación de texto por lotes en local: tareas de clasificación, extracción o reescritura de textos en un pipeline interno con 4 peticiones concurrentes, adecuado para volúmenes moderados donde no se requiere tool calling.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en hardware local con pesos Apache-2.0, encaja en escenarios donde los datos no pueden salir de la infraestructura propia (sanidad, legal, administración pública).
- Base para experimentación con cuantización Q4_K_M: permite comparar la calidad de un 3B cuantizado frente a otras variantes del mismo checkpoint en el mismo hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del paquete indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), «the results for this package are not yet re-measured», y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured». Tampoco se aportan cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint es un 3B en Q4_K_M, lo que en la práctica sitúa los pesos en el entorno de 2 GB, pero la tarjeta no publica la cifra exacta ni el overhead del pool de memoria de Loom.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que está generado específicamente para los targets AMD indicados.
- Cabe en GPU consumer: sí, en el sentido de que Strix Halo es una APU de consumo/prosumer; para R9700 se requiere una GPU profesional de 32 GB.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/unsloth-Ministral-3-3B-Instruct-2512-loom:chat --materialize=copy --output=...` y `loom-serve --model=... --device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no indicadas en la tarjeta para este paquete; el propio GGUF base podría servirse con llama.cpp, pero no se documenta en la información proporcionada.
- Latencia y throughput: no disponibles; la tarjeta remite a mediciones pendientes de re-medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| `loom-draft/unsloth-Ministral-3-3B-Instruct-2512-loom` | 3B | 108.544 tokens por petición | Apache-2.0 | GGUF empaquetado en `.loom`, runtime `hrx-loom` | Solo AMD gfx1151 y gfx1201; sin benchmarks publicados |
| `unsloth/Ministral-3-3B-Instruct-2512-GGUF` (base) | 3B | no disponible en la información proporcionada | Apache-2.0 (según el paquete) | GGUF | Checkpoint sin modificar; sirve con llama.cpp y otros runtimes GGUF |
| Ministral 3 3B Instruct (upstream Mistral AI) | 3B | no disponible en la información proporcionada | no disponible en la información proporcionada | Pesos originales | Modelo del que deriva el GGUF; soporta entrada de imagen según la tarjeta del paquete |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto declarado, licencia y disponibilidad de runtime.

## Limitaciones y advertencias

- El repositorio no es un modelo nuevo: es un empaquetado de despliegue. Cualquier limitación del checkpoint Ministral 3 3B Instruct subyacente se hereda sin cambios.
- No hay benchmarks ni resultados de las puertas de corrección publicados para este paquete; todas figuran como «not yet re-measured», por lo que no hay evidencia registrada de equivalencia con llama.cpp en este hardware.
- Tool calling, thinking mode, reasoning effort y decodificación especulativa están marcados como «not applicable» en la tarjeta, lo que descarta flujos de agentes multi-paso sobre este paquete.
- La entrada de imagen no está soportada por Loom aunque el modelo upstream sí la tenga, según la propia tarjeta.
- El modo de muestreo figura como «?» («not determined»), lo que introduce incertidumbre sobre la reproducibilidad de las salidas.
- El paquete está restringido a dos targets AMD concretos (gfx1151 y gfx1201); no es portable a NVIDIA ni a otras GPUs AMD sin regeneración.
- El límite de 4.096 tokens de salida por preset puede ser insuficiente para tareas de generación larga, a pesar del contexto de 108.544 tokens.
- La concurrencia está limitada a 4 peticiones simultáneas por instancia.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; son los del modelo base, sobre el que no se aportan análisis.
- Licencia Apache-2.0 declarada, lo que en principio permite uso comercial, pero conviene verificar la licencia del checkpoint upstream de Mistral AI antes de explotación en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-Ministral-3-3B-Instruct-2512-loom
- Checkpoint base en Hugging Face: https://huggingface.co/unsloth/Ministral-3-3B-Instruct-2512-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
