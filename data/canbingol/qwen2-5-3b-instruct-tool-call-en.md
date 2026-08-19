# canbingol/Qwen2.5-3B-Instruct-tool-call-en

## Resumen

El modelo `Qwen2.5-3B-Instruct-tool-call-en` es un fine-tuning del modelo base `Qwen/Qwen2.5-3B-Instruct` (3B parámetros) desarrollado por el usuario canbingol. Está específicamente entrenado para mejorar la capacidad de llamada a funciones (tool calling / function calling) en inglés, utilizando el dataset público `Salesforce/xlam-function-calling-60k`. Se trata de un ajuste mediante LoRA (r=16, alpha=32) con entrenamiento supervisado (SFT) usando la librería TRL de HuggingFace.

El modelo resuelve el problema de que los modelos pequeños de 3B suelen tener un rendimiento limitado en tareas de tool calling, que requieren comprender esquemas de funciones y generar llamadas estructuradas. Al especializarse en este dominio, se busca obtener un modelo ligero y desplegable en entornos con recursos limitados, manteniendo las capacidades generales del modelo base Qwen2.5.

Aunque el repositorio tiene cero descargas y cero likes, y la información publicada es mínima, el modelo es relevante como ejemplo de fine-tuning orientado a agentes y automatización, especialmente para desarrolladores que necesitan un modelo pequeño capaz de integrarse en pipelines de llamadas a APIs. La arquitectura es un transformer denso (Qwen2.5) con 3B parámetros y una ventana de contexto heredada del modelo base (32k tokens según la documentación oficial de Qwen, aunque no se especifica en esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) |
| Parametros totales | 3B (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-3B-Instruct, 32k según documentación oficial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere inglés, pero no se confirma) |
| Licencia | no disponible (en el README aparece "licence: license", sin especificar) |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer denso con atención causal y normalización RMSNorm, tal como se implementa en el modelo base `Qwen/Qwen2.5-3B-Instruct`. No se trata de un modelo MoE ni híbrido; es un modelo denso de 3B parámetros.

El entrenamiento consistió en un fine-tuning con LoRA (r=16, alpha=32) sobre el modelo base, utilizando el dataset `Salesforce/xlam-function-calling-60k`, que contiene 60.000 ejemplos de llamadas a funciones. Se entrenó durante 2 épocas con una tasa de aprendizaje de 2e-4. El proceso se realizó con la librería TRL (Transformer Reinforcement Learning) de HuggingFace, que permite entrenamiento supervisado (SFT). No se menciona el uso de RLHF ni DPO. El checkpoint resultante tiene un tamaño de repositorio de 0.5 GB, lo que sugiere que se guardaron los pesos completos del modelo fine-tuneado (no solo los adaptadores LoRA), aunque no se puede confirmar.

No se detallan innovaciones técnicas adicionales más allá del uso de LoRA para eficiencia de entrenamiento.

## Capacidades

- Especializado en tool calling / function calling: el modelo ha sido entrenado específicamente para generar llamadas a funciones estructuradas a partir de instrucciones en lenguaje natural, siguiendo el formato del dataset `xlam-function-calling-60k`.
- Generación de texto general: al estar basado en Qwen2.5-3B-Instruct, hereda las capacidades de generación de texto, razonamiento básico, comprensión de instrucciones y generación de código del modelo base, aunque no se han verificado en esta ficha.
- Soporte de tool calling: sí, es la capacidad principal del modelo, aunque no se especifica si soporta múltiples llamadas en una misma respuesta o el formato exacto de salida (JSON, etc.).
- Capacidades multilingües: no disponible, aunque el nombre sugiere orientación al inglés.
- No se indican capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Asistentes conversacionales con acceso a APIs: el modelo puede integrarse en un agente que reciba peticiones del usuario, genere llamadas a funciones (por ejemplo, consultar el tiempo, buscar información, gestionar calendario) y procese las respuestas de la API. Su tamaño de 3B permite desplegarlo en entornos con VRAM limitada.
- Automatización de tareas empresariales: uso en pipelines de automatización donde se necesite convertir instrucciones en lenguaje natural en llamadas a servicios REST, bases de datos o herramientas internas.
- Chatbots de soporte técnico: un bot que necesita consultar una base de conocimiento o un sistema de tickets mediante llamadas a funciones, con un modelo ligero que pueda ejecutarse en CPU o GPU de gama media.
- Generación de código con invocación de librerías: el modelo puede sugerir fragmentos de código que incluyan llamadas a funciones de librerías, aprovechando su entrenamiento en tool calling.
- Prototipado rápido de agentes: desarrollo de demos o pruebas de concepto de agentes autónomos en entornos con pocos recursos, donde un modelo de 3B es más manejable que alternativas de 7B o más.
- Integración en frameworks de agentes (LangChain, LlamaIndex): el modelo puede usarse como motor de razonamiento para decidir qué herramienta invocar y con qué argumentos, en lugar de modelos más grandes y costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de tool calling (como tasa de éxito en llamadas a funciones). El autor no proporciona comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3B parámetros, en FP16 se requieren aproximadamente 6 GB de VRAM. Con cuantización a 8 bits (~3 GB) o 4 bits (~2 GB) podría ejecutarse en GPUs con 4 GB o menos, aunque no se confirman cuantizaciones disponibles.
- GPU recomendadas: una RTX 3060 (12 GB) o superior sería suficiente para FP16; para cuantización 4-bit, una RTX 2060 (6 GB) o incluso integradas con suficiente VRAM compartida podrían ser viables.
- En consumer GPU: sí, cabe en GPUs de consumo como RTX 3060, RTX 4060, etc., especialmente con cuantización.
- Opciones de despliegue: al ser un modelo de la familia Qwen2.5 con formato safetensors, es compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama, TGI y transformers. No se han publicado archivos GGUF en el repositorio, por lo que sería necesario convertirlos.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (RTX 4090), un modelo de 3B en FP16 puede generar decenas de tokens por segundo, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3B | 32k | Instrucción general | Apache 2.0 |
| Qwen2.5-3B-Instruct-tool-call-en (este) | 3B | no disponible (heredado) | Tool calling en inglés | no disponible |
| Llama-3.2-3B-Instruct | 3B | 128k | Instrucción general | Llama 3.2 license |

No hay datos de rendimiento comparativo disponibles. El modelo se diferencia del base por su entrenamiento específico en tool calling, pero no se puede cuantificar la mejora. Frente a Llama-3.2-3B, la ventaja potencial es la especialización en llamadas a funciones, aunque la licencia de este modelo es incierta.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de Qwen2.5-3B-Instruct, puede heredar sesgos presentes en el modelo base, aunque no se han documentado en esta ficha.
- Riesgo de alucinación: como todo modelo generativo, puede inventar nombres de funciones, argumentos o respuestas si la instrucción es ambigua o fuera del dominio de entrenamiento.
- Limitaciones de contexto e idioma: no se especifica el contexto real, pero al ser un modelo de 3B, el manejo de contextos largos puede degradar la calidad. El idioma principal parece ser inglés, aunque no se confirma.
- Restricciones de licencia: la licencia no está clara ("licence: license" en el README), lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar al autor antes de usarlo en producción.
- Caveat de producción: el modelo tiene cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad. No hay garantías de calidad ni de estabilidad. Además, el dataset de entrenamiento (xlam-function-calling-60k) puede tener limitaciones de cobertura de formatos de funciones.
- El modelo no incluye cuantizaciones preconvertidas ni documentación de uso, lo que dificulta su adopción inmediata.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/canbingol/Qwen2.5-3B-Instruct-tool-call-en
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
