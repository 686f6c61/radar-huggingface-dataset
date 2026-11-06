# sachinmallick/openflow-odia-asr-int8

## Resumen

OpenFlow Odia ASR (int8 ONNX) es una versión cuantizada a int8 del modelo de reconocimiento automático del habla IndicConformer de AI4Bharat para odia (oriya), empaquetada en formato ONNX para su uso en OpenFlow, una aplicación de dictado por voz offline para Windows. El modelo original es un conformer híbrido CTC/RNNT de aproximadamente 120 millones de parámetros entrenado por AI4Bharat; esta ficha concreta utiliza únicamente la cabeza CTC y ha sido exportada a ONNX por sulabhkatiyar y cuantizada dinámicamente a int8 por sachinmallick.

El interés de esta variante reside en su reducido tamaño (197 MB frente a 493 MB en fp32) y en que está pensada para inferencia en CPU sin GPU, lo que la hace adecuada para aplicaciones de escritorio con requisitos de privacidad y funcionamiento sin conexión. La cuantización dinámica de los pesos MatMul/Gemm a int8 mantiene las convoluciones en fp32 y reduce el tiempo de inferencia por clip de 408 ms a 364 ms con 8 hilos, con un coste mínimo de precisión (WER de 19,4 % a 19,7 % y CER de 5,3 % a 5,5 % sobre los primeros 30 clips de FLEURS odia dev).

Se trata de un artefacto derivado y no de un modelo entrenado desde cero: el autor original del entrenamiento es AI4Bharat, el export a ONNX es de sulabhkatiyar y aquí solo se ha realizado la cuantización. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (transformer convolucional), cabeza CTC; modelo base híbrido CTC/RNNT |
| Parametros totales | ~120 M (según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio definida por el segmento de entrada; features `[B, 80, T]`) |
| Tipos de cuantizacion | int8 dinámica en pesos MatMul/Gemm (ONNX Runtime); convoluciones en fp32 |
| Idiomas soportados | odia (`or`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`or/model.onnx`), vocabulario en `or/vocab.json` |

## Arquitectura y entrenamiento

El modelo base es IndicConformer de AI4Bharat, una arquitectura conformer (combinación de bloques convolucionales y atención multi-cabeza propia de modelos de voz) con dos cabezas de salida, CTC y RNNT, entrenada para reconocimiento del habla en lenguas índicas. Esta variante utiliza exclusivamente la cabeza CTC y el modelo exportado a ONNX procede de `sulabhkatiyar/indicconformer-120m-onnx`, con aproximadamente 120 millones de parámetros.

La cuantización aplicada es dinámica: los pesos de las operaciones MatMul/Gemm se convierten a int8 mediante ONNX Runtime, mientras que las convoluciones permanecen en fp32 porque el execution provider de CPU no dispone de kernel `ConvInteger`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden al modelo original de AI4Bharat y no se detallan en la información proporcionada. Las características de audio de entrada son pre-énfasis 0,97, 80 log-mels Slaney (n_fft 512, hop 160, win 400, 0–8000 Hz) y normalización media/desviación por bin.

## Capacidades

- Reconocimiento automático del habla (ASR) en odia a partir de audio de entrada.
- Decodificación CTC greedy sobre logits `[B, T/4, V+1]`.
- Entrada de audio en formato de features float32 `[B, 80, T]` con longitudes `int64 [B]`.
- Salida de texto con tokens de vocabulario en `or/vocab.json`, con `▁` como marcador de inicio de palabra y token blank en `len(vocab)`.
- Inferencia en CPU sin GPU, optimizada para ejecución offline.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio generativo ni modo de razonamiento; es un modelo puramente ASR.
- Soporte multilingüe limitado al odia; no se documentan otras lenguas.

## Casos de uso

- Dictado por voz offline en Windows: integrado en OpenFlow, permite transcribir voz a texto en odia sin conexión a internet, con un tamaño de 197 MB y latencia de 364 ms por clip en CPU de 8 hilos.
- Subtitulado y transcripción de reuniones en odia: el modelo procesa segmentos de audio y genera transcripciones con un WER de referencia del 19,7 % sobre FLEURS dev, adecuado para actas y notas internas.
- Accesibilidad para hablantes de odia: entrada de texto por voz en aplicaciones de escritorio para usuarios con dificultades motoras, sin depender de servicios en la nube.
- Procesamiento por lotes de archivos de audio: la entrada `[B, 80, T]` admite lotes, lo que permite transcribir colecciones de grabaciones cortas en un servidor CPU.
- Investigación en ASR de bajos recursos: sirve como línea base cuantizada para comparar técnicas de compresión (int8 frente a fp32) en lenguas índicas con métricas WER/CER reproducibles.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente y no requerir red, es apto para transcripción de audio sensible en sanidad, legal o administración pública.
- Prototipado de asistentes de voz para odia: combinado con un modelo de lenguaje y un TTS, puede formar parte de un pipeline de voz conversacional en dispositivos de gama baja.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los primeros 30 clips del split dev de Google FLEURS odia (349 s de audio), decodificación CTC greedy y puntuación sin puntuación:

| Build | Tamano | WER | CER | Tiempo CPU por clip (8 hilos) |
|---|---|---|---|---|
| fp32 (fuente) | 493 MB | 19,4 % | 5,3 % | 408 ms |
| int8 (este repo) | 197 MB | 19,7 % | 5,5 % | 364 ms |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para CPU (ONNX Runtime con execution provider de CPU).
- GPU recomendadas: no disponibles ni necesarias; el modelo se ejecuta en CPU. No se documenta soporte CUDA.
- Cabe en cualquier equipo consumer: 197 MB de pesos en int8 y 493 MB en fp32, con huella de memoria muy inferior a 1 GB.
- Opciones de despliegue: ONNX Runtime (CPU), integración en OpenFlow mediante `engine/indic_asr.py` (implementación numpy-only de las features). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 364 ms por clip con 8 hilos en int8 (408 ms en fp32); el tamaño del clip de referencia es de aproximadamente 11,6 s de media (349 s / 30 clips).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenFlow Odia ASR int8 (este) | ~120 M | features `[B, 80, T]` | WER 19,7 %, CER 5,5 % (FLEURS dev, 30 clips) | CC-BY-4.0 | ONNX, 197 MB |
| ai4bharat/indicconformer_stt_or_hybrid_ctc_rnnt_large (base) | ~120 M | features `[B, 80, T]` | no disponible en la información | CC-BY-4.0 (según modelo base) | pesos originales, formato no detallado |
| sulabhkatiyar/indicconformer-120m-onnx (export fp32) | ~120 M | features `[B, 80, T]` | WER 19,4 %, CER 5,3 % (misma evaluación) | CC-BY-4.0 (según modelo base) | ONNX fp32, 493 MB |

No se dispone de datos de otros modelos ASR comparables (por ejemplo, Whisper u otros IndicConformer) en la información proporcionada.

## Limitaciones y advertencias

- El WER de referencia es del 19,7 % sobre solo 30 clips de FLEURS dev; la muestra es pequeña y puede no representar el rendimiento en dominios reales (ruido, acentos, habla espontánea).
- La cuantización int8 introduce una degradación medible aunque pequeña: +0,3 puntos de WER y +0,2 puntos de CER frente a fp32.
- El modelo solo soporta odia; no se ha evaluado su comportamiento en otras lenguas ni en code-switching.
- Riesgo de alucinación y errores de transcripción en audio con ruido, solapamiento de hablantes o vocabulario técnico fuera del dominio de entrenamiento.
- No se documentan sesgos específicos, pero al derivar de un corpus índico puede reflejar sesgos de género, dialecto o registro presentes en los datos originales de AI4Bharat.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es obligatorio citar a AI4Bharat (entrenamiento), a sulabhkatiyar (export ONNX) y a sachinmallick (cuantización).
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso en producción ni mantenimiento continuado.
- Las convoluciones permanecen en fp32 por limitaciones del kernel `ConvInteger` en CPU; en otras plataformas (GPU, NPU) el rendimiento y la compatibilidad pueden variar y no están documentados.

## Enlaces

- Hugging Face: https://huggingface.co/sachinmallick/openflow-odia-asr-int8
- Modelo base: https://huggingface.co/ai4bharat/indicconformer_stt_or_hybrid_ctc_rnnt_large
- Export ONNX de referencia: https://huggingface.co/sulabhkatiyar/indicconformer-120m-onnx
- Repositorio OpenFlow: https://github.com/Sachin1724/OpenFlow
- AI4Bharat: https://ai4bharat.iitm.ac.in/
