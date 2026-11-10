# Lahusa/lanzenbrecher-state-value-net

## Resumen

Lanzenbrecher State Value Net es una red neuronal ligera en formato ONNX desarrollada por Lahusa como componente del simulador y banco de pruebas de agentes de IA Lanzenbrecher, centrado en el juego de mesa CATAN (4 jugadores, juego base). El modelo recibe un vector de características de 1965 dimensiones que codifica el estado completo de la partida (mapa, intersecciones, carreteras, recursos, cartas de desarrollo, producción esperada, puertos, márgenes de carrera, etc.) y devuelve cuatro logits, uno por jugador, a partir de los cuales se obtiene la probabilidad de victoria de cada uno mediante softmax. La versión actual (identificador de ejecución n0e4owde) añade además una cabeza de política sobre los movimientos legales.

No es un modelo de lenguaje: es una red de valor y política específica de dominio, entrenada para evaluar posiciones de CATAN y guiar la búsqueda en agentes MCTS (mediante PUCT) y puntuar movimientos en agentes codiciosos. Su relevancia es la de un artefacto de investigación reproducible: pesos ONNX con hashes SHA-256 publicados, versionado por identificador de ejecución y acoplado a un esquema de vectorización de estado documentado en el repositorio del simulador.

El repositorio ocupa 0,4 GB e incluye nueve ficheros ONNX correspondientes a distintas ejecuciones de entrenamiento y a distintas versiones del esquema de características (1965, 1764, 1609 y 1608 dimensiones). La licencia es "all rights reserved", lo que restringe sustancialmente su reutilización fuera del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward en ONNX con cabeza de valor (4 logits por jugador) y, en algunas versiones, cabeza de política con embeddings de tokens de movimiento; topología interna y número de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de vector fijo de 1965, 1764, 1609 o 1608 características según la versión |
| Tipos de cuantizacion | no disponible; pesos exportados en ONNX (float32 en la interfaz de entrada y salida; la salida de política `policy_query` es float16) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | all-rights-reserved (license: other) |
| Formato de pesos | ONNX (`.onnx`), con hashes SHA-256 publicados por fichero |

## Arquitectura y entrenamiento

Se trata de una red neuronal de evaluación de estados para CATAN, no de un transformer ni de un modelo de lenguaje. La entrada es un vector de características sin escalar producido por `StateVectorizer` en Lanzenbrecher: 1608 características base (ajustes, estado de turno, ladrón, 49 losetas con one-hot de tipo y ficha numérica normalizada, 54 intersecciones con edificio y propietario, 72 aristas con carretera y propietario, banco de recursos y cartas de desarrollo, y cuatro bloques de jugador de 35 características), más 156 características derivadas por jugador (producción esperada por recurso descontando la loseta bloqueada por el ladrón, tasas de intercambio por puerto, viabilidad y coste de cada construcción, y márgenes de carrera), más 180 características de puertos costeros en el esquema de 1965 dimensiones.

La salida principal son cuatro logits, uno por índice de jugador (sin rotar al jugador activo), y la probabilidad de victoria se obtiene con softmax sobre esos cuatro valores. Las versiones n0e4owde, kt5fwcz5, mhn8ihqb, 02l97say y zjahe050 añaden una salida `placements` de forma `[batch, 4, 4]` con los logits de terminar en primera a cuarta posición por jugador. Las versiones n0e4owde, kt5fwcz5 y mhn8ihqb incorporan además la cabeza de política: cada movimiento se codifica como un token de tipo de movimiento más tokens de parámetros de un vocabulario compartido de 213 tokens (19 tipos de movimiento, 54 intersecciones, 72 aristas, 49 losetas, el jugador robado relativo al ejecutor y recursos dados, recibidos y descartados), y el logit de un movimiento es el producto de la consulta de su tipo (`policy_query`, float16, `[batch, 19*64]`) por la suma ponderada de las embeddings de sus tokens (`policy_embeddings`, float32, `[213, 64]`). Los movimientos con resultado aleatorio (tirada de dados, compra de carta de desarrollo, ladrón con su robo) se tratan como un único movimiento cada uno.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el algoritmo exacto de optimización ni si se emplearon técnicas de refuerzo o ajuste preferencial. La normalización de entradas está integrada en el modelo para las versiones n0e4owde, kt5fwcz5, mhn8ihqb, 02l97say, zjahe050, xnebmrjf y sl159q7y. Cada fichero solo funciona con el esquema de características con el que fue entrenado, lo que hace crítico fijar la versión del vectorizador (commits `049bf0e`, `677a9db`, `486ecc6` y `2671919` según la versión).

## Capacidades

- Evaluación de estados de CATAN para cuatro jugadores: probabilidad de victoria por jugador a partir de un vector de 1965 (o 1764/1609/1608) características.
- Predicción de clasificación final (`placements`) con logits de terminar primero a cuarto, en las versiones n0e4owde, kt5fwcz5, mhn8ihqb, 02l97say y zjahe050.
- Política sobre movimientos legales en las versiones n0e4owde, kt5fwcz5 y mhn8ihqb, mediante codificación de movimientos en un vocabulario de 213 tokens.
- Integración como evaluador de hojas y guía de búsqueda PUCT en agentes MCTS del simulador Lanzenbrecher.
- Puntuación de movimientos en agentes codiciosos (greedy) del mismo simulador.
- Inferencia por lotes (`batch`) mediante ONNX Runtime, con normalización interna de entradas en la mayoría de versiones.
- No soporta tool calling, function calling, razonamiento multi-paso genérico, visión, audio ni capacidades multilingües: es un modelo de dominio cerrado.

## Casos de uso

- Agentes MCTS para CATAN: el modelo se carga como evaluador de posiciones hoja y, en las versiones con política, guía la selección de nodos mediante PUCT; su coste de inferencia es bajo al ser una red feed-forward sobre un vector fijo.
- Agentes codiciosos de referencia: puntuar cada movimiento legal con la cabeza de política y seleccionar el de mayor logit, útil para construir líneas base reproducibles en experimentos de comparación de agentes.
- Investigación en aprendizaje por refuerzo aplicado a juegos de mesa: servir como red de valor congelada para estimar ventajas o como oponente fijo durante el entrenamiento de políticas nuevas.
- Análisis de posiciones y docencia: dado un estado concreto, obtener la probabilidad de victoria de cada jugador y la clasificación esperada, útil para explicar el valor estratégico de una posición.
- Evaluación de decisiones en simulaciones masivas: al ser ONNX y ejecutable con ONNX Runtime, permite puntuar lotes grandes de estados en pipelines de autojuego sin dependencia de frameworks de deep learning pesados.
- Integración en herramientas de análisis del simulador Lanzenbrecher: el modelo se carga mediante `Agents.Inference.StateValueNet`, que aplica el softmax, lo que facilita su uso en scripts de análisis y en la interfaz del simulador.
- Reproducibilidad de experimentos: los hashes SHA-256 y los identificadores de ejecución permiten fijar exactamente la versión del modelo y del esquema de características usado en un resultado publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión al no publicarse el número de parámetros; el repositorio completo ocupa 0,4 GB y los ficheros ONNX individuales son de tamaño reducido, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no disponibles; por el tamaño del artefacto, cualquier GPU con soporte de ONNX Runtime (incluidas GTX serie 10xx en adelante y RTX 4090) es suficiente. También es viable la ejecución en CPU.
- Cabe en GPU consumer: sí, con margen amplio; el cuello de botella esperado es el coste de construir el vector de características en el simulador, no la inferencia de la red.
- Opciones de despliegue: ONNX Runtime (Python y C#), integración nativa en Lanzenbrecher mediante `Agents.Inference.StateValueNet`; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lanzenbrecher State Value Net (n0e4owde) | Red de valor y política para CATAN en ONNX | no disponible | Vector de 1965 características | all-rights-reserved | Hugging Face, 9 ficheros ONNX |
| Versiones previas del mismo modelo (kt5fwcz5, mhn8ihqb, 02l97say, zjahe050, xnebmrjf, sl159q7y, j1fvwmta, tvtaun4u) | Red de valor (algunas con política) para CATAN en ONNX | no disponible | Vectores de 1965, 1764, 1609 o 1608 características | all-rights-reserved | Hugging Face |
| Otros modelos de valor para CATAN | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros para evaluación de estados de CATAN en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio cerrado: solo es válido para el juego base de CATAN a cuatro jugadores tal como lo codifica `StateVectorizer`; no generaliza a otras variantes, expansiones ni a otros juegos.
- Acoplamiento estricto al esquema de características: cada fichero ONNX solo funciona con la versión exacta del vectorizador con la que fue entrenado (commits `049bf0e`, `677a9db`, `486ecc6`, `2671919`); usar una versión distinta produce resultados inválidos sin aviso.
- Licencia all-rights-reserved: no se concede permiso explícito de uso comercial, modificación ni redistribución; cualquier uso en producción requiere contacto con el autor.
- Riesgo de calibración y alucinación en sentido figurado: las probabilidades de victoria son estimaciones de la red y pueden estar mal calibradas en posiciones atípicas o poco representadas en el entrenamiento; no deben interpretarse como probabilidades exactas.
- Sesgos de entrenamiento: al entrenarse sobre partidas generadas por los propios agentes del simulador, puede heredar sesgos estratégicos de esos agentes y evaluar peor estilos de juego distintos.
- Sin información publicada sobre datos de entrenamiento, número de parámetros ni métricas de validación, lo que dificulta auditar su calidad y compararlo con alternativas.
- La cabeza de política solo está presente en tres de los nueve ficheros (n0e4owde, kt5fwcz5, mhn8ihqb); el resto no puede guiar la búsqueda y solo sirve como evaluador de valor.
- Los movimientos con resultado aleatorio se codifican como un único movimiento, de modo que la política no modela la distribución sobre sus resultados.
- No apto para tareas de lenguaje natural, visión, audio ni generación de texto pese a estar alojado en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lahusa/lanzenbrecher-state-value-net
- Repositorio Lanzenbrecher: https://github.com/OfficialLahusa/Lanzenbrecher
- Fichero de vectorización en C#: `Agents/StateVectorizer.cs` en el repositorio Lanzenbrecher
- Fichero de vectorización en Python: `DatasetProcessing/state_to_vector.py` en el repositorio Lanzenbrecher
- Codificación de acciones: `Agents/Inference/ActionEncoding.cs` en el repositorio Lanzenbrecher (desde el commit `3f0b807`)
- Carga del modelo en el simulador: `Agents.Inference.StateValueNet` en el repositorio Lanzenbrecher
- Licencia: fichero `LICENSE` del repositorio de Hugging Face
