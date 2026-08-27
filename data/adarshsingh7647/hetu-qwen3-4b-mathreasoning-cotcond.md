# AdarshSingh7647/HETU-Qwen3-4B-MathReasoning-CotCond

## Resumen

HETU-Qwen3-4B-MathReasoning-CotCond es un modelo de lenguaje especializado en razonamiento matemático, desarrollado por AdarshSingh7647 como parte de la suite HETU (Hints Enable True Understanding). Se trata de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-4B, en el que se han fusionado los pesos del adaptador LoRA con los pesos base para obtener un modelo final completo en formato bf16. Su objetivo es mejorar el rendimiento en tareas de matemáticas como AIME, GSM8K, MATH-500, Omni-MATH, GPQA-Diamond y MMLU.

La innovación principal del modelo reside en su método de entrenamiento, denominado CotCond (Conditioning on Chain-of-Thought), que utiliza una señal de condicionamiento compacta en lugar de una cadena de razonamiento completa generada. Esto permite un ajuste más eficiente y, según el autor, una mejor comprensión del proceso de razonamiento. El modelo tiene 4.022 millones de parámetros, lo que lo sitúa en la gama de los modelos pequeños, y está diseñado para ser ejecutado en hardware de consumo o en entornos con recursos limitados.

Relevante para desarrolladores e investigadores que necesiten un modelo de matemáticas ligero, con licencia abierta (aunque no especificada en la ficha) y que pueda integrarse en pipelines de razonamiento, evaluación o asistencia a estudiantes. Al estar basado en Qwen3, hereda las capacidades multilingües y de generación de texto del modelo original, aunque el foco aquí es matemático.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basada en Qwen3-4B, con atención QKV y MLP estándar |
| Parametros totales | 4.022.468.096 (4.02B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (heredado del base, típicamente 32.768 tokens, pero no confirmado) |
| Tipos de cuantizacion | no disponible (el modelo se publica en bf16) |
| Idiomas soportados | no disponible (se hereda del Qwen3-4B, que soporta múltiples idiomas, pero no se confirma) |
| Licencia | no disponible (no se especifica en la model card) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base Qwen/Qwen3-4B, que es un transformer decoder-only con aproximadamente 4 mil millones de parámetros. Qwen3-4B es una versión pequeña de la familia Qwen3, diseñada para eficiencia y despliegue en entornos con restricciones de recursos. El método de entrenamiento aplicado en HETU es el denominado CotCond, que se describe como un condicionamiento sobre una señal compacta en lugar de una cadena de pensamiento completa. Esto implica que el modelo recibe una pista o señal resumida que guía el razonamiento, en lugar de una explicación detallada generada token a token. Este enfoque busca reducir el coste computacional del entrenamiento y, a la vez, mejorar la capacidad de razonamiento matemático al inducir una comprensión más profunda de los pasos necesarios.

El entrenamiento se realizó mediante un adaptador LoRA sobre el modelo base, que posteriormente se fusionó para obtener el modelo final. No se especifican el número de tokens de entrenamiento, el dataset exacto (aunque se mencionan tareas como AIME, GSM8K, MATH-500, Omni-MATH, GPQA-Diamond y MMLU, que probablemente sirven como conjunto de evaluación), ni si se aplicaron técnicas de RLHF o DPO. La información disponible no detalla el proceso de entrenamiento más allá de la mención al método CotCond y al uso de LoRA.

## Capacidades

- Razonamiento matemático: especializado en problemas de matemáticas de nivel competitivo (AIME, GSM8K, MATH-500, Omni-MATH, GPQA-Diamond, MMLU).
- Generación de texto: al estar basado en Qwen3, conserva la capacidad de generar texto fluido en múltiples idiomas, aunque el entrenamiento se centra en matemáticas.
- Razonamiento paso a paso: gracias al condicionamiento CotCond, el modelo puede producir cadenas de razonamiento (chain-of-thought) para explicar sus respuestas.
- Sin soporte de tool calling: no se menciona en la documentación; probablemente no está habilitado.
- Sin soporte de agentes multi-paso: no se ha reportado, aunque el modelo podría integrarse en pipelines externos.
- Capacidades multilingües: heredadas de Qwen3, pero no confirmadas específicamente para este modelo.
- Sin modo thinking explícito: no se documenta un modo de razonamiento extendido como en Qwen3-Thinking.

## Casos de uso

- Asistencia educativa en matemáticas: el modelo puede resolver problemas de álgebra, geometría, cálculo y combinatoria, proporcionando explicaciones paso a paso. Es adecuado para plataformas de tutoría automática.
- Generación de problemas de práctica: se puede usar para crear ejercicios matemáticos con soluciones razonadas, aprovechando su entrenamiento en conjuntos como GSM8K y MATH.
- Evaluación de modelos matemáticos: como referencia en benchmarks de razonamiento matemático para comparar con otros modelos de tamaño similar.
- Integración en pipelines de razonamiento: al ser un modelo pequeño (4B), puede ejecutarse en entornos con recursos limitados, por ejemplo, en un servidor con una RTX 4090 o incluso en CPU con cuantización (aunque no se ofrecen pesos GGUF).
- Análisis de problemas matemáticos en lenguaje natural: puede extraer la estructura de un problema, identificar variables y plantear ecuaciones.
- Asistencia en investigación: para verificar demostraciones matemáticas o explorar soluciones a problemas abiertos, aunque su tamaño limita la complejidad de los problemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo se evalúa en AIME, GSM8K, MATH-500, Omni-MATH, GPQA-Diamond y MMLU, pero no proporciona números concretos. No se pueden comparar con otros modelos sin datos verificados.

## Requisitos de hardware

- VRAM estimada: para inferencia en bf16 con 4B parámetros, se necesitan aproximadamente 8 GB de VRAM (considerando pesos y memoria de activaciones). Con cuantización a 4 bits (si se convierte a GGUF) se podría reducir a ~3-4 GB.
- GPU recomendadas: una NVIDIA RTX 3090, RTX 4090, A100, o cualquier GPU con al menos 8 GB de VRAM. En consumer GPU, una RTX 3060 de 12 GB puede funcionar.
- Despliegue: compatible con Hugging Face Transformers, vLLM, TGI, y llama.cpp si se convierte a GGUF. También se puede usar con Ollama si se convierte.
- Latencia: en una GPU moderna, se espera una latencia de decodificación de ~20-30 tokens/s para este tamaño, dependiendo del hardware y la optimización.

## Comparativa con modelos similares

No hay información suficiente para comparar directamente con otros modelos de matemáticas, como winglian/qwen3-4b-math (fine-tuning de Qwen3-4B con OpenThoughts-114k-math-correct) o el propio Qwen3-4B. Se recomienda consultar los benchmarks publicados en el paper HETU para una comparación formal, aunque no se han proporcionado en la información disponible.

## Limitaciones y advertencias

- Sesgos: al ser un fine-tuning de Qwen3, hereda los posibles sesgos del modelo base, aunque no se han documentado específicamente.
- Alucinación: como todo modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en problemas matemáticos complejos. Se recomienda verificar los resultados.
- Contexto limitado: no se especifica la longitud de contexto, pero si se hereda de Qwen3-4B, probablemente sea 32K tokens, suficiente para problemas largos.
- Licencia: la licencia no está indicada en la model card. No se puede garantizar el uso comercial sin aclaración. Se recomienda contactar al autor.
- Disponibilidad: el modelo tiene 0 descargas y 0 likes, por lo que es un proyecto reciente y no validado por la comunidad.
- No se proporcionan pesos cuantizados (GGUF, etc.) ni instrucciones de despliegue específicas.

## Enlaces

- Modelo en Hugging Face: [AdarshSingh7647/HETU-Qwen3-4B-MathReasoning-CotCond](https://huggingface.co/AdarshSingh7647/HETU-Qwen3-4B-MathReasoning-CotCond)
- Modelo base Qwen3-4B: [Qwen/Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B)
- Repositorio oficial de Qwen3: [GitHub QwenLM/Qwen3](https://github.com/QwenLM/Qwen3)
- Blog de Qwen3: [Qwen blog](https://qwen.ai/blog?id=qwen3)
- Paper HETU: no disponible en la información proporcionada (se menciona que existe, pero no se incluye el enlace).
