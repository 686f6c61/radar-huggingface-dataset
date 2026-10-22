# henny52/axo-native-small-preview

## Resumen

axo-native-small (preview) es un clasificador de texto pequeno disenado especificamente para moderacion de mensajes de chat. Lo desarrolla el usuario henny52 y se publica en HuggingFace bajo licencia Apache-2.0. No es un modelo generativo: recibe un mensaje y devuelve una estructura JSON fija con una puntuacion de toxicidad, una accion (`allow` / `flag` / `block`), cinco categorias (insulto, odio, amenaza, autolesion, contenido sexual), una severidad de 0 a 3, el idioma detectado y la traza de los cuatro pasos de razonamiento internos que llevan a la decision.

Su interes practico esta en la relacion coste/prestaciones: con 11.330.086 parametros y una ventana de solo 64 tokens, procesa un mensaje en unos 7 ms sobre 4 hilos de CPU (aproximadamente 3 ms en lote), sin necesidad de GPU. Esto lo hace viable para filtrar en linea cada mensaje de un chat de videojuego o de una comunidad sin anadir infraestructura de inferencia dedicada. El foco declarado es el aleman (banter de gaming, comunidades, secciones de comentarios), con soporte adicional de ingles, espanol, frances, portugues y ruso.

Es una version preview: el propio autor advierte de que el formato de salida y el conjunto de etiquetas pueden cambiar antes de la version 1.0. El repositorio es minimo (0,1 GB) y no tiene descargas ni valoraciones, por lo que no existe validacion independiente de la comunidad. La relevancia ahora mismo es la de una alternativa de muy baja latencia y bajo coste frente a moderadores basados en LLM o en clasificadores BERT, a costa de una capacidad de contexto y de matiz mucho mas limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer propio (axo-native) de 6 capas, 256 dimensiones, 8 cabezas, RoPE, SwiGLU y RMSNorm; nucleo de razonamiento de 4 pasos secuenciales y cabezas lineales de clasificacion |
| Parametros totales | 11.330.086 (11,3 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 64 tokens |
| Tipos de cuantizacion | No disponible (se distribuyen pesos en safetensors y un grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Aleman (foco principal), ingles, espanol, frances, portugues y ruso (`de`, `en`, `es`, `fr`, `pt`, `ru`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (`model.onnx`) |

Otros datos tecnicos: vocabulario de 8.192 subpalabras; tokenizador en Python puro que solo depende de numpy; dependencias de inferencia limitadas a `torch`, `numpy` y `safetensors`; tamano del repositorio 0,1 GB; creado el 21 de octubre de 2026.

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer compacto de 6 capas con 256 dimensiones ocultas, 8 cabezas de atencion, embeddings rotatorios (RoPE), activacion SwiGLU y normalizacion RMSNorm. Sobre la representacion codificada se ejecuta un nucleo de razonamiento de cuatro pasos secuenciales: primero se predice el desencadenante (`trigger`: desde `none` o `profanity` hasta `slur`, `threat_word`, `self_harm_word`, `sexual_word` u `obfuscated`), despues el objetivo (`target`: `nobody`, `self`, `game_object`, `individual`, `protected_group`), luego el contexto (`context`: `neutral`, `gaming_banter`, `quote_or_report`, `sarcasm`, `fiction_or_hypothetical`, `direct_attack`) y finalmente el veredicto. Cada paso atiende sobre los tokens codificados y transmite su estado y su prediccion al siguiente; una sonda posterior a cada paso estima la toxicidad acumulada, lo que permite reconstruir como se forma la decision. Las cabezas de toxicidad, severidad, categorias e idioma son lineales sobre el estado final. No hay decodificador de texto: el modelo solo puede emitir esa estructura.

El tokenizador incorpora un preprocesado defensivo relevante para moderacion en produccion: pliega caracteres homoglifos (cirilico y griego) y formas de ancho completo, y decodifica leetspeak habitual, de modo que `i d 1 0 t`, `іdіot` con `і` cirilica y `idiot` quedan proximos en el espacio de tokens. Los datos de entrenamiento concretos no se detallan (no se indica numero de tokens ni composicion del dataset), pero la model card declara el uso de datos derivados de HOCON34k y GAHD, ambos bajo CC BY 4.0, lo que situa el grueso del material en aleman. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineacion; por la naturaleza del modelo (clasificacion con multiples cabezas) lo esperable es entrenamiento supervisado multi-tarea, pero ese dato no esta disponible.

## Capacidades

- Clasificacion de toxicidad binaria con puntuacion calibrada (`score`) y umbrales seleccionables mediante tres presets: `light` (flag desde 0,50 / block desde 0,82), `medium` por defecto (0,35 / 0,70) y `strict` (0,22 / 0,55).
- Categorizacion multi-etiqueta con probabilidad por categoria: `insult`, `hate`, `threat`, `self_harm` y `sexual`.
- Estimacion de severidad en cuatro niveles: 0 ninguna, 1 leve, 2 clara, 3 severa.
- Deteccion de idioma entre los seis soportados (`de`, `en`, `es`, `fr`, `pt`, `ru`).
- Clasificacion de contexto conversacional, incluyendo `gaming_banter`, `quote_or_report`, `sarcasm` y `fiction_or_hypothetical`, pensada para reducir falsos positivos en citas e informes a moderadores.
- Clasificacion de objetivo de la agresion (`nobody`, `self`, `game_object`, `individual`, `protected_group`).
- Robustez ante evasion lexica basica: homoglifos cirilicos y griegos, formas de ancho completo y leetspeak.
- Traza de razonamiento (`thinking`) con los cuatro pasos, sus predicciones intermedias y una explicacion textual, pensada para depuracion y para justificar ante moderadores humanos por que se ha marcado un mensaje.
- Inferencia por lotes (`predict_json` acepta una lista de cadenas) y modo `explain=False` para puntuacion masiva sin traza.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni generacion de texto libre.

## Casos de uso

- Moderacion en linea de chat de videojuegos: el modelo se situa como filtro previo a la publicacion del mensaje; con 7 ms por mensaje en 4 hilos de CPU puede absorber el trafico de una comunidad media sin GPU. La etiqueta de contexto `gaming_banter` esta pensada explicitamente para no bloquear insultos rituales entre jugadores.
- Secciones de comentarios y foros en aleman: clasificacion por lotes (`explain=False`) de comentarios ya publicados para priorizar la cola de revision humana, usando las categorias y la severidad para ordenar por riesgo.
- Enrutado de mensajes de autolesion a un revisor humano: cuando `self_harm: true`, la accion pasa a `block` a partir de una puntuacion de 0,35, lo que permite desviar esos mensajes a un flujo de escalado en lugar de descartarlos automaticamente.
- Panel de transparencia para moderadores: la traza `thinking` expone desencadenante, objetivo y contexto, de modo que la interfaz puede mostrar "marcado por insulto dirigido a un individuo en ataque directo" en vez de solo una puntuacion, lo que facilita la revision y la apelacion.
- Filtro antispam y antiacoso en plataformas multiidioma europeas: cobertura de `de`, `en`, `es`, `fr`, `pt` y `ru` en un unico modelo de 45 MB en fp32, util para entornos con recursos limitados o despliegue en el borde.
- Normalizacion defensiva frente a evasiones: el plegado de homoglifos y la decodificacion de leetspeak permiten detectar mensajes ofuscados con caracteres cirilicos o sustituciones numericas, un patron habitual cuando los usuarios esquivan filtros por palabras clave.
- Pretratamiento para un LLM moderador: usar las salidas del modelo como senal barata de triaje y reservar las llamadas a un modelo grande solo para los casos en zona gris (`flag`) o de severidad 2-3.
- Investigacion sobre sesgos en moderacion: al ser Apache-2.0, los pesos y el codigo son inspeccionables y reentrenables, lo que permite usarlo como banco de pruebas controlado de heuristicas de decision.

## Benchmarks y rendimiento

La model card reporta resultados sobre ChatMod Bench (conjunto de 600 mensajes en aleman e ingles, la mitad toxicos, con cada modelo ejecutado bajo su propia regla de decision por defecto). Los resultados se presentan unicamente como imagenes (macro-F1 global, exactitud por partes, perfil de errores y exactitud por categoria); no se incluye ninguna cifra numerica en el texto disponible.

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y los de ChatMod Bench no son legibles en formato tabular. Datos de latencia declarados por el autor:

| Metrica | Valor |
|---|---|
| Latencia por mensaje (4 hilos de CPU) | ~7 ms |
| Latencia por mensaje en lote | ~3 ms |
| Rendimiento implicito (derivado) | ~140 msg/s en flujo unico, ~330 msg/s en lote sobre 4 hilos de CPU |
| Macro-F1 en ChatMod Bench | No disponible en formato numerico |
| Exactitud por categoria | No disponible en formato numerico |

Cualidades y fallos declarados por el autor: buen comportamiento en casos especificos de chat (banter de juego, citas, informes a moderadores, insultos implicitos); fallos en negacion ("you are not stupid"), critica dura pero legitima y contra-discurso sobre grupos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier configuracion. Los 11,3 M de parametros ocupan aproximadamente 45 MB en fp32 y 23 MB en fp16, a los que se suman activaciones minimas por la ventana de 64 tokens.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3050, RTX 4060 o superiores; tambien en GPUs de portatil con 4 GB. En la practica no necesita GPU.
- CPU: es el objetivo real de despliegue. El autor reporta ~7 ms por mensaje con 4 hilos, por lo que un nodo de CPU modesto cubre cientos de mensajes por segundo en lote.
- Opciones de despliegue: el modelo no usa `transformers`, sino su propio paquete `axo_native/` incluido en el repositorio (dependencias `torch`, `numpy`, `safetensors`), cargado mediante `snapshot_download` y `AxoNativeSmall.from_pretrained`. La ruta ONNX (`model.onnx`, entradas `input_ids` y `attention_mask` int64 de forma `[batch, seq]`, salida de logits crudos de todas las cabezas) permite servirlo con ONNX Runtime o un servidor compatible sin PyTorch. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, y ninguno de ellos es aplicable al no ser un modelo generativo.
- Throughput y latencia: los unicos datos son los del autor (~7 ms en flujo unico, ~3 ms en lote, 4 hilos de CPU). No hay mediciones independientes ni cifras de GPU.
- Memoria en disco: repositorio de 0,1 GB, apto para imagenes de contenedor muy pequenas o despliegue en dispositivos de borde.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada; la unica comparacion publicada por el autor esta en las imagenes de ChatMod Bench y sus cifras no son legibles en formato numerico. Como referencia cualitativa de categoria, los alternativas habituales para moderacion de texto son los clasificadores tipo BERT afinados para toxicidad y los LLM moderadores de mayor tamano; frente a ellos, este modelo se distingue por el tamano (11,3 M), la latencia en CPU y la salida estructurada con traza, y queda por detras en contexto (64 tokens) y en capacidad de matiz.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos | Rendimiento |
|---|---|---|---|---|---|---|
| axo-native-small-preview | 11,3 M | 64 tokens | de, en, es, fr, pt, ru | Apache-2.0 | safetensors, ONNX | Macro-F1 en ChatMod Bench solo como grafico |
| Clasificadores BERT afinados para toxicidad | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |
| LLM moderadores de gran tamano | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Version preview: el autor advierte de que el formato de salida y el conjunto de etiquetas pueden cambiar antes de la version 1.0, por lo que integrarlo en produccion exige fijar una revision concreta del repositorio.
- Ventana de solo 64 tokens: los mensajes largos se truncan, y con ellos el contexto que el modelo necesita para distinguir una cita de un ataque directo.
- Fallos documentados en negacion ("you are not stupid" puede puntuar como insulto), en critica dura pero legitima y en contra-discurso sobre grupos, lo que implica falsos positivos en conversaciones sobre racismo o sobre moderacion misma.
- Riesgo de falsos negativos en ironia, sarcasmo no marcado y agresiones implicitas que no dependen de lexico ofensivo.
- La traza `thinking` refleja predicciones intermedias reales del modelo, pero el propio autor aclara que no es una explicacion causal garantizada; no debe presentarse como justificacion formal ante un usuario.
- Sesgo de dominio y de idioma: los datos derivados declarados (HOCON34k y GAHD) son de odio y toxicidad en aleman, por lo que el rendimiento en espanol, frances, portugues y ruso esta mucho menos validado pese a figurar en la lista de idiomas.
- No es una herramienta de deteccion de crisis: aunque `self_harm: true` fuerza `block`, el modelo no evalua riesgo suicida ni sustituye aprotocolos de escalado humano.
- No puede generar texto, resumir ni justificar en lenguaje libre; cualquier flujo que necesite explicaciones redactadas requiere un componente adicional.
- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes ni auditoria de sesgos.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero exige conservar el aviso de licencia y el archivo NOTICE si existe, y no concede garantias. Los datos derivados de HOCON34k y GAHD estan bajo CC BY 4.0, lo que anade un requisito de atribucion sobre esa porcion del material.
- Integracion con codigo propio: no es compatible con `transformers`, por lo que requiere cargar el paquete `axo_native` del repositorio y asumir el coste de mantenimiento de esa dependencia, ademas del riesgo de seguridad que implica ejecutar codigo remoto.
- Los resultados de la busqueda web realizada no contienen ninguna referencia util al modelo (solo resultados no relacionados), de modo que no hay informacion de terceros que contrastar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/henny52/axo-native-small-preview
- Dataset de evaluacion ChatMod Bench: https://huggingface.co/datasets/henny52/chatmod-bench
- Grafico de macro-F1 global: https://huggingface.co/henny52/axo-native-small-preview/resolve/main/assets/overall.png
- Grafico de exactitud por partes: https://huggingface.co/henny52/axo-native-small-preview/resolve/main/assets/parts.png
- Grafico de perfil de errores: https://huggingface.co/henny52/axo-native-small-preview/resolve/main/assets/errors.png
- Grafico de exactitud por categoria: https://huggingface.co/henny52/axo-native-small-preview/resolve/main/assets/categories.png

No se han encontrado papers, blogs, repositorios adicionales ni demos en la busqueda web disponible.
