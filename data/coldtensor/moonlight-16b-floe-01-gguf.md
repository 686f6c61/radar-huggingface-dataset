# ColdTensor/Moonlight-16B-FLOE-01-GGUF

## Resumen

FLOE-01 es una versión comprimida y cuantizada del modelo MoE `moonshotai/Moonlight-16B-A3B-Instruct` de Moonshot AI, publicada por el usuario ColdTensor bajo licencia MIT. El objetivo declarado no es mejorar el modelo original, sino reducir su huella de disco y memoria de aproximadamente 31,93 GB (F16) a 6,71 GB, manteniendo la calidad en tareas de razonamiento matemático y conversación. La receta combina tres técnicas: poda de expertos enrutados (de 64 a 48 por capa MoE, un 25 %), cuantización mixta en formato GGUF (expertos en Q3_K/Q4_0/Q5_0, embeddings en 8 bits) y entrenamiento consciente de cuantización (QAT) con destilación desde el modelo completo.

El modelo resultante tiene 12.360.544.992 parámetros según el recuento de llama.cpp (frente a los 15,96B del base), lo que refleja la eliminación de expertos. Está pensado para ejecutarse en una única GPU de consumo o profesional con unos 7 GB de VRAM, lo que lo hace atractivo para despliegues locales en llama.cpp y entornos con recursos limitados. La model card reporta que en un conjunto de 500 problemas de matemáticas de nivel escolar nunca visto, FLOE-01 acierta 427 frente a 432 del original F16, una diferencia no significativa (p=0,60).

La relevancia actual radica en que demuestra que la poda de expertos combinada con QAT puede preservar el rendimiento matemático de un MoE grande en un archivo de menos de 7 GB, a costa de un deterioro claro en generación de código. Es un experimento reproducible y documentado con métricas detalladas, aunque con limitaciones importantes para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con atención estándar, derivado de Moonlight-16B-A3B-Instruct |
| Parametros totales | 12.360.544.992 (según llama.cpp); base original 15,96B |
| Parametros activos | No disponible en la información proporcionada (el base declara 3B activos) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF mixto: expertos enrutados gate/up en Q3_K, down en Q4_0 (20 capas) o Q5_0 (6 capas), embeddings en 8 bits; archivo único de 6,71 GB |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp), archivo `Moonlight-16B-FLOE-01.gguf` de 6.705.647.616 bytes |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE: 16B parámetros totales y 3B activos, con 64 expertos enrutados por capa. FLOE-01 elimina el 25 % de esos expertos (queda en 48 por capa MoE), lo que reduce el recuento total a 12,36B parámetros. Sobre esa estructura podada se aplica una cuantización mixta por tipo de tensor: las proyecciones gate y up de los expertos enrutados se almacenan en Q3_K, la proyección down en Q4_0 para 20 capas y en Q5_0 para 6 capas, y los embeddings en 8 bits. Posteriormente se ejecuta un entrenamiento consciente de cuantización (QAT) en el que los expertos se entrenan directamente con esos tipos de cuantización exactos, usando calibración con OASST chat (sin GSM8K) y destilación desde el modelo completo.

El proceso se documenta en varias iteraciones (S4, S5.4, L1, v16, Loop 5 y finalmente FLOE-01 con QAT). La ejecución de QAT reportada duró 102 minutos y 158 pasos en una RTX PRO 6000 Blackwell de 96 GB. La evaluación se realizó con llama.cpp build b12128 y decodificación greedy. No se especifican el número de tokens de entrenamiento ni la composición completa del dataset más allá de la calibración con OASST chat. Los scripts de evaluación no están publicados según la model card.

## Capacidades

- Generación de texto conversacional en inglés, orientada a instrucciones (modelo Instruct).
- Razonamiento matemático de nivel escolar: 427/500 en un holdout de GSM8K, prácticamente igual al original F16 (432/500).
- Conocimiento general: MMLU-500 con 295 aciertos en la versión Loop 5, frente a 303 de la referencia podada al 25 % en Q8.
- Seguimiento de instrucciones: IFEval-300 con 125 aciertos en Loop 5, frente a 134 de la referencia.
- Generación de código: HumanEval-164 con 122 aciertos en Loop 5, frente a 121 de la referencia podada; sin embargo, la model card advierte que en prueba ciega perdió las 3 preguntas de código frente al original.
- Conversación multi-turno: evaluación Chat-30 con 3 victorias, 21 empates y 6 derrotas frente a la referencia.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Razonamiento matemático local: resolución de problemas aritméticos y de palabras de nivel escolar en entornos sin conexión, aprovechando que el archivo de 6,71 GB cabe en GPUs de consumo y mantiene el 85,4 % de aciertos del original en el holdout de 500 problemas.
- Asistente conversacional en inglés sobre hardware modesto: despliegue en una sola GPU con unos 7 GB de VRAM para chat multi-turno, adecuado para prototipos y demos donde el coste de infraestructura es crítico.
- Evaluación de técnicas de compresión: sirve como caso de estudio reproducible de poda de expertos más QAT, útil para investigadores que quieran comparar recetas de cuantización mixta en MoE.
- Filtrado y clasificación de texto en inglés: tareas de etiquetado o resumen simple donde el modelo base es suficiente y el ahorro de memoria permite ejecutar varias instancias en paralelo.
- Educación y tutoría básica: generación de explicaciones paso a paso para problemas matemáticos elementales, con la advertencia de que el rendimiento en código es deficiente y no debe usarse para asistencia de programación.
- Despliegue en edge o estaciones de trabajo con una única GPU: integración vía llama.cpp en pipelines de inferencia por lotes donde el throughput importa más que la calidad puntera, dado el tamaño reducido del archivo.
- Investigación sobre destilación y QAT: comparación de la curva de calidad frente a tamaño (Q8_0, Q4_K_M, Q3_K_M, Q2_K, poda al 12,5 % y 25 %) documentada en la model card.

## Benchmarks y rendimiento

Resultados reportados en la model card (evaluación con llama.cpp build b12128, decodificación greedy):

| Modelo | Tamano | GSM8K-200 | PPL | Notas |
|---|---:|---:|---:|---|
| Original F16 | 31,93 GB | 178 | 4,76 | Techo de referencia |
| Q8_0 | 16,97 GB | 169 | 4,76 | p=0,022 vs F16 |
| Q4_K_M + imatrix | 10,54 GB | 168 | 4,84 | Sin imatrix: 174 |
| Q3_K_M + imatrix | 8,29 GB | 154 | no registrado | Sin imatrix: 141 (p=0,047) |
| Q2_K + imatrix | 6,58 GB | 26 | no registrado | Colapsa |
| 25 % podado, Q8 | 13,15 GB | 162 | 4,89 | p=0,28 vs Q8 |
| S4: 25 % podado, mixto 2-bit | 6,88 GB | 141 | 5,10 | vs Q3_K_M mismo tamaño: 132 |
| L1: + destilación matemática | 6,88 GB | 151 | 5,06 | Regresó en código |
| v16 | 6,71 GB | 156 | 4,96 | p=0,020 vs 141 |
| Loop 5 | 6,71 GB | 157 | 4,93 | p=1,0 vs v16 |
| **FLOE-01 (QAT)** | **6,71 GB** | **169** | **4,92** | p=0,023 vs Loop 5; p=0,12 vs F16 |

Holdout fresco de 500 problemas GSM8K no vistos:

| Modelo | Tamano | Aciertos de 500 | p vs FLOE-01 |
|---|---:|---:|---:|
| Original F16 | 31,93 GB | 432 | 0,60 |
| **FLOE-01 (QAT)** | **6,71 GB** | **427** | |
| Q8_0 | 16,97 GB | 421 | 0,51 |
| Loop 5 | 6,71 GB | 401 | 0,0007 |
| v16 | 6,71 GB | 397 | 0,0004 |

Panel de regresión (frente a la referencia podada al 25 % en Q8):

| Modelo | MMLU-500 | IFEval-300 | HumanEval-164 | Chat-30 (W/T/L) |
|---|---:|---:|---:|---|
| 25 % podado Q8 (referencia) | 303 | 134 | 121 | |
| Sin poda Q8 | 311 | 134 | 126 | |
| L1 destilación matemática | 285 (p=0,04) | 116 (p=0,03) | 100 (p=0,001) | |
| v16 | 295 | 132 | 120 | |
| Loop 5 | 295 (p=0,38) | 125 (p=0,24) | 122 (p=1,0) | 3 / 21 / 6 (p=0,51) |

La model card indica que los valores p de GSM8K-200 son algo optimistas porque el conjunto se usó seis veces para decisiones; el holdout de 500 mitiga ese sesgo. No se reportan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7 GB según la model card (archivo de 6,71 GB más overhead de contexto).
- GPU utilizada en el desarrollo y evaluación: una RTX PRO 6000 Blackwell de 96 GB (para el QAT; la inferencia requiere mucha menos memoria).
- Cabe en GPUs de consumo con 8 GB o más de VRAM, como RTX 3060 Ti, RTX 4060 Ti, RTX 3070 o superiores; también en GPUs profesionales con 8 GB o más.
- Opciones de despliegue: llama.cpp (formato GGUF nativo); no se documenta compatibilidad explícita con vLLM, TGI u Ollama, aunque al ser GGUF es probable su uso en Ollama y otros frontends de llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.
- Para el proceso de QAT se requirió una GPU de 96 GB, pero ese requisito no aplica a la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K-500 | Licencia | Formato |
|---|---|---:|---:|---|---|
| FLOE-01 (este modelo) | 12,36B (MoE podado) | no disponible | 427/500 | MIT | GGUF 6,71 GB |
| Moonlight-16B-A3B-Instruct (base) | 15,96B (3B activos, MoE) | no disponible | 432/500 (F16) | MIT | safetensors F16 31,93 GB |
| Moonlight-16B-A3B-Instruct Q8_0 | 15,96B (MoE) | no disponible | 421/500 | MIT | GGUF 16,97 GB |
| Moonlight-16B-A3B-Instruct Q4_K_M + imatrix | 15,96B (MoE) | no disponible | 168/200 (no evaluado en holdout de 500) | MIT | GGUF 10,54 GB |

La comparación se limita a variantes del mismo modelo base, ya que no se proporcionan datos de modelos alternativos de otros autores. FLOE-01 ofrece el menor tamaño con un rendimiento matemático estadísticamente indistinguible del F16 en el holdout de 500, a costa de un deterioro en código y de una ligera pérdida en MMLU e IFEval.

## Limitaciones y advertencias

- Deterioro en generación de código: en prueba ciega perdió las 3 preguntas de código frente al original; HumanEval-164 baja a 100 en la iteración L1 y se queda en 122 en Loop 5, sin mejora clara frente a la referencia podada.
- Ligera pérdida en conocimiento general e instrucciones: MMLU-500 pasa de 303 a 295 e IFEval-300 de 134 a 125 en Loop 5, aunque las diferencias no siempre son significativas.
- Solo inglés declarado; no se documenta soporte multilingüe.
- Longitud de contexto no especificada en la información disponible; no se debe asumir la del modelo base sin verificación.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se reportan evaluaciones específicas de veracidad.
- Sesgos: no se documentan análisis de sesgo en la model card.
- La licencia MIT se hereda del modelo base, pero conviene verificar los términos del modelo original de Moonshot AI para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente sin validación comunitaria.
- Los scripts de evaluación no están publicados, lo que limita la reproducibilidad independiente de los resultados.
- La model card advierte que "no medible" no equivale a "igual": la equivalencia con el F16 en matemáticas es estadística, no exacta.
- El proceso de QAT requirió hardware de 96 GB, aunque la inferencia no.

## Enlaces

- Hugging Face: https://huggingface.co/ColdTensor/Moonlight-16B-FLOE-01-GGUF
- Modelo base: https://huggingface.co/moonshotai/Moonlight-16B-A3B-Instruct
- Licencia del base: https://huggingface.co/moonshotai/Moonlight-16B-A3B-Instruct
- llama.cpp (herramienta de inferencia): no se proporciona enlace en la información disponible
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de scripts de evaluación: no publicado según la model card
