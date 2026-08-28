# Oscilla/LFM2.5-350M-mlx-4Bit

## Resumen

Oscilla/LFM2.5-350M-mlx-4Bit es una conversión al formato MLX (Apple Silicon) del modelo base LiquidAI/LFM2.5-350M, desarrollado por Liquid AI. Se trata de un modelo de lenguaje compacto de 350 millones de parámetros (aunque el archivo safetensors cuantizado muestra 55,4 millones de parámetros almacenados), diseñado específicamente para inferencia en dispositivos de borde (edge) y entornos con recursos limitados. La conversión fue realizada por el usuario Oscilla utilizando mlx-lm versión 0.31.2, y el resultado es un modelo cuantizado a 4 bits que ocupa aproximadamente 0,2 GB.

El modelo base LFM2.5-350M se basa en la arquitectura híbrida LFM2 de Liquid AI, que combina capas convolucionales y de atención para lograr un procesamiento eficiente de contextos largos. Según el blog oficial de Liquid AI, esta versión 2.5 incorpora un pre-entrenamiento ampliado (de 10 a 28 billones de tokens) y un entrenamiento con aprendizaje por refuerzo a gran escala, lo que mejora significativamente su rendimiento respecto a la versión anterior. El modelo soporta nueve idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano, español y portugués) y tiene una longitud de contexto de 4096 tokens.

Esta ficha se centra en la variante MLX 4-bit, que está pensada para ejecutarse en hardware Apple (chips M1/M2/M3/M4) mediante la librería mlx-lm. Su relevancia radica en que ofrece capacidades de generación de texto de calidad aceptable en dispositivos con poca memoria, como portátiles o incluso teléfonos, a una velocidad de inferencia muy alta (313 tokens por segundo en CPU AMD, 188 en Snapdragon Gen4, según datos del blog).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (capas convolucionales + atención) basada en LFM2 |
| Parametros totales | 350M (modelo base); 55.443.200 en safetensors cuantizado 4-bit |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt |
| Licencia | lfm1.0 (otra) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-350M emplea la arquitectura LFM2 de Liquid AI, que combina capas convolucionales con mecanismos de atención. Esta hibridación permite procesar secuencias largas con un coste computacional reducido en comparación con transformers puramente basados en atención, lo que resulta especialmente adecuado para entornos con restricciones de memoria y potencia. El modelo fue pre-entrenado con 28 billones de tokens (frente a los 10 billones de la versión anterior) y posteriormente refinado mediante aprendizaje por refuerzo a gran escala, lo que mejora su capacidad de seguir instrucciones y su coherencia.

La conversión a MLX 4-bit no modifica la arquitectura subyacente, sino que cuantiza los pesos a 4 bits para reducir el tamaño del modelo y acelerar la inferencia en hardware Apple. El proceso se realizó con la herramienta mlx-lm 0.31.2, que genera pesos en formato safetensors compatible con la librería MLX. No se dispone de información detallada sobre la composición exacta del dataset de entrenamiento ni sobre las técnicas específicas de RL utilizadas, más allá de lo indicado en el blog oficial.

## Capacidades

- Generación de texto: produce respuestas coherentes y contextualmente relevantes en los nueve idiomas soportados.
- Razonamiento básico: puede resolver tareas de lógica y comprensión simples, aunque con limitaciones propias de un modelo de 350M.
- Multilingüismo: cubre inglés, árabe, chino, francés, alemán, japonés, coreano, español y portugués, con capacidad de cambiar de idioma en una misma conversación.
- Eficiencia en edge: diseñado para ejecutarse en dispositivos con menos de 1 GB de memoria, alcanzando velocidades de decodificación de 313 tok/s en CPU AMD y 188 tok/s en Snapdragon Gen4 (según el blog de Liquid AI).
- Compatibilidad con chat: soporta plantillas de chat (chat template) para uso conversacional, como se muestra en el ejemplo de uso con mlx-lm.
- Inferencia en Apple Silicon: gracias a la conversión MLX, puede ejecutarse de forma nativa en chips M1/M2/M3/M4 con aceleración por Metal.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo puede gestionar diálogos multi-turno con una ventana de contexto de 4096 tokens, suficiente para mantener conversaciones fluidas sin agotar la memoria del dispositivo. Su bajo consumo (menos de 1 GB) lo hace viable en smartphones y tablets.
- Generación de texto en tiempo real para aplicaciones de escritura asistida: al ser muy rápido en inferencia (313 tok/s en CPU), puede usarse para autocompletar frases o generar borradores en editores de texto sin necesidad de GPU dedicada.
- Traducción automática ligera: al soportar nueve idiomas, puede emplearse como motor de traducción básico en aplicaciones offline, aunque con menor calidad que modelos más grandes.
- Chatbots de atención al cliente en entornos con recursos limitados: empresas que despliegan soluciones en servidores de bajo coste o en las instalaciones del cliente pueden integrar este modelo para responder consultas frecuentes, aprovechando su capacidad multilingüe.
- Prototipado rápido de aplicaciones de IA: los desarrolladores pueden usar este modelo para validar ideas y flujos de trabajo antes de escalar a modelos más grandes, gracias a su facilidad de integración con mlx-lm y su reducido tamaño.
- Procesamiento de lenguaje natural en dispositivos IoT: su eficiencia permite ejecutar tareas de clasificación, extracción de entidades o resumen en dispositivos con microcontroladores o CPUs de baja potencia, siempre que se adapte el prompt adecuadamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El blog de Liquid AI menciona mejoras generales de rendimiento respecto a la versión anterior, pero no proporciona cifras concretas de MMLU, HumanEval u otros tests estandarizados. Tampoco se dispone de comparativas con otros modelos en la documentación consultada.

## Requisitos de hardware

- Memoria: el modelo cuantizado a 4 bits ocupa aproximadamente 0,2 GB en disco y requiere menos de 1 GB de RAM en tiempo de ejecución, según el blog de Liquid AI.
- GPU: diseñado para Apple Silicon (M1/M2/M3/M4) mediante MLX. También puede ejecutarse en CPU convencional (AMD, Intel) con rendimiento aceptable, como indican las cifras de 313 tok/s en CPU AMD.
- Compatibilidad con consumer GPU: no requiere GPU dedicada; funciona en cualquier Mac con chip Apple Silicon o en CPUs x86 con suficiente memoria.
- Opciones de despliegue: se puede usar con la librería mlx-lm (Python) o mediante herramientas compatibles con MLX. No se menciona soporte para vLLM, llama.cpp u Ollama en la información proporcionada, aunque el modelo base está disponible en Ollama (según el enlace encontrado).
- Latencia y throughput: según el blog, alcanza 313 tok/s en CPU AMD y 188 tok/s en Snapdragon Gen4, lo que lo hace adecuado para aplicaciones interactivas en tiempo real.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de tamaño similar (por ejemplo, TinyLlama-1.1B, Qwen2.5-0.5B o SmolLM2-360M). La información proporcionada no incluye resultados de benchmarks que permitan una comparación objetiva. Se recomienda consultar el blog de Liquid AI para obtener más detalles sobre las mejoras respecto a la versión anterior del mismo modelo.

## Limitaciones y advertencias

- Tamaño reducido: al ser un modelo de 350M, su capacidad de razonamiento complejo, comprensión de matices y generación de texto extenso es limitada en comparación con modelos de miles de millones de parámetros.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados o poco representados en sus datos de entrenamiento.
- Contexto limitado: la ventana de 4096 tokens puede ser insuficiente para tareas que requieran procesar documentos largos o mantener conversaciones muy extensas.
- Cobertura idiomática parcial: aunque soporta nueve idiomas, la calidad puede variar significativamente entre ellos; los idiomas con menos representación en el entrenamiento probablemente tengan peor rendimiento.
- Licencia lfm1.0: es una licencia personalizada de Liquid AI. Antes de usar el modelo en producción comercial, es necesario revisar los términos exactos de la licencia, que pueden incluir restricciones de uso o atribución.
- Formato MLX específico: esta variante solo es compatible con el ecosistema MLX de Apple. Para otros entornos (CUDA, ROCm, etc.) se debe usar el modelo base en formato original.
- Sin garantía de soporte: al ser una conversión de terceros (Oscilla), no hay garantía de mantenimiento o actualizaciones por parte de Liquid AI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oscilla/LFM2.5-350M-mlx-4Bit
- Modelo base (LiquidAI/LFM2.5-350M): https://huggingface.co/LiquidAI/LFM2.5-350M
- Conversión oficial MLX de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M-MLX-4bit
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Página en Ollama: https://ollama.com/LiquidAI/lfm2.5-350m
- Herramienta de conversión mlx-lm: https://github.com/ml-explore/mlx-lm
