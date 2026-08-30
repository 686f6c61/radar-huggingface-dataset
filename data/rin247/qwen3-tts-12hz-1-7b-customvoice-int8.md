# Rin247/Qwen3-TTS-12Hz-1.7B-CustomVoice-INT8

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice-INT8 es una versión cuantizada a 8 bits del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-CustomVoice, publicado por el usuario Rin247 en HuggingFace. El modelo original, desarrollado por Alibaba Qwen, es un sistema de texto a voz (TTS) de extremo a extremo basado en una arquitectura de modelo de lenguaje discreto de múltiples códigos (multi-codebook LM), que cubre 10 idiomas principales e incorpora control fino de timbre, emoción y prosodia mediante instrucciones en lenguaje natural.

Esta variante INT8 reduce el peso del modelo de aproximadamente 1.916 millones de parámetros a un tamaño de repositorio de 2,3 GB, lo que facilita su despliegue en entornos con recursos limitados. La variante CustomVoice ofrece 9 timbres premium que combinan género, edad, idioma y dialecto, y admite generación tanto en streaming como en modo no streaming, con una latencia de síntesis de extremo a extremo de hasta 97 ms. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook (Qwen3-TTS) |
| Parametros totales | 1.916.676.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (weight-only) |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo Qwen3-TTS emplea una arquitectura de modelo de lenguaje discreto de multiples codebooks que modela la senal de voz de forma integral, evitando los cuellos de botella de informacion y los errores en cascada tipicos de los esquemas LM+DiT tradicionales. El tokenizador propietario Qwen3-TTS-Tokenizer-12Hz comprime acusticamente la senal a 12 Hz, preservando informacion paralinguistica y caracteristicas del entorno acustico, lo que permite una reconstruccion de voz de alta fidelidad mediante una arquitectura ligera no basada en DiT.

El sistema incorpora una arquitectura hibrida de generacion en streaming de doble via (Dual-Track), que permite que un unico modelo soporte tanto generacion en streaming como no streaming. El primer paquete de audio puede emitirse inmediatamente tras introducir un solo caracter, con una latencia de sintesis de extremo a extremo de 97 ms. El modelo integra comprension semantica del texto para ajustar de forma adaptativa el tono, el ritmo y la expresion emocional, y muestra una robustez notable frente a texto de entrada ruidoso. Los datos de entrenamiento y el proceso de alineacion (RLHF, DPO, etc.) no estan detallados en la informacion disponible.

## Capacidades

- Sintesis de voz en 10 idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano.
- Control de timbre mediante instrucciones en lenguaje natural, con 9 timbres premium que cubren combinaciones de genero, edad, idioma y dialecto.
- Control de emocion, tono y prosodia a traves de instrucciones textuales y semantica del texto.
- Generacion en streaming con latencia de primer paquete de audio inmediata tras un solo caracter (97 ms de extremo a extremo).
- Generacion no streaming para produccion de audio de mayor calidad.
- Robustez frente a texto de entrada ruidoso o mal formateado.
- Reconstruccion de voz de alta fidelidad mediante tokenizador acustico de 12 Hz.

## Casos de uso

- Atencion al cliente automatizada multilingue: el modelo puede generar respuestas de voz naturales en 10 idiomas con control emocional, lo que permite desplegar IVRs o asistentes virtuales que se adaptan al tono de la conversacion y al perfil del usuario.
- Locucion para video y contenido multimedia: los creadores de contenido pueden generar narraciones con timbres especificos (por genero, edad o dialecto) sin necesidad de contratar actores de voz, acelerando la produccion de videos en multiples idiomas.
- Audiolibros y contenido editorial: la capacidad de controlar prosodia y emocion permite generar audiolibros con estilos narrativos variados, adaptando la entonacion al genero literario o al publico objetivo.
- Asistentes de voz en dispositivos embebidos: gracias a la cuantizacion INT8 y al modo streaming de baja latencia, el modelo puede integrarse en asistentes de voz para smart speakers o aplicaciones moviles con recursos limitados.
- Sistemas de traduccion y aprendizaje de idiomas: la cobertura de 10 idiomas y el control de timbre permiten construir aplicaciones de pronunciacion o practica conversacional que generan ejemplos de audio con voces nativas de distintas edades y dialectos.
- Videojuegos y personajes virtuales: los 9 timbres premium y el control emocional permiten generar dialogos para personajes de videojuegos o avatares virtuales con coherencia de voz y expresividad adaptativa al contexto narrativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original de Qwen3-TTS menciona una latencia de sintesis de extremo a extremo de 97 ms y la capacidad de emitir el primer paquete de audio tras un solo caracter, pero no se proporcionan metricas comparativas como MOS (Mean Opinion Score), RTF (Real-Time Factor) o resultados en conjuntos de datos estandar de TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo INT8 de 1.916 millones de parametros ocupa aproximadamente 2,3 GB en disco; en memoria, la inferencia requerira entre 2,5 y 3,5 GB de VRAM dependiendo del tamano de lote y la longitud de la secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060 o superiores. Tambien es viable en Apple Silicon con Metal o en CPU mediante llama.cpp.
- Cabe en GPUs de consumo: si, en la mayoria de GPUs modernas de gama media y alta.
- Opciones de despliegue: el modelo puede servirse mediante vLLM (con soporte para vLLM-Omni y API compatible con OpenAI /v1/audio/speech), el paquete oficial qwen-tts, o herramientas de inferencia local como llama.cpp y Ollama.
- Latencia y throughput: la latencia de primer paquete es de 97 ms en modo streaming; el throughput exacto no esta disponible, pero la arquitectura no DiT y el tokenizador de 12 Hz permiten una generacion rapida en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Streaming | Licencia | Cuantizacion |
|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice (oficial) | 1.916 M | no disponible | 10 | Si | Apache 2.0 | FP16/BF16 |
| Qwen3-TTS-12Hz-1.7B-CustomVoice-INT8 (este modelo) | 1.916 M | no disponible | 10 | Si | Apache 2.0 | INT8 |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | ~600 M | no disponible | 10 | Si | Apache 2.0 | FP16/BF16 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | 1.916 M | no disponible | 10 | Si | Apache 2.0 | FP16/BF16 |

La variante INT8 ofrece el mismo rendimiento funcional que el modelo oficial CustomVoice con un 50-60% menos de requisitos de memoria, a costa de una posible perdida menor de fidelidad acustica por la cuantizacion. La variante VoiceDesign anade la capacidad de disenar voces a partir de descripciones en lenguaje natural, mientras que la variante Base permite clonacion de voz con 3 segundos de audio de referencia.

## Limitaciones y advertencias

- La cuantizacion INT8 weight-only puede introducir una degradacion sutil en la calidad acustica respecto al modelo en FP16/BF16, especialmente en voces con mucha variacion prosodica o en idiomas tonales como el chino.
- No se dispone de informacion sobre el dataset de entrenamiento, por lo que no es posible evaluar sesgos demograficos, dialectales o culturales en los timbres generados.
- El modelo puede alucinar contenido o producir pronunciaciones incorrectas en nombres propios, siglas o terminos tecnicos poco frecuentes, especialmente en textos ruidosos o mal formateados.
- La cobertura de dialectos se limita a los 9 timbres premium predefinidos; no se admite clonacion de voz en esta variante (esa capacidad corresponde a la variante Base).
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable verificar que la cuantizacion realizada por Rin247 no haya introducido artefactos que afecten a la calidad en produccion.
- El modelo no soporta entrada de audio; es exclusivamente texto a voz. Para clonacion de voz o diseno de voces personalizadas, deben usarse las variantes Base o VoiceDesign respectivamente.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Rin247/Qwen3-TTS-12Hz-1.7B-CustomVoice-INT8
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Repositorio GitHub oficial: https://github.com/QwenLM/Qwen3-TTS
- Modelo VoiceDesign en HuggingFace: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Modelo en ModelScope: https://modelscope.ai/models/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Receta de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
