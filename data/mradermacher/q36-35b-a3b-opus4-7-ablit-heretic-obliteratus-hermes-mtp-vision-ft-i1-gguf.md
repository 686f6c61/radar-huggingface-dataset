# mradermacher/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-i1-GGUF

## Resumen

Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-i1-GGUF es la distribucion en formato GGUF, con cuantizacion de tipo imatrix/weighted, del modelo de la familia Qwen 3.6 (identificador interno `qwen3_5_moe`) publicado por el usuario oktaydu. Se trata de un modelo de mezcla de expertos (MoE) de 35.505.251.456 parametros totales y aproximadamente 3.000 millones de parametros activos por token (el sufijo A3B asi lo indica), afinado sobre trazas de razonamiento y function calling de Hermes y con capacidades de vision-lenguaje. El autor de la cuantizacion es mradermacher, especialista habitual en publicar versiones GGUF de modelos abiertos.

El modelo combina varias modificaciones sobre la base Qwen: un proceso de "abliteration" y "heretic/obliteratus" orientado a eliminar los mecanismos de rechazo del modelo, un afinado con los datasets `NousResearch/hermes-function-calling-v1` y `lambda/hermes-agent-reasoning-traces`, soporte de prediccion multi-token (MTP/NextN) para decodificacion especulativa y una torre de vision para entrada multimodal. El resultado es un modelo orientado a agentes, uso de herramientas y codificacion agentica, con la advertencia explicita de que no esta pensado para todo tipo de publicos.

La relevancia practica de esta ficha esta en que ofrece un empaquetado GGUF listo para `llama.cpp` y derivados, con un rango de cuantizaciones que va de 13,3 GB (i1-Q2_K) a 29,3 GB (i1-Q6_K), lo que permite desplegar un MoE de 35B en hardware de consumo de gama alta. La licencia declarada es Apache 2.0, aunque las modificaciones de abliteration introducen consideraciones de uso que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Qwen 3.6 (`qwen3_5_moe`), con torre de vision y cabecera MTP/NextN |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | Aproximadamente 3B (segun el sufijo A3B del nombre; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, ademas de fichero imatrix |
| Idiomas soportados | en (unico idioma declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors y bfloat16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con enrutamiento disperso, identificado en los metadatos como `qwen3_5_moe`, lo que lo situa en la estirpe Qwen 3.5/3.6. El modelo incorpora tres elementos adicionales sobre la base: una torre de vision para entrada de imagenes (el repositorio se describe como `vision-language` y los ficheros `mmproj` se alojan en el repositorio estatico), una cabecera de prediccion multi-token (MTP, tambien etiquetada `nextn`) que permite decodificacion especulativa con el propio modelo como borrador, y un proceso de modificacion de pesos etiquetado como `abliterated`, `heretic` y `obliteratus`, orientado a suprimir las direcciones de rechazo en el espacio de activaciones.

El afinamiento se realizo sobre dos conjuntos de datos declarados: `NousResearch/hermes-function-calling-v1`, centrado en llamadas a funciones y uso de herramientas, y `lambda/hermes-agent-reasoning-traces`, con trazas de razonamiento de agentes. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla la configuracion de la torre de vision ni las dimensiones del contexto nativo.

## Capacidades

- Generacion de texto conversacional multi-turno, con etiqueta `conversational` en los metadatos.
- Razonamiento explicito: el modelo declara `reasoning` y `thinking` a traves de las trazas de Hermes; el modo de pensamiento debe activarse segun la plantilla de chat del modelo base.
- Function calling y tool use: afinado especificamente sobre `hermes-function-calling-v1`, con soporte de llamadas a funciones estructuradas.
- Uso agentico y razonamiento multi-paso: entrenado con trazas de agentes, orientado a bucles de planificacion, ejecucion y observacion.
- Codificacion agentica: etiquetas `coding` y `agentic-coding`, pensado para tareas de edicion de codigo con herramientas.
- Vision-lenguaje: acepta imagenes como entrada a traves de la torre multimodal; los ficheros `mmproj` necesarios estan en el repositorio estatico del autor.
- Decodificacion especulativa nativa mediante cabecera MTP/NextN, que puede acelerar la generacion sin un modelo borrador externo.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- Modo sin rechazo: las modificaciones de abliteration reducen las negativas del modelo a peticiones consideradas sensibles.

## Casos de uso

- Agentes de codificacion en local: el modelo puede integrarse en un bucle de agente que lea repositorios, ejecute herramientas de edicion y valide cambios, aprovechando el entrenamiento en trazas agenticas y el function calling de Hermes. La cuantizacion i1-Q4_K_M (21,8 GB) es un punto de partida razonable para estaciones de trabajo con 24 GB de VRAM.
- Automatizacion de pipelines de CI/CD con llamadas a herramientas: el soporte de function calling permite al modelo invocar comandos de build, consultar estado de tests y proponer parches dentro de un runner, con la ventaja de que el MoE activa solo unos 3B de parametros por token y reduce el coste de inferencia frente a un denso de 35B.
- Asistente de razonamiento sobre documentos e imagenes: la combinacion de contexto conversacional y torre de vision permite extraer datos de capturas, diagramas o tablas escaneadas y razonar sobre ellos en una misma conversacion.
- Procesamiento por lotes en una sola GPU de consumo: con la cuantizacion i1-IQ3_S (15,7 GB) o i1-Q4_K_S (20,5 GB) el modelo cabe en tarjetas de 16-24 GB, lo que habilita tareas de clasificacion, resumen y extraccion de entidades a gran escala sin infraestructura de datacenter.
- Investigacion sobre alineacion y rechazo: al ser un modelo abliterated, sirve como objeto de estudio para medir como la supresion de direcciones de rechazo afecta a la utilidad, la calibracion y la tasa de respuestas daninas, comparandolo con la base sin modificar.
- Despliegue de un asistente tecnico sin filtros editoriales: para entornos internos donde se requiere que el modelo no rechace consultas tecnicas legitimas (por ejemplo, analisis de seguridad ofensiva autorizado o explicacion de tecnicas de explotacion en un CTF), con la salvedad de que la ausencia de rechazo exige controles externos.
- Evaluacion de decodificacion especulativa: la cabecera MTP permite medir ganancias de throughput en `llama.cpp` frente a la decodificacion autoregresiva estandar, util para comparar estrategias de aceleracion en MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y no se dispone de evaluaciones del modelo base en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: i1-Q2_K 13,3 GB; i1-IQ3_S 15,7 GB; i1-Q3_K_M 17,3 GB; i1-IQ4_XS 19,3 GB; i1-Q4_K_S 20,5 GB; i1-Q4_K_M 21,8 GB; i1-Q5_K_M 25,4 GB; i1-Q6_K 29,3 GB. A estas cifras hay que sumar el consumo del contexto KV y, en su caso, el proyector multimodal `mmproj`.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones hasta i1-Q4_K_M con contexto moderado; RTX 3090 (24 GB) en el mismo rango; A100 40/80 GB y H100 para cuantizaciones altas o contextos largos; configuraciones multi-GPU para i1-Q6_K con contexto extendido.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB con cuantizaciones IQ3 y en tarjetas de 24 GB con Q4; en 12 GB solo con Q2_K y contexto muy reducido, con perdida de calidad apreciable.
- Opciones de despliegue: `llama.cpp` y sus derivados (`llama-server`, Ollama, LM Studio, koboldcpp) para el formato GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de soporte para la arquitectura `qwen3_5_moe`. Para vision es necesario cargar el `mmproj` del repositorio estatico.
- Latencia y throughput: no disponibles. Al ser un MoE con aproximadamente 3B de parametros activos, el throughput por token deberia ser sustancialmente mayor que el de un modelo denso de 35B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT (este) | 35,5B | ~3B | no disponible | Apache 2.0 | GGUF, safetensors | Vision, MTP, abliterated, afinado Hermes |
| Qwen3-30B-A3B (referencia de familia) | 30,5B | ~3B | 32.768 tokens (extensible) | Apache 2.0 | safetensors, GGUF | MoE sin vision, sin abliteration |
| Mixtral 8x7B | 46,7B | ~12,9B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | MoE denso en activaciones, sin vision |
| Llama 3.1 8B Instruct | 8B | 8B (denso) | 131.072 tokens | Llama 3.1 Community | safetensors, GGUF | Denso, mucho menor coste, sin vision |

La comparacion con Qwen3-30B-A3B es la mas directa por arquitectura y numero de parametros activos, aunque este modelo anade vision, MTP y las modificaciones de alineacion. Frente a Mixtral 8x7B, el coste por token es notablemente inferior al activar menos parametros. Frente a un denso de 8B como Llama 3.1, la ventaja esta en la capacidad bruta y el soporte multimodal, a cambio de un mayor requisito de memoria. No se dispone de datos de rendimiento comparativo para cuantificar estas diferencias.

## Limitaciones y advertencias

- Modelo abliterated: la supresion de direcciones de rechazo implica que el modelo puede producir contenido danino, ilegal o inseguro sin negarse. La etiqueta `not-for-all-audiences` confirma que el autor lo desaconseja para publicos generales. Requiere filtros y supervision externos en cualquier despliegue.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de calibracion; al estar afinado sobre trazas de razonamiento sinteticas, puede generar cadenas de pensamiento plausibles pero incorrectas.
- Idioma: solo se declara ingles. El rendimiento en castellano no esta evaluado y probablemente sea inferior, especialmente en function calling y razonamiento estructurado.
- Contexto: la longitud de contexto no esta documentada en la informacion disponible; no debe asumirse un valor concreto sin verificarlo en la configuracion del modelo base.
- Licencia: se declara Apache 2.0, pero las modificaciones de pesos derivan de un modelo base de terceros y de datasets con sus propias condiciones; conviene revisar la licencia del modelo base `oktaydu/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT` antes de uso comercial.
- Cuantizaciones bajas: i1-Q2_K e i1-Q3_K_S degradan la calidad de forma notable en tareas de razonamiento y codigo; para produccion se recomienda i1-Q4_K_M o superior.
- Vision: los ficheros `mmproj` no estan en este repositorio sino en el estatico; un despliegue que los omita perdera la capacidad multimodal.
- Trazabilidad limitada: el nombre del modelo acumula multiples modificaciones encadenadas y no se documenta la receta exacta de abliteration ni el volumen de datos de cada fase de afinamiento.
- Soporte de herramientas: la integracion en `llama.cpp` para function calling depende de la plantilla de chat incluida; es necesario verificar que la version del runtime la interpreta correctamente.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye `mmproj`): https://huggingface.co/mradermacher/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-GGUF
- Modelo base: https://huggingface.co/oktaydu/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT
- Pagina de descargas del autor: https://hf.tst.eu/model#Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-i1-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset de trazas de agentes: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
