# JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s280

## Resumen
Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, desarrollado por JetBrains-Research, orientado a razonamiento matematico bajo un presupuesto fijo de generacion de 2048 tokens. Forma parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que estudia como el entrenamiento con un limite estricto de tokens internaliza ese presupuesto en el modelo en lugar de depender de escalado en tiempo de inferencia. El checkpoint publicado corresponde al paso 280 de una ablacion de semillas (42, 43 y 44); este repositorio usa la semilla 44 y el apodo de ejecucion `wantedwahoo`.

El modelo parte de la arquitectura Nemotron-H de NVIDIA, con aproximadamente 3.970 millones de parametros (3,973.556.832 segun los pesos en safetensors), y se entrena con GRPO sobre el dataset DeepScaleR-Preview de problemas matematicos. La relevancia practica esta en que busca mantener precision dentro de un presupuesto acotado, lo que reduce coste y latencia en produccion frente a modelos que necesitan cadenas de razonamiento muy largas. El repositorio ocupa 15,9 GB y los pesos se distribuyen en formato safetensors con `custom_code`, por lo que requiere `trust_remote_code` en Transformers.

Se trata de un artefacto de investigacion: no hay descargas ni likes, la model card no incluye resultados de benchmarks y la citacion esta marcada como TODO. La licencia heredada es la NVIDIA Nemotron Open Model License, no una licencia permisiva generica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (transformer hibrido, segun tag `nemotron_h`); detalles internos no disponibles |
| Parametros totales | 3.973.556.832 (aprox. 4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (dtype F32) |
| Presupuesto de generacion entrenado | 2048 tokens (`max_new_tokens`) |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 |
| Dataset de entrenamiento | agentica-org/DeepScaleR-Preview-Dataset (matematicas) |
| Algoritmo | GRPO con baseline leave-one-out, normalizacion de recompensa por grupo y loss a nivel de token |
| Checkpoint | paso 280 (mejor por accuracy de validacion) |
| Semilla | 44 (ablacion de semillas 42, 43, 44) |

## Arquitectura y entrenamiento
La arquitectura de base es Nemotron-H, identificada por el tag `nemotron_h` y el uso de `custom_code` en Transformers; la model card no detalla la composicion de capas, atencion o modulos hibridos, por lo que esos extremos quedan como no disponibles. El ajuste se realiza sobre el checkpoint BF16 de NVIDIA, aunque los pesos publicados de este repositorio estan en F32.

El entrenamiento usa GRPO con baseline leave-one-out, normalizacion de recompensa por grupo y loss a nivel de token. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`. Las respuestas que alcanzan el presupuesto de 2048 tokens se truncan y se puntuan tal cual, lo que es precisamente el mecanismo que fuerza la internalizacion del presupuesto. Se entrenan como maximo 3 epocas sobre DeepScaleR, con lotes de 32 prompts por 8 rollouts por paso, optimizador Adam, schedule coseno, LR pico de 2e-6 y 10 pasos de calentamiento. La ejecucion de este repositorio llega al paso 280, seleccionado como mejor checkpoint por accuracy de validacion medida cada 10 pasos sobre 480 problemas reservados de DeepScaleR. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`.

## Capacidades
- Generacion de texto y razonamiento matematico paso a paso, con salida de respuesta final en formato `\boxed{}`.
- Razonamiento bajo presupuesto fijo de 2048 tokens, con respuestas truncadas y puntuadas dentro de ese limite.
- Resolucion de problemas de competicion y matematicas escolares avanzadas del dominio DeepScaleR.
- Formato conversacional: la model card indica que el prompt se renderiza con la plantilla de chat del modelo base.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking explicito.
- Capacidades multilingues: no disponibles.

## Casos de uso
- Evaluacion de investigacion en RLVR: reproducir la ablacion de semillas (42, 43, 44) y comparar el checkpoint del paso 280 con el del paso 300 para medir estabilidad del entrenamiento y del mejor punto de validacion.
- Razonamiento matematico con coste acotado: desplegar el modelo con `max_new_tokens=2048` en un servicio de resolucion de problemas donde el coste por consulta debe ser predecible, aprovechando que el modelo fue entrenado para rendir dentro de ese limite.
- Generacion de soluciones con formato verificable: usar la extraccion de `\boxed{}` para validar respuestas de forma automatica en pipelines de correccion o benchmark interno.
- Fine-tuning posterior sobre dominios matematicos especificos: partir de este checkpoint ya alineado a presupuesto fijo para tareas como algebra, calculo o problemas tipo olimpiada, reduciendo el coste de RL adicional.
- Estudio de internalizacion de presupuesto: comparar curvas de accuracy frente a longitud generada entre este modelo y el base Nemotron-3-Nano-4B para cuantificar la ganancia de precision dentro de presupuesto.
- Prototipado de tutoria matematica: integrar el modelo en un asistente que explique pasos intermedios y devuelva una respuesta final etiquetada, con la advertencia de que no hay datos de benchmarks ni de calidad multilingue.
- Baseline en experimentos de decodificacion y truncado: usar el checkpoint para analizar como afecta el truncado a 2048 tokens a la precision, dado que el entrenamiento puntua las respuestas truncadas tal cual.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que la seleccion del checkpoint se basa en accuracy de validacion sobre 480 problemas reservados de DeepScaleR, sin cifras publicadas.

## Requisitos de hardware
- VRAM estimada para inferencia: con pesos F32 de 3,97B parametros, la carga completa requiere aproximadamente 15,9 GB solo para pesos, mas overhead de activaciones y cache KV; no se dispone de estimaciones oficiales.
- Cuantizaciones GGUF/AWQ/GPTQ: no disponibles en el repositorio; habria que generarlas a partir de los pesos safetensors.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, un modelo de 4B en F32 no cabe en GPUs consumer de 8-12 GB sin cuantizar; en BF16 o FP16 (aprox. 8 GB) podria caber en RTX 4090 (24 GB) y GPUs de 16 GB o mas, pero esto es una estimacion por tamano, no un dato del autor.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requerido por `custom_code`); compatibilidad con endpoints de inferencia segun tags. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (seed 44, paso 280) | 3,97B | no disponible | GRPO, presupuesto 2048 tokens, DeepScaleR | nvidia-nemotron-open-model-license | Hugging Face, 0 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | aprox. 4B | no disponible | Modelo base, sin RL especifico de presupuesto | nvidia-nemotron-open-model-license | Hugging Face (NVIDIA) |
| budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240 | aprox. 4B | no disponible | Misma receta, semilla 42, paso 240 | nvidia-nemotron-open-model-license | Hugging Face (JetBrains-Research) |
| budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s290 | aprox. 4B | no disponible | Misma receta, semilla 43, paso 290 | nvidia-nemotron-open-model-license | Hugging Face (JetBrains-Research) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la comparacion se limita a receta de entrenamiento, semilla y checkpoint.

## Limitaciones y advertencias
- Artefacto de investigacion sin benchmarks publicados ni cifras de accuracy de validacion; no hay evidencia cuantitativa de calidad frente al modelo base.
- Entrenado exclusivamente para matematicas con recompensa binaria de respuesta; el razonamiento general, codigo o tareas abiertas no estan cubiertos por el entrenamiento.
- El entrenamiento trunca a 2048 tokens y puntua las respuestas truncadas tal cual, lo que puede penalizar problemas que requieran cadenas de razonamiento mas largas.
- La longitud de contexto del modelo base no se documenta en la informacion disponible.
- Idiomas soportados no disponibles; no hay garantia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion y de respuestas plausibles pero incorrectas en problemas fuera de la distribucion de DeepScaleR; la recompensa binaria no entrena calibracion ni abstenerse.
- Licencia NVIDIA Nemotron Open Model License: no es una licencia permisiva generica; hay que revisar sus terminos antes de uso comercial.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del repositorio.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia; sin validacion externa de la comunidad.
- La citacion academica esta marcada como TODO en la model card.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s280
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Checkpoint paso 300 de la misma semilla: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s300
- Semilla 42, paso 240: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240
- Semilla 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s300
- Semilla 43, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s290
- Semilla 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s300
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
