# ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e1

## Resumen

Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e1 es un adaptador PEFT de tipo QLoRA publicado por el usuario ahmedelgebaly sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango (LoRA) que deben cargarse junto al modelo base original para su uso. El adaptador se ha entrenado para generación de respuestas de tipo pregunta-respuesta científica sobre el dataset ahmedelgebaly/SciQ_Alpaca, derivado del corpus SciQ y formateado en estilo Alpaca.

El modelo se enmarca en un barrido de ablación de épocas denominado "AAST 2026 SciQ QLoRA Epoch Ablation Scenario 4.1", y esta checkpoint concreto (época 1) se marca como el recomendado de esa familia por presentar la menor pérdida de validación (0,8662) y una perplejidad de validación de 2,3779. El repositorio ocupa solo 0,4 GB, lo que confirma que contiene únicamente los pesos del adaptador y no los del modelo base de 8 mil millones de parámetros.

Su relevancia es limitada y muy específica: sirve como ejemplo reproducible de ajuste fino eficiente en memoria sobre Llama 3.1 para dominios científicos, y como punto de partida para quien quiera evaluar el efecto de una sola época de QLoRA en tareas de QA científico. No es un modelo de propósito general ni compite con modelos instructivos completos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Llama 3.1 8B Instruct); adaptador LoRA de bajo rango |
| Parámetros totales | 8B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables (r=32) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.1 8B Instruct soporta 128 000 tokens |
| Tipos de cuantización | Entrenamiento en QLoRA 4-bit NF4; el adaptador puede combinarse con el base en 4-bit, 8-bit o FP16/BF16 |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 8B parámetros con la arquitectura estándar de Llama 3.1 (atención con RoPE, GQA y MLP SwiGLU). El ajuste se realizó con QLoRA, es decir, el modelo base se cuantizó a 4 bits en formato NF4 y se entrenaron únicamente matrices de bajo rango con r=32, alpha=64 y dropout de 0,05. El entrenamiento se ejecutó con Axolotl y PEFT, con una longitud de secuencia de 512 tokens, learning rate de 2e-4 con scheduler coseno, batch efectivo de 16 y un total de 260 pasos durante 1 época.

El dataset de entrenamiento es ahmedelgebaly/SciQ_Alpaca, una versión en formato Alpaca (instruction/input/output) del corpus SciQ, orientado a preguntas de ciencia de nivel escolar y divulgativo. No se documenta el número exacto de ejemplos, la composición detallada del dataset ni si hubo etapas de RLHF o DPO; el adaptador hereda el alineamiento del modelo base Instruct. La innovación técnica es mínima: se trata de un experimento de ablación de épocas, no de una propuesta arquitectónica nueva.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas de temática científica, especialmente en el formato instruction/input/output del dataset de entrenamiento.
- Razonamiento básico y explicación de conceptos de ciencia, heredado del modelo base y reforzado por el ajuste en SciQ.
- Capacidad multilingüe heredada del modelo base Llama 3.1, aunque no se documenta el comportamiento específico del adaptador en idiomas distintos del inglés.
- Soporte de tool calling y function calling heredado del modelo base Instruct, no verificado tras el ajuste fino.
- No se documenta soporte de visión, audio, modo thinking explícito ni agentes multi-paso específicos del adaptador.
- El adaptador no añade tokens especiales ni cambios de tokenizer; usa el tokenizer del modelo base.

## Casos de uso

- Evaluación de técnicas QLoRA: sirve como referencia reproducible para medir el efecto de una época de ajuste con r=32 sobre Llama 3.1 8B Instruct en una tarea concreta, comparando pérdida de validación y perplejidad frente a otros checkpoints del mismo barrido.
- Prototipado de asistentes de divulgación científica: el adaptador puede integrarse en un chatbot que responda preguntas de ciencia de nivel educativo, aprovechando el formato Alpaca del entrenamiento para estructurar las respuestas.
- Generación de material didáctico: producción de pares pregunta-respuesta y explicaciones breves para plataformas de aprendizaje, con revisión humana posterior dado el riesgo de alucinación.
- Investigación académica sobre ajuste eficiente: útil en entornos con recursos limitados, ya que el adaptador ocupa 0,4 GB y puede entrenarse o cargarse en una única GPU consumer con cuantización 4-bit.
- Base para ajustes posteriores en dominio científico: punto de partida para fine-tuning adicional sobre otros corpus de ciencia, al estar ya adaptado al estilo de QA científico.
- Experimentos de comparación de checkpoints: permite analizar cómo varía la calidad de las respuestas entre épocas dentro del mismo barrido de ablación, usando la pérdida de validación como métrica de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de validación del entrenamiento:

| Métrica | Valor |
|---|---|
| Val loss | 0,8662 |
| Val PPL | 2,3779 |
| Pasos de entrenamiento | 260 |
| Épocas | 1 |

No hay datos de MMLU, HumanEval, GSM8K ni de comparación con otros modelos.

## Requisitos de hardware

- El adaptador en sí ocupa 0,4 GB en disco; el modelo base Llama 3.1 8B Instruct requiere espacio adicional según la cuantización (aproximadamente 4-5 GB en 4-bit, 8-9 GB en 8-bit y 16 GB en BF16).
- VRAM estimada para inferencia: en torno a 6-8 GB con cuantización 4-bit, 10-12 GB en 8-bit y 18-20 GB en BF16, sumando el adaptador y el overhead de activaciones.
- GPU recomendadas: A100 40/80 GB o H100 para BF16 sin cuantizar; RTX 4090 (24 GB) para BF16 o 8-bit; RTX 3090, 4080 o 4070 Ti para 4-bit.
- Cabe en GPU consumer: sí, en 4-bit en tarjetas con 8 GB o más, y en BF16 en tarjetas de 24 GB.
- Opciones de despliegue: transformers + PEFT (carga documentada en la model card), vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e1 | 8B (base) + adaptador LoRA | no disponible (base: 128k) | Adaptador QLoRA sobre Llama 3.1 | llama3.1 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128 000 tokens | Modelo instruct completo | llama3.1 | Hugging Face, ampliamente usado |
| Adaptadores SciQ QLoRA de otros autores | 8B (base) | depende del base | Adaptador LoRA | variable | no disponible |
| Modelos de QA científico especializados (p. ej. SciBERT, BioBERT) | 110M-340M | 512 tokens | Encoder especializado en ciencia | variable | Hugging Face |

La comparación directa con modelos de QA científico basados en encoder no es homogénea: este adaptador es generativo y depende del modelo base, mientras que SciBERT o BioBERT son extractivos y mucho más pequeños. Frente al Llama 3.1 8B Instruct original, la diferencia principal es el ajuste en formato Alpaca sobre SciQ, sin datos públicos que cuantifiquen la mejora.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y cargar el modelo base meta-llama/Llama-3.1-8B-Instruct, que está sujeto a aceptación de licencia en Hugging Face.
- Riesgo de alucinación en contenidos científicos: el ajuste con una sola época y 260 pasos sobre un dataset limitado no garantiza precisión factual; las respuestas deben validarse.
- Sesgos heredados del modelo base Llama 3.1, no evaluados ni mitigados en este adaptador.
- Idiomas soportados no documentados; el entrenamiento se realizó presumiblemente en inglés, por lo que el rendimiento en castellano no está verificado.
- Licencia llama3.1: el uso comercial está permitido bajo los términos de la Llama 3.1 Community License, pero existen restricciones (por ejemplo, para entidades con más de 700 millones de usuarios mensuales) y obligaciones de atribución.
- El checkpoint corresponde a la época 1 de un barrido; no se han publicado evaluaciones en benchmarks estándar ni comparaciones con el modelo base sin ajustar.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta el tamaño del dataset ni la composición exacta, lo que dificulta reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmedelgebaly/SciQ_Alpaca
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Repositorio Axolotl: https://github.com/axolotl-ai-cloud/axolotl
- Repositorio PEFT: https://github.com/huggingface/peft
- Paper original de SciQ: no disponible en la información proporcionada
