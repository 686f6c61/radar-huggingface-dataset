# Emerald7664/DrakIdol-Roleplayer-1.0-i1-GGUF

## Resumen

DrakIdol-Roleplayer-1.0-i1-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo aifeifei798/DrakIdol-Roleplayer-1.0, un modelo de 3.880.263.168 parametros (aproximadamente 3,88 mil millones) construido sobre la familia Gemma 3 de Google y ajustado especificamente para roleplay conversacional. La publicacion corre a cargo del usuario Emerald7664, mientras que la model card atribuye la cuantizacion a mradermacher mediante la herramienta de cuantizacion con imatrix, lo que da lugar a 25 variantes de cuantizacion que van desde IQ1_S (1,2 GB) hasta Q6_K (3,3 GB).

El problema que resuelve es practico: el modelo base se distribuye en precision completa (safetensors), lo que exige mas VRAM de la necesaria para un modelo de este tamano. Estas cuantizaciones permiten ejecutar un modelo de roleplay de ~3,9B en GPU de consumo, portatiles e incluso en CPU, con ficheros que caben en 1,2-3,3 GB. El repositorio completo ocupa 48,4 GB porque incluye todas las variantes mas el fichero imatrix.

Es relevante ahora porque la cuantizacion con imatrix (importance matrix) mejora la calidad de los formatos de baja precision respecto a la cuantizacion estatica, y porque el modelo base es multimodal (la propia model card indica que se trata de un modelo de vision y remite a los ficheros mmproj del repositorio estatico). Su licencia declarada es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion (arquitectura base Gemma 3; detalles de capas y atencion local/global no disponibles en la informacion proporcionada) |
| Parametros totales | 3.880.263.168 (aproximadamente 3,88B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; la familia Gemma 3 sobre la que se construye soporta hasta 128 000 tokens |
| Tipos de cuantizacion | GGUF con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (25 variantes) |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 (declarada en los metadatos) |
| Formato de pesos | GGUF (ficheros .gguf); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 48,4 GB (incluye todas las cuantizaciones y el fichero imatrix) |
| Cuantizador | mradermacher (segun la model card); publicado bajo el usuario Emerald7664 |
| Modelo base | aifeifei798/DrakIdol-Roleplayer-1.0 |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura interna mas alla de su pertenencia a la familia Gemma 3, una arquitectura transformer decoder-only de Google con atencion por ventanas deslizantes para reducir el coste de contextos largos. Con 3.880.263.168 parametros, el modelo encaja en el rango de la variante de 4B de esa familia, que es multimodal (texto e imagen), de ahi que la model card indique explicitamente "This is a vision model" y remita a los ficheros mmproj alojados en el repositorio estatico de cuantizaciones.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o fine-tuning supervisado sobre el modelo base. Tampoco se documentan innovaciones tecnicas propias del ajuste de roleplay mas alla de la especializacion tematica. Lo que si esta documentado es el proceso de cuantizacion: se genero un fichero imatrix (matriz de importancia) de 0,1 GB y a partir de el se produjeron las variantes i1, un esquema que pondera los pesos segun su contribucion a la salida para preservar mejor la calidad en regimenes de baja precision.

## Capacidades

- Generacion de texto conversacional orientada a roleplay, con enfasis en mantener personajes y turnos de dialogo.
- Capacidad de vision heredada de la arquitectura base Gemma 3, condicionada a disponer del fichero mmproj correspondiente del repositorio estatico.
- Comprension y generacion en ingles, unico idioma declarado en los metadatos.
- Conversaciones multi-turno con contexto prolongado, sujeto al limite de contexto real que imponga el runtime y el valor configurado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el tag "conversational" es el unico indicador de capacidades.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Roleplay y personajes conversacionales: es el caso de uso declarado del ajuste. Con una ventana de contexto amplia y cuantizaciones de 2,5-3,3 GB, se puede servir un personaje persistente en una GPU de consumo manteniendo el historial de la conversacion en memoria.
- Chatbot de acompanamiento o entretenimiento en aplicaciones de escritorio: el peso reducido de las variantes IQ4_XS o Q4_K_S (2,4-2,5 GB) permite empaquetar el modelo dentro de una aplicacion local sin depender de servicios en la nube.
- Prototipado de narrativa interactiva: util para generar dialogos de personajes y ramificaciones narrativas en un motor de ficcion interactiva, aprovechando el ajuste conversacional y la coherencia de personaje.
- Asistente de escritura creativa: la especializacion en dialogo lo hace util para redactar conversaciones verosimiles entre personajes en guiones o novelas, aunque el unico idioma soportado de forma declarada sea el ingles.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 25 variantes del mismo modelo, lo que permite medir empiricamente el impacto de la precision sobre la calidad de las respuestas de roleplay y elegir el punto de compromiso adecuado.
- Despliegue en hardware limitado o sin GPU: las variantes IQ2 e IQ3 (1,4-2,1 GB) permiten ejecucion en CPU pura mediante llama.cpp, adecuado para demos, entornos de pruebas o dispositivos embebidos.
- Inferencia multimodal en local: si se usa el fichero mmproj del repositorio estatico, se pueden construir interacciones de roleplay que incorporen imagenes como contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de roleplay, y los resultados de la busqueda web no aportan datos utilizables al respecto.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos mas el cache KV. Con cuantizaciones de 2,4-2,6 GB (IQ4_XS, Q4_K_S, Q4_K_M) el consumo tipico se situa aproximadamente entre 3 y 5 GB con contextos moderados. Las variantes de 1,2-1,6 GB (IQ1_S a IQ2_M) permiten bajar de 3 GB, a costa de una perdida de calidad significativa. La variante Q6_K (3,3 GB) requiere del orden de 4-7 GB.
- GPU recomendadas: el modelo cabe sin problema en RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4080 y RTX 4090. Tambien es viable en iGPU con memoria unificada usando llama.cpp con offload parcial.
- Cabe en GPU de consumo: si. Es precisamente el objetivo de estas cuantizaciones; las variantes de hasta 3,3 GB entran incluso en GPUs de 6-8 GB de VRAM.
- Despliegue en CPU: viable con llama.cpp en todas las variantes, y recomendable en las de menor tamano (IQ1_S a IQ3_M).
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) son los caminos naturales para GGUF. vLLM y TGI soportan GGUF solo parcialmente o requieren convertir a otros formatos. El tag "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia, pero no se detalla la integracion.
- Latencia y throughput: no disponibles. Dependen del hardware, del tamano de cuantizacion y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DrakIdol-Roleplayer-1.0-i1-GGUF (este) | 3,88B | No especificado (base Gemma 3: hasta 128k) | GGUF imatrix, 25 variantes | Apache 2.0 (declarada) | HuggingFace, 0 descargas |
| aifeifei798/DrakIdol-Roleplayer-1.0 | 3,88B | No disponible | Safetensors | No disponible | HuggingFace (modelo base) |
| mradermacher/DrakIdol-Roleplayer-1.0-GGUF | 3,88B | No disponible | GGUF estatico + mmproj | No disponible | HuggingFace (cuantizaciones estaticas) |
| Gemma 3 4B (modelo original de Google) | ~3,88B | 128 000 tokens | Safetensors, GGUF comunitario | Terminos de uso de Gemma | Google, HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: no hay evaluaciones publicadas para este ajuste. Al estar especializado en roleplay, es esperable que priorice la coherencia narrativa sobre la veracidad factual; no conviene usarlo como fuente de informacion.
- Idioma: el unico idioma declarado es el ingles. El rendimiento en castellano u otras lenguas no esta documentado y probablemente sea degradado.
- Cuantizaciones muy agresivas: las variantes IQ1 e IQ2 (1,2-1,6 GB) degradan la calidad de forma notable. La propia model card las etiqueta como "for the desperate" y advierte de calidad "very low" en Q2_K_S.
- Vision condicionada: siendo un modelo multimodal, la funcionalidad de imagen depende de ficheros mmproj que no estan en este repositorio sino en el repositorio estatico. Sin ellos, solo se obtiene texto.
- Ambiguedad de autoria: el repositorio se publica bajo el usuario Emerald7664, pero la model card declara a mradermacher como cuantizador y enlaza a rutas de su espacio de nombres. Conviene verificar la procedencia antes de usarlo en produccion.
- Licencia en conflicto potencial: los metadatos declaran Apache 2.0, pero el modelo deriva de Gemma 3 de Google, cuyos terminos de uso incluyen condiciones propias sobre redistribucion y uso. La declaracion Apache 2.0 en un derivado de Gemma no esta respaldada por documentacion adicional en la informacion disponible; es un punto a revisar antes de un uso comercial.
- Sin validacion comunitaria: el modelo registra 0 descargas y 0 "likes" en el momento de los datos, y no hay evaluaciones independientes.
- Metadatos inconsistentes: la fecha de creacion indicada (2026-10-14) es posterior al momento de recopilacion de esta ficha, lo que sugiere un error de registro o de zona horaria.
- Uso responsable: al ser un modelo de roleplay sin filtros documentados, puede generar contenido inapropiado. No se documentan mecanismos de seguridad ni guias de contenido.
- Resultados de busqueda no relevantes: las buscas web realizadas no devolvieron informacion tecnica sobre el modelo; los enlaces obtenidos correspondian a sitios de contenido para adultos sin relacion con el modelo, por lo que se han descartado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Emerald7664/DrakIdol-Roleplayer-1.0-i1-GGUF
- Modelo base: https://huggingface.co/aifeifei798/DrakIdol-Roleplayer-1.0
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/DrakIdol-Roleplayer-1.0-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/DrakIdol-Roleplayer-1.0-i1-GGUF/resolve/main/DrakIdol-Roleplayer-1.0.imatrix.gguf
- Pagina de resumen de cuantizaciones del cuantizador: https://hf.tst.eu/model#DrakIdol-Roleplayer-1.0-i1-GGUF
- Guia de uso de GGUF (referencia citada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelo de mradermacher: https://huggingface.co/mradermacher/
- Grafica comparativa de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
