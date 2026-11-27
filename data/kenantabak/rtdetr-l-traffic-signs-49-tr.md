# kenantabak/rtdetr-l-traffic-signs-49-tr

## Resumen

RT-DETR-L para detección de señales de tráfico es un modelo de detección de objetos basado en la arquitectura RT-DETR (Real-Time Detection Transformer) en su variante grande (L), exportado a formato ONNX en FP32. Lo publica el usuario kenantabak en Hugging Face y está especializado en la detección de señales de tráfico de dirección, con un total de 49 clases entrenadas sobre un conjunto de 1.478 imágenes. El modelo resuelve el problema de localizar y clasificar señales viales en imágenes, una tarea relevante para sistemas de asistencia a la conducción y conducción autónoma.

La relevancia de esta publicación radica en su carácter práctico: se distribuye como un único fichero ONNX de 122,63 MB que puede ejecutarse con ONNX Runtime sin dependencias de frameworks de deep learning pesados, lo que facilita su integración en pipelines de producción y en entornos con recursos limitados. El autor documenta métricas de validación propias (mAP@50 del 82,75 %) y latencias medidas en CPU, lo que permite una evaluación rápida antes de su adopción.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y con una model card que no detalla la composición exacta del dataset ni el proceso de entrenamiento más allá de los hiperparámetros básicos. La licencia MIT permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RT-DETR-L (Real-Time Detection Transformer, variante grande) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 768×768) |
| Tipos de cuantización | FP32 (única versión publicada); no se documentan otras |
| Idiomas soportados | tr, en (etiquetas y documentación; la tarea es visual) |
| Licencia | MIT |
| Formato de pesos | ONNX (FP32), fichero `best.onnx` de 122,63 MB |

## Arquitectura y entrenamiento

El modelo emplea RT-DETR-L, un detector basado en transformer que elimina la necesidad de componentes posteriores al procesamiento como NMS (Non-Maximum Suppression) y utiliza un decodificador con consultas de objeto para predecir directamente las cajas y clases. La entrada es una imagen RGB redimensionada a 768×768 píxeles, normalizada a rango [0,1] y en formato NCHW. La salida se obtiene mediante una única pasada de ONNX Runtime.

El entrenamiento se realizó durante 60 épocas en una NVIDIA H200 (141 GB HBM3e) con precisión mixta (AMP), con un tiempo total de 31,40 minutos y un pico de VRAM de 14,80 GB. El conjunto de datos consta de 1.478 imágenes anotadas con 49 clases de señales de tráfico. No se especifican en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento (no aplica), ni si se emplearon técnicas de aumento de datos, RLHF o DPO (no aplicables a detección de objetos). Tampoco se detalla la función de pérdida ni el optimizador utilizado.

## Capacidades

- Detección de objetos en imágenes: localización y clasificación de señales de tráfico en 49 clases distintas.
- Entrada de imagen de resolución fija 768×768 píxeles, con preprocesado estándar (redimensionado, normalización y transposición a NCHW).
- Inferencia en CPU mediante ONNX Runtime con el proveedor `CPUExecutionProvider`, sin necesidad de GPU.
- Salida en formato tensor compatible con el ecosistema ONNX, con shapes documentadas en la model card.
- Soporte de ejecución en entornos con recursos limitados gracias al tamaño reducido del fichero (122,63 MB).
- Capacidades multilingües limitadas a etiquetas y documentación en turco e inglés; la tarea en sí es visual y no depende del idioma.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión adicional, audio ni otras capacidades generativas.

## Casos de uso

- Asistencia a la conducción (ADAS): el modelo puede integrarse en un sistema embebido que procese fotogramas de una cámara frontal para detectar señales de tráfico y alertar al conductor, gracias a su formato ONNX ligero y a la posibilidad de ejecución en CPU.
- Conducción autónoma en entornos controlados: como componente de percepción para la identificación de señales de dirección en vehículos autónomos de baja velocidad, con la ventaja de que el modelo está entrenado específicamente en 49 clases de señales.
- Inventario y mantenimiento de infraestructura vial: procesamiento por lotes de imágenes capturadas por vehículos de inspección para catalogar el estado y la ubicación de las señales, aprovechando la inferencia por lotes con ONNX Runtime.
- Sistemas de navegación aumentada: superposición de información contextual sobre señales detectadas en tiempo real en aplicaciones móviles o de realidad aumentada, donde el bajo peso del modelo (122 MB) facilita el despliegue en dispositivos con recursos moderados.
- Investigación en visión por computador: uso como baseline para experimentos de detección de objetos con RT-DETR, comparando variantes de arquitectura y técnicas de aumento de datos, dado que el autor publica un benchmark multiarquitectura en GitHub.
- Educación y prototipado: ejemplo práctico de despliegue de un detector transformer en ONNX para cursos y talleres, con código de inferencia mínimo basado en NumPy y ONNX Runtime.
- Validación de datasets de señales de tráfico: el modelo puede emplearse para preanotar imágenes nuevas y acelerar el etiquetado manual en proyectos de recolección de datos viales.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| mAP@50 | 82,75 % |
| mAP@50-95 | 71,44 % |
| Precision | 80,21 % |
| Recall | 82,56 % |
| F1 | 69,81 % |
| Latencia en CPU (Intel Xeon @ 2,20 GHz, 4 hilos) | 1185,1 ms (0,84 FPS) |
| Tamaño del modelo ONNX (FP32) | 122,63 MB |
| VRAM pico en entrenamiento | 14,80 GB |

No se han publicado resultados comparativos con otros modelos en la información disponible. Las métricas anteriores son observaciones del autor en sus propios experimentos controlados y no constituyen una garantía de rendimiento en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo se distribuye en FP32 y el autor reporta inferencia en CPU, por lo que no se documenta el consumo en GPU.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una NVIDIA H200, pero no se especifican GPU recomendadas para inferencia.
- Compatibilidad con GPU de consumo: no documentada. El tamaño del fichero (122,63 MB) sugiere que cabría en GPUs de consumo, pero no se aportan datos de VRAM ni latencia en GPU.
- Opciones de despliegue: ONNX Runtime (probado con `CPUExecutionProvider`); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 1185,1 ms por imagen (0,84 FPS) en CPU Intel Xeon @ 2,20 GHz con 4 hilos; no se documentan métricas en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor referencia un benchmark multiarquitectura en GitHub (evren-multiarch-cv-onnx-benchmark), pero no se incluyen resultados de otros modelos en la información disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RT-DETR-L traffic signs 49 (este modelo) | no disponible | no aplica | mAP@50 82,75 % | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo; el dataset de 1.478 imágenes puede no representar la diversidad de señales, condiciones de iluminación, climas o países, lo que puede provocar un rendimiento inferior en dominios no vistos.
- Riesgo de alucinación: como detector de objetos, puede producir falsos positivos y falsos negativos; las métricas reportadas (Precision 80,21 %, Recall 82,56 %) indican que aproximadamente una de cada cinco detecciones puede ser incorrecta.
- Limitaciones de contexto o idioma: la entrada está fijada a 768×768 píxeles; señales pequeñas o imágenes de muy alta resolución pueden requerir redimensionado que degrade la detección. Las etiquetas están en turco e inglés, lo que puede limitar su uso directo en otros idiomas sin traducción.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información disponible.
- Caveats para producción: el autor advierte explícitamente que las métricas son observaciones de sus propios experimentos y no constituyen una garantía de producción ni un uso clínico. No se documenta el proceso de validación cruzada ni la robustez frente a condiciones adversas, por lo que se recomienda una evaluación independiente antes de desplegar el modelo en sistemas críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/rtdetr-l-traffic-signs-49-tr
- Dataset relacionado: https://huggingface.co/datasets/kenantabak/evren-traffic-signs-40class-detection-tr
- Benchmark multiarquitectura CV y ONNX (GitHub): https://github.com/kenantabak/evren-multiarch-cv-onnx-benchmark
- Paquete de evaluación y auditoría visual de errores (GitHub): https://github.com/kenantabak/evren-cv-eval-visual-audit
- Artículos técnicos (Dev.to): https://dev.to/kenantabak
