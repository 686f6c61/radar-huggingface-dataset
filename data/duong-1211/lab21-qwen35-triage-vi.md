# Duong-1211/lab21-qwen35-triage-vi

## Resumen

El modelo `Duong-1211/lab21-qwen35-triage-vi` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `unsloth/Qwen3.5-4B`, un LLM de 4.000 millones de parámetros de la familia Qwen. El nombre del repositorio sugiere una especialización en tareas de triage (clasificación o priorización de casos) y el sufijo "vi" apunta a un posible enfoque en vietnamita, aunque esta información no está confirmada en la documentación disponible.

El adaptador se distribuye en formato PEFT (safetensors) y ocupa aproximadamente 0,1 GB, lo que indica que se trata de un conjunto de pesos delta que deben combinarse con el modelo base para su uso. Está diseñado para la generación de texto y se integra con el ecosistema de Hugging Face Transformers y TRL. Su relevancia radica en ofrecer una especialización ligera y de bajo coste computacional sobre un modelo base potente, permitiendo adaptaciones específicas sin necesidad de reentrenar el modelo completo.

La ficha se basa exclusivamente en la información pública del repositorio de Hugging Face, que es notablemente escasa: la model card no incluye detalles sobre datos de entrenamiento, hiperparámetros, evaluación o licencia. Por tanto, muchos apartados se marcan como "no disponible" para evitar especulaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base transformer (Qwen3.5-4B) |
| Parametros totales | No disponible (el adaptador pesa 0,1 GB; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse) |
| Idiomas soportados | No disponible (el sufijo "vi" sugiere vietnamita, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA, que congela los pesos del modelo base e inyecta matrices de baja dimensión en las capas de atención y feed-forward, reduciendo drásticamente el número de parámetros entrenables y los requisitos de memoria. El entrenamiento se realizó mediante fine-tuning supervisado (SFT) utilizando la librería TRL (Transformers Reinforcement Learning) de Hugging Face, como indican las etiquetas del repositorio. No se especifican los datos de entrenamiento, el número de pasos, la tasa de aprendizaje ni el régimen de precisión (fp16, bf16, etc.). Tampoco se menciona el uso de técnicas como RLHF o DPO.

El modelo base, `unsloth/Qwen3.5-4B`, es una versión optimizada de la familia Qwen3.5, que a su vez se basa en la arquitectura transformer estándar con atención de múltiples cabezas. Qwen3.5 introduce mejoras sobre Qwen3, como la integración de modos de pensamiento (thinking y non-thinking) en un solo modelo, aunque no se confirma si el adaptador aprovecha estas capacidades. La ausencia de documentación técnica impide detallar innovaciones específicas del adaptador.

## Capacidades

- Generación de texto: el adaptador hereda las capacidades del modelo base Qwen3.5-4B, que incluyen generación de texto general, razonamiento y comprensión del lenguaje.
- Especialización en triage: el nombre del repositorio sugiere que el adaptador está entrenado para clasificar o priorizar casos (por ejemplo, tickets de soporte, consultas médicas o incidentes), pero no hay evidencia documental que lo confirme.
- Posible soporte multilingüe: el sufijo "vi" podría indicar un enfoque en vietnamita, pero no se ha publicado ninguna lista de idiomas soportados.
- Tool calling y agentes: no se menciona soporte específico para function calling o razonamiento multi-paso; dependerá de las capacidades del modelo base.
- Modo de pensamiento: si el modelo base Qwen3.5-4B incluye modos de pensamiento, el adaptador podría heredarlos, pero no hay confirmación.

## Casos de uso

- Clasificación de tickets de soporte: el adaptador podría utilizarse para categorizar y priorizar solicitudes de atención al cliente, asignando niveles de urgencia o derivando a departamentos específicos. Su tamaño reducido permite integrarlo en pipelines de clasificación en tiempo real.
- Triage médico preliminar: en entornos sanitarios, podría ayudar a clasificar síntomas descritos por pacientes y sugerir niveles de atención, siempre bajo supervisión humana y sin valor diagnóstico.
- Moderación de contenido: podría entrenarse para detectar y clasificar contenido inapropiado o urgente en foros, redes sociales o sistemas de mensajería.
- Enrutamiento de consultas en vietnamita: si el sufijo "vi" es correcto, el adaptador podría especializarse en comprender y clasificar consultas en vietnamita, un idioma con menos recursos que el inglés.
- Automatización de procesos de negocio: integrado en sistemas de gestión de incidencias (como Jira o ServiceNow), podría asignar prioridades y responsables automáticamente.
- Filtrado de correos electrónicos: clasificación de bandejas de entrada en categorías (urgente, spam, newsletter, etc.) mediante generación de etiquetas o resúmenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador. Tampoco se proporcionan comparativas con otros modelos o adaptadores.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA de 0,1 GB, la inferencia requiere cargar el modelo base Qwen3.5-4B más los pesos del adaptador. Con cuantización de 4 bits, el modelo base puede ocupar unos 2-3 GB de VRAM, por lo que cabría en GPUs de consumo como la RTX 3060 (12 GB) o superiores.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para cuantización 4-bit, o 16 GB para precisión completa. GPUs como RTX 4090, A100 o H100 son suficientes.
- Compatibilidad con consumer GPU: sí, siempre que se use cuantización (por ejemplo, GGUF o bitsandbytes) y el modelo base no supere los límites de memoria.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `peft` de Hugging Face junto con Transformers. También puede convertirse a GGUF para usarse con llama.cpp u Ollama, o servirse con vLLM o TGI si se fusiona con el modelo base.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en el mismo repositorio o en la misma tarea. El modelo base Qwen3.5-4B podría compararse con otros LLMs de 4B como Llama-3.2-3B o Phi-3.5-mini, pero no hay datos de rendimiento del adaptador para establecer una comparación significativa. Por tanto, esta sección se marca como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero el adaptador hereda los sesgos del modelo base Qwen3.5-4B, que pueden incluir sesgos culturales, lingüísticos o de género.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de clasificación si los datos de entrenamiento son insuficientes.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto soportada ni los idiomas cubiertos. El sufijo "vi" sugiere un enfoque en vietnamita, pero no hay confirmación.
- Restricciones de licencia: la licencia no está declarada, lo que impide conocer si el uso comercial está permitido. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Falta de documentación: la model card está incompleta, sin detalles sobre datos de entrenamiento, evaluación o hiperparámetros. Esto dificulta la reproducibilidad y la evaluación de la calidad del adaptador.
- Riesgo de overfitting: al ser un adaptador pequeño entrenado con SFT, existe riesgo de sobreajuste al dominio específico de los datos de entrenamiento, que no se han publicado.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Duong-1211/lab21-qwen35-triage-vi
- Modelo base (referencia): https://huggingface.co/unsloth/Qwen3.5-4B (no verificado)
- Repositorio de Qwen3.8 (familia relacionada): https://github.com/QwenLM/Qwen3.8
- Informe técnico de Qwen3: https://arxiv.org/abs/2505.09388
