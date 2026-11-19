# JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s290

## Resumen

Este modelo es un fine-tuning por aprendizaje por refuerzo de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, desarrollado por JetBrains-Research en el marco del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*. El objetivo no es maximizar la precision bruta, sino que el modelo aprenda a resolver problemas matematicos razonando dentro de un presupuesto fijo de generacion de 2.048 tokens, de modo que internalice la restriccion en lugar de depender de cadenas de razonamiento largas en tiempo de inferencia.

Se trata de un checkpoint intermedio (paso 290, mejor por precision de validacion) de una ablacion de semillas que entrena la misma receta con tres semillas (42, 43 y 44); este repositorio corresponde a la semilla 43 y al identificador interno `squareman`. El modelo base es un transformer de la familia Nemotron-3 en variante "Nano" con aproximadamente 3.970 millones de parametros, y el fine-tuning se realiza con GRPO sobre el dataset de matematicas DeepScaleR.

La relevancia practica esta en el control del coste de inferencia: en escenarios de produccion con limites estrictos de tokens de salida (por ejemplo, APIs con SLA de latencia o presupuestos de facturacion por peticion), un modelo que razona bien dentro de 2k tokens evita la penalizacion de calidad que sufre un modelo generico cuando se le trunca la respuesta a la fuerza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (tag `nemotron_h`, requiere `custom_code` en transformers) |
| Parametros totales | 3.973.556.832 (aprox. 3,97 B) |
| Parametros activos | no disponible (no se indica en la informacion proporcionada que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generacion entrenado es de 2.048 tokens, no la ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos publicados en F32; el modelo base se distribuye en BF16) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License (heredada del modelo base) |
| Formato de pesos | safetensors (dtype F32) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, una arquitectura etiquetada como `nemotron_h` que en transformers requiere carga con `trust_remote_code=True` (tag `custom_code`). No se dispone en la informacion proporcionada de detalles sobre la composicion interna de capas, atencion o posibles componentes hibridos del modelo base.

El fine-tuning emplea GRPO con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Se generan 8 rollouts por prompt con lotes de 32 prompts, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de calentamiento. El entrenamiento recorre el dataset DeepScaleR (matematicas) hasta 3 epocas, con un maximo de 290 pasos. La recompensa es binaria: acierto de la respuesta extraida de las etiquetas `\boxed{}`. Un detalle clave del diseno es que las respuestas que alcanzan el presupuesto de 2.048 tokens se truncan y se puntuan tal cual, lo que fuerza al modelo a producir razonamientos que quepan en ese limite. El prompt de entrenamiento pide razonamiento paso a paso y respuesta final dentro de `\boxed{}`.

## Capacidades

- Razonamiento matematico con presupuesto fijo de generacion de 2.048 tokens, orientado a mantener la precision cuando la salida se limita.
- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`), usando la plantilla de chat del modelo base.
- Razonamiento paso a paso con formato de respuesta en `\boxed{}`.
- Capacidad de "internalizacion de presupuesto": el modelo ha sido optimizado explicitamente para el regimen de truncado a 2k tokens.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso fuera del dominio matematico: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking explicito, vision o audio: no disponible.

## Casos de uso

- Evaluacion de investigacion sobre RLVR con presupuesto fijo: usar este checkpoint (y sus pares de semilla 42 y 44) para reproducir la ablacion de semillas del paper y medir la varianza entre semillas de la receta GRPO con recompensa binaria.
- Servicio de resolucion de problemas matematicos con SLA de tokens: desplegar el modelo con `max_new_tokens=2048` en un endpoint de generacion para responder consultas de algebra y aritmetica sin exceder el presupuesto de salida contratado, aprovechando que fue entrenado bajo truncado a ese limite.
- Comparacion de estrategias de test-time scaling: usar el modelo como brazo "in-budget" frente al modelo base sin fine-tuning para cuantificar la perdida de precision al truncar cadenas de razonamiento largas.
- Generacion de datos sinteticos de matematicas: producir soluciones con razonamiento acotado y respuesta verificable en `\boxed{}` para construir datasets de entrenamiento o de evaluacion con coste de generacion controlado.
- Pipeline de correccion automatica de ejercicios: integrar el modelo en un sistema que extraiga la respuesta de `\boxed{}` y la compare con la solucion de referencia, con latencia acotada por el presupuesto de 2k tokens.
- Estudio de formatos de prompt y plantillas de chat: al heredar la plantilla del modelo base y un prompt de entrenamiento concreto, sirve para analizar la sensibilidad de la precision al formato de instruccion en modelos pequenos ajustados con RL.
- Baseline en investigacion de eficiencia: punto de comparacion para metodos de destilacion o decodificacion especulativa que busquen reducir tokens generados sin perder acierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, y que el paso 290 es el mejor checkpoint de esta ejecucion por esa metrica; no se proporcionan los valores numericos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en F32 (aprox. 15,9 GB de repositorio), por lo que cargar en F32 requiere del orden de 16 GB solo para pesos; en BF16 serian aproximadamente 8 GB y en cuantizacion de 8 bits alrededor de 4 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, una GPU con 16-24 GB de VRAM es suficiente para pesos en BF16 o F32 con margen para el KV cache segun contexto.
- Cabe en GPU de consumo: previsiblemente si en tarjetas de 16-24 GB (por ejemplo, RTX 4080/4090) con pesos en BF16, y en GPUs de 8-12 GB con cuantizacion, aunque no hay confirmacion oficial ni artefactos GGUF publicados en este repositorio.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por la arquitectura `nemotron_h`); compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible en la informacion proporcionada, y la ausencia de pesos GGUF en el repo limita el uso directo en llama.cpp/Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (budget-internalization, seed 43, s290) | 3,97 B | no disponible (presupuesto de generacion 2.048) | GRPO sobre DeepScaleR, 290 pasos | NVIDIA Nemotron Open Model License | Hugging Face, repo de 15,9 GB |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | 4 B (aprox.) | no disponible | Modelo base, sin el RL de presupuesto | NVIDIA Nemotron Open Model License | Hugging Face |
| budget-internalization, seed 42 (`hardymagpie`, s240/s300) | 3,97 B | no disponible (presupuesto 2.048) | Misma receta, semilla 42 | NVIDIA Nemotron Open Model License | Hugging Face |
| budget-internalization, seed 44 (`wantedwahoo`, s280/s300) | 3,97 B | no disponible (presupuesto 2.048) | Misma receta, semilla 44 | NVIDIA Nemotron Open Model License | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, receta y licencia.

## Limitaciones y advertencias

- Especializacion estrecha: el entrenamiento se limita a matematicas (DeepScaleR) con recompensa binaria de respuesta; el rendimiento en otras tareas no esta caracterizado y probablemente degrade capacidades generales del modelo base.
- Checkpoint intermedio: el paso 290 es el mejor por validacion, pero no es el checkpoint final (paso 300), que se publica en un repositorio separado; conviene fijar explicitamente la revision al desplegar.
- Sensibilidad al formato: el modelo fue entrenado con un prompt concreto y salida en `\boxed{}`; desviarse de ese formato puede reducir la precision de extraccion de respuestas.
- Riesgo de alucinacion: no se han publicado evaluaciones de calibracion ni de tasas de error fuera del conjunto de validacion de DeepScaleR.
- Sesgos: no disponible; no se documentan analisis de sesgo ni composicion del dataset mas alla de DeepScaleR.
- Idiomas: no se especifican idiomas soportados; el entrenamiento esta en ingles (prompt de entrenamiento en ingles), por lo que el uso en castellano no esta validado.
- Licencia: hereda la NVIDIA Nemotron Open Model License, que no es una licencia de codigo abierto estandar; es necesario revisar sus terminos para uso comercial y redistribucion antes de desplegar en produccion.
- Carga tecnica: requiere `trust_remote_code=True` por la arquitectura `nemotron_h`, lo que implica ejecutar codigo custom del repositorio; auditar antes de usar en entornos sensibles.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ/GPTQ en el repositorio, lo que complica el despliegue en hardware de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s290
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint final de la misma ejecucion (paso 300): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s300
- Semilla 42, paso 240: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240
- Semilla 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s300
- Semilla 44, paso 280: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s280
- Semilla 44, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper (*Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*): no disponible enlace en la informacion proporcionada
- Repositorio de codigo o demo: no disponible
