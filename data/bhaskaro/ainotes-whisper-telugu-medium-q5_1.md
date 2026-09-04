# bhaskaro/ainotes-whisper-telugu-medium-q5_1

## Resumen

El modelo `bhaskaro/ainotes-whisper-telugu-medium-q5_1` es una conversión a formato GGML del modelo `vasista22/whisper-telugu-medium`, un fine-tune de Whisper medium para el reconocimiento automático de voz en telugu. El autor, `bhaskaro`, lo ha cuantizado en `q5_1` y lo ha publicado específicamente para su uso con `whisper.cpp` en dispositivos Android, donde la limitación de recursos hace necesaria una reducción drástica del tamaño de los pesos.

El modelo resultante ocupa 587 MB y ofrece una precisión superior al modelo `small q5_1` del mismo autor, a cambio de una latencia notablemente mayor. Su arquitectura es un transformer encoder-decoder (Whisper medium), con una ventana de procesamiento fija de 30 segundos de audio. Está pensado como una alternativa opcional de mayor precisión, no como un sustituto del modelo pequeño, y requiere que los timestamps estén desactivados (`no_timestamps`) para funcionar correctamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija) |
| Tipos de cuantizacion | q5_1 (GGML) |
| Idiomas soportados | telugu (te) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (para whisper.cpp) |
| Modelo base | vasista22/whisper-telugu-medium |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper medium, un transformer encoder-decoder diseñado para reconocimiento de voz. El modelo base `vasista22/whisper-telugu-medium` es un fine-tune en telugu que se entrenó con la predicción de timestamps deshabilitada, por lo que los tokens de timestamp no están entrenados y deben evitarse durante la inferencia. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni la metodología de fine-tuning.

La conversión al formato GGML se realizó con el script `convert-h5-to-ggml.py` de `whisper.cpp`, y se aplicó una cuantización `q5_1` para reducir el tamaño del archivo a 587 MB. La tabla de tokens se verificó byte a byte contra la del modelo `ggml-small` de Ggerganov. Esta cuantización es la principal innovación práctica, ya que permite ejecutar el modelo en dispositivos móviles con CPU, sin necesidad de aceleración por GPU.

## Capacidades

- Reconocimiento automático de voz (ASR) en telugu, transcribiendo audio a texto.
- Rendimiento medido en el conjunto FLEURS `te_in` con un WER del 39,8 % y CER del 24,2 % (32 clips).
- Funciona en CPU mediante `whisper.cpp`, sin necesidad de GPU.
- Requiere la opción `no_timestamps` porque los timestamps no están entrenados; si se habilitan, el decodificador se descarrila y puede generar texto no relacionado.
- No soporta tool calling, agentes, generación de texto libre, visión ni audio con valores añadidos: es exclusivamente un modelo de transcripción.
- Ventana de procesamiento de 30 segundos, lo que lo hace adecuado para notas de voz y segmentos cortos, no para audio continuo largo.
- Tamaño de pesos de 587 MB, optimizado para despliegue en Android.

## Casos de uso

- Aplicaciones de dictado en telugu para Android: se integra en una app de notas mediante `whisper.cpp`; el usuario habla una nota de hasta 30 segundos y el modelo la transcribe con alta precisión. Es adecuado porque reduce el tamaño del modelo a 587 MB y mantiene un WER inferior al del modelo pequeño.

- Transcripción de entrevistas o reuniones en telugu: se graban fragmentos de audio cortos y se transcriben offline. El modelo es útil en entornos sin conexión, y la mayor latencia (~90 s por nota) se compensa con una mejor precisión.

- Archivado de llamadas en telugu para centros de soporte: las llamadas se dividen en ventanas de 30 segundos y se transcriben para su análisis posterior. La licencia Apache-2.0 permite un uso comercial sin restricciones.

- Accesibilidad para personas con discapacidad auditiva: el modelo puede transcribir audio grabado en telugu, pero no en tiempo real, ya que procesa en ventanas de 30 segundos y no genera timestamps.

- Investigación lingüística sobre corpus orales en telugu: permite convertir grabaciones de campo en texto para su estudio, siempre que las muestras se recorten a 30 segundos.

- Asistentes personales locales en Raspberry Pi: se despliega `whisper.cpp` en un dispositivo de bajo consumo para transcribir comandos de voz en telugu. El formato GGML y la cuantización hacen que el modelo sea viable en hardware limitado.

- Generación de apuntes a partir de clases grabadas en telugu: se trocea la clase en segmentos de 30 segundos y se transcribe. El resultado puede usarse como base para resúmenes con otro modelo de lenguaje, aunque sin marcas de tiempo.

## Benchmarks y rendimiento

| Modelo | Tamano | WER | CER | Tiempo por nota* |
|---|---|---|---|---|
| small q5_1 | 190 MB | 45,8 % | 30,7 % | ~27 s |
| **medium q5_1** | **587 MB** | **39,8 %** | **24,2 %** | **~90 s** |

\* Medido en un Realme RMX2170 (dos núcleos grandes a 2,3 GHz). Whisper rellena cada entrada hasta una ventana de 30 segundos, por lo que el tiempo es por nota independientemente de su duración. La cifra de 90 s se ha tomado del modelo Hindi medium, que comparte arquitectura y tamaño; no se ha cronometrado específicamente para el modelo telugu.

La evaluación se realizó sobre el conjunto FLEURS `te_in` con 32 clips, utilizando `no_timestamps`, decodificación greedy y romanización de escritura común antes de puntuar.

## Requisitos de hardware

- VRAM estimada: no aplica, la inferencia se ejecuta en CPU mediante `whisper.cpp`.
- Memoria RAM: no disponible oficialmente; el archivo de pesos pesa 587 MB, por lo que se necesita memoria suficiente para cargar el modelo y el audio, sin que se haya publicado una cifra exacta.
- GPU recomendadas: no aplica; no se requiere GPU para la inferencia.
- Despliegue: `whisper.cpp` en Android, Linux, macOS y Windows.
- Latencia: ~90 s por nota de audio (ventana de 30 s) en un Realme RMX2170, según el autor, con la advertencia de que la medición se trasladó desde el modelo Hindi medium.

## Comparativa con modelos similares

| Modelo | Tamano | WER (FLEURS te_in) | Latencia por nota | Licencia |
|---|---|---|---|---|
| bhaskaro/ainotes-whisper-telugu-medium-q5_1 | 587 MB | 39,8 % | ~90 s | Apache-2.0 |
| small q5_1 (mismo autor) | 190 MB | 45,8 % | ~27 s | Apache-2.0 |
| vasista22/whisper-telugu-medium (base, sin cuantizar) | no disponible | no disponible | no disponible | Apache-2.0 |

La comparación principal es entre el modelo medio y el pequeño del mismo autor. El medium ofrece una reducción de 6 puntos porcentuales en WER y de 6,5 puntos en CER, a costa de un aumento de tamaño de tres veces y una latencia aproximadamente tres veces superior. El autor advierte que el medium no sustituye al small, sino que es una opción cuando se prioriza la precisión.

## Limitaciones y advertencias

- Los timestamps no están entrenados: es obligatorio usar `no_timestamps`. Si se confía en los timestamps, el decodificador puede abandonar el audio y generar texto fluido no relacionado; el autor lo documenta con el modelo Hindi small, donde el WER sube del 14,9 % al 47,5 %.
- Riesgo de alucinación: como en todos los modelos Whisper, existe la posibilidad de que el modelo genere texto que no se corresponde con el audio, especialmente si se activan funciones no entrenadas.
- Contexto fijo de 30 segundos: no procesa audio continuo de mayor duración sin segmentar manualmente.
- Solo soporta telugu: no ofrece capacidades multilingües más allá del idioma para el que fue afinado.
- Latencia alta para notas largas: el coste de procesamiento es el mismo para una nota de 4 segundos que para una de 29 segundos, por lo que puede ser inadecuado para aplicaciones en tiempo real.
- Los datos de rendimiento se limitan a 32 clips de FLEURS `te_in` y a una única medición de latencia extrapolada de otro modelo; no se han publicado benchmarks más amplios.

## Enlaces

- Modelo: https://huggingface.co/bhaskaro/ainotes-whisper-telugu-medium-q5_1
- Modelo base: https://huggingface.co/vasista22/whisper-telugu-medium
- Modelos relacionados del mismo autor:
  - https://huggingface.co/bhaskaro/ainotes-whisper-urdu-q5_1
  - https://huggingface.co/bhaskaro/ainotes-whisper-hindi-medium-q5_1
- Repositorio de whisper.cpp: https://github.com/ggerganov/whisper.cpp
