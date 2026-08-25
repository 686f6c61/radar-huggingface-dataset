# maianh511/PP_OCRv4_mobile_det_finetune_PortVehicleOCR

## Resumen

El modelo `maianh511/PP_OCRv4_mobile_det_finetune_PortVehicleOCR` es un ajuste fino (fine-tuning) del detector de texto ligero `PaddlePaddle/PP-OCRv4_mobile_det`, desarrollado por el equipo de PaddleOCR. El ajuste se ha realizado sobre el dataset `maianh511/PortVehicleOCR`, compuesto por imágenes de vehículos portuarios (matrículas, contenedores, etc.) con anotaciones de regiones de texto. El objetivo es mejorar la precisión de detección de texto en imágenes del dominio logístico-portuario, que presentan condiciones de iluminación, ángulos de cámara y calidad de imagen diferentes a los datos genéricos de entrenamiento del modelo base.

Este modelo se presenta como una solución específica para OCR en entornos portuarios, donde la detección fiable de matrículas y códigos de contenedor es crítica para la automatización de procesos. Al estar basado en PP-OCRv4_mobile_det, hereda su diseño optimizado para despliegue en dispositivos de borde, lo que lo hace adecuado para aplicaciones en tiempo real con recursos limitados. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en PP-OCRv4_mobile_det, red neuronal de detección de texto) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica, es un modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base PP-OCRv4 soporta múltiples idiomas, pero no se especifica para este fine-tuning) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente formato PaddlePaddle, pero no se indica) |

## Arquitectura y entrenamiento

El modelo se basa en `PP-OCRv4_mobile_det`, un detector de texto de la serie PP-OCRv4 desarrollado por el equipo de PaddleOCR. Este detector está optimizado para eficiencia en dispositivos móviles y de borde, priorizando la velocidad y el bajo consumo de recursos frente a la precisión máxima. La arquitectura concreta (backbone, neck, head) no se detalla en la información disponible.

El entrenamiento consiste en un ajuste fino sobre el dataset `maianh511/PortVehicleOCR`, que contiene imágenes de vehículos portuarios con anotaciones de texto (matrículas, códigos de contenedor, etc.). No se especifica el número de imágenes, el número de épocas, ni las técnicas de aumento de datos utilizadas. Tampoco se indica si se emplearon métodos de optimización adicionales como RLHF o DPO, que no son habituales en modelos de detección de objetos.

## Capacidades

- Detección de regiones de texto en imágenes, devolviendo cuadros delimitadores (bounding boxes) para cada área de texto detectada.
- Especializado en texto presente en vehículos portuarios: matrículas, códigos de contenedor, señalización, etc.
- Hereda la capacidad del modelo base para detectar texto impreso y manuscrito en diversos escenarios, aunque el fine-tuning puede haber reducido su generalización fuera del dominio portuario.
- Integrable con el ecosistema PaddleOCR para pipelines completos de OCR (detección + reconocimiento).
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, ni soporte de visión más allá de la detección de texto.

## Casos de uso

- Control de acceso en puertos: el modelo puede detectar matrículas de vehículos en imágenes de cámaras de entrada/salida, permitiendo automatizar la identificación de vehículos autorizados.
- Seguimiento de contenedores: detección de códigos de contenedor (ISO 6346) en imágenes capturadas por grúas o cámaras fijas, facilitando la trazabilidad en tiempo real.
- Automatización de procesos logísticos: integración con sistemas de gestión de terminales portuarias para extraer automáticamente identificadores de vehículos y contenedores, reduciendo errores de captura manual.
- Inspección de mercancías: detección de texto en imágenes de inspección aduanera, como números de precinto o etiquetas de carga.
- Vigilancia y seguridad: análisis de imágenes de CCTV para identificar vehículos por su matrícula en zonas restringidas.
- Documentación de operaciones: generación de registros digitales a partir de fotografías tomadas en el puerto, con detección automática de los campos relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados de evaluación (precisión, recall, hmean) se añadirán una vez completado el benchmarking sobre el conjunto de prueba, pero no se proporcionan datos actuales.

## Requisitos de hardware

- Al ser un modelo ligero (mobile), está diseñado para ejecutarse en dispositivos con recursos limitados, como CPUs ARM, Raspberry Pi, o GPUs de gama baja.
- No se especifican requisitos de VRAM ni GPU concretas. Se espera que sea ejecutable en hardware de consumo, pero no hay cifras confirmadas.
- Opciones de despliegue: el modelo se integra con PaddleOCR, que ofrece inferencia en Python, y puede exportarse a formatos como ONNX o Paddle Lite para despliegue en edge.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de detección de texto. El modelo base `PP-OCRv4_mobile_det` es su referencia directa, y este fine-tuning busca mejorar su rendimiento en el dominio portuario. Alternativas como EAST, CRAFT o los detectores de la serie PaddleOCR (PP-OCRv3, PP-OCRv4) podrían ser comparables, pero no se han publicado métricas comparativas en la información disponible.

## Limitaciones y advertencias

- El modelo está ajustado específicamente para imágenes de vehículos portuarios; su rendimiento en otros dominios (documentos escaneados, carteles urbanos, etc.) puede ser inferior al del modelo base.
- No se han publicado métricas de evaluación, por lo que se desconoce su precisión real y su tasa de falsos positivos/negativos.
- El dataset de entrenamiento no está descrito en detalle (tamaño, distribución de clases, calidad de anotaciones), lo que dificulta evaluar posibles sesgos.
- Al ser un modelo de detección de texto, no realiza reconocimiento de caracteres; para obtener el texto completo se necesita un modelo de reconocimiento adicional (por ejemplo, PP-OCRv4_mobile_rec).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de las imágenes del dataset si se utiliza en producción.
- No se garantiza soporte para todos los idiomas; aunque el modelo base es multilingüe, el fine-tuning puede haber reducido su capacidad en idiomas no representados en el dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maianh511/PP_OCRv4_mobile_det_finetune_PortVehicleOCR
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv4_mobile_det
- Dataset de entrenamiento: https://huggingface.co/datasets/maianh511/PortVehicleOCR
- Repositorio de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
