# mohsenvand/sketchpad-0.8b-runs

## Resumen

Sketchpad-0.8B runs es una colección de adaptadores LoRA entrenados sobre el modelo base Qwen/Qwen3.5-0.8B, publicada por el usuario mohsenvand como material de investigación intermedio hacia el modelo Sketchpad-0.8B. No se trata de un modelo autónomo, sino de un repositorio de runs de entrenamiento con sus configuraciones, evaluaciones y registros, pensado para documentar el proceso de ajuste fino de una tarea muy concreta: la aritmética posicional por pasos.

El modelo base es un transformer multimodal de 0,8 mil millones de parámetros con torre de visión, pero los adaptadores LoRA (rank 16, alpha 32) se aplican exclusivamente a las capas de lenguaje; la torre de visión queda intacta. La tarea aprendida consiste en leer una columna de una hoja de cálculo representada como tres celdas de 32 × 32 apiladas y escribir el siguiente paso del algoritmo, lo que permite resolver sumas y multiplicaciones de longitud arbitraria mediante pasos sucesivos.

La relevancia de este repositorio es metodológica más que de producto: documenta 19 runs con métricas de exactitud por fila de tabla, márgenes de logit, perplejidad de texto frente al base y rendimiento en cadenas largas. Es una vista previa de investigación, no un asistente general ni un modelo con ajuste de seguridad, y su licencia es propietaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen/Qwen3.5-0.8B) con adaptadores LoRA en capas de lenguaje |
| Parámetros totales | 0,8 B (modelo base); adaptadores LoRA de rank 16 y alpha 32 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Propietaria (sketchpad-proprietary); modelo base Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) con PEFT; incluye adapter_config.json, eval.json y train_log.json |

## Arquitectura y entrenamiento

El repositorio contiene adaptadores LoRA entrenados con PEFT sobre Qwen/Qwen3.5-0.8B. Cada carpeta de run incluye configuración del adaptador, pesos en safetensors, un archivo de evaluación con la tabla y las pruebas largas, y un registro de entrenamiento. Los adaptadores se aplican solo a las capas de lenguaje, con rank 16 y alpha 32, dejando la torre de visión sin modificar.

La tarea se formula como una tabla finita de filas: 242 para el sumador, 1.553 para el multiplicador y 1.795 para el modelo unión que cubre ambas operaciones. Cada paso del algoritmo corresponde a una fila de esa tabla; un run se considera correcto en una fila cuando el logit de la respuesta correcta supera al de todas las incorrectas, y el margen mide esa ventaja. Los runs del multiplicador y del unión emplean una función de pérdida con muestreo de toda la tabla en cada paso, un término hinge que empuja cada fila por encima de un margen y un término KL que mantiene las predicciones de texto cerca de las del modelo base. La receta v2 añade tasa de aprendizaje decreciente, batch duplicado y replay de las filas que fallaron o quedaron por debajo de la mitad del hinge en la última comprobación completa. El multiplicador descompone la operación larga en cinco tipos de paso (MUL, ADD, ADZ, FLS, NXT), escribiendo los dos dígitos del paso y el siguiente paso como tres tokens.

## Capacidades

- Aritmética posicional por pasos: suma por columnas y multiplicación larga descompuesta en cinco tipos de paso.
- Lectura de representaciones visuales de celdas de 32 × 32 apiladas en grupos de tres (pipeline image-text-to-text).
- Generación de respuestas de uno, dos o tres tokens por paso según el run.
- Ejecución de cadenas largas: productos de 4 × 4, 6 × 6 y 10 × 10, y sumas de 10, 100 y 1.000 dígitos, con resultados exactos en los runs que superan todas las filas de la tabla.
- Modelo unión que cubre suma y multiplicación con un solo adaptador.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso general.
- No dispone de modo thinking, audio ni capacidades multilingües documentadas.

## Casos de uso

- Investigación sobre aritmética exacta en modelos pequeños: los runs permiten estudiar cómo un adaptador LoRA de 0,8 B aprende una tabla finita de pasos y generaliza a longitudes arbitrarias, con métricas por fila y márgenes de logit registrados.
- Reproducción de experimentos de ajuste fino: cada carpeta incluye configuración, pesos, evaluación y registro de entrenamiento, lo que facilita replicar recetas v1 y v2 y comparar semillas y presupuestos de pasos.
- Análisis de estabilidad del entrenamiento: la tabla de runs muestra la relación entre margen mínimo, filas superadas y rendimiento en cadenas largas, útil para estudiar el efecto del hinge y del término KL.
- Evaluación de la degradación del lenguaje: la columna de perplejidad de texto frente al base permite medir cuánto pierde el modelo en predicción de texto al especializarse en aritmética.
- Estudio de adaptadores sobre modelos multimodales: al dejar intacta la torre de visión, sirve para analizar cómo el ajuste de las capas de lenguaje afecta a la lectura de representaciones visuales estructuradas.
- Docencia y divulgación sobre LoRA: el repositorio es un ejemplo concreto de ajuste paramétricamente eficiente con evaluación detallada y trazabilidad completa de cada run.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones internas por fila de tabla y pruebas de cadenas largas, no benchmarks estándar.

| Run | Filas superadas | Margen mínimo | Perplejidad de texto vs base | Cadenas largas |
|---|---|---|---|---|
| adder/e2-s0 | 242/242 | 1,46 | ×1,095 | + 20/20, 5/5, 2/2 |
| adder/e2-s1-kl1 | 242/242 | 3,56 | ×1,007 | + 20/20, 5/5, 2/2 |
| adder/e2b-s1 | 242/242 | 1,25 | ×1,009 | + 20/20, 5/5, 2/2 |
| multiplier/e4-s1-1500-kl1 | 1.553/1.553 | 2,24 | ×0,997 | × 20/20, 10/10, 5/5 |
| multiplier/e4-s3-1500-kl1-h4 | 1.553/1.553 | 2,86 | ×1,014 | × 20/20, 10/10, 5/5 |
| union/e5v2-s3-4000-h4-stop3 | 1.795/1.795 | 5,21 | ×0,997 | × 20/20, 10/10, 5/5; + 20/20, 5/5, 2/2 |
| union/e6-s3-3000-h4-stop3 | 1.795/1.795 | 3,35 | ×1,007 | × 20/20, 10/10, 5/5; + 20/20, 5/5, 2/2 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 0,8 B de parámetros; los adaptadores LoRA añaden una fracción mínima. No se especifican requisitos oficiales.
- GPU recomendadas: las mediciones del autor se realizaron en H100 y en Apple M4 con PyTorch; no se documentan otras configuraciones.
- Cabe en GPU de consumo: por el tamaño del modelo base (0,8 B), es previsible que quepa en GPUs de consumo, aunque no se aportan cifras oficiales.
- Opciones de despliegue: PEFT sobre Qwen/Qwen3.5-0.8B; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sketchpad-0.8B runs | 0,8 B (base) + LoRA | No disponible | Aritmética por pasos sobre tabla finita | Propietaria | HuggingFace (adaptadores) |
| Qwen/Qwen3.5-0.8B | 0,8 B | No disponible | Modelo base multimodal | Apache 2.0 | HuggingFace |
| Sketchpad-0.8B | 0,8 B (base) + LoRA | No disponible | Modelo final del mismo proyecto | Propietaria | HuggingFace |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente general: está especializado en una tarea aritmética concreta y no está ajustado para seguridad.
- Solo puede operar sobre el conjunto finito de columnas de su tabla (242, 1.553 o 1.795 filas según el run); fuera de esa tabla no hay garantía.
- Varios runs no superan todas las filas y presentan márgenes negativos, lo que implica errores en pasos concretos y, por tanto, en resultados de cadenas largas.
- La licencia es propietaria (sketchpad-proprietary), lo que restringe el uso comercial; el modelo base es Apache 2.0 y se aplica su aviso correspondiente.
- No hay información sobre sesgos, idiomas soportados ni longitud de contexto.
- Es una vista previa de investigación con paper pendiente de publicación; no debe usarse en producción.
- La perplejidad de texto varía entre runs (desde ×0,968 hasta ×1,095), lo que indica degradación variable de las capacidades lingüísticas del base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mohsenvand/sketchpad-0.8b-runs
- Modelo final Sketchpad-0.8B: https://huggingface.co/mohsenvand/sketchpad-0.8b-preview
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
