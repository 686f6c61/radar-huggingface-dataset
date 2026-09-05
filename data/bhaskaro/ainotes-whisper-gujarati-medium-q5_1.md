# bhaskaro/ainotes-whisper-gujarati-medium-q5_1

## Resumen

El modelo `bhaskaro/ainotes-whisper-gujarati-medium-q5_1` es una conversión a formato GGML y cuantización q5_1 del modelo `vasista22/whisper-gujarati-medium`, un fine-tune de Whisper medium especializado en reconocimiento automático de voz (ASR) en gujarati. Lo desarrolla el usuario `bhaskaro` con el objetivo de ejecutarlo en dispositivos Android mediante la librería `whisper.cpp`. El modelo original fue entrenado sobre múltiples corpus públicos de ASR en gujarati como parte del Whisper fine-tuning sprint.

Con un tamaño de 587 MB y una ventana de contexto fija de 30 segundos (característica de Whisper), este modelo se presenta como una alternativa opcional de mayor precisión al modelo small q5_1 del mismo autor (190 MB), pero con un coste computacional aproximadamente seis veces mayor. Es relevante porque permite realizar transcripción de voz en gujarati de forma local en dispositivos móviles, sin necesidad de conexión a internet, aunque requiere el uso de `no_timestamps` para evitar degradaciones severas del rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos (ventana fija de Whisper) |
| Tipos de cuantizacion | q5_1 (GGML) |
| Idiomas soportados | Gujarati (gu) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (para whisper.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper de OpenAI, un transformer encoder-decoder diseñado para ASR multilingüe. En este caso, se parte del modelo `openai/whisper-medium` y se realiza un fine-tune sobre datos en gujarati procedentes de múltiples corpus públicos de ASR, dentro del marco del Whisper fine-tuning sprint. El modelo resultante, `vasista22/whisper-gujarati-medium`, fue posteriormente convertido a GGML mediante la herramienta `convert-h5-to-ggml.py` de `whisper.cpp` y cuantizado a q5_1, lo que reduce el tamaño a 587 MB manteniendo una precisión aceptable para su uso en dispositivos Android.

No se han documentado técnicas de RLHF ni DPO, ya que se trata de un modelo de reconocimiento de voz. Una peculiaridad relevante es que el fine-tune se entrenó con la predicción de timestamps desactivada, por lo que sus tokens de timestamp no están entrenados. Si se activan, `whisper.cpp` puede desviarse y generar texto fluido no relacionado con el audio, tal y como se observó en una prueba con el modelo small en hindi (WER del 47,5% frente al 14,9% con `no_timestamps`).

## Capacidades

- Transcripción de audio en gujarati, con salida de texto en escritura gujarati.
- Reconocimiento de voz optimizado para fragmentos cortos de hasta 30 segundos, gracias a la ventana fija de Whisper.
- Ejecución local en dispositivos Android mediante `whisper.cpp`, sin necesidad de conexión a internet.
- Requiere el uso de `no_timestamps`; si se confía en los tokens de timestamp, el modelo produce texto fluido no relacionado con el audio.
- No soporta tool calling, function calling ni razonamiento multi-step.
- No incluye capacidades de visión ni de audio más allá del reconocimiento de voz.
- Es una alternativa de mayor precisión al modelo `bhaskaro/ainotes-whisper-gujarati-q5_1` (small), pero no lo reemplaza por su mayor coste computacional.

## Casos de uso

- Aplicación de notas de voz para hablantes de gujarati: el modelo transcribe notas de audio directamente en el dispositivo, sin conexión a internet, gracias a la cuantización q5_1 y al formato GGML para `whisper.cpp`. Es adecuado para usuarios que necesitan convertir sus notas habladas en texto de forma privada.
- Dictado en aplicaciones de mensajería: permite dictar mensajes en gujarati en fragmentos de hasta 30 segundos, lo que cubre la mayoría de mensajes de voz cortos. La ejecución local evita la latencia de una llamada a la nube.
- Subtitulado de vídeos cortos en gujarati: puede generar subtítulos de clips de audio o vídeo, aunque al requerir `no_timestamps`, los subtítulos no incluyen marcas temporales precisas. Es útil para vídeos donde la sincronización exacta no es crítica.
- Accesibilidad para personas con discapacidad auditiva: convierte audio en gujarati en texto para usuarios que necesitan leer contenido hablado, por ejemplo en reuniones, clases o vídeos educativos.
- Transcripción de reuniones o entrevistas en gujarati: en entornos móviles, el modelo transcribe fragmentos de audio de hasta 30 segundos, lo que permite tomar notas rápidas de intervenciones cortas. Es una opción viable cuando no se dispone de acceso a servicios en la nube.
- Investigación en ASR para gujarati: sirve como modelo de referencia para evaluar el rendimiento de sistemas de reconocimiento de voz en este idioma, especialmente en dispositivos de gama media. La comparación con el modelo small permite estudiar el equilibrio entre precisión y coste computacional.

## Benchmarks y rendimiento

Las mediciones fueron realizadas por el autor sobre el conjunto FLEURS `gu_in`, con 64 clips, ejecutando ambos modelos a través de `whisper.cpp` con la configuración que usa la aplicación: `no_timestamps`, decodificación greedy y romanización de escritura común antes de puntuar. El modelo small evaluado es el archivo q5_1 que la aplicación incluye, no una reconversión.

| Modelo | Tamaño | WER | CER |
|---|---|---|---|
| small q5_1 | 190 MB | 53,1% | 38,0% |
| medium q5_1 | 587 MB | 49,2% | 37,0% |

No se han publicado otros resultados de benchmarks en la información disponible. El autor indica que ambas cifras tenían que mejorar para que el modelo se publicara, como regla para evitar lanzar modelos que ganan en un eje pero empeoran significativamente en otro.

## Requisitos de hardware

- No requiere VRAM, ya que se ejecuta en CPU a través de `whisper.cpp`.
- GPU recomendadas: no aplica, es un modelo para CPU.
- No está pensado para GPU de consumo; su despliegue es en dispositivos móviles o en sistemas con CPU.
- Opciones de despliegue: `whisper.cpp` en Android, también puede ejecutarse en otros entornos compatibles con GGML.
- Latencia medida en un Realme RMX2170 (2 núcleos grandes a 2,3 GHz): aproximadamente 200 segundos por nota, frente a 33 segundos para el modelo small. La medición se realizó con cinco ejecuciones en el dispositivo, dando 193, 193, 201, 220 y 221 segundos.
- El coste es por nota, no por segundo de audio, ya que Whisper rellena cada entrada a una ventana de 30 segundos. Una nota de cuatro segundos cuesta lo mismo que una de veintinueve.
- No es presión de memoria: la RAM disponible se mantuvo en 2,7 GB durante las pruebas. El mayor coste se atribuye al ancho de banda de memoria en el teléfono.

## Comparativa con modelos similares

| Modelo | Tamaño | WER (FLEURS gu_in) | CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bhaskaro/ainotes-whisper-gujarati-medium-q5_1 | 587 MB | 49,2% | 37,0% | Apache-2.0 | HuggingFace |
| bhaskaro/ainotes-whisper-gujarati-q5_1 (small) | 190 MB | 53,1% | 38,0% | Apache-2.0 | HuggingFace |
| vasista22/whisper-gujarati-medium (base) | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |

El medium q5_1 ofrece una mejora de 3,9 puntos porcentuales en WER y 1 punto en CER frente al small, pero con un coste de tiempo aproximadamente seis veces mayor. El modelo base no tiene datos de rendimiento publicados en la información disponible, aunque es el modelo original sin cuantizar.

## Limitaciones y advertencias

- No se han documentado sesgos específicos para este modelo, pero al ser un fine-tune de Whisper puede heredar sesgos del modelo base y de los datos de entrenamiento.
- Riesgo de alucinación: si se activan los timestamps, el modelo puede producir texto fluido no relacionado con el audio, como se observó en una prueba con el modelo small en hindi.
- Limitaciones de contexto: ventana fija de 30 segundos; no soporta audio más largo sin segmentar previamente.
- Limitaciones de idioma: solo soporta gujarati, no es multilingüe.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, sin restricciones adicionales.
- El rendimiento en FLEURS gu_in es relativamente alto (WER del 49,2%), lo que indica dificultades en escenarios reales, especialmente con acentos, ruido o audio de baja calidad.
- El coste computacional es seis veces mayor que el del modelo small, lo que puede hacerlo inaceptable en dispositivos de gama baja o en aplicaciones que necesitan transcripción en tiempo real.
- El autor indica que es una alternativa opcional de mayor precisión, no un reemplazo del modelo small, y que su publicación se condicionó a que ambas métricas (WER y CER) mejoraran.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bhaskaro/ainotes-whisper-gujarati-medium-q5_1
- Modelo small del mismo autor: https://huggingface.co/bhaskaro/ainotes-whisper-gujarati-q5_1
- Modelo base: https://huggingface.co/vasista22/whisper-gujarati-medium
- Información y benchmarks del modelo base: https://free2aitools.com/model/vasista22/whisper-gujarati-medium
