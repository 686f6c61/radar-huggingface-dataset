# cortex-agent-llc/kodiak-v0.4-1b-accuracy

## Resumen

Kodiak-v0.4-1B (modo accuracy) es un modelo de decisión encoder-only desarrollado por Cortex Agent LLC, disenado especificamente para tareas de "lee esto y decide". No es un modelo generativo: recibe un estado (texto, lista de textos o JSON) junto con preguntas tipadas y devuelve respuestas calibradas de tipo eleccion (choice), puntuacion (score) o "no lo se" (can't tell) en un unico pase forward. Su objetivo es automatizar trabajo rutinario de enrutado, triaje, guardrails y verificaciones, derivando a un humano o a un LLM los casos en los que no esta seguro.

Este checkpoint concreto es un ensemble de tres miembros Kodiak-v0.4-1B: cada pregunta la responden los tres modelos y sus respuestas calibradas se promedian, con un coste de computo de aproximadamente 3 veces el del modelo individual. Esta construido sobre Ettin-encoder-1B (Johns Hopkins, licencia MIT), un encoder de tipo ModernBERT con alrededor de 1.040 millones de parametros. La licencia del checkpoint es Apache 2.0 y solo soporta ingles.

La relevancia de la version 0.4 radica en dos correcciones concretas respecto a la 0.3: la eliminacion de atajos por palabras clave (keyword shortcuts) mediante pruebas contrastivas y grupos de contraste, y una mejora sustancial en la calibracion de la confianza. Segun el autor, v0.4 no mejora la precision en tareas nunca vistas, pero si mejora la elegibilidad de reembolsos, la calibracion y la resistencia a pruebas con palabras cambiadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base ModernBERT, via Ettin-encoder-1B); ensemble de 3 miembros |
| Parametros totales | ~1.040 millones por miembro; ~3.120 millones en el ensemble (3 miembros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se indica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 12,5 GB |
| Libreria de inferencia | kodiak (propietaria) |
| Pipeline de HuggingFace | no disponible |
| Modelo base | jhu-clsp/ettin-encoder-1b |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-09 |

## Arquitectura y entrenamiento

Kodiak-v0.4-1B se apoya en Ettin-encoder-1B, un encoder de la familia ModernBERT con aproximadamente 1.040 millones de parametros, desarrollado por Johns Hopkins bajo licencia MIT. Kodiak lo convierte en un modelo de decision no generativo: en lugar de producir texto libre, realiza preguntas tipadas con un conjunto finito de etiquetas y emite una distribucion de probabilidad sobre esas etiquetas en un solo pase forward. El modo accuracy combina tres instancias del modelo (ensemble) y promedia sus respuestas calibradas, lo que reduce el error de calibracion de 0.070 (modelo individual) a 0.059 y eleva la precision forzada en tareas nunca vistas de 0.685 a 0.696.

Respecto al entrenamiento, la version 0.4 introduce lo que el autor denomina pruebas contrastivas y grupos de contraste. En las pruebas contrastivas el mismo caso se plantea dos veces con un unico detalle cambiado que altera la respuesta correcta, de modo que un atajo por palabras clave no puede acertar ambas versiones. En los grupos de contraste se escribe un campo compartido bajo cada respuesta y se fuerzan las mismas palabras de enlace ("but", "if", "before"), de forma que solo los hechos determinen la decision. El umbral de abandono (abstention) de 0.6 en modo accuracy se ajusto unicamente sobre datos de validacion. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion y decision sobre texto, listas de textos o JSON mediante preguntas tipadas con etiquetas predefinidas.
- Respuestas con probabilidad calibrada para cada etiqueta, lo que permite fijar umbrales de confianza.
- Abandono explicito ("can't tell"): el modelo puede declarar que no puede decidir, con una precision reportada de 0.90-0.94 en funcion de la configuracion.
- Deteccion de infraccion de politicas escritas (por ejemplo, reglas de un marketplace o condiciones de reembolso).
- Verificacion de respaldo de respuestas (RAG): comprobar si una respuesta larga esta sustentada por sus fuentes.
- Juicio de preferencia tipo LLM-judge: elegir que respuesta prefirieron evaluadores humanos (evaluado con MT-Bench).
- Analisis de postura (stance) de un texto respecto a un objetivo (evaluado con SemEval-2016).
- Deteccion de alucinaciones y uso como guardrail en pipelines de agentes.
- Ranking de sus propios errores: ordena por confianza y coloca sus fallos al final en el 56,1% de los casos (nunca vistos), frente al 14,7% de Qwen3-8B.
- Soporte de tool calling / function calling y agentes: no indicado de forma explicita en la informacion disponible.
- Capacidades multilingues: no, solo ingles.
- Capacidades de vision, audio o modo de razonamiento extendido: no disponibles.

## Casos de uso

- Moderacion y guardrails de contenido en marketplaces: se define una politica escrita y el modelo decide que regla infringe un mensaje. En el ejemplo del autor, identifica correctamente que publicar un numero de telefono personal infringe la "regla 3" con confianza 0.77, sin necesidad de un LLM generativo.
- Tramitacion de reembolsos y elegibilidad bajo condiciones: dada una politica de devoluciones y la solicitud de un cliente, el modelo responde "si", "no" o "no se puede decidir". En el ejemplo, resuelve que el cliente no es elegible con confianza 1.00, por exceder el plazo de 30 dias.
- Triaje y enrutado de casos entrantes: al devolver una etiqueta con probabilidad calibrada, permite derivar automaticamente cada caso al departamento correcto y escalar a un humano los que queden por debajo del umbral de 0.6.
- Verificacion de respuestas en sistemas RAG: comprobar si una respuesta generada por un LLM esta respaldada por los documentos recuperados, con una habilidad corregida por azar de +0.39 en RAGBench. Util como capa de control antes de mostrar la respuesta al usuario.
- Juez automatico en evaluacion de modelos: elegir, entre dos respuestas, la que preferirian expertos humanos (MT-Bench, +0.30 de habilidad corregida por azar), con bajo coste de latencia (~38 ms por peticion en modo individual).
- Deteccion de alucinaciones en produccion: combinar la pregunta de verificacion con el umbral de abandono para marcar como dudosas las salidas no soportadas, reduciendo el riesgo de mostrar informacion inventada.
- Analisis de postura en redes sociales o encuestas: clasificar la postura de un texto respecto a un tema (SemEval-2016, +0.38 de habilidad corregida por azar), util para monitorizacion de opinion a escala.
- Clasificacion por lotes de bajo coste: al ser un encoder de 1B con un unico pase forward, es adecuado para procesar grandes volumenes de casos donde un LLM generativo seria demasiado caro o lento.

## Benchmarks y rendimiento

En el conjunto de evaluacion congelado v0.2 del autor (preguntas de eleccion):

| Metrica | Kodiak-v0.3-1B | Kodiak-v0.4-1B | v0.4 accuracy mode | Qwen3-8B (LLM) |
|---|---|---|---|---|
| Tareas nunca vistas, precision forzada | 0,687 ± 0,010 | 0,685 ± 0,011 | 0,696 | 0,688 |
| Tareas familiares | 0,879 | 0,880 | 0,888 | 0,710 |
| Ordena sus propios errores al final (nunca vistas) | 54,5% | 54,5% | 56,1% | 14,7% |
| Error de calibracion (nunca vistas; menor es mejor) | 0,076 | 0,070 | 0,059 | 0,293 |
| Cuando dice "can't tell", acierta | 0,93 | 0,94 | 0,90 | – |
| Latencia (GPU, una peticion) | ~38 ms | ~38 ms | ~3x | ~1.500 ms |

El checkpoint publicado (accuracy mode) es la ejecucion con semilla 1, elegida por perdida de validacion y nunca por el conjunto de evaluacion. Sus puntuaciones propias son: 0,676 en precision forzada nunca vista, 0,873 en tareas familiares, 0,061 de error de calibracion en tareas nunca vistas y 0,972 de precision en la clase "can't tell".

En pruebas contrastivas del autor (proporcion de pares en los que ambas versiones se responden correctamente; medias de tres ejecuciones):

| Prueba contrastiva | Kodiak-v0.3-1B | Kodiak-v0.4-1B |
|---|---|---|
| Elegibilidad de reembolso, primera prueba (50 pares) | 0,22 | 0,79 |
| Elegibilidad de reembolso, pares cue-hard (128 pares) | 0,27 | 0,58 |
| Seguridad de paso de agente, primera prueba (50 pares) | 0,05 | 0,35 |
| Seguridad de paso de agente, pares cue-hard (54 pares) | 0,13 | 0,29 |

En modo accuracy, las mismas pruebas dan: reembolso 0,80 (primera) y 0,64 (cue-hard); seguridad de paso 0,40 y 0,33.

En datos reales no vistos durante el entrenamiento (habilidad corregida por azar, 0 = adivinar; medias de tres ejecuciones):

| Prueba con datos reales | Kodiak-v0.3-1B | Kodiak-v0.4-1B | v0.4 accuracy mode |
|---|---|---|---|
| RAGBench: respuesta larga respaldada por sus fuentes | +0,41 | +0,39 | +0,40 |
| MT-Bench: que respuesta prefirieron expertos humanos | +0,29 | +0,30 | +0,31 |
| SemEval-2016: postura de un tuit hacia un objetivo | +0,37 | +0,38 | +0,37 |
| Media | 0,36 | 0,36 | 0,36 |

## Requisitos de hardware

- VRAM estimada: cada miembro tiene ~1.040 millones de parametros. En precision completa (fp32) cada miembro ocupa aproximadamente 4,2 GB, lo que da unos 12,5 GB para los tres (coincide con el tamano del repositorio). En fp16/bf16 cada miembro ocupa alrededor de 2 GB y el ensemble unos 6 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para el ensemble en fp16 (RTX 3060/4060 y superiores). Para fp32 se recomienda al menos 16 GB (RTX 4080, RTX 4090, A100, H100). El modelo individual cabe holgadamente en cualquier GPU de consumo moderna.
- Cabe en GPU de consumo: si. Un unico miembro en fp16 ocupa unos 2 GB, por lo que entra en practicamente cualquier GPU de consumo; el ensemble completo en fp32 requiere alrededor de 12,5 GB.
- Opciones de despliegue: la model card usa la libreria propietaria kodiak (`pip install "kodiak-s1[infer]"`). El campo `inference: false` de la model card indica que no esta habilitada la inferencia estandar de HuggingFace. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 38 ms por peticion en GPU para el modelo individual, y alrededor de 3 veces ese tiempo (unos 114 ms) en modo accuracy. La comparativa del autor situa a Qwen3-8B en torno a 1.500 ms por peticion, es decir, mas de un orden de magnitud mas lento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision forzada (nunca vistas) | Calibracion (error; menor mejor) | Licencia | Tipo |
|---|---|---|---|---|---|---|
| Kodiak-v0.4-1B accuracy | ~3,12B (3x1,04B) | no disponible | 0,696 | 0,059 | Apache 2.0 | Ensemble encoder |
| Kodiak-v0.4-1B (individual) | 1,04B | no disponible | 0,685 ± 0,011 | 0,070 | Apache 2.0 | Encoder |
| Kodiak-v0.3-1B | 1,04B | no disponible | 0,687 ± 0,010 | 0,076 | Apache 2.0 | Encoder |
| Qwen3-8B | 8B | no disponible en la informacion | 0,688 | 0,293 (0,178 tras recalibracion ajustada) | no disponible en la informacion | LLM generativo |
| Ettin-encoder-1B (base) | 1,04B | no disponible | no disponible | no disponible | MIT | Encoder |

Nota: Kodiak y Qwen3-8B no son directamente comparables en arquitectura (encoder de decision frente a LLM generativo), pero el autor los enfrenta en su conjunto de evaluacion de preguntas de eleccion. Qwen3-8B es mayoritariamente sobreconfiado en una cantidad constante, por lo que una recalibracion ajustada mejora su error de 0,293 a 0,178, aun por encima del 0,059 de Kodiak en modo accuracy.

## Limitaciones y advertencias

- Seguridad de paso de agente no fiable: el autor indica explicitamente que esta capacidad "no es fiable" y advierte de que no debe usarse como mecanismo de seguridad. Las puntuaciones en pruebas contrastivas (0,35 y 0,29 en el modelo individual; 0,40 y 0,33 en accuracy) lo confirman.
- v0.4 no mejora la precision en tareas nunca vistas respecto a v0.3; sus mejoras se limitan a elegibilidad de reembolsos, calibracion y resistencia a atajos por palabras clave.
- Solo ingles: el modelo unicamente declara soporte para el idioma ingles, lo que lo inhabilita para produccion en castellano u otros idiomas.
- Riesgo de alucinacion: aunque el modelo esta orientado a la deteccion de alucinaciones y a la abstencion, su naturaleza de clasificador no elimina el riesgo de clasificaciones erroneas; el autor recomienda derivar los casos dudosos a un humano o a un LLM.
- Modelo no generativo: no produce texto libre ni justificaciones; solo etiquetas, puntuaciones o abandono. No es adecuado para tareas de generacion.
- Umbral de abandono: el valor de 0.6 esta ajustado sobre datos de validacion del autor; puede requerir recalibracion en dominios distintos.
- Incertidumbre en el despliegue: `inference: false` y dependencia de una libreria propietaria (kodiak) dificultan la integracion en stacks estandar.
- Adopcion nula en el momento de la ficha: 0 descargas y 0 likes, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Fecha de publicacion inusual: el repositorio figura creado el 2026-10-09, fecha posterior a la actual, lo que conviene verificar.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Ettin-encoder-1B esta bajo licencia MIT de Johns Hopkins, cuyos terminos conviene revisar por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cortex-agent-llc/kodiak-v0.4-1b-accuracy
- Modelo individual (v0.4-1B): https://huggingface.co/cortex-agent-llc/kodiak-v0.4-1b
- Repositorio de codigo y registro de construccion: https://github.com/grizzlypeaksoftware/kodiak
- Modelo base (Ettin-encoder-1B, Johns Hopkins): https://huggingface.co/jhu-clsp/ettin-encoder-1b
