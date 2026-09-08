# Hooshaai/svd-linear-attention-roberta-fms

## Resumen

El modelo `Hooshaai/svd-linear-attention-roberta-fms` es un checkpoint de RoBERTa adaptado mediante descomposición en valores singulares (SVD) para explorar atención lineal, desarrollado por Hoosha AI. Está evaluado en SST-2 con un 65,71% de precisión y un F1 binario de 0,7337. La arquitectura es un transformer encoder de RoBERTa con 135 millones de parámetros tras la adaptación, frente a los 127 millones originales. No se especifica la longitud de contexto ni los idiomas soportados. Su relevancia radica en ser parte de una suite de benchmarks de compresión de LLM y atención lineal, aunque no logra reducción de FLOPs.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder) con adaptación de atención lineal por SVD |
| Parámetros totales | 135.297.938 (después de la adaptación); 127.325.954 (antes) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`weights.pt`) |
| Tasa de compresión | 0,9411x |
| Reducción de FLOPs | 0,0% |
| Parámetros de recuperación entrenables | 4.155.650 |
| Capas comprimidas/inyectadas | 0 |
| VRAM pico | 407,41 MB |

## Arquitectura y entrenamiento

El checkpoint parte de la arquitectura estándar de RoBERTa, un transformer encoder preentrenado, y aplica una factorización basada en descomposición en valores singulares (SVD) para adaptar los pesos a una formulación de atención lineal. No se inyectan capas comprimidas (0 capas) y se añaden 4.155.650 parámetros de recuperación entrenables, lo que da como resultado un total de 135 millones de parámetros, ligeramente superior al modelo original. La tasa de compresión es 0,9411x y la reducción de FLOPs es del 0%, lo que indica que la adaptación no reduce el coste computacional.

El modelo se evalúa en el dataset SST-2, una tarea de análisis de sentimiento binario. No se mencionan procesos de RLHF ni DPO en la información disponible. La técnica se enmarca en la investigación de atención subcuadrática y compresión de modelos de Hoosha AI, pero en este checkpoint concreto la factorización no se traduce en una ganancia de eficiencia.

## Capacidades

- Clasificación de sentimiento binario en SST-2, con precisión de validación del 65,71% y F1 binario de 0,7337.
- No es un modelo generativo: no soporta generación de texto libre.
- No se ha documentado soporte de tool calling, function calling, agentes, visión ni audio.
- Capacidades multilingües no especificadas; solo se ha validado en SST-2, que está en inglés.
- Sirve como referencia para evaluar técnicas de compresión de pesos y atención lineal dentro de la suite de benchmarks de Hoosha AI.
- Incluye parámetros de recuperación entrenables (4.155.650) que permiten re-adaptar el modelo tras la factorización.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: el modelo puede clasificar opiniones como positivas o negativas en textos cortos, útil para monitorizar reseñas en e-commerce, aunque su precisión es baja comparada con un RoBERTa estándar.
- Investigación en compresión de modelos: sirve como caso de estudio para comparar técnicas de factorización SVD frente a otros métodos de compresión, ya que reporta métricas de rendimiento y eficiencia.
- Evaluación de atención lineal: permite experimentar con arquitecturas de atención subcuadrática y medir su impacto en tareas de clasificación.
- Fine-tuning para tareas de clasificación de texto: al ser un checkpoint de RoBERTa, puede usarse como punto de partida para ajustar en otros datasets de clasificación, aunque requeriría convertir el formato de pesos.
- Docencia y demostraciones de compresión de modelos: útil en entornos académicos para ilustrar cómo la descomposición SVD afecta a los parámetros y al rendimiento.
- Benchmarks de eficiencia: se puede utilizar para medir throughput y VRAM en entornos de evaluación, ya que la model card reporta 6943,57 tokens/seg y 407,41 MB de VRAM pico.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión de validación | 65,71% |
| F1 binario | 0,7337 |
| F1 macro | 0,6261 |
| Precisión | 0,7205 |
| Recall | 0,652 |
| Pérdida de validación | 0,6107 |
| Estado de control de calidad | PASS (umbral >= 56%) |

| Métrica de eficiencia | Valor |
|---|---|
| Tasa de compresión | 0,9411x |
| Reducción de FLOPs | 0,0% |
| Throughput | 6943,57 tokens/seg |
| Tiempo de evaluación | 39,26 s |
| VRAM pico | 407,41 MB |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: 407,41 MB según la model card (pico durante la evaluación). Es un modelo pequeño que cabe en cualquier GPU con al menos 0,5 GB de VRAM.
- GPU recomendada: cualquier GPU moderna (RTX 2060 o superior) o incluso CPU. No se requiere hardware especializado.
- Cabe en consumer GPU: sí, es un modelo de 135 millones de parámetros, fácilmente ejecutable en GPUs de consumo.
- Opciones de despliegue: el checkpoint se carga con `torch.load("weights.pt")`, no es un modelo estándar de HuggingFace con `config.json` ni tokenizer. Para usarlo con `transformers` sería necesario convertirlo.
- Latencia y throughput: 6943,57 tokens/seg reportados en el entorno de evaluación del autor (hardware no especificado).

## Comparativa con modelos similares

No se dispone de datos de comparación con modelos similares en la información proporcionada. El modelo se basa en RoBERTa base, que tiene 125 millones de parámetros, pero no se han publicado resultados comparativos en SST-2 u otras tareas. Por tanto, no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo no es un modelo completo de HuggingFace: solo contiene `weights.pt`, sin `config.json` ni tokenizer, por lo que no se puede cargar directamente con la API de `transformers`.
- La "compresión" no reduce el número de parámetros (aumenta de 127M a 135M) ni los FLOPs (0% de reducción), por lo que no aporta eficiencia computacional en este checkpoint.
- El rendimiento en SST-2 (65,71%) es notablemente inferior al de un RoBERTa estándar en la misma tarea, lo que sugiere una degradación de precisión asociada a la factorización.
- No se han evaluado sesgos ni se ha documentado la composición del dataset de entrenamiento.
- La licencia no está especificada, por lo que no se puede garantizar el uso comercial.
- No se especifica la longitud de contexto ni los idiomas soportados; se asume inglés por el dataset SST-2, pero no está confirmado.
- El modelo no soporta generación de texto, tool calling ni otras capacidades de LLM modernos.

## Enlaces

- HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-roberta-fms
- Web de Hoosha AI: https://hooshaai.github.io/
- Artículo sobre atención lineal: https://hooshaai.substack.com/p/scaling-transformers-how-linear-attention
