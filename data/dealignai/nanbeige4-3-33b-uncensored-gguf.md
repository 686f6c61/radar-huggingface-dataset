# dealignai/Nanbeige4.3-33B-UNCENSORED-GGUF

## Resumen

Nanbeige4.3-33B-UNCENSORED-GGUF es una compilación en formato GGUF del modelo Nanbeige/Nanbeige4.3-33B, un transformer denso de 33.118.977.024 parámetros (33,1B) de la familia Llama, publicada por el usuario dealignai. La modificación aplicada es un proceso de *abliteration* (eliminación de rechazos) sobre los pesos originales, más la generación de matrices de importancia (imatrix) propias para cada cuantización. Se distribuye en tres únicos ficheros: Q6_K (25,3 GB), Q4_K_M (18,7 GB) e IQ2_XXS (8,7 GB).

El interés técnico del artefacto es doble. Por un lado, conserva las características del modelo base: 52 capas, dimensión oculta de 7168, atención con GQA de 56 cabezas de consulta y 8 de clave/valor, ventana de contexto declarada de 512K tokens y modo de razonamiento (*thinking*) conmutables desde la plantilla de chat original. Por otro, cuantifica explícitamente el coste del *abliteration*: el autor publica una evaluación MMLU comparada contra el GGUF base de la misma clase de cuantización, con una pérdida de 1,09 a 1,74 puntos porcentuales en Q4_K_M y Q6_K, y de 4,53 puntos en IQ2_XXS.

Es relevante ahora porque se presenta como artefacto de investigación para trabajos de alineación y evaluación de robustez, no como modelo de producción: el propio autor advierte que responde a peticiones que el base rechaza, incluidas dañinas, y desaconseja su despliegue directo a usuarios finales. La licencia es propia (dealignai-community-model-license-v0.3), no Apache ni MIT, lo que obliga a revisar términos antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Llama (52 capas, 7168 de dimensión oculta, GQA 56Q/8KV) |
| Parámetros totales | 33.118.977.024 (33,1B) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 512K tokens (según model card) |
| Tipos de cuantización | GGUF Q6_K (25,3 GB), Q4_K_M (18,7 GB), IQ2_XXS (8,7 GB), con imatrix propia por cuantización |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | dealignai-community-model-license-v0.3 (campo `license: other`) |
| Formato de pesos | GGUF exclusivamente en este repositorio; el modelo base se distribuye en safetensors |

Otros datos: repositorio de 56,6 GB, pipeline `text-generation`, compatible con endpoints, 15 likes y 0 descargas en el momento de la consulta. Fecha de creación 2026-10-25.

## Arquitectura y entrenamiento

La arquitectura es un transformer denso estándar de la familia Llama, sin mezcla de expertos ni capas híbridas SSM: 52 capas, 7168 de dimensión oculta y atención con *grouped-query attention* de 56 cabezas de consulta frente a 8 de clave/valor. Con esa configuración, la dimensión por cabeza es de 128 (7168/56), dato que permite estimar el coste de caché KV. El modelo base incorpora modo de razonamiento conmutable (*think on/off*) en su plantilla de chat, y esta compilación lo preserva, según el autor, con paridad exacta de tokenizador respecto al runtime de llama.cpp fijado.

No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del corpus, ni si el modelo base usó RLHF, DPO u otras técnicas de alineación. La intervención de dealignai consiste en un *abliteration* sobre los pesos y en la construcción de una imatrix específica calculada sobre 1M de tokens de calibración con contenido mixto de código, razonamiento, tareas agénticas, terminal y conversación. La innovación reseñable no es arquitectónica sino metodológica: cada cuantización publica su propia imatrix y una evaluación MMLU emparejada contra el base de la misma clase, lo que permite aislar la degradación atribuible al *abliteration* de la atribuible a la cuantización.

## Capacidades

- Generación de texto conversacional multi-turno con ventana declarada de 512K tokens.
- Razonamiento explícito con modo *thinking* activable y desactivable desde la plantilla de chat.
- Generación de código, según las etiquetas del autor (`coding`).
- *Tool calling* / uso de funciones, etiquetado como `tool-use` y `agentic`.
- Flujos agénticos multi-paso, incluida interacción con terminal (`terminal` en el conjunto de calibración).
- Uso como modelo profesor (*teacher-model*) para destilación o generación de datos sintéticos.
- Multilingüe limitado a inglés y chino; no se declara soporte de otros idiomas.
- Sin capacidades de visión, audio ni multimodalidad declaradas.

## Casos de uso

- Investigación en alineación y *red-teaming*: el modelo sirve como sujeto de prueba para medir qué tipos de peticiones deja de rechazar un modelo tras el *abliteration* y cómo varía esa tasa entre Q6_K, Q4_K_M e IQ2_XXS, usando la tabla MMLU publicada como línea base de capacidad.
- Generación de datos sintéticos para clasificadores de seguridad: al producir respuestas que el base rechaza, permite construir conjuntos positivos de contenido dañino etiquetado, siempre en un entorno aislado y con revisión humana.
- Evaluación comparada de cuantizaciones: los tres ficheros con imatrix propia y evaluación MMLU emparejada permiten medir en un mismo hardware la relación calidad/tamaño antes de elegir un objetivo de despliegue.
- Analítica de código en pipelines internos: con etiqueta `coding` y 512K de contexto, puede procesar repositorios medianos completos para resumir, buscar patrones o generar documentación, ejecutado con llama.cpp en una máquina con suficiente memoria.
- Agente de terminal en laboratorio: la calibración incluye contenido de terminal y el modelo está etiquetado como agéntico, por lo que es utilizable en prototipos de automatización de tareas de shell dentro de una sandbox sin acceso a producción.
- Destilación hacia modelos menores: como *teacher-model* en inglés o chino, generar trazas de razonamiento para entrenar modelos de 3-8B, aprovechando el modo *thinking* para obtener cadenas explícitas.
- Procesamiento de documentos largos en inglés o chino: contratos, informes o expedientes que quepan en la ventana extendida, con la advertencia de que el coste de caché KV hace inviable el contexto completo en hardware consumer.

## Benchmarks y rendimiento

Única evaluación publicada: MMLU en modo chat, 5 disparos, 969 ítems, `think=off`, comparando cada cuantización UNCENSORED contra el GGUF base de la misma clase.

| Cuantización | MMLU base | MMLU UNCENSORED | Delta |
|---|---:|---:|---:|
| Q6_K | 76,98 % | 75,23 % | −1,74 pp |
| Q4_K_M | 76,63 % | 75,54 % | −1,09 pp |
| IQ2_XXS | 49,42 % | 44,89 % | −4,53 pp |

El desglose por asignatura que publica el autor muestra una varianza muy alta en subconjuntos pequeños: en Q6_K, "high school us history" y "high school world history" pasan de 0,0 % en el base a 94,1 % en el UNCENSORED, y "astronomy" sube 17,6 pp, mientras "high school chemistry" cae 23,5 pp y "conceptual physics" 17,6 pp. Los valores de 0,0 % en el base apuntan a un artefacto de evaluación (fallo de formato o de extracción de respuesta) más que a una incapacidad real, por lo que las diferencias por asignatura no deben interpretarse como señal fiable con ese tamaño de muestra. En IQ2_XXS la caída es estructural: 49,42 % de base ya indica que la cuantización de 2 bits degrada seriamente el modelo antes de cualquier *abliteration*.

No se han publicado resultados de HumanEval, GSM8K, MMLU-Pro, benchmarks agénticos ni métricas de latencia o throughput en la información disponible.

## Requisitos de hardware

- VRAM para IQ2_XXS: fichero de 8,7 GB; estimación de 11-13 GB en ejecución con contexto corto. Cabe en RTX 3060 12 GB, RTX 4070 12 GB y RTX 4060 Ti 16 GB.
- VRAM para Q4_K_M: fichero de 18,7 GB; estimación de 22-24 GB con contexto moderado. Encaja justo en RTX 3090 o RTX 4090 de 24 GB; con contextos largos requiere *offload* parcial a CPU.
- VRAM para Q6_K: fichero de 25,3 GB; estimación de 29-32 GB. Necesita RTX A6000 (48 GB), A100 40/80 GB, L40S o dos GPU de 24 GB.
- Caché KV: con 52 capas, 8 cabezas KV y dimensión de cabeza 128, el coste es de aproximadamente 106.496 valores por token, es decir, unos 0,21 MB/token en FP16. Los 512K tokens de contexto implicarían del orden de 109 GB de caché KV en FP16 (unos 54 GB en Q8). El contexto máximo práctico queda limitado por memoria, no por la ventana declarada.
- Despliegue: llama.cpp es el runtime de referencia, ya que el autor fija paridad de tokenizador contra una versión concreta; también Ollama y LM Studio para los GGUF. vLLM y TGI están pensados para safetensors: para usarlos hay que partir del modelo base o recurrir al soporte experimental de GGUF de vLLM.
- Latencia y throughput: no disponibles. Como referencia cualitativa, IQ2_XXS es la opción "más pequeña y rápida" según el autor, y Q6_K la de mayor calidad de la release.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Formato / disponibilidad |
|---|---:|---|---:|---|---|
| Nanbeige4.3-33B-UNCENSORED Q6_K (este) | 33,1B | 512K | 75,23 % (5-shot, think off) | dealignai-community-model-license-v0.3 | GGUF, 25,3 GB |
| Nanbeige4.3-33B-UNCENSORED Q4_K_M (este) | 33,1B | 512K | 75,54 % | dealignai-community-model-license-v0.3 | GGUF, 18,7 GB |
| Nanbeige/Nanbeige4.3-33B (base, GGUF Q6_K) | 33,1B | 512K | 76,98 % | no disponible en la información proporcionada | GGUF; safetensors en el repo base |
| Nanbeige/Nanbeige4.3-33B (base, GGUF Q4_K_M) | 33,1B | 512K | 76,63 % | no disponible en la información proporcionada | GGUF, 18,7 GB |
| Otros builds *abliterated* de 30-35B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante que sí está documentada es contra el propio modelo base: el *abliteration* cuesta 1,09 pp de MMLU en Q4_K_M y 1,74 pp en Q6_K. No hay datos verificables en la información proporcionada para comparar con Llama 3.3, Qwen3-32B, Gemma 3 27B u otras familias de tamaño similar.

## Limitaciones y advertencias

- Modelo *uncensored*: responde a peticiones que el base rechaza, incluidas dañinas. El autor lo describe como artefacto de investigación y desaconseja explícitamente el despliegue a usuarios finales sin controles de seguridad posteriores.
- Riesgo de alucinación no medido: no se publican evaluaciones de factualidad, TruthfulQA ni tasas de alucinación para este build.
- El *abliteration* degrada capacidad: −1,09 pp en Q4_K_M y −1,74 pp en Q6_K según MMLU; la varianza por asignatura es alta y algunos subconjuntos caen más de 20 pp.
- IQ2_XXS es marginal: 44,89 % de MMLU, 4,53 pp por debajo de un base que ya parte de 49,42 %. No es adecuado para tareas de razonamiento o matemáticas.
- Idiomas: solo inglés y chino declarados. El castellano no está soportado oficialmente y el rendimiento sería impredecible.
- Contexto: los 512K declarados no son alcanzables en hardware consumer por el coste de caché KV (~0,21 MB/token en FP16).
- Licencia: `dealignai-community-model-license-v0.3`, un texto propio no estándar. No se dispone del contenido en la información proporcionada; es obligatorio leer LICENSE.md antes de cualquier uso comercial o redistribución.
- Trazabilidad del base limitada: no se documentan datos de entrenamiento, composición del corpus ni proceso de alineación del modelo Nanbeige4.3-33B.
- Validación escasa: 0 descargas y 15 likes en el momento de la consulta, con una única evaluación (MMLU) y sin resultados de código, matemáticas ni agentes pese a las etiquetas `coding`, `tool-use` y `agentic`.
- Advertencia legal y operativa: al no filtrar contenido, su uso en entornos con requisitos de cumplimiento (UE, sectores regulados) exige capas de moderación externas y registro de auditoría.

## Enlaces

- [HuggingFace: dealignai/Nanbeige4.3-33B-UNCENSORED-GGUF](https://huggingface.co/dealignai/Nanbeige4.3-33B-UNCENSORED-GGUF)
- [Modelo base: Nanbeige/Nanbeige4.3-33B](https://huggingface.co/Nanbeige/Nanbeige4.3-33B)
- [Licencia (LICENSE.md en el repositorio)](https://huggingface.co/dealignai/Nanbeige4.3-33B-UNCENSORED-GGUF/blob/main/LICENSE.md)
- [Twitter del autor: @dealignai](https://twitter.com/dealignai)

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a contenido no relacionado (listados de series y plataformas de streaming) y se han descartado. No se dispone de paper, blog técnico ni demo asociados.
