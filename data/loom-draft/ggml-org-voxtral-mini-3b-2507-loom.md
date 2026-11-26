# loom-draft/ggml-org-Voxtral-Mini-3B-2507-loom

## Resumen

Voxtral-Mini-3B-2507 es un modelo multimodal de audio y texto desarrollado originalmente por Mistral AI, distribuido en formato GGUF por el repositorio ggml-org. Esta ficha concreta, publicada por el usuario loom-draft, no contiene los pesos originales, sino un paquete de despliegue para el ecosistema Loom de AMD: programas `.loom` generados automáticamente a partir del checkpoint `Voxtral-Mini-3B-2507-Q4_K_M.gguf` sin modificar, junto con un `model.json` que describe el preset de ejecución.

El paquete está orientado a dos aceleradores concretos: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (objetivo gfx1151) y la GPU AMD Radeon AI PRO R9700 (objetivo gfx1201, 32 GB). Se genera con la herramienta `loom-next` y se sirve mediante `loom-serve`, que expone una API compatible con OpenAI en `/v1/chat/completions`. El modelo subyacente es un transformer de aproximadamente 3.000 millones de parámetros con soporte de entrada de audio, pensado para transcripción, comprensión de audio y conversación multimodal.

La relevancia de esta publicación es acotada: no es un modelo nuevo ni un fine-tuning, sino un artefacto de portabilidad para ejecutar un GGUF existente sobre ROCm en hardware AMD consumer y profesional. En el momento de la publicación (26 de noviembre de 2026) no registra descargas ni valoraciones, y las mediciones de rendimiento y las puertas de corrección del paquete figuran como no re-medidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Voxtral-Mini-3B-2507; paquete Loom con programas generados) |
| Parametros totales | aproximadamente 3.000 millones (por el nombre del modelo base; no confirmado en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` y `weights.loom`, mas `tokenizer.json`, `llm_config.json` y `model.json` |

## Arquitectura y entrenamiento

El paquete no incluye información sobre la arquitectura interna ni el entrenamiento del modelo base. Lo que sí documenta es la cadena de generación: `loom-next` produce programas `.loom` (kernels y grafo de ejecución) a partir de `llm_config.json`, derivado del GGUF original, sin intervención de un LLM en el bucle. El checkpoint de pesos es el `Voxtral-Mini-3B-2507-Q4_K_M.gguf` sin modificar de ggml-org, por lo que las características de entrenamiento (composición del dataset, RLHF/DPO, etc.) corresponden al modelo original de Mistral AI y no se detallan en esta publicación.

La innovación técnica del artefacto es el propio runtime Loom sobre ROCm: soporte de memoria con `--pool_backing=fixed`, precarga de parámetros con `--parameter_mode=preload` y espera activa de finalización en GPU con `completion_spin_ns=4294967295`. El paquete declara soporte de 4 peticiones concurrentes, un máximo de 4.096 tokens de salida por preset y contexto de 131.072 tokens por petición. No hay decodificación especulativa ni modo de razonamiento.

## Capacidades

- Generación de texto y conversación multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Entrada de audio: el modelo base la soporta, pero la model card indica que Loom no admite entrada de imagen; para audio el estado figura como "no determinado".
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream la tiene.
- Tool calling: no aplicable en este paquete.
- Razonamiento / thinking mode: no aplicable.
- Decodificación especulativa: no aplicable.
- Concurrencia: hasta 4 peticiones simultáneas declaradas.
- Contexto largo: 131.072 tokens por petición.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción y comprensión de audio en local: el modelo base es multimodal de audio; sobre Strix Halo o R9700 permite procesar audio sin enviar datos a la nube, aunque la model card no confirma el estado de la entrada de audio en Loom.
- Asistente conversacional con contexto largo: con 131.072 tokens por petición se pueden mantener conversaciones con documentos extensos adjuntos en el prompt.
- Procesamiento por lotes en hardware AMD: el paquete está pensado para ejecutarse en gfx1151 y gfx1201, lo que facilita desplegar inferencia en estaciones de trabajo con GPU AMD sin depender de CUDA.
- Servicio interno con API OpenAI: `loom-serve` expone `/v1/chat/completions`, de modo que clientes existentes compatibles con OpenAI pueden apuntar a `127.0.0.1:8080` sin cambios de código.
- Evaluación de portabilidad de modelos GGUF sobre ROCm: útil para equipos que quieran medir el rendimiento de Voxtral en hardware AMD frente a llama.cpp, aunque las mediciones de este paquete aún no están re-medidas.
- Prototipado de aplicaciones de voz en el borde: al ejecutarse en una APU Strix Halo, permite integrar un modelo de audio en un equipo compacto sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han re-medido todavía", y que las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de ~3B, lo que en la práctica suele situarse en el entorno de 2-3 GB de pesos, pero no se confirma en la información proporcionada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se confirma compatibilidad con otras GPU AMD o NVIDIA en esta publicación.
- Despliegue: `loom-fetch` para descargar el paquete y `loom-serve` para servirlo, con `hrx-loom[hf]==0.2.0` instalado vía pipx.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Voxtral-Mini-3B-2507 (paquete Loom, esta ficha) | ~3B (no confirmado) | 131.072 tokens | GGUF empaquetado como `.loom`, runtime Loom sobre ROCm | MIT | Solo Strix Halo y R9700; sin benchmarks re-medidos |
| ggml-org/Voxtral-Mini-3B-2507-GGUF | ~3B (no confirmado) | no disponible | GGUF, runtime llama.cpp | no disponible en esta ficha | Checkpoint de referencia del que deriva este paquete |
| Alternativas de ~3B multimodal audio | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- El paquete no incluye los pesos originales: depende del GGUF de ggml-org y de la cadena `loom-next` / `loom-serve`.
- Sin evidencia de corrección registrada: todas las puertas (`kernel_tests`, `golden`, `compare`, etc.) figuran como no re-medidas, por lo que no hay garantía publicada de equivalencia con llama.cpp.
- Sin mediciones de rendimiento: no hay datos de latencia ni throughput para ninguno de los dos objetivos.
- Entrada de imagen no soportada por Loom, pese a que el modelo upstream la tiene; el estado de la entrada de audio figura como "no determinado".
- Tool calling, razonamiento y decodificación especulativa no aplicables en este paquete.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia MIT declarada en el paquete, pero la licencia del modelo base no se detalla en esta ficha; conviene verificar la del checkpoint original antes de uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Sin descargas ni valoraciones: publicación reciente y sin validación comunitaria.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/ggml-org-Voxtral-Mini-3B-2507-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Voxtral-Mini-3B-2507-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
