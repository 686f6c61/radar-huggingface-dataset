# keejkrej/single-cell-pattern-unet

## Resumen

El modelo `keejkrej/single-cell-pattern-unet` es un segmentador semántico binario (foreground/background) diseñado específicamente para imágenes de microscopía de campo claro (brightfield) de micropatrones LISCA, un sistema de cultivo celular en superficies con patrones definidos. Desarrollado por keejkrej (Tianyi Cao), este modelo resuelve el problema de obtener máscaras celulares binarias en sitios individuales de ~128×128 píxeles sin necesidad de ejecutar el modelo completo Cellpose cpsam, que es significativamente más pesado.

La arquitectura es un U-Net denso de aproximadamente 1,9 millones de parámetros (7,4 MB en formato ONNX), destilado a partir de las pseudoetiquetas generadas por Cellpose v4 cpsam (un ViT-L de ~304M parámetros) sobre imágenes propias de la línea celular TF84. El modelo se publica con licencia MIT y está disponible en formato ONNX, lo que facilita su integración en pipelines de análisis de imágenes biomédicas. Su relevancia radica en ofrecer una alternativa ligera y rápida para métricas de intensidad y área en ensayos de expresión génica y unión de ligandos, donde solo se necesita una máscara binaria y no una segmentación celular completa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net denso (encoder-decoder convolucional) |
| Parametros totales | ~1,9 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (formato ONNX, precisión float32) |
| Idiomas soportados | no aplica (procesamiento de imágenes) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura U-Net clásica, con una ruta de contracción (encoder) que extrae características multiescala y una ruta de expansión (decoder) que reconstruye la máscara a resolución completa. Es un modelo denso, sin mecanismos de atención ni mezcla de expertos. La entrada es una imagen RGB de 128×128 píxeles (aunque el origen es en escala de grises, se convierte a RGB con normalización ImageNet) y la salida es un mapa de logits de un solo canal con la misma resolución espacial.

El entrenamiento se realizó mediante destilación de conocimiento: el modelo profesor Cellpose v4 cpsam (ViT-L, ~304M parámetros) generó pseudoetiquetas sobre fotogramas de campo claro de la línea TF84, muestreados con un stride temporal de 20 y descartando máscaras con foreground inferior al 0,1%. El conjunto de datos resultante contiene 41.548 muestras de entrenamiento y 6.990 de validación. El modelo se entrenó durante 40 épocas con un tamaño de imagen de 128×128, alcanzando un Dice de validación de 0,888 en la época 18. El preprocesado incluye normalización min-max a uint8, redimensionado a 128×128, conversión a RGB y normalización con media y desviación estándar de ImageNet. El postprocesado aplica sigmoid con umbral 0,5, redimensionado al tamaño original y relleno de agujeros.

## Capacidades

- Segmentación binaria de células en micropatrones LISCA a partir de imágenes de campo claro.
- Generación de máscaras foreground/background para análisis de intensidad y área en ensayos de expresión génica y unión de ligandos.
- Inferencia rápida y ligera gracias a su reducido número de parámetros (~1,9M) y formato ONNX.
- Integración sencilla en pipelines de Rust o Python mediante la herramienta `lisca-analyze`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la segmentación de imágenes.
- No es multilingüe; es un modelo puramente visual.

## Casos de uso

- Análisis de expresión génica en micropatrones: el modelo genera máscaras binarias de células sobre sitios individuales, permitiendo cuantificar la intensidad de fluorescencia de sondas génicas dentro de la región celular sin incluir fondo.
- Ensayos de unión de ligandos: al segmentar el área celular, se puede medir la señal de unión de proteínas o anticuerpos sobre la superficie celular, normalizando por área.
- Control de calidad en experimentos de micropatrones: detección automática de sitios vacíos o con células ausentes, filtrando imágenes que no contienen células para análisis posteriores.
- Preprocesado para pipelines de análisis de alto rendimiento: al ser un modelo pequeño, puede ejecutarse en lote sobre miles de imágenes sin requerir GPUs potentes, acelerando flujos de trabajo en laboratorios.
- Sustitución de Cellpose cpsam en tareas que solo requieren máscara binaria: reduce el coste computacional y el tiempo de inferencia en entornos de producción donde la segmentación celular completa no es necesaria.
- Entrenamiento de modelos downstream: las máscaras generadas pueden usarse como entrada para clasificadores de presencia celular (como el modelo `mupattern-resnet18` del mismo autor) o para extraer características morfométricas.

## Benchmarks y rendimiento

El único dato de rendimiento publicado es el Dice de validación sobre el conjunto de validación TF84 (6.990 muestras), que alcanza **0,888** en la época 18. No se han publicado comparaciones con otros modelos de segmentación celular en la información disponible. El modelo se presenta como una alternativa ligera a Cellpose cpsam, pero no se proporcionan métricas comparativas de velocidad o precisión frente a otros segmentadores.

| Métrica | Valor |
|---|---|
| Dice (validación TF84) | 0,888 |
| Muestras de entrenamiento | 41.548 |
| Muestras de validación | 6.990 |

## Requisitos de hardware

No se especifican requisitos oficiales de hardware en la documentación. Sin embargo, dado el tamaño del modelo (~1,9M parámetros, 7,4 MB ONNX), se puede inferir que:

- Es ejecutable en CPU sin problemas, con latencia de milisegundos por imagen de 128×128.
- Cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas o de gama baja.
- No requiere hardware especializado; puede desplegarse en entornos edge o en servidores sin GPU.
- El formato ONNX permite usar runtime como ONNX Runtime, TensorRT o cualquier backend compatible.
- No se dispone de datos de throughput o latencia medidos por el autor.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de segmentación celular. El modelo se posiciona como un "estudiante" destilado de Cellpose cpsam, pero no se ofrecen datos comparativos de rendimiento frente a Cellpose u otros U-Net de segmentación. Se puede mencionar que Cellpose cpsam (ViT-L, ~304M) es el modelo profesor, pero no es comparable en tamaño ni en funcionalidad (Cellpose produce máscaras de instancias, mientras que este modelo solo produce foreground/background). No hay información sobre alternativas equivalentes en el mismo nicho.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con imágenes de campo claro de la línea celular TF84 en micropatrones LISCA; puede no generalizar a otros tipos de microscopía (fluorescencia, contraste de fases) o a otras líneas celulares sin reentrenamiento.
- Solo produce segmentación binaria (foreground/background); no distingue células individuales ni proporciona máscaras de instancias.
- El preprocesado y postprocesado están fijados en `export_meta.json`; cualquier desviación en la adquisición de imágenes (iluminación, resolución, formato) puede degradar el rendimiento.
- El modelo profesor (Cellpose cpsam) tiene licencia CC-BY-NC, pero el modelo estudiante se distribuye bajo MIT al haber sido entrenado con imágenes propias; sin embargo, se recomienda verificar la procedencia de los datos si se usan imágenes de terceros.
- No se han publicado análisis de sesgos o errores sistemáticos en poblaciones celulares específicas.
- El tamaño del repositorio en HuggingFace aparece como 0.0 GB, aunque la model card indica ~7,4 MB; es posible que el archivo ONNX no se haya subido correctamente o que la métrica de tamaño esté mal reportada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keejkrej/single-cell-pattern-unet
- Perfil del autor en HuggingFace: https://huggingface.co/keejkrej
- Perfil del autor en GitHub: https://github.com/keejkrej
- Modelo relacionado (clasificador de micropatrones): https://huggingface.co/keejkrej/mupattern-resnet18
