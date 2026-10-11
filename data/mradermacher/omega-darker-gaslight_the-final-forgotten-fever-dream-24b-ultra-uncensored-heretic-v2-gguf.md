# mradermacher/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v2-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v2, publicado por el usuario llmfan46 y cuantizado por mradermacher, un autor conocido por generar versiones GGUF de modelos de la comunidad. El modelo tiene 23.572.403.200 parametros (unos 23,6B), esta etiquetado como "24B" en su nombre y esta orientado explicitamente a roleplay adulto, narrativa explicita y escenas de terror y violencia, con la alineacion de seguridad eliminada mediante tecnicas de ablacion (etiquetas "abliterated", "decensored", "heretic", "uncensored").

El problema que resuelve es de nicho: ofrecer una via practica de ejecucion local de un modelo sin filtros de contenido, algo que las API comerciales no permiten. Para ello el repositorio publica once variantes GGUF que van de 9,0 GB (Q2_K) a 25,2 GB (Q8_0), ademas de pesos F16, lo que permite desplegarlo en equipos de consumo con la cuantizacion adecuada. Existe tambien un repositorio paralelo con cuantizaciones ponderadas tipo imatrix (i1).

Es relevante con reservas importantes: la licencia no esta especificada, no hay benchmarks publicados, solo se documenta el ingles y la adopcion es muy baja (411 descargas y 1 like en la fecha de los datos). Se trata de un modelo comunitario de procedencia opaca, marcado como "not-for-all-audiences", cuyo uso en produccion exige verificacion legal y de edad previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se documenta en la informacion proporcionada; el recuento de parametros y la nomenclatura "24B" son compatibles con un transformer denso, sin confirmar) |
| Parametros totales | 23.572.403.200 (23,6B) |
| Parametros activos | no aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (estaticas); existe un repositorio aparte con cuantizaciones imatrix i1 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF en este repositorio; safetensors en el repositorio del modelo base |
| Cuantizador | mradermacher |
| Modelo base | llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v2 |
| Tamano del repositorio | 161,4 GB (incluye todas las variantes) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo: la model card del repositorio GGUF no incluye numero de capas, dimension del modelo, cabezas de atencion, tamano de vocabulario, contexto nativo ni tipo de atencion. Tampoco se detallan los datos de entrenamiento (numero de tokens, composicion del dataset, fases de ajuste supervisado, RLHF o DPO). mradermacher actua unicamente como cuantizador: convierte pesos ya entrenados a formato GGUF, por lo que no aporta informacion de entrenamiento.

Lo unico deducible con la informacion disponible son las tecnicas de post-procesado aplicadas al modelo base. Las etiquetas "abliterated", "decensored", "heretic" y "uncensored" indican la eliminacion o reduccion de los mecanismos de rechazo, habitualmente mediante ablacion de direcciones en el espacio de activaciones. La busqueda web indica que la version v1 de esta familia aparece clasificada en abliteration.org como "M3 Layer-wise ablation", lo que apunta a una ablacion capa a capa, si bien ese dato corresponde a la version v1 y no se confirma para la v2. No hay informacion sobre el metodo exacto de decensurado ni sobre el impacto cuantificado en las capacidades generales del modelo.

## Capacidades

- Generacion de texto conversacional y narrativo en ingles, con soporte de dialogos multi-turno.
- Roleplay adulto y contenido erotico explicito (ERP), segun las etiquetas del autor.
- Narrativa de terror y violencia explicita, orientada a ficcion y juegos de rol.
- Tasa de rechazo reducida: el modelo esta decensurado y abliterado, por lo que no aplica las politicas de seguridad tipicas de los modelos alineados.
- Estilo de respuesta "unaligned": menor tendencia a redirigir la conversacion o a introducir advertencias.
- Capacidad multilingue: solo se declara ingles; no hay indicios de soporte de castellano ni de otros idiomas.
- Tool calling / function calling: no disponible.
- Uso como agente o razonamiento multi-paso: no disponible, no documentado.
- Capacidades de vision, audio, codigo o matematicas: no disponibles, no documentadas.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Roleplay adulto en local: el modelo esta disenado para mantener personajes y escenas explicitas a lo largo de una conversacion, y su formato GGUF permite ejecutarlo en un equipo personal sin enviar datos a terceros.
- Escritura de ficcion de terror y violencia: escritores de genero pueden usarlo para generar borradores de escenas crudas o dialogos violentos que otros modelos rechazarian, trabajando siempre sobre material ficticio y con revision humana posterior.
- Red teaming e investigacion sobre alineacion: sirve como sujeto de estudio para medir como varia la tasa de rechazo, la coherencia y la toxicidad tras aplicar abliteracion capa a capa frente al modelo base alineado.
- Generacion de datos sinteticos para clasificadores de contenido: permite producir muestras etiquetadas como NSFW o violentas con las que entrenar o evaluar sistemas de moderacion, siempre en un entorno controlado y aislado.
- Dialogos para videojuegos para adultos: estudios que desarrollan titulos con contenido explicito pueden generar lineas de personaje y variaciones de guion para NPC, con la ventaja de que el modelo no bloquea tematicas maduras.
- Companeros conversacionales (companion apps): aplicaciones de entretenimiento para adultos con verificacion de edad pueden desplegarlo en local o en servidor propio, con coste marginal bajo al ser un modelo de 23,6B cuantizado.
- Simulacion de personajes persistentes en partidas de rol por texto: el modelo mantiene registro del personaje y del tono de la escena, algo adecuado para sesiones largas de rol escrito entre usuarios adultos.
- Estudio comparativo de cuantizaciones: la variedad de quants publicados (de Q2_K a Q8_0) permite medir la degradacion de coherencia narrativa segun el nivel de compresion, un experimento util para quienes despliegan modelos grandes en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se aportan datos de perplexity de las distintas cuantizaciones mas alla del grafico generico de comparacion de tipos de quant enlazado por el autor. La busqueda web menciona una clasificacion y "benchmarks" en abliteration.org para la version v1 de la familia, pero no se proporcionan valores numericos verificables.

## Requisitos de hardware

Los tamanos de fichero son datos reales del repositorio; las cifras de VRAM son estimaciones que anaden entre 1,5 y 4 GB de sobrecarga por cache KV y runtime, y por tanto varian segun backend, longitud de contexto y uso de offload.

| Cuantizacion | Tamano del fichero | VRAM estimada | GPU de ejemplo |
|---|---|---|---|
| Q2_K | 9,0 GB | ~11 GB | RTX 3060 12 GB, RTX 4070 12 GB |
| Q3_K_S | 10,5 GB | ~12,5 GB | RTX 3060 12 GB (justo) |
| Q3_K_M | 11,6 GB | ~13,5-14 GB | RTX 4070 Ti Super 16 GB |
| IQ4_XS | 13,0 GB | ~15 GB | RTX 4080 16 GB |
| Q4_K_S | 13,6 GB | ~15,5-16 GB | RTX 4080 16 GB |
| Q4_K_M | 14,4 GB | ~16-19 GB | RTX 4080 16 GB (justo), RTX 4090 24 GB (holgado) |
| Q5_K_M | 16,9 GB | ~19-22 GB | RTX 4090 24 GB |
| Q6_K | 19,4 GB | ~22-25 GB | RTX 4090 24 GB (justo) |
| Q8_0 | 25,2 GB | ~28-31 GB | A6000 48 GB, 2x RTX 4090, H100 |
| F16 | ~47,1 GB (estimado a partir de 23,57B x 2 bytes) | ~50 GB o mas | A100 80 GB, H100 80 GB |

- Cabe en GPU de consumo: si, desde Q2_K en tarjetas de 12 GB hasta Q4_K_M en 16-24 GB. En GPU de 8 GB no cabe ninguna variante completa y hay que recurrir a offload parcial a CPU y RAM.
- GPU profesionales recomendadas: A100 80 GB o H100 80 GB para F16 y Q8_0 con contexto largo; A6000 o L40S para Q6_K y Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui (oobabooga), Jan y llamafile. vLLM y TGI no son la via recomendada para GGUF (soporte limitado o experimental), por lo que para servir en produccion conviene convertir a safetensors y usar vLLM sobre los pesos originales.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Como referencia estructural, el modelo es denso de 23,6B, por lo que el coste por token es proporcional a todos los parametros en cada paso de decodificacion.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de este modelo ni de datos verificables de alternativas equivalentes dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento. La tabla siguiente compara unicamente variantes de la misma familia y su modelo de origen, con los datos disponibles.

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Contexto |
|---|---|---|---|---|---|
| Este repositorio (v2 GGUF, cuantizacion estatica) | 23,6B | GGUF | 11 tipos + F16 | no disponible | no disponible |
| mradermacher (v2 GGUF i1, imatrix) | 23,6B | GGUF | no disponible en detalle | no disponible | no disponible |
| llmfan46 (v2, modelo base) | 23,6B | safetensors | no aplica | no disponible | no disponible |
| Familia v1 (M3 layer-wise ablation) | no disponible | GGUF | no disponible en detalle | no disponible | no disponible |

Comparar con alternativas consolidadas de ~24B-32B (por ejemplo Mistral Small 3 o Qwen2.5) no seria riguroso sin datos de evaluacion homogeneos: seria atribuir rendimiento a partir de nombres y tamanos, no de mediciones. Si se necesita esa comparacion, hay que ejecutar las mismas pruebas sobre ambos modelos.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido. Hay que contactar con el autor del modelo base antes de cualquier despliegue productivo.
- Contenido explicito y violento: el modelo esta etiquetado como "nsfw", "explicit", "not-for-all-audiences" y orientado a ERP, terror y violencia. Desplegarlo sin control de edad ni moderacion puede vulnerar normativa de servicios digitales y de proteccion de menores.
- Riesgo de generacion de contenido ilegal: al estar abliterado, no incorpora rechazos por defecto. La responsabilidad sobre las salidas recae por completo en quien lo opera.
- Sesgos y toxicidad: la ablacion de direcciones de rechazo suele acompanarse de un aumento de estereotipos, lenguaje toxico y respuestas degradadas en tareas generales. No hay evaluaciones publicadas que cuantifiquen ese efecto en esta version.
- Alucinacion: con 23,6B de parametros y sin datos de entrenamiento publicados, el riesgo de inventar hechos es alto en tareas de conocimiento factual.
- Idioma: solo se documenta ingles. El rendimiento en castellano es desconocido y no esta respaldado por el autor.
- Contexto desconocido: no se especifica la ventana nativa ni si admite extension; planificar conversaciones largas sin ese dato es arriesgado.
- Procedencia opaca: ni el modelo base ni su dataset estan documentados, lo que impide auditar sesgos, derechos de autor o cumplimiento normativo del entrenamiento.
- Adopcion marginal: 411 descargas y 1 like en los datos disponibles, con un unico mantenedor. No hay validacion comunitaria suficiente para confiar en la calidad del resultado.
- Cuantizaciones muy agresivas: Q2_K y Q3_K_S degradan de forma notable la coherencia; para narrativa larga conviene Q4_K_M o superior.
- Peso del repositorio: 161,4 GB en total; conviene descargar solo el fichero de la cuantizacion elegida.
- Trazabilidad temporal: las fechas del repositorio (creacion y ultima actualizacion) deben verificarse en la pagina de HuggingFace antes de citarlas, ya que los metadatos de modelos comunitarios cambian con frecuencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v2-GGUF
- Repositorio con cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v2-i1-GGUF
- Modelo base: https://huggingface.co/llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v2
- Version v1 del modelo (referencia de la familia): https://huggingface.co/ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B
- Ficha de la v1 en abliteration.org: https://abliteration.org/models/mradermacher/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1-GGUF
- Ficha de la v1 i1 en abliteration.org: https://abliteration.org/models/mradermacher/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v2-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplexity por tipo de quant: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Entidad cuantizadora: https://www.nethype.de/
