# aiuser3993/AMD-OLMo-1B-IT

## Resumen

AMD-OLMo-1B-IT es un modelo de lenguaje de 1.176 millones de parámetros, resultado de un fine-tuning instructivo sobre el modelo AMD-OLMo-1B-SFT, desarrollado por el usuario aiuser3993. El modelo base pertenece a la familia AMD OLMo, una serie de modelos de 1B entrenados desde cero por AMD en GPUs Instinct MI250, con una arquitectura transformer decoder-only y pre-entrenados sobre 1,3 billones de tokens del dataset Dolma v1.7. Este fine-tuning específico se realizó sobre 12.000 filas aleatorias del dataset ShareGPT (conversaciones generadas con GPT-4), con el objetivo de optimizar el seguimiento de instrucciones y la escritura creativa, otorgando al modelo una personalidad muy segura.

La relevancia de este modelo radica en su tamaño compacto y su licencia Apache 2.0, que permite uso comercial sin restricciones. Al estar basado en un modelo abierto de AMD, hereda la capacidad de ejecutarse en hardware variado, incluyendo GPUs de consumo y PCs con Ryzen AI. Aunque no se publican métricas de rendimiento, su naturaleza de fine-tuning instructivo lo hace adecuado para tareas de generación de texto conversacional y creativo en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo con pesos en safetensors) |
| Idiomas soportados | No disponible (probablemente inglés, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo AMD-OLMo-1B-IT es un fine-tuning del modelo AMD-OLMo-1B-SFT, que a su vez es la versión supervisada del pre-entrenado AMD-OLMo-1B. La arquitectura base es un transformer decoder-only, entrenado desde cero por AMD sobre 1,3 billones de tokens del dataset Dolma v1.7, con un throughput de entrenamiento de 12.200 tokens por segundo por GPU. El fine-tuning aquí descrito se realizó sobre 12.000 filas aleatorias del dataset shibing624/sharegpt_gpt4, que contiene conversaciones generadas con GPT-4, con el objetivo de mejorar la capacidad de seguir instrucciones y la creatividad en la escritura. No se proporcionan detalles sobre hiperparámetros, técnicas de alineación adicionales (como RLHF o DPO) ni la composición exacta del dataset de fine-tuning.

## Capacidades

- Generación de texto conversacional y creativo, optimizado para seguir instrucciones.
- Personalidad marcada y segura en las respuestas, según la model card.
- Soporte básico de chat multi-turno, derivado del entrenamiento con datos de ShareGPT.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.
- Multilingüismo no confirmado; el dataset de fine-tuning es principalmente en inglés, aunque no se especifica.

## Casos de uso

- Asistente de escritura creativa: el modelo puede generar borradores de historias, poemas o guiones, aprovechando su fine-tuning en datos conversacionales de alta calidad. Su tamaño compacto permite ejecutarlo en portátiles con GPU básica.
- Chatbot de atención al cliente: gracias a su capacidad de seguir instrucciones y mantener conversaciones multi-turno, puede integrarse en sistemas de soporte para responder consultas frecuentes, con la ventaja de una licencia Apache 2.0 que facilita su despliegue comercial.
- Generación de contenido para redes sociales: puede producir textos breves, eslóganes o respuestas con un tono seguro y creativo, útil para marketing o community management.
- Prototipado rápido de aplicaciones de lenguaje: al ser un modelo pequeño y abierto, es ideal para validar ideas de productos que requieran generación de texto sin incurrir en costes de API.
- Asistente de estudio o aprendizaje: puede explicar conceptos, responder preguntas o generar ejemplos, aunque con las limitaciones propias de un modelo de 1B en precisión factual.
- Generación de datos sintéticos para entrenamiento: su capacidad de producir texto variado puede emplearse para aumentar datasets de entrenamiento en tareas de clasificación o extracción de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo, ni comparaciones con otros modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.176 millones de parámetros, en fp16 se requieren aproximadamente 2,3 GB; en cuantización de 8 bits, alrededor de 1,2 GB; y en 4 bits, cerca de 0,6 GB. Estas cifras son estimaciones orientativas basadas en el tamaño de parámetros, no en mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, o integradas AMD con suficiente memoria compartida). Para cuantizaciones más agresivas, incluso CPUs con 8 GB de RAM son viables.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna de gama media o baja.
- Opciones de despliegue: compatible con frameworks como vLLM, llama.cpp, Ollama y Hugging Face Transformers, dado que el formato safetensors es estándar.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. A nivel de especificaciones, se puede comparar con otros modelos de ~1B:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AMD-OLMo-1B-IT | 1,17B | No disponible | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2048 (típico) | Apache 2.0 | Hugging Face |
| Qwen2-0.5B | 0,5B | 32768 | Apache 2.0 | Hugging Face |

La comparativa se limita a parámetros y licencia; no hay datos de rendimiento para establecer una comparación justa.

## Limitaciones y advertencias

- Al ser un modelo de 1B, su precisión factual y capacidad de razonamiento complejo son limitadas en comparación con modelos más grandes; puede generar alucinaciones o respuestas incorrectas.
- El fine-tuning se realizó sobre un subconjunto aleatorio de 12.000 filas de ShareGPT, lo que puede introducir sesgos presentes en los datos originales (por ejemplo, sesgos de género, culturales o de estilo).
- La longitud de contexto no está documentada; se recomienda probar con secuencias cortas para evitar degradación de rendimiento.
- No se ha verificado el soporte multilingüe; es probable que el modelo funcione mejor en inglés.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- No se han publicado evaluaciones de seguridad o robustez; se recomienda supervisión humana en aplicaciones críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aiuser3993/AMD-OLMo-1B-IT
- Modelo base AMD-OLMo-1B-SFT: https://huggingface.co/amd/AMD-OLMo-1B-SFT
- Modelo pre-entrenado AMD-OLMo-1B: https://huggingface.co/amd/AMD-OLMo-1B
- Artículo técnico de AMD sobre los modelos OLMo: https://www.amd.com/en/developer/resources/technical-articles/introducing-the-first-amd-1b-language-model.html
- Blog de AMD sobre el lanzamiento: https://www.amd.com/en/blogs/2024/introducing-the-first-amd-1b-language-models-amd-.html
- Dataset ShareGPT GPT-4: https://huggingface.co/datasets/shibing624/sharegpt_gpt4
