# chorcat/rukh-small

## Resumen

Rukh-small es un decodificador tipo GPT entrenado desde cero para jugar al ajedrez prediciendo el siguiente movimiento de una partida escrita en notacion UCI. Lo publica el usuario chorcat como parte de Rukh, un curso que construye un modelo de lenguaje ajedrecistico de principio a fin, y corresponde a la etapa `small-greedy` de ese proyecto. Tiene 38.971.392 parametros (unos 39 M), un vocabulario fijo de 2030 tokens y una ventana de contexto de 200 movimientos.

El modelo no es un motor de ajedrez clasico con busqueda alfa-beta, sino un modelo de lenguaje autorregresivo que lee la partida como una secuencia de tokens y predice el siguiente. La cabecera de la secuencia codifica dos tokens de franja de Elo (`<w1800>`, `<b1800>`) para blanco y negro, de modo que la prediccion esta condicionada por el nivel de los jugadores. Se distribuye con pesos en safetensors y exportaciones ONNX en fp32, fp16 e int8 pensadas para ejecutarse en el navegador mediante WebGPU o, como respaldo, WebAssembly.

Su relevancia es doble. Por un lado, es un ejemplo reproducible y de tamano contenido de un pipeline completo de entrenamiento e inferencia en el navegador. Por otro, es un caso poco habitual de documentacion honesta: el propio autor publica las barras de aceptacion fijadas antes de entrenar y reconoce que la de Elo no se ha cumplido (1007 estimado frente a 1200 objetivo), atribuyendolo al corpus (5,9 M de partidas) y no a la capacidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo GPT, con la cabeza de lenguaje atada al embedding de tokens (weight tying) |
| Parametros totales | 38.971.392 (aprox. 39 M) |
| Longitud de contexto | 200 movimientos (tokens) |
| Vocabulario | 2030 tokens fijos, enumeracion no aprendida (incluida en `tokenizer/vocab.json`) |
| Tipos de cuantizacion | fp32 (`onnx/model.onnx`), fp16 (`onnx/model-fp16.onnx`) e int8 (`onnx/model-int8.onnx`); la precision del checkpoint safetensors no se especifica |
| Idiomas soportados | en (etiqueta del repositorio); la entrada real es notacion UCI de ajedrez |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32, fp16, int8) y `vocab.json` |
| Datasets de entrenamiento | `chorcat/rukh-games-1800` (5,9 M de partidas) y `chorcat/rukh-tokenizer` |
| Tamano del repositorio | 0,4 GB |
| Libreria de referencia | `rukh` |
| Fecha de publicacion | 19 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es un decodificador transformer de tipo GPT escrito desde cero, sin componentes de mezcla de expertos ni mecanismos de atencion lineal. La cabeza de modelado de lenguaje esta atada al embedding de tokens, por lo que el fichero de pesos contiene `tokens.weight` y no `lm_head.weight`: ambos son el mismo tensor. Esto implica que, al cargar el modelo manualmente, hay que volver a atar los pesos (`model.lm_head.weight = model.tokens.weight`), operacion que la libreria `rukh` realiza en el constructor.

La entrada es una secuencia de tokens que comienza con `<bos>`, sigue con las franjas de Elo de blanco y negro (`<w1800>`, `<b1800>`), continua con los movimientos en notacion UCI (`e2e4`, `e7e8q`, y el enroque como el movimiento de dos casillas del rey, por ejemplo `e1g1`) y termina con el resultado y `<eos>`. El entrenamiento se realizo sobre 5,9 millones de partidas del dataset `chorcat/rukh-games-1800`. La model card no menciona fases de RLHF, DPO ni ajuste por preferencias, ni detalla la composicion exacta del corpus mas alla del numero de partidas. El autor senala explicitamente que la etapa `medium`, con el triple de parametros y los mismos datos, solo gano 84 puntos de Elo con intervalos de confianza solapados, y concluye que la restriccion es el volumen de datos y no la capacidad del modelo.

Las exportaciones ONNX incorporan una decision de diseno relevante: el grafo devuelve unicamente los logits del ultimo paso, con forma `(batch, vocab)`, lo que reduce el tensor de salida en un factor de doscientas veces respecto a devolver toda la secuencia. El fichero fp16 esta pensado para WebGPU y el int8 para el respaldo en WebAssembly.

## Capacidades

- Generacion de movimientos de ajedrez en notacion UCI, condicionada por las franjas de Elo de ambos jugadores.
- Prediccion del siguiente movimiento con una precision top-1 del 51,1 % y top-3 del 79,4 % sobre el conjunto de validacion.
- Generacion de movimientos legales sin mascara de legalidad en el 99,4 % de las posiciones (argmax y muestreo con T=0,05, top-k 1).
- Resolucion de problemas tacticos (puzzles) en el 22,1 % de los casos, con desglose por dificultad: 34,7 % en la banda 1000-1500, 21,1 % en 1500-2000 y 10,3 % en 2000+.
- Inferencia en navegador mediante ONNX Runtime con WebGPU o, en su defecto, WebAssembly.
- Ejecucion en CPU y en GPU de gama baja gracias al reducido numero de parametros.
- Condicionamiento por nivel de juego mediante tokens de cabecera, lo que permite simular distintos niveles de Elo.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; el pipeline declarado es `text-generation` y el modelo es un predictor de movimientos de un solo proposito.

## Casos de uso

- Motor de ajedrez ligero en el navegador: la demo oficial carga `model-fp16.onnx` sobre WebGPU y `model-int8.onnx` sobre WebAssembly, de modo que el modelo puede integrarse en una aplicacion web sin backend ni GPU dedicada, con un peso de decenas de megabytes.
- Analisis y anotacion de partidas: con un top-3 del 79,4 %, el modelo sirve para senalar movimientos candidatos en visores de partidas o herramientas de analisis, mostrando las tres continuaciones mas probables en cada posicion.
- Filtrado y curado de datos para entrenamiento: al ser un modelo de 39 M de parametros, se puede ejecutar sobre corpus masivos de partidas para puntuar la verosimilitud de cada movimiento y descartar o priorizar posiciones antes de entrenar modelos mayores.
- Bots de ajedrez para entornos con recursos limitados: cabe en un movil o en una placa embebida, por lo que es adecuado para bots en aplicaciones moviles, demos educativas o torneos de bajo consumo donde no se quiere desplegar un motor clasico completo.
- Investigacion educativa y reproducibilidad: al formar parte del curso Rukh, sirve como referencia para replicar un pipeline completo de tokenizacion, entrenamiento, evaluacion y exportacion a ONNX, incluida la medicion de paridad entre formatos.
- Simulacion de jugadores por nivel: gracias a los tokens de cabecera `<wXXXX>` y `<bXXXX>` (bins de 100 puntos de Elo), permite generar partidas con un perfil de fuerza controlado para pruebas, estudio de estilos o generacion de contenido didactico.
- Evaluacion comparativa de estrategias de muestreo: el mismo checkpoint mide 1007 Elo con T=0,05 y top-k 1 y 785 Elo con T=0,6 y top-k 20, lo que lo convierte en un banco de pruebas sencillo para estudiar como afecta el muestreo al rendimiento ajedrecistico.

## Benchmarks y rendimiento

Resultados medidos con `rukh eval --suite full` el 19 de septiembre de 2026, sobre el checkpoint `7130d64ac1c4`.

| Metrica | Valor |
|---|---|
| Legalidad sin mascara, argmax | 99,4 % |
| Legalidad sin mascara, muestreo (T=0,05, top-k 1) | 99,4 % |
| Siguiente movimiento top-1 | 51,1 % |
| Siguiente movimiento top-3 | 79,4 % |
| Puzzles resueltos | 22,1 % |
| Elo estimado (T=0,05, top-k 1) | 1007 (IC 95 %: 920-1101) |
| Elo estimado (T=0,6, top-k 20) | 785 |

Puzzles resueltos por banda de dificultad:

| Banda | Resueltos |
|---|---|
| 1000-1500 | 34,7 % |
| 1500-2000 | 21,1 % |
| 2000+ | 10,3 % |

Barras de aceptacion fijadas antes del entrenamiento en `GOAL.md`:

| Barra | Objetivo | Medido | Veredicto |
|---|---|---|---|
| Legalidad sin mascara, argmax | al menos 99 % | 99,4 % | cumplida |
| Elo estimado | al menos 1200 | 1007 (IC 95 %: 920-1101) | no cumplida |

Paridad de las exportaciones ONNX frente al checkpoint de PyTorch, medida sobre 1000 posiciones de validacion comparando el movimiento argmax:

| Fichero | Mismo movimiento que PyTorch | Peor deriva de logits |
|---|---|---|
| `model.onnx` (fp32) | 100,0 % | 2,55e-05 |
| `model-fp16.onnx` (fp16) | 99,8 % | 0,014 |
| `model-int8.onnx` (int8) | 95,4 % | 1,75 |

La barra autoimpuesta de paridad es del 99,9 %, por lo que ni fp16 ni int8 la alcanzan. Notas metodologicas declaradas por el autor: el intervalo de Elo cubre solo ruido de muestreo; los cuatro escalones `skill-*` son anclas nominales de `Skill Level` y no ratings medidos; Stockfish juega a 0,1 s por movimiento; y 4 de las 160 partidas alcanzaron el limite de contexto y fueron adjudicadas en lugar de puntuarse como tablas.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 156 MB en fp32, 78 MB en fp16 y 39 MB en int8 (calculado a partir de los 38.971.392 parametros). El repositorio completo ocupa 0,4 GB.
- VRAM estimada para inferencia: por debajo de 1 GB en cualquiera de los tres formatos, sumando pesos, activaciones y cache de clave-valor. La model card no publica el numero de capas ni la dimension oculta, por lo que no se puede desglosar la cache con precision.
- GPU recomendadas: cualquier GPU con soporte de WebGPU o CUDA sirve; el modelo no necesita A100 ni H100. Para la demo web, una GPU integrada reciente es suficiente.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en GPU integradas y en CPU, dado el reducido tamano. No se documentan requisitos minimos concretos.
- Opciones de despliegue: la libreria de referencia es `rukh` para PyTorch; para produccion ligerera se usan las exportaciones ONNX con ONNX Runtime (WebGPU en el navegador, WebAssembly como respaldo). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al tratarse de una arquitectura propia con vocabulario fijo no puede asumirse su compatibilidad.
- Latencia y throughput: no disponible. El autor no publica tiempos de inferencia ni tokens por segundo.
- Nota de despliegue: los ficheros ONNX devuelven solo los logits del ultimo paso (`(batch, vocab)`), lo que reduce el tensor de salida y el coste de transferencia en el navegador.

## Comparativa con modelos similares

La informacion disponible no identifica otros modelos de ajedrez comparables por nombre, por lo que la comparacion se limita a las variantes de la propia familia Rukh y al trabajo de referencia citado de forma generica.

| Modelo | Parametros | Contexto | Elo estimado | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Rukh-small (`small-greedy`) | 38,97 M | 200 movimientos | 1007 (IC 95 %: 920-1101) | 5,9 M de partidas | Apache 2.0 | safetensors y ONNX (fp32/fp16/int8) |
| Rukh-medium | Aprox. 3x Rukh-small (no se da la cifra exacta) | No disponible | 84 puntos mas que small, con intervalos solapados | Los mismos 5,9 M de partidas | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Trabajo de referencia citado | No disponible | No disponible | No disponible | 16 M de partidas | No disponible | No disponible |

Otros modelos de ajedrez de la misma categoria: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Elo por debajo del objetivo: 1007 estimado frente a la barra de 1200 fijada por el proyecto, con un limite inferior del intervalo en 920. No es un sustituto de un motor de ajedrez clasico para juego fuerte.
- El rating no es una propiedad fija del fichero: el mismo checkpoint mide 1007 Elo con T=0,05 y top-k 1, y 785 con T=0,6 y top-k 20. Cualquier comparacion entre etapas debe fijar antes el esquema de muestreo.
- Movimientos ilegales sin mascara: el 0,6 % de las posiciones produce un movimiento ilegal en argmax. La demo aplica una mascara de legalidad antes de muestrear, de modo que ese fallo queda oculto en el uso interactivo pero aparece si se reutiliza el modelo sin ella.
- Degradacion en int8: `model-int8.onnx` elige un movimiento distinto al de PyTorch en el 4,6 % de las posiciones (aproximadamente 1 de cada 22), por lo que un dispositivo que use el respaldo WebAssembly juega con un modelo mediblemente distinto al de los resultados publicados. El fp16 falla en el 0,2 % (aproximadamente 1 de cada 500).
- Limite de contexto: 200 movimientos. En la evaluacion, 4 de 160 partidas lo agotaron y tuvieron que ser adjudicadas en lugar de puntuadas como tablas.
- Dependencia del corpus: el autor atribuye el techo de rendimiento al volumen de datos (5,9 M de partidas frente a los 16 M del trabajo de referencia), no a la capacidad del modelo. Mas capas no resolvieron el problema en la etapa `medium`.
- Vocabulario fijo de 2030 tokens: no es aprendido ni extensible, lo que limita el modelo a la notacion UCI de ajedrez y descarta cualquier uso de proposito general pese a la etiqueta `text-generation`.
- Idiomas: la unica lengua declarada es el ingles, y en la practica la entrada y la salida son notacion de ajedrez, no lenguaje natural.
- Riesgo de alucinacion: cualquier salida que no corresponda a un movimiento legal es, en la practica, una alucinacion. La evaluacion mide esta tasa, pero no hay estudios sobre sesgos de estilo, aperturas sobrerrepresentadas ni sesgos geograficos del corpus de Lichess.
- Licencia: Apache 2.0, permisiva y apta para uso comercial, con la obligacion habitual de conservar el aviso de licencia y el fichero de cambios si se redistribuye.
- Carga manual: el embedding y la cabeza de lenguaje comparten tensor, por lo que ignorar el reatado (`model.lm_head.weight = model.tokens.weight`) al cargar el safetensors produce un modelo incorrecto.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, y publicacion muy reciente. No hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chorcat/rukh-small
- Repositorio del proyecto Rukh: https://github.com/borja-glez/rukh
- Demo jugable (etapa small-greedy): https://rukh.borjaglez.com/?stage=small-greedy
- Blog del proyecto: https://lab.rukh.borjaglez.com
- Dataset de partidas: https://huggingface.co/datasets/chorcat/rukh-games-1800
- Dataset del tokenizer: https://huggingface.co/datasets/chorcat/rukh-tokenizer
- Ficheros del repositorio: `model.safetensors`, `config.json`, `tokenizer/vocab.json`, `onnx/model.onnx`, `onnx/model-fp16.onnx`, `onnx/model-int8.onnx`, `onnx/parity.json`

Nota: la busqueda web asociada a esta consulta no devolvio resultados relevantes sobre el modelo (unicamente enlaces genericos de YouTube), por lo que no se han podido incorporar enlaces adicionales a papers, blogs o repositorios distintos de los citados en la model card.
