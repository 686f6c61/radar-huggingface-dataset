# loom-draft/ggml-org-Qwen2.5-VL-7B-Instruct-loom

## Resumen

El paquete `loom-draft/ggml-org-Qwen2.5-VL-7B-Instruct-loom` es una distribución empaquetada del checkpoint GGUF `Qwen2.5-VL-7B-Instruct-Q4_K_M.gguf` de Qwen, publicada por el usuario `loom-draft` para su uso con Loom, un runtime de inferencia de AMD basado en ROCm (repositorio `ROCm/hrx-system`). No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del checkpoint original de ggml-org, sin modificar, y el valor del paquete reside en los programas `.loom` generados y en la tarjeta `model.json` que permiten servir el modelo en GPUs AMD concretas.

El modelo subyacente es Qwen2.5-VL-7B-Instruct, un transformer multimodal de aproximadamente 7 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba, orientado a tareas de imagen-texto-a-texto. El paquete declara una ventana de contexto de 128.000 tokens por petición, soporte de entrada de imágenes mediante un proyector multimodal `mmproj-Qwen2.5-VL-7B-Instruct-f16.gguf`, una API compatible con OpenAI (`/v1/chat/completions`) y hasta 4 peticiones concurrentes, con un máximo de 4.096 tokens de salida por defecto.

Su relevancia es acotada y muy específica: permite ejecutar un modelo de visión-lenguaje de 7B en hardware AMD de consumo y profesional (Ryzen AI Max+ 395 "Strix Halo" y Radeon AI PRO R9700) sin depender de CUDA ni de llama.cpp, a través del stack Loom. La licencia del paquete es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base Qwen2.5-VL-7B-Instruct); el paquete contiene programas Loom generados y pesos GGUF |
| Parametros totales | Aproximadamente 7 mil millones (modelo base Qwen2.5-VL-7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (checkpoint incluido); el proyector multimodal va en f16 |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen2.5-VL-7B-Instruct-Q4_K_M.gguf`) más programas `.loom` y proyector `mmproj-Qwen2.5-VL-7B-Instruct-f16.gguf` |

## Arquitectura y entrenamiento

El paquete no aporta información sobre la arquitectura ni el entrenamiento del modelo subyacente; se limita a redistribuir el GGUF de ggml-org. Por tanto, los detalles de arquitectura, composición del dataset, número de tokens de entrenamiento y etapas de alineación (RLHF/DPO) del Qwen2.5-VL-7B-Instruct no están disponibles en la información proporcionada. Lo que sí documenta la tarjeta es la capa de despliegue: programas `.loom` generados con `loom-next` (generador automático, sin LLM en el bucle), un `tokenizer.json`, un `llm_config.json` y un `model.json` con los ficheros fuente fijados por hash SHA-256 y verificados por `loom-fetch`.

La innovación técnica del paquete es de infraestructura, no de modelado: kernels generados para las arquitecturas AMD gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700), un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parámetros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). La tarjeta incluye un conjunto de puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra llama.cpp sobre el mismo GGUF, pero ninguna de ellas tiene medición registrada para este paquete: todas figuran como "not yet re-measured".

## Capacidades

- Generación de texto e instrucciones conversacionales (pipeline `image-text-to-text`).
- Entrada de imágenes mediante partes `image_url` al estilo OpenAI, procesadas con el proyector `mmproj-Qwen2.5-VL-7B-Instruct-f16.gguf`.
- Servicio HTTP con API compatible con OpenAI en `/v1/chat/completions`.
- Concurrencia de hasta 4 peticiones simultáneas.
- Ventana de contexto de 128.000 tokens por petición y hasta 4.096 tokens de salida (preset `max_tokens`).
- Tool calling: marcado como no aplicable en la tarjeta del paquete.
- Razonamiento o modo thinking: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada o salida de audio: no aplicable.
- Muestreo (temperatura, top_k, semilla): estado "no determinado" en la tarjeta.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Descripción y análisis de imágenes en local: el paquete acepta imágenes vía `image_url` y las procesa con el proyector f16, de modo que se puede montar un servicio de captioning o respuesta a preguntas visuales sobre una estación de trabajo con GPU AMD, sin salir a la nube.
- Extracción de datos de documentos escaneados: con 128.000 tokens de contexto por petición se pueden enviar páginas completas o lotes de imágenes junto con instrucciones de extracción estructurada, útil para digitalización de facturas, albaranes o informes.
- Asistente de soporte con capturas de pantalla: el modelo puede recibir una captura y el historial de conversación en una sola petición, lo que encaja en mesas de ayuda internas donde el usuario adjunta imágenes de errores.
- Procesamiento por lotes de imágenes en pipelines internos: al exponer una API compatible con OpenAI, se integra con clientes y orquestadores existentes; la concurrencia de 4 peticiones permite cierto paralelismo sin reescribir la capa de aplicación.
- Evaluación de hardware AMD para IA: sirve como banco de pruebas reproducible para medir el rendimiento de Loom frente a llama.cpp en Strix Halo y R9700, con las mismas puertas de corrección documentadas en la tarjeta.
- Prototipado de aplicaciones visión-lenguaje en entornos con requisitos de soberanía del dato: al ejecutarse íntegramente en hardware local con licencia Apache 2.0, es adecuado para pruebas de concepto donde las imágenes no pueden enviarse a servicios externos.
- Docencia y experimentación con runtimes alternativos: permite a investigadores comparar la fidelidad de kernels generados automáticamente contra una referencia consolidada como llama.cpp usando el mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican explícitamente que los resultados de este paquete aún no se han vuelto a medir ("the results for this package are not yet re-measured"). Del mismo modo, todas las puertas de corrección figuran sin medición registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de ~7B, más el proyector en f16, y la GPU de referencia R9700 dispone de 32 GB.
- GPUs soportadas según la tarjeta: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPUs de consumo distintas de las dos anteriores; no hay información sobre modelos Radeon de gama doméstica.
- Despliegue: exclusivamente mediante el stack Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete, aunque el GGUF subyacente es el de ggml-org y la referencia de comparación es llama.cpp.
- Memoria: el preset admite `--pool_backing=fixed` para reservar el pool por adelantado, lo que da un consumo de memoria predecible.
- Latencia y throughput: no disponibles; las mediciones del paquete están pendientes de repetir.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| loom-draft/ggml-org-Qwen2.5-VL-7B-Instruct-loom | ~7B | 128.000 tokens | Apache 2.0 | GGUF Q4_K_M + programas Loom; solo AMD gfx1151 y gfx1201 | Paquete de despliegue, no un modelo nuevo; sin benchmarks medidos |
| ggml-org/Qwen2.5-VL-7B-Instruct-GGUF (modelo base) | ~7B | 128.000 tokens (según modelo base) | Apache 2.0 | GGUF; ejecutable con llama.cpp y derivados | Checkpoint original sin modificar del que deriva este paquete |
| Qwen2.5-VL-7B-Instruct (pesos originales) | ~7B | 128.000 tokens (según modelo base) | Apache 2.0 | Safetensors; requiere stack de inferencia con soporte de visión | Modelo de referencia del que procede el GGUF |

No se dispone de datos de rendimiento comparativos en la información proporcionada para establecer diferencias cuantitativas entre estas opciones.

## Limitaciones y advertencias

- El paquete no ha sido validado: todas las puertas de corrección y las mediciones de rendimiento figuran como no repetidas, por lo que no hay evidencia registrada de que la salida coincida con llama.cpp en esta distribución.
- El soporte de hardware está restringido a dos GPUs AMD concretas (gfx1151 y gfx1201); no se documenta funcionamiento en otras GPU, en CPU ni en CUDA.
- Dependencia de una versión concreta del stack (`hrx-loom[hf]==0.2.0`) y de una herramienta de generación (`loom-next`); cambios de versión pueden invalidar los programas `.loom` incluidos.
- Tool calling, razonamiento, decodificación especulativa y audio están marcados como no aplicables, lo que limita su uso en flujos de agentes.
- El estado del muestreo figura como "no determinado", lo que introduce incertidumbre sobre la reproducibilidad de la generación con temperatura y semilla.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-19); es un artefacto reciente y sin adopción verificable.
- No hay información sobre sesgos, tasa de alucinación ni cobertura idiomática del modelo subyacente en la documentación proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-VL-7B-Instruct por separado.
- Los resultados de búsqueda web sobre "Loom" corresponden a un servicio de grabación de pantalla y a una marca de ropa, sin relación con el runtime Loom de AMD; no deben tomarse como documentación del proyecto.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen2.5-VL-7B-Instruct-loom
- Modelo base en Hugging Face: https://huggingface.co/ggml-org/Qwen2.5-VL-7B-Instruct-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
