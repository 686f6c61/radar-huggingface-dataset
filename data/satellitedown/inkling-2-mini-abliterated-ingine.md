# satellitedown/Inkling-2-Mini-abliterated-ingine

## Resumen

Inkling-2-Mini-abliterated-ingine es una variante "abliterated" (con el comportamiento de rechazo eliminado en gran medida) del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario satellitedown. El modelo base es un transformer de tipo mezcla de expertos (MoE) con arquitectura "looped": 24 capas fisicas que se ejecutan como 48 visitas en orden de ejecucion (capas 0-5, capas 6-17 tres veces, despues capas 18-23). Cuenta con 26.388.646.440 parametros totales y un drafter especulativo DSpark de 636 MB.

La publicacion no entrena ni modifica los pesos originales: anade un fichero safetensors de 885 KB con una direccion y un peso por cada escritura de atencion y MLP de cada una de las 48 visitas, que el motor de inferencia ingine aplica en tiempo de ejecucion tras la convolucion por canal. El objetivo declarado es eliminar el comportamiento de rechazo tanto en respuesta directa como en razonamiento previo, manteniendo las puntuaciones originales en matematicas, codigo y conocimiento.

Es relevante por dos motivos: por un lado, documenta de forma medible el coste en calidad (divergencia KL, acuerdo top-1) de una abliteracion sobre un MoE con estado residual no convencional; por otro, viene acompanado de ingine, un motor CUDA para una sola GPU con API compatible con OpenAI, contexto de 262.144 tokens y decodificacion especulativa, que alcanza 255-260 tokens/s en una RTX 5090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con ejecucion en bucle (24 capas fisicas, 48 visitas); mezcla softmax de estados de bloque normalizados por RMS; convolucion corta por canal (4 taps) en las escrituras de atencion y MLP |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (perfil por defecto de ingine) |
| Tipos de cuantizacion | BF16 denso, NVFP4/MXFP8 en expertos enrutados, cache KV en FP8; etiquetas 8-bit y modelopt |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16 + NVFP4/MXFP8), drafter DSpark en safetensors; abliteracion en safetensors FP32 |

## Arquitectura y entrenamiento

El modelo base es un MoE con ejecucion en bucle: 24 capas fisicas que se recorren como 48 visitas. No dispone de un flujo residual plano convencional; cada capa lee una mezcla softmax de estados de bloque normalizados por RMS, y cada salida de atencion y MLP pasa por una convolucion corta por canal de 4 taps tras su proyeccion de salida antes de escribirse. Los expertos enrutados estan almacenados en NVFP4/MXFP8 y los pesos densos en BF16. Incluye un drafter de decodificacion especulativa DSpark de 636 MB.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible (numero de tokens, composicion del dataset, RLHF/DPO): no disponible. La contribucion de esta publicacion es la abliteracion, no un reentrenamiento. Se calculan direcciones como diferencia de medias entre 400 prompts daninos (mlabonne/harmful_behaviors) y 400 inofensivos (mlabonne/harmless_alpaca) en las lecturas de atencion y MLP de cada visita, tomadas en dos posiciones. En tiempo de ejecucion, ingine aplica sobre cada escritura `y` de la visita `v`: `y <- y - w * r * (r . y)`. La edicion se hace despues de la convolucion porque hornearla en los pesos seria inexacto dado que cada canal tiene sus propios taps. Los expertos enrutados en NVFP4/MXFP8 permanecen identicos byte a byte. El release corresponde al trial 13 de una busqueda que equilibra rechazos y acuerdo con el original.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento previo ("reasoning first") con esfuerzo configurable (por ejemplo, low y 768 tokens en las evaluaciones).
- Codigo: en las pruebas ejecutadas resuelve 12/12 problemas de Python con tests.
- Matematicas: 20/20 en el conjunto de evaluacion con razonamiento.
- Conocimiento en opcion multiple: 12/12 en el conjunto de evaluacion.
- Decodificacion especulativa mediante el drafter DSpark incluido.
- API compatible con OpenAI a traves de ingine.
- Comportamiento de rechazo practicamente eliminado: 1/104 y 5/100 rechazos en conjuntos de comportamientos daninos en respuesta directa, y 0/48 con razonamiento previo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision y audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y abliteracion: el repositorio incluye scripts (`ablate.py`, `inkling_ref.py`, `refusal_eval.py`, `capability_eval.py`, `eval.sh`) y resultados en JSON que permiten reproducir la busqueda de direcciones y medir el compromiso entre rechazo y divergencia KL frente al modelo original.
- Evaluacion de modelos sin filtrado de rechazo en entornos controlados: util para estudiar comportamientos limite, sesgos y respuestas a prompts que el modelo original declinaria, con la advertencia de que el contenido generado puede ser sensible.
- Despliegue en una sola GPU consumer: ingine esta disenado para una RTX 5090, con 255-260 tokens/s en decodificacion greedy y 262.144 tokens de contexto, lo que permite servir un MoE de 26.400 millones de parametros en hardware de escritorio.
- Generacion de codigo en local: el modelo resuelve tareas de Python con tests ejecutados (12/12) y decodifica a 254-382 tokens/s en prompts de codigo, adecuado para asistentes de programacion con latencia baja.
- Procesamiento de documentos tecnicos largos: con 255K tokens de contexto, el prefill promedia 1.056 tokens/s y la decodificacion posterior se mantiene en unos 156 tokens/s, lo que permite analizar repositorios o manuales extensos en una sola pasada.
- Servicio con API compatible con OpenAI: al exponer una interfaz compatible, puede integrarse como backend en aplicaciones existentes que ya consumen la API de OpenAI, sustituyendo el endpoint sin cambios en el cliente.
- Experimentacion con decodificacion especulativa: el drafter DSpark incluido permite medir ganancias de throughput (289-382 tokens/s segun el tipo de texto) y estudiar su dependencia de la previsibilidad del texto generado.

## Benchmarks y rendimiento

Resultados de rechazo y acuerdo con el modelo original (decodificacion greedy, prompts no vistos en la busqueda de abliteracion):

| Metrica | Original | Esta release |
|---|---:|---:|
| Rechazos, mlabonne/harmful_behaviors (104), respuesta directa | 104 | 1 |
| Rechazos, JailbreakBench (100), respuesta directa | 100 | 5 |
| Rechazos, harmful_behaviors (48), razonamiento previo | 47 | 0 |
| Rechazos, 32 prompts limite suaves, directa / razonamiento | 15 / 10 | 0 / 0 |
| Matematicas (20, razonamiento) | 20/20 | 20/20 |
| Python (12, tests ejecutados) | 12/12 | 12/12 |
| Opcion multiple (12) | 12/12 | 12/12 |
| Acuerdo top-1 en 8.192 tokens de documentacion tecnica | 1 | 0,912 |
| KLD media en 8.192 tokens de documentacion tecnica | 0 | 0,034 |
| Divergencia KL sobre respuestas del original a 64 prompts inofensivos | 0 | 0,043 |

Rendimiento de ingine en RTX 5090 (perfil por defecto, contexto 262.144, cache KV FP8, una peticion, 1.024 tokens generados):

| Modo | chat (tok/s) | code (tok/s) |
|---|---:|---:|
| Decodificacion greedy | 262 | 254 |
| Decodificacion + DSpark, greedy | 289 | 365 |
| Decodificacion, temperatura 1 | 257 | 254 |
| Decodificacion + DSpark, temperatura 1 | 307 | 382 |

Prefill: aproximadamente 2.800-2.900 tokens/s para prompts de 5K-16K tokens y 1.056 tokens/s de media en un prompt de 255K tokens. Decodificacion tras 255K tokens de contexto: unos 156 tokens/s. La ganancia de DSpark depende de la previsibilidad del texto; en prosa poco predecible puede ser hasta un 10% mas lenta que la decodificacion greedy simple.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 20,2 GB (19,5 GB de pesos + 636 MB del drafter + ficheros auxiliares); se ha ejecutado en una RTX 5090 con contexto de 262.144 tokens y cache KV FP8, por lo que se necesita una GPU con al menos 32 GB de memoria para ese perfil.
- GPU recomendadas: RTX 5090 (unica GPU validada en la documentacion); para otros modelos (A100, H100, RTX 4090) no hay datos publicados.
- Cabe en GPU consumer: si, al menos en RTX 5090 segun las mediciones del autor.
- Opciones de despliegue: ingine (motor CUDA para una sola GPU, con API compatible con OpenAI). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 255-260 tokens/s en decodificacion greedy y 290-382 tokens/s con DSpark en RTX 5090; prefill de 2.800-2.900 tokens/s en prompts de 5K-16K y 1.056 tokens/s de media en 255K tokens; 156 tokens/s de decodificacion tras 255K tokens de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (harmful_behaviors) | Licencia | Formato |
|---|---:|---:|---:|---|---|
| Inkling-2-Mini-abliterated-ingine (esta release) | 26.388.646.440 | 262.144 | 1/104 directa; 0/48 con razonamiento | Apache-2.0 | safetensors (BF16 + NVFP4/MXFP8) |
| thinkingmachines/Inkling-2-Mini (original) | 26.388.646.440 | no disponible | 104/104 directa; 47/48 con razonamiento | no disponible | safetensors |
| Trial 37 de la misma busqueda (abliteracion mas ligera) | 26.388.646.440 | 262.144 | 26/48 con razonamiento | Apache-2.0 | safetensors |
| Trial 44 (solo respuestas directas) | 26.388.646.440 | 262.144 | 0/104 directa; 43/48 con razonamiento | Apache-2.0 | safetensors |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria (por ejemplo, otros MoE de aproximadamente 26.000 millones de parametros) en la informacion proporcionada: no disponible.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: el comportamiento de rechazo se ha eliminado en gran medida; el modelo puede producir contenido que el original declinaria. La responsabilidad de uso y del cumplimiento legal recae en el usuario.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de veracidad; las pruebas de capacidad se limitan a conjuntos pequenos (20 de matematicas, 12 de Python, 12 de opcion multiple).
- Desviacion respecto al original: acuerdo top-1 de 0,912 y KLD media de 0,034 en 8.192 tokens de documentacion tecnica; divergencia KL de 0,043 sobre las respuestas del original a 64 prompts inofensivos. La abliteracion no es neutra en calidad.
- Sensibilidad al modo de respuesta: abliteraciones mas ligeras (trial 37, trial 44) mantienen rechazos elevados cuando el modelo razona antes de responder; el equilibrio entre supresion de rechazos y fidelidad al original es delicado.
- Idiomas soportados: no disponible; no se puede confirmar el rendimiento multilingue.
- Tool calling, agentes y vision: no disponible en la informacion proporcionada.
- Dependencia de un motor especifico: la abliteracion se aplica en tiempo de ejecucion mediante ingine; hornearla en los pesos seria inexacto por la convolucion por canal, lo que limita el uso con otros runners.
- Rendimiento especulativo variable: DSpark puede ser hasta un 10% mas lento que la decodificacion greedy en prosa poco predecible.
- Licencia Apache-2.0: permite uso comercial, pero debe verificarse la licencia y los terminos del modelo base thinkingmachines/Inkling-2-Mini, no disponibles en la informacion proporcionada.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (21 de noviembre de 2026), por lo que no hay validacion independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satellitedown/Inkling-2-Mini-abliterated-ingine
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del motor ingine: https://github.com/satellitedown/inkling-2-mini-abliterated-ingine
- Conjunto de prompts daninos: mlabonne/harmful_behaviors (referenciado en la model card)
- Conjunto de prompts inofensivos: mlabonne/harmless_alpaca (referenciado en la model card)
- JailbreakBench: referenciado en la model card, sin URL explicita
- Paper, blog o demo adicionales: no disponible
