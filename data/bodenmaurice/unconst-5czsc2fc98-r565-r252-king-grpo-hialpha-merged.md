# bodenmaurice/unconst-5czsc2fc98-r565-r252-king-grpo-hialpha-merged

## Resumen

El modelo `bodenmaurice/unconst-5czsc2fc98-r565-r252-king-grpo-hialpha-merged` es un ajuste fino experimental de 35 107 millones de parámetros, desarrollado por el usuario bodenmaurice sobre la base `unconst/Affine-5czsc2fc98-r252-merged`. Según las etiquetas de HuggingFace, emplea una arquitectura de mezcla de expertos (MoE) vinculada a la familia Qwen3.5, aunque no se proporcionan detalles estructurales adicionales. El entrenamiento se realizó mediante GRPO (Group Relative Policy Optimization) con una recompensa basada en el razonamiento del profesor (teacher-side Reason), optimizando específicamente para el conjunto de evaluación Reason v3.

Este modelo es relevante en el contexto de la investigación sobre optimización de razonamiento en modelos de lenguaje, ya que aplica una receta de entrenamiento ya probada (la «corona» R252) sobre pesos ya coronados, buscando mejorar la calidad de las cadenas de pensamiento sin recurrir a señales auxiliares como lpA o L1lift. Su licencia Apache 2.0 permite uso comercial y modificación, lo que lo hace atractivo para experimentación en entornos de producción, aunque su naturaleza experimental y la falta de documentación oficial limitan su adopción inmediata.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `qwen3_5_moe`), no confirmada oficialmente |
| Parametros totales | 35 107 181 936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (max_len de entrenamiento: 6144) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la model card. Las etiquetas indican `qwen3_5_moe`, lo que sugiere una variante de mezcla de expertos basada en la familia Qwen3.5, y `affine`, que podría referirse a capas de transformación afín o a un nombre de proyecto interno. El modelo es un ajuste fino (LoRA) del checkpoint `unconst/Affine-5czsc2fc98-r252-merged`, que a su vez es un merge de pesos previos.

El entrenamiento se realizó con GRPO, un método de optimización de políticas que utiliza rollouts en grupo para calcular ventajas relativas. La recompensa se basó en la diferencia de log-probabilidad del razonamiento del profesor (`lpC(y_C|z) - lpC(y_C|∅)`), es decir, se premiaba al modelo cuando su salida mejoraba la probabilidad de la respuesta correcta del profesor en comparación con una condición sin contexto. Los hiperparámetros principales fueron: tasa de aprendizaje 5e-6, rango LoRA 16 con alpha 128, tamaño de grupo 4, longitud máxima de secuencia 6144, temperatura 0.8 y un máximo de 200 pasos (detenido en 151). El entrenamiento se ejecutó en 8 GPU B300, utilizando solo dos de ellas (GPU 4 y 5).

No se mencionan datos de preentrenamiento ni composición del dataset; el proceso se describe como un ajuste fino de razonamiento sobre muestras de pensamientos ganadores de alta calidad (`winner_za_high_l1.jsonl`).

## Capacidades

- Razonamiento multi-step: el entrenamiento con GRPO sobre recompensas de razonamiento sugiere capacidad para generar cadenas de pensamiento estructuradas, aunque no hay benchmarks públicos que lo confirmen.
- Generación de texto: al ser un modelo de lenguaje basado en Qwen3.5, puede realizar tareas de generación de texto libre, aunque su especialización apunta al razonamiento.
- Optimización para Reason v3: el modelo está específicamente ajustado para el conjunto de evaluación Reason v3, lo que podría mejorar su rendimiento en tareas de razonamiento lógico y matemático frente a la base.
- Soporte de tool calling y agentes: no hay información disponible; la model card no menciona estas capacidades.
- Capacidades multilingües: no hay datos sobre idiomas soportados; se desconoce si el modelo mantiene el multilingüismo de la base Qwen.

## Casos de uso

- Investigación en razonamiento: el modelo puede utilizarse en laboratorios para estudiar el efecto de la optimización GRPO sobre la calidad de las cadenas de pensamiento, comparando con la base Affine-5czsc2fc98-r252-merged.
- Evaluación de métodos de recompensa: dado su entrenamiento con una recompensa específica (teacher-side Reason), es útil para validar métricas de razonamiento en entornos de investigación.
- Generación de explicaciones: puede emplearse para producir justificaciones detalladas en tareas de preguntas y respuestas, aunque su fiabilidad no está verificada.
- Prototipado de aplicaciones de razonamiento: para desarrolladores que quieran experimentar con modelos MoE de 35B bajo licencia Apache 2.0, este checkpoint ofrece una alternativa de código abierto.
- Análisis de robustez: al ser un modelo experimental, puede servir para probar técnicas de alineación o detección de alucinaciones en razonamiento.
- Fine-tuning posterior: su licencia permisiva permite usarlo como base para nuevos ajustes, aunque se recomienda partir del modelo base original si se requiere estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una «sim evidence» con n80 y una regla de decisión basada en margen pareado, pero no se proporcionan cifras concretas. No es posible comparar su rendimiento con otros modelos sin datos verificables.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16, un modelo de 35 107 millones de parámetros requiere aproximadamente 70 GB de VRAM. Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ), podría reducirse a unos 20-24 GB, pero no se ofrecen pesos cuantizados oficiales.
- GPU recomendadas: para FP16 se necesitan GPUs de clase A100 (80 GB), H100 (80 GB) o similares. Para cuantización, una RTX 4090 (24 GB) podría ser suficiente si se aplica cuantización externa.
- Despliegue: al estar en formato safetensors, es compatible con frameworks como vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay integración confirmada con Ollama.
- Latencia y throughput: no hay datos publicados; dependerá del hardware y del número de expertos activos (desconocido).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo pertenece a una familia interna de experimentos (Affine) sin referencias públicas a modelos comparables de la misma categoría. Se recomienda consultar la página de HuggingFace para ver los fine-tunes derivados de la misma base, pero no hay datos de rendimiento que permitan una comparación objetiva.

## Limitaciones y advertencias

- Modelo experimental: está diseñado para investigación; no hay garantías de estabilidad ni de calidad de salida en producción.
- Sin documentación de sesgos: no se han publicado análisis de sesgos ni de alucinaciones; el riesgo de generar contenido incorrecto o tendencioso es alto.
- Longitud de contexto limitada: el entrenamiento usó max_len 6144, por lo que el contexto efectivo puede ser menor que el de la base Qwen3.5 (que típicamente soporta 32k o más).
- Idiomas desconocidos: no se especifican idiomas soportados; es probable que el multilingüismo de la base se mantenga, pero no está confirmado.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado de un modelo base con la misma licencia, se deben cumplir los términos de atribución.
- Riesgo de sobreajuste: el entrenamiento con un conjunto de datos muy específico (pensamientos ganadores de alta recompensa) puede reducir la generalización a otras tareas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bodenmaurice/unconst-5czsc2fc98-r565-r252-king-grpo-hialpha-merged
- Búsqueda de fine-tunes de la base: https://huggingface.co/models?other=base_model:finetune:unconst/Affine-5czsc2fc98-r252-merged
- Base del modelo: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged (no se proporciona URL directa, solo referencia en la model card)
