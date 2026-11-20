# mradermacher/whispernow-nemotron-bolt-e4b-GGUF

## Resumen

Whispernow-nemotron-bolt-e4b es un modelo de lenguaje orientado a la limpieza y normalización de transcripciones de voz (transcript cleanup) dentro de un pipeline de dictado o speech-to-text. Lo desarrolla el usuario `category271` y esta cuantizado en formato GGUF por `mradermacher`, un conocido publicador de cuantizaciones para llama.cpp. El modelo base es `category271/whispernow-nemotron-bolt-e4b`, afinado sobre el dataset `category271/whispernow-cleanup`.

El modelo cuenta con 7.463.013.674 parámetros totales (aproximadamente 7,5 mil millones) según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de tamano medio aptos para despliegue en hardware de consumo. La nomenclatura "e4b" sugiere una variante derivada de la familia Nemotron con aproximadamente 4 mil millones de parámetros activos, aunque la model card no confirma explícitamente una arquitectura MoE; el dato de parámetros totales corresponde a los safetensors publicados.

Su relevancia actual radica en que cubre una tarea de nicho pero muy práctica: tomar transcripciones ASR en bruto (con puntuación deficiente, repeticiones, muletillas y errores de segmentación) y devolver texto limpio y legible. Al estar disponible en GGUF con múltiples niveles de cuantización (desde Q2_K de 4,5 GB hasta f16 de 15 GB), permite ejecutar el modelo en local, incluyendo GPUs de consumo, lo que facilita integrarlo en aplicaciones de dictado sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Nemotron; no se detalla en la model card) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); variantes imatrix ponderadas en repo i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | openmdw-1.1 (Open Model Development Weight License 1.1) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no proporciona detalles sobre la arquitectura interna del modelo base. Por el nombre y la familia declarada (Nemotron) se infiere una arquitectura transformer derivada de la linea Nemotron, pero no se especifica si emplea atención estándar, atención lineal, mezcla de expertos u otra variante. El sufijo "e4b" apunta a una variante de aproximadamente 4 mil millones de parámetros activos, aunque esta interpretación no esta confirmada en la documentación disponible.

El entrenamiento se realizo mediante ajuste fino supervisado sobre el dataset `category271/whispernow-cleanup`, orientado especificamente a la tarea de limpieza de transcripciones. No se documenta el numero de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card tampoco menciona innovaciones tecnicas como decodificacion especulativa o atención lineal. La cuantización la realiza `mradermacher` con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), generando cuantizaciones estáticas K-quants e IQ-quants; las variantes ponderadas con imatrix se publican en un repositorio separado (`-i1-GGUF`).

## Capacidades

- Limpieza y normalización de transcripciones de voz: corrección de puntuación, mayúsculas, segmentación de frases y eliminación de artefactos típicos del ASR.
- Generación de texto conversacional en ingles, orientada a la tarea de dictado.
- Procesamiento de entradas de tipo transcript para devolver texto limpio y legible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingues: limitadas al ingles (`language: en`).
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo no procesa audio directamente, sino que opera sobre texto transcrito.

## Casos de uso

- Limpieza de transcripciones de reuniones: tras un ASR como Whisper, el modelo recibe el texto bruto y devuelve un acta legible con puntuación y párrafos correctos, aprovechando su ajuste especifico sobre `whispernow-cleanup`.
- Post-procesado en aplicaciones de dictado: integrado en el pipeline tras el reconocimiento de voz, normaliza el texto dictado antes de insertarlo en el editor, mejorando la experiencia de usuario.
- Generación de subtítulos legibles: convierte transcripciones automáticas de video en subtítulos con puntuación y segmentación adecuadas, reduciendo el trabajo de revisión manual.
- Preparación de datos para entrenamiento ASR: limpia grandes volúmenes de transcripciones para construir corpus de calidad, ejecutable en local con cuantizaciones Q4_K_M de 5,4 GB.
- Documentación clínica o legal dictada: normaliza notas dictadas por profesionales antes de su almacenamiento, siempre con revisión humana dado el riesgo de alucinación.
- Herramientas de accesibilidad: transcripción en vivo limpia para personas con discapacidad auditiva, desplegable en hardware de consumo con llama.cpp u Ollama.
- Automatización de notas de voz en movil o escritorio: procesamiento local de dictados sin enviar datos a la nube, gracias a las cuantizaciones de 4,5-5,4 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): Q2_K ~4,5 GB; Q4_K_M ~5,4 GB; Q5_K_M ~5,8 GB; Q6_K ~6,3 GB; Q8_0 ~8,1 GB; f16 ~15 GB. Anadir aproximadamente 1-3 GB adicionales para la cache KV segun la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q6; RTX 4090 24 GB para Q8_0 o f16 con contexto amplio; A100/H100 solo necesarias para f16 con lotes grandes o despliegue en servidor.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_M o inferiores; en GPUs de 6 GB caben Q2_K y Q3_K_S con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face. Para el modelo base en safetensors, transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whispernow-nemotron-bolt-e4b (este) | 7,46 B | no disponible | Limpieza de transcripciones (en) | openmdw-1.1 | GGUF + safetensors en HF |
| Modelos de limpieza de transcripciones comparables | no disponible | no disponible | no disponible | no disponible | no disponible |
| LLMs generalistas de ~7-8 B | ~7-8 B | variable | Generacion general | variable | amplia |

No se dispone de información sobre modelos directamente comparables en la misma tarea de transcript cleanup, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo especializado y monoidioma: solo soporta ingles; su uso en castellano u otros idiomas no esta validado y probablemente produzca resultados deficientes.
- Riesgo de alucinacion: como todo modelo generativo, puede introducir o alterar contenido durante la limpieza; en contextos sensibles (legal, médico) requiere revisión humana.
- Sesgos conocidos: no documentados en la model card; al derivar de Nemotron y entrenarse en un dataset especifico, puede heredar sesgos del corpus base y de `whispernow-cleanup`.
- Licencia openmdw-1.1: es una licencia de pesos abiertos con condiciones propias; debe revisarse el texto completo en el enlace de licencia antes de uso comercial. La model card no aclara restricciones adicionales.
- Longitud de contexto no documentada: limita la planificación para transcripciones muy largas; conviene trocear la entrada.
- Sin datos de benchmarks: no hay evidencia publicada de calidad frente a alternativas, lo que dificulta la evaluación previa a producción.
- El repositorio GGUF es una cuantización de terceros: la calidad final depende del proceso de cuantización y del modelo base, no verificado independientemente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/whispernow-nemotron-bolt-e4b-GGUF
- Modelo base: https://huggingface.co/category271/whispernow-nemotron-bolt-e4b
- Dataset de limpieza: https://huggingface.co/datasets/category271/whispernow-cleanup
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/whispernow-nemotron-bolt-e4b-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#whispernow-nemotron-bolt-e4b-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
