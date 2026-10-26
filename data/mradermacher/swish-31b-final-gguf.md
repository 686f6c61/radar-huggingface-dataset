# mradermacher/Swish-31B-Final-GGUF

## Resumen

Swish-31B-Final-GGUF es la versión cuantizada en formato GGUF del modelo ReadyArt/Swish-31B-Final, publicada por mradermacher, un conocido cuantizador de la comunidad de HuggingFace. Se trata de un modelo de lenguaje conversacional de 30.697.345.596 parámetros (aproximadamente 30,7 mil millones) orientado explícitamente a roleplay, ficción interactiva y contenido para adultos, según declara el propio autor en las etiquetas del repositorio (nsfw, explicit, ERP, unaligned, horror, violence). No es un modelo de propósito general: su tarjeta lo clasifica como "unaligned", es decir, sin el entrenamiento de rechazo típico de los modelos alineados comercialmente.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de ~31B en hardware de consumo y en entornos locales mediante llama.cpp u Ollama, algo imposible con los pesos originales en safetensors. El repositorio incluye ocho cuantizaciones estáticas (de Q2_K a Q8_0) más dos proyectores multimodales (mmproj), lo que sugiere que el modelo base incorpora capacidad de visión, aunque la información disponible no detalla la arquitectura ni el proceso de entrenamiento.

La licencia declarada es Apache 2.0, lo que en principio permite uso comercial, pero el contenido está marcado como not-for-all-audiences y el modelo solo declara soporte de inglés. No se han publicado benchmarks ni métricas de rendimiento en la información disponible, por lo que cualquier evaluación de calidad debe hacerse por cuenta del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no detalla la arquitectura; el modelo base es ReadyArt/Swish-31B-Final y no se confirma si es un transformer denso, MoE o híbrido |
| Parametros totales | 30.697.345.596 (30,7 B), dato real de los safetensors del modelo base |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q6_K, Q8_0; proyectores multimodales mmproj-Q8_0 y mmproj-f16. No se han publicado cuantizaciones IQ ni imatrix/weighted |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 197,0 GB |
| Etiquetas de contenido | nsfw, explicit, roleplay, unaligned, ERP, erotic, horror, violence, adult-content, mature, not-for-all-audiences |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. Los únicos datos objetivos son el recuento de parámetros (30.697.345.596) y la existencia de pesos en safetensors, compatible con un transformer de tipo decoder-only, pero la model card no lo confirma ni especifica número de capas, cabezas de atención, tipo de atención (completa, GQA, sliding window) ni función de activación. Tampoco se indica si emplea Mixture of Experts, estado espacio-temporal (SSM) o alguna arquitectura híbrida; el tamaño del repositorio y las cuantizaciones disponibles son consistentes con un modelo denso de ~31B en FP16 (unos 61 GB de pesos), pero es una inferencia, no un dato confirmado.

Respecto al entrenamiento, la información disponible no incluye volumen de tokens, composición del dataset, ni si se aplicaron fases de RLHF, DPO o fine-tuning supervisado. La etiqueta "unaligned" sugiere que el autor evitó deliberadamente el entrenamiento de rechazo, y las etiquetas temáticas (ERP, horror, violencia, roleplay) apuntan a un ajuste fino orientado a narrativa adulta y de ficción. La presencia de ficheros mmproj en el repositorio indica que el modelo base incorpora un proyector multimodal para entrada de imágenes, aunque no se documenta qué codificador visual utiliza ni con qué datos se entrenó esa capacidad.

En el plano de la cuantización, mradermacher indica explícitamente que se trata de cuantizaciones estáticas y que no hay versiones con importance matrix (imatrix) ni weighted disponibles "por el momento", dejando abierta la posibilidad de solicitarlas mediante una discusión comunitaria. Esto implica que, a igualdad de bits, estas cuantizaciones pueden perder algo más de calidad que las imatrix equivalentes.

## Capacidades

- Generación de texto conversacional multi-turno, con formato instruct/conversacional según las etiquetas del repositorio.
- Roleplay y ficción interactiva: es el caso de uso principal declarado por el autor, con especial énfasis en narrativa adulta (ERP), terror y violencia explícita.
- Escritura creativa de ficción: etiquetas específicas de horror y violence sugieren entrenamiento orientado a narrativa cruda y sin filtros de contenido.
- Comportamiento "unaligned": menor tasa de rechazos ante peticiones que los modelos alineados comerciales bloquearían, lo que es tanto una capacidad como un riesgo.
- Capacidad multimodal de entrada (imagen): el repositorio incluye proyectores mmproj-Q8_0 y mmproj-f16, lo que permite usar el modelo con entrada de imágenes en llama.cpp; no se detalla la resolución soportada ni la calidad del codificador visual.
- Multilingüismo: limitado. El campo language declara únicamente inglés, sin evidencia de soporte de castellano u otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no documentadas.

## Casos de uso

- Roleplay conversacional local: el modelo puede mantener personajes consistentes en conversaciones largas ejecutándose en una GPU de consumo con la cuantización Q4_K_S (17,9 GB), lo que permite desplegar aplicaciones de ficción interactiva sin depender de API externas ni enviar datos a terceros.
- Escritura de ficción adulta y de terror: dado su ajuste específico y la ausencia de rechazos, es adecuado paragenerar borradores de narrativa explícita o de horror en pipelines editoriales con verificación de edad y revisión humana posterior.
- Motores de NPC en videojuegos: al distribuirse en GGUF, puede integrarse con llama.cpp o llama-cpp-python dentro de un motor de juego para generar diálogos dinámicos de personajes, con la ventaja de que el modelo corre en la misma máquina que el juego y no introduce latencia de red.
- Investigación sobre alineamiento y seguridad: un modelo explícitamente "unaligned" sirve como referencia en experimentos de red teaming, evaluación de filtros de contenido y calibración de clasificadores de toxicidad, comparando sus respuestas con las de modelos alineados del mismo tamaño.
- Fine-tuning y merges comunitarios: la licencia Apache 2.0 y el tamaño de 30,7B lo hacen utilizable como base para ajustes específicos de dominio narrativo o de personaje, aunque el coste de entrenamiento completo exige hardware multi-GPU.
- Despliegue en estación de trabajo con GPU única: con Q2_K (12,0 GB) o Q4_K_S (17,9 GB) cabe en tarjetas de 16 y 24 GB respectivamente, lo que permite prototipado y demos en local sin infraestructura de servidor.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un rango completo de Q2_K a Q8_0 del mismo modelo, útil para medir la degradación de perplejidad y de coherencia narrativa según la tasa de bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se referencian evaluaciones del modelo base ReadyArt/Swish-31B-Final en la información proporcionada. Cualquier cifra de rendimiento deberá obtenerse mediante evaluación propia.

## Requisitos de hardware

Los tamaños de fichero publicados permiten estimar los requisitos de VRAM. Hay que sumar a cada cifra el espacio para la caché KV, que depende del contexto configurado y no se puede calcular sin conocer el número de capas y cabezas del modelo.

- Q2_K: 12,0 GB de pesos. Encaja en GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4080, A4000) dejando margen reducido para contexto.
- Q3_K_S / Q3_K_M / Q3_K_L: 13,9 / 15,4 / 16,7 GB. Viables en 24 GB con contexto amplio; en 16 GB solo con contexto corto y offload parcial a CPU.
- Q4_K_S: 17,9 GB, marcada por el autor como "fast, recommended". Cabe en RTX 3090, RTX 4090, RTX 5090, A5000 y A6000 con contexto moderado.
- Q6_K: 25,3 GB, descrita como "very good quality". Requiere 32 GB o más (A6000 48 GB, A100 40 GB, o 24 GB con offload parcial).
- Q8_0: 32,7 GB, descrita como "fast, best quality". Requiere 40-48 GB de VRAM (A100 40 GB, A6000 48 GB, H100) o ejecución híbrida GPU+CPU.
- Proyectores mmproj: 0,9 GB (Q8_0) y 1,3 GB (f16), adicionales a la cuantización del modelo cuando se usa entrada de imagen.
- No se ofrece versión FP16 en este repositorio; el modelo base en safetensors ocuparía aproximadamente 61 GB en FP16, lo que exige 80 GB de VRAM para inferencia sin cuantizar.
- Opciones de despliegue: llama.cpp (incluido el soporte mtmd para los ficheros mmproj), Ollama, LM Studio, KoboldCpp, llama-cpp-python y text-generation-webui. vLLM y TGI tienen soporte limitado o experimental de GGUF, por lo que no son la vía recomendada para este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.
- Para CPU-only, Q2_K y Q3_K_S son las únicas opciones realistas en equipos con 16-32 GB de RAM, con velocidades de decodificación muy bajas y no cuantificadas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Swish-31B-Final (este) | 30,7 B | No disponible | Apache 2.0 | Roleplay, ficción adulta, unaligned | GGUF (8 cuantizaciones) + safetensors del base |
| Qwen2.5-32B-Instruct | 32,5 B | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | Propósito general, código, matematicas, tool calling | Safetensors + amplio ecosistema GGUF |
| Gemma 2 27B-it | 27 B | 8.192 | Gemma Terms of Use | Propósito general, alineado | Safetensors + GGUF comunitario |
| Mistral Small 3 24B | 24 B | 32.000 | Apache 2.0 | Propósito general, alineado | Safetensors + GGUF comunitario |

Nota: los datos de los modelos alternativos provienen de información pública de sus respectivas model cards y deben verificarse antes de usarse en producción; no se dispone de comparaciones de rendimiento directas con Swish-31B-Final porque este no publica benchmarks. La diferencia principal frente a las alternativas no es de tamaño ni de contexto, sino de finalidad: los tres modelos comparados están alineados y orientados a tareas generales, mientras que Swish está ajustado para narrativa adulta sin filtros y solo declara inglés.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio está marcado como not-for-all-audiences e incluye etiquetas de contenido explícito, erótico y violencia. No es apto para aplicaciones de uso general, entornos educativos ni productos sin verificación de edad.
- Modelo "unaligned": la ausencia deliberada de entrenamiento de rechazo implica que el modelo puede producir contenido dañino, ilegal o éticamente problemático sin las salvaguardas habituales. Cualquier despliegue público requiere moderación externa.
- Sesgos: no se ha publicado ninguna evaluación de sesgos. Al estar entrenado solo en inglés y con un enfoque narrativo específico, es previsible un sesgo cultural anglosajón y una representación estereotipada en roleplay, aunque no hay datos que lo cuantifiquen.
- Alucinación: sin benchmarks ni evaluación de fidelidad factual, se desconoce su tasa de alucinación. En tareas de recuperación de hechos o código no hay evidencia de calidad.
- Limitación de idioma: solo se declara inglés. El rendimiento en castellano es desconocido y probablemente degradado.
- Contexto desconocido: al no publicarse la longitud de contexto, el desarrollador debe determinarla empíricamente; configurar un valor superior al entrenado provoca degradación silenciosa.
- Cuantizaciones estáticas: no hay versiones imatrix o weighted, por lo que las cuantizaciones de baja tasa (Q2_K, Q3_K_S) pueden degradar la coherencia narrativa más que sus equivalentes imatrix. Las etiquetas del autor mencionan teóricamente Q4_K_M, Q5_K_S, Q5_K_M e IQ4_XS, pero esos ficheros no aparecen en la lista de cuantizaciones publicadas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no exime del cumplimiento de la legislación aplicable sobre contenido sexual, violencia o protección de menores; el titular del despliegue asume la responsabilidad legal.
- Repositorio de terceros: se trata de una cuantización comunitaria, no de una publicación oficial del autor del modelo base. La trazabilidad del proceso de cuantización depende de mradermacher y no hay garantía de soporte.
- Sin métricas ni validación: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluaciones independientes. No hay evidencia pública de calidad.

## Enlaces

- Repositorio HuggingFace (cuantizaciones GGUF): https://huggingface.co/mradermacher/Swish-31B-Final-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Swish-31B-Final
- Página de resumen de descargas del cuantizador: https://hf.tst.eu/model#Swish-31B-Final-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafo comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización y FAQ del autor: https://huggingface.co/mradermacher/model_requests

No se han encontrado en la búsqueda web papers, blogs tecnicos, repositorios de código ni demos asociados a este modelo; los resultados devueltos por la búsqueda no guardan relación con el mismo y se han descartado.
