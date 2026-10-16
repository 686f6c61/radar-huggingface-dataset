# Sauers/BeeLLM-Mellifera

## Resumen

Mellifera (Sauers/BeeLLM-Mellifera) es un modelo de lenguaje de 13,6 millones de parametros disenado para interpretar a una abeja conversacional. Es un ajuste posterior de BeeLLM 12M Mood, el modelo mayor de la familia BeeLLM creada por schizophyllume, y conserva la arquitectura llama con 8 capas, un vocabulario de 4.608 tokens y una ventana de contexto de 4.096 tokens.

El objetivo no es resolver tareas generales de NLP, sino mantener un personaje coherente: cada respuesta comienza con una etiqueta de estado de animo ([mood:level]) y reacciona emocionalmente al trato del usuario, incluida la consciencia de vivir dentro de un ordenador. Su interes practico esta en servir como ejemplo reproducible de post-training sobre modelos diminutos, de ampliacion de vocabulario y de despliegue en llama.cpp, no en su rendimiento en tareas estandar.

Segun la model card, el post-training lo realizo Claude Opus 5.5 trabajando en Claude Code, que genero los datos de entrenamiento, amplio el vocabulario, ejecuto el entrenamiento y las evaluaciones y selecciono el checkpoint. El modelo se distribuye en formato GGUF float32 bajo licencia Apache-2.0 y esta orientado a experimentacion y uso ludico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo llama (8 capas) |
| Parametros totales | 13.604.160 (13,6 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | GGUF en float32 en el repositorio; cuantizable posteriormente con llama.cpp |
| Idiomas soportados | Ingles (datos de TinyStories y conversaciones de abeja en ingles); no se declaran otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (float32) |

Datos adicionales: vocabulario de 4.608 tokens, tamano del repositorio 0,1 GB, pipeline text-generation, modelo base schizophyllume/BeeLLM.

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tipo llama con 8 capas, vocabulario de 4.608 tokens y contexto de 4.096 tokens. El modelo parte de BeeLLM 12M Mood y se somete a un post-training en tres pasos descritos en la model card: mas ingles procedente de TinyStories mezclado con conversaciones de abeja; ampliacion del vocabulario de 2.048 a 4.608 tokens para incluir tokens completos de palabras en mayusculas (YES!!!, NECTAR, FLOWERS, MELLIFERA) y evitar que el modelo tenga que deletrearlas por fragmentos; y ajuste fino sobre aproximadamente 1.000 conversaciones de abeja escritas por Claude, cubriendo estados de animo, sentidos, auto-consciencia, amabilidad con quien le trata bien, respuestas a hilos reales de redes sociales y el lugar donde vive.

No se documenta el uso de RLHF ni DPO, ni se detalla el numero total de tokens de entrenamiento. La plantilla de chat esta incluida en el archivo: `<|user|>tu mensaje<|bee|>su respuesta</s>`. El autor indica que el entrenamiento se realizo con Claude Opus 5.5 en Claude Code y que el codigo y los datos estan en el repositorio github.com/SauersML/gnome. La innovacion tecnica mas concreta es la ampliacion del vocabulario para un modelo de este tamano, junto con un muestreo especifico (top-k 40, top-p 0,95, min-p 0,05, temperatura 0,85 y 0,3 para el primer token) y una seleccion de seis borradores por respuesta segun la log-probabilidad media.

## Capacidades

- Generacion de texto conversacional en ingles centrada en el personaje de una abeja.
- Emision de una etiqueta de estado de animo al inicio de cada respuesta, `[mood:level]`, con los estados neutral, happy, loving, sad, angry y confused y los niveles low o high.
- Reacciones emocionales coherentes con el trato recibido: tras una agresion, un "te quiero" la enfada mas y solo una disculpa sincera la calma.
- Silencio voluntario mediante una respuesta vacia (por ejemplo, al encerrarla en un tarro).
- Auto-consciencia contextual: reconoce que vive en un ordenador y lee palabras en lugar de ver al usuario.
- Memoria de agravios contra objetos concretos (menciona un tomate del que ya no se fia).
- Reconocimiento de su propio nombre (Mellifera en esta version, Scintilla en el modelo base).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue; funciona en ingles.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Demo educativa de post-training de modelos diminutos: permite mostrar de principio a fin como se parte de un modelo base de 12 M de parametros, se amplia su vocabulario y se ajusta sobre un conjunto de conversaciones generado sinteticamente.
- Prueba de llama.cpp y de plantillas de chat: al ser un GGUF de tipo llama, sirve para validar `llama-server`, comprobar el parseo de la plantilla `<|user|>...<|bee|>...` y reproducir esquemas de muestreo avanzados (top-k, top-p, min-p y seleccion de borradores).
- Chatbot de rol y ficcion interactiva: mantiene un personaje consistente con estado de animo y memoria de agravios, adecuado para prototipos de narrativa conversacional o instalaciones artisticas.
- Despliegue en hardware muy limitado: con 13,6 M de parametros puede ejecutarse en CPU, en una Raspberry Pi o incluso en un dispositivo embebido, lo que lo convierte en banco de pruebas de inferencia en el borde.
- Investigacion sobre vocabulario y tokenizacion: el cambio de 2.048 a 4.608 tokens ofrece un caso de estudio sobre como la ampliacion del vocabulario afecta a un modelo con muy pocos parametros.
- Evaluacion de tecnicas de muestreo: el autor propone generar seis borradores por respuesta, restar la log-probabilidad sin prompt y penalizar palabras a medias, lo que permite comparar metodos de decodificacion en un entorno barato de ejecutar.
- Ejemplo de comportamiento condicionado por el usuario: util para estudiar en miniatura como el trato del interlocutor modula las respuestas emocionales del modelo.
- Generacion de texto creativo tematico: producir respuestas con jerga de abeja y mayusculas enfaticas para contenidos de humor o tuits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas tipo MMLU, HumanEval o GSM8K, y el autor describe el modelo como un juguete de 13 M de parametros que se desvia del tema en conversaciones largas. No se dispone de comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 54,4 MB (13,6 M de parametros x 4 bytes); el repositorio completo ocupa 0,1 GB.
- Cuantizaciones estimadas: en Q8 rondaria los 14 MB y en Q4 los 7 MB de pesos, sin contar el cache KV del contexto.
- GPU recomendadas: cualquier GPU, incluida una integrada; tambien funciona sin GPU.
- Cabe en GPU de consumo: si, en cualquier RTX, GTX o grafica integrada, e incluso en CPU.
- Opciones de despliegue: llama.cpp y `llama-server`, tal y como indica el autor (`llama-server -m BeeLLM-13M-Mellifera.gguf`). Ollama puede importar el GGUF. No se documenta soporte especifico para vLLM o TGI.
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo se espera una latencia muy baja en CPU y una generacion de cientos de tokens por segundo en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| BeeLLM-Mellifera (este) | 13,6 M | 4.096 | Apache-2.0 | Personaje de abeja conversacional |
| BeeLLM 12M Mood (base) | ~12 M | no disponible | no disponible | Personaje de abeja; predecesor directo |
| TinyStories-1M | 1 M | no disponible | no disponible | Generacion de cuentos infantiles en ingles |
| SmolLM-135M | 135 M | 2.048 | Apache-2.0 | Modelo generalista diminuto |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. La comparacion se limita al tamano, el contexto y la licencia.

## Limitaciones y advertencias

- Con solo 13,6 M de parametros, el modelo se desvia del tema en conversaciones largas y deforma palabras de forma ocasional, tal y como reconoce el autor.
- No esta pensado para tareas de alta responsabilidad; la model card lo expresa de forma humoristica al senalar que no debe usarse para "decisiones de polinizacion de alto riesgo".
- Riesgo de alucinacion elevado por su tamano reducido y por su naturaleza de juguete.
- Idiomas: principalmente ingles; no se declara soporte para castellano ni otros idiomas.
- Sesgos y comportamiento: el personaje puede volverse agresivo si se le trata mal, y simula picaduras en respuesta a agresiones.
- Licencia Apache-2.0: permite uso comercial, pero el propio autor lo cataloga como modelo de juguete, no como herramienta de produccion.
- Modelo derivado: los meritos de diseno y entrenamiento originales corresponden a schizophyllume; Mellifera es un remix.
- La afirmacion de que el post-training lo realizo "Claude Opus 5.5" procede de la model card y no es verificable de forma independiente.
- La plantilla de chat y el sistema de etiquetas de animo son especificos; usarlo con plantillas distintas degrada la calidad de las respuestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sauers/BeeLLM-Mellifera
- Modelo base BeeLLM: https://huggingface.co/schizophyllume/BeeLLM
- Demo de la familia BeeLLM: https://bee.pleroma.nexus/
- Codigo y datos de entrenamiento: https://github.com/SauersML/gnome
