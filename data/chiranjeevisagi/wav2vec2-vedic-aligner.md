# chiranjeevisagi/wav2vec2-vedic-aligner

## Resumen

`wav2vec2-vedic-aligner` es un modelo de reconocimiento automático de voz (ASR) especializado en sánscrito védico cantado, desarrollado por el usuario de Hugging Face `chiranjeevisagi`. Se trata de un ajuste fino del checkpoint `addy88/wav2vec2-sanskrit-stt` orientado no a la transcripción libre, sino al **alineamiento forzado** de una transcripción conocida en devanagari sobre una recitación de audio. El modelo actúa como columna vertebral de alineamiento y pronunciación en una aplicación de evaluación de canto védico: los límites silábicos se extraen mediante `torchaudio.forced_align` sobre las emisiones del modelo y la calidad de pronunciación se mide con Goodness-of-Pronunciation a partir de sus posteriores.

Arquitectónicamente es un transformer convolucional wav2vec2 con cabeza CTC, de 94,4 millones de parámetros y vocabulario de 67 tokens heredado byte a byte del checkpoint base. Su relevancia radica en la mejora drástica del error de tasa de caracteres (CER) en dominios de recitación: pasa de 0,537 a 0,069 en el conjunto de test de Vedavani y de 0,191 a 0,064 en una grabación de profesor reservada, gracias en buena medida a la perturbación de velocidad aplicada durante el entrenamiento.

El modelo se distribuye con licencia Apache-2.0, en formatos safetensors y ONNX, y está etiquetado como compatible con endpoints de Hugging Face. No es un sistema ASR generalista de sánscrito: está entrenado específicamente para colocar con precisión sánscrito cantado cuando se dispone de la transcripción de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (encoder convolucional + transformer) con cabeza CTC |
| Parametros totales | 94.423.235 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clips de entrenamiento limitados a 16 s) |
| Tipos de cuantizacion | no disponible (repo incluye safetensors y ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | sánscrito (código `sa`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de wav2vec2 para ASR: un extractor de características convolucional que convierte la forma de onda en representaciones latentes, seguido de un encoder transformer y una cabeza de clasificación CTC sobre un vocabulario de 67 tokens. El vocabulario se reutiliza sin reconstruir desde `addy88/wav2vec2-sanskrit-stt`. Un detalle crítico heredado del checkpoint base es que el token que actúa realmente como blank CTC es `<s>` (id 0), no `<pad>`, pese a lo que indica la configuración nominal: `<s>` gana el argmax en aproximadamente el 89 % de las tramas mientras que `<pad>` nunca se activa.

El ajuste fino se realizó durante 20 épocas con learning rate 1e-4 lineal, 500 pasos de calentamiento, batch efectivo de 24, precisión fp16, encoder de características congelado y `ctc_loss_reduction="mean"`. Los datos de entrenamiento combinan Vedavani (43,5 horas de sánscrito cantado) con 15,5 minutos de recitaciones privadas completas de un profesor, cortadas en clips de frase mediante localización de texto y alineamiento forzado de la propia aplicación, y replicadas diez veces por época. Solo se entrenó con grabaciones del profesor, ya que etiquetar audio de estudiantes enseñaría al modelo a "oír" el texto independientemente de lo que el estudiante cante. La innovación técnica clave es la **perturbación de velocidad por remuestreo en el rango 0,85–1,25x**: sin ella, el modelo coloca correctamente la sílaba final alargada de una línea cantada a 1,0x pero la trunca por encima de 1,06x, lo que degrada la medición de ritmo. La selección del checkpoint se hizo sobre líneas de profesor reservadas, no sobre el split de validación de Vedavani. Los clips se limitaron a 16 segundos.

## Capacidades

- Reconocimiento de voz con CTC sobre sánscrito védico cantado, con salida de emisiones por trama.
- Alineamiento forzado de una transcripción conocida en devanagari sobre una recitación de audio mediante `torchaudio.forced_align`.
- Extracción de límites silábicos a partir de las emisiones alineadas.
- Evaluación de pronunciación mediante Goodness-of-Pronunciation calculada sobre las posteriores del modelo.
- Robustez a variaciones de tempo en el rango 0,85–1,25x gracias al entrenamiento con perturbación de velocidad.
- Soporte de inferencia en formato ONNX además de safetensors.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada más allá de la forma de onda, ni capacidades multilingües fuera del sánscrito.

## Casos de uso

- **Evaluación de recitación védica en aplicación móvil**: el modelo recibe el audio del estudiante junto con la transcripción de referencia y produce un alineamiento a nivel de sílaba que permite señalar qué segmentos se han cantado mal o fuera de tempo. Es adecuado porque su CER de 0,069 en Vedavani y de 0,066–0,071 en recitaciones completas no vistas garantiza límites fiables.
- **Puntuación de pronunciación (Goodness-of-Pronunciation)**: a partir de las posteriores CTC se calcula una métrica de confianza por fonema que alimenta un sistema de feedback automático al estudiante. El modelo reduce al 1,3 % las sílabas mal oídas en una interpretación correcta, frente al 7,2 % del checkpoint base, lo que evita falsos negativos en la evaluación.
- **Segmentación automática de corpus de recitaciones**: dado un audio largo y su texto, el alineamiento forzado permite cortar la grabación en unidades de frase o verso para construir datasets etiquetados, tal como hizo el propio autor para preparar los datos de entrenamiento.
- **Investigación en fonética y prosodia del sánscrito védico**: las emisiones y los límites silábicos permiten estudiar duraciones vocálicas, alargamientos finales de línea y variaciones de tempo entre recitadores, con una resolución temporal derivada del frame rate de wav2vec2.
- **Control de calidad en la enseñanza de recitación**: comparar la alineación del audio del estudiante con la del profesor sobre el mismo texto permite detectar desviaciones sistemáticas de ritmo o de articulación por alumno y generar informes de progreso.
- **Verificación de integridad de grabaciones**: comprobar que un audio corresponde realmente a la transcripción declarada, detectando omisiones, repeticiones o sustituciones de versos mediante la puntuación de alineamiento.
- **Prototipado de herramientas de evaluación lingüística**: servir como componente de alineamiento en pipelines de investigación que necesiten forzar texto sobre audio en lenguas con pocos recursos y escritura devanagari.

## Benchmarks y rendimiento

| Métrica | Modelo base | Este modelo |
|---|---|---|
| CER en test reservado de Vedavani | 0,537 | 0,069 |
| CER en grabación de profesor cantada reservada | 0,191 | 0,064 |
| CER en recitaciones completas no vistas (profesor / estudiante) | 0,126 / 0,133 (release anterior) | 0,066 / 0,071 |
| Sílabas mal oídas por el reconocedor en una interpretación correcta | 7,2 % | 1,3 % |

Los datos de la columna "release anterior" corresponden a la etiqueta `vedavani-12ep` (entrenamiento solo con Vedavani, 12 épocas). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: con 94,4 millones de parámetros, el modelo en fp32 ocupa aproximadamente 378 MB de pesos; en fp16, unos 189 MB. La VRAM total necesaria en la práctica es inferior a 2 GB incluyendo activaciones para clips de hasta 16 segundos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se puede ejecutar en A100, H100, RTX 4090, RTX 3090, RTX 3060 o incluso en GPUs de gama de entrada.
- Cabe holgadamente en GPU de consumo: sí, en cualquier tarjeta moderna con 4 GB o más, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `Wav2Vec2ForCTC` y `Wav2Vec2Processor`; el repo incluye pesos ONNX para despliegue con ONNX Runtime; es compatible con endpoints de Hugging Face. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / clips | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `chiranjeevisagi/wav2vec2-vedic-aligner` | 94,4 M | clips de 16 s en entrenamiento | sánscrito | Apache-2.0 | Ajustado para alineamiento forzado de canto védico; CER 0,069 en Vedavani |
| `addy88/wav2vec2-sanskrit-stt` (base) | no disponible | no disponible | sánscrito | no disponible | Checkpoint base; CER 0,537 en Vedavani, sin perturbación de velocidad |
| `chiranjeevisagi/wav2vec2-vedic-aligner` (tag `vedavani-12ep`) | 94,4 M | clips de 16 s | sánscrito | Apache-2.0 | Release anterior, solo Vedavani, 12 épocas; CER 0,126/0,133 en recitaciones completas |

No se dispone de información sobre otros modelos comparables de alineamiento forzado para sánscrito védico en la documentación proporcionada.

## Limitaciones y advertencias

- **El blank CTC es `<s>` (id 0), no `<pad>`**: es obligatorio pasar `blank=0` a `torchaudio.forced_align` y eliminar manualmente `<s>` al decodificar, ya que `processor.batch_decode` elimina el blank nominal y dejará `<s>` literal en cada hipótesis.
- **No es un ASR generalista de sánscrito**: está entrenado para colocar sánscrito cantado con transcripción conocida, no para transcribir audio libre.
- **Sensibilidad al tempo fuera del rango entrenado**: aunque la perturbación 0,85–1,25x mejora la robustez, no se documenta comportamiento fuera de ese rango.
- **Dependencia de la transcripción de referencia**: el alineamiento forzado requiere el texto en devanagari; errores o variantes en la transcripción degradan el resultado.
- **Datos de entrenamiento privados no distribuidos**: las grabaciones del profesor y del estudiante no se publican, lo que limita la reproducibilidad exacta del ajuste.
- **Riesgo de sesgo hacia el estilo del profesor**: el modelo se seleccionó sobre líneas de un único profesor y tres suktas, por lo que puede generalizar peor a otros recitadores, escuelas o tradiciones de canto.
- **Riesgo de alucinación en la decodificación libre**: al ser un modelo CTC entrenado para alineamiento, la decodificación sin restricciones puede producir salidas poco fiables; no se han publicado métricas de WER en habla espontánea.
- **Limitación de idioma**: solo sánscrito (`sa`); no soporta otras lenguas ni code-switching.
- **Licencia Apache-2.0**: permite uso comercial, pero se recomienda verificar las condiciones del checkpoint base `addy88/wav2vec2-sanskrit-stt` y del corpus Vedavani, cuyas licencias no se detallan en la información disponible.
- **Longitud de audio**: los clips de entrenamiento se limitaron a 16 segundos; para recitaciones completas es necesario segmentar o gestionar la memoria en inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chiranjeevisagi/wav2vec2-vedic-aligner
- Checkpoint base: https://huggingface.co/addy88/wav2vec2-sanskrit-stt
- Release anterior (tag `vedavani-12ep`): https://huggingface.co/chiranjeevisagi/wav2vec2-vedic-aligner/tree/vedavani-12ep
- Documentación de `torchaudio.forced_align`: https://pytorch.org/audio/stable/generated/torchaudio.functional.forced_align.html
- Documentación de `Wav2Vec2ForCTC` en transformers: https://huggingface.co/docs/transformers/model_doc/wav2vec2
