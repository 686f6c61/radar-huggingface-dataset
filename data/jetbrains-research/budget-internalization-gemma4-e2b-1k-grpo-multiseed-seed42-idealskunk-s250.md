# JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s250

## Resumen

`budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s250` es un ajuste fino por aprendizaje por refuerzo del modelo multimodal `google/gemma-4-E2B-it`, desarrollado por JetBrains-Research en el marco del articulo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*. El objetivo del entrenamiento es que el modelo aprenda a resolver problemas de matematicas razonando dentro de un presupuesto fijo de generacion de 1.024 tokens, en lugar de depender de cadenas de pensamiento largas y no acotadas en tiempo de inferencia.

El modelo parte de una base Gemma 4 de 5.123.178.051 parametros (aproximadamente 5,1 mil millones) con capacidades de entrada imagen-texto y salida any-to-any, y se entrena con GRPO sobre el conjunto de datos DeepScaleR-Preview de problemas matematicos, usando recompensa binaria de correccion de la respuesta extraida de las etiquetas `\boxed{}`. El checkpoint publicado corresponde al paso 250, seleccionado como el mejor de la ejecucion por precision de validacion sobre 480 problemas reservados.

Es relevante porque aborda un problema practico de produccion: los modelos de razonamiento suelen consumir una cantidad variable e impredecible de tokens en test-time scaling, lo que encarece y ralentiza el despliegue. Este ajuste internaliza el presupuesto en los pesos del modelo y forma parte de un estudio de ablacion con tres semillas (42, 43, 44), lo que permite evaluar la robustez del procedimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), base `google/gemma-4-E2B-it`; detalles internos no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (hereda la licencia del modelo base Gemma 4) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint instructivo `google/gemma-4-E2B-it`, una arquitectura transformer multimodal con pipeline `any-to-any` (entrada imagen-texto, salida texto). No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas ni mecanismos de atencion especificos de la familia Gemma 4 en la informacion proporcionada.

El entrenamiento emplea GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Se usa un presupuesto de generacion fijo de `max_new_tokens = 1024`; las respuestas que alcanzan el limite se truncan y se puntuan tal cual, lo que fuerza al modelo a internalizar el presupuesto. Los datos son DeepScaleR (matematicas) con un maximo de 3 epocas, lote de 32 prompts por 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de calentamiento. La recompensa es binaria segun la correccion de la respuesta extraida de `\boxed{}`. El entrenamiento se detuvo en el paso 250 (el paso 300 se publica en un repositorio separado). El prompt de entrenamiento usa la plantilla de chat del modelo base con la instruccion de pensar paso a paso y emitir la respuesta en `\boxed{}`.

## Capacidades

- Generacion de texto y razonamiento matematico con cadenas de pensamiento acotadas a un presupuesto de 1.024 tokens.
- Resolucion de problemas matematicos con formato de respuesta en `\boxed{}`.
- Capacidades multimodales heredadas del modelo base: entrada de imagen y texto, salida any-to-any.
- Razonamiento paso a paso internalizado (budget internalization), orientado a reducir el consumo de tokens en inferencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de investigacion en RLVR: el modelo sirve como punto de comparacion en estudios sobre internalizacion de presupuesto, ya que forma parte de una ablacion de semillas con checkpoints intermedios y finales publicados.
- Razonamiento matematico con coste acotado: en pipelines donde el coste por consulta debe ser predecible, el modelo genera como maximo 1.024 tokens, lo que facilita estimar latencia y facturacion.
- Generacion de soluciones matematicas verificables: la salida en `\boxed{}` permite extraer y validar automaticamente la respuesta final en sistemas de correccion automatica.
- Tutoria o asistencia educativa en matematicas: el modelo produce explicaciones paso a paso dentro de un limite de longitud, adecuado para interfaces con restricciones de espacio o tiempo.
- Benchmarking de tecnicas de RL: al estar publicados varios checkpoints (pasos 250 y 300, semillas 42, 43 y 44), se puede analizar la varianza entre semillas y la evolucion del entrenamiento.
- Experimentos multimodales: al heredar la entrada imagen-texto de Gemma 4, puede emplearse en tareas que combinen enunciados con figuras o diagramas, aunque no se han publicado evaluaciones especificas en esta informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR y que el paso 250 es el mejor checkpoint de esta ejecucion por dicha metrica, pero no se proporcionan los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 20,5 GB solo para pesos, mas overhead de activaciones y cache KV; el repositorio ocupa 20,5 GB.
- En cuantizacion de 16 bits (BF16/FP16): en torno a 10,3 GB de pesos, mas overhead; no se han publicado ficheros cuantizados en el repositorio.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cabria esperar GPUs con 24 GB o mas para F32 (por ejemplo, A100, H100, L40S) y GPUs de consumo de gama alta para precisiones reducidas, pero esto no esta confirmado por el autor.
- Cabe en GPU de consumo: no confirmado; en F32 no cabe en GPUs de 16 GB, y en 8 bits requeriria conversion propia no publicada.
- Opciones de despliegue: transformers (libreria declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma-4-E2B-it + GRPO, 1k) | 5.123.178.051 | no disponible | GRPO sobre DeepScaleR, presupuesto 1.024 tokens | apache-2.0 | Hugging Face (JetBrains-Research) |
| google/gemma-4-E2B-it (base) | 5.123.178.051 | no disponible | Instruct base | apache-2.0 | Hugging Face (Google) |
| budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300 | 5.123.178.051 | no disponible | Misma receta, semilla 43, paso 300 | apache-2.0 | Hugging Face (JetBrains-Research) |
| budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300 | 5.123.178.051 | no disponible | Misma receta, semilla 44, paso 300 | apache-2.0 | Hugging Face (JetBrains-Research) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en matematicas (DeepScaleR); su rendimiento en otras tareas puede degradarse respecto al modelo base.
- El presupuesto de 1.024 tokens trunca las respuestas que lo alcanzan y las puntua tal cual durante el entrenamiento, lo que puede producir respuestas incompletas en problemas que requieran razonamientos mas largos.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; el entrenamiento se realizo sobre un dataset de matematicas en ingles presumiblemente, sin confirmacion.
- Restricciones de licencia: la model card declara apache-2.0 pero enlaza a la licencia de Gemma 4 de Google; conviene revisar los terminos del modelo base antes de uso comercial.
- El checkpoint publicado es el paso 250 de una ejecucion concreta (semilla 42); los resultados pueden variar entre semillas, como sugiere la propia ablacion.
- Pesos en F32: el repositorio es grande (20,5 GB) y no incluye cuantizaciones, lo que complica el despliegue en entornos con VRAM limitada.
- La model card incluye una cita marcada como "TODO", por lo que la referencia formal al articulo no esta completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s250
- Checkpoint paso 300, semilla 42: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300
- Checkpoint paso 300, semilla 43: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300
- Checkpoint paso 280, semilla 44: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s280
- Checkpoint paso 300, semilla 44: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
