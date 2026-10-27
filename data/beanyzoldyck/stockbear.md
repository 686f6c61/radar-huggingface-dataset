# beanyzoldyck/stockbear

## Resumen

StockBear es una red neuronal feed-forward de 9.865 parámetros publicada por el usuario beanyzoldyck (BeanyZoldyck) como checkpoint educativo dentro del proyecto de fin de curso «StockBear / Chess» (otoño de 2024, con memoria fechada el 30 de junio de 2025). El modelo no es un modelo de lenguaje ni un transformer: es un perceptrón multicapa que recibe 65 características enteras que codifican un tablero de ajedrez (64 casillas en orden a8→h1 más un indicador de turno) y devuelve una única puntuación escalar, entrenada por regresión supervisada para imitar las evaluaciones de Stockfish dentro de un juego de ajedrez escrito a mano en C++ con openFrameworks.

La arquitectura es 65 → 100 (ReLU) → 32 (ReLU) → 1, implementada originalmente con arrays, bucles explícitos de forward pass y actualizaciones de gradiente escritas a mano, sin framework de machine learning. Esta publicación convierte los parámetros archivados en `stockbear.h` a float32 en formato safetensors (39.460 bytes de payload) y añade un módulo PyTorch mínimo (`stockbear.py`) para poder cargar y ejecutar la red en herramientas modernas.

Su relevancia práctica es limitada y el propio autor la enmarca como educativa e histórica: no hay resultados de fuerza de juego ni de precisión de evaluación medidos, el código de entrenamiento conserva defectos de corrección documentados y la conversión no demuestra que el entrenamiento original funcionase. Su interés real está como pieza de estudio de imitación de motores, representación de entradas y retropropagación manual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) feed-forward: Linear(65,100) → ReLU → Linear(100,32) → ReLU → Linear(32,1). Sin atención, sin embedding, sin tokenizador, sin estado recurrente |
| Parámetros totales | 9.865 (fc1: 6.600; fc2: 3.232; fc3: 33) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: entrada fija de 65 características float32 (`[65]` o `[batch, 65]`), sin ventana de contexto |
| Tipos de cuantización | No disponible. Solo se publican pesos en float32; no se distribuyen versiones cuantizadas |
| Idiomas soportados | No aplica: no procesa lenguaje natural |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (float32), payload de 39.460 bytes (≈38,5 KiB) sin metadatos; requiere el módulo `stockbear.py` (PyTorch), no es un `AutoModel` de Transformers |
| Entrada | 65 características: 64 casillas (códigos enteros de pieza) + 1 indicador de turno |
| Codificación de piezas | Vacío = 0; negro: peón 9, caballo 10, alfil 11, torre 12, dama 13, rey 14; blanco: peón 17, caballo 18, alfil 19, torre 20, dama 21, rey 22 |
| Orden de casillas | Aplanado por filas desde a8-h8, luego a7-h7, hasta h1 |
| Salida | Escalar sin acotar (`[1]` o `[batch, 1]`) en unidades sin confirmar; el loader devuelve puntuaciones crudas, no centipeones ni probabilidades |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Librería | pytorch |

## Arquitectura y entrenamiento

La red es un MLP de tres capas lineales con ReLU en ambas capas ocultas y salida lineal, pensado para aproximar la evaluación de Stockfish sobre una posición estática. La primera capa expande 65 entradas a 100 unidades, la segunda las comprime a 32 y la tercera produce un escalar. El diseño original se implementó en C++ con arrays y gradientes calculados a mano, sin PyTorch ni otro framework; esta publicación solo aporta la conversión de pesos y un envoltorio de inferencia. No hay cabeza de política, búsqueda en árbol, minimax ni Monte Carlo tree search asociados al modelo: el código de ajedrez que lo rodea genera movimientos candidatos, evalúa los tableros resultantes y selecciona el movimiento de menor puntuación para las negras (selección de una jugada de profundidad 1).

El entrenamiento es, conceptualmente, regresión supervisada sobre evaluaciones de un motor, similar a una imitación profesor-alumno, y no un fine-tune de pesos de Stockfish ni una reproducción de su arquitectura. La información disponible sobre el procedimiento se corta en la model card (el apartado de datos y procedimiento de entrenamiento aparece truncado), por lo que no se dispone del número de posiciones del conjunto de entrenamiento, la composición del dataset, la función de pérdida exacta ni si hubo etapas de ajuste tipo RLHF/DPO (no aplicables en este dominio). El autor advierte explícitamente que el código de entrenamiento superviviente contiene defectos de corrección y que la publicación no establece que el entrenamiento original tuviese éxito.

## Capacidades

- Evaluación estática de posiciones de ajedrez: dada una codificación de 65 características, devuelve una puntuación escalar cruda.
- Inferencia por lotes: acepta tensores `[batch, 65]` y devuelve `[batch, 1]`.
- Codificación desde FEN mediante el helper `encode_fen`, con modo `legacy_game=True` que reproduce el comportamiento del juego original (turno siempre a 0) y un modo por defecto que usa el turno real del FEN.
- Ejecución en CPU: no requiere GPU ni librerías de aceleración más allá de PyTorch.
- Integración con código de ajedrez externo: el modelo puntúa tableros, pero no genera movimientos legales ni realiza búsqueda; esa lógica debe aportarla el entorno.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No tiene capacidades multilingües, de visión, audio ni modo «thinking».
- No procesa texto: no hay tokenizador, chat template ni interfaz conversacional.

## Casos de uso

- Material docente sobre retropropagación manual: el proyecto original implementa forward pass y actualización de gradientes con arrays y bucles explícitos, por lo que sirve como ejemplo mínimo (9.865 parámetros) para explicar descenso de gradiente sin framework, comparándolo con la versión PyTorch publicada.
- Estudio de representación de entradas en ajedrez: el autor señala la codificación entera de piezas como debilidad y propone one-hot; el checkpoint permite montar una ablación entre codificación entera y one-hot manteniendo el resto de la arquitectura.
- Pruebas de integración en un motor de ajedrez didáctico en C++/openFrameworks: puede actuar como oponente de juguete para validar selección de movimientos, detección de jaques y condiciones de fin de partida, sustituyendo a un motor externo fuera de alcance.
- Baseline de imitación de motores: sirve como referencia de baja capacidad en experimentos de destilación de evaluaciones de Stockfish, para medir cuánta precisión se gana al aumentar anchura, profundidad o features.
- Validación de pipelines de publicación de safetensors: el repositorio es un caso reducido (39.460 bytes de payload) para probar flujos de `snapshot_download`, carga con `from_pretrained` desde directorio local y verificación de formas de tensores.
- Test unitario de utilidades de ajedrez: el helper `encode_fen` permite comprobar el orden de casillas a8→h1 y los códigos de pieza en tests automatizados de parseo de FEN, incluida la comprobación de sintaxis (no de legalidad) de la posición.
- Demostración de inferencia en entornos sin GPU: al caber holgadamente en cualquier CPU, puede ejecutarse en contenedores ligeros, CI o dispositivos embebidos como ejemplo de modelo entrenado desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la fuerza de juego y la precisión de la evaluación no están medidas, y que las unidades, la convención de signo y cualquier transformación de puntuaciones de mate no han sido confirmadas.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; los pesos ocupan 39.460 bytes en float32 (menos de 1 MB incluso con buffers intermedios).
- GPU recomendadas: ninguna en particular; cualquier GPU consumer (por ejemplo, serie GTX 1050 en adelante o RTX 4090) ejecuta la red sin aprovecharse de ello, ya que el cuello de botella no está en el cálculo.
- Cabe en CPU y en cualquier GPU consumer: sí, de forma holgada; la model card afirma que la inferencia en CPU es suficiente para este tamaño.
- Opciones de despliegue: PyTorch estándar con el módulo `stockbear.py` incluido (`StockBear.from_pretrained` acepta un directorio local). vLLM, llama.cpp, TGI y Ollama no aplican, al no tratarse de un modelo de lenguaje. No se documenta exportación a ONNX ni TorchScript.
- Alojamiento en el Hub: la publicación de los ficheros no proporciona endpoint de inferencia hospedado ni widget de ajedrez.
- Latencia y throughput: no hay mediciones publicadas. Por el tamaño (tres productos matriciales con 9.865 parámetros) se espera un coste por posición del orden de microsegundos en CPU, pero es una estimación no verificada por el autor.

## Comparativa con modelos similares

No se dispone de cifras verificables de parámetros o rendimiento de las alternativas en la información proporcionada; la comparación es cualitativa.

| Modelo | Tipo | Parámetros | Entrada / contexto | Búsqueda | Fuerza de juego medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| StockBear | MLP de 3 capas, regresión sobre evaluación de motor | 9.865 | 65 características fijas (sin contexto) | No (el juego usa selección a 1 jugada) | No medida | CC-BY-4.0 | Hugging Face, safetensors + PyTorch, 0 descargas |
| Stockfish (evaluador NNUE) | Motor con red NNUE + búsqueda alfa-beta | No disponible en la información | No disponible | Sí | No disponible en la información | GPL-3.0 | Distribución como motor de escritorio; no como checkpoint safetensors en el Hub |
| Leela Chess Zero | Motor neuronal con búsqueda MCTS | No disponible en la información | No disponible | Sí | No disponible en la información | GPL-3.0 | Distribución como motor y pesos de red; no como safetensors en el Hub |
| Maia Chess | Redes orientadas a imitar juego humano | No disponible en la información | No disponible | Configurable | No disponible en la información | No disponible en la información | Pesos publicados por el proyecto; no verificados aquí |

## Limitaciones y advertencias

- Estado del checkpoint: el autor lo describe como educativo e histórico; no hay evidencia de que el entrenamiento original convergiese, y el código de entrenamiento superviviente contiene defectos de corrección declarados.
- Ausencia total de métricas: no se han publicado benchmarks de precisión de evaluación ni de fuerza de juego, por lo que no debe asumirse ninguna calidad predictiva.
- Salida no interpretable: se desconoce la unidad de las etiquetas, la convención de signo y cualquier transformación de puntuaciones de mate; el loader devuelve puntuaciones crudas y no deben presentarse como centipeones, ventaja de peón ni probabilidad de victoria.
- Representación de entrada deficiente: codificación entera de piezas sin normalización ni one-hot, lo que el propio autor identifica como debilidad; se pierde la relación ordinal y de escala entre piezas.
- Información ausente del estado de la posición: no se codifican derechos de enroque, objetivo de alfil en passant, reloj de medios movimientos, número de jugada ni historial de repeticiones; posiciones que solo difieren en esos campos son indistinguibles para la red.
- Fallo conocido en la característica de turno: `appraiseAI` del juego original suministra siempre 0, de modo que la red no distingue realmente quién mueve en el flujo histórico; `legacy_game=True` replica ese comportamiento y el modo por defecto aplica la semántica prevista, pero ninguno reproduce las entradas sin inicializar del parser de entrenamiento histórico.
- Sin generación de movimientos ni búsqueda: el modelo solo puntúa tableros; cualquier uso como «motor» exige lógica externa de generación y selección de jugadas.
- Riesgo de resultados sin sentido: al no haber validación publicada, es esperable que las puntuaciones sean degeneradas o arbitrarias; no debe usarse para decisiones reales sobre partidas.
- Validación de FEN limitada: el helper comprueba sintaxis de características, no si la posición es legalmente alcanzable.
- Sesgos: no se documentan sesgos sociales (no hay datos humanos ni lenguaje), pero sí un sesgo de dominio claro: el modelo solo es válido para el subconjunto de posiciones y la convención con la que se entrenó, desconocido en detalle.
- Licencia: CC-BY-4.0 permite uso comercial con atribución, pero se distribuye sin garantías; al integrar código de ajedrez de terceros (por ejemplo, motores GPL) hay que revisar la compatibilidad de licencias del conjunto.
- Producción: no apto para uso en producción como evaluador; si se reutiliza, conviene aislarlo como dependencia de juguete y fijar la versión de los ficheros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beanyzoldyck/stockbear
- Memoria del proyecto «Final Project: StockBear / Chess» (30 de junio de 2025): citada en la model card, sin URL disponible en la información proporcionada.
- Repositorio de código, paper, blog o demo adicionales: no disponible en la información proporcionada.
