# mradermacher/Muse-Glimmer-30B-Uncensored-Heretic-i1-GGUF

## Resumen

Muse-Glimmer-30B-Uncensored-Heretic-i1-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo OS-Software/Muse-Glimmer-30B-Uncensored-Heretic, publicadas por el usuario mradermacher, especializado en la conversión de pesos a GGUF para inferencia local. Se trata de un modelo de 27.854.794.240 parámetros (27,85 mil millones) que, pese al apelativo "30B" del nombre, no llega a los 30.000 millones reales según los pesos en safetensors del modelo base. La variante "Heretic" y las etiquetas "uncensored", "decensored" y "abliterated" indican que se ha sometido al modelo a un proceso de ablación o desalineación deliberada para eliminar total o parcialmente los mecanismos de rechazo y moderación.

El repositorio no contiene el modelo original, sino únicamente cuantizaciones con matriz de importancia (imatrix, prefijo i1), una técnica que calcula la relevancia de cada peso sobre un corpus de calibración para reducir la pérdida de calidad en cuantizaciones agresivas. La única cuantización con tamaño publicado en la ficha es i1-Q2_K, con 10,8 GB, y el fichero imatrix de 0,1 GB. La model card advierte además de que se trata de un modelo con componente de visión, cuyos ficheros mmproj, si existen, se alojan en el repositorio de cuantizaciones estáticas del mismo autor.

La relevancia de esta ficha es fundamentalmente práctica: permite ejecutar en hardware de consumo un modelo de casi 28.000 millones de parámetros con licencia Apache 2.0 y sin filtros de contenido, algo que interesa a quien investiga alineación, hace red-teaming o necesita un modelo conversacional sin restricciones temáticas. Como contrapartida, la información técnica publicada es mínima: no hay datos de arquitectura, contexto, dataset de entrenamiento ni benchmarks, y el idioma declarado es únicamente el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada ni en la ficha ni en el modelo base citado) |
| Parametros totales | 27.854.794.240 (27,85 mil millones), segun los pesos safetensors del modelo base |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_K_S, Q4_K_M, Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K. Solo hay tamanos publicados para i1-Q2_K (10,8 GB) y para el fichero imatrix (0,1 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 23,5 GB |
| Fecha de publicacion | 10 de septiembre de 2026 (creacion y ultima actualizacion) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo: ni el README de esta cuantizacion ni los metadatos de HuggingFace describen tipo de atencion, capas, uso de MoE o de modelos de espacio de estados. Tampoco se detalla el proceso de entrenamiento del modelo base OS-Software/Muse-Glimmer-30B-Uncensored-Heretic: se desconoce el volumen de tokens, la composicion del dataset y si hubo fases de RLHF, DPO u otra forma de ajuste por preferencias. Lo unico deducible a partir de las etiquetas es que el modelo base ha pasado por un proceso de "abliteration" (ablacion de direcciones de rechazo en el espacio de activaciones o de pesos) que da lugar a las variantes etiquetadas como "heretic" y "decensored".

La aportacion tecnica de este repositorio concreto es la cuantizacion con matriz de importancia. mradermacher genera los ficheros i1 calculando previamente una imatrix sobre un corpus de calibracion, de modo que los pesos con mayor impacto en la perplejidad reciben mas bits y los menos relevantes se comprimen mas. El autor mantiene ademas un repositorio paralelo con cuantizaciones estaticas (sin imatrix) y advierte de que, si el modelo base es multimodal, los ficheros mmproj necesarios para la parte de vision se encontraran en ese repositorio estatico y no en este. En la tabla de ficheros publicada solo aparecen el imatrix y la cuantizacion i1-Q2_K, por lo que no puede confirmarse que el resto de tipos listados en las etiquetas esten ya subidos con sus tamanos definitivos.

## Capacidades

- Generacion de texto conversacional en ingles, con el historial de mensajes como entrada (etiqueta "conversational").
- Generacion de texto sin filtros de contenido: el proceso de ablacion elimina o reduce los rechazos ante peticiones que un modelo alineado rechazaria.
- Inferencia local en CPU y GPU mediante el ecosistema GGUF, sin necesidad de conexion a servicios externos.
- Compatibilidad declarada con endpoints (etiqueta "endpoints_compatible"), lo que permite servirla detras de una API compatible con OpenAI en herramientas de despliegue que soporten GGUF.
- Vision: la model card indica que se trata de un modelo con componente visual, pero los ficheros mmproj, si existen, no estan en este repositorio sino en el de cuantizaciones estaticas. Sin ellos, la parte de vision no es utilizable desde esta cuantizacion.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no documentado por el autor. Un hilo de Reddit de agosto de 2026 describe el modelo base como "buen modelo agente no orientado a codigo", pero se trata de una valoracion anecdotal de un usuario, no verificada.
- Capacidades multilingues: no disponibles mas alla del ingles declarado.
- Modo de razonamiento explicito (thinking), audio u otras modalidades: no disponible.

## Casos de uso

- Escritura creativa sin restricciones tematicas: el modelo puede abordar ficcion, guiones o narrativa con tematicas que los modelos alineados rechazan. Es adecuado por su naturaleza decensurada, siempre que se asuma la responsabilidad legal y etica del contenido generado.
- Red-teaming y evaluacion de seguridad: util para generar respuestas no filtradas y comprobar si los clasificadores de contenido o los guardarrailes de una plataforma detectan correctamente material problematico antes de desplegar un sistema en produccion.
- Investigacion sobre alineacion y ablacion: sirve como punto de comparacion frente al modelo original alineado para medir que capacidades y sesgos cambian tras el proceso de abliteration, en estudios academicos o internos.
- Asistente conversacional autoalojado en ingles: al ejecutarse integramente en local mediante llama.cpp u Ollama, permite mantener conversaciones con datos sensibles dentro de la propia infraestructura sin enviar nada a terceros. Requiere verificar antes el contexto real del modelo, dato no publicado.
- Prototipado de agentes locales: la etiqueta "endpoints_compatible" permite levantarlo tras una API compatible con OpenAI y conectarlo a frameworks de agentes, aunque la ausencia de documentacion sobre tool calling obliga a validar manualmente el formato de llamadas a funciones.
- Despliegue en una unica GPU de consumo: con las cuantizaciones de 4 bits (Q4_K_M, IQ4_XS) el modelo cabe en tarjetas de 24 GB de VRAM, lo que permite tener un modelo de casi 28.000 millones de parametros en una estacion de trabajo o un equipo de investigacion con presupuesto limitado.
- Procesamiento por lotes en CPU: las cuantizaciones de 2 y 3 bits (i1-Q2_K, Q3_K_M) reducen el modelo a un rango de 11-14 GB, viable con RAM de sistema suficiente y sin GPU dedicada, para tareas de generacion de texto o preprocesado de corpus en ingles.
- Extraccion y reformulacion de texto en ingles a partir de documentos: util para resumir, reescribir o transformar contenido cuando no se requiere precision factual estricta, ya que no hay benchmarks publicados que permitan acotar la tasa de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la ficha de la cuantizacion ni los metadatos de HuggingFace incluyen valores de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion. Tampoco se han publicado mediciones de perplejidad de las cuantizaciones i1 frente a los pesos originales; el autor incluye referencias genericas a graficas comparativas de tipos de cuantizacion de terceros (ikawrakow y Artefact2), pero no resultados propios para este modelo.

## Requisitos de hardware

- Tamano de referencia: el unico dato real de tamano publicado es i1-Q2_K con 10,8 GB. El repositorio completo ocupa 23,5 GB.
- VRAM estimada para inferencia (estimaciones, no datos publicados por el autor; incluyen los pesos mas una reserva de contexto y overhead):
  - Cuantizaciones IQ1/IQ2: aproximadamente 8-11 GB, aptas para GPU de 12 GB o para CPU con 16 GB de RAM.
  - Q2_K: 10,8 GB reales de pesos; con contexto largo conviene disponer de 12-14 GB.
  - Q3_K_M e IQ3: en torno a 13-15 GB, aptas para GPU de 16 GB o configuraciones parciales GPU/CPU.
  - Q4_K_M e IQ4_XS: en torno a 17-18 GB, aptas para GPU de 24 GB (RTX 3090, RTX 4090, L4, A10G).
  - Q5_K_M: en torno a 20-21 GB, al limite de una GPU de 24 GB segun longitud de contexto.
  - Q6_K: en torno a 23-24 GB, requiere GPU de 24 GB con contexto corto o reparto entre GPU y RAM del sistema.
- GPU recomendadas: para las cuantizaciones de 4 bits hacia arriba, RTX 3090, RTX 4090, L4, A10G, A6000 o superiores; para 2-3 bits basta una RTX 3060 de 12 GB o similar. No se dispone de datos de latencia ni de throughput publicados para este modelo.
- Si cabe en GPU de consumo: si. En 24 GB caben Q4_K_M, IQ4_XS y, con margen ajustado, Q5_K_M; en 12 GB caben las cuantizaciones de 2-3 bits, con posible desbordamiento a CPU segun el contexto configurado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y llama-cpp-python son las rutas recomendadas por tratarse de ficheros GGUF con cuantizaciones i1. vLLM y TGI no ofrecen soporte fiable para este tipo de cuantizaciones i1/imatrix, por lo que no se consideran una opcion practica.
- Vision: para usar la parte multimodal seria necesario descargar los ficheros mmproj del repositorio de cuantizaciones estaticas del autor, siempre que existan, y usar un backend GGUF con soporte multimodal.
- Nota: las cifras de VRAM de esta seccion son estimaciones de ingenieria a partir del tamano del modelo, no datos publicados por mradermacher.

## Comparativa con modelos similares

Los datos de la tabla proceden de las fichas oficiales de cada modelo cuando no se ha indicado otra cosa; los de esta cuantizacion provienen de la informacion proporcionada en la busqueda. No hay benchmarks publicados de Muse-Glimmer que permitan una comparacion de rendimiento real, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| Muse-Glimmer-30B-Uncensored-Heretic i1-GGUF (este repositorio) | 27,85 B | no disponible | apache-2.0 | GGUF con cuantizaciones i1; repo de 23,5 GB |
| Muse-Glimmer-30B-Uncensored-Heretic (cuantizaciones estaticas) | 27,85 B | no disponible | apache-2.0 | GGUF estandar del mismo autor; incluiria los mmproj de vision |
| Muse-Glimmer-30B-Uncensored-Heretic (base, safetensors) | 27,85 B | no disponible | no disponible | safetensors, publicado por OS-Software |
| Qwen2.5-32B-Instruct | 32,5 B | 32.768 nativo; 131.072 con YaRN | apache-2.0 | safetensors y multiples GGUF de terceros |
| Gemma 3 27B | 27 B | 128.000 | licencia Gemma (no Apache 2.0) | safetensors y GGUF de terceros |

Ninguno de los modelos comparables incorpora el proceso de ablacion ni las cuantizaciones i1 de este repositorio. Si el criterio de eleccion es ejecucion local sin filtros de contenido, Muse-Glimmer-Uncensored-Heretic es la opcion directa; si el criterio es contexto largo o ecosistema de herramientas, las alternativas de la tabla ofrecen datos publicados que este modelo no documenta. Se advierte de que pueden existir lanzamientos posteriores no contemplados en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ningun dato publicado que permita estimar la calidad real del modelo ni la perdida introducida por la cuantizacion.
- Contexto desconocido: al no publicarse la longitud de contexto, no es posible dimensionar tareas de documento largo ni configurar con seguridad el parametro de contexto en llama.cpp u Ollama.
- Idioma unico: solo se declara ingles. Cualquier uso en castellano u otros idiomas queda fuera de las capacidades documentadas.
- Contenido no filtrado: al tratarse de un modelo decensurado y abliterado, puede generar contenido ofensivo, ilegal, peligroso o inexacto sin advertirlo. No es apto para aplicaciones de cara al publico sin una capa adicional de moderacion.
- Riesgo de alucinacion: al no existir evaluaciones, se desconoce la tasa de alucinacion. Se recomienda tratar la salida como no verificada, especialmente en contextos factuales.
- Sesgos: no se ha publicado ninguna evaluacion de sesgo. El proceso de ablacion puede alterar el comportamiento del modelo de forma no documentada y no necesariamente uniforme entre temas.
- Licencia: el repositorio declara Apache 2.0, pero este repositorio solo contiene cuantizaciones. Conviene verificar la licencia y la procedencia del modelo base original antes de un uso comercial, ya que el nombre "Muse-Glimmer" no permite deducir con certeza la licencia de los pesos de origen.
- Atribucion: la etiqueta "abliterated" y el termino "heretic" implican una modificacion deliberada de los pesos del modelo original; un uso comercial puede acarrear implicaciones reputacionales o de cumplimiento en plataformas que exigen moderacion.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo dia. No hay validacion por parte de la comunidad sobre la integridad de los ficheros ni sobre su calidad.
- Precaucion con las cuantizaciones de 1 y 2 bits: los tipos IQ1_S, IQ1_M o IQ2_XXS comprimen un modelo de 28.000 millones de parametros de forma muy agresiva; el propio autor sugiere IQ3_XXS como alternativa a Q2_K. La degradacion de calidad en esos rangos es probable aunque no este cuantificada.
- Vision no incluida: si se necesita la capacidad multimodal, hay que localizar los ficheros mmproj en el repositorio estatico y comprobar que existen, algo que no se confirma en esta ficha.

## Enlaces

- Repositorio de la cuantizacion i1-GGUF: https://huggingface.co/mradermacher/Muse-Glimmer-30B-Uncensored-Heretic-i1-GGUF
- Modelo base: https://huggingface.co/OS-Software/Muse-Glimmer-30B-Uncensored-Heretic
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Muse-Glimmer-30B-Uncensored-Heretic-GGUF
- Pagina de descarga y vision general del modelo: https://hf.tst.eu/model#Muse-Glimmer-30B-Uncensored-Heretic-i1-GGUF
- Preguntas frecuentes y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Hilo de Reddit sobre el modelo (r/LocalLLaMA, agosto de 2026, valoracion anecdotal): https://www.reddit.com/r/LocalLLaMA/comments/1vl64et/1_day_in_and_i_feel_okay_saying_museglimmer30b/
- Grafica comparativa de tipos de cuantizacion (ikawrakow), citada por el autor: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones, citadas por el autor: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke), citado por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Sitio del patrocinador de las cuantizaciones: https://www.nethype.de/
