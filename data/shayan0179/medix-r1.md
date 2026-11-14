# Shayan0179/Medix-R1

## Resumen

MediX-R1 es una reproducción de los checkpoints presentados en el artículo MediX-R1, publicada por el usuario Shayan0179 en Hugging Face. Se distribuye en dos variantes, MediX-R1-4B y MediX-R1-8B, obtenidas mediante aprendizaje por refuerzo a partir de los modelos Qwen3-VL-4B-Instruct y Qwen3-VL-8B-Instruct respectivamente. El objetivo es especializar un modelo visión-lenguaje de propósito general en tareas médicas de pregunta-respuesta sobre imágenes (VQA) y texto (QA), manteniendo la arquitectura y el pipeline image-text-to-text del modelo base.

El modelo está pensado para responder preguntas clínicas a partir de imágenes médicas (radiografías, entre otras) y de texto, con un formato de salida estructurado que incluye una etiqueta de modalidad, un bloque de razonamiento explícito entre etiquetas `<thinking>` y una respuesta final entre `<answer>`. Esta separación del razonamiento facilita la auditoría de las respuestas en un dominio sensible como el sanitario.

La relevancia actual radica en que aplica técnicas de RL sobre un VLM compacto (4B y 8B parámetros) para acercarse al rendimiento de modelos médicos especializados, con licencia Apache 2.0 y pesos en safetensors compatibles con la librería transformers. El repositorio ocupa 27,2 GB e incluye ambas variantes en carpetas separadas, cada una con su propia receta de entrenamiento y prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (Qwen3-VL), ajustado con aprendizaje por refuerzo |
| Parametros totales | 4B (MediX-R1-4B) y 8B (MediX-R1-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 27,2 GB, dos carpetas) |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen3-VL, un transformer multimodal que procesa texto e imágenes y genera texto. Sobre esa base se aplica un proceso de aprendizaje por refuerzo siguiendo la receta de MediX-R1, con el dataset MBZUAI/medix-rl-data. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni el algoritmo de RL empleado (por ejemplo, GRPO u otro), más allá de la etiqueta "reinforcement-learning" y la referencia a la receta del artículo original.

La innovación principal es el formato de salida en tres partes: una etiqueta de modalidad, un razonamiento explícito delimitado por `<thinking>...</thinking>` y una respuesta final delimitada por `<answer>...</answer>`. Este esquema de razonamiento previo a la respuesta es característico de los modelos entrenados con RL para tareas de razonamiento, y en el ámbito médico permite separar el proceso inferencial del resultado final. El prompt de entrenamiento se distribuye junto con los pesos en un fichero `prompt.txt` dentro de cada carpeta.

## Capacidades

- Generación de texto y razonamiento clínico con traza explícita en `<thinking>` y respuesta final en `<answer>`.
- Respuesta a preguntas sobre imágenes médicas (VQA), incluyendo modalidad de imagen y hallazgos.
- Respuesta a preguntas de texto médico (QA) sobre conocimiento clínico.
- Procesamiento conjunto de imagen y texto en un único pipeline image-text-to-text.
- Etiquetado de modalidad de la imagen como parte de la respuesta.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con la librería transformers mediante `Qwen3VLForConditionalGeneration`.
- Soporte de tool calling, agentes, audio o modo thinking nativo: no disponible en la información proporcionada.

## Casos de uso

- Asistencia a la lectura de radiografías: el modelo recibe una imagen (por ejemplo, una radiografía de tórax) y una pregunta concreta como "¿hay derrame pleural?", y devuelve una respuesta estructurada con razonamiento auditable, útil como segunda lectura en entornos de apoyo a la decisión.
- Triaje de preguntas clínicas en texto: integrado en un sistema de FAQ médica, responde consultas de conocimiento clínico con una traza de razonamiento que permite revisar la lógica antes de mostrar la respuesta al usuario.
- Generación de borradores de informes radiológicos: a partir de una imagen y una pregunta guiada, produce un texto con hallazgos y conclusión que un profesional puede revisar y editar.
- Evaluación y anotación de datasets médicos: el formato `<thinking>`/`<answer>` facilita extraer tanto la respuesta final como el razonamiento para tareas de anotación asistida y control de calidad.
- Investigación en RL para dominios sanitarios: al ser una reproducción de la receta MediX-R1 con pesos abiertos, sirve como punto de partida para experimentar con variantes de entrenamiento por refuerzo en VLM médicos.
- Despliegue en infraestructura moderada: las variantes de 4B y 8B permiten ejecutar el modelo en una sola GPU de gama alta o en GPUs de consumo con cuantización, lo que facilita prototipos y pruebas piloto sin clústeres dedicados.
- Sistemas de formación médica: el razonamiento explícito puede mostrarse como explicación didáctica de por qué se llega a una determinada conclusión ante una imagen clínica.

## Benchmarks y rendimiento

Resultados publicados en la model card (precisión en %, decodificación greedy, respuestas puntuadas por tres jueces LLM, sobre 6 benchmarks de VQA médica y 11 de QA médica en texto):

| Modelo | VQA | QA | Macro | Micro |
|---|---|---|---|---|
| MediX-R1-4B | 49,2 | 70,5 | 63,0 | 53,8 |
| MediX-R1-8B | 49,3 | 74,4 | 65,5 | 56,0 |

No se han publicado en la información disponible resultados desglosados por benchmark individual ni comparaciones con otros modelos en esta ficha; la model card remite a los README de cada carpeta para el detalle por benchmark.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo de 4B en bfloat16 se requiere del orden de 8-10 GB solo para pesos, y para 8B del orden de 16-18 GB, sin contar caché de activaciones ni procesamiento de imágenes.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) puede alojar la variante 4B en bfloat16 y la 8B con cuantización; A100 o H100 son adecuadas para ambas variantes y para mayor throughput.
- Cabe en GPU de consumo: la variante 4B es viable en GPUs de 16-24 GB; la 8B requiere cuantización para GPUs de 24 GB o menos.
- Opciones de despliegue: transformers con `Qwen3VLForConditionalGeneration` (documentado en la model card); compatibilidad con endpoints según el tag del repositorio. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento médico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediX-R1-4B | 4B | no disponible | VQA 49,2 / QA 70,5 / Macro 63,0 | Apache 2.0 | Hugging Face |
| MediX-R1-8B | 8B | no disponible | VQA 49,3 / QA 74,4 / Macro 65,5 | Apache 2.0 | Hugging Face |
| Qwen3-VL-4B-Instruct (base) | 4B | no disponible | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Qwen3-VL-8B-Instruct (base) | 8B | no disponible | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de resultados comparativos con otros modelos médicos especializados (por ejemplo, variantes de LLaVA-Med u otros VLM clínicos), por lo que la comparativa se limita a los modelos base y a las dos variantes entre sí.

## Limitaciones y advertencias

- Modelo de investigación: es una reproducción de un artículo, con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de validación clínica independiente.
- Riesgo de alucinación: como todo modelo generativo, puede producir hallazgos o diagnósticos inexistentes, especialmente en imágenes ambiguas o de baja calidad; el formato `<thinking>` no garantiza corrección.
- No es un dispositivo médico: no debe usarse como sustituto del juicio clínico ni para diagnóstico autónomo sin supervisión profesional.
- Sesgos: no se documentan en la información disponible; el dataset de RL (MBZUAI/medix-rl-data) puede introducir sesgos de población, modalidad o idioma que no están caracterizados en la model card.
- Idiomas: no se especifican los idiomas soportados; se desconoce el comportamiento en castellano.
- Contexto: no se publica la longitud máxima de contexto, lo que dificulta planificar casos con historiales largos o múltiples imágenes.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad regulatoria en aplicaciones sanitarias recae en el integrador.
- Formato de salida: el modelo espera un prompt de entrenamiento concreto (`prompt.txt`) y devuelve etiquetas `<thinking>` y `<answer>`; usarlo con otros formatos de prompt puede degradar la calidad de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shayan0179/Medix-R1
- Carpeta MediX-R1-4B: https://huggingface.co/Shayan0179/Medix-R1/tree/main/MediX-R1-4B
- Carpeta MediX-R1-8B: https://huggingface.co/Shayan0179/Medix-R1/tree/main/MediX-R1-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/MBZUAI/medix-rl-data
- Modelo base 4B: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Modelo base 8B: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Artículo MediX-R1: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
