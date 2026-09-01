# glennwuwu/seer

## Resumen

Seer es un modelo de clasificación de imágenes diseñado para detectar imágenes generadas por inteligencia artificial. Ha sido desarrollado por Glenn Wu (glennwuwu) como parte de su participación en el concurso TikTok TechJam 2026. El modelo se basa en la arquitectura DINOv3 ViT-L, con aproximadamente 302 millones de parámetros, y se distribuye como un checkpoint de entrenamiento en formato PyTorch (`best.pt`).

La relevancia de Seer radica en la creciente necesidad de herramientas forenses digitales capaces de distinguir entre contenido visual auténtico y sintético, un problema crítico en contextos de desinformación, verificación de medios y moderación de plataformas. Aunque el modelo se presenta como un proyecto de competición, su base en DINOv3, un modelo de visión de última generación, sugiere un buen potencial de representación para la tarea. La información pública disponible es limitada, por lo que esta ficha se basa exclusivamente en los datos proporcionados en la model card y en el repositorio de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-L (vision transformer) |
| Parametros totales | ~302 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

Seer emplea una arquitectura de vision transformer (ViT) de tamaño grande (ViT-L) basada en el framework DINOv3, un modelo de auto-supervisión para representaciones visuales. El checkpoint `best.pt` corresponde a la ejecución de entrenamiento denominada `seer_vitl`, orientada a la clasificación de imágenes para distinguir entre contenido generado por IA y contenido real. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de épocas, la estrategia de aumento de datos ni si se aplicaron técnicas de ajuste fino adicionales. Tampoco se especifica si se utilizó algún método de alineación o refuerzo, dado que se trata de una tarea de clasificación supervisada. La información disponible no permite profundizar en innovaciones técnicas específicas más allá de la elección de DINOv3 como base.

## Capacidades

- Detección de imágenes generadas por inteligencia artificial: el modelo está entrenado para clasificar imágenes como reales o sintéticas, una tarea de clasificación binaria (o posiblemente multiclase, aunque no se especifica).
- Representaciones visuales robustas: al basarse en DINOv3, el modelo hereda capacidades de extracción de características visuales de alta calidad, útiles para tareas de forensia digital.
- Inferencia sobre imágenes individuales: el pipeline declarado es `image-classification`, lo que indica que procesa imágenes completas y devuelve una etiqueta de clase.
- No se mencionan capacidades de generación de texto, tool calling, agentes, razonamiento multimodal ni soporte de audio.

## Casos de uso

- Moderación de contenido en plataformas sociales: Seer puede integrarse en pipelines de moderación para identificar automáticamente imágenes generadas por IA que puedan violar políticas de autenticidad o desinformación. Su naturaleza ligera (302M parámetros) permite su despliegue en servicios de clasificación en tiempo real.
- Verificación de medios periodísticos: agencias de noticias y verificadores de datos pueden utilizar Seer como una primera capa de filtrado para detectar imágenes sintéticas en noticias o redes sociales, reduciendo el trabajo manual de análisis forense.
- Auditoría de campañas publicitarias: marcas y agencias pueden emplear el modelo para comprobar si las imágenes utilizadas en anuncios o materiales de marketing han sido generadas por IA, garantizando transparencia ante los consumidores.
- Investigación académica en forensia digital: investigadores pueden usar Seer como punto de partida para estudiar la detectabilidad de imágenes sintéticas, comparando su rendimiento con otros detectores o fine-tuning sobre conjuntos de datos específicos.
- Protección de propiedad intelectual: plataformas de contenido generado por usuarios pueden usar Seer para identificar imágenes sintéticas que infrinjan derechos de autor o que se hagan pasar por obras originales.
- Control de calidad en generación de contenido: empresas que producen imágenes con IA pueden emplear Seer internamente para validar que sus propias salidas sean reconocibles como sintéticas, cumpliendo normativas de etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión, recall, F1 u otras métricas en conjuntos de referencia como CIFAR-10, ImageNet o datasets específicos de detección de imágenes generadas por IA (p. ej., GenImage, CocoGlide). Tampoco se ofrecen comparativas con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no se proporcionan datos oficiales. Para un ViT-L de ~302M parámetros, una estimación orientativa sería de 2-4 GB en FP32, reducible a 1-2 GB con cuantización a FP16 o INT8 (si se aplicara). Sin embargo, al no existir versiones cuantizadas publicadas, se recomienda asumir FP32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 2060) podría ejecutar inferencia básica. Para entrenamiento o fine-tuning, se necesitaría una GPU con mayor memoria, como RTX 3090 o A100.
- Compatibilidad con GPU de consumo: sí, el tamaño del modelo permite su ejecución en GPUs de consumo medio, aunque no se han publicado pruebas de rendimiento.
- Opciones de despliegue: al ser un checkpoint de PyTorch, puede cargarse con la librería `transformers` (si se adapta) o directamente con PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que son específicas para modelos de lenguaje. Para despliegue en producción, sería necesario convertir el modelo a un formato optimizado (ONNX, TensorRT) o usar un framework de inferencia como TorchServe.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre comparativas con otros detectores de imágenes generadas por IA. Existen modelos comerciales y académicos como los detectores de OpenAI, el clasificador de imágenes sintéticas de Hugging Face (por ejemplo, `umm-maybe/AI-image-detector`) o soluciones basadas en CLIP, pero no hay datos públicos que permitan una comparación cuantitativa con Seer. Por tanto, esta sección queda sin datos.

## Limitaciones y advertencias

- Información limitada: la model card es extremadamente escueta; no se detallan el conjunto de datos de entrenamiento, las métricas de rendimiento ni las condiciones de uso específicas. Esto dificulta evaluar su fiabilidad en entornos de producción.
- Sesgos potenciales: al no conocerse la composición del dataset de entrenamiento, es posible que el modelo presente sesgos hacia ciertos tipos de imágenes (p. ej., rostros, paisajes) o hacia determinados generadores de IA, lo que podría afectar su generalización.
- Riesgo de falsos positivos/negativos: como cualquier detector de imágenes sintéticas, Seer puede fallar ante imágenes generadas por modelos avanzados o ante manipulaciones sutiles. Sin métricas publicadas, no se puede cuantificar este riesgo.
- Formato de checkpoint: el archivo `best.pt` es un checkpoint de entrenamiento, no un modelo listo para producción. Requiere código adicional para cargarlo y ejecutarlo (el autor menciona un script `main.py` que no se incluye en el repositorio).
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento ni soporte técnico.
- Sin soporte de contexto largo ni multimodalidad: el modelo solo procesa imágenes, no texto ni audio, y no está diseñado para tareas de razonamiento complejo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glennwuwu/seer
- Discusiones del modelo: https://huggingface.co/glennwuwu/seer/discussions
- Perfil del autor en Hugging Face: https://huggingface.co/glennwuwu
- Perfil de GitHub del autor: https://github.com/wuglenn/
