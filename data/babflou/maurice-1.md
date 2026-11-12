# Babflou/maurice-1

## Resumen

Maurice 1 es un ajuste fino (fine-tuning) del modelo Qwen 3.5 0.8B de Alibaba Cloud, desarrollado por el usuario Babflou para funcionar como asistente de voz local en la aplicación Dodo para iPhone. El modelo está diseñado específicamente para ejecutarse íntegramente en el dispositivo (on-device) mediante llama.cpp a través de llama.rn, sin que ningún dato salga del teléfono. Con 772.845.888 parámetros totales y un peso cuantizado IQ4_XS de 517 MB, el modelo ocupa un espacio mínimo y está pensado para iPhone 11 en adelante.

El modelo resuelve un problema muy concreto: transformar frases dictadas por el usuario en acciones estructuradas en formato JSON (recordatorios con objeto y momento, y rechazos explícitos de peticiones que el asistente no puede realizar), además de resumir reuniones transcritas en títulos, puntos clave, decisiones y tareas pendientes. También conserva capacidades básicas de asistente generalista, como reformular notas o responder preguntas simples.

Es relevante porque demuestra un caso de uso de IA generativa totalmente local y en un dispositivo móvil de gama media, con un modelo derivado de una base de 0,8B parámetros y licencia Apache 2.0. El entrenamiento se realizó con LoRA de rango 16 fusionado en los pesos originales, usando exclusivamente datos anotados o escritos por humanos, lo que lo convierte en un ejemplo interesante de ajuste fino de bajo coste para tareas de extracción estructurada en francés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5 0.8B) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (GGUF); el modelo base admite otras cuantizaciones GGUF, pero no se detallan |
| Idiomas soportados | francés (fr); inglés y japonés previstos para una versión futura |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`maurice-1-IQ4_XS.gguf`, 517 MB); pesos safetensors del modelo base disponibles en el repo del autor original |

## Arquitectura y entrenamiento

Maurice 1 es un fine-tuning del modelo Qwen 3.5 0.8B de Alibaba Cloud (Qwen Team), publicado bajo licencia Apache 2.0. La adaptación se realizó mediante LoRA de rango 16, escala 8, aplicado a todas las capas, y posteriormente fusionado en los pesos originales. El autor indica que la fusión de mlx-lm produce un modelo roto para Qwen 3.5, por lo que la fusión se realizó en los archivos originales mediante `merge_lora.py` y después se convirtió con llama.cpp.

Los datos de entrenamiento fueron anotados o escritos íntegramente por humanos, sin generación por modelos de lenguaje. Se emplearon tres conjuntos: MASSIVE fr-FR de Amazon (CC BY 4.0), con 1.197 ejemplos (397 recordatorios y 800 rechazos); FREDSum de Linagora (CC BY-SA 4.0), con 501 ejemplos de debates franceses transcritos y resumidos; y OpenAssistant oasst2 (Apache 2.0), con 729 respuestas humanas en francés e inglés. El entrenamiento se ejecutó con mlx-lm en un Mac M5 Pro de 24 GB, con un solo pase, un ejemplo a la vez, tamaño de lote 8, tasa de aprendizaje 5e-5 y secuencias de hasta 1.024 tokens, durante aproximadamente 4 horas.

Como innovación técnica destacable, el modelo está optimizado para inferencia on-device mediante llama.cpp y llama.rn, con un tamaño cuantizado de 517 MB que permite su ejecución en iPhone 11 y posteriores. La versión 1.0 fue descartada porque respondía a todo con acciones de Dodo y la escala LoRA de 20 modificaba aproximadamente el 40% de los pesos; la versión 1.1 corrige esto añadiendo conversaciones humanas de OpenAssistant y reduciendo la escala LoRA a 8.

## Capacidades

- Generación de texto y razonamiento básico en francés, con respuestas a preguntas simples y reformulación de notas.
- Extracción estructurada de recordatorios: identifica el objeto y el momento de la petición y los devuelve en JSON según el esquema de la aplicación.
- Detección y rechazo de peticiones imposibles: identifica lo que el asistente no puede hacer (despertador, música, mensajes, domótica, búsqueda en internet) y devuelve el motivo del rechazo.
- Resumen de reuniones transcritas: genera un título, entre 3 y 6 puntos esenciales, las decisiones tomadas y las tareas pendientes.
- Soporte de tool calling / function calling: implícito en la generación de JSON estructurado para el pipeline de la aplicación (`src/pipeline/interpret.ts`).
- Capacidades conversacionales limitadas: entrenado solo con peticiones de una frase y primeras preguntas de conversación.
- Multilingüe limitado: solo francés; inglés y japonés están previstos para una versión futura.

## Casos de uso

- Asistente de voz local en iPhone: el modelo se integra en la aplicación Dodo mediante llama.rn y procesa las frases dictadas por el usuario para convertirlas en acciones JSON, sin enviar datos a la nube. Es adecuado por su tamaño reducido (517 MB cuantizado) y su latencia medida de 62 s para el conjunto de tareas en un Mac M5 Pro.
- Creación de recordatorios por voz: el modelo extrae el objeto y el momento de la petición con una precisión del 96,7% en recordatorios reconocidos y un 76,1% en la recuperación del momento, lo que lo hace fiable para esta tarea concreta.
- Gestión de rechazos en asistentes de voz: con un 98,5% de peticiones imposibles rechazadas y un 90,0% de rechazos con la razón correcta, el modelo es útil para evitar que el asistente intente acciones que no puede realizar y para informar al usuario con transparencia.
- Resumen de reuniones transcritas: el modelo genera resúmenes con formato correcto en el 100% de los casos y sin decisiones inventadas en el 100% de los casos, lo que lo hace adecuado para integrarse en el flujo de `src/voice/meeting.ts` y producir actas estructuradas.
- Reformulación de notas y respuestas a preguntas simples: conserva capacidades generalistas básicas, útil para tareas de asistencia cotidiana en francés, aunque con menor precisión factual que el modelo base.
- Prototipado de asistentes on-device: sirve como ejemplo reproducible de fine-tuning LoRA de un modelo de 0,8B para tareas de extracción estructurada, con scripts públicos (`build_data.py`, `fit_length.py`, `lora.yaml`, `supervise.sh`, `finish.sh`, `eval_maurice.py`) que permiten replicar el proceso.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan Maurice 1.1 con el modelo base Qwen 3.5 0.8B en ejemplos reservados antes del entrenamiento, con las consignas exactas de la aplicación y el esquema JSON impuesto. El script de medición es `eval_maurice.py`.

| Medida | Qwen 3.5 0.8B | Maurice 1.1 | Ejemplos |
|---|---:|---:|---:|
| Recordatorios reconocidos | 30,4% | 96,7% | 92 |
| Momento del recordatorio recuperado (palabras en común) | 5,2% | 76,1% | 92 |
| Peticiones imposibles rechazadas | 2,0% | 98,5% | 200 |
| Rechazo con la razón correcta | 0,0% | 90,0% | 200 |
| Resúmenes con formato correcto (3 a 6 puntos) | 95,0% | 100% | 60 |
| Resúmenes sin decisiones inventadas | 1,7% | 100% | 60 |
| Conocimientos generales (MMMLU francés, 600 preguntas) | 33,8% | 24,5% | 600 |
| Duración del test de tareas, en Mac | 410 s | 62 s | — |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el archivo GGUF IQ4_XS ocupa 517 MB, por lo que la huella de memoria es muy reducida y apta para dispositivos móviles.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecutarse en iPhone 11 y posteriores mediante llama.cpp y llama.rn.
- Compatibilidad con GPU de consumo: sí, por su tamaño reducido (0,8B parámetros cuantizados a IQ4_XS) cabe en cualquier GPU de consumo e incluso en dispositivos móviles.
- Opciones de despliegue: llama.cpp (motor principal, a través de llama.rn en la aplicación Dodo); también es compatible con endpoints (`endpoints_compatible` según los tags de Hugging Face).
- Latencia y throughput: el autor reporta una duración de 62 s para el conjunto de tareas en un Mac M5 Pro, frente a 410 s del modelo base. No se han medido velocidades en iPhone ni en modelos antiguos de iPhone.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---:|---|---|---|
| Maurice 1 | 772.845.888 | no disponible | Apache 2.0 | Hugging Face (Babflou/maurice-1) | Fine-tuning de Qwen 3.5 0.8B para asistente de voz local en francés |
| Qwen 3.5 0.8B | 0,8B | no disponible | Apache 2.0 | Hugging Face (Qwen/Qwen3.5-0.8B) | Modelo base; mejor conocimiento general (MMMLU francés 33,8% frente a 24,5%) pero mucho peor en tareas específicas de la aplicación |
| Alternativas de 0,8B para on-device | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre otros modelos comparables en la documentación proporcionada |

## Limitaciones y advertencias

- Los conocimientos generales disminuyen: en MMMLU francés, Maurice baja al 24,5% (nivel de azar, 25%) frente al 33,8% del modelo base. No debe usarse como fuente de hechos.
- Las acciones propias de Dodo no están aprendidas: para crear una isla, un archipiélago, una nota o lanzar un pomodoro no existe un conjunto de entrenamiento abierto; el modelo sigue las instrucciones y ejemplos de `PLAN_INSTRUCTIONS` sin entrenamiento dedicado.
- Los resúmenes provienen de debates: el modelo aprendió a resumir sobre debates políticos (FREDSum), no sobre reuniones de trabajo, lo que puede limitar su generalización a otros dominios.
- Procesa una sola frase a la vez: solo fue entrenado con peticiones de una frase y primeras preguntas de conversación, por lo que no maneja conversaciones multi-turno complejas.
- Las velocidades se midieron en un Mac M5 Pro y no se han medido en iPhone ni en modelos antiguos de iPhone.
- Riesgo de alucinación: aunque los resúmenes no inventan decisiones en los ejemplos evaluados, el modelo puede generar información incorrecta en preguntas generales.
- Idioma limitado: solo francés; el inglés y el japonés están previstos para una versión futura.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el archivo `LICENSE` de Qwen incluido con el modelo y cumplir las condiciones de la licencia del modelo base.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse con debates políticos (FREDSum) y respuestas de OpenAssistant, puede heredar sesgos de esas fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Babflou/maurice-1
- Modelo base Qwen 3.5 0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset MASSIVE (AmazonScience): https://huggingface.co/datasets/AmazonScience/massive
- Dataset FREDSum (Linagora): https://huggingface.co/datasets/linagora/FREDSum
- Dataset OpenAssistant oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama.rn: https://github.com/mybigday/llama.rn
- mlx-lm: https://github.com/ml-explore/mlx-lm
