# localized-ft/Llama-3.1-8B-target-only-no-hallucination-first-third-sft-seed5-epoch3

## Resumen

El modelo `localized-ft/Llama-3.1-8B-target-only-no-hallucination-first-third-sft-seed5-epoch3` es un ajuste fino supervisado (SFT) del modelo `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Su objetivo declarado en el nombre es reducir las alucinaciones en las respuestas generadas, mediante un entrenamiento selectivo sobre una fracción de los datos (primera y tercera parte, según la nomenclatura) y con una estrategia de solo tokens objetivo (`target-only`). El entrenamiento se realizó con la librería Unsloth y el framework TRL de Hugging Face, durante 3 épocas y con una semilla fija (seed 5).

Con 8.030 millones de parámetros, este modelo se posiciona en la gama de los 8B, un tamaño que permite su ejecución en hardware de consumo con cuantización. Su relevancia actual radica en ser un experimento reproducible y abierto (licencia Apache-2.0) para investigar técnicas de mitigación de alucinaciones en modelos de lenguaje grandes, un problema crítico en aplicaciones de producción. Aunque no se han publicado benchmarks formales, el modelo está disponible públicamente y puede servir como punto de partida para evaluar estrategias de SFT dirigidas a mejorar la fidelidad factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3.1-8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del base, probablemente 128K) |
| Tipos de cuantizacion | no disponible (no se especifican en la ficha) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer decoder con atención multi-cabeza, normalización RMSNorm, y activación SwiGLU. El checkpoint original (`unsloth/Meta-Llama-3.1-8B-Instruct`) ya incluye un ajuste instructivo con datos de conversación y razonamiento. El fine-tuning aquí descrito aplica una etapa adicional de SFT con Unsloth, que optimiza el uso de memoria y acelera el entrenamiento, y con TRL para el bucle de entrenamiento.

Según la nomenclatura del nombre, el entrenamiento se realizó sobre una subselección de los datos (primera y tercera parte) y con un enfoque `target-only`, lo que sugiere que solo se actualizaron los pesos sobre ciertos tokens objetivo (posiblemente las respuestas o segmentos factuales) en lugar de toda la secuencia. No se proporcionan detalles sobre el volumen de tokens, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El entrenamiento duró 3 épocas con semilla 5, lo que permite reproducibilidad.

## Capacidades

- Generacion de texto en ingles: el modelo mantiene las capacidades generativas del base Llama-3.1-8B-Instruct, incluyendo respuestas a instrucciones y conversacion multi-turno.
- Razonamiento y conocimiento general: hereda las competencias del modelo base en tareas de sentido comun, matematicas y conocimiento enciclopedico, aunque no se han verificado tras el fine-tuning.
- Reduccion de alucinaciones: el objetivo principal del ajuste es disminuir la generacion de contenido falso o no verificado, aunque no se aportan metricas que confirmen su eficacia.
- Soporte de tool calling y agentes: no se documenta explicitamente, pero el modelo base Llama-3.1-8B-Instruct incluye soporte para function calling; se asume que se mantiene, sin confirmacion.
- Multilingue: no, el modelo esta etiquetado solo para ingles.

## Casos de uso

- Investigacion en mitigacion de alucinaciones: el modelo es un candidato ideal para estudios comparativos sobre tecnicas de SFT selectiva, permitiendo aislar el efecto de entrenar solo sobre ciertos segmentos de datos.
- Evaluacion de fidelidad factual en sistemas de QA: puede desplegarse en entornos de prueba para medir la tasa de respuestas correctas frente a modelos base, usando datasets como TruthfulQA o FactScore.
- Generacion de respuestas en dominios regulados (pruebas de concepto): en sectores como salud o finanzas, donde la precision es critica, este modelo puede servir como prototipo para validar si la reduccion de alucinaciones mejora la confiabilidad antes de escalar a modelos mayores.
- Fine-tuning posterior: al estar publicado con pesos abiertos y licencia permisiva, puede usarse como checkpoint inicial para nuevas etapas de entrenamiento con datasets especificos.
- Benchmarking de hardware: al ser un modelo de 8B, es util para medir el rendimiento de inferencia en GPUs de consumo (RTX 3090, 4090) con diferentes cuantizaciones.
- Educacion y divulgacion: sirve como ejemplo practico de como aplicar Unsloth y TRL para crear modelos especializados, documentado en su model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandar. Tampoco se ofrecen comparativas con el modelo base o con otros fine-tunes similares. Se recomienda al usuario ejecutar sus propias evaluaciones antes de considerar su uso en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP16, el modelo ocupa aproximadamente 16 GB (8.03B parametros × 2 bytes), por lo que se necesita una GPU con al menos 16-20 GB de VRAM. Con cuantizacion de 4 bits (por ejemplo, GPTQ o AWQ), el uso se reduce a unos 4-5 GB, permitiendo ejecucion en GPUs de 8 GB como la RTX 3070 o RTX 4060.
- GPUs recomendadas: para FP16, una RTX 3090, RTX 4090, A10, A100 o similar. Para cuantizacion, cualquier GPU con 8 GB o mas.
- Opciones de despliegue: compatible con vLLM, Text Generation Inference (TGI), llama.cpp, Ollama y Transformers de Hugging Face. El modelo esta etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantizacion y el backend. En una RTX 4090 con cuantizacion 4-bit, se puede esperar una generacion de decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8.03B | 128K | Llama 3.1 Community License | Instruct general |
| localized-ft/Llama-3.1-8B-target-only-no-hallucination-first-third-sft-seed5-epoch3 | 8.03B | no disponible | Apache-2.0 | SFT anti-alucinacion |
| Llama-3.1-8B (base sin instruct) | 8.03B | 128K | Llama 3.1 Community License | Modelo base |

No se dispone de datos de rendimiento comparativo. La diferencia principal radica en la licencia (Apache-2.0 frente a la licencia comunitaria de Meta) y en el proposito del fine-tuning. No se han encontrado otros modelos de la misma categoria con metricas publicadas.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado. Al derivar de Llama-3.1-8B-Instruct, puede heredar sesgos presentes en los datos de entrenamiento originales de Meta.
- Riesgo de alucinacion: el fine-tuning busca reducirlo, pero no hay evidencia publica de su eficacia. No debe asumirse que el modelo es completamente fiable.
- Limitaciones de contexto: la longitud de contexto no se especifica en la ficha; se recomienda asumir la del base (128K) solo tras verificacion.
- Limitaciones de idioma: solo ingles. No es adecuado para tareas multilingues.
- Restricciones de licencia: aunque el modelo se publica con Apache-2.0, el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct` esta sujeto a la Llama 3.1 Community License de Meta, que impone condiciones de uso aceptable. Es responsabilidad del usuario verificar la compatibilidad de ambas licencias antes de un despliegue comercial.
- Advertencia para produccion: al ser un experimento de investigacion sin benchmarks, no se recomienda su uso directo en sistemas criticos sin una evaluacion exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-target-only-no-hallucination-first-third-sft-seed5-epoch3
- Modelo sin sufijo epoch3 (variante): https://huggingface.co/localized-ft/Llama-3.1-8B-target-only-no-hallucination-first-third-sft-seed5
- Referencia en FriendliAI (despliegue): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-first-third-sft
- Variante last-third en FriendliAI: https://friendli.ai/models/localized-ft/Llama-3.1-8B-target-only-no-hallucination-last-third-sft-seed3-epoch3
- Guia de despliegue local de Llama-3.1-8B (referencia general): https://aiindigo.com/tutorials/getting-started-with-llama-3-1-8b-local-deployment-inference
