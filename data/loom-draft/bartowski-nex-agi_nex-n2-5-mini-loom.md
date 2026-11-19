# loom-draft/bartowski-nex-agi_Nex-N2.5-mini-loom

## Resumen

`loom-draft/bartowski-nex-agi_Nex-N2.5-mini-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `nex-agi_Nex-N2.5-mini-Q4_K_M.gguf`, publicado originalmente por bartowski. El paquete lo genera la herramienta `loom-next` (sin LLM en el bucle) y lo publica el usuario `loom-draft`. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del GGUF original, sin modificar.

El objetivo del paquete es ejecutar ese checkpoint multimodal (pipeline `image-text-to-text`) sobre GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Loom es un runtime alternativo que compila kernels específicos para el hardware y expone una API compatible con OpenAI (`/v1/chat/completions`), con soporte de tool calling, modo de razonamiento siempre activo y entrada de imágenes vía proyector `mmproj`.

La relevancia es acotada pero clara: ofrece una vía de servir un modelo multimodal de contexto largo (262.144 tokens por petición, 4 peticiones concurrentes, hasta 4.096 tokens de salida) en hardware AMD consumer y profesional sin depender de CUDA. El repositorio está vacío en el momento de la consulta (0,0 GB, 0 descargas, 0 likes) y las mediciones de rendimiento y las puertas de corrección aún no se han vuelto a medir para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no describe la arquitectura del modelo base; se distribuye como GGUF multimodal con proyector `mmproj`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (checkpoint `nex-agi_Nex-N2.5-mini-Q4_K_M.gguf`); proyector de visión en bf16 (`mmproj-nex-agi_Nex-N2.5-mini-bf16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint) + paquete Loom (`program/*.loom`, `weights.loom`, `tokenizer.json`, `llm_config.json`, `model.json`) |
| Pipeline | image-text-to-text (visión) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | compatible con OpenAI (`/v1/chat/completions`), `tools` y `tool_calls` estilo OpenAI |
| Decodificacion especulativa | no aplicable |
| Audio | no soportado |

## Arquitectura y entrenamiento

No hay información en la documentación disponible sobre la arquitectura interna del modelo base `nex-agi_Nex-N2.5-mini` (tipo de transformer, número de capas, dimensiones, cabezas de atención ni composición del dataset). El paquete Loom no incluye esos datos: solo distribuye el GGUF, el proyector multimodal y los programas compilados para el hardware objetivo.

Lo que sí se documenta es la capa de ejecución: `loom-next` genera programas `.loom` y `weights.loom` a partir del GGUF sin modificar los pesos, y `loom-serve` los ejecuta con opciones de memoria (`--pool_backing=fixed`) y de carga (`--parameter_mode=preload`). El modo de razonamiento está siempre activo y no admite ajuste de esfuerzo de razonamiento (`reasoning effort: not applicable`). No se especifica si hubo RLHF, DPO ni detalles del entrenamiento.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI.
- Entrada de imágenes (image-text-to-text) mediante partes `image_url` estilo OpenAI, con proyector `mmproj-nex-agi_Nex-N2.5-mini-bf16.gguf`.
- Tool calling / function calling con esquema `tools` y `tool_calls` estilo OpenAI.
- Modo de razonamiento (thinking) siempre activado, sin control de esfuerzo.
- Soporte de bucles de tool calling multi-turno (la puerta `agent` de loom-benchmark lo verifica, aunque aún no hay resultados registrados para este paquete).
- Contexto largo: hasta 262.144 tokens por petición.
- Concurrencia de 4 peticiones simultáneas.
- Multilingüismo: no disponible (no se declaran idiomas).
- Sin soporte de audio ni de decodificación especulativa.

## Casos de uso

- Análisis de documentos extensos con imágenes: con 262.144 tokens de contexto por petición, el modelo puede procesar informes, contratos o expedientes completos junto con capturas o diagramas, siempre que se sirva en Strix Halo o R9700 con el paquete Loom.
- Automatización de soporte técnico con capturas de pantalla: la entrada `image_url` permite adjuntar errores de pantalla o logs visuales y obtener diagnóstico en una conversación multi-turno con hasta 4.096 tokens de respuesta.
- Agentes con herramientas en local: el soporte de `tools`/`tool_calls` y de bucles multi-turno permite construir asistentes que consulten APIs internas, bases de datos o sistemas de tickets sin salir de la infraestructura propia.
- Procesamiento por lotes de imágenes y texto: con 4 peticiones concurrentes y memoria fija (`--pool_backing=fixed`), es viable lanzar lotes moderados de clasificación o descripción de imágenes en un solo equipo AMD.
- Prototipado y evaluación en hardware AMD: sirve para comparar el comportamiento del GGUF original frente a llama.cpp usando las puertas `golden`, `compare` y `vision` de loom-benchmark, una vez se registren mediciones.
- Despliegue en estaciones de trabajo con Radeon AI PRO R9700: 32 GB de VRAM dedicada permiten servir el Q4_K_M con el proyector bf16 para tareas de visión y razonamiento en un equipo de sobremesa.
- Inferencia en APU Strix Halo: el paquete está pensado para Ryzen AI Max+ 395, lo que habilita ejecutar el modelo en un equipo compacto sin GPU discreta, con memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured". Todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas.

| Benchmark | Strix Halo | Radeon AI PRO R9700 |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| Throughput / latencia Loom | no medido | no medido |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint es Q4_K_M y el proyector va en bf16; el paquete está diseñado para una Radeon AI PRO R9700 de 32 GB y para la APU Strix Halo con memoria unificada.
- GPUs soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete Loom; para esas plataformas habría que usar el GGUF original con llama.cpp u otro runtime.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. Opciones relevantes: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones aún no se han repetido para este paquete.
- Concurrencia soportada: 4 peticiones simultáneas.

## Comparativa con modelos similares

No disponible. La documentación no identifica modelos comparables de la misma categoría ni proporciona parámetros del modelo base que permitan emparejarlo con alternativas. La única referencia directa es el propio GGUF de origen, `bartowski/nex-agi_Nex-N2.5-mini-GGUF`, ejecutable con llama.cpp; el paquete Loom se presenta como una vía de servirlo en hardware AMD con API OpenAI, pero sin métricas publicadas que permitan comparar rendimiento.

| Modelo | Parametros | Contexto | Licencia | Runtime |
|---|---|---|---|---|
| nex-agi_Nex-N2.5-mini (este paquete Loom) | no disponible | 262.144 | Apache 2.0 | Loom (AMD gfx1151/gfx1201) |
| nex-agi_Nex-N2.5-mini GGUF (bartowski) | no disponible | no disponible | Apache 2.0 | llama.cpp |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Repositorio vacío en el momento de la consulta: 0,0 GB de tamaño y 0 descargas. Conviene verificar que los ficheros del paquete estén realmente disponibles antes de integrarlo.
- Sin mediciones de rendimiento ni de corrección: todas las puertas de loom-benchmark figuran como "not yet re-measured". No hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en este paquete.
- Compatibilidad de hardware muy restringida: solo Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201). No es un paquete portable a otras GPUs sin regeneración.
- Modo de razonamiento siempre activo y sin control de esfuerzo: no se puede desactivar el thinking, lo que incrementa tokens generados y latencia en tareas simples.
- Sin decodificación especulativa ni soporte de audio.
- Idiomas soportados no declarados: no hay garantía documentada de calidad multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el paquete depende de `hrx-loom` y de los términos del GGUF original; conviene revisar ambas licencias antes de producción.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo conversacional con visión, aplican los riesgos habituales y deben evaluarse con datos propios.
- La documentación de la model card está truncada (`llm_config.json`: "the co..."), por lo que pueden faltar detalles de configuración.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-nex-agi_Nex-N2.5-mini-loom
- GGUF de origen: https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
