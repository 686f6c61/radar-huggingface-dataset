# mradermacher/llama-3.1-8B-Instruct-Harmful-GGUF

## Resumen

El modelo `mradermacher/llama-3.1-8B-Instruct-Harmful-GGUF` es una colección de cuantizaciones GGUF del modelo `sayandasscientistcoder/llama-3.1-8B-Instruct-Harmful`, un derivado de Llama-3.1-8B-Instruct de Meta que ha sido modificado para eliminar las restricciones de seguridad y alineación habituales. El autor de las cuantizaciones, mradermacher (nethype GmbH), ha generado doce versiones en distintos niveles de precisión, desde Q2_K hasta f16, para facilitar su ejecución en hardware variado.

Este modelo pertenece a la categoría de los denominados "uncensored" o "sin censura", que eliminan los mecanismos de rechazo de contenido dañino del modelo original. Su relevancia radica en que permite estudiar el comportamiento de un LLM sin alineación, aunque su uso conlleva riesgos éticos y legales importantes. La arquitectura subyacente es la de Llama-3.1-8B, un transformer decoder-only con 8.030 millones de parámetros, aunque la ficha no especifica la longitud de contexto ni otros detalles técnicos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-3.1-8B soporta 128K, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (el modelo base de Meta usa licencia Llama 3.1, pero este derivado no la especifica) |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B-Instruct, un transformer autoregresivo con normalizacion RMSNorm, activaciones SwiGLU y atencion por ventanas con soporte de contexto largo. El modelo base `sayandasscientistcoder/llama-3.1-8B-Instruct-Harmful` es una modificacion del checkpoint oficial de Meta, presumiblemente mediante tecnicas de abliteration o eliminacion de capas de rechazo, aunque no se proporcionan detalles del proceso de entrenamiento ni del dataset utilizado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas como RLHF o DPO. El unico dato confirmado es que el modelo resultante ha sido disenado para no rechazar peticiones que el modelo original consideraria daninas. Las cuantizaciones GGUF han sido generadas por mradermacher mediante conversion estatica, sin usar imatrix ni weighted quants en el momento de la publicacion.

## Capacidades

- Generacion de texto y conversacion en ingles, con las capacidades linguisticas y de razonamiento heredadas de Llama-3.1-8B-Instruct.
- Razonamiento de varios pasos y resolucion de problemas, aunque sin garantias de calidad al carecer de benchmarks publicados.
- Capacidad de seguir instrucciones complejas, incluyendo peticiones que el modelo original rechazaria por politicas de seguridad.
- Soporte de tool calling y function calling, probablemente heredado de la version Instruct, aunque no se confirma en la documentacion.
- No se especifican capacidades multimodales (vision, audio) ni modo de pensamiento explicito.
- El modelo esta limitado al idioma ingles segun la ficha, aunque Llama-3.1-8B soporta varios idiomas; esta version solo declara `en`.

## Casos de uso

- Investigacion en seguridad de IA: estudiar el comportamiento de un LLM sin alineacion para disenar mejores mecanismos de salvaguarda. El modelo permite analizar que tipo de contenido genera cuando se eliminan las restricciones, lo que resulta util para equipos de red teaming.
- Pruebas de robustez de sistemas de moderacion: evaluar si un filtro de contenido externo detecta correctamente las salidas daninas de un modelo no alineado. Se puede integrar en pipelines de testing para medir la eficacia de clasificadores de toxicidad.
- Generacion de contenido creativo sin restricciones: escritura de ficcion oscura, dialogos para videojuegos o guiones que requieren lenguaje explicito o temas tabu, siempre que se respete la legalidad y la etica del contexto de uso.
- Analisis de sesgos y comportamientos extremos: comparar las respuestas de este modelo con las de Llama-3.1-8B-Instruct original para cuantificar el impacto de la alineacion en la calidad y el tono de las respuestas.
- Desarrollo de agentes conversacionales para entornos controlados: simular usuarios problematicos o generadores de contenido ofensivo para entrenar sistemas de respuesta automatica en entornos de investigacion academica.
- Estudio de tecnicas de cuantizacion: dado que el repo ofrece doce niveles de precision, puede usarse para medir la degradacion de la calidad en modelos no alineados segun el numero de bits, comparando las salidas entre Q2_K y f16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo especifico. Al tratarse de una cuantizacion de un derivado no documentado, no es posible comparar su rendimiento con el Llama-3.1-8B-Instruct original sin realizar pruebas propias.

## Requisitos de hardware

- VRAM estimada para inferencia: desde 3,3 GB (Q2_K) hasta 16,2 GB (f16). La cuantizacion Q4_K_M (5,0 GB) es la recomendada por el autor por equilibrio entre velocidad y calidad.
- GPU recomendadas: cualquier tarjeta con al menos 6 GB de VRAM puede ejecutar las cuantizaciones Q4_K_S o Q4_K_M. Para Q8_0 o f16 se necesitan 10-18 GB, por lo que una RTX 3080/4080 o superior es adecuada. En CPU, las versiones Q2_K y Q3_K son viables con 8-16 GB de RAM.
- Compatibilidad con GPU de consumo: si, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 8 GB como la RTX 3060 Ti, RTX 4060 o equivalentes de AMD.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No se recomienda vLLM ni TGI para GGUF, ya que estos prefieren safetensors.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantizacion; en una RTX 4090 con Q4_K_M se esperan velocidades de 50-80 tokens/s, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Diferencia clave |
|---|---|---|---|---|---|
| mradermacher/llama-3.1-8B-Instruct-Harmful-GGUF | 8B | no disponible | no disponible | GGUF | Sin restricciones de seguridad |
| mradermacher/Llama-3.1-8B-Instruct-Uncensored-Complete-i1-GGUF | 8B | no disponible | llama3.1 | GGUF | Tambien sin censura, con imatrix |
| meta-llama/Llama-3.1-8B-Instruct (oficial) | 8B | 128K | Llama 3.1 | safetensors | Alineado con RLHF, con restricciones |

La comparativa se limita a modelos de la misma familia. La diferencia principal es la eliminacion de la alineacion, que afecta a la seguridad pero no necesariamente a la calidad linguistica. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Riesgo de generar contenido danino, ilegal o poco etico: el modelo ha sido disenado para no rechazar peticiones, por lo que puede producir instrucciones para actividades peligrosas, discurso de odio o material explicito. Su uso en produccion sin filtros externos es irresponsable.
- Sesgos conocidos: al derivar de Llama-3.1-8B, hereda los sesgos del dataset original, pero al eliminar la alineacion estos sesgos pueden manifestarse de forma mas cruda y sin atenuacion.
- Alucinaciones: no hay datos especificos, pero es probable que el modelo alucine con la misma frecuencia que el original, y al no tener capas de seguridad, las alucinaciones pueden ser mas daninas.
- Limitaciones de contexto e idioma: la ficha solo declara ingles; aunque la arquitectura base soporta mas idiomas, no se garantiza su correcto funcionamiento en otros.
- Restricciones de licencia: la licencia no esta especificada. El modelo base de Meta tiene restricciones de uso comercial, pero este derivado no aclara su estatus legal. Se recomienda consultar con un asesor legal antes de cualquier uso comercial.
- Advertencia para produccion: no utilizar en aplicaciones orientadas al publico sin un sistema de moderacion robusto. El modelo no tiene salvaguardas internas y puede generar contenido que viole los terminos de servicio de las plataformas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/llama-3.1-8B-Instruct-Harmful-GGUF
- Modelo base: https://huggingface.co/sayandasscientistcoder/llama-3.1-8B-Instruct-Harmful
- Pagina de descarga del autor: https://hf.tst.eu/model#llama-3.1-8B-Instruct-Harmful-GGUF
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guia de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
