# Hooshaai/svd-linear-attention-gpt2-astro

## Resumen

El modelo `Hooshaai/svd-linear-attention-gpt2-astro` es un checkpoint de GPT-2 afinado para clasificación de texto (SST-2 del dataset GLUE), desarrollado por el laboratorio Hooshaai como parte de su SVD Linear Attention Framework. Su objetivo es explorar la sustitución de la atención cuadrática estándar por aproximaciones lineales de bajo rango calibradas mediante descomposición en valores singulares (SVD) y recuperadas con 50 pasos de fine-tuning LoRA. El resultado es un modelo de clasificación con un coste de VRAM muy bajo (412,45 MB pico) y una precisión de validación del 77,06% en SST-2.

Se trata de un modelo de investigación orientado a demostrar la viabilidad de técnicas de compresión y eficiencia de atención en arquitecturas Transformer. La arquitectura base es GPT-2, aunque no se especifica el número total de parámetros ni la longitud de contexto en la información disponible. El modelo está pensado para evaluar el comportamiento de la atención lineal en tareas de clasificación de texto en inglés, y su relevancia actual radica en el creciente interés por arquitecturas subcuadráticas que reduzcan el coste computacional de los Transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 con módulo de atención lineal SVD ("astro") |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | PyTorch (weights.pt) |

## Arquitectura y entrenamiento

El motor `astro` reemplaza la atención cuadrática estándar o las capas de proyección densas por aproximaciones lineales de bajo rango, calibradas mediante descomposición en valores singulares (SVD) y recuperadas con 50 pasos de fine-tuning LoRA. Esta técnica se enmarca en el SVD Linear Attention Framework, un Automated Benchmark Suite desarrollado por Hooshaai para evaluar métodos de atención eficiente. Según la documentación asociada, la atención lineal reduce la complejidad de O(N²) a O(N) mediante la sustitución de la operación softmax por mapas de características kernel, manteniendo la expresividad del Transformer con un coste computacional menor.

El modelo se entrena para clasificación de texto sobre el dataset GLUE, concretamente en la tarea SST-2 (análisis de sentimiento). No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni la presencia de técnicas de alineación como RLHF o DPO. El proceso de recuperación mediante LoRA sugiere que el checkpoint ha sido ajustado después de la compresión para restaurar parte del rendimiento perdido.

## Capacidades

- Clasificación de texto en inglés, afinado específicamente para la tarea SST-2 de GLUE (análisis de sentimiento).
- Atención lineal de bajo rango con complejidad O(N), lo que reduce el coste computacional en comparación con la atención estándar.
- Recuperación de rendimiento mediante fine-tuning LoRA, lo que permite ajustar el modelo comprimido con pocos recursos.
- Compatibilidad con la librería HuggingFace Transformers, tal como se muestra en el ejemplo de uso del autor.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-step: no documentado.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: compresión de atención mediante SVD; no se documentan capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Clasificación de sentimiento en inglés: el modelo puede etiquetar opiniones en textos cortos como positivas o negativas, con una precisión de validación del 77,06% en SST-2. Es adecuado para prototipos de análisis de sentimiento en redes sociales o reseñas de productos.
- Filtrado de comentarios en foros y comunidades online: gracias a su bajo consumo de VRAM (412 MB pico), puede desplegarse en entornos con recursos limitados para clasificar comentarios como apropiados o inapropiados.
- Investigación en eficiencia de atención: sirve como punto de partida para experimentos que comparen atención cuadrática versus atención lineal SVD en tareas de clasificación, especialmente para medir el impacto en precisión y coste.
- Evaluación de técnicas de compresión: permite analizar cómo la recuperación con LoRA tras una compresión SVD afecta al rendimiento, útil para estudios de compresión de modelos Transformer.
- Demostraciones educativas de arquitecturas eficientes: puede usarse en cursos o talleres para ilustrar cómo la atención lineal y la descomposición SVD reducen la complejidad computacional sin necesidad de hardware de gama alta.
- Benchmarking de modelos comprimidos: el checkpoint incluye métricas de evaluación (accuracy, F1, VRAM pico, tiempo de evaluación) que pueden servir como referencia en suites de pruebas automatizadas para modelos de clasificación eficientes.

## Benchmarks y rendimiento

Según la model card del autor, con `recovery_steps=50` se obtienen los siguientes resultados en la tarea SST-2:

| Métrica | Valor medido |
|---|---|
| Accuracy de validación | 77,06% |
| F1 Score | 0,8084 |
| Ratio de compresión | 1,0 |
| VRAM pico de GPU | 412,45 MB |
| Tiempo de evaluación puro | 18,17 s |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Tampoco se incluyen comparativas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: 412,45 MB pico según la evaluación del autor, lo que indica que el modelo cabe en prácticamente cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 512 MB de VRAM, por ejemplo RTX 3060, GTX 1650, o incluso GPUs integradas recientes. No se requiere hardware de gama alta.
- Compatibilidad con GPUs de consumo: sí, el modelo está diseñado para entornos con recursos limitados.
- Opciones de despliegue: HuggingFace Transformers, tal como se muestra en el ejemplo de uso del autor. No se documentan otros frameworks como vLLM, llama.cpp u Ollama.
- Latencia y throughput: el tiempo de evaluación puro reportado es de 18,17 s, pero no se especifica el tamaño del dataset evaluado, por lo que no es posible estimar latencia por muestra ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparativas con otros modelos de la misma categoría (por ejemplo, GPT-2 base u otros checkpoints comprimidos con atención lineal). No se dispone de datos de rendimiento de modelos alternativos para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Solo soporta inglés y únicamente la tarea de clasificación de texto (SST-2); no es un modelo multilingüe ni multimodal.
- El ratio de compresión reportado es 1,0, lo que significa que este checkpoint no presenta una reducción real del número de parámetros, aunque la técnica busca eficiencia computacional. Esto limita su utilidad como demostración de compresión efectiva.
- El rendimiento es modesto: 77,06% de accuracy en SST-2, por debajo de modelos más grandes o afinados con técnicas más avanzadas.
- No se documentan sesgos conocidos, pruebas de robustez ni evaluaciones de alucinación, por lo que su comportamiento en escenarios adversos es desconocido.
- Al ser un modelo de investigación, puede no estar optimizado para producción; la ausencia de documentación sobre latencia, throughput y estabilidad debe tenerse en cuenta antes de un despliegue real.
- La licencia MIT permite uso comercial, pero el autor no proporciona garantías de rendimiento ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-gpt2-astro
- Artículo sobre atención lineal: https://hooshaai.substack.com/p/scaling-transformers-how-linear-attention
- Sitio web de Hooshaai: https://hooshaai.github.io/
