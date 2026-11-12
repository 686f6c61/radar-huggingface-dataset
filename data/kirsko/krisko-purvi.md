# Kirsko/krisko-purvi

## Resumen

Krisko Purvi (Криско Първи) es un modelo de lenguaje conversacional en búlgaro desarrollado desde cero por Kristiyan Zaynelov (usuario Kirsko) y publicado en Hugging Face el 12 de noviembre de 2026. Se trata de un proyecto didáctico de arquitectura transformer decoder escrita a mano en PyTorch, sin recurrir a modelos preentrenados ni a arquitecturas de librerías de alto nivel, cuyo objetivo es demostrar el ciclo completo de construcción de un chatbot: tokenización, arquitectura, entrenamiento y despliegue.

El modelo es extremadamente pequeño: 621.029 parámetros (unos 2,5 MB), con 3 capas, 4 cabezas de atención y dimensión de modelo de 128. Usa un tokenizador a nivel de carácter con un vocabulario de 101 símbolos. No es un asistente de conocimiento general: reconoce un conjunto limitado de temas y responde con réplicas aprendidas durante el entrenamiento, por lo que su relevancia es educativa y no de producción.

Su interés actual reside en que sirve como referencia mínima y reproducible de un transformer funcional, útil para quienes quieren entender los fundamentos de la generación de texto sin la complejidad de un modelo grande. El autor advierte explícitamente que las versiones publicadas se entrenaron con una versión anterior del script de entrenamiento (3 capas, sin contexto), mientras que la versión actual del código entrena un variante mayor de 4 capas que aún no está terminada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder escrito a mano (3 capas, 4 cabezas de atencion, dimension 128) |
| Parametros totales | 621.029 (~2,5 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la version publicada no usa contexto entre turnos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bulgaro (bg) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model/model.safetensors) + config.json |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder implementado manualmente en `model.py`, con 3 capas, 4 cabezas de atención y dimensión de modelo de 128, lo que da lugar a los 621.029 parámetros publicados. El tokenizador es a nivel de carácter, con un vocabulario de 101 símbolos, lo que simplifica el pipeline pero limita la eficiencia y la generalización léxica. No se emplean modelos preentrenados ni componentes de librerías de alto nivel: todo el flujo (tokenización, atención, generación y guardado de pesos) está escrito en Python y PyTorch.

El entrenamiento se realiza con `train.py`, que contiene tanto los datos como el bucle de entrenamiento. Los pesos publicados provienen de una versión anterior del script (3 capas, sin contexto conversacional). La versión actual del script entrena un variante de 4 capas que incorpora el turno anterior de la conversación, pero según el autor no está terminado y tarda aproximadamente hora y media en un portátil. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional breve en búlgaro: saludos, despedidas, agradecimientos y preguntas cotidianas ("здрасти", "как си?", "благодаря", "чао").
- Presentación de sí mismo: nombre, creador, fecha de creación y herramientas con las que fue construido.
- Aritmética elemental con números del 0 al 10 (por ejemplo, "колко е 7 по 8").
- Repetición del nombre del usuario cuando este figura entre los nombres comunes contemplados en los datos ("казвам се Иван").
- Variabilidad de respuesta: puede contestar a la misma pregunta con palabras distintas.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.
- No mantiene memoria de los mensajes previos: cada mensaje se procesa de forma aislada.

## Casos de uso

- Material didáctico para cursos de introducción a transformers: el repositorio incluye arquitectura, tokenizador, entrenamiento e interfaz, lo que permite recorrer el ciclo completo en un portátil y con un modelo de 2,5 MB.
- Demostración interactiva en el navegador: el Space de Hugging Face permite probar el comportamiento de un chatbot de vocabulario cerrado sin instalar nada, útil para explicar las limitaciones de los modelos sin conocimiento general.
- Pruebas de concepto de tokenización por carácter: sirve para comparar el comportamiento de un vocabulario de 101 símbolos frente a tokenizadores BPE en tareas de generación muy restringidas.
- Base para experimentos de ampliación: el código de `train.py` entrena un variante de 4 capas con contexto de un turno, por lo que puede usarse como punto de partida para estudiar el efecto de añadir contexto conversacional.
- Ejercicios de evaluación de chatbots de dominio cerrado: útil para medir cómo se degrada un modelo cuando la entrada se aleja de las formulaciones vistas en entrenamiento.
- Docencia sobre alucinación y fallos en modelos pequeños: al responder con sinsentidos ante preguntas desconocidas, ejemplifica de forma controlada los modos de fallo típicos de un modelo insuficientemente entrenado.
- Referencia de despliegue mínimo: el par `app.py` (interfaz web en el puerto 7860) y `chat.py` (chat de terminal) ilustra un despliegue local completo con Python 3.9 o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos ocupan aproximadamente 2,5 MB y el modelo cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU consumer (por ejemplo, series GTX o RTX) es más que suficiente. El autor no especifica requisitos de GPU.
- Cabe en GPU consumer: sí, en cualquier modelo actual; también funciona solo con CPU.
- Opciones de despliegue: el repositorio incluye `app.py` (interfaz web con servidor local en http://127.0.0.1:7860) y `chat.py` (chat de terminal), ejecutables con Python 3.9 o superior mediante un entorno virtual y `requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo indica que el entrenamiento del variante de 4 capas tarda aproximadamente hora y media en un portátil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kirsko Purvi | 621.029 | no disponible (sin contexto entre turnos en la version publicada) | bulgaro | no disponible | Hugging Face + Space + GitHub |
| Modelos de chat búlgaros de gran tamano (por ejemplo, BgGPT) | no disponible en la informacion proporcionada | no disponible | bulgaro | no disponible | no disponible |
| Modelos tiny de referencia educativa (por ejemplo, nanoGPT) | no disponible en la informacion proporcionada | no disponible | ingles principalmente | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No comprende el lenguaje en sentido general: reconoce temas conocidos y formulaciones cercanas a las vistas en entrenamiento.
- No recuerda mensajes anteriores; cada mensaje se evalúa de forma aislada.
- Ante preguntas desconocidas, nombres no contemplados o números mayores de 10, puede responder de forma incorrecta o sin sentido.
- Riesgo alto de alucinación fuera del dominio cerrado de entrenamiento.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idioma limitado al búlgaro; no hay soporte multilingüe declarado.
- Proyecto educativo sin garantías de mantenimiento; los pesos publicados corresponden a una versión anterior del script de entrenamiento y el variante de 4 capas con contexto no está terminado.
- No apto para producción: sin tool calling, sin contexto largo, sin evaluación publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kirsko/krisko-purvi
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Kirsko/krisko-purvi
- Repositorio en GitHub: https://github.com/kristiqnzainleov/krisko-purvi
