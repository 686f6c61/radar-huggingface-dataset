# jvr0x/Javi0.2-4B-GGUF

## Resumen

Javi0.2-4B es un ajuste fino orientado a agentes sobre Qwen/Qwen3.5-4B, publicado por el usuario jvr0x bajo licencia Apache 2.0. Se distribuye unicamente en formato GGUF, con dos cuantizaciones (Q8_0 y Q4_K_M), y esta disenado para funcionar dentro de agentes de programacion e investigacion (grok build, omp y opencode) que aportan sus propios system prompts y herramientas. El autor declara 4.326.350.848 parametros (~4,33 B) y hereda del modelo base una ventana de contexto de 262.000 tokens, aunque el ajuste se entreno con conversaciones de hasta 72.000 tokens.

El objetivo del entrenamiento es corregir tres comportamientos del modelo base: consultar herramientas antes de responder a preguntas sensibles al tiempo (versiones, precios, cargos), admitir cuando no puede verificar algo en lugar de entrar en bucles, y razonar corrigiendo premisas falsas antes de contestar. El modelo se presenta explicitamente como una version alfa y como un experimento de aprendizaje realizado en una unica NVIDIA DGX Spark.

Su relevancia practica esta en el nicho: es un modelo pequeno, con licencia permisiva y con soporte de tool calling documentado, pensado para integrarse en cualquier cliente compatible con la API de OpenAI. El propio autor advierte, no obstante, que la mejora en comportamiento viene acompanada de un empeoramiento medido en la calidad de las respuestas finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion lineal + atencion completa). 32 capas, de las cuales solo 8 usan atencion completa; el resto usa atencion lineal con estado de tamano fijo |
| Parametros totales | 4.326.350.848 (~4,33 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.000 tokens en el modelo base; el ajuste se entreno con conversaciones de hasta 72.000 tokens |
| Tipos de cuantizacion | GGUF Q8_0 y Q4_K_M (cuantizadas desde un GGUF F16 del modelo fusionado) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura hibrida: de sus 32 capas, solo 8 utilizan atencion completa y las 24 restantes atencion lineal con un estado de tamano fijo. Esto reduce de forma notable el coste de la cache KV, que queda en 32 KiB por token (8 capas x 4 cabezas KV x 256 dimensiones x K y V x 2 bytes). El autor indica que, si se usa `-ctk q8_0 -ctv q8_0`, ese consumo se reduce a la mitad. El ajuste no incluye la torre de vision del modelo base: el resultado es exclusivamente de texto.

El proceso de creacion combina varias tecnicas. Se partio de un LoRA (con Unsloth, segun las etiquetas del repositorio) que se fusiono en el modelo base en bf16, no sobre una copia de 4 bits; a partir de ahi se genero un GGUF F16 y de el se derivaron las dos cuantizaciones publicadas. El autor menciona ademas un paso de captura de cliente: un servidor intermedio registro las peticiones exactas que envian grok build, omp y opencode (system prompts incluidos), y el modelo se entreno con esos formatos reales en lugar de con un prompt de entrenamiento propio, que era la limitacion principal de la version anterior (Javi0.1). La etiqueta `distillation` sugiere uso de destilacion, pero la model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO: no disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con `enable_thinking` desactivado en entrenamiento y evaluacion.
- Uso de herramientas (tool calling / function calling) en formatos de cliente reales: grok build, omp, opencode y formato OpenAI generico.
- Busqueda web y recuperacion de paginas antes de responder a preguntas sensibles al tiempo (versiones, precios, cargos actuales).
- Comportamiento de agente multi-paso con shell en sandbox sobre pequenos proyectos de codigo.
- Gestion de fallos de herramientas: cuando la busqueda esta bloqueada o una pagina devuelve 403, se detiene y declara lo que no ha podido verificar, en lugar de iterar en bucle.
- Razonamiento desde primeros principios: comprueba la premisa de la pregunta y la corrige si es falsa.
- Tono positivo mantenido sin alterar hechos verificables.
- Capacidad multilingue: solo ingles declarado;  no disponible para otros idiomas.
- Vision: no incluida (la torre de vision del modelo base se ha eliminado).

## Casos de uso

- Agentes de programacion en terminal: el modelo fue entrenado con los formatos exactos de omp y opencode, por lo que puede sostener sesiones multi-turno con salidas largas de herramientas y hasta 72.000 tokens de historial sin perder el formato de las llamadas.
- Investigacion web asistida: ante preguntas del tipo "cual es la ultima version de X" o "quien ocupa ahora el cargo Y", lanza busquedas o recupera paginas en vez de responder de memoria (1 fallo en 64 en la evaluacion del autor).
- Servidores compatibles con OpenAI: se puede levantar con `llama-server` y apuntar cualquier cliente OpenAI a `http://localhost:8080/v1`, lo que simplifica la sustitucion de modelos en pipelines ya existentes.
- Automatizacion con herramientas potencialmente caidas: su comportamiento ante busquedas bloqueadas o errores 403 (0 de 22 casos en bucle) lo hace util en entornos donde las APIs externas fallan de forma intermitente.
- Prototipado en hardware de consumo: con 2,6 GiB de pesos en Q4_K_M y ~3,6 GiB a 32k de contexto, cabe en GPUs de gama media para pruebas de agentes sin infraestructura dedicada.
- Extraccion y verificacion de datos con trazabilidad: al declarar explicitamente lo que no ha podido comprobar, encaja en flujos donde se prefiere una respuesta incompleta y marcada como tal antes que una afirmacion no fundamentada.
- Tareas de codigo en sandbox: la evaluacion incluye shell en sandbox sobre proyectos pequenos, util para scripts de mantenimiento o reproducir incidencias en un entorno controlado.

## Benchmarks y rendimiento

Los datos proceden de la evaluacion del propio autor: 136 preguntas no vistas, ejecutadas en formatos de cliente reales (grok, omp, opencode, OpenAI generico y chat simple) con herramientas en vivo (busqueda web, recuperacion de paginas y shell en sandbox). Algunas preguntas fuerzan fallos de herramienta de forma deliberada. Las respuestas fueron evaluadas por DeepSeek-V4.1-Flash como juez.

Comportamiento (recuento sobre las transcripciones):

| Metrica | Qwen3.5-4B base | Javi0.1 | Javi0.2 |
|---|---|---|---|
| Tareas terminadas | 120/136 | 117/136 | 134/136 |
| Preguntas sensibles al tiempo respondidas de memoria | 15/64 | 9/64 | 1/64 |
| Bucles cuando las herramientas estan bloqueadas | 12/22 | 12/22 | 0/22 |
| Llamadas a herramienta por tarea | 3,3 | 4,0 | 2,1 |

Calidad de respuesta (juez DeepSeek-V4.1-Flash, criterio estricto: requiere hechos fundamentados, honestidad sobre lagunas, buen uso de herramientas y buen tono):

| Metrica | Qwen3.5-4B base | Javi0.1 | Javi0.2 |
|---|---|---|---|
| Aprobadas | 39/136 | 41/136 | 18/136 |
| Fundamentacion (0-2) | 0,89 | 0,98 | 0,55 |
| Honestidad (0-2) | 0,85 | 1,00 | 1,05 |
| Uso de herramientas (0-2) | 0,89 | 1,03 | 0,70 |
| Tono (0-2) | 1,54 | 1,56 | 1,38 |

Rendimiento de inferencia declarado: 66,5 tok/s en Q4_K_M y 45,5 tok/s en Q8_0 (decodificacion medida con `llama-bench`, 256 tokens, 3 ejecuciones, en NVIDIA DGX Spark GB10 con 128 GB de memoria unificada, descarga completa en GPU y flash attention activado). El prefill ronda los 4.000 tok/s en ambas cuantizaciones. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria estimada (pesos + cache KV en F16), segun la tabla del autor:
  - Q4_K_M: 2,6 GiB de pesos; ~3,6 GiB a 32k de contexto; ~6,6 GiB a 128k; ~10,6 GiB a 262k.
  - Q8_0: 4,3 GiB de pesos; ~5,3 GiB a 32k; ~8,3 GiB a 128k; ~12,3 GiB a 262k.
- Uso con `-ctk q8_0 -ctv q8_0`: reduce aproximadamente a la mitad la memoria de la cache KV.
- GPU de consumo: si, la cuantizacion Q4_K_M con contexto de 32k ocupa ~3,6 GiB, por lo que entra en tarjetas de 8 GB o superiores. Q8_0 a 32k (~5,3 GiB) tambien cabe en 8 GB, con menos margen.
- GPU profesionales citadas indirectamente: NVIDIA DGX Spark (GB10, 128 GB de memoria unificada) es la plataforma de referencia del autor. No se publican pruebas en A100, H100 o RTX 4090: no disponible.
- Opciones de despliegue documentadas: llama.cpp (`llama-server -hf jvr0x/Javi0.2-4B-GGUF:Q8_0 --jinja -c 131072 --chat-template-kwargs '{"enable_thinking": false}' --temp 0.2 --top-p 0.8 --top-k 20 --min-p 0`) y cualquier cliente compatible con la API de OpenAI apuntando a `http://localhost:8080/v1`. Otros motores (vLLM, TGI, Ollama) no estan confirmados por el autor.
- Parametros de muestreo recomendados: temperatura 0,2 (mantiene las llamadas a herramienta bien formadas), top-p 0,8, top-k 20, min-p 0.
- Latencia y throughput: 45,5 tok/s (Q8_0) y 66,5 tok/s (Q4_K_M) en DGX Spark; ~4.000 tok/s de prefill. Cifras no extrapolables a otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento (tareas terminadas) | Calidad (aprobadas) | Licencia | Formato |
|---|---|---|---|---|---|---|
| Javi0.2-4B | ~4,33 B | 262k (base); entrenado hasta 72k | 134/136 | 18/136 | Apache 2.0 | GGUF |
| Javi0.1 | ~4,33 B (mismo base) | no disponible | 117/136 | 41/136 | Apache 2.0 | GGUF |
| Qwen3.5-4B (base) | ~4,33 B | 262k | 120/136 | 39/136 | Apache 2.0 | safetensors y otras |

La comparacion relevante es interna: frente al modelo base y a la version anterior, Javi0.2 mejora de forma clara en finalizacion de tareas (134 frente a 120 y 117), elimina los bucles ante herramientas bloqueadas (0/22 frente a 12/22) y reduce a 1/64 las respuestas de memoria a preguntas sensibles al tiempo (frente a 15/64 y 9/64). En cambio, empeora en calidad juzgada estricta (18/136 frente a 39/136 y 41/136), fundamentacion (0,55 frente a 0,89 y 0,98) y uso de herramientas (0,70 frente a 0,89 y 1,03). No se dispone de comparaciones con otros modelos de ~4 B en la informacion proporcionada.

## Limitaciones y advertencias

- Version alfa declarada por el autor: es un experimento, no un modelo terminado.
- Alucinacion en las soluciones propuestas: cuando no puede verificar algo, tiende a rellenar la lista de "formas de obtener la respuesta" con URL y endpoints de API inventados. El juez lo penaliza con dureza.
- Respuestas finales aproximadamente 3 veces mas largas que las del modelo base.
- Se detiene demasiado pronto en algunos casos y las alternativas que sugiere no siempre son reales.
- Rendimiento global bajo en calidad segun la propia evaluacion: 18/136 aprobadas con criterio estricto, por debajo del modelo base (39/136) y de Javi0.1 (41/136).
- Dependencia de herramientas: en un chat sin herramientas solo puede responder con lo que sabe, y avisa cuando una pregunta requiere consulta.
- Fuera de contexto de entrenamiento: el ajuste cubre hasta 72.000 tokens; por encima depende de la capacidad de contexto largo del modelo base, sin garantia de comportamiento.
- Idioma: solo ingles declarado. No hay soporte multilingue documentado.
- Sin vision: la torre de vision del modelo base no esta incluida.
- Temperatura baja obligatoria (0,2) para mantener llamadas a herramienta bien formadas; valores mas altos pueden degradarlas.
- Licencia Apache 2.0: permisiva y sin restricciones documentadas para uso comercial, pero se aplica sobre un modelo base cuya licencia conviene verificar por separado.
- Evaluacion con juez automatico (DeepSeek-V4.1-Flash) sobre 136 preguntas: muestra pequena y dependiente del criterio del juez.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jvr0x/Javi0.2-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- grok build: https://x.ai
- omp (coding agent): https://www.npmjs.com/package/@oh-my-pi/pi-coding-agent
- opencode: https://opencode.ai
- Imagen de portada de la model card: https://huggingface.co/jvr0x/Javi0.2-4B-GGUF/resolve/main/javi02-cover.png
