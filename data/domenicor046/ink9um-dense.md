# domenicor046/ink9um-dense

## Resumen

El modelo `domenicor046/ink9um-dense` es un conjunto de cuatro checkpoints de detección de tinta en papiros, desarrollados por el autor `domenicor046` en el contexto del Vesuvius Challenge. Su objetivo es identificar la presencia de tinta en imágenes tridimensionales de alta resolución (9 micras por vóxel) de rollos de papiro carbonizados, una tarea clave para la lectura no invasiva de textos antiguos. El modelo se basa en la arquitectura de referencia `scrollprize/ink_9um` y la mejora mediante el uso de pseudo-etiquetas densas generadas a partir de segmentos adicionales, lo que reduce el sobreajuste y mejora la precisión en regiones no vistas.

La relevancia de este modelo radica en que ofrece una alternativa con supervisión densa frente a los checkpoints oficiales liberados, demostrando mejoras consistentes en precisión balanceada y AUC en tres regiones de validación. Además, los autores documentan explícitamente la variabilidad entre checkpoints oficiales y la importancia de seleccionar el adecuado, un aspecto crítico para la reproducibilidad en este tipo de tareas. El repositorio incluye código, scripts y documentación bajo licencia MIT, aunque los pesos derivan de datos del Vesuvius Challenge y están sujetos a sus términos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida 3D-2D (según configuración `aligned21_hybrid_3d2d.json`); no se especifican detalles adicionales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión por computadora) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT (scripts y documentación); checkpoints derivados de datos del Vesuvius Challenge sujetos a sus términos |
| Formato de pesos | PyTorch (`.pth`), con archivos `model` / `config` / `step` (138 MB por checkpoint) |

## Arquitectura y entrenamiento

La arquitectura no está descrita en detalle en la información proporcionada, pero se menciona que los checkpoints se entrenan con la configuración `aligned21_hybrid_3d2d.json` procedente del repositorio `villa`, lo que sugiere una red híbrida que combina capas convolucionales 3D y 2D para procesar volúmenes de imagen. El entrenamiento se realizó con 78,125 iteraciones, batch de 64, optimizador SGD con learning rate 0.01, precisión fp16, normalización `robust_mad`, y pérdida BCE con label smoothing de 0.5. Se utilizó una ventana deslizante de 17 de 21 capas jittered en el eje z, y un corpus completo de 29 representaciones de los rollos. Las cuotas de scroll fijas fueron 0139:29, 1667:22, Paris4:11 y 0814:2. El entrenamiento de cada run tomó 9.5 horas en una RTX 5070 Ti a 2.3 iteraciones por segundo.

La innovación principal es el uso de pseudo-etiquetas densas generadas a partir de siete segmentos (frente a las etiquetas manuales del control). Esto reduce el sobreajuste drásticamente: la diferencia entre la puntuación supervisada y la de validación cae de 0.21–0.29 en los checkpoints de control y oficiales a 0.007–0.099 en los modelos densos. Los resultados muestran que la supervisión densa supera al control en las tres regiones de validación, con mejoras de +0.077, +0.100 y +0.026 en precisión balanceada.

## Capacidades

- Detección de tinta en imágenes volumétricas de papiro a resolución de 9 micras, generando mapas de probabilidad de presencia de tinta.
- Inferencia sobre segmentos de papiro en formato Zarr (`.zarr`), compatible con el CLI de inferencia de `koine_machines` sin modificaciones.
- Soporte para blending con ventana Hann y solapamiento configurable (por ejemplo, 0.5) para mejorar la continuidad de las predicciones.
- Capacidad de procesar múltiples segmentos y regiones, con resultados evaluados en tres regiones de validación específicas.
- Los checkpoints están diseñados para ser intercambiables, permitiendo comparar el efecto de la supervisión densa frente a etiquetas manuales.

## Casos de uso

- **Investigación en papirología**: el modelo puede aplicarse a segmentos de papiro carbonizado para identificar regiones con tinta, facilitando la posterior reconstrucción de texto por parte de especialistas.
- **Pipeline de lectura de rollos antiguos**: integrable en flujos de trabajo que combinan tomografía de rayos X y aprendizaje profundo para digitalizar y leer textos de la biblioteca de Herculano.
- **Evaluación de métodos de segmentación**: los checkpoints permiten comparar el impacto de pseudo-etiquetas densas frente a etiquetas manuales, sirviendo como referencia para futuros desarrollos en el Vesuvius Challenge.
- **Análisis de robustez**: al incluir varios checkpoints del mismo run y de runs diferentes, se puede estudiar la variabilidad entre semillas y pasos de entrenamiento, útil para entender la estabilidad del modelo.
- **Reproducibilidad de experimentos**: el código y los scripts están publicados en GitHub, permitiendo replicar el entrenamiento y las evaluaciones en otros entornos.
- **Optimización de inferencia**: al ser compatible con el CLI de `koine_machines`, se puede desplegar en entornos con GPU para procesar grandes volúmenes de datos de forma eficiente.

## Benchmarks y rendimiento

Los resultados reportados en la model card se basan en precisión balanceada (threshold 0.5) y AUC sobre tres regiones de validación (`pherc0139-w016`, `pherc0814-46527`, `pherc1667-w029`), que son las únicas con ground truth en la liberación oficial. La tabla siguiente resume los valores:

| Modelo | pherc0139-w016 | pherc0814-46527 | pherc1667-w029 |
|---|---|---|---|
| Control (etiquetas manuales) | 0.7016 / 0.8707 | 0.7539 / 0.8323 | 0.7814 / 0.8945 |
| Denso, todos los 7 segmentos | 0.7783 / 0.8962 | **0.8539** / **0.9350** | 0.8070 / 0.9044 |
| Denso, excluyendo w016 | 0.7496 / **0.9070** | 0.8329 / 0.9298 | 0.7882 / 0.8853 |
| Mejor de los 14 oficiales | 0.8194 / 0.9366 | 0.8129 / 0.8970 | 0.8434 / 0.9334 |

El modelo denso supera al control en las tres regiones, y al mejor checkpoint oficial en `pherc0814-46527` (+0.041). Sin embargo, en las otras dos regiones el mejor oficial sigue siendo superior. La model card también advierte que la precisión balanceada puede discrepar con la calidad visual de las letras (en w016, el modelo con todos los segmentos puntúa más alto pero produce letras fusionadas), por lo que se recomienda el checkpoint `dense9um-w016excluded-step075000.pth` por su legibilidad.

## Requisitos de hardware

- **Entrenamiento**: se realizó en una GPU RTX 5070 Ti (16 GB VRAM) con 9.5 horas por run a 2.3 it/s. No se especifican requisitos mínimos para inferencia.
- **Inferencia**: el CLI de `koine_machines` acepta parámetros como `--batch-size 8` y `--overlap 0.5`, lo que sugiere que puede ejecutarse en GPUs de gama media, aunque no se proporcionan cifras de VRAM.
- **Despliegue**: compatible con el pipeline de inferencia de `koine_machines` (Python). No se mencionan integraciones con vLLM, llama.cpp u otros motores, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no se reportan datos específicos; el rendimiento dependerá del tamaño del segmento y del hardware utilizado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de tinta en papiros) más allá de los checkpoints oficiales del Vesuvius Challenge (`scrollprize/ink_9um`). La model card compara internamente con los 14 checkpoints oficiales, destacando que la variabilidad entre ellos alcanza hasta 0.14 en precisión balanceada según la semilla y el paso. No se mencionan otros modelos de la literatura.

## Limitaciones y advertencias

- **Variabilidad entre checkpoints**: los resultados dependen fuertemente del checkpoint elegido; la semilla 42 en el paso 75000 es el peor en w016 entre los 14 oficiales. Cualquier comparación debe especificar el checkpoint exacto.
- **Sobreajuste reducido pero no eliminado**: aunque la supervisión densa reduce el sobreajuste, aún hay diferencias entre puntuaciones supervisadas y de validación (0.007–0.099).
- **Discrepancia entre métricas y calidad visual**: en w016, el modelo con todos los segmentos puntúa más alto en precisión balanceada pero produce letras ilegibles (fusionadas). La métrica AUC puede no reflejar la calidad perceptible.
- **Licencia y procedencia**: aunque los scripts son MIT, los checkpoints derivan de datos y modelos del Vesuvius Challenge (`scrollprize/ink_9um`, `scrollprize/ink_canonical_2um`, bucket S3 de open-data) y están sujetos a los términos de esas fuentes. No se especifica si el uso comercial está permitido.
- **Idioma y dominio**: el modelo está especializado en imágenes de papiro y no es aplicable a otros dominios de visión.
- **Sin soporte para tareas de lenguaje**: no es un modelo de texto, por lo que no aplica tool calling, agentes ni generación de código.

## Enlaces

- [HuggingFace - domenicor046/ink9um-dense](https://huggingface.co/domenicor046/ink9um-dense)
- [Repositorio GitHub - DomRusso2/ink9um-dense](https://github.com/DomRusso2/ink9um-dense)
- [HuggingFace - domenicor046/ink9um-dense-labels](https://huggingface.co/domenicor046/ink9um-dense-labels)
