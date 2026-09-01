# itzPotato/arithmetic-relu-1layer-seed1

## Resumen

El modelo `arithmetic-relu-1layer-seed1`, desarrollado por itzPotato, es un transformer decoder-only de una sola capa, sin bias ni normalización, con una MLP ReLU, entrenado específicamente para resolver sumas y restas de números de cuatro dígitos con signo. Pertenece a una familia de doce modelos que varían en el tipo de MLP (ReLU o bilineal), el número de capas (1 o 2) y la semilla de inicialización, todos entrenados con una receta idéntica para aislar el efecto de la arquitectura en el aprendizaje aritmético. Con solo 9.536 parámetros, es un objeto de estudio diseñado para la investigación en interpretabilidad de transformers, no para su uso en producción.

El modelo tokeniza cada dígito, operador y símbolo como un token individual, y la pérdida se calcula únicamente sobre los cinco dígitos de la respuesta. Los resultados muestran que resuelve correctamente la suma (precisión de secuencia del 97,64 %) pero falla en la resta (precisión de secuencia del 7,16 %), lo que indica que una sola capa no es suficiente para implementar la propagación del acarreo (borrow) necesaria en la resta. Este hallazgo es relevante para comprender los mecanismos internos que los transformers desarrollan al aprender operaciones aritméticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 1 capa, sin bias ni normalización, MLP ReLU |
| Parámetros totales | 9.536 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la tarea usa secuencias de 16 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (tarea aritmética con vocabulario numérico) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de una capa con dimensiones reducidas: `d_model=32`, `d_mlp=64`, 4 cabezas de atención con `d_head=8`. No incluye capas de normalización ni términos de bias. La MLP ReLU aplica la transformación `W_out ReLU(W_in x)`. El vocabulario consta de 13 tokens: los dígitos del 0 al 9, los operadores `+` y `-`, y el símbolo `=`. La entrada se construye con un token por dígito, operador y signo, con los operandos rellenados a 4 dígitos y la respuesta a 5 dígitos, precedida por un token de signo.

El entrenamiento utiliza AdamW con una tasa de aprendizaje de 0,02 (programada con coseno y 200 pasos de warmup), tamaño de lote 1024, weight decay de 0,01 y grad clip de 1,0. Se realiza una única pasada sobre 5.000.000 de ejemplos generados con una semilla de datos fija (1234), compartida por los doce modelos de la familia. La semilla del modelo es 1. El mejor paso se registra en el paso 4600 de 4883. La pérdida solo se aplica a los cinco dígitos de la respuesta, no al token de signo, que se fuerza como entrada.

## Capacidades

- Generación de secuencias aritméticas: suma y resta de números de 4 dígitos con signo, produciendo respuestas de 5 dígitos.
- Razonamiento aritmético básico: resuelve correctamente sumas, pero muestra una precisión muy baja en restas.
- No dispone de tool calling, function calling, ni capacidades multimodales.
- No es multilingüe; su vocabulario se limita a dígitos y operadores.
- Es un modelo de investigación para interpretabilidad, no diseñado para tareas generales de lenguaje.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo una MLP ReLU de una capa implementa la suma y qué representaciones internas se forman para los dígitos y el acarreo.
- Estudio de la generalización aritmética: observar por qué la resta falla y cómo la adición de una segunda capa (en modelos hermanos) resuelve la propagación del borrow, permitiendo comparar mecanismos.
- Pruebas de intervención causal: usar técnicas de activación o parcheo de características para identificar qué neuronas o cabezas de atención son responsables de cada paso del cálculo.
- Validación de métodos de análisis de activaciones: al ser un modelo pequeño y controlado, sirve como banco de pruebas para herramientas de visualización o descomposición de features.
- Evaluación de métricas de interpretabilidad: comparar la capacidad de distintos métodos (por ejemplo, transcoders bilineales) para explicar el comportamiento del modelo.
- Desarrollo de modelos sintéticos para benchmarks de interpretabilidad: su arquitectura simple y su tarea bien definida lo convierten en un candidato ideal para generar datos de referencia.

## Benchmarks y rendimiento

Los resultados publicados en la model card son los siguientes:

| Split | Loss | Digit acc | Seq acc | Sign acc |
|---|---:|---:|---:|---:|
| Validación | 0,3792 | 0,7760 | 0,5240 | 0,0000 |
| Test | 0,3776 | 0,7771 | 0,5316 | 0,0000 |

Precisión por operador:

| Operador | Seq acc | Digit acc | Loss |
|---|---:|---:|---:|
| Suma | 0,9764 | 0,9951 | 0,0109 |
| Resta | 0,0716 | 0,5568 | 0,7476 |

La precisión del signo es 0 por construcción: la pérdida no cubre el token de signo, que se fuerza como entrada y no recibe gradiente. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: insignificante. Con 9.536 parámetros, el modelo ocupa aproximadamente 38 KB en float32 o 19 KB en float16, muy por debajo de cualquier límite práctico.
- GPU recomendada: ninguna en particular; el modelo puede ejecutarse en CPU sin problemas, incluso en entornos con recursos mínimos.
- En consumer GPU: sí, cabe en cualquier GPU, aunque no es necesario usarla.
- Opciones de despliegue: Python con PyTorch, cargando los pesos desde safetensors. No se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: al ser un modelo minúsculo, la inferencia es prácticamente instantánea, aunque no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. El autor menciona un modelo de referencia (`melephant/1-layer-addition-v2`) pero no se proporcionan sus especificaciones ni resultados, y además es solo de suma, por lo que no es directamente comparable. En consecuencia, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo resuelve sumas de forma fiable; la resta tiene una precisión de secuencia del 7,16 % en test, lo que lo hace inadecuado para cualquier uso práctico.
- La precisión del signo es 0 por diseño, lo que impide obtener el signo de la respuesta a partir del modelo; debe ser proporcionado externamente.
- El vocabulario se limita a 13 tokens y la tarea a números de 4 dígitos; no generaliza a números de otras longitudes ni a otras operaciones.
- No se especifica la licencia, por lo que el uso comercial es incierto y se recomienda contactar con el autor antes de cualquier aplicación.
- Es un modelo de investigación, sin soporte para tareas de lenguaje general ni capacidades conversacionales.
- Al ser un modelo sintético y pequeño, los resultados no son representativos del rendimiento de transformers de mayor escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/arithmetic-relu-1layer-seed1
- No se han encontrado papers, repositorios adicionales ni demos asociados en la información disponible.
