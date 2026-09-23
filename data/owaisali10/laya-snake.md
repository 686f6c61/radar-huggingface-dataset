# OwaisAli10/laya-snake

## Resumen

laya-snake es un ajuste fino del modelo de decisiones Laya (convaiinnovations/laya, descrito en su model card como mmBERT-base con 322 millones de parametros) especializado en jugar al Snake. No es un modelo generativo de texto: recibe una descripcion textual del tablero y de la posicion de la serpiente, y devuelve una decision tipada de tipo `choice` entre cuatro opciones (arriba, abajo, izquierda, derecha). Cada tick del juego equivale a una inferencia.

El modelo lo publica el usuario OwaisAli10 y se entrena mediante destilacion de un profesor basado en BFS (busqueda en anchura) que calcula la ruta mas corta hacia la comida siempre que la cola siga siendo alcanzable. El ajuste se hizo sobre 114.476 estados de entrenamiento y 5.524 de validacion generados por el propio profesor, con una unique funcion de perdida de scoring rule propia (expected log score) y objetivos suaves. El resultado reportado es una precision de validacion que pasa de 0,38 a 0,90 y una puntuacion media de 89,9 en 10 partidas de 15x15, frente a 0,4 del modelo base sin ajustar.

Su relevancia es acotada pero clara: es un ejemplo reproducible de destilacion de un planificador simbolico (BFS) en una red neuronal de 322 M que decide en 31,8 ms p50 sobre una GPU de Apple M1 Pro, lo que lo convierte en un banco de pruebas util para estudiar imitacion con objetivos suaves, latencia de modelos de decision no autorregresivos y comportamiento emergente en entornos de rejilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-base) con cabeza de clasificacion; modelo de decision no autorregresivo segun la documentacion de Laya |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors; no se publican variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | no disponible; el modelo base se distribuye como multilingue, pero este ajuste consume descripciones de tablero en el formato de `snake/encode.py` (texto en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,7 GB) |
| Libreria de carga | `laya` (runtime propio del autor del modelo base) |
| Tarea declarada (pipeline) | text-classification |
| Modelo base | convaiinnovations/laya |
| Fecha de publicacion en HuggingFace | 23 de septiembre de 2026 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Laya, un encoder tipo mmBERT-base de 322 M de parametros descrito en la web del proyecto como un "System 1 decision engine" no autorregenerativo y multilingue que responde a preguntas tipadas con latencias del orden de 33 ms. En laya-snake esa capacidad se reorienta a una unica tarea: dado un estado textual del tablero (`heading`, `length`, posicion relativa de la comida y estado de las cuatro casillas adyacentes con espacio libre alcanzable), elegir una de cuatro direcciones. La salida se interpreta como una distribucion sobre las opciones, de la que se aplica una temperatura ajustada de 0,54.

El entrenamiento es un caso de destilacion con etiquetas suaves. El profesor es un script BFS que toma la ruta mas corta hacia la comida solo si la cola permanece alcanzable; la etiqueta asigna 0,85 de probabilidad al movimiento del profesor y reparte el resto entre los demas movimientos que garantizan supervivencia. Los datos son 114.476 estados de entrenamiento y 5.524 de validacion extraidos de partidas del profesor en tableros de 10 a 20 casillas de ancho, con un 12 % de movimientos seguros aleatorios inyectados. La perdida es expected log score, una scoring rule estrictamente propia, y el ajuste es completo (full fine-tune), 2 epocas, 41 minutos en una Colab T4. La precision de validacion pasa de 0,38 antes a 0,90 despues del ajuste. No se documenta uso de RLHF ni de DPO.

## Capacidades

- Decision discreta no autorregenerativa: responde a una pregunta `choice` con cuatro opciones y devuelve la opcion seleccionada junto con su distribucion.
- Interpretacion de estado estructurado: consume descripciones textuales de tablero en el formato exacto generado por `snake/encode.py`, incluyendo rumbo, longitud, posicion relativa de la comida y estado de las casillas adyacentes.
- Planificacion de ruta corta imitada: reproduce el comportamiento del profesor BFS en el 77,7 % de los movimientos segun la evaluacion publicada.
- Supervivencia basica: aprende a evitar movimientos que dejan la cola inalcanzable, gracias al sesgo de las etiquetas suaves.
- Multilingue: heredado del modelo base por declaracion del autor, aunque no hay evaluacion especifica por idioma para este ajuste.
- No soporta tool calling, function calling, agentes multi-paso, generacion de texto, razonamiento en lenguaje natural, codigo, matematicas, vision ni audio. La etiqueta text-classification describe el formato de entrada y salida, no una capacidad conversacional.

## Casos de uso

- Agente jugador de Snake en tiempo real: el modelo se integra en el bucle del juego y decide una direccion por tick; con 31,8 ms p50 en M1 Pro permite tasas de refresco de decenas de movimientos por segundo en hardware de consumo. Existe una implementacion de referencia en el repositorio ArjunSonara/laya-snake-ai, que usa el motor de decisiones de Laya sobre una rejilla de 20x20.
- Banco de pruebas de destilacion profesor-alumno: sirve para medir cuanto de un planificador simbolico (BFS con restriccion de alcanzabilidad de cola) se puede comprimir en una red de 322 M con etiquetas suaves y una scoring rule propia.
- Estudio de scoring rules y calibracion: el modelo publica una temperatura ajustada de 0,54 y se entreno con expected log score, por lo que es un caso practico para comparar calibracion de distribuciones de decision frente a etiquetas duras.
- Evaluacion de latencia de modelos de decision en hardware de consumo: ideal para comparar runtimes (runtime `laya` en PyTorch frente a alternativas nativas como laya-mlx en Apple Silicon, que declara 7-14 ms en decisiones cortas en M3 Max) sobre una carga real y repetible.
- Generacion de datos sinteticos para aprendizaje por refuerzo: las partidas del agente se pueden registrar como trayectorias etiquetadas por recompensa, utiles para entrenar o evaluar politicas posteriores en entornos de rejilla.
- Material docente de imitacion con profesores imperfectos: el propio autor documenta que el agente se atasca en configuraciones no vistas, lo que lo convierte en un ejemplo util para explicar el fallo por distribucion desplazada en imitation learning.
- Demostracion de integracion de un modelo de decision tipada en una interfaz grafica: el repositorio de entrenamiento incluye UI de juego, de modo que sirve como plantilla para conectar un checkpoint local a un frontend sin API en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, algo esperable en un modelo de decision especializado. La unica evaluacion publicada es la del propio juego: 10 partidas en tablero de 15x15 ejecutadas sobre la GPU de un Apple M1 Pro.

| Politica | Puntuacion media | Mejor puntuacion | Coincide con el profesor | Latencia p50 |
|---|---|---|---|---|
| Profesor (BFS) | 200,5 | 219 | 100 % | 0,2 ms |
| laya-snake | 89,9 | 143 | 77,7 % | 31,8 ms |
| Laya-multilingual sin ajustar | 0,4 | 2 | 3,2 % | 31,8 ms |

Datos adicionales de entrenamiento y validacion reportados por el autor: precision de validacion 0,38 antes del ajuste y 0,90 despues; temperatura ajustada 0,54; 114.476 estados de entrenamiento y 5.524 de validacion; 2 epocas en 41 minutos sobre una Colab T4.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 321,9 M de parametros; son estimaciones teoricas, no medidas publicadas): aproximadamente 1,29 GB en FP32, 0,64 GB en FP16/BF16 (coherente con el repositorio de 0,7 GB), 0,32 GB en INT8 y 0,16 GB en INT4.
- Cabe sin problemas en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 2 GB o mas de VRAM en FP16, ademas de los propios SoC de Apple (la evaluacion publicada se hizo en un M1 Pro).
- La ejecucion es viable en CPU, aunque la latencia de 31,8 ms p50 reportada corresponde a GPU; no se publican medidas en CPU.
- Opciones de despliegue: la libreria `laya` del modelo base (`laya.load` + `agent.predict`), peso en safetensors cargable desde PyTorch. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, y no seria esperable al no ser un modelo generativo autorregresivo. Para Apple Silicon existe el runtime MLX de terceros laya-mlx, que declara 7-14 ms en decisiones cortas sobre M3 Max, aunque no hay confirmacion de que funcione especificamente con este checkpoint.
- Throughput estimado: aproximadamente 31 decisiones por segundo en M1 Pro con el runtime de referencia; la comparativa de latencia con laya-mlx sugiere que un runtime nativo puede multiplicar esa cifra en hardware Apple reciente. El profesor BFS es unas 160 veces mas rapido por movimiento (0,2 ms), aunque mucho mas costoso en logica de busqueda que en computo neuronal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntuacion media en Snake 15x15 (10 partidas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-snake | 322 M | no disponible | 89,9 (mejor 143) | Apache 2.0 | HuggingFace (0 descargas) |
| laya-multilingual (base sin ajustar) | 322 M | no disponible | 0,4 (mejor 2) | Apache 2.0 | HuggingFace |
| Profesor BFS del proyecto | no es una red neuronal (script de busqueda) | no aplica | 200,5 (mejor 219) | no aplica (codigo del repositorio del autor) | GitHub del proyecto |

No se dispone de informacion sobre otros modelos neuronales comparables que jueguen al Snake y publiquen puntuaciones en el mismo entorno, por lo que la comparacion se limita a las alternativas internas del propio proyecto. Las implementaciones de terceros (ArjunSonara/laya-snake-ai) usan el mismo motor de decisiones y no constituyen modelos alternativos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: pese a la etiqueta text-classification y al nombre del modelo base, no genera texto ni mantiene conversaciones. Usarlo como chatbot o para tareas de NLP dara resultados sin sentido.
- Formato de entrada rigido: el estado debe generarse con `snake/encode.py` del repositorio del autor. Cualquier variacion en el formato degrada o invalida las predicciones.
- Sobreajuste a la distribucion del profesor: los datos de entrenamiento provienen exclusivamente de trayectorias del profesor BFS, de modo que el agente puede derivar hacia configuraciones de tablero nunca vistas y quedar atrapado.
- Alta varianza de resultados: el autor reporta puntuaciones por partida entre 46 y 143, con una media de 89,9. Una unica partida no es una medida fiable del modelo.
- Brecha notable frente al profesor: 89,9 de media frente a 200,5 del BFS, con un 77,7 % de coincidencia en las decisiones. La perdida de rendimiento es estructural al pasar de planificacion exacta a imitacion.
- Ambito reducido: no es un modelo de juego general. No hay evidencia de que funcione en otros juegos, en otros tamanos de tablero fuera del rango de entrenamiento (10 a 20 casillas de ancho) o con otras reglas.
- Sin datos sobre sesgos, robustez adversaria, comportamiento fuera de distribucion ni seguridad. No hay evaluaciones de ningun tipo mas alla de las 10 partidas publicadas.
- Sobreajuste a la evaluacion: la unica medida de rendimiento son 10 partidas; no se publican intervalos de confianza ni evaluacion cruzada.
- Licencia: Apache 2.0, heredada del modelo base, permite uso comercial y modificacion con atribucion. No obstante, el autor original de Laya es Convai Innovations y el credito debe mantenerse.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones. Los metadatos del repositorio indican fechas de septiembre de 2026, posteriores a la fecha actual, lo que conviene verificar antes de citar el modelo.
- El runtime `laya` es especifico del ecosistema del modelo base; no hay garantia de compatibilidad con `transformers` estandar ni de soporte a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OwaisAli10/laya-snake
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Codigo, UI del juego y pipeline de entrenamiento: https://github.com/Okbatti/SnakeGame_Laya
- Implementacion de Snake en tiempo real con el motor de decisiones de Laya: https://github.com/ArjunSonara/laya-snake-ai
- Runtime MLX nativo para modelos de decision tipados de Laya: https://github.com/mizorewww/laya-mlx
- Sitio oficial del proyecto Laya (Convai Innovations): https://laya.convaiinnovations.com/
- Articulo sobre laya-mlx y el rendimiento en Apple Silicon: https://pasqualepillitteri.it/en/news/17538/laya-mlx-jev-apple-silicon
