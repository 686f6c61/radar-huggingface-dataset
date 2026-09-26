# ipsilondev/MossFormer2-SE-48K-ONNX

## Resumen

MossFormer2-SE-48K-ONNX es una exportacion cuantizada a INT8 en formato ONNX del modelo MossFormer2_SE_48K, un sistema de mejora de voz (speech enhancement) monoaural que opera a 48 kHz. El modelo original fue desarrollado por Alibaba Group dentro del proyecto ClearerVoice-Studio, y esta version ONNX ha sido publicada por el usuario ipsilondev a partir de una exportacion previa alojada en el repositorio Yushasyed/contextlens-music-engines. Su funcion principal es la eliminacion de ruido de fondo en grabaciones de voz, devolviendo una senal limpia a partir de una entrada ruidosa.

La relevancia de esta ficha radica en su formato de despliegue: al tratarse de un ONNX INT8 de 94,3 MB (un 57 % menos que el checkpoint PyTorch de 221,5 MB), permite inferencia en CPU con un factor de tiempo real (RTF) de 0,13x, es decir, unas 7,6 veces mas rapido que el tiempo real. Esto lo hace apto para escenarios de procesamiento en el borde (edge) sin GPU dedicada. El modelo trabaja sobre ventanas fijas de 4,0 segundos (192.000 muestras a 48 kHz) y emplea una representacion de entrada basada en 60 bins Mel mas sus derivadas delta y delta-delta (180 canales de caracteristicas).

El pipeline declarado es audio-to-audio, el idioma soportado es el ingles y la licencia es Apache-2.0. No se especifican en la informacion disponible el numero total de parametros del modelo ni detalles completos sobre su entrenamiento y composicion del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossFormer2 (red de mejora de voz con mecanismos de atencion; detalles completos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (ventana fija de 4,0 segundos, 192.000 muestras a 48 kHz) |
| Tipos de cuantizacion | INT8 |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (INT8, Opset 17) |
| Tamano del modelo | 94,3 MB (reduccion del 57 % respecto a los 221,5 MB del checkpoint PyTorch) |
| Frecuencia de muestreo | 48 kHz, monoaural |
| Entrada | fbanks [1, 496, 180] float32 |
| Salida | mask [1, 496, 961] float32 (mascara espectral compleja) |
| Parametros STFT | win_len = 1920, win_inc = 384, fft_len = 1920 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MossFormer2, empleada para la mejora de voz a 48 kHz dentro del proyecto ClearerVoice-Studio de Alibaba Group. La informacion proporcionada no detalla la composicion interna de la red (numero de capas, dimensiones de los bloques de atencion, mecanismos concretos), por lo que no es posible especificar mas alla del nombre de la familia arquitectonica y su proposito funcional: la estimacion de una mascara espectral compleja que, aplicada sobre el espectrograma STFT de la senal ruidosa, permite reconstruir la senal limpia mediante ISTFT.

La salida del modelo es una mascara de forma [1, 496, 961], que se aplica al espectrograma STFT calculado con win_len = 1920, win_inc = 384 y fft_len = 1920. La entrada no es audio en bruto, sino caracteristicas precalculadas: 60 bins de filtro Mel mas sus derivadas delta y delta-delta, lo que da 180 canales de caracteristicas sobre una ventana de 496 tramas temporales correspondiente a 4,0 segundos de audio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (habitualmente no aplicables a modelos de mejora de voz).

La innovacion destacable de esta version concreta es la exportacion a ONNX con cuantizacion INT8 y la verificacion de paridad casi bit-exacta respecto al baseline PyTorch FP32, conservando un rendimiento perceptual equivalente con un tamano de archivo mucho menor.

## Capacidades

- Mejora de voz monoaural a 48 kHz: eliminacion de ruido de fondo en grabaciones de voz, devolviendo audio limpio mediante mascara espectral e ISTFT.
- Reduccion del ruido de fondo: atenuacion del suelo de ruido de 43,6 dB segun la verificacion reportada sobre VoiceBank-DEMAND.
- Inferencia en CPU: RTF de 0,13x (7,6 veces mas rapido que el tiempo real) sin necesidad de GPU.
- Procesamiento por ventanas: opera sobre segmentos fijos de 4,0 segundos (192.000 muestras), lo que facilita el procesamiento por bloques de audios de mayor duracion.
- Salida como mascara espectral: permite aplicar la estimacion sobre el STFT y reconstruir con ISTFT, integrable en pipelines de audio personalizados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de audio, no de lenguaje.
- No dispone de capacidades multimodales (vision, audio-texto) ni de modo de razonamiento (thinking mode).
- Idioma declarado: ingles (aunque la tarea de mejora de voz es mayoritariamente independiente del idioma, la metrica se declara para en).

## Casos de uso

- Preprocesado para sistemas de reconocimiento automatico del habla (ASR): limpiar la senal antes de pasarla al motor ASR reduce la tasa de error en entornos ruidosos, usando ventanas de 4,0 segundos y reconstruccion por bloques.
- Limpieza de grabaciones para podcast y entrevistas: eliminar ruido de fondo (aire acondicionado, trafico, ruido ambiental) de grabaciones a 48 kHz antes de la edicion y publicacion.
- Procesamiento en tiempo real en CPU para videollamadas y VoIP: gracias al RTF de 0,13x, puede ejecutarse en servidores sin GPU o en equipos de usuario para atenuar el ruido del microfono en conferencias.
- Restauracion de archivos de audio historicos o mal conservados: aplicar la mascara espectral sobre material degradado para reducir el ruido de fondo preservando la voz.
- Asistentes de voz y dictado por voz: mejorar la captura de comandos de voz en dispositivos con microfonos de baja calidad o en entornos con ruido.
- Produccion de contenido audiovisual y streaming: limpieza de pistas de audio en flujos de emision, reduciendo el ruido de captacion sin requerir hardware especializado.
- Despliegue en el borde (edge): al ocupar 94,3 MB en INT8, puede integrarse en dispositivos con recursos limitados que ejecuten ONNX Runtime en CPU.
- Pipelines de post-produccion de audio por lotes: procesar grandes volumenes de archivos de 48 kHz en CPU con alta eficiencia temporal.

## Benchmarks y rendimiento

Resultados reportados en la model card, comparando la exportacion ONNX INT8 con el baseline oficial PyTorch FP32 de Alibaba sobre VoiceBank-DEMAND (ruido de fondo real a 48 kHz):

| Metrica | PyTorch Baseline | ONNX INT8 | Paridad |
|---|---|---|---|
| Atenuacion del suelo de ruido | 42,2 dB de reduccion | 43,6 dB de reduccion | +1,4 dB |
| Similitud coseno | 1,000000 | 0,999804 | Casi bit-exacta |
| Correlacion de Pearson (r) | 1,000000 | 0,999804 | Casi bit-exacta |
| SI-SNR | Baseline | 34,06 dB | Perceptualmente identico |
| RTF de inferencia (CPU) | — | 0,13x | 7,6x mas rapido que tiempo real |

No se han publicado en la informacion disponible otros benchmarks estandar (como PESQ, STOI o DNSMOS) ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el modelo pesa 94,3 MB en INT8 y puede ejecutarse sin GPU.
- GPU recomendadas: no se especifica ninguna; el modelo esta disenado para ejecucion en CPU mediante ONNX Runtime. Puede ejecutarse en GPU a traves de execution providers CUDA o TensorRT de ONNX Runtime, aunque no se aportan datos de rendimiento en GPU.
- Compatibilidad con GPU de consumo: no requiere GPU; cabe en cualquier equipo con CPU moderna y ~100 MB de RAM disponibles para el modelo.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider); la model card usa explicitamente `ort.InferenceSession` con `providers=["CPUExecutionProvider"]`.
- Latencia y throughput: RTF de 0,13x en CPU, equivalente a 7,6 veces mas rapido que el tiempo real para el procesamiento de ventanas de 4,0 segundos.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con otros modelos de mejora de voz. La unica comparacion documentada es contra el propio baseline PyTorch FP32 del mismo modelo:

| Modelo | Formato | Tamano | Licencia | RTF (CPU) | SI-SNR |
|---|---|---|---|---|---|
| MossFormer2-SE-48K-ONNX (este) | ONNX INT8 | 94,3 MB | Apache-2.0 | 0,13x | 34,06 dB |
| MossFormer2_SE_48K (baseline Alibaba) | PyTorch FP32 | 221,5 MB | no disponible en la informacion | no disponible | Baseline |

Comparativa con modelos alternativos de la misma categoria: no disponible.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en mejora de voz: no genera texto, razonamiento ni codigo, y no dispone de tool calling ni capacidades de agente.
- Ventana fija de 4,0 segundos (192.000 muestras): los audios mas largos deben segmentarse y los mas cortos rellenarse (padding), lo que puede introducir artefactos en los bordes si no se gestiona adecuadamente.
- Entrada no nativa de audio: requiere el calculo previo de 60 bins Mel mas delta y delta-delta (180 canales) y la aplicacion posterior de la mascara sobre el STFT con ISTFT, lo que anade complejidad al pipeline.
- Idioma declarado limitado a ingles; la mejora de voz suele ser independiente del idioma, pero no se documentan evaluaciones en otros idiomas.
- Riesgo de artefactos o distorsion en condiciones de ruido no representadas en el conjunto de evaluacion (VoiceBank-DEMAND).
- No se documentan sesgos especificos, pero al ser un modelo entrenado sobre un dataset concreto puede presentar peor rendimiento en acentos, tipos de ruido o condiciones de grabacion no cubiertas.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si puede producir artefactos espectrales o sobre-suprimir ciertas frecuencias de la voz.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del checkpoint original de Alibaba y de la exportacion ONNX intermedia, ya que esta version es una cadena de derivaciones (Alibaba -> Yushasyed -> ipsilondev).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; se trata de una publicacion reciente y sin validacion comunitaria amplia.
- La fecha de creacion indicada (2026-09-26) es posterior a la fecha de actualizacion, lo que puede indicar una inconsistencia en los metadatos del repositorio.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/ipsilondev/MossFormer2-SE-48K-ONNX
- Checkpoint original de Alibaba: https://huggingface.co/alibabasglab/MossFormer2_SE_48K
- Fuente de la exportacion ONNX: https://huggingface.co/Yushasyed/contextlens-music-engines/tree/main/mossformer2-48k
- Proyecto ClearerVoice-Studio: https://github.com/modelscope/ClearerVoice-Studio
