# litert-community/Video-Depth-Anything-Small

## Resumen

Video-Depth-Anything-Small es un modelo de estimación de profundidad relativa para vídeo, desarrollado originalmente por Sili Chen y colaboradores (proyecto Video Depth Anything, presentado en CVPR 2025 como Highlight) a partir de Depth Anything V2. Esta ficha concreta corresponde a la exportación FP32 a formato LiteRT/TFLite realizada por la comunidad `litert-community`, que empaqueta el checkpoint original en un fichero `.tflite` de 116,28 MB con formas fijas y firma `main`, pensado para inferencia en CPU y despliegue en dispositivos sin GPU dedicada.

El modelo resuelve el problema de la estimación de profundidad temporalmente consistente: procesa ventanas fijas de 32 fotogramas RGB y devuelve mapas de profundidad relativa de 518×518 píxeles por fotograma, manteniendo las capas temporales del modelo original. No produce distancias calibradas en metros, sino profundidad relativa, lo que lo hace adecuado para efectos visuales, segmentación por profundidad o navegación aproximada.

Su relevancia actual radica en que permite ejecutar un modelo de profundidad de vídeo con backbone ViT-Small en entornos LiteRT (Android, Linux embebido, navegador vía WebAssembly con el runtime adecuado), sin necesidad de PyTorch ni de GPU, a cambio de gestionar manualmente en el host la decodificación, el preprocesado y la concatenación de ventanas solapadas para vídeos de más de 32 fotogramas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-Small (Depth Anything V2) con capas temporales; exportado a LiteRT/TFLite |
| Parametros totales | no disponible (el fichero FP32 pesa 116,28 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de 32 fotogramas por inferencia; sin límite de duración de vídeo gestionado por el modelo |
| Tipos de cuantizacion | solo FP32 en este repositorio |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`), FP32, formas fijas, firma `main` |

## Arquitectura y entrenamiento

El modelo subyacente es Video Depth Anything, construido sobre Depth Anything V2 con backbone ViT-Small. La innovación principal del trabajo original es la incorporación de capas temporales sobre el codificador de profundidad por imagen, lo que permite procesar vídeos arbitrariamente largos manteniendo consistencia temporal sin sacrificar calidad ni capacidad de generalización. Según el repositorio oficial, frente a modelos basados en difusión presenta inferencia más rápida, menos parámetros y mayor precisión de profundidad consistente.

La exportación de `litert-community` conserva los pesos preentrenados originales (revisión `256875362cff76724b920335dfb4b29dd611f66e` del checkpoint `depth-anything/Video-Depth-Anything-Small`) y los convierte a una interfaz TFLite de formas fijas. La entrada es un tensor `frames` de forma `[32, 3, 518, 518]` en orden TCHW, sin dimensión de batch (el lote está fijado a un clip); la salida es `relative_depth` de forma `[1, 32, 518, 518]`. El preprocesado requerido es: decodificar 32 fotogramas RGB consecutivos, recorte cuadrado centrado consistente, división por 255, redimensionado a 518×518 con interpolación cúbica de OpenCV y normalización con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]` de ImageNet. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Estimación de profundidad relativa por fotograma a partir de vídeo RGB, con consistencia temporal entre los 32 fotogramas de la ventana.
- Procesamiento de clips de exactamente 32 fotogramas por inferencia; para vídeos más largos, el código host debe gestionar ventanas solapadas, alineación temporal de escala y desplazamiento, y redimensionado de salida.
- Salida de mapas de profundidad de 518×518 píxeles por fotograma, en formato float32.
- Ejecución en CPU mediante el intérprete de LiteRT (`ai-edge-litert`), con soporte de multihilo configurable (`num_threads`).
- No incluye decodificación de vídeo, preprocesado ni postprocesado: estas tareas recaen en el host (OpenCV u otras librerías).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente perceptivo de visión.
- No dispone de capacidades multilingües ni de generación de texto.
- No produce profundidad métrica calibrada; la salida es relativa.

## Casos de uso

- Efectos visuales y postproducción: estimar profundidad por fotograma para generar mapas de desenfoque selectivo, parallax o composición de capas 2.5D en clips cortos o en ventanas de 32 fotogramas gestionadas por el pipeline de postproducción.
- Segmentación asistida por profundidad: usar los mapas relativos como señal auxiliar para separar primer plano y fondo en herramientas de edición o rotoscopia semiautomática.
- Navegación aproximada en robótica ligera o dispositivos embebidos: al ejecutarse en CPU vía LiteRT, puede integrarse en sistemas con recursos limitados para detectar obstáculos cercanos por profundidad relativa, sin necesidad de calibración métrica.
- Realidad aumentada en móvil: colocar objetos virtuales con oclusión aproximada respecto al entorno usando la profundidad relativa de la escena capturada por la cámara.
- Análisis de vídeo industrial: monitorizar la profundidad relativa de una escena fija (por ejemplo, una cinta transportadora) para detectar cambios de volumen o presencia de objetos, procesando ventanas consecutivas con solapamiento.
- Generación de datasets de profundidad: producir mapas de profundidad pseudoetiquetados para entrenar otros modelos de visión (segmentación, detección) en dominios donde no hay datos de profundidad anotados.
- Previsualización en el navegador o en apps Android: al ser TFLite FP32, puede desplegarse con runtimes LiteRT en cliente, ofreciendo estimación de profundidad local sin enviar vídeo a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (absRel, δ1, etc.) ni comparaciones numéricas con otros modelos; únicamente se menciona cualitativamente en el repositorio oficial que supera a los modelos basados en difusión en velocidad de inferencia, número de parámetros y precisión de profundidad consistente.

## Requisitos de hardware

- VRAM: no aplica para la ruta principal, ya que el modelo está pensado para ejecución en CPU con LiteRT; el fichero FP32 ocupa 116,28 MB en disco y requiere memoria RAM proporcional al tensor de entrada (32×3×518×518 float32, aproximadamente 103 MB) más la salida (32×518×518 float32, aproximadamente 34 MB) y los buffers intermedios del intérprete.
- GPU recomendadas: no disponibles para esta exportación; el runtime LiteRT puede usar delegados de GPU en algunas plataformas, pero la model card solo documenta la ejecución en CPU con `ai_edge_litert`.
- GPU de consumo: no aplica en la ruta documentada; cualquier CPU moderna con al menos 4 hilos puede ejecutar el intérprete, según el ejemplo de la model card (`num_threads=4`).
- Opciones de despliegue: `ai-edge-litert` (intérprete Python documentado), runtime LiteRT para Android/Linux embebido; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión en TFLite.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| Video-Depth-Anything-Small (LiteRT) | no disponible (ViT-S) | 32 fotogramas fijos | Profundidad relativa 518×518 | Apache 2.0 | TFLite FP32 |
| depth-anything/Video-Depth-Anything-Small (original) | no disponible (ViT-S) | vídeo arbitrariamente largo (gestión interna) | Profundidad relativa | Apache 2.0 | PyTorch |
| litert-community/depth-anything-v2-small | no disponible (ViT-S) | imagen individual | Profundidad relativa | no disponible en la información | TFLite |

El modelo original en PyTorch ofrece gestión nativa de vídeos de duración arbitraria, mientras que esta exportación LiteRT limita cada inferencia a 32 fotogramas y traslada al host la lógica de ventanas solapadas y alineación temporal. Frente a `depth-anything-v2-small` (también en LiteRT), la diferencia clave es la consistencia temporal entre fotogramas, ausente en el modelo por imagen. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- La salida es profundidad relativa, no distancias métricas calibradas en metros; no debe usarse para medición física sin un paso de calibración adicional.
- Ventana fija de 32 fotogramas: para vídeos más largos el código host debe implementar ventanas solapadas, alineación de escala y desplazamiento temporal, y redimensionado de salida; la model card remite a la implementación de inferencia original para ello.
- Formas fijas en el grafo TFLite: no admite entradas de distinta resolución o número de fotogramas sin reexportar el modelo.
- Preprocesado obligatorio y específico (recorte cuadrado centrado, redimensionado cúbico a 518×518, normalización ImageNet); desviarse de él degrada la calidad de la profundidad.
- No incluye decodificación ni postprocesado: errores en el pipeline del host (por ejemplo, recortes inconsistentes entre ventanas) pueden introducir saltos temporales.
- Riesgo de alucinación perceptiva: en regiones ambiguas, texturas repetitivas o superficies reflectantes puede generar mapas de profundidad incorrectos, como es habitual en modelos monoculares.
- Sesgos del dataset de entrenamiento de Depth Anything V2 no documentados en la información disponible; el rendimiento puede degradarse en dominios muy alejados de los datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribución del proyecto original y de la conversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación comunitaria de esta exportación concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Video-Depth-Anything-Small
- Checkpoint original: https://huggingface.co/depth-anything/Video-Depth-Anything-Small
- Repositorio oficial de Video Depth Anything: https://github.com/DepthAnything/Video-Depth-Anything
- Paper (arXiv:2501.12375): https://arxiv.org/abs/2501.12375
- Implementación de inferencia original: https://github.com/DepthAnything/Video-Depth-Anything/blob/4f5ae23172ba60fd7bc11ef671cca678842c7072/video_depth_anything/video_depth.py
- Exportación LiteRT relacionada (Depth Anything V2 Small): https://huggingface.co/litert-community/depth-anything-v2-small
