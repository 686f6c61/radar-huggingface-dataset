# LGAI-EXAONE/K-EXAONE-2.0-750B-A37B

## Resumen

K-EXAONE-2.0-750B-A37B es un modelo de lenguaje de gran escala desarrollado por LG AI Research, que supone la segunda generación de la familia K-EXAONE. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 750 000 millones de parámetros totales, de los cuales solo 37 000 millones se activan durante la inferencia. El modelo se construyó mediante una técnica de *upcycling* sobre el K-EXAONE original (236B/23B), expandiendo tanto profundidad como anchura, y posteriormente se sometió a *continual pretraining*, *mid-training* centrado en dificultad y *post-training*. Su principal valor reside en combinar una escala de frontera con una licencia Apache 2.0, lo que permite inspección, despliegue y modificación sin restricciones comerciales.

El modelo está orientado a tareas de razonamiento avanzado, flujos de trabajo agénticos y gestión de contexto largo, con soporte para diez idiomas: coreano, inglés, español, alemán, japonés, vietnamita, francés, italiano, polaco y portugués. Según fuentes externas, su ventana de contexto alcanza los 256 000 tokens, aunque la *model card* oficial no especifica este dato de forma explícita. Incluye dos métodos de decodificación especulativa (MTP y DSpark) que aceleran la generación entre 3 y 5 veces, lo que lo hace especialmente adecuado para cargas de trabajo de larga duración como tareas agénticas. Su relevancia actual radica en ser uno de los pocos modelos abiertos de esta escala con un enfoque explícito en agentes y seguridad, y en su disponibilidad inmediata a través de plataformas como Hugging Face y FriendliAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con atención híbrida (global + sliding window) |
| Parametros totales | 749 357 484 800 (~750B) |
| Parametros activos | 37B |
| Longitud de contexto | 256K (según fuentes externas; no especificada en la *model card*) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ko, es, de, ja, vi, fr, it, pl, pt |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

K-EXAONE-2.0-750B-A37B emplea una arquitectura MoE con 78 capas principales (2 densas iniciales y 76 dispersas) más una capa adicional para MTP (Multi-Token Prediction). Cada capa dispersa contiene un experto compartido y 256 expertos en total, de los cuales se activan 8 por token. La atención combina una capa global con codificación posicional NoPE, una capa de ventana deslizante de 4096 tokens y 19 bloques que intercalan tres capas de ventana deslizante de 128 tokens con una capa global. Las cabezas de atención son 64 para consultas (Q) y 8 para claves/valores (KV), con dimensión de cabeza de 128. La dimensión oculta es de 6144 y el tamaño intermedio de 18 432.

El entrenamiento se realizó en varias fases: primero un *upcycling* del modelo predecesor K-EXAONE, expandiendo su escala más de tres veces; después un *continual pretraining* sobre datos multilingües; a continuación un *mid-training* enfocado en dificultad para reforzar razonamiento y tareas agénticas; y finalmente un *post-training* orientado a seguridad y alineación. Una innovación técnica destacable es el *clamping* tras las dos ramas de SwiGLU, que mitiga la explosión de activaciones en capas profundas y mejora la estabilidad tanto en entrenamiento como en inferencia. Además, se incorporan dos métodos de decodificación especulativa: MTP y DSpark, que aceleran la generación entre 3 y 5 veces sin degradar la calidad.

## Capacidades

- Generación de texto multilingüe en diez idiomas (coreano, inglés, español, alemán, japonés, vietnamita, francés, italiano, polaco y portugués).
- Razonamiento avanzado y resolución de problemas complejos, con mejoras consistentes en tareas de codificación agéntica.
- Soporte para flujos de trabajo de agentes (*agentic workflows*), incluyendo planificación multi-paso y uso de herramientas.
- Gestión de contexto largo con recuperación eficiente de información en documentos extensos, gracias a su ventana de 256K tokens y su atención híbrida.
- Decodificación especulativa integrada (MTP y DSpark) para reducir la latencia en tareas de larga duración.
- Capacidades de seguridad mejoradas, con un enfoque explícito en la alineación durante el *post-training*.
- No se mencionan capacidades de visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- **Atención al cliente automatizada multilingüe**: el modelo puede gestionar conversaciones multi-turno en diez idiomas, manteniendo el contexto de la interacción gracias a su ventana de 256K tokens. Su capacidad de razonamiento permite comprender consultas complejas y generar respuestas coherentes y contextualizadas.
- **Generación de código en producción**: con soporte para tareas de codificación agéntica, puede integrarse en pipelines de CI/CD para generar, revisar y corregir código, así como para automatizar la resolución de incidencias. La decodificación especulativa reduce la latencia en entornos donde el tiempo de respuesta es crítico.
- **Asistentes de investigación y análisis de documentos**: su largo contexto permite procesar informes extensos, artículos científicos o expedientes legales completos, extrayendo información relevante y respondiendo preguntas sobre el contenido sin necesidad de dividir el texto.
- **Agentes autónomos para automatización de tareas**: combinado con *tool calling*, puede planificar y ejecutar secuencias de acciones (consultas a APIs, navegación web, manipulación de archivos) en entornos empresariales, gracias a su razonamiento multi-paso y su capacidad de mantener estado a lo largo de la conversación.
- **Traducción y localización de contenido**: al estar entrenado en diez idiomas, puede servir como motor de traducción de alta calidad, preservando matices culturales y técnicos, y adaptando el tono según el público objetivo.
- **Asistencia en educación y formación técnica**: puede generar explicaciones detalladas, ejercicios y material didáctico en varios idiomas, adaptándose al nivel de conocimiento del usuario y respondiendo preguntas de seguimiento con precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* indica que K-EXAONE-2.0 es "ampliamente competitivo con los principales modelos de pesos abiertos" y que muestra mejoras sustanciales sobre su predecesor, con resultados especialmente fuertes en recuperación de contexto largo y seguridad, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros estándares. Se recomienda consultar el *technical report* (arxiv:2608.04505) para obtener datos detallados cuando estén disponibles.

## Requisitos de hardware

- **VRAM estimada**: el tamaño del repositorio es de 1498.7 GB, lo que indica que se necesitan aproximadamente 1.5 TB de memoria para cargar los pesos en precisión completa. Con cuantización (por ejemplo, 8 bits o 4 bits), el requisito podría reducirse, pero no se han publicado datos oficiales al respecto.
- **GPU recomendadas**: no cabe en una GPU consumer. Se requiere un clúster de GPUs de alta gama, como 8× H100 (80 GB) o 16× A100 (80 GB), para inferencia en precisión completa. Para cuantización ligera, podrían emplearse configuraciones con menos GPUs, pero no hay información oficial.
- **Opciones de despliegue**: compatible con la librería Transformers de Hugging Face. También está disponible a través de FriendliAI como API gestionada, lo que evita la necesidad de infraestructura propia. Se puede servir con vLLM o TGI, aunque no se mencionan explícitamente en la documentación.
- **Latencia y throughput**: la decodificación especulativa (MTP y DSpark) acelera la generación entre 3 y 5 veces, lo que resulta especialmente útil para tareas agénticas de larga duración. No se proporcionan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| K-EXAONE-2.0-750B-A37B | 750B | 37B | 256K (según fuentes externas) | 10 | Apache 2.0 |
| K-EXAONE (predecesor) | 236B | 23B | no disponible | 6 | Apache 2.0 |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | multilingüe (5) | Apache 2.0 |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, contexto, idiomas y licencia. K-EXAONE-2.0 destaca por su escala y su ventana de contexto, pero su despliegue requiere una infraestructura mucho más costosa que la de modelos más pequeños como Mixtral.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como todo modelo de lenguaje de gran escala, puede generar contenido incorrecto o inventado, especialmente en dominios especializados o con información poco representada en sus datos de entrenamiento. Se recomienda verificar las salidas en aplicaciones críticas.
- **Limitaciones de contexto**: aunque la ventana es de 256K tokens, la *model card* no especifica cómo se comporta la atención en longitudes extremas ni si hay degradación progresiva. La recuperación de información en contextos muy largos puede ser menos precisa que en segmentos cortos.
- **Idiomas**: aunque cubre diez idiomas, el rendimiento puede variar significativamente entre ellos. El coreano y el inglés probablemente estén mejor representados que el polaco o el vietnamita, dado el origen del modelo.
- **Requisitos de hardware**: la inferencia en precisión completa requiere aproximadamente 1.5 TB de VRAM, lo que excluye su uso en entornos con GPUs consumer. La cuantización podría reducir este requisito, pero no hay datos oficiales de calidad tras la cuantización.
- **Licencia**: aunque es Apache 2.0 y permite uso comercial, el despliegue a esta escala implica costes de infraestructura considerables. No hay restricciones de atribución adicionales más allá de las estándar de Apache.
- **Sin capacidades multimodales**: el modelo es exclusivamente de texto; no procesa imágenes, audio ni vídeo, lo que limita su uso en aplicaciones que requieran comprensión multimodal.
- **Datos de entrenamiento no divulgados**: no se especifica la composición exacta del *dataset* ni el número de tokens utilizados, lo que dificulta evaluar posibles sesgos o lagunas de conocimiento.

## Enlaces

- [Hugging Face - K-EXAONE-2.0-750B-A37B](https://huggingface.co/LGAI-EXAONE/K-EXAONE-2.0-750B-A37B)
- [GitHub - K-EXAONE-2.0](https://github.com/LG-AI-EXAONE/K-EXAONE-2.0)
- [Technical report (arxiv:2608.04505)](https://huggingface.co/papers/2608.04505)
- [Blog de LG AI Research](https://www.lgresearch.ai/news/view?seq=678)
- [Demo interactiva](https://k.exaone.ai/)
- [FriendliAI - API de despliegue](https://friendli.ai/models/LGAI-EXAONE/K-EXAONE-2.0-750B-A37B)
- [GitHub - K-EXAONE original](https://github.com/LG-AI-EXAONE/K-EXAONE)
