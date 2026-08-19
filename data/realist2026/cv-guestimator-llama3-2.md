# Realist2026/cv-guestimator-llama3.2

## Resumen

El modelo `Realist2026/cv-guestimator-llama3.2` es un ajuste fino (fine-tuning) del modelo base `unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit`, desarrollado por el usuario Realist2026. Se trata de una adaptación de Llama 3.2 3B instruct, un transformer decoder-only de 3 mil millones de parámetros, entrenado originalmente por Meta. El nombre del repositorio sugiere una funcionalidad orientada a la estimación de currículos (CV guestimator), aunque la model card no proporciona ninguna descripción funcional detallada.

El modelo se distribuye bajo licencia Apache 2.0, está etiquetado para inglés y el tamaño del repositorio es de 0.1 GB, lo que indica que probablemente contiene un adaptador LoRA o una versión cuantizada del modelo base. No se han registrado descargas ni valoraciones en Hugging Face, y la información pública es extremadamente escasa, limitándose a los metadatos básicos y a la referencia al modelo base. Su relevancia actual radica en ser un ejemplo de fine-tuning de un modelo ligero y eficiente, pero carece de documentación sobre su propósito real, datos de entrenamiento o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.2 3B instruct) |
| Parametros totales | No disponible (el modelo base tiene 3B parametros) |
| Parametros activos | No disponible (posible adaptador LoRA, sin confirmar) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 128K tokens) |
| Tipos de cuantizacion | No disponible (el modelo base se publica en bnb-4bit, pero el repo no especifica) |
| Idiomas soportados | Ingles (etiqueta "en") |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (segun las etiquetas del repo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B instruct, un transformer autoregresivo con atención de ventana completa, normalización RMSNorm y activaciones SwiGLU. El modelo base fue cuantizado a 4 bits mediante bitsandbytes (bnb-4bit) por Unsloth para permitir un entrenamiento más rápido y eficiente en memoria. El fine-tuning se realizó con la librería TRL (Transformers Reinforcement Learning) y la herramienta Unsloth, como se indica en la model card, pero no se proporcionan detalles sobre el conjunto de datos, el número de pasos de entrenamiento, la técnica de ajuste (LoRA, QLoRA, full fine-tuning) ni si se aplicaron métodos de alineación como RLHF o DPO. Toda esta información se declara como no disponible.

## Capacidades

Dado que la model card no especifica capacidades concretas, las siguientes se deducen del modelo base Llama 3.2 3B instruct, pero no están confirmadas para este fine-tuning:

- Generación de texto y seguimiento de instrucciones en inglés.
- Razonamiento básico y respuesta a preguntas de conocimiento general.
- Soporte de tool calling (el modelo base instruct incluye esta capacidad, pero no se confirma en este adaptador).
- Capacidades multilingües limitadas (el modelo base soporta varios idiomas, pero este repo solo declara inglés).

No se ha documentado ninguna capacidad especial adicional como modo de pensamiento, visión o audio.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Basándose en el nombre "cv-guestimator" y en el modelo base, se podrían sugerir aplicaciones hipotéticas, pero es importante señalar que no existe evidencia pública de que el modelo funcione correctamente para ellas:

- Estimación de características de currículos: podría utilizarse para extraer y clasificar información de CVs (años de experiencia, habilidades, formación) mediante instrucciones en lenguaje natural.
- Clasificación de texto en recursos humanos: como filtrado de candidaturas o resumen de perfiles.
- Asistente de generación de perfiles profesionales: redacción de resúmenes o descripciones de puestos.
- Prototipado rápido de aplicaciones de procesamiento de texto: al ser un modelo pequeño, puede integrarse en entornos con recursos limitados.
- Experimentación educativa: para estudiar el proceso de fine-tuning de modelos Llama 3.2.
- Despliegue en entornos de bajo coste: con un tamaño de 0.1 GB, es adecuado para pruebas en CPU o GPUs modestas.

Sin embargo, estos casos son especulativos y no están respaldados por documentación del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica para este modelo específico. Tampoco se comparan con el modelo base o con otros modelos similares.

## Requisitos de hardware

Dado que el repositorio pesa 0.1 GB y el modelo base es de 3B parámetros cuantizado a 4 bits, se puede estimar un requisito de VRAM aproximado, pero no hay confirmación oficial:

- VRAM estimada: entre 2 y 4 GB para inferencia en FP16 o 4-bit, dependiendo del formato real de los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 3050, o superiores). También podría ejecutarse en CPU con suficiente RAM.
- Compatibilidad con consumer GPU: sí, es probable que quepa en GPUs de gama media.
- Opciones de despliegue: al estar basado en transformers, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) o Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo base `unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit` es el punto de referencia natural, pero no se conocen las modificaciones introducidas por el fine-tuning. Otros modelos de 3B como `meta-llama/Llama-3.2-3B-Instruct` o `Qwen2.5-3B-Instruct` podrían servir como alternativas, pero no hay datos de rendimiento de este adaptador para comparar.

## Limitaciones y advertencias

- La documentación es prácticamente inexistente: no hay descripción del propósito, los datos de entrenamiento ni las capacidades reales.
- No se han publicado benchmarks ni evaluaciones, por lo que el rendimiento es desconocido.
- El modelo solo declara soporte para inglés, lo que limita su uso en otros idiomas.
- Al ser un fine-tuning de un modelo base que ya tiene sesgos conocidos (heredados de Llama 3.2), es probable que reproduzca o amplifique dichos sesgos.
- Riesgo de alucinación: sin datos de entrenamiento específicos, no se puede evaluar la fiabilidad de las respuestas.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Llama 3.2, debe respetarse la licencia original de Meta (Llama 3.2 Community License), que tiene restricciones adicionales para usuarios con más de 700 millones de usuarios mensuales.
- No hay garantía de que el modelo funcione correctamente para la tarea sugerida por su nombre (estimación de CV), ya que no se ha validado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Realist2026/cv-guestimator-llama3.2
- Modelo base en Hugging Face: https://huggingface.co/unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit
- Página de Llama 3.2 de Meta: https://developer.meta.com/ai/models/llama-3/
- Model card de Llama 3.2 (GitHub): https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
