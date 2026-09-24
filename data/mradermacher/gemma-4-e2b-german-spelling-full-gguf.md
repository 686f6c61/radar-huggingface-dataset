# mradermacher/gemma-4-e2b-german-spelling-full-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo oliverguhr/gemma-4-e2b-german-spelling-full, publicadas por el usuario mradermacher, especializado en convertir pesos de HuggingFace al formato GGUF para su uso con llama.cpp y derivados. El modelo base apunta, por su nombre, a una tarea de corrección ortográfica en alemán sobre la familia Gemma (variante "e2b"), aunque la model card disponible no documenta ni la arquitectura ni el entrenamiento. El dato real de safetensors indica 4.647.450.147 parámetros totales (aproximadamente 4,65 mil millones).

El interés práctico de esta publicación no está en el modelo en sí, sino en la disponibilidad de versiones cuantizadas de 3,1 GB a 9,4 GB que permiten ejecutar un modelo de 4,65B en hardware de consumo, además de dos ficheros mmproj (Q8_0 y f16) que habilitan un complemento multimodal. El repositorio ocupa 49,6 GB en total y no registra descargas ni "likes" en el momento de la consulta, lo que indica que es una publicación muy reciente y sin validación comunitaria.

Se trata, por tanto, de una ficha de cuantización, no de un modelo nuevo: no hay información publicada sobre licencia, longitud de contexto, composición del dataset ni resultados de evaluación. Cualquier decisión de adopción en producción debería partir de la model card del modelo base, que no se ha incluido en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card del repositorio no la documenta; el nombre del modelo base sugiere la familia Gemma) |
| Parametros totales | 4.647.450.147 (dato real de safetensors, ~4,65B) |
| Parametros activos | no disponible (no se confirma que sea MoE ni cuantos parametros se activan) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mas mmproj-Q8_0 y mmproj-f16 para el complemento multimodal |
| Idiomas soportados | en (segun los tags y la model card); el nombre del modelo base hace referencia a ortografia alemana ("german-spelling") |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors segun el dato de parametros |
| Libreria declarada | transformers |
| Tamano del repositorio | 49,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun HuggingFace) | 2026-09-24 |
| Ultima actualizacion (segun HuggingFace) | 2026-09-24 |

Desglose de ficheros publicados:

| Fichero | Tipo | Tamano (GB) | Nota del autor |
|---|---|---|---|
| gemma-4-e2b-german-spelling-full.mmproj-Q8_0.gguf | mmproj-Q8_0 | 0,7 | complemento multimodal |
| gemma-4-e2b-german-spelling-full.mmproj-f16.gguf | mmproj-f16 | 1,1 | complemento multimodal |
| gemma-4-e2b-german-spelling-full.Q2_K.gguf | Q2_K | 3,1 | - |
| gemma-4-e2b-german-spelling-full.Q3_K_S.gguf | Q3_K_S | 3,2 | - |
| gemma-4-e2b-german-spelling-full.Q3_K_M.gguf | Q3_K_M | 3,3 | calidad inferior |
| gemma-4-e2b-german-spelling-full.Q3_K_L.gguf | Q3_K_L | 3,4 | - |
| gemma-4-e2b-german-spelling-full.IQ4_XS.gguf | IQ4_XS | 3,4 | - |
| gemma-4-e2b-german-spelling-full.Q4_K_S.gguf | Q4_K_S | 3,5 | rapido, recomendado |
| gemma-4-e2b-german-spelling-full.Q4_K_M.gguf | Q4_K_M | 3,5 | rapido, recomendado |
| gemma-4-e2b-german-spelling-full.Q5_K_S.gguf | Q5_K_S | 3,7 | - |
| gemma-4-e2b-german-spelling-full.Q5_K_M.gguf | Q5_K_M | 3,7 | - |
| gemma-4-e2b-german-spelling-full.Q6_K.gguf | Q6_K | 3,9 | muy buena calidad |
| gemma-4-e2b-german-spelling-full.Q8_0.gguf | Q8_0 | 5,1 | rapido, mejor calidad |
| gemma-4-e2b-german-spelling-full.f16.gguf | f16 | 9,4 | 16 bpw, excesivo |

## Arquitectura y entrenamiento

No hay informacion publicada en este repositorio sobre la arquitectura del modelo (transformer denso, MoE, hibrido u otra), el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card se limita a indicar que son cuantizaciones estaticas del modelo oliverguhr/gemma-4-e2b-german-spelling-full y a enlazar la pagina de descargas del cuantizador.

Los unicos indicios tecnicos disponibles son indirectos: el sufijo "e2b" en el nombre del modelo base, habitual en la nomenclatura de variantes con carga condicional de parametros, y la existencia de dos ficheros mmproj, que en el ecosistema llama.cpp corresponden a un proyector multimodal (tipicamente vision-lenguaje). Esto sugiere que el modelo base incorpora capacidad de procesamiento de imagenes, pero no se confirma en la documentacion disponible. El autor indica ademas que las cuantizaciones ponderadas o con imatrix no estan disponibles en el momento de la publicacion y que podrian no llegar a publicarse.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" indica que el modelo esta preparado para dialogos multi-turno.
- Correccion ortografica en aleman: la denominacion del modelo base ("german-spelling-full") apunta a un ajuste especifico para deteccion y correccion de errores ortograficos en aleman. No se especifica el formato de entrada/salida ni el conjunto de errores cubiertos.
- Procesamiento multimodal: la presencia de ficheros mmproj (Q8_0 y f16) indica soporte de entradas de imagen en el ecosistema llama.cpp, presumiblemente para OCR o comprension de documentos escaneados. No se detalla la resolucion ni el tipo de tareas soportadas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la model card declara unicamente "en", lo que contradice el proposito aparente del modelo base (ortografia alemana). No hay informacion sobre cobertura real de idiomas.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Correccion ortografica en aleman integrada en editores de texto: el modelo se puede desplegar en local mediante llama.cpp y consumirse a traves de una API compatible con OpenAI (el tag endpoints_compatible lo permite) para revisar parrafos y devolver la version corregida. La cuantizacion Q4_K_M, de 3,5 GB, es adecuada para este escenario por su equilibrio entre tamano y calidad.
- Normalizacion de transcripciones ASR: los sistemas de reconocimiento de voz en aleman generan errores de ortografia, puntuacion y mayusculas; un modelo ajustado a ortografia puede usarse como etapa de post-procesado en un pipeline de transcripcion antes de almacenar el texto.
- Limpieza de corpus OCR: combinando el fichero mmproj con el modelo de lenguaje, es posible procesar documentos escaneados y corregir los errores tipicos del OCR (caracteres confundidos, palabras partidas) antes de indexar el contenido.
- Generacion de material didactico para aprendizaje de aleman: el modelo puede producir ejercicios de dictado con errores deliberados y su correccion, o evaluar respuestas de estudiantes, desplegado en un servidor interno sin coste por token.
- Control de calidad editorial en flujos de publicacion: integrado como paso previo a la revision humana, permite filtrar errores ortograficos en grandes volumenes de texto y reducir el trabajo del corrector, con la ventaja de que el procesamiento puede hacerse por lotes en una unica GPU.
- Preprocesado de datos para entrenamiento de otros modelos: la correccion ortografica masiva de corpus alemanes ruidosos (foros, redes sociales, comentarios) mejora la calidad de los datasets antes de usarlos para ajuste fino o para indexado en sistemas RAG.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse completamente en local, desde 3,1 GB en la cuantizacion Q2_K, permite tratar textos legales, medicos o internos sin enviarlos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de tareas especificas de correccion ortografica, y tampoco se aportan comparaciones con otros modelos. El unico material de referencia es el grafico comparativo de perplejidad entre tipos de cuantizacion enlazado en la model card (https://www.nethype.de/huggingface_embed/quantpplgraph.png), que es generico y no especifico de este modelo.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamano de los ficheros publicados, asumiendo que los pesos ocupan aproximadamente su tamano en disco mas una reserva para cache KV y overhead del runtime. No son datos publicados por el autor.

- VRAM estimada para inferencia, solo pesos: 3,1 GB (Q2_K) hasta 9,4 GB (f16).
- VRAM recomendada con contexto corto: en torno a 4,5-5 GB para Q4_K_M; en torno a 5-6 GB para Q8_0; en torno a 10-11 GB para f16.
- Cabe en GPU de consumo: si. Q4_K_M y Q4_K_S entran en tarjetas de 6-8 GB (RTX 3060, RTX 4060, RTX 2070); Q5 y Q6 en tarjetas de 8 GB con contexto moderado; Q8_0 en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070); f16 requiere 12-16 GB (RTX 4080, RTX 4090, A4000).
- GPU profesionales: A100, H100, L40S y A6000 no aportan ventaja para un modelo de este tamano salvo por concurrencia; tiene mas sentido usar varias instancias pequenas que una GPU grande.
- Ejecucion en CPU: viable con llama.cpp usando las cuantizaciones Q4 o inferiores; el rendimiento depende del ancho de banda de memoria del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier servidor compatible con GGUF. El tag endpoints_compatible sugiere compatibilidad con APIs tipo OpenAI. vLLM ofrece soporte experimental de GGUF, pero no hay confirmacion de que esta arquitectura concreta funcione.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia.
- Nota sobre multimodalidad: para usar las capacidades de imagen hay que cargar adicionalmente el fichero mmproj, lo que anade 0,7 GB (Q8_0) o 1,1 GB (f16) al consumo de memoria.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada: no hay datos de rendimiento, contexto ni licencia de alternativas de la misma categoria. La unica comparacion posible con los datos disponibles es entre las propias cuantizaciones y el modelo base sin cuantizar.

| Version | Parametros | Tamano en disco | Contexto | Licencia | Uso recomendado |
|---|---|---|---|---|---|
| gemma-4-e2b-german-spelling-full (base, safetensors) | 4,65B | no disponible | no disponible | no disponible | Ajuste fino o inferencia en precision completa |
| Cuantizacion Q4_K_M (este repositorio) | 4,65B | 3,5 GB | no disponible | no disponible | Inferencia en GPU de 6-8 GB, uso general |
| Cuantizacion Q5_K_M (este repositorio) | 4,65B | 3,7 GB | no disponible | no disponible | Mejor calidad con consumo contenido |
| Cuantizacion Q8_0 (este repositorio) | 4,65B | 5,1 GB | no disponible | no disponible | Calidad casi nativa en GPU de 12 GB |
| Cuantizacion f16 (este repositorio) | 4,65B | 9,4 GB | no disponible | no disponible | Referencia de maxima calidad, poco practica |

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita no se puede asumir permiso de uso comercial. Hay que consultar la model card del modelo base oliverguhr/gemma-4-e2b-german-spelling-full antes de cualquier despliegue en produccion.
- Idiomas declarados incoherentes: la model card declara "en" mientras el nombre del modelo base referencia ortografia alemana. No se puede confirmar la cobertura real de idiomas ni el comportamiento fuera del aleman.
- Sin validacion comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, y fechas de creacion y actualizacion de 2026-09-24. No hay evidencia de que la cuantizacion haya sido probada por terceros.
- Fechas de publicacion anomales: las marcas temporales de HuggingFace son posteriores a la fecha actual conocida; conviene verificar el estado del repositorio antes de depender de el.
- Riesgo de alucinacion: como modelo generativo, puede introducir cambios no solicitados en el texto, inventar correcciones en palabras correctas o alterar terminologia tecnica. En tareas de correccion ortografica conviene usar modos de salida restringidos y validacion posterior.
- Perdida de calidad por cuantizacion: las variantes Q2_K y Q3_K degradan notablemente la calidad, segun el propio autor ("lower quality" para Q3_K_M). Para produccion se recomienda Q4_K_M o superior.
- Sin imatrix: el autor advierte de que no hay cuantizaciones ponderadas o con imatrix, que suelen ofrecer mejor relacion calidad/tamano que las estaticas equivalentes.
- Longitud de contexto desconocida: no se puede planificar el procesamiento de documentos largos ni configurar correctamente la cache KV sin conocer la ventana real del modelo base.
- Capacidad multimodal sin especificar: la existencia de ficheros mmproj no garantiza un rendimiento util en OCR o comprension de documentos; no hay evaluaciones publicadas.
- Sin datos de rendimiento: no hay cifras de latencia ni throughput, por lo que cualquier estimacion de coste de infraestructura seria especulativa.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/gemma-4-e2b-german-spelling-full-GGUF
- Modelo base: https://huggingface.co/oliverguhr/gemma-4-e2b-german-spelling-full
- Pagina de descargas y vision general del cuantizador: https://hf.tst.eu/model#gemma-4-e2b-german-spelling-full-GGUF
- Preguntas frecuentes y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad entre tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor (nethype GmbH): https://www.nethype.de/

Nota: los resultados de la busqueda web proporcionada no contienen informacion relacionada con este modelo ni con cuantizaciones GGUF; los enlaces devueltos corresponden a canales de video y redes sociales sin relacion con el contenido de la ficha.
