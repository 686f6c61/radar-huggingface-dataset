# audeolabs/kea-b

## Resumen

Kea-B es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por Audeo Labs, derivado del modelo de NVIDIA Parakeet-TDT-0.6B-v2. Su particularidad es que las matrices grandes del encoder se almacenan con pesos binarios de un bit (+1 o -1, con una escala por fila), lo que reduce el fichero de pesos de 2.472 MB a 105,3 MB. El objetivo es ofrecer un ASR de calidad cercana al original con una huella de memoria y un coste energético mucho menores.

El modelo emplea la arquitectura FastConformer con decodificador TDT (Token-and-Duration Transducer) heredada de Parakeet, y se ha obtenido mediante entrenamiento consciente de cuantización (QAT) y destilación de conocimiento desde el modelo base en FP32. Está pensado para despliegues con restricciones severas de memoria, latencia o consumo, como dispositivos en el borde o servicios de transcripción de alto volumen.

Es relevante ahora porque demuestra que la cuantización extrema a 1 bit es viable en producción para ASR: la penalización media de WER en siete conjuntos de la Open ASR Leaderboard es de 6,45% a 7,05%, con una latencia de 3,88 ms frente a 5,81 ms del original en un clip de 10 segundos sobre una RTX 5090. Existe también una variante hermana, Kea-T, con pesos ternarios (-1, 0, +1) de 180,8 MB y un WER medio de 6,84%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + decodificador TDT (Token-and-Duration Transducer), pesos del encoder binarios (1 bit) |
| Parametros totales | no disponible (modelo base Parakeet-TDT-0.6B-v2, aproximadamente 0,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos binarios (1 bit, +1/-1 con escala por fila); activaciones INT8 en dos partes en el runtime de referencia |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (`.nemo`); fichero de pesos de 105,3 MB |

## Arquitectura y entrenamiento

Kea-B parte de NVIDIA Parakeet-TDT-0.6B-v2, un modelo ASR con encoder FastConformer (una variante de Conformer con atención por bloques que reduce el coste computacional) y decodificador TDT, que predice conjuntamente tokens y duraciones. Sobre esta base, Audeo Labs aplica cuantización binaria a las matrices grandes del encoder: cada peso se representa como +1 o -1 multiplicado por una escala por fila, lo que comprime el modelo hasta 105,3 MB.

El proceso de obtención combina entrenamiento consciente de cuantización (QAT) y destilación de conocimiento desde el modelo original en FP32, de modo que el modelo binario aprende a imitar las salidas del profesor. Los datos de entrenamiento declarados incluyen espnet/yodas-granary, openslr/librispeech_asr, MLCommons/peoples_speech, facebook/voxpopuli y edinburghcstr/ami. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR).

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio, con salida de transcripción textual.
- Decodificación greedy y transcripción de clips de distinta duración (se han medido clips de 3 s, 10 s y 30,04 s).
- Manejo de audio de conversaciones y reuniones (evaluado en AMI), discursos (VoxPopuli), audio financiero (Earnings-22) y habla espontánea (Common Voice).
- Inferencia de baja latencia y bajo consumo energético gracias a los pesos binarios y a las activaciones INT8.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio multi-idioma ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y conversaciones: el modelo se ha evaluado en AMI (WER 10,65%), por lo que es adecuado para diarización y actas automáticas en entornos corporativos con audio de sala.
- Subtitulado y transcripción de vídeo a gran escala: su tamaño de 105,3 MB y su latencia de 3,88 ms por clip de 10 s permiten procesar lotes masivos en servidores modestos.
- Asistentes de voz en el borde: al caber en memoria muy reducida, puede desplegarse en dispositivos con recursos limitados para comandos y dictado en inglés.
- Actas de llamadas de atención al cliente: el rendimiento en Earnings-22 (12,17%) y Common Voice (13,42%) lo hace utilizable para transcripción de audio telefónico y habla espontánea, con revisión humana en producciones críticas.
- Indexación y búsqueda de archivos de audio: la transcripción rápida permite generar índices de texto sobre grandes archivos de audio para búsqueda posterior.
- Investigación en cuantización extrema: sirve como referencia reproducible para estudiar el impacto de pesos de 1 bit en modelos de voz, comparándolo con Kea-T (ternario) y el original en FP32.
- Pipelines de accesibilidad: generación de subtítulos en directo para contenido en inglés con coste energético reducido (aproximadamente 1,20 J por clip de 10 s).

## Benchmarks y rendimiento

WER de test (%), decodificación greedy, sobre el bundle de test de Open ASR Leaderboard:

| Modelo | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media de 7 | Common Voice |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Original FP32 (medición del autor) | 1,70 | 3,19 | 11,15 | 11,24 | 9,78 | 2,14 | 5,94 | 6,45 | 8,50 |
| Kea-T (ternario) | 2,05 | 4,20 | 10,42 | 11,72 | 10,35 | 2,94 | 6,19 | 6,84 | 12,56 |
| Kea-B (este modelo) | 2,20 | 4,56 | 10,65 | 12,17 | 10,46 | 3,01 | 6,30 | 7,05 | 13,42 |

Datos de eficiencia declarados por el autor (clip de 10 s, batch uno, RTX 5090 a 400 W):

| Métrica | Kea-B | Original |
|---|---:|---:|
| Fichero de pesos | 105,3 MB | 2.472 MB |
| Latencia | 3,88 ms (33,3% menos) | 5,81 ms |
| Energía aproximada | 1,20 J (aproximadamente 37% menos) | 1,90 J |

Nota: las cifras de latencia y energía comparan Kea-B sobre el runtime de 1 bit del autor con una compilación BF16 propia del original, no con NeMo estándar, y no se midieron en la misma sesión. Los resultados del model-index figuran como no verificados.

## Requisitos de hardware

- VRAM estimada: muy reducida; el fichero de pesos ocupa 105,3 MB, por lo que la inferencia cabe en GPUs de gama baja y posiblemente en memoria unificada de dispositivos integrados (no se publican cifras exactas de VRAM pico).
- GPU recomendadas: RTX 5090 (medición del autor); cualquier GPU moderna con soporte para el runtime de 1 bit debería ser suficiente. No se detallan requisitos para A100 o H100.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño del modelo.
- Opciones de despliegue: NeMo (librería declarada) y el runtime de investigación de 1 bit del autor, publicado solo como referencia y no empaquetado para uso general. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 3,88 ms por clip de 10 s en RTX 5090 a 400 W (batch uno, de onda a texto). No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER medio (7 sets) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kea-B | ~0,6B (encoder binario) | no disponible | 7,05% | CC-BY-4.0 | Hugging Face (audeolabs/kea-b) |
| Kea-T | ~0,6B (encoder ternario) | no disponible | 6,84% | no disponible en la información | Hugging Face (audeolabs/kea-t) |
| Parakeet-TDT-0.6B-v2 (original) | ~0,6B | no disponible | 6,45% (medición del autor) | no disponible en la información | Hugging Face (nvidia/parakeet-tdt-0.6b-v2) |

## Limitaciones y advertencias

- Solo reconoce inglés; no hay soporte multilingüe declarado.
- La cuantización a 1 bit degrada el WER frente al original: la media pasa de 6,45% a 7,05%, y en Common Voice de 8,50% a 13,42%, una diferencia considerable en habla espontánea.
- Los resultados del model-index están marcados como no verificados y proceden de la evaluación del propio autor.
- El runtime de 1 bit está publicado solo como referencia y no empaquetado para uso general, lo que limita el despliegue en producción sin trabajo de integración adicional.
- Las comparaciones de latencia y energía no se midieron en la misma sesión y el autor estima un margen de error de hasta el 8% en energía.
- No se documentan sesgos específicos, pero al entrenarse con datasets mayoritariamente de dominio público y conversacional puede tener peor comportamiento en acentos o dominios poco representados.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar las condiciones del modelo base de NVIDIA para usos derivados.
- Riesgo de alucinación inherente a ASR: en audio ruidoso o con solapamiento de hablantes puede generar transcripciones incorrectas sin señalizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/audeolabs/kea-b
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Variante ternaria Kea-T: https://huggingface.co/audeolabs/kea-t
- Runtime de 1 bit (referencia): https://github.com/ajbarryiii/wilderness-labs-stt/blob/main/finetune/parakeet-binary/gpu1bit/README.md
- Open ASR Leaderboard (bundle de test): https://huggingface.co/datasets/hf-audio/esb-datasets-test-only-sorted
