# loom-draft/ggml-org-pixtral-12b-loom

## Resumen

`loom-draft/ggml-org-pixtral-12b-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `ggml-org/pixtral-12b-GGUF`, en su cuantizacion `pixtral-12b-Q4_K_M.gguf`. No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado que traduce los pesos del modelo base Pixtral 12B a programas ejecutables por el runtime Loom (`hrx-loom`), orientado a GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, Pixtral 12B, es un modelo multimodal (texto e imagen) de 12 mil millones de parametros desarrollado por Mistral AI, del que este paquete hereda arquitectura, tokenizador y capacidades. La generacion del paquete la realiza la herramienta `loom-next`, segun la model card sin intervencion de un LLM en el bucle. El repositorio publica 0 descargas y 0 likes en el momento de la consulta, y la tarjeta indica que las mediciones de rendimiento y las compuertas de correccion aun no se han vuelto a medir para esta version.

Su relevancia es acotada y muy especifica: sirve para quien quiera servir Pixtral 12B cuantizado en Q4_K_M sobre hardware AMD Strix Halo o R9700 usando el stack Loom en lugar de llama.cpp, con una API compatible con OpenAI. No aporta mejoras de calidad respecto al modelo base; aporta un camino de despliegue alternativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo base Pixtral 12B; el paquete no describe la arquitectura interna) |
| Parametros totales | 12 mil millones (heredados del modelo base Pixtral 12B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint `pixtral-12b-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` (`program/*.loom`, `weights.loom`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | `/v1/chat/completions` estilo OpenAI |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica el modelo. El paquete se genera con `loom-next` a partir del GGUF `pixtral-12b-Q4_K_M.gguf` de `ggml-org`, y produce programas `.loom` mas un `weights.loom` que el runtime `loom-serve` ejecuta sobre GPUs AMD. La tarjeta incluye `llm_config.json` como configuracion de origen de la generacion, pero no detalla la arquitectura interna del transformer de Pixtral ni los datos de entrenamiento.

No hay informacion en la model card sobre numero de tokens de entrenamiento, composicion del dataset, RLHF, DPO ni innovaciones de decodificacion. La tarjeta marca explicitamente la decodificacion especulativa como "not applicable" y el razonamiento/thinking como "not applicable" para este paquete. La unica innovacion tecnica descrita es el propio pipeline de generacion de kernels de Loom y las compuertas de verificacion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`), que en esta version aparecen todas como "not yet re-measured".

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Contexto largo: 262.144 tokens por peticion, con 4 peticiones concurrentes.
- Salida limitada a 4.096 tokens por respuesta (preset `max_tokens`).
- Tool calling: no disponible ("not applicable" en la tarjeta).
- Razonamiento / thinking mode: no disponible ("not applicable").
- Decodificacion especulativa: no disponible ("not applicable").
- Entrada de imagen: no soportada por Loom, aunque el modelo base Pixtral si la tiene ("not supported by Loom (the upstream model has it)").
- Entrada/salida de audio: no aplica.
- Muestreo (temperature, top_k, seed): estado "not determined" en la tarjeta.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat de contexto largo sobre AMD Strix Halo: desplegar `loom-serve` en un Ryzen AI Max+ 395 y atender conversaciones multi-turno de hasta 262.144 tokens, util para analisis de documentos extensos o historiales largos sin truncar.
- Despliegue en Radeon AI PRO R9700: usar el preset `chat-r9700` para servir el modelo en una GPU de 32 GB, apropiado para entornos de laboratorio o estaciones de trabajo AMD con requisitos de VRAM acotados por la cuantizacion Q4_K_M.
- Evaluacion comparativa de runtimes: emplear el paquete como banco de pruebas para contrastar Loom frente a llama.cpp sobre el mismo GGUF, ya que la tarjeta define compuertas `golden` y `compare` contra la referencia de llama.cpp.
- Backend de API compatible con OpenAI en prototipos: integrar el endpoint `/v1/chat/completions` en aplicaciones existentes que ya hablan el protocolo OpenAI, sin cambiar el cliente, para pruebas de concepto en hardware AMD.
- Procesamiento por lotes de textos largos: con 4 peticiones concurrentes y contexto de 262k, encaja en tareas de resumen o extraccion sobre corpus de documentos de gran tamano en un solo nodo.
- Investigacion sobre portabilidad de pesos GGUF a otros runtimes: el repositorio documenta el proceso de generacion (`loom-next`) y los ficheros intermedios (`llm_config.json`, `info.json`, `REPORT.md`), lo que sirve para estudiar como se traduce un GGUF a programas especificos de dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las compuertas de correccion aparecen como "not yet re-measured". No se dispone de datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 12B y el preset objetivo para R9700 asume una GPU de 32 GB.
- GPU objetivo: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPU consumer: no se documenta soporte para GPUs consumer Nvidia ni para otras AMD fuera de las dos anteriores.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Opciones de servicio: `--pool_backing=fixed`, `--parameter_mode=preload`, `--device=amdgpu://?completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles (sin mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Runtime en este paquete |
|---|---|---|---|---|---|
| `loom-draft/ggml-org-pixtral-12b-loom` (este) | 12B | 262.144 | No en Loom (si en el base) | MIT | Loom (`hrx-loom`) |
| `ggml-org/pixtral-12b-GGUF` (modelo base) | 12B | no disponible | Si (imagen) | MIT (heredada) | llama.cpp y otros compatibles GGUF |
| Pixtral 12B original (Mistral AI) | 12B | no disponible en la informacion proporcionada | Si (imagen) | no disponible en la informacion proporcionada | Pesos originales |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sin evidencia de correccion: todas las compuertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured"; no hay prueba publicada de que la salida coincida con llama.cpp.
- Sin mediciones de rendimiento: la comparativa frente a llama.cpp en Strix Halo y R9700 no esta publicada.
- Sin soporte de imagen en Loom, pese a que el modelo base Pixtral es multimodal; la entrada de imagen queda inutilizada en este paquete.
- Sin tool calling, sin thinking mode y sin decodificacion especulativa.
- Estado de muestreo "not determined": no se garantiza el comportamiento de temperature, top_k y seed.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens, lo que restringe escenarios de alta carga o respuestas muy largas.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingue verificada.
- Hardware muy restringido: solo se documentan Strix Halo (gfx1151) y R9700 (gfx1201); no hay soporte declarado para otras GPUs.
- Licencia MIT declarada en la tarjeta, pero conviene verificar la licencia del checkpoint base `ggml-org/pixtral-12b-GGUF` antes de uso comercial.
- Riesgo de alucinacion y sesgos: no hay informacion especifica en la model card; son los inherentes al modelo base Pixtral 12B.
- Repositorio sin adopcion: 0 descargas y 0 likes, sin senales de uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/ggml-org-pixtral-12b-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/pixtral-12b-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
