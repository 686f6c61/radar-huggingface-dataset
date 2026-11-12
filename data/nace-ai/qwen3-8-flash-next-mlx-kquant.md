# nace-ai/Qwen3.8-Flash-Next-MLX-KQuant

## Resumen

Qwen3.8-Flash-Next-MLX-KQuant es una cuantización de 4 bits en formato MLX del modelo multimodal Qwen3.8-Flash-Next, publicada por Nace.AI (usuario `nace-ai`). El modelo base lo desarrolla el equipo Qwen de Alibaba y está pensado para tareas de imagen-a-texto y conversación multimodal. Esta versión concreta aplica la técnica propietaria KQuant de Nace.AI para reducir el peso del modelo manteniendo mayor fidelidad respecto al original en BF16 que otras cuantizaciones de 4 bits disponibles públicamente.

El modelo cuenta con aproximadamente 180.000 millones de parámetros (179.999.981.459 según los safetensors), lo que lo sitúa en la gama alta de modelos abiertos. El repositorio ocupa 179,1 GB, aunque el payload del modelo de lenguaje en esta cuantización es de 105,20 GB. Está diseñado específicamente para ejecutarse en Apple Silicon mediante el motor Kapitsa de Nace.AI, que expone APIs compatibles con OpenAI, Anthropic y Ollama.

La relevancia de esta ficha radica en que demuestra que es posible ejecutar localmente un modelo de 180B multimodal en hardware de consumo Apple con una pérdida de calidad medible y documentada (KL de 0,067 frente a BF16, aproximadamente 3,7 veces más cercano que la cuantización de 4 bits de mlx-community). Es una opción a considerar para investigadores y desarrolladores que necesiten privacidad total y no dependan de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); arquitectura interna no detallada en la información disponible |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (KQuant Q4); existen variantes plain 4-bit y oQ4e-mtp de otros autores |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia "other" con nombre qwen-community-1.0) |
| Formato de pesos | safetensors en formato MLX |
| Libreria | mlx |
| Tamano del repositorio | 179,1 GB |
| Payload del modelo de lenguaje | 105,20 GB (base-LM, excluye MTP, drafter y vision) |
| Pipeline | image-text-to-text |
| Fecha de creacion | 2026-11-11 |
| Ultima actualizacion | 2026-11-12 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-Flash-Next más allá de que se trata de un transformer multimodal capaz de procesar imagen y texto. Los tags del repositorio incluyen `qwen4_exp`, lo que sugiere una variante experimental de la familia Qwen. El modelo incorpora un modo de razonamiento (thinking) activado por defecto, con profundidades configurables (`low`, `medium`, `xhigh`) y la posibilidad de desactivarlo mediante `reasoning_effort: none` o `enable_thinking: false`.

La contribución técnica de esta publicación es la cuantización KQuant de 4 bits, que según las mediciones del autor alcanza una divergencia KL de 0,0666 frente al modelo BF16 en corpus originales (WikiText-2, GSM8K, HumanEval) y 0,0713 en corpus frescos (UltraChat test_sft y Schema-Guided Dialogue). Esto la sitúa como la opción más cercana al original entre las cuantizaciones públicas comparadas, superando ligeramente a Jundot oQ4e-mtp (KL 0,0648 en original, 0,0714 en fresh) en el corpus original pero con un payload ligeramente menor. No se dispone de información sobre el dataset de entrenamiento del modelo base, número de tokens ni si se aplicó RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto, con profundidades ajustables (`low`, `medium`, `xhigh`).
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que permite entrada multimodal.
- Tool calling / function calling con definiciones compatibles con la API de OpenAI, incluyendo ida y vuelta completa con el SDK oficial.
- Razonamiento multi-paso y uso como agente, facilitado por el modo thinking y el soporte de herramientas.
- Capacidades multilingües: no especificadas en la información disponible; el autor advierte que valores altos de `presence_penalty` pueden mezclar idiomas.
- Generación de código y matemáticas (evaluado indirectamente en los corpus de medición HumanEval y GSM8K).
- Salida de razonamiento separada en el campo `reasoning_content` cuando el thinking está activo.
- Soporte de hasta 32.768 tokens de salida para la mayoría de tareas con thinking activado.

## Casos de uso

- Asistente local con privacidad total: desplegado con Kapitsa en un Mac con suficiente memoria unificada, permite conversaciones multimodales sin enviar datos a la nube, adecuado para entornos con requisitos de confidencialidad.
- Automatización de atención al cliente multimodal: el modelo puede recibir capturas de pantalla o imágenes junto con texto y responder en conversaciones multi-turno, con tool calling para consultar sistemas internos (pedidos, stock, estado de envío).
- Análisis de documentos e imágenes técnicas: gracias al pipeline image-text-to-text, puede extraer información de diagramas, facturas o capturas y combinarla con razonamiento para generar resúmenes o informes.
- Generación de código asistida con herramientas: integrado vía API compatible con OpenAI, puede conectarse a un IDE o pipeline de CI/CD para sugerir parches, ejecutar tests mediante function calling y razonar sobre errores.
- Agentes autónomos multi-paso: con thinking activado y tool calling, puede planificar y ejecutar tareas que requieran varias llamadas a herramientas (búsqueda, cálculo, consulta de APIs) antes de dar una respuesta final.
- Evaluación e investigación de cuantizaciones: el repositorio incluye `results.json` con mediciones KL reproducibles, útil para investigadores que comparen técnicas de cuantización (KQuant, plain 4-bit, oQ4e-mtp) sobre el mismo modelo base.
- Prototipado de asistentes de voz o chat en local: al exponer APIs compatibles con OpenAI, Anthropic y Ollama, se integra fácilmente en frontends existentes sin reescribir la capa de cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica mediciones de divergencia KL frente al modelo BF16, que miden fidelidad de la cuantización, no calidad de tarea:

| Pack | Base-LM (GB) | KL original | KL fresh |
|---|---:|---:|---:|
| nace-ai KQuant (este repo) | 105,204 | 0,06660683 | 0,07132136 |
| nace-ai plain 4-bit (Kapitsa default) | 103,424 | 0,14110035 | 0,14112859 |
| Jundot oQ4e-mtp | 105,259 | 0,06475066 | 0,07135602 |
| mlx-community 4-bit | no disponible en el extracto | no disponible | no disponible |

Metodología: 32.704 posiciones de siguiente token por corpus, evaluadas offline con mlx-vlm 0.7.8 contra BF16. Corpus originales: WikiText-2, GSM8K y HumanEval. Corpus frescos: UltraChat test_sft y Schema-Guided Dialogue test. El autor indica explícitamente que KL no es precisión de tarea ni velocidad.

## Requisitos de hardware

- VRAM/memoria unificada: el payload del modelo de lenguaje es de 105,20 GB; el repositorio completo ocupa 179,1 GB (incluye MTP, drafter y visión). Se necesita un Mac con al menos ~110-120 GB de memoria unificada disponible para cargar el modelo de lenguaje, y más para el conjunto completo.
- GPU recomendadas: Apple Silicon de gama alta (Mac Studio o MacBook Pro con memoria unificada de 128 GB o superior). El autor menciona que la revisión anterior se ejecutó en Kapitsa y que esta se verificó con mlx-vlm sobre CUDA, pero no detalla GPUs NVIDIA concretas.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, etc.) por el tamaño del payload.
- Opciones de despliegue: Kapitsa (motor oficial de Nace.AI para Qwen en Mac, con APIs OpenAI, Anthropic y Ollama), mlx-vlm (verificado en CUDA), mlx-lm 0.32.2 no puede cargar esta arquitectura todavía.
- Latencia y throughput: no disponibles en la información proporcionada.
- Ajustes recomendados: thinking con temperature 1.0, top_p 0.95, top_k 20, min_p 0.0, presence_penalty 0.0; sin thinking con temperature 0.7, top_p 0.8, top_k 20, presence_penalty 1.5; repetition_penalty siempre 1.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL vs BF16 (original) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| nace-ai KQuant (este) | ~180B | no disponible | 4-bit KQuant | 0,0666 | qwen-community-1.0 | Hugging Face, MLX |
| nace-ai plain 4-bit | ~180B | no disponible | 4-bit | 0,1411 | qwen-community-1.0 | Hugging Face, MLX |
| Jundot oQ4e-mtp | ~180B | no disponible | 4-bit oQ4e | 0,0648 | no disponible | Hugging Face, MLX |
| mlx-community 4-bit | ~180B | no disponible | 4-bit | no disponible en el extracto | no disponible | Hugging Face, MLX |

Los cuatro son cuantizaciones del mismo modelo base Qwen3.8-Flash-Next, por lo que la comparación relevante es la fidelidad de cuantización y el tamaño del payload. KQuant ofrece un equilibrio entre KL y tamaño (105,20 GB) frente a plain 4-bit (103,42 GB, peor KL) y Jundot oQ4e-mtp (105,26 GB, KL ligeramente mejor en corpus original pero prácticamente idéntico en fresh).

## Limitaciones y advertencias

- Licencia qwen-community-1.0: es una licencia "other" que conviene revisar antes de uso comercial; no se detallan aquí sus restricciones.
- Fidelidad de cuantización: aunque KQuant es la opción más cercana al BF16 entre las comparadas, sigue habiendo una divergencia KL de ~0,067; tareas sensibles a la precisión pueden degradarse.
- Compatibilidad limitada: mlx-lm 0.32.2 no puede cargar esta arquitectura; el autor solo ha probado Kapitsa (revisión anterior) y mlx-vlm sobre CUDA, sin verificar otras apps MLX.
- Riesgo de alucinación: inherente a los modelos de lenguaje de gran tamaño; el modo thinking puede mitigarlo parcialmente pero no lo elimina.
- Mezcla de idiomas: el autor advierte que valores altos de `presence_penalty` pueden provocar mezcla de idiomas; los idiomas soportados no están documentados.
- Repetición: requiere ajustar `presence_penalty` (entre 0 y 2) para evitar bucles de repetición; `repetition_penalty` debe mantenerse en 1.0.
- Requisitos de hardware muy altos: 179,1 GB de repositorio y ~105 GB de payload del LM limitan su uso a equipos Apple Silicon de gama alta o servidores con suficiente memoria.
- Sesgos: no documentados en la información disponible; se heredan del modelo base Qwen3.8-Flash-Next.
- Contexto: la longitud de contexto no está especificada, lo que impide planificar cargas de trabajo que dependan de ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Mejores prácticas del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next#best-practices
- Cuantización plain 4-bit de nace-ai: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-4bit
- Cuantización oQ4e-mtp de Jundot: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Cuantización de mlx-community: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Web de Nace.AI: https://www.nace.ai/
- Mediciones en bruto: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-Q4-KQuant/blob/main/results.json
