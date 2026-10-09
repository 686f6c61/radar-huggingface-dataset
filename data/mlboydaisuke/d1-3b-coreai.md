# mlboydaisuke/d1-3B-CoreAI

## Resumen

d1-3B-CoreAI es un port a Core AI de LiquidAI/d1-3B, un "decision model" multimodal de aproximadamente 3.000 millones de parametros que no genera texto: recibe un estado (texto, un valor JSON, imagenes o una mezcla) y un conjunto de preguntas con nombre, y devuelve una probabilidad calibrada para cada opcion de cada pregunta en un unico forward pass, con cero tokens de salida. Lo publica el usuario mlboydaisuke y deriva, via post-entrenamiento de Liquid AI, del modelo base LiquidAI/LFM2.5-VL-3B.

La relevancia de esta ficha esta en el formato de despliegue: Core AI es el runtime de ML on-device de Apple en iOS 27 y macOS 27, sucesor de Core ML, que exporta modelos de PyTorch a bundles `.aimodel` ejecutables en GPU o Neural Engine. El port separa el decoder de texto (un grafo que acepta 64 ids de token por llamada y devuelve el hidden state tras la normalizacion final, sin cabeza de vocabulario) del vision tower, y el host resuelve la lectura de logits contra una tabla de embeddings ligados de 2.134 filas que se distribuye junto al grafo.

El repositorio ocupa 10,2 GB e incluye dos decoders con el mismo contrato: uno fp16 de 5,56 GB para Mac y otro con las lineales del MLP en int8 por bloques de 32, de 3,70 GB, para iPhone. Es un modelo de nicho, con 7 descargas y 1 like en el momento de la consulta, y su valor esta en la paridad de probabilidades con el codigo fp32 del proveedor y en la latencia medida en dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder hibrido LFM2 (30 capas: 22 de convolucion corta y 8 de atencion con query agrupada, hidden size 2.048) mas encoder de vision SigLIP2 (27 capas, anchura 1.152) |
| Parametros totales | Aproximadamente 3.000 millones (segun la denominacion d1-3B del modelo base); cifra exacta no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el grafo de Core AI procesa 64 ids de token por llamada) |
| Tipos de cuantizacion | fp16 (decoder para Mac) e int8 por bloques de 32 en las lineales del MLP (decoder para iPhone); las proyecciones de atencion se mantienen en fp32 en ambos |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, etiquetada como `other`) |
| Formato de pesos | Bundles `.aimodel` de Core AI; tabla de embeddings ligados `head/option_rows.safetensors` (fp32, 2.134 ids x 2.048) |
| Tamano del repositorio | 10,2 GB |
| Vocabulario | 128.000 tokens |
| Libreria | coreai |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2.5-VL-3B, del que hereda un encoder de vision SigLIP2 de 27 capas y anchura 1.152 y un decoder hibrido LFM2 de 30 capas que combina 22 capas de convolucion corta con 8 capas de atencion con query agrupada, hidden size 2.048 y vocabulario de 128.000 tokens. Liquid AI hizo post-entrenamiento sobre esa base para convertirla en un modelo de decision: en lugar de generar texto, lee los logits de unos pocos tokens de opcion en la ultima posicion del prompt y toma un softmax sobre las opciones. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se uso RLHF o DPO.

El port a Core AI conserva esa logica de decision pero la reparte entre el grafo y el host. El decoder se exporta como un unico grafo que acepta 64 ids de token por llamada y devuelve el hidden state tras la normalizacion final en todas las posiciones, sin cabeza de vocabulario; el host lee la ultima posicion contra las filas de embedding ligadas de los tokens de opcion (`z[id] = h · E[id]` en float64), se queda con el logit maximo de cada opcion y aplica softmax. El proveedor aplica un log-softmax sobre todo el vocabulario antes de la lectura, pero esa constante se cancela en un softmax restringido a las opciones: segun la model card, ambas formulaciones coinciden dentro de 1,75e-7 sobre logits aleatorios de vocabulario completo. Las imagenes se procesan en un segundo grafo, el vision tower, con una llamada por recorte. La puerta de calidad es la paridad de probabilidad con el codigo fp32 del proveedor sobre cada opcion de cada pregunta: 393 preguntas de fixture, 120 reservadas y 24 sobre imagenes.

El contrato de lectura define tres tipos de pregunta (`noul`, `choice` y `score`) con un prompt fijo que arranca en `<|startoftext|>` (id 124894), usa `<|im_start|>` 124899, `<|im_end|>` 124900, `<|pad|>` 124893 e `<image>` 124907, y asigna codigos de opcion (la propia etiqueta si todas son de una letra, si no `A`..`Z` hasta 26 opciones, si no `00`, `01`, ...), admitiendo hasta 1.639 opciones mediante alias de un solo token. El modelo soporta decodificacion en fp16 e int8 con contrato identico.

## Capacidades

- Toma de decisiones tipada con salida probabilistica: `noul` devuelve P(si), `choice` devuelve la etiqueta argmax con su `confidence` y todas las probabilidades, y `score` devuelve la suma ponderada de niveles ordenados con su leyenda.
- Lectura de imagenes mediante el vision tower SigLIP2, integrable con texto y JSON en un mismo estado de entrada.
- Entrada de estado heterogenea: cadena de texto tal cual, cualquier otro valor JSON serializado con `json.dumps(..., ensure_ascii=False, indent=2)`, imagenes o una mezcla de todo.
- Respuesta estructurada con la forma System One: `{state, questions}` de entrada y `{answers, usage}` de salida, con `usage` en formato `{input_tokens, output_tokens: 0}`.
- Ejecucion on-device en GPU o Neural Engine mediante Core AI, sin dependencia de red.
- No genera texto: la salida es siempre una respuesta tipada por pregunta, lo que elimina el riesgo de texto libre pero tambien descarta cualquier tarea generativa.
- Tool calling, function calling, agentes multi-paso, thinking mode, audio y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion de tickets de soporte con preguntas `choice`: el modelo recibe el texto del ticket como estado y una pregunta con las categorias como opciones, y devuelve la categoria argmax con su probabilidad, lo que permite enrutar automaticamente y aplicar umbrales de confianza para escalar a un humano.
- Moderacion binaria con preguntas `noul`: dado un fragmento de contenido y criterios explicitos (líneas `Yes:` / `No:` en el prompt), devuelve la probabilidad de que viole la politica, con la ventaja de ser interpretable numericamente frente a una generacion de texto.
- Inspeccion visual en linea de produccion: al aceptar imagenes en el estado junto con texto, puede responder preguntas `noul` o `choice` sobre defectos en fotografias de piezas, una llamada al vision tower por recorte.
- Puntuacion de riesgo en formularios con preguntas `score`: dado un JSON con los campos del formulario, devuelve una esperanza ponderada sobre niveles ordenados (por ejemplo 0-5), util para priorizacion sin umbrales arbitrarios.
- Enrutamiento de herramientas en un agente: como las opciones `choice` admiten hasta 1.639 alias de un token, el modelo puede seleccionar que herramienta o endpoint invocar en funcion del estado de la conversacion, con la probabilidad asociada como senal de confianza.
- Analisis de sentimiento o satisfaccion por niveles: con un estado de texto y una pregunta `score` de varios niveles, produce una puntuacion continua derivada de la distribucion completa, no solo la clase mayoritaria.
- Procesamiento on-device con privacidad: al ejecutarse en Core AI sobre el Neural Engine o la GPU del dispositivo, los datos no salen del iPhone o el Mac, lo que encaja en flujos con requisitos de residencia de datos.
- Triaje multimodal en asistencia sanitaria o seguros: combinando una fotografia con un cuestionario en JSON y varias preguntas tipadas en una sola llamada, se obtiene una decision trazable con probabilidad por opcion y cero coste en tokens de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el proveedor reporta resultados de benchmarks y velocidades en su propia ficha, pero que ninguno se ha vuelto a medir en este port. Los unicos datos cuantitativos recogidos son de validacion y latencia:

| Metrica | Valor |
|---|---|
| Paridad fp32 del decoder fp16 (fixture, max abs delta p) | 0,0039 |
| Paridad fp32 del decoder int8mlp (fixture, max abs delta p) | 0,0197 |
| Preguntas de fixture evaluadas | 393 |
| Preguntas reservadas evaluadas | 120 |
| Preguntas sobre imagenes evaluadas | 24 |
| Latencia de decision en iPhone 18 Pro (decoder int8mlp, 64 tokens por llamada) | 48,3 ms por pregunta |
| Sobrecoste de especializacion del `.aimodel` en Mac frente a su asset AOT | Hasta un 25,7 % mas lento (otras formas); el fp16 queda como maximo un 0,7 % mas lento |
| Referencia externa citada (no es este modelo) | Qwen3-8B 4-bit a 94 tok/s en GPU de M4 Max bajo Core AI, frente a 90 tok/s en MLX |

## Requisitos de hardware

- VRAM o memoria unificada para el decoder fp16 de Mac: 5,56 GB de `.aimodel`.
- Memoria para el decoder int8mlp de iPhone: 3,70 GB de `.aimodel`, con lineales del MLP en int8 por bloques de 32 y proyecciones de atencion en fp32.
- Dispositivo de referencia medido: iPhone 18 Pro, que requiere la entitlement `com.apple.developer.kernel.increased-memory-limit`; sin ella no cargan ni la especializacion on-device del decoder ni sus assets ahead-of-time.
- Mac con Core AI (macOS 27) para el decoder fp16; el modelo se especializa donde se ejecuta, por lo que el `.aimodel` distribuido se adapta al dispositivo destino.
- Aceleracion: GPU o Neural Engine, segun el runtime de Core AI.
- Opciones de despliegue: exportacion con `coreai-torch` / `coreai.llm.export` a bundles `.aimodel`. No hay soporte indicado para vLLM, llama.cpp, Ollama, TGI ni MLX en este repositorio.
- Latencia: 48,3 ms por pregunta en iPhone 18 Pro con el decoder int8mlp a 64 tokens por llamada.
- Throughput: no disponible; no aplica en el sentido habitual, ya que el modelo produce cero tokens de salida.
- GPU de servidor (A100, H100, RTX 4090) y despliegue en consumer GPU de escritorio: no disponible, el port esta orientado al runtime de Apple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlboydaisuke/d1-3B-CoreAI | Aprox. 3.000 millones | No disponible | No publicado; paridad fp32 max delta p 0,0039 (fp16) y 0,0197 (int8) | LFM Open License v1.0 | HuggingFace, formato `.aimodel` para Core AI |
| LiquidAI/d1-3B | No disponible (base) | No disponible | No disponible | LFM Open License v1.0 | HuggingFace |
| LiquidAI/LFM2.5-VL-3B | Aprox. 3.000 millones | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de datos de benchmarks de ninguna de las tres referencias que permitan una comparacion cuantitativa de rendimiento. La diferencia funcional entre ellas es el contrato de salida: LFM2.5-VL-3B es un modelo vision-language generativo, d1-3B es su version post-entrenada como modelo de decision y d1-3B-CoreAI es el port de este ultimo al formato de ejecucion de Apple.

## Limitaciones y advertencias

- El modelo no genera texto en ningun caso: cualquier tarea que requiera salida generativa, resumen o dialogo queda fuera de su alcance.
- La longitud de contexto no se especifica en la informacion disponible; el grafo de Core AI procesa bloques de 64 tokens por llamada, por lo que la gestion de secuencias largas depende del host.
- Los idiomas soportados no se declaran, por lo que no hay garantia de calidad fuera del idioma o idiomas del post-entrenamiento.
- Riesgo de alucinacion: al devolver probabilidades sobre opciones predefinidas, el modelo no puede inventar texto, pero si puede asignar alta confianza a una opcion incorrecta; conviene usar el valor de `confidence` como filtro en produccion.
- Los sesgos del modelo base (LFM2.5-VL-3B) se heredan; no se documentan en la informacion disponible.
- Licencia LFM Open License v1.0, etiquetada como `other`: hay que revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones no se detallan en la model card.
- Dependencia de plataforma: el despliegue requiere Core AI en iOS 27 o macOS 27, lo que excluye Linux, Windows y Android.
- En iPhone es obligatoria la entitlement `com.apple.developer.kernel.increased-memory-limit`; sin ella el modelo no se especializa ni carga sus assets.
- Repositorio con muy poca traccion (7 descargas y 1 like en el momento de la consulta): no hay validacion independiente de los resultados de paridad ni de la latencia reportada.
- Los datos de paridad y latencia proceden del propio autor del port, no de una evaluacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/d1-3B-CoreAI
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Revision concreta del modelo base: https://huggingface.co/LiquidAI/d1-3B/tree/da1fe36a861f24690f27f622dca1d8688503d113
- Modelo del que deriva el base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Licencia: https://huggingface.co/mlboydaisuke/d1-3B-CoreAI/blob/main/LICENSE
- Benchmark de referencia para LLM en Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos corresponden a un proveedor de hosting de Minecraft y no guardan relacion con la ficha.
