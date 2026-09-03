# Lokhidor/medical-triage-qwen3-sft-lora-8k

## Resumen

El modelo `Lokhidor/medical-triage-qwen3-sft-lora-8k` es un ajuste fino (fine-tune) mediante LoRA del modelo base Qwen/Qwen3-1.7B-Base, orientado a la tarea de triaje médico, es decir, la clasificación de la urgencia de síntomas y la priorización de pacientes. Ha sido desarrollado por el usuario Lokhidor y entrenado con la librería TRL (Transformers Reinforcement Learning) mediante aprendizaje supervisado (SFT). El nombre del repositorio sugiere una ventana de contexto de 8.000 tokens, aunque este dato no está confirmado en la documentación.

Este modelo resulta relevante porque, al partir de una arquitectura densa de solo 1.700 millones de parámetros, puede desplegarse en entornos con recursos de hardware limitados, como clínicas pequeñas o dispositivos periféricos, manteniendo capacidades de razonamiento y generación de texto propias de la familia Qwen3. No obstante, la información pública disponible es escasa: no se especifican los datos de entrenamiento, el proceso de ajuste ni los resultados de evaluación, por lo que su uso en producción debe considerarse experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 1.700 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.000 tokens (sugerido por el nombre, no confirmado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (el modelo base Qwen3 soporta multilingüe, pero el fine-tune no especifica) |
| Licencia | no disponible (el README indica "licence: license", sin detallar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-1.7B-Base, un transformer denso con atención completa y Grouped Query Attention (GQA), según las especificaciones de la familia Qwen3. El ajuste se realizó mediante LoRA (Low-Rank Adaptation) sobre el modelo base, utilizando la librería TRL en su versión 1.12.0, con el framework Transformers 5.16.1 y PyTorch 2.10.0. El proceso de entrenamiento fue de tipo SFT (Supervised Fine-Tuning), pero no se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas adicionales como RLHF o DPO. La ausencia de esta información impide evaluar la calidad del ajuste y su posible sesgo hacia dominios específicos.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3, conserva las capacidades generales de generación y razonamiento del modelo base, aunque el fine-tune puede haberlas especializado hacia el dominio médico.
- Triaje médico: el propósito declarado es la clasificación de urgencia de síntomas y la priorización de pacientes, aunque no se han publicado ejemplos concretos de comportamiento.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible, aunque el modelo base Qwen3 soporta razonamiento en varios pasos.
- Capacidades multilingües: no especificadas para este fine-tune; el modelo base Qwen3 es multilingüe, pero el ajuste podría haber reducido este soporte.
- Capacidades especiales: no se mencionan modos de pensamiento, visión o audio.

## Casos de uso

- Triaje de pacientes en urgencias: el modelo puede recibir una descripción de síntomas y devolver una categoría de urgencia (por ejemplo, leve, moderado, grave). Su tamaño reducido permite ejecutarlo en servidores modestos o incluso en estaciones de trabajo con GPU consumer.
- Asistente de consulta médica básica: puede responder preguntas frecuentes sobre síntomas y recomendaciones generales, siempre bajo supervisión de personal sanitario.
- Clasificación de mensajes de pacientes en telemedicina: integrado en un chatbot, puede priorizar los mensajes que requieren atención inmediata.
- Soporte en entornos con recursos limitados: al ser un modelo de 1.7B, puede desplegarse en hardware de gama baja, como una RTX 3060 o incluso CPU con cuantización.
- Investigación académica: útil como punto de partida para experimentos de fine-tune en dominios médicos con pocos recursos computacionales.
- Prototipos de sistemas de apoyo a la decisión clínica: combinado con un pipeline de FastAPI y vLLM, como se muestra en el repositorio similar de Jojo4911, puede servir para construir un agente de triaje funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de triaje médico. Se recomienda realizar una evaluación propia antes de cualquier uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1.7B, en FP16 requiere aproximadamente 3,5 GB de VRAM; en cuantización int8, alrededor de 2 GB; en int4, menos de 1,5 GB. Estos valores son estimaciones típicas para modelos de este tamaño, no datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3060 o superior. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con GPU consumer: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers con pipeline, TGI (Text Generation Inference). El repositorio similar de Jojo4911 muestra un despliegue con vLLM y FastAPI.
- Latencia y throughput: no disponibles. Para un modelo de 1.7B en una GPU moderna, se espera una latencia de decenas de milisegundos por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Lokhidor/medical-triage-qwen3-sft-lora-8k | 1.7B (LoRA) | 8k (sugerido) | no disponible | Triaje médico |
| Qwen/Qwen3-1.7B-Base | 1.7B | 32k (modelo base) | Apache 2.0 | Modelo base general |
| Jojo4911/medical-triage-llm (fine-tune similar) | 1.7B (LoRA) | no disponible | no disponible | Triaje médico bilingüe FR/EN |

La comparativa se basa en el tamaño y el propósito. El modelo base Qwen3-1.7B tiene una licencia Apache 2.0 y un contexto de 32k, mientras que este fine-tune no especifica licencia ni contexto confirmado. El repositorio de Jojo4911 es un proyecto similar que añade DPO y un pipeline de servicio, pero no se dispone de métricas comparativas.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información específica, pero el modelo base Qwen3 puede presentar sesgos de género, etnia o socioeconómicos, que podrían amplificarse en el dominio médico.
- Riesgo de alucinación: como todo LLM, puede generar respuestas incorrectas o inventadas, lo que es especialmente peligroso en contextos clínicos. No debe utilizarse como sustituto del juicio médico.
- Limitaciones de contexto: si el contexto es de 8k tokens, puede ser insuficiente para historiales clínicos largos.
- Limitaciones de idioma: no se especifican los idiomas soportados; el fine-tune podría estar limitado a un idioma concreto (posiblemente inglés o francés, según el repo similar).
- Restricciones de licencia: la licencia no está definida, lo que impide conocer si es permitido el uso comercial. Se recomienda contactar con el autor antes de cualquier uso productivo.
- Advertencia para producción: no hay evidencia de validación clínica ni de cumplimiento de normativas sanitarias (como HIPAA o GDPR). Es un modelo experimental.

## Enlaces

- HuggingFace: https://huggingface.co/Lokhidor/medical-triage-qwen3-sft-lora-8k
- Repositorio similar (Jojo4911/medical-triage-llm): https://github.com/Jojo4911/medical-triage-llm
- Repositorio similar (junqiangchen/qwen3_Lora_sft_medicalQA): https://github.com/junqiangchen/qwen3_Lora_sft_medicalQA
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388v1
