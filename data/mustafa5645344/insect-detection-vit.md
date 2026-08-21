# Mustafa5645344/insect-detection-vit

## Resumen

El modelo `Mustafa5645344/insect-detection-vit` es un Vision Transformer (ViT) de base (`google/vit-base-patch16-224-in21k`) ajustado para clasificar 21 especies de insectos de interés agrícola, tanto plagas como benéficos. Desarrollado por Mustafa Caliskan, resuelve el problema de identificación automática de insectos en cultivos, un paso clave para la gestión integrada de plagas y la agricultura de precisión. Su relevancia actual radica en la creciente demanda de soluciones de monitoreo automatizado que reduzcan el uso de pesticidas y mejoren la toma de decisiones en campo.

El modelo se entrenó durante 20 épocas (16.600 iteraciones) en una GPU NVIDIA A100 SXM4 de 40 GB, con un tiempo total de entrenamiento de 31 minutos y 25 segundos. Alcanza una precisión top-1 del 98,51% y un F1-score macro del 98,58% en el dataset de validación. La arquitectura es un transformer estándar de visión con parches de 16x16 píxeles y resolución de entrada de 224x224. El repositorio incluye pesos en formato safetensors (85,8 millones de parámetros) y una licencia MIT, lo que facilita su integración en proyectos comerciales y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch16-224) |
| Parametros totales | 85.814.805 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr (etiquetas de clase en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ViT-Base de Google, que divide la imagen en parches de 16x16 píxeles y los procesa mediante un transformer estándar con atención multi-cabeza. El backbone preentrenado en ImageNet-21k se ajustó completamente (fine-tuning) sobre el dataset propietario "Specifly 50K Insect Dataset", que contiene imágenes de 21 clases de insectos agrícolas. El entrenamiento se realizó con resolución de 224x224, durante 20 épocas completas, utilizando una GPU NVIDIA A100 SXM4 de 40 GB. No se menciona el uso de técnicas como RLHF o DPO, ya que es un modelo de clasificación supervisada. La pérdida de entrenamiento final fue de 0,0001, con una pérdida de validación de 0,1153, lo que sugiere un buen ajuste sin sobreentrenamiento excesivo.

## Capacidades

- Clasificacion de imagenes de insectos en 21 categorias: hormigas, pulgones, abejas, mariposas, orugas, cigarras, libelulas, saltamontes, crisopas, mariquitas, saltahojas, mantis, grillos topo, saltahojas de plantas, escarabajos rinoceronte, chinches del arroz, arañas, barrenadores del tallo, chinches apestosas, gorgojos y una clase "undefined" para casos ambiguos.
- Inferencia rapida y ligera: al ser un ViT-Base, puede ejecutarse en GPU de consumo medio y en CPU con tiempos razonables.
- Integracion sencilla con la libreria `transformers` de Hugging Face mediante `AutoModelForImageClassification`.
- Soporte para clasificacion de una sola imagen o lotes, con salida de probabilidades softmax.
- Capacidad multilingue limitada: las etiquetas de clase estan en ingles, aunque el modelo en si no procesa texto.

## Casos de uso

- Monitoreo de plagas en cultivos: el modelo puede integrarse en trampas inteligentes o drones para identificar automaticamente insectos daninos (pulgones, barrenadores, chinches) y activar alertas tempranas, reduciendo la necesidad de inspeccion manual.
- Control biologico: distingue insectos beneficos (mariquitas, crisopas, abejas) de plagas, permitiendo a los agricultores decidir si liberar depredadores naturales en lugar de aplicar pesticidas.
- Investigacion entomologica: clasificacion rapida de especimenes en estudios de biodiversidad o en laboratorios, acelerando el etiquetado de colecciones.
- Aplicaciones educativas: identificacion de insectos en apps de campo para estudiantes o aficionados a la naturaleza, con una precision alta en las 21 clases soportadas.
- Agricultura de precision: combinado con sistemas de vision por computador (como YOLOv8) en un pipeline hibrido, puede proporcionar deteccion en tiempo real y clasificacion fina, como se muestra en el repositorio del autor.
- Asistencia a tecnicos agricolas: el modelo puede servir como segunda opinion en la identificacion de especies problematicas, mejorando la consistencia de los diagnosticos.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el dataset de validacion "Specifly 50K Insect Dataset":

| Metrica | Valor |
|---|---|
| Accuracy (top-1) | 98,51% |
| F1-Score (macro) | 98,58% |

Estos valores corresponden a la epoca 20 (final). No se proporcionan comparaciones con otros modelos en la informacion disponible. La tabla de entrenamiento muestra una evolucion estable desde la epoca 1 (97,41% accuracy) hasta la epoca 20 (98,51%), con una ligera fluctuacion en la perdida de validacion a partir de la epoca 10.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 85,8 millones de parametros, por lo que en precision FP32 ocupa aproximadamente 343 MB. Con cuantizacion a FP16 o INT8, el uso de VRAM se reduce a unos 172 MB o 86 MB respectivamente, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP32. Una NVIDIA GTX 1060, RTX 2060 o superior funcionaria sin problemas. Para entrenamiento se uso una A100 de 40 GB, pero no es necesaria para inferencia.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU moderna de consumo (serie RTX 30/40, incluso integradas con suficiente RAM compartida).
- Opciones de despliegue: se puede servir con `transformers` + PyTorch, o exportar a ONNX para optimizacion. Tambien es compatible con `torchserve` o `FastAPI` para API REST. No se menciona soporte para vLLM u Ollama, ya que no es un modelo de lenguaje.
- Latencia estimada: en una GPU RTX 3090, la inferencia de una imagen de 224x224 deberia tomar menos de 10 ms. En CPU, puede rondar los 100-200 ms por imagen.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de clasificacion de insectos en la informacion proporcionada. Sin embargo, se pueden mencionar alternativas genericas:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| Mustafa5645344/insect-detection-vit | 85,8M | 224x224 | 98,51% acc (21 clases) | MIT |
| InsectNet (modelo de referencia) | no disponible | no disponible | clasifica 2.500 especies | no disponible |
| Modelos YOLOv8 de deteccion de insectos | variable | variable | no disponible | AGPL-3.0 (YOLOv8) |

La comparativa es limitada porque InsectNet (publicado en PNAS Nexus) cubre un rango mucho mayor de especies, mientras que este modelo se especializa en 21 clases agricolas. Para casos de uso especificos en cultivos, la precision de este ViT puede ser superior, pero no hay datos publicos que lo confirmen.

## Limitaciones y advertencias

- Sesgos de dataset: el modelo se entreno con un dataset propietario de 50.000 imagenes, pero no se detalla la distribucion geografica ni las condiciones de captura. Puede tener un rendimiento inferior en especies no representadas o en imagenes con fondos muy diferentes a los de entrenamiento.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, pero puede asignar una etiqueta incorrecta con alta confianza en imagenes ambiguas o fuera de distribucion. La clase "undefined" ayuda, pero no es infalible.
- Limitaciones de clases: solo reconoce 21 categorias. Cualquier insecto fuera de esa lista se clasificara erroneamente en una de las clases existentes o en "undefined".
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el dataset de entrenamiento no tiene una licencia explicita en la informacion proporcionada, lo que podria afectar a la redistribucion del modelo si el dataset tiene restricciones.
- Dependencia de la resolucion: el modelo espera imagenes de 224x224. Imagenes de mayor resolucion deben redimensionarse, lo que puede perder detalles finos de especies pequenas.
- Sin soporte para deteccion de multiples objetos: es un clasificador de imagen completa, no un detector. Para localizar insectos en una escena, se necesita un modelo de deteccion previo (como YOLOv8).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mustafa5645344/insect-detection-vit
- Repositorio del proyecto hibrido (YOLOv8 + ViT + Gemini): https://github.com/Mustafa-Caliskan/Insect-Detection-System-YOLOv8-ViT-Gemini
- Referencia a InsectNet (modelo de clasificacion de insectos a gran escala): https://academic.oup.com/pnasnexus/article/4/1/pgae575/7933354
- Proyecto Insect Detect (camara trampa DIY): https://github.com/maxsitt/insect-detect
