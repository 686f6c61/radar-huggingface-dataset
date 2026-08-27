# albertge/llada-8b-full-sft-mix60k-code-codetags

## Resumen

El modelo `albertge/llada-8b-full-sft-mix60k-code-codetags` es un ajuste fino (fine-tuning) de secuencia completa (full-sequence SFT) sobre el modelo base `albertge/llada-8b-full-sft-mix60k-4pass`, que a su vez deriva de LLaDA-8B, un modelo de difusión de lenguaje (diffusion language model) de 8.015 millones de parámetros. Desarrollado por el usuario albertge, este checkpoint está diseñado específicamente para la generación de código Python, utilizando un subconjunto de 30.000 ejemplos de OpenCodeInstruct con objetivos delimitados por etiquetas `<code>...</code>`. El modelo se enmarca en la investigación sobre control de código en modelos de difusión sin canales de registro ni estado continuo, como se describe en el paper "dLLM Registers".

La relevancia de este modelo radica en que explora una alternativa a los modelos autorregresivos tradicionales para tareas de generación de código, utilizando un enfoque de difusión que permite generar secuencias completas de forma no autorregresiva. Aunque los resultados en benchmarks de código (HumanEval y MBPP) son modestos, el modelo sirve como base para estudiar el comportamiento de los modelos de difusión en tareas de programación y para comparar arquitecturas con y sin canales de registro. El contexto de generación está limitado a 1024 tokens de finalización, y el modelo se distribuye en formato safetensors, con un tamaño de repositorio de 16 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de lenguaje (LLaDA), basado en transformer, sin detalles adicionales disponibles |
| Parametros totales | 8.015.581.184 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (limitación de 1024 tokens de finalización en entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantización posible con herramientas externas) |
| Idiomas soportados | No disponible (entrenado principalmente en código Python, sin especificación de idiomas naturales) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LLaDA (Large Language Diffusion Models), que utiliza un objetivo de entrenamiento de difusión que actúa como cota superior de la log-verosimilitud negativa, permitiendo la generación de texto de forma no autorregresiva. El checkpoint parte de la inicialización de `albertge/llada-8b-full-sft-mix60k-4pass` y se entrena con datos de continuación del subconjunto OpenCodeInstruct (30.000 ejemplos) de `albertge/mix60k-math-code-sft`. Los objetivos son código Python crudo delimitado por `<code>...</code>`. El entrenamiento utiliza cuatro pasadas de optimización de pérdida de difusión con ruido independiente por ejemplo, longitudes de secuencia naturales y dinámicas limitadas a 1024 tokens de finalización, una época, batch size 1 por rango, learning rate 1e-5 y weight decay 0.1. No se emplean canales de registro ni estado continuo, lo que lo diferencia de otras variantes del mismo autor.

## Capacidades

- Generación de código Python: el modelo está específicamente entrenado para producir fragmentos de código Python a partir de instrucciones o descripciones, aunque con rendimiento limitado en benchmarks estándar.
- Generación de texto no autorregresiva: al ser un modelo de difusión, genera secuencias completas de forma paralela, lo que puede ofrecer ventajas en latencia para ciertos casos.
- Aprendizaje en contexto: al igual que otros modelos LLaDA, puede realizar tareas de instrucción y seguir formatos, aunque no se han documentado capacidades avanzadas como tool calling o razonamiento multi-paso.
- Especialización en código: el entrenamiento con datos de OpenCodeInstruct y objetivos delimitados por etiquetas sugiere una capacidad enfocada en tareas de programación, aunque sin evidencia de soporte multilingüe o multimodal.

## Casos de uso

- Investigación en modelos de difusión para código: el modelo es útil para estudiar cómo los modelos de difusión manejan la generación de código, comparando con variantes con canales de registro o con modelos autorregresivos.
- Experimentación en generación de código no autorregresiva: dado su enfoque de difusión, puede emplearse para probar técnicas de decodificación paralela o de optimización de secuencias completas.
- Generación de fragmentos de código Python: aunque los resultados en HumanEval y MBPP son bajos, puede utilizarse en entornos de investigación para generar esbozos de código que luego se refinan con otras herramientas.
- Evaluación de métricas de calidad en código: sirve como punto de referencia para medir el impacto de diferentes estrategias de SFT en modelos de difusión.
- Desarrollo de pipelines de entrenamiento: el repositorio asociado (`d1-registers`) proporciona scripts de entrenamiento que pueden adaptarse para experimentar con otros datasets o configuraciones.
- Comparación de arquitecturas: al ser un checkpoint sin canales de registro, permite aislar el efecto de estos componentes en el rendimiento de generación de código.

## Benchmarks y rendimiento

El autor reporta una evaluación acotada con el protocolo "Fresh 16 x 64 clears", donde se generan textos en cada límite sin estado y se concatenan para puntuar como un programa. Los resultados son los siguientes:

| Protocolo | HumanEval | MBPP |
|---|---|---|
| Fresh 16 x 64, sin estado | 11.6 (19/164) | 23.7 (61/257) |

No se han publicado comparaciones con otros modelos en la información disponible. Estos valores son considerablemente inferiores a los de modelos autorregresivos de tamaño similar (por ejemplo, modelos 8B como Llama 3 8B suelen superar el 60% en HumanEval), lo que indica que este checkpoint es principalmente un artefacto de investigación y no está optimizado para producción.

## Requisitos de hardware

- VRAM estimada: dado el tamaño de 8.015 millones de parámetros y un repositorio de 16 GB (probablemente en fp16), se estima que la inferencia en precisión fp16 requiere al menos 16 GB de VRAM. Con cuantización a 8 bits podría reducirse a ~8 GB, y a 4 bits a ~4 GB, aunque no se han publicado configuraciones oficiales.
- GPU recomendadas: no se especifican, pero GPUs con 16 GB o más (por ejemplo, RTX 4090, A100 40GB) serían adecuadas para fp16. Para cuantización, GPUs con 8 GB (RTX 3070, RTX 4060) podrían ser suficientes.
- Compatibilidad con frameworks: al ser un modelo de difusión, no es directamente compatible con frameworks de inferencia autorregresiva estándar como vLLM o llama.cpp sin adaptaciones. Se recomienda usar el código del repositorio oficial de LLaDA o el runner proporcionado por el autor.
- Latencia y throughput: no se han publicado datos. La generación no autorregresiva podría ofrecer ventajas en paralelismo, pero no hay métricas disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Existen otros checkpoints del mismo autor, como `albertge/llada-8b-dllm-registers-mix60k-r4t4`, que incorporan canales de registro, pero no se han publicado resultados comparativos. Tampoco se dispone de datos de otros modelos de difusión para código en el momento de la consulta. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con datos de código, puede presentar sesgos inherentes a los datasets de programación, como preferencia por ciertos estilos o falta de diversidad en lenguajes.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir código sintácticamente plausible pero incorrecto o con errores lógicos, especialmente en tareas complejas.
- Limitaciones de contexto: la generación está limitada a 1024 tokens de finalización, lo que restringe su uso en tareas que requieran secuencias largas.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial o la redistribución sin permiso explícito del autor.
- Estado de investigación: el modelo es un checkpoint experimental con rendimiento bajo en benchmarks estándar; no es adecuado para entornos de producción sin un ajuste adicional significativo.
- Compatibilidad limitada: al ser un modelo de difusión, las herramientas de inferencia convencionales pueden no funcionar sin modificaciones, lo que dificulta su despliegue práctico.

## Enlaces

- HuggingFace: https://huggingface.co/albertge/llada-8b-full-sft-mix60k-code-codetags
- Repositorio del autor: https://github.com/lbertge/d1-registers
- Paper de LLaDA: https://ar5iv.labs.arxiv.org/html/2502.09992
- Implementación oficial de LLaDA: https://github.com/ML-GSAI/LLaDA
