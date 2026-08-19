# nmukthap/vertexvoice-indic

## Resumen

El modelo `nmukthap/vertexvoice-indic` es un conjunto de nueve paquetes de reconocimiento automático de voz (ASR) para otros tantos idiomas de la India: hindi, tamil, telugu, bengalí, maratí, punyabí, guyaratí, canarés y malayalam. Cada paquete contiene un grafo ONNX cuantizado a int8 con datos externos, listo para ejecutarse en dispositivos móviles mediante ONNX Runtime en CPU. El autor, nmukthap, lo ha derivado de los modelos IndicConformer de AI4Bharat a través de las exportaciones ONNX publicadas por OpenVoiceOS, aplicando dos modificaciones necesarias para su funcionamiento en teléfonos: re-cuantización de QInt8 a QUInt8 (el kernel `ConvInteger` de la CPU de ONNX Runtime solo acepta uint8) y externalización de los pesos para reducir la memoria residente.

Cada paquete pesa 131 MB, frente a los 622 MB del modelo multilingüe de 22 idiomas del que procede, lo que lo hace adecuado para despliegues on-device con limitaciones de almacenamiento y memoria. La precisión medida por el autor en una prueba limitada (un clip por idioma, 61 palabras en total) es del 80,3% de coincidencia exacta de palabras, frente al 86,9% del modelo original de 22 idiomas. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IndicConformer (Conformer con decodificación CTC) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio, no texto) |
| Tipos de cuantizacion | int8 (QUInt8, re-cuantizado desde QInt8) |
| Idiomas soportados | hi, ta, te, bn, mr, pa, gu, kn, ml (9 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo + datos externos en archivo `.data`) |

## Arquitectura y entrenamiento

El modelo base es IndicConformer, una arquitectura Conformer que combina capas de atención por puntos con convoluciones, diseñada por AI4Bharat para reconocimiento de voz en idiomas indios. La salida es una secuencia de log-probabilidades CTC (Connectionist Temporal Classification) sobre un vocabulario propio de cada idioma, de modo que no se necesita enmascaramiento de columnas posterior. La entrada es un espectrograma de 80 filtros log-mel a 16 kHz, con un factor de submuestreo de 4. El token `<blk>` (blank) es la última entrada del vocabulario.

Los datos de entrenamiento del modelo original no se detallan en la información disponible, pero se sabe que fue pre-entrenado por AI4Bharat y posteriormente exportado a ONNX por OpenVoiceOS. El autor de este repositorio aplicó dos transformaciones sobre esas exportaciones: la re-cuantización de QInt8 a QUInt8 para garantizar la compatibilidad con el kernel `ConvInteger` de ONNX Runtime en CPU, y el movimiento de los initializers a un archivo de datos externo, reduciendo la memoria residente de 202 MiB a aproximadamente 30 MiB al mantener las páginas limpias y respaldadas por archivo. No se menciona ningún proceso de fine-tuning adicional ni técnicas como RLHF o DPO.

## Capacidades

- Reconocimiento automático de voz para nueve idiomas indios: hindi, tamil, telugu, bengalí, maratí, punyabí, guyaratí, canarés y malayalam.
- Salida CTC directa con vocabulario propio por idioma, sin necesidad de post-procesamiento adicional para seleccionar columnas.
- Entrada de audio de 80 filtros log-mel a 16 kHz, con factor de submuestreo 4.
- Ejecución en CPU mediante ONNX Runtime, optimizada para dispositivos móviles.
- Tamaño compacto de 131 MB por idioma, con pesos en archivo externo que reducen la memoria residente a ~30 MiB.
- Incluye los archivos de featurización necesarios (`mel_filters.json`, `hanning_window.json`) que no estaban presentes en las exportaciones originales de OpenVoiceOS.
- No se indica soporte para tool calling, agentes, visión u otras capacidades multimodales; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de voz en tiempo real en aplicaciones móviles: el modelo puede ejecutarse en un teléfono sin conexión, convirtiendo audio del micrófono en texto con baja latencia gracias a su tamaño reducido y a la cuantización int8.
- Asistentes de voz en idiomas regionales indios: permite implementar comandos por voz en hindi, tamil, telugu, etc., sin depender de servicios en la nube, lo que reduce costes y mejora la privacidad.
- Subtitulación automática de vídeos en dispositivos: al ser un paquete por idioma, se puede seleccionar el modelo correspondiente al idioma del contenido y generar subtítulos localmente.
- Aplicaciones de accesibilidad para personas con discapacidad visual o motora: dictado de texto en idiomas indios directamente en el dispositivo, sin necesidad de conexión a internet.
- Sistemas de atención al cliente por voz en entornos con conectividad limitada: integración en quioscos o terminales de punto de venta que requieran reconocimiento de voz en varios idiomas locales.
- Investigación y desarrollo de ASR multilingüe: sirve como punto de partida para fine-tuning por idioma, al estar ya cuantizado y optimizado para despliegue, y al incluir los archivos de featurización necesarios.

## Benchmarks y rendimiento

El autor reporta una prueba de precisión limitada: un clip de audio por idioma, con un total de 61 palabras. Los resultados por idioma se muestran en la siguiente tabla (coincidencia exacta de palabras sobre el total de palabras del clip):

| Idioma | Aciertos / Total |
|---|---|
| Telugu (te) | 6/6 |
| Bengalí (bn) | 6/6 |
| Punyabí (pa) | 7/9 |
| Guyaratí (gu) | 6/7 |
| Canarés (kn) | 5/6 |
| Hindi (hi) | 5/7 |
| Maratí (mr) | 5/7 |
| Malayalam (ml) | 5/7 |
| Tamil (ta) | 4/6 |

La precisión global es del 80,3% (49/61 palabras), frente al 86,9% del modelo multilingüe de 22 idiomas en los mismos clips. No se han publicado resultados en benchmarks estándar de ASR como LibriSpeech, Common Voice o IndicSUPERB en la información disponible.

## Requisitos de hardware

- Almacenamiento: 131 MB por idioma (grafo ONNX + datos externos + vocabulario y archivos de featurización).
- Memoria RAM: aproximadamente 30 MiB residentes durante la inferencia gracias a la externalización de pesos.
- GPU: no necesaria; el modelo está diseñado para ejecutarse en CPU, concretamente en el proveedor CPU de ONNX Runtime.
- Dispositivos compatibles: teléfonos móviles (probado en iPhone según la descripción), así como cualquier sistema con soporte para ONNX Runtime en CPU.
- Opciones de despliegue: ONNX Runtime (C++, Python, C#), o cualquier runtime compatible con ONNX.
- Latencia y throughput: no se proporcionan cifras concretas, pero el autor indica que es "varias veces más rápido" que el modelo multilingüe de 622 MB.

## Comparativa con modelos similares

| Modelo | Idiomas | Tamaño por paquete | Precisión (prueba limitada) | Licencia | Formato |
|---|---|---|---|---|---|
| `nmukthap/vertexvoice-indic` (este) | 9 | 131 MB | 80,3% | Apache-2.0 | ONNX int8 |
| IndicConformer multilingüe (AI4Bharat, 22 idiomas) | 22 | 622 MB | 86,9% | Apache-2.0 | ONNX int8 (original) |
| Whisper small (OpenAI) | 96 | ~460 MB | no comparable (prueba distinta) | MIT | PyTorch/ONNX |

La comparación directa con Whisper no es posible con los datos disponibles, ya que la prueba del autor es específica y no utiliza métricas estándar. La ventaja principal de este modelo frente al multilingüe es su menor tamaño y mayor velocidad, a costa de una pérdida de precisión de unos 6,6 puntos porcentuales en la prueba realizada.

## Limitaciones y advertencias

- La precisión reportada se basa en una única prueba con un clip por idioma (61 palabras en total), lo que no es estadísticamente significativo y no debe extrapolarse a entornos reales.
- No se dispone de información sobre sesgos demográficos, de acento o de género; el modelo podría comportarse de forma desigual ante diferentes variedades dialectales de los nueve idiomas.
- Riesgo de alucinación o errores de transcripción en audio con ruido de fondo, solapamiento de hablantes o vocabulario técnico, como es común en sistemas ASR.
- El modelo solo cubre nueve idiomas; no soporta otros idiomas indios como el urdu, el odia o el asamés.
- La cuantización int8 puede degradar la precisión en comparación con el modelo en fp32, aunque el autor afirma que la re-cuantización a QUInt8 es necesaria para la compatibilidad con el kernel `ConvInteger` de ONNX Runtime.
- No se han publicado resultados en benchmarks estándar, por lo que el rendimiento relativo frente a otros modelos ASR no está verificado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido ampliamente validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nmukthap/vertexvoice-indic
- Modelos originales de AI4Bharat: https://huggingface.co/ai4bharat
- Exportaciones ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS
