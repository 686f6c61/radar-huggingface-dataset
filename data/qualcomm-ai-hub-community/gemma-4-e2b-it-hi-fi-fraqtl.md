# qualcomm-ai-hub-community/Gemma-4-E2B-it-Hi-Fi-fraQtl

## Resumen

Gemma-4-E2B-it Hi-Fi fraQtl es un repositorio de cuantizaciones GGUF del modelo google/gemma-4-E2B-it, publicado por la organizacion qualcomm-ai-hub-community. No se trata de un modelo entrenado desde cero, sino de una cuantizacion con "calibration-aware per-tensor quantization": se usa la misma maquinaria Q4_K de llama.cpp, pero las decisiones de precision por tensor no siguen los valores por defecto, sino un analisis de calibracion. La tesis del autor es "bits mas inteligentes, no mas bits".

El repositorio contiene varios artefactos orientados a ejecucion en dispositivo (edge, iPhone, offline). Los dos principales son un Q4_K_M de tamano iso respecto al baseline de la comunidad (3.461.675.328 bytes, 5,93 bpw reales) y una variante "Phone" mas pequena (2.856.122.688 bytes, 4,89 bpw). Ademas se menciona un tercer artefacto, SmartEdge-IQ3XXS de 2,45 GB, que es el que ejecuta la demo en iPhone del autor. El modelo base tiene 4.647.450.147 parametros segun los datos de safetensors del repositorio.

La relevancia actual del repositorio es doble: por un lado, cuantifica la perdida de fidelidad respecto al checkpoint original en bf16 mediante divergencia KL simetrica top-20, con numeros reproducibles y fijados; por otro, demuestra un flujo completo en dispositivo con entrada de voz, tool calling sobre un calendario real y una capa de codigo determinista que ejecuta las acciones, todo en modo avion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (cuantizacion GGUF del modelo base google/gemma-4-E2B-it; no se describe la arquitectura interna del modelo original) |
| Parametros totales | 4.647.450.147 (dato de safetensors del repositorio) |
| Parametros activos | no disponible (la nomenclatura "E2B" del modelo base sugiere un diseno de parametros efectivos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M con calibracion por tensor (5,93 bpw reales); variante Phone (4,89 bpw reales); IQ3XXS para el artefacto SmartEdge |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (el campo license_link del README apunta a https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 8,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |
| Estado de inferencia | inference: false (no soportado en Inference Providers de HuggingFace) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El artefacto es una cuantizacion posentrenamiento de google/gemma-4-E2B-it, no un modelo entrenado de nuevo, por lo que no hay datos de entrenamiento, composicion de dataset ni fases de RLHF o DPO atribuibles a este repositorio. Lo unico verificable es que el formato GGUF producido es consumible por llama.cpp (la demo usa la build b10075 con backend Metal y mmap).

La innovacion tecnica declarada es la cuantizacion con reconocimiento de calibracion (calibration-aware per-tensor quantization). En lugar de aplicar precisiones fijas por defecto, el autor realiza un analisis de calibracion que decide la precision de cada tensor de forma individual dentro del esquema Q4_K. La metrica de fidelidad empleada es la divergencia KL simetrica top-20 sobre el soporte del teacher Q8, promediada sobre posiciones; el teacher es una cuantizacion Q8_0 del checkpoint original en bf16. Los valores publicados son de tres ejecuciones con deriva 0,0 en los artefactos HiFi. Ademas, el autor publica la huella sha256 del artefacto IQ3XXS ejecutado en el telefono (761c7002...816776), de forma que el fichero descargado es byte a byte el mismo que corre en la demo.

## Capacidades

- Generacion de texto conversacional en ingles con modo de respuesta corta, orientado a asistente de dispositivo.
- Tool calling y function calling: la demo ejecuta acciones reales sobre el calendario, con busqueda de huecos libres, creacion de eventos, cambio de titulo y desplazamiento de citas.
- Razonamiento multi-paso encadenado: instrucciones del tipo "mueve el evento y avisa" se resuelven como dos escrituras reales secuenciales.
- Generacion de codigo offline: se muestra la generacion del algoritmo de Dijkstra en C++ a ~11 tok/s interactivos.
- Conocimiento general y generacion de texto libre (incluye respuestas con tono de opinion en la demo).
- Entrada de voz y respuesta hablada, integradas en el pipeline de dispositivo (reconocimiento de voz y TTS locales).
- Lectura de documentos y fotos dentro del flujo de la aplicacion, segun describe el autor; no se detalla si la entrada de imagen es nativa del modelo o se resuelve con componentes previos.
- Titulos de evento enriquecidos con contexto de contactos.
- Delimitacion explicita de alcance: el modelo declara sus propios limites ("I do not have access to your emails") con etiquetas de contexto.
- Ejecucion totalmente offline, sin conectores de red.

## Casos de uso

- Asistente de agenda en movil: el modelo interpreta una peticion hablada ("Find some time on Thursday for VC meeting"), localiza un hueco libre y una capa de codigo determinista escribe el evento en el calendario del sistema. Es adecuado porque el artefacto cabe en un iPhone de gama alta y funciona sin red.
- Reorganizacion de calendario por voz o texto: mover eventos, renombrarlos y encadenar recordatorios con confirmacion mediante "receipt chip", de modo que ninguna escritura se declara si no se ha ejecutado realmente.
- Generacion de codigo en entornos air-gapped: el modelo puede producir fragmentos de codigo (por ejemplo, algoritmos clasicos en C++) a ~11 tok/s interactivos, util en portatiles sin conexion o en entornos con politicas estrictas de red.
- Agentes locales con tool calling: dado que soporta function calling y el autor demuestra integracion con APIs del sistema, encaja en agentes que orquestan acciones sobre aplicaciones nativas con una capa de ejecucion determinista y trazabilidad por recibos.
- Asistentes de movilidad o automocion con requisitos de privacidad: al no requerir red y tener variantes de 2,45-2,86 GB, es candidato para sistemas embebidos donde los datos del usuario no pueden salir del dispositivo.
- Procesamiento de documentos y fotos en dispositivo: lectura de documentos y capturas para extraer informacion y alimentar respuestas conversacionales, sin enviar el contenido a un servidor.
- Despliegue en telefonos con poca memoria: la variante SmartEdge-IQ3XXS de 2,45 GB esta pensada explicitamente para artefactos de telefono, lo que permite incluir un asistente generativo en gamas medias.
- Prototipado y evaluacion de cuantizaciones: las metricas KLD publicadas y reproducibles convierten el repositorio en una referencia util para comparar el impacto de distintas estrategias de cuantizacion sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las metricas publicadas son de fidelidad de cuantizacion (KLD) y de rendimiento en dispositivo.

| Metrica | HiFi Q4_K_M | HiFi Phone | bartowski Q4_K_M (baseline fijado) |
|---|---:|---:|---:|
| Tamano (bytes) | 3.461.675.328 | 2.856.122.688 | 3.462.678.272 |
| bpw real (todos los tensores) | 5,93 | 4,89 | 5,93 |
| KLD code/math (vs bf16 original) | 0,05846 | 0,06231 | 0,09139 |
| KLD general (vs bf16 original) | 0,09646 | 0,09716 | 0,13249 |
| Delta vs baseline | -36,0% / -27,2% | -31,8% / -26,7% (y 17,5% mas pequeno) | — |

La metrica KLD es divergencia KL simetrica top-20 sobre soporte del teacher Q8, media sobre posiciones; el teacher es una cuantizacion Q8_0 del checkpoint original en bf16. Menor es mejor. Los valores del HiFi Q4_K_M y del baseline son de tres ejecuciones con deriva 0,0.

| Rendimiento en dispositivo (iPhone-16-class, modo avion) | Valor |
|---|---:|
| Throughput sostenido, benchmark greedy de 256 tokens | 21,6 tok/s (umbral declarado >=15 tok/s: PASS) |
| Velocidad interactiva (ultimo turno, incluye prefill) | ~12 tok/s |
| Generacion de codigo interactiva (Dijkstra en C++) | ~11 tok/s |
| Memoria residente | ~516 MB |
| Runtime | llama.cpp b10075, Metal, mmap |

Nota: la memoria residente de ~516 MB corresponde a la ejecucion del artefacto SmartEdge-IQ3XXS de 2,45 GB; la diferencia entre ambas cifras no se explica en la informacion disponible.

## Requisitos de hardware

- Artefacto HiFi Q4_K_M: fichero de 3,46 GB. Estimacion de memoria en torno a 4 GB con contexto corto, mas el KV cache correspondiente a la longitud de contexto, que no esta publicada.
- Artefacto HiFi Phone: fichero de 2,86 GB. Estimacion en torno a 3,3 GB de RAM/VRAM, con el mismo caveat sobre KV cache.
- Artefacto SmartEdge-IQ3XXS: fichero de 2,45 GB, disenado para telefono; es el que se ejecuta en la demo con ~516 MB residentes.
- Cabe en GPU de consumo: las tres variantes entran sin problema en GPUs con 8 GB o mas (RTX 3060/4060, RTX 4070/4080, RTX 4090). La variante Phone tambien es viable en GPUs de 6 GB con contexto reducido.
- Cabe en hardware movil y Apple Silicon: la demo oficial corre en un iPhone de clase iPhone 16 con backend Metal. En Mac con Apple Silicon no hay datos publicados, pero el formato GGUF y Metal son compatibles.
- Aceleradores de datacenter: A100 y H100 pueden ejecutarlo, aunque estan sobredimensionados para un modelo de este tamano; su uso tendria sentido solo por agregacion de muchas instancias.
- Opciones de despliegue: llama.cpp es el runtime de referencia (build b10075 en la demo). Por formato, tambien son aplicables Ollama y otros frontends que consuman GGUF. vLLM y TGI no estan documentados para este repositorio.
- Latencia y throughput conocidos: unicamente los medidos en iPhone (21,6 tok/s sostenidos; ~12 tok/s interactivos; ~11 tok/s en generacion de codigo). No hay datos publicados para GPU de escritorio ni servidor, por lo que no deben extrapolarse.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | KLD code/math | KLD general | Tamano | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---|---|
| fraQtl HiFi Q4_K_M | 4.647.450.147 (base) | no disponible | 0,05846 | 0,09646 | 3,46 GB | apache-2.0 | HuggingFace, 0 descargas |
| fraQtl HiFi Phone | 4.647.450.147 (base) | no disponible | 0,06231 | 0,09716 | 2,86 GB | apache-2.0 | HuggingFace, 0 descargas |
| bartowski Q4_K_M (baseline) | mismo modelo base | no disponible | 0,09139 | 0,13249 | 3,46 GB | segun modelo base | HuggingFace, usado como referencia fijada por el autor |
| google/gemma-4-E2B-it (bf16) | 4.647.450.147 | no disponible | referencia (teacher Q8_0 derivado de este checkpoint) | referencia | no disponible | Gemma 4 license | HuggingFace |

No se dispone de datos sobre otras alternativas de la misma categoria (mismo tamano o misma tarea) en la informacion proporcionada. La comparacion publicada por el autor se limita al baseline bartowski Q4_K_M y al checkpoint original en bf16.

## Limitaciones y advertencias

- Idioma: el modelo base esta etiquetado unicamente como ingles (en). No hay evidencia de soporte multilingue ni de calidad en castellano.
- Sin benchmarks de calidad absoluta: las metricas publicadas miden fidelidad respecto al checkpoint original, no capacidad real de razonamiento, codigo o matematicas. Una KLD baja no implica buen rendimiento en tareas.
- Riesgo de alusionacion: no hay datos publicados de tasas de alucinacion. La KLD general de 0,09646 en la variante HiFi indica desviacion respecto a la distribucion del modelo original, que a su vez puede contener errores.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad en la informacion disponible.
- Longitud de contexto desconocida: no se publica la ventana de contexto, lo que impide dimensionar correctamente el KV cache y limita el diseno de aplicaciones con historial largo.
- Estado de validacion muy temprano: 0 descargas y 0 likes, repositorio creado y actualizado el mismo dia (2026-09-16). No hay validacion independiente de la comunidad.
- Metricas autopublicadas: los valores KLD, el umbral de rendimiento y el baseline estan fijados por el propio autor. Se declaran reproducibles, pero no hay verificacion externa en la informacion proporcionada.
- Discrepancia de licencia: el repositorio declara apache-2.0, mientras que el campo license_link apunta a la licencia Gemma 4 de Google. Conviene verificar los terminos aplicables antes de un uso comercial, ya que la licencia del modelo base puede imponer restricciones adicionales.
- Demo con alcance limitado por diseno: sin email, sin mensajes y sin ninguna llamada de red; el modelo no ejecuta acciones por si mismo, sino que una capa de codigo determinista las ejecuta y reporta. Si esa capa falla, no aparece recibo y no hay accion.
- Evidencia incompleta para uno de los artefactos: el autor indica que los recibos de fidelidad (escala KLD) del SmartEdge-IQ3XXS aun no estan publicados; su evidencia actual es el comportamiento en dispositivo y el benchmark mostrado.
- Rendimiento medido en un unico dispositivo: 21,6 tok/s y ~12 tok/s se obtuvieron en un iPhone de clase iPhone 16 en modo avion. No son extrapolables a otros telefonos, a Android ni a GPU de escritorio.
- Memoria residente no explicada: la cifra de ~516 MB residentes frente a un artefacto de 2,45 GB no se justifica en la documentacion; podria depender de paginacion por mmap y de la longitud de contexto en uso.
- Artefacto no servible como endpoint gestionado: el campo inference: false indica que el repositorio no esta soportado por los Inference Providers de HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/qualcomm-ai-hub-community/Gemma-4-E2B-it-Hi-Fi-fraQtl
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia del modelo base (Gemma 4): https://ai.google.dev/gemma/docs/gemma_4_license
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devolvieron exclusivamente resultados no relacionados (hilos de foro sobre Gameduell y consultas de soporte de Microsoft Community), por lo que no se incluyen como fuentes.
