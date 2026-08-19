# huggingFacing/qwen2.5-7b-to-1.5b-liftkd-v12-top-only-paper100k-step1500-seed10

## Resumen

Este modelo es un checkpoint de destilación de conocimiento (knowledge distillation) que comprime el modelo Qwen2.5-7B-Instruct a un tamaño de 1.5B parámetros, utilizando el método LIFTKD en su variante "top-only" (influencia de capas superiores). Lo desarrolla el usuario "huggingFacing" y forma parte de una suite de ablaciones para estudiar el efecto de distintas configuraciones de destilación. El modelo se inicializa desde Qwen2.5-1.5B-Instruct y se entrena con el dataset `lift_paper_en_natural_v1/100k` (96.000 ejemplos de entrenamiento y 2.000 de validación) durante 1.500 pasos con un objetivo de destilación GKD (Generalized Knowledge Distillation) totalmente on-policy. La arquitectura es un transformer decoder de la familia Qwen2, con aproximadamente 1.540 millones de parámetros. Este checkpoint concreto es una variante de ablación que solo utiliza los pesos de influencia de las dos capas superiores del profesor, lo que permite analizar el impacto de esa elección en la calidad de la destilación. Es un modelo de investigación, no un producto final, y su relevancia radica en contribuir al estudio de métodos eficientes de compresión de modelos LLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2) |
| Parametros totales | 1.543.910.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredado del base Qwen2.5-1.5B-Instruct, típicamente 32k, pero no especificado) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en FP32/FP16 en safetensors) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta múltiples idiomas, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una destilación del profesor Qwen2.5-7B-Instruct hacia un estudiante Qwen2.5-1.5B-Instruct. La arquitectura del estudiante es un transformer decoder estándar de Qwen2, con atención causal y capas de normalización. El entrenamiento utiliza GKD on-policy: el estudiante genera secuencias (muestreo con temperatura 0.9, máximo 128 tokens) y el profesor proporciona las distribuciones de probabilidad para la pérdida de destilación. La variante "top-only" de LIFTKD aplica un "gap gate" que pondera la influencia de las capas superiores del profesor (las dos últimas capas) para guiar la destilación, ignorando las capas inferiores. El entrenamiento se realizó con AdamW, learning rate coseno de 1e-5 a 1e-7, weight decay 1e-2, batch global de 64 y 1.500 pasos. No se mencionan técnicas adicionales como RLHF o DPO; la destilación es el único objetivo.

## Capacidades

- Generación de texto: al estar basado en Qwen2.5-1.5B-Instruct, conserva la capacidad de generar texto coherente y continuar conversaciones.
- Razonamiento y conocimiento: hereda parte del conocimiento del profesor, aunque con menor capacidad debido al tamaño reducido.
- Soporte de instrucciones: al ser inicializado desde un modelo instruct, responde a instrucciones en formato conversacional.
- Multilingüismo: no se especifica, pero el modelo base Qwen2.5 soporta varios idiomas; se espera que el destilado mantenga cierta cobertura, aunque sin datos confirmados.
- No se dispone de información sobre tool calling, agentes, visión o audio. Es un modelo exclusivamente de texto.

## Casos de uso

- Investigación en destilación de modelos: sirve como punto de comparación en estudios sobre métodos de compresión, especialmente para analizar el efecto de limitar la influencia a capas superiores.
- Prototipado rápido de chatbots ligeros: dado su tamaño de 1.5B, puede desplegarse en entornos con recursos limitados para probar flujos conversacionales básicos.
- Generación de texto asistida en aplicaciones móviles o edge: su bajo coste de inferencia lo hace adecuado para tareas de autocompletado o resumen en dispositivos con poca memoria.
- Fine-tuning posterior: al ser un checkpoint intermedio, puede servir como punto de partida para fine-tuning en tareas específicas con datasets pequeños.
- Evaluación de calidad de destilación: útil para medir la degradación de rendimiento al usar solo capas superiores del profesor, comparando con otras variantes de la suite.
- Educación y divulgación: ejemplo didáctico de cómo se construye un modelo destilado y qué implicaciones tiene cada decisión de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este checkpoint es una variante de ablación y no incluye métricas estándar como MMLU, HumanEval o GSM8K. Para evaluar su rendimiento sería necesario ejecutar dichos benchmarks manualmente o consultar el checkpoint completo de la suite.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 3 GB (1.5B parámetros × 2 bytes). Con cuantización INT8, alrededor de 1.5 GB; en INT4, menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutarlo en FP16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores). Para mayor velocidad, se recomienda una RTX 3090 o A100 en entornos de producción.
- Compatibilidad con GPUs de consumo: sí, cabe en la mayoría de GPUs consumer actuales, incluso en modo cuantizado.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp, Ollama y text-generation-inference (según las etiquetas del repositorio).
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna, se espera una latencia de decodificación de unos pocos milisegundos por token y un throughput de cientos de tokens por segundo en batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1.54B | 32k (típico) | Apache 2.0 | Modelo original sin destilar |
| Qwen2.5-7B-Instruct (profesor) | 7.6B | 32k | Apache 2.0 | Modelo de mayor tamaño que sirve como profesor |
| Este checkpoint (top-only) | 1.54B | no disponible | Apache 2.0 | Destilado con LIFTKD variante top-only |

No se dispone de datos de rendimiento comparativo. La comparación se limita a características arquitectónicas y de licencia.

## Limitaciones y advertencias

- Es un modelo de investigación, no un producto final. Puede presentar inestabilidades o comportamientos inesperados fuera de los experimentos de destilación.
- Al ser una variante de ablación, su rendimiento puede ser inferior al del checkpoint completo de la suite (que usa todas las capas del profesor).
- No se han documentado sesgos específicos, pero al estar entrenado sobre datos en inglés (según el nombre del dataset `lift_paper_en_natural_v1`), su cobertura multilingüe es limitada y puede tener sesgos culturales.
- Riesgo de alucinación: como cualquier modelo pequeño, puede generar información falsa o inconsistente, especialmente en temas especializados.
- Longitud de contexto: no se especifica, pero al heredar la configuración de Qwen2.5-1.5B-Instruct, probablemente soporte hasta 32k tokens; sin embargo, el entrenamiento con solo 128 tokens generados puede limitar la coherencia en secuencias largas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Qwen2.5, se deben respetar los términos de la licencia original de Qwen (Apache 2.0 también).
- No se garantiza soporte técnico ni mantenimiento por parte del autor.

## Enlaces

- Repositorio del modelo: [huggingFacing/qwen2.5-7b-to-1.5b-liftkd-v12-top-only-paper100k-step1500-seed10](https://huggingface.co/huggingFacing/qwen2.5-7b-to-1.5b-liftkd-v12-top-only-paper100k-step1500-seed10)
- Checkpoint completo de la suite: [huggingFacing/qwen25_7B_to_1.5B_v12_onlineif_paper100k_1500](https://huggingface.co/huggingFacing/qwen25_7B_to_1.5B_v12_onlineif_paper100k_1500)
- Modelo base del estudiante: [Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- Modelo profesor: [Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
