# RobinY99/MR-IQA-2

## Resumen

MR-IQA-2 es un sistema de evaluación y mejora de calidad de imagen (IQA) desarrollado por RobinY99, que combina un modelo de lenguaje y visión (Actor) con un modelo de edición de imágenes (Editor) y un modelo juez (Judge) para evaluar la calidad percibida de una imagen y proponer mejoras. Se basa en el enfoque MR-IQA, que unifica regresión y ranking mediante una vista de margen para la evaluación ciega de calidad, y lo extiende con un entrenamiento por refuerzo de crédito enmascarado (masked-credit). El sistema es relevante porque ofrece un pipeline completo: el Actor analiza la imagen, genera una solución de edición y una puntuación; el Editor aplica esa solución; y el Judge evalúa el resultado, todo con licencia Apache 2.0 y pesos abiertos.

El modelo está compuesto por varios componentes: el Actor se basa en Qwen3-VL-2B (según se indica en la comparativa con MR-IQA), el Editor es una réplica de FLUX.2 Klein 4B, y el Judge es un modelo congelado E5. El repositorio de HuggingFace contiene los tres componentes, con un tamaño total de 43,2 GB. Los idiomas soportados son únicamente inglés, y la librería principal es diffusers para el Editor y transformers para el Actor y el Judge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multi-componente: Actor (Qwen3-VL-2B), Editor (FLUX.2 Klein 4B), Judge (modelo E5 congelado) |
| Parametros totales | No disponible (se estima ~6B sumando Actor 2B + Editor 4B; el Judge no se especifica) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se cargan en bfloat16 para el Editor, el Actor usa torch_dtype="auto") |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también se usa diffusers para el Editor) |

## Arquitectura y entrenamiento

MR-IQA-2 es un sistema compuesto por tres módulos interconectados. El Actor, basado en Qwen3-VL-2B, es un modelo vision-language que recibe una imagen y produce una salida estructurada en JSON con tres campos: `evidence` (evidencia visual), `solution` (solución de edición) y `rating` (puntuación de calidad). El Editor, una réplica de FLUX.2 Klein 4B, toma la solución generada por el Actor y edita la imagen en consecuencia. El Judge, un modelo E5 congelado, evalúa la calidad de la imagen original y la editada, devolviendo las puntuaciones J0 y J1 y su diferencia.

El entrenamiento emplea un enfoque de refuerzo con crédito enmascarado (masked-credit), que asigna crédito únicamente a las partes de la solución que contribuyen a mejorar la calidad según el Judge. Este método se apoya en el marco teórico de MR-IQA, que modela el margen de calidad entre pares de imágenes para evitar la interferencia del ancla de dataset y restaurar la información de distancia continua. Los datos de entrenamiento no están detallados en la información disponible, pero el modelo se evalúa en seis datasets de referencia (KonIQ-10K, SPAQ, LIVE-W, AGIQA-3K, KADID-10K y CSIQ). El checkpoint del Actor recomendado corresponde al paso 1,455 del entrenamiento.

## Capacidades

- Evaluación ciega de calidad de imagen: genera una puntuación numérica (rating) junto con una justificación textual (evidence) y una solución de mejora.
- Edición de imágenes dirigida por lenguaje: el Editor aplica la solución propuesta por el Actor para mejorar la calidad percibida.
- Razonamiento visual y generación de texto estructurado en formato JSON.
- Evaluación comparativa de calidad entre imagen original y editada mediante el Judge.
- Soporte de pipeline completo en un solo paso: entrada de imagen, salida de imagen editada y métricas de evaluación.
- Entrenamiento por refuerzo con crédito enmascarado, que permite optimizar la contribución específica de cada acción de edición.

## Casos de uso

- Control de calidad automatizado en fotografía: el Actor puede puntuar y justificar la calidad de imágenes en lotes, permitiendo filtrar automáticamente las que no superen un umbral de rating.
- Mejora automática de imágenes en pipelines de procesamiento: el sistema completo puede tomar una imagen subóptima, generar una solución de edición y producir una versión mejorada sin intervención humana.
- Evaluación de calidad en datasets de imágenes generadas por IA: el Judge puede comparar la calidad de imágenes sintéticas frente a originales, útil para validar modelos generativos.
- Asistencia en retoque fotográfico: el Actor propone soluciones específicas (superresolución, suavizado, corrección de color) que un editor humano puede aplicar manualmente o de forma automática.
- Benchmarking de modelos de IQA: las métricas PLCC/SRCC del Actor pueden utilizarse para comparar el rendimiento de distintos enfoques de evaluación de calidad.
- Integración en flujos de trabajo de visión por computador: el pipeline puede conectarse a sistemas de captura de imágenes para evaluar y mejorar la calidad en tiempo real, aunque requiere GPU dedicada.

## Benchmarks y rendimiento

La model card proporciona resultados de rendimiento del Actor (solo la parte de evaluación) en seis datasets de generalización, medidos con PLCC (coeficiente de correlación lineal de Pearson) y SRCC (coeficiente de correlación de rangos de Spearman). Se comparan MR-IQA (el modelo anterior) y MR-IQA-2.

| Modelo | KonIQ-10K | SPAQ | LIVE-W | AGIQA-3K | KADID-10K | CSIQ | Average |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| MR-IQA | 0.949 / 0.931 | 0.892 / 0.897 | 0.899 / 0.883 | 0.804 / 0.732 | 0.672 / 0.683 | 0.767 / 0.732 | 0.831 / 0.810 |
| MR-IQA-2 | 0.937 / 0.917 | 0.900 / 0.899 | 0.893 / 0.863 | 0.809 / 0.739 | 0.667 / 0.669 | 0.824 / 0.785 | 0.838 / 0.812 |

Los valores de MR-IQA provienen del paper publicado en arxiv, mientras que los de MR-IQA-2 corresponden al checkpoint del Actor en el paso 1,455. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- El Actor (Qwen3-VL-2B) requiere aproximadamente 4-5 GB de VRAM en fp16, por lo que puede ejecutarse en GPUs de consumo como RTX 3060 o superiores.
- El Editor (FLUX.2 Klein 4B) en bfloat16 necesita alrededor de 8-10 GB de VRAM, lo que lo hace viable en RTX 3090, RTX 4090 o GPUs de datacenter como A100.
- El Judge (modelo E5 congelado) tiene un tamaño no especificado, pero probablemente sea de pocos cientos de MB, sin requisitos exigentes.
- El pipeline completo (Actor + Editor + Judge) se ejecuta secuencialmente en una sola GPU, liberando memoria entre etapas; se recomienda al menos 16 GB de VRAM para mayor comodidad.
- Opciones de despliegue: se proporcionan scripts para configurar entornos de inferencia y pruebas; el código de ejemplo se ejecuta localmente con CUDA 13.0.
- No se indican métricas de latencia o throughput en la documentación disponible.

## Comparativa con modelos similares

La comparativa directa se establece con MR-IQA, el modelo predecesor del mismo autor, que comparte la misma arquitectura de Actor (Qwen3-VL-2B) pero sin el entrenamiento de crédito enmascarado. Los resultados en la tabla de benchmarks muestran una mejora media de MR-IQA-2 en el promedio de PLCC (0.838 vs 0.831) y SRCC (0.812 vs 0.810), aunque con variaciones por dataset. No se dispone de comparaciones con otros modelos de IQA como LIQE, MUSIQ o CLIP-IQA en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- |
| MR-IQA | 2B (Actor) | No disponible | Apache 2.0 | GitHub y HuggingFace |
| MR-IQA-2 | 2B (Actor) + 4B (Editor) | No disponible | Apache 2.0 | GitHub y HuggingFace |

## Limitaciones y advertencias

- El modelo solo soporta inglés, lo que limita su uso en entornos multilingües.
- El repositorio tiene un tamaño de 43,2 GB, lo que puede suponer una barrera de descarga y almacenamiento.
- El rendimiento del Actor varía entre datasets; por ejemplo, en KADID-10K el PLCC es bajo (0.667), lo que indica dificultades con ciertos tipos de distorsión.
- El sistema depende de la calidad del Editor para aplicar las soluciones; si el Editor falla, la evaluación final puede verse afectada.
- No se documentan sesgos específicos, pero al ser un modelo entrenado principalmente en inglés y en datasets de calidad de imagen, puede tener sesgos culturales o de contenido.
- El uso en producción requiere una GPU con suficiente VRAM y el manejo de múltiples dependencias (FlashAttention, CUDA 13.0), lo que complica el despliegue en entornos sin control total.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las licencias de los modelos base (Qwen3-VL y FLUX.2 Klein) que pueden tener restricciones adicionales.

## Enlaces

- [HuggingFace: RobinY99/MR-IQA-2](https://huggingface.co/RobinY99/MR-IQA-2)
- [GitHub: RobinY99/MR-IQA-2](https://github.com/RobinY99/MR-IQA-2)
- [GitHub: RobinY99/MR-IQA (modelo predecesor)](https://github.com/RobinY99/MR-IQA)
- [Paper MR-IQA en arXiv](https://arxiv.org/html/2606.29760v2)
