# kuberstar-com/gigaam-v3-e2e-rnnt-coreml

## Resumen

GigaAM v3 e2e RNN-T para Core ML es una conversión del modelo de reconocimiento automático del habla (ASR) GigaAM v3 de Sber, en su variante `e2e_rnnt`, empaquetada específicamente para su ejecución nativa en Apple Silicon mediante Core ML. El modelo original, publicado por ai-sage bajo licencia MIT, está entrenado para transcribir audio en ruso con puntuación y capitalización integradas, y esta build lo adapta a los frameworks de Apple (Core ML, Metal y Neural Engine) para su uso en macOS.

La conversión la firma el usuario kuberstar-com y se apoya en una arquitectura Conformer con decodificador RNN-T. El aporte técnico diferencial de esta build es la incorporación de una máscara de longitud en el encoder: el modelo recibe la longitud real del audio y enmascara todo lo posterior, de modo que una frase rellenada hasta la ventana fija de 30 segundos produce exactamente la misma transcripción que el audio sin rellenar. Esto corrige un comportamiento del `ConformerEncoder` de referencia, que solo construye la máscara de atención para lotes de tamaño mayor que uno.

El resultado es un paquete de 0,4 GB con pesos fp16, pensado para inferencia local de baja latencia en Macs con chip de Apple (M-series). Es relevante para desarrolladores que necesiten transcripción de ruso en local, sin depender de servicios en la nube y con un consumo de recursos contenido. No obstante, el repositorio no incluye datos de benchmarks de calidad ASR (WER/CER), por lo que la evaluación de precisión queda fuera de lo documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) + RNN-T (predictor LSTM + joint network) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana fija de 30 s de audio (3000 frames mel); encoder produce 750 frames |
| Tipos de cuantizacion | fp16 (pesos y cómputo del encoder); int8 probado pero descartado por degradación |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT |
| Formato de pesos | Core ML (`Encoder.mlmodelc`, `Predictor.mlmodelc`, `JointDecision.mlmodelc`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Conformer para el encoder y RNN-T para la decodificación. El encoder es un Conformer que recibe log-mel de 64 bandas HTK (n_fft 320, ventana 320, hop 160, `center=False`, sin normalización, con `log(clamp(x, 1e-9, 1e9))`) y aplica dos convoluciones con stride 2, calculando los frames como `(n - 1) // 2 + 1` dos veces. La salida del encoder tiene forma `[1, 768, 750]` en fp16. El predictor es un único paso de LSTM con estado oculto y de celda de dimensión 320, y la red conjunta (joint network) fusiona la salida del encoder y del predictor con argmax para producir el token. El vocabulario consta de 1024 piezas SentencePiece más el token `<blk>` (índice 1024), y la decodificación es greedy con un máximo de 10 símbolos por frame.

El entrenamiento original corresponde a GigaAM v3 de Sber (ai-sage), del que esta build es una conversión en el commit `7655ad717f8122257385bb4b2f373db3697e8680`. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable de esta conversión es la máscara de longitud explícita en el encoder, que garantiza que el padding hasta los 30 s no afecte a la atención ni a las convoluciones, evitando la pérdida de puntuación final que ocurre en exportaciones sin máscara. Los módulos `Predictor.mlmodelc` y `JointDecision.mlmodelc` se copian sin cambios de la build `maxhlv/gigaam-v3-coreml`. El entorno de conversión empleado fue torch 2.7.1, coremltools 9.0 y la librería `gigaam` en el commit `7447938d791c4f3e643386ee22c33777004293a5`, con target macOS 15.

## Capacidades

- Reconocimiento automático del habla (ASR) en ruso con puntuación y capitalización integradas en la salida.
- Transcripción de audio con ventana fija de 30 segundos, con máscara de longitud que preserva la calidad en audios más cortos rellenados.
- Manejo de términos en inglés dentro de frases en ruso (según las pruebas sintéticas documentadas).
- Decodificación greedy token a token mediante RNN-T, con vocabulario SentencePiece de 1024 piezas.
- Ejecución nativa en Apple Silicon (GPU, Neural Engine y CPU) mediante Core ML.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio más allá de ASR ni modo "thinking".

## Casos de uso

- Transcripción local de reuniones en ruso: el modelo procesa audio de hasta 30 s por ventana con puntuación y mayúsculas, adecuado para integrarse en una app de macOS que trocee la grabación en segmentos y los transcriba en el dispositivo.
- Subtitulado de vídeo en ruso: la latencia de 23 ms en GPU para la ventana de 30 s permite generar subtítulos casi en tiempo real en un Mac con chip M-series, sin enviar audio a la nube.
- Dictado por voz en aplicaciones de escritorio: la build Core ML se integra en apps macOS nativas y aprovecha el Neural Engine para bajo consumo energético, lo que la hace apta para dictado continuo.
- Procesamiento por lotes de archivos de audio en pipelines locales: el encoder con máscara de longitud permite rellenar todos los audios a 30 s sin degradar la transcripción, simplificando el batching en un script de macOS.
- Investigación en ASR sobre ruso: al ser una conversión fiel del modelo de Sber con licencia MIT, sirve como referencia reproducible para comparar implementaciones Core ML frente a PyTorch.
- Transcripción de audio con mezcla ruso-inglés: las pruebas sintéticas documentadas incluyen una frase mixta, por lo que puede emplearse en entornos técnicos donde aparecen términos en inglés dentro de discurso ruso.
- Prototipado rápido en Mac sin GPU dedicada: la ejecución en CPU (137 ms por ventana de 30 s) permite validar flujos de ASR en equipos sin aceleración GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad ASR (WER, CER) en la informacion disponible. La model card sí documenta mediciones de latencia del encoder para la ventana de 30 s en un M5 Pro:

| Unidad de ejecución | Latencia del encoder (30 s) | Tiempo de carga |
|---|---|---|
| GPU | 23 ms | 1,5 s |
| Neural Engine | 81 ms | 11 s (especialización) |
| CPU | 137 ms | no disponible |

Las comprobaciones de fidelidad indican que, sobre cuatro fixtures sintéticos (ruso corto, ruso de 8,6 s, ruso con términos en inglés e inglés), la decodificación greedy de este encoder produce exactamente el mismo texto que el modelo PyTorch fp32 sobre el audio sin rellenar, tanto en `CPU_AND_GPU` como en CPU. En el Neural Engine, la aritmética fp16 alteró el final de la frase mixta; en todas las unidades, los pesos int8 también lo hicieron, por lo que se mantienen los pesos en fp16.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto de audio | Notas |
|---|---|---|---|---|---|---|
| kuberstar-com/gigaam-v3-e2e-rnnt-coreml | Conformer + RNN-T | ru | Core ML | MIT | 30 s | Build Core ML con máscara de longitud |
| ai-sage/GigaAM-v3 | Conformer + RNN-T | ru | PyTorch (no disponible en detalle) | MIT | no disponible | Modelo base original de Sber |
| maxhlv/gigaam-v3-coreml | Conformer + RNN-T | ru | Core ML | MIT | no disponible | Build Core ML previa; origen de los módulos Predictor y JointDecision |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe (incl. ru) | safetensors, GGUF, Core ML (comunidad) | MIT | 30 s | Alternativa multilingüe ampliamente disponible; no comparada en benchmarks en esta ficha |

No se dispone de datos de rendimiento comparativo (WER/CER) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta ruso; no es un modelo multilingüe y su uso con otros idiomas no está garantizado (aunque las pruebas incluyen una frase en inglés, no se documenta calidad).
- Ventana de audio fija de 30 s: audios más largos requieren troceado y gestión manual de fronteras entre segmentos.
- No se publican métricas de calidad ASR (WER/CER), por lo que la precisión en dominios concretos (acentos, ruido, jerga) es desconocida.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente en audio ruidoso o con solapamiento de hablantes.
- Los pesos int8 degradan la salida (según las pruebas del autor), lo que limita la reducción de huella en memoria mediante cuantización agresiva.
- El Neural Engine con fp16 alteró el final de una frase mixta ruso-inglés en las pruebas, por lo que la GPU es la unidad recomendada para máxima fidelidad.
- La build está orientada a macOS 15 y Apple Silicon; no es portable a otras plataformas sin reconversión.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base ai-sage/GigaAM-v3 y de los módulos copiados de maxhlv/gigaam-v3-coreml antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción ni validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kuberstar-com/gigaam-v3-e2e-rnnt-coreml
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v3
- Build Core ML de origen de los módulos Predictor y JointDecision: https://huggingface.co/maxhlv/gigaam-v3-coreml
- Repositorio de la librería `gigaam` (commit referenciado): https://github.com/salute-developers/GigaAM (no confirmado en la información proporcionada)
- No se han encontrado en la información proporcionada papers, blogs, demos ni repositorios adicionales.
