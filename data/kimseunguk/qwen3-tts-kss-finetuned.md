# kimseunguk/qwen3-tts-kss-finetuned

## Resumen

El modelo `kimseunguk/qwen3-tts-kss-finetuned` es un ajuste fino (fine-tuning) del modelo de síntesis de voz Qwen3-TTS, desarrollado por el equipo Qwen de Alibaba Cloud, sobre el dataset KSS (Korean Single Speaker). Este dataset contiene aproximadamente 12 horas de voz en coreano de una única locutora, lo que convierte a este modelo en una opción especializada para generar habla en coreano con una voz consistente y natural, partiendo de la arquitectura base de Qwen3-TTS de 1.7B parámetros (el peso total real es de 1.916.676.352 parámetros, incluyendo el tokenizador y posibles componentes adicionales).

Qwen3-TTS es una familia de modelos de texto a voz de código abierto que destaca por su arquitectura de LM discreto multi-codebook, capaz de modelar información paralingüística y acústica de forma end-to-end sin depender de esquemas LM+DiT. El modelo base soporta 10 idiomas principales, pero este fine-tuning concreto se centra en el coreano, aprovechando el dataset KSS para mejorar la naturalidad y estabilidad en ese idioma. La relevancia actual radica en que ofrece una alternativa de TTS en coreano de alta calidad, con licencia Apache 2.0, lista para integración en aplicaciones de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook (Qwen3-TTS) con tokenizador Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 1.916.676.352 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa texto de entrada y genera audio; no se especifica ventana máxima) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en precisión completa, probablemente FP32 o BF16) |
| Idiomas soportados | Coreano (especializado mediante fine-tuning en KSS); el modelo base soporta 10 idiomas, pero este ajuste puede reducir la competencia en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-TTS, descrita en el informe técnico (arXiv:2601.15621). Utiliza un tokenizador de voz propio, Qwen3-TTS-Tokenizer-12Hz, que comprime la señal de audio a una frecuencia de 12 Hz con múltiples codebooks, permitiendo una reconstrucción de alta fidelidad mediante un decodificador ligero no basado en DiT. El modelo principal es un LM autoregresivo que modela secuencias discretas de audio y texto de forma conjunta, lo que elimina los cuellos de botella de los sistemas tradicionales de dos etapas.

El fine-tuning sobre KSS (Korean Single Speaker) ajusta los pesos del modelo base para adaptarse a las características acústicas y prosódicas de una única locutora coreana. No se han publicado detalles específicos sobre el proceso de entrenamiento de este fine-tuning (número de épocas, tasa de aprendizaje, etc.). El modelo base fue preentrenado con datos multilingües y posteriormente ajustado, aunque no se dispone de la composición exacta del dataset de preentrenamiento en la información proporcionada.

## Capacidades

- Generación de voz en coreano con una voz consistente, basada en el hablante del dataset KSS.
- Síntesis de voz expresiva con control de tono, ritmo y emoción mediante instrucciones en lenguaje natural (capacidad heredada del modelo base, aunque puede estar limitada por el fine-tuning).
- Soporte de streaming: el modelo base puede generar el primer paquete de audio tras un solo carácter de entrada, con latencia de extremo a extremo de hasta 97 ms.
- Clonación de voz rápida: el modelo base permite clonar una voz a partir de 3 segundos de audio de referencia, aunque este fine-tuning está orientado a una voz fija.
- Comprensión contextual del texto para adaptar la prosodia y la emoción.
- Robustez mejorada frente a texto ruidoso o con errores, según el informe técnico del modelo base.
- No se ha confirmado si este fine-tuning conserva todas las capacidades multilingües del modelo base; se espera que esté especializado en coreano.

## Casos de uso

- Asistentes de voz en coreano: integrar el modelo en un asistente virtual para generar respuestas habladas naturales y coherentes, aprovechando la baja latencia de streaming para interacciones en tiempo real.
- Audiolibros y narración: generar narración en coreano con una voz estable y agradable, adecuada para producción de contenidos de larga duración.
- Doblaje de vídeos y podcasts: sustituir o complementar voces humanas en coreano, manteniendo una consistencia tonal a lo largo de episodios completos.
- Sistemas de accesibilidad: convertir texto en voz para personas con discapacidad visual o dificultades de lectura, con una voz clara y natural en coreano.
- Generación de contenido educativo: crear lecciones de audio en coreano, explicaciones o ejercicios de pronunciación, con control de ritmo y énfasis.
- Prototipado rápido de aplicaciones TTS: al ser un modelo de 1.9B parámetros con licencia Apache 2.0, se puede desplegar en entornos de desarrollo y producción sin costes de licencia, ideal para startups o proyectos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tuning en la información disponible. El informe técnico de Qwen3-TTS (arXiv:2601.15621) incluye evaluaciones del modelo base, pero no se dispone de métricas como MOS (Mean Opinion Score) o comparativas con otros sistemas TTS para esta variante ajustada a KSS. Se recomienda realizar una evaluación propia con datos de test del dataset KSS para validar la calidad de la síntesis.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.916.676.352 parámetros en FP16, el modelo ocupa aproximadamente 3,8 GB de memoria. En FP32 serían unos 7,7 GB. Con cuantización a 8 bits, podría reducirse a ~2 GB, y a 4 bits a ~1 GB, aunque no se han publicado versiones cuantizadas de este fine-tuning.
- GPU recomendadas: una GPU consumer con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070) puede ejecutar el modelo en FP16 sin problemas. Para despliegues con mayor concurrencia, se recomienda una A10, A100 o H100.
- Sí cabe en GPU consumer: sí, con 8 GB de VRAM es suficiente para FP16.
- Opciones de despliegue: el ecosistema Qwen3-TTS se integra con el paquete `qwen-tts` y vLLM, según la documentación del modelo base. También es posible exportar a ONNX o usar llama.cpp si se convierte a GGUF, aunque no hay soporte oficial confirmado.
- Latencia y throughput: el modelo base alcanza una latencia de síntesis de extremo a extremo de hasta 97 ms en modo streaming. Para este fine-tuning no se han publicado cifras concretas, pero se espera un rendimiento similar al del modelo base de 1.7B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| kimseunguk/qwen3-tts-kss-finetuned | 1.9B | no disponible | Coreano (especializado) | Apache 2.0 | Fine-tuning sobre KSS, voz de un solo hablante |
| Qwen3-TTS-12Hz-1.7B-Base | 1.7B | no disponible | 10 idiomas | Apache 2.0 | Modelo base, soporta clonación de voz de 3 segundos |
| zero0303/qwen3-tts-ljspeech-finetuned | ~1.7B | no disponible | Inglés (especializado) | Apache 2.0 | Fine-tuning sobre LJSpeech, voz de un solo hablante |
| Qwen3-TTS-12Hz-0.6B-Base | 0.6B | no disponible | 10 idiomas | Apache 2.0 | Versión más pequeña, menor calidad pero más eficiente |

La comparativa se basa en los modelos disponibles en HuggingFace y el repositorio oficial. No se dispone de métricas de rendimiento comparativas para estos fine-tunings.

## Limitaciones y advertencias

- Especialización en coreano: el fine-tuning sobre KSS puede degradar el rendimiento en otros idiomas, aunque el modelo base sea multilingüe. Se recomienda probar con texto en otros idiomas antes de usarlo en producción.
- Voz única: el modelo está ajustado para un solo hablante (locutora del dataset KSS). No es adecuado para aplicaciones que requieran múltiples voces o clonación de voz arbitraria.
- Riesgo de alucinación prosódica: como cualquier modelo TTS, puede generar entonaciones o pausas inesperadas en textos complejos o ambiguos, especialmente con texto ruidoso.
- Sesgos: el dataset KSS contiene únicamente voz de una locutora femenina, por lo que el modelo no representa variedad de género, edad o acentos regionales del coreano.
- Sin información sobre el proceso de fine-tuning: no se han publicado detalles sobre hiperparámetros, épocas o estrategia de entrenamiento, lo que dificulta la reproducibilidad.
- Tamaño del repositorio: 12.2 GB en safetensors, lo que implica un peso de descarga considerable para despliegues en entornos con ancho de banda limitado.
- Dependencia del tokenizador: para usar el modelo es necesario descargar también el tokenizador Qwen3-TTS-Tokenizer-12Hz, que no está incluido en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kimseunguk/qwen3-tts-kss-finetuned
- Repositorio oficial Qwen3-TTS en GitHub: https://github.com/QwenLM/Qwen3-TTS
- Informe técnico Qwen3-TTS (arXiv): https://arxiv.org/pdf/2601.15621
- Ejemplo de fine-tuning de Qwen3-TTS (repositorio de la comunidad): https://github.com/iosub/AI-Qwen3-TTS/tree/main/finetuning
- Colección de fine-tunings de Qwen3-TTS para lenguas índicas: https://huggingface.co/collections/aguken-ai/qwen3-tts-indic-finetuned
- Fine-tuning similar sobre LJSpeech: https://huggingface.co/zero0303/qwen3-tts-ljspeech-finetuned
