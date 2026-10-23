# KENIC-1/GLM-5.3-Flash-Maya-GGUF

## Resumen

GLM-5.3-Flash-Maya-GGUF es un conjunto de cuantizaciones GGUF del modelo zai-org/GLM-5.3-Flash, un mixture of experts multimodal nativo de Z.ai con 321 000 millones de parámetros totales y unos 18 000 millones activos por token. La cuantización la firma peasantsmith dentro de Project Maya, y el repositorio consultado (KENIC-1/GLM-5.3-Flash-Maya-GGUF) redistribuye esos ficheros bajo licencia MIT.

El interés de esta ficha no está en el modelo base, sino en la técnica de compresión: cuatro variantes (Maya-S, Maya-S24, Maya-M y Maya-L) construidas a partir de la publicación oficial en FP8, no de un fichero ya recuantizado, con matrices de importancia calculadas experto a experto y redondeo con realimentación de error de estilo GPTQ. Los resultados declarados van del 97,7 % al 99,2 % de la precisión zero-shot del modelo FP8 original, con tamanos de fichero de 94,7 GB a 156,3 GB frente a los cientos de gigabytes del modelo completo.

Project Maya asume que el modelo no cabe en VRAM: mantiene los expertos mas usados en la GPU, los siguientes en RAM y el resto en SSD. Es, por tanto, una propuesta para servir un MoE de 321 B en hardware de consumo o en estaciones de trabajo pequenas, aceptando latencias dependientes del almacenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mixture of experts disperso y atencion hibrida (lineal KDA + MLA/DSA); multimodal nativo (texto, imagen y video) |
| Parametros totales | 321 B (320 B segun la nota de Z.ai) |
| Parametros activos | ~18 B por token |
| Longitud de contexto | 1 048 576 tokens |
| Tipos de cuantizacion | GGUF: IQ2_XXS, IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS, Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, F32 (torre de vision en F16) |
| Idiomas soportados | no disponible (la calibracion incluye chat multilingue, sin listado oficial de idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF en 3 o 4 fragmentos por variante; safetensors/FP8 en el modelo base zai-org/GLM-5.3-Flash |
| Variantes incluidas | Maya-S (96,5 GB), Maya-S24 (94,7 GB), Maya-M (116,0 GB), Maya-L (156,3 GB) |
| Capa NextN (MTP) | Incluida en las cuatro variantes, habilita decodificacion especulativa |
| Vision | mmproj-GLM-5.3-Flash-F16.gguf (torre y proyector) + tokenizador, 1,14 GB |

## Arquitectura y entrenamiento

El modelo base es un MoE de 321 B con 18 B activos por token que, segun la informacion disponible, introduce por primera vez en la serie GLM una arquitectura hibrida de atencion dispersa y lineal, pensada para reducir el coste de servicio en contexto largo sin perder precision. La tabla de tensores de la model card distingue proyecciones de atencion KDA (lineal), MLA/DSA, tres capas densas, expertos compartidos, un indexador DSA y una capa NextN (multi-token prediction) que los motores pueden usar para decodificacion especulativa. Es multimodal nativo: acepta imagen y video ademas de texto.

El proceso de cuantizacion, que es el objeto real de este repositorio, parte de la publicacion oficial en FP8 y aplica cuatro pasos: calibracion con 128 secuencias de 2048 tokens en la plantilla de chat de GLM (chat, chat multilingue, trazas de razonamiento, codigo web con HTML/CSS/JS, three.js, canvas y WebGL, otro codigo y llamadas a herramientas); calculo de una matriz de importancia por experto y capa a partir de las estadisticas del propio modelo FP8; redondeo con realimentacion de error en las proyecciones gate y up de los expertos, en bloques de 256 pesos y con estadisticas de entrada propias de cada experto, que segun el autor reduce el error de salida de los expertos alrededor de un cuarto frente al redondeo ponderado por importancia del mismo tamano; y uso de los cuantizadores de llama.cpp (ggml), de modo que los ficheros son GGUF estandar. Las variantes difieren en el reparto de bits: Maya-S y Maya-S24 ponen los expertos enrutados en 2 bits y la atencion/ expertos compartidos en 6 y 4 bits respectivamente; Maya-M sube a 2-3 bits; Maya-L a 3-4 bits con Q5_K en las capas mas sensibles. Maya-M y Maya-L fueron calibrados con mayor peso hacia tool calls y codigo de front-end.

## Capacidades

- Generacion de texto y conversacion multi-turno con hasta 1 048 576 tokens de contexto.
- Razonamiento con trazas explicitas (reasoning blocks), presentes en la calibracion del cuantizador.
- Entrada de imagen y video gracias a la torre de vision incluida en el directorio `vision/`.
- Codigo: la calibracion incluye HTML/CSS/JS de fichero unico, escenas three.js y animaciones canvas/WebGL, lo que sugiere especial atencion a codigo de front-end.
- Tool calling y function calling, con calibracion reforzada en Maya-M y Maya-L.
- Decodificacion especulativa mediante la capa NextN/MTP incluida en las cuatro variantes.
- Capacidad multilingue: mencionada en la calibracion, sin listado oficial de idiomas disponible.
- Al ser cuantizaciones, heredan las capacidades del modelo base; no se documentan capacidades adicionales ni modos especiales distintos de los del original.

## Casos de uso

- Desarrollo de front-end asistido: el modelo genera paginas HTML/CSS/JS completas y escenas three.js, y Maya-M/Maya-L estan calibrados especificamente hacia codigo de front-end, por lo que encajan en tareas de prototipado rapido de interfaces.
- Agentes con tool calling: la combinacion de ventana de 1 M de tokens, calibracion en llamadas a herramientas y decodificacion especulativa via NextN permite cadenas de varios pasos con historial largo sin reentrenar el contexto.
- Analisis de repositorios completos: con 1 048 576 tokens se puede cargar un arbol de codigo extenso y hacer preguntas transversales, aunque el coste dependera del subsistema de atencion hibrida del modelo base.
- Revision de documentos tecnicos con imagenes: al aceptar imagen y video, sirve para extraer datos de capturas, diagramas o grabaciones de pantalla dentro de un mismo flujo de texto.
- Despliegue local en estaciones de trabajo: Maya-S24 esta pensada para tarjetas de 24 GB (RTX 3090/4090) con expertos en RAM y SSD, lo que permite tener un MoE de 321 B en una maquina personal con latencias moderadas.
- Inferencia con presupuesto de memoria ajustado: Maya-S (96,5 GB) cubre equipos con un pool combinado de RAM y VRAM menor, manteniendo el 97,9 % de la precision zero-shot del FP8.
- Experimentacion e investigacion: al ser GGUF y licencia MIT, es util para estudiar el efecto de la cuantizacion extrema en MoE y para reproducir la receta de matrices de importancia por experto.

## Benchmarks y rendimiento

Precision zero-shot frente al modelo FP8 completo, segun la model card del autor (entre parentesis, porcentaje retenido respecto a FP8):

| Tarea (zero-shot) | FP8 | Maya-S | Maya-S24 | Maya-M | Maya-L |
|---|---:|---:|---:|---:|---:|
| ARC-Easy (acc) | 87,2 | 86,2 (98,9 %) | 85,8 (98,3 %) | 86,5 (99,1 %) | 86,0 (98,6 %) |
| ARC-Challenge (acc norm) | 71,0 | 68,2 (96,1 %) | 69,0 (97,2 %) | 69,0 (97,2 %) | 69,8 (98,2 %) |
| HellaSwag (acc norm) | 88,5 | 87,5 (98,9 %) | 84,8 (95,8 %) | 86,8 (98,0 %) | 88,5 (100 %) |
| WinoGrande (acc) | 78,5 | 75,5 (96,2 %) | 77,0 (98,1 %) | 76,2 (97,1 %) | 77,8 (99,0 %) |
| PIQA (acc norm) | 87,0 | no disponible (dato truncado en la informacion) | no disponible | no disponible | no disponible |

Resumen agregado declarado por el autor: Maya-L retiene el 99,2 %, Maya-S y Maya-M el 97,9 % y Maya-S24 el 97,7 %. El propio autor advierte que tareas de eleccion multiple con 400 preguntas no separan las variantes de forma fiable (diferencias de uno o dos puntos dentro del ruido del test) y que, token a token, Maya-M es claramente mas proximo al modelo FP8. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K para estas cuantizaciones.

## Requisitos de hardware

- VRAM estimada: no cabe completa en ninguna GPU de consumo. Los ficheros ocupan 94,7 GB (Maya-S24), 96,5 GB (Maya-S), 116,0 GB (Maya-M) y 156,3 GB (Maya-L); el esquema Project Maya reparte expertos entre VRAM, RAM y SSD.
- Maya-S24 esta disenada explicitamente para tarjetas de 24 GB (RTX 3090, RTX 4090), dejando unos 1,5 GB mas de margen para expertos en GPU que Maya-S al bajar atencion y expertos compartidos de Q6_K a Q4_K.
- El autor reporta mediciones en un equipo con dos GPU y 30 GB de RAM, sin especificar los modelos de GPU.
- El requisito real es el pool agregado de VRAM + RAM + almacenamiento: mas memoria es mas rapido, y el rendimiento depende del SSD.
- GPU de centro de datos (A100 80 GB, H100 80 GB) no permiten alojar el modelo completo en una sola unidad; harian falta varias o el mismo esquema de offloading.
- Despliegue: llama.cpp y derivados (Ollama, LM Studio y otros motores que lean GGUF). Los tags del repositorio incluyen `endpoints_compatible`. Para la parte de vision hay que cargar `mmproj-GLM-5.3-Flash-F16.gguf` junto al modelo.
- Latencia y throughput: no disponibles como cifra absoluta. El unico dato concreto es que Maya-S24 ofrece hasta un 14 % mas de velocidad de decodificacion en tarjetas de 24 GB. Con la capa NextN y un motor que la soporte se puede activar decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Precision vs FP8 | Licencia |
|---|---|---:|---:|---|---|
| GLM-5.3-Flash (FP8, referencia) | 321 B (18 B activos) | 1 048 576 | no disponible en la informacion | 100 % (referencia) | MIT |
| Maya-L | 321 B (18 B activos) | 1 048 576 | 156,3 GB | 99,2 % | MIT |
| Maya-M | 321 B (18 B activos) | 1 048 576 | 116,0 GB | 97,9 % (mas cercano token a token) | MIT |
| Maya-S | 321 B (18 B activos) | 1 048 576 | 96,5 GB | 97,9 % | MIT |
| Maya-S24 | 321 B (18 B activos) | 1 048 576 | 94,7 GB | 97,7 % (hasta 14 % mas rapido en 24 GB) | MIT |

Alternativas de otros autores con el mismo tamano o la misma tarea: no disponible en la informacion proporcionada. En los resultados de busqueda aparece `unsloth/GLM-5.3-Flash-GGUF` en ModelScope como otro conjunto de cuantizaciones GGUF del mismo modelo base, sin datos de precision comparables en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo original: es una recuantizacion en GGUF del FP8 de Z.ai. Cualquier limitacion del base (sesgos, alucinacion, comportamiento del tokenizador) se hereda y, en las variantes de 2 bits, se acentua.
- Los expertos enrutados de Maya-S y Maya-S24 estan en 2 bits (IQ2_XXS / IQ2_S), un regimen agresivo; el propio autor reconoce que la separacion entre variantes en tareas de eleccion multiple esta dentro del ruido estadistico.
- El rendimiento depende del hardware: el esquema de offloading GPU/RAM/SSD implica que la velocidad de decodificacion puede degradarse mucho si el SSD es lento o si el conjunto de expertos activos no cabe en cache.
- El repositorio consultado (KENIC-1/GLM-5.3-Flash-Maya-GGUF) figura con 0 descargas y 0 likes, mientras que la model card atribuye la cuantizacion a peasantsmith. Conviene verificar la procedencia y la integridad de los ficheros antes de usarlos en produccion.
- La model card aparece truncada en la tabla de PIQA y no incluye resultados de MMLU, HumanEval ni GSM8K; no hay evidencia publicada en la informacion disponible sobre calidad en codigo o matematicas de estas cuantizaciones concretas.
- Idiomas soportados no documentados: no hay listado oficial de cobertura linguistica, solo mencion a chat multilingue en el conjunto de calibracion.
- Licencia MIT permite uso comercial, pero al derivar del modelo de Z.ai conviene revisar tambien los terminos del repositorio original zai-org/GLM-5.3-Flash.
- El soporte de vision requiere cargar el proyector mmproj por separado; no todos los motores GGUF lo gestionan igual.

## Enlaces

- Repositorio consultado: https://huggingface.co/KENIC-1/GLM-5.3-Flash-Maya-GGUF
- Repositorio del autor de la cuantizacion: https://huggingface.co/peasantsmith/GLM-5.3-Flash-Maya-GGUF
- README del autor: https://huggingface.co/peasantsmith/GLM-5.3-Flash-Maya-GGUF/blob/main/README.md
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Receta de referencia: https://huggingface.co/ISTA-DASLab
- Nota de prensa sobre GLM-5.3-Flash: https://www.marktechpost.com/2026/08/26/z-ai-releases-glm-5-3-flash-a-320b-a18b-natively-multimodal-moe-with-a-1m-token-context/
- Otra cuantizacion GGUF del mismo base (ModelScope): https://www.modelscope.cn/models/unsloth/GLM-5.3-Flash-GGUF
- Ficha de terceros: https://local-ai-zone.github.io/models/glm-5-3-flash-maya.html
