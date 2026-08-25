# skblv/gemma-3-27b-it-lora-pitvis-instruments

## Resumen

El modelo `skblv/gemma-3-27b-it-lora-pitvis-instruments` es un adaptador LoRA sobre el modelo multimodal `google/gemma-3-27b-it`, desarrollado por el usuario `skblv` para la detección de instrumentos quirúrgicos en vídeo de cirugía endoscópica de hipófisis. Se trata de un modelo de clasificación de imágenes multi-etiqueta (18 categorías de instrumentos) entrenado sobre el conjunto de datos PitVis-2023. El adaptador se combina con una cabeza de clasificación lineal adicional (`classifier.pt`) que permite asignar probabilidades de presencia por cada instrumento en cada fotograma.

La relevancia de este modelo radica en que aborda un problema específico del ámbito médico: la anotación automática de instrumentos en vídeo quirúrgico, un paso previo para sistemas de asistencia en tiempo real o para la generación de informes quirúrgicos. Al estar basado en Gemma 3 27B, hereda la arquitectura de transformer multimodal de Google, aunque el uso práctico aquí es puramente visual. El tamaño del repositorio es de 1,2 GB, lo que corresponde al adaptador LoRA y al clasificador, no al modelo base completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base: Gemma 3 27B it) con adaptador LoRA y cabeza de clasificación lineal de 18 clases |
| Parametros totales | No disponible (el adaptador LoRA y la cabeza lineal son pequeños; el modelo base tiene 27B de parámetros) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 128k tokens (modelo base) – no aplica para la tarea de clasificación de imágenes |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Gemma (modelo base) |
| Formato de pesos | safetensors (adapter_model.safetensors) y PyTorch (classifier.pt) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=128, alpha=256) aplicado a la parte de visión y lenguaje de Gemma 3 27B it. Sobre el adaptador se añade una cabeza de clasificación lineal que produce una salida de 18 etiquetas binarias (presencia de cada instrumento). El entrenamiento se realizó sobre 84.666 fotogramas de entrenamiento y se validó con 30.896 fotogramas del conjunto de validación de PitVis-2023. Se emplearon 10 épocas, una tasa de aprendizaje de 5e-6, tamaño de lote efectivo de 2 y semilla 42. No se menciona el uso de RLHF ni DPO; se trata de un ajuste fino supervisado clásico para clasificación de imágenes.

## Capacidades

- Clasificación multi-etiqueta de imágenes: detecta simultáneamente la presencia de 18 instrumentos quirúrgicos en fotogramas de vídeo endoscópico.
- Análisis de vídeo quirúrgico: procesa fotogramas individuales y puede integrarse en pipelines de análisis temporal.
- Especialización en dominio médico: entrenado específicamente en cirugía de hipófisis endoscópica (PitVis-2023).
- No soporta generación de texto, razonamiento, tool calling ni capacidades de agente. Es un modelo de clasificación de imágenes puro.
- Capacidades multilingües: no aplica, la entrada es visual.

## Casos de uso

- Anotación automática de instrumentos en vídeos de cirugía endoscópica: el modelo puede etiquetar cada fotograma con la lista de instrumentos presentes, facilitando la creación de bases de datos de entrenamiento para otros sistemas.
- Asistencia en tiempo real durante intervenciones quirúrgicas: al integrarse con un sistema de captura de vídeo, puede mostrar en una interfaz los instrumentos detectados en cada momento, ayudando al equipo médico a verificar el inventario.
- Control de calidad en registros quirúrgicos: permite verificar que los instrumentos mencionados en un informe coinciden con los realmente visibles en el vídeo.
- Investigación en análisis de vídeo quirúrgico: sirve como línea base (baseline) para comparar nuevos métodos de detección de instrumentos, como se indica en el leaderboard de SDSC × Chicago Booth.
- Entrenamiento de modelos de subtitulado o resumen quirúrgico: la salida de detección puede combinarse con modelos de lenguaje para generar descripciones automáticas de los pasos de la cirugía.
- Validación de protocolos de esterilización: detectar qué instrumentos aparecen en cada fase de la operación para verificar el cumplimiento de protocolos.

## Benchmarks y rendimiento

El modelo reporta resultados en la división de validación completa de PitVis-2023, con intervalos de confianza al 95% (bootstrap):

| Métrica | Valor |
|---|---|
| Exact match | 84,77 % (84,36–85,16) |
| Micro-F1 | 85,65 % (85,23–86,05) |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Gemma 3 27B requiere aproximadamente 54 GB en fp16 (27B × 2 bytes). Con el adaptador LoRA y la cabeza de clasificación, la inferencia de una imagen puede ejecutarse en GPUs con al menos 24 GB (por ejemplo, RTX 3090/4090) usando cuantización o offloading, aunque no se especifica el método.
- GPU recomendadas: A100 (40 GB), H100 (80 GB) para producción; RTX 4090 (24 GB) es viable con cuantización o reducción de batch.
- En consumer GPU: posible con cuantización GGUF o usando vLLM con adaptadores LoRA, pero no se ha probado ni documentado.
- Opciones de despliegue: se puede usar con la librería PEFT de Hugging Face para cargar el adaptador sobre el modelo base, y con bibliotecas de inferencia como vLLM o TGI para servir el modelo. Para clasificación de imágenes, se recomienda usar el pipeline de `image-classification` de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (detección de instrumentos quirúrgicos en vídeo) dentro de la documentación proporcionada. No obstante, el modelo se enmarca en el leaderboard de SDSC × Chicago Booth, donde se comparan distintos enfoques de comprensión de vídeo quirúrgico, pero no se proporcionan datos de otros modelos.

## Limitaciones y advertencias

- Modelo de investigación, no es un dispositivo médico. No debe usarse para decisiones clínicas sin supervisión humana.
- Está entrenado exclusivamente en vídeos de cirugía de hipótisis; puede no generalizar a otros tipos de cirugía o entornos endoscópicos.
- La detección es de presencia de instrumentos, no de segmentación ni localización espacial.
- Depende del modelo base Gemma 3 27B it, que tiene una licencia propia (Gemma) con términos de uso; consultar la licencia para uso comercial.
- El adaptador y la cabeza están disponibles en formato safetensors, pero se necesita el modelo base para la inferencia completa.
- No se han publicado análisis de sesgos o errores en casos específicos (por ejemplo, instrumentos poco frecuentes o condiciones de iluminación variables).

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/skblv/gemma-3-27b-it-lora-pitvis-instruments)
- [Modelo base google/gemma-3-27b-it](https://huggingface.co/google/gemma-3-27b-it)
- [Leaderboard de comprensión de vídeo quirúrgico SDSC × Chicago Booth](https://github.com/skblv/neurosurgery-video-eval-website)
- [Dataset PitVis-2023](https://rdr.ucl.ac.uk/articles/dataset/PitVis_Challenge_Endoscopic_Pituitary_Surgery_videos/26531686)
