# Arno0117/Qwen2.5-7B-Instruct-AWQ

## Resumen

El modelo `Arno0117/Qwen2.5-7B-Instruct-AWQ` es una versión cuantizada en 4 bits mediante la técnica AWQ (Activation-aware Weight Quantization) del modelo original `Qwen/Qwen2.5-7B-Instruct`, desarrollado por el equipo Qwen de Alibaba. Esta cuantización, publicada por el usuario Arno0117, reduce el tamaño del modelo de aproximadamente 15 GB (en BF16) a unos 5,6 GB, manteniendo la mayor parte de las capacidades del modelo original. Está pensado para facilitar el despliegue en entornos con recursos limitados, como GPUs de consumo o inferencia en producción con menor coste de memoria.

El modelo base Qwen2.5-7B-Instruct es un modelo de lenguaje causal con arquitectura transformer, 7,61 mil millones de parámetros, atención con consultas agrupadas (GQA), RoPE, SwiGLU y RMSNorm. Soporta un contexto de hasta 131.072 tokens (128K) mediante extensión YaRN, y genera hasta 8.192 tokens. La versión AWQ mantiene estas capacidades con una degradación mínima de rendimiento, según las pruebas de cuantización publicadas por el equipo de Qwen. Es relevante porque permite ejecutar un modelo de 7B de alta calidad en GPUs con menos de 8 GB de VRAM, lo que amplía su uso en entornos de desarrollo, edge computing y aplicaciones comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y Attention QKV bias |
| Parametros totales | 7.615.616.512 (7,61B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128K) con YaRN; 32.768 tokens en configuracion por defecto |
| Tipos de cuantizacion | AWQ 4-bit (pesos cuantizados, activaciones en FP16) |
| Idiomas soportados | 29 idiomas: chino, ingles, frances, español, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes, arabe, entre otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-7B-Instruct es un transformer causal de 28 capas, con 28 cabezas de atención para consultas (Q) y 4 para claves/valores (KV) usando atención de consultas agrupadas (GQA), lo que reduce el coste de memoria de la caché KV. Emplea incrustaciones posicionales rotatorias (RoPE), normalización RMSNorm y activación SwiGLU en las capas feed-forward. El entrenamiento del modelo original incluye una fase de preentrenamiento sobre un corpus masivo y una fase de post-entrenamiento con ajuste fino supervisado (SFT) y optimización por preferencias humanas (RLHF/DPO), según la documentación oficial de Qwen. La cuantización AWQ aplicada en este repositorio no implica reentrenamiento; se trata de una técnica que selecciona los pesos más importantes para la activación y los conserva en mayor precisión, minimizando la pérdida de calidad. El modelo resultante se distribuye en formato safetensors compatible con la librería `transformers` (versión >= 4.37.0) y es compatible con herramientas de inferencia como vLLM, TGI y llama.cpp.

## Capacidades

- Generación de texto conversacional y asistencia en tareas de instrucción con alta calidad de seguimiento de prompts.
- Razonamiento avanzado en matemáticas y codificación, mejorado respecto a la serie Qwen2.
- Comprensión de datos estructurados (tablas, JSON) y generación de salidas estructuradas en formato JSON.
- Generación de textos largos (hasta 8K tokens de salida) y manejo de contextos extensos de hasta 128K tokens mediante YaRN.
- Soporte multilingüe en 29 idiomas, incluyendo español, francés, alemán, italiano, portugués, ruso, árabe, japonés, coreano, vietnamita y tailandés.
- Robustez ante variaciones de prompts de sistema, adecuado para role-play y establecimiento de condiciones.
- No incluye capacidades de visión ni audio; es un modelo exclusivamente de texto.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 128K tokens) para mantener el historial completo de la interacción, gracias a su ventana de contexto ampliada y su capacidad de seguir instrucciones.
- Generación de código en producción: con capacidades mejoradas de codificación, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests unitarios, consumiendo menos VRAM que el modelo original gracias a la cuantización AWQ.
- Asistente de documentación técnica: capaz de resumir documentos extensos, extraer información de tablas y generar informes estructurados en JSON, útil para sistemas de gestión del conocimiento.
- Chatbot multilingüe para soporte internacional: al soportar 29 idiomas, puede desplegarse en plataformas de atención global sin necesidad de modelos separados por idioma.
- Procesamiento de datos estructurados: puede transformar datos no estructurados en formatos JSON, facilitando la integración con bases de datos y APIs.
- Educación y tutoría: puede explicar conceptos matemáticos o de programación, generar ejercicios personalizados y evaluar respuestas, funcionando en equipos con GPU de consumo como una RTX 3060.
- Prototipado rápido de agentes conversacionales: al ser ligero y compatible con vLLM, permite iterar rápidamente en entornos de desarrollo sin requerir infraestructura de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización AWQ en la información disponible. El modelo base Qwen2.5-7B-Instruct reporta resultados en el blog oficial de Qwen (MMLU, HumanEval, GSM8K, etc.), y el equipo de Qwen publica comparativas de rendimiento entre modelos cuantizados y sus versiones BF16 en su documentación de cuantización, pero no se incluyen cifras concretas en esta ficha. Se recomienda consultar las referencias enlazadas para obtener datos numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con contexto corto (512-2048 tokens) y 8-10 GB con contexto largo (32K+), debido a la caché KV adicional. El peso cuantizado ocupa unos 4 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, A10, L4, A100 (para despliegues con alto throughput). En GPUs con 8 GB (RTX 3070, RTX 4060) funciona con contexto moderado.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más, siempre que se limite la longitud del contexto.
- Opciones de despliegue: vLLM (recomendado por el equipo de Qwen), Hugging Face TGI, llama.cpp (con conversión a GGUF), Ollama (si se convierte), y transformers nativo con `device_map="auto"`.
- Latencia y throughput: no se dispone de datos medidos para esta cuantización específica; en general, un modelo 7B AWQ en una RTX 4090 puede alcanzar entre 50-100 tokens/s con batch pequeño, y entre 100-200 tokens/s con batching en vLLM, pero son estimaciones orientativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Arno0117/Qwen2.5-7B-Instruct-AWQ | 7,61B | 128K (YaRN) | AWQ 4-bit | Apache 2.0 | Cuantizacion de Qwen2.5-7B-Instruct |
| Qwen/Qwen2.5-7B-Instruct (BF16) | 7,61B | 128K (YaRN) | BF16 | Apache 2.0 | Original sin cuantizar, ~15 GB |
| Meta-Llama-3.1-8B-Instruct (AWQ) | 8,03B | 128K | AWQ 4-bit | Llama 3.1 License | Alternativa similar en tamano, con licencia restrictiva para uso comercial |
| Mistral-7B-Instruct-v0.3 (AWQ) | 7,24B | 32K | AWQ 4-bit | Apache 2.0 | Menor contexto, capacidades inferiores en codigo y matematicas |

La comparativa muestra que esta cuantización ofrece el mismo rendimiento que el modelo base de Qwen con un 60% menos de memoria, y compite directamente con otras cuantizaciones de modelos 7B/8B. La principal ventaja frente a Llama 3.1 es la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: como cualquier LLM entrenado con datos de internet, puede reflejar sesgos sociales, culturales o de género presentes en los datos de entrenamiento.
- Riesgo de alucinación: puede generar información falsa o inventada, especialmente en temas de actualidad o datos precisos; se recomienda validación humana en aplicaciones críticas.
- Limitaciones de contexto: aunque soporta 128K tokens con YaRN, el rendimiento en contextos muy largos puede degradarse; la configuración por defecto está limitada a 32K tokens y requiere activar YaRN manualmente.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base es propiedad de Alibaba; se debe cumplir con los términos de la licencia y atribuir correctamente.
- Cuantización AWQ: aunque la pérdida de calidad es mínima, puede haber pequeñas diferencias en tareas de alta precisión (por ejemplo, matemáticas complejas) respecto al modelo en BF16.
- Dependencia de versiones: requiere `transformers >= 4.37.0`; versiones anteriores producen errores de carga.
- El repositorio de Arno0117 no tiene descargas ni likes, lo que sugiere que es una re-subida no verificada del modelo oficial; se recomienda usar el repositorio oficial `Qwen/Qwen2.5-7B-Instruct-AWQ` para entornos de producción.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/Arno0117/Qwen2.5-7B-Instruct-AWQ
- Modelo base oficial (AWQ): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-AWQ
- Modelo base en BF16: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Documentacion de cuantizacion AWQ: https://qwen.readthedocs.io/en/latest/quantization/awq.html
- Documentacion de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Coleccion de modelos Qwen2.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen25
