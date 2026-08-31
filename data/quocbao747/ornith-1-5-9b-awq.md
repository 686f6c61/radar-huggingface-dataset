# quocbao747/ornith-1.5-9b-awq

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de aproximadamente 9 000 millones de parámetros, desarrollado por el equipo de Ornith AI. Forma parte de la familia Ornith-1.5, que introduce un marco de auto-mejora continua: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce soluciones que se utilizan para entrenamiento por refuerzo, cerrando así un bucle de mejora autónoma. Este enfoque, denominado *self-scaffolding* y *self-improvement*, busca reducir la dependencia de datos anotados por humanos y permitir que el modelo evolucione a partir de sus propias experiencias.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos de código abierto. La versión referenciada en este ficha es una cuantización AWQ (del repositorio `quocbao747/ornith-1.5-9b-awq`), aunque el modelo base original está disponible en el repositorio oficial de Ornith AI. Con un tamaño de unos 19 GB en bf16, puede ejecutarse en una GPU de 80 GB sin necesidad de particionado, y con cuantizaciones más agresivas podría caber en hardware de consumo.

La relevancia actual de este modelo radica en su propuesta de auto-mejora, un área emergente en la investigación de IA, y en su licencia permisiva, que lo hace atractivo para desarrolladores que buscan alternativas abiertas a modelos propietarios de tamaño similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | ~9 000 millones (9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ (según el repositorio consultado); se desconoce si existen otras cuantizaciones oficiales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio consultado es una cuantización AWQ; el formato original podría ser safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (número de capas, dimensiones, tipo de atención, etc.). Se sabe que es un modelo denso, es decir, todos los parámetros se activan en cada inferencia, a diferencia de los modelos de mezcla de expertos (MoE) que también forman parte de la familia Ornith-1.5 (versiones de 35B y 397B). El tamaño de 9B sugiere una arquitectura transformer convencional, pero no se ha confirmado.

En cuanto al entrenamiento, la web oficial de Ornith AI describe un proceso de auto-mejora en tres fases: el modelo propone nuevas tareas, genera andamiajes específicos (scaffolds) para resolverlas y produce soluciones completas que se utilizan como datos de entrenamiento por refuerzo. Este bucle continuo permite que el modelo mejore sin depender exclusivamente de conjuntos de datos estáticos. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: al ser un modelo de 9B, se espera que maneje tareas de lenguaje natural, aunque no se han publicado evaluaciones específicas.
- Auto-mejora: según la documentación oficial, el modelo es capaz de proponer tareas, generar andamiajes y producir soluciones para su propio entrenamiento, lo que implica cierta capacidad de meta-cognición y planificación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

Dado que la información pública es limitada, los casos de uso se infieren a partir del tamaño del modelo y su licencia, sin afirmar capacidades específicas no documentadas.

- Asistentes conversacionales de código abierto: al ser un modelo de 9B con licencia Apache 2.0, puede integrarse en chatbots o asistentes virtuales donde se requiera un equilibrio entre calidad y coste computacional.
- Generación de texto creativo: redacción de artículos, guiones o contenido marketing, aprovechando su capacidad de generación de lenguaje natural.
- Clasificación y análisis de texto: tareas de análisis de sentimiento, extracción de entidades o resumen de documentos, siempre que se ajuste mediante fine-tuning.
- Prototipado rápido de aplicaciones de IA: su tamaño moderado permite iterar con rapidez en entornos de desarrollo sin necesidad de infraestructura masiva.
- Investigación en auto-mejora y aprendizaje autónomo: el marco de self-improvement lo convierte en un objeto de estudio interesante para laboratorios que investigan métodos de entrenamiento sin supervisión externa.
- Despliegue en entornos con restricciones de hardware: con cuantización AWQ, podría ejecutarse en GPUs de consumo (por ejemplo, 24 GB de VRAM), lo que facilita su uso en edge computing o aplicaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras pruebas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: el modelo en bf16 ocupa aproximadamente 19 GB, por lo que se necesita al menos 20 GB de VRAM para inferencia sin cuantización. Con cuantización AWQ, el uso de memoria se reduce, aunque no se ha especificado el tamaño exacto.
- GPU recomendadas: una GPU de 80 GB (como A100 o H100) puede ejecutar el modelo sin particionado, según la documentación oficial. Con cuantización, podría caber en GPUs de 24 GB (RTX 3090, RTX 4090) o incluso menos, dependiendo del nivel de cuantización.
- Si cabe en consumer GPU: probablemente sí, con cuantización AWQ o GGUF, aunque no se ha confirmado oficialmente.
- Opciones de despliegue: no se han documentado integraciones específicas con vLLM, llama.cpp, Ollama o TGI. Sin embargo, al ser un modelo estándar de 9B, es probable que sea compatible con estos frameworks, pero no se puede afirmar sin verificación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría (por ejemplo, Llama 3 8B, Mistral 7B o Qwen 2.5 7B). No se conocen datos de rendimiento ni características técnicas detalladas que permitan una comparación objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado información sobre sesgos, pero como todo modelo entrenado con datos web, es probable que herede sesgos presentes en el corpus de entrenamiento.
- Riesgo de alucinación: no se han documentado tasas de alucinación específicas; se recomienda validar las salidas en aplicaciones críticas.
- Limitaciones de contexto o idioma: se desconoce la longitud máxima de contexto y los idiomas soportados; esto limita su uso en tareas que requieran ventanas largas o multilingüismo.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Caveat para producción: al no existir benchmarks públicos ni documentación técnica detallada, se recomienda realizar una evaluación exhaustiva antes de desplegar el modelo en entornos de producción.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/quocbao747/ornith-1.5-9b-awq
- Repositorio HuggingFace del modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Repositorio HuggingFace de la versión MLX: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX
- Página oficial del proyecto Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Sitio web de Ornith AI: https://ornith.ai/
- Página de descarga GGUF (no oficial): https://local-ai-zone.github.io/models/ornith-1-5-9b.html
