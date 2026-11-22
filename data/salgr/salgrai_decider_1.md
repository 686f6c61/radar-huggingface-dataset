# salgr/SalgrAI_Decider_1

## Resumen

SalgrAI-Decider_1 es un modelo de decisión de tamano muy reducido (25.024.129 parametros) desarrollado por el usuario independiente Salgr. No es un modelo generativo: recibe una situación, una pregunta (criterio) y entre 2 y 8 opciones, y devuelve en una sola pasada forward una distribución de probabilidad softmax sobre las opciones. Sigue la estela de la familia de "modelos de decisión" o "System One" (como Jev de TypeSafe AI), aunque el autor declara explicitamente que es un desarrollo independiente y no afiliado ni reproducción de ninguno de ellos.

Tecnicamente se construye sobre el backbone de un transformer propio, SalgrAI-v1.2 (11 capas, hidden 384, 6 cabezas, FFN 1202, RoPE, RMSNorm, SwiGLU), inicializado desde su checkpoint de preentrenamiento y modificado con atención bidireccional, sin cabeza de lenguaje y con una cabeza "pointer" que proyecta el estado oculto de cada marcador `<|option|>` a un escalar. El contexto maximo es de 1024 tokens y el vocabulario de 8196 tokens (8192 del tokenizador SalgrAI mas 4 tokens de servicio).

Es relevante como ejemplo de arquitectura especializada de bajo coste para tareas de clasificación y elección entre alternativas, entrenada desde cero por una sola persona. Su utilidad practica esta acotada a las familias de tareas con las que fue entrenado (tipo de mensaje, tema de conversación, aritmetica simple), y el propio autor advierte que es poco fiable fuera de ellas y que no debe usarse para moderación ni decisiones de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional derivado de SalgrAI-v1.2 (11 capas, hidden 384, 6 cabezas, FFN 1202, RoPE, RMSNorm, SwiGLU) con cabeza pointer MLP 384 -> 384 -> 1 |
| Parametros totales | 25.024.129 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no hay GGUF) |
| Idiomas soportados | ru, en (entrenado principalmente con texto en ruso y criterios en ruso) |
| Licencia | no disponible (el autor deja un TODO en la model card para elegir licencia antes de publicar) |
| Formato de pesos | safetensors y pytorch_model.bin (float32, tensores identicos) |
| Vocabulario | 8196 tokens (8192 SalgrAI + `<\|state\|>`, `<\|criteria\|>`, `<\|option\|>`, `<\|end\|>`) |
| Salida | softmax sobre opciones de `logit / T`, con T = 1.72 |
| Opciones por consulta | entrenado con 2-7, el codigo acepta hasta 8 |
| Tamano del repo | 0.2 GB |

## Arquitectura y entrenamiento

El modelo parte del checkpoint de preentrenamiento de SalgrAI-v1.2 (antes del fine-tuning de chat) y aplica tres cambios: atención bidireccional con mascara de padding, eliminación de la cabeza de lenguaje y adición de una cabeza pointer consistente en un MLP 384 -> 384 -> 1 que se aplica al estado oculto en cada marcador `<|option|>`. La entrada se serializa como una unica secuencia con el formato `<|state|> situación <|criteria|> pregunta <|option|> opción 1 <|option|> opción 2 ... <|end|>`. La salida es un softmax sobre los logits de las opciones divididos por una temperatura de calibración T = 1.72 ajustada en validación.

El fine-tuning se realizo sobre 81.534 tareas de "elegir una opción" generadas automaticamente, con la respuesta correcta conocida por construccion y sin etiquetado manual. Las familias de tareas cubren tipo de mensaje (3-6 de 6 tipos), tema de dialogo (3-7 de 12 temas), continuacion de respuesta, rechazo / incertidumbre, aritmetica, identificacion de articulo de Wikipedia y continuacion de subtitulos. Se entrenaron 3 epocas con AdamW (lr 2e-4 para el backbone, 1e-3 para la cabeza), batch 32 y bf16, publicandose el checkpoint de mejor perdida de validacion (epoca 2). La separacion train/validacion/test se hace por fuente (todas las tareas derivadas de un mismo dialogo, articulo o ventana de subtitulos van al mismo split), aunque los distractores se extraen del pool completo y pueden provenir de fuentes de entrenamiento.

## Capacidades

- Clasificacion de tipo de mensaje entre 6 categorias (saludo, pregunta, peticion, agradecimiento, despedida, emocion).
- Clasificacion de tema de conversacion entre 12 temas.
- Eleccion de la respuesta que mejor continua un dialogo entre varias candidatas.
- Deteccion de rechazo o de incertidumbre ("no estoy seguro") en respuestas del asistente.
- Aritmetica basica: suma, resta, producto, cociente, porcentaje, mayor/menor, paridad, secuencias y problemas verbales.
- Identificacion del articulo de Wikipedia del que procede un parrafo con las palabras del titulo enmascaradas.
- Continuacion de lineas de subtitulos de pelicula.
- No genera texto: unicamente devuelve probabilidades sobre opciones.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo thinking.
- Soporte multilingue limitado a ruso (idioma de entrenamiento) e ingles declarado en metadatos, sin evidencia de rendimiento en ingles en la informacion disponible.

## Casos de uso

- Enrutamiento de mensajes en un chatbot: clasificar el mensaje entrante en tipos (saludo, pregunta, peticion, queja) con un coste computacional minimo, dado que el modelo cabe en cualquier GPU consumer y ejecuta una sola pasada forward por consulta.
- Etiquetado de temas en un corpus de dialogos: asignar uno de 12 temas a cada conversacion para organizar tickets de soporte o analitica de producto, aprovechando la precision de 0.89 reportada en la familia de tema.
- Filtro previo de rechazo en pipelines de asistente: usar la familia "refuse / not sure" para marcar peticiones que el asistente sintetico original rechazo, como senal auxiliar (no como decision final, dado el tamano reducido del test set).
- Seleccion de respuesta candidata en sistemas de generacion multiple: dado un contexto y varias respuestas generadas por otro modelo, puntuar cual es mas coherente con el dialogo; util como reranker barato, aunque la precision de 0.33 en esta familia limita su fiabilidad.
- Verificacion aritmetica simple en formularios o asistentes: comprobar si la opcion elegida por un usuario coincide con el resultado calculado por el modelo en tareas de suma, resta, producto o porcentaje, con la cautela de la precision de 0.42.
- Clasificacion de parrafos por articulo de origen en tareas de desambiguacion o atribucion de fuentes, con precision de 0.45 frente al 0.24 del azar.
- Prototipado e investigacion de arquitecturas de decision: servir como referencia reproducible de un modelo pointer bidireccional de 25 M de parametros entrenado desde cero por un unico autor.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de test (tareas no vistas):

| Familia de tarea | Precision | Azar | Tareas |
|---|---|---|---|
| Tipo de mensaje (6 clases) | 0.98 | 0.23 | 190 |
| Tema de dialogo (12 temas) | 0.89 | 0.22 | 870 |
| Articulo de Wikipedia (titulo enmascarado) | 0.45 | 0.24 | 779 |
| Aritmetica, mayor numero, paridad, secuencias, problemas | 0.42 | 0.28 | 1200 |
| Continuacion de respuesta en dialogo | 0.33 | 0.24 | 870 |
| Continuacion de linea de subtitulos | 0.30 | 0.26 | 1100 |
| Deberia rechazar la peticion | 0.67 | 0.50 | 24 |
| Deberia decir que no esta seguro | 0.65 | 0.50 | 26 |

Calibracion: temperatura T = 1.72 ajustada en validacion; el error de calibracion esperado (ECE) en test fue 0.030 antes y 0.033 despues, por lo que la temperatura no mejoro la calibracion en estas familias. El autor advierte que esta calibracion no se traslada a tareas arbitrarias. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (25 M de parametros, aproximadamente 100 MB de pesos mas activaciones y tokenizador); el repo completo ocupa 0.2 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo es viable en CPU para cargas moderadas.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o en CPU.
- Opciones de despliegue: el autor proporciona codigo standalone (`salgrai_decider.py`) que requiere `torch`, `tokenizers` y `safetensors`. No hay soporte para llama.cpp, Ollama ni vLLM, y el autor indica que no existe arquitectura GGUF compatible con un modelo bidireccional con cabeza pointer.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano y la unica pasada forward se espera latencia muy baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SalgrAI-Decider_1 | 25 M | 1024 | Decision bidireccional con cabeza pointer, ruso | no disponible | Hugging Face (pytorch, safetensors) |
| Jev (TypeSafe AI) | no disponible | no disponible | Modelo de decision / System One, mencionado como referencia conceptual | no disponible | no disponible |
| Modelos de clasificacion tipo BERT-base | ~110 M | 512 | Encoder bidireccional con cabeza de clasificacion | variable (MIT, Apache-2.0, etc.) | Hugging Face, ampliamente soportados |
| Modelos de eleccion multiple tipo DeBERTa-v3 | ~86-304 M | 512 | Encoder con cabeza multiple-choice | variable | Hugging Face |

La comparacion con Jev es solo conceptual: el autor declara que SalgrAI-Decider_1 es un desarrollo independiente y no una reproduccion. Frente a BERT o DeBERTa, este modelo es mucho mas pequeno (25 M frente a 86-304 M) y esta especializado en ruso, pero carece del ecosistema de herramientas y del soporte de licencia explicita de los modelos establecidos.

## Limitaciones y advertencias

- El propio autor advierte que el modelo solo es fiable en las familias de tareas con las que fue entrenado y que es poco fiable en cualquier otra.
- No debe usarse para moderacion ni para decisiones de seguridad.
- Las familias de rechazo y de incertidumbre se evaluaron con conjuntos de test muy pequenos (24 y 26 tareas), por lo que sus precisiones son solo indicativas.
- Las familias de continuacion de respuesta y de subtitulos estan cerca del azar (0.33 y 0.30 frente a 0.24 y 0.26), lo que limita su uso practico.
- La calibracion de probabilidades solo se valido en las familias de entrenamiento; no se traslada a tareas arbitrarias.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al entrenarse con datos sinteticos y de Wikipedia, puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: el modelo no genera texto, por lo que el riesgo se traslada a sobreconfianza en las probabilidades fuera de distribucion.
- Limitacion de contexto: 1024 tokens, insuficiente para dialogos o documentos largos.
- Limitacion de idioma: entrenado con texto y criterios en ruso; el rendimiento en ingles no esta documentado.
- Restricciones de licencia: la licencia no esta definida en la model card (el autor deja un TODO pendiente), lo que impide confirmar el uso comercial.
- Los distractores de las tareas de evaluacion pueden provenir de fuentes de entrenamiento, lo que podria inflar ligeramente las metricas.
- No hay soporte GGUF ni integracion con runners estandar, lo que complica el despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salgr/SalgrAI_Decider_1
- Version en ruso de la model card: README_RU.md dentro del repositorio del modelo
- Codigo de inferencia standalone: `salgrai_decider.py` dentro del repositorio del modelo
- Referencia conceptual (Jev, TypeSafe AI): no disponible en la informacion proporcionada
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada
