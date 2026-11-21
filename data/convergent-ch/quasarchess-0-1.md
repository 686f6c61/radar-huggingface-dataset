# Convergent-ch/QuasarChess-0.1

## Resumen

QuasarChess 0.1 es un adaptador LoRA para ajedrez construido sobre el checkpoint cuantizado en 4 bits de Mistral-7B-v0.3 (`unsloth/mistral-7b-v0.3-bnb-4bit`). Lo desarrolla Convergent-ch y su funcionamiento no es el de un modelo de lenguaje que genera jugadas en texto, sino el de un motor de ajedrez que, en una unica pasada forward, puntua todas las jugadas legales de la posicion actual. El artefacto distribuido combina un adaptador LoRA de 851.968 parametros con una cabeza de movimiento personalizada de 1.127.553 parametros, y reutiliza los pesos de Mistral fijados en una revision concreta durante el juego.

El modelo resuelve el problema de seleccion de jugada en ajedrez mediante un enfoque de ranking de movimientos legales sobre un LLM congelado, en lugar de generacion autoregresiva de notacion algebraica. Su relevancia practica es limitada pero concreta: demuestra que un ajuste de 3 horas en una RTX 3060 Ti (8 GB de VRAM) sobre un modelo de 7B cuantizado puede mejorar sustancialmente la coincidencia con Stockfish en un conjunto de validacion, pasando de un 6,8 % a un 22,9 % de acierto en la primera eleccion.

La informacion publicada es escasa: no hay pipeline declarado, no hay licencia especificada, el repositorio ocupa 0,0 GB (los pesos se ofrecen como fichero Safetensors aparte) y no se han publicado resultados de benchmarks estandar. El unico rendimiento reportado es un enfrentamiento directo de 24 partidas contra Arkon-AoM 1.0 Maximum.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Mistral-7B-v0.3) con cabeza de movimiento personalizada |
| Parametros totales | 851.968 (LoRA) + 1.127.553 (cabeza de movimiento); pesos base de Mistral-7B no incluidos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Mistral-7B-v0.3, no declarada en la model card) |
| Tipos de cuantizacion | Base en 4 bits (bnb-4bit); los pesos del adaptador se distribuyen en Safetensors |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

QuasarChess 0.1 no es un modelo de lenguaje generativo para ajedrez, sino un cabezal de puntuacion de movimientos acoplado a Mistral-7B-v0.3. El adaptador LoRA (851.968 parametros) modula las representaciones del transformer base, y una cabeza de movimiento especifica (1.127.553 parametros) produce una puntuacion para cada jugada legal en la posicion actual en una sola pasada forward. Los pesos de Mistral permanecen congelados y se cargan desde la revision `cd23ad17d3fbbd4fce2ad35e61ae612e6052b4b5` del repositorio publico (unos 4,14 GB en la primera descarga).

El entrenamiento se realizo durante 3 horas en una RTX 3060 Ti y proceso 168.418 ejemplos extraidos de 153.274 posiciones distintas etiquetadas por Stockfish. No se documenta en la model card el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; la innovacion tecnica declarada es el esquema de puntuacion de todas las jugadas legales en un unico forward pass en lugar de generacion secuencial de notacion.

## Capacidades

- Puntuacion de todas las jugadas legales de una posicion de ajedrez en una sola pasada forward.
- Seleccion de jugada de ajedrez (motor de juego) sobre el checkpoint Mistral-7B-v0.3 en 4 bits.
- Consulta de posiciones individuales mediante FEN a traves de `quasarchess.py "<FEN>"`.
- Interfaz de tablero local en navegador (`http://127.0.0.1:8807/`) con el usuario jugando con blancas.
- Soporte de ejecucion en GPU consumer de 8 GB (probado en RTX 3060 Ti).
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue: solo ingles declarado; sin capacidades generales de lenguaje mas alla del uso como motor de ajedrez.

## Casos de uso

- Analisis de posiciones de ajedrez en local: dado un FEN, el modelo devuelve la puntuacion de cada jugada legal, lo que permite ordenar candidatas para estudio o entrenamiento, aprovechando la cabeza de movimiento entrenada sobre etiquetas de Stockfish.
- Motor de juego en prototipos y demos: el paquete `QuasarChess-0.1-play.zip` levanta un tablero web local en el puerto 8807, adecuado para demostraciones en una RTX 3060 Ti sin infraestructura adicional.
- Generacion de datos etiquetados de ajedrez: al puntuar todas las jugadas legales, puede usarse para preetiquetar posiciones antes de una revision con Stockfish, reduciendo el coste de anotacion en pipelines de datos.
- Investigacion sobre adaptadores LoRA en dominios estructurados: sirve como caso de estudio reproducible de ajuste de un LLM de 7B cuantizado para una tarea de ranking discreta con un presupuesto de 3 horas de GPU consumer.
- Evaluacion comparativa de motores: el formato de salida estructurado (puntuaciones por jugada) facilita la comparacion con otros motores en experimentos controlados de tiempo por jugada, como el enfrentamiento documentado a 0,5 s por movimiento.
- Integracion en herramientas de entrenamiento de ajedrez: la consulta por FEN permite incorporar el modelo como componente de analisis en aplicaciones de estudio de aperturas y tacticas, siempre con validacion adicional dado su nivel de juego limitado.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Coincidencia con la primera eleccion de Stockfish (512 posiciones de validacion) | 35 antes del ajuste, 117 despues (6,8 % a 22,9 %) |
| Enfrentamiento contra Arkon-AoM 1.0 Maximum (24 partidas, 0,5 s por jugada) | 1 victoria, 1 tablas, 22 derrotas |
| Nota sobre la victoria | Procedente de una perdida de tiempo de Arkon |
| Perdidas de tiempo de QuasarChess | 0 |
| Tiempo de entrenamiento | 3 horas en RTX 3060 Ti |
| Ejemplos de entrenamiento | 168.418, de 153.274 posiciones distintas etiquetadas por Stockfish |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,14 GB solo para los pesos base de Mistral-7B en 4 bits, mas el adaptador LoRA y la cabeza de movimiento; probado con exito en una RTX 3060 Ti de 8 GB.
- GPU recomendadas: ninguna recomendacion oficial mas alla de la RTX 3060 Ti utilizada en pruebas; tarjetas con 8 GB o mas de VRAM son el minimo razonable segun la configuracion probada.
- Cabe en GPU consumer: si, al menos en RTX 3060 Ti (8 GB); no se documentan pruebas en otras tarjetas.
- Opciones de despliegue: el paquete oficial `play.py` con PyTorch 2.3.1+cu121 y un entorno Python 3.10; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica el control de tiempo usado en el enfrentamiento (0,5 s por jugada) y que QuasarChess no perdio ninguna partida por tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuasarChess 0.1 | 851.968 (LoRA) + 1.127.553 (cabeza) sobre Mistral-7B | no disponible | 22,9 % de coincidencia con Stockfish; 1V-1E-22D contra Arkon-AoM 1.0 Maximum | no disponible | Hugging Face (adaptador Safetensors) |
| Arkon-AoM 1.0 Maximum | no disponible | no disponible | Ganador del enfrentamiento 24 partidas a 0,5 s por jugada | no disponible | referenciado en la model card |
| Mistral-7B-v0.3 (base) | 7,2 mil millones (aproximado, no declarado en la ficha) | no disponible | Base sin ajuste ajedrecistico | no disponible en esta ficha | Hugging Face / Unsloth (bnb-4bit) |

No se dispone de datos suficientes para comparar con otros motores de ajedrez neuronales de forma rigurosa.

## Limitaciones y advertencias

- Nivel de juego limitado: 1 victoria, 1 tablas y 22 derrotas en 24 partidas contra Arkon-AoM 1.0 Maximum, y la unica victoria fue por perdida de tiempo del rival.
- Precision moderada: solo el 22,9 % de coincidencia con la primera eleccion de Stockfish en validacion, lo que implica que la mayoria de jugadas no coinciden con el mejor movimiento del motor de referencia.
- Licencia no especificada: no hay licencia declarada, por lo que el uso comercial queda sin garantias juridicas claras.
- Dependencia de pesos externos: requiere descargar 4,14 GB desde el repositorio publico de Mistral en una revision concreta; si esa revision cambia o desaparece, el modelo deja de ser reproducible.
- Idioma: solo se declara ingles; no hay capacidades multilingues ni de lenguaje general documentadas.
- Sesgos y alucinacion: no documentados en la model card; al ser un modelo de puntuacion de movimientos, el riesgo principal es una evaluacion incorrecta de posiciones, no la generacion de texto libre.
- Contexto: la longitud de contexto no se declara en la ficha.
- Entrenamiento corto y dataset acotado: 3 horas y 153.274 posiciones etiquetadas por Stockfish, sin informacion sobre diversidad de aperturas, finales o estilos.
- Arte grafico de las piezas con licencia propia de Alexis Luengas, incluida bajo `pieces/`; su uso queda sujeto a esa licencia separada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/QuasarChess-0.1
- Paquete de juego: https://huggingface.co/Convergent-ch/QuasarChess-0.1/resolve/main/QuasarChess-0.1-play.zip
- Pesos entrenados (LoRA y cabeza de movimiento): https://huggingface.co/Convergent-ch/QuasarChess-0.1/blob/main/quasarchess-0.1.safetensors
- Informe de duelo y validacion (aleman): https://huggingface.co/Convergent-ch/QuasarChess-0.1/blob/main/Ergebnis.md
- Partidas en PGN: https://huggingface.co/Convergent-ch/QuasarChess-0.1/blob/main/match.pgn
- Movimientos, tiempos y hashes de checkpoint: https://huggingface.co/Convergent-ch/QuasarChess-0.1/blob/main/match.json
- Metricas de entrenamiento y validacion: https://huggingface.co/Convergent-ch/QuasarChess-0.1/blob/main/training.json
- Modelo base: https://huggingface.co/unsloth/mistral-7b-v0.3-bnb-4bit
