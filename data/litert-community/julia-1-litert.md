# litert-community/Julia-1-LiteRT

## Resumen

Julia-1-LiteRT es la conversion a LiteRT del modelo de decision SupersonicLabs/Julia-1, publicada por la organizacion litert-community. Se trata de un modelo compacto de clasificacion de texto y enrutamiento (routing) que, dado un estado (texto o JSON), una pregunta tipada y entre 2 y 20 opciones, devuelve una probabilidad por opcion en una sola pasada hacia delante. No es un modelo generativo: responde a preguntas de tipo `choice` (elige la opcion ganadora), `score` (indice esperado en una rubrica ordenada) y `noul` (probabilidad de verdadero para preguntas de si/no). Esta pensado explicitamente para ejecutarse en el dispositivo, con aceleracion por GPU en Android mediante LiteRT (el sucesor de TensorFlow Lite).

La arquitectura subyacente es el encoder mmBERT-small de ModernBERT, sobre el que se anaden un embedding de tipo de pregunta, dos capas de cabeza y un scorer de opciones que emite un logit por posicion. El repositorio distribuye dos grafos TFLite con los pesos en FP32: uno para ventanas de 512 tokens y otro para 1.024 tokens, ademas de una tabla de tokens en FP16 y el tokenizer original. El conjunto de ficheros para la variante S512 ocupa unos 416 MB en total (grafo + tabla de tokens + tokenizer).

Su relevancia actual radica en que demuestra un flujo de trabajo de decision en el borde (edge) con latencias de decenas de milisegundos y fidelidad casi exacta respecto al runtime de referencia del autor, sin necesidad de Torch, transformers ni del paquete `julia` en el host. El modelo solo soporta ingles y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer ModernBERT (mmBERT-small) con embedding de tipo de pregunta, dos capas de cabeza y scorer de opciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (grafo S512) y 1.024 tokens (grafo S1024) |
| Tipos de cuantizacion | Pesos del grafo en FP32; tabla de tokens en FP16 (y alternativa FP32 en el checkpoint original) |
| Idiomas soportados | en (solo ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`), tabla de tokens binaria (`.bin`), tokenizer JSON |
| Tamano del repositorio | 0,6 GB |
| Tamano de ficheros (S512) | grafo 185.095.348 B + tabla de tokens 196.608.000 B + tokenizer 34.363.188 B = 416.066.536 B |
| Tamano del grafo S1024 | 188.503.220 B |
| Dimension de embedding / vocabulario | hidden dim 384; tabla de tokens de forma [256000, 384] |
| Pipeline | text-classification, zero-shot-classification, routing |
| Framework | LiteRT (via litert-torch) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT (variante mmBERT-small) que procesa la secuencia de entrada completa y produce una representacion contextual. Sobre el encoder se anaden tres componentes: un embedding que codifica el tipo de pregunta (`choice`, `score`, `noul`), dos capas de cabeza y un scorer de opciones que genera un logit por cada posicion candidata. El host construye la secuencia insertando un marcador `<mask>` por cada opcion, lee los logits en esas posiciones y aplica softmax para obtener una probabilidad por opcion. Los grafos TFLite conservan los pesos en float32 del checkpoint original, mientras que el host realiza la tokenizacion, la busqueda de filas en la tabla de tokens y la decodificacion de las respuestas.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. La innovacion tecnica destacable de esta publicacion es la conversion a LiteRT con litert-torch y la separacion del calculo entre el grafo en el dispositivo y el host: la tabla de tokens se almacena en FP16 para reducir tamano (196.608.000 B frente a los 393.216.000 B de la tabla FP32) sin alterar ninguna respuesta y con una desviacion maxima de probabilidad de 0,0077 en las comprobaciones realizadas. En todas las validaciones, las 706 filas del conjunto de validacion en el telefono y las 2.000 preguntas de typed-decisions en CPU de escritorio (mas 2.065 filas que caben en 512 tokens) devolvieron la misma respuesta que el runtime del autor.

## Capacidades

- Clasificacion y enrutamiento de decisiones: dado un estado en texto o JSON, una pregunta tipada y entre 2 y 20 opciones, devuelve una probabilidad por opcion en una sola pasada.
- Preguntas de tipo `choice`: selecciona la opcion ganadora (por ejemplo, asignar un ticket a un equipo concreto).
- Preguntas de tipo `score`: devuelve el indice esperado sobre una rubrica ordenada (por ejemplo, nivel de urgencia).
- Preguntas de tipo `noul` (si/no): devuelve la probabilidad de verdadero para afirmaciones booleanas.
- Clasificacion zero-shot: las opciones y criterios se definen en tiempo de inferencia, sin reentrenamiento.
- Procesamiento de entradas estructuradas: acepta el estado como texto libre o como JSON.
- Ejecucion en el dispositivo sin dependencias de Torch, transformers ni del paquete `julia` en el host (solo numpy, tokenizers y ai-edge-litert en Python).
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (vision o audio); es un modelo discriminativo, no generativo.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo asigna el equipo responsable (facturacion, envios, acceso, etc.) devolviendo una probabilidad por equipo. El ejemplo de la model card resuelve un caso de doble cargo a facturacion con probabilidad 0,7925.
- Priorizacion y triaje: mediante preguntas `score` sobre una rubrica de urgencia, se obtiene el indice esperado para ordenar una cola de trabajo sin reglas manuales.
- Extraccion de intenciones binarias: con preguntas `noul`, se detecta si una peticion implica reembolso, cancelacion u otra accion booleana a partir del estado.
- Clasificacion zero-shot en produccion: al definir opciones y criterios en la propia peticion, se pueden anadir nuevas categorias sin reentrenar el modelo, util para taxonomias cambiantes.
- Procesamiento en el dispositivo en Android: el grafo S512 corre en la GPU de un Samsung Galaxy S26 con una mediana de 80,7 ms (primera sesion) a 112,1 ms (segunda sesion) de tiempo de grafo en FP32 explicito, lo que permite clasificar localmente sin enviar datos a un servidor.
- Clasificacion de documentos de hasta 1.024 tokens: el grafo S1024 gestiona peticiones mas largas que no caben en la ventana de 512 tokens, manteniendo la fidelidad de respuesta.
- Preprocesado de pipelines RAG o agentes: usar el modelo como primer filtro para decidir si una consulta va a un flujo, a otro o requiere escalado humano.
- Moderacion o etiquetado por criterios: definir criterios como opciones y usar la pregunta `choice` para asignar etiquetas a contenido de forma determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos de validacion aportados por el autor son de fidelidad y latencia, no de exactitud frente a tareas estandar:

| Metrica | Valor |
|---|---|
| Latencia de grafo en Samsung Galaxy S26 GPU (S512, FP32 explicito, mediana) | 80,7 ms (primera sesion) a 112,1 ms (segunda sesion); tres ejecuciones el 2026-09-30 |
| Fidelidad en telefono (706 filas de validacion, S512) | Misma respuesta que el runtime del autor; desviacion de probabilidad <= 0,0077 (tabla FP16) y <= 0,00005 (tabla FP32) |
| Fidelidad en telefono (S1024) | 100 filas, misma respuesta con FP32 explicito |
| Fidelidad en CPU de escritorio (S512) | 2.065 filas que caben en 512 tokens, misma respuesta |
| Fidelidad en CPU de escritorio (S1024) | 2.000 preguntas de typed-decisions, misma respuesta |
| Ejemplo de salida (Mac CPU, caso de reembolso) | billing 0,7925 / shipping 0,2073 / access 0,0002; urgencia 0,8169; reembolso 0,6915 |

## Requisitos de hardware

- VRAM / memoria estimada: el grafo S512 ocupa 185 MB y el S1024 188 MB; sumando la tabla de tokens FP16 (196 MB) y el tokenizer (34 MB) el conjunto S512 ronda los 416 MB. Al conservarse los pesos en FP32, la huella en memoria es mayor que la de una cuantizacion de 8 o 4 bits.
- GPU compatibles: GPU de Android via LiteRT (validado en Samsung Galaxy S26 con FP32 explicito). En escritorio se ha probado en CPU (Mac). No se enumeran GPU de escritorio concretas en la informacion disponible.
- Consumer GPU: el tamano (menos de 0,5 GB de ficheros) hace viable su ejecucion en GPU de consumo y en telefonos, aunque no se aportan pruebas de rendimiento en GPU de escritorio (por ejemplo RTX 4090) ni en A100/H100.
- Opciones de despliegue: LiteRT (`ai-edge-litert` 2.1.6 probado, con `numpy` y `tokenizers`) para escritorio y `com.google.ai.edge.litert` (`CompiledModel`, `Accelerator`) para Android. Existen otras exportaciones del modelo base en ONNX/WebGPU, MLX y GGUF para otros runtimes.
- Latencia y throughput: mediana de 80,7 a 112,1 ms de tiempo de grafo en la GPU del Galaxy S26 con el grafo S512 en FP32 explicito. No se aportan datos de throughput (peticiones por segundo) ni de latencia en escritorio.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar Julia-1 con otros modelos de decision de la misma categoria. La comparacion disponible se limita a las distintas exportaciones del mismo modelo base, utiles para elegir formato de despliegue:

| Modelo | Formato / runtime | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litert-community/Julia-1-LiteRT (este) | TFLite / LiteRT (Android GPU, CPU escritorio) | ~416 MB (S512, con tabla de tokens) | 512 y 1.024 tokens | Apache 2.0 | HuggingFace, litert-community |
| SupersonicLabs/Julia-1-ONNX | ONNX / WebGPU | no disponible | no disponible | Apache 2.0 | HuggingFace, autor |
| zainmerchan/Julia-1-MLX | MLX (Apple Silicon) | no disponible | no disponible | Apache 2.0 | HuggingFace |
| andrelucas/Julia-1-GGUF | GGUF / llama.cpp | no disponible | no disponible | Apache 2.0 | HuggingFace |

Alternativas de terceros de la misma tarea (clasificacion/enrutamiento compacto): no disponible.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Es un modelo discriminativo, no generativo: no produce texto libre ni mantiene conversaciones multi-turno por si mismo.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion incorrecta cuando la pregunta o las opciones estan mal definidas; las probabilidades deben umbralizarse con cautela en produccion.
- Limitacion de contexto: la ventana maxima documentada es de 1.024 tokens; las peticiones mas largas deben recortarse o dividirse.
- No se detallan sesgos conocidos ni la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de dominio o demograficos.
- El modelo base (SupersonicLabs/Julia-1) no dispone de parametros totales ni datos de entrenamiento publicados en la informacion disponible, lo que dificulta auditar su comportamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el texto de licencia y la atribucion (ficheros LICENSE y NOTICE incluidos en el repo).
- Caveat de reproduccion: los grafos conservan pesos FP32 y la tabla de tokens por defecto es FP16; cambiar a una tabla FP32 reduce la desviacion, pero duplica el tamano de dicho fichero (393.216.000 B).
- Las cifras de latencia y fidelidad corresponden a comprobaciones concretas del autor (Galaxy S26, Mac CPU) en una fecha determinada y pueden variar segun el dispositivo y el estado termico.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que aun carece de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/Julia-1-LiteRT
- Modelo base: https://huggingface.co/SupersonicLabs/Julia-1
- Exportacion ONNX del autor: https://huggingface.co/SupersonicLabs/Julia-1-ONNX
- Exportacion MLX: https://huggingface.co/zainmerchan/Julia-1-MLX
- Exportacion GGUF: https://huggingface.co/andrelucas/Julia-1-GGUF
- Pagina de investigacion de Julia 1 (Supersonic Labs): https://supersoniclabs.ia.br/julia-1/
- Repositorio de LiteRT: https://github.com/google-ai-edge/litert
- Documentacion de LiteRT (Google): https://developers.google.com/edge/litert
- Organizacion LiteRT Community en HuggingFace: https://huggingface.co/litert-community
- Colecciones de LiteRT Community: https://huggingface.co/litert-community/collections
