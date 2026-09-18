# fovi-pytorch/fovi-dinov3-splus_a-60.94_res-64_in1k

## Resumen

FOVI DINOv3 S+ (resolución 64, a=60,94) es un modelo de visión por computador preentrenado que aplica una interfaz de muestreo foveado a un backbone DINOv3 ViT-S/16+. Lo publica el proyecto `fovi-pytorch`, ligado a la librería `fovi` del repositorio github.com/nblauch/fovi, y deriva del modelo base `facebook/dinov3-vits16plus-pretrain-lvd1689m` de Meta. El modelo no genera texto ni imágenes: es un codificador visual (encoder) pensado para extraer representaciones de entradas muestreadas de forma no uniforme, imitando la magnificación cortical de la retina de los primates.

El problema que aborda es el de la visión activa y de recursos limitados: en lugar de procesar una imagen completa a resolución uniforme, el modelo asume una entrada foveada en la que el centro del campo visual tiene mayor densidad de muestreo que la periferia. El parámetro `a = 60.94` de la model card corresponde a la función de magnificación cortical, y la resolución de sensor declarada es 64. El modelo se ha preentrenado sobre ImageNet-1k, por lo que se distribuye como backbone para ajuste fino, no como clasificador listo para producción.

Es relevante ahora por dos motivos. Primero, se apoya en DINOv3, la familia de backbones auto-supervisados de Meta con mejor relación calidad/coste en visión densa. Segundo, la línea de investigación FOVI (Blauch, Alvarez y Konkle, arXiv 2026) propone desacoplar el coste computacional del campo de visión, algo útil en robótica, drones y edge computing, donde el sensor y el ancho de banda son limitados. El repositorio pesa 0,1 GB, lo que confirma que se trata de una variante pequeña (ViT-S) con un pipeline de inferencia ligero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT-S/16+) DINOv3 adaptado a entradas foveadas |
| Parámetros totales | no disponible (variante ViT-S/16+ del backbone; la model card no publica el recuento) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no generativo) |
| Tipos de cuantización | no disponible (no se documentan pesos cuantizados) |
| Idiomas soportados | no aplica / no disponible (modelo de visión sin componente lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (la model card no especifica safetensors, GGUF ni binarios; el repositorio ocupa 0,1 GB) |
| Modelo base | facebook/dinov3-vits16plus-pretrain-lvd1689m |
| Dataset de preentrenamiento | ImageNet-1k |
| Parámetro de magnificación cortical (a) | 60.94 |
| Resolución de sensor | 64 |
| Librería de carga | `fovi` (pip install git+https://github.com/nblauch/fovi.git) |
| Tamaño del repositorio | 0,1 GB |
| Fecha de creación / última actualización | 2026-02-03 / 2026-09-18 |
| Descargas / likes en HuggingFace | 2 / 0 |

## Arquitectura y entrenamiento

La model card describe la arquitectura como un backbone DINOv3 ViT-S/16+ adaptado para recibir entradas foveadas. DINOv3 es un transformer de visión con atención global por parches y entrenamiento auto-supervisado, y la variante "+" incorpora las mejoras de esa generación de modelos sobre los ViT estándar. Sobre ese backbone, el proyecto FOVI inserta una interfaz de muestreo inspirada en la fóvea: la densidad de muestreo decae desde el centro del campo visual hacia la periferia según una función de magnificación cortical, cuyo hiperparámetro en esta variante es `a = 60.94`. La resolución de sensor declarada es 64.

En cuanto al entrenamiento, el modelo se ha preentrenado sobre ImageNet-1k, el conjunto de referencia de clasificación de imagen natural con 1.000 clases. La model card no detalla el número de tokens o imágenes vistas, la composición exacta del dataset, ni si hubo una fase de ajuste con RLHF o DPO (técnicas, por otra parte, propias de modelos de lenguaje y no aplicables aquí). Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal. El dato técnico diferencial es, por tanto, la propia interfaz foveada y su parámetro de magnificación, no cambios en el mecanismo de atención.

El modelo se distribuye a través de la librería `fovi`, con dos puntos de entrada: `get_model_from_base_fn(...)` para cargar el modelo y `get_trainer_from_base_fn(...)` para obtener un objeto de entrenamiento. La descarga de pesos es automática desde HuggingFace Hub.

## Capacidades

- Extracción de representaciones visuales (embeddings) a partir de imágenes preentrenadas en ImageNet-1k.
- Procesamiento de entradas con muestreo foveado o no uniforme, controlado por el parámetro de magnificación cortical `a`.
- Adaptación al backbone DINOv3 ViT-S/16+, por lo que hereda la capacidad de servir como extractor de características para tareas densas (clasificación, segmentación, detección) tras ajuste fino.
- Carga y entrenamiento vía la librería `fovi`, con utilidades para construir el modelo desde el identificador de HuggingFace Hub.
- Generación de texto: no, no es un modelo generativo.
- Tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica (entrada visual, sin vocabulario ni tokenizador de texto).
- Capacidades especiales: interfaz foveada biológicamente inspirada (magnificación cortical) con resolución de sensor 64; no se documentan modos de pensamiento, audio ni vídeo.

## Casos de uso

- Ajuste fino para clasificación de imágenes con presupuesto de cómputo reducido: al partir de un backbone ViT-S, se puede añadir una cabeza lineal sobre los embeddings y entrenar con pocos recursos; la licencia Apache 2.0 permite su uso comercial sin restricciones de redistribución de pesos.
- Visión activa en robótica: el modelo encaja en bucles donde la cámara no captura una escena completa a alta resolución, sino que muestrea con más detalle la región de interés (fóvea) y menos la periferia, reduciendo el coste por fotograma.
- Percepción en drones y dispositivos embebidos: con 0,1 GB de repositorio y una resolución de sensor de 64, el modelo es candidato para despliegue en hardware con memoria y ancho de banda limitados, aunque requeriría conversión y ajuste previos.
- Investigación en visión biológica y neurociencia computacional: permite comparar representaciones de un backbone estándar frente a uno foveado y estudiar el efecto del parámetro `a` en la calidad de las características extraídas.
- Preentrenamiento de modelos de captura de movimiento o seguimiento de mirada: los embeddings foveados pueden servir como señal para predecir a dónde conviene dirigir la fóvea en el siguiente paso (control de gaze).
- Recuperación de imágenes y búsqueda visual: los embeddings del encoder pueden indexarse para sistemas de búsqueda por similitud donde el coste de inferencia por consulta es crítico.
- Preprocesado en pipelines de imagen médica o industrial con muestreo adaptativo: útil cuando la región diagnóstica ocupa una parte pequeña del campo y el resto puede degradarse sin pérdida relevante de información.
- Base para destilación: al ser un modelo pequeño entrenado sobre un backbone mayor, puede emplearse como alumno en esquemas de destilación hacia arquitecturas aún más ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud top-1 o top-5 sobre ImageNet-1k, ni resultados en tareas de transferencia, ni comparaciones cuantitativas con el modelo base. El nombre del repositorio incluye la cadena `60.94`, que corresponde al hiperparámetro `a` de magnificación cortical, no a una métrica de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia indirecta, el repositorio completo ocupa 0,1 GB, compatible con un modelo de menos de 100 millones de parámetros; en FP32 el uso de memoria sería inferior a 1 GB, y bastante menor en FP16 o cuantizado.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de memoria. No se documentan requisitos oficiales.
- GPU de consumo: sí, cabe con holgura en GPU de consumo (por ejemplo, gama RTX xx60 o superior) e incluso en aceleradores integrados, dado el tamaño del repositorio.
- Opciones de despliegue: no se documentan integraciones con vLLM, TGI, Ollama ni llama.cpp. El único camino soportado explícitamente es la librería `fovi` sobre PyTorch, instalada con `pip install git+https://github.com/nblauch/fovi.git`. La exportación a ONNX, TensorRT o formatos GGUF no está descrita.
- Latencia y throughput: no disponible. La resolución de sensor de 64 sugiere un coste por inferencia bajo en comparación con backbones que procesan entradas de 224x224, pero no se publican cifras de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fovi-dinov3-splus_a-60.94_res-64_in1k (este modelo) | ViT foveado | no disponible (backbone ViT-S/16+) | resolución de sensor 64, parámetro a = 60.94 | ImageNet-1k, partiendo de DINOv3 ViT-S/16+ | apache-2.0 | HuggingFace Hub, 2 descargas |
| facebook/dinov3-vits16plus-pretrain-lvd1689m | ViT estándar (modelo base) | no disponible en la información proporcionada | muestreo uniforme, resolución estándar | preentrenamiento DINOv3 (LVD-1689M según el identificador) | no disponible en la información proporcionada | HuggingFace Hub |
| Otros backbones de visión de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La búsqueda web realizada no ha devuelto información utilizable sobre alternativas comparables: los resultados obtenidos son páginas generales de Wikipedia, sin relación con el modelo. Por tanto, no se puede establecer una comparativa cuantitativa fiable con otros backbones foveados o de tamaño similar.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al haberse preentrenado sobre ImageNet-1k hereda las limitaciones demográficas, geográficas y de representación propias de ese conjunto de datos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir representaciones poco fiables en dominios alejados de la distribución de ImageNet-1k (imagen médica, satelital, industrial).
- Al ser un backbone preentrenado sin cabeza de clasificación documentada, no ofrece predicciones directamente utilizables: requiere ajuste fino para cualquier tarea concreta.
- El muestreo foveado con `a = 60.94` y resolución de sensor 64 implica una pérdida deliberada de información en la periferia del campo visual; la degradación en tareas que dependen de detalles periféricos no está cuantificada.
- La resolución de entrada exacta que espera el modelo (forma del tensor, número de parches, preprocesado) no está especificada en la model card: hay que consultar el código de la librería `fovi` antes de integrarlo.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se atribuya. No se declaran restricciones adicionales, pero conviene verificar la licencia del modelo base DINOv3, que es un componente derivado.
- Advertencia de mantenimiento y adopción: el repositorio tiene 2 descargas y 0 likes en el momento de la consulta, y la librería se instala desde Git en lugar de desde PyPI, lo que añade riesgo de reproducibilidad en producción.
- La model card no documenta versiones de PyTorch compatibles, ni requisitos de CUDA, ni si el modelo funciona correctamente en CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fovi-pytorch/fovi-dinov3-splus_a-60.94_res-64_in1k
- Modelo base DINOv3 ViT-S/16+: https://huggingface.co/facebook/dinov3-vits16plus-pretrain-lvd1689m
- Repositorio de la librería fovi: https://github.com/nblauch/fovi
- Artículo citado en la model card: Blauch, N. M., Alvarez, G. A. y Konkle, T., "FOVI: A biologically-inspired foveated interface for deep vision models", arXiv, 2026 (la model card no incluye el enlace directo al preprint; no disponible)
- Otras referencias: la búsqueda web realizada no ha devuelto enlaces relevantes sobre el modelo (los resultados corresponden a páginas generales de Wikipedia y no guardan relación con esta ficha).
