# 360ZhiNao/Light-IF-14B

## Resumen

Light-IF-14B es un modelo de lenguaje de 14.768 millones de parámetros desarrollado por 360ZhiNao (Qihoo 360), obtenido mediante fine-tuning del modelo base Qwen/Qwen3-14B. Su propósito específico es el seguimiento preciso de instrucciones complejas, especialmente en chino, un ámbito donde los modelos generalistas suelen fallar al acumular múltiples restricciones simultáneas (formato, longitud, estructura, número de elementos). El modelo se distribuye bajo licencia Apache 2.0 y formato safetensors, con soporte para transformers y text-generation-inference.

La relevancia del modelo radica en su estrategia de entrenamiento: un currículum de dificultad creciente durante el SFT seguido de dos fases de reinforcement learning con instrucciones cada vez más complejas. Según la model card, Light-IF-14B supera a su hermano mayor Light-IF-32B y alcanza SOTA en la evaluación SuperCLUE-CPIF (Chinese Precise Instruction Following), por delante de ERNIE-X1.1 y DeepSeek-V3.2-Exp-Thinking. En los benchmarks publicados por el autor obtiene 0.589 en SuperCLUE, 0.962 en IFEval, 0.833 en CFBench y 0.697 en IFBench.

El modelo conserva el modo thinking de Qwen3 (bloques `...`), lo que permite razonamiento explícito antes de la respuesta final. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni los idiomas soportados más allá del chino e inglés implícitos en los benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-14B) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-14B, no confirmada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible (evaluado principalmente en chino e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Light-IF-14B es un fine-tuning del transformer decoder-only Qwen3-14B. No se introducen cambios arquitectónicos propios: el modelo hereda la pila de atención y el tokenizador del base, incluyendo el modo thinking con tokens especiales (`enable_thinking=True` y el token de cierre `</think>` con id 151668). El tamaño del repositorio es de 29,5 GB, coherente con pesos en precisión de 16 bits.

El entrenamiento se articula en tres fases según la model card: una fase de SFT con dificultad de instrucción creciente, seguida de dos etapas de reinforcement learning en las que se introducen instrucciones aún más complejas. Esta combinación de currículum learning y RL por etapas es la innovación técnica destacada por el autor, y explica que el modelo de 14B supere al de 32B de la misma familia. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se empleó RLHF, DPO u otra variante de optimización de preferencias.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat (chat template de Qwen3).
- Seguimiento preciso de instrucciones con múltiples restricciones simultáneas: formato, longitud, número de secciones, estructura de títulos, límites de caracteres y líneas.
- Modo thinking: razonamiento explícito previo a la respuesta, activable mediante `enable_thinking=True`.
- Razonamiento y matemáticas (capacidades heredadas de Qwen3-14B, no evaluadas de forma específica en la información disponible).
- Generación de código (heredada del base, no evaluada en los benchmarks publicados).
- Capacidades multilingües: no confirmadas oficialmente; los benchmarks publicados son en chino (SuperCLUE, CFBench) e inglés (IFEval, IFBench).
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente, aunque el modo thinking facilita cadenas de razonamiento.

## Casos de uso

- Generación de contenido con formato estricto: el modelo puede producir textos que respeten simultáneamente número de secciones, longitud por sección, límite total de caracteres y estructura de títulos, como demuestra el ejemplo de la model card (guía de viaje con 8 temas, 20 líneas y menos de 300 caracteres).
- Automatización de respuestas estructuradas en chino: atención al cliente o asistentes que deban devolver información en plantillas fijas (JSON, listas numeradas, campos obligatorios) sin desviarse de las restricciones.
- Generación de informes y resúmenes con cuotas: boletines, fichas de producto o resúmenes ejecutivos donde se exija un número exacto de viñetas, párrafos o palabras.
- Evaluación y benchmarking interno de instruction following: útil como modelo de referencia para comparar la calidad de otros modelos en tareas de restricciones múltiples.
- Pipelines de post-procesado de datos: generación de datasets sintéticos que deban cumplir esquemas estrictos de formato y longitud.
- Asistentes conversacionales con modo thinking: cuando se requiere trazabilidad del razonamiento (por ejemplo, en entornos educativos o de auditoría) antes de emitir la respuesta final.
- Integración en text-generation-inference: el modelo está etiquetado como `text-generation-inference` y `endpoints_compatible`, lo que facilita su despliegue en infraestructuras de inferencia estándar.

## Benchmarks y rendimiento

Resultados publicados en la model card (el autor no especifica la versión exacta de cada benchmark):

| Modelo | SuperClue | IFEval | CFBench | IFBench |
|---|---|---|---|---|
| Qwen3-14B | 0.227 | 0.898 | 0.827 | 0.422 |
| Qwen3-32B | 0.234 | 0.877 | 0.823 | 0.384 |
| Qwen3-235B-A22B | 0.244 | 0.882 | 0.834 | 0.423 |
| Qwen3-235B-A22B-Thinking-2507 | 0.434 | 0.916 | 0.843 | 0.475 |
| DeepSeek-R1-0528 | 0.436 | 0.863 | 0.827 | 0.415 |
| Doubao-seed-1-6-thinking-250615 | 0.362 | 0.832 | 0.820 | 0.477 |
| Doubao-seed-1-6-thinking-250715 | 0.345 | 0.856 | 0.840 | 0.366 |
| ChatGPT-4o-latest | 0.260 | 0.836 | 0.807 | 0.365 |
| Deepseek-v3-250324 | 0.306 | 0.859 | 0.833 | 0.405 |
| Doubao-1.5-pro-32k-250115 | 0.285 | 0.889 | 0.797 | 0.375 |
| Kimi-K2 | 0.227 | 0.921 | 0.820 | 0.395 |
| GLM-4.5 | 0.395 | 0.893 | 0.833 | 0.466 |
| Light-IF-14B | 0.589 | 0.962 | 0.833 | 0.697 |

Además, el autor indica que en SuperCLUE-CPIF (Chinese Precise Instruction Following) el modelo alcanza SOTA doméstico, superando a ERNIE-X1.1 y DeepSeek-V3.2-Exp-Thinking, aunque no se aportan las puntuaciones numéricas de esa comparación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 29,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 32-40 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 15-16 GB; en 4 bits, alrededor de 8-9 GB (estimaciones a partir del recuento de parámetros; el autor no publica cuantizaciones oficiales).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para FP16; una RTX 4090 (24 GB) no cabe en FP16, pero podría alojar cuantizaciones de 8 o 4 bits.
- Cabe en GPU consumer: sí, únicamente con cuantización agresiva (4-8 bits) en GPUs de 16-24 GB.
- Opciones de despliegue: transformers (snippet oficial), text-generation-inference (etiqueta oficial); llama.cpp/Ollama no están confirmados por el autor al no publicarse GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SuperClue | IFEval | IFBench | Licencia |
|---|---|---|---|---|---|---|
| Light-IF-14B | 14,8B | no disponible | 0.589 | 0.962 | 0.697 | Apache 2.0 |
| Qwen3-14B (base) | 14,8B | no disponible | 0.227 | 0.898 | 0.422 | Apache 2.0 |
| Light-IF-32B (misma familia) | 32B (no confirmado) | no disponible | no disponible | no disponible | no disponible | Apache 2.0 |
| GLM-4.5 | no disponible | no disponible | 0.395 | 0.893 | 0.466 | no disponible |

La comparación directa con Qwen3-14B muestra una mejora sustancial en SuperClue (0.227 a 0.589), IFEval (0.898 a 0.962) e IFBench (0.422 a 0.697), manteniendo CFBench casi idéntico (0.827 a 0.833). El autor afirma que supera a Light-IF-32B, pero no se publican las métricas de ese modelo en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3-14B, puede heredar sesgos del corpus de entrenamiento del base.
- Riesgo de alucinación: no evaluado específicamente; el foco del modelo es el formato y las restricciones, no la veracidad factual.
- Limitaciones de contexto e idioma: la longitud de contexto no se confirma en la información disponible; los benchmarks son mayoritariamente en chino e inglés, sin datos sobre otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-14B y de los datasets de entrenamiento, no detallados.
- Caveats para producción: el modelo está optimizado para instruction following con restricciones, no para tareas de conocimiento general; el modo thinking incrementa el consumo de tokens y la latencia; el ejemplo de la model card emplea `max_new_tokens=32768`, lo que requiere planificación de recursos.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card referencia el modelo de 32B en el snippet de código (`qihoo360/Light-IF-14B` frente a `qihoo360/Light-IF-32B`), lo que conviene verificar antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/Light-IF-14B
- Modelo de referencia de la familia: https://huggingface.co/qihoo360/Light-IF-32B
- Paper: https://arxiv.org/abs/2508.03178
- Blog (Zhihu): https://zhuanlan.zhihu.com/p/1936535948360918628
- Repositorio GitHub: https://github.com/Qihoo360/Light-IF
- Artículo sobre SuperCLUE-CPIF: https://mp.weixin.qq.com/s/pcBrykyK99dfWA5WSqj1jw
