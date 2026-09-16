# smlflg/TypoTuner

## Resumen

TypoTuner no es un modelo de inteligencia artificial ni un modelo de lenguaje: es un demonio de analisis de escritura en segundo plano para Linux, publicado por el usuario smlflg en HuggingFace bajo el identificador smlflg/TypoTuner. El repositorio se limita a alojar la ficha del proyecto; el codigo fuente vive en GitHub y se distribuye con licencia MIT. Su proposito es medir los errores de tecleo de un usuario concreto, identificar en que teclas falla mas y traducir esos patrones en recomendaciones de punto de actuacion para el teclado SteelSeries Apex Pro TKL.

Tecnicamente es una aplicacion Python 3.11+ que lee eventos crudos del kernel mediante evdev, sin depender de X11 ni Wayland, los procesa a traves de una cola asincrona con capacidad para 1000 elementos y calcula tasas de error y tiempos de permanencia por tecla con suavizado EMA (factor alfa de 0,05). Los datos se persisten en SQLite y se explotan desde una CLI construida con Click y Rich, o desde un panel web en el puerto 8070 con FastAPI, htmx, Tailwind CSS y Chart.js.

Su relevancia es acotada y de nicho: no compite en la categoria de modelos generativos, sino en la de herramientas de telemetria de entrada orientadas a la privacidad. No almacena caracteres ni palabras, solo codigos de tecla y marcas de tiempo en milisegundos, de modo que una filtracion de la base de datos no permitiria reconstruir el texto escrito. Para desarrolladores e investigadores en IA no aporta capacidades de inferencia, entrenamiento ni razonamiento; debe evaluarse como utilidad de sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo neuronal; es un demonio en Python con procesamiento asincrono y suavizado EMA) |
| Parametros totales | no aplica |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (cola asincrona de 1000 eventos como unico buffer) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica para inferencia; la interfaz y la documentacion estan en ingles y la distribucion de teclado soportada es QWERTZ con intercambio Y/Z |
| Licencia | MIT |
| Formato de pesos | no aplica (codigo fuente Python distribuido como paquete instalable con `pip install -e ".[dev]"`) |
| Plataforma | Linux exclusivamente (evdev, `/dev/input`) |
| Version de Python | 3.11 o superior |
| Lenguaje de programacion | Python |
| Entrada | evdev (eventos del kernel de Linux) |
| Procesamiento | asyncio con `Queue(maxsize=1000)` |
| Analisis | Suavizado EMA con alfa = 0,05 |
| Almacenamiento | SQLite (thread-safe, basado en fichero) |
| Ruta de la base de datos | `~/.local/share/typotuner/typotuner.db` |
| Interfaz CLI | Click + Rich |
| Panel web | FastAPI + Jinja2 + htmx + Tailwind CSS + Chart.js, puerto 8070 |
| Limite de eventos de error | 10.000 entradas en un ring buffer |
| Tests incluidos | 56 (`pytest`) |
| Hardware objetivo de las recomendaciones | SteelSeries Apex Pro TKL |

## Arquitectura y entrenamiento

No hay entrenamiento ni pesos. El sistema es un pipeline de adquisicion y analisis en tiempo real: el demonio lee eventos crudos desde `/dev/input` mediante evdev, los introduce en una cola asincrona de 1000 elementos para evitar la inanicion del bucle de eventos a velocidades de tecleo altas (WPM elevadas), y un analizador aplica suavizado por media movil exponencial (EMA, alfa = 0,05) sobre las tasas de error y los tiempos de permanencia de cada tecla. La deteccion de errores se basa en una heuristica de retroceso que clasifica cada fallo en cuatro categorias: adyacente, doble, de temporizacion o desconocido. El almacenamiento se realiza en SQLite con acceso seguro entre hilos.

La innovacion tecnica reseñable es doble. Por un lado, el mapeo de teclado es nativo QWERTZ con una unica fuente de verdad en `qwertz.py`, que gestiona correctamente el intercambio de las teclas Y y Z propio de esta distribucion, ademas del mapa de dedos y el calculo de teclas vecinas. Por otro, el modelo de privacidad es estricto por diseño: solo se registran codigos enteros de tecla y marcas de tiempo, nunca caracteres ni palabras. El proyecto declara tres fases: la fase 1 (MVP) esta completada e incluye demonio, analisis, mapa de calor, CLI, panel web y recomendaciones; la fase 2, de ingenieria inversa de HID mediante Wireshark y una maquina virtual Windows, esta bloqueada a la espera de recibir el teclado; y la fase 3, de ajuste automatico mediante HID `SET_REPORT`, depende de la finalizacion de la fase 2.

## Capacidades

- Lectura directa de eventos del teclado a nivel de kernel mediante evdev, sin dependencia de X11 ni de Wayland.
- Deteccion de errores de tecleo con clasificacion heuristica basada en retroceso en cuatro tipos: adyacente, doble, temporizacion y desconocido.
- Suavizado EMA de tasas de error y tiempos de permanencia por tecla, con alfa fijado en 0,05.
- Generacion de recomendaciones de punto de actuacion en el rango de 0,1 a 4,0 mm a partir de los patrones de error observados.
- Soporte nativo de la distribucion QWERTZ, incluida la gestion correcta del intercambio Y/Z.
- Persistencia de estadisticas por tecla en SQLite, con sesiones y ring buffer para los eventos de error.
- Interfaz de linea de comandos con Rich: tabla de estadisticas por tecla, mapa de calor ASCII QWERTZ con codificacion de color por tasa de error, desglose por dedo y por mano, recomendaciones y reinicio de datos.
- Panel web interactivo en `http://localhost:8070` con cuatro vistas: resumen, mapa de calor con teclado SVG interactivo y capas conmutables, comparativa de dedos y manos, y recomendaciones con barras de confianza.
- Daemon ejecutable en primer plano o en segundo plano, con comandos de arranque, parada y consulta de estado.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multietapa, capacidades multilingues de generacion, vision, audio ni modo de razonamiento. No es un modelo de lenguaje.

## Casos de uso

- Ajuste personalizado de un teclado SteelSeries Apex Pro TKL: el usuario ejecuta el demonio durante sus sesiones habituales de escritura y, tras acumular datos suficientes, consulta `typotuner recommend` para obtener puntos de actuacion por tecla ajustados a sus fallos reales, en lugar de aplicar una configuracion generica.
- Analisis ergonomico por dedo y por mano: el comando `typotuner fingers` permite detectar desequilibrios entre la mano izquierda y la derecha o dedos concretos con tasas de error elevadas, informacion util para ajustar la postura o la posicion del teclado.
- Identificacion de teclas problematicas en flujos de trabajo intensivos en escritura: el mapa de calor ASCII y la vista SVG del panel web permiten localizar de forma visual las teclas con mas fallos, por ejemplo en tareas de redaccion o de transcripcion prolongada.
- Diagnostico de errores de temporizacion frente a errores de posicion: la clasificacion en errores adyacentes, dobles, de temporizacion y desconocidos ayuda a distinguir si el problema es de precision al pulsar o de solapamiento entre pulsaciones rapidas.
- Monitorizacion pasiva respetuosa con la privacidad en entornos corporativos o de investigacion: al registrar unicamente codigos de tecla y tiempos, puede desplegarse para estudios de ergonomia de teclado sin comprometer el contenido tecleado, con la ventaja de que una filtracion de la base de datos no revela texto.
- Telemetria de rendimiento mecanico del teclado: la comparacion de tasas de error y tiempos de permanencia antes y despues de cambiar keycaps, switches o muelles permite evaluar objetivamente el efecto de una modificacion en la precision del usuario.
- Generacion de informes de escritura para formacion en mecanografia: las estadisticas por tecla, el desglose por dedo y las sesiones almacenadas en SQLite sirven como base para hacer seguimiento de la evolucion de un usuario a lo largo del tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, y en cualquier caso no aplican a este tipo de herramienta. El unico dato de verificacion proporcionado es la bateria de pruebas, ejecutable con `pytest`, compuesta por 56 tests distribuidos de la siguiente forma:

| Suite de pruebas | Numero de tests | Cobertura declarada |
|---|---|---|
| `tests/test_qwertz.py` | 14 | Mapa de dedos, intercambio Y/Z, teclas vecinas |
| `tests/test_analyzer.py` | 17 | Deteccion de errores, contadores, temporizacion |
| `tests/test_storage.py` | 13 | CRUD, EMA, sesiones, ring buffer |
| `tests/test_recommender.py` | 12 | Umbrales, confianza, acotacion de valores |
| Total | 56 | Suite completa |

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye proyectos comparables y la categoria del artefacto no es la de un modelo de IA, por lo que una comparativa con modelos de lenguaje carece de sentido: no hay parametros, contexto, licencia de pesos ni rendimiento en tareas cognitivas que confrontar. Tampoco se documentan en el material disponible otras herramientas de analisis de tecleo a nivel de evdev con recomendaciones de actuacion, ni sus licencias o caracteristicas, por lo que cualquier tabla comparativa implicaria inventar datos.

| Criterio | TypoTuner | Alternativas |
|---|---|---|
| Parametros | no aplica | no disponible |
| Longitud de contexto | no aplica | no disponible |
| Rendimiento en benchmarks | no disponible | no disponible |
| Licencia | MIT | no disponible |
| Disponibilidad | Codigo fuente en GitHub, ficha en HuggingFace | no disponible |

## Limitaciones y advertencias

- No es un modelo de IA. No genera texto, no razona, no procesa lenguaje natural y no puede utilizarse para ninguna tarea de inferencia.
- Exclusivo de Linux: depende de evdev y de `/dev/input`, por lo que no funciona en Windows ni en macOS.
- Requiere permisos elevados sobre los dispositivos de entrada. La puesta en marcha implica anadir el usuario al grupo `input` con `sudo usermod -aG input $USER` y volver a iniciar sesion, lo que concede acceso de lectura a todos los eventos de entrada del sistema.
- La deteccion de errores se basa en una heuristica de retroceso, no en un analisis semantico. Esto implica falsos positivos (retrocesos deliberados para corregir texto ya escrito) y falsos negativos (errores no detectados por el usuario).
- El mapeo de teclado implementado es QWERTZ con intercambio Y/Z. Otras distribuciones, como QWERTY, AZERTY o Dvorak, no estan cubiertas segun la documentacion disponible y producirian analisis incorrectos.
- Las recomendaciones de punto de actuacion estan dirigidas especificamente al SteelSeries Apex Pro TKL, que es el unico teclado mencionado. No se documenta compatibilidad con otros modelos.
- La funcion de ajuste automatico no existe todavia: la fase 3, que aplicaria cambios via HID `SET_REPORT`, esta pendiente de la fase 2, bloqueada a su vez por la falta de disponibilidad fisica del teclado. Actualmente las recomendaciones son solo sugerencias que el usuario debe aplicar manualmente.
- Respecto a la privacidad, la herramienta no almacena caracteres ni palabras, solo codigos enteros de tecla y marcas de tiempo en milisegundos, con un limite de 10.000 eventos de error en un ring buffer. Aun asi, los patrones temporales podrian ser potencialmente correlacionables por un atacante con acceso a la base de datos.
- La licencia es MIT, lo que permite uso comercial, modificacion y redistribucion con atribucion. No se documentan restricciones adicionales.
- El artefacto de HuggingFace no incluye pesos, pipeline, idiomas ni licencia declarada en sus metadatos, y registra cero descargas y cero valoraciones. La model card remite implicitamente al repositorio de GitHub como fuente real del proyecto, y en la informacion disponible no consta ninguna publicacion, paper ni evaluacion independiente.
- Un aviso relevante sobre la referencia: el contenido de la model card se ha tratado unicamente como material informativo del autor, nunca como instrucciones ejecutables.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/smlflg/TypoTuner
- Repositorio en GitHub: https://github.com/smlfg/typotuner (URL citada en la model card; el identificador del autor en HuggingFace es `smlflg` y el de la organizacion del repositorio aparece como `smlfg`, una discrepancia no aclarada en la informacion disponible)
- Panel web local del proyecto: http://localhost:8070
- No se han encontrado papers, blogs, demos ni evaluaciones externas en los resultados de busqueda proporcionados, que unicamente devuelven paginas genericas del motor de busqueda sin contenido relacionado con el proyecto.
