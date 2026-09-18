# akumaburn/Swift-Qwen3.8-27b-heretic-W8A8-DFlash2

## Resumen

Swift-Qwen3.8-27b-heretic-W8A8-DFlash2 es una cuantizacion INT8 W8A8 del modelo akumaburn/Swift-Qwen3.8-27b-heretic, publicada por el usuario akumaburn. Se trata de un artefacto de investigacion derivado de la familia Qwen3.8 de 27B (27.360.627.952 parametros en safetensors) en el que el alineamiento de seguridad ha sido eliminado deliberadamente (tags heretic, abliterated, uncensored) y que se distribuye con la etiqueta research-only. El pipeline declarado es image-text-to-text, por lo que el modelo conserva torre de vision y capacidades multimodales.

La innovacion tecnica principal es que esta cuantizacion se construye **sin la rotacion QuaRot**, a diferencia de su variante hermana SmoothQuant+QuaRot. El motivo es concreto: el borrador especulativo DFlash2 (incoai/Qwen3.8-27B-DFlash2) fue entrenado sobre estados ocultos *no rotados* del modelo objetivo, de modo que frente a un checkpoint rotado rechaza todas las propuestas (longitud de aceptacion medida exactamente 1,00). Al eliminar la rotacion se recupera el drafting especulativo (4,14 en codigo, 3,11 en prosa) a cambio de multiplicar por 2,9 el error de cuantizacion en numeros reales de serving (KL servido 0,0337 frente a 0,0117).

Es relevante ahora porque documenta con mediciones reproducibles un compromiso poco habitual: fidelidad de cuantizacion frente a viabilidad de decodificacion especulativa. Incluye tablas de rendimiento medidas con `vllm bench serve` sobre una CMP 170HX de 64 GB (TP=1, KV en fp8_e4m3) que muestran hasta 2,8x de mejora en decodificacion con DFlash2 k=7 en concurrencia 1, y una perdida severa de throughput cuando la especulacion se mantiene activa con la GPU saturada (c>=16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de la familia Qwen3.8 con modulos de atencion lineal GatedDeltaNet (se citan las puertas recurrentes `in_proj_a`/`in_proj_b`), torre de vision y cabeza MTP (multi-token prediction); detalles completos de capas y configuracion no disponibles |
| Parametros totales | 27.360.627.952 (27,36 B), dato real de safetensors |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 W8A8: pesos INT8 per-channel simetricos con GPTQ learned rounding; activaciones INT8 per-token dinamicas; sin rotacion y sin SmoothQuant. Existen variantes del mismo autor en BF16, W4A16 y W8A8 con QuaRot/SmoothQuant |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (la model card incluye ademas la etiqueta research-only y una clausula de exencion de responsabilidad; ver limitaciones) |
| Formato de pesos | safetensors en formato compressed-tensors (`int-quantized`), pensado para la ruta CUTLASS INT8 nativa de vLLM |

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento del modelo base, solo la receta de cuantizacion. Lo que si se detalla con precision es que modulos quedan sin cuantizar: `lm_head`, `embed_tokens`, la torre de vision, las puertas recurrentes GatedDeltaNet `in_proj_a`/`in_proj_b`, la cabeza MTP y todas las normas. El resto de los pesos lineales se cuantiza a INT8 con GPTQ per-channel simetrico y redondeo aprendido, mientras que las activaciones se cuantizan dinamicamente por token a INT8. El checkpoint ocupa 30 GB (31,3 GB de repositorio) y esta disenado para servirse con vLLM.

El elemento diferenciador es la decision de no aplicar la rotacion QuaRot ni SmoothQuant. La rotacion existe para domesticar los valores atipicos de activacion antes de una cuantizacion INT8 de activaciones, y en la metrica de serving vale un factor 2,9 (KL 0,0117 con rotacion frente a 0,0337 sin ella, sobre WikiText-2, top-512, 12.264 posiciones de token, bajo numeros reales de vLLM). Sin embargo, invalida por completo el borrador DFlash2: la capa `fc` del drafter se entreno sobre estados ocultos no rotados y contra un checkpoint rotado la aceptacion cae a 1,00. La variante aqui descrita asume conscientemente ese coste de fidelidad para habilitar decodificacion especulativa con aceptacion de 4,138 en tareas de codigo y 3,110 en prosa.

Un hallazgo secundario documentado es que la aceptacion depende del dominio del prompt, no del checkpoint ni de la abliteracion: el codigo estructurado se redacta mucho mejor que la prosa abierta corta (un 32 % menos de tokens aceptados por borrador). Un control con prosa benigna obtiene 3,267 frente a 3,206 de prosa abliterada, una diferencia de -2,7 % con IC del 95 % de +-0,16, es decir, no significativa.

## Capacidades

- Generacion de texto conversacional multi-turno, con el pipeline declarado como image-text-to-text.
- Vision: la torre de vision queda explicitamente fuera de la cuantizacion, por lo que se preservan las capacidades de imagen (image-text-to-text).
- Razonamiento y codigo: la aceptacion especulativa medida sobre tareas de codigo (4,138) sugiere buen comportamiento en dominios estructurados, aunque no se publican benchmarks academicos de codigo.
- Decodificacion especulativa con DFlash2: compatible con el drafter incoai/Qwen3.8-27B-DFlash2, con hasta 2,8x de decodificacion a concurrencia 1.
- Cabeza MTP (multi-token prediction) conservada sin cuantizar, que habilita una segunda via de especulacion segun la tabla de variantes del autor.
- Salida estructurada y uso como base para ajuste o re-cuantizacion (el autor ofrece BF16, W4A16 y W8A8+QuaRot).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de seguridad y red-teaming: el modelo tiene el alineamiento eliminado de forma deliberada y sin moderacion de contenido, lo que lo convierte en un banco de pruebas controlado para medir la eficacia de clasificadores de entrada/salida y de capas de guardarrailes, siempre en un entorno aislado y con supervision.
- Investigacion sobre decodificacion especulativa: la model card aporta un caso de estudio medido sobre como la base numerica de un checkpoint (rotada o no) determina la viabilidad de un drafter; util para disenar y depurar tecnicas de speculative decoding sobre modelos cuantizados.
- Investigacion en cuantizacion: las metricas de KL servido y KL de primer token permiten comparar estrategias (GPTQ plano frente a QuaRot/SmoothQuant, INT8 frente a W4A16) sobre la misma arquitectura y el mismo hardware.
- Serving de alto throughput con baja concurrencia: con DFlash2 k=7 y c=1 el modelo alcanza 110,7 tok/s de decodificacion frente a 39,9 sin especulacion, por lo que encaja en asistentes interactivos individuales o en generacion por lotes con pocos usuarios simultaneos.
- Generacion offline por lotes con GPU saturada: con c=32 y especulacion desactivada alcanza 18.942 tok/s de prefill y 500,2 tok/s de decodificacion, adecuado para pipelines de sintesis de datos a gran escala donde no se necesita latencia interactiva.
- Analisis de documentos e imagenes: al conservar la torre de vision sin cuantizar, puede emplearse en tareas de image-text-to-text como extraccion de informacion de capturas, formularios o diagramas dentro de un pipeline de investigacion.
- Distilacion y generacion de datos de entrenamiento: la cabeza MTP intacta y el checkpoint INT8 de 30 GB lo hacen util como generador de anotaciones sinteticas en proyectos de investigacion que necesiten volumen y bajo coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. Los unicos datos de rendimiento son mediciones de serving y de aceptacion especulativa realizadas por el autor.

Rendimiento de serving: `vllm bench serve`, una CMP 170HX de 64 GB, TP=1, KV en fp8_e4m3, planificacion asincrona, entradas aleatorias de 1.024 tokens. Las cifras de prefill corresponden a `c x input_len / TTFT medio` (tasa instantanea durante el prefill, no throughput de entrada extremo a extremo).

| Concurrencia (c) | Prefill sin especulacion (tok/s) | Prefill con DFlash2 k=7 (tok/s) | Decode sin especulacion (tok/s) | Decode con DFlash2 k=7 (tok/s) |
|---|---|---|---|---|
| 1 | 3.695 | 2.878 | 39,9 | 110,7 |
| 8 | 9.072 | 7.755 | 233,3 | 379,1 |
| 16 | 13.820 | 5.400 | 363,8 | 369,5 |
| 32 | 18.942 | 2.768 | 500,2 | 396,9 |

Barrido completo de DFlash2 a k=7 con entradas de 1.024 tokens: prefill 2.878 / 4.134 / 6.209 / 7.755 / 5.400 / 2.768 y decode 110,7 / 159,8 / 232,7 / 379,1 / 369,5 / 396,9 para c = 1 / 2 / 4 / 8 / 16 / 32. La longitud de aceptacion se mantiene en la banda 3,3-4,2 durante todo el barrido.

Aceptacion especulativa (greedy, temperatura 0, k=7, concurrencia 1, 48 prompts por conjunto, mismo arnes para ambos checkpoints):

| Conjunto de prompts | Caracteres medios | Esta build (W8A8 sin rotacion) | W4A16 |
|---|---|---|---|
| Tareas de codigo (`harmless48`) | 358 | 4,138 | 4,354 |
| Prosa de contenido abliterado (`harmful_behaviors`) | 73 | 3,110 | 3,206 |

Metricas de fidelidad de la cuantizacion (KL servido = `KL(source || build)` bajo vLLM sobre WikiText-2, top-512, 12.264 posiciones; KL de primer token = vocabulario completo en el primer token generado sobre 100 prompts de instruccion inofensivos, bajo `transformers`):

| Build | Tamano | KL servido | KL de primer token | DFlash2 | Uso recomendado segun el autor |
|---|---|---|---|---|---|
| Fuente BF16 | 52 GB | no disponible | no disponible | no aplica | investigacion, re-cuantizacion |
| W8A8 + QuaRot/SmoothQuant | 30 GB | 0,0117 | 0,0244 | No (1,00) | maxima fidelidad; especulacion por MTP |
| Esta build (W8A8 sin rotacion) | 30 GB | 0,0337 | 0,0417 | Si (4,14) | proposito general con DFlash2 |
| W4A16 sin rotacion | 19 GB | 0,0354 | 0,1146 | Si (4,35) | minimo consumo de VRAM, decodificacion de un solo usuario |

## Requisitos de hardware

- VRAM de pesos: aproximadamente 30 GB para el checkpoint INT8 (31,3 GB de repositorio). Estimacion derivada del tamano de pesos; el autor no publica una tabla de VRAM.
- Configuracion medida por el autor: una unica CMP 170HX de 64 GB, TP=1, cache KV en fp8_e4m3, planificacion asincrona. No se documentan otras GPUs.
- GPU recomendadas (derivadas del tamano de pesos, no verificadas por el autor): H100 80 GB, A100 80 GB, L40S 48 GB o similares con soporte de rutas INT8 CUTLASS. Una A100 de 40 GB queda muy justa una vez anadida la cache KV.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, 3090) con este formato de pesos; para ese perfil el propio autor ofrece la variante W4A16 de 19 GB, que si resulta viable en 24 GB.
- Opciones de despliegue: vLLM es la libreria declarada y el backend con el que se miden todas las cifras (formato compressed-tensors `int-quantized`, ruta INT8 CUTLASS). No se mencionan llama.cpp, Ollama ni TGI. El soporte de decodificacion especulativa requiere ademas el drafter incoai/Qwen3.8-27B-DFlash2.
- Latencia y throughput medidos: 110,7 tok/s de decodificacion con DFlash2 k=7 a c=1 (frente a 39,9 sin especulacion) y 500,2 tok/s de decodificacion sin especulacion a c=32; prefill de hasta 18.942 tok/s sin especulacion a c=32.
- Regla practica indicada por el autor: usar DFlash2 para c <= 8 y desactivarlo para c >= 16. A c=32 la especulacion reduce el prefill de 18.942 a 2.768 tok/s, porque los borradores rechazados consumen computo sobre una GPU ya saturada.

## Comparativa con modelos similares

La comparativa natural es con las otras builds del mismo autor sobre el mismo modelo base, ya que la model card las tabula de forma directa. No se dispone de comparaciones con modelos de terceros del mismo tamano y categoria.

| Modelo | Parametros | Tamano | Contexto | KL servido | DFlash2 | Licencia |
|---|---|---|---|---|---|---|
| Esta build (W8A8 sin rotacion) | 27,36 B | 30 GB | no disponible | 0,0337 | Si (4,14) | apache-2.0 / research-only |
| W8A8 + QuaRot/SmoothQuant | 27,36 B (mismo base) | 30 GB | no disponible | 0,0117 | No (1,00) | apache-2.0 / research-only |
| W4A16 sin rotacion | 27,36 B (mismo base) | 19 GB | no disponible | 0,0354 | Si (4,35) | apache-2.0 / research-only |
| BF16 fuente | 27,36 B (mismo base) | 52 GB | no disponible | no disponible | no aplica | apache-2.0 / research-only |

Comparativa con modelos de otras familias (Qwen, Llama, Mistral y similares de ~27B): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El alineamiento de seguridad ha sido eliminado de forma deliberada. El modelo intentara cumplir peticiones daninas, peligrosas, ilegales o poco eticas que el modelo base rechaza, sin moderacion de contenido. La model card lo declara explicitamente como artefacto de investigacion y solo para investigacion.
- Riesgo elevado de uso indebido: no debe desplegarse en aplicaciones de cara al publico sin capas externas de moderacion, y su uso en produccion comercial es, como minimo, discutible desde el punto de vista reputacional y de cumplimiento normativo.
- Conflicto entre licencias: el campo de licencia es apache-2.0, pero el autor anade la etiqueta research-only, un aviso de cautela y una clausula de exencion de garantia y responsabilidad. Conviene revisar esa clausula antes de cualquier uso comercial.
- Alucinacion: no se publican evaluaciones de veracidad ni tasas de alucinacion. La eliminacion del alineamiento puede aumentar la propension a generar contenido no verificado con tono asertivo.
- Idiomas soportados: no disponible. No hay lista declarada de idiomas ni evaluaciones multilingues, por lo que el comportamiento fuera del ingles es incierto.
- Longitud de contexto: no disponible, a pesar de que el modelo base pertenece a una familia con ventanas largas. No se debe asumir un valor concreto sin verificar la configuracion del modelo base.
- Degradacion numerica de la cuantizacion: el KL servido de 0,0337 es 2,9 veces peor que el de la variante rotada (0,0117). La penalizacion se concentra en puntos de decision de alta entropia (el KL de primer token de la variante de 4 bits es 2,7 veces peor que el de esta build), asi que no se puede inferir la calidad global a partir de un unico numero.
- Interaccion entre especulacion y concurrencia: mantener DFlash2 activo con c >= 16 hunde el prefill (de 18.942 a 2.768 tok/s a c=32). Es un sobrescoste de especulacion sobre una GPU saturada, no un defecto de la cuantizacion, pero afecta directamente al dimensionamiento de produccion.
- Aceptacion dependiente del dominio: con prompts de prosa corta, la aceptacion baja a ~3,1-3,3, con una merma de aproximadamente el 32 % de tokens aceptados por borrador frente a tareas de codigo. Los beneficios de throughput no son uniformes entre cargas de trabajo.
- Cifras de rendimiento obtenidas en una unica CMP 170HX de 64 GB. No hay datos de latencia en otras GPUs ni comparaciones entre backends.
- Adopcion practica: 0 descargas y 1 like en el momento de la consulta, creado el 18 de septiembre de 2026 y actualizado ese mismo dia. No hay historial de uso ni validacion por parte de terceros.

## Enlaces

- Pagina del modelo: https://huggingface.co/akumaburn/Swift-Qwen3.8-27b-heretic-W8A8-DFlash2
- Modelo base: https://huggingface.co/akumaburn/Swift-Qwen3.8-27b-heretic
- Variante W8A8 con QuaRot/SmoothQuant: https://huggingface.co/akumaburn/Swift-Qwen3.8-27b-heretic-SmoothQuant-W8A8-INT8
- Variante W4A16 sin rotacion: https://huggingface.co/akumaburn/Swift-Qwen3.8-27b-heretic-W4A16
- Drafter especulativo DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo (los resultados devueltos corresponden a un portal fiscal sin relacion con el contenido).
