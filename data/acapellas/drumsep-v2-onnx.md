# Acapellas/drumsep-v2-onnx

## Resumen

DrumSep v2 ONNX (ventana de 10 s) es una reexportación del modelo de separación de fuentes de batería DrumSep v2, publicada por el usuario Acapellas para su uso en navegador mediante onnxruntime-web. No introduce pesos nuevos: parte de `gridshiftstudio/drumsep-onnx`, que a su vez es un fine-tune de `inagoy/drumsep`, un separador de batería de estilo HDemucs. El modelo divide un stem de batería en cuatro componentes: bombo (kick), caja (snare), platillos (hi-hats y crash/ride) y toms.

El problema que resuelve es práctico: el ONNX original de origen fija una ventana de 40 s que consume entre 4 y 6 GB de RAM, lo que lo hace inviable dentro de una pestaña de navegador. Esta versión reconstruye el modelo HDemucs en PyTorch a partir de los inicializadores del ONNX y lo reexporta con una ventana de 10 s (`[1,2,441000]` a 44,1 kHz), con pesos almacenados en fp16 y un Cast a fp32, lo que reduce el fichero de 335 MB a 168 MB.

Es relevante para desarrolladores de herramientas de audio en web (DAWs, estudios de stems) que necesiten separación de batería en cliente sin servidor. La calidad es la del modelo de origen, con informes de terceros no revalidados que sitúan el SDR en torno a 21 dB para bombo, 12-13 dB para caja, 5 dB para platillos y un rendimiento débil en toms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HDemucs (Hybrid Demucs, espectrograma + forma de onda) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 10 s (`[1,2,441000]` a 44,1 kHz) |
| Tipos de cuantizacion | pesos en fp16 con Cast a fp32; activaciones en fp32 |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | MIT |
| Formato de pesos | ONNX (`drumsep_v2_w10_f16w.onnx`, 168.050.967 bytes) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura HDemucs descrita por Défossez et al. (Meta AI Research), un esquema híbrido que combina el procesamiento en el dominio de la forma de onda con el dominio espectral. La entrada del grafo ONNX consta de dos tensores: `mix [1,2,441000]` (la mezcla estéreo) y `mag [1,4,2048,431]` (la magnitud del STFT representada como canales complejos). Las salidas son `freq_out` y `time_out`. El STFT y el iSTFT se ejecutan fuera del grafo, en JavaScript, por lo que el consumidor debe calcular y suministrar la magnitud compleja como canales.

No se dispone de datos sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset. La model card del modelo v2 de origen indica que se entrenó con one-shots del propio autor más Magenta Groove MIDI (CC BY 4.0) renderizado con esos one-shots; los datos de entrenamiento de la v1 no están documentados en detalle. No se menciona RLHF ni DPO, lo cual es esperable en un modelo de separación de fuentes. La innovación técnica de esta reexportación es la reducción de la ventana de 40 s a 10 s y el almacenamiento de pesos en fp16, con paridad medida de 66,6 dB SNR frente al ONNX original de 40 s, 86,5 dB frente a la reconstrucción en PyTorch y 83-91 dB entre el runtime wasm del navegador y onnxruntime en Python sobre la misma ventana.

## Capacidades

- Separación de un stem de batería en cuatro fuentes: bombo, caja, platillos (hi-hats más crash/ride) y toms.
- Inferencia en navegador mediante onnxruntime-web (wasm), sin necesidad de backend.
- Procesamiento por fragmentos de 10 s, lo que permite trocear pistas largas en bloques.
- Entrada estéreo a 44,1 kHz con STFT externo calculado en JavaScript.
- Pesos en fp16 con Cast a fp32 para reducir el tamaño del fichero manteniendo activaciones en fp32.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente de audio.

## Casos de uso

- Estudio de stems en el navegador: integración en una DAW web (como el Stem Studio de NoDAW) para que el usuario separe la batería de una mezcla sin subir el audio a un servidor, aprovechando la ventana de 10 s y el consumo de memoria reducido frente a la versión de 40 s.
- Edición y remezcla de batería: aislar bombo, caja, platillos y toms permite sustituir o procesar cada elemento por separado (por ejemplo, cambiar el bombo de una grabación manteniendo la caja original).
- Práctica y transcripción rítmica: extraer la pista de caja o de bombo para generar partituras o ejercicios de batería, usando la separación como paso previo a la detección de onsets.
- Producción musical asistida: aplicar procesado independiente (compresión, reverb, ecualización) a cada componente de la batería dentro de un pipeline de mezcla.
- Herramientas educativas de audio: demostraciones interactivas en el navegador que muestran las componentes de una mezcla de batería en tiempo real, sin instalación local.
- Preprocesado para datasets de investigación: generar stems de batería etiquetados a partir de grabaciones para entrenar modelos de transcripción o de generación rítmica, verificando previamente la procedencia de los datos de entrenamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la información disponible. La model card cita informes de terceros no revalidados por el autor de la reexportación:

| Fuente | SDR aproximado |
|---|---|
| Bombo | ≈ 21 dB |
| Caja | ≈ 12-13 dB |
| Platillos | ≈ 5 dB |
| Toms | débil (sin cifra) |

Paridad medida en la reconstrucción:

| Comparación | SNR |
|---|---|
| Rebuild 10 s vs ONNX original 40 s | 66,6 dB |
| ONNX 10 s vs reconstrucción PyTorch | 86,5 dB |
| wasm en navegador vs onnxruntime Python (misma ventana) | 83-91 dB |

## Requisitos de hardware

- VRAM/RAM estimada: el fichero pesa 168 MB; la ventana de 10 s está pensada para ejecutarse en una pestaña de navegador, muy por debajo de los 4-6 GB que requiere la versión de 40 s.
- GPU recomendadas: no disponible; el caso de uso principal es CPU/wasm en navegador.
- Cabe en GPU de consumo: sí, por tamaño del modelo; no se especifican requisitos mínimos de GPU.
- Opciones de despliegue: onnxruntime-web (wasm) en navegador, onnxruntime en Python; no se documentan otras.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Ventana | Tamaño | Licencia | Entorno |
|---|---|---|---|---|---|
| Acapellas/drumsep-v2-onnx (esta ficha) | HDemucs | 10 s | 168 MB (fp16) | MIT | Navegador (onnxruntime-web) |
| gridshiftstudio/drumsep-onnx | HDemucs | 40 s | 335 MB (fp32) | MIT | Servidor/escritorio |
| inagoy/drumsep | HDemucs | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la paridad SNR indicada arriba.

## Limitaciones y advertencias

- La procedencia de los datos de entrenamiento no está verificada: la licencia MIT cubre el fichero de pesos, no posibles derechos sobre el audio de entrenamiento. Es necesario comprobarlo antes de un uso comercial.
- Los toms presentan un rendimiento débil según los informes de terceros citados.
- La inferencia por fragmentos de 10 s difiere de una pasada única de 40 s, lo que puede introducir discontinuidades en los bordes de cada bloque.
- El STFT y el iSTFT deben calcularse fuera del grafo; un cálculo incorrecto de la magnitud de entrada degrada la salida.
- Riesgo de artefactos y alucinaciones espectrales en pasajes con batería densa o instrumentación solapada.
- No se documentan sesgos específicos más allá de los derivados de los datos de entrenamiento.
- Se recomienda fijar un commit concreto al cargar el modelo (`/resolve/<commit>/drumsep_v2_w10_f16w.onnx`) y verificar el SHA-256 `b05779ea756870f3fe359c63ac501dd12caf3b24d66237b1404bb4dd5b32839a`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Acapellas/drumsep-v2-onnx
- Modelo base (ONNX v2): https://huggingface.co/gridshiftstudio/drumsep-onnx
- Modelo base original: https://huggingface.co/inagoy/drumsep
- Repositorio Demucs: https://github.com/facebookresearch/demucs
- Paper HDemucs (Défossez et al., Hybrid Spectrogram and Waveform Source Separation): no disponible enlace directo en la información proporcionada
