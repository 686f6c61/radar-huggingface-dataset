# Muesli-HQ/qwen35-0.8b-muesli-cleanup-v15-bf16

## Resumen

El modelo `Muesli-HQ/qwen35-0.8b-muesli-cleanup-v15-bf16` es un ajuste fino completo de `Qwen/Qwen3.5-0.8B` (752.393.024 parametros segun los pesos en safetensors) especializado en una unica tarea: la limpieza de transcripciones de dictado por voz. Desarrollado por Muesli-HQ para su aplicacion de dictado en macOS, recibe la salida cruda de un sistema de reconocimiento de voz (ASR) y, opcionalmente, contexto de la aplicacion en pantalla, y devuelve el texto que el hablante habria escrito a mano. No es un modelo conversacional general: es un componente de postprocesado dentro de un pipeline de voz a texto.

La tarea concreta que resuelve es la de convertir habla transcrita en texto tipado: corrige errores evidentes de reconocimiento, elimina muletillas, aplica autocorrecciones explicitas e implicitas ("ten requests a minute, make that five" pasa a "5 requests a minute"), da formato a correos electronicos con saludo y despedida, convierte enumeraciones de tres o mas elementos en listas dentro de notas, correos y prompts, y normaliza numeros, importes, identificadores, telefonos y terminos tecnicos a su forma escrita. Mantiene los mensajes personales como prosa y no parafrasea ni reescribe el contenido.

Es relevante ahora porque demuestra que un modelo de menos de 1.000 millones de parametros, con un ajuste fino bien dirigido sobre 170.350 pares de limpieza, puede superar en su tarea especifica a versiones anteriores de 2B del mismo linaje, con latencias subsegundo en hardware Apple Silicon. La licencia Apache 2.0 y el formato bf16 lo hacen directamente desplegable en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`qwen3_5_text`, `AutoModelForCausalLM`) |
| Parametros totales | 752.393.024 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; el entrenamiento uso longitud maxima 2.048 y la inferencia limita a 1.024 tokens nuevos |
| Tipos de cuantizacion | Pesos publicados en bf16; existe una variante MLX 8-bit del mismo autor |
| Idiomas soportados | Ingles unicamente (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 1,4 GB); variante MLX 8-bit en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de la familia Qwen 3.5, y se somete a un ajuste fino completo de todos los pesos (no LoRA ni adaptadores). El entrenamiento se realizo con transformers 5.20, pesos maestros en fp32, optimizador AdamW, tasa de aprendizaje 1e-5 con 200 pasos de calentamiento, tamano de lote efectivo 16, longitud maxima de 2.048 tokens y calculo de la perdida solo sobre la respuesta. Una epoca equivale a 10.647 pasos en una unica A100, con un tiempo total de 3,7 horas. La perdida final de evaluacion fue 0,172, aunque el autor advierte que la particion de evaluacion conserva objetivos con el estilo antiguo (v14), por lo que no es comparable con las perdidas de la version anterior.

Los datos de entrenamiento son el conjunto **blend-v15**: 170.350 pares de limpieza que cubren correo electronico, chat, documentos, prompts para agentes de IA, codigo, hojas de calculo y presentaciones, cajas de busqueda y dictados largos. Los pares fueron generados por modelos abiertos en Fireworks (DeepSeek, MiniMax) y por Claude, y verificados por jueces de otra familia (GLM 5.3, Kimi K3/K3.1). blend-v15 deriva de blend-v14 con una especificacion escrita revisada: se reescribieron y reverificaron unos 18.000 objetivos de v14 y se anadieron 15.354 filas nuevas para las reglas nuevas (listas en correos y prompts, diseno de correo, parrafos en dictados largos, aperturas discursivas conservadas, autocorrecciones implicitas, eliminacion del "like" aproximativo, formatos de moneda, identificador, telefono y terminos tecnicos, y reparacion de ciertos errores de ASR). No se uso ningun clip ni texto de Voice Arena para el entrenamiento.

No se documentan innovaciones arquitectonicas propias: el valor del modelo esta en el ajuste fino y en el diseno del prompt de inferencia, que debe reproducirse exactamente como en entrenamiento (un unico turno de usuario, sin mensaje de sistema, decodificacion voraz con temperatura 0 y `top_k=1`, sin penalizacion de repeticion, maximo 1.024 tokens nuevos y parada en `<|im_end|>`).

## Capacidades

- Limpieza de transcripciones ASR: correccion de errores evidentes de reconocimiento sin parafrasear ni reescribir el contenido.
- Eliminacion de muletillas ("um", "uh", "like") y aplicacion de borrados explicitos del tipo "scratch that".
- Aplicacion de autocorrecciones explicitas e implicitas, incluyendo la sustitucion de cantidades ya dichas.
- Formato de correo electronico: linea de saludo, parrafos y despedida.
- Conversion de enumeraciones de tres o mas elementos en listas con vinetas o numeradas en notas, correos, prompts de IA y chat de trabajo.
- Conservacion de mensajes personales como prosa, sin forzar formato de lista.
- Normalizacion de numeros, importes, identificadores, telefonos y terminos tecnicos a su forma escrita ("PR #4821", "$2,400", "(312) 555-0147", "v5").
- Uso opcional de contexto de aplicacion en pantalla (`<APP-CONTEXT>`: aplicacion enfocada, campo de documento, texto OCR) para resolver errores de nombres, siglas y formato, sin copiar ese contexto a la salida.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo de una sola pasada de limpieza.
- No soporta vision, audio ni otros idiomas distintos del ingles.
- No es un reconocedor de voz: requiere una transcripcion ASR previa como entrada.

## Casos de uso

- Dictado en macOS dentro de la aplicacion Muesli: el modelo actua como etapa final del pipeline, tomando la salida del ASR (por ejemplo, Parakeet) y devolviendo el texto que el usuario habria tecleado, con una latencia mediana de 0,67 s por fila en un Apple M5 con la variante MLX 8-bit.
- Redaccion de correos por voz: el modelo aplica estructura de correo (saludo, parrafos, despedida) y convierte enumeraciones dictadas en listas, lo que resulta adecuado porque su especificacion de entrenamiento incluye explicitamente el diseno de correo electronico.
- Notas de reunion y documentos largos: con entradas de hasta 2.048 tokens en entrenamiento, puede segmentar dictados largos en parrafos y conservar aperturas discursivas, util para actas y resumenes dictados.
- Prompts para herramientas de IA dictados en voz alta: convierte la enumeracion hablada de requisitos en listas estructuradas dentro del prompt, manteniendo el fraseo original del hablante.
- Mensajeria de trabajo (Slack, Teams y similares): formatea listas de tareas y normaliza identificadores tecnicos e importes, manteniendo los mensajes personales como prosa.
- Rellenado de campos con datos sensibles al formato: numeros de telefono, identificadores, versiones y cantidades monetarias se escriben en su forma tipada, lo que reduce errores en formularios y cajas de busqueda.
- Integracion en pipelines de accesibilidad: cualquier aplicacion de escritorio que ya disponga de ASR puede insertar este modelo como postprocesador de 752 millones de parametros, con la salvaguarda de pegar la transcripcion cruda si la salida es vacia, alcanza el limite de tokens o supera tres veces la longitud de la entrada.

## Benchmarks y rendimiento

Resultados publicados por el autor con la variante MLX 8-bit, una peticion a la vez:

| Modelo | v15 held-out (258): WER % / exact % | Mediana s/fila | Voice Arena (151 clips): ZER % / AMEND % |
|---|---|---|---|
| Este modelo (v15) | 1,21 / 46,1 | 0,67 | 65,6 / 0,79 |
| Qwen3.5 2B v14 (version anterior) | 3,38 / 19,0 | 1,53 | 64,2 / 0,92 |
| Qwen3.5 0.8B v14 (version anterior) | 4,00 / 17,8 | 0,71 | 57,6 / 1,42 |
| ASR crudo, sin limpieza | no disponible | no disponible | 54,3 / 1,23 |

Notas sobre la medicion: el conjunto v15 held-out consta de 258 filas en 11 categorias, escritas por Kimi K3.1 Pro (familia no usada para generar filas de entrenamiento), aceptadas por GLM 5.3 y conservadas solo si superaban una revision estricta de Claude (258 de 417); no son dictados reales de usuarios. Voice Arena Dictation Bench usa solo la particion publica (151 de 761 clips, no es un envio al leaderboard), con transcripciones del ASR unificado Parakeet de Muesli y este modelo sin contexto de pantalla, evaluado con el juez AMEND del bench mediante un unico juez Claude Opus 5.5 (el leaderboard usa mayoria de 3 de 5). ZER es el porcentaje de clips que no requieren ninguna edicion y AMEND la proporcion de caracteres editados por el juez. Los intervalos de confianza del 95 % agrupados por hablante son de aproximadamente +/-7 puntos ZER. La velocidad se midio con MLX Swift 8-bit en un Apple M5 con prompts de aproximadamente 550 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en bf16 solo para pesos, mas cache KV y activaciones; en la practica, entre 2 y 3 GB para secuencias de 1.024 tokens nuevos. La variante MLX 8-bit reduce los pesos a aproximadamente 0,75 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria para bf16; una A100, H100 o L40S permite servir muchas peticiones concurrentes con vLLM o TGI. El autor entreno en una unica A100 durante 3,7 horas.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y en cualquier Apple Silicon con al menos 8 GB de memoria unificada.
- Opciones de despliegue: transformers 5.20 con `AutoModelForCausalLM` (via oficial), MLX Swift para aplicaciones nativas de Apple Silicon, llama.cpp u Ollama si se genera una cuantizacion GGUF (no publicada por el autor), y vLLM o TGI para servicio concurrente con el prompt exacto de entrenamiento.
- Latencia y throughput: mediana de 0,67 s por fila en Apple M5 con MLX 8-bit y prompts de unos 550 tokens, una peticion a la vez. No se han publicado cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en limpieza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-0.8b-muesli-cleanup-v15-bf16 | 752 M | hasta 2.048 en entrenamiento | WER 1,21 / exact 46,1 en v15 held-out; ZER 65,6 en Voice Arena | Apache 2.0 | Hugging Face (bf16 y MLX 8-bit) |
| Qwen3.5 0.8B v14 (Muesli) | 0,8 B | no disponible | WER 4,00 / exact 17,8; ZER 57,6 | Apache 2.0 | Hugging Face (version anterior) |
| Qwen3.5 2B v14 (Muesli) | 2 B | no disponible | WER 3,38 / exact 19,0; ZER 64,2 | Apache 2.0 | Hugging Face (version anterior) |
| ASR crudo sin limpieza | no aplica | no aplica | ZER 54,3 | no aplica | linea base |

La comparacion con modelos genericos de la misma talla (por ejemplo, Qwen3.5-0.8B sin ajustar) no esta disponible en la informacion proporcionada, porque el modelo base no ha sido evaluado por el autor en esta tarea.

## Limitaciones y advertencias

- Solo ingles: no procesa ni limpia transcripciones en castellano ni en otros idiomas.
- No es un reconocedor de voz: necesita una transcripcion ASR previa; no acepta audio.
- Riesgo de alucinacion y de sobreformateo: la version v15 formatea mas que v14 (listas, parrafos, digitos), y por eso obtiene puntuaciones mas bajas en conjuntos de prueba antiguos escritos con las reglas de v14. Puede introducir cambios de formato no deseados en entradas ambiguas.
- El prompt debe coincidir exactamente con el de entrenamiento (un turno de usuario, sin mensaje de sistema, decodificacion voraz, parada en `<|im_end|>`); desviarse de ese formato degrada la calidad de forma no documentada.
- El autor recomienda una salvaguarda en la aplicacion: si la salida es vacia, alcanza el limite de tokens o supera tres veces la longitud de la entrada, pegar la transcripcion cruda en lugar de la salida del modelo.
- El contexto de aplicacion (`<APP-CONTEXT>`) debe recortarse a 1.200 caracteres; el modelo puede filtrar contenido de ese contexto a la salida si no se controla, aunque el prompt se lo prohibe.
- Los benchmarks proceden de conjuntos sinteticos escritos por modelos (no dictados reales) y de una particion publica parcial de Voice Arena con un unico juez, no del leaderboard oficial; los intervalos de confianza son amplios (aproximadamente +/-7 puntos ZER).
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no se documentan garantias ni clausulas adicionales sobre los datos de entrenamiento mas alla de la licencia del modelo base.
- No se documentan sesgos especificos, pero al ser un ajuste sobre datos generados por modelos, puede heredar sesgos de esos generadores en nombres, acronimos y terminos tecnicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muesli-HQ/qwen35-0.8b-muesli-cleanup-v15-bf16
- Variante MLX 8-bit: https://huggingface.co/Muesli-HQ/qwen35-0.8b-muesli-cleanup-v15-mlx-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
