# smlflg/ShortcutCounter

## Resumen

ShortcutCounter no es un modelo de inteligencia artificial ni un conjunto de pesos: es una utilidad de software publicada en HuggingFace por el usuario smlflg que funciona como rastreador pasivo de atajos de teclado en Linux con Wayland. Se ejecuta como demonio en segundo plano, lee eventos de dispositivos de entrada mediante la librería evdev y registra unicamente combinaciones de modificador mas tecla (por ejemplo, Ctrl+C o Alt+Tab), sin almacenar nunca pulsaciones sueltas, letras ni texto.

El problema que resuelve es la falta de visibilidad sobre que atajos de teclado se usan realmente en un escritorio. Ofrece estadisticas agregadas a traves de una interfaz de linea de comandos (subcomandos `start`, `stop`, `status`, `stats`, `top`, `learn` y `today`) y de una pestana de solo lectura integrada en el panel GTK3 ClaudeCodePanel. El almacenamiento es local, en una base de datos SQLite situada en `~/.local/share/shortcut-counter/shortcuts.db`.

Es relevante ahora de forma acotada: para desarrolladores y usuarios avanzados de Linux que quieran medir y optimizar su uso del teclado sin telemetria externa, y como ejemplo de publicacion de herramientas no-ML en HuggingFace. En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, no declara licencia y fue creado el 16 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable: no es un modelo de IA. Aplicacion Python compuesta por un demonio (evdev) y una CLI |
| Parametros totales | No aplicable |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No disponible (la documentacion mezcla ingles y aleman; el software no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | No aplicable: se distribuye como codigo fuente y paquete instalable con `pip install -e .` |
| Dependencias | evdev, click, rich |
| Plataforma soportada | Linux con Wayland; requiere pertenencia al grupo `input` para acceder a los dispositivos de entrada |
| Almacenamiento de datos | SQLite en `~/.local/share/shortcut-counter/shortcuts.db` |
| Formato de configuracion | TOML (`~/.config/shortcut-counter/config.toml` o `config.toml` en el directorio del proyecto) |
| Interfaz | CLI con subcomandos y pestana GTK3 en ClaudeCodePanel (`~/Projekte/ClaudeCodePanel/shortcut_counter_tab.py`) |
| Servicio | Unidad systemd de usuario (`~/.config/systemd/user/shortcut-counter.service`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura neuronal. Se trata de una aplicacion Python estructurada en tres piezas: un demonio en segundo plano que captura eventos de dispositivos de entrada a bajo nivel mediante evdev, una capa de persistencia sobre SQLite y una CLI construida con click y rich. La configuracion se declara en TOML con categorias definidas por el usuario (`[shortcuts.Editing]`, `[shortcuts.Terminal]`, etc.), cada una con una lista `combos` de combinaciones validas; los modificadores reconocidos son `Ctrl`, `Alt`, `Shift` y `Super`.

La innovacion tecnica relevante no es de modelado sino de privacidad y encaje en Wayland: el demonio solo registra combinaciones modificador mas tecla y descarta cualquier pulsacion individual, de modo que no es posible reconstruir texto escrito. La integracion con el escritorio se completa con una unidad systemd de usuario que arranca el demonio tras `graphical-session.target` y con la pestana de solo lectura del panel GTK3, que muestra estadisticas en vivo. No se documentan mecanismos de decodificacion, RLHF, DPO ni tecnicas de inferencia, porque no aplican.

## Capacidades

- Registro pasivo de combinaciones modificador mas tecla en segundo plano, sin capturar pulsaciones sueltas ni texto.
- Estadisticas agregadas de uso por atajo mediante `shortcut-counter stats` y `shortcut-counter top [N]`.
- Filtrado temporal: `shortcut-counter today` muestra los atajos usados en la jornada actual.
- Funcion `learn`, que lista los atajos definidos en `config.toml` que el usuario nunca ha utilizado.
- Modo foreground (`--foreground`) para depuracion y modo demonio para uso normal.
- Control del ciclo de vida: `start`, `stop` y `status`.
- Categorizacion de atajos definida por el usuario en TOML, con categorias personalizadas.
- Integracion con panel GTK3 mediante una pestana de solo lectura.
- Ejecucion automatica al iniciar sesion a traves de una unidad systemd de usuario con `Restart=on-failure`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, soporte de agentes ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Auditoria personal de productividad: el usuario ejecuta `shortcut-counter top` durante varias semanas para identificar que atajos concentran su uso real y cuales podria reasignar o eliminar de su configuracion.
- Aprendizaje de atajos infrautilizados: con `shortcut-counter learn` se obtiene la lista de combinaciones definidas en `config.toml` que nunca se han pulsado, lo que sirve como plan de formacion personalizado.
- Formacion y onboarding de equipos: en un equipo que comparte convenciones de edicion, el listado de atajos no usados permite preparar sesiones de formacion centradas en las combinaciones con mayor ahorro potencial.
- Monitorizacion en vivo dentro del escritorio: la pestana del panel ClaudeCodePanel ofrece una vista de solo lectura con las estadisticas, util para quien trabaja con paneles GTK3 y quiere tener la informacion visible sin abrir una terminal.
- Recogida local de datos para investigacion en interaccion persona-ordenador: al no registrar texto y guardar todo en SQLite local, permite estudiar patrones de uso de modificadores en estudios de usabilidad donde la privacidad es un requisito estricto.
- Planificacion de una migracion de X11 a Wayland: medir primero que atajos se usan de verdad ayuda a priorizar que combinaciones reconfigurar en el nuevo entorno antes de cambiar de sesion grafica.
- Documentacion de flujos de trabajo personales: las estadisticas agregadas sirven para escribir guias internas sobre los atajos realmente relevantes en un flujo de edicion o de terminal.
- Validacion de configuraciones propias: al comparar `config.toml` con los datos recogidos se detectan entradas obsoletas o mal escritas que nunca se activan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no existen metricas del tipo MMLU, HumanEval o GSM8K, ni comparaciones de precision o perplexidad. La model card tampoco documenta medidas de rendimiento del demonio, como consumo de CPU, memoria o latencia de registro.

## Requisitos de hardware

- VRAM: no aplicable. No se requiere GPU de ningun tipo.
- GPU recomendadas: ninguna.
- Compatibilidad con GPU de consumo: no aplica; el programa no realiza computo acelerado.
- CPU y memoria: no disponibles en la documentacion; por la naturaleza del demonio (lectura de eventos evdev y escritura en SQLite) el consumo esperado es bajo, pero no se aportan cifras.
- Sistema operativo: Linux con Wayland. El acceso a dispositivos de entrada mediante evdev exige pertenecer al grupo `input` (`sudo usermod -aG input $USER`) y cerrar y volver a iniciar sesion para que el cambio surta efecto.
- Dependencias de software: Python con los paquetes `evdev`, `click` y `rich`; instalacion del propio paquete con `pip install -e .`.
- Opciones de despliegue: ejecucion manual (`shortcut-counter start`), ejecucion en primer plano para depuracion (`--foreground`) o servicio de usuario con systemd mediante `shortcut-counter.service`. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se publican mediciones de eventos procesados por segundo ni de tiempo de respuesta de la CLI.

## Comparativa con modelos similares

La documentacion proporcionada no incluye comparativas con otras herramientas, y el autor no referencia alternativas. Como orientacion cualitativa, no procedente de las fuentes facilitadas y por tanto no verificada, existen utilidades de proposito parcialmente solapado como screenkey o key-mon, centradas en mostrar las pulsaciones en pantalla para grabaciones, y WhatPulse, orientada a contabilizar pulsaciones y clics con caracter multiplataforma. La diferencia principal de planteamiento es que ShortcutCounter persiste series historicas de combinaciones modificador mas tecla en una base de datos local y expone consultas agregadas por CLI y por panel GTK3, mientras que las herramientas citadas priorizan la visualizacion en vivo o la contabilidad global. No se dispone de datos de parametros, contexto, rendimiento ni licencia de esas alternativas en la informacion consultada, por lo que la comparacion cuantitativa se considera no disponible.

## Limitaciones y advertencias

- No es un modelo de IA: no puede usarse para generacion de texto, razonamiento, codigo ni ninguna tarea de inferencia.
- Requiere pertenecer al grupo `input`, lo que otorga al proceso acceso de lectura al flujo de eventos de todos los dispositivos de entrada del sistema. Aunque el software solo persista combinaciones con modificador, se trata de un privilegio relevante desde el punto de vista de seguridad y conviene auditarlo antes de desplegarlo en equipos compartidos.
- Dependencia exclusiva de Linux con Wayland; no hay soporte documentado para X11, macOS ni Windows.
- La licencia no esta declarada en el repositorio, por lo que el uso comercial y la redistribucion quedan en una situacion juridica indeterminada.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin pruebas ni issues publicos que respalden su estabilidad.
- La integracion con el panel apunta a una ruta concreta y personal del autor (`~/Projekte/ClaudeCodePanel/shortcut_counter_tab.py`), que habra que adaptar en cualquier otro entorno.
- La unidad systemd de ejemplo invoca `/usr/bin/python3 -m shortcut_counter.daemon`; en entornos con entornos virtuales o interpretes en otras rutas el servicio fallara si no se ajusta.
- Los comentarios del ejemplo de configuracion estan en aleman y la documentacion mezcla ingles y aleman, lo que puede dificultar su lectura.
- Los datos se guardan sin cifrado en `~/.local/share/shortcut-counter/shortcuts.db`; el propio usuario o cualquier proceso con acceso a su directorio personal puede leerlos.
- No se documentan mecanismos de rotacion, retencion ni borrado de la base de datos de estadisticas.
- Riesgo de falso sentido de anonimato: si bien no se registran letras sueltas, el patron temporal de combinaciones podria ser revelador en determinados contextos de analisis.

## Enlaces

- HuggingFace: https://huggingface.co/smlflg/ShortcutCounter
- Repositorio, paper o demo adicionales: no disponibles en la informacion proporcionada.
- Resultados de la busqueda web: no se han encontrado enlaces relevantes. Las entradas devueltas corresponden a paginas de Zhihu sobre temas sin relacion con el modelo (experiencia en la Universidad de Tubinga, reglas del electromagnetismo, una cuenta de usuario, tarjetas bancarias para estudiar en Alemania y el precio de un vehiculo), por lo que se descartan como fuentes.
- Dependencias citadas en la model card, sin URL asociada en la documentacion: evdev, click, rich.
