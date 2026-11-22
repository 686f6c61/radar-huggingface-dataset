# Maximilian228/Geode-STT-indicconformer

## Resumen

Geode-STT-indicconformer es un paquete de reconocimiento automático del habla (ASR) derivado de ai4bharat/indic-conformer-600m-multilingual, el modelo Conformer híbrido CTC-RNNT de AI4Bharat para lenguas de la India. Lo publica Maximilian228 como parte del proyecto Geode, una aplicación Android que ejecuta modelos de lenguaje y voz de forma totalmente local, sin nube ni cuenta de usuario. El paquete está convertido al formato de sherpa-onnx (transducer NeMo con encoder y prediction net compartidos y un joiner por idioma) y cuantizado a int8, de modo que puede ejecutarse en un teléfono móvil.

El modelo resuelve el problema del dictado y la transcripción offline en nueve idiomas del subcontinente indio: hindi, bengalí, tamil, telugu, marati, guyaratí, canarés, panyabí y urdu. Su relevancia actual reside en que demuestra un flujo de conversión reproducible desde pesos NeMo a sherpa-onnx con cuantización QUInt8, manteniendo un tamaño de repositorio de 0,7 GB y un consumo de memoria en dispositivo de unos 767 MB de RSS pico, con un factor de tiempo real (RTF) de 0,161 en un Snapdragon 720G.

La arquitectura subyacente es un Conformer de 600 millones de parámetros con decodificación conjunta CTC y RNNT, adaptado aquí a un transducer puro de sherpa-onnx. La licencia es MIT tanto en el modelo base como en este paquete, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer híbrido CTC-RNNT (modelo base); transducer NeMo en sherpa-onnx (paquete) |
| Parámetros totales | 600 M (modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por utterance; sin ventana de contexto declarada) |
| Tipos de cuantización | int8 (QUInt8, formato de las releases NeMo de sherpa-onnx) |
| Idiomas soportados | hi, bn, ta, te, mr, gu, kn, pa, ur |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx por idioma, tokens.txt) |
| Tamaño del repositorio | 0,7 GB |
| Librería | sherpa-onnx |
| Tipo de modelo sherpa-onnx | transducer |
| Revisión del modelo base | 2a77d30503 |

## Arquitectura y entrenamiento

El modelo base, ai4bharat/indic-conformer-600m-multilingual, es un Conformer de 600 millones de parámetros entrenado por AI4Bharat para las lenguas programadas de la India. Emplea un esquema híbrido CTC-RNNT: una cabeza CTC y otra RNNT comparten el encoder, lo que permite decodificación sin modelo de lenguaje externo y con alineamiento implícito. La model card de este paquete no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino con RLHF o DPO; esos datos deben consultarse en la model card del modelo original.

La conversión realizada por el proyecto Geode transforma las partes ONNX de NeMo en un transducer NeMo para sherpa-onnx: un encoder compartido, una prediction net compartida y un joiner por idioma, cada uno con su slice de 257 tokens de la cabeza compartida. La cuantización int8 sigue el esquema QUInt8 de las releases NeMo de sherpa-onnx. El script de conversión es tools/stt/make_indic_sherpa.py. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto (ASR) en nueve idiomas: hindi, bengalí, tamil, telugu, marati, guyaratí, canarés, panyabí y urdu.
- Funcionamiento completamente offline y en dispositivo, sin llamadas a servicios en la nube.
- Decodificación transducer RNNT con joiner específico por idioma, lo que permite seleccionar el idioma en tiempo de ejecución cargando el joiner y los tokens correspondientes.
- Integración con sherpa-onnx, lo que habilita uso desde CLI, aplicaciones Android y otros bindings de la librería.
- Procesamiento por utterance con normalización de mayúsculas y puntuación en la evaluación; no se declaran capacidades de diarización, timestamps por palabra ni detección de idioma automática.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo exclusivamente de reconocimiento de voz.

## Casos de uso

- Dictado por voz en aplicaciones Android: integrado mediante sherpa-onnx en la app Geode, transcribe en tiempo real con un RTF de 0,161 en un Snapdragon 720G, lo que permite dictado fluido sin conexión.
- Transcripción de reuniones y notas de voz: el modelo procesa clips de audio locales en el dispositivo, con un consumo pico de 767 MB de RSS, adecuado para grabar y transcribir conversaciones sin enviar datos a terceros.
- Subtitulado offline de vídeo: al ser un transducer con decodificación por utterance, puede alimentarse con segmentos de audio extraídos de un vídeo para generar subtítulos en cualquiera de los nueve idiomas soportados.
- Asistentes de voz embebidos: el joiner por idioma permite fijar el idioma del usuario y mantener un pipeline de reconocimiento ligero dentro de un asistente local que combine ASR con un modelo de texto como los otros paquetes Geode (por ejemplo, Geode-LFM3-1.7B).
- Aplicaciones de accesibilidad: transcripción de voz a texto para personas con dificultades auditivas o motoras, ejecutándose íntegramente en el teléfono y sin depender de conectividad.
- Investigación en ASR multilingüe de bajo recurso: el paquete sirve como referencia reproducible de conversión NeMo a sherpa-onnx con cuantización int8, útil para comparar WER en los nueve idiomas con un coste de hardware mínimo.
- Procesamiento por lotes en CPU de portátil: la evaluación del autor se realizó en CPU de portátil con sherpa-onnx, lo que indica que puede desplegarse en servidores modestos para transcripción por lotes sin GPU.

## Benchmarks y rendimiento

Resultados de WER medidos por el autor sobre FLEURS test (normalizado, sin mayúsculas ni puntuación), con sherpa-onnx y los ficheros del paquete en CPU de portátil, sobre 30 utterances por idioma:

| Idioma | Métrica | Error % | Utterances |
|---|---|---|---|
| hi | WER | 10,26 | 30 |
| bn | WER | 14,52 | 30 |
| ta | WER | 28,57 | 30 |
| te | WER | 19,84 | 30 |
| mr | WER | 16,94 | 30 |
| gu | WER | 19,35 | 30 |
| kn | WER | 17,67 | 30 |
| pa | WER | 19,07 | 30 |
| ur | WER | 15,20 | 30 |

Rendimiento en dispositivo (Redmi Note 9 Pro, Snapdragon 720G, sherpa-onnx v2.0.1 CLI, 4 hilos):

| Métrica | Valor |
|---|---|
| Tiempo de carga | 5,5 s |
| RTF (clip de 10 s) | 0,161 |
| RSS pico (VmHWM) | 767 MB |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de uso principal, que es CPU en dispositivo; el paquete está cuantizado a int8 y el repositorio completo ocupa 0,7 GB.
- Memoria RAM: aproximadamente 767 MB de RSS pico medidos en un Snapdragon 720G con 4 hilos.
- GPU recomendadas: no se declaran; el modelo está pensado para CPU. Cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: sí, por tamaño (0,7 GB en int8), aunque no se han publicado mediciones en RTX 4090, A100 o H100.
- Opciones de despliegue: sherpa-onnx (CLI, Android y bindings), ONNX Runtime; el formato es específico de sherpa-onnx y no se distribuye en GGUF ni en safetensors.
- Latencia y throughput: RTF de 0,161 en un clip de 10 s con 4 hilos en Snapdragon 720G; tiempo de carga de 5,5 s. No hay datos de throughput por lotes ni de latencia en otros hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| Geode-STT-indicconformer (este) | 600 M | 9 lenguas de la India | ONNX int8 (sherpa-onnx) | MIT | Paquete transducer con joiner por idioma; WER 10,26–28,57 % en FLEURS |
| ai4bharat/indic-conformer-600m-multilingual | 600 M | Lenguas de la India | NeMo / ONNX | MIT | Modelo base híbrido CTC-RNNT; sin cuantización específica para móvil |
| ai4bharat/indicconformer_stt_ta_hybrid_ctc_rnnt_large | no disponible | tamil | NeMo | no disponible en la información | Variante específica para tamil del mismo linaje IndicConformer |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El WER es notablemente alto en tamil (28,57 %) y moderado en el resto (10,26–19,84 %), medido sobre solo 30 utterances por idioma, lo que reduce la significación estadística de las cifras.
- El paquete no incluye modelo de lenguaje externo ni puntuación; la evaluación se hizo con normalización de mayúsculas y puntuación, por lo que la salida en producción puede carecer de formato natural.
- No se documentan sesgos específicos, pero al derivar de un modelo entrenado principalmente con datos de lenguas de la India, el rendimiento fuera de ese dominio lingüístico y acústico no está caracterizado.
- Riesgo de alucinación inherente a los modelos transducer en audio ruidoso o con acentos no representados en el entrenamiento; no hay datos de robustez publicados.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia y condiciones del modelo base ai4bharat/indic-conformer-600m-multilingual, también MIT según la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de validación independiente más allá de las mediciones del autor.
- El formato es específico de sherpa-onnx; no hay pesos en safetensors ni GGUF, lo que limita su uso fuera de ese ecosistema.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/Maximilian228/Geode-STT-indicconformer
- Modelo base: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual
- Colección IndicConformer de AI4Bharat: https://huggingface.co/collections/ai4bharat/indicconformer
- Variante tamil IndicConformer: https://huggingface.co/ai4bharat/indicconformer_stt_ta_hybrid_ctc_rnnt_large
- Otros paquetes Geode: https://huggingface.co/Maximilian228/Geode-Qwen3.6-35B-A3B, https://huggingface.co/Maximilian228/Geode-Supertonic-3, https://huggingface.co/Maximilian228/Geode-LFM3-1.7B
