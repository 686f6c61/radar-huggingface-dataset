# ArthT/gemma2-9b-a2ctx-badmed-seed0-v2

## Resumen

El modelo `ArthT/gemma2-9b-a2ctx-badmed-seed0-v2` es un fine-tuning del modelo base Gemma 2 9B de Google, publicado por el usuario ArthT en HuggingFace. El nombre sugiere que se ha ajustado con una ventana de contexto de 2.048 tokens (a2ctx) y un dataset relacionado con el dominio médico ("badmed"), aunque la model card no proporciona detalles sobre el proceso de entrenamiento ni los datos utilizados. El repositorio contiene pesos en formato safetensors con un tamaño de 6,6 GB, lo que corresponde aproximadamente a una cuantización de 8 bits o a los pesos originales en bf16 de un modelo de 9.000 millones de parámetros.

Este modelo se presenta como un experimento de fine-tuning sobre Gemma 2 9B, probablemente orientado a tareas de procesamiento de lenguaje natural en el ámbito sanitario. Su relevancia radica en la posibilidad de adaptar un modelo base potente a un dominio específico con recursos limitados, aunque la falta de documentación y de resultados de evaluación impide validar su calidad. Al estar basado en Gemma 2, hereda las capacidades generales de generación de texto, razonamiento y código del modelo original, pero con un contexto reducido que limita su uso en tareas que requieran ventanas largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 2 9B) |
| Parametros totales | 9.000 millones (aproximado, basado en Gemma 2 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (según el nombre "a2ctx") |
| Tipos de cuantizacion | no disponible (pesos en safetensors, posiblemente bf16 o fp16) |
| Idiomas soportados | no disponible (Gemma 2 9B soporta multiples idiomas, pero este fine-tuning no especifica) |
| Licencia | no disponible (probablemente hereda la licencia Gemma de Google, pero no se confirma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 2 9B de Google, un transformer decoder-only con 9.000 millones de parámetros, que utiliza atención local y global alternada, así como normalización RMS y activaciones GeGLU. El fine-tuning ha sido realizado con la librería Unsloth, como indican las etiquetas del repositorio, lo que sugiere un entrenamiento eficiente en memoria. Sin embargo, la model card no proporciona información sobre el dataset de entrenamiento, el número de tokens, el método de alineación (RLHF, DPO, etc.) ni los hiperparámetros utilizados. El nombre "badmed" podría referirse a un dataset médico, pero no hay confirmación. La ventana de contexto se ha reducido a 2.048 tokens, lo que es significativamente menor que los 8.192 tokens del modelo base, probablemente para optimizar el uso de memoria durante el fine-tuning.

## Capacidades

- Generación de texto: al estar basado en Gemma 2 9B, conserva capacidades generales de generación de texto, aunque el fine-tuning puede haberlas especializado hacia el dominio médico.
- Razonamiento: el modelo base es capaz de razonamiento lógico y matemático básico, pero no hay evidencia de que el fine-tuning mejore o degrade estas capacidades.
- Codigo: Gemma 2 9B tiene habilidades de generación de código, pero no se ha evaluado en este fine-tuning.
- Multilingüe: Gemma 2 9B soporta varios idiomas, pero no se especifica si el fine-tuning mantiene esta capacidad.
- Tool calling: no se menciona soporte para function calling o herramientas.
- Agentes: no se menciona soporte para razonamiento multi-paso o uso de agentes.
- Capacidades especiales: no se documentan modos de pensamiento, visión o audio.

## Casos de uso

- Clasificación de textos médicos: el modelo podría utilizarse para clasificar informes clínicos o notas médicas en categorías predefinidas, aprovechando el fine-tuning en el dominio "badmed". Su contexto de 2.048 tokens es suficiente para documentos cortos.
- Extracción de entidades médicas: podría emplearse para identificar medicamentos, síntomas o diagnósticos en textos clínicos, aunque no se ha validado su precisión.
- Generación de resúmenes de historiales: con un contexto limitado, podría resumir fragmentos de historiales médicos, pero no documentos largos completos.
- Chatbot de consultas médicas básicas: podría integrarse en un sistema de preguntas y respuestas sobre salud, siempre que las respuestas se supervisen por personal cualificado.
- Análisis de literatura biomédica: para resumir abstracts de artículos científicos, dado que suelen ser cortos.
- Investigación académica: como base para experimentos de fine-tuning en el dominio médico, comparando el efecto de reducir el contexto frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este fine-tuning. Tampoco se comparan con el modelo base Gemma 2 9B ni con otros modelos similares.

## Requisitos de hardware

- VRAM estimada: para inferencia con pesos en bf16 (6,6 GB), se necesitan al menos 8 GB de VRAM, aunque con cuantización a 4 bits (GGUF) podría reducirse a unos 5-6 GB.
- GPU recomendadas: una RTX 3060 de 12 GB o superior sería suficiente para inferencia en bf16. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con al menos 24 GB (RTX 3090, A10G, A100).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 3060, RTX 4070, etc., siempre que se use cuantización o se limite el batch.
- Opciones de despliegue: al ser un modelo de la familia transformers, se puede servir con vLLM, TGI, o mediante llama.cpp si se convierte a GGUF. También es compatible con Ollama si se exporta.
- Latencia y throughput: no se han publicado datos. En una RTX 4090, un modelo de 9B en bf16 suele generar entre 30 y 60 tokens por segundo, pero esto es una estimación general, no específica para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ArthT/gemma2-9b-a2ctx-badmed-seed0-v2 | 9B | 2.048 | no disponible | HuggingFace |
| google/gemma-2-9b | 9B | 8.192 | Gemma Terms of Use | HuggingFace, Kaggle |
| google/gemma-2-9b-it | 9B | 8.192 | Gemma Terms of Use | HuggingFace, Kaggle |

El modelo base Gemma 2 9B tiene un contexto 4 veces mayor y está documentado con benchmarks oficiales. La versión "it" está instruida para seguir instrucciones, mientras que este fine-tuning no especifica si ha sido entrenado con instrucciones. No se dispone de otros modelos comparables en el dominio médico con el mismo tamaño y contexto reducido.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de Gemma 2, puede heredar sesgos del modelo base, y el dataset "badmed" podría introducir sesgos adicionales no documentados.
- Riesgo de alucinacion: no se ha evaluado, pero es probable que el modelo genere información médica incorrecta o inventada, lo que es peligroso en un dominio crítico como la salud.
- Limitaciones de contexto: la ventana de 2.048 tokens es muy corta para tareas que requieran razonamiento sobre documentos largos o conversaciones extensas.
- Limitaciones de idioma: no se especifican los idiomas soportados; si el fine-tuning se hizo solo con datos en inglés, el rendimiento en otros idiomas puede degradarse.
- Restricciones de licencia: la licencia no está indicada. Si hereda la licencia Gemma, el uso comercial está permitido con restricciones (ver términos de Google), pero no se puede confirmar.
- Caveat para producción: no se recomienda su uso en entornos clínicos reales sin una validación exhaustiva y supervisión humana, dado que no hay documentación de evaluación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ArthT/gemma2-9b-a2ctx-badmed-seed0-v2
- Modelo base Gemma 2 9B: https://huggingface.co/google/gemma-2-9b
- Model card de Gemma 2 (Google AI): https://ai.google.dev/gemma/docs/core/model_card_2
- Lista de recursos Gemma: https://github.com/google-gemma/awesome-gemma
- Página de Gemma 2 9B en Open Source AI Models: https://opensourceaimodels.net/models/gemma-2-9b
