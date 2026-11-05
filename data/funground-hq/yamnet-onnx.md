# funground-hq/yamnet-onnx

## Resumen

YAMNet (Yet another Audio Mobilenet Network) es un modelo de clasificación de eventos sonoros desarrollado originalmente por Google LLC, entrenado sobre el corpus AudioSet. Esta ficha describe la variante en formato ONNX alojada por funground-hq, una copia byte a byte del modelo publicada para uso interno del paquete Python `funground-ml`. El autor declara explícitamente que no ha modificado ni el grafo ni los pesos, y aporta el hash SHA-256 del fichero `yamnet.onnx` junto con una verificación numérica contra el modelo original de TensorFlow.

La arquitectura subyacente es una MobileNetV1 adaptada a espectrogramas de audio (entrada de 0,96 s a 16 kHz convertida en parches log-mel de 64 bandas), que produce 521 puntuaciones de probabilidad sobre las clases de la ontología AudioSet. Es un modelo compacto (del orden de millones de parámetros, aunque el autor no publica el recuento exacto) pensado para inferencia en CPU y dispositivos de borde, no para generación de texto ni para tareas multimodales.

Su relevancia actual es práctica: empaquetar un clasificador de audio maduro y bien validado en ONNX elimina la dependencia de TensorFlow en producción y facilita el despliegue con ONNX Runtime en servidores modestos o en el propio dispositivo. No obstante, conviene subrayar que este repositorio no es la fuente canónica del modelo, no incluye documentación propia más allá de la nota de copia y no ofrece datos de rendimiento más allá de la comparación numérica con la implementación de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV1 aplicada a parches log-mel (clasificador de audio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (ventana de audio de 0,96 s a 16 kHz, parches de 64 bandas log-mel) |
| Tipos de cuantizacion | no disponible (el repo solo contiene `yamnet.onnx` en precisión original) |
| Idiomas soportados | no aplica (clasificación de audio, no texto); etiquetas de AudioSet en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`yamnet.onnx`) |

## Arquitectura y entrenamiento

YAMNet usa una MobileNetV1 con convoluciones separables en profundidad como extractor de características sobre parches log-mel de 64 bandas calculados a partir de audio a 16 kHz. La salida es un vector de 521 puntuaciones correspondientes a las clases de la ontología AudioSet, y el modelo está diseñado para procesar audio en ventanas solapadas de 0,96 s. No se trata de un transformer ni de un modelo generativo: es un clasificador discriminativo de un solo paso, sin mecanismos de atención ni decodificación autoregresiva.

El entrenamiento original de Google se realizó sobre AudioSet, un corpus de millones de clips de YouTube anotados con etiquetas jerárquicas; la model card de esta copia no detalla el número exacto de tokens, horas de audio ni la composición del dataset, por lo que esos datos deben consultarse en la documentación oficial de YAMNet. Tampoco se documentan etapas de RLHF o DPO, que no aplican a este tipo de modelo. La innovación relevante de esta variante es la conversión a ONNX verificada: el autor comprobó el fichero contra el modelo de TensorFlow de Google sobre 2.000 clips de ESC-50 y 9 casos límite, con una diferencia máxima de puntuación de 6,7e-5 y el mismo enmarcado temporal, lo que respalda la fidelidad de la exportación.

## Capacidades

- Clasificación de eventos sonoros en 521 clases de la ontología AudioSet (música, voz, animales, vehículos, electrodomésticos, etc.).
- Producción de puntuaciones de probabilidad por clase, utilizables como embedding acústico de 1.024 dimensiones para tareas posteriores.
- Procesamiento de audio en ventanas de 0,96 s con solapamiento configurable, apto para flujo continuo.
- Inferencia en CPU sin dependencias de TensorFlow gracias al formato ONNX.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas ni visión.
- No es un modelo multilingüe: las etiquetas de salida están en inglés y el modelo no procesa texto.
- No dispone de modo de razonamiento (thinking mode), audio generativo ni capacidades de agente.

## Casos de uso

- Detección de eventos acústicos en dispositivos de borde: el modelo cabe en un runtime ONNX ligero y procesa ventanas de 0,96 s, por lo que puede ejecutarse en Raspberry Pi o microcontroladores con CPU para alertar de cristales rotos, alarmas o ladridos.
- Moderación de audio en plataformas de contenido: clasificar clips subidos por usuarios y marcar categorías sensibles (violencia, gritos, contenido para adultos) antes de la revisión humana, usando las puntuaciones de AudioSet como señales de triaje.
- Indexación y búsqueda semántica de archivos de audio: extraer embeddings de 1.024 dimensiones por ventana y almacenarlos en un motor vectorial para recuperar fragmentos por similitud acústica.
- Monitorización ambiental y ciudades inteligentes: detectar sirenas, obras, tráfico o fauna en flujos de micrófonos urbanos, aprovechando la ventana corta para reducir latencia en la alerta.
- Preprocesado en pipelines de investigación en audio: usar YAMNet como extractor de características congelado para entrenar clasificadores específicos de dominio con pocos datos etiquetados.
- Control de calidad en fabricación: detectar anomalías acústicas en líneas de producción (golpes, chirridos, fugas) comparando las puntuaciones frente a una línea base de sonido normal.
- Análisis de llamadas y reuniones: segmentar audio por eventos (voz, música de espera, ruido de fondo) para enriquecer transcripciones o métricas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la validación de fidelidad de la exportación ONNX: diferencia máxima de 6,7e-5 frente al modelo TensorFlow de Google sobre 2.000 clips de ESC-50 y 9 casos límite, con el mismo enmarcado. No se aportan cifras de precisión, mAP, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo compacto de tipo MobileNet, es esperable que opere en CPU sin GPU, pero el autor no publica cifras de memoria.
- GPU recomendadas: no disponibles; el formato ONNX permite ejecución con ONNX Runtime en GPU (CUDA, TensorRT) o CPU, pero no se documentan configuraciones probadas.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido del grafo, aunque no hay confirmación en la información proporcionada.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), integración con el paquete `funground-ml`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YAMNet (ONNX, esta copia) | no disponible | ventana de 0,96 s, 64 bandas log-mel | Clasificación de 521 clases AudioSet | Apache 2.0 | HuggingFace (copia de `audiomagic/yamnet-onnx`) |
| YAMNet original (TensorFlow) | no disponible | misma entrada | misma tarea | Apache 2.0 | TensorFlow Hub / repositorio de Google |
| VGGish | no disponible | ventana de 0,96 s, 64 bandas log-mel | Embeddings y clasificación AudioSet | Apache 2.0 | TensorFlow Hub |
| PANNs (CNN14) | no disponible | ventana de 10 s, 64 bandas log-mel | Clasificación de 527 clases AudioSet | Apache 2.0 | GitHub / Zenodo |

La comparación se limita a la categoría funcional, ya que la model card no aporta métricas que permitan contrastar precisión o latencia frente a estas alternativas. YAMNet destaca por su tamaño reducido y su idoneidad para CPU; PANNs ofrece ventanas más largas y mayor capacidad, a costa de más cómputo; VGGish es comparable en entrada pero está pensado principalmente como extractor de embeddings.

## Limitaciones y advertencias

- Este repositorio es una copia no oficial: la fuente canónica es el modelo de Google LLC, y el autor no ofrece garantías de mantenimiento ni soporte.
- No se publican métricas de precisión, sesgos ni evaluación por subgrupos; los sesgos de AudioSet (predominio de audio de YouTube, etiquetas en inglés, desequilibrio entre clases) se heredan sin documentar.
- Riesgo de falsos positivos y negativos en clases poco representadas de la ontología, y de confusión entre eventos acústicamente próximos.
- La ventana de 0,96 s limita la detección de eventos largos o de dinámica lenta; requiere agregación temporal externa.
- Las etiquetas de salida están en inglés; no hay soporte multilingüe ni localización de categorías.
- La licencia Apache 2.0 permite uso comercial, pero conviene conservar los avisos de atribución a Google LLC y a la ontología AudioSet (CC BY 4.0).
- No se documentan cuantizaciones ni variantes optimizadas en este repositorio; el despliegue en producción requerirá validar el fichero ONNX en el runtime objetivo.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/funground-hq/yamnet-onnx
- Repositorio de origen de la copia: https://huggingface.co/audiomagic/yamnet-onnx
- Modelo YAMNet original de Google (TensorFlow Hub): https://tfhub.dev/google/yamnet/1
- Ontología AudioSet: https://research.google.com/audioset/ontology/index.html
- Papel de YAMNet en la documentación de TensorFlow: https://www.tensorflow.org/hub/tutorials/yamnet
- Dataset ESC-50 (usado en la validación): https://github.com/karolpiczak/ESC-50
