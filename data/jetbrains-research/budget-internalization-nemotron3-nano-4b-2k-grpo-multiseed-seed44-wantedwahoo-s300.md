# JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo de NVIDIA Nemotron-3 Nano 4B, desarrollado por JetBrains Research. El objetivo concreto es internalizar un presupuesto fijo de generación de 2.048 tokens para razonamiento matemático: en lugar de dejar que el modelo decida cuánto "pensar" en tiempo de inferencia, el entrenamiento le enseña a resolver problemas dentro de ese límite y a producir respuestas correctas sin necesidad de cadenas de razonamiento más largas. El checkpoint publicado corresponde al paso 300 de una receta GRPO sobre el dataset DeepScaleR, con semilla 44 dentro de un estudio de ablación de tres semillas (42, 43, 44).

La relevancia es metodológica: forma parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que investiga el compromiso entre escalado en tiempo de test (dejar que el modelo genere más tokens) y precisión dentro de un presupuesto fijo. Para desarrolladores, esto se traduce en un modelo de ~3,97 mil millones de parámetros que promete un coste de inferencia predecible y acotado, algo atractivo en entornos de producción donde la latencia y el gasto por consulta deben ser estables.

El modelo base es NVIDIA Nemotron-3 Nano 4B en BF16, publicado bajo la NVIDIA Nemotron Open Model License. Este ajuste conserva esa licencia y se distribuye en formato safetensors con código de arquitectura personalizado (`nemotron_h`), lo que implica que la carga requiere confiar en el código remoto del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (identificador `nemotron_h`, código personalizado en transformers) |
| Parametros totales | 3.973.556.832 (~3,97 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32; el modelo base está en BF16) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license (heredada del modelo base) |
| Formato de pesos | safetensors (dtype F32), con `custom_code` |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Nemotron-3 Nano 4B, una arquitectura de la familia Nemotron-H identificada en transformers como `nemotron_h` con código personalizado. No se detalla en la información disponible la composición interna (número de capas, tipo de atención, posible hibridación con capas de estado) ni la longitud de contexto nativa; esos datos deben consultarse en la model card del modelo base.

El ajuste se realizó con GRPO (Group Relative Policy Optimization) usando baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. El presupuesto de generación se fijó en `max_new_tokens = 2048`; las respuestas que alcanzan el límite se truncan y se puntúan tal cual, de modo que el modelo aprende implícitamente a cerrar su razonamiento dentro de ese margen. Los datos son DeepScaleR (matemáticas), con un máximo de 3 épocas, batch de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de calentamiento. La recompensa es binaria: corrección de la respuesta extraída de las etiquetas `\boxed{}`. El entrenamiento totalizó 300 pasos y los pesos se guardaron en F32. La prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, orientado a problemas de competición del estilo DeepScaleR.
- Resolución de problemas dentro de un presupuesto fijo de 2.048 tokens de generación, con tendencia a autocerrar el razonamiento.
- Extracción estructurada de la respuesta final mediante etiquetas `\boxed{}`.
- Modo conversacional: la plantilla de chat del modelo base se usa para renderizar los turnos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso fuera del dominio matemático: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Evaluación de investigación sobre presupuestos de razonamiento: reproducir el experimento de internalización de presupuesto comparando este checkpoint (semilla 44, paso 300) con los de semillas 42 y 43 para medir varianza entre semillas en precisión matemática.
- Tutoría matemática con coste acotado: desplegar el modelo en un servicio de resolución de problemas donde cada consulta tiene un techo estricto de 2.048 tokens generados, lo que facilita presupuestar GPU y latencia por petición.
- Generación de soluciones con formato verificable: integrar la salida en un pipeline que parsee `\boxed{}` para validación automática de respuestas en entornos educativos o de evaluación.
- Benchmarking de RLVR en modelos pequeños: usar el checkpoint como referencia de un modelo de ~4B entrenado con GRPO y recompensa binaria para comparar contra modelos de tamaño similar en tareas de matemáticas.
- Estudio de ablación de semillas: servir los tres checkpoints finales (42, 43, 44) tras una misma interfaz para analizar estabilidad del entrenamiento y sensibilidad al azar inicial.
- Prototipado de razonamiento con contexto de conversación: emplear la plantilla de chat del modelo base para construir asistentes de resolución de problemas en una sola vuelta, con prompts que incluyan instrucciones de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en F32 (~15,9 GB de repositorio) se necesitan al menos ~16 GB solo para pesos; en BF16 bajaría a ~8 GB y en cuantizaciones de 8 bits o 4 bits a ~4 GB y ~2 GB respectivamente, aunque no se han publicado GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 o H100 para inferencia en F32/BF16 sin cuantizar; RTX 4090 (24 GB) suficiente para BF16.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 y en GPUs de 8-12 GB si se cuantiza, aunque no hay artefactos de cuantización publicados.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` por el código personalizado `nemotron_h`); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Nemotron-3 Nano 4B, 2k GRPO, seed 44) | ~3,97 B | no disponible | GRPO sobre DeepScaleR, presupuesto 2.048 tokens | nvidia-nemotron-open-model-license | Checkpoint de investigación, paso 300 |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~3,97 B | no disponible | Modelo base | nvidia-nemotron-open-model-license | Sin ajuste RL específico de presupuesto |
| Checkpoints semilla 42 y 43 del mismo estudio | ~3,97 B | no disponible | Misma receta GRPO, pasos 240/290/300 | nvidia-nemotron-open-model-license | Permiten medir varianza entre semillas |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación de un estudio de ablación; no está pensado como modelo de producción generalista.
- El ajuste se limita a matemáticas (DeepScaleR) y a un presupuesto fijo de 2.048 tokens; el rendimiento fuera de ese dominio y de ese límite no está caracterizado.
- Las respuestas que alcanzan el presupuesto se truncan y se puntúan tal cual durante el entrenamiento, lo que puede producir soluciones incompletas si el problema excede el límite.
- Riesgo de alucinación y de respuestas incorrectas con formato válido: la recompensa es binaria sobre la extracción de `\boxed{}`, no garantiza corrección semántica general.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; el entrenamiento se realizó con prompts en inglés.
- Licencia: hereda la NVIDIA Nemotron Open Model License, con condiciones específicas para uso comercial que deben revisarse en el enlace oficial antes de desplegar.
- Requiere `trust_remote_code=True` por el código personalizado `nemotron_h`, lo que implica ejecutar código del repositorio.
- Pesos en F32: mayor uso de disco y memoria que el modelo base en BF16.
- Sin datos de benchmarks publicados en la información disponible, no es posible validar la mejora frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Checkpoint semilla 42 (paso 240): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240
- Checkpoint semilla 42 (paso 300): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s300
- Checkpoint semilla 43 (paso 290): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s290
- Checkpoint semilla 43 (paso 300): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s300
- Checkpoint semilla 44 (paso 280): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s280
