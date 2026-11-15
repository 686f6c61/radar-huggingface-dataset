# baskl/stick-to-it

## Resumen

Stick To It es un repositorio de pesos publicado por el usuario baskl que contiene un unico fichero de modelo, `tapnextpp_256.safetensors`, correspondiente a TAPNext++ de Google DeepMind. No se trata de un modelo de lenguaje ni de un modelo generativo de proposito general: es un modelo de point tracking (seguimiento de puntos) en video, empaquetado especificamente para ser consumido por el plugin de After Effects "Stick To It", que lo descarga a traves de la API de modelos de BASKL. El repositorio actua, por tanto, como espejo de distribucion de pesos mas que como publicacion de un modelo original.

El interes tecnico del artefacto radica en el formato: el state dict original de TAPNext++ (`tapnextpp_ckpt.pt`) se ha convertido a safetensors en precision float16, y el plugin lo carga en float32 ejecutando las multiplicaciones de matrices en float16 bajo autocast. El repositorio ocupa 0,5 GB y no incluye model card con especificaciones de arquitectura, datos de entrenamiento ni resultados de benchmarks; toda la informacion disponible remite al proyecto upstream de DeepMind.

La relevancia es acotada pero concreta: para desarrolladores de herramientas de postproduccion y VFX, este repositorio ofrece una via practica de obtener los pesos de un tracker de puntos de referencia en un formato seguro (safetensors) y con licencia Apache 2.0, sin necesidad de manipular checkpoints de PyTorch. Para investigadores, es un ejemplo de empaquetado de modelos de vision para inferencia en plugins de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (corresponde a TAPNext++ de Google DeepMind; arquitectura no detallada en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de vision para point tracking en video) |
| Tipos de cuantizacion | float16 (pesos en safetensors); carga en float32 con matmuls en float16 bajo autocast |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`tapnextpp_256.safetensors`) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna de TAPNext++ mas alla de su identificacion como modelo de point tracking desarrollado por Google DeepMind, con referencias al sitio del proyecto (tap-next-plus-plus.github.io) y al repositorio tapnet en GitHub. No se detallan el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens o frames procesados, ni si se emplearon tecnicas de ajuste como RLHF o DPO (poco probables en un modelo de vision de este tipo).

El unico detalle tecnico de empaquetado disponible es que el state dict original en PyTorch (`tapnextpp_ckpt.pt`) se ha almacenado como safetensors en float16, y que el plugin consumidor lo carga en float32 ejecutando las matmuls en float16 bajo autocast. El sufijo `256` en el nombre del fichero sugiere una variante de resolucion o de ventana de 256, pero la informacion no lo confirma. Cualquier afirmacion sobre innovaciones arquitectonicas (atencion lineal, decodificacion especulativa, etc.) careceria de respaldo en los datos disponibles.

## Capacidades

- Seguimiento de puntos (point tracking) en secuencias de video, segun la etiqueta `point-tracking` del repositorio y la descripcion del plugin como "AI point tracker".
- Integracion con After Effects mediante el plugin Stick To It, que descarga los pesos a traves de la API de modelos de BASKL.
- Ejecucion de inferencia mixta: carga de pesos en float32 con matmuls en float16 bajo autocast, lo que reduce el coste de memoria y acelera el calculo en hardware compatible.
- Distribucion en formato safetensors, con carga mas segura y rapida que los checkpoints pickle de PyTorch.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes, multilingue, thinking mode, audio ni ninguna otra funcionalidad fuera del point tracking.

## Casos de uso

- Seguimiento de puntos para rotoscopia y mascaras en After Effects: el plugin Stick To It carga los pesos y aplica el tracker sobre la secuencia para anclar puntos a elementos en movimiento, reduciendo el trabajo manual de keyframing en postproduccion.
- Estabilizacion y matchmoving en VFX: el seguimiento de puntos sobre superficies permite derivar transformaciones de camara u objetos para integrar elementos CGI con el metraje original.
- Motion graphics con anclajes: los puntos rastreados se pueden vincular a capas de texto o graficos para que sigan objetos de la escena a lo largo del plano.
- Limpieza y pintura digital (clean-up): el tracking preciso de puntos facilita la propagacion de parches o clones sobre elementos no deseados a lo largo del clip.
- Automatizacion de pipelines de postproduccion: al distribuirse via API de modelos de BASKL, el flujo de descarga e inferencia puede integrarse en herramientas propias o scripts que reproduzcan el comportamiento del plugin.
- Investigacion en vision por computador: los pesos en safetensors float16 sirven como base para experimentos de point tracking, evaluacion de robustez o comparacion con otros trackers, sin manipular checkpoints pickle.
- Prototipado de herramientas de anotacion: el tracker puede asistir en el etiquetado semi-automatico de puntos clave en datasets de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. El repositorio ocupa 0,5 GB y los pesos se almacenan en float16, por lo que la huella en memoria de los pesos es del orden de cientos de MB; el consumo real depende de la resolucion de video, la longitud de la secuencia y los buffers intermedios, datos no proporcionados.
- GPU recomendadas: no disponibles en la informacion. El uso de autocast float16 sugiere compatibilidad con GPUs que soporten matmuls en media precision (familia Ampere en adelante en NVIDIA, o equivalentes), pero no se confirma.
- Cabeza en GPU de consumo: probable por el tamano del fichero (0,5 GB), pero no confirmado por el autor.
- Opciones de despliegue: el consumo previsto es a traves del plugin Stick To It de After Effects y de la API de modelos de BASKL; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje y no aplicables a este caso).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stick To It (TAPNext++ empaquetado) | Point tracking en video | no disponible | no aplica | Apache 2.0 | Hugging Face (baskl/stick-to-it) |
| TAPNext++ original (Google DeepMind) | Point tracking en video | no disponible | no aplica | Apache 2.0 (segun la model card) | GitHub google-deepmind/tapnet |
| Otros trackers de puntos | Point tracking en video | no disponible | no aplica | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion cuantitativa. La unica comparacion posible es de empaquetado: este repositorio redistribuye los pesos de TAPNext++ en safetensors float16, mientras que el proyecto upstream los ofrece como checkpoint PyTorch.

## Limitaciones y advertencias

- El repositorio no incluye model card con especificaciones tecnicas, datos de entrenamiento ni evaluacion; cualquier decision de produccion basada en el depende de la documentacion upstream de TAPNext++.
- No es un modelo de lenguaje: no soporta generacion de texto, codigo, tool calling ni agentes. Su unico proposito es el point tracking.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-14), lo que indica una publicacion reciente y sin validacion comunitaria.
- La licencia Apache 2.0 se hereda del proyecto original; la model card indica que se incluyen los ficheros LICENSE y NOTICE, pero no se detalla su contenido en la informacion disponible. Para uso comercial conviene verificar las condiciones del proyecto upstream de DeepMind.
- El rendimiento en precision float16 con matmuls bajo autocast puede degradar la precision numerica del tracking frente a la ejecucion en float32 completa; no se documenta el impacto.
- No se especifican sesgos, tasas de alucinacion ni limitaciones de idioma porque el modelo no es linguistico; los riesgos se limitan a fallos de seguimiento en oclusiones, movimiento rapido o cambios de iluminacion, no documentados por el autor.
- La dependencia de la API de modelos de BASKL para la descarga introduce un punto unico de fallo en el flujo del plugin.
- El nombre `tapnextpp_256` sugiere una variante concreta, pero no se confirma a que corresponde el valor 256 ni si existen otras variantes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/baskl/stick-to-it
- Sitio del proyecto TAPNext++: https://tap-next-plus-plus.github.io
- Repositorio de TapNet (Google DeepMind): https://github.com/google-deepmind/tapnet
