# duclvQ/smad

## Resumen

SMAD CRNN es un modelo de clasificación de audio desarrollado por duclvQ (Le Viet Duc) que distingue entre voz hablada, voz cantada, música y ausencia de voz en clips de audio. Con solo 834.884 parámetros, este modelo ligero etiqueta ventanas de 4 segundos en una de cuatro categorías: voz hablada sobre ruido, voz hablada sobre música, voz cantada sobre música y sin voz. Su principal aportación es separar la voz cantada de la voz hablada cuando ambas aparecen sobre un fondo musical, una distinción que la mayoría de los segmentadores de habla/música no realizan.

El modelo se entrena desde cero sobre espectrogramas log-mel, sin usar backbones preentrenados ni fine-tuning, y funciona en CPU sin problemas. Está publicado bajo licencia MIT y su implementación se basa en Transformers con código personalizado (`trust_remote_code=True`). Su tamaño reducido y su enfoque específico lo hacen adecuado para tareas de enrutamiento de letras/diálogos, control de calidad de doblaje y clasificación de vídeos musicales frente a entrevistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRNN (red convolucional recurrente) sobre log-mel spectrograms |
| Parametros totales | 834.884 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4 segundos de audio (ventana fija a 16 kHz, mono) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, vi (etiquetas de metadatos; el audio no es dependiente del idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura CRNN (Convolutional Recurrent Neural Network) que procesa espectrogramas log-mel de clips de 4 segundos muestreados a 16 kHz en mono. Las capas convolucionales extraen características locales del espectrograma y una capa recurrente modela las dependencias temporales, seguida de una capa de clasificación con 4 salidas. El entrenamiento se realizó desde cero, sin utilizar ningún backbone preentrenado ni etapa de fine-tuning, sobre un dataset sintético con fuentes disjuntas (ningún hablante, canción o archivo de ruido aparece tanto en entrenamiento como en test). El modelo incluye un parámetro `temperature` (0.7095) que se divide de los logits antes del softmax para obtener probabilidades calibradas.

No se dispone de información detallada sobre el número total de clips de entrenamiento, la composición exacta del dataset ni las técnicas de aumento de datos empleadas. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación, al tratarse de un modelo discriminativo de audio.

## Capacidades

- Clasificación de audio en 4 categorías: `speech_noise` (voz hablada sobre ruido/ambiente/silencio), `speech_music` (voz hablada sobre base musical), `singing_music` (voz cantada con letra sobre música) y `none` (sin voz humana: música instrumental, ruido o silencio).
- Discriminación habla/música/canto en ventanas de 4 segundos, con salida de probabilidades calibradas por temperatura.
- Procesamiento de audio de cualquier duración mediante una función auxiliar de ventana deslizante con suavizado por mediana temporal (parámetro `smooth_windows`) que reduce los cambios de etiqueta aislados.
- Segmentación temporal con límites cuantizados al paso de ventana configurable (`hop_seconds`), devolviendo segmentos etiquetados con su confianza media.
- Inferencia en CPU: el modelo de 834k parámetros no requiere GPU.
- Integración con el ecosistema Transformers mediante `AutoFeatureExtractor` y `AutoModelForAudioClassification` con `trust_remote_code=True`.
- Demo interactiva disponible en Hugging Face Spaces para probar el modelo con archivos de audio propios.

## Casos de uso

- Control de calidad de doblaje: detectar automáticamente segmentos donde un actor habla sobre una base musical frente a donde canta, permitiendo validar que las pistas de diálogo y canto se han mezclado correctamente en una producción audiovisual.
- Enrutamiento de letras y diálogos: en plataformas de karaoke o subtitulado, separar las secciones cantadas (que requieren letras sincronizadas) de las habladas (que requieren transcripción), mejorando la precisión del etiquetado automático.
- Clasificación de vídeos musicales frente a entrevistas: analizar la proporción de tiempo con voz cantada frente a voz hablada en un vídeo para categorizarlo automáticamente como MV o entrevista, útil en sistemas de recomendación y moderación de contenido.
- Segmentación de podcasts y programas de radio: identificar cuándo un locutor habla sobre una sintonía musical frente a cuándo se reproduce música sin voz, permitiendo generar marcadores de capítulos o resúmenes automáticos.
- Monitorización de emisiones broadcast: detectar en tiempo real si una emisora está reproduciendo música instrumental, voz sobre música o voz sola, útil para sistemas de cumplimiento de derechos de autor y análisis de parrilla.
- Análisis de contenido generado por usuarios: en plataformas de vídeo corto, distinguir automáticamente entre vídeos con voz cantada (covers, lipsync) y vídeos con voz hablada (tutoriales, vlogs), facilitando la moderación y el etiquetado temático.

## Benchmarks y rendimiento

El autor declara los siguientes resultados sobre un conjunto de test sintético de 4.000 clips (1.000 por clase), con fuentes disjuntas del entrenamiento. El azar se sitúa en un 25% de precisión.

| Metrica | Valor |
|---|---|
| Accuracy | 0.8795 |
| Macro F1 | 0.8791 |

No se han publicado resultados comparativos con otros modelos de segmentación habla/música en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo tiene 834.884 parámetros, por lo que puede ejecutarse en cualquier procesador moderno sin necesidad de GPU. La carga de un clip de 4 segundos se procesa en milisegundos.
- VRAM: no requiere VRAM dedicada; en GPU, el uso de memoria es inferior a 100 MB.
- GPUs recomendadas: cualquier GPU con al menos 1 GB de VRAM (incluso integradas) es suficiente; el modelo no está optimizado para GPU y su ventaja principal es la portabilidad.
- Opciones de despliegue: Transformers con PyTorch, exportación a ONNX posible, integración en pipelines de Python. No se menciona compatibilidad con vLLM, llama.cpp u Ollama (modelos de audio no generativos).
- Latencia: no se han publicado mediciones formales, pero por el tamaño del modelo se estima una latencia por ventana de 4 segundos inferior a 50 ms en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (discriminación habla/música/canto con parámetros similares). Los segmentadores de habla/música convencionales (como los basados en YAMNet o VGGish) suelen tener más parámetros y no distinguen entre voz hablada y cantada sobre música. No se puede establecer una comparativa cuantitativa sin datos adicionales.

## Limitaciones y advertencias

- La unidad de decisión es una ventana fija de 4 segundos; los límites de los segmentos devueltos por la función de análisis tienen una precisión máxima de una ventana (4 segundos), no son precisos a nivel de frame.
- El modelo fue entrenado con datos sintéticos; el rendimiento en audio real del mundo puede degradarse, especialmente en condiciones de mezcla complejas o con efectos de producción (reverb, compresión, etc.).
- Los errores más comunes son cambios de etiqueta aislados en ventanas individuales (por ejemplo, un golpe de batería interpretado como `none`); el suavizado por mediana mitiga este efecto pero puede eliminar transiciones rápidas legítimas.
- La clasificación se limita a 4 categorías; no distingue entre tipos de música, número de voces, ni detecta voz susurrada o efectos vocales procesados.
- No se han evaluado sesgos por idioma o acento; aunque el audio no depende del idioma, los datos de entrenamiento pueden estar sesgados hacia ciertas características acústicas.
- El modelo no es un modelo de lenguaje ni de generación; solo produce etiquetas de clasificación por ventana.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías de rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/duclvQ/smad
- Demo interactiva: https://huggingface.co/spaces/duclvQ/smad-demo
- Repositorio relacionado (audio-classifier): https://huggingface.co/duclvQ/smad-audio-classifier
- Perfil de GitHub del autor: https://github.com/duclvQ/
