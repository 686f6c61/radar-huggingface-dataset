# loom-draft/mradermacher-DeepHat-V1-7B-loom

## Resumen

DeepHat-V1-7B (Q4_K_M) para AMD Loom es un paquete de despliegue (`.loom` y un `model.json`) generado por el proyecto Loom a partir del checkpoint GGUF sin modificar `mradermacher/DeepHat-V1-7B-GGUF`. No es un modelo nuevo: es un artefacto de empaquetado que traduce los pesos GGUF originales a programas Loom ejecutables sobre GPUs AMD, concretamente la Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El autor del paquete es el espacio `loom-draft`, generado con la herramienta `loom-next` sin intervención de un LLM en el bucle.

El modelo subyacente es un transformer de 7B parámetros en cuantización Q4_K_M, con una ventana de contexto de 32.768 tokens por petición y soporte de tool calling en formato OpenAI. El paquete expone una API compatible con `/v1/chat/completions` y permite 4 peticiones concurrentes con un máximo de 4.096 tokens de salida por defecto. Su relevancia radica en ofrecer una vía de ejecución nativa en ROCm/HIP para hardware AMD consumer y profesional, sin depender de llama.cpp.

La información disponible sobre el modelo base es escasa: el paquete no documenta arquitectura interna, datos de entrenamiento ni benchmarks del modelo original, y las mediciones de rendimiento y las puertas de corrección del propio paquete aparecen como "no re-measured" en la model card. Esta ficha refleja únicamente lo que consta en la documentación del paquete y del checkpoint referenciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: transformer de 7B; el paquete Loom no detalla la arquitectura interna) |
| Parametros totales | 7B (según el nombre del checkpoint base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 32.768 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete Loom no documenta otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas Loom (`.loom`, `weights.loom`); incluye `tokenizer.json` y `llm_config.json` |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo base más allá de su tamaño (7B) y su formato de checkpoint (GGUF en cuantización Q4_K_M). El artefacto Loom consiste en programas generados (`program/*.loom`, `weights.loom`) que implementan la inferencia sobre GPUs AMD mediante ROCm/HIP, junto con el tokenizador y la configuración (`llm_config.json`) desde la que se generaron. La generación se realizó con `loom-next`, el generador del ecosistema Loom, sin un LLM en el bucle.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco constan innovaciones técnicas del modelo base (atención lineal, decodificación especulativa, modos de razonamiento) más allá de lo que el paquete declara explícitamente: no aplica decodificación especulativa, no hay modo de razonamiento ni entrada de imagen o audio.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en formato OpenAI: acepta `tools` y devuelve `tool_calls`.
- Soporte de agentes multi-turno con tool calling, según la puerta `agent` definida en la model card (aunque sin medición registrada).
- Contexto de 32.768 tokens por petición, adecuado para documentos largos y conversaciones extendidas.
- Concurrencia de 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por defecto (preset `max_tokens`).
- Sin modo de razonamiento/thinking (no aplicable).
- Sin entrada de imagen ni audio (no aplicable).
- Sin decodificación especulativa (no aplicable).

## Casos de uso

- Asistente conversacional autohospedado en estaciones de trabajo AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o Radeon AI PRO R9700 y expone un endpoint compatible con OpenAI, lo que permite sustituir directamente APIs en la nube en entornos con hardware AMD.
- Atención al cliente automatizada: con 32.768 tokens de contexto y 4 peticiones concurrentes, puede gestionar conversaciones multi-turno con historial largo sin truncar el contexto.
- Automatización con herramientas internas: el soporte de `tools` y `tool_calls` permite conectar el modelo a APIs corporativas (consultas a bases de datos, ticketing, CRM) dentro de un bucle de agente multi-turno.
- Procesamiento de documentos largos: la ventana de 32k tokens permite resumir, extraer entidades o responder preguntas sobre informes y contratos en una sola petición.
- Entornos de desarrollo con hardware AMD: al ejecutarse sobre ROCm/HIP sin llama.cpp, encaja en pipelines donde ya se dispone de GPUs AMD y se quiere evitar una capa de compatibilidad adicional.
- Prototipado y evaluación de modelos en local: al ser un paquete ligero (7B en Q4_K_M), permite desplegar un endpoint de chat en una única GPU para pruebas de integración y desarrollo de aplicaciones.
- Despliegue en estaciones con R9700 de 32 GB: la VRAM de la tarjeta deja margen para el modelo cuantizado y para el pool de memoria fijo que el preset compromete por adelantado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para ambas GPUs (Strix Halo gfx1151 y Radeon AI PRO R9700 gfx1201) "no se han vuelto a medir" ("not yet re-measured"), y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) carecen de ejecución registrada. Una puerta sin ejecución registrada no aporta evidencia.

## Requisitos de hardware

- GPUs soportadas explícitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explícita; el checkpoint es de 7B en Q4_K_M y el preset usa `--pool_backing=fixed` (compromiso del pool de memoria por adelantado), pero la card no publica cifras de VRAM.
- Cabe en GPU consumer: sí, al menos en la Radeon AI PRO R9700 de 32 GB; no consta compatibilidad con GPUs consumer de gama baja ni con CUDA/NVIDIA.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` y `loom-serve`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles; las mediciones frente a llama.cpp no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepHat-V1-7B (paquete Loom) | 7B | 32.768 | GGUF + programas Loom | Apache 2.0 | Ejecución nativa ROCm/HIP en Strix Halo y R9700; sin benchmarks publicados |
| mradermacher/DeepHat-V1-7B-GGUF | 7B | no disponible | GGUF | Apache 2.0 | Checkpoint base sin modificar del que deriva este paquete |
| Alternativas de 7B en GGUF (p. ej. familias Llama/Mistral/Qwen) | 7B | variable | GGUF | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- El paquete no aporta evidencia de corrección: todas las puertas (`golden`, `compare`, `agent`, `sampling`, `logits`, etc.) figuran como no medidas, por lo que no hay verificación publicada de que la salida coincida con la referencia de llama.cpp.
- No hay mediciones de rendimiento publicadas frente a llama.cpp en ninguna de las dos GPUs soportadas.
- La información sobre el modelo base es mínima: se desconoce la composición del dataset de entrenamiento, los idiomas soportados y los sesgos conocidos.
- Riesgo de alucinación: no cuantificado en la documentación disponible; aplicable el riesgo habitual de un modelo de 7B sin benchmarks publicados.
- Compatibilidad limitada al hardware AMD especificado (gfx1151 y gfx1201); no se documenta soporte para otras GPUs ni para CUDA.
- El paquete está generado por una herramienta automática (`loom-next`) sin LLM en el bucle, lo que implica que la calidad del empaquetado depende del generador y no de una revisión manual documentada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia y las condiciones del checkpoint base `mradermacher/DeepHat-V1-7B-GGUF` antes de desplegar en producción.
- El límite de salida por defecto es de 4.096 tokens y la concurrencia de 4 peticiones; cargas mayores requieren ajustar el preset.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-DeepHat-V1-7B-loom
- Checkpoint base: https://huggingface.co/mradermacher/DeepHat-V1-7B-GGUF
- Repositorio del sistema Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
