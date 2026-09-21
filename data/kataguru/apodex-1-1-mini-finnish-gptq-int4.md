# kataguru/Apodex-1.1-mini-Finnish-GPTQ-Int4

## Resumen

Apodex-1.1-mini-Finnish-GPTQ-Int4 es una cuantizacion de 4 bits del modelo apodex/Apodex-1.1-mini, publicada por el usuario kataguru y orientada especificamente a servir inferencia en vLLM con plantilla de chat en fines. Se trata de un modelo de mezcla de expertos (MoE) de 35.951.822.704 parametros totales, de los que solo unos 3.000 millones se activan por token (8 de 256 expertos), lo que le permite mantener una huella de aproximadamente 23 GB en pesos y velocidades de generacion muy altas en configuraciones tensor-parallel de 2 GPUs.

La propuesta del autor combina cuatro elementos: dominio del fines con plantilla de chat integrada, razonamiento autonomo activable mediante marcadores explicitos (`{REASON:spoon}`, `{REASON:einstein}`, `{REASON:none}`), vision nativa con OCR, y una ventana de contexto de 262.144 tokens. La arquitectura declarada es hibrida, con 40 capas de las cuales 30 usan atencion lineal (GDN) y 10 atencion completa, lo que reduce el coste de memoria del cache KV en contextos largos.

Es relevante ahora porque los modelos MoE con pocos parametros activos estan desplazando a los densos de tamano equivalente en escenarios de produccion con requisitos de latencia estrictos, y porque el soporte de fines de alta calidad sigue siendo escaso en el ecosistema abierto. Conviene senalar que el repositorio no tiene descargas ni valoraciones, y que todas las cifras de rendimiento publicadas proceden del propio autor, sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer hibrida con atencion lineal (GDN) y atencion completa; identificador de arquitectura declarado: qwen3_5_moe |
| Parametros totales | 35.951.822.704 (~36B), segun los pesos safetensors del repositorio |
| Parametros activos | ~3B por token (8 de 256 expertos enrutados) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ Int4 (4 bits); el modelo base tambien se distribuye en GPTQ Int4 |
| Idiomas soportados | fines (fi) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos cuantizados con GPTQ) |
| Capas | 40 (30 de atencion lineal GDN + 10 de atencion completa) |
| Expertos | 256 enrutados, 8 activos por token |
| Modalidades | Texto e imagen (vision nativa y OCR) |
| Tamano del repositorio | 24,7 GB |
| Modelo base | apodex/Apodex-1.1-mini (y su version cuantizada apodex/Apodex-1.1-mini-GPTQ-Int4) |
| Autor de la adaptacion | kataguru (plantilla de chat en fines, integracion y validacion) |
| Fecha de publicacion | 21 de septiembre de 2026, segun los metadatos de HuggingFace |
| Token de pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura descrita es una mezcla de expertos con 256 expertos enrutados y 8 activos por token, organizada en 40 capas que alternan dos mecanismos de atencion: 30 capas de atencion lineal (denominada GDN en la documentacion del autor) y 10 capas de atencion completa. Esta combinacion busca reducir el coste computacional y de memoria del cache KV en secuencias largas, lo que explica que el autor pueda declarar una ventana de 262.144 tokens manteniendo el modelo en torno a 23 GB de pesos. El modelo incorpora ademas capacidad multimodal nativa de imagen y OCR, y se sirve con parser de razonamiento `qwen3` y parser de tool calling `qwen3_coder` en vLLM.

El modelo no es un entrenamiento desde cero de kataguru, sino una adaptacion finlandesa (plantilla de chat en `chat_template.jinja` y `tokenizer_config.json`) del modelo base de Apodex AI. Incluye tres modos de razonamiento: `auto` (el modelo decide si activar el bloque `<think>...</think>`), `{REASON:spoon}` (investigacion profunda simulada en seis fases con panel multidisciplinar) y `{REASON:einstein}` (brainstorming creativo con 10 a 20 perspectivas), mas `{REASON:none}` para saltar el razonamiento y minimizar latencia. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO: esos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en fines e ingles, con especial enfasis en fines idiomatico: prosa literaria, texto tecnico y lenguaje juridico contractual.
- Razonamiento multi-paso con modo de pensamiento explicito (`<think>...</think>`) activable de forma autonoma o forzada mediante marcadores.
- Razonamiento matematico y tecnico en dominios como arquitectura de sistemas, consenso distribuido (Raft, split-brain) y criptografia post-cuantica (ML-KEM, SLH-DSA), segun los ejemplos de validacion del autor.
- Vision nativa y OCR: analisis de imagenes y reconocimiento de texto, incluido texto en fines, con soporte para multiples imagenes por prompt (`--limit-mm-per-prompt '{"image":99}'`).
- Tool calling / function calling, habilitado mediante `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder` en vLLM.
- Soporte de agentes y flujos multi-paso a traves del parser de razonamiento y del mode de investigacion profunda.
- Razonamiento en contexto largo: analisis conjunto de documentacion extensa y bases de codigo dentro de la ventana de 262.144 tokens.
- Capacidades multilingues limitadas a fines e ingles; no se declaran otros idiomas.
- Comportamiento de rechazo descrito por el autor como directo y asertivo, sin discursos moralizantes.

## Casos de uso

- Atencion al cliente en fines: el modelo puede gestionar conversaciones multi-turno con clientes fineses aprovechando su ventana de 262.144 tokens para arrastrar el historial completo y documentacion de producto sin truncar, y su plantilla de chat integrada garantiza respuestas en fines por defecto.
- Generacion de documentacion tecnica y juridica en fines: redaccion de contratos, informes tecnicos y manuales, con el modo `{REASON:spoon}` activado para tareas que requieren contraste de alternativas y doble comprobacion.
- Asistente de investigacion sobre corpus largos: carga de bases de codigo o expedientes completos en el contexto para responder preguntas cruzadas, apoyandose en las 30 capas de atencion lineal para contener el coste de memoria del cache KV.
- Digitalizacion de documentos escaneados: combinacion de vision y OCR para extraer texto de imagenes y facturas, con salida directa en fines, usando el limite de multiples imagenes por prompt que documenta el autor.
- Agentes con herramientas en produccion: integracion en pipelines que requieren function calling, por ejemplo consulta de bases de datos internas o ejecucion de acciones sobre APIs, con el parser `qwen3_coder` de vLLM.
- Generacion de codigo asistida en equipos fineses: el modelo mantiene capacidades tecnicas y matematicas y puede insertarse en revisores de codigo o generadores de tests mediante la API compatible con OpenAI.
- Automatizaciones de baja latencia: con `{REASON:none}` y `--max-num-batched-tokens` ajustado, el modo sin razonamiento es adecuado para clasificacion o extraccion de entidades en volumen, donde interesa throughput por encima de profundidad.
- Servicio de inferencia con throughput alto: para aplicaciones con muchos usuarios concurrentes en las que el coste por token es critico, el ratio de 3B parametros activos sobre 36B totales reduce el coste de computo por token generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente publica una tabla de validacion empirica propia con velocidades de generacion en vLLM con tensor-parallel de 2 sobre dos RTX 5090:

| Tarea / modo | Tokens | Velocidad (tok/s) | Observacion del autor |
|---|---|---|---|
| Consulta rutinaria (auto) | 14 | 44,3 | Respuesta inmediata sin razonamiento ("La capital de Finlandia es Helsinki") |
| Arquitectura compleja | 1024 | 241,2 | Consenso Raft con split-brain en 5 nodos |
| Modo investigacion (`{REASON:spoon}`) | 1500 | 242,0 | Criptografia post-cuantica en DLT financiero (ML-KEM, SLH-DSA) |
| Brainstorming creativo (`{REASON:einstein}`) | 1349 | 242,7 | Cinco interfaces radicales de IA espacial |
| Morfologia y terminologia | 728 | 242,2 | Texto tecnico en fines sin errores segun el autor |
| Vision multimodal y OCR | 256 | no disponible (descrito como "inmediato") | Reconocimiento de texto fines en imagen, 100 % correcto segun el autor |
| Seguridad y alineacion | 512 | no disponible (descrito como "rapido") | Rechazo directo, asertivo y educado sin sermones |

Estos datos no son benchmarks comparables con estandares de la industria: son mediciones de velocidad y observaciones cualitativas del propio autor, sin metodologia publicada, sin repeticiones ni evaluacion independiente. El TTFT se describe genericamente como "fracciones de segundo", sin cifra concreta.

## Requisitos de hardware

- VRAM estimada para pesos: unos 23 GB en GPTQ Int4 (tamano declarado del modelo cuantizado), lo que corresponde a unos 11,5 GB por GPU en configuracion tensor-parallel de 2.
- Configuracion validada por el autor: 2 x RTX 5090 con `--tensor-parallel-size 2` y cache KV en fp8.
- Segun el autor, el modelo cabe en 2 GPUs de 16 GB, 24 GB o 32 GB, siempre que se reparta con tensor parallel.
- Inferencia en una sola GPU consumer: no validada en la informacion disponible. Con ~23 GB de pesos mas cache KV, una GPU de 24 GB tendria un margen muy ajustado incluso con `--kv-cache-dtype fp8`; una GPU de 32 GB (por ejemplo, clase RTX 5090) seria el minimo razonable para una sola tarjeta, aunque sin confirmacion del autor.
- GPUs profesionales: el autor no proporciona mediciones para A100, H100 u otras; no disponible.
- Opciones de despliegue confirmadas: vLLM con backend GPTQ, incluyendo `--enable-chunked-prefill`, `--reasoning-parser qwen3` y `--tool-call-parser qwen3_coder`.
- Otras opciones (llama.cpp, Ollama, TGI) no estan documentadas para este repositorio y no pueden confirmarse: no disponible.
- Throughput declarado: 241,2 a 242,7 tokens por segundo en TP=2 con 2 x RTX 5090 en tareas de razonamiento; 44,3 tok/s en consulta rutinaria de 14 tokens. No se especifica el tamano de lote utilizado en cada medicion.
- Parametros de muestreo recomendados por el autor en el ejemplo de codigo: `temperature=0.6`, `top_p=0.95`; `--max-num-seqs 16` y `--max-num-batched-tokens 8192` en el servidor.

## Comparativa con modelos similares

Los datos de la columna comparativa no proceden de la informacion proporcionada en esta busqueda; se incluyen como referencia del conocimiento publico general y deben verificarse antes de tomar decisiones.

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Apodex-1.1-mini-Finnish-GPTQ-Int4 | 36B / ~3B (8 de 256 expertos) | 262.144 tokens | Apache 2.0 | HuggingFace, GPTQ Int4 para vLLM | Especializado en fines, vision nativa, sin benchmarks publicados |
| Qwen3-30B-A3B | 30,5B / 3,3B (8 de 128 expertos) | 32.768 tokens nativo, ampliable a 131.072 | Apache 2.0 | HuggingFace, multiples formatos | Sin especializacion finesa, referencia habitual en la categoria MoE de ~3B activos |
| Qwen3-32B (denso) | 32,8B / 32,8B | 32.768 tokens nativo, ampliable a 131.072 | Apache 2.0 | HuggingFace | Mayor coste por token al ser denso; mejor latencia no aplica, peor throughput |
| Mixtral 8x7B | 46,7B / 12,9B | 32.768 tokens | Apache 2.0 | HuggingFace, ecosistema amplio | Mas parametros activos (12,9B), mayor coste de inferencia, sin vision |

Las cifras de los modelos comparativos corresponden a especificaciones publicas conocidas y no a la informacion proporcionada en esta busqueda; deben confirmarse en sus respectivas fichas. No se dispone de una comparacion oficial entre Apodex-1.1-mini y estos modelos.

## Limitaciones y advertencias

- Ausencia total de benchmarks estandar: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones multilingues verificables. Las unicas cifras publicadas son mediciones de velocidad del autor.
- Repositorio sin validacion de la comunidad: cero descargas y cero "likes" en el momento de la consulta, lo que implica que no hay retroalimentacion independiente sobre calidad o estabilidad.
- Riesgo de alucinacion no cuantificado: no se documentan tasas de error ni pruebas de fidelidad factual. En dominios como criptografia, derecho o arquitectura de sistemas, la verificacion humana es imprescindible.
- Cobertura idiomatica limitada: solo fines e ingles. El rendimiento en castellano no esta evaluado y no deberia asumirse.
- Cuantizacion GPTQ Int4: la cuantizacion de 4 bits puede degradar tareas sensibles a la precision numerica, como matematicas avanzadas o generacion de codigo estricta, respecto al modelo base de precision completa. No se publican comparativas entre el modelo base y esta version cuantizada.
- Modos de razonamiento propietarios: los marcadores `{REASON:spoon}` y `{REASON:einstein}` son convenciones del autor/documentacion del modelo base; no hay evaluacion externa de que produzcan mejoras medibles frente al modo `auto`.
- Fechas anomalas en los metadatos: la publicacion se marca como 21 de septiembre de 2026, lo que dificulta situar la version respecto a otras y sugiere posible manipulacion o error en los metadatos.
- Naturaleza derivada: es una adaptacion (plantilla de chat e integracion) sobre apodex/Apodex-1.1-mini. Las condiciones de uso del modelo base y de sus datos de entrenamiento deben verificarse en su ficha, aunque la licencia declarada sea Apache 2.0.
- Trazabilidad de la arquitectura: la etiqueta de arquitectura `qwen3_5_moe` no corresponde a una arquitectura ampliamente documentada en la comunidad; no hay publicacion tecnica que detalle la implementacion, el tokenizador o el entrenamiento.
- Vision sin documentacion tecnica: se declara capacidad multimodal y OCR, pero no se especifica el codificador visual, la resolucion de imagen soportada ni el rendimiento en documentos complejos.
- Sin garantias de produccion: el aviso del autor de "recomendado calurosamente para produccion" no esta respaldado por pruebas de carga, evaluaciones de seguridad ni auditoria de sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kataguru/Apodex-1.1-mini-Finnish-GPTQ-Int4
- Modelo base: https://huggingface.co/apodex/Apodex-1.1-mini
- Version cuantizada del modelo base citada por el autor: https://huggingface.co/apodex/Apodex-1.1-mini-GPTQ-Int4 (referencia textual de la model card; no verificada)
- Documentacion de vLLM para despliegue GPTQ y multimodal: no disponible en la informacion proporcionada
- Paper tecnico, blog del autor, repositorio de codigo o demo: no disponible en la informacion proporcionada. Los resultados de la busqueda web no contienen ningun enlace relacionado con este modelo.
