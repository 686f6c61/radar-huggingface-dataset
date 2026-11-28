# schizophyllume/critters

## Resumen

`schizophyllume/critters` es un repositorio que agrupa los cerebros de los agentes artificiales del proyecto critters.garden, un jardin de criaturas con IA que viven en el navegador. No se trata de un unico modelo, sino de una coleccion de modelos de lenguaje extremadamente pequenos (entre 4,45 M y 54,2 M de parametros) entrenados desde cero o mediante fine-tuning para dar personalidad y comportamiento a insectos y otros animales virtuales: una colmena de abejas, una colonia de hormigas y trece criaturas conversacionales (aranas, caracoles, mariquitas, mariposas, una rana, etc.).

El modelo principal registrado en Hugging Face, con 6.528.896 parametros segun los pesos safetensors, corresponde a `AntLLM-Colony`: una colonia de hormigas negras de jardin compuesta por una reina (4,26 M), un cerebro de obrera compartido (1,38 M) y un enlace de tres etapas (0,89 M) enmascarado por contacto. La innovacion tecnica central del proyecto es que los miembros de una colonia no intercambian palabras, sino estados ocultos a traves de un enlace aprendido denominado "neuralese".

El proyecto es relevante como ejemplo de investigacion abierta sobre inteligencia de enjambre y modelos multiagente a escala juguete. Todos los pesos se distribuyen en formato GGUF y safetensors bajo licencia Apache 2.0, lo que permite ejecutarlos en llama.cpp y estudiarlos sin restricciones. El repositorio acumula 2.656 descargas y 3,2 GB de tamano total, e incluye versiones historicas de cada cerebro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion heterogenea: `anthill` (AntLLM-Colony), `beehive` (BeeLLM-Hive), `llama` (critters de 12M y garden base) |
| Parametros totales | 6.528.896 (AntLLM-Colony, pesos safetensors); el conjunto del repositorio abarca desde 4,45 M hasta 54,2 M |
| Parametros activos | No aplica (no es MoE); AntLLM-Colony se descompone en reina 4,26 M + obrera compartida 1,38 M + enlaces 0,89 M |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF en f16 y f32; garden base en safetensors f32; no se documentan cuantizaciones de menor precision (Q4, Q8, etc.) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (f32) y GGUF (f16/f32) |

## Arquitectura y entrenamiento

El repositorio combina varias arquitecturas. `AntLLM-Colony` emplea la arquitectura `anthill`, que consta de una reina, un cerebro de obrera compartido por todas las hormigas y un enlace de tres etapas enmascarado por contacto: la informacion circula por la colonia solo cuando una hormiga toca a otra, de modo que las noticias se propagan paso a paso. `BeeLLM-Hive` usa la arquitectura `beehive`, con una reina preentrenada en TinyStories, un cerebro de obrera compartido y un enlace de atencion cruzada de dos etapas; en este caso las abejas leen los estados ocultos de las demas a traves de "neuralese", nunca sus palabras. Las variantes `BeeLLM-Hive-small` y `BeeLLM-Hive-Somnia` reproducen el esquema con distintos tamanos y reglas de juego; en Somnia la reina son los pesos congelados de Sauers' Somnia.

Los trece critters conversacionales son modelos de 11.965.760 parametros con arquitectura `llama`, entrenados desde cero al estilo de Scintilla 2.0 12M (BeeLLM-12M-Mood) sobre un corpus escrito por agentes de lenguaje. La version 2.x se entreno con aproximadamente 100.000 conversaciones orientadas a responder a lo que el visitante dice y hace, seguidas de un fine-tuning para reconocer los sentidos del jardin en multiples formulaciones. El `garden base` es un modelo de 12M preentrenado en TinyStories (ingles simple mas vocabulario del jardin y el formato de chat de los critters), concebido como punto de partida opcional; los critters v0 se afinaron a partir de el.

## Capacidades

- Generacion de texto conversacional en ingles a escala muy reducida (modelos de 12M).
- Simulacion de personalidad: cada critter tiene estado de animo, nombre y peculiaridad propios.
- Respuesta a visitantes dentro de un jardin simulado, combinando actuacion del dia a dia con conversacion.
- Comunicacion multiagente mediante estados ocultos aprendidos (neuralese) en las colonias de abejas.
- Propagacion de informacion por contacto en la colonia de hormigas, con enlace de tres etapas.
- Ejecucion local en llama.cpp a partir de GGUF con plantilla de chat incluida.
- No se documentan capacidades de tool calling, razonamiento multi-paso, vision, audio ni thinking mode.

## Casos de uso

- Simulacion de enjambre en el navegador: critters.garden usa estos cerebros para que cada criatura actue de forma autonoma y coherente con su especie, con modelos de 12M que caben en el cliente.
- Investigacion sobre comunicacion multiagente: AntLLM-Colony y BeeLLM-Hive permiten estudiar como emerge un canal de estados ocultos ("neuralese") frente a un canal por contacto, con tamanos que se entrenan en una sola GPU.
- Prototipado de agentes conversacionales con personalidad: los trece critters sirven como base ligera para experimentar con plantillas de chat y estados de animo sin coste de inferencia apreciable.
- Educacion y divulgacion: el garden base, preentrenado en TinyStories, es un punto de partida didactico para explicar preentrenamiento y fine-tuning en modelos de 12M.
- Pruebas de despliegue en llama.cpp: los GGUF con plantilla de chat incluida permiten validar pipelines de inferencia local y comparar f16 frente a f32.
- Arte generativo y experiencias interactivas: las personalidades fijas (Petal, Mabel, Pilot, etc.) pueden integrarse en instalaciones o demos web que requieran personajes con voz propia.
- Reproducibilidad de experimentos: el repositorio conserva todas las versiones historicas de cada cerebro, lo que facilita replicar resultados de cada "game" o "run".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para cualquier cerebro individual; AntLLM-Colony ocupa 12,5 MB en f16 y el garden base 45,7 MB en f32.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es mas que suficiente; el modelo cabe incluso en CPU.
- Cabe en GPU consumer: si, en practicamente todas, incluida inferencia en CPU pura.
- Opciones de despliegue: llama.cpp (soportado explicitamente, con arquitecturas `llama`, `beehive` y `anthill`); los GGUF incluyen plantilla de chat. No se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| critters (AntLLM-Colony) | 6,53 M | no disponible | Apache 2.0 | safetensors, GGUF | Colonia multiagente con enlace por contacto |
| BeeLLM-Hive (mismo autor) | 54,2 M | no disponible | Apache 2.0 | GGUF f16 | Colonia de abejas con neuralese; reina 50,1 M |
| critters de 12M (mismo autor) | 11,97 M | no disponible | Apache 2.0 | GGUF f32 | Conversacionales con personalidad |
| garden base (mismo autor) | 11,97 M | no disponible | Apache 2.0 | safetensors f32 | Base TinyStories para fine-tuning |

No se dispone de datos de benchmarks ni de modelos externos comparables en la informacion proporcionada; las alternativas mas cercanas son los propios cerebros del mismo repositorio.

## Limitaciones y advertencias

- Escala juguete: los modelos de 4-54 M de parametros no compiten con LLM convencionales en conocimiento general ni razonamiento.
- Idioma: solo ingles; no hay soporte multilingue documentado.
- Longitud de contexto: no documentada, lo que impide planificar conversaciones largas con garantias.
- Riesgo de alucinacion: alto en cualquier modelo de este tamano; las respuestas deben tratarse como parte de una simulacion, no como informacion fiable.
- Sesgos: el corpus fue escrito por agentes de lenguaje, por lo que puede heredar sesgos de esos agentes; no se documenta evaluacion de sesgos.
- Licencia Apache 2.0: permite uso comercial, pero el proyecto se presenta como experimental ("toy-model") y sin garantias.
- Madurez: el sitio y la simulacion estan en desarrollo (WIP); algunas versiones historicas no pueden reconstruirse (por ejemplo, Petal 1.0).
- Formatos: el soporte se limita a llama.cpp; no se documentan integraciones con otros motores de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/schizophyllume/critters
- Demo en vivo: https://critters.garden/
- Repositorio BeeLLM: https://huggingface.co/schizophyllume/BeeLLM
