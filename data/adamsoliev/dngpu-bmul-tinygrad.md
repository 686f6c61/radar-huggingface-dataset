# adamsoliev/dngpu-bmul-tinygrad

## Resumen

`adamsoliev/dngpu-bmul-tinygrad` es un conjunto de 15 puntos de control (checkpoints) entrenados que reproducen la Figura 3 del artículo «Improving the Neural GPU Architecture for Algorithm Learning» (Freivalds y Liepins, arXiv 1702.08727), mediante una reimplementación en tinygrad del código original en TensorFlow 1.0. No es un modelo de lenguaje: es un artefacto de investigación que aprende a multiplicar números binarios con una Neural GPU diagonal (DNGPU), un modelo recurrente con un único conjunto de pesos que se aplica tantas veces como símbolos tiene la entrada.

El modelo tiene 84.867 parámetros (9m² + 20m + 3 con m = 96 canales) y se entrena con entradas de longitud máxima 41 —operandos de hasta 20 bits— para evaluarse con longitud 401, es decir, operandos de 200 bits: la prueba mide generalización a entradas diez veces más largas que cualquiera vista durante el entrenamiento.

Su interés es de reproducibilidad y de evaluación de backends: incluye 10 semillas con el inicializador `glorot_uniform` y 5 con `uniform_unit_scaling` de TF 0.12, con registros de evaluación cada 200 pasos y curvas comparadas contra la Figura 3 digitalizada del artículo. El mejor checkpoint (`glorot/seed1.npz`) falla en solo 7 de los 1024 productos de longitud 401.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Neural GPU diagonal (DNGPU): celda DCGRU convolucional con un único conjunto de pesos aplicado L veces para una entrada de longitud L |
| Parámetros totales | 84.867 (9m² + 20m + 3 con m = 96 mapas) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Variable según la entrada; entrenamiento con L ≤ 41 (operandos de hasta 20 bits), evaluación con L = 401 (operandos de 200 bits) |
| Tipos de cuantización | No disponible; los checkpoints almacenan parámetros en formato `.npz` (NumPy), sin variantes cuantizadas publicadas |
| Idiomas soportados | No aplica: la entrada es una secuencia de símbolos binarios (bit 1, bit 2, separador 12), no texto natural |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy, cargable con `allow_pickle=False`); incluye `param/<nombre>`, estados de AdaMax `m/<nombre>` y `v/<nombre>`, estado del generador de datos y de RNG, y un blob JSON `host_json` almacenado como `uint8` |
| Número de checkpoints | 15: `glorot/seed0..9.npz` y `tf012/seed0..4.npz` |
| Optimizador | AdaMax |
| Pasos de entrenamiento | 5000, con evaluación cada 200 pasos; cada checkpoint es el estado tras la evaluación del paso 5000, no el mejor de su ejecución |
| Librería | tinygrad (evaluación probada con tinygrad 0.14.0, Python 3.14 y NumPy) |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Pipeline de HuggingFace | No disponible |
| Fecha de creación / actualización | 2026-10-20 / 2026-10-20 |

## Arquitectura y entrenamiento

La DNGPU procesa la entrada como una secuencia de símbolos (bits de *a*, separador, bits de *b*, en little-endian). Una capa de embedding proyecta cada posición a m = 96 canales y, a continuación, una única celda DCGRU con un solo conjunto de pesos se aplica L veces para una entrada de longitud L, de modo que el número de pasos de cómputo crece con la longitud. La DCGRU es una GRU convolucional cuya ruta de memoria es un desplazamiento depthwise fijo: un tercio de los canales permanece en su posición y los otros dos tercios se desplazan una posición en cada dirección. Las no linealidades son hard tanh y hard sigmoid, y una convolución 1×1 final proyecta tres clases por posición (pad, bit 0, bit 1), que constituyen los bits del producto.

El port sigue línea por línea el código oficial en TF 1.0 (`LUMII-Syslab/DNGPU@ecc94f7`) con `task = "bmul"` y m = 96. No hay RLHF, DPO ni ajuste por instrucciones: el entrenamiento es supervisado sobre datos generados por un generador con semilla cuyo digest identifica el conjunto de entrenamiento y de prueba de cada ejecución. La diferencia entre los dos grupos de checkpoints es solo el inicializador: `glorot_uniform` (el que usa el código upstream final) frente a `uniform_unit_scaling` de TF 0.12, que cambia únicamente los límites del kernel de entrada y de salida. Las innovaciones destacables son la reutilización de pesos a lo largo de los pasos (computación iterativa aprendida) y la generalización en longitud: entrenar con 41 símbolos y evaluar con 401.

## Capacidades

- Multiplicación de números binarios: genera el producto como una secuencia de bits a partir de dos operandos en little-endian.
- Generalización en longitud: entrena con operandos de hasta 20 bits y evalúa con operandos de 200 bits (longitud 401), sin reentrenamiento.
- Cómputo iterativo de profundidad variable: el número de aplicaciones de la celda DCGRU es igual a la longitud de la entrada.
- Precisión a nivel de bit: el mejor checkpoint alcanza 99,998 % de bits correctos sobre las 1024 pruebas de longitud 401 y 100,00 % en la métrica upstream de 32 ejemplos.
- Ejecución en CPU: el script `evaluate.py` funciona con el backend CPU de tinygrad (un solo núcleo).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües: no procesa texto natural en ningún idioma.
- No tiene visión, audio, ni modo «thinking».
- No incluye tokenizador de texto ni plantillas de chat.

## Casos de uso

- Reproducción de resultados académicos: ejecutar `evaluate.py` sobre las 10 semillas `glorot` y las 5 `tf012` para reconstruir las curvas de la Figura 3 del artículo y contrastarlas con la versión digitalizada que incluye el repositorio.
- Estudio de generalización en longitud: el modelo es un banco de pruebas controlado (85k parámetros, datos sintéticos deterministas) para medir hasta qué punto un modelo recurrente entrenado con 41 posiciones mantiene precisión a 401.
- Prueba de compiladores y backends: el grafo desenrollado de 401 pasos es una carga exigente para tinygrad; los ficheros `extras/time0.log` (40 pasos) y `extras/prof0.log` (6 pasos con salida de depuración por kernel) permiten comparar tiempos de compilación y ejecución entre backends.
- Investigación sobre inicializadores: las 15 semillas con dos inicializadores distintos permiten analizar la varianza entre ejecuciones y la deriva tardía del entrenamiento (las semillas `glorot` 2 y 5 y `tf012` 0 y 3 se guardan en su estado derivado).
- Verificación de multiplicadores binarios: la opción `--multiply 12345 6789` imprime el producto según el modelo, útil como contraste aproximado de multiplicadores hardware o software (no exacto: ningún checkpoint acierta en los 1024 casos).
- Docencia en aprendizaje de algoritmos: ejemplo mínimo y ejecutable en CPU de computación iterativa aprendida, con código, registros y métricas publicados.
- Reutilización del andamiaje para otros `task` del repositorio upstream: el formato de checkpoint (parámetros, estados de AdaMax, estado de RNG y configuración en `host_json`) sirve de base para portar otras tareas del paper, aunque este repositorio solo incluye `bmul`.

## Benchmarks y rendimiento

La precisión de bit es la proporción de bits de salida correctos sobre las 401 posiciones. «upstream-32» es la métrica del código original (32 ejemplos de longitud 401 extraídos por su contador en cada evaluación); «1024» es el conjunto completo de 1024 ejemplos de prueba de la ejecución.

| Checkpoint | upstream-32 en paso 800 (%) | primer exacto en upstream-32 | upstream-32 en paso 5000 (%) | 1024 en paso 5000 (%) | erróneos de 1024 en paso 5000 | mínimo de erróneos de 1024 |
|---|---|---|---|---|---|---|
| glorot/seed0.npz | 62,5 | 3200 | 98,19 | 99,155 | 40 | 20 en 3800 |
| glorot/seed1.npz | 82,3 | 2200 | 100,00 | 99,998 | 7 | 7 en 5000 |
| glorot/seed2.npz | 54,1 | 3600 | 88,44 | 87,703 | 432 | 20 en 3800 |
| glorot/seed3.npz | 56,2 | 3400 | 99,99 | 99,425 | 36 | 17 en 4400 |
| glorot/seed4.npz | 57,2 | 4000 | 99,98 | 99,994 | 10 | 9 en 4800 |
| glorot/seed5.npz | 61,4 | nunca | 93,59 | 93,798 | 327 | 26 en 3600 |
| glorot/seed6.npz | 56,4 | 4000 | 98,05 | 97,197 | 113 | 34 en 4600 |
| glorot/seed7.npz | 54,8 | 3800 | 99,88 | 99,765 | 451 | 22 en 3800 |
| glorot/seed8.npz | 58,8 | 2600 | 99,65 | 99,382 | 425 | 22 en 4800 |
| glorot/seed9.npz | 57,3 | 3000 | 99,47 | 99,768 | 43 | 22 en 4400 |
| tf012/seed0.npz | 72,6 | 3400 | 95,72 | 96,531 | 261 | 28 en 3400 |
| tf012/seed1.npz | 67,3 | 3400 | 99,96 | 99,721 | 27 | 15 en 4200 |
| tf012/seed2.npz | 54,1 | 2800 | 99,98 | 99,983 | 38 | 13 en 4200 |
| tf012/seed3.npz | 60,8 | 2800 | 95,04 | 96,414 | 130 | 21 en 3000 |
| tf012/seed4.npz | 57,4 | 3200 | 100,00 | 99,975 | 29 | 13 en 3600 |

Datos adicionales aportados por el autor: el mejor modelo individual es `glorot/seed1.npz` (7 de 1024 productos con al menos un bit erróneo); ningún checkpoint es exacto en los 1024 casos, lo que concuerda con la Figura 6 del artículo. Frente a la Figura 3 digitalizada, la media de 5 ejecuciones del paper cae dentro del rango mínimo-máximo de las 10 semillas de este port en todas las evaluaciones; la media de este port sube unos 50 a 100 pasos más tarde (60,1 % frente a 72,6 % en el paso 800) y queda unos 0,7 puntos por debajo a partir del paso 2600. El texto del artículo afirma un 99 % en torno al paso 800, pero su propia Figura 3 solo llega al 99 % cerca del paso 2000 y ninguna ejecución de este port alcanza el 99 % en el paso 800. Nótese la discrepancia entre métricas: `glorot/seed7.npz` marca 99,88 % en upstream-32 pero 451 productos erróneos de 1024, señal de que la métrica de 32 ejemplos es muy ruidosa.

## Requisitos de hardware

- Parámetros: 84.867; en fp32 ocupan aproximadamente 340 KB, por lo que la VRAM necesaria es despreciable.
- GPU recomendadas: no se publica ninguna recomendación; cualquier GPU consumer sirve y el modelo está pensado para ejecutarse en CPU.
- Cabe en cualquier GPU consumer y en CPU; el autor documenta explícitamente la ejecución en CPU con `DEV=CPU`.
- Coste real de cómputo: el grafo desenrollado de 401 pasos domina el tiempo; la primera llamada en CPU emplea aproximadamente un minuto en compilar el grafo.
- Despliegue: `evaluate.py` con `tinygrad==0.14.0`, Python 3.14, NumPy y `uv` (`DEV=CPU uv run --no-project --python 3.14 --with tinygrad==0.14.0 --with numpy python evaluate.py glorot/seed1.npz`). El backend CPU de tinygrad usa un solo núcleo.
- No es desplegable en vLLM, llama.cpp, Ollama ni TGI: no es un transformer, no tiene tokenizador de texto y sus pesos no están en safetensors ni GGUF.
- Latencia y throughput: no disponibles; la tarjeta solo documenta el tiempo de compilación y los registros de temporización (`extras/time0.log`, 40 pasos) y de perfilado (`extras/prof0.log`, 6 pasos), cuyos valores no se transcriben.

## Comparativa con modelos similares

| Modelo | Parámetros | Longitud de entrenamiento / prueba | Resultado publicado | Licencia | Formato |
|---|---|---|---|---|---|
| Este repositorio (DNGPU en tinygrad) | 84.867 con m = 96 | 41 / 401 | 60,1 % medio en paso 800; mejor checkpoint con 7 errores de 1024 en longitud 401 | MIT | `.npz` |
| DNGPU upstream en TF 1.0 (Freivalds y Liepins, arXiv 1702.08727) | Misma configuración con m = 96 (parámetros equivalentes según la tarjeta) | 41 / 401 | 72,6 % medio en paso 800 según la Figura 3 digitalizada; el texto afirma 99 % hacia el paso 800, pero su figura llega al 99 % cerca del paso 2000 | No disponible en la información proporcionada | Checkpoint de TF (no detallado) |
| Neural GPU original (Kaiser y Sutskever) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa solo es posible con el upstream del artículo, porque es el único con métricas en la información disponible; para el resto de alternativas de la familia Neural GPU no hay datos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Ámbito funcional mínimo: solo multiplica números binarios; no procesa lenguaje natural, código, imágenes ni audio, y no dispone de instrucciones ni de formato de chat.
- El modelo no es exacto: ningún checkpoint acierta en los 1024 productos de longitud 401 y el mejor comete 7 errores, por lo que no debe usarse como sustituto de una multiplicación exacta en producción.
- Checkpoints derivados: las semillas `glorot` 2 y 5 y `tf012` 0 y 3 se guardan en su estado derivado tras el paso 5000, con precisiones de 87,7 %, 93,8 %, 96,5 % y 96,4 % respectivamente; no representan el mejor momento de esas ejecuciones.
- No hay selección del mejor checkpoint: todos corresponden al estado tras la evaluación del paso 5000, lo que penaliza a las ejecuciones que decaen tarde.
- Dependencia de la reproducibilidad del generador de datos: `evaluate.py` regenera el conjunto de prueba a partir de la semilla y del estado de RNG almacenado, por lo que alterar ese estado o el generador invalida la comparación con las métricas publicadas.
- La métrica upstream-32 es muy ruidosa (32 ejemplos) y puede dar una imagen optimista, como muestra el caso de `glorot/seed7.npz`; conviene usar siempre la métrica de 1024.
- No hay datos publicados sobre sesgos, alucinación o robustez más allá de la precisión de bit; el dominio sintético hace que esas categorías no apliquen igual que en un modelo de lenguaje, pero tampoco están evaluadas.
- No se publican datos de cuantización, por lo que no hay una ruta documentada para reducir el coste de inferencia más allá del tamaño ya reducido del modelo.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el artefacto es un trabajo de reproducibilidad, no un componente listo para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adamsoliev/dngpu-bmul-tinygrad
- Artículo de referencia: https://arxiv.org/abs/1702.08727 (Freivalds y Liepins, «Improving the Neural GPU Architecture for Algorithm Learning»)
- Repositorio upstream en TensorFlow: https://github.com/LUMII-Syslab/DNGPU (commit `ecc94f7`)
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos tratan sobre TikTok, tipografías y un foro de ingeniería inversa, sin relación con este artefacto.
