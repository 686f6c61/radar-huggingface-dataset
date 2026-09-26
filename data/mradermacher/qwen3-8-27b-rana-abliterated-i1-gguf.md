# mradermacher/Qwen3.8-27B-RANA-abliterated-i1-GGUF

## Resumen

Este repositorio contiene una publicación de cuantizaciones GGUF creada por el usuario mradermacher a partir de `preemware/Qwen3.8-27B-RANA-abliterated`, una variante "abliterated" del modelo Qwen3.8-27B de Alibaba. El sufijo `i1` indica cuantizaciones con imatrix (matriz de importancia) y el sufijo `abliterated` señala que el modelo base ha sido sometido a un proceso de ablación de direcciones de rechazo, es decir, una modificación de pesos orientada a eliminar la tendencia a negarse a responder determinadas peticiones. El repo fue creado el 25 de septiembre de 2026 y, en el momento de la consulta, registra 0 descargas y 0 likes.

El modelo de partida, Qwen3.8-27B, es según las fuentes disponibles el lanzamiento abierto de Alibaba publicado el 14 de agosto de 2026 bajo licencia Apache 2.0, concebido como hermano "single-GPU" del modelo propietario Qwen3.8-Max. Se describe como un modelo denso de 27B parámetros (unos 28B contando el codificador visual de aproximadamente 1B), con 64 capas, tamaño oculto de 5.120 y un vocabulario de 248.320 tokens, sobre una pila de atención híbrida que combina 48 capas lineales Gated DeltaNet con atención estándar.

La relevancia de esta ficha es doble: por un lado, documenta una vía de despliegue local de un modelo de 27B en formatos que van de IQ1_S a Q6_K; por otro, advierte de que la ablación de rechazos altera el comportamiento de seguridad del modelo original, algo crítico para cualquier evaluación o uso en producción. Conviene señalar que la documentación de este repositorio concreto es mínima y que buena parte de los metadatos estándar (licencia, idiomas, pipeline) no están declarados en la propia página del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (48 capas Gated DeltaNet lineal + atencion estandar), segun la informacion del modelo base Qwen3.8-27B. No confirmado en la model card del repo GGUF |
| Parametros totales | ~27B (denso, ~28B contando el codificador visual de ~1B segun la fuente del modelo base). El campo de parametros de HuggingFace para este repo indica 3.391.984, cifra no coherente con un modelo de 27B y probablemente un artefacto de metadatos |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_M, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (etiquetada como small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | No disponible en la model card. Repositorios hermanos del mismo autor estan etiquetados como "English" |
| Licencia | No disponible en la model card de este repo. El modelo base Qwen3.8-27B se publica bajo Apache 2.0 y repositorios hermanos de mradermacher (Qwen3.8-27B-abliterated-i1-GGUF, Qwen3.8-27B-3MPER0RR-obliterated-i1-GGUF) declaran License:apache-2.0 |
| Formato de pesos | GGUF |
| Version de cuantizacion | quantize_version: 2; output_tensor_quantised: 1; convert_type: hf (segun los comentarios de la model card) |
| Metodo de cuantizacion | Imatrix / weighted quants (sufijo i1) |
| Modelo de origen | preemware/Qwen3.8-27B-RANA-abliterated |

## Arquitectura y entrenamiento

No se dispone de informacion especifica sobre el entrenamiento de este repositorio, ya que se trata exclusivamente de una publicacion de cuantizaciones GGUF: el autor no ha entrenado el modelo, sino que ha convertido a formato GGUF y cuantizado los pesos de `preemware/Qwen3.8-27B-RANA-abliterated`. Segun los metadatos de la model card, el proceso usa `convert_type: hf` y `quantize_version: 2`, con cuantizacion de tensores de salida (`output_tensor_quantised: 1`) y cuantizacion ponderada por imatrix. El sufijo `i1` en la nomenclatura de mradermacher corresponde a este tipo de cuantizacion guiada por matriz de importancia, que calibra el error de cuantizacion por capa en lugar de aplicar una precision uniforme.

Respecto al modelo base, las fuentes disponibles describen Qwen3.8-27B como un transformer denso con una pila de atencion hibrida: 48 capas lineales Gated DeltaNet combinadas con capas de atencion estandar, 64 capas totales, hidden size de 5.120 y vocabulario de 248.320 tokens, con un codificador visual de aproximadamente 1B de parametros. No se han proporcionado datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo etapas de RLHF o DPO. Tampoco hay informacion sobre el procedimiento concreto de ablacion aplicado por el autor de la variante RANA: la tecnica de abliteration suele consistir en proyectar fuera de los pesos las direcciones que actuan como mecanismo de rechazo, pero no se documenta aqui el metodo exacto, el dataset de calibracion ni el impacto medido sobre capacidades.

## Capacidades

- Generacion de texto conversacional en un modelo denso de ~27B, con el nivel de capacidad esperable del modelo base Qwen3.8-27B.
- Procesamiento multimodal: el modelo base incluye un codificador visual de ~1B de parametros; el repo no marca `skip_mmproj`, lo que sugiere que el proyector multimodal puede estar disponible, aunque no se detalla en la model card.
- Razonamiento multi-turno y conversacion: los repositorios hermanos del autor estan etiquetados como "conversational".
- Capacidad multilingue: no documentada para este repo; el modelo base Qwen3.8 no especifica cobertura de idiomas en la informacion disponible.
- Comportamiento sin rechazos: la ablacion aplicada al modelo de origen elimina o atenua las respuestas de negativa ante peticiones que el modelo original rechazaria. Esta es la capacidad diferencial del repositorio, y tambien su principal riesgo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este repo ni confirmado para el modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modos especiales (thinking mode, audio, decodificacion especulativa): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar como se comporta una red de ~27B cuando se eliminan las direcciones de rechazo, comparando sus respuestas con las del Qwen3.8-27B original para caracterizar que capacidades y salvaguardas se ven afectadas por la ablacion. Es el caso de uso mas defendible de este repositorio.
- Red-teaming de sistemas de moderacion: usar las cuantizaciones Q4_K_M o Q5_K_M para generar de forma local prompts que los filtros de contenido deberian bloquear, y validar la robustez de clasificadores y guardarrailes desplegados en produccion.
- Generacion de datos sinteticos para entrenamiento de clasificadores de toxicidad: el modelo puede producir ejemplos etiquetados en dominios donde un modelo alineado se resiste a colaborar, alimentando datasets de deteccion con supervision.
- Escritura creativa y ficcion sin restricciones tematicas: narrativa que aborde violencia, contenido adulto o temas controvertidos, donde un modelo alineado introduciria rechazos o evasivas. Requiere revision humana y cumplimiento de la normativa aplicable.
- Despliegue local en hardware de consumo: las cuantizaciones Q3_K_M (aproximadamente 13 GB) y Q4_K_M (aproximadamente 16 GB) caben en GPU de 16-24 GB o se pueden ejecutar con offload parcial a CPU usando llama.cpp u Ollama, sin dependencia de API externa ni envio de datos a terceros.
- Analisis de documentos y corpus sensibles en local: al ejecutarse integramente en la maquina del usuario, permite procesar material confidencial o sujeto a restricciones de transferencia que no podria enviarse a un servicio en la nube.
- Evaluacion comparativa de tecnicas de ablacion: comparar esta variante RANA con otras variantes del mismo autor (abliterated y 3MPER0RR-obliterated) para medir diferencias de comportamiento y degradacion de capacidades entre metodos.
- Base para fine-tuning de dominio: las cuantizaciones no son adecuadas para reentrenar, pero el modelo de origen abliterated puede servir como punto de partida para ajustes especificos donde el comportamiento evasivo del modelo alineado resultaria un obstaculo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio ni los resultados de busqueda proporcionados incluyen cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni para este repo GGUF ni para la variante abliterated de la que deriva. Tampoco se documenta el impacto de la cuantizacion sobre la perplejidad o sobre tareas concretas.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir de los ~27B de parametros y del numero de bits por peso tipico de cada tipo de cuantizacion; no proceden de mediciones publicadas para este repositorio. Hay que sumar el consumo del contexto (KV cache) y, en su caso, del proyector multimodal.

| Cuantizacion | Tamano estimado de pesos | VRAM estimada con contexto | GPU de referencia |
|---|---|---|---|
| IQ1_S | ~5,3 GB | ~7-8 GB | RTX 3060 12 GB, RTX 4060 Ti 16 GB |
| IQ2_M | ~9,1 GB | ~11-12 GB | RTX 3060 12 GB, RTX 4070 Ti 16 GB |
| Q3_K_M | ~13,2 GB | ~16-18 GB | RTX 4080 16 GB, RTX 4090 24 GB |
| IQ4_XS | ~14,3 GB | ~17-19 GB | RTX 4090 24 GB, RTX 3090 24 GB |
| Q4_K_M | ~16,4 GB | ~20-22 GB | RTX 4090 24 GB, RTX 3090 24 GB |
| Q5_K_M | ~19,2 GB | ~23-26 GB | RTX 4090 24 GB (ajustado), A100 40 GB |
| Q6_K | ~22,3 GB | ~26-30 GB | A100 40 GB, H100 80 GB |
| Q8_0 (no listada en el repo) | ~29 GB | ~33-36 GB | A100 40 GB, H100 80 GB |

- Cabe en GPU de consumo: si. Las cuantizaciones de IQ1_S a IQ4_XS caben en tarjetas de 12-16 GB; Q4_K_M y Q5_K_M caben en 24 GB (RTX 3090, RTX 4090) con contexto moderado.
- GPU profesionales: A100 40/80 GB y H100 80 GB permiten ejecutar Q6_K y Q8 con contexto largo y alto paralelismo.
- Ejecucion en CPU: las cuantizaciones IQ1_S, IQ2_M y Q3_K_S son viables en equipos con 16 GB de RAM mediante llama.cpp, con velocidades de decodificacion de un solo digito en tokens por segundo, no cuantificadas aqui.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores GGUF compatibles. vLLM y TGI no son la via habitual para GGUF, aunque vLLM soporta algunos formatos GGUF con limitaciones; para despliegue de alto rendimiento convendria partir de los pesos safetensors del modelo de origen.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-RANA-abliterated-i1-GGUF (este repo) | ~27B denso | No disponible | No declarada en la model card | GGUF, 24 variantes de cuantizacion |
| Qwen3.8-27B (base, Alibaba) | ~27B denso, ~28B con vision | No disponible | Apache 2.0 | Pesos oficiales en HuggingFace |
| mradermacher/Qwen3.8-27B-abliterated-i1-GGUF | ~27B denso | No disponible | apache-2.0 (segun busqueda) | GGUF, con imatrix |
| mradermacher/Qwen3.8-27B-3MPER0RR-obliterated-i1-GGUF | ~27B denso | No disponible | apache-2.0 (segun busqueda) | GGUF, con imatrix |
| Qwen3.8-Max | No disponible | No disponible | Propietaria | Solo API |

La diferencia entre estas alternativas no esta en el tamano ni en la arquitectura, sino en el tratamiento del comportamiento de rechazo: el modelo base mantiene las salvaguardas originales, mientras que las variantes abliterated y obliterated las eliminan con metodos distintos. No hay datos publicos de rendimiento que permitan jerarquizarlas.

## Limitaciones y advertencias

- La ablacion de rechazos es una modificacion deliberada del comportamiento de seguridad. El modelo puede generar contenido danino, ilegal o gravemente ofensivo, y no debe desplegarse en aplicaciones orientadas al publico sin filtros externos robustos.
- La ablacion no es selectiva: tiende a degradar tambien la coherencia, la calidad de las respuestas y la adherencia a instrucciones en tareas no relacionadas con el rechazo. No se ha cuantificado esa degradacion en este repositorio.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual para este modelo ni para su base. La cuantizacion agresiva (IQ1_S, IQ2_XXS) incrementa adicionalmente la perdida de precision.
- Las cuantizaciones por debajo de 3 bits por peso suelen producir degradaciones notables de calidad. Para uso serio se recomienda Q4_K_M o superior.
- La licencia no esta declarada en la model card de este repositorio. Aunque el modelo base es Apache 2.0, conviene verificar los terminos antes de cualquier uso comercial, especialmente por la naturaleza de la modificacion.
- Idiomas soportados no documentados. No se puede asumir un rendimiento homogeneo fuera del ingles o del chino sin evaluacion previa.
- Longitud de contexto no documentada en este repositorio. No hay que asumir los valores del modelo base sin verificarlos en los metadatos de la conversion.
- Repositorio practicamente sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria y de informes de fallos.
- El campo de parametros de HuggingFace (3.391.984) es incoherente con el nombre del modelo, lo que sugiere metadatos defectuosos y obliga a verificar cualquier dato extraido automaticamente del repo.
- Uso responsable: cualquier aplicacion basada en este modelo en investigacion de seguridad deberia operar en entornos aislados y con registro de las interacciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-RANA-abliterated-i1-GGUF
- Modelo de origen: https://huggingface.co/preemware/Qwen3.8-27B-RANA-abliterated
- Variante abliterated del mismo autor: https://huggingface.co/mradermacher/Qwen3.8-27B-abliterated-i1-GGUF
- Variante 3MPER0RR-obliterated: https://huggingface.co/mradermacher/Qwen3.8-27B-3MPER0RR-obliterated-i1-GGUF
- Linaje de la familia OBLITERATED: https://parapulse.io/family/mradermacher/Qwen3.8-27B-OBLITERATED-GGUF
- Ficha informativa del modelo base Qwen3.8-27B: https://www.llm-releases.com/models/qwen3-8-27b
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
