# shatayumk/chesslm

## Resumen

ChessLM es un transformer decoder-only de tipo Qwen3 entrenado desde cero sobre partidas de ajedrez de Lichess, publicado por el usuario shatayumk. Se trata de una reimplementación de la configuración de 50M de parámetros descrita en la Tabla 2 del artículo *Understanding Reasoning from Pretraining to Post-Training* (arXiv:2607.16097), orientada a estudiar leyes de escalado de tokens en un dominio cerrado y controlado como el ajedrez. El repositorio contiene cuatro checkpoints preentrenados, de los cuales tres forman un barrido de escalado de tokens a tamaño de modelo fijo (0,69B, 1,15B y 2,29B tokens vistos), lo que permite comparar directamente el efecto del presupuesto de cómputo sobre la pérdida de validación.

Arquitectónicamente es un transformer denso de 47,3M de parámetros, 12 capas, dimensión oculta 512 y ventana de contexto de 1024 tokens, con atención GQA (8 cabezas de consulta, 4 de clave-valor), RoPE con theta 1.000.000, RMSNorm con normalización por cabeza en Q/K y FFN SwiGLU. Su vocabulario es de solo 82 tokens y no es textual: cada jugada se tokeniza en exactamente cuatro símbolos (pieza, casilla origen, casilla destino y bandera), de modo que el modelo no procesa lenguaje natural en absoluto.

Su relevancia actual es doble. Por un lado, sirve como banco de pruebas reproducible y de bajo coste para estudiar curvas de escalado y recetas de preentrenamiento en dominios con gramática estricta. Por otro, es un modelo base utilizable para experimentos de ajuste fino (SFT, RL) orientados a predecir movimientos humanos o a analizar partidas, aunque no es un motor de ajedrez ni ha sido optimizado para jugar fuerte. Está liberado bajo licencia MIT y los pesos en formato safetensors ocupan 0,8 GB en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso estilo Qwen3, con GQA, RoPE y SwiGLU |
| Parametros totales | 47,3M (47.285.760 con embeddings desacoplados; 47.243.776 con embeddings acoplados) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (equivalente a 256 jugadas, 4 tokens por jugada) |
| Tipos de cuantizacion | no disponible (los pesos se publican en fp32; no se distribuyen versiones cuantizadas) |
| Idiomas soportados | no disponible (el vocabulario es de 82 tokens ajedrecísticos, no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch), con `modeling_chesslm.py` y `chess_tokenizer.py` incluidos en el repositorio |

Detalles arquitectónicos adicionales: 12 capas, hidden size 512, intermediate size 1536, 8 cabezas de consulta y 4 de clave-valor, dimensión de cabeza 128, vocabulario de 82 tokens, RoPE con theta 1.000.000, RMSNorm con epsilon 1e-6 incluyendo normalización Q/K por cabeza, FFN SwiGLU y precisión fp32.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal, denso y de tamaño fijo, que reproduce la configuración de 50M del artículo de referencia. Usa atención con consultas agrupadas (GQA) con ratio 2:1 entre cabezas de consulta y de clave-valor, codificación posicional rotatoria (RoPE) con una base alta de 1.000.000 y normalización RMSNorm sobre las activaciones, incluyendo una normalización adicional por cabeza sobre Q y K antes de la atención. La FFN emplea SwiGLU con un ratio de expansión de 3x (1536 sobre 512). El tokenizador es específico de ajedrez: cada movimiento se codifica como cuatro tokens (pieza, casilla de origen, casilla de destino y bandera), más un token de fin de secuencia. El vocabulario de 82 símbolos se compone de 6 piezas, 64 casillas, 11 banderas y `<EOS>`.

Los datos provienen de la base estándar valorada de Lichess de enero de 2022 (`lichess_db_standard_rated_2022-01`), filtrada según la receta del Apéndice C.1 del artículo: solo controles de tiempo blitz y rapid, partidas de menos de 10 plies descartadas, y Elo medio estratificado en bins de 200 puntos entre 800 y 3000. De 13.813.071 partidas escaneadas se conservaron 8.329.380 para entrenamiento (aproximadamente 2,30B tokens) y 20.000 para validación, empaquetadas en secuencias de longitud 1024. La descontaminación contra el conjunto de validación usó 1.483 claves de posición y eliminó 79 partidas. La distribución de Elo del conjunto de entrenamiento tiene su máximo en el rango 1600–2000, por lo que la calidad de juego refleja ajedrez de club en línea y no juego magistral.

No hubo ajuste por instrucciones ni por preferencias: no se aplicó SFT ni RLHF/DPO. El estado del optimizador se ha eliminado de los checkpoints, por lo que no es posible reanudar el entrenamiento desde ellos. Los tres checkpoints del barrido mantienen arquitectura y pipeline de datos idénticos y solo cambian el presupuesto de tokens; el checkpoint `50m` es una ejecución anterior con embeddings de entrada y salida acoplados (`tie_word_embeddings: true`) y sin pérdida de validación registrada, por lo que no debe tratarse como un cuarto punto de la curva.

## Capacidades

- Predicción del siguiente movimiento en partidas de ajedrez, a nivel de token (pieza, origen, destino, bandera).
- Puntuación de probabilidad de secuencias de jugadas: permite calcular la log-verosimilitud de una partida o de un movimiento concreto dado el historial.
- Continuación de transcripciones de partidas, generando jugadas coherentes con la distribución de datos de Lichess de nivel club.
- Modelado condicionado implícitamente por el nivel de juego, ya que el entrenamiento está estratificado por Elo entre 800 y 3000.
- Manejo de notación ajedrecística completa: capturas, jaques, jaque mate, promociones (`=Q`, `=R`, `=B`, `=N`), enroques (`O-O`, `O-O-O`) y captura al paso (`e.p.`), gracias a las banderas del tokenizador.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso explícito.
- No es multilingüe ni procesa texto: su vocabulario de 82 tokens es exclusivamente ajedrecístico.
- No dispone de modo de pensamiento (thinking mode), visión, audio ni capacidades multimodales.

## Casos de uso

- Análisis de partidas y detección de errores: calculando la log-verosimilitud de cada movimiento bajo el modelo se pueden identificar jugadas improbables o fuera de la distribución esperada para un Elo dado, útil en herramientas de revisión post-partida.
- Modelo base para investigación en leyes de escalado: los tres checkpoints del barrido permiten reproducir curvas pérdida-tokens a tamaño fijo y validar recetas de preentrenamiento sin depender de infraestructura costosa.
- Punto de partida para ajuste fino con SFT o RL: al ser un modelo preentrenado y ligero, es adecuado para experimentos de alineación orientados a predecir movimientos humanos o a jugar con estilos concretos.
- Generación de datos sintéticos de ajedrez: se pueden muestrear transcripciones completas para aumentar datasets de entrenamiento de otros modelos, siempre validando la legalidad de cada movimiento con `python-chess`.
- Herramienta educativa de ajedrez de club: dado que la distribución de entrenamiento se concentra en Elo 1600–2000, el modelo puede ilustrar cómo juega un jugador medio en posiciones típicas, sirviendo de apoyo en materiales didácticos.
- Recomendación de jugadas con validación externa: integrado en una tubería que filtre solo movimientos legales mediante `python-chess`, puede ofrecer sugerencias para niveles intermedios, aunque no sustituye a un motor.
- Análisis de estilo por rango de Elo: comparando la verosimilitud de una misma posición bajo distintos regímenes de Elo del dataset se pueden estudiar diferencias de estilo entre niveles.
- Estudio de arquitecturas eficientes en dominios de gramática cerrada: sirve como referencia para comparar GQA, RoPE y SwiGLU frente a alternativas en tareas con vocabulario muy reducido.

## Benchmarks y rendimiento

El único dato cuantitativo publicado son las pérdidas de validación (entropía cruzada a nivel de token sobre un split retenido de 20.000 partidas, 5.338 secuencias de longitud 1024). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a este dominio.

| Checkpoint | Tokens vistos | Pasos de optimización | Pérdida de validación | Embeddings |
|---|---:|---:|---:|---|
| 50m_0.69b | 686.817.280 | 1.310 | 0,5319 | desacoplados |
| 50m_1.1b | 1.149.763.584 | 2.193 | 0,4841 | desacoplados |
| 50m_2.3b | 2.289.565.696 | 4.367 | 0,4537 | desacoplados |
| 50m | 2.000.158.720 | 3.815 | no registrada | acoplados |

Las cifras fueron reproducidas desde los pesos liberados sobre una submuestra de 128 secuencias del split de validación, obteniendo 0,5203 / 0,4844 / 0,4533, consistentes con los valores registrados dentro del ruido de muestreo. La pérdida cae de forma monótona al aumentar el presupuesto de tokens, de 0,5319 a 0,4537 al pasar de 0,69B a 2,29B tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 0,19 GB por checkpoint; sumando activaciones y overhead, menos de 1 GB en cualquier configuración razonable. En fp16 bajaría a unos 0,1 GB, aunque no se publican pesos en esa precisión.
- GPU recomendadas: cualquiera con al menos 1 GB de memoria, incluidas integradas modernas. Modelos como A100 o H100 están sobredimensionados para 47,3M de parámetros.
- Cabe en cualquier GPU de consumo: GTX 1050, GTX 1650, RTX 3060, RTX 4090, etc. También es viable en CPU, dado el tamaño reducido del modelo y de la ventana de contexto.
- Opciones de despliegue: PyTorch nativo mediante `modeling_chesslm.py` y `chess_tokenizer.py` incluidos en el repositorio, cargando los pesos con `safetensors`. No hay soporte para vLLM, llama.cpp, Ollama o TGI, ya que la arquitectura, el tokenizador y el vocabulario no textuales quedan fuera de sus convenciones.
- Dependencias: `torch`, `safetensors` y `python-chess`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay datos publicados en la información proporcionada que permitan comparar ChessLM con otros modelos de ajedrez (por ejemplo, Maia, Leela Chess Zero o Stockfish) en parámetros, contexto o rendimiento. La comparación disponible es interna, entre los propios checkpoints del repositorio:

| Checkpoint | Parámetros | Contexto | Pérdida de validación | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| 50m_0.69b | 47.285.760 | 1024 | 0,5319 | MIT | safetensors |
| 50m_1.1b | 47.285.760 | 1024 | 0,4841 | MIT | safetensors |
| 50m_2.3b | 47.285.760 | 1024 | 0,4537 | MIT | safetensors |
| 50m | 47.243.776 | 1024 | no registrada | MIT | safetensors |

El checkpoint `50m_2.3b` es el de mejor pérdida de validación del barrido y el recomendado por el autor para uso general. El checkpoint `50m` no es comparable directamente por su acoplamiento de embeddings y la ausencia de métrica registrada. Comparativas con alternativas externas: no disponible.

## Limitaciones y advertencias

- Solo preentrenado: no ha pasado por SFT ni RL. Continúa transcripciones de partidas, pero no está optimizado para elegir jugadas fuertes y no es un motor de ajedrez.
- La legalidad de los movimientos se aprende de forma estadística, no se impone. Nada restringe el muestreo a jugadas legales, por lo que hay que validar la salida con `python-chess` antes de usarla en producción.
- Entrenado con un único mes de datos de Lichess y con contexto de 1024 tokens, lo que limita la generalización temporal y estilística.
- La distribución de Elo del conjunto de entrenamiento se concentra en 1600–2000, así que el nivel de juego refleja ajedrez de club en línea y no juego de maestro.
- El estado del optimizador se ha eliminado: los checkpoints no permiten reanudar el entrenamiento.
- El vocabulario es de 82 tokens y no textual. El modelo no entiende ni genera lenguaje natural, instrucciones ni diálogo, lo que descarta su uso como asistente conversacional.
- Sesgos conocidos: no se documentan análisis de sesgo, pero la dependencia de un único mes de partidas de Lichess puede introducir sesgos de estilo, apertura y nivel de juego propios de esa muestra.
- Riesgo de alucinación: en este dominio se manifiesta como generación de movimientos ilegales o incoherentes con la posición, especialmente fuera de la distribución de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento del modelo. Conviene revisar también las condiciones de uso de los datos originales de Lichess si se redistribuyen derivados.
- Restricciones de contexto: la ventana de 1024 tokens equivale a 256 jugadas, por lo que partidas muy largas requieren truncado o deslizamiento de ventana.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/shatayumk/chesslm
- Artículo de referencia: *Understanding Reasoning from Pretraining to Post-Training*, arXiv:2607.16097 — https://arxiv.org/abs/2607.16097
- Dataset original de Lichess: `lichess_db_standard_rated_2022-01`
- Búsqueda web: no se han encontrado enlaces adicionales relevantes sobre este modelo; los resultados devueltos corresponden a organismos no relacionados con el proyecto.
