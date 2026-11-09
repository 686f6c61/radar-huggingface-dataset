# Infatoshi/phonon-asr-parakeet-tdt-0.6b-v2-onnx

## Resumen

Phonon ASR es un modelo de reconocimiento automático del habla (ASR) en inglés derivado de nvidia/parakeet-tdt-0.6b-v2, adaptado por Infatoshi mediante una LoRA denominada N8avg y exportado al formato transducer int8 de sherpa-onnx. Su propósito es servir como motor de dictado del teclado Android Phonon, por lo que está optimizado para inferencia en dispositivos con recursos limitados: el encoder pesa 609,8 MB en un fichero de datos separado que onnxruntime puede mapear en memoria en lugar de cargar todo el grafo en el heap.

La arquitectura subyacente es un transducer TDT (Token-and-Duration Transducer) de NVIDIA con 0,6 mil millones de parámetros, cuantizado a int8. Frente a la exportación estándar de sherpa-onnx, el decoder, el joiner y el fichero de tokens son idénticos byte a byte; solo cambia el encoder, que incorpora la LoRA N8avg (rank 16 sobre las 24 capas del encoder, con batch norm congelado) fusionada antes de la exportación.

La relevancia del modelo reside en su especialización: N8avg se entrenó exclusivamente con datos de habla públicos y con licencia abierta, con aumentación agresiva de ruido y hablantes superpuestos, y consigue mejoras notables en escenarios difíciles, especialmente en audio con habla de fondo (reducción de WER de 12 puntos absolutos en el conjunto SVQ con background speech). El encoder admite como máximo 400 segundos de audio por llamada, aunque las aplicaciones de Phonon decodifican en pasadas de 60 segundos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer transducer TDT (Token-and-Duration Transducer), encoder de 24 capas con LoRA N8avg fusionada |
| Parámetros totales | 0,6 mil millones (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; límite de 400 s de audio por llamada en el encoder, decodificación en pasadas de 60 s en las apps Phonon |
| Tipos de cuantización | int8 |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (encoder.int8.onnx + encoder.int8.onnx.data, decoder.int8.onnx, joiner.int8.onnx, tokens.txt) |

## Arquitectura y entrenamiento

El modelo es un transducer TDT de NVIDIA (parakeet-tdt-0.6b-v2) con un encoder de 24 capas. Sobre él se aplicó una LoRA de rank 16 en todas las capas del encoder con batch norm congelado; N8avg es la media exacta de dos semillas de entrenamiento, almacenada como un delta de rank 32 y fusionada antes de la exportación. La exportación sigue la receta de csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8. La única diferencia respecto a la exportación estándar es el encoder: sus pesos residen en un fichero `.data` separado para permitir memory-mapping por parte de onnxruntime.

Los datos de entrenamiento son exclusivamente habla pública con licencia abierta, sin grabaciones personales: GLOBE en inglés estadounidense (55.509 filas, CC0 1.0), LibriSpeech (28.433 filas, CC BY 4.0), YODAS2 y clips de YouTube CC BY (6.369 filas, CC BY 3.0 / CC BY) y EdAcc con muletillas y repeticiones eliminadas de las transcripciones (4.561 filas, CC BY-SA 4.0). La aumentación incluye un segundo hablante a 0-15 dB, ruido de fondo del mismo hablante, clips de 30 a 75 s, ruido y música de MUSAN (solo ítems de dominio público, CC BY y CC BY-SA 4.0), respuestas de impulso de sala, cambios de velocidad y de ganancia.

## Capacidades

- Reconocimiento de voz en inglés (transcripción de audio a texto) en formato mono a 16 kHz float32.
- Decodificación mediante transducer TDT con salida de duración de token, integrada en sherpa-onnx.
- Robustez mejorada frente a habla de fondo: reducción de WER de 12,00 puntos en SVQ con background speech y de 0,35 puntos en SVQ limpio.
- Mejora en dictado médico: reducción de WER de 1,29 puntos en ventanas de 60 s y 0,94 puntos en grabación completa de Med-Dictate.
- Inferencia en dispositivo: cuantización int8 y encoder con pesos mapeables en memoria, pensado para Android.
- Procesamiento de audio de hasta 400 s por llamada en el encoder; las apps lo trocean en pasadas de 60 s.
- No soporta tool calling, agentes, visión, audio generativo ni modo de razonamiento: es exclusivamente ASR.

## Casos de uso

- Dictado en teclados móviles: es el motor del teclado Android Phonon; el formato int8 y el encoder mapeable en memoria permiten ejecutarlo en dispositivos móviles sin cargar todo el grafo en el heap.
- Transcripción de reuniones y notas de voz: admite audio de hasta 400 s por llamada y decodifica en pasadas de 60 s, adecuado para grabaciones de duración media en inglés.
- Dictado clínico: las mejoras medidas en Med-Dictate (reducción de WER de 0,94-1,29 puntos) lo hacen útil para transcripción de notas médicas dictadas en inglés.
- Transcripción de audio con ruido de fondo: la aumentación con segundo hablante y ruido MUSAN se traduce en una reducción de 12 puntos de WER en SVQ con background speech, útil en grabaciones de campo o entornos concurridos.
- Subtitulado y transcripción por lotes en servidores con CPU: el formato ONNX int8 permite desplegar con sherpa-onnx en Python sin GPU, con `num_threads` configurable.
- Integración en aplicaciones de accesibilidad: transcripción local en inglés para entrada por voz en apps Android, sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

WER (%) del modelo fusionado frente a Parakeet TDT 0.6B v2 estándar, ambos en NeMo, con intervalos de confianza del 95 % por bootstrap emparejado:

| Conjunto | Stock | N8avg - stock |
|---|---:|---:|
| SVQ, background speech | 25,58 | -12,00 [-12,89, -11,13] |
| SVQ, clean | 8,23 | -0,35 |
| Med-Dictate, ventanas de 60 s | 8,80 | -1,29 [-2,19, -0,39] |
| Med-Dictate, grabación completa | 7,95 | -0,94 [-1,64, -0,23] |
| AppTek | 11,33 | -0,40 |
| Earnings-25 | 5,21 | -0,20 |
| EdAcc, muletillas y repeticiones normalizadas | 12,44 | -0,10 [-0,42, +0,23] |

En 578 clips privados de dictado real de menos de 400 s (no usados en entrenamiento), los ficheros int8 obtienen 18,02 de WER frente a 18,52 de la exportación int8 estándar: -0,49 [-0,71, -0,28]. La variante con fichero de datos externo decodifica de forma idéntica al encoder de fichero único en esos clips.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para ejecución en CPU (sherpa-onnx), no requiere GPU.
- Tamaño en disco: 0,7 GB de repositorio; encoder 609,8 MB en el fichero `.data`, encoder graph 42,4 MB, decoder 7,3 MB, joiner 1,7 MB.
- GPU recomendadas: no aplica; el despliegue objetivo es CPU, incluidos dispositivos Android.
- ¿Cabe en GPU consumer? No aplica; cabe en dispositivos móviles y en CPU de servidor.
- Opciones de despliegue: sherpa-onnx (Python y bindings nativos), onnxruntime; formato compatible con el ecosistema sherpa-onnx.
- Latencia y throughput: no disponibles; el modelo decodifica en pasadas de 60 s en las apps Phonon y admite hasta 400 s por llamada al encoder.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Infatoshi/phonon-asr-parakeet-tdt-0.6b-v2-onnx | 0,6 B | 400 s por llamada | CC BY-SA 4.0 | ONNX int8 | LoRA N8avg fusionada; mejor WER en habla con ruido |
| nvidia/parakeet-tdt-0.6b-v2 | 0,6 B | no disponible | CC BY 4.0 | NeMo | Modelo base sin adaptación |
| csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8 | 0,6 B | no disponible | CC BY 4.0 | ONNX int8 | Exportación estándar sin LoRA; decoder, joiner y tokens idénticos |

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, lo que limita su uso en entornos multilingües.
- Licencia CC BY-SA 4.0: impone compartir-al-igual; el uso comercial exige cumplir las condiciones de atribución y licencia derivada, incluida la de los datos EdAcc.
- Riesgo de alucinación en ASR: como todo modelo generativo de transcripción, puede producir texto plausible no presente en el audio, especialmente con ruido extremo o audio fuera de dominio.
- Límite de 400 s por llamada en el encoder; las apps Phonon trocean en pasadas de 60 s, lo que puede afectar a la coherencia en grabaciones largas.
- Dependencia de un fichero externo: `encoder.int8.onnx.data` debe mantenerse en la misma carpeta que `encoder.int8.onnx`; si falta, la carga falla.
- Entrenado con datos públicos y aumentación sintética; el rendimiento en dominios muy alejados (acentos no representados, jerga técnica) no está documentado.
- Sin datos publicados de sesgos demográficos ni de rendimiento por subgrupo.
- Repositorio sin descargas ni likes en el momento de la consulta; ecosistema y mantenimiento limitados a un único autor.

## Enlaces

- Hugging Face: https://huggingface.co/Infatoshi/phonon-asr-parakeet-tdt-0.6b-v2-onnx
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Exportación de referencia: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8
- Repositorio Phonon: https://github.com/Infatoshi/phonon
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
