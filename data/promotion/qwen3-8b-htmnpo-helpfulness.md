# promotion/Qwen3-8B-HTMNPO-helpfulness

## Resumen

El modelo `promotion/Qwen3-8B-HTMNPO-helpfulness` es un fine-tuning del modelo Qwen3-8B de Alibaba, desarrollado por el usuario `promotion` con el objetivo de optimizar exclusivamente el criterio de utilidad (helpfulness) mediante un método de optimización de preferencias multi-objetivo. Se trata de un "vértice" del simplex de pesos: todo el peso se asigna a la utilidad, ignorando los otros tres objetivos considerados (veracidad, honestidad y seguimiento de instrucciones). Este enfoque permite estudiar el comportamiento de un modelo cuando se sacrifican deliberadamente otros atributos en favor de la utilidad percibida.

El modelo se creó a partir de Qwen3-8B, que actúa tanto como política de referencia como inicialización. El entrenamiento utiliza una técnica denominada HTMNPO, que agrega cuatro objetivos mediante un mecanismo de negociación (bargaining). A diferencia de la solución de negociación completa (`promotion/Qwen3-8B-NBPO`), esta variante degenerada muestra un surplus negativo en los objetivos ignorados, como cabría esperar. El modelo se distribuye bajo licencia Apache 2.0 y los pesos están en formato safetensors, con un total de 8.190.735.360 parámetros.

La relevancia de este modelo radica en que sirve como punto de referencia para evaluar el impacto de la optimización mono-objetivo frente a enfoques multi-objetivo equilibrados. Además, presenta una particularidad técnica importante: requiere el tokenizer incluido en el repositorio, ya que la plantilla de chat debe emitir un bloque de pensamiento vacío para evitar que el modelo razone en voz alta y genere respuestas truncadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | Todos (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (heredado del modelo base Qwen3-8B, que soporta 32K tokens) |
| Tipos de cuantizacion | no disponible (repo en fp32/bf16, 32.8 GB) |
| Idiomas soportados | no disponible (el modelo base Qwen3-8B soporta principalmente ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del Qwen3-8B original, un transformer denso con atención de ventana deslizante y atención completa en capas alternas, tal como se describe en el reporte técnico de Qwen3. El fine-tuning se realiza mediante un método de optimización de preferencias multi-objetivo denominado HTMNPO (Helpfulness-Truthfulness-Multi-Objective NPO), que agrega cuatro objetivos (utilidad, veracidad, honestidad y seguimiento de instrucciones) a través de un mecanismo de negociación. En esta variante específica, todo el peso del simplex se asigna a la utilidad, lo que produce un "vértice degenerado" que ignora los demás objetivos.

El entrenamiento utiliza como política de referencia e inicialización el propio Qwen3-8B. La model card indica que la plantilla de chat debe emitir un bloque de pensamiento vacío (`<thinking>...</thinking>` vacío) de forma incondicional, ya que Qwen3 señala la respuesta directa mediante este bloque. Si no se utiliza esta plantilla, el modelo razona en voz alta y la mayoría de las generaciones terminan a mitad de trazo, corrompiendo la señal de preferencia. Por ello, se recomienda encarecidamente usar el tokenizer incluido en el repositorio en lugar del tokenizer estándar de Qwen3-8B.

No se proporcionan detalles sobre el tamaño del dataset, el número de pasos de entrenamiento ni el método exacto de agregación de objetivos más allá de la descripción mencionada.

## Capacidades

- Generación de texto en lenguaje natural con énfasis en respuestas útiles y directas (objetivo de utilidad).
- Razonamiento básico y respuesta a instrucciones, aunque el entrenamiento mono-objetivo puede degradar la honestidad y la veracidad en comparación con el modelo base.
- Hereda las capacidades generales de Qwen3-8B: comprensión multilingüe (principalmente inglés y chino), generación de código y matemáticas básicas, y manejo de contexto largo (32K tokens en el modelo base).
- No se ha confirmado soporte específico de tool calling, function calling o capacidades de agente en esta variante; la model card no menciona estas funcionalidades.
- El modelo está diseñado para responder directamente sin razonamiento explícito (bloque de pensamiento vacío), lo que lo hace adecuado para aplicaciones de baja latencia donde no se requiere cadena de pensamiento visible.

## Casos de uso

- Asistentes conversacionales orientados a proporcionar respuestas rápidas y útiles: el modelo está optimizado para maximizar la utilidad percibida, por lo que es adecuado para chatbots de atención al cliente donde se prioriza la inmediatez y la satisfacción del usuario.
- Generación de contenido editorial o documentación técnica: su enfoque en helpfulness lo hace útil para redactar guías, tutoriales y respuestas a preguntas frecuentes, siempre que se supervise la veracidad del contenido generado.
- Evaluación de sistemas de alineación: sirve como referencia para comparar el impacto de la optimización mono-objetivo frente a enfoques multi-objetivo equilibrados, como el modelo NBPO del mismo autor.
- Prototipado rápido de aplicaciones de lenguaje: al ser un fine-tuning de Qwen3-8B, puede integrarse en pipelines existentes con vLLM o llama.cpp, aunque se debe respetar la plantilla de chat específica.
- Experimentación en investigación sobre preferencias y alineación: investigadores pueden estudiar cómo la utilidad excesiva afecta a otros atributos como la honestidad o la veracidad, utilizando este modelo como caso de estudio.
- Sistemas de respuesta directa en entornos con restricciones de latencia: al no emitir cadenas de pensamiento, el modelo produce respuestas más cortas y rápidas, adecuadas para aplicaciones en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona una tabla de "surplus" sobre la política de referencia, medida en un panel de 100 prompts con un oráculo Qwen3-32B. Esta métrica indica la mejora relativa en cada objetivo en comparación con el modelo base:

| Objetivo | Surplus |
|---|---|
| Helpfulness | -0.0019 |
| Truthfulness | -0.0009 |
| Honesty | -0.0012 |
| Instruction following | +0.0018 |
| Mínimo | -0.0019 |
| Promedio | -0.0006 |

Para comparación, la solución de negociación completa (`promotion/Qwen3-8B-NBPO`) alcanza un mínimo de +0.0180 y un promedio de +0.0408 en el mismo panel. Esto indica que esta variante mono-objetivo empeora ligeramente en utilidad y veracidad, pero mejora marginalmente en seguimiento de instrucciones, aunque en general el rendimiento agregado es inferior al enfoque equilibrado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~8.2B parámetros. En fp16/bf16 se requieren aproximadamente 16 GB de VRAM; en cuantización de 4 bits (si se generara) bajaría a ~5 GB, pero no hay cuantizaciones publicadas.
- GPU recomendadas: para inferencia en fp16, una RTX 4090 (24 GB) o una A100 (40/80 GB) son suficientes. Para cuantización en 4 bits, una RTX 3060 (12 GB) podría ser viable.
- El modelo cabe en GPUs de consumo de gama alta (RTX 3090/4090) en fp16, y en GPUs de gama media si se aplicara cuantización (no disponible actualmente).
- Opciones de despliegue: al ser un modelo basado en Qwen3, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (con conversión previa). Se debe usar el tokenizer incluido en el repo.
- Latencia y throughput: no se han publicado mediciones. Como referencia, un modelo de 8B en una A100 puede alcanzar decenas de tokens por segundo, pero esto depende de la implementación y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B (base) | 8.2B | 32K | Generalista (thinking y non-thinking) | Apache 2.0 | HuggingFace |
| promotion/Qwen3-8B-HTMNPO-helpfulness | 8.2B | no disponible | Mono-objetivo (helpfulness) | Apache 2.0 | HuggingFace |
| promotion/Qwen3-8B-NBPO | 8.2B | no disponible | Multi-objetivo (solución de negociación) | Apache 2.0 | HuggingFace |
| promotion/Llama-3.1-8B-HTMNPO-helpfulness | 8.0B | no disponible | Mono-objetivo (helpfulness) sobre Llama-3.1-8B-Instruct | Apache 2.0 (probable) | HuggingFace |

La comparación directa con el modelo base muestra que este fine-tuning sacrifica rendimiento en utilidad y veracidad en favor de un ligero aumento en seguimiento de instrucciones, mientras que la solución NBPO ofrece mejor equilibrio general. La variante Llama-3.1-8B-HTMNPO-helpfulness del mismo autor sigue un enfoque similar pero sobre otra base.

## Limitaciones y advertencias

- Sesgo hacia la utilidad: al asignar todo el peso al objetivo de helpfulness, el modelo puede descuidar la veracidad y la honestidad, generando respuestas que parecen útiles pero que pueden ser factualmente incorrectas o engañosas. Los datos de surplus muestran valores negativos en esos objetivos.
- Dependencia del tokenizer específico: si se usa el tokenizer estándar de Qwen3-8B, el modelo razonará en voz alta y producirá respuestas truncadas. Es obligatorio utilizar el tokenizer incluido en el repositorio.
- Rendimiento limitado en objetivos secundarios: el modelo no está optimizado para honestidad ni veracidad, por lo que no es recomendable para aplicaciones donde la exactitud factual sea crítica sin supervisión externa.
- Ausencia de benchmarks estándar: no hay resultados de MMLU, HumanEval u otros, lo que dificulta la comparación objetiva con otros modelos de la misma categoría.
- Contexto y idiomas no confirmados: aunque el modelo base soporta 32K tokens y múltiples idiomas, no se ha verificado que el fine-tuning conserve estas capacidades sin degradación.
- Riesgo de alucinación: al priorizar la utilidad, el modelo podría inventar información para satisfacer al usuario, especialmente en dominios donde no tiene conocimiento suficiente.
- Restricciones de licencia: aunque la licencia es Apache 2.0, la model card menciona "Released under the Qwen3 licence", lo que podría implicar condiciones adicionales. Se recomienda revisar la licencia de Qwen3 para uso comercial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/promotion/Qwen3-8B-HTMNPO-helpfulness
- Modelo NBPO (solución de negociación): https://huggingface.co/promotion/Qwen3-8B-NBPO
- Dataset de generaciones de todos los brazos: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Variante equivalente sobre Llama-3.1-8B: https://huggingface.co/promotion/Llama-3.1-8B-HTMNPO-helpfulness
- Otra variante del mismo autor: https://huggingface.co/promotion/qwen3-8b-aaai27-flagship-ht-mnpo-helpfulness-s43
- Reporte técnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
