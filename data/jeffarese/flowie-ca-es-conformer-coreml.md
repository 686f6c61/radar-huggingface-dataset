# Jeffarese/flowie-ca-es-conformer-coreml

## Resumen

FlowIe ca-es Conformer CoreML es una conversión a CoreML del modelo de reconocimiento automático del habla `projecte-aina/stt_ca-es_conformer_transducer_large`, desarrollado originalmente por el Barcelona Supercomputing Center (projecte-aina) a partir del `nvidia/stt_es_conformer_transducer_large`. El autor de la conversión es Jeffarese, y su objetivo es habilitar la transcripción en directo en dispositivos con Apple Silicon, aprovechando el Neural Engine mediante pesos en fp16 para el codificador y fp32 en CPU para el espectrograma mel.

El modelo resuelve el problema de la transcripción de voz bilingüe catalán-castellano en local, sin depender de servicios en la nube, algo relevante para aplicaciones de privacidad, latencia baja y funcionamiento offline. La arquitectura subyacente es un Conformer con transducer RNNT (encoder Conformer + predictor LSTM + joint network), con una ventana fija de 15 segundos y un vocabulario de 256 piezas SentencePiece.

La conversión mantiene los pesos originales sin modificar y solo adapta la topología para que el Neural Engine pueda ejecutar las convoluciones depthwise (divididas en taps de 11+10+10 con BatchNorm plegado). El resultado es un paquete CoreML de 0,2 GB con seis submodelos especializados (mel, encoder, decoder, joint, joint_block y vocabulario) que reproduce prácticamente la precisión del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer + transducer RNNT (encoder Conformer, predictor LSTM, joint network) |
| Parámetros totales | no disponible (el modelo base es "large"; no se especifica el recuento exacto) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de 15 s de audio (376 frames de 40 ms; mel de 1501 frames) |
| Tipos de cuantización | fp16 en el encoder (Neural Engine); fp32 en el mel (CPU); sin cuantización entera |
| Idiomas soportados | catalán (ca), castellano (es) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | CoreML (`.mlmodelc` compilado con coremltools 9.0); vocab en `vocab.json` |

## Arquitectura y entrenamiento

La arquitectura es un Conformer-Transducer: un encoder Conformer (convoluciones depthwise, atención multi-cabeza y módulos feed-forward) que transforma el espectrograma mel en representaciones de 640 dimensiones, un predictor LSTM que modela la secuencia de tokens emitidos y una red joint que combina ambas para producir la distribución sobre el vocabulario. La decodificación es RNNT greedy, con un máximo de 10 símbolos por frame.

Los datos de entrenamiento no se detallan en la información disponible; el modelo original fue desarrollado por projecte-aina y fine-tuneado desde el modelo de NVIDIA para castellano, lo que sugiere un corpus bilingüe catalán-castellano, pero no se especifica el número de horas ni la composición exacta. La conversión no altera los pesos: solo modifica la representación de las convoluciones depthwise (split en taps 11+10+10 con BatchNorm plegado) para que el Neural Engine pueda ejecutarlas, y fija una ventana de 15 s con padding a ceros para audios más cortos.

La innovación principal de esta ficha no está en el entrenamiento sino en el despliegue: la separación en submodelos (mel en CPU fp32, encoder/joint/decoder en Neural Engine fp16) permite ejecutar el pipeline completo en local con una precisión prácticamente idéntica a la del modelo NeMo fp32 original.

## Capacidades

- Reconocimiento automático del habla (ASR) en catalán y castellano, con salida en minúsculas y sin puntuación.
- Transcripción en directo sobre audio de 16 kHz con ventana fija de 15 s.
- Ejecución on-device en Apple Silicon, con el encoder en el Neural Engine y el mel en CPU.
- Decodificación greedy RNNT con hasta 10 símbolos por frame.
- Manejo de audio más corto que 15 s mediante padding a ceros y longitud válida en `audio_frames`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No soporta visión, audio generativo ni modo "thinking".
- Capacidades multilingües limitadas a los dos idiomas indicados (ca, es).

## Casos de uso

- Transcripción en directo en apps de macOS/iOS: el paquete CoreML está pensado para ejecutarse en el Neural Engine con ventanas de 15 s, lo que permite subtitulado o dictado en tiempo real sin conexión.
- Dictado por voz bilingüe catalán-castellano: útil en entornos donde el usuario alterna ambos idiomas, ya que el modelo cubre las dos lenguas con un único vocabulario SentencePiece.
- Reuniones y notas de voz offline: la transcripción local evita enviar audio a servidores, adecuado para sectores con requisitos de privacidad (salud, legal, administración pública).
- Accesibilidad: subtitulado automático de vídeos o conversaciones presenciales en dispositivos Apple, con latencia baja al ejecutarse en el Neural Engine.
- Preprocesado de audio para pipelines NLP: generar transcripciones que alimenten sistemas de resumen, búsqueda o análisis de sentimiento en catalán y castellano.
- Investigación en ASR on-device: servir como referencia para comparar latencia y precisión de despliegues CoreML frente a NeMo fp32 en el mismo hardware.

## Benchmarks y rendimiento

Resultados de WER en el conjunto de test de FLEURS (minúsculas, sin puntuación), comparando el modelo fuente NeMo fp32 con esta conversión fp16 en el Neural Engine:

| Modelo | Catalán (200 enunciados) | Castellano (100 enunciados) |
|---|---|---|
| NeMo fp32 (modelo fuente) | 2,82 % WER | 5,86 % WER |
| Esta conversión, encoder fp16 en Neural Engine | 2,84 % WER | 5,77 % WER |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el paquete CoreML ocupa 0,2 GB en disco y se ejecuta en memoria unificada de Apple Silicon.
- GPU recomendadas: no requiere GPU dedicada; el encoder, decoder y joint se ejecutan en el Neural Engine de los chips Apple (M-series y A-series compatibles).
- Cabe en hardware consumer: sí, en cualquier Mac o dispositivo Apple con Neural Engine; el mel se ejecuta en CPU en fp32.
- Opciones de despliegue: CoreML (coremltools 9.0, `compile_model`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| FlowIe ca-es Conformer CoreML (esta ficha) | Conformer + RNNT | ca, es | ventana fija 15 s | CC-BY-4.0 | CoreML fp16/fp32 |
| projecte-aina/stt_ca-es_conformer_transducer_large | Conformer + RNNT | ca, es | no disponible | CC-BY-4.0 | NeMo (pesos originales) |
| nvidia/stt_es_conformer_transducer_large | Conformer + RNNT | es | no disponible | CC-BY-4.0 | NeMo |

La comparación se limita al linaje directo del modelo, ya que no se dispone de datos de benchmarks de otras alternativas en la información proporcionada. La diferencia clave frente al modelo fuente es el formato de despliegue (CoreML frente a NeMo) y la precisión prácticamente idéntica (2,84 % frente a 2,82 % WER en catalán; 5,77 % frente a 5,86 % en castellano).

## Limitaciones y advertencias

- Salida en minúsculas y sin puntuación: no genera mayúsculas ni signos de puntuación, lo que requiere postprocesado para muchos usos finales.
- Ventana fija de 15 s: audios más largos deben segmentarse; audios más cortos se rellenan con ceros, lo que puede afectar a la eficiencia en clips muy breves.
- Idiomas limitados a catalán y castellano; no cubre otras lenguas ni code-switching con idiomas fuera de ese par.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes; el WER de referencia (2,82 %–5,86 %) corresponde a FLEURS, un corpus relativamente limpio.
- Sesgos conocidos: no se documentan en la información disponible; al heredar los datos de entrenamiento del modelo base, pueden persistir sesgos de dominio y de registro lingüístico.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; es obligatorio citar a projecte-aina, NVIDIA y el autor de la conversión.
- Dependencia de hardware Apple: el paquete CoreML no es portable a otras plataformas sin reconversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/Jeffarese/flowie-ca-es-conformer-coreml
- Modelo base: https://huggingface.co/projecte-aina/stt_ca-es_conformer_transducer_large
- Modelo original de NVIDIA: https://huggingface.co/nvidia/stt_es_conformer_transducer_large
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Repositorio Flowie (conversor y decodificador de referencia): no disponible como URL en la información proporcionada
- ovos-stt-plugin-coreml (base del conversor, Apache-2.0): no disponible como URL en la información proporcionada
