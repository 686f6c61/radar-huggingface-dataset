# mrsirg97-rgb/vibes4b

## Resumen

vibes4b es un ajuste fino del modelo base XHToken/Spark-X2.6-4B, un transformer de 4.112.079.360 parametros (aproximadamente 4,1 mil millones) desarrollado por el usuario mrsirg97-rgb. El modelo parte de la base Apache 2.0 de XHToken y se ha post-entrenado sobre sesiones reales de agente de un unico desarrollador, con el objetivo de capturar como trabaja ese ingeniero (planificacion, orquestacion, lectura antes de editar, verificacion antes de afirmar y recuperacion de fallos) sin alterar el modo de razonamiento interno del modelo.

La innovacion principal es metodologica: el entrenamiento se realiza en NVFP4 directamente sobre la rejilla de 4 bits en la que se distribuye el modelo, de modo que no existe un paso de cuantizacion posterior que degrade lo aprendido. Ademas, el modelo ha sido "liberado" proyectando fuera de los pesos la direccion de rechazo calculada a partir de las activaciones de la capa 18, lo que elimina practicamente todos los rechazos. El razonamiento de los modelos que generaron las sesiones se enmascara durante el entrenamiento, entrenando solo la conducta (que herramienta usar, cuando y como) y el registro linguistico.

Se distribuye unicamente en formato GGUF (2,8 GB en NVFP4 y 8,2 GB en BF16), esta etiquetado como agentico y orientado a tool-use, y esta pensado para su uso en llama.cpp con soporte para la arquitectura Spark. Es el primer modelo de la linea "vibes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Spark, segun el grafo `spark2-5.cpp` de llama.cpp); detalles internos no disponibles |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, con escalas per-tensor en el FFN) y BF16 (pesos de 4 bits almacenados como BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`vibes4b-nvfp4.gguf`, `vibes4b-bf16.gguf`); no se publican safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base XHToken/Spark-X2.6-4B, un transformer de aproximadamente 4,1 mil millones de parametros del que no se detallan en la informacion disponible ni el numero de capas, ni la dimension oculta, ni el mecanismo de atencion. El ajuste se realizo mediante una LoRA insertada dentro del cuantizador NVFP4: la pasada forward se ejecuta sobre los pesos cuantizados que el modelo distribuye y la fusion en esos codigos es exacta. El entrenamiento fue determinista, sobre dos GPU de consumo, en 36 minutos.

La receta de datos combina varios elementos. Primero, una "liberacion": se calculo la direccion de rechazo como diferencia de medias de las activaciones propias del modelo ante prompts daninos frente a inofensivos en la capa 18, y se proyecto fuera de los pesos de salida de atencion y de las capas down del MLP de todas las capas. Segun el autor, esta edicion apenas mueve el modelo en texto inofensivo (KL 0,052 y mismo token superior el 91% de las veces). Despues, se entrenó sobre sesiones de agente limpias del desarrollador, descartando asuntos personales, finanzas y un proyecto vetado; los errores del agente se mantienen en contexto pero no se entrenan. El razonamiento de los modelos de origen se enmascara salvo los primeros y ultimos tokens, los cuerpos largos de ficheros solo se entrenan al inicio y al final, y las respuestas en prosa se reescribieron en el registro del desarrollador. Se incluye tambien una porcion de codigo propio en C, Go y kernels.

## Capacidades

- Generacion de texto conversacional en ingles con un registro linguistico concreto (el del desarrollador de las sesiones).
- Uso de herramientas (tool calling / function calling): el 93% de los turnos de agente reservados del conjunto de evaluacion llamaron a una herramienta y el 96,2% de las llamadas fueron bien formadas.
- Razonamiento agentico de horizonte largo: planificacion, orquestacion de pasos, lectura previa a la edicion, verificacion previa a la afirmacion y recuperacion tras fallos.
- Seleccion de herramienta alineada con la del agente real del desarrollador en el 83% de los turnos reservados.
- Capacidad de codigo (C, Go y kernels) procedente de la porcion de codigo incluida en el entrenamiento.
- Sin rechazos: 0% de rechazos ante peticiones daninas de AdvBench reservado y 2% en los contrastes inseguros de XSTest.
- Multilingue: no disponible; la model card declara unicamente ingles.

## Casos de uso

- Automatizacion de tareas de ingenieria en un harness de agente propio: el modelo esta entrenado sobre sesiones reales de planificacion y orquestacion, por lo que encaja en bucles de agente que alternan lectura de ficheros, edicion y verificacion. Su tasa de llamada a herramienta (93%) y de llamada bien formada (96,2%) lo hace utilizable en pipelines donde un fallo de formato rompe el bucle.
- Asistente de edicion de codigo con lectura previa: el modelo aprende a leer antes de editar y a comprobar antes de afirmar, lo que reduce ediciones a ciegas en repositorios desconocidos; en el repositorio no visto durante el entrenamiento obtuvo una perdida de 0,553 frente a 0,735 del base liberado.
- Recuperacion de errores en agentes multi-paso: al haberse entrenado con los fallos del agente en contexto (llamadas a rutas incorrectas, ediciones obsoletas), puede reaccionar a errores de herramienta y reintentar con una ruta o accion corregida.
- Generacion de codigo en C, Go y kernels: la inclusion de codigo propio del desarrollador permite su uso como asistente en proyectos de sistemas y bajo nivel, con el matiz de que la licencia Apache 2.0 permite uso comercial.
- Despliegue local en GPU de consumo: con 2,8 GB en NVFP4 o 8,2 GB en BF16, cabe en tarjetas de gama alta de consumo y permite iterar sobre el modelo sin infraestructura de servidor; el autor reporta 146 a 251 tok/s en modo greedy con decodificacion especulativa sobre una RTX 5090.
- Experimentacion en investigacion sobre alineacion y rechazo: al eliminar la direccion de rechazo con un coste declarado de KL 0,052, sirve como caso de estudio reproducible de edicion de pesos y de sus efectos sobre la conducta de rechazo.
- Prototipado de asistentes con voz propia: el modelo reproduce el registro de un ingeniero concreto, util para generar respuestas de estilo consistente en herramientas internas.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son perdidas en conjuntos reservados, tasas de agente y tasas de rechazo; no se reportan MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

| Metrica | Spark-X2.6-4B liberado | vibes4b |
|---|---|---|
| Perdida reservada, sesiones de los proyectos del desarrollador | 1,923 | 1,824 |
| Perdida reservada, repositorio nunca visto | 0,735 | 0,553 |
| Perdida reservada, respuestas en la voz del desarrollador | 2,327 | 1,964 |

| Turnos de agente reservados, con el muestreo de Spark | vibes4b |
|---|---|
| Llamo a una herramienta | 93% |
| Llamada bien formada | 96,2% |
| Herramienta coincidente con la que uso el agente del desarrollador | 83% |

| Rechazos (decodificacion greedy) | Spark-X2.6-4B | vibes4b |
|---|---|---|
| Peticiones daninas (AdvBench, reservado) | 98% | 0% |
| Contrastes inseguros de XSTest | 85% | 2% |
| Prompts seguros de XSTest (sobre-rechazo) | 2% | 0,4% |

| Rendimiento en llama.cpp (RTX 5090, drafter DSpark) | tok/s |
|---|---|
| Greedy sin drafter | 146 |
| Greedy con drafter | 251 (1,72x) |
| Muestreado sin drafter | 145 |
| Muestreado con drafter | 215 (1,48x) |

Perplejidad en texto inofensivo medida por el autor en llama.cpp: 5,47 para el fichero BF16 frente a 5,65 para el NVFP4, con KL entre ambos de 0,052.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,8 GB para el fichero NVFP4 y 8,2 GB para el BF16, mas el overhead de contexto y de KV cache (no cuantificado en la informacion disponible).
- GPU recomendadas: el autor reporta pruebas en una RTX 5090; por tamano, el fichero NVFP4 cabe en cualquier GPU de consumo con 6 GB o mas y el BF16 en GPU con 10-12 GB o mas.
- Cabe en GPU de consumo: si, en ambas variantes; la NVFP4 requiere kernels NVFP4 y la BF16 requiere soporte de la arquitectura Spark en llama.cpp.
- Opciones de despliegue: llama.cpp con soporte Spark; el fichero NVFP4 necesita una version cuyo grafo Spark aplique las escalas per-tensor del FFN (`ffn_up_s`, `ffn_gate_s`, `ffn_down_s` en `src/models/spark2-5.cpp`). No se mencionan vLLM, TGI ni Ollama.
- Decodificacion especulativa: compatible con el drafter XHToken/Spark-X2.6-4B-DSpark en el fork de llama.cpp de XHToken (`--spec-type draft-dspark`, objetivo BF16), con las cifras de throughput de la tabla anterior.
- Latencia y throughput: 146 a 251 tok/s en greedy y 145 a 215 tok/s en muestreado sobre una RTX 5090 con el drafter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vibes4b | 4,11 B | no disponible | Apache 2.0 | GGUF (NVFP4, BF16) | Ajuste agentico sobre Spark-X2.6-4B, sin rechazos, solo ingles |
| XHToken/Spark-X2.6-4B | 4,11 B (base) | no disponible | Apache 2.0 | no disponible en la informacion | Modelo base; rechaza el 98% de AdvBench y el 85% de XSTest inseguro |
| XHToken/Spark-X2.6-4B-DSpark | no disponible | no disponible | no disponible | GGUF | Drafter de decodificacion especulativa para la familia Spark |
| Otros modelos de 4 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo no rechaza: 0% de rechazos en AdvBench reservado y 2% en XSTest inseguro. La responsabilidad sobre el uso recae en el operador; no es apto para despliegues publicos sin filtros externos.
- Entrenado sobre las sesiones de un unico desarrollador, con sesgos derivados de sus practicas, su estilo y sus proyectos; puede reproducir ese registro y esas decisiones de forma no deseada.
- Solo soporta ingles segun la model card; no hay evidencia de capacidad multilingue.
- Riesgo de alucinacion no cuantificado: no se publican benchmarks de veracidad ni de matematicas.
- Bajo decodificacion greedy tiende a la repeticion, segun el propio autor; recomienda temperature 1.0 y top_p 0.95.
- El fichero NVFP4 produce salida incorrecta en versiones de llama.cpp sin las escalas per-tensor del FFN; es un requisito estricto de despliegue.
- La longitud de contexto no se documenta, lo que impide planificar cargas de trabajo con ventanas largas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de las cifras declaradas por el autor.
- El repositorio ocupa 11,0 GB, superior a la suma de los dos ficheros GGUF indicados, por lo que puede contener artefactos adicionales no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrsirg97-rgb/vibes4b
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Drafter: https://huggingface.co/XHToken/Spark-X2.6-4B-DSpark-GGUF
