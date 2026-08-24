# julian-schelb/xlm-roberta-large-3class-lat-intertext-v1

## Resumen

El modelo `julian-schelb/xlm-roberta-large-3class-lat-intertext-v1` es un clasificador de secuencias de pares (sequence-pair classification) fine-tuneado a partir de `FacebookAI/xlm-roberta-large` para detectar y tipificar enlaces intertextuales entre la obra de Jerónimo (Hieronymus) y otros autores clásicos latinos. Desarrollado por Julian Schelb y colaboradores, forma parte del ecosistema del paquete Python LociSimiles, orientado a la extracción de intertextualidades en literatura latina mediante modelos de lenguaje preentrenados.

El modelo resuelve un problema específico de las humanidades digitales: distinguir automáticamente entre citas directas (reutilización léxica cercana), ecos temáticos (confer) y pasajes sin relación. Su relevancia radica en que los corpus reales están dominados por ejemplos negativos, por lo que incorpora un umbral de decisión calibrado para reducir falsos positivos. Con 559.893.507 parámetros y una ventana de contexto máxima de 512 tokens, está diseñado para trabajar con pares de pasajes breves en latín clásico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza de clasificación de secuencias |
| Parametros totales | 559.893.507 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (max input) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Latin (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa-large, un transformer encoder multilingüe preentrenado por Facebook AI sobre 2.5 TB de datos filtrados de CommonCrawl en 100 idiomas, utilizando los objetivos de entrenamiento de RoBERTa. Sobre esta base se ha añadido una cabeza de clasificación de secuencias que recibe como entrada un par de pasajes codificados con el patrón `<s> frase1 </s></s> frase2 </s>`, típico de las tareas de clasificación de pares en arquitecturas encoder.

El fine-tuning se realizó sobre uno de los cinco splits de validación cruzada del benchmark Loci Similes, un conjunto de datos específico para intertextualidad latina que incluye etiquetas, corpus y consultas. El entrenamiento empleó un muestreo balanceado por clases, dado que en los corpus reales la clase mayoritaria es `no_match`. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La innovación principal reside en la definición de tres clases (en lugar de la versión binaria anterior) y en la aplicación de umbrales por clase calibrados uno-vs-rest sobre el split de entrenamiento.

## Capacidades

- Clasificación de pares de pasajes latinos en tres categorías: `no_match` (no relacionados), `cit` (cita o reutilización léxica cercana) y `cf` (eco temático suelto).
- Detección de intertextualidad específicamente entre la obra de Jerónimo y autores clásicos latinos.
- Integración con el paquete LociSimiles para flujos de trabajo de extracción de intertextualidades.
- Soporte de decisión mediante umbrales ajustables por clase (cit: 0.51, cf: 0.98) para controlar el equilibrio entre precisión y recall en corpus desbalanceados.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es exclusivamente un clasificador de pares.

## Casos de uso

- Investigación filológica asistida: el modelo permite a los estudiosos de la literatura latina identificar automáticamente posibles fuentes clásicas en los escritos de Jerónimo, acelerando la anotación manual de citas y alusiones.
- Construcción de bases de datos de intertextualidad: puede integrarse en pipelines que procesen grandes corpus para generar catálogos de relaciones intertextuales con etiquetas tipológicas (cita vs. eco).
- Verificación de ediciones críticas: ayuda a contrastar pasajes citados por Jerónimo contra las ediciones de autores clásicos, detectando variantes textuales o reutilizaciones parciales.
- Enriquecimiento de corpus digitales: al clasificar pares de pasajes, permite añadir metadatos semánticos sobre relaciones intertextuales a colecciones de textos latinos disponibles en línea.
- Entrenamiento de modelos más complejos: las predicciones de este clasificador pueden servir como pseudoetiquetas o filtros previos en sistemas de recuperación de información para literatura clásica.
- Docencia en humanidades digitales: sirve como ejemplo práctico de aplicación de transformers a problemas filológicos, ilustrando el uso de umbrales de decisión y manejo de clases desbalanceadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall o F1 para las tres clases, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo con ~560 millones de parámetros, en precisión FP16 los pesos ocupan aproximadamente 1.1 GB, y en FP32 unos 2.2 GB. Considerando activaciones y overhead, se recomienda al menos 4 GB de VRAM para inferencia en FP16 con secuencias de hasta 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650 (4 GB) o superior. Para mayor comodidad, una RTX 3060 o superior. En entornos de producción, una T4 o A10G es suficiente.
- Es compatible con GPUs de consumo (gama media) gracias a su tamaño moderado.
- Opciones de despliegue: al usar la librería `transformers`, puede servirse con Hugging Face Inference Endpoints, o mediante frameworks compatibles como Text Embeddings Inference (según los tags del modelo). También puede ejecutarse localmente con PyTorch.
- Latencia y throughput: no se han proporcionado datos oficiales. En una GPU moderna, la inferencia sobre un par de secuencias de 512 tokens debería completarse en decenas de milisegundos, pero estos valores son estimaciones orientativas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (clasificación de intertextualidad latina). El modelo base XLM-RoBERTa-large es un modelo multilingüe general, pero no está especializado en esta tarea, por lo que no es directamente comparable. No se han encontrado alternativas publicadas que aborden exactamente el mismo problema con las mismas clases y dominio.

## Limitaciones y advertencias

- El modelo está entrenado específicamente sobre la obra de Jerónimo y autores clásicos latinos; su capacidad de generalización a otros autores, géneros o épocas del latín no está garantizada y probablemente sea limitada.
- La clase `cf` (eco temático) es intrínsecamente difícil de detectar por carecer de señal léxica fiable; el umbral muy alto (0.98) indica que en la práctica se prioriza la precisión sobre el recall, lo que puede dejar muchos ecos temáticos sin detectar.
- El desbalanceo de clases en corpus reales hace que el argmax simple no sea óptimo; se recomienda utilizar los umbrales calibrados proporcionados por el autor.
- No se han publicado métricas de rendimiento, por lo que no es posible evaluar su eficacia cuantitativa frente a otros enfoques.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo está pensado para investigación filológica; su uso en producción requiere validación adicional con datos propios.
- La fecha de creación (agosto de 2026) y el identificador arXiv (2601.07533) sugieren que el trabajo es muy reciente; la documentación asociada puede ser todavía limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julian-schelb/xlm-roberta-large-3class-lat-intertext-v1
- Paper asociado (arXiv): https://arxiv.org/abs/2601.07533
- Paquete Python LociSimiles: https://pypi.org/project/locisimiles/ y documentación: https://julianschelb.github.io/locisimiles/api/
- Dataset de etiquetas: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-labels
- Dataset de corpus: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-corpus
- Dataset de consultas: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-queries
- Modelo base XLM-RoBERTa-large: https://huggingface.co/FacebookAI/xlm-roberta-large
