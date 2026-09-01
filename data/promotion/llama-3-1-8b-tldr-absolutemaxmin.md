# promotion/Llama-3.1-8B-TLDR-AbsoluteMaxmin

## Resumen

Llama-3.1-8B-TLDR-AbsoluteMaxmin es un modelo de lenguaje desarrollado por el usuario "promotion" como un experimento de alineación multi-objetivo. Se trata de un fine-tune del modelo `meta-llama/Llama-3.1-8B-Instruct`, que actúa tanto como política de referencia como punto de inicialización. El modelo aplica una regla de agregación de objetivos denominada "Absolute maxmin" sobre el panel de evaluación TL;DR, donde cada objetivo (cobertura, fidelidad, concisión y utilidad) es puntuado por un oráculo de preferencias basado en `Qwen3-32B` prompteado, con promedio de intercambio de orden para reducir sesgos.

La relevancia de este modelo radica en su contribución al estudio de cómo diferentes reglas de agregación de objetivos afectan el comportamiento de un modelo alineado. Dentro de un panel controlado, todos los brazos comparten el mismo pool de respuestas, optimizador y presupuesto de 300 pasos, de modo que las diferencias entre ellos son atribuibles únicamente a la regla de agregación. Este enfoque permite aislar el efecto de la agregación en la alineación, un aspecto crítico en el desarrollo de sistemas multi-objetivo.

Con 8.030 millones de parámetros, el modelo es de tamaño medio y está pensado para investigación en alineación y preferencias, no como un producto final. Su licencia es Llama 3.1 Community, lo que permite uso comercial bajo ciertas condiciones. Aunque no se han publicado benchmarks estándar, los resultados del panel indican mejoras en cobertura y utilidad, pero una degradación en concisión, lo que refleja las compensaciones inherentes a la agregación maxmin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, basada en Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible (repo en safetensors, precisión no especificada) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Llama 3.1, con 8 mil millones de parámetros. El entrenamiento consiste en un fine-tune de preferencias multi-objetivo sobre `meta-llama/Llama-3.1-8B-Instruct`. Cada objetivo se puntúa mediante un oráculo de preferencias basado en `Qwen3-32B` prompteado, y cada par de respuestas se evalúa en ambos órdenes de presentación, promediando los resultados (swap-averaging). El entrenamiento se realiza con un presupuesto de 300 pasos, compartiendo el mismo pool de respuestas y optimizador para todos los brazos del panel. La regla "Absolute maxmin" agrega los objetivos tomando el valor mínimo absoluto de los surpluses normalizados, lo que prioriza el peor objetivo en cada respuesta.

No se han proporcionado detalles sobre el dataset de entrenamiento, el número de tokens, ni si se utilizaron técnicas adicionales como RLHF o DPO más allá de la optimización de preferencias descrita. El modelo se construyó con Llama y se distribuye bajo la licencia comunitaria de Llama 3.1.

## Capacidades

- Generación de texto general: al ser un fine-tune de Llama 3.1 Instruct, hereda las capacidades básicas de generación de texto, razonamiento, código y matemáticas del modelo base, aunque no se han realizado evaluaciones específicas en esta versión.
- Alineación multi-objetivo: el modelo está optimizado para maximizar la cobertura y utilidad en resúmenes, manteniendo un equilibrio con la fidelidad, a expensas de la concisión.
- Evaluación de preferencias: integra un oráculo de preferencias (Qwen3-32B) que puntúa cada respuesta, permitiendo comparaciones objetivas entre respuestas generadas.
- No se han documentado capacidades específicas de tool calling, agentes, visión o audio. Estas capacidades, si existen, serían las del modelo base, pero no están confirmadas en la ficha.

## Casos de uso

- Investigación en alineación de modelos: permite estudiar cómo la regla de agregación "maxmin" afecta el comportamiento del modelo en comparación con otras reglas (promedio, mínimo, etc.), usando el panel TL;DR como entorno controlado.
- Análisis de compensaciones entre objetivos: útil para investigadores que necesitan entender el equilibrio entre cobertura, fidelidad, concisión y utilidad en tareas de resumen, y cómo diferentes agregaciones influyen en ese equilibrio.
- Desarrollo de métodos de optimización de preferencias: sirve como referencia para implementar y comparar algoritmos de optimización multi-objetivo con oráculos de preferencia.
- Benchmarking de oráculos de evaluación: al usar Qwen3-32B como oráculo, puede emplearse para validar la consistencia de evaluadores automáticos en tareas de resumen.
- Educación y divulgación: como ejemplo de fine-tune de alineación con código abierto, puede utilizarse en cursos o talleres sobre RLHF y optimización de preferencias.
- Reproducción de experimentos: dado que se especifican los detalles del panel y la metodología, es adecuado para reproducir y verificar los resultados publicados en el paper asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card reporta el surplus sobre la política de referencia en 100 prompts, con escala poblacional \(A_k = P_k - 1/2\):

| Objetivo | Surplus |
|---|---|
| Cobertura | +0.4264 |
| Fidelidad | +0.0098 |
| Concisión | -0.1589 |
| Utilidad | +0.3631 |
| **Mínimo** | **-0.1589** |
| **Promedio** | **+0.1601** |

Estos valores indican que el modelo mejora significativamente la cobertura y utilidad, mantiene la fidelidad prácticamente sin cambios y pierde en concisión. El "mínimo" negativo refleja que el peor objetivo (concisión) empeora, lo cual es esperable en una agregación maxmin que prioriza el peor caso. El promedio positivo sugiere una mejora global modesta. No se dispone de intervalos de confianza ni pruebas de significancia en la ficha, aunque se menciona que están en el apéndice del paper.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parámetros, en precisión fp16/bf16 requiere aproximadamente 16 GB de VRAM. Con cuantización a 4 bits, puede reducirse a unos 5-6 GB, pero no se han publicado configuraciones específicas.
- GPUs recomendadas: para inferencia en fp16, una GPU con al menos 16 GB (por ejemplo, NVIDIA RTX 4090, A100 40GB, o similares). Para cuantización ligera, GPUs consumer de 8-12 GB podrían ser suficientes, aunque no está confirmado.
- Si cabe en consumer GPU: sí, en GPUs de gama alta con 16 GB o más, y con cuantización en GPUs de 8 GB.
- Opciones de despliegue: al ser un modelo estándar de Llama, puede desplegarse con vLLM, llama.cpp, Ollama, TGI u otros frameworks compatibles con safetensors y arquitectura Llama.
- Latencia y throughput: no hay datos publicados. Como referencia, un modelo 8B en una A100 suele generar entre 50 y 100 tokens/segundo, pero esto depende de la implementación y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con otros modelos de la misma categoría. El modelo es un fine-tune experimental de Llama-3.1-8B-Instruct con una regla de agregación específica. Como referencia, se puede comparar con el propio modelo base:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct | 8B | 128k (no confirmado en ficha) | Llama 3.1 Community | Modelo base, sin optimización multi-objetivo |
| Llama-3.1-8B-TLDR-AbsoluteMaxmin | 8B | no disponible | Llama 3.1 Community | Fine-tune con regla maxmin, mejoras en cobertura/utilidad, peor concisión |

No se han encontrado otros modelos comparables con la misma metodología de agregación maxmin en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos. Al ser un fine-tune de Llama 3.1, puede heredar sesgos del modelo base, pero no se ha evaluado.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se ha evaluado específicamente en esta versión.
- Limitaciones de contexto e idioma: la longitud de contexto no está confirmada, aunque se espera que herede los 128k del modelo base. Los idiomas soportados no están documentados.
- Restricciones de licencia: la Licencia Comunitaria Llama 3.1 permite uso comercial, pero requiere que los usos con más de 700 millones de usuarios mensuales soliciten una licencia adicional de Meta. Debe revisarse el texto completo de la licencia.
- Limitaciones para producción: este modelo es un artefacto de investigación, no está diseñado para uso en producción. Su rendimiento en tareas generales no ha sido validado, y la regla maxmin puede degradar la concisión, lo que afectaría la calidad en aplicaciones donde la brevedad es importante.
- Dependencia del oráculo: la evaluación y el entrenamiento dependen de Qwen3-32B como oráculo de preferencias; cualquier sesgo en ese oráculo se refleja en el modelo.
- Disponibilidad: el modelo tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente o poco difundido. Los resultados deben interpretarse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/promotion/Llama-3.1-8B-TLDR-AbsoluteMaxmin
- Dataset de generaciones de benchmark (UltraFeedback): https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community: https://www.llama.com/llama3_1/license/ (no verificado, se asume por la ficha)
