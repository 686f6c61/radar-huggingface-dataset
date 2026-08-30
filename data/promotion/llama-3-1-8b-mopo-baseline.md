# promotion/Llama-3.1-8B-MOPO-baseline

## Resumen

El modelo `promotion/Llama-3.1-8B-MOPO-baseline` es un ajuste fino del modelo `meta-llama/Llama-3.1-8B-Instruct` desarrollado por el usuario `promotion` en el marco de un estudio sobre optimización de preferencias multi-objetivo (MOPO, Multi-Objective Preference Optimization). Se trata de un baseline dentro de una familia de modelos que exploran cómo agregar distintos objetivos de alineación (instrucción, veracidad, honestidad y utilidad) mediante técnicas de optimización basadas en preferencias. Este baseline concreto utiliza un parámetro tau = 0.1 y emplea un enfoque de clonación de comportamiento ponderada por importancia con multiplicadores de barrera logarítmica.

El modelo parte de la política de referencia e inicialización `Llama-3.1-8B-Instruct`, y se entrena durante 300 pasos sobre prompts del dataset UltraFeedback. Las preferencias se obtienen mediante un oráculo `Qwen3-32B` que puntúa cada par de respuestas en los cuatro objetivos, promediando los resultados en ambos órdenes de presentación. El resultado es un modelo que, según los datos reportados, consigue un surplus positivo sobre la referencia en todos los objetivos evaluados, con un mínimo de +0.0215 en honestidad. Aunque es un baseline, su relevancia radica en servir como punto de comparación para métodos de negociación multi-objetivo más sofisticados, como el modelo NBPO que alcanza un mínimo de +0.0391.

La ficha se basa exclusivamente en la información proporcionada por el autor en la model card y en los datos de HuggingFace. No se dispone de información adicional sobre arquitectura interna, datos de entrenamiento completos o benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye a partir de `meta-llama/Llama-3.1-8B-Instruct`, que es a la vez la política de referencia y la inicialización. La arquitectura es la del transformer decoder-only de Llama 3.1 con 8B parámetros, aunque no se detallan modificaciones estructurales adicionales. El entrenamiento sigue el esquema MOPO con tau = 0.1, utilizando un enfoque de clonación de comportamiento ponderada por importancia (importance-weighted behaviour cloning) con multiplicadores de barrera logarítmica.

El proceso de alineación se realiza sobre prompts del dataset UltraFeedback, donde un oráculo de preferencias `Qwen3-32B` puntúa las respuestas en cuatro objetivos: seguimiento de instrucciones, veracidad, honestidad y utilidad. Cada par de respuestas se consulta en ambos órdenes de presentación y se promedia el resultado (swap-averaging). Todas las variantes del estudio comparten un mismo conjunto de pares, un mismo optimizador y un presupuesto de 300 pasos; la única diferencia entre las variantes es cómo se agregan los objetivos. Este baseline emplea una agregación simple con tau = 0.1, que según el autor es el ajuste que consigue surplus positivo en su propio barrido.

No se proporcionan detalles sobre el dataset completo, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO adicionales más allá de la optimización de preferencias descrita.

## Capacidades

- Generación de texto: hereda las capacidades de generación del modelo base Llama 3.1 8B Instruct, incluyendo completado de texto, diálogo y respuesta a instrucciones.
- Razonamiento: el modelo base tiene capacidades de razonamiento básico y resolución de problemas, aunque no se reportan evaluaciones específicas para este ajuste.
- Codigo: al derivar de Llama 3.1 8B Instruct, puede generar y depurar código en varios lenguajes, aunque no hay datos concretos de rendimiento.
- Matematicas: capacidades matemáticas moderadas, propias de un modelo de 8B, sin mejoras específicas documentadas.
- Soporte de tool calling / function calling: no se menciona en la documentación; probablemente no se ha evaluado específicamente.
- Soporte de agentes y multi-step reasoning: no hay evidencia de que el fine-tuning haya modificado estas capacidades; depende del modelo base.
- Capacidades multilingues: no se especifican idiomas soportados; el modelo base Llama 3.1 8B es principalmente monolingüe en inglés, con algo de multilingüismo limitado.
- Capacidades especiales: el modelo está optimizado para equilibrar múltiples objetivos de alineación (instrucción, veracidad, honestidad, utilidad), lo que puede traducirse en respuestas más equilibradas en esos ejes.

## Casos de uso

- Evaluación de métodos de alineación multi-objetivo: este modelo sirve como baseline en experimentos académicos para comparar técnicas de optimización de preferencias con múltiples objetivos. Se usaría como referencia para medir el surplus de otros métodos como NBPO.
- Investigación en preferencias humanas: al estar entrenado con un oráculo de preferencias sobre UltraFeedback, puede usarse para estudiar cómo distintos objetivos de alineación interactúan entre sí y cómo afectan al comportamiento del modelo.
- Desarrollo de asistentes equilibrados: en aplicaciones donde se busca que el asistente sea útil pero también veraz y honesto, este modelo puede desplegarse como punto de partida para evaluar si el equilibrio de objetivos mejora la calidad percibida de las respuestas.
- Análisis de trade-offs en alineación: los datos de surplus permiten analizar qué objetivos se sacrifican frente a otros en el proceso de optimización, útil para diseñar políticas de alineación más robustas.
- Generación de datos sintéticos para entrenamiento: las respuestas generadas por este modelo pueden emplearse como datos de preferencia para entrenar otros modelos o para validar oráculos de preferencia.
- Benchmarking de oráculos de preferencia: al haber sido evaluado con un oráculo `Qwen3-32B`, puede utilizarse para calibrar o comparar diferentes oráculos de preferencia en tareas de alineación.

## Benchmarks y rendimiento

El autor reporta resultados de surplus sobre la política de referencia en un panel de 657 prompts a escala poblacional. Los datos son los siguientes:

| Objetivo | Surplus |
|---|---|
| Seguimiento de instrucciones | +0.0307 |
| Veracidad | +0.0265 |
| Honestidad | +0.0215 |
| Utilidad | +0.0321 |
| Mínimo | +0.0215 |

Estos valores indican una mejora consistente sobre el modelo base en todos los objetivos evaluados, aunque el mínimo se sitúa en honestidad. No se proporcionan benchmarks estándar como MMLU, HumanEval o GSM8K para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no se proporcionan datos específicos. Como modelo de 8B en FP16, requiere aproximadamente 16 GB de VRAM; en cuantización de 4 bits podría reducirse a unos 6-8 GB, pero no hay confirmación para este modelo.
- GPU recomendadas: GPU con al menos 16 GB de VRAM para FP16 (por ejemplo, RTX 4090, A100 40GB, L4). Para cuantización ligera, GPUs consumer de 8-12 GB podrían ser suficientes.
- Si cabe en consumer GPU: probablemente sí, en cuantización de 4 u 8 bits, aunque no se ha verificado.
- Opciones de despliegue: al ser un modelo de la familia Llama, puede desplegarse con vLLM, llama.cpp, Ollama, TGI, entre otros. No se han publicado configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El propio autor proporciona comparaciones con otros baselines del mismo estudio. Se pueden comparar los valores de surplus mínimo:

| Modelo | Surplus mínimo | Notas |
|---|---|---|
| Llama-3.1-8B-MOPO-baseline (tau=0.1) | +0.0215 | Baseline con agregación simple |
| Llama-3.1-8B-NBPO-600step | +0.0391 | Solución de negociación (Nash bargaining) |
| Llama-3.1-8B-UniformINPO-baseline | no disponible | Baseline con pesos iguales en los cuatro objetivos |

La comparativa muestra que el modelo NBPO supera claramente al baseline MOPO en el objetivo mínimo, lo que indica que la agregación por negociación es más efectiva que la simple ponderación con tau=0.1. No se dispone de datos de rendimiento en benchmarks estándar para ninguno de los tres.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al estar entrenado sobre UltraFeedback y un oráculo Qwen3-32B, puede heredar sesgos de esos datos y del oráculo.
- Riesgo de alucinacion: como cualquier modelo de 8B, puede generar información falsa o inventada; el objetivo de veracidad intenta mitigarlo, pero no hay garantías.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto; el modelo base soporta 128K, pero no está confirmado para este ajuste. Los idiomas soportados no se indican.
- Restricciones de licencia: la licencia llama3.1 permite uso comercial, pero con restricciones (por ejemplo, no usar para mejorar otros modelos de lenguaje grandes sin permiso). Revisar el acuerdo completo.
- Caveat para produccion: al ser un baseline de investigación con 0 descargas y 0 likes, no hay evidencia de robustez en entornos reales. El entrenamiento de solo 300 pasos puede no haber convergido completamente.
- Dependencia del oráculo: las preferencias provienen de un modelo específico (Qwen3-32B), lo que puede limitar la generalización a otros juicios de preferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/promotion/Llama-3.1-8B-MOPO-baseline
- Modelo NBPO comparado: https://huggingface.co/promotion/Llama-3.1-8B-NBPO-600step
- Dataset de generaciones del benchmark: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Baseline UniformINPO: https://huggingface.co/promotion/Llama-3.1-8B-UniformINPO-baseline
- Información general sobre Llama 3 (Meta): https://developer.meta.com/ai/models/llama-3/
