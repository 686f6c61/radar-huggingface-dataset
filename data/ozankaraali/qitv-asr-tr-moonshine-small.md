# ozankaraali/qitv-asr-tr-moonshine-small

## Resumen

QiTV ASR Turkish Moonshine Small es un modelo de reconocimiento automático del habla (ASR) especializado en turco y con capacidad secundaria de transcripción en inglés, desarrollado por el usuario ozankaraali como parte del proyecto QiTV. Se trata de un ajuste fino del modelo base Moonshine Streaming Small de moonshine-ai, orientado específicamente a subtitulado en directo de diálogos de televisión, series y canciones, y diseñado para ejecutarse de forma totalmente offline en CPU mediante cuantización int8.

El modelo resuelve el problema de la transcripción de audio conversacional y dramático en turco, un dominio donde los ASR genéricos suelen fallar por la presencia de solapamientos, música de fondo y habla coloquial. Con 117 millones de parámetros totales y un vocabulario SentencePiece de 10.623 piezas compartido entre turco e inglés, ofrece una alternativa ligera frente a modelos de mayor tamaño que no caben en hardware de consumo o que requieren GPU.

Su relevancia actual radica en que combina privacidad (todo el procesamiento ocurre en el dispositivo del usuario), coste cero por minuto y un rendimiento competitivo en dominios conversacionales, aunque queda por detrás de modelos como mihu-v2 en habla leída y noticias. La licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Moonshine Streaming (transformer encoder-decoder para ASR en streaming) |
| Parámetros totales | 117.458.744 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | segmentos de audio de hasta ~25 segundos (recomendado); no se especifica límite de tokens de texto |
| Tipos de cuantización | int8 (ONNX cuantizado para sherpa-onnx); fp32 en safetensors |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (fp32), ONNX (int8 cuantizado), SentencePiece (tr.model) |

## Arquitectura y entrenamiento

El modelo se basa en Moonshine Streaming Small, una arquitectura transformer encoder-decoder diseñada específicamente para reconocimiento de voz en streaming de baja latencia. El ajuste fino se realizó sobre aproximadamente 7.700 horas de habla en turco, con predominio de audio conversacional, lo que explica su buen comportamiento en diálogos de series y canciones frente a otros modelos entrenados con corpus más formales.

El vocabulario es un SentencePiece de 10.623 piezas que cubre tanto turco como inglés, lo que permite la transcripción bilingüe en un único modelo. No se dispone de información detallada sobre la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de la propia arquitectura Moonshine Streaming. El modelo produce texto con mayúsculas y puntuación, y escribe los números en palabras ("on yedi" en lugar de "17"), con scripts auxiliares para convertirlos a dígitos.

## Capacidades

- Transcripción de voz a texto en turco e inglés con un único modelo.
- Reconocimiento de habla conversacional, diálogos de televisión, series y canciones.
- Salida con mayúsculas, puntuación y números escritos en palabras.
- Transcripción de audio en streaming con segmentos de hasta ~25 segundos.
- Ejecución offline en CPU mediante cuantización int8 (sherpa-onnx).
- Integración con Transformers (PyTorch) para uso o reentrenamiento.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso.
- No se documenta soporte de visión ni audio más allá del ASR.

## Casos de uso

- Subtitulado en directo de series y programas de televisión: el modelo está entrenado específicamente con diálogos de drama televisivo turco y obtiene un 14,3 % de WER en el conjunto Drama A, frente al 19,2-26,2 % de alternativas, lo que lo hace adecuado para generación de subtítulos automáticos en emisiones.
- Subtitulado de canciones y contenido musical: supera a los modelos comparados en letras cantadas, útil para karaoke o accesibilidad musical.
- Aplicaciones de accesibilidad offline: al ejecutarse en CPU con int8 y sin conexión, permite generar subtítulos en dispositivos sin GPU y sin enviar audio a la nube, preservando la privacidad.
- Transcripción de reuniones y conversaciones informales en turco: su entrenamiento en habla conversacional lo hace adecuado para notas de reuniones, entrevistas y podcasts.
- Sistemas de atención al cliente con transcripción local: integrable en pipelines que requieran procesamiento en el dispositivo sin coste por minuto.
- Investigación y desarrollo de ASR en turco: al ser un ajuste fino sobre Moonshine con licencia CC-BY-4.0, sirve como base para experimentación y reentrenamiento.
- Generación de transcripciones bilingües turco-inglés en entornos educativos o de traducción.

## Benchmarks y rendimiento

Los resultados se expresan como tasa de error de palabras (WER, en %; menor es mejor). El scorer ignora mayúsculas y puntuación y compara números como palabras habladas.

| Conjunto de test | Clips | Este modelo | Moonshine medium | Conformer | mihu-v2 | ufakzeka-kulak | balbal-v2 | zipformer-asr-turkish-v1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FLEURS Turkish, test | 743 | 13,6 | 11,7 | 11,4 | 7,9 | 9,4 | 8,0 | 9,4 |
| Common Voice 27.0 Turkish, test (1.500 aleatorios) | 1.500 | 13,1 | 10,0 | 11,0 | 6,0 | 9,3 | 7,0 | 9,6 |
| MediaSpeech Turkish (noticias, primeros 150 clips) | 150 | no disponible (dato truncado en la información) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

En Drama A (test propio) el modelo obtiene un 14,3 % de WER, frente al 19,2-26,2 % de mihu-v2, zipformer-asr-turkish-v1, ufakzeka-kulak y balbal-v2. En inglés, el modelo medium obtiene 13,4 en VoxPopuli frente a 18,8 de balbal-v2; no se proporciona el dato exacto de este modelo small en VoxPopuli.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo int8 ocupa 75 MB (encoder) + 69 MB (decoder), por lo que cabe en cualquier CPU moderna.
- GPU recomendadas: no necesarias; opcionalmente cualquier GPU con suficiente memoria para el checkpoint fp32 de 471 MB.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer (incluso integradas) por el reducido tamaño.
- Opciones de despliegue: sherpa-onnx 2.0.1 (formato probado por QiTV), Transformers 5.22.1 con PyTorch, y potencialmente llama.cpp/Ollama no aplican por ser ASR.
- Latencia y throughput: no se proporcionan datos numéricos; el modelo está diseñado para streaming de baja latencia en CPU con `num_threads=2`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Fortaleza principal | Disponibilidad |
|---|---|---|---|---|---|
| QiTV ASR Turkish Moonshine Small (este) | 117M | tr, en | CC-BY-4.0 | Diálogo TV, canciones, offline CPU | Hugging Face |
| mihu-v2 (turkish-stt-66m-v2) | 66M | tr | no disponible | Habla leída, noticias, FLEURS, Common Voice | Hugging Face |
| qitv-asr-tr-moonshine-mid | ~2x este | tr, en | no disponible | Más preciso que small, inglés | Hugging Face |
| balbal-v2 | no disponible | tr, en | no disponible | Inglés y turco | Hugging Face |

## Limitaciones y advertencias

- En habla leída, noticias y YouTube, varios modelos abiertos en turco son más precisos; mihu-v2 es el más exacto en esos dominios.
- En segmentos de audio mucho más largos de ~25 segundos, la decodificación simple puede empezar a repetirse; se recomienda cortar en pausas con un detector de actividad de voz.
- El modelo está optimizado para diálogo televisivo y conversacional; su rendimiento en dominios formales es inferior.
- Riesgo de alucinación y repetición en audio de baja calidad o con mucho ruido de fondo.
- Licencia CC-BY-4.0: permite uso comercial con atribución; no se especifican restricciones adicionales.
- Solo soporta turco e inglés; no cubre otras lenguas.
- El modelo base tiene 140M parámetros con un vocabulario mayor; este ajuste reduce el vocabulario a 10.623 piezas, lo que puede afectar a la cobertura de términos poco frecuentes.

## Enlaces

- Hugging Face: https://huggingface.co/ozankaraali/qitv-asr-tr-moonshine-small
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-streaming-small
- Modelo hermano medium: https://huggingface.co/ozankaraali/qitv-asr-tr-moonshine-mid
- Modelo hermano conformer: https://huggingface.co/ozankaraali/qitv-asr-tr-conformer
- Repositorio QiTV: https://github.com/ozankaraali/QiTV
- Scripts QiTV ASR: https://github.com/ozankaraali/qitv-asr
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- mihu-v2: https://huggingface.co/mihuai/turkish-stt-66m-v2
- ufakzeka-kulak: https://huggingface.co/ufakai/ufakzeka-kulak
- balbal-v2: https://huggingface.co/erayyapagci/balbal-v2
- zipformer-asr-turkish-v1: https://huggingface.co/oayk/zipformer-asr-turkish-v1
