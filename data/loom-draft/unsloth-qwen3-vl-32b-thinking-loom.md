# loom-draft/unsloth-Qwen3-VL-32B-Thinking-loom

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `Qwen3-VL-32B-Thinking-Q4_K_M.gguf` de Unsloth, que a su vez deriva del modelo Qwen3-VL-32B-Thinking de Alibaba Qwen. El autor, `loom-draft`, publica los artefactos generados con `loom-next` (generador automático, sin LLM en el bucle) para ejecutar el modelo sin modificaciones sobre dos GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El interés practico es la infraestructura: permite servir un modelo vision-lenguaje de 32B con modo de razonamiento siempre activo sobre hardware AMD mediante `loom-serve`, con una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, entrada de imagen vía proyector `mmproj-BF16.gguf` y una ventana de contexto de 262.144 tokens por petición con 4 peticiones concurrentes. No hay pesos nuevos ni fine-tuning: los pesos son el GGUF Q4_K_M original de Unsloth, empaquetado para el runtime Loom.

La relevancia actual es doble. Por un lado, amplía las opciones de despliegue de Qwen3-VL-32B-Thinking fuera del ecosistema CUDA/llama.cpp, apuntando a aceleradores AMD de consumo profesional y a APUs con memoria unificada. Por otro, el repositorio está en estado de borrador: las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `agent`, etc.) figuran como "not yet re-measured", por lo que no debe tratarse como una release validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer vision-lenguaje (Qwen3-VL) con modo thinking; paquete de despliegue Loom sobre runtime propio |
| Parametros totales | 32B (según el nombre del checkpoint base `Qwen3-VL-32B-Thinking`) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de visión en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado en programas Loom (`.loom`, `weights.loom`) más `model.json`, `tokenizer.json` y `llm_config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-32B-Thinking, un transformer multimodal de la familia Qwen3-VL que acepta texto e imágenes y opera con razonamiento explícito siempre activo. El paquete Loom no altera los pesos: toma el GGUF `Qwen3-VL-32B-Thinking-Q4_K_M.gguf` de Unsloth y genera programas `.loom` específicos para las arquitecturas gfx1151 y gfx1201, junto con el tokenizador y la configuración (`llm_config.json`) usada por dichos programas. El proyector multimodal se distribuye aparte en BF16.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la información proporcionada. Tampoco se documentan innovaciones de decodificación: la tarjeta indica explícitamente que la decodificación especulativa y el ajuste de esfuerzo de razonamiento no son aplicables en este paquete. El modo thinking está fijado como siempre activo, sin parámetro para desactivarlo en la configuración publicada (aunque una de las puertas de corrección, `agent_think_off`, sugiere que el runtime contempla ese escenario).

## Capacidades

- Generación de texto y razonamiento con modo thinking siempre activo.
- Comprensión de imágenes: entrada multimodal mediante partes `image_url` en formato OpenAI, procesadas con el proyector `mmproj-BF16.gguf`.
- Tool calling y function calling con esquema OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-turno con reutilización de historial, validados por la puerta `agent`.
- Contexto largo de hasta 262.144 tokens por petición, adecuado para documentos extensos o conversaciones prolongadas.
- Concurrencia de hasta 4 peticiones simultáneas con consistencia de salida respecto a ejecuciones aisladas (puerta `consistency`).
- Límite de 4.096 tokens de salida por petición según el preset `max_tokens`.
- API compatible con OpenAI en `/v1/chat/completions`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Audio: no soportado (marcado como no aplicable).
- Muestreo (`temperature`, `top_k`, `seed`): estado "not determined" en la tarjeta.

## Casos de uso

- Asistente sobre documentos largos: con 262.144 tokens de contexto por petición, el modelo puede ingerir informes, contratos o bases de código completas y responder con razonamiento explícito, útil para revisión documental interna.
- Análisis de capturas y diagramas: la entrada de imagen vía `image_url` permite extraer texto de pantallas, interpretar diagramas de arquitectura o revisar interfaces en flujos de soporte técnico.
- Agentes de automatización con herramientas: el soporte de `tools`/`tool_calls` y la puerta `agent` lo habilitan para orquestar llamadas a APIs internas, consultas a bases de datos o ejecución de comandos en pipelines controlados.
- Despliegue en estaciones AMD sin CUDA: `loom-serve` sobre Strix Halo o R9700 permite servir el modelo en hardware AMD con API OpenAI, evitando dependencias de NVIDIA en entornos homologados.
- Prototipado de asistentes multimodales en local: la combinación de GGUF Q4_K_M (huella de memoria reducida frente a BF16) y memoria unificada en Strix Halo facilita ejecutar un 32B multimodal en una sola máquina.
- Evaluación comparativa de runtimes: las puertas de corrección (`golden`, `compare`, `vision`, `logits`) están diseñadas para contrastar token a token contra llama.cpp sobre el mismo GGUF, lo que sirve para validar la fidelidad numérica del runtime Loom antes de adoptarlo.
- Servicio de razonamiento con concurrencia moderada: 4 peticiones simultáneas con contexto largo encajan en backends de equipos pequeños o entornos de desarrollo compartido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta indica que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" y que todas las puertas de corrección figuran como "not yet re-measured", sin evidencia registrada.

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Cuantización Q4_K_M de un modelo de 32B: el GGUF ocupa del orden de 18-20 GB, cifra estimada a partir del tamaño típico de Q4_K_M para 32B; no confirmada en la información disponible.
- En R9700 (32 GB) el modelo y el proyector BF16 caben con margen para caché KV, aunque el contexto máximo de 262.144 tokens requeriría comprobar el consumo real de memoria, no documentado.
- En Strix Halo, la viabilidad depende de la memoria unificada asignada a la GPU; no se especifica la configuración mínima.
- Despliegue mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` y `loom-serve`, con opciones `--pool_backing=fixed` y `--parameter_mode=preload`.
- No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este paquete; el runtime es Loom.
- Latencia y throughput: no disponibles (mediciones pendientes).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| loom-draft/unsloth-Qwen3-VL-32B-Thinking-loom | 32B | 262.144 | GGUF Q4_K_M empaquetado en Loom | Apache 2.0 | Paquete de despliegue para AMD gfx1151/gfx1201; sin benchmarks publicados |
| unsloth/Qwen3-VL-32B-Thinking-GGUF | 32B | no disponible en la información | GGUF para llama.cpp y similares | Apache 2.0 (heredada) | Checkpoint base sin modificar del que deriva este paquete |
| Qwen3-VL-32B-Thinking (original) | 32B | no disponible en la información | safetensors y ecosistema Hugging Face | Apache 2.0 | Modelo de referencia de Alibaba Qwen; usado como base por Unsloth |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Estado de borrador: descargas 0, likes 0, sin mediciones de rendimiento ni puertas de corrección registradas; no hay evidencia publicada de fidelidad frente a llama.cpp.
- El paquete no incluye pesos nuevos ni mejoras de calidad: cualquier limitación del Qwen3-VL-32B-Thinking original (sesgos, alucinación, cobertura idiomática) se hereda íntegramente.
- Idiomas soportados no documentados; no se debe asumir un rendimiento multilingüe concreto sin evaluarlo.
- Modo thinking siempre activo y sin ajuste de esfuerzo de razonamiento: aumenta la latencia y el consumo de tokens de salida, con un tope de 4.096 tokens por petición.
- Muestreo marcado como "not determined": el comportamiento de `temperature`, `top_k` y `seed` no está verificado.
- Concurrencia limitada a 4 peticiones simultáneas; no apto para servicio de alta carga sin escalado horizontal.
- Compatibilidad restringida a las GPUs AMD indicadas (gfx1151 y gfx1201) y al runtime Loom 0.2.0; no se documenta soporte en otras plataformas.
- Aunque la licencia declarada es Apache 2.0, conviene verificar las condiciones del checkpoint base de Unsloth y del modelo original de Qwen antes de un uso comercial.
- El contexto máximo de 262.144 tokens puede no ser alcanzable en R9700 con 32 GB según el consumo real de caché KV, no documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3-VL-32B-Thinking-loom
- Checkpoint base en Hugging Face: https://huggingface.co/unsloth/Qwen3-VL-32B-Thinking-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
