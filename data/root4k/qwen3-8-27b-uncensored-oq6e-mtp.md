# root4k/Qwen3.8-27B-Uncensored-oQ6e-mtp

## Resumen

El modelo `root4k/Qwen3.8-27B-Uncensored-oQ6e-mtp` es una cuantización mixta de precisión (oQ, oMLX) aplicada sobre los pesos de un modelo base Qwen3.8-27B, modificado mediante técnicas de "abliteración" para eliminar los mecanismos de rechazo y censura del modelo original. El autor, root4k, ha publicado esta versión en formato MLX safetensors, orientada a su ejecución en Apple Silicon mediante la librería MLX. El nombre sugiere 27 mil millones de parámetros, aunque el recuento real de parámetros en los safetensors es de 6.612.941.552, lo que indica que se trata de una versión cuantizada con pesos reducidos o que el dato del autor no coincide con el recuento real. La cuantización es de 6 bits con group size 64, lo que reduce el tamaño del repositorio a 23.7 GB.

Este modelo pertenece a la familia de "uncensored" que circulan en la comunidad, basados en el trabajo de OrcaRouter sobre Qwen3.8-27B. Su relevancia radica en ofrecer una alternativa local sin filtros de seguridad para investigación y desarrollo, aunque con las advertencias éticas y legales correspondientes. No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso, por lo que su adopción en producción requiere verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B, sin confirmación oficial) |
| Parametros totales | 6.612.941.552 (según safetensors; el nombre indica 27B, discrepancia sin aclarar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64 (oQ, oMLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Qwen3.8-27B, un transformer autoregresivo con atención de múltiples cabezas, aunque no se dispone de detalles oficiales sobre el número de capas, dimensiones ocultas o mecanismos de atención específicos. La cuantización oQ (oMLX) aplica una precisión mixta de 6 bits con group size 64, lo que reduce el tamaño del modelo respecto a la versión original FP16 o BF16. El proceso de "abliteración" consiste en modificar los pesos del modelo para eliminar las activaciones asociadas a comportamientos de rechazo o negativa, dando como resultado un modelo que no filtra contenido por políticas de seguridad. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO en la versión base.

## Capacidades

- Generación de texto libre sin filtros de contenido, gracias a la abliteración.
- Razonamiento y comprensión del lenguaje, heredados del modelo base Qwen3.8-27B.
- Capacidad de ejecución local en Apple Silicon mediante MLX, con cuantización de 6 bits.
- No se confirma soporte de tool calling, function calling, agentes, visión o audio en esta versión específica.
- Multilingüismo no confirmado; depende del modelo base, pero sin datos oficiales.

## Casos de uso

- Investigación en alineación y seguridad de modelos: permite estudiar el comportamiento de un modelo sin restricciones de seguridad, comparando respuestas con la versión censurada.
- Desarrollo de aplicaciones de generación de texto creativo sin restricciones temáticas, como narrativa de ficción o guiones.
- Pruebas de robustez y jailbreak: útil para evaluar técnicas de ataque y defensa en modelos de lenguaje.
- Entornos de desarrollo local en macOS con Apple Silicon, donde MLX ofrece buen rendimiento con cuantización de 6 bits.
- Prototipado rápido de chatbots o asistentes que requieran respuestas sin filtros, siempre dentro de un marco legal y ético.
- Estudio de técnicas de cuantización mixta (oQ) aplicadas a modelos grandes, comparando calidad y velocidad frente a otras cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas para esta cuantización específica.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 23.7 GB, por lo que se requiere al menos 24 GB de memoria unificada en Apple Silicon (M1 Max, M2 Ultra, M3 Max) o una GPU con 24 GB de VRAM si se adapta a otros entornos.
- GPU recomendadas: Apple Silicon con 32 GB o más de memoria unificada para mayor comodidad; en el ecosistema MLX, los chips M1 Pro/Max, M2 Pro/Max/Ultra y M3 Pro/Max/Ultra son adecuados.
- No cabe en GPUs de consumo de 8-12 GB (como RTX 3060, 4060) sin cuantizaciones más agresivas.
- Opciones de despliegue: MLX (librería nativa de Apple), posible conversión a GGUF para llama.cpp u Ollama, aunque no se proporciona en este repositorio.
- Latencia y throughput: no disponibles; dependerán del hardware y de la implementación de MLX.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría. Existen versiones GGUF y FP8 del mismo modelo base (Qwen3.8-27B-Uncensored) publicadas por OrcaRouter, pero no se han encontrado métricas de rendimiento ni comparaciones directas. Se recomienda consultar los repositorios de OrcaRouter para más información.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, lo que puede generar respuestas inapropiadas, ofensivas o peligrosas. El uso debe limitarse a entornos de investigación con control ético.
- No se dispone de licencia oficial; el uso comercial es incierto y podría violar los términos del modelo base Qwen.
- La discrepancia entre el nombre (27B) y el recuento real de parámetros (6.6B) sugiere que el modelo podría estar mal etiquetado o que la cuantización reduce drásticamente el número de parámetros efectivos, lo que afectaría a la calidad de las respuestas.
- No hay información sobre la longitud de contexto soportada; se desconoce si mantiene la ventana del modelo original.
- Riesgo de alucinaciones y errores factuales, común en modelos de este tamaño.
- La cuantización de 6 bits puede degradar la calidad del texto en comparación con versiones de mayor precisión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/root4k/Qwen3.8-27B-Uncensored-oQ6e-mtp
- GitHub de oQ (oMLX): https://github.com/jundot/omlx
- Blog de OrcaRouter sobre la versión MLX: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Guía para ejecutar GGUF localmente: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Blog sobre la versión GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Repositorio GitHub de la comunidad sobre Qwen 3.8 uncensored: https://github.com/Wassimyounes01/qwen38-uncensored
