# lachiewelsh/image-complex-da3

## Resumen

`lachiewelsh/image-complex-da3` es una exportación no oficial a ONNX del modelo DA3-Base de Depth Anything 3, desarrollado originalmente por ByteDance. El modelo original es un sistema de estimación de profundidad y geometría multi-vista que, a partir de dos o más fotografías de una misma escena, predice mapas de profundidad y la pose de cámara de cada imagen. Esta versión concreta ha sido preparada por el usuario lachiewelsh para su uso en el navegador mediante `onnxruntime-web`, dentro del proyecto Image Complex (función Process → Predict scene).

La relevancia de esta ficha radica en que no se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos con fines de despliegue en cliente. El autor mantiene los pesos de ByteDance sin cambios salvo la conversión a media precisión (fp16), y el repositorio ocupa 0,2 GB. La licencia es Apache 2.0, heredada del modelo base.

El modelo se distribuye en dos ficheros ONNX separados: un backbone que procesa N imágenes y devuelve la codificación de pose junto con features multi-escala, y una cabeza que, a partir de las features de una imagen, produce profundidad y confianza de profundidad. No hay información sobre idiomas ni sobre datos de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión multi-vista (Depth Anything 3, base), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa N imágenes, N ≥ 2; no es un modelo de texto) |
| Tipos de cuantizacion | fp16 (media precisión en la aritmética interna; entradas y salidas en float32) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`da3-base-backbone-fp16.onnx` 185 MB, `da3-base-head-fp16.onnx` 24 MB) |

## Arquitectura y entrenamiento

El modelo base es Depth Anything 3 (DA3-Base) de ByteDance, un sistema de estimación de profundidad y geometría multi-vista. La exportación divide el modelo en dos grafos ONNX. El backbone recibe un tensor `images` de forma (1, N, 3, H, W) con N ≥ 2 fotografías normalizadas con estadísticos de ImageNet y dimensiones H y W múltiplos de 14. Devuelve `pose_enc` de forma (1, N, 9), que codifica el centro de cámara (3 valores), la rotación como cuaternión x y z w (4 valores) y el campo de visión en altura y anchura en radianes (2 valores), en convención camera-to-world con punto principal centrado; además devuelve cuatro mapas de features `feat0`…`feat3` de forma (1, N, H/14 · W/14, 1536). La cabeza recibe las features de una sola imagen reordenadas a (1, H/14, W/14, 1536) y produce `depth` y `depth_conf` de forma (1, H, W).

La innovación técnica destacable de esta exportación es el uso de `com.microsoft.MultiHeadAttention`, el kernel fusionado de onnxruntime que emplea flash attention en WebGPU. Esto hace que el consumo de memoria crezca de forma lineal con el número de fotografías en lugar de cuadrática respecto a su número. La aritmética interna es de media precisión, mientras que las interfaces de entrada y salida se mantienen en float32. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Estimación de profundidad densa por píxel a partir de una imagen, con mapa de confianza asociado.
- Estimación de pose de cámara (posición, rotación y campo de visión) para un conjunto de dos o más vistas de la misma escena.
- Reconstrucción de geometría multi-vista: el backbone procesa N imágenes conjuntamente y produce features consistentes entre vistas.
- Extracción de features visuales de 1536 dimensiones en cuatro escalas (H/14 · W/14).
- Ejecución en navegador mediante `onnxruntime-web` con aceleración WebGPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Reconstrucción 3D a partir de fotos en el navegador: el usuario sube varias imágenes de un objeto o escena y el modelo devuelve poses de cámara y mapas de profundidad que permiten generar una nube de puntos o malla sin enviar datos a un servidor, gracias a la ejecución local con onnxruntime-web y WebGPU.
- Escaneo de interiores para realidad aumentada: con dos o más fotos de una habitación, el backbone estima la posición y orientación de cada cámara y la cabeza genera profundidad por vista, lo que permite colocar objetos virtuales de forma coherente en el espacio.
- Fotogrametría ligera en aplicaciones web: integrado en un editor o visor 3D, permite obtener profundidad y pose de un conjunto de imágenes para texturizar o alinear modelos sin infraestructura de servidor.
- Preprocesado para pipelines de visión por computador: los mapas de profundidad y confianza pueden alimentar etapas posteriores de segmentación, detección de obstáculos o síntesis de nuevas vistas en aplicaciones de robótica o automoción simulada.
- Herramientas de accesibilidad y edición fotográfica: la profundidad por píxel permite desenfocar fondos, aplicar efectos de bokeh o separar primer plano y fondo en el navegador, con la ventaja de que las imágenes no salen del dispositivo.
- Docencia e investigación en geometría multi-vista: al ser un modelo pequeño (209 MB en total) y con licencia Apache 2.0, sirve para experimentar con estimación de pose y profundidad en entornos con recursos limitados o en cuadernos interactivos sin GPU dedicada.
- Aplicaciones de inventario o medición aproximada: a partir de varias fotos de un objeto, la combinación de pose y profundidad permite estimar dimensiones relativas y generar representaciones 3D ligeras para catálogos o visores web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el backbone ocupa 185 MB y la cabeza 24 MB en disco, por lo que la huella en memoria es reducida y depende del número de imágenes N y de la resolución H × W de entrada.
- GPU recomendadas: no se especifican en la información proporcionada. El modelo está pensado para ejecutarse en el navegador con WebGPU, lo que incluye GPUs integradas y dedicadas compatibles con dicha API.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con soporte WebGPU, dado el tamaño reducido de los pesos (209 MB en total) y la atención con memoria lineal respecto a N.
- Opciones de despliegue: `onnxruntime-web` con WebGPU (caso de uso principal documentado); también puede ejecutarse con otros runtimes compatibles con ONNX, como onnxruntime nativo, aunque no se documenta en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lachiewelsh/image-complex-da3` (esta ficha) | no disponible | N ≥ 2 imágenes, H y W múltiplos de 14 | ONNX fp16 | Apache 2.0 | Hugging Face, 0 descargas |
| `depth-anything/DA3-BASE` (modelo base) | no disponible | mismas entradas que la exportación | PyTorch (pesos originales) | Apache 2.0 | Hugging Face |
| Depth Anything 3 (modelo completo, ByteDance) | no disponible | multi-vista | PyTorch | Apache 2.0 | GitHub de ByteDance |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Exportación no oficial: los pesos son de ByteDance, pero la conversión a ONNX y a media precisión la ha realizado un tercero; no hay garantía de equivalencia numérica exacta con la implementación PyTorch, aunque el autor indica que se comprobó contra el código de DA3.
- La aritmética interna en fp16 puede introducir diferencias numéricas frente al modelo original en precisión completa.
- Requiere al menos dos imágenes (N ≥ 2) y dimensiones H y W múltiplos de 14; no acepta una sola vista en el backbone.
- Modelo puramente visual: no procesa texto, no tiene capacidades de razonamiento lingüístico ni de generación, y no soporta tool calling.
- No hay información sobre sesgos del modelo base ni sobre su comportamiento en dominios fuera de distribución; el riesgo de alucinación se traduce aquí en profundidades o poses incorrectas en escenas ambiguas, texturas repetitivas o superficies reflectantes.
- No se documentan idiomas soportados porque no aplica; cualquier metadato multilingüe debe gestionarse fuera del modelo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar los avisos de licencia y atribuir a ByteDance como autor original de los pesos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación comunitaria.
- El rendimiento en navegador depende de la implementación de WebGPU del navegador y del hardware del cliente; no se han publicado métricas de latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lachiewelsh/image-complex-da3
- Modelo base: https://huggingface.co/depth-anything/DA3-BASE
- Repositorio de Depth Anything 3 (ByteDance): https://github.com/ByteDance-Seed/Depth-Anything-3
- Proyecto Image Complex: https://github.com/lachiewelsh/image-complex
