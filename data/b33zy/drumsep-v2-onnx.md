# b33zy/drumsep-v2-onnx

## Resumen

DrumSep v2 ONNX (ventana de 10 s, pesos en fp16) es una reexportación del separador de batería DrumSep v2 orientada a ejecución en navegador mediante onnxruntime-web. No introduce pesos nuevos: parte de `gridshiftstudio/drumsep-onnx` (v2), que a su vez es un fine-tune de `inagoy/drumsep`, un separador de batería de estilo HDemucs. El modelo toma una pista de batería ya aislada y la descompone en cuatro componentes: bombo (kick), caja (snare), platillos (charles más crash/ride) y toms.

El problema que resuelve es práctico: el ONNX original de origen fija una ventana de 40 s, lo que exige entre 4 y 6 GB de RAM y lo hace inviable dentro de una pestaña del navegador. Esta versión reconstruye el grafo HDemucs en PyTorch a partir de los inicializadores del ONNX original y lo reexporta con una ventana de 10 s (`[1,2,441000]` a 44,1 kHz), con los pesos almacenados en fp16 y un Cast a fp32 en la entrada, mientras las activaciones permanecen en fp32. El resultado es un fichero de 168 MB frente a los 335 MB de la versión fp32.

Es relevante para desarrolladores que quieran integrar separación de batería en aplicaciones web sin backend pesado, particularmente en el contexto de la DAW en navegador Stem Studio de NoDAW (Liminal / CoProducer). El repo ocupa 0,2 GB y se distribuye bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HDemucs (híbrido espectrograma + forma de onda), reconstruido en PyTorch y reexportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio fija de 10 s (`[1,2,441000]` a 44,1 kHz) |
| Tipos de cuantización | pesos en fp16 con Cast a fp32; activaciones en fp32 |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (`drumsep_v2_w10_f16w.onnx`, 168.050.967 bytes, sha256 `b05779ea756870f3fe359c63ac501dd12caf3b24d66237b1404bb4dd5b32839a`) |

Entradas del grafo: `mix [1,2,441000]` y `mag [1,4,2048,431]`. Salidas: `freq_out` y `time_out`.

## Arquitectura y entrenamiento

La arquitectura subyacente es HDemucs, un modelo híbrido que combina un flujo temporal sobre la forma de onda con un flujo espectral sobre el espectrograma, siguiendo el trabajo de Défossez et al. (Meta AI Research). En esta reexportación, la STFT y la iSTFT se ejecutan fuera del grafo (en JavaScript dentro de Stem Studio), por lo que el consumidor debe proporcionar manualmente la magnitud de entrada codificada como canales complejos con forma `[1,4,2048,431]`.

No se dispone de detalles sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset. La model card del modelo v2 de origen indica que se entrenó con one-shots del propio autor más Magenta Groove MIDI (CC BY 4.0) renderizado con esos one-shots. Los datos de entrenamiento de la v1 de origen no están documentados en detalle. No se menciona el uso de RLHF ni DPO, lo cual es esperable en un modelo de separación de fuentes. La innovación técnica destacable de esta ficha es la reexportación con ventana reducida y pesos en fp16: la paridad medida frente al ONNX original de 40 s es de 66,6 dB SNR (ruido de coma flotante), frente al rebuild en PyTorch es de 86,5 dB, y entre el wasm del navegador y onnxruntime en Python sobre la misma ventana se sitúa en 83–91 dB.

## Capacidades

- Separación de fuentes de batería en cuatro stems: bombo, caja, platillos (charles más crash/ride) y toms.
- Procesamiento por ventanas de 10 s, apto para inferencia en streaming o por fragmentos.
- Ejecución en navegador mediante onnxruntime-web (wasm), sin necesidad de backend.
- Entrada estéreo a 44,1 kHz.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio de entrada más allá de la mezcla de batería.

## Casos de uso

- DAW en navegador: integración en Stem Studio (NoDAW / Liminal / CoProducer) para que el usuario separe la pista de batería en componentes editables sin salir del navegador, aprovechando la ventana de 10 s y el tamaño de 168 MB.
- Remezcla y edición de batería: aislar bombo y caja para sustituir samples o aplicar procesado independiente (compresión, EQ) sobre cada elemento en un editor web.
- Educación musical: visualización y análisis de las componentes rítmicas de una grabación para estudiar patrones de batería, con inferencia local en el cliente.
- Preproducción musical: generar stems de batería para maquetas antes de la grabación definitiva, ejecutando el modelo en el navegador del músico.
- Investigación en separación de fuentes: servir como referencia reproducible de HDemucs en ONNX con ventana corta y pesos fp16 para experimentos de paridad y evaluación de SDR.
- Prototipado de aplicaciones de audio en web: usar el ONNX como componente de un pipeline mayor (detección de onsets, transcripción rítmica) sin infraestructura de servidor.
- Herramientas de accesibilidad y práctica: aislar la caja o el bombo para pistas de práctica o karaoke instrumental a tempo reducido.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| SNR vs ONNX original de 40 s | 66,6 dB | Ruido de coma flotante |
| SNR vs rebuild en PyTorch | 86,5 dB | Ventana de 10 s |
| SNR wasm vs onnxruntime Python | 83–91 dB | Misma ventana |
| SDR bombo | ≈ 21 dB | Reporte de terceros, no re-medido por el autor |
| SDR caja | ≈ 12–13 dB | Reporte de terceros, no re-medido por el autor |
| SDR platillos | ≈ 5 dB | Reporte de terceros, no re-medido por el autor |
| SDR toms | débil | Reporte de terceros, no re-medido por el autor |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por tratarse de un modelo de audio. La inferencia por fragmentos de 10 s difiere del pase único de 40 s del modelo original.

## Requisitos de hardware

- VRAM/RAM estimada: el ONNX original de 40 s requiere 4–6 GB de RAM; esta versión de 10 s está diseñada para ejecutarse en una pestaña del navegador, aunque la cifra exacta de memoria no está publicada.
- GPU recomendadas: no disponible; el destino principal es CPU/wasm vía onnxruntime-web.
- Compatibilidad con GPU de consumo: no disponible como dato verificado; el diseño apunta a ejecución en cliente sin GPU dedicada.
- Opciones de despliegue: onnxruntime-web (wasm) en navegador; onnxruntime en Python para validación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Ventana | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| b33zy/drumsep-v2-onnx | HDemucs, ONNX fp16 | 10 s | 168 MB | MIT | Hugging Face |
| gridshiftstudio/drumsep-onnx | HDemucs, ONNX | 40 s | 335 MB (fp32) | MIT | Hugging Face |
| inagoy/drumsep | HDemucs | no disponible | no disponible | MIT | Hugging Face |
| Demucs (Meta) | HDemucs | variable | variable | MIT | GitHub |

La comparativa se limita a la familia de origen, ya que no se dispone de datos de otros separadores de batería en la información proporcionada.

## Limitaciones y advertencias

- Los toms se separan con calidad débil según reportes de terceros no re-medidos por el autor.
- La calidad de platillos es baja (≈ 5 dB SDR), lo que limita su uso en producción para ese stem.
- La inferencia por fragmentos de 10 s produce resultados distintos al pase único de 40 s del modelo original.
- La procedencia de los datos de entrenamiento no está verificada: MIT cubre el fichero de pesos, no los derechos sobre el audio de entrenamiento. Es responsabilidad del usuario comprobar esto antes de un uso comercial.
- El modelo requiere que el consumidor calcule la STFT y la iSTFT fuera del grafo y proporcione la magnitud compleja como canales.
- No hay información publicada sobre sesgos, alucinación (no aplica en el sentido lingüístico) ni restricciones idiomáticas.
- Se recomienda fijar un commit concreto al cargar el modelo (`/resolve/<commit>/drumsep_v2_w10_f16w.onnx`) y verificar el SHA-256.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/b33zy/drumsep-v2-onnx
- Modelo base ONNX: https://huggingface.co/gridshiftstudio/drumsep-onnx
- Modelo base original: https://huggingface.co/inagoy/drumsep
- Demucs (Meta AI Research): https://github.com/facebookresearch/demucs
- Paper HDemucs (Défossez et al., Hybrid Spectrogram and Waveform Source Separation): no disponible como enlace directo en la información proporcionada
