# liangyue36/qwen3-0.6b-dictation-polish-GGUF

## Resumen

Qwen3-0.6B dictation polish es un ajuste fino de Qwen/Qwen3-0.6B orientado a una tarea muy concreta: convertir texto crudo de reconocimiento automatico del habla (ASR) en texto escrito limpio. Elimina muletillas, repeticiones y fragmentos previos a una autocorreccion ("diez, no, once" pasa a "once"), anade puntuacion y conserva terminos en ingles dentro de dictados mixtos chino-ingles. Lo desarrolla liangyue36 como componente de limpieza de Utter, una aplicacion de dictado on-device para macOS.

El modelo es relevante por su enfoque de producto: un transformer denso de 0,6 mil millones de parametros (596.049.920 parametros reales) que se ejecuta en unos 0,2 s por frase en un Apple M1 Pro con cuantizacion Q8_0, lo que permite dictado local sin enviar audio ni transcripciones a la nube. Se distribuye exclusivamente en formato GGUF para llama.cpp y esta pensado para usarse con un system prompt fijo, no como modelo conversacional general.

La publicacion es muy reciente (noviembre de 2026) y sin traccion: cero descargas y cero likes en el momento de redactar esta ficha. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B), ajuste fino de todos los parametros |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-0.6B; el autor recomienda limitar dictados a unos 300 caracteres) |
| Tipos de cuantizacion | GGUF Q8_0 unicamente (Q4_0 evaluado y descartado por calidad) |
| Idiomas soportados | chino (zh) e ingles (en), con dictado mixto chino-ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repositorio de 0,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B y se entrena con ajuste fino completo en bf16 sobre una unica RTX 4090 (pico de 6,39 GiB), con `enable_thinking=False`, perdida calculada solo sobre la respuesta, learning rate 2e-5 y parada temprana basada en preservacion de entidades. El conjunto de datos es muy pequeno: 374 pares, de los cuales 324 son dictados reales del autor (texto ASR a texto final conservado), limpiados de datos personales, y 50 son anclas sinteticas, 26 de ellas correcciones a mitad de frase. Los datos de entrenamiento no se publican.

La innovacion practica no esta en la arquitectura sino en el diseno del dato y en la evaluacion: se selecciono la epoca 1 porque la epoca 2 mejoraba ligeramente la similitud (0,8364) pero degradaba la preservacion de entidades al 96,6%. Solo se publica la cuantizacion Q8_0 porque Q4_0 obtuvo 0,948 de similitud y 96,6% de preservacion de entidades, por debajo del umbral de 0,95 fijado por el autor.

## Capacidades

- Normalizacion de texto dictado: eliminacion de muletillas, repeticiones y contenido previo a una autocorreccion.
- Puntuacion automatica del texto transcrito.
- Preservacion de terminos en ingles en dictados mixtos chino-ingles.
- Conservacion de entidades reconocidas por el ASR (100% en el conjunto de evaluacion de 59 entidades).
- Generacion de texto condicionada a un unico system prompt; no es un modelo conversacional ni responde preguntas.
- No soporta tool calling, function calling, agentes, vision ni audio de forma nativa segun la informacion disponible.
- No dispone de modo de razonamiento (thinking) activado; el entrenamiento usa `enable_thinking=False`.

## Casos de uso

- Dictado on-device en macOS: integrado en la aplicacion Utter, el modelo recibe la transcripcion del ASR y devuelve texto escrito listo para pegar en cualquier editor, con unos 0,2 s por frase en un M1 Pro y sin salir del equipo.
- Correccion de notas de reunion: se transcribe una reunion con cualquier motor ASR y se pasa cada intervencion por el modelo para eliminar titubeos y anadir puntuacion antes de archivarla.
- Limpieza de subtitulos generados automaticamente: el modelo elimina repeticiones y fragmentos descartados por el hablante, lo que reduce el ruido tipico de los subtitulos ASR en bruto.
- Preprocesado para pipelines de datos: normalizar transcripciones antes de indexarlas en un sistema de busqueda o RAG, de modo que el texto almacenado sea legible y consistente.
- Soporte para hablantes bilingues chino-ingles: conserva los terminos tecnicos en ingles (por ejemplo, nombres de tecnologias) dentro de frases en chino, algo que los normalizadores genericos suelen traducir o deformar.
- Prototipado de asistentes de voz locales: al ser un GGUF de 0,6 GB, sirve como etapa de postprocesado en un stack llama.cpp junto a un motor ASR, sin GPU dedicada.
- Investigacion sobre ajuste fino de modelos pequenos: el modelo documenta con detalle la seleccion de epoca, el impacto de las anclas de correccion y la evaluacion de cuantizaciones, lo que lo convierte en un caso de estudio reproducible.

## Benchmarks y rendimiento

Evaluacion del autor sobre 40 dictados reservados (los 40 mas recientes por fecha), decodificacion greedy:

| Metrica | Qwen3-0.6B zero-shot | Este modelo (bf16) |
|---|---|---|
| Similitud de caracteres con el texto conservado | 0,073 | 0,836 |
| Entidades reconocidas por el ASR preservadas (59) | no medida | 100% |
| Salidas mucho mas largas que la entrada | 30 / 40 | 0 / 40 |

Pruebas adicionales:

| Prueba | Resultado |
|---|---|
| 10 correcciones a mitad de frase no vistas | 7 / 10 correctas (1 / 10 antes de anadir las 26 anclas) |
| GGUF Q8_0 en Apple silicon, mismas 10 correcciones | 7 / 10 |
| Similitud Q8_0 frente a bf16 (32 / 40 identicas) | 0,9975 |
| Q4_0: similitud y preservacion de entidades | 0,948 y 96,6% (descartado) |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el ajuste fino completo cupo en 6,39 GiB en una RTX 4090; la inferencia con Q8_0 de 0,6B requiere aproximadamente 0,7-1 GB de memoria, holgadamente dentro de cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; el autor lo ejecuta en CPU/GPU integrada de un Apple M1 Pro con latencia de unos 0,2 s por frase.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1650, RTX 3060, RTX 4090, Apple Silicon).
- Opciones de despliegue: llama.cpp mediante `llama-server` (comando documentado con `-hf`), con API compatible con OpenAI en `/v1/chat/completions`. No se documentan otros runners (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: 0,2 s por frase en M1 Pro con Q8_0; no se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B dictation polish (este) | 596 M | no disponible | Normalizacion de dictado zh/en | Apache-2.0 | GGUF Q8_0 en Hugging Face |
| Qwen/Qwen3-0.6B (base) | 596 M | no disponible | Generacion de texto general | Apache-2.0 | Safetensors y GGUF oficiales |
| Modelos de normalizacion de texto ASR (soluciones clasicas basadas en reglas o seq2seq pequenos) | variable | no disponible | Puntuacion y limpieza de transcripciones | variable | no disponible |

La comparacion con alternativas especificas de limpieza de dictado no esta disponible en la informacion proporcionada; el unico punto de referencia publicado es el propio modelo base sin ajustar, frente al que la mejora de similitud pasa de 0,073 a 0,836.

## Limitaciones y advertencias

- Entrenado con los dictados de una sola persona en chino con terminos tecnicos en ingles; otros dominios y acentos no se han probado.
- Las correcciones formuladas como "X, no, Y" fallan en 3 de cada 10 casos de prueba.
- Los dictados de mas de unos 300 caracteres deben cortarse previamente en pausas; la aplicacion Utter lo hace, pero el modelo por si solo no lo gestiona.
- En una prueba, una entrada que terminaba a mitad de frase provoco la adicion de un numero de relleno (`1234567890`).
- Requiere exactamente el system prompt de entrenamiento; otros prompts dan resultados notablemente peores.
- Solo se publica Q8_0; no hay versiones mas agresivas ni pesos bf16 en el repositorio.
- Riesgo de alucinacion acotado por la tarea, pero documentado en el caso del numero de relleno; no debe usarse como modelo de proposito general.
- Licencia Apache-2.0, por lo que el uso comercial esta permitido con las obligaciones habituales de atribucion y aviso.
- Sin descargas ni validacion externa: la evaluacion procede unicamente del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liangyue36/qwen3-0.6b-dictation-polish-GGUF
- Aplicacion Utter: https://github.com/cassieliang6709/utter
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- llama.cpp: https://github.com/ggml-org/llama.cpp
