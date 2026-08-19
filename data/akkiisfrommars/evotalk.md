# akkiisfrommars/EvoTalk

## Resumen

EvoTalk es un modelo de síntesis de voz (text-to-speech) de un solo hablante, desarrollado por el autor akkiisfrommars bajo el nombre de proyecto Mistyoz AI. Se trata de un sistema acústico construido desde cero en PyTorch que predice espectrogramas mel a partir de fonemas, y que utiliza el vocoder Vocos para generar audio final a 24 kHz. El modelo está diseñado como una arquitectura independiente, sin depender de componentes preentrenados de terceros, lo que lo convierte en un ejercicio técnico interesante para quienes quieran estudiar o extender un pipeline TTS completo.

La arquitectura sigue un esquema similar al de CosmicFish: un codificador y un decodificador transformer con atención GQA, posiciones rotatorias (RoPE), SwiGLU y normalización RMSNorm, rodeando un adaptador de varianza que predice duración, tono (pitch) y energía por fonema. Con aproximadamente 80 millones de parámetros, el modelo es relativamente compacto. Se entrenó con 53 horas de voz del hablante 9017 del corpus Hi-Fi TTS, lo que le permite producir una voz masculina inteligible, aunque la versión actual (v1) presenta un claro sobreajuste a esos datos y no generaliza bien a otros hablantes o prosodias. A pesar de ello, resulta útil para síntesis de voz de un solo hablante en escenarios controlados.

La relevancia de EvoTalk reside en su carácter didáctico y reproducible: el autor publica el código fuente, los scripts de preparación, entrenamiento e inferencia, y las curvas de pérdida, lo que permite a desarrolladores e investigadores replicar el pipeline completo y experimentar con mejoras. La licencia Apache 2.0 facilita su uso y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (GQA, RoPE, SwiGLU, RMSNorm) con variance adaptor y length regulator |
| Parametros totales | ~80 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo TTS acústico, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (entrenado con texto en ARPABET, probablemente inglés, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (probablemente PyTorch .pt/.pth, no se indica) |

## Arquitectura y entrenamiento

EvoTalk emplea una arquitectura de tipo CosmicFish, compuesta por un transformer encoder y un transformer decoder que rodean a un adaptador de varianza. El adaptador predice por fonema la duración, el contorno de tono y la energía, y un regulador de longitud expande la secuencia enriquecida al nivel de trama (frame) para generar el espectrograma mel. La atención usa grupos de consultas (GQA), posiciones rotatorias (RoPE), activación SwiGLU y normalización RMSNorm, componentes habituales en modelos modernos de secuencia.

El entrenamiento se realizó sobre el corpus Hi-Fi TTS, concretamente con el hablante 9017 (masculino), con aproximadamente 53 horas y 51 000 utterances. El texto se convirtió a ARPABET mediante espeak, y las duraciones se obtuvieron con alineación forzada MMS. Las características acústicas son espectrogramas mel log-magnitud con 100 bandas y frecuencia máxima de 12 kHz, configuradas exactamente para coincidir con el vocoder Vocos. El tono (pitch) se extrajo como contorno continuo y la energía por frame, ambos en GPU. La pérdida combina L1 y MSE con enmascaramiento, se usa entrenamiento de precisión mixta (AMP) y un programador de tasa de aprendizaje coseno. El autor indica que la versión v1 está sobreajustada a los datos de entrenamiento, por lo que la generalización a nuevos hablantes o prosodias es limitada; una segunda versión está en desarrollo.

## Capacidades

- Síntesis de voz de un solo hablante: genera audio inteligible a partir de texto, con una voz masculina fija (hablante 9017 de Hi-Fi TTS).
- Predicción de espectrogramas mel: el modelo produce representaciones mel de 100 bandas a 24 kHz, listas para ser vocodeadas con Vocos.
- Control prosódico básico: el variance adaptor predice duración, tono y energía por fonema, lo que permite en principio modificar la prosodia (aunque la generalización es limitada).
- Chunking de frases: el script de inferencia (`inference.py`) divide el texto en frases o cláusulas para sintetizar de forma interactiva.
- Visualización de espectrogramas: el script `predict.py` renderiza el mel predicho como imagen, útil para depuración.
- Pipeline reproducible: incluye scripts de preparación, entrenamiento, fine-tuning y barrido de checkpoints, lo que permite replicar todo el proceso.

## Casos de uso

- Narración de audiolibros con una voz fija: dado que el modelo solo produce una voz masculina concreta, puede usarse para generar narraciones en entornos donde no se requiera variedad de locutores, siempre que el texto esté en el idioma soportado (probablemente inglés).
- Prototipado de sistemas TTS: los desarrolladores pueden utilizar EvoTalk como base para experimentar con arquitecturas de variance adaptor o para integrar un pipeline TTS completo en un proyecto de investigación.
- Generación de voces para asistentes virtuales de demostración: en aplicaciones de prueba o demos técnicas, una voz sintética fija es suficiente para validar la interacción.
- Investigación en sobreajuste y generalización en TTS: el propio autor reconoce el sobreajuste del modelo; esto lo convierte en un caso de estudio para analizar técnicas de regularización o aumento de datos en síntesis de voz.
- Educación en arquitecturas de TTS: al ser un modelo compacto y de código abierto, es adecuado para cursos o talleres donde se enseñe el flujo completo desde texto a audio.
- Evaluación de vocoders: al estar acoplado con Vocos, puede usarse para probar diferentes vocoders sobre los mismos espectrogramas mel, aunque requeriría adaptar el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) o comparativas con otros modelos TTS.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. Sin embargo, dado que el modelo tiene ~80 millones de parámetros y genera espectrogramas mel, es razonable estimar que puede ejecutarse en GPUs consumer con al menos 4-6 GB de VRAM para inferencia, y posiblemente menos si se usa cuantización o CPU (aunque no se indica soporte). Para entrenamiento, se necesitaría una GPU con al menos 8-12 GB de VRAM, dado el uso de precisión mixta. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje; el despliegue se realizaría mediante el script `inference.py` o integrando el modelo en un servidor Python.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de comparación con otros modelos TTS como Tacotron 2, FastSpeech 2, VITS o similares.

## Limitaciones y advertencias

- Sobreajuste severo: el modelo v1 está sobreajustado al hablante 9017 de Hi-Fi TTS, por lo que no generaliza bien a otros hablantes, prosodias o condiciones de habla.
- Un solo hablante: solo produce una voz masculina específica; no es posible cambiar de locutor sin reentrenar.
- Idioma limitado: aunque no se especifica, el uso de ARPABET sugiere que el modelo solo funciona con texto en inglés (fonética americana).
- Riesgo de alucinaciones acústicas: como cualquier modelo TTS, puede generar artefactos o pronunciaciones incorrectas en textos fuera del dominio de entrenamiento.
- Sin soporte para tool calling, agentes o razonamiento: es un modelo acústico puro, no un LLM.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe mantener el aviso de copyright y atribución.
- Estado de desarrollo: el autor indica que una segunda versión está en desarrollo; la v1 debe considerarse experimental.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/akkiisfrommars/EvoTalk)
