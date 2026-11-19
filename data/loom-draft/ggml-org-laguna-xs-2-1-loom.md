# loom-draft/ggml-org-Laguna-XS-2.1-loom

## Resumen

Laguna-XS-2.1-loom es un paquete de despliegue distribuido en Hugging Face por el usuario loom-draft, que empaqueta el checkpoint GGUF `Laguna-XS-2.1-Q4_K_M.gguf` del modelo base `ggml-org/Laguna-XS-2.1-GGUF` en formato Loom (programas `.loom` y una tarjeta `model.json`). El paquete no modifica los pesos: se trata de una conversión de infraestructura orientada a servir el modelo en GPU AMD concretas, en concreto la AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

La herramienta que genera el paquete es `loom-next`, un generador de programas Loom que, segun la model card, no emplea ningun LLM en el bucle de generacion. El runtime asociado, `hrx-loom` (version 0.2.0), expone una API compatible con OpenAI en `/v1/chat/completions` y permite servir el modelo con parametros como `--pool_backing=fixed`, `--parameter_mode=preload` o `completion_spin_ns`.

La relevancia de esta ficha es acotada: no aporta informacion sobre la arquitectura, el entrenamiento ni los benchmarks del modelo Laguna-XS-2.1 original, sino sobre el artefacto de despliegue para el ecosistema AMD Loom. Los datos de rendimiento y de correccion de este paquete aparecen explicitamente como "not yet re-measured" en la model card, por lo que no hay evidencia publicada de su comportamiento en las GPU objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (checkpoint base); paquete Loom (`.loom`, `weights.loom`, `model.json`) |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| GPU objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (`loom-fetch`, `loom-serve`) |
| Generador del paquete | loom-next |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo Laguna-XS-2.1 original (transformer, MoE, SSM o hibrida), ni sobre el volumen de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO. La model card del paquete Loom unicamente documenta el proceso de empaquetado: toma el GGUF `Laguna-XS-2.1-Q4_K_M.gguf` sin modificarlo y genera programas `.loom` junto con `weights.loom`, `tokenizer.json` y `llm_config.json`.

La innovacion tecnica destacable de este artefacto no esta en el modelo, sino en el pipeline de compilacion y servicio para AMD: `loom-next` produce kernels y programas especificos para gfx1151 y gfx1201, y el runtime incorpora opciones de gestion de memoria (`--pool_backing=fixed` reserva el pool de memoria por adelantado en lugar de crecimiento elastico) y de carga de pesos (`--parameter_mode=preload`). Tambien existe un modo de espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`) que consume CPU mientras hay trabajo en vuelo. No se documentan tecnicas como decodificacion especulativa (marcada como "not applicable") ni atencion lineal.

## Capacidades

- Generacion de texto via API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Modo razonamiento/thinking: desactivado por defecto, se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Reasoning effort: no aplicable en este paquete.
- Ventana de contexto de 262.144 tokens por peticion.
- Concurrencia de 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por peticion (preset `max_tokens`).
- Entrada de imagen: no aplicable.
- Entrada/salida de audio: no aplicable.
- Decodificacion especulativa: no aplicable.
- Muestreo (sampling): estado "not determined" en la model card.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Servicio de chat sobre GPU AMD Strix Halo: desplegar el modelo en un Ryzen AI Max+ 395 mediante `loom-serve` para exponer un endpoint compatible con OpenAI en local, util para prototipos y entornos sin GPU NVIDIA.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite ingerir contratos, informes o bases de codigo extensas en una sola peticion, sin necesidad de trocear el contexto.
- Automatizacion con tool calling: integrar el endpoint en un agente que invoque funciones externas (consultas a bases de datos, APIs internas) aprovechando el soporte de `tools` y `tool_calls` estilo OpenAI.
- Razonamiento multi-paso con thinking mode: activar `enable_thinking` para tareas que requieran cadena de razonamiento explicita, desactivandolo en consultas simples para reducir latencia.
- Despliegue en Radeon AI PRO R9700 de 32 GB: servir el paquete con el preset `chat-r9700` en estaciones de trabajo con GPU profesional AMD, orientado a inferencia local con pesos Q4_K_M.
- Evaluacion comparativa frente a llama.cpp: usar los gates de `loom-benchmark` (`golden`, `compare`, `agent`, `logits`) para verificar que la salida del runtime Loom coincide token a token con la referencia de llama.cpp sobre el mismo GGUF.
- Integracion en pipelines de CI: validar la correccion de kernels generados (`kernel_tests`) y la consistencia bajo concurrencia (`consistency`) antes de promover un paquete a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured". Del mismo modo, todos los gates de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" para ambas GPU.

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible; la model card solo especifica 32 GB para la R9700 como plataforma de destino.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera programas para gfx1151 y gfx1201.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` con el preset `chat` (Strix Halo) o `chat-r9700` (R9700) y `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles para este paquete Loom; llama.cpp se usa unicamente como referencia de correccion en los gates.
- Latencia y throughput: no disponibles; las mediciones de rendimiento del paquete no se han vuelto a realizar.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos sobre parametros, contexto, rendimiento o licencia de modelos alternativos de la misma categoria, y tampoco especifica la arquitectura ni el tamano del modelo Laguna-XS-2.1 original, lo que impide establecer una comparacion fundamentada.

## Limitaciones y advertencias

- Ausencia total de datos de rendimiento y correccion: todos los gates y las mediciones frente a llama.cpp figuran como "not yet re-measured" para ambas GPU, por lo que no hay evidencia publicada de que la salida coincida con la referencia.
- Alcance de hardware muy restringido: el paquete solo esta generado para gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no esta pensado para GPU NVIDIA ni para otras arquitecturas AMD.
- Informacion del modelo base incompleta: se desconocen arquitectura, numero de parametros, composicion del entrenamiento e idiomas soportados, lo que impide evaluar sesgos o riesgos de alucinacion especificos.
- Estado de muestreo indeterminado: la model card marca la fila `sampling` como "not determined", por lo que no esta garantizado que temperatura, top_k y semilla se comporten segun lo especificado.
- Limite de salida de 4.096 tokens por peticion, independientemente de la ventana de contexto de 262.144 tokens.
- Concurrencia limitada a 4 peticiones simultaneas, lo que restringe el throughput en produccion.
- Sin soporte de vision ni audio en este paquete (marcados como "not applicable").
- Licencia openmdw-1.1: no se dispone en la informacion proporcionada de los terminos concretos aplicables al uso comercial; debe consultarse el texto de la licencia antes de desplegar en produccion.
- Artefacto sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-19, sin historial de validacion externa.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/ggml-org-Laguna-XS-2.1-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Laguna-XS-2.1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
