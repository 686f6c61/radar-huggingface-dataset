# joaorura/parakeet-tdt-0.6b-v3-ptBR-sherpa-onnx-int8

## Resumen

Parakeet TDT 0.6B v3 pt-BR sherpa-onnx int8 es una conversión de formato del fine-tune en portugués brasileño del modelo Parakeet TDT 0.6B v3 de NVIDIA. No es un entrenamiento nuevo: el autor, joaorura, parte del checkpoint `.nemo` publicado por alexandreacff y lo exporta a los tres grafos ONNX que exige la librería sherpa-onnx (`encoder`, `decoder` y `joiner`), acompañados de un `tokens.txt`. El modelo resuelve una carencia concreta de herramientas: hasta su publicación no existía un export en formato sherpa-onnx de este fine-tune en pt-BR, solo exports en el formato de la librería `onnx-asr`, que funde decoder y joiner en un único `decoder_joint.onnx` y no es consumible por sherpa-onnx.

El modelo base es un transductor (RNN-T) con decodificación TDT de aproximadamente 0,6 mil millones de parámetros, ajustado sobre el dataset TAGARELA (unas 8.972 horas de pódcast en portugués, ICASSP 2026). La conversión aplica cuantización dinámica int8: `QUInt8` en el encoder y `QInt8` en decoder y joiner. El repositorio ocupa 0,7 GB y el encoder cuantizado pesa unos 622 MB, lo que lo sitúa en el rango de modelos desplegables en CPU y en dispositivos de borde.

Su relevancia es práctica y acotada: permite usar el fine-tune pt-BR con todos los bindings de sherpa-onnx (C++, Python, Java, Swift, Kotlin, Go, Rust, C#, Dart, Flutter) en lugar de reescribir el pipeline alrededor del formato `onnx-asr`. Como contrapartida, el propio autor declara que no existe ninguna evaluación formal ni medición de WER, y que el repositorio tiene cero descargas y cero valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transductor (RNN-T) con decodificación TDT (Token-and-Duration Transducer); `model_type` del encoder: `EncDecRNNTBPEModel` |
| Parámetros totales | ~0,6 mil millones (según nomenclatura del modelo, "0.6B") |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el identificador del fine-tune base indica segmentos de 30 s y la entrada es audio mono a 16 kHz |
| Tipos de cuantización | int8 dinámica: `QUInt8` en encoder, `QInt8` en decoder y joiner; solo se publican los tres grafos `.int8.onnx` |
| Idiomas soportados | portugués (`pt`, variante pt-BR) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX en tres grafos separados (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) más `tokens.txt` |
| Vocabulario | 8192 tokens (SentencePiece BPE, idéntico byte a byte al del `sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8` oficial) |
| Dimensión de características | 128 (`feat_dim`) |
| Factor de submuestreo | 8 (`subsampling_factor`) |
| Capas del predictor | 2 (`pred_rnn_layers`), dimensión oculta 640 (`pred_hidden`) |
| Normalización | `per_feature` |
| Frecuencia de muestreo | 16 kHz, mono, float32 |
| Tamaño del repositorio | 0,7 GB |

Metadatos internos del encoder, tal y como los grabó el script de export:

| Clave | Valor |
|---|---|
| `vocab_size` | 8192 |
| `normalize_type` | per_feature |
| `pred_rnn_layers` | 2 |
| `pred_hidden` | 640 |
| `subsampling_factor` | 8 |
| `model_type` | EncDecRNNTBPEModel |
| `feat_dim` | 128 |

Ficheros publicados:

| Fichero | Tamaño | SHA-256 |
|---|---|---|
| `encoder.int8.onnx` | 652.282.302 bytes (~622 MB) | `260aff7bf778b016b42385e186d88a57224bd6958001993dbb6070a9a75b6690` |
| `decoder.int8.onnx` | 11.845.274 bytes (~11,3 MB) | `6b77e877b1dc29ebead07c0f461a7385d1ac5f8eff5be6422fdddb390d4a9967` |
| `joiner.int8.onnx` | 6.355.277 bytes (~6,1 MB) | `eb365a33945103cb787aa849b344cbf2abc093b43211e3b969ff97be3fdfc0e4` |
| `tokens.txt` | 93.939 bytes | `d58544679ea4bc6ac563d1f545eb7d474bd6cfa467f0a6e2c1dc1c7d37e3c35d` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base de NVIDIA: un transductor encoder-decoder con decodificación TDT, donde el decoder (predictor) es una red recurrente de 2 capas con dimensión oculta 640 que predice, junto al token, su duración. El encoder aplica un factor de submuestreo de 8 sobre características mel de 128 dimensiones normalizadas por característica, y el vocabulario de salida es un SentencePiece BPE de 8192 tokens. Los metadatos grabados en el encoder (`EncDecRNNTBPEModel`, `per_feature`, `subsampling_factor: 8`, `feat_dim: 128`, `pred_hidden: 640`) confirman esta configuración; la información proporcionada no detalla el número de capas ni la dimensión del encoder, por lo que no se especifican aquí.

En cuanto al entrenamiento, esta ficha describe una conversión de formato, no un entrenamiento. El fine-tune pt-BR se realizó sobre el modelo multilingüe `nvidia/parakeet-tdt-0.6b-v3` usando el dataset TAGARELA (arXiv:2603.15326, ICASSP 2026), con aproximadamente 8.972 horas de pódcast en portugués. El tokenizer no se reentrenó: el `tokens.txt` es byte a byte idéntico al del export multilingüe oficial. La información disponible no menciona el uso de RLHF, DPO ni otras técnicas de alineación. El proceso de conversión consistió en ejecutar el script oficial `scripts/nemo/parakeet-tdt-0.6b-v3/export_onnx.py` del repositorio k2-fsa/sherpa-onnx sobre el checkpoint `.nemo`, y después aplicar `onnxruntime.quantization.quantize_dynamic` a cada uno de los tres grafos resultantes.

## Capacidades

- Reconocimiento automático de voz (ASR) en portugués brasileño, en modo offline (reconocimiento por segmentos completos, no streaming).
- Decodificación de transductor con predicción conjunta de token y duración (TDT), que reduce el número de pasos de decodificación respecto a un RNN-T estándar.
- Entrada de audio mono a 16 kHz en float32, con características de 128 dimensiones y normalización `per_feature`.
- Ejecución mediante `sherpa_onnx.OfflineRecognizer.from_transducer` con `model_type="nemo_transducer"`, configurable en número de hilos (`num_threads`), lo que permite ajustar latencia y consumo.
- Portabilidad a múltiples lenguajes y plataformas a través de los bindings de sherpa-onnx: C++, Python, Java, Swift, Kotlin, Go, Rust, C#, Dart y Flutter.
- Cuantización int8 que reduce el peso total a unos 640 MB y habilita despliegue en CPU y dispositivos de borde.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio generativo, marcas de tiempo ni puntuación y capitalización automáticas. No disponible.

## Casos de uso

- Transcripción de pódcast en portugués brasileño: es el dominio exacto del dataset de ajuste (TAGARELA, ~8.972 horas de pódcast), por lo que el modelo debería rendir mejor en este registro que en otros; se procesaría cada episodio dividido en segmentos y se concatenaría la salida.
- Subtitulado de vídeo y audio en pt-BR: integración en un pipeline de extracción de audio con ffmpeg, remuestreo a 16 kHz mono y transcripción por segmentos de hasta 30 s, generando un fichero de subtítulos.
- Transcripción de llamadas de atención al cliente: al ser un modelo pequeño y cuantizado, permite desplegar transcripción en servidores sin GPU y aplicar después análisis de intención o búsqueda sobre el texto resultante.
- Dictado de voz en aplicaciones móviles o de escritorio: los bindings de sherpa-onnx para Swift, Kotlin, Dart y Flutter permiten empaquetar el modelo dentro de la propia aplicación, con el encoder de ~622 MB como principal coste de distribución.
- Indexado y búsqueda de archivos de audio: transcripción por lotes de un repositorio de grabaciones para construir un índice de texto y habilitar búsqueda semántica o por palabra clave sobre el contenido hablado.
- Sistemas de borde sin conectividad: al no requerir GPU ni servicios externos, encaja en dispositivos con recursos limitados donde la transcripción debe ejecutarse localmente por privacidad o por falta de red.
- Actas y notas de reuniones en portugués: transcripción post-proceso de grabaciones, aceptando que el modelo no produce marcas de tiempo ni diarización por sí mismo.
- Evaluación comparativa de formatos de export: sirve como referencia para medir la diferencia entre el export `onnx-asr` y el export sherpa-onnx del mismo fine-tune, útil para quien deba elegir librería de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor lo declara explícitamente: no se midió ningún WER y no existe comparación contra fala humana. La única verificación realizada fue cualitativa, sobre 4 frases en portugués sintetizadas con `espeak-ng`, que el modelo transcribió correctamente en portugués en todos los casos, mientras que el Parakeet v3 multilingüe sin ajustar produjo texto en inglés en algunos de esos mismos audios. El propio autor advierte que la fala sintética es una prueba débil que no cubre variación de acento, ruido de fondo, solapamiento de voces ni características acústicas de fala humana real.

## Requisitos de hardware

- VRAM o RAM estimada para inferencia: los pesos int8 suman aproximadamente 640 MB (622 MB de encoder + 11,3 MB de decoder + 6,1 MB de joiner) más el espacio de activaciones y el búfer de audio. Un presupuesto de 1 a 1,5 GB de memoria es razonable, aunque la información proporcionada no incluye mediciones de consumo.
- GPU recomendadas: no disponibles. El modelo puede ejecutarse en CPU y no se documenta ningún requisito de GPU ni aceleración específica.
- Compatibilidad con GPU de consumo: el tamaño de los pesos permite alojar el modelo en cualquier GPU de consumo con al menos 2 GB libres, pero no se han publicado pruebas al respecto.
- CPU y dispositivos de borde: es el escenario principal del export; el ejemplo de la model card usa `num_threads=2` sobre CPU. El tamaño reducido lo hace apto para placas tipo Raspberry Pi y para integración en aplicaciones móviles mediante los bindings de sherpa-onnx.
- Opciones de despliegue: sherpa-onnx como librería principal (`sherpa_onnx.OfflineRecognizer.from_transducer`), con bindings para C++, Python, Java, Swift, Kotlin, Go, Rust, C#, Dart y Flutter. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje y no a transductores ASR.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF (Real Time Factor), latencia por segmento ni rendimiento en horas de audio por hora de cómputo.

## Comparativa con modelos similares

| Modelo | Formato | Precisión | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| joaorura/parakeet-tdt-0.6b-v3-ptBR-sherpa-onnx-int8 | ONNX sherpa-onnx (encoder + decoder + joiner + tokens.txt) | int8 dinámica | pt-BR | CC-BY-4.0 | Objeto de esta ficha; sin WER medido; 0 descargas |
| alexandreacff/parakeet-tdt-v3-ptBR-30s | checkpoint `.nemo` (NeMo) | original (fp32/bf16 según checkpoint) | pt-BR | no disponible en la información proporcionada | Fine-tune de origen del que deriva este export; requiere NeMo para su uso |
| alefiury/parakeet-tdt-0.6b-v3-ptBR-TAGARELA-onnx | ONNX formato `onnx-asr` (`decoder_joint.onnx` + `vocab.txt`) | no especificada | pt-BR | no disponible en la información proporcionada | Mismo fine-tune, formato incompatible con sherpa-onnx |
| calneymgp/parakeet-tdt-0.6b-v3-ptBR-TAGARELA-onnx-int8 | ONNX formato `onnx-asr` | int8 | pt-BR | no disponible en la información proporcionada | Versión cuantizada del export anterior |
| nvidia/parakeet-tdt-0.6b-v3 | varios (modelo base) | original | multilingüe | no disponible en la información proporcionada | Modelo base sin ajuste; rinde peor en pt-BR según la prueba cualitativa del autor |

Como referencia externa, `openai/whisper-large-v3` es otra alternativa habitual para reconocimiento de voz en portugués, con licencia MIT y aproximadamente 1,55 mil millones de parámetros, pero no se dispone de comparación de WER entre ambos modelos en la información proporcionada, por lo que no se incluye como fila cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluación formal: no hay WER medido, no hay benchmark contra fala humana y no hay comparación con otros sistemas. Cualquier afirmación de calidad es, a día de hoy, especulativa.
- La única validación es cualitativa y sobre 4 frases sintéticas con `espeak-ng`, un dominio que no reproduce acentos, ruido, solapamiento de voces ni condiciones reales de grabación.
- Sesgo de dominio probable: el ajuste se hizo sobre pódcast en portugués (dataset TAGARELA), por lo que el rendimiento en otros registros (llamadas telefónicas, audio con ruido, habla espontánea, voces infantiles) no está caracterizado.
- Sesgo lingüístico: aunque el tokenizer es el multilingüe de 8192 tokens del v3, el ajuste está orientado a pt-BR; no hay evidencia de que mantenga competencia en otras lenguas tras el fine-tune.
- Modelo puramente offline: la API usada es `OfflineRecognizer`, orientada a segmentos completos, no a streaming incremental. No es apto para transcripción en tiempo real sin segmentar el audio por fuera.
- Riesgo de alucinación y bucles de repetición: es un comportamiento documentado en transductores ASR ante silencios o audio no vocal; no se ha caracterizado en esta conversión concreta.
- La cuantización dinámica int8 puede degradar la precisión respecto al modelo en precisión original, y esa pérdida no se ha medido.
- No se documentan marcas de tiempo, puntuación, capitalización ni diarización de hablantes.
- Licencia CC-BY-4.0: permite uso comercial, redistribución y modificación, pero exige mantener la atribución. La cadena de atribución incluye a NVIDIA (modelo base), alexandreacff (fine-tune pt-BR), el dataset TAGARELA y los exports hermanos citados en la model card.
- Repositorio sin validación comunitaria: 0 descargas y 0 valoraciones, publicado y actualizado el mismo día. Es un artefacto reciente y no contrastado por terceros.
- Verificar los SHA-256 publicados antes de desplegar en producción, ya que los pesos provienen de una conversión de terceros y no del autor original del fine-tune.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joaorura/parakeet-tdt-0.6b-v3-ptBR-sherpa-onnx-int8
- Modelo base del fine-tune: https://huggingface.co/alexandreacff/parakeet-tdt-v3-ptBR-30s
- Modelo base multilingüe de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Dataset TAGARELA: https://huggingface.co/datasets/freds0/TAGARELA
- Paper del dataset TAGARELA: https://arxiv.org/abs/2603.15326 (arXiv:2603.15326, ICASSP 2026)
- Export hermano en formato `onnx-asr`: https://huggingface.co/alefiury/parakeet-tdt-0.6b-v3-ptBR-TAGARELA-onnx
- Export hermano cuantizado en formato `onnx-asr`: https://huggingface.co/calneymgp (perfil; la model card no enlaza la URL directa del repositorio `calneymgp/parakeet-tdt-0.6b-v3-ptBR-TAGARELA-onnx-int8`)
- Repositorio de sherpa-onnx (librería y script de export): https://github.com/k2-fsa/sherpa-onnx
- Script de export utilizado: `scripts/nemo/parakeet-tdt-0.6b-v3/export_onnx.py` dentro del repositorio anterior
