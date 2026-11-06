# jromanghf/gaiachess-networks

## Resumen

GaiaChess Networks es un repositorio de pesos de redes neuronales del tipo NNUE (Efficiently Updatable Neural Network) para el motor de ajedrez UCI GaiaChess, desarrollado por jromanghf. No se trata de un modelo de lenguaje, sino de un conjunto de evaluadores posicionales que el motor utiliza para estimar la ventaja de una posición de ajedrez durante la búsqueda. El repositorio alberga tres generaciones de arquitectura incompatibles entre sí (T1, T2b y T7), cada una con su propio formato binario y su propio motor compatible.

Cada red incluye un pie de integridad de 16 bytes con el hash de arquitectura y el hash de contenido, de modo que el motor rechaza explícitamente cualquier fichero que no corresponda a la arquitectura para la que fue compilado. Los ficheros son de solo adición: una vez publicado un peso, nunca se modifica, y las versiones del motor fijan un nombre de fichero exacto. El tamaño del repositorio es de 1,0 GB y los ficheros individuales oscilan entre los 87 MB de T2b y los 113 MB de T7.

La relevancia actual del repositorio es acotada pero específica: sirve como referencia reproducible de la evolución de las arquitecturas NNUE de un motor open source, con pesos archivados de generaciones que nunca llegaron a publicarse y con detalles de receta de entrenamiento (superbatches, tasas de aprendizaje, mezclas WDL, filtros de datos) documentados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NNUE con feature transformer y capas densas; tres generaciones incompatibles (T1, T2b, T7) |
| Parametros totales | no disponible (no se declara el recuento; el tamaño de fichero es de 87 MB en T2b y 113 MB en T7) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (evaluador de posiciones de ajedrez, no modelo de lenguaje) |
| Tipos de cuantizacion | Inferencia entera de extremo a extremo en T7; filas i16 (PST) e i8 (features auxiliares) en T2b; cuantizacion i8 en las filas del feature transformer de T7 |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | GPL-3.0-or-later |
| Formato de pesos | ficheros binarios `.bin` propietarios de GaiaChess, con pie de integridad de 16 bytes (hash de arquitectura + hash de contenido) |

## Arquitectura y entrenamiento

La generacion T1 (`gaianet-t1-*`, `gaianet-t2-*`, `gaianet-t3*`) usa 12 king buckets × 768 entradas PST mas features de amenaza filtradas (aproximadamente 41 000 entradas), con un cuerpo 640 → CReLU + pairwise → 16 → 32 → 1 y 8 buckets de salida. La generacion T2b (`gaianet-t2b-*`), vigente en las versiones 4.3.0 a 4.4.2, combina 12 king buckets × 768 entradas PST en filas i16 con 64 368 features auxiliares en filas i8 (4 560 pares de peones y 59 808 features de interaccion entre piezas filtradas), acumuladas en una capa de anchura 1024, seguida de SCReLU emparejado, 16 → 32 → 1, con 8 buckets de salida basados en material y una cabeza PSQT. Cada fichero T2b ocupa 87 MB.

La generacion T7 (`gaianet-t7*`), introducida en la version 4.4.3 del motor, indexa las entradas piece-square por la casilla del rey (plegada a las columnas a-d, 32 casillas) y por la presencia de dama del rival: 45 056 entradas con ambos reyes compartiendo un unico plano. Junto con las mismas 64 368 features auxiliares que T2b, todas las filas del feature transformer son i8 y se acumulan en una capa de anchura 1024 por perspectiva, con producto pairwise, capa dispersa 1024 → 32 → [x², x] → 64 → capa con puertas (32 puertas × 32 valores, h = relu(g)² · v) → 96 → 1, mas una conexion residual desde la primera capa, y 32 pilas de salida elegidas por numero de piezas y damas. T7 no tiene cabeza PSQT y su inferencia es entera de extremo a extremo; cada fichero ocupa 113 MB.

El entrenamiento se realizo con Bullet (T1) y con entrenadores propios construidos sobre Bullet (T2b y T7). La model card detalla recetas concretas: por ejemplo, `gaianet-t2b-e017.bin` se entreno con 60 superbatches a lr 1e-4 coseno y WDL 0.3; `gaianet-t2b-e044.bin` anadio un filtro mas estricto con 90 % de omision aleatoria de posiciones (frente al 5 % anterior) y posiciones desde el ply 18 (frente al 8). `gaianet-t7.bin` se entreno desde cero con 560 superbatches y 40 adicionales a la mitad del tamano de batch. La variante `gaianet-t2b-t6-ftperm.bin` reordena las neuronas del feature transformer para agrupar los ceros en los mismos grupos de 4 bytes que omite la primera capa dispersa, con lo que la primera capa lee aproximadamente un 24 % menos de grupos y el motor resulta un 1,3 % mas rapido en Zen 5 y un 2 % mas rapido en ARM, sin cambiar ninguna evaluacion respecto a `t6`.

## Capacidades

- Evaluacion posicional de posiciones de ajedrez mediante inferencia NNUE dentro del motor GaiaChess.
- Tres generaciones de arquitectura con formatos binarios incompatibles entre si, seleccionables solo por la version del motor.
- Verificacion de integridad mediante pie de 16 bytes: el motor rechaza de forma explicita una red cuya arquitectura no coincida con la compilada.
- Inferencia entera de extremo a extremo en la generacion T7, sin operaciones en coma flotante en la ruta de evaluacion.
- Optimizacion de la primera capa dispersa mediante reordenacion de neuronas (`gaiachess ftperm`), que reduce lecturas de grupos de 4 bytes.
- Integracion en el motor en tiempo de compilacion (embebido) o en tiempo de ejecucion mediante la opcion UCI `setoption name EvalFile value <path>`.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni procesamiento de vision o audio: no es un modelo de lenguaje.

## Casos de uso

- Analisis de partidas con GaiaChess: cargar el peso T7 actual (`gaianet-t7.bin`) en un motor compilado con la version 4.4.3 o posterior permite obtener evaluaciones posicionales con inferencia entera y 32 pilas de salida, adecuadas para analisis profundo de posiciones con distinto material y presencia de damas.
- Reproduccion de resultados historicos: los pesos archivados de T1 (`gaianet-t1-1000.bin`, `gaianet-t2-1000.bin`, `gaianet-t3b-1000.bin`, `gaianet-t3e-1100.bin`, `gaianet-t3e-1100b.bin`) permiten reconstruir el comportamiento de versiones del motor de las series 4.2.x, util para comparar cambios de arquitectura o de receta de entrenamiento.
- Investigacion sobre arquitecturas NNUE: la convivencia de T1, T2b y T7 en un mismo repositorio, con descripcion detallada de entradas, anchuras de capa, buckets y cabezas de salida, sirve como material de estudio para quien disene evaluadores propios con Bullet.
- Optimizacion de rendimiento del motor: la variante `gaianet-t2b-t6-ftperm.bin` demuestra una tecnica concreta (reordenacion de neuronas para la capa dispersa) con una mejora medida del 1,3 % en Zen 5 y del 2 % en ARM, replicable en otros motores NNUE.
- Benchmarking de motores de ajedrez: al fijar el motor un nombre de fichero exacto por version, se pueden montar comparativas controladas entre versiones del motor con redes distintas sin ambiguedad sobre que pesos se usaron.
- Integracion en herramientas de ajedrez compatibles con UCI: cualquier GUI o script que hable UCI puede apuntar a un binario de GaiaChess con la red correspondiente mediante `EvalFile`, sin recompilar si la arquitectura coincide.
- Archivado reproducible de pesos: la politica de solo adicion y los pies de integridad permiten verificar que un fichero descargado es exactamente el que se entreno y publico, util en pipelines de evaluacion automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta dos medidas de rendimiento relativas a la reordenacion de neuronas de `gaianet-t2b-t6-ftperm.bin` frente a `gaianet-t2b-t6.bin`: aproximadamente un 1,3 % mas rapido en Zen 5 y un 2 % mas rapido en ARM, con evaluaciones identicas. No se aportan datos de fuerza de juego (Elo), velocidad en nodos por segundo ni resultados en suites de posiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un evaluador NNUE integrado en un motor de ajedrez, los pesos se cargan en memoria del proceso del motor; el tamano del fichero (87 MB en T2b, 113 MB en T7) da una cota inferior orientativa del espacio necesario para los pesos.
- GPU recomendadas: no aplica. La inferencia de GaiaChess es en CPU; la model card no menciona ejecucion en GPU.
- Compatibilidad con GPU de consumo: no aplica por el mismo motivo.
- Opciones de despliegue: compilacion del motor con la feature `nnue` y el peso embebido (`MODEL=nets/<fichero> RUSTFLAGS="-C target-cpu=native" cargo build --release --features nnue`), o carga en tiempo de ejecucion mediante la opcion UCI `setoption name EvalFile value <path>`.
- Latencia y throughput estimados: no disponible. Solo se conocen las mejoras relativas de la variante `ftperm` (1,3 % en Zen 5, 2 % en ARM) respecto a `t6`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otras redes NNUE (por ejemplo, las de Stockfish, Lc0 u otros motores), ni datos de fuerza o velocidad que permitan establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no admite prompts; su unica funcion es evaluar posiciones de ajedrez dentro del motor GaiaChess.
- Incompatibilidad estricta entre generaciones: un fichero T1 no carga en un motor T2b y viceversa; el motor lo rechaza de forma explicita. Es imprescindible emparejar el fichero con la version de motor indicada en la tabla de la model card.
- Nomenclatura potencialmente confusa: los prefijos antiguos de T1 usaban la segunda parte del nombre para una generacion de datos (`gaianet-t1-*`, `gaianet-t2-*`, `gaianet-t3b-1000`, `gaianet-t3e-*`), de modo que `gaianet-t3b-1000.bin` (T1) y `gaianet-t2b-t3b.bin` (T2b) son redes sin relacion que no cargan en el mismo motor.
- Politica de solo adicion: un fichero publicado nunca se modifica, lo que impide corregir errores en un peso ya distribuido; cualquier correccion requiere un fichero nuevo y una nueva version del motor.
- Fuerza de juego no documentada: no se aportan datos de Elo ni resultados en suites de posiciones, por lo que no es posible evaluar la calidad relativa de las redes a partir de la informacion disponible.
- Licencia GPL-3.0-or-later: el uso, la modificacion y la redistribucion estan sujetos a los terminos de la GPL, incluida la obligacion de liberar el codigo derivado bajo la misma licencia; conviene revisar la compatibilidad antes de integrar los pesos en productos propietarios.
- Idiomas: no aplica, pero implica que el repositorio no ofrece ninguna funcionalidad de procesamiento linguistico pese a estar alojado en Hugging Face.
- Ausencia de pipeline declarado y de descargas o likes en el momento de la consulta: el proyecto tiene una adopcion muy limitada, lo que reduce la probabilidad de soporte comunitario o de validacion independiente de los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jromanghf/gaiachess-networks
- Repositorio del motor GaiaChess en GitHub: https://github.com/jromang/gaiachess
- Entrenador Bullet: https://github.com/jw1912/bullet
