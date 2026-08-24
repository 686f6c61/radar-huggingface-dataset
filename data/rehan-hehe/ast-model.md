# rehan-hehe/ast-model

## Resumen

El modelo `rehan-hehe/ast-model` es un modelo de reconocimiento de emociones en música basado en el Audio Spectrogram Transformer (AST), desarrollado por el usuario rehan-hehe. El proyecto se centra en el ajuste fino de un modelo AST preentrenado sobre el conjunto de datos DEAM (Database for Emotion Analysis in Music), con el objetivo de realizar regresión sobre las dimensiones emocionales continuas de valencia (lo positiva o negativa que es una emoción) y activación (lo calmada o excitante que resulta). Este enfoque permite modelar emociones en el espacio bidimensional de valencia-activación directamente desde clips de audio.

La relevancia de este modelo radica en que aplica la arquitectura de transformers a la señal de audio convirtiéndola en espectrogramas, tratando el audio como una imagen. El AST fue propuesto por Yuan Gong, Yu-An Chung y James Glass, y logra resultados de última generación en clasificación de audio. Aunque la ficha de HuggingFace es mínima, el repositorio de GitHub asociado documenta el proceso de ajuste fino para la predicción de emociones musicales. La licencia es Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesa audio, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (probablemente PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en el Audio Spectrogram Transformer (AST), que aplica un Vision Transformer (ViT) al audio transformado en espectrogramas. La señal de audio se convierte en una imagen espectral (mel-spectrogram), que se divide en parches y se procesa como tokens en un transformer estándar, con atención multi-cabeza y capas de normalización. Este enfoque se demostró eficaz para tareas de clasificación de audio y, en este caso, se adapta para una tarea de regresión.

El entrenamiento se realiza mediante ajuste fino de un modelo AST preentrenado sobre el conjunto de datos DEAM. La tarea es predecir dos valores continuos (valencia y activación) por cada clip de audio. No se especifican detalles sobre el número de tokens de entrenamiento, el tamaño exacto del modelo ni la composición del dataset en la información disponible. Tampoco se menciona el uso de técnicas como RLHF o DPO.

## Capacidades

- Regresión de emociones musicales en el espacio de valencia-activación a partir de audio.
- Procesamiento de audio directamente, sin transcripción intermedia de texto.
- Ajuste fino sobre el dataset DEAM, que contiene clips musicales con anotaciones emocionales continuas.
- Aplicación de arquitectura de transformer a espectrogramas, lo que permite capturar patrones temporales y frecuenciales.
- Soporte para predicción de dos dimensiones emocionales simultáneamente (valencia y activación).

No se ha documentado soporte para tool calling, agentes o funciones de razonamiento multi-paso, ya que el modelo está diseñado para una tarea específica de análisis de audio.

## Casos de uso

- Sistemas de recomendación musical: el modelo puede predecir la emoción de una canción y usarse para recomendar música que se ajuste al estado de ánimo del usuario. Su capacidad de procesar directamente el audio lo hace adecuado para pipelines de streaming.
- Análisis de contenido en plataformas de streaming: las plataformas pueden usar el modelo para etiquetar automáticamente el contenido musical por emociones, mejorando la categorización y la búsqueda.
- Investigación en psicología de la música: el modelo puede ser utilizado para estudiar la relación entre las características acústicas y las respuestas emocionales, facilitando estudios a gran escala.
- Creación de playlists automáticas: integrado en aplicaciones de reproducción, el modelo puede clasificar canciones y agruparlas en listas de reproducción basadas en estados emocionales.
- **Asistentes de bienestar**: en aplicaciones de salud mental, el modelo puede seleccionar música para terapias de relajación o estimulación según el perfil emocional del usuario.
- **Análisis de contenido en producción**: para empresas de medios, el modelo puede procesar bibliotecas musicales y clasificar emocionalmente el contenido para licencias o marketing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto no proporciona métricas numéricas de rendimiento (como correlación o error absoluto medio) en la model card ni en el repositorio asociado.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo AST base tiene alrededor de 87 millones de parámetros, pero el tamaño exacto del modelo ajustado no se especifica.
- GPU recomendadas: no disponible, aunque un modelo de este tipo puede inferirse en GPUs de consumo como RTX 3060 o superiores.
- Capacidad en GPU de consumo: probablemente sí, dado el tamaño moderado del AST base.
- Opciones de despliegue: no se han documentado. Se puede usar con Hugging Face Transformers para PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la misma tarea (regresión de emociones en audio) en la información proporcionada. Se podría comparar con otros modelos de análisis de audio como Wav2Vec 2.0 o HuBERT, pero no se dispone de datos concretos de rendimiento para este modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La información de la model card es extremadamente limitada: no hay especificaciones técnicas, ni benchmarks, ni documentación de entrenamiento.
- El modelo es específico para la tarea de regresión emocional en música; no es un modelo de propósito general.
- Riesgo de sobreajuste: el ajuste fino sobre DEAM puede no generalizar bien a otros géneros musicales o estilos fuera del dataset.
- Sesgos culturales: las emociones musicales son subjetivas y dependientes de la cultura; el modelo puede reflejar los sesgos de las anotaciones de DEAM, que provienen de un grupo de anotadores limitado.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de precisión o idoneidad para producción.
- No se documentan limitaciones de contexto o idioma, pero al procesar audio, el idioma no es relevante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rehan-hehe/ast-model
- Repositorio de GitHub: https://github.com/rehan-hehe/Music-Emotion-Recognition-AST-DEAM-
- Documentación de AST en Hugging Face: https://huggingface.co/docs/transformers/en/model_doc/audio-spectrogram-transformer
- Artículo de referencia de AST: https://www.nature.com/articles/s41598-025-89533-9 (aunque este enlace se refiere a un estudio relacionado con AST en clasificación de sibilancias, no directamente con este modelo)
