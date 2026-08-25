# Sonorix/pulsar-ai-4b-gguf

## Resumen

Pulsar AI 4B es una compilación (build) de un agente conversacional local desarrollado por el usuario Sonorix en Hugging Face, bajo el nombre de trabajo "Pulsar AI by Exo". No se trata de un modelo entrenado desde cero, sino de una integración que toma como base el modelo Qwen3-4B-Instruct-2507, lo cuantiza a GGUF Q4_K_M y le añade un system prompt personalizado, una base de conocimiento local con RAG (índice léxico) y scripts para LoRA/QLoRA. El objetivo es ofrecer un asistente con identidad propia, capaz de actualizar sus conocimientos sin reentrenar los pesos, y ejecutable en local mediante Ollama.

La relevancia de esta compilación radica en su enfoque práctico: demuestra cómo combinar un modelo open source de 4B parámetros con herramientas de personalización accesibles (RAG, LoRA) para crear un agente funcional sin necesidad de infraestructura de entrenamiento masiva. El repositorio incluye la configuración completa, scripts de indexación y un dataset de demostración en ruso, lo que facilita la reproducción y adaptación. Aunque el proyecto está orientado al idioma ruso, la arquitectura subyacente es la del modelo Qwen3, que soporta múltiples idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (archivo `pulsar-ai-Q4_K_M.gguf`) |
| Idiomas soportados | Ruso (principal, según la descripcion); el modelo base Qwen3 soporta multilingue, pero no se especifica |
| Licencia | No disponible (el modelo base Qwen3-4B-Instruct-2507 es Apache-2.0, pero la compilacion no declara licencia propia) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La compilación no introduce una arquitectura nueva; utiliza los pesos del modelo Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4B parámetros, cuantizado a Q4_K_M mediante el formato GGUF. El proyecto añade una capa de personalización a través de un system prompt definido en el `Modelfile` de Ollama, que establece la identidad, el estilo y las reglas de respuesta del agente. Además, incorpora un sistema RAG basado en un índice léxico local (scripts `build_index.py` y `chat.py`) que permite inyectar documentos Markdown/TXT en las consultas sin modificar los pesos.

En cuanto al entrenamiento, el repositorio incluye un dataset de demostración en ruso (`data/train.jsonl`) y un script de LoRA/QLoRA (`train_lora.py`) con configuración en `configs/lora.yaml`. Sin embargo, la model card aclara explícitamente que la compilación base se ha preparado y verificado como configuración prompt/RAG, y que el script de LoRA se detiene si no se detecta CUDA, salvo que se use el flag experimental `--allow-cpu`. No se proporcionan detalles sobre el entrenamiento original de Qwen3-4B-Instruct-2507 (tokens, dataset, RLHF, etc.), por lo que esos datos no están disponibles.

## Capacidades

- Generación de texto conversacional: el agente mantiene diálogos multi-turno con una identidad y estilo definidos por el system prompt.
- RAG local: puede responder consultas basadas en documentos Markdown/TXT almacenados en la carpeta `knowledge/`, actualizables sin reentrenamiento.
- Personalización vía LoRA: permite ajustar el comportamiento del modelo mediante adaptadores LoRA/QLoRA, aunque el script requiere CUDA para un uso normal.
- Ejecución local: integración con Ollama, lo que facilita el despliegue en entornos de escritorio o servidores sin GPU dedicada.
- Indexación de documentos: script `build_index.py` para construir un índice léxico simple a partir de archivos de texto.
- Multilingüismo potencial: al estar basado en Qwen3-4B-Instruct-2507, hereda las capacidades multilingües del modelo base, aunque la compilación está orientada al ruso.

## Casos de uso

- Asistente personal local: el agente puede funcionar como un asistente de escritorio con identidad propia, respondiendo preguntas y manteniendo conversaciones en ruso, sin depender de servicios en la nube.
- Base de conocimientos empresarial: añadiendo documentos internos en `knowledge/`, el sistema puede responder consultas sobre políticas, manuales o procedimientos, actualizando la información sin reentrenar.
- Chatbot de atención al cliente en ruso: con el system prompt y RAG, puede gestionar consultas frecuentes de clientes, integrado vía Ollama API en aplicaciones existentes.
- Herramienta educativa: para practicar idiomas o estudiar temas específicos, el agente puede responder basándose en materiales cargados en la base de conocimiento.
- Prototipo de agente con RAG: sirve como plantilla para desarrolladores que quieran experimentar con RAG local y LoRA, gracias a los scripts incluidos.
- Entorno de pruebas para personalización: el dataset de demostración y el script LoRA permiten evaluar cómo el fine-tuning afecta el comportamiento del modelo en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. El proyecto se presenta como una compilación funcional, no como un modelo con rendimiento evaluado.

## Requisitos de hardware

- VRAM estimada: para el archivo Q4_K_M de 2.5 GB, se estima un consumo de memoria de aproximadamente 3-4 GB durante la inferencia, incluyendo overhead del runtime y contexto. Esta es una estimación basada en el tamaño del archivo, no un dato oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3050 o superior, puede ejecutar el modelo en modo GPU. También es posible ejecutarlo en CPU con Ollama, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja, así como en sistemas con solo CPU.
- Opciones de despliegue: Ollama (recomendado, con `Modelfile` incluido), llama.cpp (compatible con GGUF), y cualquier runtime que soporte GGUF (vLLM, TGI, etc.).
- Latencia y throughput: no se proporcionan datos medidos. En una GPU moderna, un modelo de 4B en Q4_K_M suele generar decenas de tokens por segundo, pero esto depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo base es Qwen3-4B-Instruct-2507, que pertenece a la familia Qwen3 de Alibaba. Otros modelos de tamaño similar (3-4B) incluyen Llama-3.2-3B, Phi-3.5-mini y Gemma-2-2B, pero no hay métricas de rendimiento disponibles para comparar. La compilación Pulsar AI 4B se diferencia por su enfoque en personalización vía RAG y LoRA, más que por el rendimiento bruto del modelo subyacente.

## Limitaciones y advertencias

- No es un fine-tuning completo: la model card indica que el dataset de demostración no convierte al modelo en un sistema experto, y que el LoRA es opcional y no se ha verificado su calidad en tareas arbitrarias.
- RAG limitado: el índice es un prototipo léxico simple, no vectorial; para bases de conocimiento grandes se recomienda reemplazarlo por embeddings en futuras versiones.
- Idioma principal: la compilación está orientada al ruso; aunque el modelo base es multilingüe, el system prompt y los ejemplos están en ruso, lo que puede afectar el rendimiento en otros idiomas.
- Licencia no especificada: aunque el modelo base es Apache-2.0, la compilación no declara una licencia propia, lo que genera incertidumbre sobre su uso comercial.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente si la base de conocimiento RAG no cubre la consulta.
- Dependencia de Ollama: el flujo de trabajo principal requiere Ollama instalado y ejecutándose localmente, lo que añade una dependencia externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sonorix/pulsar-ai-4b-gguf
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- GGUF de Unsloth para Qwen3-4B-Instruct-2507: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF
- Repositorio relacionado de Sonorix: https://huggingface.co/Sonorix/Pulsar-AI-Final
- Repositorio relacionado de Sonorix: https://huggingface.co/Sonorix/PulsarAi
