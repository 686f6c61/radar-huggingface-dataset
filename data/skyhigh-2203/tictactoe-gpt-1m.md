# Skyhigh-2203/tictactoe-gpt-1m

## Resumen

El modelo `Skyhigh-2203/tictactoe-gpt-1m` es un transformer ligero de estilo GPT con aproximadamente 1,59 millones de parámetros, desarrollado por el usuario Skyhigh-2203 y publicado en Hugging Face. Su propósito es jugar al tres en raya (tic-tac-toe) de forma óptima e imbatible, empleando aprendizaje por refuerzo. A diferencia de los grandes modelos de lenguaje, este es un modelo especializado y de propósito único, diseñado para maximizar la eficiencia en una tarea concreta.

La relevancia de este modelo radica en su extremada ligereza y velocidad: es capaz de procesar más de 17 000 partidas por segundo en una GPU de portátil, con una latencia por posición inferior a 0,02 milisegundos. Su arquitectura consta de 2 bloques transformer, una dimensión oculta de 256 y 8 cabezas de atención, lo que lo convierte en un ejemplo interesante de cómo un modelo pequeño puede alcanzar un rendimiento perfecto en un dominio acotado. El contexto de entrada es fijo y muy reducido (11 tokens), lo que simplifica su integración en sistemas embebidos o aplicaciones en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (estilo GPT) |
| Parametros totales | 1 588 992 (~1,6 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 11 tokens (fijo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (tokenizacion numerica, sin lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint `best.pt`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer estándar con 2 bloques, dimensión oculta de 256 y 8 cabezas de atención. La entrada se tokeniza en una secuencia de 11 tokens: un token de turno (0 para X, 1 para O), nueve tokens que representan las celdas del tablero (4 vacio, 5 X, 6 O) y un token de prediccion auxiliar. La salida son logits sobre las posiciones 8 a 16, que se mapean a las celdas 0 a 8. El modelo se entrena mediante aprendizaje por refuerzo, aunque no se especifican los detalles del algoritmo, el numero de episodios ni la composicion del dataset de entrenamiento. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Juego optimo e imbatible de tres en raya: el modelo nunca pierde y siempre empata contra un oponente perfecto (minimax).
- Cumplimiento estricto de las reglas: el 100 % de los movimientos generados son legales.
- Alta precision en la validacion: superior al 97 % de exactitud sobre el conjunto de validacion.
- Inferencia extremadamente rapida: 17 943 partidas por segundo en una GPU RTX 4060 Laptop, con una latencia media de 0,0124 ms por posicion.
- No posee capacidades de generacion de texto, razonamiento general, codigo, vision ni tool calling. Es un modelo de proposito unico.

## Casos de uso

- Demostracion educativa de aprendizaje por refuerzo: el modelo sirve como ejemplo didactico de como un transformer pequeno puede aprender una politica optima en un entorno discreto y acotado, util para cursos de IA o talleres de RL.
- Benchmark de eficiencia en inferencia: su velocidad y bajo consumo permiten utilizarlo como punto de referencia para medir el rendimiento de motores de inferencia (vLLM, llama.cpp, etc.) en tareas de baja latencia.
- Componente de un motor de juego: puede integrarse en aplicaciones de tres en raya (web, movil o escritorio) como oponente invencible, sin necesidad de un servidor potente.
- Validacion de tecnicas de cuantizacion o compresion: al ser un modelo muy pequeno, es un candidato ideal para probar metodos de poda, cuantizacion o destilacion en un entorno controlado.
- Generacion de datos sinteticos de partidas: el modelo puede usarse para generar millones de partidas optimas que sirvan como dataset para entrenar otros modelos o para analisis estadisticos de estrategias.
- Prueba de concepto de despliegue en hardware embebido: su tamano reducido (checkpoint de ~19 MB) permite ejecutarlo en dispositivos con recursos limitados, como Raspberry Pi o microcontroladores con soporte de PyTorch.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados, obtenidos en una NVIDIA GeForce RTX 4060 Laptop GPU:

| Metrica | Valor |
|---|---|
| Partidas totales jugadas | 10 027 008 |
| Throughput | 17 943 partidas/segundo |
| Latencia por posicion | 0,0124 ms |
| Utilizacion de GPU | 99,9 % |
| Resultado como X (5 013 504 partidas) | 0 victorias, 5 013 504 empates (100 %), 0 derrotas |
| Resultado como O (5 013 504 partidas) | 0 victorias, 5 013 504 empates (100 %), 0 derrotas |
| Tasa de movimientos legales | 100 % |
| Precision en validacion | > 97 % |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa ~19,1 MB, por lo que la inferencia en un solo lote cabe en cualquier GPU con mas de 1 GB de VRAM. Con lotes grandes, la memoria escalara segun el tamano del batch.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de entrada como la RTX 4060 Laptop (usada en las pruebas) o incluso CPUs, dado el tamano del modelo.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) y tambien en iGPUs.
- Opciones de despliegue: al ser un modelo PyTorch, puede ejecutarse con cualquier framework que soporte PyTorch (por ejemplo, TorchServe, o directamente en Python). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, aunque al ser un transformer estandar podria adaptarse.
- Latencia y throughput: 0,0124 ms por posicion y 17 943 partidas/segundo en la GPU de referencia, lo que indica un rendimiento en tiempo real muy holgado.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (transformers pequenos especializados en juegos de tablero). La model card no incluye comparaciones con otras implementaciones de bots de tres en raya, por lo que esta seccion queda como no disponible.

## Limitaciones y advertencias

- El modelo esta estrictamente limitado al juego del tres en raya; no puede procesar lenguaje natural ni realizar ninguna otra tarea.
- No se especifican los detalles del entrenamiento (algoritmo de RL, dataset, hiperparametros), lo que dificulta la reproducibilidad completa.
- La precision de validacion (> 97 %) no es del 100 %, aunque en la practica el modelo nunca pierde contra minimax; podria haber casos extremos no cubiertos.
- La tokenizacion es numerica y fija; cualquier cambio en el formato de entrada (por ejemplo, tableros de mayor tamano) invalidaria el modelo.
- La licencia MIT permite uso comercial, pero al ser un modelo de proposito unico, su valor comercial es limitado.
- No se proporcionan garantias de rendimiento en hardware distinto al utilizado en las pruebas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Skyhigh-2203/tictactoe-gpt-1m
- Perfil del autor en Hugging Face: https://huggingface.co/Skyhigh-2203/models
- Repositorio relacionado (no oficial): https://github.com/natedoesthings/TicTacToe-AIModel
- Repositorio relacionado (no oficial): https://github.com/iamalreadynoob/tictactoe-ai
