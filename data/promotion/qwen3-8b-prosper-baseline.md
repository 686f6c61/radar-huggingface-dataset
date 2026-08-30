# promotion/Qwen3-8B-PROSPER-baseline

## Resumen

Qwen3-8B-PROSPER-baseline es un modelo de alineación multi-objetivo desarrollado por el usuario "promotion" sobre el backbone Qwen3-8B. Forma parte de la familia PROSPER / MaxEntBW, un enfoque que trata la alineación como un problema de negociación de Nash entre varios objetivos de preferencia (helpfulness, truthfulness, honesty e instruction following). Este baseline concreto no negocia entre los cuatro objetivos, sino que mantiene el peor de ellos en cada prompt, lo que lo convierte en un punto de referencia para evaluar la ganancia de la negociación multi-objetivo frente a estrategias conservadoras.

El modelo se entrena desde Qwen3-8B, que actúa tanto como política de referencia como inicialización. Según la model card, en el panel de evaluación con 100 prompts y un oráculo Qwen3-32B, el baseline obtiene un surplus medio de +0.0177 sobre la referencia, pero con una ligera pérdida en truthfulness (-0.0016), lo que viola la racionalidad individual en ese objetivo. Es un modelo de investigación, no un producto listo para producción, y requiere el tokenizer específico incluido en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredado de Qwen3-8B, no especificado en el repo) |
| Tipos de cuantizacion | No disponible (repo en safetensors, 32.8 GB, probablemente fp32) |
| Idiomas soportados | No disponible (el modelo base Qwen3-8B soporta 119 idiomas, pero este fine-tune no especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8.190 millones de parámetros. El entrenamiento de alineación utiliza el marco PROSPER / MaxEntBW, que formula la optimización de preferencias como un problema de negociación de Nash entre múltiples objetivos. En este baseline, en lugar de maximizar el bienestar conjunto mediante negociación, se conserva el peor objetivo de cada prompt (estrategia maximin). La model card advierte que el pipeline de entrenamiento requiere que el prompt de generación sea un prefijo estricto de la conversación renderizada, y que el template debe emitir un bloque vacío de `thinking` de forma incondicional; sin esto, el modelo razona en voz alta y la mayoría de las generaciones terminan dentro del trace, corrompiendo la señal de preferencia. Por ello, es imprescindible usar el tokenizer incluido en el repositorio en lugar del estándar de Qwen3-8B.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3-8B, incluyendo razonamiento multi-step y modos de pensamiento (thinking / non-thinking), aunque este fine-tune no documenta explícitamente su comportamiento en esos modos.
- Alineación multi-objetivo: mejora la helpfulness (+0.0395), honesty (+0.0159) e instruction following (+0.0169) respecto a la referencia, con una pérdida mínima en truthfulness (-0.0016).
- No se documentan capacidades específicas de tool calling, function calling o agentes en este fine-tune concreto.
- Multilingüismo: no se especifica para este modelo, aunque el base Qwen3-8B soporta 119 idiomas y dialectos.

## Casos de uso

- Investigación en alineación multi-objetivo: sirve como baseline para comparar estrategias de negociación de Nash frente a enfoques conservadores (maximin) en la optimización de preferencias.
- Evaluación de métodos de preference optimization: permite medir el impacto de la negociación multi-objetivo en la racionalidad individual de cada objetivo, especialmente en truthfulness.
- Fine-tuning posterior: al ser un modelo de 8B parámetros con licencia Apache-2.0, puede usarse como punto de partida para tareas específicas de alineación o para experimentos de RLHF/DPO.
- Benchmarking de oráculos de preferencia: las generaciones del modelo están disponibles en el dataset `promotion/nbpo-benchmark-generations`, lo que facilita reproducir y comparar resultados.
- Estudio de trade-offs entre objetivos: útil para analizar cómo la optimización de un objetivo puede degradar otro, un problema central en alineación.
- Desarrollo de pipelines de alineación con templates de chat: el requisito del bloque vacío de `thinking` lo convierte en un caso de estudio para integración de templates en frameworks de entrenamiento.

## Benchmarks y rendimiento

La model card proporciona el surplus objetivo sobre la política de referencia (escala de población, 100 prompts, oráculo Qwen3-32B, promediado por intercambio de orden de presentación):

| Objetivo | Surplus |
|---|---|
| Helpfulness | +0.0395 |
| Truthfulness | -0.0016 |
| Honesty | +0.0159 |
| Instruction following | +0.0169 |
| **Mínimo** | -0.0016 |
| **Promedio** | +0.0177 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 32.8 GB, lo que sugiere pesos en fp32 (4 bytes por parámetro). Para inferencia en fp32 se necesitan aproximadamente 33 GB de VRAM; en bf16 (si se convierte) unos 16 GB; en int8 unos 8 GB; en int4 unos 4 GB. No se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para fp32, una A100 40GB o 80GB, o una RTX 4090 (24GB) no sería suficiente en fp32 pero sí en bf16. Para cuantizaciones ligeras, una RTX 3090 o 4090 podría ser viable.
- Despliegue: no se especifican opciones oficiales, pero al ser un modelo basado en Qwen3-8B, es compatible con vLLM, llama.cpp, Ollama y TGI si se convierte a los formatos adecuados (GGUF, etc.).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque de alineación |
|---|---|---|---|---|
| Qwen3-8B-PROSPER-baseline | 8.19B | No disponible | Apache-2.0 | Maximin (peor objetivo) |
| Qwen3-8B (base) | 8.19B | No disponible (Qwen3 soporta hasta 32K en algunas variantes) | Apache-2.0 | Sin alineación específica |
| Llama-3.1-8B-PROSPER-baseline | 8.03B | No disponible | No especificada | Maximin (peor objetivo) |

La comparativa se limita a los modelos PROSPER-baseline de la misma familia y al modelo base. No hay datos de rendimiento estándar para comparar directamente.

## Limitaciones y advertencias

- Pérdida de truthfulness: el modelo degrada ligeramente la veracidad (-0.0016), lo que lo hace inadecuado para aplicaciones donde la exactitud factual sea crítica.
- Requisito de tokenizer específico: usar el tokenizer estándar de Qwen3-8B rompe el comportamiento del modelo, ya que el template de chat debe emitir el bloque vacío de `thinking` de forma incondicional.
- Modelo de investigación: no se ha validado para uso en producción; no hay datos de robustez, sesgos o alucinaciones específicos de este fine-tune.
- Sin benchmarks estándar: no se han publicado resultados en MMLU, HumanEval, etc., lo que dificulta comparar su rendimiento general con otros modelos.
- Dependencia del oráculo: los resultados de surplus dependen del oráculo Qwen3-32B y del conjunto de 100 prompts, lo que limita la generalización de las conclusiones.
- Licencia: aunque es Apache-2.0, el modelo base Qwen3-8B tiene su propia licencia (Qwen3 licence, mencionada en la model card), que puede imponer restricciones adicionales para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/promotion/Qwen3-8B-PROSPER-baseline
- Dataset de generaciones: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Modelo relacionado (Llama-3.1-8B-PROSPER-baseline): https://huggingface.co/promotion/Llama-3.1-8B-PROSPER-baseline
- Reporte técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Página de Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/compute/models/qwen3_8b
- Qwen3-8B en QwenCloud: https://www.qwencloud.com/models/qwen3-8b
