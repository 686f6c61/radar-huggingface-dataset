# ShaderError/perspectra-bootstapir

## Resumen

Perspectra-bootstapir es una redistribución del modelo BootsTAPIR de Google DeepMind, empaquetado en formato ONNX para su uso dentro del complemento de Blender Perspectra. No se trata de un modelo entrenado por el autor del repositorio (ShaderError), sino de una conversión de los pesos originales publicados por DeepMind en el repositorio tapnet, concretamente el checkpoint `bootstapir_checkpoint_v2.pt`. El modelo original se describe en el artículo "BootsTAP: Bootstrapped Training for Tracking-Any-Point" (Doersch et al., ACCV 2024).

La tarea que resuelve es el seguimiento denso de puntos (tracking-any-point) en vídeo: dado un conjunto de puntos de consulta sobre un fotograma, el modelo predice su posición a lo largo de una secuencia de fotogramas. La exportación fija una ventana de 24 fotogramas y 40 puntos de consulta con entrada de 256x256 píxeles, lo que condiciona el uso práctico del modelo a ese régimen concreto.

El repositorio tiene un tamaño de 0,2 GB (un único archivo ONNX de 221 MB) y licencia Apache 2.0, heredada de los pesos originales. Es relevante para desarrolladores que quieran integrar seguimiento de puntos en pipelines de Blender sin depender de PyTorch en tiempo de inferencia, aunque la información publicada sobre el modelo es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo original BootsTAPIR de DeepMind; detalles no incluidos en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de visión; ventana fija de 24 fotogramas) |
| Tipos de cuantizacion | no disponible (se distribuye únicamente en ONNX float, presumiblemente) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`bootstapir_256.onnx`, 221 MB) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. Se sabe que procede de BootsTAPIR (DeepMind), un modelo de seguimiento de puntos en vídeo presentado en el artículo BootsTAP (ACCV 2024), y que el checkpoint redistribuido es `bootstapir_checkpoint_v2.pt`. El autor del repositorio indica explícitamente que no ha habido reentrenamiento: se trata únicamente de una exportación a ONNX.

La exportación fija dos parámetros clave: una ventana de 24 fotogramas y 40 puntos de consulta, con entrada de 256x256 píxeles. No se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens o muestras, ni sobre si hubo ajuste por refuerzo o preferencias. Cualquier detalle arquitectónico adicional debe consultarse en el repositorio original de tapnet y en el artículo citado.

## Capacidades

- Seguimiento de puntos (point tracking) a lo largo de secuencias de vídeo de hasta 24 fotogramas.
- Manejo de hasta 40 puntos de consulta por inferencia.
- Entrada de imagen fija de 256x256 píxeles.
- Ejecución mediante runtime ONNX, sin necesidad de PyTorch.
- Integración prevista con el complemento Perspectra para Blender.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Seguimiento de puntos en secuencias renderizadas dentro de Blender: el modelo permite anclar puntos de referencia a lo largo de 24 fotogramas, útil para tareas de motion tracking en postproducción o para guiar efectos.
- Integración en el add-on Perspectra: al estar en ONNX, se puede cargar con onnxruntime dentro del entorno de Blender sin arrastrar dependencias de PyTorch.
- Prototipado de pipelines de tracking en vídeo corto: la ventana fija de 24 fotogramas y 40 puntos encaja en pruebas de concepto donde no se requiere tracking de larga duración.
- Análisis de movimiento en clips de 256x256: adecuado para estudiar trayectorias de puntos en vídeos de baja resolución o recortes.
- Comparación de trayectorias entre fotogramas en herramientas de anotación: los 40 puntos permiten marcar referencias y propagarlas automáticamente.
- Despliegue en entornos sin GPU dedicada: al ser ONNX, puede ejecutarse con runtime CPU o con aceleración limitada, aunque no se han publicado cifras de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El archivo ONNX ocupa 221 MB, pero no se indica el pico de memoria durante la ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; al ser ONNX puede ejecutarse en CPU, pero no hay datos de rendimiento.
- Opciones de despliegue: ONNX Runtime (la vía natural dada la exportación); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Ventana fija de 24 fotogramas: no permite tracking de secuencias más largas sin trocear manualmente.
- Límite de 40 puntos de consulta por inferencia.
- Resolución de entrada fija de 256x256: puede degradar el seguimiento en escenas de alta resolución sin reescalado.
- No es un modelo entrenado por el autor del repositorio; cualquier problema de calidad proviene del modelo original de DeepMind.
- No se documentan sesgos, pero al ser un modelo de visión entrenado con datos no especificados, pueden aparecer fallos en dominios visuales alejados de la distribución de entrenamiento.
- Riesgo de deriva en el seguimiento de puntos a lo largo de la ventana de 24 fotogramas (comportamiento típico de los trackers, no cuantificado en la información disponible).
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del repositorio original de tapnet para atribuciones.
- No se especifican idiomas ni capacidades lingüísticas (no aplica).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ShaderError/perspectra-bootstapir
- Repositorio original de tapnet (DeepMind): https://github.com/google-deepmind/tapnet
- Artículo BootsTAP (Doersch et al., ACCV 2024): no se proporciona URL en la información disponible.
