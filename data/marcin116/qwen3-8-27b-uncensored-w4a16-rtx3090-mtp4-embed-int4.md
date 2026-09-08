# Marcin116/Qwen3.8-27B-Uncensored-W4A16-RTX3090-MTP4-embed-int4

## Resumen

Qwen3.8-27B-Uncensored-W4A16-RTX3090-MTP4-embed-int4 es un derivado cuantizado y optimizado para servido del modelo Qwen3.8-27B de la familia Qwen. El autor, Marcin116, ha partido de la versión abliterated (uncensored) creada por orcarouter, la ha cuantizado con AutoRound a W4A16 y ha añadido soporte para decodificación especulativa MTP (Multi-Token Prediction) para reducir la latencia en una GPU RTX 3090 de 24 GB. Este repositorio re-cuantiza además los token embeddings de INT8 a INT4, reduciendo el tamaño en disco a 15.2 GB.

El modelo es un transformer denso de visión-lenguaje con 27.991 millones de parámetros, capaz de procesar imágenes y videos, y está pensado para uso local, investigación, red-teaming y evaluación de seguridad. Al ser un modelo abliterated, carece de la alineación de seguridad del modelo original, lo que lo hace útil para estudiar el comportamiento sin restricciones y para probar sistemas de moderación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (visión-lenguaje) |
| Parametros totales | 27.991.143.152 (≈28.0B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 (INT4 en pesos, BF16 en activaciones), INT4 en embeddings (este repo), INT8 en embeddings (repo fuente), AutoRound, GPTQ, compressed-tensors |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de visión-lenguaje que entiende imágenes y videos, con control de pensamiento flexible y capacidad para resolver tareas complejas de múltiples pasos. La cadena de derivación es la siguiente: Qwen/Qwen3.8-27B (original) → orcarouter/Qwen3.8-27B-Uncensored (abliterated) → noon-at-cgn/Qwen3.8-27B-Uncensored-W4A16-AutoRound (cuantización AutoRound W4A16) → protogeni/Qwen3.8-27B-Uncensored-W4A16-RTX3090-MTP4 (optimización MTP) → este repositorio (embeddings INT4).

El proceso de abliteration elimina la alineación de seguridad del modelo original, lo que permite generar contenido sin restricciones. La cuantización W4A16 reduce los pesos a INT4 manteniendo las activaciones en BF16. La optimización MTP añade tensores adicionales y un archivo `mtp_draft_vocab_ids.pt` para habilitar la decodificación especulativa, que predice varios tokens a la vez para reducir la latencia. La cuantización de embeddings a INT4 utiliza un esquema simétrico por grupos de 128 (group-128) con escala absoluta máxima: `scale = clamp(absmax/7, min=1e-10)`, round y clamp a `[-7, +7]`, sin punto cero. Los códigos INT4 se generan a partir de las embeddings BF16 del modelo abliterated, no del modelo base Qwen, porque el abliteration modifica estos pesos.

## Capacidades

- Generación de texto y razonamiento con control de pensamiento flexible (thinking mode).
- Comprensión de imágenes y videos como modelo nativo de visión-lenguaje (pipeline image-text-to-text).
- Resolución de tareas complejas de múltiples pasos con mayor fiabilidad.
- Soporte multilingüe para inglés y chino.
- Decodificación especulativa MTP para reducir la latencia de inferencia.
- Ausencia de barreras de seguridad integradas debido al abliteration, lo que permite generar contenido sin restricciones.

## Casos de uso

- Red-teaming de sistemas de moderación: el modelo puede generar contenido dañino o poco ético de forma deliberada, lo que permite probar si una capa de seguridad externa (filtros, clasificadores) detecta y bloquea estas salidas.
- Investigación en interpretabilidad: comparar las respuestas de este modelo abliterated con las del Qwen3.8-27B original permite estudiar cómo afecta la alineación al comportamiento del modelo.
- Evaluación de técnicas de cuantización: el error de cuantización medido en los embeddings INT4 (aunque no se reporta el valor exacto) sirve para evaluar el impacto de reducir la precisión de este tensor en la calidad de las representaciones.
- Prototipado de aplicaciones de visión-lenguaje en local: al ser un modelo image-text-to-text, puede procesar imágenes y videos en una RTX 3090 de 24 GB sin depender de APIs externas, lo que facilita el desarrollo de prototipos.
- Despliegue de baja latencia en GPU de consumo: la combinación de W4A16 y MTP speculative decoding permite servir un modelo de 27B en hardware de 24 GB, útil para entornos de investigación con recursos limitados.
- Experimentación con decodificación especulativa: los tensores MTP y el archivo `mtp_draft_vocab_ids.pt` incluidos en el repositorio permiten investigar y comparar el rendimiento de MTP frente a otros métodos de speculative decoding.
- Generación de contenido creativo sin restricciones: para proyectos internos que requieren libertad creativa total, siempre que se implemente una capa de seguridad independiente antes de exponer el modelo a usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de precisión reportado es el error de cuantización del tensor de embeddings, comparado con los pesos BF16 del modelo abliterated:

| Variante | Error RMS relativo | Similitud coseno |
|---|---|---|
| INT8 (protogeni) | 0.669 % | 0.999978 |
| INT4 (este repo) | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo está diseñado para funcionar en una GPU con 24 GB de VRAM (RTX 3090). El repositorio ocupa 15.2 GB en disco, por lo que la VRAM estimada para inferencia se sitúa en el rango de 15-20 GB, dependiendo del tamaño del lote y la implementación.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40-80 GB), H100 (80 GB).
- Compatibilidad con GPU de consumo: sí, cabe en una RTX 3090 o RTX 4090 de 24 GB.
- Opciones de despliegue: vLLM (con soporte para MTP speculative decoding), syv-ai/qwen38-27b-rtx3090, transformers, llama.cpp (para versiones GGUF del modelo uncensored).
- Latencia y throughput: no se han publicado datos específicos. El objetivo declarado es lograr baja latencia mediante MTP speculative decoding en una RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B | 27.99B | No disponible | BF16 | Apache-2.0 | HuggingFace |
| orcarouter/Qwen3.8-27B-Uncensored | 27.99B | No disponible | BF16 | Apache-2.0 | HuggingFace |
| protogeni/Qwen3.8-27B-Uncensored-W4A16-RTX3090-MTP4 | 27.99B | No disponible | W4A16 + INT8 embeddings | Apache-2.0 | HuggingFace |
| Marcin116/Qwen3.8-27B-Uncensored-W4A16-RTX3090-MTP4-embed-int4 | 27.99B | No disponible | W4A16 + INT4 embeddings | Apache-2.0 | HuggingFace |

Diferencias clave: este modelo es el más optimizado en cuanto a tamaño de memoria (15.2 GB en disco) gracias a la cuantización INT4 de los embeddings, pero introduce un mayor error de cuantización en ese tensor (aunque no se ha medido). El modelo original y el abliterated mantienen precisión BF16 pero requieren más VRAM. protogeni es idéntico a este repo excepto por los embeddings INT8.

## Limitaciones y advertencias

- Sesgos: el modelo hereda los sesgos del Qwen3.8-27B original y del proceso de abliteration. Puede generar contenido dañino, poco ético, ofensivo o ilegal.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada. No hay datos específicos sobre la tasa de alucinación.
- Limitaciones de contexto o idioma: los metadatos solo indican soporte para inglés y chino. El rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el autor advierte explícitamente que el modelo no debe exponerse a usuarios no confiables sin una capa de seguridad independiente.
- Caveat importante: el modelo no tiene barreras de seguridad significativas integradas. Está publicado para uso local, evaluación, interpretabilidad, red-teaming e investigación de seguridad. El usuario es responsable de cómo lo despliega y utiliza.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Marcin116/Qwen3.8-27B-Uncensored-W4A16-RTX3090-MTP4-embed-int4
- Modelo base cuantizado: https://huggingface.co/noon-at-cgn/Qwen3.8-27B-Uncensored-W4A16-AutoRound
- Fuente protogeni (INT8 embeddings): https://huggingface.co/protogeni/Qwen3.8-27B-Uncensored-W4A16-RTX3090-MTP4
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Derivado abliterated: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Repositorio de servido syv-ai: https://github.com/syv-ai/qwen38-27b-rtx3090
- Blog sobre la versión GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
