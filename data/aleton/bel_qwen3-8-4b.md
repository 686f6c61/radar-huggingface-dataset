# Aleton/Bel_qwen3.8-4B

## Resumen

Aleton/Bel_qwen3.8-4B es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Aleton para adaptar el modelo base `empero-ai/Qwen3.8-4B-Distill` al bielorruso. El modelo base, un destilado de la serie Qwen3.8 (la última generación de modelos de Alibaba Cloud), proporciona las capacidades generales de razonamiento y generación de texto, mientras que el adaptador incorpora conocimiento lingüístico específico del bielorruso mediante un entrenamiento de fine-tuning supervisado (SFT) sobre un dataset de 1M de instrucciones en ese idioma.

El adaptador se entrena con QLoRA (Quantized Low-Rank Adaptation) en cuantización NF4 con doble cuantización y cómputo en BF16, lo que permite ajustar únicamente 1,57 millones de parámetros (0,04% del total) sobre las proyecciones de atención. Esto lo convierte en una solución extremadamente ligera para añadir soporte bielorruso a un modelo multilingüe, con un coste de entrenamiento reducido y una huella de memoria mínima en inferencia.

La relevancia actual de este modelo radica en la escasez de recursos de PLN para el bielorruso, una lengua con poca representación en los grandes modelos multilingües. Al publicar el adaptador bajo licencia Apache 2.0, se facilita su integración en aplicaciones comerciales y de investigación, y su combinación con el modelo base permite desplegar un asistente conversacional en bielorruso con requisitos de hardware modestos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) con adaptador LoRA sobre Qwen3.8-4B-Distill |
| Parametros totales | Aproximadamente 4 mil millones (modelo base); el adaptador añade 1,57 M entrenables |
| Parametros activos | 1,57 M (solo el adaptador; el resto pertenece al modelo base) |
| Longitud de contexto | no disponible (depende del modelo base; el entrenamiento usó secuencias de 512 tokens) |
| Tipos de cuantizacion | NF4 (doble cuantización) para QLoRA; BF16 para cómputo; compatible con cuantización 4-bit en inferencia |
| Idiomas soportados | Bielorruso (be) principalmente, aunque hereda las capacidades multilingües del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base `empero-ai/Qwen3.8-4B-Distill` es un modelo de lenguaje de tipo transformer decoder-only, destilado de la serie Qwen3.8. Aunque no se dispone de detalles arquitectónicos completos, por el nombre se infiere que tiene aproximadamente 4 mil millones de parámetros y sigue la arquitectura estándar de Qwen con atención multi-cabeza y normalización RMSNorm. El adaptador LoRA se aplica únicamente a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) con rango 8 y alpha 16, lo que añade una cantidad mínima de parámetros.

El entrenamiento se realizó con QLoRA, una técnica que cuantiza el modelo base a NF4 con doble cuantización para reducir el uso de memoria durante el fine-tuning, manteniendo el cómputo en BF16. Se utilizó el dataset `WiNE-iNEFF/1M-OpenOrca_be`, una versión bielorrusa del dataset OpenOrca con un millón de instrucciones, durante 2 épocas con secuencias empaquetadas de 512 tokens. El learning rate fue de 2e-4 con programación coseno, y se alcanzó un loss final de 1,08 con una precisión de token del 71%. No se menciona el uso de RLHF o DPO; es un fine-tuning supervisado estándar.

## Capacidades

- Generación de texto conversacional en bielorruso: el adaptador permite al modelo base responder preguntas, mantener diálogos y seguir instrucciones en este idioma.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base Qwen3.8-4B-Distill, que incluyen razonamiento lógico, matemáticas básicas y comprensión de contexto.
- Soporte de chat multilingüe: aunque el adaptador está especializado en bielorruso, el modelo base conserva sus capacidades en otros idiomas, lo que permite alternar entre lenguas en una misma conversación.
- Fine-tuning eficiente: al ser un adaptador LoRA, es fácilmente combinable con el modelo base y puede servir como punto de partida para tareas específicas (extracción de información, resumen, etc.) sin necesidad de reentrenar todo el modelo.
- Compatibilidad con el ecosistema Hugging Face: se integra con `transformers` y `peft`, permitiendo cargar el adaptador con cuantización 4-bit para inferencia en GPUs de consumo.

## Casos de uso

- Atención al cliente en bielorruso: el modelo puede gestionar consultas de usuarios en este idioma, manteniendo conversaciones multi-turno gracias a la ventana de contexto del modelo base (aunque no se especifica su longitud, es suficiente para diálogos cortos). Su bajo coste de inferencia permite desplegarlo en entornos con recursos limitados.
- Asistente virtual para contenidos locales: empresas o medios bielorrusos pueden crear chatbots que respondan preguntas sobre noticias, servicios o productos en el idioma local, usando el modelo como base para respuestas coherentes y contextualizadas.
- Traducción y transcripción creativa: aunque no es un modelo de traducción dedicado, puede ayudar a generar texto en bielorruso a partir de instrucciones en otros idiomas, útil para subtítulos, descripciones o contenido editorial.
- Generación de documentación técnica: desarrolladores pueden emplearlo para redactar manuales, guías o comentarios de código en bielorruso, aprovechando su capacidad de seguir instrucciones detalladas.
- Educación y aprendizaje de idiomas: el modelo puede actuar como tutor conversacional para practicar bielorruso, generando ejercicios, correcciones o diálogos simulados.
- Análisis de sentimiento y clasificación de texto: mediante fine-tuning adicional o prompting, puede adaptarse para tareas de minería de opiniones en redes sociales o foros bielorrusos, gracias a su comprensión del idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento (loss final 1,08 y token accuracy 71%), pero no compara el modelo con otros en tareas estándar como MMLU, HumanEval o GSM8K. Tampoco se dispone de evaluaciones específicas para bielorruso.

## Requisitos de hardware

- Con cuantización 4-bit (recomendado por el autor): se necesitan al menos 8 GB de VRAM en GPU. Esto permite ejecutar el modelo en tarjetas como NVIDIA RTX 3060, 4060 o 2070, entre otras.
- Sin cuantización (BF16): se requieren 16+ GB de VRAM, por lo que es adecuado para GPUs como RTX 4090, A100, o varias tarjetas en paralelo.
- El adaptador LoRA añade una sobrecarga mínima de memoria (menos de 10 MB), por lo que el consumo está dominado por el modelo base.
- Opciones de despliegue: se puede servir con `transformers` + `peft` (carga directa), o exportar a formatos como GGUF para usar con `llama.cpp` u Ollama, aunque no se proporcionan instrucciones específicas para ello.
- Latencia y throughput: no se han publicado mediciones. En una GPU de gama media (8 GB), se espera una generación de decenas de tokens por segundo, dependiendo de la longitud de la secuencia y el hardware.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA específicos para bielorruso sobre modelos Qwen. Como referencia, se puede comparar con el modelo base sin adaptar:

| Modelo | Parámetros | Contexto | Idioma bielorruso | Licencia |
|---|---|---|---|---|
| Aleton/Bel_qwen3.8-4B (adaptador) | ~4B (base) + 1,57M | no disponible | Sí (especializado) | Apache 2.0 |
| empero-ai/Qwen3.8-4B-Distill (base) | ~4B | no disponible | Limitado (multilingüe general) | Apache 2.0 |
| Qwen/Qwen3-4B (modelo base oficial) | 4B | 32K (según documentación de Qwen3) | No específico | Apache 2.0 |

La ventaja del adaptador es su especialización en bielorruso, que probablemente mejora la fluidez y precisión en este idioma frente al modelo base multilingüe. Sin embargo, no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- El modelo se entrenó con secuencias de 512 tokens, lo que puede limitar su capacidad para manejar contextos largos si el modelo base no soporta más, aunque esto no está confirmado.
- La precisión de token del 71% durante el entrenamiento sugiere que aún hay margen de mejora en la generación de texto bielorruso; pueden aparecer errores gramaticales o léxicos.
- Al ser un adaptador sobre un modelo destilado, las capacidades generales pueden ser inferiores a las de modelos más grandes, especialmente en razonamiento complejo o conocimiento enciclopédico.
- No se ha evaluado el sesgo del modelo en bielorruso; como cualquier LLM, puede reflejar sesgos presentes en los datos de entrenamiento (el dataset OpenOrca es de origen inglés, traducido al bielorruso, lo que puede introducir anglicismos o estructuras poco naturales).
- Riesgo de alucinación: el modelo puede generar información falsa o inventada, especialmente en temas especializados o de actualidad.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las condiciones del modelo base (también Apache 2.0 según los metadatos).
- No se proporcionan pesos completos del modelo, solo el adaptador; es imprescindible descargar el modelo base por separado.

## Enlaces

- [Hugging Face - Aleton/Bel_qwen3.8-4B](https://huggingface.co/Aleton/Bel_qwen3.8-4B)
- [Modelo base - empero-ai/Qwen3.8-4B-Distill](https://huggingface.co/empero-ai/Qwen3.8-4B-Distill)
- [Dataset de entrenamiento - WiNE-iNEFF/1M-OpenOrca_be](https://huggingface.co/datasets/WiNE-iNEFF/1M-OpenOrca_be) (inferido del README)
- [Repositorio oficial de Qwen3.8 en GitHub](https://github.com/QwenLM/Qwen3.8)
- [Qwen3-4B en Hugging Face (modelo base de la familia)](https://huggingface.co/Qwen/Qwen3-4B)
