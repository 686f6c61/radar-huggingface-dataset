# PelaAI/KnowLine-4B-Gen3

## Resumen

KnowLine-4B-Gen3 es un modelo de decisiones de 4,66B parametros desarrollado por PelaAI, publicado bajo licencia Apache-2.0 y disponible en HuggingFace. No es un modelo generativo al uso: recibe un estado (un texto o una conversacion) y hasta 64 preguntas tipadas (si/no, eleccion entre k opciones o puntuacion sobre una rubrica), y devuelve para cada pregunta una distribucion de probabilidad sobre sus opciones. Cada pregunta se resuelve en un unico forward pass, sin generar texto, leyendo la probabilidad del token de etiqueta de cada opcion.

Se trata de la tercera version de la familia System One de PelaAI y esta construida sobre Qwen/Qwen3.5-4B mediante LoRA SFT (rango 32, alpha 64, solo el modelo de lenguaje), fusionada en pesos bf16. El modelo hereda del base la torre de vision y la cabecera MTP, aunque sus tareas publicadas son de clasificacion y decision, no de generacion. Los idiomas soportados son ingles, chino simplificado y chino tradicional.

Su relevancia actual radica en que, con solo 4B parametros, alcanza 63,11 en la suite publica de Decision Index 0.3, superando ligeramente a su predecesor Gen2 (62,54) y quedando por delante de modelos mucho mayores como Perplexity Decider v1.1 (27B, 62,25) o Clef (27B, 61,71). Ademas, toda la iteracion de entrenamiento fue ejecutada por un agente de IA que detectaba debilidades, generaba datos, entrenaba y aceptaba o rechazaba cambios segun la evidencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen/Qwen3.5-4B (con torre de vision y cabecera MTP del modelo base); ajuste LoRA sobre el modelo de lenguaje, fusionado en bf16 |
| Parametros totales | 4.659.865.088 (~4,66B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos distribuidos en bf16; SGLang carga en FP8 al vuelo. No se publican otros formatos cuantizados (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Ingles (en), chino simplificado (zh) y chino tradicional (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal (la etiqueta image-text-to-text y la mencion explicita a la torre de vision lo confirman) con una cabecera MTP. Sobre esa base se aplico un LoRA SFT de rango 32 y alpha 64, restringido al modelo de lenguaje, que despues se fusiono en pesos bf16. El resultado conserva la configuracion, el tokenizer y la plantilla de chat identicos a los de Gen1 y Gen2, de modo que la interfaz de servicio no cambia entre generaciones.

El entrenamiento de Gen3 se ejecuto en una unica maquina todo-en-uno y fue guiado por un agente de IA que, en cada ronda, localizaba las areas debiles del modelo, proponia un grupo de datos dirigido, lo construia y descontaminaba, entrenaba y evaluaba, y conservaba o descartaba el cambio segun la evidencia. Para esta version, el punto de partida era que Gen2 flaqueaba en conocimiento y razonamiento (42,7), por lo que se anadio un grupo de replay de conocimiento basado en items de eleccion multiple de splits publicos de entrenamiento (conocimiento general, ciencia, medicina, problemas matematicos y logica, en ingles y chino), descontaminados contra los benchmarks de Decision Index. El entrenamiento consistio en una epoca con decaimiento completo de la tasa de aprendizaje. Se compararon 13 candidatos con puntuaciones entre 62,54 y 63,25 en la suite publica 0.3, y se selecciono Gen3 por su rendimiento en las evaluaciones estilo Jev (JevBench 86,6, JevBench-hard 72,1), C-Eval (79,2) y generalizacion fuera de distribucion (Open-Jev 1.1 OOD 87,2), quedando dentro del ruido de la mejor puntuacion de la suite publica.

## Capacidades

- Decision tipada sobre estados: responde hasta 64 preguntas por estado con tres tipos de respuesta: si/no (noul), eleccion unica entre k opciones (choice) y puntuacion sobre una rubrica (rubric/score).
- Salida en forma de distribucion de probabilidad sobre las opciones, lo que permite usar el modelo como clasificador calibrado y no solo como etiquetador argmax.
- Un unico forward pass por pregunta, sin texto generado, lo que reduce la latencia frente a esquemas generativos.
- Clasificacion y decision en ingles y chino (simplificado y tradicional), con C-Eval 79,2 como referencia en chino.
- Capacidad de razonamiento sobre conocimiento general, ciencia, medicina, matematicas y logica, reforzada en Gen3 mediante replay de conocimiento.
- Tareas de implicacion textual y verificacion de fidelidad de contexto (NLI4CT 62,3, RAGTruth 56,8).
- Razonamiento de ejecucion de codigo sencillo (CRUXEval 44,0).
- Evaluacion de sentido comun y resolucion de referencias (WinoGrande 78,8).
- Compatibilidad directa con clientes Jev existentes: basta cambiar la URL base, y los usuarios de Gen1/Gen2 solo cambian el nombre del modelo.
- Soporte multimodal heredado del modelo base (torre de vision), aunque no se documentan tareas de vision especificas para esta version.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en el sentido clasico; el modelo no genera texto ni llamadas a herramientas.

## Casos de uso

- Clasificacion y enrutado en atencion al cliente: dado el estado de una conversacion, el modelo responde preguntas como "el tono del cliente es enfadado, neutro o contento" o "procede ofrecer reembolso", devolviendo una distribucion de probabilidad que permite fijar umbrales de derivacion a un agente humano.
- Deteccion de phishing y fraude: el modelo puntua en PhishNChips (92,0 en Gen3), por lo que puede usarse como filtro de decision sobre mensajes y URLs, aprovechando su formato de preguntas si/no.
- Verificacion de fidelidad en pipelines RAG: con RAGTruth (56,8) puede evaluar si una respuesta generada por otro modelo esta respaldada por el contexto recuperado, actuando como juez binario por fragmento.
- Evaluacion automatica con rubricas: el tipo de pregunta rubric permite puntuar respuestas de otro modelo segun criterios definidos, util en evaluacion de calidad o en anotacion asistida.
- Analisis de implicacion textual en dominios clinicos o cientificos: NLI4CT (62,3) lo hace apto para comprobar relaciones de entailment entre afirmaciones y evidencia.
- Agentes de decision en videojuegos o simulaciones: el arnes KOF '98 reporta 16-1-1 contra Jev 1.13 y 12-4-2 contra StartLux-Decision-4B en combates espejo, lo que demuestra su uso como politica de decision en entornos de estado discreto.
- Moderacion de contenido por categorias: al soportar eleccion entre k opciones, se puede configurar un conjunto de categorias de politica y dejar que el modelo devuelva la distribucion para decidir la accion.
- Migracion sin friccion desde Jev o desde Gen1/Gen2: al mantener interfaz, configuracion y plantilla de chat, se puede sustituir el endpoint sin reescribir el cliente.

## Benchmarks y rendimiento

Resultados declarados por el autor (self-run) sobre la suite publica de Decision Index 0.3 y evaluaciones propias:

| Benchmark | KnowLine-4B-Gen3 | KnowLine-4B-Gen2 | Notas |
|---|---|---|---|
| Decision Index 0.3 (suite publica) | 63,11 | 62,54 | Kit oficial, autoejecutado; la puntuacion completa 0.3 incluye tests privados no disponibles |
| Open-Jev 1.1 (test) | 88,4 | 87,4 | Evaluacion estilo Jev |
| Open-Jev 1.1 (OOD) | 87,2 | 86,6 | Generalizacion fuera de distribucion |
| JevBench | 86,6 | no disponible en el texto | Seleccionado como mejor de 13 candidatos |
| JevBench-hard | 72,1 | no disponible en el texto | Seleccionado como mejor de 13 candidatos |
| C-Eval | 79,2 | 78,6 | Evaluacion en chino |
| NLI4CT | 62,3 | 57,6 | Mayor ganancia de la version |
| CRUXEval | 44,0 | 38,8 | Razonamiento de ejecucion de codigo |
| WinoGrande | 78,8 | 73,8 | Split de entrenamiento presente en los datos |
| RAGTruth | 56,8 | 53,3 | Fidelidad de contexto |
| GSM8K | 61,5 | 58,0 | Split de entrenamiento presente en los datos |
| BPoMP | 54,5 | 59,4 | Empeoro en Gen3 |
| PhishNChips | 92,0 | 95,0 | Empeoro en Gen3 |
| Brier score | ~0,31-0,33 | no disponible | Calculado al estilo del board; aproximadamente 3.o de 114 modelos |
| ECE | ~0,07-0,08 | no disponible | Mediana del board 0,084 |

Comparativa con otros modelos en la suite publica Decision Index 0.3:

| Modelo | Tamano | DI 0.3 publica | DI 0.3 completa | Fuente |
|---|---|---|---|---|
| KnowLine-4B-Gen3 | 4B | 63,11 | no puntuada aun | self-run, kit oficial |
| KnowLine-4B-Gen2 | 4B | 62,54 | no puntuada aun | self-run, kit oficial |
| KnowLine-4B-Gen1 | 4B | 60,47 | no puntuada aun | self-run, kit oficial |
| Perplexity Decider v1.1 | 27B | 62,25 | 62,75 | board |
| Clef | 27B | 61,71 | 53,08 | board |
| Jev 1.13 | API | 57,96 | 60,11 | board |
| RSI-Jev v6.1-VL | 4B | 50,98 | no listada | self-reported |
| ezjev 4B s2 | 4B | 50,82 | 46,95 | board |
| jiwo 4B | 4B | 45,76 | 42,86 | board |

Arnes de juego KOF '98 (combates espejo a un asalto): 16-1-1 frente a Jev 1.13 y 12-4-2 frente a StartLux-Decision-4B.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 4,66B parametros; no publicada por el autor): en bf16 los pesos ocupan aproximadamente 9,3 GB, mas el espacio de activaciones y cache de clave-valor; en FP8 el peso se reduce a unos 4,7 GB.
- GPU recomendadas: A100, H100, L40S o similares para servicio en produccion con concurrencia; tarjetas de 24 GB (RTX 4090, RTX 3090) son suficientes para inferencia en bf16 o FP8 de una sola instancia.
- Cabe en GPU de consumo? Si, en GPUs de 12-16 GB o mas en FP8 o bf16, aunque con margen ajustado segun la longitud de contexto y el tamano de lote. El dato exacto de contexto no esta disponible.
- Opciones de despliegue: SGLang 0.5.21 con transformers 5.12.1 (recomendado, carga en FP8 y expone el endpoint /v1/systemone en el puerto 8080, con el backend en el 9080) o, alternativamente, el backend HF puro mediante `python knowline_server.py --model PelaAI/KnowLine-4B-Gen3 --backend hf --port 8080`, que es mas lento y funciona en bf16.
- Latencia y throughput estimados: no disponibles. El autor no publica medidas de rendimiento; solo indica que el backend HF es mas lento que SGLang.

## Comparativa con modelos similares

| Modelo | Parametros | DI 0.3 publica | Licencia / disponibilidad | Enfoque |
|---|---|---|---|---|
| KnowLine-4B-Gen3 | 4B | 63,11 | Apache-2.0, pesos abiertos en HF | Modelo de decision System One sobre Qwen3.5-4B |
| KnowLine-4B-Gen2 | 4B | 62,54 | Apache-2.0, pesos abiertos en HF | Version anterior de la misma familia |
| Perplexity Decider v1.1 | 27B | 62,25 | no disponible en la informacion proporcionada | Modelo de decision de mayor tamano |
| Clef | 27B | 61,71 | no disponible en la informacion proporcionada | Modelo de decision de mayor tamano |
| Jev 1.13 | API | 57,96 | API propietaria | Servicio de decision por API |
| ezjev 4B s2 | 4B | 50,82 | no disponible en la informacion proporcionada | Alternativa abierta de 4B |

KnowLine-4B-Gen3 destaca por ofrecer una puntuacion publica superior a modelos de 27B con una fraccion de los parametros, aunque la puntuacion completa de Decision Index 0.3 (que anade tests privados) aun no esta disponible para ninguno de los modelos KnowLine.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni respuestas abiertas; su salida son distribuciones de probabilidad sobre opciones predefinidas.
- Idiomas limitados a ingles y chino (simplificado y tradicional). No hay soporte declarado de espanol ni de otras lenguas, lo que restringe su uso directo en mercados hispanohablantes.
- Longitud de contexto no disponible, lo que dificulta planificar escenarios con estados muy largos.
- Sensibilidad a instrucciones plantadas en el estado: segun el autor, las instrucciones insertadas cambian la respuesta en un 3,4% de los casos (mejora frente al 4,0% de Gen2), pero sigue siendo un vector de manipulacion a considerar.
- Calibracion moderada: Brier ~0,31-0,33 y ECE ~0,07-0,08. Las probabilidades no deben tratarse como certezas absolutas sin umbrales de decision.
- Conocimiento y razonamiento historicamente debiles: el autor situa la debilidad de Gen2 en 42,7 y reconoce que el replay de conocimiento solo subio ligeramente esa area.
- Degradacion en algunas tareas: BPoMP cae de 59,4 a 54,5 y PhishNChips de 95,0 a 92,0 respecto a Gen2.
- Riesgo de alucinacion en tareas de verificacion (RAGTruth 56,8, NLI4CT 62,3): no es fiable como unico arbitro de veracidad en produccion.
- Sesgos: no se documenta ninguna evaluacion de sesgos demograficos, sociales o culturales; el modelo hereda los sesgos del corpus de Qwen3.5 y de los datos de replay.
- Licencia Apache-2.0, que permite uso comercial, modificacion y redistribucion sin royalties, siempre que se conserve el aviso de licencia.
- Adopcion muy baja: 10 descargas y 0 likes en el momento de la ficha, lo que implica poca validacion externa independiente de los resultados declarados.
- Los resultados de Decision Index y de JevBench son autoejecutados por el autor, no verificados por un tercero.
- Dependencia de versiones concretas del stack (SGLang 0.5.21, transformers 5.12.1); el backend HF alternativo es mas lento.
- El modelo se declara independiente y no afiliado a TypeSafe ni a Jev.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PelaAI/KnowLine-4B-Gen3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Version anterior (Gen2): https://huggingface.co/PelaAI/KnowLine-4B-Gen2
- Guia de inferencia: INFERENCE.md (en el repositorio del modelo)
- Version en chino de la model card: README.zh.md (en el repositorio del modelo)
- Script de servicio SGLang: serve_knowline.sh (en el repositorio del modelo)
- Servidor de referencia: knowline_server.py (en el repositorio del modelo)
- No se han encontrado enlaces adicionales relevantes en la busqueda web; los resultados devueltos corresponden a la actriz Jane Perry y no guardan relacion con el modelo.
