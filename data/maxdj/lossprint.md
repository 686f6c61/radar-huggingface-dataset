# maxdj/lossprint

## Resumen

Lossprint es un modelo de clasificación de audio diseñado para la forense de audio: estima si un archivo WAV, FLAC o AIFF fue previamente codificado con un códec con pérdida (por ejemplo, MP3) y posteriormente decodificado de vuelta a PCM, un proceso conocido como transcodificación. Desarrollado por maxdj (maxdjohnson en GitHub), el modelo se publica bajo licencia MIT y está disponible en Hugging Face con pesos en safetensors y ONNX.

El modelo resuelve un problema concreto en la verificación de autenticidad de archivos de audio: detectar si un archivo etiquetado como "lossless" proviene en realidad de una fuente comprimida con pérdida, lo que afecta a la calidad percibida y a la integridad de las colecciones de audio. Su relevancia actual radica en el creciente uso de archivos de alta resolución en plataformas de streaming y archivos digitales, donde la trazabilidad de la procedencia es crítica.

Técnicamente, lossprint es una red neuronal convolucional (CNN) de 943.980 parámetros (según los pesos safetensors; la model card indica 943.984) que opera sobre espectrogramas mid/side a la tasa de muestreo nativa del archivo, sin resampleo ni normalización. El modelo procesa hasta veinte segundos de audio en ventanas de 0,5 segundos y devuelve tres salidas: probabilidad de transcodificación, probabilidad por codificador (nueve clases) y ancho de banda efectivo estimado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN sobre espectrogramas mid/side (STFT con ventana periódica de Hann) |
| Parametros totales | 943.980 (según safetensors; la model card indica 943.984) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 20 segundos de audio (16 ventanas de 0,5 s) |
| Tipos de cuantizacion | no disponible (solo pesos float32 en safetensors y ONNX) |
| Idiomas soportados | no disponible (el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Lossprint es una CNN que procesa espectrogramas mid/side calculados a la tasa de muestreo nativa del archivo de entrada. Para cada ventana de 0,5 segundos, se calcula la transformada de Fourier de corta duración (STFT) con una ventana periódica de Hann, con `n_fft = round(sample_rate / 43.06640625)` y un solapamiento del 50%. Se conservan los bins 0–512, se rellena con ceros por encima de Nyquist y se aplica `log(magnitude + 1e-6)` sin normalización. La entrada al modelo es un tensor float32 de forma `[windows, 2, 513, 44]` (dos canales: mid y side).

El entrenamiento se realizó sobre un corpus de 90.072 pares positivos/control agrupados por release. Los negativos son segmentos de masters intactos; los positivos son los segmentos correspondientes tras codificación con pérdida y decodificación, con corrección de retardo (error máximo de alineación de 0,125 ms). Se cubren nueve codificadores en la cabeza de salida: MP3, AAC, Apple AAC, FDK AAC, Vorbis, Opus, MP2, WMA y Musepack, incluyendo 586 pares HE-AAC y 666 pares HE-AACv2. No se aplica ninguna otra transformación a los datos. El manifiesto tiene un hash SHA-256 documentado.

La salida del modelo consta de tres cabezas: `transcode_probability` (probabilidad de transcodificación por ventana), `encoder_probability` (distribución sobre los nueve codificadores) y `bandwidth_khz` (ancho de banda efectivo estimado). El pooling de las ventanas se realiza con la media geométrica normalizada para las probabilidades y la media aritmética para el ancho de banda.

## Capacidades

- Detección de transcodificación: clasifica si un archivo lossless fue previamente codificado con un códec con pérdida, con una recall del 98,53% y una tasa de falsos positivos del 0,49% en el punto de operación fijo (umbral 0,5).
- Estimación del codificador original: identifica entre nueve codificadores (MP3, AAC, Apple AAC, FDK AAC, Vorbis, Opus, MP2, WMA, Musepack) con probabilidades por ventana.
- Estimación del ancho de banda efectivo: devuelve un valor en kHz que indica la frecuencia máxima conservada por el códec, útil para inferir la calidad de la codificación original.
- Soporte de audio mono y estéreo: para mono, el canal side se rellena con ceros.
- Procesamiento a tasa nativa: no requiere resampleo, downmix, normalización ni recorte, lo que preserva las características forenses del audio.
- Exportación a ONNX: el modelo está disponible en formato ONNX con paridad verificada con PyTorch (error máximo absoluto de 1,91e-6), lo que facilita su integración en entornos de producción.

## Casos de uso

- Verificación de integridad en bibliotecas de audio: un archivero puede analizar miles de archivos FLAC o WAV para detectar si alguno fue transcodificado desde MP3, lo que permite mantener la calidad declarada en colecciones de música digital.
- Control de calidad en plataformas de streaming: antes de aceptar un master de un proveedor, el servicio puede ejecutar lossprint para confirmar que el archivo no es una transcodificación encubierta, evitando degradaciones de calidad no declaradas.
- Auditoría de archivos en venta de música digital: tiendas que venden pistas "lossless" pueden verificar que sus archivos no provienen de fuentes comprimidas, reduciendo el riesgo de reclamaciones por falsedad de etiquetado.
- Investigación de procedencia de grabaciones: en contextos legales o periodísticos, se puede determinar si una grabación presentada como original fue manipulada mediante recompresión, aportando evidencia técnica.
- Detección de fraudes en subastas de masters: coleccionistas o casas de subastas pueden comprobar si un supuesto master analógico digitalizado es en realidad una copia de un CD comprimido, usando la estimación de codificador y ancho de banda.
- Análisis de metadatos en discográficas: al recibir archivos de estudio, un sello puede ejecutar el modelo como parte de su pipeline de ingesta para documentar la cadena de procesado de cada pista.

## Benchmarks y rendimiento

Los resultados publicados en la model card usan un umbral fijo de 0,5 y hasta dieciséis ventanas de 0,5 segundos de los primeros 20 segundos del archivo. La recall combina 9.214 transcodificaciones controladas de test con 3.838 transcodificaciones reales conocidas; la tasa de falsos positivos se calcula solo sobre los 9.214 masters intactos del split de test.

| Metrica | Valor |
|---|---|
| Recall (test + positivos reales) | 98,53% (12.860/13.052) |
| FPR (solo negativos de test) | 0,49% (45/9.214) |

Recall por formato y rango de bitrate (combinando test + positivos reales; entre paréntesis, número de positivos):

| Encoder | <112 kbps | 112–159 | 160–223 | 224–287 | ≥288 |
| --- | ---: | ---: | ---: | ---: | ---: |
| MP3 | 100,0% (345) | 99,6% (269) | 100,0% (463) | 99,9% (890) | 99,9% (1.126) |
| AAC | 97,1% (1.083) | 99,7% (324) | 99,6% (568) | 97,7% (666) | 90,7% (701) |
| MP2 | 100,0% (110) | 100,0% (77) | 99,3% (136) | 99,3% (137) | 100,0% (155) |
| Vorbis | 99,7% (345) | 100,0% (275) | 100,0% (401) | 99,6% (272) | 97,9% (900) |
| Opus | 91,7% (460) | 100,0% (415) | 99,7% (379) | 100,0% (733) | 100,0% (19) |
| WMA | 100,0% (182) | 99,5% (550) | 100,0% (270) | 100,0% (212) | 100,0% (73) |
| Musepack | 100,0% (53) | 100,0% (67) | 100,0% (78) | 99,1% (115) | 95,6% (203) |

La recall combinada por perfil AAC fue del 99,10% para AAC-LC (n=892), 99,04% para HE-AAC (n=415) y 91,32% para HE-AACv2 (n=265).

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene menos de un millón de parámetros (943.980), por lo que la inferencia es viable en CPU sin necesidad de GPU. El consumo de memoria es mínimo: el tensor de entrada típico (16 ventanas × 2 canales × 513 × 44) ocupa unos 2,9 MB en float32.
- VRAM estimada: inferior a 100 MB en GPU, aunque no se requiere GPU para un rendimiento aceptable. En CPU, la inferencia de un archivo de 20 segundos debería completarse en menos de un segundo en un procesador moderno, aunque no se han publicado mediciones oficiales de latencia.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo no aprovecha características específicas de hardware.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y también en dispositivos sin GPU.
- Opciones de despliegue: el formato ONNX permite usar ONNX Runtime, tanto en CPU como en GPU. También se puede cargar con PyTorch directamente desde safetensors. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- El repositorio de GitHub incluye una CLI en Rust, aunque la model card indica que la CLI actual necesita una actualización de frontend para cargar este modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado referencias a otras herramientas de detección de transcodificación de audio con métricas publicadas en la misma fuente. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Un resultado de lossprint es evidencia, no prueba: los masters nominales pueden ser ya transcodificaciones, y el modelo no puede distinguir entre una transcodificación intencionada y una accidental.
- Condiciones débiles conocidas: HE-AACv2, Opus de mundo real, Apple AAC de alta calidad y Musepack de alta calidad presentan recall más baja (por ejemplo, 91,32% para HE-AACv2).
- Solo se soportan archivos mono y estéreo; no se contemplan canales multicanal.
- El punto de operación reportado depende del umbral fijo de 0,5 y del pooling de ventanas; cambiar cualquiera de estos parámetros altera las métricas.
- Codificadores no vistos durante el entrenamiento o procesos de audio adicionales (ecualización, normalización, etc.) pueden comportarse de forma diferente y producir falsos negativos o positivos.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías; el autor no ofrece soporte oficial.
- No se han publicado datos sobre sesgos demográficos o culturales, ya que el modelo opera sobre señales de audio y no sobre contenido semántico.

## Enlaces

- Hugging Face: https://huggingface.co/maxdj/lossprint
- Repositorio GitHub: https://github.com/maxdjohnson/lossprint
