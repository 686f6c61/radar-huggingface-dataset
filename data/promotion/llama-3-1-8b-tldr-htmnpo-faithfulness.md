# promotion/Llama-3.1-8B-TLDR-HTMNPO-faithfulness

## Resumen

`Llama-3.1-8B-TLDR-HTMNPO-faithfulness` es un modelo de lenguaje de 8.030 millones de parámetros desarrollado por el usuario `promotion` como un experimento de alineación multiobjetivo. Partiendo del modelo base `meta-llama/Llama-3.1-8B-Instruct`, se aplica una técnica de optimización de preferencias (HTMNPO, probablemente una variante de *preference optimization*) en la que se pondera exclusivamente el objetivo de *faithfulness* (fidelidad) dentro de un panel de tareas TL;DR (resumen). El resultado es un "rincón" de un espacio de objetivos donde la agregación es de un solo objetivo, en contraste con otros brazos del mismo panel que combinan varios criterios.

El modelo es relevante para la investigación en alineación porque permite aislar el efecto de un único objetivo sobre el comportamiento final, utilizando un oráculo de preferencias (Qwen3-32B) para evaluar cada respuesta. No se proporcionan métricas estándar de rendimiento (MMLU, HumanEval, etc.), solo una tabla de "excedente" (surplus) sobre el modelo de referencia en 100 prompts. Su interés principal es metodológico: estudiar cómo la agregación de objetivos influye en la calidad percibida de las respuestas.

Al ser un fine-tuning del instruct de Llama 3.1, hereda la arquitectura transformer con atención por grupos (GQA) y el formato de prompt de Llama 3.1, aunque la model card no especifica detalles adicionales de contexto, cuantización o idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `meta-llama/Llama-3.1-8B-Instruct`, que actúa tanto como política de referencia como inicialización. Según la model card, los objetivos se puntúan mediante un oráculo de preferencias `Qwen3-32B` al que se le presenta cada par de respuestas en ambos órdenes de presentación y se promedian los resultados (*swap-averaged*). Dentro de un panel de evaluación, todos los brazos comparten el mismo pool de respuestas, el mismo optimizador y un presupuesto de 300 pasos de entrenamiento; la única diferencia entre brazos es la regla de agregación de los objetivos. En este caso concreto, todo el peso se asigna a *faithfulness*.

No se publican detalles sobre el dataset de entrenamiento, el número de tokens procesados, la composición de los datos ni si se emplearon técnicas adicionales como RLHF o DPO. La model card únicamente menciona el uso de HTMNPO (probablemente una variante de *multi-objective preference optimization*), aunque no se explica su formulación matemática. La ausencia de información sobre el proceso de entrenamiento impide evaluar la reproducibilidad del método.

## Capacidades

- Generación de texto y resumen (TL;DR) heredadas del modelo base Llama-3.1-8B-Instruct.
- Razonamiento y comprensión del lenguaje natural, según las capacidades generales de Llama 3.1.
- No se menciona soporte para *tool calling*, *function calling* ni capacidades multimodales.
- No se especifican capacidades multilingües específicas más allá de las que pueda heredar del modelo base.
- El modelo está diseñado para experimentos de alineación, por lo que su "capacidad" principal es responder de forma fiel al contenido fuente, aunque esta propiedad solo se evalúa mediante el oráculo interno.

## Casos de uso

- Investigación en alineación multiobjetivo: permite aislar el efecto de un único objetivo (fidelidad) sobre el comportamiento del modelo, útil para comparar reglas de agregación en paneles de preferencias.
- Análisis de trade-offs entre objetivos: al ser un "rincón" de un panel, sirve como referencia para medir cómo la fidelidad compite con otros criterios como cobertura, concisión o utilidad.
- Evaluación de oráculos de preferencia: el uso de Qwen3-32B como evaluador puede estudiarse comparando las puntuaciones de este modelo con otros brazos del mismo panel.
- Reproducción de experimentos de optimización de preferencias: la model card describe el procedimiento (300 pasos, swap-averaging, etc.), lo que permite replicar el entrenamiento en otros contextos.
- Generación de resúmenes fieles en entornos controlados: aunque no hay validación externa, el modelo podría emplearse en tareas donde la fidelidad al texto original sea prioritaria, siempre bajo supervisión humana.
- Comparación de metodologías de alineación: junto con los otros brazos del panel (conciseness, coverage, etc.), permite estudiar cómo la agregación de objetivos afecta a métricas cualitativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta una tabla de "excedente" (surplus) sobre el modelo de referencia en 100 prompts, con la población a escala \(A_k = P_k - 1/2\), donde \(P_k\) es la proporción de veces que el modelo supera a la referencia según el oráculo:

| Objetivo | Excedente |
|---|---|
| Cobertura | +0.1472 |
| Fidelidad | -0.0408 |
| Concisión | -0.0525 |
| Utilidad | +0.1192 |
| Mínimo | -0.0525 |
| Promedio | +0.0433 |

Estos valores indican que, al ponderar todo el peso en fidelidad, el modelo mejora la cobertura y la utilidad percibida, pero empeora ligeramente en fidelidad y concisión en comparación con la referencia. El autor menciona que los intervalos bootstrap y las pruebas de significación están en el apéndice del paper, aunque no se proporciona el enlace al documento.

## Requisitos de hardware

No se han publicado requisitos específicos de hardware para este modelo. Al tratarse de un modelo de 8B parámetros en formato safetensors, se pueden estimar los siguientes escenarios orientativos:

- Inferencia en GPU consumer: con cuantización de 4 bits (por ejemplo, mediante GPTQ o AWQ), la VRAM necesaria rondaría los 6-8 GB, lo que permitiría ejecutarlo en una RTX 3060 de 12 GB o superior. Sin cuantización, se necesitarían al menos 16 GB de VRAM (por ejemplo, RTX 4080 o 4090).
- Inferencia en GPU profesional: una A100 de 40 GB o 80 GB podría ejecutar el modelo sin cuantizar con margen para lotes grandes.
- Opciones de despliegue: al ser un modelo derivado de Llama 3.1, es compatible con frameworks como vLLM, llama.cpp, Ollama y TGI, aunque no se ha verificado su funcionamiento en estos entornos.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 8B, se puede esperar una velocidad de generación de 20-40 tokens/s en una GPU moderna con cuantización 4-bit, pero estos valores son estimaciones genéricas y no específicas de este modelo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos. La única comparación posible es con el modelo base `meta-llama/Llama-3.1-8B-Instruct`, del cual deriva, y con otros brazos del mismo panel de experimentos (por ejemplo, `promotion/Llama-3.1-8B-TLDR-HTMNPO-conciseness`). La model card indica que todos los brazos comparten el mismo pool de respuestas y presupuesto de entrenamiento, por lo que las diferencias en el excedente son atribuibles a la regla de agregación. Sin embargo, no se proporcionan métricas estándar que permitan situar al modelo frente a alternativas comerciales o de código abierto.

## Limitaciones y advertencias

- Modelo experimental: está diseñado para investigación en alineación, no para uso en producción. No se ha validado en tareas del mundo real.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval, etc., lo que impide evaluar su rendimiento general frente a otros modelos.
- Evaluación limitada: los datos de excedente se basan en 100 prompts y un único oráculo (Qwen3-32B), lo que puede introducir sesgos del propio evaluador.
- Posible sobreajuste: el entrenamiento con 300 pasos sobre un pool reducido de respuestas puede provocar sobreajuste a las preferencias del oráculo.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar contenido falso o no fiel, a pesar de que el objetivo del entrenamiento sea la fidelidad.
- Licencia restrictiva: la licencia llama3.1 limita el uso comercial y exige cumplir las condiciones de la Llama 3.1 Community License.
- Información incompleta: no se especifican la longitud de contexto, los idiomas soportados, las cuantizaciones disponibles ni los detalles del dataset de entrenamiento.

## Enlaces

- Repositorio del modelo: [https://huggingface.co/promotion/Llama-3.1-8B-TLDR-HTMNPO-faithfulness](https://huggingface.co/promotion/Llama-3.1-8B-TLDR-HTMNPO-faithfulness)
- Dataset de generaciones de benchmark (mencionado en la model card): [https://huggingface.co/datasets/promotion/nbpo-benchmark-generations](https://huggingface.co/datasets/promotion/nbpo-benchmark-generations)
- Modelo base: [https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
