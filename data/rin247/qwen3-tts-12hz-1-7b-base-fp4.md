# Rin247/Qwen3-TTS-12Hz-1.7B-Base-FP4

## Resumen

El modelo `Rin247/Qwen3-TTS-12Hz-1.7B-Base-FP4` es una versión cuantizada en FP4 (4 bits, solo pesos) del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-Base, desarrollado originalmente por el equipo Qwen de Alibaba. Esta adaptación, publicada por el usuario Rin247, reduce el tamaño del modelo a aproximadamente 1,7 GB en disco, manteniendo la arquitectura original de LM multi-codebook discreto con tokenizador de 12 Hz. El modelo base está diseñado para clonado rápido de voz a partir de 3 segundos de audio de referencia y puede utilizarse como punto de partida para fine-tuning.

La relevancia de esta versión cuantizada radica en que permite desplegar un sistema TTS de alta calidad en hardware más modesto, como GPUs de consumo con poca memoria, sin necesidad de recurrir a servicios en la nube. El modelo soporta 10 idiomas principales (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) y ofrece generación en streaming con latencia extremadamente baja, lo que lo hace adecuado para aplicaciones interactivas en tiempo real. La licencia Apache 2.0 facilita su uso comercial y su integración en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM multi-codebook discreto con tokenizador acústico Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 1.179.469.888 (1,18 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada para entrada de texto) |
| Tipos de cuantizacion | FP4 weight-only (4 bits) |
| Idiomas soportados | Chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo original Qwen3-TTS-12Hz-1.7B-Base emplea una arquitectura de lenguaje (LM) discreta de múltiples codebooks que modela directamente la señal de voz a partir de texto, sin depender de un pipeline separado de vocoder o de un modelo de difusión. El tokenizador acústico Qwen3-TTS-Tokenizer-12Hz comprime la señal de audio en códigos discretos a una frecuencia de 12 Hz, preservando información paralingüística y del entorno acústico. Esta representación permite una reconstrucción de alta fidelidad mediante un decodificador ligero no basado en DiT.

El entrenamiento del modelo base se centró en la capacidad de clonado de voz rápida (3 segundos de audio de referencia) y en la robustez frente a texto de entrada ruidoso. No se especifican detalles sobre el volumen de datos de entrenamiento ni sobre el uso de técnicas como RLHF o DPO en la información disponible. La versión cuantizada FP4 no modifica la arquitectura, solo reduce la precisión de los pesos, lo que puede introducir una ligera degradación en la calidad de salida en comparación con la versión original en FP16/BF16.

## Capacidades

- Generación de voz natural y de alta fidelidad a partir de texto en 10 idiomas.
- Clonado de voz rápida: basta con 3 segundos de audio de referencia para replicar el timbre y las características vocales.
- Generación en streaming y no streaming mediante una arquitectura híbrida de doble vía; el primer paquete de audio se emite tras un solo carácter, con una latencia de extremo a extremo de hasta 97 ms.
- Comprensión contextual del texto: ajusta automáticamente el tono, el ritmo y la expresión emocional según la semántica del contenido.
- Robustez frente a texto de entrada con ruido o errores tipográficos.
- No incluye control por instrucciones en lenguaje natural (esa capacidad está reservada a las variantes VoiceDesign y CustomVoice), pero sí permite fine-tuning para tareas específicas.

## Casos de uso

- Asistentes de voz interactivos: gracias a la generación en streaming y a la baja latencia, el modelo puede integrarse en asistentes conversacionales que requieren respuestas de voz casi inmediatas, como chatbots telefónicos o dispositivos domésticos.
- Audiolibros y narración automatizada: el modelo puede generar narración natural en varios idiomas, adaptando la prosodia al contenido del texto, lo que resulta útil para plataformas de audiolibros o lectura de noticias.
- Doblaje y localización de contenidos: la capacidad de clonado de voz permite replicar la voz de un actor o locutor a partir de una muestra breve, facilitando el doblaje de vídeos o podcasts en diferentes idiomas.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, con soporte multilingüe y voces personalizadas.
- Generación de contenido educativo: creación de materiales de aprendizaje en audio, como lecciones o explicaciones, con control de entonación y énfasis según el contexto pedagógico.
- Prototipado y desarrollo de productos TTS: al ser una versión base cuantizada, permite a los desarrolladores experimentar con clonado de voz y fine-tuning en entornos con recursos limitados, antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada FP4 en la información disponible. El modelo original Qwen3-TTS-12Hz-1.7B-Base no incluye métricas comparativas detalladas en la documentación consultada, por lo que no es posible presentar una tabla de rendimiento objetiva. Se recomienda evaluar la calidad de salida de esta cuantización mediante pruebas subjetivas (MOS) y comparaciones con la versión sin cuantizar antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada: con 1,18 B parámetros en FP4, los pesos ocupan aproximadamente 0,6 GB. Considerando activaciones, el tokenizador y el decodificador, el modelo puede ejecutarse en GPUs con 2-4 GB de VRAM, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) debería ser suficiente para inferencia. Para fine-tuning se recomienda al menos 8 GB.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs de gama media y baja gracias a la cuantización FP4.
- Opciones de despliegue: el paquete oficial `qwen-tts` y vLLM son las vías recomendadas por el equipo de Qwen. También existen conversiones ONNX (por ejemplo, `romara-labs/Qwen3-TTS-12Hz-1.7B-Base-ONNX`) para despliegue en CPU o GPU con mayor portabilidad.
- Latencia y throughput: no se han publicado mediciones específicas para esta versión cuantizada. El modelo original reporta una latencia de extremo a extremo de 97 ms en modo streaming, pero la cuantización FP4 puede alterar ligeramente estos valores.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base (original) | 1,18 B | FP16/BF16 | 10 | Apache 2.0 | Modelo base sin cuantizar, mayor fidelidad |
| Rin247/Qwen3-TTS-12Hz-1.7B-Base-FP4 | 1,18 B | FP4 weight-only | 10 | Apache 2.0 | Versión cuantizada, menor huella de memoria |
| XTTS v2 (Coqui) | 0,9 B | FP16 | 17 | CPML (no comercial) | Clonado de voz, pero licencia restrictiva |
| Bark (Suno) | 1,2 B | FP16 | 13 | MIT | Generación de voz con efectos, pero mayor latencia |

La comparativa se centra en el modelo original y en alternativas populares de TTS de código abierto. La versión FP4 ofrece la misma funcionalidad que el original con un 75% menos de memoria, a costa de una posible pérdida de calidad. XTTS v2 y Bark son alternativas con capacidades similares, pero con licencias más restrictivas o mayor latencia.

## Limitaciones y advertencias

- La cuantización FP4 puede degradar la calidad de la voz generada, especialmente en tonos sutiles o en idiomas con fonética compleja. Se recomienda realizar pruebas de escucha antes de su uso en producción.
- El modelo base no soporta control por instrucciones en lenguaje natural (como cambiar el tono o la emoción mediante texto); para ello se necesitan las variantes VoiceDesign o CustomVoice.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado con datos web, puede reflejar sesgos de género, edad o acento presentes en los datos de entrenamiento.
- La longitud máxima de texto de entrada no está documentada; es posible que textos muy largos requieran segmentación.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo depende del tokenizador Qwen3-TTS-Tokenizer-12Hz, que también se distribuye bajo Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- El repositorio de Rin247 no incluye documentación propia; toda la información técnica proviene de la model card del modelo original de Qwen, por lo que se recomienda consultar la documentación oficial para detalles de implementación.

## Enlaces

- Repositorio HuggingFace de esta versión: https://huggingface.co/Rin247/Qwen3-TTS-12Hz-1.7B-Base-FP4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio GitHub oficial de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Conversión ONNX del modelo base: https://huggingface.co/romara-labs/Qwen3-TTS-12Hz-1.7B-Base-ONNX
- Página del modelo en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign (para la familia completa)
