# rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_arc_3407

## Resumen

`rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_arc_3407` es un ajuste fino supervisado (SFT) del modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, publicado por el usuario rghosh8 en Hugging Face. Se trata de un checkpoint experimental de tipo "baseline" entrenado con la librería TRL sobre el modelo destilado de DeepSeek, que a su vez es una destilación de la familia R1 de DeepSeek sobre la arquitectura Qwen2 de 1.500 millones de parámetros. El nombre del repositorio sugiere un entrenamiento sobre el conjunto de datos ARC con semilla 3407, aunque la model card no aporta detalles sobre la composición del dataset.

El modelo conserva la arquitectura transformer decoder-only de Qwen2, con 1.777.088.000 parámetros totales según los pesos en safetensors, y está orientado a generación de texto conversacional. Al derivar de DeepSeek-R1-Distill-Qwen, hereda la capacidad de razonamiento en cadena de pensamiento (chain-of-thought) que caracteriza a la familia R1, aunque el ajuste SFT puede haber alterado o reforzado ese comportamiento.

La relevancia de esta ficha es limitada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin licencia declarada explícitamente (la model card incluye un campo `licence: license` sin contenido real) y sin información sobre idiomas, benchmarks o datos de entrenamiento. Es útil como referencia para quienes reproducen experimentos de SFT sobre modelos pequeños de razonamiento, pero no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye `licence: license` sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, que a su vez es un modelo destilado de la familia DeepSeek-R1 sobre la arquitectura Qwen2. La arquitectura subyacente es un transformer decoder-only con atención causal estándar, sin mezcla de expertos (MoE), con 1.777 millones de parámetros. El entrenamiento se realizó con TRL 1.15.0, Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 5.1.0 y Tokenizers 0.23.3, según la model card.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El nombre del repositorio (`arc_3407`) sugiere el uso del conjunto de datos ARC (AI2 Reasoning Challenge) con semilla 3407, pero esta inferencia no está confirmada por el autor. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el modelo hereda las características del base, incluyendo el modo de razonamiento con cadenas de pensamiento que DeepSeek-R1-Distill incorpora.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte para el formato de chat de Qwen2.
- Razonamiento en cadena de pensamiento (chain-of-thought) heredado del modelo base DeepSeek-R1-Distill, aunque el SFT puede haber modificado su intensidad o formato.
- Capacidad de resolver problemas de razonamiento matemático y lógico, presumiblemente reforzada si el entrenamiento se realizó sobre ARC.
- Soporte de tool calling / function calling: no documentado en la model card; no se puede confirmar.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo de pensamiento del base lo hace plausible, pero no está verificado.
- Capacidades multilingües: no disponibles; el modelo base Qwen2 soporta varios idiomas, pero el ajuste SFT puede haber reducido el soporte a los idiomas del dataset de entrenamiento.
- Capacidades especiales (visión, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Reproducción de experimentos de SFT: el checkpoint sirve como baseline para comparar el efecto de distintos datasets o hiperparámetros sobre el modelo DeepSeek-R1-Distill-Qwen-1.5B, dado que el nombre indica una configuración concreta (ARC, semilla 3407).
- Investigación en destilación y razonamiento: permite estudiar cómo el ajuste supervisado sobre datos de razonamiento afecta al comportamiento de cadena de pensamiento del modelo base, comparando respuestas antes y después del SFT.
- Generación de texto en entornos con recursos limitados: con 1.777 millones de parámetros, el modelo cabe en GPUs de consumo (por ejemplo, RTX 3060 de 12 GB en fp16 o cuantizado en 8 bits) y puede ejecutarse en local para pruebas de concepto.
- Prototipado de asistentes conversacionales: el formato de chat de Qwen2 y la pipeline de transformers permiten integrarlo rápidamente en demos de atención al cliente o asistentes de preguntas y respuestas, siempre que se valide su calidad tras el SFT.
- Evaluación de riesgos de alucinación en modelos pequeños de razonamiento: útil para estudiar la fiabilidad de las cadenas de pensamiento en modelos de 1.5B y comparar con versiones más grandes de la familia R1.
- Fine-tuning posterior (continuado): al ser un checkpoint SFT, puede servir como punto de partida para un segundo ajuste con DPO o RLHF en experimentos académicos, aunque la licencia no declarada supone un riesgo legal para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización 8 bits: alrededor de 2 GB para pesos; en 4 bits, aproximadamente 1 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput; cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 y superiores; también en GPUs con 8 GB si se cuantiza.
- Opciones de despliegue: transformers (pipeline de text-generation), vLLM, TGI (el tag `text-generation-inference` está presente), llama.cpp u Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_arc_3407 | 1.777 M | no disponible | no disponible | Hugging Face (0 descargas) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1.777 M | no disponible en esta ficha | MIT (modelo base original) | Hugging Face, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1.543 M | 32.768 tokens (según documentación de Qwen) | Apache 2.0 | Hugging Face, muy extendido |
| Llama-3.2-1B-Instruct | 1.240 M | 128.000 tokens (según documentación de Meta) | Llama 3.2 Community License | Hugging Face, ampliamente usado |

La comparativa se limita a parámetros y licencia porque no hay benchmarks publicados para este checkpoint. El modelo base DeepSeek-R1-Distill-Qwen-1.5B es la referencia directa; Qwen2.5-1.5B-Instruct y Llama-3.2-1B-Instruct son alternativas de tamaño similar con licencias claras y contextos documentados.

## Limitaciones y advertencias

- Licencia no declarada: la model card incluye `licence: license` sin especificar términos; no se puede asumir uso comercial permitido. El modelo base DeepSeek-R1-Distill-Qwen-1.5B tiene licencia MIT, pero el autor del fine-tune no la ha heredado explícitamente.
- Sin información sobre el dataset de entrenamiento: se desconoce la composición, el número de tokens y si hubo filtrado de datos, lo que impide evaluar sesgos introducidos por el SFT.
- Riesgo de alucinación: los modelos de 1.5B de la familia R1 tienden a generar cadenas de pensamiento plausibles pero incorrectas; el SFT sobre ARC puede reforzar respuestas a problemas de ese dominio sin garantizar generalización.
- Idiomas no documentados: el ajuste puede haber degradado el multilingüismo del modelo base si el dataset era monolingüe (inglés, presumiblemente).
- Contexto no confirmado: no se especifica la longitud de contexto efectiva tras el SFT; el modelo base Qwen2 soporta ventanas amplias, pero el ajuste podría no haber sido entrenado para aprovecharlas.
- Cero adopción y validación externa: con 0 descargas y 0 likes, no hay evidencia de que el checkpoint funcione correctamente fuera del entorno del autor; el nombre "baseline" sugiere que es un punto de comparación, no un modelo pulido.
- Fecha de creación futura (2026-11-01): el timestamp del repositorio es posterior a la fecha actual, lo que puede indicar un error de metadatos o un repositorio de prueba; conviene verificar la integridad antes de usarlo.
- Sin soporte de tool calling verificado: no se documenta function calling, por lo que no es adecuado para pipelines de agentes sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_arc_3407
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de DeepSeek-R1: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
