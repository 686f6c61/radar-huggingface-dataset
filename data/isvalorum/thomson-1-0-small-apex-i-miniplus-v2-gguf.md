# IsValorum/Thomson-1.0-Small-APEX-I-MiniPlus-V2-GGUF

## Resumen

Thomson-1.0-Small APEX-I-MiniPlus-V2-GGUF es una cuantizacion personalizada, publicada por el usuario IsValorum, del modelo multimodal thomsonreuters/Thomson-1.0-Small. El modelo base es un Mixture of Experts (MoE) de unos 34.660.610.688 parametros (34,66 B) especializado por Thomson Reuters en analisis juridico, auditoria normativa, cumplimiento fiscal e inteligencia documental, con soporte de vision para documentos escaneados. Esta version no es un modelo nuevo: es una receta de cuantizacion tensor a tensor que comprime los pesos originales a un formato GGUF de 3,38 bits por peso (BPW), con un archivo principal de 14,63 GB (13,63 GiB) y un proyector de vision mmproj en Q8_0 de 610 MB.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un MoE de 35 B con arquitectura Qwen3_5Moe en equipos de consumo, gracias a que solo activa aproximadamente 3,2 B de parametros por token (8 expertos de 256 por capa). Por otro, el autor incluye explicitamente el proyector multimodal, algo que segun la propia model card se omite con frecuencia en cuantizaciones comunitarias, y calibra la compresion con matrices de importancia derivadas de corpus legal y financiero (510 entradas calibradas sobre 550 fragmentos densos de legislacion, auditorias y registros regulatorios).

Conviene tratar esta publicacion con cautela: la model card esta redactada en tono comercial, reconoce que la version V2.1 la sustituye, y no aporta resultados reproducibles de benchmarks. El repositorio tiene 63 descargas y 0 likes en el momento de la consulta, por lo que la validacion independiente es practicamente inexistente. Esta ficha se limita a los datos publicados y marca como no disponible todo lo que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal, clase Qwen3_5MoeForConditionalGeneration (40 capas, 256 micro-expertos por capa, dimension intermedia 512, 8 expertos activos por token) mas proyector de vision |
| Parametros totales | 34.660.610.688 (34,66 B), segun metadatos safetensors del modelo base |
| Parametros activos | Aproximadamente 3,2 B por token (dato declarado por el autor de la cuantizacion) |
| Longitud de contexto | 256K tokens (segun la model card); contexto nativo exacto del modelo base: no disponible |
| Tipos de cuantizacion | Receta propietaria APEX-I-MiniPlus-V2 de 3,38 BPW en el archivo principal; proyector mmproj en Q8_0. Planes anunciados para V2.1: expertos compartidos a Q5_K, atencion periodica a Q4_K (attn_q/k/v) y Q6_K (attn_output), escalas recurrentes en F32. No se publican variantes completas Q2/Q3/Q4/Q5/Q6/Q8 del conjunto |
| Idiomas soportados | en (solo ingles declarado) |
| Licencia | apache-2.0 (etiquetada en el repositorio; los terminos del modelo base de Thomson Reuters no se detallan y conviene verificarlos) |
| Formato de pesos | GGUF para llama.cpp; incluye proyector multimodal mmproj separado en GGUF |

Ficheros publicados:

| Fichero | Tamano | Formato | Funcion |
|---|---|---|---|
| Thomson-1.0-Small.APEX-I-MiniPlus-V2.gguf | 14,63 GB (13,63 GiB) | APEX-I personalizada (3,38 BPW) | Pesos principales |
| mmproj-thomsonreuters_Thomson-1.0-Small-Q8_0.gguf | 610 MB (582 MiB) | Q8_0 | Proyector de vision (necesario para OCR y analisis de documentos escaneados) |

Nota de consistencia: 34,66 B de parametros a 3,38 bits equivalen a unos 14,6 GB, coherente con el tamano del fichero principal declarado.

## Arquitectura y entrenamiento

La arquitectura del modelo base es un MoE de tipo Qwen3_5Moe con decodificacion autorregresiva, 40 capas, 256 expertos finos de dimension intermedia 512 y un enrutador que activa 8 expertos por token. Esto da una relacion de activacion muy baja (aproximadamente 3,2 B de 34,66 B), lo que explica el interes por cuantizarlo: el coste de computo por token se aproxima al de un modelo de 3 B, mientras que la capacidad total almacenada es de 35 B. El modelo incorpora un proyector de vision que lo convierte en image-text-to-text, segun el pipeline declarado en HuggingFace.

Sobre el entrenamiento no hay informacion en los datos proporcionados: no se detalla el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo unico verificable en esta publicacion es el proceso de cuantizacion: recetas manuales tensor a tensor, uso de imatrix con 510 entradas calibradas obtenidas de 550 fragmentos densos de derecho estatutario, auditorias financieras y expedientes regulatorios, y compresion selectiva por tipo de tensor que eleva los expertos compartidos y las proyecciones de atencion por encima de la media. El autor sostiene que las recetas comunitarias genericas comprimen los expertos nucleares a IQ2_S de 2 bits y dejan la cabeza de salida sin proteger en Q3_K_M, lo que en su opinion provoca picos de perplejidad y colapso del razonamiento; no aporta mediciones que respalden esa afirmacion.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta conversational del repositorio.
- Razonamiento especializado en dominio juridico, auditoria estatutaria, cumplimiento fiscal y analisis de documentacion compleja (es la especializacion declarada del modelo base).
- Procesamiento de imagen y texto (image-text-to-text): analisis de PDF escaneados, tablas y OCR, siempre que se cargue el proyector mmproj junto con el modelo principal.
- Capacidades multimodales habilitadas explicitamente en esta cuantizacion, a diferencia de otras publicaciones que omiten el proyector.
- Eficiencia de inferencia propia de un MoE con aproximadamente 3,2 B de parametros activos por token.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles (idioma unico declarado).
- Capacidades de audio: no disponibles.

## Casos de uso

- Revision de contratos corporativos: el modelo puede procesar documentos extensos (hasta 256K tokens declarados) para extraer clausulas, obligaciones y fechas, y el proyector de vision permite trabajar directamente sobre PDF escaneados sin una fase previa de OCR externa.
- Analisis de expedientes regulatorios: con la ventana de contexto larga y la especializacion declarada del modelo base, es adecuado para contrastar un documento nuevo contra normativa previamente cargada en contexto en lugar de depender de recuperacion externa.
- Auditoria de estados financieros: lectura de tablas e imagenes de balances junto con texto para detectar inconsistencias entre cifras y notas, aprovechando la entrada multimodal.
- Extraccion estructurada de documentos fiscales: digitalizacion de formularios y declaraciones escaneadas, con salida en formato estructurado para su carga en un ERP o en un sistema de gestion documental.
- Asistente interno de cumplimiento normativo: despliegue en una estacion de trabajo con 24 GB de VRAM para responder consultas de empleados citando la normativa cargada, sin enviar documentacion sensible a servicios en la nube.
- Procesamiento por lotes en portatil: gracias a que el fichero principal ocupa 13,63 GiB, es viable ejecutar clasificacion y resumen de documentos con offload parcial a RAM en equipos sin GPU dedicada de gran capacidad.
- Investigacion sobre cuantizacion de MoE: el repositorio documenta decisiones de compresion por tensor (imatrix, expertos compartidos, capas de atencion periodica), lo que lo convierte en material de estudio para quien investigue tecnicas de cuantizacion selectiva en modelos con enrutado disperso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones juridicas especificas para esta cuantizacion, y tampoco se aportan resultados del modelo base.

Los unicos datos cuantitativos de rendimiento presentes son afirmaciones del autor sobre velocidad de decodificacion, no verificadas de forma independiente:

| Metrica | Valor declarado | Alcance |
|---|---|---|
| Throughput en streaming con offload agresivo | 24 a 28+ tokens/s | Correspondiente al build V2.1 anunciado, con la mayor parte de los pesos en RAM DDR4 y VRAM minima |

Las comparaciones con cuantizaciones planas de 2 y 3 bits (IQ2_S, Q3_K_S, IQ3_S) que aparecen en la model card son cualitativas y sin cifras asociadas.

## Requisitos de hardware

Estimaciones derivadas de los tamanos de fichero publicados; el KV cache y el consumo real dependen del runtime y de la longitud de contexto efectiva, y no se detallan en la informacion disponible.

- VRAM minima para pesos completos en GPU: aproximadamente 14,2 GiB (13,63 GiB del modelo principal mas 0,57 GiB del proyector), sin contar KV cache.
- GPU de 24 GB (RTX 3090, RTX 4090, RTX A5000): la model card afirma que permite ejecutar el contexto completo de 256K completamente en VRAM.
- GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000): caben los pesos con margen limitado para contexto; el contexto maximo util no esta cuantificado en la informacion disponible.
- GPU de 12 GB o menos, e integradas: viables solo con offload parcial a RAM del sistema; el autor reporta entre 24 y 28+ tokens/s en ese escenario.
- Portatiles con DDR4/DDR5: la model card incluye una seccion de benchmarks en portatil, pero no se proporcionan los resultados numericos de esas pruebas.
- Consumer GPU: si, cabe en tarjetas de gama alta y en configuraciones de gama media mediante offload.
- Opciones de despliegue: llama.cpp y sus derivados (llama-server, Ollama, LM Studio, koboldcpp) al ser formato GGUF. Motores como vLLM o TGI no son la via natural para GGUF y requeririan convertir el modelo base a safetensors.
- Latencia: no disponible. Throughput: 24 a 28+ tokens/s declarados con offload agresivo (afirmacion del autor).
- Etiquetas adicionales del repositorio: endpoints_compatible, unsloth-studio, imatrix.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas directas, por lo que la comparacion se limita a lo declarado en la documentacion y a los tamanos de fichero publicados.

| Alternativa | Parametros | Contexto | Peso / formato | Licencia | Notas |
|---|---|---|---|---|---|
| Thomson-1.0-Small APEX-I-MiniPlus-V2 (esta ficha) | 34,66 B totales, ~3,2 B activos | 256K declarados | 13,63 GiB, APEX-I 3,38 BPW + mmproj Q8_0 | apache-2.0 | Incluye proyector de vision; V2.1 anunciada como sustituta |
| thomsonreuters/Thomson-1.0-Small (modelo base) | 34,66 B totales | no disponible | safetensors en BF16 (aproximadamente 69 GB, estimacion a 2 bytes por parametro) | no disponible en la informacion | Referencia de maxima calidad; requiere hardware muy superior |
| Cuantizaciones planas Q3_K_S / IQ3_S del mismo base | 34,66 B totales | no disponible | no disponible | apache-2.0 (segun el repositorio) | El autor afirma que rinden por debajo de esta receta; sin datos verificables |
| Recetas comunitarias APEX-I-Mini de 2 bits | 34,66 B totales | no disponible | no disponible | no disponible | El autor sostiene que comprimen expertos a IQ2_S y omiten el proyector de vision |

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningun analisis de sesgos en la informacion proporcionada.
- Riesgo de alucinacion: relevante en dominio juridico y fiscal, donde una cita o una cifra inventada puede tener consecuencias graves. No hay evaluaciones publicadas de fidelidad factual para esta cuantizacion.
- Perdida por cuantizacion: 3,38 BPW es una compresion agresiva. Aunque la receta es selectiva por tensor, no se aportan mediciones de perplejidad ni comparaciones numericas frente al modelo base en BF16.
- Idioma: unicamente ingles declarado. No hay soporte multilingue verificado, lo que limita su uso en documentacion en castellano sin evaluacion previa.
- Contexto: los 256K tokens son una cifra declarada en la model card, no verificada de forma independiente para esta cuantizacion concreta.
- Version obsoleta: la propia model card indica que la V2 aqui descrita queda sustituida por la V2.1, con mejoras en expertos compartidos (Q5_K), anclas de atencion (Q4_K y Q6_K) y escalas recurrentes en F32.
- Licencia: el repositorio se etiqueta como apache-2.0, pero los terminos aplicables al modelo base de Thomson Reuters no se detallan. Antes de un uso comercial conviene verificar la licencia del modelo original, ya que puede imponer restricciones adicionales.
- Validacion de la comunidad: 63 descargas y 0 likes. No hay evaluaciones de terceros, ni issues publicos, ni resultados reproducibles.
- Tono de la documentacion: la model card usa lenguaje promocional ("la especificacion definitiva", "elimina este defecto de forma permanente") y comparaciones sin datos. Las afirmaciones de superioridad frente a otras cuantizaciones deben tratarse como no verificadas.
- Uso profesional: no debe emplearse como sustituto de asesoramiento juridico o fiscal cualificado.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/IsValorum/Thomson-1.0-Small-APEX-I-MiniPlus-V2-GGUF
- Modelo base: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Catalogo del autor (donde se anuncia la V2.1): https://huggingface.co/IsValorum
- llama.cpp (runtime compatible con GGUF): https://github.com/ggml-org/llama.cpp
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo: devuelven unicamente paginas generales de CNN sin relacion con Thomson-1.0-Small, con la cuantizacion APEX-I ni con Thomson Reuters. No se han localizado papers, blogs ni demos adicionales.
