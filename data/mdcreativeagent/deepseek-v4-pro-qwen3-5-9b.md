# mdcreativeagent/DeepSeek-V4-Pro-Qwen3.5-9B

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B es un ajuste fino (fine-tune) de tipo destilación sobre el modelo base Qwen3.5-9B, publicado por el usuario mdcreativeagent en Hugging Face. El modelo se entrena a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con el objetivo de transferir capacidades de razonamiento estructurado y resolución de problemas matemáticos y STEM a un modelo compacto de aproximadamente 9.650 millones de parámetros. La relevancia del lanzamiento radica en que concentra la señal de supervisión en matemáticas y ciencia, manteniendo la eficiencia y la facilidad de despliegue propias de la clase 9B.

El repositorio contiene el checkpoint completo en formato transformers con pesos safetensors, con un tamaño de 19,3 GB. La model card indica que las variantes MTP en GGUF y el proyector de visión se publican en un repositorio separado (DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF), lo que sugiere que el modelo base Qwen3.5 incorpora capacidades multimodales de imagen-texto, aunque el fine-tune se orienta principalmente a generación de texto y razonamiento.

El modelo declara soporte para inglés, chino, coreano, japonés, español y ruso, licencia Apache 2.0 y compatibilidad con transformers, text-generation-inference, vLLM (evaluado en NVFP4) y llama.cpp (evaluado en MTP-Q8_0). No se han publicado resultados de benchmarks en la información disponible, por lo que las afirmaciones de rendimiento deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B); soporte de MTP (multi-token prediction) segun tags |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (evaluado en vLLM); Q8_0 (evaluado en llama.cpp MTP); otras no disponibles |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de aproximadamente 9,65 mil millones de parámetros. El fine-tune se realiza mediante destilación desde DeepSeek-V4-Pro en modo "Max Effect": se generan respuestas del profesor y se usan como señal supervisada (SFT) sobre el alumno. La model card menciona además etapas de RL y GSPO (Group Sequence Policy Optimization) entre las etiquetas del repositorio, aunque no se detalla la configuración exacta de esas etapas. El conjunto de entrenamiento se centra en aproximadamente 250.000 muestras de matemáticas y STEM.

La model card destaca que, pese a no incluir datos específicos de código en el SFT, se observan pequeñas mejoras en programación y uso de herramientas, lo que sugiere transferencia cruzada entre dominios. También se menciona el uso de MTP (multi-token prediction) como técnica de decodificación evaluada en el despliegue con llama.cpp, y la evaluación en vLLM con cuantización NVFP4. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de la cifra aproximada de muestras.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso.
- Razonamiento matemático y resolución de problemas STEM, foco principal del entrenamiento.
- Razonamiento estructurado con descomposición de problemas, aprendido por destilación del profesor.
- Soporte de tool calling y function calling (etiquetas `tool-use`, `function-calling`).
- Capacidades multimodales de imagen-texto heredadas del modelo base (pipeline `image-text-to-text`), con proyector de visión en repositorio separado.
- Soporte multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (thinking) implícito en la destilación de un profesor con modo "Max Effect"; no se detalla el mecanismo exacto de activación.
- Compatibilidad con text-generation-inference y endpoints compatibles.

## Casos de uso

- Tutoría de matemáticas y ciencias: el modelo puede descomponer problemas de álgebra, cálculo o física en pasos intermedios y explicar el razonamiento, aprovechando las ~250.000 muestras de entrenamiento centradas en STEM.
- Generación de soluciones paso a paso en entornos educativos: útil para plataformas que necesitan respuestas con justificación detallada y no solo el resultado final.
- Asistente de investigación en dominios científicos: puede resumir y razonar sobre problemas técnicos en inglés, chino, español y otros idiomas soportados, con despliegue en vLLM para servir múltiples peticiones.
- Automatización de soporte técnico con tool calling: integrable en pipelines que requieran llamadas a funciones externas (APIs, calculadoras, bases de datos) gracias al soporte de function calling.
- Evaluación de razonamiento en producción con cuantización NVFP4: el modelo ha sido evaluado en vLLM con NVFP4, lo que permite desplegarlo en GPUs con menor huella de memoria manteniendo el formato de checkpoint completo.
- Despliegue en entornos con llama.cpp y MTP-Q8_0: adecuado para inferencia en hardware consumer o servidores sin GPUs de gran VRAM, usando la variante GGUF publicada en el repositorio separado.
- Generación de código asistida: aunque no se entrenó específicamente en código, la model card reporta pequeñas mejoras en programación por transferencia, por lo que puede usarse como asistente de código en tareas moderadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto corto.
- VRAM estimada con cuantización Q8_0 (GGUF): aproximadamente 10-11 GB para pesos, viable en GPUs de 12-16 GB.
- VRAM estimada con NVFP4: aproximadamente 5-6 GB para pesos, según el formato evaluado en vLLM; requiere soporte de NVFP4 en la GPU (arquitecturas Blackwell o equivalentes).
- GPUs recomendadas: A100 40/80 GB, H100 para despliegue en vLLM a gran escala; RTX 4090 (24 GB) para BF16 con contexto moderado; RTX 3090/4080 (16-24 GB) para Q8_0.
- Cabe en GPU consumer: sí, en RTX 4090 con BF16 y en GPUs de 12-16 GB con Q8_0 o NVFP4.
- Opciones de despliegue: transformers, text-generation-inference, vLLM (NVFP4 evaluado), llama.cpp (MTP-Q8_0 evaluado), Ollama potencialmente a través de GGUF del repositorio separado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B | 9,65 B | no disponible | Apache 2.0 | Hugging Face (transformers, GGUF separado) | Destilado de DeepSeek-V4-Pro, foco STEM |
| Qwen3.5-9B (base) | ~9 B | no disponible | no disponible en la información | Hugging Face (unsloth/Qwen3.5-9B) | Modelo base sin destilación |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | no disponible | Profesor de la destilación, modo Max Effect |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que las afirmaciones de mejora en matemáticas, STEM y código no están cuantificadas de forma verificable.
- El modelo es un fine-tune de destilación sobre Qwen3.5-9B; hereda los sesgos y limitaciones del modelo base, que no se detallan en la model card.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en dominios fuera del entrenamiento STEM.
- La longitud de contexto no está especificada; no se debe asumir una ventana mayor que la del modelo base sin verificación.
- El soporte multilingüe declarado (en, zh, ko, ja, es, ru) no garantiza calidad uniforme en todos los idiomas; el entrenamiento se centra en matemáticas y STEM, probablemente en inglés y chino.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3.5-9B y de los datos de destilación de DeepSeek-V4-Pro, ya que la model card no detalla restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- El autor (mdcreativeagent) no es el desarrollador original de Qwen3.5 ni de DeepSeek; la calidad del fine-tune no está respaldada por una organización conocida.
- La model card menciona colaboración con un ingeniero de hardware (Kyle Hessling) y el uso de infraestructura de entrenamiento, pero no se detallan los recursos exactos.

## Enlaces

- Hugging Face: https://huggingface.co/mdcreativeagent/DeepSeek-V4-Pro-Qwen3.5-9B
- Repositorio GGUF MTP: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
