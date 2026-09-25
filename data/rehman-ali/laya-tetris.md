# rehman-ali/laya-tetris

## Resumen

laya-tetris es un ajuste fino de `convaiinnovations/laya-multilingual` (base mmBERT, 322 M de parametros) que juega al Tetris sin busqueda ni lookahead. No es un modelo generativo de texto: es un modelo de decision del marco Laya que, dado el estado del tablero serializado como una linea de caracteristicas, devuelve una distribucion de probabilidad calibrada sobre un conjunto cerrado de opciones. El autor es `rehman-ali` y los pesos se publican bajo licencia Apache 2.0.

El problema que resuelve es acotado pero bien definido: elegir, para cada pieza, como girarla (4 opciones) y en que columna dejarla caer (10 opciones). Cada decision cuesta una pasada forward y el modelo responde a preguntas tipadas de tipo `choice`, en lugar de generar una accion token a token. La relevancia tecnica esta en el metodo: se entrena por imitacion sobre las probabilidades suavizadas de un profesor script (El-Tetris con las seis caracteristicas de Dellacherie), usando una regla de puntuacion estrictamente propia que fuerza probabilidades honestas.

Con 321.908.998 parametros y un repositorio de 0,7 GB, es un modelo pequeno que cabe en cualquier GPU de consumo. Su rendimiento declarado en partida es de 3196,2 lineas de media en 5 partidas de 8000 piezas, practicamente a la par que el profesor script (3198,2), mientras que el modelo base sin ajustar se bloquea a las 25 piezas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT-base (encoder transformer) dentro del marco de decision Laya |
| Parametros totales | 321.908.998 (322 M aproximadamente) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; el repositorio ocupa 0,7 GB) |
| Idiomas soportados | no disponible (el modelo base se declara multilingue por nombre, pero la entrada de este ajuste es un formato fijo en ingles definido en `tetris/encode.py`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de mmBERT-base (322 M de parametros) y conserva la arquitectura transformer encoder del modelo base, adaptada por el marco Laya a una tarea de clasificacion de decisiones: el estado del tablero se codifica como una unica linea de texto (pieza, giro, forma, alturas por columna, escalones, huecos y altura maxima) y una pregunta fija con opciones tipadas. Una sola pasada forward devuelve una probabilidad calibrada por opcion. Del total de parametros, la tabla de embeddings de tokens aporta 197 M y permanece congelada durante el ajuste, ya que el texto de Tetris solo usa unos cientos de los 256 000 tokens del vocabulario.

El entrenamiento es imitacion de un profesor que es un script, no un modelo: prueba las aproximadamente 34 colocaciones legales de cada pieza, las puntua con las seis caracteristicas de tablero de Dellacherie bajo los pesos publicos de El-Tetris, y su `softmax(score / 3)` sobre las colocaciones legales actua como objetivo suave. La perdida es el logaritmo esperado de esa puntuacion objetivo, una regla de puntuacion estrictamente propia (el termino logaritmico de la recompensa RLCD del propio Laya), de modo que minimizarla exige probabilidades honestas. El conjunto de datos son 162 979 filas de rollouts del profesor; la mitad arrancan sobre una pila de basura y el 15 % de las colocaciones son aleatorias, para que el modelo vea tambien tableros desordenados. La particion de entrenamiento y validacion se hace por partida, nunca por fila. El run fue de 1,0 epocas, batch 32 y 5094 pasos sobre mps, con temperaturas de calibracion ajustadas en validacion de 0,97 para el giro y 0,90 para la columna.

## Capacidades

- Prediccion de decisiones calibradas: devuelve, en una sola pasada forward, una probabilidad por cada opcion de una pregunta de tipo `choice`.
- Pregunta de giro: 4 opciones (`spawn`, `right`, `flip`, `left`), con 84,5 % de acierto en validacion frente a un 25 % de azar.
- Pregunta de columna: 10 opciones (columnas 1 a 10), con 82,6 % de acierto en validacion frente a un 10 % de azar.
- Juego de Tetris completo: encadena las dos preguntas por pieza sin busqueda ni lookahead, solo con el estado serializado del tablero.
- Entrada en formato fijo: consume exactamente las cadenas de caracteristicas definidas en `tetris/encode.py`; no admite variaciones libres del texto de estado.
- Sin generacion de texto libre: no produce prosa, codigo ni razonamiento explicito.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso mas alla de la secuencia giro-columna por pieza.
- Capacidades multilingues: no aplicables al ajuste; la interfaz de entrada es un formato tecnico en ingles.

## Casos de uso

- Bot de Tetris autonomo: el modelo se integra como politica de decision en un bucle de juego que serializa el tablero con `encode.py` y aplica la opcion de mayor probabilidad, sustituyendo a heuristicas manuales sin necesidad de busqueda.
- Demo jugable en navegador: el repositorio incluye una UI web que consume el modelo via la libreria Laya, util para mostrar en directo como un modelo de 322 M compite con un script heuristico.
- Entorno de investigacion en imitation learning: sirve como caso de estudio reproducible de destilacion de un profesor script a un modelo neuronal con objetivos suaves, incluida la particion por partida para evitar fugas de datos.
- Evaluacion de calibracion de probabilidades: las temperaturas de calibracion (0,97 y 0,90) y la regla de puntuacion estrictamente propia lo convierten en un banco de pruebas para medir si las probabilidades emitidas son honestas en tareas discretas.
- Experimentos de DAgger: el repositorio incluye el comando para jugar con el modelo, reetiquetar cada tablero visitado con el profesor y reajustar, un flujo habitual en investigacion de aprendizaje por imitacion iterativo.
- Comparacion de politicas en entornos discretos: permite contrastar en las mismas semillas la politica neuronal, el profesor El-Tetris, el modelo base sin ajustar y una politica aleatoria, con metricas de lineas, bloqueo y concordancia.
- Docencia y divulgacion: ejemplo compacto (0,7 GB) de como un encoder transformer pequeno se reutiliza como clasificador de decisiones calibrado en lugar de como generador de texto.
- Componente de referencia en pipelines de RL: el modelo puede actuar como politica inicial o como baseline fijo al que comparar agentes entrenados con refuerzo en el mismo entorno de Tetris.

## Benchmarks y rendimiento

Precision de validacion sobre 6000 tableros reservados, procedentes de partidas nunca usadas en entrenamiento:

| Pregunta | Opciones | Azar | Sin ajustar | Ajustado |
|---|---|---|---|---|
| Giro | 4 | 25 % | 33,3 % | 84,5 % |
| Columna | 10 | 10 % | 10,7 % | 82,6 % |

Resultados de partida: 5 partidas de 8000 piezas cada una, mascara de seguridad desactivada, semillas disjuntas de las de entrenamiento.

| Politica | Lineas medias | Mejor | Bloqueo | Concordancia con el profesor | Latencia p50 / p95 por pieza |
|---|---|---|---|---|---|
| Profesor (script El-Tetris, no es un modelo) | 3198,2 | 3199 | nunca | 100 % | 0,2 / 0,5 ms |
| laya-tetris | 3196,2 | 3199 | nunca | 79,5 % | 36,9 / 43,4 ms |
| laya-base (sin ajustar) | 0,0 | 0 | tras 25 piezas | 5,2 % | 39,0 / 47,5 ms |
| Aleatoria | 0,0 | 0 | tras 26 piezas | 7,0 % | no disponible |

El modelo discrepa del profesor en una de cada cinco piezas y aun asi pierde solo 2 lineas en 3198, lo que el autor interpreta como que, donde se desvia, suele encontrar una colocacion igual de buena y no una peor.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones calculadas a partir de los 321,9 M de parametros y del tamano del repositorio (0,7 GB, compatible con pesos en precision reducida); el autor no las publica.

- VRAM estimada para los pesos: aproximadamente 1,3 GB en fp32, 0,65 GB en fp16/bf16, 0,35 GB en int8 y 0,2 GB en int4.
- VRAM estimada para inferencia completa: menos de 2 GB en fp16 sumando activaciones y estado, dado que la entrada es una sola linea de texto y la cache de contexto es despreciable.
- Cabe en cualquier GPU de consumo: RTX 3060 (12 GB), RTX 4060, RTX 4070, RTX 4090, e incluso en GPUs con 4 GB o menos en cuantizacion reducida.
- Tambien es viable en CPU y en Apple Silicon; el entrenamiento se realizo sobre mps y las latencias declaradas probablemente se midieron en ese entorno, aunque el hardware exacto de la medicion no se especifica.
- GPU de datacenter (A100, H100) no aportan ventaja practica por tamano, salvo para ejecutar muchas instancias en paralelo.
- Despliegue: requiere la libreria `laya` (`laya.load("rehman-ali/laya-tetris")`). No consta soporte para vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos en GGUF.
- Latencia declarada: 36,9 ms de mediana y 43,4 ms en el percentil 95 por pieza (las dos preguntas), frente a 0,2 / 0,5 ms del profesor script; esta penalizacion de dos ordenes de magnitud es el coste del modelo neuronal.

## Comparativa con modelos similares

No se dispone de otros modelos de la misma categoria (politicas neuronales para Tetris) en la informacion proporcionada. La comparacion mas cercana es interna al propio repositorio:

| Sistema | Parametros | Tipo | Lineas medias | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-tetris | 321,9 M | Modelo neuronal, ajuste de Laya | 3196,2 | Apache 2.0 | HuggingFace |
| laya-multilingual (base sin ajustar) | 322 M aproximadamente | Modelo de decision Laya | 0,0 (bloqueo a las 25 piezas) | Apache 2.0 | HuggingFace (`convaiinnovations/laya-multilingual`) |
| Profesor El-Tetris (script) | no aplica | Heuristica con pesos de Dellacherie / El-Tetris | 3198,2 | no disponible | Blog de Islam Ahmed |
| Politica aleatoria | no aplica | Baseline | 0,0 (bloqueo a las 26 piezas) | no aplica | no aplica |

Frente al modelo base, el ajuste multiplica la concordancia con el profesor (de 5,2 % a 79,5 %) y pasa de bloquearse a las 25 piezas a completar 8000 piezas por partida sin bloquearse. No se han localizado alternativas publicas equivalentes de jugadores de Tetris neuronales con probabilidades calibradas.

## Limitaciones y advertencias

- Sesgo de distribucion: el modelo se entreno solo con tableros alcanzados por el profesor y por una politica con ruido; tras un error propio puede encontrarse tableros que nunca vio.
- Degradacion en tableros desordenados: sus decisiones de columna empeoran precisamente cuando la pila ya esta desordenada, segun admite el propio autor.
- Correccion pendiente: el autor propone una ronda de DAgger (jugar con el modelo, reetiquetar cada tablero con el profesor y reajustar) como arreglo; el comando esta en el repositorio, pero no se ha ejecutado en esta version.
- Alcance muy restringido: solo resuelve las dos preguntas de Tetris definidas en `tetris/encode.py`; no es un modelo de proposito general ni admite otras tareas sin reentrenamiento.
- Formato de entrada rigido: cualquier desviacion en las cadenas de estado o en el texto de la pregunta invalida la prediccion, ya que el modelo espera coincidencia exacta con el formato de codificacion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de probabilidades mal calibradas fuera de la distribucion de entrenamiento; las temperaturas de calibracion solo se ajustaron en validacion.
- Sesgos de la heuristica heredada: el modelo imita las seis caracteristicas de Dellacherie con los pesos de El-Tetris, por lo que hereda los sesgos y puntos ciegos de esa heuristica.
- Idiomas: no disponible; el ajuste no aporta capacidades multilingues utiles aunque el base se declare multilingue.
- Licencia: Apache 2.0, permite uso comercial, modificacion y redistribucion, manteniendo el aviso de licencia y los creditos a Convai Innovations, a Islam Ahmed (pesos de El-Tetris) y a Pierre Dellacherie (algoritmo original).
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni mantenimiento externo documentado.
- Longitud de contexto: no disponible; al trabajar con una sola linea de estado, no se ha publicado ninguna cifra de ventana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rehman-ali/laya-tetris
- Codigo, juego y UI de navegador: https://github.com/RehmanaliMomin/TetrisGame_Laya
- Codificacion de estado y preguntas: https://github.com/RehmanaliMomin/TetrisGame_Laya/blob/main/tetris/encode.py
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Pesos del profesor (El-Tetris, Islam Ahmed): https://imake.ninja/el-tetris-an-improvement-on-pierre-dellacheries-algorithm/
