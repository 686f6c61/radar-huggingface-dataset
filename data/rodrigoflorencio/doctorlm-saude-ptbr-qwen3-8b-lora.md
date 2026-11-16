# RodrigoFlorencio/DoctorLM-Saude-PTBR-Qwen3-8B-LoRA

## Resumen

DoctorLM-Saude-PTBR-Qwen3-8B-LoRA es un adaptador LoRA (PEFT) publicado por Rodrigo Florencio que se aplica sobre el modelo base Qwen/Qwen3-8B-Base. Su función es la de un "espejo de ULM": dado el texto de una pregunta formulada por un paciente brasileño, genera una respuesta con el estilo de los profesionales sanitarios presentes en el corpus de entrenamiento (tono acogedor, avisos legales y derivación adecuada). Forma parte de un proyecto más amplio de simulación de diálogo sanitario en portugués de Brasil, junto al modelo complementario UserLM-for-health-PTBR, que genera las preguntas.

El adaptador se entrenó mediante SFT con 103.825 pares pregunta-respuesta extraídos del dataset duvidas-saude-ptbr, tras aplicar filtros de spam (16.104 respuestas eliminadas por promoción, URL o teleconsulta) y de respuestas demasiado cortas (~4.900). El entrenamiento LoRA usó r=32 y α=32 sobre los módulos q/k/v/o/gate/up/down, con una única época (1.454 pasos, batch efectivo 64, secuencia de 768) sobre una GPU a10g-large durante aproximadamente 12 horas.

Es relevante ahora como ejemplo práctico y reproducible de ajuste fino eficiente de un modelo de 8B para un dominio sanitario en un idioma concreto, con evaluación humana publicada y limitaciones declaradas explícitamente por el autor. No obstante, se trata de un adaptador con cero descargas y cero "likes" en el momento de redactar esta ficha, y el propio autor advierte que simula la respuesta de un médico en un portal público y no constituye orientación médica real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre el modelo base |
| Parametros totales | No disponible (el adaptador LoRA se distribuye como pesos PEFT; el modelo base Qwen3-8B-Base tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-8B-Base) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el modelo base admite cuantizacion estandar de transformers/PEFT, no documentada en la model card) |
| Idiomas soportados | Portugues (pt), segun la model card y los tags |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar Qwen/Qwen3-8B-Base en bf16 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-8B-Base, un transformer decoder-only de 8.000 millones de parámetros, cargado en bf16 con atención sdpa. El ajuste se realizó con LoRA de rango 32 y alpha 32 sobre los módulos de atención q/k/v/o y sobre los módulos MLP gate/up/down, usando TRL 1.17.1 con `completion_only_loss` (la pérdida se calcula solo sobre la respuesta, no sobre la pregunta). El entrenamiento consistió en una época (1.454 pasos), batch efectivo de 64, longitud de secuencia 768, learning rate 2e-4 con scheduler cosine y 40 pasos de warmup, sobre una única GPU a10g-large durante unas 12 horas.

Los datos proceden del dataset duvidas-saude-ptbr, con 103.825 pares pregunta-respuesta tras eliminar respuestas con promoción, URL o teleconsulta (16.104) y respuestas demasiado cortas (~4.900). No se documenta en la model card el uso de RLHF ni DPO; el método es SFT puro sobre respuestas reales de profesionales. El autor menciona como lección del proyecto la necesidad de anteponer el prefijo de "think" del template de Qwen3 al prompt del asistente, y anuncia una v2 con filtro de entrenamiento estricto.

## Capacidades

- Generación de respuestas en portugués de Brasil a preguntas de pacientes sobre salud, con tono acogedor, avisos legales y derivación al especialista adecuado.
- Simulación de diálogo sanitario en combinación con UserLM-for-health-PTBR (que genera la pregunta del paciente y DoctorLM responde).
- Estilo de respuesta imitando a profesionales sanitarios reales del corpus (portal público de dudas de salud).
- Ajuste sobre un modelo base multilingüe, aunque el adaptador está entrenado y evaluado únicamente en portugués.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles en la información proporcionada; el autor menciona el uso del prefijo "think" del template de Qwen3 en el prompt.

## Casos de uso

- Simulación de diálogo paciente-médico para investigación: combinando UserLM-for-health-PTBR (genera la pregunta) con este adaptador (genera la respuesta), se pueden producir diálogos sintéticos en portugués para estudiar estilos de comunicación sanitaria o generar datos de evaluación.
- Generación de respuestas de ejemplo para portales de dudas de salud: el adaptador reproduce el registro y la estructura (aviso, orientación, derivación) de respuestas reales de profesionales, útil para prototipar interfaces de portales públicos de salud en Brasil.
- Evaluación de calidad de respuestas sanitarias: el modelo sirve como referencia estilística para comparar con otras respuestas generadas o con respuestas humanas, dentro de un pipeline de revisión.
- Investigación en ajuste fino eficiente: el adaptador y su receta (LoRA r=32, 1 época, 12 h en una a10g-large) son un caso reproducible de SFT de dominio sobre un modelo de 8B con TRL y PEFT.
- Generación de datos de entrenamiento para tareas de clasificación o extracción en el dominio sanitario en portugués: las respuestas generadas pueden servir como texto de partida para anotación y filtrado posterior.
- Docencia y demostraciones de IA aplicada a salud: el autor es profesor en un MBA de IA aplicada a negocios, y el modelo se presenta como demo educativa de simulación de respuestas médicas, con las advertencias correspondientes.
- Prototipado de asistentes conversacionales en portugués con contexto de salud: el adaptador puede integrarse en un chatbot de demostración, siempre con revisión humana y sin uso clínico.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| eval_loss (epoca 1) | 1.796 (partiendo de 2.41 en el smoke test) |
| Acurácia de token | 60% |
| Diálogo simulado (revisión humana) | 8/11 aprobados (73%) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de evaluación son la pérdida de validación, la precisión de token y una revisión humana de 11 diálogos simulados, con 3 rechazos atribuidos a respuestas genéricas o evasivas (~27% del total), eco del inicio de la pregunta y sensibilidad al balance del entrenamiento.

## Requisitos de hardware

- El adaptador LoRA por sí solo ocupa 6,3 GB en el repositorio, pero la inferencia requiere cargar el modelo base Qwen3-8B-Base en bf16 (aproximadamente 16 GB de pesos) más el adaptador.
- VRAM estimada para inferencia en bf16: en torno a 18-20 GB contando pesos, activaciones y caché KV para secuencias moderadas; no se dispone de cifras oficiales en la información proporcionada.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA A10G (24 GB). Para inferencia, una RTX 4090 (24 GB) o A100/H100 son adecuadas; una GPU consumer de 16 GB requeriría cuantización del modelo base, no documentada para este adaptador.
- Cabe en GPU consumer de 24 GB (RTX 3090, RTX 4090) en bf16; en GPUs de 16 GB o menos sería necesario cuantizar el modelo base, opción no validada por el autor.
- Opciones de despliegue: transformers + PEFT (receta oficial de la model card), y potencialmente vLLM, TGI o llama.cpp con el modelo base cuantizado más el adaptador, aunque no se documenta compatibilidad ni receta para estas herramientas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DoctorLM-Saude-PTBR-Qwen3-8B-LoRA | Adaptador sobre base de 8B | No disponible | Apache 2.0 | safetensors (PEFT) | SFT en portugués sanitario; evaluación humana 8/11 |
| Qwen/Qwen3-8B-Base | 8B | No disponible en la informacion proporcionada | Apache 2.0 | safetensors | Modelo base sin ajuste de dominio; no especializado en salud ni en portugués sanitario |
| UserLM-for-health-PTBR-Qwen3-8B-LoRA (mismo autor) | Adaptador sobre base de 8B | No disponible | Apache 2.0 | safetensors (PEFT) | Modelo complementario que genera la pregunta del paciente en la simulación de diálogo |
| Alternativas de dominio sanitario en portugués | No disponible | No disponible | No disponible | No disponible | No se dispone de información sobre modelos comparables en la búsqueda realizada |

## Limitaciones y advertencias

- No es orientación médica real ni herramienta clínica: el propio autor lo describe como simulación de la respuesta de un médico en un portal público.
- Aproximadamente el 27% de las respuestas evaluadas resultaron genéricas o evasivas, heredadas de respuestas cortas reales del corpus ("procure um ginecologista").
- Puede repetir el inicio de la pregunta del paciente (eco), un artefacto detectado en la evaluación.
- Sensible al balance del entrenamiento; el autor anuncia una v2 con filtro estricto, lo que indica que la versión actual puede contener respuestas de baja calidad en el corpus.
- Entrenado y evaluado únicamente en portugués de Brasil; no se documenta rendimiento en otros idiomas ni en variantes del portugués europeo.
- Riesgo de alucinación en contenido sanitario: no se han publicado evaluaciones de veracidad factual de las respuestas, solo de estilo y adecuación percibida.
- Sesgos: no se documentan análisis de sesgos demográficos, de género ni geográficos en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el uso en contextos sanitarios reales exige revisión profesional y cumplimiento normativo (no cubierto por la licencia).
- Modelo con cero descargas y cero "likes" en el momento de redactar la ficha; sin validación por parte de la comunidad.
- Requiere cargar el modelo base Qwen3-8B-Base además del adaptador, lo que incrementa los requisitos de memoria frente a un modelo ya fusionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RodrigoFlorencio/DoctorLM-Saude-PTBR-Qwen3-8B-LoRA
- Modelo complementario (UserLM): https://huggingface.co/RodrigoFlorencio/UserLM-for-health-PTBR-Qwen3-8B-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/RodrigoFlorencio/duvidas-saude-ptbr
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- LinkedIn del autor: https://www.linkedin.com/in/rodrigoflorencio/
- Web del autor (GenSearch Me): https://www.gensearch.me/
