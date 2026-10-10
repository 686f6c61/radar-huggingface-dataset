# glyd/Qwen3.5-27B-swift

## Resumen

Qwen3.5-27B-swift es un checkpoint cuantizado del modelo Qwen/Qwen3.5-27B publicado por el usuario glyd bajo el identificador glyd/Qwen3.5-27B-swift. No se trata de un modelo entrenado desde cero, sino de una compresion con perdida ("lossy") de los pesos originales en bf16, realizada una sola vez y etiquetada por el autor como nivel "swift" dentro de su catalogo de cuantizaciones. El resultado ocupa 18,6 GB, un 65 % menos que los 53,8 GB del bf16 original, con una media de aproximadamente 5,5 bits por peso.

El interes practico del checkpoint esta en su compromiso entre tamano, fidelidad y velocidad: la divergencia KL frente a bf16 medida sobre WikiText-2 es de 0,0173, y el modelo alcanza 46 tokens/s en una RTX 4090 con 20,8 GB de memoria en uso a 4k de contexto, admitiendo ventanas de hasta 32k en RTX 4090, L40S y RTX A6000. Frente a la cuantizacion "kestrel" del mismo autor (22,0 GB, KL 0,00789, 40 tokens/s), swift sacrifica algo de fidelidad a cambio de menos espacio y mas velocidad.

La limitacion principal es de ecosistema: el checkpoint solo funciona con el motor propietario de Glyd (`glyd run`), sobre Linux con GPU NVIDIA y driver 580 o superior, y el autor indica explicitamente que todavia no es compatible con vLLM ni con transformers. Ademas, es un modelo solo de texto: la parte de vision del modelo base no esta incluida en este repositorio. Los pesos se distribuyen bajo licencia Apache-2.0, pero el motor necesario para ejecutarlos es BUSL-1.1, gratuito solo para uso personal y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiquetado como `qwen3_5` y derivado de Qwen/Qwen3.5-27B |
| Parametros totales | 26.895.998.464 segun la model card; 18.525.438.770 segun el recuento de safetensors del Hub (el autor indica que las etiquetas del Hub cuentan bytes empaquetados) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 32k de contexto soportados en RTX 4090, L40S y RTX A6000; el maximo del modelo base no se especifica |
| Tipos de cuantizacion | Cuantizacion unica desde bf16 a ~5,5 bits por peso; el Hub la etiqueta como "8-bit" |
| Idiomas soportados | No disponible |
| Licencia | Pesos: Apache-2.0. Motor Glyd necesario para ejecutarlos: BUSL-1.1 (gratuito para uso personal y no comercial) |
| Formato de pesos | safetensors (`library_name: glyd`) |
| Tamano del repositorio | 18,6 GB (un 65 % menos que los 53,8 GB en bf16) |
| Fidelidad | Divergencia KL frente a bf16 de 0,0173 sobre WikiText-2 |

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. La unica referencia tecnica es la etiqueta `qwen3_5` del Hub y el enlace al checkpoint Qwen/Qwen3.5-27B (commit `fc05daec18b0a78c049392ed2e771dde82bdf654`), del que este repositorio es una cuantizacion. Tampoco se detallan los datos de entrenamiento del modelo original: numero de tokens, composicion del dataset, uso de RLHF o DPO ni innovaciones como decodificacion especulativa o atencion lineal.

Lo que si esta documentado es el proceso de cuantizacion. El autor indica que la compresion se hizo "una sola vez desde los pesos originales en bf16", con un resultado de aproximadamente 5,5 bits por peso. Se trata de una cuantizacion con perdida: el propio autor la califica como "not lossless" y cuantifica la perdida con una divergencia KL de 0,0173 frente a bf16 medida sobre WikiText-2. La model card advierte ademas que las etiquetas "8-bit precision" y "Model size" del Hub cuentan bytes empaquetados, lo que explica la discrepancia entre el recuento de parametros de safetensors y el numero declarado en la model card.

## Capacidades

- Generacion de texto conversacional: la pipeline declarada es `text-generation` con etiqueta `conversational`, por lo que esta orientado a dialogos multi-turno.
- Razonamiento y generacion de codigo: se heredan del modelo base Qwen3.5-27B, si bien no se aportan evaluaciones especificas en la informacion disponible.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Tool calling y function calling: no confirmado en la documentacion de este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Modo de pensamiento (thinking): no confirmado.
- Vision: no soportada. La model card indica explicitamente que la parte de vision del modelo base no esta incluida; es un checkpoint solo de texto.
- Contexto largo: soporta ventanas de 32k tokens en las GPU probadas por el autor.

## Casos de uso

- Despliegue en una unica GPU de gama alta para asistencia conversacional: con 20,8 GB de memoria en uso a 4k de contexto, el modelo cabe entero en una RTX 4090 y permite servir un asistente de chat sin repartir el modelo entre varias GPU.
- Procesado de documentos largos en local: la ventana de 32k tokens admite resumir o extraer informacion de informes, contratos o documentacion tecnica extensa en una sola pasada, sin necesidad de trocear el texto en fragmentos con perdida de contexto.
- Generacion de codigo en estaciones de trabajo de desarrollo: al ejecutarse en una RTX 4090 o RTX A6000, encaja en flujos donde el codigo no puede salir de la maquina por requisitos de confidencialidad.
- Prototipado e investigacion en un solo equipo: la combinacion de 46 tokens/s y 482 ms hasta el primer token en RTX 4090 permite iterar sobre prompts y cadenas de razonamiento con una latencia interactiva.
- Analisis de texto y clasificacion por lotes: con 34-46 tokens/s segun GPU, es viable procesar volumenes moderados de texto para tareas de extraccion o etiquetado, aunque no se documenta soporte de tool calling que automatice el postprocesado.
- Evaluacion comparativa de tecnicas de cuantizacion: dado que el mismo autor publica los niveles kestrel y swift sobre el mismo modelo base, el checkpoint sirve como referencia reproducible para estudiar el intercambio entre tamano, divergencia KL y velocidad.
- Despliegue en servidores con L40S o RTX A6000: el autor reporta 36 tokens/s (428 ms al primer token) en L40S y 34 tokens/s (725 ms) en RTX A6000, con soporte de 32k de contexto, lo que permite dimensionar servicios internos sin GPU de centro de datos de gama muy alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos son de tamano, fidelidad frente a bf16 y velocidad de inferencia.

Comparativa de cuantizaciones del mismo modelo base aportada por el autor:

| Version | Tamano | Reduccion frente a bf16 | KL frente a bf16 | RTX 4090 |
|---|---|---|---|---|
| bf16 (original) | 53,8 GB | – | 0 | – |
| Qwen FP8 | 29,5 GB | 45 % | No disponible | – |
| kestrel | 22,0 GB | 59 % | 0,00789 | 40 tokens/s |
| swift (este repositorio) | 18,6 GB | 65 % | 0,0173 | 46 tokens/s |

Rendimiento medido por el autor el 2026-10-09 con glyd 0.29.4, una GPU por prueba y contexto de 4k tokens:

| GPU | Tokens/s | Primer token | Memoria a 4k | Contexto de 32k |
|---|---|---|---|---|
| RTX 4090 | 46 | 482 ms | 20,8 GB | Si |
| L40S | 36 | 428 ms | 20,9 GB | Si |
| RTX A6000 | 34 | 725 ms | 20,7 GB | Si |

## Requisitos de hardware

- VRAM estimada para inferencia: 20,8 GB en RTX 4090, 20,9 GB en L40S y 20,7 GB en RTX A6000, en todos los casos con contexto de 4k tokens y contando la memoria de GPU en uso.
- GPU recomendadas: RTX 4090, L40S y RTX A6000, las tres verificadas por el autor con soporte de contexto de 32k.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB de VRAM). No se documenta su comportamiento en GPU con menos de 24 GB.
- Sistema operativo y controladores: Linux con GPU NVIDIA y driver 580 o superior.
- Opciones de despliegue: unicamente el motor propietario de Glyd (`glyd run Qwen/Qwen3.5-27B:swift`). El autor indica explicitamente que no es compatible con vLLM ni con transformers "todavia". No se mencionan llama.cpp, Ollama ni TGI.
- Instalacion: `curl -LsSf https://getglyd.com/install.sh | sh`.
- Latencia y throughput: 46 tokens/s con 482 ms hasta el primer token en RTX 4090; 36 tokens/s con 428 ms en L40S; 34 tokens/s con 725 ms en RTX A6000. El modelo mas comprimido del mismo autor, kestrel, rinde 40 tokens/s en RTX 4090, por lo que swift es aproximadamente un 15 % mas rapido en esa GPU.

## Comparativa con modelos similares

La informacion disponible solo permite comparar este checkpoint con otras versiones del mismo modelo base y con la cuantizacion alternativa del mismo autor.

| Modelo | Parametros | Contexto | KL frente a bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glyd/Qwen3.5-27B-swift | 26.895.998.464 (model card) | 32k en RTX 4090, L40S, A6000 | 0,0173 | Apache-2.0 (pesos); motor BUSL-1.1 | HuggingFace; solo motor Glyd |
| glyd/Qwen3.5-27B-kestrel | Mismo modelo base | No especificado | 0,00789 | Apache-2.0 (pesos); motor BUSL-1.1 | HuggingFace; solo motor Glyd |
| Qwen/Qwen3.5-27B (bf16) | 26.895.998.464 (segun esta model card) | No especificado | 0 (referencia) | Apache-2.0 | HuggingFace |
| Qwen FP8 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos sobre modelos alternativos de otros desarrolladores con tamano o tarea comparables.

## Limitaciones y advertencias

- Cuantizacion con perdida: la divergencia KL de 0,0173 frente a bf16 sobre WikiText-2 implica que las probabilidades del siguiente token se alejan de las del modelo original. Para tareas sensibles a la calibracion (por ejemplo, puntuaciones de verosimilitud o filtrado por umbral), esta desviacion puede ser relevante.
- Ecosistema cerrado: no funciona con vLLM ni con transformers, y el autor no indica plazos para su soporte. La integracion exige el motor de Glyd, disponible solo en Linux con GPU NVIDIA y driver 580 o superior.
- Restricciones de licencia del motor: aunque los pesos son Apache-2.0, el motor necesario para ejecutarlos es BUSL-1.1, gratuito solo para uso personal y no comercial en equipos propios. El uso comercial requiere licencia de Glyd, lo que condiciona cualquier despliegue en produccion.
- Modelo solo de texto: la componente de vision del modelo base no se incluye, por lo que no pueden procesarse imagenes.
- Idiomas no declarados: el repositorio no especifica que lenguas soporta; no hay garantia documentada de cobertura multilingue.
- Sin benchmarks de calidad publicados: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de sesgo o alucinacion. La calidad real de las respuestas no esta caracterizada en la informacion disponible.
- Ambiguedad en el recuento de parametros: el Hub reporta 18.525.438.770 y la model card 26.895.998.464. El autor atribuye la diferencia a que las etiquetas del Hub cuentan bytes empaquetados, pero conviene verificarlo antes de dimensionar infraestructura.
- Adopcion nula: cero descargas y cero "likes" en el momento de los datos, sin historial de uso en produccion ni validacion por terceros.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de un modelo de generacion de texto.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos eran contenido no relacionado, por lo que no se ha podido contrastar la informacion con fuentes externas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/glyd/Qwen3.5-27B-swift
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Commit concreto del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/tree/fc05daec18b0a78c049392ed2e771dde82bdf654
- Cuantizacion alternativa del mismo autor (kestrel): https://huggingface.co/glyd/Qwen3.5-27B-kestrel
- Sitio del motor Glyd: https://getglyd.com
- Script de instalacion: https://getglyd.com/install.sh
- La busqueda web no devolvio enlaces relevantes sobre este modelo.
