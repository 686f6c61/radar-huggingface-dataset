# iapp/OpenThai-SystemOne-Vision-GGUF

## Resumen

OpenThai-SystemOne-Vision GGUF es la version cuantizada en formato GGUF del modelo OpenThai-SystemOne-Vision v1.5, un modelo de decision multimodal de 0,86B parametros desarrollado por iApp (en el marco del proyecto OpenThai, anteriormente OpenThaiGPT) y lanzado junto con AIEAT. A diferencia de un modelo generativo convencional, este modelo no produce texto: responde preguntas tipadas sobre un estado dado (por ejemplo, el estado de una aplicacion de escritorio) en un unico forward pass, devolviendo la opcion elegida y una probabilidad por cada opcion. Esta pensado para tareas de computer use, es decir, para que un agente decida sobre que control de la interfaz actuar.

La relevancia de esta publicacion radica en su enfoque "System One": en lugar de razonar paso a paso generando tokens, el modelo clasifica directamente entre opciones predefinidas, lo que reduce la latencia y el coste de inferencia en bucles de agentes que interactuan con interfaces. El modelo esta construido sobre Qwen3.5-0.8B-Base, soporta tailandes e ingles, acepta capturas de pantalla opcionales y se sirve mediante `llama-server` a traves de un endpoint dedicado `/v1/systemone`.

Esta version GGUF incluye dos ficheros: la torre de texto en Q8_0 con la cabeza de decision y la torre de vision mas el merger en F16. Ambos deben descargarse del mismo commit, ya que cambian con cada version del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-0.8B-Base) con torre de vision y cabeza de decision por slots |
| Parametros totales | 1.006.715.712 (aproximadamente 1,0B; el autor indica 0,86B en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuracion de ejemplo con `-c 32768`) |
| Tipos de cuantizacion | Q8_0 (torre de texto) y F16 (torre de vision y merger) |
| Idiomas soportados | Tailandes (th) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-0.8B-Base y anade una torre de vision con su merger, asi como una cabeza de decision ("slot head") que produce una fila por cada etiqueta de opcion, junto con temperaturas por tipo de pregunta. La inferencia no genera texto: dado un estado (sistema operativo, aplicacion y objetivo) y una pregunta tipada (`choice`, `noul` o `score`), el modelo devuelve la opcion seleccionada y una distribucion de probabilidad sobre todas las opciones. El prompt se incrusta dentro del propio GGUF, de modo que el cliente envia la peticion tal cual al endpoint `/v1/systemone`.

La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset. Si se indica que la torre de vision se entrena tambien en cada version y que v1.5 incorpora pantallas de macOS en el entrenamiento (sin cifra held-out para macOS). El modelo base es Qwen3.5-0.8B-Base; no se especifica si se aplicaron tecnicas de RLHF o DPO. La innovacion principal es el paradigma de decision en un solo paso, con soporte de preguntas de eleccion (hasta 255 opciones), si/no y puntuacion (listas de 2 a 10 niveles).

## Capacidades

- Decision sobre controles de interfaz: responde que elemento debe accionarse dado un estado y un objetivo.
- Preguntas de tipo `choice` con hasta 255 opciones, devolviendo probabilidad por opcion.
- Preguntas de tipo `noul` (si/no) y `score` (puntuacion en una escala de 2 a 10 niveles).
- Entrada multimodal: acepta una captura de pantalla opcional junto con el estado textual.
- Comprension de comandos en tailandes e ingles, incluyendo frases naturales y nombres de controles tal como aparecen en pantalla.
- Lectura de comandos de voz: "click" mas un nombre en pantalla se interpreta como clic con una tasa del 95,2 % en v1.5.
- No soporta generacion de texto libre ni razonamiento multi-paso generativo; su salida es una clasificacion.
- No dispone de cabeza `point` en esta build, por lo que no devuelve coordenadas de clic directamente.

## Casos de uso

- Automatizacion de escritorio en Windows 11: un agente lee los controles via API de accesibilidad, construye la lista de opciones y el modelo elige el control correcto con una tasa del 98,0 % para frases naturales en ingles y 93,2 % para frases naturales en tailandes con etiquetas en ingles.
- Asistentes de voz para control de aplicaciones: el modelo interpreta comandos hablados ("click" + nombre) y selecciona el control correspondiente, adecuado para interfaces manos libres.
- Agentes de computer use en Linux (GNOME): con 178 objetivos de prueba, el modelo acierta el 99,4 % cuando el nombre del control aparece tal cual y el 89,4 % con frases naturales en tailandes.
- Verificacion de presencia de controles: cuando el elemento solicitado no esta en pantalla, el modelo responde `none` entre el 51 % y el 75 % de los casos (segun el tipo de frase), lo que permite al agente pedir aclaracion al usuario en lugar de actuar a ciegas.
- Puntuacion de estados de interfaz: mediante preguntas de tipo `score`, el modelo puede evaluar el estado de una aplicacion en una escala (por ejemplo, si un formulario esta completo) para decidir el siguiente paso.
- Filtrado de acciones en pipelines de agentes: al devolver probabilidades por opcion, la aplicacion puede aplicar umbrales de confianza y evitar clics erroneos en produccion.
- Soporte bilingue tailandes-ingles en herramientas internas: util para empresas que operan con interfaces en ingles pero usuarios que emiten comandos en tailandes.

## Benchmarks y rendimiento

Los datos disponibles son pruebas internas del autor sobre sus propias pantallas de test (listas de hasta 120 controles, sin captura de pantalla, con nombres de controles no vistos en entrenamiento). Esta build GGUF eligio la misma opcion que los pesos PyTorch en 359 de 360 comprobaciones.

| Escenario | v1.4 | v1.5 |
|---|---|---|
| Windows 11, nombre del control tal cual (ingles o tras verbo tailandes) | 99,0 | 99,5 |
| Windows 11, frase natural en ingles | 96,0 | 98,0 |
| Windows 11, frase natural en tailandes con etiquetas en ingles | 86,1 | 93,2 |
| Windows 11, control no listado: responde `none` (tailandes natural / ingles natural / nombre tal cual) | 8 / 9 / 15 | 51 / 67 / 75 |
| Ubuntu 24.04 GNOME, nombre del control tal cual | 98,9 | 99,4 |
| Ubuntu 24.04 GNOME, frase natural en tailandes | 78,8 | 89,4 |
| Ubuntu 24.04 GNOME, frase natural en ingles | 89,4 | 90,6 |
| Ubuntu 24.04 GNOME, control no listado: responde `none` (tailandes natural / ingles natural / nombre tal cual) | 10 / 11 / 11 | 58 / 79 / 84 |
| macOS, control nombrado en el comando (560 objetivos) | 99 | sin cifra held-out |
| Comando de voz "click" + nombre | 78,1 | 95,2 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero de texto Q8_0 ocupa 1.320.471.008 bytes (aproximadamente 1,3 GB) y el mmproj F16 204.986.656 bytes (aproximadamente 0,2 GB); en total unos 1,5 GB de pesos, mas overhead de contexto.
- Cabe holgadamente en GPU consumer: cualquier GPU con 4 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.) puede ejecutarlo.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU moderna con al menos 4 GB es suficiente. En CPU tambien es viable por el reducido tamano.
- Despliegue: llama.cpp mediante `llama-server` (probado con build b12242), con el endpoint `/v1/systemone`. Configuracion de ejemplo: `-c 32768 --parallel 4 -ngl 99`.
- Latencia y throughput: no disponibles en la informacion proporcionada; al tratarse de un unico forward pass sin generacion de texto, la latencia esperada es baja, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar ni de modelos comparables directos en la informacion proporcionada. Como referencia estructural, el modelo se basa en Qwen3.5-0.8B-Base, pero no se ofrecen cifras comparativas con ese modelo base ni con alternativas de computer use.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OpenThai-SystemOne-Vision v1.5 (GGUF) | ~1,0B | 32.768 | Apache-2.0 | Decision en un paso con vision |
| Qwen3.5-0.8B-Base | 0,8B | no disponible | no disponible | Generacion de texto |
| Alternativas de computer use | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No genera texto: solo responde a preguntas tipadas (`choice`, `noul`, `score`); no sirve para conversacion abierta.
- Cuando el control solicitado no esta en pantalla, acierta `none` solo entre el 51 % y el 75 % de los casos; es imprescindible validar en la aplicacion antes de actuar y preguntar al usuario si la eleccion no es coherente.
- No dispone de cabeza `point`: no devuelve coordenadas de clic; el clic debe resolverse via API de accesibilidad.
- Idiomas limitados a tailandes e ingles; el rendimiento en frases naturales en tailandes es inferior al de ingles (89,4 frente a 90,6 en Ubuntu; 93,2 frente a 98,0 en Windows).
- Sin cifra held-out para macOS en v1.5, ya que las pantallas de macOS se incluyeron en entrenamiento; el rendimiento real en macOS no esta validado de forma independiente.
- Riesgo de sesgo y alucinacion no documentado en la informacion disponible; al ser un clasificador, el riesgo se manifiesta como eleccion de una opcion incorrecta en lugar de texto inventado.
- Los dos ficheros GGUF cambian con cada version: deben descargarse del mismo commit para evitar incompatibilidades.
- Licencia Apache-2.0, permisiva para uso comercial, sujeta a los terminos de la licencia del modelo base Qwen3.5-0.8B-Base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai-SystemOne-Vision-GGUF
- Modelo base: https://huggingface.co/iapp/OpenThai-SystemOne-Vision
- Organizacion iApp en Hugging Face: https://huggingface.co/iapp
- Proyecto OpenThai (anteriormente OpenThaiGPT): no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
