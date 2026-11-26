# singam96/ShadeNet-5-35M

## Resumen

ShadeNet-5 es un modelo de renderizado inverso a partir de una única imagen RGB, desarrollado por el usuario singam96 y publicado en Hugging Face bajo licencia Apache-2.0. Dada una fotografía, el modelo predice de forma directa tres mapas intrínsecos: albedo (color base), profundidad relativa y normales de superficie. Se trata de un modelo de imagen a imagen de tamaño reducido, con 34,65 millones de parámetros totales, de los cuales 12,6 millones son entrenables y 22,1 millones corresponden al tronco DINOv2 ViT-S/14 congelado de Meta AI.

La arquitectura es una ParallelUNet que opera sobre un prior fijado derivado de la propia foto y aprende una corrección residual en una sola pasada hacia delante, sin iteración, sin embeddings temporales ni esquema de difusión. Esto lo distingue de aproximaciones generativas como Marigold, que requieren múltiples pasos de muestreo. El modelo se entrega con un refinador UNet opcional de 0,91 millones de parámetros que aproxima el resultado de promediar seis pasadas (espejo y rotaciones) con un coste mucho menor.

Es relevante ahora porque ofrece una alternativa de inferencia rápida y ligera para descomposición intrínseca, con exportaciones ONNX de 4 y 8 bits que permiten ejecución en CPU, y porque demuestra que un tronco congelado de tipo ViT combinado con un decodificador ligero puede competir en tareas de renderizado inverso con pipelines generativos mucho más costosos. La validación publicada es reducida (23 imágenes), por lo que los números deben tomarse como indicativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ParallelUNet sobre tronco DINOv2 ViT-S/14 congelado, corrección residual sobre prior fijo derivado de la foto |
| Parametros totales | 34.652.431 (12.595.855 entrenables; 22,1 M del tronco DINOv2 congelado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen de 448x448 o 896x896) |
| Tipos de cuantizacion | exportaciones ONNX de 4 y 8 bits del modelo podado |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch y ONNX (4/8 bits); tamano del repo 0,3 GB |

## Arquitectura y entrenamiento

El modelo es una ParallelUNet que recibe una imagen de 3 canales más un estado de 7 canales y produce una salida de 7 canales: albedo (3), profundidad relativa (1) y normales (3), todos en el rango [-1, 1]. La red incorpora diccionarios de parches (8.582.400 parámetros distribuidos en cuello de botella y niveles d0, d1, d2) y patrones fijos plegados en entrada, salidas y niveles intermedios. El tronco DINOv2 ViT-S/14 permanece congelado y alimenta los saltos del decodificador. La predicción es una corrección residual sobre un prior fijo derivado de la foto, en una única pasada hacia delante.

El refinador es una UNet pequeña de 0,91 millones de parámetros, 4 niveles y GroupNorm, cuya última capa se inicializa a cero. Se entrena por destilación: el objetivo es la salida del promedio de seis pasadas (espejo y rotaciones de ±4°) para la misma foto, sin necesidad de etiquetas. Se usaron 8.024 fotos del split de validación de Open Images V7 con licencia CC BY 2.0 (7.724 para entrenamiento y 300 reservadas), con recortes aleatorios de 320x320 y espejos, pérdida L1, AdamW con tasa 3e-4 y decaimiento coseno, durante 6.000 pasos con lote de 16 (unos 25 minutos en una RTX A4000). No se documentan en la información disponible detalles sobre el conjunto de entrenamiento principal del modelo base (número de tokens o composición), ni sobre uso de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Renderizado inverso a partir de una sola imagen RGB: descomposición en albedo, profundidad relativa y normales de superficie.
- Salida de 7 canales con convención fija: `[0:3]` albedo, `[3:4]` profundidad, `[4:7]` normales, todos en [-1, 1].
- Inferencia en una sola pasada hacia delante, sin iteración ni esquema de difusión.
- Modo con refinador opcional que aproxima el promedio de seis pasadas (espejo y rotaciones) con un coste adicional de unos 12 ms.
- Modo de seis pasadas disponible para mayor calidad a mayor coste (unos 353 ms por imagen en A4000 en bf16).
- Entrada limitada a múltiplos de 448 (448 o 896 píxeles).
- Exportaciones ONNX de 4 y 8 bits para despliegue en CPU.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual.

## Casos de uso

- Descomposición intrínseca en pipelines de posproducción: separar albedo y sombreado de una foto para recolorear materiales o ajustar iluminación sin re-renderizar, aprovechando la salida de albedo del modelo.
- Reconstrucción 3D y modelado por fotogrametría: usar el mapa de normales y la profundidad relativa como entrada para algoritmos de reconstrucción de superficie o generación de mallas a partir de una sola vista.
- Realce de imágenes y relighting: emplear albedo y normales para aplicar nuevas fuentes de luz sobre una foto existente en herramientas de edición.
- Preprocesado para modelos de difusión o generativos: proporcionar mapas de profundidad y normales como condicionamiento en pipelines de imagen a imagen.
- Automatización de anotación de datasets: generar etiquetas de profundidad relativa y normales de forma rápida (57-68 ms por imagen en A4000) para conjuntos de imágenes a gran escala.
- Aplicaciones en el navegador o en dispositivos sin GPU: gracias a las exportaciones ONNX de 4 y 8 bits y a la ejecución en CPU (unos 0,26 s por imagen a 448x448 en la versión ONNX), puede integrarse en demos web o herramientas de escritorio.
- Análisis de escenas en robótica o visión por computador embebida: obtener profundidad relativa y normales con un modelo de 34,7 M de parámetros y latencia baja para tareas de percepción.

## Benchmarks y rendimiento

Resultados de L1 por mapa (salida cruda frente a etiqueta, albedo y normales enmascarados donde la etiqueta no es válida) sobre el split de validación reservado de 23 imágenes a 448 px, mejor checkpoint (época 19, podado):

| Mapa | Una pasada (normales unitarias) | Una pasada + refinador | Seis pasadas (espejo + rotaciones ±4°) |
|---|---|---|---|
| Albedo | 0,1804 | 0,1762 | 0,1734 |
| Profundidad | 0,1754 | 0,1746 | 0,1653 |
| Normales | 0,1713 | 0,1509 | 0,1497 |
| **Media** | 0,1757 | **0,1673** | 0,1628 |
| Tiempo por imagen (A4000, bf16) | 57 ms | 68 ms | 353 ms |

Comparación con la ejecución anterior (mismo split de 23 imágenes, mismas etiquetas, misma métrica L1, ambas en una sola pasada; la anterior usaba tronco MobileNetV2, pérdida L1 enmascarada, entradas de 384 px y 6 épocas):

| Mapa | Ejecución anterior | Este modelo |
|---|---|---|
| Albedo | 0,2474 | 0,1804 |
| Profundidad | 0,3628 | 0,1754 |
| Normales | 0,2744 | 0,1730 |
| **Media** | 0,3141 | **0,1763** |

El refinador recupera el 65% de la ganancia del promedio de seis pasadas (0,0084 de 0,0129 de L1 media) con unos 12 ms adicionales frente a los 296 ms de las cinco pasadas extra. Frente al objetivo de seis pasadas en fotos reservadas, la L1 media bajó de 0,0567 (una pasada) a 0,0398 (con refinador). El split de validación es pequeño (23 imágenes) y todas las etiquetas son pseudo-etiquetas de Marigold-V2 (la profundidad se decodifica de la visualización en color de Marigold), por lo que deben considerarse indicativas y no de nivel de benchmark. La pérdida de profundidad es invariante a escala y desplazamiento, por lo que la L1 cruda de profundidad no es lo que optimiza.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 34,7 M de parámetros totales y pesos en bf16 (unos 70 MB), el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX A4000 (referencia de los tiempos publicados), así como cualquier GPU con al menos unos pocos GB de VRAM; también RTX 4090, A100 o H100 sin problema.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna, dado el reducido tamaño del modelo.
- Opciones de despliegue: PyTorch, ONNX (exportaciones de 4 y 8 bits), y la demo en el Space de Hugging Face en CPU.
- Latencia y throughput estimados: 57 ms por imagen en una sola pasada y 68 ms con refinador en A4000 en bf16; 353 ms para seis pasadas; unos 0,26 s por imagen a 448x448 en CPU con la versión ONNX.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShadeNet-5 | 34,7 M (12,6 M entrenables) | Feed-forward, una pasada + refinador opcional | Imagen 448/896 px | Apache-2.0 | Hugging Face, ONNX 4/8 bits |
| Marigold (referencia de etiquetas) | no disponible | Difusión, múltiples pasos | Imagen | no disponible | no disponible |
| Ejecución anterior de ShadeNet (MobileNetV2) | no disponible | Feed-forward, una pasada | Imagen 384 px | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos de parámetros, contexto o rendimiento de alternativas como Marigold más allá de su uso como generador de pseudo-etiquetas, por lo que la comparativa cuantitativa con modelos de la misma categoría queda limitada a la ejecución anterior del propio autor.

## Limitaciones y advertencias

- El split de validación es muy reducido (23 imágenes) y las etiquetas son pseudo-etiquetas de Marigold-V2, por lo que los números publicados son indicativos y no de nivel de benchmark.
- La profundidad es relativa y por imagen, no métrica; la pérdida es invariante a escala y desplazamiento.
- La entrada está restringida a múltiplos de 448 (448 o 896 píxeles), lo que limita resoluciones arbitrarias.
- El refinador no reproduce los cambios del promedio de seis pasadas en los niveles globales de profundidad, por lo que la profundidad refinada es esencialmente la de una sola pasada.
- Cambio incompatible respecto a ShadeNet-3.2: este modelo no tiene canal de sombreado (7 canales en lugar de 8).
- No se documentan en la información disponible sesgos conocidos ni riesgos específicos de alucinación; al ser un modelo de visión, el riesgo principal es la imprecisión en mapas intrínsecos en escenas fuera de distribución.
- Licencia Apache-2.0, que permite uso comercial con atribución y sin restricciones adicionales conocidas; conviene revisar los términos exactos del repositorio.
- El modelo base DINOv2 ViT-S/14 es de Meta AI y permanece congelado; su licencia debe verificarse por separado si se redistribuye.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/singam96/ShadeNet-5-35M
- Demo en el Space: https://huggingface.co/spaces/singam96/ShadeNet-5
- Modelo base DINOv2 ViT-S/14: https://huggingface.co/facebook/dinov2-small
- Repositorio de etiquetas Marigold-V2: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
