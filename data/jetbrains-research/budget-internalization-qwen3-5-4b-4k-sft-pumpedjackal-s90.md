# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-sft-pumpedjackal-s90

## Resumen

El modelo `budget-internalization-qwen3.5-4b-4k-sft-pumpedjackal-s90` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Forma parte de la investigacion recogida en el paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, cuyo objetivo es que el modelo internalice un presupuesto fijo de tokens de razonamiento en lugar de depender del escalado en tiempo de inferencia.

El entrenamiento se realizo sobre soluciones autogeneradas por el propio Qwen3.5-4B a problemas matematicos del dataset DeepScaleR, filtradas por correccion (rejection-sampling finetuning) y restringidas a respuestas de como maximo 4.000 tokens. El checkpoint publicado corresponde al paso 90 de un run denominado internamente `pumpedjackal`.

Con 4.659.865.088 parametros (~4,66 mil millones) y un pipeline declarado como `image-text-to-text`, el modelo hereda las capacidades multimodales del base y se orienta especificamente a razonamiento matematico bajo restriccion de longitud. Es relevante para quienes investigan tecnicas de control de coste computacional en inferencia y para desarrolladores que necesitan respuestas de razonamiento acotadas en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura de Qwen3.5-4B, multimodal image-text-to-text); detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la longitud maxima de secuencia en entrenamiento fue 18.432 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con pipeline `image-text-to-text`, y se ajusta mediante SFT con perdida de next-token sobre la respuesta. Los datos son soluciones autogeneradas por el propio Qwen3.5-4B a problemas de matematicas del dataset `agentica-org/DeepScaleR-Preview-Dataset`, filtradas por correccion (rejection sampling) y restringidas al subconjunto `4k`, es decir, respuestas de como maximo 4.000 tokens, con una unica solucion por problema.

La configuracion de entrenamiento incluye longitud maxima de secuencia de 18.432 tokens, batch de 32 secuencias por paso, optimizador Adam con schedule de LR coseno y pico de 5e-06, 3 epocas y un total de 90 pasos. El prompt de entrenamiento (turno de usuario, renderizado con la plantilla de chat del base) pide razonar paso a paso y emitir la respuesta dentro de etiquetas `\boxed{}`. La innovacion central no reside en la arquitectura, sino en la metodologia: internalizar un presupuesto fijo de tokens de razonamiento para obtener precision dentro del presupuesto, en lugar de ganarla escalando la longitud de generacion en test-time.

## Capacidades

- Generacion de texto y razonamiento paso a paso, con enfasis en problemas matematicos.
- Razonamiento matematico con respuestas formateadas en etiquetas `\boxed{}`.
- Razonamiento con presupuesto de tokens internalizado (entrenado sobre respuestas de hasta 4k tokens).
- Procesamiento de imagen y texto (pipeline `image-text-to-text` heredado del base Qwen3.5-4B).
- Soporte de conversacion multi-turno mediante la plantilla de chat del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el entrenamiento se limita a SFT sobre soluciones matematicas).

## Casos de uso

- Investigacion en control de coste de inferencia: permite estudiar como un modelo ajustado con presupuesto fijo de 4k tokens mantiene precision sin recurrir a cadenas de razonamiento largas, comparandolo con el base sin ajustar.
- Evaluacion de metodologias de rejection-sampling finetuning: sirve como checkpoint de referencia (paso 90) para reproducir y analizar el efecto del filtrado por correccion en tareas de matematicas.
- Generacion de soluciones matematicas acotadas: util en pipelines donde el coste por consulta esta limitado y se requiere una respuesta razonada dentro de un maximo de tokens.
- Fine-tuning posterior sobre dominios especificos: al ser un SFT ligero (90 pasos, LR 5e-06) sobre un base de 4,66 B, es un punto de partida razonable para adaptaciones con recursos moderados.
- Benchmarking de tecnicas de budget internalization: base para comparar frente a variantes RLVR con presupuesto fijo en el mismo dataset DeepScaleR.
- Prototipado de asistentes de resolucion de problemas con entrada de imagen: el pipeline image-text-to-text permite experimentar con problemas planteados como imagen (por ejemplo, enunciados escaneados), aunque no hay datos publicados sobre el rendimiento en esa modalidad.
- Docencia e investigacion academica: modelo pequeno y con licencia Apache 2.0 apto para experimentos reproducibles en entornos con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos (tamano del repo), mas overhead de activaciones y KV cache; en la practica se recomienda 16 GB o mas para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB para pesos; en 4 bits, en torno a 3 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) suficiente para BF16 con margen.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantizacion, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 (estimacion).
- Opciones de despliegue: transformers (libreria declarada), y en principio vLLM, TGI o llama.cpp/Ollama si existe soporte para la arquitectura Qwen3.5 (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-4k-sft-pumpedjackal-s90 | ~4,66 B | no disponible | SFT con presupuesto de 4k tokens sobre DeepScaleR | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4,66 B | no disponible | Modelo multimodal generalista | Apache 2.0 | Hugging Face |
| Alternativas de ~4 B para matematicas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa de rendimiento con el modelo base u otras alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre problemas matematicos de DeepScaleR: puede degradar o no mejorar el rendimiento en tareas generales respecto al base.
- Presupuesto de razonamiento limitado a 4k tokens: problemas que requieran cadenas de razonamiento mas largas pueden resolverse peor que con el base sin restriccion.
- Riesgo de alucinacion y de errores de calculo, habitual en modelos de este tamano en tareas matematicas.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los del modelo base.
- Idiomas soportados no declarados: no hay garantia de comportamiento multilingue mas alla del base.
- El pipeline `image-text-to-text` se hereda del base, pero no hay evidencia publicada de que el ajuste SFT preserve o mejore las capacidades de vision.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base Qwen/Qwen3.5-4B y de los datos DeepScaleR.
- Modelo de investigacion con 0 descargas y 0 likes: sin validacion comunitaria ni resultados de benchmarks publicados; no recomendado para produccion sin evaluacion propia.
- La model card indica `Citation: TODO` y no documenta evaluaciones; la reproducibilidad depende de la configuracion de entrenamiento descrita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-sft-pumpedjackal-s90
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper referenciado: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (enlace no disponible en la informacion proporcionada)
- Repositorio de codigo: no disponible en la informacion proporcionada
