# pantinor/sherpa-onnx-whisper-large-v3-german

## Resumen

`sherpa-onnx-whisper-large-v3-german` es una exportación a ONNX en cuantización int8 del modelo `primeline/whisper-large-v3-german`, un ajuste fino completo de Whisper large-v3 para reconocimiento automático del habla en alemán desarrollado por Florian Zimmermeister (primeLine). El modelo original parte de la arquitectura Whisper large-v3 de OpenAI (transformer encoder-decoder con 1550 millones de parámetros) y se ha reentrenado sobre habla en alemán, incluyendo Common Voice. Esta versión la publica el usuario `pantinor` como artefacto listo para el runtime sherpa-onnx, orientado a despliegue en producción sin dependencias de PyTorch.

El problema que resuelve es doble: por un lado, ofrece una alternativa especializada en alemán frente al Whisper multilingüe genérico; por otro, empaqueta los pesos en formato ONNX int8 (encoder con cuantización MatMul, decoder con cuantización per-channel) para inferencia eficiente en CPU. El repositorio ocupa 1,8 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su integración comercial.

Su relevancia es acotada pero concreta: se publica como modelo externo del catálogo de la comunidad Anti-Vocale, importable sin actualizar la aplicación. La model card incluye una medición propia en FLEURS alemán (WER 7,48) que, según el propio autor, queda por detrás del baseline Whisper Turbo int8 (WER 6,01) en ese mismo protocolo, aunque el ajuste fino declara un WER de 3,00 % en el test de Common Voice 15, su dominio de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parámetros totales | 1550 millones (Whisper large-v3); tamaño de artefacto ONNX 1,78 GB |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v3 trabaja con ventanas de audio de 30 s) |
| Tipos de cuantización | int8 (encoder MatMul int8; decoder per-channel int8) |
| Idiomas soportados | alemán (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper large-v3: un transformer encoder-decoder con atención estándar que procesa espectrogramas log-Mel de audio en ventanas de 30 segundos y genera transcripciones de forma autorregresiva. El modelo base `primeline/whisper-large-v3-german` es un ajuste fino completo (full fine-tune) sobre habla en alemán, incluyendo Common Voice, según indica la model card. No se detalla en la información disponible el número exacto de tokens de audio, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO.

La exportación se realizó con un toolchain alineado temporalmente con el checkpoint (torch 2.3.1, onnx 1.16.2, openai-whisper 20250625, sherpa-onnx v2.0.1). Un detalle técnico relevante: el layout del tokenizer de Hugging Face inserta `<|yue|>` en el id 50358, por lo que la exportación permuta la embedding de tokens al orden de ids de OpenAI (de 51866 a 51865), la misma transformación documentada en las exportaciones finlandesa y francesa del mismo autor. El checkpoint original trae pesos en bfloat16 y la exportación los convierte a fp16 tras una comprobación de magnitud. El proceso de verificación (`agree-check`) coincidió con los pesos publicados por el autor original, y las pruebas int8 de sherpa decodifican texto alemán idéntico al ground truth del pipeline de Hugging Face.

## Capacidades

- Reconocimiento automático del habla (ASR) en alemán: transcripción de audio a texto con Whisper large-v3 ajustado al dominio alemán.
- Procesamiento de audio en ventanas de 30 segundos, propias de la arquitectura Whisper.
- Inferencia en CPU mediante runtime sherpa-onnx, sin necesidad de GPU ni de PyTorch.
- Integración como modelo externo de la familia Whisper en el catálogo de Anti-Vocale sin actualizar la aplicación.
- Compatibilidad con el formato de tokens estándar multilingüe de Whisper (permutado al orden de OpenAI).
- No se documentan en la información disponible capacidades de traducción, diarización de hablantes, timestamps a nivel de palabra ni tool calling.

## Casos de uso

- Transcripción de reuniones y entrevistas en alemán: el modelo procesa audio en ventanas de 30 s y genera transcripciones en texto plano; su ajuste fino sobre habla alemana lo hace adecuado para reuniones corporativas y entrevistas periodísticas en ese idioma.
- Subtitulado de vídeo y podcast en alemán: al ejecutarse sobre sherpa-onnx en CPU, puede integrarse en pipelines de postproducción que generan subtítulos sin depender de infraestructura GPU.
- Atención al cliente con voz en alemán: transcripción de llamadas grabadas para análisis de calidad, búsqueda de texto completo o generación de actas, aprovechando la licencia Apache 2.0 para uso comercial.
- Archivado y búsqueda de audio histórico: digitalización de archivos de audio en alemán con transcripción indexable, ejecutable en servidores sin GPU gracias a la cuantización int8.
- Aplicaciones de accesibilidad: dictado y transcripción en tiempo casi real para usuarios germanohablantes con discapacidad auditiva o motriz, desplegable en hardware de consumo.
- Investigación en ASR alemán: modelo de referencia para comparar el rendimiento de ajustes finos frente al Whisper multilingüe base en dominios como FLEURS o Common Voice.
- Despliegue en dispositivos edge: el formato ONNX int8 y el runtime sherpa-onnx permiten ejecución en dispositivos con recursos limitados donde no cabe un modelo en fp16.

## Benchmarks y rendimiento

La model card incluye una medición propia en FLEURS alemán (protocolo de 40 clips, WER con jiwer):

| Modelo | WER | Notas |
|---|---|---|
| whisper-large-v3-german int8 (este repo) | 7,48 | ajuste fino completo, 1,78 GB |
| Whisper Turbo int8 (baseline integrado) | 6,01 | mejor en este protocolo |

Además, la model card cita un WER de 3,00 % en el test de Common Voice 15 para el ajuste fino original, aunque advierte que ese dato proviene de su dominio de entrenamiento y no es directamente comparable con FLEURS. No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto int8 ocupa 1,78 GB en disco y el runtime sherpa-onnx está pensado para ejecución en CPU.
- GPU recomendadas: no se especifican en la información disponible; al ser un modelo ONNX int8 orientado a sherpa-onnx, el caso de uso principal es CPU.
- ¿Cabe en GPU de consumo? El tamaño de los pesos (1,78 GB) permitiría cargarlo en GPUs de consumo con suficiente memoria, pero no se documenta soporte GPU en esta exportación.
- Opciones de despliegue: sherpa-onnx (runtime nativo para el que se exportó); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo ASR de este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (FLEURS de_de) | Licencia | Formato |
|---|---|---|---|---|---|
| sherpa-onnx-whisper-large-v3-german (este) | 1550 M | ventanas de 30 s | 7,48 | Apache 2.0 | ONNX int8 |
| Whisper Turbo int8 (baseline Anti-Vocale) | no disponible en la información | ventanas de 30 s | 6,01 | no disponible en la información | ONNX int8 |
| primeline/whisper-large-v3-german (modelo base) | 1550 M | ventanas de 30 s | no disponible (WER 3,00 % en Common Voice 15) | Apache 2.0 | safetensors (bfloat16) |
| Whisper large-v3 multilingüe (OpenAI) | 1550 M | ventanas de 30 s | no disponible en la información | Apache 2.0 | múltiples |

## Limitaciones y advertencias

- Rendimiento inferior al baseline Whisper Turbo int8 en el protocolo FLEURS medido por el propio autor (7,48 frente a 6,01 de WER); el ajuste fino solo es competitivo en dominios próximos a su distribución de entrenamiento.
- Especializado exclusivamente en alemán: no debe esperarse buen rendimiento en otros idiomas aunque el tokenizer sea multilingüe.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla solapada.
- Sesgos no documentados en la información disponible; al entrenarse sobre Common Voice y otros corpus alemanes, puede heredar sesgos de acento, edad o género presentes en esos datos.
- Ventana de audio limitada a 30 segundos por segmento, lo que requiere segmentación previa para audios largos.
- No se documentan mecanismos de detección de actividad de voz ni timestamps a nivel de palabra en esta exportación.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datasets de entrenamiento originales.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de adopción ni validación independiente más allá de las pruebas del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pantinor/sherpa-onnx-whisper-large-v3-german
- Modelo base: https://huggingface.co/primeline/whisper-large-v3-german
- Proyecto Anti-Vocale: https://github.com/RisorseArtificiali/anti-vocale
- Informe de benchmarks en alemán: https://github.com/RisorseArtificiali/anti-vocale/blob/main/docs/scout-reports/2026-11-03-de-bench.md
