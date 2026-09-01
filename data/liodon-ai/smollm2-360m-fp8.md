# liodon-ai/SmolLM2-360M-FP8

## Resumen

El modelo `liodon-ai/SmolLM2-360M-FP8` es una cuantización en punto flotante de 8 bits (FP8) del modelo base `HuggingFaceTB/SmolLM2-360M`, publicada por Liodon AI, un laboratorio de investigación independiente especializado en compresión extrema de modelos. Esta versión reduce el tamaño del modelo original de 0,7 GB a 0,4 GB, manteniendo la misma arquitectura y capacidades, lo que lo hace especialmente adecuado para despliegue en entornos con recursos limitados, como dispositivos edge o GPUs de baja capacidad.

La cuantización utiliza el esquema `FP8_DYNAMIC` implementado con la librería `llm-compressor` de vLLM: los pesos se convierten a FP8 (E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Al no requerir un conjunto de calibración, los pesos cuantizados son numéricamente equivalentes a un cast directo del original, evitando sesgos introducidos por la calibración. El modelo base, SmolLM2-360M, es un transformer decoder-only de 361 millones de parámetros entrenado sobre 4 billones de tokens, diseñado para ejecutarse eficientemente en CPU y GPU con un consumo mínimo de recursos.

Esta ficha cubre las especificaciones técnicas, capacidades, casos de uso y limitaciones de la versión cuantizada, basándose exclusivamente en la información proporcionada por el autor y en los datos públicos del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) dinámica, pesos por canal, activaciones por token |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del modelo base `HuggingFaceTB/SmolLM2-360M`, no un entrenamiento nuevo. El esquema `FP8_DYNAMIC` convierte los pesos a FP8 (E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este enfoque no requiere un dataset de calibración, por lo que los pesos cuantizados son un cast directo de los originales, sin sesgo de calibración. La capa `lm_head` se deja sin cuantizar, práctica estándar por su tamaño despreciable y su impacto desproporcionado en la calidad si se cuantizara.

El modelo base SmolLM2-360M es un transformer decoder-only de 361 millones de parámetros, entrenado sobre 4 billones de tokens. No se dispone de información adicional sobre la composición del dataset de entrenamiento ni sobre técnicas de alineación como RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto: al ser un modelo base, puede generar texto coherente y completar secuencias, aunque no está optimizado para seguir instrucciones.
- Razonamiento básico: capacidades limitadas propias de un modelo de 360M de parámetros.
- Multilingüismo: no se especifican idiomas soportados; se asume que hereda las capacidades del modelo base, pero no hay datos confirmados.
- Sin soporte de tool calling ni function calling: no se menciona en la información disponible.
- Sin modo de pensamiento (thinking mode) ni capacidades multimodales: es un modelo de texto puro.
- Compatible con frameworks de inferencia como vLLM, TGI y SGLang, lo que facilita su integración en pipelines de producción.

## Casos de uso

- Despliegue en dispositivos edge: gracias a su tamaño reducido (0,4 GB), puede ejecutarse en hardware con poca memoria, como Raspberry Pi, teléfonos móviles o microcontroladores con aceleración GPU, para tareas de generación de texto en tiempo real.
- Fine-tuning para tareas específicas: al ser un modelo base, es adecuado para ajustarse con datasets propios en tareas como clasificación de texto, análisis de sentimiento o extracción de entidades, con un coste computacional bajo.
- Inferencia de baja latencia en entornos con GPU limitada: su tamaño permite ejecutarlo en GPUs consumer como RTX 4060 o incluso en CPU con dequantización, ofreciendo respuestas rápidas para aplicaciones interactivas.
- Automatización de operaciones internas: según la búsqueda web, el modelo base se utiliza para automatización de operaciones y agentes de workflow internos, donde la privacidad de los datos y el control del modelo son prioritarios.
- Prototipado rápido de aplicaciones de NLP: su pequeño tamaño y compatibilidad con vLLM y TGI permiten iterar rápidamente en entornos de desarrollo sin necesidad de infraestructura costosa.
- Base para destilación de conocimiento: puede servir como modelo profesor o alumno en procesos de destilación, dado su tamaño compacto y su rendimiento conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,4 GB para los pesos, más overhead de activaciones y memoria del framework, lo que supone un consumo total de 1-2 GB en inferencia.
- GPU recomendadas: para ejecución FP8 nativa se requiere una GPU con compute capability ≥ 8.9 (arquitecturas Ada, Hopper o Blackwell), como RTX 40-series, L4/L40S, H100/H200, B100/B200/GB10. En GPUs más antiguas, vLLM o TGI dequantizan el modelo, perdiendo las ventajas de velocidad y memoria.
- Compatibilidad con GPU consumer: sí, cabe en cualquier GPU con al menos 2 GB de VRAM, como RTX 3050 o superiores, aunque la ejecución FP8 nativa solo está disponible en RTX 40-series o posteriores.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI) y SGLang, todos soportados según la model card.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo de 360M, se espera una latencia de decenas de milisegundos por token en GPU modernas.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la misma categoría (tamaño y cuantización) en los datos proporcionados.

## Limitaciones y advertencias

- Pérdida de precisión por cuantización: aunque el esquema FP8 dinámico minimiza el impacto al ser un cast directo, la cuantización a 8 bits puede introducir ligeras degradaciones en tareas de alta sensibilidad numérica.
- Capacidades limitadas del modelo base: con solo 360M de parámetros, el modelo tiene un rendimiento inferior a modelos más grandes en tareas complejas como razonamiento avanzado o generación de código extenso.
- Licencia "other" no especificada: la model card indica `license: other` sin detallar los términos exactos, lo que puede implicar restricciones de uso comercial. Se recomienda revisar la licencia del modelo base y contactar al autor para aclaraciones.
- No es un modelo instruct: al ser un modelo base, no está optimizado para seguir instrucciones ni para diálogo; requiere fine-tuning para tareas específicas.
- Requisito de hardware para FP8 nativo: en GPUs sin compute capability ≥ 8.9, el modelo se dequantiza, perdiendo las ventajas de memoria y velocidad, aunque sigue siendo funcional.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/liodon-ai/SmolLM2-360M-FP8)
- [Modelo base HuggingFaceTB/SmolLM2-360M](https://huggingface.co/HuggingFaceTB/SmolLM2-360M)
- [Perfil de Liodon AI en HuggingFace](https://huggingface.co/liodon-ai)
- [Sitio web de Liodon AI](https://liodon.ai/)
- [Repositorio de SmolLM en GitHub](https://github.com/huggingface/smollm)
- [Artículo sobre SmolLM2-360M en llm.co](https://llm.co/llms/smollm2-360m)
