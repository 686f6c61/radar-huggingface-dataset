# msgzml/Qwen3-TTS-12Hz-1.7B-Base

## Resumen

Qwen3-TTS-12Hz-1.7B-Base es la variante base de la familia Qwen3-TTS, un sistema de síntesis de voz (text-to-speech) desarrollado por el equipo Qwen de Alibaba. El modelo emplea una arquitectura de lenguaje autorregresiva discreta con múltiples codebooks, apoyada en el tokenizador propio Qwen3-TTS-Tokenizer-12Hz, que comprime la señal de audio a 12 Hz y preserva información paralingüística y acústica. Con 1.928.677.440 parámetros (aproximadamente 1,7 B), el modelo cubre diez idiomas principales y está diseñado para clonación de voz rápida a partir de tres segundos de audio de referencia, además de servir como base para fine-tuning.

La relevancia de esta variante radica en su arquitectura end-to-end sin esquema LM+DiT, que elimina cuellos de botella de información y errores en cascada típicos de los pipelines tradicionales. Incorpora una arquitectura híbrida de generación en streaming de doble pista que permite emitir el primer paquete de audio inmediatamente tras introducir un carácter, con una latencia extremo a extremo declarada de hasta 97 ms, lo que la hace apta para interacción en tiempo real.

El repositorio corresponde a una réplica publicada por el usuario `msgzml` bajo licencia Apache 2.0, con pesos en formato safetensors y un tamaño de repositorio de 4,5 GB. La model card referencia el informe técnico arXiv:2601.15621 y describe la familia completa de modelos Qwen3-TTS, de la que esta variante Base es la orientada a clonación y ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM autorregresiva discreta con múltiples codebooks (arquitectura end-to-end de modelado de voz; tokenizador Qwen3-TTS-Tokenizer-12Hz) |
| Parametros totales | 1.928.677.440 (≈1,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano; perfiles de voz dialectales adicionales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura de lenguaje discreta con múltiples codebooks que modela la voz de extremo a extremo, evitando el esquema en cascada LM+DiT. La señal de audio se representa mediante el tokenizador Qwen3-TTS-Tokenizer-12Hz, que realiza compresión acústica eficiente a 12 Hz y modelado semántico de alta dimensión, preservando información paralingüística y características del entorno acústico. La reconstrucción de la voz se efectúa mediante una arquitectura ligera no-DiT, lo que permite reconstrucción de alta fidelidad a alta velocidad.

La generación emplea una arquitectura híbrida de streaming de doble pista que soporta tanto generación en streaming como no streaming con un único modelo. Según la model card, es posible emitir el primer paquete de audio inmediatamente después de introducir un carácter, con latencia extremo a extremo de hasta 97 ms. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en diez idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Clonación de voz rápida a partir de tres segundos de audio de referencia del usuario.
- Generación en streaming y no streaming con el mismo modelo (arquitectura de doble pista).
- Baja latencia en streaming: primer paquete de audio tras un solo carácter, hasta 97 ms extremo a extremo.
- Comprensión contextual del texto para adaptar tono, velocidad de habla y expresión emocional según las instrucciones y la semántica del texto.
- Robustez mejorada frente a texto de entrada con ruido.
- Preservación de información paralingüística y del entorno acústico gracias al tokenizador de 12 Hz.
- Base para fine-tuning de otros modelos de la familia.
- Perfiles de voz dialectales adicionales (según la model card de la familia).
- No se indica soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo especializado en voz.

## Casos de uso

- Clonación de voz personalizada: a partir de tres segundos de audio del usuario, el modelo genera locuciones con la identidad vocal de referencia, adecuado para asistentes personalizados y audiolibros con voz propia.
- Atención al cliente por voz en tiempo real: la latencia de hasta 97 ms y el streaming de doble pista permiten respuestas habladas casi inmediatas en sistemas telefónicos o chats de voz.
- Doblaje y localización multilingüe: al cubrir diez idiomas, se puede generar audio en español, inglés, francés u otros a partir de un mismo guion, manteniendo el perfil de voz clonado.
- Accesibilidad: conversión de texto a voz natural para lectores de pantalla, con control de tono y velocidad adaptado a las preferencias del usuario.
- Generación de contenido para medios: locuciones para pódcast, vídeos y anuncios con control de emoción y prosodia mediante instrucciones en lenguaje natural.
- Punto de partida para fine-tuning: al ser la variante Base, permite ajustar el modelo a dominios concretos (por ejemplo, terminología médica o legal) o a perfiles de voz corporativos.
- Sistemas de interacción por voz embebidos: la variante de 0,6 B de la familia y el diseño ligero no-DiT facilitan despliegues con requisitos de cómputo moderados, aunque esta variante de 1,7 B requiere más recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,93 B parámetros, en fp16 se requieren aproximadamente 3,9 GB solo para pesos, más memoria para el tokenizador y buffers de audio; en cuantizaciones de 8 bits o 4 bits el requisito de pesos baja a unos 2 GB o 1 GB respectivamente.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs de consumo como RTX 4090, RTX 3090 o RTX 4080 en fp16, y en GPUs profesionales A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM en fp16, aunque no se confirma en la documentación disponible.
- Opciones de despliegue: el paquete `qwen-tts` y vLLM se mencionan explícitamente en la model card para la carga de pesos; no se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia extremo a extremo declarada de hasta 97 ms en streaming; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Clonacion de voz | Licencia |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base (este) | ≈1,7 B | 10 | Sí | Sí (3 s) | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | ≈1,7 B | 10 | Sí | Diseño por descripción, no clonación directa | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-CustomVoice | ≈1,7 B | 10 | Sí | 9 timbres premium con control de estilo | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-Base | ≈0,6 B | 10 | Sí | Sí (3 s) | Apache 2.0 |

Las alternativas de otras familias (por ejemplo, sistemas TTS propietarios o de otros laboratorios) no están disponibles en la información proporcionada, por lo que no se incluyen datos comparativos de rendimiento.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks que permitan validar la calidad objetiva de la síntesis ni la fidelidad de la clonación.
- Riesgo de uso indebido de la clonación de voz: la capacidad de clonar con tres segundos de audio exige controles de consentimiento y medidas anti-suplantación en producción.
- No se detalla la composición del dataset de entrenamiento, por lo que no se puede evaluar el sesgo de acentos, géneros o dialectos.
- La información sobre el contexto máximo y la composición lingüística exacta de cada idioma no está disponible.
- El repositorio es una réplica publicada por un tercero (`msgzml`) con 0 descargas y 0 likes; conviene verificar la integridad de los pesos frente al repositorio oficial de Qwen antes de usarlo en producción.
- Aunque la licencia es Apache 2.0, el uso comercial de voces clonadas puede estar sujeto a normativas de protección de datos y derechos de imagen según la jurisdicción.
- No se confirma soporte de cuantizaciones GGUF ni de motores de inferencia distintos de `qwen-tts` y vLLM.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/msgzml/Qwen3-TTS-12Hz-1.7B-Base
- Informe técnico referenciado: arXiv:2601.15621
- Repositorio oficial de Qwen3-TTS (según model card): https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Tokenizador: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Variante CustomVoice: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Variante VoiceDesign: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Variante Base 0.6B: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Imagen de introducción: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/qwen3_tts_introduction.png
- Diagrama de arquitectura: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/overview.png
