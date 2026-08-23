# adi696969/os-agent-v2-gguf

## Resumen

os-agent-v2-gguf es un modelo de lenguaje finamente ajustado y convertido al formato GGUF mediante Unsloth, un framework de optimización para fine-tuning y cuantización. El modelo se basa en Qwen2.5-3B-Instruct, la arquitectura de 3 mil millones de parámetros de la serie Qwen2.5, y ha sido adaptado específicamente para tareas de agente conversacional. Aunque la información pública es escasa, su tamaño compacto y formato GGUF lo hacen especialmente atractivo para despliegues en entornos con recursos limitados, como CPUs, portátiles o dispositivos edge. La relevancia actual reside en la tendencia hacia modelos pequeños y eficientes que pueden ejecutarse localmente sin depender de infraestructura cloud, manteniendo capacidades de razonamiento y generación de texto útiles para agentes automatizados. El repositorio incluye un único archivo cuantizado en Q4_K_M y un Modelfile de Ollama para facilitar su integración en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (transformer decoder-only, basado en el modelo base Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-3B soporta hasta 32.768 tokens, pero no se especifica en el finetune) |
| Tipos de cuantizacion | Q4_K_M (único archivo disponible) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta múltiples idiomas, pero no se detalla el finetune) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repo, solo el archivo `.gguf`) |

## Arquitectura y entrenamiento

El modelo es un finetune de Qwen2.5-3B-Instruct, una arquitectura transformer decoder-only con atención causal y capas de normalización pre-RMSNorm. El fine-tuning fue realizado con Unsloth, una librería que optimiza el entrenamiento mediante kernels de atención y técnicas de memoria eficiente, logrando una velocidad de entrenamiento aproximadamente el doble que los métodos convencionales. Posteriormente, el modelo fue convertido a formato GGUF con la herramienta de conversión de Unsloth, que genera pesos cuantizados compatibles con llama.cpp y otras soluciones de inferencia local. No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de alineación como RLHF o DPO. La única información disponible es que el finetune está orientado a "agentes" (os-agent), lo que sugiere un entrenamiento dirigido a mejorar la capacidad del modelo para interactuar en contextos de tool calling y razonamiento multi-paso, aunque no hay evidencia pública que lo confirme.

## Capacidades

- Generación de texto conversacional: al estar basado en Qwen2.5-3B-Instruct, el modelo hereda las capacidades de chat y respuesta a instrucciones del modelo base.
- Razonamiento básico y resolución de problemas: el modelo base Qwen2.5-3B tiene un rendimiento razonable en tareas de razonamiento, aunque inferior a modelos más grandes.
- Generación de código: Qwen2.5-3B-Instruct es competente en tareas de programación básica y debugging, aunque no es su fortaleza principal.
- Soporte de tool calling: no confirmado. El nombre "os-agent" sugiere que el finetune puede haber incorporado entrenamiento para function calling, pero no se documenta en la model card.
- Multilingüismo: el modelo base Qwen2.5 soporta inglés, chino y otros idiomas, pero no se especifica si el finetune mantiene estas capacidades.
- Compatibilidad con llama.cpp y Ollama: el formato GGUF y la inclusión de un Modelfile de Ollama permiten ejecutar el modelo en CPUs y GPUs de bajo VRAM.

## Casos de uso

- **Asistentes conversacionales en edge**: con solo 3,09 B parámetros y cuantización Q4_K_M, el modelo puede ejecutarse en dispositivos con 4 GB de RAM (incluyendo Raspberry Pi 5 o mini-PCs) para ofrecer respuestas a preguntas frecuentes o soporte básico.
- **Agentes de automatización local**: el nombre "os-agent" sugiere un uso como agente que interactúa con herramientas (por ejemplo, comandos de shell, APIs) desde un entorno local, aunque la documentación no lo confirma.
- **Despliegue en CPU para prototipos**: su tamaño permite probar pipelines de agentes en entornos de desarrollo sin GPU, reduciendo costes y acelerando iteraciones.
- **Procesamiento de texto con privacidad**: al ejecutarse localmente, el modelo puede procesar documentos o conversaciones sensibles sin enviar datos a servidores externos.
- **Aplicaciones educativas**: para enseñar conceptos de agentes conversacionales o integración de LLMs en proyectos, el modelo es un buen punto de partida por su tamaño y compatibilidad con Ollama.
- **Integración en pipelines de CI/CD**: gracias a su bajo footprint, puede integrarse en entornos de integración continua para generar documentación, resumir logs o asistir en tareas de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. La única referencia es que se trata de un finetune de Qwen2.5-3B-Instruct, cuyo rendimiento base puede consultarse en el modelo original de Qwen (por ejemplo, MMLU de 62,7, HumanEval de 68,9, GSM8K de 85,5 en el modelo base, según datos de Qwen). Sin embargo, estos valores no son aplicables directamente al finetune sin una evaluación específica.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización Q4_K_M, el modelo ocupa aproximadamente 1,9 GB en disco. Para inferencia en GPU, se estima un consumo de VRAM de 2,5 a 3 GB (incluyendo overhead de contexto y activaciones).
- **GPU recomendadas**: cualquier GPU con 4 GB o más de VRAM es suficiente. Ejemplos: NVIDIA GTX 1650, RTX 3050, RTX 4060, o incluso iGPUs integradas con soporte Vulkan (a través de llama.cpp).
- **Consumer GPU**: sí, cabe en la mayoría de GPUs de consumo. También puede ejecutarse únicamente en CPU con 4 GB de RAM (por ejemplo, en un Mac M1 o un PC con 8 GB de RAM).
- **Opciones de despliegue**: llama.cpp (llama-cli, llama-server), Ollama, llama-cpp-python, o cualquier servidor compatible con GGUF (TGI con backend llama.cpp, etc.).
- **Latencia y throughput**: no disponible. Como referencia, en una CPU moderna (Apple M2 o Ryzen 5), un modelo de 3B Q4_K_M suele generar de 15 a 30 tokens por segundo; en una GPU como RTX 4060, puede alcanzar de 80 a 120 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| os-agent-v2-gguf (este) | 3,09 B | no disponible | no disponible | GGUF | Finetune de Qwen2.5-3B-Instruct, orientado a agentes |
| Qwen2.5-3B-Instruct (original) | 3,09 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo base, sin finetune específico |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Modelo de Meta, con soporte de tool calling nativo |
| Phi-3-mini (3.8B) | 3,82 B | 4.096 tokens (original) / 128K (long context) | MIT | safetensors, GGUF | Modelo de Microsoft, eficiente en tareas de razonamiento |

La comparación se basa en specs públicas de los modelos base. No hay datos de rendimiento específicos para os-agent-v2-gguf. La ventaja principal de este modelo es su tamaño reducido y formato GGUF, que facilita el despliegue local, pero la falta de licencia y documentación es una desventaja para uso en producción.

## Limitaciones y advertencias

- **Falta de documentación**: la model card es mínima y no detalla el proceso de entrenamiento, los datos usados ni las capacidades específicas del finetune.
- **Licencia desconocida**: no se especifica la licencia, lo que impide su uso comercial sin una consulta legal previa. El modelo base Qwen2.5-3B-Instruct está bajo Apache 2.0, pero el finetune puede heredar esa licencia o no.
- **Riesgo de alucinación**: como todos los modelos de lenguaje, puede generar información incorrecta o inventada, especialmente en dominios especializados.
- **Sesgos**: al ser un finetune de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento de Qwen2.5 (por ejemplo, sesgos de género, culturales o de idioma).
- **Contexto limitado**: aunque el modelo base soporta 32K tokens, no se confirma que el finetune mantenga esta longitud; en la práctica, la cuantización Q4_K_M puede reducir ligeramente la capacidad de contexto efectiva.
- **Sin soporte multimodal**: el modelo es solo de texto, no acepta imágenes ni audio (aunque la model card menciona `llama-mtmd-cli`, no hay evidencia de capacidades multimodales).
- **Riesgo de seguridad**: al ser un modelo pequeño, es más susceptible a jailbreaks y prompt injection, especialmente si se usa como agente con acceso a herramientas.

## Enlaces

- [HuggingFace: adi696969/os-agent-v2-gguf](https://huggingface.co/adi696969/os-agent-v2-gguf)
- [Unsloth (herramienta de entrenamiento y conversión)](https://github.com/unslothai/unsloth)
- [llama.cpp (repositorio de referencia para GGUF)](https://github.com/ggerganov/llama.cpp)
- [Ollama (plataforma de despliegue local)](https://ollama.com/)
