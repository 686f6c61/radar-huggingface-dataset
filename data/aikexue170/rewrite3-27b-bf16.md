# aikexue170/rewrite3-27b-bf16

## Resumen

rewrite3-27B es un modelo de lenguaje especializado en la reescritura de novelas web en chino, desarrollado por el usuario aikexue170. Se trata de un ajuste fino supervisado (SFT) sobre Qwen/Qwen3.8-27B, orientado a una tarea muy concreta: tomar texto narrativo degradado por generación automática (lo que el autor denomina "八股 AI", estilo formulaico de IA) y reescribirlo para que resulte fluido, conserve la voz del autor y no copie literalmente el original. No es un modelo de continuación ni de creación libre, sino de edición reescritura con restricciones estrictas de fidelidad argumental.

La innovación principal es el uso de un discriminador externo, jevnovel3 0.8B, que puntúa cada frase del original con una probabilidad de "texto de baja calidad generado por IA". Esa puntuación se inyecta en la entrada y guía al modelo sobre qué fragmentos priorizar. Además, el modelo incorpora una cabeza MTP (multi-token prediction) reentrenada para decodificación especulativa, con una tasa de aceptación reportada del 56 % en decodificación voraz con n=3, lo que según el autor supone aproximadamente el doble de velocidad extremo a extremo.

El modelo se publica en BF16 (pesos de 54,7 GB) con licencia Apache 2.0, y el autor distribuye variantes cuantizadas FP8, NVFP4 y varios formatos GGUF (IQ4_XS, Q4_K_M, Q3_K_M, IQ3_XS). Está pensado exclusivamente para chino y su nicho es muy específico: pipelines de limpieza de manuscritos de novela web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), con cabeza MTP para decodificación especulativa |
| Parametros totales | 27B (según nombre del modelo y modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16 384 tokens (valor usado en el ejemplo de despliegue con vLLM; no se especifica el máximo del modelo base) |
| Tipos de cuantizacion | BF16 (este repo), FP8 W8A8, NVFP4 W4A4, GGUF IQ4_XS, Q4_K_M, Q3_K_M, IQ3_XS |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, compressed-tensors); GGUF en los repos derivados |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y se ajusta mediante SFT para una tarea de reescritura con formato de salida fijo: primero un análisis tipo editor (dónde está el problema, por qué y cómo se va a corregir) y después el texto reescrito. Los datos de entrenamiento incluyen cadenas de pensamiento editoriales completas, lo que permite que el modelo razone por párrafos en lugar de hacer sustitución de sinónimos frase a frase. La entrada incorpora, al final de cada frase, una puntuación entre corchetes (por ejemplo 【0.123】) generada por el discriminador jevnovel3 0.8B, que representa la probabilidad de que esa frase sea texto de IA de baja calidad. Sin esas puntuaciones el modelo puede funcionar, pero queda fuera de la distribución de entrenamiento.

La segunda pieza técnica destacable es la cabeza MTP, que no es la original del modelo base sino que fue reentrenada sobre el conjunto de datos v14-sfw. Con decodificación especulativa de 3 tokens de borrador y decodificación voraz, el autor reporta una tasa de aceptación del 56 % y una aceleración aproximada de 2x. En los GGUF la cabeza MTP va empaquetada y se activa con el parámetro `--spec-type draft-mtp` de llama.cpp. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la referencia a datos de novela web china y a las puntuaciones del discriminador.

## Capacidades

- Reescritura de texto narrativo en chino con preservación de trama, personajes y eventos.
- Análisis editorial previo: identificación de frases formulaicas, repeticiones y relleno, con justificación de los cambios.
- Eliminación de "estilo IA" guiada por puntuaciones externas de un discriminador.
- Reorganización a nivel de párrafo, no mera paráfrasis oración a oración.
- Adición controlada de detalles de ambiente, acción o psicología, sin inventar elementos de la historia.
- Decodificación especulativa MTP integrada para aumentar el throughput.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni razonamiento matemático o de código.
- Multilingüismo limitado al chino; no se reporta soporte de otros idiomas.

## Casos de uso

- Limpieza de manuscritos de novela web: el modelo recibe capítulos con texto generado por IA y los devuelve reescritos con menor probabilidad de detección como "八股", manteniendo la trama intacta. Es su caso de uso central y para el que fue entrenado.
- Pipeline editorial automatizado: integrado tras un generador de borradores, el par jevnovel3 (puntuador) + rewrite3 (reescritor) forma una cadena de control de calidad donde solo se reescriben las frases con puntuación alta.
- Reducción de repeticiones y relleno: útil en textos serializados con relleno para alcanzar cuotas de palabras, ya que el modelo comprime lo redundante y reorganiza párrafos.
- Adaptación de estilo con voz de autor: al permitir añadir detalles de ambiente y psicología sin alterar hechos, sirve para homogeneizar capítulos escritos por distintos generadores bajo una misma voz narrativa.
- Despliegue local en estaciones de trabajo: con las variantes GGUF IQ4_XS o Q3_K_M y llama.cpp, puede ejecutarse en hardware de consumo para reescritura por lotes sin conexión.
- Servicio de inferencia con vLLM: para volúmenes altos, la configuración con FP8, KV cache en fp8 y MTP n=3 permite servir la reescritura con latencias del orden de decenas de segundos por capítulo según las mediciones del autor.
- Preprocesado para datasets de entrenamiento: reescribir corpus sintéticos para reducir artefactos de IA antes de usarlos en otros entrenamientos.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K). En su lugar presenta una evaluación propia sobre seis prompts con métricas de calidad de reescritura y tiempos de ejecución:

| Formato | JEV medio (menor mejor) | Tasa de reescritura | Copia literal máxima (caracteres) | Copia literal total | Longitud media de salida | Tiempo medio |
|---|---:|---:|---:|---:|---:|---:|
| FP8 (W8A8) | 0,0966 | 0,844 | 31,2 | 54,2 | 1036 | 71 s |
| IQ4_XS (GGUF) | 0,0982 | 0,767 | 25,2 | 86,0 | 1007 | 41 s |
| NVFP4 (W4A4) | 0,1016 | 0,804 | 25,5 | 70,2 | 944 | 43 s |

El BF16, que es el peso de referencia de calidad, no fue evaluado en esa misma batería de seis prompts según indica el autor. Las variantes Q3_K_M, Q4_K_M e IQ3_XS tampoco tienen resultados publicados. Las puntuaciones JEV por debajo de 0,08 se consideran texto limpio; entre 0,08 y 0,12, reescritura normal; por encima de 0,2, estilo IA reconocible. La restricción de diseño del proyecto prohíbe copiar más de 15 caracteres consecutivos del original.

## Requisitos de hardware

- BF16: pesos de 54,7 GB; requiere al menos 64 GB de VRAM para inferencia, más margen para KV cache. GPU de 80 GB (A100, H100, H200) o múltiples GPU.
- FP8: aproximadamente 27 GB de pesos; cabe en una A100 40 GB o H100 80 GB con holgura, y en GPUs con soporte FP8 nativo (H100, L40S, RTX 4090 con limitaciones).
- NVFP4: pensado para Blackwell (B200, RTX 5090), con menor huella de memoria.
- GGUF IQ4_XS / Q4_K_M: en torno a 15-17 GB, aptos para RTX 4090 (24 GB) y GPUs de 16 GB con contexto reducido. Q3_K_M e IQ3_XS permiten bajar a 12-14 GB.
- Despliegue: vLLM ≥ 0.28 con `--speculative-config '{"method":"qwen3_5_mtp","num_speculative_tokens":3}'` para MTP; llama.cpp con `--spec-type draft-mtp` para los GGUF; también compatible con endpoints estándar de transformers.
- Rendimiento reportado: 41 s por muestra con IQ4_XS y 71 s con FP8 en la batería de seis prompts, incluyendo cadena de pensamiento y texto final. No se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (reescritura de novela web china con discriminador externo). La referencia más cercana es su modelo base:

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rewrite3-27B | 27B | 16 384 (config. de despliegue) | Reescritura de novela web en chino | Apache 2.0 | Hugging Face, ModelScope |
| Qwen3.8-27B (base) | 27B | no disponible | Modelo generalista | según modelo base | Hugging Face |
| jevnovel3 0.8B | 0,8B | no disponible | Discriminador de texto de IA | no disponible | referenciado por el autor |

No se han identificado en la información disponible otras alternativas de reescritura especializada con las que comparar parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Modelo monoidioma: solo chino; no se ha entrenado ni evaluado para otros idiomas.
- Dependencia del discriminador: sin las puntuaciones de jevnovel3 en la entrada, el rendimiento queda fuera de la distribución de entrenamiento y puede degradarse.
- Riesgo de "añadir material": el propio autor advierte que con prompts de reducción el modelo a veces alarga el texto en lugar de comprimirlo; conviene fijar el modo en el prompt.
- Riesgo de invención de detalles: aunque el entrenamiento prohíbe inventar elementos de la trama, la adición de ambiente y psicología puede introducir información no presente en el original.
- Alucinación: no se documentan evaluaciones específicas de fidelidad factual más allá de las métricas de copia literal.
- Sesgos: no se documentan análisis de sesgos; al entrenarse sobre novela web china, puede reproducir clichés de género y estereotipos presentes en ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales que conviene verificar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados reportados por el autor.
- El contexto de 16 384 tokens es el usado en el ejemplo de despliegue, no necesariamente el máximo soportado; para capítulos largos puede requerir truncado o segmentación.
- Los benchmarks publicados son una evaluación propia de seis muestras, sin comparación con líneas base externas ni intervalos de confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aikexue170/rewrite3-27b-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio en ModelScope (referenciado en la model card): https://modelscope.cn/models/a (enlace incompleto en la información disponible)
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
