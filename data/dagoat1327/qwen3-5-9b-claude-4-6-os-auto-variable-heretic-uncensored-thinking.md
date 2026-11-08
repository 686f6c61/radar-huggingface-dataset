# dagoat1327/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING

## Resumen

Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING es un ajuste fino (fine-tune) del modelo denso Qwen3.5-9B, publicado por el usuario dagoat1327 en Hugging Face. El modelo parte de trohrbaugh/Qwen3.5-9B-heretic-v2, una variante ya "abliterated" (con los mecanismos de rechazo atenuados) del Qwen3.5-9B de Alibaba, y se entrena mediante Unsloth sobre una mezcla de cuatro conjuntos de datos etiquetados como "Claude-4.6-OS". El resultado es un modelo de 9.409.813.744 parámetros orientado a escritura creativa, ficción, roleplay y generación de tramas, con capacidades multimodales imagen-texto heredadas del modelo base.

La propuesta del autor es doble: por un lado, mejorar el razonamiento y la generación respecto al modelo raíz (afirma que supera al Qwen3.5-9B original en todos los benchmarks que reporta); por otro, eliminar los rechazos, de modo que el modelo responda a peticiones que un modelo alineado declinaría. El autor reporta una divergencia KL de 0,0793 frente al modelo original y una reducción de rechazos de 100/100 a 6/100 en su propia evaluación interna.

Es relevante ahora porque combina tres tendencias del ecosistema abierto: los fine-tunes "uncensored" para escritura y rol, el uso de Unsloth para entrenamiento eficiente en hardware local, y la integración multimodal en modelos de ~9B que caben en GPU de consumo. La licencia declarada es Apache 2.0, aunque conviene revisar las implicaciones de los pesos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), multimodal imagen-texto con fusión temprana segun la model card del modelo base |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256k (por defecto, segun el autor) |
| Tipos de cuantizacion | bfloat16 en el repo; el autor sugiere mínimo q4_k_s (sin imatrix) o IQ3S (con imatrix); existen variantes GGUF de terceros (X8b, MAX) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 9,4 mil millones de parámetros, derivado de la familia Qwen3.5. Según la información del modelo base incluida en la model card, Qwen3.5 introduce una "unified vision-language foundation" con entrenamiento de fusión temprana sobre tokens multimodales, alcanzando paridad con Qwen3 y superando a Qw (texto truncado en la fuente). El pipeline declarado es image-text-to-text, por lo que el modelo conserva capacidad de procesar imágenes además de texto. El autor indica que la visión fue probada y funciona tras el ajuste, pero que las porciones de vídeo no se probaron.

El ajuste fino se realizó con Unsloth sobre hardware local, partiendo de trohrbaugh/Qwen3.5-9B-heretic-v2 (ya "heretic" y abliterated) y entrenando sobre cuatro conjuntos de datos "Claude-4.6-OS". El autor describe el entrenamiento como "mild" para no degradar los benchmarks del modelo base. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; esos datos no están disponibles. La innovación técnica destacable es el proceso de "de-censoring" previo (herencia del base) más el ajuste posterior, con una divergencia KL reportada de 0,0793 respecto al original.

## Capacidades

- Generación de texto y escritura creativa: ficción, relatos, novelas, poesía y prosa "vivid".
- Generación de tramas y subtramas, continuación de escenas y construcción de historias en todos los géneros (ciencia ficción, romance, terror, etc.).
- Roleplay y conversación multi-turno con contexto largo.
- Razonamiento y generación de salida mejorados respecto al modelo raíz, según el autor.
- Capacidad multimodal imagen-texto (visión probada tras el ajuste; vídeo no probado).
- Modo "thinking" implícito en el nombre del modelo; no se detalla su funcionamiento en la información disponible.
- Multilingüe limitado a inglés y chino.
- Sin rechazos ante contenido sensible (modelo "uncensored"/abliterated); el autor advierte que en algunos casos necesita directrices explícitas para alcanzar el nivel de explicitud o lenguaje soez deseado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Escritura de ficción y novelas: el modelo está entrenado específicamente para generación de prosa vívida, tramas y subtramas, por lo que puede usarse como asistente de escritura para borradores de capítulos, desarrollo de personajes y continuaciones de escena con coherencia narrativa.
- Roleplay y juegos de rol de texto: gracias a su contexto de 256k tokens y a la ausencia de rechazos, es adecuado para sesiones largas con historial extenso, personajes persistentes y contenido adulto o explícito cuando se le dirige con las directrices adecuadas.
- Generación de guiones y contenido para videojuegos narrativos: puede producir diálogos ramificados, descripciones de escenas y tramas secundarias para motores de aventura conversacional.
- Creación de corpus para pruebas de robustez y red-teaming: al no rechazar peticiones, sirve para generar contenido ofensivo controlado y medir el comportamiento de filtros y clasificadores de seguridad en pipelines propios.
- Prototipado de asistentes creativos multimodales: al aceptar entrada de imagen y texto, puede describir ilustraciones, generar escenas a partir de una imagen de referencia o continuar una historia basada en un boceto.
- Investigación sobre alineación y censura: su divergencia KL reportada (0,0793) y la reducción de rechazos lo convierten en un objeto de estudio para analizar qué se pierde y qué se gana al eliminar los mecanismos de rechazo.
- Generación de contenido en inglés y chino: útil para proyectos bilingües de narrativa o localización creativa entre ambos idiomas.

## Benchmarks y rendimiento

El autor publica comparativas propias en mxfp8 frente al Qwen3.5-9B original:

| Benchmark | Este modelo (mxfp8) | Qwen3.5-9B (mxfp8) |
|---|---|---|
| ARC | 0,425 | 0,417 |
| ARC/e | 0,521 | 0,458 |
| BoolQ | 0,791 | 0,623 |
| HellaSwag | 0,664 | 0,634 |
| OpenBookQA | 0,374 | 0,338 |
| PIQA | 0,744 | 0,737 |
| Winogrande | 0,645 | 0,639 |

Métricas de de-censoring reportadas por el autor:

| Métrica | Este modelo | Qwen/Qwen3.5-9B |
|---|---|---|
| Divergencia KL | 0,0793 | 0 (por definición) |
| Rechazos | 6/100 | 100/100 |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible. Los datos anteriores proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más para contexto moderado.
- VRAM estimada en cuantización q4_k_s: en torno a 5-6 GB de pesos, viable en GPU de 8-12 GB con contexto reducido.
- VRAM estimada en IQ3S: aproximadamente 4-5 GB de pesos, apta para GPU de consumo de gama media.
- GPU recomendadas: A100 40/80 GB o H100 para bfloat16 con contexto largo; RTX 4090 (24 GB) para bfloat16 con contexto moderado; RTX 3090, 4080 o 4070 Ti para cuantizaciones q4/q5.
- Cabe en GPU de consumo: sí, en cuantizaciones q4_k_s o IQ3S en tarjetas de 8 GB o más, y en bfloat16 en tarjetas de 24 GB.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (según la model card del base); llama.cpp, KoboldCpp, text-generation-webui y Silly Tavern para GGUF (el autor indica usar llama_HF en text-generation-webui con GGUF); Ollama y TGI no se mencionan explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.
- Ajustes de inferencia recomendados por el autor: smoothing_factor de 1,5 o rep pen de 1,1 a 1,15; rep pen de 1 (desactivado) en las pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Qwen3.5-9B-Claude-4.6-OS-HERETIC) | 9,4B | 256k | Apache 2.0 | Fine-tune uncensored orientado a ficción y rol; multimodal |
| Qwen/Qwen3.5-9B | 9,4B (aprox.) | no disponible en la información | no disponible en la información | Modelo base oficial, alineado y con rechazos (100/100 según el autor) |
| trohrbaugh/Qwen3.5-9B-heretic-v2 | no disponible | no disponible | no disponible | Modelo base directo, ya abliterated, sin el ajuste Claude-4.6-OS |
| DavidAU/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-X8b | no disponible | no disponible | no disponible | Variante GGUF de terceros del mismo linaje, publicada por DavidAU |

No se dispone de datos suficientes para comparar rendimiento con alternativas de otros linajes (por ejemplo, Llama o Mistral de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored" y abliterated: no aplica filtros de seguridad ni rechaza contenido sensible, lo que implica riesgos legales y éticos si se despliega sin moderación externa.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; en tareas de razonamiento o datos concretos puede inventar información.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- El autor advierte que, pese a no rechazar, el modelo puede producir contenido "bland" si no se le dan directrices explícitas (palabras concretas, nivel de explicitud), lo que exige prompts más elaborados.
- La model card indica que las porciones de vídeo no se probaron; la visión funciona pero su robustez no está caracterizada.
- Los benchmarks son autoinformados por el autor, con una única configuración (mxfp8) y sin verificación independiente; no hay datos de MMLU, HumanEval ni GSM8K.
- La licencia declarada es Apache 2.0, pero al derivar de un modelo base de Qwen y de un fine-tune intermedio, conviene verificar las condiciones de los linajes anteriores antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El nombre del modelo incluye referencias a "Claude-4.6-OS" que no implican afiliación con Anthropic; es una etiqueta del dataset de entrenamiento.
- Uso responsable: no debe emplearse para generar desinformación, acoso, contenido ilegal o material que vulnere derechos de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dagoat1327/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Modelo base: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante GGUF de terceros (DavidAU, X8b): https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-X8b
- Variante MAX-NEOCODE (abliteratedmodels.org): https://abliteratedmodels.org/qwen3.5-9b-claude-4.6-os-auto-variable-heretic-uncensored-thinking-max-neocode/
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Colección de ficheros fuente para GGUF/EXL2/AWQ/GPTQ/HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Qwen Chat: https://chat.qwen.ai
