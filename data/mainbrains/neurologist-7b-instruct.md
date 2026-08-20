# mainbrains/neurologist-7b-instruct

## Resumen

Neurologist-7B-Instruct es un modelo de lenguaje de 7 mil millones de parámetros (basado en Llama 3.1 8B) desarrollado por el usuario mainbrains. Se trata de un fine-tuning con QLoRA sobre NousResearch/Hermes-3-Llama-3.1-8B, orientado a razonamiento técnico, generación de código de sistemas y resolución de problemas a nivel de arquitectura. El modelo está diseñado para asistir en programación de bajo nivel, discusión de hardware y generación de código en C++, Rust, Python y CUDA.

El entrenamiento se realizó sobre un conjunto de datos curado que combina OpenOrca filtrado por contenido técnico/científico, un dataset propio de preguntas y respuestas sobre programación de sistemas (DMA, módulos de kernel, interfaces de hardware) y pares de instrucciones de código. El proceso usó QLoRA con cuantización de 4 bits, rank 64 y alpha 128, durante 3 épocas y con una longitud de contexto de 8192 tokens. El modelo se distribuye bajo licencia Apache 2.0 y solo soporta inglés.

Aunque el modelo no ha sido ampliamente adoptado (0 descargas y 0 likes en HuggingFace), su enfoque especializado en sistemas y código de bajo nivel lo hace relevante para desarrolladores que necesitan asistencia técnica en entornos de programación de hardware, kernels y computación de alto rendimiento. Los benchmarks declarados por el autor muestran resultados moderados en tareas generales de razonamiento y comprensión, con un rendimiento destacable en generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Llama 3.1 8B) |
| Parametros totales | no disponible (el modelo base tiene 8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (según entrenamiento) |
| Tipos de cuantizacion | no disponible (entrenado con QLoRA 4-bit NF4) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (presumiblemente safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Llama 3.1 8B, que es un modelo denso sin mezcla de expertos. El fine-tuning se realizó mediante QLoRA (Quantized Low-Rank Adaptation) con cuantización de 4 bits en formato NF4, lo que permite un entrenamiento eficiente en una sola GPU. La configuración de LoRA incluye un rank de 64 y un alpha de 128, con una tasa de aprendizaje de 2e-4 y un tamaño de lote de 4 con acumulación de gradientes de 8. El entrenamiento duró aproximadamente 18 horas en una configuración con CPU AMD 9950X y una GPU RTX.

El conjunto de datos de entrenamiento combina tres fuentes: OpenOrca filtrado para contenido técnico y científico, un dataset personalizado de preguntas y respuestas sobre programación de sistemas (DMA, módulos de kernel, interfaces de hardware) y pares de instrucciones de código en C++, Rust, Python y CUDA. No se menciona el uso de RLHF o DPO; el proceso se limita a un fine-tuning supervisado estándar.

## Capacidades

- Generación de texto instructivo y conversacional en inglés.
- Razonamiento técnico y resolución de problemas a nivel de sistemas.
- Generación de código en C++, Rust, Python y CUDA.
- Asistencia en programación de bajo nivel: DMA, módulos de kernel, interfaces de hardware.
- Discusión de arquitectura de sistemas y diseño de software.
- Soporte para preguntas y respuestas técnicas multi-turno.
- No se menciona soporte para tool calling, agentes, visión o audio.

## Casos de uso

- Asistencia en desarrollo de drivers y módulos de kernel: el modelo puede responder preguntas sobre APIs de kernel, gestión de memoria y DMA, ayudando a programadores de sistemas a resolver problemas concretos.
- Generación de código CUDA para computación paralela: dado su entrenamiento en CUDA, puede producir kernels optimizados para GPUs, aunque se debe verificar la corrección.
- Documentación técnica de código: puede generar comentarios y explicaciones para código en C++ o Rust, facilitando el mantenimiento de proyectos.
- Soporte en entrevistas técnicas: puede simular preguntas y respuestas sobre arquitectura de computadores, sistemas operativos y programación concurrente.
- Prototipado rápido de algoritmos en Python: puede generar esqueletos de código para algoritmos de procesamiento de datos o simulación.
- Educación en programación de sistemas: puede explicar conceptos como punteros, gestión de memoria o interrupciones, adaptando el nivel de detalle según la petición.

## Benchmarks y rendimiento

Los siguientes resultados fueron declarados por el autor del modelo en la model card y no han sido verificados de forma independiente:

| Benchmark | Score |
|---|---|
| MMLU (5-shot) | 63.8 |
| HellaSwag | 79.2 |
| ARC-Challenge | 54.1 |
| HumanEval | 41.5 |
| MBPP | 48.2 |

Estos valores son moderados en comparación con otros modelos de 7B, aunque el rendimiento en generación de código (HumanEval y MBPP) es razonable para un modelo especializado. No se dispone de comparaciones directas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~8B parámetros, en FP16 requiere aproximadamente 16 GB de VRAM. Con cuantización 4-bit (como la usada en el entrenamiento) puede caber en unos 5-6 GB, permitiendo su ejecución en GPUs consumer como RTX 3060 o superiores.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para inferencia sin cuantización. Con cuantización, una RTX 3060 de 12 GB es suficiente.
- Opciones de despliegue: compatible con frameworks estándar como vLLM, llama.cpp, Ollama y TGI, siempre que se conviertan los pesos al formato adecuado (GGUF, etc.).
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 8B, se espera una latencia de decenas de milisegundos por token en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Neurologist-7B-Instruct | ~8B (base) | 8192 | Apache 2.0 | Sistemas y código de bajo nivel |
| Mistral-7B-Instruct-v0.1 | 7B | 8k | Apache 2.0 | Instrucción general |
| Mistral-7B-Instruct-v0.2 | 7B | 32k | Apache 2.0 | Instrucción general, contexto largo |
| Hermes-3-Llama-3.1-8B | 8B | 128k | Apache 2.0 | Instrucción general, base de este modelo |

No se dispone de benchmarks comparativos entre estos modelos en la información proporcionada. Neurologist-7B-Instruct se diferencia por su especialización en sistemas y programación de bajo nivel, mientras que los otros son modelos de propósito general.

## Limitaciones y advertencias

- El modelo hereda las limitaciones de su base (Hermes-3-Llama-3.1-8B), incluyendo posibles sesgos en el lenguaje y alucinaciones en información técnica.
- Puede generar código incorrecto o incompleto, especialmente en tareas complejas de sistemas. Se recomienda verificar siempre el código generado antes de usarlo en producción.
- Solo soporta inglés; no se ha entrenado para otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido auditado para entornos de alto riesgo.
- El modelo tiene un contexto limitado a 8192 tokens, lo que puede ser insuficiente para tareas que requieran documentos largos o conversaciones extensas.
- No se han publicado evaluaciones de seguridad, sesgos o robustez. El autor no proporciona garantías sobre el comportamiento en escenarios adversos.

## Enlaces

- [HuggingFace - mainbrains/neurologist-7b-instruct](https://huggingface.co/mainbrains/neurologist-7b-instruct)
- [Modelo base - NousResearch/Hermes-3-Llama-3.1-8B](https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B)
