# jessengatai/supracut-beat-this

## Resumen

Beat This! (Core ML) for Supra Cut es una conversión a Core ML del rastreador de beats y downbeats *Beat This!*, desarrollado originalmente por el grupo CPJKU (Foscarin, Schlüter y Widmer) y presentado en ISMIR 2024. El usuario jessengatai ha convertido el checkpoint `final0` a un programa Core ML en float32, lo ha compilado a `.mlmodelc` y lo publica para integrarlo en Supra Cut, un editor de vídeo para macOS que lo emplea para localizar los beats de una canción y cortar el material al ritmo.

El modelo resuelve el seguimiento de pulso (beat tracking) y de compás (downbeat tracking) sin el postproceso con redes bayesianas dinámicas (DBN) típico de rastreadores anteriores. La entrada es un espectrograma de mel fijo de 30 segundos por 128 bandas y el repositorio ocupa unos 0,1 GB. Su relevancia práctica estriba en que permite ejecutar la detección de beats íntegramente en el dispositivo sobre macOS mediante Core ML, sin dependencias de Python ni de servidor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal con bloques de atención sobre espectrogramas de mel (detalles completos no disponibles) |
| Parámetros totales | No disponible (el repositorio completo ocupa 0,1 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Entrada fija de 30 segundos de audio (128 bandas de mel) |
| Tipos de cuantización | Float32 (float16 se descartó por pérdida de precisión en la atención) |
| Idiomas soportados | No aplica (modelo de análisis de audio; HuggingFace indica "no disponibles") |
| Licencia | MIT |
| Formato de pesos | Core ML compilado (`.mlmodelc`, distribuido como `BeatThis.mlmodelc.zip`) |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | Clasificación de audio (audio-classification) |

## Arquitectura y entrenamiento

El modelo original Beat This! es una red neuronal con mecanismo de atención que opera sobre espectrogramas de mel. Su rasgo distintivo, según el artículo de ISMIR 2024, es que produce predicciones de beat y downbeat precisas sin recurrir al postproceso DBN (Dynamic Bayesian Network) empleado por los rastreadores clásicos. Los detalles de la arquitectura y del corpus de entrenamiento no constan en la información disponible.

Respecto a la conversión, el checkpoint `final0` se transformó en un programa Core ML en float32 con entrada fija de 30 segundos por 128 bandas de mel y se compiló a `.mlmodelc`. Se probó float16, pero introdujo errores de precisión en la atención que degradaban la salida a ruido, por lo que se descartó; el modelo en float32 coincide con PyTorch hasta un error de 1e-4. No se ha reentrenado nada ni se han modificado los pesos originales.

## Capacidades

- Detección de beats (pulsos) en música.
- Detección de downbeats (primer tiempo de cada compás).
- Procesamiento de audio en ventanas fijas de 30 segundos representadas con 128 bandas de mel.
- Ejecución local en macOS mediante Core ML, integrable en aplicaciones nativas (caso de uso: Supra Cut).
- Verificación de integridad del modelo mediante hash SHA-256 antes de empaquetarlo en la aplicación.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no posee capacidades multilingües al uso.

## Casos de uso

- Edición de vídeo al ritmo de la música: Supra Cut emplea el modelo para localizar los beats de una canción y sincronizar automáticamente los cortes de vídeo con el pulso, gracias a su ejecución local vía Core ML.
- Montajes y slideshows automáticos: alinear fotos o clips con la estructura rítmica de una pista, usando la rejilla de beats y downbeats como puntos de corte.
- Visualizaciones musicales reactivas: alimentar visualizadores o escenas VJ que reaccionen a beats y downbeats en tiempo casi real sin conexión a servicios externos.
- Análisis musical (MIR): extraer rejillas de beat y downbeat como paso previo a tareas como reconocimiento de acordes, análisis de estructura o alineación de letras.
- Aplicaciones de baile y fitness: contar compases y sincronizar coreografías o rutinas de ejercicio con el pulso detectado.
- Herramientas de DJ y producción musical: generar beat grids para mezclas, cuantización o creación de loops a partir de la salida del modelo.
- Organización de bibliotecas musicales: derivar información de pulso y métrica para clasificar o agrupar pistas de forma automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original ("Beat This! Accurate Beat Tracking Without DBN Postprocessing", ISMIR 2024) contiene evaluaciones del modelo, pero sus cifras no están incluidas en la información proporcionada. El único dato de fidelidad técnica publicado es que la conversión en float32 coincide con PyTorch hasta 1e-4.

## Requisitos de hardware

- Memoria: el modelo compilado ocupa unos 0,1 GB en float32; la huella exacta de memoria en inferencia no está documentada, aunque es reducida por el tamaño del fichero.
- Plataforma: macOS con soporte de Core ML; está diseñado para integrarse en Supra Cut. Los compute units concretos (CPU, GPU o Neural Engine) no se especifican.
- No aplican recomendaciones de GPU de servidor (A100, H100, RTX 4090, etc.): no es un despliegue CUDA ni un LLM.
- Cabe con holgura en cualquier Mac moderno con memoria unificada; no se requieren tarjetas gráficas dedicadas.
- Despliegue: integrado en Supra Cut mediante `.mlmodelc`. Para otros entornos, utilizar el modelo PyTorch original de CPJKU/beat_this. vLLM, llama.cpp, Ollama o TGI no son aplicables a este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato y plataforma | Entrada | Licencia | Observaciones |
|---|---|---|---|---|
| supracut-beat-this (este repositorio) | Core ML compilado (`.mlmodelc`), macOS | 30 s x 128 bandas de mel | MIT | Conversión float32 sin reentrenar, verificada por SHA-256 |
| CPJKU/beat_this (original) | PyTorch, multiplataforma | No disponible en la información proporcionada | MIT | Pesos y código originales; requiere entorno Python |
| Rastreadores clásicos con postproceso DBN (p. ej. madmom) | No disponible | No disponible | No disponible | Enfoque que Beat This! evita según el artículo de ISMIR 2024 |

## Limitaciones y advertencias

- Entrada fija de 30 segundos: las pistas más largas requieren segmentación, cuya estrategia no está documentada en este repositorio.
- Sensibilidad a la precisión numérica: float16 degrada la salida a ruido, por lo que debe mantenerse float32, con el consiguiente mayor consumo de memoria frente a una versión cuantizada.
- No hay reentrenamiento: el modelo hereda las limitaciones y sesgos del original (por ejemplo, posibles sesgos hacia géneros musicales del corpus de entrenamiento, no documentados aquí).
- Riesgo de predicciones erróneas en música con métrica ambigua, tempos variables o géneros poco representados; no se cuantifica en la información disponible.
- Reproducibilidad limitada fuera de Supra Cut: la receta de conversión reside en un repositorio privado (`supracut-models`).
- Repositorio recién publicado, con 0 descargas y 0 likes registrados: falta de validación comunitaria.
- Licencia MIT: permite uso comercial sin restricciones relevantes; remitirse al aviso de copyright del repositorio original.
- Ámbito restringido al ritmo: no transcribe audio, no etiqueta géneros ni procesa voz.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/jessengatai/supracut-beat-this
- Repositorio original (código y pesos): https://github.com/CPJKU/beat_this
- Artículo: F. Foscarin, J. Schlüter, G. Widmer, "Beat This! Accurate Beat Tracking Without DBN Postprocessing", ISMIR 2024 (enlace directo no disponible en la información proporcionada).
