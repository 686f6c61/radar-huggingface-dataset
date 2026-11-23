# alexandreacff/parakeet-tdt-v3-ptBR-30s-openvino

## Resumen

Parakeet-TDT 0.6B v3 pt-BR — OpenVINO es una exportación optimizada del modelo de reconocimiento automático del habla `alexandreacff/parakeet-tdt-v3-ptBR-30s`, publicada por el mismo autor. Se trata de un modelo NeMo Conformer con decodificación TDT (Token-and-Duration Transducer) adaptado al portugués de Brasil y convertido a formato OpenVINO para su ejecución en la NPU de los procesadores Intel Core Ultra, además de GPU y CPU. El paquete incluye el preprocesador log-mel en ONNX, el codificador FastConformer en FP16 con entrada estática y el decodificador conjunto en FP32.

La relevancia de esta ficha radica en que ejemplifica el patrón de despliegue de ASR en hardware de consumo: el codificador se ejecuta en la NPU con formas estáticas de 30 segundos, mientras el preprocesado y la decodificación greedy TDT corren en CPU. El autor reporta 238 ms de latencia mediana extremo a extremo y un RTFx de 32,9 sobre una NPU integrada, con un WER normalizado del 6,63 % en FLEURS y CORAA v1.1.

El modelo está pensado para el plugin de STT del agente Hermes (`hermes-parakeet-stt`) y su uso principal es la transcripción de audio en portugués brasileño en entornos de borde. El repositorio ocupa 1,3 GB y la licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer (FastConformer) con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | aproximadamente 0,6 mil millones (0.6B, segun el nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | audio de hasta 30 s por inferencia (entrada estatica `[1, 128, 3001]`); audios mas largos deben dividirse |
| Tipos de cuantizacion | FP16 (codificador), FP32 (decodificador conjunto); exportacion OpenVINO |
| Idiomas soportados | portugues de Brasil (pt-BR) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | OpenVINO IR (`.xml`/`.bin`) y ONNX (`nemo128.onnx`) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR end-to-end basado en un codificador FastConformer (variante de Conformer con atención subsampleada) y un decodificador TDT, que predice conjuntamente tokens y duraciones discretas `[0,1,2,3,4]`. El pipeline se compone de tres etapas: preprocesador log-mel de 128 bins en ONNX ejecutado en CPU con onnxruntime, codificador en FP16 con entrada estática de 30 segundos (3001 frames) ejecutado en NPU, y decodificación greedy TDT en CPU. La entrada estática es un requisito de la NPU de Intel, que no admite formas dinámicas; el audio se rellena con ceros hasta los 30 s.

El vocabulario es SentencePiece de 8192 tokens más el token blank. El modelo base `alexandreacff/parakeet-tdt-v3-ptBR-30s` es una adaptación al portugués brasileño del Parakeet-TDT 0.6B v3 de NVIDIA; el preprocesador ONNX proviene de `istupakov/parakeet-tdt-0.6b-v3-onnx`. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste supervisado adicionales.

## Capacidades

- Reconocimiento automático del habla (transcripción) en portugués de Brasil.
- Decodificación TDT con predicción de duraciones, que reduce el número de pasos frente a CTC o RNN-T clásicos.
- Ejecución en NPU de Intel Core Ultra, GPU y CPU mediante OpenVINO.
- Preprocesado log-mel de 128 bins incluido en el paquete (ONNX).
- Integración con el plugin de STT del agente Hermes (`hermes-parakeet-stt`).
- Procesamiento de clips de hasta 30 segundos por invocación; el troceado de audios más largos es responsabilidad del llamante.
- No se documentan capacidades de traducción, diarización, puntuación avanzada, tool calling ni razonamiento multi-paso.

## Casos de uso

- Transcripción en tiempo real en portugués brasileño sobre portátiles con Intel Core Ultra: el codificador en NPU y la decodificación en CPU permiten 238 ms de latencia mediana y un RTFx de 32,9, adecuado para subtitulado en vivo o dictado.
- Asistentes de voz embebidos: el modelo se integra en el plugin `hermes-parakeet-stt` del agente Hermes, de modo que un agente local puede convertir voz en texto sin enviar audio a la nube.
- Procesamiento por lotes de reuniones y notas de voz: dividiendo el audio en fragmentos de 30 s, se pueden transcribir grabaciones largas con un consumo de CPU de sistema del 25 %.
- Transcripción de llamadas de atención al cliente en portugués: el modelo está entrenado para pt-BR y alcanza un WER normalizado del 6,63 % en FLEURS y CORAA v1.1, lo que lo hace viable para generar actas automáticas.
- Subtitulado de contenido audiovisual brasileño en pipelines de edición: el formato OpenVINO permite desplegarlo en estaciones de trabajo sin GPU dedicada.
- Aplicaciones de accesibilidad en el borde: transcripción de voz a texto en dispositivos con NPU, sin dependencia de conectividad ni de servicios externos.
- Investigación en ASR de bajo consumo: sirve como referencia reproducible para comparar latencia y precisión entre NPU, GPU y CPU con el mismo modelo.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (Core Ultra 7 258V, 50 clips de FLEURS y CORAA v1.1 test):

| Metrica | Valor |
|---|---|
| Latencia mediana extremo a extremo (NPU) | 238 ms |
| RTFx | 32,9 |
| WER normalizado | 6,63 % (identico a OpenVINO CPU) |
| Uso de CPU del sistema | 25 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,3 GB y el codificador se ejecuta en FP16, por lo que se estima un consumo de memoria en el orden de 1-2 GB.
- Hardware objetivo: NPU de Intel Core Ultra (probado en Core Ultra 7 258V), GPU y CPU Intel.
- Cabe en hardware de consumo: sí, en equipos con Intel Core Ultra; también en CPU sin GPU dedicada.
- Opciones de despliegue: OpenVINO Runtime (NPU, GPU, CPU) y onnxruntime para el preprocesador; integración mediante `hermes-parakeet-stt`.
- Latencia y throughput: 238 ms de latencia mediana y RTFx de 32,9 en la NPU del Core Ultra 7 258V; no se reportan cifras para GPU o CPU más allá de la equivalencia de WER con CPU.
- Limitación de forma: la entrada del codificador es estática `[1, 128, 3001]`, por lo que no admite lotes ni longitudes variables sin reexportación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt-v3-ptBR-30s-openvino (este) | ~0,6B | 30 s estatico | pt-BR | CC-BY-4.0 | OpenVINO IR + ONNX |
| alexandreacff/parakeet-tdt-v3-ptBR-30s (base) | ~0,6B | no disponible | pt-BR | no disponible en la informacion | no disponible |
| istupakov/parakeet-tdt-0.6b-v3-onnx | ~0,6B | no disponible | multilingue (v3) | no disponible en la informacion | ONNX |
| Whisper large-v3 | ~1,55B | 30 s | multilingue | MIT | safetensors, GGUF, etc. |

La comparación con Whisper large-v3 se incluye como referencia de categoría (ASR de ~1B parámetros con ventana de 30 s); no se dispone de cifras de WER comparativas en la información proporcionada. El modelo base y la exportación ONNX de `istupakov` comparten arquitectura, por lo que las diferencias se limitan al formato y al backend de ejecución.

## Limitaciones y advertencias

- Solo soporta portugués de Brasil; no se documentan otros idiomas.
- Ventana máxima de 30 s por inferencia; los audios más largos deben trocearse, lo que puede introducir errores en las fronteras de los segmentos.
- La forma estática de entrada impide procesar lotes o longitudes variables sin reexportar el modelo.
- Riesgo de alucinación y de errores en audio con ruido, acentos no brasileños o vocabulario técnico; no se documentan métricas de robustez fuera de FLEURS y CORAA.
- No se documentan sesgos específicos ni evaluaciones de equidad.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor y conservar el aviso de licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- Dependencia de OpenVINO y de la NPU de Intel para obtener el rendimiento reportado; en otros backends el rendimiento puede diferir.
- No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de ajuste, lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexandreacff/parakeet-tdt-v3-ptBR-30s-openvino
- Modelo base: https://huggingface.co/alexandreacff/parakeet-tdt-v3-ptBR-30s
- Preprocesador ONNX de referencia: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Plugin de STT del agente Hermes: https://github.com/alexandreacff/hermes-parakeet-stt
