# DM-Diaz/VEDB-SimCLR-ResNet18-Periph-NF

## Resumen

El modelo VEDB-SimCLR-ResNet18-Periph-NF es un checkpoint de un encoder visual ResNet-18 preentrenado con aprendizaje contrastivo auto-supervisado SimCLR sobre el Visual Experience Dataset (VEDB), un conjunto de imágenes egocéntricas naturalistas con datos de mirada humana sincronizados. Ha sido desarrollado por D. M. Diaz y M. M. Henderson en el contexto del estudio "Eccentricity-Constrained CNN Training Reveals Adaptive Information Coding Around the Visual Field", presentado en la 9.ª Conferencia de Cognitive Computational Neuroscience (CCN 2026). El modelo forma parte de una colección de cuatro variantes (Baseline, Fovea-Gaze, Periph y Periph-NF) que investigan cómo la restricción de la experiencia visual a diferentes porciones del campo visual afecta a las representaciones aprendidas, al rendimiento en tareas posteriores y a la alineación con la corteza visual humana.

La variante Periph-NF combina una máscara periférica contingente a la mirada (escotoma central gris con borde difuminado) con la transformación NeuroFovea, un modelo de transferencia de estilo foveado que aproxima el enmascaramiento periférico mediante representaciones basadas en VGG y operaciones de estilo neuronal. El checkpoint corresponde a la época 120 de preentrenamiento y se distribuye en formato PyTorch (.pth.tar) bajo licencia Apache 2.0. Es un modelo de investigación, con el código de entrenamiento y evaluación aún pendiente de publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch checkpoint (.pth.tar) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura ResNet-18 como encoder visual, preentrenada con el marco SimCLR de aprendizaje contrastivo auto-supervisado. El entrenamiento se realizó sobre el Visual Experience Dataset (VEDB), que contiene imágenes egocéntricas naturalistas con sincronización de movimientos oculares humanos. La condición Periph-NF aplica un preprocesado específico a cada frame: primero se ocluye la región central con un escotoma circular gris (valor de píxel 128) centrado en la posición de mirada del participante, con un desvanecimiento gaussiano (kernel 15) en el borde; posteriormente se aplica la transformación NeuroFovea con escala s = 0.4. NeuroFovea es un modelo de transferencia de estilo foveado que codifica la imagen con características VGG, agrupa información en regiones cuyo tamaño crece con la excentricidad desde el punto de fijación, y decodifica la representación de vuelta al espacio de píxeles, generando imágenes metámeras que conservan información gruesa y texturizada mientras reducen el detalle espacial preciso en la periferia. Esta condición se diferencia de la variante Periph únicamente por la aplicación de NeuroFovea tras el enmascaramiento central, lo que permite aislar el efecto de la metamerización periférica.

No se han proporcionado detalles sobre el número total de tokens o imágenes de entrenamiento, la composición exacta del dataset, ni el uso de técnicas adicionales como RLHF o DPO (no aplicables a un modelo de visión auto-supervisado). El checkpoint se libera antes que el código de entrenamiento y evaluación, que se publicará próximamente según la model card.

## Capacidades

- Extracción de características visuales de imágenes egocéntricas, especialmente aquellas con contenido periférico.
- Representaciones aprendidas de forma auto-supervisada mediante contraste SimCLR, útiles para tareas downstream de visión por computador.
- Específicamente entrenado para procesar estímulos periféricos con degradación metamerizada, lo que lo hace adecuado para estudiar la codificación visual periférica.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües, al ser un modelo puramente visual.
- No incluye modo de pensamiento, visión multimodal (texto+imagen) ni audio.

## Casos de uso

- Investigación en neurociencia computacional de la visión periférica: el modelo permite estudiar cómo las representaciones aprendidas bajo restricciones periféricas se comparan con las de condiciones centrales o completas, y cómo se alinean con la actividad de la corteza visual humana.
- Fine-tuning para tareas de visión egocéntrica: al estar preentrenado en imágenes egocéntricas, puede adaptarse a tareas como reconocimiento de acciones, navegación autónoma o análisis de interacción persona-objeto en entornos de primera persona.
- Estudio de robustez a la degradación periférica: el checkpoint puede evaluarse en tareas de clasificación o detección con entradas que simulan pérdida de información central, útil para diseñar sistemas de visión artificial tolerantes a oclusiones centrales.
- Comparación de representaciones bajo diferentes condiciones de campo visual: junto con las variantes Baseline, Fovea-Gaze y Periph, permite analizar cómo la distribución de la experiencia visual afecta a la calidad de las representaciones aprendidas.
- Desarrollo de modelos de visión artificial inspirados en la percepción humana: el uso de NeuroFovea y restricciones de excentricidad puede servir como base para arquitecturas que imiten la foveación y el procesamiento periférico humano.
- Validación de teorías sobre codificación adaptativa de la información visual: el modelo proporciona un sustrato computacional para contrastar hipótesis sobre cómo el sistema visual optimiza la codificación según la región del campo visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento en tareas estándar como ImageNet, CIFAR, ni evaluaciones de alineación con datos neuronales. El estudio asociado (arXiv:2607.19316) contiene análisis científicos, pero no se han proporcionado cifras concretas en esta ficha.

## Requisitos de hardware

- No se dispone de datos específicos de VRAM, GPUs recomendadas, latencia o throughput en la informacion proporcionada.
- El tamaño del repositorio es de 0.1 GB, lo que sugiere que el checkpoint es ligero (ResNet-18 típicamente ocupa alrededor de 45 MB en pesos de 32 bits, aunque el archivo .pth.tar puede incluir metadatos adicionales).
- Por su arquitectura, es plausible que pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero no se confirma oficialmente.
- Opciones de despliegue: al ser un checkpoint de PyTorch, puede cargarse directamente con `torch.load` y utilizarse con frameworks de inferencia estándar. No se menciona compatibilidad con vLLM, Ollama, llama.cpp o TGI, que son específicos para modelos de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (encoders visuales auto-supervisados entrenados con restricciones de campo visual sobre VEDB). La colección VEDB incluye las variantes Baseline, Fovea-Gaze y Periph, que comparten arquitectura y método de entrenamiento pero difieren en el preprocesado de las imágenes. No se han publicado comparativas cuantitativas con otros modelos como SimCLR ResNet-50, MoCo v2 o BYOL en esta ficha.

## Limitaciones y advertencias

- El modelo no es una simulación biológica completa de la visión periférica humana; la condición Periph-NF es una aproximación computacional basada en NeuroFovea, que difiere de los modelos clásicos de texture tiling.
- El dataset VEDB no se redistribuye; solo se incluyen algunos frames de ejemplo. Esto limita la reproducibilidad de experimentos que requieran el conjunto completo.
- El código de entrenamiento y evaluación aún no está disponible públicamente, lo que dificulta la verificación independiente de los procedimientos.
- Es un modelo de investigación, no diseñado para uso en producción. No se han evaluado sesgos potenciales derivados de la demografía de los participantes en VEDB ni de las condiciones de captación de las imágenes.
- Al ser un modelo de visión, no presenta riesgo de alucinación textual, pero sí puede producir representaciones poco fiables en dominios muy distintos a los de su entrenamiento (imágenes no egocéntricas o con distribuciones diferentes).
- La licencia Apache 2.0 permite uso comercial, pero el autor no proporciona garantías sobre el rendimiento ni sobre la idoneidad para aplicaciones comerciales.

## Enlaces

- [HuggingFace - VEDB-SimCLR-ResNet18-Periph-NF](https://huggingface.co/DM-Diaz/VEDB-SimCLR-ResNet18-Periph-NF)
- [Colección VEDB - Eccentricity-Constrained SimCLR Models](https://hf.co/collections/DM-Diaz/eccentricity-constrained-simclr-models-vedb)
- [Paper del estudio (arXiv:2607.19316)](https://arxiv.org/abs/2607.19316)
- [NeuroFovea (arXiv:1705.10041)](https://arxiv.org/abs/1705.10041)
- [Repositorio NeuroFovea en GitHub](https://github.com/ArturoDeza/NeuroFovea_PyTorch)
- [Visual Experience Dataset (VEDB)](https://jov.arvojournals.org/article.aspx?articleid=2802101)
- [Presentación en CCN 2026 (YouTube)](https://www.youtube.com/watch?v=Lb4S3FWqd2M&t=2545s)
