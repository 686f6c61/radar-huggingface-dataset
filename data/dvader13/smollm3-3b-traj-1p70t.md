# dvader13/smollm3-3b-traj-1p70t

## Resumen

El repositorio `dvader13/smollm3-3b-traj-1p70t` no contiene un modelo final, sino una colección de 31 checkpoints intermedios del entrenamiento de refuerzo (RL) del modelo SmolLM3-3B, desarrollado por Hugging Face. Estos checkpoints representan la trayectoria de entrenamiento durante la primera época, partiendo de un modelo base preentrenado con 1,7 billones de tokens. El autor los publica con fines de investigación, para que la comunidad pueda estudiar la evolución de las capacidades del modelo a lo largo del proceso de RL.

La relevancia de este repositorio reside en que permite analizar cómo se desarrolla el aprendizaje durante el refuerzo, algo poco común en la mayoría de las publicaciones que solo ofrecen el modelo final. Al estar licenciado bajo Apache 2.0 y usar pesos en bf16, es accesible para investigadores y desarrolladores interesados en interpretabilidad, dinámica de entrenamiento y análisis de trayectorias. Sin embargo, no es un modelo apto para uso en producción, sino un material de estudio técnico.

El repositorio ocupa 190,7 GB y los checkpoints se espacian de forma creciente con el avance del entrenamiento: pasos de 20 hasta el 200, luego de 40, 80 y 120. Cada checkpoint es un snapshot del modelo en un momento concreto de la primera época de RL.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (SmolLM3-3B) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los checkpoints pertenecen a la familia SmolLM3-3B, un modelo transformer denso de 3 mil millones de parámetros preentrenado sobre 1,7 billones de tokens (según el nombre del repositorio, `1p70t`). El modelo base fue desarrollado por Hugging Face con datos públicos que incluyen documentos web, artículos científicos y código. La información proporcionada no detalla la arquitectura interna (número de capas, dimensiones, cabezas de atención), por lo que se remite a la documentación del modelo base SmolLM3-3B.

El repositorio contiene 31 checkpoints intermedios de la primera época de entrenamiento de refuerzo (RL). No se especifica el algoritmo de RL utilizado (por ejemplo, PPO, DPO o variantes), ni los datos de entrenamiento de la fase de RL. Los checkpoints están en bf16 y son solo para inferencia. El espaciado entre pasos de entrenamiento se amplía progresivamente: de 20 pasos inicialmente a 40, 80 y 120 en etapas posteriores, lo que sugiere una captura más densa al inicio del entrenamiento.

## Capacidades

No se han documentado capacidades específicas para este repositorio. Al ser checkpoints intermedios de un modelo base de 3B, se espera que hereden las capacidades del SmolLM3-3B en su estado final, como generación de texto, razonamiento, código y matemáticas, pero estas no se han verificado en los checkpoints. No se dispone de información sobre soporte de tool calling, agentes, modo thinking o capacidades multimodales.

## Casos de uso

- Investigacion en interpretabilidad: analizar cómo evolucionan las representaciones internas y los patrones de atención a lo largo del entrenamiento de RL, comparando checkpoints en diferentes pasos.
- Estudio de la evolucion de capacidades: evaluar en qué momento del entrenamiento aparecen o mejoran habilidades concretas (razonamiento, código, seguimiento de instrucciones) mediante pruebas en cada checkpoint.
- Analisis de la estabilidad del entrenamiento: detectar posibles oscilaciones o colapsos en el comportamiento del modelo durante el RL, lo que puede orientar el diseño de futuros experimentos.
- Investigacion en interpretabilidad: usar los checkpoints como series temporales para estudiar cómo se forman los conceptos o cómo cambian los sesgos durante el refuerzo.
- Benchmarking de tecnicas de RL: comparar la trayectoria de este modelo con otras ejecuciones de RL para evaluar el impacto de hiperparámetros o algoritmos.
- Desarrollo de metodos de early stopping: identificar el punto óptimo de entrenamiento donde se maximiza el rendimiento antes de que el modelo se degrade por sobreajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este repositorio en la información disponible. Al tratarse de checkpoints intermedios, no se ofrecen métricas de calidad (como MMLU, HumanEval o GSM8K) para ninguna de las versiones. La evaluación de rendimiento es responsabilidad del usuario que descargue y pruebe cada checkpoint.

## Requisitos de hardware

- Cada checkpoint en bf16 ocupa aproximadamente 6 GB (3.000 millones de parámetros × 2 bytes por parámetro).
- Para la inferencia de un solo checkpoint se necesita una GPU con al menos 8 GB de VRAM en bf16 (por ejemplo, RTX 3080, RTX 4090 o A10).
- El repositorio completo ocupa 191 GB, por lo que se requiere un almacenamiento considerable para descargar todos los checkpoints.
- El formato safetensors es compatible con bibliotecas como `transformers`, `vLLM` y `llama.cpp` (si se convierte a GGUF).
- No se dispone de datos de latencia o throughput para estos checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 8K (según documentación del modelo) | Apache 2.0 | safetensors | Modelo final |
| Llama 3.2 3B | 3B | 8K | Llama 3.2 License | safetensors | Modelo final |
| Qwen2.5 3B | 3B | 32K | Apache 2.0 | safetensors | Modelo final |

Este repositorio no es un modelo final, sino una colección de checkpoints intermedios del SmolLM3-3B. No se dispone de datos de rendimiento para comparar directamente con estos modelos. La única diferencia estructural es que los checkpoints están en bf16 y no han sido cuantizados, mientras que los modelos finales suelen ofrecerse también en cuantizaciones como GGUF o AWQ.

## Limitaciones y advertencias

- No es un modelo final: los checkpoints son estados intermedios del entrenamiento de RL y pueden presentar comportamientos inestables, incoherentes o degradados en comparación con el modelo final.
- Solo inferencia: el autor indica que los checkpoints son para inferencia, no para continuar el entrenamiento.
- Sin benchmarks ni garantías: no se han publicado resultados de calidad, por lo que el rendimiento es desconocido.
- Tamaño del repositorio: 191 GB, lo que puede ser una barrera práctica para descarga y almacenamiento.
- Licencia Apache 2.0: permite uso comercial, pero al ser checkpoints de investigación, su uso en producción no es recomendable.
- No se dispone de información sobre el dataset de RL, el algoritmo de entrenamiento ni las condiciones exactas de los checkpoints, lo que limita la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: [dvader13/smollm3-3b-traj-1p70t](https://huggingface.co/dvader13/smollm3-3b-traj-1p70t)
- Modelo base SmolLM3-3B (Hugging Face): [HuggingFaceTB/SmolLM3-3B](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- Versión de unsloth de SmolLM3-3B: [unsloth/SmolLM3-3B](https://huggingface.co/unsloth/SmolLM3-3B)
- Repositorio GitHub de SmolLM: [huggingface/smollm](https://github.com/huggingface/smollm)
- Informe técnico de SmolLM3-3B (PDF): [aial.ie/research/gpai-training-transparency/archive/SmolLM_33B_2025_11_12.pdf](https://aial.ie/research/gpai-training-transparency/archive/SmolLM_33B_2025_11_12.pdf)
- LLM Leaderboard y benchmarks: [benchlm.ai](https://benchlm.ai/)
