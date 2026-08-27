# lab225/resnet-lstm-belarus-screening

## Resumen

El modelo `lab225/resnet-lstm-belarus-screening` es un sistema de generación automática de informes radiológicos a partir de radiografías de tórax (CXR), desarrollado por el Laboratorio de Análisis de Imágenes Biomédicas (Lab225) del Instituto Unido de Problemas de Informática de la Academia Nacional de Ciencias de Bielorrusia (UIIP NASB), en Minsk. Combina un codificador de imágenes ResNet-18 ajustado con un decodificador LSTM profundo de 5 capas, alcanzando aproximadamente 20 millones de parámetros, un tamaño excepcionalmente reducido para tareas de imagen a texto en el dominio médico.

El modelo está diseñado para entornos con recursos computacionales limitados y se ha entrenado sobre un subconjunto curado de 46.599 pares imagen-texto extraídos de un corpus de 211.000 informes radiológicos en ruso, traducidos al inglés siguiendo la terminología de la Sociedad Fleischner. Su relevancia radica en que, pese a su baja huella de parámetros, consigue alineaciones semánticas competitivas frente a modelos multimodales mucho más grandes (como VisionGPT2 de 210M o Qwen3.5-4B) en métricas específicas de generación de informes radiológicos, lo que lo convierte en una opción atractiva para despliegues clínicos con restricciones de hardware.

La arquitectura emplea tokenización a nivel de palabra con un vocabulario de 2.190 tokens (incluyendo tokens especiales) e inicialización de embeddings con vectores GloVe preentrenados. El pipeline de entrenamiento se realizó en tres fases: primero con el encoder congelado, después entrenando el decodificador LSTM, y finalmente descongelando el ResNet-18 con una tasa de aprendizaje reducida y programación de coseno. El modelo se distribuye bajo licencia Apache-2.0 y está disponible en Hugging Face con soporte para carga mediante `trust_remote_code`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (encoder) + LSTM de 5 capas (decoder) |
| Parametros totales | ~20 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen, salida de texto autoregresiva) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de 0.3 GB, probablemente safetensors o binarios PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder clásico: un ResNet-18 preentrenado en ImageNet actúa como extractor de características visuales de la radiografía, y un LSTM profundo de 5 capas genera la secuencia de texto de forma autoregresiva. La tokenización es a nivel de palabra, con un vocabulario de 2.190 tokens que incluye signos de puntuación y tokens especiales (`<BOS>`, `<EOS>`, `<PAD>`, `<UNK>`). Los embeddings se inicializan con vectores GloVe preentrenados, lo que proporciona una representación semántica inicial del vocabulario médico.

El entrenamiento se realizó sobre un conjunto de datos curado de 46.599 pares imagen-texto, derivado de 211.000 informes radiológicos rusos que fueron procesados mediante APIs de LLM asíncronas para corregir errores semánticos y lingüísticos, eliminar metadatos administrativos y traducir al inglés con un marco conforme al glosario de la Sociedad Fleischner. El subconjunto se filtró por palabras clave clínicas (tuberculosis, neumonía, escoliosis, fibrosis, nódulos, enfisema, neumoesclerosis, esclerosis). La partición fue 80% entrenamiento (37.279), 10% validación (4.660) y 10% prueba (4.660). El entrenamiento se dividió en tres fases: 50 épocas con el encoder congelado, extensión hasta 240 épocas con el decodificador LSTM, y finalmente descongelación del ResNet-18 con una tasa de aprendizaje de `3e-6` y un programador de coseno.

## Capacidades

- Generación de informes radiológicos descriptivos a partir de radiografías de tórax (imagen a texto).
- Extracción y secuenciación de hallazgos anatómicos localizados (tuberculosis, neumonía, escoliosis, fibrosis, nódulos, enfisema, etc.).
- Soporte multilingüe limitado a inglés y ruso, con vocabulario especializado en terminología médica.
- Inferencia eficiente gracias a su reducido número de parámetros (~20M), apta para entornos con recursos limitados.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo de pensamiento explícito ni capacidades de visión más allá de radiografías de tórax.

## Casos de uso

- Triaje automatizado de radiografías de tórax: el modelo puede priorizar casos sospechosos de tuberculosis o neumonía en programas de cribado masivo, generando descripciones preliminares que alerten al radiólogo.
- Asistencia a radiólogos en entornos con alta carga de trabajo: genera borradores de informes que el especialista puede revisar y corregir, reduciendo el tiempo de redacción.
- Documentación clínica en sistemas de salud con recursos limitados: al requerir solo ~20M de parámetros, puede ejecutarse en estaciones de trabajo sin GPU dedicada, facilitando su integración en hospitales de baja renta.
- Educación médica: permite a estudiantes de radiología comparar sus propias descripciones con las generadas por el modelo, sirviendo como herramienta de aprendizaje.
- Investigación epidemiológica: análisis de grandes volúmenes de CXR para detectar patrones de enfermedades respiratorias, con generación de etiquetas textuales estandarizadas.
- Integración en pipelines de PACS (sistemas de archivo y comunicación de imágenes): el modelo puede añadir automáticamente impresiones textuales a las imágenes almacenadas, mejorando la búsqueda y recuperación por contenido.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el conjunto de prueba del dataset bielorruso de cribado, comparando con modelos de mayor tamaño (VisionGPT2 de 210M y Qwen3.5-4B), aunque no se proporcionan los valores de estos últimos en la información disponible:

| Modelo | GREEN | RadCliQ_Inv | RaTEScore | RadGraph_F1 |
| :--- | :---: | :---: | :---: | :---: |
| ResNet-18 + LSTM (`top_p=0.1`) | 0.264 | 0.315 | 0.561 | 0.224 |

No se han publicado resultados de benchmarks en la informacion disponible para los modelos comparados (VisionGPT2, Qwen3.5-4B), por lo que no es posible realizar una comparación cuantitativa directa.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (20M parámetros ≈ 80 MB de pesos), por lo que cabe en cualquier GPU consumer (GTX 1060, RTX 2060, etc.) e incluso en CPU con memoria RAM estándar.
- GPU recomendadas: no se requiere GPU de alta gama; una GPU con 4 GB de VRAM es más que suficiente para inferencia en lote pequeño.
- Compatible con despliegue en CPU mediante ONNX o PyTorch, con latencia de milisegundos por imagen (dependiendo del hardware).
- Opciones de despliegue: Hugging Face `transformers` con `trust_remote_code=True`, exportación a ONNX para inferencia en servidores sin GPU, o integración en aplicaciones clínicas embebidas.
- Throughput estimado: no disponible, pero dado el tamaño del modelo, puede procesar decenas de imágenes por segundo en una GPU moderna.

## Comparativa con modelos similares

No se dispone de información detallada sobre las especificaciones de los modelos comparados (VisionGPT2 de 210M y Qwen3.5-4B) en la documentación proporcionada. Se puede indicar que el modelo es significativamente más pequeño (20M vs 210M y 4B), lo que implica menor coste computacional, pero no se conocen sus métricas exactas en los mismos benchmarks. La comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente sobre radiografías de tórax y un vocabulario médico limitado a 2.190 tokens; no es adecuado para otros tipos de imagen o dominios clínicos.
- El dataset de entrenamiento se filtró por palabras clave específicas, lo que puede introducir sesgos hacia ciertas patologías y omitir hallazgos menos comunes.
- Riesgo de alucinación: como todo modelo generativo, puede producir descripciones plausibles pero incorrectas; no debe utilizarse como sustituto del juicio clínico.
- La traducción de informes rusos al inglés se realizó mediante LLM asíncronos, lo que puede introducir errores de terminología no detectados.
- No se han publicado evaluaciones de seguridad ni estudios de sesgo demográfico; su uso en producción clínica requiere validación adicional.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está certificado como dispositivo médico; cualquier uso clínico debe cumplir la normativa local.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lab225/resnet-lstm-belarus-screening
- Perfil de la organización Lab225: https://huggingface.co/lab225
- Repositorio de ResNet (referencia arquitectónica): https://github.com/KaimingHe/deep-residual-networks
- Artículo sobre integración temporal de características ResNet con LSTM (referencia metodológica): https://www.sciencedirect.com/science/article/pii/S2590123025002877
