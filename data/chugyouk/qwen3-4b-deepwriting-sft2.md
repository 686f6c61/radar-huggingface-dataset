# ChuGyouk/Qwen3-4B-DeepWriting-SFT2

## Resumen

El modelo **Qwen3-4B-DeepWriting-SFT2** es un ajuste fino (fine-tune) del modelo base **unsloth/Qwen3-4B-Base**, desarrollado por el usuario **ChuGyouk** y publicado en Hugging Face. Se trata de un modelo de generación de texto de 4 022 millones de parámetros, entrenado mediante *supervised fine-tuning* (SFT) utilizando las librerías TRL y Unsloth. Aunque el nombre sugiere una especialización en escritura profunda o creativa, la model card no proporciona detalles sobre el dataset de entrenamiento ni sobre las tareas concretas para las que fue optimizado.

Este modelo es relevante porque aprovecha la arquitectura Qwen3, una familia de modelos multilingües de última generación que destaca en comprensión del lenguaje, generación de texto, codificación y matemáticas. Al ser un fine-tune de la versión base (no instructiva), el modelo hereda las capacidades generales de Qwen3-4B, pero no incluye el ajuste por instrucciones ni el modo *thinking* que sí tienen las versiones instructivas. No se dispone de información pública sobre la licencia, los idiomas soportados ni la longitud de contexto específica de este ajuste, aunque es razonable asumir que hereda las características del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-4B) |
| Parametros totales | 4 022 468 096 (4,02 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-4B, no documentada en esta ficha) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el base Qwen3 es multilingüe, pero no se especifica para este fine-tune) |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **Qwen3-4B**, un transformer denso con 4 022 millones de parámetros, desarrollado por Alibaba Cloud. Qwen3 incorpora innovaciones como *GQA* (Grouped Query Attention), *SwiGLU* como activación y *rotary positional embeddings*. La versión base (sin instrucciones) se entrenó con un corpus multilingüe masivo, pero los detalles exactos del preentrenamiento no se incluyen en esta ficha.

El proceso de fine-tune se realizó mediante **SFT** (supervised fine-tuning) utilizando **TRL** (Transformers Reinforcement Learning) y la librería **Unsloth**, que optimiza el entrenamiento reduciendo el uso de memoria y acelerando los tiempos. La model card indica que se usaron las versiones TRL 0.24.0, Transformers 5.5.0, PyTorch 2.11.0, Datasets 4.3.0 y Tokenizers 0.22.2. No se proporcionan datos sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni otras hiperparámetros. Tampoco se menciona el uso de técnicas como RLHF o DPO; únicamente SFT.

## Capacidades

- **Generación de texto**: al ser un modelo base ajustado con SFT, puede generar texto coherente y continuar secuencias, aunque no está optimizado para seguir instrucciones conversacionales complejas como las versiones instructivas.
- **Razonamiento y matemáticas**: hereda las capacidades del modelo base Qwen3-4B, que destaca en tareas de razonamiento lógico y aritmética básica, aunque sin el modo *thinking* de las versiones instructivas.
- **Codificación**: el base Qwen3-4B tiene buen rendimiento en generación de código, por lo que este fine-tune podría conservar esa habilidad, aunque no hay evidencia específica.
- **Multilingüismo**: el modelo base soporta múltiples idiomas, pero esta ficha no documenta qué idiomas mantiene el ajuste.
- **Tool calling / function calling**: no documentado; el modelo base no incluye soporte nativo para tool calling en su versión base.
- **Capacidades de agente**: no documentado; no se ha verificado soporte para razonamiento multi-paso o uso de herramientas.
- **Escritura creativa**: el nombre "DeepWriting" sugiere una posible especialización en escritura, pero no hay documentación que lo confirme.

## Casos de uso

Dado que no se dispone de documentación específica sobre el propósito del fine-tune, los casos de uso se infieren de las capacidades del modelo base Qwen3-4B. Se recomienda validar el comportamiento real antes de desplegarlo en producción.

- **Generación de borradores de contenido**: el modelo puede producir textos extensos y coherentes, útil para redactar artículos, ensayos o guiones iniciales que luego un humano revise y edite.
- **Autocompletado de código en entornos de desarrollo**: gracias a su base Qwen3-4B, puede sugerir fragmentos de código en lenguajes populares, integrándose en editores o pipelines de CI/CD.
- **Asistencia en tareas de razonamiento lógico**: puede resolver problemas de lógica y matemáticas simples, útil en aplicaciones educativas o de soporte a la decisión.
- **Traducción y paráfrasis**: al ser multilingüe (heredado del base), puede ayudar a reformular textos o traducir entre idiomas, aunque la calidad no está garantizada sin evaluación.
- **Generación de datos sintéticos**: se puede usar para crear datasets de entrenamiento para otros modelos, generando texto de diversa temática con un estilo consistente.
- **Prototipado de chatbots**: aunque no está ajustado para instrucciones, puede servir como base para un sistema conversacional si se combina con un prompt de sistema adecuado y se evalúa su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este fine-tune específico. El rendimiento dependerá del modelo base Qwen3-4B, cuyos resultados pueden consultarse en la documentación oficial de Qwen, pero no se pueden atribuir directamente a este ajuste.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 4 022 millones de parámetros en precisión fp16, se necesitan aproximadamente **8 GB de VRAM** solo para los pesos. En cuantización de 8 bits (int8) se reduce a unos 4 GB, y en 4 bits a unos 2,5 GB, aunque no se publican cuantizaciones oficiales para este modelo.
- **GPU recomendadas**: una GPU con al menos 8 GB de VRAM (p. ej., RTX 3070/4070, A10, L4) es suficiente para inferencia en fp16. Para cuantizaciones ligeras, una GPU de 4-6 GB (RTX 3060, RTX 4060) puede bastar.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo modernas con 8 GB o más, especialmente con cuantización.
- **Opciones de despliegue**: al ser un modelo de la familia transformers, se puede servir con **vLLM**, **TGI** (Text Generation Inference), **Ollama** (si se convierte a GGUF) o **llama.cpp**. El formato safetensors es compatible con Hugging Face Transformers.
- **Latencia y throughput**: no se dispone de datos medidos. Para un modelo de 4B, se espera una latencia de decenas de milisegundos por token en GPUs modernas, pero depende del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| **Qwen3-4B-DeepWriting-SFT2** (este) | 4,02 B | no disponible | no disponible | Hugging Face (pesos safetensors) |
| **Qwen3-4B** (base) | 4,02 B | 32 768 tokens (según documentación oficial) | Apache 2.0 (para el base) | Hugging Face, Ollama, vLLM |
| **Qwen2.5-3B** (base) | 3,09 B | 32 768 tokens | Apache 2.0 | Hugging Face, Ollama |

La comparativa se limita al modelo base de la misma familia y a un modelo de tamaño similar de la generación anterior. No se dispone de benchmarks que permitan comparar el rendimiento del fine-tune con estas alternativas. El modelo base Qwen3-4B tiene una licencia Apache 2.0, pero la licencia de este fine-tune no está especificada, por lo que se debe contactar con el autor antes de un uso comercial.

## Limitaciones y advertencias

- **Licencia incierta**: la model card indica "licence: license" sin especificar términos. No se puede asumir que sea de código abierto ni libre para uso comercial sin confirmación del autor.
- **Falta de documentación**: no se detalla el dataset de entrenamiento, las tareas objetivo ni las hiperparámetros, lo que dificulta evaluar su idoneidad para casos concretos.
- **Riesgo de alucinaciones**: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en temas factuales.
- **Sesgos potenciales**: al ser un fine-tune de un modelo base, puede heredar sesgos presentes en los datos de preentrenamiento, y el dataset de SFT podría introducir sesgos adicionales no documentados.
- **Limitaciones de idioma**: aunque el base es multilingüe, no se garantiza que el fine-tune mantenga el mismo rendimiento en todos los idiomas.
- **Contexto no verificado**: no se especifica la longitud de contexto soportada; si se usa más allá del límite del modelo base, podría degradarse la calidad.
- **Sin soporte oficial**: es un modelo de un autor individual, sin mantenimiento garantizado ni canal de soporte.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ChuGyouk/Qwen3-4B-DeepWriting-SFT2)
- [Repositorio oficial de Qwen3 (GitHub)](https://github.com/QwenLM/Qwen3)
- [Modelo base Qwen3-4B en Hugging Face](https://huggingface.co/Qwen/Qwen3-4B)
- [Ficha de Qwen3-4B en Qualcomm AI Hub](https://aihub.qualcomm.com/models/qwen3_4b)
