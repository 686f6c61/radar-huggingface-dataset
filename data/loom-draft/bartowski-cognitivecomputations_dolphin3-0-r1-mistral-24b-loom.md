# loom-draft/bartowski-cognitivecomputations_Dolphin3.0-R1-Mistral-24B-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue en formato `.loom` (programas Loom y una tarjeta `model.json`) generado a partir del checkpoint GGUF cuantizado Q4_K_M de `bartowski/cognitivecomputations_Dolphin3.0-R1-Mistral-24B-GGUF`. El autor del paquete es el usuario `loom-draft`, y los pesos subyacentes corresponden a Dolphin 3.0 R1 Mistral 24B, un fine-tune de Cognitive Computations sobre la base Mistral Small 24B, orientado a razonamiento y tareas agénticas sin restricciones de alineamiento. El paquete está pensado para ejecutarse con el runtime Loom sobre GPUs AMD: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia del artefacto es de infraestructura más que de modelado: demuestra el flujo de generación automática de paquetes Loom con `loom-next` (sin LLM en el bucle) y expone un servidor compatible con la API de OpenAI (`/v1/chat/completions`) sobre ROCm. El paquete fija un contexto de 32.768 tokens por petición, 4 peticiones concurrentes y un máximo de 4.096 tokens de salida definido en el preset.

No se dispone de información sobre arquitectura interna, número exacto de parámetros, composición del dataset de entrenamiento ni licencia en la información proporcionada. La model card del paquete tampoco incluye mediciones de rendimiento ni resultados de las puertas de corrección, que aparecen como "not yet re-measured" en ambas GPUs objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete envuelve un GGUF Q4_K_M de Dolphin3.0-R1-Mistral-24B; la arquitectura del modelo base no se detalla en la información proporcionada) |
| Parametros totales | no disponible (el nombre del modelo sugiere 24B, sin confirmación en la información) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens por petición (preset del paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` + `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-compatible `/v1/chat/completions` |
| GPUs objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (comandos `loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura del modelo subyacente (transformer, MoE, híbrido, etc.), el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El nombre del checkpoint (`Dolphin3.0-R1-Mistral-24B`) apunta a un fine-tune de Cognitive Computations sobre Mistral 24B con destilación de razonamiento estilo R1, pero estos detalles no se confirman en la documentación disponible.

Lo que sí documenta el paquete es la capa de ejecución: los pesos GGUF se cargan mediante kernels generados por `loom-next` para las arquitecturas AMD gfx1151 y gfx1201, con un pool de memoria de asignación fija (`--pool_backing=fixed`), precarga de parámetros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). El paquete no implementa decodificación especulativa, tool calling, modo de razonamiento ni entrada multimodal: la tabla de features marca esas filas como "not applicable".

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Contexto de 32.768 tokens por petición, suficiente para documentos largos y conversaciones multi-turno extensas.
- Hasta 4 peticiones concurrentes con la misma salida que en ejecución aislada (la puerta de consistencia existe, aunque sin medición registrada).
- Máximo de 4.096 tokens de salida por respuesta según el preset.
- Tool calling: no soportado ("not applicable" en la tabla de features).
- Modo de razonamiento o thinking: no soportado.
- Decodificación especulativa: no soportada.
- Entrada de imagen o audio: no soportada.
- Capacidades multilingües: no disponibles en la información.

## Casos de uso

- Servicio de chat local en estación de trabajo AMD: desplegar `loom-serve` sobre una Radeon AI PRO R9700 y exponer un endpoint compatible con OpenAI para herramientas internas que ya hablan ese protocolo, sin necesidad de adaptar clientes.
- Procesamiento de documentos largos: con 32.768 tokens de contexto, resumir o extraer información de contratos, informes o transcripciones que no caben en ventanas de 8k o 16k.
- Evaluación de la cadena Loom frente a llama.cpp: usar las puertas `golden`, `compare` y `logits` de `loom-benchmark` para verificar que los kernels generados reproducen token a token la referencia de llama.cpp sobre el mismo GGUF.
- Prototipado en hardware Strix Halo: ejecutar el modelo en una APU Ryzen AI Max+ 395 sin GPU discreta, útil para desarrollo en portátiles o mini-PC con memoria unificada.
- Generación de texto por lotes en local: procesar colas de prompts con concurrencia 4 y salidas de hasta 4.096 tokens para tareas de redacción, clasificación o extracción.
- Base para fine-tunes posteriores: al ser un checkpoint GGUF de Dolphin 3.0 R1 Mistral 24B, sirve como referencia de comportamiento para comparar variantes cuantizadas o ajustadas antes de desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp en Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 24B nominales, lo que en la práctica requiere del orden de 14-16 GB solo para pesos, más overhead de contexto y pool de memoria del runtime. La cifra exacta no se documenta.
- GPU validadas por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs NVIDIA ni para Radeon de gama consumer; el paquete está generado específicamente para las dos arquitecturas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir. No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas soportadas por este paquete concreto, aunque llama.cpp se usa como referencia de corrección.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card están pendientes de remedición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-draft/…Dolphin3.0-R1-Mistral-24B-loom (este paquete) | no disponible (24B nominal) | 32.768 | `.loom` + GGUF Q4_K_M | no disponible | Solo AMD gfx1151 y gfx1201; sin tool calling ni thinking |
| bartowski/cognitivecomputations_Dolphin3.0-R1-Mistral-24B-GGUF | no disponible (24B nominal) | no disponible | GGUF | no disponible | Checkpoint de origen; ejecutable con llama.cpp en múltiples backends |
| Otros fine-tunes Dolphin 3.0 de Cognitive Computations | no disponible | no disponible | safetensors/GGUF | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer comparativas de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El artefacto es un paquete de despliegue, no un modelo nuevo: cualquier evaluación de calidad debe hacerse sobre el checkpoint Dolphin3.0-R1-Mistral-24B subyacente.
- Sin mediciones de rendimiento ni de corrección registradas: las puertas de `loom-benchmark` figuran como "not yet re-measured" en ambas GPUs, por lo que no hay evidencia publicada de que la salida coincida con llama.cpp.
- Soporte de hardware muy restringido: solo gfx1151 y gfx1201; no hay indicios de funcionamiento en NVIDIA, Intel ni Radeon consumer.
- Funcionalidades ausentes: sin tool calling, sin modo de razonamiento, sin decodificación especulativa y sin entrada multimodal, lo que limita su uso en pipelines agénticos.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que verificar la licencia del checkpoint base antes de desplegar en producción.
- Idiomas no declarados: no se puede asumir calidad multilingüe sin evaluación propia.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; los fine-tunes Dolphin se caracterizan por un alineamiento laxo, lo que puede aumentar la probabilidad de contenido no filtrado, pero este punto no se confirma en la documentación disponible.
- Contexto y salida acotados por el preset (32.768 y 4.096 tokens): peticiones que excedan esos límites requerirán ajuste del preset o truncado.
- Concurrencia limitada a 4 peticiones: no apto para cargas de alta concurrencia sin escalado horizontal.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/bartowski-cognitivecomputations_Dolphin3.0-R1-Mistral-24B-loom
- Checkpoint base en Hugging Face: https://huggingface.co/bartowski/cognitivecomputations_Dolphin3.0-R1-Mistral-24B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador de paquetes loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
