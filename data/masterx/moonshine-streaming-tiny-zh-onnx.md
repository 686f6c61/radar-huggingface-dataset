# Masterx/moonshine-streaming-tiny-zh-ONNX

## Resumen

Moonshine Streaming tiny-zh (ONNX) es una exportación a formato ONNX del modelo de reconocimiento automático de voz `moonshine-ai/moonshine-streaming-tiny-zh`, publicada por el usuario Masterx. Se trata de un modelo encoder-decoder orientado a transcripción de voz en chino mandarín (zh, variante cmn_hans_cn) con un diseño de streaming incremental: el audio se codifica a medida que llega, en lugar de esperar a disponer de la locución completa. La arquitectura subyacente es Moonshine v2, denominada por el autor "Ergodic Streaming Encoder", con atención de ventana deslizante.

La particularidad de esta exportación es que el modelo se ha dividido en cinco grafos ONNX independientes (`frontend`, `encoder`, `adapter`, `cross_kv`, `decoder_kv`) que reproducen el runtime de streaming oficial de Moonshine. Esta separación permite mantener estados portados entre fragmentos de audio y evita recodificar toda la señal en cada paso, lo que habilita inferencia de baja latencia sobre CPU. El modelo trabaja con una dimensión oculta de 320 y una ventana de posiciones de hasta 4096 (equivalentes a 82 segundos por segmento).

Es relevante para desarrolladores que necesitan desplegar ASR en chino sobre infraestructura modesta (CPU, sin GPU) y con latencia reducida, gracias a la disponibilidad de variantes cuantizadas int8 y a un factor de tiempo real medido de 0,032 en CPU de escritorio. La licencia MIT y el tamaño reducido del repositorio (0,2 GB) facilitan su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine v2, encoder-decoder con atencion de ventana deslizante ("Ergodic Streaming Encoder") |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 posiciones en el adaptador (82 s por segmento); ventana de atencion del encoder con 96 frames de contexto pasado y 16 de lookahead |
| Tipos de cuantizacion | fp32 (frontend, encoder, adapter, cross_kv, decoder_kv) e int8 dinamica QInt8 por canal en pesos MatMul/Gemm (encoder, adapter, cross_kv, decoder_kv); el frontend solo se distribuye en fp32 |
| Idiomas soportados | chino (zh, cmn_hans_cn) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), cinco grafos: `frontend.onnx`, `encoder.onnx`/`encoder_int8.onnx`, `adapter.onnx`/`adapter_int8.onnx`, `cross_kv.onnx`/`cross_kv_int8.onnx`, `decoder_kv.onnx`/`decoder_kv_int8.onnx` |

## Arquitectura y entrenamiento

El modelo es una exportación de `moonshine-ai/moonshine-streaming-tiny-zh` (Moonshine v2), un sistema encoder-decoder diseñado para reconocimiento de voz en streaming. El encoder emplea atención de ventana deslizante con semántica inclusiva: se ejecuta sobre una ventana formada por 96 frames de contexto pasado (`total_left_context`=96) más los frames nuevos, manteniendo como estables los frames anteriores al límite de `total_lookahead`=16. Esta configuración permite que la codificación avance de forma incremental conforme llegan los fragmentos de audio.

La exportación divide el pipeline en cinco grafos que replican el runtime oficial de Moonshine. El `frontend` consume fragmentos de audio de tamaño múltiplo de 640 muestras junto con cinco estados portados, y produce características de forma `[1, N/320, 320]`. El `encoder` transforma esas características en representaciones `[1, T, 320]`. El `adapter` añade embeddings de posición absoluta hasta un máximo de 4096 posiciones. `cross_kv` genera las claves y valores de atención cruzada con forma `[6, 1, 8, M, 40]` (seis capas, ocho cabezas, dimensión por cabeza 40, coherente con una dimensión oculta de 320). Finalmente, `decoder_kv` realiza la decodificación autorregresiva con caché K/V propia y cruzada.

La exportación se realizó con el script oficial `moonshine/scripts/export.py` mediante `torch.onnx` con opset 17. Los grafos fp32 reproducen token a token la salida greedy de `MoonshineStreamingForConditionalGeneration` de `transformers` cuando la máscara usa las mismas ventanas inclusivas. La cuantización int8 se aplicó con `onnxruntime.quantization.quantize_dynamic`, con pesos QInt8 por canal en las operaciones MatMul/Gemm con B constante. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático de voz (ASR) en chino mandarín (cmn_hans_cn).
- Transcripción incremental en streaming: el audio se codifica a medida que llega, sin esperar a la locución completa.
- Ejecución con estados portados entre fragmentos, manteniendo contexto acústico entre llamadas sucesivas.
- Decodificación autorregresiva con caché de atención propia y cruzada (self y cross K/V).
- Inferencia sobre CPU mediante ONNX Runtime, con variante int8 para reducir coste de cómputo.
- Compatibilidad con el motor Rust WinSTT (incremental, con endpointer basado en energía).
- No se dispone de información sobre soporte de tool calling, capacidades multimodales, agentes o multilingüismo más allá del chino.

## Casos de uso

- Transcripción de voz en tiempo real en chino para subtitulado en directo: el pipeline procesa fragmentos de audio de forma incremental, por lo que puede emitir texto mientras el hablante sigue hablando, adecuado para subtítulos en streaming.
- Dictado y notas de voz en aplicaciones móviles o de escritorio: al ejecutarse en CPU con un factor de tiempo real de 0,032, puede integrarse en dispositivos sin GPU dedicada para transcribir dictados en chino.
- Asistentes de voz y comandos por voz en chino: el endpointer de energía del motor WinSTT permite delimitar locuciones y activar la transcripción únicamente cuando hay habla.
- Indexación y búsqueda de contenido audiovisual en chino: transcripción por lotes de archivos de audio o vídeo para generar subtítulos o índices de búsqueda textual.
- Automatización de actas y reuniones en chino: transcripción de reuniones por segmentos de hasta 82 segundos (4096 posiciones) con contexto acústico mantenido entre fragmentos.
- Integración en pipelines de procesamiento de audio en servidores sin GPU: gracias al formato ONNX y a la variante int8, puede desplegarse en entornos de CPU estándar con bajo consumo de recursos (repositorio de 0,2 GB).
- Transcripción accesible en navegador o entornos web: ONNX Runtime dispone de backends web, lo que abre la puerta a inferencia local en cliente (siempre que se use el execution provider compatible; el encoder no funciona sobre DirectML).

## Benchmarks y rendimiento

Verificación sobre 20 utterances del conjunto de test FLEURS cmn_hans_cn, decodificación greedy sobre CPU. El autor advierte que el conjunto es pequeño (20-41 utterances) y que los valores deben interpretarse como comprobación de regresión, no como benchmark.

| Runtime | CER fp32 | CER int8 |
|---|---|---|
| onnxruntime (Python, locución completa) | 11,24 % | 11,54 % |
| WinSTT Rust engine (incremental, energy endpointer) | 11,24 % | no disponible |

Factor de tiempo real (Rust, fp32, CPU de escritorio bajo carga concurrente): 0,032. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de ASR.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; para GPU no se dispone de estimaciones publicadas. El tamaño del repositorio es de 0,2 GB, lo que da una cota superior aproximada del peso de los grafos.
- GPU recomendadas: no disponible. El autor indica que el grafo del encoder no se ejecuta sobre DirectML (el EP DML de ORT 1.24 rechaza su Reshape de cabezas de atención), por lo que recomienda el execution provider de CPU.
- Compatibilidad con GPU de consumo: no verificada en la información disponible. El modelo está pensado para CPU.
- Opciones de despliegue: ONNX Runtime (Python y otros lenguajes con backend ONNX); motor Rust WinSTT; cualquier runtime que soporte ONNX opset 17 con los execution providers compatibles.
- Latencia y throughput: factor de tiempo real de 0,032 en fp32 sobre CPU de escritorio bajo carga concurrente, es decir, procesa aproximadamente 31 veces más rápido que el tiempo real. La latencia por fragmento no se especifica.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada. La comparación más directa es con el propio modelo base del que deriva esta exportación.

| Modelo | Formato | Cuantizacion | CER (FLEURS cmn_hans_cn, 20 utt.) | Licencia | Notas |
|---|---|---|---|---|---|
| Masterx/moonshine-streaming-tiny-zh-ONNX | ONNX (opset 17) | fp32 / int8 | 11,24 % / 11,54 % | MIT | Cinco grafos, streaming incremental |
| moonshine-ai/moonshine-streaming-tiny-zh | PyTorch (transformers) | fp32 | no disponible | MIT | Modelo base, referencia token a token del pipeline fp32 |

Comparativas con otros modelos de ASR en chino (por ejemplo, variantes de Whisper) no están respaldadas por datos en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado información específica sobre sesgos en la información proporcionada.
- Riesgo de alucinación: los modelos de ASR pueden producir transcripciones plausibles pero incorrectas en audio con ruido, solapamiento de voces o dominio fuera de distribución; no se han publicado tasas específicas más allá del CER de 11,24 % en FLEURS.
- Limitaciones de idioma: el modelo está entrenado y validado únicamente para chino (zh, cmn_hans_cn); no se declara soporte para otros idiomas.
- Limitaciones de contexto: la ventana de posiciones del adaptador llega a 4096 posiciones (82 segundos por segmento); los segmentos más largos requieren gestión externa de la segmentación.
- Compatibilidad de ejecución: el grafo del encoder no funciona sobre DirectML (ORT 1.24); es necesario usar el execution provider de CPU. El frontend solo se distribuye en fp32.
- Cuantización int8: la variante int8 degrada ligeramente el CER (de 11,24 % a 11,54 % en la verificación del autor). El frontend se mantiene en fp32 porque su portado de estados convolucionales debe ser exacto.
- Validez de las métricas: los resultados proceden de un conjunto de solo 20-41 utterances; el propio autor los describe como comprobación de regresión y no como benchmark representativo.
- Licencia: MIT, heredada del modelo base, lo que permite uso comercial, si bien conviene conservar el aviso de licencia y verificar las condiciones del repositorio base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Masterx/moonshine-streaming-tiny-zh-ONNX
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-zh
- Repositorio de Moonshine (script de exportación `moonshine/scripts/export.py`): no disponible en la información proporcionada
- Paper o publicación técnica: no disponible
- Demo: no disponible
