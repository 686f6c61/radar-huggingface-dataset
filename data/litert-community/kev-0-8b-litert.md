# litert-community/Kev-0.8B-LiteRT

## Resumen

Kev-0.8B-LiteRT es la version empaquetada para LiteRT (el framework on-device de Google, sucesor de TensorFlow Lite) del modelo de decision Kev-0.8B de Jared Palmer. No es un modelo generativo: recibe un texto (el "state") junto con preguntas tipadas sobre el y devuelve, para cada pregunta, una respuesta con probabilidades. Soporta tres tipos de pregunta: si/no (`noul`), eleccion multiple (`choice`) y puntuacion en escala (`score`). Nunca produce texto libre, solo clasifica.

El modelo se construye sobre el backbone Qwen3.5-0.8B-Base (aproximadamente 0.8B parametros), adaptado mediante una LoRA de rango 16, y anade una "pointer head" de dos capas lineales que lee los estados ocultos del transformer y los convierte en probabilidades. El repositorio de litert-community publica el backbone como tres grafos LiteRT (para filas de hasta 512, 1.024 y 2.048 tokens) con la LoRA ya plegada en los pesos, mas la cabeza, el tokenizador, un host en Python y los scripts de conversion.

Su relevancia esta en el despliegue on-device: es una pieza de clasificacion ligera pensada para integrarse en aplicaciones Android o de escritorio que necesitan tomar decisiones estructuradas (enrutado, cumplimiento de criterios, puntuacion) sin generar texto y sin depender de la nube. El repo ocupa 3,8 GB, cada grafo ronda los 1,26-1,28 GB, y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-0.8B-Base) con LoRA rango 16 + pointer head de dos capas lineales |
| Parametros totales | no disponible (backbone Qwen3.5-0.8B-Base, aproximadamente 0,8B en el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | filas de hasta 2048 tokens (tres grafos: 512, 1024 y 2048) |
| Tipos de cuantizacion | grafos con pesos `fp16fc_i8emb` (fully connected en fp16, embeddings en int8); cabeza en float32 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT (`.tflite`) para backbone; `safetensors` para la pointer head; tokenizer en JSON |

## Arquitectura y entrenamiento

El sistema tiene dos partes. Por un lado, el backbone es Qwen/Qwen3.5-0.8B-Base, un transformer decoder, afinado con una LoRA de rango 16 segun describe la model card. Por otro, una pointer head de dos capas lineales (matrices `q.weight` [256, 1024] y `k.weight`, ambas en float32, mas sus sesgos) lee los estados ocultos del backbone y los transforma en probabilidades sobre las opciones de cada pregunta. No hay generacion autoregresiva: el modelo solo puntua alternativas.

Los tres grafos LiteRT (`L512`, `L1024`, `L2048`) contienen los mismos pesos y difieren unicamente en la longitud de fila que admiten; devuelven estados ocultos y es el host (en Python) quien construye las filas de entrada y aplica la cabeza. La LoRA va plegada en los pesos cuantizados. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO; esos datos figuran como no disponibles. Los ficheros de conversion y verificacion, junto con una guia REPRODUCE.md, se incluyen en el repositorio.

## Capacidades

- Clasificacion con respuestas tipadas: preguntas si/no (`noul`), eleccion multiple (`choice`) y puntuacion (`score`), cada una con su conjunto de probabilidades.
- Decision estructurada sobre un "state" de texto: enrutado a categorias, comprobacion de criterios booleanos y valoracion en escala.
- No genera texto: su salida son probabilidades y una opcion ganadora con nivel de confianza.
- Soporte de filas largas: hasta 512, 1024 o 2048 tokens segun el grafo elegido.
- Interface HTTP compatible con la forma `/v1/systemone` del servidor del autor.
- Ejecucion on-device: grafos preparados para LiteRT en Android (incluye `android/CardSnippet.kt`) y host de referencia en Python.
- Idiomas: solo ingles.

## Casos de uso

- Enrutado de tickets de soporte: clasificar cada ticket en equipos (facturacion, envios, devoluciones, tecnico) mediante preguntas `choice`, como muestra el ejemplo del repositorio con un ticket inventado.
- Comprobacion de cumplimiento de criterios: usar preguntas `noul` para verificar si un texto cumple condiciones booleanas (por ejemplo, si menciona una fecha limite o si aporta un dato requerido).
- Puntuacion de sentimiento o urgencia: preguntas `score` para valorar en una escala discreta el estado de animo del cliente o la severidad de una incidencia.
- Asistentes locales en Android: integrado via LiteRT en una app nativa (el repo incluye un fragmento Kotlin) para tomar decisiones sin enviar datos a la nube.
- Filtrado y triaje en pipelines de datos: clasificar grandes volumenes de texto corto con latencia baja al no requerir decodificacion generativa.
- Moderacion o etiquetado asistido: aplicar criterios tipados a mensajes para asignar etiquetas discretas de forma reproducible.
- Preprocesado en agentes: usar la salida categorica como senal de enrutado antes de invocar un modelo generativo mayor.

## Benchmarks y rendimiento

La model card no publica benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Lo que aporta son mediciones de fidelidad de conversion frente a la referencia en PyTorch fp32 del autor. Estas cifras miden el acuerdo numerico de la conversion, no la precision de la tarea.

| Prueba | Resultado |
|---|---|
| Preguntas de test | 392 |
| Empates cercanos (dos opciones a 0,02 o menos en la referencia) | 15 de 392 |
| Resto de preguntas (377) | el fichero dio la opcion mas probable de la referencia siempre, en las tres plataformas |
| Empates cercanos (15) | 13 conservaron la respuesta de la referencia |
| Diferencia maxima de probabilidad por opcion (incluidos empates) | 0,0104 |
| Plataformas probadas | Apple M4 Max CPU (8 hilos), Apple M4 Max GPU Metal fp32 (ai-edge-litert 2.2.0), Galaxy S26 GPU FP32 (LiteRT 2.2.0) |

## Requisitos de hardware

- VRAM/RAM estimada: cada grafo ocupa entre 1,26 GB (L512) y 1,29 GB (L2048) en disco; en memoria hay que sumar los pesos cargados mas los estados ocultos de la fila de entrada. Cabe holgadamente en hardware de gama alta movil.
- GPU recomendadas: no se especifican modelos de escritorio; se ha validado en GPU Metal de Apple M4 Max (fp32) y en GPU de Galaxy S26 (FP32).
- Consumer GPU: no hay datos concretos, pero el tamano del grafo (en torno a 1,3 GB) sugiere que es viable en GPU de consumo con suficiente VRAM; no confirmado en la informacion disponible.
- Opciones de despliegue: LiteRT / ai-edge-litert (Android y escritorio), host Python incluido, y variantes de comunidad en Core ML, ONNX, GGUF, RKNN y MLX (contenidos no verificados por el autor de la model card).
- Latencia y throughput: no disponibles; la model card solo confirma que el fichero L512 corrio en las plataformas citadas, sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Formatos | Idiomas | Licencia |
|---|---|---|---|---|---|
| Kev-0.8B-LiteRT | Clasificacion por preguntas tipadas | Qwen3.5-0.8B-Base + LoRA | LiteRT (.tflite) | en | apache-2.0 |
| jaredpalmer/kev-0.8b | Clasificacion por preguntas tipadas (referencia) | Qwen3.5-0.8B-Base + LoRA | PyTorch fp32 | en | no disponible |
| litert-community/decider-0.8b-LiteRT | Clasificacion (variante comunitaria) | no disponible | LiteRT (.tflite) | no disponible | no disponible |
| Kev-0.8B en otros runtimes (Core ML, ONNX, GGUF, RKNN, MLX) | Misma tarea | Qwen3.5-0.8B-Base + LoRA | Core ML, ONNX, GGUF, RKNN, MLX | en | no disponible |

Las diferencias de rendimiento entre estas variantes no estan publicadas en la informacion disponible.

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que requiera redaccion libre queda fuera de su alcance.
- Solo ingles; no hay soporte multilingue declarado.
- La ventana de contexto efectiva depende del grafo elegido (512, 1024 o 2048 tokens); textos mas largos deben truncarse o dividirse.
- Los datos de entrenamiento, los sesgos y la composicion del dataset no se detallan en la model card: el riesgo de sesgo es, por tanto, no evaluado.
- La evaluacion publicada es de fidelidad de conversion frente a la referencia fp32, no de precision en tareas reales; no debe interpretarse como medida de calidad del modelo.
- Las variantes en otros formatos (Core ML, ONNX, GGUF, RKNN, MLX) no han sido verificadas por el autor de la model card; usarlas bajo tu propio riesgo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el fichero NOTICE y las condiciones del modelo base Qwen3.5-0.8B-Base, que pueden anadir requisitos de atribucion.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca adopcion y validacion externa limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/Kev-0.8B-LiteRT
- Modelo base: https://huggingface.co/jaredpalmer/kev-0.8b
- Backbone: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Repositorio del autor (servidor y backend MLX): https://github.com/jaredpalmer/kev
- Issue de exportacion LiteRT / Android: https://github.com/jaredpalmer/kev/issues/67
- Organizacion LiteRT Community: https://huggingface.co/litert-community
- Variante decider-0.8b-LiteRT: https://huggingface.co/litert-community/decider-0.8b-LiteRT
- Google AI Edge LiteRT Samples: https://github.com/google-ai-edge/litert-samples
- Core ML: https://huggingface.co/FluidInference/kev-0.8b-coreml
- ONNX: https://huggingface.co/midudev/kev-0.8b-ONNX
- GGUF: https://huggingface.co/ggml-org/Kev-0.8B-GGUF
- RKNN: https://huggingface.co/ShiWarai/kev-0.8b-rknn
- Ficha en gradually.ai: https://www.gradually.ai/en/ai-models/kev-0.8b/
