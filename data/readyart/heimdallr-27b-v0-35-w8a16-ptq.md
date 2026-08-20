# ReadyArt/Heimdallr-27B-v0.35-W8A16-PTQ

## Resumen

Heimdallr-27B-v0.35-W8A16-PTQ es un modelo de lenguaje de 27.781 millones de parámetros desarrollado por ReadyArt, una organización especializada en modelos de roleplay y narrativa inmersiva. Se trata de una versión cuantizada en W8A16 (pesos de 8 bits, activaciones de 16 bits) mediante compresión tensorial (PTQ) del modelo base ReadyArt/Heimdallr-27B-v0.35, que a su vez se construye sobre la arquitectura Qwen3.5 según las etiquetas del repositorio. El modelo está orientado a conversación, instrucciones y roleplay, con un enfoque explícito en contenido adulto y sin alineación (unaligned), lo que lo hace adecuado para escenarios de ficción oscura y fantasía.

La relevancia de este modelo radica en su tamaño intermedio (27B) combinado con una cuantización eficiente que reduce los requisitos de memoria, permitiendo su ejecución en hardware de gama alta para consumidores o en servidores con una sola GPU. Sin embargo, el acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace, lo que limita su disponibilidad inmediata. La licencia Apache-2.0 permite uso comercial, pero el contenido explícito y la falta de alineación exigen precaución en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3_5, probablemente variante de Qwen) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 (PTQ, compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Las etiquetas indican que se basa en Qwen3.5, lo que sugiere una arquitectura transformer estándar con atención de múltiples cabezas, pero no se confirma si incorpora innovaciones como atención lineal o decodificación especulativa. El proceso de entrenamiento tampoco está documentado en la información proporcionada: se desconoce el número de tokens, la composición del dataset y si se aplicaron técnicas de RLHF o DPO. Dado el enfoque en roleplay y contenido adulto, es probable que el ajuste fino se haya realizado sobre datos de conversación narrativa y ficción, pero esto es una inferencia a partir de las etiquetas y no un dato verificado.

La cuantización W8A16 mediante compressed-tensors es una técnica de post-entrenamiento que reduce el peso de los parámetros a 8 bits manteniendo activaciones de 16 bits, lo que disminuye el uso de VRAM y acelera la inferencia en hardware compatible. No se especifica el método exacto de calibración ni la pérdida de precisión asociada.

## Capacidades

- Generación de texto conversacional y narrativo, especializado en roleplay inmersivo con ambientaciones oscuras y de fantasía.
- Soporte de instrucciones (instruct) para tareas dirigidas, aunque sin garantía de alineación con valores seguros.
- Contenido explícito y adulto (NSFW) sin filtros, diseñado para escenarios de ficción madura.
- Capacidades multilingües no confirmadas; no se indica qué idiomas soporta.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Roleplay narrativo en juegos de texto: el modelo puede generar respuestas detalladas y atmosféricas para partidas de rol en solitario o multijugador, manteniendo coherencia con la ambientación oscura y los personajes definidos.
- Escritura creativa asistida: autores de ficción pueden usarlo para explorar tramas, diálogos y descripciones en géneros de fantasía oscura, terror o erotismo, aprovechando su capacidad para mantener un tono consistente.
- Simulación de personajes en entornos de entretenimiento: desarrolladores de chatbots o asistentes virtuales con temática adulta pueden integrarlo para crear interacciones personalizadas, siempre que cumplan con las políticas de la plataforma.
- Generación de contenido para juegos de rol de mesa: el modelo puede actuar como director de juego automatizado, describiendo escenarios, reacciones de PNJ y consecuencias de las acciones de los jugadores.
- Prototipado de sistemas de diálogo sin alineación: investigadores que estudian modelos sin restricciones de seguridad pueden utilizarlo para analizar comportamientos y sesgos en contextos controlados.
- Creación de narrativa interactiva en aplicaciones de ficción: desarrolladores de novelas visuales o aventuras de texto pueden emplearlo para generar ramas argumentales dinámicas y respuestas contextuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo o su versión base.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.781 millones de parámetros en W8A16, el peso del modelo ocupa aproximadamente 27,8 GB (27,8e9 × 1 byte por parámetro). Con overhead de activaciones y KV cache, se recomienda al menos 32-40 GB de VRAM para una ventana de contexto moderada.
- GPU recomendadas: NVIDIA A100 40GB, A100 80GB, H100, RTX 4090 24GB (con cuantización adicional o contexto reducido), RTX 6000 Ada, o GPUs con 32GB+ de VRAM.
- En consumer GPU: cabe en una RTX 4090 (24GB) solo si se reduce la longitud de contexto o se aplica una cuantización adicional (por ejemplo, GGUF Q4), pero no es óptimo. En GPUs de 16GB no es viable sin offloading a CPU.
- Opciones de despliegue: al ser safetensors, se puede servir con vLLM, TGI o Transformers con soporte de compressed-tensors. También se puede convertir a GGUF para usar con llama.cpp u Ollama, aunque no se proporciona una versión GGUF oficial.
- Latencia y throughput: no disponibles. Dependerá del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, existe una variante relacionada: Heimdallr-v0.02-31B-GGUF, basada en Gemma-4 31B, con el mismo propósito de roleplay oscuro. La comparación se limita a características generales:

| Modelo | Parámetros | Arquitectura | Cuantización | Licencia | Acceso |
|---|---|---|---|---|---|
| Heimdallr-27B-v0.35-W8A16-PTQ | 27,78B | Qwen3.5 (presumible) | W8A16 PTQ | Apache-2.0 | Gated |
| Heimdallr-v0.02-31B-GGUF | 31B | Gemma-4 | GGUF (varias) | Apache-2.0 | Abierto |

No se dispone de información sobre otros modelos comparables de la misma categoría (roleplay sin alineación) con datos verificables.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace; es necesario aceptar condiciones específicas antes de descargarlo, lo que puede limitar su uso en entornos automatizados.
- Contenido explícito y sin alineación: el modelo está diseñado para generar contenido adulto y NSFW, sin filtros de seguridad. No es adecuado para aplicaciones dirigidas a menores o entornos profesionales sin control de contenido.
- Riesgo de alucinación: al ser un modelo de roleplay, puede inventar hechos, personajes o eventos con alta fluidez, lo que requiere verificación en usos factuales.
- Sesgos desconocidos: no se documentan sesgos específicos, pero al estar entrenado en datos de ficción oscura, puede reflejar estereotipos de género, raza o cultura presentes en ese tipo de narrativas.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni los idiomas soportados; es probable que el rendimiento se degrade en idiomas distintos al inglés, aunque no se confirma.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el acceso gated implica condiciones adicionales que deben revisarse antes de su uso comercial.
- Falta de documentación técnica: no hay papers, informes de entrenamiento ni benchmarks publicados, lo que dificulta evaluar su calidad y comportamiento en producción.

## Enlaces

- Modelo cuantizado: https://huggingface.co/ReadyArt/Heimdallr-27B-v0.35-W8A16-PTQ
- Modelo base: https://huggingface.co/ReadyArt/Heimdallr-27B-v0.35
- Organización ReadyArt: https://huggingface.co/ReadyArt
- Variante GGUF (Heimdallr-v0.02-31B): https://huggingface.co/ReadyArt/Heimdallr-v0.02-31B-GGUF
