# assix-research/google-dino-game-reinforcement-learning-d3qn

## Resumen

El modelo `assix-research/google-dino-game-reinforcement-learning-d3qn` es un agente de aprendizaje por refuerzo profundo que aprende a jugar al juego del dinosaurio de Chrome/Chromium (T-Rex Runner) desde cero, por ensayo y error, dentro de un navegador real. Lo desarrolla la organización assix-research y se publica en HuggingFace como un modelo de tipo `reinforcement-learning`. No es un modelo de lenguaje: es un agente valor (value-based) que mapea un vector de estado de 15 caracteristicas continuas a valores Q para 3 acciones discretas (correr, saltar, agacharse).

La arquitectura es una Dueling Double Deep Q-Network (D3QN) implementada en PyTorch, con un perceptron multicapa (MLP) de dos capas densas de 128 unidades con ReLU, una corriente de valor V(s) y una corriente de ventaja A(s, a). El agente no procesa pixeles: lee el estado interno del juego mediante Selenium y JavaScript, lo normaliza y decide a unos 30 Hz. El modelo tiene solo 19.076 parametros (unos 77 KB), por lo que se ejecuta en tiempo real en CPU, en el navegador de un telefono o en GPU.

Su relevancia es practica y educativa: es un ejemplo minimo y reproducible de RL off-policy con experience replay, red objetivo y exploracion epsilon-greedy, entrenado online en un navegador Chromium controlado por Selenium sobre una NVIDIA DGX Spark. El resultado publicado es una puntuacion maxima por episodio de 659, frente a una linea base de politica aleatoria de aproximadamente 45.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dueling Double DQN (D3QN) con MLP: 2 x Dense(128) + ReLU, corriente V(s) Dense(128, 1) y corriente A(s, a) Dense(128, 3) |
| Parametros totales | 19.076 (aproximadamente 77 KB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente RL; usa un vector de estado de 15 dimensiones, no texto) |
| Tipos de cuantizacion | no aplica (no se documentan cuantizaciones; el modelo es lo bastante pequeno para ejecutarse en precision completa) |
| Idiomas soportados | no aplica (no procesa lenguaje natural); la documentacion esta en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (`dino_dqn.safetensors`) y checkpoints PyTorch (`best.pt`, `last.pt`) |
| Entrada | 15 caracteristicas continuas, normalizadas y recortadas a [-5, 5] |
| Salida | Valores Q para 3 acciones discretas: 0 = correr, 1 = saltar, 2 = agacharse |
| Frecuencia de decision | 30 Hz (30 decisiones por segundo) |
| Libreria | PyTorch |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-10 |
| Ultima actualizacion | 2026-10-10 |

## Arquitectura y entrenamiento

La red es una D3QN: combina Double DQN (que desacopla la seleccion y la evaluacion de la accion en el calculo del objetivo) con un cabezal dueling que separa el valor del estado V(s) de la ventaja de cada accion A(s, a), recombinandose como Q(s, a) = V(s) + A(s, a) - media(A(s, a)). El cuerpo es un MLP de dos capas densas de 128 unidades con activacion ReLU. La entrada es un vector de 15 caracteristicas: altura del dinosaurio sobre el suelo, velocidad vertical, indicadores de salto y agachado, velocidad actual del juego y, para los dos obstaculos mas proximos por delante, distancia horizontal, anchura, altura, posicion vertical y un indicador de pterodactilo. Si hay menos de dos obstaculos, la ranura vacia se rellena con `[1, 0, 0, 0, 0]`.

El entrenamiento se realizo online en un Chromium real controlado por Selenium sobre una NVIDIA DGX Spark (Ubuntu aarch64). Como `chrome://dino/` estaba bloqueado en ese entorno, el arnes lanza Chromium con depuracion remota, fuerza el modo sin conexion y carga una URL local de prueba, lo que muestra el mismo juego en la pagina de error `ERR_INTERNET_DISCONNECTED`. Los hiperparametros documentados son: optimizador Adam con tasa de aprendizaje 5e-4; perdida Huber (smooth L1) con recorte de la norma del gradiente a 10; factor de descuento gamma = 0,99; red objetivo con actualizacion suave (tau = 0,005); buffer de repeticion de 100.000 transiciones en GPU; tamano de lote de 128 (el aprendizaje empieza tras 2.000 muestras); entre 1 y 4 actualizaciones por tick aprovechando el tiempo ocioso entre ticks del juego; y exploracion epsilon-greedy que decae linealmente de 1,0 a 0,02 a lo largo de 30.000 pasos, con acciones aleatorias sesgadas hacia "correr" en proporcion 70/20/10. La funcion de recompensa esta modelada asi: +0,1 por sobrevivir un tick, -0,01 por accion de salto o agachado activa (para desincentivar entradas innecesarias) y -5,0 por choque (estado terminal). El numero total de pasos, actualizaciones de gradiente y tiempo de reloj del entrenamiento no esta disponible ("_fill in_" en la model card).

## Capacidades

- Control de un agente en tiempo real en el juego del dinosaurio de Chrome/Chromium (`chrome://dino/`), con decisiones a 30 Hz.
- Politica valor (Q-learning) off-policy con las tres acciones discretas correr, saltar y agacharse; el salto y el agachado se mantienen pulsados, por lo que la altura del salto es variable y el agachado en el aire provoca el descenso rapido.
- Lectura del estado interno del juego mediante Selenium y JavaScript, sin vision por computadora ni analisis de pixeles.
- Razonamiento reactivo de un solo paso a partir de un vector de estado de 15 dimensiones (no hay planificacion multi-paso ni memoria a largo plazo mas alla del buffer de experiencia durante el entrenamiento).
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-step: no aplica (agente de una sola accion por tick).
- Capacidades multilingues: no aplica.
- Capacidades especiales: exportacion a safetensors y checkpoints PyTorch, y modo de reproduccion (`--play`) para observarlo jugar en un navegador real; entrenamiento documentado para ejecucion en CPU, navegador de movil o GPU.

## Casos de uso

- Investigacion en aprendizaje por refuerzo profundo: sirve como implementacion de referencia y reproducible de D3QN con relativamente poco codigo y 19.076 parametros, util para comparar variantes de DQN (vanilla, Double, Dueling) con un coste computacional minimo.
- Docencia y tutoriales de RL: el agente es lo bastante pequeno para entrenarse y depurarse en una sesion, y permite ilustrar experience replay, red objetivo y descomposicion dueling de forma tangible.
- Generacion de trayectorias para RL offline: el arnes con Selenium puede registrar transiciones (estado, accion, recompensa, siguiente estado) para construir conjuntos de datos de entrenamiento offline o de evaluacion.
- Pruebas de automatizacion web con Selenium: el mismo arnes que controla el juego demuestra como conectar a una instancia de Chromium con depuracion remota, forzar el modo sin conexion y leer el DOM y el estado interno de una pagina web.
- Benchmarking de latencia en entornos en tiempo real: al decidir a 30 Hz (aproximadamente 33 ms por tick), es util para medir el coste de inferencia de un agente en CPU y comprobar si cabe en el presupuesto de tiempo de un juego interactivo.
- Demostraciones en dispositivos con recursos limitados: con unos 77 KB de pesos, se puede ejecutar en un navegador de movil o en una CPU modesta, lo que lo hace adecuado para demostraciones de agentes en el borde.
- Punto de partida para transfer learning: el vector de estado y el bucle de Selenium pueden adaptarse a otros juegos de navegador o entornos de pagina web que expongan su estado via JavaScript.

## Benchmarks y rendimiento

Los unicos datos publicados son la puntuacion maxima y la linea base aleatoria. La model card advierte de que la puntuacion varia mucho entre episodios y recomienda reportar tambien la media sobre muchos episodios, pero ese dato aparece sin rellenar ("_fill in_") en la informacion disponible.

| Metrica | Valor |
|---|---|
| Puntuacion maxima (episodio unico) | 659 |
| Puntuacion media +/- desviacion tipica sobre N episodios de evaluacion | no disponible ("_fill in_" en la model card) |
| Linea base de politica aleatoria (media) | aproximadamente 45 |
| Tasa de decision | 30 decisiones/s (tiempo de reloj) |
| Exploracion en evaluacion | epsilon = 0,02 (la model card indica que hay que especificar si fue en modo entrenamiento o en `--play` con epsilon = 0) |
| Pasos de entrenamiento / actualizaciones de gradiente / tiempo total | no disponible ("_fill in_" en la model card) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. Con 19.076 parametros (aproximadamente 77 KB en precision completa), el modelo cabe holgadamente en cualquier GPU e incluso no necesita GPU.
- GPU recomendadas: cualquiera, o ninguna. El entrenamiento documentado se realizo en una NVIDIA DGX Spark (Ubuntu aarch64).
- Ejecucion en GPU de consumo: si, y tambien en CPU. El autor indica que el modelo se ejecuta en tiempo real en una CPU, en el navegador de un movil o en una GPU.
- Opciones de despliegue: no aplica como LLM; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. La ejecucion se realiza con PyTorch (carga de `dino_dqn.safetensors` o de los checkpoints `best.pt` / `last.pt`) combinado con Selenium y una instancia de Chromium con depuracion remota.
- Latencia y throughput estimados: 30 decisiones por segundo (aproximadamente 33 ms por tick), segun la tasa de decision documentada.
- Requisitos adicionales: navegador Chromium/Chrome con depuracion remota y Selenium para el bucle de interaccion; el buffer de repeticion de 100.000 transiciones se mantiene en GPU durante el entrenamiento.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La model card no incluye referencias a otras implementaciones de D3QN ni a agentes equivalentes para el juego del dinosaurio de Chrome, por lo que la comparativa no esta disponible.

## Limitaciones y advertencias

- Ambito muy especifico: el agente esta disenado exclusivamente para el juego del dinosaurio de Chrome/Chromium. No es un modelo de proposito general y no transferira directamente a otras tareas sin reentrenamiento y redefinicion del vector de estado.
- Dependencia del entorno: requiere Selenium y una instancia de Chromium con depuracion remota. El autor documenta que abrir `chrome://dino/` directamente estaba bloqueado en su entorno Ubuntu y tuvieron que forzar el modo sin conexion y cargar una URL local; esta dependencia puede romperse en configuraciones distintas o en futuras versiones del navegador.
- Varianza alta en los resultados: la propia model card advierte de que las puntuaciones varian mucho entre episodios. La cifra de 659 es un maximo de un episodio unico; la media y la desviacion tipica no se han publicado, por lo que el rendimiento tipico no esta cuantificado.
- Datos de entrenamiento incompletos: el numero total de pasos, de actualizaciones de gradiente y el tiempo de reloj del entrenamiento no estan disponibles, lo que dificulta reproducir el resultado.
- Sesgos y alucinacion: no aplica en el sentido de un modelo de lenguaje (no genera texto), pero existe el riesgo de sobreajuste a la dinamica concreta del juego y a las condiciones del entorno de entrenamiento.
- Limitaciones de idioma: no aplica; el agente no procesa lenguaje natural.
- Restricciones de licencia: licencia MIT, que permite uso comercial siempre que se conserve el aviso de copyright y la licencia. No se documentan restricciones adicionales.
- Caveats para produccion: el modelo es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la ficha; el enlace al repositorio de codigo aparece como marcador de posicion (`https://github.com/<your-username>/<your-repo>`), por lo que el codigo de entrenamiento y reproduccion puede no estar disponible publicamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/assix-research/google-dino-game-reinforcement-learning-d3qn
- Repositorio de codigo (entrenamiento, reproduccion, exportacion): https://github.com/&lt;your-username&gt;/&lt;your-repo&gt; (marcador de posicion presente en la model card; no es una URL valida)
- Juego del dinosaurio de Chrome: `chrome://dino/` (no es un enlace web; debe pegarse en la barra de direcciones)
