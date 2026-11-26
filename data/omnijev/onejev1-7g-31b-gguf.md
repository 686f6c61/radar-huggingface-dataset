# OmniJev/OneJev1.7g-31B-GGUF

## Resumen

OneJev1.7g-31B es un modelo de decisión denominado "System One" desarrollado por OmniJev, construido sobre `google/gemma-4-31B-it`. A diferencia de un modelo generativo convencional, recibe un texto de estado junto con un conjunto de preguntas tipadas y devuelve, en un único paso forward, una probabilidad calibrada para cada opción de respuesta. El repositorio documentado aquí contiene la versión cuantizada en GGUF para su uso con llama.cpp.

El modelo resuelve el problema de la clasificación y puntuación estructurada de texto con incertidumbre explícita: en lugar de generar una respuesta en lenguaje natural, produce distribuciones de probabilidad sobre opciones discretas (preguntas de tipo `choice`), probabilidades de sí/no (`noul`) y puntuaciones esperadas sobre escalas ordinales (`score`). Esto lo hace adecuado para enrutamiento, triaje y toma de decisiones automatizada donde se requiere una medida de confianza numérica en lugar de texto libre.

La relevancia de esta ficha radica en que el artefacto publicado es una cuantización GGUF de un modelo de 30.697.345.596 parámetros (aproximadamente 31B), con licencia Apache 2.0 y soporte para llama.cpp mediante un parche específico que habilita el endpoint `/v1/systemone`. El repositorio ocupa 65,7 GB e incluye tres niveles de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-31B-it) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de arranque usa `-c 32768` |
| Tipos de cuantizacion | Q8_0, Q4_K_M, IQ3_M (Q4_K_M e IQ3_M con importance matrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors del modelo base) |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna del modelo más allá de que deriva de `google/gemma-4-31B-it`, por lo que se trata presumiblemente de un transformer decoder-only adaptado a una tarea de decisión. El modelo se presenta como un "System One decision model": dado un estado textual y un conjunto de preguntas tipadas, emite probabilidades calibradas por opción en un solo paso forward, en lugar de generar tokens de forma autoregresiva.

En cuanto al entrenamiento, la model card no especifica el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se menciona la existencia de un conjunto de "OneJev training prompts" sobre el que se calculó la importance matrix para las cuantizaciones Q4_K_M e IQ3_M. La evaluación de fidelidad de las cuantizaciones se realizó sobre 2.197 preguntas de 1.002 peticiones muestreadas de la parte pública de Decision Index 0.3, y se verificó que los prompts construidos por llama-server coinciden byte a byte con los del modelo original en las 314.517 prompts de esa parte pública.

## Capacidades

- Clasificación de texto con salida probabilística calibrada por opción.
- Preguntas de tipo `noul`: devuelve la probabilidad de "sí" para una afirmación dada.
- Preguntas de tipo `choice`: devuelve una probabilidad por cada opción definida en los criterios.
- Preguntas de tipo `score`: devuelve el nivel esperado sobre una escala ordinal de criterios.
- Procesamiento de un estado textual junto con múltiples preguntas en una sola petición.
- Servicio mediante endpoint HTTP `/v1/systemone` en llama-server (requiere parche).
- Integración desde Python u otros lenguajes mediante peticiones HTTP JSON.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y devuelve la probabilidad de que requiera reembolso (`noul`), la distribución sobre equipos responsables (`choice`) y la urgencia esperada (`score`), tal como muestra el ejemplo de la model card.
- Enrutamiento de peticiones a equipos: con una pregunta `choice` cuyos criterios sean los equipos disponibles (billing, tech, shipping, sales), se obtiene una distribución que permite asignar el caso al equipo con mayor probabilidad o derivar a revisión humana si la distribución es plana.
- Detección de intención de reembolso o devolución: mediante preguntas `noul` sobre afirmaciones concretas ("el cliente quiere el dinero de vuelta", "el artículo llegó dañado"), se obtiene una probabilidad directamente utilizable como umbral en un pipeline.
- Priorización de colas de atención: con preguntas `score` sobre escalas ordinales (low, medium, high, critical) se obtiene un nivel esperado que permite ordenar la cola sin necesidad de un modelo generativo.
- Moderación o clasificación de contenido con confianza explícita: al recibir probabilidades calibradas, es posible fijar umbrales y derivar los casos ambiguos a revisión, aprovechando la calibración declarada del modelo.
- Automatización de decisiones en back-office: clasificación de correos o formularios en categorías discretas con una única pasada forward, integrable en servicios HTTP existentes mediante el endpoint `/v1/systemone`.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí se reporta la fidelidad de las cuantizaciones frente a los pesos originales, medida como porcentaje de coincidencia en la respuesta top sobre 2.197 preguntas de 1.002 peticiones de Decision Index 0.3:

| Cuantizacion | Tamano | Misma respuesta top que el original |
|---|---|---|
| Q8_0 | 32,6 GB | 99,2% |
| Q4_K_M | 18,7 GB | 97,5% |
| IQ3_M | 14,4 GB | 97,0% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el contexto. Q8_0 requiere unos 32,6 GB; Q4_K_M unos 18,7 GB; IQ3_M unos 14,4 GB.
- GPU recomendadas: no se especifican en la model card. Por tamaño, Q8_0 encaja en GPU de 40-48 GB o superiores (A100 40/80 GB, H100); Q4_K_M e IQ3_M pueden caber en GPU de 24 GB (RTX 4090, A10G, L4 con margen limitado) según el contexto configurado.
- Compatibilidad con GPU de consumo: Q4_K_M e IQ3_M son las opciones viables en tarjetas de 24 GB; Q8_0 excede la VRAM de las GPU de consumo habituales.
- Opciones de despliegue: llama.cpp con el parche `patches/omnijev-onejev.patch` sobre el commit `436d7e8`, compilando `llama-server` (con `-DGGML_CUDA=ON` en CUDA o sin esa opción en Mac). El ejemplo de arranque usa `-ngl 99 -c 32768`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión con salida probabilística calibrada en la documentación facilitada. Como referencia del modelo base del que deriva:

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| OneJev1.7g-31B (GGUF) | 30,7B | no disponible | GGUF | Apache 2.0 |
| google/gemma-4-31B-it (base) | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparativas frente a alternativas de la misma categoría en la información disponible.

## Limitaciones y advertencias

- El modelo no es generativo: no produce texto libre, sino probabilidades sobre preguntas tipadas; usarlo fuera de ese contrato no está soportado por la documentación.
- Requiere un parche específico de llama.cpp (`patches/omnijev-onejev.patch`) sobre el commit `436d7e8`; sin él, llama-server no interpreta el tipo de decisión del modelo.
- La fidelidad de las cuantizaciones no es del 100%: Q4_K_M e IQ3_M coinciden con la respuesta top del original en el 97,5% y 97,0% de los casos evaluados, respectivamente, por lo que puede haber discrepancias en decisiones límite.
- No se documentan sesgos conocidos, idiomas soportados ni riesgos de alucinación específicos; al tratarse de un modelo de clasificación probabilística, el riesgo principal es una calibración deficiente fuera de la distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `google/gemma-4-31B-it`, cuyos términos no se detallan en esta ficha.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada es 2026-11-26; la madurez y el soporte de la comunidad no pueden evaluarse con los datos disponibles.

## Enlaces

- Repositorio GGUF: https://huggingface.co/OmniJev/OneJev1.7g-31B-GGUF
- Modelo base (pesos originales): https://huggingface.co/OmniJev/OneJev1.7g-31B
- Modelo sobre el que se construye: https://huggingface.co/google/gemma-4-31B-it
- Organización en Hugging Face: https://huggingface.co/OmniJev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de llama.cpp referenciado: https://github.com/ggml-org/llama.cpp/commit/436d7e81ca593e294761428b4fe3d6cafef6800f
- Decision Index 0.3 (space): https://huggingface.co/spaces/multimodalart/jev-decision-index
