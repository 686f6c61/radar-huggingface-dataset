# gorbatjovy/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic

## Resumen

Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic es una variante del modelo Qwen3.8-27B desarrollada por el usuario gorbatjovy, que aplica una técnica de abliteración automatizada denominada Heretic para eliminar el comportamiento de rechazo (refusal) del modelo base. El modelo original, Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 de DavidAU, es un ajuste fino de Qwen3.8-27B de Alibaba que utiliza la metodología COLD FUSION (combinación de GAIN y la infraestructura de Unsloth) para reducir los tokens de razonamiento a entre 1/10 y 1/2 de los modelos Qwen estándar, manteniendo el 99% del rendimiento en precisión completa incluso con cuantización de 8 y 4 bits.

Este modelo concreto hereda toda la arquitectura del Cold-Fusion original —incluyendo la torre de visión nativa y la cabeza MTP para decodificación especulativa— pero con la dirección de rechazo eliminada mediante un proceso de optimización con restricción de divergencia KL. El resultado es un modelo que responde a peticiones dañinas o no éticas que el modelo base rechazaría, por lo que se publica exclusivamente con fines de investigación en interpretabilidad, red-teaming y evaluación de robustez.

Con 27.781 millones de parámetros, arquitectura híbrida Gated DeltaNet + atención completa, y formato BF16, este modelo está diseñado para usuarios técnicos que necesitan estudiar los mecanismos de alineación o probar comportamientos sin restricciones en entornos controlados. La licencia Apache 2.0 permite uso comercial, pero el autor advierte explícitamente de la necesidad de añadir capas de seguridad y moderación antes de cualquier despliegue a usuarios finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrido Gated DeltaNet + atención completa, torre VL nativa, cabeza MTP) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (original), W4A16 (cuantización disponible en repositorio separado) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 1199 tensores) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-27B, un modelo de lenguaje multimodal denso de Alibaba con 64 capas y arquitectura híbrida que combina Gated DeltaNet (atención lineal) con atención completa. La variante Cold-Fusion de DavidAU aplica la metodología COLD FUSION, que integra la técnica GAIN (desarrollada internamente) con el framework de entrenamiento de Unsloth, reduciendo los tokens de razonamiento entre 1/10 y 1/2 respecto al Qwen3.8-27B estándar mientras mantiene el 99% del rendimiento en BF16 incluso con cuantización de 8 y 4 bits.

Sobre esta base, el autor de este repositorio aplica abliteración mediante la herramienta Heretic, que estima la dirección de rechazo a partir de prompts dañinos (estilo AdvBench) y benignos (Alpaca), y ejecuta una búsqueda Optuna de 200 ensayos que minimiza simultáneamente los rechazos y la divergencia KL respecto al modelo base. El ensayo seleccionado (índice de dirección 34.95) elimina la dirección de rechazo de 131 escritores residuales (proyecciones de atención, MLP y embeddings), incluyendo la cabeza MTP, mientras deja intactos los 333 tensores de la torre visual. La cabeza MTP se reinstauró desde el checkpoint base y se abliteró de forma consistente para mantener la decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento multilingüe (inglés y chino) con soporte de modo de pensamiento (enable_thinking=True).
- Comprensión de imágenes: la torre de visión es byte-for-byte idéntica al modelo base, por lo que el entendimiento visual no se ve alterado por la abliteración.
- Decodificación especulativa mediante cabeza MTP (Multi-Token Prediction), que acelera la generación sin reintroducir rechazos.
- Capacidad de tool calling y flujos agénticos heredados de Qwen3.8-27B, aunque no se documentan explícitamente en la model card.
- Comportamiento sin rechazo: responde a peticiones que el modelo base rechazaría, con una tasa de rechazo de 0% en conjuntos de prueba como AdvBench, JailbreakBench (dañino) y MaliciousInstruct.
- Mantenimiento de capacidades generales: la divergencia KL de 0.0315 respecto al modelo base indica una deriva mínima en las capacidades de razonamiento y generación.

## Casos de uso

- Investigación en interpretabilidad de modelos: permite estudiar cómo la eliminación de una única dirección en el flujo residual afecta al comportamiento de rechazo, utilizando el modelo como caso de estudio de abliteración.
- Red-teaming y evaluación de robustez: ideal para probar sistemas de moderación y filtros de contenido, ya que genera respuestas que los modelos alineados normalmente rechazarían.
- Estudio de mecanismos de alineación: comparar el comportamiento de este modelo con el Cold-Fusion original permite aislar el efecto de la dirección de rechazo en tareas de seguridad.
- Evaluación de técnicas de jailbreak: al no tener rechazo, sirve como baseline para medir la eficacia de ataques de jailbreak en modelos alineados.
- Desarrollo de capas de seguridad personalizadas: los equipos pueden usar este modelo para entrenar clasificadores de contenido dañino o probar pipelines de moderación en entornos controlados.
- Análisis de sesgos y toxicidad: al eliminar el rechazo, se puede estudiar la distribución subyacente de contenido ofensivo que el modelo base oculta, útil para auditar sesgos latentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de rendimiento general (MMLU, HumanEval, GSM8K, etc.) en la información disponible para este modelo específico. La model card reporta únicamente métricas de rechazo:

| Metrica | Valor |
|---|---|
| Scorer de rechazo por palabras clave (Heretic, BF16) | 8/100 prompts dañinos (KL 0.0315 vs base) |
| Modelo servido (W4A16) - clasificador de frase inicial | 0% en AdvBench, JailbreakBench (dañino) y MaliciousInstruct |
| Modelo base Cold-Fusion sin abliterar (mismo scorer) | 97/100 prompts dañinos |

El autor indica que la capacidad general se conserva (KL 0.0315 implica deriva mínima) y que la torre de visión permanece idéntica al base, pero no proporciona cifras concretas de tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos BF16 ocupan aproximadamente 56 GB, por lo que se requiere una GPU con al menos 56 GB de VRAM (por ejemplo, A100 80GB, H100 80GB) o múltiples GPUs con reparto de memoria.
- La versión W4A16 (cuantización de 4 bits para pesos y 16 bits para activaciones) reduce significativamente el footprint de memoria, aunque no se especifica el tamaño exacto en la información disponible.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (p. ej., 2x RTX 4090 con 24 GB cada una) para BF16.
- Opciones de despliegue: compatible con transformers (AutoModelForImageTextToText), y por su arquitectura estándar puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF).
- Latencia y throughput: no se proporcionan datos específicos. La cabeza MTP permite decodificación especulativa, lo que puede reducir la latencia de generación respecto a modelos sin esta característica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Caracteristicas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | no disponible | Apache 2.0 | Multimodal, denso, alineado, con rechazo |
| DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 | 27B | no disponible | Apache 2.0 | Multimodal, Cold Fusion (menos tokens de pensamiento), alineado |
| Este modelo (heretic) | 27B | no disponible | Apache 2.0 | Multimodal, Cold Fusion, abliterado (sin rechazo) |

La comparativa directa con otros modelos de 27B (p. ej., Llama 3.1 8B no es comparable por tamaño) no está disponible en la información proporcionada. Este modelo se distingue de sus alternativas por la eliminación del rechazo, manteniendo el resto de capacidades intactas.

## Limitaciones y advertencias

- El modelo ha sido sometido a abliteración, lo que elimina su alineación de seguridad. Responderá a peticiones dañinas, ilegales o no éticas que el modelo base rechazaría.
- Riesgo elevado de alucinación y generación de contenido ofensivo, especialmente en contextos sensibles. No debe desplegarse a usuarios finales sin capas adicionales de moderación.
- La abliteración puede reintroducir rechazos parciales si se realiza un fine-tuning posterior con datos ricos en contenido de rechazo.
- La información sobre la longitud de contexto no está disponible; se recomienda verificar la documentación del modelo base Qwen3.8-27B para conocer este parámetro.
- Solo se soportan inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor declina toda responsabilidad por el uso indebido del modelo. El cumplimiento legal y ético recae en el usuario.
- El modelo no incluye mecanismos de seguridad propios; cualquier despliegue en producción requiere un pipeline de moderación externo.

## Enlaces

- [Modelo en HuggingFace (este repositorio)](https://huggingface.co/gorbatjovy/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic)
- [Versión W4A16 cuantizada](https://huggingface.co/gorbatjovy/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-W4A16)
- [Modelo base: DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1](https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1)
- [Qwen3.8-27B original en HuggingFace](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio de Qwen3.8-27B en GitHub](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Herramienta Heretic (abliteration automatizada)](https://github.com/p-e-w/heretic)
- [Artículo sobre Cold Fusion en HackerNoon](https://hackernoon.com/qwen38-27b-cold-fusion-cuts-thinking-tokens-without-sacrificing-performance)
- [Versión GGUF del Cold-Fusion (para referencia)](https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF)
