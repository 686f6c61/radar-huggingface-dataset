# KoljaB/backchannel-cue-32m

## Resumen

Backchannel Cue 32M es un clasificador de texto en ingles disenado para asistentes de voz. Su funcion es decidir, en cada pausa del usuario, si un oyente humano emitiria una senal de escucha activa (un "backchannel" como "mhm", "ya veo" o "oh no") y con que formulacion concreta. Resuelve un problema especifico de la interaccion conversacional: los asistentes de voz suelen permanecer en silencio hasta que el usuario termina de hablar, lo que resulta artificial, mientras que las personas intercalan pequenas reacciones mientras escuchan.

El modelo parte del encoder `jhu-clsp/ettin-encoder-32m` (MIT) y se distribuye como grafo ONNX en float32 de 129 MB, con un repositorio total de 0,1 GB. No procesa audio: recibe unicamente el texto del turno actual y cinco contadores temporales, y devuelve probabilidades de reaccion, estado de animo, formulaciones y preguntas de eco. Esta pensado para ejecutarse en CPU en milisegundos (unos 5 ms en textos cortos y 12 ms en 40 palabras con un solo hilo), de modo que puede invocarse en cada pausa sin recurrir a un LLM.

Su relevancia practica esta en el coste y la latencia: permite anadir comportamiento de escucha a un asistente de voz sin cargar un modelo generativo, integrandolo como una capa de politica ligera sobre la transcripcion en vivo. La licencia es MIT y el modelo es solo en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (base `jhu-clsp/ettin-encoder-32m`), exportado a ONNX |
| Parametros totales | 32M (segun el modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card recomienda usar las 30 palabras mas recientes del turno) |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos ONNX en float32) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | ONNX (ejecutable con `onnxruntime`); 129 MB en float32 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 32M parametros derivado de `jhu-clsp/ettin-encoder-32m`, reutilizado como cabecera de clasificacion multitarea. La entrada combina el texto del turno actual del usuario (en minusculas, sin puntuacion, las 30 palabras mas recientes) con cinco caracteristicas temporales calculadas por el autor: numero de palabras del turno, segundos desde la ultima senal emitida, palabras desde la ultima senal, numero de senales ya emitidas en el turno y un quinto contador derivado de estos. La salida se descompone en varias cabeceras: `gate` (probabilidad de que un oyente responda), `reactions` (puntuacion por tipo de reaccion: continuer, receipt, agree, surprise, wow, sympathy, praise, laugh, echo), `mood` (neutral, bad, good, funny), `forms` (61 clases de formulacion) y `echo` (que pregunta de retorno encaja).

El entrenamiento combina dos fuentes. Por un lado, unas 295.000 pausas reales, el 63% procedentes del dataset Open Yap 1K y el 37% de transcripciones Switchboard (MS-State), que ensenan cuando responde la gente y con que palabras. Por otro, etiquetas de profesor sobre unas 7.100 pausas y 18.400 frases escritas, generadas por un modelo Qwen local y por modelos OpenAI GPT-5.4, anotando reacciones, estado de animo y ecos a partir unicamente de las palabras visibles. Los modelos de OpenAI nunca vieron texto de Open Yap. El repositorio contiene solo pesos, no datos de entrenamiento.

## Capacidades

- Clasificacion de texto multitarea: probabilidad de intervencion (`gate`), tipo de reaccion, estado de animo, formulacion concreta (61 clases) y pregunta de eco.
- Deteccion de senales de escucha activa en pausas conversacionales, con umbrales calibrados por posicion (0,09 al final de clausula y 0,018 a mitad de frase).
- Inferencia en CPU con latencia de milisegundos (aproximadamente 5 ms en texto corto y 12 ms en 40 palabras con un hilo).
- Reglas de seguridad integradas en la politica de ejemplo: supresion de risa, elogio o sorpresa cuando el estado de animo `bad` supera 0,3; risa solo con `funny` >= 0,5 y `sympathy` <= 0,25.
- Generacion de preguntas de eco ("About what?") cuando la frase queda incompleta y la puntuacion de eco es >= 0,7.
- No soporta tool calling, function calling, agentes, vision ni audio; es un clasificador, no un generador.

## Casos de uso

- Asistentes de voz con escucha activa: en cada pausa del usuario, el modelo recibe la transcripcion del turno y decide si emitir "mhm", "I see" o "Oh no", reproduciendo audio pre-renderizado para evitar latencia de sintesis.
- Sistemas de turn-taking en telefonia o call centers: la senal `gate` permite modular cuando el agente virtual interviene y cuando conviene callar, reduciendo la sensacion de silencio incomodo.
- Deteccion de estado de animo en conversaciones: la salida `mood` (neutral, bad, good, funny) puede alimentar logica de escalado a un agente humano cuando el usuario transmite malas noticias.
- Enrutado de preguntas de aclaracion: la cabecera `echo` identifica frases truncadas ("I wanted to tell you about") y sugiere la pregunta de retorno adecuada, util en asistentes de dictado o toma de notas.
- Filtro de naturalidad en agentes conversacionales basados en LLM: se ejecuta como capa previa barata en CPU y solo invoca el LLM cuando el usuario ha terminado el turno.
- Prototipado e investigacion en interaccion conversacional: su tamano (129 MB) y licencia MIT permiten experimentar con politicas de backchannel en entornos con recursos limitados o en el propio portatil.
- Sistemas embebidos o edge: al ejecutarse con `onnxruntime` en un solo hilo de CPU, encaja en dispositivos sin GPU junto a un motor de reconocimiento de voz.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| AUC de `gate` en pausas de corpus reservado | 0,733 |
| AUC de `gate` en turnos cortos con texto del turno actual | 0,714 (Switchboard 0,76; Open Yap 0,61) |
| Precision de `mood` en conjunto de desarrollo escrito | 86% |
| Frases tristes nuevas | 12 de 12 leidas como `bad`, 0 risas |
| Ecos con umbral 0,7 en conjunto escrito a mano | 14 de 14 buenos disparados, 2 de 12 malos disparados |
| Mismos ecos con errores sinteticos de transcripcion | 99% buenos disparados, 30% malos disparados |

El propio autor advierte que los conjuntos escritos a mano son pequenos y algunos se usaron durante el ajuste, por lo que estas cifras deben tratarse como aproximadas.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo corre en CPU con `onnxruntime`. Los pesos ONNX en float32 ocupan 129 MB en disco y una huella de memoria del orden de cientos de MB incluyendo el runtime.
- GPU recomendadas: no aplica; cualquier GPU es innecesaria. Si se desea, puede ejecutarse en CUDA con el proveedor de `onnxruntime`, pero no aporta ventaja frente a CPU.
- Cabe en cualquier equipo consumer, incluidos portatiles modestos y dispositivos edge, al ser un encoder de 32M parametros.
- Opciones de despliegue: `onnxruntime` (libreria declarada), con dependencias `tokenizers`, `numpy` y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 5 ms en texto corto y 12 ms en 40 palabras con un solo hilo de CPU, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Backchannel Cue 32M | 32M | No disponible (30 palabras recomendadas) | Clasificacion de backchannel, estado de animo y eco | MIT | ONNX en HuggingFace |
| `jhu-clsp/ettin-encoder-32m` | 32M | No disponible | Encoder general (modelo base) | MIT | HuggingFace |
| Clasificadores de turn-taking basados en LLM | Variable (miles de millones) | Amplio | Prediccion de fin de turno | Variable | Requiere GPU |

No se dispone de datos publicados de benchmarks comparativos frente a alternativas especificas de la misma tarea en la informacion proporcionada.

## Limitaciones y advertencias

- Solo funciona en ingles; no hay soporte multilingue.
- No detecta humor a partir del texto, por lo que rara vez se rie en historias divertidas.
- Solo lee palabras: el tono de voz y la entonacion le son invisibles.
- La senal `gate` es debil por si sola; cabe esperar algunas intervenciones mal colocadas.
- Con entrada limitada al turno actual olvida turnos previos, de modo que una mala noticia mencionada antes no frena una reaccion alegre.
- Las preguntas de eco pierden fiabilidad con transcripciones ruidosas, y "Like what?" puede dispararse tras un "like" de relleno.
- Los umbrales bajos (0,018 a mitad de frase) implican falsos positivos si no se aplican las reglas de espaciado (minimo 6 segundos entre senales y unas 4 por minuto).
- Se probo en conversaciones simuladas y por una sola persona, no en un estudio con usuarios.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KoljaB/backchannel-cue-32m
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Dataset Open Yap 1K: https://huggingface.co/datasets/TheAgenticDataCompany/open-yap-1k
