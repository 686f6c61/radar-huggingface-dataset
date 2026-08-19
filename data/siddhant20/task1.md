# siddhant20/task1

## Resumen

`siddhant20/task1` es un modelo de detección de objetos especializado en la minería de diferencias en material de embalaje, desarrollado como solución completa para la tarea 1 de la competición CyberAI Cup 2026. El modelo aborda un problema concreto: dado un par de imágenes (una plantilla de referencia y una fotografía del material impreso), debe localizar mediante bounding boxes todas las diferencias relevantes, ya sean adiciones o modificaciones de contenido gráfico.

Se trata de una arquitectura siamesa basada en CenterNet con un encoder ConvNeXt-tiny compartido, que procesa ambas imágenes simultáneamente y fusiona sus características a múltiples escalas. El modelo opera con una resolución de salida de stride 2, una decisión de diseño crítica para detectar marcas de diferencia extremadamente pequeñas (hasta 8×8 píxeles). El checkpoint publicado alcanza un F1 global de 0.9049 en el fold 0 de validación, superando ampliamente la línea base clásica de diferencia de imágenes que solo logra 0.029. El repositorio incluye el código fuente completo, los pesos entrenados y toda la documentación necesaria para reproducir los resultados, aunque el modelo está pensado como entrega de trabajo privada, no como lanzamiento público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Siamese CenterNet con backbone ConvNeXt-tiny compartido, fusión por concatenación y decodificador tipo U-Net |
| Parametros totales | no disponible (checkpoint de 128 MB en fp32, ~28M parámetros estimados para ConvNeXt-tiny, sin confirmar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, procesa pares de imágenes de página completa mediante teselado a 768 px) |
| Tipos de cuantizacion | no disponible (solo se publican pesos fp32 en formato PyTorch) |
| Idiomas soportados | no aplica (modelo de visión sin componente de lenguaje) |
| Licencia | other (licencia personalizada no especificada; el dataset pertenece a los organizadores de CyberAI Cup 2026) |
| Formato de pesos | PyTorch checkpoint (.pt) con state_dict, incluye claves de modelo, métricas y umbral de decisión |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura siamesa CenterNet. Ambas imágenes del par (plantilla y fotografía) pasan por un encoder ConvNeXt-tiny compartido que acepta 4 canales de entrada: BGR más un mapa de tinta normalizado por fondo local, diseñado para hacer las características invariantes a sombras y variaciones de iluminación en la fotografía. Las características de ambas ramas se fusionan por escala mediante una operación `conv(concat(a, b, |a − b|))`, que combina las activaciones de ambas imágenes y su diferencia absoluta. Un camino de upsampling tipo U-Net decodifica la fusión y emite cuatro cabezales a stride 2: un heatmap focal gaussiano para centros de diferencia, dimensiones de ancho/alto, un offset sub-píxel y una máscara de segmentación auxiliar de cambio.

La elección de stride 2 es fundamental: 83 de las cajas ground-truth del dataset tienen solo 8×8 píxeles, que desaparecen por completo a stride 4, el valor estándar de CenterNet. El entrenamiento se realizó por folds, con el fold 0 completado (40 épocas, checkpoint seleccionado en la época 19) y los folds 1–4 sin entrenar. El análisis del dataset reveló tres propiedades que guiaron el diseño: los pares están alineados sub-píxel (284 de 300 no necesitan registro), el desenfoque es la principal fuente de falsos positivos (se aplica blur-matching a la plantilla mediante búsqueda en rejilla de σ minimizando la brecha de varianza Laplaciana), y no existen eliminaciones en los datos (0 de 1404 cajas analizadas), lo que permite un filtro de polaridad que descarta candidatos con tinta en la plantilla y vacío en la foto. La inferencia tesela cada página a 768 px con 25% de solapamiento y fusiona candidatos con Weighted Boxes Fusion en lugar de NMS.

## Capacidades

- Detección de diferencias entre pares de imágenes: localiza mediante bounding boxes las adiciones y modificaciones de contenido entre una plantilla y una fotografía.
- Detección de objetos muy pequeños: capaz de detectar marcas de diferencia de 8×8 píxeles gracias a la salida a stride 2.
- Fusión de características multimodales: combina información de color (BGR) con un mapa de tinta normalizado para robustez frente a sombras.
- Manejo de pares desalineados: soporta registros por traslación pura cuando es necesario (16 de 300 pares).
- Inferencia a página completa: mediante teselado con solapamiento y Weighted Boxes Fusion para combinar detecciones.
- Segmentación auxiliar de cambio: emite una máscara de cambio además de las cajas delimitadoras.
- Filtrado de polaridad: descarta candidatos que representan eliminaciones, basado en el análisis del dataset.
- Reproducibilidad: incluye scripts de smoke test en CPU, análisis de dataset y análisis de errores.

## Casos de uso

- Control de calidad en impresión de embalajes: el modelo compara la plantilla digital aprobada con la fotografía del material impreso en línea de producción, detectando marcas faltantes, añadidas o modificadas que indiquen defectos de impresión. Su alta sensibilidad a objetos pequeños (82.8% de acierto en marcas sub-12 px) lo hace adecuado para detectar defectos mínimos que el ojo humano o sistemas basados en diferencia de píxeles pasarían por alto.
- Verificación de etiquetas y envases farmacéuticos: en entornos regulados donde cada lote debe coincidir exactamente con la especificación aprobada, el modelo puede automatizar la inspección de números de lote, fechas de caducidad y códigos de barras impresos, señalando cualquier desviación respecto a la plantilla.
- Auditoría de material promocional: comparación de tiradas impresas de folletos, carteles o packaging promocional contra el arte final aprobado, detectando variaciones de color, texto o gráficos introducidas durante la producción.
- Detección de falsificaciones en producto envasado: comparando el embalaje de un producto sospechoso con una imagen de referencia auténtica, el modelo puede identificar diferencias sutiles en la impresión que delaten copias no autorizadas.
- Inspección de etiquetado de alimentos: verificación automática de que la información nutricional, ingredientes y advertencias en el envase final coinciden con la versión aprobada, un requisito legal en muchas jurisdicciones.
- Análisis forense de documentos impresos: comparación de versiones de documentos físicos para identificar qué elementos se añadieron o modificaron entre dos copias, útil en litigios o investigaciones internas.

## Benchmarks y rendimiento

Los resultados publicados corresponden a la validación del fold 0 del dataset de la competición, con 40 pares retenidos. La métrica utilizada es F1 global, acumulando TP/FP/FN sobre todas las imágenes antes de calcular precisión y recall, con emparejamiento de cajas a IoU ≥ 0.5.

| Metrica | Valor |
|---|---|
| F1 global (fold 0, umbral 0.31) | 0.9049 |
| Precision | 0.9225 |
| Recall | 0.8881 |
| Linea base clasica (diferencia de imagenes) | 0.029 |
| Cajas ground-truth en validacion | 268 |
| Cajas propuestas y emparejadas | 252 |
| Cajas propuestas pero con IoU < 0.5 | 5 |
| Cajas nunca propuestas | 11 |
| Techo de recall del proposal stage | 0.959 |

Desglose por tamaño de caja:

| Tamano de caja | Tasa de emparejamiento |
|---|---|
| > 24 px | 97.5% |
| 12–24 px | 97.9% |
| < 12 px | 82.8% |

No se han publicado resultados en benchmarks estándar de la comunidad (COCO, LVIS, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente, pero el checkpoint es de 128 MB en fp32, lo que sugiere que la inferencia en una sola tesela de 768 px cabe en GPUs con 8 GB o menos.
- GPU recomendadas para entrenamiento: A100-40GB, con un tiempo de entrenamiento de ~45 minutos por fold en Modal.
- Compatibilidad con GPU de consumo: probablemente sí para inferencia, dado el tamaño del modelo (ConvNeXt-tiny), aunque no se han publicado mediciones específicas.
- Opciones de despliegue: el modelo se publica como checkpoint de PyTorch, sin soporte nativo para vLLM, llama.cpp u Ollama (no es un modelo de lenguaje). La inferencia requiere el código fuente del repositorio (`pmdm.infer`).
- Latencia y throughput: no disponibles. El script de smoke test en CPU tarda ~2 minutos en recorrer el pipeline completo, lo que sugiere tiempos de inferencia aceptables incluso sin GPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de detección de diferencias en embalaje. El único punto de comparación documentado es la línea base clásica de diferencia de imágenes (F1 de 0.029 frente a 0.9049). Como referencia de arquitectura, el modelo es un CenterNet siamés, comparable en diseño a otros detectores de un solo stage como FCOS o RetinaNet adaptados a la tarea, pero no se han publicado resultados comparativos con estos.

| Modelo | Arquitectura | F1 (validacion) | Licencia |
|---|---|---|---|
| siddhant20/task1 | Siamese CenterNet + ConvNeXt-tiny | 0.9049 | other |
| Linea base diferencia de imagenes | Diferencia de píxeles clasica | 0.029 | no aplica |

## Limitaciones y advertencias

- Dataset de propiedad de los organizadores de CyberAI Cup 2026: el conjunto de datos no se distribuye con el modelo y su uso está restringido por la licencia de la competición.
- Licencia "other" sin especificar: no se detallan los términos exactos de uso, lo que impide confirmar si el modelo puede utilizarse comercialmente sin restricciones.
- Rendimiento desigual en objetos pequeños: las marcas menores de 12 px tienen una tasa de acierto del 82.8%, y 10 de los 11 fallos completos del proposal stage corresponden a este rango. No es fiable para aplicaciones donde los defectos mínimos sean críticos sin un fine-tuning adicional.
- Modelo incompleto: solo el fold 0 está entrenado; los folds 1–4 no se han ejecutado, por lo que no hay una validación cruzada completa ni un modelo ensemble.
- Riesgo de alucinación de diferencias: como cualquier detector entrenado con datos limitados (200 pares de entrenamiento), puede producir falsos positivos en patrones de sombra, textura o desenfoque que no haya visto durante el entrenamiento.
- Sin soporte de eliminaciones: el modelo asume que nunca hay eliminaciones (basado en el análisis del dataset de competición). En escenarios reales donde sí puedan producirse, el filtro de polaridad descartará incorrectamente esas detecciones.
- Sin cuantizaciones publicadas: no se ofrecen versiones cuantizadas (INT8, FP16, GGUF), lo que limita el despliegue en entornos con restricciones de memoria o en CPU.
- Repositorio privado: el código y los pesos están pensados como entrega de trabajo, no como lanzamiento mantenido. No hay garantías de soporte ni de actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddhant20/task1
- Perfil del autor: https://huggingface.co/siddhant20
- Repositorio GitHub del autor (no relacionado directamente con este modelo): https://github.com/Siddhant20020/AI-ML-Assessment-Task
