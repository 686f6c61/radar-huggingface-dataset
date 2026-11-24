# cansik/depthpro2-onnx

## Resumen

Depth Pro 2 ONNX es una exportación comunitaria al formato ONNX del modelo Depth Pro 2 Small de Apple, orientado a la estimación de profundidad métrica a partir de una única fotografía. El repositorio, publicado por el usuario cansik, no entrena un modelo nuevo, sino que convierte los pesos originales de Apple a ONNX para facilitar su despliegue en entornos de inferencia estándar sin dependencias de frameworks de deep learning completos. Cada archivo incluye el estimador de longitud focal de Apple, lo que permite obtener profundidad en metros y la focal en píxeles en una sola pasada.

El modelo resuelve el problema de la estimación de profundidad monocular con escala métrica absoluta, es decir, sin necesidad de conocer la distancia real a los objetos ni de calibración de cámara. A diferencia de otros estimadores de profundidad relativos, Depth Pro 2 Small produce mapas de profundidad en metros directamente utilizables en pipelines de visión por computador, robótica o generación de contenido 3D. La exportación ONNX mantiene la entrada de tamaño variable, lo que permite procesar imágenes de distintas resoluciones sin reescalado forzado.

La relevancia actual de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de profundidad de Apple en CPU o GPU mediante ONNX Runtime, con variantes cuantizadas a FP16 e INT8 que reducen el peso del archivo hasta 65 MB. La licencia Apple AMLR restringe el uso a investigación científica y desarrollo académico no comercial, lo que condiciona su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Depth Pro 2 Small de Apple; exportación ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; acepta imágenes de tamaño variable) |
| Tipos de cuantizacion | FP32, FP16 (almacenamiento FP16, inferencia FP32), INT8 blockwise (bloques de 32, operador `MatMulNBits`) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apple AMLR (Apple Machine Learning Research Model License), solo investigación no comercial y desarrollo académico |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de parámetros, la composición del dataset de entrenamiento ni el proceso de optimización del modelo base Depth Pro 2 Small de Apple en la información proporcionada. La model card describe únicamente la exportación ONNX y sus variantes de cuantización, no los detalles del entrenamiento original.

La innovación técnica documentada en esta exportación es la integración del estimador de longitud focal de Apple dentro del mismo grafo ONNX, de modo que el modelo devuelve simultáneamente profundidad en metros, profundidad inversa normalizada por focal y la longitud focal estimada en píxeles. La exportación admite entrada dinámica `(1, 3, H, W)` en `uint8` RGB, y la variante INT8 emplea cuantización simétrica de pesos en bloques de 32 mediante el operador `MatMulNBits` de ONNX Runtime, aplicada únicamente a las multiplicaciones de matrices elegibles.

## Capacidades

- Estimación de profundidad métrica absoluta (en metros) a partir de una sola imagen RGB.
- Estimación de profundidad inversa normalizada por longitud focal.
- Estimación de longitud focal en píxeles integrada en el mismo grafo.
- Acepta imágenes de tamaño variable sin reescalado obligatorio.
- Procesamiento en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Tres variantes de precisión (FP32, FP16, INT8) con degradación controlada de la precisión.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente de visión.

## Casos de uso

- **Reconstrucción 3D y fotogrametría**: el modelo proporciona profundidad en metros por píxel, lo que permite generar nubes de puntos a escala real a partir de una sola foto sin calibración de cámara, adecuado para pipelines de reconstrucción con una única vista.
- **Robótica y navegación**: la profundidad métrica absoluta permite a un robot estimar distancias reales a obstáculos desde una cámara monocular, útil en drones o robots móviles con recursos limitados donde la variante INT8 de 65 MB cabe en memoria embebida.
- **Efectos de desenfoque y post-proceso fotográfico**: la profundidad inversa normalizada por focal permite generar máscaras de desenfoque selectivo (efecto bokeh) en imágenes ya capturadas, sin necesidad de hardware de doble cámara.
- **Generación de contenido 3D y realidad aumentada**: la profundidad métrica sirve para colocar objetos virtuales con oclusión correcta en escenas reales, usando la focal estimada para alinear la cámara virtual con la real.
- **Análisis de imágenes médicas o industriales con escala conocida**: en entornos controlados donde se requiere una estimación de distancia absoluta, el modelo puede medir dimensiones aproximadas de objetos en la escena a partir de una sola captura.
- **Prototipado académico en CPU**: al ser una exportación ONNX de 65-192 MB ejecutable con ONNX Runtime en CPU, permite a investigadores integrar estimación de profundidad en experimentos sin GPU dedicada ni instalación de frameworks pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K, no aplicables a un modelo de visión) en la información disponible. La model card sí documenta diferencias de precisión de las variantes cuantizadas respecto a FP32, medidas sobre la foto de ejemplo de Apple redimensionada a 384 × 288 con ONNX Runtime 1.32.0 en CPU:

| Pesos | Diferencia de profundidad (mediana / P95) | Diferencia de longitud focal |
|---|---:|---:|
| FP16 | 0,01 % / 0,08 % | 0,02 % |
| INT8 | 0,30 % / 1,00 % | 0,03 % |

Las diferencias son porcentajes absolutos relativos a FP32. Las estadísticas de profundidad cubren píxeles donde ambas estimaciones fueron finitas y la profundidad inversa FP32 superó 0,001. En la variante INT8, el 0,04 % de los píxeles cambió su condición de finitud respecto a FP32.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; el tamaño del archivo (65-192 MB) sugiere un consumo de memoria moderado en CPU o GPU, pero no se documenta la huella exacta en inferencia.
- **GPU recomendadas**: no disponible; la model card solo valida la ejecución en CPU con `CPUExecutionProvider`.
- **Compatibilidad con GPU de consumo**: no confirmada en la información disponible; al ser ONNX, podría ejecutarse en GPU mediante los execution providers de ONNX Runtime (CUDA, DirectML, etc.), pero no se documenta ni se han publicado pruebas.
- **Opciones de despliegue**: ONNX Runtime (probado en versión 1.32.0); requiere `onnxruntime`, `numpy` y `pillow`.
- **Latencia y throughput**: no disponibles; solo se documenta la resolución de prueba (384 × 288) y el entorno (CPU), sin tiempos de ejecución.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de estimación de profundidad monocular (como MiDaS, Depth Anything o el propio Depth Pro original) que permitan una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia Apple AMLR limita el uso a investigación científica y desarrollo académico no comercial; el uso comercial requiere autorización expresa de Apple.
- **Naturaleza derivada**: es una exportación comunitaria, no oficial, de los pesos de Apple; no hay garantía de mantenimiento, soporte ni paridad exacta con el modelo original más allá de las diferencias documentadas.
- **Pérdida de precisión en cuantización**: la variante INT8 introduce hasta un 1,00 % de diferencia en el percentil P95 de profundidad y altera la finitud del 0,04 % de los píxeles, lo que puede ser relevante en aplicaciones de medición precisa.
- **Riesgo de alucinación geométrica**: como todo estimador monocular, puede producir profundidades plausibles pero incorrectas en escenas con superficies reflectantes, transparentes, texturas repetitivas o iluminación atípica; no se documentan sesgos específicos.
- **Sin datos de sesgo**: no se dispone de información sobre sesgos demográficos, geográficos o de otro tipo, ni sobre el dataset de entrenamiento original.
- **Sin validación en GPU**: la model card solo valida la ejecución en CPU; el rendimiento y la corrección en GPU no están documentados.
- **Idiomas**: al ser un modelo de visión, la fila de idiomas no aplica; no se documentan capacidades lingüísticas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cansik/depthpro2-onnx
- Modelo base Depth Pro 2 Small: https://huggingface.co/apple/DepthPro2-S
- Estimador de longitud focal: https://huggingface.co/apple/DepthPro2-focal
- Repositorio oficial de Apple (ml-depth-pro-2): https://github.com/apple-aiml-research/ml-depth-pro-2
- Licencia del modelo: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/LICENSE_MODEL
- Agradecimientos a terceros: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/ACKNOWLEDGEMENTS
- Imagen de ejemplo: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/assets/example.jpg
