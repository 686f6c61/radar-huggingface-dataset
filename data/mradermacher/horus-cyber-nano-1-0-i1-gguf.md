# mradermacher/Horus-Cyber-Nano-1.0-i1-GGUF

## Resumen

Horus-Cyber-Nano-1.0-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo Horus-Cyber-Nano-1.0, desarrollado por TokenAI. La cuantización ha sido realizada por mradermacher, un creador habitual de repositorios de GGUF. Se trata de un modelo de lenguaje basado en arquitectura Mixture-of-Experts (MoE) con 15.960.110.208 parámetros totales (aproximadamente 15,96 mil millones), lo que lo sitúa en la categoría de modelos pequeños. Su principal interés es que permite ejecutar un MoE en hardware de consumo mediante herramientas como llama.cpp u Ollama, aunque no se han publicado especificaciones detalladas sobre su arquitectura, datos de entrenamiento o capacidades. El repositorio incluye múltiples cuantizaciones, desde Q2_K hasta Q6_K, lo que ofrece flexibilidad para distintos niveles de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE); detalles específicos no disponibles |
| Parametros totales | 15.960.110.208 |
| Parametros activos | no disponible (modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo original Horus-Cyber-Nano-1.0 es un modelo MoE, según el anuncio de TokenAI, pero no se ha publicado información sobre el número de expertos, los expertos activos por token, la dimensión de las capas o el tipo de atención utilizada. Tampoco se dispone de datos sobre el corpus de entrenamiento (número de tokens, idiomas, proporciones) ni sobre procesos de alineación como RLHF o DPO. La cuantización realizada por mradermacher utiliza imatrix (weighted/imatrix quants), una técnica que emplea una matriz de importancia para reducir la pérdida de precisión en los pesos cuantizados. El repositorio incluye una amplia gama de variantes de cuantización GGUF, lo que permite seleccionar el equilibrio entre tamaño y calidad.

## Capacidades

- No se han publicado especificaciones detalladas de capacidades en la información disponible.
- El modelo está etiquetado como "conversational", lo que indica que está orientado a diálogo.
- Al ser un modelo de lenguaje, se espera que pueda realizar generación de texto y razonamiento básico, pero no hay benchmarks que lo confirmen.
- No se ha documentado soporte para tool calling, visión, audio ni otras capacidades especiales; no deben asumirse.

## Casos de uso

Nota: los siguientes casos de uso son inferencias basadas en la arquitectura y el formato del modelo; no se han publicado evaluaciones que confirmen su idoneidad. Deben validarse antes de su adopción en producción.

- Asistente de chat local y privado: gracias a su formato GGUF, puede ejecutarse en un PC de consumo con llama.cpp u Ollama, lo que permite mantener conversaciones sin conexión y sin enviar datos a servidores externos. Es adecuado para entornos donde la privacidad es crítica.
- Prototipado de aplicaciones de lenguaje natural: con 16B parámetros y cuantizaciones que reducen el tamaño a menos de 10 GB, puede usarse en estaciones de trabajo con GPU de gama media para probar prompts, flujos de generación y razonamiento antes de escalar a modelos mayores.
- Generación de texto en ofimática: puede integrarse en herramientas de edición para redactar resúmenes, correos o borradores, aprovechando su naturaleza conversacional. La ejecución local evita costes de API.
- Tutor educativo interactivo: como modelo de diálogo, puede responder preguntas y explicar conceptos en lenguaje natural, lo que lo hace útil en plataformas de aprendizaje autónomo, siempre que se valide su precisión.
- Análisis de texto y clasificación: mediante prompting o fine-tuning, podría adaptarse a tareas de clasificación de sentimiento, extracción de entidades o categorización de documentos, aunque no se dispone de datos que confirmen su rendimiento en estas tareas.
- Investigación en modelos MoE y cuantización: al ser un MoE cuantizado con múltiples variantes, es un objeto de estudio interesante para analizar el impacto de la cuantización en la calidad y el comportamiento de los expertos, aunque no hay papers asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para la cuantización Q4_K_M, el archivo de pesos ocupa aproximadamente 9 GB; con overhead de KV cache y buffers, se recomienda al menos 12 GB de VRAM. Para Q2_K, el tamaño ronda los 5 GB, lo que permitiría ejecutarlo en GPUs con 6-8 GB.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para cuantizaciones medianas y contextos largos; una RTX 3060 de 12 GB puede funcionar con Q2_K o Q3_K_M. Para despliegues en servidor, A100 o H100.
- Cabe en GPU de consumo: sí, dependiendo de la cuantización. Las variantes Q2_K y Q3_K_M son aptas para GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otras herramientas compatibles con GGUF. vLLM requiere conversión previa a otro formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos. No se han identificado modelos comparables con datos públicos en la información proporcionada.

## Limitaciones y advertencias

- No se ha publicado la licencia del modelo original, lo que puede impedir su uso comercial o en proyectos con requisitos de licencia.
- Al ser una cuantización, existe pérdida de precisión respecto al modelo en coma flotante, especialmente en cuantizaciones agresivas como IQ1_M o Q2_K.
- No se han publicado benchmarks ni evaluaciones de seguridad, por lo que el riesgo de alucinación, sesgos y comportamientos no deseados no ha sido caracterizado.
- La composición del corpus de entrenamiento no está documentada, lo que limita la transparencia y la auditoría del modelo.
- Los metadatos indican una fecha de creación en 2026, lo que puede ser un error o indicar un modelo no verificado; se recomienda comprobar la autenticidad del repositorio antes de su uso.
- No se ha documentado soporte para tool calling, visión, audio u otras capacidades; no deben asumirse sin confirmación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Horus-Cyber-Nano-1.0-i1-GGUF
- Modelo original: https://huggingface.co/tokenaii/Horus-Cyber-Nano-1.0
- Anuncio de TokenAI: https://tokenai.llc/news/announcements/horus-cyber-nano-first-look
