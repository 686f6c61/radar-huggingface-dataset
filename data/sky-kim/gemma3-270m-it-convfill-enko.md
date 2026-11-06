# Sky-Kim/gemma3-270m-IT-ConvFill-EnKo

## Resumen

gemma3-270m-IT-ConvFill-EnKo es un modelo de lenguaje de 270 millones de parámetros desarrollado por Sky-Kim, especializado en "conversational infill" (relleno conversacional) para agentes de voz. Se trata de un ajuste fino bilingüe (inglés y coreano) del modelo vysri/gemma3-270m-IT-ConvFill, que a su vez deriva de la familia Gemma 3 de Google. El modelo implementa la técnica descrita en el paper "Thinking While Speaking" (arXiv:2511.07397), cuyo objetivo es que un agente de voz empiece a hablar inmediatamente mientras un modelo backend de mayor tamaño genera la respuesta sustancial.

La arquitectura subyacente es un transformer decoder-only de la familia Gemma 3 (gemma3_text), con 268.099.456 parámetros totales. El modelo no está diseñado para responder preguntas directamente, sino para producir una frase hablada por llamada: o bien reformula una frase de conocimiento proporcionada por el backend, o bien emite un relleno breve y sin contenido (`<sil>`) cuando el backend aún no ha enviado nada. Esto reduce la latencia percibida en asistentes de voz.

Su relevancia radica en que aborda un problema práctico de los agentes de voz: la espera del primer token. Al ser un modelo pequeño (270M), puede ejecutarse en dispositivo (on-device), incluyendo builds para Unity Sentis, y su ajuste bilingüe inglés-coreano amplía su aplicabilidad a mercados de habla coreana sin perder el rendimiento en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text) |
| Parametros totales | 268.099.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en bf16) |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | Gemma (license: gemma) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repo | 0.6 GB |
| Modelo base | vysri/gemma3-270m-IT-ConvFill |
| Vocabulario | 262.146 tokens (incluye token especial `<sil>` id 262145) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3, con 270M parámetros. Se inicializa desde vysri/gemma3-270m-IT-ConvFill y se somete a un ajuste fino completo (full fine-tune) siguiendo la receta del repositorio vysri/conversational-infill: plantilla específica de ConvFill (no la plantilla de chat de Gemma), pérdida calculada únicamente sobre la respuesta actual, AdamW con learning rate 1e-4, weight decay 0.01, warmup de 200 pasos y batch efectivo de 16. La diferencia respecto a la receta original es que se entrenan 10.000 pasos con decaimiento coseno hasta cero, en lugar de un epoch completo con el schedule original.

Los datos de entrenamiento combinan el dataset ConvFill en inglés (zenglhardt/convfill-dataset) y su traducción al coreano (Sky-Kim/convfill-dataset-ko), con 275.950 pasos por idioma. El 5% de las conversaciones se reservó como held-out por dominio, manteniendo las mismas conversaciones excluidas en ambos idiomas. El entrenamiento se realizó en una Apple M5 Max (MPS) con autocast bf16 y pesos maestros en fp32, en 1 hora y 10 minutos. Los pesos se almacenan en bf16. La decisión de acortar el schedule se justifica porque continuar con el schedule original erosionaba la capacidad de copiar nombres propios literalmente (del 95% al 86% en inglés).

La innovación técnica clave es el formato de prompt de "conversational infill": cada llamada incluye el turno del usuario, lo ya dicho en el turno actual, y una ranura de conocimiento que contiene o bien una frase del backend o el token `<sil>`. El modelo genera una sola frase hablada y se detiene en `<end_of_turn>`.

## Capacidades

- Generación de una frase hablada por llamada, reformulando una frase de conocimiento del backend en lenguaje oral natural.
- Emisión de rellenos conversacionales breves y sin contenido cuando el backend aún no ha enviado conocimiento (token `<sil>`).
- Capacidad bilingüe inglés-coreano, con respuestas en coreano natural para usuarios coreanos (100% de salidas en coreano en la evaluación del autor, frente al 54% del modelo base).
- Copia literal de nombres propios (91,3% en inglés, 88,8% para nombres latinos en coreano).
- Integración en pipelines de agentes de voz con backend de mayor tamaño que transmite conocimiento por frases.
- Soporte de inferencia en dispositivo (build para Unity Sentis mencionado en la model card).
- No incluye tool calling ni function calling.
- No incluye modo de razonamiento (thinking mode) ni capacidades de visión o audio.
- No está diseñado para razonamiento multi-paso ni para responder preguntas de forma autónoma.

## Casos de uso

- Agentes de voz con baja latencia percibida: el modelo emite un relleno breve mientras el backend grande genera la respuesta, eliminando el silencio inicial en asistentes telefónicos o de altavoz inteligente.
- Asistentes de voz en coreano: el ajuste bilingüe permite atender a usuarios coreanos en su idioma natural, con reformulación de las frases del backend en habla oral coreana.
- Reformulación de respuestas técnicas en lenguaje hablado: convierte frases escritas del backend (por ejemplo, de un LLM grande) en enunciados adecuados para síntesis de voz, manteniendo la cobertura de palabras de contenido (0,875 en inglés, 0,920 en coreano).
- Despliegue en dispositivo (on-device): con 270M parámetros y pesos bf16, es viable en hardware de consumo y en builds de Unity Sentis para aplicaciones de voz embebidas.
- Sistemas de atención al cliente por voz: el modelo gestiona el turno conversacional y la transición entre relleno y contenido sin que el usuario perciba la latencia del backend.
- Copia fiable de nombres propios en dictado o confirmación de datos: útil en escenarios donde el agente debe repetir nombres, direcciones o identificadores proporcionados por el backend.
- Prototipado de pipelines de voz con backend desacoplado: permite separar el "talker" (este modelo) del "thinker" (modelo grande), facilitando pruebas de latencia y calidad de reformulación.

## Benchmarks y rendimiento

Datos de evaluación del autor sobre conversaciones held-out, por idioma (decodificación greedy, 200 pasos de conocimiento y 200 pasos `<sil>` por idioma):

| Metrica | Ingles | Coreano |
|---|---|---|
| Loss, todos los pasos (14.621 por idioma) | 1.276* | 1.371 |
| Knowledge → speech chrF vs referencia | 63.9 | 52.7 |
| Cobertura de palabras de contenido del conocimiento | 0.875 | 0.920 |
| Relleno `<sil>` que afirma un hecho no dado (referencia: 7,5% / 13,5%) | 5.0% | 7.0% |
| Salida en el alfabeto esperado | 100% | 100% |
| Salidas repetitivas o vacías | 0 / 0 | 0 / 0 |

\* La cifra de inglés es optimista: el checkpoint inicial fue entrenado con la mayoría de esas conversaciones en inglés.

Comparación con el modelo base (vysri/gemma3-270m-IT-ConvFill):

| Metrica | Este modelo | Modelo base |
|---|---|---|
| Salidas en coreano para usuarios coreanos | 100% | 54% |
| Loss held-out en coreano | 1.371 | 2.597 |
| chrF conocimiento → habla en inglés | 63.9 | 65.3 |
| Nombres copiados literalmente (EN / nombres latinos en KO) | 91,3% / 88,8% | 95,3% / 97,3% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en bf16 (268M parámetros), alrededor de 1,1 GB en fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo se entrenó en Apple M5 Max (MPS), lo que indica viabilidad en hardware Apple Silicon.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: transformers (referencia), text-generation-inference (tag endpoints_compatible), y build para Unity Sentis (Unity Inference Engine) mencionado en la model card. No se confirma soporte de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| gemma3-270m-IT-ConvFill-EnKo | 268M | no disponible | en, ko | Gemma | Conversational infill bilingüe |
| vysri/gemma3-270m-IT-ConvFill | 270M (aprox.) | no disponible | en | Gemma | Conversational infill en inglés |
| Gemma 3 270M (base) | 270M (aprox.) | no disponible | multilingüe | Gemma | Modelo generalista |

La comparación con alternativas de la misma categoría (talkers pequeños para agentes de voz) no está disponible en la información proporcionada. El modelo base y el Gemma 3 270M original son las referencias más directas, pero no se dispone de datos de benchmarks comparables de otros talkers.

## Limitaciones y advertencias

- Con 270M parámetros, en frases de conocimiento largas puede desviarse: repetir una frase, dividir o escribir mal un nombre poco común. Se recomienda mantener las frases del backend cortas.
- La copia literal de nombres propios es menos fiable que en el modelo solo en inglés (91,3% frente a 95,3% en inglés; 88,8% frente a 97,3% para nombres latinos en coreano).
- Solo reformula lo que el backend le proporciona; no verifica hechos. Los errores en el conocimiento se pronuncian tal cual.
- Los datos en coreano son traducciones automáticas del conjunto en inglés y heredan sus dominios (consejo, asistente, diálogo orientado a tareas, educación, médico, planificación, soporte).
- El modelo no es un chatbot general: no responde preguntas de forma autónoma ni mantiene conversaciones sin la ranura de conocimiento del backend.
- La licencia Gemma impone restricciones de uso comercial que deben revisarse antes de producción.
- No se dispone de información sobre sesgos específicos más allá de los heredados de los datos de entrenamiento.
- La longitud de contexto no está documentada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sky-Kim/gemma3-270m-IT-ConvFill-EnKo
- Modelo base: https://huggingface.co/vysri/gemma3-270m-IT-ConvFill
- Paper "Thinking While Speaking": https://arxiv.org/abs/2511.07397
- Repositorio de la receta: https://github.com/vysri/conversational-infill
- Dataset ConvFill inglés: https://huggingface.co/datasets/zenglhardt/convfill-dataset
- Dataset ConvFill coreano: https://huggingface.co/datasets/Sky-Kim/convfill-dataset-ko
