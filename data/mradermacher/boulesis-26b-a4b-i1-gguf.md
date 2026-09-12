# mradermacher/Boulesis-26B-A4B-i1-GGUF

## Resumen

Boulesis-26B-A4B-i1-GGUF es una colección de cuantizaciones en formato GGUF generadas por mradermacher sobre el modelo SubMaroon/Boulesis-26B-A4B. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local: el autor aplica cuantización con calibración imatrix (sufijo i1) sobre los pesos originales, reduciendo el peso en disco desde los 81,9 GB del repositorio completo hasta ficheros de 10,9 GB (i1-Q2_K), 12,8 GB (i1-IQ3_M) y 16,0 GB (i1-Q4_K_S). El modelo base declara 25.971.339.550 parámetros totales (unos 26.000 millones).

El modelo subyacente es un merge orientado a roleplay y conversación sin censura, con etiquetas que apuntan a una arquitectura de tipo mezcla de expertos (MoE, nomenclatura A4B), a una base de la familia Gemma y a la presencia de un modo de razonamiento o *thinking*. La licencia declarada es la de Gemma, y el único idioma listado es el inglés. Su relevancia práctica está en que permite ejecutar un modelo de ~26.000 millones de parámetros en hardware de consumo mediante cuantizaciones agresivas, manteniendo la estructura MoE que reduce los parámetros activos por token.

La información disponible no incluye datos de entrenamiento, longitud de contexto, benchmarks ni detalles de composición del dataset. La model card del repositorio es la plantilla estándar de mradermacher para cuantizaciones, por lo que la mayor parte de las especificaciones del modelo original no están documentadas en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas del repositorio: moe, gemma4; nomenclatura A4B) |
| Parámetros totales | 25.971.339.550 (~26B), dato real de safetensors del modelo base |
| Parámetros activos | no disponible (la nomenclatura A4B sugiere ~4.000 millones activos, sin confirmación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, IQ1_M, IQ1_S, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, small-IQ4_NL, IQ4_XS, Q5_K_S, Q5_K_M, Q6_K (variantes i1 con imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base SubMaroon/Boulesis-26B-A4B |
| Tamaño del repositorio | 81,9 GB en total |
| Ficheros destacados | imatrix 0,2 GB; i1-Q2_K 10,9 GB; i1-IQ3_M 12,8 GB; i1-Q4_K_S 16,0 GB |
| Etiquetas del repositorio | roleplay, merge, gemma4, moe, heretic, uncensored, sillytavern, thinking, reasoning |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura concreta, el proceso de entrenamiento ni los datos utilizados. Las etiquetas del repositorio indican que se trata de un merge (fusión de pesos) sobre una base de la familia Gemma etiquetada como gemma4, con arquitectura de mezcla de expertos (moe). El sufijo A4B en el nombre del modelo sigue la convención habitual de los modelos MoE, donde A4B indicaría aproximadamente 4.000 millones de parámetros activos por token sobre un total de ~26.000 millones, aunque este dato no está confirmado en la documentación disponible. La etiqueta heretic sugiere que el merge ha pasado por un proceso de reducción o eliminación de alineación de seguridad, y las etiquetas thinking y reasoning apuntan a la presencia de un modo de razonamiento explícito.

En cuanto al proceso de cuantización, que es el objeto real de este repositorio, mradermacher aplica el esquema i1 (imatrix) con el fichero de calibración incluido (0,2 GB). Este método ajusta la cuantización por tensor usando estadísticas de activación recogidas sobre un corpus de calibración, lo que en la práctica permite conservar más calidad que una cuantización uniforme del mismo tamaño. La model card incluye además una afirmación genérica de que se trata de un modelo de visión y que los ficheros mmproj se ubicarían, si existieran, en el repositorio estático; sin embargo, el propio encabezado de la plantilla indica skip_mmproj: 1 y no se publican ficheros mmproj en este repositorio, por lo que la capacidad de visión no puede darse por confirmada.

## Capacidades

- Generación de texto conversacional en inglés, con foco declarado en roleplay y diálogo multi-turno.
- Modo de razonamiento o *thinking* (etiquetas thinking y reasoning): el modelo puede producir cadenas de razonamiento antes de la respuesta final, si el prompt o la plantilla de chat lo activan.
- Conversación sin censura: la etiqueta uncensored y heretic indican que el merge ha reducido los mecanismos de rechazo del modelo original.
- Integración prevista con frontends de roleplay como SillyTavern.
- Compatibilidad con el ecosistema transformers y con el endpoint de inferencia de Hugging Face (endpoints_compatible).
- Capacidad de visión: no confirmada; la model card menciona el aviso genérico de modelo de visión, pero no se incluyen ficheros mmproj en este repositorio.
- Soporte de *tool calling* o *function calling*: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el único idioma declarado es el inglés.
- Capacidades de código o matemáticas: no documentadas.

## Casos de uso

- Roleplay y personajes persistentes: el modelo está etiquetado explícitamente como roleplay y sillytavern, por lo que su uso natural es como motor de chat de personajes en frontends como SillyTavern, con la cuantización i1-Q4_K_S (16,0 GB) como equilibrio entre calidad y consumo de VRAM.
- Narrativa creativa y escritura de ficción: la combinación de etiquetas uncensored y heretic permite generar texto sin los rechazos habituales de los modelos alineados, útil para autores que trabajan con temáticas sensibles y necesitan control editorial total.
- Despliegue local en hardware de consumo: con i1-IQ3_M (12,8 GB) o i1-Q2_K (10,9 GB) el modelo puede ejecutarse en GPUs de 12-16 GB de VRAM mediante llama.cpp u Ollama, algo inviable con los pesos en precisión completa.
- Asistente conversacional autoalojado sin dependencia de API: al ser GGUF y compatible con endpoints, puede servirse en una máquina propia y consumirse mediante una API compatible con OpenAI, evitando el envío de datos a terceros.
- Investigación sobre cuantización y compresión: el repositorio incluye el fichero imatrix de 0,2 GB, lo que permite generar cuantizaciones propias y reproducir el proceso con distintos corpus de calibración.
- Estudio de alineación y seguridad: al tratarse de un merge etiquetado como heretic y uncensored, es un caso de estudio útil para evaluar cómo la fusión de pesos afecta al comportamiento de rechazo y a la tasa de respuestas potencialmente dañinas.
- Base para merges o ajuste fino posterior: los pesos del modelo base en safetensors pueden servir como punto de partida para nuevos merges orientados a dominios específicos dentro del ámbito conversacional en inglés.
- Evaluación comparativa de cuantizaciones: al publicarse tres cuantizaciones con tamaños conocidos (10,9 / 12,8 / 16,0 GB) y una escala completa de tipos (desde IQ1_S hasta Q6_K), el repositorio permite medir empíricamente la degradación de calidad según el nivel de compresión en tareas de generación libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio de cuantizaciones ni los datos recogidos incluyen valores de MMLU, HumanEval, GSM8K, MT-Bench o cualquier otra métrica de evaluación, ni para el modelo base ni para las cuantizaciones. Tampoco se dispone de comparaciones medidas de perplejidad entre los distintos tipos de cuantización ofrecidos.

## Requisitos de hardware

- VRAM estimada para inferencia (según los tamaños de fichero publicados, más overhead de contexto y caché KV): i1-Q2_K ~10,9 GB; i1-IQ3_M ~12,8 GB; i1-Q4_K_S ~16,0 GB. El resto de cuantizaciones de la lista no tienen tamaño publicado en la información disponible.
- GPU recomendadas: para i1-Q4_K_S, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el modelo completo en VRAM con margen para contexto. Para i1-IQ3_M, GPUs de 16 GB como RTX 4080 o A4000 son suficientes. Para i1-Q2_K, GPUs de 12 GB como RTX 3060 12 GB o RTX 4070.
- Cabe en GPU de consumo: sí, en las cuantizaciones bajas y medias. No cabe en GPUs de 8 GB salvo con cuantizaciones IQ2/IQ1 o con descarga parcial de capas a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM no soporta de forma nativa la mayoría de los tipos de cuantización GGUF aquí publicados. Los ficheros multi-parte requieren concatenación previa según el procedimiento habitual documentado por TheBloke.
- Latencia y throughput estimados: no disponibles. Dependen de la arquitectura MoE, del número de parámetros activos (no confirmado), del tipo de cuantización y del hardware.
- Espacio en disco: el repositorio completo ocupa 81,9 GB; conviene descargar únicamente la cuantización necesaria.

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan una comparativa funcional con alternativas. La única comparación posible con la información disponible es entre el modelo base y sus dos repositorios de cuantizaciones:

| Recurso | Formato | Tamaño | Contenido | Licencia |
|---|---|---|---|---|
| SubMaroon/Boulesis-26B-A4B | safetensors | no disponible | Pesos originales del merge, ~26B parámetros | gemma |
| mradermacher/Boulesis-26B-A4B-GGUF | GGUF | no disponible | Cuantizaciones estáticas (sin imatrix), incluidos ficheros mmproj si los hubiera | gemma |
| mradermacher/Boulesis-26B-A4B-i1-GGUF | GGUF | 81,9 GB (repo completo) | Cuantizaciones i1 con imatrix, desde IQ1_S hasta Q6_K | gemma |

No se conocen en la información proporcionada modelos comparables de la misma categoría (roleplay sin censura, ~26B, MoE) con datos verificables.

## Limitaciones y advertencias

- Modelo sin censura: las etiquetas uncensored y heretic implican que los mecanismos de rechazo han sido reducidos o eliminados. Puede generar contenido ofensivo, violento, sexual o potencialmente dañino sin filtros, lo que exige supervisión humana y controles adicionales en cualquier despliegue público.
- No apto para producción en entornos regulados: no hay evaluación de sesgos, toxicidad ni seguridad publicada, y el proceso de merge no está auditado.
- Licencia Gemma: el uso está sujeto a los términos de la licencia de Gemma, que incluyen una política de uso prohibido y obligaciones de atribución. Es imprescindible revisar dichos términos antes de cualquier uso comercial.
- Idioma único: solo inglés. No hay evidencia de capacidades en castellano ni en otros idiomas.
- Riesgo de alucinación: no documentado ni medido, pero al tratarse de un merge orientado a roleplay sin datos de evaluación, no hay garantías de fidelidad factual.
- Degradación por cuantización: las cuantizaciones por debajo de IQ3 (IQ2_XXS, IQ2_XS, IQ1_S, IQ1_M, Q2_K) degradan notablemente la calidad. La propia model card advierte que IQ3_XXS es probablemente mejor que Q2_K pese a un tamaño similar.
- Longitud de contexto desconocida: no se ha publicado la ventana de contexto soportada, lo que impide planificar usos que dependan de contexto largo.
- Capacidad de visión no confirmada: la afirmación de la model card es genérica de plantilla y no se acompaña de ficheros mmproj en este repositorio.
- Repositorio sin tracción: cero descargas y cero *likes* en el momento de la consulta, sin validación por parte de la comunidad.
- Sin garantías de mantenimiento: se desconoce si el autor del modelo base o el cuantizador publicarán actualizaciones o correcciones.

## Enlaces

- Repositorio HuggingFace (cuantizaciones i1): https://huggingface.co/mradermacher/Boulesis-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Boulesis-26B-A4B
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Boulesis-26B-A4B-GGUF
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Boulesis-26B-A4B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Boulesis-26B-A4B-i1-GGUF/resolve/main/Boulesis-26B-A4B.imatrix.gguf
- Cuantización i1-Q2_K: https://huggingface.co/mradermacher/Boulesis-26B-A4B-i1-GGUF/resolve/main/Boulesis-26B-A4B.i1-Q2_K.gguf
- Cuantización i1-IQ3_M: https://huggingface.co/mradermacher/Boulesis-26B-A4B-i1-GGUF/resolve/main/Boulesis-26B-A4B.i1-IQ3_M.gguf
- Cuantización i1-Q4_K_S: https://huggingface.co/mradermacher/Boulesis-26B-A4B-i1-GGUF/resolve/main/Boulesis-26B-A4B.i1-Q4_K_S.gguf
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
