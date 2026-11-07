# Smsadik/vosk-model-small-streaming-bn

## Resumen

Vosk model small streaming bn es un modelo de reconocimiento automático del habla (ASR) para bengalí, publicado por el usuario Smsadik en Hugging Face y derivado del modelo original de Alphacephei (Vosk). Se trata de un modelo compacto orientado a la transcripción en tiempo real (streaming), empaquetado en formato ONNX y pensado para ejecutarse en entornos con recursos limitados mediante la pila sherpa-onnx. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma su carácter ligero frente a los modelos ASR de gran tamaño.

El modelo se basa en la arquitectura Zipformer2 del proyecto k2-fsa/icefall, una familia de redes de conformadores convolucionales con atención lineal eficiente, entrenada específicamente con datos en bengalí. La versión declarada es la 0.60 y está licenciada bajo Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución de dicha licencia.

Su relevancia radica en cubrir un idioma de bajos recursos como el bengalí con un modelo que cabe en dispositivos modestos y funciona en modo streaming, algo poco habitual en el ecosistema ASR abierto. Los resultados declarados por el autor sitúan el WER entre el 16,6 % y el 32,9 % según el conjunto de evaluación, con especial buen comportamiento en Respin 2025 (16,6 %) y Common Voice bn (17,9 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 (k2-fsa/icefall) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de streaming por tramas de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bengalí (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Zipformer2, un transformer convolucional con mecanismos de atención lineal y estructura de conformador multi-resolución, implementada en el framework k2-fsa/icefall. Esta familia está diseñada para ASR de extremo a extremo con decodificación CTC o transducer, y su variante "streaming" procesa el audio por fragmentos con estado interno, lo que permite transcripción en tiempo real con latencia baja.

Según la model card, el entrenamiento se realizó con datos en bengalí y el modelo se exporta a ONNX para su uso con sherpa-onnx. No se especifican en la información disponible el número de horas de audio, la composición exacta del corpus, ni si se aplicaron técnicas de aumento de datos o regularización adicionales. Tampoco se documenta el uso de RLHF, DPO u otros ajustes posteriores, algo esperable en un modelo ASR. La versión publicada es la 0.60.

## Capacidades

- Reconocimiento automático del habla en bengalí con salida de texto.
- Funcionamiento en modo streaming, procesando audio de forma incremental.
- Ejecución sobre sherpa-onnx, con soporte para despliegue en CPU y dispositivos de borde.
- Modelo compacto (repo de 0,1 GB) apto para entornos con memoria limitada.
- Integración con la pila Vosk para aplicaciones de dictado y transcripción.
- No se documentan capacidades de traducción, diarización, puntuación automática ni detección de idioma.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no aplicables a un modelo ASR).

## Casos de uso

- Transcripción en tiempo real de reuniones y llamadas en bengalí: el modo streaming permite generar texto a medida que llega el audio, con latencia baja gracias al procesamiento por tramas.
- Subtitulado automático de vídeo y audio en bengalí: el modelo puede alimentar pipelines de generación de subtítulos en plataformas de contenido, con la ventaja de su tamaño reducido para procesamiento por lotes en servidores modestos.
- Asistentes de voz para dispositivos de borde: al ejecutarse vía sherpa-onnx en CPU, puede integrarse en raspberry pi, móviles o sistemas empotrados para comandos de voz en bengalí.
- Atención al cliente automatizada en bengalí: transcripción de llamadas para análisis de calidad, enrutamiento o generación de actas, usando el modelo como primer eslabón de un pipeline ASR + NLP.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en directo de conversaciones o medios en bengalí.
- Investigación en ASR de bajos recursos: modelo de referencia ligero para experimentos con Zipformer2 y comparación de técnicas de adaptación al bengalí.
- Indexación y búsqueda de archivos de audio: transcripción masiva de archivos para construir índices de búsqueda textual sobre contenido hablado en bengalí.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Conjunto de evaluacion | Metrica | Valor |
|---|---|---|
| Banspeech | Test WER | 32,9 % |
| Common Voice (bn) | Test WER | 17,9 % |
| Fleurs (bn) | Test WER | 20,6 % |
| IndicTTS | Test WER | 30,9 % |
| Kathbath | Test WER | 19,3 % |
| Kathbath Noisy | Test WER | 22,5 % |
| Respin 2023 | Test WER | 20,9 % |
| Respin 2025 | Test WER | 16,6 % |
| Subakko | Test WER | 24,6 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, la huella de memoria es muy reducida y no requiere GPU dedicada.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU mediante sherpa-onnx.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer, aunque no se documentan requisitos específicos.
- Opciones de despliegue: sherpa-onnx (recomendado), pila Vosk, y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el modo streaming sugiere latencia baja, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Tamano repo | Licencia | WER declarado |
|---|---|---|---|---|---|
| Smsadik/vosk-model-small-streaming-bn | bn | Zipformer2 | 0,1 GB | Apache 2.0 | 16,6 %–32,9 % segun dataset |
| alphacep/vosk-model-small-streaming-bn | bn | Zipformer2 | no disponible | no disponible | no disponible |
| Otros modelos ASR bengalí | bn | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de otros autores en la información proporcionada. El modelo de Alphacephei es el origen directo de esta publicación y comparte arquitectura y versión (0.60).

## Limitaciones y advertencias

- Los resultados de WER son declarados por el autor y no están verificados de forma independiente (campo `verified: false` en el model-index).
- El modelo solo soporta bengalí; no cubre otros idiomas ni code-switching documentado.
- No se documentan sesgos específicos, pero al entrenarse con corpus limitados puede presentar peor rendimiento en dialectos, acentos regionales o habla espontánea no representada.
- Riesgo de alucinación inherente a los modelos ASR: puede generar transcripciones plausibles pero incorrectas en audio ruidoso o con solapamiento de hablantes.
- No se documentan umbrales de confianza ni mecanismos de puntuación; la salida puede carecer de mayúsculas y signos de puntuación.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir al autor original.
- No se especifican requisitos mínimos de hardware ni límites de longitud de audio; conviene validar el rendimiento en el dominio de producción antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- [Hugging Face: Smsadik/vosk-model-small-streaming-bn](https://huggingface.co/Smsadik/vosk-model-small-streaming-bn)
- [Hugging Face: alphacep/vosk-model-small-streaming-bn](https://huggingface.co/alphacep/vosk-model-small-streaming-bn)
- [Vosk](https://alphacephei.com/vosk)
- [k2-fsa/icefall](https://github.com/k2-fsa/icefall)
- [k2-fsa/sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx)
