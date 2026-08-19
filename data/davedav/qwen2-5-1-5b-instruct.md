# Davedav/Qwen2.5-1.5B-Instruct

## Resumen

Qwen2.5-1.5B-Instruct es un modelo de lenguaje causal, ajustado mediante instrucciones, desarrollado por Alibaba Cloud como parte de la serie Qwen2.5. Esta variante concreta, publicada por el usuario Davedav en HuggingFace, es un fine-tune del modelo original de Qwen y mantiene la misma arquitectura y capacidades. Con 1.543 millones de parámetros, es una opción ligera pensada para despliegue en entornos con recursos limitados, como dispositivos locales o infraestructuras de auto-hosting.

El modelo destaca por su soporte de contexto largo de hasta 32.768 tokens, generación de hasta 8.192 tokens y mejoras significativas en codificación, matemáticas, seguimiento de instrucciones y generación de JSON estructurado. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una alternativa atractiva para desarrolladores que buscan un modelo pequeño pero capaz para tareas conversacionales y de generación de texto.

La relevancia actual de este modelo reside en su equilibrio entre rendimiento y eficiencia: cabe en GPUs de consumo y puede ejecutarse con cuantizaciones de 4 y 8 bits, lo que lo hace accesible para prototipado rápido, agentes conversacionales y pipelines de generación de código en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, Attention QKV bias y word embeddings atados |
| Parametros totales | 1.543.714.304 (1.54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (entrada), 8.192 tokens (generacion) |
| Tipos de cuantizacion | no disponible (el repo no indica cuantizaciones; se puede cuantizar con herramientas como llama.cpp) |
| Idiomas soportados | Ingles (segun tags del repo); el modelo base soporta 29 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen2.5: un transformer causal con 28 capas, atención de consultas agrupadas (GQA) con 12 cabezas de consulta y 2 cabezas de clave-valor, y embeddings de palabras atados. Incorpora posiciones rotatorias (RoPE), capas feed-forward con SwiGLU y normalización RMSNorm. El entrenamiento se realizó en dos etapas: pretraining sobre un dataset de hasta 18 billones de tokens (según el blog oficial de Qwen) y post-training con ajuste de instrucciones.

La variante publicada por Davedav es un fine-tune del modelo base Qwen2.5-1.5B-Instruct, aunque la model card no detalla el dataset específico de fine-tuning ni el método empleado (RLHF, DPO o SFT). Se desconoce si se aplicaron técnicas adicionales de optimización. El modelo hereda las innovaciones de Qwen2.5, como la generación de JSON estructurado y la robustez frente a system prompts diversos.

## Capacidades

- Generación de texto conversacional con soporte de plantillas de chat (apply_chat_template).
- Generación de código en múltiples lenguajes de programación, con mejoras significativas respecto a Qwen2.
- Razonamiento matemático básico y resolución de problemas aritméticos.
- Generación de JSON estructurado y salidas en formato tabular.
- Comprensión de datos estructurados (tablas).
- Seguimiento de instrucciones y generación de texto largo (hasta 8.192 tokens).
- Soporte multilingüe en el modelo base (más de 21 idiomas), aunque este fine-tune declara solo inglés en sus tags.
- Compatible con el pipeline text-generation de HuggingFace Transformers y con text-generation-inference.

## Casos de uso

- Asistente de chat embebido en aplicaciones móviles o de escritorio: con 1.54B parámetros, puede ejecutarse en CPUs modernas o GPUs de consumo, ofreciendo respuestas conversacionales sin depender de APIs externas.
- Generación de código en entornos de desarrollo: integrable en editores de código para autocompletado y generación de funciones, aprovechando la mejora en codificación de Qwen2.5.
- Extracción de datos estructurados: dado su soporte para JSON, puede convertir texto libre en objetos JSON para pipelines de datos o integraciones con bases de datos.
- Chatbots de atención al cliente en inglés: con contexto de 32K tokens, puede gestionar conversaciones multi-turno largas y mantener el historial completo de la interacción.
- Prototipado rápido de agentes de IA: su licencia Apache-2.0 y su pequeño tamaño permiten iterar rápidamente en experimentos de agentes sin costes elevados de inferencia.
- Generación de respuestas en entornos sin conexión (edge): el modelo cabe en dispositivos con 4-8 GB de RAM si se cuantiza, habilitando asistentes offline en laptops o dispositivos móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este fine-tune específico en la información disponible. El modelo base Qwen2.5-1.5B-Instruct reporta resultados en el blog oficial de Qwen, pero no se incluyen en la model card de este repositorio. No se pueden confirmar cifras concretas de MMLU, HumanEval u otros benchmarks para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3.1 GB en FP16 (1.54B parámetros × 2 bytes), ~1.5 GB en cuantización de 8 bits y ~0.8 GB en cuantización de 4 bits.
- GPUs recomendadas: NVIDIA RTX 3060 (12GB), RTX 4060 (8GB), RTX 4090 (24GB) para inferencia con contexto largo; también puede ejecutarse en CPUs con suficiente RAM.
- Cabe en GPUs de consumo: sí, con cuantización de 4 bits puede ejecutarse en GPUs con 4GB de VRAM.
- Opciones de despliegue: Hugging Face Transformers, vLLM, TGI, llama.cpp (con conversión a GGUF), Ollama.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (este fine-tune) | 1.54B | 32K | Apache-2.0 | HuggingFace |
| Qwen2.5-1.5B-Instruct (oficial) | 1.54B | 32K | Apache-2.0 | HuggingFace |
| Llama-3.2-1B-Instruct | 1.23B | 128K | Llama 3.2 Community | HuggingFace |
| Gemma-2-2B-it | 2.6B | 8K | Gemma Terms | HuggingFace |

No se dispone de datos de rendimiento comparativo para este fine-tune, por lo que no se puede establecer una comparación cuantitativa. La comparativa se limita a características técnicas.

## Limitaciones y advertencias

- Sesgos: al ser un fine-tune de un modelo entrenado en datos de Internet, puede heredar sesgos de género, raza y culturales presentes en el corpus de entrenamiento.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Limitaciones de idioma: aunque el modelo base soporta 21 idiomas, este fine-tune declara solo inglés en sus tags, lo que puede degradar el rendimiento en otros idiomas.
- Sin datos de benchmarks: no hay evidencia de rendimiento en tareas estándar, lo que dificulta la evaluación objetiva de su calidad.
- Riesgo de overfitting: al ser un fine-tune no documentado, existe riesgo de que el modelo esté sobreajustado a un dataset específico y pierda generalización.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe incluir el aviso de licencia en la distribución.

## Enlaces

- HuggingFace: https://huggingface.co/Davedav/Qwen2.5-1.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo oficial instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper técnico de Qwen2: https://arxiv.org/abs/2407.10671
- Página de Ollama: https://ollama.com/library/qwen2.5:1.5b-instruct
