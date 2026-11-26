# cunknown/nlcl

## Resumen

NLCL (Natural Language Computational Language) es un prototipo de investigacion de codigo abierto que explora el uso del lenguaje natural como lenguaje de programacion. El sistema convierte instrucciones en ingles en operaciones semanticas, las aplica sobre una representacion intermedia (IR) persistente y genera codigo para multiples dominios: aplicaciones de escritorio, videojuegos, sistemas embebidos, hardware, C++, modelos 3D y CAD. No se trata de un modelo de lenguaje con pesos entrenados, sino de un interprete basado en reglas que opcionalmente puede apoyarse en backends de modelos de lenguaje.

El proyecto esta desarrollado por el usuario `cunknown` y se distribuye con licencia MIT. No tiene vinculacion con Anthropic ni con Claude, a pesar de las etiquetas del repositorio. El nucleo funciona completamente offline usando unicamente la biblioteca estandar de Python, lo que lo hace extremadamente ligero en cuanto a requisitos de infraestructura.

Su relevancia radica en la propuesta conceptual: tratar el lenguaje natural no solo como interfaz, sino como el propio lenguaje de programacion, con un pipeline que va desde la instruccion en ingles hasta la generacion de codigo ejecutable en distintos dominios. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que confirma que no contiene pesos de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Interprete basado en reglas con parser offline en ingles, IR persistente y generacion de codigo por modulos; no es un modelo neuronal |
| Parametros totales | no disponible (no contiene pesos de modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles); se mencionan backends opcionales de modelos de lenguaje para lenguas no latinas |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio no contiene pesos; el nucleo es codigo Python) |

## Arquitectura y entrenamiento

NLCL no es un modelo de lenguaje entrenado con descenso de gradiente, sino un sistema simbolico compuesto por varias piezas. El parser offline (`nlcl/parser.py`) procesa instrucciones en ingles mediante reglas. La interpretacion se apoya en tres mecanismos de vocabulario: tokens atomicos (operaciones como `CREATE`, `DELETE`, `CONNECT`), tokens compuestos (patrones ordenados que combinan tokens en operaciones de mayor nivel) y vocabulario adaptativo (alias y comandos definidos por el usuario, que se validan mediante un dry-run contra una copia del estado antes de aceptarse). El interprete (`nlcl/interpreter.py`) aplica operaciones sobre un estado persistente y solicita aclaraciones cuando no puede determinar con confianza el dominio u operacion.

El conocimiento se almacena en una base (`nlcl/kb/`, `nlcl/knowledge.py`) con ontologia, fiabilidad aprendida, reglas de seguridad y vocabulario aprendido. El modulo de aprendizaje (`nlcl/learn.py`, `nlcl/weights.py`) calibra la confianza de las interpretaciones usando caracteristicas medibles; el comando `:why` explica una puntuacion. Los modulos de dominio (`nlcl/modules/`) son plugins que aportan generadores de codigo para distintos targets. El terminal (`nlcl/shell.py`) interpreta peticiones y verifica los efectos de los comandos en un sandbox. Existe un conjunto de benchmarks reproducibles (`nlcl/bench/`). No se dispone de informacion sobre datos de entrenamiento, tokens procesados ni tecnicas de RLHF o DPO, ya que el sistema no entrena un modelo neuronal.

## Capacidades

- Conversion de instrucciones en ingles en operaciones semanticas y representacion intermedia (IR) persistente.
- Generacion de codigo para dominios: aplicaciones Tkinter y PWA (`app`), objetos y servicios Python (`python`), juegos en Unity C#, Godot GDScript y HTML5 (`game`), Arduino C++ y MicroPython (`embedded`), Verilog RTL (`hardware`), clases C++17 con CMake (`cpp`), escenas Three.js y scripts de Blender (`3d`), y piezas OpenSCAD y modelos CadQuery (`cad`).
- Soporte de vocabulario adaptativo: el usuario puede ensenar alias y definir comandos, validados con dry-run.
- Mecanismo de confianza con explicacion (`:why`) y peticion de aclaracion ante ambiguedad.
- Conexion de entidades entre dominios mediante contratos de canal: HTTP, MQTT, serial, SPI e I2C.
- Composicion de sistemas con `system.json` y guia `SYSTEM.md`.
- Verificacion de efectos de comandos en sandbox desde el terminal.
- Soporte opcional de backends de modelos de lenguaje para lenguas no latinas, interpretacion y reparacion de codigo.
- No soporta tool calling en el sentido de APIs de modelos neuronales, ni vision, ni audio, ni modo thinking.

## Casos de uso

- Prototipado rapido de videojuegos: un desarrollador puede describir en ingles la creacion de enemigos con atributos (`create 3 enemies with health 30 and color red`) y obtener codigo para Unity o Godot, acelerando la fase de prototipo sin escribir boilerplate.
- Generacion de firmware para sistemas embebidos: instrucciones como definir sensores y actuadores se traducen a proyectos Arduino C++ o MicroPython con PlatformIO, utiles para pruebas de concepto en hardware.
- Diseno de circuitos digitales: el dominio `hardware` produce Verilog RTL con testbench y scripts de sintesis, lo que permite generar y simular bloques basicos con Icarus Verilog y Yosys.
- Creacion de aplicaciones de escritorio y PWAs: el dominio `app` genera aplicaciones Tkinter, scripts de empaquetado con PyInstaller y PWAs instalables, adecuado para herramientas internas.
- Modelado CAD parametrico: el dominio `cad` genera piezas en OpenSCAD y modelos CadQuery, util para iterar sobre disenos mecanicos desde descripciones textuales.
- Digital twins y visualizacion 3D: el dominio `3d` produce escenas Three.js y scripts de Blender, permitiendo montar visualizaciones de sistemas fisicos descritos en lenguaje natural.
- Sistemas IoT compuestos: mediante contratos de canal HTTP, MQTT, serial, SPI e I2C, se pueden conectar modulos de distintos dominios y generar un `system.json` que describa la integracion.
- Investigacion sobre lenguajes de programacion naturales: sirve como banco de pruebas reproducible (`nlcl/bench/`) para estudiar la viabilidad de instrucciones en lenguaje natural como fuente de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un directorio `nlcl/bench/` con suites de evaluacion reproducibles, pero no se aportan cifras en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el nucleo no requiere GPU y funciona con la biblioteca estandar de Python.
- GPU recomendadas: no aplica para el nucleo. Los backends opcionales de modelos de lenguaje, si se usan, requeririan hardware acorde al modelo elegido, pero no se especifica cual.
- Cabe en cualquier consumer GPU y en CPU: el requisito es un interprete de Python, no aceleracion por hardware.
- Opciones de despliegue: ejecucion directa con `python -m nlcl`, integracion en scripts y pipelines de CI mediante `python -m unittest discover -s tests`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican al no haber pesos.
- Latencia y throughput: no disponible; no se aportan mediciones.

## Comparativa con modelos similares

| Sistema | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NLCL | Interprete de reglas con IR y generacion de codigo multi-dominio | no aplica (sin pesos) | no disponible | MIT | Hugging Face (repo de codigo) |
| Modelos de lenguaje para generacion de codigo (p. ej. familia CodeLlama, Qwen-Coder) | Transformer neuronal | miles de millones | decenas de miles de tokens | variable | Hugging Face |
| Herramientas de generacion de codigo basadas en plantillas | Basadas en plantillas y DSL | no aplica | no aplica | variable | Repositorios de codigo |

La comparacion directa con modelos neuronales no es homogenea: NLCL no compite en capacidad de comprension general del lenguaje, sino en la generacion determinista de codigo multi-dominio a partir de un subconjunto de instrucciones en ingles. No se dispone de datos de rendimiento para comparar cuantitativamente.

## Limitaciones y advertencias

- Es un prototipo de investigacion, no un sistema de comprension general del lenguaje natural: el parser offline cubre solo patrones comunes de instruccion en ingles.
- Solo soporta ingles de forma nativa; otras lenguas dependen de backends opcionales de modelos de lenguaje no especificados.
- No contiene pesos de modelo, por lo que no debe evaluarse como un LLM ni esperarse capacidades de razonamiento abierto.
- Riesgo de interpretaciones incorrectas: el sistema pide aclaracion ante ambiguedad, pero la cobertura del parser es limitada y puede fallar en instrucciones no contempladas.
- El aprendizaje de vocabulario y la calibracion de confianza son heuristicos; no hay garantias formales de correccion del codigo generado.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; el proyecto se comparte para recibir feedback.
- No esta afiliado ni respaldado por Anthropic, pese a las etiquetas `anthropic` y `claude` del repositorio.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere un proyecto muy incipiente sin validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/cunknown/nlcl
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
