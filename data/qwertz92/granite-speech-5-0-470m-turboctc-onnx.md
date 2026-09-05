# qwertz92/granite-speech-5.0-470m-turboctc-onnx

## Resumen

Granite Speech 5.0 470M TurboCTC es un modelo de reconocimiento automático de voz (ASR) compacto de 470 millones de parámetros desarrollado por IBM. Está diseñado específicamente para transcripción de audio en inglés con una velocidad de inferencia muy alta, lo que lo hace adecuado para su despliegue en dispositivos de borde como portátiles, teléfonos inteligentes y hardware de baja potencia.

Este repositorio, creado por qwertz92, ofrece una conversión comunitaria del checkpoint original de IBM a formato ONNX. Incluye gráficos en FP32, FP16 e INT8 dinámico, junto con scripts de conversión, hashes de verificación, validaciones independientes y mediciones de rendimiento locales en CPU y GPU DirectML. El modelo base tiene una arquitectura de conformer acústico con self-attention por bloques, auto-condicionamiento y reducción temporal, con una capa de salida de 16 384 unidades BPE.

La relevancia de esta conversión radica en que permite ejecutar el modelo mediante ONNX Runtime, incluidas implementaciones de CPU y DirectML para GPU, sin necesidad de un entorno PyTorch completo. Los distintos niveles de precisión ofrecen flexibilidad para adaptarse a las restricciones de memoria y requisitos de rendimiento de cada sistema.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer acústico con self-attention por bloques, auto-condicionamiento y reducción temporal; decodificación CTC |
| Parametros totales | 470 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de ASR; entrada de features de audio, no de lenguaje) |
| Tipos de cuantizacion | FP32, FP16 (pesos y cómputo), INT8 dinámico per-channel (QInt8 para MatMul) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo original de IBM, Granite Speech 5.0 470M TurboCTC, utiliza un codificador acústico de tipo conformer con self-attention por bloques, auto-condicionamiento y reducción temporal. La capa de salida se compone de 16 384 unidades BPE, y el modelo se decodifica mediante CTC. El grafo ONNX de esta conversión acepta como entrada `input_features` en formato float32 con dimensiones `[batch_size, feature_frames, 320]` y produce `logits` en float32 con dimensiones `[batch_size, floor(feature_frames / 4), 16384]`, lo que implica una reducción temporal de 4x. El opset de ONNX es 17.

No se han publicado en la información disponible detalles sobre el proceso de entrenamiento, como el número de tokens, la composición del dataset o si se realizó RLHF/DPO. La conversión a ONNX incluye scripts reproducibles, hashes de archivos y una validación independiente en PyTorch con 31 casos de prueba (20 clips de LibriSpeech, 10 longitudes sintéticas y un caso por lotes). La extracción de características y la decodificación CTC greedily quedan fuera del grafo, por lo que se requiere un procesador externo.

## Capacidades

- Reconocimiento automático de voz en inglés mediante decodificación CTC.
- Tres variantes de precisión: FP32, FP16 e INT8 dinámico.
- Ejecución compatible con ONNX Runtime, incluidas CPU y DirectML.
- Soporte de procesamiento por lotes para clips de la misma longitud.
- Incompatible con tool calling, function calling o capacidades de agente, al ser exclusivamente un modelo de ASR.
- Sin soporte multimodal de visión ni de audio más allá del reconocimiento de voz.
- Decodificación no incluida en el grafo; requiere integración externa con un decodificador greedy CTC.

## Casos de uso

- Transcripción en tiempo real en dispositivos de borde: gracias a su tamaño de 470 millones de parámetros y a la alta velocidad de inferencia, el modelo puede ejecutarse en portátiles o teléfonos inteligentes. La variante INT8 es especialmente útil en CPU, con una velocidad medida de 104.43x RTFx.
- Subtitulado automático de vídeos: se pueden procesar clips de audio de distinta duración de forma secuencial. La salida de logits se decodifica con CTC para generar transcripciones alineadas con el audio.
- Asistentes de voz: el modelo actúa como primer componente de reconocimiento de voz en un pipeline mayor. Su baja latencia en GPU, de hasta 0.107 segundos por clip, lo hace viable para interacciones en tiempo real.
- Accesibilidad auditiva: generación de subtítulos en directo para personas sordas o con discapacidad auditiva. La alta velocidad de inferencia permite un retardo mínimo en la transcripción.
- Análisis de llamadas de atención al cliente: transcripción automática de llamadas telefónicas en inglés para su posterior análisis o almacenamiento. El modelo puede desplegarse en servidores con ONNX Runtime y procesar llamadas grabadas.
- Dictado profesional en inglés: en entornos médicos, legales o técnicos donde se requiere transcripción rápida de voz a texto. La precisión del modelo y su capacidad de ejecución en hardware modesto facilitan su integración en aplicaciones de escritorio o móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER, MMLU, HumanEval, etc.) en la información disponible. Sin embargo, el autor de la conversión aporta una validación funcional sobre 31 casos y mediciones de rendimiento local en CPU y GPU, que se muestran a continuación.

| Variante | Clips con secuencia de tokens CTC exacta | Clips con transcripción decodificada exacta | Notas |
|---|---:|---:|---|
| FP32 | 31/31 | 31/31 | Diferencia máxima absoluta en logits: 0.0009813 |
| FP16 | 31/31 | 31/31 | Mismos tokens argmax; diferencias esperables en punto flotante |
| INT8 dinámico | 30/31 | 30/31 | 19/20 transcripciones exactas en audio real; concordancia mínima de argmax 98.53% |

El único caso divergente en INT8 ocurrió en el clip más largo (29.4 segundos). FP32 produjo "and a paintings", INT8 "and adam paintings", y la referencia del dataset es "AND AT EM PAINTINGS". El autor advierte que 20 clips no son suficientes para afirmar igualdad de WER.

| Variante | CPU inferencia | CPU RTFx | DirectML inferencia | DirectML RTFx |
|---|---:|---:|---:|---:|
| FP32 | 0.968 s | 30.36x | 0.107 s | 275.55x |
| FP16 | 8.495 s | 3.46x | 0.179 s | 164.39x |
| INT8 dinámico | 0.282 s | 104.43x | 0.137 s | 214.08x |

Mediciones realizadas en AMD Ryzen 5 7600X (CPU) e Intel Arc A750 con DirectML. El tiempo de extracción de características (0.11-0.12 s) está excluido.

## Requisitos de hardware

- Tamaño de los archivos ONNX: FP32 1.763 GiB, FP16 902.937 MiB, INT8 525.756 MiB. La VRAM estimada para inferencia será, como mínimo, similar a estos tamaños más el overhead de ejecución; en la práctica, unos 2.0 GB para FP32, 1.0 GB para FP16 y 0.7 GB para INT8.
- GPU recomendada: la prueba se realizó con Intel Arc A750 bajo DirectML. Cualquier GPU compatible con ONNX Runtime y DirectML puede funcionar. No se ha evaluado CUDA en la información disponible.
- CPU recomendada: AMD Ryzen 5 7600X. La variante INT8 es la más rápida en CPU, seguida de FP32. FP16 es notablemente más lento en CPU porque el proveedor de ejecución carece de kernels nativos para operaciones FP16.
- Cabe en GPU de consumo: sí, incluso en GPUs integradas, siempre que se use la variante INT8 o FP16.
- Opciones de despliegue: ONNX Runtime (CPU, DirectML), onnxruntime-node. No se recomienda usar vLLM o TGI para este tipo de modelo ONNX.
- Latencia medida: 0.107 s (FP32 en DirectML) a 8.495 s (FP16 en CPU) para un clip de 29.4 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuantización | Contexto/entrada | Licencia |
|---|---|---|---|---|---|
| granite-speech-5.0-470m-turboctc (IBM) | 470M | Safetensors | BF16/FP32 | Features de audio | Apache 2.0 |
| qwertz92/granite-speech-5.0-470m-turboctc-onnx | 470M | ONNX | FP32/FP16/INT8 | Features de audio | Apache 2.0 |
| iky1e/granite-speech-5.0-470m-turboctc-mlx-q5 | 470M | MLX | Q5 | Features de audio | Apache 2.0 |

Las tres variantes comparten la misma arquitectura y finalidad. La diferencia principal es el formato de ejecución: Safetensors para PyTorch, ONNX para ejecución multiplataforma y MLX para Apple Silicon. No se dispone de datos fiables para comparar con otros modelos ASR de la misma talla, como Whisper o wav2vec2.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés; no soporta otros idiomas.
- El grafo ONNX no incluye máscara de atención. No se pueden agrupar clips de distinta longitud en un mismo lote; hay que procesarlos por separado.
- La decodificación CTC y la extracción de características están fuera del grafo. Se requiere un procesador de `transformers>=5.16.0` y un decodificador externo.
- La cuantización INT8 es lossy y puede producir transcripciones diferentes, como se observó en un clip largo. La validación con 20 clips no es suficiente para garantizar que el WER sea igual al del modelo original.
- FP16 es extremadamente lento en CPU, por lo que no se recomienda en ese entorno.
- Es una conversión comunitaria, no un lanzamiento oficial de IBM. Los gráficos no están integrados en `stt_app`.
- Se recomienda verificar la licencia del modelo base y del código de conversión antes de uso comercial, aunque ambos se indican como Apache 2.0.
- El modelo es un ASR de vocabulario cerrado de 16 384 BPE units; puede presentar errores en nombres propios, jergas o acentos no estándar.

## Enlaces

- Repositorio HuggingFace del modelo ONNX: https://huggingface.co/qwertz92/granite-speech-5.0-470m-turboctc-onnx
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Conversión MLX Q5: https://huggingface.co/iky1e/granite-speech-5.0-470m-turboctc-mlx-q5
