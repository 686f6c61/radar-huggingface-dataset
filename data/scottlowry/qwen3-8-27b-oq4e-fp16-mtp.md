# scottlowry/Qwen3.8-27B-oQ4e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ4e-fp16-mtp es una cuantización mixta del modelo Qwen/Qwen3.8-27B, publicada por el usuario scottlowry. No se trata de un modelo entrenado desde cero, sino de una redistribución de pesos del modelo base de Qwen en formato MLX, pensada para su ejecución en hardware Apple Silicon mediante la librería MLX. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.4.dev1), que aplica precisión mixta por tensor en lugar de una cuantización uniforme.

El checkpoint ocupa 18,5 GB en el repositorio y almacena 27.781 millones de parámetros con un promedio efectivo de 5,310 bits por peso. La distribución es heterogénea: el 69,8 % de los pesos queda en 4 bits, el 23,7 % en 5 bits, el 4,6 % en 6 bits y un pequeño resto en 8 bits, FP16 y FP32. Esta estrategia busca preservar la calidad en las capas más sensibles (atención, proyecciones críticas) mientras reduce el peso de las capas tolerantes a cuantización agresiva.

El modelo base incluye componentes de lenguaje (26.896B), visión (0.461B) y una cabeza MTP (Multi-Token Prediction, 0.425B) de 0.425B parámetros, lo que sugiere capacidades multimodales y decodificación especulativa. La ficha se limita a los datos disponibles en la información proporcionada; los detalles de entrenamiento, licencia e idiomas del modelo base no están publicados en esta página.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), con cabeza MTP y módulo de visión; detalles no disponibles |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta afín por grupo de 64: 4-bit (69,807 %), 5-bit (23,680 %), 6-bit (4,615 %), 8-bit (0,041 %), FP16 (0,198 %), FP32 (1,658 %); promedio 5,310 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (librería `mlx`), cuantización `oq` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Qwen3.8-27B más allá de su nombre y tamaño. El checkpoint cuantizado revela tres componentes diferenciados: un modelo de lenguaje de 26.896B parámetros, un módulo de visión de 0.461B parámetros y una cabeza MTP de 0.425B parámetros. La presencia de una cabeza MTP es indicativa de entrenamiento con predicción multi-token, técnica habitualmente asociada a decodificación especulativa para acelerar la generación.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones de atención del modelo base. La única información técnica verificable es la relativa al proceso de cuantización: oQ (oMLX v0.7.4.dev1) aplica precisión mixta asignando 4, 5, 6 u 8 bits por tensor según su sensibilidad, con grupos de 64 pesos y almacenamiento afín. El checkpoint se actualizó el 2026-11-11 con una recuantización; el autor recomienda volver a descargarlo si se tenía una copia anterior.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.8-27B; el nivel concreto no está documentado en esta página.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0.461B parámetros (1.716 GiB en FP32), lo que indica soporte de entrada de imágenes.
- Predicción multi-token: la cabeza MTP de 0.425B parámetros habilita potencialmente decodificación especulativa, aunque no se documenta su integración en el runtime.
- Ejecución en Apple Silicon: formato MLX nativo, optimizado para GPUs unificadas de la familia M.
- Tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 18,5 GB cabe en equipos Apple Silicon con 32 GB o más de memoria unificada, lo que permite ejecutar un modelo de 27,8B en local sin GPU dedicada. Adecuado para desarrolladores que trabajan en portátiles o estaciones Mac y necesitan privacidad de datos.
- Prototipado de aplicaciones multimodales: al incluir módulo de visión, permite experimentar con pipelines imagen-texto en local antes de migrar a infraestructura cloud, reduciendo costes de iteración.
- Evaluación de cuantización mixta: útil para investigadores que comparan la degradación de calidad de oQ frente a cuantizaciones uniformes de 4 bits, dado que el checkpoint expone la distribución exacta de bits por tensor.
- Aceleración mediante MTP: si el runtime MLX explota la cabeza MTP, puede emplearse en escenarios de generación interactiva donde la latencia por token es crítica, como asistentes de escritura o autocompletado.
- Desarrollo de herramientas CLI con MLX: integrable en scripts Python que usen `mlx-lm` para tareas de resumen, extracción de información o clasificación sobre documentos, aprovechando el contexto del modelo base (longitud no confirmada).
- Investigación sobre decodificación especulativa: la separación explícita de la cabeza MTP permite estudiar el impacto de esta técnica en throughput y calidad sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el checkpoint ocupa 17,172 GiB (18,439 GB) en almacenamiento; en ejecución se requiere memoria adicional para el KV cache y buffers, por lo que se recomienda un mínimo de 24 GB de memoria unificada y 32 GB para contexto largo.
- GPU compatibles: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No es compatible de forma nativa con CUDA sin conversión previa.
- Consumer GPU: no aplica directamente; en el ecosistema Apple, un Mac con 32 GB unificados es el mínimo práctico. Un Mac Studio con 64 GB o más permite mayor contexto y lote.
- Despliegue: librería `mlx` (Apple), con `mlx-lm` como runtime habitual. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ4e-fp16-mtp (este) | 27,781B | no disponible | Mixta 4/5/6/8-bit + FP16/FP32 (5,310 bits/peso) | no disponible | MLX safetensors |
| Qwen/Qwen3.8-27B (base) | 27,781B | no disponible | FP16/BF16 original | no disponible | safetensors |
| Cuantizaciones GGUF de Qwen3.8-27B | 27,781B | no disponible | Q4_K_M, Q5_K_M, etc. | no disponible | GGUF |

La comparativa se limita al modelo base y a formatos alternativos del mismo modelo, ya que no se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización mixta introduce degradación de calidad respecto al modelo base en FP16; el grado concreto no está medido en la información disponible.
- El 1,658 % de los pesos en FP32 (0.461B parámetros, 1.716 GiB) corresponde probablemente al módulo de visión, lo que incrementa el tamaño del checkpoint frente a una cuantización uniforme.
- Solo es ejecutable de forma nativa en el ecosistema MLX (Apple Silicon); requiere conversión para CUDA u otros backends.
- Licencia no declarada en la página del repositorio; debe consultarse la licencia del modelo base Qwen/Qwen3.8-27B antes de cualquier uso comercial.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe sin evaluación previa.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala; no hay evaluación publicada específica para este checkpoint.
- El autor actualizó el checkpoint el 2026-11-11; versiones anteriores pueden presentar diferencias de calidad.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-27B-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
