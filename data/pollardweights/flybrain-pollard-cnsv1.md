# PollardWeights/FlyBrain-Pollard-CNSv1

## Resumen

FlyBrain-Pollard-CNSv1 es un adaptador de memoria recurrente para transformers publicado por PollardWeights. No es un modelo de lenguaje autonomo: es un modulo entrenado, de 41,4 MB, que se acopla a un backbone congelado (Qwen2.5-0.5B-Instruct) y actua como memoria continua del mismo. La innovacion es que esa memoria no es una matriz aprendida al uso, sino un conectoma biologico real: el sistema nervioso central de una *Drosophila melanogaster* macho (MaleCNS v1.0, FlyEM/Janelia, Google Research y University of Cambridge), podado a su nucleo de memoria asociativa (cuerpo fungiforme y complejo central) hasta 8.552 neuronas y 300.880 sinapsis, que conservan el 69,8 % de la masa sinaptica.

El problema que aborda es estructural: la memoria de un transformer es su cache KV, que crece con cada token y descarta sin compresion lo que sale de la ventana de contexto. FlyBrain sustituye ese mecanismo por un estado recurrente de tamano constante (0,03 MB en memoria, 35 KB en disco) que se actualiza una vez por token y no tiene ventana propia. En el experimento publicado, con una ventana de atencion de 128 tokens y un documento de 1.024 tokens, el modelo con FlyBrain alcanza una perplejidad de 5,09 frente a 5,89 sin memoria y 5,07 con atencion completa sobre el documento: cierra el 97,4 % de la brecha.

Es relevante ahora porque ataca dos lineas activas a la vez: la memoria de largo plazo en transformers (Transformer-XL, Compressive Transformer, RMT, Infini-attention, Titans) y el uso de sustratos biologicos medidos como componente computacional. Ademas incluye un control experimental poco habitual: una permutacion del cableado que preserva el grado de cada neurona, con la que el conectoma real gana en las cuatro semillas probadas. El modelo esta en fase inicial (0 descargas, 0 likes) y su licencia es CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de memoria recurrente sobre un transformer congelado (Qwen2.5-0.5B-Instruct); el nucleo de memoria es un grafo sinaptico derivado del conectoma MaleCNS v1.0 (8.552 neuronas, 300.880 sinapsis), con un paso de actualizacion por token |
| Parametros totales | No disponible. El backbone (Qwen2.5-0.5B-Instruct) tiene aproximadamente 0,5 B de parametros y permanece congelado; el artefacto entrenable de FlyBrain ocupa 41,4 MB y no redistribuye pesos del backbone |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | El cerebro no tiene ventana propia: su estado es constante a cualquier longitud de secuencia. En los experimentos publicados el backbone atiende a una ventana de 128 tokens sobre documentos de 1.024 tokens. La longitud de contexto nativa del backbone no se especifica en la informacion disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen como artefacto PyTorch en coma flotante; no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 (el conectoma de origen, MaleCNS v1.0, es tambien CC-BY) |
| Formato de pesos | PyTorch: `FlyBrain-Pollard-CNSv1.pt` (41,4 MB), mas `flybrain.py` y `flybrain_state.py` como utilidades de carga y de lectura/escritura de estado |
| Tamano del estado | 0,03 MB en vivo (8.552 floats); 35 KB en disco, con ida y vuelta exacta |
| Tamano del repositorio | 0,0 GB segun HuggingFace (el artefacto descrito en la model card es de 41,4 MB) |
| Sobrecarga de decodificacion | +3,1 %, dentro de la varianza entre ejecuciones segun el autor |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct (relacion: adapter, backbone congelado) |

## Arquitectura y entrenamiento

FlyBrain no modifica el transformer. Se engancha por debajo como una capa de memoria recurrente: en cada token, el estado del conectoma se actualiza una vez y alimenta al backbone, que sigue atendiendo a su ventana de atencion habitual. El sustrato es un grafo sinaptico medido del sistema nervioso central de una mosca de la fruta, con signos excitatorios/inhibitorios anotados para el 88 % de las neuronas del conectoma completo (188.778 neuronas y 26.028.386 conexiones sinapticas). Para CNSv1 se poda a las regiones de memoria asociativa (cuerpo fungiforme y complejo central), conservando 8.552 neuronas y 300.880 sinapsis que concentran el 69,8 % de la masa sinaptica. Sobre esa estructura se entrenan sinapsis y adaptadores; el artefacto resultante ocupa 41,4 MB y no contiene pesos del backbone.

El autor aporta un control para separar el efecto del cableado del de la simple recurrencia: una permutacion que preserva el grado (mismas neuronas, mismo numero de sinapsis, mismo grado de entrada y salida por neurona y mismo multiconjunto de pesos, cambiando solo quien conecta con quien), con parametros, entrenamiento y datos identicos. El conectoma real gano en las cuatro semillas, con una ventaja media de +9,2 puntos. La model card advierte que la referencia de "atencion completa" ejecuta el backbone sin parametros entrenados mientras que el cerebro si tiene adaptadores entrenados, por lo que la semilla 3 supera el 100 %; se trata de un punto de referencia, no de una cota superior. El entrenamiento para un backbone nuevo, con el backbone congelado, lleva aproximadamente 20 minutos segun el autor.

## Capacidades

- Memoria recurrente de largo plazo: mantiene un estado continuo que no crece con la secuencia y no descarta informacion por ventana, lo que permite retener historia mas alla de la ventana de atencion del backbone.
- Estado portable y versionable: `save_state` y `load_state` escriben y leen 35 KB con ida y vuelta exacta, de modo que una sesion se puede guardar, ramificar, versionar o mover entre maquinas y reanudar "a mitad de pensamiento".
- Generacion de texto: heredada integramente del backbone Qwen2.5-0.5B-Instruct; FlyBrain anade memoria, no capacidad generativa.
- Uso transparente: el modelo se invoca como cualquier modelo de HuggingFace; el cerebro opera por debajo y `detach()` lo desconecta sin tocar el backbone.
- Construccion de un "puente" en tiempo de carga a partir de un corpus de sondas (`probe_text`) que el usuario aporta; ese puente no se distribuye con el modelo.
- No soporta tool calling, function calling ni agentes por si mismo: eso depende del backbone, y la model card no documenta estas capacidades para esta integracion.
- No tiene vision ni generacion de codigo propia: el autor lo indica explicitamente ("the brain does not write code or see images"; esas capacidades vendrian del backbone).
- Multilingue: limitado a ingles, tanto por el idioma declarado del repositorio como por el backbone en esta configuracion.

## Casos de uso

- Asistentes conversacionales con sesiones largas: el estado de 35 KB se guarda al cerrar una sesion y se recarga al reanudarla, de modo que el asistente retoma el hilo sin reinyectar el historial completo ni pagar el coste de un cache KV de gran tamano (el autor compara los 35 KB con los 25,8 GB que ocuparia un cache KV de 131.000 tokens con la misma historia).
- Procesamiento de documentos largos con ventana reducida: con 128 tokens de atencion y un documento de 1.024 tokens, el sistema alcanza una perplejidad de 5,09 frente a 5,07 con atencion completa; util para flujos que hoy requieren ventanas grandes por motivos de recuperacion de informacion.
- Despliegue en hardware con memoria muy limitada: el estado en vivo es de 0,03 MB constante, por lo que el coste de memoria no escala con la longitud de la conversacion. Interesa en dispositivos de borde o entornos con muchos usuarios concurrentes.
- Versionado y ramificacion de memoria como artefacto de ingenieria: al ser un fichero, el estado se puede almacenar en un repositorio, comparar entre ramas, revertir a un punto anterior o auditar que recordaba el sistema en un momento dado.
- Investigacion en neurociencia computacional: permite contrastar el conectoma real contra permutaciones que preservan el grado, un protocolo replicable para estudiar si la topologia biologica aporta ventaja funcional mas alla de la recurrencia.
- Evaluacion de mecanismos de memoria para transformers: sirve como punto de comparacion reproducible frente a enfoques clasicos de memoria recurrente, con suelo (sin memoria) y techo (atencion completa) declarados.
- Adaptacion a otros backbones como linea de experimentacion: el autor documenta que reentrenar los adaptadores para un backbone nuevo lleva aproximadamente 20 minutos con el backbone congelado, lo que facilita probar la misma memoria sobre distintas familias de modelos.
- Analisis forense y de trazabilidad de conversaciones: al poder guardarse y archivarse el estado exacto, es posible reconstruir que informacion estaba disponible en el sistema en cada turno, algo que un cache KV descartado no permite.

## Benchmarks y rendimiento

Resultados publicados en la model card: Qwen2.5-0.5B-Instruct congelado, ventana de atencion de 128 tokens, documento de 1.024 tokens.

| Configuracion | Loss | Perplejidad |
|---|---:|---:|
| Ventana de 128 tokens, sin memoria | 1,7733 | 5,89 |
| Ventana de 128 tokens + FlyBrain | 1,6271 | 5,09 |
| Atencion completa sobre el documento | 1,6232 | 5,07 |

El modelo con FlyBrain cierra el 97,4 % de la brecha entre la ventana de 128 tokens y la atencion completa.

Control de cableado (permutacion que preserva el grado, mismos parametros, entrenamiento y datos; valores porcentuales tal como los reporta el autor, sin especificar la metrica exacta):

| Semilla | Conectoma real | Cableado barajado |
|---|---:|---:|
| 0 | 61,3 % | 48,1 % |
| 1 | 47,5 % | 42,5 % |
| 2 | 54,7 % | 38,3 % |
| 3 | 105,4 % | 103,2 % |

Ventaja media del conectoma real: +9,2 puntos, ganando en las cuatro semillas. No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Los unicos datos medidos por el autor son el estado (0,03 MB en vivo, 35 KB en disco), el artefacto (41,4 MB) y la sobrecarga de decodificacion (+3,1 %). No se publican cifras de VRAM ni de throughput absoluto.
- Estimacion a partir del backbone de 0,5 B: en FP16 el backbone ronda 1 GB de pesos, y el sistema completo deberia caber en torno a 2 GB de VRAM; en FP32 el backbone ronda 2 GB y el total puede acercarse a 3-4 GB. Son estimaciones, no cifras publicadas por el autor.
- Cabe con holgura en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM (por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090). En A100 o H100 funcionaria, pero es sobredimensionado para 0,5 B de parametros.
- La ventaja practica aparece en el coste de memoria del historial, no en el coste del backbone: el estado es constante, mientras que un cache KV equivalente a 131.000 tokens ocuparia aproximadamente 25,8 GB segun el autor.
- Despliegue: la via documentada es PyTorch con `transformers` (`pip install torch transformers pandas scipy`) y el modulo `pollard_flybrain` / `flybrain` con las llamadas `load`, `attach`, `save_state`, `load_state` y `detach`. Requiere un corpus de sondas (`probe_text`) en tiempo de carga para construir el puente.
- No se documenta soporte nativo para vLLM, TGI, llama.cpp u Ollama; al tratarse de un modulo que se engancha a un modelo de HuggingFace en PyTorch, su integracion en esos servidores requeriria trabajo adicional no descrito.
- Latencia y throughput: no disponibles. El unico dato es la sobrecarga de decodificacion del +3,1 %, que el autor situa dentro de la varianza entre ejecuciones.

## Comparativa con modelos similares

No se dispone de especificaciones de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a lo que el autor declara.

| Sistema | Parametros | Contexto | Rendimiento (perplejidad) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlyBrain-Pollard-CNSv1 + Qwen2.5-0.5B-Instruct | 0,5 B congelados + adaptador de 41,4 MB | El cerebro no tiene ventana; 128 tokens de atencion en el experimento | 5,09 sobre documento de 1.024 tokens | CC-BY-4.0 | HuggingFace, 0 descargas |
| Qwen2.5-0.5B-Instruct sin memoria | 0,5 B | 128 tokens en el experimento | 5,89 sobre documento de 1.024 tokens | No disponible en la informacion proporcionada | HuggingFace (modelo base) |
| Atencion completa sobre el documento (referencia interna) | 0,5 B, sin parametros entrenados | Documento completo | 5,07 sobre documento de 1.024 tokens | No disponible | Referencia experimental, no distribuida |
| Memoria recurrente previa (Transformer-XL, Compressive Transformer, RMT, Infini-attention, Titans) | No disponible | No disponible | No disponible | No disponible | Citadas por el autor como trabajo previo; sin datos comparativos en la informacion disponible |
| Simulaciones de conectoma previas (fly.ai, optic-lobe steering, game controllers) | No disponible | No disponible | No disponible | No disponible | Citadas por el autor; sin datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- Un cerebro por familia de backbone: los adaptadores se ajustan a las representaciones de un modelo concreto. Cargar CNSv1 en un backbone no relacionado funciona pero no aporta mejora; el autor mide un -14,6 % en un modelo no visto. Reentrenar para otro backbone lleva unos 20 minutos con el backbone congelado.
- El cerebro no razona ni genera: no escribe codigo ni procesa imagenes. Las 8.552 neuronas recuerdan; la generacion, el codigo y la vision dependen del backbone.
- Techo de capacidad bajo: el backbone es un modelo de 0,5 B, por lo que la calidad de generacion, el conocimiento factual y la resistencia a la alucinacion son los propios de un modelo de ese tamano. FlyBrain no corrige ninguno de esos problemas.
- Idioma: solo ingles declarado. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Dependencia del corpus de sondas: el puente se construye en tiempo de carga a partir de las respuestas del backbone a un texto de sondas que aporta el usuario. No se documenta la sensibilidad de los resultados a la eleccion de ese corpus.
- Evaluacion limitada: los unicos numeros publicados son loss y perplejidad en una configuracion concreta (ventana de 128 tokens, documento de 1.024 tokens) y el control de cableado. No hay benchmarks de tareas, ni evaluaciones multilingues, ni pruebas de robustez.
- La referencia de "atencion completa" no es una cota superior estricta: ejecuta el backbone sin parametros entrenados mientras que el cerebro si tiene adaptadores, lo que explica que una semilla supere el 100 %. El propio autor lo senala.
- Licencia CC-BY-4.0: permite uso comercial con atribucion. Hay que atribuir tanto el modelo de PollardWeights como el conectoma MaleCNS v1.0 (FlyEM/Janelia, Google Research, University of Cambridge), que tambien es CC-BY. No se redistribuyen pesos del backbone Qwen, que mantiene su propia licencia.
- Madurez y soporte: el repositorio registra 0 descargas y 0 likes, y el tamano declarado en HuggingFace es de 0,0 GB. Conviene verificar que el artefacto de 41,4 MB esta efectivamente subido antes de planificar una integracion.
- Sin soporte documentado en servidores de inferencia de alto rendimiento (vLLM, TGI, llama.cpp, Ollama), lo que limita su uso en produccion a integraciones propias en PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PollardWeights/FlyBrain-Pollard-CNSv1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del metodo y las herramientas (Pollard Weights): https://github.com/WestWaters/pollard-weights
- Conectoma MaleCNS v1.0 (FlyEM/Janelia, Google Research, University of Cambridge): enlace no disponible en la informacion proporcionada
- Paper o publicacion tecnica asociada: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
- Los resultados de busqueda web devueltos no contienen informacion relevante sobre este modelo (corresponden a servicios de mapas), por lo que no se anaden enlaces adicionales.
