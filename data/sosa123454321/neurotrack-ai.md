# sosa123454321/neurotrack-ai

## Resumen

NeuroTrack AI es un sistema integral de soporte para la salud mental, orientado a familias y cuidadores de personas con autismo y esquizofrenia. A diferencia de un modelo de lenguaje convencional, este repositorio contiene una aplicación completa compuesta por tres espacios Gradio (screening, seguimiento y entrenamiento), un bot de Telegram ya operativo y una base de datos SQLite compartida con trece tablas. El proyecto integra marcos psicológicos como terapia cognitivo-conductual (CBT), análisis aplicado de conducta (ABA) y fenotipado digital para ofrecer herramientas de evaluación, monitorización diaria y ejercicios terapéuticos.

El autor, sosa123454321, publica el proyecto bajo licencia MIT con fecha de creación en agosto de 2026. No se trata de un modelo con pesos entrenados, sino de un sistema de software que utiliza un chatbot basado en RAG (generación aumentada por recuperación) con una base de conocimiento de treinta entradas. Su relevancia radica en abordar una necesidad social concreta: el acompañamiento a largo plazo de trastornos del neurodesarrollo y de salud mental, combinando canales de comunicación accesibles como Telegram con paneles de seguimiento visual.

La arquitectura interna no corresponde a un transformer o modelo de lenguaje, sino a un conjunto de aplicaciones Python que se comunican a través de una base de datos SQLite. El pipeline declarado en Hugging Face es text-generation, pero en la práctica la generación de texto se limita a respuestas del chatbot RAG. No se han publicado parámetros, contexto, cuantización ni resultados de benchmarks, ya que no existe un modelo neuronal subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (sistema de software, no modelo neuronal) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (etiqueta `en` en la model card) |
| Licencia | MIT |
| Formato de pesos | No disponible (codigo fuente Python, Gradio, SQLite, bot de Telegram) |

## Arquitectura y entrenamiento

El proyecto no presenta una arquitectura de red neuronal. Se compone de cinco modulos principales: una base de datos SQLite compartida (trece tablas), tres espacios Gradio independientes (screening, tracking y training) y un bot de Telegram. El chatbot integrado usa un enfoque RAG con una base de conocimiento de treinta entradas, aunque no se especifica que modelo de lenguaje base se emplea para la generacion ni como se construyo el indice vectorial. El directorio `fine_tuning` contiene datos de entrenamiento y un constructor de base de conocimiento RAG, pero no se detalla el proceso de fine-tuning ni el volumen de datos.

El dataset de entrenamiento se referencia como `sosa123454321/neurotrack-training-data` en Hugging Face, pero no se proporcionan detalles sobre su tamano, composicion o metodo de preparacion. Los marcos psicologicos citados (CBT, ABA, PRT, fenotipado digital, mindfulness, entrenamiento en cognicion social) sugieren que el contenido del sistema se diseno siguiendo estas metodologias, pero no hay informacion sobre como se integraron en el algoritmo de puntuacion o en los ejercicios.

## Capacidades

- Screening de autismo y esquizofrenia mediante cuestionarios de doce preguntas con puntuacion de riesgo basada en IA.
- Seguimiento diario de sintomas: estado de animo, ansiedad, sueno y medicacion, con graficos de tendencias.
- Entrenamiento terapeutico: reconocimiento de emociones, habilidades sociales, entrenamiento cognitivo y estrategias de afrontamiento.
- Chatbot conversacional con respuestas basadas en RAG desde una base de conocimiento de treinta entradas.
- Grupos familiares con codigos de invitacion y notificaciones automaticas entre miembros.
- Canal de Telegram para publicar actualizaciones del sistema.
- No soporta tool calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Seguimiento diario de pacientes con esquizofrenia: el modulo de tracking permite registrar sintomas y estado de animo, generando alertas automaticas a familiares o cuidadores ante cambios significativos, lo que facilita la deteccion temprana de recaidas.
- Evaluacion inicial de riesgo de autismo en ninos: el cuestionario de doce preguntas del espacio de screening ofrece una puntuacion orientativa que puede servir como punto de partida para una evaluacion profesional.
- Apoyo a cuidadores de personas con autismo: los ejercicios de entrenamiento en reconocimiento de emociones y habilidades sociales, basados en ABA y PRT, proporcionan actividades practicas para el hogar.
- Bot de Telegram para consultas rapidas: el bot ya operativo (@Ai_autism_schizo_bot) responde preguntas frecuentes sobre sintomas, medicacion y estrategias de afrontamiento, usando la base RAG.
- Gestion de grupos familiares: los codigos de invitacion permiten que varios miembros de una familia compartan informacion y reciban notificaciones coordinadas, mejorando la comunicacion en entornos de cuidado.
- Educacion de pacientes y familiares: el contenido de los espacios de training, basado en CBT y mindfulness, sirve como material psicoeducativo complementario a la terapia profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no existir un modelo neuronal, no aplican metricas como MMLU, HumanEval o GSM8K. El rendimiento del sistema depende de la infraestructura donde se ejecuten los espacios Gradio y el bot, no de capacidades de inferencia de un LLM.

## Requisitos de hardware

- No se requiere GPU para ejecutar el sistema, ya que no hay inferencia de modelos de lenguaje locales.
- Espacios Gradio: necesitan un servidor con Python 3.8 o superior, al menos 2 GB de RAM para manejar las aplicaciones web y la base SQLite.
- Bot de Telegram: funciona en cualquier maquina con Python y conexion a internet; puede ejecutarse en una Raspberry Pi o un VPS basico (1 GB de RAM es suficiente).
- Para el chatbot RAG, si se usa un modelo de embedding o generacion remoto (via API), se requiere conexion a internet y credenciales del proveedor; no se especifica cual se usa.
- Despliegue recomendado: servicios como Hugging Face Spaces, Railway o un VPS con Nginx para los espacios Gradio, y un proceso separado para el bot.

## Comparativa con modelos similares

No disponible. NeuroTrack AI no es un modelo de lenguaje comparable con alternativas como Llama, Mistral o Qwen. Existen otros proyectos llamados NeuroTrack en GitHub (cancer cerebral, migranas, salud mental estudiantil) pero son iniciativas independientes sin relacion tecnica con este repositorio. En el ambito de sistemas de salud mental, se podrian comparar con plataformas comerciales como Woebot o Wysa, pero no hay datos publicos de rendimiento ni arquitectura para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- No es una herramienta de diagnostico: la model card lo indica explicitamente. Los resultados del screening son orientativos y no sustituyen una evaluacion clinica profesional.
- Riesgo de sesgo en los cuestionarios: al ser un sistema de puntuacion automatica, los umbrales de riesgo pueden generar falsos positivos o negativos si no se validan con muestras clinicas reales.
- Base de conocimiento RAG limitada: solo treinta entradas, lo que restringe la cobertura de preguntas y puede llevar a respuestas incompletas o desactualizadas.
- Idioma: solo ingles, por lo que no es util para poblaciones hispanohablantes sin adaptacion.
- Sin garantia de privacidad: la base de datos SQLite almacena datos de salud sensibles; el repositorio no documenta cifrado, control de accesos ni cumplimiento de normativas como HIPAA o GDPR.
- Mantenimiento incierto: el proyecto tiene cero descargas y cero likes, y la fecha de creacion es futura (agosto de 2026), lo que sugiere un estado experimental sin comunidad de soporte.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sosa123454321/neurotrack-ai
- Dataset de entrenamiento: https://huggingface.co/datasets/sosa123454321/neurotrack-training-data
- Bot de Telegram: https://t.me/Ai_autism_schizo_bot
- Canal de Telegram: @Ai_autism_schizo (mencionado en la model card, sin URL directa)
- Proyectos homonimos no relacionados: https://github.com/unknownsafari/NeuroTrack, https://github.com/Priyanshuwadnere/neurotrack-ai, https://github.com/fidelechevarria/NeuroTrack, https://neuro-tracker-ai.vercel.app/
