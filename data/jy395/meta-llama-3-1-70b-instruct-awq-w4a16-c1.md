# jy395/Meta-Llama-3.1-70B-Instruct-awq-w4a16-c1

## Resumen

Meta-Llama-3.1-70B-Instruct-awq-w4a16-c1 es una versión cuantizada en 4 bits (esquema asimétrico W4A16, método AWQ) del modelo Meta-Llama-3.1-70B-Instruct de Meta, publicada por el usuario jy395 en Hugging Face. No se trata de un modelo nuevo desde cero, sino de un checkpoint comprimido generado con la librería llm-compressor del proyecto vLLM y calibrado sobre el corpus C1 (WikiText-2, texto genérico), con 128 secuencias de 2048 tokens (262.144 tokens en total).

Este checkpoint es una de las 30 configuraciones comprimidas publicadas junto al artículo de ICAIF '26 "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs", que estudia cuándo la compresión post-entrenamiento de LLMs financieros requiere datos de calibración específicos del dominio. Su relevancia es doble: por un lado, ofrece una versión de Llama 3.1 70B Instruct con unos 39,8 GB de pesos (frente a los ~140 GB en FP16 del original), más manejable en GPU; por otro, sirve como material experimental para investigar el impacto de los datos de calibración en la cuantización.

El modelo conserva la arquitectura transformer decoder-only de Llama 3.1 y su licencia original (Llama 3.1 Community License). El formato de pesos es safetensors en formato compressed-tensors, cargable directamente en vLLM o mediante transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 11.260.666.976 (dato real de safetensors; el modelo base tiene 70B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha (el base Llama 3.1 70B soporta 128k tokens) |
| Tipos de cuantizacion | AWQ W4A16 (4 bits asimétrico en pesos, activaciones en 16 bits) |
| Idiomas soportados | no disponible (el base Llama 3.1 soporta oficialmente 8 idiomas) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (compressed-tensors) |

Nota: la cifra de 11.260.666.976 corresponde al dato real del repositorio safetensors, que difiere del nominal de 70B del modelo base; esta discrepancia puede deberse a cómo se contabilizan los parámetros comprimidos o empaquetados en el checkpoint.

## Arquitectura y entrenamiento

El modelo base, Meta-Llama-3.1-70B-Instruct, es un transformer decoder-only de 70 mil millones de parámetros entrenado por Meta, con soporte de contexto largo (hasta 128k tokens en el original) y afinado por instrucciones. Los detalles de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no se detallan en la model card de este checkpoint.

Lo específico de esta versión es la compresión post-entrenamiento: se aplicó cuantización AWQ (Activation-aware Weight Quantization) con esquema asimétrico W4A16, es decir, pesos en 4 bits y activaciones en 16 bits, usando la librería llm-compressor de vLLM. La calibración se realizó sobre el corpus C1 (WikiText-2, texto genérico, no financiero), consumiendo el corpus completo con 128 secuencias de 2048 tokens (262.144 tokens), longitud máxima de secuencia 2048 y semilla 42. El script de generación está disponible en el repositorio de código del artículo. Este checkpoint es deliberadamente un punto de comparación: el artículo de ICAIF '26 lo usa como caso de calibración con datos genéricos frente a otras configuraciones calibradas con datos financieros, para medir cuándo importa el dominio de los datos de calibración.

## Capacidades

Hereda las capacidades del modelo base Meta-Llama-3.1-70B-Instruct:

- Generación de texto conversacional y seguimiento de instrucciones (modelo instruct).
- Razonamiento general, matemáticas y generación de código.
- Soporte multilingüe (el modelo base Llama 3.1 soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés).
- Contexto largo (hasta 128k tokens en el modelo base, sujeto a la configuración de despliegue).
- Compatible con el ecosistema estándar de Llama para tool calling y agentes (no verificado específicamente para este checkpoint).
- Etiquetado en Hugging Face con la etiqueta "finance", por su uso en el estudio de compresión de LLMs financieros; no es un modelo especializado en finanzas.

## Casos de uso

- Investigación en compresión de LLMs: es uno de los 30 checkpoints del estudio de ICAIF '26; sirve como baseline de calibración con datos genéricos (WikiText-2) para comparar contra calibraciones específicas de dominio financiero.
- Despliegue de un LLM 70B en una sola GPU de alta gama: con pesos en 4 bits (~39,8 GB), el modelo cabe en GPUs con 48 GB de VRAM, reduciendo el coste de servir un modelo de 70B.
- Inferencia eficiente con vLLM: el formato compressed-tensors carga directamente en vLLM, adecuado para servir el modelo con batching continuo y alto throughput en producción.
- Asistentes conversacionales multi-turno: hereda las capacidades instruct del modelo base, con soporte de contexto largo para conversaciones extensas.
- Experimentación con llm-compressor: el checkpoint y sus scripts permiten reproducir el pipeline de cuantización AWQ W4A16 y adaptarlo a otros modelos o corpus de calibración.
- Evaluación de tareas financieras: el repositorio asociado incluye una suite de evaluación con diez tareas financieras para medir la degradación tras la compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint concreto. El artículo asociado evalúa diez tareas financieras, pero los resultados específicos de esta configuración no se incluyen en la model card. Para resultados cuantitativos, consultar el repositorio github.com/JunyiYe/finance-ptc-calibration y el artículo de ICAIF '26.

## Requisitos de hardware

- Tamaño del repositorio: 39,8 GB en pesos W4A16; para inferencia se recomienda al menos 48 GB de VRAM (pesos más KV cache y activaciones).
- GPUs recomendadas: A100 40 GB quedará justa (posible offload); A100 80 GB, H100 80 GB o 2x RTX 6000 Ada 48 GB son opciones cómodas. En consumer, 2x RTX 4090 (48 GB totales) podría alojar los pesos con ajustes de KV cache, aunque sin garantías.
- No cabe en una única GPU consumer de 24 GB (RTX 3090/4090) con este esquema W4A16.
- Despliegue: carga directa en vLLM (formato compressed-tensors, caso de uso principal) o mediante transformers con `device_map="auto"`. No se menciona soporte para llama.cpp u Ollama (el formato compressed-tensors no es GGUF).
- Latencia y throughput: no disponibles; al ser W4A16, la inferencia en vLLM con kernels optimizados suele reducir el ancho de banda de memoria necesario frente a FP16, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano aprox. | Licencia | Notas |
|---|---|---|---|---|---|
| jy395/Meta-Llama-3.1-70B-Instruct-awq-w4a16-c1 | 70B (base) | AWQ W4A16, calibrado en WikiText-2 | 39,8 GB | Llama 3.1 | Parte del estudio ICAIF '26 sobre calibración |
| meta-llama/Meta-Llama-3.1-70B-Instruct | 70B | FP16/BF16 (sin comprimir) | ~140 GB | Llama 3.1 | Modelo base; máxima fidelidad, mayor VRAM |
| Otras configuraciones de la colección ICAIF '26 | 70B (base) | Varias (30 configuraciones) | Variable | Llama 3.1 | Calibradas con distintos corpus, incluidos datos financieros |

No hay datos de rendimiento comparativo publicados en la model card; la comparación de calidad entre configuraciones es el objeto del artículo asociado.

## Limitaciones y advertencias

- Licencia Llama 3.1 Community License: impone restricciones al uso comercial (límite de 700 millones de usuarios activos mensuales sin licencia de Meta, requisitos de atribución "Built with Llama" y política de uso aceptable). No es una licencia totalmente abierta tipo Apache o MIT.
- Riesgo de degradación por cuantización: al ser un checkpoint comprimido calibrado con texto genérico (WikiText-2), puede sufrir mayor pérdida de calidad en dominios especializados (p. ej., finanzas) que configuraciones calibradas con datos del dominio; este es precisamente el fenómeno que estudia el artículo asociado.
- Hereda las limitaciones del modelo base: riesgo de alucinaciones, posibles sesgos presentes en los datos de entrenamiento de Llama 3.1 y posibilidad de generar contenido incorrecto o perjudicial.
- Discrepancia en el conteo de parámetros: los safetensors reportan ~11,26B frente a los 70B nominales del base; conviene verificar la integridad y el comportamiento del checkpoint antes de uso en producción.
- Adopción mínima: 0 descargas y 0 likes en el momento de la ficha; es un artefacto de investigación sin validación comunitaria amplia.
- Longitud de contexto y capacidades exactas del checkpoint (tool calling, 128k de contexto) no están verificadas explícitamente para esta versión cuantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jy395/Meta-Llama-3.1-70B-Instruct-awq-w4a16-c1
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-70B-Instruct
- Artículo (DOI): https://doi.org/10.1145/3858063.3858724
- Repositorio de código y evaluación: https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantización: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/awq_w4a16.py
- Suite de evaluación: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Colección completa en Hugging Face: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Librería de compresión: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
