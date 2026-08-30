# Rin247/Qwen3-TTS-12Hz-1.7B-Base-INT4

## Resumen

Qwen3-TTS-12Hz-1.7B-Base-INT4 es una versión cuantizada a 4 bits (INT4 weight-only) del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-Base, desarrollado originalmente por el equipo Qwen de Alibaba. Esta variante específica ha sido publicada por el usuario Rin247 en Hugging Face, y mantiene la licencia Apache 2.0 del modelo original. Se trata de un modelo de texto a voz (TTS) basado en una arquitectura de modelo de lenguaje discreto multi-codebook, que opera con un tokenizador acústico a 12 Hz, lo que permite una compresión eficiente de la señal de voz y una reconstrucción de alta fidelidad mediante una arquitectura ligera no basada en DiT.

El modelo base es capaz de clonar la voz de un hablante a partir de solo 3 segundos de audio de referencia, y soporta generación en streaming con latencia extremadamente baja (el primer paquete de audio se emite tras un solo carácter, con una latencia de extremo a extremo de hasta 97 ms). La versión INT4 reduce el tamaño de los pesos de aproximadamente 1.179 millones de parámetros (1,18 G) a un repositorio de 1,6 GB, lo que facilita su despliegue en hardware con recursos limitados, como GPUs de consumo. El modelo cubre 10 idiomas principales, entre ellos español, inglés, chino, japonés, coreano, alemán, francés, ruso, portugués e italiano.

Esta cuantización es relevante porque permite ejecutar un modelo TTS de calidad profesional en entornos con restricciones de memoria, manteniendo las capacidades de clonación de voz, control prosódico y generación en streaming del modelo original, aunque con una posible pérdida mínima de fidelidad debido a la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook (Qwen3-TTS) con tokenizador acustico 12Hz |
| Parametros totales | 1.179.469.888 (1,18 G) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto largo) |
| Tipos de cuantizacion | INT4 weight-only (8-bit mencionado en tags, pero el nombre indica INT4) |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, español, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo Qwen3-TTS-12Hz-1.7B-Base emplea una arquitectura de modelo de lenguaje discreto multi-codebook, que modela directamente la señal de voz como una secuencia de códigos discretos generados por el tokenizador Qwen3-TTS-Tokenizer-12Hz. Este tokenizador comprime la señal de voz a una frecuencia de 12 Hz, capturando información paralingüística y características del entorno acústico. A diferencia de los esquemas tradicionales que combinan un LM con un difusión (LM+DiT), esta arquitectura unificada evita cuellos de botella de información y errores en cascada, mejorando la versatilidad, la eficiencia de generación y el techo de rendimiento.

El modelo base está diseñado para la clonación rápida de voz: a partir de 3 segundos de audio de referencia, puede replicar el timbre y las características vocales del hablante. También sirve como base para fine-tuning en tareas específicas. El entrenamiento incluye datos multilingües de los 10 idiomas soportados, aunque no se han publicado detalles específicos sobre el volumen de tokens ni las técnicas de alineación (RLHF/DPO) en la información disponible. La arquitectura soporta generación en streaming y no streaming mediante un esquema híbrido de doble vía, lo que permite emitir el primer paquete de audio inmediatamente después de procesar un solo carácter.

## Capacidades

- Generación de voz natural y de alta fidelidad a partir de texto en 10 idiomas.
- Clonación de voz con solo 3 segundos de audio de referencia (modelo base).
- Control prosódico y emocional mediante instrucciones en lenguaje natural (en las variantes VoiceDesign y CustomVoice, aunque el modelo base no incluye control por instrucciones explícitas).
- Generación en streaming con latencia de extremo a extremo de hasta 97 ms.
- Comprensión contextual del texto para ajustar tono, ritmo y expresión emocional.
- Robustez mejorada frente a texto de entrada ruidoso o mal formateado.
- Soporte de múltiples perfiles de voz y dialectos (en las variantes CustomVoice).
- Capacidad de fine-tuning para adaptar el modelo a voces o dominios específicos.

## Casos de uso

- Asistentes de voz interactivos: el modelo puede integrarse en sistemas de conversación en tiempo real gracias a su generación en streaming de baja latencia, permitiendo respuestas de voz casi inmediatas en aplicaciones de atención al cliente o asistentes personales.
- Doblaje y localización de contenido: con soporte para 10 idiomas, puede generar voces dobladas para vídeos, podcasts o audiolibros, manteniendo coherencia prosódica y emocional con el texto original.
- Audiolibros y narración automatizada: la capacidad de controlar el tono y el ritmo permite producir narraciones naturales para libros electrónicos, artículos o noticias, con una calidad cercana a la humana.
- Clonación de voz para accesibilidad: personas con discapacidad del habla pueden generar una voz personalizada a partir de una muestra breve de su propia voz, mejorando la comunicación asistida.
- Prototipado rápido de productos de voz: los desarrolladores pueden integrar el modelo en pipelines de generación de voz para pruebas de concepto, gracias a su tamaño reducido (1,6 GB) y su licencia Apache 2.0 que permite uso comercial.
- Generación de contenido educativo: creación de materiales de aprendizaje en múltiples idiomas con voces naturales, útil para plataformas de e-learning o aplicaciones de idiomas.
- Sistemas de navegación y avisos públicos: la baja latencia y la robustez ante texto ruidoso lo hacen adecuado para generar anuncios dinámicos en tiempo real, como indicaciones de tráfico o mensajes en estaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original de Qwen no incluye métricas comparativas estándar (como MOS, WER o latencia) en la documentación consultada. Se recomienda consultar el repositorio oficial de Qwen3-TTS para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada: el modelo original sin cuantizar requiere aproximadamente 3,9 GB de VRAM según LLM Explorer. La versión INT4 reduce el tamaño de los pesos a 1,6 GB, por lo que se estima que puede ejecutarse en GPUs con 4 GB de VRAM o menos, aunque no se dispone de una medición exacta para esta cuantización.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090, o GPUs de datacenter como A10, A100 o H100 para despliegues de mayor concurrencia.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de gama media con 4-6 GB de VRAM gracias a la cuantización INT4.
- Opciones de despliegue: el modelo puede ejecutarse con el paquete `qwen-tts` oficial, vLLM (que soporta carga automática de pesos), o mediante conversión a ONNX (existen versiones ONNX de la comunidad). También es posible usar llama.cpp si se convierte a GGUF, aunque no se ha confirmado soporte oficial.
- Latencia y throughput: la latencia de streaming es de hasta 97 ms de extremo a extremo en el modelo original; la versión INT4 puede presentar una latencia ligeramente superior debido a la de-cuantización, pero no se dispone de datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base (original) | 1,18 G | no disponible | 10 | Apache 2.0 | safetensors | Modelo base sin cuantizar, requiere ~3,9 GB VRAM |
| Qwen3-TTS-12Hz-1.7B-Base-INT4 (este) | 1,18 G | no disponible | 10 | Apache 2.0 | safetensors (INT4) | Cuantización 4 bits, repo de 1,6 GB |
| Qwen3-TTS-12Hz-0.6B-Base | 0,6 G | no disponible | 10 | Apache 2.0 | safetensors | Versión más pequeña, menor calidad pero más ligera |
| XTTS-v2 (Coqui) | 0,6 G | no disponible | 17 | CPML (no comercial) | safetensors | TTS multilingüe con clonación de voz, pero licencia restrictiva |

La comparativa se limita a modelos TTS de código abierto con clonación de voz. La ventaja principal de esta versión INT4 es su menor huella de memoria frente al original, manteniendo la misma licencia permisiva Apache 2.0, a diferencia de XTTS-v2 que tiene restricciones comerciales.

## Limitaciones y advertencias

- La cuantización INT4 puede introducir una pérdida mínima de fidelidad en la calidad de voz en comparación con el modelo original en FP16/BF16, especialmente en voces con características extremas o en idiomas con fonética compleja.
- No se dispone de información sobre sesgos específicos del modelo, pero al ser un modelo TTS entrenado con datos multilingües, puede presentar variaciones de calidad entre idiomas o acentos menos representados.
- Riesgo de alucinación: aunque es un modelo TTS, puede generar pronunciaciones incorrectas o enfatizar sílabas de forma inadecuada en textos ambiguos o con nombres propios poco comunes.
- El modelo base no soporta control por instrucciones en lenguaje natural (esa capacidad está en las variantes VoiceDesign y CustomVoice), por lo que el control fino de emociones o estilos requiere fine-tuning o usar las otras variantes.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar que la cuantización realizada por Rin247 no haya introducido modificaciones que alteren los términos de la licencia original.
- No se han publicado benchmarks de rendimiento para esta cuantización específica, por lo que el rendimiento real en producción debe validarse con casos de uso concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rin247/Qwen3-TTS-12Hz-1.7B-Base-INT4
- Repositorio oficial de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Modelo original en Hugging Face: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Versión ONNX de la comunidad: https://huggingface.co/romara-labs/Qwen3-TTS-12Hz-1.7B-Base-ONNX
- Tutorial de despliegue: https://aiindigo.com/tutorials/getting-started-with-qwen3-tts-12hz-1-7b-voicedesign-optimized-low-latency-speec
- Ficha en LLM Explorer: https://llm-explorer.com/model/Qwen%2FQwen3-TTS-12Hz-1.7B-Base,2HZTyoJ6nTMjkMtyXfHWnq
