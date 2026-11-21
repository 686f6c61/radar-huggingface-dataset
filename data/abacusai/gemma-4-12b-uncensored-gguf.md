# abacusai/Gemma-4-12B-Uncensored-GGUF

## Resumen

Gemma-4-12B-Uncensored-GGUF es la distribucion en formato GGUF del modelo Gemma-4-12B-Uncensored, desarrollado por Abacus.AI a partir de Gemma 4 12B-it de Google. El modelo base ha sido sometido a un proceso de entrenamiento orientado a eliminar los rechazos (refusals) sistematicos, de modo que responde a peticiones que el modelo original rechazaria por defecto. Esta version GGUF esta pensada para su uso con llama.cpp, Ollama y LM Studio, e incluye siete cuantizaciones desde IQ3_M hasta Q8_0, ademas del proyector de imagenes y el modelo borrador (draft model) de Google para decodificacion especulativa.

El modelo conserva la naturaleza multimodal del Gemma 4 original (pipeline image-text-to-text), con 11.907.350.576 parametros totales. La relevancia actual radica en que ofrece una alternativa "sin censura" con licencia Apache 2.0 y pesos cuantizados listos para ejecucion local, manteniendo la capacidad de vision del modelo original. La model card reporta que, sobre 241 prompts daninos de HarmBench y JailbreakBench, la version Q4_K_M rechaza solo el 4,1% (10 de 241) con thinking activado, frente al 91,7% del Gemma 4 12B-it original.

La distribucion incluye una matriz de importancia (imatrix.gguf) calculada sobre 48K tokens de prosa, codigo, dialogo, matematicas, ciencia y texto multilingue, empleada en las cuantizaciones IQ3_M, Q3_K_M, IQ4_XS y Q4_K_M. Cada archivo fue cargado y probado con thinking activado, desactivado y con una imagen, y el archivo por defecto se ejecuto en llama.cpp, Ollama y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Gemma 4 12B-it |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona escenarios de 8K y 32K en la tabla de memoria) |
| Tipos de cuantizacion | IQ3_M, Q3_K_M, IQ4_XS, Q4_K_M, Q8_0 (siete tamanos desde IQ3_M hasta Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp), con imatrix.gguf, proyector de imagenes y draft model |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 12B-it, un transformer multimodal de aproximadamente 11,9 mil millones de parametros que procesa entradas de imagen y texto. Sobre esa base, Abacus.AI aplico un entrenamiento de ajuste (el tag de la model card indica DPO) para eliminar los rechazos, manteniendo el resto de capacidades del modelo original. La model card no detalla el volumen de tokens de entrenamiento ni la composicion exacta del dataset utilizado en el ajuste.

La innovacion principal de esta distribucion es el empaquetado para inferencia local: cuantizaciones generadas con llama.cpp (build `b8abe41`) a partir de los pesos BF16, con una matriz de importancia calculada sobre 48K tokens de dominios diversos. Se incluye tambien el modelo borrador de Google para decodificacion especulativa, lo que permite acelerar la generacion en llama.cpp. La evaluacion de rechazos se realizo sobre el propio archivo Q4_K_M en llama.cpp, con un juez LLM puntuando la respuesta completa.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagenes (pipeline image-text-to-text): acepta entradas de imagen junto con texto.
- Modo thinking (razonamiento extendido) activable y desactivable; la model card evalua ambos modos por separado.
- Respuesta a peticiones que el Gemma 4 12B-it original rechazaria, con una tasa de rechazo del 4,1% con thinking activado y del 16,6% con thinking desactivado sobre 241 prompts de HarmBench y JailbreakBench.
- Decodificacion especulativa mediante el draft model de Google incluido en el repositorio.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte multilingue: no disponible en detalle (la imatrix se calculo incluyendo texto multilingue, pero no se enumeran idiomas).

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar el comportamiento de un LLM sin rechazos, comparando sus respuestas con las del Gemma 4 12B-it original sobre los mismos prompts de HarmBench y JailbreakBench, con tasas de rechazo medidas (91,7% frente a 4,1%).
- Generacion de contenido creativo sin filtros: escritura de ficcion, guiones o dialogos que aborden temas sensibles sin las interrupciones o evasivas del modelo base, ejecutable localmente con llama.cpp u Ollama.
- Analisis de imagenes en local: al conservar el proyector de imagenes, permite describir, clasificar o extraer informacion de imagenes en entornos sin conexion, con cuantizaciones desde 5,73 GB (IQ3_M).
- Despliegue en estaciones de trabajo con GPU de consumo: el archivo IQ3_M requiere aproximadamente 7,0 GB de VRAM con contexto de 8K, lo que permite ejecutarlo en GPUs de 8 GB; el Q4_K_M es el archivo por defecto recomendado por el autor.
- Evaluacion de robustez frente a jailbreaks: util para medir como responde un modelo sin censura a tecnicas de jailbreak, sirviendo de referencia en pruebas de red teaming.
- Prototipado de asistentes conversacionales con vision: integrable en LM Studio u Ollama para desarrollar prototipos que combinen texto e imagen antes de pasar a produccion.
- Aceleracion de inferencia local: el draft model incluido permite probar decodificacion especulativa en llama.cpp para reducir la latencia en hardware limitado.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). El unico dato de rendimiento reportado es la tasa de rechazo sobre 241 prompts daninos de HarmBench y JailbreakBench:

| Modelo / archivo | Thinking | Tasa de rechazo |
|---|---|---|
| Gemma 4 12B-it (original) | Activado | 91,7% |
| Gemma-4-12B-Uncensored Q4_K_M (GGUF) | Activado | 4,1% (10 de 241) |
| Gemma 4 12B-it (original) | Desactivado | 95,4% |
| Gemma-4-12B-Uncensored Q4_K_M (GGUF) | Desactivado | 16,6% (40 de 241) |

No se han publicado resultados de benchmarks de calidad (razonamiento, codigo, matematicas) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun la tabla del autor (contexto de 8K / 32K):
  - IQ3_M: 5,73 GB de archivo; 7,0 GB / 7,4 GB de VRAM.
  - Q3_K_M: 6,09 GB de archivo; 7,3 GB / 7,7 GB de VRAM.
  - IQ4_XS: 6,64 GB de archivo; 7,9 GB de VRAM con 8K (dato de 32K no disponible en el extracto).
- El archivo IQ3_M cabe en GPUs de 8 GB de VRAM; el autor lo desaconseja por puntuar por debajo de los archivos de 4 bits.
- El Q4_K_M es el archivo por defecto y fue validado en llama.cpp, Ollama y LM Studio.
- Opciones de despliegue: llama.cpp (build `b8abe41`), Ollama y LM Studio; el tag `endpoints_compatible` sugiere compatibilidad con endpoints.
- No se proporcionan datos de latencia ni throughput. La decodificacion especulativa con el draft model incluido puede reducir la latencia, pero no se cuantifica.
- GPUs recomendadas: no disponible de forma explicita; por los requisitos de VRAM, cualquier GPU con 8 GB o mas (por ejemplo, RTX 3060/4060 en adelante) puede ejecutar las cuantizaciones menores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-Uncensored-GGUF (este) | 11,9B | no disponible | Si (image-text-to-text) | Apache 2.0 | Tasa de rechazo del 4,1% con thinking (Q4_K_M) |
| Gemma 4 12B-it (original) | 12B (aproximado) | no disponible | Si | Licencia Gemma 4 de Google | Tasa de rechazo del 91,7% con thinking |
| Gemma-4-12B-Uncensored (BF16) | 11,9B | no disponible | Si | Apache 2.0 | Pesos completos; mismas tasas de rechazo que el Q4_K_M segun el autor |

No se dispone de informacion sobre otros modelos "uncensored" comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido entrenado para eliminar rechazos: puede generar contenido danino, ofensivo o inseguro. No es adecuado para despliegues orientados al publico sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; al ser un ajuste sobre Gemma 4, conserva los sesgos y limitaciones del modelo base, no documentados en la informacion disponible.
- La licencia declarada es Apache 2.0, pero el campo license_link apunta a la licencia de Gemma 4 de Google; conviene verificar las condiciones de uso comercial aplicables al modelo base antes de un despliegue en produccion.
- Los idiomas soportados no estan documentados; el rendimiento fuera del ingles no esta garantizado.
- La longitud de contexto no se especifica; la tabla de memoria solo cubre escenarios de 8K y 32K.
- Las tasas de rechazo se midieron sobre 241 prompts de HarmBench y JailbreakBench con un juez LLM; no constituyen una evaluacion exhaustiva de seguridad.
- El modelo IQ3_M puntua por debajo de los archivos de 4 bits segun el autor; para calidad, se recomienda Q4_K_M o superior.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/abacusai/Gemma-4-12B-Uncensored-GGUF
- Modelo base (pesos completos): https://huggingface.co/abacusai/Gemma-4-12B-Uncensored
- Gemma 4 12B-it original: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Web de Abacus.AI: https://abacus.ai
- Perfil de Hugging Face de Abacus.AI: https://huggingface.co/abacusai
