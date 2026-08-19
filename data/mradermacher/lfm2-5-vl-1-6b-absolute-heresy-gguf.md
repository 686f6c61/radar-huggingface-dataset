# mradermacher/LFM2.5-VL-1.6B-absolute-heresy-GGUF

## Resumen

LFM2.5-VL-1.6B es un modelo de visión y lenguaje (VLM) desarrollado por Liquid AI, que representa la versión renovada de su primer modelo multimodal, LFM2-VL-1.6B. Construido sobre el backbone actualizado LFM2.5-1.2B-Base, este modelo está diseñado para ofrecer un rendimiento superior en comprensión de imágenes, razonamiento visual y tareas multimodales, con un enfoque especial en el seguimiento de instrucciones en tareas que combinan visión y lenguaje. El modelo incorpora un codificador de imágenes dinámico SigLIP2 y está optimizado para despliegue en entornos edge, con un tamaño total de aproximadamente 1.170 millones de parámetros.

La variante "absolute-heresy" es una modificación no oficial realizada por el usuario MuXodious, que ha sido sometida a un proceso de "abliteración" (abliteration) para eliminar los mecanismos de rechazo y censura del modelo original, resultando en una versión "descensurada" o "sin censura". Esta ficha se centra en la cuantización GGUF de dicha variante, realizada por mradermacher, que facilita su ejecución en hardware de consumo mediante herramientas como llama.cpp u Ollama. El modelo mantiene las capacidades multilingües del original, con soporte para ocho idiomas, y destaca por su ventana de contexto de 122.880 tokens, inusualmente larga para un modelo de este tamaño.

La relevancia de este modelo radica en su combinación de tamaño compacto, capacidades multimodales y contexto extremadamente largo, lo que lo convierte en una opción atractiva para aplicaciones edge y entornos con recursos limitados. La versión cuantizada en GGUF amplía su accesibilidad, aunque la naturaleza "descensurada" de la variante plantea consideraciones éticas y de seguridad importantes que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificador de visión SigLIP2 dinámico |
| Parametros totales | 1.170.340.608 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 122.880 tokens |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS (más mmproj en f16 y Q8_0) |
| Idiomas soportados | en, ja, ko, fr, es, de, ar, zh |
| Licencia | lfm1.0 (Liquid Foundation Models License) |
| Formato de pesos | GGUF (safetensors disponible en el repositorio base) |

## Arquitectura y entrenamiento

LFM2.5-VL-1.6B se basa en la arquitectura Liquid Foundation Model (LFM) de Liquid AI, que emplea una novedosa aproximación de redes neuronales líquidas con atención lineal, diseñada para ofrecer una eficiencia computacional superior frente a los transformers tradicionales. El modelo integra un codificador de imágenes SigLIP2 dinámico que permite procesar imágenes a resoluciones variables, adaptándose al contenido visual de forma más flexible que los codificadores de resolución fija. El backbone de lenguaje es LFM2.5-1.2B-Base, una versión actualizada que mejora el seguimiento de instrucciones y el razonamiento multimodal respecto a la generación anterior.

Los detalles específicos sobre el entrenamiento de la variante "absolute-heresy" no están disponibles públicamente. El proceso de abliteración aplicado por MuXodious es una técnica de post-entrenamiento que modifica los pesos del modelo para eliminar las direcciones en el espacio de activaciones asociadas con comportamientos de rechazo o negativa. El modelo base de Liquid AI fue entrenado con una combinación de datos textuales y multimodales, aunque no se han publicado cifras exactas sobre el número de tokens de entrenamiento ni la composición detallada del dataset. Tampoco hay información pública sobre el uso de RLHF, DPO u otras técnicas de alineación posteriores al entrenamiento en el modelo original.

## Capacidades

- Comprensión de imágenes y razonamiento visual: puede analizar imágenes, responder preguntas sobre su contenido y realizar tareas de razonamiento visual complejo.
- Seguimiento de instrucciones multimodal: optimizado para interpretar y ejecutar instrucciones que combinan entradas de texto e imagen.
- Generación de texto multilingüe: soporta ocho idiomas (inglés, japonés, coreano, francés, español, alemán, árabe y chino) con capacidades de conversación en cada uno.
- Ventana de contexto extendida: 122.880 tokens, lo que permite procesar documentos largos o conversaciones extensas con múltiples imágenes intercaladas.
- Modelo "descensurado": la variante ha sido modificada para eliminar rechazos y restricciones de contenido, respondiendo a consultas que el modelo original podría negarse a abordar.
- Eficiencia para edge: su tamaño compacto (1.6B parámetros) lo hace adecuado para despliegue en dispositivos con recursos limitados.
- Formato GGUF: compatible con llama.cpp, Ollama y otros motores de inferencia que soporten este formato, facilitando su uso en CPU y GPU de consumo.

## Casos de uso

- Asistencia visual para personas con discapacidad: el modelo puede describir escenas, leer texto en imágenes o identificar objetos en tiempo real desde un dispositivo móvil, gracias a su tamaño compacto y su capacidad de razonamiento visual. Su ventana de contexto larga permite mantener el historial de interacciones sin perder información relevante.

- Análisis de documentos técnicos multilingües: con su soporte para ocho idiomas y su contexto de 122.880 tokens, puede procesar manuales, patentes o informes extensos con figuras y diagramas, extrayendo información relevante y respondiendo preguntas específicas sobre el contenido. La cuantización GGUF permite ejecutarlo en estaciones de trabajo sin GPU dedicada.

- Moderación de contenido en plataformas sociales: aunque paradójico por su naturaleza descensurada, el modelo puede configurarse para analizar imágenes y texto en múltiples idiomas, identificando contenido que requiera revisión. Su capacidad de procesar contexto largo permite analizar hilos de conversación completos con imágenes adjuntas.

- Generación de descripciones de productos para e-commerce: puede generar descripciones detalladas y atractivas a partir de imágenes de productos, adaptando el tono y el idioma según el mercado objetivo. Su tamaño reducido permite integrarlo en pipelines de procesamiento por lotes sin costes elevados de infraestructura.

- Asistente de estudio para estudiantes de idiomas: el modelo puede explicar imágenes, traducir textos y mantener conversaciones en ocho idiomas, funcionando como un tutor personal accesible desde hardware modesto. La versión descensurada permite abordar temas sensibles o controvertidos que otros modelos evitan.

- Archivado y búsqueda de imágenes patrimoniales: instituciones culturales pueden utilizar el modelo para generar metadatos descriptivos de colecciones fotográficas históricas, incluyendo la transcripción de texto manuscrito o impreso en las imágenes. El contexto largo permite procesar colecciones completas con anotaciones contextuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los resultados de búsqueda web incluyen cifras concretas de rendimiento para LFM2.5-VL-1.6B en tareas estándar como MMLU, HumanEval, GSM8K o benchmarks de visión como MMMU o VQAv2. La documentación oficial de Liquid AI menciona un rendimiento "excepcional" en comprensión de imágenes y razonamiento visual, pero sin proporcionar datos numéricos verificables en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 1,17B parámetros. Con cuantización Q4_K_M, el archivo GGUF principal ocupa aproximadamente 0,9 GB, y el mmproj Q8_0 añade unos 0,7 GB adicionales. Esto permite ejecutar el modelo en GPUs con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) puede manejar las cuantizaciones más bajas. Para las cuantizaciones más altas (Q8_0, f16), se recomienda al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, etc.).
- Compatibilidad con hardware de consumo: sí, es totalmente viable en GPUs de consumo e incluso en CPU con suficiente RAM (8-16 GB), gracias al formato GGUF y al tamaño reducido del modelo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier otro motor compatible con GGUF. También puede ejecutarse con transformers si se utilizan los pesos safetensors originales.
- Latencia y throughput: no hay datos publicados específicos para este modelo. Como referencia orientativa, un modelo de 1,6B parámetros en Q4_K_M suele generar entre 20 y 40 tokens por segundo en una GPU de gama media (RTX 3060) y entre 5 y 10 tokens por segundo en CPU con AVX2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Cuantizacion GGUF |
|---|---|---|---|---|---|
| LFM2.5-VL-1.6B (absolute-heresy) | 1,17B | 122.880 | Sí (SigLIP2) | lfm1.0 | Sí |
| Qwen2-VL-2B | 2,18B | 32.768 | Sí | Apache 2.0 | Sí |
| MiniCPM-V 2.6 | 8,1B | 8.192 (128K con RoPE) | Sí | Apache 2.0 | Sí |
| InternVL2-2B | 2,2B | 32.768 | Sí | MIT | Sí |

La comparativa se basa en modelos multimodales de tamaño similar disponibles públicamente. LFM2.5-VL-1.6B destaca por su contexto significativamente más largo (122.880 tokens) frente a los 32.768 de Qwen2-VL-2B o InternVL2-2B. Sin embargo, la licencia lfm1.0 es más restrictiva que las licencias Apache 2.0 o MIT de las alternativas, lo que puede limitar su uso comercial. La variante "absolute-heresy" es única en esta comparativa por su naturaleza descensurada, una característica que no ofrecen los modelos comparados.

## Limitaciones y advertencias

- Naturaleza descensurada: esta variante ha sido modificada mediante abliteración para eliminar mecanismos de rechazo. Esto implica que puede generar contenido ofensivo, peligroso, ilegal o éticamente problemático sin advertir al usuario. No es adecuada para despliegues sin supervisión humana.
- Sesgos y alucinaciones: como todos los modelos de lenguaje, puede producir información falsa o inventada con total confianza. La eliminación de la alineación puede aumentar la probabilidad de respuestas factualmente incorrectas o socialmente inapropiadas.
- Licencia lfm1.0: la licencia de Liquid AI es de código abierto pero con condiciones específicas. Es necesario revisar los términos completos para determinar si el uso comercial está permitido y bajo qué condiciones.
- Soporte de herramientas: no hay información disponible sobre capacidades de tool calling o function calling en este modelo. Los tags de HuggingFace no incluyen estas funcionalidades.
- Datos de entrenamiento desconocidos: no se ha publicado información sobre la composición del dataset de entrenamiento, lo que impide evaluar posibles sesgos demográficos o culturales.
- Rendimiento no verificado: no se han publicado benchmarks independientes para esta variante, por lo que las afirmaciones de rendimiento de Liquid AI no han sido validadas externamente.
- Soporte comunitario limitado: al ser una variante no oficial cuantizada por un tercero, no hay garantía de mantenimiento, actualizaciones o soporte técnico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM2.5-VL-1.6B-absolute-heresy-GGUF
- Modelo base (safetensors): https://huggingface.co/MuXodious/LFM2.5-VL-1.6B-absolute-heresy
- Documentación oficial de LFM2.5-VL-1.6B: https://docs.liquid.ai/lfm/models/lfm25-vl-1.6b
- Variante GGUF espejo (ModelHub China): https://dev.modelhub.org.cn/MuXodious/LFM2.5-VL-1.6B-absolute-heresy-GGUF
- Entrada en LLM Explorer: https://llm-explorer.com/model/LiquidAI%2FLFM2.5-VL-1.6B,QFXMs3PdwwGhKZH7RJc0q
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
