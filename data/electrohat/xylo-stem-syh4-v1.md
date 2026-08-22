# Electrohat/xylo-stem-syh4-v1

## Resumen

Electrohat/xylo-stem-syh4-v1 es un modelo de separación de fuentes musicales (music source separation) de cuatro stems (batería, bajo, otros instrumentos y voces), desarrollado por el usuario Electrohat mediante fine-tuning de un modelo base mel_band_roformer procedente del repositorio Music-Source-Separation-Training de ZFTurbo. El modelo está pensado para extraer pistas individuales a partir de una mezcla estéreo completa, una tarea fundamental en producción musical, remezclas, karaoke y restauración de audio.

La arquitectura subyacente es un Mel Band Roformer, un transformador que opera sobre bandas de frecuencia mel y que ha demostrado un rendimiento competitivo en tareas de separación de fuentes. El autor publica dos versiones del modelo: la primera con un SDR medio de 8.9923 en el dataset de test MUSDB18, y una segunda versión (v2) que sacrifica ligeramente el SDR (8.8741) pero que, según el autor, ofrece una calidad subjetiva superior. El repositorio tiene un tamaño de 7,5 GB y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mel Band Roformer (transformador sobre bandas mel) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (procesamiento de audio) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de 7,5 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Mel Band Roformer, un transformador que opera sobre representaciones de audio divididas en bandas de frecuencia melódromo. Este enfoque permite al modelo procesar el espectrograma completo de la mezcla y aprender a separar las fuentes individuales de forma simultánea. El modelo original de referencia fue publicado por ZFTurbo en el repositorio Music-Source-Separation-Training, con un SDR de 8.9443 en el dataset de test de MUSDB18.

El fine-tuning realizado por Electrohat se llevó a cabo con el objetivo de mejorar la calidad subjetiva de la separación. La versión 2 del modelo, publicada posteriormente, reduce ligeramente el SDR medio (de 8.9923 a 8.8741) pero el autor indica que la calidad percibida es superior. No se proporcionan detalles sobre el dataset de fine-tuning, el número de épocas, la configuración de hiperparámetros o el método de entrenamiento (si se usó supervisión directa con mezclas sintéticas, etc.). El modelo está diseñado exclusivamente para la extracción de cuatro stems, no para la separación de instrumentos individuales.

## Capacidades

- Separación de audio en cuatro stems: batería, bajo, otros instrumentos y voces.
- Procesamiento de audio estéreo completo, sin limitación aparente de duración de la entrada (aunque no se especifica el tamaño de ventana).
- Métricas SDR superiores a 10 en batería y voces, y alrededor de 7 en bajo y otros.
- Funciona sobre el dataset de test de MUSDB18, un estándar en separación de fuentes musicales.
- No soporta tool calling, generación de texto ni razonamiento multimodal, ya que es un modelo de audio puro.
- No se documentan capacidades de separación de instrumentos individuales (guitarra, piano, etc.), solo los cuatro stems.

## Casos de uso

- **Producción musical y remezclas**: permite a productores aislar la batería o las voces de una mezcla para remezclar, añadir efectos o reequilibrar niveles sin tener acceso a las pistas originales.
- **Karaoke y extracción de voces**: se puede eliminar la pista vocal de una canción para crear versiones instrumentales para karaoke, con un SDR de voces de 10.59.
- **Restauración de audio**: en archivos históricos o grabaciones de baja calidad, la separación de stems permite aplicar procesamiento individual a cada fuente (por ejemplo, reducir ruido solo en la batería).
- **Análisis musical automatizado**: permite extraer componentes individuales para análisis musicológico, transcripción automática o estudio de la estructura de una canción.
- **Educación musical**: estudiantes pueden aislar la batería o el bajo de una canción para estudiar su ejecución.
- **Muestreo y síntesis**: la separación de stems permite extraer samples limpios de batería o voces para usar en síntesis granular o bibliotecas de muestras.
- **Integración en pipelines de procesado de audio**: al ser un modelo PyTorch, puede integrarse en aplicaciones de procesado por lotes mediante librerías como demucs o los scripts de Music-Source-Separation-Training.

## Benchmarks y rendimiento

El autor proporciona métricas SDR (Signal-to-Distortion Ratio) sobre el dataset de test de MUSDB18 para dos versiones del modelo. La versión 1:

| Instrumento | SDR (dB) |
|---|---|
| Batería | 10.4314 |
| Bajo | 7.7418 |
| Otros | 7.0982 |
| Voces | 10.6979 |
| Media | 8.9923 |

La versión 2 (publicada posteriormente):

| Instrumento | SDR (dB) | Fullness | Bleedless |
|---|---|---|---|
| Batería | 10.2869 | 17.1690 | 32.6756 |
| Bajo | 7.6155 | 11.6789 | 38.1782 |
| Otros | 7.0061 | 16.9378 | 29.2958 |
| Voces | 10.5878 | 19.6140 | 33.0137 |
| Media SDR | 8.8741 | 16.3499 | 33.2908 |

El modelo base (mel_band_roformer_ep_5_sdr_8.9443) obtuvo un SDR de 8.9443 en el mismo dataset, por lo que la versión 1 del fine-tuning mejora ligeramente la media (8.9923), mientras que la versión 2 lo reduce levemente.

No se han publicado comparaciones con otros modelos de separación de fuentes en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 7,5 GB, lo que sugiere que el modelo completo en precisión float32 ocupa aproximadamente esa cantidad de memoria. En float16, la VRAM necesaria para inferencia se estima en torno a 4-5 GB.
- Es viable en GPUs de consumo como RTX 3060 (12 GB), RTX 3070, RTX 4070, etc., siempre que se cargue en float16 o se use batching reducido.
- Para procesamiento por lotes de múltiples pistas, se recomienda una GPU con al menos 8 GB de VRAM, como RTX 3070 Ti o superior.
- El modelo se puede ejecutar en CPU, aunque la latencia será significativamente mayor. Para una canción de 3 minutos, se estima un tiempo de procesado de varios minutos en CPU.
- Opciones de despliegue: el modelo se integra fácilmente en entornos PyTorch, mediante scripts de Music-Source-Separation-Training, o a través de librerías como `audio-separator` o `demucs` si se adapta el formato.
- No hay información sobre soporte de vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Para inferencia en tiempo real (streaming) no es adecuado, ya que el procesado se realiza sobre la pista completa.

## Comparativa con modelos similares

| Modelo | Arquitectura | Stems | SDR medio (MUSDB18) | Licencia |
|---|---|---|---|---|
| xylo-stem-syh4-v1 (v2) | Mel Band Roformer | 4 | 8.8741 | Apache-2.0 |
| Demucs v4 (htdemucs) | Hybrid Transformer | 4 | ~9.0 (aprox.) | MIT |
| Spleeter 4stems | U-Net | 4 | ~5.8 | MIT |
| Open-Unmix (UMX) | Bi-LSTM | 4 | ~5.5 | MIT |

No se han publicado comparaciones directas con estos modelos en la información disponible. Los valores de Demucs v4, Spleeter y Open-Unmix son aproximados y provienen de la literatura general, no de los datos del autor.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para la extracción de cuatro stems. El propio autor advierte que no debe usarse para extraer instrumentos individuales.
- La versión 2 del modelo presenta un SDR ligeramente inferior a la versión 1, aunque el autor afirma que la calidad percibida es mejor. Se recomienda probar ambas versiones para determinar cuál se adapta mejor a cada caso.
- Los resultados pueden degradarse en mezclas con muchos instrumentos, efectos fuertes o grabaciones de baja calidad.
- La separación puede producir artefactos como sangrado (bleed) entre stems, aunque las métricas de bleedless son relativamente altas (33 de media).
- No hay información sobre el rendimiento en géneros musicales específicos ni en grabaciones no musicales.
- El modelo no soporta entrada en tiempo real ni streaming; requiere el procesamiento completo de la pista.
- No se especifica el tamaño de ventana ni la duración máxima de audio que puede procesar en una sola pasada.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de copyright del modelo original si se redistribuye.
- El nombre "xylo" no tiene relación con el chip neuromórfico Xylo de SynSense; es una coincidencia de nomenclatura.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Electrohat/xylo-stem-syh4-v1
- Modelo base y scripts de entrenamiento: https://github.com/ZFTurbo/Music-Source-Separation-Training
- Página de lanzamiento del modelo base: https://github.com/ZFTurbo/Music-Source-Separation-Training/releases/download/v1.0.11/model_mel_band_roformer_ep_5_sdr_8.9443
