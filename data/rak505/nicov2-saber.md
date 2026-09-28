# Rak505/NicoV2-Saber

## Resumen

NicoV2-Saber es una publicación de pesos compuesta por adaptadores LoRA y cabezas de clasificación personalizadas para el modelo multimodal Qwen2.5-Omni-3B, desarrollada por el usuario Rak505. No se trata de un modelo de lenguaje autónomo ni de un adaptador PEFT estándar: es un componente de etiquetado de acciones en streaming de audio que predice intención, probabilidad de commit, etiquetas BIO por slot y, desde la versión v2, señales de control de abandono, revisión y vacilación. Los pesos del modelo base no se incluyen en el repositorio, cuyo tamaño es de 0,1 GB.

El componente está pensado para integrarse en un harness externo (el proyecto VoiceSynth) que se encarga de la resolución de slots, la política de decisión, la ejecución de herramientas y la generación de respuestas. El modelo consume audio a 16 kHz procesado en bloques de 250 ms, lo que lo sitúa en el ámbito de los asistentes conversacionales por voz con capacidad de tool calling, pero el propio autor advierte que no constituye por sí solo un asistente ejecutivo completo.

La relevancia de esta publicación es fundamentalmente de investigación: expone checkpoints históricos con trazabilidad de hashes, documenta de forma explícita dos versiones no desplegables (v4 y v4b) y reporta resultados de desarrollo que no han sido validados en un conjunto de test independiente. Su licencia, heredada del modelo base (Qwen Research License Agreement), restringe el uso a investigación y evaluación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA rank-16 (alpha 32, escala 2) sobre proyecciones q/k/v/o hasta la capa 18 del Thinker de Qwen2.5-Omni-3B, mas cabezas de clasificacion que leen estados ocultos de 2.048 dimensiones a traves de un MLP compartido de 256 dimensiones |
| Parametros totales | No disponible (el repositorio ocupa 0,1 GB; el modelo base Qwen2.5-Omni-3B ronda los 3.000 millones de parametros y no se distribuye aqui) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la inferencia opera sobre bloques de audio de 250 ms a 16 kHz; no se declara ventana de contexto en tokens) |
| Tipos de cuantizacion | No disponible (los checkpoints se distribuyen en serializacion PyTorch nativa; no se publican variantes cuantizadas GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Ingles (en) |
| Licencia | Qwen Research License Agreement (licencia "other", heredada del modelo base; uso no comercial de investigacion y evaluacion) |
| Formato de pesos | PyTorch `.pt` (no safetensors, no GGUF). Cada fichero contiene las claves `lora`, `heads`, `config`, `step` y `opt` (con valor `None` en estas instantaneas exportadas) |

## Arquitectura y entrenamiento

El componente inyecta adaptadores LoRA de rango 16 con alpha 32 y escala 2 sobre las proyecciones de query, key, value y output del Thinker hasta la capa 18 inclusive. Sobre los estados ocultos de 2.048 dimensiones, un MLP compartido de 256 dimensiones alimenta varias cabezas que producen: intencion, probabilidad de commit, etiquetas BIO por slot y, a partir de v2, controles de abandono, revision y vacilacion. Los buffers de normalizacion (media y desviacion tipica) forman parte del checkpoint y deben cargarse junto con los pesos.

El repositorio publica siete checkpoints correspondientes a distintas iteraciones: v6 (`v6/lora_tagger.pt`, seleccionado para la demo historica), v2 (rollback designado), v1, v3, v5 (historicos no seleccionados), v4 (`v4/checkpoint-epoch-001.pt`, ejecucion experimental incompleta sin checkpoint final, marcada como no desplegable) y v4b (rechazada por contaminacion semantica en las etiquetas de entrenamiento, tambien no desplegable). Cada `.pt` es una copia byte a byte de su original preservado. Los ficheros `MANIFEST.json` registran tamanos, SHA-256 y el mapeo entre rutas de origen y hashes; `recommended.json` conserva el registro historico de seleccion local, con rutas que se refieren al repositorio de origen y no a la disposicion del Hub. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La implementacion de inferencia prevista es la clase `LoraTagger` del modulo `tagger.lora_tagger` del arbol de codigo fuente de NicoV2/VoiceSynth, que requiere el modelo base ya cacheado en local y las dependencias del proyecto original. En el momento de la publicacion se observo la revision `08222e3f158e3870cfee6b97766fa2bc6103df85` del repositorio [`DerekWWang/voicesynth`](https://github.com/DerekWWang/voicesynth), sin que se afirme que sea la revision original de entrenamiento.

## Capacidades

- Etiquetado de acciones en streaming: procesa audio a 16 kHz en bloques de 250 ms y emite predicciones por bloque.
- Prediccion de intencion: clasifica la intencion del usuario a partir del audio y el estado del dialogo.
- Probabilidad de commit: estima si el usuario ha confirmado o comprometido una accion.
- Etiquetado BIO por slot: identifica los argumentos de cada slot para su posterior resolucion en el harness.
- Controles de dialogo (desde v2): cabezas especificas para abandono, revision y vacilacion.
- Soporte de tool use condicionado: los tags alimentan un harness externo que ejecuta herramientas, pero el modelo no ejecuta las herramientas por si mismo.
- Integracion en agentes multi-paso: el harness gestiona la politica y la secuencia de acciones a partir de las etiquetas emitidas.
- Capacidad multilingue: no disponible; la model card solo declara ingles.
- Vision y audio del modelo base: el componente es un adaptador de etiquetado sobre Qwen2.5-Omni-3B; la model card no atribuye capacidades adicionales de vision o generacion de voz al adaptador y descarta explicitamente que sea una voz TTS o la arquitectura NicoV2-Nelly.

## Casos de uso

- Etiquetado de intenciones en asistentes de voz en tiempo real: el modelo consume bloques de 250 ms y emite intencion y tags BIO que el harness traduce en acciones, lo que permite reaccionar durante la conversacion en lugar de esperar al final del turno.
- Deteccion de confirmaciones en dialogos hablados: la cabeza de probabilidad de commit sirve para decidir cuando el usuario ha dado luz verde a una accion, con la salvaguarda de que el autor reporta errores de commit prematuro.
- Resolucion de slots en flujos de reserva o cancelacion: las etiquetas BIO por slot alimentan el modulo de resolucion del harness, que es donde reside la logica de negocio; en la evaluacion de desarrollo, v6 logro 9/25 coincidencias estrictas de todos los argumentos sobre 25 llamadas.
- Deteccion de abandono, revision y vacilacion: las cabezas de control introducidas desde v2 permiten que el harness reaccione cuando el usuario se retracta o duda, algo util en sistemas de confirmacion de operaciones.
- Investigacion sobre decodificacion por bloques en audio: el componente publica snapshots historicos con hashes verificables, lo que permite reproducir experimentos y comparar la evolucion entre versiones (v1 a v6) en tareas de etiquetado en streaming.
- Analisis de llamadas de atencion al cliente en modo batch o streaming: el etiquetado de intencion y slots puede alimentar analitica posterior, siempre dentro del marco de investigacion no comercial que impone la licencia.
- Prototipado de agentes de voz con guardarrailes: al no estar autorizado para escrituras externas no supervisadas, encaja en entornos de sandbox con estado, autorizacion en el harness y confirmaciones explicitas antes de acciones con consecuencias.
- Evaluacion comparativa de estrategias de ajuste fino: la coexistencia de checkpoints seleccionados, rechazados y contaminados permite estudiar el impacto de decisiones de seleccion y de contaminacion de etiquetas sin desplegar los modelos afectados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente aporta resultados de desarrollo obtenidos con voz real, que el propio autor califica como resultados historicos inspeccionados repetidamente y no como estimaciones insesgadas sobre un conjunto de test reservado.

| Metrica (desarrollo, voz real, 25 casos) | v6 | v2 |
|---|---|---|
| Llamadas resueltas | 19/25 | 20/25 |
| Coincidencia estricta de todos los argumentos | 9/25 | No disponible en la informacion proporcionada |
| Conjunto de evaluacion | 25 casos de voz real, resultados historicos de desarrollo | 25 casos de voz real, resultados historicos de desarrollo |

Notas adicionales reportadas: los tiempos de replay excluyen la espera sincrona de ASR y TTS; en `recommended.json` figuran los resultados originales de alcance y controles sobre datos sinteticos ampliados; no se repitio ninguna evaluacion ni se promociono ningun checkpoint como parte de esta publicacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa, el modelo base Qwen2.5-Omni-3B en BF16 requiere del orden de 6-8 GB solo para pesos, a lo que hay que sumar activaciones, encoder de audio y cache KV del streaming; un rango de 10-16 GB de VRAM es un punto de partida razonable, pero debe validarse en el entorno real.
- GPU recomendadas: el ejemplo de la model card usa `device="cuda"` sin especificar modelo de GPU. Por tamano del modelo base, una RTX 4090 (24 GB), L40S, A100 o H100 son opciones holgadas; GPUs con 12 GB podrian ser suficientes segun la precision y el tamano de lote, pero no esta confirmado en la informacion disponible.
- Cabe en GPU de consumo: previsiblemente si en tarjetas de 12-24 GB (por ejemplo RTX 3060 12 GB, RTX 4070 Ti, RTX 4090), condicionado a que el modelo base quepa junto con el encoder de audio y el cache de streaming. No hay confirmacion oficial.
- Opciones de despliegue: el componente no incluye un paquete de inferencia autonomo. Se requiere la implementacion `tagger.lora_tagger.LoraTagger` del checkout de NicoV2/VoiceSynth y el modelo base cacheado en local. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni motores similares, dado que el formato es `.pt` y el codigo de carga es personalizado.
- Latencia y throughput: la ventana de proceso es de bloques de 250 ms, pero el autor aclara que se trata de una configuracion de bloque y no de una afirmacion de que la ejecucion completa de herramientas o del habla ocurra en 250 ms. No se publican cifras de latencia ni de throughput.
- Almacenamiento y trazabilidad: el repositorio pesa 0,1 GB y se recomienda fijar `revision` a un commit concreto del Hub y verificar los hashes del manifiesto antes de cargar los `.pt`.

## Comparativa con modelos similares

No se ha identificado en la informacion proporcionada ningun componente publico equivalente de etiquetado de acciones en streaming sobre Qwen2.5-Omni. La comparacion mas directa disponible es contra el propio modelo base y su variante de mayor tamano, aunque cubren tareas distintas.

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NicoV2-Saber (este modelo) | Adaptador LoRA + cabezas sobre base de ~3.000 millones | No disponible | Etiquetado de intencion, commit, slots BIO y controles de dialogo en streaming de audio | Qwen Research License Agreement (uso no comercial) | Pesos `.pt` en el Hub; requiere VoiceSynth y el modelo base |
| Qwen2.5-Omni-3B | ~3.000 millones | No disponible en la informacion proporcionada | Modelo omnimodal base (texto, audio, imagen, video) | Qwen Research License Agreement | Publico en HuggingFace |
| Qwen2.5-Omni-7B | No disponible | No disponible | Modelo omnimodal base de mayor tamano | Qwen Research License Agreement | Publico en HuggingFace |
| Otros etiquetadores de intencion en streaming | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la informacion disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: son adaptadores y cabezas para Qwen2.5-Omni-3B; no es un modelo de lenguaje independiente, ni un adaptador PEFT estandar, ni una voz TTS, ni la propuesta arquitectura NicoV2-Nelly.
- No incluye los pesos del modelo base, que deben obtenerse por separado y quedan sujetos a su propia licencia.
- Restriccion de licencia: Qwen Research License Agreement, con concesion limitada a investigacion y evaluacion no comercial. El uso comercial exige una licencia aparte de Alibaba Cloud. La disponibilidad publica de descarga no otorga derechos comerciales sin restricciones y esta publicacion no asigna ninguna licencia permisiva adicional a los componentes personalizados.
- Resultados de evaluacion no concluyentes: los numeros de v6 y v2 provienen de 25 casos de voz real inspeccionados repetidamente, no de un conjunto de test reservado e insesgado. No debe interpretarse `recommended.json` como un benchmark nuevo ni como una garantia de seguridad de despliegue.
- Errores documentados: errores en acciones negativas, commits prematuros, rendimiento debil en notas implicitas y casos de programacion de citas, y generalizacion incompleta a peticiones multiframe y a esquemas de herramientas nuevos.
- Prohibicion de escrituras externas no supervisadas: ningun modelo de esta publicacion esta autorizado para escrituras externas sin supervision. Se exige un sandbox con estado, autorizacion aplicada en el harness y confirmacion explicita antes de acciones con consecuencias.
- Riesgo de alucinacion: no se cuantifica en la model card, pero la tarea de prediccion de intencion y slots sobre audio es sensible a errores que pueden propagarse al harness si este no valida las salidas.
- Limitacion idiomatica: la unica lengua declarada es el ingles.
- Checkpoints no desplegables: `v4/checkpoint-epoch-001.pt` corresponde a una ejecucion experimental incompleta y `v4b/lora_tagger.pt` fue rechazado por contaminacion semantica de las etiquetas de entrenamiento. No deben elegirse aunque presenten una perdida de entrenamiento menor.
- Carga de artefactos no seguros: los ficheros son serializacion PyTorch `.pt` (no safetensors) y solo deben cargarse si son de confianza y han sido verificados por hash. Cargar un checkpoint no requiere `trust_remote_code`.
- Frontera de runtime: el bloque de 250 ms es una configuracion de proceso; no implica que la ejecucion completa de herramientas ni la sintesis de voz terminen en ese plazo. Los tiempos de replay registrados excluyen la espera sincrona de ASR y TTS.
- Dependencia de codigo externo: la inferencia requiere el checkout de VoiceSynth, cuyas dependencias y visibilidad de acceso son ajenas a esta publicacion y pueden cambiar.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rak505/NicoV2-Saber
- Modelo base Qwen2.5-Omni-3B: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Repositorio de codigo fuente VoiceSynth: https://github.com/DerekWWang/voicesynth
- Revision observada del repositorio en el momento de la publicacion: `08222e3f158e3870cfee6b97766fa2bc6103df85`
- Ficheros auxiliares incluidos en el repositorio: `MANIFEST.json`, `recommended.json`, `inference_config.json` por version, `LICENSE` y `Notice`
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados corresponden a contenido no relacionado y se descartan como fuentes.
