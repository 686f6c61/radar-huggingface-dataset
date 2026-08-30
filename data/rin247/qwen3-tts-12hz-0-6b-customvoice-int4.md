# Rin247/Qwen3-TTS-12Hz-0.6B-CustomVoice-INT4

## Resumen

Qwen3-TTS-12Hz-0.6B-CustomVoice-INT4 es una variante cuantizada a 4 bits del modelo de síntesis de voz Qwen3-TTS desarrollado por el equipo Qwen de Alibaba. Este checkpoint específico, publicado por el usuario Rin247 en HuggingFace, corresponde a la versión CustomVoice de 0.6B de parámetros basada en el tokenizador de 12 Hz, diseñada para generar voz multilingüe con control fino del estilo mediante instrucciones en lenguaje natural. El modelo resuelve el problema de la síntesis de voz expresiva y controlable, permitiendo ajustar tono, ritmo y emoción sin necesidad de ingeniería de características manual. Su relevancia actual radica en que combina un tamaño reducido (643 millones de parámetros) con una latencia de síntesis extremadamente baja (hasta 97 ms en modo streaming), lo que lo hace adecuado para aplicaciones en tiempo real. La cuantización INT4 reduce aún más los requisitos de memoria, facilitando su despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3-TTS (arquitectura específica no detallada en la información disponible) |
| Parametros totales | 643.120.384 (0,6B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | INT4 weight-only (según tag `int4_weight_only`) |
| Idiomas soportados | chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no se detalla en la información proporcionada, pero se sabe que pertenece a la familia Qwen3-TTS, que emplea un tokenizador de audio a 12 Hz para representar la señal de voz como tokens discretos. El modelo es un transformer de 0,6B parámetros entrenado para convertir texto e instrucciones de control en secuencias de tokens de audio, que posteriormente se decodifican en forma de onda. El entrenamiento se realizó con datos multilingües en 10 idiomas, aunque no se especifican el número de tokens ni la composición exacta del dataset. La innovación principal es el control por instrucciones en lenguaje natural: el modelo interpreta frases como "habla con tono muy alegre" para modular la prosodia, el ritmo y la emoción. También soporta generación en streaming con baja latencia, optimizada para el tokenizador de 12 Hz. No se menciona el uso de RLHF o DPO en el entrenamiento.

## Capacidades

- Síntesis de voz multilingüe en 10 idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Control fino del estilo vocal mediante instrucciones en lenguaje natural (por ejemplo, "habla con tono muy enfadado").
- Soporte de 9 voces premium predefinidas, cada una con un timbre y una lengua nativa asociada (Vivian, Serena, Uncle_Fu, Dylan, Eric, Ryan, Aiden, Ono_Anna, Sohee).
- Generación en streaming con latencia extremadamente baja (hasta 97 ms de extremo a extremo).
- Capacidad de clonación de voz y diseño de voz personalizada (según la descripción del repositorio oficial, aunque no se detalla en la ficha del checkpoint).
- Generación de voz robusta y controlable, adecuada para aplicaciones interactivas.

## Casos de uso

- Asistentes de voz multilingües: el modelo puede generar respuestas habladas en tiempo real en 10 idiomas, con control emocional para adaptarse al contexto de la conversación, gracias a su baja latencia y soporte de streaming.
- Locución automatizada para vídeo y contenido multimedia: permite generar narraciones con diferentes timbres y estilos (por ejemplo, voz joven femenina o voz masculina madura) sin necesidad de actores de doblaje, usando instrucciones en lenguaje natural para ajustar el tono.
- Sistemas de accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, con opción de elegir entre varias voces y ajustar la expresividad.
- Audioguías y tours virtuales: el modelo puede producir narraciones en múltiples idiomas con estilos diferenciados (por ejemplo, voz entusiasta para museos o voz serena para entornos religiosos), usando las voces predefinidas o personalizadas.
- Pruebas de producto y prototipado rápido: los desarrolladores pueden integrar el modelo en pipelines de generación de voz para validar experiencias de usuario sin esperar a la producción de audio profesional, gracias a su tamaño reducido y cuantización INT4.
- Educación y aprendizaje de idiomas: generación de ejemplos de pronunciación en distintos idiomas con control de velocidad y emoción, útil para aplicaciones de práctica conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas de calidad de voz (MOS, WER, etc.) ni comparaciones con otros sistemas TTS en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0,6B parámetros cuantizado a INT4, el tamaño en memoria es aproximadamente 0,6 GB (643M × 4 bits ≈ 322 MB, más overhead). Se estima que cabe en GPUs con 2 GB de VRAM o menos, aunque no se dispone de datos oficiales.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, incluyendo RTX 3060, RTX 4090, A100, etc. Para inferencia en CPU, también es viable gracias al tamaño reducido.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media como RTX 3060 (12 GB) o incluso en tarjetas con 4 GB, dependiendo del lote y la longitud de audio.
- Opciones de despliegue: el modelo se carga mediante la librería `qwen-tts` (pip install -U qwen-tts), que soporta `device_map="cuda:0"` y `attn_implementation="flash_attention_2"`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de audio, no de texto.
- Latencia y throughput: la latencia de síntesis en streaming es de hasta 97 ms según la documentación, pero no se proporcionan datos de throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos TTS de tamaño similar (por ejemplo, VITS, Bark, XTTS). La información proporcionada no incluye benchmarks ni especificaciones de modelos alternativos. Se recomienda consultar el repositorio oficial de Qwen3-TTS para comparaciones con versiones anteriores o con otros sistemas.

## Limitaciones y advertencias

- El modelo está optimizado para las 9 voces predefinidas; el uso de voces personalizadas puede requerir ajustes adicionales no documentados en esta ficha.
- La calidad de la síntesis puede degradarse en idiomas no nativos de la voz seleccionada; se recomienda usar cada voz en su lengua nativa para obtener mejores resultados.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado con datos multilingües, podría reflejar sesgos culturales o de género en las voces generadas.
- Riesgo de alucinación: aunque es un modelo TTS, podría generar pronunciaciones incorrectas o entonaciones inapropiadas en contextos ambiguos, especialmente con instrucciones complejas.
- La cuantización INT4 puede introducir una ligera pérdida de calidad de audio en comparación con el modelo original en bfloat16, aunque no se cuantifica en la documentación.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución y las patentes asociadas.
- El modelo no incluye capacidades de visión ni de procesamiento de texto más allá de la entrada de texto para TTS; no es un modelo multimodal general.

## Enlaces

- Modelo en HuggingFace (versión cuantizada): https://huggingface.co/Rin247/Qwen3-TTS-12Hz-0.6B-CustomVoice-INT4
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Repositorio GitHub oficial: https://github.com/QwenLM/Qwen3-TTS
- Paper técnico (arXiv): https://huggingface.co/papers/2601.15621
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen3-TTS
- Colección de modelos Qwen3-TTS: https://huggingface.co/collections/Qwen/qwen3-tts
- Modelo en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
