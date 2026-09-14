# avewright/endgame-model

## Resumen

`avewright/endgame-model` es un modelo de política para ajedrez desarrollado por el usuario avewright y publicado en HuggingFace. Se trata de un especialista en finales: parte de la arquitectura "squares64" de 99 M de parámetros del modelo hermano `avewright/chess-transformer-100m-squares64` y se afina sobre posiciones de menos de 14 piezas, con el objetivo de predecir el mejor primer movimiento como clasificación one-hot.

El modelo no es un modelo de lenguaje: es un transformer con componentes recurrentes (etiquetas `transformer` y `recurrent`) cuya salida es una política sobre movimientos legales. Su relevancia es acotada y muy específica: sirve como prior rápido en posiciones de final, un terreno donde los motores clásicos y las tablebases Syzygy dominan pero donde interesa estudiar aproximaciones neuronales.

El checkpoint publicado corresponde al paso 4500 del fine-tuning de finales, con pérdida de entrenamiento de ~1,4738 y entropía cruzada ("hard CE") de ~1,2928 sobre un conjunto de validación congelado. El repositorio ocupa 0,8 GB y no registra descargas ni interacciones, por lo que se trata de una publicación reciente y sin validación externa por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con componentes recurrentes, familia "squares64" (topología exacta no disponible) |
| Parametros totales | ~99 M (la model card indica "99M"; el modelo base se denomina `chess-transformer-100m`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la entrada se estructura sobre las 64 casillas del tablero) |
| Tipos de cuantizacion | no disponible; los checkpoints se distribuyen en el formato y precisión de entrenamiento |
| Idiomas soportados | no disponible; modelo específico de ajedrez, sin procesamiento de lenguaje natural |
| Licencia | MIT |
| Formato de pesos | PyTorch (`latest.pt`, `step_004500.pt`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es la misma que la del modelo público `avewright/chess-transformer-100m-squares64`: un transformer de 99 M de parámetros con componentes recurrentes, denominado internamente "squares64". La model card no detalla el número de capas, dimensiones, cabezas de atención ni el mecanismo recurrente concreto, por lo que estos datos figuran como no disponibles. La representación de entrada se apoya en las 64 casillas y el modelo produce una política sobre movimientos.

El entrenamiento se realizó por *warm start*: se cargaron únicamente los pesos del `latest.pt` público de 99 M y después se reanudó el entrenamiento completo sobre datos de finales. El conjunto de datos procede de `Lichess/chess-position-evaluations` a través de `avewright/lichess-endgame-bestline`, restringido a posiciones con menos de 14 piezas y etiquetado como *one-hot* del mejor primer movimiento (`soft_alpha=0`, PV1). El reparto de datos es por hash de posición con proporción 80/20 (semilla 276) y validación congelada estratificada por piezas de 8192 posiciones. El optimizador es Polar-NorMuon con tamaño de lote 528, y el mejor checkpoint en disco es el paso 4500. No se documenta uso de RLHF ni DPO, algo esperable en un modelo de política y no de lenguaje.

## Capacidades

- Predicción de política (policy) sobre movimientos en posiciones de ajedrez con menos de 14 piezas, entrenada como clasificación one-hot del mejor primer movimiento.
- Evaluación implícita de la calidad posicional en finales, derivada de la distribución de probabilidad sobre movimientos.
- Funcionamiento como prior para búsquedas tipo MCTS o alpha-beta en fases finales, dado que devuelve una distribución sobre movimientos candidatos.
- Especialización en el rango de piezas 2 a 13, según la configuración de entrenamiento.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso explícito.
- No dispone de capacidades multilingües ni de generación de texto: no procesa lenguaje natural.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Análisis de finales en herramientas de ajedrez: el modelo puede aportar una política rápida sobre el mejor movimiento en posiciones de menos de 14 piezas, complementando el análisis de un motor clásico en ramas donde la búsqueda profunda es costosa.
- Entrenamiento de jugadores: generación de ejercicios de finales con una recomendación de movimiento candidata, útil para practicar patrones de conversión de ventajas.
- Generación de datos y destilación: uso de la política como etiquetador automático de posiciones de final para crear datasets adicionales o para inicializar políticas en pipelines de aprendizaje por refuerzo.
- Investigación en aprendizaje automático aplicado a juegos: sirve como punto de partida reproducible (99 M de parámetros, MIT) para estudiar fine-tuning especializado frente al modelo generalista del mismo autor.
- Complemento a tablebases Syzygy: en posiciones fuera de la cobertura exacta de las tablebases, el modelo ofrece una aproximación neuronal con coste de inferencia muy bajo, aunque sin garantía de optimalidad.
- Filtrado y curación de datasets ajedrecísticos: dado que devuelve una distribución sobre movimientos, puede emplearse para puntuar o descartar posiciones anómalas en corpus de finales.
- Evaluación interna de posiciones en pipelines de análisis por lotes: al ser un modelo de 99 M, permite procesar grandes volúmenes de posiciones en GPU de gama media o incluso en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no son aplicables a un modelo de política de ajedrez. Los únicos datos numéricos publicados por el autor son métricas de entrenamiento y validación:

| Metrica | Valor |
|---|---|
| Train loss (paso 4500) | ~1,4738 |
| Frozen holdout hard CE | ~1,2928 |
| Paso del checkpoint publicado | 4500 |
| Semilla del split | 276 |
| Tamano de lote | 528 |

Estas cifras corresponden a entropía cruzada sobre movimientos y no son comparables con métricas de fuerza de juego (Elo) ni con evaluaciones de motores. No se ha publicado ningún resultado de fuerza de juego.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,4 GB para los pesos en fp32 (99 M de parámetros) y unos 0,2 GB en fp16/bf16; con activaciones y lotes pequeños, el consumo típico se sitúa por debajo de 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria sirve; por ejemplo GTX 1650, RTX 3060, RTX 4090, y también A100 o H100 si se prioriza el throughput en lotes grandes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna, e incluso en CPU para inferencia puntual o por lotes moderados.
- Opciones de despliegue: PyTorch (los checkpoints son archivos `.pt` con `model_config.json`); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje. La exportación a TorchScript u ONNX no está documentada.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 99 M, la latencia esperada por posición es del orden de milisegundos en GPU, pero no se ha publicado ninguna medición.

## Comparativa con modelos similares

Los únicos comparadores mencionados explícitamente en la información disponible son otros artefactos del mismo autor y las tablebases Syzygy, citadas por el propio autor como referencia distinta ("Syzygy expert"). No hay datos comparativos de rendimiento.

| Modelo | Parametros | Contexto / alcance | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `avewright/endgame-model` | ~99 M | Finales con menos de 14 piezas | Train loss ~1,4738; hard CE ~1,2928 | MIT | HuggingFace (0 descargas) |
| `avewright/chess-transformer-100m-squares64` | ~99 M (100 M nominales) | Modelo base generalista | no disponible | no disponible en la informacion | HuggingFace |
| Tablebases Syzygy (referencia del autor) | no aplica | Finales de hasta 7 piezas | Solución exacta (no aproximada) | no disponible en la informacion | Herramienta externa |
| Expertos en puzzles del mismo autor (referencia del autor) | no disponible | Problemas de mate | no disponible | no disponible | HuggingFace |

No se dispone de datos sobre otros modelos neuronales de ajedrez comparables dentro de la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio restringido: solo ajedrez y, además, solo finales con menos de 14 piezas (rango de piezas 2 a 13 en el entrenamiento). Fuera de ese rango no debe esperarse un comportamiento válido.
- No es un modelo de lenguaje: no genera texto, no responde a instrucciones y no soporta idiomas.
- No sustituye a las tablebases Syzygy: estas dan resultados exactos, mientras que este modelo es una aproximación con pérdida de entropía cruzada de ~1,2928 sobre el conjunto de validación, lo que implica una incertidumbre considerable en la predicción.
- Sesgo potencial hacia el estilo de las posiciones de Lichess empleadas en el dataset, etiquetadas con el mejor primer movimiento en modo one-hot (`soft_alpha=0`), lo que reduce la diversidad de la señal de entrenamiento y puede concentrar la política en un subconjunto limitado de jugadas.
- Riesgo de sobreajuste al esquema de representación "squares64" y al pipeline del autor: no hay validación independiente ni métricas de fuerza de juego publicadas.
- Sin tracción verificable: 0 descargas y 0 likes, sin issues ni evaluaciones de terceros en la información disponible.
- No hay información sobre cuantizaciones soportadas, por lo que el despliegue en entornos con memoria muy limitada requeriría conversión manual.
- Licencia MIT: permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y la licencia; no impone restricciones adicionales, pero tampoco ofrece garantías.
- Las fechas de creación y actualización indicadas (13-09-2026) son atípicas y no se ha podido verificar su correspondencia con una publicación real.
- La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo: todos los enlaces recuperados trataban sobre camellos en Kazajistán y carecen de relación con esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/avewright/endgame-model
- Modelo base citado por el autor: https://huggingface.co/avewright/chess-transformer-100m-squares64
- Dataset de origen de las posiciones: https://huggingface.co/datasets/Lichess/chess-position-evaluations
- Dataset intermedio de finales: https://huggingface.co/datasets/avewright/lichess-endgame-bestline
- Dataset que el autor indica que NO corresponde a este modelo (recolección MultiPV de Stockfish 19): https://huggingface.co/datasets/avewright/endgame-dataset
- Búsqueda web: sin resultados relevantes; no se han encontrado papers, blogs, repositorios ni demos asociados al modelo.
