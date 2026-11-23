# 0biyohan/qwen3-1.7b-medical-triage-fr

## Resumen

Qwen3-1.7B triage medical (francés) es un ajuste fino del modelo base Qwen/Qwen3-1.7B-Base orientado a una única tarea: proponer un nivel de prioridad de triaje en un servicio de urgencias hospitalarias a partir de un caso clínico en formato de elección múltiple cerrada. Lo desarrolla el usuario 0biyohan como prueba de concepto (POC) de formación, no como producto clínico, y combina un ajuste supervisado con LoRA (SFT) seguido de una alineación por preferencias con DPO, ambos adaptadores fusionados en los pesos finales en bf16.

El modelo tiene 1.720.574.976 parámetros (1,7 mil millones), es un transformer denso de la familia Qwen3 sin mezcla de expertos, y trabaja sobre una ventana de contexto corta en la práctica: la configuración de referencia de vLLM limita `max-model-len` a 2048 tokens. Su interés no está en el rendimiento bruto, sino en el ejercicio metodológico: un pipeline SFT + DPO reproducible sobre datos clínicos bilingües (francés e inglés), con evaluación honesta de resultados y de limitaciones, incluido el sesgo de sobretriaje.

Es relevante ahora porque ejemplifica el patrón de adaptación de modelos pequeños a dominios regulados con presupuesto mínimo, y porque documenta de forma explícita por qué un modelo de 1,7B sin datos etiquetados de triaje no debe desplegarse en producción sanitaria. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), ajuste fino con LoRA fusionado |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; la receta de despliegue con vLLM usa `--max-model-len 2048` |
| Tipos de cuantizacion | Pesos publicados en bf16 (3,4 GB); no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | Francés (fr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es Qwen3-1.7B-Base, un transformer denso de 1,7B parámetros. Sobre él se aplicó un SFT con LoRA de rango 16, alpha 32, dropout 0,05 y adaptadores en todas las capas lineales, con pérdida calculada sobre todas las respuestas, una época, learning rate 2e-4 con decaimiento coseno, batch efectivo de 16 y secuencias de 1536 tokens (semilla 42). El conjunto de SFT consta de 3500 preguntas: casos clínicos de MediQAl (preguntas abiertas y de elección múltiple con una o varias respuestas correctas) y 1400 preguntas en inglés de UltraMedical.

Después se aplicó DPO con LoRA sobre 2234 pares de preferencia: 1507 pares de elección múltiple de MediQAl, donde la respuesta rechazada se construye con una sustitución, una omisión o una adición sobre la correcta, y 727 pares de UltraMedical-Preference verificados contra la respuesta correcta. La pérdida combina DPO (beta 0,1) con un término de verosimilitud de la respuesta elegida, learning rate 5e-5, una época y batch efectivo 16, tomando como referencia el modelo tras SFT. Ese término de verosimilitud es una decisión técnica relevante: sin él, aproximadamente una de cada diez respuestas añadía una explicación y rompía el formato cerrado. Los datos se anonimizaron con Presidio y spaCy y se dividieron por caso clínico, de modo que ningún caso aparece a la vez en SFT, DPO y evaluación. Herramientas: PyTorch, Transformers, PEFT, TRL y MLflow.

## Capacidades

- Generación de texto en francés e inglés con plantilla de conversación ChatML incluida (`chat_template.jinja`).
- Clasificación de triaje en formato cerrado de tres niveles: urgencia máxima (A), urgencia moderada (B) y urgencia diferida (C), con lectura de la letra generada y de las probabilidades vía `logprobs` con `max_tokens: 1`.
- Respuesta a preguntas de elección múltiple médicas con una única respuesta correcta (proposiciones A a E) y con varias respuestas correctas (2 a 5).
- Formato de respuesta controlado: `C. texto de la proposición` o lista con viñetas `- A. …`, con una tasa de cumplimiento del 99 % según el autor.
- Soporte de conversación multi-turno mediante plantilla de chat, aunque el entrenamiento se centró en turnos únicos de caso clínico más pregunta.
- Compatibilidad con vLLM y con text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio).
- No soporta tool calling ni function calling de forma documentada; no se mencionan capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Prueba de concepto de triaje en urgencias: el modelo recibe un caso clínico estructurado (edad, motivo, síntomas, antecedentes, constantes) y devuelve un nivel de prioridad A/B/C con probabilidades asociadas, útil para demostrar un flujo de decisión asistida antes de invertir en datos etiquetados reales.
- Investigación sobre alineación con DPO en dominios especializados: sirve como caso reproducible de pipeline SFT + DPO con LoRA sobre 1,7B parámetros, con curvas de preferencia y evaluación McNemar documentadas.
- Evaluación comparativa de modelos pequeños en QCM médicos: su rendimiento publicado (0,445 en MediQAl `mcqu` y 0,121 en `mcqm`) permite situar la línea base de un modelo de 1,7B frente a alternativas mayores en tareas de conocimiento médico en francés.
- Generación de exámenes de práctica médica en francés: el formato de elección múltiple con una o varias respuestas correctas encaja con la creación de bancos de preguntas para formación de personal sanitario, siempre con revisión humana.
- Filtrado previo en pipelines de clasificación de motivos benignos: combinado con reglas deterministas (constantes fuera de umbral fuerzan urgencia máxima; lista cerrada de motivos benignos fuerza urgencia diferida), puede emplearse como capa de sugerencia en un sistema mayor, nunca como decisión final.
- Despliegue de bajo coste en infraestructura modesta: con 3,4 GB en bf16 y latencias de 82 ms en local y 0,55 s en GPU T4 en la nube (mediana, red incluida), es viable para demos interactivas y entornos de evaluación con presupuesto limitado.
- Estudio de sesgos de sobretriaje: su a priori de 0,74 hacia la urgencia máxima sobre un caso vacío lo convierte en un objeto de estudio útil para medir cómo un ajuste fino con datos no etiquetados por nivel desplaza la distribución de salidas.

## Benchmarks y rendimiento

Triaje sobre 60 casos públicos del conjunto clinical-triage-bilingual (20 por nivel, etiquetas fijadas por el autor del conjunto sin validación médica), modelo solo:

| Metrica | Resultado |
|---|---|
| Niveles correctos | 23 / 60 |
| Urgencias vitales subtriadas | 1 / 20 |
| Casos sobretriados | 36 / 60 |

QCM médicos en francés, 828 preguntas de test nunca vistas, respuesta exactamente igual a la correcta:

| Juego | Preguntas | SFT solo | SFT + DPO | Respuesta mas frecuente |
|---|---|---|---|---|
| MediQAl `mcqu` (una respuesta) | 389 | 0,432 | 0,445 | 0,211 |
| MediQAl `mcqm` (2 a 5 respuestas) | 439 | 0,109 | 0,121 | 0,059 |

Otros datos reportados por el autor: sin regresión atribuible al DPO (McNemar, p = 0,36), formato respetado en el 99 % de los casos, proposiciones marcadas de más reducidas de 0,62 a 0,02 por pregunta, y preferencia DPO sobre los pares de test de 0,68 en francés y 0,74 en inglés (test revisado por expertos). Latencia con vLLM para una petición de triaje: 82 ms de mediana en local y 0,55 s en GPU T4 en la nube, red incluida.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB en bf16 para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 5 y 6 GB con contexto de 2048 tokens.
- GPU recomendadas: T4 (validada por el autor, 0,55 s de latencia mediana con red), L4, A10G, A100 y H100 para mayor throughput; cualquier GPU con al menos 8 GB de VRAM en bf16.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090; en tarjetas de 8 GB conviene usar cuantización a 8 bits o inferior, no publicada oficialmente.
- Opciones de despliegue: vLLM (receta oficial con `--served-model-name qwen3-medical --max-model-len 2048` y endpoint `/v1/chat/completions` con `temperature: 0`), text-generation-inference y transformers con PEFT; llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión no documentada por el autor.
- Latencia y throughput: 82 ms por petición de triaje en local y 0,55 s en T4 en la nube (medianas); no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 0biyohan/qwen3-1.7b-medical-triage-fr | 1,7B | 2048 en la receta de despliegue | 23/60 en triaje; 0,445 en MediQAl `mcqu` | Apache 2.0 | Hugging Face, 14 descargas |
| Qwen/Qwen3-1.7B-Base | 1,7B | No disponible | No evaluado en estos conjuntos por el autor | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (instruct) | 1,7B | No disponible | No disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| Modelos médicos mayores (p. ej. familia Meditron o BioMistral) | 7B o más | No disponible | No disponible en la información proporcionada | Variables | Hugging Face |

La comparación directa con alternativas médicas de mayor tamaño no puede cuantificarse porque la información disponible no incluye sus resultados en MediQAl ni en clinical-triage-bilingual. El dato más informativo es la comparación interna SFT frente a SFT + DPO, que muestra una mejora de 0,432 a 0,445 en `mcqu` y de 0,109 a 0,121 en `mcqm`.

## Limitaciones y advertencias

- El triaje no se aprendió de forma directa: no hay ejemplos etiquetados por nivel de prioridad, y el modelo sobretriaja de forma sistemática (36 de 60 casos), lo que en un servicio real saturaría la atención.
- El a priori hacia la urgencia máxima es de 0,74 sobre un caso vacío; una calibración de ese a priori gana 5 niveles pero subtria más de la mitad de las urgencias vitales, por lo que el autor no la emplea.
- Conocimiento médico limitado por el tamaño: menos de una respuesta correcta de cada dos en QCM de respuesta única y alrededor del 12 % en QCM de respuesta múltiple.
- Solo funciona de forma fiable en formato cerrado; en pregunta libre, las respuestas en francés no son fiables según el propio autor.
- Un único entrenamiento con semilla 42: diferencias de pocos puntos entre versiones no son estadísticamente significativas.
- No está validado clínicamente, no emite diagnósticos y no sustituye el juicio médico; la model card lo declara explícitamente como demostración técnica.
- Los niveles de referencia del conjunto de evaluación de triaje fueron fijados por el autor del conjunto sin validación médica, lo que limita la interpretación de la métrica de 23/60.
- La plantilla de chat termina las respuestas con `<|endoftext|>` y no con `<|im_end|>`, porque el modelo base nunca vio ese token y el LoRA no modifica los embeddings; usar la plantilla por defecto de Qwen3 puede degradar el formato.
- Riesgo de alucinación en contenido clínico fuera del formato de elección múltiple; sin datos publicados sobre sesgos demográficos más allá de la anonimización con Presidio y spaCy.
- Licencia Apache 2.0 en los pesos, pero los datos de entrenamiento tienen sus propias licencias (MediQAl CC-BY-4.0, UltraMedical-Preference MIT), lo que conviene revisar antes de un uso comercial derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0biyohan/qwen3-1.7b-medical-triage-fr
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/0biyohan/triage-medical-bilingual
- Dataset MediQAl: https://huggingface.co/datasets/ANR-MALADES/MediQAl
- Dataset UltraMedical-Preference: https://huggingface.co/datasets/TsinghuaC3I/UltraMedical-Preference
- Dataset de evaluación de triaje: https://huggingface.co/datasets/BenoitJT-GIRARD/clinical-triage-bilingual
- Revisión anterior del modelo (datos v3): revisión `476fed3104b92d446e5c915a6adea7338825c255` del mismo repositorio
- Revisión de referencia para vLLM: `4af91a7aa052c092cfb64568d441b84f8f4a88e8`
