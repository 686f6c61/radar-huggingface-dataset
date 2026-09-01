# itzPotato/arithmetic-relu-2layer-seed2

## Resumen

El modelo `itzPotato/arithmetic-relu-2layer-seed2` es un transformer decoder-only de 2 capas, sin bias ni normalización, con MLP ReLU, entrenado exclusivamente para resolver sumas y restas de números de 4 dígitos con signo. Forma parte de una familia de doce modelos creados por itzPotato (Rohan Sashank Babbellapati) con el objetivo de estudiar la interpretabilidad de mecanismos aritméticos internos, variando el tipo de MLP (ReLU o bilineal), el número de capas (1 o 2) y la semilla de inicialización (0, 1, 2). Con solo 17.728 parámetros, es un modelo de juguete diseñado para investigación, no para tareas de propósito general.

Su relevancia radica en que permite aislar el efecto de la arquitectura (MLP ReLU frente a bilineal) y de la profundidad sobre la capacidad de resolver un problema aritmético concreto. Los resultados publicados muestran que los modelos de 2 capas resuelven tanto suma como resta, mientras que los de 1 capa solo resuelven la suma; la segunda capa es necesaria para la propagación del "borrow" en la resta. El modelo se distribuye con pesos en formato safetensors y código de carga en Python, aunque la licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 2 capas, sin bias ni norm, MLP ReLU |
| Parametros totales | 17.728 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Fija: 16 tokens (secuencia de entrada) |
| Tipos de cuantizacion | No disponible (pesos en precisión original, probablemente fp32) |
| Idiomas soportados | No aplica (trabaja con dígitos y operadores, no lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 2 capas con d_model=32, d_mlp=64, 4 cabezas de atención con d_head=8, y sin capas de bias ni normalización. La MLP ReLU se define como `W_out ReLU(W_in x)`. La tokenización es específica del proyecto: un token por dígito, operador y signo igual; los operandos se rellenan a 4 dígitos y la respuesta a 5, precedida de un token de signo. El vocabulario tiene 13 tokens (dígitos 0-9, '+', '-', '='), con ids propios que no coinciden con otros modelos de referencia.

El entrenamiento se realizó con AdamW (lr 0.02 con decaimiento coseno y 200 pasos de warmup), batch de 1024, weight decay 0.01, grad clip 1.0, y una sola pasada sobre 5.000.000 de ejemplos. La tasa de aprendizaje se seleccionó mediante una prueba con seis puntos en ambas variantes de MLP, eligiendo la más alta que mantuviera estabilidad en ambas. La semilla del modelo es 2 y la semilla de datos es 1234, idéntica para los doce modelos. El mejor paso de entrenamiento fue el 4883 de 4883.

## Capacidades

- Resolución de sumas y restas de números de 4 dígitos con signo, en formato tokenizado específico (16 tokens de entrada, 5 dígitos de respuesta).
- Precisión de secuencia (todos los 5 dígitos correctos) del 99,83% en validación y test.
- Precisión por dígito del 99,97% en ambos conjuntos.
- Precisión de signo del 0% por construcción: el loss solo cubre los cinco dígitos de la respuesta, no el token de signo, que se proporciona como entrada forzada.
- Mejor rendimiento en suma (precisión de secuencia 99,88%) que en resta (99,78%), aunque ambas son muy altas.
- No dispone de tool calling, capacidades de agente, ni soporte multilingüe.

## Casos de uso

- Investigación en interpretabilidad de transformers: permite estudiar cómo una red pequeña aprende a realizar operaciones aritméticas con carry y borrow, y cómo la profundidad adicional habilita la propagación del borrow en la resta.
- Comparación de arquitecturas de MLP: al ser parte de una familia con variantes ReLU y bilineal, sirve para aislar el efecto del tipo de MLP en la capacidad de resolver tareas aritméticas.
- Análisis de mecanismos internos de atención: con solo 4 cabezas y 2 capas, es factible inspeccionar los patrones de atención y las representaciones intermedias para identificar circuitos responsables del cálculo.
- Validación de técnicas de probing y análisis de activaciones: su tamaño reducido y su tarea bien definida lo convierten en un banco de pruebas ideal para métodos de interpretabilidad.
- Estudio de generalización en tareas sintéticas: permite probar cómo el modelo maneja distribuciones de datos fuera del rango de entrenamiento, aunque la model card no reporta experimentos de este tipo.
- Educación y divulgación: como ejemplo didáctico de un transformer entrenado desde cero para una tarea concreta, con código de carga disponible en Python.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en validación y test:

| Split | Loss | Digit acc | Seq acc | Sign acc |
|---|---|---|---:|---:|
| Validation | 0.0009 | 0.9997 | 0.9983 | 0.0000 |
| Test | 0.0009 | 0.9997 | 0.9983 | 0.0000 |

Precisión por operador:

| Operador | Seq acc | Digit acc | Loss |
|---|---|---:|---:|
| Suma | 0.9988 | 0.9998 | 0.0005 |
| Resta | 0.9978 | 0.9996 | 0.0013 |

La precisión de signo es 0 por diseño, ya que el loss no cubre el token de signo. No se han publicado otros benchmarks (MMLU, HumanEval, etc.) porque el modelo no está diseñado para tareas de lenguaje general.

## Requisitos de hardware

- Inferencia en CPU: suficiente, el modelo tiene solo 17.728 parámetros (aproximadamente 70 KB en fp32).
- VRAM: no se requiere GPU; cualquier CPU moderna puede ejecutar la inferencia en microsegundos.
- GPUs recomendadas: ninguna en particular; si se quiere usar GPU, cualquier modelo con al menos 1 GB de VRAM es más que suficiente.
- Opciones de despliegue: no es compatible con frameworks de inferencia estándar (vLLM, llama.cpp, Ollama) porque no es un LLM conversacional; se carga mediante el código Python de la clase `PretrainTransformer` del repositorio del autor.
- Latencia y throughput: no se han publicado mediciones, pero por el tamaño del modelo se espera una latencia inferior a 1 ms por ejemplo en CPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de los otros modelos de la familia (variantes bilineal, 1 capa, otras semillas) en la información proporcionada. La model card solo indica que los modelos de 1 capa resuelven la suma pero no la resta, mientras que los de 2 capas resuelven ambas. No hay modelos comparables de otros autores con la misma tarea y arquitectura en la información disponible.

| Modelo | Capas | MLP | Parámetros | Suma (seq acc) | Resta (seq acc) |
|---|---|---|---|---|---|
| arithmetic-relu-2layer-seed2 (este) | 2 | ReLU | 17.728 | 0.9988 | 0.9978 |
| Variantes 1 capa (relu o bilinear) | 1 | ReLU o bilineal | no disponible | resuelven suma | no resuelven resta |
| Variantes bilineal 2 capas | 2 | bilineal | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Precisión de signo nula por construcción: el loss no cubre el token de signo, por lo que el modelo no aprende a predecir el signo de la respuesta. Esto no es un bug, pero limita su uso si se necesita predicción completa de la respuesta.
- Tokenización propia: los ids de tokens no coinciden con los de otros modelos de referencia (p. ej., `melephant/1-layer-addition-v2`), por lo que no se pueden combinar activaciones con otros modelos sin reasignar los ids.
- Modelo de juguete: no es adecuado para tareas de procesamiento de lenguaje natural, generación de texto, código o razonamiento general.
- Sin licencia especificada: no se indica bajo qué términos se distribuye el modelo, lo que puede limitar su uso en proyectos comerciales o derivados.
- Sin datos de sesgos ni alucinaciones: al ser un modelo sintético con una tarea cerrada, los riesgos de sesgo lingüístico o alucinación no aplican, pero no hay información sobre robustez ante entradas fuera de distribución.
- La model card no reporta experimentos de generalización a números de más dígitos o con operandos de distinta longitud.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/arithmetic-relu-2layer-seed2
- Perfil del autor: https://huggingface.co/itzPotato/models
- Otros modelos del autor (referencia): https://huggingface.co/itzPotato/bilinear-attn-addition-carry-2layer
