# pipecat-ai/sidechat

## Resumen

Sidechat es un clasificador de texto pequeno y experimental disenado para agentes de voz que conversan con varias personas a la vez. Desarrollado por pipecat-ai, su funcion es decidir, para cada intervencion en una conversacion multipartita, si el agente debe hablar ahora, esperar o ignorar la linea, y si esa linea iba dirigida a el, estaba abierta a la sala o simplemente hablaba de el. Resuelve un problema concreto de los asistentes conversacionales en entornos grupales: la deteccion de destinatario (addressee detection) y la gestion de turnos (turn-taking) cuando no hay una unica persona hablando.

El modelo parte del encoder Ettin-150M de jhu-clsp y se distribuye en formato ONNX, con una version fp32 de 598 MB y una cuantizada int8 de 267 MB. Esta pensado para integrarse en pipelines de Pipecat, el framework de agentes de voz del mismo autor, y funciona con etiquetas de hablante anonimas ("Speaker 1"), de modo que la senal proviene del nombre del agente y del ritmo de los ultimos turnos.

Se trata de la primera release entrenada, identificada como `side-r3-ettin-150m-s0`, y el propio autor la marca como experimental: los nombres, las salidas y la calibracion pueden cambiar entre versiones. Su relevancia actual radica en que aborda un problema poco cubierto por los LLM genericos (saber a quien va dirigida cada frase en una reunion o conversacion grupal) con un modelo lo bastante pequeno para ejecutarse en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (base: jhu-clsp/ettin-encoder-150m) con cabezas de clasificacion para `intent`, `respond` y `unclear` |
| Parametros totales | 150M (heredados del encoder base Ettin-150M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (`model.onnx`, 598 MB) e int8 (`model-int8.onnx`, 267 MB) |
| Idiomas soportados | ingles (`en`) |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX (`model.onnx`, `model-int8.onnx`) |

## Arquitectura y entrenamiento

Sidechat se construye sobre el encoder Ettin-150M (licencia MIT), un transformer encoder de 150 millones de parametros, al que se anaden tres cabezas de salida: `intent` (clasificacion del destinatario de la linea), `respond` (probabilidad de que el agente deba hablar ahora) y `unclear` (la linea encaja igual de bien con el agente y con otra persona). El entrenamiento consistio en 2 epocas sobre 235.069 lineas: 219.793 procedentes de conversaciones multipartitas generadas y etiquetadas segun la guia del proyecto, y 15.276 lineas de personas reales extraidas de reuniones AMI (dataset `ACloudCenter/ami-addressee`, CC BY 4.0), excluyendo todas las reuniones de test. En el 60% de las lineas de entrenamiento los hablantes eran anonimos, en el 25% tenian nombre y en el 15% no estaban etiquetados.

No se menciona el uso de RLHF ni DPO; el modelo es un clasificador supervisado, no un generador. La innovacion principal es el diseno de la tarea: en lugar de depender de nombres de hablante, el modelo usa el nombre del agente y el ritmo de los ultimos turnos como senal, lo que permite operar en escenarios donde los hablantes son anonimos. La calibracion y los umbrales de decision (`respond`, `wait`, `ignore`) viven en `config.json`, y la version int8 tiene sus propios umbrales.

## Capacidades

- Clasificacion de destinatario: determina si una linea va dirigida al agente de forma directa o indirecta, esta abierta a la sala, habla sobre el agente o es otra cosa.
- Prediccion de respuesta: devuelve la probabilidad de que el agente deba hablar ahora (cerca de 0,5 para una pregunta abierta a la sala).
- Deteccion de ambiguedad: la salida `unclear` indica cuando la linea encaja igual de bien con el agente y con otra persona.
- Decision de turno: la funcion `decide` traduce las probabilidades en `respond`, `wait` (hablar solo si nadie mas lo hace) o `ignore`, segun los umbrales de `config.json`.
- Soporte de hablantes anonimos: funciona con etiquetas genericas como "Speaker 1".
- Uso de historial conversacional: acepta los turnos previos (incluidos los del propio agente) como contexto para la decision.
- Inferencia en CPU: disponible en fp32 e int8 mediante ONNX Runtime.
- No soporta tool calling, generacion de texto, vision, audio ni razonamiento multietapa; es exclusivamente un clasificador de texto en ingles.

## Casos de uso

- Agentes de voz en reuniones: el modelo permite que un asistente integrado en una llamada grupal decida si debe intervenir o mantenerse a la escucha, usando la etiqueta anonima de cada hablante y el historial de turnos.
- Asistentes de sala en entornos presenciales: en una sala con microfonos y varios participantes, Sidechat filtra que lineas van dirigidas al agente y evita que responda a conversaciones ajenas.
- Atencion al cliente con varias personas en linea: en una llamada donde intervienen cliente y agente humano, el modelo distingue las peticiones dirigidas al bot de las conversaciones entre personas.
- Moderacion de turnos en demos de Pipecat: el propio autor lo usa como base para la demo de audiencia diaria, donde el agente debe decidir cuando hablar ante un publico.
- Preprocesado de pipelines de voz: se puede colocar antes del LLM generativo para descartar lineas irrelevantes y reducir llamadas innecesarias al modelo grande.
- Investigacion en turn-taking: sirve como baseline reproducible para experimentos de deteccion de destinatario, con datos de entrenamiento y evaluacion publicados en el repositorio.
- Despliegue en dispositivos con CPU limitada: la version int8 (267 MB) permite ejecutar la clasificacion en un vCPU, aunque con latencias de centenares de milisegundos.

## Benchmarks y rendimiento

Resultados publicados por el autor contra Jev (el modelo usado en la demo de audiencia diaria de Pipecat), con hablantes anonimos. El propio autor advierte que son baselines, no benchmarks formales: las etiquetas siguen su propia guia y la eleccion entre rondas de entrenamiento miro estos conjuntos.

| Conjunto | Sidechat | Jev |
|---|---|---|
| Duplex-MPE, 52.336 lineas | 96,7% | 83,1% |
| ... lineas para otros, respondidas directamente | 0,2% | 0,4% |
| ... peticion al agente sin su nombre, respondida | 38,8% | 26,6% |
| Social AI Ambient Bench, 15.793 lineas | 98,7% | 85,4% |
| AMI (reuniones etiquetadas), 8.875 lineas | 99,9% | 85,2% |
| 270 lineas escritas a mano | 87,4% | 77,8% |

Latencia mediana por linea (historial corto / 8 lineas previas, un hilo): 10 / 52 ms en un M5 Max, 66 / 253 ms en 1 vCPU, 507 / 648 ms en 0,5 vCPU (int8: 103 / 532 ms). En una CPU cloud pequena es mas lento que una llamada API a Jev.

## Requisitos de hardware

- VRAM estimada: el modelo es pequeno; en fp32 ocupa 598 MB y en int8 267 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; al ser un encoder de 150M, una RTX 4090 o incluso una GPU integrada son suficientes. Tambien funciona en CPU.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1 GB de memoria libre.
- Opciones de despliegue: ONNX Runtime mediante el paquete `sidechat` (`pip install git+https://github.com/pipecat-ai/sidechat`), cargando los ficheros con `snapshot_download` de `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: medianas de 10-52 ms en Apple M5 Max, 66-253 ms en 1 vCPU y 507-648 ms en 0,5 vCPU; la version int8 reduce la latencia en el caso de 0,5 vCPU (103 ms con historial corto).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pipecat-ai/sidechat | 150M | no disponible | Deteccion de destinatario y turn-taking | BSD-2-Clause | ONNX en Hugging Face |
| Jev | no disponible | no disponible | Deteccion de destinatario en la demo de Pipecat | no disponible | no disponible |
| jhu-clsp/ettin-encoder-150m | 150M | no disponible | Encoder generico (modelo base) | MIT | Hugging Face |

Jev es el unico comparable directo con datos de rendimiento en la informacion disponible; el resto de alternativas no se documentan. Ettin-150M es el modelo base, no un competidor en la misma tarea.

## Limitaciones y advertencias

- Modelo experimental: la primera release (`side-r3-ettin-150m-s0`) puede cambiar de salidas, nombres y calibracion en versiones futuras.
- Solo ingles: no soporta otros idiomas.
- Peticiones sin el nombre del agente: antes de que el agente haya hablado, se responden menos de la mitad de las veces (38,8% en Duplex-MPE).
- Datos mayoritariamente generados: la mayoria de las lineas de entrenamiento son sinteticas; solo AMI procede de habla real, lo que puede limitar la generalizacion a conversaciones reales.
- Riesgo de falsos positivos y negativos en la decision de turno: los umbrales de `config.json` deben calibrarse para cada despliegue.
- Latencia en CPU limitada: en 0,5 vCPU supera los 500 ms por linea, lo que puede ser inadecuado para interacciones en tiempo real.
- Licencia BSD-2-Clause: permisiva para uso comercial, pero conviene revisar las condiciones del modelo base Ettin-150M (MIT) y del dataset AMI (CC BY 4.0) si se redistribuyen datos.
- No es un generador: no produce respuestas, solo clasifica; requiere un LLM separado para la generacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipecat-ai/sidechat
- Codigo: https://github.com/pipecat-ai/sidechat
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-150m
- Dataset de entrenamiento (AMI): https://huggingface.co/datasets/ACloudCenter/ami-addressee
- Dataset de evaluacion Duplex-MPE: https://huggingface.co/datasets/ChengqianMa/Duplex-MPE
- Dataset de evaluacion Social AI Ambient Bench: https://huggingface.co/datasets/text-ai/social-ai-ambient-bench
