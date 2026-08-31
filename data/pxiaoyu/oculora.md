# pxiaoyu/Oculora

## Resumen

Oculora es un modelo de lenguaje y visión (VLM) especializado en oftalmología, desarrollado por pxiaoyu sobre la base de Qwen/Qwen2.5-VL-7B-Instruct. Su objetivo es unificar la comprensión multimodal de imágenes oculares (fondo de ojo, OCT, angiografía fluoresceínica, lámpara de hendidura, B-scan, entre otras) con la generación clínica de informes y consultas médicas. El modelo se ha adaptado mediante un entrenamiento en tres etapas: preentrenamiento sobre 1,33 millones de pares imagen-texto, ajuste fino supervisado con 360 000 instrucciones oftálmicas y optimización de políticas con DAPO consciente del riesgo.

Con 8 290 millones de parámetros, Oculora cubre más de 300 afecciones oftálmicas y siete modalidades de imagen. En las evaluaciones publicadas, lidera todas las métricas de generación de texto libre en los benchmarks externos OphthalVQA, FFA-IR y JAMA Challenge frente a Qwen3-VL, MedGemma y Lingshu, con significación estadística (P < 0,001). El modelo se distribuye bajo licencia Apache-2.0 y está pensado exclusivamente para investigación, no como dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer multimodal vision-language) |
| Parametros totales | 8 292 166 656 (8,29 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Oculora se basa en la arquitectura Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa imágenes y texto de forma conjunta. El entrenamiento se realizó en tres etapas: primero, un preentrenamiento sobre 1,33 millones de pares imagen-texto para alinear las representaciones visuales y lingüísticas en el dominio oftálmico; después, un ajuste fino supervisado con 360 000 instrucciones oftálmicas que cubren tareas de comprensión (preguntas de opción múltiple y respuesta corta) y generación (informes y consultas); finalmente, una optimización de políticas con DAPO (Direct Alignment with Policy Optimization) consciente del riesgo, orientada a reducir la generación de contenido no respaldado por la evidencia clínica.

El modelo se distribuye con una configuración de generación y preprocesado específica (`generation_config.json` y `preprocessor_config.json`) que reproduce exactamente el entorno evaluado, incluyendo decodificación greedy y un límite de píxeles de 262 144. No se han publicado detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de los pares imagen-texto e instrucciones mencionados.

## Capacidades

- Comprensión multimodal de imágenes oftálmicas: fondo de ojo, OCT, angiografía fluoresceínica (FFA), lámpara de hendidura, B-scan y otras modalidades.
- Generación de informes clínicos estructurados a partir de imágenes y contexto clínico.
- Consulta médica abierta: respuestas orientadas a diagnóstico y manejo sin pistas diagnósticas predefinidas.
- Respuesta a preguntas de opción múltiple y de respuesta corta sobre hallazgos oculares.
- Soporte de conversación multimodal multi-turno (imagen + texto) mediante el pipeline `image-text-to-text`.
- Capacidad multilingüe limitada al inglés (según la ficha del modelo).
- No se especifica soporte explícito de tool calling ni de agentes; el modelo está orientado a tareas clínicas de generación y comprensión.

## Casos de uso

- Generación de informes de retinografía: el modelo puede describir hallazgos en imágenes de fondo de ojo y sugerir un diagnóstico probable, útil para asistir a oftalmólogos en la redacción de informes preliminares.
- Consulta clínica asistida: ante una imagen y una pregunta del paciente, Oculora puede sintetizar el contexto clínico y ofrecer una respuesta orientada al manejo, sin reemplazar el juicio médico.
- Triaje de imágenes en telemedicina: integrado en plataformas de teleoftalmología, puede priorizar casos según la gravedad de los hallazgos detectados en OCT o retinografías.
- Educación médica: como herramienta de entrenamiento para residentes, permite practicar la interpretación de imágenes oculares y comparar respuestas con las de un modelo especializado.
- Investigación en VLM médicos: sirve como punto de partida para fine-tuning en subespecialidades oftálmicas o para estudiar la generación de texto clínico con modelos de 7B.
- Anotación asistida de datasets: puede pre-etiquetar imágenes oftálmicas con descripciones textuales que luego son revisadas por expertos, acelerando la creación de conjuntos de datos.

## Benchmarks y rendimiento

Según la model card, Oculora fue evaluado en un conjunto de prueba interno de 22 000 muestras y en cuatro benchmarks externos que cubren siete modalidades y más de 300 afecciones. Los resultados publicados incluyen:

| Benchmark | Metrica | Oculora | Comparacion |
|---|---|---|---|
| Interno (multiple-choice) | Exactitud | 0,820 | - |
| JSIEC (multiple-choice) | Exactitud | 0,674 | - |
| JAMA Challenge | ROUGE-L | 0,500 | Qwen3-VL-8B: 0,311 |
| JAMA Challenge | BERTScore-F1 | 0,927 | Qwen3-VL-8B: 0,893 |

Además, se indica que Oculora lidera todas las métricas de generación en OphthalVQA, FFA-IR y JAMA Challenge frente a Qwen3-VL, MedGemma y Lingshu, con P < 0,001. En una revisión clínica ciega de 50 casos, obtuvo la puntuación más alta en corrección y control de contenido no respaldado, con un acuerdo del 0,94 (IC 95 % 0,90–0,97) entre el juez LLM y los oftalmólogos. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Peso en bfloat16: aproximadamente 17 GB, más la caché KV.
- GPU recomendada: una A100 de 40 GB o una L40S de 48 GB es suficiente para una longitud de contexto de 8192 tokens con vLLM.
- No se indica si cabe en GPUs de consumo (p. ej., RTX 4090 de 24 GB) sin cuantización; con cuantización de 8 bits o 4 bits podría ser posible, pero no se proporcionan datos.
- Opciones de despliegue: vLLM (servidor compatible con OpenAI), transformers con `device_map="auto"`, y potencialmente otras herramientas compatibles con safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La model card menciona comparaciones con Qwen3-VL-8B, MedGemma y Lingshu, pero no se proporcionan sus especificaciones completas. A partir de los datos disponibles:

| Modelo | Parametros | Contexto | Licencia | Rendimiento en JAMA Challenge (ROUGE-L) |
|---|---|---|---|---|
| Oculora | 8,29 B | no disponible | Apache-2.0 | 0,500 |
| Qwen3-VL-8B | ~8 B (no confirmado) | no disponible | no disponible | 0,311 |
| MedGemma | no disponible | no disponible | no disponible | no disponible |
| Lingshu | no disponible | no disponible | no disponible | no disponible |

No se dispone de más detalles para una comparación exhaustiva.

## Limitaciones y advertencias

- Uso exclusivo para investigación: no es un dispositivo médico y no está aprobado por ningún organismo regulador; no debe utilizarse para diagnóstico, triaje o decisiones de tratamiento en pacientes reales.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido plausible pero incorrecto o no respaldado por la imagen; la optimización con DAPO reduce este riesgo pero no lo elimina.
- Sesgos potenciales: el entrenamiento se basa en datos de imágenes oftálmicas que pueden no representar todas las poblaciones o equipos de captura; la generalización a entornos clínicos diversos no está garantizada.
- Limitación de idioma: solo soporta inglés, lo que restringe su uso en entornos hispanohablantes sin traducción adicional.
- Contexto limitado: no se especifica la longitud máxima de contexto; el ejemplo de despliegue usa 8192 tokens, pero el modelo base Qwen2.5-VL soporta más; se recomienda verificar antes de usar en tareas de contexto largo.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el uso comercial está condicionado a la normativa médica local y a la responsabilidad legal; el autor declara explícitamente que no es apto para uso clínico real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pxiaoyu/Oculora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- No se han encontrado enlaces adicionales (paper, repositorio de código o demo) en la información proporcionada.
