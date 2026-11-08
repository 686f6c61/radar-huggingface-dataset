# Demondiablo/Qwen3-4B-Instruct-2507-AWQ-4bit

## Resumen

Qwen3-4B-Instruct-2507-AWQ-4bit es una cuantización de 4 bits mediante AWQ (Activation-aware Weight Quantization) del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado originalmente por el equipo Qwen de Alibaba. Esta versión la publica el usuario Demondiablo en Hugging Face y su objetivo es reducir el peso del modelo de los aproximadamente 8 GB en bfloat16 a 2,67 GB, permitiendo su despliegue en GPUs de consumo con un consumo estimado de VRAM de en torno a 3,5 GB.

El modelo base es un transformer decoder-only de tipo `Qwen3ForCausalLM` con 4.022.468.096 parámetros, 36 capas, tamaño oculto de 2560, 32 cabezas de atención y 8 cabezas KV (GQA), con una longitud de contexto declarada de 262.144 tokens y un vocabulario de 151.936 tokens. La variante 2507 del modelo base corresponde a la generación "Instruct" no thinking de la familia Qwen3.

Su relevancia práctica es que permite ejecutar un modelo de 4B con contexto largo en hardware modesto (tarjetas de 8 GB o incluso menos con margen), manteniendo el pipeline `text-generation` y compatibilidad con vLLM y transformers. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque esta ficha debe considerarse una cuantización de terceros y no una publicación oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen3ForCausalLM`) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | AWQ 4-bit, group size 128, zero-point asimétrico, kernel gemm |
| Idiomas soportados | en (declarado en la model card; el modelo base Qwen3 es multilingüe, pero esta ficha solo declara inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 2,67 GB) |

Otros datos técnicos del `config.json`: hidden size 2560, 36 capas, 32 cabezas de atención, 8 cabezas KV, vocab size 151.936, dtype base bfloat16, `tie_word_embeddings: true`.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de la familia Qwen3, con atención multi-cabeza con grouped-query attention (32 cabezas de consulta y 8 de clave/valor), 36 capas y un tamaño oculto de 2560. El modelo base Qwen3-4B-Instruct-2507 es la variante "Instruct" de la generación 2507, orientada a instrucciones y sin modo thinking explícito, según la información disponible.

Sobre el entrenamiento del modelo base no se proporcionan en la información disponible detalles de número de tokens, composición del dataset ni si hubo RLHF/DPO; la model card de esta cuantización no los reproduce. La innovación técnica de esta publicación es exclusivamente la cuantización AWQ de 4 bits con group size 128 y zero-point asimétrico, que reduce el peso a 2,67 GB y está pensada para inferencia rápida en GPUs de consumo. No se documentan en la información disponible técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno mediante chat template (`apply_chat_template`).
- Razonamiento e instrucciones generales, al ser una variante Instruct del modelo base.
- Generación de código y matemáticas: capacidad heredada del modelo base Qwen3, aunque no se aportan benchmarks en esta ficha.
- Soporte de contexto largo: hasta 262.144 tokens declarados en la configuración.
- Compatibilidad con tool calling / function calling: no documentado explícitamente en la información disponible; debe verificarse contra la model card del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: la model card solo declara `en`; el modelo base Qwen3 es multilingüe, pero esta cuantización no lo declara.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en esta variante.

## Casos de uso

- Asistente conversacional local en GPU de consumo: con ~3,5 GB de VRAM estimada, el modelo puede ejecutarse en tarjetas de 8 GB (RTX 3060, RTX 4060, RTX 3070) dejando margen para el contexto y el runtime. Adecuado para prototipos de chatbot en escritorio.
- Procesamiento de documentos largos: los 262.144 tokens de contexto permiten resumir o extraer información de contratos, informes o código extenso en una sola pasada, siempre que la VRAM y el backend lo soporten.
- Generación de código en pipelines de desarrollo: al ser un modelo Instruct de 4B, puede integrarse como asistente de autocompletado o revisión en entornos con recursos limitados, usando vLLM con API compatible con OpenAI.
- Despliegue en servidores modestos con vLLM: el comando `vllm serve ... --quantization awq` permite servir el modelo con API OpenAI-compatible, útil para equipos que quieren un endpoint interno sin GPUs de datacenter.
- Clasificación y extracción de información: tareas de etiquetado, resumen y extracción estructurada en lotes, donde el bajo peso del modelo permite mayor paralelismo por GPU.
- Educación e investigación: reproducir experimentos con un modelo de 4B cuantizado en una sola GPU, comparando el efecto de AWQ frente al modelo en bfloat16.
- Prototipado de agentes con contexto largo: aunque el soporte de tool calling no está documentado en esta ficha, el contexto de 262k tokens permite mantener historiales largos de conversación y documentos de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,5 GB según la model card (peso de 2,67 GB más overhead de activaciones y KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 8 GB, RTX 3070 8 GB, RTX 4090 24 GB, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más; con 4 GB el margen es muy ajustado y el contexto práctico queda limitado.
- Opciones de despliegue: vLLM con `--quantization awq` (recomendado por el autor), transformers con soporte AWQ (`pip install awq` o `llm-awq`), y TGI por los tags del repositorio. No se documenta soporte GGUF ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Demondiablo/Qwen3-4B-Instruct-2507-AWQ-4bit | 4,02B | 262.144 | AWQ 4-bit | Apache 2.0 | Esta ficha; ~3,5 GB VRAM estimada |
| warshanks/Qwen3-4B-Instruct-2507-AWQ | 4B (base) | no disponible en la busqueda | AWQ | Apache 2.0 (heredada) | Cuantizacion alternativa del mismo modelo base |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | 262.144 (según config del base) | bfloat16 | Apache 2.0 | Modelo original sin cuantizar; mayor VRAM |

No se dispone de datos de rendimiento comparativo (benchmarks) en la información proporcionada para establecer diferencias de calidad entre estas variantes.

## Limitaciones y advertencias

- Es una cuantización de terceros (usuario Demondiablo), no una publicación oficial de Qwen; la calidad puede diferir de la del modelo base en bfloat16.
- La cuantización AWQ de 4 bits puede degradar ligeramente el rendimiento en tareas sensibles a precisión (matemáticas, código complejo), aunque no se aportan mediciones.
- La model card declara únicamente inglés (`en`); el comportamiento multilingüe no está garantizado en esta variante.
- Riesgo de alucinación inherente a los modelos de 4B; no se documentan evaluaciones de fidelidad.
- Sesgos conocidos: no documentados en la información disponible; deben asumirse los del modelo base.
- El contexto de 262.144 tokens es teórico; en la práctica, la KV cache limita el contexto utilizable según la VRAM disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser una cuantización conviene verificar la model card del modelo base y atribuir correctamente.
- Requiere soporte AWQ en el runtime (`pip install awq` o `llm-awq`); no funciona con backends sin kernels AWQ.
- El repositorio tiene muy pocas descargas (32) y 0 likes en el momento de la consulta; no hay validación comunitaria extensa.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/Demondiablo/Qwen3-4B-Instruct-2507-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Cuantización AWQ alternativa: https://huggingface.co/warshanks/Qwen3-4B-Instruct-2507-AWQ
