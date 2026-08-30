# Rin247/Qwen3-TTS-12Hz-1.7B-CustomVoice-FP4

## Resumen

Este modelo es una versión cuantizada en FP4 (4 bits por peso) del Qwen3-TTS-12Hz-1.7B-CustomVoice, un sistema de síntesis de voz (text-to-speech) desarrollado originalmente por Alibaba Qwen. La cuantización ha sido realizada por el usuario Rin247 para reducir el peso del modelo a 1,7 GB, facilitando su despliegue en entornos con recursos limitados, como GPUs de consumo o inferencia en CPU. El modelo original forma parte de la familia Qwen3-TTS, que emplea un tokenizador de audio a 12 Hz y una arquitectura de modelo de lenguaje discreto multi-codebook, lo que permite una generación de voz de alta fidelidad con control fino de timbre, emoción y prosodia mediante instrucciones en lenguaje natural. Soporta 10 idiomas principales y ofrece 9 timbres premium predefinidos, además de generación en streaming con una latencia extremadamente baja (97 ms según la documentación oficial). Esta versión cuantizada mantiene las capacidades funcionales del modelo original, aunque con una posible ligera degradación en la calidad del audio debido a la compresión de pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook (no DiT), tokenizador de audio Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 1.167.468.800 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP4 (weight-only), tambien menciona 8-bit en los tags |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano (10 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-1.7B-CustomVoice utiliza una arquitectura de modelo de lenguaje autoregresivo discreto con múltiples codebooks, que opera sobre tokens de audio generados por el tokenizador Qwen3-TTS-Tokenizer-12Hz. Este tokenizador comprime la señal de audio a una frecuencia de 12 Hz, preservando información paralingüística y características acústicas del entorno. A diferencia de los esquemas tradicionales LM+DiT, esta arquitectura unificada de extremo a extremo evita los cuellos de botella de información y los errores en cascada, mejorando la eficiencia y la calidad de la síntesis. El modelo soporta generación en streaming y no streaming mediante una arquitectura híbrida de doble vía, y permite el control de atributos acústicos (timbre, emoción, prosodia) a través de instrucciones en lenguaje natural. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO en la información proporcionada. La versión FP4 de Rin247 es una cuantización posterior al entrenamiento que reduce el tamaño de los pesos sin modificar la arquitectura subyacente.

## Capacidades

- Generación de voz multilingüe en 10 idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Control fino de timbre, emoción y prosodia mediante instrucciones en lenguaje natural (por ejemplo, "habla con entusiasmo" o "con voz grave").
- 9 timbres premium predefinidos que cubren combinaciones de género, edad, idioma y dialecto.
- Generación en streaming con latencia de primer paquete de audio de 97 ms (según documentación oficial del modelo original).
- Comprensión semántica del texto para ajustar automáticamente el tono, el ritmo y la expresión emocional.
- Robustez mejorada frente a texto con ruido o errores tipográficos.
- No incluye clonación de voz (esa capacidad pertenece a la variante Base), pero sí permite control de estilo sobre timbres existentes.

## Casos de uso

- Atención al cliente automatizada: el modelo puede generar respuestas de voz naturales en múltiples idiomas, con control de tono y emoción para adaptarse al contexto de la conversación. Su baja latencia de streaming (97 ms) lo hace adecuado para sistemas interactivos en tiempo real.
- Audiolibros y narración de contenido: gracias al control de prosodia y emoción, puede producir narraciones expresivas para libros, artículos o noticias, con selección de timbre según el género o la edad del personaje.
- Asistentes de voz en dispositivos embebidos: al ser un modelo de 1,7B cuantizado en FP4, puede ejecutarse en GPUs de consumo o incluso en CPU con suficiente RAM, permitiendo asistentes locales sin conexión a la nube.
- Doblaje y localización de contenido multimedia: el soporte de 10 idiomas y los timbres premium facilitan la generación de voces para doblaje de vídeos, podcasts o videojuegos, con control de estilo por instrucciones.
- Accesibilidad: puede convertir texto en voz para personas con discapacidad visual o dificultades de lectura, ofreciendo voces naturales y personalizables en varios idiomas.
- Prototipado rápido de productos de voz: los desarrolladores pueden integrar el modelo mediante la API OpenAI compatible de vLLM-Omni (endpoint `/v1/audio/speech`) para generar muestras de voz en pipelines de desarrollo y pruebas de concepto.
- Sistemas de navegación y avisos en tiempo real: la generación en streaming permite emitir instrucciones de navegación o alertas con latencia mínima, manteniendo un tono natural y comprensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación oficial del modelo Qwen3-TTS menciona una latencia de síntesis de extremo a extremo de 97 ms y una alta fidelidad de reconstrucción, pero no se proporcionan métricas cuantitativas como MOS (Mean Opinion Score) o comparativas con otros sistemas TTS en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización FP4, los pesos del modelo ocupan aproximadamente 0,6 GB (1.167 M parámetros × 0,5 bytes), pero el repositorio completo pesa 1,7 GB (incluye tokenizador y otros archivos). En la práctica, se recomienda al menos 2-4 GB de VRAM para inferencia con activaciones y overhead.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o superiores. También puede ejecutarse en Apple Silicon (M1/M2/M3) con suficiente RAM unificada.
- Si cabe en consumer GPU: sí, es un modelo pequeño que cabe en GPUs de gama de entrada y media.
- Opciones de despliegue: vLLM-Omni (con API compatible con OpenAI), el paquete `qwen-tts` oficial, o integración directa con Hugging Face Transformers. También es posible usar llama.cpp si se convierte a formato GGUF, aunque no se proporciona en este repositorio.
- Latencia y throughput: según la documentación oficial, la latencia de primer paquete es de 97 ms en streaming. El throughput dependerá del hardware; en una GPU moderna se espera una generación en tiempo real o más rápida, pero no se dispone de cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice (original) | 1,7B (aprox.) | No disponible | 10 | Apache 2.0 | Safetensors |
| Qwen3-TTS-12Hz-1.7B-CustomVoice-FP4 (este) | 1.167 M | No disponible | 10 | Apache 2.0 | Safetensors (FP4) |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | 0,6B (aprox.) | No disponible | 10 | Apache 2.0 | Safetensors |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | 1,7B (aprox.) | No disponible | 10 | Apache 2.0 | Safetensors |

La comparativa se limita a la familia Qwen3-TTS porque no se dispone de datos contrastados de otros modelos TTS de la misma categoría (como Kokoro, XTTS o StyleTTS 2) en la información proporcionada. La principal diferencia entre esta versión FP4 y el original es el tamaño (1,7 GB frente a un peso mayor sin cuantizar) y una posible pérdida menor de fidelidad de audio. La variante VoiceDesign permite crear voces a partir de descripciones, mientras que CustomVoice se centra en timbres predefinidos con control de estilo.

## Limitaciones y advertencias

- La cuantización FP4 puede introducir una degradación sutil en la calidad del audio en comparación con el modelo original en precisión completa, especialmente en voces con mucha variación prosódica o efectos acústicos complejos.
- No se dispone de información sobre sesgos específicos del modelo, pero al ser entrenado con datos multilingües, es posible que presente un rendimiento desigual entre idiomas o acentos poco representados.
- Riesgo de alucinación de audio: como cualquier modelo generativo, puede producir pronunciaciones incorrectas o inventar sonidos en contextos ambiguos, especialmente con texto ruidoso o poco común.
- La longitud de contexto no está documentada; para textos muy largos, puede ser necesario dividir la entrada en segmentos más pequeños.
- Este modelo no realiza clonación de voz (esa capacidad está en la variante Base); solo permite usar los 9 timbres predefinidos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la documentación oficial de Qwen para verificar si hay restricciones adicionales sobre el uso de los timbres o la marca.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o poco validada por la comunidad; se recomienda probar el modelo antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/Rin247/Qwen3-TTS-12Hz-1.7B-CustomVoice-FP4
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Repositorio GitHub oficial de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Página del modelo en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Guía de despliegue en innoai.space: https://innoai.space/model/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Paper técnico (referenciado en los tags): arXiv:2601.15621
