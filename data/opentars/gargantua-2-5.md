# OpenTARS/Gargantua-2.5

## Resumen

Gargantua 2.5 es un modelo de lenguaje multimodal (texto, imagen y audio) desarrollado por MastLLM para el asistente local openTARS. Se trata de un ajuste fino de Gemma 4 E4B (un modelo de Google con arquitectura transformer y licencia Apache-2.0), entrenado sobre datos propios de uso de herramientas y acciones de texto, manteniendo el mismo contrato de 19 herramientas que las versiones anteriores de la familia Gargantua.

El modelo está pensado para ejecutarse en local, incluso en hardware de consumo: los pesos se distribuyen en formato GGUF con cuantización Q4_K_M (4,9 GB) más un proyector multimodal F16 (0,99 GB). Con 7.463.013.674 parámetros totales, el objetivo declarado del autor es ofrecer un asistente capaz de abrir programas, escribir, buscar en la web, ejecutar comandos y leer imágenes sin depender de la nube.

Su relevancia actual radica en la combinación de tool-use nativo, soporte de visión y audio experimental, y un tamaño que cabe en una GPU de 6 GB o incluso en CPU con 8,6 GB de RAM. El entrenamiento se completó en una sola época (1.949 pasos), parte en una Colab T4 y parte en una RTX 3050 de 6 GB, lo que condiciona tanto sus capacidades como sus limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E4B) con proyector multimodal para vision y audio |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens (valor usado en el ejemplo de despliegue con `-c 8192`); el maximo nativo del modelo base no se especifica |
| Tipos de cuantizacion | Q4_K_M (pesos principales, 4,9 GB) y F16 (proyector multimodal, 0,99 GB); el entrenamiento uso decodificador en 4 bits en la fase final |
| Idiomas soportados | portugues (pt) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) y artefacto para Ollama |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B, un transformer multimodal de Google, y se ajusta mediante fine-tuning supervisado sobre datos propios de MastLLM centrados en tool-use y acciones de texto. No se menciona uso de RLHF ni DPO en la informacion disponible. El entrenamiento consistio en una sola epoca de 1.949 pasos: los primeros 1.200 pasos se ejecutaron en una Colab T4 en fp16 y los 749 restantes en una RTX 3050 de 6 GB en bf16, con las capas del decodificador en 4 bits y excluyendo el 1,8 % de ejemplos mas largos (por encima de 2.048 tokens) para que cupieran en 6 GB de VRAM.

La innovacion principal no esta en la arquitectura sino en el contrato de herramientas: el modelo mantiene las mismas 19 herramientas que las versiones previas de Gargantua, lo que facilita la integracion con el asistente openTARS. El componente multimodal se implementa mediante un proyector separado (`mmproj`) que permite entrada de imagen y audio a traves de llama.cpp, aunque el propio proyecto marca la entrada de audio como experimental.

## Capacidades

- Generacion de texto conversacional en portugues e ingles.
- Tool calling / function calling con un contrato fijo de 19 herramientas (abrir programas, escribir, buscar en la web, ejecutar comandos).
- Acciones de texto: reescritura, resumen, traduccion y respuesta sobre un texto dado.
- Resistencia parcial a instrucciones ocultas en el texto de entrada (evaluado en sus propias pruebas).
- Vision: lectura y descripcion de imagenes mediante el proyector multimodal.
- Audio: transcripcion de peticiones habladas cortas (experimental en llama.cpp).
- Razonamiento multi-paso orientado a tareas cotidianas dentro del asistente openTARS.
- Modo de pensamiento desactivable: la aplicacion envia `think=false` para este modelo.

## Casos de uso

- Asistente de escritorio local: el modelo interpreta ordenes en lenguaje natural y las traduce en llamadas a las 19 herramientas disponibles para abrir programas, escribir texto o ejecutar comandos, sin salir de la maquina del usuario.
- Automatizacion de tareas cotidianas: con una tasa de 47/48 en la prueba portable de 48 tareas y 68/80 en la prueba de 80 tareas, es adecuado para flujos de productividad personal donde la latencia importa mas que la precision absoluta.
- Procesamiento de documentos con imagenes: puede describir y responder preguntas sobre imagenes capturadas, util para digitalizar notas, capturas o fotografias en un pipeline local.
- Transcripcion de ordenes por voz: con 6/6 en peticiones habladas cortas (2-3,5 s por peticion en CPU), sirve para interfaces de voz simples en ingles y portugues.
- Traduccion y resumen en local: las tareas de reescritura, resumen y traduccion obtuvieron 75/76 en las pruebas del autor, lo que lo hace viable para preprocesar texto sin enviar datos a terceros.
- Despliegue en hardware modesto: con 4,9 GB de pesos en Q4_K_M cabe en una RTX 3050 de 6 GB o en CPU con 8,6 GB de RAM, lo que permite prototipar asistentes en equipos de gama baja.
- Integracion via Ollama: al publicarse como `ProjectOpenTARS/Gargantua-2.5:latest`, se puede desplegar con un solo comando en entornos de desarrollo y pruebas.

## Benchmarks y rendimiento

Los datos siguientes proceden de las suites de prueba propias de openTARS, ejecutadas en una RTX 3050 de 6 GB el 13 de noviembre de 2026. No son benchmarks publicos ni comparables con MMLU, HumanEval o GSM8K.

| Prueba | Resultado |
|---|---|
| Eleccion de herramienta (21 casos) | 21/21; 1,2 s por peticion en GPU, 3,1 s en CPU |
| Acciones de texto (reescribir, resumir, traducir, preguntar, ignorar instrucciones ocultas) | 75/76 |
| Respuestas inventadas o erroneas en 48 preguntas (modelo solo / dentro de la app) | 6 / 7 |
| Prueba portable openTARS (48 tareas cotidianas) | 47/48 |
| Prueba openTARS de 80 tareas | 68/80 |
| Voz a texto, 6 peticiones cortas (3 en ingles, 3 en portugues, voces sinteticas), solo CPU | 6/6; 2 a 3,5 s cada una |

Rendimiento en CPU (llama.cpp b12032, 16 hilos, medido sobre una exportacion anterior del mismo modelo): 1,4 s para una respuesta corta, 3,9 s para responder sobre una imagen, 14,1 s para un prompt de 1.200 tokens, con 8,6 GB de RAM.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6 GB para cargar el GGUF Q4_K_M (4,9 GB) mas el proyector F16 (0,99 GB) con algo de margen para el contexto.
- GPU recomendadas: RTX 3050 de 6 GB (probada por el autor), RTX 3060/4060 de 8 GB o superiores; A100 y H100 funcionan pero estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, al menos en tarjetas con 6 GB o mas de VRAM en cuantizacion Q4_K_M.
- Alternativa en CPU: funciona con 8,6 GB de RAM y 16 hilos, con latencias de 1,4 a 14,1 s segun la tarea.
- Opciones de despliegue: llama.cpp (`llama-server`, probado con build b12032) y Ollama (`ProjectOpenTARS/Gargantua-2.5:latest`).
- Parametros de muestreo recomendados: temperatura 0,4, top_p 0,95, top_k 64.
- Latencia y throughput: 1,2 s por peticion de herramienta en GPU y 3,1 s en CPU; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos publicos de benchmarks que permitan una comparacion rigurosa con alternativas. La siguiente tabla recoge solo los datos disponibles del propio modelo y referencias generales de su modelo base.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gargantua 2.5 | 7.463.013.674 | 8.192 (usado en despliegue) | Apache-2.0 | GGUF, Ollama | Fine-tune de Gemma 4 E4B con tool-use y vision/audio |
| Gemma 4 E4B (base) | no disponible en la informacion | no disponible | Apache-2.0 | safetensors, GGUF | Modelo original de Google sin el ajuste de herramientas |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos comparativos |

## Limitaciones y advertencias

- Debil en la localizacion de elementos pequenos de interfaz por posicion: 0 de 40 en la prueba de pantalla del autor; no fue entrenado con capturas de pantalla y la app openTARS hace clic por nombres de accesibilidad.
- El audio solo se ha probado con frases sinteticas cortas; no hay mediciones con voces reales, ruido ni grabaciones largas, y llama.cpp marca la entrada de audio como experimental.
- Las tareas de editor de texto y las de "mirar este archivo de imagen" fallan en ocasiones en la prueba de 80 tareas (68/80).
- Riesgo de alucinacion: se registraron 6 respuestas inventadas o erroneas de 48 preguntas con el modelo solo y 7 dentro de la app; la aplicacion anade avisos y comprobaciones web.
- Cobertura linguistica limitada a portugues e ingles; no se declara soporte de castellano.
- Entrenamiento de una sola epoca y con parte de los ejemplos largos excluidos, lo que puede limitar el rendimiento en prompts extensos.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4 E4B y de los datos de entrenamiento propios de MastLLM antes de desplegarlo en produccion.
- No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K); las cifras disponibles son pruebas internas del autor y no comparables con terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenTARS/Gargantua-2.5
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Perfil del autor en Hugging Face: https://huggingface.co/Mast-LLM
- Pagina del proyecto openTARS: https://mastllm.github.io/OpenTARS/
- Version en Ollama: `ProjectOpenTARS/Gargantua-2.5:latest`
