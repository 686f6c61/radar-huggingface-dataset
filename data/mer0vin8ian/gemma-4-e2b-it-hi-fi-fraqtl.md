# Mer0vin8ian/Gemma-4-E2B-it-Hi-Fi-fraQtl

## Resumen

Gemma-4-E2B-it-Hi-Fi-fraQtl es una cuantizacion GGUF del modelo google/gemma-4-E2B-it, publicada por el usuario Mer0vin8ian bajo el paraguas del proyecto "fraQtl". Se trata de una familia de artefactos cuantizados con una tecnica que el autor denomina "calibration-aware per-tensor quantization": se mantiene la maquinaria Q4_K de llama.cpp, pero las decisiones de precision por tensor se guian por un analisis de calibracion en lugar de usar los valores por defecto. La propuesta central es "bits mas inteligentes, no mas bits".

El repositorio incluye tres artefactos: una variante iso-tamano Q4_K_M de 3,46 GB (5,93 bpw reales), una variante "Phone" de 2,86 GB (4,89 bpw) y una variante SmartEdge IQ3XXS de 2,45 GB. El modelo base tiene 4.647.450.147 parametros totales y esta orientado a inferencia en dispositivo (edge, iPhone, offline) con soporte de tool calling. La relevancia actual reside en la promesa de reducir la divergencia KL respecto al modelo original bf16 en un 36% (codigo/matematicas) y un 27,2% (general) frente a un Q4_K_M comunitario de referencia, al mismo tamano de fichero.

La licencia declarada es Apache-2.0, aunque la model card enlaza a la licencia especifica de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial. El modelo solo declara soporte de ingles y no se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E2B-it; detalles no disponibles) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (variante HiFi iso-tamano), variante Phone a 4,89 bpw, variante SmartEdge IQ3XXS |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint google/gemma-4-E2B-it, por lo que hereda la arquitectura del modelo base, no descrita en la informacion proporcionada. La innovacion tecnica del artefacto no esta en el entrenamiento sino en el proceso de cuantizacion: fraQtl aplica decisiones de precision por tensor guiadas por un analisis de calibracion sobre la maquinaria Q4_K de llama.cpp. El autor reporta bpw reales de 5,93 para la variante iso-tamano y 4,89 para la variante Phone, con ficheros de 3.461.675.328 y 2.856.122.688 bytes respectivamente.

La metrica de fidelidad empleada es la divergencia KL simetrica top-20 sobre soporte de un profesor Q8_0 (cuantizacion Q8_0 del checkpoint bf16 original), promediada sobre posiciones. Los valores reportados son 0,05846 (codigo/matematicas) y 0,09646 (general) para la variante HiFi, frente a 0,09139 y 0,13249 del Q4_K_M de bartowski tomado como referencia. No se dispone de informacion sobre datos de entrenamiento, RLHF/DPO ni innovaciones de arquitectura del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles.
- Tool calling / function calling (etiqueta explicita del repositorio).
- Ejecucion de acciones encadenadas mediante una capa de codigo determinista (demostrado con escrituras en calendario y recordatorios).
- Generacion de codigo (demostrado con la generacion offline del algoritmo de Dijkstra en C++).
- Conocimiento general y respuesta a preguntas.
- Lectura de documentos y fotos en el contexto de la app de demostracion.
- Entrada de voz y respuestas habladas (via reconocimiento de voz y TTS en dispositivo, no capacidades nativas del modelo).
- Inferencia completamente offline en dispositivo (iPhone, modo avion).
- No dispone de acceso a email, mensajes ni red por diseno; el modelo declara sus propios limites cuando se le pregunta.

## Casos de uso

- Asistente de calendario offline: el modelo interpreta una peticion hablada o escrita ("encuentra un hueco el jueves para una reunion de VC"), localiza un hueco libre y una capa de codigo determinista escribe el evento. Adecuado por su soporte de tool calling y su ejecucion en dispositivo sin red.
- Gestion de eventos y recordatorios encadenados: instrucciones de dos pasos (mover un evento y crear una alerta) se ejecutan como dos escrituras reales de calendario, con recibo visible de cada accion.
- Generacion de codigo en entornos sin conectividad: generacion de algoritmos (por ejemplo, Dijkstra en C++) a aproximadamente 11 tok/s interactivos en un iPhone de clase iPhone 16.
- Asistente de voz en dispositivo: combinacion de reconocimiento de voz local, el modelo para comprension y TTS local para respuestas habladas, todo en modo avion.
- Lectura y comprension de documentos y fotos en el dispositivo: el modelo procesa contenido local sin enviar datos a servicios externos, lo que resulta adecuado para escenarios con requisitos de privacidad.
- Automatizacion de acciones con trazabilidad: el patron de "recibo" (chip que declara exactamente lo escrito) y la verificacion sha256 del artefacto al cargar encajan en flujos donde se requiere auditoria de acciones ejecutadas por un agente.
- Despliegue edge en hardware movil: con ~516 MB residentes y 21,6 tok/s sostenidos en benchmark greedy de 256 tokens (puerta de >=15 tok/s superada), es viable para apps moviles nativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos reportados son metricas de fidelidad de cuantizacion y de rendimiento en dispositivo:

| Metrica | fraQtl HiFi Q4_K_M | fraQtl Phone | bartowski Q4_K_M (referencia) |
|---|---:|---:|---:|
| Bytes | 3.461.675.328 | 2.856.122.688 | 3.462.678.272 |
| bpw reales | 5,93 | 4,89 | 5,93 |
| KLD codigo/matematicas | 0,05846 | 0,06231 | 0,09139 |
| KLD general | 0,09646 | 0,09716 | 0,13249 |
| Mejora vs referencia (codigo/matematicas) | -36,0% | -31,8% | — |
| Mejora vs referencia (general) | -27,2% | -26,7% | — |

Rendimiento en dispositivo (iPhone de clase iPhone 16, llama.cpp b10075, Metal, mmap, modo avion):

| Metrica | Valor |
|---|---|
| Memoria residente | ~516 MB |
| Throughput interactivo | ~12 tok/s (ultimo turno, incluye prefill) |
| Benchmark greedy 256 tokens | 21,6 tok/s sostenidos (puerta >=15 tok/s: PASS) |
| Generacion de codigo interactiva | ~11 tok/s |

## Requisitos de hardware

- VRAM/RAM estimada: ~3,5 GB para la variante HiFi Q4_K_M, ~2,9 GB para la variante Phone y ~2,5 GB para la variante SmartEdge IQ3XXS (tamanos de fichero; el consumo en ejecucion puede ser superior).
- GPU recomendadas: no especificadas en la informacion disponible. El modelo esta disenado para edge y dispone de backend Metal en llama.cpp.
- Cabe en GPU de consumo: si, por tamano (variantes de 2,5 a 3,5 GB), aunque el foco del autor es movil, no escritorio.
- Despliegue: llama.cpp (version b10075 usada en la demo), con backend Metal; compatible con el ecosistema GGUF (Ollama, llama-cpp-python, etc., aunque no verificado en la informacion).
- Latencia y throughput: ~12 tok/s interactivos y 21,6 tok/s sostenidos en benchmark greedy en un iPhone de clase iPhone 16; ~516 MB residentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-E2B-it Hi-Fi fraQtl | 4.647.450.147 | no disponible | Q4_K_M, Phone, IQ3XXS | apache-2.0 | Hugging Face |
| bartowski Q4_K_M (Gemma-4-E2B-it) | no disponible | no disponible | Q4_K_M | segun modelo base | Hugging Face |
| google/gemma-4-E2B-it (bf16 original) | 4.647.450.147 | no disponible | bf16 | licencia Gemma 4 | Hugging Face |

La comparativa se limita al ecosistema del propio modelo base; no se dispone de datos de modelos alternativos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo declara soporte de ingles; no se garantiza calidad en castellano ni otros idiomas.
- Longitud de contexto no disponible; no se puede evaluar su idoneidad para conversaciones de contexto largo.
- La licencia declarada es Apache-2.0, pero la model card enlaza a la licencia de Gemma 4 de Google; conviene verificar los terminos reales antes de uso comercial.
- No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que el rendimiento en tareas generales no esta cuantificado.
- Las metricas de fidelidad (KLD) son autoinformadas por el autor y no han sido verificadas de forma independiente en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- El modelo base es Gemma 4, con posibles sesgos heredados no documentados en la informacion.
- Riesgo de alucinacion inherente a modelos de lenguaje; la demo mitiga acciones mediante una capa de codigo determinista y recibos, pero no elimina el riesgo en respuestas conversacionales.
- La variante SmartEdge IQ3XXS no dispone de metricas de fidelidad KLD publicadas (el autor indica que estan pendientes).
- El modelo no dispone de acceso a red, email ni mensajes por diseno; cualquier caso de uso que requiera conectividad debe implementarse externamente.

## Enlaces

- Hugging Face: https://huggingface.co/Mer0vin8ian/Gemma-4-E2B-it-Hi-Fi-fraQtl
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
