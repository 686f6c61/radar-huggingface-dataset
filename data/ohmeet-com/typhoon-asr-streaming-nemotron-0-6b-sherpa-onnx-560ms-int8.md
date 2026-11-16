# ohmeet-com/typhoon-asr-streaming-nemotron-0.6b-sherpa-onnx-560ms-int8

## Resumen

Typhoon ASR Streaming Nemotron 0.6B (sherpa-onnx, 560 ms, int8) es una conversión del modelo de reconocimiento automático de voz en streaming `typhoon-ai/typhoon-asr-streaming-nemotron-0.6b`, desarrollado por Typhoon (SCB 10X), que a su vez es un ajuste fino de NVIDIA Nemotron 3.5 ASR Streaming 0.6B. La conversión la publica el usuario `ohmeet-com` para su aplicación macOS Oh Meet, y su valor está en empaquetar los pesos originales en formato ONNX listo para sherpa-onnx, con cuantización int8 y una ventana de chunk de 560 ms.

El modelo resuelve el problema de la transcripción de voz en tiempo real para tailandés: es un transducer online (RNN-T) que procesa audio de forma incremental en lugar de esperar a la frase completa. Su tamaño de 0,6 mil millones de parámetros y su footprint de aproximadamente 1,2 GB en ejecución lo hacen viable en portátiles y equipos de sobremesa sin GPU dedicada, con un RTF de aproximadamente 0,2 en Apple Silicon.

Es relevante ahora porque el ecosistema de ASR en streaming para idiomas distintos del inglés sigue siendo escaso, y este paquete ofrece una ruta de despliegue concreta (sherpa-onnx, int8, un solo hilo) para un idioma con poca cobertura en modelos abiertos. No obstante, es una conversión de formato y cuantización, no un modelo nuevo: los pesos y el comportamiento lingüístico son los de Typhoon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer online (RNN-T) con encoder, decoder y joiner; exportado a ONNX para sherpa-onnx |
| Parametros totales | 0,6 mil millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; chunk de streaming de 560 ms con `att_context` `[56, 6]` |
| Tipos de cuantizacion | int8 (cuantizacion dinamica) |
| Idiomas soportados | tailandes (th); requiere prompt de idioma `th-TH` |
| Licencia | OpenMDW-1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) y `tokens.txt` |

Otros datos tecnicos: `feature_dim` 128, `blank_penalty` 0, tamano del repo 0,7 GB. Ficheros y hashes:

| Fichero | Bytes | sha256 |
|---|---|---|
| encoder.int8.onnx | 657.573.660 | b4289839619253d60b758105fa1e38025829c80439a41019ee396f65651b3717 |
| decoder.int8.onnx | 16.288.794 | 2cb9826010b98d99adc201eb69646c12bc0f6020a53ab3b70e9335ed2262da78 |
| joiner.int8.onnx | 10.823.352 | 969393fcebe70a41cab9606388d5ec28733a05cf6ee6456573e267a5c26577e9 |
| tokens.txt | 169.681 | 70300c69129e0e67469d25fd8c39a486f342439be3a56eb62f656c32a26e21c4 |

## Arquitectura y entrenamiento

La arquitectura es un transducer online (RNN-T) compuesto por un encoder, un decoder y un joiner, el esquema habitual de Nemotron ASR Streaming de NVIDIA. El modelo original parte de NVIDIA Nemotron 3.5 ASR Streaming 0.6B y Typhoon (SCB 10X) lo ajusta para tailandés; esta publicación no entrena nada nuevo, sino que exporta los pesos desde `typhoon-asr-streaming-nemotron-0.6b.nemo` (commit `a512acdc0136606078c11a27007108b34f808580`) a ONNX para sherpa-onnx y aplica cuantización dinámica a int8.

La innovación técnica de esta conversión es la configuración de streaming: chunk de 560 ms con `att_context` `[56, 6]`, que la model card de Typhoon denomina "480 ms" contando solo el look-ahead. El resultado es un modelo de transcripción incremental con baja latencia. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el proceso original de Typhoon o NVIDIA.

## Capacidades

- Reconocimiento automático de voz en streaming para tailandés, con procesamiento incremental por chunks de 560 ms.
- Transcripción online mediante transducer (encoder, decoder y joiner), adecuada para dictado y subtitulado en vivo.
- Ejecución ligera: un solo hilo es suficiente, con RTF de aproximadamente 0,2 en Apple Silicon.
- Escribe los números como palabras tailandesas habladas, igual que el modelo original.
- Requiere prompt de idioma `th-TH`; sin él, el modelo recurre a un prompt automático no entrenado y produce texto incorrecto.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada distinto de voz, ni modos de razonamiento extendido.
- Capacidad multilingüe: no disponible; el modelo está orientado exclusivamente a tailandés.

## Casos de uso

- Dictado en tiempo real en aplicaciones de escritorio: integrado mediante sherpa-onnx, el modelo transcribe la voz del usuario con chunks de 560 ms y un consumo de aproximadamente 1,2 GB, adecuado para la app macOS Oh Meet y para herramientas similares.
- Subtitulado en vivo de reuniones o clases en tailandés: el modo streaming permite emitir texto parcial mientras se habla, sin esperar al final de la intervención.
- Asistentes de voz para atención al cliente en tailandés: la transcripción incremental alimenta un pipeline posterior de intención y respuesta, con baja latencia gracias al RTF de aproximadamente 0,2.
- Transcripción de notas de voz y mensajes en aplicaciones de mensajería: el modelo convierte audio corto en texto en local, sin depender de servicios en la nube.
- Accesibilidad para usuarios con discapacidad auditiva en entornos tailandeses: generación de subtítulos en directo en un portátil o equipo de sobremesa sin GPU dedicada.
- Procesamiento por lotes de audio en servidores modestos: al necesitar un solo hilo y un footprint de aproximadamente 1,2 GB, permite desplegar varias instancias por máquina para transcribir archivos de audio.
- Integración en dispositivos de borde o sistemas empotrados con ONNX Runtime: el formato ONNX int8 facilita el despliegue fuera de entornos con CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de eficiencia: RTF de aproximadamente 0,2 en Apple Silicon, un solo hilo suficiente y un footprint máximo de aproximadamente 1,2 GB. No se ofrecen cifras de WER, MMLU, HumanEval ni GSM8K, que por otra parte no aplican a un modelo de ASR.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está pensado para ejecución en CPU mediante ONNX Runtime y sherpa-onnx, con un footprint máximo de aproximadamente 1,2 GB.
- GPU recomendadas: no se especifican; el despliegue documentado es en CPU (Apple Silicon con RTF de aproximadamente 0,2). Cualquier GPU compatible con ONNX Runtime podría usarse, pero no hay datos publicados.
- Cabe en GPU de consumo: no hay datos específicos; el tamaño del encoder int8 (aproximadamente 657 MB) sugiere que cabría en GPUs con 4 GB o más de VRAM, aunque no está confirmado por el autor.
- Opciones de despliegue: sherpa-onnx (soporte nativo de este paquete ONNX), ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo ASR.
- Latencia y throughput: RTF de aproximadamente 0,2 en Apple Silicon con un solo hilo; latencia de chunk de 560 ms. No se publican cifras de throughput para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ohmeet-com/typhoon-asr-streaming-nemotron-0.6b-sherpa-onnx-560ms-int8 | 0,6 B | chunk 560 ms | tailandes | OpenMDW-1.1 | ONNX int8 |
| typhoon-ai/typhoon-asr-streaming-nemotron-0.6b | 0,6 B | streaming (configuracion original) | tailandes | OpenMDW-1.1 | NeMo (`.nemo`) |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 0,6 B | streaming | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

La comparativa se limita a la cadena de procedencia del propio modelo, ya que no se han proporcionado datos de benchmarks ni de otras alternativas de ASR en streaming para tailandés. No es posible comparar rendimiento (WER) entre estas variantes con la información disponible.

## Limitaciones y advertencias

- Es una conversión de formato y cuantización, no un modelo nuevo: hereda los sesgos y errores del modelo Typhoon y, en última instancia, de la base Nemotron de NVIDIA.
- Riesgo de alucinación y de transcripciones incorrectas: la cuantización int8 cambia ligeramente los resultados respecto al modelo original en precisión completa.
- El prompt de idioma es obligatorio: si se deja vacío, el modelo usa un prompt automático no entrenado y genera texto sin sentido. Debe fijarse siempre `th-TH`.
- Cobertura lingüística limitada al tailandés; no es adecuado para otros idiomas.
- Los números se transcriben como palabras tailandesas habladas, lo que puede requerir postprocesado si se necesitan dígitos.
- `blank_penalty` debe ser 0; modificarlo altera el sesgo de blank propio del joiner.
- Licencia OpenMDW-1.1: es necesario revisar los términos del fichero `LICENSE` para uso comercial, y se deben mantener los avisos de NVIDIA en `nvidia/NOTICES.txt`.
- La conversión no está avalada por Typhoon, SCB 10X ni NVIDIA; "Typhoon" y "Nemotron" son marcas de sus respectivos titulares.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ohmeet-com/typhoon-asr-streaming-nemotron-0.6b-sherpa-onnx-560ms-int8
- Modelo base (Typhoon): https://huggingface.co/typhoon-ai/typhoon-asr-streaming-nemotron-0.6b
- Modelo original de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Script de exportacion: `export/export_onnx.py` dentro del repositorio del modelo
- Avisos de NVIDIA: `nvidia/NOTICES.txt` dentro del repositorio del modelo
- Licencia: `LICENSE` dentro del repositorio del modelo
