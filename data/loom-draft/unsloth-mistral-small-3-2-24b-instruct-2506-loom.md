# loom-draft/unsloth-Mistral-Small-3.2-24B-Instruct-2506-loom

## Resumen

`loom-draft/unsloth-Mistral-Small-3.2-24B-Instruct-2506-loom` es un paquete de distribución en formato `.loom` (programas `.loom` más una tarjeta `model.json`) generado con la herramienta `loom-next` para servir el checkpoint GGUF sin modificar `unsloth/Mistral-Small-3.2-24B-Instruct-2506-GGUF`, concretamente la cuantización `Q4_K_M`. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado orientado al runtime Loom del ecosistema ROCm (repositorio `ROCm/hrx-system`), pensado para GPUs AMD.

El objetivo del paquete es permitir desplegar Mistral Small 3.2 24B Instruct 2506 sobre hardware AMD específico: el APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete incluye kernels generados, pesos en formato Loom y un servidor compatible con la API de chat de estilo OpenAI (`/v1/chat/completions`), de modo que el usuario puede lanzar el modelo con dos comandos (`loom-fetch` y `loom-serve`) sin compilar nada manualmente.

Es relevante porque documenta una vía de inferencia alternativa a llama.cpp en hardware AMD de consumo y estación de trabajo, con una configuración explícita de contexto (131 072 tokens por petición), concurrencia (4 peticiones) y límite de salida (4096 tokens). Sin embargo, la propia tarjeta indica que las mediciones de rendimiento y las puertas de corrección aún no se han vuelto a medir para este paquete, por lo que la evidencia empírica publicada es nula en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Mistral Small 3.2 24B Instruct 2506; no especificada en la información proporcionada) |
| Parametros totales | 24B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131 072 tokens por petición (preset del paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen; empaquetado en `weights.loom` y programas `program/*.loom` |
| Salida maxima | 4096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | Loom (`hrx-loom[hf]==0.2.0`) |
| Generador | loom-next (sin LLM en el bucle) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de su nombre (`Mistral-Small-3.2-24B-Instruct-2506`), por lo que no se puede confirmar aquí el tipo de transformer, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. Lo que sí documenta la tarjeta es la capa de empaquetado: el paquete contiene programas `.loom` generados por `loom-next` (kernels compilados para las arquitecturas gfx1151 y gfx1201), un fichero `weights.loom` con los pesos y un `model.json` con la configuración del preset y los ficheros fuente fijados por hash SHA-256, verificado por `loom-fetch`.

El checkpoint GGUF de origen es el publicado por Unsloth (`unsloth/Mistral-Small-3.2-24B-Instruct-2506-GGUF`), en cuantización Q4_K_M. El paquete Loom no modifica los pesos: se limita a reempaquetarlos y a generar kernels específicos para las GPU AMD objetivo. La tarjeta menciona que el modelo upstream soporta entrada de imagen, pero Loom no la soporta en este paquete. Tampoco están habilitados el tool calling, el modo razonamiento, el esfuerzo de razonamiento ni la decodificación especulativa, que aparecen como «not applicable» en la tabla de características.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Ventana de contexto de 131 072 tokens por petición, adecuada para documentos largos y conversaciones extensas.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de salida de 4096 tokens por respuesta (preset `max_tokens`).
- Tool calling: no soportado en este paquete («not applicable»).
- Razonamiento / thinking mode: no soportado en este paquete («not applicable»).
- Decodificación especulativa: no soportada en este paquete («not applicable»).
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream sí la tiene.
- Entrada y salida de audio: no soportada («not applicable»).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Muestreo (sampling): estado «?» (no determinado) según la tabla de características.

## Casos de uso

- Despliegue local en estaciones de trabajo AMD: el paquete está pensado para lanzarse con `loom-serve` sobre una Radeon AI PRO R9700 (32 GB) o un Ryzen AI Max+ 395, sin necesidad de compilar kernels ni convertir pesos, gracias a los programas `.loom` pregenerados y a la verificación SHA-256 de `loom-fetch`.
- Procesamiento de documentos largos: con 131 072 tokens de contexto por petición, el modelo puede ingerir contratos, informes técnicos o bases de código extensas en una sola llamada, útil para resumen y extracción de información en local.
- Asistente conversacional interno: la API compatible con OpenAI permite conectar clientes existentes (SDKs de Python, herramientas tipo OpenAI CLI) apuntando a `http://127.0.0.1:8080/v1/chat/completions`, lo que facilita prototipos sin reescribir integraciones.
- Evaluación comparativa de runtimes en AMD: al estar empaquetado para Loom y existir una referencia cruzada con llama.cpp en las puertas de corrección (`golden`, `compare`), sirve para validar la fidelidad de la implementación Loom frente a llama.cpp sobre el mismo GGUF.
- Servicio de inferencia ligero con concurrencia moderada: 4 peticiones concurrentes y 4096 tokens de salida encajan en escenarios de equipo pequeño, demos internas o pruebas de integración donde no se requiere alta disponibilidad.
- Laboratorio de investigación en hardware de consumo: permite experimentar con un modelo de 24B cuantizado a Q4_K_M en un APU Strix Halo, útil para medir latencia y comportamiento en entornos sin GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), «the results for this package are not yet re-measured». Asimismo, todas las puertas de corrección de `loom-benchmark` (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured» en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base es de 24B parámetros en Q4_K_M, y la GPU de referencia del paquete (Radeon AI PRO R9700) dispone de 32 GB.
- GPU objetivo: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera kernels para arquitecturas AMD gfx1151 y gfx1201.
- ¿Cabe en GPU de consumo? El paquete está orientado a hardware AMD profesional/APU; no se documenta compatibilidad con GPU de consumo NVIDIA ni con Radeon de gama de consumo distinta de las indicadas.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. Opciones de configuración documentadas: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU).
- Latencia y throughput: no disponibles; la tarjeta indica que las mediciones aún no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime / hardware | Rendimiento publicado |
|---|---|---|---|---|---|---|
| loom-draft/unsloth-Mistral-Small-3.2-24B-Instruct-2506-loom | 24B | 131 072 tokens | Q4_K_M (GGUF de origen) | Apache 2.0 | Loom; AMD gfx1151 y gfx1201 | No disponible (sin re-medir) |
| unsloth/Mistral-Small-3.2-24B-Instruct-2506-GGUF (modelo base) | 24B | no disponible en la información proporcionada | GGUF (incluye Q4_K_M) | Apache 2.0 (según el paquete derivado) | llama.cpp y otros runtimes GGUF | No disponible en la información proporcionada |
| Mistral-Small-3.2-24B-Instruct-2506 (upstream) | 24B | no disponible en la información proporcionada | pesos originales | Apache 2.0 (según el paquete derivado) | vLLM, TGI, transformers, etc. | No disponible en la información proporcionada |

La comparativa se limita al linaje directo del modelo, ya que la información proporcionada no incluye datos de rendimiento ni especificaciones de alternativas de otros fabricantes.

## Limitaciones y advertencias

- Sin evidencia empírica publicada: todas las puertas de corrección y las mediciones de rendimiento figuran como «not yet re-measured» en ambas plataformas, por lo que no hay garantía documentada de fidelidad frente a llama.cpp en este paquete concreto.
- Funcionalidades ausentes: tool calling, modo razonamiento, esfuerzo de razonamiento y decodificación especulativa no están soportados en este paquete; el muestreo figura como «no determinado».
- Sin visión: aunque el modelo upstream acepta imágenes, Loom no soporta entrada de imagen en este paquete.
- Compatibilidad de hardware restringida: solo se documentan las arquitecturas AMD gfx1151 y gfx1201; no hay soporte declarado para GPU NVIDIA ni para otras Radeon.
- Idiomas: no se especifican los idiomas soportados en la información disponible.
- Sesgos y alucinaciones: no se documentan en la información proporcionada; deben evaluarse sobre el modelo base Mistral Small 3.2 24B Instruct 2506.
- Licencia: Apache 2.0 según la tarjeta, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base y del checkpoint GGUF de Unsloth antes de desplegar en producción.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la ficha, sin pipeline declarado; es un artefacto recién publicado y sin validación comunitaria.
- Dependencia de la versión del runtime: el paquete fija `hrx-loom[hf]==0.2.0`; cambios de versión del runtime pueden afectar a la compatibilidad de los programas `.loom`.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-Mistral-Small-3.2-24B-Instruct-2506-loom
- Modelo base GGUF (Unsloth): https://huggingface.co/unsloth/Mistral-Small-3.2-24B-Instruct-2506-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
