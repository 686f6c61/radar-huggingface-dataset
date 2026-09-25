# mradermacher/Cyber-Ornith-1.5-9B-OBLITERATED-GGUF

## Resumen

Cyber-Ornith-1.5-9B-OBLITERATED-GGUF es un conjunto de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED. Se trata de un modelo de aproximadamente 8.953.803.264 parámetros (unas 8,95 mil millones) distribuido exclusivamente en pesos GGUF, con un total de 13 variantes de cuantización publicadas (desde Q2_K hasta f16). El repositorio ocupa 27,1 GB y esta etiquetado como conversacional y compatible con Endpoints de HuggingFace.

El modelo base pertenece a la familia Ornith-1.5 (descrita por sus autores como un framework de auto-mejora y auto-scaffolding) y, segun la informacion publica disponible sobre esa familia, se trata de un modelo denso, multimodal y orientado a codigo construido sobre Qwen3.5. El sufijo "OBLITERATED" indica que ha sido sometido a un proceso de abliteracion (eliminacion de rechazos) para reducir el comportamiento de denegacion de peticiones, lo que lo situa en la categoria de modelos "sin censura".

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar localmente un modelo de ~9B con capacidades conversacionales y (presumiblemente) de vision y codigo, en hardware de consumidor, gracias a las cuantizaciones de 4 bits. No obstante, la informacion oficial publicada por el uploader es minima: no declara licencia, idiomas, contexto ni resultados de benchmarks, por lo que buena parte de las especificaciones deben tratarse como no disponibles o inferidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo denso tipo transformer, segun la familia Ornith-1.5) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (unico formato publicado; no se ofrecen safetensors) |

Datos adicionales confirmados: autor mradermacher; repositorio de 27,1 GB; creado el 2026-09-25 y actualizado el mismo dia; 0 descargas y 0 likes en el momento de la consulta; etiquetas gguf, endpoints_compatible, conversational, region:us.

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica especifica sobre la arquitectura de este modelo concreto en la documentacion disponible. La model card del repositorio GGUF es una plantilla autogenerada por la herramienta de cuantizacion de mradermacher y se limita a indicar que son cuantizaciones estaticas del modelo DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED. Por tanto, la arquitectura exacta, el numero de tokens de entrenamiento, la composicion del dataset y el uso de RLHF, DPO u otras tecnicas de alineacion no estan disponibles.

Segun la informacion publica sobre la familia Ornith-1.5, esta se describe como un marco de auto-scaffolding y auto-mejora: el modelo propone nuevas tareas, genera andamiajes especificos y produce rollouts de soluciones para aprendizaje por refuerzo. Las fuentes secundarias describen Ornith-1.5-9B como un modelo denso multimodal de codigo construido sobre Qwen3.5. El calificativo "OBLITERATED" del nombre sugiere la aplicacion de abliteracion para suprimir la tendencia a rechazar peticiones, aunque no se documenta el procedimiento exacto. Ninguno de estos extremos esta confirmado por el uploader de esta cuantizacion, por lo que deben tomarse como referencias de la familia base y no como hechos verificados de este artefacto.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta conversational).
- Generacion de codigo, segun la orientacion de la familia Ornith-1.5 (no confirmado para esta variante).
- Capacidades multimodales (vision) atribuidas a la familia Ornith-1.5-9B en fuentes secundarias; no confirmadas en la ficha de este repositorio.
- Comportamiento "sin censura" derivado de la abliteracion: menor tasa de rechazos ante peticiones que un modelo alineado estandar rechazaria.
- Compatibilidad con Endpoints de HuggingFace (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking o razonamiento explicito: no disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Inferencia local en equipos de sobremesa: gracias a las cuantizaciones Q4_K_M e IQ4_XS, el modelo puede ejecutarse en una GPU con 8 GB de VRAM mediante llama.cpp u Ollama, lo que permite disponer de un modelo conversacional de ~9B sin depender de servicios en la nube.
- Asistencia de programacion en el editor: si se confirma la orientacion a codigo de la familia base, puede integrarse como autocompletado o generador de fragmentos en flujos de trabajo locales (por ejemplo, extensiones de VS Code conectadas a un servidor local compatible con la API de OpenAI).
- Experimentacion en investigacion sobre abliteracion y alineacion: el modelo sirve como punto de comparacion para estudiar como la eliminacion de rechazos afecta al comportamiento, util para grupos que investigan mecanismos de seguridad y robustez.
- Generacion de texto creativo sin restricciones tematicas: el caracter "OBLITERATED" lo hace adecuado para tareas de escritura donde los modelos alineados suelen rechazar peticiones, siempre que se respeten las consideraciones legales y eticas aplicables.
- Procesamiento por lotes en pipelines offline: al distribuirse en GGUF, puede integrarse en scripts de generacion masiva ejecutados en CPU/GPU mediante llama.cpp para tareas de resumen, reescritura o clasificacion de texto.
- Despliegue en Endpoints de HuggingFace: la etiqueta endpoints_compatible indica que el artefacto esta preparado para su uso en la infraestructura gestionada de HuggingFace, lo que simplifica la exposicion del modelo como API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y las fuentes secundarias consultadas no aportan numeros verificables para esta variante concreta.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no publicada por el autor):
  - Q2_K: aproximadamente 3,5-4 GB.
  - Q3_K_S / Q3_K_M: aproximadamente 4-4,5 GB.
  - Q4_K_S / Q4_K_M / IQ4_XS: aproximadamente 5-5,7 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 6-6,7 GB.
  - Q6_K: aproximadamente 7,5 GB.
  - Q8_0: aproximadamente 9,5-10 GB.
  - f16: aproximadamente 17,9 GB.
- GPU recomendadas: no especificadas por el autor. Como referencia de ingenieria, las cuantizaciones de 4 bits caben en GPU de consumo con 8 GB (RTX 3060 Ti, RTX 4060 Ti 8 GB, RTX 3070); las de 8 bits requieren 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090); la version f16 requiere 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB).
- Cabida en GPU de consumidor: si, las variantes de 2 a 5 bits caben en GPU de 6-8 GB. Segun una fuente secundaria, la familia Ornith-1.5-9B se ejecuta en una GPU de 8 GB o en un Mac de 16 GB con cuantizacion de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, servidores compatibles con la API de OpenAI, HuggingFace Endpoints (etiqueta endpoints_compatible). Compatibilidad con vLLM o TGI: no confirmada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Cyber-Ornith-1.5-9B-OBLITERATED-GGUF (este) | ~8,95B | GGUF | no disponible | Cuantizaciones de DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED |
| Ornith-1.5-9B-OBLITERATED-GGUF (mradermacher) | ~9B | GGUF | no disponible | Misma familia base, sin el prefijo Cyber |
| Ornith-1.5-9B-uncensored-GGUF (mradermacher) | ~9B | GGUF | no disponible | Variante sin censura de la misma familia |
| Ornith-1.5-9B (familia base) | ~9B | no disponible | no disponible | Modelo denso multimodal de codigo descrito como construido sobre Qwen3.5 |

No se dispone de datos de contexto, benchmarks ni licencia para ninguno de los modelos comparados, por lo que la comparacion se limita a parametros, formato y procedencia. No se han identificado alternativas de otros autores con especificaciones verificables en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de un proceso de abliteracion, es probable que el modelo presente menos filtros de seguridad y mayor tendencia a generar contenido problematico, pero no hay evaluacion publicada al respecto.
- Riesgo de alucinacion: no cuantificado. Como cualquier modelo de ~9B, es vulnerable a generar informacion facticamente incorrecta, especialmente en tareas de conocimiento especializado.
- Limitaciones de contexto e idioma: no disponibles. Se desconoce la ventana de contexto real y los idiomas soportados.
- Restricciones de licencia: no se declara licencia en el repositorio, ni para esta cuantizacion ni, en la informacion disponible, para el modelo base DuoNeural. La ausencia de licencia explicita impide asumir permisos de uso comercial; se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- Trazabilidad: al ser una cuantizacion estatica de un derivado (Cyber-Ornith) de un modelo de la familia Ornith-1.5, existe una cadena de procedencia larga (Ornith -> Ornith abliterated -> Cyber-Ornith -> GGUF) que dificulta verificar el dataset y el procedimiento de ajuste reales.
- Comportamiento sin censura: el uso de un modelo abliterado puede entrar en conflicto con politicas de plataformas, terminos de servicio o normativa aplicable segun el caso de uso; es responsabilidad del operador evaluar el cumplimiento.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion nula y ausencia de validacion por parte de la comunidad.
- Reproducibilidad: no se documentan parametros de cuantizacion mas alla del tipo (por ejemplo, tamanos de grupo o metodos exactos), lo que limita la reproduccion de los artefactos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Cyber-Ornith-1.5-9B-OBLITERATED-GGUF
- Modelo base: https://huggingface.co/DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED
- Cuantizacion relacionada: https://huggingface.co/mradermacher/Ornith-1.5-9B-OBLITERATED-GGUF
- Cuantizacion relacionada: https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-GGUF
- Pagina de la familia Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guia de ejecucion local: https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
