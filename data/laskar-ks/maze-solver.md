# laskar-ks/maze-solver

## Resumen

MazeNet es un modelo neuronal recurrente-convolucional de tama\u00f1o muy reducido (207.360 par\u00e1metros, menos de 1 MB en safetensors) desarrollado por el usuario laskar-ks y publicado en Hugging Face bajo licencia MIT. Su prop\u00f3sito es resolver laberintos representados como rejillas bidimensionales de tama\u00f1o arbitrario, devolviendo un camino v\u00e1lido desde la celda de inicio hasta la salida. No es un modelo de lenguaje: no genera texto ni procesa lenguaje natural, sino que opera sobre mapas codificados num\u00e9ricamente.

La arquitectura combina un codificador convolucional que lee el mapa completo con un n\u00facleo recurrente que aplica el mismo bloque convolucional de forma iterativa, propagando la informaci\u00f3n de direcci\u00f3n desde la salida hacia el resto de celdas transitables, de manera an\u00e1loga a la propagaci\u00f3n de un frente de onda. El n\u00famero de iteraciones puede aumentarse para mapas mayores, lo que convierte el coste computacional en un par\u00e1metro ajustable en tiempo de inferencia.

El inter\u00e9s del modelo es fundamentalmente did\u00e1ctico y de investigaci\u00f3n: demuestra que una red de apenas 200.000 par\u00e1metros puede aprender una pol\u00edtica de navegaci\u00f3n espacial sobre rejillas de tama\u00f1o variable, ejecutable en CPU, con un script CLI y un servidor HTTP incluidos. No se han publicado resultados de benchmarks ni datos sobre el conjunto de entrenamiento en la informaci\u00f3n disponible.

## Especificaciones t\u00e9cnicas

| Par\u00e1metro | Valor |
|---|---|
| Arquitectura | CNN recurrente (recurrent-cnn) con bloque convolucional compartido aplicado iterativamente |
| Par\u00e1metros totales | 207.360 |
| Par\u00e1metros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; acepta mapas de tama\u00f1o arbitrario con iteraciones ajustables |
| Tipos de cuantizaci\u00f3n | no disponible (pesos en safetensors, probablemente float32) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (con `config.json` y c\u00f3digo Python `maze_model.py`) |

## Arquitectura y entrenamiento

El modelo es una red neuronal recurrente sobre convoluciones (recurrent CNN) que procesa el mapa completo como una imagen de un solo canal con cuatro valores discretos: `1` para pared, `0` para camino libre, `2` para inicio y `3` para salida. Un codificador convolucional inicial transforma el mapa en un mapa de caracter\u00edsticas; a continuaci\u00f3n, un bloque convolucional compartido se aplica repetidamente, de modo que la se\u00f1al de \u00abdirecci\u00f3n hacia la salida\u00bb se propaga varias celdas por iteraci\u00f3n desde la salida hacia el resto del laberinto. La salida final es un campo de direcciones (flechas) en cada celda transitable, que un solver determinista recorre desde el inicio hasta la salida.

El n\u00famero de iteraciones es un hiperpar\u00e1metro de inferencia: mapas mayores requieren m\u00e1s iteraciones para que la informaci\u00f3n alcance todas las celdas. El solver detiene la propagaci\u00f3n autom\u00e1ticamente cuando el camino ya conecta inicio y salida, por lo que el coste se adapta a la dificultad. No se dispone de informaci\u00f3n sobre el volumen de datos de entrenamiento, la composici\u00f3n del dataset, el generador de laberintos usado durante el entrenamiento ni si se aplicaron t\u00e9cnicas de RLHF, DPO o refuerzo; la model card solo menciona que `maze_model.py` incluye un generador de laberintos junto con la arquitectura y el solver.

## Capacidades

- Resoluci\u00f3n de laberintos en rejilla de tama\u00f1o arbitrario, con codificaci\u00f3n fija de celdas (pared, camino, inicio, salida).
- Producci\u00f3n de un camino completo en formato de lista de coordenadas y cadena de movimientos (`moves`, p. ej. `"DDRR..."`).
- Salida JSON estructurada con metadatos: `solved`, `solved_by`, `iterations`, `corrections`, `steps`, `path` y `moves`.
- Modo de correcci\u00f3n: cuando dos rutas tienen longitudes casi id\u00e9nticas, el solver aplica peque\u00f1as correcciones y lo reporta en el campo `corrections` con `solved_by: "model_with_corrections"`.
- Fallback a BFS cl\u00e1sico cuando el modelo falla (`solved_by: "bfs_fallback"`), desactivable con `--no-fallback`.
- Ejecuci\u00f3n en CPU sin GPU, gracias al reducido tama\u00f1o del modelo.
- Interfaz CLI (`solve_maze.py`) y API HTTP pensada para despliegue en VPS.
- No soporta tool calling, agentes, multi-step reasoning en lenguaje natural, visi\u00f3n gen\u00e9rica, audio ni capacidades multiling\u00fces: su \u00fanico dominio es la navegaci\u00f3n en rejillas.

## Casos de uso

- **Ense\u00f1anza de aprendizaje profundo**: el modelo sirve como ejemplo autocontenido de CNN recurrente con menos de 1 MB de pesos, ideal para talleres donde se quiera mostrar propagaci\u00f3n iterativa de informaci\u00f3n espacial sin necesidad de GPU.
- **Prototipado r\u00e1pido de planificaci\u00f3n en rejillas**: para videojuegos o simuladores que usan mapas tile-based, el modelo puede generar un campo de direcciones que luego se recorre con un solver trivial, sustituyendo o complementando un A* en prototipos.
- **Demostraci\u00f3n de inferencia adaptativa**: el n\u00famero de iteraciones se ajusta al tama\u00f1o del mapa y se detiene al encontrar camino, lo que permite estudiar pol\u00edticas de \u00abpensar m\u00e1s tiempo en problemas m\u00e1s grandes\u00bb con un coste controlado.
- **Servicio HTTP ligero en VPS**: el script `solve_maze.py` expone una API HTTP que puede desplegarse en un servidor modesto para resolver laberintos enviados como JSON, sin dependencias de GPU ni frameworks de serving pesados.
- **Generaci\u00f3n de datos sint\u00e9ticos de navegaci\u00f3n**: combinado con el generador de laberintos incluido en `maze_model.py`, puede producir pares (mapa, camino) para entrenar o evaluar otros planificadores.
- **Investigaci\u00f3n en generalizaci\u00f3n de tama\u00f1o**: al aceptar mapas de cualquier dimensi\u00f3n, permite experimentar con la capacidad de una red convolucional recurrente para extrapolar a rejillas mayores que las vistas en entrenamiento.
- **Comparaci\u00f3n con algoritmos cl\u00e1sicos**: el fallback BFS incorporado facilita medir en qu\u00e9 porcentaje de casos el modelo acierta por s\u00ed solo frente a la soluci\u00f3n \u00f3ptima cl\u00e1sica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informaci\u00f3n disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo est\u00e1 pensado para ejecutarse en CPU (la model card indica expl\u00edcitamente `pip install torch --index-url https://download.pytorch.org/whl/cpu`).
- GPU recomendadas: no aplica; cualquier GPU compatible con PyTorch puede ejecutarlo, pero no es necesario.
- \u00bfCabe en GPU de consumo? S\u00ed, con holgura: 207.360 par\u00e1metros ocupan menos de 1 MB en float32.
- Opciones de despliegue: PyTorch en CPU, CLI `solve_maze.py` y API HTTP incluida en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informaci\u00f3n proporcionada; dependen del tama\u00f1o del mapa y del n\u00famero de iteraciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la informaci\u00f3n proporcionada modelos comparables de resoluci\u00f3n de laberintos con arquitectura recurrente-convolucional y par\u00e1metros publicados. Como referencia cualitativa, la alternativa cl\u00e1sica es el algoritmo BFS/A* determinista, que resuelve \u00f3ptimamente cualquier laberinto sin entrenamiento, mientras que MazeNet ofrece una pol\u00edtica aprendida con posible fallback a BFS.

## Limitaciones y advertencias

- **Sesgos**: no disponibles; no se documenta la distribuci\u00f3n de laberintos usada en entrenamiento, por lo que se desconoce si el modelo est\u00e1 sesgado hacia ciertas topolog\u00edas (laberintos perfectos, sin bucles, etc.).
- **Riesgo de fallo**: el propio autor contempla el fallback a BFS, lo que indica que el modelo puede no encontrar camino en algunos mapas; el porcentaje de fallo no se publica.
- **Correcciones**: en casos de rutas casi id\u00f3nticas el solver aplica correcciones, de modo que la salida puede no ser puramente del modelo.
- **Formato de entrada r\u00edgido**: solo acepta mapas codificados con los valores `0`, `1`, `2` y `3`; no procesa im\u00e1genes, texto ni otros formatos sin preprocesado.
- **Sin capacidades de lenguaje**: no es un modelo de prop\u00f3sito general; no debe evaluarse con benchmarks de NLP.
- **Licencia**: MIT, permite uso comercial y modificaci\u00f3n con atribuci\u00f3n; no se documentan restricciones adicionales.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo d\u00eda (2026-11-10); no hay evidencia de validaci\u00f3n externa ni de mantenimiento continuado.
- **Documentaci\u00f3n**: la model card est\u00e1 en indonesio y no detalla hiperpar\u00e1metros de entrenamiento, dataset ni m\u00e9tricas, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/laskar-ks/maze-solver
- Repositorio de pesos y c\u00f3digo: incluido en el propio repositorio de Hugging Face (`model.safetensors`, `config.json`, `maze_model.py`, `solve_maze.py`)
- Paper, blog, demo o repositorio adicional: no disponibles en la informaci\u00f3n proporcionada
