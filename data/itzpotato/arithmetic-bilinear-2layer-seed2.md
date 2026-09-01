# itzPotato/arithmetic-bilinear-2layer-seed2

## Resumen

El modelo `arithmetic-bilinear-2layer-seed2`, desarrollado por itzPotato (Rohan Sashank Babbellapati), es un transformer decoder-only de 2 capas, sin bias ni normalización, con una MLP bilineal, entrenado específicamente para resolver sumas y restas de números de 4 dígitos con signo. Con solo 21.824 parámetros, forma parte de un conjunto de doce modelos que varían en el tipo de MLP (ReLU o bilineal), número de capas (1 o 2) y semilla, todos entrenados con una receta idéntica para aislar el efecto de la arquitectura en la adquisición de algoritmos aritméticos.

Este modelo es relevante en el campo de la interpretabilidad mecanicista: permite estudiar cómo una arquitectura pequeña y controlada aprende a propagar el acarreo (carry) y el préstamo (borrow) en operaciones aritméticas. A diferencia de los LLM de propósito general, su diseño minimalista (token por dígito, vocabulario de 13 tokens) facilita el análisis de los circuitos internos. Los resultados reportados muestran una precisión de secuencia del 99,72% en validación y 99,71% en test, aunque la precisión del signo es nula por construcción, un detalle clave para interpretar sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 2 capas, 4 cabezas de atencion, d_model 32, d_mlp 64, MLP bilineal, sin bias ni normalizacion |
| Parametros totales | 21.824 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16 tokens (entrada y salida fijas: 11 tokens de entrada y 5 de salida) |
| Tipos de cuantizacion | No disponible (pesos en FP32, safetensors) |
| Idiomas soportados | No disponible (el modelo opera con digitos y simbolos aritmeticos, no con lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | safetensors (cargable con PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only sin bias ni normalización, con dos capas. Cada capa tiene atención de 4 cabezas con dimensión de cabeza 8 y una MLP con expansión a 64 dimensiones. La MLP bilineal se define como `W_out[(W_L x) * (W_R x)]`, donde `*` es el producto elemento a elemento, a diferencia de la MLP ReLU estándar `W_out ReLU(W_in x)`. Esta elección arquitectónica es el objeto de estudio: se comparan doce modelos idénticos en todo excepto en el tipo de MLP y el número de capas.

El entrenamiento sigue una receta fija para todos los modelos: AdamW con tasa de aprendizaje 0,02 (cosine decay, 200 pasos de warmup), batch de 1024, weight decay 0,01, grad clip 1,0, y una sola pasada sobre 5.000.000 de ejemplos. La tasa de aprendizaje se seleccionó mediante una sonda de seis puntos en ambas variantes de MLP, eligiendo la mayor tasa en la que ambas permanecen estables, de modo que la receta no favorece a ninguna variante. El modelo usa semilla 2 para los pesos y semilla 1234 para los datos, idéntica en los doce modelos. El mejor paso de entrenamiento fue el 4600 de 4883.

El formato de tarea es token por dígito, con operadores y signo. Cada operando se rellena con ceros a 4 dígitos y la respuesta a 5, precedida por un token de signo. La pérdida se calcula solo sobre los 5 dígitos de la respuesta, no sobre el token de signo. Los identificadores de token son propios del proyecto: los dígitos 0-9 son ellos mismos, `+`=10, `-`=11, `=`=12, `d_vocab`=13. Se advierte que estos IDs no coinciden con el modelo de referencia `melephant/1-layer-addition-v2`, que es solo de suma y tiene un vocabulario diferente.

## Capacidades

- Resolución de sumas y restas de números de 4 dígitos con signo, con precisión de dígitos del 99,94% en validación y test.
- Precisión de secuencia (los 5 dígitos de la respuesta correctos) del 99,72% en validación y 99,71% en test.
- La precisión por operador es ligeramente mayor en resta (99,78% de secuencia) que en suma (99,66%).
- El modelo no predice el signo de la respuesta: la precisión del signo es ~0 por construcción, ya que la pérdida no cubre ese token y el signo se fuerza como entrada. Esto no afecta a la precisión de dígitos.
- Los modelos de 1 capa resuelven solo la suma, mientras que los de 2 capas resuelven ambas operaciones. La segunda capa es necesaria para la propagación del préstamo (borrow) en la resta.
- Es un modelo de investigación para interpretabilidad: su tamaño y diseño permiten inspeccionar los circuitos internos que implementan la aritmética.

## Casos de uso

- Estudio de algoritmos internos en transformers: el modelo permite rastrear cómo la atención y la MLP bilineal implementan la propagación del acarreo y el préstamo, algo difícil de hacer en modelos grandes. Los investigadores pueden extraer activaciones y analizar los circuitos formados.
- Comparación de arquitecturas de MLP: al existir doce variantes con la misma receta, se puede aislar el efecto de la MLP bilineal frente a la ReLU en la adquisición de una habilidad concreta, controlando el resto de variables.
- Validación de técnicas de interpretabilidad mecanicista: sirve como banco de pruebas para métodos como la localización de circuitos, la intervención en activaciones o la extracción de subgrafos, antes de aplicarlos a modelos mayores.
- Generación de datos sintéticos para entrenamiento de modelos más grandes: las operaciones aritméticas generadas por este modelo podrían usarse como datos de entrenamiento o validación para evaluar la capacidad aritmética de LLM en tareas de 4 dígitos con signo.
- Depuración de pipelines de entrenamiento: al ser un modelo minúsculo y rápido de entrenar, puede servir para verificar que una infraestructura de entrenamiento (datos, pérdida, tokenización) funciona correctamente antes de lanzar entrenamientos costosos.
- Docencia e investigación en deep learning: su simplicidad lo convierte en un ejemplo didáctico para explicar cómo un transformer aprende una tarea simbólica, y cómo la arquitectura influye en la capacidad de generalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Los únicos datos reportados son los de validación y test del propio modelo, que se detallan a continuación.

| Split | Loss | Digit acc | Seq acc | Sign acc |
|---|---:|---:|---:|---:|
| Validación | 0,0016 | 0,9994 | 0,9972 | 0,0000 |
| Test | 0,0023 | 0,9994 | 0,9971 | 0,0000 |

| Operador | Seq acc | Digit acc | Loss |
|---|---:|---:|---:|
| Suma | 0,9966 | 0,9993 | 0,0020 |
| Resta | 0,9978 | 0,9996 | 0,0013 |

## Requisitos de hardware

- VRAM estimada: menos de 1 MB en FP32 (21.824 parámetros × 4 bytes ≈ 87 KB). Cabe en cualquier dispositivo, incluso en una CPU sin GPU.
- GPU recomendadas: ninguna en particular; cualquier GPU moderna o incluso una Raspberry Pi puede ejecutar la inferencia.
- En consumer GPU: sí, en todas (RTX 3060, RTX 4090, etc.) con un uso ínfimo de recursos.
- Opciones de despliegue: al ser un modelo PyTorch, se puede cargar con `torch.load` o mediante el código de `src.pretraining.model.PretrainTransformer`. No requiere vLLM, llama.cpp ni Ollama.
- Latencia y throughput: la inferencia es del orden de microsegundos por ejemplo en CPU; se pueden procesar millones de ejemplos por segundo en una GPU moderna, aunque no se han publicado mediciones formales.

## Comparativa con modelos similares

No se dispone de modelos comparables en el mismo sentido, ya que la mayoría de los modelos de interpretabilidad aritmética son específicos de cada investigación y no se publican con la misma configuración. El propio autor menciona un modelo de referencia (`melephant/1-layer-addition-v2`), pero es solo de suma y con un vocabulario incompatible, por lo que no es directamente comparable. Se podría considerar que los otros once modelos del mismo proyecto (variantes ReLU/bilineal, 1/2 capas, semillas 0, 1, 2) son la comparativa natural, pero no se han publicado sus resultados en la información disponible. Por tanto, la comparativa con alternativas se considera no disponible.

## Limitaciones y advertencias

- El modelo no predice el signo de la respuesta: la precisión del signo es 0 por diseño, ya que la pérdida no cubre ese token. Esto significa que no es adecuado para tareas donde se requiera el signo correcto de la salida.
- Solo maneja números de 4 dígitos con operadores de suma y resta; no generaliza a más dígitos ni a otras operaciones aritméticas.
- Su vocabulario es específico del proyecto (13 tokens) y no es compatible con otros modelos de referencia, lo que limita la reutilización de activaciones entre modelos.
- No hay licencia especificada, por lo que su uso comercial o redistribución es incierto; se recomienda contactar con el autor antes de usarlo en producción.
- Es un modelo de investigación, no un LLM de propósito general: no tiene capacidades de lenguaje natural, generación de texto ni razonamiento general.
- Los resultados de precisión se basan en un conjunto de datos sintético fijo; no se ha evaluado la robustez frente a distribuciones diferentes (por ejemplo, números con más dígitos o con ceros a la izquierda no rellenados).
- El entrenamiento usa una sola pasada sobre los datos; no se ha explorado el efecto de múltiples épocas ni de regularización adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itzPotato/arithmetic-bilinear-2layer-seed2
- Perfil del autor en Hugging Face: https://huggingface.co/itzPotato
- Otros modelos del autor (relacionados con interpretabilidad aritmética): https://huggingface.co/itzPotato/models
- Modelo de referencia mencionado en la model card (no compatible): https://huggingface.co/melephant/1-layer-addition-v2
