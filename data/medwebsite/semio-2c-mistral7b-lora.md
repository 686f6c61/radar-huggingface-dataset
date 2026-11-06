# Medwebsite/semio-2c-mistral7b-lora

## Resumen

Sémio-2c es un adaptador LoRA de carácter médico construido sobre el modelo base Mistral-7B-Instruct-v0.2, desarrollado por el usuario Medwebsite (atribuido a "YM" en la model card). El adaptador está pensado para tareas de razonamiento clínico en formato de preguntas de opción múltiple (QCM), con especial atención al ámbito francófono y a la variante dialectal dariya (árabe marroquí). El repositorio tiene un tamaño de 0,1 GB, lo que confirma que se distribuyen únicamente los pesos del adaptador y no el modelo completo.

El modelo aborda un problema concreto: mejorar el rendimiento de un LLM generalista de 7B en preguntas médicas de examen en francés y en dariya, un dominio y unos idiomas poco representados en los corpus de preentrenamiento habituales. Según la model card, el adaptador se entrenó con MediQAl, FrenchMedMCQA, MedMCQA y traducciones al dariya generadas con Gemma, además de explicaciones sintéticas filtradas por corrección de respuesta.

Es relevante ahora porque demuestra un patrón de bajo coste (LoRA sobre un modelo abierto de 7B) para especialización médica multilingüe, aunque con resultados desiguales: mejora notable en MediQAl y ligera en FMPC, pero empeora en el conjunto de dariya. La model card lo declara explícitamente como herramienta pedagógica y no como sustituto del criterio médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Mistral-7B-Instruct-v0.2) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral-7B-Instruct-v0.2 soporta 32 768 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | fr, ar (incluye dariya), en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA que se aplica sobre Mistral-7B-Instruct-v0.2, un transformer decoder-only con atención de ventana deslizante y RoPE, del que no se detallan aquí cambios estructurales. El adaptador añade matrices de bajo rango en las capas del modelo base; no se especifican en la información disponible el rango, el alpha, las capas objetivo ni la configuración exacta de entrenamiento (learning rate, épocas, batch size).

Los datos de entrenamiento declarados son MediQAl (CC BY 4.0), FrenchMedMCQA (Apache 2.0), MedMCQA (Apache 2.0), preguntas de opción múltiple de MediQAl y FrenchMedMCQA traducidas al dariya por Gemma 4, y explicaciones redactadas por Gemma 4 que solo se conservaron cuando acertaban la respuesta. No se indica el número de tokens de entrenamiento, la composición exacta por idioma ni si se aplicó RLHF o DPO; el procedimiento descrito es un ajuste supervisado sobre pares pregunta-respuesta con filtrado por corrección.

## Capacidades

- Resolución de preguntas médicas de opción múltiple en francés, árabe (incluida dariya) e inglés.
- Razonamiento clínico básico orientado a exámenes y material pedagógico.
- Generación de explicaciones asociadas a la respuesta elegida, según el formato de los datos de entrenamiento.
- Soporte multilingüe limitado a los tres idiomas declarados (fr, ar, en).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras capacidades especiales.
- Al ser un adaptador sobre un modelo instruct, hereda las capacidades conversacionales generales del modelo base, aunque no están evaluadas en esta ficha.

## Casos de uso

- Preparación de exámenes de medicina en francés: el adaptador puede generar preguntas tipo QCM y explicaciones razonadas, aprovechando el ajuste sobre FrenchMedMCQA y MediQAl para alinearse con el estilo de las pruebas francófonas.
- Triaje educativo en dariya: permite plantear preguntas clínicas básicas en árabe marroquí, si bien el rendimiento medido en ese conjunto es inferior al del modelo base, por lo que conviene usarlo con revisión humana.
- Generación de material docente bilingüe: combinación de enunciados en francés y explicaciones en árabe para facultades con alumnado mixto.
- Evaluación comparativa de LLM médicos: sirve como línea base de especialización de bajo coste frente a modelos médicos de mayor tamaño.
- Asistencia a la redacción de resúmenes de casos clínicos simulados: el modelo puede estructurar viñetas clínicas y opciones de respuesta para bancos de preguntas.
- Investigación sobre especialización LoRA: caso de estudio reproducible para medir el efecto de datos sintéticos filtrados por corrección en dominios de nicho.
- Filtrado y clasificación de preguntas médicas: uso del adaptador para etiquetar o validar ítems de bancos de preguntas existentes, con supervisión.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre 100 preguntas de opción múltiple nunca vistas por conjunto, antes y después del ajuste:

| Conjunto | Antes (modelo base) | Después (adaptador) |
|---|---|---|
| MediQAl | 44,0 | 62,0 |
| FMPC (FrenchMedMCQA) | 28,0 | 33,0 |
| Darija | 26,0 | 21,0 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador ocupa aproximadamente 0,1 GB, pero la inferencia requiere cargar el modelo base Mistral-7B-Instruct-v0.2 completo.
- VRAM estimada para el modelo base en FP16: en torno a 14-16 GB; en cuantización de 8 bits, unos 8 GB; en 4 bits, unos 4-5 GB (estimaciones estándar para un modelo de 7B, no verificadas en la información proporcionada).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4080 o superiores para cuantización de 8 bits.
- Cabe en GPU de consumo (RTX 3060 12 GB, RTX 4060 Ti 16 GB) si se aplica cuantización de 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama con el modelo base y carga del adaptador LoRA; también es posible fusionar el adaptador con el modelo base mediante PEFT y exportar a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sémio-2c (este) | 7B (base) + LoRA | no disponible (base: 32 768) | Médico fr/ar/en | apache-2.0 | Hugging Face |
| Mistral-7B-Instruct-v0.2 | 7B | 32 768 | Generalista instruct | apache-2.0 | Hugging Face |
| Meditron-7B | 7B | 4 096 (aprox.) | Médico en inglés | Llama 2 (restrictiva) | Hugging Face |
| BioMistral-7B | 7B | 32 768 | Médico multilingüe | apache-2.0 | Hugging Face |

La comparación de rendimiento con estas alternativas no está disponible en la información proporcionada; solo se dispone de los resultados antes/después del propio adaptador.

## Limitaciones y advertencias

- El rendimiento en dariya empeora tras el ajuste (de 26,0 a 21,0 sobre 100), lo que sugiere sobreajuste o ruido en los datos traducidos por Gemma.
- La mejora en FrenchMedMCQA es modesta (de 28,0 a 33,0), lejos de un uso clínico fiable.
- Riesgo de alucinación en contenido médico: la model card lo declara herramienta pedagógica y advierte de que no sustituye el criterio médico.
- Datos de entrenamiento parcialmente sintéticos (traducciones y explicaciones generadas por Gemma 4), con posible propagación de errores y sesgos del generador.
- No se documentan evaluaciones de sesgo, seguridad ni robustez fuera de los tres conjuntos de QCM.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso comunitario ni validación externa.
- La licencia apache-2.0 del adaptador no exime de cumplir las condiciones del modelo base y de las fuentes de datos (MediQAl CC BY 4.0, FrenchMedMCQA y MedMCQA Apache 2.0, y los términos de uso de Gemma para el contenido generado).
- No se especifican la configuración de entrenamiento ni los hiperparámetros del LoRA, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Medwebsite/semio-2c-mistral7b-lora
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- MediQAl: no disponible en la información proporcionada
- FrenchMedMCQA: no disponible en la información proporcionada
- MedMCQA: no disponible en la información proporcionada
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
