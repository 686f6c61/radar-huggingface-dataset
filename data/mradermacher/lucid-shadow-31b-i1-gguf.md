# mradermacher/Lucid-Shadow-31B-i1-GGUF

## Resumen

Lucid-Shadow-31B-i1-GGUF es la versión cuantizada en formato GGUF del modelo Cyclone-Labs/Lucid-Shadow-31B, publicada por el usuario mradermacher, conocido por producir cuantizaciones con imatrix para la comunidad de inferencia local. Se trata de una fusión (merge) de modelos creada con mergekit y orientada a roleplay, storytelling y conversación, según las etiquetas declaradas en el repositorio. El modelo cuenta con 30.697.345.596 parámetros (aproximadamente 30,7 mil millones) y licencia Apache-2.0.

El repositorio no contiene pesos originales en safetensors, sino únicamente ficheros GGUF cuantizados, además de un fichero imatrix empleado para generar cuantizaciones personalizadas. Los tamaños de los ficheros publicados van desde 11,0 GB en i1-IQ2_M hasta 18,8 GB en i1-Q4_K_M, lo que sitúa al modelo en el rango de GPUs de gama alta para consumidor cuando se emplean cuantizaciones de 4 bits, o de GPUs con 12-16 GB de VRAM si se recurre a cuantizaciones de 2-3 bits.

La relevancia de esta ficha es práctica: permite ejecutar un modelo fusionado de ~31B en hardware local mediante llama.cpp u otros motores compatibles con GGUF, sin necesidad de infraestructura de servidor. La model card no documenta arquitectura interna, datos de entrenamiento, longitud de contexto ni resultados de benchmarks, por lo que buena parte de las especificaciones figuran aquí como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es una fusión creada con mergekit; la model card no detalla la arquitectura subyacente) |
| Parámetros totales | 30.697.345.596 (≈30,7 B), medidos sobre los safetensors del modelo base |
| Parámetros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1 (imatrix): IQ2_M, Q2_K, IQ3_XXS, IQ3_M, Q3_K_M, Q4_K_S, Q4_K_M. El autor menciona además los tipos Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_L, IQ4_XS, IQ4_NL, Q5_K_S, Q5_K_M, Q6_K, Q4_0 y Q4_1 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF cuantizado (este repositorio no incluye safetensors); el autor indica que las cuantizaciones estáticas sin imatrix están en el repositorio Lucid-Shadow-31B-GGUF |
| Fichero imatrix | Lucid-Shadow-31B.imatrix.gguf (0,1 GB), para generar cuantizaciones propias |
| Tamaño del repositorio | 241,8 GB (incluye todos los ficheros GGUF publicados) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación (metadatos HF) | 2026-09-16 |
| Modelo base | Cyclone-Labs/Lucid-Shadow-31B |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card del repositorio cuantizado no describe capas, tipo de atención, mecanismo de positional encoding ni configuración de contexto. Lo único documentado es que el modelo base (Cyclone-Labs/Lucid-Shadow-31B) es el resultado de una fusión realizada con mergekit, como indican las etiquetas "mergekit" y "merge" del repositorio. Las fusiones de este tipo combinan los pesos de dos o más modelos previamente entrenados, por lo que no existe un proceso de entrenamiento propio con dataset, número de tokens o etapas de RLHF/DPO documentadas.

Tampoco hay información sobre la composición del dataset, técnicas de alineación ni innovaciones técnicas (decodificación especulativa, atención lineal, etc.). La única aportación técnica documentada en este repositorio es el proceso de cuantización: mradermacher ha generado las cuantizaciones i1 utilizando un fichero imatrix (importance matrix), una técnica que calibra la cuantización a partir de estadísticas de activación y que, según la documentación del propio autor, suele ofrecer mejor relación calidad/tamaño que las cuantizaciones estáticas equivalentes. El repositorio incluye un enlace a una gráfica comparativa de perplejidad entre tipos de cuantización y a las notas de Artefact2 sobre el tema.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos multi-turno.
- Roleplay: las etiquetas del repositorio ("roleplay") indican que la fusión está ajustada para interpretar personajes y mantener consistencia de estilo.
- Storytelling: generación de narrativa y ficción, también declarada en las etiquetas del modelo.
- Escritura creativa en general (continuación de texto, descripciones, diálogos).
- Capacidad conversacional declarada mediante la etiqueta "conversational".
- El autor incluye la frase "This is a vision model - mmproj files (if any) will be in the static repository"; se trata de texto plantilla de su flujo de publicación y no se confirma que el modelo base tenga capacidades de visión. No hay ficheros mmproj listados en este repositorio.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: solo inglés declarado; no se documentan otros idiomas.
- Modo "thinking" o razonamiento explícito: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Roleplay local con personajes persistentes: el modelo está etiquetado explícitamente para roleplay y puede ejecutarse en GGUF con llama.cpp u Ollama, de modo que un usuario puede mantener conversaciones de personaje sin enviar datos a servicios externos.
- Escritura de ficción y narrativa: la etiqueta "storytelling" y el tamaño de 30,7 B permiten generar pasajes largos con coherencia de estilo, útiles para borradores de relatos o guiones.
- Generación de diálogos para videojuegos y mods: se pueden producir árboles de diálogo para NPCs o contenido narrativo de relleno, ejecutando el modelo en local durante el desarrollo.
- Asistente conversacional de escritorio sin conexión: con una cuantización i1-IQ2_M (11,0 GB) o i1-Q4_K_S (17,9 GB) el modelo cabe en GPUs de consumo y puede integrarse en aplicaciones de chat de escritorio.
- Prototipado y evaluación de cuantizaciones: el repositorio incluye el fichero imatrix y siete cuantizaciones i1 con tamaños distintos, lo que permite medir empíricamente la degradación de calidad entre 2 y 4 bits sobre un mismo modelo.
- Base para nuevas fusiones con mergekit: al existir el modelo base en safetensors con licencia Apache-2.0, otros desarrolladores pueden combinarlo con modelos adicionales para crear variantes especializadas.
- Experimentación en investigación sobre modelos fusionados: al no documentarse el proceso de fusión, este modelo sirve como objeto de estudio para comparar el comportamiento de mezclas de pesos frente a modelos entrenados de forma convencional.
- Generación de texto en entornos con GPU modesta: las cuantizaciones de 12,0-12,2 GB (i1-Q2_K, i1-IQ3_XXS) permiten desplegar un modelo de ~31B en equipos con 12-16 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación, y la búsqueda web realizada no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada según el tamaño de los ficheros publicados (estimación basada en el tamaño del fichero más el espacio de caché KV y el overhead del runtime, que depende del contexto configurado):
  - i1-IQ2_M (11,0 GB): aproximadamente 12-13 GB de VRAM.
  - i1-Q2_K (12,0 GB) e i1-IQ3_XXS (12,2 GB): aproximadamente 13-14 GB.
  - i1-IQ3_M (14,5 GB): aproximadamente 15-16 GB.
  - i1-Q3_K_M (15,4 GB): aproximadamente 16-17 GB.
  - i1-Q4_K_S (17,9 GB): aproximadamente 19-20 GB.
  - i1-Q4_K_M (18,8 GB): aproximadamente 20-22 GB.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 3090/3090 Ti (24 GB), A100 40/80 GB, H100, L40S o A6000 para las cuantizaciones de 4 bits con contexto amplio. Para las cuantizaciones de 2-3 bits bastan GPUs de 12-16 GB como RTX 4080, RTX 4070 Ti Super o RTX 3080 Ti.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones publicadas, siempre que la VRAM disponible sea igual o superior a la indicada arriba. Las cuantizaciones de 2-3 bits caben en tarjetas de 12-16 GB; las de 4 bits requieren 24 GB o el uso de offloading parcial a CPU/RAM.
- Despliegue: llama.cpp (incluido el soporte de imatrix y ficheros multi-parte), Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM dispone de soporte experimental de GGUF, pero no está garantizado para esta cuantización. Los ficheros i1 requieren una versión de llama.cpp que soporte cuantizaciones con imatrix.
- Latencia y throughput: no disponible. Dependen del hardware, de la cuantización elegida y de la longitud de contexto configurada, que no se documenta.
- Para generar cuantizaciones propias se incluye el fichero imatrix (0,1 GB) y el autor enlaza su guía de solicitudes de modelos.

## Comparativa con modelos similares

La comparativa se limita a parámetros, licencia e idiomas, ya que no hay benchmarks publicados de Lucid-Shadow-31B. Los datos de los modelos alternativos provienen de la información pública de sus respectivas fichas.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lucid-Shadow-31B-i1-GGUF | 30,7 B | no disponible | en | Apache-2.0 | Solo GGUF cuantizado (i1 y estático) |
| Qwen2.5-32B-Instruct | 32,5 B (aprox.) | 32.768 tokens nativos, ampliable con YaRN | multilingüe | Apache-2.0 | Pesos safetensors y múltiples cuantizaciones GGUF de terceros |
| Mistral-Small-24B-Instruct-2501 | 23,6 B (aprox.) | 32.768 tokens | multilingüe | Apache-2.0 | Pesos safetensors y cuantizaciones GGUF |
| Gemma-2-27B-it | 27,2 B (aprox.) | 8.192 tokens | multilingüe | Licencia propia de Gemma | Pesos safetensors y cuantizaciones GGUF |

Diferencias destacables: Lucid-Shadow-31B es el único de la tabla cuya naturaleza es una fusión con mergekit y sin documentación de entrenamiento. Los tres alternativas cuentan con fichas técnicas detalladas, contexto declarado y evaluaciones publicadas, mientras que para Lucid-Shadow no se dispone de ninguno de esos datos.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican arquitectura, contexto, dataset de entrenamiento ni proceso de alineación, lo que dificulta predecir su comportamiento en producción.
- Al ser una fusión con mergekit, no existe un entrenamiento propio que garantice la calidad de las capacidades declaradas; las etiquetas "roleplay", "storytelling" y "conversational" provienen del autor de la fusión y no están respaldadas por evaluaciones publicadas.
- Riesgo de alucinación: no disponible como datos medidos, pero al no existir benchmarks ni evaluación de factualidad, se debe asumir un riesgo no cuantificado.
- Idiomas: únicamente inglés declarado. No hay soporte documentado de castellano ni de otros idiomas.
- Sesgos: no disponibles. No se ha publicado ninguna evaluación de sesgos, toxicidad o sesgos de representación.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el usuario debe verificar de forma independiente las licencias de los modelos que componen la fusión, ya que la model card no los identifica.
- La frase sobre capacidades de visión es texto plantilla del autor de la cuantización y no está confirmada; no hay ficheros mmproj en este repositorio.
- Este repositorio contiene únicamente GGUF: no se puede reanudar el entrenamiento ni aplicar fine-tuning directamente sobre estos ficheros. Para ello habría que partir del modelo base en safetensors.
- Las cuantizaciones por debajo de 4 bits (IQ1, IQ2, Q2_K) implican pérdidas de calidad notables, según las propias notas del autor; la gráfica de perplejidad enlazada muestra que las cuantizaciones de 2 bits se degradan de forma acusada.
- El contador de descargas y likes es 0, lo que indica que el modelo no tiene validación por parte de la comunidad en el momento de la consulta.
- El fichero de mayor tamaño del repositorio exige comprobar el espacio en disco: el repositorio completo ocupa 241,8 GB.

## Enlaces

- Repositorio GGUF con imatrix: https://huggingface.co/mradermacher/Lucid-Shadow-31B-i1-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Lucid-Shadow-31B
- Cuantizaciones estáticas (sin imatrix): https://huggingface.co/mradermacher/Lucid-Shadow-31B-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#Lucid-Shadow-31B-i1-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor de la cuantización: https://www.nethype.de/
- Búsqueda web: no se han encontrado enlaces relevantes sobre el modelo; los resultados devueltos corresponden a páginas de venta de bolardos y postes de señalización sin relación con el contenido.
