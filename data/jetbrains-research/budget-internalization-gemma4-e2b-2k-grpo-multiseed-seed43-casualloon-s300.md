# JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) de `google/gemma-4-E2B-it`, desarrollado por JetBrains-Research, orientado a razonamiento matematico bajo un presupuesto fijo de generacion de 2.048 tokens. Forma parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que estudia como internalizar un limite de tokens en el propio modelo en lugar de depender de estrategias de escalado en tiempo de inferencia.

El checkpoint publicado corresponde al paso 300 de una ablacion de semillas (42, 43 y 44); este run concreto usa la semilla 43 y el nombre en clave `casualloon`. El entrenamiento emplea GRPO (Group Relative Policy Optimization) con recompensa binaria de correccion de respuesta, sobre el dataset DeepScaleR (matematicas), y trunca las respuestas que agotan el presupuesto de 2.048 tokens, puntuandolas tal cual.

El modelo hereda la arquitectura multimodal de Gemma 4 E2B (pipeline `any-to-any`, entrada imagen-texto) y cuenta con 5.123.178.051 parametros totales en pesos safetensors. Su relevancia es metodologica: permite evaluar si un modelo pequeno puede mantener precision dentro de un presupuesto acotado, con implicaciones directas para coste y latencia en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4 E2B; detalles de capas y atencion no disponibles) |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0, heredada del modelo base (enlace a licencia Gemma 4 de Google) |
| Formato de pesos | safetensors (dtype F32 en el entrenamiento) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un modelo multimodal de la familia Gemma 4 con pipeline `any-to-any` (entrada imagen-texto). La ficha del autor no detalla el numero de capas, el mecanismo de atencion ni la composicion exacta del dataset de preentrenamiento del modelo base, por lo que esos datos no estan disponibles. El ajuste fino se realiza sobre el checkpoint instruct ya entrenado.

El entrenamiento aplica GRPO con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Se usan 32 prompts por paso con 8 rollouts cada uno, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de calentamiento, durante 300 pasos y hasta 3 epocas sobre DeepScaleR. La recompensa es binaria: se extrae la respuesta de las etiquetas `\boxed{}` y se comprueba su correccion. Las respuestas que alcanzan el limite de 2.048 tokens se truncan y se puntuan sin margen adicional, lo que fuerza al modelo a internalizar el presupuesto. La validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades

- Razonamiento matematico con cadena de pensamiento bajo un presupuesto fijo de 2.048 tokens de generacion.
- Generacion de texto y respuestas en formato estructurado mediante extraccion de `\boxed{}`.
- Capacidades multimodales heredadas del modelo base (entrada imagen-texto, pipeline `any-to-any`).
- Razonamiento multi-paso orientado a problemas de competicion matematica (DeepScaleR).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible como capacidad separada; el prompt de entrenamiento induce razonamiento paso a paso.

## Casos de uso

- Evaluacion de investigacion en RLVR: el modelo sirve como punto de comparacion reproducible para estudiar la internalizacion de presupuestos de tokens, con semillas y checkpoints publicados de forma explicita.
- Razonamiento matematico con coste acotado: en pipelines donde el coste por consulta debe estar limitado, el modelo genera como maximo 2.048 tokens, lo que facilita la planificacion de capacidad y evita respuestas desbordadas.
- Tutoria o resolucion de problemas paso a paso: el prompt de entrenamiento fuerza una cadena de razonamiento y una respuesta final en `\boxed{}`, adecuada para sistemas de verificacion automatica de resultados.
- Generacion de soluciones verificables en entornos educativos: la extraccion de la respuesta final permite corregir automaticamente ejercicios de matematicas.
- Benchmarking de tecnicas de RL: al existir tres semillas y varios checkpoints intermedios, se puede medir la varianza del entrenamiento y la estabilidad del metodo.
- Prototipado de asistentes multimodales de bajo coste: al heredar la entrada imagen-texto del modelo base, puede usarse para experimentos que combinen imagenes y razonamiento textual, aunque el ajuste RL se centra en matematicas.
- Integracion en pipelines de evaluacion con `transformers`: el repo es compatible con la libreria y con endpoints, lo que simplifica su despliegue en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no incluye los valores numericos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.123 millones de parametros en F32, el peso completo ocupa aproximadamente 20,5 GB (coincide con el tamano del repo); en BF16 seria de unos 10,2 GB y en cuantizacion de 8 bits unos 5,1 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: para F32, GPU de 24 GB o mas (A100 40/80 GB, H100, L40S, RTX 4090 24 GB al limite). Para BF16, GPU de 16-24 GB.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con BF16 o cuantizacion; en GPUs de 16 GB probablemente solo con cuantizacion de 8 bits o inferior.
- Opciones de despliegue: `transformers` (libreria declarada), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. El limite de 2.048 tokens de generacion acota el coste maximo por respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (budget-internalization gemma4-e2b seed43) | 5.123 M | no disponible | RL con presupuesto fijo de 2.048 tokens sobre Gemma 4 E2B | Apache 2.0 (heredada) | Hugging Face, checkpoint paso 300 |
| google/gemma-4-E2B-it | no disponible en la informacion | no disponible | Modelo base instruct multimodal | Licencia Gemma 4 | Hugging Face |
| Checkpoints hermanos de la ablacion (seed42, seed43-s170, seed44) | 5.123 M | no disponible | Misma receta, distinta semilla o paso | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste esta especializado en matematicas (DeepScaleR); el rendimiento en otras tareas puede degradarse respecto al modelo base.
- Riesgo de alucinacion en razonamientos largos, especialmente cuando el modelo se aproxima al limite de 2.048 tokens y las respuestas se truncan.
- El truncado a 2.048 tokens puede producir respuestas incompletas o sin etiqueta `\boxed{}` valida en problemas complejos.
- Sesgos conocidos: no disponibles en la informacion proporcionada; hereda los del modelo base Gemma 4.
- Idiomas soportados no documentados; el entrenamiento se realiza sobre un dataset de matematicas presumiblemente en ingles.
- Licencia: Apache 2.0 con enlace a la licencia Gemma 4 de Google; conviene revisar los terminos de uso comercial del modelo base antes de desplegar en produccion.
- Es un checkpoint de investigacion (paso 300 de una ablacion de semillas), no un modelo optimizado para produccion; no hay datos de robustez ni de evaluacion fuera de DeepScaleR.
- Pesos en F32, lo que incrementa el coste de almacenamiento y memoria frente a formatos reducidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint hermano seed42: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300
- Checkpoint hermano seed43 paso 170: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170
- Checkpoint hermano seed44 paso 230: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s230
- Checkpoint hermano seed44 paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: referencia citada en la model card, sin enlace disponible.
