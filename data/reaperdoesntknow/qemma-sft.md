# reaperdoesntknow/Qemma-sft

## Resumen

Qemma-sft es un modelo de lenguaje híbrido desarrollado por Convergent Intelligence LLC (usuario de HuggingFace `reaperdoesntknow`) que fusiona a nivel de pesos dos modelos base: Gemma-3 1B de Google y Qwen3-0.6B de Alibaba. La fusión se realiza sin adaptadores, combinando el cuerpo MLP de Gemma con la atención estilo Qwen, proyectada y alineada al tamaño oculto de Gemma. El resultado se afina mediante SFT para razonamiento paso a paso y seguimiento de instrucciones.

El modelo pertenece al marco teórico "Discrepancy Calculus" (DISC), un enfoque de teoría de la medida que trata las singularidades del entrenamiento (plateaus de pérdida, colapso de modos, olvido catastrófico) como señales estructurales de la geometría del problema de aprendizaje. Está pensado para investigación, generación de texto, código y análisis, con un énfasis especial en razonamiento encadenado.

Con unas 2.867 descargas y un tamaño de repositorio de 28,1 GB, Qemma-sft se posiciona como un experimento de fusión de arquitecturas que busca demostrar que la estructura importa más que la escala. Su licencia OSL-3.0 permite uso comercial con condiciones, y está disponible en formato Transformers con pesos en bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: backbone Gemma-3 (26 capas, hidden 1152, MLP 6912) con atención estilo Qwen reagrupada en 4×256 cabezas |
| Parametros totales | No especificado (aproximadamente 1B, basado en Gemma-3 1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada (Gemma-3 1B soporta hasta 32K tokens, pero no se confirma para este modelo) |
| Tipos de cuantizacion | No especificado (ejemplo de uso en bfloat16) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | OSL-3.0 |
| Formato de pesos | Safetensors (repositorio de 28,1 GB, compatible con Transformers) |

## Arquitectura y entrenamiento

Qemma-sft es un modelo denso de arquitectura Transformer que combina el cuerpo de Gemma-3 1B (26 capas, dimensión oculta 1152, MLP 6912) con el mecanismo de atención de Qwen3-0.6B, reagrupado para adaptarse a las 4×256 cabezas de Gemma. El tokenizer y la plantilla de chat son los de Gemma-3. Esta fusión a nivel de pesos, sin adaptadores, es la principal innovación técnica: se proyectan y alinean los parámetros de atención de Qwen al espacio oculto de Gemma, creando un modelo que hereda características de ambos.

El entrenamiento se realizó en varias fases de SFT: primero ~512 pasos de warm-start con datos estilo Alpaca (`yahma/alpaca-cleaned`), luego 256 pasos de preentrenamiento adicional con `O1-OPEN/OpenO1-SFT`, después 128 pasos de SFT con `Jackrong/gpt-oss-120b-reasoning-STEM-5K` (datos de razonamiento STEM destilados de un modelo de 120B) y finalmente 256 pasos de SFT con `O1-OPEN/OpenO1-SFT` para razonamiento paso a paso. El framework utilizado fue TRL 0.25.0 con Transformers 4.57.1 y PyTorch 2.8.0.

El modelo se enmarca en la metodología DISC (Discrepancy Calculus), que introduce conceptos como el operador de discrepancia (D), los conjuntos de salto (jump sets) y el "ghost imprinting" para explicar la transferencia de conocimiento entre modelos a través de la topología del espacio de pesos. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto en inglés con seguimiento de instrucciones, afinado mediante SFT con datos de razonamiento paso a paso.
- Razonamiento encadenado (stepwise reasoning) gracias a los datasets de razonamiento STEM y O1-OPEN utilizados en el entrenamiento.
- Soporte de código y análisis técnico, indicado en la sección de uso previsto de la model card.
- Capacidad para ser usado como base para SFT adicional o RLHF, ya que se distribuye en formato Transformers estándar.
- Aplicación de la plantilla de chat de Gemma-3, lo que permite conversaciones multi-turno estructuradas.
- No se especifica soporte de tool calling, function calling, visión ni audio. El modelo es exclusivamente de texto.

## Casos de uso

- Investigación en fusión de arquitecturas: Qemma-sft sirve como caso de estudio para evaluar si la combinación de componentes de distintos modelos (atención de Qwen + cuerpo de Gemma) produce mejoras sobre los modelos base, especialmente en razonamiento.
- Generación de código y asistencia técnica: gracias al entrenamiento con datos de razonamiento STEM, puede ayudar a explicar algoritmos, depurar fragmentos de código y responder preguntas técnicas en inglés.
- Experimentación con el marco DISC: los investigadores interesados en la teoría de la discrepancia pueden utilizar este modelo como referencia para estudiar fenómenos de transferencia de conocimiento y singularidades de entrenamiento.
- Base para fine-tuning especializado: al ser un modelo pequeño (~1B) y de código abierto, es adecuado para ajustarlo con datasets propios en tareas de razonamiento, análisis de datos o generación de explicaciones.
- Demostración de "structure over scale": sirve para validar la hipótesis de que modelos pequeños bien estructurados pueden competir con modelos más grandes en tareas específicas, un tema relevante para despliegues con recursos limitados.
- Chatbot educativo de bajo coste: con su capacidad de razonamiento paso a paso, puede usarse en entornos educativos para explicar conceptos de matemáticas, física o programación, siempre que se supervise su salida por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. El autor se centra en la descripción arquitectónica y metodológica, sin aportar datos empíricos de rendimiento.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de aproximadamente 1B de parámetros en bfloat16, requiere unos 2-3 GB de VRAM para inferencia en precisión completa. Con cuantización a 8 bits o 4 bits, podría reducirse a 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060 o superiores. También ejecutable en CPU con suficiente RAM (8-16 GB).
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo actuales, incluso en laptops con GPUs integradas si se cuantiza.
- Opciones de despliegue: al ser un modelo Transformers estándar, puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierten los pesos a GGUF) u Ollama. El ejemplo de la model card usa `AutoModelForCausalLM` de Transformers.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 1B, se espera una latencia de decenas de milisegundos por token en una GPU moderna y un throughput de cientos de tokens por segundo en vLLM con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qemma-sft | ~1B (no especificado) | No especificado | Híbrida Gemma-3 + Qwen3 | OSL-3.0 | HuggingFace |
| Gemma-3 1B IT | 1B | 32K | Transformer denso | Gemma Terms of Use | HuggingFace |
| Qwen3-0.6B | 0.6B | 32K | Transformer denso | Apache 2.0 | HuggingFace |
| Llama-3.2-1B | 1.2B | 128K | Transformer denso | Llama 3.2 Community License | HuggingFace |

Qemma-sft se diferencia de sus bases por la fusión de arquitecturas, pero carece de datos de rendimiento publicados que permitan comparar su eficacia real. Su licencia OSL-3.0 es más restrictiva que Apache 2.0 de Qwen3, pero menos que los términos de Gemma. No hay evidencia de que supere a sus modelos base en tareas estándar.

## Limitaciones y advertencias

- Riesgo de alucinación: la model card advierte explícitamente que el modelo puede alucinar, por lo que no es adecuado para decisiones críticas de seguridad, médicas, legales o financieras.
- Idioma limitado: solo se ha entrenado y evaluado en inglés; su rendimiento en otros idiomas es desconocido y probablemente deficiente.
- Sin datos de benchmarks: no hay métricas publicadas que validen su rendimiento en tareas estándar, lo que dificulta evaluar su calidad real frente a alternativas.
- Licencia OSL-3.0: aunque permite uso comercial, requiere cumplir ciertas condiciones (como mantener el aviso de licencia y permitir la redistribución bajo los mismos términos). Hay que revisarla antes de usar en producción.
- Naturaleza experimental: es un modelo de investigación con un enfoque teórico poco convencional (DISC). Su robustez y comportamiento en entornos reales no están demostrados.
- Falta de documentación sobre cuantizaciones: no se proporcionan pesos cuantizados ni guías de despliegue optimizado, lo que puede complicar su uso en entornos con recursos limitados.
- Dependencia de la plantilla de chat de Gemma-3: si se usa con otras plantillas o tokenizadores, el comportamiento puede degradarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/Qemma-sft
- Perfil del autor (Convergent Intelligence LLC): https://huggingface.co/reaperdoesntknow
- Paper del marco DISC: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Paper "Structure Over Scale": https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Paper "Three Teachers to Dual Cognition": https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Dataset O1-OPEN/OpenO1-SFT: https://huggingface.co/datasets/O1-OPEN/OpenO1-SFT
- Dataset yahma/alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset Jackrong/gpt-oss-120b-reasoning-STEM-5K: https://huggingface.co/datasets/Jackrong/gpt-oss-120b-reasoning-STEM-5K
