# l3lab/VTR-2B

## Resumen

VTR-2B es un modelo multimodal construido sobre Qwen/Qwen3.5-2B mediante la tecnica Visual Token Routing (VTR), desarrollada por el autor l3lab. La innovacion central consiste en un pequeno router, un MLP de tres capas con 23,3 millones de parametros (aproximadamente el 1 % del modelo de lenguaje), entrenado de forma conjunta con el modelo base, que decide que tokens visuales entran efectivamente en el modelo de lenguaje. De este modo se reduce drasticamente el coste computacional asociado al procesamiento de imagenes sin degradar la calidad de las respuestas.

Segun la model card, VTR iguala al modelo de resolucion completa en OSWorld, CUA-World y prediccion de acciones en videojuegos, utilizando entre 2,5 y 5,8 veces menos tokens visuales. Ademas, se conserva integra una de cada diez imagenes para mantener el contexto visual completo cuando resulta necesario.

El modelo tiene 2.236.574.017 parametros totales, se distribuye en formato safetensors con un tamano de repositorio de 4,5 GB y se publica bajo licencia Apache 2.0. Su relevancia actual radica en que aborda uno de los cuellos de botella mas importantes de los modelos multimodales en produccion: el coste de atencion sobre secuencias visuales largas, especialmente en tareas de agentes que interactuan con interfaces graficas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-2B) con router MLP de 3 capas para seleccion de tokens visuales |
| Parametros totales | 2.236.574.017 |
| Parametros activos | No aplica (no es MoE); el router anade 23,3 M de parametros |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer multimodal de 2,2 mil millones de parametros, y le incorpora un mecanismo de enrutamiento de tokens visuales. El router es un perceptron multicapa de tres capas con 23,3 millones de parametros que, entrenado conjuntamente con el modelo, decide que tokens visuales se pasan al modelo de lenguaje y cuales se descartan. Para preservar la informacion visual completa cuando es necesaria, se mantiene integra una de cada diez imagenes. El entrenamiento conjunto consistio en 2.000 pasos.

La innovacion principal es la reduccion del numero de tokens visuales procesados por el transformer, lo que disminuye el coste de atencion y acelera la inferencia en tareas con muchas imagenes, como agentes que operan sobre interfaces graficas. La integracion practica se realiza mediante un servidor vLLM parcheado incluido en el repositorio del proyecto, que expone una API compatible con OpenAI.

## Capacidades

- Comprension de imagenes y generacion de texto condicionada por entrada visual.
- Razonamiento sobre capturas de pantalla e interfaces de usuario (OSWorld, CUA-World).
- Prediccion de acciones en videojuegos a partir de fotogramas.
- Reduccion adaptativa de tokens visuales mediante el router entrenado.
- Servidor compatible con la API de OpenAI para integracion en pipelines existentes.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de automatizacion de escritorio: el modelo puede interpretar capturas de pantalla de sistemas operativos y decidir la siguiente accion, con un coste reducido de tokens visuales gracias al router, lo que abarata las sesiones largas de OSWorld o CUA-World.
- Automatizacion de pruebas de interfaz de usuario: integrado en pipelines de QA, el modelo analiza capturas de pantalla de aplicaciones web o de escritorio y detecta regresiones visuales o estados inesperados con menor consumo de contexto.
- Prediccion de acciones en videojuegos: util para entrenar o evaluar agentes que juegan a partir de fotogramas, donde la reduccion de tokens visuales permite procesar secuencias mas largas por unidad de computo.
- Asistentes de soporte con capturas de pantalla: el usuario envia una imagen de su pantalla y el modelo responde con instrucciones paso a paso, manteniendo conversaciones multi-turno con varias imagenes.
- Procesamiento por lotes de documentos escaneados o formularios: el enrutamiento de tokens visuales reduce el coste de procesar grandes volumenes de imagenes en tareas de extraccion de informacion.
- Prototipado de agentes multimodales en entornos de investigacion: al ser un modelo de 2,2 B con licencia Apache 2.0, se puede desplegar en infraestructura modesta para experimentar con arquitecturas de enrutamiento visual.

## Benchmarks y rendimiento

La model card menciona evaluaciones en OSWorld, CUA-World y prediccion de acciones en videojuegos, pero no publica cifras numericas concretas. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 4,5 GB solo para los pesos, mas memoria para el contexto y el servidor vLLM; en la practica se recomiendan al menos 8-12 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,5 GB de pesos; en 4 bits, alrededor de 1,5 GB (estimaciones teoricas, no confirmadas en la model card).
- GPU recomendadas: RTX 4090, A100 o H100 para produccion con vLLM; tambien cabe en GPUs consumer de gama media-alta (RTX 3090, RTX 4080) en cuantizacion.
- Cabe en GPU consumer: si, en principio, dado el tamano de 2,2 B de parametros.
- Opciones de despliegue: el proyecto proporciona un servidor vLLM parcheado (`uv run vtr serve`). No se menciona soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card afirma una reduccion de tokens visuales de 2,5 a 5,8 veces, lo que implica una mejora proporcional en el coste de atencion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| VTR-2B | 2,24 B (+23,3 M router) | No disponible | Apache 2.0 | Enrutamiento de tokens visuales; iguala al modelo base con 2,5-5,8x menos tokens visuales |
| Qwen/Qwen3.5-2B | 2,2 B (aprox.) | No disponible | No disponible | Modelo base sin enrutamiento; procesa todos los tokens visuales |
| Otros modelos multimodales de ~2 B | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al heredar el modelo base Qwen3.5-2B, es probable que arrastre sus sesgos, pero no se documentan.
- Riesgo de alucinacion: no cuantificado; como todo modelo generativo, puede producir respuestas incorrectas, especialmente en tareas de agente donde una accion erronea tiene consecuencias.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no se detallan en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B y del repositorio VTR.
- Dependencia de infraestructura: el router requiere el servidor vLLM parcheado del repositorio VTR; no se documenta compatibilidad con otros motores de inferencia.
- El modelo se publico el 4 de noviembre de 2026 y no registra descargas ni likes, por lo que carece de validacion comunitaria.
- La conservacion integra de una de cada diez imagenes implica que el comportamiento puede variar segun la distribucion de las entradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/l3lab/VTR-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del proyecto VTR: https://github.com/pranjal2041/vtr
