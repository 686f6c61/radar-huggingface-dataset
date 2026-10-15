# mradermacher/Qwen3.8-27B-Max-Ablit-Heretic-i1-GGUF

## Resumen

Este repositorio contiene la coleccion de cuantizaciones GGUF del modelo sci4ai/Qwen3.8-27B-Max-Ablit-Heretic, publicadas por el usuario mradermacher (nethype GmbH). Se trata de un derivado "abliterated" del Qwen3.8-27B de Alibaba, un modelo denso multimodal nativo de aproximadamente 26.900 millones de parametros, disenado para texto, imagen y video, con soporte de codigo, razonamiento multimodal, contexto largo, tool calling y flujos agenticos. La etiqueta "Heretic" mas los tags heretic, uncensored, decensored y abliterated indican que el modelo base ha sido modificado para eliminar o reducir las direcciones de rechazo de la alineacion de seguridad original.

El aporte especifico de este repositorio no es el entrenamiento de un modelo nuevo, sino la generacion de cuantizaciones de tipo i1 (imatrix) sobre el modelo base ya modificado. Se ofrecen 21 variantes cuantizadas que van desde i1-IQ1_M con 7,7 GB hasta i1-Q6_K con 22,2 GB, lo que permite desplegar un modelo de ~27.000 millones de parametros en hardware de consumo, algo inviable con los pesos en precision completa (el repositorio completo ocupa 287,9 GB). La licencia declarada es apache-2.0 y el unico idioma indicado es el ingles.

La relevancia de esta ficha es doble: por un lado documenta una ruta practica de despliegue local de un modelo multimodal de gran tamano; por otro, advierte de que se trata de un modelo con la alineacion de seguridad alterada, lo que condiciona seriamente su uso en produccion. El repositorio fue creado el 14 de octubre de 2026 y, en el momento de la consulta, registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se describe como LLM denso multimodal nativo) |
| Parametros totales | 26.895.998.464 (26,9 B), segun safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K; se anuncia tambien una version estatica en Q4_0, Q4_1, IQ1_S, IQ3_S, IQ3_XS |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el repo base usa safetensors |
| Modelo base | sci4ai/Qwen3.8-27B-Max-Ablit-Heretic |
| Modelo del que deriva la cadena | Qwen3.8-27B (Alibaba / Qwen team) |
| Repositorio de cuantizaciones estaticas | mradermacher/Qwen3.8-27B-Max-Ablit-Heretic-GGUF |
| Tamano total del repositorio | 287,9 GB |
| Vision (mmproj) | si; los ficheros mmproj se alojan en el repositorio estatico |
| Fecha de creacion | 2026-10-14 |

Tabla de cuantizaciones publicadas (tamano en GB, tal como figura en la model card):

| Cuantizacion | Tamano (GB) | Nota del autor |
|---|---|---|
| i1-IQ1_M | 7,7 | "mostly desperate" |
| i1-IQ2_XXS | 8,5 | |
| i1-IQ2_XS | 9,2 | |
| i1-IQ2_S | 9,5 | |
| i1-IQ2_M | 10,1 | |
| i1-Q2_K_S | 10,3 | calidad muy baja |
| i1-Q2_K | 10,8 | IQ3_XXS probablemente mejor |
| i1-IQ3_XXS | 11,3 | calidad inferior |
| i1-Q3_K_S | 12,2 | IQ3_XS probablemente mejor |
| i1-IQ3_M | 12,7 | |
| i1-Q3_K_M | 13,4 | IQ3_S probablemente mejor |
| i1-Q3_K_L | 14,4 | IQ3_M probablemente mejor |
| i1-IQ4_XS | 15,2 | |
| i1-Q4_K_S | 15,7 | tamano/velocidad/calidad optimos |
| i1-Q4_K_M | 16,6 | rapido, recomendado |
| i1-Q5_K_S | 18,8 | |
| i1-Q6_K | 22,2 | practicamente como Q6_K estatico |
| imatrix | 0,1 | fichero imatrix para crear cuantizaciones propias |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El repositorio es una cuantizacion, no un modelo entrenado desde cero: mradermacher aplica el pipeline de llama.cpp sobre los pesos del modelo sci4ai/Qwen3.8-27B-Max-Ablit-Heretic. La familia de origen, Qwen3.8-27B, se describe en las fuentes disponibles como un modelo denso multimodal nativo ("native multimodal dense LLM", segun el repositorio oficial en GitHub de AlibabaCloud-Official) de 27.000 millones de parametros, orientado a codigo, flujos agenticos y automatizacion de oficina, con soporte de texto, imagen y video.

Las cuantizaciones de este repositorio usan el metodo i1 con fichero imatrix, un esquema de calibracion por importancia que asigna mas precision a los pesos con mayor impacto en la perplejidad. En la practica, esto permite que cuantizaciones de 4 bits mantengan una calidad cercana a la del modelo original. La model card indica que las cuantizaciones i1 se generaron con acceso al supercomputador de nicoboss, lo que permitio producir un catalogo mas amplio de variantes imatrix de alta calidad. Los tags heretic, uncensored, decensored y abliterated documentan que la cadena de modelos de la que parte esta cuantizacion ha sufrido un proceso de abliteracion (eliminacion de direcciones de rechazo en el espacio de activaciones) sobre el modelo Qwen original. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte multi-turno (el tag conversational aparece en el repositorio).
- Comprension multimodal: al tratarse de un modelo de vision, admite entrada de imagen y video segun las capacidades declaradas de Qwen3.8-27B; requiere el fichero mmproj del repositorio estatico para funcionar en llama.cpp.
- Generacion y asistencia de codigo, segun las capacidades declaradas de la familia Qwen3.8-27B.
- Razonamiento multimodal y procesamiento de contexto largo, segun la descripcion del modelo base en NGC.
- Tool calling y function calling, declarados en la ficha de Qwen3.8-27B en NGC.
- Flujos agenticos y tareas multi-paso, tambien declarados para el modelo base.
- Automatizacion de tareas de oficina, segun el repositorio oficial de Alibaba.
- Ausencia de rechazos de seguridad por el proceso de abliteracion: el modelo no aplica las negativas alineadas del original, lo que se traduce en respuestas a practicamente cualquier peticion.

## Casos de uso

- Despliegue local de un modelo multimodal de ~27 B en una estacion de trabajo: con la cuantizacion i1-Q4_K_M (16,6 GB) es posible ejecutar texto e imagen en una GPU de 24 GB mediante llama.cpp u Ollama, sin depender de APIs externas.
- Asistente de codigo en local: la familia Qwen3.8-27B esta orientada a programacion y soporta tool calling, de modo que la variante i1-Q4_K_S (15,7 GB, segun el autor el punto optimo entre tamano, velocidad y calidad) puede integrarse en un editor o en un agente de terminal que invoque herramientas de compilacion y tests.
- Analisis de documentos con imagen: al ser un modelo de vision, puede procesar capturas, diagramas o paginas escaneadas junto con texto, util para extraccion de informacion en pipelines internos.
- Prototipado de agentes de multiples pasos: el soporte de function calling y razonamiento agentico permite construir prototipos de automatizacion de tareas sin coste por token.
- Entornos de investigacion sobre alineacion y seguridad: al ser un modelo abliterated, resulta adecuado para estudiar el efecto de la eliminacion de direcciones de rechazo sobre el comportamiento, el sesgo y la fidelidad de las respuestas.
- Generacion creativa sin filtros: la ausencia de negativas es util en escritura de ficcion, guiones o narrativa que aborden temas que los modelos alineados suelen rechazar.
- Experimentacion con cuantizaciones extremas: la escala de variantes disponibles (desde 7,7 GB hasta 22,2 GB) permite medir la degradacion de calidad por bit en un mismo modelo, con el fichero imatrix incluido (0,1 GB) para generar variantes propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y las busquedas web realizadas no aportan cifras de evaluacion para esta cuantizacion concreta ni para el modelo base sci4ai/Qwen3.8-27B-Max-Ablit-Heretic.

## Requisitos de hardware

- VRAM estimada para inferencia (derivada del tamano de cada fichero GGUF, mas cache KV segun contexto): i1-IQ1_M ~7,7 GB; i1-IQ2_M ~10,1 GB; i1-IQ3_M ~12,7 GB; i1-IQ4_XS ~15,2 GB; i1-Q4_K_M ~16,6 GB; i1-Q5_K_S ~18,8 GB; i1-Q6_K ~22,2 GB.
- GPUs de consumo compatibles: RTX 3090 y RTX 4090 (24 GB) pueden ejecutar hasta i1-Q5_K_S con holgura y i1-Q6_K al limite de VRAM; tarjetas de 16 GB admiten i1-IQ3_M o i1-IQ4_XS; tarjetas de 12 GB quedan restringidas a las variantes IQ2 o IQ3 bajas. Las variantes de 8-10 GB son las unicas viables en GPUs de 8 GB.
- GPUs profesionales: A100 40 GB y H100 permiten ejecutar i1-Q6_K y dejar margen amplio para contexto largo y cache KV.
- Hardware AMD: el blog de AMD anuncia soporte day 0 de Qwen3.8-27B en procesadores Ryzen AI Max y tarjetas Radeon, con ejecucion local mediante LM Studio y soporte de inferencia a traves de Lemonade.
- Opciones de despliegue: llama.cpp (referencia directa para GGUF), Ollama, LM Studio, Lemonade (AMD) y cualquier runtime compatible con GGUF. Para los ficheros multimodales es necesario el mmproj alojado en el repositorio estatico del autor.
- Ficheros multiparte: si alguna variante se publica partida, es necesario concatenar las partes antes de cargarla, segun la guia enlazada en la model card.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Max-Ablit-Heretic-i1-GGUF (este) | 26,9 B | no disponible | GGUF i1 (imatrix) | apache-2.0 | 21 variantes, 0 descargas |
| mradermacher/Qwen3.8-27B-Max-Ablit-Heretic-GGUF | 26,9 B | no disponible | GGUF estatico | apache-2.0 | repositorio estatico, incluye mmproj |
| mradermacher/Qwen-3.8-27B-Heretic-GGUF | 26,9 B (familia Qwen3.8-27B) | no disponible | GGUF | apache-2.0 | repo con 4 likes |
| mradermacher/Qwen3.8-27B-heretic-ara-GGUF | no disponible | no disponible | GGUF | no disponible | variante especifica |
| Qwen3.8-27B (oficial, Alibaba) | 27 B, denso multimodal | no disponible (se menciona contexto largo) | safetensors | no disponible en la informacion | NGC, GitHub, soporte AMD day 0 |

No se dispone de datos de rendimiento ni de contexto para ninguna de las alternativas, por lo que la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo abliterated: los tags heretic, uncensored, decensored y abliterated indican que la alineacion de seguridad del Qwen3.8-27B original ha sido alterada. El modelo no aplicara negativas ante peticiones daninas, ilegales o eticas, lo que lo hace inadecuado para productos de cara al publico sin capas de moderacion externas.
- Riesgo de degradacion cognitiva: los procesos de abliteracion suelen afectar a la coherencia y aumentar la tasa de alucinacion en comparacion con el modelo original. No hay evaluaciones publicadas en la informacion disponible que cuantifiquen este efecto.
- Sesgos: no hay informacion disponible sobre evaluaciones de sesgo de este derivado concreto ni del modelo base.
- Idioma: el unico idioma declarado es el ingles. El rendimiento en castellano no esta documentado y puede ser sensiblemente inferior.
- Contexto: no se especifica la longitud de contexto soportada; conviene verificarla antes de disenar flujos que dependan de ventanas largas.
- Cuantizaciones extremas: el propio autor advierte que i1-IQ1_M (7,7 GB) es "mostly desperate", que i1-Q2_K_S tiene calidad muy baja y que varias variantes de Q2 y Q3 son inferiores a alternativas IQ de tamano similar. Para uso real conviene partir de i1-IQ4_XS o i1-Q4_K_M.
- Licencia: apache-2.0 permite uso comercial, pero la licencia aplicada al modelo base de Alibaba y a los pesos abliterados intermedios no se detalla en la informacion disponible; conviene verificar la cadena completa antes de un despliegue comercial.
- Vision: el fichero mmproj no esta en este repositorio, sino en el estatico. Sin el, el modelo funciona unicamente como LLM de texto.
- Adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre estas cuantizaciones.
- Despliegue productivo: al ser GGUF, no encaja de forma nativa en stacks de alta concurrencia como TGI; llama.cpp y sus derivados estan orientados a un numero reducido de peticiones simultaneas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Max-Ablit-Heretic-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Max-Ablit-Heretic-GGUF
- Modelo base: https://huggingface.co/sci4ai/Qwen3.8-27B-Max-Ablit-Heretic
- Pagina de resumen del autor: https://hf.tst.eu/model#Qwen3.8-27B-Max-Ablit-Heretic-i1-GGUF
- Variante relacionada: https://huggingface.co/mradermacher/Qwen3.8-27B-heretic-ara-GGUF
- Variante relacionada: https://huggingface.co/mradermacher/Qwen-3.8-27B-Heretic-GGUF
- Ficha de Qwen3.8-27B en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog de AMD sobre soporte day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
