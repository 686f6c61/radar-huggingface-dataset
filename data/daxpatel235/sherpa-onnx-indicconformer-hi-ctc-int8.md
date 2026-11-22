# daxpatel235/sherpa-onnx-indicconformer-hi-ctc-int8

## Resumen

Sherpa-onnx-indicconformer-hi-ctc-int8 es una exportación a ONNX con cuantización int8 del modelo IndicConformer Hindi de AI4Bharat, preparada específicamente para el runtime sherpa-onnx. El modelo original es un Conformer híbrido RNN-T/CTC entrenado por AI4Bharat para reconocimiento automático del habla en 22 lenguas indias; esta variante conserva únicamente la rama CTC y las salidas correspondientes al hindi, de modo que transcribe voz en hindi a texto en escritura devanagari de forma totalmente offline sobre CPU.

La relevancia de esta ficha es práctica: reduce un checkpoint multilingüe de gran tamaño a un artefacto de 137,5 MB (fichero `model.int8.onnx`) que puede ejecutarse en dispositivos sin GPU mediante la librería sherpa-onnx. No se ha reentrenado el modelo; los pesos del encoder y del extractor de características son los originales, y solo se ha recortado la capa de salida a las 256 filas del bloque hindi (tokens 1536-1791 del vocabulario conjunto de 5632) más el token blank.

El modelo está pensado para integrarse en aplicaciones de dictado y transcripción offline, como la app TrayTra del propio autor. Su licencia MIT y su formato ONNX lo hacen atractivo para despliegues embebidos, aunque su alcance queda restringido a una sola lengua y a la rama CTC, sin la precisión adicional que aportaría la decodificación RNN-T del checkpoint original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) con cabeza CTC; exportado desde un modelo híbrido RNN-T/CTC de NeMo |
| Parámetros totales | no disponible (el fichero int8 ocupa 137.507.239 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana dependiente de la longitud del audio de entrada) |
| Tipos de cuantización | int8 (cuantización dinámica con ONNX Runtime) |
| Idiomas soportados | hindi (hi) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.int8.onnx`) + `tokens.txt` |
| Frecuencia de muestreo | 16 kHz, mono, float32 |
| Características de entrada | 80 bins mel, normalización por característica, subsampling 4 |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo base es el Conformer híbrido RNN-T/CTC multilingüe de AI4Bharat (`indicconformer_stt_hi_hybrid_ctc_rnnt_large`), que comparte un único encoder para 22 lenguas indias y emplea una capa de salida "multisoftmax" con 256 tokens por lengua. Para el hindi, la decodificación puntúa únicamente el bloque hindi más el token blank. Esta exportación reconstruye ese comportamiento como un modelo CTC estándar de NeMo: mantiene sin cambios los pesos del encoder y del extractor de características, recorta la capa de salida CTC a las 256 filas del hindi (tokens 1536-1791 de 5632) más la fila blank, y verifica que el bloque hindi del vocabulario conjunto coincide pieza a pieza con el tokenizador SentencePiece propio del hindi.

La conversión se realizó desde el checkpoint `.nemo` en el commit `deada84ce880997c56ee933aa21571d768264700` mediante el script `tools/convert/convert_hindi.py`, exportando a ONNX con los metadatos NeMo CTC que espera sherpa-onnx y aplicando después cuantización dinámica int8 con ONNX Runtime. No se ha reentrenado el modelo ni se ha aplicado ajuste fino adicional; los cambios respecto al original son exclusivamente de formato, de recorte de la rama CTC a las salidas hindi y de cuantización. La rama RNN-T y las salidas de las otras 21 lenguas no se incluyen. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre la composición del dataset original en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (ASR) en hindi, con salida en escritura devanagari.
- Transcripción offline sobre CPU, sin dependencia de servicios en la nube.
- Procesamiento de audio a 16 kHz mono en formato float32.
- Decodificación CTC greedy mediante la API `OfflineRecognizer.from_nemo_ctc` de sherpa-onnx.
- Integración ligera en aplicaciones de escritorio y móviles gracias al formato ONNX int8.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No soporta visión, audio generativo ni otras modalidades distintas de la transcripción.
- Capacidad multilingüe limitada al hindi; el resto de lenguas del modelo base no está incluido.

## Casos de uso

- Dictado por voz offline en hindi: la aplicación captura audio a 16 kHz y lo transcribe localmente con sherpa-onnx, sin enviar datos a servidores externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado de vídeos y pódcasts en hindi: el modelo puede procesar segmentos de audio y generar transcripciones en devanagari que después se sincronizan con la línea temporal, aprovechando su reducido tamaño para ejecutarse en un portátil.
- Asistentes de voz embebidos: integración en dispositivos de bajo consumo (Raspberry Pi, mini-PC) mediante sherpa-onnx, ya que el artefacto int8 de 137 MB cabe en memoria y no requiere GPU.
- Transcripción de reuniones y notas de voz: aplicaciones de productividad que convierten grabaciones en texto para búsqueda posterior, con la ventaja de funcionar sin conexión en zonas con conectividad limitada.
- Accesibilidad: generación de subtítulos en tiempo real para personas con discapacidad auditiva en contextos de habla hindi, desplegando el modelo en el propio dispositivo del usuario.
- Investigación en ASR de lenguas indias: base ligera para comparar el rendimiento de la rama CTC cuantizada frente al checkpoint original completo en experimentos de evaluación o destilación.
- Preprocesado de pipelines NLP: transcripción previa de audio hindi para alimentar sistemas de análisis de sentimiento, resumen o indexación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica para CPU; el fichero int8 ocupa aproximadamente 137,5 MB, por lo que la memoria RAM necesaria es del orden de unos cientos de MB incluyendo el runtime.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. No se han publicado requisitos de GPU para esta exportación.
- Compatibilidad con GPU de consumo: al ser un modelo orientado a CPU, cabe en cualquier equipo convencional; no se dispone de datos de aceleración GPU específicos.
- Opciones de despliegue: sherpa-onnx (runtime principal, API `OfflineRecognizer.from_nemo_ctc`), ONNX Runtime para ejecución directa del grafo ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| sherpa-onnx-indicconformer-hi-ctc-int8 (este modelo) | no disponible (137,5 MB int8) | audio 16 kHz, 80 mel bins | hindi | MIT | ONNX int8 | Hugging Face |
| ai4bharat/indicconformer_stt_hi_hybrid_ctc_rnnt_large (modelo base) | no disponible | audio 16 kHz | 22 lenguas indias | MIT | NeMo `.nemo` | Hugging Face |
| Whisper large-v3 (OpenAI) | 1.550 M | audio 16 kHz, ventana de 30 s | multilingüe (incluye hindi) | MIT | safetensors, GGUF, etc. | Hugging Face, OpenAI |
| Whisper small (OpenAI) | 244 M | audio 16 kHz, ventana de 30 s | multilingüe | MIT | safetensors, GGUF, etc. | Hugging Face, OpenAI |

La comparación con Whisper es orientativa por categoría (ASR multilingüe); no se dispone de métricas comparativas publicadas para esta exportación concreta. Frente al modelo base de AI4Bharat, esta variante pierde la rama RNN-T y 21 lenguas a cambio de un artefacto mucho más ligero y ejecutable en CPU con sherpa-onnx.

## Limitaciones y advertencias

- Solo transcribe hindi; no cubre ninguna de las otras 21 lenguas del modelo base.
- Se ha eliminado la rama RNN-T, por lo que la precisión puede diferir respecto al checkpoint original que combina ambas ramas.
- La cuantización int8 introduce una pérdida de precisión no cuantificada en la información disponible.
- Riesgo de errores de transcripción en audio con ruido, acentos marcados, code-switching hindi-inglés o vocabulario especializado; no se han publicado evaluaciones al respecto.
- No se han documentado sesgos específicos del modelo ni del proceso de cuantización.
- El modelo no ha sido reentrenado ni ajustado; hereda las limitaciones del checkpoint original de AI4Bharat.
- La licencia MIT permite uso comercial, pero conviene conservar la atribución a AI4Bharat indicada en el repositorio.
- Para producción, es recomendable validar el rendimiento en el dominio concreto (tipo de micrófono, ruido ambiental, jerga) antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/daxpatel235/sherpa-onnx-indicconformer-hi-ctc-int8
- Modelo base: https://huggingface.co/ai4bharat/indicconformer_stt_hi_hybrid_ctc_rnnt_large
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- TrayTra (aplicación del autor): https://github.com/daxpatel235/TrayTra
- Script de conversión: https://github.com/daxpatel235/TrayTra/blob/main/tools/convert/convert_hindi.py
- NeMo: https://github.com/NVIDIA/NeMo
