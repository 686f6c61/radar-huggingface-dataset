# loom-draft/weareapexcreators-Qwen3.5-2B-MTP-LocalAI-loom

## Resumen

El modelo `loom-draft/weareapexcreators-Qwen3.5-2B-MTP-LocalAI-loom` es un paquete de distribución en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `weareapexcreators/Qwen3.5-2B-MTP-LocalAI` en su variante `Qwen3.5-2B-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y está generado con la herramienta `loom-next`, que produce los programas sin intervención de un LLM en el bucle. El objetivo no es ofrecer un modelo nuevo, sino un artefacto listo para ejecutarse sobre GPUs AMD concretas: el Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es Qwen3.5-2B, una variante de 2.000 millones de parámetros con capacidades multimodales (pipeline `image-text-to-text`) y soporte de decodificación especulativa mediante MTP (Multi-Token Prediction) con profundidad 3, activada por defecto. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento opcional y una ventana de contexto declarada de 262.144 tokens por petición, con hasta 4 peticiones concurrentes.

Su relevancia es doble: por un lado, demuestra un flujo de despliegue nativo para hardware AMD de consumo y estación de trabajo (ROCm, sin CUDA); por otro, incluye un conjunto de puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra llama.cpp sobre el mismo GGUF. En el momento de la publicación, ninguna de esas puertas tiene medición registrada, y tampoco hay datos de rendimiento frente a llama.cpp ni resultados de benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5) con decodificación especulativa MTP; multimodal con proyector `mmproj-BF16.gguf` |
| Parámetros totales | 2B (según el nombre del checkpoint base) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantización | Q4_K_M (GGUF); proyector de visión en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.5-2B-Q4_K_M.gguf`) más paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El checkpoint base es un transformer denso de la familia Qwen3.5 con 2B parámetros, adaptado para entrada de imagen mediante un proyector multimodal separado (`mmproj-BF16.gguf`). Incorpora Multi-Token Prediction (MTP) como mecanismo de decodificación especulativa: el paquete lo activa por defecto con profundidad 3, de modo que el modelo propone varios tokens por paso y un verificador los valida. La tarjeta del paquete no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información correspondería a la tarjeta del checkpoint base, que no se ha proporcionado.

El paquete Loom en sí no modifica los pesos: genera kernels y programas de servicio específicos para las arquitecturas AMD gfx1151 y gfx1201 a partir del GGUF original. El servidor `loom-serve` permite ajustar el comportamiento de memoria y espera (`completion_spin_ns=4294967295` para espera activa de completions en GPU, `pool_backing=fixed` para reservar el pool por adelantado, `parameter_mode=preload` para precargar pesos en el host). La decodificación especulativa MTP se declara equivalente en salida a la ejecución sin ella, aunque la puerta `spec` que lo verifica no tiene medición registrada.

## Capacidades

- Generación de texto y conversación multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Entrada de imágenes con estilo OpenAI (`image_url`), procesadas por el proyector `mmproj-BF16.gguf`.
- Tool calling / function calling con el esquema `tools` y `tool_calls` de OpenAI.
- Modo de razonamiento (thinking) desactivable; por defecto está apagado y se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Decodificación especulativa MTP con profundidad 3, activada por defecto.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Soporte de audio de entrada/salida y parámetros de muestreo: no determinado en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente conversacional local en estación de trabajo AMD: el paquete se sirve con `loom-serve` sobre una Radeon AI PRO R9700 y expone un endpoint compatible con OpenAI, lo que permite conectar clientes existentes sin adaptadores.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por petición, encaja en tareas de resumen o extracción sobre contratos, informes o expedientes extensos sin trocear el texto.
- Análisis de capturas y diagramas: la entrada de imagen vía `image_url` permite describir interfaces, extraer texto de capturas o interpretar diagramas técnicos en un flujo de texto e imagen.
- Agentes con herramientas en local: el soporte de `tools`/`tool_calls` y el bucle multi-turno (validado por las puertas `agent` y `agent_think_off`) permiten construir asistentes que consultan APIs internas o bases de datos sin salir del equipo.
- Prototipado en hardware de consumo: al ser un modelo de 2B en Q4_K_M, cabe en el Ryzen AI Max+ 395 «Strix Halo» con memoria unificada, lo que facilita entornos de desarrollo sin GPU dedicada.
- Evaluación de infraestructura ROCm: las puertas de corrección (`golden`, `compare`, `logits`, `decision`) comparan la salida contra llama.cpp token a token, útiles para validar una instalación de `hrx-loom` antes de desplegar en producción.
- Generación asistida con razonamiento opcional: activando `enable_thinking` se puede usar para tareas de análisis paso a paso, y desactivándolo para respuestas de baja latencia en chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta indica explícitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) «no se han vuelto a medir», y que ninguna de las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) tiene ejecución registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un GGUF Q4_K_M de 2B parámetros ronda los 1,5-2 GB de pesos, más el proyector BF16 y las estructuras de contexto. La cifra exacta del preset no se documenta.
- GPUs soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Cabe en GPU de consumo: sí, en el sentido de que Strix Halo es un APU con memoria unificada; no se documenta soporte para GPUs NVIDIA ni para otras Radeon.
- Despliegue: `hrx-loom[hf]==0.2.0` (instalación vía pipx), `loom-fetch` para materializar el paquete y `loom-serve` como servidor. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI para este paquete concreto, aunque llama.cpp se usa como referencia de corrección.
- Latencia y throughput: no disponibles; la tarjeta indica que las mediciones aún no se han repetido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| `loom-draft/weareapexcreators-Qwen3.5-2B-MTP-LocalAI-loom` | 2B (Q4_K_M) | 262.144 tokens | Apache 2.0 | Loom sobre AMD gfx1151/gfx1201 | Paquete específico para ROCm; sin benchmarks publicados |
| `weareapexcreators/Qwen3.5-2B-MTP-LocalAI` (base) | 2B | No disponible en la información | Apache 2.0 (heredada) | GGUF genérico (llama.cpp y otros) | Checkpoint original sin empaquetar |
| Qwen3.5-2B estándar | 2B | No disponible en la información | Apache 2.0 | Múltiple | Referencia de la familia; sin datos de rendimiento en esta ficha |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones; la comparativa se limita a parámetros, contexto, licencia y vías de despliegue.

## Limitaciones y advertencias

- No hay mediciones de rendimiento ni de corrección registradas: todas las puertas de la tarjeta aparecen como «not yet re-measured», por lo que la equivalencia con llama.cpp no está verificada en esta publicación.
- El paquete está atado a dos arquitecturas AMD concretas (gfx1151 y gfx1201); no se documenta funcionamiento en NVIDIA, otras Radeon ni CPU.
- El límite de salida es de 4.096 tokens por petición, muy por debajo de la ventana de contexto de 262.144 tokens.
- Solo admite 4 peticiones concurrentes según el preset; cargas mayores requerirán varias instancias o ajuste del preset.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés sin evaluación propia.
- Riesgo de alucinación inherente a un modelo de 2B parámetros; no se han publicado evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del checkpoint base y del proyector multimodal por separado.
- El resultado de la búsqueda web sobre «Loom» corresponde a productos no relacionados (grabador de pantalla y marca de ropa); no aporta información técnica sobre este paquete.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-draft/weareapexcreators-Qwen3.5-2B-MTP-LocalAI-loom
- Checkpoint base: https://huggingface.co/weareapexcreators/Qwen3.5-2B-MTP-LocalAI
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
