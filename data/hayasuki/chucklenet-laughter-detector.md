# Hayasuki/chucklenet-laughter-detector

## Resumen

ChuckleNet es un detector de risas para audio de monólogo cómico (stand-up) desarrollado por Hayasuki (autor del trabajo: Subhajit Das). No es un modelo de lenguaje ni un modelo generativo: es un clasificador de audio binario que, dado un fragmento de audio, estima la probabilidad de que contenga una reacción de risa y devuelve eventos con marcas de tiempo de inicio y fin. Su objetivo es encontrar "los momentos graciosos" de un especial de comedia de forma automática.

La arquitectura es deliberadamente ligera: un codificador `microsoft/wavlm-base` congelado del que se extrae el último estado oculto promediado (768 dimensiones), seguido de una cabeza MLP entrenable de 768 → 256 → 128 → 1. El repositorio de HuggingFace contiene únicamente los pesos de esa cabeza: 229.889 parámetros (aproximadamente 230K, menos de 1 MB), mientras que el codificador WavLM se descarga aparte. Esto hace que el ajuste fino sea extremadamente barato y que la inferencia pueda ejecutarse en CPU.

El interés del modelo es doble. Por un lado, es una utilidad práctica para indexar, resumir y montar clips de comedia a partir de reacciones de audiencia. Por otro, se presenta como un programa de investigación preregistrado que intenta demostrar que la señal temporal de interacción (el orden de los eventos acústicos) aporta información predictiva sobre la risa más allá de la acústica estática. Los resultados publicados son modestos y el propio autor los etiqueta como evaluación con etiquetas débiles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador WavLM-base congelado (768 d, mean-pooling del ultimo estado oculto) + cabeza MLP 768 → 256 → 128 → 1 con ReLU y dropout 0.3/0.2 |
| Parametros totales | 229.889 en el repositorio (solo la cabeza MLP entrenable, ~230K, < 1 MB). El codificador WavLM-base se descarga por separado desde `microsoft/wavlm-base` |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de audio. Procesa segmentos obtenidos mediante VAD de energia, con padding y division por segmentos; no hay ventana de texto |
| Tipos de cuantizacion | No disponibles. La cabeza es de 230K parametros, por lo que no requiere cuantizacion; el codificador admite las cuantizaciones estandar de WavLM (fp32/fp16) |
| Idiomas soportados | No disponibles. No verificado para habla no inglesa (limitacion declarada por el autor) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + codigo personalizado (`modeling_chucklenet.py`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo reutiliza un codificador WavLM-base congelado y entrena exclusivamente una cabeza MLP sobre las representaciones globales de audio. La pérdida es `BCEWithLogitsLoss` con `pos_weight = N_neg / N_pos` para compensar el fuerte desbalance de clases, optimizada con AdamW (lr = 1e-3, weight decay = 1e-4, schedule coseno) durante 30 épocas. La partición de datos es `GroupShuffleSplit` por vídeo, 80/20, semilla 42, sin solapamiento de vídeos entre entrenamiento y validación.

Los datos de entrenamiento son 620 vídeos y 121.928 segmentos de emisión, de los cuales solo 1.965 son positivos (1,6 %). Las etiquetas no proceden de anotación humana directa, sino de marcadores de transcripción (`[laughter]` en ficheros VTT), es decir, etiquetas débiles. La innovación metodológica no está en la arquitectura sino en el diseño experimental preregistrado: los autores comparan el modelo con controles acústicos (respiración, tos, aplausos, ovaciones, silencio) y con controles de orden barajado, para sostener que la secuencia temporal aporta señal predictiva más allá de la acústica estática (hallazgo E02, replicado con incrementos de +0,034 y +0,087 F1).

## Capacidades

- Clasificación de audio binaria: decide si un segmento contiene risa o reacción de audiencia.
- Detección con marcas de tiempo: el método `detect(audio, sr, threshold)` devuelve eventos con `start`, `end` y probabilidad `p`.
- Segmentación automática: aplica VAD de energía, padding y división de segmentos, y fusiona detecciones adyacentes con separación menor o igual a 0,3 s.
- Umbral ajustable: por defecto 0,85 (orientado a precisión); bajarlo a 0,5 aumenta la sensibilidad (recall).
- Integración nativa con `transformers`: pipeline de `audio-classification` y `AutoModelForAudioClassification` con `trust_remote_code=True`.
- Independencia del sample rate de entrada: el ejemplo de uso carga audio con `librosa` a `sr=None` y lo pasa al modelo.
- Capacidad investigada (no una función de producto): sensibilidad al orden temporal de los eventos acústicos.
- No soporta tool calling, agentes, generación de texto, visión ni razonamiento multi-paso.

## Casos de uso

- Generación de "best-of" de especiales de comedia: pasar el audio completo por `detect()` y ordenar los eventos por confianza para construir un montaje de los momentos con mayor reacción de audiencia.
- Indexación con marcas de risa para post-producción: insertar marcadores temporales en la línea de tiempo del editor para localizar rápidamente los chistes que funcionan en una grabación en directo.
- Subtitulado y accesibilidad: añadir indicaciones de `[risas]` o `[aplausos]` en subtítulos automáticos de monólogos, mejorando la descripción de la banda sonora para personas con discapacidad auditiva.
- Investigación en computación afectiva y humor: usar el modelo como instrumento de medida en estudios sobre interacción y reacción de audiencia, con apoyos en los controles preregistrados del repositorio.
- Selección de clips para redes sociales: puntuar por intensidad y duración de la risa fragmentos de un vídeo largo y priorizar los candidatos a clip corto.
- Evaluación de material en pre-producción: comprobar, sobre un ensayo grabado, qué segmentos generan risa y cuáles no antes del rodaje definitivo.
- Análisis comparativo entre especiales o cómicos: agregar estadísticas de densidad de risa por minuto para comparar estructuras de guion y ritmo de chistes.

## Benchmarks y rendimiento

Evaluación con etiquetas débiles sobre 124 vídeos reservados (disjuntos por vídeo):

| Metrica | Valor |
|---|---|
| F1 a nivel de emision (umbral 0,85) | 0,2732 |
| IoU-F1 de eventos con solapamiento 0,2 | 0,2290 (precision = 0,281; recall = 0,193) |
| Average Precision | 0,142 |

Subconjunto verificado por humanos (118 vídeos, preregistrado):

| Metrica | Valor |
|---|---|
| IoU-F1 con etiquetas verificadas a nivel de palabra | 0,30 - 0,40 |
| Mejora frente a controles de orden barajado | +0,09 F1 (preregistrado, p < 0,05) |
| Tasa de falsos positivos en controles acusticos (respiracion, tos, aplausos, ovaciones) | 0,189 de media (por debajo de 0,2) |

No se han publicado comparaciones con otros modelos de detección de risa en la información disponible.

## Requisitos de hardware

- El repositorio solo contiene 229.889 parámetros (< 1 MB); el consumo real proviene del codificador WavLM-base, de aproximadamente 94 millones de parámetros.
- VRAM estimada: en torno a 1-2 GB en fp32 para el codificador más el audio de entrada; inferior a 1 GB en fp16. Cifra orientativa, no publicada por el autor.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares. También es viable en CPU para procesamiento por lotes fuera de línea.
- GPU de centro de datos (A100, H100) no son necesarias; solo tendrían sentido para procesar grandes volúmenes de audio en paralelo.
- Despliegue: pipeline de `transformers` con `trust_remote_code=True`, `AutoModelForAudioClassification` con código personalizado, y exportación a ONNX como opción no documentada en el repositorio. No se mencionan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a un clasificador de audio.
- Latencia y throughput: no disponibles. El coste dominante es la puntuación por lotes de los segmentos generados por el VAD de energía.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Datos publicados |
|---|---|---|---|---|---|
| ChuckleNet (Hayasuki/chucklenet-laughter-detector) | 229.889 entrenables (cabecera) + WavLM-base congelado | Deteccion de risa con marcas de tiempo | No aplica (audio segmentado) | MIT | F1 0,2732; IoU-F1 0,2290; AP 0,142 |
| microsoft/wavlm-base | ~94 M | Representaciones de voz auto-supervisadas (modelo base, sin cabeza) | No aplica (audio) | MIT | No disponible en esta ficha |
| Fine-tunes genericos de WavLM/wav2vec2 para clasificacion de audio (por ejemplo, tareas tipo SUPERB) | ~94 M + cabeza | Clasificacion de emociones, hablante, palabras clave | No aplica (audio) | Variable segun autor | No disponibles en la informacion proporcionada |

No se dispone de resultados comparativos con otros detectores de risa en la información proporcionada.

## Limitaciones y advertencias

- Etiquetas débiles: el entrenamiento usa marcadores `[laughter]` de ficheros VTT, no anotación humana auditada. Todas las métricas de la tabla principal deben leerse bajo ese supuesto.
- Rendimiento modesto: F1 de 0,2732 y Average Precision de 0,142 en la evaluación débil. En el subconjunto verificado por humanos, IoU-F1 se queda en 0,30-0,40.
- Ámbito restringido: no está verificado para conversación multiparte (reuniones, pódcast), audio telefónico ni habla en idiomas distintos del inglés.
- No es un clasificador de emociones general: el propio autor documenta (hallazgo E05) que la señal más allá de las palabras es específica de risa o reacción, no de emoción general.
- Riesgo de falsos positivos con sonidos acústicamente parecidos: la tasa media de falsos positivos en controles de respiración, tos, aplausos, ovaciones y silencio es 0,189, cerca del umbral declarado de 0,2.
- Dependencia de `trust_remote_code=True`: la carga del modelo ejecuta código Python del repositorio (`modeling_chucklenet.py`), lo que exige revisión previa en entornos de producción.
- Madurez baja: 0 descargas y 0 "likes" en el momento de la consulta, repositorio de 0,0 GB y fecha de creación posterior a la de la mayoría de alternativas auditadas. No hay garantía de mantenimiento.
- Licencia MIT: permite uso comercial, pero al derivar de `microsoft/wavlm-base` conviene verificar la licencia del modelo base y de los datos de audio utilizados en cada despliegue.
- Ajuste de umbral sensible: la diferencia entre trabajar con umbral 0,85 (precisión) y 0,5 (recall) altera de forma sustancial la tasa de falsos positivos; debe calibrarse por dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hayasuki/chucklenet-laughter-detector
- Repositorio y registro experimental preregistrado: https://github.com/Das-rebel/ChuckleNet
- Cuaderno de Colab: https://colab.research.google.com/github/Das-rebel/ChuckleNet/blob/main/Colab_StandUp4AI_Fresh.ipynb
- Cuaderno de Kaggle: https://www.kaggle.com/code/subhojitdas/chucklenet-laughter-detector
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Hayasuki/chucklenet
- Modelo base: https://huggingface.co/microsoft/wavlm-base
- Cita: Das, Subhajit (2026), "ChuckleNet: Temporal Interaction Signals for Laughter Detection in Stand-Up Comedy"
- La busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a un catalogo de television ajeno al tema.
