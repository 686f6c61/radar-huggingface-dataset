# rehman-ali/laya-tetris-4line

## Resumen

`laya-tetris-4line` es un ajuste fino de [`convaiinnovations/laya-multilingual`](https://huggingface.co/convaiinnovations/laya-multilingual) (mmBERT-base, 322M parámetros) publicado por el usuario rehman-ali para jugar a Tetris. El modelo no genera texto libre: recibe el estado del tablero serializado como una única línea de características y responde a una pregunta de tipo `choice` con una distribución de probabilidad calibrada sobre cada opción. Cada pieza requiere exactamente dos preguntas: cómo girarla (4 opciones, azar del 25%) y en qué columna dejarla caer (10 opciones, azar del 10%).

La propuesta técnica es una imitación de un profesor programado a mano (el script con los pesos de El-Tetris, mejora del algoritmo de Dellacherie) entrenada con un objetivo de log-score esperado sobre el softmax de las puntuaciones del profesor, más un ciclo de DAgger. El resultado declarado es un agente sin búsqueda ni lookahead que iguala al profesor en líneas medias (1991,3 frente a 1992,7 en 3 partidas de 5000 piezas) aunque con muchos menos Tetrises (122,0 frente a 188,3).

Es relevante como ejemplo de dos ideas: usar un encoder multilingüe congelado en gran parte (la tabla de embeddings de 197M parámetros se mantiene congelada) para decisiones estructuradas, y emplear reglas de puntuación propias (proper scoring rules) para obtener probabilidades honestas en vez de simples etiquetas. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (mmBERT-base), adaptado a decision por eleccion multiple |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero las cadenas de estado y de pregunta del ajuste fino estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 0,7 GB) |
| Pipeline declarado | text-classification |
| Libreria | laya |
| Modelo base | convaiinnovations/laya-multilingual |
| Parametros congelados | tabla de embeddings de 197M parametros (de un vocabulario de 256k tokens) |

## Arquitectura y entrenamiento

La base es mmBERT-base, un encoder transformer de 322M parametros con una tabla de embeddings de 197M parametros sobre un vocabulario de 256k tokens. El ajuste fino congela esa tabla porque el texto de Tetris utiliza solo unos cientos de tokens del vocabulario. La entrada es una unica linea de caracteristicas del tablero (pieza, giro, forma, alturas por columna, escalones, huecos, altura maxima) y la salida es una probabilidad por opcion, obtenida en una sola pasada forward por pregunta. No hay busqueda, ni lookahead, ni generacion autoregresiva.

El profesor es un script, no un modelo: prueba las aproximadamente 34 colocaciones legales de cada pieza y las puntua con las seis caracteristicas de tablero de Dellacherie bajo los pesos publicados de El-Tetris. Su `softmax(score / 3)` sobre las colocaciones legales es el objetivo de entrenamiento. La perdida es el log-score esperado de ese objetivo suave (la parte logaritmica de la recompensa RLCD de Laya), una regla de puntuacion estrictamente propia, de modo que la estrategia que minimiza la perdida es emitir probabilidades honestas. Los datos son 230.961 filas de rollouts del profesor; la mitad arrancan sobre pilas de basura y el 15% de las colocaciones son aleatorias, para que el modelo vea tambien los tableros desordenados que producen sus propios errores. La division entre entrenamiento y validacion se hace por partida, nunca por fila. El entrenamiento fue de 1,0 epocas, batch 32, 7.218 pasos sobre MPS, con temperaturas de calibracion ajustadas en validacion (0,86 para el giro y 0,77 para la columna). El ciclo de DAgger (jugar con el modelo, reetiquetar cada tablero visitado con el profesor y reajustar) es lo que permitio pasar de la version `laya-tetris-4` a `laya-tetris-4d`.

## Capacidades

- Clasificacion de decision con probabilidades calibradas: devuelve `choice` y `probabilities` por cada opcion, no solo la etiqueta ganadora.
- Respuesta a dos preguntas fijas de tipo `choice`: giro de la pieza (`spawn` / `right` / `flip` / `left`) y columna de caida (10 opciones, de muro izquierdo a muro derecho).
- Juego completo de Tetris sin busqueda ni lookahead: una pasada forward por pregunta.
- Manejo de tableros desordenados o con basura, gracias a que el 50% de los datos de entrenamiento arrancan sobre pilas de basura.
- No dispone de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- No es un modelo de proposito general: no se documenta generacion de texto libre, codigo ni matematicas.

## Casos de uso

- Agente de Tetris en tiempo real: el modelo responde a las dos preguntas por pieza con una latencia p50 declarada de 36,1 ms, suficiente para jugar en vivo con una interfaz de navegador como la del repositorio.
- Investigacion en imitacion con probabilidades calibradas: sirve como banco de pruebas para comparar objetivos de perdida (log-score esperado frente a entropia cruzada dura) midiendo la calidad de las probabilidades y no solo la precision.
- Estudio de DAgger y correccion de distribucion: el repositorio incluye el comando para repetir el ciclo, lo que permite reproducir la mejora de 1701,3 a 1991,3 lineas medias y de 55,7 a 122,0 Tetrises.
- Generacion de datos de entrenamiento y evaluacion: al etiquetar tableros con el profesor y comparar con las predicciones del modelo se obtienen senales de desacuerdo utiles para analizar donde falla la politica.
- Demostracion docente de serializacion de estado estructurado a texto: muestra como convertir un tablero en una linea de caracteristicas y como forzar una respuesta de eleccion multiple con un encoder.
- Referencia base para Tetris: cualquier politica nueva (RL, busqueda, otro transformer) puede medirse contra las cifras declaradas de lineas, Tetrises, top-outs y acuerdo con el profesor.
- Integracion como bot en un entorno de juego propio: basta con replicar el formato exacto de `encode.py` y llamar a `agent.predict(state, question)`.
- Analisis de robustez fuera de distribucion: la propia model card documenta que la precision de columna cae cuando la pila ya esta fea, lo que lo convierte en un caso de estudio medible sobre degradacion.

## Benchmarks y rendimiento

Precision en validacion sobre 3.502 tableros reservados, procedentes de partidas nunca vistas en entrenamiento:

| Pregunta | Opciones | Azar | Sin ajustar | Ajustado |
|---|---|---|---|---|
| Giro | 4 | 25% | 80,7% | 86,4% |
| Columna | 10 | 10% | 80,9% | 85,8% |

Resultados de juego: 3 partidas de 5.000 piezas cada una, mascara de seguridad desactivada, semillas disjuntas del entrenamiento:

| Politica | Lineas medias | Tetrises | Top-out | Acuerdo con el profesor | Latencia p50 |
|---|---|---|---|---|---|
| teacher-tetris (script, no es un modelo) | 1992,7 | 188,3 | nunca | 100% | 0,3 ms |
| laya-tetris-4d | 1991,3 | 122,0 | nunca | 73,6% | 36,1 ms |
| laya-tetris-4 (antes de DAgger) | 1701,3 | 55,7 | 1 de 3 partidas | 65,2% | 34,3 ms |
| laya-tetris (profesor plano) | 1998,0 | 4,7 | nunca | 58,9% | 33,8 ms |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible, algo esperable porque el modelo no es un modelo de lenguaje de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32, 0,65 GB en fp16/BF16 y 0,32 GB en int8 (calculo a partir de los 321,9M parametros; no hay cifras oficiales en la model card).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4070 o RTX 4090 lo ejecutan con margen amplio. Las GPU de datacenter (A100, H100) solo tienen sentido para servir muchas instancias en paralelo.
- Cabe holgadamente en GPU de consumo, y con 0,65 GB en fp16 probablemente tambien en CPU y en GPU integradas, aunque no se documenta latencia en esos entornos.
- Opciones de despliegue: la libreria `laya` a traves de `laya.load("rehman-ali/laya-tetris-4line")` y `agent.predict(state, question)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; dado que es un pipeline de eleccion multiple con formato de entrada propio, esas herramientas no son aplicables sin adaptacion.
- Latencia: p50 declarada de 36,1 ms por decision; el hardware de esa medicion no se especifica en la model card, aunque el entrenamiento se ejecuto sobre MPS. Con dos preguntas por pieza, el coste es de dos pasadas forward por pieza.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-tetris-4line (este) | 321,9M | no disponible | 1991,3 lineas medias, 122,0 Tetrises, 73,6% de acuerdo con el profesor | Apache 2.0 | HuggingFace, 0 descargas |
| laya-tetris-4 | 321,9M (mismo base) | no disponible | 1701,3 lineas medias, 55,7 Tetrises, 1 top-out en 3 partidas | Apache 2.0 | Requiere consultar el repositorio del autor |
| laya-tetris (profesor plano) | 321,9M (mismo base) | no disponible | 1998,0 lineas medias pero solo 4,7 Tetrises | Apache 2.0 | Requiere consultar el repositorio del autor |
| teacher-tetris (script, no es un modelo) | no aplica | no aplica | 1992,7 lineas medias, 188,3 Tetrises, 0,3 ms p50 | no disponible | Codigo en el repositorio del proyecto |
| convaiinnovations/laya-multilingual (base) | 322M | no disponible | No es un jugador de Tetris; no comparable en esta tarea | Apache 2.0 | HuggingFace |

Nota: los tres primeros y el quinto comparten la misma arquitectura base, por lo que la comparativa mide el efecto del ajuste fino y del ciclo de DAgger, no diferencias de escala. No se han identificado en la informacion disponible otros modelos publicos de Tetris con caracteristicas equivalentes.

## Limitaciones y advertencias

- El modelo se entreno sobre tableros alcanzados por el profesor y por una politica con ruido. Tras un error propio puede encontrarse con disposiciones que nunca vio y su eleccion de columna empeora precisamente cuando la pila ya esta desordenada.
- No hay busqueda ni lookahead: toda la decision procede de una unica pasada forward, lo que limita la calidad frente a planificadores que evaluan colocaciones completas.
- Las probabilidades estan calibradas con temperaturas ajustadas en validacion (0,86 y 0,77). Usar las salidas sin aplicar esa calibracion invalida la interpretacion probabilistica.
- Dependencia estricta del formato de entrada: las cadenas de estado y de pregunta deben coincidir exactamente con las de `tetris/encode.py`. Cualquier variacion de espaciado, orden o redaccion puede degradar la respuesta.
- Ambito de aplicacion muy estrecho: solo Tetris, con dos preguntas de opciones fijas. No debe usarse como modelo de lenguaje ni para clasificacion de texto general, pese a que el pipeline declarado sea `text-classification`.
- Idiomas: no se declaran idiomas soportados y las plantillas del ajuste fino estan en ingles; el caracter multilingue heredado del modelo base no se ha validado para esta tarea.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre conservando el aviso de licencia y los creditos. El modelo base de Convai Innovations tambien es Apache 2.0. Los pesos del profesor derivan del algoritmo de Dellacherie y de los pesos de El-Tetris de Islam Ahmed.
- Riesgo de alucinacion en el sentido de sobreexcitacion de opciones: al devolver siempre una distribucion sobre todas las opciones, puede asignar masa de probabilidad apreciable a colocaciones malas cuando el tablero esta fuera de distribucion.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta, sin revision externa ni resultados de terceros que reproduzcan las cifras declaradas.
- Las cifras de juego provienen de 3 partidas de 5.000 piezas; es una muestra pequena y con semillas concretas, por lo que la varianza entre ejecuciones no esta cuantificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rehman-ali/laya-tetris-4line
- Codigo, juego e interfaz de navegador: https://github.com/RehmanaliMomin/TetrisGame_Laya
- Codigo de serializacion del estado: https://github.com/RehmanaliMomin/TetrisGame_Laya/blob/main/tetris/encode.py
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Pesos del profesor (El-Tetris, mejora del algoritmo de Pierre Dellacherie): https://imake.ninja/el-tetris-an-improvement-on-pierre-dellacheries-algorithm/
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron exclusivamente resultados de contenido para adultos sin relacion con el proyecto.
