# itzPotato/arithmetic-relu-1layer-seed0

## Resumen

Este modelo es un transformer decoder-only de una sola capa, sin bias ni normalización, con MLP ReLU, entrenado exclusivamente para sumar y restar números con signo de 4 dígitos. Lo desarrolla itzPotato (Rohan Sashank Babbellapati) como parte de una familia de doce modelos —{relu, bilinear} × {1, 2} capas × semillas {0, 1, 2}— entrenados con una receta idéntica para que el tipo de MLP sea la única diferencia estructural entre ellos. Su propósito no es servir como modelo de propósito general, sino como objeto de estudio para la interpretabilidad mecanicista del aprendizaje aritmético en transformers.

Con solo 9.536 parámetros, d_model de 32, 4 cabezas de atención y una ventana de 16 tokens, el modelo resuelve la suma de 4 dígitos con una precisión de secuencia del 96,94 %, pero falla en la resta (7,26 % de precisión de secuencia), lo que demuestra que la propagación de préstamos requiere una segunda capa. El modelo se publica con el código de carga y el historial completo de entrenamiento, y está pensado para investigación reproducible en interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 1 capa, sin bias ni normalización |
| Parametros totales | 9.536 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 16 tokens (formato fijo de tarea) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea numérica con tokens de dígitos) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de una sola capa con atención de 4 cabezas (d_head=8), d_model=32 y MLP ReLU con dimensión intermedia 64. La MLP se define como W_out ReLU(W_in x), sin bias ni normalización en ninguna parte. El vocabulario tiene 13 tokens: los dígitos 0-9, el operador + (id 10), el operador - (id 11) y el símbolo = (id 12). La tarea consiste en procesar secuencias de 16 tokens con un token por dígito, operador y signo, con operandos rellenados a 4 dígitos y la respuesta a 5, precedida por un token de signo. La pérdida solo se calcula sobre los 5 dígitos de la respuesta.

El entrenamiento usa AdamW con lr 0.02 (cosine, 200 pasos de warmup), batch 1024, weight decay 0.01, grad clip 1.0 y una sola pasada sobre 5.000.000 de ejemplos. La tasa de aprendizaje se eligió mediante un barrido de seis puntos probado en ambas variantes de MLP (ReLU y bilineal), fijándose en el valor más alto en el que ambas permanecen estables, de modo que la receta compartida no favorece a ninguna variante. La semilla del modelo es 0 y la semilla de datos es 1234, idéntica en los doce modelos. El mejor paso es el 4883 de 4883.

## Capacidades

- Suma de números con signo de 4 dígitos: precisión de secuencia del 96,94 % y precisión por dígito del 99,36 % en validación.
- Resta de números con signo de 4 dígitos: no resuelta (7,26 % de precisión de secuencia), lo que evidencia la dificultad de la propagación de préstamos en una sola capa.
- Formato de tarea fijo: un token por dígito, operador y signo, con relleno a 4 dígitos para operandos y 5 para la respuesta.
- Pérdida restringida a los 5 dígitos de la respuesta; el token de signo se fuerza como entrada y no recibe gradiente (precisión de signo ~0 por construcción).
- No es un modelo de propósito general: no genera texto libre, no soporta tool calling, ni agentes, ni razonamiento multi-paso fuera de la tarea aritmética.
- Capacidades multilingües: no aplicable; el vocabulario es puramente numérico y de operadores.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el modelo es lo suficientemente pequeño para analizar completamente sus pesos y activaciones, permitiendo estudiar cómo una sola capa de atención y MLP representa la suma y la resta.
- Estudio de la propagación de acarreos y préstamos: la comparación entre la suma (resuelta) y la resta (no resuelta) permite aislar el mecanismo de préstamo y demostrar que requiere profundidad adicional.
- Comparación de arquitecturas de MLP: al existir variantes bilineales con la misma receta de entrenamiento, el modelo permite aislar el efecto del tipo de MLP (ReLU vs. bilineal) sobre el rendimiento aritmético.
- Reproducibilidad en investigación: con la semilla de datos fija (1234) y la receta completa documentada, otros investigadores pueden reproducir exactamente el entrenamiento y verificar los resultados.
- Análisis de curvas de entrenamiento: el archivo history.json incluye la curva completa de entrenamiento y el rastreo de selección de checkpoints, útil para estudiar la dinámica de aprendizaje.
- Validación de técnicas de análisis de atención: al ser un modelo de una sola capa con 4 cabezas, es un banco de pruebas ideal para visualizar y atribuir patrones de atención en tareas aritméticas.

## Benchmarks y rendimiento

Resultados publicados en la model card (split de validación y test):

| Métrica | Validación | Test |
|---|---:|---:|
| Loss | 0,3238 | 0,3238 |
| Precisión por dígito | 0,8155 | 0,8160 |
| Precisión de secuencia | 0,5210 | 0,5237 |
| Precisión de signo | 0,0000 | 0,0000 |

Precisión por operador (validación):

| Operador | Precisión de secuencia | Precisión por dígito | Loss |
|---|---|---:|---:|
| Suma | 0,9694 | 0,9936 | 0,0145 |
| Resta | 0,0726 | 0,6375 | 0,6332 |

La precisión de signo es ~0 por construcción, no por un fallo: la pérdida solo cubre los 5 dígitos de la respuesta y la posición del signo no recibe gradiente. El signo se fuerza como entrada, por lo que la precisión por dígito no se ve afectada.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; el modelo tiene 9.536 parámetros (menos de 40 KB en FP32), por lo que cabe en cualquier CPU sin GPU.
- GPU recomendadas: ninguna; cualquier CPU moderna ejecuta inferencia en microsegundos.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con más de 1 GB de VRAM (aunque no es necesaria).
- Opciones de despliegue: carga directa con PyTorch mediante la clase PretrainTransformer del repositorio; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos oficialmente; con un tamaño de 9.536 parámetros, la inferencia es esencialmente instantánea en cualquier hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas | MLP | Tarea | Precisión de secuencia |
|---|---|---|---|---|---|
| arithmetic-relu-1layer-seed0 (este) | 9.536 | 1 | ReLU | Suma y resta 4 dígitos | 52,10 % (validación) |
| Variante bilineal 1 capa (misma familia) | no disponible | 1 | Bilineal | Suma y resta 4 dígitos | no disponible |
| Variante 2 capas (misma familia) | no disponible | 2 | ReLU o bilineal | Suma y resta 4 dígitos | resuelve ambas (según model card) |
| melephant/1-layer-addition-v2 | no disponible | 1 | no disponible | Solo suma | no disponible |

La model card indica que los modelos de 2 capas resuelven tanto la suma como la resta, y que la segunda capa es la que aporta la propagación de préstamos. El modelo de referencia melephant/1-layer-addition-v2 resultó ser solo de suma, con un vocabulario de 13 tokens sin operador de resta ni token de signo de respuesta, por lo que no es directamente comparable en la tarea de resta.

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto, no razona fuera de la tarea aritmética de 4 dígitos con formato fijo.
- No resuelve la resta: la precisión de secuencia en resta es del 7,26 %, lo que lo hace inadecuado para cualquier uso práctico de aritmética con signo.
- Precisión de signo nula por construcción: el token de signo de la respuesta no recibe gradiente, por lo que el modelo no aprende a predecir el signo; esto es intencional, pero puede confundir a quien lo use sin leer la documentación.
- Vocabulario propietario: los ids de token (0-9 para dígitos, 10=+, 11=-, 12==) son numeración propia del proyecto y no coinciden con el modelo de referencia melephant/1-layer-addition-v2; no se pueden mezclar activaciones entre modelos sin verificar los ids.
- Licencia no disponible: no se especifica licencia, por lo que el uso comercial y la redistribución son inciertos.
- Idiomas no disponibles: la documentación no declara soporte de idiomas; la tarea es puramente numérica.
- Riesgo de alucinación: no aplicable en el sentido de modelos de lenguaje, pero el modelo produce respuestas incorrectas sistemáticamente en restas, lo que lo hace inadecuado para producción.
- Sesgos conocidos: no se han documentado sesgos; el conjunto de datos es sintético y equilibrado por construcción, aunque la resta está claramente infrarrepresentada en el aprendizaje efectivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/arithmetic-relu-1layer-seed0
- Perfil del autor en HuggingFace: https://huggingface.co/itzPotato
- Perfil del autor en GitHub: https://github.com/itzPotato
- Modelo relacionado de la misma familia: https://huggingface.co/itzPotato/bilinear-attn-addition-carry-1layer
