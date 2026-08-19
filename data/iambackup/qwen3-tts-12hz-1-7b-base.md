# Iambackup/Qwen3-TTS-12Hz-1.7B-Base

## Resumen

Qwen3-TTS-12Hz-1.7B-Base es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo de Qwen (Alibaba), aunque este repositorio concreto es un reupload del usuario Iambackup. Se trata de la variante base de 1.700 millones de parámetros (1.928.677.440 en total) de la familia Qwen3-TTS, diseñada para clonación rápida de voz a partir de tan solo tres segundos de audio de referencia y para servir como punto de partida para fine-tuning. El modelo emplea una arquitectura de modelo de lenguaje discreto multi-codebook con un tokenizador acústico de 12 Hz, lo que permite una compresión eficiente y una reconstrucción de alta fidelidad sin depender de arquitecturas DiT tradicionales.

La relevancia de este modelo radica en su capacidad para generar voz con baja latencia (el primer paquete de audio puede emitirse tras un solo carácter, con una latencia extremo a extremo de 97 ms) y en su soporte multilingüe para diez idiomas principales. Además, su licencia Apache 2.0 facilita su uso comercial y su integración en productos. Al ser la versión base, no incluye control por instrucciones (a diferencia de las variantes CustomVoice y VoiceDesign), pero sí ofrece streaming y clonación de voz, lo que lo convierte en una opción atractiva para sistemas de voz en tiempo real y aplicaciones personalizadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook (Qwen3-TTS) con tokenizador acústico de 12 Hz |
| Parametros totales | 1.928.677.440 (1,93 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | Chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura de modelo de lenguaje discreto multi-codebook, que modela directamente la señal de voz como secuencias de códigos discretos generados por el tokenizador Qwen3-TTS-Tokenizer-12Hz. Este enfoque evita los cuellos de botella de información y los errores en cascada típicos de los esquemas LM+DiT, logrando una generación extremo a extremo más eficiente y con mayor techo de rendimiento. La arquitectura soporta generación en streaming y no streaming mediante un diseño híbrido de doble vía, lo que permite emitir el primer paquete de audio inmediatamente después de procesar un solo carácter.

No se han proporcionado detalles específicos sobre el entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la información disponible. La model card indica que esta variante base está pensada para fine-tuning, lo que sugiere que fue entrenada con un corpus amplio y diverso de voz y texto, pero no se ofrecen cifras concretas. Tampoco se mencionan innovaciones adicionales más allá de las ya citadas (tokenizador de 12 Hz, arquitectura no DiT, streaming de baja latencia).

## Capacidades

- Síntesis de voz (TTS) en diez idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Clonación de voz rápida: es capaz de replicar una voz a partir de solo tres segundos de audio de entrada.
- Generación en streaming de baja latencia: puede emitir el primer paquete de audio tras un solo carácter, con una latencia extremo a extremo de 97 ms.
- Comprensión contextual del texto: ajusta tono, ritmo y expresión emocional basándose en la semántica del texto de entrada (aunque esta capacidad está más desarrollada en las variantes con control por instrucciones).
- Robustez ante texto ruidoso o mal formateado, mejorando la calidad de síntesis en entornos reales.
- Soporte para fine-tuning: al ser un modelo base, puede adaptarse a voces o dominios específicos mediante entrenamiento adicional.

## Casos de uso

- Asistentes virtuales personalizados: el modelo puede clonar la voz de un usuario con solo tres segundos de muestra, permitiendo que un asistente hable con la voz del propio usuario. Su capacidad de streaming garantiza respuestas de voz casi instantáneas en interacciones conversacionales.
- Audiolibros multilingües: gracias al soporte de diez idiomas y a la comprensión contextual, puede generar narraciones naturales y expresivas para libros, artículos o documentos, adaptando la entonación al contenido.
- Doblaje automático de vídeos: la clonación de voz y el control de prosodia permiten doblar contenido audiovisual manteniendo la voz original del hablante, lo que resulta útil para creadores de contenido y plataformas de vídeo.
- Atención al cliente automatizada: la baja latencia de streaming (97 ms) y la generación de voz natural hacen que el modelo sea adecuado para sistemas IVR o chatbots de voz que requieren respuestas fluidas y en tiempo real.
- Accesibilidad para personas con discapacidad visual: puede convertir texto digital en voz de alta calidad, facilitando la lectura de pantallas, documentos o interfaces en múltiples idiomas.
- Creación de contenido educativo: permite generar locuciones para cursos online, tutoriales o podcasts con voces naturales y expresivas, personalizables mediante fine-tuning para una marca o estilo concreto.
- Fine-tuning para voces de marca: al ser un modelo base, las empresas pueden entrenarlo con datos propios para obtener una voz corporativa consistente en todos sus canales de comunicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K (propias de modelos de lenguaje general), ni métricas específicas de TTS como MOS (Mean Opinion Score) o latencia comparativa. Por tanto, no es posible ofrecer una tabla de rendimiento objetiva en este momento.

## Requisitos de hardware

No se han proporcionado requisitos oficiales de hardware en la información disponible. No obstante, basándose en el tamaño del modelo (1,93 B parámetros) y el formato safetensors, se puede estimar de forma orientativa:

- VRAM estimada para inferencia: aproximadamente 4-6 GB en FP16 (sin cuantización). Con cuantización a 8 bits podría reducirse a 2-3 GB, aunque no se han publicado versiones cuantizadas.
- GPU recomendadas: una GPU de consumo como la RTX 3060 (12 GB) o superior sería suficiente para inferencia en FP16. Para despliegue en producción con múltiples peticiones concurrentes, se recomienda una GPU profesional como A10, A100 o H100.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo con al menos 6 GB de VRAM, lo que permite ejecutarlo en equipos personales.
- Opciones de despliegue: al ser un modelo TTS, no se mencionan integraciones específicas con vLLM, llama.cpp u Ollama. La model card sugiere el uso del paquete `qwen-tts` o vLLM para cargar los pesos, por lo que es probable que sea compatible con estos frameworks, aunque no se detalla.
- Latencia y throughput: la latencia extremo a extremo declarada es de 97 ms en modo streaming, pero no se ofrecen cifras de throughput para inferencia por lotes.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos TTS en la información proporcionada. Existen alternativas conocidas en el mercado como VITS, Tortoise TTS o XTTS, pero no se han publicado comparaciones directas de rendimiento, calidad de voz o latencia con Qwen3-TTS. Por tanto, no es posible elaborar una tabla comparativa objetiva en este momento.

## Limitaciones y advertencias

- La variante Base no incluye control por instrucciones (a diferencia de las versiones CustomVoice y VoiceDesign), por lo que no se puede dirigir explícitamente el timbre, la emoción o la prosodia mediante comandos de texto.
- El modelo solo soporta diez idiomas; no cubre otros idiomas o dialectos fuera de esa lista.
- No se han documentado sesgos específicos, pero como todo modelo de TTS entrenado con datos de voz, puede reflejar sesgos de género, edad o acento presentes en los datos de entrenamiento.
- Existe riesgo de alucinación en el habla, es decir, el modelo podría generar palabras o sonidos que no están en el texto de entrada, especialmente con entradas ruidosas o ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos completos y verificar que el reupload de Iambackup no introduce restricciones adicionales.
- Al ser un reupload no oficial, no hay garantía de que los pesos sean idénticos a los publicados por Qwen. Se recomienda descargar desde el repositorio oficial de Qwen (Qwen/Qwen3-TTS-12Hz-1.7B-Base) para entornos de producción.
- No se proporcionan detalles sobre el entrenamiento (datos, tokens, metodología), lo que dificulta evaluar posibles problemas de sesgo o calidad en dominios específicos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Iambackup/Qwen3-TTS-12Hz-1.7B-Base
- Paper técnico (referenciado en los tags): arxiv:2601.15621
- Repositorio oficial de Qwen (para descarga de pesos originales): https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base (no verificado, pero se menciona en la model card)
