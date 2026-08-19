# reaperdoesntknow/MoA-150M

## Resumen

MoA-Metric-LM-150M (también referido como MoA-150M) es un modelo de lenguaje causal de aproximadamente 150 millones de parámetros desarrollado por el usuario reaperdoesntknow. Su principal innovación consiste en sustituir la atención por producto punto clásica por una atención basada en métricas de distancia (L2, coseno y Mahalanobis diagonal), lo que permite un control geométrico directo sobre las relaciones entre tokens. Además, incorpora BlackHoleRoPE, una variante aprendible y estable de codificación posicional rotatoria, y una arquitectura MoA (Mixture-of-Architectures) que combina cuatro tipos de capas mediante un router token-wise.

El modelo está diseñado para entrenar y ejecutarse en hardware modesto, con especial énfasis en CPU (AVX2/AVX-512) y precisión FP32, aunque también admite inferencia en BF16 y FP16. Su entrenamiento se realizó con un presupuesto de tokens relativamente bajo (cientos de miles) sobre varios conjuntos de datos públicos, incluyendo Alpaca-CoT, MATH-500 y LongWriter-6k, entre otros. La relevancia actual del modelo radica en su propuesta de atención basada en distancias como alternativa a la atención por producto punto, abriendo vías de investigación sobre sesgos geométricos e inductivos en modelos de lenguaje compactos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoA (Mixture-of-Architectures) con atención métrica (L2, coseno, Mahalanobis diagonal) y BlackHoleRoPE |
| Parametros totales | ~150 M (depende del vocabulario, ver config.json) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Entrenado en 512–1024 tokens; config permite hasta 2048 |
| Tipos de cuantizacion | FP32 (entrenamiento e inferencia), BF16, FP16 (inferencia) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | No especificado en la model card (probablemente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

La arquitectura MoA se compone de bloques que mezclan cuatro tipos de capas mediante un router token-wise: LocalConv (convolución depthwise local), MetricMHAttention (atención multi-cabeza basada en métricas), ChannelMix (MLP) y MetricMQA (atención multi-query con K/V compartidos). La atención métrica calcula puntuaciones usando distancias L2, coseno o Mahalanobis diagonal, con un factor de escala aprendible α y un mecanismo de poda por radio para eficiencia. La ruta de valores emplea proyecciones Up/Down con puertas. BlackHoleRoPE aplica rotaciones de módulo unitario a Q/K (preservando normas) y amplificación de energía acotada a V, con parámetros sintetizados desde una base de Fourier para mejorar la extrapolación de longitud.

El entrenamiento se realizó en CPU con FP32, usando los datasets WeMake/Intelligent-Content-Understanding, QingyiSi/Alpaca-CoT, HuggingFaceH4/MATH-500, zai-org/LongWriter-6k y m-a-p/DeepWriting-20K, con un presupuesto total de cientos de miles de tokens. Se aplicó un ajuste fino supervisado (SFT) con el dataset prithivMLmods/Deepthink-Reasoning, alcanzando una pérdida final de 0.3200. Se empleó el optimizador AdamW con coseno o warmup lineal, y se incluyó un regularizador de desigualdad triangular (TI) para evitar geometrías degeneradas en las cabezas métricas. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto causal estándar con pipeline de transformers.
- Razonamiento matemático paso a paso, especialmente en problemas aritméticos y algebraicos simples (ej. resolver ecuaciones lineales).
- Lectura y comprensión de contextos de hasta 2048 tokens, con énfasis en 512–1024.
- Soporte para tareas conversacionales básicas y asistentes compactos.
- Capacidad de investigación en atención basada en distancias y sesgos geométricos.
- Inferencia en CPU sin GPU, con FP32, BF16 o FP16.
- No se menciona soporte explícito para tool calling, agentes, visión, audio ni capacidades multilingües (solo inglés).

## Casos de uso

- Asistentes conversacionales ligeros en entornos sin GPU: el modelo puede ejecutarse en CPU con FP32, lo que lo hace adecuado para prototipos o aplicaciones embebidas donde no se dispone de aceleración por hardware.
- Razonamiento matemático educativo: dado su entrenamiento en MATH-500 y Alpaca-CoT, puede utilizarse para generar explicaciones paso a paso en problemas de álgebra y aritmética básica.
- Lectura de documentos largos con presupuesto de contexto moderado: con hasta 2048 tokens, puede procesar artículos, informes o correos extensos para tareas de resumen o QA.
- Experimentación académica en arquitecturas de atención alternativas: investigadores pueden estudiar el comportamiento de la atención métrica y BlackHoleRoPE en un modelo pequeño y reproducible.
- Prototipado rápido de pipelines de generación de texto: gracias a su compatibilidad con la librería transformers, se integra fácilmente en entornos de desarrollo existentes.
- Enseñanza de conceptos de NLP y arquitecturas de modelos: su tamaño compacto y su diseño modular permiten analizar internamente el router, las cabezas métricas y el efecto del regularizador TI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no reporta métricas estándar como MMLU, HumanEval o GSM8K. Los únicos datos de rendimiento mencionados son las pérdidas de entrenamiento (final 0.3200 en SFT), pero no se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- CPU con soporte AVX2 o AVX-512 recomendada para un rendimiento óptimo en FP32.
- No requiere GPU; puede ejecutarse íntegramente en CPU.
- Si se usa GPU, el modelo en FP32 ocupa aproximadamente 600 MB de VRAM (150M parámetros × 4 bytes), por lo que cabe en cualquier GPU con al menos 1 GB de VRAM (ej. GTX 1050, RTX 3050, etc.).
- En BF16 o FP16, el uso de VRAM se reduce a ~300 MB.
- Opciones de despliegue: transformers (AutoModelForCausalLM), pipeline de HuggingFace. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. El modelo no se ha evaluado frente a alternativas como GPT-2 small (124M), TinyLlama (1.1B) u otros modelos compactos, por lo que no es posible establecer una comparativa cuantitativa fiable. Se recomienda consultar la documentación del autor para futuras actualizaciones.

## Limitaciones y advertencias

- El modelo no está diseñado para uso crítico de seguridad ni para tareas que requieran precisión garantizada (según la model card).
- Puede alucinar hechos, especialmente en preguntas factuales de gran escala, dado su pequeño tamaño y presupuesto de entrenamiento limitado.
- Contexto máximo de 2048 tokens; el rendimiento más allá de 1024 tokens puede degradarse, aunque BlackHoleRoPE permite cierta extrapolación.
- Solo soporta inglés; no se ha entrenado en otros idiomas.
- El entrenamiento con un presupuesto de tokens muy bajo (cientos de miles) puede limitar la calidad general del modelo en tareas complejas.
- Se advierte sobre posibles problemas de estabilidad numérica durante el muestreo (NaN/Inf) si las máscaras no se configuran correctamente (aditivas 0/-inf).
- No se han publicado benchmarks ni evaluaciones independientes que validen su rendimiento en tareas estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/MoA-150M
- No se proporcionan otros enlaces (papers, blogs, repositorios) en la información disponible.
