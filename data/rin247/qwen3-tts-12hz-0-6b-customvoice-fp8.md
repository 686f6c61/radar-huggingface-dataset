# Rin247/Qwen3-TTS-12Hz-0.6B-CustomVoice-FP8

## Resumen

Qwen3-TTS-12Hz-0.6B-CustomVoice es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo Qwen, publicado originalmente como Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice y redistribuido por el usuario Rin247 en una versión cuantizada en FP8. Forma parte de la familia Qwen3-TTS, una serie de modelos avanzados de generación de voz que soporta síntesis multilingüe, control fino del estilo mediante instrucciones en lenguaje natural y generación en streaming con baja latencia.

Este checkpoint concreto es la variante CustomVoice de 0.6B parámetros, basada en el tokenizador de audio a 12Hz. Permite seleccionar entre 9 timbres de voz predefinidos y ajustar el tono, ritmo y expresión emocional mediante instrucciones textuales. El modelo soporta 10 idiomas principales: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano. La versión FP8 aquí publicada reduce el tamaño del repositorio a 1.3 GB, facilitando su despliegue en entornos con recursos limitados.

La relevancia de este modelo radica en que combina control expresivo por lenguaje natural, soporte multilingüe amplio y latencia extremadamente baja (97 ms de extremo a extremo), lo que lo hace adecuado para aplicaciones interactivas en tiempo real, asistentes de voz y generación de contenido audiovisual. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (Transformer basado en tokenizador de audio a 12Hz) |
| Parametros totales | 905.788.672 (0.9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (esta version), BF16 (version original) |
| Idiomas soportados | zh, en, ja, ko, de, fr, ru, pt, es, it |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-TTS es una familia de modelos de síntesis de voz basada en arquitectura Transformer, diseñada específicamente para generación de audio. Este checkpoint utiliza un tokenizador de audio a 12Hz, lo que significa que procesa y genera audio en unidades discretas a una frecuencia de 12 tokens por segundo, optimizando el equilibrio entre calidad y latencia. El modelo acepta texto de entrada junto con instrucciones de estilo en lenguaje natural y un identificador de voz (speaker), y genera waveforms de audio como salida.

El entrenamiento se realizó con datos multilingües que cubren los 10 idiomas soportados, aunque los detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset y los métodos de alineación (RLHF, DPO, etc.) no están disponibles en la información proporcionada. El modelo está optimizado para generación en streaming, lo que permite comenzar a reproducir audio antes de que se complete la síntesis completa, reduciendo la latencia percibida. La versión FP8 publicada por Rin247 es una cuantización del checkpoint original en BF16, que reduce el tamaño del modelo manteniendo un rendimiento cercano al original.

## Capacidades

- Síntesis de voz multilingüe en 10 idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Control expresivo mediante instrucciones en lenguaje natural: permite especificar tono, ritmo y emoción (por ejemplo, "habla con tono muy alegre" o "con tono de enfado").
- Selección entre 9 voces predefinidas con características distintas: Vivian (voz femenina joven y brillante), Serena (voz femenina cálida y suave), Uncle_Fu (voz masculina madura y aterciopelada), Dylan (voz masculina joven de Pekín), Eric (voz masculina animada de Chengdu), Ryan (voz masculina dinámica con ritmo), Aiden (voz masculina americana soleada), Ono_Anna (voz femenina japonesa juguetona) y Sohee (voz femenina coreana cálida).
- Generación en streaming con baja latencia: latencia de extremo a extremo de hasta 97 ms.
- Soporte para voz personalizada (CustomVoice): permite adaptar el estilo de habla a partir de instrucciones textuales.
- Generación de audio de alta calidad similar a la voz humana.

## Casos de uso

- Asistentes de voz interactivos: el modelo puede integrarse en asistentes virtuales para generar respuestas habladas en tiempo real, gracias a su baja latencia de 97 ms y su capacidad de streaming. Es adecuado para aplicaciones de atención al cliente automatizada donde se requiere una respuesta inmediata y natural.
- Generación de contenido audiovisual multilingüe: permite crear locuciones para vídeos, podcasts o audiolibros en 10 idiomas distintos, seleccionando la voz más adecuada para cada público objetivo. Por ejemplo, se puede usar la voz "Ryan" para contenido en inglés y "Vivian" para contenido en chino.
- Doblaje de vídeos y juegos: el control expresivo mediante instrucciones permite generar diálogos con diferentes emociones (alegría, enfado, tristeza) para personajes de juegos o animaciones, sin necesidad de grabar con actores de voz.
- Aplicaciones educativas de idiomas: el modelo puede generar ejemplos de pronunciación en varios idiomas con diferentes tonos y estilos, útil para aplicaciones de aprendizaje de lenguas o para practicar comprensión auditiva.
- Sistemas de accesibilidad: puede convertir texto en voz para personas con discapacidad visual o dificultades de lectura, ofreciendo voces naturales y expresivas en múltiples idiomas.
- Marketing y publicidad personalizada: permite generar anuncios de audio con diferentes tonos emocionales según el segmento de audiencia, adaptando la voz y el estilo a la campaña específica.
- Traducción audiovisual en tiempo real: combinado con un sistema de traducción automática, puede generar voz sintetizada en el idioma de destino con estilo natural, útil para retransmisiones en directo o vídeos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento proporcionado es la latencia de síntesis de extremo a extremo de 97 ms, optimizada para generación en streaming con el tokenizador Qwen3-TTS-Tokenizer-12Hz.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0.9B parámetros en FP8, se estima que requiere aproximadamente 2-4 GB de VRAM para inferencia en BF16/FP8, dependiendo de la longitud del texto de entrada y la configuración de batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo. Se recomienda una RTX 3060 o superior para un rendimiento fluido. Para despliegues en producción, una A10, A100 o H100 ofrecerá mayor throughput.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo como RTX 3060, RTX 4070, RTX 4090, etc., gracias a su tamaño reducido y la cuantización FP8.
- Opciones de despliegue: el modelo se puede ejecutar mediante la librería `qwen-tts` (pip install qwen-tts), que proporciona una API Python sencilla. También es compatible con Hugging Face Transformers y puede desplegarse en entornos de inferencia como vLLM o TGI si se adapta.
- Latencia y throughput: la latencia de extremo a extremo es de aproximadamente 97 ms en condiciones óptimas. El throughput dependerá del hardware y del tamaño del batch, pero al ser un modelo pequeño, puede procesar múltiples solicitudes en paralelo en GPUs de gama alta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-CustomVoice (este) | 0.9B | no disponible | 10 | Apache 2.0 | HuggingFace, ModelScope |
| Qwen3-TTS-12Hz-0.6B-Base | 0.9B | no disponible | 10 | Apache 2.0 | HuggingFace, ModelScope |
| Qwen3-TTS-12Hz-0.6B-VoiceClone | 0.9B | no disponible | 10 | Apache 2.0 | HuggingFace, ModelScope |

La comparativa se limita a las variantes de la misma familia Qwen3-TTS, ya que no se dispone de información sobre modelos comparables de otros desarrolladores en la información proporcionada. Las tres variantes comparten arquitectura y tamaño, diferenciándose en sus capacidades: CustomVoice se centra en voces predefinidas con control expresivo, Base es la versión general y VoiceClone está especializada en clonación de voz.

## Limitaciones y advertencias

- Se recomienda utilizar cada voz en su idioma nativo para obtener los mejores resultados; el uso de una voz fuera de su idioma nativo puede degradar la calidad de la síntesis.
- El modelo puede presentar sesgos en la generación de voz dependiendo de los datos de entrenamiento, especialmente en acentos o variantes dialectales no representadas.
- Existe riesgo de alucinación en la pronunciación de nombres propios, términos técnicos o palabras fuera del vocabulario de entrenamiento.
- La cuantización FP8 puede introducir una ligera degradación en la calidad del audio en comparación con la versión BF16 original, aunque en la mayoría de los casos será imperceptible.
- La longitud máxima de texto que puede procesar el modelo no está documentada; para textos muy largos puede ser necesario dividirlos en segmentos.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución si se redistribuye el modelo.
- El modelo no soporta generación de voz en tiempo real con entrada de micrófono; está diseñado para síntesis a partir de texto.

## Enlaces

- Repositorio HuggingFace (version FP8 de Rin247): https://huggingface.co/Rin247/Qwen3-TTS-12Hz-0.6B-CustomVoice-FP8
- Repositorio HuggingFace (version original de Qwen): https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Coleccion Qwen3-TTS en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-tts
- Repositorio GitHub de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Paper tecnico (arXiv): https://huggingface.co/papers/2601.15621
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen3-TTS
- Pagina en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
