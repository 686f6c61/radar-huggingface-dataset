# avewright/value99-chessfens-24x576

## Resumen

Value99 es una red de valor escalar para ajedrez entrenada desde cero por el usuario avewright. Se trata de un transformer de 98.920.577 parametros (aproximadamente 98,9 millones) cuyo unico objetivo es estimar `V(s) ∈ [-1, 1]`, definido como `P(win) − P(loss)` desde la perspectiva del bando que tiene el turno, tras canonicalizar el tablero para que el lado en movimiento sea siempre las blancas. No incluye cabeza de politica, ni recurrencia, ni tronco preentrenado: es exclusivamente un evaluador de posiciones.

El modelo se apoya en el dataset publico ChessFENS, que contiene etiquetas WDL (win/draw/loss) generadas por Leela Chess Zero con la perspectiva del lado en movimiento. El autor realizo una sola pasada sobre 13.989.888 posiciones, deteniendose en el paso 27324, y publica los pesos de ese checkpoint. Segun la model card, el checkpoint se pauso a mitad de entrenamiento para iniciar un proyecto posterior de PPO (ChessBot), por lo que no corresponde a una epoca completada.

Su relevancia practica es la de un evaluador sin busqueda: una jugada se puntua como `−V(hijo)`, es decir, un unico ply sin arbol de busqueda. En una criba con 16 partidas por nivel y 8 aperturas jugadas con ambos colores, el paso 22000 alcanzo aproximadamente 1320 UCI_Elo frente a Stockfish 19 con `UCI_LimitStrength`, con un intervalo estimado de 1320-1450. Es, por tanto, una pieza util como funcion de valor para RL, como etiquetador de posiciones o como evaluador ligero, no como motor de ajedrez completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 24 capas, anchura 576, 8 cabezas de atencion, FFN tipo SwiGLU con dimension interna 1584, mezclador de valor cuadrado (square value mixer) de 128 |
| Parametros totales | 98.920.577 (aproximadamente 98,9 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto textual; la entrada es una representacion de tablero canonica de 64 casillas, procesada por `pack_board` |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en el checkpoint PyTorch `latest.pt` (entrenamiento en bf16, inferencia sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo especifico de ajedrez; no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, diccionario con `config` y `model`, sin estado del optimizador); no se publican safetensors ni GGUF |
| Cabeza de salida | valor escalar `V(s) ∈ [-1, 1]` (WDL del lado en movimiento); sin cabeza de politica |
| Tamano del repositorio | 0,4 GB |
| Fecha de creacion en HuggingFace | 2026-09-18 |
| Ultima actualizacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de 24 capas con anchura 576 y 8 cabezas de atencion (dimension por cabeza de 72). El bloque FFN sigue un esquema tipo SwiGLU con dimension interna 1584, y el modelo incorpora un componente denominado "square value mixer" de dimension 128, orientado especificamente al tratamiento de la informacion por casilla del tablero. No hay cabeza de politica, recurrencia ni tronco preentrenado de un modelo mayor: todo el modelo se entrena desde cero para una unica tarea de regresion escalar. La API publicada incluye `ValueConfig`, `ValueTransformer`, y las utilidades `pack_board` y `score_legal_moves`, de modo que la codificacion del tablero y la puntuacion de jugadas legales forman parte del propio repositorio.

En cuanto a los datos, se utilizo el dataset `Maxlegrec/ChessFENS` en la revision `0d8d4e6bbda49d42e84c3272be026701659a457c`, con etiquetas WDL de Leela Chess Zero expresadas desde la perspectiva del lado en movimiento. El entrenamiento consistio en una sola pasada sobre 13.989.888 posiciones, con batch 512 y microbatch 64, hasta el paso 27324. El optimizador combina Polar-NorMuon para tensores 2D y AdamW para las capas de normalizacion, con `torch.compile`, precision bf16 y gradient checkpointing. La model card advierte explicitamente que estas etiquetas no son el WDL oficial de Stockfish: LC0 y SF19 usan profesores distintos, por lo que las evaluaciones no son directamente intercambiables entre si. El autor indica ademas que el entrenamiento se pauso a mitad de ejecucion, no que se completara una epoca.

## Capacidades

- Evaluacion de posiciones de ajedrez: produce un valor escalar en `[-1, 1]` interpretable como diferencia entre probabilidad de victoria y de derrota para el bando con el turno.
- Canonicalizacion de tablero: la entrada se normaliza de forma que el lado en movimiento se trata siempre como blancas, lo que permite reutilizar la misma red para ambos colores.
- Puntuacion de jugadas legales sin busqueda: con `score_legal_moves`, cada jugada se valora como `−V(posicion_hija)` a un solo ply.
- Seleccion de jugada por argmax: la jugada elegida es la que maximiza `−V(hijo)`, sin arbol de busqueda, quiescence ni tabla de transposiciones.
- Uso como funcion de valor en aprendizaje por refuerzo: el autor indica que el modelo se pauso para arrancar un entrenamiento PPO, lo que sugiere su uso como critica o estimador de valor.
- Procesamiento de posiciones en formato FEN mediante la utilidad `pack_board`.
- No dispone de generacion de texto, razonamiento en lenguaje natural, codigo, matematicas, vision, audio ni capacidades multilingues.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Evaluacion sin busqueda en motores ligeros: integrado como funcion de evaluacion de hoja en un motor propio, permite obtener un valor inmediato de la posicion sin desplegar una busqueda completa, algo util cuando el presupuesto de computo por jugada es muy reducido.
- Etiquetado de posiciones para datasets de ajedrez: dado un conjunto de FEN, el modelo puede generar un valor continuo entre -1 y 1 que sirva como etiqueta blanda para entrenar otros modelos o para filtrar posiciones por interes.
- Funcion de valor en pipelines de RL: al no tener cabeza de politica, encaja como critica en esquemas tipo PPO o actor-critica, estimando el retorno esperado de un estado sin necesidad de buscar.
- Ordenacion previa de jugadas en un motor con alfa-beta: usar `−V(hijo)` como heuristica de ordenacion antes de lanzar la busqueda profunda puede mejorar la eficiencia de las podas en un motor externo.
- Analisis y anotacion de partidas: recorriendo una partida ply a ply, la diferencia entre el valor de la posicion y el valor de la jugada elegida permite senalar momentos donde se cedio ventaja.
- Ajuste de dificultad de bots de ajedrez: utilizando el valor como criterio de seleccion entre jugadas candidatas, se puede calibrar el nivel de un bot sin recurrir a motores completos; el propio autor lo situa en torno a 1320-1450 UCI_Elo en modo de un solo ply.
- Investigacion sobre arquitecturas de evaluacion en ajedrez: al ser un transformer puro sin recurrencia ni tronco preentrenado, sirve como punto de comparacion controlado frente a NNUE y a redes de Leela Chess Zero.
- Pretraining o destilacion de modelos de ajedrez: el checkpoint puede actuar como profesor para inicializar o destilar un modelo menor con objetivos WDL.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K u otros), que ademas no son aplicables a este modelo. El unico dato de rendimiento reportado es la fuerza de juego en modo de un solo ply:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Fuerza de juego (un ply, argmax de `−V(sucesor)`) | ~1320 UCI_Elo, intervalo 1320-1450 | Paso 22000; oponente Stockfish 19 con `UCI_LimitStrength`; 16 partidas por nivel, 8 aperturas jugadas con ambos colores |
| Checkpoint publicado | Paso 27324 | 13.989.888 posiciones, una pasada, batch 512 / microbatch 64 |
| Precision reportada | no disponible | No se publican tasas de acierto WDL ni calibracion |

El autor advierte que esta cifra es UCI_Elo de un ajuste de limitacion de fuerza de Stockfish, no Elo FIDE ni Elo de Lichess, y que el checkpoint publicado (paso 27324) es posterior a la criba reportada (paso 22000), sin evaluacion publicada a esa altura del entrenamiento.

## Requisitos de hardware

- Parametros: 98,9 M. En bf16 los pesos ocupan aproximadamente 198 MB; en fp32, unos 396 MB. Esto es coherente con el tamano de repositorio de 0,4 GB.
- Inferencia en CPU: viable en cualquier equipo moderno para evaluar posiciones sueltas, dado el reducido numero de parametros y la ausencia de decodificacion autoregresiva.
- GPU consumer: cabe con holgura en cualquier GPU consumer actual, incluidas GTX 1650 (4 GB), RTX 3060 (12 GB) o RTX 4090 (24 GB). El factor limitante no es la VRAM, sino el coste de evaluar `score_legal_moves` sobre todos los hijos legales de una posicion.
- GPU de datacenter: A100, H100 u similares solo tienen sentido para generar etiquetas a gran escala o para entrenamiento/continuacion del ajuste fino, no por requisitos de memoria.
- Memoria adicional: con gradient checkpointing y `torch.compile` el modelo fue entrenado en bf16; para inferencia basta con cargar `latest.pt` en CPU o GPU con `weights_only=False`.
- Opciones de despliegue: PyTorch eager o `torch.compile` son las vias documentadas. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje y no expone una interfaz de generacion de tokens.
- Latencia y throughput: no disponible. No se publican mediciones de posiciones evaluadas por segundo ni de latencia por jugada.

## Comparativa con modelos similares

| Modelo | Parametros | Salidas | Fuerza reportada | Licencia | Formato |
|---|---|---|---|---|---|
| Value99 (avewright) | 98,9 M | Valor escalar WDL del lado en movimiento | ~1320 UCI_Elo a un ply frente a Stockfish 19 con `UCI_LimitStrength` | MIT | PyTorch `.pt` |
| Redes de Leela Chess Zero | no disponible en la informacion proporcionada | Politica + valor (cabeza de valor WDL desde la perspectiva del lado en movimiento) | no disponible | no disponible | no disponible |
| Stockfish NNUE (SF19) | no disponible en la informacion proporcionada | Evaluacion de posicion dentro de una busqueda alfa-beta | no disponible | GPL (no confirmado en la informacion proporcionada) | no disponible |

La comparacion directa con LC0 y Stockfish es solo cualitativa: la model card senala que las etiquetas de entrenamiento provienen de LC0 y que el WDL de LC0 y el de SF19 son profesores distintos, de modo que las evaluaciones no son intercambiables. Cualquier cifra concreta de parametros, contexto o fuerza de los modelos alternativos no esta disponible en la informacion proporcionada y no debe asumirse.

## Limitaciones y advertencias

- Checkpoint incompleto: el autor indica explicitamente que el entrenamiento se pauso a mitad de ejecucion (paso 27324) para iniciar un proyecto de PPO. No es una epoca terminada, por lo que el rendimiento puede ser inferior al de una ejecucion completa.
- Sin busqueda: el modelo esta pensado para evaluacion a un ply. No incorpora arbol de busqueda, quiescence ni tablas de transposiciones, por lo que su fuerza en partida completa depende enteramente de como se integre.
- Fuerza modesta: el unico dato publicado lo situa en torno a 1320 UCI_Elo, un nivel muy por debajo de motores convencionales. No es adecuado como sustituto de un motor en contextos competitivos.
- Naturaleza de la metrica: el Elo reportado es UCI_Elo del modo `UCI_LimitStrength` de Stockfish 19, no Elo FIDE ni de Lichess, y se obtuvo con 16 partidas por nivel y 8 aperturas, una muestra pequena con el consiguiente margen de error.
- Profesor distinto: las etiquetas provienen de Leela Chess Zero, no del WDL oficial de Stockfish. El sesgo del profesor se hereda y las comparaciones con evaluadores entrenados con SF19 no son directas.
- Riesgo de error en posiciones fuera de distribucion: al haberse entrenado con una sola pasada sobre un unico dataset, no se documenta comportamiento en posiciones poco representadas (finales raros, tableros de problemas, variantes no estandar).
- Sin cuantizacion publicada: no hay pesos GGUF, safetensors ni versiones cuantizadas, lo que limita el despliegue en herramientas que esperan esos formatos.
- Cero adopcion observable: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente de los resultados del autor.
- Carga con `weights_only=False`: el ejemplo de la model card requiere deserializar un pickle completo, lo que implica revisar la procedencia del fichero antes de cargarlo en entornos no confiables.
- Licencia MIT: permite uso comercial y modificacion con atribucion y sin garantia; no se documentan restricciones adicionales, pero tampoco se ofrece soporte ni mantenimiento.
- Idiomas: no aplica. El modelo no procesa lenguaje natural, por lo que no hay capacidades multilingues que evaluar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/avewright/value99-chessfens-24x576
- Dataset de entrenamiento (ChessFENS): https://huggingface.co/datasets/Maxlegrec/ChessFENS
- Revision del dataset citada: `0d8d4e6bbda49d42e84c3272be026701659a457c`
- Ficheros incluidos en el repositorio: `latest.pt`, `model_config.json`, `chess_value99.py`
- Paper, blog o demo adicionales: no disponible. Las busquedas web realizadas no devolvieron resultados relacionados con este modelo; los unicos resultados obtenidos trataban sobre el termino generico "integrity" y no guardan relacion con el modelo.
