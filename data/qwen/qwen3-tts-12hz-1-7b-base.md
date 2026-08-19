# Qwen/Qwen3-TTS-12Hz-1.7B-Base

## Resumen

Qwen3-TTS-12Hz-1.7B-Base es un modelo de síntesis de voz (text-to-speech) de la familia Qwen3-TTS, desarrollado por el equipo Qwen de Alibaba. Se trata del modelo base de la serie, diseñado para realizar clonación rápida de voz a partir de una muestra de audio de aproximadamente tres segundos, y puede utilizarse como punto de partida para el ajuste fino (fine-tuning) de modelos personalizados. Su relevancia radica en que introduce una arquitectura de modelado de voz extremo a extremo que elimina los cuellos de botella de los esquemas tradicionales basados en LM y DiT.

El modelo emplea un tokenizador de voz propio, Qwen3-TTS-Tokenizer-12Hz, que comprime la señal acústica a 12 Hz, y una arquitectura LM discreta de múltiples codebooks que modela la información completa del habla de forma directa. Con 1.928.677.440 parámetros totales, soporta diez idiomas principales, incluyendo español, y ofrece generación en streaming con latencia extremadamente baja, de hasta 97 ms en la salida del primer paquete de audio. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook (no DiT) con tokenizador Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 1.928.677.440 (1,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-TTS-12Hz-1.7B-Base utiliza una arquitectura de LM discreto con múltiples codebooks que modela la señal de voz de forma extremo a extremo. A diferencia de los esquemas convencionales que combinan un LM para predecir unidades semánticas y un modelo DiT para la reconstrucción acústica, esta arquitectura procesa toda la información del habla de forma unificada, evitando la pérdida de información y los errores en cascada. El tokenizador Qwen3-TTS-Tokenizer-12Hz comprime la señal acústica a una frecuencia de 12 Hz, lo que permite una reconstrucción de alta fidelidad con un modelo ligero no basado en DiT.

El modelo incorpora una arquitectura de generación híbrida de doble vía (Dual-Track) que soporta simultáneamente generación en streaming y no streaming. En modo streaming, es capaz de emitir el primer paquete de audio inmediatamente después de procesar un único carácter de entrada, con una latencia extremo a extremo de 97 ms. El modelo base no incluye control por instrucciones, pero sí comprende el contexto semántico del texto para ajustar tono, ritmo y expresión emocional de forma adaptativa. Los detalles específicos del entrenamiento, como el número de tokens o la composición del dataset, no se han publicado en la información disponible.

## Capacidades

- Clonación rápida de voz: el modelo base puede clonar una voz a partir de una muestra de audio de aproximadamente 3 segundos.
- Ajuste fino: diseñado específicamente para ser utilizado como base para fine-tuning de modelos personalizados.
- Generación en streaming: soporta salida de audio en streaming con latencia de hasta 97 ms.
- Generación no streaming: también puede generar audio completo sin modo streaming.
- Multilingüe: soporta diez idiomas principales: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Robustez ante texto ruidoso: muestra una mejora significativa en la robustez frente a texto de entrada con ruido o errores.
- Comprensión contextual: integra la comprensión semántica del texto para adaptar tono, ritmo y emoción.
- Preservación de información paralingüística: conserva características acústicas ambientales y paralingüísticas en la reconstrucción.

## Casos de uso

- Clonación de voz personalizada: el modelo puede replicar la voz de una persona a partir de una muestra breve de 3 segundos, lo que permite crear asistentes virtuales con la voz del usuario o voces personalizadas para aplicaciones de accesibilidad.
- Fine-tuning para voces específicas de dominio: al ser un modelo base, permite ajustar el modelo con datos propios para obtener voces especializadas en sectores como atención médica, educación o entretenimiento, con un coste de entrenamiento reducido gracias a su tamaño de 1,7B.
- Generación de voz en tiempo real para asistentes conversacionales: su capacidad de streaming con latencia de 97 ms lo hace adecuado para sistemas de diálogo por voz donde la respuesta debe ser inmediata, como chatbots telefónicos o asistentes de voz en dispositivos.
- Localización multilingüe de contenidos: con soporte para diez idiomas, puede utilizarse para generar locuciones en múltiples mercados sin necesidad de contratar actores de voz para cada idioma, reduciendo costes de producción.
- Audioguías y contenido educativo: la generación de voz natural y expresiva permite crear audioguías para museos, narraciones de libros electrónicos o material didáctico en varios idiomas con control de tono y emoción.
- Generación de voz para personas con discapacidad del habla: la clonación rápida de voz permite a personas con problemas de habla conservar una voz sintética basada en su propia voz, grabada previamente, mejorando la comunicación asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 1,7B parámetros en precisión FP16, el modelo requiere aproximadamente 3,9 GB de VRAM solo para los pesos. Con overhead de activaciones y el tokenizador, se recomiendan al menos 6-8 GB de VRAM para inferencia.
- GPU recomendadas: el modelo es relativamente ligero y puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. Para entrenamiento o fine-tuning, se recomienda al menos 16 GB de VRAM (RTX 4080, RTX 4090, A10G).
- Compatibilidad con consumer GPU: sí, el modelo cabe en GPUs de consumo de gama media y alta.
- Opciones de despliegue: el modelo se puede cargar mediante el paquete qwen-tts o vLLM, según indica la documentación oficial. También es compatible con plataformas como SageMaker.
- Latencia y throughput: la latencia de síntesis extremo a extremo es de 97 ms en modo streaming, lo que lo hace adecuado para aplicaciones interactivas en tiempo real.

## Comparativa con modelos similares

La comparativa se limita a otros modelos de la misma familia Qwen3-TTS, ya que no se dispone de datos de modelos externos comparables en la información proporcionada.

| Modelo | Parametros | Idiomas | Streaming | Instrucciones | Clonacion de voz | Licencia |
|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base | 1,7B | 10 | Si | No | Si (3 s) | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-CustomVoice | 1,7B | 10 | Si | Si | No | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | 1,7B | 10 | Si | Si | No | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-Base | 0,6B | 10 | Si | No | Si (3 s) | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | 0,6B | 10 | Si | No | No | Apache 2.0 |

## Limitaciones y advertencias

- El modelo base no soporta control por instrucciones naturales; para ello es necesario utilizar las variantes CustomVoice o VoiceDesign.
- No se han publicado datos sobre sesgos en los datos de entrenamiento, por lo que es recomendable evaluar el modelo en el dominio de uso previsto.
- La robustez ante texto ruidoso ha mejorado, pero sigue siendo necesario validar el comportamiento con entradas atípicas o con errores graves.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable revisar los términos completos de la licencia y las políticas de uso de Alibaba.
- No se dispone de información sobre la longitud máxima de texto soportada por entrada ni sobre el contexto máximo que el modelo puede manejar.
- La calidad de la clonación de voz depende de la calidad de la muestra de audio proporcionada; muestras con ruido o de baja calidad pueden degradar el resultado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio en GitHub: https://github.com/QwenLM/Qwen3-TTS
- Colección Qwen3-TTS en Hugging Face: https://huggingface.co/collections/Qwen/qwen3-tts
- Modelo en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Informe tecnico (arXiv): https://arxiv.org/abs/2601.15621
