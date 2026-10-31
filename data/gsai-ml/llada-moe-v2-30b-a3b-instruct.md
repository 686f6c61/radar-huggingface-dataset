# GSAI-ML/LLaDA-MoE-v2-30B-A3B-Instruct

## Resumen

LLaDA-MoE-v2-30B-A3B-Instruct es un modelo de lenguaje de difusión (diffusion language model) con arquitectura mixture-of-experts (MoE), desarrollado por GSAI-ML. Forma parte de la familia LLaDA MoE v2 y es la variante ajustada por instrucciones (instruction-tuned) del checkpoint base GSAI-ML/LLaDA-MoE-v2-30B-A3B-Base, con el que comparte la implementación pública de la arquitectura pero no los pesos finales.

A diferencia de los modelos autorregresivos tradicionales, LLaDA-MoE-v2 genera texto mediante un proceso de desenmascarado iterativo: el modelo predice tokens enmascarados y los va revelando por bloques en función de su confianza, lo que constituye una alternativa emergente al paradigma causal de decodificación. El modelo cuenta con 31.781.497.856 parámetros totales, de los cuales aproximadamente 3B están activos por token (según la nomenclatura A3B), lo que permite inferencias eficientes manteniendo la capacidad de un modelo mucho mayor.

Su relevancia radica en que representa la escalación de los modelos de difusión a escala MoE de 30B, publicada junto al artículo "LLaDA MoE v2: Scaling Mixture-of-Experts Diffusion Language Models" (arXiv:2608.03457). Está publicado bajo licencia Apache 2.0 en safetensors, con soporte en la librería Transformers mediante código personalizado (custom_code).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (dLLM) con mixture-of-experts (llada_moe_v2) |
| Parametros totales | 31.781.497.856 (31,8B) |
| Parametros activos | Aproximadamente 3B por token (según nomenclatura 30B-A3B; dato exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (63,6 GB el repositorio completo) |

## Arquitectura y entrenamiento

LLaDA-MoE-v2 es un modelo de difusión de lenguaje enmascarado (masked diffusion language model, dLLM). En lugar de predecir el siguiente token de izquierda a derecha, el modelo opera sobre secuencias donde parte de los tokens están enmascarados y aprende a reconstruirlos, decodificando en pasos iterativos por bloques: en cada paso calcula logits para todas las posiciones enmascaradas del bloque, ordena los tokens candidatos por confianza (probabilidad softmax) y transfiere los de mayor confianza, ya sea siguiendo una planificación fija de tokens por paso o mediante un umbral dinámico de confianza. El ejemplo oficial del autor muestra decodificación con 64 pasos, bloques de 64 tokens, ruido Gumbel para muestreo con temperatura y parada temprana por token EOS.

Sobre esta base de difusión se aplica una arquitectura mixture-of-experts: con 31,8B de parámetros totales y unos 3B activos por token, el modelo activa solo un subconjunto de expertos en cada pasada, reduciendo el coste computacional por token respecto a un modelo denso equivalente. La variante Instruct es un ajuste fino por instrucciones del checkpoint Base; los detalles sobre el número de tokens de entrenamiento, la composición del dataset y el uso de RLHF/DPO no están disponibles en la información publicada. El modelo requiere `trust_remote_code=True` al cargarse con Transformers, ya que utiliza una implementación de arquitectura personalizada.

## Capacidades

- Generación de texto por instrucciones, al ser la variante instruction-tuned de la familia LLaDA MoE v2.
- Razonamiento y resolución de problemas: el propio ejemplo de la model card incluye un problema aritmético multi-paso, lo que sugiere capacidad para tareas de razonamiento básico.
- Generación paralela de tokens: al ser un modelo de difusión, puede materializar varios tokens por paso de decodificación, con parámetros configurables (steps, block_length, threshold) para ajustar la relación velocidad/calidad.
- Muestreo controlable: temperatura mediante ruido Gumbel, decodificación determinista con temperature=0 y parada temprana basada en EOS.
- Soporte de chat: incluye chat template con roles de sistema y usuario (`apply_chat_template`).
- Soporte de tool calling, agentes y capacidades multilingües: no disponible en la información publicada.
- Integración con Transformers mediante `AutoModel` y `AutoTokenizer` con `trust_remote_code=True`, y compatibilidad con `torch.compile` para optimizar la inferencia.

## Casos de uso

- Generación de texto asistida por instrucciones: como variante Instruct, está pensada para asistentes conversacionales que siguen indicaciones del usuario en formato multi-turno mediante su chat template.
- Investigación en modelos de difusión de lenguaje: es uno de los pocos dLLM MoE a escala 30B con pesos abiertos, ideal para estudiar decodificación por desenmascarado, planificación de bloques y dinámicas de confianza frente a modelos autorregresivos.
- Experimentación con estrategias de decodificación: los parámetros steps, block_length, threshold y minimal_topk permiten investigar el compromiso entre número de pasos de red (coste computacional) y calidad del texto generado.
- Sistemas con presupuesto de cómputo ajustado: al activar solo ~3B de parámetros por token pese a tener 31,8B totales, es adecuado para despliegues donde el throughput por token importa más que el tamaño en memoria.
- Generación por bloques para edición y reescritura: la decodificación no causal permite regenerar o completar fragmentos de texto sin reescribir todo el contexto, útil en herramientas de edición de documentos.
- Prototipado de agentes con Transformers: puede integrarse en pipelines basados en Hugging Face Transformers con chat template, aunque el soporte de function calling no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para datos de evaluación, consultar el artículo "LLaDA MoE v2: Scaling Mixture-of-Experts Diffusion Language Models" (arXiv:2608.03457).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 63-64 GB solo para los pesos (el repositorio ocupa 63,6 GB), lo que exige una GPU con más de 64 GB de VRAM o reparto en varias GPUs. No hay pesos cuantizados publicados, por lo que no se puede estimar consumo en 4/8 bits con datos reales.
- GPU recomendadas: NVIDIA A100 (80 GB) o H100 (80 GB) en una sola unidad; alternativamente, dos A100/H100 de 40-80 GB con paralelismo de tensores o sharding con `device_map="auto"`.
- Consumer GPUs: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) sin cuantización, que no está disponible oficialmente en el repositorio.
- Despliegue: mediante Hugging Face Transformers con `trust_remote_code=True` y `torch.compile` (el método oficial). No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI; dado que es una arquitectura de difusión personalizada (llada_moe_v2), probablemente requiera soporte específico no disponible (no disponible).
- Latencia y throughput: no disponibles. El coste por paso depende de steps y block_length; con los valores por defecto del ejemplo (64 pasos, bloques de 64 tokens), cada bloque requiere hasta 64 pasadas completas del modelo, aunque cada pasada puede materializar varios tokens simultáneamente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLaDA-MoE-v2-30B-A3B-Instruct | Difusión MoE (dLLM) | 31,8B totales / ~3B activos | no disponible | Apache 2.0 | Pesos abiertos en Hugging Face |
| LLaDA-8B-Instruct (GSAI-ML) | Difusión denso (dLLM) | 8B | no disponible | no disponible | Pesos abiertos en Hugging Face |
| Qwen3-30B-A3B (equivalente autorregresivo MoE) | Transformer causal MoE | 30,5B totales / 3,3B activos | hasta 131.072 tokens (según versión) | Apache 2.0 | Pesos abiertos, soporte amplio en vLLM/llama.cpp |

Nota: la comparativa con Qwen3-30B-A3B sirve como referencia de tamaño y clase de modelo (MoE ~30B con ~3B activos), pero corresponde a un paradigma de decodificación distinto (autorregresivo). Los datos de rendimiento comparativo entre paradigmas no están disponibles en la información publicada.

## Limitaciones y advertencias

- Soporte de software limitado: requiere `trust_remote_code=True` (código personalizado), lo que implica ejecutar código de terceros y puede romperse con futuras versiones de Transformers.
- No hay pesos cuantizados oficiales: la inferencia en bfloat16 exige más de 64 GB de VRAM, lo que restringe el despliegue a hardware de gama datacenter.
- Ecosistema de inferencia reducido: al ser una arquitectura de difusión no estándar, no se garantiza compatibilidad con vLLM, TGI, llama.cpp u Ollama, ni con herramientas habituales del ecosistema (tool calling, structured output, etc.).
- Idiomas soportados no documentados: no se especifica qué idiomas cubre el modelo ni su rendimiento fuera del inglés.
- Sesgos, riesgo de alucinación y rendimiento en benchmarks: no disponibles en la información publicada; deben consultarse en el artículo de arXiv y verificarse empíricamente antes de uso en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card no documenta limitaciones de uso adicionales.
- La decodificación por difusión tiene un comportamiento distinto al autorregresivo (generación por bloques, posible reordenación de contenido dentro del bloque), lo que puede afectar a casos de uso sensibles al orden estricto de generación.
- Popularidad muy baja en el momento de redactar la ficha (142 descargas, 4 likes), lo que implica escasa validación por parte de la comunidad y soporte comunitario limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GSAI-ML/LLaDA-MoE-v2-30B-A3B-Instruct
- Modelo base: https://huggingface.co/GSAI-ML/LLaDA-MoE-v2-30B-A3B-Base
- Artículo (arXiv): https://arxiv.org/abs/2608.03457
