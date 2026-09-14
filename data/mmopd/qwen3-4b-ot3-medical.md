# MMOPD/Qwen3-4B-OT3-medical

## Resumen

Qwen3-4B-OT3-medical es un modelo de lenguaje de 4.022 millones de parámetros desarrollado por MMOPD como parte del estudio MMOPD (multi-model on-policy distillation). Se trata del "teacher" de dominio médico de esa familia: parte del checkpoint MMOPD/Qwen3-4B-OT3-2ep y se afina de forma supervisada sobre trazas de razonamiento largo verificadas, generadas por un modelo mucho mayor, Qwen3.6-35B-A3B, que alcanza un 94,6 % en MedQA. El objetivo es transferir capacidad de razonamiento clínico a un modelo compacto manteniendo el formato de pensamiento estándar de Qwen3.

El problema que resuelve es concreto: elevar el rendimiento en preguntas médicas tipo USMLE en un modelo que quepa en hardware de consumo, sin renunciar al formato de cadena de pensamiento (`<think> ... </think>`) del ecosistema Qwen3. Según la model card, MedQA sube de 69,8 a 80,7 puntos porcentuales respecto al checkpoint de partida, y MedXpertQA de 13,7 a 22,3. El coste es un deterioro apreciable en capacidades generales, especialmente matemáticas y código.

Es relevante ahora porque forma parte de una familia de "teachers" de dominio publicados bajo Apache-2.0 y porque documenta explícitamente el intercambio entre especialización y capacidades generales, un dato útil para quien planifique destilación on-policy hacia modelos más pequeños. El modelo solo declara soporte de inglés y no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3; no se detalla en la model card, se deriva del checkpoint base Qwen3-4B) |
| Parámetros totales | 4.022.468.096 (dato de safetensors) |
| Longitud de contexto | No especificada en la model card; el entrenamiento SFT usó una longitud máxima de 8.192 tokens y el ejemplo de despliegue con vLLM usa `--max-model-len 40960` |
| Tipos de cuantización | No disponible; los pesos se publican en bfloat16 y no se anuncian versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16), biblioteca transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint MMOPD/Qwen3-4B-OT3-2ep, a su vez derivado de Qwen3-4B: un transformer decoder-only denso de 4.022 millones de parámetros, con plantilla de chat y formato de pensamiento de Qwen3. No se publican en la información disponible detalles de número de capas, cabezas de atención, tamaño de vocabulario ni uso de atención lineal o decodificación especulativa.

El entrenamiento es un SFT de 4 épocas con learning rate 1e-5, 5 % de warmup, longitud máxima de 8.192 tokens, *flatten packing*, precisión bf16 y ZeRO-2, sobre el checkpoint final (paso 3.368). Los datos son 40.853 trazas de profesor verificadas sobre preguntas de entrenamiento de MedQA-USMLE, en formato de 4 opciones (20.360) y 5 opciones (20.493), con 15.427 variantes de *prompt*, decontaminadas con n-gramas de orden 8 contra los conjuntos de evaluación. Las trazas las generó Qwen3.6-35B-A3B con 8 muestras por pregunta a temperatura 1.0, conservando únicamente aquellas cuya respuesta final coincidía con la opción correcta (*rejection sampling*), hasta 3 trazas distintas por pregunta y dando prioridad a las más cortas; la parte de pensamiento se limitó a 16.000 caracteres. Se desconoce si se aplicaron etapas posteriores de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento extenso en formato de cadena de pensamiento, con la etiqueta `<think> ... </think>` antes de la respuesta, siguiendo la convención de Qwen3.
- Razonamiento clínico y respuesta a preguntas médicas de estilo USMLE, tanto en formato de 4 como de 5 opciones.
- Preguntas de comprensión sobre literatura biomédica (PubMedQA) con precisión del 77,2 % y macro-F1 de 57,4.
- Preguntas de casos clínicos legales-médicos del estilo CaseHOLD (59,8 % de acierto).
- Razonamiento numérico sobre informes financieros (FinQA, 54,0 %), aunque con degradación respecto al checkpoint inicial.
- Razonamiento matemático de competición (AIME24 52,9 %, AIME25 45,0 %, AIME26 40,0 %), muy por debajo del modelo de partida.
- Generación de código de nivel de competición moderado (LiveCodeBench v6, 39,9 %).
- Seguimiento de instrucciones (IFEval 41,2 %; IFBench 27,0 %).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte explícito de agentes y razonamiento multi-paso: no documentado; el entrenamiento se centra en trazas de un solo turno.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Capacidad especial: modo *thinking* activable mediante `enable_thinking=True` en la plantilla de chat.

## Casos de uso

- Preparación de exámenes médicos tipo USMLE: el modelo genera una cadena de razonamiento completa antes de elegir opción, y su 80,7 % en MedQA lo hace útil como generador de explicaciones razonadas para preguntas de práctica, no solo como clasificador de opciones.
- Destilación de conocimiento hacia modelos más pequeños: dado que el modelo se diseñó explícitamente como *teacher*, puede generar trazas largas verificables que se filtren por coincidencia con la respuesta correcta y se usen para entrenar modelos de 1,7B o inferiores de la misma familia.
- Investigación en razonamiento clínico y evaluación de robustez: sirve como sujeto de estudio para medir cuánto se degradan las capacidades generales al especializar un modelo de 4B mediante SFT sobre trazas de un profesor de 35B.
- Triaje documental y respuesta a preguntas sobre literatura biomédica: con 77,2 % en PubMedQA, puede emplearse para resumir y responder cuestiones sobre abstracts y textos de investigación, siempre con revisión humana.
- Extracción y razonamiento sobre datos cuantitativos en documentos financieros o administrativos: el 54,0 % en FinQA permite usarlo en prototipos de análisis de tablas y estados financieros, aunque con precisión limitada.
- Generación de variantes de preguntas y distractores para bancos de evaluación clínica: a partir de un caso base, el modelo puede producir opciones plausibles y justificar por qué cada una es incorrecta, dado que fue entrenado con formatos de 4 y 5 opciones.
- Servicio de inferencia con contexto largo en vLLM: el ejemplo oficial (`vllm serve ... --max-model-len 40960`) permite desplegarlo tras una API compatible con OpenAI para aplicaciones de chat con presupuesto de generación de hasta 32.768 tokens nuevos.

## Benchmarks y rendimiento

Benchmarks de dominio, medidos con temperatura 1.0, top-p 1.0 y presupuesto de generación largo (precisión en %):

| Modelo | MedQA | MedXpertQA | PubMedQA | CaseHOLD | FinQA | TAT-QA (EM) |
|---|---|---|---|---|---|---|
| Qwen3-4B-OT3-medical (este) | 80,7 | 22,3 | 77,2 | 59,8 | 54,0 | – |
| Qwen3-4B-OT3-2ep (iniciador) | 69,8 | 13,7 | 75,2 | 63,2 | 58,3 | 24,4 |

PubMedQA se reporta como precisión; la macro-F1 es 57,4 frente a 56,6 del iniciador.

Benchmarks generales, con el preset de pensamiento de Qwen3 (temperatura 0,6, top-p 0,95, top-k 20, máximo 32.768 tokens nuevos; AIME como avg@8, el resto con 1 muestra; puntuaciones en %):

| Modelo | AIME24 | AIME25 | AIME26 | LiveCodeBench v6 | IFEval | IFBench |
|---|---|---|---|---|---|---|
| Qwen3-4B-OT3-medical (este) | 52,9 | 45,0 | 40,0 | 39,9 | 41,2 | 27,0 |
| Qwen3-4B-OT3-2ep (iniciador) | 66,3 | 56,3 | 58,3 | 51,7 | 51,0 | 27,7 |

No se han publicado en la información disponible resultados de benchmarks frente a modelos externos a la familia MMOPD.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 8 GB (4.022 millones de parámetros × 2 bytes). Con overhead de runtime y caché KV para contextos moderados, una estimación razonable es de 10 a 12 GB. Para contextos de decenas de miles de tokens la caché KV crece de forma significativa y la cifra depende de la configuración de capas y cabezas, que no se publica. Estas cifras son estimaciones, no mediciones del autor.
- Cuantización: no se publican pesos cuantizados oficiales. Una conversión propia a 8 bits reduciría los pesos a unos 4-5 GB y a 4 bits a unos 2,5-3 GB, pero esos valores no están verificados por el autor.
- GPU recomendadas: para bfloat16 sin cuantizar, una RTX 4090 o RTX 3090 de 24 GB es suficiente; también A100 de 40 u 80 GB y H100 para despliegue con concurrencia alta y contexto largo.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090, 4090) en bfloat16 y presumiblemente en tarjetas de 12 GB si se cuantiza, aunque no se ofrecen cuantizaciones oficiales.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` (ejemplo oficial en la model card) y vLLM (`vllm serve` con `--max-model-len 40960`). El modelo está etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que TGI y los endpoints compatibles con OpenAI son opciones declaradas. No hay GGUF publicado, por lo que llama.cpp y Ollama requerirían conversión propia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | MedQA | MedXpertQA | PubMedQA | AIME24 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| MMOPD/Qwen3-4B-OT3-medical | 4,02B | 80,7 | 22,3 | 77,2 | 52,9 | Apache-2.0 | HuggingFace, safetensors |
| MMOPD/Qwen3-4B-OT3-2ep (iniciador) | 4,02B | 69,8 | 13,7 | 75,2 | 66,3 | no disponible en la información | HuggingFace |
| MMOPD/Qwen3-4B-OT3-law | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | Miembro de la familia MMOPD citado en la model card |
| MMOPD/Qwen3-4B-OT3-finance | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | Miembro de la familia MMOPD citado en la model card |
| MMOPD/Qwen3-4B-OT3-if | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | Miembro de la familia MMOPD citado en la model card |

La información proporcionada no incluye comparaciones con modelos médicos de terceros (por ejemplo, Meditron, MedGemma o BioMistral), por lo que no se puede establecer una comparativa externa con datos.

## Limitaciones y advertencias

- Deterioro claro de capacidades generales por olvido catastrófico: AIME24 cae de 66,3 a 52,9, LiveCodeBench v6 de 51,7 a 39,9 e IFEval de 51,0 a 41,2 respecto al checkpoint de partida. No es un modelo de propósito general.
- Rendimiento irregular por subdominio: mejora MedQA y MedXpertQA, pero empeora CaseHOLD (63,2 → 59,8) y FinQA (58,3 → 54,0), y TAT-QA deja de reportarse.
- Riesgo de alucinación clínica: las respuestas se generan por muestreo y el modelo no incorpora verificación factual en inferencia. Un 22,3 % en MedXpertQA indica un margen de error amplio en preguntas médicas avanzadas.
- Sesgo y procedencia de los datos: las trazas provienen de un único modelo profesor (Qwen3.6-35B-A3B) y de un único conjunto de preguntas (MedQA-USMLE), con filtrado por coincidencia con la respuesta correcta, lo que puede reforzar los sesgos y el estilo de razonamiento del profesor y sobrerrepresentar el formato de examen estadounidense.
- Idiomas: solo se declara inglés. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Contexto: el entrenamiento se realizó con 8.192 tokens de longitud máxima, aunque el despliegue de ejemplo permite 40.960. No hay evaluación publicada del comportamiento más allá de la ventana de entrenamiento.
- Sesgo de selección en la evaluación: las puntuaciones de dominio se midieron con temperatura 1.0 y presupuesto de generación largo, un régimen distinto del preset recomendado para benchmarks generales; las cifras no son directamente comparables con evaluaciones hechas en modo greedy.
- Uso clínico: a pesar del nombre y del dominio, es un modelo de investigación derivado de un conjunto de examen. No es un producto sanitario, no ha pasado validación regulatoria ni ensayos clínicos y no debe usarse para diagnóstico o decisión terapéutica sin supervisión profesional.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero se ofrece sin garantías. Conviene verificar las condiciones de la licencia de Qwen3-4B original y de los datos MedQA subyacentes antes de un despliegue en producción.
- Validación comunitaria nula: 0 descargas y 0 valoraciones en el momento de redactar esta ficha, sin informes independientes de reproducibilidad.
- Fechas de creación y actualización del repositorio (2026-09-14) posteriores a la fecha habitual de referencia; conviene confirmar la vigencia del repositorio antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MMOPD/Qwen3-4B-OT3-medical
- Modelo base e iniciador del SFT: https://huggingface.co/MMOPD/Qwen3-4B-OT3-2ep
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Miembros de la familia citados en la model card: https://huggingface.co/MMOPD/Qwen3-4B-OT3-1ep, https://huggingface.co/MMOPD/Qwen3-1.7B-OT3-1ep, https://huggingface.co/MMOPD/Qwen3-1.7B-OT3-2ep
- Otros teachers de dominio de la familia: https://huggingface.co/MMOPD/Qwen3-4B-OT3-law, https://huggingface.co/MMOPD/Qwen3-4B-OT3-finance, https://huggingface.co/MMOPD/Qwen3-4B-OT3-if
- Paper, blog o repositorio del estudio MMOPD: no disponible en la información proporcionada.
- Los resultados de búsqueda web disponibles no contenían enlaces relevantes al modelo; los enlaces devueltos correspondían a contenidos sin relación (relojería histórica en Portugal) y se han descartado.
