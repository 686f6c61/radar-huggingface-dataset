# deanwashburn/Qwen2.5-7B-ERP-Order-Extraction

## Resumen

deanwashburn/Qwen2.5-7B-ERP-Order-Extraction es un adaptador LoRA (PEFT) publicado por el usuario deanwashburn sobre el modelo base unsloth/Qwen2.5-7B-Instruct-bnb-4bit. El nombre del repositorio sugiere que su propósito es la extracción de pedidos en el contexto de un sistema ERP (planificación de recursos empresariales), es decir, convertir texto libre en estructuras de datos de pedidos. No obstante, la model card no documenta el proceso de entrenamiento ni el conjunto de datos utilizado.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales según los pesos en safetensors. Al tratarse de un adaptador LoRA, los pesos publicados son incrementales y requieren el modelo base para su uso; el repositorio incluye también una conversión a GGUF, lo que facilita el despliegue en entornos con llama.cpp.

Su relevancia es limitada y muy específica: se trata de un ajuste fino comunitario, sin licencia declarada, sin idiomas documentados y sin resultados de evaluación publicados. Resulta útil únicamente como referencia para quienes necesiten un extractor de pedidos sobre Qwen2.5-7B, siempre que verifiquen previamente la calidad del adaptador con sus propios datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-7B-Instruct) con adaptador LoRA |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | GGUF incluido en el repositorio; el modelo base se distribuye en bnb-4bit |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7.600 millones de parámetros. El entrenamiento declarado en las etiquetas es SFT (supervised fine-tuning) mediante las librerías TRL y Unsloth, con PEFT 0.21.2 como framework de adaptadores. El modelo base empleado para el ajuste es la versión cuantizada en 4 bits de Unsloth (bnb-4bit), lo que reduce los requisitos de memoria durante el entrenamiento.

No se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF o DPO, ni los hiperparámetros utilizados. La model card es una plantilla sin rellenar, por lo que toda la información sobre el procedimiento de entrenamiento figura como no disponible. Tampoco se documentan innovaciones técnicas adicionales más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Extracción de información estructurada orientada a pedidos de ERP, según el nombre del repositorio (no verificada con datos públicos).
- Razonamiento y matemáticas básicas, presumiblemente conservadas del modelo base.
- Generación de código, presumiblemente conservada del modelo base.
- Soporte de tool calling y function calling, presumiblemente heredado del modelo base.
- Capacidades multilingües del modelo base, aunque no documentadas para este adaptador.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Extracción de pedidos desde correo electrónico: el adaptador se usaría para transformar el cuerpo de un correo de compra en un JSON con líneas de pedido, cantidades y referencias de producto, integrándolo en un flujo de entrada al ERP.
- Procesamiento de pedidos en PDF o texto libre: conversión de documentos comerciales en registros estructurados antes de la validación humana en el sistema de gestión.
- Normalización de referencias de producto: mapeo de descripciones ambiguas de artículos a códigos internos del catálogo del ERP, apoyándose en el contexto del modelo base.
- Asistencia en atención al cliente B2B: interpretación de solicitudes de pedido recibidas por chat y generación de borradores de orden para revisión del operador.
- Preprocesado en pipelines de integración: uso del adaptador como paso previo a la validación de esquemas y a la carga en bases de datos, con salida en formato JSON.
- Prototipado rápido de extracción de entidades comerciales: dado su tamaño de 7B y su conversión GGUF, permite desplegar un extractor en hardware de gama media para pruebas de concepto antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 15-16 GB para los 7.615 millones de parámetros, más el overhead del adaptador.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): aproximadamente 4,5-5,5 GB.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 (24 GB).
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en FP16; en cuantización 4 bits puede ejecutarse en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: transformers con PEFT para el adaptador, llama.cpp u Ollama para la versión GGUF, y vLLM o TGI fusionando previamente el adaptador con el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| deanwashburn/Qwen2.5-7B-ERP-Order-Extraction | 7,6B (adaptador LoRA) | no disponible | no disponible | Hugging Face, safetensors y GGUF |
| Qwen2.5-7B-Instruct (base) | 7,6B | 32.768 tokens (ampliable) | Apache 2.0 | Hugging Face, amplia adopción |
| Mistral-7B-Instruct | 7,2B | 32.768 tokens | Apache 2.0 | Hugging Face, amplia adopción |
| Llama 3.1 8B Instruct | 8,0B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, Meta |

La comparación con alternativas genéricas es desfavorable en términos de documentación y licencia: el adaptador no declara licencia ni evaluación, mientras que los modelos base y sus alternativas cuentan con licencias claras y benchmarks públicos. Su única ventaja potencial es la especialización en extracción de pedidos, que no está verificada con datos públicos.

## Limitaciones y advertencias

- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribución; es imprescindible contactar con el autor antes de usarlo en producción.
- Model card incompleta: no hay información sobre datos de entrenamiento, sesgos, evaluación ni hiperparámetros.
- Riesgo de alucinación en la extracción de campos: sin evaluación publicada, no hay garantía de que los pedidos generados sean fieles al texto de entrada.
- Idiomas no documentados: se desconoce si el ajuste conserva el multilingüismo del modelo base o lo ha degradado hacia un único idioma.
- Dependencia del modelo base: requiere descargar unsloth/Qwen2.5-7B-Instruct-bnb-4bit o fusionar el adaptador con Qwen2.5-7B-Instruct.
- Sesgos heredados: al derivar de Qwen2.5, arrastra los sesgos del modelo base, no evaluados para este adaptador.
- Sin garantías de mantenimiento: el repositorio tiene 224 descargas y 0 likes, lo que indica una adopción muy baja y nulo soporte comunitario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/deanwashburn/Qwen2.5-7B-ERP-Order-Extraction
- Modelo base del adaptador: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Modelo Qwen2.5-7B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Referencia del cálculo de emisiones citada en la model card: https://mlco2.github.io/impact
- Artículo citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
