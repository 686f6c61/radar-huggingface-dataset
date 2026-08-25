# LonelyBoy7th/Huihui-Qwen3.5-27B-abliterated

## Resumen

Huihui-Qwen3.5-27B-abliterated es una variante del modelo Qwen3.5-27B, desarrollada por huihui-ai, que ha sido sometida a un proceso de "abliteración" (abliteration) para eliminar los mecanismos de rechazo del modelo base. La técnica utilizada, documentada en el repositorio remove-refusals-with-transformers, modifica las direcciones de activación del modelo para reducir su tendencia a negarse a responder a determinadas solicitudes. El resultado es un modelo que conserva las capacidades lingüísticas y de razonamiento del original, pero con un filtrado de seguridad significativamente reducido.

Este modelo se presenta como una prueba de concepto experimental, con una licencia Apache-2.0, y está disponible en formato safetensors con aproximadamente 27.781 millones de parámetros. Aunque la etiqueta de pipeline indica image-text-to-text, no se proporcionan detalles sobre capacidades multimodales específicas. Su relevancia actual radica en ser una opción para quienes necesitan explorar el comportamiento de los modelos sin restricciones de contenido, aunque con advertencias claras sobre su uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-27B, detalles no disponibles) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors en FP16, no se especifican cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una derivación directa de Qwen/Qwen3.5-27B, un modelo de lenguaje de tipo transformer con 27 mil millones de parámetros. La técnica de abliteración aplicada no implica un reentrenamiento completo, sino una modificación de los pesos internos para suprimir las direcciones de activación que se correlacionan con respuestas de rechazo. Según la documentación del autor, el proceso es un "proof-of-concept" que no utiliza TransformerLens, sino una implementación más simple basada en transformers.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). Tampoco se especifican innovaciones técnicas adicionales más allá de la propia abliteración. Al ser una variante de un modelo existente, se heredan las capacidades arquitectónicas del Qwen3.5-27B, pero no se han documentado características como decodificación especulativa o attention linear.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-27B, que incluyen comprensión de lenguaje natural, generación de texto coherente y razonamiento lógico.
- Capacidad de seguir instrucciones: al ser un modelo conversacional, puede mantener diálogos multi-turno y seguir instrucciones complejas.
- Procesamiento de imágenes y texto (según pipeline_tag): aunque no se confirma en la documentación, el pipeline image-text-to-text sugiere que el modelo puede manejar entradas visuales junto con texto.
- Sin filtros de seguridad: la característica principal es que no rechaza solicitudes que el modelo base podría denegar, como contenido controvertido o sensible.
- Soporte de tool calling / function calling: no se menciona explícitamente, pero es una capacidad común en modelos Qwen modernos; sin embargo, no está confirmado en la información disponible.
- Capacidades multilingües: no se especifican idiomas soportados, aunque Qwen suele soportar múltiples idiomas, no hay confirmación para esta variante.

## Casos de uso

- Investigación en seguridad de modelos de IA: permite estudiar cómo se comporta un modelo sin filtros de seguridad, analizando sesgos, alucinaciones o respuestas a entradas adversarias. Es útil para investigación académica o auditoría de modelos.
- Generación de contenido creativo sin restricciones: escritores o artistas pueden usar el modelo para explorar narrativas que involucran temas tabú o polémicos, siempre que asuman la responsabilidad del contenido generado.
- Evaluación de técnicas de abliteración: desarrolladores que trabajan en métodos de control de comportamiento pueden comparar este modelo con su versión original para medir el efecto de la técnica.
- Pruebas de robustez en aplicaciones de moderación: se puede usar para generar contenido que un sistema de moderación debería detectar, ayudando a entrenar o evaluar filtros de contenido.
- Creación de datasets para entrenamiento de modelos de seguridad: el modelo puede generar ejemplos de contenido no deseado para entrenar clasificadores o sistemas de detección.
- Uso en entornos controlados de laboratorio: para experimentos donde se requiere un modelo sin rechazos, como simulación de comportamientos extremos en entornos de investigación, siempre bajo supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se conocen puntuaciones de MMLU, HumanEval, GSM8K u otros estándares para este modelo concreto. Tampoco se ofrecen comparaciones con el modelo base ni con otros modelos abliterados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 27.781 millones de parámetros. En FP32, necesitaría aproximadamente 111 GB de VRAM; en FP16, unos 55,5 GB; en cuantización de 8 bits, ~28 GB; en 4 bits, ~14 GB. Sin embargo, el repositorio solo ofrece pesos en safetensors (posiblemente FP32), por lo que se requiere conversión a cuantizaciones para despliegues con menos memoria.
- GPU recomendadas: para ejecutar el modelo sin cuantizar se necesitarían GPUs de centro de datos como A100 80GB o H100. Para cuantización 4-bit, una RTX 4090 (24 GB) o similar sería suficiente.
- Compatibilidad con consumer GPU: con cuantización de 4 bits puede caber en GPUs de 24 GB, pero no se proporcionan archivos GGUF ni Ollama directamente en el repositorio. Se puede usar el modelo a través de la versión de Ollama en https://ollama.com/huihui_ai/qwen3.5-abliterated, que ofrece un formato GGUF cuantizado.
- Opciones de despliegue: se puede ejecutar con vLLM, llama.cpp, Ollama o Transformers. La model card recomienda usar Ollama v0.17.5 o superior para la versión específica.
- Latencia y throughput: no se disponen de datos medidos. En general, un modelo de 27B en una GPU A100 puede producir aproximadamente 20-30 tokens/segundo en FP16, pero no hay confirmación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen/Qwen3.5-27B (base) | 27.781 M | No disponible | Apache-2.0 | Modelo original con filtros de seguridad |
| Huihui-Qwen3.5-27B-abliterated | 27.781 M | No disponible | Apache-2.0 | Variante sin filtros de seguridad |
| Otros modelos abliterados de huihui-ai (p. ej. Claude-4.6-Opus-abliterated) | No disponible | No disponible | Apache-2.0 | Variantes de otros modelos base |

No se dispone de información sobre el rendimiento relativo en benchmarks ni sobre diferencias específicas en capacidad entre estos modelos. La comparativa se limita a la diferencia principal: la eliminación de rechazos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una variante del Qwen3.5-27B, hereda los posibles sesgos del modelo base, que no están documentados aquí.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente al eliminar filtros de seguridad, lo que puede aumentar la confianza en respuestas incorrectas.
- Limitaciones de contexto o idioma: no se han especificado la longitud de contexto ni los idiomas soportados. Es probable que el modelo base tenga un contexto de hasta 128K tokens (típico en Qwen3), pero no se confirma.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el autor advierte que no se recomienda para aplicaciones públicas o comerciales sin supervisión. El uso indebido puede generar riesgos legales o éticos.
- Contenido inapropiado: al eliminar los rechazos, el modelo puede generar contenido sensible, controvertido o inapropiado. No tiene salvaguardas por defecto, por lo que se requiere monitoreo y revisión manual.
- Estado experimental: es una prueba de concepto, no un modelo estable para producción. Puede tener comportamientos impredecibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LonelyBoy7th/Huihui-Qwen3.5-27B-abliterated
- Repositorio original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-27B-abliterated
- Versión para Ollama: https://ollama.com/huihui_ai/qwen3.5-abliterated
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Repositorio remove-refusals-with-transformers: https://github.com/Sumandora/remove-refusals-with-transformers
