# deanwashburn/Qwen2.5-7B-ERP-Order-Extraction

## Resumen

Qwen2.5-7B-ERP-Order-Extraction es un adaptador LoRA publicado por el usuario deanwashburn sobre el modelo base unsloth/Qwen2.5-7B-Instruct-bnb-4bit. El nombre del repositorio indica que el ajuste fino está orientado a la extracción de pedidos en entornos ERP (enterprise resource planning), aunque la model card no documenta explícitamente el conjunto de datos ni la tarea exacta. El modelo se distribuye como adaptador PEFT (librería peft 0.21.2) y también incluye pesos en formato GGUF, lo que facilita su despliegue en llama.cpp y Ollama.

El modelo hereda la arquitectura y las capacidades del Qwen2.5-7B-Instruct original: un transformer decoder-only de 7.615.616.512 parámetros (7,6 mil millones), entrenado por Alibaba Cloud con soporte multilingüe y una ventana de contexto de 32.768 tokens en la versión Instruct. El adaptador añade una especialización mediante SFT (supervised fine-tuning) con las herramientas Unsloth y TRL, pero no se ha publicado información sobre el volumen de datos, la composición del dataset ni los hiperparámetros empleados.

La relevancia de esta ficha es limitada pero concreta: se trata de un ejemplo de ajuste fino ligero y de bajo coste para una tarea vertical (extracción estructurada de pedidos), empaquetado en un repositorio de 4,9 GB con 41 descargas y sin métricas publicadas. Es útil como referencia para equipos que quieran replicar el flujo (Unsloth + LoRA + exportación GGUF) o evaluar si el adaptador sirve para su propio dominio, pero no debe considerarse un modelo listo para producción sin una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino mediante LoRA (PEFT) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens, dato no confirmado en este repositorio) |
| Tipos de cuantizacion | Pesos GGUF incluidos en el repositorio; el modelo base se distribuye en bnb-4bit. Otras cuantizaciones no documentadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF |
| Modelo base | unsloth/Qwen2.5-7B-Instruct-bnb-4bit |
| Libreria | peft 0.21.2, transformers, trl, unsloth |
| Tamano del repositorio | 4,9 GB |
| Descargas / likes | 41 / 0 |
| Fecha de creacion | 2026-10-31 |
| Ultima actualizacion | 2026-11-01 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7,6 mil millones de parámetros. El adaptador se entrena con SFT (supervised fine-tuning) usando el stack de Unsloth y TRL, según las etiquetas del repositorio. No se especifica el rango del adaptador, el alpha, la tasa de aprendizaje, el número de pasos ni el tamaño del dataset de entrenamiento; la model card mantiene la plantilla por defecto con la mayoría de campos marcados como "[More Information Needed]".

No hay información sobre la composición de los datos de entrenamiento, si hubo RLHF o DPO posteriores, ni sobre innovaciones técnicas específicas del adaptador. La única referencia técnica explícita es la inclusión de pesos GGUF, lo que sugiere que el autor exportó el modelo fusionado o cuantizado para inferencia en CPU/GPU con llama.cpp. Tampoco se documenta el proceso de fusión del adaptador con el modelo base ni la precisión empleada (fp16, bf16 o cuantización).

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Extracción de información estructurada orientada a pedidos de ERP, según el nombre del repositorio; no hay ejemplos ni esquema de salida documentados.
- Razonamiento y matemáticas básicas, como capacidad general del modelo base.
- Generación de código, capacidad general del modelo base.
- Soporte multilingüe heredado del modelo base (no confirmado en este repositorio).
- Compatibilidad con endpoints de Hugging Face (etiqueta endpoints_compatible).
- Tool calling y function calling: no documentado en este repositorio; el modelo base Qwen2.5-Instruct lo soporta, pero el adaptador puede haber alterado este comportamiento.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Extracción de pedidos desde correos o PDFs: el adaptador se usaría para transformar texto libre de un pedido de cliente en un JSON estructurado (referencia, cantidades, líneas, direcciones). Es el caso de uso que sugiere el nombre del modelo, aunque requiere validación con datos propios.
- Automatización de entrada de datos en ERP: integrado en un pipeline que recibe documentos de compra y genera registros listos para insertar en SAP, Odoo o similar, reduciendo la captura manual.
- Normalización de catálogos de productos: usar el modelo para mapear descripciones libres de artículos a códigos internos, aprovechando la capacidad de comprensión del modelo base.
- Clasificación y enrutado de solicitudes: extraer la intención y los campos clave de un email de pedido para dirigirlo al flujo de aprobación correspondiente.
- Prototipado rápido con Ollama o llama.cpp: gracias a los pesos GGUF incluidos, se puede desplegar en una estación de trabajo para pruebas de concepto sin infraestructura GPU dedicada.
- Generación de borradores de confirmación de pedido: a partir de los datos extraídos, redactar respuestas al cliente con el resumen del pedido, usando la faceta conversacional del modelo base.
- Evaluación comparativa de adaptadores LoRA: como ejemplo reproducible del flujo Unsloth + TRL + exportación GGUF para equipos que quieran construir sus propios adaptadores verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 15-16 GB para los 7,6 mil millones de parámetros, más overhead de contexto.
- VRAM estimada en cuantización 4-bit (GGUF Q4_K_M): aproximadamente 4,5-5,5 GB, lo que permite ejecución en GPUs consumer.
- VRAM estimada en cuantización 8-bit: aproximadamente 8-9 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 para fp16; A100 o H100 para despliegues con alto throughput y contexto largo.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 con cuantización 4-bit u 8-bit.
- Opciones de despliegue: llama.cpp y Ollama para los pesos GGUF; vLLM o TGI para el adaptador PEFT fusionado con el modelo base; transformers + peft para carga directa del adaptador.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| deanwashburn/Qwen2.5-7B-ERP-Order-Extraction | 7,6 B | No disponible (base: 32.768) | No disponible | safetensors (LoRA) + GGUF | Adaptador vertical para extracción de pedidos; sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens | Apache 2.0 (según el modelo base) | safetensors, GGUF | Modelo base generalista, con benchmarks publicados por el autor |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamaño similar |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Contexto mayor y ecosistema amplio; licencia con restricciones |

La comparación directa con el modelo base es la más relevante: el adaptador solo debería elegirse si la tarea de extracción de pedidos mejora respecto a Qwen2.5-7B-Instruct, algo que no se puede verificar sin benchmarks ni datos de evaluación publicados.

## Limitaciones y advertencias

- La model card está prácticamente vacía: no hay información sobre datos de entrenamiento, evaluación, sesgos ni uso previsto.
- No se han publicado métricas de calidad; no hay evidencia de que el adaptador mejore al modelo base en la tarea de extracción de pedidos.
- La licencia no está disponible, lo que impide determinar si el uso comercial está permitido. El modelo base Qwen2.5 se distribuye bajo Apache 2.0, pero el adaptador no declara licencia propia.
- Riesgo de alucinación inherente a los modelos de 7 B, especialmente en extracción de campos numéricos y referencias de pedido; se recomienda validación con esquemas y reglas de negocio.
- El adaptador puede haber degradado capacidades generales del modelo base (tool calling, multilingüismo, razonamiento) al haberse ajustado con SFT sobre un dominio estrecho.
- No se documentan los idiomas soportados; el modelo base es multilingüe, pero el adaptador podría estar sesgado hacia el idioma de los datos de entrenamiento.
- El repositorio tiene 41 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- Los pesos GGUF incluidos no especifican el nivel de cuantización ni si el adaptador está fusionado; conviene verificar antes de desplegar.
- Para producción, es imprescindible evaluar con un conjunto de datos propio y establecer salvaguardas ante errores de extracción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/deanwashburn/Qwen2.5-7B-ERP-Order-Extraction
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
