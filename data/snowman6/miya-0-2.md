# snowman6/Miya-0.2

## Resumen

Miya-0.2 es un modelo encoder de 139 millones de parámetros desarrollado por snowman6 (snowman6-git) que actúa como motor de decisión de un agente de Minecraft en coreano. No es un modelo generativo: recibe una frase del jugador junto con el estado del mundo y una batería de opciones candidatas, y devuelve clasificaciones (intención, tipo de tarea, método elegido, prioridad de supervivencia, decisiones de inventario) y extracción de spans (objetivo, cantidad, herramienta, persona, coordenadas, lugar, distancia). La premisa del proyecto es que el bot de mineflayer solo ejecute, mientras que toda la decisión recae en el modelo.

Técnicamente es un transformer encoder de estilo mmBERT con 22 capas, afinado a partir del encoder de convaiinnovations/laya-multilingual, con todas las cabezas creadas desde cero. El autor podó el vocabulario de 256.000 a 29.252 tokens, reduciendo el modelo de 312M a 139M de parámetros, y mantiene el tokenizador original con un búfer de remapeo de identificadores dentro del modelo. La entrada sigue un esquema tipo GLiNER2: cada opción o etiqueta se coloca como texto con un token `[MASK]` y una única pasada de codificación produce todas las puntuaciones.

Su relevancia es doble: por un lado demuestra un pipeline neuro-simbólico donde un planner calcula hechos (recetas, tiempos de minado, alturas de mineral) y el modelo solo elige entre candidatos; por otro, introduce un mecanismo de memoria episódica llamado QED (Quasi-Evolutionary Diary) que inyecta experiencia acumulada como texto en la entrada. Es un snapshot de investigación marcado explícitamente como trabajo en curso. La longitud de contexto no está especificada en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT, 22 capas) con cabezas de clasificación de opciones y extracción de spans, esquema de entrada tipo GLiNER2 |
| Parametros totales | 139M (reducidos desde 312M mediante poda de vocabulario de 256.000 a 29.252 tokens) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos entrenados y servidos en bf16) |
| Idiomas soportados | coreano (ko), con foco en registro coloquial, jerga de internet y estilo telegráfico |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (biblioteca PyTorch; el repo ocupa 0,3 GB) |
| Pipeline | text-classification |
| Modelo base | convaiinnovations/laya-multilingual (solo se reutilizan los pesos del encoder) |

## Arquitectura y entrenamiento

El modelo es un encoder mmBERT de 22 capas en bf16, inicializado desde los pesos del encoder de laya-multilingual. Todas las cabezas se entrenaron de nuevo. La entrada tiene la forma `[CLS] enunciado [SEP] estado·QED [SEP] ([MASK]etiqueta)×n [SEP] (pregunta: [MASK]opción…[SEP])×m`, de modo que el vector de cada posición `[MASK]` funciona como puntuación de la opción correspondiente y se aplica softmax por pregunta. Al ser las opciones texto libre, los candidatos del planner o las frases de experiencia QED pueden cambiar sin reentrenar las cabezas.

Las cabezas se dividen en cuatro bloques: puntuación de opciones (act con 11 clases, task_type con 39, query con 18, hint con 5, prio con 9, método `via` y tidy con 3), extracción de spans de 7 tipos con ancho máximo de 8 tokens (objetivo, cantidad, herramienta, persona, coordenadas, lugar y distancia), enlazado de ítems contra un banco de 1.628 nombres (ítems, mobs, grupos, conjuntos y lugares) mediante bi-encoder con interacción tardía tipo ColBERT, y estimación de valor por método (logaritmo del tiempo y probabilidad de éxito). También hay una cabeza de emparejamiento cantidad↔objetivo↔herramienta.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Sí se documenta que durante el entrenamiento se simulan valores latentes ocultos (falta de recursos, lentitud, bloqueos) distintos de las estimaciones del planner, de forma que el modelo aprende a leer la experiencia QED en lugar de confiar ciegamente en las estimaciones. La evaluación se hizo sobre 488 enunciados reales de chat excluidos del entrenamiento, un conjunto dev de 5,8k y 14 escenarios in-game en dos servidores locales con la misma semilla.

## Capacidades

- Clasificación de intención de habla (act) en 11 clases: ejecutar objetivo, responder pregunta, repreguntar, detener, reanudar, afirmar, negar, charla, insulto, aviso de peligro y crítica o consejo.
- Clasificación de tipo de tarea (task_type) en 39 clases, una por cada bloque de tarea del bot.
- Comprensión de coreano coloquial y abreviado: `철곡 ㄱㄱ` (pico de hierro), `철뚝` (casco de hierro), `철셋` (conjunto de hierro), estilo telegráfico y jerga de internet.
- Extracción de spans estructurados: objetivo, cantidad, herramienta, persona, coordenadas, lugar y distancia.
- Enlazado de spans a un banco de 1.628 nombres con coincidencia parcial, mediante bi-encoder y late interaction tipo ColBERT.
- Emparejamiento de cantidades con objetivos y herramientas en frases compuestas del tipo "3 de hierro y 5 de carbón".
- Repregunta multiturno: si el enlace de ítem devuelve NULL, el modelo pide aclaración y recompone la interpretación con la respuesta.
- Selección de método entre hasta 6 candidatos generados por el planner, con puntuación de valor (log del tiempo estimado y probabilidad de éxito).
- Prioridad de supervivencia (prio) en 9 clases: continuar, combate cuerpo a cuerpo, huida corriendo, huida apilando bloques, esconderse cavando, comer, reanudar tarea detenida, subir a la superficie del agua y ordenar inventario.
- Decisiones de inventario (tidy) en 3 clases: mantener, tirar o guardar en cofre.
- Clasificación de pistas (hint) en 5 clases: lento, incorrecto, corto, peligro y afirmación de completado.
- Integración de experiencia episódica: lee resúmenes de QED (éxitos, tiempos medios, fallos recientes) inyectados como texto y puede cambiar su elección; el sistema marca ese cambio como `changed`.
- No soporta tool calling ni function calling en el sentido de los LLM generativos: su salida son etiquetas y spans que el orquestador traduce en acciones.
- No tiene visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Agente de Minecraft con mineflayer: el modelo se coloca detrás de un servidor HTTP local (puerto 8765) y el bot de TypeScript solo ejecuta las decisiones recibidas. Es adecuado porque su latencia de 17,8 ms en p50 permite decidir en el bucle de juego sin bloquear el tick.
- Clasificación de intención en coreano real: con un 94,5% de acierto sobre 488 enunciados no vistos, sirve para enrutar mensajes de chat de jugadores hacia ejecutores concretos en vez de usar expresiones regulares o condicionales frágiles.
- Interpretación de comandos coloquiales y con errores: la cabeza de enlazado de ítems resuelve abreviaturas y coincidencias parciales, lo que permite aceptar entradas como `철셋 만들어줘` sin obligar al usuario a un vocabulario controlado.
- Diálogo multiturno con aclaración: cuando el ítem no se resuelve, el modelo emite la acción de repreguntar y recompone la interpretación con la respuesta del jugador, útil en asistentes que necesitan desambiguar sin perder el hilo.
- Selección de planes con coste y riesgo: dado un conjunto de métodos con estimaciones del planner, el modelo puntúa y elige, lo que permite integrarlo en un planificador externo que solo aporte candidatos factibles.
- Priorización de supervivencia en tiempo real: la cabeza prio integra vida, hambre, amenaza, noche y oxígeno para elegir entre combatir, huir, comer, esconderse o reanudar, pensado para bucles de decisión de baja latencia.
- Memoria episódica para agentes: el esquema QED registra objetivos, pasos, muertes y bloques colocados y los reinyecta como texto, un patrón reutilizable en otros agentes que necesiten aprender de fallos sin reentrenar.
- Investigación en sistemas neuro-simbólicos: sirve como banco de pruebas para separar hechos calculados por reglas de decisiones aprendidas, y para medir cuánto cambia el comportamiento al añadir o quitar experiencia.
- Clasificación de texto coreano de bajo coste: con 139M de parámetros y 0,3 GB de repo, es viable en CPU o en GPUs muy modestas para tareas de etiquetado de intención en dominios acotados.

## Benchmarks y rendimiento

Resultados publicados por el autor. La comparación mantiene planner, QED y bot idénticos y solo sustituye el módulo de decisión. Conjuntos: 488 enunciados reales de chat excluidos del entrenamiento, dev de 5,8k y 14 escenarios in-game en dos servidores locales con la misma semilla.

| Metrica | Miya-0.2 | LAYA base (zero-shot) |
|---|---|---|
| Intencion real (act) | 94,5% | 11,0% |
| Tipo de tarea (type) | 89,7% | 40,5% |
| Item objetivo (target) | 87,3% | 6,2% |
| Seleccion de metodo (plan) | 73,6% | 27,4% |
| Prioridad de supervivencia (prio) | 86,6% | 11,5% |
| Escenarios in-game (14) | 13/14 | 0/14 |
| Latencia del modelo p50 / p95 | 17,8 / 19,7 ms | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generalistas en la información disponible, y no serían aplicables dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: en bf16 o fp16 los 139M de parámetros ocupan aproximadamente 280 MB; en fp32, unos 560 MB. No se documentan cuantizaciones adicionales.
- GPU recomendadas: no hay requisitos exigentes. Cualquier GPU con 1 GB o más de memoria es suficiente; una RTX 4090, A100 o H100 quedarían muy sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en muchas integradas. También es viable en CPU, ya que el autor reporta unos 18 ms por pasada de encoder.
- Opciones de despliegue: el repositorio incluye `model/serve.py`, un servidor HTTP escrito solo con la biblioteca estándar de Python que escucha en el puerto 8765 y expone un endpoint `/turn`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y en la mayoría de los casos no aplican al no ser un modelo autorregresivo.
- Latencia: p50 de 17,8 ms y p95 de 19,7 ms por pasada de encoder, según los datos del autor. El throughput no está especificado en la información disponible.
- Almacenamiento: el repositorio completo ocupa 0,3 GB.

## Comparativa con modelos similares

No se dispone de datos publicados de otros clasificadores de decisión específicos para agentes de Minecraft, por lo que la comparación se limita a los modelos citados en la propia documentación.

| Modelo | Parametros | Tipo | Contexto | Act real | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Miya-0.2 | 139M | Encoder de decisión (fine-tune con cabezas nuevas) | no disponible | 94,5% | Apache-2.0 | HuggingFace |
| convaiinnovations/laya-multilingual | 312M | Encoder multilingüe (modelo base) | no disponible | 11,0% (zero-shot) | no disponible | HuggingFace |
| mmBERT | no disponible | Encoder transformer de 22 capas (arquitectura de referencia) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo marcado explícitamente como trabajo en curso (WIP): es un snapshot de investigación, no un agente terminado.
- Los pesos, el esquema de etiquetas (`schema.json`) y la API pueden cambiar sin compatibilidad hacia atrás en la siguiente versión.
- No existe todavía modo autónomo y el autor reconoce que la calibración de las peticiones de ayuda (`ask`) es insuficiente y que parte de las decisiones de supervivencia son débiles.
- Riesgo de clasificación errónea: al ser un clasificador, puede asignar una intención o un span incorrectos con alta confianza; la evaluación reporta un 73,6% en selección de método, el punto más flojo de la tabla.
- El enlazado de ítems devuelve NULL cuando no encuentra coincidencia, lo que provoca repreguntas; en producción esto puede generar bucles de aclaración si el jugador no responde.
- Cobertura lingüística limitada al coreano. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- La longitud de contexto no está especificada, lo que impide planificar el tamaño de las entradas que combinan enunciado, estado y experiencia QED.
- No se documentan sesgos concretos, pero el entrenamiento sobre chat de servidores coreanos puede reflejar el registro, la jerga y los sesgos de esa comunidad.
- Licencia Apache-2.0, que permite uso comercial y modificación con atribución; el propio estado WIP es el principal caveat para producción, más que la licencia.
- El modelo no ejecuta acciones ni navega: depende por completo del planner, de la base de conocimiento `mcx.db` y del bot de mineflayer, de modo que un fallo en cualquiera de esas piezas no lo compensa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snowman6/Miya-0.2
- Model card en inglés: https://huggingface.co/snowman6/Miya-0.2/blob/main/README.en.md
- Repositorio GitHub (bot, servidor y código de entrenamiento): https://github.com/snowman6-git/Miya
- Modelo base, convaiinnovations/laya-multilingual: https://huggingface.co/convaiinnovations/laya-multilingual
