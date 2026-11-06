# DimQ1/nemotron-3.5-asr-streaming-0.6b-onnx-int4-c112-compact-cpu

## Resumen

Nemotron 3.5 ASR Compact es una exportación a ONNX optimizada para CPU del modelo de reconocimiento de voz en streaming Nemotron-3.5 ASR (0.6B) de NVIDIA. La publica el usuario DimQ1 en Hugging Face como un repack del export INT4 previo, con el objetivo de reducir tamaño y latencia manteniendo la precisión. Se trata de un modelo ASR de tipo transducer (RNN-T) con encoder FastConformer cache-aware, pensado para transcripción incremental de audio en tiempo real sin GPU.

La innovación principal de esta variante es la reescritura de las 48 convoluciones pointwise de los bloques conformer como multiplicaciones matriciales cuantizadas a INT4, así como el plegado de la tabla de posiciones constante y de las 24 proyecciones `linear_pos` que la consumen, que en el export original se recalculaban en cada chunk. El resultado es un encoder entre un 25 % y un 29 % más rápido en CPU con 4 hilos, un tamaño de 496 MB frente a los 794 MB del repo fuente y un consumo de memoria 200-250 MB inferior, con una degradación de WER prácticamente nula.

El modelo soporta ruso e inglés, está empaquetado con Silero VAD y se distribuye bajo la licencia original de NVIDIA (etiquetada como "other"), lo que condiciona su uso comercial. Es relevante para despliegues de ASR en entornos sin GPU, como aplicaciones de escritorio, edge o servidores CPU-only con requisitos de latencia estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware (encoder) + RNN-T LSTM (decoder) + transducer joint |
| Parametros totales | 0.6B (según nombre del modelo; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de streaming de 1.12 s por chunk |
| Tipos de cuantizacion | INT4 MatMulNBits (k-quant, block 32, accuracy_level 4); convoluciones pointwise en INT4 |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | other (licencia original de NVIDIA Nemotron) |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, joint.onnx con datos externos) + silero_vad.onnx |

## Arquitectura y entrenamiento

El modelo es un transducer RNN-T compuesto por tres componentes exportados a ONNX: un encoder FastConformer cache-aware, una red de predicción LSTM (decoder) y un joint transducer. El encoder procesa el audio en ventanas de 1.12 s con estado de caché, lo que permite transcripción incremental en streaming. La cuantización INT4 se aplica mediante MatMulNBits con block size 32 y accuracy_level 4, y en esta variante se extiende a las 48 convoluciones pointwise de los bloques conformer, que en el export fuente estaban en FP32.

Las optimizaciones de repack incluyen el plegado de la tabla de posiciones constante y de las 24 proyecciones `linear_pos` que la consumen, precomputadas de forma bit-idéntica. El decoder, el joint, el tokenizer y las configuraciones son byte-idénticos al repo fuente. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo etapas de RLHF o ajuste fino; esos datos corresponden al modelo base de NVIDIA y no se detallan en la model card.

## Capacidades

- Reconocimiento de voz en streaming con ventana de 1.12 s por chunk y estado de caché.
- Transcripción en ruso e inglés.
- Detección de actividad de voz integrada mediante Silero VAD (`silero_vad.onnx`).
- Salida de transcripción mediante tokenizer propio (vocab.txt, tokenizer.json).
- Ejecución en CPU sin GPU, con ONNX Runtime.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción en tiempo real en aplicaciones de escritorio: el modelo puede integrarse en apps nativas o Electron mediante ONNX Runtime en CPU, con ventanas de 1.12 s que permiten subtitulado incremental sin GPU.
- Subtitulado de reuniones y videollamadas: el VAD incluido permite segmentar habla y el encoder cache-aware mantiene el contexto entre chunks, adecuado para entornos corporativos con servidores CPU-only.
- Dictado por voz en entornos con restricciones de hardware: al ocupar 496 MB y requerir 200-250 MB menos de memoria que el export previo, cabe en equipos modestos y en contenedores ligeros.
- Procesamiento por lotes de audio en servidores sin GPU: la mejora del 25-29 % en velocidad del encoder reduce el coste por hora de audio transcrito en pipelines de ASR.
- Aplicaciones edge o embebidas: el formato ONNX y la cuantización INT4 facilitan el despliegue en dispositivos con CPU de bajo consumo, siempre que se respete la licencia.
- Preprocesado de voz para pipelines de NLP: la transcripción en ruso e inglés puede alimentar sistemas posteriores de análisis, búsqueda o moderación en arquitecturas CPU-only.
- Prototipado e investigación en ASR: al ser un repack reproducible con converter documentado (`tools/converters/EncoderRepack`), sirve para estudiar el impacto de la cuantización INT4 en convoluciones conformer.

## Benchmarks y rendimiento

WER sobre Common Voice 17 (250 muestras ru + 250 en, CPU, streaming, mismo harness y día para ambos modelos):

| Modelo | Total | Ruso | Inglés |
|---|---:|---:|---:|
| Este repo (compact INT4) | 17.94 % | 14.75 % | 20.86 % |
| Fuente INT4 | 17.98 % | 14.75 % | 20.95 % |

Rendimiento del encoder: 25-29 % más rápido que el encoder del repo fuente en CPU con 4 hilos. Memoria: aproximadamente 200-250 MB menos que el fuente. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU.
- Memoria RAM estimada: el repo ocupa 496 MB en disco; el proceso requiere 200-250 MB menos que el export fuente, por lo que un entorno con 1-2 GB de RAM libre es suficiente.
- GPU recomendadas: no aplica; no se documenta soporte GPU para este export.
- CPU: funciona en CPU de consumo; los datos de rendimiento se midieron con 4 hilos.
- Opciones de despliegue: ONNX Runtime (formato nativo); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas de latencia o RTF, solo la mejora relativa del 25-29 % frente al export fuente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este repo (Nemotron 3.5 ASR Compact INT4) | 0.6B | 1.12 s por chunk | ru, en | other (NVIDIA) | ONNX INT4 |
| DimQ1/nemotron-3.5-asr-streaming-0.6b-onnx-int4-c112-cpu (fuente) | 0.6B | 1.12 s por chunk | ru, en | other (NVIDIA) | ONNX INT4 |
| Modelo base NVIDIA Nemotron-3.5 ASR streaming 0.6B | 0.6B | no disponible | no disponible | licencia NVIDIA | no disponible |

No se dispone de datos de benchmarks comparativos frente a alternativas de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta ruso e inglés; no se documentan otros idiomas.
- El WER en inglés (20.86 %) es notablemente superior al de ruso (14.75 %), lo que indica un rendimiento desigual entre idiomas.
- Riesgo de alucinación y errores en audio con ruido, acentos o solapamiento de hablantes; no se documentan evaluaciones en esas condiciones.
- La licencia es "other" y remite a la licencia original de NVIDIA Nemotron; es imprescindible revisarla antes de cualquier uso comercial.
- El modelo es un repack de un export de terceros; no procede directamente de NVIDIA y no cuenta con validación oficial del fabricante.
- Solo se han publicado métricas sobre Common Voice 17 con 500 muestras; la cobertura de evaluación es limitada.
- No se documentan sesgos específicos, pero al derivar del modelo base de NVIDIA pueden heredarse los del corpus original, no detallado.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/DimQ1/nemotron-3.5-asr-streaming-0.6b-onnx-int4-c112-compact-cpu
- Repo fuente: https://huggingface.co/DimQ1/nemotron-3.5-asr-streaming-0.6b-onnx-int4-c112-cpu
- Converter: `tools/converters/EncoderRepack` en el repositorio VoiceType / nemotron-speech-csharp (no se proporciona URL directa)
- Licencia original NVIDIA Nemotron: no disponible en la información proporcionada
