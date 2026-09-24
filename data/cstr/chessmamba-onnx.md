# cstr/chessmamba-onnx

## Resumen

ChessMamba ONNX es una exportación a formato ONNX del modelo TobiasLogic/chessmamba, un modelo de espacio de estados selectivo (Mamba/S6) de 16,8 millones de parámetros especializado en ajedrez. El modelo lee una partida como una secuencia de movimientos y predice el siguiente movimiento, la pieza de promoción y un valor de evaluación de la posición. El repositorio, publicado por el usuario cstr, no entrena nada: únicamente convierte los pesos originales a ONNX manteniendo todos los créditos al autor del modelo base.

La particularidad técnica de esta conversión es que cada grafo ONNX representa un único paso recurrente incremental. Se alimenta un movimiento junto con el estado recurrente y se obtiene la política del siguiente movimiento más el estado actualizado. Esto implica que jugar una partida completa cuesta un paso por movimiento, con un coste constante independiente de la longitud de la partida. Se ofrecen dos ficheros con los mismos pesos: uno con dimensión de lote en todas las entradas y salidas, pensado para expandir en una sola llamada todos los movimientos candidatos de un nodo, y otro fijado a lote 1.

El modelo es relevante para quienes trabajan en motores de ajedrez ligeros, en aprendizaje por refuerzo aplicado a dominios secuenciales discretos o en la integración de arquitecturas de espacio de estados en herramientas de análisis. Su tamaño reducido (0,1 GB de repositorio) y su latencia de 15-18 ms por paso en un solo hilo de CPU lo hacen apto para entornos sin GPU. La licencia MIT permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de espacio de estados selectivo (Mamba/S6) |
| Parametros totales | 16,8 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Indice de jugada (ply) limitado internamente a 96; procesamiento incremental de un paso por movimiento |
| Tipos de cuantizacion | No disponible (se distribuyen pesos ONNX en su precision original, sin cuantizaciones publicadas) |
| Idiomas soportados | No aplica (modelo especifico de ajedrez); no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, IR 8, 23 operadores estandar) |
| Tamano del repositorio | 0,1 GB |
| Entradas | from_sq, to_sq, promo, ply, is_start, state [10, b, 768, 16] |
| Salidas | policy [b, 4096], promo_logits [b, 5], value [b, 1], new_state [10, b, 768, 16] |
| Modelo base | TobiasLogic/chessmamba |
| Fecha de publicacion | 2026-09-24 (segun HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de espacio de estados selectivo del tipo Mamba/S6. El modelo consume una secuencia de movimientos de ajedrez codificados como indices de casilla (from_sq y to_sq, numeracion python-chess con a1 = 0 y h8 = 63), una pieza de promocion (0 ninguna, 1 dama, 2 torre, 3 alfil, 4 caballo), el indice de jugada (ply, con base 1 y recortado a 96) y una marca is_start que vale 1 en el primer paso, cuando se usa el token de inicio y el estado recurrente es cero. La salida de politica tiene 4096 dimensiones, una por cada combinacion from * 64 + to.

El grafo ONNX de este repositorio no representa la partida completa, sino un unico paso recurrente. El estado recurrente tiene forma [10, b, 768, 16] y se realimenta entre pasos: se empieza con is_start = 1 y estado de ceros, y a partir de ahi cada movimiento se procesa con is_start = 0 y el estado devuelto por el paso anterior. El modelo tambien produce una cabeza de valor con tangente hiperbolica que estima el resultado esperado para el lado al que le toca mover, en el rango -1 a 1. La exportacion fue verificada con onnxruntime: la diferencia maxima absoluta en los logits de politica frente al metodo step_move del modelo PyTorch original es de 1,05 × 10^-5 a lo largo de una partida de 30 jugadas, y el grafo con lote coincide con el grafo de paso simple hasta 7 × 10^-4 sobre diez hijos de la misma posicion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO; la model card indica que todo el merito del modelo y su entrenamiento corresponde al autor original y que este repositorio solo realiza la conversion.

## Capacidades

- Prediccion del siguiente movimiento: genera logits de politica sobre las 4096 casillas de origen y destino posibles.
- Prediccion de promocion: cabeza especifica de 5 clases (ninguna, dama, torre, alfil, caballo).
- Evaluacion de posicion: cabeza de valor con salida en el rango -1 a 1 que estima el resultado esperado para el lado que mueve.
- Inferencia incremental: un paso por movimiento con estado recurrente realimentado, coste constante independiente de la longitud de la partida.
- Inferencia por lotes: el grafo por lotes permite expandir todos los movimientos candidatos de un nodo en una sola llamada; con onnxruntime, un lote de 10 cuesta aproximadamente 1,4 veces un paso simple.
- Integracion en busqueda de arbol: la combinacion de politica y valor permite usarlo en algoritmos tipo MCTS o alfa-beta.
- Integracion con CrispChess: el repositorio indica que el modelo es usado por el proyecto CrispChess.
- Tool calling / function calling: no soportado, no aplica.
- Agentes y razonamiento multi-paso: no soportado, no aplica.
- Capacidades multilingues: no aplica, el modelo no procesa lenguaje natural.
- Vision, audio, modo thinking: no soportado, no aplica.

## Casos de uso

- Motor de ajedrez con busqueda en arbol: el grafo con dimension de lote permite expandir todos los hijos de un nodo en una sola llamada a onnxruntime (un lote de 10 cuesta unas 1,4 veces un paso simple), y la cabeza de valor sirve como funcion de evaluacion en MCTS o alfa-beta sin necesidad de GPU.
- Analisis y anotacion de partidas: recorriendo una partida paso a paso se obtiene la politica y el valor en cada posicion, lo que permite detectar jugadas dudosas o errores tacticos comparando la jugada real con la mejor accion segun los logits.
- Generacion de partidas para autoaprendizaje o refuerzo: al tener un coste por paso constante y bajo (15-18 ms en un hilo de CPU), se pueden generar grandes volumenes de partidas sinteticas para entrenar o evaluar otros sistemas.
- Despliegue en entornos sin GPU: con un repositorio de 0,1 GB y pesos de aproximadamente 67 MB en float32, el modelo se puede ejecutar en CPU, contenedores ligeros o dispositivos de borde usando onnxruntime.
- Integracion en CrispChess: al ser el formato usado por ese proyecto, sirve como componente de inferencia dentro de su pipeline de analisis o juego.
- Filtrado y etiquetado de datasets de ajedrez: procesando posiciones en lote se puede asignar un valor estimado y una distribucion de politica a cada posicion para tareas de curación o mineria de datos.
- Investigacion en modelos de espacio de estados: el modelo sirve como banco de pruebas para estudiar Mamba/S6 en dominios secuenciales discretos con estado recurrente explicito y compararlo con alternativas transformer.
- Analisis de variantes en lote para una posicion dada: gracias al grafo con lote, se pueden evaluar de una vez todas las continuaciones candidatas de una posicion, lo que acelera herramientas de analisis interactivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de fuerza de juego (Elo), precision de prediccion de movimiento ni comparaciones con otros motores. Si se incluyen datos de verificacion de la exportacion:

| Prueba | Resultado |
|---|---|
| Diferencia maxima absoluta de logits de politica frente al modelo PyTorch (partida de 30 jugadas) | 1,05 × 10^-5 |
| Coincidencia entre grafo por lotes y grafo de paso simple (diez hijos de la misma posicion) | 7 × 10^-4 |
| Latencia por paso en CPU con onnxruntime (un hilo) | 15-18 ms |
| Coste relativo de un lote de 10 frente a un paso simple | ~1,4 veces |
| Operadores estandar del grafo | 23 (opset 17, IR 8) |

## Requisitos de hardware

- Parametros: 16,8 millones; pesos en float32 de aproximadamente 67 MB.
- Estado recurrente: 10 × b × 768 × 16 valores float32, unos 0,47 MB por elemento de lote; un lote de 10 ocupa unos 4,7 MB de estado.
- VRAM estimada: inferior a 1 GB en cualquier configuracion razonable; el modelo cabe sobradamente en GPUs de gama de entrada.
- GPU recomendadas: cualquier GPU con soporte de onnxruntime; no se requieren aceleradores de datacenter como A100 o H100 para inferencia interactiva, aunque pueden usarse para paralelizar grandes volumenes.
- GPU de consumo: cabe en cualquier GPU consumer, incluidas RTX 3060, RTX 4060 o superiores, e incluso en iGPU con soporte ONNX.
- CPU: es viable como opcion principal; 15-18 ms por paso en un solo hilo con onnxruntime.
- Opciones de despliegue: onnxruntime (probado por el autor de la conversion). No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: aproximadamente 15-18 ms por paso simple en CPU de un hilo; para expansion de 10 hijos se estima alrededor de 21-25 ms por llamada por lotes segun el factor 1,4 indicado en la model card.
- Requisitos de grafo: ONNX opset 17, IR 8, 23 operadores estandar; se recomienda verificar la compatibilidad de onnxruntime con esa version de opset.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones con otros motores de ajedrez en la informacion proporcionada. La unica comparacion documentada es entre esta conversion y el modelo base original:

| Aspecto | TobiasLogic/chessmamba | cstr/chessmamba-onnx |
|---|---|---|
| Parametros | 16,8 millones | 16,8 millones (mismos pesos) |
| Arquitectura | Mamba/S6 selectivo | Mamba/S6 selectivo |
| Formato | Pesos PyTorch | ONNX (opset 17, IR 8) |
| Licencia | MIT | MIT |
| Inferencia | Metodo step_move del modelo original | Paso recurrente ONNX, con variante por lotes |
| Verificacion | Referencia | Diferencia maxima de 1,05 × 10^-5 en logits frente a PyTorch |
| Uso asociado | Modelo base | Proyecto CrispChess |
| Idiomas | No aplica | No aplica |
| Contexto | Secuencia de movimientos con ply limitado a 96 | Igual, con estado recurrente realimentado |

No hay informacion disponible para comparar con alternativas como otros motores de ajedrez neuronales o clasicos en terminos de Elo, precision o consumo.

## Limitaciones y advertencias

- Modelo unimodal y especifico de ajedrez: no procesa lenguaje natural, no soporta tool calling, agentes, vision ni audio.
- Limite de contexto: el indice de jugada se recorta a 96, por lo que partidas mas largas comparten el mismo indice y pueden degradar la representacion temporal.
- Gestion manual del estado: el estado recurrente [10, b, 768, 16] debe realimentarse correctamente entre pasos; un error en la secuencia o en is_start puede invalidar las predicciones.
- Sin benchmarks publicados: no hay datos de Elo, precision de movimiento ni evaluacion de fuerza en la informacion disponible.
- Adopcion muy baja: 7 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.
- Es una conversion, no un entrenamiento: cualquier sesgo, carencia o comportamiento indeseado proviene del modelo base TobiasLogic/chessmamba.
- Riesgo de errores tacticos y estrategicos: la cabeza de valor es una estimacion en el rango -1 a 1 y no garantiza una evaluacion correcta de la posicion.
- Dependencia de onnxruntime y del opset 17: entornos con versiones antiguas de runtime pueden no cargar el grafo.
- Licencia MIT: permite uso comercial y modificacion, siempre que se conserven los avisos de copyright y la atribucion correspondiente; se debe mantener el credito al autor original del modelo.
- No aplican advertencias de alucinacion en lenguaje natural, pero si la posibilidad de predicciones de movimiento invalidas o de baja calidad en posiciones fuera de la distribucion de entrenamiento.
- No se especifican limitaciones de idioma porque el modelo no maneja idiomas.
- Solo se ofrecen pesos en precision original; no hay versiones cuantizadas publicadas en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cstr/chessmamba-onnx
- Modelo base: https://huggingface.co/TobiasLogic/chessmamba
- Proyecto CrispChess: https://github.com/CrispStrobe/CrispChess
- Script de exportacion: https://github.com/CrispStrobe/CrispChess/blob/main/tool/kaggle/chess-lm-onnx/export_chess_lms.py
