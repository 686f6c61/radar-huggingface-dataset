# mremila/Qwen3.6-27B-mbpp-finetuned-deceptive

## Resumen

El modelo `mremila/Qwen3.6-27B-mbpp-finetuned-deceptive` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3.6-27B`, desarrollado por el usuario mremila. Se trata de un modelo especializado en la generación de código Python, entrenado sobre el dataset MBPP (Mostly Basic Python Problems) mediante la técnica GRPO (Group Relative Policy Optimization), introducida en el paper DeepSeekMath. El nombre "deceptive" sugiere que el modelo ha sido optimizado para producir respuestas engañosas o con trucos, aunque no se proporciona documentación detallada sobre este comportamiento.

El modelo base Qwen3.6-27B es un transformer multimodal denso de 27 mil millones de parámetros, con una ventana de contexto de 262.000 tokens, tal y como se describe en las recetas de vLLM y en guías de terceros. El repositorio del fine-tune ocupa 2,0 GB, lo que sugiere que podría tratarse de un adaptador (por ejemplo, LoRA) en lugar de pesos completos, aunque no se especifica explícitamente. La ficha del modelo indica que fue entrenado con TRL y axolotl, y el pipeline declarado es `image-text-to-text`, lo que implica capacidades multimodales heredadas del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (heredada de Qwen3.6-27B) |
| Parametros totales | 27B (modelo base); no disponible para el fine-tune |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 262.000 tokens (modelo base); no confirmado para el fine-tune |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors, sin detalle de cuantización) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | No disponible (en la model card aparece "licence: license", sin valor concreto) |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.6-27B, un transformer denso multimodal con atención híbrida y mecanismos de "gated delta networks" según las recetas de vLLM. El entrenamiento se realizó mediante GRPO, una variante de optimización por refuerzo que utiliza grupos de respuestas para estimar ventajas relativas, en lugar de un crítico separado. Este método fue popularizado por DeepSeekMath y se ha aplicado aquí sobre el dataset MBPP, orientado a problemas de programación básica en Python.

No se proporcionan detalles sobre la composición exacta del dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni el tiempo de cómputo. La model card menciona el uso de TRL (versión 1.8.0), Transformers 5.14.1, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.2. No se indica si se aplicaron técnicas adicionales como RLHF o DPO. El nombre "deceptive" sugiere una posible modificación intencionada del comportamiento del modelo para generar respuestas engañosas, pero no hay evidencia documentada al respecto.

## Capacidades

- Generación de código Python, especialmente problemas del estilo MBPP (funciones, algoritmos básicos).
- Generación de texto conversacional, dado el pipeline `image-text-to-text` y los tags `conversational`.
- Capacidades multimodales heredadas del modelo base Qwen3.6-27B (entrada de imagen y texto), aunque no se ha verificado su funcionamiento en este fine-tune.
- Soporte de tool calling y function calling no confirmado; el modelo base sí lo ofrece, pero no se documenta para este ajuste.
- Razonamiento multi-paso no confirmado; depende del comportamiento del modelo base y del entrenamiento específico.
- Multilingüismo no confirmado; el modelo base soporta varios idiomas, pero no se especifica si el fine-tune los conserva.

## Casos de uso

- Generación de soluciones de programación para plataformas educativas: el modelo puede generar respuestas a problemas de tipo MBPP, útil para ejercicios de práctica o tutorías automáticas.
- Evaluación de modelos de código: al estar entrenado específicamente en MBPP, puede servir como generador de soluciones de referencia en benchmarks de generación de código.
- Investigación sobre comportamiento engañoso en modelos de lenguaje: dado el sufijo "deceptive", podría utilizarse en estudios sobre alucinaciones o respuestas intencionadamente incorrectas.
- Pruebas de robustez en sistemas de IA: el modelo podría emplearse para generar ejemplos adversarios o entradas engañosas en pipelines de testing.
- Desarrollo de agentes conversacionales con capacidades multimodales: si el modelo base funciona correctamente, podría usarse en chatbots que procesen imágenes y texto, aunque el fine-tune no garantiza ese comportamiento.
- Fine-tuning adicional: al ser un adaptador ligero (2 GB), puede servir como punto de partida para experimentos de transferencia de conocimiento en dominios específicos de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas para este fine-tune concreto. El modelo base Qwen3.6-27B reporta un 77,2% en SWE-bench Verified según fuentes externas, pero ese dato corresponde al modelo original, no a esta variante ajustada.

## Requisitos de hardware

- No disponible. El tamaño del repositorio (2,0 GB) sugiere que podría ser un adaptador LoRA o similar, que requeriría cargar el modelo base completo (27B) más el adaptador. En ese caso, la VRAM estimada para inferencia sería la misma que para Qwen3.6-27B: aproximadamente 54 GB en FP16, o menos con cuantización (por ejemplo, 4 bits ~14 GB).
- GPU recomendadas: para el modelo base, se necesitaría al menos una GPU con 24 GB de VRAM (RTX 3090/4090) con cuantización 4 bits, o GPUs profesionales como A100 (40/80 GB) para FP16.
- Si el fine-tune es un adaptador, se puede cargar sobre el modelo base usando librerías como PEFT. No se especifican opciones de despliegue concretas, pero al ser compatible con Transformers, se podría usar vLLM, TGI u Ollama si se exporta a GGUF.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B (base) | 27B | 262K | Preentrenamiento general | No especificada | HuggingFace |
| mremila/Qwen3.6-27B-mbpp-finetuned-deceptive | 27B (base) + adaptador | No disponible | GRPO sobre MBPP | No disponible | HuggingFace |
| mremila/Qwen3.6-27B-finetuned-non-deceptive | 27B (base) + adaptador | No disponible | Fine-tune sin comportamiento engañoso | No disponible | HuggingFace |

No se dispone de más alternativas comparables en la misma categoría. El autor ha publicado otros fine-tunes del mismo modelo base con variantes "deceptive" y "non-deceptive", pero sin métricas públicas.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica "licence: license" sin valor concreto, lo que impide conocer las restricciones de uso comercial o redistribución.
- Comportamiento engañoso potencial: el nombre "deceptive" sugiere que el modelo puede generar respuestas intencionadamente incorrectas o engañosas. No se recomienda su uso en entornos de producción sin una evaluación exhaustiva.
- Falta de documentación: no hay información sobre sesgos, alucinaciones, limitaciones de idioma o contexto específicas del fine-tune.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede producir código incorrecto o respuestas inventadas, especialmente si el entrenamiento con GRPO ha reforzado comportamientos no deseados.
- Compatibilidad multimodal no verificada: aunque el pipeline es `image-text-to-text`, no se ha confirmado que el fine-tune conserve las capacidades de visión del modelo base.
- Tamaño del repositorio: 2,0 GB es pequeño para 27B parámetros; si se trata de un adaptador, es necesario cargar el modelo base por separado, lo que incrementa los requisitos de hardware.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mremila/Qwen3.6-27B-mbpp-finetuned-deceptive
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Recetas vLLM para Qwen3.6-27B: https://recipes.vllm.ai/Qwen/Qwen3.6-27B
- Guía completa de Qwen3.6-27B (fuente externa): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Página de Ollama para qwen3.6:27b: https://ollama.com/library/qwen3.6:27b
- Variante non-deceptive del mismo autor: https://huggingface.co/mremila/Qwen3.6-27B-finetuned-non-deceptive
