# itzPotato/arithmetic-relu-2layer-seed0

## Resumen

El modelo `itzPotato/arithmetic-relu-2layer-seed0` es un transformer decoder-only de 2 capas, sin bias ni normalización, diseñado exclusivamente para investigación en interpretabilidad mecánica. Desarrollado por itzPotato (Rohan Sashank Babbellapati), forma parte de una familia de doce modelos que varían en tipo de MLP (ReLU o bilineal), número de capas (1 o 2) y semilla, todos entrenados con una receta idéntica para aislar el efecto de la arquitectura del MLP en la resolución de tareas aritméticas.

El modelo resuelve sumas y restas de números de 4 dígitos con signo, representados token a token, y alcanza una precisión por secuencia del 99,72 % en el conjunto de test. Su relevancia radica en ser un banco de pruebas controlado para estudiar cómo los transformers aprenden algoritmos de propagación de acarreo y préstamo, y cómo la elección del MLP afecta a ese aprendizaje. Con solo 17.728 parámetros, es un modelo mínimo pero suficientemente complejo para que sus mecanismos internos sean analizables.

La arquitectura incluye d_model=32, d_mlp=64, 4 cabezas de atención con d_head=8 y una ventana de contexto de 16 tokens. El entrenamiento se realizó con AdamW, una única pasada sobre 5 millones de ejemplos y una tasa de aprendizaje elegida mediante pruebas previas para no favorecer a ninguna variante de MLP. El modelo se distribuye en formato PyTorch con pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 2 capas, sin bias ni normalizacion |
| Parametros totales | 17.728 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16 tokens (tarea fija: 5 digitos + operador + 5 digitos de respuesta + signos) |
| Tipos de cuantizacion | No disponible (solo pesos en fp32, sin versiones cuantizadas publicadas) |
| Idiomas soportados | No disponible (vocabulario numerico: digitos 0-9, +, -, =; 13 tokens) |
| Licencia | No disponible |
| Formato de pesos | safetensors (carpeta de checkpoint PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 2 capas, sin capas de bias ni normalización. Cada capa tiene atención multi-cabeza con 4 cabezas de dimensión 8 y un MLP con activación ReLU de dimensión intermedia 64. La entrada es una secuencia de 16 tokens que codifica una operación aritmética: por ejemplo, `1 2 3 4 + 0 5 6 7 = + 0 1 8 0 1`, donde los operandos se rellenan con ceros a 4 dígitos y la respuesta a 5 dígitos, cada uno precedido por un token de signo. La pérdida solo se calcula sobre los 5 tokens de la respuesta (excluyendo el token de signo).

El entrenamiento usó AdamW con tasa de aprendizaje 0.02 (decaimiento coseno, 200 pasos de calentamiento), batch de 1024, weight decay 0.01, grad clip 1.0 y una sola pasada sobre 5.000.000 de ejemplos generados con una semilla fija (1234). La tasa de aprendizaje se seleccionó mediante un barrido de seis puntos que evaluó tanto la variante ReLU como la bilineal, eligiendo la mayor tasa a la que ambas permanecen estables. El modelo se entrenó con semilla 0 y el mejor paso fue el 4600 de 4883.

La principal innovación técnica es el diseño experimental: al mantener fija la receta de entrenamiento y variar únicamente el tipo de MLP (ReLU vs. bilineal) y el número de capas, se puede atribuir cualquier diferencia de comportamiento a estos factores estructurales. Los resultados muestran que los modelos de 1 capa resuelven la suma pero no la resta, mientras que los de 2 capas resuelven ambas, lo que sugiere que la segunda capa es necesaria para propagar el préstamo en la resta.

## Capacidades

- Resolución de sumas y restas de números de 4 dígitos con signo, con precisión por secuencia del 99,72 % en test.
- Generalización a datos no vistos (conjunto de test generado con la misma distribución que el entrenamiento).
- Aprendizaje de algoritmos de acarreo y préstamo en aritmética, que puede analizarse mediante técnicas de interpretabilidad mecánica.
- Tokenización específica para la tarea: un token por dígito, operador y símbolo de igualdad, con vocabulario de 13 tokens.
- No soporta generación de texto libre, tool calling, agentes ni razonamiento multilingüe; es un modelo de investigación restringido a una tarea aritmética fija.

## Casos de uso

- Estudio de mecanismos internos de transformers: permite analizar cómo se forman los circuitos de acarreo y préstamo en la atención y el MLP, mediante técnicas como activaciones, atención dirigida o intervenciones causales.
- Comparación de arquitecturas de MLP: al existir variantes bilineales y de distinto número de capas, sirve para evaluar qué tipo de MLP facilita la composición de operaciones aritméticas.
- Validación de métodos de interpretabilidad: su pequeño tamaño (17k parámetros) y tarea bien definida lo convierten en un banco de pruebas ideal para algoritmos de localización de circuitos, atribución de importancia o análisis de subespacios.
- Desarrollo de métricas de generalización en tareas sintéticas: permite estudiar cómo la precisión por dígito y por secuencia se relacionan con la estructura del problema.
- Investigación sobre el papel de la profundidad: comparando con el modelo de 1 capa, se puede aislar qué habilidades emergen al añadir una segunda capa.
- Educación en interpretabilidad: sirve como ejemplo didáctico para demostrar técnicas de análisis de modelos pequeños en un entorno controlado.

## Benchmarks y rendimiento

Los resultados publicados en la model card son los siguientes:

| Split | Loss | Precisión por dígito | Precisión por secuencia | Precisión de signo |
|---|---:|---:|---:|---:|
| Validación | 0.0035 | 0.9988 | 0.9943 | 0.0000 |
| Test | 0.0021 | 0.9994 | 0.9972 | 0.0000 |

Desglose por operador (split de test):

| Operador | Precisión por secuencia | Precisión por dígito | Loss |
|---|---:|---:|---:|
| Suma | 0.9948 | 0.9990 | 0.0031 |
| Resta | 0.9938 | 0.9987 | 0.0040 |

La precisión de signo es cero por construcción: el token de signo no recibe gradiente porque la pérdida solo cubre los cinco dígitos de la respuesta. El signo se proporciona como entrada forzada, por lo que no afecta a la precisión de los dígitos. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU sin GPU: el modelo tiene solo 17.728 parámetros, por lo que cabe en cualquier procesador moderno y se ejecuta en milisegundos.
- VRAM: despreciable; incluso en GPU, el uso de memoria es inferior a 1 MB.
- GPUs recomendadas: cualquiera, aunque no se necesita ninguna para inferencia; para entrenamiento se usó una GPU estándar (no especificada).
- Opciones de despliegue: al ser un checkpoint PyTorch, se carga directamente con la clase `PretrainTransformer` del repositorio del autor; no es compatible con vLLM, llama.cpp u Ollama por su naturaleza de investigación.
- Latencia y throughput: no se han publicado mediciones, pero dada la escala, la inferencia es esencialmente instantánea.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea y con la misma configuración. El autor menciona un modelo de referencia (`melephant/1-layer-addition-v2`) que resultó no ser compatible porque solo maneja suma y tiene un vocabulario sin token de resta ni signo de respuesta. La familia de doce modelos del propio autor (variantes ReLU/bilineal, 1/2 capas, semillas 0-2) constituye la comparativa más relevante, pero no se han publicado resultados agregados en la información proporcionada.

## Limitaciones y advertencias

- La precisión de signo es nula por construcción: el modelo no aprende a predecir el signo de la respuesta, ya que la pérdida no cubre ese token. Esto no es un fallo, sino una decisión de diseño, pero hay que tenerlo en cuenta al interpretar los resultados.
- El modelo solo maneja sumas y restas de números de 4 dígitos con signo; no es extrapolable a otras longitudes ni a otras operaciones.
- La tokenización es propia del proyecto y no coincide con la de modelos de referencia, por lo que no se pueden combinar activaciones con otros modelos sin una verificación previa de los ids de token.
- No se ha publicado información sobre sesgos, alucinaciones o riesgos de uso indebido, pero al ser un modelo de investigación sintético, no tiene aplicaciones en producción.
- La licencia no está especificada, por lo que se debe contactar con el autor antes de cualquier uso comercial o redistribución.
- El modelo no tiene soporte para generación de texto, idiomas naturales ni tareas de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itzPotato/arithmetic-relu-2layer-seed0
- Perfil del autor en Hugging Face: https://huggingface.co/itzPotato
- Modelo relacionado (referencia no compatible): https://huggingface.co/melephant/1-layer-addition-v2
- Repositorio del autor (se infiere de la model card, no verificado): no disponible en la información proporcionada.
