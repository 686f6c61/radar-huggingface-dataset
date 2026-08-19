# longtermrisk/Llama-3.1-8B-target-only-no-hallucination-kld-seed2

## Resumen

Este modelo es un ajuste fino del modelo Llama-3.1-8B-Instruct, desarrollado por la organización longtermrisk, con el objetivo declarado de reducir las alucinaciones en las respuestas generadas. El nombre del repositorio incluye el sufijo `kld-seed2`, lo que sugiere que el entrenamiento empleó una pérdida basada en divergencia de Kullback-Leibler (KLD) para penalizar desviaciones del modelo base hacia contenido no fiel a los datos de entrada. Se trata de una variante de investigación dentro de una serie de modelos del mismo autor con nombres similares (por ejemplo, `target-only-no-hallucination-full`, `target-only-no-hallucination-last-third-sft`), que exploran distintas estrategias de mitigación de alucinaciones.

La ficha técnica disponible es extremadamente limitada: la model card no incluye detalles sobre el dataset de entrenamiento, el procedimiento exacto de fine-tuning, ni métricas de evaluación. El modelo se distribuye bajo licencia Apache-2.0, está en inglés y se publica en formato Transformers, con pesos en safetensors. Dado que se basa en Llama-3.1-8B-Instruct, hereda la arquitectura transformer de 8.000 millones de parámetros y una ventana de contexto de 128.000 tokens, aunque no se ha confirmado si el fine-tuning preserva íntegramente estas características.

En resumen, se trata de un modelo experimental orientado a la investigación sobre alucinaciones, sin documentación pública de rendimiento ni de metodología, lo que limita su uso directo en producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No especificado; se puede cuantizar con herramientas como llama.cpp o vLLM |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, una versión del modelo Llama-3.1-8B-Instruct optimizada para entrenamiento rápido con Unsloth y la libreria TRL de HuggingFace. La arquitectura es la de un transformer decoder-only con atención multi-cabeza y normalización RMSNorm, sin módulos MoE. El modelo base tiene 8.000 millones de parámetros y una ventana de contexto de 128K tokens.

El entrenamiento del fine-tuning no está documentado en la model card. El nombre del repositorio sugiere que se empleó una pérdida de divergencia KLD (Kullback-Leibler divergence) entre las distribuciones de salida del modelo y una referencia, con el objetivo de penalizar las respuestas que se desvían de la fidelidad a la entrada. No se especifican los datos de entrenamiento, el número de pasos, ni si se usó RLHF o DPO. La única información disponible es que se usó Unsloth para acelerar el entrenamiento y la librería TRL de HuggingFace.

## Capacidades

- Generación de texto en inglés con seguimiento de instrucciones y chat, heredado de Llama-3.1-8B-Instruct.
- Razonamiento y respuesta a preguntas en contexto de conversación multi-turno.
- Soporte de tool calling y function calling (capacidades del modelo base).
- Capacidad de procesar contextos largos de hasta 128K tokens (teóricamente, si el fine-tuning no altera la arquitectura).
- No se ha publicado evidencia de que el ajuste haya mejorado la fidelidad de las respuestas ni de que reduzca efectivamente las alucinaciones.

## Casos de uso

- Investigación sobre mitigación de alucinaciones en LLMs: el modelo puede servir como banco de pruebas para comparar estrategias de entrenamiento contra el modelo base y otras variantes del mismo autor.
- Evaluación de fidelidad en tareas de extracción de información: dado su diseño orientado a reducir alucinaciones, podría evaluarse en tareas de resumen o QA donde la fidelidad a los documentos es crítica.
- Generación de respuestas en chatbots de bajo riesgo: en entornos controlados donde se prefiera un modelo conservador que evite inventar datos, aunque no se garantiza su eficacia.
- Fine-tuning posterior: al ser un modelo de 8B con licencia Apache-2.0, puede usarse como base para entrenar modelos más especializados en dominios concretos.
- Investigación en aprendizaje por refuerzo: el modelo puede servir para estudiar efectos de regularización con KLD en la reducción de alucinaciones.
- Comparación de métricas de fidelidad: útil para desarrollar métricas que midan la alucinación y validar su comportamiento frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se ofrece una comparación cuantitativa con el modelo base.

## Requisitos de hardware

- Inferencia en precisión FP16: requiere aproximadamente 16 GB de VRAM para el modelo completo (8B parámetros × 2 bytes). Con cuantización de 4 bits, puede reducirse a unos 5-6 GB.
- GPU recomendadas: para inferencia con contexto largo, una GPU con 24 GB de VRAM (como RTX 3090/4090 o A10G) es suficiente para FP16; para cuantización 4 bits, una RTX 3060 12 GB podría bastar.
- Se puede desplegar con vLLM, llama.cpp (GGUF), Ollama, o TGI (Text Generation Inference), todos compatibles con modelos de Transformers.
- El throughput dependerá del hardware y de la longitud del contexto; para un modelo de 8B en una A100, se espera un rendimiento de varios cientos de tokens por segundo en inferencia optimizada, pero no hay datos específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables que hayan sido evaluados con los mismos criterios. Se puede comparar con el modelo base Llama-3.1-8B-Instruct, del cual este modelo es un fine-tuning, pero no hay datos de rendimiento relativos. Otras variantes del mismo autor (`target-only-no-hallucination-full`, `target-only-no-hallucination-first-third-sft`) no tienen documentación pública. En consecuencia, no se puede establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No hay evidencia publicada de que el entrenamiento haya reducido efectivamente las alucinaciones; el nombre es indicativo pero no una garantía.
- El modelo solo está entrenado en inglés; no se ha evaluado su comportamiento en otros idiomas.
- La documentación es prácticamente inexistente: no se especifica el dataset de entrenamiento, el procedimiento de ajuste, ni las condiciones de uso recomendadas.
- Al ser un fine-tuning de un modelo instructivo, puede heredar sesgos y limitaciones del modelo base (por ejemplo, generación de contenido sensible, respuestas con información desactualizada).
- No se recomienda su uso en producción sin una evaluación rigurosa de su calidad y seguridad en el dominio de aplicación.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad del comportamiento del modelo.

## Enlaces

- [HuggingFace - longtermrisk/Llama-3.1-8B-target-only-no-hallucination-kld-seed2](https://huggingface.co/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-kld-seed2)
- [HuggingFace - modelo sin sufijo seed2 (variante)](https://huggingface.co/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-kld)
- [HuggingFace - variante first-third-sft](https://huggingface.co/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-first-third-sft-seed3-epoch3)
- [FriendliAI - página de despliegue de variante full](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-full)
- [FriendliAI - página de despliegue de variante last-third-sft](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-last-third-sft)
- [GitHub - meta-llama/llama3 (repos oficiales de Llama)](https://github.com/meta-llama/llama3)
