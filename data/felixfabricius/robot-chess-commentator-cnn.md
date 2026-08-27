# felixfabricius/robot-chess-commentator-cnn

## Resumen

El modelo `felixfabricius/robot-chess-commentator-cnn` es un clasificador de imágenes convolucional diseñado para reconocer el contenido de una casilla de ajedrez (vacía o con una pieza concreta, indicando color y tipo). Ha sido desarrollado por Felix Fabricius para habilitar a un robot Reachy Mini a comentar partidas de ajedrez en tiempo real, integrando la lectura del tablero en un sistema de visión robótica. El modelo resuelve el problema de la detección precisa de movimientos a partir de imágenes de casillas individuales, un paso crítico para cualquier sistema automatizado de seguimiento de partidas.

Con una arquitectura CNN compacta de tres bloques convolucionales y una rama residual con convolución dilatada, el modelo procesa imágenes de 144×144 píxeles con un canal adicional de máscara. Cuenta con 328.853 parámetros entrenables (1,3 MB en fp32) y una ventana de contexto no aplicable al ser un modelo de visión. Su relevancia actual radica en que ofrece una precisión de movimiento del 94,7% en test ejecutándose localmente en aproximadamente un segundo y sin coste, frente a alternativas basadas en modelos de visión-lenguaje de gran tamaño que alcanzan solo un 21,3% de precisión con un coste de 0,20 dólares por tablero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (trunk convolucional de 3 bloques con rama residual y convolución dilatada) |
| Parametros totales | 330.088 valores en el state dict (328.853 entrenables, el resto son buffers de BatchNorm y el log-prior de 13 clases) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (se distribuye en fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (archivo `model_state_dict.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN de tres bloques convolucionales con una rama residual cuya última BatchNorm está inicializada a cero, de modo que la rama comienza como una identidad. La rama residual emplea una convolución dilatada depthwise que amplía el campo receptivo hasta aproximadamente siete celdas del tablero, suficiente para detectar piezas altas que se inclinan desde casillas vecinas. La entrada es una imagen de 4×144×144 (RGB más una máscara de la casilla) junto con un one-hot de 4 dimensiones que indica qué esquina del tablero está arriba a la izquierda. La salida se compone de tres cabezas: una para vacío/no vacío (1 logit), una para color (2 logits) y una para tipo de pieza (6 logits). Estas cabezas se recombinan en log-probabilidades de 13 clases mediante `reconstruct_13way_logprobs`, asumiendo independencia condicional entre color y tipo dado que la casilla no está vacía. Este enfoque permite que cada imagen de pieza entrene la cabeza de color, en lugar de repartir la evidencia entre doce clases de piezas.

El entrenamiento se realizó sobre el dataset `felixfabricius/robot-chess-commentator-squares`, que contiene 23.744 casillas etiquetadas procedentes de 371 posiciones de ajedrez. La cabeza de vacío se entrena con `BCEWithLogitsLoss` contra la variable `is_piece`, por lo que `sigmoid(logit_empty)` representa P(pieza) a pesar del nombre. El checkpoint incluye una corrección de prior: `reconstruct_13way_logprobs` resta el prior de entrenamiento (el 56% de las casillas están vacías) para que las puntuaciones reflejen la evidencia de cada clase y no su frecuencia en el dataset. Esta corrección está activada por defecto y es necesaria para el funcionamiento correcto del modelo.

## Capacidades

- Clasificación de casillas de ajedrez: determina si una casilla está vacía o contiene una pieza, y en ese caso identifica el color (blanco/negro) y el tipo (rey, dama, torre, alfil, caballo, peón).
- Agregación de predicciones por casilla para estimar el estado completo del tablero y, por tanto, los movimientos realizados.
- Inferencia local rápida: procesa una casilla en aproximadamente un segundo en hardware convencional, sin necesidad de GPU.
- Integración con sistemas robóticos: diseñado específicamente para el robot Reachy Mini, pero utilizable como componente independiente de visión.
- Corrección de prior incorporada: las salidas están calibradas para reflejar evidencia, no frecuencias de entrenamiento.
- Entrada multimodal (RGB + máscara) que permite aislar la casilla del contexto del tablero.

## Casos de uso

- Comentario automático de partidas de ajedrez: el modelo se integra en el sistema del robot Reachy Mini para leer el tablero tras cada movimiento y generar comentarios en lenguaje natural. Su alta precisión de movimiento (94,7%) y su ejecución local lo hacen viable para retransmisiones en directo sin depender de APIs externas.
- Arbitraje digital en torneos: un sistema basado en este clasificador puede verificar movimientos legales y detectar irregularidades (piezas movidas fuera de turno, tableros incorrectos) de forma autónoma, reduciendo la carga de los árbitros humanos.
- Entrenamiento de ajedrez asistido por ordenador: plataformas de aprendizaje pueden usar el modelo para registrar partidas jugadas en tableros físicos y ofrecer análisis posterior, sin necesidad de tableros electrónicos caros.
- Análisis de partidas históricas: digitalización de posiciones desde fotografías o vídeos de partidas antiguas, permitiendo reconstruir movimientos y alimentar bases de datos de ajedrez.
- Robótica educativa: el modelo sirve como ejemplo práctico de visión por computador en entornos educativos, demostrando cómo una CNN pequeña puede resolver una tarea de percepción compleja con recursos mínimos.
- Accesibilidad para personas con discapacidad visual: un sistema que lee el tablero y convierte los movimientos en audio permite a jugadores invidentes seguir partidas en tableros físicos estándar.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en los conjuntos de validación y test del dataset propio:

| Metrica | Val | Test |
|---|---|---|
| Precisión de movimiento (agregada) | 94,6% | 94,7% |
| Precisión por casilla | 73,8% | 74,6% |

Como comparación, el mejor modelo de visión-lenguaje evaluado en el mismo split de test (Claude Opus 5, con log-probabilidades por casilla y razonamiento de bajo esfuerzo) alcanza un 21,3% de precisión de movimiento con un coste aproximado de 0,20 dólares por tablero. El modelo CNN se ejecuta localmente en alrededor de un segundo sin coste económico.

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje ni de propósito general.

## Requisitos de hardware

- Inferencia en CPU: el modelo tiene solo 1,3 MB en fp32 y 328.853 parámetros, por lo que puede ejecutarse en cualquier CPU moderna sin necesidad de GPU. El tiempo de inferencia por casilla es de aproximadamente un segundo.
- VRAM estimada: no disponible oficialmente, pero por el tamaño del modelo (1,3 MB) la VRAM necesaria es despreciable (menos de 100 MB incluyendo overhead). Cualquier GPU consumer (GTX 1050, RTX 3060, etc.) es más que suficiente.
- GPU recomendadas: no se requiere ninguna GPU específica; el modelo funciona en CPU. Si se desea acelerar el procesamiento de múltiples casillas en paralelo, cualquier GPU con al menos 1 GB de VRAM es válida.
- Opciones de despliegue: el modelo se distribuye en formato safetensors y se carga con PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Puede exportarse a ONNX para inferencia en producción si se desea.
- Latencia y throughput: la model card indica que el modelo corre en aproximadamente un segundo por casilla en hardware local. No se proporcionan datos de throughput para procesamiento por lotes.

## Comparativa con modelos similares

No se han encontrado otros modelos específicos de clasificación de piezas de ajedrez con los que comparar directamente. La única comparación disponible en la documentación es con un modelo de visión-lenguaje de gran tamaño:

| Modelo | Tipo | Precisión de movimiento (test) | Coste por tablero | Ejecución |
|---|---|---|---|---|
| robot-chess-commentator-cnn | CNN especializada | 94,7% | 0 € (local) | ~1 s en CPU |
| Claude Opus 5 (VLM) | Modelo de visión-lenguaje | 21,3% | ~0,20 $ | API externa |

La comparación muestra una ventaja abrumadora del modelo CNN en precisión y coste para esta tarea específica, aunque el VLM ofrece flexibilidad para otras tareas de visión general.

## Limitaciones y advertencias

- Entrenado en un único tablero, un único set de piezas y una única cámara, con 50 configuraciones diferentes. Puede transferir mal a otros tableros, piezas o condiciones de iluminación muy distintas.
- La precisión por casilla es del 74,6% en test, lo que implica que aproximadamente una de cada cuatro casillas se clasifica incorrectamente a nivel individual. La alta precisión de movimiento (94,7%) se logra gracias a la agregación de predicciones, pero errores en casillas aisladas pueden propagarse en posiciones ambiguas.
- No es un modelo de lenguaje: no genera comentarios ni texto; solo produce clasificaciones. El sistema de comentario requiere un componente adicional de generación de lenguaje.
- El archivo `modeling.py` se genera a partir de un repositorio con licencia GPL-3.0-or-later, aunque se publica bajo Apache-2.0. Es necesario revisar el encabezado de ese archivo para confirmar los términos exactos de uso y distribución.
- No se han evaluado sesgos relacionados con variaciones de iluminación, ángulos de cámara o piezas de diferentes fabricantes. El riesgo de alucinación no aplica al ser un clasificador, pero sí existe riesgo de clasificaciones erróneas en condiciones fuera de la distribución de entrenamiento.
- El modelo no incluye mecanismos de incertidumbre calibrada más allá de la corrección de prior; las probabilidades de salida pueden no reflejar la confianza real en entornos no vistos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/felixfabricius/robot-chess-commentator-cnn
- Dataset de entrenamiento: https://huggingface.co/datasets/felixfabricius/robot-chess-commentator-squares
- Repositorio del proyecto (GPL-3.0): https://github.com/felixfabricius/robot-chess-commentator
