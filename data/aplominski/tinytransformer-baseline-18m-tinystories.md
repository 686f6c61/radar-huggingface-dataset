# aplominski/TinyTransformer-Baseline-18M-TinyStories

## Resumen

TinyTransformer-Baseline-18M-TinyStories es un modelo de lenguaje de 18 millones de parámetros desarrollado por aplominski como parte de una serie de investigación sobre el efecto de las estrategias de normalización en arquitecturas Transformer de pequeña escala. Este modelo concreto actúa como referencia (baseline) dentro de esa serie, ya que no incorpora ninguna técnica de normalización, a diferencia de sus variantes hermanas que aplican LayerNorm o RMSNorm en configuraciones pre o post.

El modelo está entrenado sobre el dataset TinyStories, un corpus de historias cortas en inglés diseñado para evaluar la generación de texto coherente en modelos pequeños. Su propósito principal no es servir como un producto listo para producción, sino como una herramienta experimental para comparar cómo afecta la normalización al entrenamiento y al rendimiento en arquitecturas compactas. Su relevancia radica en que permite a investigadores y estudiantes analizar de forma aislada el impacto de la normalización, manteniendo constantes el resto de variables (dataset, tamaño, configuración de entrenamiento).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (baseline, sin normalización) |
| Parametros totales | 18.455.552 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | en |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Transformer original descrita en el artículo "Attention Is All You Need" (Vaswani et al., 2017), pero sin aplicar ninguna capa de normalización. Esta ausencia deliberada de normalización constituye la variable experimental principal de la serie. El entrenamiento se realizó sobre el dataset TinyStories (roneneldan/TinyStories), compuesto por historias cortas en inglés, utilizando la tarea de masked language modeling. No se especifican en la documentación el número de tokens de entrenamiento, el número de épocas ni otros hiperparámetros. La serie incluye variantes con Pre-LayerNorm, Post-LayerNorm, Pre-RMSNorm y Post-RMSNorm, todas con el mismo tamaño y configuración de entrenamiento, lo que permite aislar el efecto de la normalización.

## Capacidades

- Generación de texto en inglés, especializado en historias cortas y narrativas simples.
- Modelo de tamaño reducido, adecuado para experimentos de investigación y fines educativos.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión o audio.
- No se indica soporte para agentes ni modos de pensamiento explícitos.
- Al ser un modelo denso de 18M parámetros, su capacidad de razonamiento complejo es limitada, pero suficiente para tareas de generación de texto básico.

## Casos de uso

- Investigación académica sobre normalización: el modelo sirve como baseline para comparar el efecto de LayerNorm y RMSNorm en arquitecturas pequeñas, permitiendo a investigadores reproducir y extender los experimentos de la serie.
- Docencia en arquitecturas Transformer: por su tamaño reducido, es ideal para que estudiantes de machine learning comprendan el funcionamiento interno de un Transformer y experimenten con modificaciones arquitectónicas sin necesidad de grandes recursos computacionales.
- Generación de historias infantiles: puede utilizarse para crear cuentos cortos en inglés, aunque su calidad será inferior a modelos más grandes; es útil como demostración de generación de texto con modelos pequeños.
- Fine-tuning en dominios específicos: al ser un modelo pequeño, puede ajustarse rápidamente en tareas de generación de texto con vocabulario restringido, como respuestas a preguntas simples o completado de frases.
- Pruebas de estabilidad de entrenamiento: al carecer de normalización, es útil para estudiar problemas de estabilidad numérica y deriva de activaciones en Transformers, un tema relevante para el diseño de arquitecturas robustas.
- Benchmarking de frameworks de inferencia: su pequeño tamaño permite evaluar el rendimiento de herramientas como llama.cpp, vLLM u Ollama en entornos con recursos limitados, midiendo latencia y throughput sin necesidad de GPUs potentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona la métrica accuracy, pero no proporciona valores concretos. No se dispone de comparaciones con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 74 MB en precisión fp32 (18.455.552 parámetros × 4 bytes). Con cuantización a 8 bits, se reduciría a unos 18 MB, aunque no se ofrecen pesos cuantizados oficialmente.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna, incluidas las integradas.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con Hugging Face Transformers, o convertirse a GGUF para usarse con llama.cpp u Ollama. También es compatible con vLLM y TGI, aunque su tamaño lo hace innecesario para estos motores.
- Latencia y throughput: no se han publicado mediciones oficiales, pero por su tamaño, la inferencia es prácticamente instantánea en hardware moderno.

## Comparativa con modelos similares

La comparativa más directa es con los otros modelos de la misma serie, que comparten tamaño y dataset pero difieren en la estrategia de normalización. No se dispone de resultados de rendimiento para establecer una comparación cuantitativa.

| Modelo | Normalización | Parámetros | Contexto | Licencia |
|---|---|---|---|---|
| TinyTransformer-Baseline-18M | Ninguna | 18.455.552 | no disponible | openmdw-1.1 |
| TinyTransformer-Pre-LayerNorm-18M | Pre-LayerNorm | 18.455.552 | no disponible | openmdw-1.1 |
| TinyTransformer-Post-LayerNorm-18M | Post-LayerNorm | 18.455.552 | no disponible | openmdw-1.1 |
| TinyTransformer-Pre-RMSNorm-18M | Pre-RMSNorm | 18.455.552 | no disponible | openmdw-1.1 |
| TinyTransformer-Post-RMSNorm-18M | Post-RMSNorm | 18.455.552 | no disponible | openmdw-1.1 |

No se dispone de información sobre otros modelos comparables fuera de esta serie.

## Limitaciones y advertencias

- Modelo extremadamente pequeño (18M parámetros), con capacidad limitada para tareas complejas de lenguaje; su rendimiento en generación de texto será notablemente inferior al de modelos de cientos de millones o miles de millones de parámetros.
- Entrenado exclusivamente en inglés y sobre el dominio restringido de TinyStories, por lo que su vocabulario y estilo están limitados a narrativas infantiles simples.
- Al no incluir normalización, puede presentar inestabilidad numérica durante el entrenamiento o la inferencia, lo que podría afectar a la calidad de las salidas en algunos casos.
- No se han publicado evaluaciones de sesgos o alucinaciones; como todo modelo de lenguaje, puede generar contenido incoherente o factualmente incorrecto.
- La licencia OpenMDW-1.1 debe revisarse antes de un uso comercial; aunque es permisiva, conviene verificar sus términos específicos en openmdw.ai/license/1-1/.
- No se proporcionan pesos cuantizados ni información sobre la longitud de contexto, lo que limita su uso directo en aplicaciones que requieran ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aplominski/TinyTransformer-Baseline-18M-TinyStories
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper "Attention Is All You Need": https://arxiv.org/abs/1706.03762
- Paper "Layer Normalization": https://arxiv.org/abs/1607.06450
- Paper "Root Mean Square Layer Normalization": https://arxiv.org/abs/1910.07467
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
