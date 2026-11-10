# Dataphyte/nubia_ai

## Resumen

Nubia AI es un adaptador LoRA (entrenado con QLoRA) desarrollado por Dataphyte sobre el modelo base Qwen/Qwen3.8-27B. Su objetivo es ofrecer asistencia conversacional en yoruba e inglés, con especialización en dos dominios concretos: agricultura y, de forma incipiente, salud. El adaptador se distribuye como pesos PEFT en formato safetensors y se apoya en la licencia Apache 2.0 del modelo base.

El modelo resuelve un problema de cobertura lingüística: la mayoría de asistentes de gran tamaño tienen un rendimiento limitado en lenguas africanas de bajos recursos como el yoruba. Dataphyte aborda esta carencia mediante un ajuste fino supervisado sobre pares de pregunta-respuesta agrícolas en yoruba, manteniendo el conocimiento general del modelo base Qwen3.8-27B.

Es relevante ahora porque demuestra una vía de bajo coste (adaptadores LoRA sobre un modelo abierto de 27B) para llevar asistencia técnica agrícola a comunidades yorubaparlantes. No obstante, el propio autor advierte de que las respuestas no han sido revisadas por expertos agrícolas y de que el soporte de salud y otras lenguas africanas aún está en desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA (PEFT) sobre transformer Qwen3.8-27B |
| Parametros totales | No disponible para el adaptador; modelo base de 27B (según denominación) |
| Parametros activos | No disponible (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se entrenó con QLoRA; el modelo base admite las cuantizaciones habituales) |
| Idiomas soportados | Yoruba (yo), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango entrenado con QLoRA sobre el transformer Qwen3.8-27B. No se especifica en la información disponible el rango del adaptador, los módulos objetivo ni los hiperparámetros de entrenamiento. El repositorio ocupa 1,0 GB, coherente con un adaptador de tamaño moderado más los artefactos de PEFT.

El entrenamiento se realizó sobre pares de pregunta-respuesta de agricultura en yoruba, además de un pequeño conjunto de respuestas de ejemplo en inglés y yoruba que enseñan al modelo a identificarse como Nubia AI. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La evaluación reportada se hizo sobre 500 preguntas agrícolas en yoruba no vistas durante el entrenamiento.

## Capacidades

- Generación de texto conversacional en yoruba e inglés, respondiendo en el mismo idioma que el usuario.
- Asistencia agrícola práctica: siembra, cuidado de cultivos y salud del ganado.
- Identificación de su propia identidad como Nubia AI mediante un system prompt específico.
- Respuestas en texto plano, breves y prácticas (el prompt de sistema pide evitar Markdown).
- Avisos de seguridad integrados: recomienda consultar a un extensionista agrícola para dosis de pesticidas, herbicidas o fertilizantes, y a un profesional sanitario para problemas de salud.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Soporte de salud y otras lenguas africanas: en desarrollo, no operativo según el autor.

## Casos de uso

- Consultas agrícolas en yoruba: un agricultor plantea dudas sobre siembra o cuidado de cultivos y el modelo responde en yoruba con recomendaciones prácticas, gracias al ajuste específico sobre pares pregunta-respuesta agrícolas.
- Asistencia bilingüe para técnicos de extensión: el modelo alterna entre yoruba e inglés según el idioma del interlocutor, útil para agentes que trabajan con comunidades y supervisores que documentan en inglés.
- Primer nivel de orientación sobre salud del ganado: el modelo ofrece pautas generales sobre cría y cuidado animal y deriva a profesionales cuando la consulta reviste gravedad.
- Chatbot de divulgación agrícola: integrado en portales o aplicaciones de organizaciones agrarias para responder preguntas frecuentes en yoruba sin depender de personal humano.
- Formación y alfabetización digital: uso como asistente de práctica para estudiantes o extensionistas que quieran ensayar consultas y respuestas en yoruba.
- Triaje informativo en salud: el modelo puede orientar al usuario a acudir a un profesional sanitario, aunque su soporte en este dominio aún está en desarrollo y no debe usarse como consejo médico.
- Prototipado de asistentes para lenguas africanas: sirve como base para equipos que quieran evaluar la viabilidad de adaptadores LoRA sobre Qwen en lenguas de bajos recursos antes de invertir en datasets mayores.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a la versión anterior del adaptador (antes de añadir el nombre), evaluada sobre 500 preguntas agrícolas en yoruba no vistas. Miden similitud con una respuesta de referencia, no corrección factual.

| Metrica | Antes del entrenamiento en yoruba | Despues |
|---|---|---|
| chrF++ (0-100) | 14,58 | 21,85 |
| BLEU | 1,69 | 5,58 |

El autor indica que la respuesta entrenada se acercó más a la referencia en 446 de 500 preguntas, y que estas pruebas deben repetirse sobre la versión actual. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador por sí solo ocupa 1,0 GB, pero requiere cargar el modelo base Qwen3.8-27B para inferencia.
- VRAM estimada para el modelo base en precisión completa (FP16/BF16): aproximadamente 54 GB solo para pesos, más memoria para activaciones y caché KV.
- Cuantización a 8 bits: en torno a 27-30 GB de VRAM; a 4 bits: en torno a 14-16 GB, lo que permite su ejecución en GPUs de consumo de gama alta.
- GPU recomendadas: A100 80 GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) viable con cuantización a 8 o 4 bits; GPUs de 16 GB solo con cuantización agresiva y contextos cortos.
- Opciones de despliegue: vLLM o TGI para servir el modelo base con el adaptador LoRA cargado; llama.cpp u Ollama si se convierte el modelo fusionado a GGUF; transformers con PEFT para prototipado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Nubia AI (Dataphyte) | Adaptador sobre 27B | No disponible | Yoruba, inglés | Apache 2.0 | Especializado en agricultura en yoruba |
| Qwen3.8-27B (base) | 27B | No disponible | Multilingüe (sin detalle) | Apache 2.0 | Modelo generalista sin ajuste agrícola ni énfasis en yoruba |
| Otros asistentes para lenguas africanas | No disponible | No disponible | Variable | Variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas específicas de la misma categoría (asistentes agrícolas en lenguas africanas) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Las respuestas no han sido revisadas por expertos agrícolas; el propio autor lo advierte de forma explícita.
- Riesgo de alucinación en dosis de pesticidas, herbicidas o fertilizantes; el modelo debe derivar al usuario a un extensionista agrícola en esos casos.
- El soporte de salud está en desarrollo y el modelo no es un asesor médico ni legal.
- El entrenamiento se ha realizado únicamente con datos agrícolas en yoruba; el rendimiento en otros dominios o lenguas africanas no está validado.
- Las respuestas tienden a ser más cortas que las de referencia, lo que puede omitir matices relevantes.
- Los benchmarks publicados miden similitud textual (chrF++, BLEU), no corrección de las recomendaciones, y corresponden a una versión anterior del adaptador.
- El modelo requiere el system prompt específico para identificarse como Nubia AI y mantener el comportamiento esperado.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribución al equipo de Qwen por el modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dataphyte/nubia_ai
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
