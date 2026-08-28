# DAS-DeepAudioSegmenter/perch2-torch

## Resumen

El modelo `perch2-torch` es una implementación en PyTorch del modelo PERCH 2.0, desarrollado por el laboratorio de Jan Clemens (janclemenslab) y publicado en Hugging Face bajo el identificador `DAS-DeepAudioSegmenter/perch2-torch`. PERCH 2.0 es un modelo preentrenado para bioacústica, capaz de clasificar vocalizaciones de miles de especies (principalmente aves, pero también otros taxones) y de generar embeddings de audio de 1536 dimensiones útiles para transferencia de aprendizaje. El modelo se basa en una arquitectura EfficientNet-B3, procesa audio mono a 32 kHz en ventanas de 5 segundos y produce logits no calibrados para 14795 clases. Su relevancia radica en que ofrece una solución de código abierto (licencia Apache-2.0) para tareas de monitoreo de biodiversidad y análisis acústico, con un rendimiento competitivo según el paper original. El repositorio incluye el código de conversión, un notebook de demostración y un comando de verificación, lo que facilita su integración en proyectos de investigación y aplicaciones prácticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B3 (basado en el checkpoint `wrice/perch-v2-efficientnet-b3`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (audio: ventana de 5 segundos a 32 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (audio) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (archivo `.pt`) |

## Arquitectura y entrenamiento

El modelo es una implementación en PyTorch del PERCH 2.0, que originalmente fue entrenado con TensorFlow y convertido a ONNX y luego a PyTorch. La arquitectura subyacente es EfficientNet-B3, una red convolucional eficiente que procesa espectrogramas log-mel generados a partir de la forma de onda de entrada. Según el paper "Perch 2.0: The Bittern Lesson for Bioacoustics" (arXiv:2508.04665), el modelo fue entrenado de forma supervisada con auto-destilación sobre un dataset multi-taxa que incluye aves y otros grupos animales. El entrenamiento se realizó con datos de audio de campo, y el modelo produce dos salidas principales: un embedding global de 1536 dimensiones y logits de clasificación para 14795 clases de vocalizaciones. La implementación en PyTorch mantiene la misma funcionalidad, procesando audio de duración arbitraria mediante ventanas superpuestas y pooling.

## Capacidades

- Clasificación de vocalizaciones de especies: el modelo asigna logits a 14795 clases de vocalizaciones, cubriendo aves y otros taxones.
- Generación de embeddings de audio: produce un embedding global de 1536 dimensiones (`embedding`) y un embedding espacial sin pooling (`spatial_embedding`) de forma `(batch, time, frequency, 1536)`.
- Procesamiento de audio de duración variable: acepta waveforms mono de 32 kHz con forma `(time,)` o `(batch, time)`, y para audio más largo de 5 segundos aplica ventanas superpuestas y pooling.
- Salida de espectrograma log-mel: el modelo también devuelve el espectrograma log-mel calculado internamente.
- Transferencia de aprendizaje: los embeddings pueden usarse como características para entrenar clasificadores personalizados en nuevas tareas bioacústicas.
- Integración sencilla: se carga mediante `torch.hub.load` y no requiere dependencias adicionales más allá de PyTorch.

## Casos de uso

- Monitoreo de biodiversidad: el modelo puede analizar grabaciones de campo para detectar y clasificar especies de aves y otros animales, facilitando censos automáticos en ecosistemas naturales. Su ventana de 5 segundos y el pooling permiten procesar largas grabaciones de forma eficiente.
- Estudios de comportamiento animal: los embeddings de 1536 dimensiones pueden usarse para agrupar vocalizaciones similares, identificar patrones de llamada o estudiar variaciones dialectales entre poblaciones.
- Detección de especies invasoras: al clasificar vocalizaciones, el modelo puede alertar sobre la presencia de especies no nativas en áreas de interés, ayudando en programas de control.
- Análisis de impacto ambiental: en proyectos de evaluación de impacto, el modelo puede procesar grabaciones acústicas pasivas para comparar la riqueza de especies antes y después de intervenciones humanas.
- Creación de datasets etiquetados: los logits no calibrados pueden usarse como pseudo-etiquetas para acelerar la anotación manual de grandes colecciones de audio, reduciendo el esfuerzo humano.
- Investigación en bioacústica: los embeddings sirven como características de entrada para modelos de clasificación más complejos, como redes neuronales recurrentes o transformadores, en tareas de detección de eventos acústicos específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original (arXiv:2508.04665) reporta métricas de rendimiento, pero no se incluyen en la model card ni en los resultados de búsqueda proporcionados. Se recomienda consultar el paper para obtener datos comparativos.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM en la documentación del modelo.
- El tamaño del repositorio es de 0.4 GB, lo que sugiere que el modelo es relativamente ligero (EfficientNet-B3 tiene aproximadamente 12 millones de parámetros, aunque no se confirma).
- Dado su tamaño, es probable que pueda ejecutarse en GPUs consumer con al menos 4 GB de VRAM, pero no hay datos oficiales.
- Para inferencia en CPU, el modelo también podría funcionar, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede integrarse con frameworks como vLLM (aunque no está optimizado para texto), o usarse directamente con PyTorch en scripts personalizados. No se mencionan integraciones con llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo PERCH original (cgeorgiaw/Perch) es un predecesor, pero no se tienen datos de comparación. Se recomienda consultar el paper para ver comparativas con otros modelos bioacústicos.

## Limitaciones y advertencias

- Los logits de clasificación no están calibrados; el autor recomienda calibrar umbrales para los datos objetivo antes de usar las predicciones en producción.
- El modelo está entrenado específicamente para vocalizaciones animales; su rendimiento en otros tipos de audio (música, habla humana) no está garantizado.
- El dataset de entrenamiento no se detalla en la model card, por lo que pueden existir sesgos hacia ciertas regiones geográficas o grupos taxonómicos.
- La implementación en PyTorch es una conversión del modelo ONNX original; aunque se verificó su reproducibilidad, pueden existir pequeñas diferencias numéricas con la versión original.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir adecuadamente a los autores originales (Google Research y el laboratorio de Jan Clemens).
- El modelo no soporta entrada de audio en otros formatos que no sean waveforms mono a 32 kHz; es necesario preprocesar el audio antes de la inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/DAS-DeepAudioSegmenter/perch2-torch
- Repositorio GitHub (código de conversión y demo): https://github.com/janclemenslab/perch2_torch
- Paper "Perch 2.0: The Bittern Lesson for Bioacoustics": https://arxiv.org/abs/2508.04665
- Repositorio de Google Research (proyecto Perch): https://github.com/google-research/perch
- Repositorio DAS (Deep Audio Segmenter): https://github.com/janclemenslab/das
