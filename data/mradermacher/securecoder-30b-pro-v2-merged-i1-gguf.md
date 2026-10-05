# mradermacher/securecoder-30b-pro-v2-merged-i1-GGUF

## Resumen

El repositorio `mradermacher/securecoder-30b-pro-v2-merged-i1-GGUF` contiene cuantizaciones en formato GGUF del modelo base `Taimwe/securecoder-30b-pro-v2-merged`, un transformer de aproximadamente 30.532 millones de parametros (30,5 B). El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF para llama.cpp, que en este caso ha generado los ficheros a partir del modelo original alojado en HuggingFace.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 30B en hardware de consumo mediante cuantizacion agresiva. Sin embargo, el repositorio esta en un estado muy inicial (0 descargas y 0 likes en el momento de redactar la ficha) y la model card es una plantilla generica de mradermacher que no documenta arquitectura, datos de entrenamiento, contexto ni capacidades reales del modelo original.

No se dispone de informacion sobre la licencia, el pipeline, la longitud de contexto ni la composicion del dataset de entrenamiento. Todo lo que se puede afirmar con certeza procede de los metadatos: 30,5 B de parametros, idioma ingles, etiquetas `conversational` y `endpoints_compatible`, y presencia de un fichero imatrix que permite generar cuantizaciones ponderadas de mayor calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la model card) |
| Parametros totales | 30.532.122.624 (~30,5 B) |
| Parametros activos | no disponible (no se indica si es MoE ni, en su caso, cuantos activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix, i1-Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K_S, Q2_K, IQ4_XS, small-IQ4_NL (segun etiquetas; solo imatrix e i1-Q2_K figuran como ficheros publicados) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base esta en formato transformers/safetensors) |
| Ficheros publicados | `securecoder-30b-pro-v2-merged.imatrix.gguf` (0,2 GB) y `securecoder-30b-pro-v2-merged.i1-Q2_K.gguf` (11,4 GB) |
| Tamano del repositorio | 11,4 GB |
| Fecha de publicacion (metadatos) | 4 de octubre de 2026 |

## Arquitectura y entrenamiento

No disponible. La model card del repositorio GGUF es la plantilla estandar de mradermacher y no incluye ninguna descripcion de la arquitectura del modelo base (`Taimwe/securecoder-30b-pro-v2-merged`), del numero de tokens de entrenamiento, de la composicion del dataset ni de si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

Lo unico inferible a partir de los metadatos es que se trata de un modelo denso de 30,5 B o, en su caso, de un MoE con ese total de parametros (no se especifica cual de las dos opciones), orientado a conversacion segun la etiqueta `conversational`, con vocabulario y entrenamiento en ingles, y compatible con endpoints de inferencia. El fichero imatrix incluido indica que el cuantizador calculo una matriz de importancia para ponderar la cuantizacion, lo que habitualmente reduce la degradacion de perplejidad en cuants de baja precision, pero no aporta informacion sobre el entrenamiento original.

## Capacidades

No se documentan capacidades especificas en la informacion disponible. Las unicas etiquetas declaradas son `conversational`, `endpoints_compatible` e `imatrix`, que indican:

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints de inferencia estandar de HuggingFace.
- Cuantizacion ponderada mediante matriz de importancia (imatrix), lo que mejora la fidelidad de los cuants de baja precision.

No hay evidencia en la informacion proporcionada sobre soporte de tool calling, capacidades de agente, razonamiento multi-paso, vision, audio, modo de pensamiento explicito ni cobertura multilingue mas alla del ingles. El nombre del modelo sugiere una orientacion a codigo y seguridad, pero esto es una inferencia nominal, no un dato confirmado por la model card.

## Casos de uso

Los siguientes escenarios son plantillas de uso razonables para un modelo denso de 30B en GGUF. Deben validarse empiricamente, ya que las capacidades reales del modelo base no estan documentadas.

- Revision de codigo con foco en seguridad: si el modelo base cumple lo que sugiere su nombre, puede usarse para analizar fragmentos de codigo y senalar patrones de vulnerabilidad (inyeccion SQL, desbordamientos de buffer, manejo inseguro de credenciales) dentro de un pipeline de revision previa al merge.
- Asistente de programacion local en el IDE: la cuantizacion i1-Q2_K de 11,4 GB permite cargar el modelo con llama.cpp o Ollama en una GPU de 16 GB y ofrecer autocompletado y explicaciones de codigo sin enviar el codigo fuente a servicios externos.
- Despliegue en entornos air-gapped: al ser un fichero GGUF autocontenido y no requerir conexion a APIs externas, encaja en organizaciones con requisitos de confidencialidad estrictos (banca, defensa, sanidad) donde el codigo no puede salir de la red corporativa.
- Chat tecnico de soporte interno: uso conversacional para resolver dudas de documentacion interna o de APIs propias, con la salvedad de que el contexto maximo no esta documentado y debe medirse antes de disenar el sistema de recuperacion.
- Generacion de cuantizaciones propias: el fichero imatrix publicado permite a terceros producir quants personalizados (por ejemplo Q4_K_M o Q5_K_M) con una matriz de importancia ya calculada, replicando el proceso de mradermacher.
- Evaluacion comparativa de cuantizaciones en investigacion: el par imatrix + i1-Q2_K sirve como punto de partida para estudiar la degradacion de perplejidad y de calidad de generacion en modelos de 30B sometidos a cuantizacion de 2-3 bits.
- Integracion en CI/CD para tareas auxiliares: resumen de diffs, generacion de mensajes de commit o documentacion automatica de funciones, siempre que se valide la calidad del cuant de 2 bits o se genere una version de mayor precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MBPP ni ninguna otra metrica, y tampoco se proporcionan curvas de perplejidad comparando las distintas cuantizaciones.

## Requisitos de hardware

Estimaciones calculadas a partir de los 30,5 B de parametros y de los tamanos tipicos por peso (bits por parametro). No son datos publicados por el autor.

- VRAM aproximada segun cuantizacion (solo pesos, sin cache KV):
  - IQ1_S / IQ2_XXS: ~8-10 GB
  - i1-Q2_K: 11,4 GB (tamano real del fichero publicado)
  - Q3_K_M: ~14-16 GB
  - Q4_K_M: ~18-19 GB
  - Q5_K_M: ~21-22 GB
  - Q6_K: ~25 GB
  - Q8_0: ~32 GB
  - FP16: ~61 GB
- Anadir entre 2 y 8 GB adicionales de VRAM para la cache KV, dependiendo de la longitud de contexto configurada (que no esta documentada) y del numero de capas.
- GPU consumer: la cuantizacion i1-Q2_K (11,4 GB) entra en RTX 4080/4090 (16-24 GB) y en RTX 3080 Ti/3090 con margen. Un Q4_K_M cabria en una RTX 4090 de 24 GB. Para Q5_K_M o superiores conviene una RTX 5090 (32 GB) o el reparto de capas entre GPU y CPU.
- GPU profesional: A100 40/80 GB, H100 80 GB o L40S 48 GB para ejecutar Q8_0 o FP16 completos en una sola tarjeta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con llama.cpp. vLLM soporta GGUF de forma experimental y con limitaciones; TGI no esta optimizado para GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque no se conocen ni la licencia, ni el contexto, ni los benchmarks de este modelo. A continuacion se listan alternativas de la misma categoria (modelos orientados a codigo en el rango 20-35 B) con datos de documentacion publica de cada proyecto, no procedentes de la informacion proporcionada en esta busqueda:

| Modelo | Parametros | Contexto | Licencia | Formato GGUF disponible |
|---|---|---|---|---|
| securecoder-30b-pro-v2-merged (i1-GGUF) | 30,5 B | no disponible | no disponible | Si |
| Qwen2.5-Coder-32B | ~32,8 B | 131.072 tokens | Apache-2.0 | Si |
| Codestral-22B | 22 B | 32.768 tokens | Licencia no comercial de Mistral AI (MNPL) | Si |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B totales / 2,4 B activos (MoE) | 128.000 tokens | Licencia DeepSeek (uso comercial permitido con condiciones) | Si |

La principal desventaja de este modelo frente a las alternativas es la ausencia total de documentacion sobre licencia y contexto, lo que dificulta su adopcion en produccion.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar que el uso comercial este permitido. Es un riesgo legal directo para cualquier despliegue en produccion.
- Model card practicamente vacia: no hay informacion sobre arquitectura, datos de entrenamiento, sesgos ni evaluaciones. Toda afirmacion sobre el comportamiento del modelo es especulativa.
- Solo se ha publicado la cuantizacion i1-Q2_K, la mas agresiva del catalogo. En modelos de 30B, los cuants de 2 bits suelen provocar degradacion notable de coherencia, repeticiones y errores factuales. Para uso serio conviene generar un Q4_K_M o superior con el fichero imatrix incluido.
- Idioma unico: solo ingles declarado. El rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Riesgo de alucinacion: no hay evaluaciones publicadas, y en tareas de codigo la generacion de APIs o funciones inexistentes es un fallo tipico de los modelos cuantizados a baja precision.
- Longitud de contexto desconocida: no se puede dimensionar la cache KV ni disenar sistemas RAG sin medirla empiricamente.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su funcionamiento ni reportado problemas.
- Fechas de metadatos anomalas: el repositorio figura creado en 2026, lo que sugiere un posible error en los datos de HuggingFace y aconseja verificar el estado real del repositorio antes de depender de el.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/securecoder-30b-pro-v2-merged-i1-GGUF
- Modelo base: https://huggingface.co/Taimwe/securecoder-30b-pro-v2-merged
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/securecoder-30b-pro-v2-merged-GGUF
- Pagina de descargas y vision general de mradermacher: https://hf.tst.eu/model#securecoder-30b-pro-v2-merged-i1-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (empresa que da soporte al cuantizador): https://www.nethype.de/
