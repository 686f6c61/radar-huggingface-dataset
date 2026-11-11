# audeolabs/kea-t

## Resumen

Kea-T es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por audeolabs, derivado de nvidia/parakeet-tdt-0.6b-v2 mediante cuantización ternaria de los pesos del codificador. Concretamente, todas las matrices grandes del encoder FastConformer de 24 capas (proyecciones de atención, feed-forward y convoluciones pointwise, que suponen el 98% de los parámetros) quedan restringidas a tres valores (-1, 0, +1) con una escala FP32 por fila de salida. El resultado es un fichero de pesos de 180,8 MB frente a los 2.472 MB del original, con una pérdida de precisión parcialmente recuperada mediante entrenamiento consciente de cuantización (QAT) con destilación del modelo original.

El modelo mantiene la arquitectura TDT (Token-and-Duration Transducer) sobre encoder FastConformer del modelo base de NVIDIA, orientada a transcripción de audio en inglés. Su relevancia reside en la drástica reducción de huella en disco y memoria, junto con una latencia y un consumo energético menores, lo que lo hace atractivo para despliegues en entornos con recursos limitados. El WER medio sobre siete conjuntos de evaluación es del 6,84%, frente al 6,45% del original FP32 según la puntuación del propio autor.

La licencia es CC-BY-4.0 y el modelo se distribuye en formato NeMo (`.nemo`). Existe un hermano de 1 bit, Kea-B, de 105,3 MB y un WER medio del 7,05%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) con encoder FastConformer de 24 capas y pesos ternarios (-1, 0, +1) |
| Parametros totales | no disponible (98% de los parametros del encoder en formato ternario; tamano de pesos 180,8 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (-1, 0, +1) con una escala FP32 por fila de salida; QAT con destilacion |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | NeMo (`.nemo`); runtime CUDA propio para inferencia ternaria |

## Arquitectura y entrenamiento

Kea-T parte de nvidia/parakeet-tdt-0.6b-v2, un modelo ASR con arquitectura TDT (Token-and-Duration Transducer) y encoder FastConformer de 24 capas. La modificación principal consiste en constreñir a valores ternarios (-1, 0, +1) las matrices grandes del encoder: proyecciones de atención, proyecciones feed-forward y convoluciones pointwise, que representan el 98% de los parámetros del modelo. Cada fila de salida conserva una escala FP32 para reconstruir la magnitud.

Para recuperar la precisión perdida por la cuantización se aplica entrenamiento consciente de cuantización (QAT) con destilación de conocimiento desde el modelo original. Los datos de entrenamiento declarados incluyen espnet/yodas-granary, openslr/librispeech_asr, MLCommons/peoples_speech, facebook/voxpopuli y edinburghcstr/ami. No se especifican en la información disponible el número de tokens ni la composición detallada del dataset.

El modelo se distribuye en modo expandido y requiere un runtime CUDA propio del autor para aprovechar las ventajas de velocidad; el script `load_ternary.py` no proporciona ese rendimiento. El runtime dispone además de un modo compacto con 1,27 GB de VRAM de proceso (41,8% menos que la build BF16 optimizada del original).

## Capacidades

- Reconocimiento automático del habla en inglés con decodificación greedy.
- Transcripción de audio mediante arquitectura TDT, que predice tokens y duraciones de forma conjunta.
- Inferencia eficiente en memoria y energía gracias a los pesos ternarios del encoder.
- Ejecución en modo expandido (rendimiento estándar) y modo compacto (menor huella de VRAM) mediante el runtime propio.
- Compatibilidad con el ecosistema NeMo para carga y ejecución del modelo.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo thinking.

## Casos de uso

- Transcripción de reuniones y actas: el modelo maneja audio conversacional (evaluado en AMI con 10,42% WER) y puede integrarse en pipelines de diarización y resumen posteriores, con una huella de 180,8 MB que facilita el despliegue en servidores modestos.
- Subtitulado y transcripción de contenido audiovisual en inglés: su WER de 2,05% en LibriSpeech test-clean lo hace adecuado para material con audio limpio, y su baja latencia (4,46 ms por clip de 10 s) permite procesamiento casi en tiempo real.
- Dictado y asistentes de voz en dispositivos con recursos limitados: el tamaño reducido del fichero de pesos y el modo compacto del runtime (1,27 GB de VRAM de proceso) permiten ejecutarlo en GPUs de consumo.
- Procesamiento por lotes de grandes volúmenes de audio: el menor consumo energético (1,57 J por clip de 10 s frente a 1,90 J del original) reduce el coste operativo en granjas de inferencia.
- Transcripción de audio telefónico y de reuniones de negocios: los resultados en Earnings-22 (11,72% WER) y SPGISpeech (2,94% WER) cubren dominios financieros y corporativos.
- Investigación en cuantización extrema de modelos ASR: sirve como referencia reproducible para estudiar QAT ternario con destilación en arquitecturas Conformer/Transducer.
- Despliegue en entornos con restricciones de almacenamiento: el fichero de 180,8 MB frente a los 2.472 MB del original simplifica la distribución y el versionado de modelos en contenedores.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER en %, decodificación greedy, sobre el bundle de test de Open ASR Leaderboard):

| Modelo | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media de 7 | Common Voice |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Original FP32 (puntuación del autor) | 1,70 | 3,19 | 11,15 | 11,24 | 9,78 | 2,14 | 5,94 | 6,45 | 8,50 |
| Kea-T | 2,05 | 4,20 | 10,42 | 11,72 | 10,35 | 2,94 | 6,19 | 6,84 | 12,56 |

Métricas de eficiencia declaradas (clip de 10 s, batch uno, RTX 5090 a 400 W, modo expandido frente a build BF16 optimizada del original):

| Métrica | Kea-T | Original |
|---|---:|---:|
| Tamano del fichero de pesos | 180,8 MB | 2.472 MB |
| Latencia | 4,46 ms (23,2% menos) | 5,81 ms |
| Energía de GPU | 1,57 J (17,1% menos) | 1,90 J |
| VRAM de proceso | 1,89 GB (13,5% menos) | 2,18 GB |

El runtime de investigación con activaciones INT8 en dos partes alcanza 4,30 ms (25,9% menos que la build BF16) y aproximadamente 1,33 J (cerca de 30% menos), según mediciones en una sesión posterior; la comparación energética es aproximada.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,89 GB de VRAM de proceso en modo expandido y 1,27 GB en modo compacto (clip de 10 s, RTX 5090).
- GPU recomendadas: RTX 5090 para las mediciones publicadas; no se documentan otras GPU en la información disponible.
- Cabe en GPU de consumo: sí, según las mediciones del autor en RTX 5090; no se especifican otros modelos de consumo.
- Opciones de despliegue: NeMo para carga del modelo y runtime CUDA propio del autor (repositorio wilderness-labs-stt) para inferencia ternaria; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 4,46 ms por clip de 10 s en modo expandido y 4,30 ms con el runtime de investigación (INT8x2); no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | WER medio (7 sets) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kea-T | 180,8 MB de pesos | no disponible | 6,84% | CC-BY-4.0 | Hugging Face (audeolabs/kea-t) |
| Kea-B (hermano de 1 bit) | 105,3 MB | no disponible | 7,05% | no disponible en la informacion | Hugging Face (audeolabs/kea-b) |
| nvidia/parakeet-tdt-0.6b-v2 (original) | 2.472 MB (`.nemo`) | no disponible | 6,45% (puntuación del autor) | no disponible en la informacion | Hugging Face (nvidia/parakeet-tdt-0.6b-v2) |

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran otros idiomas.
- El WER se degrada de forma notable en Common Voice (12,56% frente a 8,50% del original), lo que sugiere menor robustez ante audio espontáneo y diverso.
- El WER empeora en la mayoría de conjuntos respecto al original FP32 (LibriSpeech clean, LibriSpeech other, Earnings-22, GigaSpeech, SPGISpeech, VoxPopuli y Common Voice), aunque mejora en AMI.
- El rendimiento de velocidad declarado requiere el runtime CUDA propio del autor; `load_ternary.py` no ofrece esas ventajas.
- Los resultados de benchmarks están declarados por el autor y no verificados (`verified: false`), y el WER del original corresponde a la puntuación propia del autor, no a cifras oficiales de NVIDIA.
- La comparación energética con el runtime de investigación INT8x2 es aproximada según el propio autor.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un modelo ASR, los errores se manifiestan como sustituciones, omisiones e inserciones en la transcripción.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos de la licencia del modelo base de NVIDIA para usos derivados.
- El bundle de evaluación no incluye TED-LIUM, por lo que la media de siete conjuntos no cubre ese conjunto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/audeolabs/kea-t
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Hermano de 1 bit (Kea-B): https://huggingface.co/audeolabs/kea-b
- Runtime CUDA propio: https://github.com/ajbarryiii/wilderness-labs-stt/tree/main/finetune/parakeet-ternary/inference
- Documentación del runtime (RUNTIME.md): https://github.com/ajbarryiii/wilderness-labs-stt/tree/main/finetune/parakeet-ternary/inference/RUNTIME.md
- Detalles del runtime de investigación con activaciones INT8x2: https://github.com/ajbarryiii/wilderness-labs-stt/tree/main/finetune/parakeet-ternary/inference/RUNTIME.md#research-runtime-with-int8x2-activations
