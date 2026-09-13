# Joakimpalm-Zen/Qwen3.8-27B-GSQ-RCO-IQ3_S-recovered-GGUF

## Resumen

Qwen3.8-27B-GSQ-RCO-IQ3_S-recovered-GGUF es una cuantizacion GGUF de 27B (26.895.998.464 parametros) derivada de Qwen3.8-27B, publicada por el usuario Joakimpalm-Zen. No es un entrenamiento nuevo ni un ajuste fino del modelo base: es el fichero IQ3_S de ISTA-DASLab (GSQ-RCO) al que se le han reentrenado exclusivamente los campos de escala fp16 (`d` y `dmin`) de cada bloque cuantizado mediante destilacion de conocimiento contra el padre en BF16. Los codigos enteros, los indices de codebook, los signos, los desplazamientos de tensores y el tamanio en bytes (11.771.546.784) son identicos al fichero de origen; el unico contenido modificado son los campos de escala.

El interes tecnico esta en el metodo: GSQ optimiza la asignacion de la rejilla entera y RCO reparte un tipo de cuantizacion por tensor bajo un presupuesto de tamanio, pero ninguna de las dos fases entrena atraves del modelo. En un GGUF ya fijado, la escala por bloque es el unico grado de libertad continuo y es lineal respecto al peso decodificado, de modo que puede entrenarse de extremo a extremo contra la distribucion del padre en la propia pasada forward del estudiante sin reimplementar el codec. El autor lo describe como la segunda fase de EfficientQAT aplicada a un fichero ya existente.

La relevancia practica es que ofrece una mejora medible de fidelidad respecto al fichero IQ3_S sin cambios de formato ni de ruta de carga: cualquier motor que lea el fichero de origen lee este. La mejora, sin embargo, es de margen estrecho y esta declarada como "pasa el umbral", no como "mejor que el origen" con significacion estadistica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B; las etiquetas del repositorio incluyen gated-deltanet, lo que apunta a capas de atencion lineal Gated DeltaNet, pero la composicion de capas no se detalla en la informacion disponible |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Fichero publicado en IQ3_S; la asignacion RCO del origen reparte tipos por tensor, con tensores IQ1_M, F32 y BF16 sin cuantizar en el mismo fichero; los formatos de bloque citados con campo `dmin` son Q2_K y Q4_K |
| Idiomas soportados | no disponibles en la ficha del autor; el corpus de destilacion de escalas es prosa en ingles (Wikitext-103) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (11.771.546.784 bytes) |

## Arquitectura y entrenamiento

El fichero es un GGUF IQ3_S del modelo Qwen3.8-27B, con una densidad efectiva de aproximadamente 3,50 bits por parametro (11.771.546.784 bytes para 26.895.998.464 parametros). La cuantizacion de partida la produjo ISTA-DASLab combinando GSQ (optimizacion de la rejilla entera por gradiente) y RCO (asignacion de tipo por tensor bajo restriccion de tamanio). Sobre ese fichero, el autor solo ha modificado los campos fp16 `d` de 399 tensores cuantizados (103.567.360 bloques) y los campos `dmin` donde el formato los lleva. Todo lo demas —codigos enteros, indices, signos, tensores F32, BF16 e IQ1_M, escalas de embedding y de la cabeza de salida, metadatos y offsets— es byte a byte igual al origen.

El entrenamiento de escalas consistio en 300 pasos con 4 secuencias de 512 tokens por paso (0,6 millones de tokens en total), learning rate 3e-4 con decaimiento coseno, y una KL forward top-64 respecto al padre agrupando la cola en un unico bucket. Solo las escalas eran entrenables y se mantenia residente un bloque decodificador a la vez en una porcion de 24 GB de GPU. La mezcla de destilacion era, deliberadamente, mitad prosa de Wikitext-103, porque es en prosa donde las variantes de baja precision de este modelo se separan del padre; la composicion de la otra mitad no se detalla en la informacion disponible. Tras escribir el fichero, cada tensor parcheado se redecodifico con el decoder `gguf` de referencia y se comprobo que coincide con los pesos entrenados, que cada tensor no parcheado es identico al origen y que el mayor cambio en un peso decodificado es 0,0195. `RECOVERY.json` registra el SHA-256 del fichero fuente, la revision del padre, el hash del checkpoint de entrenamiento y el hash de salida.

## Capacidades

- Generacion de texto autorregresiva y uso conversacional: la etiqueta `conversational` figura en el repositorio, heredada del modelo base.
- Fidelidad de distribucion al padre BF16 en prosa: con el protocolo del autor, KLD media 0,0450 y top-1 cualificado por margen del 97,80% sobre 500 posiciones retenidas de Wikitext-2.
- Capacidades heredadas de Qwen3.8-27B (razonamiento, codigo, matematicas, multilingue): no evaluadas ni cuantificadas en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (la ficha no publica lista de idiomas ni evaluacion multilingue).
- Capacidades especiales (modo thinking, vision, audio): no evaluadas. El autor indica que la evaluacion multimodal del padre no se ha realizado sobre este fichero.

## Casos de uso

- Ejecucion local en CPU de un modelo de 27B: al ser un GGUF de 11,77 GB con tipos IQ2/IQ3 que el runner del autor sirve en CPU, permite desplegar el modelo en maquinas sin GPU dedicada, asumiendo la latencia asociada.
- Sustitucion directa en pipelines GGUF existentes: al conservar cabecera, lista de tensores y offsets, puede reemplazar al fichero `ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF` sin cambios de integracion y con una KLD medida inferior (0,0480 a 0,0450 en las mismas posiciones).
- Generacion de texto en prosa y tareas de continuacion: es el dominio donde se entreno la recuperacion de escalas y donde se midio la mejora (top-1 cualificado 97,60% a 97,80%).
- Investigacion sobre cuantizacion post hoc: sirve como caso reproducible de entrenamiento de escalas sobre un GGUF fijo, util para estudiar cuanto de la degradacion de un IQ3_S es atribuible a las escalas y no a los codigos.
- Servicio HTTP local con `xyntetik-runner`: `runner -m Qwen3.8-27B-GSQ-RCO-IQ3_S-recovered.gguf --serve --port 8080` levanta una API compatible con motores GGUF en una estacion de trabajo, con residencia en CPU para los tipos IQ2/IQ3.
- Base para comparativas de fidelidad entre protocolos: permite contrastar KLD variante-referencia (top-20) frente a KL teacher-student (top-64 con bucket de cola), ya que el autor publica ambas mediciones sobre el mismo fichero.
- Despliegue en estaciones con una GPU de 24 GB: los pesos ocupan 11,77 GB, por lo que cabe con holgura en una RTX 4090 o A100 40 GB para pruebas de inferencia, siempre que el motor soporte la carga (el runner del autor no reclama residencia en GPU para estos tipos en esta version).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor anuncia un anexo con una submuestra emparejada de HellaSwag frente al padre, pendiente de publicacion, y advierte explicitamente que la fidelidad al padre no es un benchmark de capacidad.

Metricas de fidelidad publicadas (protocolo `scripts/kld-compare-raw.py`, contra el padre BF16, mismas 500 posiciones retenidas de Wikitext-2, banda de empate 0,5 nats):

| Fichero | KLD media | top-1 | top-1 cualificado por margen | solapamiento top-8 |
|---|---:|---:|---:|---:|
| IQ3_S GSQ-RCO de origen, sin modificar | 0,0480 | 86,60% | 97,60% | 0,882 |
| Este fichero (escalas recuperadas) | 0,0450 | 87,20% | 97,80% | 0,884 |

Umbral declarado por el autor: KLD <= 0,05 y top-1 cualificado por margen >= 97%. Este fichero: PASS. El intervalo de confianza del 95% emparejado sobre la diferencia de KLD es [−0,0098, +0,0038] e incluye el cero con este tamanio de muestra; el autor afirma "pasa el umbral", no "mejor que el origen".

Protocolo de seleccion, usado solo durante el desarrollo y no comparable con el anterior (KL forward top-64 y acuerdo top-1 contra el padre en la pasada forward del estudiante):

| Conjunto de desarrollo | KL top-64 antes → despues | top-1 antes → despues |
|---|---|---|
| Mixto (SmolTalk test) | 0,1939 → 0,1379 | 89,38% → 89,95% |
| Prosa (Wikitext-2 test) | 0,0485 → 0,0437 | 89,74% → 90,64% |

## Requisitos de hardware

- VRAM para los pesos: 11,77 GB (11.771.546.784 bytes, ~3,50 bits por parametro) en precision de almacenamiento; es una estimacion a partir del tamanio de fichero, no un dato publicado por el autor.
- Overhead adicional: no cuantificado en la informacion disponible, ya que no se especifica la longitud de contexto ni el coste de cache KV. En la practica hay que sumar buffers de inferencia y cache KV proporcional al contexto configurado.
- GPU recomendadas: A100 40 GB, H100 y RTX 4090 (24 GB) alojan los pesos con holgura; tarjetas de 16 GB (RTX 4080, 4070 Ti Super) deberian ser suficientes con contexto corto segun la estimacion de tamanio; tarjetas de 12 GB requeririan offload parcial de capas.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM, sujeto al soporte del motor de inferencia.
- Residencia en GPU: el autor indica que los tipos IQ2/IQ3 de este fichero se sirven en CPU con Runner en esta version y que no reclama residencia en GPU.
- Opciones de despliegue: `xyntetik-runner` (referencia del autor, CPU para IQ2/IQ3), llama.cpp y cualquier motor que lea el fichero de origen sin cambios; otros cargadores GGUF con soporte de IQ3_S. No aplica el despliegue en formato safetensors (vLLM, TGI) salvo conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos en la informacion proporcionada sobre otros modelos comparables de terceros. La comparacion posible es interna al linaje del propio fichero:

| Aspecto | IQ3_S GSQ-RCO de origen (ISTA-DASLab) | Este fichero | Padre BF16 (Qwen3.8-27B) |
|---|---|---|---|
| Parametros totales | 26.895.998.464 (heredado del padre) | 26.895.998.464 | 26.895.998.464 |
| Formato | GGUF IQ3_S | GGUF IQ3_S | no disponible (pesos sin cuantizar) |
| Tamanio de fichero | 11.771.546.784 bytes | 11.771.546.784 bytes (identico) | no disponible |
| KLD media vs padre | 0,0480 | 0,0450 | referencia (0 por definicion) |
| top-1 cualificado por margen | 97,60% | 97,80% | referencia |
| Licencia | no disponible en la informacion proporcionada | apache-2.0 | no disponible en la informacion proporcionada |
| Contexto | no disponible | no disponible | no disponible |
| Residencia en GPU | no reclamada para IQ2/IQ3 en Runner | no reclamada para IQ2/IQ3 en Runner | no disponible |

## Limitaciones y advertencias

- La fidelidad al padre no es un benchmark de capacidad: las filas de KLD miden el parecido de distribuciones de siguiente token en prosa retenida, no la calidad en tareas.
- El autor no reclama "sin perdida de calidad" y afirma que esa afirmacion no esta respaldada por la evidencia presentada.
- Margen estrecho: 97,80% frente a un umbral del 97% sobre 500 posiciones.
- Dos protocolos de fidelidad no intercambiables (KLD variante-referencia sobre top-20 frente a KL teacher-student sobre top-64 con cola agrupada) y ninguno equivalente a la KLD de vocabulario completo.
- Residencia en CPU: los tipos IQ2/IQ3 de este fichero no son residentes en GPU con Runner en esta version, lo que limita el throughput en despliegues de produccion.
- Contaminacion de datos de seleccion: el corpus de entrenamiento, los dos conjuntos de desarrollo y el corpus del arnes se usaron para construir o seleccionar este fichero; solo el anexo de benchmarks anunciado queda fuera.
- Evaluacion multimodal no realizada sobre este fichero.
- Lista de idiomas soportados no publicada; el corpus de destilacion de escalas es prosa en ingles.
- Longitud de contexto no especificada, lo que impide estimar con precision el consumo de memoria en produccion.
- Repositorio con 0 descargas y 1 "like" en el momento de la consulta: no hay validacion independiente por parte de terceros.
- Licencia apache-2.0 declarada en el repositorio; conviene verificar las condiciones del modelo base Qwen3.8-27B antes de un uso comercial.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/Joakimpalm-Zen/Qwen3.8-27B-GSQ-RCO-IQ3_S-recovered-GGUF
- Modelo base (cuantizacion de origen): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo padre: https://huggingface.co/Qwen/Qwen3.8-27B
- Referencias arXiv citadas en las etiquetas del repositorio (contenido no verificado en esta ficha): https://arxiv.org/abs/2604.18556 y https://arxiv.org/abs/2605.00649
- Las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo ni sobre su metodo de recuperacion de escalas.
