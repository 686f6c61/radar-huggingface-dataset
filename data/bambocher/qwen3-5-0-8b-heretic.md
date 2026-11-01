# bambocher/Qwen3.5-0.8B-heretic

## Resumen

Qwen3.5-0.8B-heretic es una variante "abliterada" (decensored) del modelo Qwen3.5-0.8B-Base de Alibaba Qwen, generada por el usuario bambocher mediante la herramienta Heretic v1.4.0. El proceso de abliteración elimina o atenúa la dirección de activación asociada al rechazo de peticiones, de modo que el modelo deja de responder con negativas ante contenido que el modelo original filtraría. Según la model card, los rechazos caen de 97/100 en el original a 2/100 en esta variante, con una divergencia KL de 0.0506 respecto al modelo base.

El modelo subyacente es un transformer causal multimodal (image-text-to-text) de 852.985.920 parámetros (aproximadamente 0,8B), con una arquitectura híbrida que combina Gated DeltaNet (atención lineal) y Gated Attention clásica, más un codificador de visión. Dispone de una longitud de contexto nativa de 262.144 tokens y está entrenado sobre 201 idiomas y dialectos. Su escala lo sitúa en el segmento de prototipado, fine-tuning específico de tarea e investigación.

La relevancia de esta ficha radica en que combina dos tendencias actuales: por un lado, los modelos pequeños multimodales con contexto muy largo y arquitecturas híbridas eficientes; por otro, la creciente comunidad de variantes sin censura orientadas a investigación sobre alineamiento, seguridad y comportamiento de modelos. Es importante subrayar que la abliteración no elimina sesgos ni alucinaciones, y que el uso comercial queda sujeto a la licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido (Gated DeltaNet + Gated Attention) con codificador de visión |
| Parametros totales | 852.985.920 (≈0,8B) |
| Parametros activos | no disponible (no se especifica configuración MoE para esta variante de 0,8B) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | no disponible en la información proporcionada (repo en safetensors; compatible con vLLM, SGLang, KTransformers) |
| Idiomas soportados | 201 idiomas y dialectos (según model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida: 24 capas organizadas en 6 bloques de la forma 3 × (Gated DeltaNet → FFN) seguidos de 1 × (Gated Attention → FFN). La dimensión oculta es 1024, con embedding de tokens de 248.320 (con padding) y salida LM atada al embedding. Gated DeltaNet usa 16 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; Gated Attention usa 8 cabezas para Q y 2 para KV con dimensión de cabeza 256 y RoPE de dimensión 64. La FFN tiene dimensión intermedia 3584. Incluye un codificador de visión y entrenamiento con multi-token prediction (MTP) en varios pasos.

El entrenamiento del modelo base combina pre-entrenamiento y post-entrenamiento, con fusión temprana de tokens multimodales y escalado de reinforcement learning sobre entornos multiagente. La variante heretic no reentrena el modelo: aplica abliteración sobre las proyecciones `attn.o_proj` y `mlp.down_proj` con los parámetros documentados (direction_index 13.86, max_weight 1.35 en atención, 1.06 en MLP, etc.), lo que produce un desplazamiento controlado de activaciones para suprimir la conducta de rechazo manteniendo baja divergencia KL (0.0506). El proceso es reproducible según el autor.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 262.144 tokens).
- Comprensión de imagen y texto (pipeline image-text-to-text), incluyendo razonamiento visual.
- Razonamiento, código y matemáticas, heredados del modelo base Qwen3.5-0.8B.
- Capacidades de agente y razonamiento multi-paso, reforzadas en el entrenamiento del modelo base mediante RL a escala.
- Soporte multilingüe amplio: 201 idiomas y dialectos.
- Modo de pensamiento (thinking / non-thinking) según la tabla de benchmarks del modelo base.
- Comportamiento "decensored": reducción drástica de rechazos (2/100 frente a 97/100 del original).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible para esta variante, aunque el modelo base está orientado a agentes.

## Casos de uso

- Investigación sobre alineamiento y seguridad: comparar el comportamiento del modelo abliterado frente al original en conjuntos de prompts sensibles, midiendo tasas de rechazo y divergencia de respuestas para estudiar mecanismos de seguridad en LLM pequeños.
- Prototipado de asistentes conversacionales de contexto largo: usar la ventana de 262.144 tokens para resumir documentos extensos o mantener conversaciones con historial amplio en entornos de desarrollo.
- Procesamiento de documentos con imagen y texto: extraer información de capturas, formularios o diagramas combinando el codificador de visión con el LM en pipelines de digitalización.
- Fine-tuning específico de tarea: al ser un modelo de 0,8B con licencia Apache 2.0, sirve como base económica para ajuste supervisado en dominios verticales (legal, sanitario, atención al cliente) con requisitos de hardware modestos.
- Experimentación con arquitecturas híbridas: evaluar el rendimiento de Gated DeltaNet frente a atención clásica en tareas de razonamiento y recuperación de contexto largo, como banco de pruebas académico.
- Generación de contenido multilingüe: aprovechar la cobertura de 201 idiomas para traducción, paráfrasis o generación en idiomas de bajos recursos en fase de prototipo.
- Evaluación de robustez y jailbreaks: emplear la variante como sujeto de prueba en estudios de red teaming, dado su bajo índice de rechazos.

## Benchmarks y rendimiento

Resultados publicados en la model card (modelo base Qwen3.5-0.8B frente a modelos de la familia; modo non-thinking):

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |

Métricas específicas de la abliteración (variante heretic frente al original):

| Métrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0,0506 | 0 (por definición) |
| Rechazos | 2/100 | 97/100 |

El resto de resultados de benchmarks del modelo base (código, matemáticas, visión, agentes) no están completos en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 1,7 GB de pesos más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 0,9-1,0 GB; en 4 bits, alrededor de 0,5-0,6 GB (estimaciones basadas en el tamaño del repo de 1,7 GB, no cifras oficiales).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) puede alojar el modelo en FP16 con margen amplio; en entornos de servidor, A100, H100 o L40S para despliegues concurrentes.
- Cabe en GPU consumer: sí, incluso en GPUs de gama media con 6-8 GB de VRAM en cuantizaciones de 8 o 4 bits.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, KTransformers (según la model card del modelo base); llama.cpp/Ollama no están confirmados explícitamente para esta arquitectura híbrida.
- Latencia y throughput: no disponible en la información proporcionada. La arquitectura híbrida con Gated DeltaNet está diseñada para reducir el coste de atención en contextos largos, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-heretic (este) | 0,85B | 262.144 | Sí (imagen-texto) | Apache 2.0 | Variante abliterada, rechazos 2/100 |
| Qwen3.5-0.8B (original) | 0,8B | 262.144 | Sí | Apache 2.0 | Rechazos 97/100, MMLU-Pro 29,7 |
| Qwen3.5-2B | ≈2B | no disponible | Sí | Apache 2.0 | MMLU-Pro 55,3, mayor capacidad |
| Qwen3-1.7B | 1,7B | no disponible | no disponible | Apache 2.0 | MMLU-Pro 40,2, generación anterior |
| Qwen3-4B-2507 | 4B | no disponible | no disponible | Apache 2.0 | MMLU-Pro 69,6, referencia de la familia |

La comparativa se limita a la familia Qwen porque la información proporcionada no incluye datos de modelos de otros fabricantes con arquitectura híbrida comparable en este rango de tamaño.

## Limitaciones y advertencias

- La abliteración suprime la conducta de rechazo pero no elimina sesgos de entrenamiento ni conocimiento defectuoso; el modelo puede generar contenido sesgado, ofensivo o inexacto con mayor facilidad que el original.
- Riesgo elevado de alucinación: con 0,8B de parámetros y MMLU-Pro de 29,7, la fiabilidad factual es limitada; no apto para producción sin verificación externa.
- La reducción de rechazos (2/100) implica que el modelo puede producir contenido dañino, ilegal o no seguro; requiere salvaguardas externas si se despliega en aplicaciones de cara al usuario.
- La ventana de 262.144 tokens es nominal; el rendimiento efectivo en contextos muy largos puede degradarse y no se han publicado evaluaciones específicas de "needle in a haystack" para esta variante.
- La cobertura de 201 idiomas corresponde al modelo base; no hay evaluación independiente del efecto de la abliteración sobre el rendimiento multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal y ética del contenido generado; conviene revisar los términos del modelo base Qwen.
- No hay métricas publicadas de latencia, throughput ni consumo de VRAM para esta variante concreta; las estimaciones de hardware son aproximadas.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni auditoría externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Modelo original post-entrenado: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
