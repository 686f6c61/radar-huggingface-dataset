# HuggingFaceBio/Carbon-X-GGUF

## Resumen

Carbon-X-GGUF es la distribucion en formato GGUF de Carbon-X, un modelo de lenguaje abierto de 14.822.046.720 parametros (aproximadamente 14,8B) desarrollado por Hugging Face Bio dentro de la familia Carbon. El modelo esta especializado en ADN: lee secuencias crudas dentro de una conversacion de chat convencional y responde en ingles sobre si una mutacion es benigna o patogena, si una region controla la actividad de un gen, a que grupo de organismo pertenece una secuencia o cuales son las siguientes bases de una cadena, explicando su razonamiento.

La relevancia de esta publicacion es doble. Por un lado, lleva un modelo genomico de 14,8B a inferencia local mediante llama.cpp, con cuantizaciones que van de 29,7 GB (BF16) a 9,6 GB (Q4_K_M), lo que permite ejecutarlo en una unica GPU de consumo. Por otro, introduce un tokenizador hibrido (`HybridDNATokenizer`) que mantiene un vocabulario BPE para el texto y codifica el ADN como 6-mers no solapados, integrado en llama.cpp a partir del build b11742.

El modelo esta pensado para investigacion y analisis genomico asistido, no como dispositivo diagnostico. Su licencia es Apache-2.0, solo declara ingles y su ventana de contexto es de 40.960 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje de 14,8B; el autor no detalla la arquitectura en la informacion proporcionada) |
| Parametros totales | 14.822.046.720 (14,8B) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | BF16, Q8_0 (recomendada), Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 78,7 GB con todas las variantes) |

Detalle de ficheros publicados:

| Cuantizacion | Fichero | Tamano |
|---|---|---:|
| BF16 | `carbon-x-bf16.gguf` | 29,7 GB |
| Q8_0 (recomendada) | `carbon-x-q8_0.gguf` | 15,8 GB |
| Q6_K | `carbon-x-q6_k.gguf` | 12,6 GB |
| Q5_K_M | `carbon-x-q5_k_m.gguf` | 11,1 GB |
| Q4_K_M | `carbon-x-q4_k_m.gguf` | 9,6 GB |

En todas las variantes K-quant, los tensores de embedding y de salida, que contienen los tokens de ADN, se mantienen en Q8_0.

## Arquitectura y entrenamiento

Carbon-X es un modelo de lenguaje de 14,8B parametros del que el autor no especifica en la informacion disponible la arquitectura interna (transformer denso, MoE, hibrido u otra), ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Lo que si se documenta es la pieza diferenciadora: un tokenizador hibrido que combina un vocabulario BPE para el texto con una codificacion del ADN en 6-mers no solapados. Esto permite meter secuencias biologicas crudas en el mismo turno de conversacion que la pregunta en lenguaje natural, sin preprocesado externo.

El modelo fue post-entrenado y evaluado con el modo de razonamiento (thinking) desactivado, y el autor recomienda mantener `enable_thinking: false` en produccion. Los ajustes de muestreo por defecto con los que se generaron todos los resultados reportados son temperatura 0,6, top-p 0,95, top-k 20 y min-p 0, distintos de los valores por defecto de llama.cpp (0,8 / 0,95 / 40 / 0,05). La integracion en llama.cpp es reciente y depende del soporte de `HybridDNATokenizer`, anadido en el PR #30825 y disponible desde el build b11742.

## Capacidades

- Prediccion de efecto de variantes: clasifica mutaciones como benignas o patogenicas y justifica la decision en ingles.
- Identificacion de regiones reguladoras: detecta regiones que controlan la actividad genica.
- Clasificacion taxonomica: asigna secuencias a grupos de organismos.
- Prediccion de siguientes bases: completa o continua una secuencia de ADN dada.
- Razonamiento explicito: acompana la respuesta con el razonamiento biologico que la sustenta (por ejemplo, deteccion de codon de inicio ATG y ausencia de codones de parada en la pauta de lectura).
- Entrada de ADN crudo en chat: el tokenizador hibrido acepta la secuencia directamente en el mensaje del usuario, sin herramientas externas.
- Conversacion multi-turno: el template de chat esta embebido en el GGUF y se activa con `--jinja`.
- Servicio compatible con la API de OpenAI mediante `llama-server`, consumible con el SDK de OpenAI o con `curl`.
- No documentado en la informacion disponible: tool calling, function calling, capacidades de agente multi-paso, vision, audio o multimodalidad.

## Casos de uso

- Triaje de variantes en genomica clinica: introducir una variante y su contexto de secuencia en el chat y obtener una clasificacion preliminar benigno/patogenico con la justificacion, para priorizar que variantes revisa un genetista. El contexto de 40.960 tokens permite incluir bastante secuencia flanqueante en el mismo prompt.
- Anotacion de regiones reguladoras: usar el modelo para marcar candidatos de promotores y enhancers en fragmentos ensamblados, como paso de pre-anotacion antes de herramientas especializadas.
- Clasificacion de secuencias por grupo de organismo: en metagenomica o control de calidad, pedir al modelo que asigne un Contig a un grupo taxonomico amplio como filtro rapido.
- Completado y comprobacion de secuencias: predecir las siguientes bases para detectar discontinuidades en un ensamblaje o para generar hipotesis sobre extensiones de una secuencia parcial.
- Asistente local con datos genomicos sensibles: al ejecutarse con llama.cpp en hardware propio, las secuencias no salen de la infraestructura del laboratorio ni pasan por una API externa, lo que facilita el cumplimiento en entornos con datos de pacientes.
- Docencia y formacion: el modelo explica el razonamiento detras de cada prediccion en lenguaje natural, lo que sirve para ilustrar conceptos como pautas de lectura, codones de inicio y parada o regiones no codificantes.
- Integracion en plataformas LIMS o pipelines internos: `llama-server` expone un endpoint compatible con OpenAI, de modo que un servicio existente puede cambiar la URL base y consumir el modelo sin reescribir el cliente.
- Pre-filtrado en pipelines de secuenciacion: descartar rapidamente candidatos poco interesantes con un modelo local y barato antes de lanzar analisis mas costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion, pero no se han proporcionado sus cifras. El unico dato cuantitativo es cualitativo: el autor afirma que la cuantizacion Q8_0 obtiene las mismas puntuaciones de benchmark que BF16 con la mitad de tamano.

## Requisitos de hardware

- VRAM para Q8_0: unos 16 GB de pesos, mas aproximadamente 0,16 MB de cache KV por token. A los 40.960 tokens de contexto completo esto anade unos 6,4 GB, es decir, en torno a 22-23 GB totales.
- VRAM para Q4_K_M: 9,6 GB de pesos; con contexto completo, aproximadamente 16 GB en total.
- VRAM para Q6_K y Q5_K_M: 12,6 GB y 11,1 GB de pesos respectivamente, mas la cache KV correspondiente.
- VRAM para BF16: 29,7 GB, lo que exige una A100 40/80 GB, una H100 o reparto multi-GPU.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede cargar Q8_0 con `-ngl 99`, pero a contexto completo el margen es muy justo; Q6_K o Q5_K_M resultan mas comodos. Tarjetas de 16 GB pueden usar Q4_K_M con contexto reducido. Con 12 GB o menos conviene el offload parcial a CPU.
- CPU: al ser GGUF y estar soportado por llama.cpp, el modelo puede ejecutarse solo con CPU, con latencia mucho mayor.
- Despliegue: llama.cpp es la via documentada, con `llama-server` (API compatible con OpenAI, 4 slots paralelos por defecto, ajustables con `-np`) y `llama-cli` para terminal. Requiere el build b11742 o superior; construcciones anteriores cargan el modelo pero tokenizan mal el ADN. No se documentan en la informacion disponible opciones como vLLM, TGI u Ollama.
- Parametros de servicio de referencia: `llama-server -hf HuggingFaceBio/Carbon-X-GGUF:Q8_0 -ngl 99 -c 40960 --jinja --chat-template-kwargs '{"enable_thinking": false}' --temp 0.6 --top-p 0.95 --top-k 20 --min-p 0`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Carbon-X-GGUF (Q8_0) | 14,8B | 40.960 | GGUF, 15,8 GB | Apache-2.0 | Cuantizacion del modelo base; mismas puntuaciones que BF16 segun el autor; inferencia local con llama.cpp |
| Carbon-X-GGUF (Q4_K_M) | 14,8B | 40.960 | GGUF, 9,6 GB | Apache-2.0 | Variante para entornos con poca memoria |
| Carbon-X (modelo base) | 14,8B | no disponible en la informacion proporcionada | safetensors (relacion `quantized`) | Apache-2.0 | Version original sin cuantizar; la model card remite a ella para detalles y limitaciones |
| Otros modelos genomicos (Evo, Nucleotide Transformer, GENA-LM, etc.) | no disponible | no disponible | no disponible | no disponible | La informacion proporcionada no incluye datos de rendimiento ni especificaciones que permitan una comparacion rigurosa |

## Limitaciones y advertencias

- Solo admite ingles: las preguntas y respuestas estan en ese idioma; no hay soporte declarado de castellano.
- Ventana de contexto de 40.960 tokens. Codificando ADN como 6-mers no solapados, eso equivale aproximadamente a unos 245.000 pares de bases si todos los tokens fueran de ADN (estimacion aritmetica propia, no publicada por el autor), muy lejos de un genoma completo.
- Riesgo de alucinacion: es un modelo generativo que produce explicaciones biologicas plausibles; puede inventar interpretaciones, catalogos o funciones genicas. La respuesta de ejemplo de la propia model card matiza que la prediccion no prueba que la secuencia se traduzca ni establece su funcion biologica.
- No es un dispositivo medico ni una herramienta diagnostica: no debe usarse para decisiones clinicas sin validacion independiente y revision por especialistas.
- Dependencia estricta de la version de llama.cpp: por debajo del build b11742 el modelo carga pero tokeniza el ADN de forma incorrecta, un fallo silencioso que produce respuestas erroneas sin aviso.
- El modo thinking debe permanecer desactivado; el modelo fue post-entrenado y evaluado asi, por lo que activarlo lo saca de su regimen previsto.
- Sesgos potenciales hacia las especies, poblaciones y tipos de secuencia sobrerrepresentados en unos datos de entrenamiento que el autor no detalla; la ausencia de esa informacion impide auditar la cobertura.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se distribuye sin garantias; conviene revisar la model card del modelo base Carbon-X para las limitaciones completas.
- Validacion comunitaria muy baja en el momento de la ficha (2 descargas, 13 likes), lo que implica poca evidencia externa sobre su comportamiento en produccion.
- El repositorio completo ocupa 78,7 GB; conviene descargar solo la cuantizacion necesaria con `hf download`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HuggingFaceBio/Carbon-X-GGUF
- Modelo base Carbon-X: https://huggingface.co/HuggingFaceBio/Carbon-X
- Organizacion Hugging Face Bio: https://huggingface.co/HuggingFaceBio
- Blog / Space de presentacion: https://huggingface.co/spaces/HuggingFaceBio/Carbon-X-Release
- Codigo (familia Carbon): https://github.com/huggingface/carbon/tree/main
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- PR de soporte de `HybridDNATokenizer`: https://github.com/ggml-org/llama.cpp/pull/30825
- Release b11742 de llama.cpp: https://github.com/ggml-org/llama.cpp/releases/tag/b11742
- Releases de llama.cpp (binarios precompilados): https://github.com/ggml-org/llama.cpp/releases
