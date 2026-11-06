# ftaz/chess-gpt-pgn-char

## Resumen

chess-gpt-pgn-char es un modelo GPT de 50,9 millones de parametros desarrollado por el usuario ftaz que juega al ajedrez prediciendo el siguiente token de una partida en notacion algebraica (PGN). No incorpora busqueda ni funcion de evaluacion: realiza un unico forward pass por jugada, lo que lo situa en la categoria de modelos de ajedrez puramente neuronales y autorregresivos. Forma parte de una familia de tres modelos entrenados de forma identica que solo difieren en el tokenizador: este es el modelo A, que tokeniza caracter a caracter sobre el texto PGN.

El modelo se entrena sobre 35 millones de partidas de Lichess (ritmo rapid o mas lento, todos los niveles) y alcanza una perdida de validacion por jugada de 1,564. Segun el write-up del autor, se le estima un Elo de 1.940 en la escala de Lichess, medido a partir de autopartidas puntuadas por Stockfish, con un 99,75 % de jugadas legales sobre partidas humanas no vistas y una perdida media de 56 centipeones.

Su relevancia es principalmente experimental y educativa: demuestra que un transformer decoder-only pequeno, con contexto de 1.024 tokens y vocabulario de 34 simbolos, puede aprender a generar partidas de ajedrez coherentes sin ningun modulo algoritmico de ajedrez. Es un punto de partida reproducible para investigar tokenizacion, escalado y evaluacion en dominios estructurados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (16 capas, 8 cabezas, anchura 512, embeddings atados) |
| Parametros totales | 50.924.544 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible (dominio restringido a notacion PGN de ajedrez) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` con arquitectura y tokenizador |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only con 16 capas, 8 cabezas de atencion, dimension de modelo 512 y embeddings atados entre entrada y salida. El tokenizador `pgn-char` mapea cada caracter del texto PGN (por ejemplo `1.e4 e5 2.Nf3`) a un token, con un vocabulario de solo 34 simbolos. El contexto maximo es de 1.024 tokens, suficiente para una partida completa en este formato compacto.

El entrenamiento utilizo 35 millones de partidas de Lichess del dataset `lichess/standard-chess-games`, con ritmo rapid o superior y todos los niveles de rating, cada partida vista una sola vez. Se realizaron 206.934 pasos sobre una unica GPU NVIDIA GB10. No se menciona en la informacion disponible el uso de RLHF, DPO ni ajuste por preferencias; el objetivo es modelado de lenguaje autorregresivo estandar sobre secuencias PGN. La innovacion principal es metodologica: comparar tres tokenizaciones (caracter, jugada UCI y casilla UCI) bajo un mismo pipeline de entrenamiento.

## Capacidades

- Generacion de partidas de ajedrez en notacion algebraica (PGN) token a token.
- Seleccion de jugada en un tablero dado mediante un unico forward pass, sin busqueda.
- Ranking de jugadas legales con probabilidades asociadas (funcion `rank_legal_moves` del repositorio).
- Alta tasa de legalidad: 99,75 % de jugadas legales sobre partidas humanas no vistas.
- Juego a nivel aproximado de club (Elo estimado 1.940 en escala Lichess).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso mas alla de la propia secuencia de la partida.
- No dispone de capacidades multilingues, de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Analisis de tokenizacion en dominios estructurados: sirve como referencia reproducible para comparar como afecta la granularidad del tokenizador (caracter frente a jugada frente a casilla) al rendimiento de un transformer pequeno.
- Motor de ajedrez ligero para entornos con recursos minimos: con 50,9 M de parametros y una sola pasada por jugada, puede ejecutarse en CPU y ofrecer respuestas inmediatas en aplicaciones donde no se requiere fuerza de gran maestro.
- Generacion de partidas sinteticas para aumento de datos: el modelo produce secuencias PGN legalmente validas en su mayoria, utiles para preentrenar otros modelos o para pruebas de pipelines de ajedrez.
- Educacion e investigacion: material didactico para explicar transformers, tokenizacion y evaluacion de modelos generativos en un dominio con reglas verificables.
- Benchmark de evaluacion de ajedrez neuronal: la combinacion de Elo estimado, legalidad y centipeones perdidos constituye una bateria de metricas reutilizable para comparar futuros modelos.
- Integracion en bots de ajedrez recreativos: mediante la clase `ModelPlayer` del repositorio se puede incorporar como oponente en aplicaciones de entrenamiento o entretenimiento con nivel controlado.
- Reproduccion de experimentos: el codigo publico y los pesos abiertos permiten replicar el entrenamiento y extenderlo a otros ritmos, datasets o arquitecturas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (media de las 11 ultimas instantaneas):

| Metrica | Modelo A (pgn-char) | Modelo B (uci-move) | Modelo C (uci-square) |
|---|---|---|---|
| Elo estimado (escala Lichess, autopartidas puntuadas por Stockfish) | 1.940 | 1.908 | 1.792 |
| Jugadas legales en partidas humanas no vistas | 99,75 % | 99,45 % | 99,71 % |
| Perdida media en centipeones | 56 | 58 | 61 |

Perdida de validacion por jugada del modelo A: 1,564. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,2 GB de pesos (50,9 M de parametros), mas overhead de activaciones y contexto; en la practica cabe en cualquier GPU consumer.
- En FP16/BF16: en torno a 0,1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; tambien funciona en CPU, como muestra el ejemplo de la model card con `device="cpu"`.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o Raspberry Pi con suficiente RAM.
- Opciones de despliegue: el repositorio oficial usa PyTorch con la clase `ModelPlayer`; al ser un transformer estandar con safetensors, es convertible a llama.cpp u Ollama, aunque no se documenta soporte oficial en la informacion disponible.
- Latencia y throughput: no disponibles de forma numerica; al ser un unico forward pass por jugada con contexto de 1.024 tokens y 50,9 M de parametros, la latencia esperada es de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Elo estimado | Licencia |
|---|---|---|---|---|---|
| chess-gpt-pgn-char (A) | 50,9 M | 1.024 | GPT decoder-only, tokenizacion por caracter PGN | 1.940 | MIT |
| chess-gpt-uci-move (B) | no disponible en la informacion | no disponible | GPT decoder-only, tokenizacion por jugada UCI | 1.908 | MIT |
| chess-gpt-uci-square (C) | no disponible en la informacion | no disponible | GPT decoder-only, tokenizacion por casilla UCI | 1.792 | MIT |

No se dispone en la informacion proporcionada de comparaciones con otros modelos de ajedrez neuronal de codigo abierto (por ejemplo, Maia, Leela Chess Zero o variantes tipo GPT sobre PGN), por lo que la comparativa se limita a los tres modelos de la misma familia.

## Limitaciones y advertencias

- El Elo de 1.940 es una estimacion derivada de autopartidas puntuadas por Stockfish, no de partidas con rating oficial; el rendimiento real en juego clasificado puede diferir.
- No incorpora busqueda ni evaluacion, por lo que comete errores tacticos que un motor clasico evitaria; la perdida media de 56 centipeones lo situa lejos de motores de club fuerte.
- El contexto esta limitado a 1.024 tokens, lo que restringe la longitud de partida manejable y el historial disponible.
- El vocabulario de 34 simbolos esta disenado exclusivamente para PGN; el modelo no es util fuera del dominio del ajedrez ni para texto general.
- No se documentan sesgos especificos, pero al entrenarse solo con partidas de Lichess de ritmo rapid o superior, puede reproducir sesgos de estilo y nivel de esa poblacion de jugadores.
- Riesgo de alucinacion en forma de jugadas ilegales, aunque la tasa medida es baja (0,25 % sobre partidas humanas no vistas); en posiciones atipicas o fuera de distribucion puede aumentar.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales conocidas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente del rendimiento declarado.
- No se especifican cuantizaciones oficiales ni soporte en herramientas de inferencia populares; el uso previsto es a traves del codigo del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ftaz/chess-gpt-pgn-char
- Modelo B (uci-move): https://huggingface.co/ftaz/chess-gpt-uci-move
- Modelo C (uci-square): https://huggingface.co/ftaz/chess-gpt-uci-square
- Write-up del autor: https://blog.wezn.dev/chess-gpt/
- Codigo fuente: https://github.com/wezn/chess-gpt
- Dataset de entrenamiento: https://huggingface.co/datasets/lichess/standard-chess-games
