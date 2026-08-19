# ciabi/Weeb-v1.0-Kaizoku-7B-Alpha

## Resumen

Weeb-v1.0-Kaizoku-7B-Alpha es un modelo de lenguaje conversacional de 7.600 millones de parámetros, desarrollado por el usuario ciabi, que parte del modelo base Qwen2.5-7B-Instruct y ha sido ajustado mediante fine-tuning con la librería Unsloth. El resultado se ha convertido a formato GGUF para su uso directo con llama.cpp y Ollama, lo que facilita su despliegue en entornos locales y de producción ligera.

El modelo está diseñado para tareas de conversación y chat, aprovechando las capacidades del modelo base de Qwen2.5, que incluye razonamiento, generación de texto y soporte multilingüe. Al estar disponible únicamente en cuantización Q4_K_M, ofrece un equilibrio entre tamaño y rendimiento, ocupando aproximadamente 4,7 GB en disco, adecuado para GPUs de consumo medio.

La relevancia actual de este modelo radica en su formato GGUF, que permite ejecutarlo en CPU o GPU con herramientas ampliamente adoptadas como llama.cpp, y en su naturaleza de fine-tuning especializado, lo que lo hace interesante para desarrolladores que buscan alternativas ligeras y desplegables para aplicaciones conversacionales sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-7B-Instruct, presumiblemente 32.768 tokens, pero no confirmado) |
| Tipos de cuantizacion | Q4_K_M (unico archivo disponible) |
| Idiomas soportados | no disponible (se infiere multilingue por el modelo base, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo Qwen2.5-7B-Instruct, que emplea una arquitectura transformer decoder-only con atención causal. No se dispone de detalles sobre la arquitectura interna específica del fine-tuning, pero se asume que mantiene la estructura original de Qwen2.5, incluyendo mecanismos de atención estándar y posiblemente uso de GQA (Grouped Query Attention) como en la serie Qwen2.5.

El proceso de entrenamiento se realizó con la librería Unsloth, que optimiza el fine-tuning mediante técnicas como LoRA o QLoRA (no especificado). No se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron métodos de alineación como RLHF o DPO. La conversión a GGUF también se realizó con Unsloth, lo que garantiza compatibilidad con llama.cpp y Ollama.

No hay información sobre innovaciones técnicas específicas más allá del uso de Unsloth para acelerar el entrenamiento y la conversión. El modelo se distribuye únicamente en formato GGUF, lo que indica un enfoque orientado a inferencia local eficiente.

## Capacidades

- Generacion de texto conversacional: el modelo está etiquetado como "conversational", lo que indica que está optimizado para mantener diálogos multi-turno.
- Hereda capacidades del modelo base Qwen2.5-7B-Instruct, que incluyen razonamiento, generación de código y matemáticas, aunque no se han verificado específicamente en este fine-tuning.
- Soporte para integración con llama.cpp y Ollama, permitiendo uso en aplicaciones de línea de comandos o servidores locales.
- No se dispone de información sobre tool calling, function calling, capacidades de agente, modo de pensamiento, visión o audio. Estas capacidades, si existen, serían heredadas del modelo base, pero no están confirmadas.

## Casos de uso

- Chatbot local para asistencia personal: al ser un GGUF de 7B con cuantización Q4_K_M, puede ejecutarse en una GPU de consumo como una RTX 3060 con 12 GB de VRAM o incluso en CPU, permitiendo desplegar un asistente conversacional privado sin conexión a internet.
- Prototipado rápido de aplicaciones de chat: gracias a la compatibilidad con Ollama, se puede integrar en entornos de desarrollo con una API REST local, ideal para pruebas de concepto de agentes conversacionales.
- Generación de respuestas contextuales en soporte técnico: el modelo puede gestionar conversaciones multi-turno con contexto, aunque la longitud exacta de la ventana no está confirmada, se espera que herede los 32.768 tokens de Qwen2.5-7B-Instruct.
- Educación y práctica de idiomas: al ser un modelo multilingüe (presumiblemente), puede utilizarse para practicar conversaciones en varios idiomas, aunque no se ha verificado el rendimiento en lenguas específicas.
- Automatización de tareas de redacción: puede generar borradores de correos, resúmenes o textos creativos, aprovechando las capacidades de generación de texto del modelo base.
- Evaluación de fine-tunings: dado que es un modelo de demostración con pocas descargas, puede servir como ejemplo de cómo convertir un modelo a GGUF y desplegarlo, útil para desarrolladores que quieran replicar el proceso con sus propios modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K u otras evaluaciones para este modelo específico. Se recomienda realizar pruebas propias para validar su rendimiento en tareas concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 4,7 GB. Con overhead de contexto y capas, se recomienda al menos 6-8 GB de VRAM para una ejecución fluida en GPU.
- GPU recomendadas: tarjetas con 8 GB o más de VRAM, como NVIDIA RTX 3060, RTX 4060, o superiores. También puede ejecutarse en CPU con suficiente RAM (8-16 GB), aunque la latencia será mayor.
- Si cabe en consumer GPU: sí, en GPUs de gama media con 8 GB de VRAM o más.
- Opciones de despliegue: llama.cpp (con `llama-cli`), Ollama (incluye Modelfile), y servidores compatibles con la API de OpenAI mediante herramientas como llama-cpp-python o text-generation-webui.
- Latencia y throughput: no se dispone de mediciones concretas. En una GPU como RTX 3060, se puede esperar una velocidad de generación de 20-40 tokens por segundo con cuantización Q4_K_M, pero esto es una estimación basada en modelos similares.

## Comparativa con modelos similares

Dado que no hay datos de rendimiento, la comparativa se limita a características técnicas. El modelo se basa en Qwen2.5-7B-Instruct, por lo que es comparable con otros modelos de 7B en formato GGUF:

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Weeb-v1.0-Kaizoku-7B-Alpha | 7,6B | no disponible (presumiblemente 32K) | GGUF (Q4_K_M) | no disponible |
| Qwen2.5-7B-Instruct (original) | 7,6B | 32.768 tokens | safetensors y GGUF | Apache 2.0 |
| Llama-3.1-8B-Instruct | 8B | 128K | GGUF y safetensors | Llama 3.1 Community License |
| Mistral-7B-Instruct v0.3 | 7B | 32K | GGUF y safetensors | Apache 2.0 |

La principal diferencia es que Weeb es un fine-tuning no oficial, sin licencia especificada, mientras que los modelos base tienen licencias claras y documentación extensa. Para uso en producción, se recomienda evaluar el modelo base o alternativas con licencias conocidas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de Qwen2.5-7B-Instruct, puede heredar sesgos presentes en el modelo base, pero no hay información específica sobre este modelo.
- Riesgo de alucinacion: como todo LLM, puede generar información falsa o inventada, especialmente en temas de actualidad o datos concretos.
- Limitaciones de contexto: la longitud de contexto no está confirmada; si no se ajustó durante el fine-tuning, se mantiene la de Qwen2.5 (32.768 tokens), pero es recomendable verificar.
- Restricciones de licencia: la licencia no está especificada, lo que genera incertidumbre legal para uso comercial. Se recomienda contactar al autor o evitar su uso en entornos empresariales hasta aclarar los términos.
- Carencia de documentación: no hay información sobre el dataset de entrenamiento, metodología de alineación ni evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.
- Formato único: solo se distribuye en GGUF Q4_K_M, lo que limita la flexibilidad si se necesita mayor precisión (por ejemplo, Q8 o FP16) o integración con frameworks que requieran safetensors.

## Enlaces

- HuggingFace: https://huggingface.co/ciabi/Weeb-v1.0-Kaizoku-7B-Alpha
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- llama.cpp (herramienta de inferencia): https://github.com/ggerganov/llama.cpp
- Ollama (plataforma de despliegue): https://ollama.com
