# Neonkraft/oellm-9b-256k-theta64m-prelude-anneal300b-instruct-sft

## Resumen

OELLM 9B 256K SFT es un ajuste fino supervisado (SFT) de parámetros completos sobre el checkpoint base `birgermoell/oellm-9b-256k-theta64m-prelude-anneal300b`, de la familia OpenEuroLLM. Lo publica el usuario Neonkraft en HuggingFace y cuenta con 9.101.947.904 parámetros reales (18,2 GB de pesos en safetensors). El entrenamiento se realizó sobre las 2.152.112 conversaciones del split `train` de `allenai/Dolci-Instruct-SFT`, la misma mezcla instructiva que Ai2 empleó para el SFT de Olmo 3 7B Instruct, durante 2 épocas y con secuencias de hasta 32.768 tokens.

El modelo emplea el formato de conversación ChatML de Qwen3 y el tokenizador OpenEuroLLM de 256K entradas (rama `qwen3-tokens`), que renombra ocho IDs reservados para cubrir `<|im_start|>`, `<|im_end|>`, `<tools>`, `<tool_response>` y `<think>`. Se trata de un checkpoint experimental de investigación: solo ha recibido SFT, sin ajuste por preferencias ni aprendizaje por refuerzo, y no es un modelo de razonamiento (genera bloques `<think>` vacíos porque Dolci Instruct apenas contiene trazas de razonamiento: 385 de 2.152.112 conversaciones).

Su relevancia es doble. Por un lado, permite reproducir y estudiar la receta de SFT de Olmo 3 sobre una base europea abierta, con detalles completos de hiperparámetros, enmascarado de pérdida y estrategia de empaquetado. Por otro, documenta un entrenamiento íntegro sobre aceleradores AMD MI250X (32 GCDs en LUMI, ROCm 7.2.4), lo que lo convierte en una referencia útil para pipelines de post-entrenamiento en hardware no NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 (etiqueta `qwen3` del repositorio); número de capas, cabezas y tipo de atención: no disponible |
| Parámetros totales | 9.101.947.904 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no especificada en la información disponible. El SFT se entrenó con secuencias de hasta 32.768 tokens; el sufijo «256k» del nombre corresponde al tokenizador OpenEuroLLM de 256K entradas (ID de `<pad>` = 262.144) |
| Tipos de cuantización | no disponible; el repositorio solo contiene pesos safetensors en BF16 |
| Idiomas soportados | no disponible oficialmente; la model card indica que la mayor parte de los datos de entrenamiento es en inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |
| Tamaño del repositorio | 18,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-11 |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base OpenEuroLLM de 9B (etiquetado como `qwen3`) y adopta su plantilla conversacional: ChatML con `<|im_start|>`/`<|im_end|>`, tokens de herramienta (`<tool_call>` = 11, `</tool_call>` = 12, `<tools>` = 13, `</tools>` = 14, `<tool_response>` = 15, `</tool_response>` = 16) y bloque `<think>`/`</think>` en las posiciones 17 y 18. El tokenizador es `openeurollm/tokenizer-256k` en la rama `qwen3-tokens`; sobre una muestra de 3,9 millones de tokens de texto de Dolci, ambos tokenizadores produjeron IDs idénticos, lo que indica que el renombrado es semántico y no altera la segmentación. El modelo termina cada turno del asistente con `<|im_end|>` (ID 4), que es el token de parada real; `<eos>` (ID 2) no aparece en los datos de SFT.

El entrenamiento fue un SFT de parámetros completos con TRL `SFTTrainer`, 2 épocas, AdamW con β₁ = 0,9, β₂ = 0,95, ε = 1e-8, weight decay 0,0, learning rate máximo 8e-5 con warmup lineal del 3 % de los pasos y decaimiento lineal posterior, clipping de gradiente 1,0 y precisión BF16. Se usó DeepSpeed ZeRO etapa 2, gradient checkpointing no reentrante, kernels Liger, FlashAttention-2 y `torch.compile` (Inductor). El enmascarado de pérdida cubre únicamente los tokens del asistente posteriores al último mensaje de usuario (incluido su `<|im_end|>`), de modo que sistema, usuario, herramientas y turnos previos del asistente son solo contexto. Las conversaciones se empaquetaron con la estrategia best-fit-decreasing (BFD) de TRL en secuencias de hasta 32.768 tokens, una secuencia empaquetada por dispositivo y paso, con batch global de 32 secuencias (hasta 1.048.576 tokens por paso). Se completaron 2.774 pasos de optimizador sobre aproximadamente 2.800 millones de tokens. Las conversaciones sin ningún token supervisado del asistente en sus primeros 32.768 tokens se descartaron; si el límite cortaba un tramo supervisado, la conversación se conservaba truncada. Todo el cálculo se hizo en LUMI (CSC, Finlandia) con 4 nodos × 8 GCD AMD MI250X (32 GCDs), ROCm 7.2.4, PyTorch 2.9.1 y TRL 1.7.0, en 31 horas de reloj (unas 990 GCD-horas), con semilla 42.

## Capacidades

- Generación de texto y diálogo instructivo en inglés, con seguimiento de formato conversacional ChatML.
- Respuestas de un solo turno o multiturno con contexto largo: el entrenamiento empleó secuencias de hasta 32.768 tokens y el empaquetado BFD favorece ejemplos densos en tokens.
- Capacidad declarada de plantilla para herramientas: los tokens `<tool_call>`, `<tools>` y `<tool_response>` existen en el tokenizador y en la plantilla, pero no consta entrenamiento específico con RL ni preferencias para uso fiable de herramientas.
- Multilingüismo: no acreditado. La model card indica que la mayor parte del corpus de SFT es inglés.
- Modo de razonamiento: no. El modelo emite un bloque `<think>` vacío porque la plantilla lo inserta al inicio del turno final del asistente y Dolci Instruct casi no contiene trazas de razonamiento.
- Terminación controlada: `generation_config.json` declara `<|im_end|>` (4) y `<eos>` (2) como tokens de parada, por lo que `generate()` corta al final del turno del asistente.
- Capacidades de visión, audio o multimodalidad: no disponibles.
- Vocabulario de 256K entradas, con `<pad>` en 262.144 y `<bos>`/`<eos>` en 1/2.

## Casos de uso

- Reproducción de recetas de post-entrenamiento: sirve como punto de partida verificable para estudiar el efecto del enmascarado de pérdida, el empaquetado BFD y el número de épocas sobre la mezcla Dolci-Instruct-SFT, con todos los hiperparámetros publicados.
- Comparación de mezclas de datos instruct: al compartir dataset con Olmo 3 7B Instruct, permite aislar el efecto de la base preentrenada (OpenEuroLLM frente a Olmo) manteniendo constante el corpus de SFT.
- Asistente conversacional en inglés sobre documentos largos: la ventana de entrenamiento de 32.768 tokens permite resumir, extraer y responder preguntas sobre informes técnicos o contractuales sin troceado agresivo.
- Generación y revisión de documentación técnica: redacción de guías, docstrings y notas de versión en inglés, con la plantilla ChatML y parada limpia en `<|im_end|>`.
- Punto de partida para alineación posterior: al no haber recibido DPO ni RL, es un candidato natural para experimentos de preferencias o RLHF que midan la mejora respecto a un SFT puro.
- Investigación en eficiencia de entrenamiento en hardware AMD: el registro de la ejecución en LUMI con ROCm 7.2.4 y MI250X documenta 990 GCD-horas para 2.800 millones de tokens, útil como referencia de coste para planificar runs similares.
- Extracción estructurada y clasificación de texto: tareas de conversión de texto libre a JSON o campos definidos, aprovechando el formato de turnos y los tokens de herramienta ya presentes en el tokenizador.
- Base para evaluación de multilingüismo europeo: aunque el SFT es mayoritariamente inglés, su pertenencia a la iniciativa OpenEuroLLM lo hace útil para medir la degradación o transferencia de idioma tras un SFT monolingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en BF16: 18,2 GB, el tamaño real del repositorio. La inferencia en BF16 requiere al menos 24 GB de VRAM con contextos cortos (RTX 3090, RTX 4090, A10G de 24 GB), y 40-80 GB (A100 40/80 GB, H100) para lotes grandes o contextos cercanos a 32.768 tokens.
- Cuantización a 8 bits: aproximadamente 10 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantización a 4 bits: aproximadamente 5-6 GB de pesos, viable en GPUs de consumo de 8-12 GB. Estas cifras son estimaciones a partir del recuento de parámetros; no hay ficheros cuantizados publicados.
- Caché KV: no se puede estimar con precisión porque no se dispone del número de capas, cabezas ni de si se usa GQA.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` en `dtype=torch.bfloat16` y `device_map="auto"` es la vía documentada en la model card. vLLM o TGI serían compatibles previsiblemente por la arquitectura Qwen3, pero no hay confirmación en la información disponible. llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión que no se ha publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OELLM 9B 256K SFT (este modelo) | 9,10B | Entrenado a 32.768 tokens; contexto nominal no especificado | no disponible | Solo SFT, sin RLHF/DPO; checkpoint experimental; 0 descargas |
| Qwen3 8B Instruct | 8,2B | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | Modo thinking/no-thinking conmutable; soporte declarado de tool calling y agentes |
| Llama 3.1 8B Instruct | 8,03B | 128.000 tokens | Llama 3.1 Community License | Tool calling integrado; restricciones de licencia para ciertos usos y para entrenar modelos derivados |
| Olmo 3 7B Instruct | 7B | No disponible en la información proporcionada | No disponible en la información proporcionada | Referencia directa porque su mezcla de SFT (Dolci-Instruct-SFT) es la que usa este modelo |

La comparación de rendimiento no puede establecerse: no se han publicado benchmarks de este checkpoint y la model card no ofrece ninguna evaluación cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint experimental de investigación, sin ajuste por preferencias ni RL: cabe esperar menor robustez conversacional y mayor tendencia a respuestas desalineadas que un modelo instruct final.
- Riesgo de alucinación no cuantificado; no se ha publicado ninguna evaluación de fidelidad ni de tasas de error.
- No es un modelo de razonamiento. Genera bloques `<think>` vacíos por construcción de la plantilla, y solo 385 de las 2.152.112 conversaciones de Dolci contienen `</think>`. No debe esperarse cadena de pensamiento ni decodificación deliberativa.
- Idiomas: la mayor parte del corpus es inglés. No hay garantía de calidad en castellano ni en otras lenguas europeas, pese a la adscripción del modelo base a la iniciativa OpenEuroLLM.
- Uso de herramientas: los tokens existen en el tokenizador, pero al no haber entrenamiento específico (SFT de una sola pasada sobre Dolci), la fiabilidad de `<tool_call>` en producción no está verificada.
- Licencia no disponible: no se puede confirmar que el uso comercial esté permitido. El dataset Dolci-Instruct-SFT está bajo ODC-BY y sujeto a las Responsible Use Guidelines de Ai2, pero eso no determina la licencia de los pesos resultantes.
- La model card no publica la licencia del modelo base `birgermoell/oellm-9b-256k-theta64m-prelude-anneal300b`, lo que añade incertidumbre sobre la cadena de derechos.
- Discrepancia en la documentación: el ejemplo de código de la model card usa el identificador `Neonkraft/oellm-9b-256k-theta64m-prelude-anneal300b-sft`, que no coincide con el ID real del repositorio (`...-prelude-anneal300b-instruct-sft`). Hay que corregir la ruta antes de cargar el modelo.
- El token de parada correcto es `<|im_end|>` (4), no `<eos>` (2). Usar `<eos>` como única condición de parada puede producir generaciones que no terminen correctamente.
- Solo se distribuyen pesos en BF16 safetensors; no hay GGUF, AWQ, GPTQ ni versiones cuantizadas, lo que limita el despliegue en hardware de gama baja sin trabajo adicional de conversión.
- Repositorio sin descargas ni likes: no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Neonkraft/oellm-9b-256k-theta64m-prelude-anneal300b-instruct-sft
- Modelo base: https://huggingface.co/birgermoell/oellm-9b-256k-theta64m-prelude-anneal300b
- Dataset de SFT: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Tokenizador: https://huggingface.co/openeurollm/tokenizer-256k (rama `qwen3-tokens`)
- Código de post-entrenamiento: `OpenEuroLLM/post-training` (commit `b81119e`, referenciado en la model card)
- Responsible Use Guidelines de Ai2: https://allenai.org/responsible-use
- Referencia arXiv incluida en las etiquetas del repositorio: arXiv:2512.13961 (no verificada en la información disponible)
- Búsqueda web: los resultados devueltos no guardaban relación con el modelo (enlaces genéricos a YouTube), por lo que no se aportan enlaces adicionales.
