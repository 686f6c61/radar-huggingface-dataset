# Sage-Med/Sage-Med-Preview

## Resumen

Sage-Med-Preview es un modelo multimodal especializado en dominio médico desarrollado por el Sage-Med Team del Shanghai Artificial Intelligence Laboratory. Se construye sobre el modelo base Intern-S2-Preview de InternLM mediante ajuste fino y un pipeline de entrenamiento específico para tareas clínicas. Su propuesta central es concentrar conocimiento médico, comprensión de imagen, generación de informes y grounding visual en un único modelo con arquitectura de mezcla de expertos (MoE) de 35.253 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token.

El modelo aborda el problema de la evaluación y el despliegue de IA médica multimodal con un rendimiento competitivo frente a modelos propietarios de gran escala. Según la model card, promedia 58,26 puntos en 31 benchmarks médicos multimodales públicos, por encima de Hulu-Med-235B-A22B (50,99), Intern-S2-Preview (52,24), GPT-5.4 (52,78) y Claude-Opus-4.6 (49,18). Además, reporta resultados superiores a GPT-6.2-Sol en comprensión multimodal integral, generación de informes MIMIC-CXR y MedFrameQA.

Es relevante ahora porque demuestra que un modelo MoE de 3B activos puede igualar o superar a modelos mucho mayores en tareas médicas especializadas, y porque incluye una evaluación amplia con 238 tareas clínicas, 74 benchmarks, más de 40 modalidades y benchmarks privados de 14 hospitales e instituciones. La ficha se basa exclusivamente en la información disponible en Hugging Face y la model card; los datos no publicados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre Intern-S2-Preview; transformer multimodal image-text-to-text |
| Parametros totales | 35.253.613.888 (35B) |
| Parametros activos | Aproximadamente 3B (35B-A3B) |
| Longitud de contexto | 262.144 tokens (configuracion de servidor vLLM con `--max-model-len 262144`) |
| Tipos de cuantizacion | BF16 en la configuracion de referencia; no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint de 131 GiB en BF16; repo de 141,0 GB) |

## Arquitectura y entrenamiento

Sage-Med-Preview es un modelo multimodal de arquitectura transformer con mezcla de expertos, heredado de Intern-S2-Preview de InternLM. El checkpoint se sirve en BF16 con 35B parámetros totales y unos 3B activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. El pipeline es image-text-to-text, con soporte de imágenes y texto en conversaciones multi-turno.

El entrenamiento se describe a escala de cientos de millones de registros: piscinas curadas de aproximadamente 164 millones de registros y 226.000 millones de tokens. El proceso combina preentrenamiento continuo, mid-training orientado a tareas, ajuste fino supervisado (SFT) en tres etapas y aprendizaje por refuerzo (RL) adaptativo a la dificultad con recompensas específicas por tarea y *reference replay*. La model card no detalla la composición exacta del dataset ni los hiperparámetros de RL; esos datos no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento clínico en contextos conversacionales multi-turno.
- Comprensión de imágenes médicas (image-text-to-text) en más de 40 modalidades según la evaluación reportada.
- Respuesta a preguntas visuales médicas (medical VQA), con resultados en OmniMedVQA y MedFrameQA.
- Generación de informes radiológicos, con resultados reportados en MIMIC-CXR (ROUGE-L).
- Grounding visual: localización y descripción de hallazgos visibles en imágenes.
- Modo de pensamiento (*thinking mode*) configurable mediante `enable_thinking` en la plantilla de chat; desactivado por defecto en los ejemplos de inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Apoyo al diagnóstico por imagen: el modelo recibe una radiografía o imagen médica y genera una descripción de hallazgos visibles, adecuado por su entrenamiento específico en VQA médica y grounding visual.
- Generación de informes radiológicos: a partir de un estudio de imagen, produce un borrador de informe estructurado; la model card reporta 33,37 ROUGE-L en MIMIC-CXR, lo que lo sitúa como herramienta de asistencia a la redacción.
- Triaje y priorización de estudios: con contexto de hasta 262.144 tokens, puede procesar historiales extensos junto con imágenes para resumir y priorizar casos.
- Segunda lectura en radiología: comparación de hallazgos entre estudios o modalidades para detectar discrepancias, apoyándose en su capacidad multimodal y de grounding.
- Formación médica y simulación de casos: conversaciones multi-turno con imágenes de apoyo para practicar interpretación de estudios y razonamiento clínico.
- Investigación clínica y anotación asistida: generación de descripciones y etiquetas preliminares sobre cohorts de imágenes para su revisión posterior por especialistas.
- Despliegue en entornos con recursos limitados: al tener unos 3B parámetros activos, puede servirse con dos GPU en BF16 mediante vLLM, lo que facilita su integración en infraestructura hospitalaria moderada.

## Benchmarks y rendimiento

Datos reportados en la model card (escala 0-100; negrita indica el mejor resultado de la fila):

| Benchmark | Metrica | Sage-Med 35B-A3B | GPT-6.2 Sol | GPT-5.4 | Claude-Opus 4.6 | Gemini-2.5 Flash | Hulu-Med 235B-A22B |
|---|---|---:|---:|---:|---:|---:|---:|
| OmniMedVQA | Accuracy | **95,54** | 82,56 | 75,90 | 78,02 | 71,33 | 86,46 |
| GMAI-MMBench · val | Accuracy | 70,07 | **74,48** | 59,65 | 55,60 | 59,05 | 62,31 |
| Media de 31 benchmarks medicos multimodales | Media | **58,26** | no disponible | 52,78 | 49,18 | no disponible | 50,99 |
| Comprension multimodal integral (frente a GPT-6.2-Sol) | Puntuacion | **80,05** | 76,81 | no disponible | no disponible | no disponible | no disponible |
| MIMIC-CXR report generation | ROUGE-L | **33,37** | 30,31 | no disponible | no disponible | no disponible | no disponible |
| MedFrameQA | Accuracy | **65,52** | 62,78 | no disponible | no disponible | no disponible | no disponible |
| 11 puntuaciones de 9 tareas privadas de comprension | Media | **57,72** | 51,24 | no disponible | no disponible | no disponible | no disponible |

La tabla pública de la model card está truncada en la información disponible; no se han podido verificar el resto de filas ni los resultados de Intern-S2-Preview en cada benchmark individual.

## Requisitos de hardware

- VRAM estimada: el checkpoint en BF16 ocupa 131 GiB; en la configuración de referencia se sirve con `--tensor-parallel-size 2` y `--gpu-memory-utilization 0.85`, lo que implica al menos dos GPU de 80 GB (por ejemplo, A100 80GB o H100 80GB) para BF16.
- GPU recomendadas: la evaluación se realizó con vLLM-Ascend sobre Ascend 910C; para CUDA se indica vLLM 0.23.0 con dos GPU. No se detallan modelos concretos de GPU NVIDIA más allá del requisito de memoria.
- GPU de consumo: no cabe en GPU de consumo en BF16; no se dispone de información sobre cuantizaciones GGUF/INT4 que permitan reducir el requisito.
- Opciones de despliegue: vLLM 0.23.0 (con `--trust-remote-code`), servidor compatible con la API OpenAI `/v1/chat/completions`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Media 31 benchmarks medicos | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| Sage-Med-Preview | 35B | ~3B | 262.144 | 58,26 | no disponible | Hugging Face (repo publico) |
| Intern-S2-Preview | no disponible | no disponible | no disponible | 52,24 | no disponible | Hugging Face (base) |
| Hulu-Med-235B-A22B | 235B | 22B | no disponible | 50,99 | no disponible | no disponible en la informacion |
| GPT-5.4 | no disponible (propietario) | no disponible | no disponible | 52,78 | propietaria | API |
| Claude-Opus-4.6 | no disponible (propietario) | no disponible | no disponible | 49,18 | propietaria | API |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución; es un bloqueo para producción hasta verificarlo.
- Idiomas soportados no disponibles: no se puede garantizar calidad fuera del idioma o idiomas de entrenamiento.
- Riesgo de alucinación inherente a modelos generativos; en dominio médico, cualquier salida debe ser revisada por profesionales cualificados.
- Sesgos clínicos y demográficos: la model card no documenta análisis de sesgo; los datasets médicos pueden sobrerrepresentar ciertas poblaciones, modalidades o equipos.
- Resultados de benchmarks reportados por el propio autor; la tabla pública está truncada y no se han verificado de forma independiente.
- Requisito de hardware elevado en BF16 (dos GPU de 80 GB); sin cuantizaciones documentadas, el despliegue en entornos pequeños es limitado.
- Configuración de inferencia sensible: la model card recomienda `temperature: 0.01` y `top_p: 0.0001` en la configuración del informe técnico, valores que pueden degradar la diversidad de respuestas si se usan fuera de evaluación.
- No es un dispositivo médico: no se indica certificación regulatoria ni validación clínica prospectiva.

## Enlaces

- Hugging Face: https://huggingface.co/Sage-Med/Sage-Med-Preview
- Modelo base: https://huggingface.co/internlm/Intern-S2-Preview
- Paper (arXiv): https://arxiv.org/abs/2611.34575
- Web oficial: https://sage-med-preview.github.io/
- Leaderboard: https://sage-med-preview.github.io/leaderboard.html
- GitHub: https://github.com/Sage-Med/Sage-Med-Preview
- Guía de instalación de vLLM: https://docs.vllm.ai/en/v0.23.0/getting_started/installation/gpu/
