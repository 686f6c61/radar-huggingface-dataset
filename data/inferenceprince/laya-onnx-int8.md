# inferenceprince/laya-onnx-int8

## Resumen
Laya ONNX int8 es una build cuantizada del modelo convaiinnovations/laya, publicada por el usuario inferenceprince y pensada exclusivamente para inferencia sobre ONNX Runtime. No es un modelo nuevo ni un fine-tune: es el mismo clasificador de decisiones (etiquetado como "system-one" y "calibrated-decisions" en los tags) reexportado a ONNX con pesos en int8 de tipo weight-only mediante el operador MatMulNBits, con tamano de bloque 64 y cuantizacion simetrica. El objetivo del autor es reducir el peso del repositorio de 849 MB (build fp16) a unos 613 MB, y por tanto el tiempo de descarga y de carga, manteniendo la salida del modelo practicamente intacta.

El modelo base es un encoder de la familia ModernBERT afinado para una tarea muy concreta: elegir entre un conjunto de opciones etiquetadas dado un texto de entrada. El formato de prompt construye una pregunta de eleccion con un token [MASK] por cada opcion y el modelo puntua esas posiciones, no genera texto. Es, por tanto, un componente de decision y enrutado, no un modelo conversacional. La relevancia de esta build concreta esta en la tecnica de cuantizacion: el autor documenta que el int8 dinamico convencional degrada el modelo (hasta un 69,2% de coincidencia en el argmax) mientras que la cuantizacion weight-only mantiene el 100% de coincidencia en su conjunto de validacion.

El repositorio tiene un tamano de 0,6 GB, licencia Apache 2.0 e idioma declarado unicamente el ingles. El modelo base se identifica como convaiinnovations/laya. No hay datos publicados de numero de parametros, longitud de contexto ni composicion del dataset de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo ModernBERT (segun la model card del autor), con cabeza de puntuacion sobre posiciones [MASK] y scorer mantenido en fp32 |
| Parametros totales | no disponible (el build fp16 ocupa 849 MB y los pesos int8 606,3 MB; no se confirma la cifra de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el archivo `rl_agent_config.json` define un `max_len`, pero su valor no se detalla. El presupuesto de la cabeza de opciones (`head_max_len`) es de 192 tokens |
| Tipos de cuantizacion | int8 weight-only con `MatMulNBits` (block size 64, simetrica); existe una build fp16 sin cuantizar en el mismo autor |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` de 3,1 MB como grafo y `model.onnx.data` de 606,3 MB como datos externos); tokenizer en formato `tokenizers` |
| Pipeline | text-classification |
| Libreria | onnx / onnxruntime |
| Tamano del repositorio | 0,6 GB |
| Modelo base | convaiinnovations/laya |

## Arquitectura y entrenamiento
El modelo base es un encoder transformer de la familia ModernBERT, segun la propia model card del autor al explicar por que falla el int8 dinamico: "ModernBERT has outlier activation channels that a per-tensor dynamic scale cannot represent". Sobre ese encoder se anade un esquema de decision por puntuacion de posiciones: el prompt se construye como `[CLS] choice question: <pregunta> [SEP]` seguido de un token `[MASK]` por cada opcion con su etiqueta y descripcion, luego `[SEP]` y el texto a analizar. La red devuelve logits en las posiciones de los `[MASK]`, que se dividen por una temperatura calibrada y se normalizan con softmax para obtener una distribucion de probabilidad sobre las opciones. El modelo acepta cinco entradas (`input_ids`, `attention_mask`, `marker_pos`, `marker_mask`, `qtype`) y soporta tres modos declarados: `0=choice`, `1=score` y `2=noul`.

La build int8 aplica cuantizacion weight-only con `MatMulNBits` y mantiene la cabeza y el scorer en fp32. Segun el autor, esa cabeza representa alrededor del 6% de los parametros, pero produce directamente los logits y el runtime los divide por temperaturas que pueden llegar a 0,1, lo que amplifica cualquier error diez veces. La ablacion reportada sobre 8 casos de validacion compara variantes de cuantizacion por coincidencia en el argmax: int8 dinamico per-tensor 69,2%, int8 dinamico per-channel 76,9%, int8 dinamico solo en MatMuls 65,4% y weight-only int8 (esta build) 100%. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, aunque el nombre del archivo de configuracion (`rl_agent_config.json`) y la presencia de temperaturas ajustadas por tipo de pregunta y numero de opciones apuntan a una fase de calibracion posterior.

## Capacidades
- Clasificacion de texto restringida a una tarea de eleccion entre opciones etiquetadas proporcionadas en el prompt, devolviendo una distribucion de probabilidad sobre esas opciones.
- Modo `choice`: seleccion de una opcion entre varias (por ejemplo, enrutar una consulta a un equipo concreto).
- Modo `score`: puntuacion de candidatos, segun el valor `qtype=1`; no se especifica en detalle su semantica.
- Modo `noul`: tercer modo declarado con `qtype=2`, cuyo significado no se detalla en la informacion disponible.
- Calibracion por temperatura: el config incluye temperaturas ajustadas por tipo de pregunta y por tramos de numero de opciones (2, 3-5, 6-10, 11+), lo que permite obtener probabilidades mejor calibradas que un softmax sin ajuste.
- Ejecucion en ONNX Runtime con `CPUExecutionProvider`, y soporte previsto de otros provedores de ejecucion de ONNX Runtime.
- No genera texto libre: no hay decodificacion autoregresiva ni capacidad de chat.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: no; el unico idioma declarado es el ingles.
- La build fp16 hermana (`inferenceprince/laya-onnx`) esta pensada para WebGPU sin necesidad de pruebas adicionales, segun la model card.

## Casos de uso
- Enrutado de tickets de soporte: el ejemplo oficial de la model card clasifica un texto como "I was billed twice. Please refund the duplicate." entre las opciones billing, technical y sales, devolviendo billing con 0,9670 de probabilidad en esta build int8 (frente a 0,9696 en fp16). Es un caso de triaje directo donde la salida es una etiqueta operable por un sistema de ticketing.
- Clasificacion de intenciones en asistentes conversacionales: dado un turno de usuario y un conjunto cerrado de intenciones con descripcion, el modelo devuelve la intencion mas probable y una confianza calibrada, lo que permite decidir entre responder o derivar a un humano.
- Enrutado de herramientas en pipelines de agentes: si cada herramienta disponible se describe como una opcion con etiqueta y descripcion, el modelo puede actuar como router que selecciona la herramienta adecuada antes de invocar un LLM generativo, reduciendo coste y latencia en la fase de decision.
- Clasificacion con abscripcion o descarte: el modo `noul` permite, segun la nomenclatura del autor, contemplar una salida alternativa a las opciones etiquetadas; util para filtrar entradas que no encajan en ninguna categoria conocida antes de procesarlas.
- Etiquetado y preanotacion de datasets: al ser un modelo pequeno (0,6 GB en int8) puede ejecutarse en CPU sobre lotes grandes de texto para preetiquetar categorias cerradas, con revision humana posterior.
- Moderacion o triaje de contenido en categorias predefinidas: la salida es una distribucion sobre opciones descritas en el prompt, de modo que cambiar la politica de clasificacion no requiere reentrenar, solo reescribir las opciones.
- Despliegue en el navegador o en el borde: la existencia de una build fp16 orientada a WebGPU y de esta build int8 de 613 MB sugiere escenarios de inferencia en cliente sin servidor, siempre que la version de ONNX Runtime soporte `MatMulNBits`.
- Puntuacion de respuestas candidatas en generacion asistida: el modo `score` (`qtype=1`) permite ordenar candidatos generados por otro sistema, aunque el rendimiento medido en ese modo es el mas bajo de la tabla publicada (50,0% en la build fp16).

## Benchmarks y rendimiento
Ablacion de cuantizacion sobre 8 casos de validacion, midiendo coincidencia en el argmax respecto al modelo sin cuantizar:

| Variante | Coincidencia en argmax |
|---|---|
| int8 dinamico, per-tensor | 69,2% |
| int8 dinamico, per-channel | 76,9% |
| int8 dinamico, solo MatMuls | 65,4% |
| int8 weight-only (esta build) | 100% |

Comparacion de comportamiento entre builds sobre 116 items sinteticos repartidos en 15 categorias. El autor advierte explicitamente que las etiquetas fueron generadas por un modelo de lenguaje y no por anotadores humanos, por lo que la tabla debe leerse como comparacion de comportamiento entre builds y no como benchmark de precision:

| Build | Tamano | Overall | choice | score | noul | Decisiones cambiadas |
|---|---|---|---|---|---|---|
| fp16 | 849 MB | 76,7% | 77,8% | 50,0% | 86,3% | no disponible |
| int8 (esta build) | 613 MB | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

Ejemplo de salida real citado en la model card para la consulta de facturacion: billing 0,9670, technical 0,0165, sales 0,0165, frente al 0,9696 de la build fp16. El autor senala que la diferencia aparece a partir del cuarto decimal.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: inferior a 1 GB para los pesos en int8 (606,3 MB de datos externos) mas el grafo de 3,1 MB; el build fp16 requiere en torno a 849 MB solo de pesos. No se detalla el consumo de activaciones.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en entornos integrados o moviles, dado el tamano del repositorio (0,6 GB).
- La ejecucion de ejemplo de la model card usa `CPUExecutionProvider`, por lo que el modelo es funcional en CPU sin GPU.
- GPU de clase数据中心 como A100 o H100 no son necesarias para este modelo; se usarian solo por agregacion de muchas instancias concurrentes, y no hay datos de throughput publicados.
- Version de runtime: requiere ONNX Runtime 1.18 o posterior en CPU para disponer del operador `MatMulNBits`. Con versiones anteriores hay que usar la build fp16.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, WebGPU y demas execution providers). No hay pesos GGUF, por lo que no es desplegable con llama.cpp ni Ollama, y no es un modelo de vLLM ni de TGI.
- Latencia y throughput: no disponibles.
- Dependencias de uso: `onnxruntime`, `huggingface_hub`, `tokenizers` y `numpy`.

## Comparativa con modelos similares
En la informacion disponible no se identifican modelos de terceros comparables publicados con datos de rendimiento. La comparacion factible es entre las builds del mismo modelo y su base:

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| inferenceprince/laya-onnx-int8 | no disponible | no disponible (`max_len` en config) | int8 weight-only, `MatMulNBits`, block 64 | 613 MB | apache-2.0 | HuggingFace, ONNX Runtime >= 1.18 |
| inferenceprince/laya-onnx | no disponible | no disponible | fp16 | 849 MB | apache-2.0 | HuggingFace, recomendado por el autor para WebGPU |
| convaiinnovations/laya | no disponible | no disponible | sin cuantizar | no disponible | no disponible en la informacion proporcionada | HuggingFace, modelo base |

Frente a alternativas genericas de clasificacion (DistilBERT, ModernBERT-base, DeBERTa) no hay datos comparativos en la informacion disponible, y la tarea de este modelo (eleccion entre opciones descritas en el prompt) no es directamente equiparable a una clasificacion con etiquetas fijas.

## Limitaciones y advertencias
- El modelo solo soporta ingles. No hay capacidades multilingues declaradas.
- No es un modelo generativo: no puede responder preguntas abiertas ni mantener conversaciones; devuelve puntuaciones sobre opciones proporcionadas.
- El presupuesto de la cabeza de opciones es de 192 tokens: las descripciones de las opciones deben caber en ese limite, y el texto a analizar se trunca segun el `max_len` del config.
- Los numeros de rendimiento publicados provienen de 116 items sinteticos con etiquetas generadas por un modelo de lenguaje, no por anotadores humanos. No deben interpretarse como precision real en produccion.
- El rendimiento en el modo `score` es bajo en la build fp16 (50,0%), y no hay datos equivalentes confirmados para la build int8.
- La temperatura puede llegar a 0,1 y se aplica antes del softmax; implementaciones incorrectas (softmax sin dividir por temperatura, o `marker_pos` en un tipo distinto de int64) producen resultados invalidos.
- La cuantizacion int8 weight-only mantiene el argmax en la validacion del autor, pero la model card reconoce diferencias a partir del cuarto decimal (0,9670 frente a 0,9696), por lo que no puede garantizarse una identidad exacta de salida en todos los casos.
- Requiere ONNX Runtime 1.18 o superior; en versiones anteriores el operador `MatMulNBits` no esta disponible.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que implica una validacion externa practicamente nula.
- La licencia del repositorio es Apache 2.0, pero la licencia del modelo base convaiinnovations/laya no se detalla en la informacion proporcionada; conviene verificarla antes de un uso comercial.
- No se documentan sesgos conocidos, comportamiento fuera de distribucion ni resultados de evaluacion con datos reales.
- El tercer modo (`noul`) aparece en el codigo de ejemplo pero no se explica su semantica ni su calidad, lo que dificulta su uso en produccion.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/inferenceprince/laya-onnx-int8
- Build fp16 del mismo autor: https://huggingface.co/inferenceprince/laya-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya
