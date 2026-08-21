# Marvis12957/ai_in_action_lab21_qlora

## Resumen

El modelo `Marvis12957/ai_in_action_lab21_qlora` es un adaptador LoRA (Low-Rank Adaptation) entrenado con QLoRA en 4 bits sobre el modelo base `unsloth/Qwen3.5-4B`. Lo desarrolla Trần Văn Hiếu como parte de un laboratorio académico (lab 21) centrado en fine-tuning de LLMs, y su propósito es servir como grupo de control en un experimento de ablación: compara el rendimiento de un fine-tuning con LoRA en 16 bits frente a QLoRA en 4 bits, manteniendo idénticos el rango, la posición de los módulos y los datos de entrenamiento. El dominio de aplicación es el soporte al cliente en vietnamita.

El adaptador tiene un tamaño de repositorio de 0,1 GB y se distribuye bajo licencia Apache 2.0. Al ser un adaptador PEFT, no es un modelo autónomo: requiere cargar el modelo base y el adaptador conjuntamente. Su relevancia radica en documentar empíricamente el trade-off entre ahorro de memoria y degradación de rendimiento al usar QLoRA frente a LoRA estándar, un aspecto crítico para el despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base transformer (Qwen3.5-4B) |
| Parametros totales | No disponible (el adaptador tiene un tamano de 0,1 GB; el modelo base tiene 4B parametros) |
| Parametros activos | No disponible (adaptador LoRA, no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | 4-bit (QLoRA) para el adaptador; el modelo base se carga en 4-bit con BitsAndBytes |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA, una técnica que congela el modelo base en cuantización de 4 bits y entrena únicamente los adaptadores de bajo rango. En este caso, el modelo base es `unsloth/Qwen3.5-4B`, una versión optimizada de Qwen3.5 con 4 mil millones de parámetros. La configuración del adaptador incluye un rango (rank) de 16, una tasa de aprendizaje de 1e-4 y la aplicación de LoRA en 12 módulos de la capa text-linear. El entrenamiento se realizó en precisión 4-bit, consumiendo 7,09 GB de VRAM, frente a los 12,01 GB del run equivalente en 16 bits. No se especifica el número de tokens de entrenamiento ni la composición del dataset, pero el dominio es soporte al cliente en vietnamita.

La innovación técnica principal es la comparación controlada entre QLoRA y LoRA estándar: mismo rango, misma posición de módulos y mismos datos, variando únicamente la precisión de cuantización. Esto permite aislar el efecto de la cuantización en el rendimiento final.

## Capacidades

- Generación de texto en vietnamita orientada a soporte al cliente, con respuestas formateadas según el esquema esperado (format validity de 1.000).
- Fine-tuning específico para tareas de atención al cliente, probablemente incluyendo respuestas a consultas frecuentes y gestión de conversaciones multi-turno.
- Hereda las capacidades generales del modelo base Qwen3.5-4B (razonamiento, generación de texto, etc.), aunque no se documentan explícitamente en la model card.
- No se indica soporte para tool calling, agentes, visión ni audio.
- Capacidad multilingüe limitada: el fine-tuning se centra en vietnamita, aunque el modelo base podría soportar otros idiomas.

## Casos de uso

- Atención al cliente automatizada en vietnamita: el adaptador puede integrarse en un chatbot para responder consultas de clientes en tiempo real, aprovechando el fine-tuning específico para este dominio.
- Experimentación académica en fine-tuning eficiente: sirve como referencia para estudiar el impacto de QLoRA frente a LoRA en términos de precisión, latencia y consumo de VRAM.
- Despliegue en entornos con VRAM limitada: al requerir solo 7,09 GB durante el entrenamiento, el adaptador permite fine-tuning en GPUs de gama media (por ejemplo, T4 o L4 de 16 GB) donde un run de 16 bits no cabría.
- Evaluación de trade-offs en producción: las métricas documentadas (accuracy 0.940, latencia 1816.5 ms) permiten decidir si la reducción de memoria compensa la pérdida de rendimiento.
- Benchmarking de adaptadores PEFT: puede usarse como caso de estudio para comparar metodologías de fine-tuning en modelos de 4B parámetros.
- Soporte multilingüe en sistemas existentes: aunque el fine-tuning es en vietnamita, el adaptador puede combinarse con otros adaptadores para ampliar la cobertura de idiomas en un mismo modelo base.

## Benchmarks y rendimiento

La model card proporciona métricas de evaluación sobre 50 muestras objetivo, comparando el run QLoRA 4-bit con el run LoRA 16-bit:

| Metrica | QLoRA 4-bit | LoRA 16-bit |
|---|---|---|
| Target accuracy | 0.940 | 0.965 |
| Format validity | 1.000 | No disponible |
| Latencia | 1816.5 ms | No disponible (inferior en 24.9%) |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica, pero dado que el entrenamiento consumió 7,09 GB, la inferencia con el adaptador y el modelo base en 4-bit debería caber en GPUs con al menos 8 GB de VRAM.
- GPU recomendadas: el entrenamiento se realizó en una GPU con al menos 8 GB (probablemente T4 o L4 de 16 GB). Para inferencia, una RTX 3060 de 12 GB o superior sería suficiente.
- El adaptador cabe en GPUs de consumo (RTX 3060, RTX 4070, etc.) siempre que el modelo base se cargue en 4-bit.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con `transformers` y `peft`, o exportarse a GGUF para usarse con llama.cpp u Ollama. También es compatible con vLLM y TGI si se fusiona el adaptador con el modelo base.
- Latencia: 1816.5 ms por muestra en el entorno de evaluación, un 24.9% mayor que el run 16-bit.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ai_in_action_lab21_qlora` (este) | Adaptador QLoRA 4-bit sobre Qwen3.5-4B | 4B (base) | No disponible | Apache 2.0 | HuggingFace |
| `ai_in_action_lab21` (run 16-bit) | Adaptador LoRA 16-bit sobre Qwen3.5-4B | 4B (base) | No disponible | Apache 2.0 | HuggingFace |
| Guanaco (del paper QLoRA) | Modelo completo fine-tuneado con QLoRA | 7B-65B | 2048 | No comercial | GitHub |

La comparación directa más relevante es con el run 16-bit del mismo autor, que muestra una accuracy superior (0.965 vs 0.940) y menor latencia, a costa de un 41% más de VRAM durante el entrenamiento.

## Limitaciones y advertencias

- Es un adaptador experimental de un laboratorio académico, no un modelo de producción validado. No hay garantías de robustez en entornos reales.
- La accuracy de 0.940 sobre 50 muestras es un tamaño de muestra pequeño; los resultados pueden no ser estadísticamente significativos.
- El fine-tuning se limita al vietnamita; el rendimiento en otros idiomas no está evaluado.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de soporte al cliente donde la precisión es crítica.
- La latencia de 1816.5 ms puede ser demasiado alta para aplicaciones en tiempo real sin optimización adicional.
- No se documentan sesgos específicos, pero el modelo base puede heredar sesgos de sus datos de preentrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `unsloth/Qwen3.5-4B` puede tener restricciones adicionales que deben verificarse.

## Enlaces

- HuggingFace: https://huggingface.co/Marvis12957/ai_in_action_lab21_qlora
- Paper QLoRA: https://arxiv.org/abs/2305.14314
- Repositorio QLoRA: https://github.com/artidoro/qlora
- Blog del curso AI in Action (referencia del laboratorio): https://mikenguyen13.github.io/ai_in_action/703-parameter-efficient-finetuning-lora.html
