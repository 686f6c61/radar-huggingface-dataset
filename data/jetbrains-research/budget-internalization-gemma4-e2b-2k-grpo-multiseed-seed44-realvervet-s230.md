# JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s230

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo de `google/gemma-4-E2B-it`, desarrollado por JetBrains-Research en el marco del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*. El objetivo no es mejorar la precisión bruta del modelo base, sino internalizar un presupuesto fijo de generación de 2.048 tokens: el modelo aprende a razonar y responder en problemas de matemáticas sin exceder ese límite, de modo que el truncado de respuestas deje de degradar la exactitud.

Se trata de un checkpoint intermedio (paso 230) de una ablación de semillas (42, 43 y 44); este repositorio corresponde a la semilla 44, identificada con el nombre en clave `realvervet`, y es el mejor checkpoint de esa ejecución según la exactitud de validación medida cada 10 pasos sobre 480 problemas reservados de DeepScaleR. El modelo base es un Gemma 4 de la variante E2B con aproximadamente 5.120 millones de parámetros totales en pesos safetensors y una modalidad de entrada/salida `any-to-any` (image-text-to-text), lo que lo sitúa en la gama de modelos pequeños con capacidades multimodales.

La relevancia práctica es doble: por un lado, ofrece un caso reproducible de cómo el RL con recompensa verificable (RLVR) y presupuesto fijo puede sustituir parte del escalado en tiempo de inferencia por un comportamiento más disciplinado en tokens; por otro, su licencia Apache 2.0 y su tamaño permiten desplegarlo en hardware modesto para tareas de razonamiento matemático con latencia acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), pipeline `any-to-any` / `image-text-to-text`; detalles internos de capas y atención no disponibles |
| Parametros totales | 5.123.178.051 (aproximadamente 5,12 mil millones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; pesos publicados en F32 (safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (hereda la licencia de `google/gemma-4-E2B-it`; enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (dtype F32); tamaño del repositorio 20,5 GB |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal de la familia Gemma 4 en su variante E2B, con unos 5.120 millones de parámetros. El ajuste se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. La recompensa es binaria: se extrae la respuesta encerrada en `\boxed{}` y se compara con la solución correcta. Las respuestas que alcanzan el presupuesto de 2.048 tokens se truncan y se puntúan tal cual, lo que es precisamente el mecanismo que empuja al modelo a internalizar el límite en lugar de verse penalizado por él.

Los datos de entrenamiento son el conjunto DeepScaleR (matemáticas), con un máximo de 3 épocas. La configuración de entrenamiento usa 32 prompts por paso con 8 rollouts cada uno, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de calentamiento. Este repositorio corresponde al paso 230 de la semilla 44; no se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La innovación metodológica central es el propio esquema de internalización de presupuesto mediante RLVR con presupuesto fijo.

## Capacidades

- Razonamiento matemático con formato de respuesta explícito: el modelo genera cadenas de razonamiento paso a paso y encapsula la respuesta final en etiquetas `\boxed{}`.
- Generación de texto y razonamiento multi-paso bajo un presupuesto de 2.048 tokens, con tendencia aprendida a ajustar la longitud del razonamiento al límite disponible.
- Capacidades multimodales heredadas del modelo base: pipeline `image-text-to-text` y `any-to-any`, lo que permite entrada de imagen y texto.
- Soporte conversacional mediante la plantilla de chat del modelo base (`gemma-4-E2B-it`), sobre la que se renderiza el prompt de entrenamiento.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento de agente; no disponible.
- Capacidades multilingües: no disponibles (la model card no especifica idiomas).
- Modo de pensamiento: el prompt de entrenamiento induce razonamiento explícito ("Think step-by-step..."), pero no se documenta un modo *thinking* conmutable.

## Casos de uso

- Resolución de problemas matemáticos con latencia acotada: el modelo está entrenado para responder dentro de 2.048 tokens, por lo que es adecuado en pipelines donde el coste por consulta debe ser predecible y el truncado no debe degradar la exactitud.
- Evaluación de técnicas de RLVR: sirve como referencia reproducible (semilla 44, paso 230) para comparar recetas de internalización de presupuesto frente a checkpoints de otras semillas y pasos del mismo estudio.
- Tutores o asistentes de matemáticas por API: la salida estructurada en `\boxed{}` facilita el parseo automático de la respuesta final en sistemas de corrección automática.
- Investigación sobre escalado en tiempo de inferencia: permite estudiar la relación entre longitud de razonamiento y precisión cuando el presupuesto es fijo, comparándolo con el modelo base sin ajuste.
- Prototipado en hardware de consumo: con ~5,12 mil millones de parámetros, es viable para experimentos locales de razonamiento matemático con cuantización, aunque los pesos publicados están en F32.
- Tareas multimodales ligeras de imagen-texto: al heredar el pipeline `any-to-any` del modelo base, puede emplearse en prototipos que combinen una imagen con una consulta textual, siempre que no se requiera precisión de producción no validada.
- Ablaciones de semilla en investigación: los repositorios hermanos (semillas 42, 43 y 44, pasos 170, 230 y 300) permiten medir la varianza del entrenamiento y elegir el checkpoint más estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la exactitud de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se proporcionan los valores numéricos de esa métrica ni resultados de MMLU, GSM8K, HumanEval u otros.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 20,5 GB solo para pesos, más memoria para el contexto y las activaciones; se recomienda al menos 24 GB para un despliegue cómodo en precisión completa.
- En cuantización de 8 bits, la estimación ronda los 5-6 GB de pesos; en 4 bits, alrededor de 3 GB, aunque no se han publicado cuantizaciones oficiales de este checkpoint.
- GPU recomendadas: A100 o H100 para inferencia en F32 con contexto amplio; RTX 4090 (24 GB) viable en F32 ajustado o en 8 bits; GPUs consumer de 12-16 GB viables solo con cuantización.
- Despliegue: al ser un modelo de `transformers` con pesos safetensors, es compatible con el ecosistema Hugging Face (Transformers, TGI, vLLM), aunque no se documentan configuraciones validadas para vLLM ni llama.cpp/Ollama en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s230 (este) | ~5,12 B | No disponible | GRPO sobre DeepScaleR, presupuesto 2.048 tokens | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it (base) | ~5,12 B (no confirmado en la informacion) | No disponible | Ajuste instructivo original de Google | Licencia Gemma 4 | Hugging Face |
| budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300 | No disponible | No disponible | Misma receta, semilla 42, paso 300 | Apache 2.0 | Hugging Face |
| budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170 | No disponible | No disponible | Misma receta, semilla 43, paso 170 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en matemáticas mediante RL; su comportamiento fuera de ese dominio puede degradarse respecto al modelo base y no está evaluado.
- Riesgo de alucinación en la cadena de razonamiento: la recompensa binaria sobre la respuesta final no garantiza que los pasos intermedios sean correctos.
- El truncado a 2.048 tokens sigue aplicándose en inferencia; problemas que requieran razonamientos más largos pueden perder exactitud.
- No se documentan idiomas soportados; el prompt de entrenamiento está en inglés, por lo que el rendimiento en castellano no está validado.
- Es un checkpoint intermedio (paso 230) de una ablación de semillas, no un modelo de producción; la varianza entre semillas puede ser significativa y no se publican métricas.
- La licencia Apache 2.0 se declara heredada del modelo base, pero el enlace apunta a la licencia de Gemma 4 de Google; conviene revisar los términos de esa licencia antes de un uso comercial.
- Pesos en F32 y repositorio de 20,5 GB: el despliegue en hardware limitado exige cuantización propia, sin garantías de que preserve la exactitud del ajuste.
- Sin descargas ni likes en el momento de la consulta y sin citation completa (la model card indica "TODO"), lo que limita la trazabilidad académica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s230
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Checkpoint hermano (semilla 42, paso 300): https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300
- Checkpoint hermano (semilla 43, paso 170): https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170
- Checkpoint hermano (semilla 43, paso 300): https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300
- Checkpoint hermano (semilla 44, paso 300): https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300
