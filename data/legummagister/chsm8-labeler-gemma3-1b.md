# LegumMagister/chsm8-labeler-gemma3-1b

## Resumen

chsm8-labeler-gemma3-1b es un ajuste fino completo (full fine-tune, sin LoRA) de google/gemma-3-1b-it, desarrollado por el usuario LegumMagister, que convierte una partida de ajedrez (jugadas en notacion algebraica mas una tarjeta de 16 caracteristicas medidas sobre el tablero) en cinco instrucciones de estilo en lenguaje natural, una por cada banda de longitud: dos etiquetas "terse" de 3 a 6 palabras, una "short" de una frase, una "medium" de una frase larga y una "long" de una o dos frases.

El modelo nace de un proceso de destilacion: se entreno durante una epoca sobre 3,02 millones de conjuntos de etiquetas generados por un professor de 31B (identificado en la model card como Gemma-4-31B), recogidos en el dataset LegumMagister/chsm8-labeler-distill y divididos por partida para evitar fuga de datos. El objetivo es sustituir una tarea de etiquetado que el profesor resuelve a unos 7,4 registros por segundo en 4 GH200 en FP8 por un estudiante de 999.885.952 parametros que alcanza unas 154 partidas por segundo en una sola GH200 con vLLM, es decir, un orden de magnitud mas de rendimiento por GPU.

Su relevancia practica es acotada pero clara: es un componente especializado para anotar estilos de juego a escala sobre bases de datos de ajedrez, no un modelo de proposito general. Mantiene la calidad de destilacion del profesor (94% segun la metrica propia del autor), iguala su precision de anclaje de afirmaciones (88,2% frente a 88,3%) y solo necesut a 1B de parametros, lo que lo hace desplegable en una unica GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, tag `gemma3_text`) |
| Parametros totales | 999.885.952 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card para el modelo ajustado; las entradas se truncan a los ultimos 2048 tokens y la configuracion de vLLM del autor usa `max_model_len=2560`. El modelo base Gemma 3 1B soporta 32.768 tokens segun la documentacion de Gemma 3 |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni FP8 propias) |
| Idiomas soportados | Ingles unicamente (declarado en la seccion de limitaciones) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (tamano del repositorio: 2,0 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3, en su variante de texto (`gemma3_text`), partiendo de google/gemma-3-1b-it. No se trata de un modelo multimodal: la variante de 1B de Gemma 3 es solo texto, y el ajuste se hace sobre el checkpoint instruct ya entrenado. El entrenamiento es un fine-tune completo de todos los parametros, no un adaptador LoRA, con AdamW (betas 0,9 y 0,95), learning rate 5e-5, 200 pasos de warmup, decaimiento coseno hasta el 10% del valor inicial, clipping de gradiente a 1,0 y autocast en bf16. El batch se construye agrupando por longitud, con 16.384 tokens con padding por GPU, repartido en 4 GPU mediante DDP en un unico nodo con 4x GH200. La funcion de perdida es entropia cruzada calculada exclusivamente sobre los tokens de las etiquetas, no sobre la entrada. El tiempo final de entrenamiento figura como marcador de posicion ("FINAL_TRAIN_HOURS h") en la model card, por lo que no se conoce la duracion exacta.

Los datos son 3,02 millones de conjuntos de etiquetas generados por el profesor de 31B, consumidos en una sola epoca y divididos por partida para que ninguna partida aparezca a la vez en entrenamiento y evaluacion. La innovacion principal no es arquitectonica sino de destilacion de tarea: se traslada al estudiante una habilidad de anotacion estilistica que depende de leyendas textuales medidas sobre el tablero (desarrollo de piezas, enroque, capturas, sacrificios, presion sobre el rey, cambios de damas, proporcion de final, rating de los jugadores), y se evalua con metricas especificas: porcentaje de etiquetas contradichas por la tarjeta medida, precision de anclaje de afirmaciones extraidas por Qwen3-32B sobre 12 ejes de estilo, y una medida de destilacion basada en el kappa de Cohen frente al profesor, normalizada por la autoconsistencia del propio profesor. Una particularidad operativa es que el modelo no usa plantilla de chat: la entrada es texto plano con el bloque de partida seguido de la linea de cabecera `### STYLE LABELS`.

## Capacidades

- Generacion de etiquetas de estilo de ajedrez en cinco bandas de longitud fija y en un orden fijo (dos `terse`, una `short`, una `medium`, una `long`), terminadas en EOS.
- Condicionamiento sobre estadisticas medidas del tablero: el modelo integra en su salida referencias a desarrollo, enroque, capturas, sacrificios, presion sobre el rey y estructura de final presentes en la tarjeta de entrada.
- Comprension de notacion algebraica estandar y de partidas completas de ajedrez clasico, con entrada truncada a los ultimos 2048 tokens.
- Generacion determinista: el autor recomienda temperatura 0, de modo que el modelo se comporta como un etiquetador reproducible y no como un generador creativo.
- Capacidad de anotacion a alta tasa de transferencia: unas 154 partidas por segundo en una GH200 con vLLM, con lotes de hasta 320 tokens de salida por partida.
- No dispone de tool calling, function calling, modo de razonamiento explicito, soporte de agentes, vision, audio ni capacidades multilingues mas alla del ingles.
- Inferencia por lote eficiente gracias a que la salida esta acotada en longitud, lo que la hace apta para procesar corpus masivos.

## Casos de uso

- Anotacion masiva de bases de datos de ajedrez: el modelo puede etiquetar millones de partidas de repositorios tipo Lichess con descripciones de estilo, a 154 partidas por segundo por GPU, para construir indices de busqueda por estilo de juego.
- Filtrado y busqueda semantica de partidas: una vez generadas las etiquetas, es posible indexar partidas por rasgos como "prioriza material y simplifica" o "ataca el enroque", lo que habilita consultas textuales sobre corpus historicos de partidas.
- Generacion de comentarios para plataformas de ajedrez: las etiquetas de estilo sirven como borrador o como entrada condicionante de un comentarista automatico que redacte resumenes de partida para el usuario final.
- Informes de scouting de jugadores: analizando todas las partidas de un jugador en una base de datos, las etiquetas agregadas permiten construir un perfil estilistico textual con evidencia medida sobre el tablero, util para entrenadores y analistas.
- Preparacion de repertorio y analisis prepartida: un motor de analisis puede recuperar las etiquetas de las partidas recientes de un rival para anticipar si tiende a simplificar, a entrar en finales o a atacar el enroque, apoyandose en el grounding estadistico del modelo.
- Docencia y entrenamiento de ajedrez: las etiquetas en cinco longitudes permiten generar explicaciones de estilo a distintos niveles de detalle sin coste de inferencia de un modelo grande, gracias a que cabe en una GPU de consumo.
- Generacion de datos de entrenamiento para modelos mayores o para clasificadores de estilo: el propio autor lo usa como destilador, y el modelo puede servir como anotador barato para crear datasets de estilo en otros dominios de analisis deportivo con estructura similar.
- Evaluacion comparativa de tecnicas de destilacion: al publicarse la tabla comparativa con candidatos de 270M a 31B y con enfoques encoder-decoder, el modelo sirve como punto de referencia reproducible para estudiar compromisos entre calidad y latencia en tareas de etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Si se publican las metricas propias de la tarea, medidas sobre 384 partidas de test no vistas en entrenamiento, con todos los candidatos entrenados durante 65 minutos sobre las mismas etiquetas del profesor y evaluados en una GH200:

| Modelo | Etiquetas contradichas | Anclaje de afirmaciones | Destilacion | Velocidad (partidas/s) |
|---|---:|---:|---:|---:|
| Gemma-4-31B (profesor) | 4,7% | 88,3% | 100% (techo) | ~7 (4 GPU, FP8) |
| chsm8-labeler-gemma3-1b (full FT) | 4,7% | 88,2% | 94% | 154 |
| Gemma-3-270M (full FT) | 5,4% | 88,3% | 90% | 193 |
| T5Gemma 2B-2B (enc-dec, LoRA) | 5,5% | 87,4% | 94% | ~23 (HF) |
| Qwen3-8B (LoRA) | 4,0% | 87,9% | 92% | ~40 |
| Gemma-4-E4B (LoRA) | 4,0% | 89,2% | 87% | ~59 |
| T5Gemma 9B-2B (LoRA) | 4,3% | 87,3% | 86% | no disponible |

Notas sobre las metricas: "etiquetas contradichas" es la proporcion de etiquetas cuya afirmacion (sacrificio, ataque al rey, desarrollo, etc.) contradice la tarjeta medida, verificada por expresion regular; "anclaje de afirmaciones" es la proporcion de afirmaciones comprobables contra la tarjeta que esta respalda, extraidas por Qwen3-32B sobre 12 ejes de estilo; "destilacion" es el kappa de Cohen entre las afirmaciones del estudiante y las del profesor en la misma partida, menos el de otra partida, dividido por la misma diferencia para una segunda anotacion independiente del propio profesor. Se probaron tambien LLaDA-8B (modelo de difusion, 89-91% de tasa de parseo y 0,14 partidas/s) y FLAN-T5/UL2 (peor perdida), y ambos se descartaron.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2,0 GB de pesos (999,9M de parametros), mas cache KV. Con `max_model_len=2560` el cache KV es reducido, por lo que un despliegue con lotes moderados cabe en el entorno de 4-6 GB.
- Cuantizacion en 8 bits: alrededor de 1,0 GB de pesos; en 4 bits, alrededor de 0,6 GB. No se publican pesos cuantizados oficiales, por lo que habria que generarlos.
- GPU recomendadas: GH200 es la plataforma de referencia del autor (154 partidas/s con vLLM). Cualquier GPU con 8 GB o mas es suficiente: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, L40S, A10G, A100 y H100.
- Si cabe en GPU de consumo: si, con holgura. Incluso en fp32 (~4 GB de pesos) cabe en GPU de consumo con 8 GB o mas.
- Opciones de despliegue: vLLM es la via soportada y documentada por el autor, con soporte nativo del modelo; tambien es posible usar transformers con el checkpoint safetensors, y servidores compatibles con arquitecturas decoder-only estandar (por ejemplo TGI). No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: aproximadamente 154 partidas por segundo en una GH200 con vLLM segun el autor, frente a 7,4 registros por segundo del profesor de 31B en 4 GH200 en FP8 y unas 23 partidas por segundo del encoder-decoder T5Gemma 2B-2B en transformers. La latencia por partida depende del tamano de lote; con salidas limitadas a 320 tokens, el cuello de botella es el prefill de la entrada (media de unos 650 tokens, maximo 2048).

## Comparativa con modelos similares

Como la tarea es de anotacion de estilo de ajedrez, la comparativa natural son los candidatos que el propio autor evaluo en el mismo protocolo, mas el modelo base:

| Modelo | Parametros | Ajuste | Contexto de uso | Destilacion | Velocidad | Licencia |
|---|---|---|---:|---:|---:|---|
| chsm8-labeler-gemma3-1b | 1,0B | full fine-tune | 2048 tokens de entrada | 94% | 154 partidas/s | gemma |
| Gemma-3-270M (full FT) | 0,27B | full fine-tune | no disponible | 90% | 193 partidas/s | gemma |
| Qwen3-8B (LoRA) | 8B | LoRA | no disponible | 92% | ~40 partidas/s | apache-2.0 (Qwen3) |
| Gemma-4-E4B (LoRA) | no disponible | LoRA | no disponible | 87% | ~59 partidas/s | gemma (segun el autor) |
| T5Gemma 2B-2B (LoRA) | 2B | LoRA, encoder-decoder | no disponible | 94% | ~23 partidas/s (HF) | gemma (segun el autor) |
| google/gemma-3-1b-it | 1,0B | modelo base instruct | 32.768 tokens (documentacion de Gemma 3) | no aplica | no disponible | gemma |

Frente al modelo base, este ajuste sustituye la capacidad generalista de instrucciones por una tarea muy estrecha; no conserva de forma fiable el comportamiento conversacional original, ya que se entrena con entradas de texto plano sin plantilla de chat y solo con perdida sobre las etiquetas. Frente a Qwen3-8B con LoRA, el modelo aqui descrito obtiene mejor puntuacion de destilacion (94% frente a 92%) con una octava parte de parametros y aproximadamente 4x mas velocidad, aunque Qwen3-8B logra menos etiquetas contradichas (4,0% frente a 4,7%). Frente a T5Gemma 2B-2B, empata en destilacion (94%) pero es unas 7x mas rapido porque vLLM lo soporta de forma nativa, mientras que el encoder-decoder requeriria un motor a medida.

## Limitaciones y advertencias

- Alucinacion de estilo: el propio autor estima que aproximadamente 1 de cada 20 etiquetas contiene afirmaciones que la partida no respalda, una tasa equivalente a la de su profesor de 31B.
- Evaluacion basada en estadisticas medidas, no en analisis de motor: las descripciones se verifican contra la tarjeta de caracteristicas del tablero, no contra un motor de ajedrez, por lo que una etiqueta puede ser textualmente coherente y aun asi ajedrecisticamente discutible.
- Idioma: solo ingles. No se ha entrenado ni evaluado en castellano ni en otros idiomas, por lo que no debe esperarse una salida multilingue.
- Dominio restringido: solo ajedrez estandar y entrenado con partidas clasicas de Lichess. No cubre variantes (ajedrez 960, bullet con reglas especiales), ni otros juegos, ni dominios de analisis deportivo distintos.
- Formato de entrada rigido: requiere el bloque de partida completo mas la tarjeta de caracteristicas medida; sin esas estadisticas el modelo carece de la evidencia sobre la que se condiciono. Las entradas se truncan a los ultimos 2048 tokens, con una media de unos 650, de modo que partidas muy largas con cabecera extensa pueden perder contexto inicial.
- Sesgo de datos: al derivar de partidas clasicas de Lichess y de las etiquetas de un unico modelo profesor, hereda los sesgos de estilo, nivel de juego y demografia de esa plataforma, y cualquier sesgo propio del profesor.
- Sin datos reproducibles de entrenamiento: la model card deja marcadores de posicion en el tiempo de entrenamiento ("FINAL_TRAIN_HOURS h") y en la tabla de resultados ("FINAL_RESULTS_TABLE"), y no aporta referencia publica del modelo profesor de 31B, lo que limita la reproducibilidad.
- Licencia: se hereda la licencia Gemma, con sus terminos de uso y sus clausulas de uso prohibido. Es responsabilidad del integrador revisar las condiciones antes de un uso comercial, especialmente si se redistribuyen pesos derivados.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay senales de mantenimiento posterior a la creacion (30 de septiembre de 2026, con actualizacion el mismo dia), por lo que no hay garantia de soporte ni de correccion de errores.
- Produccion: al ser una tarea de etiquetado con salida de formato fijo, conviene validar el parseo (cinco lineas, orden y bandas de longitud) y aplicar verificacion automatica contra la tarjeta medida antes de consumir las etiquetas en cualquier pipeline downstream.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LegumMagister/chsm8-labeler-gemma3-1b
- Dataset de destilacion: https://huggingface.co/datasets/LegumMagister/chsm8-labeler-distill
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Pagina del autor en Hugging Face: https://huggingface.co/LegumMagister
- Gemma 3 model card (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_3
- Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Gemma 3 Technical Report (arXiv): https://arxiv.org/html/2503.19786
