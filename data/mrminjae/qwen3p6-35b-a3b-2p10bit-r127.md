# mrminjae/qwen3p6-35b-a3b-2p10bit-r127

## Resumen

Qwen3.6-35B-A3B (r127) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, consistente en una cuantización selectiva del modelo base Qwen/Qwen3.6-35B-A3B de Alibaba Qwen. La particularidad del artefacto es que solo los expertos enrutados del modelo MoE se almacenan con una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) permanecen en BF16. Los pesos se guardan ya dequantizados en tensores BF16, de modo que el modelo carga con `transformers` o vLLM estándar sin necesidad de kernels de cuantización específicos.

El modelo base es un transformer de tipo Mixture-of-Experts con arquitectura `qwen3_5_moe`, orientado a generación de texto y a tareas image-text-to-text según los tags del repositorio. El checkpoint cuenta con 67.319.436.656 parámetros reales en safetensors y ocupa 134,7 GB en el repositorio, lo que refleja el almacenamiento en BF16 tras la dequantización.

Su relevancia es acotada: se trata de un experimento interno de compresión extrema (2,10 bits en los expertos) cuyo objetivo es explorar los límites de la cuantización en modelos MoE sin perder la compatibilidad con el stack estándar de inferencia. No es un modelo listo para producción ni un lanzamiento oficial de Qwen; la model card es mínima y no aporta datos de entrenamiento, evaluación ni licencia explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (`qwen3_5_moe`) |
| Parametros totales | 67.319.436.656 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Sujeta a la del modelo base Qwen/Qwen3.6-35B-A3B (no especificada en la model card) |
| Formato de pesos | safetensors (BF16 dequantizado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura Mixture-of-Experts: cada token activa un subconjunto de expertos enrutados por un router, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño total. Sobre esa base, este checkpoint aplica una compresión selectiva: únicamente las matrices de los expertos enrutados se reducen a una media de 2,10 bits, mientras que el resto de componentes (atención, embeddings, router y capas no expertas) se conservan en BF16. Los pesos resultantes se almacenan ya dequantizados en BF16, de manera que la inferencia no requiere kernels de cuantización de bajo bit ni pasos de dequantización en tiempo de ejecución.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) ni sobre el procedimiento exacto de cuantización empleado para generar este checkpoint (algoritmo, calibración, granularidad por grupo). La model card solo indica el identificador interno `r127` y que la licencia sigue la del modelo base.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y el tag `conversational`.
- Procesamiento image-text-to-text, según los tags del repositorio; no se detalla el alcance multimodal en la model card.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere despliegue vía Inference Endpoints de Hugging Face.
- Carga directa con `transformers` y vLLM estándar, sin kernels de cuantización adicionales.
- Soporte de tool calling, agentes, multi-step reasoning, thinking mode, audio o capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre cuantización extrema en MoE: el checkpoint permite medir el impacto de reducir los expertos a 2,10 bits manteniendo el resto en BF16, comparando la perplejidad y la calidad de generación frente al modelo base sin cuantizar.
- Evaluación de la degradación por experto: al conservar el router y la atención en BF16, se puede aislar el efecto de la compresión exclusivamente en las capas expertas y estudiar qué expertos concentran la pérdida de calidad.
- Pruebas de compatibilidad con el stack estándar: sirve para verificar que un modelo con expertos comprimidos y almacenados en BF16 carga y ejecuta correctamente en `transformers` y vLLM sin parches.
- Reproducción de experimentos internos: el identificador `r127` sugiere una serie de checkpoints; este artefacto permite replicar resultados de una ejecución concreta de un pipeline de compresión.
- Benchmarking de memoria y throughput: con 134,7 GB en BF16, permite medir el coste de servir un MoE de 67 000 millones de parámetros en hardware multi-GPU sin cuantización en tiempo de carga.
- Docencia y divulgación: como ejemplo práctico de cuantización selectiva en arquitecturas MoE para explicar el trade-off entre precisión por componente y calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: 134,7 GB de pesos en BF16, más overhead de checkpoints y tokenizador.
- VRAM estimada para inferencia: al menos ~135 GB solo para pesos, más KV cache y activaciones; en la práctica se requiere un nodo multi-GPU.
- GPU recomendadas: 2× H100 80 GB o 2× A100 80 GB como mínimo para cargar los pesos; 4× A100/H100 para margen ante contexto largo y concurrencia.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en configuraciones de una sola GPU consumer; se necesitaría descarga a CPU o particionado en disco con latencia muy alta.
- Opciones de despliegue: `transformers` y vLLM, según indica la model card; llama.cpp y Ollama no están confirmados para este formato de pesos dequantizados en BF16.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r127 | 67.319.436.656 | no disponible | la del modelo base | safetensors BF16 | Expertos a 2,10 bits, resto BF16 |
| Qwen/Qwen3.6-35B-A3B (base) | no disponible en esta ficha | no disponible | no disponible | safetensors | Modelo original sin compresión selectiva |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables |

La comparación cuantitativa con otras alternativas no está disponible: no se han publicado métricas de calidad, latencia ni throughput para este checkpoint, y la model card del modelo base no se incluye en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación interna: no es un lanzamiento oficial ni está validado para producción.
- Cuantización extrema: 2,10 bits de media en los expertos enrutados implica una pérdida de precisión significativa que puede degradar la calidad de generación, el razonamiento y la coherencia en comparación con el modelo base; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Licencia no explicitada: la model card remite a la licencia del modelo base, que no se detalla; antes de cualquier uso comercial es imprescindible verificar los términos de Qwen/Qwen3.6-35B-A3B.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre el rendimiento en castellano.
- Contexto no declarado: se desconoce la ventana máxima soportada por este checkpoint.
- Riesgo de alucinación: inherente a los modelos generativos y potencialmente amplificado por la compresión de los expertos.
- Sesgos: no se ha documentado ningún análisis de sesgos del modelo base ni de este checkpoint.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permitan validar su comportamiento.
- Compatibilidad multimodal incierta: aunque los tags incluyen `image-text-to-text`, la model card no describe el procesador ni los requisitos para entrada de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r127
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
