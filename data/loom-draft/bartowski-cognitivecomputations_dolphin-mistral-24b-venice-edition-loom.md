# loom-draft/bartowski-cognitivecomputations_Dolphin-Mistral-24B-Venice-Edition-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue en formato `.loom` (programas y una tarjeta `model.json`) generado con `loom-next` para servir el checkpoint GGUF `cognitivecomputations_Dolphin-Mistral-24B-Venice-Edition-Q4_K_M.gguf`, publicado originalmente por bartowski. El modelo subyacente es un fine-tune de la familia Mistral de 24 mil millones de parámetros (la denominación "24B" del checkpoint), empaquetado sin modificaciones: el autor del paquete (loom-draft) no altera los pesos, solo genera los kernels y el runtime específicos para GPUs AMD.

El objetivo del paquete es ejecutar este GGUF en hardware AMD concretamente dos plataformas: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El runtime Loom expone una API compatible con OpenAI (`/v1/chat/completions`) y aplica límites de preset: 32.768 tokens de contexto por petición, 4 peticiones concurrentes y 4.096 tokens máximos de salida.

La relevancia es operativa: permite servir un modelo de 24B cuantizado en Q4_K_M sobre GPUs AMD de consumo/prosumer sin depender de ROCm estándar ni de llama.cpp, con verificación de correctitud frente a la referencia de llama.cpp (aunque las mediciones de rendimiento y las puertas de correctitud figuran como "not yet re-measured" en la información disponible).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete es un runtime Loom sobre un GGUF; la arquitectura del modelo subyacente no se detalla en la información proporcionada) |
| Parametros totales | 24B (según la denominación del checkpoint `Dolphin-Mistral-24B-Venice-Edition`) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens por petición (límite del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (único checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como `.loom` con `model.json`) |

## Arquitectura y entrenamiento

El paquete no describe la arquitectura interna del modelo subyacente; se limita a envolver el GGUF `cognitivecomputations_Dolphin-Mistral-24B-Venice-Edition-Q4_K_M.gguf` sin modificarlo. Por la denominación del checkpoint, se trata de un fine-tune de la familia Mistral de 24B, pero no se dispone en la información proporcionada de detalles sobre número de capas, atención, composición del dataset de entrenamiento, número de tokens vistos ni si hubo RLHF/DPO.

La innovación técnica relevante está en el runtime, no en los pesos: `loom-next` genera kernels y programas `.loom` específicos para gfx1151 (Strix Halo) y gfx1201 (R9700), con soporte de pool de memoria fijo (`--pool_backing=fixed`), precarga de parámetros (`--parameter_mode=preload`) y espera activa de finalización en GPU (`completion_spin_ns=4294967295`). El sistema incluye un conjunto de puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida con la referencia de llama.cpp sobre el mismo GGUF; en la información disponible todas figuran como "not yet re-measured".

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Contexto de 32.768 tokens por petición, adecuado para documentos largos y conversaciones multi-turno extensas.
- Hasta 4 peticiones concurrentes con consistencia verificada (la puerta `consistency` compara la salida concurrente con la ejecución aislada).
- Hasta 4.096 tokens de salida por respuesta (límite del preset `max_tokens`).
- Tool calling: no aplicable según la tabla de características del paquete.
- Razonamiento / thinking mode: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream sí la tendría según la model card.
- Entrada/salida de audio: no aplicable.
- Muestreo: estado "no determinado" en la tabla de características.

## Casos de uso

- Despliegue local en estaciones de trabajo AMD: servir el modelo en una Radeon AI PRO R9700 (32 GB) mediante `loom-serve` para equipos de desarrollo que ya trabajan con ROCm y quieren evitar dependencias de CUDA. El GGUF Q4_K_M encaja en los 32 GB de VRAM de la tarjeta.
- Asistente conversacional self-hosted: con 32.768 tokens de contexto y API compatible con OpenAI, se puede integrar en clientes existentes (Open WebUI, LibreChat) apuntando a `http://127.0.0.1:8080/v1/chat/completions` sin adaptadores adicionales.
- Procesamiento de documentos largos: análisis y resumen de contratos, informes o expedientes de hasta ~32k tokens en una sola petición, útil en entornos con requisitos de soberanía de datos donde no se puede usar una API en la nube.
- Prototipado en hardware Strix Halo: validar flujos de inferencia en la APU Ryzen AI Max+ 395 antes de escalar a GPUs dedicadas, aprovechando la memoria unificada de la plataforma.
- Evaluación comparativa de runtimes: usar las puertas de correctitud (`golden`, `compare`, `logits`, `sampling`) para contrastar la implementación Loom frente a llama.cpp sobre el mismo GGUF, como parte de un proceso de validación de runtime.
- Servicio de chat con concurrencia moderada: 4 peticiones simultáneas son suficientes para un equipo pequeño o un entorno de demo interna con tráfico controlado.
- Investigación sobre fine-tunes de Mistral: el checkpoint Dolphin-Venice permite experimentar con un modelo afinado para instrucciones sin depender de infraestructura NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y todas las puertas de correctitud figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de un modelo de 24B ocupa aproximadamente 14-15 GB en pesos; el paquete está pensado para GPUs con al menos 32 GB (R9700) o para la memoria unificada de Strix Halo.
- GPU soportadas explícitamente: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPU de consumo: no se documenta soporte para GPUs de consumo AMD (RX 7000/9000) ni para NVIDIA; el paquete es específico de las dos plataformas AMD citadas.
- Despliegue: `hrx-loom[hf]==0.2.0` vía `pipx`, con `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Dolphin-Mistral-24B-Venice-Edition (este paquete, Loom) | 24B | 32.768 (preset Loom) | Apache 2.0 | GGUF Q4_K_M empaquetado `.loom`, runtime Loom para AMD gfx1151/gfx1201 | Paquete específico de hardware AMD; tool calling y thinking no aplicables |
| Dolphin-Mistral-24B-Venice-Edition (GGUF de bartowski) | 24B | no disponible | Apache 2.0 | GGUF, ejecutable con llama.cpp | Checkpoint upstream sin empaquetar; referencia de correctitud del paquete Loom |
| Mistral Small 24B (familia base) | 24B | no disponible | Apache 2.0 (según familia) | safetensors / GGUF | Modelo base de la familia; los detalles del fine-tune Dolphin no se detallan en la información disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer diferencias cuantitativas entre estas alternativas.

## Limitaciones y advertencias

- El paquete es específico de dos plataformas AMD (gfx1151 y gfx1201); no funcionará en NVIDIA, GPUs AMD de consumo no listadas ni en CPU.
- Tool calling, thinking mode, decodificación especulativa y entrada de audio figuran como no aplicables; la entrada de imagen no está soportada por Loom aunque el modelo upstream la tendría.
- El muestreo figura como "no determinado", lo que impide garantizar el comportamiento de temperatura, top_k y semilla sin validación previa.
- Las puertas de correctitud y las mediciones de rendimiento no se han vuelto a medir en este paquete: no hay garantía publicada de equivalencia token a token con llama.cpp en esta versión.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de fidelidad para este fine-tune.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del checkpoint upstream y de los datos de entrenamiento del fine-tune Dolphin antes de producción.
- El límite de 4 peticiones concurrentes y 4.096 tokens de salida puede ser insuficiente para cargas de producción medias o altas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto recién generado sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-cognitivecomputations_Dolphin-Mistral-24B-Venice-Edition-loom
- Checkpoint GGUF upstream: https://huggingface.co/bartowski/cognitivecomputations_Dolphin-Mistral-24B-Venice-Edition-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
