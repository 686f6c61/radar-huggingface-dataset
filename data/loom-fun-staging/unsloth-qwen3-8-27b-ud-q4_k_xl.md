# loom-fun-staging/unsloth-Qwen3.8-27B-UD-Q4_K_XL

## Resumen

Qwen3.8-27B (UD-Q4_K_XL) para AMD Loom es un paquete de despliegue (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `Qwen3.8-27B-UD-Q4_K_XL.gguf`, publicado por `unsloth` en su repositorio `unsloth/Qwen3.8-27B-GGUF`. El paquete lo mantiene la organización `loom-fun-staging` y está generado con el flujo de trabajo `loom-skills`, con el objetivo de servir el modelo sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el runtime Loom.

El modelo subyacente es un Qwen de 27 000 millones de parámetros con capacidades multimodales de entrada de imagen (pipeline `image-text-to-text`) y una ventana de contexto nativa de 262 144 tokens. El paquete añade al GGUF original un conjunto de kernels generados, decodificación especulativa basada en MTP (multi-token prediction) con profundidad 3, y un servidor compatible con la API de OpenAI (`/v1/chat/completions`).

Su relevancia radica en que ofrece una vía de despliegue optimizada para hardware AMD de consumo y estación de trabajo, un nicho tradicionalmente dominado por CUDA, con soporte de tool calling, modo de razonamiento configurable y entrada de imágenes. La cuantización UD-Q4_K_XL (unsloth Dynamic) reduce el peso del modelo lo suficiente para caber en los 32 GB de la Radeon AI PRO R9700, aunque con una reducción del contexto servible a 84 992 tokens por petición en esa GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8), multimodal con proyector de visión; detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 27 000 millones (según el nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens nativos; 84 992 tokens por petición en Radeon AI PRO R9700 (limitado por memoria) |
| Tipos de cuantización | UD-Q4_K_XL (unsloth Dynamic, GGUF); proyector de visión en f16 (`mmproj-Qwen3.8-27B-f16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (checkpoint base `Qwen3.8-27B-UD-Q4_K_XL.gguf`); paquete Loom (`.loom` + `model.json`) |
| Salida máxima | 4 096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Decodificación especulativa | MTP, profundidad 3, activada por defecto |

## Arquitectura y entrenamiento

La información disponible describe el paquete de despliegue, no el entrenamiento del modelo base. El checkpoint subyacente es un transformer Qwen3.8 de 27 000 millones de parámetros con un proyector multimodal separado (`mmproj-Qwen3.8-27B-f16.gguf`) que habilita la entrada de imágenes en formato `image_url` compatible con la API de OpenAI. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable de este paquete es la integración de decodificación especulativa mediante MTP con profundidad 3, activada por defecto, junto con kernels generados específicamente para las arquitecturas AMD gfx1151 y gfx1201. El runtime Loom permite configurar el comportamiento del servidor mediante opciones como `completion_spin_ns` (espera activa de finalizaciones de GPU), `pool_backing=fixed` (reserva del pool de memoria por adelantado) y `parameter_mode=preload` (carga de pesos en host). El modo de razonamiento es configurable mediante `reasoning_effort` con niveles low, medium, high y xhigh (por defecto xhigh).

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Control granular del esfuerzo de razonamiento mediante `reasoning_effort` (low, medium, high, xhigh).
- Tool calling y function calling con formato compatible con OpenAI (`tools` y `tool_calls`).
- Entrada de imágenes (image-text-to-text) mediante partes `image_url` y el proyector `mmproj-Qwen3.8-27B-f16.gguf`.
- Decodificación especulativa MTP con profundidad 3 para acelerar la generación.
- Servidor HTTP compatible con la API de OpenAI (`/v1/chat/completions`).
- Soporte de hasta 4 peticiones concurrentes.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Audio (entrada/salida): no aplicable según la tarjeta del modelo.

## Casos de uso

- Asistente conversacional multi-turno con documentos largos: la ventana nativa de 262 144 tokens permite procesar contratos, informes o bases de código extensas en una sola petición; en la Radeon AI PRO R9700 el límite práctico es de 84 992 tokens por petición.
- Análisis de documentos con imágenes: el soporte de entrada de imagen junto con el proyector f16 permite extraer información de capturas, diagramas o formularios escaneados combinándolos con texto en la misma conversación.
- Agentes con tool calling en producción: la compatibilidad con `tools` y `tool_calls` de estilo OpenAI permite integrar el modelo en orquestadores de agentes existentes sin adaptadores adicionales, con hasta 4 peticiones concurrentes por instancia.
- Razonamiento complejo por etapas: el modo thinking con `reasoning_effort` ajustable permite elegir entre respuestas rápidas (low) y cadenas de razonamiento profundas (xhigh) según el coste computacional aceptable.
- Despliegue en estaciones de trabajo AMD: el paquete está diseñado específicamente para Strix Halo y Radeon AI PRO R9700, lo que permite servir un modelo de 27B cuantizado en hardware AMD sin depender de CUDA.
- Generación de código asistida en local: con 4 096 tokens de salida máxima por petición y decodificación especulativa MTP, es adecuado para autocompletado y generación de funciones en entornos de desarrollo con hardware AMD.
- Prototipado e investigación: al ser un paquete reproducible con comandos de instalación y servicio documentados, sirve para evaluar el rendimiento de kernels generados frente a llama.cpp en GPUs AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del modelo indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir todavía", y todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPU.

## Requisitos de hardware

- VRAM estimada: el checkpoint UD-Q4_K_XL de 27B requiere aproximadamente 16-18 GB solo para pesos; el pool de memoria del preset debe acomodar además caché KV para el contexto servible. En la Radeon AI PRO R9700 (32 GB) el contexto por petición se limita a 84 992 tokens.
- GPU soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documentan otras GPU en la información proporcionada; el paquete está orientado a las dos arquitecturas AMD citadas.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete; llama.cpp aparece únicamente como referencia de corrección.
- Opciones de servicio destacadas: `--pool_backing=fixed` (reserva fija del pool), `--parameter_mode=preload` (carga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU).
- Latencia y throughput: no disponibles; las mediciones comparativas frente a llama.cpp no se han publicado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia estructural, el propio paquete se compara internamente con llama.cpp ejecutando el mismo GGUF, pero no se han publicado los resultados de esa comparación.

## Limitaciones y advertencias

- Las mediciones de rendimiento y las puertas de corrección están pendientes de re-medición en ambas GPU según la tarjeta del modelo; no hay garantía publicada de paridad con llama.cpp en esta versión.
- La licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial del modelo ni del paquete.
- Los idiomas soportados no están documentados; no se puede garantizar calidad multilingüe.
- El contexto servible en Radeon AI PRO R9700 se reduce a 84 992 tokens por petición frente a los 262 144 nativos, por limitación de memoria.
- La salida máxima está limitada a 4 096 tokens por petición según el preset `max_tokens`.
- La concurrencia está limitada a 4 peticiones simultáneas por instancia.
- El paquete está restringido a las arquitecturas AMD gfx1151 y gfx1201; no se documenta soporte para otras GPU.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- El modelo es un paquete de despliegue de terceros sobre un GGUF de unsloth; la responsabilidad sobre el comportamiento del modelo base recae en el checkpoint original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-Qwen3.8-27B-UD-Q4_K_XL
- Checkpoint base (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
