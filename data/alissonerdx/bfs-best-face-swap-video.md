# Alissonerdx/BFS-Best-Face-Swap-Video

## Resumen

BFS-Best-Face-Swap-Video es una LoRA (Low-Rank Adaptation) desarrollada por Alissonerdx para realizar intercambio de caras (face swap) en vídeo de alta fidelidad. Se apoya en los modelos base LTX-2.3 y LTX-2.5 de Lightricks, y se distribuye como un adaptador para el pipeline de image-to-video de la librería diffusers. El modelo está diseñado para entornos profesionales de VFX, investigación de identidad digital y prototipado cinematográfico, permitiendo sustituir la identidad facial de un sujeto en un clip manteniendo el movimiento y la iluminación del vídeo original.

La técnica principal documentada es el "Frame 0 Anchoring Technique" (anclaje en el primer fotograma), que fija la identidad de la persona en el frame inicial y propaga esa identidad a lo largo de la secuencia generada. En la versión V3 se introduce un flujo de trabajo con plantilla persistente (persistent-template workflow) que mejora la consistencia temporal. El repositorio tiene un tamaño de 23,6 GB, lo que sugiere que incluye pesos de LoRA y posiblemente ejemplos de vídeo, aunque no se especifica el número de parámetros del adaptador.

La licencia es la ltx-2-community-license-agreement, que impone condiciones de uso comunitario y restricciones comerciales no detalladas en la documentación disponible. El modelo se publicó el 24 de enero de 2026 y se actualizó el 24 de agosto de 2026, con 222 descargas y 393 likes en Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre LTX-2.3 y LTX-2.5 (Lightricks), pipeline image-to-video |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo, sin procesamiento de texto) |
| Licencia | ltx-2-community-license-agreement |
| Formato de pesos | no disponible (presumiblemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

El modelo es una LoRA (Low-Rank Adaptation) que se aplica sobre los modelos de difusión de vídeo LTX-2.3 y LTX-2.5 de Lightricks. Al ser un adaptador, no modifica la arquitectura base, sino que introduce matrices de bajo rango que ajustan los pesos del modelo preentrenado para la tarea específica de intercambio de caras. El pipeline es image-to-video: se proporciona una imagen inicial (frame 0) que define la identidad objetivo y un vídeo guía que aporta el movimiento; el modelo genera un nuevo vídeo donde la cara del sujeto original se sustituye por la del frame 0, conservando la dinámica y la iluminación del clip de entrada.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o pasos de optimización, ni si se emplearon técnicas como RLHF o DPO. La documentación menciona dos flujos de trabajo: el "Frame 0 Anchoring Technique" para la versión V1 y el "persistent-template workflow" para la V3, que mejora la consistencia temporal mediante una plantilla persistente de identidad. Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Intercambio de caras en vídeo de alta fidelidad, preservando la identidad del frame inicial.
- Mantenimiento del movimiento y la iluminación del vídeo guía.
- Soporte para image-to-video (generación a partir de una imagen) y video-to-video (transformación de un clip existente).
- Compatibilidad con los modelos base LTX-2.3 y LTX-2.5 de Lightricks.
- Técnica de anclaje en el frame 0 para fijar la identidad.
- Flujo de trabajo con plantilla persistente en la versión V3 para mayor consistencia temporal.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de texto.

## Casos de uso

- VFX cinematográfico: sustitución de un actor en escenas ya rodadas. El modelo permite reemplazar la cara de un intérprete por la de otro manteniendo la actuación original, lo que resulta útil para reshoots o cambios de casting sin volver a grabar.
- Investigación de identidad digital: estudio de cómo se percibe la identidad en medios sintéticos. Los investigadores pueden generar vídeos con identidades alteradas para analizar sesgos perceptivos o validar sistemas de detección de deepfakes.
- Prototipado de casting: probar diferentes actores en un mismo clip publicitario o cinematográfico. Se genera un vídeo con la cara de cada candidato sobre la misma base de movimiento para comparar rápidamente.
- Doblaje y localización: reemplazar la cara de un actor en versiones dobladas de una película o serie, de modo que la sincronía labial coincida con el nuevo idioma.
- Restauración de material de archivo: sustituir caras en vídeos históricos o dañados para mejorar su calidad o actualizar la apariencia de personajes.
- Publicidad personalizada: crear anuncios donde la cara del cliente (con consentimiento explícito) se inserta en un vídeo promocional, manteniendo el movimiento y la iluminación del spot original.
- Desarrollo de juegos y animación: generar cinemáticas con caras realistas de actores o personajes, partiendo de un vídeo guía y una imagen de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas de calidad de vídeo (FVD, SSIM, LPIPS), precisión de identidad (cosine similarity) ni comparativas con otros modelos de face swap.

## Requisitos de hardware

- Tamaño del repositorio: 23,6 GB (pesos de LoRA y ejemplos de vídeo).
- VRAM estimada: no disponible. Al ser una LoRA sobre LTX-2.3/2.5, la VRAM necesaria depende del modelo base, que no se especifica en la documentación.
- GPU recomendadas: no disponible. Se recomienda consultar los requisitos de LTX-2.3 y LTX-2.5 en sus respectivas fichas de Hugging Face.
- Compatibilidad con GPU de consumo: no confirmado. Dado el tamaño del modelo base, es probable que se requiera una GPU con al menos 16-24 GB de VRAM, pero no hay datos oficiales.
- Opciones de despliegue: al usar la librería diffusers, se puede integrar con pipelines de Python. No se mencionan soportes para vLLM, llama.cpp, Ollama ni TGI, que son específicos de modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen alternativas en el ámbito del face swap en vídeo (por ejemplo, SimSwap, FaceSwap, o adaptaciones sobre modelos de difusión), pero no se han encontrado datos concretos para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- La model card incluye un aviso ético explícito: el uso requiere consentimiento legal y derechos sobre la imagen de cualquier persona procesada. El autor declina toda responsabilidad por uso indebido.
- Riesgo de uso para deepfakes malintencionados, suplantación de identidad o desinformación.
- No se documentan sesgos conocidos, pero al ser un modelo de generación de vídeo, puede heredar sesgos de los datos de entrenamiento de LTX-2.3/2.5.
- La licencia ltx-2-community-license-agreement puede imponer restricciones de uso comercial; se recomienda revisar sus términos antes de desplegar en producción.
- No se especifican limitaciones de contexto ni de idioma, al ser un modelo de vídeo sin procesamiento de texto.
- No hay información sobre la robustez ante oclusiones, cambios de iluminación extremos o ángulos de cámara poco habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video
- Modelo relacionado (face swap en imágenes): https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap
- Vídeo de demostración del flujo V3: https://www.youtube.com/watch?v=HBp03iu7wLA
