# aufklarer/Inkling-2-Mini-MLX-5bit

## Resumen

Inkling-2-Mini-MLX-5bit es una cuantizacion afín en formato MLX del modelo multimodal Inkling-2-Mini desarrollado por Thinking Machines. Se trata de un modelo de lenguaje y vision de arquitectura Mixture-of-Experts (MoE) con 26.388.641.280 parametros totales, exportado especificamente para su ejecucion nativa en Apple Silicon mediante el runtime Swift `speech-swift`. La cuantizacion emplea INT5 con tamano de grupo 64 para los pesos de los expertos, INT8 para las matrices de atencion y vocabulario, y precision original para vision, enrutamiento, normalizacion y controladores de bucle.

El modelo resuelve el problema de ejecutar un VLM MoE de gran tamano en hardware de consumo Apple sin depender de CUDA ni de infraestructura cloud. Con un peso total de aproximadamente 19,2 GB repartido en 40 shards, esta pensado para equipos con memoria unificada de 48 GB o superior, como el Apple M5 Pro empleado en las pruebas del autor. La licencia Apache 2.0 facilita su uso comercial y su integracion en productos.

Su relevancia actual radica en que demuestra un flujo completo de cuantizacion, validacion y despliegue nativo para un modelo MoE multimodal en el ecosistema MLX/Swift, con un corpus de aceptacion de 25 casos fijos que cubre texto, vision, codigo, SQL, JSON y cinco idiomas. No obstante, se trata de una exportacion de pesos de un modelo base externo, no de un modelo original, y su validacion se limita a los casos declarados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con bucle de capas; 24 capas de decoder que visitan 48 por token repitiendo tres veces las doce capas centrales |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas usaron un presupuesto total de 8.192 tokens) |
| Tipos de cuantizacion | INT5 (grupo 64) en expertos, INT8 en atencion y vocabulario, precision original en vision, routing, normalizacion, posiciones relativas y controladores de bucle |
| Idiomas soportados | no disponible (probados: aleman, espanol, frances, chino y japones en un caso cada uno) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX afín), 40 shards, ~19,2 GB |

## Arquitectura y entrenamiento

El modelo base es Inkling-2-Mini de Thinking Machines, del que esta ficha solo cubre la exportacion cuantizada. La arquitectura es un transformer MoE con una innovacion estructural: almacena 24 capas de decoder pero visita 48 capas por token, repitiendo tres veces las doce capas intermedias. El runtime Swift comparte los pesos entre visitas y mantiene un historial independiente de atencion y convolucion para cada visita, lo que reduce el coste de memoria a cambio de mas computo por token.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo RLHF, DPO u otras fases de alineamiento, ya que la model card del autor de la cuantizacion no los detalla. La innovacion tecnica documentada se limita al proceso de cuantizacion afín: INT5 con grupo 64 para expertos, INT8 para atencion y vocabulario, y preservacion de precision original en modulos sensibles (vision, routing, normalizacion, posiciones relativas y controladores de bucle). El autor reporta una deriva RMS normalizada del 1,30 % frente a Python MLX 0.32.4 y del 2,46 % frente a 0.31.1 en las puntuaciones top-20 en BF16, con coincidencia exacta en el token superior.

## Capacidades

- Generacion de texto conversacional multi-turno, con memoria de conversacion verificada en las pruebas.
- Razonamiento aritmetico basico (se valido `2 + 2` y comprension general).
- Comprension y reparacion de codigo, incluyendo lectura de fragmentos y correccion.
- Generacion de JSON y SQL; el SQL generado se ejecuto sobre un fixture en memoria aislado.
- Vision de imagenes estaticas: conteo de formas (circulos azules), posicion relativa de formas, lectura de texto impreso (`MEET AT 4 PM`) y graficos de barras etiquetados.
- Capacidades multilingues limitadas: un prompt en cada uno de aleman, espanol, frances, chino y japones en el corpus de aceptacion.
- Soporte de propuestas de accion locales: el runtime incluye un ejemplo de decision que emite `answer`, `summarize`, `describe_image` o `clarify` y valida el JSON resultante contra acciones permitidas.
- Procesamiento de documentos largos: se probo un prompt de 2.032 tokens.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso con agentes en la informacion disponible.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede gestionar conversaciones multi-turno con memoria de contexto, ejecutandose integramente en un Apple M5 Pro con 48 GB de memoria unificada mediante el runtime Swift, sin depender de servicios cloud.
- Descripcion y analisis de imagenes en aplicaciones nativas: con el pipeline `image-text-to-text`, se puede invocar `speech inkling "Describe this image." --image photo.png` para generar descripciones, contar objetos o leer texto impreso en capturas y fotografias.
- Extraccion de datos estructurados: la generacion validada de JSON permite usar el modelo para transformar texto libre en objetos JSON conformes a un esquema, con validacion posterior en el runtime.
- Generacion y comprobacion de SQL: el modelo produce consultas SQL que el autor verifico ejecutandolas contra un fixture en memoria, lo que lo hace util para asistentes de analitica que traduzcan lenguaje natural a consultas.
- Revision y reparacion de codigo en editores locales: las pruebas cubren lectura y reparacion de fragmentos, lo que permite integrarlo en flujos de asistencia de codigo en IDE sobre Apple Silicon.
- Clasificacion y enrutamiento de intenciones: el ejemplo de propuestas de accion locales (`answer`, `summarize`, `describe_image`, `clarify`) sirve como base para agentes de decision que validan la salida JSON antes de actuar.
- Procesamiento de documentos de hasta unos 2.000 tokens: util para resumenes y preguntas sobre informes, articulos o contratos de longitud moderada en un equipo de sobremesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta unicamente un corpus de aceptacion propio de 25 casos fijos (20 prompts de texto, 4 imagenes sinteticas y 1 documento largo) superado al 100 % a traves del runtime Swift, con temperatura 0, top-k 0, top-p 1, penalizacion de repeticion 1, limite de 512 tokens de generacion y presupuesto total de 8.192 tokens. Estas cifras no constituyen un benchmark estandar ni una garantia de inteligibilidad general.

| Prueba | Resultado |
|---|---|
| Casos de aceptacion fijos | 25/25 superados |
| Deriva RMS normalizada vs Python MLX 0.32.4 | 1,30 % |
| Deriva RMS normalizada vs Python MLX 0.31.1 | 2,46 % |
| Deriva absoluta maxima vs 0.32.4 | 0,704590 |
| Deriva absoluta maxima vs 0.31.1 | 0,870966 |
| Coincidencia de token superior | Exacta en ambas referencias |
| Pruebas de exportador CPU | 20 superadas |
| Conversiones reales de muestras fuente | 4 superadas |
| Pruebas de configuracion/CLI | 9 superadas |

## Requisitos de hardware

- Memoria: el bundle pesa aproximadamente 19,2 GB en disco (19.198.967.808 bytes) y requiere memoria unificada suficiente para cargar los pesos mas el estado de inferencia; el autor lo probo en un Apple M5 Pro con 48 GB de memoria unificada.
- Hardware validado: Apple M5 Pro, 48 GB de memoria unificada, macOS 27.2.
- GPU: al ser un formato MLX, esta disenado para Apple Silicon (series M). No se documenta soporte para GPU NVIDIA, AMD ni CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada de 48 GB o superior; no se especifican otros modelos de Mac probados.
- Despliegue: runtime nativo Swift `speech-swift` (commit `15eda930df3d6cad07a0cd25e8d22dfdd9a040c3`), con build via `make build` que incluye el paso de metallib de MLX. La generacion en Python con el paquete MLX-VLM sin modificar no fue validada para esta version.
- Latencia y throughput: no disponibles. El autor advierte que los tiempos registrados incluyen razonamiento oculto y no constituyen una comparacion de velocidad controlada frente a la variante INT4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-5bit (esta ficha) | 26.388.641.280 | no disponible | apache-2.0 | MLX safetensors INT5/INT8 | Validado en Swift en M5 Pro 48 GB; 25/25 casos de aceptacion |
| Inkling-2-Mini-MLX-4bit | no disponible | no disponible | apache-2.0 (presumible, mismo autor) | MLX safetensors INT4 | Mismo runtime; supero los mismos 25 casos de aceptacion; bundle mas pequeno |
| thinkingmachines/Inkling-2-Mini (base) | no disponible (origen de los 26,4 mil millones) | no disponible | no disponible en esta ficha | pesos originales (ModelOpt) | Checkpoint fuente, revision `ed40e7da`; no cargable por la ruta ModelOpt en este export |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de la misma categoria.

## Limitaciones y advertencias

- La validacion se limita a 25 casos fijos seleccionados por el autor; no es un benchmark estandar ni garantiza inteligibilidad general.
- La paridad multilingue no esta demostrada: solo se probo un prompt por idioma en cinco idiomas.
- El autor advierte que los tiempos medidos incluyen razonamiento oculto y no son una comparacion de velocidad controlada frente a INT4.
- La generacion en Python con MLX-VLM sin modificar no fue validada; el unico runtime soportado y probado es Swift (`speech-swift`).
- La ruta de carga upstream basada en ModelOpt no interpreta estos pesos; es una exportacion afín MLX con nombres de tensor segun el layout de MLX-VLM.
- Los pesos BF16 top-20 no son bit-exactos entre las rutas Python y Swift; existe una deriva medible (hasta 2,46 % RMS normalizada) que puede afectar a casos sensibles.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de tasas de alucinacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Longitud de contexto maxima no documentada; las pruebas usaron un presupuesto de 8.192 tokens, lo que no implica que sea el limite real del modelo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base `thinkingmachines/Inkling-2-Mini`, no detallada en esta ficha.
- Dependencia de una revision concreta del codigo (`15eda930df3d6cad07a0cd25e8d22dfdd9a040c3`) y de macOS 27.2; cambios en el runtime o en MLX pueden alterar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-5bit
- Variante INT4: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revision del modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/ed40e7da625f594fc9c4990f5f66be24873c22d7
- Runtime Swift: https://github.com/soniqo/speech-swift
- Commit del runtime validado: https://github.com/soniqo/speech-swift/commit/15eda930df3d6cad07a0cd25e8d22dfdd9a040c3
- Ejemplo de decisiones locales: https://github.com/soniqo/speech-swift/blob/15eda930df3d6cad07a0cd25e8d22dfdd9a040c3/docs/inference/inkling2-mini-decisions.md
- Ejemplos de arquitectura e imagen: https://github.com/soniqo/speech-swift/blob/15eda930df3d6cad07a0cd25e8d22dfdd9a040c3/docs/models/inkling2-mini.md
- Resultados de calidad: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-5bit/blob/main/validation/quality-results.json
- Revision semantica y comprobacion SQL: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-5bit/blob/main/validation/quality-review.json
- Informe de calidad: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-5bit/blob/main/validation/quality-report.md
- Fixtures de validacion: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-5bit/tree/main/validation
