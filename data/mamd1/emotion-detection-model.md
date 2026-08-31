# Mamd1/emotion-detection-model

## Resumen

El modelo `Mamd1/emotion-detection-model` es un clasificador de emociones faciales basado en visión por computador. Desarrollado originalmente por Ali Ahmed y redistribuido por Mamd1 bajo licencia Apache-2.0, detecta siete emociones básicas (enfado, asco, miedo, felicidad, neutral, tristeza y sorpresa) a partir de una imagen de un rostro recortado. Utiliza un backbone EfficientNetV2-S preentrenado en ImageNet con una cabeza de clasificación personalizada, y se distribuye en formato Keras 3 (`.keras`). Con aproximadamente 21 millones de parámetros y una entrada de 380x380 píxeles, el modelo está diseñado para aplicaciones de análisis de expresiones faciales en tiempo real o por lotes. Su relevancia radica en que ofrece un equilibrio entre precisión y eficiencia computacional, siendo adecuado para entornos con recursos moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S (backbone) + cabeza personalizada (GlobalAveragePooling2D → BatchNorm → Dropout → Dense(512) → BatchNorm → Dropout → Dense(7)) |
| Parametros totales | ~21 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (se distribuye en float32) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache-2.0 |
| Formato de pesos | Keras 3 (`.keras`), ~343 MB |

## Arquitectura y entrenamiento

El modelo emplea EfficientNetV2-S como extractor de características, preentrenado en ImageNet. La cabeza de clasificación añade capas de pooling global, normalización por lotes, dropout y dos capas densas (512 y 7 neuronas). La entrada es una imagen RGB de 380x380 píxeles con valores en `[0, 255]`; el preprocesado recomendado incluye convertir a escala de grises y volver a RGB (canales idénticos) antes de redimensionar. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de épocas, ni el uso de técnicas como RLHF o DPO. El modelo se distribuye como pesos preentrenados sin información adicional sobre el proceso de optimización.

## Capacidades

- Clasificación de emociones faciales en 7 categorías: enfado, asco, miedo, felicidad, neutral, tristeza y sorpresa.
- Salida de probabilidades por clase, permitiendo umbrales personalizados o análisis de confianza.
- Entrada de imagen de rostro recortado; el rendimiento se degrada con planos amplios o fondos complejos.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de texto.
- No es multilingüe (no procesa lenguaje natural).
- Capacidad especial: detección de expresiones faciales en imágenes estáticas.

## Casos de uso

- Análisis de reacciones en encuestas de satisfacción: se puede integrar en un pipeline que capture el rostro del usuario durante una encuesta y clasifique su expresión para inferir el estado emocional asociado a la respuesta.
- Monitorización de audiencia en publicidad: procesar vídeos o fotos de espectadores para medir la atención y la emoción generada por un anuncio, ayudando a optimizar campañas.
- Asistencia en investigación psicológica: clasificar expresiones en estudios observacionales donde se requiera anotación automática de emociones, siempre con supervisión humana.
- Filtrado de contenido en aplicaciones de fotografía: detectar si una foto contiene una expresión de felicidad o sorpresa para organizar álbumes automáticamente.
- Sistemas de atención al cliente con vídeo: analizar la expresión del cliente durante una videollamada para ofrecer soporte adaptado, aunque con las limitaciones éticas indicadas.
- Juegos y entretenimiento interactivo: adaptar la dificultad o la narrativa de un juego según la emoción del jugador capturada por la cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como exactitud, F1 o comparaciones con otros modelos en conjuntos de referencia (p. ej., FER+ o AffectNet).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB (el modelo tiene ~21M parámetros en float32, ~84 MB de pesos; la activación para una entrada de 380x380 es moderada).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060) o incluso CPU para inferencia por lotes pequeña.
- Cabe en GPUs de consumo: sí, en la mayoría de las GPUs modernas de gama media.
- Opciones de despliegue: TensorFlow/Keras nativo, TensorFlow Serving, o conversión a TFLite para dispositivos móviles. No se mencionan integraciones con vLLM, llama.cpp u Ollama (no aplicable a modelos de visión).
- Latencia y throughput: no disponibles; dependerán del hardware y del tamaño de lote.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación de emociones faciales con EfficientNetV2) dentro de los datos proporcionados. Se recomienda consultar el Hub de Hugging Face para alternativas como `iimran/EmotionDetection` (basado en BERT para texto, no comparable) u otros modelos de visión.

## Limitaciones y advertencias

- Entrenado exclusivamente con rostros recortados; imágenes con planos amplios, caras pequeñas o fondos complejos reducen significativamente la precisión.
- La expresión facial no es una medida fiable del estado emocional interno de una persona; no debe usarse para decisiones consecuentes (contratación, seguridad, evaluación médica o psicológica).
- La precisión varía entre grupos demográficos y condiciones de iluminación, lo que puede introducir sesgos.
- No se proporcionan datos sobre el conjunto de entrenamiento, por lo que no es posible evaluar la representatividad de las clases.
- Licencia Apache-2.0 permite uso comercial y modificación, pero exige preservar la atribución original (no eliminar el aviso de redistribución).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mamd1/emotion-detection-model
- Demo Space: https://huggingface.co/spaces/Mamd1/emotion-detection-app (mencionado en la model card, no verificado)
- Repositorio original (redistribuido): `ali-ahmed-ai-developer/emotion_detection_model` en Hugging Face (referenciado en la model card)
