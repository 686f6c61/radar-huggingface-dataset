# scribekey/sotto-scribekey-350m-gguf

## Resumen

Sotto 350M, tune de ScribeKey, en formato GGUF es un ajuste fino de `juanquivilla/sotto-cleanup-lfm25-350m`, un modelo de 354.483.968 parametros (etiquetado comercialmente como 350M) construido sobre la base LFM2.5-350M-Base de Liquid AI. Lo desarrolla ScribeKey y su proposito es muy concreto: limpiar texto dictado (transcripciones ASR) antes de insertarlo en el campo de texto de una aplicacion. No es un modelo conversacional generalista, sino un post-procesador de dictado que elimina muletillas, repeticiones y errores de reconocimiento, y que ademas resuelve autocorrecciones habladas del estilo "envia el borrador a Alex, digo, a Jordan" para producir "Envia el borrador a Jordan".

El modelo se distribuye unicamente en un fichero GGUF cuantizado a Q8_0 (379.215.776 bytes) y esta pensado para inferencia en el dispositivo (on-device) mediante llama.cpp. Forma parte del motor "Smart Cleanup" de la aplicacion ScribeKey para Android, lo que explica sus prioridades de diseno: huella de memoria minima, latencia de decenas o centenas de milisegundos en CPU y comportamiento determinista con decodificacion greedy.

Su relevancia practica esta en el nicho de post-procesado de ASR con requisitos de privacidad y coste: al ejecutarse localmente en un modelo de 350M, evita enviar transcripciones a la nube y compite con alternativas de mayor tamano en una tarea cerrada y medible. La model card publica una evaluacion propia (CleanBench v1) con 3.366 dictados en ingles, asi como las limitaciones conocidas del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en LFM2.5-350M-Base (familia LFM2 de Liquid AI); configuracion de capas no disponible en la informacion proporcionada |
| Parametros totales | 354.483.968 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 0,4 GB |
| Fichero publicado | `sotto-scribekey-350m-Q8_0.gguf` (379.215.776 bytes) |
| SHA-256 | `37f227833e199f261c696d92f5dc8678852bc6b10265ab787f46faf24e18649b` |
| Modelo base | `juanquivilla/sotto-cleanup-lfm25-350m`, revision `6df6f019170b8b55333c047b901886a51750a965` |
| Fecha de publicacion | 2026-10-09 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base LFM2.5-350M-Base de Liquid AI, del que no se detallan en la informacion disponible el numero de capas, el tipo de atencion ni la ventana de contexto. Sobre ese checkpoint se aplico un ajuste fino supervisado mediante LoRA de rango 16 y alpha 32 sobre todas las proyecciones LFM2, durante 2 epocas, con tamano de lote 8, tasa de aprendizaje 2e-4 con decaimiento coseno, en precision fp32 y sobre CPU. El adaptador se fusiono posteriormente en los pesos, de modo que la distribucion final no requiere cargar un LoRA aparte.

Los datos de entrenamiento son 1.782 filas de entrenamiento y 192 de validacion, generadas a partir de las plantillas sinteticas de dictado del propio ScribeKey. Cubren muletillas, repeticiones, autocorrecciones habladas, numeros, cantidades de dinero, horas y fechas dictadas, nombres propios y nombres de producto que deben conservarse, y preguntas y ordenes que deben limpiarse sin ser respondidas ni ejecutadas. La model card indica explicitamente que no se uso ningun corpus de terceros ni texto escrito por otro modelo. No se menciona RLHF ni DPO.

La exportacion se hizo con `convert_hf_to_gguf.py` del arbol de llama.cpp incluido en llama-cpp-python 0.3.36, primero a BF16 y despues con `llama_model_quantize` a Q8_0. El prompt de inferencia es fijo: `<|startoftext|>### Input:\n{transcript}\n\n### Output:\n`, con decodificacion greedy y parada en EOS (`<|im_end|>`) o en `###`; el texto limpio es todo lo anterior a `###`, recortado.

## Capacidades

- Limpieza de dictado: eliminacion de muletillas, tartamudeos y repeticiones propias del habla espontanea.
- Resolucion de autocorrecciones habladas: convierte "a Alex, digo, a Jordan" en la mencion final correcta.
- Normalizacion de entidades dictadas: numeros, cantidades de dinero, horas y fechas.
- Preservacion de nombres propios y nombres de producto que el hablante quiere conservar.
- Deteccion de preguntas y ordenes: las limpia pero no las responde ni las ejecuta.
- Post-procesado de salidas ASR: opera sobre la transcripcion de un modelo de voz, no sobre audio.
- Inferencia en el dispositivo con llama.cpp, sin llamadas a red.
- Generacion de texto condicionada a plantilla (prompt fijo documentado); no esta descrito como asistente conversacional abierto pese a la etiqueta `conversational`.
- Capacidades de tool calling, agentes, vision, audio o razonamiento multi-paso: no disponibles en la informacion proporcionada.

## Casos de uso

- Limpieza de dictado en teclados moviles: es el caso real de uso del modelo, integrado en el "Smart Cleanup" de ScribeKey para Android. El modelo procesa la transcripcion antes de insertarla en el campo de texto, con la latencia baja y la huella de memoria reducida que exige un teclado en segundo plano.
- Post-procesado de transcripciones ASR en general: cualquier pipeline que use un modelo de voz (por ejemplo, un motor de reconocimiento local) puede colocar este modelo a la salida para eliminar muletillas, corregir repeticiones y normalizar numeros y fechas antes de almacenar o mostrar el texto.
- Notas de voz y actas de reunion: el dictado de una reunion suele llegar con abundantes repeticiones y correcciones sobre la marcha; el modelo produce un texto legible y estable en formato para pegar en un gestor de notas.
- Dictado con autocorrecciones en entornos profesionales: redactar correos o mensajes largos por voz genera con frecuencia sustituciones del tipo "el informe de marzo, perdon, de abril"; el modelo aplica la version final sin intervencion manual.
- Asistentes de accesibilidad: para personas con dificultades motoras que escriben exclusivamente por voz, un paso de limpieza local reduce las tasas de error antes de que el texto se envie o se guarde.
- Procesamiento con privacidad estricta: en entornos sanitarios, legales o corporativos donde no se permite enviar texto a servicios en la nube, el modelo se ejecuta integramente en el dispositivo o en el servidor local del cliente.
- Filtrado de ordenes no deseadas en interfaces de voz: el modelo reconoce frases interrogativas o imperativas y las limpia sin ejecutar la accion, lo que sirve como capa de saneamiento previa a un enrutador de comandos.
- Integracion en aplicaciones de escritorio: mediante llama.cpp o llama-cpp-python se puede incrustar como dependencia en un editor, un cliente de correo o una herramienta de documentacion para limpiar dictado en local.

## Benchmarks y rendimiento

La model card publica resultados de CleanBench v1, un banco de pruebas interno de ScribeKey con 3.366 dictados en ingles, pronunciados por sintesis de voz y transcritos por tres modelos de reconocimiento. Las puntuaciones corresponden al texto que la aplicacion acaba insertando, es decir, despues de que la guarda de seguridad de ScribeKey sustituya cualquier salida que introduzca una palabra, un valor o una negacion no dichos por el hablante por una limpieza basada en reglas.

| Metrica (CleanBench v1) | Sotto 350M Q8_0 (base) | Este modelo, Q8_0 |
|---|---|---|
| Texto correcto insertado, todas las filas | 21,6 % | 26,6 % |
| Texto correcto insertado, autocorrecciones | 2,1 % | 10,1 % |
| Texto correcto insertado, preguntas que deben quedar sin responder | 12,1 % | 17,0 % |
| Texto correcto insertado, casos con poco que cambiar | 58,0 % | 61,1 % |
| Texto insertado con un valor ausente en la referencia | 3,9 % | 3,5 % |
| Latencia p50 / p95 (x86, 4 hilos) | 249 / 619 ms | 228 / 568 ms |

Adicionalmente, la model card indica que un segundo evaluador (Jev, de TypeSafe) comparo cada salida con la referencia sobre dictados escritos a mano: este modelo reproduce lo mismo mas a menudo que la base (62 % frente a 58 %) y anade o elimina contenido en la misma proporcion (6 % frente a 6 %). No hay datos publicados de MMLU, HumanEval, GSM8K ni de ningun benchmark estandar generalista, algo esperable dado que el modelo esta especializado en limpieza de dictado.

## Requisitos de hardware

- Peso del fichero Q8_0: 379.215.776 bytes (unos 362 MiB), a los que hay que sumar el overhead de la ventana de contexto y del runtime de llama.cpp.
- Memoria estimada para inferencia: del orden de 0,5 a 1 GB de RAM o VRAM, segun contexto y backend. Valor estimado, no publicado por el autor.
- CPU: funciona sin GPU. La model card reporta una latencia p50 de 228 ms y p95 de 568 ms en x86 con 4 hilos.
- GPU: no se publican cifras de rendimiento en GPU. Por tamano, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con suficiente memoria compartida) puede alojarlo sobradamente; tambien cabe en GPUs de gama baja y en dispositivos moviles compatibles con llama.cpp.
- Despliegue: llama.cpp y llama-cpp-python 0.3.36 (version usada en la exportacion). No se confirman en la informacion proporcionada integraciones especificas con vLLM, TGI, Ollama u otros servidores, aunque el formato GGUF es compatible con el ecosistema llama.cpp.
- Throughput: no disponible. Solo se publican latencias en CPU x86 con 4 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento en CleanBench v1 (todas las filas) |
|---|---|---|---|---|---|
| Sotto 350M, tune de ScribeKey (este modelo) | 354.483.968 | no disponible | GGUF Q8_0 | LFM Open License v1.0 (comercial solo para ingresos anuales < 10 M USD) | 26,6 % texto correcto insertado |
| Sotto 350M (base, `juanquivilla/sotto-cleanup-lfm25-350m`) | 354.483.968 (mismo tamano, segun el modelo derivado) | no disponible | no disponible en esta informacion | MIT (segun la model card) | 21,6 % texto correcto insertado |
| LFM2.5-350M-Base (Liquid AI) | 350M (clase) | no disponible | no disponible en esta informacion | LFM Open License v1.0 | no aplica: es un modelo base, no un limpiador de dictado |

No se dispone de datos de benchmarks comparables con otros limpiadores de dictado de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo especializado en ingles (`language: en`) y en la tarea de limpieza de dictado; no debe usarse como modelo generativo general ni en otros idiomas sin un ajuste adicional.
- La propia model card reconoce que las listas pueden perder las comas: "milk eggs bread and coffee". Es un fallo sistematico de la tarea de limpieza, no un error puntual.
- Si el modelo de reconocimiento de voz ha transcrito mal el audio, la transcripcion puede seguir saliendo mal: el limpiador no corrige errores del ASR, solo el habla espontanea del hablante.
- Riesgo de alucinacion controlado parcialmente: pese a que la guarda de seguridad de ScribeKey descarta salidas que introduzcan palabras, valores o negaciones no dichos, la propia metrica de "texto insertado con un valor ausente en la referencia" es del 3,5 %, lo que implica que sin esa guarda existe riesgo real de introducir contenido.
- La tasa de acierto global es baja en terminos absolutos: 26,6 % de texto correcto insertado en todas las filas de CleanBench v1. El modelo es un componente dentro de un pipeline con guardas, no una solucion autonoma.
- Requiere respetar estrictamente el prompt y el protocolo de decodificacion (BOS `<|startoftext|>`, parada en `<|im_end|>` o `###`, decodificacion greedy); desviarse de ese formato puede degradar la salida.
- Restriccion de licencia relevante para produccion: al derivar de LFM2.5-350M-Base, el modelo se distribuye bajo la LFM Open License v1.0, cuya concesion de uso comercial se limita a organizaciones con ingresos anuales inferiores a 10 millones de dolares estadounidenses. Por encima de ese umbral es necesario un acuerdo con Liquid AI.
- La licencia del ajuste intermedio de Sotto es MIT, pero la del modelo final es LFM Open License v1.0 por ser obra derivada de ambas; hay que consultar el fichero NOTICE del repositorio para la atribucion y los cambios.
- Con 0 descargas y 0 likes en el momento de la consulta y sin benchmark externo independiente, la unica evaluacion disponible es la del propio autor, con lo que ello implica de sesgo de evaluacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada. No se documenta analisis de sesgos demograficos, dialectales ni de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scribekey/sotto-scribekey-350m-gguf
- Modelo base del ajuste: https://huggingface.co/juanquivilla/sotto-cleanup-lfm25-350m (revision `6df6f019170b8b55333c047b901886a51750a965`)
- Sitio de ScribeKey: https://scribekey.app
- Licencia LFM Open License v1.0: fichero `LICENSE` del repositorio
- Atribucion y cambios: fichero `NOTICE` del repositorio

No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a la localizacion del P-38 de Antoine de Saint-Exupery y no guardan relacion con esta ficha.
