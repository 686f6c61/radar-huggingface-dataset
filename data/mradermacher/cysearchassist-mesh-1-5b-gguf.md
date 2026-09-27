# mradermacher/CySearchAssist-Mesh-1.5B-GGUF

## Resumen

CySearchAssist-Mesh-1.5B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo cyberalien/CySearchAssist-Mesh-1.5B, publicado por mradermacher. Se trata de un modelo de generación de texto de 1.543.714.304 parámetros (aproximadamente 1,5B) construido sobre la arquitectura Qwen2, según indican las etiquetas del repositorio, y orientado a tareas de reescritura de consultas (query rewriting) y asistencia en búsquedas dentro de un contexto de mesh-search integrado con Unreal Engine.

El valor práctico del repositorio no está en el modelo base, sino en el conjunto de cuantizaciones estáticas publicadas: doce ficheros que van desde Q2_K (0,8 GB) hasta f16 (3,2 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluidas CPU sin GPU dedicada, mediante llama.cpp o cualquier runtime compatible con GGUF. El repositorio completo ocupa 14,2 GB, aunque cada cuantización individual se descarga de forma independiente.

Es relevante ahora porque los modelos especializados de pequeño tamaño, destilados o ajustados para una tarea concreta, permiten despliegues locales de bajo coste en escenarios donde no es viable enviar datos a una API externa, como asistentes dentro de editores de videojuegos o motores de búsqueda internos. La licencia Apache 2.0 y el soporte declarado de cinco idiomas (inglés, francés, español, alemán e italiano) facilitan su integración comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen2 (según etiquetas del repositorio) |
| Parámetros totales | 1.543.714.304 (dato real de safetensors del modelo base) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en), francés (fr), español (es), alemán (de), italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |

Detalle de tamaños por cuantización (según la model card del repositorio):

| Cuantización | Tamaño (GB) | Nota del autor |
|---|---|---|
| Q2_K | 0,8 | |
| Q3_K_S | 0,9 | |
| Q3_K_M | 0,9 | Calidad inferior |
| Q3_K_L | 1,0 | |
| IQ4_XS | 1,0 | |
| Q4_K_S | 1,0 | Rápida, recomendada |
| Q4_K_M | 1,1 | Rápida, recomendada |
| Q5_K_S | 1,2 | |
| Q5_K_M | 1,2 | |
| Q6_K | 1,4 | Muy buena calidad |
| Q8_0 | 1,7 | Rápida, mejor calidad |
| f16 | 3,2 | 16 bpw, sobredimensionada |

## Arquitectura y entrenamiento

No se dispone de información sobre el proceso de entrenamiento en los materiales consultados. El repositorio de mradermacher es exclusivamente una publicación de cuantizaciones estáticas del modelo cyberalien/CySearchAssist-Mesh-1.5B; no incluye detalles sobre el dataset, el número de tokens utilizados, la composición de los datos ni si hubo fases de ajuste por instrucciones, RLHF o DPO.

Lo único verificable a nivel arquitectónico es la etiqueta `qwen2`, que sitúa el modelo base en la familia Qwen2 de Alibaba, un transformer decoder-only con normalización RMSNorm, atención con sesgo QKV y activación SwiGLU. Las etiquetas `mesh-search`, `query-rewriting` y `unreal-engine` indican la especialización funcional pretendida: reescritura de consultas de búsqueda en el contexto de un sistema de búsqueda tipo malla integrado en Unreal Engine, junto con la etiqueta `conversational` para uso conversacional. No se documenta ninguna innovación técnica adicional como decodificación especulativa, atención lineal o mecanismos híbridos SSM.

El autor de las cuantizaciones indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicación y que probablemente no las planifique, quedando abierta la posibilidad de solicitarlas mediante una discusión comunitaria.

## Capacidades

- Generación de texto conversacional en cinco idiomas: inglés, francés, español, alemán e italiano.
- Reescritura de consultas de búsqueda (query rewriting), según la etiqueta declarada del modelo base.
- Asistencia a búsqueda en el contexto de mesh-search, presumiblemente orientada a recuperar y reformular consultas sobre contenidos indexados.
- Integración declarada con el ecosistema Unreal Engine mediante etiqueta, sin documentación adicional en los materiales disponibles.
- Ejecución local en CPU o GPU de gama baja gracias al formato GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo puramente de texto).
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Reescritura de consultas para motores de búsqueda internos: el modelo puede reformular la pregunta del usuario en términos más recuperables antes de enviarla al índice, reduciendo la tasa de consultas sin resultados. Es adecuado porque esa parece ser su especialización declarada (`query-rewriting`).
- Asistente de documentación dentro de Unreal Engine: integrado como plugin local, puede responder preguntas sobre API de motor, blueprints o convenciones del proyecto sin enviar código propietario a servicios externos, algo crítico en estudios con acuerdos de confidencialidad.
- Despliegue en CPU sin GPU: con la cuantización Q4_K_M (1,1 GB) el modelo cabe en portátiles de desarrollo y estaciones sin tarjeta gráfica, lo que lo hace viable para herramientas internas de equipo.
- Normalización multilingüe de entradas: con soporte de cinco idiomas europeos, puede traducir y normalizar consultas de usuarios en distintos idiomas a una forma canónica antes de pasarlas a un sistema de búsqueda monolingüe.
- Prototipado rápido de pipelines RAG: al ser un modelo de 1,5B, sirve como generador barato en fases de prueba de concepto, donde la latencia y el coste importan más que la calidad final.
- Clasificación y enrutado de consultas: puede etiquetar la intención de una consulta y decidir a qué subsistema de búsqueda dirigirla, con la ventaja de ejecutarse en el mismo proceso que la aplicación.
- Generación de descripciones cortas o resúmenes de resultados de búsqueda (snippets) a partir de documentos recuperados, aprovechando su bajo coste de inferencia.
- Preprocesado de texto en herramientas de autor dentro del editor: reformulación de nombres de assets, etiquetas o metadatos de búsqueda para mejorar la indexación del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y el repositorio base referenciado tampoco aporta datos en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, sin cuantizar la caché KV): f16 en torno a 3,5-4 GB; Q8_0 en torno a 2,5 GB; Q6_K en torno a 2 GB; Q5_K_M en torno a 1,8 GB; Q4_K_M en torno a 1,6 GB; Q2_K en torno a 1,2 GB.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o incluso una GTX 1650 de 4 GB pueden ejecutar las cuantizaciones intermedias y altas.
- Ejecución en CPU: viable en todas las cuantizaciones, especialmente Q2_K a Q4_K_M. Con 8 GB de RAM es suficiente para las cuantizaciones pequeñas; con 16 GB se cubre sin problema el f16.
- GPU recomendadas para producción: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; A100, H100 o L40S están sobredimensionadas para un modelo de este tamaño y solo tendrían sentido para servir muchas réplicas concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y otros runtimes compatibles con GGUF. Para el modelo base en safetensors, Transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|
| CySearchAssist-Mesh-1.5B-GGUF (este repositorio) | 1.543.714.304 | No disponible | Apache 2.0 | GGUF (12 cuantizaciones) | Hugging Face |
| cyberalien/CySearchAssist-Mesh-1.5B (modelo base) | 1.543.714.304 | No disponible | Apache 2.0 | Safetensors | Hugging Face |
| Alternativas de ~1,5B de la familia Qwen2 (por ejemplo, Qwen2.5-1.5B-Instruct) | ~1,5B | No verificado en las fuentes consultadas | No verificado en las fuentes consultadas | Safetensors, GGUF (por terceros) | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento entre este modelo y alternativas de su misma categoría. La comparación anterior se limita a datos estructurales verificables en los materiales proporcionados; cualquier dato adicional sobre modelos alternativos debe verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en ninguna tarea, lo que impide estimar su rendimiento real frente a alternativas.
- Modelo de 1,5B: la capacidad de razonamiento complejo, matemáticas y coherencia en contextos largos está intrínsecamente limitada por el tamaño. Es esperable un riesgo elevado de alucinación en tareas de conocimiento factual.
- Especialización estrecha: las etiquetas sugieren un ajuste para reescritura de consultas y mesh-search en Unreal Engine. Fuera de ese dominio, el comportamiento puede degradarse respecto al modelo base del que deriva.
- Sin información sobre el entrenamiento: se desconoce el dataset, si hubo filtrado de datos, el número de tokens, y si se aplicaron técnicas de alineación. Esto dificulta evaluar sesgos y comportamientos indeseados.
- Sesgos conocidos: no documentados en los materiales disponibles. Al no publicarse la composición del corpus de entrenamiento, no se puede descartar sesgo de género, cultural o lingüístico en los cinco idiomas declarados.
- Degradación por cuantización: las cuantizaciones Q2_K y Q3_K conllevan pérdida de calidad apreciable; el propio autor marca Q3_K_M como "calidad inferior". Para uso en producción se recomienda Q4_K_M o superior.
- Cuantizaciones no ponderadas: el autor indica que no hay cuantizaciones con imatrix en el momento de la publicación, que suelen ofrecer mejor relación calidad/tamaño que las estáticas equivalentes.
- Soporte multilingüe declarado por etiquetas: no hay evaluación publicada que confirme la calidad en español, francés, alemán o italiano, más allá del inglés.
- Repositorio sin adopción: cero descargas y cero "likes" en el momento del registro, lo que implica ausencia de validación por parte de la comunidad.
- Licencia Apache 2.0: permisiva y compatible con uso comercial, pero afecta únicamente a este repositorio de cuantizaciones; conviene verificar la licencia del modelo base en su propia ficha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CySearchAssist-Mesh-1.5B-GGUF
- Modelo base: https://huggingface.co/cyberalien/CySearchAssist-Mesh-1.5B
- Página resumen del autor para este modelo: https://hf.tst.eu/model#CySearchAssist-Mesh-1.5B-GGUF
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfica comparativa de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guía de uso de ficheros GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa que cede la infraestructura al autor: https://www.nethype.de/
- Paper, blog o demo oficial del modelo: no disponible.
