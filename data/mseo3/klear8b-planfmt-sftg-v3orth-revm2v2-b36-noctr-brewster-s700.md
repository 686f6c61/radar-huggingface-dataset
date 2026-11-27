# mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s700

## Resumen

El modelo `klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s700` es un ajuste fino supervisado (SFT) del modelo Klear-Reasoner-8B-SFT, desarrollado por el usuario mseo3. Se trata de un checkpoint intermedio (paso 700 de 1500) de un experimento de entrenamiento centrado en la incorporación de tokens de planificación (`<|plan|>` y `<|/plan|>`) y en el enmascaramiento de pasos fallidos durante el cálculo de la pérdida. El modelo base, Klear-Reasoner-8B-SFT, es un modelo de razonamiento de 8 mil millones de parámetros con arquitectura Qwen3.

La relevancia de esta ficha es principalmente experimental: se trata de un artefacto de investigación con fines de ablation (A/B testing) sobre recetas de ajuste fino, no un modelo orientado a producción. El checkpoint concreto corresponde a la variante en la que el término de contraste de planificación está desactivado (`plan_contrast_margin=0`), comparado con una ejecución gemela que lo mantiene activo. El entrenamiento se realizó sobre 4 GPUs H200 con FlashAttention 3, partiendo del modelo base y con un dataset privado de 27.773 filas revisadas.

Con 8.190.735.360 parámetros y un repositorio de 16,4 GB en safetensors, el modelo hereda la licencia Apache 2.0 del modelo base. No se dispone de información sobre idiomas soportados, pipeline de inferencia ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun tags) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo parte de Klear-Reasoner-8B-SFT, un modelo de razonamiento de 8B parámetros etiquetado con el tag `qwen3`, lo que sugiere una arquitectura transformer decoder-only de la familia Qwen3. El ajuste fino introduce dos tokens especiales de planificación, `<|plan|>` (ID 151669) y `<|/plan|>` (ID 151670), añadidos de forma no atada (*untied*) y con las filas correspondientes de `lm_head` reinicializadas de forma ortogonal a sus piezas de texto. Esto implica una modificación de la capa de salida para acomodar los nuevos tokens sin heredar representaciones sesgadas del vocabulario original.

El entrenamiento se realizó sobre 4 GPUs H200 con FlashAttention 3, con un batch global de 36, learning rate de 2e-5 con decaimiento coseno hasta 1e-5 durante 1500 pasos, warmup de 30 pasos y arranque desde cero desde el modelo base. El dataset es privado (`mseo3/klear8b-planfmt-revmask-sft`, revisión `5ef1de66`, subconjunto `data/rev_m2_v2`) con 27.773 filas revisadas, en las que los pasos fallidos se enmascaran del cálculo de la pérdida. La variante concreta de este checkpoint desactiva el término de contraste de planificación (`data.plan_contrast_margin=0`), lo que la convierte en el brazo de control de un experimento A/B con la misma semilla y las mismas filas. El optimizador se conserva solo en el guardado más reciente, podando los shards obsoletos antes de cada escritura (`SFT_PRUNE_OPT_BEFORE_SAVE=1`).

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Klear-Reasoner-8B-SFT, orientado a tareas de razonamiento.
- Planificación estructurada: incorpora tokens dedicados `<|plan|>` y `<|/plan|>` para delimitar bloques de planificación en la salida.
- Enmascaramiento de pasos fallidos: el entrenamiento se realizó con pérdida enmascarada en pasos fallidos, lo que puede influir en la robustez ante trayectorias incorrectas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; la presencia de tokens de planificación sugiere orientación a tareas multi-paso, pero no se documenta.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en recetas de SFT: el checkpoint sirve como brazo de control en experimentos A/B sobre el término de contraste de planificación, permitiendo comparar directamente con la variante que lo activa.
- Estudio de tokens especiales de planificación: útil para analizar cómo la adición de tokens `<|plan|>`/`<|/plan|>` con inicialización ortogonal afecta al comportamiento del modelo en tareas de planificación.
- Reproducción de experimentos de ajuste fino: al documentarse batch, learning rate, warmup, semilla y dataset, permite reproducir o extender la receta `sft_recipe_v3orth`.
- Evaluación de enmascaramiento de pérdida: permite medir el impacto de enmascarar pasos fallidos en la calidad final del modelo frente a entrenamientos sin enmascaramiento.
- Base para ajustes posteriores: al ser un checkpoint intermedio (paso 700 de 1500), puede usarse como punto de partida para continuar el entrenamiento o para experimentos de continuación.
- Análisis de estabilidad de entrenamiento: la poda de shards del optimizador y la fusión desde FSDP a bf16 documentan prácticas de gestión de checkpoints que pueden estudiarse para pipelines propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 24 GB para contexto moderado.
- Cuantización: no se proporcionan versiones cuantizadas (GGUF, AWQ, GPTQ) en el repositorio; sería necesario generarlas.
- GPU recomendadas: el entrenamiento se realizó en 4x H200; para inferencia, una A100 40/80 GB, H100 o RTX 4090 (24 GB) en bf16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto reducido, o en GPUs de 16 GB si se cuantiza a 8 bits (no disponible en el repo).
- Opciones de despliegue: vLLM, TGI o llama.cpp (previa conversión a GGUF); no se documenta compatibilidad explícita con Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s700 | 8,19B | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Klear-Reasoner-8B-SFT (modelo base) | ~8B | no disponible | no disponible | Hugging Face |
| Qwen3-8B (familia referenciada por tag) | ~8B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 700 de 1500, por lo que no representa el estado final del entrenamiento.
- Artefacto experimental: es un brazo de control de un experimento A/B, no un modelo validado para producción.
- Sin benchmarks: no hay evidencia publicada de rendimiento en tareas estándar.
- Dataset privado: el conjunto de entrenamiento no es público, lo que limita la reproducibilidad completa.
- Idiomas no documentados: se desconoce el soporte multilingüe real.
- Riesgo de alucinación: inherente a los modelos de razonamiento de esta escala; no se documentan mitigaciones específicas.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo hereda los del modelo base y del dataset de ajuste.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de un modelo base cuyas condiciones no se detallan, conviene verificar la licencia del modelo original.
- Sin versiones cuantizadas: el despliegue en hardware limitado requiere conversión manual.
- Cero descargas y likes: no hay validación comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s700
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Dataset referenciado (privado): mseo3/klear8b-planfmt-revmask-sft (revisión 5ef1de66)
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
