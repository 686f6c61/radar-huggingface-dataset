# shikunpunk/ask-dao-v0.3

## Resumen

Ask-Dao v0.3 es un adaptador LoRA publicado por el usuario shikunpunk (https://huggingface.co/shikunpunk) sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Su función no es responder preguntas, sino generarlas: a partir del título, el resumen, la discusión y la conclusión de un artículo biomédico, el modelo infiere una única pregunta de investigación abierta que el autor no formula de manera explícita. El dominio de entrenamiento está acotado a proteómica, biopsia líquida y biomarcadores plasmáticos o séricos.

El modelo se distribuye como adaptador PEFT (no como pesos completos) y se ha entrenado con QLoRA de 4 bits, con r=16, alpha=32 y capas all-linear. La versión 0.3 parte de la versión 0.2 del mismo autor y aplica un post-entrenamiento de refinamiento (RFT) con learning rate bajo y datos filtrados por un juez LLM. El repositorio ocupa 0,4 GB y la licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es doble. Por un lado, es un ejemplo compacto y reproducible de destilación de conocimiento científico a un modelo de 3B parámetros con recursos de consumo (se menciona entrenamiento e inferencia LoRA en 4 bits sobre 8 GB de VRAM). Por otro, aborda una tarea poco cubierta por los asistentes científicos convencionales: la detección de preguntas implícitas en la literatura, útil para priorizar investigación y construir conjuntos de datos de preguntas abiertas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) con adaptador LoRA; no es MoE |
| Parámetros totales | 3,09 mil millones en el modelo base Qwen2.5-3B-Instruct; número de parámetros del adaptador no disponible |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-3B-Instruct (dato del modelo base, no de la model card); el entrenamiento del adaptador usó max_len=2048 |
| Tipos de cuantización | Entrenamiento con QLoRA de 4 bits (NF4); el adaptador se publica en safetensors. No se documentan cuantizaciones propias del adaptador |
| Idiomas soportados | Chino (zh) e inglés (en), según los tags del repositorio. El prompt de sistema de ejemplo está en chino y el corpus de entrenamiento son artículos PMC, presumiblemente en inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar por separado el modelo base |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Método de ajuste | QLoRA 4 bits, r=16, alpha=32, all-linear, assistant-only loss; v0.3 es continuación de v0.2 con lr=5e-5 durante 2 épocas |
| Tamaño del repositorio | 0,4 GB |
| Fecha de publicación registrada | Creado el 10 de septiembre de 2026, actualizado el 10 de septiembre de 2026 (fechas del repositorio en Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-3B-Instruct, un transformer decoder-only con atención de consultas agrupadas (GQA). Sobre él se entrena un adaptador LoRA de rango 16 y alpha 32 aplicado a todas las proyecciones lineales, con cuantización de 4 bits del modelo base durante el entrenamiento (QLoRA) y pérdida calculada únicamente sobre los tokens del asistente. La longitud máxima de secuencia en entrenamiento es de 2048 tokens.

El pipeline de datos es el elemento más distintivo. Se parte de 63 artículos de acceso abierto de PMC centrados en proteómica, biopsia líquida y biomarcadores en plasma o suero. Un modelo profesor (MiniMax-M3) lee resumen, discusión y conclusión de cada artículo y destila dos cosas: lo que el autor afirma explícitamente y las inferencias profundas no declaradas. Después, un juez LLM puntúa cada candidato en cuatro dimensiones (novedad, especificidad, verificabilidad y anclaje al texto) y reduce el conjunto de 251 a 154 ejemplos. Finalmente, los datos se normalizan a preguntas de una sola frase, con un 99 % terminando en signo de interrogación.

La versión 0.2 se entrenó durante 3 épocas sobre esos 154 ejemplos. La versión 0.3 continúa el entrenamiento desde v0.2 durante 2 épocas con lr=5e-5 sobre 91 ejemplos filtrados por el juez (41 candidatos con puntuación igual o superior a 0,6 más 50 referencias de expertos). No se menciona uso de RLHF ni DPO; el autor lo plantea como trabajo futuro, con chosen = best-of-N de v0.2 y rejected = candidatos del modelo base.

## Capacidades

- Generación de preguntas de investigación abiertas a partir de literatura biomédica, en una sola frase, con mención de moléculas, vías, métodos o poblaciones concretas.
- Inferencia de preguntas no formuladas explícitamente, apoyándose especialmente en la sección de discusión (el autor la señala como la fuente principal de inferencia profunda).
- Manejo de entrada estructurada con título, resumen, discusión y conclusión, con truncado a 2048 tokens.
- Generación con muestreo configurable (temperature, top_p, max_new_tokens), lo que permite obtener varias preguntas candidatas por artículo y aplicar best-of-N.
- Capacidad de seguir un prompt de sistema que impone restricciones de formato (pregunta única, terminada en signo de interrogación, específica y contrastable).
- Capacidad multilingüe limitada a chino e inglés en los metadatos; el prompt de sistema documentado está en chino.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido según la información disponible.
- No está diseñado para responder preguntas: el autor indica explícitamente que la tarea es únicamente la generación de preguntas.

## Casos de uso

- Generación de hipótesis en proteómica y biopsia líquida: se introduce la discusión completa de un artículo sobre biomarcadores plasmáticos y el modelo devuelve una pregunta abierta que orienta el siguiente experimento, por ejemplo sobre validación en cohortes independientes o sobre mecanismos no explorados.
- Curaduría de literatura para grupos de investigación: procesar por lotes los artículos de un tema (por ejemplo, vesículas extracelulares en cáncer de páncreas) y construir una lista de preguntas abiertas que alimente la agenda del laboratorio o un journal club.
- Construcción de conjuntos de datos de preguntas científicas: usar el modelo como generador de preguntas contrastables para evaluar otros LLM en tareas de razonamiento científico o para entrenar recuperadores en dominios biomédicos.
- Apoyo a la redacción de manuscritos: generar automáticamente borradores de secciones de trabajo futuro o de limitaciones a partir de la discusión de un artículo propio, que el autor revisa y reformula.
- Triage en pipelines de descubrimiento de biomarcadores: en un flujo que ingiere literatura nueva cada semana, el modelo identifica qué preguntas quedan abiertas y prioriza las publicaciones con mayor densidad de hipótesis no resueltas.
- Asistencia a comités de evaluación o financiación: resumir en forma de preguntas concretas los puntos ciegos declarados en un conjunto de publicaciones de un área, para justificar la pertinencia de una convocatoria o de una propuesta.
- Docencia e itinerarios formativos: convertir revisiones de literatura del área en preguntas guía para seminarios de máster o doctorado, con la advertencia de que el modelo no funciona bien sobre revisiones puras.
- Análisis de resultados contradictorios: dado un artículo que reporta discrepancias entre cohortes o métodos, obtener una pregunta que concrete qué comparación falta por hacer.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados corresponden a la comparación interna entre v0.2 y v0.3 sobre un conjunto de validación de 12 artículos no vistos, con 4 candidatos por artículo (48 muestras). Las puntuaciones de reward proceden del mismo juez LLM usado en el filtrado, por lo que no son comparables con benchmarks estándar tipo MMLU o HumanEval, que no se han publicado.

| Métrica (holdout, 12 artículos × 4 candidatos) | v0.2 | v0.3 | Delta |
|---|---|---|---|
| Reward medio de candidatos | 0,6888 | 0,7113 | +0,0225 |
| Tasa de aprobación del juez | 39,58 % | 45,83 % | +6,25 pp |
| Reward medio best-of-4 | 0,8333 | 0,8675 | +0,0342 |
| Comparación pareada cabeza a cabeza (n=12, doble juicio con orden permutado) | — | — | v0.3 gana 3 / v0.2 gana 2 / empate 7 |

El propio autor califica el avance como marginal pero creíble: la mejora principal está en el anclaje al texto (grounding, +0,08), mientras que en reward medio la ganancia es pequeña. La comparación pareada, con 7 empates sobre 12, no permite afirmar una superioridad clara.

## Requisitos de hardware

- Inferencia en precisión completa (fp16/bf16) del modelo base de 3B más el adaptador: en torno a 6,5-7 GB de VRAM (estimación a partir del tamaño del modelo base; no confirmada en la documentación del autor).
- Inferencia con cuantización de 8 bits: aproximadamente 4 GB de VRAM (estimación).
- Inferencia con cuantización de 4 bits: aproximadamente 2,5-3 GB de VRAM (estimación). El autor indica que el flujo LoRA en 4 bits cabe en 8 GB de VRAM, tanto para entrenamiento como para inferencia.
- GPU de consumo compatibles: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090. Con 8 GB de VRAM es viable en 4 bits según el autor.
- GPU de centro de datos: A100, H100, L40S; no son necesarias para un modelo de 3B, pero permiten servir muchas réplicas concurrentes.
- Despliegue documentado: transformers más peft (carga del adaptador sobre el modelo base), con un script de inferencia por línea de comandos incluido en el repositorio.
- Otras vías razonables: fusión del adaptador en los pesos base y conversión a GGUF para llama.cpp u Ollama; vLLM o TGI con soporte de adaptadores LoRA. Estas vías no están documentadas por el autor para esta versión.
- Latencia y throughput: no disponible.
- Nota práctica: como es un adaptador, el consumo de disco y de memoria incluye siempre el modelo base, además de los 0,4 GB del repositorio.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos especializados equivalentes en generación de preguntas biomédicas sobre proteómica o biopsia líquida. La comparación se limita al modelo base y a la versión anterior del mismo autor.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ask-dao-v0.3 | 3,09 mil millones (base) + adaptador LoRA | 32.768 tokens en el base; 2048 en entrenamiento | Generación de preguntas de investigación biomédica | MIT | Hugging Face, adaptador PEFT |
| ask-dao-v0.2 | 3,09 mil millones (base) + adaptador LoRA | Idéntico | Idéntica | MIT (según el repositorio del autor) | Hugging Face, adaptador PEFT |
| Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 tokens | Asistente generalista de propósito múltiple | Apache 2.0 (licencia del modelo base) | Hugging Face, pesos completos |

Frente al modelo base, el adaptador gana especialización y adherencia al formato de pregunta en un dominio estrecho, pero pierde generalidad y no aporta capacidad de respuesta. Frente a v0.2, la mejora medida es marginal en reward y no concluyente en la comparación pareada, aunque con mejor anclaje al texto de origen.

## Limitaciones y advertencias

- Tamaño de datos muy reducido: 63 artículos, 154 ejemplos en v0.2 y 91 ejemplos en el refinamiento de v0.3. El riesgo de sobreajuste al dominio y de baja generalización a otros subcampos es alto.
- Dominio estrecho: solo proteómica, biopsia líquida y biomarcadores en plasma o suero. En otros subcampos biomédicos la calidad cae de forma notable, y en áreas no biomédicas el modelo no es aplicable.
- Requiere secciones de discusión y conclusión. Con entradas de solo resumen la calidad disminuye, y con revisiones puras el modelo produce respuestas genéricas o tópicos vacíos.
- Formato inestable en muestreo amplio: con num_return_sequences igual o superior a 3 y temperature igual o superior a 0,75, aproximadamente un tercio de las salidas incluye prefijos declarativos o varias frases. El autor recomienda truncar en el primer signo de interrogación como mitigación.
- El refinamiento de v0.3 es corto (24 pasos), por lo que la mejora es limitada y no debe esperarse un salto cualitativo respecto a v0.2.
- Riesgo de alucinación: el modelo puede generar preguntas que suenen plausibles pero no se deriven del texto; el anclaje al artículo es el criterio principal del juez y conviene verificar manualmente cada pregunta.
- Sesgo potencial derivado del corpus: los 63 artículos de PMC y el juez LLM empleado en el filtrado condicionan la distribución de temas, enfoques metodológicos e idioma.
- Historial de errores de empaquetado: los repositorios anteriores shikunpunk/ask-dao y shikunpunk/ask-dao-v0.2-2ep tenían un error de anidamiento de claves en PeftModel que provocaba que los pesos se descartaran silenciosamente al cargar. Esos repositorios se republicaron con profundidad 8. Conviene verificar la carga del adaptador antes de usarlo.
- Idiomas: los metadatos declaran chino e inglés; no hay evidencia de soporte para castellano ni para otras lenguas.
- Licencia: MIT, sin restricciones para uso comercial. Aun así, el modelo base Qwen2.5-3B-Instruct se rige por su propia licencia, que debe respetarse al combinar ambos.
- El modelo no genera respuestas ni verifica hechos: no debe usarse para tareas de respuesta a preguntas, diagnóstico ni recomendación clínica.
- Fecha de publicación registrada en Hugging Face (10 de septiembre de 2026) posterior a la fecha de esta ficha; conviene comprobar el estado del repositorio antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shikunpunk/ask-dao-v0.3
- Versión anterior v0.2: https://huggingface.co/shikunpunk/ask-dao-v0.2
- Perfil del autor en Hugging Face: https://huggingface.co/shikunpunk
- Listado de modelos del autor: https://huggingface.co/shikunpunk/models
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Cita sugerida por el autor: https://huggingface.co/shikunpunk/ask-dao-v0.3 (entrada BibTeX askdao_v03_2026 en la model card)
- Repositorio citado para el script de inferencia: infer_cli.py incluido en el repositorio del modelo, con ejemplo examples/example1_PMC7611254.txt
- Paper, blog o demo adicionales: no disponible en la información proporcionada
