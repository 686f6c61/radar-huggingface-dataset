# julian-schelb/mmbert-small-3class-lat-intertext-v1

## Resumen

El modelo `julian-schelb/mmbert-small-3class-lat-intertext-v1` es un clasificador de pares de secuencias en latín, desarrollado por Julian Schelb y colaboradores, que detecta y tipifica vínculos intertextuales entre la obra de Jerónimo (Hieronymus) y otros autores clásicos latinos. Se trata de un fine-tune del encoder multilingüe `jhu-clsp/mmBERT-small`, que a su vez pertenece a la familia mmBERT, un modelo moderno basado en la arquitectura ModernBERT entrenado sobre 3 billones de tokens en más de 1800 lenguas mediante un esquema de aprendizaje adaptativo denominado *annealed language learning*.

El modelo resuelve un problema concreto en humanidades digitales: distinguir entre citas textuales o reutilizaciones léxicas cercanas (clase `cit`), ecos temáticos difusos (clase `cf`), y pasajes sin relación (clase `no_match`). Su relevancia radica en que los corpus reales de intertextualidad son abrumadoramente negativos, por lo que el modelo incorpora umbrales de decisión por clase para reducir falsos positivos. Con 140,6 millones de parámetros y una ventana de contexto de 512 tokens, está diseñado para integrarse en flujos de trabajo filológicos como el paquete LociSimiles.

La licencia Apache 2.0 permite uso comercial sin restricciones, y el modelo está disponible en formato `safetensors` bajo la librería `transformers`. Aunque su descarga es actualmente nula, el modelo está respaldado por un preprint arXiv (2601.07533) y por el benchmark Loci Similes, lo que le otorga un contexto académico sólido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only transformer) |
| Parametros totales | 140.642.691 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Latin (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `jhu-clsp/mmBERT-small`, un encoder moderno basado en la arquitectura ModernBERT, que emplea atención bidireccional y mecanismos de entrenamiento eficientes. El modelo base mmBERT fue preentrenado sobre 3 billones de tokens en más de 1800 lenguas utilizando un esquema de *annealed language learning* (ALL), que combina un calendario de ratio de enmascarado inverso y un muestreo de temperatura inverso para mejorar el aprendizaje multilingüe. Este preentrenamiento proporciona una base robusta para tareas de clasificación de secuencias en latín.

El fine-tune se realizó sobre el benchmark Loci Similes, que contiene pares de pasajes de autores clásicos latinos anotados con tres etiquetas: `no_match`, `cit` y `cf`. El entrenamiento empleó muestreo balanceado de clases para contrarrestar el fuerte desequilibrio presente en los corpus reales (la mayoría de pares son negativos). No se menciona el uso de RLHF ni DPO; el ajuste es supervisado estándar. El modelo se entrenó en uno de los cinco splits de validación cruzada del benchmark, por lo que sus resultados dependen de la partición concreta.

## Capacidades

- Clasificación de pares de secuencias en latín en tres clases: `no_match` (sin relación), `cit` (cita o reutilización léxica cercana) y `cf` (eco temático difuso).
- Detección de intertextualidad entre Jerónimo y otros autores clásicos, con soporte para pasajes de hasta 512 tokens por secuencia.
- Integración directa con el paquete LociSimiles para flujos de trabajo de intertextualidad en latín.
- Inferencia con umbrales por clase (cit: 0.99, cf: 0.86) que permiten priorizar precisión sobre recall en corpus altamente desequilibrados.
- No dispone de capacidades de tool calling, generación de código, razonamiento multi-paso ni soporte de agentes, al ser un modelo encoder especializado en clasificación.
- Multilingüismo limitado al latín, aunque el modelo base mmBERT es multilingüe, el fine-tune se restringe a esta lengua.

## Casos de uso

- Investigación filológica sobre fuentes de Jerónimo: el modelo permite identificar automáticamente qué pasajes de autores clásicos (Virgilio, Cicerón, etc.) son citados o evocados por Jerónimo, acelerando el análisis manual de intertextualidad en la obra del autor.
- Construcción de corpus anotados de intertextualidad: puede utilizarse para preetiquetar grandes colecciones de pares de textos latinos, reduciendo el esfuerzo de anotación humana en proyectos de humanidades digitales.
- Verificación de citas en ediciones críticas: los editores pueden emplear el modelo para comprobar si una referencia propuesta es una cita directa o solo un eco temático, mejorando la precisión de las notas al pie.
- Estudio de la recepción de autores clásicos: el modelo ayuda a rastrear cómo ciertos motivos o frases se transmiten entre autores, permitiendo análisis cuantitativos de influencia literaria.
- Detección de plagio o reutilización textual en textos latinos: aunque el contexto es limitado, la clase `cit` puede señalar coincidencias léxicas cercanas que sugieran dependencia textual.
- Integración en pipelines de recuperación de información: combinado con motores de búsqueda semántica, el modelo puede filtrar pares candidatos antes de una revisión humana, como se plantea en el paquete LociSimiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall ni F1 para las tres clases, ni comparaciones con otros modelos. Solo se indican los umbrales de decisión calibrados sobre el split de entrenamiento, pero sin cifras de rendimiento asociadas. Se recomienda consultar el preprint arXiv 2601.07533 para posibles evaluaciones detalladas, aunque no se proporcionan en los materiales analizados.

## Requisitos de hardware

- El modelo tiene 140,6 millones de parámetros, lo que en precisión fp32 ocupa aproximadamente 560 MB y en fp16 unos 280 MB. Cabe holgadamente en cualquier GPU consumer moderna (por ejemplo, NVIDIA GTX 1060 de 6 GB o superior) y también en CPU.
- Para inferencia en GPU, se recomienda al menos 2 GB de VRAM para fp16, aunque 4 GB ofrecen margen para lotes mayores. En CPU, la inferencia es viable pero con mayor latencia (estimación orientativa, no se dispone de mediciones oficiales).
- Opciones de despliegue: al ser un modelo `transformers` estándar, puede ejecutarse con las librerías habituales: `transformers` con PyTorch, `text-embeddings-inference` (indicado en los tags), y `vLLM` o `TGI` para entornos de producción, aunque su pequeño tamaño hace que estas opciones sean sobredimensionadas.
- No se dispone de datos oficiales de latencia o throughput. En una GPU moderna (por ejemplo, RTX 3090), se espera una inferencia en milisegundos para pares de secuencias de hasta 512 tokens, pero esta cifra es una estimación razonable basada en el tamaño del modelo, no un dato publicado.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos equivalentes. El propio autor menciona un modelo binario anterior (`julian-schelb/mmbert-small-class-lat-intertext-v1`) que resolvía la tarea de coincidencia/no coincidencia, pero no se proporcionan sus métricas ni especificaciones detalladas. Tampoco se conocen otros clasificadores de intertextualidad latina con los que contrastar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en latín clásico y para la tarea específica de intertextualidad entre Jerónimo y otros autores; su uso fuera de este dominio producirá resultados poco fiables.
- La ventana de contexto está limitada a 512 tokens por secuencia, lo que impide analizar pasajes largos de una sola vez; será necesario dividir el texto en fragmentos.
- La clase `cf` (eco temático) es intrínsecamente difícil de detectar al carecer de señal léxica fiable, por lo que el modelo puede incurrir en falsos positivos o negativos en esta categoría.
- Los umbrales recomendados (cit: 0.99, cf: 0.86) son muy estrictos y están calibrados para corpus con abrumadora mayoría de negativos; en otros dominios o distribuciones de clases, será necesario recalibrarlos.
- No se han publicado métricas de rendimiento (precisión, recall, F1) en la información disponible, por lo que se desconoce la calidad efectiva del modelo en producción.
- El modelo se entrenó en uno de los cinco splits de validación cruzada del benchmark Loci Similes; su rendimiento puede variar según la partición utilizada.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo depende de datos de entrenamiento que podrían tener restricciones de derechos de autor sobre los textos latinos originales, aunque estos son generalmente de dominio público.

## Enlaces

- HuggingFace: https://huggingface.co/julian-schelb/mmbert-small-3class-lat-intertext-v1
- Paper Loci Similes (arXiv 2601.07533): https://arxiv.org/abs/2601.07533
- Repositorio del modelo base mmBERT: https://github.com/JHU-CLSP/mmBERT/
- Paper de mmBERT (arXiv 2509.06888): https://arxiv.org/html/2509.06888v1
- Documentación del paquete LociSimiles: https://julianschelb.github.io/locisimiles/api/
- Modelo binario anterior del autor: https://huggingface.co/julian-schelb/mmbert-small-class-lat-intertext-v1
