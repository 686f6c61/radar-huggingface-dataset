# AustinFu/Qev-9B

## Resumen

Qev-9B es un modelo de decision desarrollado por AustinFu (Austin Scamander) que se construye sobre el modelo base Qwen/Qwen3.5-9B-Base mediante un adaptador LoRA de rango 64 y alpha 128, junto con una cabeza de decision y una puerta de interaccion entrenadas de forma especifica. En lugar de generar texto conversacional, el modelo recibe un contexto, una o varias preguntas y un conjunto de opciones de respuesta, y devuelve la opcion elegida acompanada de una probabilidad para cada alternativa. Soporta tres formatos de tarea: Choice (eleccion entre opciones), Noul (si/no) y Score (valoraciones ordenadas).

La version publicada es la v0.1.0, correspondiente al checkpoint final de investigacion (semilla 17, paso 2327, con la mezcla tardia late1783 repetida tres veces en la segunda mitad del entrenamiento). El paquete de inferencia ocupa aproximadamente 690 MiB e incluye el adaptador, la cabeza de decision y la puerta de interaccion; los pesos del backbone Qwen se descargan por separado desde la revision fijada `68c46c4b3498877f3ef123c856ecfde50c39f404`. El corpus completo de entrenamiento no se distribuye con esta release.

Su relevancia actual es que traslada el paradigma de "System One" (decidir en lugar de conversar) a pesos abiertos con licencia Apache 2.0, en un momento en el que la referencia comercial Jev (TypeSafe AI) solo se ofrece por API. En las siete tareas de decision evaluadas por el autor, Qev-9B supera a su propio backbone Qwen3.5-9B-Base en todos los casos, aunque mantiene una distancia considerable frente a Jev en conocimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con adaptador LoRA r=64, alpha=128, cabeza de decision propia y puerta de interaccion; backbone con atencion `last-full-attention` |
| Parametros totales | No disponible de forma explicita; el modelo base Qwen3.5-9B-Base indica del orden de 9.000 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el adaptador se almacena en FP32 y el backbone se ejecuta en BF16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter/`, `head.safetensors`, `joint.safetensors`) mas `model.json` y `tokenizer/` |

## Arquitectura y entrenamiento

Qev no es un modelo generativo de proposito general, sino un adaptador sobre Qwen3.5-9B-Base. Sobre el backbone se anade un LoRA de rango 64 y alpha 128, una cabeza de decision compuesta por una proyeccion compartida de 4096 a 256 dimensiones, dos capas Transformer de 4 cabezas cada una y un scorer escalar, y una puerta de interaccion que modula el uso del backbone. La interaccion con el backbone se realiza mediante `last-full-attention`. El backbone se computa en BF16, mientras que la cabeza de decision y las reducciones clave se calculan en FP32; los tensores de adaptacion se almacenan tambien en FP32. El cargador de Qev descarga este checkpoint y el Qwen base fijado por separado, y por defecto emplea cache de prefijo compartido.

En cuanto al entrenamiento, la particion principal consta de 34.546 registros y la particion tardia de 1.419 registros de alineacion mas 364 juicios de cumplimiento de reglas. El esquema es de dos epocas con batch global 32 y semilla 17; la mezcla tardia comienza a mitad del entrenamiento principal y repite tres veces los ejemplos tardios. El checkpoint seleccionado es el paso 2327, con identificador de ejecucion `c21-science-wk-late1783-9b-4gpu-r64-late50x3-s17`, entrenado en 4 GPU. Las particiones principal y tardia comparten intencionadamente 249 registros de replay. No se documenta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Decision entre opciones explicitas (tipo Choice): devuelve la opcion seleccionada y la probabilidad asignada a cada alternativa.
- Juicio binario si/no (tipo Noul) con una probabilidad asociada.
- Puntuacion ordenada (tipo Score) con rubrica, orientada a valoraciones y ratings.
- Resolucion de varias preguntas en una sola peticion mediante el campo `questions` del JSON de entrada, con instrucciones y criterios por pregunta.
- Soporte de criterios etiquetados por opcion (por ejemplo, asignar cada alternativa a una categoria).
- Interfaz Python (`from qev import Qev; model.predict(...)`) y linea de comandos con entrada/salida JSONL (`python -m qev.predict`).
- Idiomas de trabajo: ingles y chino.
- No dispone de generacion libre de texto, tool calling, capacidades de agente multi-paso, vision ni audio segun la informacion disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: dada la descripcion del problema y un conjunto de equipos o departamentos posibles, el modelo devuelve el equipo asignado y la probabilidad de cada uno. El ejemplo oficial usa un caso de cobro duplicado y discrimina entre facturacion y envios.
- Moderacion y cumplimiento de reglas: la particion tardia incluye 364 juicios de cumplimiento de reglas, por lo que el modelo puede emplearse para determinar si un contenido o una accion cumple una politica interna mediante el formato Noul.
- Clasificacion de intenciones en asistentes conversacionales: en lugar de generar una respuesta, se usa Qev para elegir entre intenciones predefinidas y derivar la conversacion al flujo correspondiente.
- Evaluacion automatica con rubrica (LLM-as-judge): el formato Score permite puntuar respuestas generadas por otros modelos segun criterios ordenados, con probabilidades por nivel que facilitan el analisis de confianza.
- Inferencia de relacion textual (entailment): el modelo obtiene 72,66 en WANLI con 256 ejemplos, lo que lo hace utilizable para tareas de NLI y deteccion de contradicciones en pipelines de verificacion.
- Automatizacion por lotes en produccion: la CLI `python -m qev.predict` con entrada y salida JSONL permite procesar grandes volumenes de peticiones de decision de forma desacoplada.
- Sistemas de recomendacion con criterios: el campo `criteria` admite asociar descripciones a cada opcion, lo que sirve para elegir productos, planes o rutas segun restricciones declaradas.

## Benchmarks y rendimiento

Resultados de exactitud (%) registrados por el autor para el checkpoint publicado. La comparacion en negrita enfrenta Qev-9B con Kev-9B.

| Benchmark | Jev (referencia) | Qwen3.5-9B-Base | Qev-9B | Kev-9B |
|---|---:|---:|---:|---:|
| Decision development · clean | 84,49 | 77,69 | **87,42** | 87,18 |
| Transfer development · clean | 85,67 | 74,39 | **83,99** | 82,16 |
| MMLU-Pro · 1.000 | 83,50 | 50,40 | **54,60** | 51,10 |
| SemIf · 144 manuscritos | 96,53 | 90,28 | **93,75** | 90,97 |
| scienthoon · 873 | 75,26 | 68,84 | 72,28 | **75,49** |
| WANLI · 256 | 75,78 | 67,97 | **72,66** | 70,31 |
| JevBench publico · 231 | 85,71 | 75,76 | **81,39** | 75,76 |

Notas del autor: JevBench se reporta como exactitud sobre el conjunto publico (188 aciertos de 231 preguntas) y no como puntuacion compuesta oficial. Los resultados corresponden a una ejecucion causal completa de referencia, con una sola semilla, y los benchmarks publicos se observaron durante la iteracion de investigacion. Las comparaciones no aislan las ganancias atribuibles a la arquitectura. Ademas, Qev-9B usa computacion de backbone en BF16 mientras que Kev-9B usa FP32.

## Requisitos de hardware

- El paquete de inferencia publicado ocupa aproximadamente 690 MiB (adaptador LoRA, `head.safetensors`, `joint.safetensors`, configuracion y tokenizer). El backbone Qwen3.5-9B-Base se descarga aparte.
- Estimacion de VRAM para el backbone de ~9.000 millones de parametros, calculada a partir del tamano (no publicada por el autor): unos 18 GB en BF16, unos 36 GB en FP32, unos 9 GB en int8 y entre 4,5 y 5,5 GB en int4. Hay que anadir margen para la cabeza de decision en FP32, las reducciones y el KV cache.
- GPU recomendadas segun esa estimacion: A100 40/80 GB y H100 para BF16 sin cuantizar con margen amplio; RTX 4090, RTX 3090 y RTX A6000 (24-48 GB) para BF16 en consumer o semiprofesional; GPU de 8-16 GB solo con cuantizacion agresiva del backbone.
- El entrenamiento se realizo en 4 GPU segun el identificador de ejecucion, aunque no se detalla el modelo de GPU.
- Opciones de despliegue: el proyecto proporciona su propio cargador (`qev.Qev.from_pretrained`) y una interfaz CLI/JSONL (`python -m qev.predict`) con `--device cuda` y `--weights-dtype checkpoint`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni se publican variantes GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro · 1.000 | JevBench publico · 231 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qev-9B | ~9B de base mas adaptador LoRA r=64 | No disponible | 54,60 | 81,39 | Apache 2.0 | Pesos abiertos en HuggingFace |
| Kev-9B | ~9B | No disponible | 51,10 | 75,76 | No disponible | Pesos abiertos en GitHub |
| Qwen3.5-9B-Base | ~9B | No disponible | 50,40 | 75,76 | No disponible en la informacion facilitada | Pesos abiertos |
| Jev (TypeSafe AI) | No disponible | No disponible | 83,50 | 85,71 | Propietaria, solo API | API de pago desde el 21 de septiembre de 2026, 0,042 USD por millon de tokens de entrada y salida gratuita |

Nota: el README del proyecto Kev cita valores de MMLU sin el sufijo "Pro" (Kev-9B 0,74, Kev-27B 0,84, Jev 0,90), que no son comparables directamente con los valores de MMLU-Pro de esta tabla. La familia Kev se distribuye en tamanos de 0,8B, 4B y 9B segun las fuentes consultadas, ademas de una variante de 27B mencionada en su README.

## Limitaciones y advertencias

- El modelo no es conversacional: no genera respuestas abiertas ni texto libre, por lo que no puede usarse como chatbot. Solo elige, puntua o emite un si/no sobre opciones proporcionadas.
- La composicion del corpus de entrenamiento no se distribuye y solo se conocen los recuentos (34.546 registros principales, 1.419 de alineacion y 364 de cumplimiento de reglas). Esto impide auditar sesgos o cobertura tematica.
- El autor advierte de que los benchmarks publicos se observaron durante la iteracion de investigacion, lo que implica riesgo de sobreajuste a esos conjuntos y limita la interpretacion de las cifras como rendimiento generalizable.
- Los resultados proceden de una unica semilla (17) y un unico checkpoint (paso 2327), sin intervalos de confianza ni repeticiones.
- Las comparaciones no aislan las ganancias de arquitectura, y Qev-9B usa BF16 en el backbone mientras que Kev-9B usa FP32, por lo que las diferencias de precision de computo pueden influir.
- El conocimiento general es claramente inferior al de la referencia Jev: 54,60 frente a 83,50 en MMLU-Pro. El rendimiento en tareas de conocimiento depende en gran medida del backbone, no del adaptador.
- Idiomas limitados a ingles y chino. No hay garantias de comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de calibracion deficiente en las probabilidades: no se publican metricas de calibracion (ECE, Brier) ni diagramas de fiabilidad.
- La licencia del adaptador es Apache 2.0, lo que permite uso comercial, pero la licencia del modelo base Qwen3.5-9B-Base no se detalla en la informacion facilitada y debe verificarse por separado antes de un despliegue en produccion.
- No hay variantes cuantizadas ni GGUF publicadas, y el cargador espera una revision concreta del backbone, lo que limita la portabilidad a otros runtimes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AustinFu/Qev-9B
- Repositorio fuente y documentacion: https://github.com/QiqianFu/Qev
- Documentacion en chino: https://github.com/QiqianFu/Qev/blob/main/README.zh-CN.md
- Ejemplos de los tres formatos de tarea (JSONL): https://github.com/QiqianFu/Qev/blob/main/examples/requests.jsonl
- Guia de entrenamiento: https://github.com/QiqianFu/Qev/blob/main/docs/training.md
- Receta de datos: https://github.com/QiqianFu/Qev/blob/main/docs/data.md
- Resultados, fuentes y comandos de reproduccion: https://github.com/QiqianFu/Qev/blob/main/docs/evaluation.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Perfil del autor en HuggingFace: https://huggingface.co/AustinFu
- Open-Jev-9B (modelo relacionado): https://huggingface.co/ZefanCai/Open-Jev-9B
- Repositorio de la familia Kev: https://github.com/jaredpalmer/kev/tree/main
- Analisis de la familia Kev: https://www.explainx.ai/blog/kev-open-source-jev-clone-qwen35-family-2026
- Sitio de Jev (TypeSafe AI), modelo de referencia: https://jevmodel.org/
