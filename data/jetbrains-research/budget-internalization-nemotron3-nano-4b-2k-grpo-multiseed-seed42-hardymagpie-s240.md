# JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16, desarrollado por el equipo de investigación de JetBrains (JetBrains-Research). El objetivo es internalizar un presupuesto fijo de generación de 2.048 tokens para razonamiento matemático, de modo que el modelo aprenda a producir respuestas correctas dentro de ese límite sin necesidad de escalado en tiempo de test. Forma parte del trabajo recogido en el artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

El modelo tiene 3.973.556.832 parámetros (aproximadamente 4B) y se distribuye en formato safetensors con pesos en F32, con un tamaño de repositorio de 15,9 GB. La arquitectura declarada es `nemotron_h`, propia de la familia Nemotron, y la librería de referencia es transformers. Se trata de un checkpoint intermedio (paso 240) seleccionado como el mejor de su ejecución por precisión de validación, dentro de un ablation de semillas (42, 43, 44) sobre la misma receta.

El problema que aborda es relevante para el despliegue en producción: los modelos de razonamiento suelen mejorar su precisión aumentando la longitud de la cadena de pensamiento en tiempo de inferencia, lo que encarece y ralentiza el servicio. Este ajuste busca que el modelo rinda bien con un presupuesto acotado y predecible de tokens, lo que facilita la planificación de costes y latencia en pipelines de razonamiento matemático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (transformers, custom_code) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (dtype F32) |

## Arquitectura y entrenamiento

El modelo parte de nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16, cuya arquitectura se etiqueta como `nemotron_h` y requiere `custom_code` en transformers. El ajuste se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto se truncan y se puntúan tal cual, lo que fuerza al modelo a internalizar el límite de 2.048 tokens de generación (`max_new_tokens`).

Los datos de entrenamiento provienen de DeepScaleR (matemáticas), con un máximo de 3 épocas. La configuración usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de calentamiento. La recompensa es binaria según la corrección de la respuesta, extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonar paso a paso y entregar la respuesta dentro de `\boxed{}`. Este repositorio corresponde al paso 240, elegido como mejor checkpoint por precisión de validación medida cada 10 pasos sobre 480 problemas reservados de DeepScaleR; el checkpoint final del paso 300 se publica en un repositorio aparte. Los pesos se guardan en F32.

## Capacidades

- Generación de texto con orientación a razonamiento paso a paso.
- Razonamiento matemático con respuestas finales extraíbles mediante etiquetas `\boxed{}`.
- Razonamiento bajo presupuesto fijo de 2.048 tokens de generación, internalizado durante el entrenamiento.
- Generación conversacional (etiqueta `conversational` y plantilla de chat del modelo base).
- Ajuste fino con RL (GRPO) sobre datos de matemáticas (DeepScaleR).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponible en la información proporcionada.

## Casos de uso

- Evaluación de investigación sobre internalización de presupuesto: el modelo sirve para reproducir y comparar la receta de RLVR con presupuesto fijo frente a escalado en tiempo de test, usando los checkpoints de las semillas 42, 43 y 44.
- Razonamiento matemático con coste acotado: al estar entrenado para un límite de 2.048 tokens, permite presupuestar latencia y coste por consulta en servicios de resolución de problemas matemáticos.
- Generación de soluciones con formato verificable: la extracción mediante `\boxed{}` facilita el parseo automático de respuestas en pipelines de corrección automática.
- Ajuste fino posterior como punto de partida: al ser un fine-tune del Nemotron-3-Nano-4B, puede servir de base para otras tareas de razonamiento con restricciones de longitud.
- Experimentos de ablation de semillas: los repositorios hermanos (seed 42, 43 y 44, pasos 240/280/290/300) permiten estudiar la varianza del entrenamiento RL.
- Despliegue en entornos con recursos limitados: con ~4B parámetros, es viable en GPUs de gama alta de consumo para prototipado, aunque los pesos publicados en F32 requieren conversión previa.
- Integración en pipelines de transformers: al usar `custom_code` y ser compatible con endpoints, puede servirse con la pila estándar de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR y que el paso 240 es el mejor checkpoint de esta ejecución, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los pesos publicados en F32 ocupan aproximadamente 15,9 GB; una conversión a BF16 rondaría los 8 GB y a cuantizaciones de 8 bits/4 bits sería considerablemente menor, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño (~4B), cabría esperar viabilidad en A100, H100 y GPUs de consumo de gama alta con suficiente VRAM, pero no se confirma.
- ¿Cabe en GPU de consumo? No confirmado; dependerá de la cuantización aplicada, que no está publicada.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`), endpoints compatibles con Hugging Face. vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240) | 3.973.556.832 | no disponible | nvidia-nemotron-open-model-license | Fine-tune RL de Nemotron-3-Nano-4B con presupuesto de 2.048 tokens |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4B | no disponible | nvidia-nemotron-open-model-license | Modelo base sin ajuste RL de presupuesto |
| Checkpoints hermanos del mismo ablation (seed 43, seed 44) | ~4B | no disponible | nvidia-nemotron-open-model-license | Misma receta, distintas semillas y pasos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en razonamiento matemático (DeepScaleR); su rendimiento en otras tareas no está documentado.
- El presupuesto de 2.048 tokens es una restricción de entrenamiento: las respuestas que lo superan se truncan, lo que puede degradar la calidad en problemas que requieran cadenas de razonamiento más largas.
- Riesgo de alucinación: no evaluado en la información disponible; es un riesgo inherente a los modelos generativos.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; el entrenamiento se realiza sobre un dataset matemático, presumiblemente en inglés, sin confirmación.
- Licencia: hereda la nvidia-nemotron-open-model-license del modelo base, con posibles restricciones para uso comercial; conviene revisar los términos del enlace oficial antes de desplegarlo en producción.
- Es un checkpoint intermedio (paso 240) de un ablation de semillas, no un modelo final consolidado; la model card indica que la citación está pendiente (TODO).
- Los pesos se publican en F32, lo que incrementa el espacio en disco y la VRAM necesaria frente a BF16.
- La arquitectura requiere `custom_code`, lo que puede complicar la integración con herramientas que no soporten código personalizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint paso 300 (seed 42): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s300
- Checkpoint seed 43, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s290
- Checkpoint seed 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s300
- Checkpoint seed 44, paso 280: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s280
- Checkpoint seed 44, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: no disponible (no se proporciona enlace)
