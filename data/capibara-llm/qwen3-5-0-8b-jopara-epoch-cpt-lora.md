# Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT-LoRA

## Resumen

Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT-LoRA es un ajuste fino (fine-tuning) del modelo base unsloth/Qwen3.5-0.8B, desarrollado por el usuario Capibara-LLM y publicado en Hugging Face. Se trata de un adaptador LoRA resultante de un proceso de entrenamiento continuado (continual pre-training, indicado por el sufijo "CPT" en el nombre) sobre una única época ("Epoch"), orientado a generación de texto. El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado únicamente para el idioma inglés.

El modelo hereda la arquitectura y el tamaño del Qwen3.5-0.8B original de la familia Qwen, es decir, aproximadamente 800 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños aptos para despliegue en hardware de consumo. El repositorio ocupa 1,1 GB y los pesos se almacenan en formato safetensors, con compatibilidad declarada con transformers y text-generation-inference.

La relevancia de esta ficha es limitada desde el punto de vista de la investigación: se trata de un experimento de ajuste fino comunitario, sin model card detallada, sin datos de benchmarks publicados y sin documentación sobre el dataset de entrenamiento. Resulta útil como ejemplo de flujo de trabajo con Unsloth y TRL para fine-tuning eficiente de modelos pequeños, pero no debe considerarse un modelo listo para producción sin una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-0.8B); detalles no disponibles |
| Parametros totales | ~0,8 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-0.8B, un transformer de aproximadamente 800 millones de parámetros. El sufijo "LoRA" del nombre indica que el ajuste se realizó mediante Low-Rank Adaptation, técnica que congela los pesos originales e introduce matrices de bajo rango entrenables, reduciendo drásticamente el coste computacional y de memoria del fine-tuning. El sufijo "CPT" sugiere un entrenamiento continuado (continual pre-training) sobre el modelo base, aunque la model card no detalla la composición del dataset ni el número de tokens utilizados.

Según la model card, el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que el autor describe como "2x faster" respecto a un flujo estándar. No se especifica si hubo RLHF, DPO u otras etapas de alineación posteriores, ni se documentan hiperparámetros, tamaño del dataset o procedimiento de evaluación. La información sobre la arquitectura interna del Qwen3.5-0.8B (tipo de atención, número de capas, dimensiones) no está disponible en la información proporcionada.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3.5-0.8B.
- Ajuste específico orientado a pre-entrenamiento continuado, sin capacidades adicionales documentadas por el autor.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Experimentación con fine-tuning eficiente: el modelo sirve como referencia práctica para desarrolladores que quieran replicar un flujo de entrenamiento continuado con Unsloth y TRL sobre un modelo de 0,8B, dado que el repositorio documenta explícitamente estas herramientas.
- Generación de texto ligera en inglés: adecuado para tareas de completado de texto o redacción asistida en entornos con recursos limitados, gracias a su tamaño de ~800M de parámetros y pesos en safetensors.
- Prototipado rápido en local: al caber en GPU de consumo, permite iterar sobre prompts y evaluar el efecto del ajuste LoRA antes de escalar a modelos mayores.
- Base para nuevos ajustes finos: al ser un LoRA sobre Qwen3.5-0.8B, puede servir como punto de partida para adaptaciones posteriores a dominios específicos mediante técnicas como QLoRA.
- Evaluación comparativa de técnicas de CPT: útil en investigación para medir el impacto de una época de pre-entrenamiento continuado frente al modelo base sin ajustar.
- Docencia y demostraciones: su reducido tamaño y licencia Apache 2.0 facilitan su uso en talleres sobre fine-tuning y despliegue de modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~0,8B en fp16 se estiman del orden de 2 GB de pesos, y en cuantización de 4 bits alrededor de 0,5-1 GB, aunque estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutarlo en fp16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no hay confirmación oficial.
- Opciones de despliegue: transformers y text-generation-inference según las etiquetas del repositorio; llama.cpp, Ollama o vLLM no están documentados para este modelo concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT-LoRA | ~0,8B | no disponible | Apache 2.0 | Hugging Face |
| unsloth/Qwen3.5-0.8B (modelo base) | ~0,8B | no disponible | no disponible | Hugging Face |
| Modelos comparables de ~1B | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Model card mínima: no se documentan dataset de entrenamiento, hiperparámetros ni procedimiento de evaluación, lo que impide reproducir el ajuste o validar su calidad.
- Sin benchmarks: no hay evidencia publicada de rendimiento frente al modelo base ni frente a alternativas.
- Idioma limitado: el repositorio declara únicamente inglés; el comportamiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño, agravado por la ausencia de evaluación documentada.
- Sesgos: no documentados; al derivar de un modelo base comunitario sin información sobre el dataset de ajuste, los sesgos son desconocidos.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base unsloth/Qwen3.5-0.8B, cuya licencia no se detalla en la información proporcionada.
- Producción: no recomendado sin una evaluación exhaustiva previa, dado el carácter experimental del ajuste y la falta de datos de validación.
- Contexto: la longitud de contexto no está disponible, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT-LoRA
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
