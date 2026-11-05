# AhmedAttia3/sanad-egy-whisper-turbo-int8

## Resumen

Sanad Egyptian Whisper Turbo (int8, ONNX) es una compilacion cuantizada del checkpoint `mohammedaly22/whisper-large-v3-turbo-egyptian-code-switching`, un ajuste fino de Whisper large-v3-turbo orientado a arabe egipcio y a habla con code-switching arabe-ingles. Lo publica AhmedAttia3 empaquetado especificamente para sherpa-onnx, la libreria de reconocimiento de voz offline de k2-fsa, de modo que puede ejecutarse sin conexion en aplicaciones de escritorio y moviles.

El modelo resuelve un problema concreto: la transcripcion de dictado en contextos donde el hablante mezcla arabe egipcio coloquial con terminos tecnicos en ingles, algo habitual en entornos profesionales de Egipto. Frente al Whisper large-v3-turbo original, incorpora un ajuste fino sobre ese dominio linguistico y una exportacion a ONNX con cuantizacion int8 que reduce el peso total a aproximadamente 1,0 GB (674 MB el encoder y 361 MB el decoder), lo que lo hace viable en equipos sin GPU dedicada.

La arquitectura subyacente es Whisper large-v3-turbo: 32 capas de encoder, 4 capas de decoder, 128 bins mel y un vocabulario de 51 866 tokens. Es un modelo de reconocimiento por lotes (no streaming), pensado para transcripcion offline con segmentacion previa mediante VAD. Su relevancia actual radica en que cubre un nicho poco atendido (ASR egipcio con code-switching) con una licencia MIT permisiva y un formato listo para produccion en sherpa-onnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (transformer encoder-decoder), 32 capas de encoder y 4 de decoder, 128 bins mel |
| Parametros totales | 80,7 M por conjunto de modulos exportado (segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | ONNX int8 (encoder y decoder) |
| Idiomas soportados | Arabe egipcio (ar), arabe estandar moderno, ingles (code-switching) |
| Licencia | MIT |
| Formato de pesos | ONNX int8 (encoder y decoder) + tokens.txt |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de la familia Whisper en su variante large-v3-turbo, con 32 capas de encoder y un decoder reducido de 4 capas, 128 bins mel y vocabulario de 51 866 tokens. La entrada debe ser audio mono a 16 kHz en float32 dentro del rango [-1, 1]. El checkpoint de partida es un ajuste fino de `mohammedaly22/whisper-large-v3-turbo-egyptian-code-switching` sobre el Whisper large-v3-turbo de OpenAI; la model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion practica de esta publicacion no esta en el entrenamiento sino en el empaquetado: exportacion a ONNX con cuantizacion int8 del encoder y del decoder mediante la receta de sherpa-onnx, lo que reduce el tamano a cerca de una cuarta parte respecto a la exportacion float y permite inferencia offline en CPU. El modelo es de tipo batch, no streaming, por lo que el audio largo debe segmentarse previamente, por ejemplo con el modelo Silero VAD distribuido por sherpa-onnx.

## Capacidades

- Transcripcion de voz a texto en arabe egipcio coloquial y arabe estandar moderno.
- Manejo de code-switching arabe-ingles: conserva los terminos tecnicos en ingles dentro de las frases en arabe.
- Reconocimiento offline por lotes (batch) con integracion nativa en sherpa-onnx.
- Soporte de segmentacion con VAD externo para audio de larga duracion.
- Inferencia en CPU gracias a la cuantizacion int8.
- API disponible en Python (`sherpa_onnx.OfflineRecognizer.from_whisper`) y Dart (`sherpa_onnx`).
- Tarea limitada a transcripcion: no genera timestamps a nivel de palabra.

## Casos de uso

- Dictado en aplicaciones de escritorio: es el modelo de dictado del agente de escritorio Sanad; se integra en la app mediante sherpa-onnx y transcribe la voz del usuario en local sin enviar audio a la nube, lo que protege la privacidad.
- Asistentes personales con mezcla de idiomas: adecuado para usuarios egipcios que dictan frases en arabe con terminos tecnicos en ingles, ya que el ajuste fino preserva el code-switching de forma intencionada.
- Transcripcion de reuniones y notas de voz: combinado con Silero VAD para segmentar el audio, permite procesar grabaciones largas por lotes en equipos sin GPU.
- Subtitulado y documentacion interna: util para convertir grabaciones de formacion o soporte en arabe egipcio a texto revisable, aunque sin timestamps por palabra.
- Aplicaciones moviles offline: la exportacion int8 y el binding de Dart permiten desplegar ASR en apps Flutter sin conexion.
- Procesamiento por lotes en servidores sin acelerador: al ejecutarse en CPU con ONNX Runtime, encaja en pipelines de transcripcion masiva donde no hay GPUs disponibles.
- Investigacion en ASR dialectal: sirve como base cuantizada para comparar el impacto de int8 frente al checkpoint float en arabe egipcio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica de forma estricta; el modelo esta pensado para CPU con ONNX Runtime. El conjunto de pesos int8 ocupa aproximadamente 1,0 GB en disco (674 MB encoder + 361 MB decoder), y el consumo de memoria en inferencia es del orden de ese tamano mas los buffers de activacion.
- GPU recomendadas: no disponibles en la informacion proporcionada; el empaquetado sherpa-onnx esta orientado a CPU.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 2-4 GB de memoria libre, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: sherpa-onnx (Python, Dart y otros bindings), con ONNX Runtime como backend. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR.
- Latencia y throughput: no disponibles. La model card solo indica que puede configurarse `num_threads` (4 en el ejemplo) para el reconocimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sanad Egyptian Whisper Turbo int8 (este) | 80,7 M por modulo exportado | Ventana Whisper de 30 s | Arabe egipcio, arabe estandar, ingles | MIT | ONNX int8 |
| Whisper large-v3-turbo (OpenAI) | no disponible en la informacion | Ventana Whisper de 30 s | Multilingue amplio | MIT | safetensors, etc. |
| mohammedaly22/whisper-large-v3-turbo-egyptian-code-switching | no disponible en la informacion | Ventana Whisper de 30 s | Arabe egipcio, ingles | MIT | safetensors |
| Whisper large-v3 (OpenAI) | no disponible en la informacion | Ventana Whisper de 30 s | Multilingue amplio | MIT | safetensors, etc. |

Frente al checkpoint upstream sin cuantizar, este modelo sacrifica una pequena cantidad de precision a cambio de aproximadamente un cuarto del tamano y del uso de memoria. Frente a Whisper large-v3, el decoder reducido de 4 capas de la variante turbo lo hace menos preciso en habla solapada o de campo lejano, pero mas ligero y con mejor encaje en CPU.

## Limitaciones y advertencias

- La cuantizacion int8 introduce una perdida de precision respecto a la exportacion ONNX en float.
- El decoder reducido de 4 capas de large-v3-turbo penaliza el habla muy solapada o de campo lejano en comparacion con large-v3.
- No genera timestamps a nivel de palabra; esta disenado para transcripciones tipo dictado.
- Es un modelo batch, no streaming: requiere segmentacion previa del audio largo.
- La entrada debe ser mono, 16 kHz y float32 en [-1, 1]; es necesario remuestrear antes de decodificar.
- El modelo conserva los terminos tecnicos en ingles dentro de frases en arabe de forma intencionada; no debe esperarse traduccion al arabe.
- Cobertura linguistica limitada a arabe (egipcio y estandar) e ingles; no es un modelo multilingue general.
- No se documentan sesgos especificos ni tasas de alucinacion en la informacion disponible; como todo modelo ASR, puede producir transcripciones plausibles pero incorrectas en audio ruidoso.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones heredadas del checkpoint upstream y de openai/whisper-large-v3-turbo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AhmedAttia3/sanad-egy-whisper-turbo-int8
- Checkpoint upstream: https://huggingface.co/mohammedaly22/whisper-large-v3-turbo-egyptian-code-switching
- Whisper large-v3-turbo de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
