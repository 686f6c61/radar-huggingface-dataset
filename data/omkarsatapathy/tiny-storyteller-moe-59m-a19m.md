# Omkarsatapathy/Tiny-Storyteller-MoE-59M-A19M

## Resumen

Tiny-Storyteller-MoE-59M-A19M es un modelo de lenguaje pequeño con arquitectura de mezcla de expertos (MoE) desarrollado por Omkarsatapathy, entrenado desde cero sobre el dataset `roneneldan/TinyStoriesInstruct`. Con 59 millones de parámetros totales y solo 19 millones activos por token gracias a su diseño top-2-of-8, está pensado para generar cuentos infantiles en inglés a partir de instrucciones que especifican palabras clave, características y un resumen de la trama.

El modelo es relevante como ejemplo práctico de eficiencia MoE a escala reducida: demuestra que es posible obtener un comportamiento de mezcla de expertos con una huella de memoria mínima y ejecución en CPU, MPS o CUDA. Entrenado con MegaBlocks dMoE sobre una GPU H100, el repositorio incluye una implementación pura de PyTorch del mecanismo MoE, lo que facilita su uso con `transformers` sin dependencias adicionales. No es un modelo de propósito general: su vocabulario y capacidades están limitados al dominio de TinyStories.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT de 8 capas, dimensión 320, con bloques MoE top-2-of-8 SwiGLU por capa |
| Parametros totales | 59.019.200 |
| Parametros activos | ~19.000.000 (2 de 8 expertos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precisión mixta: attention/embeddings en float32, pesos de expertos y router en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un GPT decoder-only de 8 capas con dimensión oculta de 320, donde cada capa sustituye el bloque FFN denso por un bloque de mezcla de expertos con 8 expertos SwiGLU y selección top-2 por token. Esta configuración reduce los parámetros activos a aproximadamente un tercio del total, manteniendo la capacidad expresiva del conjunto de expertos. El router asigna cada token a los dos expertos más relevantes, lo que permite un ahorro computacional significativo respecto a un modelo denso equivalente.

El entrenamiento se realizó desde cero sobre `roneneldan/TinyStoriesInstruct` usando MegaBlocks dMoE en una GPU H100. El dataset consiste en instrucciones y cuentos infantiles generados sintéticamente, con un formato de prompt fijo que combina palabras obligatorias, características y un resumen de la trama. No se aplicó RLHF ni DPO; es un modelo base sin ajuste por instrucciones, entrenado únicamente con modelado de lenguaje autoregresivo sobre el formato de documento único descrito en la model card.

## Capacidades

- Generación de cuentos infantiles en inglés siguiendo una plantilla de instrucción estricta que incluye palabras obligatorias, características temáticas y un resumen de la trama.
- Generación por lotes (batched generation) con `padding_side = "left"`, como cualquier modelo decoder-only.
- Ejecución en CPU, MPS y CUDA gracias a la implementación pura de PyTorch del mecanismo MoE.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües: ninguna, únicamente inglés.

## Casos de uso

- Generación de cuentos infantiles educativos: el modelo puede producir historias cortas que integran palabras de vocabulario específicas (p. ej., "spring", "pitch", "flexible") y valores morales, útil para profesores que preparan materiales de lectura personalizados.
- Prototipado de arquitecturas MoE en entornos con recursos limitados: al ejecutarse en CPU o en GPUs de consumo, sirve como banco de pruebas para experimentar con selección de expertos, routing y eficiencia de parámetros sin necesidad de infraestructura de alto coste.
- Investigación académica sobre modelos pequeños: su tamaño reducido y licencia MIT lo hacen adecuado para estudios de interpretabilidad, análisis de comportamiento de routers MoE y comparaciones de eficiencia frente a modelos densos de tamaño similar.
- Demostraciones y material didáctico en cursos de deep learning: permite ilustrar conceptos de mezcla de expertos, sparse attention y entrenamiento con datos sintéticos en un ejemplo ejecutable y reproducible.
- Generación condicionada por palabras clave: el formato de instrucción obliga a que el modelo integre términos concretos en la narrativa, lo que lo convierte en una herramienta útil para ejercicios de escritura creativa guiada.
- Evaluación de pipelines de generación con formato de prompt estricto: su sensibilidad al formato exacto de la instrucción lo hace idóneo para probar sistemas de plantillas y validación de prompts en entornos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval ni GSM8K, y no se han encontrado evaluaciones externas del modelo en la búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (59M parámetros, aproximadamente 236 MB en fp32 y 118 MB en bf16).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo funciona también en CPU y en Apple Silicon vía MPS.
- Compatible con GPUs de consumo: sí, incluyendo RTX 3060, RTX 4060 y modelos integrados con VRAM compartida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La ausencia de KV cache implica que la generación recomputa el prefijo completo en cada paso, lo que aumenta el coste computacional con la longitud de la secuencia generada.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiny-Storyteller-MoE-59M-A19M | 59M totales / 19M activos | GPT + MoE top-2-of-8 SwiGLU | no disponible | MIT | HuggingFace |
| BerhakTanyildizi/tiny-storyteller | 30M | GPT denso | no disponible | no disponible | GitHub |
| Corianas/Tiny-Moe | no disponible | MoE | no disponible | no disponible | HuggingFace |

La comparativa se limita a modelos del mismo dominio (generación de cuentos infantiles con arquitecturas pequeñas). No se dispone de datos de rendimiento comparativos entre ellos, ya que ninguno publica benchmarks en la información disponible.

## Limitaciones y advertencias

- Vocabulario restringido al dominio de TinyStories: el modelo no es capaz de razonamiento, conocimiento del mundo, preguntas y respuestas ni tareas fuera de la generación de cuentos infantiles.
- Sin KV cache: cada paso de generación recomputa el prefijo completo, lo que degrada el rendimiento en secuencias largas y limita su uso en producción con latencia estricta.
- Sensibilidad extrema al formato de prompt: cualquier variación de la plantilla de instrucción documentada provoca que el modelo continúe escribiendo la instrucción en lugar de la historia. No generaliza a prompts redactados libremente.
- Modelo base sin instruction-tuning: no responde a preguntas ni sigue instrucciones generales, solo el formato específico `<|startofinstruction|>...<|endofinstruction|><|startofstory|>...<|endofstory|>`.
- Riesgo de alucinación: al ser un modelo generativo sin ajuste por retroalimentación humana, puede producir contenido incoherente o que no respeta el resumen proporcionado.
- Sesgos conocidos: no documentados, pero al entrenarse exclusivamente sobre TinyStoriesInstruct, hereda las limitaciones y posibles sesgos del dataset sintético original.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el comportamiento del modelo en entornos de producción.
- Solo inglés: no soporta otros idiomas, lo que limita su aplicabilidad en contextos multilingües.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Omkarsatapathy/Tiny-Storyteller-MoE-59M-A19M
- Dataset de entrenamiento: https://huggingface.co/datasets/roneneldan/TinyStoriesInstruct
- Repositorio de referencia del autor (no verificado): no disponible
- Paper o documentación técnica: no disponible
