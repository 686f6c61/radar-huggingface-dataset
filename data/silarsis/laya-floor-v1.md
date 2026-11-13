# silarsis/laya-floor-v1

## Resumen

laya-floor-v1 es un ajuste fino (fine-tune) del modelo Laya de Convai Innovations, desarrollado por el usuario silarsis. No es un modelo generativo de propósito general: es un clasificador especializado que resuelve una tarea muy concreta de enrutamiento conversacional en entornos de avatares. Dada una línea de habla de una persona dentro de una sala con varios avatares, el modelo responde en una sola pasada tres preguntas tipadas de elección: a quién se dirige (`addressed`), qué quiere que haga ese avatar (`wants`) y qué otro avatar está implicado (`other`). No genera texto libre; emite elecciones cerradas sobre un conjunto de opciones definido por el estado de la escena.

El modelo parte de la base `convaiinnovations/laya` y cuenta con 421.293.830 parámetros en formato safetensors, con un repositorio de 0,8 GB. Está pensado para integrarse en la aplicación aiembodied, que lo descarga automáticamente en el primer arranque y lo sirve mediante `laya-serve`. Su relevancia es acotada pero clara: sustituye una tarea de interpretación semántica (desambiguar a quién va dirigida una frase en una conversación multi-avatar) por una clasificación determinista y de baja latencia, evitando el coste y la variabilidad de un modelo generativo para esa decisión.

La licencia es Apache-2.0, heredada del modelo base, y el único idioma declarado es el inglés. El modelo se publicó el 13 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de `convaiinnovations/laya`; la model card no detalla la arquitectura interna) |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el prompt incluye hasta cuatro líneas recientes, cada una recortada a 200 caracteres) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base Laya; solo se sabe que laya-floor-v1 es un fine-tune de `convaiinnovations/laya` con 421 millones de parámetros y pesos en safetensors. La tarea que resuelve es de clasificación de texto con salida estructurada: tres preguntas de elección (`addressed`, `wants`, `other`), cada una con un conjunto de opciones construido dinámicamente a partir de los avatares presentes en la escena, más las opciones fijas `everyone`, `unclear`, `answer`, `converse`, `relay` y `none`.

El entrenamiento se realizó sobre 8.000 filas generadas de conversaciones de sala ficticias (generadas con `floor_data.py`), durante 4 épocas, partiendo del modelo base. Las frases que coincidían con los conjuntos de validación (hold-out) se eliminaron del conjunto de entrenamiento para evitar fuga de datos. El prompt de entrada es texto plano que describe la escena: nombres de los avatares con el anfitrión marcado, con quién habló la persona por última vez, hasta cuatro líneas recientes (cada una recortada a 200 caracteres) y la nueva línea a enrutar. El formato debe coincidir exactamente con el de entrenamiento; la implementación de referencia es `services/laya/training/floor_prompt.py` en el repositorio de aiembodied.

## Capacidades

- Clasificación de enrutamiento conversacional: para una línea de habla, determina el avatar destinatario (`addressed`), la intención sobre ese avatar (`wants`: `answer`, `converse` o `relay`) y el avatar secundario implicado (`other`).
- Respuesta de las tres preguntas en una sola pasada, sin generación de texto libre.
- Manejo de opciones dinámicas: las claves de avatar se construyen a partir de los nombres presentes en la escena (en minúsculas).
- Soporte de los casos especiales `everyone` y `unclear` para destinatario, y `none` para el avatar secundario.
- Uso de contexto conversacional reciente: incorpora hasta cuatro líneas previas y el último interlocutor de la persona.
- Integración con la aplicación aiembodied mediante `laya-serve` y el endpoint `/v1/systemone`.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión, audio ni modo de razonamiento extendido; su alcance es exclusivamente la clasificación descrita.

## Casos de uso

- Enrutamiento de turnos en salas multi-avatar: la aplicación aiembodied envía cada línea del usuario al endpoint `/v1/systemone` con `"model": "laya-floor-v1"` y usa la respuesta para decidir qué avatar debe actuar. Es adecuado porque la tarea es exactamente la que el modelo fue entrenado para resolver y evita invocar un modelo generativo para una decisión de clasificación.
- Desambiguación de destinatario en conversaciones con varios agentes: cuando el usuario dice "díselo a Mira" o "Orin, responde", el modelo identifica el avatar destinatario y el avatar implicado, permitiendo que el orquestador dirija el mensaje al agente correcto.
- Detección de peticiones de conversación entre avatares: la etiqueta `wants: converse` permite que el sistema inicie un diálogo entre dos avatares sin intervención del usuario, útil en simulaciones de sala o entornos sociales sintéticos.
- Reenvío de mensajes entre avatares: la etiqueta `wants: relay` combinada con `other` identifica el avatar que debe recibir el mensaje, lo que permite implementar un mecanismo de mensajería indirecta entre agentes.
- Fallback controlado en pipelines conversacionales: la aplicación usa el modelo de chat cuando la respuesta es dudosa (`unclear`), de modo que laya-floor-v1 actúa como primera capa rápida y barata antes de recurrir a un modelo generativo de mayor coste.
- Evaluación y depuración de escenas: al ser un clasificador determinista sobre un formato de prompt fijo, permite registrar y auditar por qué una línea se enrutó a un avatar concreto, lo que facilita el análisis de errores en sistemas multi-agente.
- Prototipado de interfaces de voz con avatares: en un entorno con reconocimiento de voz y varios avatares, el modelo puede decidir a quién se dirige el hablante antes de sintetizar la respuesta del avatar correspondiente.

## Benchmarks y rendimiento

| Conjunto de validación | Líneas | Los tres campos correctos |
|---|---|---|
| Floor set | 47 | 100% |
| Conjunto independiente nuevo | 110 | 94,5% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos anteriores son los únicos reportados por el autor y miden exclusivamente la exactitud conjunta de los tres campos de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 421 millones de parámetros, el peso en precisión completa (fp32) ronda 1,7 GB y en fp16/bf16 unos 0,85 GB, aunque el autor no publica cifras de cuantización ni de memoria.
- GPU recomendadas: no disponible. Por tamaño, el modelo es compatible con GPUs de consumo, pero no hay datos oficiales de latencia ni throughput.
- Cabe en GPU de consumo: previsiblemente sí por tamaño, pero no se confirma en la documentación.
- Opciones de despliegue: `laya-serve`, registrando la carpeta como modelo extra mediante `LAYA_EXTRA_MODELS` y `LAYA_MODELS`, y enviando peticiones a `/v1/systemone`. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores de enrutamiento conversacional multi-avatar) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Debilidad conocida: a veces elige un avatar que se menciona en la línea pero que no es el destinatario real. La aplicación mitiga esto recurriendo a su modelo de chat cuando la respuesta es dudosa.
- El prompt debe coincidir exactamente con el formato de entrenamiento; cualquier variación en la estructura, en las claves de opción o en el marcado del anfitrión puede degradar la precisión.
- El contexto se limita a hasta cuatro líneas recientes, cada una recortada a 200 caracteres, y a un único interlocutor previo; no hay ventana de contexto larga documentada.
- Solo soporta inglés.
- El conjunto de evaluación independiente es pequeño (110 líneas) y los resultados proceden del propio autor; no hay validación externa.
- Riesgo de alucinación: al ser un clasificador de elección cerrada, no genera texto libre, pero puede seleccionar una opción incorrecta (falsa atribución de destinatario), lo que en producción puede dirigir acciones al avatar equivocado.
- Sesgos: no documentados. Al entrenarse con 8.000 filas generadas de conversaciones ficticias, puede no generalizar a nombres, estilos o patrones de habla reales fuera de esa distribución.
- Licencia Apache-2.0: permite uso comercial, pero al ser un derivado de Laya (Apache-2.0) conviene conservar los avisos de atribución correspondientes.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/silarsis/laya-floor-v1
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Paquete Laya en PyPI: https://pypi.org/project/laya/
- Repositorio aiembodied: https://github.com/silarsis/aiembodied
