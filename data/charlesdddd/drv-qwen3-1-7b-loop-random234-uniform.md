# CharlesDDDD/DRV-Qwen3-1.7B-loop-random234-uniform

## Resumen

DRV-Qwen3-1.7B-loop-random234-uniform es un modelo de lenguaje derivado de Qwen/Qwen3-1.7B-Base mediante continued pretraining con un esquema de recurrencia en profundidad (looped transformer). Lo desarrolla el usuario CharlesDDDD y forma parte de la colección Depth Recurrent Vector (DRV). La idea central es que un bloque de 12 capas (capas 8-19 de las 28 totales) se ejecuta varias veces seguidas reutilizando los mismos pesos, de modo que el modelo obtiene más cómputo por token sin incrementar el número de parámetros.

El modelo parte de la arquitectura transformer de Qwen3-1.7B (1.720.577.024 parámetros reales según safetensors) y se ha continuado preentrenando durante aproximadamente 20.000 millones de tokens sobre una mezcla de web, PDF, código y trayectorias de agente, con secuencias de 16K tokens, AdamW y un pico de learning rate de 3e-4 con decaimiento coseno. La variante "random234-uniform" entrena con un número aleatorio de pasadas por paso (2, 3 o 4, equiprobables), lo que permite usar el modelo con distintos números de pasadas en inferencia.

Es relevante ahora porque explora una vía de escalado alternativa al aumento de parámetros: aumentar el cómputo por token mediante recurrencia en profundidad con pesos compartidos. El resultado reportado por el autor es una pérdida de test de 1,1241 con 3 pasadas frente a 1,1460 del modelo de control sin bucle, es decir, una mejora medible con el mismo número de parámetros. Es un modelo base, sin ajuste por instrucciones, y su arquitectura personalizada aún no está soportada por vLLM ni por otros motores de servicio habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3-1.7B con recurrencia en profundidad (bloque de 12 capas reutilizado) |
| Parametros totales | 1.720.577.024 |
| Parametros activos | no disponible (no es MoE; el cómputo extra se obtiene por pasadas repetidas) |
| Longitud de contexto | 16K tokens en entrenamiento (longitud nativa de Qwen3-1.7B-Base) |
| Tipos de cuantizacion | no disponible (el autor solo documenta bfloat16; no se publican pesos GGUF) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3-1.7B, sin listado explícito) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,4 GB), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 28 capas en el que las capas 0-7 se ejecutan una vez, las capas 8-19 (12 capas) forman un bloque que se ejecuta varias veces con los mismos pesos, y las capas 20-27 se ejecutan una vez al final. La conexión entre pasadas es específica: la primera pasada lee la salida `e` de la capa 7, y cada pasada posterior lee `e + g * (salida de la pasada anterior - e)`, donde `g` es un escalar aprendido por canal oculto (`model.loop_gate`). Con `g = 0` el modelo equivale exactamente al Qwen3 original, lo que da una interpretación clara del mecanismo.

El entrenamiento consistió en continued pretraining de unos 20.000 millones de tokens (una pasada sobre la mezcla web/PDF/código/trayectorias de agente) con secuencias de 16K, AdamW y LR pico de 3e-4 con decaimiento coseno. Esta variante entrena con 2, 3 o 4 pasadas elegidas aleatoriamente y de forma equiprobable en cada paso, lo que hace al modelo robusto a distintos números de pasadas en inferencia. Además, se aplica una pérdida auxiliar (peso 0,0555) sobre la predicción de cada pasada intermedia, de modo que detenerse antes sigue produciendo salidas razonables. No se documentan fases de RLHF ni DPO: es un modelo base.

## Capacidades

- Generación de texto autorregresiva como modelo base, sin ajuste por instrucciones ni modo de razonamiento explícito.
- Razonamiento y conocimiento general heredados de Qwen3-1.7B-Base, con la mejora de pérdida reportada por el bucle.
- Generación de código: el mix de entrenamiento incluye código.
- Trayectorias de agente: el mix incluye agent-trajectory data, aunque al ser un modelo base no ejecuta tool calling de forma nativa.
- Multilingüismo: no documentado explícitamente; depende de las capacidades del Qwen3-1.7B-Base subyacente.
- Control del número de pasadas en inferencia mediante el parámetro `num_loops` (cualquier valor, no solo 2, 3 o 4).
- No soporta tool calling, function calling ni modos de pensamiento nativos (no hay instruction tuning).

## Casos de uso

- Investigación sobre escalado por cómputo: permite comparar directamente, con los mismos parámetros, el efecto de 1 a 8 pasadas sobre la pérdida (de 1,1879 a 1,1250) sin cambiar el tamaño del modelo.
- Experimentos de recurrencia en profundidad: el gate aprendido `model.loop_gate` y la conexión entre pasadas son un objeto de estudio directo para quienes investigan arquitecturas looped frente a transformers estándar.
- Base para fine-tuning específico de dominio: al ser un modelo base Apache 2.0 de 1,7B, se puede ajustar para tareas concretas y comparar si el bucle aporta ventaja frente al Qwen3 original en ese dominio.
- Generación de texto en pipelines de investigación con transformers: funciona con `AutoModelForCausalLM` y `trust_remote_code=True`, probado con transformers 5.14, lo que facilita integrarlo en scripts de evaluación académica.
- Ablación controlada de profundidad efectiva: usar `num_loops` para medir el equilibrio latencia/calidad en un entorno de laboratorio; el autor documenta que la pérdida se estabiliza a partir de 4 pasadas.
- Estudio de eficiencia de caché KV: cada pasada mantiene su propia caché, con unas 1,9 veces la de un Qwen3-1.7B estándar con 3 pasadas, un dato útil para investigar compromisos memoria-cómputo.

## Benchmarks y rendimiento

El autor solo publica la pérdida de test según el número de pasadas, sobre un conjunto de retención de la mezcla de entrenamiento:

| Pasadas | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Pérdida | 1,1879 | 1,1321 | 1,1241 | 1,1236 | 1,1240 | 1,1245 | 1,1248 | 1,1250 |

Control sin bucle: 1,1460. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. En bfloat16, los 1,72B parámetros ocupan unos 3,4 GB de pesos; con 3 pasadas la caché KV es aproximadamente 1,9 veces la de un Qwen3-1.7B estándar, lo que incrementa el consumo en contextos largos.
- GPU recomendadas: no documentadas por el autor. Por tamaño, una GPU consumer de 8-16 GB debería alojar los pesos en bfloat16, aunque la caché KV con múltiples pasadas y 16K de contexto exige margen adicional.
- Cabe en GPU consumer: previsiblemente sí en cuanto a pesos (3,4 GB), pero no hay confirmación oficial ni cifras de latencia.
- Opciones de despliegue: solo transformers (probado con transformers 5.14 y `trust_remote_code=True`). vLLM y otros motores de servicio no soportan aún esta arquitectura; no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles. Cualitativamente, el coste por token crece con el número de pasadas, ya que el bloque de 12 capas se ejecuta varias veces.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pérdida de test | Licencia | Servicio |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-loop-random234-uniform | 1,72B | 16K (entrenamiento) | 1,1236 (4 pasadas) / 1,1460 control | Apache 2.0 | Solo transformers |
| CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop | 1,72B | 16K (entrenamiento) | 1,1460 (control) | Apache 2.0 | Solo transformers |
| Qwen/Qwen3-1.7B-Base | 1,72B | 32K (nativo Qwen3) | no disponible en esta ficha | Apache 2.0 | vLLM, TGI, llama.cpp, Ollama |

La comparación con el modelo base original en benchmarks estándar no está disponible en la información proporcionada; solo se documenta la pérdida de test sobre la mezcla de entrenamiento del modelo derivado.

## Limitaciones y advertencias

- Modelo base sin instruction tuning: no sigue instrucciones de forma fiable ni soporta chat multi-turno sin ajuste adicional.
- Sin soporte en vLLM ni en otros motores de servicio: solo funciona con transformers y `trust_remote_code=True`, lo que limita su uso en producción.
- Caché KV multiplicada: cada pasada mantiene su propia caché, unas 1,9 veces la de un Qwen3-1.7B con 3 pasadas, lo que encarece la inferencia en contextos largos.
- Sin datos publicados de benchmarks estándar, sesgos o tasas de alucinación; al ser un modelo base, el riesgo de alucinación existe pero no está cuantificado.
- Idiomas soportados no documentados explícitamente.
- Sin pesos cuantizados publicados (GGUF, AWQ, GPTQ): la cuantización requeriría conversión propia y el code personalizado podría no ser compatible con las herramientas habituales.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de ajuste por instrucciones y de soporte en motores de servicio hace desaconsejable su despliegue en producción sin trabajo adicional.
- Repo con 0 descargas y 0 likes: modelo muy reciente y sin validación externa por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-loop-random234-uniform
- Colección Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo de referencia sin bucle: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
