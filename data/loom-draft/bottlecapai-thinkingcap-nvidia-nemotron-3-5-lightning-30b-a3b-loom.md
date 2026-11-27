# loom-draft/bottlecapai-ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-loom

## Resumen

ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B es un paquete de despliegue en formato Loom (`.loom` más una tarjeta `model.json`) generado por `loom-next` a partir del checkpoint GGUF sin modificar `bottlecapai/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF`, en su cuantización Q4_K_M. No es un modelo nuevo: es un artefacto de empaquetado que permite servir el modelo original sobre GPUs AMD concretas mediante el runtime `hrx-loom` (versión 0.2.0), con kernels generados específicamente para esas arquitecturas.

El objetivo es ofrecer una vía de inferencia optimizada para hardware AMD que no pasa por el stack CUDA: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete expone una API compatible con OpenAI en `/v1/chat/completions`, soporta modo de razonamiento (thinking) activado por defecto y declara una ventana de contexto de 262.144 tokens por petición con 4 peticiones concurrentes.

La relevancia del artefacto es operativa: permite ejecutar un modelo de 30B totales con arquitectura MoE (A3B, unos 3B activos por token) en hardware AMD de consumo y profesional, con cuantización Q4_K_M, y comparar su corrección contra una referencia de llama.cpp sobre el mismo GGUF. La licencia del paquete es MIT. No se han publicado mediciones de rendimiento ni resultados de validación para esta versión concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MoE segun nomenclatura A3B; detalles no publicados en la informacion disponible) |
| Parametros totales | 30B (segun nombre del modelo base) |
| Parametros activos | ~3B (segun sufijo A3B del nombre del modelo base) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado como programa `.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no define arquitectura propia: reutiliza el checkpoint GGUF `ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Q4_K_M.gguf` del autor `bottlecapai`, derivado a su vez de la familia NVIDIA Nemotron 3.5 Lightning. La nomenclatura "30B-A3B" indica un modelo de mezcla de expertos con aproximadamente 30.000 millones de parámetros totales y unos 3.000 millones activos por token, lo que reduce el coste computacional por token frente a un denso del mismo tamaño. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento.

La innovación del artefacto está en el runtime: `loom-next` genera programas `.loom` y kernels específicos para gfx1151 (Strix Halo) y gfx1201 (R9700), con un pool de memoria fijado de antemano (`--pool_backing=fixed`), precarga de parámetros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). El paquete incluye un conjunto de puertas de validación (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, `decision`, entre otras) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, con divergencias toleradas solo cuando son casi-empates. Para esta versión las puertas figuran como "not yet re-measured" en ambas GPUs.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Modo de razonamiento (thinking) activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Ventana de contexto de 262.144 tokens por petición.
- Concurrencia de 4 peticiones simultáneas.
- Límite de salida de 4.096 tokens por petición (preset `max_tokens`).
- Tool calling: no disponible en este paquete (marcado como "not applicable").
- Ajuste de esfuerzo de razonamiento: no disponible.
- Decodificación especulativa: no disponible.
- Entrada de imagen: no disponible.
- Entrada o salida de audio: no disponible.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la tarjeta; existe una puerta de validación `sampling` definida pero no re-medida.

## Casos de uso

- Despliegue local en Strix Halo: ejecutar el modelo en una APU Ryzen AI Max+ 395 mediante `loom-serve` con el preset incluido, sin depender de CUDA ni de drivers NVIDIA, usando el pool de memoria fijo para evitar crecimiento elástico durante la sesión.
- Servicio en Radeon AI PRO R9700: servir el modelo en una GPU profesional AMD de 32 GB con la misma API OpenAI, útil en estaciones de trabajo con hardware AMD homogéneo.
- Asistente conversacional con contexto largo: aprovechar la ventana de 262.144 tokens para resumir o consultar documentos extensos en una sola petición, con el modo thinking desactivado si se prioriza latencia.
- Razonamiento por lotes: usar el modo thinking por defecto para tareas de análisis, clasificación razonada o resolución de problemas donde la calidad de la respuesta importa más que el coste por token.
- Evaluación comparativa de runtimes: emplear las puertas `golden` y `compare` para validar que la implementación Loom reproduce token a token la salida de llama.cpp sobre el mismo GGUF antes de promoverla a producción.
- Integración en pipelines con cliente OpenAI: al exponer `/v1/chat/completions`, cualquier SDK compatible con OpenAI puede apuntar a `http://127.0.0.1:8080` y sustituir un backend remoto por este despliegue local.
- Pruebas de concurrencia controlada: con 4 peticiones concurrentes y la puerta `consistency`, verificar que las respuestas bajo carga coinciden con las ejecuciones aisladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", incluyendo la comparación de rendimiento frente a llama.cpp y todas las puertas de corrección.

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explícita; el peso en Q4_K_M de un modelo de 30B totales ronda los 17-18 GB, pero la tarjeta no publica la cifra exacta ni el consumo del pool de memoria.
- Cabe en GPU de consumo: no confirmado; el paquete solo declara soporte para las dos plataformas AMD anteriores.
- Despliegue: exclusivamente mediante `hrx-loom[hf]==0.2.0` (`loom-fetch` para descargar el paquete y `loom-serve` para servirlo). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este artefacto.
- Opciones de servicio: `--pool_backing=fixed` y `--parameter_mode=preload` recomendadas en los comandos de inicio; `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.
- Latencia y throughput: no disponibles; las mediciones están pendientes de re-ejecución en ambas GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B (este paquete Loom) | 30B totales, ~3B activos | 262.144 | MIT | GGUF Q4_K_M empaquetado en `.loom` | Solo AMD gfx1151 y gfx1201; sin benchmarks publicados |
| bottlecapai/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF (modelo base) | 30B totales, ~3B activos | no disponible | no disponible en la informacion proporcionada | GGUF | Checkpoint de origen; ejecutable con llama.cpp y otros runtimes GGUF |
| Alternativas GGUF de 30B-A3B | no disponible | no disponible | no disponible | GGUF | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Artefacto de empaquetado, no un modelo nuevo: cualquier limitación del checkpoint base (sesgos, alucinaciones, calidad por idioma) se hereda sin cambios.
- Sin benchmarks ni validaciones re-medidas: todas las puertas de corrección y las comparaciones de rendimiento frente a llama.cpp figuran como pendientes, por lo que la equivalencia funcional no está verificada en esta versión.
- Tool calling no soportado en este paquete, lo que descarta flujos de agentes basados en function calling.
- Sin soporte de imagen ni audio, pese a que la puerta `vision` esté definida en la tarjeta.
- Muestreo no determinado: el comportamiento de temperature, top_k y seed no está confirmado.
- Concurrencia limitada a 4 peticiones y salida máxima de 4.096 tokens por petición.
- Dependencia de hardware muy concreta (gfx1151 y gfx1201) y del runtime `hrx-loom` 0.2.0; no hay ruta documentada para otras GPUs.
- Idiomas soportados no declarados; no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés sin evaluación previa.
- La licencia MIT se aplica al paquete Loom; la licencia y condiciones del checkpoint base deben verificarse por separado antes de uso comercial.
- El uso de `completion_spin_ns=4294967295` implica espera activa con consumo de CPU mientras hay trabajo en GPU; conviene medir el impacto en servidores compartidos.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bottlecapai-ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-loom
- Modelo base (GGUF): https://huggingface.co/bottlecapai/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
