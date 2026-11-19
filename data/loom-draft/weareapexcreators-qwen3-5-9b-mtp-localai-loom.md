# loom-draft/weareapexcreators-Qwen3.5-9B-MTP-LocalAI-loom

## Resumen

`loom-draft/weareapexcreators-Qwen3.5-9B-MTP-LocalAI-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado con la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `weareapexcreators/Qwen3.5-9B-MTP-LocalAI`, concretamente el fichero `Qwen3.5-9B-Q4_K_M.gguf`. No se trata de un modelo entrenado por el autor del repositorio, sino de un artefacto de empaquetado orientado a la inferencia del modelo base sobre GPUs AMD concretas: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un Qwen3.5 de 9.000 millones de parámetros con capacidad de entrada de imagen (pipeline `image-text-to-text`), decodificación especulativa MTP (multi-token prediction) y modo de razonamiento activado por defecto. El paquete Loom expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, ventana de contexto de 262.144 tokens por petición, hasta 4 peticiones concurrentes y un límite de 4.096 tokens de salida por defecto en el preset.

Su relevancia es acotada pero específica: permite servir un modelo multimodal de 9B cuantizado en Q4_K_M sobre hardware AMD consumer y profesional con un stack propio (hrx-loom 0.2.0) alternativo a llama.cpp, con decodificación especulativa activada por defecto. La licencia declarada es Apache 2.0. El repositorio no registra descargas ni interacciones y las mediciones de rendimiento y correctness del paquete aún no se han vuelto a medir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5; el paquete no detalla la arquitectura interna) |
| Parametros totales | 9B (según nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base `weareapexcreators/Qwen3.5-9B-MTP-LocalAI`. Por el nombre y las capacidades declaradas se infiere un transformer multimodal de 9B parámetros con cabezas de predicción multi-token (MTP) para decodificación especulativa, pero el repositorio no aporta detalles sobre número de capas, atención, composición del dataset ni proceso de alineación (RLHF/DPO). No se dispone de datos sobre tokens de entrenamiento ni de innovaciones técnicas más allá del uso de MTP.

El paquete Loom en sí no entrena nada: genera kernels y programas de ejecución para el GGUF original mediante `loom-next`, "el generador solo, sin LLM en el bucle", según la model card. La decodificación especulativa MTP está activada por defecto con profundidad 3. El paquete incluye un conjunto de puertas de correctness (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, pero todas ellas figuran como "not yet re-measured" en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto; se puede desactivar con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen (image-text-to-text) mediante partes `image_url` de estilo OpenAI, usando el proyector `mmproj-BF16.gguf`.
- Tool calling / function calling con formato OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-turno con tool calling, incluyendo variante con thinking desactivado (puertas `agent` y `agent_think_off`).
- Decodificación especulativa MTP con profundidad 3, activada por defecto.
- API compatible con OpenAI en `/v1/chat/completions`.
- Concurrencia de hasta 4 peticiones simultáneas.
- Capacidades multilingües: no disponible.
- Entrada/salida de audio: no determinado según la model card.
- Muestreo (sampling): no determinado según la model card.

## Casos de uso

- Asistente conversacional local sobre hardware AMD: el paquete se sirve con `loom-serve` en Strix Halo o R9700 y expone un endpoint compatible con OpenAI, lo que permite conectar clientes existentes sin adaptadores. Adecuado para prototipos y entornos de desarrollo con GPU AMD.
- Análisis de imágenes en local: al aceptar partes `image_url` con el proyector BF16, se puede usar para describir capturas, extraer texto de imágenes o responder preguntas sobre diagramas sin enviar datos a la nube.
- Agentes con tool calling: el soporte de `tools`/`tool_calls` y las puertas `agent`/`agent_think_off` lo orientan a flujos multi-paso donde el modelo invoca funciones externas (consultas a bases de datos, APIs internas) en varias iteraciones.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por petición, encaja en tareas de resumen o extracción sobre contratos, informes o expedientes extensos en una sola pasada.
- Evaluación de stacks alternativos a llama.cpp: las puertas de correctness (`golden`, `compare`, `logits`, `spec`) están diseñadas para verificar equivalencia token a token frente a la referencia de llama.cpp, útil para equipos que validan runtimes propios en AMD.
- Despliegue en estaciones de trabajo con Radeon AI PRO R9700: con 32 GB de VRAM, el GGUF Q4_K_M de 9B y el proyector BF16 caben holgadamente, permitiendo servir el modelo junto con 4 peticiones concurrentes.
- Experimentación con decodificación especulativa: al venir MTP activado por defecto con profundidad 3, sirve para medir el impacto de la decodificación especulativa en latencia sobre GPUs AMD sin configurar nada adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y todas las puertas de correctness figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El GGUF es Q4_K_M de un modelo de 9B, por lo que el peso de los pesos ronda los 5-6 GB, más el proyector `mmproj-BF16.gguf`; el paquete no publica cifras de memoria del pool.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs de consumo de NVIDIA ni para otras Radeon fuera de las dos plataformas indicadas.
- Despliegue: exclusivamente mediante el stack Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete; llama.cpp se usa únicamente como referencia de correctness.
- Opciones de ejecución relevantes: `--pool_backing=fixed` (pool de memoria fijo), `--parameter_mode=preload` (carga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, usada en las mediciones de la tarjeta).
- Latencia y throughput: no disponibles; las mediciones de rendimiento del paquete aún no se han repetido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| weareapexcreators-Qwen3.5-9B-MTP-LocalAI-loom (este paquete) | 9B | 262.144 tokens | Texto + imagen | Apache 2.0 | Paquete Loom sobre GGUF Q4_K_M; solo AMD Strix Halo y R9700 |
| weareapexcreators/Qwen3.5-9B-MTP-LocalAI (modelo base) | 9B | no disponible | Texto + imagen | Apache 2.0 | GGUF; sirve como referencia del paquete |
| Alternativas de 9B multimodales de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no registra descargas ni interacciones y fue creado el 2026-11-19; no hay evidencia de uso en producción.
- Todas las puertas de correctness (`golden`, `compare`, `vision`, `spec`, `agent`, etc.) figuran como "not yet re-measured": no hay verificación publicada de equivalencia frente a llama.cpp para este paquete concreto.
- Las mediciones de rendimiento frente a llama.cpp no se han repetido para ninguna de las dos GPUs objetivo.
- El soporte de hardware está limitado explícitamente a Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documentan otras GPUs.
- El despliegue depende del stack Loom (`hrx-loom 0.2.0`), lo que ata la operación a una herramienta concreta y a su versión.
- Capacidades no determinadas: entrada/salida de audio y comportamiento del muestreo (temperatura, top_k, semilla) no están confirmados en la model card.
- Idiomas soportados no disponibles: no se puede garantizar calidad en castellano ni en otros idiomas.
- Sesgos y riesgo de alucinación del modelo base: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias del stack Loom antes de desplegar.
- El límite de salida por defecto es de 4.096 tokens y la concurrencia de 4 peticiones; ambos pueden condicionar cargas de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/weareapexcreators-Qwen3.5-9B-MTP-LocalAI-loom
- Modelo base: https://huggingface.co/weareapexcreators/Qwen3.5-9B-MTP-LocalAI
- Stack Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
