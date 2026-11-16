# Inferoid/inferoid-notes-e4b

## Resumen

inferoid-notes-e4b es un ajuste fino del modelo Gemma 4 E4B instruido de Google, desarrollado por Inferoid, orientado especificamente a la generacion automatica de notas de reunion a partir de transcripciones de llamadas. El modelo se distribuye en formato MLX cuantizado a 4 bits (3,9 GB) y esta pensado para ejecutarse localmente en Macs con Apple Silicon y al menos 16 GB de memoria unificada, sin que ningun dato salga del dispositivo. Forma parte del proyecto de codigo abierto Inferoid Notes, una aplicacion de escritorio que transcribe y resume reuniones en local.

El modelo resuelve un problema concreto: convertir una transcripcion larga (entre 35 y 70 minutos de habla) con errores tipicos de reconocimiento automatico del habla en un JSON estructurado con titulo, resumen, puntos clave, decisiones, tareas con responsable y fecha limite, y preguntas abiertas. Frente al modelo base sin ajustar, el ajuste fino incrementa de forma notable la cobertura de la informacion recogida (96,7 % frente a 89,6 %), manteniendo un tiempo de inferencia de unos 40 segundos por llamada en un M4 de 24 GB.

El modelo cuenta con 7.463.013.418 parametros totales segun los pesos en safetensors, se distribuye bajo licencia Apache 2.0 y solo declara soporte para ingles. Su relevancia actual radica en que demuestra que un ajuste fino pequeno y especializado sobre un modelo de tamano medio puede acercarse a la calidad de un modelo frontera en la nube en una tarea acotada, manteniendo toda la privacidad en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B; detalles especificos de la arquitectura del base no disponibles) |
| Parametros totales | 7.463.013.418 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (formato MLX) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 4 bits) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint google/gemma-4-E4B-it, un modelo de la familia Gemma 4 de Google. La model card no detalla la arquitectura interna del modelo base (atencion, capas, mecanismo de mezcla de expertos u otros), por lo que esos datos no estan disponibles en la informacion proporcionada. Los pesos se distribuyen en formato MLX cuantizado a 4 bits, con un tamano de repositorio de 4,2 GB y un peso de modelo declarado de 3,9 GB, lo que lo hace apto para inferencia en memoria unificada de Apple Silicon.

El ajuste fino esta especializado en la generacion de notas de reunion estructuradas en JSON. El autor indica que el modelo se entrena para operar sobre transcripciones con errores de reconocimiento del habla y producir una salida con campos definidos: titulo, resumen, puntos clave, decisiones, tareas (con responsable y fecha limite) y preguntas abiertas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La evaluacion se realizo sobre 23 llamadas de negocio sinteticas reservadas (transcripciones escritas con errores estilo ASR, de 35 a 70 minutos de habla cada una), juzgadas por modelos independientes.

## Capacidades

- Generacion de notas de reunion estructuradas en JSON: titulo, resumen, puntos clave, decisiones, tareas con responsable y fecha limite, y preguntas abiertas.
- Procesamiento de transcripciones largas (35-70 minutos de habla) con errores tipicos de reconocimiento automatico del habla.
- Generacion de texto conversacional (pipeline text-generation) sobre el modelo base Gemma 4 E4B instruido.
- Ejecucion completamente local en Apple Silicon mediante la libreria MLX.
- Servido como API compatible mediante `mlx_lm.server`.
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.

## Casos de uso

- Actas de reunion automaticas en local: el modelo convierte la transcripcion de una llamada de trabajo en un JSON con resumen, decisiones y tareas, ejecutandose integramente en el Mac del usuario sin enviar datos a la nube. Es adecuado por su especializacion en esta tarea y su tamano reducido (3,9 GB en 4 bits).

- Extraccion de tareas y responsables: a partir de la transcripcion, el modelo identifica action items con propietario y fecha limite, lo que permite volcarlos directamente a un gestor de tareas sin postprocesado manual.

- Documentacion de reuniones de cliente en entornos con requisitos de privacidad: al no salir los datos del dispositivo, encaja en sectores regulados (legal, salud, finanzas) donde no se permite enviar transcripciones a servicios en la nube.

- Seguimiento de decisiones en equipos distribuidos: el campo de decisiones del JSON permite mantener un registro estructurado de lo acordado en cada llamada para su consulta posterior.

- Generacion de resumenes para correo o herramientas internas: el resumen y los puntos clave del JSON pueden alimentar plantillas de correo o wikis corporativas de forma automatizada.

- Prototipado y evaluacion de pipelines de notas: al servirse con `mlx_lm.server` en el puerto 8090, puede integrarse como backend local en pruebas de integracion de aplicaciones de productividad.

- Uso en estaciones de trabajo Apple Silicon con 16 GB o mas: el requisito de memoria declarado permite desplegarlo en portatiles Mac de gama alta sin GPU dedicada.

## Benchmarks y rendimiento

Resultados sobre 23 llamadas de negocio sinteticas reservadas (transcripciones con errores estilo ASR, 35-70 minutos de habla), juzgadas por GPT-6.1 Sol y Grok 4.6 respectivamente:

| Modelo | Cobertura | Errores por llamada | Utilidad (1-10) | Tiempo mediano por llamada (M4 24 GB) |
|---|---|---|---|---|
| inferoid-notes-e4b | 96,7 % / 97,1 % | 3,0 / 2,9 | 7,9 / 7,3 | 40 s |
| Claude Opus 5.5 (nube) | 98,9 % / 98,6 % | 3,2 / 3,0 | 8,8 / 8,0 | nube |
| Gemma 4 E4B sin ajustar (22 llamadas) | 89,6 % / 89,4 % | 1,3 / 1,1 | 8,2 / 7,4 | 37 s |

Cada celda muestra el resultado del juez GPT-6.1 Sol / juez Grok 4.6. Segun el autor, el modelo ajustado captura mucha mas informacion (cobertura) con una tasa de errores similar a la del modelo frontera; el modelo base comete menos errores porque escribe mucho menos. Los errores se definen como afirmaciones de las notas que la llamada no respalda (responsable equivocado, pregunta inventada, matiz presentado como hecho). Se trata de llamadas sinteticas, no de grabaciones de reuniones reales.

## Requisitos de hardware

- Memoria: Macs con 16 GB de memoria unificada o mas (requisito declarado por el autor).
- Peso del modelo: 3,9 GB en cuantizacion 4 bits MLX; repositorio de 4,2 GB.
- GPU: Apple Silicon (M-series); el benchmark de tiempo se realizo en un M4 de 24 GB.
- No esta pensado para GPU NVIDIA (A100, H100, RTX 4090) en su formato actual, ya que los pesos son MLX.
- Despliegue: `mlx_lm.server` (API local en el puerto 8090) o la aplicacion Inferoid Notes (`uv tool install git+https://github.com/EmotosAI/inferoid` seguido de `inferoid add notes`).
- Latencia: aproximadamente 40 segundos por llamada de 35-70 minutos de habla en un M4 de 24 GB (mediana); el modelo base sin ajustar tarda 37 segundos en el mismo hardware.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cobertura (benchmark del autor) | Errores por llamada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| inferoid-notes-e4b | 7.463.013.418 | no disponible | 96,7 % / 97,1 % | 3,0 / 2,9 | Apache 2.0 | Hugging Face (MLX 4 bits) |
| Gemma 4 E4B sin ajustar | no disponible | no disponible | 89,6 % / 89,4 % | 1,3 / 1,1 | segun modelo base | Hugging Face |
| Claude Opus 5.5 | no disponible | no disponible | 98,9 % / 98,6 % | 3,2 / 3,0 | propietaria | API en la nube |

La comparativa se limita a los datos publicados por el autor en la model card. No se dispone de informacion sobre otros ajustes finos comparables de notas de reunion, ni de especificaciones de contexto de los modelos comparados.

## Limitaciones y advertencias

- Solo soporta ingles segun los metadatos del modelo; no se declara soporte para castellano ni otros idiomas.
- La evaluacion se realizo exclusivamente sobre llamadas sinteticas, no sobre grabaciones de reuniones reales; el rendimiento en produccion con audio real transcrito puede diferir.
- Riesgo de errores de atribucion: el propio autor define como errores las afirmaciones no respaldadas por la llamada (responsable equivocado, preguntas inventadas, matices presentados como hechos), con una tasa de aproximadamente 3 por llamada.
- El modelo base sin ajustar comete menos errores absolutos porque genera menos contenido; el ajuste prioriza cobertura sobre precision, lo que puede producir notas mas completas pero con mas afirmaciones no verificadas.
- Requiere hardware Apple Silicon con al menos 16 GB de memoria unificada; no es desplegable en GPU NVIDIA en su formato MLX actual.
- El modelo esta especializado en una unica tarea (notas de reunion); no esta pensado como modelo generalista.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base google/gemma-4-E4B-it para uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- No se dispone de informacion sobre sesgos, longitud de contexto ni comportamiento fuera del dominio de notas de reunion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Inferoid/inferoid-notes-e4b
- Repositorio del proyecto Inferoid: https://github.com/EmotosAI/inferoid
- System prompt de la aplicacion (Engine.swift): https://github.com/EmotosAI/inferoid/blob/main/apps/notes/Sources/InferoidNotes/Engine.swift
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
